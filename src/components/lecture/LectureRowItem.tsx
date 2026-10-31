import Link from "next/link";
import type { LectureListItem } from "@/types/domain";

interface LectureRowItemProps {
  lecture: LectureListItem;
  displayOrder: number;
}

export function LectureRowItem({ lecture, displayOrder }: LectureRowItemProps) {
  const subtitle = lecture.artist.pronounce
    ? `(${lecture.artist.pronounce})`
    : lecture.artist.name_en
      ? `(${lecture.artist.name_en})`
      : "";

  return (
    <Link
      href={`/lecture/${lecture.id}`}
      className="group block py-3.5 px-2 sm:px-4 hover:bg-[#f3f3f3]/70 transition-colors"
    >
      <div className="flex items-center justify-between gap-3 sm:gap-5">
        {/* Session / Rank Number */}
        <div className="w-9 sm:w-12 flex flex-col items-center justify-center shrink-0 tabular-nums">
          <span className="font-mono text-xs sm:text-sm font-bold text-[#808080] group-hover:text-[#242d3c] transition-colors">
            #{displayOrder}
          </span>
        </div>

        {/* Album Cover */}
        <div className="shrink-0">
          <img
            src={lecture.image}
            alt={lecture.title}
            className="w-[68px] h-[68px] sm:w-[88px] sm:h-[88px] object-cover rounded-[7px] border border-[#bdc0c4]/70"
          />
        </div>

        {/* Title & Artist */}
        <div className="flex-1 min-w-0 px-1 sm:px-2">
          <div className="font-bold text-base sm:text-lg text-[#171717] group-hover:text-[#242d3c] leading-snug break-keep transition-colors">
            {lecture.title}
          </div>
          <div className="text-xs sm:text-sm text-[#808080] mt-1 break-keep">
            <span className="font-semibold text-[#171717]/80">
              {lecture.artist.name}
            </span>{" "}
            {subtitle && <span>{subtitle}</span>}
          </div>
        </div>

        {/* Score or OPEN Badge */}
        <div className="w-16 sm:w-24 flex items-center justify-end shrink-0 tabular-nums">
          {lecture.rating !== null ? (
            <span className="font-lobster text-2xl sm:text-3xl text-[#242d3c] group-hover:text-[#ff8080] transition-colors">
              {lecture.rating.toFixed(2)}
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full border-2 border-green-600 text-green-700 text-xs font-bold tracking-wider">
              OPEN
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
