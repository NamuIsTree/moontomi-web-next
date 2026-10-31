"use client";

import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export interface SortOptionItem<T extends string = string> {
  id: T;
  label: string;
  subLabel?: string;
  mainIcon: LucideIcon;
  subIcon: LucideIcon;
}

interface SortToggleGroupProps<T extends string> {
  options: SortOptionItem<T>[];
  selectedId: T;
  onChange: (option: SortOptionItem<T>) => void;
}

export function SortToggleGroup<T extends string>({
  options,
  selectedId,
  onChange,
}: SortToggleGroupProps<T>) {
  const current = options.find((o) => o.id === selectedId) ?? options[0];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 px-4 rounded-[7px] bg-[#f3f3f3]/70 border border-[#bdc0c4]/60 mb-6">
      <div className="flex items-baseline gap-2">
        <span className="font-bold text-sm sm:text-base text-[#242d3c]">
          {current?.label}
        </span>
        {current?.subLabel && (
          <span className="text-xs text-[#808080]">
            ({current.subLabel})
          </span>
        )}
      </div>

      <div className="inline-flex self-start sm:self-auto rounded-[7px] overflow-hidden border border-[#bdc0c4] divide-x divide-[#bdc0c4] bg-white">
        {options.map((opt) => {
          const MainIcon = opt.mainIcon;
          const SubIcon = opt.subIcon;
          const active = opt.id === selectedId;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange(opt)}
              title={opt.label}
              aria-label={opt.label}
              className={cn(
                "px-3.5 py-2 flex items-center justify-center gap-0.5 transition-colors cursor-pointer",
                active
                  ? "bg-[#242d3c] text-[#f0f8ff] cursor-default"
                  : "bg-white text-[#242d3c] hover:bg-[#f3f3f3]"
              )}
            >
              <MainIcon
                className={cn(
                  "w-4 h-4",
                  active ? "text-[#ff8080]" : "text-[#242d3c]"
                )}
              />
              <SubIcon className="w-3.5 h-3.5" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
