import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/session";
import { getSubmissionById, updateSubmissionStatus } from "@/lib/db";
import type { SubmissionStatus } from "@/lib/db-schema";

const VALID_STATUSES: SubmissionStatus[] = [
  "New",
  "Read",
  "Contacted",
  "Archived",
];

/**
 * GET /api/admin/submissions/[id]?type=course|contact
 * Returns a single submission.
 */
export async function GET(
  request: NextRequest,
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
  const id = parseInt(idStr, 10);
  const type = request.nextUrl.searchParams.get("type") as
    | "course"
    | "contact"
    | null;

  if (!type || isNaN(id)) {
    return NextResponse.json(
      { success: false, message: "Invalid request." },
      { status: 400 }
    );
  }

  const submission = getSubmissionById(type, id);
  if (!submission) {
    return NextResponse.json(
      { success: false, message: "Submission not found." },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, submission });
}

/**
 * PATCH /api/admin/submissions/[id]
 * Update the status of a submission.
 * Body: { type: "course" | "contact", status: SubmissionStatus }
 */
export async function PATCH(
  request: NextRequest,
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
  const id = parseInt(idStr, 10);
  const body = await request.json();
  const { type, status } = body;

  if (!type || !status || isNaN(id)) {
    return NextResponse.json(
      { success: false, message: "Invalid request." },
      { status: 400 }
    );
  }

  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json(
      { success: false, message: "Invalid status value." },
      { status: 400 }
    );
  }

  const updated = updateSubmissionStatus(type, id, status);
  if (!updated) {
    return NextResponse.json(
      { success: false, message: "Submission not found." },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true });
}
