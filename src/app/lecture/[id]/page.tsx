"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { SquarePen } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { SeasonChip, GenreChipList } from "@/components/ui/GenreChipList";
import { StarRating } from "@/components/ui/StarRating";
import { LectureCommentCard } from "@/components/lecture/LectureCommentCard";
import {
  fetchLectureById,
  fetchLectureComments,
} from "@/services/lecture.service";
import type { LectureCommentItem, LectureDetail } from "@/types/domain";

export default function LectureDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const lectureId = Number(id);

  const [lecture, setLecture] = useState<LectureDetail | null>(null);
  const [comments, setComments] = useState<LectureCommentItem[]>([]);
  const [ratingHover, setRatingHover] = useState(false);

  useEffect(() => {
    if (!Number.isFinite(lectureId)) return;
    fetchLectureById(lectureId).then((data) => {
      setLecture(data);
      if (data) {
        fetchLectureComments(lectureId, data.tracks).then(setComments);
      }
    });
  }, [lectureId]);

  if (!lecture) {
    return (
      <PageContainer width="reading">
        <div className="py-20 text-center text-sm text-[#808080]">
          음평회 정보를 불러오는 중입니다...
        </div>
      </PageContainer>
    );
  }

  const isLectureOpen = lecture.rating !== null;

  return (
    <PageContainer width="reading" className="space-y-6">
      {/* Header Metadata */}
      <section className="text-center space-y-2">
        <div className="text-sm font-bold text-[#242d3c]">{lecture.id} 회</div>
        {lecture.date && (
          <div className="text-sm font-semibold text-[#808080]">
            {lecture.date}
          </div>
        )}
        <h1 className="text-2xl sm:text-3xl font-bold italic text-[#171717] break-keep">
          {lecture.title}
        </h1>
        <h2 className="text-base sm:text-lg italic text-[#171717]/80">
          {lecture.artist} ({lecture.release})
        </h2>

        <div className="pt-2">
          <SeasonChip name={lecture.season.name} />
        </div>

        <div className="pt-1">
          <GenreChipList genres={lecture.genres} />
        </div>

        {/* Cover & Score Split */}
        <div className="grid grid-cols-2 items-center gap-4 pt-4 max-w-[620px] mx-auto">
          <div className="flex justify-end">
            <img
              src={lecture.image}
              alt={lecture.title}
              className="w-[88%] min-w-[120px] max-w-[280px] aspect-square object-cover shadow-xs"
            />
          </div>

          <div className="flex flex-col items-center justify-center h-full">
            {lecture.rating !== null ? (
              <div
                onMouseEnter={() => setRatingHover(true)}
                onMouseLeave={() => setRatingHover(false)}
                className="cursor-default select-none text-center"
              >
                <div className="font-lobster text-4xl sm:text-5xl text-[#242d3c]">
                  {ratingHover
                    ? lecture.rating.toFixed(3)
                    : lecture.rating.toFixed(1)}
                </div>
                <div className="mt-1 flex justify-center">
                  <StarRating
                    value={lecture.rating / 2}
                    size={24}
                    activeColor="#ff8080"
                  />
                </div>
              </div>
            ) : (
              <div
                onMouseEnter={() => setRatingHover(true)}
                onMouseLeave={() => setRatingHover(false)}
                className="font-lobster text-4xl sm:text-5xl text-[#242d3c] select-none"
              >
                {ratingHover ? "Open!" : "Open?"}
              </div>
            )}

            <div className="pt-2 text-sm text-[#808080]">
              {comments.length} comments
            </div>
          </div>
        </div>
      </section>

      {/* Go to Archive Link */}
      {lecture.archive && (
        <div className="flex justify-center">
          <Link
            href={`/archive/${lecture.archive.id}`}
            className="w-full max-w-[768px] py-2 text-center font-black text-sm text-[#242d3c] hover:bg-[#f3f3f3] rounded-sm transition-colors"
          >
            GO TO ARCHIVE &gt;&gt;
          </Link>
        </div>
      )}

      {/* Comments List */}
      <section className="space-y-4">
        {comments.map((comment) => (
          <LectureCommentCard
            key={comment.id}
            comment={comment}
            isLectureOpen={isLectureOpen}
          />
        ))}

        {/* Post Your Comment Button */}
        <div className="pt-2">
          <Link
            href={`/comment/create/${lecture.id}`}
            className="w-full max-w-[768px] mx-auto h-[96px] rounded-[20px] border border-[#bdc0c4] bg-[#f3f3f3] hover:bg-[#bdc0c4]/30 transition-colors flex items-center justify-center gap-2 font-bold text-sm text-[#242d3c]"
          >
            <SquarePen className="w-5 h-5" />
            <span>POST YOUR COMMENT</span>
          </Link>
        </div>
      </section>
    </PageContainer>
  );
}
