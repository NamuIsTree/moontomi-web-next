"use client";

import { useEffect, useState, use } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { ReviewEditorForm } from "@/components/review/ReviewEditorForm";
import { fetchReviewById } from "@/services/review.service";
import type { ReviewDetail } from "@/types/domain";

export default function EditReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const reviewId = Number(id);
  const [review, setReview] = useState<ReviewDetail | null>(null);

  useEffect(() => {
    if (!Number.isFinite(reviewId)) return;
    fetchReviewById(reviewId, false).then(setReview);
  }, [reviewId]);

  return (
    <PageContainer width="reading">
      {review ? (
        <ReviewEditorForm
          mode="edit"
          reviewId={review.id}
          reviewMemberId={review.member_id ?? null}
          initialTitle={review.title}
          initialWriter={review.writer}
          initialType={review.type}
          initialDescription={review.description}
          initialImage={review.image}
          initialContent={review.content}
        />
      ) : (
        <div className="py-20 text-center text-sm text-[#808080]">
          원고 정보를 불러오는 중입니다...
        </div>
      )}
    </PageContainer>
  );
}
