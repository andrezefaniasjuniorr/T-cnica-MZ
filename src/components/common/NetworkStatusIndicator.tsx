import React, { useState, useEffect } from 'react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { Wifi, WifiOff, CheckCircle2 } from 'lucide-react';

export const NetworkStatusIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  const [wasOffline, setWasOffline] = useState(false);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
      setShowReconnected(false);
    } else if (wasOffline && isOnline) {
      setShowReconnected(true);
      const timer = setTimeout(() => {
        setShowReconnected(false);
        setWasOffline(false);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  // If online and not just reconnected, stay subtle or render nothing intrusive
  if (isOnline && !showReconnected) {
    return null;
  }

  // Just reconnected toast
  if (isOnline && showReconnected) {
    return (
      <aside
        role="status"
        aria-live="polite"
        className="fixed top-3 right-3 z-50 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-950/90 text-emerald-300 border border-emerald-500/30 text-xs font-semibold shadow-lg backdrop-blur-md transition-all animate-in fade-in slide-in-from-top-2 duration-300"
      >
        <span className="relative flex h-2 w-2">
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
        </span>
        <Wifi className="w-3.5 h-3.5 text-emerald-400" />
        <span>ONLINE — Conexão restabelecida</span>
      </aside>
    );
  }

  // Offline Mode indicator
  return (
    <aside
      role="status"
      aria-live="polite"
      className="fixed bottom-16 sm:bottom-4 left-3 z-50 flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-900/95 text-amber-300 border border-amber-500/40 text-xs font-medium shadow-2xl backdrop-blur-md transition-all animate-in fade-in slide-in-from-bottom-2 duration-300 max-w-[90vw]"
    >
      <span className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
      </span>
      <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
      <div className="flex flex-col">
        <span className="font-bold text-slate-100">MODO OFFLINE ATIVO</span>
        <span className="text-[11px] text-amber-200/90">
          Calculadoras EDM, orçamentos e dados salvos disponíveis sem internet.
        </span>
      </div>
    </aside>
  );
};
