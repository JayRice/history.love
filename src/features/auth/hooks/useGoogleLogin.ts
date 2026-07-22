// src/hooks/useGoogleLogin.ts
import { useCallback, useState } from "react";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import Constants from "expo-constants";
import { GoogleAuthProvider, signInWithCredential, UserCredential } from "firebase/auth";
import { auth } from "@/src/shared/config/firebase";
import type { AuthRequest } from "expo-auth-session";

WebBrowser.maybeCompleteAuthSession();

type UseGoogleLogin = {
  // Returns the app's success envelope, not the raw Firebase UserCredential.
  signInWithGoogle: () => Promise<{ success: boolean; user: UserCredential["user"] } | null>;
  googleLoading: boolean;
  googleError: string | null;
  // Expose these in case you want to inspect/debug
  googleRequest: AuthRequest | null;
};

export function useGoogleLogin(): UseGoogleLogin {
  const extras = Constants.expoConfig?.extra ?? {};

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: extras.webClientId ?? "",
    androidClientId: extras.androidClientId ?? "",
    iosClientId: extras.iosClientId ?? "",
    scopes: ["openid", "email", "profile"],
    // This helps avoid auto-picking the last account
    selectAccount: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signInWithGoogle = useCallback(async () => {
    setError(null);
    setLoading(true);

    try {
      const res = await promptAsync();
      if (res?.type !== "success") {
        setLoading(false);
        return null; // cancelled or error
      }

      const idToken = (res.params as any)?.id_token as string | undefined;
      if (!idToken) {
        setError("No id_token returned by Google");
        setLoading(false);
        return null;
      }

      const cred = GoogleAuthProvider.credential(idToken);
      const userCred = await signInWithCredential(auth, cred);
      setLoading(false);
      return { success: true, user: userCred.user };
    } catch (e: any) {
      setError(e?.message ?? "Google login failed");
      setLoading(false);
      return null;
    }
  }, [promptAsync]);

  return { signInWithGoogle, googleLoading: loading, googleError: error, googleRequest: request };
}