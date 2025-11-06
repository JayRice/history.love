import fetchServer from '@/src/server/fetchServer';
import Toast from 'react-native-toast-message';
import { isValidMatchCode } from '@/src/logic/isValidMatchCode';

export default async function unpairUsers() : Promise <any | null>{


  const response = await fetchServer("/matches/unpair_users", {}, "POST");

  return response;

}