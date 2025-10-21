import { create } from "zustand";

import Relationship from '@/src/types/Relationship';
import Memory from '@/src/types/Memory';
import { CalendarEvent } from "@/src/types/Calendar"

type Store = {
  relationship: Relationship | null;
  setRelationship: (relationship: Relationship) => void;

  memories: Memory[] | null;
  setMemories: (memories: Memory[]) => void;

  calendarEvents: CalendarEvent[] | null;
  setCalendarEvents: (calendarEvents: CalendarEvent[]) => void;
};

const dataInitial: Pick<Store, "relationship" | "memories" | "calendarEvents"> = {
  relationship: null,
  memories: null,
  calendarEvents: null,

};
export const useRelationshipStore = create<Store>()((set, get) => ({
  ...dataInitial,

  setRelationship: (relationship: Relationship) => set({relationship}),
  setMemories: (memories: Memory[]) => set({memories}),
  setCalendarEvents: (calendarEvents: CalendarEvent[]) => set({calendarEvents}),

  reset: () => set(() => ({ ...dataInitial })),
}));

