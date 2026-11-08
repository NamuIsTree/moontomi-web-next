"use client";

import { useEffect, useState } from "react";
import { ArrowLeftRight, Loader2 } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { AlbumRankCarousel } from "@/components/home/AlbumRankCarousel";
import { LatestLectureBanner } from "@/components/home/LatestLectureBanner";
import { NewArrivalsSection } from "@/components/home/NewArrivalsSection";
import { LatestArchiveSection } from "@/components/home/LatestArchiveSection";
import {
  fetchLatestLecture,
  fetchTopLectures,
} from "@/services/lecture.service";
import { fetchReviewList } from "@/services/review.service";
import { fetchCuratedArchives } from "@/services/archive.service";
import type {
  ArchivePublicItem,
  LatestLectureSummary,
  RankedLectureAlbum,
  ReviewListItem,
} from "@/types/domain";

export default function HomePage() {
  const [upperTop, setUpperTop] = useState<RankedLectureAlbum[]>([]);
  const [lowerTop, setLowerTop] = useState<RankedLectureAlbum[]>([]);
  const [reversed, setReversed] = useState(false);
  const [latestLecture, setLatestLecture] =
    useState<LatestLectureSummary | null>(null);
  const [latestReviews, setLatestReviews] = useState<ReviewListItem[]>([]);
  const [latestArchives, setLatestArchives] = useState<ArchivePublicItem[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setInitialLoading(true);

    Promise.all([
      fetchTopLectures().catch(() => ({ upperTop: [], lowerTop: [] })),
      fetchLatestLecture().catch(() => null),
      fetchReviewList({
        page: 1,
        limit: 10,
        sortBy: "id",
        order: "desc",
      }).catch(() => []),
      fetchCuratedArchives(10, 3).catch(() => []),
    ])
      .then(([topResult, latest, reviews, archives]) => {
        if (!mounted) return;
        setUpperTop(topResult.upperTop);
        setLowerTop(topResult.lowerTop);
        setLatestLecture(latest);
        setLatestReviews(reviews.slice(0, 10));
        setLatestArchives(archives);
      })
      .finally(() => {
        if (mounted) {
          setInitialLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const topAlbums = reversed ? lowerTop : upperTop;

  if (initialLoading) {
    return (
      <PageContainer width="wide">
        <div className="min-h-[65vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#ff8080]" />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer width="wide">
      <div className="animate-fade-in">
        {topAlbums.length > 0 && (
          <section className="text-left">
            <AlbumRankCarousel items={topAlbums} />
            <div className="flex justify-center pt-3 pb-7">
              <button
                type="button"
                onClick={() => setReversed((prev) => !prev)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[7px] bg-white hover:bg-[#242d3c] text-[#242d3c] hover:text-[#f0f8ff] font-nohemi font-bold text-sm tracking-wider transition-colors cursor-pointer"
              >
                <ArrowLeftRight className="w-4 h-4 text-[#ff8080]" />
                <span>{reversed ? "HALL OF SHAME" : "HALL OF FAME"}</span>
              </button>
            </div>
          </section>
        )}

        {latestLecture && <LatestLectureBanner album={latestLecture} />}

        <hr className="border-[#bdc0c4]/50 my-8" />

        <NewArrivalsSection reviews={latestReviews} loading={false} />

        <hr className="border-[#bdc0c4]/50 my-8" />

        <LatestArchiveSection archives={latestArchives} loading={false} />
      </div>
    </PageContainer>
  );
}
