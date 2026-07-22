import { create } from "zustand";

import Relationship from '@/src/shared/types/Relationship';
import Memory from '@/src/shared/types/Memory';
import { CalendarEvent } from "@/src/shared/types/Calendar"
import { Game } from '@/src/shared/types/Game';

type Store = {
  relationship: Relationship | null;
  setRelationship: (relationship: Relationship) => void;

  memories: Memory[] | null;
  setMemories: (memories: Memory[]) => void;

  calendarEvents: CalendarEvent[] | null;
  setCalendarEvents: (calendarEvents: CalendarEvent[]) => void;

  currentGame: Game | null;
  setCurrentGame: (game: Game | null) => void;
};

const dataInitial: Pick<Store, "relationship" | "memories" | "calendarEvents" | "currentGame"> = {
  relationship: null,
  memories: null,
  calendarEvents: null,
  currentGame: null,

};
export const useRelationshipStore = create<Store>()((set, get) => ({
  ...dataInitial,

  setRelationship: (relationship: Relationship) => set({relationship}),
  setMemories: (memories: Memory[]) => set({memories}),
  setCalendarEvents: (calendarEvents: CalendarEvent[]) => set({calendarEvents}),
  setCurrentGame: (currentGame: Game | null) => set({currentGame}),

  reset: () => set(() => ({ ...dataInitial })),
}));

