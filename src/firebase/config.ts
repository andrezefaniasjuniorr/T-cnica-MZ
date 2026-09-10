import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  setLogLevel,
  Firestore
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

// Proteção universal contra QuotaExceededError no localStorage e limpeza preventiva de dados pesados
if (typeof window !== 'undefined' && window.localStorage) {
  try {
    // 1. Limpeza preventiva de dados pesados e obsoletos que estouram a cota de 5MB do localStorage
    // Nota: NUNCA remover chaves do Firestore ('firestore_') ou de autenticação ('firebase:authUser')
    const keysToRemove: string[] = [];
    const heavyPrefixes = [
      'tecnicamz_stories',
      'tecnicamz_portfolio',
      'tecnicamz_market',
      'tecnicamz_community_posts',
      'tecnicamz_admin_logs',
      'tecnicamz_messages',
      'tecnicamz_conversations',
      'tecnicamz_technicians',
      'tecnicamz_companies',
      'tecnicamz_reports',
      'tecnicamz_requests',
      'tecnicamz_proposals',
      'tecnicamz_reviews',
      'tecnicamz_job_applications',
      'tecnicamz_jobs',
      'tecnicamz_payments',
      'tecnicamz_users',
      'tecnicamz_solicitacoes_selo'
    ];

    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (!k) continue;

      // Se for uma coleção pesada antiga (que agora é persistida no IndexedDB via Firestore persistentLocalCache)
      const isHeavy = heavyPrefixes.some(p => k === p || k.startsWith(p));
      if (isHeavy) {
        keysToRemove.push(k);
        continue;
      }

      // Se qualquer valor individual não essencial ultrapassar 30KB
      if (
        !k.startsWith('firestore_') &&
        !k.startsWith('firebase:') &&
        k !== 'tecnicamz_cached_user' &&
        k !== 'tecnicamz_last_route' &&
        k !== 'tecnicamz_auth_user_id' &&
        k !== 'tecnicamz_cached_tech_profile' &&
        k !== 'tecnicamz_cached_company_profile'
      ) {
        try {
          const val = window.localStorage.getItem(k);
          if (val && val.length > 30000) {
            keysToRemove.push(k);
          }
        } catch {
          // no-op
        }
      }
    }

    keysToRemove.forEach(k => {
      try {
        window.localStorage.removeItem(k);
      } catch {
        // no-op
      }
    });

    // 2. Interceptor de segurança em window.localStorage.setItem
    // Garante que se o Firestore (persistentMultipleTabManager) ou qualquer componente atingir cota,
    // o erro de cota seja recuperado liberando espaço e não quebre a asserção interna do Firestore (ID: b815).
    const originalSetItem = window.localStorage.setItem.bind(window.localStorage);
    window.localStorage.setItem = function (key: string, value: string) {
      try {
        originalSetItem(key, value);
      } catch (err: any) {
        const isQuota =
          err?.name === 'QuotaExceededError' ||
          err?.code === 22 ||
          err?.code === 1014 ||
          err?.number === -2147024882 ||
          String(err).toLowerCase().includes('quota');

        if (isQuota) {
          // Purgar chaves pesadas imediatamente para liberar bytes
          try {
            for (let i = 0; i < window.localStorage.length; i++) {
              const k = window.localStorage.key(i);
              if (k && !k.startsWith('firestore_') && !k.startsWith('firebase:')) {
                if (k.startsWith('tecnicamz_') || k.startsWith('sara_chat_')) {
                  window.localStorage.removeItem(k);
                }
              }
            }
          } catch {
            // no-op
          }

          try {
            // Tentar novamente após esvaziar
            originalSetItem(key, value);
            return;
          } catch (retryErr) {
            // Se ainda assim falhar:
            // Para chaves do Firestore (ex: sequence number, targets), engolir o erro
            // para evitar a asserção fatal do SDK que derruba o app
            if (key.startsWith('firestore_') || key.startsWith('firebase:')) {
              console.warn('[Storage] QuotaExceededError absorvido com segurança para chave Firestore:', key);
              return;
            }
            // Para outras chaves, não interromper a execução do app
            console.warn('[Storage] Falha ao salvar no localStorage por cota:', key);
            return;
          }
        }
        throw err;
      }
    };
  } catch (err) {
    console.warn('[Storage] Aviso na inicialização da proteção de armazenamento:', err);
  }
}

// 1. INICIALIZAÇÃO CORRETA DOS SERVIÇOS (Firebase SDK v9+)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

// Configuração de persistência de autenticação para browserLocalPersistence (garante acesso sem internet)
if (typeof window !== 'undefined') {
  setPersistence(auth, browserLocalPersistence).catch((err) => {
    console.warn('[FirebaseAuth] Erro ao configurar persistência local da sessão:', err);
  });
}

// 2. Inicializar Firestore com cache offline persistente com suporte a múltiplas abas (persistentLocalCache)
// Envolvido obrigatoriamente em try/catch para fallback automático para getFirestore caso a persistência ou IndexedDB falhem
let dbInstance: Firestore;
try {
  dbInstance = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager()
    })
  });
} catch (err) {
  console.warn('[Firestore] Falha ao inicializar com persistentLocalCache, realizando fallback automático para getFirestore:', err);
  try {
    dbInstance = getFirestore(app);
  } catch (fallbackErr) {
    console.error('[Firestore] Falha crítica no fallback getFirestore:', fallbackErr);
    dbInstance = getFirestore(app);
  }
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



