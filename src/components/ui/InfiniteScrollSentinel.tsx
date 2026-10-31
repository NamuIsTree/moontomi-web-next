"use client";

import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";

interface InfiniteScrollSentinelProps {
  onIntersect: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export function InfiniteScrollSentinel({
  onIntersect,
  disabled = false,
  loading = false,
}: InfiniteScrollSentinelProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (disabled || loading) return;
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          onIntersect();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [onIntersect, disabled, loading]);

  if (disabled) return null;

  return (
    <div ref={ref} className="py-8 flex justify-center items-center">
      {loading && (
        <Loader2 className="w-6 h-6 animate-spin text-[#ff8080]" />
      )}
    </div>
  );
}
