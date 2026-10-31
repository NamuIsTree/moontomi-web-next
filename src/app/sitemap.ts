import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/client";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://moontomi.com";
  const supabase = createClient();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/lectures`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/reviews`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/archive`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/lookup`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ];

  const [lecturesRes, reviewsRes, archivesRes] = await Promise.all([
    supabase
      .from("lecture")
      .select("lecture_id, date")
      .order("lecture_id", { ascending: false }),
    supabase
      .from("review")
      .select("review_id, created_at")
      .order("review_id", { ascending: false }),
    supabase
      .from("archive")
      .select("archive_id, date")
      .order("archive_id", { ascending: false }),
  ]);

  const lectureRoutes: MetadataRoute.Sitemap = (lecturesRes.data ?? []).map(
    (row) => ({
      url: `${baseUrl}/lecture/${row.lecture_id}`,
      lastModified: row.date ? new Date(row.date) : new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    })
  );

  const reviewRoutes: MetadataRoute.Sitemap = (reviewsRes.data ?? []).map(
    (row) => ({
      url: `${baseUrl}/review/${row.review_id}`,
      lastModified: row.created_at ? new Date(row.created_at) : new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    })
  );

  const archiveRoutes: MetadataRoute.Sitemap = (archivesRes.data ?? []).map(
    (row) => ({
      url: `${baseUrl}/archive/${row.archive_id}`,
      lastModified: row.date ? new Date(row.date) : new Date(),
      changeFrequency: "monthly",
      priority: 0.75,
    })
  );

  return [
    ...staticRoutes,
    ...lectureRoutes,
    ...reviewRoutes,
    ...archiveRoutes,
  ];
}
