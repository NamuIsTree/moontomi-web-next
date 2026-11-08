import { createClient } from "@/lib/supabase/client";
import { getImageUrl } from "@/lib/utils";
import type {
  LatestLectureSummary,
  LectureCommentItem,
  LectureDetail,
  LectureListItem,
  RankedLectureAlbum,
} from "@/types/domain";

export async function fetchTopLectures(): Promise<{
  upperTop: RankedLectureAlbum[];
  lowerTop: RankedLectureAlbum[];
}> {
  const supabase = createClient();

  const [upperRes, lowerRes] = await Promise.all([
    supabase
      .from("lecture")
      .select("lecture_id, rating, album:album_id(title, image_id)")
      .not("rating", "is", null)
      .neq("season_id", 8)
      .order("rating", { ascending: false })
      .order("lecture_id", { ascending: true })
      .limit(10),
    supabase
      .from("lecture")
      .select("lecture_id, rating, album:album_id(title, image_id)")
      .not("rating", "is", null)
      .neq("season_id", 8)
      .order("rating", { ascending: true })
      .order("lecture_id", { ascending: true })
      .limit(10),
  ]);

  const mapRow = (row: {
    lecture_id: number;
    rating: number | null;
    album: { title: string; image_id: string } | null;
  }): RankedLectureAlbum => ({
    id: row.lecture_id,
    image: getImageUrl(row.album?.image_id),
    title: row.album?.title,
    rating: row.rating !== null ? row.rating / 1000 : null,
  });

  return {
    upperTop: (upperRes.data ?? []).map((r) =>
      mapRow(r as unknown as Parameters<typeof mapRow>[0])
    ),
    lowerTop: (lowerRes.data ?? []).map((r) =>
      mapRow(r as unknown as Parameters<typeof mapRow>[0])
    ),
  };
}

export async function fetchLatestLecture(): Promise<LatestLectureSummary | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("lecture")
    .select(
      "lecture_id, album:album_id(title, image_id, artist:artist_id(name))"
    )
    .order("lecture_id", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;

  const album = data.album as unknown as {
    title: string;
    image_id: string;
    artist: { name: string } | null;
  } | null;

  if (!album) return null;

  return {
    id: data.lecture_id,
    title: album.title,
    artist: album.artist?.name ?? "",
    image: getImageUrl(album.image_id),
  };
}

export async function fetchLectureList(params: {
  page: number;
  limit?: number;
  sortBy: "id" | "rating";
  order: "asc" | "desc";
}): Promise<LectureListItem[]> {
  const { page, limit = 15, sortBy, order } = params;
  const supabase = createClient();
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("lecture")
    .select(
      `
      lecture_id,
      rating,
      date,
      season_id,
      season:season_id(name),
      album:album_id(
        title,
        image_id,
        artist:artist_id(name, name_en, pronounce, nation),
        album_genre(genre:genre_id(genre_id, category, name))
      )
    `
    );

  if (sortBy === "rating") {
    query = query.not("rating", "is", null).neq("season_id", 8);
    query = query
      .order("rating", { ascending: order === "asc" })
      .order("lecture_id", { ascending: true });
  } else {
    query = query.order("lecture_id", { ascending: order === "asc" });
  }

  const { data, error } = await query.range(from, to);
  if (error || !data) return [];

  return data.map((row) => {
    const album = row.album as unknown as {
      title: string;
      image_id: string;
      artist: {
        name: string;
        name_en: string | null;
        pronounce: string | null;
        nation: string;
      };
      album_genre?: {
        genre: { genre_id: number; category: string; name: string };
      }[];
    };
    const season = row.season as unknown as { name: string };

    return {
      id: row.lecture_id,
      image: getImageUrl(album?.image_id),
      title: album?.title ?? "",
      artist: {
        name: album?.artist?.name ?? "",
        name_en: album?.artist?.name_en ?? null,
        pronounce: album?.artist?.pronounce ?? null,
        nation: album?.artist?.nation ?? "",
      },
      genres: (album?.album_genre ?? []).map((ag) => ag.genre).filter(Boolean),
      date: row.date,
      rating: row.rating !== null ? row.rating / 1000 : null,
      season: {
        id: row.season_id,
        name: season?.name ?? "",
      },
    };
  });
}

export async function fetchLectureById(
  lectureId: number
): Promise<LectureDetail | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("lecture")
    .select(
      `
      lecture_id,
      rating,
      date,
      season:season_id(season_id, name),
      album:album_id(
        album_id,
        title,
        release,
        image_id,
        tracks,
        archive_id,
        artist:artist_id(name),
        album_genre(genre:genre_id(genre_id, category, name))
      )
    `
    )
    .eq("lecture_id", lectureId)
    .maybeSingle();

  if (error || !data) return null;

  const album = data.album as unknown as {
    album_id: number;
    title: string;
    release: string;
    image_id: string;
    tracks: string[];
    archive_id: number | null;
    artist: { name: string } | null;
    album_genre: {
      genre: { genre_id: number; category: string; name: string };
    }[];
  };
  const season = data.season as unknown as { season_id: number; name: string };

  return {
    id: data.lecture_id,
    title: album?.title ?? "",
    artist: album?.artist?.name ?? "",
    release: album?.release ?? "",
    rating: data.rating !== null ? data.rating / 1000 : null,
    genres: (album?.album_genre ?? []).map((ag) => ag.genre).filter(Boolean),
    tracks: Array.isArray(album?.tracks) ? album.tracks : [],
    season: {
      id: season?.season_id ?? 0,
      name: season?.name ?? "",
    },
    image: getImageUrl(album?.image_id),
    date: data.date,
    archive: album?.archive_id ? { id: album.archive_id } : null,
  };
}

export async function fetchLectureComments(
  lectureId: number,
  tracks: string[]
): Promise<LectureCommentItem[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("comment")
    .select("comment_id, writer, member_id, rating, picks, text, created_at")
    .eq("lecture_id", lectureId)
    .order("comment_id", { ascending: true });

  if (error || !data) return [];

  return data.map((row) => {
    const pickIndices = Array.isArray(row.picks)
      ? (row.picks as number[])
      : [];
    return {
      id: row.comment_id,
      writer: row.writer,
      member_id: row.member_id ?? null,
      date: row.created_at ? row.created_at.slice(0, 10) : null,
      rating: row.rating / 10,
      bests: pickIndices.map((idx) => tracks[idx] ?? "").filter(Boolean),
      comment: row.text,
    };
  });
}

export async function openLectureWithAdminPassword(
  lectureId: number,
  password: string
): Promise<{ rating: number }> {
  const supabase = createClient();

  const { data, error } = await supabase.rpc("admin_action", {
    p_password: password,
    p_action: "make_lecture_public",
    p_payload: { lecture_id: lectureId },
  });

  if (error) {
    throw new Error(error.message || "관리자 비밀번호가 일치하지 않습니다.");
  }

  const rawRating =
    typeof (data as { rating?: unknown })?.rating === "number"
      ? ((data as { rating: number }).rating / 1000)
      : 0;

  return { rating: rawRating };
}
