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
        "group relative aspect-square w-full overflow-hidden text-left flex flex-col justify-between p-2.5 cursor-pointer transition-all",
        isSelected && "ring-2 ring-[#ff8080]"
      )}
    >
      {/* Background Cover with Zoom on Hover */}
      <div
        className="absolute inset-0 bg-center bg-cover bg-no-repeat transition-transform duration-500 ease-out group-hover:scale-110"
        style={{ backgroundImage: `url(${archive.item.image})` }}
      />
      <div className="absolute inset-0 bg-black/50 group-hover:bg-black/40 transition-colors" />

      {/* Top Type Badge */}
      <div className="relative z-10">
        <span
          className={cn(
            "inline-block px-2 py-0.5 rounded-full border-2 text-xs font-nohemi font-bold uppercase bg-black/35",
            archive.item.type === "album"
              ? "border-green-500 text-green-400"
              : "border-orange-400 text-orange-300"
          )}
        >
          {archive.item.type.toUpperCase()}
        </span>
      </div>

      {/* Bottom Title, Artist & Stars */}
      <div className="relative z-10 space-y-0.5">
        <div className="text-sm font-bold text-white leading-tight line-clamp-2 break-keep">
          {archive.item.title}
        </div>
        <div className="text-xs text-[#f0f8ff]/85 truncate">
          {archive.item.artist}
        </div>
        <div className="pt-0.5">
          <StarRating
            value={archive.rating}
            size={18}
            activeColor="#ffb400"
            inactiveColor="rgba(255,255,255,0.3)"
          />
        </div>
      </div>
    </button>
  );
}
