import "server-only";

import fs from "fs";
import path from "path";
import { del, put } from "@vercel/blob";
import sharp from "sharp";

const LOCAL_UPLOAD_DIR = path.join(
  process.cwd(),
  "public",
  "media",
  "work",
  "uploads"
);

export interface StoredWorkImage {
  imageUrl: string;
  fullImageUrl: string;
  blurDataURL: string;
  cardWidth?: number;
  cardHeight?: number;
  cardBlobPath?: string;
  fullBlobPath?: string;
}

function hasBlobStorage(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim());
}

function proxyUrl(pathname: string): string {
  return `/api/work-image?path=${encodeURIComponent(pathname)}`;
}

export async function storeWorkImage(
  source: Buffer,
  slug: string
): Promise<StoredWorkImage> {
  const cardBuffer = await sharp(source)
    .resize({ height: 800, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 85 })
    .toBuffer();
  const fullBuffer = await sharp(source)
    .resize({ height: 2000, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 88 })
    .toBuffer();
  const placeholderBuffer = await sharp(source)
    .resize({ width: 20, fit: "inside" })
    .webp({ quality: 40 })
    .toBuffer();
  const cardMeta = await sharp(cardBuffer).metadata();
  const blurDataURL = `data:image/webp;base64,${placeholderBuffer.toString("base64")}`;

  if (hasBlobStorage()) {
    const [cardBlob, fullBlob] = await Promise.all([
      put(`work/${slug}-card.webp`, cardBuffer, {
        access: "private",
        addRandomSuffix: true,
        contentType: "image/webp",
      }),
      put(`work/${slug}-full.webp`, fullBuffer, {
        access: "private",
        addRandomSuffix: true,
        contentType: "image/webp",
      }),
    ]);

    return {
      imageUrl: proxyUrl(cardBlob.pathname),
      fullImageUrl: proxyUrl(fullBlob.pathname),
      blurDataURL,
      cardWidth: cardMeta.width,
      cardHeight: cardMeta.height,
      cardBlobPath: cardBlob.pathname,
      fullBlobPath: fullBlob.pathname,
    };
  }

  fs.mkdirSync(LOCAL_UPLOAD_DIR, { recursive: true });
  const cardFilename = `${slug}-card.webp`;
  const fullFilename = `${slug}-full.webp`;
  fs.writeFileSync(path.join(LOCAL_UPLOAD_DIR, cardFilename), cardBuffer);
  fs.writeFileSync(path.join(LOCAL_UPLOAD_DIR, fullFilename), fullBuffer);

  return {
    imageUrl: `/media/work/uploads/${cardFilename}`,
    fullImageUrl: `/media/work/uploads/${fullFilename}`,
    blurDataURL,
    cardWidth: cardMeta.width,
    cardHeight: cardMeta.height,
  };
}

export async function deleteWorkImages(input: {
  imageUrl: string;
  fullImageUrl: string;
  cardBlobPath?: string;
  fullBlobPath?: string;
}): Promise<void> {
  const blobPaths = [input.cardBlobPath, input.fullBlobPath].filter(
    (value): value is string => Boolean(value)
  );
  if (hasBlobStorage() && blobPaths.length > 0) {
    await del(blobPaths);
    return;
  }

  const publicDir = path.join(process.cwd(), "public");
  for (const url of [input.imageUrl, input.fullImageUrl]) {
    if (!url.startsWith("/media/work/uploads/")) continue;
    const filePath = path.resolve(publicDir, `.${url}`);
    if (!filePath.startsWith(path.resolve(LOCAL_UPLOAD_DIR))) continue;
    try {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    } catch {
      // Database changes should not fail when an obsolete image is unavailable.
    }
  }
}
