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

const TRACK_COLORS = ["#ffb400", "#4a4f5a", "#6e3732"];

export function LectureCommentCard({
  comment,
  isLectureOpen,
}: LectureCommentCardProps) {
  const [revealed, setRevealed] = useState(false);
  const showContent = isLectureOpen || revealed;

  return (
    <div className="w-full max-w-[768px] mx-auto border border-[#bdc0c4] rounded-[20px] bg-white px-5 py-4 shadow-xs">
      {/* Header: Writer & Date */}
      <div className="flex items-center justify-between pb-3 font-bold">
        <span className="text-base text-[#171717] truncate">
          by {comment.writer}
        </span>
        {comment.date && (
          <span className="text-sm text-[#808080] font-normal shrink-0">
            {comment.date}
          </span>
        )}
      </div>

      {/* Body: Either Open / Revealed Content OR Blind Rotating Gears */}
      {showContent ? (
        <div className="text-center py-2 space-y-3">
          <div className="font-black">
            <div className="text-lg text-[#242d3c]">
              {comment.rating.toFixed(1)}
            </div>
            <div className="flex justify-center mt-0.5">
              <StarRating
                value={comment.rating / 2}
                size={22}
                activeColor="#ffb400"
              />
            </div>
          </div>

          {comment.bests.length > 0 && (
            <div className="space-y-1 py-1">
              {comment.bests.slice(0, 3).map((track, idx) => (
                <div
                  key={`${track}-${idx}`}
                  className="text-sm md:text-base font-semibold"
                  style={{ color: TRACK_COLORS[idx] ?? "#171717" }}
                >
                  {track}
                </div>
              ))}
            </div>
          )}

          <div className="text-base md:text-lg text-[#171717] pt-2 px-2 break-keep whitespace-pre-line">
            {comment.comment}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center gap-2 py-6">
          <Cog className="w-7 h-7 text-[#242d3c] animate-spin [animation-duration:5s]" />
          <Cog className="w-7 h-7 text-[#ff8080] animate-spin [animation-duration:5s]" />
          <Cog className="w-7 h-7 text-[#242d3c] animate-spin [animation-duration:5s]" />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-3 mt-2 border-t border-[#f3f3f3]">
        <div className="flex items-center gap-2">
          <Link
            href={`/comment/edit/${comment.id}`}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#242d3c] hover:bg-[#f3f3f3] rounded-sm transition-colors"
          >
            <FilePenLine className="w-3.5 h-3.5" />
            <span>수정</span>
          </Link>
        </div>

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
  );
}
