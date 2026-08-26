import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/session";
import { getSubmissionById, updateSubmissionStatus } from "@/lib/db";
import type { SubmissionStatus } from "@/lib/db-schema";
import { readJsonObject } from "@/lib/request";

const VALID_STATUSES: SubmissionStatus[] = [
  "New",
  "Read",
  "Contacted",
  "Archived",
];
const VALID_TYPES = ["course", "contact"] as const;

function parseSubmissionId(value: string): number | null {
  if (!/^\d+$/.test(value)) return null;
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

function isSubmissionType(
  value: unknown
): value is (typeof VALID_TYPES)[number] {
  return (
    typeof value === "string" &&
    VALID_TYPES.includes(value as (typeof VALID_TYPES)[number])
  );
}

function isSubmissionStatus(value: unknown): value is SubmissionStatus {
  return (
    typeof value === "string" &&
    VALID_STATUSES.includes(value as SubmissionStatus)
  );
}

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
  const id = parseSubmissionId(idStr);
  const type = request.nextUrl.searchParams.get("type");

  if (!isSubmissionType(type) || id === null) {
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
  const id = parseSubmissionId(idStr);
  const body = await readJsonObject(request);
  if (!body) {
    return NextResponse.json(
      { success: false, message: "A valid JSON request body is required." },
      { status: 400 }
    );
  }
  const { type, status } = body;

  if (!isSubmissionType(type) || !isSubmissionStatus(status) || id === null) {
    return NextResponse.json(
      { success: false, message: "Invalid request." },
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
