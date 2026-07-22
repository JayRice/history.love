import { CalendarEvent } from "@/src/shared/types/Calendar";
import { supabase } from "@/src/shared/lib/supabase";
import { getActiveRelationshipId, newId } from "@/src/shared/lib/legacy/supabaseAppHelpers";

export async function addCalenderEvent(calendarEvent: Omit<CalendarEvent, "id">) {
  const { data: auth } = await supabase.auth.getSession();
  const uid = auth.session?.user.id;
  const relId = await getActiveRelationshipId();
  if (!uid || !relId) return { success: false, error: "No active relationship." };

  const id = newId();
  const doc = { ...calendarEvent, id } as unknown as Record<string, unknown>;

  const { error } = await supabase.from("app_calendar_events").insert({
    id,
    relationship_id: relId,
    created_by: uid,
    doc: doc as never,
  });

  if (error) return { success: false, error: error.message };
  return { success: true };
}
