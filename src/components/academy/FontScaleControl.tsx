import React, { useState, useEffect } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Type } from 'lucide-react';

export const FONT_SCALE_STORAGE_KEY = 'sara_academy_font_scale';
export const DEFAULT_FONT_SIZE = 15; // 15px padrão conforme solicitado
export const MIN_FONT_SIZE = 12;     // 12px mínimo
export const MAX_FONT_SIZE = 22;     // 22px máximo
export const FONT_STEP = 1.5;        // incremento fluido de 1.5px

/**
 * Hook para acessar e sincronizar o tamanho de fonte da Academia Técnica
 */
export const useAcademyFontScale = () => {
  const [fontSize, setFontSize] = useState<number>(() => {
    if (typeof window === 'undefined') return DEFAULT_FONT_SIZE;
    try {
      const saved = localStorage.getItem(FONT_SCALE_STORAGE_KEY);
      if (saved) {
        const parsed = parseFloat(saved);
        if (!isNaN(parsed) && parsed >= MIN_FONT_SIZE && parsed <= MAX_FONT_SIZE) {
          return parsed;
        }
      }
    } catch {}
    return DEFAULT_FONT_SIZE;
  });

  const updateFontSize = (newSize: number) => {
    const clamped = Math.min(MAX_FONT_SIZE, Math.max(MIN_FONT_SIZE, Math.round(newSize * 10) / 10));
    setFontSize(clamped);
    try {
      localStorage.setItem(FONT_SCALE_STORAGE_KEY, clamped.toString());
    } catch {}
  };

  const increase = () => updateFontSize(fontSize + FONT_STEP);
  const decrease = () => updateFontSize(fontSize - FONT_STEP);
  const reset = () => updateFontSize(DEFAULT_FONT_SIZE);

  // Escala multiplicadora relativa ao padrão de 15px
  const scaleRatio = fontSize / DEFAULT_FONT_SIZE;

  return {
    fontSize,
    scaleRatio,
    increase,
    decrease,
    reset,
    canIncrease: fontSize < MAX_FONT_SIZE,
    canDecrease: fontSize > MIN_FONT_SIZE,
    isDefault: fontSize === DEFAULT_FONT_SIZE
  };
};

interface FontScaleControlProps {
  fontSize: number;
  onIncrease: () => void;
  onDecrease: () => void;
  onReset: () => void;
  canIncrease: boolean;
  canDecrease: boolean;
  isDefault: boolean;
  className?: string;
  compact?: boolean;
}

export const FontScaleControl: React.FC<FontScaleControlProps> = ({
  fontSize,
  onIncrease,
  onDecrease,
  onReset,
  canIncrease,
  canDecrease,
  isDefault,
  className = '',
  compact = false
}) => {
  return (
    <div
      className={`inline-flex items-center gap-1 p-1 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-200 shadow-xs ${className}`}
      title="Ajuste do tamanho da fonte em todas as aulas, fórmulas, diagramas e quizzes da Academia"
    >
      <div className="flex items-center gap-1 px-1.5 text-[10px] font-black text-blue-400 uppercase tracking-wider select-none">
        <Type className="w-3.5 h-3.5 text-blue-400" />
        <span className={compact ? 'hidden' : 'hidden sm:inline'}>Tamanho</span>
      </div>

      {/* Botão A- */}
      <button
        type="button"
        onClick={onDecrease}
        disabled={!canDecrease}
        className={`px-2 py-1 rounded-lg text-xs font-black transition flex items-center gap-0.5 cursor-pointer select-none ${
          canDecrease
            ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white active:scale-95'
            : 'bg-slate-900 text-slate-600 cursor-not-allowed'
        }`}
        title="Diminuir tamanho da fonte (A-)"
        aria-label="Diminuir tamanho da fonte"
      >
        <span className="text-[11px] font-bold">A</span>
        <span className="text-xs font-black text-amber-400">-</span>
      </button>

      {/* Indicador de Tamanho */}
      <div className="px-1.5 py-0.5 min-w-[34px] text-center font-mono text-xs font-black text-amber-400 select-none">
        {Math.round(fontSize)}px
      </div>

      {/* Botão A+ */}
      <button
        type="button"
        onClick={onIncrease}
        disabled={!canIncrease}
        className={`px-2 py-1 rounded-lg text-xs font-black transition flex items-center gap-0.5 cursor-pointer select-none ${
          canIncrease
            ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white active:scale-95'
            : 'bg-slate-900 text-slate-600 cursor-not-allowed'
        }`}
        title="Aumentar tamanho da fonte (A+)"
        aria-label="Aumentar tamanho da fonte"
      >
        <span className="text-[11px] font-bold">A</span>
        <span className="text-xs font-black text-emerald-400">+</span>
      </button>

      {/* Botão Resetar */}
      {!isDefault && (
        <button
          type="button"
          onClick={onReset}
          className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-amber-400 transition cursor-pointer"
          title="Restaurar tamanho padrão (15px)"
          aria-label="Restaurar tamanho padrão"
        >
          <RotateCcw className="w-3 h-3" />
        </button>
      )}
    </div>
  );
};
