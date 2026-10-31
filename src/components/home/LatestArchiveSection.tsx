"use client";

import Link from "next/link";
import { ArrowRight, CirclePlay, Disc3 } from "lucide-react";
import { HorizontalScrollRail } from "@/components/ui/HorizontalScrollRail";
import type { ArchivePublicItem } from "@/types/domain";

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
    <section className="py-4">
      <div className="flex items-end justify-between gap-4 mb-5">
        <div>
          <h2 className="text-2xl font-bold text-[#242d3c] tracking-tight">
            Archive Curate
          </h2>
          <p className="text-sm sm:text-base text-[#808080] mt-0.5">
            새로 큐레이션된 아카이브 음반 · 싱글 (최신 최대 10선)
          </p>
        </div>

        <Link
          href="/archive"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[7px] text-xs sm:text-sm font-bold text-[#242d3c] hover:bg-[#f3f3f3] transition-colors shrink-0"
        >
          <span>전체 아카이브 보기</span>
          <ArrowRight className="w-4 h-4 text-[#ff8080]" />
        </Link>
      </div>

      {loading ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div
              key={idx}
              className="shrink-0 w-[200px] sm:w-[220px] h-[310px] rounded-[7px] border border-[#bdc0c4]/60 bg-[#f3f3f3]/60 animate-pulse"
            />
          ))}
        </div>
      ) : displayItems.length === 0 ? (
        <div className="py-12 text-center text-sm text-[#808080] border border-[#bdc0c4]/50 rounded-[7px]">
          등록된 아카이브 데이터가 없습니다.
        </div>
      ) : (
        <HorizontalScrollRail>
          {displayItems.map((entry) => {
            const primaryGenre = entry.item.genres[0];
            return (
              <Link
                key={entry.id}
                href={`/archive/${entry.id}`}
                draggable={false}
                className="group shrink-0 w-[205px] sm:w-[225px] rounded-[7px] overflow-hidden border border-[#bdc0c4] bg-white hover:border-[#242d3c] transition-all flex flex-col justify-between"
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
                    <span className="absolute top-2.5 left-2.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-[7px] bg-[#242d3c]/90 text-[#f0f8ff] text-[11px] font-nohemi font-bold uppercase tracking-wider">
                      <Disc3 className="w-3 h-3 text-[#ff8080]" />
                      <span>{entry.item.type}</span>
                    </span>

                    {/* Rating Pill */}
                    <span className="absolute bottom-2.5 right-2.5 px-2.5 py-0.5 rounded-[7px] bg-[#242d3c]/90 text-[#ff8080] font-lobster text-base leading-tight border border-white/15 tabular-nums">
                      {entry.rating.toFixed(1)}
                    </span>
                  </div>

                  {/* Metadata */}
                  <div className="px-3.5 pt-3 pb-2.5">
                    <h3 className="font-bold text-sm sm:text-base text-[#171717] group-hover:text-[#242d3c] leading-snug line-clamp-1 break-keep">
                      {entry.item.title}
                    </h3>
                    <p className="text-xs text-[#808080] mt-0.5 line-clamp-1">
                      {entry.item.artist}
                      {entry.item.release
                        ? ` (${entry.item.release.trim()})`
                        : ""}
                    </p>

                    {primaryGenre && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#f3f3f3] text-[11px] font-bold text-[#242d3c] uppercase tracking-tight">
                          {primaryGenre.name !== "Root"
                            ? `${primaryGenre.name} · ${primaryGenre.category}`
                            : primaryGenre.category}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="px-3.5 py-2.5 border-t border-[#f3f3f3] flex items-center justify-between text-xs text-[#808080]">
                  <span className="font-bold text-[#242d3c] truncate max-w-[65%]">
                    by {entry.writer}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#242d3c] group-hover:text-[#ff8080] transition-colors">
                    <CirclePlay className="w-3.5 h-3.5 text-[#ff8080]" />
                    <span>LISTEN</span>
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
