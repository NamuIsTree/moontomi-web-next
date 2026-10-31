import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "칼럼 · 리뷰",
  description:
    "문토미 회원들의 음악 칼럼, 앨범 리뷰, 에세이 및 평론 모음",
  alternates: {
    canonical: "/reviews",
  },
  openGraph: {
    title: "칼럼 · 리뷰 | MOONTOMI",
    description:
      "문토미 회원들의 음악 칼럼, 앨범 리뷰, 에세이 및 평론 모음",
    url: "https://moontomi.com/reviews",
  },
};

export default function ReviewsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
