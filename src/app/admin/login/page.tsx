"use client";

import { useState } from "react";
import { Lock, ArrowRight, Disc3 } from "lucide-react";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError("비밀번호를 입력해 주세요.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.message || "비밀번호가 올바르지 않습니다.");
        setLoading(false);
        return;
      }

      const isSubdomain =
        typeof window !== "undefined" &&
        window.location.hostname.startsWith("admin.");
      window.location.href = isSubdomain ? "/" : "/admin";
    } catch {
      setError("서버와 통신 중 오류가 발생했습니다.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#242d3c] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-[12px] shadow-2xl border border-white/10 overflow-hidden">
        {/* Header */}
        <div className="bg-[#1b222e] px-8 py-8 text-center border-b border-white/10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#ff8080]/15 text-[#ff8080] mb-3">
            <Disc3 className="w-6 h-6" />
          </div>
          <h1 className="font-stamp text-3xl text-[#f0f8ff] tracking-wide">
            MOONTOMI ADMIN
          </h1>
          <p className="mt-1.5 text-xs text-[#f0f8ff]/70 font-sans">
            문형규의 토요일, 음악에 미치는 날 — 관리자 콘솔
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div>
            <label
              htmlFor="admin-password"
              className="block text-xs font-bold text-[#242d3c] uppercase tracking-wider mb-2"
            >
              Admin Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#808080] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="관리자 비밀번호를 입력하세요"
                autoFocus
                className="w-full h-11 pl-10 pr-4 rounded-[7px] border border-[#bdc0c4] text-sm text-[#242d3c] focus:outline-none focus:border-[#242d3c] transition-colors"
              />
            </div>
          </div>

          {error && (
            <div className="px-3.5 py-2.5 rounded-[7px] bg-red-50 border border-red-200 text-xs font-semibold text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-[7px] bg-[#242d3c] hover:bg-[#ff8080] text-white font-bold text-sm inline-flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
          >
            <span>{loading ? "인증 확인 중..." : "관리자 로그인"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="pt-2 text-center">
            <a
              href="https://moontomi.com"
              className="text-xs text-[#808080] hover:text-[#242d3c] underline underline-offset-4 transition-colors"
            >
              메인 사이트(moontomi.com)로 돌아가기
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
