import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "통합 검색",
  description: "문토미 음평회 앨범, 아티스트, 장르별 통합 검색",
  alternates: {
    canonical: "/lookup",
  },
  openGraph: {
    title: "통합 검색 | MOONTOMI",
    description: "문토미 음평회 앨범, 아티스트, 장르별 통합 검색",
    url: "https://moontomi.com/lookup",
  },
};

export default function LookupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
