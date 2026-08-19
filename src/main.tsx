import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { Capacitor } from '@capacitor/core';
import './index.css';
createRoot(document.getElementById('root')!).render(
  <StrictMode><App /></StrictMode>
);


if (import.meta.env.PROD && !Capacitor.isNativePlatform() && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch((error) => {
      console.warn('[pwa] Não foi possível registrar o modo offline:', error);
    });
  });
}
