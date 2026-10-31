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
} from "lucide-react";
import { cn } from "@/lib/utils";

export const NAV_ITEMS = [
  { title: "HOME", icon: Home, path: "/" },
  { title: "칼럼", icon: Newspaper, path: "/reviews" },
  { title: "음평회", icon: Disc3, path: "/lectures" },
  { title: "둘러보기", icon: History, path: "/lookup" },
  { title: "아카이브", icon: CirclePlay, path: "/archive" },
];

export function AppHeader() {
  const [shrink, setShrink] = useState(false);
  const [hovered, setHovered] = useState(false);
  const pathname = usePathname();

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
          "fixed top-0 left-0 z-50 w-full bg-[#242d3c] text-[aliceblue] text-center font-stamp transition-all duration-300 md:pl-[85px]",
          shrink
            ? "h-[50px] py-[5px] text-[30px] md:pl-[80px]"
            : "h-[90px] py-[10px] text-[40px]"
        )}
      >
        <Link href="/" className="inline-block leading-tight">
          MOONTOMI
          {!shrink && (
            <span className="block -mt-2 text-[15px] font-semibold font-sans">
              문형규의 토요일, 음악에 미치는 날
            </span>
          )}
        </Link>
      </header>

      {/* Desktop Left Rail Navigation */}
      <aside
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={cn(
          "hidden md:flex flex-col fixed top-0 left-0 z-50 h-screen bg-white border-r border-gray-200 shadow-sm transition-all duration-300 overflow-hidden",
          hovered ? "w-[240px]" : "w-[75px]"
        )}
      >
        <div
          className={cn(
            "flex items-center gap-3 px-4 border-b border-gray-200 transition-all duration-300",
            shrink ? "h-[50px]" : "h-[90px]"
          )}
        >
          <img
            src="/icons/icon-192x192.png"
            alt="MOONTOMI"
            className="w-10 h-10 rounded-full shrink-0"
          />
          {hovered && (
            <div className="overflow-hidden whitespace-nowrap">
              <div className="font-stamp text-lg leading-none text-[#242d3c]">
                HELLO! MOONTOMI
              </div>
              <div className="text-xs text-gray-500 font-sans">NAVIGATION</div>
            </div>
          )}
        </div>

        <nav className="flex flex-col py-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.path === "/"
                ? pathname === "/"
                : pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                href={item.path}
                className={cn(
                  "flex items-center gap-4 px-6 py-3.5 text-sm font-sans transition-colors hover:bg-gray-100",
                  isActive
                    ? "text-[#ff8080] font-bold bg-gray-50"
                    : "text-[#242d3c]"
                )}
              >
                <Icon className="w-6 h-6 shrink-0" />
                <span
                  className={cn(
                    "whitespace-nowrap transition-opacity duration-200",
                    hovered ? "opacity-100" : "opacity-0"
                  )}
                >
                  {item.title}
                </span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
