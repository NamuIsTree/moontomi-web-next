"use client";

import { useState } from "react";
import { Share2, Check, ChevronUp, ChevronDown } from "lucide-react";
import { StarRating } from "@/components/ui/StarRating";
import type { ArchivePublicItem } from "@/types/domain";
import { cn } from "@/lib/utils";

interface ArchiveDetailBannerProps {
  selected: ArchivePublicItem;
}

export function ArchiveDetailBanner({ selected }: ArchiveDetailBannerProps) {
  const [copied, setCopied] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState(false);

  const handleCopyLink = async () => {
    const shareUrl = `${window.location.origin}/archive/${selected.id}`;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full rounded-[7px] bg-[#242d3c] text-[#f0f8ff] p-4 sm:p-5 shadow-md">
      {/* Top Meta Row */}
      <div className="flex items-center justify-between text-xs text-[#f0f8ff]/75 pb-3 border-b border-white/10 font-nohemi tabular-nums">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#ff8080]">
            #{selected.id.toString().padStart(3, "0")}
          </span>
          <span className="font-sans text-[#f0f8ff]/85">
            curated by <strong>{selected.writer}</strong>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span>{selected.date}</span>
          <button
            type="button"
            onClick={() => setMobileExpanded((prev) => !prev)}
            className="lg:hidden inline-flex items-center gap-1 px-2 py-0.5 rounded-[7px] bg-white/10 text-xs font-sans font-bold text-[#f0f8ff] cursor-pointer"
          >
            <span>{mobileExpanded ? "접기" : "상세/커버"}</span>
            {mobileExpanded ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronUp className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Artwork & Core Details */}
      <div className="pt-3.5 space-y-4">
        {/* Album Cover (Always visible on desktop, collapsible on mobile so it never hogs screen space) */}
        <div
          className={cn(
            "justify-center",
            mobileExpanded ? "flex" : "hidden lg:flex"
          )}
        >
          <img
            src={selected.item.image}
            alt={selected.item.title}
            className="w-[180px] h-[180px] lg:w-full lg:max-w-[260px] lg:h-auto aspect-square object-cover rounded-[7px] border border-white/15"
          />
        </div>

        {/* Type Badge + Share + Genres */}
        <div className="flex flex-wrap items-center justify-between gap-2">
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

          <div className="flex flex-wrap gap-1">
            {selected.item.genres.map((genre) => (
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

        {/* Title, Artist & Star Rating */}
        <div className="space-y-1.5">
          <h2 className="font-nohemi font-bold text-lg sm:text-xl text-white leading-snug break-keep">
            {selected.item.title}
          </h2>
          <div className="text-xs sm:text-sm text-[#f0f8ff]/80">
            {selected.item.artist} ({selected.item.release})
          </div>
          <div className="pt-1 flex items-center justify-between">
            <StarRating
              value={selected.rating}
              size={22}
              activeColor="#ffb400"
              inactiveColor="rgba(255,255,255,0.25)"
            />
            <span className="font-lobster text-2xl text-[#ff8080] tabular-nums">
              {selected.rating.toFixed(1)}
            </span>
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
  );
}
