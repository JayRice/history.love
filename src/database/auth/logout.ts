
import {

  signOut as firebaseSignOut,


} from 'firebase/auth'
import { auth } from '@/src/config/firebase';
import { removeFcmToken } from '@/src/database/messaging/handleFcmMessaging';

export default async function logout(){

  //await removeFcmToken()
  await firebaseSignOut(auth)
}
