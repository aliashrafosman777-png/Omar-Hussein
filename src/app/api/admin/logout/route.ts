import { NextResponse } from "next/server";
import { deleteSession } from "@/lib/session";

/**
 * Admin logout endpoint.
 * Deletes the session cookie.
 */
export async function POST() {
  try {
    await deleteSession();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
