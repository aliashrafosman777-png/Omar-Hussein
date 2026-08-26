import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

const password = process.argv[2];
if (!password || password.length < 12) {
  console.error(
    'Usage: node scripts/setup-env.mjs "a password with at least 12 characters"'
  );
  process.exit(1);
}

const hash = await bcrypt.hash(password, 12);

const match = await bcrypt.compare(password, hash);
if (!match) {
  throw new Error("Unable to verify the generated password hash.");
}

// Write hash to a separate file (avoids dotenv $ interpolation issues)
const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

fs.writeFileSync(
  path.join(dataDir, "admin-hash.txt"),
  hash,
  "utf-8"
);
console.log("Password hash written to data/admin-hash.txt.");
console.log(
  "For deployments, set ADMIN_PASSWORD_HASH to the generated hash in your hosting environment."
);
