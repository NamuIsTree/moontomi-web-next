import type { Metadata } from "next";
import { fetchLectureById } from "@/services/lecture.service";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const lectureId = Number(id);

  if (!Number.isFinite(lectureId)) {
    return {
      title: "음평회 상세",
    };
  }

  const lecture = await fetchLectureById(lectureId);
  if (!lecture) {
    return {
      title: `제 ${lectureId}회 음평회`,
    };
  }

  const releaseYear = lecture.release ? lecture.release.slice(0, 4) : "";
  const ratingText =
    lecture.rating !== null ? ` · 평점 ${lecture.rating.toFixed(2)}` : "";
  const title = `제 ${lecture.id}회 음평회: ${lecture.title} - ${lecture.artist}`;
  const description = `제 ${lecture.id}회 문토미 음평회 (${lecture.date ?? ""}) — ${lecture.artist} 『${lecture.title}』${releaseYear ? ` (${releaseYear})` : ""}${ratingText}. 감상평 및 한줄평 모음.`;

  return {
    title,
    description,
    alternates: {
      canonical: `/lecture/${lecture.id}`,
    },
    openGraph: {
      type: "article",
      url: `https://moontomi.com/lecture/${lecture.id}`,
      title: `${title} | MOONTOMI`,
      description,
      images: lecture.image
        ? [
            {
              url: lecture.image,
              alt: `${lecture.title} - ${lecture.artist}`,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | MOONTOMI`,
      description,
      images: lecture.image ? [lecture.image] : undefined,
    },
  };
}

export default function LectureDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
