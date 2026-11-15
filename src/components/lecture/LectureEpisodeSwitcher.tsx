"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Lock,
  Search,
  X,
} from "lucide-react";
import { fetchLectureNavOptions } from "@/services/lecture.service";
import type { LectureNavOption } from "@/types/domain";
import { cn } from "@/lib/utils";

interface LectureEpisodeSwitcherProps {
  currentId: number;
  currentTitle: string;
}

/**
 * Interactive album title trigger on the lecture detail page.
 * Opens a scrollable, searchable episode switcher (`XXX회 - 아티스트 (앨범명)`).
 */
export function LectureEpisodeSwitcher({
  currentId,
  currentTitle,
}: LectureEpisodeSwitcherProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const activeItemRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<LectureNavOption[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [highlightedIdx, setHighlightedIdx] = useState<number>(-1);

  // Lazy-load lightweight episode list when first opened
  useEffect(() => {
    if (!open || options !== null || loading) return;
    setLoading(true);
    fetchLectureNavOptions()
      .then((data) => setOptions(data))
      .finally(() => setLoading(false));
  }, [open, options, loading]);

  // Close on outside click or Escape
  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const filteredOptions = useMemo(() => {
    if (!options) return [];
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (item) =>
        String(item.id).includes(q) ||
        item.title.toLowerCase().includes(q) ||
        item.artist.toLowerCase().includes(q) ||
        (item.artist_en?.toLowerCase().includes(q) ?? false) ||
        (item.artist_pronounce?.toLowerCase().includes(q) ?? false)
    );
  }, [options, query]);

  // Previous / Next episode relative to descending order (index + 1 is older, index - 1 is newer)
  const { prevEpisode, nextEpisode } = useMemo(() => {
    if (!options) return { prevEpisode: null, nextEpisode: null };
    const idx = options.findIndex((item) => item.id === currentId);
    if (idx === -1) return { prevEpisode: null, nextEpisode: null };
    return {
      prevEpisode: idx < options.length - 1 ? options[idx + 1] : null,
      nextEpisode: idx > 0 ? options[idx - 1] : null,
    };
  }, [options, currentId]);

  // Center active episode in scrollable list when opened
  useEffect(() => {
    if (!open || loading || !options || query.trim()) return;
    const raf = requestAnimationFrame(() => {
      activeItemRef.current?.scrollIntoView({
        block: "center",
        behavior: "instant",
      });
    });
    return () => cancelAnimationFrame(raf);
  }, [open, loading, options, currentId, query]);

  // Reset search & highlight when closing
  useEffect(() => {
    if (!open) {
      setQuery("");
      setHighlightedIdx(-1);
    } else {
      requestAnimationFrame(() => {
        searchInputRef.current?.focus({ preventScroll: true });
      });
    }
  }, [open]);

  const handleSelect = (id: number) => {
    setOpen(false);
    if (id !== currentId) {
      router.push(`/lecture/${id}`);
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (filteredOptions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIdx((prev) =>
        prev < filteredOptions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIdx((prev) =>
        prev > 0 ? prev - 1 : filteredOptions.length - 1
      );
    } else if (e.key === "Enter" && highlightedIdx >= 0) {
      e.preventDefault();
      const target = filteredOptions[highlightedIdx];
      if (target) handleSelect(target.id);
    }
  };

  return (
    <div ref={containerRef} className="relative inline-block max-w-full">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="listbox"
        title="다른 회차로 이동"
        className="group inline-flex items-center justify-center gap-2 max-w-full px-3 py-1 rounded-[10px] hover:bg-[#f3f3f3] transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff8080]"
      >
        <h1 className="text-2xl sm:text-3xl font-bold italic text-[#171717] group-hover:text-[#242d3c] break-keep transition-colors">
          {currentTitle}
        </h1>
        <ChevronDown
          className={cn(
            "w-5 h-5 shrink-0 text-[#808080] group-hover:text-[#ff8080] transition-all duration-200",
            open && "rotate-180 text-[#ff8080]"
          )}
        />
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="음평회 회차 빠른 이동"
          className="absolute left-1/2 -translate-x-1/2 mt-2 z-40 w-[min(460px,calc(100vw-2rem))] rounded-[12px] bg-white border border-[#242d3c]/20 shadow-xl overflow-hidden text-left animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Top Bar: Prev / Next + Search */}
          <div className="p-2.5 bg-[#f3f3f3]/70 border-b border-[#bdc0c4]/60 space-y-2">
            <div className="flex items-center justify-between gap-2 text-[11px] font-bold">
              <button
                type="button"
                disabled={!prevEpisode}
                onClick={() => prevEpisode && handleSelect(prevEpisode.id)}
                className={cn(
                  "inline-flex items-center gap-1 px-2.5 pt-[5px] pb-[3.5px] rounded-[7px] border transition-colors leading-none",
                  prevEpisode
                    ? "border-[#bdc0c4] bg-white text-[#242d3c] hover:border-[#242d3c] hover:text-[#ff8080] cursor-pointer"
                    : "border-[#bdc0c4]/50 bg-[#f3f3f3] text-[#bdc0c4] cursor-not-allowed"
                )}
              >
                <ChevronLeft className="w-3.5 h-3.5 -translate-y-[0.5px]" />
                <span>
                  {prevEpisode ? `이전 (${prevEpisode.id}회)` : "첫 회차"}
                </span>
              </button>

              <span className="text-[11px] text-[#808080] tabular-nums">
                스크롤하여 회차 선택
              </span>

              <button
                type="button"
                disabled={!nextEpisode}
                onClick={() => nextEpisode && handleSelect(nextEpisode.id)}
                className={cn(
                  "inline-flex items-center gap-1 px-2.5 pt-[5px] pb-[3.5px] rounded-[7px] border transition-colors leading-none",
                  nextEpisode
                    ? "border-[#bdc0c4] bg-white text-[#242d3c] hover:border-[#242d3c] hover:text-[#ff8080] cursor-pointer"
                    : "border-[#bdc0c4]/50 bg-[#f3f3f3] text-[#bdc0c4] cursor-not-allowed"
                )}
              >
                <span>
                  {nextEpisode ? `다음 (${nextEpisode.id}회)` : "최신 회차"}
                </span>
                <ChevronRight className="w-3.5 h-3.5 -translate-y-[0.5px]" />
              </button>
            </div>

            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 text-[#808080] absolute left-2.5 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setHighlightedIdx(-1);
                }}
                onKeyDown={handleSearchKeyDown}
                placeholder="회차 번호, 아티스트, 앨범명 검색..."
                className="w-full pl-8 pr-7 py-1.5 rounded-[7px] bg-white border border-[#bdc0c4] text-xs text-[#171717] placeholder:text-[#808080] focus:outline-none focus:border-[#242d3c]"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-2 text-[#808080] hover:text-[#242d3c] cursor-pointer"
                  aria-label="검색어 지우기"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Scrollable Episode List */}
          <div
            ref={listRef}
            role="listbox"
            className="max-h-[300px] overflow-y-auto overscroll-contain divide-y divide-[#bdc0c4]/30"
          >
            {loading || options === null ? (
              <div className="py-10 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#ff8080]" />
              </div>
            ) : filteredOptions.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#808080] break-keep">
                일치하는 음평회 회차가 없습니다.
              </div>
            ) : (
              filteredOptions.map((item, idx) => {
                const isActive = item.id === currentId;
                const isHighlighted = idx === highlightedIdx;
                const labelText = item.artist
                  ? `${item.artist} (${item.title})`
                  : item.title;

                return (
                  <button
                    key={item.id}
                    ref={isActive ? activeItemRef : undefined}
                    type="button"
                    role="option"
                    aria-selected={isActive}
                    onClick={() => handleSelect(item.id)}
                    className={cn(
                      "w-full px-3 py-2.5 flex items-center gap-2 text-left text-xs transition-colors cursor-pointer",
                      isActive
                        ? "bg-[#242d3c] text-[#f0f8ff]"
                        : isHighlighted
                        ? "bg-[#f3f3f3] text-[#171717]"
                        : "bg-white text-[#171717] hover:bg-[#f3f3f3]"
                    )}
                  >
                    <span
                      className={cn(
                        "shrink-0 px-2 pt-[3.5px] pb-[2px] rounded-[5px] text-[11px] font-bold tabular-nums leading-none",
                        isActive
                          ? "bg-[#ff8080] text-[#242d3c]"
                          : "bg-[#f3f3f3] text-[#242d3c]"
                      )}
                    >
                      {item.id}회
                    </span>

                    <span
                      className={cn(
                        "text-[#808080] shrink-0",
                        isActive && "text-[#f0f8ff]/60"
                      )}
                    >
                      -
                    </span>

                    <span className="min-w-0 flex-1 truncate font-medium">
                      {labelText}
                    </span>

                    {!item.isOpen && (
                      <span
                        title="블라인드 진행 중"
                        className={cn(
                          "shrink-0 inline-flex items-center gap-0.5 text-[10px] font-bold",
                          isActive ? "text-[#ff8080]" : "text-[#808080]"
                        )}
                      >
                        <Lock className="w-3 h-3" />
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
