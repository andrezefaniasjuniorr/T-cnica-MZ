import React, { useState } from 'react';
import {
  Zap,
  Cpu,
  ShieldCheck,
  MapPin,
  Clock,
  Layers,
  Wrench,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  MessageSquare,
  Play,
  RotateCcw,
  Sparkles,
  Award,
  AlertTriangle,
  HelpCircle,
  FileCheck2,
  Scale
} from 'lucide-react';
import { AcademyLesson, AcademyModule } from '../../types/academy';
import { formatProfessionalLesson, FormattedLesson } from '../../utils/professionalLessonFormatter';
import { CircuitDiagramViewer } from './CircuitDiagramViewer';
import { InteractiveVisualLab } from './InteractiveVisualLab';
import { CircuitBlockFlowViewer } from './CircuitBlockFlowViewer';
import { soundFX } from '../../utils/audio';

interface ProfessionalLessonViewerProps {
  lesson: AcademyLesson;
  module?: AcademyModule;
  moduleIndex?: number;
  totalModules?: number;
  isCompleted?: boolean;
  baseFontSize?: number;
  onAdvanceToQuiz?: () => void;
  onAskSara?: (promptText: string, contextSummary?: string) => void;
  onMarkCompleted?: () => void;
  onNextLesson?: () => void;
  onPrevLesson?: () => void;
  hasNextLesson?: boolean;
  hasPrevLesson?: boolean;
}

export const ProfessionalLessonViewer: React.FC<ProfessionalLessonViewerProps> = ({
  lesson,
  module,
  moduleIndex,
  totalModules = 14,
  isCompleted = false,
  baseFontSize = 13,
  onAdvanceToQuiz,
  onAskSara,
  onMarkCompleted,
  onNextLesson,
  onPrevLesson,
  hasNextLesson = false,
  hasPrevLesson = false
}) => {
  const [visualMode, setVisualMode] = useState<'none' | 'simulation' | 'schematic'>('none');

  // Formata a aula segundo o padrão estrito de fabricante industrial (Siemens / Schneider / ABB)
  const formatted: FormattedLesson = formatProfessionalLesson(
    lesson,
    module,
    moduleIndex,
    totalModules
  );

  const handleAskSara = () => {
    if (!onAskSara) return;
    const prompt = `Olá Eng. Sara. Estou estudando a aula "${formatted.title}" (${formatted.identification}). Gostaria de tirar uma dúvida técnica sobre os procedimentos operacionais e o critério de dimensionamento da norma ${formatted.norma}.`;
    const context = `[AULA TÉCNICA: ${formatted.title}] [MÓDULO: ${formatted.identification}] [NORMA: ${formatted.norma}] [APLICAÇÃO: ${formatted.ondeSeAplica}]`;
    onAskSara(prompt, context);
  };

  return (
    <div className="space-y-6 text-slate-200">
      {/* ===================================================================== */}
      {/* TOPO DA AULA - IDENTIFICAÇÃO, TÍTULO, OBJETIVO PRÁTICO & NORMA        */}
      {/* ===================================================================== */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#0F172A] border border-[#1E293B] shadow-xl space-y-4">
        {/* Identificação Superior */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Tag do Módulo */}
            <span className="px-3 py-1 rounded-lg bg-blue-950/80 text-blue-400 border border-blue-800/60 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              <span>{formatted.identification}</span>
            </span>

            {/* Código e Nível */}
            <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-slate-300 border border-slate-800 text-xs font-mono font-bold">
              {formatted.code}
            </span>

            <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-slate-400 border border-slate-800 text-xs font-semibold flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>{formatted.durationMinutes} min</span>
            </span>
          </div>

          {/* Status de Conclusão */}
          {isCompleted ? (
            <span className="px-3 py-1 rounded-lg bg-emerald-950/70 text-emerald-400 border border-emerald-800/80 text-xs font-black flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Aula Concluída</span>
            </span>
          ) : (
            <span className="px-3 py-1 rounded-lg bg-amber-950/60 text-amber-400 border border-amber-800/60 text-xs font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Aula em Andamento</span>
            </span>
          )}
        </div>

        {/* Título Técnico Claro da Aula (18px bold) */}
        <div>
          <h2 className="text-[18px] sm:text-[20px] font-black text-white tracking-tight leading-snug">
            {formatted.title}
          </h2>
        </div>

        {/* Linha de Objetivo Prático: O que o aluno vai saber fazer */}
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-start gap-3">
          <div className="w-7 h-7 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0 mt-0.5">
            <Wrench className="w-4 h-4 text-blue-400" />
          </div>
          <div className="space-y-0.5 min-w-0">
            <span className="text-[11px] font-black uppercase tracking-wider text-blue-400 block">
              Objetivo Operacional de Campo:
            </span>
            <p className="text-[13px] text-slate-200 font-medium leading-relaxed">
              {formatted.objetivoPratico}
            </p>
          </div>
        </div>

        {/* Linha Técnica: Norma de Referência e Onde se Aplica */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center gap-3">
            <Scale className="w-4 h-4 text-cyan-400 shrink-0" />
            <div className="min-w-0">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Norma de Referência:</span>
              <span className="text-[13px] font-bold text-cyan-300 truncate block">{formatted.norma}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center gap-3">
            <Cpu className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="min-w-0">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Onde se Aplica em Campo:</span>
              <span className="text-[13px] font-bold text-emerald-300 truncate block">{formatted.ondeSeAplica}</span>
            </div>
          </div>
        </div>

        {/* Barra de Acessibilidade Visual (Simulador / Diagrama IEC) */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/60">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                setVisualMode(visualMode === 'simulation' ? 'none' : 'simulation');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border ${
                visualMode === 'simulation'
                  ? 'bg-blue-600 text-white border-blue-500 shadow-md'
                  : 'bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border-slate-800'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>{visualMode === 'simulation' ? 'Ocultar Simulador' : 'Simulador Interativo'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                setVisualMode(visualMode === 'schematic' ? 'none' : 'schematic');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border ${
                visualMode === 'schematic'
                  ? 'bg-blue-600 text-white border-blue-500 shadow-md'
                  : 'bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border-slate-800'
              }`}
            >
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>{visualMode === 'schematic' ? 'Ocultar Diagrama' : 'Diagrama Esquemático IEC'}</span>
            </button>
          </div>

          <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">
            Padrão Industrial IEC / EN 50110
          </span>
        </div>
      </div>

      {/* Laboratório Visual (Se Ativado) */}
      {visualMode === 'simulation' && (
        <div className="p-4 rounded-2xl bg-[#0F172A] border border-blue-900/60 shadow-xl space-y-2 animate-in fade-in">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              Simulação de Física & Circuito Industrial
            </span>
            <button
              onClick={() => setVisualMode('none')}
              className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
            >
              Fechar
            </button>
          </div>
          <InteractiveVisualLab
            lessonCode={formatted.code}
            lessonTitle={formatted.title}
            norma={formatted.norma}
            baseFontSize={baseFontSize}
          />
        </div>
      )}

      {visualMode === 'schematic' && (
        <div className="p-4 rounded-2xl bg-[#0F172A] border border-cyan-900/60 shadow-xl space-y-2 animate-in fade-in">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-cyan-400" />
              Diagrama Unifilar / Esquemático Normativo IEC
            </span>
            <button
              onClick={() => setVisualMode('none')}
              className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
            >
              Fechar
            </button>
          </div>
          <CircuitDiagramViewer
            lessonCode={formatted.code}
            lessonTitle={formatted.title}
            norma={formatted.norma}
            baseFontSize={baseFontSize}
          />
        </div>
      )}

      {/* ===================================================================== */}
      {/* BLOCO A - FUNDAMENTO TÉCNICO ESSENCIAL                                */}
      {/* ===================================================================== */}
      <section className="p-5 sm:p-6 rounded-2xl bg-[#0F172A] border border-[#1E293B] shadow-lg space-y-3.5">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-blue-600/20 text-blue-400 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <h3 className="text-[14px] font-black uppercase tracking-wider text-blue-400">
              Bloco A • Fundamento Técnico Essencial
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Máx. 3 conceitos diretos
          </span>
        </div>

        <div className="space-y-3">
          {formatted.blocoA.paragrafos.map((paragrafo, pIdx) => (
            <p
              key={pIdx}
              className="text-[13px] leading-relaxed text-slate-200 font-normal bg-slate-950/40 p-3 rounded-xl border border-slate-900"
            >
              {paragrafo}
            </p>
          ))}
        </div>
      </section>

      {/* ===================================================================== */}
      {/* BLOCO B - FÓRMULAS E PARÂMETROS DE DIMENSIONAMENTO                    */}
      {/* ===================================================================== */}
      {formatted.blocoB.formulas.length > 0 && (
        <section className="p-5 sm:p-6 rounded-2xl bg-[#0F172A] border border-[#1E293B] shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-cyan-600/20 text-cyan-400 flex items-center justify-center">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <h3 className="text-[14px] font-black uppercase tracking-wider text-cyan-400">
                Bloco B • Fórmulas & Parâmetros de Dimensionamento
              </h3>
            </div>
            <span className="text-[11px] font-mono text-cyan-400/80 font-bold">
              {formatted.blocoB.formulas.length} Parâmetros Críticos
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {formatted.blocoB.formulas.map((form, fIdx) => (
              <div
                key={fIdx}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800/90 hover:border-cyan-800/60 transition-all flex flex-col justify-between space-y-2.5"
              >
                {/* Nome da Grandeza e Unidade */}
                <div className="flex items-center justify-between gap-2 border-b border-slate-900 pb-2">
                  <span className="text-[13px] font-bold text-slate-200">
                    {form.label}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-cyan-950/70 border border-cyan-800/60 text-cyan-300 font-mono text-xs font-black">
                    {form.unidade}
                  </span>
                </div>

                {/* Fórmula em Destaque Visual Limpo */}
                <div className="py-2.5 px-3 rounded-lg bg-blue-950/30 border border-blue-900/40 text-center font-mono font-black text-cyan-300 text-[14px] tracking-wide break-words">
                  {form.formula}
                </div>

                {/* Quando Usar na Prática */}
                <div className="text-[12px] text-slate-400 leading-snug pt-1">
                  <span className="text-slate-300 font-semibold block text-[11px] uppercase tracking-wider mb-0.5">
                    Quando usar na prática:
                  </span>
                  {form.quandoUsar}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ===================================================================== */}
      {/* BLOCO C - PROCEDIMENTOS OPERACIONAIS, SEGURANÇA E BOAS PRÁTICAS       */}
      {/* ===================================================================== */}
      <section className="p-5 sm:p-6 rounded-2xl bg-[#0F172A] border border-[#1E293B] shadow-lg space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-amber-600/20 text-amber-400 flex items-center justify-center">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <h3 className="text-[14px] font-black uppercase tracking-wider text-amber-400">
              Bloco C • Procedimentos Operacionais, Segurança & Boas Práticas
            </h3>
          </div>
          <span className="text-[11px] font-mono text-amber-400 font-bold">
            Norma & LOTO Obrigatório
          </span>
        </div>

        <ul className="space-y-2.5">
          {formatted.blocoC.procedimentos.map((proc, pIdx) => (
            <li
              key={pIdx}
              className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-start gap-3 hover:border-slate-700 transition"
            >
              <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">
                {pIdx + 1}
              </div>
              <div className="text-[13px] text-slate-200 leading-relaxed font-normal">
                {proc}
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* ===================================================================== */}
      {/* BLOCO D - CASO REAL DE CAMPO EM MOÇAMBIQUE E DIAGNÓSTICO              */}
      {/* ===================================================================== */}
      <section className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[#0F172A] via-[#111827] to-[#0A0F1D] border-2 border-amber-600/40 shadow-2xl space-y-4 relative overflow-hidden">
        {/* Marca d'água / Destaque de Autoridade */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-800/40 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
              <MapPin className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h3 className="text-[14px] font-black uppercase tracking-wider text-amber-400">
                Bloco D • Caso Real de Campo em Moçambique & Diagnóstico
              </h3>
              <span className="text-[11px] text-slate-400 font-medium">
                Localização: <strong className="text-white">{formatted.blocoD.localizacao}</strong>
              </span>
            </div>
          </div>

          <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-black uppercase tracking-wider flex items-center gap-1">
            <Wrench className="w-3 h-3 text-amber-400" />
            <span>Engenharia de Campo MZ</span>
          </span>
        </div>

        {/* Cenário Encontrado, Diagnóstico Técnico e Solução Aplicada */}
        <div className="space-y-3">
          {/* Cenário Encontrado */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Cenário Encontrado no Terreno:</span>
            </span>
            <p className="text-[13px] text-slate-300 leading-relaxed pl-5">
              {formatted.blocoD.cenario}
            </p>
          </div>

          {/* Diagnóstico Técnico com Valor Medido/Observado */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-rose-950/60 space-y-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-rose-400" />
              <span>Diagnóstico Técnico & Valores Medidos:</span>
            </span>
            <p className="text-[13px] text-slate-200 leading-relaxed pl-5 font-mono">
              {formatted.blocoD.diagnostico}
            </p>
          </div>

          {/* Solução Aplicada Conforme Norma */}
          <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-800/60 space-y-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Solução Aplicada Conforme Norma ({formatted.norma}):</span>
            </span>
            <p className="text-[13px] text-emerald-200 leading-relaxed pl-5 font-medium">
              {formatted.blocoD.solucaoNormativa}
            </p>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* BARRA DE AÇÃO INFERIOR - NAVEGAÇÃO & AVALIAÇÃO PRÁTICA                */}
      {/* ===================================================================== */}
      <div className="p-4 rounded-2xl bg-[#0F172A] border border-[#1E293B] flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl">
        {/* Navegação Entre Aulas */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {hasPrevLesson && (
            <button
              type="button"
              onClick={onPrevLesson}
              className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Aula Anterior</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleAskSara}
            className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            title="Tirar dúvida técnica com a Eng. Sara IA"
          >
            <MessageSquare className="w-4 h-4 text-blue-400" />
            <span>Consultar Sara IA</span>
          </button>
        </div>

        {/* Botão de Conclusão / Avaliação Prática */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {onAdvanceToQuiz && (
            <button
              type="button"
              onClick={onAdvanceToQuiz}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-black transition flex items-center justify-center gap-2 shadow-lg shadow-blue-900/30 cursor-pointer"
            >
              <span>Fazer Avaliação Técnica (Quiz IA)</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}

          {hasNextLesson && onNextLesson && (
            <button
              type="button"
              onClick={onNextLesson}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <span>Próxima Aula</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
