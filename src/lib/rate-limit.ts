// ============================================
// In-Memory Sliding Window Rate Limiter
// ============================================

interface RateLimitEntry {
  timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();

let lastCleanup = 0;

function cleanupExpiredEntries(now: number, windowMs: number): void {
  if (now - lastCleanup < 5 * 60 * 1000) return;

  for (const [key, entry] of store.entries()) {
    entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);
    if (entry.timestamps.length === 0) store.delete(key);
  }
  lastCleanup = now;
}

/**
 * Check if a request should be rate-limited.
 *
 * @param key     Unique identifier (e.g., IP address or IP + route)
 * @param limit   Maximum number of requests allowed in the window
 * @param windowMs Time window in milliseconds
 * @returns       { allowed: boolean, remaining: number, retryAfterMs?: number }
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): { allowed: boolean; remaining: number; retryAfterMs?: number } {
  const now = Date.now();
  cleanupExpiredEntries(now, windowMs);
  let entry = store.get(key);

  if (!entry) {
    entry = { timestamps: [] };
    store.set(key, entry);
  }

  // Remove timestamps outside the window
  entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);

  if (entry.timestamps.length >= limit) {
    const oldest = entry.timestamps[0];
    const retryAfterMs = windowMs - (now - oldest);
    return { allowed: false, remaining: 0, retryAfterMs };
  }

  entry.timestamps.push(now);
  return { allowed: true, remaining: limit - entry.timestamps.length };
}

/**
 * Get the client IP from a request.
 * Checks X-Forwarded-For header first (for proxied deployments), then falls back.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  // Fallback for development
  return "127.0.0.1";
}
