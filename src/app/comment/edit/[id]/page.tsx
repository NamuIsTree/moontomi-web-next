"use client";

import { useEffect, useState, use } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { CommentEditorForm } from "@/components/lecture/CommentEditorForm";
import { fetchCommentById } from "@/services/comment.service";
import { fetchLectureById } from "@/services/lecture.service";
import type { LectureDetail } from "@/types/domain";

export default function EditCommentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const commentId = Number(id);

  const [lecture, setLecture] = useState<LectureDetail | null>(null);
  const [initialData, setInitialData] = useState<{
    writer: string;
    rating: number;
    bests: [string, string, string];
    comment: string;
  } | null>(null);

  useEffect(() => {
    if (!Number.isFinite(commentId)) return;
    fetchCommentById(commentId).then((commentData) => {
      if (!commentData) return;
      setInitialData({
        writer: commentData.writer,
        rating: Math.round(commentData.rating * 10),
        bests: [
          commentData.bests[0] ?? "",
          commentData.bests[1] ?? "",
          commentData.bests[2] ?? "",
        ],
        comment: commentData.comment,
      });
      fetchLectureById(commentData.lecture_id).then(setLecture);
    });
  }, [commentId]);

  return (
    <PageContainer width="form">
      {lecture && initialData ? (
        <CommentEditorForm
          mode="edit"
          lecture={lecture}
          commentId={commentId}
          initialWriter={initialData.writer}
          initialRating={initialData.rating}
          initialBests={initialData.bests}
          initialComment={initialData.comment}
        />
      ) : (
        <div className="py-20 text-center text-sm text-[#808080]">
          평가 정보를 불러오는 중입니다...
        </div>
      )}
    </PageContainer>
  );
}
