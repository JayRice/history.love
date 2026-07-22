import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/src/shared/config/firebase";

import { FirebaseError } from 'firebase/app';

type LoginResponse =
  | { success: true; user: any }
  | { success: false; error: string };

export default async function loginWithEmail(
  email: string,
  password: string
): Promise<LoginResponse> {
  try {
    const userCred = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCred.user };
  } catch (err: unknown) {
    let message = "Something went wrong. Please try again later.";

    if (err instanceof FirebaseError) {
      switch (err.code) {
        case "auth/invalid-credential":
        case "auth/invalid-credentials":
        case "auth/invalid-login-credentials":
          message = "Invalid email or password.";
          break;
        case "auth/user-not-found":
          message = "No account associated with that email.";
          break;
        case "auth/wrong-password":
          message = "Incorrect password.";
          break;
        case "auth/invalid-email":
          message = "Please enter a valid email address.";
          break;
        case "auth/user-disabled":
          message = "This account has been disabled.";
          break;
        case "auth/network-request-failed":
          message = "Network issue — please check your connection.";
          break;
        default:
          message = err.message || message;
      }
    }

    return { success: false, error: message };
  }
}