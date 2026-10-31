"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { InfiniteScrollSentinel } from "@/components/ui/InfiniteScrollSentinel";
import { ArchiveDetailBanner } from "@/components/archive/ArchiveDetailBanner";
import { ArchiveGridTile } from "@/components/archive/ArchiveGridTile";
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
          limit: 15,
          order: targetOrder,
          minRating: targetMinRating,
          maxRating: 1000,
        });

        setArchives((prev) => (reset ? items : [...prev, ...items]));

        if (selectFirst && items.length > 0 && !initialArchiveId) {
          setSelected((prev) => prev ?? items[0]);
        }

        if (items.length < 15) {
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
    <PageContainer width="archive" className="space-y-6">
      {/* Sticky Top Detail Preview + Filter Bar */}
      <div
        className={cn(
          "sticky z-30 bg-white pt-2 pb-3 border-b border-[#bdc0c4]/50 space-y-3 transition-[top] duration-300",
          headerShrunk ? "top-[52px]" : "top-[90px]"
        )}
      >
        {selected && <ArchiveDetailBanner selected={selected} />}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
          <div>
            <label className="block text-xs font-bold text-[#242d3c] mb-1">
              정렬 기준
            </label>
            <select
              value={order}
              onChange={(e) =>
                handleOrderChange(e.target.value as "desc" | "asc")
              }
              className="w-full px-3 py-2 rounded-[7px] border border-[#bdc0c4] bg-white text-xs sm:text-sm font-semibold text-[#242d3c] focus:outline-none focus:border-[#242d3c]"
            >
              <option value="desc">최신 등록순</option>
              <option value="asc">초기 등록순</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#242d3c] mb-1">
              별점 필터
            </label>
            <select
              value={minRating}
              onChange={(e) => handleMinRatingChange(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-[7px] border border-[#bdc0c4] bg-white text-xs sm:text-sm font-semibold text-[#242d3c] focus:outline-none focus:border-[#242d3c]"
            >
              {RATING_FILTER_OPTIONS.map((opt) => (
                <option key={opt.min} value={opt.min}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#242d3c] mb-1">
              유형
            </label>
            <select
              value={typeFilter}
              onChange={(e) =>
                setTypeFilter(e.target.value as "all" | "album" | "single")
              }
              className="w-full px-3 py-2 rounded-[7px] border border-[#bdc0c4] bg-white text-xs sm:text-sm font-semibold text-[#242d3c] focus:outline-none focus:border-[#242d3c]"
            >
              <option value="all">전체 (ALBUM &amp; SINGLE)</option>
              <option value="album">ALBUM</option>
              <option value="single">SINGLE</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#242d3c] mb-1">
              내 목록 검색
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#808080] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="곡 · 아티스트 검색"
                className="w-full pl-8 pr-3 py-2 rounded-[7px] border border-[#bdc0c4] bg-white text-xs sm:text-sm text-[#171717] focus:outline-none focus:border-[#242d3c]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Archive Square Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-2.5">
        {visibleArchives.map((archive) => (
          <ArchiveGridTile
            key={archive.id}
            archive={archive}
            isSelected={selected?.id === archive.id}
            onSelect={setSelected}
          />
        ))}
      </div>

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
    </PageContainer>
  );
}
