import React, { useEffect, useCallback } from 'react';
import {
  ShieldCheck,
  X,
  Lock,
  ArrowRight,
  CheckCircle2,
  Zap,
  Sparkles,
  Layers,
  Wrench,
  Users
} from 'lucide-react';
import { useModalHistory, dismissModalWithoutHistory } from '../../utils/modalHistory';
import { soundFX } from '../../utils/audio';

interface SeloMZModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToSeloSettings: () => void;
  featureName?: string;
}

export const SeloMZModal: React.FC<SeloMZModalProps> = ({
  isOpen,
  onClose,
  onGoToSeloSettings,
  featureName = 'Simulador CAD Interativo'
}) => {
  const handleCloseModal = useCallback(() => {
    try {
      soundFX?.playModalClose?.();
    } catch {}
    onClose();
  }, [onClose]);

  useModalHistory(isOpen, 'selo_mz_modal', handleCloseModal);

  // Trava de rolagem suave do fundo enquanto o modal estiver aberto
  useEffect(() => {
    if (!isOpen || typeof document === 'undefined') return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const displayName = featureName && featureName.trim() ? featureName.trim() : 'Simulador CAD Interativo';
  const displayUpper = displayName.toUpperCase();

  const handleConfirmGoToSettings = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      soundFX?.playClick?.();
    } catch {}

    // Desativa a entrada do modal no histórico para não dar "history.back" ao mudar de aba
    try {
      dismissModalWithoutHistory('selo_mz_modal');
    } catch {}

    onGoToSeloSettings();
  };

  return (
    <div
      id="selo_mz_modal_overlay"
      className="fixed inset-0 z-[100000] flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleCloseModal();
        }
      }}
    >
      <div
        id="selo_mz_modal_window"
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in zoom-in-95 duration-150 max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho Azul com Selo Oficial e Botão X */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white p-5 sm:p-6 flex items-start justify-between relative shrink-0 shadow-md">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 shadow-lg shadow-amber-400/20 border-2 border-white/30">
              <ShieldCheck className="w-7 h-7 stroke-[2.5]" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] tracking-wider uppercase">
                  VERIFICAÇÃO OFICIAL TÉCNICAMZ
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight mt-1 truncate">
                Selo MZ Necessário
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCloseModal}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition active:scale-95 cursor-pointer shrink-0 ml-2"
            title="Fechar (X)"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo com rolagem interna */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1 text-slate-700">
          {/* Caixa Amarela de Acesso Restrito com o nome dinâmico */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 space-y-1.5 shadow-2xs">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-700 shrink-0" />
              <h4 className="font-black text-xs uppercase tracking-wider text-amber-900">
                ACESSO RESTRITO A '{displayUpper}'
              </h4>
            </div>
            <p className="text-xs text-amber-800 leading-relaxed">
              Ative o seu <strong className="text-amber-950 font-black">Selo MZ</strong> nas Definições da sua conta para liberar todas as ferramentas, solicitações de clientes, o <strong>{displayName}</strong> e a Sara IA!
            </p>
          </div>

          {/* O que você desbloqueia com o Selo MZ */}
          <div className="space-y-2 pt-1">
            <h5 className="text-[11px] font-black uppercase tracking-wider text-slate-500">
              O QUE VOCÊ DESBLOQUEIA COM O SELO MZ:
            </h5>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-2 font-bold text-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Publicar no Mural & Mercado</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-2 font-bold text-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Solicitações & Contatos</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-2 font-bold text-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Status & Histórias 24h</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-2 font-bold text-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Ferramentas & Calculadoras</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-2 font-bold text-slate-800 sm:col-span-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{displayName}: Bancada de Testes, Diagramas & Simulação IEC</span>
              </div>
            </div>
          </div>

          {/* Faixa de Valor da Taxa Oficial */}
          <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 flex items-center justify-between gap-3 flex-wrap">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-blue-900">
                TAXA ÚNICA DE ATIVAÇÃO DO SELO
              </p>
              <p className="text-sm font-black text-blue-950 mt-0.5">
                50 MT <span className="text-xs font-normal text-slate-600">via M-Pesa ou e-Mola</span>
              </p>
            </div>

            <span className="px-3 py-1 rounded-full bg-blue-600 text-white font-black text-[11px] shadow-sm">
              Liberação Rápida
            </span>
          </div>

          {/* Botões de Ação */}
          <div className="pt-2 space-y-2">
            <button
              type="button"
              onClick={handleConfirmGoToSettings}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-blue-600/30 active:scale-98 transition cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-amber-300" />
              <span>Ativar Selo MZ nas Definições</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleCloseModal}
              className="w-full py-2.5 text-slate-500 hover:text-slate-800 font-bold text-xs transition cursor-pointer text-center"
            >
              Talvez depois
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeloMZModal;