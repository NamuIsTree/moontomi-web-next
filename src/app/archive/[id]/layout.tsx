import type { Metadata } from "next";
import { fetchArchiveById } from "@/services/archive.service";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const archiveId = Number(id);

  if (!Number.isFinite(archiveId)) {
    return {
      title: "아카이브 상세",
    };
  }

  const archive = await fetchArchiveById(archiveId);
  if (!archive) {
    return {
      title: `아카이브 #${archiveId}`,
    };
  }

  const title = `${archive.item.title} - ${archive.item.artist} (${archive.writer} 추천)`;
  const description = `문토미 아카이브 #${archive.id} — ${archive.item.artist} 『${archive.item.title}』 (${archive.writer} 추천 · 평점 ${archive.rating.toFixed(1)})`;

  return {
    title,
    description,
    alternates: {
      canonical: `/archive/${archive.id}`,
    },
    openGraph: {
      type: "music.album",
      url: `https://moontomi.com/archive/${archive.id}`,
      title: `${title} | MOONTOMI`,
      description,
      images: archive.item.image
        ? [
            {
              url: archive.item.image,
              alt: `${archive.item.title} - ${archive.item.artist}`,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | MOONTOMI`,
      description,
      images: archive.item.image ? [archive.item.image] : undefined,
    },
  };
}

export default function ArchiveDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
