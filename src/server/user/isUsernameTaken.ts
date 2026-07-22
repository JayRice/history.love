
import Constants from "expo-constants";
import { getAuthUser } from '@/src/database/auth/getAuthUser';

import { Alert } from "react-native";


export default async function isUsernameTaken(username: string){

  if (!Constants.expoConfig?.extra) {
    throw Error('Expo config constants required - Cannot find constants in app.config');
  }
  const authUser = getAuthUser();
  if(!authUser) throw new Error("Not signed in");

  const token = await authUser.getIdToken();

  try{
    const res = await fetch(`${Constants.expoConfig?.extra.api_url}/api/users/is_username_taken`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username: username,
      })

    });
    const json = await res.json();


    if (json.success){
      return json.exists;
    }else if (json.error) {
      Alert.alert("Error", json.error);
    }
  }catch(e){
    Alert.alert("Error", "Something went wrong, try again later.");
  }
  return null;

}