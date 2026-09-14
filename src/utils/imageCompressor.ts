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
 * Converte File ou base64 em imagem redimensionada e processada via HTML5 Canvas em alta definição.
 * Utiliza largura máxima entre 800px-1000px (padrão 900px) e formato PNG (preservando transparência,
 * textos nítidos e traços de marca) ou JPEG com qualidade 0.92 para garantir máxima nitidez nos PDFs.
 */
export async function compressImage(
  source: File | string,
  maxWidth = 900,
  quality = 0.92
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

          // Redimensionamento proporcional rigorosamente mantendo o aspect ratio (máx 800px-1000px)
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
          const ctx = canvas.getContext('2d', { alpha: true });
          if (!ctx) {
            return resolve(url);
          }

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          // 1. Gera inicialmente como PNG para preservar 100% de transparência e bordas vetoriais nítidas
          const pngOutput = canvas.toDataURL('image/png');
          const pngBytes = Math.round((pngOutput.length - (pngOutput.indexOf(',') + 1)) * 0.75);

          // Se for imagem razoável (< 450KB), utiliza o PNG com fidelidade total
          if (pngBytes <= 450 * 1024) {
            return resolve(pngOutput);
          }

          // 2. Para imagens fotográficas muito pesadas sem canal alfa, gera JPEG com qualidade 0.92
          const jCanvas = document.createElement('canvas');
          jCanvas.width = width;
          jCanvas.height = height;
          const jCtx = jCanvas.getContext('2d');
          if (jCtx) {
            jCtx.fillStyle = '#ffffff';
            jCtx.fillRect(0, 0, width, height);
            jCtx.drawImage(canvas, 0, 0);
            const jpegOutput = jCanvas.toDataURL('image/jpeg', quality);
            return resolve(jpegOutput);
          }

          resolve(pngOutput);
        } catch (err) {
          console.warn('[imageCompressor] Erro ao processar canvas:', err);
          resolve(url);
        }
      };

      img.onerror = () => {
        reject(new Error('Falha ao decodificar a imagem para processamento.'));
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
 * Compressão de emergência secundária caso ocorra QuotaExceededError (máx 750px, qualidade 0.88).
 */
export async function compressImageAggressive(source: string): Promise<string> {
  return compressImage(source, 750, 0.88);
}

/**
 * Salva com segurança a imagem do logotipo em localStorage sob a chave 'company_logo_base64' e IndexedDB.
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

  // Backup seguro e de alta resolução no IndexedDB
  saveLogoToIndexedDB(logoBase64).catch(() => {});

  // Gravação direta no localStorage nas chaves oficiais
  try {
    localStorage.setItem(COMPANY_LOGO_BASE64_KEY, logoBase64);
    localStorage.setItem(COMPANY_LOGO_KEY, logoBase64);
    localStorage.setItem(LEGACY_LOGO_KEY, logoBase64);
    return { success: true };
  } catch (e: any) {
    const isQuota =
      e &&
      (e.name === 'QuotaExceededError' ||
        e.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
        e.code === 22 ||
        e.code === 1014);

    if (isQuota) {
      console.warn('[persistCompanyLogo] QuotaExceededError detectado! Otimizando com preservação de nitidez...');
      try {
        cleanStorageTempCaches();

        const optimized = await compressImageAggressive(logoBase64);
        localStorage.setItem(COMPANY_LOGO_BASE64_KEY, optimized);
        localStorage.setItem(COMPANY_LOGO_KEY, optimized);
        localStorage.setItem(LEGACY_LOGO_KEY, optimized);
        saveLogoToIndexedDB(optimized).catch(() => {});
        return { success: true, quotaExceeded: true };
      } catch (retryErr: any) {
        console.warn('[persistCompanyLogo] Logotipo preservado com segurança no IndexedDB.');
        return {
          success: true,
          quotaExceeded: true
        };
      }
    }

    return { success: false, error: e?.message || 'Erro ao persistir no armazenamento local.' };
  }
}

/**
 * Validação estrita para o motor de renderização do pdfMake.
 * O pdfMake exige obrigatoriamente strings no formato DataURL PNG ou JPEG.
 * Formatos como WebP, SVG ou strings incompletas disparam o erro:
 * "Invalid image: Error: Unknown image format. Images dictionary should contain dataURL entries"
 */
export function isPdfCompatibleImage(dataUrl: string | null | undefined): boolean {
  if (!dataUrl || typeof dataUrl !== 'string') return false;
  const trimmed = dataUrl.trim();
  const match = trimmed.match(/^data:image\/(?:png|jpeg|jpg);base64,([A-Za-z0-9+/=]+)/);
  if (!match || !match[1] || match[1].length < 24) return false;
  try {
    const b64Header = match[1].slice(0, 32);
    let binary = '';
    if (typeof atob === 'function') {
      binary = atob(b64Header);
    } else if (typeof Buffer !== 'undefined') {
      binary = Buffer.from(b64Header, 'base64').toString('binary');
    } else {
      return trimmed.startsWith('data:image/png;base64,') || trimmed.startsWith('data:image/jpeg;base64,');
    }
    if (binary.length < 4) return false;
    const b0 = binary.charCodeAt(0);
    const b1 = binary.charCodeAt(1);
    const b2 = binary.charCodeAt(2);
    const b3 = binary.charCodeAt(3);
    const isJpeg = (b0 === 0xff && b1 === 0xd8);
    const isPng = (b0 === 0x89 && b1 === 0x50 && b2 === 0x4e && b3 === 0x47);
    return isJpeg || isPng;
  } catch (e) {
    return false;
  }
}

/**
 * Lê a imagem do logotipo do localStorage ou do IndexedDB como fallback.
 * Se a imagem salva for de formato incompatível com pdfMake (ex: WebP herdado),
 * inicia migração automática para PNG em background e retorna null temporariamente
 * para não quebrar a geração de PDFs.
 */
export function getSavedCompanyLogoSync(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = (
      localStorage.getItem(COMPANY_LOGO_BASE64_KEY) ||
      localStorage.getItem(COMPANY_LOGO_KEY) ||
      localStorage.getItem(LEGACY_LOGO_KEY) ||
      null
    );
    if (!raw) return null;

    // Se já for PNG ou JPEG com formato válido, retorna imediatamente
    if (isPdfCompatibleImage(raw)) {
      return raw;
    }

    // Se for WebP ou formato legado, converte para PNG e atualiza silenciosamente o storage
    if (raw.startsWith('data:image/') || raw.startsWith('blob:')) {
      compressImage(raw, 900, 0.92).then(converted => {
        if (isPdfCompatibleImage(converted)) {
          persistCompanyLogo(converted).catch(() => {});
        }
      }).catch(() => {});
    }

    return null;
  } catch (e) {
    return null;
  }
}

/**
 * Lê de forma assíncrona com fallback automático no IndexedDB e conversão para PNG garantida.
 */
export async function getSavedCompanyLogoAsync(): Promise<string | null> {
  let rawLogo: string | null = null;
  if (typeof window !== 'undefined') {
    try {
      rawLogo = (
        localStorage.getItem(COMPANY_LOGO_BASE64_KEY) ||
        localStorage.getItem(COMPANY_LOGO_KEY) ||
        localStorage.getItem(LEGACY_LOGO_KEY) ||
        null
      );
    } catch (e) {}
  }

  if (!rawLogo) {
    rawLogo = await getLogoFromIndexedDB();
  }

  if (!rawLogo) return null;

  if (isPdfCompatibleImage(rawLogo)) {
    return rawLogo;
  }

  // Se não estiver em formato PNG/JPEG compatível com pdfMake, converte agora
  try {
    const converted = await compressImage(rawLogo, 900, 0.92);
    if (isPdfCompatibleImage(converted)) {
      await persistCompanyLogo(converted);
      return converted;
    }
  } catch (e) {
    console.warn('[imageCompressor] Falha ao converter imagem legada para formato PNG compatível:', e);
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
