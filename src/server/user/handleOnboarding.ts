import  User  from '@/src/types/User';

import Constants from "expo-constants";
import { getAuthUser } from '@/src/database/auth/getAuthUser';

import { Alert } from "react-native";


export default async function handleOnboarding(user: User){

  if (!Constants.expoConfig?.extra) {
    throw Error('Expo config constants required - Cannot find constants in app.config');
  }

  const formData = new FormData();


  if (!user?.profile?.profileImage) {return}

  formData.append("profile_picture", {
    uri: user?.profile?.profileImage?.local_uri,
    type: "image/png",
    name: "profile.png",
  } as any);

  formData.append("user", JSON.stringify(user))


  const authUser = getAuthUser();
  if(!authUser) throw new Error("Not signed in");

  const token = await authUser.getIdToken();

  try {
    const res = await fetch(`${Constants.expoConfig?.extra.api_url}/api/users/handle_onboarding`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData

    });
    const json = await res.json();

    return json;
  }catch (e){
    Alert.alert("Error", "Something went wrong, try again later.");
    console.error(e);
  }

}