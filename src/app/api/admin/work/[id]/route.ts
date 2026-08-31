import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/session";
import { getWorkItemById, updateWorkItem, deleteWorkItem } from "@/lib/db";
import { WORK_CATEGORIES } from "@/lib/db-schema";
import type { WorkCategory, WorkItem } from "@/lib/db-schema";
import { deleteWorkImages, storeWorkImage } from "@/lib/work-images";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 30 * 1024 * 1024; // 30MB

function parseWorkId(value: string): number | null {
  if (!/^\d+$/.test(value)) return null;
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
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

  const item = await getWorkItemById(id);
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

    const existing = await getWorkItemById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Work item not found." },
        { status: 404 }
      );
    }

    const formData = await request.formData();
    const updates: Partial<Omit<WorkItem, "id" | "createdAt">> = {};

    // Category
    const category = formData.get("category") as string | null;
    if (category) {
      if (!WORK_CATEGORIES.includes(category as WorkCategory)) {
        return NextResponse.json(
          { success: false, message: "Invalid category." },
          { status: 400 }
        );
      }
      updates.category = category as WorkCategory;
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

      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const slug = `work-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const storedImage = await storeWorkImage(buffer, slug);
      updates.imageUrl = storedImage.imageUrl;
      updates.fullImageUrl = storedImage.fullImageUrl;
      updates.blurDataURL = storedImage.blurDataURL;
      updates.cardWidth = storedImage.cardWidth;
      updates.cardHeight = storedImage.cardHeight;
      updates.cardBlobPath = storedImage.cardBlobPath;
      updates.fullBlobPath = storedImage.fullBlobPath;
    }

    const updated = await updateWorkItem(id, updates);
    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Unable to update work item." },
        { status: 500 }
      );
    }

    if (imageFile && imageFile instanceof File && imageFile.size > 0) {
      await deleteWorkImages(existing).catch((error) => {
        console.error(
          "Old work image cleanup failed:",
          error instanceof Error ? error.name : "UnknownError"
        );
      });
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

    const existing = await getWorkItemById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Work item not found." },
        { status: 404 }
      );
    }

    const deleted = await deleteWorkItem(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Unable to delete work item." },
        { status: 500 }
      );
    }

    await deleteWorkImages(existing).catch((error) => {
      console.error(
        "Work image cleanup failed:",
        error instanceof Error ? error.name : "UnknownError"
      );
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin work delete API error:", error);
    return NextResponse.json(
      { success: false, message: "Unable to delete work item." },
      { status: 500 }
    );
  }
}
