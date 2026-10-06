/**
 * Módulo de Controle dos 3 Dias Grátis & Bloqueio por Dispositivo (TécnicaMZ Pro)
 * 
 * Fuso horário: Africa/Maputo (UTC+2)
 * Regra: A virada de dia só acontece após 24h completas (1000 * 60 * 60 * 24 ms).
 * Fórmula: diasRestantes = 3 - floor((agora - trialStart) / (1000*60*60*24))
 * Quando diasRestantes <= 0: temAcessoTrial = false, trialExpirado = true.
 */

export const TRIAL_USED_LOCAL_STORAGE_KEY = 'tecnicaMZ_trial_usado';
const IDB_NAME = 'tecnicaMZ_device_db';
const IDB_STORE = 'device_flags';
const IDB_KEY_TRIAL = 'jaTeveTrial';

export interface TrialCalculationResult {
  diasRestantes: number;
  temAcessoTrial: boolean;
  trialExpirado: boolean;
  startMs: number | null;
}

/**
 * Converte qualquer formato de data/timestamp do Firestore para epoch em milissegundos
 */
export function parseTrialStartToMillis(trialStartInput: any): number | null {
  if (!trialStartInput) return null;

  try {
    // Firestore Timestamp instance com toDate()
    if (typeof trialStartInput.toDate === 'function') {
      const d = trialStartInput.toDate();
      const ms = d.getTime();
      return isNaN(ms) ? null : ms;
    }

    // Firestore Timestamp em formato { seconds, nanoseconds }
    if (typeof trialStartInput.seconds === 'number') {
      const ms = trialStartInput.seconds * 1000 + Math.floor((trialStartInput.nanoseconds || 0) / 1e6);
      return isNaN(ms) ? null : ms;
    }

    // Objeto Date padrão
    if (trialStartInput instanceof Date) {
      const ms = trialStartInput.getTime();
      return isNaN(ms) ? null : ms;
    }

    // Número direto (ms)
    if (typeof trialStartInput === 'number' && !isNaN(trialStartInput) && trialStartInput > 0) {
      return trialStartInput;
    }

    // String ISO ou data serializada
    if (typeof trialStartInput === 'string' && trialStartInput.trim()) {
      const ms = Date.parse(trialStartInput);
      return isNaN(ms) ? null : ms;
    }
  } catch (err) {
    console.warn('[Trial] Erro ao interpretar data trialStart:', err);
  }

  return null;
}

/**
 * Calcula os dias restantes do período de teste de 3 dias
 * diasRestantes = 3 - floor((agora - trialStart) / (1000*60*60*24))
 * Virada de dia somente após 24h completas.
 */
export function calcularDiasRestantesTrial(trialStartInput: any): TrialCalculationResult {
  if (!trialStartInput) {
    return {
      diasRestantes: 0,
      temAcessoTrial: false,
      trialExpirado: true,
      startMs: null
    };
  }

  const startMs = parseTrialStartToMillis(trialStartInput);
  if (!startMs || startMs <= 0) {
    return {
      diasRestantes: 0,
      temAcessoTrial: false,
      trialExpirado: true,
      startMs: null
    };
  }

  const agora = Date.now();
  const diffMs = agora - startMs;

  // Se agora for menor que startMs por clock skew ínfimo, não desconta nada
  const elapsedMs = Math.max(0, diffMs);
  const ONE_DAY_MS = 1000 * 60 * 60 * 24; // 86.400.000 ms

  const diasPassados = Math.floor(elapsedMs / ONE_DAY_MS);
  const diasRestantes = Math.max(0, 3 - diasPassados);

  const temAcessoTrial = diasRestantes > 0;
  const trialExpirado = diasRestantes <= 0;

  return {
    diasRestantes,
    temAcessoTrial,
    trialExpirado,
    startMs
  };
}

/**
 * Abre o banco IndexedDB local de dispositivo
 */
function openDeviceIndexedDB(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      resolve(null);
      return;
    }

    try {
      const request = window.indexedDB.open(IDB_NAME, 1);
      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(IDB_STORE)) {
          db.createObjectStore(IDB_STORE);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

/**
 * Lê do IndexedDB se o dispositivo já teve trial
 */
export async function getIndexedDBTrialUsed(): Promise<boolean> {
  try {
    const db = await openDeviceIndexedDB();
    if (!db) return false;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(IDB_STORE, 'readonly');
        const store = tx.objectStore(IDB_STORE);
        const req = store.get(IDB_KEY_TRIAL);
        req.onsuccess = () => resolve(req.result === true);
        req.onerror = () => resolve(false);
      } catch {
        resolve(false);
      }
    });
  } catch {
    return false;
  }
}

/**
 * Grava no IndexedDB que o dispositivo já usou o trial
 */
export async function setIndexedDBTrialUsed(): Promise<void> {
  try {
    const db = await openDeviceIndexedDB();
    if (!db) return;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(IDB_STORE, 'readwrite');
        const store = tx.objectStore(IDB_STORE);
        store.put(true, IDB_KEY_TRIAL);
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  } catch {}
}

/**
 * Verifica de forma síncrona se o dispositivo já usou o trial
 */
export function checkDeviceTrialUsed(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(TRIAL_USED_LOCAL_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

/**
 * Verifica de forma assíncrona (localStorage + IndexedDB) se o dispositivo já usou o trial
 */
export async function checkDeviceTrialUsedAsync(): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  // 1. Checa localStorage imediato
  try {
    if (localStorage.getItem(TRIAL_USED_LOCAL_STORAGE_KEY) === 'true') {
      return true;
    }
  } catch {}

  // 2. Checa IndexedDB persistente
  const fromIDB = await getIndexedDBTrialUsed();
  if (fromIDB) {
    try {
      localStorage.setItem(TRIAL_USED_LOCAL_STORAGE_KEY, 'true');
    } catch {}
    return true;
  }

  return false;
}

/**
 * Marca o celular como já tendo usado o período grátis de 3 dias
 */
export async function markDeviceTrialUsed(): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(TRIAL_USED_LOCAL_STORAGE_KEY, 'true');
  } catch {}

  try {
    await setIndexedDBTrialUsed();
  } catch {}
}
