import { NextRequest, NextResponse } from "next/server";
import { insertContactInquiry } from "@/lib/db";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { CONTACT_CONTENT } from "@/lib/content";
import {
  escapeHtml,
  isValidEmail,
  readJsonObject,
  sanitizeText,
} from "@/lib/request";
import {
  getEmailSettings,
  isEmailDeliveryEnabled,
  sendEmail,
} from "@/lib/email";

const VALID_SHOOT_TYPES = new Set<string>(CONTACT_CONTENT.shootTypes);
const VALID_BUDGET_RANGES = new Set<string>(CONTACT_CONTENT.budgetRanges);

/**
 * Contact form API route handler.
 * Validates server-side, saves to database, then sends email if configured.
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 10 requests per IP per 15 minutes
    const ip = getClientIp(request);
    const rl = checkRateLimit(`contact:${ip}`, 10, 15 * 60 * 1000);
    if (!rl.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: "Too many requests. Please try again later.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil((rl.retryAfterMs ?? 0) / 1000)),
          },
        }
      );
    }

    const body = await readJsonObject(request);
    if (!body) {
      return NextResponse.json(
        { success: false, message: "A valid JSON request body is required." },
        { status: 400 }
      );
    }

    // Honeypot check — reject silently if filled
    if (body._honey) {
      return NextResponse.json({
        success: true,
        message:
          "Thank you! Your inquiry has been sent. I will get back to you soon.",
      });
    }

    // Sanitize inputs
    const name = sanitizeText(body.name, 200);
    const email = sanitizeText(body.email, 320);
    const phone = sanitizeText(body.phone, 30);
    const shootType = sanitizeText(body.shootType, 200);
    const preferredDate = sanitizeText(body.preferredDate, 20);
    const budgetRange = sanitizeText(body.budgetRange, 100);
    const message = sanitizeText(body.message, 5000);

    // Server-side validation
    const errors: string[] = [];
    if (!name) {
      errors.push("Name is required.");
    }
    if (!email) {
      errors.push("Email is required.");
    } else if (!isValidEmail(email)) {
      errors.push("A valid email address is required.");
    }
    if (!message) {
      errors.push("Message is required.");
    }
    if (body.consent !== true) {
      errors.push("Consent is required.");
    }
    if (shootType && !VALID_SHOOT_TYPES.has(shootType)) {
      errors.push("The selected shoot type is not available.");
    }
    if (budgetRange && !VALID_BUDGET_RANGES.has(budgetRange)) {
      errors.push("The selected budget range is not available.");
    }
    if (preferredDate && !isValidDateInput(preferredDate)) {
      errors.push("A valid preferred date is required.");
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { success: false, message: errors.join(" "), errors },
        { status: 400 }
      );
    }

    // Save to database
    let inquiryReference = `fallback-${crypto.randomUUID()}`;
    let stored = false;
    try {
      const inquiry = insertContactInquiry({
        name,
        email,
        phone,
        shootType,
        preferredDate,
        budgetRange,
        message,
      });
      inquiryReference = String(inquiry.id);
      stored = true;
    } catch (error) {
      console.error(
        "Contact storage is unavailable; attempting email delivery:",
        error instanceof Error ? error.name : "UnknownError"
      );
    }

    let deliveryWarning = !stored;
    let adminNotificationDelivered = false;
    if (isEmailDeliveryEnabled()) {
      const safeName = escapeHtml(name);
      const safeEmail = escapeHtml(email);
      const safePhone = escapeHtml(phone);
      const safeShootType = escapeHtml(shootType);
      const safePreferredDate = escapeHtml(preferredDate);
      const safeBudgetRange = escapeHtml(budgetRange);
      const safeMessage = escapeHtml(message).replace(/\n/g, "<br>");

      try {
        const settings = getEmailSettings();
        const results = await Promise.allSettled([
          sendEmail({
            to: settings.notificationTo,
            replyTo: email,
            idempotencyKey: `contact-${inquiryReference}-notification`,
            subject: `New Inquiry from ${name.replace(/[\r\n]/g, " ")}`,
            text: [
              "New Photography Inquiry",
              `Name: ${name}`,
              `Email: ${email}`,
              phone ? `Phone: ${phone}` : "",
              shootType ? `Shoot Type: ${shootType}` : "",
              preferredDate ? `Preferred Date: ${preferredDate}` : "",
              budgetRange ? `Budget Range: ${budgetRange}` : "",
              "",
              message,
            ]
              .filter(Boolean)
              .join("\n"),
            html: `
            <h2>New Photography Inquiry</h2>
            <p><strong>Name:</strong> ${safeName}</p>
            <p><strong>Email:</strong> ${safeEmail}</p>
            ${safePhone ? `<p><strong>Phone:</strong> ${safePhone}</p>` : ""}
            ${safeShootType ? `<p><strong>Shoot Type:</strong> ${safeShootType}</p>` : ""}
            ${safePreferredDate ? `<p><strong>Preferred Date:</strong> ${safePreferredDate}</p>` : ""}
            ${safeBudgetRange ? `<p><strong>Budget Range:</strong> ${safeBudgetRange}</p>` : ""}
            <p><strong>Message:</strong></p>
            <p>${safeMessage}</p>
          `,
          }),
          sendEmail({
            to: email,
            replyTo: settings.replyTo,
            idempotencyKey: `contact-${inquiryReference}-confirmation`,
            subject: "We received your photography inquiry",
            text: `Hello ${name},\n\nThank you for getting in touch. Your photography inquiry has been received, and Omar will reply as soon as possible.\n\nOmar Hussein Photography`,
            html: `<p>Hello ${safeName},</p><p>Thank you for getting in touch. Your photography inquiry has been received, and Omar will reply as soon as possible.</p><p>Omar Hussein Photography</p>`,
          }),
        ]);
        adminNotificationDelivered = results[0]?.status === "fulfilled";
        deliveryWarning =
          deliveryWarning ||
          results.some((result) => result.status === "rejected");
        if (deliveryWarning) {
          console.error("One or more contact emails could not be delivered.");
        }
      } catch (error) {
        deliveryWarning = true;
        console.error(
          "Contact email delivery failed:",
          error instanceof Error ? error.name : "UnknownError"
        );
      }
    } else {
      console.info("Contact submission saved; email delivery is disabled.");
    }

    if (!stored && !adminNotificationDelivered) {
      return NextResponse.json(
        {
          success: false,
          message: "Your inquiry could not be delivered. Please try again.",
        },
        { status: 503 }
      );
    }

    return NextResponse.json({
      success: true,
      deliveryWarning: deliveryWarning || undefined,
      message:
        "Thank you! Your inquiry has been received. I will get back to you soon.",
    });
  } catch (error) {
    console.error("Contact API error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred. Please try again.",
      },
      { status: 500 }
    );
  }
}

function isValidDateInput(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}
