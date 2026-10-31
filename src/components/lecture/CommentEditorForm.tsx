"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { SeasonChip, GenreChipList } from "@/components/ui/GenreChipList";
import {
  createComment,
  updateComment,
} from "@/services/comment.service";
import type { LectureDetail } from "@/types/domain";

interface CommentEditorFormProps {
  mode: "create" | "edit";
  lecture: LectureDetail;
  commentId?: number;
  initialWriter?: string;
  initialRating?: number; // 0 ~ 100
  initialBests?: [string, string, string];
  initialComment?: string;
}

const PASSWORD_PATTERN =
  /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/;

function getRatingSliderColor(rating: number): string {
  if (rating < 30) return "#3f51b5";
  if (rating < 50) return "#009688";
  if (rating < 60) return "#4caf50";
  if (rating < 80) return "#ff9800";
  return "#ff8080";
}

export function CommentEditorForm({
  mode,
  lecture,
  commentId,
  initialWriter = "",
  initialRating = 0,
  initialBests = ["", "", ""],
  initialComment = "",
}: CommentEditorFormProps) {
  const router = useRouter();
  const [writer, setWriter] = useState(initialWriter);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rating, setRating] = useState(initialRating);
  const [bests, setBests] = useState<[string, string, string]>(initialBests);
  const [comment, setComment] = useState(initialComment);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleBestChange = (index: 0 | 1 | 2, value: string) => {
    setBests((prev) => {
      const next: [string, string, string] = [...prev] as [
        string,
        string,
        string,
      ];
      next[index] = value;
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!writer.trim()) {
      setErrorMessage("닉네임을 입력해주세요.");
      return;
    }
    if (!password) {
      setErrorMessage("비밀번호를 입력해주세요.");
      return;
    }
    if (!PASSWORD_PATTERN.test(password)) {
      setErrorMessage(
        "비밀번호는 알파벳 대소문자, 숫자, 특수문자만 사용할 수 있습니다."
      );
      return;
    }

    const picks = bests
      .map((best) => lecture.tracks.findIndex((track) => track === best))
      .filter((idx) => idx >= 0);

    setLoading(true);
    try {
      if (mode === "create") {
        await createComment({
          lectureId: lecture.id,
          rating,
          writer: writer.trim(),
          password,
          picks,
          text: comment,
        });
      } else if (commentId !== undefined) {
        await updateComment({
          commentId,
          rating,
          password,
          picks,
          text: comment,
        });
      }
      router.push(`/lecture/${lecture.id}`);
      router.refresh();
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "처리 중 오류가 발생했습니다."
      );
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Album Header Info */}
      <section className="text-center space-y-2">
        <div className="text-sm font-bold text-[#242d3c]">{lecture.id} 회</div>
        <h1 className="text-2xl sm:text-3xl font-bold italic text-[#171717]">
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

        <div className="pt-4 flex justify-center">
          <img
            src={lecture.image}
            alt={lecture.title}
            className="w-[200px] h-[200px] object-cover shadow-xs"
          />
        </div>

        <p className="pt-3 text-sm font-semibold text-[#808080]">
          {mode === "create" ? "평가를 작성합니다" : "평가를 수정합니다"}
        </p>
      </section>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMessage && (
          <div className="p-3 rounded-sm bg-[#ff8080]/15 border border-[#ff8080] text-sm text-[#171717] text-center">
            {errorMessage}
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-[#242d3c] mb-1">
            닉네임
          </label>
          <input
            type="text"
            value={writer}
            readOnly={mode === "edit" || loading}
            onChange={(e) => setWriter(e.target.value)}
            placeholder="닉네임 입력"
            className="w-full px-3.5 py-2.5 rounded-sm border border-[#bdc0c4] bg-white text-sm read-only:bg-[#f3f3f3] focus:outline-none focus:border-[#242d3c]"
          />
        </div>

        {/* Rating Slider */}
        <div className="py-2 text-center space-y-2">
          <div className="text-base font-bold text-[#242d3c]">
            평점 : {(rating / 10).toFixed(1)}
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            style={{ accentColor: getRatingSliderColor(rating) }}
            className="w-full cursor-pointer"
          />
        </div>

        {/* Best Tracks 1 ~ 3 */}
        {([0, 1, 2] as const).map((idx) => (
          <div key={idx}>
            <label className="block text-xs font-bold text-[#242d3c] mb-1">
              베스트 {idx + 1}
            </label>
            <select
              value={bests[idx]}
              onChange={(e) => handleBestChange(idx, e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-sm border border-[#bdc0c4] bg-white text-sm focus:outline-none focus:border-[#242d3c]"
            >
              <option value="">수록곡 선택</option>
              {lecture.tracks.map((track, tIdx) => (
                <option key={`${track}-${tIdx}`} value={track}>
                  {track}
                </option>
              ))}
            </select>
          </div>
        ))}

        {/* Comment Textarea */}
        <div>
          <label className="block text-xs font-bold text-[#242d3c] mb-1">
            한줄평
          </label>
          <textarea
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="앨범에 대한 한줄평을 남겨주세요"
            className="w-full px-3.5 py-2.5 rounded-sm border border-[#bdc0c4] bg-white text-sm focus:outline-none focus:border-[#242d3c] resize-y"
          />
        </div>

        {/* Password Field */}
        <div>
          <label className="block text-xs font-bold text-[#242d3c] mb-1">
            비밀번호
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              readOnly={loading}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter Password"
              className="w-full pl-3.5 pr-10 py-2.5 rounded-sm border border-[#bdc0c4] bg-white text-sm focus:outline-none focus:border-[#242d3c]"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
              className="absolute inset-y-0 right-0 px-3 flex items-center text-[#808080] hover:text-[#242d3c]"
            >
              {showPassword ? (
                <Eye className="w-4 h-4" />
              ) : (
                <EyeOff className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-sm bg-[#ff8080] hover:opacity-90 disabled:opacity-50 text-white font-bold text-sm transition-opacity flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{mode === "create" ? "평가 제출" : "평가 수정"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
