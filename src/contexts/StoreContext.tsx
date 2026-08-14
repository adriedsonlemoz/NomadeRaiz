import { createContext, useContext, useMemo, useReducer, type ReactNode } from 'react';
import { INITIAL, reducer } from '../store/reducer';
import { useStoreActions } from './store/useStoreActions';
import { useStorePersistence } from './store/useStorePersistence';
import type { StoreCtx } from './store/store.types';

const Ctx = createContext<StoreCtx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL);
  const loaded = useStorePersistence(state, dispatch);
  const actions = useStoreActions(dispatch);

  const value = useMemo<StoreCtx>(
    () => ({ state, dispatch, loaded, ...actions }),
    [state, dispatch, loaded, actions],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useStore = (): StoreCtx => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useStore must be inside StoreProvider');
  return ctx;
};
