"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Check, ChevronDown, Plus, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AdminSearchSelectOption {
  value: number;
  label: string;
  sublabel?: string;
  badge?: string;
  imageUrl?: string;
  colorHex?: string;
  searchText?: string;
}

interface AdminSearchSelectProps {
  options: AdminSearchSelectOption[];
  value: number;
  onChange: (value: number) => void;
  modalTitle: string;
  searchPlaceholder?: string;
  placeholder?: string;
  emptyText?: string;
  icon?: ReactNode;
  quickCreateLabel?: string;
  onQuickCreate?: () => void;
  disabled?: boolean;
}

/**
 * Searchable modal selector replacing long native <select> dropdowns in /admin.
 */
export function AdminSearchSelect({
  options,
  value,
  onChange,
  modalTitle,
  searchPlaceholder = "검색어 입력...",
  placeholder = "-- 선택해 주세요 --",
  emptyText = "검색 결과가 없습니다.",
  icon,
  quickCreateLabel,
  onQuickCreate,
  disabled = false,
}: AdminSearchSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selectedOption = useMemo(
    () => options.find((opt) => opt.value === value) ?? null,
    [options, value]
  );

  const filteredOptions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((opt) => {
      const target =
        opt.searchText ??
        `${opt.badge ?? ""} ${opt.label} ${opt.sublabel ?? ""}`;
      return target.toLowerCase().includes(q);
    });
  }, [options, query]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const handleOpen = () => {
    if (disabled) return;
    setQuery("");
    setOpen(true);
  };

  const handleSelect = (nextValue: number) => {
    onChange(nextValue);
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={handleOpen}
        className={cn(
          "w-full min-h-10 px-3 py-1.5 rounded-[7px] border border-[#bdc0c4] bg-white text-xs text-left flex items-center justify-between gap-2 transition-colors",
          disabled
            ? "opacity-60 cursor-not-allowed bg-[#f3f3f3]"
            : "hover:border-[#242d3c] focus:outline-none focus:border-[#242d3c] cursor-pointer"
        )}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {selectedOption?.imageUrl && (
            <img
              src={selectedOption.imageUrl}
              alt=""
              className="w-6 h-6 rounded-[4px] object-cover border border-[#bdc0c4]/50 shrink-0"
            />
          )}
          {selectedOption?.colorHex && (
            <span
              className="w-3.5 h-3.5 rounded-full border border-black/15 shrink-0"
              style={{
                backgroundColor: `#${selectedOption.colorHex.replace(/^#/, "")}`,
              }}
            />
          )}
          {selectedOption ? (
            <div className="min-w-0 flex-1 truncate text-[#242d3c]">
              {selectedOption.badge && (
                <span className="text-[#808080] font-semibold mr-1.5">
                  {selectedOption.badge}
                </span>
              )}
              <span className="font-semibold">{selectedOption.label}</span>
              {selectedOption.sublabel && (
                <span className="text-[#808080] ml-1.5">
                  · {selectedOption.sublabel}
                </span>
              )}
            </div>
          ) : (
            <span className="text-[#808080] truncate">{placeholder}</span>
          )}
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-[#808080] shrink-0" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px] flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={modalTitle}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[520px] max-h-[82vh] flex flex-col rounded-[14px] border border-[#242d3c] bg-white shadow-2xl overflow-hidden"
          >
            {/* Modal Header */}
            <div className="px-4 py-3 bg-[#242d3c] text-[#f0f8ff] flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2 font-bold text-sm min-w-0">
                {icon ?? <Search className="w-4 h-4 text-[#ff8080] shrink-0" />}
                <span className="truncate">{modalTitle}</span>
                <span className="inline-flex items-center px-1.5 pt-[3.5px] pb-[2px] rounded-[5px] bg-white/10 text-[#f0f8ff]/90 text-[11px] font-semibold leading-none shrink-0">
                  {options.length}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="닫기"
                className="p-1 rounded-[6px] text-[#f0f8ff]/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Input Bar */}
            <div className="p-3 border-b border-[#bdc0c4]/50 bg-[#f9fafb] flex items-center gap-2 shrink-0">
              <div className="relative flex-1 min-w-0">
                <Search className="w-3.5 h-3.5 text-[#808080] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full h-9 pl-8 pr-8 rounded-[7px] border border-[#bdc0c4] bg-white text-xs text-[#242d3c] focus:outline-none focus:border-[#242d3c]"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    aria-label="검색어 지우기"
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-[#808080] hover:text-[#242d3c] cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              {quickCreateLabel && onQuickCreate && (
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    onQuickCreate();
                  }}
                  className="h-9 px-3 rounded-[7px] bg-[#242d3c] hover:bg-[#1b222e] text-white text-xs font-bold inline-flex items-center gap-1 shrink-0 cursor-pointer transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 text-[#ff8080]" />
                  <span>{quickCreateLabel}</span>
                </button>
              )}
            </div>

            {/* Options List */}
            <div className="flex-1 overflow-y-auto divide-y divide-[#bdc0c4]/30">
              {filteredOptions.length === 0 ? (
                <div className="py-12 px-4 text-center text-xs text-[#808080] break-keep">
                  {emptyText}
                </div>
              ) : (
                filteredOptions.map((opt) => {
                  const isSelected = opt.value === value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleSelect(opt.value)}
                      className={cn(
                        "w-full px-4 py-2.5 text-left flex items-center justify-between gap-3 transition-colors cursor-pointer",
                        isSelected
                          ? "bg-[#242d3c]/5 hover:bg-[#242d3c]/10"
                          : "hover:bg-[#f9fafb]"
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {opt.imageUrl && (
                          <img
                            src={opt.imageUrl}
                            alt=""
                            className="w-10 h-10 rounded-[6px] object-cover border border-[#bdc0c4]/50 shrink-0"
                          />
                        )}
                        {opt.colorHex && (
                          <span
                            className="w-5 h-5 rounded-full border border-black/15 shrink-0"
                            style={{
                              backgroundColor: `#${opt.colorHex.replace(/^#/, "")}`,
                            }}
                          />
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 min-w-0">
                            {opt.badge && (
                              <span className="inline-flex items-center px-1.5 pt-[3.5px] pb-[2px] rounded-[4px] bg-[#242d3c]/8 text-[#242d3c] text-[10px] font-bold leading-none shrink-0">
                                {opt.badge}
                              </span>
                            )}
                            <span
                              className={cn(
                                "text-xs truncate",
                                isSelected
                                  ? "font-bold text-[#242d3c]"
                                  : "font-semibold text-[#242d3c]"
                              )}
                            >
                              {opt.label}
                            </span>
                          </div>
                          {opt.sublabel && (
                            <p className="text-[11px] text-[#808080] truncate mt-0.5">
                              {opt.sublabel}
                            </p>
                          )}
                        </div>
                      </div>
                      {isSelected && (
                        <Check className="w-4 h-4 text-[#ff8080] shrink-0" />
                      )}
                    </button>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-4 py-2.5 border-t border-[#bdc0c4]/50 bg-[#f9fafb] flex items-center justify-between text-[11px] text-[#808080] shrink-0">
              <span>
                {query.trim()
                  ? `검색 결과 ${filteredOptions.length}개 / 전체 ${options.length}개`
                  : `전체 ${options.length}개`}
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="h-7 px-3 rounded-[6px] border border-[#bdc0c4] bg-white text-xs font-bold text-[#242d3c] hover:bg-[#f3f3f3] cursor-pointer"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
