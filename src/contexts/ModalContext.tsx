import React, { createContext, useContext, useState, useCallback } from 'react';
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
  closeModal: <T = any>(id: string, result?: T | null) => void;
  modals: ModalPayload[];
};

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [modals, setModals] = useState<ModalPayload[]>([]);

  const openModal = useCallback(<T,>(name: string, data?: any): Promise<T | null> => {
    return new Promise<T | null>((resolve) => {
      const id = nanoid();
      const modal = { id, name, data, resolve };
      setModals((prev) => [...prev, modal]);

      // push with params so the screen knows which modal instance it is
      router.push({
        pathname: `/(modals)/${name}`,
        params: { id },
      } as Href);
    });
  }, []);

  const closeModal = useCallback(<T,>(id: string, result?: T | null) => {
    // snapshot resolver before state change
    let resolver: Resolver<any> | undefined;
    setModals(prev => {
      const m = prev.find(mm => mm.id === id);
      resolver = m?.resolve;
      return prev; // don't remove yet
    });

    resolver?.(result ?? null);  // resolve promise
    router.back();

    // remove after navigation has a chance to unmount this screen
    setTimeout(() => {
      setModals(prev => prev.filter(m => m.id !== id));
    }, 0);
  }, []);
  return (
    <ModalContext.Provider value={{ openModal, closeModal, modals }}>
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error('useModal must be used within ModalProvider');
  return ctx;
};