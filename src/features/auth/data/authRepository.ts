import { supabase } from "@/src/shared/lib/supabase";
import type { AuthResult, AuthUser } from "../domain/AuthSession";

function toAuthUser(u: { id: string; email?: string | null } | null | undefined): AuthUser | null {
  return u ? { uid: u.id, email: u.email ?? null } : null;
}

export async function signUpWithEmail(email: string, password: string): Promise<AuthResult> {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return { success: false, error: error.message };
  const user = toAuthUser(data.user);
  if (!user) return { success: false, error: "Signup did not return a user." };
  return { success: true, user };
}

export async function signInWithEmail(email: string, password: string): Promise<AuthResult> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { success: false, error: error.message };
  const user = toAuthUser(data.user);
  if (!user) return { success: false, error: "Login did not return a user." };
  return { success: true, user };
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}

export async function getSessionUser(): Promise<AuthUser | null> {
  const { data } = await supabase.auth.getSession();
  return toAuthUser(data.session?.user);
}

export function onAuthUserChange(cb: (user: AuthUser | null) => void): () => void {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    cb(toAuthUser(session?.user));
  });
  return () => data.subscription.unsubscribe();
}

export async function sendPasswordReset(email: string): Promise<AuthResult | { success: true; user: null }> {
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) return { success: false, error: error.message };
  return { success: true, user: null };
}
