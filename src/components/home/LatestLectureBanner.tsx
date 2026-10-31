import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { LatestLectureSummary } from "@/types/domain";

interface LatestLectureBannerProps {
  album: LatestLectureSummary;
}

export function LatestLectureBanner({ album }: LatestLectureBannerProps) {
  return (
    <section className="my-6">
      <div className="relative overflow-hidden rounded-[7px] h-[230px] sm:h-[290px] md:h-[340px] flex items-center justify-center bg-[#242d3c] border border-[#242d3c]">
        {/* Blurred Cover Backdrop */}
        <div
          className="absolute inset-0 bg-cover bg-center scale-110 blur-md brightness-75"
          style={{ backgroundImage: `url(${album.image})` }}
        />
        <div className="absolute inset-0 bg-[#242d3c]/45" />

        {/* Foreground Content */}
        <div className="relative z-10 w-full max-w-[900px] px-6 grid grid-cols-2 items-center gap-4 sm:gap-8">
          <div className="flex justify-center">
            <img
              src={album.image}
              alt={album.title}
              className="h-[135px] sm:h-[205px] md:h-[250px] w-auto aspect-square object-cover border-4 border-[#f0f8ff] shadow-lg"
            />
          </div>
          <div className="text-center text-white space-y-2">
            <div className="text-xl sm:text-3xl md:text-4xl font-bold tracking-tight">
              금주 음평회
            </div>
            <div className="text-base sm:text-2xl md:text-3xl italic font-semibold break-keep">
              {album.title}
            </div>
            <div className="text-sm sm:text-lg md:text-2xl italic text-[#f0f8ff]/90">
              {album.artist}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center pt-4 pb-6">
        <Link
          href={`/lecture/${album.id}`}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[7px] bg-white hover:bg-[#242d3c] text-[#242d3c] hover:text-[#f0f8ff] font-nohemi font-bold text-sm tracking-wider transition-colors"
        >
          <span>GO TO COMMENT</span>
          <ArrowRight className="w-4 h-4 text-[#ff8080]" />
        </Link>
      </div>
    </section>
  );
}
