/**
 * SaraVoiceContext - Provedor Global de Voz e Inteligência Sara IA para TécnicaMZ Pro
 * 
 * Atende com rigor a todos os requisitos:
 * 1. ORQUESTRADOR ÚNICO E SINCRONIA:
 *    - Utiliza VoiceOrchestrator centralizado como single-source-of-truth.
 *    - Pausa processamento (isProcessing = true) durante o reconhecimento e resposta.
 *    - Após execução da tarefa e síntese feminina, a escuta é reativada de forma limpa.
 * 2. CORREÇÃO DEFINITIVA DO LOOP DE ESCUTA:
 *    - continuous = true, interimResults = false.
 *    - Auto-restart e reconexão silenciosa no onend e em erros (no-speech, network, aborted).
 *    - Log visual obrigatório: console.log('[Sara Voice Capturado]:', transcript).
 * 3. SÍNTESE DE VOZ FEMININA E IDENTIDADE:
 *    - Voz feminina natural em português.
 *    - Saudação oficial de resposta:
 *      "Olá, Eletro-Jr, Sou Sara a sua assistente virtual. Sim, estou totalmente conectada a toda a plataforma TécnicaMZ Pro e ao simulador de comandos."
 * 4. COMANDOS DE NAVEGAÇÃO E FERRAMENTAS:
 *    - Navegação imediata (navigatePlatform), componentes do simulador CAD, relatórios PDF.
 * 5. REGISTRO DINÂMICO (PlatformRegistry):
 *    - Integração sem regras hardcoded.
 */

import React, { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import { voiceOrchestrator, OrchestratorSnapshot, CadBridgeInterface } from '../services/voiceOrchestrator';
import { platformRegistry } from '../services/platformRegistry';
import { SizingResult } from '../utils/electricalCalculations';

export type CadSimulatorBridge = CadBridgeInterface;

export interface SaraVoiceContextType {
  // Estados de Escuta e Reconhecimento
  isListening: boolean;
  isRecognizing: boolean;
  isSpeaking: boolean;
  wakeWordDetected: boolean;
  transcript: string;
  lastCommand: string;
  lastResponse: string;
  isProcessing: boolean;
  hasPermission: boolean | null;
  isSupported: boolean;
  femaleVoiceName: string;

  // Último cálculo ou ferramenta acionada
  lastSizingResult: SizingResult | null;
  activeToolFeedback: string | null;

  // Ações de Controle
  toggleListening: () => void;
  startListening: () => void;
  stopListening: () => void;
  speak: (text: string, onEnd?: () => void) => void;
  stopSpeaking: () => void;
  processVoiceCommand: (phrase: string, isForcedDirect?: boolean) => Promise<string>;

  // Registro de pontes
  registerCadBridge: (bridge: CadSimulatorBridge) => () => void;
  registerNavigationBridge: (fn: (route: string) => void) => () => void;

  // Execução de Ferramentas Nativas
  executeTool: (toolName: string, params: any) => Promise<any>;
}

const SaraVoiceContext = createContext<SaraVoiceContextType | undefined>(undefined);

export const SaraVoiceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const initialSnap = voiceOrchestrator.getSnapshot();

  const [snap, setSnap] = useState<OrchestratorSnapshot>(initialSnap);

  // Instâncias mantidas em referências React (useRef) para evitar re-renderizações e múltiplas instâncias
  const orchestratorRef = useRef(voiceOrchestrator);

  // Sincronização estrita com o VoiceOrchestrator
  useEffect(() => {
    const unregister = orchestratorRef.current.subscribe((nextSnap: OrchestratorSnapshot) => {
      setSnap(nextSnap);
    });

    return () => {
      unregister();
    };
  }, []);

  const toggleListening = useCallback(() => {
    orchestratorRef.current.toggleListening();
  }, []);

  const startListening = useCallback(() => {
    orchestratorRef.current.startListening();
  }, []);

  const stopListening = useCallback(() => {
    orchestratorRef.current.stopListening();
  }, []);

  const speak = useCallback((text: string, onEnd?: () => void) => {
    orchestratorRef.current.speak(text, onEnd);
  }, []);

  const stopSpeaking = useCallback(() => {
    orchestratorRef.current.stopSpeaking();
  }, []);

  const processVoiceCommand = useCallback(async (phrase: string, isForcedDirect: boolean = false): Promise<string> => {
    if (!phrase || !phrase.trim()) return '';

    // Se a chamada for direta forçada (ex: digitada no chat da Sara IA), prependamos a wake word se necessário
    let fullPhrase = phrase.trim();
    if (isForcedDirect && !/^(?:ei\s+|ó\s+|olá\s+|oi\s+)?(?:engenheira\s+sara|sara\s+ia|sara)\b/i.test(fullPhrase)) {
      fullPhrase = `Sara, ${fullPhrase}`;
    }

    // Processa através do pipeline sincronizado do VoiceOrchestrator
    (orchestratorRef.current as any).handleCapturedTranscript(fullPhrase);
    return orchestratorRef.current.getSnapshot().lastResponse;
  }, []);

  const registerCadBridge = useCallback((bridge: CadSimulatorBridge) => {
    return orchestratorRef.current.registerCadBridge(bridge);
  }, []);

  const registerNavigationBridge = useCallback((fn: (route: string) => void) => {
    return orchestratorRef.current.registerNavigationBridge(fn);
  }, []);

  const executeTool = useCallback(async (toolName: string, params: any): Promise<any> => {
    const regTool = platformRegistry.findTool(toolName);
    if (regTool) {
      return await regTool.execute(params);
    }
    return { success: false, message: `Ferramenta ${toolName} processada pelo orquestrador.` };
  }, []);

  return (
    <SaraVoiceContext.Provider
      value={{
        isListening: snap.isListening,
        isRecognizing: snap.isRecognizing,
        isSpeaking: snap.isSpeaking,
        wakeWordDetected: snap.wakeWordDetected,
        transcript: snap.transcript,
        lastCommand: snap.lastCommand,
        lastResponse: snap.lastResponse,
        isProcessing: snap.isProcessing,
        hasPermission: snap.hasPermission,
        isSupported: snap.isSupported,
        femaleVoiceName: snap.femaleVoiceName,
        lastSizingResult: snap.lastSizingResult,
        activeToolFeedback: snap.activeToolFeedback,
        toggleListening,
        startListening,
        stopListening,
        speak,
        stopSpeaking,
        processVoiceCommand,
        registerCadBridge,
        registerNavigationBridge,
        executeTool
      }}
    >
      {children}
    </SaraVoiceContext.Provider>
  );
};

export const useSaraVoice = () => {
  const context = useContext(SaraVoiceContext);
  if (!context) {
    throw new Error('useSaraVoice deve ser utilizado dentro de um SaraVoiceProvider');
  }
  return context;
};
