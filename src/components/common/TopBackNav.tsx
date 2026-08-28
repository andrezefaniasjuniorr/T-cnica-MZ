import React from 'react';
import { ArrowLeft, X, Home, ChevronRight } from 'lucide-react';

interface TopBackNavProps {
  title: string;
  category?: string;
  onBack: () => void;
  backLabel?: string;
  rightAction?: React.ReactNode;
}

export const TopBackNav: React.FC<TopBackNavProps> = ({
  title,
  category,
  onBack,
  backLabel = 'Voltar ao Mural',
  rightAction
}) => {
  return (
    <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-2xl p-3 sm:p-4 shadow-xs flex items-center justify-between gap-3 mb-6 transition-all">
      {/* Left: Back Button & Title */}
      <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
        <button
          onClick={onBack}
          className="group flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 rounded-xl text-xs font-bold transition shadow-2xs active:scale-95 shrink-0"
          title="Voltar / Sair desta aba"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span className="hidden sm:inline">{backLabel}</span>
          <span className="sm:hidden">Voltar</span>
        </button>

        <div className="h-5 w-px bg-slate-200 hidden sm:block shrink-0" />

        <div className="min-w-0">
          {category && (
            <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate">
              <span className="hover:text-slate-600 cursor-pointer" onClick={onBack}>Início</span>
              <ChevronRight className="w-2.5 h-2.5 shrink-0" />
              <span className="text-blue-600 truncate">{category}</span>
            </div>
          )}
          <h2 className="text-sm sm:text-base font-black text-slate-900 truncate">
            {title}
          </h2>
        </div>
      </div>

      {/* Right: Custom Action or Quick Exit X */}
      <div className="flex items-center gap-2 shrink-0">
        {rightAction}

        <button
          onClick={onBack}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          title="Fechar / Sair desta seção"
          aria-label="Sair"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>
    </div>
  );
};
