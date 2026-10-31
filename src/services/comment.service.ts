import { createClient } from "@/lib/supabase/client";
import { getImageUrl } from "@/lib/utils";
import type { LookupCommentItem } from "@/types/domain";

export async function fetchCommentById(commentId: number): Promise<{
  id: number;
  lecture_id: number;
  writer: string;
  rating: number; // 0 ~ 10 scale
  bests: string[];
  comment: string;
} | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("comment")
    .select(
      `
      comment_id,
      lecture_id,
      writer,
      rating,
      picks,
      text,
      lecture:lecture_id(
        album:album_id(tracks)
      )
    `
    )
    .eq("comment_id", commentId)
    .maybeSingle();

  if (error || !data) return null;

  const lecture = data.lecture as unknown as {
    album: { tracks: string[] } | null;
  } | null;
  const tracks = Array.isArray(lecture?.album?.tracks)
    ? lecture.album.tracks
    : [];
  const pickIndices = Array.isArray(data.picks)
    ? (data.picks as number[])
    : [];

  return {
    id: data.comment_id,
    lecture_id: data.lecture_id,
    writer: data.writer,
    rating: data.rating / 10,
    bests: [
      tracks[pickIndices[0]] ?? "",
      tracks[pickIndices[1]] ?? "",
      tracks[pickIndices[2]] ?? "",
    ],
    comment: data.text,
  };
}

export async function createComment(params: {
  lectureId: number;
  rating: number; // 0 ~ 100 integer
  writer: string;
  password: string;
  picks: number[];
  text: string;
}): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase.rpc("create_comment", {
    p_lecture_id: params.lectureId,
    p_rating: params.rating,
    p_writer: params.writer,
    p_password: params.password,
    p_picks: params.picks,
    p_text: params.text,
  });

  if (error) {
    throw new Error(error.message || "평가 등록에 실패했습니다.");
  }
}

export async function updateComment(params: {
  commentId: number;
  rating: number; // 0 ~ 100 integer
  password: string;
  picks: number[];
  text: string;
}): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase.rpc("update_comment", {
    p_comment_id: params.commentId,
    p_rating: params.rating,
    p_password: params.password,
    p_picks: params.picks,
    p_text: params.text,
  });

  if (error) {
    throw new Error(error.message || "비밀번호가 틀렸거나 수정에 실패했습니다.");
  }
}

export async function searchCommentsByWriters(
  patterns: string[]
): Promise<LookupCommentItem[]> {
  const cleaned = patterns.map((p) => p.trim()).filter(Boolean);
  if (cleaned.length === 0) return [];

  const supabase = createClient();
  const orClause = cleaned
    .map((p) => `writer.ilike.%${p.replace(/[%_]/g, "\\$&")}%`)
    .join(",");

  const { data, error } = await supabase
    .from("comment")
    .select(
      `
      comment_id,
      lecture_id,
      writer,
      rating,
      text,
      lecture:lecture_id!inner(
        lecture_id,
        rating,
        album:album_id(title, image_id)
      )
    `
    )
    .not("lecture.rating", "is", null)
    .or(orClause);

  if (error || !data) return [];

  return data.map((row) => {
    const lecture = row.lecture as unknown as {
      album: { title: string; image_id: string } | null;
    };

    return {
      id: row.comment_id,
      lecture_id: row.lecture_id,
      writer: row.writer,
      album: {
        title: lecture?.album?.title ?? "",
        image: getImageUrl(lecture?.album?.image_id),
      },
      rating: row.rating / 10,
      text: row.text,
    };
  });
}
