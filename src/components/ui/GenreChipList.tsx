import { Tag } from "lucide-react";
import type { GenreInfo } from "@/types/domain";

export function SeasonChip({ name }: { name: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-[#f3f3f3] text-[#242d3c] text-xs font-bold">
      <Tag className="w-3.5 h-3.5" />
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
          className="inline-flex items-center px-2.5 py-0.5 rounded-full border border-[#242d3c]/40 text-xs font-semibold text-[#171717]"
        >
          {genre.name !== "Root" ? (
            <>
              <span className="pr-2 uppercase">{genre.name}</span>
              <span className="h-3 w-px bg-[#242d3c]/40" />
              <span className="pl-2 uppercase text-[#808080]">
                {genre.category}
              </span>
            </>
          ) : (
            <span className="uppercase">{genre.category}</span>
          )}
        </span>
      ))}
    </div>
  );
}
