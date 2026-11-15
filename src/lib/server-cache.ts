import { unstable_cache } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { createPublicServerClient } from "@/lib/supabase/server";
import { getImageUrl } from "@/lib/utils";
import type {
  ArchivePublicItem,
  ExternalLinks,
  GenreInfo,
  LatestLectureSummary,
  LectureNavOption,
  RankedLectureAlbum,
  ReviewListItem,
} from "@/types/domain";

interface RawArchiveRelation {
  album_id?: number;
  single_id?: number;
  title: string;
  image_id: string;
  release: string;
  links: ExternalLinks | null;
  artist: {
    name: string;
    name_en?: string | null;
    pronounce?: string | null;
  } | null;
  album_genre?: { genre: GenreInfo }[];
  single_genre?: { genre: GenreInfo }[];
}

function mapArchiveRow(row: {
  archive_id: number;
  writer: string;
  date: string;
  rating: number;
  album: RawArchiveRelation[] | RawArchiveRelation | null;
  single: RawArchiveRelation[] | RawArchiveRelation | null;
}): ArchivePublicItem | null {
  const albumItem = Array.isArray(row.album) ? row.album[0] : row.album;
  const singleItem = Array.isArray(row.single) ? row.single[0] : row.single;

  const isAlbum = Boolean(albumItem);
  const target = isAlbum ? albumItem : singleItem;
  if (!target) return null;

  const genres = isAlbum
    ? (target.album_genre ?? []).map((g) => g.genre).filter(Boolean)
    : (target.single_genre ?? []).map((g) => g.genre).filter(Boolean);

  return {
    id: row.archive_id,
    writer: row.writer,
    date: row.date,
    rating: row.rating / 10,
    item: {
      type: isAlbum ? "album" : "single",
      id: (isAlbum ? target.album_id : target.single_id) ?? 0,
      title: target.title,
      image: getImageUrl(target.image_id),
      artist: target.artist?.name ?? "",
      artist_en: target.artist?.name_en ?? null,
      artist_pronounce: target.artist?.pronounce ?? null,
      release: target.release,
      genres,
      links: target.links ?? null,
    },
  };
}

export interface CachedHomePayload {
  upperTop: RankedLectureAlbum[];
  lowerTop: RankedLectureAlbum[];
  latestLecture: LatestLectureSummary | null;
  latestReviews: ReviewListItem[];
  allArchives: ArchivePublicItem[];
}

export const getCachedHomeData = unstable_cache(
  async (): Promise<CachedHomePayload> => {
    const supabase = createPublicServerClient();

    const [upperRes, lowerRes, latestRes, reviewsRes, archivesRes] =
      await Promise.all([
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
        supabase
          .from("lecture")
          .select(
            "lecture_id, album:album_id(title, image_id, artist:artist_id(name))"
          )
          .order("lecture_id", { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from("review")
          .select(
            "review_id, title, writer, member_id, type, description, image_id, views, created_at"
          )
          .order("review_id", { ascending: false })
          .range(0, 9),
        supabase
          .from("archive")
          .select(
            `
            archive_id,
            writer,
            date,
            rating,
            album(
              album_id,
              title,
              image_id,
              release,
              links,
              artist:artist_id(name, name_en, pronounce),
              album_genre(genre:genre_id(genre_id, category, name))
            ),
            single(
              single_id,
              title,
              image_id,
              release,
              links,
              artist:artist_id(name, name_en, pronounce),
              single_genre(genre:genre_id(genre_id, category, name))
            )
          `
          )
          .order("archive_id", { ascending: false })
          .limit(1000),
      ]);

    const mapRanked = (row: {
      lecture_id: number;
      rating: number | null;
      album: { title: string; image_id: string } | null;
    }): RankedLectureAlbum => ({
      id: row.lecture_id,
      image: getImageUrl(row.album?.image_id),
      title: row.album?.title,
      rating: row.rating !== null ? row.rating / 1000 : null,
    });

    const upperTop = (upperRes.data ?? []).map((r) =>
      mapRanked(r as unknown as Parameters<typeof mapRanked>[0])
    );
    const lowerTop = (lowerRes.data ?? []).map((r) =>
      mapRanked(r as unknown as Parameters<typeof mapRanked>[0])
    );

    let latestLecture: LatestLectureSummary | null = null;
    if (latestRes.data) {
      const album = latestRes.data.album as unknown as {
        title: string;
        image_id: string;
        artist: { name: string } | null;
      } | null;
      if (album) {
        latestLecture = {
          id: latestRes.data.lecture_id,
          title: album.title,
          artist: album.artist?.name ?? "",
          image: getImageUrl(album.image_id),
        };
      }
    }

    const latestReviews: ReviewListItem[] = (reviewsRes.data ?? []).map(
      (row) => ({
        id: row.review_id,
        title: row.title,
        writer: row.writer,
        member_id: row.member_id ?? null,
        type: row.type,
        description: row.description,
        image: getImageUrl(row.image_id),
        views: row.views,
        created_at: row.created_at ? row.created_at.slice(0, 10) : "",
      })
    );

    const allArchives = (archivesRes.data ?? [])
      .map((row) =>
        mapArchiveRow(row as unknown as Parameters<typeof mapArchiveRow>[0])
      )
      .filter((item): item is ArchivePublicItem => item !== null);

    return {
      upperTop,
      lowerTop,
      latestLecture,
      latestReviews,
      allArchives,
    };
  },
  ["home-data"],
  {
    revalidate: 300,
    tags: [
      CACHE_TAGS.home,
      CACHE_TAGS.lectures,
      CACHE_TAGS.reviews,
      CACHE_TAGS.archives,
    ],
  }
);

export const getCachedLectureNavOptions = unstable_cache(
  async (): Promise<LectureNavOption[]> => {
    const supabase = createPublicServerClient();

    const { data, error } = await supabase
      .from("lecture")
      .select(
        "lecture_id, rating, album:album_id(title, artist:artist_id(name, name_en, pronounce))"
      )
      .order("lecture_id", { ascending: false })
      .limit(1000);

    if (error || !data) return [];

    return data.map((row) => {
      const album = row.album as unknown as {
        title: string;
        artist: {
          name: string;
          name_en?: string | null;
          pronounce?: string | null;
        } | null;
      } | null;

      return {
        id: row.lecture_id,
        title: album?.title ?? "",
        artist: album?.artist?.name ?? "",
        artist_en: album?.artist?.name_en ?? null,
        artist_pronounce: album?.artist?.pronounce ?? null,
        isOpen: row.rating !== null,
      };
    });
  },
  ["lecture-nav-options-v2"],
  {
    revalidate: 3600,
    tags: [CACHE_TAGS.lectures],
  }
);
