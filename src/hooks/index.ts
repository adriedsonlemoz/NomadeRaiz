import { useCallback, useMemo } from "react";
import { useTheme as useThemeCtx } from "../contexts/ThemeContext";
import { useStore } from "../contexts/StoreContext";
import { isBelowMinimum } from "../services/equipment.service";

export const useTheme = () => useThemeCtx();

export interface HapticsApi {
  tap: () => void;
  success: () => void;
  light: () => void;
  impact: () => void;
}

export function useHaptics(): HapticsApi {
  const tap = useCallback(() => {
    try { navigator.vibrate?.(12); } catch { /* Vibração é opcional. */ }
  }, []);
  const success = useCallback(() => {
    try { navigator.vibrate?.([18, 35, 18]); } catch { /* Vibração é opcional. */ }
  }, []);
  return useMemo(() => ({ tap, success, light: tap, impact: tap }), [tap, success]);
}

export function useDiasNaEstrada(): number {
  const { state } = useStore();
  const startDate = state.settings.startDate;
  return startDate ? Math.max(1, Math.floor((Date.now() - startDate) / 86_400_000) + 1) : 0;
}

export function useAlertCount(): number {
  const { state } = useStore();
  return Object.entries(state.minimos).filter(([id, minimo]) => {
    const item = state.items.find((candidate) => candidate.id === id);
    return Boolean(item && isBelowMinimum(item, minimo));
  }).length;
}
