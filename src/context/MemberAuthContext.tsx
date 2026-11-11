"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  CheckCheck,
  CirclePlay,
  Disc3,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  LogOut,
  Newspaper,
  UserCheck,
  X,
} from "lucide-react";
import { verifyMemberPassword } from "@/services/member.service";
import {
  fetchRecentNotifications,
  type ContentNotificationItem,
  type NotificationCategory,
} from "@/services/notification.service";
import type { MemberPublicInfo } from "@/types/domain";
import { cn } from "@/lib/utils";

export interface AuthenticatedMember extends MemberPublicInfo {
  password: string;
}

interface MemberAuthContextValue {
  member: AuthenticatedMember | null;
  ready: boolean;
  notifications: ContentNotificationItem[];
  unreadCount: number;
  isNotificationUnread: (item: ContentNotificationItem) => boolean;
  markNotificationRead: (key: string) => void;
  markAllNotificationsRead: () => void;
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
const NOTIFICATION_STORAGE_KEY = "moontomi:notifications_v1";
const RECENT_WINDOW_MS = 14 * 24 * 60 * 60 * 1000; // 14 days

interface StoredNotificationState {
  readKeys: string[];
  baselineMaxIds: {
    lecture: number;
    review: number;
    archive: number;
  };
}

const CATEGORY_META: Record<
  NotificationCategory,
  { label: string; icon: typeof Disc3 }
> = {
  lecture: { label: "음평회", icon: Disc3 },
  review: { label: "칼럼", icon: Newspaper },
  archive: { label: "아카이브", icon: CirclePlay },
};

const MemberAuthContext = createContext<MemberAuthContextValue | null>(null);

export function MemberAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [member, setMember] = useState<AuthenticatedMember | null>(null);
  const [ready, setReady] = useState(false);

  // Notification state
  const [notifications, setNotifications] = useState<ContentNotificationItem[]>(
    []
  );
  const [notifState, setNotifState] = useState<StoredNotificationState>({
    readKeys: [],
    baselineMaxIds: { lecture: 0, review: 0, archive: 0 },
  });
  const [notifLoaded, setNotifLoaded] = useState(false);
  const [activeCategory, setActiveCategory] = useState<
    "all" | NotificationCategory
  >("all");

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAuthOnlyMode, setIsAuthOnlyMode] = useState(false);
  const [modalTitle, setModalTitle] = useState("멤버 & 최근 소식");
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

  // Load notifications & initialize baseline state
  useEffect(() => {
    if (typeof window === "undefined") return;
    let cancelled = false;

    async function loadNotifications() {
      let saved: StoredNotificationState | null = null;
      try {
        const raw = window.localStorage.getItem(NOTIFICATION_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as StoredNotificationState;
          if (parsed && Array.isArray(parsed.readKeys) && parsed.baselineMaxIds) {
            saved = parsed;
          }
        }
      } catch {
        // ignore
      }

      const items = await fetchRecentNotifications(5);
      if (cancelled) return;

      setNotifications(items);

      if (saved) {
        setNotifState(saved);
      } else {
        // First time initialization:
        // Keep recent items (within 14 days, or at least the top 3 newest items) unread,
        // and pre-mark older items as read so historical items don't flood the user.
        const now = Date.now();
        const recentKeys = new Set<string>();
        for (const item of items) {
          if (item.timestamp > 0 && now - item.timestamp <= RECENT_WINDOW_MS) {
            recentKeys.add(item.key);
          }
        }
        if (recentKeys.size === 0) {
          for (const item of items.slice(0, 3)) {
            recentKeys.add(item.key);
          }
        }

        const initialReadKeys = items
          .filter((item) => !recentKeys.has(item.key))
          .map((item) => item.key);

        const maxIds = { lecture: 0, review: 0, archive: 0 };
        for (const item of items) {
          if (item.id > maxIds[item.category]) {
            maxIds[item.category] = item.id;
          }
        }

        const initialState: StoredNotificationState = {
          readKeys: initialReadKeys,
          baselineMaxIds: maxIds,
        };
        setNotifState(initialState);
        try {
          window.localStorage.setItem(
            NOTIFICATION_STORAGE_KEY,
            JSON.stringify(initialState)
          );
        } catch {
          // ignore
        }
      }

      setNotifLoaded(true);
    }

    loadNotifications();
    return () => {
      cancelled = true;
    };
  }, []);

  const persistNotifState = useCallback((next: StoredNotificationState) => {
    setNotifState(next);
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(
          NOTIFICATION_STORAGE_KEY,
          JSON.stringify(next)
        );
      } catch {
        // ignore
      }
    }
  }, []);

  const markNotificationRead = useCallback(
    (key: string) => {
      setNotifState((prev) => {
        if (prev.readKeys.includes(key)) return prev;
        const next: StoredNotificationState = {
          ...prev,
          readKeys: [...prev.readKeys, key],
        };
        if (typeof window !== "undefined") {
          try {
            window.localStorage.setItem(
              NOTIFICATION_STORAGE_KEY,
              JSON.stringify(next)
            );
          } catch {
            // ignore
          }
        }
        return next;
      });
    },
    []
  );

  // Automatically mark notification as read when visiting the detail route directly
  useEffect(() => {
    if (!pathname) return;
    const match = pathname.match(/^\/(lecture|review|archive)\/(\d+)$/);
    if (match) {
      const key = `${match[1]}:${match[2]}`;
      markNotificationRead(key);
    }
  }, [pathname, markNotificationRead]);

  const isNotificationUnread = useCallback(
    (item: ContentNotificationItem) => {
      if (!notifLoaded) return false;
      return !notifState.readKeys.includes(item.key);
    },
    [notifLoaded, notifState.readKeys]
  );

  const unreadCount = useMemo(() => {
    if (!notifLoaded) return 0;
    return notifications.filter(
      (item) => !notifState.readKeys.includes(item.key)
    ).length;
  }, [notifLoaded, notifications, notifState.readKeys]);

  const markAllNotificationsRead = useCallback(() => {
    const allKeys = Array.from(
      new Set([
        ...notifState.readKeys,
        ...notifications.map((item) => item.key),
      ])
    );
    const maxIds = { ...notifState.baselineMaxIds };
    for (const item of notifications) {
      if (item.id > maxIds[item.category]) {
        maxIds[item.category] = item.id;
      }
    }
    persistNotifState({
      readKeys: allKeys,
      baselineMaxIds: maxIds,
    });
  }, [notifications, notifState, persistNotifState]);

  const openLoginModal = useCallback(
    (options?: {
      title?: string;
      subtitle?: string;
      onSuccess?: (member: AuthenticatedMember) => void;
    }) => {
      const authOnly = Boolean(options?.onSuccess);
      setIsAuthOnlyMode(authOnly);
      setModalTitle(
        options?.title ?? (authOnly ? "멤버 로그인" : "멤버 & 최근 소식")
      );
      setModalSubtitle(
        options?.subtitle ??
          "본인의 비밀번호를 입력하면 해당하는 멤버 계정으로 접속됩니다."
      );
      onSuccessRef.current = options?.onSuccess ?? null;
      setPasswordInput("");
      setShowPassword(false);
      setErrorMessage(null);
      setActiveCategory("all");
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
      setPasswordInput("");
      const callback = onSuccessRef.current;
      if (callback) {
        closeLoginModal();
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

  const filteredNotifications = useMemo(() => {
    if (activeCategory === "all") return notifications;
    return notifications.filter((item) => item.category === activeCategory);
  }, [notifications, activeCategory]);

  return (
    <MemberAuthContext.Provider
      value={{
        member,
        ready,
        notifications,
        unreadCount,
        isNotificationUnread,
        markNotificationRead,
        markAllNotificationsRead,
        openLoginModal,
        closeLoginModal,
        logout,
        requireMemberAuth,
      }}
    >
      {children}

      {/* Global Member & Notification Hub Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-[2px] flex items-center justify-center p-4 animate-fade-in"
          onClick={closeLoginModal}
        >
          <div
            className={cn(
              "w-full rounded-[14px] bg-white border border-[#242d3c] shadow-xl overflow-hidden flex flex-col max-h-[85vh]",
              isAuthOnlyMode ? "max-w-[380px]" : "max-w-[420px]"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-5 py-3.5 bg-[#242d3c] text-[#f0f8ff] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                {isAuthOnlyMode ? (
                  <KeyRound className="w-4 h-4 text-[#ff8080]" />
                ) : (
                  <Bell className="w-4 h-4 text-[#ff8080]" />
                )}
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

            {isAuthOnlyMode ? (
              /* Auth-only prompt when triggered by writing/editing action */
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
            ) : (
              /* Unified Member Account + Recent Notifications Hub */
              <div className="flex flex-col min-h-0 overflow-hidden">
                {/* Top Section: Member Status or Quick Login */}
                <div className="p-4 border-b border-[#bdc0c4]/50 bg-[#f8f9fa] shrink-0">
                  {member ? (
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-[#242d3c] text-[#ff8080] flex items-center justify-center shrink-0">
                          <UserCheck className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[11px] font-semibold text-[#808080]">
                            현재 접속 중인 멤버
                          </div>
                          <div className="text-sm font-bold text-[#242d3c] truncate">
                            {member.name}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={logout}
                        className="py-1.5 px-3 rounded-[7px] border border-[#bdc0c4] bg-white hover:border-[#242d3c] text-xs font-bold text-[#242d3c] hover:bg-[#f3f3f3] inline-flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                      >
                        <LogOut className="w-3.5 h-3.5 text-[#ff8080]" />
                        <span>로그아웃 / 전환</span>
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleLoginSubmit} className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#242d3c] flex items-center gap-1.5">
                          <KeyRound className="w-3.5 h-3.5 text-[#ff8080]" />
                          멤버 로그인
                        </span>
                        <span className="text-[11px] text-[#808080]">
                          비밀번호 입력 시 내 계정으로 접속
                        </span>
                      </div>

                      {errorMessage && (
                        <div className="p-2 rounded-[7px] bg-[#ff8080]/15 border border-[#ff8080] text-xs font-semibold text-[#171717] text-center">
                          {errorMessage}
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <input
                            type={showPassword ? "text" : "password"}
                            value={passwordInput}
                            onChange={(e) => {
                              setPasswordInput(e.target.value);
                              if (errorMessage) setErrorMessage(null);
                            }}
                            placeholder="멤버 비밀번호 입력"
                            className="w-full pl-3 pr-9 py-2 rounded-[7px] border border-[#bdc0c4] bg-white text-xs sm:text-sm text-[#171717] focus:outline-none focus:border-[#242d3c]"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            aria-label={
                              showPassword ? "비밀번호 숨기기" : "비밀번호 보기"
                            }
                            className="absolute inset-y-0 right-0 px-2.5 flex items-center text-[#808080] hover:text-[#242d3c] cursor-pointer"
                          >
                            {showPassword ? (
                              <Eye className="w-3.5 h-3.5" />
                            ) : (
                              <EyeOff className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>

                        <button
                          type="submit"
                          disabled={submitting}
                          className="px-4 py-2 rounded-[7px] bg-[#242d3c] hover:bg-[#242d3c]/90 disabled:opacity-50 text-[#f0f8ff] text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                        >
                          {submitting ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#ff8080]" />
                          ) : (
                            <span>접속</span>
                          )}
                        </button>
                      </div>
                    </form>
                  )}
                </div>

                {/* Bottom Section: Recent Content Notifications */}
                <div className="px-4 pt-3 pb-2 flex items-center justify-between border-b border-[#f3f3f3] shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#242d3c]">
                      새 컨텐츠 알림
                    </span>
                    {unreadCount > 0 && (
                      <span className="inline-flex items-center justify-center px-1.5 pt-[3px] pb-[1px] rounded-full bg-[#ff8080] text-white text-[10px] font-bold leading-none">
                        {unreadCount}
                      </span>
                    )}
                  </div>

                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={markAllNotificationsRead}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-[#808080] hover:text-[#242d3c] transition-colors cursor-pointer"
                    >
                      <CheckCheck className="w-3.5 h-3.5 text-[#ff8080]" />
                      <span>모두 읽음</span>
                    </button>
                  )}
                </div>

                {/* Category Filter Tabs */}
                <div className="px-4 py-2 flex items-center gap-1.5 border-b border-[#f3f3f3] shrink-0">
                  {(
                    [
                      { key: "all", label: "전체" },
                      { key: "lecture", label: "새 음평회" },
                      { key: "review", label: "새 칼럼" },
                      { key: "archive", label: "새 아카이브" },
                    ] as const
                  ).map((tab) => {
                    const isSelected = activeCategory === tab.key;
                    const tabUnreadCount =
                      tab.key === "all"
                        ? unreadCount
                        : notifications.filter(
                            (n) =>
                              n.category === tab.key && isNotificationUnread(n)
                          ).length;

                    return (
                      <button
                        key={tab.key}
                        type="button"
                        onClick={() => setActiveCategory(tab.key)}
                        className={cn(
                          "px-2.5 pt-[6px] pb-[4px] rounded-full text-[11px] leading-none font-bold transition-colors inline-flex items-center justify-center gap-1 cursor-pointer",
                          isSelected
                            ? "bg-[#242d3c] text-[#f0f8ff]"
                            : "bg-[#f3f3f3] text-[#808080] hover:text-[#242d3c]"
                        )}
                      >
                        <span className="translate-y-[0.5px]">{tab.label}</span>
                        {tabUnreadCount > 0 && (
                          <span
                            className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              isSelected ? "bg-[#ff8080]" : "bg-[#ff8080]"
                            )}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Notification List */}
                <div className="divide-y divide-[#f3f3f3] overflow-y-auto max-h-[320px]">
                  {filteredNotifications.length === 0 ? (
                    <div className="py-10 text-center text-xs text-[#808080]">
                      표시할 최근 소식이 없습니다.
                    </div>
                  ) : (
                    filteredNotifications.map((item) => {
                      const unread = isNotificationUnread(item);
                      const meta = CATEGORY_META[item.category];
                      const CategoryIcon = meta.icon;

                      return (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => {
                            markNotificationRead(item.key);
                            closeLoginModal();
                            router.push(item.href);
                          }}
                          className={cn(
                            "w-full px-4 py-3 flex items-center gap-3 text-left transition-colors cursor-pointer",
                            unread
                              ? "bg-[#ff8080]/[0.06] hover:bg-[#ff8080]/[0.12]"
                              : "bg-white hover:bg-[#f8f9fa] opacity-75"
                          )}
                        >
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-11 h-11 rounded-[7px] object-cover border border-[#bdc0c4]/50 shrink-0 bg-[#f3f3f3]"
                          />

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span className="inline-flex items-center gap-1 px-1.5 pt-[3.5px] pb-[2px] rounded bg-[#242d3c] text-[#f0f8ff] text-[10px] font-bold leading-none">
                                <CategoryIcon className="w-2.5 h-2.5 text-[#ff8080] shrink-0" />
                                <span className="translate-y-[0.5px]">{meta.label}</span>
                              </span>
                              {item.date && (
                                <span className="text-[11px] text-[#808080] font-mono">
                                  {item.date}
                                </span>
                              )}
                            </div>

                            <div className="text-xs sm:text-sm font-bold text-[#242d3c] truncate">
                              {item.title}
                            </div>
                            <div className="text-[11px] text-[#808080] truncate mt-0.5">
                              {item.subtitle}
                            </div>
                          </div>

                          {unread && (
                            <span
                              title="읽지 않음"
                              className="w-2.5 h-2.5 rounded-full bg-[#ff8080] shrink-0"
                            />
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
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
