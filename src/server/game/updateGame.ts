import { GameData } from '@/src/types/GameData';
import { GamePreferences } from '@/src/types/GamePreferences';
import fetchServer from '@/src/server/fetchServer';
import { Game } from '@/src/types/Game';

export async function updateGame(game: Game, edit: any) {

  return await fetchServer("/games/update_game", { game, edit } , "POST");
}