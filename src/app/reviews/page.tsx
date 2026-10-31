"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import {
  ArrowDown,
  ArrowUp,
  BookOpen,
  Clock,
  SquarePen,
} from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import {
  SortToggleGroup,
  type SortOptionItem,
} from "@/components/ui/SortToggleGroup";
import { InfiniteScrollSentinel } from "@/components/ui/InfiniteScrollSentinel";
import { ReviewListCard } from "@/components/review/ReviewListCard";
import { fetchReviewList } from "@/services/review.service";
import type { ReviewListItem } from "@/types/domain";

type ReviewSortId = "id-desc" | "id-asc" | "view-desc" | "view-asc";

const REVIEW_SORT_OPTIONS: SortOptionItem<ReviewSortId>[] = [
  {
    id: "id-desc",
    label: "최신순",
    mainIcon: Clock,
    subIcon: ArrowDown,
  },
  {
    id: "id-asc",
    label: "오래된 순",
    mainIcon: Clock,
    subIcon: ArrowUp,
  },
  {
    id: "view-desc",
    label: "조회수 높은순",
    mainIcon: BookOpen,
    subIcon: ArrowDown,
  },
  {
    id: "view-asc",
    label: "조회수 낮은순",
    mainIcon: BookOpen,
    subIcon: ArrowUp,
  },
];

export default function ReviewsPage() {
  const [selectedSort, setSelectedSort] = useState<ReviewSortId>("id-desc");
  const [reviews, setReviews] = useState<ReviewListItem[]>([]);
  const [page, setPage] = useState(1);
  const [complete, setComplete] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadMore = useCallback(
    async (targetPage: number, sortId: ReviewSortId, reset = false) => {
      setLoading(true);
      const [sortBy, order] = sortId.split("-") as [
        "id" | "view",
        "asc" | "desc",
      ];

      try {
        const items = await fetchReviewList({
          page: targetPage,
          limit: 15,
          sortBy,
          order,
        });

        setReviews((prev) => (reset ? items : [...prev, ...items]));
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

  const handleSortChange = (option: SortOptionItem<ReviewSortId>) => {
    if (option.id === selectedSort) return;
    setSelectedSort(option.id);
    setReviews([]);
    setPage(1);
    setComplete(false);
    loadMore(1, option.id, true);
  };

  return (
    <PageContainer width="reading">
      <div className="flex justify-end mb-2">
        <Link
          href="/review/create"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-[#242d3c] text-white text-xs font-bold hover:opacity-90 transition-opacity"
        >
          <SquarePen className="w-3.5 h-3.5" />
          <span>투고하기</span>
        </Link>
      </div>

      <SortToggleGroup
        options={REVIEW_SORT_OPTIONS}
        selectedId={selectedSort}
        onChange={handleSortChange}
      />

      <div className="space-y-6">
        {reviews.map((review) => (
          <ReviewListCard key={review.id} review={review} />
        ))}
      </div>

      {!loading && reviews.length === 0 && complete && (
        <div className="py-16 text-center text-sm text-[#808080]">
          등록된 칼럼이 없습니다.
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
