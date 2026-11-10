"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, KeyRound, UserCheck, X } from "lucide-react";
import { useMemberAuth } from "@/context/MemberAuthContext";
import { NAV_ITEMS } from "./AppHeader";
import { cn } from "@/lib/utils";

export function AppFooter() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();
  const { member, openLoginModal } = useMemberAuth();

  return (
    <>
      {/* Mobile Navigation Drawer */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#242d3c]/60 backdrop-blur-[1px] md:hidden"
          onClick={() => setDrawerOpen(false)}
        >
          <div
            className="fixed top-0 left-0 bottom-0 w-72 bg-white shadow-xl flex flex-col justify-between p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div className="flex items-center justify-between border-b border-[#bdc0c4]/60 pb-4">
                <div className="flex items-center gap-3">
                  <img
                    src="/icons/icon-192x192.png"
                    alt="MOONTOMI"
                    className="w-10 h-10 rounded-full border border-[#bdc0c4]/50"
                  />
                  <div>
                    <div className="font-stamp text-lg leading-none text-[#242d3c]">
                      HELLO! MOONTOMI
                    </div>
                    <div className="text-xs font-nohemi tracking-wider text-[#808080] mt-0.5">
                      NAVIGATION
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  aria-label="메뉴 닫기"
                  className="p-1.5 rounded-[7px] text-[#808080] hover:text-[#242d3c] hover:bg-[#f3f3f3] transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex flex-col gap-1.5 pt-4">
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    item.path === "/"
                      ? pathname === "/"
                      : pathname.startsWith(item.path) ||
                        (item.path === "/reviews" &&
                          pathname.startsWith("/review")) ||
                        (item.path === "/lectures" &&
                          (pathname.startsWith("/lecture") ||
                            pathname.startsWith("/comment")));
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      onClick={() => setDrawerOpen(false)}
                      className={cn(
                        "flex items-center gap-3.5 px-3.5 py-3 rounded-[7px] text-sm transition-colors",
                        isActive
                          ? "bg-[#242d3c] text-[#f0f8ff] font-bold"
                          : "text-[#242d3c] hover:bg-[#f3f3f3]"
                      )}
                    >
                      <Icon
                        className={cn(
                          "w-5 h-5 shrink-0",
                          isActive ? "text-[#ff8080]" : "text-[#242d3c]"
                        )}
                      />
                      <div>
                        <div>{item.title}</div>
                        <div
                          className={cn(
                            "text-xs font-normal",
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

            <div className="border-t border-[#f3f3f3] pt-3 space-y-2">
              <button
                type="button"
                onClick={() => {
                  setDrawerOpen(false);
                  openLoginModal();
                }}
                className="w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-[7px] text-sm text-[#242d3c] hover:bg-[#f3f3f3] transition-colors cursor-pointer text-left"
              >
                {member ? (
                  <UserCheck className="w-5 h-5 shrink-0 text-[#ff8080]" />
                ) : (
                  <KeyRound className="w-5 h-5 shrink-0 text-[#242d3c]" />
                )}
                <div>
                  <div className="font-bold">
                    {member ? member.name : "멤버 로그인"}
                  </div>
                  <div className="text-xs font-normal text-[#808080]">
                    {member ? "접속 중 · 클릭하여 전환" : "비밀번호로 접속"}
                  </div>
                </div>
              </button>
              <div className="px-3.5 text-xs text-[#808080]">
                <div className="font-bold text-[#242d3c]">대중 음악의 이해</div>
                <div className="mt-0.5">문형규의 토요일, 음악에 미치는 날</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer
        onClick={() => setDrawerOpen((prev) => !prev)}
        className="fixed bottom-0 left-0 z-40 w-full bg-[#242d3c] text-[#f0f8ff] py-2.5 text-center text-xs sm:text-sm font-sans md:pl-[75px] border-t border-white/10 cursor-pointer md:cursor-default select-none"
      >
        <div className="hidden md:flex items-center justify-center gap-2 font-bold tracking-wide">
          <span>대중 음악의 이해</span>
          <span className="text-[#ff8080]">·</span>
          <span className="text-[#f0f8ff]/75 font-normal text-xs">
            MOONTOMI ARCHIVE
          </span>
        </div>
        <div className="md:hidden inline-flex items-center justify-center gap-2 font-bold tracking-wider">
          <Compass className="w-4 h-4 text-[#ff8080]" />
          <span>NAVIGATION</span>
        </div>
      </footer>
    </>
  );
}
