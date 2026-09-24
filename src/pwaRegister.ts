// Registration of Service Worker for PWA Offline Caching
export function registerPWA() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  window.addEventListener('load', () => {
    // 1. Tenta registrar o companion Service Worker nativo
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((registration) => {
        console.log('[TécnicaMZ Pro] Service Worker registrado com sucesso:', registration.scope);

        // Checar atualizações periodicamente
        registration.addEventListener('updatefound', () => {
          const installingWorker = registration.installing;
          if (installingWorker) {
            installingWorker.addEventListener('statechange', () => {
              if (installingWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  console.log('[TécnicaMZ Pro] Nova versão disponível em segundo plano.');
                  installingWorker.postMessage({ type: 'SKIP_WAITING' });
                } else {
                  console.log('[TécnicaMZ Pro] Conteúdo em cache para uso 100% offline.');
                }
              }
            });
          }
        });

        // Recarrega automaticamente quando o novo service worker assumir controle (se houver controle anterior)
        let refreshing = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          if (!refreshing) {
            refreshing = true;
            console.log('[TécnicaMZ Pro] Service Worker atualizado. Recarregando com versão nova.');
            window.location.reload();
          }
        });
      })
      .catch((error) => {
        console.warn('[TécnicaMZ Pro] Erro ao registrar Service Worker:', error);
      });
  });
}
