// ============================================================================
// TÉCNICAMZ PRO — SISTEMA DE QUADROS GERAIS, BARRAMENTOS E TRILHOS DIN 3D
// Normas: IEC/EN 60715, DIN EN 50022, IEC 60364-4-41 e IEC 61439-1/-2
// TRILHO DIN 35mm EM 3D: Gradiente de Aço Escovado, Chanfros Laterais,
// Perfurações Ovais Centrais Periódicas (18x5.2mm), Sombra Projetada e Especular
// Quadro QDF Paramétrico, Placa de Montagem Galvanizada/RAL 2004 e Canaletas
// ============================================================================

export type PanelEnclosureSize = 'compact' | 'medium' | 'large' | 'industrial' | 'custom';
export type PanelBackplateStyle = 'galvanized' | 'orange_industrial' | 'anthracite';

export interface BusbarTerminal {
  id: string;
  busbarId: string;
  type: 'din' | 'phase_l1' | 'phase_l2' | 'phase_l3' | 'neutral' | 'earth';
  x: number;
  y: number;
}

export interface Busbar {
  id: string;
  type: 'din' | 'phase_l1' | 'phase_l2' | 'phase_l3' | 'neutral' | 'earth';
  x: number;
  y: number;
  length: number;
  orientation: 'horizontal' | 'vertical';
  terminals?: BusbarTerminal[];
}

export const DEFAULT_MOTOR_BUSBARS: Busbar[] = [
  { id: 'din_motor_1', type: 'din', x: 0, y: -80, length: 650, orientation: 'horizontal' },
  { id: 'bb_pe_1', type: 'earth', x: 0, y: 160, length: 650, orientation: 'horizontal' }
];

export const DEFAULT_QGD_BUSBARS: Busbar[] = [
  { id: 'din_qgd_1', type: 'din', x: 0, y: -50, length: 700, orientation: 'horizontal' },
  { id: 'bb_l1', type: 'phase_l1', x: 0, y: -140, length: 700, orientation: 'horizontal' },
  { id: 'bb_n', type: 'neutral', x: 0, y: 60, length: 700, orientation: 'horizontal' },
  { id: 'bb_pe', type: 'earth', x: 0, y: 140, length: 700, orientation: 'horizontal' }
];

export const DEFAULT_FOURWAY_BUSBARS: Busbar[] = [
  { id: 'din_fw_1', type: 'din', x: 0, y: 0, length: 700, orientation: 'horizontal' }
];

export interface PanelEnclosureConfig {
  enabled: boolean;
  size: PanelEnclosureSize;
  width: number;
  height: number;
  x: number;
  y: number;
  backplate: PanelBackplateStyle;
  hasDucts: boolean;
  hasWarningLabels: boolean;
  nameplateText?: string;
}

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

export function generateBusbarTerminals(
  busbarId: string,
  type: 'din' | 'phase_l1' | 'phase_l2' | 'phase_l3' | 'neutral' | 'earth',
  centerX: number,
  centerY: number,
  length: number,
  orientation: 'horizontal' | 'vertical',
  spacing = 24
): BusbarTerminal[] {
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
      y: orientation === 'horizontal' ? centerY : centerY + offset
    });
  }

  return terminals;
}

export function snapComponentToBusbars(
  rawNx: number,
  rawNy: number,
  comp: { w?: number; h?: number } | number | any,
  busbars: Busbar[],
  snapTolerance = 30
): { nx: number; ny: number; x: number; y: number; snappedBusbarId?: string } {
  const compW = typeof comp === 'number' ? comp : comp?.w || 90;
  const compH = typeof comp === 'number' ? comp : comp?.h || 80;

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

// ----------------------------------------------------------------------------
// RENDERIZAÇÃO REALISTA 3D DO TRILHO DIN 35mm (DIN EN 50022 - TOP HAT)
// ----------------------------------------------------------------------------

function render3DDinRail(
  ctx: CanvasRenderingContext2D,
  len: number,
  railH: number,
  zoom: number
) {
  const rx = -len / 2;
  const ry = -railH / 2;

  // 1. Sombra projetada macia sob o trilho
  ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
  ctx.shadowBlur = 10 * zoom;
  ctx.shadowOffsetY = 4 * zoom;
  ctx.fillStyle = '#05070d';
  ctx.fillRect(rx, ry, len, railH);
  ctx.shadowColor = 'transparent';

  // 2. Abas externas superiores e inferiores (Lips)
  const lipH = 4.5 * zoom;
  const channelH = railH - lipH * 2;

  // Gradiente de aço escovado / zincado bicromatizado
  const steelGrad = ctx.createLinearGradient(0, ry, 0, ry + railH);
  steelGrad.addColorStop(0, '#cbd5e1');
  steelGrad.addColorStop(0.15, '#94a3b8');
  steelGrad.addColorStop(0.35, '#475569');
  steelGrad.addColorStop(0.5, '#64748b');
  steelGrad.addColorStop(0.65, '#475569');
  steelGrad.addColorStop(0.85, '#94a3b8');
  steelGrad.addColorStop(1, '#cbd5e1');

  ctx.fillStyle = steelGrad;
  ctx.fillRect(rx, ry, len, railH);

  // 3. Canal Central Rebaixado com Chanfros Laterais 3D
  const channelGrad = ctx.createLinearGradient(0, ry + lipH, 0, ry + lipH + channelH);
  channelGrad.addColorStop(0, '#1e293b');
  channelGrad.addColorStop(0.12, '#334155');
  channelGrad.addColorStop(0.5, '#475569');
  channelGrad.addColorStop(0.88, '#334155');
  channelGrad.addColorStop(1, '#1e293b');

  ctx.fillStyle = channelGrad;
  ctx.fillRect(rx, ry + lipH, len, channelH);

  // Linhas de chanfro chanfrado em 45°
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(rx, ry + lipH);
  ctx.lineTo(rx + len, ry + lipH);
  ctx.moveTo(rx, ry + lipH + channelH);
  ctx.lineTo(rx + len, ry + lipH + channelH);
  ctx.stroke();

  // Brilho especular reflexivo nas bordas superiores
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.moveTo(rx, ry + 1);
  ctx.lineTo(rx + len, ry + 1);
  ctx.stroke();

  // 4. Fendas Ovais Centrais de Fixação (18x5.2mm periodicamente espaçadas a cada 25mm)
  const slotPitch = 40 * zoom;
  const slotW = 20 * zoom;
  const slotH = 6 * zoom;
  const slotY = -slotH / 2;

  for (let sx = rx + slotPitch / 2; sx < rx + len - slotPitch / 2; sx += slotPitch) {
    // Cavidade perfurada da fenda
    ctx.fillStyle = '#090d16';
    ctx.beginPath();
    ctx.roundRect(sx - slotW / 2, slotY, slotW, slotH, slotH / 2);
    ctx.fill();

    // Chanfro de corte do aço na fenda
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 0.6 * zoom;
    ctx.beginPath();
    ctx.roundRect(sx - slotW / 2, slotY, slotW, slotH, slotH / 2);
    ctx.stroke();

    // Parafuso de fixação no chassi em algumas perfurações
    if (Math.round(sx / slotPitch) % 3 === 0) {
      ctx.fillStyle = '#64748b';
      ctx.beginPath();
      ctx.arc(sx, 0, 2.5 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 0.6 * zoom;
      ctx.stroke();
    }
  }
}

// ----------------------------------------------------------------------------
// RENDERIZAÇÃO DO QUADRO ELÉTRICO INDUSTRIAL (QDF / CANALETAS / ELETRODUTOS)
// ----------------------------------------------------------------------------

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

  // Moldura externa da chapa do armário
  ctx.shadowColor = 'rgba(0, 0, 0, 0.75)';
  ctx.shadowBlur = 24 * cam.zoom;
  ctx.shadowOffsetX = 8 * cam.zoom;
  ctx.shadowOffsetY = 12 * cam.zoom;

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

  // Placa de montagem interna
  const innerLeft = left + frameBorder;
  const innerTop = top + frameBorder;
  const innerW = W - frameBorder * 2;
  const innerH = H - frameBorder * 2;
  const innerRadius = 8 * cam.zoom;

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(innerLeft, innerTop, innerW, innerH, innerRadius);
  ctx.clip();

  if (config.backplate === 'orange_industrial') {
    const orangeGrad = ctx.createLinearGradient(innerLeft, innerTop, innerLeft + innerW, innerTop + innerH);
    orangeGrad.addColorStop(0, '#ea580c');
    orangeGrad.addColorStop(0.4, '#c2410c');
    orangeGrad.addColorStop(0.8, '#9a3412');
    orangeGrad.addColorStop(1, '#7c2d12');
    ctx.fillStyle = orangeGrad;
    ctx.fillRect(innerLeft, innerTop, innerW, innerH);
  } else {
    // Chapa galvanizada escovada
    const galvGrad = ctx.createLinearGradient(innerLeft, innerTop, innerLeft + innerW, innerTop + innerH);
    galvGrad.addColorStop(0, '#334155');
    galvGrad.addColorStop(0.5, '#1e293b');
    galvGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = galvGrad;
    ctx.fillRect(innerLeft, innerTop, innerW, innerH);
  }

  // CANALETAS PERFURADAS DE FIAÇÃO (WIRE DUCTS)
  if (config.hasDucts) {
    const ductW = 28 * cam.zoom;
    const drawDuct = (dx: number, dy: number, dw: number, dh: number, isVert: boolean) => {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(dx, dy, dw, dh);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1 * cam.zoom;
      ctx.strokeRect(dx, dy, dw, dh);

      // Fendas abertas da canaleta
      ctx.fillStyle = '#090d16';
      const slotStep = 10 * cam.zoom;
      if (isVert) {
        for (let sy = dy + 4 * cam.zoom; sy < dy + dh - 4 * cam.zoom; sy += slotStep) {
          ctx.fillRect(dx + 2 * cam.zoom, sy, dw - 4 * cam.zoom, 3 * cam.zoom);
        }
      } else {
        for (let sx = dx + 4 * cam.zoom; sx < dx + dw - 4 * cam.zoom; sx += slotStep) {
          ctx.fillRect(sx, dy + 2 * cam.zoom, 3 * cam.zoom, dh - 4 * cam.zoom);
        }
      }
    };

    drawDuct(innerLeft + 6 * cam.zoom, innerTop + 6 * cam.zoom, ductW, innerH - 12 * cam.zoom, true);
    drawDuct(innerLeft + innerW - ductW - 6 * cam.zoom, innerTop + 6 * cam.zoom, ductW, innerH - 12 * cam.zoom, true);
    drawDuct(innerLeft + ductW + 10 * cam.zoom, innerTop + 6 * cam.zoom, innerW - (ductW * 2 + 20 * cam.zoom), ductW, false);
    drawDuct(innerLeft + ductW + 10 * cam.zoom, innerTop + innerH - ductW - 6 * cam.zoom, innerW - (ductW * 2 + 20 * cam.zoom), ductW, false);
  }

  ctx.restore();
  ctx.restore();
}

// ----------------------------------------------------------------------------
// RENDERIZAÇÃO COMPLETA DE TRILHOS DIN E BARRAMENTOS ELÉTRICOS
// ----------------------------------------------------------------------------

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
    if (!isHorizontal) ctx.rotate(Math.PI / 2);

    if (bb.type === 'din') {
      const railH = 35 * cam.zoom;
      render3DDinRail(ctx, len, railH, cam.zoom);
    } else {
      // BARRAMENTO DE COBRE NORMATIZADO COM CORES REAIS
      const bbH = 16 * cam.zoom;
      const rx = -len / 2;
      const ry = -bbH / 2;

      let baseColor = '#dc2626';
      let strokeColor = '#f87171';
      let labelText = 'FASE R';
      let isStripedEarth = false;

      switch (bb.type) {
        case 'phase_l1':
          baseColor = '#dc2626';
          strokeColor = '#f87171';
          labelText = 'FASE R (L1)';
          break;
        case 'phase_l2':
          baseColor = '#0f172a';
          strokeColor = '#334155';
          labelText = 'FASE S (L2)';
          break;
        case 'phase_l3':
          baseColor = '#64748b';
          strokeColor = '#94a3b8';
          labelText = 'FASE T (L3)';
          break;
        case 'neutral':
          baseColor = '#0057FF';
          strokeColor = '#38bdf8';
          labelText = 'NEUTRO (N)';
          break;
        case 'earth':
          baseColor = '#00A651';
          strokeColor = '#22c55e';
          labelText = 'TERRA (PE)';
          isStripedEarth = true;
          break;
      }

      if (isLive) {
        ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
        ctx.shadowBlur = 12 * cam.zoom;
      }

      ctx.fillStyle = baseColor;
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = Math.max(1.2, 1.8 * cam.zoom);
      ctx.beginPath();
      ctx.roundRect(rx, ry, len, bbH, 3 * cam.zoom);
      ctx.fill();
      ctx.stroke();

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

      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${Math.max(7, 8.5 * cam.zoom)}px monospace`;
      ctx.textAlign = 'left';
      ctx.fillText(labelText, rx + 10 * cam.zoom, ry - 5 * cam.zoom);

      // Bornes de engate do barramento
      const terminals = bb.terminals || generateBusbarTerminals(bb.id, bb.type, bb.x, bb.y, bb.length, bb.orientation);
      terminals.forEach((term, idx) => {
        const localX = isHorizontal ? (term.x - bb.x) * cam.zoom : (term.y - bb.y) * cam.zoom;
        const localY = 0;
        const isHovered = hoveredTerminalId === term.id;

        ctx.fillStyle = isHovered ? '#fef08a' : '#eab308';
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = Math.max(0.8, 1 * cam.zoom);
        ctx.beginPath();
        ctx.arc(localX, localY, 4 * cam.zoom, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      });
    }

    if (isSelected) {
      const pad = 4 * cam.zoom;
      const selW = len + pad * 2;
      const selH = (bb.type === 'din' ? 35 : 16) * cam.zoom + pad * 2;
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = Math.max(1.5, 2 * cam.zoom);
      ctx.setLineDash([4 * cam.zoom, 4 * cam.zoom]);
      ctx.strokeRect(-selW / 2, -selH / 2, selW, selH);
      ctx.setLineDash([]);
    }

    ctx.restore();
  });
}
