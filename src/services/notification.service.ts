import { createClient } from "@/lib/supabase/client";
import { getImageUrl } from "@/lib/utils";

export type NotificationCategory = "lecture" | "review" | "archive";

export interface ContentNotificationItem {
  key: string; // e.g. "lecture:120"
  category: NotificationCategory;
  id: number;
  title: string;
  subtitle: string;
  image: string;
  date: string; // YYYY-MM-DD
  timestamp: number; // for sorting & recency check
  href: string;
}

function parseTimestamp(
  createdAt?: string | null,
  fallbackDate?: string | null
): number {
  if (createdAt) {
    const t = Date.parse(createdAt);
    if (!Number.isNaN(t)) return t;
  }
  if (fallbackDate) {
    const t = Date.parse(fallbackDate);
    if (!Number.isNaN(t)) return t;
  }
  return 0;
}

export async function fetchRecentNotifications(
  perCategoryLimit = 5
): Promise<ContentNotificationItem[]> {
  const supabase = createClient();

  const [lectureRes, reviewRes, archiveRes] = await Promise.all([
    supabase
      .from("lecture")
      .select(
        "lecture_id, date, created_at, album:album_id(title, image_id, artist:artist_id(name))"
      )
      .order("lecture_id", { ascending: false })
      .limit(perCategoryLimit),
    supabase
      .from("review")
      .select("review_id, title, writer, type, image_id, created_at")
      .order("review_id", { ascending: false })
      .limit(perCategoryLimit),
    supabase
      .from("archive")
      .select(
        `
        archive_id,
        writer,
        date,
        created_at,
        album(title, image_id, artist:artist_id(name)),
        single(title, image_id, artist:artist_id(name))
      `
      )
      .order("archive_id", { ascending: false })
      .limit(perCategoryLimit),
  ]);

  const items: ContentNotificationItem[] = [];

  for (const row of lectureRes.data ?? []) {
    const album = row.album as unknown as {
      title: string;
      image_id: string;
      artist: { name: string } | null;
    } | null;
    if (!album) continue;

    const dateStr =
      row.date || (row.created_at ? row.created_at.slice(0, 10) : "");
    items.push({
      key: `lecture:${row.lecture_id}`,
      category: "lecture",
      id: row.lecture_id,
      title: album.title,
      subtitle: `${album.artist?.name ?? "아티스트"} · 새 음평회 등록`,
      image: getImageUrl(album.image_id),
      date: dateStr,
      timestamp: parseTimestamp(row.created_at, row.date),
      href: `/lecture/${row.lecture_id}`,
    });
  }

  for (const row of reviewRes.data ?? []) {
    const dateStr = row.created_at ? row.created_at.slice(0, 10) : "";
    items.push({
      key: `review:${row.review_id}`,
      category: "review",
      id: row.review_id,
      title: row.title,
      subtitle: `${row.writer}님의 새 ${row.type || "칼럼"}`,
      image: getImageUrl(row.image_id),
      date: dateStr,
      timestamp: parseTimestamp(row.created_at, null),
      href: `/review/${row.review_id}`,
    });
  }

  for (const row of archiveRes.data ?? []) {
    const albumRel = row.album as unknown as
      | { title: string; image_id: string; artist: { name: string } | null }[]
      | { title: string; image_id: string; artist: { name: string } | null }
      | null;
    const singleRel = row.single as unknown as
      | { title: string; image_id: string; artist: { name: string } | null }[]
      | { title: string; image_id: string; artist: { name: string } | null }
      | null;

    const albumItem = Array.isArray(albumRel) ? albumRel[0] : albumRel;
    const singleItem = Array.isArray(singleRel) ? singleRel[0] : singleRel;
    const target = albumItem || singleItem;
    if (!target) continue;

    const dateStr =
      row.date || (row.created_at ? row.created_at.slice(0, 10) : "");
    items.push({
      key: `archive:${row.archive_id}`,
      category: "archive",
      id: row.archive_id,
      title: target.title,
      subtitle: `${target.artist?.name ?? "아티스트"} · ${row.writer}님의 아카이브`,
      image: getImageUrl(target.image_id),
      date: dateStr,
      timestamp: parseTimestamp(row.created_at, row.date),
      href: `/archive/${row.archive_id}`,
    });
  }

  items.sort((a, b) => {
    if (b.timestamp !== a.timestamp) return b.timestamp - a.timestamp;
    return b.id - a.id;
  });

  return items.slice(0, 10);
}
