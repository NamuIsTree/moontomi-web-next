"use client";

import { Play } from "lucide-react";
import { StarRating } from "@/components/ui/StarRating";
import type { ArchivePublicItem } from "@/types/domain";
import { cn } from "@/lib/utils";

interface ArchiveListItemProps {
  archive: ArchivePublicItem;
  isSelected?: boolean;
  onSelect: (archive: ArchivePublicItem) => void;
}

export function ArchiveListItem({
  archive,
  isSelected = false,
  onSelect,
}: ArchiveListItemProps) {
  const cleanRelease = archive.item.release?.trim() ?? "";

  return (
    <button
      type="button"
      onClick={() => onSelect(archive)}
      className={cn(
        "group w-full max-w-full min-w-0 overflow-hidden text-left flex items-center gap-3 sm:gap-4 p-2.5 sm:px-4 sm:py-3.5 rounded-[7px] border transition-all cursor-pointer focus:outline-none",
        isSelected
          ? "bg-[#242d3c] text-[#f0f8ff] border-[#242d3c]"
          : "bg-white text-[#171717] border-[#bdc0c4]/70 hover:border-[#242d3c] hover:bg-[#f3f3f3]/50"
      )}
    >
      {/* Archive Number & Type (Desktop sm+) */}
      <div className="hidden sm:flex flex-col items-center justify-center w-12 shrink-0 tabular-nums">
        <span
          className={cn(
            "font-mono text-xs font-bold",
            isSelected ? "text-[#ff8080]" : "text-[#808080]"
          )}
        >
          #{String(archive.id).padStart(3, "0")}
        </span>
        <span
          className={cn(
            "mt-1 inline-flex items-center justify-center px-1.5 pt-[3.5px] pb-[1.5px] rounded-[7px] text-xs leading-none font-nohemi font-bold uppercase tracking-wider",
            archive.item.type === "album"
              ? isSelected
                ? "bg-green-500/20 text-green-300"
                : "bg-green-600/10 text-green-700"
              : isSelected
                ? "bg-orange-400/20 text-orange-300"
                : "bg-orange-500/10 text-orange-700"
          )}
        >
          {archive.item.type === "album" ? "ALB" : "SGL"}
        </span>
      </div>

      {/* Cover Thumbnail */}
      <div className="relative w-12 h-12 sm:w-16 sm:h-16 shrink-0 rounded-[7px] overflow-hidden bg-[#242d3c] border border-[#bdc0c4]/50">
        <img
          src={archive.item.image}
          alt={archive.item.title}
          className="w-full h-full object-cover"
        />
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center bg-black/45 transition-opacity",
            isSelected
              ? "opacity-100"
              : "opacity-0 group-hover:opacity-100"
          )}
        >
          <Play
            className={cn(
              "w-4 h-4 sm:w-5 sm:h-5 fill-current",
              isSelected ? "text-[#ff8080]" : "text-white"
            )}
          />
        </div>
      </div>

      {/* Main Metadata: Title, Artist, Genres, Curator */}
      <div className="flex-1 min-w-0 overflow-hidden">
        <div className="flex items-center gap-1.5 min-w-0">
          <span
            className={cn(
              "sm:hidden font-mono text-[11px] font-bold tabular-nums shrink-0",
              isSelected ? "text-[#ff8080]" : "text-[#808080]"
            )}
          >
            #{String(archive.id).padStart(3, "0")}
          </span>
          <span
            className={cn(
              "sm:hidden inline-flex items-center justify-center px-1.5 pt-[3.5px] pb-[1.5px] rounded-[5px] text-[10px] leading-none font-nohemi font-bold uppercase tracking-wider shrink-0 border",
              archive.item.type === "album"
                ? isSelected
                  ? "bg-green-500/20 text-green-300 border-green-400/50"
                  : "bg-green-600/10 text-green-700 border-green-600/30"
                : isSelected
                  ? "bg-orange-400/20 text-orange-300 border-orange-400/50"
                  : "bg-orange-500/10 text-orange-700 border-orange-500/30"
            )}
          >
            {archive.item.type === "album" ? "ALB" : "SGL"}
          </span>
          <div
            className={cn(
              "font-bold text-sm sm:text-base truncate",
              isSelected ? "text-white" : "text-[#171717]"
            )}
          >
            {archive.item.title}
          </div>
        </div>

        <div
          className={cn(
            "text-xs sm:text-sm truncate mt-0.5",
            isSelected ? "text-[#f0f8ff]/80" : "text-[#808080]"
          )}
        >
          <span
            className={cn(
              "font-semibold",
              isSelected ? "text-[#f0f8ff]" : "text-[#171717]/85"
            )}
          >
            {archive.item.artist}
          </span>
          {cleanRelease ? <span> ({cleanRelease})</span> : null}
        </div>

        {/* Genre Chips & Curator Meta */}
        <div className="flex flex-wrap items-center gap-1.5 mt-1">
          {archive.item.genres.slice(0, 1).map((genre) => (
            <span
              key={genre.genre_id}
              className={cn(
                "px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold uppercase",
                isSelected
                  ? "bg-white/15 text-[#f0f8ff]"
                  : "bg-[#f3f3f3] text-[#242d3c]"
              )}
            >
              {genre.name !== "Root"
                ? `${genre.name} · ${genre.category}`
                : genre.category}
            </span>
          ))}
          <span
            className={cn(
              "text-[11px] sm:text-xs tabular-nums truncate",
              isSelected ? "text-[#f0f8ff]/70" : "text-[#808080]"
            )}
          >
            by {archive.writer}
            <span className="hidden sm:inline"> · {archive.date}</span>
          </span>
        </div>
      </div>

      {/* Rating Column */}
      <div className="shrink-0 text-right tabular-nums flex flex-col items-end justify-center pl-1">
        <div
          className={cn(
            "font-lobster text-lg sm:text-2xl leading-none",
            isSelected ? "text-[#ff8080]" : "text-[#242d3c]"
          )}
        >
          {archive.rating.toFixed(1)}
        </div>
        <div className="mt-1 hidden sm:block">
          <StarRating
            value={archive.rating}
            size={14}
            activeColor="#ffb400"
            inactiveColor={
              isSelected ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.15)"
            }
          />
        </div>
      </div>
    </button>
  );
}
