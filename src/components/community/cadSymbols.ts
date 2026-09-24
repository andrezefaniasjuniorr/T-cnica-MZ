// ============================================================================
// TÉCNICAMZ PRO — MOTOR CAD ELÉTRICO & ELETRÔNICO: SIMBOLOGIA NORMATIVA & 3D ULTRA-REALISTA
// Padrão Normativo: IEC 60617 / DIN EN 60617 & ISO 128
// Renderização Física Pseudo-3D (PBR Canvas2D) para Automação Industrial
// ============================================================================

import { ComponentDef, WIRE_COLORS } from './cadEngine';

export type CadRenderStyle = '3d_mechanical' | 'normative_symbols';

// ----------------------------------------------------------------------------
// UTILITÁRIOS DE RENDERIZAÇÃO PBR & MATERIAIS
// ----------------------------------------------------------------------------

function drawMetallicTexture(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  angle = 0
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  const grad = ctx.createLinearGradient(-r, -r, r, r);
  grad.addColorStop(0, '#f8fafc');
  grad.addColorStop(0.2, '#94a3b8');
  grad.addColorStop(0.5, '#cbd5e1');
  grad.addColorStop(0.8, '#475569');
  grad.addColorStop(1, '#1e293b');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();

  // Brilho Anisotrópico (Efeito Aço Escovado)
  const specGrad = ctx.createLinearGradient(-r, 0, r, 0);
  specGrad.addColorStop(0, 'rgba(255,255,255,0)');
  specGrad.addColorStop(0.5, 'rgba(255,255,255,0.45)');
  specGrad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = specGrad;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawIndustrialScrew(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  rotation = 0.785
) {
  ctx.save();
  // Sombra de inserção do borne
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.beginPath();
  ctx.arc(x + 0.5, y + 0.8, radius + 0.5, 0, Math.PI * 2);
  ctx.fill();

  // Cabeça metálica
  drawMetallicTexture(ctx, x, y, radius, rotation);

  // Fenda Mista PZ2 / Pozidriv com Profundidade 3D
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = Math.max(1, radius * 0.35);
  ctx.lineCap = 'round';

  ctx.beginPath();
  ctx.moveTo(-radius * 0.65, 0);
  ctx.lineTo(radius * 0.65, 0);
  ctx.stroke();

  ctx.lineWidth = Math.max(0.6, radius * 0.18);
  ctx.beginPath();
  ctx.moveTo(0, -radius * 0.65);
  ctx.lineTo(0, radius * 0.65);
  ctx.stroke();

  // Bisel interno do parafuso
  ctx.strokeStyle = 'rgba(255,255,255,0.6)';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.82, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
}

// ----------------------------------------------------------------------------
// 1. DESENHO DE SÍMBOLOS NORMATIVOS RIGOROSOS (IEC 60617 / DIN EN 60617)
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
    // FONTES DE ALIMENTAÇÃO (IEC 60617-2)
    case 'BAT': {
      const gap = 5 * zoom;
      ctx.beginPath();
      // Placa Positiva
      ctx.moveTo(-gap * 1.5, -s * 0.7);
      ctx.lineTo(-gap * 1.5, s * 0.7);
      // Placa Negativa (espessa)
      ctx.moveTo(-gap * 0.5, -s * 0.35);
      ctx.lineTo(-gap * 0.5, s * 0.35);
      // Placa Positiva 2
      ctx.moveTo(gap * 0.5, -s * 0.7);
      ctx.lineTo(gap * 0.5, s * 0.7);
      // Placa Negativa 2
      ctx.moveTo(gap * 1.5, -s * 0.35);
      ctx.lineTo(gap * 1.5, s * 0.35);
      ctx.stroke();

      // Sinais de polaridade IEC
      ctx.font = `bold ${Math.max(9, 10 * zoom)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('+', -gap * 2.5, -s * 0.4);
      ctx.fillText('−', gap * 2.5, -s * 0.4);
      break;
    }

    case 'SRC_AC1':
    case 'SRC_AC3': {
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.75, 0, Math.PI * 2);
      ctx.stroke();

      // Senoide Harmónica IEC
      ctx.beginPath();
      const w = s * 0.4;
      ctx.moveTo(-w, 0);
      ctx.bezierCurveTo(-w * 0.5, -s * 0.45, -w * 0.25, -s * 0.45, 0, 0);
      ctx.bezierCurveTo(w * 0.25, s * 0.45, w * 0.5, s * 0.45, w, 0);
      ctx.stroke();

      if (code === 'SRC_AC3') {
        ctx.font = `bold ${Math.max(8, 9 * zoom)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText('3~', 0, s * 0.45);
      }
      break;
    }

    case 'SRC_DC24': {
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.75, 0, Math.PI * 2);
      ctx.stroke();

      // Símbolo DC Normativo (Linha contínua e tracejada)
      ctx.beginPath();
      ctx.moveTo(-s * 0.35, -s * 0.15);
      ctx.lineTo(s * 0.35, -s * 0.15);
      ctx.stroke();

      ctx.setLineDash([2 * zoom, 2 * zoom]);
      ctx.beginPath();
      ctx.moveTo(-s * 0.35, s * 0.15);
      ctx.lineTo(s * 0.35, s * 0.15);
      ctx.stroke();
      ctx.setLineDash([]);
      break;
    }

    case 'GND': {
      // Terra de Proteção (PE - IEC 60617-2)
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.7);
      ctx.lineTo(0, 0);
      ctx.moveTo(-s * 0.6, 0);
      ctx.lineTo(s * 0.6, 0);
      ctx.moveTo(-s * 0.4, s * 0.25);
      ctx.lineTo(s * 0.4, s * 0.25);
      ctx.moveTo(-s * 0.2, s * 0.5);
      ctx.lineTo(s * 0.2, s * 0.5);
      ctx.stroke();
      break;
    }

    // SEMICONDUTORES (IEC 60617-5)
    case 'DIODE':
    case 'ZENER':
    case 'LED': {
      const dW = s * 0.7;
      const dH = s * 0.6;

      ctx.beginPath();
      ctx.moveTo(-dW * 0.5, -dH * 0.5);
      ctx.lineTo(-dW * 0.5, dH * 0.5);
      ctx.lineTo(dW * 0.5, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      if (code === 'ZENER') {
        ctx.moveTo(dW * 0.5 - 3 * zoom, -dH * 0.6);
        ctx.lineTo(dW * 0.5, -dH * 0.6);
        ctx.lineTo(dW * 0.5, dH * 0.6);
        ctx.lineTo(dW * 0.5 + 3 * zoom, dH * 0.6);
      } else {
        ctx.moveTo(dW * 0.5, -dH * 0.6);
        ctx.lineTo(dW * 0.5, dH * 0.6);
      }
      ctx.stroke();

      if (code === 'LED') {
        ctx.lineWidth = Math.max(1, 1.2 * zoom);
        for (let i = 0; i < 2; i++) {
          const off = i * 6 * zoom;
          ctx.beginPath();
          ctx.moveTo(-2 * zoom + off, -dH * 0.7);
          ctx.lineTo(4 * zoom + off, -dH * 1.2);
          ctx.lineTo(1 * zoom + off, -dH * 1.15);
          ctx.moveTo(4 * zoom + off, -dH * 1.2);
          ctx.lineTo(3.5 * zoom + off, -dH * 0.95);
          ctx.stroke();
        }
      }
      break;
    }

    case 'BJT_NPN':
    case 'BJT_PNP': {
      const isNPN = code === 'BJT_NPN';
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.8, 0, Math.PI * 2);
      ctx.stroke();

      // Placa de Base
      ctx.lineWidth = Math.max(2.5, 3 * zoom);
      ctx.beginPath();
      ctx.moveTo(-s * 0.3, -s * 0.45);
      ctx.lineTo(-s * 0.3, s * 0.45);
      ctx.stroke();

      // Terminais
      ctx.lineWidth = Math.max(1.5, 1.8 * zoom);
      ctx.beginPath();
      ctx.moveTo(-s * 0.75, 0);
      ctx.lineTo(-s * 0.3, 0);
      ctx.moveTo(-s * 0.3, -s * 0.25);
      ctx.lineTo(s * 0.45, -s * 0.6);
      ctx.moveTo(-s * 0.3, s * 0.25);
      ctx.lineTo(s * 0.45, s * 0.6);
      ctx.stroke();

      // Seta de Emissor Preenchida
      ctx.beginPath();
      if (isNPN) {
        ctx.moveTo(s * 0.45, s * 0.6);
        ctx.lineTo(s * 0.2, s * 0.42);
        ctx.lineTo(s * 0.32, s * 0.28);
      } else {
        ctx.moveTo(-s * 0.25, s * 0.22);
        ctx.lineTo(-s * 0.02, s * 0.38);
        ctx.lineTo(-s * 0.12, s * 0.52);
      }
      ctx.closePath();
      ctx.fill();
      break;
    }

    // PASSIVOS & ELEMENTOS DE COMANDO (IEC 60617-4 / IEC 60617-7)
    case 'R':
    case 'POT': {
      const w = s * 0.8;
      const h = s * 0.3;
      // Resistor Norma IEC (Retângulo limpo)
      ctx.beginPath();
      ctx.rect(-w * 0.6, -h, w * 1.2, h * 2);
      ctx.stroke();

      if (code === 'POT') {
        // Seta de Ajuste Variável IEC
        ctx.beginPath();
        ctx.moveTo(-w * 0.5, h * 1.6);
        ctx.lineTo(w * 0.5, -h * 1.6);
        ctx.lineTo(w * 0.2, -h * 1.6);
        ctx.moveTo(w * 0.5, -h * 1.6);
        ctx.lineTo(w * 0.5, -h * 0.9);
        ctx.stroke();
      }
      break;
    }

    case 'C':
    case 'C_POL': {
      const gap = 4 * zoom;
      ctx.beginPath();
      ctx.moveTo(-gap, -s * 0.6);
      ctx.lineTo(-gap, s * 0.6);
      ctx.moveTo(gap, -s * 0.6);
      ctx.lineTo(gap, s * 0.6);
      ctx.moveTo(-s * 0.8, 0);
      ctx.lineTo(-gap, 0);
      ctx.moveTo(gap, 0);
      ctx.lineTo(s * 0.8, 0);
      ctx.stroke();

      if (code === 'C_POL') {
        ctx.fillStyle = color;
        ctx.fillRect(-gap - 3 * zoom, -s * 0.5, 3 * zoom, s * 1.0);
        ctx.font = `bold ${Math.max(8, 9 * zoom)}px sans-serif`;
        ctx.fillText('+', -gap - 8 * zoom, -s * 0.3);
      }
      break;
    }

    case 'PBNO':
    case 'PBNC': {
      const isNO = code === 'PBNO';
      const pressed = Boolean(st.pressed || (isNO ? st.closed : !st.closed));

      // Terminais FIXOS
      ctx.beginPath();
      ctx.arc(-s * 0.4, s * 0.2, 2.5 * zoom, 0, Math.PI * 2);
      ctx.arc(s * 0.4, s * 0.2, 2.5 * zoom, 0, Math.PI * 2);
      ctx.stroke();

      const barY = isNO ? (pressed ? s * 0.18 : -s * 0.15) : (pressed ? -s * 0.15 : s * 0.18);

      // Ponte MÓVEL
      ctx.beginPath();
      ctx.moveTo(-s * 0.5, barY);
      ctx.lineTo(s * 0.5, barY);
      ctx.moveTo(0, barY);
      ctx.lineTo(0, -s * 0.55);
      ctx.moveTo(-s * 0.2, -s * 0.55);
      ctx.lineTo(s * 0.2, -s * 0.55);
      ctx.stroke();
      break;
    }

    case 'M1PH':
    case 'M3PH': {
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.8, 0, Math.PI * 2);
      ctx.stroke();

      ctx.font = `bold ${Math.max(11, 13 * zoom)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('M', 0, -s * 0.15);

      ctx.font = `${Math.max(8, 9 * zoom)}px sans-serif`;
      ctx.fillText(code === 'M3PH' ? '3 ~' : '1 ~', 0, s * 0.35);
      break;
    }

    default: {
      ctx.beginPath();
      ctx.rect(-s * 0.7, -s * 0.4, s * 1.4, s * 0.8);
      ctx.stroke();
      break;
    }
  }

  ctx.restore();
}

// ----------------------------------------------------------------------------
// 2. RENDERING PSEUDO-3D ULTRA-REALISTA (Equipamentos Industriais DIN/IP65)
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

  // Sombreamento Ray-Cast projetado no fundo do painel
  ctx.shadowColor = 'rgba(2, 6, 23, 0.65)';
  ctx.shadowBlur = 14 * zoom;
  ctx.shadowOffsetX = 4 * zoom;
  ctx.shadowOffsetY = 8 * zoom;

  // --------------------------------------------------------------------------
  // A. EQUIPAMENTOS EM TRILHO DIN (Disjuntores, Contactores, Relés, PLCs)
  // --------------------------------------------------------------------------
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
    // Carcaça Termoplástica de Alta Resistência V0 (Texturizada)
    const baseGrad = ctx.createLinearGradient(-cw / 2, -ch / 2, cw / 2, ch / 2);
    if (isTripped) {
      baseGrad.addColorStop(0, '#450a0a');
      baseGrad.addColorStop(0.5, '#280505');
      baseGrad.addColorStop(1, '#110202');
    } else {
      baseGrad.addColorStop(0, '#334155');
      baseGrad.addColorStop(0.2, '#1e293b');
      baseGrad.addColorStop(0.8, '#0f172a');
      baseGrad.addColorStop(1, '#020617');
    }

    ctx.fillStyle = baseGrad;
    ctx.strokeStyle = isSel
      ? '#38bdf8'
      : isTripped
      ? '#ef4444'
      : isEnergized
      ? '#10b981'
      : '#475569';
    ctx.lineWidth = isSel ? 2.5 * zoom : 1.2 * zoom;

    // Perfil Chanfrado do Módulo DIN (ISO/EN 50022)
    const rCorner = 4 * zoom;
    ctx.beginPath();
    ctx.roundRect(-cw / 2, -ch / 2, cw, ch, rCorner);
    ctx.fill();
    ctx.stroke();

    // Reflexo Especular de Luz no Ângulo do Painel Superior
    ctx.shadowColor = 'transparent';
    const specGrad = ctx.createLinearGradient(-cw / 2, -ch / 2, -cw / 2, -ch / 2 + 12 * zoom);
    specGrad.addColorStop(0, 'rgba(255, 255, 255, 0.25)');
    specGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = specGrad;
    ctx.beginPath();
    ctx.roundRect(-cw / 2 + 1, -ch / 2 + 1, cw - 2, 10 * zoom, [rCorner, rCorner, 0, 0]);
    ctx.fill();

    // Ranhuras de Travamento do Trilho DIN 35mm
    ctx.fillStyle = '#020617';
    ctx.fillRect(-cw * 0.45, -ch / 2 + 2 * zoom, cw * 0.9, 3 * zoom);
    ctx.fillRect(-cw * 0.45, ch / 2 - 5 * zoom, cw * 0.9, 3 * zoom);

    // Bornes de Ligação em Cobre/Aço com Parafusos Imperdíveis
    const nTerminals = kind === 'breaker3' || kind === 'contactor' ? 3 : 2;
    for (let i = 0; i < nTerminals; i++) {
      const step = (cw * 0.68) / (nTerminals - 1 || 1);
      const sx = -cw * 0.34 + i * step;

      // Túnel de Entrada de Cabos
      ctx.fillStyle = '#090d16';
      ctx.beginPath();
      ctx.arc(sx, -ch / 2 + 9 * zoom, 5 * zoom, 0, Math.PI * 2);
      ctx.arc(sx, ch / 2 - 9 * zoom, 5 * zoom, 0, Math.PI * 2);
      ctx.fill();

      // Parafusos M3/M4 dos Bornes
      drawIndustrialScrew(ctx, sx, -ch / 2 + 9 * zoom, 3.8 * zoom, 0.4);
      drawIndustrialScrew(ctx, sx, ch / 2 - 9 * zoom, 3.8 * zoom, 1.2);
    }

    // DISJUNTORES (MCB/MCCB): Alavanca Bipolar/Tripolar com Trava Mecânica
    if (kind === 'breaker' || kind === 'breaker3' || kind === 'overload' || kind === 'rcd' || kind === 'rcbo') {
      const isClosed = Boolean(st.closed && !isTripped);

      // Flag Visual de Estado Mecânico (Norma IEC: Vermelho=LIG/ON, Verde=DESL/OFF)
      const flagW = cw * 0.38;
      const flagH = 6 * zoom;
      const flagY = -ch * 0.28;

      ctx.fillStyle = isTripped ? '#e11d48' : isClosed ? '#dc2626' : '#16a34a';
      ctx.beginPath();
      ctx.rect(-flagW / 2, flagY, flagW, flagH);
      ctx.fill();
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // Texto de Flag Impresso
      ctx.fillStyle = '#ffffff';
      ctx.font = `black ${Math.max(6, 7 * zoom)}px monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(isTripped ? 'TRIP' : isClosed ? 'I-ON' : 'O-OFF', 0, flagY + flagH * 0.8);

      // Alavanca Basculante 3D (Toggle Switch)
      const levW = Math.min(cw * 0.4, 22 * zoom);
      const levH = 24 * zoom;
      const levY = isClosed ? -10 * zoom : 2 * zoom;

      // Sombra Dinâmica da Alavanca
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.beginPath();
      ctx.roundRect(-levW / 2 + 2, levY + 4, levW, levH, 3 * zoom);
      ctx.fill();

      // Cor do Atuador
      const levGrad = ctx.createLinearGradient(0, levY, 0, levY + levH);
      if (isTripped) {
        levGrad.addColorStop(0, '#f87171');
        levGrad.addColorStop(0.5, '#dc2626');
        levGrad.addColorStop(1, '#450a0a');
      } else {
        levGrad.addColorStop(0, '#64748b');
        levGrad.addColorStop(0.5, '#334155');
        levGrad.addColorStop(1, '#0f172a');
      }

      ctx.fillStyle = levGrad;
      ctx.beginPath();
      ctx.roundRect(-levW / 2, levY, levW, levH, 3 * zoom);
      ctx.fill();
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 0.8 * zoom;
      ctx.stroke();

      // Ranhuras Antiderrapantes na Alavanca
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.lineWidth = 1 * zoom;
      for (let r = 1; r <= 3; r++) {
        ctx.beginPath();
        ctx.moveTo(-levW * 0.35, levY + r * 5 * zoom);
        ctx.lineTo(levW * 0.35, levY + r * 5 * zoom);
        ctx.stroke();
      }
    }

    // CONTACTORES E RELÉS: Armadura Móvel (Plunger Magnet) e Núcleo Rebaixado
    if (kind === 'contactor' || kind === 'relay') {
      const coilOn = Boolean(st.energized);
      const pW = cw * 0.62;
      const pH = ch * 0.25;
      const pY = -pH / 2;

      // Cavidade Interna da Armadura
      ctx.fillStyle = '#020617';
      ctx.fillRect(-pW / 2 - 1.5, pY - 1.5, pW + 3, pH + 3);

      // Armadura Solenóide Recuada/Atracada
      const plungeOffset = coilOn ? 2.5 * zoom : 0;
      const pGrad = ctx.createLinearGradient(0, pY, 0, pY + pH);

      if (coilOn) {
        pGrad.addColorStop(0, '#059669');
        pGrad.addColorStop(0.5, '#10b981');
        pGrad.addColorStop(1, '#022c22');
      } else {
        pGrad.addColorStop(0, '#475569');
        pGrad.addColorStop(0.5, '#1e293b');
        pGrad.addColorStop(1, '#0f172a');
      }

      ctx.fillStyle = pGrad;
      ctx.beginPath();
      ctx.roundRect(
        -pW / 2 + plungeOffset * 0.5,
        pY + plungeOffset,
        pW - plungeOffset,
        pH,
        3 * zoom
      );
      ctx.fill();
      ctx.strokeStyle = coilOn ? '#6ee7b7' : '#64748b';
      ctx.lineWidth = 1 * zoom;
      ctx.stroke();

      // Indicador Óptico de Bobina Energizada (LED Status)
      ctx.fillStyle = coilOn ? '#34d399' : '#334155';
      ctx.shadowColor = coilOn ? '#34d399' : 'transparent';
      ctx.shadowBlur = 8 * zoom;
      ctx.beginPath();
      ctx.arc(-pW / 2 + 6 * zoom, pY + pH / 2, 2 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Placa de Identificação Laser (Gravação Técnica)
    ctx.fillStyle = '#94a3b8';
    ctx.font = `bold ${Math.max(7, 8 * zoom)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(code, 0, ch / 2 - 18 * zoom);

  } else if (kind === 'push' || kind === 'switch') {
    // ------------------------------------------------------------------------
    // B. BOTOEIRAS INDUSTRIAIS IP65 (Anel Cromado, Atuador de Silicone)
    // ------------------------------------------------------------------------
    const isNO = code === 'PBNO';
    const isPressed = Boolean(st.pressed);
    const isEmergency = Boolean(code === 'ESTOP');

    // Flange Industrial de Fixação em Painel
    const flangeGrad = ctx.createLinearGradient(-cw / 2, -ch / 2, cw / 2, ch / 2);
    flangeGrad.addColorStop(0, '#1e293b');
    flangeGrad.addColorStop(1, '#020617');
    ctx.fillStyle = flangeGrad;
    ctx.beginPath();
    ctx.roundRect(-cw / 2, -ch / 2, cw, ch, 8 * zoom);
    ctx.fill();
    ctx.strokeStyle = isSel ? '#38bdf8' : '#334155';
    ctx.lineWidth = isSel ? 2 * zoom : 1 * zoom;
    ctx.stroke();

    // Anel Biselado Metálico Cromado (Bezel Industrial)
    const rOuter = Math.min(cw, ch) * 0.38;
    drawMetallicTexture(ctx, 0, 0, rOuter, 2.35);

    // Atuador Cilíndrico com Recuo Físico no Clique
    const travel = isPressed ? 2.5 * zoom : 0;
    const rBtn = (rOuter - 4.5 * zoom) - (isPressed ? 1 * zoom : 0);

    const btnGrad = ctx.createRadialGradient(
      -rBtn * 0.35,
      -rBtn * 0.35 + travel,
      rBtn * 0.1,
      0,
      travel,
      rBtn
    );

    if (isEmergency) {
      // Botão Cogumelo de Emergência (Vermelho Amarelo Norma ISO 13850)
      btnGrad.addColorStop(0, '#fca5a5');
      btnGrad.addColorStop(0.4, '#dc2626');
      btnGrad.addColorStop(0.8, '#991b1b');
      btnGrad.addColorStop(1, '#450a0a');
    } else if (isNO) {
      // Atuador Verde (Start/Liga)
      btnGrad.addColorStop(0, '#a7f3d0');
      btnGrad.addColorStop(0.4, '#16a34a');
      btnGrad.addColorStop(0.8, '#166534');
      btnGrad.addColorStop(1, '#052e16');
    } else {
      // Atuador Vermelho (Stop/Desliga)
      btnGrad.addColorStop(0, '#fca5a5');
      btnGrad.addColorStop(0.4, '#dc2626');
      btnGrad.addColorStop(0.8, '#991b1b');
      btnGrad.addColorStop(1, '#450a0a');
    }

    ctx.fillStyle = btnGrad;
    ctx.beginPath();
    ctx.arc(0, travel, rBtn, 0, Math.PI * 2);
    ctx.fill();

    // Anel de Vedação em Borracha NBR
    ctx.strokeStyle = isPressed ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 1.2 * zoom;
    ctx.stroke();

    // Símbolo Tampografado na Face do Botão
    ctx.fillStyle = '#ffffff';
    ctx.font = `black ${Math.max(9, 11 * zoom)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(isEmergency ? 'EMERG' : isNO ? 'I' : 'O', 0, travel);

  } else if (kind === 'motor3' || kind === 'motor1' || kind === 'fan') {
    // ------------------------------------------------------------------------
    // C. MOTOR ELÉTRICO ASÍNCRONO TRIFÁSICO (IEC Frame - Carcaça Aletada)
    // ------------------------------------------------------------------------
    const isRunning = Boolean(st.running);
    const rpm = isRunning ? st.rpm || 2920 : 0;

    // Placa de Fundo da Base de Montagem
    ctx.fillStyle = '#030712';
    ctx.beginPath();
    ctx.roundRect(-cw / 2, -ch / 2, cw, ch, 8 * zoom);
    ctx.fill();
    ctx.strokeStyle = isSel ? '#38bdf8' : isRunning ? '#10b981' : '#1e293b';
    ctx.lineWidth = isSel ? 2 * zoom : 1 * zoom;
    ctx.stroke();

    // Carcaça Cilíndrica em Ferro Fundido
    const mRadius = Math.min(cw, ch) * 0.34;
    const bodyGrad = ctx.createRadialGradient(-4, -4, mRadius * 0.2, 0, 0, mRadius);
    bodyGrad.addColorStop(0, isRunning ? '#065f46' : '#334155');
    bodyGrad.addColorStop(0.6, isRunning ? '#044e37' : '#1e293b');
    bodyGrad.addColorStop(1, '#020617');

    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.arc(0, -2 * zoom, mRadius, 0, Math.PI * 2);
    ctx.fill();

    // Aletas Radiadoras de Dissipação Térmica
    ctx.strokeStyle = isRunning ? 'rgba(52, 211, 153, 0.4)' : 'rgba(71, 85, 105, 0.4)';
    ctx.lineWidth = 2 * zoom;
    for (let a = 0; a < 12; a++) {
      const ang = (a * Math.PI) / 6;
      ctx.beginPath();
      ctx.moveTo(Math.cos(ang) * (mRadius * 0.52), -2 * zoom + Math.sin(ang) * (mRadius * 0.52));
      ctx.lineTo(Math.cos(ang) * (mRadius * 0.98), -2 * zoom + Math.sin(ang) * (mRadius * 0.98));
      ctx.stroke();
    }

    // Eixo de Aço Retificado com Rotação Mecânica Ponderada
    ctx.save();
    ctx.translate(0, -2 * zoom);
    const shaftR = mRadius * 0.4;

    drawMetallicTexture(ctx, 0, 0, shaftR, 0);

    // Rasgo de Chaveta DIN 6885 no Eixo
    const shaftAngle = isRunning ? time * (rpm / 60) * Math.PI * 2 : 0;
    ctx.rotate(shaftAngle);

    ctx.fillStyle = '#090d16';
    ctx.fillRect(shaftR * 0.25, -2.5 * zoom, shaftR * 0.65, 5 * zoom);

    // Centro de Apontamento do Eixo
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.arc(0, 0, shaftR * 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Caixa de Ligação / Bornes Superior (IP55)
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-cw * 0.32, -ch / 2 + 2 * zoom, cw * 0.64, 9 * zoom);
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 0.8 * zoom;
    ctx.strokeRect(-cw * 0.32, -ch / 2 + 2 * zoom, cw * 0.64, 9 * zoom);

    // Tacômetro Digital Oled Integrado
    ctx.fillStyle = isRunning ? '#34d399' : '#64748b';
    ctx.font = `black ${Math.max(7, 8.5 * zoom)}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText(isRunning ? `${Math.round(rpm)} RPM` : '0 RPM', 0, ch / 2 - 7 * zoom);

  } else {
    // ------------------------------------------------------------------------
    // D. COMPONENTES GENÉRICOS DE PAINEL INDUSTRIAL
    // ------------------------------------------------------------------------
    const genGrad = ctx.createLinearGradient(-cw / 2, -ch / 2, cw / 2, ch / 2);
    genGrad.addColorStop(0, '#1e293b');
    genGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = genGrad;
    ctx.beginPath();
    ctx.roundRect(-cw / 2, -ch / 2, cw, ch, 5 * zoom);
    ctx.fill();
    ctx.strokeStyle = isSel ? '#38bdf8' : '#334155';
    ctx.lineWidth = 1 * zoom;
    ctx.stroke();
  }

  ctx.restore();
}
