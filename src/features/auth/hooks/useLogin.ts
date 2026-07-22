import { useState } from 'react';
import loginWithApple from '../data/legacy/loginWithApple';
import loginWithEmail from '../data/legacy/loginWithEmail';
import signupWithEmail from '../data/legacy/signupWithEmail';
import { registerPushToken } from '@/src/features/notifications/domain/pushTokens';
import { logger } from '@/src/shared/lib/logger';

type LoginKind = "google" | "email-login" | "email-signup" | "apple";
type LoginResponse =
  | { success: true; user: { uid: string; email: string | null } }
  | { success: false; error: string };

type UseLogin = {
  loading: boolean;
  error: string | null;
  login: (type: LoginKind, email?: string, password?: string) => Promise<LoginResponse>;
};

export default function useLogin(): UseLogin {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function login(type: LoginKind, email?: string, password?: string): Promise<LoginResponse> {
    let response: LoginResponse = { success: false, error: "Unsupported login type." };

    setLoading(true);
    if (type === "google") {
      // Google OAuth returns with Supabase provider configuration (see
      // docs/migration-status.md, OAuth section).
      response = { success: false, error: "Google sign-in is not available during the migration." };
    } else if (type === "apple") {
      response = await loginWithApple();
    } else if (email && password) {
      if (type === "email-login") {
        response = await loginWithEmail(email, password);
      } else if (type === "email-signup") {
        response = await signupWithEmail(email, password);
      }
    }

    if (response.success) {
      try {
        await registerPushToken(response.user.uid);
      } catch {
        logger.warn("push token registration failed");
      }
    } else {
      setError(response.error);
    }

    setLoading(false);
    return response;
  }

  return { login, loading, error };
}
