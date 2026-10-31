import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ybkxwjmrgrnlyogykqxm.supabase.co",
      },
      {
        protocol: "https",
        hostname: "server.moontomi.com",
      },
      {
        protocol: "https",
        hostname: "moontomi.netlify.app",
      },
    ],
  },
};

export default nextConfig;
