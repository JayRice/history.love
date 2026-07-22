import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

import User from "../types/User";


type Store = {
  isUserInitialized: boolean;
  user: User | null;
  setIsUserInitialized: (b: boolean) => void;
  setUser: (u: User | null) => void;
  // Dynamic property setter; RegisterScreen writes draft fields ("name",
  // "profileImage") that are not part of the User type. Typed to match the
  // implementation, which spreads `[key]: value` and casts.
  setUserProperty: (key: string, value: unknown) => void;
  reset: () => void;
};

const dataInitial: Pick<Store, "isUserInitialized" | "user"> = {
  isUserInitialized: false,
  user: null,
};
export const useUserStore = create<Store>()((set, get) => ({
  ...dataInitial,

  setIsUserInitialized: (isUserInitialized) => set({ isUserInitialized }),

  setUser: (u) => {
    const prev = get().user;
    // Switching accounts or logging out → replace whole store with fresh state + new user
    if (!prev || !u || prev.id !== u.id) {
      set({ ...dataInitial, user: u });
    } else {
      // Same account → regular update
      set({ user: u });
    }
  },

  setUserProperty: (key, value) => {
    const u = get().user;
    if (!u) return;
    set({ user: { ...u, [key]: value } as User });
  },

  reset: () => set(() => ({ ...dataInitial })),
}));

