import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/session";
import {
  listCourseBookings,
  listContactInquiries,
  getDashboardCounts,
} from "@/lib/db";
import type { SubmissionStatus } from "@/lib/db-schema";

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
  // Auth check
  const session = await verifySession();
  if (!session) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const url = request.nextUrl;
  const type = url.searchParams.get("type") || "course";
  const status = url.searchParams.get("status") as SubmissionStatus | null;
  const search = url.searchParams.get("search") || undefined;
  const page = parseInt(url.searchParams.get("page") || "1", 10);

  const params = {
    type: type as "course" | "contact",
    status: status || undefined,
    search,
    page,
    limit: 20,
  };

  const data =
    type === "course"
      ? listCourseBookings(params)
      : listContactInquiries(params);

  const counts = getDashboardCounts();

  return NextResponse.json({
    success: true,
    ...data,
    counts,
  });
}
