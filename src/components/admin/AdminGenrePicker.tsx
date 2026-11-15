"use client";

import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AdminGenreOption {
  genre_id: number;
  category: string;
  name: string;
}

interface AdminGenrePickerProps {
  genres: AdminGenreOption[];
  categories: readonly string[];
  selectedIds: number[];
  onChange: (nextIds: number[]) => void;
}

/**
 * Category-dropdown genre multi-selector for Admin album/single forms.
 */
export function AdminGenrePicker({
  genres,
  categories,
  selectedIds,
  onChange,
}: AdminGenrePickerProps) {
  const availableCategories = useMemo(
    () => categories.filter((cat) => genres.some((g) => g.category === cat)),
    [categories, genres]
  );

  const [selectedCategory, setSelectedCategory] = useState<string>(
    () => availableCategories[0] ?? "ALL"
  );

  const activeCategory =
    selectedCategory === "ALL" || availableCategories.includes(selectedCategory)
      ? selectedCategory
      : availableCategories[0] ?? "ALL";

  const visibleGenres = useMemo(() => {
    if (activeCategory === "ALL") return genres;
    return genres.filter((g) => g.category === activeCategory);
  }, [genres, activeCategory]);

  const selectedGenres = useMemo(
    () => genres.filter((g) => selectedIds.includes(g.genre_id)),
    [genres, selectedIds]
  );

  const toggleGenre = (genreId: number) => {
    if (selectedIds.includes(genreId)) {
      onChange(selectedIds.filter((id) => id !== genreId));
    } else {
      onChange([...selectedIds, genreId]);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <label className="block text-xs font-bold text-[#242d3c]">
          장르 선택 * ({selectedIds.length}개 선택됨)
        </label>
        <select
          value={activeCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          aria-label="장르 카테고리 선택"
          className="h-8 px-2.5 rounded-[6px] border border-[#bdc0c4] bg-white text-xs font-semibold text-[#242d3c] focus:outline-none focus:border-[#242d3c] cursor-pointer"
        >
          <option value="ALL">전체 카테고리 ({genres.length})</option>
          {availableCategories.map((cat) => {
            const count = genres.filter((g) => g.category === cat).length;
            return (
              <option key={cat} value={cat}>
                {cat} ({count})
              </option>
            );
          })}
        </select>
      </div>

      {/* Selected genre summary chips */}
      {selectedGenres.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedGenres.map((g) => (
            <button
              key={g.genre_id}
              type="button"
              onClick={() => toggleGenre(g.genre_id)}
              title="클릭하여 선택 해제"
              className="inline-flex items-center gap-1 px-2 pt-[4px] pb-[3px] rounded-[5px] bg-[#242d3c] text-white text-[11px] font-semibold leading-none hover:bg-[#1b222e] cursor-pointer"
            >
              <span className="text-[#ff8080]">{g.category}</span>
              <span>{g.name}</span>
              <X className="w-3 h-3 text-[#f0f8ff]/80" />
            </button>
          ))}
        </div>
      )}

      {/* Genre options for active category */}
      <div className="max-h-40 overflow-y-auto p-3 rounded-[7px] border border-[#bdc0c4] bg-[#f9fafb]">
        <div className="flex flex-wrap gap-1.5">
          {visibleGenres.map((g) => {
            const selected = selectedIds.includes(g.genre_id);
            return (
              <button
                key={g.genre_id}
                type="button"
                onClick={() => toggleGenre(g.genre_id)}
                className={cn(
                  "px-2 py-1 rounded-[5px] text-[11px] font-semibold border transition-colors cursor-pointer",
                  selected
                    ? "bg-[#242d3c] text-white border-[#242d3c]"
                    : "bg-white text-[#242d3c] border-[#bdc0c4] hover:border-[#242d3c]"
                )}
              >
                {activeCategory === "ALL" ? `${g.category} · ${g.name}` : g.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
