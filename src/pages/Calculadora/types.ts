import type { Dispatch, SetStateAction } from 'react';
import type {
  EnergyEquipment,
  FoodInput,
  FoodConfig,
  FoodUnitConfig,
  GeneralIndexResult,
  GeneralResource,
  WeightInput,
} from '../../services/calculator.service';

export type StateSetter<T> = Dispatch<SetStateAction<T>>;

export type AutonomyState = 'boa' | 'media' | 'critica' | 'indefinido' | 'neutro';
export type AutonomyTabId = 'resumo' | 'bike' | 'comida' | 'agua' | 'energia' | 'dinheiro' | 'peso' | 'custo';

export interface BikeFormState {
  velocidade: string;
  horas: string;
  dias: string;
}

export type FoodFormState = Record<string, FoodInput>;

export interface FoodConfigWithUnits extends FoodConfig {
  unidades: readonly [FoodUnitConfig, ...FoodUnitConfig[]];
}

export interface EnergyFormState {
  painel: string;
  horasSol: string;
  bateria: string;
  powerbank: string;
  equip: EnergyEquipment[];
}

export interface MoneyFormState {
  disponivel: string;
  gastoDia: string;
}

export type WeightFormState = Record<string, WeightInput>;

export interface CostFormState {
  dias: string;
  alimentacao: string;
  transporte: string;
  manutencao: string;
  outros: string;
}

export interface AutonomyResource extends GeneralResource {
  id: Exclude<AutonomyTabId, 'resumo' | 'peso' | 'custo'>;
  icon: string;
  label: string;
  estado: AutonomyState;
  nota: string;
  dias?: number | null;
}

export type AutonomyIndexResult = GeneralIndexResult<AutonomyResource>;
