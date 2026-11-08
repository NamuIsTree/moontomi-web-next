"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye, EyeOff, Loader2, Smile } from "lucide-react";
import { SeasonChip, GenreChipList } from "@/components/ui/GenreChipList";
import { StarRating } from "@/components/ui/StarRating";
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

const BEST_TRACK_META = [
  { label: "베스트 트랙 1위 (GOLD)", color: "#ffb400" },
  { label: "베스트 트랙 2위 (SILVER)", color: "#4a4f5a" },
  { label: "베스트 트랙 3위 (BRONZE)", color: "#6e3732" },
];

const QUICK_EMOJIS = [
  "👍", "🔥", "❤️", "❤️‍🔥", "🎧", "🎵", "🎶", "🎸", "🎹", "🥁",
  "🎷", "🎺", "🎻", "🎤", "💿", "✨", "🌟", "🏆", "👑", "💯",
  "🥰", "😍", "🤩", "😎", "🥹", "😭", "🤯", "🤔", "😴", "🙏",
  "👏", "🙌", "🤘", "💃", "🕺", "☕️", "🍺", "🍷", "🏖️", "🌙",
];

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
  initialRating = 70,
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
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const commentTextareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInsertEmoji = (emoji: string) => {
    const textarea = commentTextareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart ?? comment.length;
      const end = textarea.selectionEnd ?? comment.length;
      const next = comment.slice(0, start) + emoji + comment.slice(end);
      setComment(next);
      requestAnimationFrame(() => {
        textarea.focus();
        const cursor = start + emoji.length;
        textarea.setSelectionRange(cursor, cursor);
      });
    } else {
      setComment((prev) => prev + emoji);
    }
  };

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
    <div className="space-y-7">
      <div className="border-b border-[#bdc0c4]/60 pb-3">
        <Link
          href={`/lecture/${lecture.id}`}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#242d3c] hover:text-[#ff8080] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>음평회 상세로 돌아가기</span>
        </Link>
      </div>

      {/* Album Header Info */}
      <section className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold italic text-[#171717]">
          {lecture.title}
        </h1>
        <h2 className="text-base sm:text-lg italic text-[#171717]/80">
          {lecture.artist} ({lecture.release})
        </h2>

        <div className="flex items-center justify-center gap-2 pt-1">
          <span className="px-2.5 py-1 rounded-[7px] bg-[#f3f3f3] text-xs font-bold text-[#242d3c]">
            제 {lecture.id} 회 음평회
          </span>
          <SeasonChip name={lecture.season.name} />
        </div>

        <div className="pt-1">
          <GenreChipList genres={lecture.genres} />
        </div>

        <div className="pt-3 flex justify-center">
          <img
            src={lecture.image}
            alt={lecture.title}
            className="w-[180px] h-[180px] object-cover rounded-[7px] border border-[#bdc0c4]"
          />
        </div>

        <p className="pt-2 text-xs font-bold text-[#808080]">
          {mode === "create"
            ? "이 음반에 대한 평점과 한줄평을 남깁니다"
            : "작성한 평점과 한줄평을 수정합니다"}
        </p>
      </section>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMessage && (
          <div className="p-3.5 rounded-[7px] bg-[#ff8080]/15 border border-[#ff8080] text-sm font-semibold text-[#171717] text-center">
            {errorMessage}
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-[#242d3c] mb-1.5">
            닉네임
          </label>
          <input
            type="text"
            value={writer}
            readOnly={mode === "edit" || loading}
            onChange={(e) => setWriter(e.target.value)}
            placeholder="닉네임 입력"
            className="w-full px-3.5 py-2.5 rounded-[7px] border border-[#bdc0c4] bg-white text-sm read-only:bg-[#f3f3f3] focus:outline-none focus:border-[#242d3c]"
          />
        </div>

        {/* Rating Slider */}
        <div className="p-4 rounded-[20px] bg-[#f3f3f3]/70 border border-[#bdc0c4]/60 text-center space-y-2 tabular-nums">
          <div className="font-lobster text-4xl text-[#242d3c]">
            {(rating / 10).toFixed(1)}
          </div>
          <div className="flex justify-center">
            <StarRating
              value={rating / 20}
              size={22}
              activeColor="#ff8080"
            />
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            style={{ accentColor: getRatingSliderColor(rating) }}
            className="w-full cursor-pointer mt-2"
          />
        </div>

        {/* Best Tracks 1 ~ 3 */}
        {([0, 1, 2] as const).map((idx) => (
          <div key={idx}>
            <label
              className="block text-xs font-bold mb-1.5"
              style={{ color: BEST_TRACK_META[idx].color }}
            >
              {BEST_TRACK_META[idx].label}
            </label>
            <select
              value={bests[idx]}
              onChange={(e) => handleBestChange(idx, e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-[7px] border border-[#bdc0c4] bg-white text-sm focus:outline-none focus:border-[#242d3c]"
            >
              <option value="">수록곡 선택 (선택 사항)</option>
              {lecture.tracks.map((track, tIdx) => (
                <option key={`${track}-${tIdx}`} value={track}>
                  {String(tIdx + 1).padStart(2, "0")}. {track}
                </option>
              ))}
            </select>
          </div>
        ))}

        {/* Comment Textarea */}
        <div className="relative">
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-[#242d3c]">
              한줄평
            </label>
            <button
              type="button"
              onClick={() => setShowEmojiPicker((prev) => !prev)}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-[7px] text-xs font-semibold text-[#242d3c] hover:bg-[#f3f3f3] transition-colors cursor-pointer"
              aria-label="이모지 선택"
            >
              <Smile className="w-4 h-4 text-[#ff8080]" />
              <span>이모지</span>
            </button>
          </div>
          <div
            className={`grid transition-[grid-template-rows,opacity,margin] duration-250 ease-out ${
              showEmojiPicker
                ? "grid-rows-[1fr] opacity-100 mb-2"
                : "grid-rows-[0fr] opacity-0 mb-0 pointer-events-none"
            }`}
          >
            <div className="overflow-hidden">
              <div className="p-2.5 rounded-[7px] border border-[#bdc0c4] bg-white shadow-sm grid grid-cols-10 gap-1">
                {QUICK_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => handleInsertEmoji(emoji)}
                    className="h-8 flex items-center justify-center rounded hover:bg-[#f3f3f3] text-base transition-colors cursor-pointer"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <textarea
            ref={commentTextareaRef}
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="앨범에 대한 감상과 한줄평을 남겨주세요"
            className="w-full px-3.5 py-2.5 rounded-[7px] border border-[#bdc0c4] bg-white text-sm leading-relaxed focus:outline-none focus:border-[#242d3c] resize-y"
          />
        </div>

        {/* Password Field */}
        <div>
          <label className="block text-xs font-bold text-[#242d3c] mb-1.5">
            비밀번호
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              readOnly={loading}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="평가 수정 시 사용할 비밀번호"
              className="w-full pl-3.5 pr-10 py-2.5 rounded-[7px] border border-[#bdc0c4] bg-white text-sm focus:outline-none focus:border-[#242d3c]"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
              className="absolute inset-y-0 right-0 px-3 flex items-center text-[#808080] hover:text-[#242d3c] cursor-pointer"
            >
              {showPassword ? (
                <Eye className="w-4 h-4" />
              ) : (
                <EyeOff className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        <div className="pt-3">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-[7px] bg-[#ff8080] hover:opacity-90 disabled:opacity-50 text-white font-bold text-sm transition-opacity flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{mode === "create" ? "평가 제출하기" : "평가 수정하기"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
