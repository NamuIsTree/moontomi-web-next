"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { FilePenLine } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { fetchReviewById } from "@/services/review.service";
import type { ReviewDetail } from "@/types/domain";

export default function ReviewDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const reviewId = Number(id);
  const [review, setReview] = useState<ReviewDetail | null>(null);

  useEffect(() => {
    if (!Number.isFinite(reviewId)) return;
    fetchReviewById(reviewId, true).then(setReview);
  }, [reviewId]);

  if (!review) {
    return (
      <PageContainer width="reading">
        <div className="py-20 text-center text-sm text-[#808080]">
          칼럼을 불러오는 중입니다...
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer width="reading" className="space-y-8">
      <header className="text-center space-y-2">
        <div className="text-sm font-bold text-[#242d3c]">#{review.id}</div>
        <div className="text-sm font-semibold text-[#808080]">
          {review.created_at}
        </div>

        <h1 className="font-myeongjo font-extrabold text-2xl sm:text-3xl italic text-[#171717] pt-1 break-keep">
          &ldquo;{review.title}&rdquo;
        </h1>
        <h2 className="font-myeongjo text-base sm:text-lg italic text-[#171717]/80">
          written by {review.writer}
        </h2>

        <div className="pt-2 flex items-center justify-center gap-2">
          <span className="inline-flex items-center px-3 py-1 rounded-sm border border-[#242d3c]/40 text-xs font-bold text-[#171717]">
            <span className="pr-2.5">{review.type}</span>
            <span className="h-3 w-px bg-[#242d3c]/40" />
            <span className="pl-2.5 text-[#808080]">
              조회수 {review.views}회
            </span>
          </span>

          <Link
            href={`/review/${review.id}/edit`}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-sm border border-[#bdc0c4] text-xs font-semibold text-[#242d3c] hover:bg-[#f3f3f3] transition-colors"
          >
            <FilePenLine className="w-3.5 h-3.5" />
            <span>수정</span>
          </Link>
        </div>

        <div className="pt-4 flex justify-center">
          <img
            src={review.image}
            alt={review.title}
            className="w-[70%] md:w-[88%] max-w-[300px] h-auto object-cover shadow-xs"
          />
        </div>
      </header>

      <article
        className="border-t border-[#bdc0c4]/50 pt-6 text-base leading-relaxed text-[#171717] break-keep space-y-4 [&_a]:text-[#ff8080] [&_img]:max-w-full [&_img]:h-auto [&_img]:mx-auto"
        dangerouslySetInnerHTML={{ __html: review.content }}
      />
    </PageContainer>
  );
}
