import { useMemo } from 'react';
import {
  GLOSSARIO_BIKE,
  KIT_FERRAMENTA_PARA_ITEM,
  KIT_MINIMO_FERRAMENTAS,
  PECAS_BIKE,
  PROBLEMAS_ESTRADA,
} from '../../constants/manualBike';
import type { BikeGlossaryTerm, BikePiece, BikeProblem, BikeToolKitItem, Item, ItemStatus } from '../../types';

export interface TrackedTool extends BikeToolKitItem {
  status: ItemStatus | null;
}

export interface ManualBikeData {
  buscando: boolean;
  pecasFiltradas: readonly BikePiece[];
  problemasFiltrados: readonly BikeProblem[];
  termosFiltrados: readonly BikeGlossaryTerm[];
  kitComStatus: TrackedTool[];
  kitPossui: number;
  kitRastreado: number;
}

export function useManualBikeData(items: Item[], busca: string): ManualBikeData {
  return useMemo(() => {
    const termo = busca.trim().toLowerCase();
    const buscando = termo.length > 0;
    const pecasFiltradas = PECAS_BIKE.filter(piece => piece.nome.toLowerCase().includes(termo));
    const problemasFiltrados = PROBLEMAS_ESTRADA.filter(problem => problem.nome.toLowerCase().includes(termo));
    const termosFiltrados = GLOSSARIO_BIKE.filter(term => term.termo.toLowerCase().includes(termo));
    const kitComStatus = KIT_MINIMO_FERRAMENTAS.map(tool => {
      const itemId = KIT_FERRAMENTA_PARA_ITEM[tool.id];
      const item = itemId ? items.find(candidate => candidate.id === itemId) : undefined;
      return { ...tool, status:item?.status ?? null };
    });

    return {
      buscando,
      pecasFiltradas,
      problemasFiltrados,
      termosFiltrados,
      kitComStatus,
      kitPossui:kitComStatus.filter(tool => tool.status === 'comprado').length,
      kitRastreado:kitComStatus.filter(tool => tool.status !== null).length,
    };
  }, [items, busca]);
}
