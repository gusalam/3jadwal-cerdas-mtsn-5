import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "crypto";

/**
 * Upload a file to Supabase Storage and return the public URL.
 */
export async function uploadMedia(file: File, folder: string = "uploads"): Promise<string> {
  const ext = file.name.split(".").pop() ?? "jpg";
  const fileName = `${folder}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from("media").upload(fileName, file, {
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
