import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/src/shared/config/firebase";
import { useUserStore } from '@/src/store/userStore';

type AuthContextType = {
  authUser: User | null;
  authUserLoading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  authUser: null,
  authUserLoading: true,
});



export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      const { reset } = useUserStore.getState()

      setAuthUser(user);
      setLoading(false);

    });
    return unsub;
  }, []);

  return (
    <AuthContext.Provider value={{ authUser, authUserLoading: loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);