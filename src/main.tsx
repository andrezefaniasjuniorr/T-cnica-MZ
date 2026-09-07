import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './services/engagement';
import './services/admin';
import { registerPWA } from './pwaRegister';

// Inicializa o Service Worker do PWA para suporte offline
registerPWA();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
