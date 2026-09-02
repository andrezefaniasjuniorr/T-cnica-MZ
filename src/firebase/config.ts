import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
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

// 1. INICIALIZAÇÃO CORRETA DOS SERVIÇOS (Firebase SDK v9+)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };


