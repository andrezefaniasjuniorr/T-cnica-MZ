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
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.beginPath();
  ctx.arc(x + 0.5, y + 0.8, radius + 0.5, 0, Math.PI * 2);
  ctx.fill();

  drawMetallicTexture(ctx, x, y, radius, rotation);

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
    // ------------------------------------------------------------------------
    // FONTES DE ALIMENTAÇÃO E BATERIAS (IEC 60617-2)
    // ------------------------------------------------------------------------
    case 'BAT':
    case 'BAT_LIFEPO4': {
      const gap = 5 * zoom;
      ctx.beginPath();
      // Placa Positiva 1
      ctx.moveTo(-gap * 1.5, -s * 0.7);
      ctx.lineTo(-gap * 1.5, s * 0.7);
      // Placa Negativa 1
      ctx.moveTo(-gap * 0.5, -s * 0.35);
      ctx.lineTo(-gap * 0.5, s * 0.35);
      // Placa Positiva 2
      ctx.moveTo(gap * 0.5, -s * 0.7);
      ctx.lineTo(gap * 0.5, s * 0.7);
      // Placa Negativa 2
      ctx.moveTo(gap * 1.5, -s * 0.35);
      ctx.lineTo(gap * 1.5, s * 0.35);
      ctx.stroke();

      ctx.font = `bold ${Math.max(9, 10 * zoom)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('+', -gap * 2.5, -s * 0.4);
      ctx.fillText('−', gap * 2.5, -s * 0.4);

      if (code === 'BAT_LIFEPO4') {
        ctx.font = `bold ${Math.max(6.5, 7.5 * zoom)}px sans-serif`;
        ctx.fillText('LiFePO4', 0, s * 0.85);
      }
      break;
    }

    case 'SRC_AC1':
    case 'SRC_AC3': {
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.75, 0, Math.PI * 2);
      ctx.stroke();

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

    case 'GND':
    case 'EARTH_ROD':
    case 'EARTH_PIT': {
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

    // ------------------------------------------------------------------------
    // ENERGIA SOLAR & ARMAZENAMENTO (IEC 60617-11 / IEC 60617-6)
    // ------------------------------------------------------------------------
    case 'PV_PANEL': {
      const pW = s * 1.3;
      const pH = s * 0.9;
      ctx.beginPath();
      ctx.rect(-pW / 2, -pH / 2, pW, pH);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(-pW / 2, 0);
      ctx.lineTo(pW / 2, 0);
      ctx.stroke();

      // Setas de radiação solar incidente (fótons de luz)
      [-pW * 0.25, pW * 0.25].forEach(ox => {
        ctx.beginPath();
        ctx.moveTo(ox - 8 * zoom, -pH * 0.75);
        ctx.lineTo(ox, -pH * 0.35);
        ctx.moveTo(ox, -pH * 0.35);
        ctx.lineTo(ox - 4 * zoom, -pH * 0.45);
        ctx.moveTo(ox, -pH * 0.35);
        ctx.lineTo(ox - 1 * zoom, -pH * 0.55);
        ctx.stroke();
      });

      ctx.font = `bold ${Math.max(7, 8 * zoom)}px monospace`;
      ctx.textAlign = 'center';
      ctx.fillText('PV', 0, pH * 0.35);
      break;
    }

    case 'PV_INVERTER_ONGRID':
    case 'PV_INVERTER_OFFGRID':
    case 'PV_INVERTER_HYBRID': {
      const iW = s * 1.4;
      const iH = s * 0.9;
      ctx.beginPath();
      ctx.rect(-iW / 2, -iH / 2, iW, iH);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(-iW / 2, iH / 2);
      ctx.lineTo(iW / 2, -iH / 2);
      ctx.stroke();

      ctx.font = `bold ${Math.max(9, 11 * zoom)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('=', -iW * 0.25, iH * 0.22);
      ctx.fillText('~', iW * 0.25, -iH * 0.22);
      break;
    }

    case 'SMART_METER': {
      ctx.beginPath();
      ctx.rect(-s * 0.65, -s * 0.5, s * 1.3, s * 1.0);
      ctx.stroke();

      ctx.font = `bold ${Math.max(7, 8 * zoom)}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('kWh', 0, -s * 0.15);
      ctx.fillText('⇄', 0, s * 0.25);
      break;
    }

    // ------------------------------------------------------------------------
    // GERAÇÃO E TRANSFERÊNCIA (GMG, ATS, MTS)
    // ------------------------------------------------------------------------
    case 'GEN_DIESEL': {
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.75, 0, Math.PI * 2);
      ctx.stroke();

      ctx.font = `bold ${Math.max(10, 12 * zoom)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('G', 0, -s * 0.15);

      ctx.font = `bold ${Math.max(7, 8.5 * zoom)}px sans-serif`;
      ctx.fillText('3 ~ D', 0, s * 0.35);
      break;
    }

    case 'MTS_SWITCH': {
      const pos = Number(st.position ?? 1);
      ctx.beginPath();
      ctx.arc(0, s * 0.6, 2.5 * zoom, 0, Math.PI * 2);
      ctx.arc(-s * 0.5, -s * 0.5, 2.5 * zoom, 0, Math.PI * 2);
      ctx.arc(s * 0.5, -s * 0.5, 2.5 * zoom, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(0, s * 0.5);
      if (pos === 0) {
        ctx.lineTo(0, -s * 0.1);
      } else if (pos === 2) {
        ctx.lineTo(s * 0.45, -s * 0.45);
      } else {
        ctx.lineTo(-s * 0.45, -s * 0.45);
      }
      ctx.stroke();

      ctx.font = `bold ${Math.max(6, 7 * zoom)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('I', -s * 0.55, -s * 0.65);
      ctx.fillText('0', 0, -s * 0.25);
      ctx.fillText('II', s * 0.55, -s * 0.65);
      break;
    }

    case 'ATS_SWITCH': {
      ctx.beginPath();
      ctx.rect(-s * 0.75, -s * 0.5, s * 1.5, s * 1.0);
      ctx.stroke();
      ctx.font = `bold ${Math.max(8, 9.5 * zoom)}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('ATS', 0, -s * 0.12);
      ctx.fillText('⇄', 0, s * 0.25);
      break;
    }

    // ------------------------------------------------------------------------
    // DISPOSITIVOS DE PROTEÇÃO (MCB, MPCB, RCD, FUSE, SPD)
    // ------------------------------------------------------------------------
    case 'MCB_1P':
    case 'MCB1':
    case 'MCB2':
    case 'MCB3':
    case 'MCCB':
    case 'MPCB': {
      const isClosed = Boolean(st.closed);
      ctx.beginPath();
      ctx.arc(0, s * 0.5, 2.5 * zoom, 0, Math.PI * 2);
      ctx.arc(0, -s * 0.5, 2.5 * zoom, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(0, s * 0.45);
      ctx.lineTo(isClosed ? 0 : s * 0.35, -s * 0.45);
      ctx.stroke();

      ctx.beginPath();
      ctx.rect(isClosed ? -s * 0.12 : s * 0.1, -s * 0.15, s * 0.24, s * 0.3);
      ctx.stroke();
      break;
    }

    case 'FUSE':
    case 'FU3': {
      ctx.beginPath();
      ctx.rect(-s * 0.25, -s * 0.6, s * 0.5, s * 1.2);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, -s * 0.8);
      ctx.lineTo(0, s * 0.8);
      ctx.stroke();
      break;
    }

    case 'SPD':
    case 'SPD3': {
      const vW = s * 0.7;
      const vH = s * 0.4;
      ctx.beginPath();
      ctx.rect(-vW / 2, -vH / 2, vW, vH);
      ctx.moveTo(-vW * 0.7, vH * 0.7);
      ctx.lineTo(vW * 0.7, -vH * 0.7);
      ctx.lineTo(vW * 0.7 + 3 * zoom, -vH * 0.7);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, vH / 2);
      ctx.lineTo(0, s * 0.7);
      ctx.moveTo(-s * 0.3, s * 0.7);
      ctx.lineTo(s * 0.3, s * 0.7);
      ctx.stroke();
      break;
    }

    case 'RCD':
    case 'RCD4':
    case 'RCBO': {
      const isClosed = Boolean(st.closed);
      ctx.beginPath();
      ctx.arc(0, s * 0.5, 2.5 * zoom, 0, Math.PI * 2);
      ctx.arc(0, -s * 0.5, 2.5 * zoom, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(0, s * 0.45);
      ctx.lineTo(isClosed ? 0 : s * 0.35, -s * 0.45);
      ctx.stroke();

      ctx.beginPath();
      ctx.ellipse(0, 0, s * 0.3, s * 0.2, 0, 0, Math.PI * 2);
      ctx.stroke();

      ctx.font = `bold ${Math.max(6, 7 * zoom)}px monospace`;
      ctx.textAlign = 'center';
      ctx.fillText('IΔn', 0, s * 0.32);
      break;
    }

    // ------------------------------------------------------------------------
    // MOTORES E ELETROBOMBAS (IEC 60617-6)
    // ------------------------------------------------------------------------
    case 'PUMP': {
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.75, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, -s * 0.5);
      ctx.lineTo(s * 0.45, s * 0.35);
      ctx.lineTo(-s * 0.45, s * 0.35);
      ctx.closePath();
      ctx.stroke();

      ctx.font = `bold ${Math.max(8, 10 * zoom)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('P', 0, 0);
      break;
    }

    case 'M1PH':
    case 'M3PH':
    case 'M3PH_6L': {
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.8, 0, Math.PI * 2);
      ctx.stroke();

      ctx.font = `bold ${Math.max(11, 13 * zoom)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('M', 0, -s * 0.15);

      ctx.font = `${Math.max(8, 9 * zoom)}px sans-serif`;
      ctx.fillText(code === 'M1PH' ? '1 ~' : '3 ~', 0, s * 0.35);
      break;
    }

    // ------------------------------------------------------------------------
    // INTERRUPTORES E COMUTADORES (IEC 60617-7)
    // ------------------------------------------------------------------------
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

    default: {
      ctx.beginPath();
      ctx.rect(-s * 0.7, -s * 0.4, s * 1.4, s * 0.8);
      ctx.stroke();
      ctx.font = `bold ${Math.max(6.5, 7.5 * zoom)}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(code, 0, 0);
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

  ctx.shadowColor = 'rgba(2, 6, 23, 0.65)';
  ctx.shadowBlur = 14 * zoom;
  ctx.shadowOffsetX = 4 * zoom;
  ctx.shadowOffsetY = 8 * zoom;

  // 1. Módulo Fotovoltaico
  if (code === 'PV_PANEL' || kind === 'pv_panel') {
    ctx.fillStyle = '#0f2942';
    ctx.beginPath();
    ctx.roundRect(-cw / 2, -ch / 2, cw, ch, 4 * zoom);
    ctx.fill();
    ctx.strokeStyle = isSel ? '#38bdf8' : '#64748b';
    ctx.lineWidth = 2 * zoom;
    ctx.stroke();

    ctx.fillStyle = '#fde047';
    ctx.font = `bold ${Math.max(7, 8.5 * zoom)}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('550Wp • HALF-CELL MBB', 0, 0);
    ctx.restore();
    return;
  }

  // 2. Inversores Solares
  if (code.startsWith('PV_INVERTER') || kind.startsWith('pv_inverter')) {
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.roundRect(-cw / 2, -ch / 2, cw, ch, 6 * zoom);
    ctx.fill();
    ctx.strokeStyle = isEnergized ? '#10b981' : '#64748b';
    ctx.lineWidth = 1.6 * zoom;
    ctx.stroke();

    ctx.fillStyle = '#020617';
    ctx.fillRect(-cw * 0.38, -ch * 0.22, cw * 0.76, 26 * zoom);
    ctx.fillStyle = isEnergized ? '#34d399' : '#f59e0b';
    ctx.font = `bold ${Math.max(7, 8.5 * zoom)}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(isEnergized ? 'INJETANDO NA REDE' : 'INVERSOR STANDBY', 0, -ch * 0.22 + 13 * zoom);
    ctx.restore();
    return;
  }

  // 3. Bateria LiFePO4
  if (code === 'BAT_LIFEPO4' || kind === 'battery') {
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(-cw / 2, -ch / 2, cw, ch, 4 * zoom);
    ctx.fill();
    ctx.strokeStyle = '#334155';
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.font = `bold ${Math.max(8, 9.5 * zoom)}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('LiFePO4 5.12kWh 48V', 0, 0);
    ctx.restore();
    return;
  }

  // 4. Eletrobomba em Voluta
  if (code === 'PUMP' || kind === 'pump') {
    ctx.fillStyle = isEnergized ? '#047857' : '#0284c7';
    ctx.beginPath();
    ctx.arc(-cw * 0.2, 0, ch * 0.38, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(0, -ch * 0.25, cw * 0.42, ch * 0.5);
    ctx.strokeStyle = isEnergized ? '#10b981' : '#38bdf8';
    ctx.lineWidth = 2 * zoom;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.max(6, 7 * zoom)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('BOMBA 3.0kW', 0, ch / 2 - 8 * zoom);
    ctx.restore();
    return;
  }

  // 5. Grupo Gerador Diesel
  if (code === 'GEN_DIESEL' || kind === 'generator_diesel') {
    ctx.fillStyle = '#eab308';
    ctx.beginPath();
    ctx.roundRect(-cw / 2, -ch / 2, cw, ch, 6 * zoom);
    ctx.fill();
    ctx.strokeStyle = isEnergized ? '#10b981' : '#ca8a04';
    ctx.lineWidth = 2 * zoom;
    ctx.stroke();

    ctx.fillStyle = '#020617';
    ctx.fillRect(-cw * 0.35, -ch * 0.22, cw * 0.7, ch * 0.44);
    ctx.fillStyle = isEnergized ? '#34d399' : '#ef4444';
    ctx.font = `bold ${Math.max(7, 8.5 * zoom)}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(isEnergized ? '400V 1500RPM' : 'GMG OFF', 0, 0);
    ctx.restore();
    return;
  }

  // 6. Chave Comutadora Manual MTS
  if (code === 'MTS_SWITCH' || kind === 'mts_switch') {
    const pos = Number(st.position ?? 1);
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(-cw / 2, -ch / 2, cw, ch, 6 * zoom);
    ctx.fill();
    ctx.strokeStyle = isSel ? '#38bdf8' : '#475569';
    ctx.lineWidth = 1.4 * zoom;
    ctx.stroke();

    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(0, 0, Math.min(cw, ch) * 0.32, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.max(7, 8.5 * zoom)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(pos === 1 ? 'I (REDE)' : pos === 2 ? 'II (GMG)' : '0 (OFF)', 0, 0);
    ctx.restore();
    return;
  }

  // 7. DPS Modular
  if (code === 'SPD' || code === 'SPD3' || kind === 'spd' || kind === 'spd3') {
    const isOk = st.status !== 'red' && !isTripped;
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(-cw / 2, -ch / 2, cw, ch, 4 * zoom);
    ctx.fill();
    ctx.strokeStyle = '#475569';
    ctx.stroke();

    ctx.fillStyle = isOk ? '#16a34a' : '#dc2626';
    ctx.fillRect(-cw * 0.25, -ch * 0.2, cw * 0.5, 8 * zoom);
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.max(6, 7 * zoom)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('DPS T2', 0, ch * 0.25);
    ctx.restore();
    return;
  }

  // 8. Interruptores Residenciais (SW, SW2, SW_DOUBLE, 3-WAY, 4-WAY)
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

    const isPosActive = Boolean(st.closed);
    const keyW = recessW - 3 * zoom;
    const keyH = recessH - 3 * zoom;

    ctx.fillStyle = isPosActive ? '#1e293b' : '#475569';
    ctx.beginPath();
    ctx.roundRect(-keyW / 2, -keyH / 2, keyW, keyH, 2.5 * zoom);
    ctx.fill();

    ctx.fillStyle = isPosActive ? '#22c55e' : '#cbd5e1';
    ctx.font = `bold ${Math.max(8, 10 * zoom)}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(code === 'FOUR_WAY' ? (isPosActive ? '✕' : '═') : isPosActive ? 'I' : 'O', 0, 0);

  // 9. Equipamentos DIN de Proteção
  } else if (
    kind === 'breaker' ||
    kind === 'breaker_1p' ||
    kind === 'breaker2' ||
    kind === 'breaker3' ||
    kind === 'contactor' ||
    kind === 'relay' ||
    kind === 'overload' ||
    kind === 'rcd' ||
    kind === 'rcbo'
  ) {
    const baseGrad = ctx.createLinearGradient(-cw / 2, -ch / 2, cw / 2, ch / 2);
    baseGrad.addColorStop(0, '#334155');
    baseGrad.addColorStop(0.5, '#1e293b');
    baseGrad.addColorStop(1, '#0f172a');

    ctx.fillStyle = baseGrad;
    ctx.strokeStyle = isSel ? '#38bdf8' : isTripped ? '#ef4444' : isEnergized ? '#10b981' : '#475569';
    ctx.lineWidth = isSel ? 2.5 * zoom : 1.2 * zoom;

    ctx.beginPath();
    ctx.roundRect(-cw / 2, -ch / 2, cw, ch, 4 * zoom);
    ctx.fill();
    ctx.stroke();

    const isClosed = Boolean(st.closed && !isTripped);
    ctx.fillStyle = isTripped ? '#f59e0b' : isClosed ? '#dc2626' : '#16a34a';
    ctx.fillRect(-cw * 0.25, -ch * 0.28, cw * 0.5, 5 * zoom);

    ctx.fillStyle = isClosed ? '#991b1b' : '#334155';
    ctx.beginPath();
    ctx.roundRect(-cw * 0.2, isClosed ? -8 * zoom : 4 * zoom, cw * 0.4, 16 * zoom, 2 * zoom);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.max(6.5, 7.5 * zoom)}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(isTripped ? 'TRIP' : isClosed ? 'I' : 'O', 0, isClosed ? 0 : 12 * zoom);

  // 10. Motores Industriais
  } else if (kind === 'motor3' || kind === 'motor1' || code === 'M3PH_6L') {
    const isRunning = Boolean(st.running);
    const r = Math.min(cw, ch) * 0.42;

    ctx.fillStyle = isRunning ? '#047857' : '#0284c7';
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = isRunning ? '#10b981' : '#0369a1';
    ctx.lineWidth = 2 * zoom;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.max(8, 10 * zoom)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(isRunning ? `${Math.round(st.rpm || 2920)} RPM` : 'PARADO', 0, 0);

  // 11. Lâmpadas e Sinalizadores
  } else if (kind === 'lamp' || code.startsWith('PILOT')) {
    const isOn = Boolean(st.energized && !isTripped);
    const r = Math.min(cw, ch) * 0.36;
    ctx.fillStyle = isOn ? '#fde047' : '#334155';
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = isOn ? '#eab308' : '#64748b';
    ctx.stroke();

  // Fallback normativo seguro
  } else {
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(-cw / 2, -ch / 2, cw, ch, 6 * zoom);
    ctx.fill();
    ctx.strokeStyle = isSel ? '#38bdf8' : '#475569';
    ctx.stroke();

    drawNormativeSymbol(ctx, code, kind, cw, ch, zoom, st);
  }

  ctx.restore();
}