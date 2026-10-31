"use client";

import { useState, useMemo } from "react";
import { CornerDownLeft, Search, X } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { LookupCommentRow } from "@/components/lookup/LookupCommentRow";
import { searchCommentsByWriters } from "@/services/comment.service";
import type { LookupCommentItem } from "@/types/domain";
import { cn } from "@/lib/utils";

const SORT_OPTIONS = [
  "점수 높은순",
  "점수 낮은순",
  "음평회 역순",
  "음평회 순",
] as const;

type LookupSortOption = (typeof SORT_OPTIONS)[number];

export default function LookupPage() {
  const [inputValue, setInputValue] = useState("");
  const [patterns, setPatterns] = useState<string[]>([]);
  const [sortOption, setSortOption] =
    useState<LookupSortOption>("점수 높은순");
  const [comments, setComments] = useState<LookupCommentItem[]>([]);
  const [loading, setLoading] = useState(false);

  const runSearch = async (nextPatterns: string[]) => {
    if (nextPatterns.length === 0) {
      setComments([]);
      return;
    }
    setLoading(true);
    try {
      const results = await searchCommentsByWriters(nextPatterns);
      setComments(results);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPattern = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    const next = patterns.includes(trimmed)
      ? patterns
      : [...patterns, trimmed];
    setPatterns(next);
    setInputValue("");
    runSearch(next);
  };

  const handleRemovePattern = (index: number) => {
    const next = patterns.filter((_, idx) => idx !== index);
    setPatterns(next);
    runSearch(next);
  };

  const handleClearAll = () => {
    setPatterns([]);
    setComments([]);
  };

  const sortedComments = useMemo(() => {
    const copy = [...comments];
    if (sortOption === "음평회 역순") {
      return copy.sort((a, b) => b.lecture_id - a.lecture_id);
    }
    if (sortOption === "음평회 순") {
      return copy.sort((a, b) => a.lecture_id - b.lecture_id);
    }
    if (sortOption === "점수 높은순") {
      return copy.sort((a, b) => b.rating - a.rating);
    }
    return copy.sort((a, b) => a.rating - b.rating);
  }, [comments, sortOption]);

  const stats = useMemo(() => {
    if (sortedComments.length === 0) return null;
    const sum = sortedComments.reduce((acc, cur) => acc + cur.rating, 0);
    const max = Math.max(...sortedComments.map((c) => c.rating));
    const min = Math.min(...sortedComments.map((c) => c.rating));
    return {
      count: sortedComments.length,
      avg: (sum / sortedComments.length).toFixed(2),
      max: max.toFixed(1),
      min: min.toFixed(1),
    };
  }, [sortedComments]);

  return (
    <PageContainer width="reading" className="space-y-6">
      {/* Header */}
      <header className="pb-5 border-b-2 border-[#242d3c]">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#242d3c] tracking-tight">
          한줄평 둘러보기
        </h1>
        <p className="text-sm text-[#808080] mt-1">
          닉네임을 입력해 멤버별 음평회 참여 기록과 평점 성향을 한눈에 비교해보세요
        </p>
      </header>

      {/* Search Console */}
      <section className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-[#808080] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddPattern();
              }
            }}
            placeholder="멤버 닉네임으로 한줄평 검색 (Enter로 복수 추가 가능)"
            className="w-full pl-10 pr-24 py-3 rounded-[7px] border border-[#bdc0c4] bg-white text-sm focus:outline-none focus:border-[#242d3c]"
          />
          <button
            type="button"
            onClick={handleAddPattern}
            aria-label="검색어 추가"
            className="absolute inset-y-1.5 right-1.5 px-3 rounded-[7px] bg-[#242d3c] text-[#f0f8ff] text-xs font-bold inline-flex items-center gap-1 hover:opacity-90 transition-opacity cursor-pointer"
          >
            <span>추가</span>
            <CornerDownLeft className="w-3.5 h-3.5 text-[#ff8080]" />
          </button>
        </div>

        {/* Active Pattern Chips */}
        {patterns.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {patterns.map((ptn, idx) => (
              <span
                key={`${ptn}-${idx}`}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#242d3c] text-xs font-bold text-[#f0f8ff]"
              >
                <span>{ptn}</span>
                <button
                  type="button"
                  onClick={() => handleRemovePattern(idx)}
                  aria-label={`${ptn} 제거`}
                  className="text-[#f0f8ff]/80 hover:text-[#ff8080] cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
            {patterns.length > 1 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="text-xs font-semibold text-[#808080] hover:text-[#242d3c] underline underline-offset-2 px-2 py-1 cursor-pointer"
              >
                모두 지우기
              </button>
            )}
          </div>
        )}
      </section>

      {/* Summary Statistics & Sort Controls */}
      <section className="p-4 rounded-[7px] bg-[#f3f3f3]/70 border border-[#bdc0c4]/60 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-sm text-[#171717] tabular-nums">
            {loading ? (
              <span className="font-semibold text-[#808080]">
                데이터를 조회하는 중입니다...
              </span>
            ) : stats ? (
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <span>
                  검색 결과 총{" "}
                  <strong className="text-[#242d3c] font-bold">
                    {stats.count}
                  </strong>
                  건
                </span>
                <span className="text-[#bdc0c4]">|</span>
                <span>
                  평균 평점{" "}
                  <strong className="font-lobster text-lg text-[#242d3c]">
                    {stats.avg}
                  </strong>
                </span>
                <span className="text-xs text-[#808080]">
                  (최고 {stats.max} / 최저 {stats.min})
                </span>
              </div>
            ) : (
              <span className="text-[#808080]">
                {patterns.length === 0
                  ? "상단 검색창에 닉네임을 입력하고 Enter를 눌러주세요."
                  : "일치하는 한줄평 기록이 없습니다."}
              </span>
            )}
          </div>

          <div className="inline-flex flex-wrap rounded-[7px] overflow-hidden border border-[#bdc0c4] divide-x divide-[#bdc0c4] bg-white self-start sm:self-auto">
            {SORT_OPTIONS.map((opt) => {
              const active = sortOption === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setSortOption(opt)}
                  className={cn(
                    "px-2.5 py-1.5 text-xs font-bold transition-colors cursor-pointer",
                    active
                      ? "bg-[#242d3c] text-[#f0f8ff]"
                      : "bg-white text-[#242d3c] hover:bg-[#f3f3f3]"
                  )}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Results List */}
      <div className="divide-y divide-[#bdc0c4]/50">
        {sortedComments.map((comment, idx) => (
          <LookupCommentRow
            key={comment.id}
            index={idx + 1}
            comment={comment}
          />
        ))}
      </div>
    </PageContainer>
  );
}
