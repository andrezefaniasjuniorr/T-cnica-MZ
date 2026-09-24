import { useEffect, useState } from 'react';

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    if (typeof navigator !== 'undefined') {
      // 2. BYPASS DE REDE NO DESKTOP:
      // Se navigator.onLine retornar verdadeiro, sempre prioriza o estado online
      return navigator.onLine;
    }
    return true;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkOnline = () => {
      // Garante bypass imediato para navegadores desktop
      if (typeof navigator !== 'undefined' && navigator.onLine) {
        setIsOnline(true);
        return true;
      }
      return false;
    };

    const handleOnline = () => {
      setIsOnline(true);
      console.log('[TécnicaMZ Pro] Conexão restabelecida: ONLINE');
    };

    const handleOffline = () => {
      // Bypass no desktop: se navigator.onLine continuar true, não bloqueia
      if (typeof navigator !== 'undefined' && navigator.onLine) {
        setIsOnline(true);
        return;
      }
      setIsOnline(false);
      console.log('[TécnicaMZ Pro] Modo desconectado: OFFLINE (Bancada offline ativada)');
    };

    // Verificação inicial rápida
    checkOnline();

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
