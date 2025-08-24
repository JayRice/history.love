import { createUserWithEmailAndPassword } from "firebase/auth";

import { auth } from "@/src/config/firebase";
import { useToast } from '@/src/contexts/ToastProvider';

export default async function signupWithEmail(email: string, password: string) {
  const toast = useToast();
  try {
    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    return userCred.user;
  } catch (error: any) {
    toast("Somthing went wrong, try again later.");
    throw error; // other errors bubble up
  }
}
