// src/stores/locationModalStore.ts
import { create } from 'zustand';
import { nanoid } from 'nanoid/non-secure'; // or your own id util
import { router } from 'expo-router';


type Resolver = (v: null) => void;

type State = {
  pending?: { id: string; resolve: Resolver };
  open: () => Promise<null>;
  resolve: () => void;
};

export const useStoryModeStore = create<State>((set, get) => ({
  pending: undefined,
  open: () =>
    new Promise<null>((resolve) => {
      router.push("/(modals)/story_mode")
      set({ pending: { id: nanoid(), resolve } });
    }),
  resolve: () => {
    const p = get().pending;

    if (p) {
      router.back()
      set({ pending: undefined });
    }
  },
}));