// Transitional module: Supabase implementation behind the legacy call
// signature. Folds into authRepository when the auth screens are rebuilt.
import { signUpWithEmail } from "../authRepository";

type SignupResponse =
  | { success: true; user: { uid: string; email: string | null } }
  | { success: false; error: string };

export default async function signupWithEmail(
  email: string,
  password: string
): Promise<SignupResponse> {
  return signUpWithEmail(email, password);
}
