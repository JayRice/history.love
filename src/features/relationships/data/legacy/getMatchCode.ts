

import fetchServer from '@/src/server/fetchServer';


export default async function getMatchCode(){
  const response = await fetchServer("/matches/get_match_code");

  if (response && response.success){
    return response.matchCode;
  }
  return null;
}