import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/session";
import { getWorkItemById, updateWorkItem, deleteWorkItem } from "@/lib/db";
import { WORK_CATEGORIES } from "@/lib/db-schema";
import type { WorkCategory } from "@/lib/db-schema";
import sharp from "sharp";
import fs from "fs";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "media", "work", "uploads");
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 30 * 1024 * 1024; // 30MB

function parseWorkId(value: string): number | null {
  if (!/^\d+$/.test(value)) return null;
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

function ensureUploadDir(): void {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
}

/**
 * GET /api/admin/work/[id]
 * Get a single work item.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const { id: idStr } = await params;
  const id = parseWorkId(idStr);
  if (id === null) {
    return NextResponse.json(
      { success: false, message: "Invalid ID." },
      { status: 400 }
    );
  }

  const item = getWorkItemById(id);
  if (!item) {
    return NextResponse.json(
      { success: false, message: "Work item not found." },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, item });
}

/**
 * PATCH /api/admin/work/[id]
 * Update a work item. Accepts multipart form-data (new image optional).
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await verifySession();
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id: idStr } = await params;
    const id = parseWorkId(idStr);
    if (id === null) {
      return NextResponse.json(
        { success: false, message: "Invalid ID." },
        { status: 400 }
      );
    }

    const existing = getWorkItemById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Work item not found." },
        { status: 404 }
      );
    }

    const formData = await request.formData();
    const updates: Record<string, unknown> = {};

    // Category
    const category = formData.get("category") as string | null;
    if (category) {
      if (!WORK_CATEGORIES.includes(category as WorkCategory)) {
        return NextResponse.json(
          { success: false, message: "Invalid category." },
          { status: 400 }
        );
      }
      updates.category = category;
    }

    // Text fields
    const title = formData.get("title") as string | null;
    if (title !== null) updates.title = title.trim();

    const altText = formData.get("altText") as string | null;
    if (altText !== null) updates.altText = altText.trim();

    const displayOrder = formData.get("displayOrder") as string | null;
    if (displayOrder !== null) updates.displayOrder = Number(displayOrder) || 0;

    const isPublished = formData.get("isPublished") as string | null;
    if (isPublished !== null) updates.isPublished = isPublished !== "false";

    // Optional new image
    const imageFile = formData.get("image") as File | null;
    if (imageFile && imageFile instanceof File && imageFile.size > 0) {
      if (!ALLOWED_TYPES.includes(imageFile.type)) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Invalid file type. Only JPEG, PNG, and WebP are accepted.",
          },
          { status: 400 }
        );
      }

      if (imageFile.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { success: false, message: "Image must be under 30MB." },
          { status: 400 }
        );
      }

      ensureUploadDir();
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const slug = `work-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

      // Card thumbnail
      const cardPath = path.join(UPLOAD_DIR, `${slug}-card.webp`);
      await sharp(buffer)
        .resize({ height: 800, fit: "inside", withoutEnlargement: true })
        .webp({ quality: 85 })
        .toFile(cardPath);

      // Full resolution
      const fullPath = path.join(UPLOAD_DIR, `${slug}-full.webp`);
      await sharp(buffer)
        .resize({ height: 2000, fit: "inside", withoutEnlargement: true })
        .webp({ quality: 88 })
        .toFile(fullPath);

      // Blur placeholder
      const placeholderBuffer = await sharp(buffer)
        .resize({ width: 20, fit: "inside" })
        .webp({ quality: 40 })
        .toBuffer();
      const blurDataURL = `data:image/webp;base64,${placeholderBuffer.toString("base64")}`;

      const cardMeta = await sharp(cardPath).metadata();

      updates.imageUrl = `/media/work/uploads/${slug}-card.webp`;
      updates.fullImageUrl = `/media/work/uploads/${slug}-full.webp`;
      updates.blurDataURL = blurDataURL;
      updates.cardWidth = cardMeta.width;
      updates.cardHeight = cardMeta.height;

      // Delete old uploaded files (only if they're in the uploads folder)
      tryDeleteOldFiles(existing.imageUrl, existing.fullImageUrl);
    }

    const updated = updateWorkItem(id, updates);
    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Unable to update work item." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, item: updated });
  } catch (error) {
    console.error("Admin work update API error:", error);
    return NextResponse.json(
      { success: false, message: "Unable to update work item." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/work/[id]
 * Delete a work item and its associated image files.
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await verifySession();
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id: idStr } = await params;
    const id = parseWorkId(idStr);
    if (id === null) {
      return NextResponse.json(
        { success: false, message: "Invalid ID." },
        { status: 400 }
      );
    }

    const existing = getWorkItemById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Work item not found." },
        { status: 404 }
      );
    }

    const deleted = deleteWorkItem(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Unable to delete work item." },
        { status: 500 }
      );
    }

    // Delete associated image files (only uploaded ones)
    tryDeleteOldFiles(existing.imageUrl, existing.fullImageUrl);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin work delete API error:", error);
    return NextResponse.json(
      { success: false, message: "Unable to delete work item." },
      { status: 500 }
    );
  }
}

/**
 * Safely delete old uploaded image files.
 * Only deletes files in the /uploads/ directory to avoid removing seeded images.
 */
function tryDeleteOldFiles(imageUrl: string, fullImageUrl: string): void {
  const publicDir = path.join(process.cwd(), "public");
  for (const url of [imageUrl, fullImageUrl]) {
    if (url && url.includes("/uploads/")) {
      const filePath = path.join(publicDir, url);
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch {
        // Silently ignore deletion errors
      }
    }
  }
}
