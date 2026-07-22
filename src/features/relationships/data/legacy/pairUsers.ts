import fetchServer from '@/src/server/fetchServer';
import Toast from 'react-native-toast-message';
import { isValidMatchCode } from '../../domain/isValidMatchCode';

export default async function pairUsers(matchCode: string) : Promise <any | null>{


  if (!isValidMatchCode(matchCode)){
    Toast.show({
      type: "error",
      text1: "Error",
      text2: `Invalid Match Code: ${matchCode}`,
    });
    return null;
  }

  const response = await fetchServer("/matches/pair_users", {matchCode: matchCode}, "POST");

  return response;

}