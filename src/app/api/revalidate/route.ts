import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { CACHE_TAGS, type CacheTag } from "@/lib/cache-tags";

const ALLOWED_TAGS = new Set<string>(Object.values(CACHE_TAGS));

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rawTags = Array.isArray(body?.tags) ? body.tags : [];

    const validTags = rawTags.filter(
      (tag: unknown): tag is CacheTag =>
        typeof tag === "string" && ALLOWED_TAGS.has(tag)
    );

    for (const tag of validTags) {
      revalidateTag(tag);
    }

    return NextResponse.json({ ok: true, revalidated: validTags });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        message:
          err instanceof Error ? err.message : "Failed to revalidate cache",
      },
      { status: 400 }
    );
  }
}
