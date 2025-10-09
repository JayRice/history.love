import { create } from "zustand";

import Relationship from '@/src/types/Relationship';
import Memory from '@/src/types/Memory';

type Store = {
  relationship: Relationship | null;
  setRelationship: (relationship: Relationship) => void;

  memories: Memory[] | null;
  setMemories: (memories: Memory[]) => void;
};

const dataInitial: Pick<Store, "relationship" | "memories"> = {
  relationship: null,
  memories: null,
};
export const useRelationshipStore = create<Store>()((set, get) => ({
  ...dataInitial,

  setRelationship: (relationship: Relationship) => set({relationship}),
  setMemories: (memories: Memory[]) => set({memories}),

  reset: () => set(() => ({ ...dataInitial })),
}));

