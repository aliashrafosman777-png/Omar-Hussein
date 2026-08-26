#!/usr/bin/env node

/**
 * Image Optimization Script
 *
 * Copies and optimizes portfolio images from media/ to public/media/work/
 * Generates:
 *   - Card thumbnails (800px wide, WebP, quality 85)
 *   - Lightbox images (2000px wide, WebP, quality 88)
 *   - Tiny blur placeholders (20px wide, WebP, quality 40)
 */

import sharp from "sharp";
import { promises as fs } from "fs";
import path from "path";

const MEDIA_DIR = "D:\\omar.h.p\\media";
const OUTPUT_DIR = "D:\\omar.h.p\\public\\media\\work";

// New portfolio images to process
const NEW_IMAGES = [
  { source: "_973279 copy.jpg", slug: "973279" },
  { source: "_1515402 copy.jpg", slug: "1515402" },
  { source: "1.jpg", slug: "portrait-1" },
  { source: "2.jpg", slug: "portrait-2" },
  { source: "031A0290 copy.jpg", slug: "031A0290" },
  { source: "031A1048.jpg", slug: "031A1048" },
  { source: "031A8128.jpg", slug: "031A8128" },
  { source: "031A8445 1.jpg", slug: "031A8445" },
  { source: "031A9444.jpg", slug: "031A9444" },
  { source: "DSC00154 copy.jpg", slug: "DSC00154" },
  { source: "DSC05041 copy 2.jpg", slug: "DSC05041" },
  { source: "DSC05920 copy.jpg", slug: "DSC05920" },
  { source: "DSC07480.jpg", slug: "DSC07480" },
  { source: "DSC09350.jpg", slug: "DSC09350" },
];

// Also optimize existing images
const EXISTING_IMAGES = [
  { source: "1Portraits.jpeg", slug: "1Portraits" },
  { source: "1.1Portraits.jpeg", slug: "1.1Portraits" },
  { source: "2Portraits.jpeg", slug: "2Portraits" },
  { source: "2.1Portraits.jpeg", slug: "2.1Portraits" },
  { source: "2.2Portraits.jpeg", slug: "2.2Portraits" },
  { source: "3Portraits.jpeg", slug: "3Portraits" },
  { source: "3.1Portraits.jpeg", slug: "3.1Portraits" },
];

const ALL_IMAGES = [...EXISTING_IMAGES, ...NEW_IMAGES];

async function processImage(img) {
  const srcPath = path.join(MEDIA_DIR, img.source);

  try {
    await fs.access(srcPath);
  } catch {
    console.error(`  ✗ Source not found: ${img.source}`);
    return null;
  }

  const metadata = await sharp(srcPath).metadata();
  const w = metadata.width;
  const h = metadata.height;
  const orientation = h > w ? "portrait" : "landscape";

  // Card thumbnail: 800px on longest side
  const cardWidth = orientation === "portrait" ? undefined : 800;
  const cardHeight = orientation === "portrait" ? 800 : undefined;

  await sharp(srcPath)
    .resize({ width: cardWidth, height: cardHeight, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 85 })
    .toFile(path.join(OUTPUT_DIR, `${img.slug}-card.webp`));

  // Lightbox: 2000px on longest side
  const lbWidth = orientation === "portrait" ? undefined : 2000;
  const lbHeight = orientation === "portrait" ? 2000 : undefined;

  await sharp(srcPath)
    .resize({ width: lbWidth, height: lbHeight, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 88 })
    .toFile(path.join(OUTPUT_DIR, `${img.slug}-full.webp`));

  // Blur placeholder: tiny 20px
  const placeholderBuffer = await sharp(srcPath)
    .resize({ width: 20, fit: "inside" })
    .webp({ quality: 40 })
    .toBuffer();
  const blurDataURL = `data:image/webp;base64,${placeholderBuffer.toString("base64")}`;

  // Calculate actual card dimensions for aspect ratio
  const cardMeta = await sharp(path.join(OUTPUT_DIR, `${img.slug}-card.webp`)).metadata();

  console.log(`  ✓ ${img.slug} (${cardMeta.width}×${cardMeta.height}, ${orientation})`);

  return {
    slug: img.slug,
    cardWidth: cardMeta.width,
    cardHeight: cardMeta.height,
    orientation,
    blurDataURL,
  };
}

async function main() {
  // Ensure output directory exists
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  console.log("Processing images...\n");

  const results = [];
  for (const img of ALL_IMAGES) {
    const result = await processImage(img);
    if (result) results.push(result);
  }

  console.log(`\nDone! Processed ${results.length} images.`);

  // Output metadata JSON for use in projects.ts
  const metadataPath = path.join(OUTPUT_DIR, "_image-metadata.json");
  await fs.writeFile(metadataPath, JSON.stringify(results, null, 2));
  console.log(`Metadata saved to ${metadataPath}`);
}

main().catch(console.error);
