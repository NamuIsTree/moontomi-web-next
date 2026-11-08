"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Clock,
  Loader2,
  RotateCcw,
  Search,
  Star,
  X,
} from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import {
  SortToggleGroup,
  type SortOptionItem,
} from "@/components/ui/SortToggleGroup";
import { InfiniteScrollSentinel } from "@/components/ui/InfiniteScrollSentinel";
import { LectureRowItem } from "@/components/lecture/LectureRowItem";
import { fetchLectureList } from "@/services/lecture.service";
import type { LectureListItem } from "@/types/domain";
import { cn } from "@/lib/utils";

type LectureSortId = "id-desc" | "id-asc" | "rating-desc" | "rating-asc";

const LECTURE_SORT_OPTIONS: SortOptionItem<LectureSortId>[] = [
  {
    id: "id-desc",
    label: "음평회 내림차순",
    mainIcon: Clock,
    subIcon: ArrowDown,
  },
  {
    id: "id-asc",
    label: "음평회 오름차순",
    mainIcon: Clock,
    subIcon: ArrowUp,
  },
  {
    id: "rating-desc",
    label: "평점 내림차순",
    subLabel: "컴필레이션 제외",
    mainIcon: Star,
    subIcon: ArrowDown,
  },
  {
    id: "rating-asc",
    label: "평점 오름차순",
    subLabel: "컴필레이션 제외",
    mainIcon: Star,
    subIcon: ArrowUp,
  },
];

const PAGE_STEP = 20;

export default function LecturesPage() {
  const [selectedSort, setSelectedSort] = useState<LectureSortId>("id-desc");
  const [allLectures, setAllLectures] = useState<LectureListItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search States (input vs submitted query)
  const [selectedNation, setSelectedNation] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchInput, setSearchInput] = useState<string>("");
  const [submittedQuery, setSubmittedQuery] = useState<string>("");
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_STEP);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchLectureList({
      page: 1,
      limit: 1000,
      sortBy: "id",
      order: "desc",
    })
      .then((items) => {
        if (mounted) {
          const uniqueItems = Array.from(
            new Map(items.map((item) => [item.id, item])).values()
          );
          setAllLectures(uniqueItems);
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Extract distinct Nations (sorted by count descending)
  const nationOptions = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of allLectures) {
      const nation = item.artist.nation?.trim();
      if (nation) {
        counts.set(nation, (counts.get(nation) ?? 0) + 1);
      }
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([nation, count]) => ({ nation, count }));
  }, [allLectures]);

  // Extract distinct Genre Categories (sorted by count descending)
  const categoryOptions = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of allLectures) {
      const uniqueCats = new Set(
        (item.genres ?? []).map((g) => g.category?.trim()).filter(Boolean)
      );
      for (const cat of uniqueCats) {
        counts.set(cat, (counts.get(cat) ?? 0) + 1);
      }
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([category, count]) => ({ category, count }));
  }, [allLectures]);

  // Filter + Sort Lectures
  const filteredAndSortedLectures = useMemo(() => {
    const [sortBy, order] = selectedSort.split("-") as [
      "id" | "rating",
      "asc" | "desc",
    ];
    const q = submittedQuery.trim().toLowerCase();

    const filtered = allLectures.filter((lecture) => {
      // Rating sort excludes unrated and compilation (season_id === 8)
      if (sortBy === "rating") {
        if (lecture.rating === null || lecture.season.id === 8) {
          return false;
        }
      }

      if (
        selectedNation !== "all" &&
        lecture.artist.nation !== selectedNation
      ) {
        return false;
      }

      if (selectedCategory !== "all") {
        const hasCat = (lecture.genres ?? []).some(
          (g) => g.category === selectedCategory
        );
        if (!hasCat) return false;
      }

      if (q) {
        const inTitle = lecture.title.toLowerCase().includes(q);
        const inArtistKo = lecture.artist.name.toLowerCase().includes(q);
        const inArtistEn = (lecture.artist.name_en ?? "")
          .toLowerCase()
          .includes(q);
        const inPronounce = (lecture.artist.pronounce ?? "")
          .toLowerCase()
          .includes(q);
        if (!inTitle && !inArtistKo && !inArtistEn && !inPronounce) {
          return false;
        }
      }

      return true;
    });

    return filtered.sort((a, b) => {
      if (sortBy === "rating") {
        const rA = a.rating ?? 0;
        const rB = b.rating ?? 0;
        if (rA !== rB) {
          return order === "asc" ? rA - rB : rB - rA;
        }
        return a.id - b.id;
      }
      return order === "asc" ? a.id - b.id : b.id - a.id;
    });
  }, [
    allLectures,
    selectedSort,
    selectedNation,
    selectedCategory,
    submittedQuery,
  ]);

  const handleSortChange = (option: SortOptionItem<LectureSortId>) => {
    if (option.id === selectedSort) return;
    setSelectedSort(option.id);
    setVisibleCount(PAGE_STEP);
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSubmittedQuery(searchInput.trim());
    setVisibleCount(PAGE_STEP);
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setSubmittedQuery("");
    setVisibleCount(PAGE_STEP);
  };

  const handleResetFilters = () => {
    setSelectedNation("all");
    setSelectedCategory("all");
    setSearchInput("");
    setSubmittedQuery("");
    setVisibleCount(PAGE_STEP);
  };

  const isFiltering =
    selectedNation !== "all" ||
    selectedCategory !== "all" ||
    submittedQuery.trim() !== "";

  const visibleLectures = filteredAndSortedLectures.slice(0, visibleCount);
  const complete = visibleCount >= filteredAndSortedLectures.length;

  return (
    <PageContainer width="reading">
      <header className="pb-5 mb-5 border-b-2 border-[#242d3c]">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#242d3c] tracking-tight">
          정기 음평회
        </h1>
        <p className="text-sm text-[#808080] mt-1">
          매주 토요일 함께 감상하고 평점과 베스트 트랙을 기록한 음반 카탈로그
        </p>
      </header>

      <SortToggleGroup
        options={LECTURE_SORT_OPTIONS}
        selectedId={selectedSort}
        onChange={handleSortChange}
      />

      {/* Search & Filter Toolbar (Nation, Genre Category, Search) */}
      <section className="p-3.5 sm:p-4 rounded-[7px] bg-[#f3f3f3]/70 border border-[#bdc0c4]/60 mb-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 sm:gap-3">
          {/* 국적 필터 */}
          <div className="sm:col-span-3">
            <label className="block text-xs font-bold text-[#242d3c] mb-1">
              국적
            </label>
            <select
              value={selectedNation}
              onChange={(e) => {
                setSelectedNation(e.target.value);
                setVisibleCount(PAGE_STEP);
              }}
              className="w-full px-3 py-2 rounded-[7px] border border-[#bdc0c4] bg-white text-xs sm:text-sm font-semibold text-[#242d3c] focus:outline-none focus:border-[#242d3c]"
            >
              <option value="all">전체 국적</option>
              {nationOptions.map(({ nation, count }) => (
                <option key={nation} value={nation}>
                  {nation} ({count})
                </option>
              ))}
            </select>
          </div>

          {/* 장르 (카테고리) 필터 */}
          <div className="sm:col-span-4">
            <label className="block text-xs font-bold text-[#242d3c] mb-1">
              장르 (카테고리)
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setVisibleCount(PAGE_STEP);
              }}
              className="w-full px-3 py-2 rounded-[7px] border border-[#bdc0c4] bg-white text-xs sm:text-sm font-semibold text-[#242d3c] focus:outline-none focus:border-[#242d3c]"
            >
              <option value="all">전체 장르</option>
              {categoryOptions.map(({ category, count }) => (
                <option key={category} value={category}>
                  {category} ({count})
                </option>
              ))}
            </select>
          </div>

          {/* 검색 (가수, 앨범제목) */}
          <form
            onSubmit={handleSearchSubmit}
            className="sm:col-span-5"
          >
            <label className="block text-xs font-bold text-[#242d3c] mb-1">
              검색 (가수 · 앨범제목)
            </label>
            <div className="flex items-center gap-1.5">
              <div className="relative flex-1 min-w-0">
                <Search className="w-3.5 h-3.5 text-[#808080] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="가수명(한/영/발음) 또는 앨범 제목"
                  className="w-full pl-8 pr-7 py-2 rounded-[7px] border border-[#bdc0c4] bg-white text-xs sm:text-sm text-[#171717] focus:outline-none focus:border-[#242d3c]"
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    aria-label="검색어 지우기"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[#808080] hover:text-[#242d3c] cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <button
                type="submit"
                className="shrink-0 px-3.5 py-2 rounded-[7px] bg-[#242d3c] hover:bg-[#242d3c]/90 text-[#f0f8ff] text-xs sm:text-sm font-bold transition-colors cursor-pointer"
              >
                검색
              </button>
            </div>
          </form>
        </div>

        {/* Filter Status & Reset Row */}
        <div className="flex items-center justify-between pt-1 text-xs text-[#808080] tabular-nums">
          <div>
            {loading ? (
              <span className="inline-flex items-center gap-1.5 text-[#808080] font-semibold">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#ff8080]" />
                <span>음평회 카탈로그를 불러오는 중...</span>
              </span>
            ) : (
              <>
                총{" "}
                <strong className="text-[#242d3c] font-bold">
                  {filteredAndSortedLectures.length}
                </strong>
                개의 음평회 앨범
              </>
            )}
          </div>

          {isFiltering && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 font-bold text-[#242d3c] hover:text-[#ff8080] transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>필터 초기화</span>
            </button>
          )}
        </div>
      </section>

      {/* Search Result Banner ("~에 대한 검색 결과입니다.") with Smooth Collapse Transition */}
      <div
        className={cn(
          "grid transition-[grid-template-rows,opacity,margin] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          submittedQuery
            ? "grid-rows-[1fr] opacity-100 mb-4"
            : "grid-rows-[0fr] opacity-0 mb-0 pointer-events-none"
        )}
      >
        <div className="overflow-hidden">
          <div className="flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-[7px] bg-[#242d3c]/5 border border-[#242d3c]/15 text-xs sm:text-sm text-[#242d3c]">
            <div className="min-w-0 truncate">
              <strong className="font-bold text-[#ff8080]">
                “{submittedQuery}”
              </strong>
              <span>에 대한 검색 결과입니다. </span>
              <span className="font-bold tabular-nums text-[#808080]">
                ({filteredAndSortedLectures.length}건)
              </span>
            </div>
            <button
              type="button"
              onClick={handleClearSearch}
              className="shrink-0 inline-flex items-center gap-1 text-xs font-bold text-[#808080] hover:text-[#242d3c] cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>검색 해제</span>
            </button>
          </div>
        </div>
      </div>

      {/* Catalog Column Header */}
      <div className="hidden sm:flex items-center justify-between px-4 py-2 text-xs font-bold text-[#808080] border-b border-[#242d3c]/20">
        <div className="w-12 text-center">NO.</div>
        <div className="flex-1 pl-4">ALBUM &amp; ARTIST</div>
        <div className="w-24 text-right">SCORE</div>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#ff8080]" />
          <p className="text-sm font-bold text-[#242d3c]">
            음평회 목록을 불러오는 중입니다...
          </p>
        </div>
      ) : (
        <div className="divide-y divide-[#bdc0c4]/50">
          {visibleLectures.map((lecture, idx) => (
            <LectureRowItem
              key={lecture.id}
              lecture={lecture}
              displayOrder={
                selectedSort === "id-desc" || selectedSort === "id-asc"
                  ? lecture.id
                  : idx + 1
              }
            />
          ))}
        </div>
      )}

      {!loading && filteredAndSortedLectures.length === 0 && (
        <div className="py-16 text-center text-sm text-[#808080] border border-[#bdc0c4]/50 rounded-[7px]">
          조건에 일치하는 음평회 앨범이 없습니다.
        </div>
      )}

      <InfiniteScrollSentinel
        disabled={complete || loading}
        loading={loading}
        onIntersect={() => setVisibleCount((prev) => prev + PAGE_STEP)}
      />
    </PageContainer>
  );
}
