import { NextResponse } from "next/server";
import { getCachedHomeData } from "@/lib/server-cache";

export async function GET() {
  try {
    const cached = await getCachedHomeData();

    // Pick 3 latest + 7 random from cached archive pool on each request
    const latestItems = cached.allArchives.slice(0, 3);
    const remaining = [...cached.allArchives.slice(3)];
    for (let i = remaining.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [remaining[i], remaining[j]] = [remaining[j], remaining[i]];
    }
    const latestArchives = [...latestItems, ...remaining.slice(0, 7)];

    return NextResponse.json(
      {
        upperTop: cached.upperTop,
        lowerTop: cached.lowerTop,
        latestLecture: cached.latestLecture,
        latestReviews: cached.latestReviews,
        latestArchives,
      },
      {
        headers: {
          // Browser caches briefly; Vercel Data Cache handles shared server caching + tag invalidation
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (err) {
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Failed to load home data",
      },
      { status: 500 }
    );
  }
}
