/**
 * Shared request parsing and validation helpers for route handlers.
 */

export type JsonObject = Record<string, unknown>;

export async function readJsonObject(
  request: Request
): Promise<JsonObject | null> {
  try {
    const body: unknown = await request.json();
    return isJsonObject(body) ? body : null;
  } catch {
    return null;
  }
}

export function sanitizeText(value: unknown, maxLength: number): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function escapeHtml(value: string): string {
  return value.replace(
    /[&<>'"]/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;",
      })[character] ?? character
  );
}

function isJsonObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
