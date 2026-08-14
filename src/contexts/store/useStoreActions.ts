import { useMemo, type Dispatch } from 'react';
import { StorageService } from '../../services/storage.service';
import type { Action } from '../../store/actions';
import type { StoreActions } from './store.types';

export function useStoreActions(dispatch: Dispatch<Action>): StoreActions {
  return useMemo(() => ({
    addItem: payload => dispatch({ type:'ADD_ITEM', payload }),
    updateItem: payload => dispatch({ type:'UPDATE_ITEM', payload }),
    deleteItem: id => dispatch({ type:'DELETE_ITEM', payload:id }),
    toggle: id => dispatch({ type:'TOGGLE', payload:id }),
    adjustQty: (id, delta) => dispatch({ type:'ADJUST_QTY', payload:{ id, delta } }),
    updatePrice: (id, price) => dispatch({ type:'UPDATE_PRICE', payload:{ id, price } }),
    setFilter: filter => dispatch({ type:'SET_FILTER', payload:filter }),
    setSort: sort => dispatch({ type:'SET_SORT', payload:sort }),
    setPage: page => dispatch({ type:'SET_PAGE', payload:page }),
    setModo: modo => dispatch({ type:'SET_MODO', payload:modo }),
    toggleCheck: (modoId, itemId) => dispatch({ type:'TOGGLE_CHECK', payload:{ modoId, itemId } }),
    resetChecks: modoId => dispatch({ type:'RESET_CHECKS', payload:modoId }),
    addEntrada: entry => dispatch({ type:'ADD_ENTRADA', payload:entry }),
    delEntrada: id => dispatch({ type:'DEL_ENTRADA', payload:id }),
    addPonto: ponto => dispatch({ type:'ADD_PONTO', payload:ponto }),
    delPonto: id => dispatch({ type:'DEL_PONTO', payload:id }),
    updPonto: ponto => dispatch({ type:'UPD_PONTO', payload:ponto }),
    setMinimos: minimos => dispatch({ type:'SET_MINIMOS', payload:minimos }),
    setSettings: settings => dispatch({ type:'SET_SETTINGS', payload:settings }),
    setNota: nota => dispatch({ type:'SET_NOTA', payload:nota }),
    restorePersistedState: async data => {
      // Grava o snapshot inteiro em uma única transação antes de atualizar a UI.
      await StorageService.saveSnapshot(data);
      dispatch({ type:'RESTORE_PERSISTED', payload:data });
    },
    toggleFavoritoDica: id => dispatch({ type:'TOGGLE_FAVORITO_DICA', payload:id }),
    toggleFavoritoTutorial: id => dispatch({ type:'TOGGLE_FAVORITO_TUTORIAL', payload:id }),
    toggleHabilidade: id => dispatch({ type:'TOGGLE_HABILIDADE', payload:id }),
    setManualBikeAlvo: alvo => dispatch({ type:'SET_MANUAL_BIKE_ALVO', payload:alvo }),
  }), [dispatch]);
}
