import { NextResponse } from "next/server";
import { getPublishedWorkItems } from "@/lib/db";
import { DEFAULT_WORK_ITEMS } from "@/lib/default-work";

/**
 * GET /api/work
 * Public endpoint — returns all published work items for the /work page.
 */
export async function GET() {
  try {
    let items = DEFAULT_WORK_ITEMS;
    try {
      const managedItems = await getPublishedWorkItems();
      if (managedItems.length > 0) items = managedItems;
    } catch (error) {
      console.error(
        "Managed portfolio storage is unavailable; using static catalog:",
        error instanceof Error ? error.name : "UnknownError"
      );
    }

    return NextResponse.json(
      { success: true, items },
      {
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
        },
      }
    );
  } catch (error) {
    console.error("Public work API error:", error);
    return NextResponse.json(
      { success: false, message: "Unable to load portfolio." },
      { status: 500 }
    );
  }
}
