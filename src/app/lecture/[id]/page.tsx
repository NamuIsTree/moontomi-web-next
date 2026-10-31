"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  CirclePlay,
  Disc3,
  SquarePen,
} from "lucide-react";
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
  const [showTracks, setShowTracks] = useState(false);

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
    <PageContainer width="reading" className="space-y-7">
      {/* Top Navigation Row */}
      <div className="flex items-center justify-between border-b border-[#bdc0c4]/60 pb-3">
        <Link
          href="/lectures"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#242d3c] hover:text-[#ff8080] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>음평회 카탈로그</span>
        </Link>

        <div className="flex items-center gap-2">
          {lecture.archive && (
            <Link
              href={`/archive/${lecture.archive.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[7px] border border-[#bdc0c4] text-xs font-bold text-[#242d3c] hover:bg-[#f3f3f3] transition-colors"
            >
              <CirclePlay className="w-3.5 h-3.5 text-[#ff8080]" />
              <span>아카이브에서 감상</span>
            </Link>
          )}
          <Link
            href={`/comment/create/${lecture.id}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[7px] bg-[#242d3c] text-[#f0f8ff] text-xs font-bold hover:opacity-90 transition-opacity"
          >
            <SquarePen className="w-3.5 h-3.5 text-[#ff8080]" />
            <span>평가 남기기</span>
          </Link>
        </div>
      </div>

      {/* Album Liner Notes Hero */}
      <section className="text-center space-y-2.5">
        <div className="flex justify-center">
          <span className="px-3 py-1 rounded-[7px] bg-[#f3f3f3] text-xs sm:text-sm font-bold text-[#242d3c] tabular-nums">
            제 {lecture.id} 회 음평회
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold italic text-[#171717] break-keep">
          {lecture.title}
        </h1>

        <h2 className="text-base sm:text-lg italic text-[#171717]/80">
          {lecture.artist} ({lecture.release.trim()})
        </h2>

        <div className="flex flex-wrap items-center justify-center gap-2 pt-0.5 text-xs font-bold text-[#242d3c] tabular-nums">
          {lecture.date && (
            <span className="px-2.5 py-1 rounded-[7px] bg-[#f3f3f3] text-[#808080]">
              {lecture.date}
            </span>
          )}
          <SeasonChip name={lecture.season.name} />
        </div>

        <div className="pt-1">
          <GenreChipList genres={lecture.genres} />
        </div>

        {/* Cover & Ceremonial Rating Split */}
        <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-6 pt-5 max-w-[640px] mx-auto">
          <div className="flex justify-center sm:justify-end">
            <img
              src={lecture.image}
              alt={lecture.title}
              className="w-[210px] sm:w-[250px] aspect-square object-cover rounded-[7px] border border-[#bdc0c4] shadow-sm"
            />
          </div>

          <div className="flex flex-col items-center justify-center py-4 px-6 bg-white">
            {lecture.rating !== null ? (
              <div
                onMouseEnter={() => setRatingHover(true)}
                onMouseLeave={() => setRatingHover(false)}
                className="cursor-default select-none text-center tabular-nums"
              >
                <div className="font-lobster text-4xl sm:text-5xl text-[#242d3c]">
                  {ratingHover
                    ? lecture.rating.toFixed(3)
                    : lecture.rating.toFixed(1)}
                </div>
                <div className="mt-1.5 flex justify-center">
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

            <div className="pt-3 text-xs font-bold text-[#808080] tabular-nums">
              총 {comments.length}명의 멤버 참여
            </div>
          </div>
        </div>
      </section>

      {/* Collapsible Tracklist Liner Notes */}
      {lecture.tracks && lecture.tracks.length > 0 && (
        <section className="border-t border-b border-[#bdc0c4]/60 py-3">
          <button
            type="button"
            onClick={() => setShowTracks((prev) => !prev)}
            className="w-full flex items-center justify-between px-2 py-1 text-xs sm:text-sm font-bold text-[#242d3c] hover:text-[#ff8080] transition-colors cursor-pointer"
          >
            <span className="inline-flex items-center gap-2">
              <Disc3 className="w-4 h-4 text-[#ff8080]" />
              <span>수록곡 트랙리스트 ({lecture.tracks.length}곡)</span>
            </span>
            {showTracks ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          {showTracks && (
            <ol className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 pt-3 px-2 text-xs sm:text-sm text-[#171717]">
              {lecture.tracks.map((track, idx) => (
                <li
                  key={`${track}-${idx}`}
                  className="flex items-baseline gap-2.5 py-1 border-b border-[#f3f3f3] last:border-b-0"
                >
                  <span className="font-mono text-xs font-bold text-[#808080] tabular-nums w-6 shrink-0">
                    {String(idx + 1).padStart(2, "0")}.
                  </span>
                  <span className="break-keep">{track}</span>
                </li>
              ))}
            </ol>
          )}
        </section>
      )}

      {/* Comments List */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-base sm:text-lg font-bold text-[#242d3c]">
            멤버 한줄평 ({comments.length})
          </h3>
          {!isLectureOpen && (
            <span className="text-xs font-semibold text-[#808080]">
              평점 공개 전 (개별 화살표로 미리보기 가능)
            </span>
          )}
        </div>

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
            className="w-full h-[88px] rounded-[20px] border border-[#bdc0c4] bg-[#f3f3f3] hover:border-[#242d3c] hover:bg-[#242d3c] text-[#242d3c] hover:text-[#f0f8ff] transition-colors flex items-center justify-center gap-2.5 font-bold text-sm"
          >
            <SquarePen className="w-5 h-5 text-[#ff8080]" />
            <span>POST YOUR COMMENT</span>
          </Link>
        </div>
      </section>
    </PageContainer>
  );
}
