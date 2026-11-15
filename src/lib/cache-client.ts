import type { CacheTag } from "@/lib/cache-tags";

/**
 * Trigger Next.js server cache invalidation via `/api/revalidate`.
 * Safe to fire-and-forget from client write mutations.
 */
export async function invalidateServerCache(tags: CacheTag[]): Promise<void> {
  if (typeof window === "undefined" || tags.length === 0) return;
  try {
    await fetch("/api/revalidate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tags }),
    });
  } catch {
    // Non-blocking: TTL fallback ensures eventual consistency
  }
}
