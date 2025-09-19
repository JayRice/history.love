import fetchServer from '@/src/server/fetchServer';
import Toast from 'react-native-toast-message';
import { isValidMatchCode } from '@/src/logic/isValidMatchCode';


export default async function pairUsers(matchCode: string) {


  if (!isValidMatchCode(matchCode)){
    Toast.show({
      type: "error",
      text1: "Error",
      text2: `Invalid Match Code: ${matchCode}`,
    });
    return null;
  }

  const response = await fetchServer("/matches/pair_users", {matchCode: matchCode}, "POST");

  if (response && response.success){
    return response.relationship;
  }
  return null;

}