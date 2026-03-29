import { supabase } from "@/integrations/supabase/client";
import imageCompression from "browser-image-compression";

/**
 * Compress an image file before upload.
 */
async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) return file;

  const options = {
    maxSizeMB: 0.2,
    maxWidthOrHeight: 1200,
    useWebWorker: true,
    fileType: "image/webp" as const,
  };

  try {
    const compressed = await imageCompression(file, options);
    return compressed;
  } catch {
    return file;
  }
}

/**
 * Upload a file to Supabase Storage and return the public URL.
 */
export async function uploadMedia(file: File, folder: string = "uploads"): Promise<string> {
  const compressed = await compressImage(file);
  const ext = "webp";
  const fileName = `${folder}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from("media").upload(fileName, compressed, {
    cacheControl: "3600",
    upsert: false,
  });

  if (error) throw error;

  const { data } = supabase.storage.from("media").getPublicUrl(fileName);
  return data.publicUrl;
}

/**
 * Delete a file from Supabase Storage by its public URL.
 */
export async function deleteMedia(publicUrl: string): Promise<void> {
  const match = publicUrl.match(/\/media\/(.+)$/);
  if (!match) return;
  const path = match[1];
  await supabase.storage.from("media").remove([path]);
}
