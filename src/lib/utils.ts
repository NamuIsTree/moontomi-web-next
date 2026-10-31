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
