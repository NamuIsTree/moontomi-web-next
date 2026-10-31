"use client";

import { StarRating } from "@/components/ui/StarRating";
import type { ArchivePublicItem } from "@/types/domain";
import { cn } from "@/lib/utils";

interface ArchiveGridTileProps {
  archive: ArchivePublicItem;
  isSelected?: boolean;
  onSelect: (archive: ArchivePublicItem) => void;
}

export function ArchiveGridTile({
  archive,
  isSelected = false,
  onSelect,
}: ArchiveGridTileProps) {
  const cleanRelease = archive.item.release?.trim() ?? "";

  return (
    <button
      type="button"
      onClick={() => onSelect(archive)}
      className={cn(
        "group w-full rounded-[7px] overflow-hidden text-left flex flex-col justify-between border transition-all cursor-pointer focus:outline-none",
        isSelected
          ? "bg-[#242d3c] text-[#f0f8ff] border-[#242d3c] ring-2 ring-inset ring-[#ff8080]"
          : "bg-white text-[#171717] border-[#bdc0c4]/80 hover:border-[#242d3c]"
      )}
    >
      {/* Square Cover Artwork */}
      <div className="relative aspect-square w-full overflow-hidden bg-[#242d3c]">
        <img
          src={archive.item.image}
          alt={archive.item.title}
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between">
          <span
            className={cn(
              "px-1.5 sm:px-2 py-0.5 rounded-full border text-[10px] sm:text-xs font-nohemi font-bold uppercase bg-black/65",
              archive.item.type === "album"
                ? "border-green-400 text-green-300"
                : "border-orange-400 text-orange-300"
            )}
          >
            {archive.item.type.toUpperCase()}
          </span>
          <span className="px-1.5 sm:px-2 py-0.5 rounded-full bg-black/65 font-mono text-[10px] sm:text-xs font-bold text-[#f0f8ff] tabular-nums">
            #{archive.id}
          </span>
        </div>
      </div>

      {/* Separated Readable Metadata Footer */}
      <div className="p-2.5 sm:p-3 flex-1 flex flex-col justify-between space-y-2">
        <div>
          <div
            className={cn(
              "text-xs sm:text-sm font-bold leading-snug line-clamp-1 break-keep",
              isSelected ? "text-white" : "text-[#171717]"
            )}
          >
            {archive.item.title}
          </div>
          <div
            className={cn(
              "text-[11px] sm:text-xs truncate mt-0.5",
              isSelected ? "text-[#f0f8ff]/80" : "text-[#808080]"
            )}
          >
            {archive.item.artist}
            {cleanRelease ? ` (${cleanRelease})` : ""}
          </div>
        </div>

        <div className="pt-1.5 border-t border-[#bdc0c4]/30 flex items-center justify-between gap-1.5">
          <span
            className={cn(
              "text-[11px] sm:text-xs truncate min-w-0",
              isSelected ? "text-[#f0f8ff]/75" : "text-[#808080]"
            )}
          >
            by {archive.writer}
          </span>
          <div className="flex items-center gap-1 shrink-0 tabular-nums">
            <span
              className={cn(
                "sm:hidden font-lobster text-sm",
                isSelected ? "text-[#ff8080]" : "text-[#242d3c]"
              )}
            >
              {archive.rating.toFixed(1)}
            </span>
            <div className="hidden sm:block">
              <StarRating
                value={archive.rating}
                size={13}
                activeColor="#ffb400"
                inactiveColor={
                  isSelected ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.15)"
                }
              />
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}
