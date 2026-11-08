"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import {
  Disc3,
  Music,
  CirclePlay,
  Users,
  MessageSquare,
  KeyRound,
  LogOut,
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  RefreshCw,
  Upload,
  Search,
  ExternalLink,
  Check,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getImageUrl, cn } from "@/lib/utils";
import { uploadImageToStorage } from "@/services/storage.service";

type AdminTab =
  | "lectures"
  | "albums"
  | "singles"
  | "archives"
  | "artists_genres"
  | "moderation"
  | "members";

const GENRE_CATEGORIES = [
  "POP",
  "ROCK",
  "JAZZ",
  "ELECTRONIC",
  "HIPHOP",
  "R&B",
  "WORLD",
  "EXPERIMENTAL",
] as const;

interface ArtistRow {
  artist_id: number;
  name: string;
  name_en: string | null;
  pronounce: string | null;
  nation: string;
}

interface GenreRow {
  genre_id: number;
  category: string;
  name: string;
}

interface SeasonRow {
  season_id: number;
  name: string;
  color: string;
  image_id: string;
}

interface AlbumRow {
  album_id: number;
  title: string;
  artist_id: number;
  image_id: string;
  release: string;
  tracks: string[];
  links: { youtube?: string | null; spotify?: string | null } | null;
  archive_id: number | null;
  artist?: { name: string } | null;
  album_genre?: { genre_id: number; genre?: GenreRow | null }[];
}

interface SingleRow {
  single_id: number;
  title: string;
  artist_id: number;
  image_id: string;
  release: string;
  links: { youtube?: string | null; spotify?: string | null } | null;
  archive_id: number | null;
  artist?: { name: string } | null;
  single_genre?: { genre_id: number; genre?: GenreRow | null }[];
}

interface LectureRow {
  lecture_id: number;
  album_id: number;
  season_id: number;
  date: string | null;
  rating: number | null;
  album?: {
    title: string;
    image_id: string;
    artist?: { name: string } | null;
  } | null;
  season?: { name: string; color: string } | null;
}

interface ArchiveRow {
  archive_id: number;
  writer: string;
  rating: number;
  date: string;
  album?: {
    album_id: number;
    title: string;
    image_id: string;
    artist?: { name: string } | null;
  }[];
  single?: {
    single_id: number;
    title: string;
    image_id: string;
    artist?: { name: string } | null;
  }[];
}

interface CommentRow {
  comment_id: number;
  lecture_id: number;
  writer: string;
  rating: number;
  text: string;
  created_at: string | null;
}

interface ReviewRow {
  review_id: number;
  title: string;
  writer: string;
  type: string;
  views: number;
  created_at: string | null;
}

interface MemberRow {
  member_id: number;
  name: string;
  created_at: string | null;
  modified_at: string | null;
}

async function runAdminAction(
  action: string,
  payload: Record<string, unknown> = {}
) {
  const res = await fetch("/api/admin/action", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, payload }),
  });
  const json = await res.json();
  if (!res.ok || !json.ok) {
    throw new Error(json.message || "작업 처리 중 오류가 발생했습니다.");
  }
  return json.data;
}

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>("lectures");
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Master data states
  const [artists, setArtists] = useState<ArtistRow[]>([]);
  const [genres, setGenres] = useState<GenreRow[]>([]);
  const [seasons, setSeasons] = useState<SeasonRow[]>([]);
  const [albums, setAlbums] = useState<AlbumRow[]>([]);
  const [singles, setSingles] = useState<SingleRow[]>([]);
  const [lectures, setLectures] = useState<LectureRow[]>([]);
  const [archives, setArchives] = useState<ArchiveRow[]>([]);
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [members, setMembers] = useState<MemberRow[]>([]);

  const showToast = (type: "success" | "error", text: string) => {
    setStatusMsg({ type, text });
    setTimeout(() => {
      setStatusMsg((prev) => (prev?.text === text ? null : prev));
    }, 3500);
  };

  const loadAllData = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();

    const [
      artistsRes,
      genresRes,
      seasonsRes,
      albumsRes,
      singlesRes,
      lecturesRes,
      archivesRes,
      commentsRes,
      reviewsRes,
      membersRes,
    ] = await Promise.all([
      supabase
        .from("artist")
        .select("artist_id, name, name_en, pronounce, nation")
        .order("artist_id", { ascending: false }),
      supabase
        .from("genre")
        .select("genre_id, category, name")
        .order("category", { ascending: true })
        .order("name", { ascending: true }),
      supabase
        .from("season")
        .select("season_id, name, color, image_id")
        .order("season_id", { ascending: false }),
      supabase
        .from("album")
        .select(
          "album_id, title, artist_id, image_id, release, tracks, links, archive_id, artist:artist_id(name), album_genre(genre_id, genre:genre_id(genre_id, category, name))"
        )
        .order("album_id", { ascending: false }),
      supabase
        .from("single")
        .select(
          "single_id, title, artist_id, image_id, release, links, archive_id, artist:artist_id(name), single_genre(genre_id, genre:genre_id(genre_id, category, name))"
        )
        .order("single_id", { ascending: false }),
      supabase
        .from("lecture")
        .select(
          "lecture_id, album_id, season_id, date, rating, album:album_id(title, image_id, artist:artist_id(name)), season:season_id(name, color)"
        )
        .order("lecture_id", { ascending: false }),
      supabase
        .from("archive")
        .select(
          "archive_id, writer, rating, date, album(album_id, title, image_id, artist:artist_id(name)), single(single_id, title, image_id, artist:artist_id(name))"
        )
        .order("archive_id", { ascending: false }),
      supabase
        .from("comment")
        .select("comment_id, lecture_id, writer, rating, text, created_at")
        .order("comment_id", { ascending: false })
        .limit(200),
      supabase
        .from("review")
        .select("review_id, title, writer, type, views, created_at")
        .order("review_id", { ascending: false }),
      supabase
        .from("member")
        .select("member_id, name, created_at, modified_at")
        .order("member_id", { ascending: true }),
    ]);

    setArtists((artistsRes.data as unknown as ArtistRow[]) ?? []);
    setGenres((genresRes.data as unknown as GenreRow[]) ?? []);
    setSeasons((seasonsRes.data as unknown as SeasonRow[]) ?? []);
    setAlbums((albumsRes.data as unknown as AlbumRow[]) ?? []);
    setSingles((singlesRes.data as unknown as SingleRow[]) ?? []);
    setLectures((lecturesRes.data as unknown as LectureRow[]) ?? []);
    setArchives((archivesRes.data as unknown as ArchiveRow[]) ?? []);
    setComments((commentsRes.data as unknown as CommentRow[]) ?? []);
    setReviews((reviewsRes.data as unknown as ReviewRow[]) ?? []);
    setMembers((membersRes.data as unknown as MemberRow[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const handleLogout = async () => {
    await fetch("/api/admin/auth", { method: "DELETE" });
    const isSubdomain =
      typeof window !== "undefined" &&
      window.location.hostname.startsWith("admin.");
    window.location.href = isSubdomain ? "/login" : "/admin/login";
  };

  // ==================== 1. LECTURE & SEASON STATES ====================
  const [lectureSearch, setLectureSearch] = useState("");
  const [editingLectureId, setEditingLectureId] = useState<number | null>(null);
  const [lectureAlbumId, setLectureAlbumId] = useState<number>(0);
  const [lectureSeasonId, setLectureSeasonId] = useState<number>(0);
  const [lectureDate, setLectureDate] = useState<string>("");
  const [lectureRatingInput, setLectureRatingInput] = useState<string>("");

  const [editingSeasonId, setEditingSeasonId] = useState<number | null>(null);
  const [seasonName, setSeasonName] = useState("");
  const [seasonColor, setSeasonColor] = useState("242d3c");
  const [seasonImageId, setSeasonImageId] = useState("");

  // ==================== 2. ALBUM STATES ====================
  const [albumSearch, setAlbumSearch] = useState("");
  const [editingAlbumId, setEditingAlbumId] = useState<number | null>(null);
  const [albumTitle, setAlbumTitle] = useState("");
  const [albumArtistId, setAlbumArtistId] = useState<number>(0);
  const [albumRelease, setAlbumRelease] = useState("");
  const [albumImageId, setAlbumImageId] = useState("");
  const [albumTracksText, setAlbumTracksText] = useState("");
  const [albumGenreIds, setAlbumGenreIds] = useState<number[]>([]);
  const [albumYoutube, setAlbumYoutube] = useState("");
  const [albumSpotify, setAlbumSpotify] = useState("");
  const [uploadingAlbumImg, setUploadingAlbumImg] = useState(false);

  // ==================== 3. SINGLE STATES ====================
  const [singleSearch, setSingleSearch] = useState("");
  const [editingSingleId, setEditingSingleId] = useState<number | null>(null);
  const [singleTitle, setSingleTitle] = useState("");
  const [singleArtistId, setSingleArtistId] = useState<number>(0);
  const [singleRelease, setSingleRelease] = useState("");
  const [singleImageId, setSingleImageId] = useState("");
  const [singleGenreIds, setSingleGenreIds] = useState<number[]>([]);
  const [singleYoutube, setSingleYoutube] = useState("");
  const [singleSpotify, setSingleSpotify] = useState("");
  const [uploadingSingleImg, setUploadingSingleImg] = useState(false);

  // ==================== 4. ARCHIVE STATES ====================
  const [archiveSearch, setArchiveSearch] = useState("");
  const [editingArchiveId, setEditingArchiveId] = useState<number | null>(null);
  const [archiveType, setArchiveType] = useState<"album" | "single">("album");
  const [archiveTargetId, setArchiveTargetId] = useState<number>(0);
  const [archiveWriter, setArchiveWriter] = useState("");
  const [archiveRatingInput, setArchiveRatingInput] = useState("8.5");
  const [archiveDate, setArchiveDate] = useState("");

  // ==================== 5. ARTIST & GENRE STATES ====================
  const [artistSearch, setArtistSearch] = useState("");
  const [editingArtistId, setEditingArtistId] = useState<number | null>(null);
  const [artistName, setArtistName] = useState("");
  const [artistNameEn, setArtistNameEn] = useState("");
  const [artistPronounce, setArtistPronounce] = useState("");
  const [artistNation, setArtistNation] = useState("한국");

  const [editingGenreId, setEditingGenreId] = useState<number | null>(null);
  const [genreCategory, setGenreCategory] = useState<string>("ROCK");
  const [genreName, setGenreName] = useState("");

  // ==================== 6. MODERATION STATES ====================
  const [commentSearch, setCommentSearch] = useState("");

  // ==================== 7. MEMBER PASSWORD MANAGEMENT STATES ====================
  const [memberPasswords, setMemberPasswords] = useState<Record<number, string>>({});
  const [memberShowPw, setMemberShowPw] = useState<Record<number, boolean>>({});
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberPassword, setNewMemberPassword] = useState("");

  // Filtered lists
  const filteredLectures = useMemo(() => {
    const q = lectureSearch.trim().toLowerCase();
    if (!q) return lectures;
    return lectures.filter(
      (lt) =>
        String(lt.lecture_id).includes(q) ||
        (lt.album?.title ?? "").toLowerCase().includes(q) ||
        (lt.album?.artist?.name ?? "").toLowerCase().includes(q)
    );
  }, [lectures, lectureSearch]);

  const filteredAlbums = useMemo(() => {
    const q = albumSearch.trim().toLowerCase();
    if (!q) return albums;
    return albums.filter(
      (a) =>
        String(a.album_id).includes(q) ||
        a.title.toLowerCase().includes(q) ||
        (a.artist?.name ?? "").toLowerCase().includes(q)
    );
  }, [albums, albumSearch]);

  const filteredSingles = useMemo(() => {
    const q = singleSearch.trim().toLowerCase();
    if (!q) return singles;
    return singles.filter(
      (s) =>
        String(s.single_id).includes(q) ||
        s.title.toLowerCase().includes(q) ||
        (s.artist?.name ?? "").toLowerCase().includes(q)
    );
  }, [singles, singleSearch]);

  const filteredArchives = useMemo(() => {
    const q = archiveSearch.trim().toLowerCase();
    if (!q) return archives;
    return archives.filter((ar) => {
      const target = ar.album?.[0] ?? ar.single?.[0];
      return (
        String(ar.archive_id).includes(q) ||
        ar.writer.toLowerCase().includes(q) ||
        (target?.title ?? "").toLowerCase().includes(q) ||
        (target?.artist?.name ?? "").toLowerCase().includes(q)
      );
    });
  }, [archives, archiveSearch]);

  const filteredArtists = useMemo(() => {
    const q = artistSearch.trim().toLowerCase();
    if (!q) return artists;
    return artists.filter(
      (ar) =>
        ar.name.toLowerCase().includes(q) ||
        (ar.name_en ?? "").toLowerCase().includes(q) ||
        ar.nation.toLowerCase().includes(q)
    );
  }, [artists, artistSearch]);

  const filteredComments = useMemo(() => {
    const q = commentSearch.trim().toLowerCase();
    if (!q) return comments;
    return comments.filter(
      (c) =>
        String(c.lecture_id).includes(q) ||
        c.writer.toLowerCase().includes(q) ||
        c.text.toLowerCase().includes(q)
    );
  }, [comments, commentSearch]);

  // ==================== HANDLERS ====================
  const resetLectureForm = () => {
    setEditingLectureId(null);
    setLectureAlbumId(albums[0]?.album_id ?? 0);
    setLectureSeasonId(seasons[0]?.season_id ?? 0);
    setLectureDate("");
    setLectureRatingInput("");
  };

  const handleSaveLecture = async (e: React.FormEvent) => {
    e.preventDefault();
    const albumId = lectureAlbumId || albums[0]?.album_id;
    const seasonId = lectureSeasonId || seasons[0]?.season_id;
    if (!albumId || !seasonId) {
      showToast("error", "앨범과 시즌을 선택해 주세요.");
      return;
    }

    const parsedRating =
      lectureRatingInput.trim() === ""
        ? null
        : Math.round(Number(lectureRatingInput) * 1000);

    try {
      if (editingLectureId) {
        await runAdminAction("update_lecture", {
          lecture_id: editingLectureId,
          album_id: albumId,
          season_id: seasonId,
          date: lectureDate.trim() || null,
          rating: parsedRating,
        });
        showToast("success", `제 ${editingLectureId}회 음평회가 수정되었습니다.`);
      } else {
        await runAdminAction("create_lecture", {
          album_id: albumId,
          season_id: seasonId,
          date: lectureDate.trim() || null,
          rating: parsedRating,
        });
        showToast("success", "새 음평회가 등록되었습니다.");
      }
      resetLectureForm();
      await loadAllData();
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "오류 발생");
    }
  };

  const handleSaveSeason = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!seasonName.trim()) {
      showToast("error", "시즌 이름을 입력해 주세요.");
      return;
    }
    try {
      if (editingSeasonId) {
        await runAdminAction("update_season", {
          season_id: editingSeasonId,
          name: seasonName,
          color: seasonColor.replace(/^#/, ""),
          image_id: seasonImageId,
        });
        showToast("success", "시즌이 수정되었습니다.");
      } else {
        await runAdminAction("create_season", {
          name: seasonName,
          color: seasonColor.replace(/^#/, ""),
          image_id: seasonImageId,
        });
        showToast("success", "새 시즌이 등록되었습니다.");
      }
      setEditingSeasonId(null);
      setSeasonName("");
      setSeasonColor("242d3c");
      setSeasonImageId("");
      await loadAllData();
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "오류 발생");
    }
  };

  const resetAlbumForm = () => {
    setEditingAlbumId(null);
    setAlbumTitle("");
    setAlbumArtistId(artists[0]?.artist_id ?? 0);
    setAlbumRelease("");
    setAlbumImageId("");
    setAlbumTracksText("");
    setAlbumGenreIds([]);
    setAlbumYoutube("");
    setAlbumSpotify("");
  };

  const handleSaveAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    const artistId = albumArtistId || artists[0]?.artist_id;
    const releaseYear = albumRelease.trim();
    if (!albumTitle.trim() || !artistId || !releaseYear) {
      showToast("error", "앨범 제목, 아티스트, 출시 연도(yyyy)는 필수입니다.");
      return;
    }
    if (!/^\d{4}$/.test(releaseYear)) {
      showToast("error", "앨범 출시 일자는 4자리 연도(yyyy) 형식으로 입력해 주세요.");
      return;
    }

    const tracks = albumTracksText
      .split("\n")
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      const payload = {
        album_id: editingAlbumId,
        title: albumTitle,
        artist_id: artistId,
        image_id: albumImageId,
        release: releaseYear,
        tracks,
        genre_ids: albumGenreIds,
        links: {
          youtube: albumYoutube.trim() || null,
          spotify: albumSpotify.trim() || null,
        },
      };

      if (editingAlbumId) {
        await runAdminAction("update_album", payload);
        showToast("success", "앨범 정보가 수정되었습니다.");
      } else {
        await runAdminAction("create_album", payload);
        showToast("success", "새 앨범이 등록되었습니다.");
      }
      resetAlbumForm();
      await loadAllData();
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "오류 발생");
    }
  };

  const resetSingleForm = () => {
    setEditingSingleId(null);
    setSingleTitle("");
    setSingleArtistId(artists[0]?.artist_id ?? 0);
    setSingleRelease("");
    setSingleImageId("");
    setSingleGenreIds([]);
    setSingleYoutube("");
    setSingleSpotify("");
  };

  const handleSaveSingle = async (e: React.FormEvent) => {
    e.preventDefault();
    const artistId = singleArtistId || artists[0]?.artist_id;
    const releaseYear = singleRelease.trim();
    if (!singleTitle.trim() || !artistId || !releaseYear) {
      showToast("error", "싱글 제목, 아티스트, 출시 연도(yyyy)는 필수입니다.");
      return;
    }
    if (!/^\d{4}$/.test(releaseYear)) {
      showToast("error", "싱글 출시 일자는 4자리 연도(yyyy) 형식으로 입력해 주세요.");
      return;
    }

    try {
      const payload = {
        single_id: editingSingleId,
        title: singleTitle,
        artist_id: artistId,
        image_id: singleImageId,
        release: releaseYear,
        genre_ids: singleGenreIds,
        links: {
          youtube: singleYoutube.trim() || null,
          spotify: singleSpotify.trim() || null,
        },
      };

      if (editingSingleId) {
        await runAdminAction("update_single", payload);
        showToast("success", "싱글 정보가 수정되었습니다.");
      } else {
        await runAdminAction("create_single", payload);
        showToast("success", "새 싱글이 등록되었습니다.");
      }
      resetSingleForm();
      await loadAllData();
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "오류 발생");
    }
  };

  const handleSaveArchive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!archiveWriter.trim()) {
      showToast("error", "추천인(작성자)을 입력해 주세요.");
      return;
    }
    const ratingInt = Math.round(Number(archiveRatingInput) * 10);
    try {
      if (editingArchiveId) {
        await runAdminAction("update_archive", {
          archive_id: editingArchiveId,
          writer: archiveWriter,
          rating: ratingInt,
          date: archiveDate.trim() || null,
        });
        showToast("success", `아카이브 #${editingArchiveId} 수정 완료`);
      } else {
        if (!archiveTargetId) {
          showToast("error", "아카이브에 등록할 음반/싱글을 선택해 주세요.");
          return;
        }
        await runAdminAction("create_archive", {
          type: archiveType,
          target_id: archiveTargetId,
          writer: archiveWriter,
          rating: ratingInt,
          date: archiveDate.trim() || null,
        });
        showToast("success", "새 아카이브가 등록되었습니다.");
      }
      setEditingArchiveId(null);
      setArchiveWriter("");
      setArchiveRatingInput("8.5");
      setArchiveDate("");
      setArchiveTargetId(0);
      await loadAllData();
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "오류 발생");
    }
  };

  const handleSaveArtist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!artistName.trim() || !artistNation.trim()) {
      showToast("error", "아티스트 이름과 국가는 필수입니다.");
      return;
    }
    try {
      if (editingArtistId) {
        await runAdminAction("update_artist", {
          artist_id: editingArtistId,
          name: artistName,
          name_en: artistNameEn,
          pronounce: artistPronounce,
          nation: artistNation,
        });
        showToast("success", "아티스트가 수정되었습니다.");
      } else {
        await runAdminAction("create_artist", {
          name: artistName,
          name_en: artistNameEn,
          pronounce: artistPronounce,
          nation: artistNation,
        });
        showToast("success", "새 아티스트가 등록되었습니다.");
      }
      setEditingArtistId(null);
      setArtistName("");
      setArtistNameEn("");
      setArtistPronounce("");
      setArtistNation("한국");
      await loadAllData();
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "오류 발생");
    }
  };

  const handleSaveGenre = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!genreName.trim()) {
      showToast("error", "장르명을 입력해 주세요.");
      return;
    }
    try {
      if (editingGenreId) {
        await runAdminAction("update_genre", {
          genre_id: editingGenreId,
          category: genreCategory,
          name: genreName,
        });
        showToast("success", "장르가 수정되었습니다.");
      } else {
        await runAdminAction("create_genre", {
          category: genreCategory,
          name: genreName,
        });
        showToast("success", "새 장르가 등록되었습니다.");
      }
      setEditingGenreId(null);
      setGenreName("");
      await loadAllData();
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "오류 발생");
    }
  };

  const NAV_TABS: { id: AdminTab; label: string; count?: number; icon: typeof Disc3 }[] = [
    { id: "lectures", label: "음평회 · 시즌", count: lectures.length, icon: Disc3 },
    { id: "albums", label: "앨범 관리", count: albums.length, icon: Music },
    { id: "singles", label: "싱글 관리", count: singles.length, icon: Music },
    { id: "archives", label: "아카이브 관리", count: archives.length, icon: CirclePlay },
    {
      id: "artists_genres",
      label: "아티스트 · 장르",
      count: artists.length,
      icon: Users,
    },
    {
      id: "moderation",
      label: "한줄평 · 칼럼",
      count: reviews.length,
      icon: MessageSquare,
    },
    {
      id: "members",
      label: "멤버 · 비밀번호",
      count: members.length,
      icon: KeyRound,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#f6f7f9] text-[#171717]">
      {/* Top Admin Header */}
      <header className="sticky top-0 z-40 bg-[#242d3c] text-white border-b border-white/10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-stamp text-2xl tracking-wide text-[#ff8080]">
              MOONTOMI ADMIN
            </span>
            <span className="hidden sm:inline-block text-xs text-white/60 border-l border-white/20 pl-3">
              관리자 통합 콘솔
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={loadAllData}
              className="h-9 px-3 rounded-[7px] bg-white/10 hover:bg-white/20 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
              <span className="hidden sm:inline">새로고침</span>
            </button>
            <a
              href="https://moontomi.com"
              target="_blank"
              rel="noreferrer"
              className="h-9 px-3 rounded-[7px] bg-white/10 hover:bg-white/20 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
            >
              <span>메인 사이트</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              type="button"
              onClick={handleLogout}
              className="h-9 px-3 rounded-[7px] bg-[#ff8080] hover:bg-[#ff6666] text-white text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>로그아웃</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-[#1b222e] border-t border-white/10 overflow-x-auto no-scrollbar">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-1">
            {NAV_TABS.map((t) => {
              const Icon = t.icon;
              const active = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTab(t.id)}
                  className={cn(
                    "px-4 py-3 text-xs sm:text-sm font-bold whitespace-nowrap inline-flex items-center gap-2 border-b-2 transition-colors cursor-pointer",
                    active
                      ? "border-[#ff8080] text-[#ff8080] bg-white/5"
                      : "border-transparent text-white/70 hover:text-white"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{t.label}</span>
                  {typeof t.count === "number" && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-white/10 text-white/80">
                      {t.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Toast Notification */}
      {statusMsg && (
        <div className="fixed bottom-5 right-5 z-50">
          <div
            className={cn(
              "px-4 py-3 rounded-[8px] shadow-lg text-xs sm:text-sm font-bold flex items-center gap-2 border",
              statusMsg.type === "success"
                ? "bg-[#242d3c] text-white border-white/15"
                : "bg-red-600 text-white border-red-400"
            )}
          >
            <span>{statusMsg.text}</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* ==================== TAB 1: LECTURES & SEASONS ==================== */}
        {activeTab === "lectures" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Lecture Form + Season Form */}
            <div className="lg:col-span-4 space-y-6">
              {/* Lecture Form */}
              <form
                onSubmit={handleSaveLecture}
                className="bg-white rounded-[10px] border border-[#bdc0c4]/70 p-5 space-y-4 shadow-xs"
              >
                <div className="flex items-center justify-between border-b border-[#bdc0c4]/50 pb-3">
                  <h2 className="text-base font-bold text-[#242d3c]">
                    {editingLectureId
                      ? `제 ${editingLectureId}회 음평회 수정`
                      : "새 음평회 등록"}
                  </h2>
                  {editingLectureId && (
                    <button
                      type="button"
                      onClick={resetLectureForm}
                      className="text-xs text-[#808080] hover:text-[#242d3c] cursor-pointer"
                    >
                      신규 등록으로 전환
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#242d3c] mb-1">
                    대상 앨범 선택
                  </label>
                  <select
                    value={lectureAlbumId || albums[0]?.album_id || 0}
                    onChange={(e) => setLectureAlbumId(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-[7px] border border-[#bdc0c4] text-xs bg-white"
                  >
                    {albums.map((a) => (
                      <option key={a.album_id} value={a.album_id}>
                        #{a.album_id} — {a.title} ({a.artist?.name})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#242d3c] mb-1">
                    시즌 선택
                  </label>
                  <select
                    value={lectureSeasonId || seasons[0]?.season_id || 0}
                    onChange={(e) => setLectureSeasonId(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-[7px] border border-[#bdc0c4] text-xs bg-white"
                  >
                    {seasons.map((s) => (
                      <option key={s.season_id} value={s.season_id}>
                        #{s.season_id} — {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#242d3c] mb-1">
                      개시일 (비워두면 비공개)
                    </label>
                    <input
                      type="date"
                      value={lectureDate}
                      onChange={(e) => setLectureDate(e.target.value)}
                      className="w-full h-10 px-3 rounded-[7px] border border-[#bdc0c4] text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#242d3c] mb-1">
                      평점 (0.000 ~ 10.000)
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      min="0"
                      max="10"
                      placeholder="비워두면 비공개"
                      value={lectureRatingInput}
                      onChange={(e) => setLectureRatingInput(e.target.value)}
                      className="w-full h-10 px-3 rounded-[7px] border border-[#bdc0c4] text-xs"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full h-10 rounded-[7px] bg-[#242d3c] hover:bg-[#ff8080] text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{editingLectureId ? "음평회 수정 저장" : "음평회 등록"}</span>
                </button>
              </form>

              {/* Season Management */}
              <div className="bg-white rounded-[10px] border border-[#bdc0c4]/70 p-5 space-y-4 shadow-xs">
                <h2 className="text-base font-bold text-[#242d3c] border-b border-[#bdc0c4]/50 pb-3">
                  시즌(Season) 관리
                </h2>
                <form onSubmit={handleSaveSeason} className="space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="시즌 이름 (예: 시즌 18)"
                      value={seasonName}
                      onChange={(e) => setSeasonName(e.target.value)}
                      className="col-span-2 h-9 px-3 rounded-[7px] border border-[#bdc0c4] text-xs"
                    />
                    <input
                      type="text"
                      placeholder="HEX 색상 (예: 242d3c)"
                      value={seasonColor}
                      onChange={(e) => setSeasonColor(e.target.value)}
                      className="h-9 px-3 rounded-[7px] border border-[#bdc0c4] text-xs font-mono"
                    />
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="시즌 이미지 URL 또는 파일명"
                      value={seasonImageId}
                      onChange={(e) => setSeasonImageId(e.target.value)}
                      className="flex-1 h-9 px-3 rounded-[7px] border border-[#bdc0c4] text-xs"
                    />
                    <button
                      type="submit"
                      className="h-9 px-4 rounded-[7px] bg-[#242d3c] hover:bg-[#ff8080] text-white text-xs font-bold cursor-pointer"
                    >
                      {editingSeasonId ? "수정" : "추가"}
                    </button>
                  </div>
                </form>

                <div className="max-h-52 overflow-y-auto divide-y divide-[#bdc0c4]/40 border-t border-[#bdc0c4]/40 pt-2">
                  {seasons.map((s) => (
                    <div
                      key={s.season_id}
                      className="py-2 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/10"
                          style={{
                            backgroundColor: `#${s.color.replace(/^#/, "")}`,
                          }}
                        />
                        <span className="font-bold text-[#242d3c]">
                          #{s.season_id} {s.name}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingSeasonId(s.season_id);
                          setSeasonName(s.name);
                          setSeasonColor(s.color);
                          setSeasonImageId(s.image_id);
                        }}
                        className="text-[#808080] hover:text-[#242d3c] cursor-pointer"
                      >
                        수정
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Lecture List */}
            <div className="lg:col-span-8 bg-white rounded-[10px] border border-[#bdc0c4]/70 p-5 space-y-4 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#bdc0c4]/50 pb-3">
                <h2 className="text-base font-bold text-[#242d3c]">
                  역대 음평회 목록 ({filteredLectures.length}개)
                </h2>
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-[#808080] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="회차, 앨범명, 아티스트 검색..."
                    value={lectureSearch}
                    onChange={(e) => setLectureSearch(e.target.value)}
                    className="w-full h-9 pl-9 pr-3 rounded-[7px] border border-[#bdc0c4] text-xs"
                  />
                </div>
              </div>

              <div className="divide-y divide-[#bdc0c4]/40 max-h-[700px] overflow-y-auto">
                {filteredLectures.map((lt) => {
                  const isPublic = lt.rating !== null;
                  return (
                    <div
                      key={lt.lecture_id}
                      className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={getImageUrl(lt.album?.image_id)}
                          alt={lt.album?.title ?? ""}
                          className="w-12 h-12 rounded-[6px] object-cover border border-[#bdc0c4]/50 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-[#242d3c]">
                              제 {lt.lecture_id}회
                            </span>
                            <span
                              className={cn(
                                "px-2 py-0.5 rounded-full text-[10px] font-bold",
                                isPublic
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-amber-100 text-amber-800"
                              )}
                            >
                              {isPublic
                                ? `공개됨 · ${(lt.rating! / 1000).toFixed(2)}`
                                : "비공개 (평점 집계 전)"}
                            </span>
                            {lt.season?.name && (
                              <span className="text-[11px] text-[#808080]">
                                {lt.season.name}
                              </span>
                            )}
                          </div>
                          <div className="text-sm font-bold text-[#171717] truncate mt-0.5">
                            {lt.album?.title}
                          </div>
                          <div className="text-xs text-[#808080] truncate">
                            {lt.album?.artist?.name} · 개시일: {lt.date || "미정"}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                        {!isPublic ? (
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                await runAdminAction("make_lecture_public", {
                                  lecture_id: lt.lecture_id,
                                });
                                showToast(
                                  "success",
                                  `제 ${lt.lecture_id}회 음평회가 공개 전환되었습니다.`
                                );
                                await loadAllData();
                              } catch (err) {
                                showToast(
                                  "error",
                                  err instanceof Error ? err.message : "오류"
                                );
                              }
                            }}
                            className="h-8 px-2.5 rounded-[6px] bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>공개 전환</span>
                          </button>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={async () => {
                                try {
                                  await runAdminAction(
                                    "recalculate_lecture_rating",
                                    { lecture_id: lt.lecture_id }
                                  );
                                  showToast(
                                    "success",
                                    `제 ${lt.lecture_id}회 평점이 재계산되었습니다.`
                                  );
                                  await loadAllData();
                                } catch (err) {
                                  showToast(
                                    "error",
                                    err instanceof Error ? err.message : "오류"
                                  );
                                }
                              }}
                              className="h-8 px-2.5 rounded-[6px] bg-[#242d3c] hover:bg-[#364358] text-white text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                            >
                              <RefreshCw className="w-3 h-3" />
                              <span>평점 재집계</span>
                            </button>
                            <button
                              type="button"
                              onClick={async () => {
                                try {
                                  await runAdminAction("make_lecture_private", {
                                    lecture_id: lt.lecture_id,
                                  });
                                  showToast(
                                    "success",
                                    `제 ${lt.lecture_id}회 음평회가 비공개로 전환되었습니다.`
                                  );
                                  await loadAllData();
                                } catch (err) {
                                  showToast(
                                    "error",
                                    err instanceof Error ? err.message : "오류"
                                  );
                                }
                              }}
                              className="h-8 px-2.5 rounded-[6px] bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                            >
                              <EyeOff className="w-3.5 h-3.5" />
                              <span>비공개</span>
                            </button>
                          </>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            setEditingLectureId(lt.lecture_id);
                            setLectureAlbumId(lt.album_id);
                            setLectureSeasonId(lt.season_id);
                            setLectureDate(lt.date ?? "");
                            setLectureRatingInput(
                              lt.rating !== null
                                ? (lt.rating / 1000).toString()
                                : ""
                            );
                          }}
                          className="h-8 px-2.5 rounded-[6px] border border-[#bdc0c4] hover:bg-[#f3f3f3] text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          <span>수정</span>
                        </button>

                        <button
                          type="button"
                          onClick={async () => {
                            if (
                              !window.confirm(
                                `정말 제 ${lt.lecture_id}회 음평회를 삭제하시겠습니까?`
                              )
                            )
                              return;
                            try {
                              await runAdminAction("delete_lecture", {
                                lecture_id: lt.lecture_id,
                              });
                              showToast("success", "삭제되었습니다.");
                              await loadAllData();
                            } catch (err) {
                              showToast(
                                "error",
                                err instanceof Error ? err.message : "오류"
                              );
                            }
                          }}
                          className="h-8 px-2 rounded-[6px] border border-red-200 text-red-600 hover:bg-red-50 text-xs inline-flex items-center cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 2: ALBUMS ==================== */}
        {activeTab === "albums" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Album Form */}
            <form
              onSubmit={handleSaveAlbum}
              className="lg:col-span-5 bg-white rounded-[10px] border border-[#bdc0c4]/70 p-5 space-y-4 shadow-xs"
            >
              <div className="flex items-center justify-between border-b border-[#bdc0c4]/50 pb-3">
                <h2 className="text-base font-bold text-[#242d3c]">
                  {editingAlbumId ? `앨범 #${editingAlbumId} 수정` : "새 앨범 등록"}
                </h2>
                {editingAlbumId && (
                  <button
                    type="button"
                    onClick={resetAlbumForm}
                    className="text-xs text-[#808080] hover:text-[#242d3c] cursor-pointer"
                  >
                    신규 등록으로 전환
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#242d3c] mb-1">
                    앨범명 *
                  </label>
                  <input
                    type="text"
                    required
                    value={albumTitle}
                    onChange={(e) => setAlbumTitle(e.target.value)}
                    placeholder="앨범 제목"
                    className="w-full h-10 px-3 rounded-[7px] border border-[#bdc0c4] text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#242d3c] mb-1">
                    출시 연도 (yyyy) *
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="\d{4}"
                    maxLength={4}
                    required
                    value={albumRelease}
                    onChange={(e) =>
                      setAlbumRelease(e.target.value.replace(/\D/g, "").slice(0, 4))
                    }
                    placeholder="예: 2024"
                    className="w-full h-10 px-3 rounded-[7px] border border-[#bdc0c4] text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#242d3c] mb-1">
                  아티스트 *
                </label>
                <select
                  value={albumArtistId || artists[0]?.artist_id || 0}
                  onChange={(e) => setAlbumArtistId(Number(e.target.value))}
                  className="w-full h-10 px-3 rounded-[7px] border border-[#bdc0c4] text-xs bg-white"
                >
                  {artists.map((ar) => (
                    <option key={ar.artist_id} value={ar.artist_id}>
                      #{ar.artist_id} — {ar.name}{" "}
                      {ar.name_en ? `(${ar.name_en})` : ""} [{ar.nation}]
                    </option>
                  ))}
                </select>
              </div>

              {/* Cover Upload */}
              <div>
                <label className="block text-xs font-bold text-[#242d3c] mb-1">
                  앨범 커버 이미지
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={albumImageId}
                    onChange={(e) => setAlbumImageId(e.target.value)}
                    placeholder="이미지 URL 또는 업로드"
                    className="flex-1 h-10 px-3 rounded-[7px] border border-[#bdc0c4] text-xs"
                  />
                  <label className="h-10 px-3 rounded-[7px] bg-[#242d3c] hover:bg-[#ff8080] text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingAlbumImg ? "업로드 중..." : "파일 선택"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setUploadingAlbumImg(true);
                        try {
                          const url = await uploadImageToStorage(file);
                          setAlbumImageId(url);
                          showToast("success", "커버 이미지가 업로드되었습니다.");
                        } catch (err) {
                          showToast(
                            "error",
                            err instanceof Error ? err.message : "업로드 실패"
                          );
                        } finally {
                          setUploadingAlbumImg(false);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Tracklist */}
              <div>
                <label className="block text-xs font-bold text-[#242d3c] mb-1">
                  트랙리스트 (한 줄에 한 곡씩 입력)
                </label>
                <textarea
                  rows={5}
                  value={albumTracksText}
                  onChange={(e) => setAlbumTracksText(e.target.value)}
                  placeholder={"1번 트랙 제목\n2번 트랙 제목\n3번 트랙 제목"}
                  className="w-full p-3 rounded-[7px] border border-[#bdc0c4] text-xs leading-relaxed"
                />
              </div>

              {/* External Links */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#242d3c] mb-1">
                    YouTube 링크
                  </label>
                  <input
                    type="text"
                    value={albumYoutube}
                    onChange={(e) => setAlbumYoutube(e.target.value)}
                    placeholder="https://youtube.com/..."
                    className="w-full h-9 px-3 rounded-[7px] border border-[#bdc0c4] text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#242d3c] mb-1">
                    Spotify 링크
                  </label>
                  <input
                    type="text"
                    value={albumSpotify}
                    onChange={(e) => setAlbumSpotify(e.target.value)}
                    placeholder="https://open.spotify.com/..."
                    className="w-full h-9 px-3 rounded-[7px] border border-[#bdc0c4] text-xs"
                  />
                </div>
              </div>

              {/* Genre Selector */}
              <div>
                <label className="block text-xs font-bold text-[#242d3c] mb-1.5">
                  장르 선택 ({albumGenreIds.length}개 선택됨)
                </label>
                <div className="max-h-48 overflow-y-auto p-3 rounded-[7px] border border-[#bdc0c4] bg-[#f9fafb] space-y-2.5">
                  {GENRE_CATEGORIES.map((cat) => {
                    const catGenres = genres.filter((g) => g.category === cat);
                    if (catGenres.length === 0) return null;
                    return (
                      <div key={cat}>
                        <div className="text-[10px] font-bold text-[#808080] mb-1">
                          {cat}
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {catGenres.map((g) => {
                            const selected = albumGenreIds.includes(g.genre_id);
                            return (
                              <button
                                key={g.genre_id}
                                type="button"
                                onClick={() =>
                                  setAlbumGenreIds((prev) =>
                                    selected
                                      ? prev.filter((id) => id !== g.genre_id)
                                      : [...prev, g.genre_id]
                                  )
                                }
                                className={cn(
                                  "px-2 py-1 rounded-[5px] text-[11px] font-semibold border transition-colors cursor-pointer",
                                  selected
                                    ? "bg-[#242d3c] text-white border-[#242d3c]"
                                    : "bg-white text-[#242d3c] border-[#bdc0c4] hover:border-[#242d3c]"
                                )}
                              >
                                {g.name}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                className="w-full h-10 rounded-[7px] bg-[#242d3c] hover:bg-[#ff8080] text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>{editingAlbumId ? "앨범 수정 저장" : "새 앨범 등록"}</span>
              </button>
            </form>

            {/* Album List */}
            <div className="lg:col-span-7 bg-white rounded-[10px] border border-[#bdc0c4]/70 p-5 space-y-4 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#bdc0c4]/50 pb-3">
                <h2 className="text-base font-bold text-[#242d3c]">
                  등록된 앨범 ({filteredAlbums.length}개)
                </h2>
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-[#808080] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="앨범명, 아티스트 검색..."
                    value={albumSearch}
                    onChange={(e) => setAlbumSearch(e.target.value)}
                    className="w-full h-9 pl-9 pr-3 rounded-[7px] border border-[#bdc0c4] text-xs"
                  />
                </div>
              </div>

              <div className="divide-y divide-[#bdc0c4]/40 max-h-[720px] overflow-y-auto">
                {filteredAlbums.map((a) => (
                  <div
                    key={a.album_id}
                    className="py-3 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={getImageUrl(a.image_id)}
                        alt={a.title}
                        className="w-12 h-12 rounded-[6px] object-cover border border-[#bdc0c4]/50 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-[#808080]">
                          #{a.album_id} · {a.release} · 트랙{" "}
                          {Array.isArray(a.tracks) ? a.tracks.length : 0}곡
                        </div>
                        <div className="text-sm font-bold text-[#171717] truncate">
                          {a.title}
                        </div>
                        <div className="text-xs text-[#242d3c] truncate">
                          {a.artist?.name}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingAlbumId(a.album_id);
                          setAlbumTitle(a.title);
                          setAlbumArtistId(a.artist_id);
                          setAlbumRelease(a.release);
                          setAlbumImageId(a.image_id);
                          setAlbumTracksText(
                            Array.isArray(a.tracks) ? a.tracks.join("\n") : ""
                          );
                          setAlbumGenreIds(
                            (a.album_genre ?? []).map((ag) => ag.genre_id)
                          );
                          setAlbumYoutube(a.links?.youtube ?? "");
                          setAlbumSpotify(a.links?.spotify ?? "");
                        }}
                        className="h-8 px-2.5 rounded-[6px] border border-[#bdc0c4] hover:bg-[#f3f3f3] text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>수정</span>
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          if (
                            !window.confirm(
                              `정말 '${a.title}' 앨범을 삭제하시겠습니까?`
                            )
                          )
                            return;
                          try {
                            await runAdminAction("delete_album", {
                              album_id: a.album_id,
                            });
                            showToast("success", "앨범이 삭제되었습니다.");
                            await loadAllData();
                          } catch (err) {
                            showToast(
                              "error",
                              err instanceof Error ? err.message : "오류"
                            );
                          }
                        }}
                        className="h-8 px-2 rounded-[6px] border border-red-200 text-red-600 hover:bg-red-50 text-xs inline-flex items-center cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 3: SINGLES ==================== */}
        {activeTab === "singles" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <form
              onSubmit={handleSaveSingle}
              className="lg:col-span-5 bg-white rounded-[10px] border border-[#bdc0c4]/70 p-5 space-y-4 shadow-xs"
            >
              <div className="flex items-center justify-between border-b border-[#bdc0c4]/50 pb-3">
                <h2 className="text-base font-bold text-[#242d3c]">
                  {editingSingleId
                    ? `싱글 #${editingSingleId} 수정`
                    : "새 싱글 등록"}
                </h2>
                {editingSingleId && (
                  <button
                    type="button"
                    onClick={resetSingleForm}
                    className="text-xs text-[#808080] hover:text-[#242d3c] cursor-pointer"
                  >
                    신규 등록으로 전환
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#242d3c] mb-1">
                    싱글 제목 *
                  </label>
                  <input
                    type="text"
                    required
                    value={singleTitle}
                    onChange={(e) => setSingleTitle(e.target.value)}
                    placeholder="싱글 제목"
                    className="w-full h-10 px-3 rounded-[7px] border border-[#bdc0c4] text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#242d3c] mb-1">
                    출시 연도 (yyyy) *
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="\d{4}"
                    maxLength={4}
                    required
                    value={singleRelease}
                    onChange={(e) =>
                      setSingleRelease(e.target.value.replace(/\D/g, "").slice(0, 4))
                    }
                    placeholder="예: 2024"
                    className="w-full h-10 px-3 rounded-[7px] border border-[#bdc0c4] text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#242d3c] mb-1">
                  아티스트 *
                </label>
                <select
                  value={singleArtistId || artists[0]?.artist_id || 0}
                  onChange={(e) => setSingleArtistId(Number(e.target.value))}
                  className="w-full h-10 px-3 rounded-[7px] border border-[#bdc0c4] text-xs bg-white"
                >
                  {artists.map((ar) => (
                    <option key={ar.artist_id} value={ar.artist_id}>
                      #{ar.artist_id} — {ar.name}{" "}
                      {ar.name_en ? `(${ar.name_en})` : ""} [{ar.nation}]
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#242d3c] mb-1">
                  싱글 커버 이미지
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={singleImageId}
                    onChange={(e) => setSingleImageId(e.target.value)}
                    placeholder="이미지 URL 또는 업로드"
                    className="flex-1 h-10 px-3 rounded-[7px] border border-[#bdc0c4] text-xs"
                  />
                  <label className="h-10 px-3 rounded-[7px] bg-[#242d3c] hover:bg-[#ff8080] text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>
                      {uploadingSingleImg ? "업로드 중..." : "파일 선택"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setUploadingSingleImg(true);
                        try {
                          const url = await uploadImageToStorage(file);
                          setSingleImageId(url);
                          showToast("success", "이미지가 업로드되었습니다.");
                        } catch (err) {
                          showToast(
                            "error",
                            err instanceof Error ? err.message : "업로드 실패"
                          );
                        } finally {
                          setUploadingSingleImg(false);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#242d3c] mb-1">
                    YouTube 링크
                  </label>
                  <input
                    type="text"
                    value={singleYoutube}
                    onChange={(e) => setSingleYoutube(e.target.value)}
                    placeholder="https://youtube.com/..."
                    className="w-full h-9 px-3 rounded-[7px] border border-[#bdc0c4] text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#242d3c] mb-1">
                    Spotify 링크
                  </label>
                  <input
                    type="text"
                    value={singleSpotify}
                    onChange={(e) => setSingleSpotify(e.target.value)}
                    placeholder="https://open.spotify.com/..."
                    className="w-full h-9 px-3 rounded-[7px] border border-[#bdc0c4] text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#242d3c] mb-1.5">
                  장르 선택 ({singleGenreIds.length}개 선택됨)
                </label>
                <div className="max-h-48 overflow-y-auto p-3 rounded-[7px] border border-[#bdc0c4] bg-[#f9fafb] space-y-2.5">
                  {GENRE_CATEGORIES.map((cat) => {
                    const catGenres = genres.filter((g) => g.category === cat);
                    if (catGenres.length === 0) return null;
                    return (
                      <div key={cat}>
                        <div className="text-[10px] font-bold text-[#808080] mb-1">
                          {cat}
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {catGenres.map((g) => {
                            const selected = singleGenreIds.includes(g.genre_id);
                            return (
                              <button
                                key={g.genre_id}
                                type="button"
                                onClick={() =>
                                  setSingleGenreIds((prev) =>
                                    selected
                                      ? prev.filter((id) => id !== g.genre_id)
                                      : [...prev, g.genre_id]
                                  )
                                }
                                className={cn(
                                  "px-2 py-1 rounded-[5px] text-[11px] font-semibold border transition-colors cursor-pointer",
                                  selected
                                    ? "bg-[#242d3c] text-white border-[#242d3c]"
                                    : "bg-white text-[#242d3c] border-[#bdc0c4] hover:border-[#242d3c]"
                                )}
                              >
                                {g.name}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                className="w-full h-10 rounded-[7px] bg-[#242d3c] hover:bg-[#ff8080] text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>
                  {editingSingleId ? "싱글 수정 저장" : "새 싱글 등록"}
                </span>
              </button>
            </form>

            <div className="lg:col-span-7 bg-white rounded-[10px] border border-[#bdc0c4]/70 p-5 space-y-4 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#bdc0c4]/50 pb-3">
                <h2 className="text-base font-bold text-[#242d3c]">
                  등록된 싱글 ({filteredSingles.length}개)
                </h2>
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-[#808080] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="싱글명, 아티스트 검색..."
                    value={singleSearch}
                    onChange={(e) => setSingleSearch(e.target.value)}
                    className="w-full h-9 pl-9 pr-3 rounded-[7px] border border-[#bdc0c4] text-xs"
                  />
                </div>
              </div>

              <div className="divide-y divide-[#bdc0c4]/40 max-h-[700px] overflow-y-auto">
                {filteredSingles.map((s) => (
                  <div
                    key={s.single_id}
                    className="py-3 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={getImageUrl(s.image_id)}
                        alt={s.title}
                        className="w-12 h-12 rounded-[6px] object-cover border border-[#bdc0c4]/50 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-[#808080]">
                          #{s.single_id} · {s.release}
                        </div>
                        <div className="text-sm font-bold text-[#171717] truncate">
                          {s.title}
                        </div>
                        <div className="text-xs text-[#242d3c] truncate">
                          {s.artist?.name}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingSingleId(s.single_id);
                          setSingleTitle(s.title);
                          setSingleArtistId(s.artist_id);
                          setSingleRelease(s.release);
                          setSingleImageId(s.image_id);
                          setSingleGenreIds(
                            (s.single_genre ?? []).map((sg) => sg.genre_id)
                          );
                          setSingleYoutube(s.links?.youtube ?? "");
                          setSingleSpotify(s.links?.spotify ?? "");
                        }}
                        className="h-8 px-2.5 rounded-[6px] border border-[#bdc0c4] hover:bg-[#f3f3f3] text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>수정</span>
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          if (
                            !window.confirm(
                              `정말 '${s.title}' 싱글을 삭제하시겠습니까?`
                            )
                          )
                            return;
                          try {
                            await runAdminAction("delete_single", {
                              single_id: s.single_id,
                            });
                            showToast("success", "싱글이 삭제되었습니다.");
                            await loadAllData();
                          } catch (err) {
                            showToast(
                              "error",
                              err instanceof Error ? err.message : "오류"
                            );
                          }
                        }}
                        className="h-8 px-2 rounded-[6px] border border-red-200 text-red-600 hover:bg-red-50 text-xs inline-flex items-center cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 4: ARCHIVES ==================== */}
        {activeTab === "archives" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <form
              onSubmit={handleSaveArchive}
              className="lg:col-span-4 bg-white rounded-[10px] border border-[#bdc0c4]/70 p-5 space-y-4 shadow-xs h-fit"
            >
              <div className="flex items-center justify-between border-b border-[#bdc0c4]/50 pb-3">
                <h2 className="text-base font-bold text-[#242d3c]">
                  {editingArchiveId
                    ? `아카이브 #${editingArchiveId} 수정`
                    : "새 아카이브 등록"}
                </h2>
                {editingArchiveId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingArchiveId(null);
                      setArchiveWriter("");
                      setArchiveRatingInput("8.5");
                      setArchiveDate("");
                    }}
                    className="text-xs text-[#808080] hover:text-[#242d3c] cursor-pointer"
                  >
                    신규 등록으로 전환
                  </button>
                )}
              </div>

              {!editingArchiveId && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-[#242d3c] mb-1">
                      유형 선택
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {(["album", "single"] as const).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => {
                            setArchiveType(t);
                            setArchiveTargetId(0);
                          }}
                          className={cn(
                            "h-9 rounded-[7px] text-xs font-bold border uppercase cursor-pointer",
                            archiveType === t
                              ? "bg-[#242d3c] text-white border-[#242d3c]"
                              : "bg-white text-[#242d3c] border-[#bdc0c4]"
                          )}
                        >
                          {t === "album" ? "ALBUM (정규/EP)" : "SINGLE (싱글)"}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#242d3c] mb-1">
                      대상 {archiveType === "album" ? "앨범" : "싱글"} 선택 (미등록 항목)
                    </label>
                    <select
                      value={archiveTargetId}
                      onChange={(e) =>
                        setArchiveTargetId(Number(e.target.value))
                      }
                      className="w-full h-10 px-3 rounded-[7px] border border-[#bdc0c4] text-xs bg-white"
                    >
                      <option value={0}>-- 선택해 주세요 --</option>
                      {archiveType === "album"
                        ? albums
                            .filter((a) => a.archive_id === null)
                            .map((a) => (
                              <option key={a.album_id} value={a.album_id}>
                                #{a.album_id} — {a.title} ({a.artist?.name})
                              </option>
                            ))
                        : singles
                            .filter((s) => s.archive_id === null)
                            .map((s) => (
                              <option key={s.single_id} value={s.single_id}>
                                #{s.single_id} — {s.title} ({s.artist?.name})
                              </option>
                            ))}
                    </select>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-bold text-[#242d3c] mb-1">
                  추천인 (작성자) *
                </label>
                <input
                  type="text"
                  required
                  value={archiveWriter}
                  onChange={(e) => setArchiveWriter(e.target.value)}
                  placeholder="추천인 닉네임"
                  className="w-full h-10 px-3 rounded-[7px] border border-[#bdc0c4] text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#242d3c] mb-1">
                    평점 (0.0 ~ 10.0) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    required
                    value={archiveRatingInput}
                    onChange={(e) => setArchiveRatingInput(e.target.value)}
                    className="w-full h-10 px-3 rounded-[7px] border border-[#bdc0c4] text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#242d3c] mb-1">
                    등록일 (선택)
                  </label>
                  <input
                    type="date"
                    value={archiveDate}
                    onChange={(e) => setArchiveDate(e.target.value)}
                    className="w-full h-10 px-3 rounded-[7px] border border-[#bdc0c4] text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full h-10 rounded-[7px] bg-[#242d3c] hover:bg-[#ff8080] text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>
                  {editingArchiveId ? "아카이브 수정 저장" : "아카이브 등록"}
                </span>
              </button>
            </form>

            <div className="lg:col-span-8 bg-white rounded-[10px] border border-[#bdc0c4]/70 p-5 space-y-4 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#bdc0c4]/50 pb-3">
                <h2 className="text-base font-bold text-[#242d3c]">
                  아카이브 목록 ({filteredArchives.length}개)
                </h2>
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-[#808080] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="곡/앨범명, 추천인 검색..."
                    value={archiveSearch}
                    onChange={(e) => setArchiveSearch(e.target.value)}
                    className="w-full h-9 pl-9 pr-3 rounded-[7px] border border-[#bdc0c4] text-xs"
                  />
                </div>
              </div>

              <div className="divide-y divide-[#bdc0c4]/40 max-h-[700px] overflow-y-auto">
                {filteredArchives.map((ar) => {
                  const albumItem = ar.album?.[0];
                  const singleItem = ar.single?.[0];
                  const isAlbum = Boolean(albumItem);
                  const target = albumItem ?? singleItem;
                  return (
                    <div
                      key={ar.archive_id}
                      className="py-3 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={getImageUrl(target?.image_id)}
                          alt={target?.title ?? ""}
                          className="w-12 h-12 rounded-[6px] object-cover border border-[#bdc0c4]/50 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[#242d3c]">
                              #{ar.archive_id}
                            </span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#242d3c]/10 text-[#242d3c]">
                              {isAlbum ? "ALBUM" : "SINGLE"}
                            </span>
                            <span className="text-xs font-bold text-[#ff8080]">
                              ★ {(ar.rating / 10).toFixed(1)}
                            </span>
                          </div>
                          <div className="text-sm font-bold text-[#171717] truncate">
                            {target?.title ?? "(연결된 음반 없음)"}
                          </div>
                          <div className="text-xs text-[#808080] truncate">
                            {target?.artist?.name} · 추천인: {ar.writer} ·{" "}
                            {ar.date}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingArchiveId(ar.archive_id);
                            setArchiveWriter(ar.writer);
                            setArchiveRatingInput((ar.rating / 10).toString());
                            setArchiveDate(ar.date);
                          }}
                          className="h-8 px-2.5 rounded-[6px] border border-[#bdc0c4] hover:bg-[#f3f3f3] text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          <span>수정</span>
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            if (
                              !window.confirm(
                                `아카이브 #${ar.archive_id} 항목을 삭제하시겠습니까?`
                              )
                            )
                              return;
                            try {
                              await runAdminAction("delete_archive", {
                                archive_id: ar.archive_id,
                              });
                              showToast("success", "아카이브가 삭제되었습니다.");
                              await loadAllData();
                            } catch (err) {
                              showToast(
                                "error",
                                err instanceof Error ? err.message : "오류"
                              );
                            }
                          }}
                          className="h-8 px-2 rounded-[6px] border border-red-200 text-red-600 hover:bg-red-50 text-xs inline-flex items-center cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 5: ARTISTS & GENRES ==================== */}
        {activeTab === "artists_genres" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Artists Column */}
            <div className="lg:col-span-7 bg-white rounded-[10px] border border-[#bdc0c4]/70 p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-[#bdc0c4]/50 pb-3">
                <h2 className="text-base font-bold text-[#242d3c]">
                  아티스트 관리 ({artists.length}명)
                </h2>
                {editingArtistId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingArtistId(null);
                      setArtistName("");
                      setArtistNameEn("");
                      setArtistPronounce("");
                      setArtistNation("한국");
                    }}
                    className="text-xs text-[#808080] hover:text-[#242d3c] cursor-pointer"
                  >
                    신규 등록으로 전환
                  </button>
                )}
              </div>

              <form
                onSubmit={handleSaveArtist}
                className="grid grid-cols-1 sm:grid-cols-5 gap-2 bg-[#f9fafb] p-3 rounded-[8px] border border-[#bdc0c4]/50"
              >
                <input
                  type="text"
                  required
                  placeholder="표기명 (필수)"
                  value={artistName}
                  onChange={(e) => setArtistName(e.target.value)}
                  className="h-9 px-3 rounded-[6px] border border-[#bdc0c4] bg-white text-xs"
                />
                <input
                  type="text"
                  placeholder="영문명 (선택)"
                  value={artistNameEn}
                  onChange={(e) => setArtistNameEn(e.target.value)}
                  className="h-9 px-3 rounded-[6px] border border-[#bdc0c4] bg-white text-xs"
                />
                <input
                  type="text"
                  placeholder="발음/읽기 (선택)"
                  value={artistPronounce}
                  onChange={(e) => setArtistPronounce(e.target.value)}
                  className="h-9 px-3 rounded-[6px] border border-[#bdc0c4] bg-white text-xs"
                />
                <input
                  type="text"
                  required
                  placeholder="국가 (예: 한국, 미국)"
                  value={artistNation}
                  onChange={(e) => setArtistNation(e.target.value)}
                  className="h-9 px-3 rounded-[6px] border border-[#bdc0c4] bg-white text-xs"
                />
                <button
                  type="submit"
                  className="h-9 px-3 rounded-[6px] bg-[#242d3c] hover:bg-[#ff8080] text-white text-xs font-bold cursor-pointer"
                >
                  {editingArtistId ? "수정 저장" : "아티스트 추가"}
                </button>
              </form>

              <div className="relative">
                <Search className="w-4 h-4 text-[#808080] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="아티스트 이름, 국가 검색..."
                  value={artistSearch}
                  onChange={(e) => setArtistSearch(e.target.value)}
                  className="w-full h-9 pl-9 pr-3 rounded-[7px] border border-[#bdc0c4] text-xs"
                />
              </div>

              <div className="divide-y divide-[#bdc0c4]/40 max-h-[540px] overflow-y-auto">
                {filteredArtists.map((ar) => (
                  <div
                    key={ar.artist_id}
                    className="py-2.5 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-[#242d3c]">
                        #{ar.artist_id} {ar.name}
                      </span>
                      {ar.name_en && (
                        <span className="text-[#808080] ml-1.5">
                          ({ar.name_en})
                        </span>
                      )}
                      <span className="ml-2 px-1.5 py-0.5 rounded bg-[#f3f3f3] text-[#242d3c] font-semibold">
                        {ar.nation}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingArtistId(ar.artist_id);
                          setArtistName(ar.name);
                          setArtistNameEn(ar.name_en ?? "");
                          setArtistPronounce(ar.pronounce ?? "");
                          setArtistNation(ar.nation);
                        }}
                        className="px-2 py-1 rounded border border-[#bdc0c4] hover:bg-[#f3f3f3] cursor-pointer"
                      >
                        수정
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          if (
                            !window.confirm(
                              `'${ar.name}' 아티스트를 삭제하시겠습니까?`
                            )
                          )
                            return;
                          try {
                            await runAdminAction("delete_artist", {
                              artist_id: ar.artist_id,
                            });
                            showToast("success", "삭제되었습니다.");
                            await loadAllData();
                          } catch (err) {
                            showToast(
                              "error",
                              err instanceof Error ? err.message : "오류"
                            );
                          }
                        }}
                        className="px-2 py-1 rounded border border-red-200 text-red-600 hover:bg-red-50 cursor-pointer"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Genres Column */}
            <div className="lg:col-span-5 bg-white rounded-[10px] border border-[#bdc0c4]/70 p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-[#bdc0c4]/50 pb-3">
                <h2 className="text-base font-bold text-[#242d3c]">
                  장르 관리 ({genres.length}개)
                </h2>
                {editingGenreId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingGenreId(null);
                      setGenreName("");
                    }}
                    className="text-xs text-[#808080] hover:text-[#242d3c] cursor-pointer"
                  >
                    신규 등록으로 전환
                  </button>
                )}
              </div>

              <form onSubmit={handleSaveGenre} className="flex gap-2">
                <select
                  value={genreCategory}
                  onChange={(e) => setGenreCategory(e.target.value)}
                  className="h-9 px-2.5 rounded-[7px] border border-[#bdc0c4] text-xs bg-white"
                >
                  {GENRE_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  required
                  placeholder="장르명 (예: Shoegaze)"
                  value={genreName}
                  onChange={(e) => setGenreName(e.target.value)}
                  className="flex-1 h-9 px-3 rounded-[7px] border border-[#bdc0c4] text-xs"
                />
                <button
                  type="submit"
                  className="h-9 px-3.5 rounded-[7px] bg-[#242d3c] hover:bg-[#ff8080] text-white text-xs font-bold cursor-pointer"
                >
                  {editingGenreId ? "수정" : "추가"}
                </button>
              </form>

              <div className="max-h-[580px] overflow-y-auto space-y-4">
                {GENRE_CATEGORIES.map((cat) => {
                  const catGenres = genres.filter((g) => g.category === cat);
                  return (
                    <div
                      key={cat}
                      className="p-3 rounded-[8px] border border-[#bdc0c4]/50 bg-[#f9fafb]"
                    >
                      <div className="text-xs font-bold text-[#242d3c] mb-2">
                        {cat} ({catGenres.length})
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {catGenres.map((g) => (
                          <span
                            key={g.genre_id}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded bg-white border border-[#bdc0c4] text-xs"
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setEditingGenreId(g.genre_id);
                                setGenreCategory(g.category);
                                setGenreName(g.name);
                              }}
                              className="font-semibold text-[#242d3c] hover:text-[#ff8080] cursor-pointer"
                            >
                              {g.name}
                            </button>
                            <button
                              type="button"
                              onClick={async () => {
                                if (
                                  !window.confirm(
                                    `'${g.name}' 장르를 삭제하시겠습니까?`
                                  )
                                )
                                  return;
                                try {
                                  await runAdminAction("delete_genre", {
                                    genre_id: g.genre_id,
                                  });
                                  showToast("success", "장르가 삭제되었습니다.");
                                  await loadAllData();
                                } catch (err) {
                                  showToast(
                                    "error",
                                    err instanceof Error ? err.message : "오류"
                                  );
                                }
                              }}
                              className="text-[#808080] hover:text-red-600 cursor-pointer"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 6: COMMENTS & REVIEWS MODERATION ==================== */}
        {activeTab === "moderation" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Comments Moderation */}
            <div className="lg:col-span-7 bg-white rounded-[10px] border border-[#bdc0c4]/70 p-5 space-y-4 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#bdc0c4]/50 pb-3">
                <h2 className="text-base font-bold text-[#242d3c]">
                  최근 한줄평 관리 ({filteredComments.length}개)
                </h2>
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-[#808080] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="회차, 작성자, 내용 검색..."
                    value={commentSearch}
                    onChange={(e) => setCommentSearch(e.target.value)}
                    className="w-full h-9 pl-9 pr-3 rounded-[7px] border border-[#bdc0c4] text-xs"
                  />
                </div>
              </div>

              <div className="divide-y divide-[#bdc0c4]/40 max-h-[650px] overflow-y-auto">
                {filteredComments.map((c) => (
                  <div
                    key={c.comment_id}
                    className="py-3 flex items-start justify-between gap-3"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-bold text-[#242d3c]">
                          제 {c.lecture_id}회
                        </span>
                        <span className="font-bold text-[#171717]">
                          {c.writer}
                        </span>
                        <span className="text-[#ff8080] font-bold">
                          ★ {(c.rating / 10).toFixed(1)}
                        </span>
                        <span className="text-[#808080]">
                          {c.created_at?.slice(0, 10)}
                        </span>
                      </div>
                      <p className="text-xs text-[#242d3c]/90 line-clamp-2 break-words">
                        {c.text}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        if (
                          !window.confirm(
                            `${c.writer}님의 한줄평을 삭제하시겠습니까? (공개된 음평회인 경우 평점이 자동 재계산됩니다.)`
                          )
                        )
                          return;
                        try {
                          await runAdminAction("delete_comment", {
                            comment_id: c.comment_id,
                          });
                          showToast("success", "한줄평이 삭제되었습니다.");
                          await loadAllData();
                        } catch (err) {
                          showToast(
                            "error",
                            err instanceof Error ? err.message : "오류"
                          );
                        }
                      }}
                      className="h-8 px-2.5 rounded-[6px] border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold shrink-0 inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>삭제</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews Moderation */}
            <div className="lg:col-span-5 bg-white rounded-[10px] border border-[#bdc0c4]/70 p-5 space-y-4 shadow-xs">
              <div className="border-b border-[#bdc0c4]/50 pb-3">
                <h2 className="text-base font-bold text-[#242d3c]">
                  칼럼 · 리뷰 관리 ({reviews.length}개)
                </h2>
              </div>

              <div className="divide-y divide-[#bdc0c4]/40 max-h-[650px] overflow-y-auto">
                {reviews.map((r) => (
                  <div
                    key={r.review_id}
                    className="py-3 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="text-xs text-[#808080]">
                        #{r.review_id} · [{r.type}] · {r.writer} · 조회 {r.views}
                      </div>
                      <div className="text-sm font-bold text-[#171717] truncate">
                        {r.title}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <a
                        href={`https://moontomi.com/review/${r.review_id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="h-8 px-2.5 rounded-[6px] border border-[#bdc0c4] hover:bg-[#f3f3f3] text-xs font-semibold inline-flex items-center gap-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>열기</span>
                      </a>
                      <button
                        type="button"
                        onClick={async () => {
                          if (
                            !window.confirm(
                              `'${r.title}' 칼럼을 삭제하시겠습니까?`
                            )
                          )
                            return;
                          try {
                            await runAdminAction("delete_review", {
                              review_id: r.review_id,
                            });
                            showToast("success", "칼럼이 삭제되었습니다.");
                            await loadAllData();
                          } catch (err) {
                            showToast(
                              "error",
                              err instanceof Error ? err.message : "오류"
                            );
                          }
                        }}
                        className="h-8 px-2 rounded-[6px] border border-red-200 text-red-600 hover:bg-red-50 text-xs inline-flex items-center cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 7: MEMBERS & PASSWORDS ==================== */}
        {activeTab === "members" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Add New Member */}
            <div className="lg:col-span-4">
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!newMemberName.trim() || !newMemberPassword.trim()) {
                    showToast("error", "멤버 이름과 비밀번호를 모두 입력해주세요.");
                    return;
                  }
                  try {
                    await runAdminAction("create_member", {
                      name: newMemberName.trim(),
                      password: newMemberPassword.trim(),
                    });
                    showToast("success", `'${newMemberName.trim()}' 멤버가 등록되었습니다.`);
                    setNewMemberName("");
                    setNewMemberPassword("");
                    await loadAllData();
                  } catch (err) {
                    showToast(
                      "error",
                      err instanceof Error ? err.message : "멤버 등록 실패"
                    );
                  }
                }}
                className="bg-white rounded-[10px] border border-[#bdc0c4]/70 p-5 space-y-4 shadow-xs"
              >
                <div className="border-b border-[#bdc0c4]/50 pb-3">
                  <h2 className="text-base font-bold text-[#242d3c]">
                    신규 멤버 등록
                  </h2>
                  <p className="text-xs text-[#808080] mt-0.5">
                    새 멤버 아이디와 로그인 비밀번호를 추가합니다.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#242d3c] mb-1">
                    대표 아이디 (멤버명)
                  </label>
                  <input
                    type="text"
                    placeholder="예: 홍길동"
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    className="w-full h-10 px-3 rounded-[7px] border border-[#bdc0c4] text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#242d3c] mb-1">
                    초기 비밀번호
                  </label>
                  <input
                    type="text"
                    placeholder="접속에 사용할 비밀번호"
                    value={newMemberPassword}
                    onChange={(e) => setNewMemberPassword(e.target.value)}
                    className="w-full h-10 px-3 rounded-[7px] border border-[#bdc0c4] text-xs"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full h-10 rounded-[7px] bg-[#242d3c] hover:bg-[#1b222e] text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-[#ff8080]" />
                  <span>멤버 추가</span>
                </button>
              </form>
            </div>

            {/* Right Column: Member Password Management */}
            <div className="lg:col-span-8 bg-white rounded-[10px] border border-[#bdc0c4]/70 p-5 space-y-4 shadow-xs">
              <div className="border-b border-[#bdc0c4]/50 pb-3">
                <h2 className="text-base font-bold text-[#242d3c]">
                  멤버 비밀번호 관리 ({members.length}명)
                </h2>
                <p className="text-xs text-[#808080] mt-0.5">
                  특정 멤버의 비밀번호를 변경하면 해당 멤버가 작성한 기존 한줄평 · 칼럼의 비밀번호 해시도 함께 동기화됩니다.
                </p>
              </div>

              <div className="divide-y divide-[#bdc0c4]/40">
                {members.map((m) => {
                  const pwVal = memberPasswords[m.member_id] ?? "";
                  const showPw = Boolean(memberShowPw[m.member_id]);
                  return (
                    <div
                      key={m.member_id}
                      className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-[#242d3c]/10 text-[#242d3c] font-mono text-xs font-bold">
                            #{m.member_id}
                          </span>
                          <span className="text-sm font-bold text-[#171717]">
                            {m.name}
                          </span>
                        </div>
                        {m.modified_at && (
                          <div className="text-[11px] text-[#808080] mt-0.5">
                            최근 변경: {m.modified_at.slice(0, 10)}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="relative w-full sm:w-56">
                          <input
                            type={showPw ? "text" : "password"}
                            placeholder="새 비밀번호 입력"
                            value={pwVal}
                            onChange={(e) =>
                              setMemberPasswords((prev) => ({
                                ...prev,
                                [m.member_id]: e.target.value,
                              }))
                            }
                            className="w-full h-9 pl-3 pr-8 rounded-[7px] border border-[#bdc0c4] text-xs"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setMemberShowPw((prev) => ({
                                ...prev,
                                [m.member_id]: !prev[m.member_id],
                              }))
                            }
                            className="absolute inset-y-0 right-0 px-2.5 flex items-center text-[#808080] hover:text-[#242d3c] cursor-pointer"
                          >
                            {showPw ? (
                              <Eye className="w-3.5 h-3.5" />
                            ) : (
                              <EyeOff className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={async () => {
                            const trimmed = pwVal.trim();
                            if (!trimmed) {
                              showToast("error", "변경할 새 비밀번호를 입력해주세요.");
                              return;
                            }
                            if (
                              !window.confirm(
                                `'${m.name}' 멤버의 비밀번호를 변경하시겠습니까?`
                              )
                            )
                              return;
                            try {
                              await runAdminAction("update_member_password", {
                                member_id: m.member_id,
                                password: trimmed,
                              });
                              showToast(
                                "success",
                                `'${m.name}'님의 비밀번호가 변경되었습니다.`
                              );
                              setMemberPasswords((prev) => ({
                                ...prev,
                                [m.member_id]: "",
                              }));
                              await loadAllData();
                            } catch (err) {
                              showToast(
                                "error",
                                err instanceof Error
                                  ? err.message
                                  : "비밀번호 변경 실패"
                              );
                            }
                          }}
                          className="h-9 px-3.5 rounded-[7px] bg-[#242d3c] hover:bg-[#1b222e] text-white text-xs font-bold shrink-0 inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5 text-[#ff8080]" />
                          <span>비밀번호 변경</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
