import { create } from 'zustand';

type MemoryImageStore = {
  memoryImages: Record<string,string>; // memoryId → downloadURL
  setMemoryImages: (value: Record<string, string> ) => void;
  setMemoryImage: (imageName: string, downloadURL: string) => void;
  getMemoryImage: ( imageName : string) => string | undefined;
  clearMemoryImages: () => void;
};
const dataInitial: Pick<MemoryImageStore, "memoryImages"> = {
  memoryImages: {}
};
export const useMemoryImageStore = create<MemoryImageStore>((set, get) => ({
  ...dataInitial,

  setMemoryImages: (value:  Record<string, string> )=> set({ memoryImages: value }),
  setMemoryImage: (imageName, downloadURL) =>
    set((state) => ({
      memoryImages: { ...state.memoryImages, [imageName]: downloadURL },
    })),

  getMemoryImage: ( imageName) => get().memoryImages[imageName],

  clearMemoryImages: () => set({ memoryImages: {} }),
  reset: () => set(() => ({ ...dataInitial })),

}));