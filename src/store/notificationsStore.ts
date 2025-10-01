import { create } from "zustand";

import Relationship from '@/src/types/Relationship';
import { Notification } from '@/src/types/Notification';
type Store = {
  notifications: Notification[] | null;
  setNotifications: (notifications: Notification[]) => void;
};

const dataInitial: Pick<Store, "notifications"> = {
  notifications: null,
};
export const useNotificationsStore = create<Store>()((set, get) => ({
  ...dataInitial,

  setNotifications: (notifications: Notification[]) => set({notifications}),

  reset: () => set(() => ({ ...dataInitial })),
}));

