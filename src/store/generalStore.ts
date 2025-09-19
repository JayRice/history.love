import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

import User from "../types/User";

type GeneralStore = {
  didShowSubscription: boolean;
  setDidShowSubscription: (didShowSubscription: boolean) => void;
  didShowPairScreen: boolean;
  setDidShowPairScreen: (didShowPairScreen: boolean) => void;
};

const initialState : GeneralStore =  {
  didShowSubscription: false,
  didShowPairScreen: false,
  setDidShowSubscription: () => {},
  setDidShowPairScreen: () => {},

}

export const useGeneralStore = create<GeneralStore>()(
    (set) => ({
      ...initialState,

      setDidShowSubscription: (didShowSubscription: boolean) => set({didShowSubscription}),

      setDidShowPairScreen: (didShowPairScreen: boolean) => set({didShowPairScreen}),
    }),

);
// {
//   name: "general-storage",
//     storage: createJSONStorage(() => AsyncStorage),
// }