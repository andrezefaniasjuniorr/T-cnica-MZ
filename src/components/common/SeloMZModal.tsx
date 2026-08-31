import React from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Lock,
  ArrowRight,
  X,
  Wrench,
  ShoppingBag,
  MessageSquare,
  Bot,
  Flame,
  Phone
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
  featureName
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900 animate-scaleUp">
        {/* Top Header Banner */}
        <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-amber-300 shadow-inner">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-black uppercase tracking-wider">
                <Sparkles className="w-3 h-3" />
                Verificação Oficial TécnicaMZ
              </div>
              <h2 className="text-xl font-black tracking-tight text-white mt-1">
                Selo MZ Necessário
              </h2>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-7 space-y-5">
          {/* Main Notice */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
            <Lock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-amber-800">
                Acesso Restrito {featureName ? `a "${featureName}"` : ''}
              </h3>
              <p className="text-xs font-semibold text-amber-900 mt-1 leading-relaxed">
                Ative o seu <strong className="text-amber-950 font-black">Selo MZ</strong> nas Definições da sua conta para liberar todas as ferramentas, solicitações de clientes e a Sara IA!
              </p>
            </div>
          </div>

          {/* Benefits List */}
          <div className="space-y-2.5">
            <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">
              O que você desbloqueia com o Selo MZ:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-bold text-slate-700">Publicar no Mural & Mercado</span>
              </div>
              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-bold text-slate-700">Solicitações & Contatos</span>
              </div>
              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-bold text-slate-700">Status & Histórias 24h</span>
              </div>
              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-bold text-slate-700">Ferramentas & Calculadoras</span>
              </div>
              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs col-span-1 sm:col-span-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-bold text-slate-700">Sara IA: Engenharia, Dimensionamento & Foto Análise</span>
              </div>
            </div>
          </div>

          {/* Value & M-Pesa / e-Mola Highlight */}
          <div className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-100 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-blue-900">Taxa Única de Ativação do Selo</p>
              <p className="text-base font-black text-blue-700">50 MT <span className="text-[11px] font-normal text-slate-500">via M-Pesa ou e-Mola</span></p>
            </div>
            <span className="px-3 py-1 rounded-full bg-blue-600 text-white text-[11px] font-black shadow-xs">
              Liberação Rápida
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              onClick={() => {
                onClose();
                onGoToSeloSettings();
              }}
              className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Ativar Selo MZ nas Definições</span>
              <ArrowRight className="w-4 h-4 ml-auto sm:ml-0" />
            </button>
            <button
              onClick={onClose}
              className="w-full sm:w-auto py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
            >
              Talvez depois
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
