"use client";

import { use } from "react";
import { ArchiveBrowser } from "@/components/archive/ArchiveBrowser";

export default function ArchiveDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const archiveId = Number(id);

  return <ArchiveBrowser initialArchiveId={archiveId} />;
}
