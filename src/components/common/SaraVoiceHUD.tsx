import React, { useState, useEffect } from 'react';
import { useSaraVoice } from '../../context/SaraVoiceContext';
import { useAuth } from '../../context/AuthContext';
import {
  Mic,
  MicOff,
  Sparkles,
  Volume2,
  VolumeX,
  FileText,
  Calculator,
  Play,
  Square,
  ChevronDown,
  ChevronUp,
  X,
  Zap,
  Bot,
  HelpCircle
} from 'lucide-react';
import { soundFX } from '../../utils/audio';

interface SaraVoiceHUDProps {
  onOpenSaraChat?: () => void;
}

export const SaraVoiceHUD: React.FC<SaraVoiceHUDProps> = ({ onOpenSaraChat }) => {
  const {
    isListening,
    isRecognizing,
    isSpeaking,
    wakeWordDetected,
    transcript,
    lastCommand,
    lastResponse,
    isProcessing,
    hasPermission,
    isSupported,
    femaleVoiceName,
    lastSizingResult,
    toggleListening,
    stopSpeaking,
    processVoiceCommand
  } = useSaraVoice();

  const { isClient, currentUser, isAdmin, isTechnician } = useAuth();
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
  const [showCalculationModal, setShowCalculationModal] = useState<boolean>(false);

  // Auto-expande temporariamente quando o gatilho "Sara" é detectado
  useEffect(() => {
    if (wakeWordDetected) {
      setIsExpanded(true);
    }
  }, [wakeWordDetected]);

  // Se houver novo dimensionamento, mostra o modal
  useEffect(() => {
    if (lastSizingResult) {
      setShowCalculationModal(true);
    }
  }, [lastSizingResult]);

  // Restrição de acesso para perfil de cliente
  const roleStr = String(currentUser?.role || '');
  const tipoStr = String(currentUser?.tipoConta || (currentUser as any)?.tipo || '');
  const isClientUser = Boolean(isClient || roleStr === 'cliente' || roleStr === 'client' || tipoStr === 'cliente');
  const isTechnicianUser = Boolean(!isClientUser && (isTechnician || roleStr === 'tecnico' || roleStr === 'technician' || tipoStr === 'tecnico' || isAdmin));

  if (isClientUser || !isTechnicianUser || !isSupported) {
    return null;
  }

  return (
    <>
      {/* WIDGET FLUTUANTE DA SARA IA */}
      <div
        id="saraVoiceHudContainer"
        className="fixed bottom-20 md:bottom-6 left-4 md:left-6 z-40 flex flex-col items-start gap-2 select-none"
      >
        {/* BANNER EXPANDIDO OU CARD DE INTERAÇÃO */}
        {isExpanded && (
          <div
            id="saraVoiceHudExpanded"
            className="w-[320px] sm:w-[380px] bg-slate-900/95 backdrop-blur-md text-white rounded-2xl border border-blue-500/30 shadow-2xl p-4 flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200"
          >
            {/* Topo do Card */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="relative flex items-center justify-center w-7 h-7 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-md">
                  <Bot className="w-4 h-4" />
                  {isListening && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-900 animate-pulse" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black tracking-tight text-white">Sara IA</span>
                    <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      Voz Contínua
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 block truncate max-w-[180px]">
                    Voz: {femaleVoiceName}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowHelpModal(true)}
                  className="w-7 h-7 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                  title="Comandos suportados"
                >
                  <HelpCircle className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsExpanded(false)}
                  className="w-7 h-7 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                  title="Minimizar"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Status Visual & Wake Word Detection */}
            <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                {wakeWordDetected ? (
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
                  </span>
                ) : isListening ? (
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                  </span>
                ) : (
                  <span className="inline-flex rounded-full h-2.5 w-2.5 bg-slate-600" />
                )}

                <span className="text-[11px] font-medium text-slate-300">
                  {wakeWordDetected
                    ? '⚡ Gatilho Detectado: "Sara"!'
                    : isSpeaking
                    ? 'Sara falando...'
                    : isProcessing
                    ? 'Processando comando...'
                    : isListening
                    ? 'Aguardando gatilho: "Sara"'
                    : 'Escuta contínua pausada'}
                </span>
              </div>

              {/* Botão de Toggle Microfone */}
              <button
                type="button"
                onClick={toggleListening}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  isListening
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                    : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {isListening ? (
                  <>
                    <Mic className="w-3 h-3 text-emerald-400 animate-pulse" /> Ativo
                  </>
                ) : (
                  <>
                    <MicOff className="w-3 h-3" /> Ativar
                  </>
                )}
              </button>
            </div>

            {/* Área de Transcrição e Última Resposta */}
            <div className="space-y-1.5 min-h-[60px] max-h-[140px] overflow-y-auto px-1 text-xs">
              {transcript && (
                <div className="text-[11px] text-slate-400 font-mono bg-slate-950/40 p-2 rounded-lg border border-slate-800/60">
                  <span className="text-slate-500 select-none">Ouvido: </span>
                  <span className="text-slate-200">{transcript}</span>
                </div>
              )}

              {lastResponse ? (
                <div className="text-[11.5px] leading-relaxed text-blue-100 bg-blue-950/30 p-2.5 rounded-xl border border-blue-500/20">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-blue-400 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-yellow-300" /> Sara IA:
                    </span>
                    {isSpeaking && (
                      <button
                        type="button"
                        onClick={stopSpeaking}
                        className="text-[10px] text-red-300 hover:underline flex items-center gap-0.5 cursor-pointer"
                      >
                        <VolumeX className="w-3 h-3" /> Silenciar
                      </button>
                    )}
                  </div>
                  <p>{lastResponse}</p>
                </div>
              ) : (
                <div className="text-[11px] text-slate-500 text-center py-2 italic">
                  Diga em voz alta: <strong className="text-slate-300">"Sara, adicione um contator"</strong> ou <strong className="text-slate-300">"Sara, inicie a simulação"</strong>
                </div>
              )}
            </div>

            {/* Chips de Ação Rápida */}
            <div className="flex flex-wrap gap-1.5 pt-1 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => processVoiceCommand('Sara, Olá', true)}
                className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-medium flex items-center gap-1 transition-colors cursor-pointer"
              >
                👋 "Olá Sara"
              </button>
              <button
                type="button"
                onClick={() => processVoiceCommand('Sara, adicione um contator de potência', true)}
                className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-medium flex items-center gap-1 transition-colors cursor-pointer"
              >
                ⚡ + Contator
              </button>
              <button
                type="button"
                onClick={() => processVoiceCommand('Sara, iniciar simulação', true)}
                className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-medium flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Play className="w-2.5 h-2.5 text-emerald-400" /> Iniciar
              </button>
              <button
                type="button"
                onClick={() => processVoiceCommand('Sara, gerar relatório em PDF', true)}
                className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-medium flex items-center gap-1 transition-colors cursor-pointer"
              >
                <FileText className="w-2.5 h-2.5 text-sky-400" /> Relatório PDF
              </button>
              <button
                type="button"
                onClick={() => processVoiceCommand('Sara, dimensionar cabo para 15 kw em 380v a 30 metros', true)}
                className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-medium flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Calculator className="w-2.5 h-2.5 text-amber-400" /> Calcular 15kW
              </button>
            </div>

            {/* Acesso ao Chat Completo */}
            {onOpenSaraChat && (
              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  onOpenSaraChat();
                }}
                className="w-full py-1.5 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 border border-blue-500/30 text-xs font-bold text-center transition-all cursor-pointer"
              >
                Abrir Painel Completo de Conversa Sara IA
              </button>
            )}
          </div>
        )}

        {/* PÍLULA FLUTUANTE COMPACTA (QUANDO MINIMIZADA) */}
        {!isExpanded && (
          <button
            id="btnSaraVoiceFloatingPill"
            type="button"
            onClick={() => {
              soundFX.playClick();
              setIsExpanded(true);
            }}
            className={`group flex items-center gap-2.5 px-3.5 py-2.5 rounded-full shadow-xl backdrop-blur-md transition-all transform hover:scale-105 active:scale-95 cursor-pointer border ${
              wakeWordDetected
                ? 'bg-amber-500 text-slate-950 border-amber-300 ring-4 ring-amber-400/40 animate-pulse'
                : isSpeaking
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-400 ring-2 ring-blue-500/30'
                : isListening
                ? 'bg-slate-900/90 text-white border-blue-500/40 hover:border-blue-400 shadow-blue-500/20'
                : 'bg-slate-900/90 text-slate-300 border-slate-700 hover:text-white'
            }`}
            title="Sara IA • Assistente de Voz"
          >
            {/* Ícone de Ondas Vocais ou Microfone */}
            <div className="relative flex items-center justify-center">
              {wakeWordDetected ? (
                <Sparkles className="w-4 h-4 text-slate-950 animate-spin" />
              ) : isSpeaking ? (
                <Volume2 className="w-4 h-4 text-yellow-300 animate-pulse" />
              ) : isListening ? (
                <Mic className="w-4 h-4 text-emerald-400" />
              ) : (
                <MicOff className="w-4 h-4 text-slate-400" />
              )}
            </div>

            <div className="flex flex-col text-left">
              <span className="text-[11px] font-black leading-tight flex items-center gap-1">
                Sara IA
                {isListening && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                )}
              </span>
              <span className="text-[9px] text-slate-300 opacity-90 leading-tight">
                {wakeWordDetected ? 'Ouvindo...' : isListening ? 'Diga "Sara"' : 'Pausado'}
              </span>
            </div>
          </button>
        )}
      </div>

      {/* MODAL DE RESULTADO DO DIMENSIONAMENTO TÉCNICO */}
      {showCalculationModal && lastSizingResult && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-blue-500/40 rounded-2xl p-5 shadow-2xl text-white animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                  <Zap className="w-4 h-4 text-yellow-300" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Dimensionamento Técnico • Sara IA</h3>
                  <span className="text-[10px] text-blue-300">Norma IEC 60364-5-52 / Moçambique</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCalculationModal(false)}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="my-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Corrente Nominal (Ib)</span>
                  <span className="text-base font-bold text-blue-400">{lastSizingResult.currentNominalAmps} A</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Disjuntor Recomendado</span>
                  <span className="text-base font-bold text-amber-400">{lastSizingResult.recommendedBreakerAmps} A</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Seção do Condutor (Fase)</span>
                  <span className="text-base font-bold text-emerald-400">{lastSizingResult.conductorSectionMm2} mm²</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Queda de Tensão (ΔV)</span>
                  <span className={`text-base font-bold ${lastSizingResult.isVoltageDropAcceptable ? 'text-emerald-400' : 'text-red-400'}`}>
                    {lastSizingResult.voltageDropPct}%
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-500/20 text-blue-100 text-xs leading-relaxed">
                {lastSizingResult.spokenSummary}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowCalculationModal(false);
                  processVoiceCommand('Sara, gerar relatório em PDF', true);
                }}
                className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
              >
                <FileText className="w-3.5 h-3.5" /> Exportar em PDF
              </button>
              <button
                type="button"
                onClick={() => setShowCalculationModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE AJUDA COMANDOS SUPORTADOS */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl p-5 shadow-2xl text-white animate-in zoom-in-95 duration-150 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-400" />
                <h3 className="text-sm font-bold text-white">Guia de Comandos de Voz • Sara IA</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="my-4 space-y-4 text-xs text-slate-300">
              <div className="p-3 rounded-xl bg-blue-950/50 border border-blue-500/30">
                <strong className="text-blue-300 block mb-1">Regra de Ativação Estrita (Wake Word):</strong>
                Inicie sempre sua fala com o gatilho: <strong className="text-white">"Engenheira Sara"</strong>, <strong className="text-white">"Sara IA"</strong> ou <strong className="text-white">"Sara"</strong>. Sem clicar em nenhum botão!
              </div>

              <div>
                <h4 className="font-bold text-white mb-2">1. Ferramentas da Bancada CAD de Comandos:</h4>
                <ul className="list-disc pl-5 space-y-1 text-slate-300">
                  <li><code className="text-blue-300">"Sara, adicione um contator de potência"</code></li>
                  <li><code className="text-blue-300">"Sara, adicione um disjuntor tripolar no trilho DIN"</code></li>
                  <li><code className="text-blue-300">"Sara, adicione um relé térmico"</code></li>
                  <li><code className="text-blue-300">"Sara, adicione uma botoeira de partida"</code></li>
                  <li><code className="text-blue-300">"Sara, iniciar simulação"</code> / <code className="text-blue-300">"Sara, parar simulação"</code></li>
                  <li><code className="text-blue-300">"Sara, limpar bancada"</code></li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-white mb-2">2. Ferramentas Globais & Dimensionamento:</h4>
                <ul className="list-disc pl-5 space-y-1 text-slate-300">
                  <li><code className="text-emerald-300">"Sara, dimensionar cabo para 15 kw em 380v a 40 metros"</code></li>
                  <li><code className="text-emerald-300">"Sara, calcular queda de tensão para motor 7.5 kw em 220v"</code></li>
                  <li><code className="text-emerald-300">"Sara, gerar relatório em PDF"</code></li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-white mb-2">3. Navegação por Voz:</h4>
                <ul className="list-disc pl-5 space-y-1 text-slate-300">
                  <li><code className="text-purple-300">"Sara, ir para mural técnico"</code></li>
                  <li><code className="text-purple-300">"Sara, abrir central de ferramentas"</code></li>
                  <li><code className="text-purple-300">"Sara, abrir simulador de comandos"</code></li>
                  <li><code className="text-purple-300">"Sara, ir para academia"</code></li>
                </ul>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowHelpModal(false)}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer"
            >
              Entendido!
            </button>
          </div>
        </div>
      )}
    </>
  );
};
