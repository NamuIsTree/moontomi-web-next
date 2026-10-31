"use client";

import Link from "next/link";
import { ArrowRight, Eye } from "lucide-react";
import { HorizontalScrollRail } from "@/components/ui/HorizontalScrollRail";
import type { ReviewListItem } from "@/types/domain";

interface NewArrivalsSectionProps {
  reviews: ReviewListItem[];
  loading?: boolean;
}

export function NewArrivalsSection({
  reviews,
  loading = false,
}: NewArrivalsSectionProps) {
  const displayItems = reviews.slice(0, 10);

  return (
    <section className="py-3 sm:py-4">
      <div className="flex items-center justify-between gap-2 mb-4 sm:mb-5">
        <div className="min-w-0">
          <h2 className="text-xl sm:text-2xl font-bold text-[#242d3c] tracking-tight">
            New Arrivals
          </h2>
          <p className="text-xs sm:text-sm text-[#808080] mt-0.5 truncate">
            새로 도착한 칼럼 · 결산 · 비평 10선
          </p>
        </div>

        <Link
          href="/reviews"
          className="inline-flex items-center gap-1 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-[7px] text-xs sm:text-sm font-bold text-[#242d3c] hover:bg-[#f3f3f3] transition-colors shrink-0"
        >
          <span>더보기</span>
          <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#ff8080]" />
        </Link>
      </div>

      {loading ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className="shrink-0 w-[260px] sm:w-[300px] h-[310px] rounded-[7px] border border-[#bdc0c4]/60 bg-[#f3f3f3]/60 animate-pulse"
            />
          ))}
        </div>
      ) : displayItems.length === 0 ? (
        <div className="py-12 text-center text-sm text-[#808080] border border-[#bdc0c4]/50 rounded-[7px]">
          등록된 칼럼 데이터가 없습니다.
        </div>
      ) : (
        <HorizontalScrollRail>
          {displayItems.map((item) => (
            <Link
              key={item.id}
              href={`/review/${item.id}`}
              draggable={false}
              className="group shrink-0 w-[270px] sm:w-[310px] rounded-[7px] overflow-hidden border border-[#bdc0c4] bg-white hover:border-[#242d3c] transition-all flex flex-col justify-between"
            >
              <div>
                <div className="relative">
                  <div
                    className="w-full pt-[62%] bg-center bg-cover bg-no-repeat bg-[#242d3c] transition-all duration-300 [clip-path:polygon(100%_0,100%_80%,0%_98%,0_0%)] group-hover:[clip-path:polygon(100%_0,100%_76%,0%_94%,0_0%)]"
                    style={{ backgroundImage: `url(${item.image})` }}
                  />
                  <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-[7px] bg-[#242d3c]/90 text-[#f0f8ff] text-xs font-bold tracking-wide">
                    {item.type}
                  </span>
                  <span className="absolute bottom-0 right-3 text-xs font-bold text-[#808080] tabular-nums">
                    {item.created_at}
                  </span>
                </div>

                <div className="px-4 pt-2.5 pb-3">
                  <h3 className="font-myeongjo font-extrabold text-lg text-[#171717] group-hover:text-[#242d3c] leading-snug line-clamp-2 break-keep">
                    &ldquo;{item.title}&rdquo;
                  </h3>
                  <p className="text-sm text-[#171717]/80 leading-relaxed line-clamp-2 break-keep mt-2">
                    {item.description}
                  </p>
                </div>
              </div>

              <div className="px-4 py-3 border-t border-[#f3f3f3] flex items-center justify-between text-xs text-[#808080]">
                <span className="font-bold text-[#242d3c] truncate max-w-[60%]">
                  by {item.writer}
                </span>
                <span className="inline-flex items-center gap-1 tabular-nums">
                  <Eye className="w-3.5 h-3.5 text-[#ff8080]" />
                  <span>{item.views}</span>
                </span>
              </div>
            </Link>
          ))}
        </HorizontalScrollRail>
      )}
    </section>
  );
}
