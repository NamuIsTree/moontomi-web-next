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
    <div className="flex flex-col items-center text-center mb-6">
      <div className="font-bold text-base text-[#171717]">{current?.label}</div>
      {current?.subLabel ? (
        <div className="text-xs text-[#808080] mt-0.5">
          ( {current.subLabel} )
        </div>
      ) : (
        <div className="h-4" />
      )}

      <div className="inline-flex border border-[#bdc0c4] divide-x divide-[#bdc0c4] mt-2">
        {options.map((opt) => {
          const MainIcon = opt.mainIcon;
          const SubIcon = opt.subIcon;
          const active = opt.id === selectedId;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange(opt)}
              aria-label={opt.label}
              className={cn(
                "px-4 py-2.5 flex items-center justify-center gap-0.5 transition-colors cursor-pointer",
                active
                  ? "bg-[#242d3c] text-white cursor-default"
                  : "bg-white text-[#242d3c] hover:bg-[#f3f3f3]"
              )}
            >
              <MainIcon className="w-4 h-4" />
              <SubIcon className="w-4 h-4" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
