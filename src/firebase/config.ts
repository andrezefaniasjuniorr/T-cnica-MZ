import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  setLogLevel
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

export const firebaseConfig = {
  apiKey: "AIzaSyBJmdpkP65kJa8gfoiPesLrqKM4WRtXKUw",
  authDomain: "andrejuniorr.firebaseapp.com",
  databaseURL: "https://andrejuniorr-default-rtdb.firebaseio.com",
  projectId: "andrejuniorr",
  storageBucket: "andrejuniorr.firebasestorage.app",
  messagingSenderId: "320786830455",
  appId: "1:320786830455:web:a06566764ab9153ba6a272",
  measurementId: "G-HFQ3LSTQ7C"
};

export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

// Suprimir logs informativos/debug de sincronização interna e clock drift do Firestore
try {
  setLogLevel('error');
} catch {
  // no-op
}

// 1. INICIALIZAÇÃO CORRETA DOS SERVIÇOS (Firebase SDK v9+)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

// Inicializar Firestore com cache persistente multi-aba moderno
let dbInstance;
try {
  dbInstance = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager()
    })
  });
} catch {
  dbInstance = getFirestore(app);
}

const db = dbInstance;
const storage = getStorage(app);

if (typeof window !== 'undefined' && db) {
  // Disponibilizar globalmente para utilitários e depuração segura
  (window as any).firebaseApp = app;
  (window as any).db = db;
  (window as any).auth = auth;
  (window as any).storage = storage;
}

export { app, auth, db, storage };



