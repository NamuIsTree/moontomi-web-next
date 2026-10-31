import { Tag } from "lucide-react";
import type { GenreInfo } from "@/types/domain";

export function SeasonChip({ name }: { name: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[7px] bg-[#242d3c] text-[#f0f8ff] text-xs font-bold">
      <Tag className="w-3.5 h-3.5 text-[#ff8080]" />
      <span>{name}</span>
    </span>
  );
}

export function GenreChipList({
  genres,
  compact = false,
}: {
  genres: GenreInfo[];
  compact?: boolean;
}) {
  if (!genres || genres.length === 0) return null;

  if (compact) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-white/15 text-white text-xs font-bold uppercase tracking-wider">
        {genres[0]?.category}
      </span>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-1.5">
      {genres.map((genre) => (
        <span
          key={`${genre.category}-${genre.name}`}
          className="inline-flex items-center px-2.5 py-0.5 rounded-full border border-[#bdc0c4] bg-white text-xs font-semibold text-[#171717]"
        >
          {genre.name !== "Root" ? (
            <>
              <span className="pr-2 uppercase text-[#242d3c] font-bold">
                {genre.name}
              </span>
              <span className="h-3 w-px bg-[#bdc0c4]" />
              <span className="pl-2 uppercase text-[#808080]">
                {genre.category}
              </span>
            </>
          ) : (
            <span className="uppercase text-[#242d3c] font-bold">
              {genre.category}
            </span>
          )}
        </span>
      ))}
    </div>
  );
}
