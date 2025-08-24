import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/src/config/firebase";
import { useToast } from '@/src/contexts/ToastProvider';

export default async function loginWithEmail(email: string, password: string) {
  const toast = useToast();
  try {
    const userCred = await signInWithEmailAndPassword(auth, email, password);
    return userCred.user;
  } catch (error: any) {
    if (error.code === "auth/user-not-found") {
      return toast("User not found");
    }
    toast("Somthing went wrong, try again later.");
    throw error; // other errors bubble up
  }
}