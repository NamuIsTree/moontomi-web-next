import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";

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

export const viewport: Viewport = {
  themeColor: "#242d3c",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://moontomi.com"),
  applicationName: "MOONTOMI",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "MOONTOMI",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
  },
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
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
