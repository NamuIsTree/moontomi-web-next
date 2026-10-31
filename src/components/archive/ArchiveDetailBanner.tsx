"use client";

import { useState } from "react";
import { Share2, Check, ChevronUp, ChevronDown, Disc3 } from "lucide-react";
import { StarRating } from "@/components/ui/StarRating";
import type { ArchivePublicItem } from "@/types/domain";
import { cn } from "@/lib/utils";

interface ArchiveDetailBannerProps {
  selected: ArchivePublicItem;
  defaultExpandedOnMobile?: boolean;
}

export function ArchiveDetailBanner({
  selected,
  defaultExpandedOnMobile = false,
}: ArchiveDetailBannerProps) {
  const [copied, setCopied] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState(defaultExpandedOnMobile);

  const handleCopyLink = async () => {
    const shareUrl = `${window.location.origin}/archive/${selected.id}`;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const cleanRelease = selected.item.release?.trim() ?? "";

  return (
    <div className="w-full rounded-[7px] bg-[#242d3c]/92 backdrop-blur-md text-[#f0f8ff] p-3.5 sm:p-5 shadow-lg ring-1 ring-black/10">
      {/* Mobile Compact Mini-Player Header (< lg) */}
      <div className="flex lg:hidden items-center gap-3">
        <img
          src={selected.item.image}
          alt={selected.item.title}
          className="w-12 h-12 rounded-[6px] object-cover shrink-0 border border-white/15"
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-[11px] text-[#f0f8ff]/75">
            <span className="font-mono font-bold text-[#ff8080]">
              #{String(selected.id).padStart(3, "0")}
            </span>
            <span className="px-1.5 py-0.2 rounded bg-white/10 font-nohemi font-bold text-[10px] uppercase text-[#f0f8ff]">
              {selected.item.type}
            </span>
            <span className="truncate">by {selected.writer}</span>
          </div>
          <div className="font-bold text-sm text-white truncate mt-0.5">
            {selected.item.title}
          </div>
          <div className="text-xs text-[#f0f8ff]/75 truncate">
            {selected.item.artist}
            {cleanRelease ? ` (${cleanRelease})` : ""}
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-2">
          <span className="font-lobster text-xl text-[#ff8080] tabular-nums">
            {selected.rating.toFixed(1)}
          </span>
          <button
            type="button"
            onClick={() => setMobileExpanded((prev) => !prev)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-[7px] bg-white/15 hover:bg-white/25 text-xs font-bold text-[#f0f8ff] cursor-pointer"
          >
            <span>{mobileExpanded ? "접기" : "플레이어"}</span>
            {mobileExpanded ? (
              <ChevronUp className="w-3.5 h-3.5 text-[#ff8080]" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-[#ff8080]" />
            )}
          </button>
        </div>
      </div>

      {/* Desktop Top Meta Row (lg+) */}
      <div className="hidden lg:flex items-center justify-between text-xs text-[#f0f8ff]/75 pb-3 border-b border-white/10 font-nohemi tabular-nums">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-bold text-[#ff8080] shrink-0">
            #{selected.id.toString().padStart(3, "0")}
          </span>
          <span className="font-sans text-[#f0f8ff]/85 truncate">
            curated by <strong>{selected.writer}</strong>
          </span>
        </div>
        <span className="shrink-0">{selected.date}</span>
      </div>

      {/* Expanded Details & Player (Always visible on lg+, player-only toggle on mobile) */}
      <div
        className={cn(
          "pt-3 lg:pt-3.5 mt-3 lg:mt-0 border-t border-white/10 lg:border-t-0 space-y-3.5",
          mobileExpanded ? "block" : "hidden lg:block"
        )}
      >
        {/* Album Cover (Desktop lg+ only — mobile already has thumbnail in compact bar) */}
        <div className="hidden lg:flex justify-center">
          <img
            src={selected.item.image}
            alt={selected.item.title}
            className="w-full max-w-[250px] h-auto aspect-square object-cover rounded-[7px] border border-white/15"
          />
        </div>

        {/* Type Badge + Share + Genres */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-xs font-nohemi font-bold uppercase tracking-wider bg-black/35",
                selected.item.type === "album"
                  ? "border-green-400 text-green-300"
                  : "border-orange-400 text-orange-300"
              )}
            >
              <Disc3 className="w-3 h-3" />
              <span>{selected.item.type.toUpperCase()}</span>
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
                className="px-2 py-0.5 rounded-full bg-white/15 text-[11px] font-sans uppercase"
              >
                {genre.name !== "Root"
                  ? `${genre.name} | ${genre.category}`
                  : genre.category}
              </span>
            ))}
          </div>
        </div>

        {/* Title, Artist & Star Rating (Desktop lg+) */}
        <div className="hidden lg:block space-y-1.5">
          <h2 className="font-nohemi font-bold text-lg sm:text-xl text-white leading-snug break-keep">
            {selected.item.title}
          </h2>
          <div className="text-xs sm:text-sm text-[#f0f8ff]/80">
            {selected.item.artist}
            {cleanRelease ? ` (${cleanRelease})` : ""}
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
                  className="w-full aspect-video max-h-[180px] rounded-[10px] border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              ) : selected.item.links.spotify ? (
                <iframe
                  src={selected.item.links.spotify}
                  title={selected.item.title}
                  className="w-full h-[80px] sm:h-[152px] rounded-[10px] border-0"
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
