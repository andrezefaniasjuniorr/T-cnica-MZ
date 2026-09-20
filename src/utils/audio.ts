// Sistema de Efeitos Sonoros com Web Audio API para TécnicaMZ Pro
// Zero dependências externas, carregamento instantâneo e desbloqueio resiliente ao primeiro toque

class SoundFXManager {
  private ctx: AudioContext | null = null;
  private isUnlocked: boolean = false;
  private enabled: boolean = true;

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('tecnicamz_sfx_enabled');
        this.enabled = saved !== null ? saved === 'true' : true;
      } catch {
        this.enabled = true;
      }

      // Desbloqueia o AudioContext no primeiro gesto do utilizador (evita bloqueio de autostart)
      const unlock = () => {
        this.initContext();
        if (this.ctx && this.ctx.state === 'suspended') {
          this.ctx.resume().catch(() => {});
        }
        this.isUnlocked = true;
        window.removeEventListener('pointerdown', unlock);
        window.removeEventListener('keydown', unlock);
        window.removeEventListener('touchstart', unlock);
      };

      window.addEventListener('pointerdown', unlock, { passive: true });
      window.addEventListener('keydown', unlock, { passive: true });
      window.addEventListener('touchstart', unlock, { passive: true });
    }
  }

  private initContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      } catch (err) {
        console.warn('Web Audio API não disponível:', err);
      }
    }
    return this.ctx;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public setEnabled(val: boolean) {
    this.enabled = val;
    try {
      localStorage.setItem('tecnicamz_sfx_enabled', String(val));
    } catch {}
  }

  public toggleSound(): boolean {
    this.setEnabled(!this.enabled);
    if (this.enabled) {
      this.playSuccess();
    }
    return this.enabled;
  }

  /**
   * Som de Like / Curtida:
   * Tom agudo e rápido (pop/ping luminoso de 520Hz a 1040Hz)
   */
  public playLike() {
    if (!this.enabled) return;
    const ctx = this.initContext();
    if (!ctx) return;
    try {
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(1040, now + 0.08);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.09);
    } catch {}
  }

  /**
   * Som de Postar / Publicar no Mural ou Stories:
   * Tom de confirmação / envio ascendente e polido
   */
  public playPost() {
    if (!this.enabled) return;
    const ctx = this.initContext();
    if (!ctx) return;
    try {
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});
      const now = ctx.currentTime;

      // Nota 1 (Dó 523Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(523.25, now);
      gain1.gain.setValueAtTime(0.15, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.12);

      // Nota 2 (Sol 784Hz)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(783.99, now + 0.08);
      gain2.gain.setValueAtTime(0.18, now + 0.08);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.26);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.08);
      osc2.stop(now + 0.26);
    } catch {}
  }

  /**
   * Som de Comentar:
   * Tom leve de mensagem enviada (blip suave em 580Hz -> 750Hz)
   */
  public playComment() {
    if (!this.enabled) return;
    const ctx = this.initContext();
    if (!ctx) return;
    try {
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(580, now);
      osc.frequency.exponentialRampToValueAtTime(760, now + 0.07);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch {}
  }

  /**
   * Som de Abrir Modal ou Menus:
   * Tom discreto de transição / expansão suave
   */
  public playModalOpen() {
    if (!this.enabled) return;
    const ctx = this.initContext();
    if (!ctx) return;
    try {
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(540, now + 0.06);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.07);
    } catch {}
  }

  /**
   * Som de Fechar Modal ou Menus:
   * Tom discreto de transição descendente
   */
  public playModalClose() {
    if (!this.enabled) return;
    const ctx = this.initContext();
    if (!ctx) return;
    try {
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(480, now);
      osc.frequency.exponentialRampToValueAtTime(260, now + 0.06);

      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.07);
    } catch {}
  }

  /**
   * Som de Sucesso ao ganhar pontos ou interagir no perfil:
   * Arpeggio ascendente festivo e vibrante (C5 -> E5 -> G5 -> C6)
   */
  public playSuccess() {
    if (!this.enabled) return;
    const ctx = this.initContext();
    if (!ctx) return;
    try {
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6

      notes.forEach((freq, idx) => {
        const start = now + idx * 0.06;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.12, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.12);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + 0.12);
      });
    } catch {}
  }

  /**
   * Som ao alternar abas / tabs
   */
  public playTabSwitch() {
    if (!this.enabled) return;
    const ctx = this.initContext();
    if (!ctx) return;
    try {
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(580, now + 0.04);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch {}
  }

  /**
   * Clique táctil / toque discreto em botão
   */
  public playClick() {
    if (!this.enabled) return;
    const ctx = this.initContext();
    if (!ctx) return;
    try {
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.03);

      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.03);
    } catch {}
  }

  /**
   * Alerta sonoro de desarme de disjuntor / curto-circuito / aviso de proteção
   */
  public playAlert() {
    if (!this.enabled) return;
    const ctx = this.initContext();
    if (!ctx) return;
    try {
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.setValueAtTime(160, now + 0.08);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.22);
    } catch {}
  }

  // ==========================================================================
  // EFEITOS SONOROS DE CAD ELÉTRICO INDUSTRIAL (WEB AUDIO API SINTETIZADA)
  // ==========================================================================

  // Nó contínuo do motor industrial
  private motorOsc: OscillatorNode | null = null;
  private motorSubOsc: OscillatorNode | null = null;
  private motorGain: GainNode | null = null;
  private motorFilter: BiquadFilterNode | null = null;
  private motorIsActive: boolean = false;

  /**
   * Som de Motores em Funcionamento (Monofásico, Trifásico ou CC):
   * Zumbido magnético 50Hz/60Hz e harmônicos com ruído de rotação e ventilação
   * proporcional à rotação (RPM) real com inércia mecânica suave.
   */
  public updateMotorSound(running: boolean, rpmRatio: number = 1.0, is3Phase: boolean = true) {
    if (!this.enabled) {
      this.stopMotorSound();
      return;
    }
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});
      const now = ctx.currentTime;

      if (running) {
        const clampedRpm = Math.max(0.05, Math.min(1.2, rpmRatio));
        const baseFreq = (is3Phase ? 50 : 60) * clampedRpm;
        const targetVol = 0.12 * Math.min(1.0, clampedRpm * 1.2);

        if (!this.motorIsActive || !this.motorGain || !this.motorOsc) {
          // Cria os nós de síntese do motor
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const filter = ctx.createBiquadFilter();
          const gain = ctx.createGain();

          osc1.type = 'sawtooth';
          osc1.frequency.setValueAtTime(baseFreq, now);

          osc2.type = 'triangle';
          osc2.frequency.setValueAtTime(baseFreq * 2, now); // Harmônica magnética

          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(280 + clampedRpm * 450, now);
          filter.Q.setValueAtTime(2.5, now);

          gain.gain.setValueAtTime(0.001, now);
          gain.gain.linearRampToValueAtTime(targetVol, now + 0.35); // Aceleração suave

          osc1.connect(filter);
          osc2.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);

          osc1.start(now);
          osc2.start(now);

          this.motorOsc = osc1;
          this.motorSubOsc = osc2;
          this.motorFilter = filter;
          this.motorGain = gain;
          this.motorIsActive = true;
        } else {
          // Atualiza parâmetros dinamicamente (aceleração/desaceleração)
          this.motorOsc.frequency.setTargetAtTime(baseFreq, now, 0.15);
          if (this.motorSubOsc) {
            this.motorSubOsc.frequency.setTargetAtTime(baseFreq * 2, now, 0.15);
          }
          if (this.motorFilter) {
            this.motorFilter.frequency.setTargetAtTime(280 + clampedRpm * 450, now, 0.15);
          }
          this.motorGain.gain.setTargetAtTime(targetVol, now, 0.2);
        }
      } else {
        this.stopMotorSound();
      }
    } catch {}
  }

  /**
   * Para os sons do motor com desaceleração e desvanecimento suave
   */
  public stopMotorSound() {
    if (!this.motorIsActive || !this.ctx || !this.motorGain) return;
    try {
      const now = this.ctx.currentTime;
      this.motorGain.gain.cancelScheduledValues(now);
      this.motorGain.gain.linearRampToValueAtTime(0.0001, now + 0.3);

      const oldOsc = this.motorOsc;
      const oldSub = this.motorSubOsc;
      setTimeout(() => {
        try {
          oldOsc?.stop();
          oldSub?.stop();
          oldOsc?.disconnect();
          oldSub?.disconnect();
        } catch {}
      }, 350);

      this.motorOsc = null;
      this.motorSubOsc = null;
      this.motorFilter = null;
      this.motorGain = null;
      this.motorIsActive = false;
    } catch {
      this.motorIsActive = false;
    }
  }

  /**
   * Curtos-Circuitos, Explosões e Faíscas de Arco Elétrico:
   * Estalo de alta intensidade, corte abrupto e descarga de arco elétrico
   */
  public playShortCircuitSpark() {
    if (!this.enabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});
      const now = ctx.currentTime;

      // 1. Ruído branco de explosão do arco (Buffer sintetizado na hora)
      const bufferSize = Math.floor(ctx.sampleRate * 0.22);
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.04));
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;

      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(1400, now);
      noiseFilter.frequency.exponentialRampToValueAtTime(200, now + 0.18);
      noiseFilter.Q.setValueAtTime(3.0, now);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.45, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      whiteNoise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(ctx.destination);

      whiteNoise.start(now);

      // 2. Estalo senoidal grave de deslocamento de ar (estouro da falha)
      const thumpOsc = ctx.createOscillator();
      const thumpGain = ctx.createGain();

      thumpOsc.type = 'sine';
      thumpOsc.frequency.setValueAtTime(160, now);
      thumpOsc.frequency.exponentialRampToValueAtTime(35, now + 0.2);

      thumpGain.gain.setValueAtTime(0.5, now);
      thumpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      thumpOsc.connect(thumpGain);
      thumpGain.connect(ctx.destination);

      thumpOsc.start(now);
      thumpOsc.stop(now + 0.22);
    } catch {}
  }

  /**
   * Atuação Mecânica de Atracamento de Contatores e Relés:
   * Som metálico, seco e pesado de impacto de armadura ferromagnética (IEC 60947).
   */
  public playContactorThump(isEngage: boolean = true) {
    if (!this.enabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});
      const now = ctx.currentTime;

      // Impulso mecânico principal
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = isEngage ? 'triangle' : 'sine';
      const startFreq = isEngage ? 125 : 95;
      const endFreq = isEngage ? 45 : 30;

      osc.frequency.setValueAtTime(startFreq, now);
      osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.08);

      gain.gain.setValueAtTime(isEngage ? 0.35 : 0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.09);

      // Ressonância metálica secundária dos contatos de cobre/prata
      const metalOsc = ctx.createOscillator();
      const metalGain = ctx.createGain();
      metalOsc.type = 'sawtooth';
      metalOsc.frequency.setValueAtTime(isEngage ? 820 : 650, now);
      metalOsc.frequency.exponentialRampToValueAtTime(350, now + 0.04);

      metalGain.gain.setValueAtTime(isEngage ? 0.08 : 0.04, now);
      metalGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      metalOsc.connect(metalGain);
      metalGain.connect(ctx.destination);

      metalOsc.start(now);
      metalOsc.stop(now + 0.05);
    } catch {}
  }

  /**
   * Som de Alavanca de Disjuntor / Seccionadora / Disparo de Proteção:
   * Som estalado e firme de mola de desarme ou rearme mecânico.
   */
  public playBreakerSwitch(isTripOrOff: boolean = false) {
    if (!this.enabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      if (isTripOrOff) {
        // Disparo rápido de mola
        osc.frequency.setValueAtTime(560, now);
        osc.frequency.exponentialRampToValueAtTime(110, now + 0.07);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      } else {
        // Arme firme de alavanca para cima (I)
        osc.frequency.setValueAtTime(240, now);
        osc.frequency.exponentialRampToValueAtTime(620, now + 0.06);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
      }

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch {}
  }

  /**
   * Botoeira Industrial Pulsadora (S0 NF / S1 NA):
   * Clique mecânico tátil ao pressionar ou liberar.
   */
  public playIndustrialPushButton(isPressed: boolean = true) {
    if (!this.enabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      const freq = isPressed ? 480 : 380;
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.5, now + 0.035);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch {}
  }

  // Nó de buzzer / sirene contínua
  private buzzerOsc: OscillatorNode | null = null;
  private buzzerGain: GainNode | null = null;
  private buzzerIsActive: boolean = false;

  /**
   * Sinalizador Acústico / Sirene / Buzzer Piezoelétrico:
   * Emite som contínuo ou bi-tonal quando o componente BUZZ estiver energizado.
   */
  public updateBuzzerSound(active: boolean, isPulsing: boolean = false) {
    if (!this.enabled) {
      this.stopBuzzerSound();
      return;
    }
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});
      const now = ctx.currentTime;

      if (active) {
        if (!this.buzzerIsActive || !this.buzzerGain || !this.buzzerOsc) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'square';
          osc.frequency.setValueAtTime(2400, now);

          if (isPulsing) {
            // Modulação bi-tonal
            osc.frequency.setValueAtTime(2400, now);
            osc.frequency.setValueAtTime(1800, now + 0.15);
          }

          gain.gain.setValueAtTime(0.001, now);
          gain.gain.linearRampToValueAtTime(0.08, now + 0.05);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now);

          this.buzzerOsc = osc;
          this.buzzerGain = gain;
          this.buzzerIsActive = true;
        }
      } else {
        this.stopBuzzerSound();
      }
    } catch {}
  }

  public stopBuzzerSound() {
    if (!this.buzzerIsActive || !this.ctx || !this.buzzerGain) return;
    try {
      const now = this.ctx.currentTime;
      this.buzzerGain.gain.linearRampToValueAtTime(0.0001, now + 0.05);
      const oldOsc = this.buzzerOsc;
      setTimeout(() => {
        try {
          oldOsc?.stop();
          oldOsc?.disconnect();
        } catch {}
      }, 60);
      this.buzzerOsc = null;
      this.buzzerGain = null;
      this.buzzerIsActive = false;
    } catch {
      this.buzzerIsActive = false;
    }
  }
}

export const soundFX = new SoundFXManager();
