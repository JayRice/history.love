import { create } from "zustand";

import Relationship from '@/src/types/Relationship';
type Store = {
  relationship: Relationship | null;
  setRelationship: (relationship: Relationship) => void;
};

const dataInitial: Pick<Store, "relationship"> = {
  relationship: null,
};
export const useRelationshipStore = create<Store>()((set, get) => ({
  ...dataInitial,

  setRelationship: (relationship: Relationship) => set({relationship}),

  reset: () => set(() => ({ ...dataInitial })),
}));

