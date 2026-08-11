import type { AppSettings, AppState, DiarioEntry, Item, ModoId, PersistedState, Ponto } from '../types';

export type Action =
  | { type:'SET_ITEMS'; payload:Item[] }
  | { type:'ADD_ITEM'; payload:Omit<Item,'id'|'createdAt'|'updatedAt'> }
  | { type:'UPDATE_ITEM'; payload:Item }
  | { type:'DELETE_ITEM'; payload:string }
  | { type:'TOGGLE'; payload:string }
  | { type:'ADJUST_QTY'; payload:{id:string;delta:number} }
  | { type:'UPDATE_PRICE'; payload:{id:string;price:number} }
  | { type:'SET_FILTER'; payload:AppState['filter'] }
  | { type:'SET_SORT'; payload:AppState['sort'] }
  | { type:'SET_PAGE'; payload:AppState['page'] }
  | { type:'SET_MODO'; payload:ModoId|null }
  | { type:'SET_CHECKS'; payload:Record<string,Record<string,boolean>> }
  | { type:'TOGGLE_CHECK'; payload:{modoId:string;itemId:string} }
  | { type:'RESET_CHECKS'; payload:string }
  | { type:'SET_DIARIO'; payload:DiarioEntry[] }
  | { type:'ADD_ENTRADA'; payload:Omit<DiarioEntry,'id'|'createdAt'> }
  | { type:'DEL_ENTRADA'; payload:string }
  | { type:'SET_PONTOS'; payload:Ponto[] }
  | { type:'ADD_PONTO'; payload:Omit<Ponto,'id'> }
  | { type:'DEL_PONTO'; payload:string }
  | { type:'UPD_PONTO'; payload:Ponto }
  | { type:'SET_MINIMOS'; payload:Record<string,number> }
  | { type:'SET_SETTINGS'; payload:Partial<AppSettings> }
  | { type:'SET_NOTA'; payload:string }
  | { type:'SET_FAVORITOS_DICAS'; payload:string[] }
  | { type:'SET_FAVORITOS_TUTORIAIS'; payload:string[] }
  | { type:'TOGGLE_FAVORITO_DICA'; payload:string }
  | { type:'TOGGLE_FAVORITO_TUTORIAL'; payload:string }
  | { type:'SET_HABILIDADES'; payload:string[] }
  | { type:'TOGGLE_HABILIDADE'; payload:string }
  | { type:'SET_MANUAL_BIKE_ALVO'; payload:{tipo:'peca'|'problema';id:string}|null }
  | { type:'RESTORE_PERSISTED'; payload:PersistedState };
