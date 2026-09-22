// ============================================================================
// TÉCNICAMZ PRO — AGREGADOR DE CAPTURA & SNAPSHOT HOLÍSTICO (AUTO-FIT)
// Conforme normas IEC 60947 / IEC 60364: Enquadramento integral 100% visível
// ============================================================================

import { getNodeWorldPos, calculateManhattanPath, drawProfessionalWire } from './cadRouting';
import { drawBusbars, drawPanelEnclosure } from './cadBusbars';
import { getComponentDef } from './cadEngine';

export interface CircuitBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
}

export interface SnapshotOptions {
  width?: number;
  height?: number;
  padding?: number;
  format?: 'image/png' | 'image/jpeg';
  quality?: number;
  title?: string;
  badge?: string;
}

/**
 * Calcula o retângulo delimitador (Bounding Box) abrangendo 100% dos elementos:
 * - Quadro Geral / Armário Elétrico (moldura e placa de montagem)
 * - Barramentos elétricos e trilhos DIN 35mm
 * - Dispositivos / Componentes eletromecânicos
 * - Toda a rede de condutores com seus vértices ortogonais (Manhattan)
 */
export function calculateCircuitBoundingBox(
  project: {
    components: any[];
    wires: any[];
    busbars?: any[];
    panelConfig?: any;
  },
  padding = 60
): CircuitBounds {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  // 1. Quadro Geral / Moldura Industrial
  if (project.panelConfig?.enabled) {
    const pc = project.panelConfig;
    const px = pc.x || 0;
    const py = pc.y || 0;
    const pw = pc.width || 800;
    const ph = pc.height || 600;
    minX = Math.min(minX, px - pw / 2);
    maxX = Math.max(maxX, px + pw / 2);
    minY = Math.min(minY, py - ph / 2);
    maxY = Math.max(maxY, py + ph / 2);
  }

  // 2. Componentes / Dispositivos CAD
  (project.components || []).forEach(c => {
    const w = c.w || 90;
    const h = c.h || 80;
    minX = Math.min(minX, c.x - w / 2);
    maxX = Math.max(maxX, c.x + w / 2);
    minY = Math.min(minY, c.y - h / 2);
    maxY = Math.max(maxY, c.y + h / 2);
  });

  // 3. Barramentos de Fase, Neutro, Terra e Trilhos DIN
  (project.busbars || []).forEach(b => {
    const isH = b.orientation === 'horizontal';
    const halfLen = (b.length || 600) / 2;
    const halfH = (b.type === 'din' ? 35 : 14) / 2;
    minX = Math.min(minX, b.x - (isH ? halfLen : halfH));
    maxX = Math.max(maxX, b.x + (isH ? halfLen : halfH));
    minY = Math.min(minY, b.y - (isH ? halfH : halfLen));
    maxY = Math.max(maxY, b.y + (isH ? halfH : halfLen));
  });

  // 4. Rede de Cabos e Vértices Ortogonais
  (project.wires || []).forEach((w, idx) => {
    const posA = getNodeWorldPos(w.a?.c, w.a?.t, project.components, project.busbars || []);
    const posB = getNodeWorldPos(w.b?.c, w.b?.t, project.components, project.busbars || []);
    const pts = calculateManhattanPath(posA, posB, idx, w.waypoints);
    pts.forEach(p => {
      minX = Math.min(minX, p.x);
      maxX = Math.max(maxX, p.x);
      minY = Math.min(minY, p.y);
      maxY = Math.max(maxY, p.y);
    });
  });

  // Caso circuito esteja vazio
  if (!isFinite(minX) || !isFinite(minY) || !isFinite(maxX) || !isFinite(maxY)) {
    minX = -400;
    minY = -300;
    maxX = 400;
    maxY = 300;
  }

  // Aplicação da margem de respiro de segurança (sem corte)
  minX -= padding;
  minY -= padding;
  maxX += padding;
  maxY += padding;

  const width = Math.max(300, maxX - minX);
  const height = Math.max(200, maxY - minY);

  return {
    minX,
    minY,
    maxX,
    maxY,
    width,
    height,
    centerX: (minX + maxX) / 2,
    centerY: (minY + maxY) / 2
  };
}

/**
 * Gera um snapshot fotográfico/PNG em alta resolução com Auto-Fit perfeito
 * para publicação no Mural Técnico do TécnicaMZ Pro.
 */
export function generateMuralSnapshot(
  project: {
    components: any[];
    wires: any[];
    busbars?: any[];
    panelConfig?: any;
    name?: string;
  },
  options: SnapshotOptions = {}
): string {
  const targetW = options.width || 1200;
  const targetH = options.height || 720;
  const padding = options.padding || 70;

  // Cria canvas offscreen
  const canvas = document.createElement('canvas');
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const bounds = calculateCircuitBoundingBox(project, padding);

  // Calcula escala e centralização do enquadramento
  const scaleX = targetW / bounds.width;
  const scaleY = targetH / bounds.height;
  const fitZoom = Math.min(scaleX, scaleY);

  const cam = {
    zoom: fitZoom,
    pan: {
      x: targetW / 2 - bounds.centerX * fitZoom,
      y: targetH / 2 - bounds.centerY * fitZoom
    }
  };

  const toScreen = (p: { x: number; y: number }) => ({
    x: p.x * cam.zoom + cam.pan.x,
    y: p.y * cam.zoom + cam.pan.y
  });

  // 1. Fundo Técnico Industrial Escuro
  ctx.fillStyle = '#060D1A';
  ctx.fillRect(0, 0, targetW, targetH);

  // 2. Grade Milimétrica Sutil
  ctx.save();
  const step = 20 * cam.zoom;
  if (step > 4) {
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.04)';
    ctx.lineWidth = 1;
    for (let x = cam.pan.x % step; x < targetW; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, targetH);
      ctx.stroke();
    }
    for (let y = cam.pan.y % step; y < targetH; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(targetW, y);
      ctx.stroke();
    }
  }
  ctx.restore();

  // 3. Quadro Geral / Moldura e Placa de Montagem
  if (project.panelConfig?.enabled) {
    drawPanelEnclosure(ctx, cam, project.panelConfig);
  }

  // 4. Barramentos e Trilhos DIN
  const activeBusbars = new Set<string>(['phase_l1', 'phase_l2', 'phase_l3', 'neutral', 'earth']);
  drawBusbars(ctx, cam, project.busbars || [], null, null, activeBusbars);

  // 5. Fiação Ortogonal (Manhattan, Fillets, Anilhas Crimpadas e 3D)
  (project.wires || []).forEach((wire, wireIdx) => {
    const posA = getNodeWorldPos(wire.a?.c, wire.a?.t, project.components, project.busbars || []);
    const posB = getNodeWorldPos(wire.b?.c, wire.b?.t, project.components, project.busbars || []);
    const pathPoints = calculateManhattanPath(posA, posB, wireIdx, wire.waypoints);
    const screenPoints = pathPoints.map(p => toScreen(p));

    if (screenPoints.length < 2) return;

    drawProfessionalWire(
      ctx,
      screenPoints,
      wire.type || 'L1',
      cam,
      Boolean(wire.live),
      false,
      0
    );
  });

  // 6. Componentes Eletromecânicos
  (project.components || []).forEach(c => {
    const d = getComponentDef(c.code);
    const p = toScreen({ x: c.x, y: c.y });
    const cw = (c.w || 90) * cam.zoom;
    const ch = (c.h || 70) * cam.zoom;

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate((c.rot * Math.PI) / 180);

    // Sombra do componente
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.beginPath();
    ctx.roundRect(-cw / 2 + 2, -ch / 2 + 3, cw, ch, 6 * cam.zoom);
    ctx.fill();

    // Invólucro
    ctx.fillStyle = '#0F172A';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.5 * cam.zoom;
    ctx.beginPath();
    ctx.roundRect(-cw / 2, -ch / 2, cw, ch, 6 * cam.zoom);
    ctx.fill();
    ctx.stroke();

    // Ícone do componente
    ctx.fillStyle = '#93c5fd';
    ctx.font = `${Math.max(12, 16 * cam.zoom)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(d.icon || '⚡', 0, -4 * cam.zoom);

    // Rótulo / Tag
    ctx.fillStyle = '#e2e8f0';
    ctx.font = `bold ${Math.max(7, 8 * cam.zoom)}px monospace`;
    ctx.fillText((c.label || d.name).substring(0, 18), 0, ch / 2 - 8 * cam.zoom);

    ctx.restore();

    // Terminais
    d.terminals.forEach(term => {
      const tPos = toScreen(getNodeWorldPos(c.id, term[0], project.components, []));
      ctx.fillStyle = '#0284c7';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5 * cam.zoom;
      ctx.beginPath();
      ctx.arc(tPos.x, tPos.y, 4 * cam.zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });
  });

  // 7. Rodapé com Carimbo Técnico Oficial do TécnicaMZ Pro
  ctx.save();
  ctx.fillStyle = 'rgba(11, 19, 43, 0.85)';
  ctx.fillRect(0, targetH - 36, targetW, 36);
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, targetH - 36);
  ctx.lineTo(targetW, targetH - 36);
  ctx.stroke();

  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 11px monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  const labelTitle = options.title || project.name || 'DIAGRAMA TÉCNICO CAD';
  ctx.fillText(`⚡ TÉCNICAMZ PRO • ${labelTitle.toUpperCase()}`, 16, targetH - 18);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '10px monospace';
  ctx.textAlign = 'right';
  ctx.fillText('NORMA: IEC 60947 / IEC 60364 • ENQUADRAMENTO 100%', targetW - 16, targetH - 18);
  ctx.restore();

  return canvas.toDataURL(options.format || 'image/png', options.quality || 0.95);
}
