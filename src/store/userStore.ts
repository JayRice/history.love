import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

import User from "../types/User";


type Store = {
  isUserInitialized: boolean;
  user: User | null;
  setIsUserInitialized: (b: boolean) => void;
  setUser: (u: User | null) => void;
  setUserProperty: <K extends keyof User>(key: K, value: User[K]) => void;
  reset: () => void;
};

const initialState: Store = {
  isUserInitialized: false,
  user: null,
  setIsUserInitialized: () => {},
  setUser: () => {},
  setUserProperty: () => {},
  reset: () => {},
};

export const useUserStore = create<Store>()((set, get) => ({
  ...initialState,

  setIsUserInitialized: (isUserInitialized) => set({ isUserInitialized }),

  setUser: (u) => {
    const prev = get().user;
    // Switching accounts or logging out → replace whole store with fresh state + new user
    if (!prev || !u || prev.id !== u.id) {
      set({ ...initialState, user: u });
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

  reset: () => set(initialState, true), // "true" = replace, not merge
}));

