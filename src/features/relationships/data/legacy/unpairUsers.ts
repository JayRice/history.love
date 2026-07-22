import fetchServer from '@/src/server/fetchServer';

export default async function unpairUsers() : Promise <any | null>{


  const response = await fetchServer("/matches/unpair_users", {}, "POST");

  return response;

}