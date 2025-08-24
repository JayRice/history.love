import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

import User from "../types/User";

type UserStore = {
  user: User | null;
  setUser: (u: User | null) => void;
  setUserProperty: <K extends keyof User>(key: K, value: User[K]) => void;
};

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      setUser: (u) => set({ user: u }),
      setUserProperty: (key, value) =>
        set((state) => {
          if (!state.user) return state; // do nothing if user is null
          return { user: { ...state.user, [key]: value } };
        }),
    }),
    {
      name: "user-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);