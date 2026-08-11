import type { AppState, Item } from '../types';
import type { Action } from './actions';
const uid=()=>`${Date.now().toString(36)}-${Math.random().toString(36).slice(2,9)}`;
export const INITIAL:AppState={items:[],filter:'todos',sort:'prioridade',page:'missao',modoAtivo:null,checks:{},diario:[],pontos:[],minimos:{},settings:{themeMode:'light',fontScale:'md',startDate:null},notaRapida:'',favoritosDicas:[],favoritosTutoriais:[],habilidadesDominadas:[],manualBikeAlvo:null};
const toggleIn=(arr:string[],id:string)=>arr.includes(id)?arr.filter(x=>x!==id):[...arr,id];
export function reducer(state:AppState, action:Action):AppState {
 switch(action.type){
  case 'SET_ITEMS': return {...state,items:action.payload};
  case 'ADD_ITEM': {const now=Date.now(); const item:Item={...action.payload,id:uid(),createdAt:now,updatedAt:now}; return {...state,items:[...state.items,item]};}
  case 'UPDATE_ITEM': return {...state,items:state.items.map(i=>i.id===action.payload.id?{...action.payload,updatedAt:Date.now()}:i)};
  case 'DELETE_ITEM': return {...state,items:state.items.filter(i=>i.id!==action.payload)};
  case 'TOGGLE': return {...state,items:state.items.map(i=>i.id===action.payload?{...i,status:i.status==='comprado'?'pendente':'comprado',updatedAt:Date.now()}:i)};
  case 'ADJUST_QTY': return {...state,items:state.items.map(i=>i.id===action.payload.id?{...i,quantity:Math.max(0,(Number(i.quantity)||0)+action.payload.delta),updatedAt:Date.now()}:i)};
  case 'UPDATE_PRICE': return {...state,items:state.items.map(i=>i.id===action.payload.id?{...i,price:Math.max(0,Number(action.payload.price)||0),updatedAt:Date.now()}:i)};
  case 'SET_FILTER': return {...state,filter:action.payload}; case 'SET_SORT': return {...state,sort:action.payload}; case 'SET_PAGE': return {...state,page:action.payload}; case 'SET_MODO': return {...state,modoAtivo:action.payload};
  case 'SET_CHECKS': return {...state,checks:action.payload||{}};
  case 'TOGGLE_CHECK': {const cur=state.checks[action.payload.modoId]||{}; return {...state,checks:{...state.checks,[action.payload.modoId]:{...cur,[action.payload.itemId]:!cur[action.payload.itemId]}}};}
  case 'RESET_CHECKS': return {...state,checks:{...state.checks,[action.payload]:{}}};
  case 'SET_DIARIO': return {...state,diario:action.payload||[]}; case 'ADD_ENTRADA': return {...state,diario:[{...action.payload,id:uid(),createdAt:Date.now()},...state.diario]}; case 'DEL_ENTRADA': return {...state,diario:state.diario.filter(e=>e.id!==action.payload)};
  case 'SET_PONTOS': return {...state,pontos:action.payload||[]}; case 'ADD_PONTO': return {...state,pontos:[{...action.payload,id:uid()},...state.pontos]}; case 'DEL_PONTO': return {...state,pontos:state.pontos.filter(p=>p.id!==action.payload)}; case 'UPD_PONTO': return {...state,pontos:state.pontos.map(p=>p.id===action.payload.id?action.payload:p)};
  case 'SET_MINIMOS': return {...state,minimos:action.payload||{}}; case 'SET_SETTINGS': return {...state,settings:{...state.settings,...action.payload}}; case 'SET_NOTA': return {...state,notaRapida:action.payload};
  case 'SET_FAVORITOS_DICAS': return {...state,favoritosDicas:action.payload||[]}; case 'SET_FAVORITOS_TUTORIAIS': return {...state,favoritosTutoriais:action.payload||[]};
  case 'TOGGLE_FAVORITO_DICA': return {...state,favoritosDicas:toggleIn(state.favoritosDicas,action.payload)}; case 'TOGGLE_FAVORITO_TUTORIAL': return {...state,favoritosTutoriais:toggleIn(state.favoritosTutoriais,action.payload)};
  case 'SET_HABILIDADES': return {...state,habilidadesDominadas:action.payload||[]}; case 'TOGGLE_HABILIDADE': return {...state,habilidadesDominadas:toggleIn(state.habilidadesDominadas,action.payload)};
  case 'SET_MANUAL_BIKE_ALVO': return {...state,manualBikeAlvo:action.payload}; default:return state;
 }
}
