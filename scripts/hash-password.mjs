#!/usr/bin/env node

/**
 * Password Hash Generator
 * 
 * Generates a bcrypt hash for the admin password.
 * Usage: node scripts/hash-password.mjs "your-password"
 * 
 * Copy the output into your .env.local as ADMIN_PASSWORD_HASH=...
 */

import bcrypt from "bcryptjs";

const password = process.argv[2];

if (!password) {
  console.error("Usage: node scripts/hash-password.mjs \"your-password\"");
  console.error("  Generates a bcrypt hash to use as ADMIN_PASSWORD_HASH in .env.local");
  process.exit(1);
}

const hash = await bcrypt.hash(password, 12);
console.log("\n✅ Password hash generated successfully!\n");
console.log("Add this to your .env.local:\n");
console.log(`ADMIN_PASSWORD_HASH=${hash}`);
console.log("");
