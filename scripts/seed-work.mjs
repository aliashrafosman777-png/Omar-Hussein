#!/usr/bin/env node

/**
 * Seed Work Items Script
 *
 * Processes images from the media category folders and creates work items
 * in the database. Idempotent — skips already-imported images.
 *
 * Usage: node scripts/seed-work.mjs
 */

import sharp from "sharp";
import { promises as fs } from "fs";
import path from "path";

const PROJECT_ROOT = path.resolve(import.meta.dirname, "..");
const MEDIA_DIR = path.join(PROJECT_ROOT, "media");
const OUTPUT_DIR = path.join(PROJECT_ROOT, "public", "media", "work", "uploads");
const DB_FILE = path.join(PROJECT_ROOT, "data", "submissions.json");

// Folder → Category mapping
const FOLDER_MAP = [
  { folder: "Artistic", category: "ARTISTIC" },
  { folder: "Bridel", category: "BRIDAL" },     // Bridel → BRIDAL
  { folder: "Fashion", category: "FASHION" },
  { folder: "Products", category: "PRODUCTS" },
];

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".tiff", ".bmp"]);

// ============================================
// Database helpers (standalone, no "server-only")
// ============================================

function readDb() {
  const dataDir = path.join(PROJECT_ROOT, "data");
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true });
  }

  if (!existsSync(DB_FILE)) {
    const initial = {
      courseBookings: [],
      contactInquiries: [],
      nextCourseId: 1,
      nextContactId: 1,
      workItems: [],
      nextWorkId: 1,
    };
    writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), "utf-8");
    return initial;
  }

  const raw = readFileSync(DB_FILE, "utf-8");
  const parsed = JSON.parse(raw);

  // Ensure workItems field exists
  if (!Array.isArray(parsed.workItems)) {
    parsed.workItems = [];
    parsed.nextWorkId = 1;
  }
  if (typeof parsed.nextWorkId !== "number") {
    parsed.nextWorkId = 1;
  }

  return parsed;
}

function writeDb(data) {
  const tmpFile = `${DB_FILE}.tmp`;
  writeFileSync(tmpFile, JSON.stringify(data, null, 2), "utf-8");
  renameSync(tmpFile, DB_FILE);
}

// Use synchronous fs for the seed script
import { existsSync, mkdirSync, writeFileSync, readFileSync, renameSync } from "fs";

// ============================================
// Image Processing
// ============================================

async function processImage(srcPath, slug) {
  // Card thumbnail: 800px on longest side
  const metadata = await sharp(srcPath).metadata();
  const h = metadata.height || 800;
  const w = metadata.width || 600;
  const orientation = h > w ? "portrait" : "landscape";

  const cardWidth = orientation === "portrait" ? undefined : 800;
  const cardHeight = orientation === "portrait" ? 800 : undefined;

  const cardPath = path.join(OUTPUT_DIR, `${slug}-card.webp`);
  await sharp(srcPath)
    .resize({ width: cardWidth, height: cardHeight, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 85 })
    .toFile(cardPath);

  // Full resolution: 2000px on longest side
  const lbWidth = orientation === "portrait" ? undefined : 2000;
  const lbHeight = orientation === "portrait" ? 2000 : undefined;

  const fullPath = path.join(OUTPUT_DIR, `${slug}-full.webp`);
  await sharp(srcPath)
    .resize({ width: lbWidth, height: lbHeight, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 88 })
    .toFile(fullPath);

  // Blur placeholder
  const placeholderBuffer = await sharp(srcPath)
    .resize({ width: 20, fit: "inside" })
    .webp({ quality: 40 })
    .toBuffer();
  const blurDataURL = `data:image/webp;base64,${placeholderBuffer.toString("base64")}`;

  // Get card dimensions
  const cardMeta = await sharp(cardPath).metadata();

  return {
    imageUrl: `/media/work/uploads/${slug}-card.webp`,
    fullImageUrl: `/media/work/uploads/${slug}-full.webp`,
    blurDataURL,
    cardWidth: cardMeta.width,
    cardHeight: cardMeta.height,
  };
}

// ============================================
// Title Generator
// ============================================

function generateTitle(filename, category) {
  // Remove extension
  let name = path.parse(filename).name;
  // Remove "copy", numbers, underscores etc. and clean up
  name = name
    .replace(/\bcopy\b/gi, "")
    .replace(/_/g, " ")
    .replace(/\d+/g, " ")
    .replace(/\./g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!name || name.length < 2) {
    const labels = {
      ARTISTIC: "Artistic Shot",
      BRIDAL: "Bridal Portrait",
      FASHION: "Fashion Editorial",
      PRODUCTS: "Product Shot",
    };
    return labels[category] || "Untitled";
  }

  return `${category.charAt(0) + category.slice(1).toLowerCase()} — ${name}`;
}

// ============================================
// Main
// ============================================

async function main() {
  console.log("🎨 Seeding Work Items from media folders...\n");

  // Ensure output directory
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  const db = readDb();
  const existingSourceFiles = new Set(
    db.workItems
      .filter((w) => w.sourceFile)
      .map((w) => w.sourceFile)
  );

  let imported = 0;
  let skipped = 0;
  let orderCounter = db.workItems.length;

  for (const { folder, category } of FOLDER_MAP) {
    const folderPath = path.join(MEDIA_DIR, folder);

    try {
      await fs.access(folderPath);
    } catch {
      console.log(`  ⚠ Folder not found: media/${folder} — skipping`);
      continue;
    }

    const files = await fs.readdir(folderPath);
    const imageFiles = files.filter((f) =>
      IMAGE_EXTENSIONS.has(path.extname(f).toLowerCase())
    );

    if (imageFiles.length === 0) {
      console.log(`  ⚠ No images in media/${folder}`);
      continue;
    }

    console.log(`📁 ${folder} → ${category} (${imageFiles.length} images)`);

    for (const filename of imageFiles) {
      const sourceKey = `${folder}/${filename}`;

      // Idempotency check
      if (existingSourceFiles.has(sourceKey)) {
        console.log(`  ⏭ Already imported: ${filename}`);
        skipped++;
        continue;
      }

      const srcPath = path.join(folderPath, filename);
      const slug = `seed-${category.toLowerCase()}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

      try {
        const result = await processImage(srcPath, slug);
        orderCounter++;

        const item = {
          id: db.nextWorkId++,
          title: generateTitle(filename, category),
          imageUrl: result.imageUrl,
          fullImageUrl: result.fullImageUrl,
          category,
          altText: `${category.charAt(0) + category.slice(1).toLowerCase()} photography by Omar Hussein`,
          displayOrder: orderCounter,
          isPublished: true,
          blurDataURL: result.blurDataURL,
          cardWidth: result.cardWidth,
          cardHeight: result.cardHeight,
          sourceFile: sourceKey,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        db.workItems.push(item);
        existingSourceFiles.add(sourceKey);
        imported++;

        console.log(`  ✓ ${filename} → ${category} (${result.cardWidth}×${result.cardHeight})`);
      } catch (err) {
        console.error(`  ✗ Failed: ${filename} — ${err.message}`);
      }
    }
  }

  // Save database
  writeDb(db);

  console.log(`\n✅ Done! Imported: ${imported}, Skipped: ${skipped}, Total: ${db.workItems.length}`);
}

main().catch(console.error);
