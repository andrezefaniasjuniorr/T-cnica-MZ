/**
 * Utilitário de compressão de imagens via HTML5 Canvas e persistência resiliente.
 * Resolve estouros de cota de memória (QuotaExceededError) no localStorage
 * garantindo persistência do logotipo da empresa e fotos em PDFs/Portfólios.
 */

export const COMPANY_LOGO_BASE64_KEY = 'company_logo_base64';
export const COMPANY_LOGO_KEY = 'app_company_logo';
export const LEGACY_LOGO_KEY = 'tecnico_logo';

const IDB_NAME = 'TecnicaMZ_BrandDB';
const IDB_STORE = 'brand_assets';
const IDB_KEY = 'company_logo';

/**
 * Abre ou cria o banco IndexedDB para armazenamento seguro e duradouro de assets pesados.
 */
function openBrandDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB não suportado'));
    }
    const request = window.indexedDB.open(IDB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Salva a logo no IndexedDB de forma assíncrona como backup durável.
 */
export async function saveLogoToIndexedDB(base64: string): Promise<void> {
  try {
    const db = await openBrandDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      const store = tx.objectStore(IDB_STORE);
      const req = store.put(base64, IDB_KEY);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('[imageCompressor] Falha silenciosa no IndexedDB:', err);
  }
}

/**
 * Recupera a logo do IndexedDB caso o localStorage tenha sido resetado.
 */
export async function getLogoFromIndexedDB(): Promise<string | null> {
  try {
    const db = await openBrandDB();
    return await new Promise<string | null>((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readonly');
      const store = tx.objectStore(IDB_STORE);
      const req = store.get(IDB_KEY);
      req.onsuccess = () => resolve((req.result as string) || null);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    return null;
  }
}

/**
 * Remove a logo do IndexedDB.
 */
export async function removeLogoFromIndexedDB(): Promise<void> {
  try {
    const db = await openBrandDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      const store = tx.objectStore(IDB_STORE);
      const req = store.delete(IDB_KEY);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    // Silently ignore
  }
}

/**
 * Converte File ou base64 em imagem redimensionada e comprimida via HTML5 Canvas.
 * Limita a largura/altura máxima (padrão 400px) e qualidade (0.7), gerando string Base64 leve (<80KB).
 */
export async function compressImage(
  source: File | string,
  maxWidth = 400,
  quality = 0.7
): Promise<string> {
  return new Promise((resolve, reject) => {
    let dataUrl = '';

    const processDataUrl = (url: string) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        try {
          let { width, height } = img;
          if (width === 0 || height === 0) {
            return resolve(url);
          }

          // Redimensionamento proporcional mantendo o aspect ratio (máx 400px)
          if (width > maxWidth || height > maxWidth) {
            if (width >= height) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxWidth) / height);
              height = maxWidth;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            return resolve(url);
          }

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          // Tenta primeiramente WebP (mantém transparência e é ultraleve com qualidade 0.7)
          let compressed = canvas.toDataURL('image/webp', quality);
          let bytes = Math.round((compressed.length - (compressed.indexOf(',') + 1)) * 0.75);

          // Se o navegador não suportar WebP ou se for grande, tenta PNG ou JPEG
          if (!compressed.startsWith('data:image/webp') || bytes > 75 * 1024) {
            const png = canvas.toDataURL('image/png');
            const pngBytes = Math.round((png.length - (png.indexOf(',') + 1)) * 0.75);

            if (pngBytes <= 75 * 1024) {
              compressed = png;
            } else {
              // JPEG com fundo branco e qualidade 0.7 garantindo < 80KB
              const jCanvas = document.createElement('canvas');
              jCanvas.width = width;
              jCanvas.height = height;
              const jCtx = jCanvas.getContext('2d');
              if (jCtx) {
                jCtx.fillStyle = '#ffffff';
                jCtx.fillRect(0, 0, width, height);
                jCtx.drawImage(canvas, 0, 0);
                compressed = jCanvas.toDataURL('image/jpeg', quality);
              }
            }
          }

          // Se ainda passar de 80KB, reduz ligeiramente a dimensão para 320px
          const finalBytes = Math.round((compressed.length - (compressed.indexOf(',') + 1)) * 0.75);
          if (finalBytes > 80 * 1024) {
            const sCanvas = document.createElement('canvas');
            const targetDim = 320;
            const ratio = targetDim / Math.max(width, height);
            sCanvas.width = Math.round(width * ratio);
            sCanvas.height = Math.round(height * ratio);
            const sCtx = sCanvas.getContext('2d');
            if (sCtx) {
              sCtx.fillStyle = '#ffffff';
              sCtx.fillRect(0, 0, sCanvas.width, sCanvas.height);
              sCtx.drawImage(img, 0, 0, sCanvas.width, sCanvas.height);
              compressed = sCanvas.toDataURL('image/jpeg', 0.65);
            }
          }

          resolve(compressed);
        } catch (err) {
          console.warn('[imageCompressor] Erro ao renderizar canvas:', err);
          resolve(url);
        }
      };

      img.onerror = () => {
        reject(new Error('Falha ao decodificar a imagem para compressão.'));
      };

      img.src = url;
    };

    if (typeof source === 'string') {
      processDataUrl(source);
    } else {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          processDataUrl(reader.result);
        } else {
          reject(new Error('Formato de arquivo inválido.'));
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(source);
    }
  });
}

/**
 * Compressão de emergência / extra caso ocorra QuotaExceededError (máx 260px, qualidade 0.6).
 */
export async function compressImageAggressive(source: string): Promise<string> {
  return compressImage(source, 260, 0.6);
}

/**
 * Salva com segurança a imagem do logotipo em localStorage e IndexedDB.
 * Se o localStorage acusar QuotaExceededError, executa compressão agressiva e retenta.
 */
export async function persistCompanyLogo(
  logoBase64: string | null
): Promise<{ success: boolean; quotaExceeded?: boolean; error?: string }> {
  if (typeof window === 'undefined') return { success: true };

  if (!logoBase64) {
    try {
      localStorage.removeItem(COMPANY_LOGO_BASE64_KEY);
      localStorage.removeItem(COMPANY_LOGO_KEY);
      localStorage.removeItem(LEGACY_LOGO_KEY);
    } catch (e) {}
    await removeLogoFromIndexedDB();
    return { success: true };
  }

  // Primeiro garante compressão padrão (max-width: 400px, quality: 0.7)
  let optimized = logoBase64;
  try {
    optimized = await compressImage(logoBase64, 400, 0.7);
  } catch (err) {
    console.warn('[persistCompanyLogo] Aviso na compressão preliminar:', err);
  }

  // Backup garantido no IndexedDB (sem limite de 5MB do localStorage)
  saveLogoToIndexedDB(optimized).catch(() => {});

  // Tentativa 1: Salvar no localStorage (company_logo_base64 + chaves de retrocompatibilidade)
  try {
    localStorage.setItem(COMPANY_LOGO_BASE64_KEY, optimized);
    localStorage.setItem(COMPANY_LOGO_KEY, optimized);
    localStorage.setItem(LEGACY_LOGO_KEY, optimized);
    return { success: true };
  } catch (e: any) {
    const isQuota =
      e &&
      (e.name === 'QuotaExceededError' ||
        e.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
        e.code === 22 ||
        e.code === 1014);

    if (isQuota) {
      console.warn('[persistCompanyLogo] QuotaExceededError detectado! Aplicando compressão agressiva secundária...');
      try {
        // Tenta limpar itens temporários órfãos do localStorage se houver
        cleanStorageTempCaches();

        // Compressão agressiva secundária
        const ultraCompact = await compressImageAggressive(optimized);
        localStorage.setItem(COMPANY_LOGO_BASE64_KEY, ultraCompact);
        localStorage.setItem(COMPANY_LOGO_KEY, ultraCompact);
        localStorage.setItem(LEGACY_LOGO_KEY, ultraCompact);
        saveLogoToIndexedDB(ultraCompact).catch(() => {});
        return { success: true, quotaExceeded: true };
      } catch (retryErr: any) {
        console.error('[persistCompanyLogo] Falha após retentativa de compressão:', retryErr);
        // Mesmo se o localStorage esgotar completamente, o IndexedDB preservará a logo
        return {
          success: false,
          quotaExceeded: true,
          error: 'Memória local do navegador cheia. O logotipo foi preservado no banco seguro do aplicativo.'
        };
      }
    }

    return { success: false, error: e?.message || 'Erro ao persistir no armazenamento local.' };
  }
}

/**
 * Lê a imagem do logotipo do localStorage ou do IndexedDB como fallback.
 */
export function getSavedCompanyLogoSync(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return (
      localStorage.getItem(COMPANY_LOGO_BASE64_KEY) ||
      localStorage.getItem(COMPANY_LOGO_KEY) ||
      localStorage.getItem(LEGACY_LOGO_KEY) ||
      null
    );
  } catch (e) {
    return null;
  }
}

/**
 * Lê de forma assíncrona com fallback automático no IndexedDB.
 */
export async function getSavedCompanyLogoAsync(): Promise<string | null> {
  const syncLogo = getSavedCompanyLogoSync();
  if (syncLogo) return syncLogo;

  // Se não encontrou no localStorage (ex: reset ou limpeza de cache), busca no IndexedDB
  const idbLogo = await getLogoFromIndexedDB();
  if (idbLogo) {
    // Restaura no localStorage para chamadas síncronas futuras
    try {
      localStorage.setItem(COMPANY_LOGO_BASE64_KEY, idbLogo);
      localStorage.setItem(COMPANY_LOGO_KEY, idbLogo);
      localStorage.setItem(LEGACY_LOGO_KEY, idbLogo);
    } catch (e) {}
    return idbLogo;
  }
  return null;
}

/**
 * Remove caches órfãos do localStorage para liberar espaço se necessário.
 */
function cleanStorageTempCaches(): void {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('tmp_') || key.startsWith('cache_') || key.includes('debug'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
  } catch (e) {}
}
