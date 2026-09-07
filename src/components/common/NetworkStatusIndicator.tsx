import React, { useState, useEffect } from 'react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

interface NetworkStatusIndicatorProps {
  className?: string;
  showOnlineLabel?: boolean;
}

export const NetworkStatusIndicator: React.FC<NetworkStatusIndicatorProps> = ({
  className = '',
  showOnlineLabel = true
}) => {
  const isOnline = useOnlineStatus();
  const [justReconnected, setJustReconnected] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
      setJustReconnected(false);
    } else if (wasOffline && isOnline) {
      setJustReconnected(true);
      const timer = setTimeout(() => {
        setJustReconnected(false);
        setWasOffline(false);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  // Modo Offline: Badge super compacto com bolinha vermelha/laranja pulsante e texto "Offline"
  if (!isOnline) {
    return (
      <div
        role="status"
        aria-live="polite"
        className={`flex items-center gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-rose-500/10 border border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-[10px] sm:text-[11px] font-black shrink-0 transition-all select-none shadow-2xs ${className}`}
        title="Sem conexão à internet — Operando em modo offline"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
        </span>
        <span>Offline</span>
      </div>
    );
  }

  // Modo Online: Badge compacto com bolinha verde e texto "Online"
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex items-center gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-emerald-500/10 border border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 text-[10px] sm:text-[11px] font-black shrink-0 transition-all select-none shadow-2xs ${
        justReconnected ? 'ring-2 ring-emerald-400/40 animate-pulse' : ''
      } ${className}`}
      title="Conectado à internet"
    >
      <span className="relative flex h-2 w-2">
        {justReconnected && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        )}
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
      </span>
      {showOnlineLabel && (
        <span className="hidden sm:inline">Online</span>
      )}
    </div>
  );
};
