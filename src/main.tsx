import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Progressive Web App (PWA) Service Worker Lifecycle Management
if ('serviceWorker' in navigator) {
  if (import.meta.env.DEV) {
    // In development mode, aggressively unregister any existing service workers and clear caches
    // so Vite's on-the-fly ESM transforms, HMR, and dependency pre-bundling are never intercepted.
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister().then(() => {
          console.log('[PWA-Dev] Unregistered active dev service worker:', registration.scope);
        });
      }
    }).catch(() => {});

    if ('caches' in window) {
      caches.keys().then((keys) => {
        keys.forEach((key) => {
          if (key.startsWith('daleelak-')) {
            caches.delete(key);
          }
        });
      }).catch(() => {});
    }
  } else {
    // Production PWA Service Worker Registration
    const registerSW = () => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('[PWA] Service Worker registered with scope:', registration.scope);
          // Proactively check for updates
          registration.update().catch(() => {});

          // Check for updates automatically
          registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (installingWorker) {
              installingWorker.onstatechange = () => {
                if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('[PWA] New update available! Reloading for fresh version.');
                  installingWorker.postMessage({ type: 'SKIP_WAITING' });
                }
              };
            }
          };
        })
        .catch((err) => {
          console.warn('[PWA] Service Worker registration failed:', err);
        });
    };

    if (document.readyState === 'complete') {
      registerSW();
    } else {
      window.addEventListener('load', registerSW);
    }
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
