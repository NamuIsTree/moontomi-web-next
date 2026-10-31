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
      <SortToggleGroup
        options={LECTURE_SORT_OPTIONS}
        selectedId={selectedSort}
        onChange={handleSortChange}
      />

      <div className="divide-y divide-[#bdc0c4]/40">
        {lectures.map((lecture, idx) => (
          <LectureRowItem
            key={`${lecture.id}-${idx}`}
            lecture={lecture}
            displayOrder={selectedSort === "id-desc" ? lecture.id : idx + 1}
          />
        ))}
      </div>

      {!loading && lectures.length === 0 && complete && (
        <div className="py-16 text-center text-sm text-[#808080]">
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
