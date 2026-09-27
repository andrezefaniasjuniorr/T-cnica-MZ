// ============================================================================
// TÉCNICAMZ PRO — MOTOR CAD ELÉTRICO & ELETRÔNICO: SIMBOLOGIA NORMATIVA & 3D REALISTA
// Padrão Normativo: IEC 60617 / DIN EN 60617, IEC 60669, IEC 60947 & ISO 13850
// Renderização Física Pseudo-3D (PBR Canvas2D) Comercial para Comutação e Controle
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

      // Símbolo DC Normativo
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

    // INTERRUPTORES E COMUTADORES (IEC 60617-7)
    case 'SW': {
      const isClosed = Boolean(st.closed);
      ctx.beginPath();
      ctx.arc(0, s * 0.5, 2.5 * zoom, 0, Math.PI * 2);
      ctx.arc(0, -s * 0.5, 2.5 * zoom, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(0, s * 0.45);
      ctx.lineTo(isClosed ? 0 : s * 0.4, -s * 0.45);
      ctx.stroke();
      break;
    }

    case 'SW2': {
      const isClosed = Boolean(st.closed);
      for (let p = -1; p <= 1; p += 2) {
        const ox = p * s * 0.4;
        ctx.beginPath();
        ctx.arc(ox, s * 0.5, 2 * zoom, 0, Math.PI * 2);
        ctx.arc(ox, -s * 0.5, 2 * zoom, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(ox, s * 0.45);
        ctx.lineTo(isClosed ? ox : ox + s * 0.35, -s * 0.45);
        ctx.stroke();
      }
      ctx.setLineDash([2 * zoom, 2 * zoom]);
      ctx.beginPath();
      ctx.moveTo(-s * 0.3, 0);
      ctx.lineTo(s * 0.3, 0);
      ctx.stroke();
      ctx.setLineDash([]);
      break;
    }

    case 'THREE_WAY': {
      const pos = st.position !== undefined ? st.position : (st.closed ? 1 : 0);
      ctx.beginPath();
      ctx.arc(0, s * 0.6, 2.5 * zoom, 0, Math.PI * 2);
      ctx.arc(-s * 0.5, -s * 0.6, 2.5 * zoom, 0, Math.PI * 2);
      ctx.arc(s * 0.5, -s * 0.6, 2.5 * zoom, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(0, s * 0.55);
      ctx.lineTo(pos === 0 ? -s * 0.45 : s * 0.45, -s * 0.55);
      ctx.stroke();
      break;
    }

    case 'FOUR_WAY': {
      const crossed = Boolean(st.crossed ?? st.closed);
      ctx.beginPath();
      ctx.arc(-s * 0.4, -s * 0.5, 2.5 * zoom, 0, Math.PI * 2);
      ctx.arc(s * 0.4, -s * 0.5, 2.5 * zoom, 0, Math.PI * 2);
      ctx.arc(-s * 0.4, s * 0.5, 2.5 * zoom, 0, Math.PI * 2);
      ctx.arc(s * 0.4, s * 0.5, 2.5 * zoom, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      if (!crossed) {
        ctx.moveTo(-s * 0.4, -s * 0.4);
        ctx.lineTo(-s * 0.4, s * 0.4);
        ctx.moveTo(s * 0.4, -s * 0.4);
        ctx.lineTo(s * 0.4, s * 0.4);
      } else {
        ctx.moveTo(-s * 0.4, -s * 0.4);
        ctx.lineTo(s * 0.4, s * 0.4);
        ctx.moveTo(s * 0.4, -s * 0.4);
        ctx.lineTo(-s * 0.4, s * 0.4);
      }
      ctx.stroke();
      break;
    }

    case 'SEL': {
      const pos = Number(st.position ?? 0);
      ctx.beginPath();
      ctx.arc(0, s * 0.5, 2.5 * zoom, 0, Math.PI * 2);
      ctx.arc(-s * 0.45, -s * 0.5, 2.5 * zoom, 0, Math.PI * 2);
      ctx.arc(s * 0.45, -s * 0.5, 2.5 * zoom, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(0, s * 0.45);
      ctx.lineTo(pos === 0 ? -s * 0.4 : s * 0.4, -s * 0.45);
      ctx.stroke();

      ctx.font = `bold ${Math.max(6, 7 * zoom)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('M', -s * 0.5, -s * 0.7);
      ctx.fillText('A', s * 0.5, -s * 0.7);
      break;
    }

    case 'DIMMER': {
      const pct = Number(st.percent ?? 100);
      ctx.beginPath();
      ctx.rect(-s * 0.6, -s * 0.4, s * 1.2, s * 0.8);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(-s * 0.5, s * 0.5);
      ctx.lineTo(s * 0.5, -s * 0.5);
      ctx.lineTo(s * 0.2, -s * 0.5);
      ctx.moveTo(s * 0.5, -s * 0.5);
      ctx.lineTo(s * 0.5, -s * 0.2);
      ctx.stroke();

      ctx.font = `bold ${Math.max(7, 8 * zoom)}px monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(`${pct}%`, 0, s * 0.75);
      break;
    }

    case 'ESTOP': {
      const isTripped = Boolean(st.pressed || st.tripped || !st.closed);
      ctx.beginPath();
      ctx.arc(0, s * 0.5, 2.5 * zoom, 0, Math.PI * 2);
      ctx.arc(0, -s * 0.5, 2.5 * zoom, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(0, s * 0.45);
      ctx.lineTo(isTripped ? s * 0.4 : 0, -s * 0.45);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(isTripped ? s * 0.4 : 0, -s * 0.65, 4.5 * zoom, 0, Math.PI, true);
      ctx.stroke();
      break;
    }

    case 'LIMIT': {
      const actuated = Boolean(st.actuated || st.pressed);
      ctx.beginPath();
      ctx.arc(0, s * 0.5, 2.5 * zoom, 0, Math.PI * 2);
      ctx.arc(0, -s * 0.5, 2.5 * zoom, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(0, s * 0.45);
      ctx.lineTo(actuated ? s * 0.35 : 0, -s * 0.45);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(actuated ? s * 0.45 : s * 0.1, -s * 0.6, 3 * zoom, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }

    case 'FLOAT': {
      const isUp = Boolean(st.closed || st.high);
      ctx.beginPath();
      ctx.arc(0, s * 0.5, 2.5 * zoom, 0, Math.PI * 2);
      ctx.arc(0, -s * 0.5, 2.5 * zoom, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(0, s * 0.45);
      ctx.lineTo(isUp ? 0 : s * 0.35, -s * 0.45);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(s * 0.4, 0, 4 * zoom, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(s * 0.2, 7 * zoom);
      ctx.lineTo(s * 0.6, 7 * zoom);
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

      ctx.lineWidth = Math.max(2.5, 3 * zoom);
      ctx.beginPath();
      ctx.moveTo(-s * 0.3, -s * 0.45);
      ctx.lineTo(-s * 0.3, s * 0.45);
      ctx.stroke();

      ctx.lineWidth = Math.max(1.5, 1.8 * zoom);
      ctx.beginPath();
      ctx.moveTo(-s * 0.75, 0);
      ctx.lineTo(-s * 0.3, 0);
      ctx.moveTo(-s * 0.3, -s * 0.25);
      ctx.lineTo(s * 0.45, -s * 0.6);
      ctx.moveTo(-s * 0.3, s * 0.25);
      ctx.lineTo(s * 0.45, s * 0.6);
      ctx.stroke();

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

    case 'R':
    case 'POT': {
      const w = s * 0.8;
      const h = s * 0.3;
      ctx.beginPath();
      ctx.rect(-w * 0.6, -h, w * 1.2, h * 2);
      ctx.stroke();

      if (code === 'POT') {
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

      ctx.beginPath();
      ctx.arc(-s * 0.4, s * 0.2, 2.5 * zoom, 0, Math.PI * 2);
      ctx.arc(s * 0.4, s * 0.2, 2.5 * zoom, 0, Math.PI * 2);
      ctx.stroke();

      const barY = isNO ? (pressed ? s * 0.18 : -s * 0.15) : (pressed ? -s * 0.15 : s * 0.18);

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
  // 1. INTERRUPTORES RESIDENCIAIS & COMERCIAIS (MODULARES 4x2)
  // --------------------------------------------------------------------------
  if (code === 'SW' || code === 'SW2' || code === 'SW_DOUBLE' || code === 'THREE_WAY' || code === 'FOUR_WAY') {
    const plateW = cw * 0.92;
    const plateH = ch * 0.86;
    const plateRad = 5 * zoom;

    const plateGrad = ctx.createLinearGradient(-plateW / 2, -plateH / 2, plateW / 2, plateH / 2);
    plateGrad.addColorStop(0, '#f8fafc');
    plateGrad.addColorStop(0.3, '#f1f5f9');
    plateGrad.addColorStop(0.7, '#e2e8f0');
    plateGrad.addColorStop(1, '#cbd5e1');

    ctx.fillStyle = plateGrad;
    ctx.beginPath();
    ctx.roundRect(-plateW / 2, -plateH / 2, plateW, plateH, plateRad);
    ctx.fill();

    ctx.strokeStyle = isSel ? '#38bdf8' : '#94a3b8';
    ctx.lineWidth = isSel ? 2.5 * zoom : 1.2 * zoom;
    ctx.stroke();

    const recessW = plateW * 0.74;
    const recessH = plateH * 0.74;
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(-recessW / 2, -recessH / 2, recessW, recessH, 3 * zoom);
    ctx.fill();

    if (code === 'SW_DOUBLE') {
      const keyW = (recessW - 4 * zoom) / 2;
      const keyH = recessH - 3 * zoom;
      const states = [Boolean(st.closed1 ?? st.closed), Boolean(st.closed2)];

      [-1, 1].forEach((dir, idx) => {
        const kx = dir * (keyW / 2 + 1.5 * zoom);
        const kOn = states[idx];
        const tiltGrad = ctx.createLinearGradient(0, -keyH / 2, 0, keyH / 2);

        if (kOn) {
          tiltGrad.addColorStop(0, '#0f172a');
          tiltGrad.addColorStop(0.5, '#1e293b');
          tiltGrad.addColorStop(1, '#475569');
        } else {
          tiltGrad.addColorStop(0, '#475569');
          tiltGrad.addColorStop(0.5, '#1e293b');
          tiltGrad.addColorStop(1, '#0f172a');
        }

        ctx.fillStyle = tiltGrad;
        ctx.beginPath();
        ctx.roundRect(kx - keyW / 2, -keyH / 2, keyW, keyH, 2 * zoom);
        ctx.fill();

        ctx.fillStyle = kOn ? '#22c55e' : '#475569';
        ctx.beginPath();
        ctx.arc(kx, kOn ? keyH * 0.35 : -keyH * 0.35, 2 * zoom, 0, Math.PI * 2);
        ctx.fill();
      });

    } else {
      const isPosActive = code === 'THREE_WAY'
        ? (Number(st.position ?? (st.closed ? 1 : 0)) === 1)
        : code === 'FOUR_WAY'
        ? Boolean(st.crossed ?? st.closed)
        : Boolean(st.closed || st.rockerAngle === 1);

      const keyW = recessW - 3 * zoom;
      const keyH = recessH - 3 * zoom;

      const tiltGrad = ctx.createLinearGradient(0, -keyH / 2, 0, keyH / 2);
      if (isPosActive) {
        tiltGrad.addColorStop(0, '#0f172a');
        tiltGrad.addColorStop(0.48, '#1e293b');
        tiltGrad.addColorStop(0.52, '#334155');
        tiltGrad.addColorStop(1, '#64748b');
      } else {
        tiltGrad.addColorStop(0, '#64748b');
        tiltGrad.addColorStop(0.48, '#334155');
        tiltGrad.addColorStop(0.52, '#1e293b');
        tiltGrad.addColorStop(1, '#0f172a');
      }

      ctx.fillStyle = tiltGrad;
      ctx.beginPath();
      ctx.roundRect(-keyW / 2, -keyH / 2, keyW, keyH, 2.5 * zoom);
      ctx.fill();

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
      ctx.lineWidth = 1 * zoom;
      ctx.beginPath();
      ctx.moveTo(-keyW / 2 + 3 * zoom, 0);
      ctx.lineTo(keyW / 2 - 3 * zoom, 0);
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      if (code === 'FOUR_WAY') {
        ctx.fillStyle = isPosActive ? '#38bdf8' : '#eab308';
        ctx.font = `bold ${Math.max(10, 13 * zoom)}px monospace`;
        ctx.fillText(isPosActive ? '✕' : '═', 0, 0);

        ctx.fillStyle = '#cbd5e1';
        ctx.font = `bold ${Math.max(5.5, 6.5 * zoom)}px sans-serif`;
        ctx.fillText(isPosActive ? 'CRUZADO' : 'DIRETO', 0, isPosActive ? -keyH * 0.28 : keyH * 0.28);

      } else if (code === 'THREE_WAY') {
        ctx.fillStyle = isPosActive ? '#38bdf8' : '#94a3b8';
        ctx.font = `bold ${Math.max(7.5, 9 * zoom)}px sans-serif`;
        ctx.fillText('▼ R2', 0, keyH * 0.25);

        ctx.fillStyle = !isPosActive ? '#38bdf8' : '#94a3b8';
        ctx.fillText('▲ R1', 0, -keyH * 0.25);

      } else if (code === 'SW2') {
        ctx.fillStyle = isPosActive ? '#22c55e' : '#64748b';
        ctx.font = `bold ${Math.max(8, 10 * zoom)}px monospace`;
        ctx.fillText(isPosActive ? '2P • I' : '2P • O', 0, isPosActive ? keyH * 0.25 : -keyH * 0.25);

      } else {
        ctx.fillStyle = isPosActive ? '#22c55e' : '#64748b';
        ctx.font = `bold ${Math.max(8, 10 * zoom)}px monospace`;
        ctx.fillText(isPosActive ? 'I' : 'O', 0, isPosActive ? keyH * 0.25 : -keyH * 0.25);
      }

      const dotY = isPosActive ? keyH * 0.36 : -keyH * 0.36;
      ctx.fillStyle = isPosActive ? '#22c55e' : '#475569';
      ctx.beginPath();
      ctx.arc(0, dotY, 2.4 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }

  // --------------------------------------------------------------------------
  // 2. DIMMER ROTATIVO COM KNOB ESCALONADO E DISPLAY DE NÍVEL
  // --------------------------------------------------------------------------
  } else if (code === 'DIMMER') {
    const percent = Math.max(0, Math.min(100, Number(st.percent ?? 100)));
    const knobR = Math.min(cw, ch) * 0.32;
    const startAng = -135 * (Math.PI / 180);
    const totalAng = 270 * (Math.PI / 180);
    const currAng = startAng + (percent / 100) * totalAng;

    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(-cw / 2, -ch / 2, cw, ch, 6 * zoom);
    ctx.fill();
    ctx.strokeStyle = isSel ? '#38bdf8' : '#334155';
    ctx.lineWidth = isSel ? 2 * zoom : 1 * zoom;
    ctx.stroke();

    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 4 * zoom;
    ctx.beginPath();
    ctx.arc(0, 0, knobR + 7 * zoom, startAng, startAng + totalAng);
    ctx.stroke();

    ctx.strokeStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(0, 0, knobR + 7 * zoom, startAng, currAng);
    ctx.stroke();

    drawMetallicTexture(ctx, 0, 0, knobR, currAng);

    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 2.5 * zoom;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(currAng) * (knobR * 0.8), Math.sin(currAng) * (knobR * 0.8));
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.font = `bold ${Math.max(7, 8.5 * zoom)}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText(`${percent}%`, 0, ch / 2 - 6 * zoom);

  // --------------------------------------------------------------------------
  // 3. CHAVE SELETORA ROTATIVA (MAN - O - AUTO)
  // --------------------------------------------------------------------------
  } else if (code === 'SEL') {
    const pos = Number(st.position ?? 0);
    const ang = pos === -1 ? -0.7 : pos === 1 ? 0.7 : 0;

    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(-cw / 2, -ch / 2, cw, ch, 6 * zoom);
    ctx.fill();
    ctx.strokeStyle = isSel ? '#38bdf8' : '#334155';
    ctx.lineWidth = isSel ? 2 * zoom : 1 * zoom;
    ctx.stroke();

    const fR = Math.min(cw, ch) * 0.36;
    drawMetallicTexture(ctx, 0, 0, fR, 0);

    ctx.fillStyle = '#f1f5f9';
    ctx.font = `bold ${Math.max(6, 7.5 * zoom)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('MAN', -fR * 0.75, -fR * 0.65);
    ctx.fillText('0', 0, -fR * 0.85);
    ctx.fillText('AUTO', fR * 0.75, -fR * 0.65);

    ctx.save();
    ctx.rotate(ang);
    const kGrad = ctx.createLinearGradient(-6 * zoom, -fR * 0.6, 6 * zoom, fR * 0.6);
    kGrad.addColorStop(0, '#475569');
    kGrad.addColorStop(0.5, '#0f172a');
    kGrad.addColorStop(1, '#020617');

    ctx.fillStyle = kGrad;
    ctx.beginPath();
    ctx.roundRect(-5 * zoom, -fR * 0.75, 10 * zoom, fR * 1.5, 3 * zoom);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-2 * zoom, -fR * 0.7, 4 * zoom, 7 * zoom);
    ctx.restore();

  // --------------------------------------------------------------------------
  // 4. BOTOEIRA DE EMERGÊNCIA (ISO 13850 - COGUMELO 40mm COM TRAVA)
  // --------------------------------------------------------------------------
  } else if (code === 'ESTOP') {
    const isActuated = Boolean(st.pressed || st.tripped || !st.closed);
    const rOuter = Math.min(cw, ch) * 0.44;

    ctx.fillStyle = '#facc15';
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.arc(0, 0, rOuter, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#0f172a';
    ctx.font = `bold ${Math.max(5.5, 6.5 * zoom)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('EMERGENCY STOP', 0, -rOuter + 8 * zoom);

    const mushR = rOuter * 0.65;
    const travel = isActuated ? 3.5 * zoom : 0;

    const mushGrad = ctx.createRadialGradient(-3 * zoom, -3 * zoom + travel, mushR * 0.15, 0, travel, mushR);
    mushGrad.addColorStop(0, '#f87171');
    mushGrad.addColorStop(0.4, '#dc2626');
    mushGrad.addColorStop(0.8, '#991b1b');
    mushGrad.addColorStop(1, '#450a0a');

    ctx.fillStyle = mushGrad;
    ctx.beginPath();
    ctx.arc(0, travel, mushR, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = isActuated ? '#ef4444' : '#ffffff';
    ctx.lineWidth = 1.2 * zoom;
    ctx.stroke();

    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 1.4 * zoom;
    ctx.beginPath();
    ctx.arc(0, travel, mushR * 0.45, 0.4, Math.PI * 1.6);
    ctx.stroke();

    ctx.fillStyle = '#fef08a';
    ctx.font = `bold ${Math.max(5, 6 * zoom)}px sans-serif`;
    ctx.fillText('RESET ↻', 0, travel + 2 * zoom);

  // --------------------------------------------------------------------------
  // 5. FIM DE CURSO BLINDADO (LIMIT SWITCH COM ROLETE ARTICULADO)
  // --------------------------------------------------------------------------
  } else if (code === 'LIMIT') {
    const isHit = Boolean(st.actuated || st.pressed);

    const bodyW = cw * 0.72;
    const bodyH = ch * 0.55;
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.roundRect(-bodyW / 2, -bodyH * 0.2, bodyW, bodyH, 4 * zoom);
    ctx.fill();
    ctx.strokeStyle = isSel ? '#38bdf8' : '#1e293b';
    ctx.lineWidth = 1.5 * zoom;
    ctx.stroke();

    drawIndustrialScrew(ctx, -bodyW * 0.35, 0, 2.5 * zoom);
    drawIndustrialScrew(ctx, bodyW * 0.35, 0, 2.5 * zoom);

    const armAng = isHit ? 0.35 : -0.2;
    ctx.save();
    ctx.translate(0, -bodyH * 0.2);
    ctx.rotate(armAng);

    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(-2.5 * zoom, -20 * zoom, 5 * zoom, 20 * zoom);

    drawMetallicTexture(ctx, 0, -22 * zoom, 7 * zoom, armAng);
    ctx.restore();

  // --------------------------------------------------------------------------
  // 6. BÓIA DE NÍVEL ESTANQUE IP68 (CÁPSULA COM CABO E ESFERA)
  // --------------------------------------------------------------------------
  } else if (code === 'FLOAT') {
    const isTilted = Boolean(st.closed || st.high);
    const tilt = isTilted ? 0.45 : -0.45;

    ctx.save();
    ctx.rotate(tilt);

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-3 * zoom, -ch * 0.45, 6 * zoom, 12 * zoom);

    const fGrad = ctx.createLinearGradient(-15 * zoom, 0, 15 * zoom, 0);
    fGrad.addColorStop(0, '#ea580c');
    fGrad.addColorStop(0.5, '#f97316');
    fGrad.addColorStop(1, '#c2410c');

    ctx.fillStyle = fGrad;
    ctx.beginPath();
    ctx.ellipse(0, 0, 14 * zoom, 22 * zoom, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#7c2d12';
    ctx.lineWidth = 1.2 * zoom;
    ctx.stroke();

    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.arc(0, isTilted ? 10 * zoom : -10 * zoom, 5 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

  // --------------------------------------------------------------------------
  // 7. BOTOEIRAS PULSADORAS NA/NF (22mm METÁLICAS)
  // --------------------------------------------------------------------------
  } else if (code === 'PBNO' || code === 'PBNC') {
    const isNO = code === 'PBNO';
    const isPressed = Boolean(st.pressed);
    const rOuter = Math.min(cw, ch) * 0.38;

    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(-cw / 2, -ch / 2, cw, ch, 6 * zoom);
    ctx.fill();

    drawMetallicTexture(ctx, 0, 0, rOuter, 2.35);

    const travel = isPressed ? 2.5 * zoom : 0;
    const rBtn = (rOuter - 4 * zoom) - (isPressed ? 1 * zoom : 0);

    const btnGrad = ctx.createRadialGradient(-rBtn * 0.35, -rBtn * 0.35 + travel, rBtn * 0.1, 0, travel, rBtn);
    if (isNO) {
      btnGrad.addColorStop(0, '#86efac');
      btnGrad.addColorStop(0.4, '#22c55e');
      btnGrad.addColorStop(0.8, '#15803d');
      btnGrad.addColorStop(1, '#052e16');
    } else {
      btnGrad.addColorStop(0, '#fca5a5');
      btnGrad.addColorStop(0.4, '#ef4444');
      btnGrad.addColorStop(0.8, '#991b1b');
      btnGrad.addColorStop(1, '#450a0a');
    }

    ctx.fillStyle = btnGrad;
    ctx.beginPath();
    ctx.arc(0, travel, rBtn, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.max(9, 11 * zoom)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(isNO ? 'I' : 'O', 0, travel);

  // --------------------------------------------------------------------------
  // 8. EQUIPAMENTOS DIN (DISJUNTORES, CONTACTORES, RELÉS, FUSÍVEIS)
  // --------------------------------------------------------------------------
  } else if (
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
    ctx.strokeStyle = isSel ? '#38bdf8' : isTripped ? '#ef4444' : isEnergized ? '#10b981' : '#475569';
    ctx.lineWidth = isSel ? 2.5 * zoom : 1.2 * zoom;

    const rCorner = 4 * zoom;
    ctx.beginPath();
    ctx.roundRect(-cw / 2, -ch / 2, cw, ch, rCorner);
    ctx.fill();
    ctx.stroke();

    ctx.shadowColor = 'transparent';
    const specGrad = ctx.createLinearGradient(-cw / 2, -ch / 2, -cw / 2, -ch / 2 + 12 * zoom);
    specGrad.addColorStop(0, 'rgba(255, 255, 255, 0.25)');
    specGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = specGrad;
    ctx.beginPath();
    ctx.roundRect(-cw / 2 + 1, -ch / 2 + 1, cw - 2, 10 * zoom, [rCorner, rCorner, 0, 0]);
    ctx.fill();

    const nTerminals = kind === 'breaker3' || kind === 'contactor' ? 3 : 2;
    for (let i = 0; i < nTerminals; i++) {
      const step = (cw * 0.68) / (nTerminals - 1 || 1);
      const sx = -cw * 0.34 + i * step;

      ctx.fillStyle = '#090d16';
      ctx.beginPath();
      ctx.arc(sx, -ch / 2 + 9 * zoom, 5 * zoom, 0, Math.PI * 2);
      ctx.arc(sx, ch / 2 - 9 * zoom, 5 * zoom, 0, Math.PI * 2);
      ctx.fill();

      drawIndustrialScrew(ctx, sx, -ch / 2 + 9 * zoom, 3.8 * zoom, 0.4);
      drawIndustrialScrew(ctx, sx, ch / 2 - 9 * zoom, 3.8 * zoom, 1.2);
    }

    if (kind === 'breaker' || kind === 'breaker3' || kind === 'overload' || kind === 'rcd' || kind === 'rcbo') {
      const isClosed = Boolean(st.closed && !isTripped);
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

      ctx.fillStyle = '#ffffff';
      ctx.font = `black ${Math.max(6, 7 * zoom)}px monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(isTripped ? 'TRIP' : isClosed ? 'I-ON' : 'O-OFF', 0, flagY + flagH * 0.8);

      const levW = Math.min(cw * 0.4, 22 * zoom);
      const levH = 24 * zoom;
      const levY = isClosed ? -10 * zoom : 2 * zoom;

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
    }

    if (kind === 'contactor' || kind === 'relay') {
      const coilOn = Boolean(st.energized);
      const pW = cw * 0.62;
      const pH = ch * 0.25;
      const pY = -pH / 2;

      ctx.fillStyle = '#020617';
      ctx.fillRect(-pW / 2 - 1.5, pY - 1.5, pW + 3, pH + 3);

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
      ctx.roundRect(-pW / 2 + plungeOffset * 0.5, pY + plungeOffset, pW - plungeOffset, pH, 3 * zoom);
      ctx.fill();
      ctx.strokeStyle = coilOn ? '#6ee7b7' : '#64748b';
      ctx.lineWidth = 1 * zoom;
      ctx.stroke();
    }

    ctx.fillStyle = '#94a3b8';
    ctx.font = `bold ${Math.max(7, 8 * zoom)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(code, 0, ch / 2 - 18 * zoom);

  // --------------------------------------------------------------------------
  // 9. MOTORES TRIFÁSICOS / MONOFÁSICOS
  // --------------------------------------------------------------------------
  } else if (kind === 'motor3' || kind === 'motor1' || kind === 'fan') {
    const isRunning = Boolean(st.running);
    const rpm = isRunning ? st.rpm || 1450 : 0;
    const r = Math.min(cw, ch) * 0.42;

    const motorGrad = ctx.createRadialGradient(0, 0, r * 0.2, 0, 0, r);
    motorGrad.addColorStop(0, '#38bdf8');
    motorGrad.addColorStop(0.7, '#0284c7');
    motorGrad.addColorStop(1, '#0369a1');

    ctx.fillStyle = motorGrad;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = isSel ? '#38bdf8' : isRunning ? '#10b981' : '#075985';
    ctx.lineWidth = 2 * zoom;
    ctx.stroke();

    for (let i = 0; i < 12; i++) {
      const ang = (i * Math.PI) / 6;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 1.2 * zoom;
      ctx.beginPath();
      ctx.moveTo(Math.cos(ang) * (r * 0.5), Math.sin(ang) * (r * 0.5));
      ctx.lineTo(Math.cos(ang) * (r * 0.95), Math.sin(ang) * (r * 0.95));
      ctx.stroke();
    }

    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.35, 0, Math.PI * 2);
    ctx.fill();

    const rotAng = isRunning ? (time * 0.01 * (rpm / 100)) % (Math.PI * 2) : 0;
    ctx.save();
    ctx.rotate(rotAng);
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(r * 0.08, -2 * zoom, r * 0.1, 4 * zoom);
    ctx.restore();

  // --------------------------------------------------------------------------
  // 10. LÂMPADAS E SINALIZADORES PILOTO
  // --------------------------------------------------------------------------
  } else if (kind === 'lamp' || kind.startsWith('pilot')) {
    const isOn = Boolean(st.on || isEnergized);
    const r = Math.min(cw, ch) * 0.36;
    const isGreen = code.includes('GREEN') || st.color === 'green';
    const isRed = code.includes('RED') || st.color === 'red';
    const isYellow = code.includes('YELLOW') || st.color === 'yellow';

    drawMetallicTexture(ctx, 0, 0, r * 1.15, 0.4);

    const lensGrad = ctx.createRadialGradient(-r * 0.25, -r * 0.25, 1, 0, 0, r);
    if (isOn) {
      if (isGreen) {
        lensGrad.addColorStop(0, '#86efac');
        lensGrad.addColorStop(0.5, '#22c55e');
        lensGrad.addColorStop(1, '#15803d');
      } else if (isRed) {
        lensGrad.addColorStop(0, '#fca5a5');
        lensGrad.addColorStop(0.5, '#ef4444');
        lensGrad.addColorStop(1, '#991b1b');
      } else if (isYellow) {
        lensGrad.addColorStop(0, '#fef08a');
        lensGrad.addColorStop(0.5, '#eab308');
        lensGrad.addColorStop(1, '#a16207');
      } else {
        lensGrad.addColorStop(0, '#ffffff');
        lensGrad.addColorStop(0.6, '#fef08a');
        lensGrad.addColorStop(1, '#eab308');
      }
    } else {
      lensGrad.addColorStop(0, '#475569');
      lensGrad.addColorStop(1, '#1e293b');
    }

    ctx.fillStyle = lensGrad;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = isOn ? '#ffffff' : '#334155';
    ctx.lineWidth = 1.5 * zoom;
    ctx.stroke();

  // --------------------------------------------------------------------------
  // 11. DEMAIS DISPOSITIVOS (FALLBACK NORMATIVO)
  // --------------------------------------------------------------------------
  } else {
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(-cw / 2, -ch / 2, cw, ch, 6 * zoom);
    ctx.fill();
    ctx.strokeStyle = isSel ? '#38bdf8' : isEnergized ? '#10b981' : '#475569';
    ctx.lineWidth = 1.5 * zoom;
    ctx.stroke();

    drawNormativeSymbol(ctx, code, kind, cw, ch, zoom, st);
  }

  ctx.restore();
}