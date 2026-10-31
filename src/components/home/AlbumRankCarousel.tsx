"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { RankedLectureAlbum } from "@/types/domain";
import { cn } from "@/lib/utils";

interface AlbumRankCarouselProps {
  items: RankedLectureAlbum[];
}

export function AlbumRankCarousel({ items }: AlbumRankCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [items]);

  useEffect(() => {
    if (items.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % items.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [items.length]);

  if (items.length === 0) return null;

  const total = items.length;
  const getRelativeOffset = (idx: number) => {
    let diff = idx - activeIndex;
    if (diff > total / 2) diff -= total;
    if (diff < -total / 2) diff += total;
    return diff;
  };

  return (
    <div className="relative w-full py-6 select-none overflow-hidden">
      <div className="relative h-[240px] sm:h-[300px] md:h-[340px] flex items-center justify-center">
        {items.map((item, idx) => {
          const offset = getRelativeOffset(idx);
          const absOffset = Math.abs(offset);
          if (absOffset > 2) return null;

          const translateX = offset * 68;
          const scale = offset === 0 ? 1.06 : absOffset === 1 ? 0.88 : 0.74;
          const zIndex = 20 - absOffset * 5;
          const opacity = offset === 0 ? 1 : absOffset === 1 ? 0.85 : 0.55;

          return (
            <Link
              key={`${item.id}-${idx}`}
              href={`/lecture/${item.id}`}
              className="absolute transition-all duration-500 ease-out"
              style={{
                transform: `translateX(${translateX}%) scale(${scale})`,
                zIndex,
                opacity,
              }}
            >
              <div className="relative w-[190px] h-[190px] sm:w-[250px] sm:h-[250px] md:w-[290px] md:h-[290px] shadow-lg overflow-hidden bg-[#242d3c]">
                <img
                  src={item.image}
                  alt={item.title || `Rank ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
                {idx < 10 && (
                  <img
                    src={`/rank/translucent_${idx + 1}.png`}
                    alt={`Rank ${idx + 1}`}
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                  />
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Navigation Arrows & Dots */}
      <div className="flex items-center justify-center gap-3 mt-4">
        <button
          type="button"
          onClick={() =>
            setActiveIndex((prev) => (prev - 1 + total) % total)
          }
          aria-label="이전 앨범"
          className="p-1.5 rounded-full text-[#242d3c] hover:bg-[#f3f3f3] transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-1.5">
          {items.map((item, idx) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveIndex(idx)}
              aria-label={`${idx + 1}위 보기`}
              className={cn(
                "h-2 rounded-full transition-all cursor-pointer",
                idx === activeIndex
                  ? "w-6 bg-[#242d3c]"
                  : "w-2 bg-[#bdc0c4] hover:bg-[#808080]"
              )}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => setActiveIndex((prev) => (prev + 1) % total)}
          aria-label="다음 앨범"
          className="p-1.5 rounded-full text-[#242d3c] hover:bg-[#f3f3f3] transition-colors cursor-pointer"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
