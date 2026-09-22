// ============================================================================
// TÉCNICAMZ PRO — SISTEMA DE QUADROS GERAIS, BARRAMENTOS E TRILHOS DIN
// Normas: IEC/EN 60715, IEC 60364-4-41, IEC 60947-7-1 e IEC 61439-1/-2
// Suporte a Quadros Paramétricos, Placas de Montagem, Canaletas Perfuradas,
// Pentes de Ligação Trifásica (L1/L2/L3/N/PE) e Conexão Interativa por Bornes
// ============================================================================

import { BusbarTerminal, Busbar, PanelEnclosureConfig, PanelEnclosureSize, PanelBackplateStyle } from '../../types';

export type { BusbarTerminal, Busbar, PanelEnclosureConfig, PanelEnclosureSize, PanelBackplateStyle };

export const PANEL_PRESETS: Record<PanelEnclosureSize, PanelEnclosureConfig> = {
  compact: {
    enabled: true,
    size: 'compact',
    width: 740,
    height: 520,
    x: 0,
    y: 0,
    backplate: 'galvanized',
    hasDucts: true,
    hasWarningLabels: true,
    nameplateText: 'QDC-01 • QUADRO DE DISTRIBUIÇÃO COMPACTO (24 MÓDULOS)'
  },
  medium: {
    enabled: true,
    size: 'medium',
    width: 940,
    height: 700,
    x: 0,
    y: 0,
    backplate: 'galvanized',
    hasDucts: true,
    hasWarningLabels: true,
    nameplateText: 'QGD-01 • QUADRO GERAL DE DISTRIBUIÇÃO (48 MÓDULOS - IEC 60364)'
  },
  large: {
    enabled: true,
    size: 'large',
    width: 1140,
    height: 860,
    x: 0,
    y: 0,
    backplate: 'orange_industrial',
    hasDucts: true,
    hasWarningLabels: true,
    nameplateText: 'CCM-01 • CENTRO DE CONTROLE DE MOTORES E FORÇA (IP65 / NEMA 4)'
  },
  industrial: {
    enabled: true,
    size: 'industrial',
    width: 1280,
    height: 980,
    x: 0,
    y: 0,
    backplate: 'orange_industrial',
    hasDucts: true,
    hasWarningLabels: true,
    nameplateText: 'PIM-01 • PAINEL INDUSTRIAL AUTOPORTANTE (72+ MÓDULOS - RAL 2004)'
  },
  custom: {
    enabled: true,
    size: 'custom',
    width: 900,
    height: 650,
    x: 0,
    y: 0,
    backplate: 'galvanized',
    hasDucts: true,
    hasWarningLabels: true,
    nameplateText: 'QDF-PERSONALIZADO • DISTRIBUIÇÃO E COMANDOS'
  }
};

/**
 * Cria os parafusos/bornes ao longo de um barramento para engate de fios.
 * Cada borne recebe coordenadas absolutas no Canvas.
 */
export function generateBusbarTerminals(
  busbarId: string,
  type: 'din' | 'phase_l1' | 'phase_l2' | 'phase_l3' | 'neutral' | 'earth',
  centerX: number,
  centerY: number,
  length: number,
  orientation: 'horizontal' | 'vertical',
  spacing = 24
): BusbarTerminal[] {
  // Trilhos DIN servem para fixação mecânica, não possuem bornes de parafuso elétrico
  if (type === 'din') return [];

  const count = Math.max(2, Math.floor(length / spacing));
  const terminals: BusbarTerminal[] = [];
  const startOffset = -((count - 1) * spacing) / 2;

  for (let i = 0; i < count; i++) {
    const offset = startOffset + i * spacing;
    terminals.push({
      id: `${busbarId}_T${i + 1}`,
      busbarId,
      type,
      x: orientation === 'horizontal' ? centerX + offset : centerX,
      y: orientation === 'horizontal' ? centerY : centerY + offset,
      isOccupied: false,
      connectedWireId: null
    });
  }

  return terminals;
}

export function createBusbar(
  id: string,
  type: 'din' | 'phase_l1' | 'phase_l2' | 'phase_l3' | 'neutral' | 'earth',
  x: number,
  y: number,
  length: number,
  orientation: 'horizontal' | 'vertical' = 'horizontal',
  spacing = 24
): Busbar {
  return {
    id,
    type,
    x,
    y,
    length,
    orientation,
    terminals: generateBusbarTerminals(id, type, x, y, length, orientation, spacing)
  };
}

export const DEFAULT_MOTOR_BUSBARS: Busbar[] = [
  createBusbar('DIN_1', 'din', 0, -80, 840, 'horizontal'),
  createBusbar('DIN_2', 'din', 0, 120, 840, 'horizontal'),
  createBusbar('BB_L1', 'phase_l1', 0, -220, 720, 'horizontal', 28),
  createBusbar('BB_L2', 'phase_l2', 0, -180, 720, 'horizontal', 28),
  createBusbar('BB_L3', 'phase_l3', 0, -140, 720, 'horizontal', 28),
  createBusbar('BB_N', 'neutral', 0, 220, 720, 'horizontal', 24),
  createBusbar('BB_PE', 'earth', 0, 260, 720, 'horizontal', 24)
];

export const DEFAULT_QGD_BUSBARS: Busbar[] = [
  createBusbar('DIN_1', 'din', 0, -50, 780, 'horizontal'),
  createBusbar('DIN_2', 'din', 0, 90, 780, 'horizontal'),
  createBusbar('BB_L1', 'phase_l1', 0, -200, 680, 'horizontal', 26),
  createBusbar('BB_L2', 'phase_l2', 0, -165, 680, 'horizontal', 26),
  createBusbar('BB_L3', 'phase_l3', 0, -130, 680, 'horizontal', 26),
  createBusbar('BB_N', 'neutral', 0, 195, 680, 'horizontal', 24),
  createBusbar('BB_PE', 'earth', 0, 235, 680, 'horizontal', 24)
];

export const DEFAULT_FOURWAY_BUSBARS: Busbar[] = [
  createBusbar('DIN_1', 'din', 0, 0, 760, 'horizontal'),
  createBusbar('BB_N', 'neutral', 0, 150, 640, 'horizontal', 24),
  createBusbar('BB_PE', 'earth', 0, 220, 640, 'horizontal', 24)
];

/**
 * Snapping Magnético de Componentes aos Trilhos DIN:
 * Alinha perfeitamente com a linha de centro do trilho DIN (35mm).
 */
export function snapComponentToBusbars(
  comp: any,
  rawNx: number,
  rawNy: number,
  busbars: Busbar[],
  snapTolerance: number
): { nx: number; ny: number; x: number; y: number; snappedBusbarId?: string } {
  if (!busbars || busbars.length === 0) return { nx: rawNx, ny: rawNy, x: rawNx, y: rawNy };

  const compW = comp?.w || 90;
  const compH = comp?.h || 80;

  for (const bb of busbars) {
    if (bb.orientation === 'horizontal') {
      const halfLen = bb.length / 2;
      const isWithinX = rawNx >= bb.x - halfLen - compW * 0.35 && rawNx <= bb.x + halfLen + compW * 0.35;

      if (isWithinX) {
        if (bb.type === 'din') {
          if (Math.abs(rawNy - bb.y) < snapTolerance) {
            return { nx: rawNx, ny: bb.y, x: rawNx, y: bb.y, snappedBusbarId: bb.id };
          }
        } else {
          const targetYTop = bb.y + compH / 2;
          const targetYBottom = bb.y - compH / 2;
          if (Math.abs(rawNy - targetYTop) < snapTolerance) {
            return { nx: rawNx, ny: targetYTop, x: rawNx, y: targetYTop, snappedBusbarId: bb.id };
          }
          if (Math.abs(rawNy - targetYBottom) < snapTolerance) {
            return { nx: rawNx, ny: targetYBottom, x: rawNx, y: targetYBottom, snappedBusbarId: bb.id };
          }
        }
      }
    } else {
      const halfLen = bb.length / 2;
      const isWithinY = rawNy >= bb.y - halfLen - compH * 0.35 && rawNy <= bb.y + halfLen + compH * 0.35;

      if (isWithinY) {
        if (bb.type === 'din') {
          if (Math.abs(rawNx - bb.x) < snapTolerance) {
            return { nx: bb.x, ny: rawNy, x: bb.x, y: rawNy, snappedBusbarId: bb.id };
          }
        } else {
          const targetXRight = bb.x + compW / 2;
          const targetXLeft = bb.x - compW / 2;
          if (Math.abs(rawNx - targetXRight) < snapTolerance) {
            return { nx: targetXRight, ny: rawNy, x: targetXRight, y: rawNy, snappedBusbarId: bb.id };
          }
          if (Math.abs(rawNx - targetXLeft) < snapTolerance) {
            return { nx: targetXLeft, ny: rawNy, x: targetXLeft, y: rawNy, snappedBusbarId: bb.id };
          }
        }
      }
    }
  }

  return { nx: rawNx, ny: rawNy, x: rawNx, y: rawNy };
}

/**
 * Retorna as coordenadas mundiais de um terminal de barramento.
 */
export function getBusbarTerminalWorldPos(
  busbar: Busbar,
  termId: string
): { x: number; y: number; dir: 'top' | 'bottom' | 'left' | 'right'; normId: string } | null {
  if (!busbar || !busbar.terminals) return null;
  const term = busbar.terminals.find(t => t.id === termId);
  if (!term) return null;

  const isHoriz = busbar.orientation === 'horizontal';
  return {
    x: term.x,
    y: term.y,
    dir: isHoriz ? (busbar.y < 0 ? 'bottom' : 'top') : (busbar.x < 0 ? 'right' : 'left'),
    normId: term.id
  };
}

/**
 * Encontra o terminal de barramento mais próximo da coordenada fornecida.
 */
export function findNearestBusbarTerminal(
  busbars: Busbar[],
  worldPos: { x: number; y: number },
  maxDist = 18
): { busbar: Busbar; terminal: BusbarTerminal; distance: number } | null {
  let closest: { busbar: Busbar; terminal: BusbarTerminal; distance: number } | null = null;
  let minDist = maxDist;

  for (const bb of busbars) {
    if (bb.type === 'din' || !bb.terminals) continue;
    for (const term of bb.terminals) {
      const dx = term.x - worldPos.x;
      const dy = term.y - worldPos.y;
      const d = Math.hypot(dx, dy);
      if (d < minDist) {
        minDist = d;
        closest = { busbar: bb, terminal: term, distance: d };
      }
    }
  }

  return closest;
}

/**
 * RENDERIZAÇÃO COMPLETA DO QUADRO GERAL / ARMÁRIO ELÉTRICO INDUSTRIAL
 * - Moldura Externa (Cinza RAL 7035 com acabamento eletrostático chanfrado e friso IP65)
 * - Placa de Montagem (Chapa de Aço Galvanizado ou Laranja Industrial RAL 2004)
 * - Parafusos de Fixação Hexagonais Cromados nos 4 cantos
 * - Canaletas Perfuradas (Finger Ducts cinzas com aletas ranhuradas de saída de cabos)
 * - Sinalizações Normativas de Alta Tensão (IEC 60417-5036) e Plaqueta Técnica de Identificação
 */
export function drawPanelEnclosure(
  ctx: CanvasRenderingContext2D,
  cam: { zoom: number; pan: { x: number; y: number } },
  config: PanelEnclosureConfig
): void {
  if (!config || !config.enabled) return;

  const toScreen = (p: { x: number; y: number }) => ({
    x: p.x * cam.zoom + cam.pan.x,
    y: p.y * cam.zoom + cam.pan.y
  });

  const center = toScreen({ x: config.x || 0, y: config.y || 0 });
  const W = config.width * cam.zoom;
  const H = config.height * cam.zoom;
  const left = center.x - W / 2;
  const top = center.y - H / 2;

  ctx.save();

  // 1. Sombra externa projetada da carcaça do armário na parede da subestação
  ctx.shadowColor = 'rgba(0, 0, 0, 0.75)';
  ctx.shadowBlur = 24 * cam.zoom;
  ctx.shadowOffsetX = 8 * cam.zoom;
  ctx.shadowOffsetY = 12 * cam.zoom;

  // 2. Moldura Externa do Armário Metálico (Cinza Claro RAL 7035)
  const frameBorder = 22 * cam.zoom;
  const frameRadius = 14 * cam.zoom;

  const frameGrad = ctx.createLinearGradient(left, top, left + W, top + H);
  frameGrad.addColorStop(0, '#e2e8f0');
  frameGrad.addColorStop(0.3, '#cbd5e1');
  frameGrad.addColorStop(0.7, '#94a3b8');
  frameGrad.addColorStop(1, '#64748b');

  ctx.fillStyle = frameGrad;
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = Math.max(1.5, 2.5 * cam.zoom);
  ctx.beginPath();
  ctx.roundRect(left, top, W, H, frameRadius);
  ctx.fill();
  ctx.stroke();

  ctx.shadowColor = 'transparent';

  // 3. Friso de Vedação de Borracha Preta Neoprene / EPDM (Grau de Proteção IP65 / NEMA 4)
  const innerLeft = left + frameBorder;
  const innerTop = top + frameBorder;
  const innerW = W - frameBorder * 2;
  const innerH = H - frameBorder * 2;
  const innerRadius = 8 * cam.zoom;

  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = Math.max(2, 3.5 * cam.zoom);
  ctx.beginPath();
  ctx.roundRect(innerLeft - 3 * cam.zoom, innerTop - 3 * cam.zoom, innerW + 6 * cam.zoom, innerH + 6 * cam.zoom, innerRadius + 2 * cam.zoom);
  ctx.stroke();

  // 4. Placa de Montagem Interna (Chapa de Fundo do Painel)
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(innerLeft, innerTop, innerW, innerH, innerRadius);
  ctx.clip();

  if (config.backplate === 'orange_industrial') {
    // Pintura Epóxi Eletrostática Laranja Industrial (Padrão RAL 2004 - Segurança e Máquinas)
    const orangeGrad = ctx.createLinearGradient(innerLeft, innerTop, innerLeft + innerW, innerTop + innerH);
    orangeGrad.addColorStop(0, '#ea580c');
    orangeGrad.addColorStop(0.4, '#c2410c');
    orangeGrad.addColorStop(0.8, '#9a3412');
    orangeGrad.addColorStop(1, '#7c2d12');
    ctx.fillStyle = orangeGrad;
    ctx.fillRect(innerLeft, innerTop, innerW, innerH);

    // Grade sutil de furação padrão 25mm na chapa
    ctx.strokeStyle = 'rgba(254, 215, 170, 0.08)';
    ctx.lineWidth = Math.max(0.6, 0.8 * cam.zoom);
    const gridPitch = 25 * cam.zoom;
    for (let gx = innerLeft; gx <= innerLeft + innerW; gx += gridPitch) {
      ctx.beginPath();
      ctx.moveTo(gx, innerTop);
      ctx.lineTo(gx, innerTop + innerH);
      ctx.stroke();
    }
    for (let gy = innerTop; gy <= innerTop + innerH; gy += gridPitch) {
      ctx.beginPath();
      ctx.moveTo(innerLeft, gy);
      ctx.lineTo(innerLeft + innerW, gy);
      ctx.stroke();
    }
  } else if (config.backplate === 'anthracite') {
    // Painel Grafite / Charcoal Moderno
    const darkGrad = ctx.createLinearGradient(innerLeft, innerTop, innerLeft, innerTop + innerH);
    darkGrad.addColorStop(0, '#1e293b');
    darkGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = darkGrad;
    ctx.fillRect(innerLeft, innerTop, innerW, innerH);
  } else {
    // Chapa de Aço Galvanizado / Zincado Eletrolítico com Acabamento Escovado
    const galvGrad = ctx.createLinearGradient(innerLeft, innerTop, innerLeft + innerW, innerTop + innerH);
    galvGrad.addColorStop(0, '#f1f5f9');
    galvGrad.addColorStop(0.2, '#e2e8f0');
    galvGrad.addColorStop(0.5, '#cbd5e1');
    galvGrad.addColorStop(0.8, '#94a3b8');
    galvGrad.addColorStop(1, '#cbd5e1');
    ctx.fillStyle = galvGrad;
    ctx.fillRect(innerLeft, innerTop, innerW, innerH);

    // Faint galvanized spangle texture lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = Math.max(0.6, 0.8 * cam.zoom);
    const spanglePitch = 20 * cam.zoom;
    for (let x = innerLeft; x < innerLeft + innerW; x += spanglePitch) {
      ctx.beginPath();
      ctx.moveTo(x, innerTop);
      ctx.lineTo(x + innerH * 0.4, innerTop + innerH);
      ctx.stroke();
    }
  }

  // 5. Parafusos Sextavados / Philips nos 4 Cantos com Arruela de Pressão
  const boltInset = 16 * cam.zoom;
  const boltPositions = [
    { x: innerLeft + boltInset, y: innerTop + boltInset },
    { x: innerLeft + innerW - boltInset, y: innerTop + boltInset },
    { x: innerLeft + boltInset, y: innerTop + innerH - boltInset },
    { x: innerLeft + innerW - boltInset, y: innerTop + innerH - boltInset }
  ];

  boltPositions.forEach(b => {
    // Arruela
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.arc(b.x, b.y, 7 * cam.zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = Math.max(0.7, 1 * cam.zoom);
    ctx.stroke();

    // Cabeça do parafuso com flange
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.arc(b.x, b.y, 4.5 * cam.zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#334155';
    ctx.stroke();

    // Fenda cruzada Philips
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = Math.max(0.8, 1.2 * cam.zoom);
    ctx.beginPath();
    ctx.moveTo(b.x - 2.5 * cam.zoom, b.y);
    ctx.lineTo(b.x + 2.5 * cam.zoom, b.y);
    ctx.moveTo(b.x, b.y - 2.5 * cam.zoom);
    ctx.lineTo(b.x, b.y + 2.5 * cam.zoom);
    ctx.stroke();
  });

  // 6. Canaletas Perfuradas de Passagem de Cabos (Finger Ducts Cinza RAL 7030)
  if (config.hasDucts) {
    const ductW = 28 * cam.zoom;
    const ductColor = '#475569';
    const ductBorder = '#334155';
    const slotPitch = 14 * cam.zoom;
    const slotW = 5 * cam.zoom;

    // Função para desenhar calha com aletas de PVC
    const drawDuct = (dx: number, dy: number, dw: number, dh: number, isVertical: boolean) => {
      // Corpo da calha
      ctx.fillStyle = ductColor;
      ctx.strokeStyle = ductBorder;
      ctx.lineWidth = Math.max(0.8, 1.2 * cam.zoom);
      ctx.beginPath();
      ctx.roundRect(dx, dy, dw, dh, 3 * cam.zoom);
      ctx.fill();
      ctx.stroke();

      // Friso central da tampa da calha
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = Math.max(0.8, 1 * cam.zoom);
      if (isVertical) {
        ctx.beginPath();
        ctx.moveTo(dx + dw / 2, dy + 6 * cam.zoom);
        ctx.lineTo(dx + dw / 2, dy + dh - 6 * cam.zoom);
        ctx.stroke();

        // Ranhuras/Aletas laterais para saída de fios
        const slotsCount = Math.floor(dh / slotPitch);
        ctx.fillStyle = '#0f172a';
        for (let i = 1; i < slotsCount - 1; i++) {
          const sy = dy + i * slotPitch;
          ctx.fillRect(dx + 2 * cam.zoom, sy, slotW, 4 * cam.zoom);
          ctx.fillRect(dx + dw - slotW - 2 * cam.zoom, sy, slotW, 4 * cam.zoom);
        }
      } else {
        ctx.beginPath();
        ctx.moveTo(dx + 6 * cam.zoom, dy + dh / 2);
        ctx.lineTo(dx + dw - 6 * cam.zoom, dy + dh / 2);
        ctx.stroke();

        const slotsCount = Math.floor(dw / slotPitch);
        ctx.fillStyle = '#0f172a';
        for (let i = 1; i < slotsCount - 1; i++) {
          const sx = dx + i * slotPitch;
          ctx.fillRect(sx, dy + 2 * cam.zoom, 4 * cam.zoom, slotW);
          ctx.fillRect(sx, dy + dh - slotW - 2 * cam.zoom, 4 * cam.zoom, slotW);
        }
      }
    };

    // Canaleta Esquerda
    drawDuct(innerLeft + 6 * cam.zoom, innerTop + 6 * cam.zoom, ductW, innerH - 12 * cam.zoom, true);
    // Canaleta Direita
    drawDuct(innerLeft + innerW - ductW - 6 * cam.zoom, innerTop + 6 * cam.zoom, ductW, innerH - 12 * cam.zoom, true);
    // Canaleta Superior
    drawDuct(innerLeft + ductW + 10 * cam.zoom, innerTop + 6 * cam.zoom, innerW - (ductW * 2 + 20 * cam.zoom), ductW, false);
    // Canaleta Inferior
    drawDuct(innerLeft + ductW + 10 * cam.zoom, innerTop + innerH - ductW - 6 * cam.zoom, innerW - (ductW * 2 + 20 * cam.zoom), ductW, false);
  }

  // 7. Plaqueta Técnica de Identificação em Aço Escovado (Superior Esquerda)
  const tagW = Math.min(innerW * 0.55, 340 * cam.zoom);
  const tagH = 26 * cam.zoom;
  const tagX = innerLeft + 42 * cam.zoom;
  const tagY = innerTop + 38 * cam.zoom;

  ctx.fillStyle = '#0f172a';
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = Math.max(1, 1.4 * cam.zoom);
  ctx.beginPath();
  ctx.roundRect(tagX, tagY, tagW, tagH, 3 * cam.zoom);
  ctx.fill();
  ctx.stroke();

  // Texto da Plaqueta
  ctx.fillStyle = '#38bdf8';
  ctx.font = `bold ${Math.max(7, 8.5 * cam.zoom)}px monospace`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(config.nameplateText || 'QUADRO GERAL DE DISTRIBUIÇÃO • IEC 60364', tagX + 10 * cam.zoom, tagY + tagH / 2);

  // 8. Etiqueta Normativa de Segurança (Raio de Alta Tensão IEC 60417-5036)
  if (config.hasWarningLabels) {
    const warnX = innerLeft + innerW - 85 * cam.zoom;
    const warnY = innerTop + 38 * cam.zoom;
    const warnS = 24 * cam.zoom;

    // Triângulo Amarelo de Alerta
    ctx.fillStyle = '#facc15';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = Math.max(1, 1.5 * cam.zoom);
    ctx.beginPath();
    ctx.moveTo(warnX + warnS / 2, warnY);
    ctx.lineTo(warnX + warnS, warnY + warnS);
    ctx.lineTo(warnX, warnY + warnS);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Símbolo de Raio Preto Estilizado
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(warnX + warnS * 0.52, warnY + warnS * 0.22);
    ctx.lineTo(warnX + warnS * 0.38, warnY + warnS * 0.55);
    ctx.lineTo(warnX + warnS * 0.55, warnY + warnS * 0.55);
    ctx.lineTo(warnX + warnS * 0.44, warnY + warnS * 0.88);
    ctx.lineTo(warnX + warnS * 0.68, warnY + warnS * 0.45);
    ctx.lineTo(warnX + warnS * 0.52, warnY + warnS * 0.45);
    ctx.closePath();
    ctx.fill();

    // Texto de Perigo 400V
    ctx.fillStyle = '#facc15';
    ctx.font = `bold ${Math.max(6, 7 * cam.zoom)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('400V', warnX + warnS / 2, warnY + warnS + 9 * cam.zoom);
  }

  // 9. Borne de Aterramento Equipotencial da Carcaça Metálica (PE Chassis Stud)
  const earthStudX = innerLeft + innerW - 48 * cam.zoom;
  const earthStudY = innerTop + innerH - 42 * cam.zoom;

  ctx.fillStyle = '#16a34a';
  ctx.strokeStyle = '#facc15';
  ctx.lineWidth = Math.max(1, 1.2 * cam.zoom);
  ctx.beginPath();
  ctx.arc(earthStudX, earthStudY, 8 * cam.zoom, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Símbolo de Terra (3 traços horizontais decrescentes)
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = Math.max(0.8, 1.2 * cam.zoom);
  ctx.beginPath();
  ctx.moveTo(earthStudX - 4 * cam.zoom, earthStudY - 2 * cam.zoom);
  ctx.lineTo(earthStudX + 4 * cam.zoom, earthStudY - 2 * cam.zoom);
  ctx.moveTo(earthStudX - 2.5 * cam.zoom, earthStudY + 1 * cam.zoom);
  ctx.lineTo(earthStudX + 2.5 * cam.zoom, earthStudY + 1 * cam.zoom);
  ctx.moveTo(earthStudX - 1.2 * cam.zoom, earthStudY + 4 * cam.zoom);
  ctx.lineTo(earthStudX + 1.2 * cam.zoom, earthStudY + 4 * cam.zoom);
  ctx.stroke();

  ctx.restore();
  ctx.restore();
}

/**
 * Renderização Profissional de Trilhos DIN e Barramentos Elétricos:
 * - Trilhos DIN TH35 em aço zincado com acabamento 3D
 * - Barramentos em Cobre com bornes de parafuso em latão dourado interativos
 * - Destaque luminoso quando energizados
 */
export function drawBusbars(
  ctx: CanvasRenderingContext2D,
  cam: { zoom: number; pan: { x: number; y: number } },
  busbars: Busbar[],
  selectedBusbarId: string | null,
  hoveredTerminalId: string | null = null,
  activeLiveBusbars: Set<string> = new Set()
): void {
  if (!busbars || busbars.length === 0) return;

  const toScreen = (p: { x: number; y: number }) => ({
    x: p.x * cam.zoom + cam.pan.x,
    y: p.y * cam.zoom + cam.pan.y
  });

  busbars.forEach((bb: Busbar) => {
    const isHorizontal = bb.orientation === 'horizontal';
    const isSelected = bb.id === selectedBusbarId;
    const isLive = activeLiveBusbars.has(bb.id) || activeLiveBusbars.has(bb.type);
    const len = bb.length * cam.zoom;
    const center = toScreen({ x: bb.x, y: bb.y });

    ctx.save();
    ctx.translate(center.x, center.y);
    if (!isHorizontal) {
      ctx.rotate(Math.PI / 2);
    }

    if (bb.type === 'din') {
      // TRILHO DIN 35mm PADRÃO IEC/EN 60715 (TH35-7.5)
      const railH = 35 * cam.zoom;
      const rx = -len / 2;
      const ry = -railH / 2;

      ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
      ctx.shadowBlur = 8 * cam.zoom;
      ctx.shadowOffsetY = 3 * cam.zoom;

      const dinGrad = ctx.createLinearGradient(0, ry, 0, ry + railH);
      dinGrad.addColorStop(0, '#64748b');
      dinGrad.addColorStop(0.12, '#475569');
      dinGrad.addColorStop(0.22, '#1e293b');
      dinGrad.addColorStop(0.5, '#334155');
      dinGrad.addColorStop(0.78, '#1e293b');
      dinGrad.addColorStop(0.88, '#475569');
      dinGrad.addColorStop(1, '#64748b');

      ctx.fillStyle = dinGrad;
      ctx.fillRect(rx, ry, len, railH);

      ctx.shadowColor = 'transparent';

      // Bordas metálicas
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = Math.max(1, 1.2 * cam.zoom);
      ctx.beginPath();
      ctx.moveTo(rx, ry + 0.5);
      ctx.lineTo(rx + len, ry + 0.5);
      ctx.moveTo(rx, ry + railH - 0.5);
      ctx.lineTo(rx + len, ry + railH - 0.5);
      ctx.stroke();

      // Calha central rebaixada
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = Math.max(1, 1.4 * cam.zoom);
      ctx.beginPath();
      ctx.moveTo(rx, ry + railH * 0.22);
      ctx.lineTo(rx + len, ry + railH * 0.22);
      ctx.moveTo(rx, ry + railH * 0.78);
      ctx.lineTo(rx + len, ry + railH * 0.78);
      ctx.stroke();

      // Furos Oblongos de Fixação Periódicos
      const slotPitch = 40 * cam.zoom;
      const slotW = 18 * cam.zoom;
      const slotH = 6 * cam.zoom;
      const numSlots = Math.floor(len / slotPitch);
      const startSlotX = -((numSlots - 1) * slotPitch) / 2;

      ctx.fillStyle = '#050a14';
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = Math.max(0.7, 0.9 * cam.zoom);

      for (let i = 0; i < numSlots; i++) {
        const sx = startSlotX + i * slotPitch;
        ctx.beginPath();
        ctx.roundRect(sx - slotW / 2, -slotH / 2, slotW, slotH, slotH / 2);
        ctx.fill();
        ctx.stroke();

        // Parafuso de fixação no painel
        if (i % 3 === 1) {
          ctx.save();
          ctx.fillStyle = '#94a3b8';
          ctx.beginPath();
          ctx.arc(sx, 0, slotH * 0.65, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#334155';
          ctx.lineWidth = Math.max(0.6, 0.8 * cam.zoom);
          ctx.stroke();

          ctx.strokeStyle = '#1e293b';
          ctx.beginPath();
          ctx.moveTo(sx - 2 * cam.zoom, 0);
          ctx.lineTo(sx + 2 * cam.zoom, 0);
          ctx.moveTo(sx, -2 * cam.zoom);
          ctx.lineTo(sx, 2 * cam.zoom);
          ctx.stroke();
          ctx.restore();
        }
      }

      // Gravação Técnica Baixo-Relevo
      ctx.fillStyle = 'rgba(203, 213, 225, 0.5)';
      ctx.font = `bold ${Math.max(6, 7.5 * cam.zoom)}px monospace`;
      ctx.textAlign = 'left';
      ctx.fillText('IEC/EN 60715 • TH35-7.5', rx + 14 * cam.zoom, ry + railH * 0.17);

      // Postes de Travamento Lateral
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = Math.max(1, 1.2 * cam.zoom);
      ctx.beginPath();
      ctx.roundRect(rx - 7 * cam.zoom, ry - 3 * cam.zoom, 8 * cam.zoom, railH + 6 * cam.zoom, 2 * cam.zoom);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.roundRect(rx + len - 1 * cam.zoom, ry - 3 * cam.zoom, 8 * cam.zoom, railH + 6 * cam.zoom, 2 * cam.zoom);
      ctx.fill();
      ctx.stroke();

    } else {
      // BARRAMENTOS ELÉTRICOS DE COBRE / PENTES TÉCNICOS (L1, L2, L3, N, PE)
      const bbH = 16 * cam.zoom;
      const rx = -len / 2;
      const ry = -bbH / 2;

      let baseColor = '#991b1b';
      let strokeColor = '#ef4444';
      let labelText = 'L1 • FASE 1 (400V / 63A)';
      let isStripedEarth = false;
      let liveGlowColor = 'rgba(239, 68, 68, 0.8)';

      switch (bb.type) {
        case 'phase_l1':
          baseColor = '#991b1b'; // Castanho / Vermelho IEC
          strokeColor = '#ef4444';
          labelText = 'L1 • FASE 1 (400V IEC)';
          liveGlowColor = 'rgba(239, 68, 68, 0.9)';
          break;
        case 'phase_l2':
          baseColor = '#0f172a'; // Preto IEC
          strokeColor = '#38bdf8';
          labelText = 'L2 • FASE 2 (400V IEC)';
          liveGlowColor = 'rgba(56, 189, 248, 0.9)';
          break;
        case 'phase_l3':
          baseColor = '#57534e'; // Cinza IEC
          strokeColor = '#a8a29e';
          labelText = 'L3 • FASE 3 (400V IEC)';
          liveGlowColor = 'rgba(251, 191, 36, 0.9)';
          break;
        case 'neutral':
          baseColor = '#0369a1'; // Azul Celeste IEC
          strokeColor = '#38bdf8';
          labelText = 'N • BARRAMENTO NEUTRO';
          liveGlowColor = 'rgba(56, 189, 248, 0.8)';
          break;
        case 'earth':
          baseColor = '#15803d'; // Verde-Amarelo de Proteção
          strokeColor = '#22c55e';
          labelText = 'PE • PROTEÇÃO / TERRA (IEC 60364)';
          isStripedEarth = true;
          liveGlowColor = 'rgba(34, 197, 94, 0.8)';
          break;
      }

      // Brilho elétrico de alta energia se o barramento estiver energizado
      if (isLive) {
        ctx.shadowColor = liveGlowColor;
        ctx.shadowBlur = 14 * cam.zoom;
      } else {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
        ctx.shadowBlur = 6 * cam.zoom;
        ctx.shadowOffsetY = 2 * cam.zoom;
      }

      // Corpo da Barra Isolante
      ctx.fillStyle = baseColor;
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = Math.max(1.2, 1.8 * cam.zoom);
      ctx.beginPath();
      ctx.roundRect(rx, ry, len, bbH, 3 * cam.zoom);
      ctx.fill();
      ctx.stroke();

      // Listras diagonais de alta visibilidade no barramento de terra PE
      if (isStripedEarth) {
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(rx, ry, len, bbH, 3 * cam.zoom);
        ctx.clip();
        ctx.strokeStyle = '#eab308';
        ctx.lineWidth = 4 * cam.zoom;
        const stripePitch = 16 * cam.zoom;
        for (let sx = rx - bbH * 2; sx < rx + len + bbH * 2; sx += stripePitch) {
          ctx.beginPath();
          ctx.moveTo(sx, ry);
          ctx.lineTo(sx + bbH, ry + bbH);
          ctx.stroke();
        }
        ctx.restore();
      }

      ctx.shadowColor = 'transparent';

      // Rótulo Técnico
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${Math.max(7, 8.5 * cam.zoom)}px monospace`;
      ctx.textAlign = 'left';
      ctx.fillText(labelText, rx + 10 * cam.zoom, ry - 5 * cam.zoom);

      // Terminal Principal de Alimentação (Entrada Geral do Barramento)
      ctx.fillStyle = '#ca8a04';
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = Math.max(1, 1.2 * cam.zoom);
      ctx.beginPath();
      ctx.roundRect(rx - 8 * cam.zoom, ry - 3 * cam.zoom, 10 * cam.zoom, bbH + 6 * cam.zoom, 2 * cam.zoom);
      ctx.fill();
      ctx.stroke();

      // BORNES / TERMINAIS DINÂMICOS DE CONEXÃO
      const terminals = bb.terminals || generateBusbarTerminals(bb.id, bb.type, bb.x, bb.y, bb.length, bb.orientation);

      terminals.forEach((term, idx) => {
        // Posição local do terminal no sistema de coordenadas traduzido
        const localX = isHorizontal ? (term.x - bb.x) * cam.zoom : (term.y - bb.y) * cam.zoom;
        const localY = 0;
        const isHovered = hoveredTerminalId === term.id;
        const isOccupied = term.isOccupied;

        ctx.save();

        // Anel de Destaque se o mouse estiver sobre o terminal
        if (isHovered) {
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 10 * cam.zoom;
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2 * cam.zoom;
          ctx.beginPath();
          ctx.arc(localX, localY, 7 * cam.zoom, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Terminal circular em Latão Dourado Usinado
        ctx.fillStyle = isHovered ? '#fef08a' : (isOccupied ? '#f59e0b' : '#eab308');
        ctx.strokeStyle = isOccupied ? '#b45309' : '#78350f';
        ctx.lineWidth = Math.max(0.8, 1 * cam.zoom);
        ctx.beginPath();
        ctx.arc(localX, localY, 4 * cam.zoom, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Fenda de aperto do parafuso
        ctx.strokeStyle = '#451a03';
        ctx.lineWidth = Math.max(0.6, 0.8 * cam.zoom);
        ctx.beginPath();
        ctx.moveTo(localX - 1.8 * cam.zoom, localY);
        ctx.lineTo(localX + 1.8 * cam.zoom, localY);
        ctx.stroke();

        // Número do Terminal acima do borne
        if (cam.zoom > 0.6) {
          ctx.fillStyle = isHovered ? '#38bdf8' : 'rgba(255, 255, 255, 0.85)';
          ctx.font = `${Math.max(5.5, 6.5 * cam.zoom)}px monospace`;
          ctx.textAlign = 'center';
          ctx.fillText(`${idx + 1}`, localX, localY + (bbH / 2 + 8 * cam.zoom));
        }

        ctx.restore();
      });
    }

    // Se o Barramento estiver selecionado pelo usuário
    if (isSelected) {
      const pad = 4 * cam.zoom;
      const selW = len + pad * 2;
      const selH = (bb.type === 'din' ? 35 : 16) * cam.zoom + pad * 2;

      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = Math.max(1.5, 2 * cam.zoom);
      ctx.setLineDash([4 * cam.zoom, 4 * cam.zoom]);
      ctx.strokeRect(-selW / 2, -selH / 2, selW, selH);
      ctx.setLineDash([]);

      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(-len / 2, 0, 5 * cam.zoom, 0, Math.PI * 2);
      ctx.arc(len / 2, 0, 5 * cam.zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5 * cam.zoom;
      ctx.stroke();
    }

    ctx.restore();
  });
}
