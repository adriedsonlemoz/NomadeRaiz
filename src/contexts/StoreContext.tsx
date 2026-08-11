import React, { createContext, useContext, useReducer, useEffect, useCallback, useState } from "react";
import type { AppState, Item, DiarioEntry, Ponto, AppSettings, ModoId } from "../types";
import type { Action } from "../store/actions";
import { reducer, INITIAL } from "../store/reducer";
import { StorageService } from "../services/storage.service";
import { SEED_ITEMS, MODOS_PERSISTENTES } from "../constants";

// ─── CONTEXT ──────────────────────────────────────────────────────────────────
interface StoreCtx {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  // Item actions
  addItem:     (p: Omit<Item,"id"|"createdAt"|"updatedAt">) => void;
  updateItem:  (p: Item) => void;
  deleteItem:  (id: string) => void;
  toggle:      (id: string) => void;
  adjustQty:   (id: string, delta: number) => void;
  updatePrice: (id: string, price: number) => void;
  // UI actions
  setFilter:   (f: AppState["filter"]) => void;
  setSort:     (s: AppState["sort"]) => void;
  setPage:     (p: AppState["page"]) => void;
  setModo:     (m: ModoId | null) => void;
  // Checks
  toggleCheck: (modoId: string, itemId: string) => void;
  resetChecks: (modoId: string) => void;
  // Diário
  addEntrada:  (e: Omit<DiarioEntry,"id"|"createdAt">) => void;
  delEntrada:  (id: string) => void;
  // Pontos
  addPonto:    (p: Omit<Ponto,"id">) => void;
  delPonto:    (id: string) => void;
  updPonto:    (p: Ponto) => void;
  // Outros
  setMinimos:  (m: Record<string,number>) => void;
  setSettings: (s: Partial<AppSettings>) => void;
  setNota:     (n: string) => void;
  // Favoritos
  toggleFavoritoDica:     (id: string) => void;
  toggleFavoritoTutorial: (id: string) => void;
  // Manual da Bike
  toggleHabilidade:  (id: string) => void;
  setManualBikeAlvo: (alvo: { tipo:"peca"|"problema"; id:string } | null) => void;
  // Pronto do carregamento inicial (Dexie/IndexedDB é assíncrono)
  loaded: boolean;
}

const Ctx = createContext<StoreCtx | null>(null);

// ─── PROVIDER ─────────────────────────────────────────────────────────────────
export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL);
  const [loaded, setLoaded] = useState(false);

  // Carregar todos os dados do Dexie (IndexedDB) na inicialização.
  // `loaded` só vira true depois que TUDO foi lido e despachado — os efeitos
  // de gravação abaixo ficam travados até lá, para nunca sobrescrever o banco
  // com o estado inicial vazio enquanto a leitura ainda está em andamento.
  useEffect(() => {
    let ativo = true;
    (async () => {
      await StorageService.init(); // migra do localStorage uma única vez, se preciso

      const [items, modo, checks, diario, pontos, minimos, settings, nota, favDicas, favTutoriais, habilidades] =
        await Promise.all([
          StorageService.loadItems(),
          StorageService.loadModo(),
          StorageService.loadChecks(),
          StorageService.loadDiario(),
          StorageService.loadPontos(),
          StorageService.loadMinimos(),
          StorageService.loadSettings(),
          StorageService.loadNota(),
          StorageService.loadFavoritosDicas(),
          StorageService.loadFavoritosTutoriais(),
          StorageService.loadHabilidades(),
        ]);

      if (!ativo) return;

      dispatch({ type:"SET_ITEMS", payload: items?.length ? items : SEED_ITEMS.map(i => ({
        ...i, createdAt: Date.now(), updatedAt: Date.now(),
      })) });
      dispatch({ type:"SET_CHECKS",   payload: checks });
      dispatch({ type:"SET_DIARIO",   payload: diario });
      dispatch({ type:"SET_PONTOS",   payload: pontos });
      dispatch({ type:"SET_MINIMOS",  payload: minimos });
      dispatch({ type:"SET_SETTINGS", payload: settings });
      dispatch({ type:"SET_NOTA",     payload: nota });
      dispatch({ type:"SET_FAVORITOS_DICAS",     payload: favDicas });
      dispatch({ type:"SET_FAVORITOS_TUTORIAIS", payload: favTutoriais });
      dispatch({ type:"SET_HABILIDADES",         payload: habilidades });
      if (modo) dispatch({ type:"SET_MODO", payload: modo as ModoId });

      setLoaded(true);
    })();
    return () => { ativo = false; };
  }, []);

  // Persistir mudanças — travado até a carga inicial terminar (ver acima).
  useEffect(() => { if (loaded && state.items.length) StorageService.saveItems(state.items); }, [loaded, state.items]);
  useEffect(() => { if (loaded) StorageService.saveModo(state.modoAtivo); }, [loaded, state.modoAtivo]);
  useEffect(() => {
    if (!loaded) return;
    const toSave = Object.fromEntries(
      Object.entries(state.checks).filter(([k]) => MODOS_PERSISTENTES.has(k))
    );
    StorageService.saveChecks(toSave);
  }, [loaded, state.checks]);
  useEffect(() => { if (loaded) StorageService.saveDiario(state.diario); },       [loaded, state.diario]);
  useEffect(() => { if (loaded) StorageService.savePontos(state.pontos); },       [loaded, state.pontos]);
  useEffect(() => { if (loaded) StorageService.saveMinimos(state.minimos); },     [loaded, state.minimos]);
  useEffect(() => { if (loaded) StorageService.saveSettings(state.settings); },   [loaded, state.settings]);
  useEffect(() => { if (loaded) StorageService.saveNota(state.notaRapida); },     [loaded, state.notaRapida]);
  useEffect(() => { if (loaded) StorageService.saveFavoritosDicas(state.favoritosDicas); },
    [loaded, state.favoritosDicas]);
  useEffect(() => { if (loaded) StorageService.saveFavoritosTutoriais(state.favoritosTutoriais); },
    [loaded, state.favoritosTutoriais]);
  useEffect(() => { if (loaded) StorageService.saveHabilidades(state.habilidadesDominadas); },
    [loaded, state.habilidadesDominadas]);

  // API memoizada
  const api: StoreCtx = {
    state, dispatch, loaded,
    addItem:     useCallback(p      => dispatch({ type:"ADD_ITEM",     payload: p }),            []),
    updateItem:  useCallback(p      => dispatch({ type:"UPDATE_ITEM",  payload: p }),            []),
    deleteItem:  useCallback(id     => dispatch({ type:"DELETE_ITEM",  payload: id }),           []),
    toggle:      useCallback(id     => dispatch({ type:"TOGGLE",       payload: id }),           []),
    adjustQty:   useCallback((id,d) => dispatch({ type:"ADJUST_QTY",   payload: { id, delta:d }}), []),
    updatePrice: useCallback((id,p) => dispatch({ type:"UPDATE_PRICE", payload: { id, price:p }}), []),
    setFilter:   useCallback(f      => dispatch({ type:"SET_FILTER",   payload: f }),            []),
    setSort:     useCallback(s      => dispatch({ type:"SET_SORT",     payload: s }),            []),
    setPage:     useCallback(p      => dispatch({ type:"SET_PAGE",     payload: p }),            []),
    setModo:     useCallback(m      => dispatch({ type:"SET_MODO",     payload: m }),            []),
    toggleCheck: useCallback((modoId,itemId) => dispatch({ type:"TOGGLE_CHECK", payload: { modoId, itemId }}), []),
    resetChecks: useCallback(modoId => dispatch({ type:"RESET_CHECKS", payload: modoId }),       []),
    addEntrada:  useCallback(e      => dispatch({ type:"ADD_ENTRADA",  payload: e }),            []),
    delEntrada:  useCallback(id     => dispatch({ type:"DEL_ENTRADA",  payload: id }),           []),
    addPonto:    useCallback(p      => dispatch({ type:"ADD_PONTO",    payload: p }),            []),
    delPonto:    useCallback(id     => dispatch({ type:"DEL_PONTO",    payload: id }),           []),
    updPonto:    useCallback(p      => dispatch({ type:"UPD_PONTO",    payload: p }),            []),
    setMinimos:  useCallback(m      => dispatch({ type:"SET_MINIMOS",  payload: m }),            []),
    setSettings: useCallback(s      => dispatch({ type:"SET_SETTINGS", payload: s }),            []),
    setNota:     useCallback(n      => dispatch({ type:"SET_NOTA",     payload: n }),            []),
    toggleFavoritoDica:     useCallback(id => dispatch({ type:"TOGGLE_FAVORITO_DICA",     payload: id }), []),
    toggleFavoritoTutorial: useCallback(id => dispatch({ type:"TOGGLE_FAVORITO_TUTORIAL", payload: id }), []),
    toggleHabilidade:  useCallback(id   => dispatch({ type:"TOGGLE_HABILIDADE",    payload: id }),    []),
    setManualBikeAlvo: useCallback(alvo => dispatch({ type:"SET_MANUAL_BIKE_ALVO", payload: alvo }),  []),
  };

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export const useStore = (): StoreCtx => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStore must be inside StoreProvider");
  return ctx;
};
