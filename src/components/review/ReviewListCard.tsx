import Link from "next/link";
import { Eye } from "lucide-react";
import type { ReviewListItem } from "@/types/domain";

interface ReviewListCardProps {
  review: ReviewListItem;
}

export function ReviewListCard({ review }: ReviewListCardProps) {
  return (
    <Link
      href={`/review/${review.id}`}
      className="group block w-full border border-[#bdc0c4] hover:border-[#242d3c] rounded-[7px] overflow-hidden bg-white transition-all"
    >
      <div className="grid grid-cols-1 md:grid-cols-12">
        {/* Editorial Cover Image Frame */}
        <div className="md:col-span-4 relative overflow-hidden bg-[#f3f3f3] border-b md:border-b-0 md:border-r border-[#bdc0c4]/50 min-h-[200px] md:min-h-[215px]">
          <div
            className="absolute inset-0 bg-center bg-cover bg-no-repeat transition-transform duration-500 ease-out group-hover:scale-105"
            style={{ backgroundImage: `url(${review.image})` }}
          />
          <span className="absolute top-3 left-3 z-10 px-2.5 py-0.5 rounded-[7px] bg-[#242d3c]/90 text-[#f0f8ff] text-xs font-bold tracking-wide">
            {review.type}
          </span>
        </div>

        {/* Article Summary Content */}
        <div className="md:col-span-8 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-[#808080] mb-2 tabular-nums">
              <span className="font-mono font-bold text-[#242d3c]">
                No. {String(review.id).padStart(2, "0")}
              </span>
              <span>{review.created_at}</span>
            </div>

            <h2 className="font-myeongjo font-extrabold text-xl md:text-2xl text-[#171717] group-hover:text-[#242d3c] leading-snug break-keep transition-colors">
              &ldquo;{review.title}&rdquo;
            </h2>

            <hr className="border-[#f3f3f3] my-3" />

            <p className="text-sm md:text-base text-[#171717]/80 leading-relaxed line-clamp-3 min-h-[60px] md:min-h-[76px] break-keep">
              {review.description}
            </p>
          </div>

          <div className="flex items-center justify-between pt-4 mt-2 border-t border-[#f3f3f3] text-xs sm:text-sm">
            <div className="inline-flex items-center gap-1.5 text-[#808080] tabular-nums">
              <Eye className="w-4 h-4 text-[#ff8080]" />
              <span>조회수</span>
              <span className="text-[#171717] font-bold">
                {review.views}
              </span>
            </div>

            <div className="font-myeongjo font-extrabold text-[#242d3c]">
              written by {review.writer}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
