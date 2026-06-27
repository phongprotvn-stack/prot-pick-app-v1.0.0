import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AppProvider } from './context/AppContext';
import ErrorBoundary from './components/ErrorBoundary';
import App from './App.tsx';
import './index.css';

// ── PWA Service Worker: force reload when new version detected ──
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      // Check for updates every 60 seconds
      setInterval(() => { reg.update(); }, 60000);
      reg.addEventListener('updatefound', () => {
        const newSW = reg.installing;
        if (!newSW) return;
        let reloaded = false;
        newSW.addEventListener('statechange', () => {
          if (newSW.state === 'installed' && navigator.serviceWorker.controller && !reloaded) {
            reloaded = true;
            window.location.reload();
          }
        });
      });
    } catch {
      // SW registration failed, continue without offline support
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <AppProvider>
        <App />
      </AppProvider>
    </ErrorBoundary>
  </StrictMode>,
);
