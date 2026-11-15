import { NextResponse } from "next/server";
import { getCachedLectureNavOptions } from "@/lib/server-cache";

export async function GET() {
  try {
    const options = await getCachedLectureNavOptions();
    return NextResponse.json(
      { options },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Failed to load lecture nav options",
      },
      { status: 500 }
    );
  }
}
