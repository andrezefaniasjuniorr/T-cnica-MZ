import React, { useEffect } from 'react';
import {
  Shield,
  ShieldCheck,
  Check,
  Lock,
  ArrowRight,
  X
} from 'lucide-react';

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
  featureName = "Ferramentas & Recursos"
}) => {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      id="modal-selo-mz-overlay"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/80 backdrop-blur-xs transition-opacity duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-modal-selo"
    >
      <div
        id="modal-selo-mz-container"
        className="relative w-full max-w-[440px] max-h-[96vh] flex flex-col bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900 transition-transform duration-150 scale-100"
      >
        {/* ======================================================== */}
        {/* 1. CABEÇALHO GRADIENTE AZUL (COMPACTO) */}
        {/* ======================================================== */}
        <div className="relative bg-gradient-to-r from-blue-900 via-blue-700 to-indigo-800 px-4 py-3.5 sm:px-5 sm:py-4 text-white rounded-t-3xl shrink-0">
          {/* Botão "X" de fechar no canto superior direito */}
          <button
            id="btn-fechar-modal-selo"
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition cursor-pointer active:scale-95"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3 pr-6">
            {/* Ícone de Escudo Dourado à esquerda */}
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-slate-950/50 border-2 border-amber-400 shadow-md shadow-amber-400/25 flex items-center justify-center text-amber-400 shrink-0">
              <ShieldCheck className="w-6 h-6 sm:w-7 sm:h-7 fill-amber-400/20" />
            </div>

            <div className="min-w-0">
              {/* Badge dourado: "✨ VERIFICAÇÃO OFICIAL TÉCNICAMZ" */}
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400/20 border border-amber-300/50 text-amber-300 text-[9px] font-black uppercase tracking-wider">
                <span>✨</span>
                <span>VERIFICAÇÃO OFICIAL TÉCNICAMZ</span>
              </div>
              {/* Título: "Selo MZ Necessário" */}
              <h2 id="titulo-modal-selo" className="text-lg sm:text-xl font-black tracking-tight text-white leading-tight mt-0.5">
                Selo MZ Necessário
              </h2>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 2. CORPO CLEAN (COMPACTO & OTIMIZADO PARA MOBILE) */}
        {/* ======================================================== */}
        <div className="p-3.5 sm:p-4.5 space-y-2.5 sm:space-y-3 overflow-y-auto">
          {/* Alerta Amarelo/Laranja: Ícone de cadeado + ACESSO RESTRITO */}
          <div className="p-2.5 sm:p-3 rounded-xl bg-amber-50 border border-amber-200/90 text-amber-950 flex items-start gap-2.5">
            <div className="p-1 rounded-lg bg-amber-100/90 text-amber-700 shrink-0 mt-0.5">
              <Lock className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-[10px] sm:text-[11px] font-black uppercase tracking-wide text-amber-900 leading-tight">
                ACESSO RESTRITO A &apos;{featureName.toUpperCase()}&apos;
              </h3>
              <p className="text-[11px] sm:text-xs font-semibold text-amber-900/90 mt-0.5 leading-snug">
                Ative o seu <strong className="text-amber-950 font-black underline decoration-amber-400 decoration-2">Selo MZ</strong> nas Definições da sua conta para liberar todas as ferramentas, solicitações de clientes e a Sara IA!
              </p>
            </div>
          </div>

          {/* Lista de Benefícios (Cards finos com check verde ✓) */}
          <div>
            <p className="text-[9.5px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
              O QUE VOCÊ DESBLOQUEIA COM O SELO MZ:
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-50/80 border border-slate-200/80 text-[11px] leading-tight">
                <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 stroke-[3]" />
                </span>
                <span className="font-bold text-slate-800">Publicar no Mural & Mercado</span>
              </div>
              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-50/80 border border-slate-200/80 text-[11px] leading-tight">
                <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 stroke-[3]" />
                </span>
                <span className="font-bold text-slate-800">Solicitações & Contatos</span>
              </div>
              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-50/80 border border-slate-200/80 text-[11px] leading-tight">
                <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 stroke-[3]" />
                </span>
                <span className="font-bold text-slate-800">Status & Histórias 24h</span>
              </div>
              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-50/80 border border-slate-200/80 text-[11px] leading-tight">
                <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 stroke-[3]" />
                </span>
                <span className="font-bold text-slate-800">Ferramentas & Calculadoras</span>
              </div>
              <div className="col-span-2 flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-50/80 border border-slate-200/80 text-[11px] leading-tight">
                <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 stroke-[3]" />
                </span>
                <span className="font-bold text-slate-800">Sara IA: Engenharia, Dimensionamento & Foto Análise</span>
              </div>
            </div>
          </div>

          {/* Banner de Taxa: Card azul claro com 50 MT + Tag "Liberação Rápida" */}
          <div className="px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl bg-blue-50/80 border border-blue-200/90 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-blue-950 uppercase tracking-tight">Taxa Única de Ativação do Selo</p>
              <p className="text-xs sm:text-sm font-black text-blue-700 leading-tight">
                50 MT <span className="text-[10px] font-normal text-slate-600">via M-Pesa ou e-Mola</span>
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-blue-600 text-white text-[9.5px] sm:text-[10px] font-black tracking-tight shrink-0 shadow-xs">
              Liberação Rápida
            </span>
          </div>

          {/* ======================================================== */}
          {/* 3. BOTÕES DE AÇÃO (RESPOSTA INSTANTÂNEA COM 1 CLIQUE) */}
          {/* ======================================================== */}
          <div className="flex flex-col gap-1.5 pt-0.5">
            {/* Botão Azul Principal: "🛡️ Ativar Selo MZ nas Definições ➔" */}
            <button
              id="btn-ativar-selo-modal"
              type="button"
              onClick={() => {
                onClose();
                onGoToSeloSettings();
              }}
              className="w-full py-2.5 sm:py-3 px-3 rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white text-xs sm:text-[13px] font-black flex items-center justify-center gap-2 shadow-md shadow-blue-600/30 transition cursor-pointer active:scale-[0.98]"
            >
              <Shield className="w-4 h-4 shrink-0 text-amber-300 fill-amber-300/30" />
              <span>Ativar Selo MZ nas Definições</span>
              <ArrowRight className="w-4 h-4 shrink-0 ml-1" />
            </button>

            {/* Botão Secundário: "Talvez depois" */}
            <button
              id="btn-fechar-modal-depois"
              type="button"
              onClick={onClose}
              className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 text-[11px] sm:text-xs font-bold transition cursor-pointer active:scale-[0.98] text-center"
            >
              Talvez depois
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


