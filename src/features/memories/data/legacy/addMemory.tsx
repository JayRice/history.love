// Transitional: memories on Supabase. Photos upload into the private
// relationship-media bucket ({relationshipId}/{uploaderId}/{uuid}.jpg, which
// the storage RLS requires); the memory document keeps its legacy shape in
// app_memories.doc with photo.name carrying the bucket-relative path.
import Memory from "@/src/shared/types/Memory";
import { supabase } from "@/src/shared/lib/supabase";
import {
  getActiveRelationshipId,
  newId,
  uploadLocalFile,
} from "@/src/shared/lib/legacy/supabaseAppHelpers";

type Envelope = { success: boolean; error?: string };

export async function addMemory(memoryData: Omit<Memory, "id" | "">): Promise<Envelope> {
  const { data: auth } = await supabase.auth.getSession();
  const uid = auth.session?.user.id;
  const relId = await getActiveRelationshipId();
  if (!uid || !relId) return { success: false, error: "No active relationship." };

  const photos = [];
  for (const photo of memoryData.photos ?? []) {
    if (photo.name) {
      photos.push(photo);
      continue;
    }
    if (!photo.uri) continue;
    const path = `${relId}/${uid}/${newId()}.jpg`;
    if (await uploadLocalFile("relationship-media", path, photo.uri, "image/jpeg")) {
      photos.push({ ...photo, uri: undefined, name: path });
    }
  }

  const id = newId();
  const doc = { ...memoryData, id, photos } as unknown as Record<string, unknown>;

  const { error } = await supabase.from("app_memories").insert({
    id,
    relationship_id: relId,
    created_by: uid,
    doc: doc as never,
  });

  if (error) return { success: false, error: error.message };
  return { success: true };
}
