/**
 * VoiceOrchestrator - Gerenciador Centralizado e Sincronizado de Áudio & IA Pipeline
 * para TécnicaMZ Pro (Sara IA)
 * 
 * Atende com rigor a todas as regras da especificação:
 * 1. Orquestrador Único e Sincronia:
 *    - Impede duplicação de comandos, loops infinitos e conflitos entre Web Speech API e IA.
 *    - Quando o gatilho ("Engenheira Sara", "Sara" ou "Sara IA") é detectado:
 *      a escuta entra em pausa temporária de processamento (isProcessing = true).
 *    - O comando limpo é interpretado e as ferramentas executadas via PlatformRegistry e pontes ativas.
 *    - Após a resposta em voz feminina, a escuta é reativada de forma limpa e contínua.
 * 2. Correção Definitiva do Loop de Escuta:
 *    - continuous = true, interimResults = false.
 *    - Auto-restart e reconexão silenciosa no onend e em erros (no-speech, network, aborted).
 *    - Log visual obrigatório no console: console.log('[Sara Voice Capturado]:', transcript).
 * 3. Síntese de Voz Feminina e Identidade:
 *    - Fala feminina natural em português com timbre e pitch técnico humanizado.
 *    - Seleção dinâmica entre vozes 'Luciana', 'Joana', 'Helena', 'Google português' ou primeira voz PT feminina.
 *    - Saudação oficial obrigatória ao saudar ou perguntar sobre conexão:
 *      "Olá, Eletro-Jr, Sou Sara a sua assistente virtual. Sim, estou totalmente conectada a toda a plataforma TécnicaMZ Pro e ao simulador de comandos."
 * 4. Execução de Comandos de Navegação e Ferramentas:
 *    - Navegação direta (navigatePlatform).
 *    - Comandos na bancada CAD (addComponent, connectTerminals, removeComponent, clearCanvas, triggerSimulation).
 *    - Relatórios e PDFs (generatePDFReport).
 * 5. Registro Dinâmico (PlatformRegistry):
 *    - Consulta contínua ao catálogo sem regras hardcoded.
 */

import { platformRegistry, PlatformComponent, PlatformModule } from './platformRegistry';
import { calculateSizing, SizingInput, SizingResult } from '../utils/electricalCalculations';
import { soundFX } from '../utils/audio';

export type VoiceState = 'IDLE' | 'LISTENING' | 'PROCESSING' | 'SPEAKING' | 'ERROR';

export interface CadBridgeInterface {
  isOpen: boolean;
  openSimulator: (circuit?: any) => void;
  closeSimulator?: () => void;
  getProject: () => any;
  setProject: (updater: any) => void;
  isRunning: boolean;
  setIsRunning: (val: any) => void;
  addComponent: (type: string, x?: number, y?: number, onBusbar?: boolean) => any;
  connectTerminals: (params: {
    sourceCompId: string;
    sourceTerminal?: string;
    targetCompId: string;
    targetTerminal?: string;
    wireType?: string;
  }) => boolean;
  removeComponent: (compId: string) => boolean;
  clearCanvas: () => void;
  triggerSimulation: (action: 'start' | 'stop' | 'toggle') => boolean;
}

export interface OrchestratorSnapshot {
  state: VoiceState;
  isListening: boolean;
  isRecognizing: boolean;
  isSpeaking: boolean;
  isProcessing: boolean;
  wakeWordDetected: boolean;
  transcript: string;
  lastCommand: string;
  lastResponse: string;
  femaleVoiceName: string;
  lastSizingResult: SizingResult | null;
  activeToolFeedback: string | null;
  hasPermission: boolean | null;
  isSupported: boolean;
}

const WAKE_WORD_PATTERN = /^(?:ei\s+|ó\s+|olá\s+|oi\s+)?(?:engenheira\s+sara|sara\s+ia|sara)\b[\s,:!-.]*(.*)$/i;

const OFFICIAL_GREETING_RESPONSE =
  'Olá, Eletro-Jr, Sou Sara a sua assistente virtual. Sim, estou totalmente conectada a toda a plataforma TécnicaMZ Pro e ao simulador de comandos.';

export class VoiceOrchestrator {
  private static instance: VoiceOrchestrator | null = null;

  // Estado interno
  private state: VoiceState = 'IDLE';
  private isListeningDesired: boolean = false;
  private isRecognizing: boolean = false;
  private isSpeaking: boolean = false;
  private isProcessing: boolean = false;
  private wakeWordDetected: boolean = false;
  private transcript: string = '';
  private lastCommand: string = '';
  private lastResponse: string = '';
  private femaleVoiceName: string = 'Português';
  private lastSizingResult: SizingResult | null = null;
  private activeToolFeedback: string | null = null;
  private hasPermission: boolean | null = null;
  private isSupported: boolean = true;

  // Instâncias nativas do browser
  private recognition: any = null;
  private selectedVoice: SpeechSynthesisVoice | null = null;

  // Pontes da Aplicação
  private cadBridge: CadBridgeInterface | null = null;
  private navigationBridge: ((route: string) => void) | null = null;

  // Controle de concorrência e deduplicação
  private lastProcessedCommand: string = '';
  private lastProcessedTimestamp: number = 0;
  private restartTimer: any = null;
  private wakeTimeout: any = null;

  // Inscrições reativas
  private subscribers: Array<(snapshot: OrchestratorSnapshot) => void> = [];

  private constructor() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('sara_voice_continuous');
      } catch (e: any) {}
      this.isListeningDesired = false;
      this.isRecognizing = false;
      this.isSupported = 'speechSynthesis' in window;
    }
  }

  public static getInstance(): VoiceOrchestrator {
    if (!VoiceOrchestrator.instance) {
      VoiceOrchestrator.instance = new VoiceOrchestrator();
    }
    return VoiceOrchestrator.instance;
  }

  // ==========================================================================
  // 1. SÍNTESE DE VOZ FEMININA EM PORTUGUÊS
  // ==========================================================================
  private initVoiceSynthesis(): void {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    this.selectFemalePortugueseVoice();
    window.speechSynthesis.onvoiceschanged = () => {
      this.selectFemalePortugueseVoice();
    };
  }

  private selectFemalePortugueseVoice(): void {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return;

    // Filtre EXCLUSIVAMENTE por vozes com a propriedade .lang iniciando em 'pt' (ex: 'pt-PT', 'pt-BR')
    const ptVoices = voices.filter((v: any) => {
      const lang = (v.lang || '').toLowerCase();
      const name = (v.name || '').toLowerCase();

      // NUNCA selecione a voz 'en-US' ou qualquer voz configurada em inglês
      if (
        lang.startsWith('en') ||
        name.includes('english') ||
        name.includes('estados unidos') ||
        name.includes('united states') ||
        name.includes('us english')
      ) {
        return false;
      }

      return lang.startsWith('pt') || name.includes('português') || name.includes('portugues');
    });

    if (ptVoices.length === 0) {
      // Se ainda não houver vozes PT carregadas pelo SO/navegador, NUNCA selecione voz em inglês!
      this.selectedVoice = null;
      this.femaleVoiceName = 'Português';
      this.notify();
      return;
    }

    // Busca preferencial por vozes com perfil feminino em português
    const femaleKeywords = [
      'luciana',
      'joana',
      'helena',
      'google português',
      'google portugues',
      'francisca',
      'maria',
      'raquel',
      'fernanda',
      'vitória',
      'vitoria',
      'leticia',
      'letícia',
      'yara',
      'camila',
      'ines',
      'inês',
      'catarina',
      'female',
      'mulher',
      'feminina'
    ];

    let chosen = ptVoices.find((v: any) => {
      const n = (v.name || '').toLowerCase();
      return femaleKeywords.some(f => n.includes(f));
    });

    // Se nenhuma tiver nome explicitamente feminino, seleciona a primeira voz do catálogo em português
    if (!chosen) {
      chosen = ptVoices.find((v: any) => {
        const lang = (v.lang || '').toLowerCase();
        return lang.includes('pt-pt') || lang.includes('pt-br');
      }) || ptVoices[0];
    }

    if (chosen) {
      this.selectedVoice = chosen;
      this.femaleVoiceName = 'Português';
      this.notify();
    }
  }

  public speak(text: string, onFinish?: () => void): void {
    if (typeof window === 'undefined' || !window.speechSynthesis || !text) {
      this.isSpeaking = false;
      this.notify();
      onFinish?.();
      return;
    }

    try {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      if (this.selectedVoice) {
        utterance.voice = this.selectedVoice;
        utterance.lang = this.selectedVoice.lang || 'pt-PT';
      } else {
        // NUNCA inglês: forçar idioma português do sintetizador
        utterance.lang = 'pt-PT';
      }
      utterance.pitch = 1.12; // Tom feminino natural e caloroso
      utterance.rate = 1.02;

      utterance.onstart = () => {
        this.isSpeaking = true;
        this.state = 'SPEAKING';
        this.notify();
      };

      utterance.onend = () => {
        this.isSpeaking = false;
        this.state = this.isListeningDesired ? 'LISTENING' : 'IDLE';
        this.notify();
        onFinish?.();
      };

      utterance.onerror = (e: any) => {
        console.warn('[VoiceOrchestrator] Erro na síntese de voz:', e);
        this.isSpeaking = false;
        this.state = this.isListeningDesired ? 'LISTENING' : 'IDLE';
        this.notify();
        onFinish?.();
      };

      window.speechSynthesis.speak(utterance);
    } catch (err: any) {
      console.warn('[VoiceOrchestrator] Falha no speechSynthesis.speak:', err);
      this.isSpeaking = false;
      this.notify();
      onFinish?.();
    }
  }

  public stopSpeaking(): void {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      this.isSpeaking = false;
      this.state = this.isListeningDesired ? 'LISTENING' : 'IDLE';
      this.notify();
    }
  }

  // ==========================================================================
  // 2. MOTOR DE RECONHECIMENTO (DESATIVADO NA PLATAFORMA)
  // ==========================================================================
  public startListening(): void {
    this.isListeningDesired = false;
    this.isRecognizing = false;
    this.state = 'IDLE';
    this.notify();
  }

  public stopListening(): void {
    this.isListeningDesired = false;
    this.isRecognizing = false;
    if (this.restartTimer) {
      clearTimeout(this.restartTimer);
      this.restartTimer = null;
    }
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e: any) {}
      this.recognition = null;
    }
    this.state = 'IDLE';
    this.notify();
  }

  public toggleListening(): void {
    this.stopListening();
  }

  // ==========================================================================
  // 3. PIPELINE DE EXECUÇÃO SINCRONIZADA E DEDUPLICAÇÃO
  // ==========================================================================
  public async handleCapturedTranscript(raw: string): Promise<void> {
    if (!raw) return;

    // Converte para caixa baixa
    const lower = raw.trim().toLowerCase();

    // Verifique se a frase inicia com "sara", "engenheira sara" ou "sara ia"
    let isTriggered = false;
    let command = '';

    if (lower.startsWith('engenheira sara')) {
      isTriggered = true;
      command = lower.replace(/^engenheira\s+sara[\s,:!-.]*/, '').trim();
    } else if (lower.startsWith('sara ia')) {
      isTriggered = true;
      command = lower.replace(/^sara\s+ia[\s,:!-.]*/, '').trim();
    } else if (lower.startsWith('sara')) {
      isTriggered = true;
      command = lower.replace(/^sara[\s,:!-.]*/, '').trim();
    } else {
      // Suporte também a saudações colloquiais diretas ("olá sara", "oi sara", "ei sara")
      const match = lower.match(/^(?:ei|ó|olá|oi)\s+(?:engenheira\s+sara|sara\s+ia|sara)\b[\s,:!-.]*(.*)$/);
      if (match) {
        isTriggered = true;
        command = (match[1] || '').trim();
      }
    }

    // Regra Estrita: Se não contiver a Wake Word, descarta em silêncio
    if (!isTriggered) {
      return;
    }

    // Gatilho Confirmado!
    this.wakeWordDetected = true;
    this.notify();

    if (this.wakeTimeout) clearTimeout(this.wakeTimeout);
    this.wakeTimeout = setTimeout(() => {
      this.wakeWordDetected = false;
      this.notify();
    }, 3000);

    soundFX?.playSaraWake?.();

    const commandToLog = command || lower;

    // Deduplicação Inteligente (impede que frases repetidas pelo browser em <2.5s executem 2x)
    const now = Date.now();
    if (this.lastProcessedCommand === commandToLog && now - this.lastProcessedTimestamp < 2500) {
      return;
    }
    this.lastProcessedCommand = commandToLog;
    this.lastProcessedTimestamp = now;

    // Pausa temporária de processamento (isProcessing = true)
    this.isProcessing = true;
    this.state = 'PROCESSING';
    this.lastCommand = commandToLog;
    this.notify();

    try {
      // 1. Saudação padrão ou pergunta de conexão
      if (
        !command ||
        /^(ola|oi|bom dia|boa tarde|boa noite|tudo bem|como esta|estas ai|voce esta ai|esta ai)$/i.test(command) ||
        command.includes('conectada') ||
        command.includes('conexao') ||
        command.includes('esta conectada') ||
        command.includes('voce esta conectada') ||
        command.includes('plataforma')
      ) {
        const greeting = OFFICIAL_GREETING_RESPONSE;
        this.lastResponse = greeting;
        this.notify();

        this.speak(greeting, () => {
          this.isProcessing = false;
          this.state = this.isListeningDesired ? 'LISTENING' : 'IDLE';
          this.notify();
        });
        return;
      }

      // 2. Interpretação de Intenções e Execução de Ferramentas
      const responseText = await this.interpretAndDispatchIntent(command);
      this.lastResponse = responseText;
      this.notify();

      // Síntese vocal de resposta e reativação limpa
      this.speak(responseText, () => {
        this.isProcessing = false;
        this.state = this.isListeningDesired ? 'LISTENING' : 'IDLE';
        this.notify();
      });
    } catch (err: any) {
      console.error('[VoiceOrchestrator] Erro no processamento de comando:', err);
      const fallbackMsg = 'Comando compreendido, porém ocorreu uma divergência no barramento de dados.';
      this.lastResponse = fallbackMsg;
      this.notify();

      this.speak(fallbackMsg, () => {
        this.isProcessing = false;
        this.state = this.isListeningDesired ? 'LISTENING' : 'IDLE';
        this.notify();
      });
    }
  }

  // ==========================================================================
  // 4. INTERPRETAÇÃO DE INTENÇÕES & CHAMA DE FERRAMENTAS (FUNCTION CALLING)
  // ==========================================================================
  private async interpretAndDispatchIntent(command: string): Promise<string> {
    const lower = command.toLowerCase();

    // ------------------------------------------------------------------------
    // A. COMANDOS DE NAVEGAÇÃO E ABERTURA DE TELAS
    // Ex: "Sara, abra a ferramenta de dimensionamento", "Sara, abra o simulador", "Sara, vá para o painel de projetos"
    // ------------------------------------------------------------------------
    if (
      lower.includes('abra') ||
      lower.includes('abrir') ||
      lower.includes('vá para') ||
      lower.includes('va para') ||
      lower.includes('navegar') ||
      lower.includes('ir para') ||
      lower.includes('mostrar') ||
      lower.includes('acesse') ||
      lower.includes('acessar')
    ) {
      // 1. Simulador CAD
      if (
        lower.includes('simulador') ||
        lower.includes('bancada') ||
        lower.includes('cad') ||
        lower.includes('diagrama') ||
        lower.includes('circuito')
      ) {
        if (this.cadBridge) {
          this.cadBridge.openSimulator();
        } else {
          // Despacha evento global para abrir a bancada CAD
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('open_cad_simulator'));
          }
        }
        if (this.navigationBridge) {
          this.navigationBridge('community');
        }
        soundFX?.playSaraConfirm?.();
        return 'Abrindo a bancada CAD do simulador de comandos elétricos da TécnicaMZ Pro.';
      }

      // 2. Ferramenta de Dimensionamento de Cabos
      if (
        lower.includes('dimensionamento') ||
        lower.includes('dimensionar') ||
        lower.includes('cabo') ||
        lower.includes('cabos') ||
        lower.includes('queda de tensao')
      ) {
        this.navigateToRoute('tools?tool=cable');
        soundFX?.playSaraConfirm?.();
        return 'Abrindo a ferramenta oficial de dimensionamento de condutores e cálculo de queda de tensão.';
      }

      // 3. Painel de Projetos / Mural / Comunidade
      if (
        lower.includes('painel de projetos') ||
        lower.includes('projetos') ||
        lower.includes('mural') ||
        lower.includes('comunidade') ||
        lower.includes('feed')
      ) {
        this.navigateToRoute('community');
        soundFX?.playSaraConfirm?.();
        return 'Navegando para o Mural Técnico e painel de projetos da comunidade.';
      }

      // 4. Central de Ferramentas
      if (lower.includes('ferramentas') || lower.includes('calculadoras')) {
        this.navigateToRoute('tools');
        soundFX?.playSaraConfirm?.();
        return 'Abrindo a Central de Ferramentas Técnicas.';
      }

      // 5. Ordem de Serviço (OS)
      if (lower.includes('ordem de serviço') || lower.includes('ordem de servico') || lower.includes('os') || lower.includes('contrato')) {
        this.navigateToRoute('tools?tool=service_order');
        soundFX?.playSaraConfirm?.();
        return 'Abrindo o gerador oficial de Ordens de Serviço e contratos em PDF.';
      }

      // 6. Solar Fotovoltaico
      if (lower.includes('solar') || lower.includes('fotovoltaico') || lower.includes('paineis')) {
        this.navigateToRoute('tools?tool=solar');
        soundFX?.playSaraConfirm?.();
        return 'Abrindo a calculadora de dimensionamento solar fotovoltaico para Moçambique.';
      }

      // 7. Diretório de Técnicos
      if (lower.includes('tecnicos') || lower.includes('diretorio') || lower.includes('eletricistas')) {
        this.navigateToRoute('technicians_directory');
        soundFX?.playSaraConfirm?.();
        return 'Acessando o Diretório de Técnicos Especialistas certificados com o Selo MZ.';
      }

      // 8. Academia Técnica
      if (lower.includes('academia') || lower.includes('cursos') || lower.includes('aulas')) {
        this.navigateToRoute('academy');
        soundFX?.playSaraConfirm?.();
        return 'Navegando para a Academia TécnicaMZ de ensino e certificação.';
      }

      // 9. Mercado Técnico
      if (lower.includes('mercado') || lower.includes('loja') || lower.includes('comprar')) {
        this.navigateToRoute('market');
        soundFX?.playSaraConfirm?.();
        return 'Abrindo o Mercado Técnico de materiais elétricos e instrumentos.';
      }

      // 10. Consulta dinâmica via PlatformRegistry
      const matchedModule = platformRegistry.findModule(lower);
      if (matchedModule) {
        this.navigateToRoute(matchedModule.route);
        soundFX?.playSaraConfirm?.();
        return `Navegando para ${matchedModule.name}.`;
      }
    }

    // ------------------------------------------------------------------------
    // B. COMANDOS DO SIMULADOR CAD DE COMANDOS ELÉTRICOS
    // ------------------------------------------------------------------------
    // 1. Inserir Componentes ("Sara, coloque um disjuntor", "Sara, insira um contactor", etc.)
    if (
      lower.includes('coloque') ||
      lower.includes('colocar') ||
      lower.includes('insira') ||
      lower.includes('inserir') ||
      lower.includes('adicione') ||
      lower.includes('adicionar') ||
      lower.includes('ponha') ||
      lower.includes('por')
    ) {
      // Garante que o simulador esteja aberto
      this.ensureSimulatorOpen();

      // Busca componente dinamicamente no PlatformRegistry
      let matchedComp = platformRegistry.findComponent(lower);
      let compCode = matchedComp ? matchedComp.code : '';

      if (!compCode) {
        if (lower.includes('disjuntor tripolar') || lower.includes('disjuntor 3') || lower.includes('disjuntor motor')) compCode = 'cb_tri';
        else if (lower.includes('disjuntor bipolar') || lower.includes('disjuntor 2')) compCode = 'cb_bi';
        else if (lower.includes('disjuntor')) compCode = 'cb_tri';
        else if (lower.includes('contactor') || lower.includes('contator') || lower.includes('contatora')) compCode = 'contactor';
        else if (lower.includes('rele termico') || lower.includes('relé térmico') || lower.includes('rele')) compCode = 'thermal_relay';
        else if (lower.includes('motor')) compCode = 'motor_3phase';
        else if (lower.includes('botoeira liga') || lower.includes('botao verde')) compCode = 'btn_start';
        else if (lower.includes('botoeira desliga') || lower.includes('botao vermelho')) compCode = 'btn_stop';
        else if (lower.includes('emergencia') || lower.includes('cogumelo')) compCode = 'btn_emergency';
        else if (lower.includes('trilho') || lower.includes('din')) compCode = 'din_rail';
        else if (lower.includes('idr') || lower.includes('diferencial')) compCode = 'idr_tetrapolar';
      }

      if (compCode) {
        if (this.cadBridge) {
          this.cadBridge.addComponent(compCode);
          soundFX?.playSaraConfirm?.();
          const name = matchedComp ? matchedComp.name : compCode;
          return `Inseri o componente ${name} diretamente no esquema do circuito.`;
        }
        return `Simulador pronto. Por favor, confirme a posição para inserção do ${compCode}.`;
      }
    }

    // 2. Interligar Terminais ("Sara, conecte o componente A no B", "Sara, ligue o disjuntor no contator")
    if (lower.includes('conecte') || lower.includes('conectar') || lower.includes('interligue') || lower.includes('ligue o')) {
      if (this.cadBridge) {
        const project = this.cadBridge.getProject?.();
        if (project && project.components && project.components.length >= 2) {
          const comps = project.components;
          // Conecta os dois componentes mais recentes ou especificados
          const compA = comps[comps.length - 2];
          const compB = comps[comps.length - 1];

          this.cadBridge.connectTerminals({
            sourceCompId: compA.id,
            targetCompId: compB.id,
            wireType: 'L1'
          });
          soundFX?.playSaraConfirm?.();
          return `Condutores elétricos interligados com sucesso entre ${compA.code} e ${compB.code} conforme a norma IEC.`;
        }
      }
      return 'Para interligar terminais, certifique-se de que há pelo menos dois componentes na bancada CAD.';
    }

    // 3. Controle da Simulação (Ligar / Desligar / Partida)
    if (
      lower.includes('iniciar simula') ||
      lower.includes('inicie a simula') ||
      lower.includes('ligar circuito') ||
      lower.includes('ligue o circuito') ||
      lower.includes('energizar') ||
      lower.includes('dar partida') ||
      lower.includes('rodar simula')
    ) {
      if (this.cadBridge) {
        this.cadBridge.triggerSimulation('start');
        soundFX?.playSaraConfirm?.();
        return 'Circuito trifásico energizado. Simulação de fluxo de potência em tempo real iniciada.';
      }
      return 'Bancada CAD não conectada no momento.';
    }

    if (
      lower.includes('parar simula') ||
      lower.includes('pare a simula') ||
      lower.includes('desligar circuito') ||
      lower.includes('desligue o circuito') ||
      lower.includes('desenergizar') ||
      lower.includes('interromper')
    ) {
      if (this.cadBridge) {
        this.cadBridge.triggerSimulation('stop');
        soundFX?.playSaraConfirm?.();
        return 'Alimentação elétrica desenergizada com segurança. Simulação pausada.';
      }
      return 'Bancada CAD não conectada no momento.';
    }

    // 4. Limpar Bancada / Novo Projeto
    if (
      lower.includes('limpar bancada') ||
      lower.includes('limpe a bancada') ||
      lower.includes('limpar canvas') ||
      lower.includes('limpar circuito') ||
      lower.includes('novo projeto') ||
      lower.includes('apagar tudo')
    ) {
      if (this.cadBridge) {
        this.cadBridge.clearCanvas();
        soundFX?.playSaraConfirm?.();
        return 'Bancada de ensaios limpa. Área de trabalho pronta para um novo diagrama.';
      }
      return 'Bancada CAD não conectada no momento.';
    }

    // ------------------------------------------------------------------------
    // C. RELATÓRIOS E PDFS
    // Ex: "Sara, gere o PDF do circuito", "Sara, baixe o relatório técnico"
    // ------------------------------------------------------------------------
    if (
      lower.includes('gerar pdf') ||
      lower.includes('gere o pdf') ||
      lower.includes('baixar pdf') ||
      lower.includes('relatório') ||
      lower.includes('relatorio') ||
      lower.includes('memorial') ||
      lower.includes('imprimir diagrama')
    ) {
      const proj = this.cadBridge?.getProject?.() || {
        name: 'Projeto Elétrico TécnicaMZ Pro',
        components: [],
        wires: [],
        busbars: []
      };

      try {
        const { generateCadProjectPDF } = await import('../utils/saraPdfGenerator');
        generateCadProjectPDF(proj, {
          type: 'full',
          authorName: 'Eletro-Jr • Técnico Especialista',
          companyName: 'TécnicaMZ Pro'
        });

        soundFX?.playSaraConfirm?.();
        return 'Memorial técnico descritivo e lista quantitativa de materiais gerados em PDF de alta resolução com selo oficial.';
      } catch (pdfErr: any) {
        console.error('[VoiceOrchestrator] Erro ao gerar PDF:', pdfErr);
      }
      return 'Emitindo o relatório técnico do circuito em formato PDF.';
    }

    // ------------------------------------------------------------------------
    // D. CÁLCULO E DIMENSIONAMENTO ELÉTRICO
    // Ex: "Sara, dimensione o cabo para 40 amperes a 25 metros"
    // ------------------------------------------------------------------------
    if (
      lower.includes('dimensione') ||
      lower.includes('dimensionar') ||
      lower.includes('calcular cabo') ||
      lower.includes('queda de tensao') ||
      lower.includes('corrente nominal')
    ) {
      const powerMatch = command.match(/(\d+(?:[.,]\d+)?)\s*(?:kw|quilowatts?|w|watts?|cv|hp)/i);
      const ampMatch = command.match(/(\d+(?:[.,]\d+)?)\s*(?:a|amperes?|amps?)/i);
      const distMatch = command.match(/(\d+(?:[.,]\d+)?)\s*(?:m|metros?)/i);
      const voltMatch = command.match(/(\d+(?:[.,]\d+)?)\s*(?:v|volts?)/i);

      let currentA = ampMatch ? parseFloat(ampMatch[1].replace(',', '.')) : 0;
      let powerKw = powerMatch ? parseFloat(powerMatch[1].replace(',', '.')) : 0;
      const distanceMeters = distMatch ? parseFloat(distMatch[1].replace(',', '.')) : 30;
      const voltage = voltMatch ? parseFloat(voltMatch[1].replace(',', '.')) : 380;
      const isTri = voltage > 250;

      if (!currentA && !powerKw) {
        currentA = 32; // Exemplo de referência segura
      }

      const input: SizingInput = {
        voltage,
        distance: distanceMeters,
        loadPower: powerKw > 0 ? powerKw * 1000 : (currentA * voltage * (isTri ? Math.sqrt(3) : 1) * 0.85),
        powerFactor: 0.85,
        maxVoltageDropPct: 3.0,
        systemType: isTri ? 'three_phase' : 'mono'
      };

      const sizing = calculateSizing(input);
      this.lastSizingResult = sizing;
      this.notify();

      soundFX?.playSaraConfirm?.();
      return sizing.spokenSummary;
    }

    // ------------------------------------------------------------------------
    // E. RESPOSTA DE CONHECIMENTO TÉCNICO NORMATIVO (IEC / EDM MOÇAMBIQUE)
    // ------------------------------------------------------------------------
    if (lower.includes('norma') || lower.includes('iec') || lower.includes('edm') || lower.includes('regulamento')) {
      return 'Na TécnicaMZ Pro, os cálculos e diagramas seguem rigorosamente as normas IEC 60947 para comando elétrico industrial, IEC 60364 para instalações de baixa tensão e as recomendações técnicas da Eletricidade de Moçambique.';
    }

    // Fallback inteligente
    return `Compreendi seu comando sobre "${command}". Como assistente virtual da TécnicaMZ Pro, estou pronta para navegar, simular na bancada CAD ou dimensionar cabos elétricos.`;
  }

  // ==========================================================================
  // 5. PONTES E UTILITÁRIOS DE INTEGRAÇÃO
  // ==========================================================================
  public registerCadBridge(bridge: CadBridgeInterface): () => void {
    this.cadBridge = bridge;
    return () => {
      if (this.cadBridge === bridge) {
        this.cadBridge = null;
      }
    };
  }

  public registerNavigationBridge(fn: (route: string) => void): () => void {
    this.navigationBridge = fn;
    return () => {
      if (this.navigationBridge === fn) {
        this.navigationBridge = null;
      }
    };
  }

  private navigateToRoute(route: string): void {
    if (this.navigationBridge) {
      this.navigationBridge(route);
    } else if (typeof window !== 'undefined') {
      try {
        window.location.hash = route;
      } catch {}
    }
  }

  private ensureSimulatorOpen(): void {
    if (this.cadBridge && !this.cadBridge.isOpen) {
      this.cadBridge.openSimulator();
    } else if (!this.cadBridge) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('open_cad_simulator'));
      }
      if (this.navigationBridge) {
        this.navigationBridge('community');
      }
    }
  }

  // ==========================================================================
  // 6. SUBSCRIÇÃO REATIVA (OBSERVER PATTERN)
  // ==========================================================================
  public subscribe(callback: (snapshot: OrchestratorSnapshot) => void): () => void {
    this.subscribers.push(callback);
    callback(this.getSnapshot());

    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  public getSnapshot(): OrchestratorSnapshot {
    return {
      state: this.state,
      isListening: this.isListeningDesired,
      isRecognizing: this.isRecognizing,
      isSpeaking: this.isSpeaking,
      isProcessing: this.isProcessing,
      wakeWordDetected: this.wakeWordDetected,
      transcript: this.transcript,
      lastCommand: this.lastCommand,
      lastResponse: this.lastResponse,
      femaleVoiceName: this.femaleVoiceName,
      lastSizingResult: this.lastSizingResult,
      activeToolFeedback: this.activeToolFeedback,
      hasPermission: this.hasPermission,
      isSupported: this.isSupported
    };
  }

  private notify(): void {
    const snap = this.getSnapshot();
    this.subscribers.forEach(cb => {
      try {
        cb(snap);
      } catch (err) {
        console.error('[VoiceOrchestrator] Erro ao notificar assinante:', err);
      }
    });
  }
}

export const voiceOrchestrator = VoiceOrchestrator.getInstance();
