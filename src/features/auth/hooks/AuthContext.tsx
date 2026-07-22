import { createContext, useContext, useEffect, useState } from "react";
import type { AuthUser } from "../domain/AuthSession";
import { onAuthUserChange } from "../data/authRepository";

// Supabase-backed session context. Exposes the same { authUser,
// authUserLoading } contract (with authUser.uid) the screens already use.
interface AuthContextValue {
  authUser: AuthUser | null;
  authUserLoading: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  authUser: null,
  authUserLoading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [authUserLoading, setLoading] = useState(true);

  useEffect(() => {
    // onAuthStateChange emits INITIAL_SESSION on subscribe, which covers
    // session restoration from AsyncStorage.
    const unsubscribe = onAuthUserChange((user) => {
      setAuthUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ authUser, authUserLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
