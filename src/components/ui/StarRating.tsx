"use client";

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
