import { useEffect, useRef } from 'react';

export const useAsyncEffect = (
  effect: () => Promise<void | (() => void)>,
  deps: React.DependencyList
) => {
  const isMountedRef = useRef(true);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const executeEffect = async () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }

      const cleanup = await effect();
      if (typeof cleanup === 'function' && isMountedRef.current) {
        cleanupRef.current = cleanup;
      }
    };

    executeEffect();

    return () => {
      isMountedRef.current = false;
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, deps);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);
};