import { useEffect, useMemo } from 'react';
import { preload, play, type SoundKey } from '@/src/shared/lib/sfx';

type UseSfxOptions = {
  /** Preload these sounds on mount */
  preloadKeys?: SoundKey[];
};

export default function useSfx(opts: UseSfxOptions = { preloadKeys: ['success', 'yay'] }) {
  const { preloadKeys = ['success', 'yay'] } = opts;

  // Preload once on mount (and when key set changes)
  useEffect(() => {
    preload(preloadKeys);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(preloadKeys)]);

  return useMemo(
    () => ({
      play,
      playSuccess: () => play('success'),
      playYay: () => play('yay'),
    }),
    []
  );
}
