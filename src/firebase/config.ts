import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, initializeFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseAppletConfig from '../../firebase-applet-config.json';

// Firebase credentials for TécnicaMZ
const metaEnv = (import.meta as unknown as { env?: Record<string, string> }).env || {};

export const firebaseConfig = {
  apiKey: metaEnv.VITE_FIREBASE_API_KEY || firebaseAppletConfig.apiKey,
  authDomain: metaEnv.VITE_FIREBASE_AUTH_DOMAIN || firebaseAppletConfig.authDomain,
  projectId: metaEnv.VITE_FIREBASE_PROJECT_ID || firebaseAppletConfig.projectId,
  storageBucket: metaEnv.VITE_FIREBASE_STORAGE_BUCKET || firebaseAppletConfig.storageBucket,
  messagingSenderId: metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseAppletConfig.messagingSenderId,
  appId: metaEnv.VITE_FIREBASE_APP_ID || firebaseAppletConfig.appId,
};

export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

const databaseId = firebaseAppletConfig.firestoreDatabaseId && firebaseAppletConfig.firestoreDatabaseId !== '(default)'
  ? firebaseAppletConfig.firestoreDatabaseId
  : undefined;

let app: any = null;
let auth: any = null;
let db: any = null;
let storage: any = null;

try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  try {
    const firestoreSettings = {
      experimentalAutoDetectLongPolling: true,
    };
    db = databaseId
      ? initializeFirestore(app, firestoreSettings, databaseId)
      : initializeFirestore(app, firestoreSettings);
  } catch (_initErr) {
    db = databaseId ? getFirestore(app, databaseId) : getFirestore(app);
  }
  storage = getStorage(app);
} catch (err) {
  console.warn('Firebase init notice:', err);
}

export { app, auth, db, storage };

