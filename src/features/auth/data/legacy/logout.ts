
import {

  signOut as firebaseSignOut,


} from 'firebase/auth'
import { auth } from '@/src/shared/config/firebase';

export default async function logout(){

  //await removeFcmToken()
  await firebaseSignOut(auth)
}
