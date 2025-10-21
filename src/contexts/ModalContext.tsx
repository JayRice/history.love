import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
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
  closeCurrentModal: <T = any>(result?: T | null) => void,
  modals: ModalPayload[];
  currentModal: ModalPayload;
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
      try{
        router.push({
          pathname: `/(modals)/${name}`,
          params: { id },
        } as Href);

      }catch(e){
        console.error(`Error while opening modal (${name}): ${e}`)
      }
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

  const closeCurrentModal = useCallback(<T,>( result?: T | null)=> {
    const currentModal = modals[modals.length - 1];

    closeModal(currentModal.id, result);
  }, [modals])

  const currentModal = useMemo(() => {
    return modals[modals.length - 1]
  }, modals)

  return (
    <ModalContext.Provider value={{ openModal, closeModal, modals, currentModal, closeCurrentModal }}>
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error('useModal must be used within ModalProvider');
  return ctx;
};