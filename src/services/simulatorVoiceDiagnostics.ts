// ============================================================================
// TÉCNICAMZ PRO — MOTOR DE DIAGNÓSTICO ELÉTRICO, PROTEÇÃO MECÂNICA
// E AVISOS TÉCNICOS POR VOZ DO SIMULADOR CAD (IEC 60947 / IEC 60364)
// Síntese de voz feminina em Português estritamente limitada ao simulador
// ============================================================================

export type DiagnosticSeverity = 1 | 2 | 3; // 1 = Crítico/Emergência, 2 = Advertência/Técnico, 3 = Informativo/Status

export type DiagnosticCategory = 'solar' | 'residential' | 'automation' | 'industrial';

export type DiagnosticVisualEffect = 'sparks' | 'thermal' | 'led_inverter' | 'tripped_breaker' | 'none';

export interface DiagnosticEventDef {
  code: string;
  category: DiagnosticCategory;
  level: DiagnosticSeverity;
  spokenText: string;
  title: string;
  norma: string;
  visualEffect: DiagnosticVisualEffect;
  cooldownMs: number; // Intervalo de silêncio para evitar repetição (5s a 10s)
}

export interface DiagnosticLogEntry {
  id: string;
  time: string;
  timestamp: number;
  code: string;
  level: DiagnosticSeverity;
  category: DiagnosticCategory;
  title: string;
  spokenText: string;
  norma: string;
  visualEffect: DiagnosticVisualEffect;
  targetComponentId?: string;
}

export interface DiagnosticEngineState {
  isMuted: boolean;
  volume: number; // 0.0 a 1.0
  isSpeaking: boolean;
  activeAlert: DiagnosticLogEntry | null;
  logs: DiagnosticLogEntry[];
  selectedVoiceName: string;
}

// ============================================================================
// CATÁLOGO OFICIAL DE EVENTOS E AVISOS TÉCNICOS DE VOZ
// ============================================================================
export const DIAGNOSTIC_CATALOG: Record<string, DiagnosticEventDef> = {
  // A. SISTEMAS FOTOVOLTAICOS (SOLAR CC/CA)
  PV_REVERSE_POLARITY: {
    code: 'PV_REVERSE_POLARITY',
    category: 'solar',
    level: 1, // Crítico
    spokenText: 'Alerta crítico! Polaridade invertida na entrada CC do inversor fotovoltaico.',
    title: 'Inversão de Polaridade CC',
    norma: 'IEC 62548 / IEC 62109-1',
    visualEffect: 'led_inverter',
    cooldownMs: 8000
  },
  PV_STRING_OVERVOLTAGE: {
    code: 'PV_STRING_OVERVOLTAGE',
    category: 'solar',
    level: 2, // Advertência
    spokenText: 'Tensão de circuito aberto da string acima do limite do MPPT.',
    title: 'Sobretensão de String Fotovoltaica',
    norma: 'IEC 62548 (Voc > Vmax MPPT)',
    visualEffect: 'led_inverter',
    cooldownMs: 7000
  },
  PV_SPD_TRIPPED: {
    code: 'PV_SPD_TRIPPED',
    category: 'solar',
    level: 1, // Crítico
    spokenText: 'Surto atmosférico detectado. Dispositivo de proteção contra surtos CC atuado.',
    title: 'Atuação de DPS CC',
    norma: 'IEC 61643-31 / IEC 60364-7-712',
    visualEffect: 'sparks',
    cooldownMs: 8000
  },
  PV_ISLANDING: {
    code: 'PV_ISLANDING',
    category: 'solar',
    level: 2, // Advertência
    spokenText: 'Rede concessionária ausente. Proteção anti-ilhamento ativada no inversor.',
    title: 'Ilhamento (Grid-Tie)',
    norma: 'IEC 62116 / IEEE 1547 (Anti-islanding)',
    visualEffect: 'led_inverter',
    cooldownMs: 8000
  },

  // B. INSTALAÇÕES RESIDENCIAIS E COMERCIAIS
  RES_OUTLET_OVERLOAD: {
    code: 'RES_OUTLET_OVERLOAD',
    category: 'residential',
    level: 2, // Advertência
    spokenText: 'Aviso de sobrecarga no circuito de tomadas. Disjuntor termomagnético atuado.',
    title: 'Sobrecarga em Tomadas (TUG/TUE)',
    norma: 'IEC 60898 / IEC 60364-4-43',
    visualEffect: 'thermal',
    cooldownMs: 7000
  },
  RES_RCD_LEAKAGE: {
    code: 'RES_RCD_LEAKAGE',
    category: 'residential',
    level: 1, // Crítico/Emergência
    spokenText: 'Perigo de choque! Dispositivo DR atuado por fuga de corrente no circuito.',
    title: 'Fuga de Corrente (DR/IDR 30mA)',
    norma: 'IEC 61008 / IEC 60364-4-41 (Proteção Pessoal)',
    visualEffect: 'tripped_breaker',
    cooldownMs: 6000
  },
  RES_LIGHTING_SHORT: {
    code: 'RES_LIGHTING_SHORT',
    category: 'residential',
    level: 1, // Crítico/Emergência
    spokenText: 'Curto-circuito detectado na linha de iluminação. Proteção da fase ativada.',
    title: 'Curto-Circuito em Linha de Iluminação',
    norma: 'IEC 60898 (Disparo Magnético Instantâneo)',
    visualEffect: 'sparks',
    cooldownMs: 6000
  },
  RES_PHASE_UNBALANCE: {
    code: 'RES_PHASE_UNBALANCE',
    category: 'residential',
    level: 2, // Advertência
    spokenText: 'Advertência: Desequilíbrio de carga excessivo entre as fases L1, L2 e L3.',
    title: 'Desequilíbrio de Fases no QDL',
    norma: 'IEC 60364 / IEEE 1159 (Desbalanceamento > 15%)',
    visualEffect: 'thermal',
    cooldownMs: 8000
  },

  // C. COMUTAÇÃO, AUTOMAÇÃO E ILUMINAÇÃO
  AUTO_SWITCH_STAIRWAY: {
    code: 'AUTO_SWITCH_STAIRWAY',
    category: 'automation',
    level: 3, // Informativo
    spokenText: 'Comutação de iluminação efetuada com sucesso via interruptor intermediário.',
    title: 'Comutação de Escada (Three-Way / Four-Way)',
    norma: 'IEC 60669-1 / Comutação Cruzada',
    visualEffect: 'none',
    cooldownMs: 5000
  },
  AUTO_PHOTOCELL_ACTIVE: {
    code: 'AUTO_PHOTOCELL_ACTIVE',
    category: 'automation',
    level: 3, // Informativo
    spokenText: 'Sensor crepuscular acionado. Circuito de iluminação externa energizado.',
    title: 'Automação por Fotocélula / Crepuscular',
    norma: 'IEC 60669-2-1',
    visualEffect: 'none',
    cooldownMs: 6000
  },
  AUTO_OPEN_CIRCUIT_NO_LOAD: {
    code: 'AUTO_OPEN_CIRCUIT_NO_LOAD',
    category: 'automation',
    level: 3, // Informativo
    spokenText: 'Circuito aberto: Nenhuma carga detectada na saída do relé.',
    title: 'Falha de Carga / Lâmpada Ausente',
    norma: 'Diagnóstico Operacional / I = 0A',
    visualEffect: 'none',
    cooldownMs: 6000
  },
  AUTO_TIMER_EXPIRED: {
    code: 'AUTO_TIMER_EXPIRED',
    category: 'automation',
    level: 3, // Informativo
    spokenText: 'Tempo de permanência esgotado. Desligamento automático executado.',
    title: 'Temporizador / Minuteria Esgotado',
    norma: 'IEC 61812-1 (Temporização Concluída)',
    visualEffect: 'none',
    cooldownMs: 5000
  },

  // D. COMANDOS INDUSTRIAIS E MOTORES
  IND_BUSBAR_SHORT: {
    code: 'IND_BUSBAR_SHORT',
    category: 'industrial',
    level: 1, // Crítico/Emergência
    spokenText: 'Atenção! Curto-circuito detectado na barra de alimentação principal.',
    title: 'Curto-Circuito na Barra de Alimentação',
    norma: 'IEC 61439-1 / IEC 60947-2 (Icu Barramento)',
    visualEffect: 'sparks',
    cooldownMs: 6000
  },
  IND_THERMAL_RELAY: {
    code: 'IND_THERMAL_RELAY',
    category: 'industrial',
    level: 1, // Crítico
    spokenText: 'Sobrecarga no motor. Relé térmico F1 disparado. Aguarde o resfriamento.',
    title: 'Atuação do Relé Térmico Bimetálico (95-96 / 97-98)',
    norma: 'IEC 60947-4-1 (Classe 10A / Trip Térmico)',
    visualEffect: 'thermal',
    cooldownMs: 6000
  },
  IND_MOTOR_PHASE_REVERSE: {
    code: 'IND_MOTOR_PHASE_REVERSE',
    category: 'industrial',
    level: 2, // Advertência
    spokenText: 'Alerta de manobra! Inversão de fases na saída do contator. Sentido de rotação alterado.',
    title: 'Inversão de Fases em Motor Trifásico',
    norma: 'IEC 60034-8 (Sentido Anti-horário / Reversão)',
    visualEffect: 'thermal',
    cooldownMs: 6000
  },
  IND_INTERLOCK_MISSING: {
    code: 'IND_INTERLOCK_MISSING',
    category: 'industrial',
    level: 2, // Advertência
    spokenText: 'Advertência: Tentativa de acionamento simultâneo de contatores sem intertravamento.',
    title: 'Falta de Intertravamento Mecânico/Elétrico',
    norma: 'IEC 60947-4-1 (Bloqueio de Curto entre Fases)',
    visualEffect: 'sparks',
    cooldownMs: 6000
  }
};

// ============================================================================
// CLASSE SINGLETON: SIMULATOR VOICE & DIAGNOSTICS ENGINE
// ============================================================================
export class SimulatorVoiceDiagnosticEngine {
  private static instance: SimulatorVoiceDiagnosticEngine | null = null;

  private isMuted: boolean = false;
  private volume: number = 0.9;
  private isSpeaking: boolean = false;
  private activeAlert: DiagnosticLogEntry | null = null;
  private logs: DiagnosticLogEntry[] = [];
  private selectedVoice: SpeechSynthesisVoice | null = null;
  private selectedVoiceName: string = 'Português';

  // Fila de prioridade: itens armazenados por prioridade (1 = maior urgência)
  private queue: DiagnosticEventDef[] = [];
  private lastSpokenMap: Map<string, number> = new Map();
  private subscribers: Array<(state: DiagnosticEngineState) => void> = [];

  private constructor() {
    if (typeof window !== 'undefined') {
      try {
        const savedMute = localStorage.getItem('sim_voice_mute');
        if (savedMute !== null) this.isMuted = savedMute === 'true';

        const savedVol = localStorage.getItem('sim_voice_volume');
        if (savedVol !== null) {
          const v = parseFloat(savedVol);
          if (!isNaN(v) && v >= 0 && v <= 1) this.volume = v;
        }
      } catch (e: any) {}

      this.initSpeechSynthesis();
    }
  }

  public static getInstance(): SimulatorVoiceDiagnosticEngine {
    if (!SimulatorVoiceDiagnosticEngine.instance) {
      SimulatorVoiceDiagnosticEngine.instance = new SimulatorVoiceDiagnosticEngine();
    }
    return SimulatorVoiceDiagnosticEngine.instance;
  }

  // --------------------------------------------------------------------------
  // SÍNTESE DE VOZ FEMININA EM PORTUGUÊS (EXCLUSIVA DO SIMULADOR)
  // --------------------------------------------------------------------------
  private initSpeechSynthesis(): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices || voices.length === 0) return;

      // Filtrar estritamente vozes em Português
      const ptVoices = voices.filter((v: any) => {
        const lang = (v.lang || '').toLowerCase();
        const name = (v.name || '').toLowerCase();

        // Rejeita dialetos em inglês
        if (
          lang.startsWith('en') ||
          name.includes('english') ||
          name.includes('united states') ||
          name.includes('estados unidos')
        ) {
          return false;
        }

        return lang.startsWith('pt') || name.includes('português') || name.includes('portugues');
      });

      if (ptVoices.length === 0) {
        this.selectedVoice = null;
        this.selectedVoiceName = 'Português';
        return;
      }

      // Procura nomes femininos conhecidos
      const femaleKeywords = [
        'luciana',
        'joana',
        'helena',
        'francisca',
        'maria',
        'raquel',
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

      if (!chosen) {
        chosen = ptVoices.find((v: any) => {
          const lang = (v.lang || '').toLowerCase();
          return lang.includes('pt-pt') || lang.includes('pt-br');
        }) || ptVoices[0];
      }

      if (chosen) {
        this.selectedVoice = chosen;
        this.selectedVoiceName = 'Português';
      }
      this.notify();
    };

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }

  // --------------------------------------------------------------------------
  // DISPARAR DIAGNÓSTICO / EVENTO DE PROTEÇÃO
  // --------------------------------------------------------------------------
  public trigger(eventCode: string, targetComponentId?: string): boolean {
    const def = DIAGNOSTIC_CATALOG[eventCode];
    if (!def) return false;

    const now = Date.now();
    const lastSpoken = this.lastSpokenMap.get(eventCode) || 0;
    const elapsed = now - lastSpoken;

    // Se estiver dentro do intervalo de silêncio (cooldown), não repete a voz,
    // mas se for nível 1 (crítico), permitimos registrar novamente após pelo menos 4s
    const minCooldown = def.level === 1 ? Math.min(def.cooldownMs, 5000) : def.cooldownMs;
    if (elapsed < minCooldown) {
      return false;
    }

    // Registra no Log Técnico de Ocorrências
    const logItem: DiagnosticLogEntry = {
      id: `LOG_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      time: new Date().toLocaleTimeString(),
      timestamp: now,
      code: def.code,
      level: def.level,
      category: def.category,
      title: def.title,
      spokenText: def.spokenText,
      norma: def.norma,
      visualEffect: def.visualEffect,
      targetComponentId
    };

    this.logs.unshift(logItem);
    if (this.logs.length > 80) this.logs.pop();

    this.lastSpokenMap.set(eventCode, now);
    this.activeAlert = logItem;

    // Se nível 1 (Emergência/Crítico), limpa fila de prioridades mais baixas para tocar imediatamente!
    if (def.level === 1) {
      this.queue = [def];
      if (typeof window !== 'undefined' && 'speechSynthesis' in window && this.isSpeaking) {
        try {
          window.speechSynthesis.cancel();
        } catch (e: any) {}
      }
      this.playNextInQueue();
    } else {
      // Inserção ordenada por prioridade (1 antes de 2, 2 antes de 3)
      const insertIdx = this.queue.findIndex(item => item.level > def.level);
      if (insertIdx === -1) {
        this.queue.push(def);
      } else {
        this.queue.splice(insertIdx, 0, def);
      }

      if (!this.isSpeaking) {
        this.playNextInQueue();
      }
    }

    this.notify();
    return true;
  }

  // --------------------------------------------------------------------------
  // FILA DE EXECUÇÃO DE VOZ E MODERAÇÃO
  // --------------------------------------------------------------------------
  private playNextInQueue(): void {
    if (this.queue.length === 0) {
      this.isSpeaking = false;
      this.notify();
      return;
    }

    const nextDef = this.queue.shift()!;

    // Se estiver mutado, não sintetiza voz, mas já registrou o log visual
    if (this.isMuted || this.volume <= 0) {
      this.isSpeaking = false;
      // Drena fila sem emitir som
      this.queue = [];
      this.notify();
      return;
    }

    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      this.isSpeaking = false;
      this.notify();
      return;
    }

    try {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(nextDef.spokenText);
      if (this.selectedVoice) {
        utterance.voice = this.selectedVoice;
        utterance.lang = this.selectedVoice.lang || 'pt-PT';
      } else {
        utterance.lang = 'pt-PT';
      }

      utterance.volume = Math.max(0, Math.min(1, this.volume));
      utterance.pitch = 1.12; // Tom feminino natural
      utterance.rate = 1.04;  // Velocidade técnica nítida

      this.isSpeaking = true;
      this.notify();

      utterance.onend = () => {
        this.isSpeaking = false;
        // Intervalo de silêncio de 500ms entre falas consecutivas
        setTimeout(() => {
          this.playNextInQueue();
        }, 500);
      };

      utterance.onerror = () => {
        this.isSpeaking = false;
        this.playNextInQueue();
      };

      window.speechSynthesis.speak(utterance);
    } catch (e: any) {
      this.isSpeaking = false;
      this.playNextInQueue();
    }
  }

  // --------------------------------------------------------------------------
  // CONTROLES DE VOLUME E MUTE
  // --------------------------------------------------------------------------
  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    try {
      localStorage.setItem('sim_voice_mute', muted ? 'true' : 'false');
    } catch (e: any) {}

    if (muted && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e: any) {}
      this.isSpeaking = false;
      this.queue = [];
    }
    this.notify();
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  public setVolume(vol: number): void {
    const clamped = Math.max(0, Math.min(1, vol));
    this.volume = clamped;
    try {
      localStorage.setItem('sim_voice_volume', clamped.toString());
    } catch (e: any) {}
    this.notify();
  }

  public clearLogs(): void {
    this.logs = [];
    this.activeAlert = null;
    this.notify();
  }

  public speakCustomAlert(
    title: string,
    spokenText: string,
    visualEffect: DiagnosticVisualEffect = 'sparks',
    level: DiagnosticSeverity = 1,
    cooldownKey: string = 'custom_alert'
  ): boolean {
    const now = Date.now();
    const lastSpoken = this.lastSpokenMap.get(cooldownKey) || 0;
    if (now - lastSpoken < 4000) {
      return false;
    }
    this.lastSpokenMap.set(cooldownKey, now);

    const logItem: DiagnosticLogEntry = {
      id: `LOG_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      time: new Date().toLocaleTimeString(),
      timestamp: now,
      code: cooldownKey.toUpperCase(),
      level,
      category: 'industrial',
      title,
      spokenText,
      norma: 'IEC 60947 / IEC 60364',
      visualEffect
    };

    this.logs.unshift(logItem);
    if (this.logs.length > 80) this.logs.pop();
    this.activeAlert = logItem;

    const pseudoDef: DiagnosticEventDef = {
      code: cooldownKey.toUpperCase(),
      category: 'industrial',
      level,
      spokenText,
      title,
      norma: 'IEC 60947 / IEC 60364',
      visualEffect,
      cooldownMs: 4000
    };

    if (level === 1) {
      this.queue = [pseudoDef];
      if (typeof window !== 'undefined' && 'speechSynthesis' in window && this.isSpeaking) {
        try {
          window.speechSynthesis.cancel();
        } catch (e: any) {}
      }
      this.playNextInQueue();
    } else {
      this.queue.push(pseudoDef);
      if (!this.isSpeaking) {
        this.playNextInQueue();
      }
    }

    this.notify();
    return true;
  }

  public stopAll(): void {
    this.queue = [];
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e: any) {}
    }
    this.isSpeaking = false;
    this.notify();
  }

  // --------------------------------------------------------------------------
  // INSCRIÇÃO E ESTADO REATIVO (REACT COMPLIANT)
  // --------------------------------------------------------------------------
  public getState(): DiagnosticEngineState {
    return {
      isMuted: this.isMuted,
      volume: this.volume,
      isSpeaking: this.isSpeaking,
      activeAlert: this.activeAlert,
      logs: [...this.logs],
      selectedVoiceName: this.selectedVoiceName
    };
  }

  public subscribe(cb: (state: DiagnosticEngineState) => void): () => void {
    this.subscribers.push(cb);
    cb(this.getState());
    return () => {
      this.subscribers = this.subscribers.filter(s => s !== cb);
    };
  }

  private notify(): void {
    const s = this.getState();
    this.subscribers.forEach(cb => {
      try {
        cb(s);
      } catch (e: any) {}
    });
  }
}

export const simulatorDiagnostics = SimulatorVoiceDiagnosticEngine.getInstance();
