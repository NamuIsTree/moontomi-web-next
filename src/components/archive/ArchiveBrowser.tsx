"use client";

import { useCallback, useEffect, useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { InfiniteScrollSentinel } from "@/components/ui/InfiniteScrollSentinel";
import { ArchiveDetailBanner } from "@/components/archive/ArchiveDetailBanner";
import { ArchiveGridTile } from "@/components/archive/ArchiveGridTile";
import {
  fetchArchiveById,
  fetchArchiveList,
} from "@/services/archive.service";
import type { ArchivePublicItem } from "@/types/domain";

interface ArchiveBrowserProps {
  initialArchiveId?: number;
}

export function ArchiveBrowser({ initialArchiveId }: ArchiveBrowserProps) {
  const [archives, setArchives] = useState<ArchivePublicItem[]>([]);
  const [selected, setSelected] = useState<ArchivePublicItem | null>(null);
  const [order, setOrder] = useState<"desc" | "asc">("desc");
  const [page, setPage] = useState(1);
  const [complete, setComplete] = useState(false);
  const [loading, setLoading] = useState(false);

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
      selectFirst = false,
      reset = false
    ) => {
      setLoading(true);
      try {
        const items = await fetchArchiveList({
          page: targetPage,
          limit: 12,
          order: targetOrder,
          minRating: 0,
          maxRating: 1000,
        });

        setArchives((prev) => (reset ? items : [...prev, ...items]));

        if (selectFirst && items.length > 0 && !initialArchiveId) {
          setSelected((prev) => prev ?? items[0]);
        }

        if (items.length < 12) {
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
    loadMore(1, nextOrder, false, true);
  };

  return (
    <PageContainer width="archive" className="space-y-6">
      {/* Sticky Top Detail Preview + Filter Bar */}
      <div className="sticky top-[58px] z-30 bg-white pt-2 pb-3 space-y-3">
        {selected && <ArchiveDetailBanner selected={selected} />}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-bold text-[#242d3c] mb-1">
              정렬 기준
            </label>
            <select
              value={order}
              onChange={(e) =>
                handleOrderChange(e.target.value as "desc" | "asc")
              }
              className="w-full px-3 py-2 rounded-sm border border-[#bdc0c4] bg-white text-sm font-semibold text-[#242d3c] focus:outline-none focus:border-[#242d3c]"
            >
              <option value="desc">최신순</option>
              <option value="asc">작성순</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#808080] mb-1">
              별점
            </label>
            <select
              disabled
              className="w-full px-3 py-2 rounded-sm border border-[#bdc0c4] bg-[#f3f3f3] text-sm text-[#808080]"
            >
              <option>전체 별점</option>
            </select>
          </div>

          <div className="hidden sm:block">
            <label className="block text-xs font-bold text-[#808080] mb-1">
              장르
            </label>
            <select
              disabled
              className="w-full px-3 py-2 rounded-sm border border-[#bdc0c4] bg-[#f3f3f3] text-sm text-[#808080]"
            >
              <option>전체 장르</option>
            </select>
          </div>

          <div className="hidden sm:block">
            <label className="block text-xs font-bold text-[#808080] mb-1">
              검색
            </label>
            <input
              type="text"
              disabled
              placeholder="검색 (준비 중)"
              className="w-full px-3 py-2 rounded-sm border border-[#bdc0c4] bg-[#f3f3f3] text-sm text-[#808080]"
            />
          </div>
        </div>
      </div>

      {/* Archive Square Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-2.5">
        {archives.map((archive) => (
          <ArchiveGridTile
            key={archive.id}
            archive={archive}
            isSelected={selected?.id === archive.id}
            onSelect={setSelected}
          />
        ))}
      </div>

      {!loading && archives.length === 0 && complete && (
        <div className="py-16 text-center text-sm text-[#808080]">
          등록된 아카이브가 없습니다.
        </div>
      )}

      <InfiniteScrollSentinel
        disabled={complete}
        loading={loading}
        onIntersect={() => loadMore(page, order, page === 1)}
      />
    </PageContainer>
  );
}
