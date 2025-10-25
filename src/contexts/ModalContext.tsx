// src/contexts/ModalContext.tsx
import React, { createContext, useContext, useState, useCallback, useMemo, useRef } from 'react';
import { router } from 'expo-router';
import { nanoid } from 'nanoid/non-secure';
import type { Href } from 'expo-router';

type Resolver<T> = (v: T | null) => void;

export type ModalPayload = {
  id: string;
  name: string;
  data?: any;
  resolve: Resolver<any>;
};

type ModalContextType = {
  openModal: <T = any>(name: string, data?: any) => Promise<T | null>;
  closeModal: <T = any>(id: string, result?: T | null) => void;       // closes and pops route
  closeCurrentModal: <T = any>(result?: T | null) => void;             // closes top and pops
  forceClose: <T = any>(id: string, result?: T | null) => void;        // closes without popping route (use when nav already popped)
  modals: ModalPayload[];
  currentModal?: ModalPayload;
};

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [modals, setModals] = useState<ModalPayload[]>([]);

  // Keep a ref of IDs that have already been resolved/closed to prevent double work.
  const closedIdsRef = useRef<Set<string>>(new Set());

  const openModal = useCallback(<T,>(name: string, data?: any): Promise<T | null> => {
    return new Promise<T | null>((resolve) => {
      const id = nanoid();
      const modal: ModalPayload = { id, name, data, resolve };
      setModals((prev) => [...prev, modal]);

      const pathName = name.includes('/(modals)/') ? name : `/(modals)/${name}`;

      try {
        router.push({
          pathname: pathName,
          params: { id },
        } as Href);
      } catch (e) {
        console.error(`Error while opening modal (${name}): ${e}`);
        // Fail-safe: resolve null immediately if navigation failed
        resolve(null);
        // also remove the modal
        setModals((prev) => prev.filter((m) => m.id !== id));
      }
    });
  }, []);

  // Internal helper: resolves + removes from state (no navigation)
  const resolveAndRemove = useCallback(<T,>(id: string, result?: T | null) => {
    if (closedIdsRef.current.has(id)) return;
    closedIdsRef.current.add(id);

    let resolver: Resolver<any> | undefined;
    setModals((prev) => {
      const m = prev.find((mm) => mm.id === id);
      resolver = m?.resolve;
      return prev.filter((mm) => mm.id !== id);
    });

    // resolve AFTER we've queued state removal so consumers see consistent state
    resolver?.(result ?? null);
  }, []);

  // Used when YOU are initiating the close: resolve, then pop route.
  const closeModal = useCallback(<T,>(id: string, result?: T | null) => {
    // Resolve + remove first
    resolveAndRemove<T>(id, result ?? null);
    // Then pop the route. If the route is already going away, this is a no-op for top-level.
    try {
      router.back();
    } catch {
      // ignore
    }
  }, [resolveAndRemove]);

  // Used when NAVIGATION has already decided to pop the route (gesture/system back/etc.)
  // We do NOT call router.back() here to avoid double pops.
  const forceClose = useCallback(<T,>(id: string, result?: T | null) => {
    resolveAndRemove<T>(id, result ?? null);
  }, [resolveAndRemove]);

  const closeCurrentModal = useCallback(<T,>(result?: T | null) => {
    const current = modals[modals.length - 1];
    if (!current) return;
    closeModal<T>(current.id, result ?? null);
  }, [modals, closeModal]);

  const currentModal = useMemo(() => {
    return modals[modals.length - 1];
  }, [modals]); // ✅ fix: add dependency array

  const value = useMemo(
    () => ({ openModal, closeModal, closeCurrentModal, forceClose, modals, currentModal }),
    [openModal, closeModal, closeCurrentModal, forceClose, modals, currentModal]
  );

  return <ModalContext.Provider value={value}>{children}</ModalContext.Provider>;
};

export const useModal = () => {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error('useModal must be used within ModalProvider');
  return ctx;
};
