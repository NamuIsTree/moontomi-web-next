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
              "px-2 py-0.5 rounded-full border text-xs font-nohemi font-bold uppercase bg-black/65",
              archive.item.type === "album"
                ? "border-green-400 text-green-300"
                : "border-orange-400 text-orange-300"
            )}
          >
            {archive.item.type.toUpperCase()}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-black/65 font-mono text-xs font-bold text-[#f0f8ff] tabular-nums">
            #{archive.id}
          </span>
        </div>
      </div>

      {/* Separated Readable Metadata Footer */}
      <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
        <div>
          <div
            className={cn(
              "text-sm font-bold leading-snug line-clamp-1 break-keep",
              isSelected ? "text-white" : "text-[#171717]"
            )}
          >
            {archive.item.title}
          </div>
          <div
            className={cn(
              "text-xs truncate mt-0.5",
              isSelected ? "text-[#f0f8ff]/80" : "text-[#808080]"
            )}
          >
            {archive.item.artist} ({archive.item.release})
          </div>
        </div>

        <div className="pt-1 border-t border-[#bdc0c4]/30 flex items-center justify-between gap-2">
          <span
            className={cn(
              "text-xs truncate",
              isSelected ? "text-[#f0f8ff]/75" : "text-[#808080]"
            )}
          >
            by {archive.writer}
          </span>
          <div className="flex items-center gap-1 shrink-0 tabular-nums">
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
    </button>
  );
}
