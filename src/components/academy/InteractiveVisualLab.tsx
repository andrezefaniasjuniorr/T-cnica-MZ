import React, { useState, useEffect, useRef } from 'react';
import {
  Zap,
  Activity,
  Play,
  Pause,
  RotateCcw,
  Sliders,
  Cpu,
  Compass,
  Layers,
  ShieldCheck,
  Radio,
  Eye,
  Sun,
  Flame,
  Power,
  ToggleLeft,
  ToggleRight,
  Info
} from 'lucide-react';
import { soundFX } from '../../utils/audio';

export type LabMode =
  | 'current_flow'      // 1. Fluxo de Corrente DC e AC Senoidal com Elétrons
  | 'electrostatics'   // 2. Eletrostática, Campo Elétrico & Capacitores
  | 'electromagnetism'  // 3. Bobinas, Campo Magnético B & Transformadores
  | 'switching_control' // 4. Comandos Three-Way/Four-Way & Partida Direta de Motor
  | 'electronics';      // 5. Diodos, Retificador Graetz, Transistor BJT & PWM

export interface InteractiveVisualLabProps {
  initialMode?: LabMode;
  lessonCode?: string;
  lessonTitle?: string;
  norma?: string;
  baseFontSize?: number;
  className?: string;
}

export const InteractiveVisualLab: React.FC<InteractiveVisualLabProps> = ({
  initialMode,
  lessonCode = '',
  lessonTitle = '',
  norma = 'IEC 60364',
  baseFontSize = 15,
  className = ''
}) => {
  // Resolução inteligente do modo padrão com base na lição
  const resolvedDefaultMode: LabMode = React.useMemo(() => {
    if (initialMode) return initialMode;
    const code = (lessonCode || '').toLowerCase();
    const title = (lessonTitle || '').toLowerCase();

    if (code.includes('ec 1.') || code.includes('ec1.') || title.includes('física') || title.includes('ohm') || title.includes('kirchhoff') || title.includes('potência')) {
      return 'current_flow';
    }
    if (code.includes('ec 2.') || code.includes('ec2.') || title.includes('ilumina') || title.includes('three-way') || title.includes('four-way') || title.includes('comutador')) {
      return 'switching_control';
    }
    if (code.includes('ec 3.') || code.includes('ec3.') || title.includes('proteção') || title.includes('disjuntor') || title.includes('mcb') || title.includes('rcd')) {
      return 'switching_control';
    }
    if (code.includes('ec 4.') || code.includes('ec4.') || title.includes('eletrônica') || title.includes('semicondutor') || title.includes('diodo') || title.includes('transistor') || title.includes('smps')) {
      return 'electronics';
    }
    if (code.includes('ec 5.') || code.includes('ec5.') || title.includes('motor') || title.includes('partida') || title.includes('contator') || title.includes('automação')) {
      return 'switching_control';
    }
    if (code.includes('ec 6.') || code.includes('ec6.') || code.includes('ec 8.') || code.includes('ec8.') || title.includes('transformador') || title.includes('posto') || title.includes('média tensão')) {
      return 'electromagnetism';
    }
    if (title.includes('campo') || title.includes('eletrostática') || title.includes('capacitor') || title.includes('cargas')) {
      return 'electrostatics';
    }
    return 'current_flow';
  }, [initialMode, lessonCode, lessonTitle]);

  const [activeMode, setActiveMode] = useState<LabMode>(resolvedDefaultMode);
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [simSpeed, setSimSpeed] = useState<number>(1);

  // ==========================================================================
  // ESTADOS - MODO 1: FLUXO DE CORRENTE (DC / AC)
  // ==========================================================================
  const [circuitType, setCircuitType] = useState<'DC' | 'AC'>('DC');
  const [voltage, setVoltage] = useState<number>(230); // Volts
  const [resistance, setResistance] = useState<number>(23); // Ohms (I = 10A)
  const [isSwitchClosed, setIsSwitchClosed] = useState<boolean>(true);

  // Corrente e Potência calculadas
  const current = isSwitchClosed ? voltage / Math.max(1, resistance) : 0;
  const powerWatts = isSwitchClosed ? (voltage * current) : 0;

  // ==========================================================================
  // ESTADOS - MODO 2: ELETROSTÁTICA & CAPACITOR
  // ==========================================================================
  const [chargeState, setChargeState] = useState<'attraction' | 'repulsion' | 'capacitor'>('capacitor');
  const [capSwitchState, setCapSwitchState] = useState<'open' | 'charge' | 'discharge'>('charge');
  const [capVoltage, setCapVoltage] = useState<number>(100); // 0 a 100%

  // ==========================================================================
  // ESTADOS - MODO 3: ELETROMAGNETISMO & TRANSFORMADOR
  // ==========================================================================
  const [magType, setMagType] = useState<'coil' | 'induction' | 'transformer'>('transformer');
  const [primaryTurns, setPrimaryTurns] = useState<number>(400);
  const [secondaryTurns, setSecondaryTurns] = useState<number>(40); // Relação 10:1 (230V -> 23V)
  const [coreFluxPhase, setCoreFluxPhase] = useState<number>(0);

  // ==========================================================================
  // ESTADOS - MODO 4: COMANDOS & PARTIDA DE MOTOR
  // ==========================================================================
  const [ctrlMode, setCtrlMode] = useState<'three_way' | 'motor_starter'>('three_way');
  // Three-Way / Four-Way: 3 chaves
  const [swA, setSwA] = useState<boolean>(true); // Superior ou Inferior
  const [swB, setSwB] = useState<boolean>(false); // Four-Way cruzado ou direto
  const [swC, setSwC] = useState<boolean>(true); // Superior ou Inferior
  // Partida de Motor
  const [motorMcbOn, setMotorMcbOn] = useState<boolean>(true);
  const [contactorKm1, setContactorKm1] = useState<boolean>(false);
  const [motorRpm, setMotorRpm] = useState<number>(0);
  const [thermalRelayTripped, setThermalRelayTripped] = useState<boolean>(false);

  // Lógica Three-Way / Four-Way
  // A = true(topo), false(base)
  // B (four-way): se false (direto: topo->topo, base->base), se true (cruzado: topo->base, base->topo)
  // C = true(topo), false(base)
  const isLampOn = React.useMemo(() => {
    let wirePos = swA ? 'top' : 'bottom';
    if (swB) {
      wirePos = wirePos === 'top' ? 'bottom' : 'top'; // Cruzamento Four-Way
    }
    const targetPos = swC ? 'top' : 'bottom';
    return wirePos === targetPos;
  }, [swA, swB, swC]);

  // ==========================================================================
  // ESTADOS - MODO 5: ELETRÔNICA ANALÓGICA & DIGITAL
  // ==========================================================================
  const [elecSubMode, setElecSubMode] = useState<'diode' | 'graetz' | 'transistor' | 'pwm_logic'>('graetz');
  const [diodeBias, setDiodeBias] = useState<'forward' | 'reverse'>('forward');
  const [hasFilterCap, setHasFilterCap] = useState<boolean>(true);
  const [transistorIb, setTransistorIb] = useState<number>(40); // 0 a 100%
  const [pwmDuty, setPwmDuty] = useState<number>(50); // %
  const [logicGate, setLogicGate] = useState<'AND' | 'OR' | 'NOT' | 'NAND' | 'NOR'>('AND');
  const [logicInA, setLogicInA] = useState<boolean>(true);
  const [logicInB, setLogicInB] = useState<boolean>(false);

  // Canvas Ref para animações contínuas de alta performance
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number>(0);
  const timeRef = useRef<number>(0);

  // Sincroniza modo padrão quando a lição muda
  useEffect(() => {
    setActiveMode(resolvedDefaultMode);
  }, [resolvedDefaultMode]);

  // Motor spin physics loop
  useEffect(() => {
    let interval: any;
    if (contactorKm1 && motorMcbOn && !thermalRelayTripped) {
      interval = setInterval(() => {
        setMotorRpm(prev => Math.min(2920, prev + 180));
      }, 40);
    } else {
      interval = setInterval(() => {
        setMotorRpm(prev => Math.max(0, prev - 120));
      }, 40);
    }
    return () => clearInterval(interval);
  }, [contactorKm1, motorMcbOn, thermalRelayTripped]);

  // Capacitor charge/discharge physics loop
  useEffect(() => {
    let interval: any;
    if (capSwitchState === 'charge') {
      interval = setInterval(() => {
        setCapVoltage(prev => Math.min(100, prev + 4));
      }, 50);
    } else if (capSwitchState === 'discharge') {
      interval = setInterval(() => {
        setCapVoltage(prev => Math.max(0, prev - 3));
      }, 50);
    }
    return () => clearInterval(interval);
  }, [capSwitchState]);

  // ==========================================================================
  // LOOP DE RENDERIZAÇÃO DO CANVAS (60 FPS)
  // Animação de Elétrons, Campos Vetoriais e Ondas Senoidais
  // ==========================================================================
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let localTime = 0;

    const render = () => {
      if (isRunning) {
        localTime += 0.03 * simSpeed;
        timeRef.current = localTime;
      }
      const t = timeRef.current;

      const w = canvas.width;
      const h = canvas.height;

      // Limpa fundo
      ctx.fillStyle = '#060B13';
      ctx.fillRect(0, 0, w, h);

      // Grade sutil técnica de fundo
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.4)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // ======================================================================
      // RENDERIZADOR 1: FLUXO DE CORRENTE ELÉTRICA (DC / AC)
      // ======================================================================
      if (activeMode === 'current_flow') {
        const loopX = 60;
        const loopY = 50;
        const loopW = w - 120;
        const loopH = h - 140;

        // Fios condutores
        ctx.strokeStyle = isSwitchClosed ? (circuitType === 'DC' ? '#38bdf8' : '#f59e0b') : '#475569';
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeRect(loopX, loopY, loopW, loopH);

        // Fonte (lado esquerdo)
        const srcX = loopX;
        const srcY = loopY + loopH / 2;
        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(srcX, srcY, 26, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(circuitType === 'DC' ? 'DC +' : '~ AC', srcX, srcY - 3);
        ctx.font = '10px monospace';
        ctx.fillStyle = '#38bdf8';
        ctx.fillText(`${voltage}V`, srcX, srcY + 11);

        // Chave / Interruptor (topo)
        const swX = loopX + loopW * 0.4;
        const swY = loopY;
        ctx.fillStyle = '#060B13';
        ctx.fillRect(swX - 25, swY - 10, 50, 20); // Abre o vão no fio

        ctx.fillStyle = '#94a3b8';
        ctx.beginPath();
        ctx.arc(swX - 20, swY, 5, 0, Math.PI * 2);
        ctx.arc(swX + 20, swY, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = isSwitchClosed ? '#10b981' : '#ef4444';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(swX - 20, swY);
        if (isSwitchClosed) {
          ctx.lineTo(swX + 20, swY);
        } else {
          ctx.lineTo(swX + 15, swY - 22); // Chave aberta em ângulo
        }
        ctx.stroke();

        // Lâmpada de Carga (lado direito)
        const loadX = loopX + loopW;
        const loadY = loopY + loopH / 2;
        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(loadX, loadY, 28, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Brilho térmico da lâmpada
        if (isSwitchClosed && current > 0) {
          const glowGrad = ctx.createRadialGradient(loadX, loadY, 5, loadX, loadY, 50);
          glowGrad.addColorStop(0, 'rgba(251, 191, 36, 0.9)');
          glowGrad.addColorStop(0.5, 'rgba(245, 158, 11, 0.4)');
          glowGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
          ctx.fillStyle = glowGrad;
          ctx.beginPath();
          ctx.arc(loadX, loadY, 50, 0, Math.PI * 2);
          ctx.fill();
        }

        // Filamento cruzado
        ctx.strokeStyle = isSwitchClosed ? '#ffffff' : '#64748b';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(loadX - 10, loadY - 10);
        ctx.lineTo(loadX + 10, loadY + 10);
        ctx.moveTo(loadX + 10, loadY - 10);
        ctx.lineTo(loadX - 10, loadY + 10);
        ctx.stroke();

        // Medidor Amperímetro (fundo)
        const meterX = loopX + loopW * 0.5;
        const meterY = loopY + loopH;
        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 2;
        ctx.fillRect(meterX - 35, meterY - 15, 70, 30);
        ctx.strokeRect(meterX - 35, meterY - 15, 70, 30);
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${current.toFixed(2)} A`, meterX, meterY + 4);

        // ANIMAÇÃO DE ELÉTRONS (CARGAS) EM MOVIMENTO
        if (isSwitchClosed && current > 0) {
          const perimeter = (loopW + loopH) * 2;
          const numParticles = 36;
          const speed = circuitType === 'DC' ? (current * 0.8) : (current * 0.8 * Math.sin(t * 4));

          for (let i = 0; i < numParticles; i++) {
            let dist = ((i / numParticles) * perimeter + (t * speed * 25)) % perimeter;
            if (dist < 0) dist += perimeter;

            let px = 0;
            let py = 0;

            if (dist < loopW) {
              px = loopX + dist;
              py = loopY;
            } else if (dist < loopW + loopH) {
              px = loopX + loopW;
              py = loopY + (dist - loopW);
            } else if (dist < loopW * 2 + loopH) {
              px = loopX + loopW - (dist - (loopW + loopH));
              py = loopY + loopH;
            } else {
              px = loopX;
              py = loopY + loopH - (dist - (loopW * 2 + loopH));
            }

            // Ponto de elétron brilhante
            ctx.fillStyle = circuitType === 'DC' ? '#38bdf8' : '#fbbf24';
            ctx.shadowColor = circuitType === 'DC' ? '#0284c7' : '#f59e0b';
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(px, py, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        }

        // Mini Osciloscópio Digital na parte inferior
        const oscY = h - 70;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.fillRect(loopX, oscY, loopW, 55);
        ctx.strokeStyle = '#334155';
        ctx.strokeRect(loopX, oscY, loopW, 55);

        ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
        ctx.beginPath();
        ctx.moveTo(loopX, oscY + 27);
        ctx.lineTo(loopX + loopW, oscY + 27);
        ctx.stroke();

        ctx.strokeStyle = circuitType === 'DC' ? '#38bdf8' : '#f59e0b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let ox = 0; ox < loopW; ox += 3) {
          let oy = 0;
          if (circuitType === 'DC') {
            oy = isSwitchClosed ? -16 : 0;
          } else {
            oy = isSwitchClosed ? Math.sin((ox * 0.05) - (t * 5)) * 20 : 0;
          }
          if (ox === 0) ctx.moveTo(loopX + ox, oscY + 27 + oy);
          else ctx.lineTo(loopX + ox, oscY + 27 + oy);
        }
        ctx.stroke();

        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(circuitType === 'DC' ? 'SINAL DC CONTÍNUO (V = cte)' : 'FORMA DE ONDA AC SENOIDAL (50 Hz, V(t) = Vp·sen(ωt))', loopX + 8, oscY + 14);
      }

      // ======================================================================
      // RENDERIZADOR 2: ELETROSTÁTICA, CAMPOS VETORIAIS & CAPACITOR
      // ======================================================================
      else if (activeMode === 'electrostatics') {
        const cx = w / 2;
        const cy = h / 2 - 20;

        if (chargeState === 'capacitor') {
          // Placa Superior (+ Q)
          const plateW = 220;
          const plateH = 14;
          const plateY1 = cy - 50;
          const plateY2 = cy + 50;

          // Placa Positiva (topo)
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(cx - plateW / 2, plateY1, plateW, plateH);
          // Placa Negativa (base)
          ctx.fillStyle = '#3b82f6';
          ctx.fillRect(cx - plateW / 2, plateY2, plateW, plateH);

          // Cargas desenhadas nas placas
          const chargeCount = Math.round((capVoltage / 100) * 12);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 11px monospace';
          ctx.textAlign = 'center';
          for (let i = 0; i < chargeCount; i++) {
            const px = (cx - plateW / 2 + 15) + (i * ((plateW - 30) / Math.max(1, chargeCount - 1)));
            ctx.fillText('+', px, plateY1 + 11);
            ctx.fillText('-', px, plateY2 + 11);
          }

          // Linhas vetoriais de campo elétrico uniforme E (do + para o -)
          if (capVoltage > 5) {
            ctx.strokeStyle = `rgba(234, 179, 8, ${(capVoltage / 100) * 0.8})`;
            ctx.lineWidth = 1.5;
            for (let lx = cx - plateW / 2 + 20; lx <= cx + plateW / 2 - 20; lx += 25) {
              ctx.beginPath();
              ctx.moveTo(lx, plateY1 + plateH);
              ctx.lineTo(lx, plateY2);
              ctx.stroke();

              // Flecha vetorial para baixo
              ctx.fillStyle = `rgba(234, 179, 8, ${(capVoltage / 100) * 0.9})`;
              ctx.beginPath();
              ctx.moveTo(lx, plateY2 - 2);
              ctx.lineTo(lx - 4, plateY2 - 8);
              ctx.lineTo(lx + 4, plateY2 - 8);
              ctx.fill();
            }
          }

          // Informações do capacitor
          ctx.fillStyle = '#e2e8f0';
          ctx.font = 'bold 13px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(`Capacitor de Placas Paralelas • Campo Uniforme E = V / d`, cx, cy - 80);
          ctx.fillStyle = '#38bdf8';
          ctx.font = 'bold 11px monospace';
          ctx.fillText(`Carga Armazenada: Q = C·V (${capVoltage.toFixed(0)}%) • Energia: W = ½ C·V²`, cx, cy + 95);
        } else {
          // Cargas pontuais com linhas vetoriais de campo
          const q1x = cx - 90;
          const q2x = cx + 90;
          const isAttraction = chargeState === 'attraction';

          // Carga 1 (+Q)
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.arc(q1x, cy, 22, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 16px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('+Q', q1x, cy + 5);

          // Carga 2 (+Q ou -Q)
          ctx.fillStyle = isAttraction ? '#3b82f6' : '#ef4444';
          ctx.beginPath();
          ctx.arc(q2x, cy, 22, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.fillText(isAttraction ? '-Q' : '+Q', q2x, cy + 5);

          // Linhas de campo radiais animadas
          const numLines = 14;
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
          ctx.lineWidth = 1.5;
          for (let i = 0; i < numLines; i++) {
            const angle = (i / numLines) * Math.PI * 2;
            const r1 = 26;
            const r2 = 65 + Math.sin(t * 3 + i) * 6;

            ctx.beginPath();
            ctx.moveTo(q1x + Math.cos(angle) * r1, cy + Math.sin(angle) * r1);
            ctx.lineTo(q1x + Math.cos(angle) * r2, cy + Math.sin(angle) * r2);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(q2x + Math.cos(angle) * r1, cy + Math.sin(angle) * r1);
            ctx.lineTo(q2x + Math.cos(angle) * r2, cy + Math.sin(angle) * r2);
            ctx.stroke();
          }

          ctx.fillStyle = '#e2e8f0';
          ctx.font = 'bold 12px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(
            isAttraction
              ? 'Lei de Coulomb: Cargas de Sinais Opostos se Atraem (Força F = k·|q1·q2| / r²)'
              : 'Lei de Coulomb: Cargas de Mesmo Sinal se Repelem (Força Repulsiva)',
            cx,
            cy - 65
          );
        }
      }

      // ======================================================================
      // RENDERIZADOR 3: ELETROMAGNETISMO, BOBINAS & TRANSFORMADORES
      // ======================================================================
      else if (activeMode === 'electromagnetism') {
        const cx = w / 2;
        const cy = h / 2 - 15;

        if (magType === 'transformer') {
          // Núcleo Ferromagnético em Anel Quadrado (Cinza Aço laminado)
          const coreOuterW = 280;
          const coreOuterH = 180;
          const coreThick = 45;

          ctx.fillStyle = '#334155';
          ctx.fillRect(cx - coreOuterW / 2, cy - coreOuterH / 2, coreOuterW, coreOuterH);

          // Vão interno
          ctx.fillStyle = '#060B13';
          ctx.fillRect(
            cx - (coreOuterW / 2 - coreThick),
            cy - (coreOuterH / 2 - coreThick),
            coreOuterW - coreThick * 2,
            coreOuterH - coreThick * 2
          );

          // Espiras do Primário (Lado Esquerdo - Cobre)
          const primX = cx - coreOuterW / 2;
          const numEspiras = 10;
          for (let i = 0; i < numEspiras; i++) {
            const ey = (cy - 50) + i * 11;
            ctx.fillStyle = '#d97706';
            ctx.fillRect(primX - 8, ey, coreThick + 16, 7);
            ctx.strokeStyle = '#b45309';
            ctx.strokeRect(primX - 8, ey, coreThick + 16, 7);
          }

          // Espiras do Secundário (Lado Direito - Cobre mais grosso)
          const secX = cx + coreOuterW / 2 - coreThick;
          for (let i = 0; i < 5; i++) {
            const ey = (cy - 30) + i * 15;
            ctx.fillStyle = '#f59e0b';
            ctx.fillRect(secX - 8, ey, coreThick + 16, 10);
            ctx.strokeStyle = '#d97706';
            ctx.strokeRect(secX - 8, ey, coreThick + 16, 10);
          }

          // FLUXO MAGNÉTICO ALTERNADO ANIMADO NO NÚCLEO (Φ)
          const fluxOpacity = Math.abs(Math.sin(t * 3));
          ctx.strokeStyle = `rgba(56, 189, 248, ${fluxOpacity * 0.9})`;
          ctx.lineWidth = 3;
          ctx.setLineDash([8, 8]);
          ctx.lineDashOffset = -t * 20;

          const fluxW = coreOuterW - coreThick;
          const fluxH = coreOuterH - coreThick;
          ctx.strokeRect(cx - fluxW / 2, cy - fluxH / 2, fluxW, fluxH);
          ctx.setLineDash([]);

          // Legendas Técnicas do Trafo
          const ratio = (primaryTurns / secondaryTurns).toFixed(1);
          const secV = Math.round(230 / Number(ratio));

          ctx.fillStyle = '#e2e8f0';
          ctx.font = 'bold 12px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(`Transformador Monofásico com Acoplamento Magnético Fechado (IEC 60076)`, cx, cy - 110);

          ctx.fillStyle = '#38bdf8';
          ctx.font = 'bold 11px monospace';
          ctx.textAlign = 'left';
          ctx.fillText(`Primário: 230V • N1=${primaryTurns} esp.`, cx - coreOuterW / 2 - 10, cy + coreOuterH / 2 + 25);
          ctx.textAlign = 'right';
          ctx.fillStyle = '#10b981';
          ctx.fillText(`Secundário: ${secV}V • N2=${secondaryTurns} esp.`, cx + coreOuterW / 2 + 10, cy + coreOuterH / 2 + 25);
        } else {
          // Bobina / Solenoide com linhas de campo B emanando do polo N e fechando no S
          ctx.fillStyle = '#475569';
          ctx.fillRect(cx - 100, cy - 25, 200, 50); // Núcleo cilíndrico

          // Espiras
          for (let i = 0; i < 14; i++) {
            const ex = (cx - 90) + i * 14;
            ctx.fillStyle = '#d97706';
            ctx.fillRect(ex, cy - 35, 9, 70);
          }

          // Linhas fechadas de campo magnético (elipses concêntricas)
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
          ctx.lineWidth = 2;
          for (let r = 50; r <= 110; r += 25) {
            ctx.beginPath();
            ctx.ellipse(cx, cy, 140 + r, r, 0, 0, Math.PI * 2);
            ctx.stroke();
          }

          ctx.fillStyle = '#e2e8f0';
          ctx.font = 'bold 13px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('Bobina com Núcleo Ferromagnético & Linhas de Indução B (Lei de Ampère)', cx, cy - 90);
        }
      }

      // ======================================================================
      // RENDERIZADOR 4: COMANDOS THREE-WAY / FOUR-WAY OU MOTOR
      // ======================================================================
      else if (activeMode === 'switching_control') {
        const cx = w / 2;
        const cy = h / 2 - 20;

        if (ctrlMode === 'three_way') {
          // Esquema Interativo de Iluminação Three-Way e Four-Way
          const sw1X = cx - 180;
          const sw2X = cx;
          const sw3X = cx + 180;
          const baseY = cy;

          // Caixa dos Interruptores
          [sw1X, sw2X, sw3X].forEach((sx, idx) => {
            ctx.fillStyle = '#0f172a';
            ctx.strokeStyle = '#334155';
            ctx.lineWidth = 2;
            ctx.fillRect(sx - 35, baseY - 45, 70, 90);
            ctx.strokeRect(sx - 35, baseY - 45, 70, 90);

            ctx.fillStyle = '#94a3b8';
            ctx.font = 'bold 9px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(idx === 0 ? 'Three-Way 1' : idx === 1 ? 'Four-Way' : 'Three-Way 2', sx, baseY - 52);
          });

          // Conexões e condutores animados
          const wireColor = isLampOn ? '#fbbf24' : '#475569';
          ctx.strokeStyle = wireColor;
          ctx.lineWidth = 4;

          // Fase de entrada -> Sw1
          ctx.beginPath();
          ctx.moveTo(30, baseY);
          ctx.lineTo(sw1X - 25, baseY);
          ctx.stroke();

          // Lâmpada no topo direito
          const lampX = cx + 180;
          const lampY = cy - 90;
          ctx.fillStyle = '#0f172a';
          ctx.strokeStyle = isLampOn ? '#fbbf24' : '#64748b';
          ctx.beginPath();
          ctx.arc(lampX, lampY, 22, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          if (isLampOn) {
            const glow = ctx.createRadialGradient(lampX, lampY, 3, lampX, lampY, 45);
            glow.addColorStop(0, 'rgba(251, 191, 36, 0.9)');
            glow.addColorStop(1, 'rgba(251, 191, 36, 0)');
            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.arc(lampX, lampY, 45, 0, Math.PI * 2);
            ctx.fill();
          }

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 12px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(isLampOn ? '💡 LÂMPADA ACESA' : '⚫ LÂMPADA APAGADA', cx, cy + 85);
        } else {
          // Partida de Motor com rotor girando
          const motX = cx + 80;
          const motY = cy;

          // Carcaça do Motor Trifásico
          ctx.fillStyle = '#1e293b';
          ctx.strokeStyle = '#475569';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(motX, motY, 55, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Rotor e pás giratórias
          ctx.save();
          ctx.translate(motX, motY);
          ctx.rotate(t * (motorRpm / 300));
          ctx.strokeStyle = motorRpm > 50 ? '#38bdf8' : '#64748b';
          ctx.lineWidth = 4;
          for (let a = 0; a < 4; a++) {
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(Math.cos((a * Math.PI) / 2) * 40, Math.sin((a * Math.PI) / 2) * 40);
            ctx.stroke();
          }
          ctx.restore();

          // Tacômetro Digital
          ctx.fillStyle = '#38bdf8';
          ctx.font = 'bold 14px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(`${motorRpm} RPM`, motX, motY + 78);

          // Estado do Contator KM1
          ctx.fillStyle = contactorKm1 ? '#10b981' : '#64748b';
          ctx.font = 'bold 12px sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText(`Contator KM1: ${contactorKm1 ? 'ENERGIZADO (Selo 13-14 fechado)' : 'DESLIGADO'}`, cx - 180, cy - 30);
          ctx.fillText(`Disjuntor Q1: ${motorMcbOn ? 'LIGADO' : 'DESLIGADO'}`, cx - 180, cy);
          ctx.fillText(`Relé Térmico F1: ${thermalRelayTripped ? 'DISPARADO (SOBRECARGA)' : 'NORMAL'}`, cx - 180, cy + 30);
        }
      }

      // ======================================================================
      // RENDERIZADOR 5: ELETRÔNICA, RETIFICADOR DE GRAETZ, TRANSISTOR & PWM
      // ======================================================================
      else if (activeMode === 'electronics') {
        const cx = w / 2;
        const cy = h / 2 - 20;

        if (elecSubMode === 'graetz') {
          // Ponte Retificadora de Graetz (4 Diodos em Losango)
          const bW = 120;
          const bH = 120;

          // Linhas da ponte
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(cx, cy - bH / 2);
          ctx.lineTo(cx + bW / 2, cy);
          ctx.lineTo(cx, cy + bH / 2);
          ctx.lineTo(cx - bW / 2, cy);
          ctx.closePath();
          ctx.stroke();

          // Diodos desenhados nos braços
          const diodes = [
            { x: cx - bW / 4, y: cy - bH / 4, label: 'D1' },
            { x: cx + bW / 4, y: cy - bH / 4, label: 'D2' },
            { x: cx - bW / 4, y: cy + bH / 4, label: 'D3' },
            { x: cx + bW / 4, y: cy + bH / 4, label: 'D4' }
          ];

          diodes.forEach(d => {
            ctx.fillStyle = '#f59e0b';
            ctx.beginPath();
            ctx.arc(d.x, d.y, 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 9px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(d.label, d.x, d.y - 12);
          });

          // Curva osciloscópio na saída: AC -> DC pulsante ou DC filtrada
          const oscY = h - 65;
          ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
          ctx.fillRect(50, oscY, w - 100, 50);
          ctx.strokeStyle = '#334155';
          ctx.strokeRect(50, oscY, w - 100, 50);

          ctx.strokeStyle = hasFilterCap ? '#10b981' : '#f59e0b';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          for (let ox = 0; ox < w - 100; ox += 3) {
            let oy = 0;
            if (hasFilterCap) {
              // DC suave com ripple mínimo
              oy = -14 + Math.sin(ox * 0.1 - t * 4) * 2;
            } else {
              // DC pulsante retificado de onda completa (|seno|)
              oy = -Math.abs(Math.sin(ox * 0.05 - t * 4)) * 20;
            }
            if (ox === 0) ctx.moveTo(50 + ox, oscY + 35 + oy);
            else ctx.lineTo(50 + ox, oscY + 35 + oy);
          }
          ctx.stroke();

          ctx.fillStyle = '#94a3b8';
          ctx.font = 'bold 10px monospace';
          ctx.textAlign = 'left';
          ctx.fillText(
            hasFilterCap
              ? 'TENSÃO CC FILTRADA COM CAPACITOR ELETROLÍTICO (RIPPLE REDUZIDO)'
              : 'TENSÃO CC PULSANTE DE ONDA COMPLETA (SEM CAPACITOR)',
            60,
            oscY + 16
          );
        } else if (elecSubMode === 'transistor') {
          // Transistor BJT NPN: Corte, Ativa e Saturação
          const bjtState = transistorIb < 10 ? 'CORTE' : transistorIb > 75 ? 'SATURAÇÃO' : 'REGIÃO ATIVA';
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 14px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(`Transistor BJT NPN • Estado Atual: ${bjtState}`, cx, cy - 70);

          ctx.fillStyle = '#38bdf8';
          ctx.font = 'bold 12px monospace';
          ctx.fillText(`Corrente de Base Ib: ${transistorIb} µA • Corrente de Coletor Ic: ${(transistorIb * 1.5).toFixed(1)} mA (β = 150)`, cx, cy - 45);

          // Desenho do símbolo esquemático BJT
          ctx.strokeStyle = '#e2e8f0';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(cx - 30, cy);
          ctx.lineTo(cx, cy); // Base
          ctx.moveTo(cx, cy - 35);
          ctx.lineTo(cx, cy + 35); // Barra vertical
          ctx.moveTo(cx, cy - 20);
          ctx.lineTo(cx + 35, cy - 45); // Coletor
          ctx.moveTo(cx, cy + 20);
          ctx.lineTo(cx + 35, cy + 45); // Emissor
          ctx.stroke();

          // Seta do emissor
          ctx.fillStyle = '#e2e8f0';
          ctx.beginPath();
          ctx.moveTo(cx + 32, cy + 42);
          ctx.lineTo(cx + 22, cy + 38);
          ctx.lineTo(cx + 26, cy + 48);
          ctx.fill();

          // Lâmpada acionada no coletor
          const lampAlpha = transistorIb / 100;
          ctx.fillStyle = `rgba(251, 191, 36, ${lampAlpha})`;
          ctx.beginPath();
          ctx.arc(cx + 100, cy - 45, 20, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#f59e0b';
          ctx.stroke();
        }
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [
    activeMode,
    isRunning,
    simSpeed,
    circuitType,
    voltage,
    resistance,
    isSwitchClosed,
    current,
    chargeState,
    capVoltage,
    magType,
    primaryTurns,
    secondaryTurns,
    ctrlMode,
    swA,
    swB,
    swC,
    isLampOn,
    contactorKm1,
    motorMcbOn,
    motorRpm,
    thermalRelayTripped,
    elecSubMode,
    hasFilterCap,
    transistorIb
  ]);

  return (
    <div className={`p-4 rounded-2xl bg-[#0b1322] border border-[#1e293b] text-slate-200 shadow-xl ${className}`}>
      {/* CABEÇALHO DO LABORATÓRIO INTERATIVO */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
            <Radio className="w-5 h-5 animate-pulse text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                LAB INTERATIVO
              </span>
              <span className="text-xs font-bold text-slate-400">{norma}</span>
            </div>
            <h4 className="text-sm sm:text-base font-black text-white mt-0.5">
              Simulação Visual Dinâmica & Física Elétrica
            </h4>
          </div>
        </div>

        {/* Controles Globais de Simulação */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsRunning(!isRunning)}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-bold border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
            title={isRunning ? 'Pausar Simulação' : 'Retomar Simulação'}
          >
            {isRunning ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
            <span>{isRunning ? 'Pausar' : 'Play'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundFX.playClick();
              timeRef.current = 0;
              setMotorRpm(0);
              setCapVoltage(100);
            }}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700 transition cursor-pointer"
            title="Reiniciar Tempo"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* SELETOR DE MODOS DIDÁTICOS OBRIGATÓRIOS */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-2.5 scrollbar-thin border-b border-slate-800/60">
        {[
          { id: 'current_flow' as LabMode, label: '⚡ Fluxo DC / AC', desc: 'Elétrons & Leis de Ohm' },
          { id: 'electrostatics' as LabMode, label: '🧲 Eletrostática & Campos', desc: 'Capacitores & Coulomb' },
          { id: 'electromagnetism' as LabMode, label: '🔄 Bobinas & Transformador', desc: 'Indução & Campo B' },
          { id: 'switching_control' as LabMode, label: '💡 Comandos & Motores', desc: 'Three-Way & Partida' },
          { id: 'electronics' as LabMode, label: '🔬 Eletrônica & Diodos', desc: 'Ponte Graetz & Transistor' }
        ].map(m => (
          <button
            key={m.id}
            type="button"
            onClick={() => {
              soundFX.playClick();
              setActiveMode(m.id);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex flex-col items-start border ${
              activeMode === m.id
                ? 'bg-blue-600/30 text-blue-300 border-blue-500/60 shadow-lg shadow-blue-900/30'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <span>{m.label}</span>
            <span className="text-[10px] font-normal opacity-75">{m.desc}</span>
          </button>
        ))}
      </div>

      {/* ÁREA GRÁFICA DO CANVAS DE ANIMAÇÃO */}
      <div className="relative my-3 rounded-xl overflow-hidden border border-slate-800 bg-[#060B13] shadow-inner">
        <canvas
          ref={canvasRef}
          width={760}
          height={330}
          className="w-full h-[260px] sm:h-[310px] block"
        />

        {/* Indicador de Status Dinâmico Flutuante */}
        <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-slate-900/85 backdrop-blur border border-slate-700/60 text-[11px] font-mono text-slate-300 flex items-center gap-2 shadow">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>Física em Tempo Real (60 FPS)</span>
        </div>
      </div>

      {/* PAINEL DE CONTROLES ESPECÍFICO DO MODO SELECIONADO */}
      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-3">
        {/* MODO 1: FLUXO DE CORRENTE */}
        {activeMode === 'current_flow' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
            <div>
              <label className="block text-slate-400 font-bold mb-1">Tipo de Tensão:</label>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    soundFX.playClick();
                    setCircuitType('DC');
                  }}
                  className={`flex-1 py-1.5 rounded-lg font-bold border transition cursor-pointer ${
                    circuitType === 'DC' ? 'bg-blue-600 text-white border-blue-400' : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  DC Contínuo
                </button>
                <button
                  type="button"
                  onClick={() => {
                    soundFX.playClick();
                    setCircuitType('AC');
                  }}
                  className={`flex-1 py-1.5 rounded-lg font-bold border transition cursor-pointer ${
                    circuitType === 'AC' ? 'bg-amber-600 text-white border-amber-400' : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  AC Senoidal (50Hz)
                </button>
              </div>
            </div>

            <div>
              <div className="flex justify-between font-bold text-slate-300 mb-1">
                <span>Tensão (V):</span>
                <span className="font-mono text-cyan-300">{voltage} V</span>
              </div>
              <input
                type="range"
                min={12}
                max={400}
                step={2}
                value={voltage}
                onChange={e => setVoltage(Number(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between font-bold text-slate-300 mb-1">
                <span>Resistência Carga (R):</span>
                <span className="font-mono text-cyan-300">{resistance} Ω</span>
              </div>
              <input
                type="range"
                min={5}
                max={100}
                value={resistance}
                onChange={e => setResistance(Number(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* MODO 2: ELETROSTÁTICA */}
        {activeMode === 'electrostatics' && (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-400">Configuração:</span>
              <button
                type="button"
                onClick={() => setChargeState('capacitor')}
                className={`px-3 py-1.5 rounded-lg font-bold border cursor-pointer ${
                  chargeState === 'capacitor' ? 'bg-blue-600 text-white border-blue-400' : 'bg-slate-800 text-slate-400'
                }`}
              >
                Capacitor de Placas
              </button>
              <button
                type="button"
                onClick={() => setChargeState('attraction')}
                className={`px-3 py-1.5 rounded-lg font-bold border cursor-pointer ${
                  chargeState === 'attraction' ? 'bg-blue-600 text-white border-blue-400' : 'bg-slate-800 text-slate-400'
                }`}
              >
                Cargas (+ e -) Atração
              </button>
              <button
                type="button"
                onClick={() => setChargeState('repulsion')}
                className={`px-3 py-1.5 rounded-lg font-bold border cursor-pointer ${
                  chargeState === 'repulsion' ? 'bg-blue-600 text-white border-blue-400' : 'bg-slate-800 text-slate-400'
                }`}
              >
                Cargas (+ e +) Repulsão
              </button>
            </div>

            {chargeState === 'capacitor' && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    soundFX.playClick();
                    setCapSwitchState('charge');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-bold cursor-pointer"
                >
                  Carregar (+Q)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    soundFX.playClick();
                    setCapSwitchState('discharge');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-600 text-white font-bold cursor-pointer"
                >
                  Descarregar (Lâmpada)
                </button>
              </div>
            )}
          </div>
        )}

        {/* MODO 3: TRANSFORMADOR & BOBINAS */}
        {activeMode === 'electromagnetism' && (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-400">Dispositivo:</span>
              <button
                type="button"
                onClick={() => setMagType('transformer')}
                className={`px-3 py-1.5 rounded-lg font-bold border cursor-pointer ${
                  magType === 'transformer' ? 'bg-blue-600 text-white border-blue-400' : 'bg-slate-800 text-slate-400'
                }`}
              >
                Transformador 230V / 24V
              </button>
              <button
                type="button"
                onClick={() => setMagType('coil')}
                className={`px-3 py-1.5 rounded-lg font-bold border cursor-pointer ${
                  magType === 'coil' ? 'bg-blue-600 text-white border-blue-400' : 'bg-slate-800 text-slate-400'
                }`}
              >
                Solenoide / Bobina
              </button>
            </div>

            {magType === 'transformer' && (
              <div className="flex items-center gap-3 text-cyan-300 font-mono">
                <span>N1/N2 = {(primaryTurns / secondaryTurns).toFixed(1)}</span>
                <span>V2 = {Math.round(230 / (primaryTurns / secondaryTurns))} V</span>
              </div>
            )}
          </div>
        )}

        {/* MODO 4: COMANDOS E MOTORES */}
        {activeMode === 'switching_control' && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <button
                type="button"
                onClick={() => setCtrlMode('three_way')}
                className={`px-3 py-1 rounded-lg font-bold text-xs border cursor-pointer ${
                  ctrlMode === 'three_way' ? 'bg-blue-600 text-white border-blue-400' : 'bg-slate-800 text-slate-400'
                }`}
              >
                Comutação Three-Way / Four-Way
              </button>
              <button
                type="button"
                onClick={() => setCtrlMode('motor_starter')}
                className={`px-3 py-1 rounded-lg font-bold text-xs border cursor-pointer ${
                  ctrlMode === 'motor_starter' ? 'bg-blue-600 text-white border-blue-400' : 'bg-slate-800 text-slate-400'
                }`}
              >
                Partida Direta de Motor 3F
              </button>
            </div>

            {ctrlMode === 'three_way' ? (
              <div className="flex items-center gap-3">
                <span className="font-bold text-slate-400">Clique para comutar:</span>
                <button
                  type="button"
                  onClick={() => {
                    soundFX.playClick();
                    setSwA(!swA);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold border border-slate-700 cursor-pointer"
                >
                  Interruptor A ({swA ? 'Superior' : 'Inferior'})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    soundFX.playClick();
                    setSwB(!swB);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold border border-slate-700 cursor-pointer"
                >
                  Four-Way B ({swB ? 'Cruzado' : 'Direto'})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    soundFX.playClick();
                    setSwC(!swC);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold border border-slate-700 cursor-pointer"
                >
                  Interruptor C ({swC ? 'Superior' : 'Inferior'})
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    soundFX.playContactorThump(true);
                    setContactorKm1(true);
                    setThermalRelayTripped(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer"
                >
                  🟢 S1 (Liga Motor)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    soundFX.playContactorThump(false);
                    setContactorKm1(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold cursor-pointer"
                >
                  🔴 S0 (Desliga Motor)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    soundFX.playSparkSound();
                    setThermalRelayTripped(true);
                    setContactorKm1(false);
                  }}
                  className="px-3 py-2 rounded-xl bg-amber-600/30 text-amber-300 border border-amber-500/40 hover:bg-amber-600/40 font-bold cursor-pointer"
                >
                  ⚠️ Simular Sobrecarga Relé Térmico
                </button>
              </div>
            )}
          </div>
        )}

        {/* MODO 5: ELETRÔNICA */}
        {activeMode === 'electronics' && (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-400">Circuito:</span>
              <button
                type="button"
                onClick={() => setElecSubMode('graetz')}
                className={`px-3 py-1.5 rounded-lg font-bold border cursor-pointer ${
                  elecSubMode === 'graetz' ? 'bg-blue-600 text-white border-blue-400' : 'bg-slate-800 text-slate-400'
                }`}
              >
                Ponte Retificadora Graetz
              </button>
              <button
                type="button"
                onClick={() => setElecSubMode('transistor')}
                className={`px-3 py-1.5 rounded-lg font-bold border cursor-pointer ${
                  elecSubMode === 'transistor' ? 'bg-blue-600 text-white border-blue-400' : 'bg-slate-800 text-slate-400'
                }`}
              >
                Transistor BJT (Chaveamento/Amplificação)
              </button>
            </div>

            {elecSubMode === 'graetz' && (
              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  setHasFilterCap(!hasFilterCap);
                }}
                className={`px-3 py-1.5 rounded-lg font-bold border transition cursor-pointer ${
                  hasFilterCap ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500' : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {hasFilterCap ? '✓ Capacitor de Filtro Ativo' : '+ Adicionar Capacitor de Filtro'}
              </button>
            )}

            {elecSubMode === 'transistor' && (
              <div className="flex items-center gap-3">
                <span className="text-slate-400 font-bold">Corrente de Base (Ib):</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={transistorIb}
                  onChange={e => setTransistorIb(Number(e.target.value))}
                  className="w-32 accent-blue-500 cursor-pointer"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
