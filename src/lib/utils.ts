import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getImageUrl(imageId: string | null | undefined): string {
  if (!imageId) return "/icons/upload-preview.png";
  if (imageId.startsWith("http://") || imageId.startsWith("https://")) {
    return imageId;
  }
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${supabaseUrl}/storage/v1/object/public/images/${imageId}`;
}

/**
 * Counts editorial prose characters from HTML content.
 * - Ignores non-text media elements (images, videos, iframes, etc.).
 * - Treats every emoji (including ZWJ/compound emojis) as 1 character via `Intl.Segmenter`.
 */
export function countEditorialCharacters(html: string): {
  withSpaces: number;
  withoutSpaces: number;
} {
  if (!html) return { withSpaces: 0, withoutSpaces: 0 };

  let rawText = "";
  if (typeof DOMParser !== "undefined") {
    const doc = new DOMParser().parseFromString(html, "text/html");
    doc.querySelectorAll(
      "img, video, audio, iframe, svg, script, style, picture, source, object, embed"
    ).forEach((el) => el.remove());
    rawText = doc.body.textContent ?? "";
  } else {
    rawText = html
      .replace(/<(script|style|svg)[^>]*>[\s\S]*?<\/\1>/gi, "")
      .replace(/<[^>]+>/g, "");
  }

  const normalized = rawText
    .replace(/[\r\n\t\u200B\uFEFF]+/g, "")
    .replace(/\u00A0/g, " ")
    .trim();

  if (!normalized) return { withSpaces: 0, withoutSpaces: 0 };

  const segments =
    typeof Intl !== "undefined" && "Segmenter" in Intl
      ? Array.from(
          new Intl.Segmenter("ko", { granularity: "grapheme" }).segment(
            normalized
          ),
          (s) => s.segment
        )
      : Array.from(normalized);

  const withSpaces = segments.length;
  const withoutSpaces = segments.filter((seg) => !/^\s+$/.test(seg)).length;

  return { withSpaces, withoutSpaces };
}
