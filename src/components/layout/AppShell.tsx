"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AppHeader } from "@/components/layout/AppHeader";
import { AppFooter } from "@/components/layout/AppFooter";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isAdminHost, setIsAdminHost] = useState(false);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.location.hostname.startsWith("admin.")
    ) {
      setIsAdminHost(true);
    }

    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/service-worker.js", { scope: "/" })
        .catch(() => {});
    }
  }, []);

  const isAdminRoute =
    pathname.startsWith("/admin") ||
    pathname === "/login" ||
    isAdminHost;

  if (isAdminRoute) {
    return <div className="min-h-screen flex flex-col bg-[#f6f7f9]">{children}</div>;
  }

  return (
    <>
      <AppHeader />
      <main className="flex-1 pt-[90px] md:pl-[75px] w-full">{children}</main>
      <AppFooter />
    </>
  );
}
