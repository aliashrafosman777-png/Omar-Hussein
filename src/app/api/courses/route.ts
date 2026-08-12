import { NextRequest, NextResponse } from "next/server";
import { insertCourseBooking } from "@/lib/db";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

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
        { status: 429 }
      );
    }

    const body = await request.json();

    // Honeypot check — reject silently if filled
    if (body._honey) {
      // Return fake success to not alert bots
      return NextResponse.json({
        success: true,
        message: "Thank you! Your booking request has been sent.",
      });
    }

    // Sanitize inputs
    const fullName = sanitize(body.fullName, 200);
    const email = sanitize(body.email, 320);
    const phone = sanitize(body.phone, 30);
    const course = sanitize(body.course, 200);
    const message = sanitize(body.message, 2000);

    // Validation
    const errors: string[] = [];
    if (!fullName) errors.push("Full name is required.");
    if (!email) {
      errors.push("Email is required.");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push("A valid email address is required.");
    }
    if (!course) errors.push("Please select a course.");

    if (errors.length > 0) {
      return NextResponse.json(
        { success: false, message: errors.join(" "), errors },
        { status: 400 }
      );
    }

    // Save to database
    insertCourseBooking({ fullName, email, phone, course, message });

    return NextResponse.json({
      success: true,
      message:
        "Thank you! Your booking request has been sent. We'll get back to you with course details soon.",
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

function sanitize(value: unknown, maxLen: number): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLen);
}
