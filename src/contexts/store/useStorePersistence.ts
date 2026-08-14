import { useEffect, useRef, useState, type Dispatch } from 'react';
import { MODOS_PERSISTENTES } from '../../constants/checks';
import { SEED_ITEMS } from '../../constants/equipment';
import { StorageService } from '../../services/storage.service';
import type { Action } from '../../store/actions';
import type { AppState, Item, ModoId } from '../../types';

type PersistenceKey =
  | 'items' | 'modo' | 'checks' | 'diario' | 'pontos' | 'minimos'
  | 'settings' | 'nota' | 'favDicas' | 'favTutoriais' | 'habilidades';

interface PendingWrite {
  timer: ReturnType<typeof setTimeout>;
  run: () => Promise<void>;
}

const WRITE_DELAYS: Record<PersistenceKey, number> = {
  items: 120,
  modo: 0,
  checks: 150,
  diario: 80,
  pontos: 80,
  minimos: 200,
  settings: 200,
  // A nota é atualizada a cada tecla; um debounce maior evita uma escrita por caractere.
  nota: 450,
  favDicas: 80,
  favTutoriais: 80,
  habilidades: 80,
};

const makeSeedItems = (): Item[] => {
  const now = Date.now();
  return SEED_ITEMS.map(item => ({ ...item, createdAt:now, updatedAt:now }));
};

async function safelyPersist(job: () => Promise<void>): Promise<void> {
  try {
    await job();
  } catch (error) {
    await StorageService.saveError(error);
  }
}

export function useStorePersistence(state: AppState, dispatch: Dispatch<Action>): boolean {
  const [loaded, setLoaded] = useState(false);
  const previous = useRef<AppState | null>(null);
  const pending = useRef<Map<PersistenceKey, PendingWrite>>(new Map());

  useEffect(() => {
    let active = true;

    void (async () => {
      try {
        await StorageService.init();
        const [items, modo, checks, diario, pontos, minimos, settings, nota, favDicas, favTutoriais, habilidades] =
          await Promise.all([
            StorageService.loadItems(), StorageService.loadModo(), StorageService.loadChecks(),
            StorageService.loadDiario(), StorageService.loadPontos(), StorageService.loadMinimos(),
            StorageService.loadSettings(), StorageService.loadNota(), StorageService.loadFavoritosDicas(),
            StorageService.loadFavoritosTutoriais(), StorageService.loadHabilidades(),
          ]);

        if (!active) return;
        dispatch({ type:'SET_ITEMS', payload:items ?? makeSeedItems() });
        dispatch({ type:'SET_CHECKS', payload:checks });
        dispatch({ type:'SET_DIARIO', payload:diario });
        dispatch({ type:'SET_PONTOS', payload:pontos });
        dispatch({ type:'SET_MINIMOS', payload:minimos });
        dispatch({ type:'SET_SETTINGS', payload:settings });
        dispatch({ type:'SET_NOTA', payload:nota });
        dispatch({ type:'SET_FAVORITOS_DICAS', payload:favDicas });
        dispatch({ type:'SET_FAVORITOS_TUTORIAIS', payload:favTutoriais });
        dispatch({ type:'SET_HABILIDADES', payload:habilidades });
        if (modo) dispatch({ type:'SET_MODO', payload:modo as ModoId });
      } catch (error) {
        console.error('[storage] Falha ao inicializar IndexedDB:', error);
        if (!active) return;
        dispatch({ type:'SET_ITEMS', payload:makeSeedItems() });
        await StorageService.saveError(error);
      } finally {
        if (active) setLoaded(true);
      }
    })();

    return () => { active = false; };
  }, [dispatch]);

  useEffect(() => {
    if (!loaded) return;

    // O primeiro estado após a hidratação já veio do IndexedDB. Não há motivo para
    // gravá-lo de volta imediatamente; começamos a observar apenas mudanças futuras.
    if (!previous.current) {
      previous.current = state;
      return;
    }

    const before = previous.current;
    const schedule = (key: PersistenceKey, run: () => Promise<void>) => {
      const old = pending.current.get(key);
      if (old) clearTimeout(old.timer);
      const entry: PendingWrite = {
        run,
        timer: setTimeout(() => {
          pending.current.delete(key);
          void safelyPersist(run);
        }, WRITE_DELAYS[key]),
      };
      pending.current.set(key, entry);
    };

    if (before.items !== state.items) schedule('items', () => StorageService.saveItems(state.items));
    if (before.modoAtivo !== state.modoAtivo) schedule('modo', () => StorageService.saveModo(state.modoAtivo));
    if (before.checks !== state.checks) {
      const checks = Object.fromEntries(
        Object.entries(state.checks).filter(([modoId]) => MODOS_PERSISTENTES.has(modoId)),
      ) as Record<string, Record<string, boolean>>;
      schedule('checks', () => StorageService.saveChecks(checks));
    }
    if (before.diario !== state.diario) schedule('diario', () => StorageService.saveDiario(state.diario));
    if (before.pontos !== state.pontos) schedule('pontos', () => StorageService.savePontos(state.pontos));
    if (before.minimos !== state.minimos) schedule('minimos', () => StorageService.saveMinimos(state.minimos));
    if (before.settings !== state.settings) schedule('settings', () => StorageService.saveSettings(state.settings));
    if (before.notaRapida !== state.notaRapida) schedule('nota', () => StorageService.saveNota(state.notaRapida));
    if (before.favoritosDicas !== state.favoritosDicas) schedule('favDicas', () => StorageService.saveFavoritosDicas(state.favoritosDicas));
    if (before.favoritosTutoriais !== state.favoritosTutoriais) schedule('favTutoriais', () => StorageService.saveFavoritosTutoriais(state.favoritosTutoriais));
    if (before.habilidadesDominadas !== state.habilidadesDominadas) schedule('habilidades', () => StorageService.saveHabilidades(state.habilidadesDominadas));

    previous.current = state;
  }, [loaded, state]);

  useEffect(() => () => {
    // Em desmontagem, não descartamos mudanças que ainda estavam no debounce.
    for (const { timer, run } of pending.current.values()) {
      clearTimeout(timer);
      void safelyPersist(run);
    }
    pending.current.clear();
  }, []);

  return loaded;
}
