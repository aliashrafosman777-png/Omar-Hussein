import { NextRequest, NextResponse } from "next/server";
import { insertContactInquiry } from "@/lib/db";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

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
        { status: 429 }
      );
    }

    const body = await request.json();

    // Honeypot check — reject silently if filled
    if (body._honey) {
      return NextResponse.json({
        success: true,
        message:
          "Thank you! Your inquiry has been sent. I will get back to you soon.",
      });
    }

    // Sanitize inputs
    const name = sanitize(body.name, 200);
    const email = sanitize(body.email, 320);
    const phone = sanitize(body.phone, 30);
    const shootType = sanitize(body.shootType, 200);
    const preferredDate = sanitize(body.preferredDate, 20);
    const budgetRange = sanitize(body.budgetRange, 100);
    const message = sanitize(body.message, 5000);

    // Server-side validation
    const errors: string[] = [];
    if (!name) {
      errors.push("Name is required.");
    }
    if (!email) {
      errors.push("Email is required.");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push("A valid email address is required.");
    }
    if (!message) {
      errors.push("Message is required.");
    }
    if (!body.consent) {
      errors.push("Consent is required.");
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { success: false, message: errors.join(" "), errors },
        { status: 400 }
      );
    }

    // Save to database
    insertContactInquiry({
      name,
      email,
      phone,
      shootType,
      preferredDate,
      budgetRange,
      message,
    });

    // Check if email provider is configured
    const emailProvider = process.env.CONTACT_EMAIL_PROVIDER;
    const resendApiKey = process.env.RESEND_API_KEY;
    const contactTo = process.env.CONTACT_TO_EMAIL;

    if (!emailProvider || !resendApiKey) {
      // Development mode — no email provider configured
      console.log("📧 [Dev Mode] Contact form submission saved to database.");

      return NextResponse.json({
        success: true,
        dev: true,
        message:
          "Thank you! Your inquiry has been received. I will get back to you soon.",
      });
    }

    // Send email via Resend (or other provider)
    if (emailProvider === "resend") {
      const resendResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Omar Hussein Photography <noreply@omarhussein.photography>",
          to: [contactTo || "hello@omarhussein.photography"],
          subject: `New Inquiry from ${name}`,
          html: `
            <h2>New Photography Inquiry</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ""}
            ${shootType ? `<p><strong>Shoot Type:</strong> ${shootType}</p>` : ""}
            ${preferredDate ? `<p><strong>Preferred Date:</strong> ${preferredDate}</p>` : ""}
            ${budgetRange ? `<p><strong>Budget Range:</strong> ${budgetRange}</p>` : ""}
            <p><strong>Message:</strong></p>
            <p>${message.replace(/\n/g, "<br>")}</p>
          `,
        }),
      });

      if (!resendResponse.ok) {
        console.error("Resend API error:", await resendResponse.text());
        return NextResponse.json(
          {
            success: false,
            message: "Failed to send your inquiry. Please try again later.",
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message:
        "Thank you! Your inquiry has been sent. I will get back to you soon.",
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

function sanitize(value: unknown, maxLen: number): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLen);
}
