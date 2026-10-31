import { createClient } from "@/lib/supabase/client";
import { getImageUrl } from "@/lib/utils";
import type { ReviewDetail, ReviewListItem } from "@/types/domain";

export async function fetchReviewList(params: {
  page: number;
  limit?: number;
  sortBy: "id" | "view";
  order: "asc" | "desc";
}): Promise<ReviewListItem[]> {
  const { page, limit = 15, sortBy, order } = params;
  const supabase = createClient();
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("review")
    .select(
      "review_id, title, writer, type, description, image_id, views, created_at"
    );

  if (sortBy === "view") {
    query = query
      .order("views", { ascending: order === "asc" })
      .order("review_id", { ascending: false });
  } else {
    query = query.order("review_id", { ascending: order === "asc" });
  }

  const { data, error } = await query.range(from, to);
  if (error || !data) return [];

  return data.map((row) => ({
    id: row.review_id,
    image: getImageUrl(row.image_id),
    title: row.title,
    description: row.description,
    views: row.views,
    writer: row.writer,
    type: row.type,
    created_at: row.created_at ? row.created_at.slice(0, 10) : "",
  }));
}

export async function fetchReviewById(
  reviewId: number,
  incrementViews = false
): Promise<ReviewDetail | null> {
  const supabase = createClient();

  if (incrementViews) {
    await supabase.rpc("increment_review_views", { p_review_id: reviewId });
  }

  const { data, error } = await supabase
    .from("review")
    .select(
      "review_id, title, writer, type, description, content, image_id, views, created_at"
    )
    .eq("review_id", reviewId)
    .maybeSingle();

  if (error || !data) return null;

  return {
    id: data.review_id,
    title: data.title,
    writer: data.writer,
    type: data.type,
    description: data.description,
    content: data.content,
    image: getImageUrl(data.image_id),
    views: data.views,
    created_at: data.created_at ? data.created_at.slice(0, 10) : "",
  };
}

export async function createReview(params: {
  title: string;
  writer: string;
  type: string;
  description: string;
  imageId: string;
  content: string;
  password: string;
}): Promise<number> {
  const supabase = createClient();

  const { data, error } = await supabase.rpc("create_review", {
    p_title: params.title,
    p_writer: params.writer,
    p_type: params.type,
    p_description: params.description,
    p_image_id: params.imageId,
    p_content: params.content,
    p_password: params.password,
  });

  if (error) {
    throw new Error(error.message || "투고 등록에 실패했습니다.");
  }

  const result = data as { id: number } | null;
  return result?.id ?? 0;
}

export async function updateReview(params: {
  reviewId: number;
  title: string;
  writer: string;
  type: string;
  description: string;
  imageId?: string;
  content: string;
  password: string;
}): Promise<number> {
  const supabase = createClient();

  const { data, error } = await supabase.rpc("update_review", {
    p_review_id: params.reviewId,
    p_title: params.title,
    p_writer: params.writer,
    p_type: params.type,
    p_description: params.description,
    p_image_id: params.imageId ?? "",
    p_content: params.content,
    p_password: params.password,
  });

  if (error) {
    throw new Error(error.message || "비밀번호가 틀렸거나 원고 수정에 실패했습니다.");
  }

  const result = data as { id: number } | null;
  return result?.id ?? params.reviewId;
}
