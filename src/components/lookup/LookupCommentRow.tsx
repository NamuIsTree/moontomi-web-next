import Link from "next/link";
import { StarRating } from "@/components/ui/StarRating";
import type { LookupCommentItem } from "@/types/domain";

interface LookupCommentRowProps {
  index: number;
  comment: LookupCommentItem;
}

export function LookupCommentRow({ index, comment }: LookupCommentRowProps) {
  return (
    <Link
      href={`/lecture/${comment.lecture_id}`}
      className="group block py-3.5 px-2 sm:px-4 hover:bg-[#f3f3f3]/70 transition-colors"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0 space-y-1.5">
          {/* Top Metadata: Rank, Session Badge, Album Title */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs font-bold text-[#808080] tabular-nums shrink-0">
              #{index}
            </span>
            <span className="px-2 py-0.5 rounded-[7px] bg-[#242d3c] text-[#f0f8ff] text-xs font-bold tabular-nums shrink-0">
              {comment.lecture_id}회
            </span>
            <span className="text-sm sm:text-base font-bold italic text-[#171717] group-hover:text-[#242d3c] truncate pr-1.5 transition-colors">
              {comment.album.title}
            </span>
          </div>

          {/* Writer & Comment Text */}
          <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2.5 pt-0.5">
            <span className="text-xs font-bold text-[#242d3c] shrink-0">
              by {comment.writer}
            </span>
            <p className="text-sm text-[#171717]/85 leading-relaxed break-keep line-clamp-2">
              {comment.text}
            </p>
          </div>
        </div>

        {/* Right: Score & Mini Stars */}
        <div className="shrink-0 text-right tabular-nums flex flex-col items-end">
          <div className="font-lobster text-2xl sm:text-3xl text-[#242d3c] group-hover:text-[#ff8080] leading-none transition-colors">
            {comment.rating.toFixed(1)}
          </div>
          <div className="mt-1 hidden sm:block">
            <StarRating
              value={comment.rating / 2}
              size={14}
              activeColor="#ffb400"
            />
          </div>
        </div>
      </div>
    </Link>
  );
}
