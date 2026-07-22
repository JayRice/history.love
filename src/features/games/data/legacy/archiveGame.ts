import { supabase } from '@/src/shared/lib/supabase';

export async function archiveGame() {
  const { error } = await supabase.rpc('archive_active_game');
  if (error) return { success: false, error: error.message };
  return { success: true };
}
