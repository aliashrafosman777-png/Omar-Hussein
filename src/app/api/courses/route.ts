import { NextRequest, NextResponse } from "next/server";
import { insertCourseBooking } from "@/lib/db";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { COURSES_CONTENT } from "@/lib/content";
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

const VALID_COURSES = new Set<string>(
  COURSES_CONTENT.courses.map((course) => course.title)
);

/**
 * Course booking form submission endpoint.
 * Validates, sanitizes, checks honeypot + rate limit, and saves to DB.
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 10 requests per IP per 15 minutes
    const ip = getClientIp(request);
    const rl = checkRateLimit(`courses:${ip}`, 10, 15 * 60 * 1000);
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
      // Return fake success to not alert bots
      return NextResponse.json({
        success: true,
        message: "Thank you! Your booking request has been sent.",
      });
    }

    // Sanitize inputs
    const fullName = sanitizeText(body.fullName, 200);
    const email = sanitizeText(body.email, 320);
    const phone = sanitizeText(body.phone, 30);
    const course = sanitizeText(body.course, 200);
    const message = sanitizeText(body.message, 2000);

    // Validation
    const errors: string[] = [];
    if (!fullName) errors.push("Full name is required.");
    if (!email) {
      errors.push("Email is required.");
    } else if (!isValidEmail(email)) {
      errors.push("A valid email address is required.");
    }
    if (!course) {
      errors.push("Please select a course.");
    } else if (!VALID_COURSES.has(course)) {
      errors.push("The selected course is not available.");
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { success: false, message: errors.join(" "), errors },
        { status: 400 }
      );
    }

    // Save to database
    let bookingReference = `fallback-${crypto.randomUUID()}`;
    let stored = false;
    try {
      const booking = await insertCourseBooking({
        fullName,
        email,
        phone,
        course,
        message,
      });
      bookingReference = String(booking.id);
      stored = true;
    } catch (error) {
      console.error(
        "Course booking storage is unavailable; attempting email delivery:",
        error instanceof Error ? error.message : "UnknownError",
        "| BLOB_READ_WRITE_TOKEN set:",
        Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim())
      );
    }

    let deliveryWarning = !stored;
    let adminNotificationDelivered = false;
    if (isEmailDeliveryEnabled()) {
      const safeName = escapeHtml(fullName);
      const safeEmail = escapeHtml(email);
      const safePhone = escapeHtml(phone);
      const safeCourse = escapeHtml(course);
      const safeMessage = escapeHtml(message).replace(/\n/g, "<br>");

      try {
        const settings = getEmailSettings();
        const results = await Promise.allSettled([
          sendEmail({
            to: settings.notificationTo,
            replyTo: email,
            idempotencyKey: `course-${bookingReference}-notification`,
            subject: `New Course Booking from ${fullName.replace(/[\r\n]/g, " ")}`,
            text: [
              "New Course Booking",
              `Name: ${fullName}`,
              `Email: ${email}`,
              phone ? `Phone: ${phone}` : "",
              `Course: ${course}`,
              message ? "" : "",
              message,
            ]
              .filter(Boolean)
              .join("\n"),
            html: `
              <h2>New Course Booking</h2>
              <p><strong>Name:</strong> ${safeName}</p>
              <p><strong>Email:</strong> ${safeEmail}</p>
              ${safePhone ? `<p><strong>Phone:</strong> ${safePhone}</p>` : ""}
              <p><strong>Course:</strong> ${safeCourse}</p>
              ${safeMessage ? `<p><strong>Message:</strong></p><p>${safeMessage}</p>` : ""}
            `,
          }),
          sendEmail({
            to: email,
            replyTo: settings.replyTo,
            idempotencyKey: `course-${bookingReference}-confirmation`,
            subject: "We received your course booking request",
            text: `Hello ${fullName},\n\nThank you for your interest in ${course}. Your booking request has been received, and Omar will reply with the course details as soon as possible.\n\nOmar Hussein Photography`,
            html: `<p>Hello ${safeName},</p><p>Thank you for your interest in <strong>${safeCourse}</strong>. Your booking request has been received, and Omar will reply with the course details as soon as possible.</p><p>Omar Hussein Photography</p>`,
          }),
        ]);
        adminNotificationDelivered = results[0]?.status === "fulfilled";
        deliveryWarning =
          deliveryWarning ||
          results.some((result) => result.status === "rejected");
        if (deliveryWarning) {
          console.error("One or more course booking emails could not be delivered.");
        }
      } catch (error) {
        deliveryWarning = true;
        console.error(
          "Course booking email delivery failed:",
          error instanceof Error ? error.name : "UnknownError"
        );
      }
    } else {
      console.info("Course booking saved; email delivery is disabled.");
    }

    if (!stored && !adminNotificationDelivered) {
      return NextResponse.json(
        {
          success: false,
          message: "Your booking request could not be delivered. Please try again.",
        },
        { status: 503 }
      );
    }

    return NextResponse.json({
      success: true,
      deliveryWarning: deliveryWarning || undefined,
      message: "Thank you! Your booking request has been received.",
    });
  } catch (error) {
    console.error("Course booking API error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred. Please try again.",
      },
      { status: 500 }
    );
  }
}
