import Link from "next/link";
import type { LookupCommentItem } from "@/types/domain";

interface LookupCommentRowProps {
  index: number;
  comment: LookupCommentItem;
}

export function LookupCommentRow({ index, comment }: LookupCommentRowProps) {
  return (
    <div className="border-b border-[#bdc0c4]/50">
      <Link
        href={`/lecture/${comment.lecture_id}`}
        className="block py-3 px-2 sm:px-3 hover:bg-[#f3f3f3]/70 transition-colors"
      >
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-bold text-[#242d3c]">#{index}</span>
          <span className="text-sm italic text-[#171717] truncate">
            {comment.lecture_id}회 - {comment.album.title}
          </span>
        </div>

        <div className="flex items-end justify-between gap-4 mt-1.5">
          <span className="text-sm font-bold text-[#171717] shrink-0">
            {comment.writer}
          </span>

          <div className="min-w-0 text-right flex-1">
            <div className="font-lobster text-2xl text-[#242d3c]">
              {comment.rating.toFixed(1)}
            </div>
            <div className="text-sm text-[#171717] truncate mt-0.5">
              {comment.text}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
