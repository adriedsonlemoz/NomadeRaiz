import type { FoodConfigWithUnits } from '../services/calculator.service';
import type { ClimaIcon, PontoTipo, TravelTypeId } from '../types';

export const CLIMAS=['☀️','⛅','☁️','🌧️','⛈️','🌬️'] as const satisfies readonly ClimaIcon[];
export const TIPOS_PONTO=[{id:'agua',icon:'💧',label:'Água'},{id:'mercado',icon:'🛒',label:'Mercado'},{id:'camping',icon:'⛺',label:'Camping'},{id:'saude',icon:'🏥',label:'Saúde'},{id:'oficina',icon:'🔧',label:'Oficina'},{id:'outro',icon:'📍',label:'Outro'}] as const satisfies readonly {id:PontoTipo;icon:string;label:string}[];
export const TIPOS_VIAGEM=[{id:'cicloviagem',icon:'🚲',label:'Cicloviagem'},{id:'camping',icon:'🏕️',label:'Camping'},{id:'bate-volta',icon:'🧭',label:'Bate-volta'},{id:'longa',icon:'🛣️',label:'Longa duração'}] as const satisfies readonly {id:TravelTypeId;icon:string;label:string}[];
export const AUTONOMIA_TABS=[{id:'resumo',icon:'📊',label:'Resumo'},{id:'bike',icon:'🚲',label:'Bike'},{id:'comida',icon:'🍱',label:'Comida'},{id:'agua',icon:'💧',label:'Água'},{id:'energia',icon:'⚡',label:'Energia'},{id:'dinheiro',icon:'💰',label:'Dinheiro'},{id:'peso',icon:'⚖️',label:'Peso'},{id:'custo',icon:'🧾',label:'Custo'}] as const;

export const ALIMENTOS_CONFIG=[
 {id:'arroz',nome:'Arroz',icone:'🍚',unidades:[{id:'kg',label:'kg',precoPadrao:7,consumoDiarioPadrao:.2}]},
 {id:'aveia',nome:'Aveia',icone:'🥣',unidades:[{id:'kg',label:'kg',precoPadrao:14,consumoDiarioPadrao:.12}]},
 {id:'macarrao',nome:'Macarrão',icone:'🍝',unidades:[{id:'pct',label:'pacote',precoPadrao:5,consumoDiarioPadrao:.5},{id:'kg',label:'kg',precoPadrao:10,consumoDiarioPadrao:.2}]},
 {id:'sardinha',nome:'Sardinha / proteína',icone:'🥫',unidades:[{id:'un',label:'un.',precoPadrao:7,consumoDiarioPadrao:1}]},
 {id:'castanhas',nome:'Castanhas / amendoim',icone:'🥜',unidades:[{id:'kg',label:'kg',precoPadrao:24,consumoDiarioPadrao:.1}]},
] satisfies readonly FoodConfigWithUnits[];

