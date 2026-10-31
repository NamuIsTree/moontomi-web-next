"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, Upload } from "lucide-react";
import { uploadImageToStorage } from "@/services/storage.service";
import {
  createReview,
  updateReview,
} from "@/services/review.service";

interface ReviewEditorFormProps {
  mode: "create" | "edit";
  reviewId?: number;
  initialTitle?: string;
  initialWriter?: string;
  initialType?: string;
  initialDescription?: string;
  initialImage?: string;
  initialContent?: string;
}

const REVIEW_TYPES = ["결산", "칼럼", "잡설"];
const PASSWORD_PATTERN =
  /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/;

export function ReviewEditorForm({
  mode,
  reviewId,
  initialTitle = "",
  initialWriter = "",
  initialType = "칼럼",
  initialDescription = "",
  initialImage = "",
  initialContent = "",
}: ReviewEditorFormProps) {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(
    initialImage || "/icons/upload-preview.png"
  );
  const [writer, setWriter] = useState(initialWriter);
  const [reviewType, setReviewType] = useState(initialType);
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [content, setContent] = useState(initialContent);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (mode === "create" && !selectedFile && !initialImage) {
      setErrorMessage("썸네일 이미지를 선택해주세요.");
      return;
    }
    if (!writer.trim() || !title.trim() || !description.trim()) {
      setErrorMessage("작성자, 제목, 설명을 모두 입력해주세요.");
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

    setLoading(true);
    try {
      let uploadedImageUrl: string | undefined;
      if (selectedFile) {
        uploadedImageUrl = await uploadImageToStorage(selectedFile);
      }

      if (mode === "create") {
        const newId = await createReview({
          title: title.trim(),
          writer: writer.trim(),
          type: reviewType,
          description: description.trim(),
          imageId: uploadedImageUrl ?? initialImage,
          content,
          password,
        });
        router.push(`/review/${newId}`);
      } else if (reviewId !== undefined) {
        await updateReview({
          reviewId,
          title: title.trim(),
          writer: writer.trim(),
          type: reviewType,
          description: description.trim(),
          imageId: uploadedImageUrl,
          content,
          password,
        });
        router.push(`/review/${reviewId}`);
      }
      router.refresh();
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "처리 중 오류가 발생했습니다."
      );
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <h1 className="text-2xl font-bold text-center text-[#242d3c] py-2">
        {mode === "create" ? "투고하기" : "원고 수정하기"}
      </h1>

      {errorMessage && (
        <div className="p-3 rounded-sm bg-[#ff8080]/15 border border-[#ff8080] text-sm text-[#171717] text-center">
          {errorMessage}
        </div>
      )}

      {/* Thumbnail File Input */}
      <div className="space-y-3">
        <label className="block text-xs font-bold text-[#242d3c]">
          썸네일 이미지
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="w-full px-3 py-2 rounded-sm border border-[#bdc0c4] text-sm file:mr-3 file:px-3 file:py-1 file:rounded-sm file:border-0 file:bg-[#242d3c] file:text-white file:text-xs file:font-bold cursor-pointer"
        />
        <div className="flex justify-center pt-1">
          <img
            src={previewUrl}
            alt="thumbnail-preview"
            className="w-[88%] max-w-[300px] h-auto object-cover border border-[#bdc0c4]"
          />
        </div>
      </div>

      {/* Writer & Type */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-[#242d3c] mb-1">
            작성자
          </label>
          <input
            type="text"
            value={writer}
            onChange={(e) => setWriter(e.target.value)}
            placeholder="작성자 닉네임"
            className="w-full px-3.5 py-2.5 rounded-sm border border-[#bdc0c4] bg-white text-sm focus:outline-none focus:border-[#242d3c]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#242d3c] mb-1">
            타입
          </label>
          <select
            value={reviewType}
            onChange={(e) => setReviewType(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-sm border border-[#bdc0c4] bg-white text-sm focus:outline-none focus:border-[#242d3c]"
          >
            {REVIEW_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Title */}
      <div>
        <label className="block text-xs font-bold text-[#242d3c] mb-1">
          제목
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="칼럼 제목"
          className="w-full px-3.5 py-2.5 rounded-sm border border-[#bdc0c4] bg-white text-sm focus:outline-none focus:border-[#242d3c]"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-bold text-[#242d3c] mb-1">
          설명
        </label>
        <textarea
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="칼럼 요약 설명"
          className="w-full px-3.5 py-2.5 rounded-sm border border-[#bdc0c4] bg-white text-sm focus:outline-none focus:border-[#242d3c]"
        />
      </div>

      {/* Password */}
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

      {/* Content (HTML / Markdown / Text) */}
      <div>
        <label className="block text-xs font-bold text-[#242d3c] mb-1">
          본문 (HTML 지원)
        </label>
        <textarea
          rows={14}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="칼럼 본문을 입력하세요..."
          className="w-full px-3.5 py-3 rounded-sm border border-[#bdc0c4] bg-white text-sm leading-relaxed focus:outline-none focus:border-[#242d3c] font-sans"
        />
      </div>

      <div className="pt-4">
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-sm bg-[#ff8080] hover:opacity-90 disabled:opacity-50 text-white font-bold text-sm transition-opacity flex items-center justify-center gap-2 cursor-pointer"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Upload className="w-4 h-4" />
          )}
          <span>UPLOAD</span>
        </button>
      </div>
    </form>
  );
}
