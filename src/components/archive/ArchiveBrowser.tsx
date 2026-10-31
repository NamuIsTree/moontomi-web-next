"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { LayoutGrid, LayoutList, Search } from "lucide-react";
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

export function ArchiveBrowser({ initialArchiveId }: ArchiveBrowserProps) {
  const [archives, setArchives] = useState<ArchivePublicItem[]>([]);
  const [selected, setSelected] = useState<ArchivePublicItem | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [order, setOrder] = useState<"desc" | "asc">("desc");
  const [minRating, setMinRating] = useState<number>(0);
  const [typeFilter, setTypeFilter] = useState<"all" | "album" | "single">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [complete, setComplete] = useState(false);
  const [loading, setLoading] = useState(false);
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
    if (initialArchiveId && Number.isFinite(initialArchiveId)) {
      fetchArchiveById(initialArchiveId).then((item) => {
        if (item) setSelected(item);
      });
    }
  }, [initialArchiveId]);

  const loadMore = useCallback(
    async (
      targetPage: number,
      targetOrder: "desc" | "asc",
      targetMinRating: number,
      selectFirst = false,
      reset = false
    ) => {
      setLoading(true);
      try {
        const items = await fetchArchiveList({
          page: targetPage,
          limit: 20,
          order: targetOrder,
          minRating: targetMinRating,
          maxRating: 1000,
        });

        setArchives((prev) => (reset ? items : [...prev, ...items]));

        if (selectFirst && items.length > 0 && !initialArchiveId) {
          setSelected((prev) => prev ?? items[0]);
        }

        if (items.length < 20) {
          setComplete(true);
        } else {
          setPage(targetPage + 1);
        }
      } finally {
        setLoading(false);
      }
    },
    [initialArchiveId]
  );

  const handleOrderChange = (nextOrder: "desc" | "asc") => {
    if (nextOrder === order) return;
    setOrder(nextOrder);
    setArchives([]);
    setPage(1);
    setComplete(false);
    loadMore(1, nextOrder, minRating, false, true);
  };

  const handleMinRatingChange = (nextMin: number) => {
    if (nextMin === minRating) return;
    setMinRating(nextMin);
    setArchives([]);
    setPage(1);
    setComplete(false);
    loadMore(1, order, nextMin, false, true);
  };

  const visibleArchives = useMemo(() => {
    return archives.filter((archive) => {
      if (typeFilter !== "all" && archive.item.type !== typeFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const inTitle = archive.item.title.toLowerCase().includes(q);
        const inArtist = archive.item.artist.toLowerCase().includes(q);
        const inWriter = archive.writer.toLowerCase().includes(q);
        return inTitle || inArtist || inWriter;
      }
      return true;
    });
  }, [archives, typeFilter, searchQuery]);

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
              "w-full lg:w-[350px] xl:w-[390px] shrink-0 sticky z-30 pt-3 pb-2.5 -mx-1 px-1 lg:mx-0 lg:px-0 lg:pt-0 lg:pb-0 bg-white/80 lg:bg-transparent backdrop-blur-md lg:backdrop-blur-none border-b border-[#bdc0c4]/45 lg:border-b-0 transition-[top] duration-300",
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
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3 p-3 sm:p-3.5 rounded-[7px] bg-[#f3f3f3]/70 border border-[#bdc0c4]/60">
            <div>
              <label className="block text-[11px] sm:text-xs font-bold text-[#242d3c] mb-1">
                정렬 기준
              </label>
              <select
                value={order}
                onChange={(e) =>
                  handleOrderChange(e.target.value as "desc" | "asc")
                }
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded-[7px] border border-[#bdc0c4] bg-white text-xs sm:text-sm font-semibold text-[#242d3c] focus:outline-none focus:border-[#242d3c]"
              >
                <option value="desc">최신순</option>
                <option value="asc">초기순</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] sm:text-xs font-bold text-[#242d3c] mb-1">
                별점 필터
              </label>
              <select
                value={minRating}
                onChange={(e) => handleMinRatingChange(Number(e.target.value))}
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded-[7px] border border-[#bdc0c4] bg-white text-xs sm:text-sm font-semibold text-[#242d3c] focus:outline-none focus:border-[#242d3c]"
              >
                {RATING_FILTER_OPTIONS.map((opt) => (
                  <option key={opt.min} value={opt.min}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] sm:text-xs font-bold text-[#242d3c] mb-1">
                유형
              </label>
              <select
                value={typeFilter}
                onChange={(e) =>
                  setTypeFilter(e.target.value as "all" | "album" | "single")
                }
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded-[7px] border border-[#bdc0c4] bg-white text-xs sm:text-sm font-semibold text-[#242d3c] focus:outline-none focus:border-[#242d3c]"
              >
                <option value="all">전체</option>
                <option value="album">ALBUM</option>
                <option value="single">SINGLE</option>
              </select>
            </div>

            <div className="col-span-3 sm:col-span-1">
              <label className="block text-[11px] sm:text-xs font-bold text-[#242d3c] mb-1">
                빠른 검색
              </label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#808080] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="곡 · 아티스트 · 추천인 검색"
                  className="w-full pl-8 pr-3 py-1.5 sm:py-2 rounded-[7px] border border-[#bdc0c4] bg-white text-xs sm:text-sm text-[#171717] focus:outline-none focus:border-[#242d3c]"
                />
              </div>
            </div>
          </div>

          {viewMode === "list" ? (
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

          {!loading && visibleArchives.length === 0 && complete && (
            <div className="py-16 text-center text-sm text-[#808080] border border-[#bdc0c4]/50 rounded-[7px]">
              조건에 일치하는 아카이브가 없습니다.
            </div>
          )}

          <InfiniteScrollSentinel
            disabled={complete}
            loading={loading}
            onIntersect={() => loadMore(page, order, minRating, page === 1)}
          />
        </div>
      </div>
    </PageContainer>
  );
}
