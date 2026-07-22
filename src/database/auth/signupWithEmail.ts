import { createUserWithEmailAndPassword } from "firebase/auth";

import { auth } from "@/src/config/firebase";
import { FirebaseError } from "firebase/app";


type SignupResponse =
  | { success: true; user: any }
  | { success: false; error: string };

export default async function signupWithEmail(
  email: string,
  password: string
): Promise<SignupResponse> {
  try {
    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCred.user };
  } catch (err: unknown) {
    let message = "Something went wrong, please try again later.";

    if (err instanceof FirebaseError) {
      switch (err.code) {
        case "auth/email-already-in-use":
          message = "That email is already registered.";
          break;
        case "auth/invalid-email":
          message = "Please enter a valid email address.";
          break;
        case "auth/weak-password":
          message = "Password must be at least 6 characters.";
          break;
        case "auth/operation-not-allowed":
          message = "Email/password accounts are not enabled.";
          break;
        case "auth/network-request-failed":
          message = "Network error — please check your connection.";
          break;
        default:
          message = err.message || message;
      }
    }

    return { success: false, error: message };
  }
}