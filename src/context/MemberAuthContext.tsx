"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Eye, EyeOff, KeyRound, Loader2, LogOut, UserCheck, X } from "lucide-react";
import { verifyMemberPassword } from "@/services/member.service";
import type { MemberPublicInfo } from "@/types/domain";

export interface AuthenticatedMember extends MemberPublicInfo {
  password: string;
}

interface MemberAuthContextValue {
  member: AuthenticatedMember | null;
  ready: boolean;
  openLoginModal: (options?: {
    title?: string;
    subtitle?: string;
    onSuccess?: (member: AuthenticatedMember) => void;
  }) => void;
  closeLoginModal: () => void;
  logout: () => void;
  requireMemberAuth: (
    onAuthenticated: (member: AuthenticatedMember) => void,
    options?: { title?: string; subtitle?: string }
  ) => void;
}

const STORAGE_KEY = "moontomi:member_session_v1";

const MemberAuthContext = createContext<MemberAuthContextValue | null>(null);

export function MemberAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [member, setMember] = useState<AuthenticatedMember | null>(null);
  const [ready, setReady] = useState(false);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("멤버 로그인");
  const [modalSubtitle, setModalSubtitle] = useState(
    "본인의 비밀번호를 입력하면 해당하는 멤버 계정으로 접속됩니다."
  );
  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onSuccessRef = useRef<((m: AuthenticatedMember) => void) | null>(null);

  // Restore saved session on mount & re-validate silently
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as AuthenticatedMember;
        if (
          parsed &&
          typeof parsed.member_id === "number" &&
          typeof parsed.name === "string" &&
          typeof parsed.password === "string"
        ) {
          setMember(parsed);
          verifyMemberPassword(parsed.password)
            .then((verified) => {
              const updated: AuthenticatedMember = {
                member_id: verified.member_id,
                name: verified.name,
                password: parsed.password,
              };
              setMember(updated);
              window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            })
            .catch(() => {
              setMember(null);
              window.localStorage.removeItem(STORAGE_KEY);
            });
        }
      }
    } catch {
      // ignore corrupted storage
    } finally {
      setReady(true);
    }
  }, []);

  const openLoginModal = useCallback(
    (options?: {
      title?: string;
      subtitle?: string;
      onSuccess?: (member: AuthenticatedMember) => void;
    }) => {
      setModalTitle(options?.title ?? "멤버 로그인");
      setModalSubtitle(
        options?.subtitle ??
          "본인의 비밀번호를 입력하면 해당하는 멤버 계정으로 접속됩니다."
      );
      onSuccessRef.current = options?.onSuccess ?? null;
      setPasswordInput("");
      setShowPassword(false);
      setErrorMessage(null);
      setIsModalOpen(true);
    },
    []
  );

  const closeLoginModal = useCallback(() => {
    setIsModalOpen(false);
    setPasswordInput("");
    setErrorMessage(null);
    onSuccessRef.current = null;
  }, []);

  const logout = useCallback(() => {
    setMember(null);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const requireMemberAuth = useCallback(
    (
      onAuthenticated: (m: AuthenticatedMember) => void,
      options?: { title?: string; subtitle?: string }
    ) => {
      if (member) {
        onAuthenticated(member);
        return;
      }
      openLoginModal({
        title: options?.title ?? "멤버 인증이 필요합니다",
        subtitle:
          options?.subtitle ??
          "글을 작성하거나 수정하려면 멤버 비밀번호를 입력해주세요.",
        onSuccess: onAuthenticated,
      });
    },
    [member, openLoginModal]
  );

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = passwordInput.trim();
    if (!trimmed) {
      setErrorMessage("비밀번호를 입력해주세요.");
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);
    try {
      const verified = await verifyMemberPassword(trimmed);
      const authMember: AuthenticatedMember = {
        member_id: verified.member_id,
        name: verified.name,
        password: trimmed,
      };
      setMember(authMember);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(authMember));
      }
      const callback = onSuccessRef.current;
      closeLoginModal();
      if (callback) {
        callback(authMember);
      }
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "일치하는 멤버 비밀번호가 없습니다.";
      setErrorMessage(
        msg.includes("일치하는")
          ? "일치하는 멤버 비밀번호가 없습니다."
          : msg
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MemberAuthContext.Provider
      value={{
        member,
        ready,
        openLoginModal,
        closeLoginModal,
        logout,
        requireMemberAuth,
      }}
    >
      {children}

      {/* Global Login / Account Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-[2px] flex items-center justify-center p-4 animate-fade-in"
          onClick={closeLoginModal}
        >
          <div
            className="w-full max-w-[380px] rounded-[14px] bg-white border border-[#242d3c] shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 bg-[#242d3c] text-[#f0f8ff] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-[#ff8080]" />
                <h2 className="text-sm sm:text-base font-bold tracking-tight">
                  {modalTitle}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeLoginModal}
                aria-label="닫기"
                className="p-1 rounded-full text-[#f0f8ff]/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {member && !onSuccessRef.current ? (
              <div className="p-5 space-y-4">
                <div className="p-4 rounded-[10px] bg-[#f3f3f3]/80 border border-[#bdc0c4]/60 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#242d3c] text-[#ff8080] flex items-center justify-center shrink-0">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-[#808080]">
                      현재 접속 중인 멤버
                    </div>
                    <div className="text-base font-bold text-[#242d3c] truncate">
                      {member.name}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                    }}
                    className="flex-1 py-2.5 px-4 rounded-[7px] border border-[#bdc0c4] hover:border-[#242d3c] text-xs font-bold text-[#242d3c] hover:bg-[#f3f3f3] inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5 text-[#ff8080]" />
                    <span>로그아웃 / 다른 계정 전환</span>
                  </button>
                  <button
                    type="button"
                    onClick={closeLoginModal}
                    className="py-2.5 px-4 rounded-[7px] bg-[#242d3c] text-[#f0f8ff] text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    확인
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleLoginSubmit} className="p-5 space-y-4">
                <p className="text-xs sm:text-sm text-[#808080] leading-relaxed break-keep">
                  {modalSubtitle}
                </p>

                {errorMessage && (
                  <div className="p-2.5 rounded-[7px] bg-[#ff8080]/15 border border-[#ff8080] text-xs font-semibold text-[#171717] text-center">
                    {errorMessage}
                  </div>
                )}

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={passwordInput}
                    onChange={(e) => {
                      setPasswordInput(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="멤버 비밀번호 입력"
                    autoFocus
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-[7px] border border-[#bdc0c4] bg-white text-sm text-[#171717] focus:outline-none focus:border-[#242d3c]"
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

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={closeLoginModal}
                    className="px-4 py-2 rounded-[7px] border border-[#bdc0c4] text-xs font-bold text-[#808080] hover:text-[#242d3c] hover:bg-[#f3f3f3] transition-colors cursor-pointer"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 rounded-[7px] bg-[#242d3c] hover:bg-[#242d3c]/90 disabled:opacity-50 text-[#f0f8ff] text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#ff8080]" />
                        <span>확인 중...</span>
                      </>
                    ) : (
                      <span>접속하기</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </MemberAuthContext.Provider>
  );
}

export function useMemberAuth() {
  const ctx = useContext(MemberAuthContext);
  if (!ctx) {
    throw new Error("useMemberAuth must be used within a MemberAuthProvider");
  }
  return ctx;
}
