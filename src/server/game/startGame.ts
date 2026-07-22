import { GameData } from '@/src/shared/types/GameData';
import { GamePreferences } from '@/src/shared/types/GamePreferences';
import fetchServer from '@/src/server/fetchServer';

export async function startGame(gameData: GameData, preferences: GamePreferences) {

  return await fetchServer("/games/start_game", { gameData, preferences } , "POST");
}