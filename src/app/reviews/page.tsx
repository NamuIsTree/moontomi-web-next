"use client";

import { useCallback, useMemo, useState } from "react";
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
import { cn } from "@/lib/utils";

type ReviewSortId = "id-desc" | "id-asc" | "view-desc" | "view-asc";

const REVIEW_SORT_OPTIONS: SortOptionItem<ReviewSortId>[] = [
  {
    id: "id-desc",
    label: "최신 발간순",
    mainIcon: Clock,
    subIcon: ArrowDown,
  },
  {
    id: "id-asc",
    label: "초기 발간순",
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

const CATEGORY_FILTERS = ["전체", "칼럼", "결산", "잡설"] as const;
type CategoryFilter = (typeof CATEGORY_FILTERS)[number];

export default function ReviewsPage() {
  const [selectedSort, setSelectedSort] = useState<ReviewSortId>("id-desc");
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryFilter>("전체");
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

        setReviews((prev) => {
          const merged = reset ? items : [...prev, ...items];
          return Array.from(new Map(merged.map((i) => [i.id, i])).values());
        });
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

  const filteredReviews = useMemo(() => {
    if (selectedCategory === "전체") return reviews;
    return reviews.filter((item) => item.type === selectedCategory);
  }, [reviews, selectedCategory]);

  return (
    <PageContainer width="reading">
      {/* Magazine Masthead */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 mb-5 border-b-2 border-[#242d3c]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#242d3c] tracking-tight">
            칼럼 &amp; 에세이
          </h1>
          <p className="text-sm text-[#808080] mt-1">
            멤버들의 음반 비평, 연말 결산, 그리고 음악에 관한 깊이 있는 기록
          </p>
        </div>

        <Link
          href="/review/create"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-[7px] bg-[#242d3c] hover:bg-[#242d3c]/90 text-[#f0f8ff] text-xs sm:text-sm font-bold transition-colors shrink-0"
        >
          <SquarePen className="w-4 h-4 text-[#ff8080]" />
          <span>원고 투고하기</span>
        </Link>
      </header>

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {CATEGORY_FILTERS.map((cat) => {
          const active = selectedCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer",
                active
                  ? "bg-[#242d3c] text-[#f0f8ff]"
                  : "bg-[#f3f3f3] text-[#242d3c] hover:bg-[#bdc0c4]/40"
              )}
            >
              {cat}
            </button>
          );
        })}
      </div>

      <SortToggleGroup
        options={REVIEW_SORT_OPTIONS}
        selectedId={selectedSort}
        onChange={handleSortChange}
      />

      <div className="space-y-5">
        {filteredReviews.map((review) => (
          <ReviewListCard key={review.id} review={review} />
        ))}
      </div>

      {!loading && filteredReviews.length === 0 && complete && (
        <div className="py-16 text-center text-sm text-[#808080] border border-[#bdc0c4]/50 rounded-[7px]">
          조건에 해당하는 칼럼이 없습니다.
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
