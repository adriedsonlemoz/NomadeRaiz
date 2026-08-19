export type ModoId = 'antes-sair' | 'acampamento' | 'chuva' | 'noite' | 'manutencao' | 'emergencia' | string;
export type PageId = 'missao'|'lista'|'diario'|'extras'|'dicas'|'calculadora'|'pontos'|'alertas'|'exportar'|'configuracoes'|'sobre'|'planejamento'|'manual-bike'|string;
export type ItemStatus = 'pendente'|'comprado';
export type Priority = 'baixo'|'medio'|'urgente';
export type FontScale = 'sm'|'md'|'lg';
export type ThemeMode = 'light'|'dark';
export type ClimaIcon = '☀️'|'⛅'|'☁️'|'🌧️'|'⛈️'|'🌬️';
export type PontoTipo = 'agua'|'mercado'|'camping'|'saude'|'oficina'|'outro';
export type PontoAvaliacao = 1|2|3;
export type TravelTypeId = 'cicloviagem'|'camping'|'bate-volta'|'longa';
export type BikeSkillLevel = 'basico'|'intermediario'|'avancado';
export type BikeIssueSeverity = 'baixa'|'media'|'alta';
export type BikeAreaId = 'rodas'|'transmissao'|'freios'|'estrutura';
export type ManualBikeTarget = { tipo:'peca'|'problema'; id:string };

export interface BikeArea {
  id: BikeAreaId;
  icone: string;
  label: string;
}

export interface BikePiece {
  id: string;
  area: BikeAreaId;
  icone: string;
  nome: string;
  nivel: BikeSkillLevel;
  funcao: string;
  problemasComuns: readonly string[];
  sinaisAtencao: readonly string[];
  ferramentas: readonly string[];
  antesDeMexer: readonly string[];
  manutencao: string;
  comoResolver: readonly string[];
  quandoParar: string;
}

export interface BikeProblem {
  id: string;
  icone: string;
  nome: string;
  gravidade: BikeIssueSeverity;
  causas: readonly string[];
  diagnostico: readonly string[];
  ferramentas: readonly string[];
  passos: readonly string[];
  solucaoTemporaria: string;
  solucaoDefinitiva: string;
  naoFaca: readonly string[];
  podeContinuar: string;
}

export interface BikeQuickTip {
  id: string;
  icone: string;
  titulo: string;
  resumo: string;
  detalhes: readonly string[];
}

export interface BikeGlossaryTerm {
  id: string;
  termo: string;
  definicao: string;
}

export interface BikeToolKitItem {
  id: string;
  icone: string;
  nome: string;
  motivo: string;
}
export type ItemFilter = 'todos'|'pendentes'|'comprados'|string;
export type ItemSort = 'prioridade'|'preco-asc'|'preco-desc'|string;

export interface EquipmentCategory {
  id: string;
  icon: string;
  label: string;
}

export interface Item {
  id: string;
  name: string;
  categoryId: string;
  status: ItemStatus;
  priority: Priority;
  quantity: number;
  price: number;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface DiarioEntryDraft {
  local: string;
  clima: ClimaIcon;
  km: number;
  nota: string;
}

export interface DiarioEntry extends DiarioEntryDraft {
  id: string;
  createdAt: number;
}

export interface PontoDraft {
  tipo: PontoTipo;
  nome: string;
  referencia: string;
  obs: string;
  avaliacao: PontoAvaliacao;
  fechado: boolean;
}

export interface Ponto extends PontoDraft {
  id: string;
}

export interface AppSettings {
  themeMode: ThemeMode;
  fontScale: FontScale;
  startDate: number|null;
}

export interface PersistedState {
  items: Item[];
  modoAtivo: ModoId|null;
  checks: Record<string,Record<string,boolean>>;
  diario: DiarioEntry[];
  pontos: Ponto[];
  minimos: Record<string,number>;
  settings: AppSettings;
  notaRapida: string;
  favoritosDicas: string[];
  favoritosTutoriais: string[];
  habilidadesDominadas: string[];
}

export interface AppState extends PersistedState {
  filter: ItemFilter;
  sort: ItemSort;
  page: PageId;
  manualBikeAlvo: ManualBikeTarget|null;
}

export interface BackupEnvelope {
  app: 'nomade-raiz';
  schemaVersion: 1;
  appVersion: string;
  exportedAt: string;
  data: PersistedState;
}

export type BackupImportResult =
  | { kind:'full'; data:PersistedState; sourceVersion?:string }
  | { kind:'legacy-items'; items:Item[] };
