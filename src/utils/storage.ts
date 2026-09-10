/**
 * Safe LocalStorage Utilities to prevent uncaught exceptions on corrupted storage
 */

function cleanupStorageQuota(): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const keysToRemove: string[] = [];
    const heavyKeys = [
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
      'tecnicamz_users'
    ];

    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (!k) continue;

      // NUNCA remover chaves internas do Firestore, de autenticação ou de cache de sessão instantânea
      if (
        k.startsWith('firestore_') ||
        k.startsWith('firebase:') ||
        k === 'tecnicamz_cached_user' ||
        k === 'tecnicamz_last_route' ||
        k === 'tecnicamz_auth_user_id' ||
        k === 'tecnicamz_cached_tech_profile' ||
        k === 'tecnicamz_cached_company_profile'
      ) continue;

      if (heavyKeys.some((h) => k === h || k.startsWith(h))) {
        keysToRemove.push(k);
        continue;
      }

      // Se valor for muito grande (> 25KB) e não for essencial
      try {
        const val = window.localStorage.getItem(k);
        if (val && val.length > 25000) {
          keysToRemove.push(k);
        }
      } catch {
        // no-op
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
    const serialized = JSON.stringify(value);
    // Não salvar objetos gigantes (> 40KB) no localStorage para proteger a cota de 5MB
    // Dados extensos são geridos pelo Firestore via persistentLocalCache (IndexedDB)
    if (serialized.length > 40000) {
      return;
    }
    window.localStorage.setItem(key, serialized);
  } catch (err: any) {
    // Tratamento robusto para QuotaExceededError
    if (
      err?.name === 'QuotaExceededError' ||
      err?.code === 22 ||
      err?.number === -2147024882 ||
      String(err).includes('quota')
    ) {
      cleanupStorageQuota();
      try {
        const serialized = JSON.stringify(value);
        if (serialized.length <= 30000) {
          window.localStorage.setItem(key, serialized);
        }
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
