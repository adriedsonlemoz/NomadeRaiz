import { useCallback, useMemo } from 'react';
import { useTheme as useThemeCtx } from '../contexts/ThemeContext';
import { useStore } from '../contexts/StoreContext';
export const useTheme=()=>useThemeCtx();
export function useHaptics(){
 const tap=useCallback(()=>{try{navigator.vibrate?.(12)}catch{}},[]);
 const success=useCallback(()=>{try{navigator.vibrate?.([18,35,18])}catch{}},[]);
 return useMemo(()=>({tap,success,light:tap,impact:tap}),[tap,success]);
}
export function useDiasNaEstrada(){const {state}=useStore(); const s=state.settings.startDate; return s?Math.max(1,Math.floor((Date.now()-s)/86400000)+1):0;}
export function useAlertCount(){const {state}=useStore(); return Object.entries(state.minimos||{}).filter(([id,min])=>{const i=state.items.find(x=>x.id===id); return i && Number(i.quantity||0)<Number(min||0)}).length;}
