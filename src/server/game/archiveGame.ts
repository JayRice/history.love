import fetchServer from '@/src/server/fetchServer';

export async function archiveGame() {

  return await fetchServer("/games/archive_game", {  } , "POST");
}