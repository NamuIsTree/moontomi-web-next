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
    <div className="w-full rounded-[7px] bg-[#242d3c] text-[#f0f8ff] p-4 sm:p-5 shadow-md transition-all">
      {/* Meta Row: #001 by [ writer ] & Date */}
      <div className="flex items-center justify-between text-xs text-[#f0f8ff]/75 pb-3 border-b border-white/10 font-nohemi tabular-nums">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#ff8080]">
            #{selected.id.toString().padStart(3, "0")}
          </span>
          <span className="font-sans text-[#f0f8ff]/85">
            curated by <strong>{selected.writer}</strong>
          </span>
        </div>
        <div>{selected.date}</div>
      </div>

      {/* Main Content Row */}
      <div className="flex flex-col xl:flex-row gap-5 items-stretch pt-3">
        {/* Desktop Cover Artwork */}
        <div className="hidden xl:block shrink-0">
          <img
            src={selected.item.image}
            alt={selected.item.title}
            className="w-[240px] h-[240px] object-cover rounded-[7px] border border-white/15"
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
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-xs transition-colors cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-green-400" />
                    <span className="text-green-400 font-bold">복사됨</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5 text-[#ff8080]" />
                    <span>공유</span>
                  </>
                )}
              </button>
            </div>

            {/* Genres */}
            <div className="flex flex-wrap justify-end gap-1.5">
              {selected.item.genres.slice(0, 3).map((genre) => (
                <span
                  key={genre.genre_id}
                  className="px-2.5 py-0.5 rounded-full bg-white/15 text-xs font-sans uppercase"
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
              <h1 className="font-nohemi font-bold text-xl sm:text-2xl text-white truncate">
                {selected.item.title}
              </h1>
              <div className="text-xs sm:text-sm text-[#f0f8ff]/80 mt-0.5">
                {selected.item.artist} ({selected.item.release})
              </div>
            </div>

            <div className="shrink-0">
              <StarRating
                value={selected.rating}
                size={26}
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
                    className="w-full h-[96px] sm:h-[152px] rounded-[12px] border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                ) : selected.item.links.spotify ? (
                  <iframe
                    src={selected.item.links.spotify}
                    title={selected.item.title}
                    className="w-full h-[96px] sm:h-[152px] rounded-[12px] border-0"
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
