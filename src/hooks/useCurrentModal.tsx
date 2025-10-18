import * as React from 'react';
import { BackHandler } from 'react-native';
import { useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useModal } from '@/src/contexts/ModalContext';

export function useCurrentModal<TData = any, TResult = any>() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { modals, closeModal } = useModal();

  // derive modal and flags (no early return!)
  const modal = React.useMemo(
    () => (id ? modals.find(m => m.id === id) : undefined),
    [id, modals]
  );
  const exists = !!modal;

  // Always call Hooks. Guard inside the callback.
  useFocusEffect(
    React.useCallback(() => {
      if (!exists || !modal) return; // no-op when not ready
      const sub = BackHandler.addEventListener('hardwareBackPress', () => {
        closeModal<TResult>(modal.id, null);
        return true;
      });
      return () => sub.remove();
    }, [exists, modal, closeModal])
  );

  const safeId = modal?.id as string | undefined;
  const data = modal?.data as TData | undefined;

  const close = React.useCallback(
    (result?: TResult | null) => {
      if (safeId) closeModal<TResult>(safeId, result ?? null);
    },
    [safeId, closeModal]
  );

  const dismiss = React.useCallback(() => close(null), [close]);

  return {
    id: safeId,
    data,
    close,
    dismiss,
    exists,
  };
}
