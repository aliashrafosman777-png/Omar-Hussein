import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/session";
import {
  listCourseBookings,
  listContactInquiries,
  getDashboardCounts,
} from "@/lib/db";
import type { SubmissionStatus } from "@/lib/db-schema";

const VALID_TYPES = ["course", "contact"] as const;
const VALID_STATUSES: SubmissionStatus[] = [
  "New",
  "Read",
  "Contacted",
  "Archived",
];

/**
 * GET /api/admin/submissions
 * Returns paginated submissions and dashboard counts.
 * Protected: requires valid admin session.
 *
 * Query params:
 *  - type: "course" | "contact"
 *  - status: SubmissionStatus (optional filter)
 *  - search: string (optional search term)
 *  - page: number (default 1)
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
    const typeValue = url.searchParams.get("type") || "course";
    const statusValue = url.searchParams.get("status");
    const searchValue = url.searchParams.get("search")?.trim();
    const pageValue = url.searchParams.get("page") || "1";

    if (!VALID_TYPES.includes(typeValue as (typeof VALID_TYPES)[number])) {
      return NextResponse.json(
        { success: false, message: "Invalid submission type." },
        { status: 400 }
      );
    }
    if (
      statusValue &&
      !VALID_STATUSES.includes(statusValue as SubmissionStatus)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid status value." },
        { status: 400 }
      );
    }
    if (!/^\d+$/.test(pageValue) || Number(pageValue) < 1) {
      return NextResponse.json(
        { success: false, message: "Page must be a positive integer." },
        { status: 400 }
      );
    }

    const type = typeValue as (typeof VALID_TYPES)[number];
    const params = {
      type,
      status: statusValue as SubmissionStatus | undefined,
      search: searchValue ? searchValue.slice(0, 200) : undefined,
      page: Number(pageValue),
      limit: 20,
    };

    const data =
      type === "course"
        ? listCourseBookings(params)
        : listContactInquiries(params);
    const counts = getDashboardCounts();

    return NextResponse.json(
      { success: true, ...data, counts },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Submissions API error:", error);
    return NextResponse.json(
      { success: false, message: "Unable to load submissions." },
      { status: 500 }
    );
  }
}
