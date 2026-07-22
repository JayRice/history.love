// Transitional helpers shared by the Supabase data modules. Die when the
// per-feature repositories + query hooks land (Phases 2-6 of the plan).
import * as Crypto from "expo-crypto";
import * as FileSystem from "expo-file-system/legacy";
import { supabase } from "@/src/shared/lib/supabase";
import { logger } from "@/src/shared/lib/logger";

/** The caller's active relationship id, or null. */
export async function getActiveRelationshipId(): Promise<string | null> {
  const { data: auth } = await supabase.auth.getSession();
  const uid = auth.session?.user.id;
  if (!uid) return null;
  const { data, error } = await supabase
    .from("relationship_members")
    .select("relationship_id, member_status")
    .eq("profile_id", uid)
    .eq("member_status", "active")
    .limit(1);
  if (error) {
    logger.warn("membership lookup failed:", error.message);
    return null;
  }
  return data?.[0]?.relationship_id ?? null;
}

/** Upload a local file (file:// uri) into a private bucket. */
export async function uploadLocalFile(
  bucket: string,
  path: string,
  uri: string,
  contentType: string
): Promise<boolean> {
  try {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    const { error } = await supabase.storage
      .from(bucket)
      .upload(path, bytes.buffer as ArrayBuffer, { contentType, upsert: true });
    if (error) {
      logger.warn("upload failed:", error.message);
      return false;
    }
    return true;
  } catch (e) {
    logger.warn("upload failed");
    return false;
  }
}

/** Short-lived signed URLs for private objects; maps path -> url. */
export async function getSignedUrls(
  bucket: string,
  paths: string[]
): Promise<Record<string, string>> {
  if (paths.length === 0) return {};
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrls(paths, 60 * 60);
  if (error) {
    logger.warn("signed urls failed:", error.message);
    return {};
  }
  const out: Record<string, string> = {};
  for (const item of data ?? []) {
    if (item.signedUrl && item.path) out[item.path] = item.signedUrl;
  }
  return out;
}

export function newId(): string {
  return Crypto.randomUUID();
}
