import { useMemo } from 'react';
import { GLOSSARIO_BIKE, KIT_FERRAMENTA_PARA_ITEM, KIT_MINIMO_FERRAMENTAS, PECAS_BIKE, PROBLEMAS_ESTRADA } from '../../constants/manualBike';
import type { BikeGlossaryTerm, BikePiece, BikeProblem, BikeToolKitItem, Item, ItemStatus } from '../../types';

export interface TrackedTool extends BikeToolKitItem { status: ItemStatus | null; }
export interface ManualBikeData { buscando:boolean; pecasFiltradas:readonly BikePiece[]; problemasFiltrados:readonly BikeProblem[]; termosFiltrados:readonly BikeGlossaryTerm[]; kitComStatus:TrackedTool[]; kitPossui:number; kitRastreado:number; }

const normaliza = (value:string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const contem = (termo:string, ...values:Array<string|readonly string[]>) => values.some(value => Array.isArray(value) ? value.some(item=>normaliza(item).includes(termo)) : normaliza(value as string).includes(termo));

export function useManualBikeData(items: Item[], busca: string): ManualBikeData {
  return useMemo(() => {
    const termo = normaliza(busca.trim());
    const buscando = termo.length > 0;
    const pecasFiltradas = PECAS_BIKE.filter(piece => contem(termo,piece.nome,piece.funcao,piece.problemasComuns,piece.sinaisAtencao,piece.ferramentas,piece.manutencao,piece.comoResolver));
    const problemasFiltrados = PROBLEMAS_ESTRADA.filter(problem => contem(termo,problem.nome,problem.causas,problem.diagnostico,problem.ferramentas,problem.passos,problem.solucaoTemporaria,problem.solucaoDefinitiva,problem.naoFaca,problem.podeContinuar));
    const termosFiltrados = GLOSSARIO_BIKE.filter(term => contem(termo,term.termo,term.definicao));
    const kitComStatus = KIT_MINIMO_FERRAMENTAS.map(tool => { const itemId=KIT_FERRAMENTA_PARA_ITEM[tool.id]; const item=itemId?items.find(candidate=>candidate.id===itemId):undefined; return {...tool,status:item?.status??null}; });
    return { buscando,pecasFiltradas,problemasFiltrados,termosFiltrados,kitComStatus,kitPossui:kitComStatus.filter(tool=>tool.status==='comprado').length,kitRastreado:kitComStatus.filter(tool=>tool.status!==null).length };
  }, [items, busca]);
}
