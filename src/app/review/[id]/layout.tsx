import type { Metadata } from "next";
import { fetchReviewById } from "@/services/review.service";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const reviewId = Number(id);

  if (!Number.isFinite(reviewId)) {
    return {
      title: "칼럼 상세",
    };
  }

  const review = await fetchReviewById(reviewId, false);
  if (!review) {
    return {
      title: "칼럼 상세",
    };
  }

  const title = `${review.title} — ${review.writer}`;
  const description =
    review.description ||
    `${review.writer}님의 ${review.type} 칼럼 (${review.created_at})`;

  return {
    title,
    description,
    authors: [{ name: review.writer }],
    alternates: {
      canonical: `/review/${review.id}`,
    },
    openGraph: {
      type: "article",
      url: `https://moontomi.com/review/${review.id}`,
      title: `${title} | MOONTOMI`,
      description,
      images: review.image
        ? [
            {
              url: review.image,
              alt: review.title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | MOONTOMI`,
      description,
      images: review.image ? [review.image] : undefined,
    },
  };
}

export default function ReviewDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
