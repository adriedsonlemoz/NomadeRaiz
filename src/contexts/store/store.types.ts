import type { Dispatch } from 'react';
import type { Action } from '../../store/actions';
import type {
  AppSettings,
  AppState,
  DiarioEntry,
  Item,
  ManualBikeTarget,
  ModoId,
  PersistedState,
  Ponto,
} from '../../types';

export interface StoreActions {
  addItem: (payload: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateItem: (payload: Item) => void;
  deleteItem: (id: string) => void;
  toggle: (id: string) => void;
  adjustQty: (id: string, delta: number) => void;
  updatePrice: (id: string, price: number) => void;
  setFilter: (filter: AppState['filter']) => void;
  setSort: (sort: AppState['sort']) => void;
  setPage: (page: AppState['page']) => void;
  setModo: (modo: ModoId | null) => void;
  toggleCheck: (modoId: string, itemId: string) => void;
  resetChecks: (modoId: string) => void;
  addEntrada: (entry: Omit<DiarioEntry, 'id' | 'createdAt'>) => void;
  delEntrada: (id: string) => void;
  addPonto: (ponto: Omit<Ponto, 'id'>) => void;
  delPonto: (id: string) => void;
  updPonto: (ponto: Ponto) => void;
  setMinimos: (minimos: Record<string, number>) => void;
  setSettings: (settings: Partial<AppSettings>) => void;
  setNota: (nota: string) => void;
  restorePersistedState: (data: PersistedState) => Promise<void>;
  toggleFavoritoDica: (id: string) => void;
  toggleFavoritoTutorial: (id: string) => void;
  toggleHabilidade: (id: string) => void;
  setManualBikeAlvo: (alvo: ManualBikeTarget | null) => void;
}

export interface StoreCtx extends StoreActions {
  state: AppState;
  dispatch: Dispatch<Action>;
  loaded: boolean;
}
