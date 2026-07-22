import fetchServer from '@/src/server/fetchServer';

export async function endGame() {

  return await fetchServer("/games/end_game", {  } , "POST");
}