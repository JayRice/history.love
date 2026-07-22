// Transitional: game creation on Supabase. The legacy backend built the
// Would You Rather structure server-side; that assembly now happens here
// (question selection from the local bank) and the start_game RPC stores it.
// REQUIRES RUNTIME VERIFICATION: round shape mirrors what the client
// screens read, but the legacy backend's exact assembly was never visible.
import { GameData } from '@/src/shared/types/GameData';
import { GamePreferences } from '@/src/shared/types/GamePreferences';
import { supabase } from '@/src/shared/lib/supabase';
import { wouldYouRatherData } from '../../domain/wouldYouRatherData';

const WYR_ROUNDS = 10;

export async function startGame(gameData: GameData, preferences: GamePreferences) {
  let doc: Record<string, unknown>;

  if (gameData.type === "would-you-rather") {
    const modes = preferences.gameModes.length ? preferences.gameModes : ["casual"];
    const pool = modes.flatMap(
      (m) => (wouldYouRatherData as Record<string, { id: string }[]>)[m] ?? []
    );
    const questionIds = pool
      .map((q) => q.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, WYR_ROUNDS);
    if (questionIds.length === 0) {
      return { success: false, error: "No questions available for the selected modes." };
    }
    doc = {
      type: gameData.type,
      preferences,
      game: {
        questionIds,
        progress: {
          rounds: [{ index: 0, questionId: questionIds[0], choices: {} }],
        },
      },
    };
  } else {
    doc = { type: gameData.type, preferences, game: {} };
  }

  const { error } = await supabase.rpc('start_game', { p_doc: doc as never });
  if (error) return { success: false, error: error.message };
  return { success: true };
}
