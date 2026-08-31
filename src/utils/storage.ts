/**
 * Safe LocalStorage Utilities to prevent uncaught exceptions on corrupted storage
 */

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
  } catch (err) {
    console.warn(`[LocalStorage] Failed to save key "${key}".`, err);
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
