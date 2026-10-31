"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { NAV_ITEMS } from "./AppHeader";
import { cn } from "@/lib/utils";

export function AppFooter() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Navigation Drawer */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 md:hidden"
          onClick={() => setDrawerOpen(false)}
        >
          <div
            className="fixed top-0 left-0 bottom-0 w-64 bg-white shadow-xl flex flex-col justify-between p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-3">
                <img
                  src="/icons/icon-192x192.png"
                  alt="MOONTOMI"
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <div className="font-stamp text-lg leading-none text-[#242d3c]">
                    HELLO! MOONTOMI
                  </div>
                  <div className="text-xs text-gray-500">NAVIGATION</div>
                </div>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-1 text-gray-500 hover:text-gray-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex flex-col gap-1 pb-10">
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
                    onClick={() => setDrawerOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-colors",
                      isActive
                        ? "bg-[#242d3c] text-white font-bold"
                        : "text-[#242d3c] hover:bg-gray-100"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.title}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      <footer
        onClick={() => setDrawerOpen((prev) => !prev)}
        className="fixed bottom-0 left-0 z-40 w-full bg-[#242d3c] text-[aliceblue] py-2 text-center text-sm font-sans md:pl-[75px] cursor-pointer md:cursor-default select-none"
      >
        <div className="hidden md:block font-bold">대중 음악의 이해</div>
        <div className="md:hidden font-bold">🧭 NAVIGATION</div>
      </footer>
    </>
  );
}
