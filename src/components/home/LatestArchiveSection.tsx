"use client";

import Link from "next/link";
import { ArrowRight, CirclePlay, Disc3 } from "lucide-react";
import { HorizontalScrollRail } from "@/components/ui/HorizontalScrollRail";
import type { ArchivePublicItem } from "@/types/domain";
import { cn } from "@/lib/utils";

interface LatestArchiveSectionProps {
  archives: ArchivePublicItem[];
  loading?: boolean;
}

export function LatestArchiveSection({
  archives,
  loading = false,
}: LatestArchiveSectionProps) {
  const displayItems = archives.slice(0, 10);

  return (
    <section className="py-3 sm:py-4">
      <div className="flex items-center justify-between gap-2 mb-4 sm:mb-5">
        <div className="min-w-0">
          <h2 className="text-xl sm:text-2xl font-bold text-[#242d3c] tracking-tight">
            Archive Curate
          </h2>
          <p className="text-xs sm:text-sm text-[#808080] mt-0.5 truncate">
            새로 큐레이션된 아카이브 음반 · 싱글 10선
          </p>
        </div>

        <Link
          href="/archive"
          className="inline-flex items-center gap-1 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-[7px] text-xs sm:text-sm font-bold text-[#242d3c] hover:bg-[#f3f3f3] transition-colors shrink-0"
        >
          <span>더보기</span>
          <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#ff8080]" />
        </Link>
      </div>

      {loading ? (
        <div className="flex gap-3 sm:gap-4 overflow-hidden pb-2">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div
              key={idx}
              className="shrink-0 w-[160px] sm:w-[220px] h-[250px] sm:h-[310px] rounded-[7px] border border-[#bdc0c4]/60 bg-[#f3f3f3]/60 animate-pulse"
            />
          ))}
        </div>
      ) : displayItems.length === 0 ? (
        <div className="py-12 text-center text-sm text-[#808080] border border-[#bdc0c4]/50 rounded-[7px]">
          등록된 아카이브 데이터가 없습니다.
        </div>
      ) : (
        <HorizontalScrollRail className="gap-3 sm:gap-4">
          {displayItems.map((entry) => {
            const primaryGenre = entry.item.genres[0];
            const cleanRelease = entry.item.release?.trim() ?? "";

            return (
              <Link
                key={entry.id}
                href={`/archive/${entry.id}`}
                draggable={false}
                className="group shrink-0 w-[162px] sm:w-[220px] rounded-[7px] overflow-hidden border border-[#bdc0c4] bg-white hover:border-[#242d3c] transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Square Album Artwork */}
                  <div className="relative aspect-square w-full overflow-hidden bg-[#242d3c]">
                    <img
                      src={entry.item.image}
                      alt={entry.item.title}
                      draggable={false}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />

                    {/* Type Badge (ALBUM / SINGLE) */}
                    <span
                      className={cn(
                        "absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-[7px] bg-[#242d3c]/90 border text-[10px] sm:text-[11px] font-nohemi font-bold uppercase tracking-wider leading-none",
                        entry.item.type === "album"
                          ? "border-green-400/80 text-green-300"
                          : "border-orange-400/80 text-orange-300"
                      )}
                    >
                      <Disc3 className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      <span className="translate-y-[1px]">{entry.item.type}</span>
                    </span>

                    {/* Rating Pill */}
                    <span className="absolute bottom-2 right-2 px-2 sm:px-2.5 py-0.5 rounded-[7px] bg-[#242d3c]/90 text-[#ff8080] font-lobster text-sm sm:text-base leading-tight border border-white/15 tabular-nums">
                      {entry.rating.toFixed(1)}
                    </span>
                  </div>

                  {/* Metadata */}
                  <div className="p-2.5 sm:px-3.5 sm:pt-3 sm:pb-2.5">
                    <h3 className="font-bold text-xs sm:text-base text-[#171717] group-hover:text-[#242d3c] leading-snug line-clamp-1 break-keep">
                      {entry.item.title}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-[#808080] mt-0.5 truncate">
                      {entry.item.artist}
                      {cleanRelease ? ` (${cleanRelease})` : ""}
                    </p>

                    {primaryGenre && (
                      <div className="mt-1.5 sm:mt-2 flex flex-wrap gap-1">
                        <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-full bg-[#f3f3f3] text-[10px] sm:text-[11px] font-bold text-[#242d3c] uppercase tracking-tight truncate max-w-full">
                          {primaryGenre.name !== "Root"
                            ? `${primaryGenre.name} · ${primaryGenre.category}`
                            : primaryGenre.category}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="px-2.5 sm:px-3.5 py-2 sm:py-2.5 border-t border-[#f3f3f3] flex items-center justify-between gap-1 text-[11px] sm:text-xs text-[#808080]">
                  <span className="font-bold text-[#242d3c] truncate min-w-0">
                    by {entry.writer}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-[#242d3c] group-hover:text-[#ff8080] transition-colors shrink-0">
                    <CirclePlay className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#ff8080]" />
                    <span className="hidden sm:inline">LISTEN</span>
                  </span>
                </div>
              </Link>
            );
          })}
        </HorizontalScrollRail>
      )}
    </section>
  );
}
