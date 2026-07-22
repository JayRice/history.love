import { supabase } from '@/src/shared/lib/supabase';

export async function endGame() {
  const { error } = await supabase.rpc('end_active_game');
  if (error) return { success: false, error: error.message };
  return { success: true };
}
