"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";
import { StarRating } from "@/components/ui/StarRating";
import type { ArchivePublicItem } from "@/types/domain";
import { cn } from "@/lib/utils";

interface ArchiveDetailBannerProps {
  selected: ArchivePublicItem;
}

export function ArchiveDetailBanner({ selected }: ArchiveDetailBannerProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    const shareUrl = `${window.location.origin}/archive/${selected.id}`;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full rounded-[7px] bg-[#242d3c]/90 text-white p-4 sm:p-5 shadow-md transition-all">
      {/* Meta Row: #001 by [ writer ] & Date */}
      <div className="flex items-center justify-between text-xs text-[#f0f8ff]/75 pb-3 font-nohemi">
        <div>
          <span className="font-bold">
            #{selected.id.toString().padStart(3, "0")}
          </span>
          <span className="hidden sm:inline pl-2 font-sans">
            by [ {selected.writer} ]
          </span>
        </div>
        <div>{selected.date}</div>
      </div>

      {/* Main Content Row */}
      <div className="flex flex-col xl:flex-row gap-5 items-stretch">
        {/* Desktop Cover Artwork */}
        <div className="hidden xl:block shrink-0">
          <img
            src={selected.item.image}
            alt={selected.item.title}
            className="w-[260px] h-[260px] object-contain"
          />
        </div>

        {/* Info & Player */}
        <div className="flex-1 flex flex-col justify-between space-y-3 min-w-0">
          {/* Type Chip + Share + Genre Chips */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "px-2.5 py-0.5 rounded-full border-2 text-xs font-nohemi font-bold uppercase tracking-wider bg-black/35",
                  selected.item.type === "album"
                    ? "border-green-500 text-green-400"
                    : "border-orange-400 text-orange-300"
                )}
              >
                {selected.item.type.toUpperCase()}
              </span>

              <button
                type="button"
                onClick={handleCopyLink}
                title="공유 링크 복사"
                aria-label="공유 링크 복사"
                className="p-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Share2 className="w-4 h-4 text-[#f0f8ff]" />
                )}
              </button>
            </div>

            {/* Genres */}
            <div className="flex flex-wrap justify-end gap-1">
              {selected.item.genres.slice(0, 3).map((genre) => (
                <span
                  key={genre.genre_id}
                  className="px-2 py-0.5 rounded-full bg-white/15 text-xs font-sans uppercase"
                >
                  {genre.name !== "Root"
                    ? `${genre.name} | ${genre.category}`
                    : genre.category}
                </span>
              ))}
            </div>
          </div>

          {/* Title, Artist & Rating */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="min-w-0">
              <h1 className="font-nohemi font-bold text-2xl text-white truncate">
                {selected.item.title}
              </h1>
              <div className="text-sm text-[#f0f8ff]/75 mt-0.5">
                {selected.item.artist} ({selected.item.release})
              </div>
            </div>

            <div className="shrink-0">
              <StarRating
                value={selected.rating}
                size={28}
                activeColor="#ffb400"
                inactiveColor="rgba(255,255,255,0.25)"
              />
            </div>
          </div>

          {/* Embedded Player (YouTube or Spotify) */}
          {selected.item.links &&
            (selected.item.links.youtube || selected.item.links.spotify) && (
              <div className="pt-1">
                {selected.item.links.youtube ? (
                  <iframe
                    src={selected.item.links.youtube}
                    title={selected.item.title}
                    className="w-full h-[90px] sm:h-[152px] rounded-[12px] border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                ) : selected.item.links.spotify ? (
                  <iframe
                    src={selected.item.links.spotify}
                    title={selected.item.title}
                    className="w-full h-[90px] sm:h-[152px] rounded-[12px] border-0"
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                  />
                ) : null}
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
