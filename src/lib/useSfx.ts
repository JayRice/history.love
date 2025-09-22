import { useEffect } from "react";
import { preload, unloadAll } from "./sfx";

export default function useSfx(keys: Parameters<typeof preload>[0]) {
  useEffect(() => {
    preload(keys);
    return () => {
      // If your app plays sounds across screens, you may skip unloading here.
      // Do unload on app exit or when you know you’re done with sounds.
      // unloadAll();
    };
  }, []);
}