// Transitional: memory edit/delete on Supabase (see addMemory for the
// storage layout). Deleting removes the row and its media objects.
import Memory from "@/src/shared/types/Memory";
import { supabase } from "@/src/shared/lib/supabase";
import { logger } from "@/src/shared/lib/logger";
import {
  getActiveRelationshipId,
  newId,
  uploadLocalFile,
} from "@/src/shared/lib/legacy/supabaseAppHelpers";

type Envelope = { success: boolean; error?: string };

export async function editMemory(
  memoryData: Memory,
  shouldDelete: boolean,
  deletedPhotos: string[]
): Promise<Envelope> {
  const { data: auth } = await supabase.auth.getSession();
  const uid = auth.session?.user.id;
  const relId = await getActiveRelationshipId();
  if (!uid || !relId) return { success: false, error: "No active relationship." };

  if (shouldDelete) {
    const paths = (memoryData.photos ?? [])
      .map((p) => p.name)
      .filter((n): n is string => !!n);
    if (paths.length) {
      const { error } = await supabase.storage.from("relationship-media").remove(paths);
      if (error) logger.warn("media cleanup failed:", error.message);
    }
    const { error } = await supabase.from("app_memories").delete().eq("id", memoryData.id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  }

  if (deletedPhotos.length) {
    const { error } = await supabase.storage.from("relationship-media").remove(deletedPhotos);
    if (error) logger.warn("media cleanup failed:", error.message);
  }

  const photos = [];
  for (const photo of memoryData.photos ?? []) {
    if (photo.name) {
      if (!deletedPhotos.includes(photo.name)) photos.push(photo);
      continue;
    }
    if (!photo.uri) continue;
    const path = `${relId}/${uid}/${newId()}.jpg`;
    if (await uploadLocalFile("relationship-media", path, photo.uri, "image/jpeg")) {
      photos.push({ ...photo, uri: undefined, name: path });
    }
  }

  const doc = { ...memoryData, photos } as unknown as Record<string, unknown>;
  const { error } = await supabase
    .from("app_memories")
    .update({ doc: doc as never, updated_at: new Date().toISOString() })
    .eq("id", memoryData.id);

  if (error) return { success: false, error: error.message };
  return { success: true };
}
