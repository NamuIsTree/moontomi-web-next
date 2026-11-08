"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Loader2, Users, X } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { LookupCommentRow } from "@/components/lookup/LookupCommentRow";
import { fetchMembers } from "@/services/member.service";
import { searchCommentsByMembers } from "@/services/comment.service";
import type { LookupCommentItem, MemberPublicInfo } from "@/types/domain";
import { cn } from "@/lib/utils";

const SORT_OPTIONS = [
  "점수 높은순",
  "점수 낮은순",
  "음평회 역순",
  "음평회 순",
] as const;

type LookupSortOption = (typeof SORT_OPTIONS)[number];

export default function LookupPage() {
  const [members, setMembers] = useState<MemberPublicInfo[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [draftIds, setDraftIds] = useState<number[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [sortOption, setSortOption] =
    useState<LookupSortOption>("점수 높은순");
  const [comments, setComments] = useState<LookupCommentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [membersLoading, setMembersLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetchMembers()
      .then((list) => {
        if (mounted) setMembers(list);
      })
      .finally(() => {
        if (mounted) setMembersLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const runSearch = async (targetIds: number[]) => {
    if (targetIds.length === 0) {
      setComments([]);
      return;
    }
    setLoading(true);
    try {
      const results = await searchCommentsByMembers(targetIds);
      setComments(results);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    setDraftIds(selectedIds);
    setIsModalOpen(true);
  };

  const handleToggleDraftMember = (memberId: number) => {
    setDraftIds((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleApplySelection = () => {
    setSelectedIds(draftIds);
    setIsModalOpen(false);
    runSearch(draftIds);
  };

  const handleRemoveSelected = (memberId: number) => {
    const next = selectedIds.filter((id) => id !== memberId);
    setSelectedIds(next);
    runSearch(next);
  };

  const handleClearAll = () => {
    setSelectedIds([]);
    setComments([]);
  };

  const selectedMembers = useMemo(
    () => members.filter((m) => selectedIds.includes(m.member_id)),
    [members, selectedIds]
  );

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
      <header className="pb-5 border-b-2 border-[#242d3c] flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#242d3c] tracking-tight">
            한줄평 둘러보기
          </h1>
          <p className="text-sm text-[#808080] mt-1">
            멤버를 선택해 음평회 참여 기록과 평점 성향을 한눈에 비교해보세요
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-[7px] bg-[#242d3c] hover:bg-[#242d3c]/90 text-[#f0f8ff] text-xs sm:text-sm font-bold transition-colors shrink-0 cursor-pointer"
        >
          <Users className="w-4 h-4 text-[#ff8080]" />
          <span>
            {selectedMembers.length > 0
              ? `멤버 선택 (${selectedMembers.length}명)`
              : "멤버 선택하기"}
          </span>
        </button>
      </header>

      {/* Selected Member Chips */}
      <section className="space-y-3">
        <div
          className={cn(
            "grid transition-[grid-template-rows,opacity] duration-250 ease-out",
            selectedMembers.length > 0
              ? "grid-rows-[1fr] opacity-100"
              : "grid-rows-[0fr] opacity-0 pointer-events-none"
          )}
        >
          <div className="overflow-hidden">
            <div className="flex flex-wrap items-center gap-2">
              {selectedMembers.map((m) => (
                <span
                  key={m.member_id}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#242d3c] text-xs font-bold text-[#f0f8ff]"
                >
                  <span>{m.name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSelected(m.member_id)}
                    aria-label={`${m.name} 제거`}
                    className="text-[#f0f8ff]/80 hover:text-[#ff8080] cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
              {selectedMembers.length > 1 && (
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="text-xs font-semibold text-[#808080] hover:text-[#242d3c] underline underline-offset-2 px-2 py-1 cursor-pointer"
                >
                  모두 해제
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Summary Statistics & Sort Controls */}
      <section className="p-4 rounded-[7px] bg-[#f3f3f3]/70 border border-[#bdc0c4]/60 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-sm text-[#171717] tabular-nums">
            {loading ? (
              <div className="inline-flex items-center gap-2 text-[#808080]">
                <Loader2 className="w-4 h-4 animate-spin text-[#ff8080]" />
                <span> 조회 중...</span>
              </div>
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
              <button
                type="button"
                onClick={handleOpenModal}
                className="text-[#808080] hover:text-[#242d3c] font-semibold underline underline-offset-4 cursor-pointer text-left"
              >
                {selectedIds.length === 0
                  ? "상단의 ‘멤버 선택하기’ 버튼을 눌러 조회할 멤버를 선택해주세요."
                  : "선택한 멤버의 한줄평 기록이 없습니다."}
              </button>
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

      {/* Member Selection Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-[2px] flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="w-full max-w-[440px] rounded-[14px] bg-white border border-[#242d3c] shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 bg-[#242d3c] text-[#f0f8ff] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#ff8080]" />
                <h2 className="text-sm sm:text-base font-bold tracking-tight">
                  멤버 선택 (복수 선택 가능)
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                aria-label="닫기"
                className="p-1 rounded-full text-[#f0f8ff]/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between text-xs text-[#808080]">
                <span>조회할 멤버를 선택하세요 (과거 닉네임 기록까지 통합 조회됩니다)</span>
                {draftIds.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setDraftIds([])}
                    className="font-bold text-[#242d3c] hover:text-[#ff8080] underline underline-offset-2 shrink-0 ml-2 cursor-pointer"
                  >
                    초기화
                  </button>
                )}
              </div>

              {membersLoading ? (
                <div className="py-10 flex justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-[#ff8080]" />
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[320px] overflow-y-auto pr-1">
                  {members.map((m) => {
                    const checked = draftIds.includes(m.member_id);
                    return (
                      <button
                        key={m.member_id}
                        type="button"
                        onClick={() => handleToggleDraftMember(m.member_id)}
                        className={cn(
                          "px-3 py-2.5 rounded-[8px] border text-xs sm:text-sm font-bold flex items-center justify-between gap-1.5 transition-all cursor-pointer text-left",
                          checked
                            ? "bg-[#242d3c] border-[#242d3c] text-[#f0f8ff]"
                            : "bg-white border-[#bdc0c4] text-[#242d3c] hover:bg-[#f3f3f3]"
                        )}
                      >
                        <span className="truncate">{m.name}</span>
                        {checked && (
                          <Check className="w-3.5 h-3.5 text-[#ff8080] shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#f3f3f3]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-[7px] border border-[#bdc0c4] text-xs font-bold text-[#808080] hover:text-[#242d3c] hover:bg-[#f3f3f3] transition-colors cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={handleApplySelection}
                  className="px-5 py-2 rounded-[7px] bg-[#242d3c] hover:bg-[#242d3c]/90 text-[#f0f8ff] text-xs font-bold transition-colors cursor-pointer"
                >
                  {draftIds.length > 0
                    ? `${draftIds.length}명 한줄평 보기`
                    : "선택 해제"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
