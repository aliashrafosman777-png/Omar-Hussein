import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

const password = "InspireH0use2026!";
const hash = await bcrypt.hash(password, 12);

// Verify it works
const match = await bcrypt.compare(password, hash);
console.log("Hash generated:", hash);
console.log("Verification:", match);

// Write hash to a separate file (avoids dotenv $ interpolation issues)
const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

fs.writeFileSync(
  path.join(dataDir, "admin-hash.txt"),
  hash,
  "utf-8"
);
console.log("\n✅ Hash written to data/admin-hash.txt");

// Update .env.local WITHOUT the hash (remove ADMIN_PASSWORD_HASH)
const envContent = `# Omar Hussein Photography — Local Environment Variables
# DO NOT COMMIT THIS FILE

# Contact Form Email Provider
CONTACT_EMAIL_PROVIDER=
RESEND_API_KEY=
CONTACT_TO_EMAIL=hello@omarhussein.photography

# Admin Authentication
ADMIN_EMAIL=admin@OmarHussein.com
SESSION_SECRET=774owSXGm9RWZzWgvunVjTTI9nvo7PfaiV90krz+iW4=
`;

fs.writeFileSync(".env.local", envContent, "utf-8");
console.log("✅ .env.local updated (hash stored separately in data/admin-hash.txt)");
