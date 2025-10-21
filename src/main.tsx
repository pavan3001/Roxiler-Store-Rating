import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Debug: print resolved API base used by the built frontend (Vite injects VITE_API_BASE_URL)
try {
  // Match resolution logic from src/utils/api.ts
  const explicitBase = import.meta.env.VITE_API_BASE_URL;
  const isProd = import.meta.env.PROD;
  const apiBase = explicitBase ? explicitBase : isProd ? 'https://roxiler-store-rating-raiq.onrender.com/api' : '/api';
  // Log to console so we can verify on deployed site what API URL the build is using
  console.log('Resolved API base at startup:', apiBase);
} catch {
  // ignore in environments that don't support import.meta
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
