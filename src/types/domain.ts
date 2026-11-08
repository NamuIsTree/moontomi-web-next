export interface ArtistInfo {
  artist_id?: number;
  name: string;
  name_en?: string | null;
  pronounce?: string | null;
  nation: string;
}

export interface GenreInfo {
  genre_id: number;
  category: string;
  name: string;
}

export interface SeasonInfo {
  season_id: number;
  name: string;
  image_id?: string;
  color?: string;
}

export interface ExternalLinks {
  youtube?: string | null;
  spotify?: string | null;
}

export interface RankedLectureAlbum {
  id: number;
  image: string;
  title?: string;
  artist?: string;
  rating?: number | null;
}

export interface LatestLectureSummary {
  id: number;
  title: string;
  artist: string;
  image: string;
}

export interface LectureListItem {
  id: number;
  image: string;
  title: string;
  artist: ArtistInfo;
  genres: GenreInfo[];
  date: string | null;
  rating: number | null; // 0.000 ~ 10.000 scale
  season: {
    id?: number;
    name: string;
  };
}

export interface LectureDetail {
  id: number;
  title: string;
  artist: string;
  release: string;
  rating: number | null; // 0.000 ~ 10.000 scale
  genres: GenreInfo[];
  tracks: string[];
  season: {
    id: number;
    name: string;
  };
  image: string;
  date: string | null;
  archive: { id: number } | null;
}

export interface LectureCommentItem {
  id: number;
  writer: string;
  date: string | null;
  rating: number; // 0.0 ~ 10.0 scale
  bests: string[];
  comment: string;
}

export interface LookupCommentItem {
  id: number;
  lecture_id: number;
  writer: string;
  album: {
    title: string;
    image: string;
  };
  rating: number; // 0.0 ~ 10.0 scale
  text: string;
}

export interface ReviewListItem {
  id: number;
  image: string;
  title: string;
  description: string;
  views: number;
  writer: string;
  type: string;
  created_at: string;
}

export interface ReviewDetail extends ReviewListItem {
  content: string;
}

export interface ArchivePublicItem {
  id: number;
  writer: string;
  date: string;
  rating: number; // 0.0 ~ 5.0 (or 10.0 / 2) scale
  item: {
    type: "album" | "single";
    id: number;
    title: string;
    image: string;
    artist: string;
    artist_en?: string | null;
    artist_pronounce?: string | null;
    release: string;
    genres: GenreInfo[];
    links: ExternalLinks | null;
  };
}
