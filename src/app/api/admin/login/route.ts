import { NextRequest, NextResponse } from "next/server";
import { verifyCredentials } from "@/lib/auth";
import { createSession } from "@/lib/session";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

/**
 * Admin login endpoint.
 * Rate-limited to prevent brute force attacks.
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 5 attempts per IP per 15 minutes
    const ip = getClientIp(request);
    const rl = checkRateLimit(`login:${ip}`, 5, 15 * 60 * 1000);
    if (!rl.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: "Too many login attempts. Please try again later.",
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required." },
        { status: 400 }
      );
    }

    const valid = await verifyCredentials(email, password);

    if (!valid) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials." },
        { status: 401 }
      );
    }

    // Create session
    await createSession(email);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
