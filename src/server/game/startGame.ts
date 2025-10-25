import { GameData } from '@/src/types/GameData';
import { GamePreferences } from '@/src/types/GamePreferences';
import fetchServer from '@/src/server/fetchServer';

export async function startGame(gameData: GameData, preferences: GamePreferences) {

  return await fetchServer("/games/start_game", { gameData, preferences } , "POST");
}