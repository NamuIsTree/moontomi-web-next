"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { RankedLectureAlbum } from "@/types/domain";
import { cn } from "@/lib/utils";

interface AlbumRankCarouselProps {
  items: RankedLectureAlbum[];
}

const DRAG_STEP_PX = 115;

export function AlbumRankCarousel({ items }: AlbumRankCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [dragDeltaX, setDragDeltaX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const isPointerDownRef = useRef(false);
  const hasDraggedRef = useRef(false);
  const startXRef = useRef(0);
  const holdTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setActiveIndex(0);
    setDragDeltaX(0);
  }, [items]);

  // Auto-advance when not hovered or dragging
  useEffect(() => {
    if (items.length <= 1 || isDragging || isHovered) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % items.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [items.length, isDragging, isHovered]);

  const stopHoldStep = useCallback(() => {
    if (holdTimerRef.current !== null) {
      clearInterval(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => stopHoldStep();
  }, [stopHoldStep]);

  if (items.length === 0) return null;

  const total = items.length;

  const stepIndex = (delta: number) => {
    setActiveIndex((prev) => ((prev + delta) % total + total) % total);
  };

  const startHoldStep = (delta: -1 | 1) => {
    stopHoldStep();
    stepIndex(delta);
    holdTimerRef.current = setInterval(() => {
      stepIndex(delta);
    }, 260);
  };

  // Pointer / Touch Drag Handlers
  const handlePointerStart = (clientX: number) => {
    isPointerDownRef.current = true;
    hasDraggedRef.current = false;
    startXRef.current = clientX;
    setIsDragging(true);
    setDragDeltaX(0);
  };

  const handlePointerMove = (clientX: number) => {
    if (!isPointerDownRef.current) return;
    let delta = clientX - startXRef.current;

    if (Math.abs(delta) > 6) {
      hasDraggedRef.current = true;
    }

    // Continuously step activeIndex when dragging across multiple cards
    while (delta <= -DRAG_STEP_PX) {
      stepIndex(1);
      startXRef.current -= DRAG_STEP_PX;
      delta = clientX - startXRef.current;
    }
    while (delta >= DRAG_STEP_PX) {
      stepIndex(-1);
      startXRef.current += DRAG_STEP_PX;
      delta = clientX - startXRef.current;
    }

    setDragDeltaX(delta);
  };

  const handlePointerEnd = () => {
    if (!isPointerDownRef.current) return;
    isPointerDownRef.current = false;

    // Snap if dragged past threshold
    if (dragDeltaX <= -38) {
      stepIndex(1);
    } else if (dragDeltaX >= 38) {
      stepIndex(-1);
    }

    setIsDragging(false);
    setDragDeltaX(0);
  };

  const handleClickCapture = (e: React.MouseEvent<HTMLDivElement>) => {
    if (hasDraggedRef.current) {
      e.preventDefault();
      e.stopPropagation();
      hasDraggedRef.current = false;
    }
  };

  const fractionalShift = isDragging ? dragDeltaX / DRAG_STEP_PX : 0;

  const getRelativeOffset = (idx: number) => {
    let diff = idx - activeIndex;
    if (diff > total / 2) diff -= total;
    if (diff < -total / 2) diff += total;
    return diff + fractionalShift;
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        handlePointerEnd();
      }}
      className="relative w-full py-6 select-none overflow-hidden"
    >
      <div
        onMouseDown={(e) => {
          if (e.button !== 0) return;
          handlePointerStart(e.clientX);
        }}
        onMouseMove={(e) => handlePointerMove(e.clientX)}
        onMouseUp={handlePointerEnd}
        onTouchStart={(e) => {
          if (e.touches[0]) handlePointerStart(e.touches[0].clientX);
        }}
        onTouchMove={(e) => {
          if (e.touches[0]) handlePointerMove(e.touches[0].clientX);
        }}
        onTouchEnd={handlePointerEnd}
        onClickCapture={handleClickCapture}
        onDragStart={(e) => e.preventDefault()}
        className={cn(
          "relative h-[240px] sm:h-[300px] md:h-[340px] flex items-center justify-center",
          isDragging ? "cursor-grabbing" : "cursor-grab"
        )}
      >
        {items.map((item, idx) => {
          const offset = getRelativeOffset(idx);
          const absOffset = Math.abs(offset);
          if (absOffset > 2.6) return null;

          const translateX = offset * 68;
          const scale = Math.max(0.7, 1.06 - absOffset * 0.17);
          const zIndex = Math.round(30 - absOffset * 8);
          const opacity = Math.max(0.35, 1 - absOffset * 0.22);

          return (
            <Link
              key={`${item.id}-${idx}`}
              href={`/lecture/${item.id}`}
              draggable={false}
              className={cn(
                "absolute",
                isDragging
                  ? "transition-none"
                  : "transition-all duration-500 ease-out"
              )}
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
                  draggable={false}
                  className="w-full h-full object-cover"
                />
                {idx < 10 && (
                  <img
                    src={`/rank/translucent_${idx + 1}.png`}
                    alt={`Rank ${idx + 1}`}
                    draggable={false}
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
          onMouseDown={() => startHoldStep(-1)}
          onMouseUp={stopHoldStep}
          onMouseLeave={stopHoldStep}
          onTouchStart={() => startHoldStep(-1)}
          onTouchEnd={stopHoldStep}
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
          onMouseDown={() => startHoldStep(1)}
          onMouseUp={stopHoldStep}
          onMouseLeave={stopHoldStep}
          onTouchStart={() => startHoldStep(1)}
          onTouchEnd={stopHoldStep}
          aria-label="다음 앨범"
          className="p-1.5 rounded-full text-[#242d3c] hover:bg-[#f3f3f3] transition-colors cursor-pointer"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
