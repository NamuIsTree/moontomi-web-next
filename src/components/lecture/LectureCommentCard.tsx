"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, FilePenLine } from "lucide-react";
import { StarRating } from "@/components/ui/StarRating";
import { useMemberAuth } from "@/context/MemberAuthContext";
import type { LectureCommentItem } from "@/types/domain";
import { cn } from "@/lib/utils";

interface LectureCommentCardProps {
  comment: LectureCommentItem;
  isLectureOpen: boolean; // true when lecture.rating !== null
}

const TRACK_COLORS = ["#ffb400", "#4a4f5a", "#6e3732"];

export function LectureCommentCard({
  comment,
  isLectureOpen,
}: LectureCommentCardProps) {
  const router = useRouter();
  const { member, openLoginModal } = useMemberAuth();
  const [revealed, setRevealed] = useState(isLectureOpen);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const prevLectureOpenRef = useRef(isLectureOpen);
  const unlockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const canShowEdit =
    !member ||
    !comment.member_id ||
    member.member_id === comment.member_id;

  const handleEditClick = () => {
    if (member) {
      if (comment.member_id && member.member_id !== comment.member_id) {
        alert("본인이 작성한 한줄평만 수정할 수 있습니다.");
        return;
      }
      router.push(`/comment/edit/${comment.id}`);
      return;
    }

    openLoginModal({
      title: "한줄평 수정 — 멤버 인증",
      subtitle: "본인이 작성한 한줄평을 수정하려면 비밀번호를 입력해주세요.",
      onSuccess: (loggedIn) => {
        if (comment.member_id && loggedIn.member_id !== comment.member_id) {
          alert("본인이 작성한 한줄평만 수정할 수 있습니다.");
          return;
        }
        router.push(`/comment/edit/${comment.id}`);
      },
    });
  };

  useEffect(() => {
    // If the lecture transitions from unopened -> opened live on the page,
    // play the padlock unlock animation and then reveal all comments.
    if (!prevLectureOpenRef.current && isLectureOpen) {
      if (!revealed) {
        setIsUnlocking(true);
        unlockTimerRef.current = setTimeout(() => {
          setIsUnlocking(false);
          setRevealed(true);
        }, 340);
      }
    } else if (isLectureOpen) {
      setRevealed(true);
    }
    prevLectureOpenRef.current = isLectureOpen;

    return () => {
      if (unlockTimerRef.current) clearTimeout(unlockTimerRef.current);
    };
  }, [isLectureOpen, revealed]);

  const handleToggleReveal = () => {
    if (isLectureOpen || isUnlocking) return;

    if (!revealed) {
      setIsUnlocking(true);
      unlockTimerRef.current = setTimeout(() => {
        setIsUnlocking(false);
        setRevealed(true);
      }, 320);
    } else {
      setRevealed(false);
    }
  };

  const showContent = isLectureOpen || revealed;

  return (
    <div className="w-full border border-[#bdc0c4] rounded-[20px] bg-white px-5 py-4 transition-shadow duration-300 hover:shadow-xs">
      {/* Header: Writer, Date & Actions */}
      <div className="flex items-center justify-between pb-3 border-b border-[#f3f3f3]">
        <div className="flex items-baseline gap-2.5 min-w-0">
          <span className="text-base font-bold text-[#242d3c] truncate">
            by {comment.writer}
          </span>
          {comment.date && (
            <span className="text-xs text-[#808080] tabular-nums shrink-0">
              {comment.date}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {canShowEdit && (
            <button
              type="button"
              onClick={handleEditClick}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#242d3c] hover:bg-[#f3f3f3] rounded-[7px] transition-colors cursor-pointer"
            >
              <FilePenLine className="w-3.5 h-3.5 text-[#ff8080]" />
              <span>수정</span>
            </button>
          )}

          {!isLectureOpen && (
            <button
              type="button"
              onClick={handleToggleReveal}
              aria-label={showContent ? "한줄평 접기" : "한줄평 잠금 해제"}
              className="p-1.5 text-[#242d3c] hover:bg-[#f3f3f3] rounded-full transition-colors cursor-pointer"
            >
              <ChevronDown
                className={cn(
                  "w-4 h-4 transition-transform duration-300 ease-out",
                  showContent || isUnlocking ? "rotate-180" : "rotate-0"
                )}
              />
            </button>
          )}
        </div>
      </div>

      {/* Locked State (Padlock with Unlocking Shackle Animation) */}
      {!isLectureOpen && (
        <div
          className={cn(
            "grid transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
            showContent
              ? "grid-rows-[0fr] opacity-0 pointer-events-none"
              : "grid-rows-[1fr] opacity-100"
          )}
        >
          <div className="overflow-hidden">
            <button
              type="button"
              onClick={handleToggleReveal}
              className={cn(
                "group w-full py-5 flex flex-col items-center justify-center gap-2 cursor-pointer select-none focus:outline-none",
                isUnlocking && "padlock-unlocking"
              )}
              aria-label="잠긴 한줄평 열기"
            >
              <div
                className={cn(
                  "padlock-badge flex items-center justify-center transition-colors duration-300",
                  isUnlocking
                    ? "text-[#ff8080]"
                    : "text-[#242d3c] group-hover:text-[#ff8080]"
                )}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className={cn(
                    "w-7 h-7 overflow-visible",
                    !isUnlocking && "padlock-idle"
                  )}
                  aria-hidden="true"
                >
                  {/* Shackle (Top Loop) */}
                  <path
                    d="M7.5 11V7.5a4.5 4.5 0 0 1 9 0V11"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="padlock-shackle"
                  />
                  {/* Lock Body */}
                  <rect
                    x="5"
                    y="11"
                    width="14"
                    height="10"
                    rx="2.5"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="white"
                  />
                  {/* Keyhole */}
                  <circle
                    cx="12"
                    cy="15.2"
                    r="1.25"
                    fill="currentColor"
                  />
                  <path
                    d="M12 16.2v1.8"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <span
                className={cn(
                  "text-xs font-bold tracking-tight transition-colors duration-200",
                  isUnlocking
                    ? "text-[#ff8080]"
                    : "text-[#808080] group-hover:text-[#242d3c]"
                )}
              >
                {isUnlocking ? "잠금 해제 중..." : "잠긴 한줄평 · 클릭하여 열기"}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Unlocked / Revealed Content with Smooth Collapse Transition */}
      <div
        className={cn(
          "grid transition-[grid-template-rows,opacity] duration-350 ease-[cubic-bezier(0.22,1,0.36,1)]",
          showContent
            ? "grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0 pointer-events-none"
        )}
      >
        <div className="overflow-hidden">
          <div className="pt-4 pb-1 text-center space-y-3">
            {/* Score & Stars */}
            <div className="flex flex-col items-center justify-center tabular-nums">
              <div className="font-lobster text-2xl sm:text-3xl text-[#242d3c] leading-none">
                {comment.rating.toFixed(1)}
              </div>
              <div className="flex justify-center mt-1">
                <StarRating
                  value={comment.rating / 2}
                  size={20}
                  activeColor="#ffb400"
                />
              </div>
            </div>

            {/* Best Track Picks (Gold / Silver / Bronze - Vertical Stack) */}
            {comment.bests.length > 0 && (
              <div className="flex flex-col items-center justify-center gap-1 pt-1">
                {comment.bests.slice(0, 3).map((track, idx) => (
                  <span
                    key={`${track}-${idx}`}
                    className="py-0.5 bg-white text-sm sm:text-base font-semibold break-keep"
                    style={{ color: TRACK_COLORS[idx] ?? TRACK_COLORS[0] }}
                  >
                    {track}
                  </span>
                ))}
              </div>
            )}

            {/* Review Comment Text */}
            <div className="text-base text-[#171717] leading-relaxed pt-1 px-2 break-keep whitespace-pre-line">
              {comment.comment}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
