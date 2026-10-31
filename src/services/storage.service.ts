import { createClient } from "@/lib/supabase/client";
import { getImageUrl } from "@/lib/utils";

/**
 * Converts an uploaded image File to WebP (via browser Canvas) and uploads to Supabase Storage 'images' bucket.
 * Returns the stored object path/filename.
 */
export async function uploadImageToStorage(file: File): Promise<string> {
  const supabase = createClient();
  const webpBlob = await convertFileToWebp(file);
  const fileName = `${crypto.randomUUID().replace(/-/g, "")}.webp`;

  const { error } = await supabase.storage
    .from("images")
    .upload(fileName, webpBlob, {
      contentType: "image/webp",
      upsert: false,
    });

  if (error) {
    throw new Error(`이미지 업로드에 실패했습니다: ${error.message}`);
  }

  return getImageUrl(fileName);
}

async function convertFileToWebp(file: File): Promise<Blob> {
  if (typeof window === "undefined") {
    return file;
  }

  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        resolve(file);
        return;
      }

      ctx.drawImage(img, 0, 0);
      canvas.toBlob(
        (blob) => {
          resolve(blob || file);
        },
        "image/webp",
        0.88
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file);
    };

    img.src = objectUrl;
  });
}
