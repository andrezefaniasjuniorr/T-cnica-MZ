/**
 * Safe LocalStorage Utilities to prevent uncaught exceptions on corrupted storage
 */

function cleanupStorageQuota(): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (
        k &&
        (k.startsWith('firestore_') ||
          k.startsWith('tecnicamz_admin_logs') ||
          k.startsWith('tecnicamz_stories') ||
          k.startsWith('sara_chat_history_'))
      ) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach((k) => {
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

export function safeGetStorageItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.warn(`[LocalStorage] Failed to parse key "${key}", using default.`, err);
    return defaultValue;
  }
}

export function safeSetStorageItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (err: any) {
    // Tratamento robusto para QuotaExceededError
    if (
      err?.name === 'QuotaExceededError' ||
      err?.code === 22 ||
      err?.number === -2147024882 ||
      String(err).includes('quota')
    ) {
      console.warn(`[LocalStorage] Cota de armazenamento atingida ao salvar "${key}". Limpando chaves temporárias...`);
      cleanupStorageQuota();
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
      } catch {
        // Falha graciosa sem interromper o funcionamento do aplicativo
      }
    } else {
      console.warn(`[LocalStorage] Failed to save key "${key}".`, err);
    }
  }
}

export function safeRemoveStorageItem(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(key);
  } catch (err) {
    console.warn(`[LocalStorage] Failed to remove key "${key}".`, err);
  }
}
