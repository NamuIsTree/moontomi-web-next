import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "음평회 목록",
  description:
    "문형규의 토요일, 음악에 미치는 날 (문토미) 역대 음평회 앨범 및 평점 기록",
  alternates: {
    canonical: "/lectures",
  },
  openGraph: {
    title: "음평회 목록 | MOONTOMI",
    description:
      "문형규의 토요일, 음악에 미치는 날 (문토미) 역대 음평회 앨범 및 평점 기록",
    url: "https://moontomi.com/lectures",
  },
};

export default function LecturesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
