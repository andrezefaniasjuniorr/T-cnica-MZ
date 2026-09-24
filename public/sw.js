// Service Worker Oficial - TécnicaMZ Pro (PWA Offline)
const CACHE_NAME = 'tecnicamz-pro-v2';
const OFFLINE_URL = '/';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/styles.css',
  '/icon.svg',
  '/favicon.ico',
  '/apple-touch-icon.png',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/pwa-maskable-512x512.png',
  '/tecnica_mz_slogan.jpg'
];

// 1. AUTO-UPDATE DE CACHE: Força skipWaiting no install
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[TécnicaMZ SW] Precaching offline resources & engineering tools...');
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[TécnicaMZ SW] Some assets could not be precached on install:', err);
      });
    })
  );
});

// 2. INVALIDAÇÃO INSTANTÂNEA: Deleta todos os caches antigos e assume o controle com clients.claim()
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[TécnicaMZ SW] Invalidando e removendo cache residual antigo:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Listener para comando manual de SKIP_WAITING caso solicitado pelo app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Fetch: Network-First para rotas de navegação (evita erro de cache residual no desktop), com fallback para Cache
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Ignorar métodos não-GET (POST, PUT, DELETE, etc.)
  if (request.method !== 'GET') {
    return;
  }

  // Não interceptar requisições para a API do Gemini, Cloud ou rotas de backend
  if (url.pathname.startsWith('/api/') || url.origin !== self.location.origin) {
    return;
  }

  // Requisições de navegação (HTML): Network-First para sempre pegar a versão atualizada
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(OFFLINE_URL).then((cached) => {
            return cached || caches.match('/index.html');
          });
        })
    );
    return;
  }

  // Assets estáticos (CSS, JS, imagens, fontes): Stale-While-Revalidate com revalidação
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
