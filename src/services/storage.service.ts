import { db } from '../database/db';
import type { AppSettings, DiarioEntry, Item, ModoId, PersistedState, Ponto } from '../types';

const PREFIX = 'nomade-raiz:';
const MIGRATION_KEY = '__migration_localstorage_v1__';

const KEYS = {
  items: 'items',
  modo: 'modo',
  checks: 'checks',
  diario: 'diario',
  pontos: 'pontos',
  minimos: 'minimos',
  settings: 'settings',
  nota: 'nota',
  favDicas: 'favDicas',
  favTutoriais: 'favTutoriais',
  habilidades: 'habilidades',
} as const;

type DataKey = typeof KEYS[keyof typeof KEYS];

async function read<T>(key: DataKey, fallback: T): Promise<T> {
  const record = await db.kv.get(key);
  return record ? record.value as T : fallback;
}

async function write<T>(key: DataKey, value: T): Promise<void> {
  await db.kv.put({ key, value, updatedAt: Date.now() });
}

function readLegacy(key: DataKey): unknown {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw == null ? undefined : JSON.parse(raw);
  } catch {
    return undefined;
  }
}

async function migrateLocalStorageOnce(): Promise<void> {
  const migrated = await db.kv.get(MIGRATION_KEY);
  if (migrated) return;

  const legacyEntries = Object.values(KEYS)
    .map((key) => [key, readLegacy(key)] as const)
    .filter(([, value]) => value !== undefined);

  await db.transaction('rw', db.kv, async () => {
    for (const [key, value] of legacyEntries) {
      const existing = await db.kv.get(key);
      if (!existing) await db.kv.put({ key, value, updatedAt: Date.now() });
    }
    await db.kv.put({
      key: MIGRATION_KEY,
      value: { migratedAt: new Date().toISOString(), entries: legacyEntries.length },
      updatedAt: Date.now(),
    });
  });

  // A migração só remove as chaves antigas depois da transação concluir.
  // Assim, uma falha no IndexedDB não destrói a única cópia dos dados.
  for (const key of Object.values(KEYS)) {
    try { localStorage.removeItem(PREFIX + key); } catch { /* sem acesso ao localStorage */ }
  }
}

export const StorageService = {
  async init(): Promise<boolean> {
    await db.open();
    await migrateLocalStorageOnce();
    return true;
  },

  async loadItems(): Promise<Item[]|null> { return read<Item[]|null>(KEYS.items, null); },
  async saveItems(value: Item[]): Promise<void> { await write(KEYS.items, value); },
  async loadModo(): Promise<ModoId|null> { return read<ModoId|null>(KEYS.modo, null); },
  async saveModo(value: ModoId|null): Promise<void> { await write(KEYS.modo, value); },
  async loadChecks(): Promise<Record<string,Record<string,boolean>>> { return read(KEYS.checks, {}); },
  async saveChecks(value: Record<string,Record<string,boolean>>): Promise<void> { await write(KEYS.checks, value); },
  async loadDiario(): Promise<DiarioEntry[]> { return read(KEYS.diario, []); },
  async saveDiario(value: DiarioEntry[]): Promise<void> { await write(KEYS.diario, value); },
  async loadPontos(): Promise<Ponto[]> { return read(KEYS.pontos, []); },
  async savePontos(value: Ponto[]): Promise<void> { await write(KEYS.pontos, value); },
  async loadMinimos(): Promise<Record<string,number>> { return read(KEYS.minimos, {}); },
  async saveMinimos(value: Record<string,number>): Promise<void> { await write(KEYS.minimos, value); },
  async loadSettings(): Promise<Partial<AppSettings>> { return read(KEYS.settings, {}); },
  async saveSettings(value: AppSettings): Promise<void> { await write(KEYS.settings, value); },
  async loadNota(): Promise<string> { return read(KEYS.nota, ''); },
  async saveNota(value: string): Promise<void> { await write(KEYS.nota, value); },
  async loadFavoritosDicas(): Promise<string[]> { return read(KEYS.favDicas, []); },
  async saveFavoritosDicas(value: string[]): Promise<void> { await write(KEYS.favDicas, value); },
  async loadFavoritosTutoriais(): Promise<string[]> { return read(KEYS.favTutoriais, []); },
  async saveFavoritosTutoriais(value: string[]): Promise<void> { await write(KEYS.favTutoriais, value); },
  async loadHabilidades(): Promise<string[]> { return read(KEYS.habilidades, []); },
  async saveHabilidades(value: string[]): Promise<void> { await write(KEYS.habilidades, value); },

  async saveSnapshot(data: PersistedState): Promise<void> {
    const updatedAt = Date.now();
    const entries: Array<[DataKey, unknown]> = [
      [KEYS.items, data.items], [KEYS.modo, data.modoAtivo], [KEYS.checks, data.checks],
      [KEYS.diario, data.diario], [KEYS.pontos, data.pontos], [KEYS.minimos, data.minimos],
      [KEYS.settings, data.settings], [KEYS.nota, data.notaRapida], [KEYS.favDicas, data.favoritosDicas],
      [KEYS.favTutoriais, data.favoritosTutoriais], [KEYS.habilidades, data.habilidadesDominadas],
    ];
    await db.transaction('rw', db.kv, async () => {
      for (const [key, value] of entries) await db.kv.put({ key, value, updatedAt });
    });
  },

  async clearAll(): Promise<void> {
    await db.kv.clear();
    for (const key of Object.values(KEYS)) {
      try { localStorage.removeItem(PREFIX + key); } catch { /* noop */ }
    }
  },

  async saveError(error: unknown): Promise<void> {
    const err = error instanceof Error ? error : new Error(String(error));
    try {
      await db.kv.put({
        key: '__last_error__',
        value: { at: Date.now(), message: err.message, stack: err.stack ?? '' },
        updatedAt: Date.now(),
      });
    } catch {
      // O registro de erro nunca pode derrubar o aplicativo.
    }
  },
};
