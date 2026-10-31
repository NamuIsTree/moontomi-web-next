"use client";

import { useCallback, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Clock,
  Star,
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

export default function LecturesPage() {
  const [selectedSort, setSelectedSort] = useState<LectureSortId>("id-desc");
  const [lectures, setLectures] = useState<LectureListItem[]>([]);
  const [page, setPage] = useState(1);
  const [complete, setComplete] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadMore = useCallback(
    async (targetPage: number, sortId: LectureSortId, reset = false) => {
      setLoading(true);
      const [sortBy, order] = sortId.split("-") as [
        "id" | "rating",
        "asc" | "desc",
      ];

      try {
        const items = await fetchLectureList({
          page: targetPage,
          limit: 15,
          sortBy,
          order,
        });

        setLectures((prev) => (reset ? items : [...prev, ...items]));
        if (items.length < 10) {
          setComplete(true);
        } else {
          setPage(targetPage + 1);
        }
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const handleSortChange = (option: SortOptionItem<LectureSortId>) => {
    if (option.id === selectedSort) return;
    setSelectedSort(option.id);
    setLectures([]);
    setPage(1);
    setComplete(false);
    loadMore(1, option.id, true);
  };

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

      {/* Catalog Column Header */}
      <div className="hidden sm:flex items-center justify-between px-4 py-2 text-xs font-bold text-[#808080] border-b border-[#242d3c]/20">
        <div className="w-12 text-center">NO.</div>
        <div className="flex-1 pl-4">ALBUM &amp; ARTIST</div>
        <div className="w-24 text-right">SCORE</div>
      </div>

      <div className="divide-y divide-[#bdc0c4]/50">
        {lectures.map((lecture, idx) => (
          <LectureRowItem
            key={`${lecture.id}-${idx}`}
            lecture={lecture}
            displayOrder={
              selectedSort === "id-desc" || selectedSort === "id-asc"
                ? lecture.id
                : idx + 1
            }
          />
        ))}
      </div>

      {!loading && lectures.length === 0 && complete && (
        <div className="py-16 text-center text-sm text-[#808080] border border-[#bdc0c4]/50 rounded-[7px]">
          등록된 음평회가 없습니다.
        </div>
      )}

      <InfiniteScrollSentinel
        disabled={complete}
        loading={loading}
        onIntersect={() => loadMore(page, selectedSort)}
      />
    </PageContainer>
  );
}
