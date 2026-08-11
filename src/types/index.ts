export type ModoId = 'antes-sair' | 'acampamento' | 'chuva' | 'noite' | 'manutencao' | 'emergencia' | string;
export type PageId = 'missao'|'lista'|'diario'|'extras'|'dicas'|'calculadora'|'pontos'|'alertas'|'exportar'|'configuracoes'|'sobre'|'planejamento'|'manual-bike'|string;
export type ItemStatus = 'pendente'|'comprado';
export type Priority = 'baixo'|'medio'|'urgente';
export interface Item {
  id: string; name: string; categoryId: string; status: ItemStatus; priority: Priority;
  quantity: number; price: number; notes?: string; createdAt: number; updatedAt: number;
}
export interface DiarioEntry { id:string; local:string; clima:string; km:number; nota:string; createdAt:number; }
export interface Ponto { id:string; tipo:string; nome:string; referencia:string; obs:string; avaliacao:number; fechado:boolean; }
export interface AppSettings { themeMode:'light'|'dark'; fontScale:'sm'|'md'|'lg'; startDate:number|null; }
export interface AppState {
  items: Item[]; filter:'todos'|'pendentes'|'comprados'|string; sort:'prioridade'|'preco-asc'|'preco-desc'|string;
  page: PageId; modoAtivo: ModoId|null; checks: Record<string,Record<string,boolean>>; diario: DiarioEntry[]; pontos:Ponto[];
  minimos:Record<string,number>; settings:AppSettings; notaRapida:string; favoritosDicas:string[]; favoritosTutoriais:string[];
  habilidadesDominadas:string[]; manualBikeAlvo:{tipo:'peca'|'problema';id:string}|null;
}
