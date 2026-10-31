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
      className="group block w-full border-r border-b border-[#bdc0c4] rounded-r-[7px] rounded-bl-[7px] overflow-hidden bg-white hover:shadow-xs transition-all"
    >
      <div className="grid grid-cols-1 md:grid-cols-12">
        {/* Slanted Image */}
        <div className="md:col-span-4 relative">
          <div
            className="w-full h-[180px] md:h-[230px] bg-center bg-cover bg-no-repeat transition-all duration-300 [clip-path:polygon(100%_0,100%_80%,0%_98%,0_0%)] md:[clip-path:polygon(0_0,95%_0,90%_100%,0_100%)] md:group-hover:[clip-path:polygon(0_0,85%_0,75%_100%,0_100%)]"
            style={{ backgroundImage: `url(${review.image})` }}
          />
        </div>

        {/* Content */}
        <div className="md:col-span-8 p-4 flex flex-col justify-between">
          <div>
            <div className="flex justify-end text-xs text-[#808080] mb-1">
              {review.created_at}
            </div>

            <h2 className="font-myeongjo font-extrabold text-xl md:text-2xl text-[#171717] leading-snug break-keep">
              &ldquo;{review.title}&rdquo;
            </h2>

            <hr className="border-[#f3f3f3] my-2.5" />

            <p className="text-sm md:text-base text-[#171717]/85 line-clamp-3 min-h-[60px] md:min-h-[90px] break-keep">
              {review.description}
            </p>
          </div>

          <div className="flex items-center justify-between pt-3 text-sm">
            <div className="inline-flex items-center gap-1.5 text-[#808080]">
              <Eye className="w-4 h-4" />
              <span>조회수</span>
              <span className="text-[#171717] font-semibold">
                {review.views}
              </span>
            </div>

            <div className="text-[#171717] font-semibold">
              by {review.writer}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
