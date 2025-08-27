import  User  from '@/src/types/User';

import Constants from "expo-constants";
import { getAuthUser } from '@/src/database/auth/getAuthUser';



export default async function handleOnboarding(user: User){

  if (!Constants.expoConfig?.extra) {
    throw Error('Expo config constants required - Cannot find constants in app.config');
  }
  const authUser = getAuthUser();
  if(!authUser) throw new Error("Not signed in");

  const token = await authUser.getIdToken();



  const res = await fetch(`${Constants.expoConfig?.extra.api_url}/api/handle_onboarding`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      user: user,
    })

  });
  const json = await res.json();

  return json;
}