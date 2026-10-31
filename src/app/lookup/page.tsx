"use client";

import { useState, useMemo } from "react";
import { CornerDownLeft, X } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { LookupCommentRow } from "@/components/lookup/LookupCommentRow";
import { searchCommentsByWriters } from "@/services/comment.service";
import type { LookupCommentItem } from "@/types/domain";

const SORT_OPTIONS = [
  "음평회 역순",
  "음평회 순",
  "점수 높은순",
  "점수 낮은순",
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

  return (
    <PageContainer width="reading" className="space-y-6">
      {/* Search Input */}
      <div className="pt-4">
        <div className="relative">
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
            placeholder="이름으로 한줄평 검색 (Enter)"
            className="w-full pl-4 pr-10 py-3 rounded-sm border border-[#bdc0c4] bg-white text-sm focus:outline-none focus:border-[#242d3c]"
          />
          <button
            type="button"
            onClick={handleAddPattern}
            aria-label="검색어 추가"
            className="absolute inset-y-0 right-0 px-3 flex items-center text-[#808080] hover:text-[#242d3c] cursor-pointer"
          >
            <CornerDownLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Pattern Chips */}
        {patterns.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-3">
            {patterns.map((ptn, idx) => (
              <span
                key={`${ptn}-${idx}`}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#242d3c] text-xs font-bold text-[#242d3c]"
              >
                <span>{ptn}</span>
                <button
                  type="button"
                  onClick={() => handleRemovePattern(idx)}
                  aria-label={`${ptn} 제거`}
                  className="hover:text-[#ff8080] cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Sort & Result Count */}
      <div className="space-y-3">
        <div className="flex justify-center">
          <select
            value={sortOption}
            onChange={(e) =>
              setSortOption(e.target.value as LookupSortOption)
            }
            className="px-3.5 py-2 rounded-sm border border-[#bdc0c4] bg-white text-sm font-semibold text-[#242d3c] focus:outline-none focus:border-[#242d3c]"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        <div className="text-center text-sm text-[#171717] pb-2 border-b border-[#bdc0c4]/50">
          {loading ? (
            "검색 중..."
          ) : (
            <>
              검색 결과는 총 <strong>{sortedComments.length}</strong> 개입니다.
            </>
          )}
        </div>
      </div>

      {/* Results */}
      <div>
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
