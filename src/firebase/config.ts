import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase credentials for TécnicaMZ (andrejuniorr)
const metaEnv = (import.meta as unknown as { env?: Record<string, string> }).env || {};

export const firebaseConfig = {
  apiKey: metaEnv.VITE_FIREBASE_API_KEY || "AIzaSyBJmdpkP65kJa8gfoiPesLrqKM4WRtXKUw",
  authDomain: metaEnv.VITE_FIREBASE_AUTH_DOMAIN || "andrejuniorr.firebaseapp.com",
  projectId: metaEnv.VITE_FIREBASE_PROJECT_ID || "andrejuniorr",
  storageBucket: metaEnv.VITE_FIREBASE_STORAGE_BUCKET || "andrejuniorr.firebasestorage.app",
  messagingSenderId: metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || "320786830455",
  appId: metaEnv.VITE_FIREBASE_APP_ID || "1:320786830455:web:a06566764ab9153ba6a272"
};

export const isFirebaseConfigured = true;

let app: any = null;
let auth: any = null;
let db: any = null;
let storage: any = null;

try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
} catch (err) {
  console.warn('Firebase init notice:', err);
}

export { app, auth, db, storage };

