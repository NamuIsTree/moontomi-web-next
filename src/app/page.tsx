"use client";

import { useEffect, useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { AlbumRankCarousel } from "@/components/home/AlbumRankCarousel";
import { LatestLectureBanner } from "@/components/home/LatestLectureBanner";
import { NewArrivalsSection } from "@/components/home/NewArrivalsSection";
import {
  fetchLatestLecture,
  fetchTopLectures,
} from "@/services/lecture.service";
import type {
  LatestLectureSummary,
  RankedLectureAlbum,
} from "@/types/domain";

export default function HomePage() {
  const [upperTop, setUpperTop] = useState<RankedLectureAlbum[]>([]);
  const [lowerTop, setLowerTop] = useState<RankedLectureAlbum[]>([]);
  const [reversed, setReversed] = useState(false);
  const [latestLecture, setLatestLecture] =
    useState<LatestLectureSummary | null>(null);

  useEffect(() => {
    fetchTopLectures().then(({ upperTop: upper, lowerTop: lower }) => {
      setUpperTop(upper);
      setLowerTop(lower);
    });
    fetchLatestLecture().then((latest) => {
      setLatestLecture(latest);
    });
  }, []);

  const topAlbums = reversed ? lowerTop : upperTop;

  return (
    <PageContainer width="wide">
      {topAlbums.length > 0 && (
        <section className="text-left">
          <AlbumRankCarousel items={topAlbums} />
          <div className="flex justify-center pt-4 pb-8">
            <button
              type="button"
              onClick={() => setReversed((prev) => !prev)}
              className="px-5 py-2 font-black text-base text-[#242d3c] hover:bg-[#f3f3f3] rounded-sm transition-colors cursor-pointer"
            >
              {reversed ? "HALL OF SHAME" : "HALL OF FAME"}
            </button>
          </div>
        </section>
      )}

      {latestLecture && <LatestLectureBanner album={latestLecture} />}

      <hr className="border-[#bdc0c4]/50 my-6" />

      <NewArrivalsSection />
    </PageContainer>
  );
}
