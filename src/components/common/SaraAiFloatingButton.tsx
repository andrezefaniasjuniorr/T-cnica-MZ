import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Sparkles } from 'lucide-react';
import { soundFX } from '../../utils/audio';

interface SaraAiFloatingButtonProps {
  onClick: () => void;
}

/**
 * Botão flutuante de inicialização rápida da Sara IA.
 * REQUISITO ESTRITO: Oculto para contas com perfil de CLIENTE em TODAS as resoluções (Mobile & Desktop).
 * Visível EXCLUSIVAMENTE para TÉCNICOS (e Administradores).
 */
export const SaraAiFloatingButton: React.FC<SaraAiFloatingButtonProps> = ({ onClick }) => {
  const { currentUser, isClient, isTechnician, isAdmin } = useAuth();

  // Verificação rigorosa do papel do usuário
  const roleStr = String(currentUser?.role || '');
  const tipoStr = String(currentUser?.tipoConta || (currentUser as any)?.tipo || (currentUser as any)?.userType || '');

  const isClientUser = Boolean(
    isClient ||
    roleStr === 'cliente' ||
    roleStr === 'client' ||
    tipoStr === 'cliente'
  );

  const isTechnicianUser = Boolean(
    !isClientUser && (
      isTechnician ||
      roleStr === 'technician' ||
      roleStr === 'tecnico' ||
      tipoStr === 'tecnico' ||
      isAdmin
    )
  );

  // Se o usuário for Cliente ou não for Técnico, NÃO renderiza em nenhuma resolução (nem Mobile nem Desktop)
  if (isClientUser || !isTechnicianUser) {
    return null;
  }

  return (
    <button
      id="btnSaraAiDesktopFloating"
      onClick={() => {
        soundFX.playClick();
        onClick();
      }}
      className="hidden md:flex fixed bottom-6 right-6 z-30 items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 hover:from-blue-700 hover:to-indigo-700 text-white shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/40 transition-all transform hover:-translate-y-1 active:translate-y-0 cursor-pointer border border-white/25 group"
      title="Abrir Assistente Técnica Sara IA"
      aria-label="Assistente Técnica Sara IA"
    >
      <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center group-hover:rotate-12 transition-transform">
        <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
      </div>
      <div className="text-left">
        <span className="block text-xs font-black tracking-tight leading-tight">Sara IA</span>
        <span className="block text-[10px] text-blue-100 font-medium">Assistente Técnica</span>
      </div>
    </button>
  );
};
