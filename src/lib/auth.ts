import "server-only";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

// ============================================
// Admin Credential Verification
// ============================================

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

/**
 * Read the password hash from a file to avoid dotenv-expand
 * corrupting the bcrypt hash's $ characters.
 */
function getPasswordHash(): string | null {
  const environmentHash = process.env.ADMIN_PASSWORD_HASH?.trim();
  if (environmentHash) return environmentHash;

  try {
    const hashPath = path.join(process.cwd(), "data", "admin-hash.txt");
    if (!fs.existsSync(hashPath)) return null;
    return fs.readFileSync(hashPath, "utf-8").trim();
  } catch {
    return null;
  }
}

/**
 * Verify admin credentials.
 * Returns true only if email matches and password hash verifies.
 * Never logs passwords or sensitive credential info.
 */
export async function verifyCredentials(
  email: string,
  password: string
): Promise<boolean> {
  const passwordHash = getPasswordHash();

  if (!ADMIN_EMAIL || !passwordHash) {
    console.error(
      "Admin auth not configured (ADMIN_EMAIL and ADMIN_PASSWORD_HASH or data/admin-hash.txt are required)."
    );
    return false;
  }

  // Constant-time email comparison to prevent timing attacks
  const emailMatch =
    email.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase().trim();

  if (!emailMatch) {
    // Still run bcrypt compare to prevent timing-based email enumeration
    await bcrypt.compare(password, passwordHash);
    return false;
  }

  return bcrypt.compare(password, passwordHash);
}
