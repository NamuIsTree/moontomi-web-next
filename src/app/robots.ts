import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/login",
          "/comment/create/",
          "/comment/edit/",
          "/review/create",
        ],
      },
    ],
    sitemap: "https://moontomi.com/sitemap.xml",
    host: "https://moontomi.com",
  };
}
