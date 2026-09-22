// ============================================================================
// TÉCNICAMZ PRO — PAINEL DE AVISOS TÉCNICOS POR VOZ & DIAGNÓSTICO IEC
// Síntese de voz feminina em Português estritamente limitada ao simulador CAD
// Em conformidade com IEC 60947, IEC 60364, IEC 62548 e IEC 61008
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  Volume2,
  VolumeX,
  Volume1,
  AlertTriangle,
  Flame,
  Zap,
  ShieldAlert,
  Clock,
  Sun,
  Home,
  Cpu,
  Factory,
  Radio,
  Trash2,
  Play,
  RotateCcw,
  Sparkles,
  Info
} from 'lucide-react';
import {
  simulatorDiagnostics,
  DiagnosticEngineState,
  DiagnosticCategory,
  DIAGNOSTIC_CATALOG,
  DiagnosticEventDef,
  DiagnosticLogEntry
} from '../../services/simulatorVoiceDiagnostics';

interface CadVoiceDiagnosticPanelProps {
  onTriggerVisualEffect?: (effect: string, compCode?: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const CadVoiceDiagnosticPanel: React.FC<CadVoiceDiagnosticPanelProps> = ({
  onTriggerVisualEffect,
  isOpen,
  onClose
}) => {
  const [engineState, setEngineState] = useState<DiagnosticEngineState>(
    simulatorDiagnostics.getState()
  );
  const [activeCategory, setActiveCategory] = useState<DiagnosticCategory | 'all'>('all');

  useEffect(() => {
    const unsub = simulatorDiagnostics.subscribe(s => setEngineState(s));
    return () => unsub();
  }, []);

  if (!isOpen) return null;

  const handleTestDiagnostic = (code: string) => {
    const def = DIAGNOSTIC_CATALOG[code];
    if (!def) return;

    simulatorDiagnostics.trigger(code);
    if (onTriggerVisualEffect) {
      onTriggerVisualEffect(def.visualEffect, def.code);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    simulatorDiagnostics.setVolume(val);
  };

  const filteredLogs = activeCategory === 'all'
    ? engineState.logs
    : engineState.logs.filter(l => l.category === activeCategory);

  const getSeverityBadge = (level: number) => {
    switch (level) {
      case 1:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1">
            <Flame className="w-3 h-3 text-rose-400" />
            Nível 1 • Emergência
          </span>
        );
      case 2:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            Nível 2 • Advertência
          </span>
        );
      case 3:
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center gap-1">
            <Info className="w-3 h-3 text-sky-400" />
            Nível 3 • Informativo
          </span>
        );
    }
  };

  const getCategoryIcon = (cat: DiagnosticCategory) => {
    switch (cat) {
      case 'solar':
        return <Sun className="w-3.5 h-3.5 text-amber-400" />;
      case 'residential':
        return <Home className="w-3.5 h-3.5 text-sky-400" />;
      case 'automation':
        return <Cpu className="w-3.5 h-3.5 text-emerald-400" />;
      case 'industrial':
        return <Factory className="w-3.5 h-3.5 text-violet-400" />;
    }
  };

  const allEventCodes = Object.keys(DIAGNOSTIC_CATALOG);
  const eventsByCategory: Record<DiagnosticCategory, DiagnosticEventDef[]> = {
    solar: allEventCodes.filter(k => DIAGNOSTIC_CATALOG[k].category === 'solar').map(k => DIAGNOSTIC_CATALOG[k]),
    residential: allEventCodes.filter(k => DIAGNOSTIC_CATALOG[k].category === 'residential').map(k => DIAGNOSTIC_CATALOG[k]),
    automation: allEventCodes.filter(k => DIAGNOSTIC_CATALOG[k].category === 'automation').map(k => DIAGNOSTIC_CATALOG[k]),
    industrial: allEventCodes.filter(k => DIAGNOSTIC_CATALOG[k].category === 'industrial').map(k => DIAGNOSTIC_CATALOG[k])
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl shadow-black/80 overflow-hidden">
        {/* HEADER COM CONTROLES DE ÁUDIO FEMININO */}
        <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <Radio className={`w-5 h-5 ${engineState.isSpeaking ? 'animate-pulse text-amber-300' : ''}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-white tracking-wide">
                  Avisos Técnicos por Voz & Diagnósticos
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  IEC 60947 / IEC 60364
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Síntese de voz feminina em Português estritamente associada aos eventos elétricos do simulador
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* ONDA SONORA / STATUS DE SÍNTESE */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
              <div className="flex items-center gap-0.5 h-4">
                <span className={`w-1 bg-purple-400 rounded-full transition-all duration-150 ${engineState.isSpeaking ? 'h-4 animate-bounce' : 'h-1'}`} />
                <span className={`w-1 bg-indigo-400 rounded-full transition-all duration-150 ${engineState.isSpeaking ? 'h-3 animate-pulse' : 'h-1'}`} />
                <span className={`w-1 bg-amber-400 rounded-full transition-all duration-150 ${engineState.isSpeaking ? 'h-4 animate-bounce' : 'h-1'}`} />
              </div>
              <span className="text-[11px] font-bold text-slate-300">
                {engineState.isSpeaking ? 'Sintetizando Voz...' : engineState.isMuted ? 'Áudio Mudo' : 'Voz Feminina Pronta'}
              </span>
            </div>

            {/* BOTÃO MUDO */}
            <button
              type="button"
              onClick={() => simulatorDiagnostics.toggleMute()}
              className={`p-2 rounded-xl border transition cursor-pointer ${
                engineState.isMuted
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-400 hover:bg-rose-500/30'
                  : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
              }`}
              title={engineState.isMuted ? 'Reativar Áudio da Voz' : 'Silenciar Avisos de Voz'}
            >
              {engineState.isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* CONTROLE DE VOLUME */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
              <Volume1 className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={engineState.volume}
                onChange={handleVolumeChange}
                disabled={engineState.isMuted}
                className="w-20 accent-indigo-500 cursor-pointer disabled:opacity-40"
              />
              <span className="text-[11px] font-mono font-bold text-slate-300 w-8">
                {Math.round(engineState.volume * 100)}%
              </span>
            </div>

            {/* FECHAR */}
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold transition cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>

        {/* ALERTA ATIVO EM DESTAQUE (BANNER) */}
        {engineState.activeAlert && (
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-indigo-500/30 px-5 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                <ShieldAlert className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-white">{engineState.activeAlert.title}</span>
                  {getSeverityBadge(engineState.activeAlert.level)}
                  <span className="text-[10px] text-slate-400 font-mono">Norma: {engineState.activeAlert.norma}</span>
                </div>
                <p className="text-xs text-indigo-300/90 italic font-medium mt-0.5">
                  &ldquo;{engineState.activeAlert.spokenText}&rdquo;
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => simulatorDiagnostics.trigger(engineState.activeAlert!.code)}
              className="px-2.5 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40 text-xs font-bold transition flex items-center gap-1 cursor-pointer shrink-0"
            >
              <RotateCcw className="w-3 h-3" />
              Repetir Voz
            </button>
          </div>
        )}

        {/* CORPO: TESTES RÁPIDOS DE PROTEÇÃO & LOG TÉCNICO */}
        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* COLUNA ESQUERDA: DISPARADORES DE TESTE TÉCNICO (8 COLS) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Disparo Manual de Falhas e Proteções (Normativas IEC)
              </h3>
              <span className="text-[11px] text-slate-500">Clique para testar voz e resposta</span>
            </div>

            {/* SEÇÃO 1: FOTOVOLTAICO */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-1.5">
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-black text-amber-300">A. Sistemas Fotovoltaicos (CC/CA)</span>
                </div>
                <span className="text-[10px] font-mono text-slate-500">IEC 62548 / IEC 62109</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {eventsByCategory.solar.map(ev => (
                  <button
                    key={ev.code}
                    type="button"
                    onClick={() => handleTestDiagnostic(ev.code)}
                    className="p-2.5 rounded-lg bg-slate-900/90 hover:bg-amber-950/30 hover:border-amber-500/40 border border-slate-800 text-left transition group cursor-pointer flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold text-slate-200 group-hover:text-amber-200 leading-tight">
                        {ev.title}
                      </span>
                      <Play className="w-3 h-3 text-slate-600 group-hover:text-amber-400 shrink-0" />
                    </div>
                    <p className="text-[10px] text-slate-400 line-clamp-1 mt-1 font-mono">
                      {ev.norma}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* SEÇÃO 2: RESIDENCIAL & PREDIAL */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-1.5">
                  <Home className="w-4 h-4 text-sky-400" />
                  <span className="text-xs font-black text-sky-300">B. Instalações Residenciais e Comerciais</span>
                </div>
                <span className="text-[10px] font-mono text-slate-500">IEC 60898 / IEC 61008</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {eventsByCategory.residential.map(ev => (
                  <button
                    key={ev.code}
                    type="button"
                    onClick={() => handleTestDiagnostic(ev.code)}
                    className="p-2.5 rounded-lg bg-slate-900/90 hover:bg-sky-950/30 hover:border-sky-500/40 border border-slate-800 text-left transition group cursor-pointer flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold text-slate-200 group-hover:text-sky-200 leading-tight">
                        {ev.title}
                      </span>
                      <Play className="w-3 h-3 text-slate-600 group-hover:text-sky-400 shrink-0" />
                    </div>
                    <p className="text-[10px] text-slate-400 line-clamp-1 mt-1 font-mono">
                      {ev.norma}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* SEÇÃO 3: COMUTAÇÃO & AUTOMAÇÃO */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-black text-emerald-300">C. Comutação, Automação & Iluminação</span>
                </div>
                <span className="text-[10px] font-mono text-slate-500">IEC 60669-1 / IEC 61812</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {eventsByCategory.automation.map(ev => (
                  <button
                    key={ev.code}
                    type="button"
                    onClick={() => handleTestDiagnostic(ev.code)}
                    className="p-2.5 rounded-lg bg-slate-900/90 hover:bg-emerald-950/30 hover:border-emerald-500/40 border border-slate-800 text-left transition group cursor-pointer flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold text-slate-200 group-hover:text-emerald-200 leading-tight">
                        {ev.title}
                      </span>
                      <Play className="w-3 h-3 text-slate-600 group-hover:text-emerald-400 shrink-0" />
                    </div>
                    <p className="text-[10px] text-slate-400 line-clamp-1 mt-1 font-mono">
                      {ev.norma}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* SEÇÃO 4: INDUSTRIAL & MOTORES */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-1.5">
                  <Factory className="w-4 h-4 text-violet-400" />
                  <span className="text-xs font-black text-violet-300">D. Comandos Industriais & Motores</span>
                </div>
                <span className="text-[10px] font-mono text-slate-500">IEC 60947-4-1 / IEC 61439</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {eventsByCategory.industrial.map(ev => (
                  <button
                    key={ev.code}
                    type="button"
                    onClick={() => handleTestDiagnostic(ev.code)}
                    className="p-2.5 rounded-lg bg-slate-900/90 hover:bg-violet-950/30 hover:border-violet-500/40 border border-slate-800 text-left transition group cursor-pointer flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold text-slate-200 group-hover:text-violet-200 leading-tight">
                        {ev.title}
                      </span>
                      <Play className="w-3 h-3 text-slate-600 group-hover:text-violet-400 shrink-0" />
                    </div>
                    <p className="text-[10px] text-slate-400 line-clamp-1 mt-1 font-mono">
                      {ev.norma}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* COLUNA DIREITA: LOG TÉCNICO DE OCORRÊNCIAS (5 COLS) */}
          <div className="lg:col-span-5 flex flex-col bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 overflow-hidden">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-400" />
                <h4 className="text-xs font-black text-white uppercase tracking-wider">
                  Log Técnico de Ocorrências
                </h4>
              </div>
              {engineState.logs.length > 0 && (
                <button
                  type="button"
                  onClick={() => simulatorDiagnostics.clearLogs()}
                  className="text-[10px] text-slate-400 hover:text-rose-400 flex items-center gap-1 transition cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  Limpar
                </button>
              )}
            </div>

            {/* FILTROS POR CATEGORIA */}
            <div className="flex items-center gap-1 mb-3 overflow-x-auto pb-1">
              {(['all', 'solar', 'residential', 'automation', 'industrial'] as const).map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase transition shrink-0 cursor-pointer ${
                    activeCategory === cat
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  {cat === 'all' ? 'Todas' : cat === 'solar' ? 'Solar' : cat === 'residential' ? 'Resid.' : cat === 'automation' ? 'Autom.' : 'Indust.'}
                </button>
              ))}
            </div>

            {/* LISTA DE REGISTROS DE EVENTOS */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[300px] max-h-[520px]">
              {filteredLogs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                  <ShieldAlert className="w-8 h-8 text-slate-600 mb-2 stroke-1" />
                  <p className="text-xs font-bold text-slate-400">Nenhum evento registrado ainda</p>
                  <p className="text-[11px] text-slate-600 mt-1 max-w-xs">
                    Dispare um teste ao lado ou inicie a simulação do circuito para registrar atuações normativas.
                  </p>
                </div>
              ) : (
                filteredLogs.map(item => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 transition flex flex-col gap-1.5"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5">
                        {getCategoryIcon(item.category)}
                        <span className="text-xs font-bold text-slate-200">{item.title}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">{item.time}</span>
                    </div>

                    <p className="text-[11px] text-slate-300 leading-snug">
                      {item.spokenText}
                    </p>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 mt-0.5">
                      <span className="text-[9px] font-mono text-slate-400">{item.norma}</span>
                      <button
                        type="button"
                        onClick={() => simulatorDiagnostics.trigger(item.code)}
                        className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                      >
                        <Play className="w-2.5 h-2.5" />
                        Repetir
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
