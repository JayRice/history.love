import { create } from "zustand";

type Store = {
  profileImage: string | null;
  setProfileImage: (profileImage: string | null) => void;

  partnerProfileImage: string | null;
  setPartnerProfileImage: (partnerProfileImage:  string | null) => void;

};

const dataInitial: Pick<Store, "profileImage" | "partnerProfileImage"> = {
  profileImage: null,
  partnerProfileImage: null
};
export const useImagesStore = create<Store>()((set, get) => ({
  ...dataInitial,

  setProfileImage: (profileImage:  string | null) => set({profileImage}),
  setPartnerProfileImage: (partnerProfileImage:  string | null) => set({partnerProfileImage}),

  reset: () => set(() => ({ ...dataInitial })),
}));

