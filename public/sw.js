// Service Worker Oficial - TécnicaMZ Pro (PWA Offline)
const CACHE_NAME = 'tecnicamz-pro-v1';
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
  '/tecnica_mz_slogan.jpg',
  '/perfilTecnico.js',
  '/bloco1Vendas.js',
  '/bloco2Tecnica.js',
  '/bloco3Gestao.js',
  '/bloco4Comunidade.js',
  '/chat.js',
  '/app.js',
  '/login.js',
  '/dashboard.js',
  '/admin.js',
  '/login.html',
  '/painel-cliente.html',
  '/painel-empresa.html',
  '/painel-tecnico.html'
];

// Install: Cache all core assets
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

// Activate: Clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[TécnicaMZ SW] Removendo cache antigo:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Network first with Cache fallback, Navigation fallback to '/'
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Não interceptar requisições para a API do Gemini ou SSE de streaming
  if (url.pathname.startsWith('/api/sara') || url.pathname.startsWith('/api/')) {
    return;
  }

  // Navigation requests (HTML pages)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match(OFFLINE_URL).then((cached) => {
          return cached || caches.match('/index.html');
        });
      })
    );
    return;
  }

  // Static assets (CSS, JS, images, fonts)
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Retorna imediatamente do cache e atualiza em segundo plano (Stale-While-Revalidate)
        fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
        }).catch(() => {/* Offline silente */});
        return cachedResponse;
      }

      // Se não estiver no cache, busca na rede e guarda no cache
      return fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const copy = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return networkResponse;
      }).catch((err) => {
        console.warn('[TécnicaMZ SW] Falha de rede para:', request.url);
      });
    })
  );
});
