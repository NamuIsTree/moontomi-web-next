"use client";

import { useRef, useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number; // 0.0 to 5.0 (supports half increments)
  max?: number;
  size?: number;
  activeColor?: string;
  inactiveColor?: string;
  className?: string;
}

export function StarRating({
  value,
  max = 5,
  size = 22,
  activeColor = "#ffb400",
  inactiveColor = "#d1d5db",
  className,
}: StarRatingProps) {
  return (
    <div
      className={cn("inline-flex items-center gap-0.5 select-none", className)}
      aria-label={`별점 ${value.toFixed(1)} / ${max}`}
    >
      {Array.from({ length: max }).map((_, idx) => {
        const fillRatio = Math.max(0, Math.min(1, value - idx));
        return (
          <span
            key={idx}
            className="relative inline-block shrink-0"
            style={{ width: size, height: size }}
          >
            <Star
              size={size}
              strokeWidth={1.75}
              style={{ color: inactiveColor, fill: inactiveColor }}
              className="absolute inset-0"
            />
            {fillRatio > 0 && (
              <span
                className="absolute inset-y-0 left-0 overflow-hidden"
                style={{ width: `${fillRatio * 100}%` }}
              >
                <Star
                  size={size}
                  strokeWidth={1.75}
                  style={{ color: activeColor, fill: activeColor }}
                />
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
}

interface StarRatingInputProps {
  value: number; // 0.0 to 5.0
  onChange: (value: number) => void;
  max?: number;
  size?: number;
  className?: string;
}

/**
 * Interactive star rating input supporting click & pointer drag in 0.5 increments.
 */
export function StarRatingInput({
  value,
  onChange,
  max = 5,
  size = 26,
  className,
}: StarRatingInputProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  const computeRatingFromClientX = (clientX: number) => {
    const el = trackRef.current;
    if (!el) return value;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0) return value;
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const snapped = Math.round(ratio * max * 2) / 2;
    return Math.max(0, Math.min(max, snapped));
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    onChange(computeRatingFromClientX(e.clientX));
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    onChange(computeRatingFromClientX(e.clientX));
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    setDragging(false);
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      onChange(Math.min(max, Math.round((value + 0.5) * 2) / 2));
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      onChange(Math.max(0, Math.round((value - 0.5) * 2) / 2));
    }
  };

  return (
    <div className={cn("inline-flex items-center gap-3", className)}>
      <div
        ref={trackRef}
        role="slider"
        tabIndex={0}
        aria-label="별점 선택 (0.5 단위 드래그)"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onKeyDown={handleKeyDown}
        className="inline-flex items-center py-1 cursor-ew-resize touch-none select-none rounded-[6px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff8080]"
      >
        <StarRating value={value} max={max} size={size} />
      </div>
      <span className="font-lobster text-xl text-[#242d3c] tabular-nums min-w-[2.4rem]">
        {value.toFixed(1)}
      </span>
    </div>
  );
}
