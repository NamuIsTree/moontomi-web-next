import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AppHeader } from "@/components/layout/AppHeader";
import { AppFooter } from "@/components/layout/AppFooter";

const bayatersStamp = localFont({
  src: "../fonts/BayatersStampdemo-51PB8.ttf",
  variable: "--font-bayaters-stamp",
  display: "swap",
});

const lineSeed = localFont({
  src: "../fonts/LINESeedKR-Rg.ttf",
  variable: "--font-line-seed",
  display: "swap",
});

const lobster = localFont({
  src: "../fonts/Lobster-Regular.ttf",
  variable: "--font-lobster",
  display: "swap",
});

const nanumMyeongjo = localFont({
  src: "../fonts/NanumMyeongjoExtraBold.ttf",
  variable: "--font-nanum-myeongjo",
  display: "swap",
});

const nohemi = localFont({
  src: [
    { path: "../fonts/Nohemi-Medium.ttf", weight: "500", style: "normal" },
    { path: "../fonts/Nohemi-Bold.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-nohemi",
  display: "swap",
});

const robotoMono = localFont({
  src: "../fonts/RobotoMono-Regular.ttf",
  variable: "--font-roboto-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://moontomi.com"),
  title: {
    default: "MOONTOMI — 문형규의 토요일, 음악에 미치는 날",
    template: "%s | MOONTOMI",
  },
  description:
    "문형규의 토요일, 음악에 미치는 날 (문토미) — 매주 토요일 진행되는 음평회 기록, 음악 칼럼 및 리뷰, 추천 음반 아카이브",
  keywords: [
    "MOONTOMI",
    "문토미",
    "문형규의 토요일 음악에 미치는 날",
    "대중 음악의 이해",
    "음평회",
    "음악 평론",
    "앨범 리뷰",
    "음악 칼럼",
    "명반 추천",
    "음악 아카이브",
  ],
  authors: [{ name: "MOONTOMI" }],
  creator: "MOONTOMI",
  publisher: "MOONTOMI",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "https://moontomi.com",
    siteName: "MOONTOMI — 문형규의 토요일, 음악에 미치는 날",
    title: "MOONTOMI — 문형규의 토요일, 음악에 미치는 날",
    description:
      "매주 토요일 진행되는 음평회 기록, 음악 칼럼 및 리뷰, 추천 음반 아카이브",
    images: [
      {
        url: "/icons/icon-512x512.png",
        width: 512,
        height: 512,
        alt: "MOONTOMI — 문형규의 토요일, 음악에 미치는 날",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MOONTOMI — 문형규의 토요일, 음악에 미치는 날",
    description:
      "매주 토요일 진행되는 음평회 기록, 음악 칼럼 및 리뷰, 추천 음반 아카이브",
    images: ["/icons/icon-512x512.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${bayatersStamp.variable} ${lineSeed.variable} ${lobster.variable} ${nanumMyeongjo.variable} ${nohemi.variable} ${robotoMono.variable}`}
    >
      <body className="min-h-screen flex flex-col bg-white text-[#171717] antialiased selection:bg-[#ff8080]/25 selection:text-[#242d3c]">
        <AppHeader />
        <main className="flex-1 pt-[90px] md:pl-[75px] w-full">{children}</main>
        <AppFooter />
      </body>
    </html>
  );
}
