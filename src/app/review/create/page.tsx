"use client";

import { PageContainer } from "@/components/layout/PageContainer";
import { ReviewEditorForm } from "@/components/review/ReviewEditorForm";

export default function CreateReviewPage() {
  return (
    <PageContainer width="reading">
      <ReviewEditorForm mode="create" />
    </PageContainer>
  );
}
