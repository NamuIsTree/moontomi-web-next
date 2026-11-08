"use client";

import { useEffect, useMemo, useState } from "react";
import { LayoutGrid, LayoutList, Loader2, Search, X } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { InfiniteScrollSentinel } from "@/components/ui/InfiniteScrollSentinel";
import { ArchiveDetailBanner } from "@/components/archive/ArchiveDetailBanner";
import { ArchiveGridTile } from "@/components/archive/ArchiveGridTile";
import { ArchiveListItem } from "@/components/archive/ArchiveListItem";
import {
  fetchArchiveById,
  fetchArchiveList,
} from "@/services/archive.service";
import type { ArchivePublicItem } from "@/types/domain";
import { cn } from "@/lib/utils";

interface ArchiveBrowserProps {
  initialArchiveId?: number;
}

const RATING_FILTER_OPTIONS = [
  { label: "전체 별점", min: 0 },
  { label: "4.5점 이상", min: 45 },
  { label: "4.0점 이상", min: 40 },
  { label: "3.5점 이상", min: 35 },
  { label: "3.0점 이상", min: 30 },
] as const;

const PAGE_STEP = 20;

export function ArchiveBrowser({ initialArchiveId }: ArchiveBrowserProps) {
  const [allArchives, setAllArchives] = useState<ArchivePublicItem[]>([]);
  const [selected, setSelected] = useState<ArchivePublicItem | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [order, setOrder] = useState<"desc" | "asc">("desc");
  const [minRating, setMinRating] = useState<number>(0);
  const [typeFilter, setTypeFilter] = useState<"all" | "album" | "single">("all");

  // Search input vs committed search query (triggered on Enter or Search button)
  const [searchInput, setSearchInput] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");

  const [visibleCount, setVisibleCount] = useState<number>(PAGE_STEP);
  const [loading, setLoading] = useState(true);
  const [headerShrunk, setHeaderShrunk] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      setHeaderShrunk(scrollTop > 50);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    fetchArchiveList({
      page: 1,
      limit: 1000,
      order: "desc",
      minRating: 0,
      maxRating: 1000,
    })
      .then((items) => {
        if (!mounted) return;
        // Deduplicate by archive.id to guarantee unique keys
        const uniqueItems = Array.from(
          new Map(items.map((item) => [item.id, item])).values()
        );
        setAllArchives(uniqueItems);

        if (initialArchiveId && Number.isFinite(initialArchiveId)) {
          const found = uniqueItems.find((it) => it.id === initialArchiveId);
          if (found) {
            setSelected(found);
          } else {
            fetchArchiveById(initialArchiveId).then((single) => {
              if (mounted && single) setSelected(single);
            });
          }
        } else if (uniqueItems.length > 0) {
          setSelected((prev) => prev ?? uniqueItems[0]);
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
  }, [initialArchiveId]);

  const handleOrderChange = (nextOrder: "desc" | "asc") => {
    if (nextOrder === order) return;
    setOrder(nextOrder);
    setVisibleCount(PAGE_STEP);
  };

  const handleMinRatingChange = (nextMin: number) => {
    if (nextMin === minRating) return;
    setMinRating(nextMin);
    setVisibleCount(PAGE_STEP);
  };

  const handleTypeFilterChange = (nextType: "all" | "album" | "single") => {
    if (nextType === typeFilter) return;
    setTypeFilter(nextType);
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

  const filteredAndSortedArchives = useMemo(() => {
    const q = submittedQuery.trim().toLowerCase();
    const minScore = minRating / 10; // minRating is 0, 30, 35, 40, 45 -> archive.rating is 0.0 ~ 5.0 (or 10.0)

    const filtered = allArchives.filter((archive) => {
      if (minRating > 0 && archive.rating < minScore) {
        return false;
      }
      if (typeFilter !== "all" && archive.item.type !== typeFilter) {
        return false;
      }
      if (q) {
        const inTitle = archive.item.title.toLowerCase().includes(q);
        const inArtist = archive.item.artist.toLowerCase().includes(q);
        const inArtistEn = (archive.item.artist_en ?? "")
          .toLowerCase()
          .includes(q);
        const inArtistPronounce = (archive.item.artist_pronounce ?? "")
          .toLowerCase()
          .includes(q);
        const inWriter = archive.writer.toLowerCase().includes(q);
        return (
          inTitle ||
          inArtist ||
          inArtistEn ||
          inArtistPronounce ||
          inWriter
        );
      }
      return true;
    });

    return filtered.sort((a, b) =>
      order === "asc" ? a.id - b.id : b.id - a.id
    );
  }, [allArchives, minRating, typeFilter, submittedQuery, order]);

  const visibleArchives = useMemo(
    () => filteredAndSortedArchives.slice(0, visibleCount),
    [filteredAndSortedArchives, visibleCount]
  );

  const complete = visibleCount >= filteredAndSortedArchives.length;

  return (
    <PageContainer width="wide" className="space-y-6">
      {/* Page Header + View Mode Switcher */}
      <header className="flex items-end justify-between gap-3 pb-4 sm:pb-5 border-b-2 border-[#242d3c]">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-3xl font-bold text-[#242d3c] tracking-tight">
            아카이브 스테이션
          </h1>
          <p className="text-xs sm:text-sm text-[#808080] mt-1 break-keep">
            큐레이션된 음반과 싱글을 목록으로 열람하고 바로 감상하세요
          </p>
        </div>

        {/* View Toggle (List vs Grid) */}
        <div className="inline-flex shrink-0 rounded-[7px] overflow-hidden border border-[#bdc0c4] divide-x divide-[#bdc0c4] bg-white">
          <button
            type="button"
            onClick={() => setViewMode("list")}
            className={cn(
              "inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs font-bold transition-colors cursor-pointer",
              viewMode === "list"
                ? "bg-[#242d3c] text-[#f0f8ff]"
                : "bg-white text-[#242d3c] hover:bg-[#f3f3f3]"
            )}
          >
            <LayoutList
              className={cn(
                "w-3.5 h-3.5 sm:w-4 sm:h-4",
                viewMode === "list" ? "text-[#ff8080]" : "text-[#242d3c]"
              )}
            />
            <span>리스트</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            className={cn(
              "inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs font-bold transition-colors cursor-pointer",
              viewMode === "grid"
                ? "bg-[#242d3c] text-[#f0f8ff]"
                : "bg-white text-[#242d3c] hover:bg-[#f3f3f3]"
            )}
          >
            <LayoutGrid
              className={cn(
                "w-3.5 h-3.5 sm:w-4 sm:h-4",
                viewMode === "grid" ? "text-[#ff8080]" : "text-[#242d3c]"
              )}
            />
            <span>그리드</span>
          </button>
        </div>
      </header>

      {/* Split-View Workspace: Left Sticky Player Deck + Right Filter & Catalog List */}
      <div className="flex flex-col lg:flex-row items-start gap-4 lg:gap-6">
        {/* Left Column: Sticky Inspector & Player Deck */}
        {selected && (
          <aside
            className={cn(
              "w-full max-w-full min-w-0 lg:w-[350px] xl:w-[390px] shrink-0 sticky z-30 pt-3 pb-2.5 lg:pt-0 lg:pb-0 bg-white/80 lg:bg-transparent backdrop-blur-md lg:backdrop-blur-none border-b border-[#bdc0c4]/45 lg:border-b-0 transition-[top] duration-300",
              headerShrunk
                ? "top-[52px] lg:top-[68px]"
                : "top-[90px] lg:top-[106px]"
            )}
          >
            <ArchiveDetailBanner
              selected={selected}
              defaultExpandedOnMobile={Boolean(initialArchiveId)}
            />
          </aside>
        )}

        {/* Right Column: Filter Toolbar + Archive Catalog (List or Grid) */}
        <div className="w-full lg:flex-1 min-w-0 space-y-3.5 sm:space-y-4">
          {/* Filter & Search Toolbar */}
          <div className="grid grid-cols-3 sm:grid-cols-12 gap-2 sm:gap-3 p-3 sm:p-3.5 rounded-[7px] bg-[#f3f3f3]/70 border border-[#bdc0c4]/60">
            <div className="col-span-1 sm:col-span-2">
              <label className="block text-[11px] sm:text-xs font-bold text-[#242d3c] mb-1">
                정렬 기준
              </label>
              <select
                value={order}
                onChange={(e) =>
                  handleOrderChange(e.target.value as "desc" | "asc")
                }
                className="w-full px-2 sm:px-2.5 py-1.5 sm:py-2 rounded-[7px] border border-[#bdc0c4] bg-white text-xs sm:text-sm font-semibold text-[#242d3c] focus:outline-none focus:border-[#242d3c]"
              >
                <option value="desc">최신순</option>
                <option value="asc">초기순</option>
              </select>
            </div>

            <div className="col-span-1 sm:col-span-3">
              <label className="block text-[11px] sm:text-xs font-bold text-[#242d3c] mb-1">
                별점 필터
              </label>
              <select
                value={minRating}
                onChange={(e) => handleMinRatingChange(Number(e.target.value))}
                className="w-full px-2 sm:px-2.5 py-1.5 sm:py-2 rounded-[7px] border border-[#bdc0c4] bg-white text-xs sm:text-sm font-semibold text-[#242d3c] focus:outline-none focus:border-[#242d3c]"
              >
                {RATING_FILTER_OPTIONS.map((opt) => (
                  <option key={opt.min} value={opt.min}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-1 sm:col-span-2">
              <label className="block text-[11px] sm:text-xs font-bold text-[#242d3c] mb-1">
                유형
              </label>
              <select
                value={typeFilter}
                onChange={(e) =>
                  handleTypeFilterChange(
                    e.target.value as "all" | "album" | "single"
                  )
                }
                className="w-full px-2 sm:px-2.5 py-1.5 sm:py-2 rounded-[7px] border border-[#bdc0c4] bg-white text-xs sm:text-sm font-semibold text-[#242d3c] focus:outline-none focus:border-[#242d3c]"
              >
                <option value="all">전체</option>
                <option value="album">ALBUM</option>
                <option value="single">SINGLE</option>
              </select>
            </div>

            <form
              onSubmit={handleSearchSubmit}
              className="col-span-3 sm:col-span-5"
            >
              <label className="block text-[11px] sm:text-xs font-bold text-[#242d3c] mb-1">
                아카이브 검색
              </label>
              <div className="flex items-center gap-1.5">
                <div className="relative flex-1 min-w-0">
                  <Search className="w-3.5 h-3.5 text-[#808080] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="곡 · 아티스트(한/영/발음) · 추천인"
                    className="w-full pl-8 pr-7 py-1.5 sm:py-2 rounded-[7px] border border-[#bdc0c4] bg-white text-xs sm:text-sm text-[#171717] focus:outline-none focus:border-[#242d3c]"
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
                  className="shrink-0 px-3 py-1.5 sm:py-2 rounded-[7px] bg-[#242d3c] hover:bg-[#242d3c]/90 text-[#f0f8ff] text-xs sm:text-sm font-bold transition-colors cursor-pointer"
                >
                  검색
                </button>
              </div>
            </form>
          </div>

          {/* Search Result Banner ("~에 대한 검색 결과입니다.") with Smooth Collapse Transition */}
          <div
            className={cn(
              "grid transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
              submittedQuery
                ? "grid-rows-[1fr] opacity-100"
                : "grid-rows-[0fr] opacity-0 pointer-events-none"
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
                    ({filteredAndSortedArchives.length}건)
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

          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-center border border-[#bdc0c4]/40 rounded-[7px] bg-white">
              <Loader2 className="w-8 h-8 animate-spin text-[#ff8080]" />
              <p className="text-sm font-bold text-[#242d3c]">
                아카이브 목록을 불러오는 중입니다...
              </p>
            </div>
          ) : viewMode === "list" ? (
            <div className="space-y-2.5">
              {visibleArchives.map((archive) => (
                <ArchiveListItem
                  key={archive.id}
                  archive={archive}
                  isSelected={selected?.id === archive.id}
                  onSelect={setSelected}
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
              {visibleArchives.map((archive) => (
                <ArchiveGridTile
                  key={archive.id}
                  archive={archive}
                  isSelected={selected?.id === archive.id}
                  onSelect={setSelected}
                />
              ))}
            </div>
          )}

          {!loading && filteredAndSortedArchives.length === 0 && (
            <div className="py-16 text-center text-sm text-[#808080] border border-[#bdc0c4]/50 rounded-[7px]">
              조건에 일치하는 아카이브가 없습니다.
            </div>
          )}

          <InfiniteScrollSentinel
            disabled={complete || loading}
            loading={loading}
            onIntersect={() => setVisibleCount((prev) => prev + PAGE_STEP)}
          />
        </div>
      </div>
    </PageContainer>
  );
}
