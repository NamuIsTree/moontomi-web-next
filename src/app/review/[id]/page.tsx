"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { ArrowLeft, Eye, FilePenLine } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { TiptapReviewEditor } from "@/components/review/TiptapReviewEditor";
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
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-[#bdc0c4]/60 pb-3">
        <Link
          href="/reviews"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#242d3c] hover:text-[#ff8080] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>칼럼 목록으로</span>
        </Link>

        <Link
          href={`/review/${review.id}/edit`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[7px] border border-[#bdc0c4] text-xs font-bold text-[#242d3c] hover:bg-[#f3f3f3] transition-colors"
        >
          <FilePenLine className="w-3.5 h-3.5 text-[#ff8080]" />
          <span>원고 수정</span>
        </Link>
      </div>

      {/* Editorial Article Header */}
      <header className="text-center space-y-4 max-w-[700px] mx-auto">
        <h1 className="font-myeongjo font-extrabold text-2xl sm:text-4xl text-[#171717] leading-snug break-keep">
          &ldquo;{review.title}&rdquo;
        </h1>

        {review.description && (
          <p className="text-sm sm:text-base text-[#808080] leading-relaxed break-keep max-w-[58ch] mx-auto">
            {review.description}
          </p>
        )}

        <div className="pt-2 flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm">
          <span className="px-2.5 py-1 rounded-[7px] bg-[#242d3c] text-[#f0f8ff] font-bold">
            {review.type}
          </span>
          <span className="font-myeongjo font-extrabold text-[#242d3c]">
            written by {review.writer}
          </span>
          <span className="text-[#bdc0c4]">|</span>
          <span className="text-[#808080] tabular-nums">
            {review.created_at}
          </span>
          <span className="text-[#bdc0c4]">|</span>
          <span className="inline-flex items-center gap-1 text-[#808080] tabular-nums">
            <Eye className="w-3.5 h-3.5 text-[#ff8080]" />
            <span>{review.views}회</span>
          </span>
        </div>

        <div className="pt-4 flex justify-center">
          <img
            src={review.image}
            alt={review.title}
            className="w-[75%] sm:w-[85%] max-w-[340px] h-auto object-cover rounded-[7px] border border-[#bdc0c4]/70"
          />
        </div>
      </header>

      {/* Long-form Editorial Prose (TipTap Readonly Viewer) */}
      <article className="border-t border-[#bdc0c4]/60 pt-8">
        <TiptapReviewEditor content={review.content} editable={false} />
      </article>
    </PageContainer>
  );
}
