import { createClient } from "@/lib/supabase/client";
import { getImageUrl } from "@/lib/utils";
import type { ArchivePublicItem, ExternalLinks, GenreInfo } from "@/types/domain";

interface RawItemRelation {
  album_id?: number;
  single_id?: number;
  title: string;
  image_id: string;
  release: string;
  links: ExternalLinks | null;
  artist: { name: string } | null;
  album_genre?: { genre: GenreInfo }[];
  single_genre?: { genre: GenreInfo }[];
}

function mapArchiveRow(row: {
  archive_id: number;
  writer: string;
  date: string;
  rating: number;
  album: RawItemRelation[] | RawItemRelation | null;
  single: RawItemRelation[] | RawItemRelation | null;
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
      release: target.release,
      genres,
      links: target.links ?? null,
    },
  };
}

const ARCHIVE_SELECT_QUERY = `
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
    artist:artist_id(name),
    album_genre(genre:genre_id(genre_id, category, name))
  ),
  single(
    single_id,
    title,
    image_id,
    release,
    links,
    artist:artist_id(name),
    single_genre(genre:genre_id(genre_id, category, name))
  )
`;

export async function fetchArchiveList(params: {
  page: number;
  limit?: number;
  order: "asc" | "desc";
  minRating?: number;
  maxRating?: number;
}): Promise<ArchivePublicItem[]> {
  const {
    page,
    limit = 12,
    order,
    minRating = 0,
    maxRating = 1000,
  } = params;

  const supabase = createClient();
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error } = await supabase
    .from("archive")
    .select(ARCHIVE_SELECT_QUERY)
    .gte("rating", minRating)
    .lte("rating", maxRating)
    .order("archive_id", { ascending: order === "asc" })
    .range(from, to);

  if (error || !data) return [];

  return data
    .map((row) =>
      mapArchiveRow(row as unknown as Parameters<typeof mapArchiveRow>[0])
    )
    .filter((item): item is ArchivePublicItem => item !== null);
}

export async function fetchArchiveById(
  archiveId: number
): Promise<ArchivePublicItem | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("archive")
    .select(ARCHIVE_SELECT_QUERY)
    .eq("archive_id", archiveId)
    .maybeSingle();

  if (error || !data) return null;

  return mapArchiveRow(data as unknown as Parameters<typeof mapArchiveRow>[0]);
}
