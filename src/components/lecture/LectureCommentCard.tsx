"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  ChevronUp,
  Cog,
  FilePenLine,
} from "lucide-react";
import { StarRating } from "@/components/ui/StarRating";
import type { LectureCommentItem } from "@/types/domain";

interface LectureCommentCardProps {
  comment: LectureCommentItem;
  isLectureOpen: boolean; // true when lecture.rating !== null
}

const TRACK_MEDALS = [
  { label: "1ST", color: "#ffb400" },
  { label: "2ND", color: "#4a4f5a" },
  { label: "3RD", color: "#6e3732" },
];

export function LectureCommentCard({
  comment,
  isLectureOpen,
}: LectureCommentCardProps) {
  const [revealed, setRevealed] = useState(false);
  const showContent = isLectureOpen || revealed;

  return (
    <div className="w-full border border-[#bdc0c4] rounded-[20px] bg-white px-5 py-4">
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
          <Link
            href={`/comment/edit/${comment.id}`}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#242d3c] hover:bg-[#f3f3f3] rounded-[7px] transition-colors"
          >
            <FilePenLine className="w-3.5 h-3.5 text-[#ff8080]" />
            <span>수정</span>
          </Link>

          {!isLectureOpen && (
            <button
              type="button"
              onClick={() => setRevealed((prev) => !prev)}
              aria-label={revealed ? "한줄평 접기" : "한줄평 미리보기"}
              className="p-1.5 text-[#242d3c] hover:bg-[#f3f3f3] rounded-full transition-colors cursor-pointer"
            >
              {revealed ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Body: Either Open / Revealed Content OR Blind Rotating Gears */}
      {showContent ? (
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
              {comment.bests.slice(0, 3).map((track, idx) => {
                const medal = TRACK_MEDALS[idx] ?? TRACK_MEDALS[0];
                return (
                  <span
                    key={`${track}-${idx}`}
                    className="inline-flex items-center gap-1.5 py-0.5 bg-white text-xs sm:text-sm font-semibold"
                    style={{ color: medal.color }}
                  >
                    <span
                      className="font-nohemi text-xs font-bold px-1.5 py-0.2 rounded-full text-white shrink-0"
                      style={{ backgroundColor: medal.color }}
                    >
                      {medal.label}
                    </span>
                    <span className="break-keep">{track}</span>
                  </span>
                );
              })}
            </div>
          )}

          {/* Review Comment Text */}
          <div className="text-base text-[#171717] leading-relaxed pt-1 px-2 break-keep whitespace-pre-line">
            {comment.comment}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center gap-2.5 py-6">
          <Cog className="w-7 h-7 text-[#242d3c] animate-spin [animation-duration:5s]" />
          <Cog className="w-7 h-7 text-[#ff8080] animate-spin [animation-duration:5s]" />
          <Cog className="w-7 h-7 text-[#242d3c] animate-spin [animation-duration:5s]" />
        </div>
      )}
    </div>
  );
}
