// ============================================================================
// TÉCNICAMZ PRO — MOTOR CAD ELÉTRICO & ELETRÔNICO: SIMBOLOGIA NORMATIVA & 3D
// Baseado estritamente na tabela de símbolos normativos (Electronics Hub)
// e renderização pseudo-3D mecânica para ambiente industrial
// ============================================================================

import { ComponentDef, WIRE_COLORS } from './cadEngine';

export type CadRenderStyle = '3d_mechanical' | 'normative_symbols';

// ----------------------------------------------------------------------------
// 1. DESENHO DE SÍMBOLOS NORMATIVOS RIGOROSOS (Electronics Hub Standard)
// ----------------------------------------------------------------------------

export function drawNormativeSymbol(
  ctx: CanvasRenderingContext2D,
  code: string,
  kind: string,
  cw: number,
  ch: number,
  zoom: number,
  st: Record<string, any>,
  color = '#38bdf8'
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = Math.max(1.5, 1.8 * zoom);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const s = Math.min(cw, ch) * 0.42;

  switch (code) {
    // FONTES DE ALIMENTAÇÃO
    case 'BAT': {
      // Single Cell / Multi Cell Battery
      // Placas paralelas alternadas longas (+) e curtas (-)
      const gap = 6 * zoom;
      // Positivo (longo)
      ctx.beginPath();
      ctx.moveTo(-gap, -s * 0.7);
      ctx.lineTo(-gap, s * 0.7);
      ctx.stroke();
      // Negativo (curto e mais espesso)
      ctx.lineWidth = Math.max(2.5, 3 * zoom);
      ctx.beginPath();
      ctx.moveTo(gap, -s * 0.4);
      ctx.lineTo(gap, s * 0.4);
      ctx.stroke();
      // Sinais + e -
      ctx.lineWidth = 1;
      ctx.font = `bold ${Math.max(8, 9 * zoom)}px sans-serif`;
      ctx.fillText('+', -gap - 8 * zoom, -s * 0.3);
      ctx.fillText('−', gap + 8 * zoom, -s * 0.3);
      break;
    }

    case 'SRC_AC1':
    case 'SRC_AC3': {
      // AC Supply: Círculo com onda senoidal no interior
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.75, 0, Math.PI * 2);
      ctx.stroke();
      // Senoide perfeita
      ctx.beginPath();
      const waveW = s * 0.45;
      ctx.moveTo(-waveW, 0);
      ctx.bezierCurveTo(-waveW * 0.5, -s * 0.4, -waveW * 0.2, -s * 0.4, 0, 0);
      ctx.bezierCurveTo(waveW * 0.2, s * 0.4, waveW * 0.5, s * 0.4, waveW, 0);
      ctx.stroke();
      break;
    }

    case 'SRC_DC24': {
      // DC Supply: Círculo com + e -
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.75, 0, Math.PI * 2);
      ctx.stroke();
      ctx.font = `bold ${Math.max(9, 11 * zoom)}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('+  −', 0, 0);
      break;
    }

    case 'GND': {
      // Ground: Linha vertical central e 3 linhas horizontais decrescentes
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.7);
      ctx.lineTo(0, -s * 0.1);
      ctx.moveTo(-s * 0.6, -s * 0.1);
      ctx.lineTo(s * 0.6, -s * 0.1);
      ctx.moveTo(-s * 0.4, s * 0.2);
      ctx.lineTo(s * 0.4, s * 0.2);
      ctx.moveTo(-s * 0.2, s * 0.5);
      ctx.lineTo(s * 0.2, s * 0.5);
      ctx.stroke();
      break;
    }

    // SEMICONDUTORES
    case 'DIODE':
    case 'ZENER':
    case 'LED': {
      // Diodos (PN, Zener, LED)
      const dW = s * 0.7;
      const dH = s * 0.6;
      // Triângulo (Ânodo -> Cátodo)
      ctx.beginPath();
      ctx.moveTo(-dW * 0.5, -dH * 0.5);
      ctx.lineTo(-dW * 0.5, dH * 0.5);
      ctx.lineTo(dW * 0.5, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Barra do Cátodo
      ctx.beginPath();
      if (code === 'ZENER') {
        // Barra com dobras Z
        ctx.moveTo(dW * 0.5 - 4 * zoom, -dH * 0.6);
        ctx.lineTo(dW * 0.5, -dH * 0.6);
        ctx.lineTo(dW * 0.5, dH * 0.6);
        ctx.lineTo(dW * 0.5 + 4 * zoom, dH * 0.6);
      } else {
        ctx.moveTo(dW * 0.5, -dH * 0.6);
        ctx.lineTo(dW * 0.5, dH * 0.6);
      }
      ctx.stroke();

      // Setas de emissão para LED
      if (code === 'LED') {
        ctx.beginPath();
        ctx.moveTo(-2 * zoom, -dH * 0.6);
        ctx.lineTo(6 * zoom, -dH * 1.1);
        ctx.moveTo(4 * zoom, -dH * 0.4);
        ctx.lineTo(12 * zoom, -dH * 0.9);
        ctx.stroke();
      }
      break;
    }

    case 'BJT_NPN':
    case 'BJT_PNP': {
      // Transistor BJT (NPN / PNP)
      const isNPN = code === 'BJT_NPN';
      // Círculo envolvente
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.8, 0, Math.PI * 2);
      ctx.stroke();

      // Barra da Base
      ctx.lineWidth = Math.max(2, 2.5 * zoom);
      ctx.beginPath();
      ctx.moveTo(-s * 0.25, -s * 0.5);
      ctx.lineTo(-s * 0.25, s * 0.5);
      ctx.stroke();

      // Terminal Base
      ctx.lineWidth = Math.max(1.5, 1.8 * zoom);
      ctx.beginPath();
      ctx.moveTo(-s * 0.75, 0);
      ctx.lineTo(-s * 0.25, 0);
      // Coletor
      ctx.moveTo(-s * 0.25, -s * 0.25);
      ctx.lineTo(s * 0.45, -s * 0.55);
      // Emissor
      ctx.moveTo(-s * 0.25, s * 0.25);
      ctx.lineTo(s * 0.45, s * 0.55);
      ctx.stroke();

      // Seta do emissor (Para fora em NPN, para dentro em PNP)
      ctx.beginPath();
      if (isNPN) {
        ctx.moveTo(s * 0.25, s * 0.4);
        ctx.lineTo(s * 0.45, s * 0.55);
        ctx.lineTo(s * 0.4, s * 0.3);
      } else {
        ctx.moveTo(-s * 0.1, s * 0.35);
        ctx.lineTo(-s * 0.25, s * 0.25);
        ctx.lineTo(-s * 0.18, s * 0.15);
      }
      ctx.stroke();
      break;
    }

    case 'MOS_N': {
      // MOSFET Canal N (D, G, S)
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.85, 0, Math.PI * 2);
      ctx.stroke();

      // Linha do Gate
      ctx.beginPath();
      ctx.moveTo(-s * 0.4, -s * 0.45);
      ctx.lineTo(-s * 0.4, s * 0.45);
      ctx.moveTo(-s * 0.75, s * 0.25);
      ctx.lineTo(-s * 0.4, s * 0.25);
      ctx.stroke();

      // Canal dividido em 3 barras
      const bx = -s * 0.15;
      ctx.beginPath();
      // Drain segment
      ctx.moveTo(bx, -s * 0.45);
      ctx.lineTo(bx, -s * 0.2);
      // Substrate segment
      ctx.moveTo(bx, -s * 0.1);
      ctx.lineTo(bx, s * 0.1);
      // Source segment
      ctx.moveTo(bx, s * 0.2);
      ctx.lineTo(bx, s * 0.45);
      // Terminais D e S
      ctx.moveTo(bx, -s * 0.35);
      ctx.lineTo(s * 0.4, -s * 0.35);
      ctx.moveTo(bx, s * 0.35);
      ctx.lineTo(s * 0.4, s * 0.35);
      // Substrato conectado à Source com seta para dentro (Canal N)
      ctx.moveTo(bx, 0);
      ctx.lineTo(s * 0.25, 0);
      ctx.lineTo(s * 0.25, s * 0.35);
      ctx.moveTo(bx + 7 * zoom, -4 * zoom);
      ctx.lineTo(bx, 0);
      ctx.lineTo(bx + 7 * zoom, 4 * zoom);
      ctx.stroke();
      break;
    }

    // PASSIVOS & COMANDOS
    case 'R':
    case 'POT': {
      // Resistor Zigzag padrão Electronics Hub
      const w = s * 0.9;
      const h = s * 0.35;
      ctx.beginPath();
      ctx.moveTo(-w, 0);
      ctx.lineTo(-w * 0.7, 0);
      ctx.lineTo(-w * 0.5, -h);
      ctx.lineTo(-w * 0.2, h);
      ctx.lineTo(w * 0.1, -h);
      ctx.lineTo(w * 0.4, h);
      ctx.lineTo(w * 0.7, 0);
      ctx.lineTo(w, 0);
      ctx.stroke();

      if (code === 'POT') {
        // Seta do cursor central
        ctx.beginPath();
        ctx.moveTo(0, s * 0.7);
        ctx.lineTo(0, h * 0.3);
        ctx.moveTo(-4 * zoom, h * 0.7);
        ctx.lineTo(0, h * 0.3);
        ctx.lineTo(4 * zoom, h * 0.7);
        ctx.stroke();
      }
      break;
    }

    case 'C':
    case 'C_POL': {
      // Capacitor: Duas placas paralelas
      const gap = 5 * zoom;
      ctx.beginPath();
      // Placa 1
      ctx.moveTo(-gap, -s * 0.6);
      ctx.lineTo(-gap, s * 0.6);
      // Placa 2 (plana ou curva se polarizado)
      if (code === 'C_POL') {
        ctx.moveTo(gap, -s * 0.6);
        ctx.quadraticCurveTo(gap + 6 * zoom, 0, gap, s * 0.6);
        ctx.fillText('+', -gap - 8 * zoom, -s * 0.4);
      } else {
        ctx.moveTo(gap, -s * 0.6);
        ctx.lineTo(gap, s * 0.6);
      }
      // Terminais
      ctx.moveTo(-s * 0.8, 0);
      ctx.lineTo(-gap, 0);
      ctx.moveTo(gap, 0);
      ctx.lineTo(s * 0.8, 0);
      ctx.stroke();
      break;
    }

    case 'L': {
      // Indutor: 4 espiras curvadas consecutivas
      const r = s * 0.2;
      ctx.beginPath();
      ctx.moveTo(-s * 0.8, 0);
      ctx.lineTo(-s * 0.6, 0);
      for (let i = 0; i < 3; i++) {
        const cx = -s * 0.4 + i * (r * 2);
        ctx.arc(cx, 0, r, Math.PI, 0, false);
      }
      ctx.lineTo(s * 0.8, 0);
      ctx.stroke();
      break;
    }

    case 'PBNO':
    case 'PBNC': {
      // Botoeiras NA e NF conforme Electronics Hub
      const isNO = code === 'PBNO';
      const pressed = Boolean(st.pressed || (isNO ? st.closed : !st.closed));

      // Dois terminais circulares
      ctx.beginPath();
      ctx.arc(-s * 0.45, s * 0.2, 3 * zoom, 0, Math.PI * 2);
      ctx.arc(s * 0.45, s * 0.2, 3 * zoom, 0, Math.PI * 2);
      ctx.stroke();

      // Barra de contato e haste de acionamento
      const barY = isNO
        ? (pressed ? s * 0.18 : -s * 0.2) // NA desce até encostar
        : (pressed ? -s * 0.2 : s * 0.22); // NF sobe para abrir
      ctx.beginPath();
      ctx.moveTo(-s * 0.6, barY);
      ctx.lineTo(s * 0.6, barY);
      // Haste do botão
      ctx.moveTo(0, barY);
      ctx.lineTo(0, -s * 0.6);
      // Tampa do botão
      ctx.moveTo(-s * 0.25, -s * 0.6);
      ctx.lineTo(s * 0.25, -s * 0.6);
      ctx.stroke();
      break;
    }

    case 'SW':
    case 'MCB1': {
      // SPST Switch / Seccionador unipolar
      const isClosed = Boolean(st.closed && !st.tripped);
      ctx.beginPath();
      ctx.arc(-s * 0.45, 0, 3 * zoom, 0, Math.PI * 2);
      ctx.arc(s * 0.45, 0, 3 * zoom, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(-s * 0.45, 0);
      if (isClosed) {
        ctx.lineTo(s * 0.45, 0);
      } else {
        ctx.lineTo(s * 0.35, -s * 0.5);
      }
      ctx.stroke();
      break;
    }

    case 'BUZZ': {
      // Buzzer: Cúpula com dois terminais
      ctx.beginPath();
      ctx.arc(0, -s * 0.2, s * 0.55, Math.PI, 0);
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-s * 0.25, -s * 0.2);
      ctx.lineTo(-s * 0.25, s * 0.4);
      ctx.moveTo(s * 0.25, -s * 0.2);
      ctx.lineTo(s * 0.25, s * 0.4);
      ctx.stroke();
      break;
    }

    case 'M1PH':
    case 'M3PH': {
      // Motor: Círculo com símbolo M e 3~
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.font = `black ${Math.max(12, 14 * zoom)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(code === 'M3PH' ? 'M 3~' : 'M 1~', 0, 0);
      break;
    }

    default: {
      // Símbolo genérico normativo retangular
      ctx.beginPath();
      ctx.rect(-s * 0.7, -s * 0.4, s * 1.4, s * 0.8);
      ctx.stroke();
      break;
    }
  }

  ctx.restore();
}

// ----------------------------------------------------------------------------
// 2. DESENHO MECÂNICO PSEUDO-3D / ISOMÉTRICO (Industrial & Trilho DIN)
// ----------------------------------------------------------------------------

export function drawMechanical3D(
  ctx: CanvasRenderingContext2D,
  code: string,
  kind: string,
  cw: number,
  ch: number,
  zoom: number,
  st: Record<string, any>,
  isSel: boolean,
  time = 0
) {
  ctx.save();
  const isEnergized = Boolean(st.energized || st.running);
  const isTripped = Boolean(st.tripped);

  // Sombra suave sob o corpo do dispositivo industrial
  ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
  ctx.shadowBlur = 10 * zoom;
  ctx.shadowOffsetY = 5 * zoom;

  // 1. CARCAÇA ESTILO TRILHO DIN (Disjuntores, Contactores, Relés, Fontes)
  if (
    kind === 'breaker' ||
    kind === 'breaker3' ||
    kind === 'contactor' ||
    kind === 'relay' ||
    kind === 'overload' ||
    kind === 'rcd' ||
    kind === 'rcbo' ||
    kind === 'source' ||
    kind === 'plc' ||
    kind === 'vfd'
  ) {
    // Corpo chanfrado em policarbonato industrial
    const baseGrad = ctx.createLinearGradient(-cw / 2, -ch / 2, cw / 2, ch / 2);
    baseGrad.addColorStop(0, isTripped ? '#3b1216' : '#1e293b');
    baseGrad.addColorStop(0.45, isTripped ? '#250b0e' : '#0f172a');
    baseGrad.addColorStop(1, isTripped ? '#190608' : '#090f1d');

    ctx.fillStyle = baseGrad;
    ctx.strokeStyle = isTripped
      ? '#ef4444'
      : isSel
      ? '#38bdf8'
      : isEnergized
      ? '#10b981'
      : '#334155';
    ctx.lineWidth = isSel ? 2.5 : 1.5;

    // Perfil do invólucro chanfrado
    ctx.beginPath();
    ctx.roundRect(-cw / 2, -ch / 2, cw, ch, 6 * zoom);
    ctx.fill();
    ctx.stroke();

    // Ranhuras traseiras do Trilho DIN (35mm) no topo e na base
    ctx.shadowColor = 'transparent';
    ctx.fillStyle = '#060a12';
    ctx.fillRect(-cw * 0.4, -ch / 2 + 2 * zoom, cw * 0.8, 3 * zoom);
    ctx.fillRect(-cw * 0.4, ch / 2 - 5 * zoom, cw * 0.8, 3 * zoom);

    // Parafusos metálicos dos bornes de conexão (com brilho especular e ranhura de fenda)
    const screwR = 4 * zoom;
    const drawScrew = (x: number, y: number) => {
      ctx.save();
      const sGrad = ctx.createRadialGradient(x - 1, y - 1, 0.5, x, y, screwR);
      sGrad.addColorStop(0, '#f8fafc');
      sGrad.addColorStop(0.6, '#94a3b8');
      sGrad.addColorStop(1, '#475569');
      ctx.fillStyle = sGrad;
      ctx.beginPath();
      ctx.arc(x, y, screwR, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 0.7;
      ctx.stroke();
      // Fenda cruzada
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x - screwR * 0.6, y);
      ctx.lineTo(x + screwR * 0.6, y);
      ctx.stroke();
      ctx.restore();
    };

    // Parafusos superiores e inferiores
    const nTerminals = kind === 'breaker3' || kind === 'contactor' ? 3 : 2;
    for (let i = 0; i < nTerminals; i++) {
      const step = (cw * 0.65) / (nTerminals - 1 || 1);
      const sx = -cw * 0.325 + i * step;
      drawScrew(sx, -ch / 2 + 10 * zoom);
      drawScrew(sx, ch / 2 - 10 * zoom);
    }

    // DISJUNTORES & CHAVES: Alavanca mecânica (Toggle Switch 3D) com bandeira de estado
    if (kind === 'breaker' || kind === 'breaker3' || kind === 'overload' || kind === 'rcd' || kind === 'rcbo') {
      const isClosed = Boolean(st.closed && !isTripped);
      // Janela de inspeção de estado mecânico (Vermelho = Ligado / Verde = Desligado)
      ctx.fillStyle = isTripped ? '#ef4444' : isClosed ? '#dc2626' : '#16a34a';
      ctx.fillRect(-cw * 0.22, -ch * 0.28, cw * 0.44, 7 * zoom);
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1;
      ctx.strokeRect(-cw * 0.22, -ch * 0.28, cw * 0.44, 7 * zoom);

      // Alavanca mecânica em relevo
      const levW = 18 * zoom;
      const levH = 26 * zoom;
      const levY = isClosed ? -12 * zoom : 0 * zoom;

      // Sombra da alavanca
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.beginPath();
      ctx.roundRect(-levW / 2 + 2, levY + 3, levW, levH, 3 * zoom);
      ctx.fill();

      // Corpo da alavanca com chanfro
      const levGrad = ctx.createLinearGradient(0, levY, 0, levY + levH);
      levGrad.addColorStop(0, isTripped ? '#b91c1c' : isClosed ? '#475569' : '#334155');
      levGrad.addColorStop(0.5, isTripped ? '#ef4444' : isClosed ? '#64748b' : '#475569');
      levGrad.addColorStop(1, isTripped ? '#7f1d1d' : isClosed ? '#1e293b' : '#0f172a');
      ctx.fillStyle = levGrad;
      ctx.beginPath();
      ctx.roundRect(-levW / 2, levY, levW, levH, 3 * zoom);
      ctx.fill();
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Marcação I / O
      ctx.fillStyle = '#ffffff';
      ctx.font = `black ${Math.max(8, 9 * zoom)}px monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(isTripped ? 'TRIP' : isClosed ? 'I' : 'O', 0, levY + levH * 0.6);
    }

    // CONTATORES: Armadura mecânica móvel (Plunger) que afunda no fechamento
    if (kind === 'contactor' || kind === 'relay') {
      const coilOn = Boolean(st.energized);
      const plungerW = cw * 0.65;
      const plungerH = ch * 0.28;
      const plungerY = -plungerH / 2;

      // Rebaixo do alojamento da armadura
      ctx.fillStyle = '#060b14';
      ctx.fillRect(-plungerW / 2 - 2, plungerY - 2, plungerW + 4, plungerH + 4);

      // Armadura móvel com indicação de deslocamento físico
      const pGrad = ctx.createLinearGradient(0, plungerY, 0, plungerY + plungerH);
      if (coilOn) {
        pGrad.addColorStop(0, '#064e3b');
        pGrad.addColorStop(0.5, '#059669');
        pGrad.addColorStop(1, '#022c22');
      } else {
        pGrad.addColorStop(0, '#334155');
        pGrad.addColorStop(0.5, '#1e293b');
        pGrad.addColorStop(1, '#0f172a');
      }

      ctx.fillStyle = pGrad;
      ctx.beginPath();
      ctx.roundRect(-plungerW / 2, plungerY, plungerW, plungerH, 4 * zoom);
      ctx.fill();
      ctx.strokeStyle = coilOn ? '#34d399' : '#64748b';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      ctx.fillStyle = coilOn ? '#a7f3d0' : '#94a3b8';
      ctx.font = `bold ${Math.max(7, 8 * zoom)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(coilOn ? 'ATRACADO (ON)' : 'REPOUSO (OFF)', 0, plungerY + plungerH * 0.65);
    }

  } else if (kind === 'push' || kind === 'switch') {
    // 2. BOTOEIRAS INDUSTRIAIS (Push Buttons com anel cromado e afundamento mecânico)
    const isNO = code === 'PBNO';
    const isPressed = Boolean(st.pressed);
    const isEmergency = Boolean(code === 'ESTOP');

    // Base de montagem em painel
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(-cw / 2, -ch / 2, cw, ch, 8 * zoom);
    ctx.fill();
    ctx.strokeStyle = isSel ? '#38bdf8' : '#334155';
    ctx.stroke();

    // Anel externo de aço escovado / cromado
    const rOuter = Math.min(cw, ch) * 0.36;
    const rBezel = ctx.createRadialGradient(-2, -2, rOuter * 0.2, 0, 0, rOuter);
    rBezel.addColorStop(0, '#ffffff');
    rBezel.addColorStop(0.4, '#94a3b8');
    rBezel.addColorStop(0.8, '#475569');
    rBezel.addColorStop(1, '#1e293b');
    ctx.fillStyle = rBezel;
    ctx.beginPath();
    ctx.arc(0, 0, rOuter, 0, Math.PI * 2);
    ctx.fill();

    // Botão atuador com afundamento físico (stroke e scale reduz quando pressionado)
    const travel = isPressed ? 3 * zoom : 0;
    const rButton = (rOuter - 4 * zoom) * (isPressed ? 0.92 : 1.0);

    const btnGrad = ctx.createRadialGradient(
      -rButton * 0.3,
      -rButton * 0.3 + travel,
      rButton * 0.1,
      0,
      travel,
      rButton
    );

    if (isEmergency) {
      btnGrad.addColorStop(0, '#f87171');
      btnGrad.addColorStop(0.6, '#dc2626');
      btnGrad.addColorStop(1, '#7f1d1d');
    } else if (isNO) {
      // Verde (S1 Liga)
      btnGrad.addColorStop(0, '#86efac');
      btnGrad.addColorStop(0.5, '#16a34a');
      btnGrad.addColorStop(1, '#14532d');
    } else {
      // Vermelho (S0 Desliga)
      btnGrad.addColorStop(0, '#fca5a5');
      btnGrad.addColorStop(0.5, '#dc2626');
      btnGrad.addColorStop(1, '#7f1d1d');
    }

    ctx.fillStyle = btnGrad;
    ctx.beginPath();
    ctx.arc(0, travel, rButton, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = isPressed ? '#000000' : 'rgba(255,255,255,0.4)';
    ctx.lineWidth = isPressed ? 2 * zoom : 1 * zoom;
    ctx.stroke();

    // Rótulo gravado no botão (I / O / STOP)
    ctx.fillStyle = '#ffffff';
    ctx.font = `black ${Math.max(9, 10 * zoom)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(isEmergency ? 'EMERG' : isNO ? 'I (LIGA)' : 'O (PARAR)', 0, travel);

  } else if (kind === 'motor3' || kind === 'motor1' || kind === 'fan') {
    // 3. MOTORES ELÉTRICOS (Carcaça aletada 3D, caixa de bornes e eixo giratório proporcional ao RPM)
    const isRunning = Boolean(st.running);
    const rpm = isRunning ? (st.rpm || 2920) : 0;

    // Fundo do motor
    ctx.fillStyle = '#08101e';
    ctx.beginPath();
    ctx.roundRect(-cw / 2, -ch / 2, cw, ch, 8 * zoom);
    ctx.fill();
    ctx.strokeStyle = isSel ? '#38bdf8' : isRunning ? '#10b981' : '#1e3a5f';
    ctx.stroke();

    // Carcaça cilíndrica com aletas de refrigeração
    const mRadius = Math.min(cw, ch) * 0.32;
    const mGrad = ctx.createRadialGradient(-3, -3, mRadius * 0.2, 0, 0, mRadius);
    mGrad.addColorStop(0, isRunning ? '#065f46' : '#334155');
    mGrad.addColorStop(0.7, isRunning ? '#064e3b' : '#1e293b');
    mGrad.addColorStop(1, '#090f1a');
    ctx.fillStyle = mGrad;
    ctx.beginPath();
    ctx.arc(0, -3 * zoom, mRadius, 0, Math.PI * 2);
    ctx.fill();

    // Aletas radiais de ventilação
    ctx.strokeStyle = isRunning ? '#34d399' : '#475569';
    ctx.lineWidth = 1.5;
    for (let a = 0; a < 8; a++) {
      const ang = (a * Math.PI) / 4;
      ctx.beginPath();
      ctx.moveTo(Math.cos(ang) * (mRadius * 0.55), -3 * zoom + Math.sin(ang) * (mRadius * 0.55));
      ctx.lineTo(Math.cos(ang) * (mRadius * 0.95), -3 * zoom + Math.sin(ang) * (mRadius * 0.95));
      ctx.stroke();
    }

    // Ponta do eixo em rotação contínua 3D com chaveta mecânica
    ctx.save();
    ctx.translate(0, -3 * zoom);
    const shaftR = mRadius * 0.42;

    // Disco do eixo
    const shGrad = ctx.createRadialGradient(-1, -1, 1, 0, 0, shaftR);
    shGrad.addColorStop(0, '#f8fafc');
    shGrad.addColorStop(0.5, '#94a3b8');
    shGrad.addColorStop(1, '#475569');
    ctx.fillStyle = shGrad;
    ctx.beginPath();
    ctx.arc(0, 0, shaftR, 0, Math.PI * 2);
    ctx.fill();

    // Chaveta mecânica rodando proporcional ao RPM
    const shaftAngle = isRunning ? (time * (rpm / 60) * Math.PI * 2) : 0;
    ctx.rotate(shaftAngle);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(shaftR * 0.2, -3 * zoom, shaftR * 0.7, 6 * zoom);
    ctx.strokeStyle = isRunning ? '#34d399' : '#64748b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-shaftR * 0.7, 0);
    ctx.lineTo(shaftR * 0.7, 0);
    ctx.stroke();
    ctx.restore();

    // Caixa de bornes superior (U, V, W, PE)
    ctx.fillStyle = '#0a1526';
    ctx.fillRect(-cw * 0.35, -ch / 2 + 3 * zoom, cw * 0.7, 8 * zoom);
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 1;
    ctx.strokeRect(-cw * 0.35, -ch / 2 + 3 * zoom, cw * 0.7, 8 * zoom);

    // Indicador digital de RPM
    ctx.fillStyle = isRunning ? '#34d399' : '#94a3b8';
    ctx.font = `black ${Math.max(8, 9 * zoom)}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText(isRunning ? `${Math.round(rpm)} RPM` : 'PARADO (0 RPM)', 0, ch / 2 - 8 * zoom);
  } else {
    // Padrão genérico enriquecido com iluminação
    ctx.fillStyle = '#0c1a2f';
    ctx.beginPath();
    ctx.roundRect(-cw / 2, -ch / 2, cw, ch, 6 * zoom);
    ctx.fill();
    ctx.strokeStyle = isSel ? '#38bdf8' : '#224268';
    ctx.stroke();
  }

  ctx.restore();
}
