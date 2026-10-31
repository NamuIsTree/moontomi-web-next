"use client";

import { useEffect, useState, use } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { CommentEditorForm } from "@/components/lecture/CommentEditorForm";
import { fetchLectureById } from "@/services/lecture.service";
import type { LectureDetail } from "@/types/domain";

export default function CreateCommentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const lectureId = Number(id);
  const [lecture, setLecture] = useState<LectureDetail | null>(null);

  useEffect(() => {
    if (!Number.isFinite(lectureId)) return;
    fetchLectureById(lectureId).then(setLecture);
  }, [lectureId]);

  return (
    <PageContainer width="form">
      {lecture ? (
        <CommentEditorForm mode="create" lecture={lecture} />
      ) : (
        <div className="py-20 text-center text-sm text-[#808080]">
          음평회 정보를 불러오는 중입니다...
        </div>
      )}
    </PageContainer>
  );
}
