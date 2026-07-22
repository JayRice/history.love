import { supabase } from '@/src/shared/lib/supabase';
import { Game } from '@/src/shared/types/Game';

// Choice merging happens server-side (wyr_choose) so a client can never
// forge the partner's answer or advance rounds unilaterally.
export async function updateGame(game: Game, edit: { choice?: 1 | 2 }) {
  if (edit?.choice !== 1 && edit?.choice !== 2) {
    return { success: false, error: "Unsupported game edit." };
  }
  const { error } = await supabase.rpc('wyr_choose', {
    p_game_id: (game as unknown as { id: string }).id,
    p_choice: edit.choice,
  });
  if (error) return { success: false, error: error.message };
  return { success: true };
}
