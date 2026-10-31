"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface HorizontalScrollRailProps {
  children: React.ReactNode;
  className?: string;
}

export function HorizontalScrollRail({
  children,
  className,
}: HorizontalScrollRailProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isDraggingRef = useRef(false);
  const hasDraggedRef = useRef(false);
  const startXRef = useRef(0);
  const startScrollLeftRef = useRef(0);
  const holdRafRef = useRef<number | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollBounds = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 2);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
  }, []);

  // Hover + Mouse Wheel -> Horizontal Scroll
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    updateScrollBounds();

    const handleWheel = (e: WheelEvent) => {
      // If user is already scrolling horizontally with a trackpad, let native behavior work
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        return;
      }
      if (e.deltaY === 0) return;

      const atLeftEdge = el.scrollLeft <= 0;
      const atRightEdge =
        el.scrollLeft + el.clientWidth >= el.scrollWidth - 1;

      if ((e.deltaY < 0 && atLeftEdge) || (e.deltaY > 0 && atRightEdge)) {
        // Allow normal page vertical scroll when rail has reached its boundary
        return;
      }

      e.preventDefault();
      el.scrollLeft += e.deltaY * 1.15;
      updateScrollBounds();
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    el.addEventListener("scroll", updateScrollBounds, { passive: true });
    window.addEventListener("resize", updateScrollBounds);

    return () => {
      el.removeEventListener("wheel", handleWheel);
      el.removeEventListener("scroll", updateScrollBounds);
      window.removeEventListener("resize", updateScrollBounds);
    };
  }, [updateScrollBounds, children]);

  // Stop continuous button hold scrolling
  const stopHoldScroll = useCallback(() => {
    if (holdRafRef.current !== null) {
      cancelAnimationFrame(holdRafRef.current);
      holdRafRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => stopHoldScroll();
  }, [stopHoldScroll]);

  // Continuous scroll while holding Left/Right arrow buttons
  const startHoldScroll = (direction: -1 | 1) => {
    stopHoldScroll();
    const el = containerRef.current;
    if (!el) return;

    const step = () => {
      if (!containerRef.current) return;
      containerRef.current.scrollLeft += direction * 9;
      updateScrollBounds();
      holdRafRef.current = requestAnimationFrame(step);
    };
    holdRafRef.current = requestAnimationFrame(step);
  };

  // Mouse Click & Hold Drag on the rail itself
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    const el = containerRef.current;
    if (!el) return;

    isDraggingRef.current = true;
    hasDraggedRef.current = false;
    startXRef.current = e.pageX - el.offsetLeft;
    startScrollLeftRef.current = el.scrollLeft;
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    const el = containerRef.current;
    if (!el) return;

    const x = e.pageX - el.offsetLeft;
    const walk = x - startXRef.current;
    if (Math.abs(walk) > 6) {
      hasDraggedRef.current = true;
    }
    if (hasDraggedRef.current) {
      e.preventDefault();
      el.scrollLeft = startScrollLeftRef.current - walk * 1.25;
      updateScrollBounds();
    }
  };

  const endMouseDrag = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsDragging(false);
  };

  // Prevent accidental link navigation when releasing after a drag
  const handleClickCapture = (e: React.MouseEvent<HTMLDivElement>) => {
    if (hasDraggedRef.current) {
      e.preventDefault();
      e.stopPropagation();
      hasDraggedRef.current = false;
    }
  };

  return (
    <div className="relative group/rail">
      {/* Left Hold-to-Scroll Button */}
      {canScrollLeft && (
        <button
          type="button"
          onMouseDown={() => startHoldScroll(-1)}
          onMouseUp={stopHoldScroll}
          onMouseLeave={stopHoldScroll}
          onTouchStart={() => startHoldScroll(-1)}
          onTouchEnd={stopHoldScroll}
          aria-label="왼쪽으로 스크롤"
          className="hidden sm:flex items-center justify-center absolute left-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-[#242d3c]/90 text-[#f0f8ff] hover:bg-[#ff8080] hover:text-[#242d3c] shadow-md opacity-0 group-hover/rail:opacity-100 transition-all cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      )}

      {/* Right Hold-to-Scroll Button */}
      {canScrollRight && (
        <button
          type="button"
          onMouseDown={() => startHoldScroll(1)}
          onMouseUp={stopHoldScroll}
          onMouseLeave={stopHoldScroll}
          onTouchStart={() => startHoldScroll(1)}
          onTouchEnd={stopHoldScroll}
          aria-label="오른쪽으로 스크롤"
          className="hidden sm:flex items-center justify-center absolute right-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-[#242d3c]/90 text-[#f0f8ff] hover:bg-[#ff8080] hover:text-[#242d3c] shadow-md opacity-0 group-hover/rail:opacity-100 transition-all cursor-pointer"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      )}

      {/* Scrollable Rail */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={endMouseDrag}
        onMouseLeave={endMouseDrag}
        onClickCapture={handleClickCapture}
        onDragStart={(e) => e.preventDefault()}
        className={cn(
          "flex gap-4 overflow-x-auto pb-1 select-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
          isDragging ? "cursor-grabbing" : "cursor-grab",
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}
