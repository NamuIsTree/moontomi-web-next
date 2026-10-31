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
    <div className="border-b border-[#bdc0c4]/50">
      <Link
        href={`/lecture/${lecture.id}`}
        className="block py-3.5 px-2 sm:px-4 hover:bg-[#f3f3f3]/60 transition-colors"
      >
        <div className="flex items-center justify-between gap-3">
          {/* Desktop Order Number */}
          <div className="hidden md:flex w-10 items-center justify-center text-sm font-bold text-[#808080] shrink-0">
            {displayOrder}
          </div>

          {/* Album Cover */}
          <div className="shrink-0">
            <img
              src={lecture.image}
              alt={lecture.title}
              className="w-[70px] h-[70px] md:w-[100px] md:h-[100px] object-cover"
            />
          </div>

          {/* Title & Artist */}
          <div className="flex-1 text-center px-2 min-w-0">
            <div className="font-bold text-base md:text-xl text-[#171717] break-keep">
              {lecture.title}
            </div>
            <div className="text-sm md:text-base text-[#808080] mt-0.5 break-keep">
              {lecture.artist.name}{" "}
              {subtitle && <span>{subtitle}</span>}
            </div>
          </div>

          {/* Score or OPEN Badge */}
          <div className="w-16 md:w-20 flex items-center justify-center shrink-0">
            {lecture.rating !== null ? (
              <span className="font-lobster text-xl md:text-2xl text-[#242d3c]">
                {lecture.rating.toFixed(2)}
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full border-2 border-green-600 text-green-700 text-xs font-bold tracking-wider">
                OPEN
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
