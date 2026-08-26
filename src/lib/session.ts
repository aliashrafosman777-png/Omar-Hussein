import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

// ============================================
// Session Management — JWT in HttpOnly Cookie
// ============================================

const SESSION_SECRET = process.env.SESSION_SECRET;
const COOKIE_NAME = "admin_session";
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

function getEncodedKey(): Uint8Array {
  if (!SESSION_SECRET) {
    throw new Error("SESSION_SECRET environment variable is not set.");
  }
  if (SESSION_SECRET.length < 32) {
    throw new Error("SESSION_SECRET must be at least 32 characters long.");
  }
  return new TextEncoder().encode(SESSION_SECRET);
}

export interface SessionPayload {
  email: string;
  expiresAt: string; // ISO date
}

/**
 * Create an encrypted JWT from the payload.
 */
export async function encrypt(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(new Date(payload.expiresAt))
    .sign(getEncodedKey());
}

/**
 * Decrypt and verify a JWT. Returns null on any error.
 */
export async function decrypt(
  token: string | undefined
): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getEncodedKey(), {
      algorithms: ["HS256"],
    });
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

/**
 * Create a new admin session and set the cookie.
 */
export async function createSession(email: string): Promise<void> {
  const expiresAt = new Date(Date.now() + SESSION_DURATION);
  const session = await encrypt({
    email,
    expiresAt: expiresAt.toISOString(),
  });

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });
}

/**
 * Delete the session cookie (logout).
 */
export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/**
 * Verify the current session from cookies.
 * Returns the session payload if valid, or null if invalid/expired.
 */
export async function verifySession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = await decrypt(token);
  if (!payload) return null;

  // Check expiration
  if (new Date(payload.expiresAt) < new Date()) {
    return null;
  }

  return payload;
}
