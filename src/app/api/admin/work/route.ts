import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/session";
import { listWorkItems, insertWorkItem, getWorkCounts } from "@/lib/db";
import { WORK_CATEGORIES } from "@/lib/db-schema";
import type { WorkCategory } from "@/lib/db-schema";
import { storeWorkImage } from "@/lib/work-images";
import { DEFAULT_WORK_ITEMS } from "@/lib/default-work";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 30 * 1024 * 1024; // 30MB

/**
 * GET /api/admin/work
 * List all work items (admin, paginated) with counts.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await verifySession();
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const url = request.nextUrl;
    const categoryValue = url.searchParams.get("category");
    const searchValue = url.searchParams.get("search")?.trim();
    const pageValue = url.searchParams.get("page") || "1";

    if (
      categoryValue &&
      !WORK_CATEGORIES.includes(categoryValue as WorkCategory)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid category." },
        { status: 400 }
      );
    }

    if (!/^\d+$/.test(pageValue) || Number(pageValue) < 1) {
      return NextResponse.json(
        { success: false, message: "Page must be a positive integer." },
        { status: 400 }
      );
    }

    let [data, counts] = await Promise.all([
      listWorkItems({
        category: categoryValue as WorkCategory | undefined,
        search: searchValue ? searchValue.slice(0, 200) : undefined,
        page: Number(pageValue),
        limit: 50,
      }),
      getWorkCounts(),
    ]);

    // Fallback: if the database has no work items at all, show the default
    // portfolio catalog so the admin dashboard is never empty on first visit.
    if (
      counts.total === 0 &&
      !categoryValue &&
      !searchValue &&
      DEFAULT_WORK_ITEMS.length > 0
    ) {
      data = {
        items: DEFAULT_WORK_ITEMS,
        total: DEFAULT_WORK_ITEMS.length,
        page: 1,
        totalPages: 1,
      };
      counts = {
        total: DEFAULT_WORK_ITEMS.length,
        published: DEFAULT_WORK_ITEMS.filter((w) => w.isPublished).length,
        draft: DEFAULT_WORK_ITEMS.filter((w) => !w.isPublished).length,
      };
    }

    return NextResponse.json(
      { success: true, ...data, counts },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Admin work list API error:", error);
    return NextResponse.json(
      { success: false, message: "Unable to load work items." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/work
 * Create a new work item. Accepts multipart form-data.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await verifySession();
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await request.formData();

    // Validate image
    const imageFile = formData.get("image") as File | null;
    if (!imageFile || !(imageFile instanceof File) || imageFile.size === 0) {
      return NextResponse.json(
        { success: false, message: "An image file is required." },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(imageFile.type)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid file type. Only JPEG, PNG, and WebP are accepted.",
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

    // Validate category
    const category = formData.get("category") as string | null;
    if (!category || !WORK_CATEGORIES.includes(category as WorkCategory)) {
      return NextResponse.json(
        { success: false, message: "A valid category is required." },
        { status: 400 }
      );
    }

    const title = (formData.get("title") as string)?.trim() || "Untitled";
    const altText = (formData.get("altText") as string)?.trim() || title;
    const displayOrder = Number(formData.get("displayOrder")) || 0;
    const isPublished = formData.get("isPublished") !== "false";

    // Process and persist image
    const buffer = Buffer.from(await imageFile.arrayBuffer());
    const slug = `work-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const storedImage = await storeWorkImage(buffer, slug);

    const item = await insertWorkItem({
      title,
      imageUrl: storedImage.imageUrl,
      fullImageUrl: storedImage.fullImageUrl,
      category: category as WorkCategory,
      altText,
      displayOrder,
      isPublished,
      blurDataURL: storedImage.blurDataURL,
      cardWidth: storedImage.cardWidth,
      cardHeight: storedImage.cardHeight,
      cardBlobPath: storedImage.cardBlobPath,
      fullBlobPath: storedImage.fullBlobPath,
    });

    return NextResponse.json({ success: true, item }, { status: 201 });
  } catch (error) {
    console.error("Admin work create API error:", error);
    return NextResponse.json(
      { success: false, message: "Unable to create work item." },
      { status: 500 }
    );
  }
}
