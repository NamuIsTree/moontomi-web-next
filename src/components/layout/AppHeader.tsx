"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Newspaper,
  Disc3,
  History,
  CirclePlay,
  KeyRound,
  UserCheck,
} from "lucide-react";
import { useMemberAuth } from "@/context/MemberAuthContext";
import { cn } from "@/lib/utils";

export const NAV_ITEMS = [
  { title: "HOME", subtitle: "홈", icon: Home, path: "/" },
  { title: "칼럼", subtitle: "매거진 · 결산", icon: Newspaper, path: "/reviews" },
  { title: "음평회", subtitle: "정기 감상 기록", icon: Disc3, path: "/lectures" },
  { title: "둘러보기", subtitle: "멤버별 평점 탐색", icon: History, path: "/lookup" },
  { title: "아카이브", subtitle: "큐레이션 스테이션", icon: CirclePlay, path: "/archive" },
];

export function AppHeader() {
  const [shrink, setShrink] = useState(false);
  const [hovered, setHovered] = useState(false);
  const pathname = usePathname();
  const { member, openLoginModal } = useMemberAuth();

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      setShrink(scrollTop > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 z-50 w-full bg-[#242d3c] text-[#f0f8ff] text-center font-stamp border-b border-white/10 transition-all duration-300 md:pl-[75px] flex items-center justify-center",
          shrink
            ? "h-[52px] text-[30px]"
            : "h-[90px] text-[40px]"
        )}
      >
        <Link href="/" className="inline-flex flex-col items-center leading-none group">
          <span className="tracking-wide group-hover:text-[#ff8080] transition-colors">
            MOONTOMI
          </span>
          <span
            className={cn(
              "grid transition-[grid-template-rows,opacity,margin] duration-300 ease-out",
              shrink
                ? "grid-rows-[0fr] opacity-0 mt-0"
                : "grid-rows-[1fr] opacity-100 mt-1"
            )}
          >
            <span className="overflow-hidden text-xs sm:text-[15px] font-semibold font-sans text-[#f0f8ff]/85 tracking-tight">
              문형규의 토요일, 음악에 미치는 날
            </span>
          </span>
        </Link>
      </header>

      {/* Desktop Left Rail Navigation */}
      <aside
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={cn(
          "hidden md:flex flex-col justify-between fixed top-0 left-0 z-50 h-screen bg-white border-r border-[#bdc0c4]/70 transition-all duration-300 overflow-hidden",
          hovered ? "w-[240px] shadow-lg" : "w-[75px]"
        )}
      >
        <div>
          <Link
            href="/"
            className={cn(
              "flex items-center gap-3 px-4 border-b border-[#bdc0c4]/60 transition-all duration-300",
              shrink ? "h-[52px]" : "h-[90px]"
            )}
          >
            <img
              src="/icons/icon-192x192.png"
              alt="MOONTOMI"
              className="w-10 h-10 rounded-full shrink-0 border border-[#bdc0c4]/50"
            />
            <div
              className={cn(
                "overflow-hidden whitespace-nowrap transition-opacity duration-200",
                hovered ? "opacity-100" : "opacity-0"
              )}
            >
              <div className="font-stamp text-lg leading-none text-[#242d3c]">
                HELLO! MOONTOMI
              </div>
              <div className="text-xs font-nohemi tracking-wider text-[#808080] mt-0.5">
                SATURDAY LISTENING
              </div>
            </div>
          </Link>

          <nav className="flex flex-col py-3 px-2 gap-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.path === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.path) ||
                    (item.path === "/reviews" && pathname.startsWith("/review")) ||
                    (item.path === "/lectures" &&
                      (pathname.startsWith("/lecture") ||
                        pathname.startsWith("/comment")));

              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={cn(
                    "flex items-center gap-4 px-3.5 py-3 rounded-[7px] text-sm font-sans transition-colors",
                    isActive
                      ? "bg-[#242d3c] text-[#f0f8ff] font-bold"
                      : "text-[#242d3c] hover:bg-[#f3f3f3]"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-5 h-5 shrink-0 transition-colors",
                      isActive ? "text-[#ff8080]" : "text-[#242d3c]"
                    )}
                  />
                  <div
                    className={cn(
                      "overflow-hidden whitespace-nowrap transition-opacity duration-200 leading-tight",
                      hovered ? "opacity-100" : "opacity-0"
                    )}
                  >
                    <div>{item.title}</div>
                    <div
                      className={cn(
                        "text-xs font-normal mt-0.5",
                        isActive ? "text-[#f0f8ff]/75" : "text-[#808080]"
                      )}
                    >
                      {item.subtitle}
                    </div>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-[#f3f3f3] p-2 space-y-2">
          <button
            type="button"
            onClick={() => openLoginModal()}
            title={member ? `${member.name} (접속 중)` : "멤버 로그인"}
            className="w-full flex items-center gap-4 px-3.5 py-2.5 rounded-[7px] text-sm font-sans text-[#242d3c] hover:bg-[#f3f3f3] transition-colors cursor-pointer text-left"
          >
            {member ? (
              <span className="relative shrink-0">
                <UserCheck className="w-5 h-5 text-[#ff8080]" />
                <span className="
                  absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#ff8080] ring-2 ring-white
                " />
              </span>
            ) : (
              <KeyRound className="w-5 h-5 shrink-0 text-[#242d3c]" />
            )}
            <div
              className={cn(
                "overflow-hidden whitespace-nowrap transition-opacity duration-200 leading-tight",
                hovered ? "opacity-100" : "opacity-0"
              )}
            >
              <div className="font-bold">
                {member ? member.name : "멤버 로그인"}
              </div>
              <div className="text-xs font-normal text-[#808080] mt-0.5">
                {member ? "접속 중 · 클릭하여 전환" : "비밀번호로 접속"}
              </div>
            </div>
          </button>

          <div
            className={cn(
              "px-3.5 py-2 text-xs text-[#808080] whitespace-nowrap transition-opacity duration-200",
              hovered ? "opacity-100" : "opacity-0"
            )}
          >
            <div className="font-bold text-[#242d3c]">대중 음악의 이해</div>
            <div className="mt-0.5">Since Saturday Listening Club</div>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar (< md) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#242d3c] text-[#f0f8ff] border-t border-white/15 grid grid-cols-6 h-[56px]">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.path === "/"
              ? pathname === "/"
              : pathname.startsWith(item.path) ||
                (item.path === "/reviews" && pathname.startsWith("/review")) ||
                (item.path === "/lectures" &&
                  (pathname.startsWith("/lecture") ||
                    pathname.startsWith("/comment")));

          return (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 text-[11px] font-bold transition-colors px-1",
                isActive ? "text-[#ff8080]" : "text-[#f0f8ff]/75"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate max-w-full">{item.title}</span>
            </Link>
          );
        })}

        <button
          type="button"
          onClick={() => openLoginModal()}
          className={cn(
            "flex flex-col items-center justify-center gap-0.5 text-[11px] font-bold transition-colors px-1 cursor-pointer",
            member ? "text-[#ff8080]" : "text-[#f0f8ff]/75"
          )}
        >
          {member ? (
            <UserCheck className="w-4 h-4 shrink-0" />
          ) : (
            <KeyRound className="w-4 h-4 shrink-0" />
          )}
          <span className="truncate max-w-full">
            {member ? member.name : "로그인"}
          </span>
        </button>
      </nav>
    </>
  );
}
