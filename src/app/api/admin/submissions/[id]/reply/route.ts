import { NextRequest, NextResponse } from "next/server";
import { addSubmissionReply, getSubmissionById } from "@/lib/db";
import { sendEmail, getEmailSettings } from "@/lib/email";
import { checkRateLimit } from "@/lib/rate-limit";
import { escapeHtml, readJsonObject, sanitizeText } from "@/lib/request";
import { verifySession } from "@/lib/session";
import type { SubmissionType } from "@/lib/db-schema";

const VALID_TYPES: SubmissionType[] = ["course", "contact"];
const REQUEST_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function parseSubmissionId(value: string): number | null {
  if (!/^\d+$/.test(value)) return null;
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}
function isSubmissionType(value: unknown): value is SubmissionType {
  return (
    typeof value === "string" &&
    VALID_TYPES.includes(value as SubmissionType)
  );
}

export async function POST(
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

    const rateLimit = checkRateLimit(
      `admin-reply:${session.email.toLowerCase()}`,
      30,
      15 * 60 * 1000
    );
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, message: "Too many replies. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(
              Math.ceil((rateLimit.retryAfterMs ?? 0) / 1000)
            ),
          },
        }
      );
    }

    const { id: idValue } = await params;
    const id = parseSubmissionId(idValue);
    const body = await readJsonObject(request);
    if (!body || id === null) {
      return NextResponse.json(
        { success: false, message: "Invalid request." },
        { status: 400 }
      );
    }

    const type = body.type;
    const subject = sanitizeText(body.subject, 200);
    const message = sanitizeText(body.message, 5000);
    const requestId = sanitizeText(body.requestId, 64);

    if (
      !isSubmissionType(type) ||
      !subject ||
      !message ||
      !REQUEST_ID_PATTERN.test(requestId)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "A valid subject and message are required.",
        },
        { status: 400 }
      );
    }

    const submission = await getSubmissionById(type, id);
    if (!submission) {
      return NextResponse.json(
        { success: false, message: "Submission not found." },
        { status: 404 }
      );
    }

    const settings = getEmailSettings();
    const safeMessage = escapeHtml(message).replace(/\n/g, "<br>");
    const result = await sendEmail({
      to: submission.email,
      replyTo: settings.replyTo,
      subject,
      text: `${message}\n\nOmar Hussein Photography`,
      html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#171717"><p>${safeMessage}</p><p>Omar Hussein Photography</p></div>`,
      idempotencyKey: `reply-${type}-${id}-${requestId}`,
    });

    const updated = await addSubmissionReply(type, id, {
      id: requestId,
      subject,
      message,
      sentAt: new Date().toISOString(),
      providerEmailId: result.id,
    });

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Submission not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, submission: updated },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    const errorName =
      error instanceof Error ? error.name : "UnknownError";
    const errorMessage =
      error instanceof Error ? error.message : String(error);
    console.error(
      "Admin reply failed:",
      errorName,
      errorMessage,
      "| CONTACT_EMAIL_PROVIDER:",
      process.env.CONTACT_EMAIL_PROVIDER || "(not set)",
      "| RESEND_API_KEY set:",
      Boolean(process.env.RESEND_API_KEY?.trim()),
      "| RESEND_FROM_EMAIL set:",
      Boolean(process.env.RESEND_FROM_EMAIL?.trim())
    );

    const isConfigError = errorName === "EmailConfigurationError";
    return NextResponse.json(
      {
        success: false,
        message: isConfigError
          ? `Email is not configured: ${errorMessage}`
          : "The email could not be sent. Check the email configuration and try again.",
      },
      { status: isConfigError ? 500 : 502 }
    );
  }
}
