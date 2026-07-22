import fetchServer from '@/src/server/fetchServer';
import { Game } from '@/src/shared/types/Game';

export async function updateGame(game: Game, edit: any) {

  return await fetchServer("/games/update_game", { game, edit } , "POST");
}