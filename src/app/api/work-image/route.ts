import { get } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";

const WORK_BLOB_PATH = /^work\/[a-zA-Z0-9._/-]+\.webp$/;

export async function GET(request: NextRequest) {
  const pathname = request.nextUrl.searchParams.get("path")?.trim();
  if (!pathname || !WORK_BLOB_PATH.test(pathname)) {
    return NextResponse.json(
      { success: false, message: "Invalid image path." },
      { status: 400 }
    );
  }

  try {
    const result = await get(pathname, { access: "private" });
    if (!result || result.statusCode !== 200) {
      return new NextResponse(null, { status: 404 });
    }

    return new NextResponse(result.stream, {
      headers: {
        "Content-Type": result.blob.contentType || "image/webp",
        "Content-Length": String(result.blob.size),
        "Cache-Control": "public, max-age=31536000, immutable",
        ETag: result.blob.etag,
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error(
      "Work image delivery failed:",
      error instanceof Error ? error.name : "UnknownError"
    );
    return new NextResponse(null, { status: 404 });
  }
}
