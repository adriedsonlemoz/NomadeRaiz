const P='nomade-raiz:';
const read=(k,fallback)=>{try{const v=localStorage.getItem(P+k);return v==null?fallback:JSON.parse(v)}catch{return fallback}};
const write=(k,v)=>{try{localStorage.setItem(P+k,JSON.stringify(v))}catch{}};
export const StorageService={
 async init(){return true}, async loadItems(){return read('items',[])}, async saveItems(v){write('items',v)},
 async loadModo(){return read('modo',null)}, async saveModo(v){write('modo',v)}, async loadChecks(){return read('checks',{})}, async saveChecks(v){write('checks',v)},
 async loadDiario(){return read('diario',[])}, async saveDiario(v){write('diario',v)}, async loadPontos(){return read('pontos',[])}, async savePontos(v){write('pontos',v)},
 async loadMinimos(){return read('minimos',{})}, async saveMinimos(v){write('minimos',v)}, async loadSettings(){return read('settings',{})}, async saveSettings(v){write('settings',v)},
 async loadNota(){return read('nota','')}, async saveNota(v){write('nota',v)}, async loadFavoritosDicas(){return read('favDicas',[])}, async saveFavoritosDicas(v){write('favDicas',v)},
 async loadFavoritosTutoriais(){return read('favTutoriais',[])}, async saveFavoritosTutoriais(v){write('favTutoriais',v)}, async loadHabilidades(){return read('habilidades',[])}, async saveHabilidades(v){write('habilidades',v)},
 async clearAll(){Object.keys(localStorage).filter(k=>k.startsWith(P)).forEach(k=>localStorage.removeItem(k));},
 async saveError(err){try{write('lastError',{at:Date.now(),message:String(err?.message||err),stack:String(err?.stack||'')})}catch{}}
};
