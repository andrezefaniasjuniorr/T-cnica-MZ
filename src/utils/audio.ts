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

  /**
   * Som de acerto em avaliação/quiz acadêmico
   */
  public playCorrect() {
    this.playSuccess();
  }

  /**
   * Som de erro/alerta em avaliação/quiz acadêmico
   */
  public playIncorrect() {
    this.playAlert();
  }

  /**
   * Som de faísca / arco elétrico instantâneo
   */
  public playSparkSound() {
    this.playShortCircuitSpark();
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
   * proporcional à rotação (RPM) real com sincronização de inércia 100% perfeita.
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

      if (running && rpmRatio > 0.005) {
        const clampedRpm = Math.max(0.005, Math.min(1.2, rpmRatio));
        const baseFreq = (is3Phase ? 50 : 60) * clampedRpm;
        const targetVol = 0.15 * Math.pow(clampedRpm, 1.25);

        if (!this.motorIsActive || !this.motorGain || !this.motorOsc) {
          // Cria os nós de síntese do motor
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const filter = ctx.createBiquadFilter();
          const gain = ctx.createGain();

          osc1.type = 'sawtooth';
          osc1.frequency.setValueAtTime(baseFreq, now);

          osc2.type = 'triangle';
          osc2.frequency.setValueAtTime(baseFreq * 2, now); // Harmônica magnética do estator

          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(260 + clampedRpm * 480, now);
          filter.Q.setValueAtTime(2.2, now);

          gain.gain.setValueAtTime(0.001, now);
          gain.gain.linearRampToValueAtTime(targetVol, now + 0.05);

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
          // Resposta de baixa latência (0.04s) para rastrear a desaceleração em tempo real
          this.motorOsc.frequency.setTargetAtTime(baseFreq, now, 0.04);
          if (this.motorSubOsc) {
            this.motorSubOsc.frequency.setTargetAtTime(baseFreq * 2, now, 0.04);
          }
          if (this.motorFilter) {
            this.motorFilter.frequency.setTargetAtTime(260 + clampedRpm * 480, now, 0.04);
          }
          this.motorGain.gain.setTargetAtTime(targetVol, now, 0.04);
        }
      } else {
        this.stopMotorSound();
      }
    } catch {}
  }

  /**
   * Para os sons do motor sincronizado imediatamente com o repouso mecânico (0 RPM)
   */
  public stopMotorSound() {
    if (!this.motorIsActive || !this.ctx || !this.motorGain) return;
    try {
      const now = this.ctx.currentTime;
      this.motorGain.gain.cancelScheduledValues(now);
      this.motorGain.gain.linearRampToValueAtTime(0.0001, now + 0.03);

      const oldOsc = this.motorOsc;
      const oldSub = this.motorSubOsc;
      setTimeout(() => {
        try {
          oldOsc?.stop();
          oldSub?.stop();
          oldOsc?.disconnect();
          oldSub?.disconnect();
        } catch {}
      }, 35);

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
   * Curtos-Circuitos, Arcos Elétricos e Explosões:
   * Estalo agudo de descarga elétrica de alta tensão seguido do chiado característico da queima de arco.
   */
  public playShortCircuitSpark() {
    if (!this.enabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});
      const now = ctx.currentTime;

      // 1. Estalo agudo de ruptura dielétrica / plasma (impulse snap)
      const snapOsc = ctx.createOscillator();
      const snapGain = ctx.createGain();
      snapOsc.type = 'sawtooth';
      snapOsc.frequency.setValueAtTime(3200, now);
      snapOsc.frequency.exponentialRampToValueAtTime(180, now + 0.035);

      snapGain.gain.setValueAtTime(0.7, now);
      snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      snapOsc.connect(snapGain);
      snapGain.connect(ctx.destination);
      snapOsc.start(now);
      snapOsc.stop(now + 0.04);

      // 2. Deslocamento de ar / estampido subsônico de explosão do curto
      const boomOsc = ctx.createOscillator();
      const boomGain = ctx.createGain();
      boomOsc.type = 'sine';
      boomOsc.frequency.setValueAtTime(180, now);
      boomOsc.frequency.exponentialRampToValueAtTime(28, now + 0.25);

      boomGain.gain.setValueAtTime(0.85, now);
      boomGain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      boomOsc.connect(boomGain);
      boomGain.connect(ctx.destination);
      boomOsc.start(now);
      boomOsc.stop(now + 0.28);

      // 3. Chiado prolongado de queima de arco elétrico (~0.9s com modulação 100Hz da rede)
      const burnDuration = 0.95;
      const bufferSize = Math.floor(ctx.sampleRate * burnDuration);
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        const t = i / ctx.sampleRate;
        const mainsMod = 0.6 + 0.4 * Math.sin(2 * Math.PI * 100 * t);
        const decay = Math.exp(-t * 3.2);
        data[i] = (Math.random() * 2 - 1) * mainsMod * decay;
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;

      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(2200, now);
      noiseFilter.frequency.exponentialRampToValueAtTime(750, now + burnDuration);
      noiseFilter.Q.setValueAtTime(2.8, now);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.42, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + burnDuration);

      noiseSource.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(ctx.destination);

      noiseSource.start(now);
    } catch {}
  }

  /**
   * Atuação Mecânica Pesada de Contatores Industriais (IEC 60947):
   * Impacto grave e seco do núcleo magnético atracando (CLACK eletromecânico pesado)
   * e desatracamento por mola de alta pressão.
   */
  public playContactorThump(isEngage: boolean = true) {
    if (!this.enabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});
      const now = ctx.currentTime;

      if (isEngage) {
        // ATRACAMENTO: Impacto violento de armadura ferromagnética (CLACK pesado)
        // 1. Pancada subsônica do núcleo de ferro fundido (grave e encorpado)
        const coreOsc = ctx.createOscillator();
        const coreGain = ctx.createGain();
        coreOsc.type = 'triangle';
        coreOsc.frequency.setValueAtTime(85, now);
        coreOsc.frequency.exponentialRampToValueAtTime(28, now + 0.08);

        coreGain.gain.setValueAtTime(0.65, now);
        coreGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

        coreOsc.connect(coreGain);
        coreGain.connect(ctx.destination);
        coreOsc.start(now);
        coreOsc.stop(now + 0.09);

        // 2. Estalo metálico de impacto das pastilhas de prata/cobre (CLACK)
        const snapOsc = ctx.createOscillator();
        const snapGain = ctx.createGain();
        snapOsc.type = 'sawtooth';
        snapOsc.frequency.setValueAtTime(1450, now);
        snapOsc.frequency.exponentialRampToValueAtTime(220, now + 0.04);

        snapGain.gain.setValueAtTime(0.35, now);
        snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

        snapOsc.connect(snapGain);
        snapGain.connect(ctx.destination);
        snapOsc.start(now);
        snapOsc.stop(now + 0.045);

        // 3. Chattering / repique secundário de contatos (t = +14ms)
        const chatOsc = ctx.createOscillator();
        const chatGain = ctx.createGain();
        chatOsc.type = 'triangle';
        chatOsc.frequency.setValueAtTime(950, now + 0.014);
        chatOsc.frequency.exponentialRampToValueAtTime(300, now + 0.038);

        chatGain.gain.setValueAtTime(0.18, now + 0.014);
        chatGain.gain.exponentialRampToValueAtTime(0.001, now + 0.042);

        chatOsc.connect(chatGain);
        chatGain.connect(ctx.destination);
        chatOsc.start(now + 0.014);
        chatOsc.stop(now + 0.042);
      } else {
        // DESATRACAMENTO: Alívio de mola e recuo seco da armadura
        const relOsc = ctx.createOscillator();
        const relGain = ctx.createGain();
        relOsc.type = 'sine';
        relOsc.frequency.setValueAtTime(140, now);
        relOsc.frequency.exponentialRampToValueAtTime(45, now + 0.06);

        relGain.gain.setValueAtTime(0.38, now);
        relGain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

        relOsc.connect(relGain);
        relGain.connect(ctx.destination);
        relOsc.start(now);
        relOsc.stop(now + 0.07);

        // Estalo seco de separação de pastilha
        const snapOsc = ctx.createOscillator();
        const snapGain = ctx.createGain();
        snapOsc.type = 'triangle';
        snapOsc.frequency.setValueAtTime(780, now);
        snapOsc.frequency.exponentialRampToValueAtTime(240, now + 0.03);

        snapGain.gain.setValueAtTime(0.2, now);
        snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

        snapOsc.connect(snapGain);
        snapGain.connect(ctx.destination);
        snapOsc.start(now);
        snapOsc.stop(now + 0.035);
      }
    } catch {}
  }

  /**
   * Disjuntores Caixa Moldada (MCCB) e Disjuntores Modulares (MCB):
   * Som pesado de trava mecânica de alta pressão (Snap/Latch metálico encorpado).
   */
  public playBreakerSwitch(isTripOrOff: boolean = false) {
    if (!this.enabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});
      const now = ctx.currentTime;

      if (isTripOrOff) {
        // DESARME / DISPARO POR CURTO OU SOBRECARGA (Violento snap de mola + corpo metálico)
        const latchOsc = ctx.createOscillator();
        const latchGain = ctx.createGain();
        latchOsc.type = 'sawtooth';
        latchOsc.frequency.setValueAtTime(2200, now);
        latchOsc.frequency.exponentialRampToValueAtTime(260, now + 0.045);

        latchGain.gain.setValueAtTime(0.55, now);
        latchGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

        latchOsc.connect(latchGain);
        latchGain.connect(ctx.destination);
        latchOsc.start(now);
        latchOsc.stop(now + 0.05);

        // Batida grave de recuo da maneta plástica/metálica na carcaça
        const thudOsc = ctx.createOscillator();
        const thudGain = ctx.createGain();
        thudOsc.type = 'triangle';
        thudOsc.frequency.setValueAtTime(140, now);
        thudOsc.frequency.exponentialRampToValueAtTime(32, now + 0.075);

        thudGain.gain.setValueAtTime(0.6, now);
        thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        thudOsc.connect(thudGain);
        thudGain.connect(ctx.destination);
        thudOsc.start(now);
        thudOsc.stop(now + 0.08);

        // Ressonância acústica metálica de vibração de mola (1800Hz)
        const springOsc = ctx.createOscillator();
        const springGain = ctx.createGain();
        springOsc.type = 'sine';
        springOsc.frequency.setValueAtTime(1850, now);
        springOsc.frequency.exponentialRampToValueAtTime(620, now + 0.06);

        springGain.gain.setValueAtTime(0.2, now);
        springGain.gain.exponentialRampToValueAtTime(0.001, now + 0.065);

        springOsc.connect(springGain);
        springGain.connect(ctx.destination);
        springOsc.start(now);
        springOsc.stop(now + 0.065);
      } else {
        // ARME DE DISJUNTOR PARA CIMA (I): Engate firme com compressão de mola mecânica
        const armOsc = ctx.createOscillator();
        const armGain = ctx.createGain();
        armOsc.type = 'triangle';
        armOsc.frequency.setValueAtTime(180, now);
        armOsc.frequency.exponentialRampToValueAtTime(840, now + 0.055);

        armGain.gain.setValueAtTime(0.45, now);
        armGain.gain.exponentialRampToValueAtTime(0.001, now + 0.065);

        armOsc.connect(armGain);
        armGain.connect(ctx.destination);
        armOsc.start(now);
        armOsc.stop(now + 0.065);

        // Trava final (Click metálico firme)
        const lockOsc = ctx.createOscillator();
        const lockGain = ctx.createGain();
        lockOsc.type = 'sawtooth';
        lockOsc.frequency.setValueAtTime(1100, now + 0.035);
        lockOsc.frequency.exponentialRampToValueAtTime(320, now + 0.065);

        lockGain.gain.setValueAtTime(0.3, now + 0.035);
        lockGain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

        lockOsc.connect(lockGain);
        lockGain.connect(ctx.destination);
        lockOsc.start(now + 0.035);
        lockOsc.stop(now + 0.07);
      }
    } catch {}
  }

  /**
   * Botoeiras Industriais Pulsadoras de 22mm (S0 NF Vermelho / S1 NA Verde):
   * Som característico tátil de mola de retorno e chave microswitch industrial.
   */
  public playIndustrialPushButton(isPressed: boolean = true) {
    if (!this.enabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});
      const now = ctx.currentTime;

      // 1. Estalo nítido de contato tipo microswitch de 22mm
      const snapOsc = ctx.createOscillator();
      const snapGain = ctx.createGain();
      snapOsc.type = 'triangle';
      const snapFreq = isPressed ? 1420 : 1080;
      snapOsc.frequency.setValueAtTime(snapFreq, now);
      snapOsc.frequency.exponentialRampToValueAtTime(snapFreq * 0.25, now + 0.024);

      snapGain.gain.setValueAtTime(0.28, now);
      snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.028);

      snapOsc.connect(snapGain);
      snapGain.connect(ctx.destination);
      snapOsc.start(now);
      snapOsc.stop(now + 0.028);

      // 2. Ressonância acústica de compressão / expansão de mola helicoidal de 22mm
      const springOsc = ctx.createOscillator();
      const springGain = ctx.createGain();
      springOsc.type = 'sine';
      springOsc.frequency.setValueAtTime(isPressed ? 440 : 560, now);
      springOsc.frequency.exponentialRampToValueAtTime(160, now + 0.035);

      springGain.gain.setValueAtTime(0.18, now);
      springGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      springOsc.connect(springGain);
      springGain.connect(ctx.destination);
      springOsc.start(now);
      springOsc.stop(now + 0.04);
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

  /**
   * Som de Wake Word da Sara IA:
   * Chime cristalino ascendente duplo (F#5 -> C#6, 740Hz -> 1108Hz) indicando atenção imediata
   */
  public playSaraWake() {
    if (!this.enabled) return;
    const ctx = this.initContext();
    if (!ctx) return;
    try {
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});
      const now = ctx.currentTime;

      // Nota 1 (740 Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(739.99, now);
      gain1.gain.setValueAtTime(0.12, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.12);

      // Nota 2 (1108 Hz)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1108.73, now + 0.08);
      gain2.gain.setValueAtTime(0.15, now + 0.08);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.08);
      osc2.stop(now + 0.28);
    } catch {}
  }

  /**
   * Som de Ação Concluída pela Sara IA:
   * Acorde harmônico afirmativo e suave
   */
  public playSaraConfirm() {
    if (!this.enabled) return;
    const ctx = this.initContext();
    if (!ctx) return;
    try {
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});
      const now = ctx.currentTime;

      [523.25, 659.25, 783.99].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.04);
        gain.gain.setValueAtTime(0.08, now + i * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.04 + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.04);
        osc.stop(now + i * 0.04 + 0.2);
      });
    } catch {}
  }
}

export const soundFX = new SoundFXManager();
