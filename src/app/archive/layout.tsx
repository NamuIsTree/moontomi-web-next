import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "아카이브",
  description: "문토미가 엄선한 추천 명반 및 싱글 큐레이션 아카이브",
  alternates: {
    canonical: "/archive",
  },
  openGraph: {
    title: "아카이브 | MOONTOMI",
    description: "문토미가 엄선한 추천 명반 및 싱글 큐레이션 아카이브",
    url: "https://moontomi.com/archive",
  },
};

export default function ArchiveLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
