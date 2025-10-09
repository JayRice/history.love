// src/stores/locationModalStore.ts
import { create } from 'zustand';
import { nanoid } from 'nanoid/non-secure'; // or your own id util
import { GeoLocation } from '@/src/types/GeoLocation';
import { router } from 'expo-router';

type Resolver = (v: GeoLocation | null) => void;

type State = {
  pending?: { id: string; resolve: Resolver };
  open: () => Promise<GeoLocation | null>;
  resolve: (value: GeoLocation | null) => void;
};

export const useLocationModalStore = create<State>((set, get) => ({
  pending: undefined,
  open: () =>

    new Promise<GeoLocation | null>((resolve) => {
      router.push("/(modals)/location_search")
      set({ pending: { id: nanoid(), resolve } });
    }),
  resolve: (value) => {
    const p = get().pending;

    if (p) {
      p.resolve(value);
      router.back()
      set({ pending: undefined });

    }
  },
}));