import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

import User from "../types/User";

type GeneralStore = {
  didShowSubscription: boolean;
  setDidShowSubscription: (didShowSubscription: boolean) => void;
};

export const useGeneralStore = create<GeneralStore>()(
  persist(
    (set) => ({
      didShowSubscription: false,
      setDidShowSubscription: (didShowSubscription: boolean) => set({didShowSubscription})
    }),
    {
      name: "general-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);