import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import {
  getFirestore,
  initializeFirestore,
  memoryLocalCache,
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

// Limpeza preventiva de chaves órfãs do Firestore que sobrecarregavam o localStorage
if (typeof window !== 'undefined' && window.localStorage) {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (
        k &&
        (k.startsWith('firestore_') ||
          k.startsWith('firestore:') ||
          k.startsWith('firebase:firestore:'))
      ) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach(k => {
      try {
        window.localStorage.removeItem(k);
      } catch {
        // no-op
      }
    });
  } catch {
    // no-op
  }
}

// 1. INICIALIZAÇÃO CORRETA DOS SERVIÇOS (Firebase SDK v9+)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

// 1. Definir explicitamente a persistência de autenticação do usuário para browserLocalPersistence
if (typeof window !== 'undefined') {
  setPersistence(auth, browserLocalPersistence).catch((err) => {
    console.warn('[FirebaseAuth] Erro ao configurar persistência local da sessão:', err);
  });
}

// 2. Inicializar Firestore com cache em memória (memoryLocalCache)
// Isso evita que o Firestore use WebStorageSharedClientState (window.localStorage),
// eliminando completamente o QuotaExceededError e falhas de asserção interna.
let dbInstance;
try {
  dbInstance = initializeFirestore(app, {
    localCache: memoryLocalCache()
  });
} catch (err) {
  console.warn('[Firestore] Falha ao inicializar com memoryLocalCache, fallback para getFirestore:', err);
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



