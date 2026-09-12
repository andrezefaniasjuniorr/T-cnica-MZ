/**
 * Utilitários de conversão e cálculo de datas para sincronização segura com Firestore e ISO strings
 */

export const parseDateToMillis = (val: any): number => {
  if (!val) return 0;
  if (typeof val === 'number') return val;
  if (typeof val.toMillis === 'function') {
    try {
      return val.toMillis();
    } catch {
      // fallback
    }
  }
  if (typeof val.toDate === 'function') {
    try {
      return val.toDate().getTime();
    } catch {
      // fallback
    }
  }
  if (typeof val === 'object' && typeof val.seconds === 'number') {
    return val.seconds * 1000 + (val.nanoseconds ? Math.floor(val.nanoseconds / 1e6) : 0);
  }
  if (typeof val === 'string') {
    const ms = new Date(val).getTime();
    if (!isNaN(ms)) return ms;
  }
  return 0;
};

export const parseDateToIso = (val: any): string => {
  if (!val) return new Date().toISOString();
  if (typeof val === 'string') {
    const d = new Date(val);
    if (!isNaN(d.getTime())) return d.toISOString();
    return val;
  }
  const ms = parseDateToMillis(val);
  if (ms > 0) return new Date(ms).toISOString();
  return new Date().toISOString();
};

export const THREE_DAYS_MS = 259200000; // 3 * 24 * 60 * 60 * 1000 ms
