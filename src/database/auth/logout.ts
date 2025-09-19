
import {

  signOut as firebaseSignOut,


} from 'firebase/auth'
import { auth } from '@/src/config/firebase';

export default async function logout(){
  await firebaseSignOut(auth)
}
