import type { EquipmentCategory, Item, Priority } from '../types';

export const CATEGORIES=[
 {id:'mobilidade',label:'Bike & Mobilidade',icon:'🚲'},
 {id:'abrigo',label:'Abrigo',icon:'🏕️'},
 {id:'cozinha',label:'Cozinha',icon:'🍳'},
 {id:'agua',label:'Água',icon:'💧'},
 {id:'energia',label:'Energia',icon:'⚡'},
 {id:'ferramentas',label:'Ferramentas',icon:'🧰'},
 {id:'seguranca',label:'Segurança',icon:'🦺'},
 {id:'vestuario',label:'Vestuário',icon:'👕'},
 {id:'higiene',label:'Higiene & Saúde',icon:'🩹'},
] satisfies readonly EquipmentCategory[];
type SeedItem = Omit<Item, 'createdAt' | 'updatedAt'>;
const seed=(id:string,name:string,categoryId:string,priority:Priority='medio',quantity=1,price=0,notes=''):SeedItem=>({id,name,categoryId,priority,quantity,price,notes,status:'pendente'});
export const SEED_ITEMS=[
 seed('camara','Câmara de ar reserva','mobilidade','urgente',2),seed('remendo','Kit de remendos','ferramentas','urgente',1),
 seed('bomba','Bomba de ar','ferramentas','urgente',1),seed('multitool','Multitool / jogo de chaves','ferramentas','urgente',1),
 seed('espátula','Espátulas de pneu','ferramentas','medio',2),seed('elo','Elo rápido da corrente','ferramentas','medio',2),
 seed('barraca','Barraca','abrigo','urgente',1),seed('isolante','Isolante térmico','abrigo','medio',1),seed('capa-chuva','Capa de chuva','vestuario','medio',1),
 seed('garrafa','Garrafa / reservatório de água','agua','urgente',2),seed('filtro-agua','Filtro ou purificador de água','agua','medio',1),
 seed('powerbank','Power bank','energia','medio',1),seed('painel-solar','Painel solar','energia','baixo',1),seed('lanterna','Lanterna','seguranca','urgente',1),
 seed('luz-bike','Luzes da bicicleta','seguranca','urgente',1),seed('colete','Colete refletivo','seguranca','urgente',1),seed('capacete','Capacete','seguranca','urgente',1),
 seed('primeiros-socorros','Kit de primeiros socorros','higiene','urgente',1),seed('fogareiro','Fogareiro','cozinha','medio',1),seed('panela','Panela/caneca','cozinha','baixo',1),
];
export const MINIMOS_SUGERIDOS={camara:1,remendo:1,elo:1,garrafa:1,'primeiros-socorros':1};

export const EQUIPAMENTOS_SEGURANCA_IDS = ['capacete','luz-bike','colete','primeiros-socorros'];
