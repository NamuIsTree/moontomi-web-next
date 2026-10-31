"use client";

import { useEffect, useState } from "react";
import { ArrowLeftRight } from "lucide-react";
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
import { fetchArchiveList } from "@/services/archive.service";
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
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [latestArchives, setLatestArchives] = useState<ArchivePublicItem[]>([]);
  const [archivesLoading, setArchivesLoading] = useState(true);

  useEffect(() => {
    fetchTopLectures().then(({ upperTop: upper, lowerTop: lower }) => {
      setUpperTop(upper);
      setLowerTop(lower);
    });
    fetchLatestLecture().then((latest) => {
      setLatestLecture(latest);
    });
    fetchReviewList({
      page: 1,
      limit: 10,
      sortBy: "id",
      order: "desc",
    })
      .then((reviews) => {
        setLatestReviews(reviews.slice(0, 10));
      })
      .finally(() => {
        setReviewsLoading(false);
      });
    fetchArchiveList({
      page: 1,
      limit: 10,
      order: "desc",
    })
      .then((archives) => {
        setLatestArchives(archives.slice(0, 10));
      })
      .finally(() => {
        setArchivesLoading(false);
      });
  }, []);

  const topAlbums = reversed ? lowerTop : upperTop;

  return (
    <PageContainer width="wide">
      {topAlbums.length > 0 && (
        <section className="text-left">
          <AlbumRankCarousel items={topAlbums} />
          <div className="flex justify-center pt-3 pb-7">
            <button
              type="button"
              onClick={() => setReversed((prev) => !prev)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[7px] border border-[#242d3c]/25 bg-white hover:bg-[#242d3c] text-[#242d3c] hover:text-[#f0f8ff] font-nohemi font-bold text-sm tracking-wider transition-colors cursor-pointer"
            >
              <ArrowLeftRight className="w-4 h-4 text-[#ff8080]" />
              <span>{reversed ? "HALL OF SHAME" : "HALL OF FAME"}</span>
            </button>
          </div>
        </section>
      )}

      {latestLecture && <LatestLectureBanner album={latestLecture} />}

      <hr className="border-[#bdc0c4]/50 my-8" />

      <NewArrivalsSection reviews={latestReviews} loading={reviewsLoading} />

      <hr className="border-[#bdc0c4]/50 my-8" />

      <LatestArchiveSection
        archives={latestArchives}
        loading={archivesLoading}
      />
    </PageContainer>
  );
}
