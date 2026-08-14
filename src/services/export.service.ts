import { APP_ID, APP_VERSION, BACKUP_SCHEMA_VERSION } from '../config/app';
import { CLIMAS, TIPOS_PONTO } from '../constants';
import type {
  AppState, BackupEnvelope, BackupImportResult, ClimaIcon, DiarioEntry, Item,
  PersistedState, Ponto, PontoAvaliacao, PontoTipo,
} from '../types';
import { fmt } from '../utils/format';

const DEFAULT_SETTINGS: PersistedState['settings'] = {
  themeMode: 'light',
  fontScale: 'md',
  startDate: null,
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value);
const asFiniteNumber = (value: unknown, fallback = 0) =>
  typeof value === 'number' && Number.isFinite(value) ? value : fallback;
const asString = (value: unknown, fallback = '') => typeof value === 'string' ? value : fallback;
const asStringArray = (value: unknown) => Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : [];

const climasValidos = new Set<ClimaIcon>(CLIMAS);
const tiposPontoValidos = new Set<PontoTipo>(
  TIPOS_PONTO.map((tipo) => tipo.id),
);

const asClima = (value: unknown): ClimaIcon =>
  typeof value === 'string' && climasValidos.has(value as ClimaIcon) ? value as ClimaIcon : '☀️';
const asPontoTipo = (value: unknown): PontoTipo =>
  typeof value === 'string' && tiposPontoValidos.has(value as PontoTipo) ? value as PontoTipo : 'outro';
const asPontoAvaliacao = (value: unknown): PontoAvaliacao => {
  const avaliacao = Math.round(asFiniteNumber(value, 1));
  return avaliacao >= 3 ? 3 : avaliacao <= 1 ? 1 : 2;
};

function normalizeItem(value: unknown, index: number): Item {
  if (!isRecord(value) || typeof value.id !== 'string' || typeof value.name !== 'string' || typeof value.categoryId !== 'string') {
    throw new Error(`Backup inválido: item ${index + 1} está incompleto.`);
  }
  return {
    id: value.id,
    name: value.name,
    categoryId: value.categoryId,
    status: value.status === 'comprado' ? 'comprado' : 'pendente',
    priority: value.priority === 'urgente' || value.priority === 'baixo' ? value.priority : 'medio',
    quantity: Math.max(0, asFiniteNumber(value.quantity, 1)),
    price: Math.max(0, asFiniteNumber(value.price, 0)),
    notes: typeof value.notes === 'string' ? value.notes : undefined,
    createdAt: asFiniteNumber(value.createdAt, Date.now()),
    updatedAt: asFiniteNumber(value.updatedAt, Date.now()),
  };
}

function normalizeDiario(value: unknown): DiarioEntry[] {
  if (!Array.isArray(value)) return [];
  return value.filter(isRecord).map((entry, index) => ({
    id: asString(entry.id, `diario-importado-${index}`),
    local: asString(entry.local),
    clima: asClima(entry.clima),
    km: Math.max(0, asFiniteNumber(entry.km)),
    nota: asString(entry.nota),
    createdAt: asFiniteNumber(entry.createdAt, Date.now()),
  }));
}

function normalizePontos(value: unknown): Ponto[] {
  if (!Array.isArray(value)) return [];
  return value.filter(isRecord).map((ponto, index) => ({
    id: asString(ponto.id, `ponto-importado-${index}`),
    tipo: asPontoTipo(ponto.tipo),
    nome: asString(ponto.nome),
    referencia: asString(ponto.referencia),
    obs: asString(ponto.obs),
    avaliacao: asPontoAvaliacao(ponto.avaliacao),
    fechado: ponto.fechado === true,
  }));
}

function normalizeChecks(value: unknown): Record<string,Record<string,boolean>> {
  if (!isRecord(value)) return {};
  const output: Record<string,Record<string,boolean>> = {};
  for (const [modo, checks] of Object.entries(value)) {
    if (!isRecord(checks)) continue;
    output[modo] = Object.fromEntries(
      Object.entries(checks).filter((entry): entry is [string, boolean] => typeof entry[1] === 'boolean')
    );
  }
  return output;
}

function normalizeNumberMap(value: unknown): Record<string,number> {
  if (!isRecord(value)) return {};
  return Object.fromEntries(
    Object.entries(value)
      .filter((entry): entry is [string, number] => typeof entry[1] === 'number' && Number.isFinite(entry[1]))
      .map(([key, number]) => [key, Math.max(0, number)])
  );
}

export function exportText(items: Item[] = [], formato = 'completo'): string {
  return items
    .map((item) => `${item.status === 'comprado' ? '✓' : '○'} ${item.name} ×${item.quantity} — ${fmt((item.price || 0) * (item.quantity || 1))}${formato === 'completo' && item.notes ? ` — ${item.notes}` : ''}`)
    .join('\n');
}

export function toPersistedState(state: AppState): PersistedState {
  return {
    items: state.items,
    modoAtivo: state.modoAtivo,
    checks: state.checks,
    diario: state.diario,
    pontos: state.pontos,
    minimos: state.minimos,
    settings: state.settings,
    notaRapida: state.notaRapida,
    favoritosDicas: state.favoritosDicas,
    favoritosTutoriais: state.favoritosTutoriais,
    habilidadesDominadas: state.habilidadesDominadas,
  };
}

export function createBackup(state: AppState): BackupEnvelope {
  return {
    app: APP_ID,
    schemaVersion: BACKUP_SCHEMA_VERSION,
    appVersion: APP_VERSION,
    exportedAt: new Date().toISOString(),
    data: toPersistedState(state),
  };
}

export function exportBackupJSON(state: AppState): string {
  return JSON.stringify(createBackup(state), null, 2);
}

function normalizePersistedState(raw: Record<string, unknown>): PersistedState {
  const settings = isRecord(raw.settings) ? raw.settings : {};
  return {
    items: Array.isArray(raw.items) ? raw.items.map(normalizeItem) : [],
    modoAtivo: typeof raw.modoAtivo === 'string' ? raw.modoAtivo : null,
    checks: normalizeChecks(raw.checks),
    diario: normalizeDiario(raw.diario),
    pontos: normalizePontos(raw.pontos),
    minimos: normalizeNumberMap(raw.minimos),
    settings: {
      themeMode: settings.themeMode === 'dark' ? 'dark' : DEFAULT_SETTINGS.themeMode,
      fontScale: settings.fontScale === 'sm' || settings.fontScale === 'lg' ? settings.fontScale : DEFAULT_SETTINGS.fontScale,
      startDate: typeof settings.startDate === 'number' && Number.isFinite(settings.startDate) ? settings.startDate : null,
    },
    notaRapida: asString(raw.notaRapida),
    favoritosDicas: asStringArray(raw.favoritosDicas),
    favoritosTutoriais: asStringArray(raw.favoritosTutoriais),
    habilidadesDominadas: asStringArray(raw.habilidadesDominadas),
  };
}

export function importBackupJSON(text: string): BackupImportResult {
  const parsed: unknown = JSON.parse(text);

  // Compatibilidade com os backups 1.0.0: array puro ou { items: [...] }.
  if (Array.isArray(parsed)) return { kind: 'legacy-items', items: parsed.map(normalizeItem) };
  if (!isRecord(parsed)) throw new Error('Backup inválido.');

  if (Array.isArray(parsed.items) && !parsed.data) {
    return { kind: 'legacy-items', items: parsed.items.map(normalizeItem) };
  }

  if (parsed.app !== APP_ID || parsed.schemaVersion !== BACKUP_SCHEMA_VERSION || !isRecord(parsed.data)) {
    throw new Error('Backup incompatível ou inválido.');
  }

  return {
    kind: 'full',
    data: normalizePersistedState(parsed.data),
    sourceVersion: typeof parsed.appVersion === 'string' ? parsed.appVersion : undefined,
  };
}

// Mantidos para compatibilidade interna com chamadas antigas.
export const exportQRData = exportBackupJSON;
export const importQRData = importBackupJSON;
