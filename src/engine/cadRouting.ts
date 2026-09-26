// ============================================================================
// TÉCNICAMZ PRO — MOTOR DE ROTEAMENTO DE FIAÇÃO, CURVATURAS BÉZIER & ILHÓS
// Normas: IEC 60446, IEC 60364-5-52 & NBR 5410
// Ancoragem Cirúrgica nos Parafusos dos Bornes, Camada Inferior (Condutor Suave),
// Camada Superior (Terminal Ilhós Tubular Metálico + Capa Isolante por Bitola)
// Efeitos Dinâmicos de Aquecimento Joule (Glow Térmico), Fumaça e Faíscas
// ============================================================================

import { getComponentDef } from './cadEngine';
import { Busbar, getBusbarTerminalWorldPos } from './cadBusbars';

export interface TerminalPosition {
  x: number;
  y: number;
  dir: 'top' | 'bottom' | 'left' | 'right';
  normId: string;
}

export const WIRE_NORM_COLORS: Record<string, { base: string; highlight: string; name: string; isStriped?: boolean }> = {
  L1: { base: '#991b1b', highlight: '#f87171', name: 'L1 • Castanho/Vermelho' },
  L2: { base: '#0f172a', highlight: '#475569', name: 'L2 • Preto' },
  L3: { base: '#57534e', highlight: '#a8a29e', name: 'L3 • Cinza' },
  N: { base: '#0284c7', highlight: '#38bdf8', name: 'N • Neutro Azul' },
  PE: { base: '#15803d', highlight: '#eab308', name: 'PE • Terra Verde/Amarelo', isStriped: true },
  '24+': { base: '#dc2626', highlight: '#fca5a5', name: 'DC+ • Vermelho' },
  '24-': { base: '#1e3a8a', highlight: '#60a5fa', name: 'DC- • Azul Escuro' },
  CTRL: { base: '#d97706', highlight: '#fde047', name: 'Comando • Âmbar' }
};

// Cores das capas plásticas isolantes dos terminais ilhós conforme bitola (DIN 46228-4)
export const FERRULE_COLLAR_COLORS: Record<number, string> = {
  0.75: '#6b7280',
  1.0: '#dc2626',
  1.5: '#1e293b',
  2.5: '#0284c7',
  4.0: '#eab308',
  6.0: '#16a34a',
  10.0: '#b45309',
  16.0: '#ffffff',
  25.0: '#000000',
  35.0: '#dc2626'
};

/**
 * Topologia e Posições Normativas dos Bornes no Equipamento (IEC/DIN):
 * Entradas no Topo, Saídas na Base, Terminais de Controle nas Laterais/Frente
 */
export function getNormativeTerminalOffset(
  comp: any,
  termId: string
): { x: number; y: number; dir: 'top' | 'bottom' | 'left' | 'right' } {
  if (!comp) return { x: 0, y: 0, dir: 'bottom' };
  const d = getComponentDef(comp.code);
  const w = comp.w || 90;
  const h = comp.h || 80;

  if (termId === 'PE' || termId === 'G' || termId === 'FE') {
    return { x: w / 2, y: 0, dir: 'right' };
  }

  // MOTORES (1F / 3F Y-Δ COM 6 BORNES)
  if (d.kind === 'motor3') {
    if (termId === 'U1') return { x: -w * 0.32, y: -h / 2, dir: 'top' };
    if (termId === 'V1') return { x: -w * 0.12, y: -h / 2, dir: 'top' };
    if (termId === 'W1') return { x: w * 0.08, y: -h / 2, dir: 'top' };
    if (termId === 'W2') return { x: -w * 0.32, y: -h / 2 + 12, dir: 'top' };
    if (termId === 'U2') return { x: -w * 0.12, y: -h / 2 + 12, dir: 'top' };
    if (termId === 'V2') return { x: w * 0.08, y: -h / 2 + 12, dir: 'top' };
    if (termId === 'U') return { x: -w * 0.25, y: -h / 2, dir: 'top' };
    if (termId === 'V') return { x: 0, y: -h / 2, dir: 'top' };
    if (termId === 'W') return { x: w * 0.25, y: -h / 2, dir: 'top' };
  }
  if (d.kind === 'motor1') {
    if (termId === 'L') return { x: -w * 0.22, y: -h / 2, dir: 'top' };
    if (termId === 'N') return { x: w * 0.22, y: -h / 2, dir: 'top' };
  }

  // CONTATORES E RELÉS
  if (d.kind === 'contactor') {
    if (termId === 'A1') return { x: -w * 0.38, y: -h / 2, dir: 'top' };
    if (termId === '1') return { x: -w * 0.18, y: -h / 2, dir: 'top' };
    if (termId === '3') return { x: 0, y: -h / 2, dir: 'top' };
    if (termId === '5') return { x: w * 0.18, y: -h / 2, dir: 'top' };
    if (termId === '13') return { x: w * 0.35, y: -h / 2, dir: 'top' };
    if (termId === '21') return { x: w * 0.44, y: -h / 2, dir: 'top' };

    if (termId === 'A2') return { x: -w * 0.38, y: h / 2, dir: 'bottom' };
    if (termId === '2') return { x: -w * 0.18, y: h / 2, dir: 'bottom' };
    if (termId === '4') return { x: 0, y: h / 2, dir: 'bottom' };
    if (termId === '6') return { x: w * 0.18, y: h / 2, dir: 'bottom' };
    if (termId === '14') return { x: w * 0.35, y: h / 2, dir: 'bottom' };
    if (termId === '22') return { x: w * 0.44, y: h / 2, dir: 'bottom' };
  }

  // RELÉ TÉRMICO DE SOBRECARGA
  if (d.kind === 'overload') {
    if (termId === '1') return { x: -w * 0.28, y: -h / 2, dir: 'top' };
    if (termId === '3') return { x: -w * 0.1, y: -h / 2, dir: 'top' };
    if (termId === '5') return { x: w * 0.1, y: -h / 2, dir: 'top' };
    if (termId === '95') return { x: w * 0.28, y: -h / 2, dir: 'top' };
    if (termId === '97') return { x: w * 0.42, y: -h / 2, dir: 'top' };

    if (termId === '2') return { x: -w * 0.28, y: h / 2, dir: 'bottom' };
    if (termId === '4') return { x: -w * 0.1, y: h / 2, dir: 'bottom' };
    if (termId === '6') return { x: w * 0.1, y: h / 2, dir: 'bottom' };
    if (termId === '96') return { x: w * 0.28, y: h / 2, dir: 'bottom' };
    if (termId === '98') return { x: w * 0.42, y: h / 2, dir: 'bottom' };
  }

  // DISJUNTORES E FUSÍVEIS TRIPOLARES (MCB3, FUSE3, MCCB)
  if (d.kind === 'breaker3' || d.kind === 'fuse3' || d.kind === 'mpcb') {
    if (termId === '1' || termId === '1/L1') return { x: -w * 0.33, y: -h / 2, dir: 'top' };
    if (termId === '3' || termId === '3/L2') return { x: 0, y: -h / 2, dir: 'top' };
    if (termId === '5' || termId === '5/L3') return { x: w * 0.33, y: -h / 2, dir: 'top' };
    if (termId === 'N_IN') return { x: w * 0.44, y: -h / 2, dir: 'top' };

    if (termId === '2' || termId === '2/T1') return { x: -w * 0.33, y: h / 2, dir: 'bottom' };
    if (termId === '4' || termId === '4/T2') return { x: 0, y: h / 2, dir: 'bottom' };
    if (termId === '6' || termId === '6/T3') return { x: w * 0.33, y: h / 2, dir: 'bottom' };
    if (termId === 'N_OUT') return { x: w * 0.44, y: h / 2, dir: 'bottom' };
  }

  // DISJUNTORES BIPOLARES (MCB2, RCD)
  if (d.kind === 'breaker2' || d.kind === 'rcd') {
    if (termId === '1') return { x: -w * 0.25, y: -h / 2, dir: 'top' };
    if (termId === '3' || termId === 'N_IN') return { x: w * 0.25, y: -h / 2, dir: 'top' };
    if (termId === '2') return { x: -w * 0.25, y: h / 2, dir: 'bottom' };
    if (termId === '4' || termId === 'N_OUT') return { x: w * 0.25, y: h / 2, dir: 'bottom' };
  }

  // COMUTADOR 3-WAY (PARALELO)
  if (comp.code === 'THREE_WAY') {
    if (termId === 'COM') return { x: 0, y: h / 2, dir: 'bottom' };
    if (termId === '1') return { x: -w * 0.25, y: -h / 2, dir: 'top' };
    if (termId === '2') return { x: w * 0.25, y: -h / 2, dir: 'top' };
  }

  // COMUTADOR 4-WAY (INTERMEDIÁRIO)
  if (comp.code === 'FOUR_WAY') {
    if (termId === '1') return { x: -w * 0.25, y: -h / 2, dir: 'top' };
    if (termId === '2') return { x: w * 0.25, y: -h / 2, dir: 'top' };
    if (termId === '3') return { x: -w * 0.25, y: h / 2, dir: 'bottom' };
    if (termId === '4') return { x: w * 0.25, y: h / 2, dir: 'bottom' };
  }

  // DISPOSITIVOS MONOPOLARES PADRÃO (MCB1, FUSE, INTERRUPTOR)
  if (termId === '1' || termId === 'L' || termId === 'L_IN' || termId === 'IN' || termId === 'V+' || termId === '+' || termId === 'PV+') {
    return { x: -w * 0.22, y: -h / 2, dir: 'top' };
  }
  if (termId === 'N' || termId === 'N_IN' || termId === 'V-' || termId === '-' || termId === 'PV-') {
    return { x: w * 0.22, y: -h / 2, dir: 'top' };
  }
  if (termId === '2' || termId === 'LOAD' || termId === 'OUT' || termId === 'L_OUT' || termId === 'OUT+') {
    return { x: -w * 0.22, y: h / 2, dir: 'bottom' };
  }
  if (termId === 'N_OUT' || termId === 'OUT-') {
    return { x: w * 0.22, y: h / 2, dir: 'bottom' };
  }

  return { x: 0, y: h / 2, dir: 'bottom' };
}

export function getTerminalWorldPos(comp: any, termId: string): TerminalPosition {
  const off = getNormativeTerminalOffset(comp, termId);
  const rotRad = ((comp.rot || 0) * Math.PI) / 180;
  const cos = Math.cos(rotRad);
  const sin = Math.sin(rotRad);

  const rx = off.x * cos - off.y * sin;
  const ry = off.x * sin + off.y * cos;

  return {
    x: comp.x + rx,
    y: comp.y + ry,
    dir: off.dir,
    normId: termId
  };
}

export function getNodeWorldPos(
  nodeId: string,
  termId: string,
  components: any[],
  busbars: Busbar[] = []
): TerminalPosition {
  const comp = components?.find(c => c.id === nodeId);
  if (comp) return getTerminalWorldPos(comp, termId);

  const bb = busbars?.find(b => b.id === nodeId);
  if (bb) {
    const bbPos = getBusbarTerminalWorldPos(bb, termId);
    if (bbPos) return bbPos;
  }

  return { x: 0, y: 0, dir: 'bottom', normId: termId };
}

/**
 * Algoritmo Ortogonal Manhattan para Canaletas de Painel com Desvio Ordenado
 */
export function calculateManhattanPath(
  pA: { x: number; y: number; dir?: 'top' | 'bottom' | 'left' | 'right' },
  pB: { x: number; y: number; dir?: 'top' | 'bottom' | 'left' | 'right' },
  wireIndex: number = 0,
  waypoints: { x: number; y: number }[] = []
): { x: number; y: number }[] {
  if (waypoints && waypoints.length > 0) {
    const fullPoints: { x: number; y: number }[] = [pA];
    let prev = pA;

    waypoints.forEach(wp => {
      fullPoints.push({ x: wp.x, y: prev.y });
      fullPoints.push({ x: wp.x, y: wp.y });
      prev = wp;
    });

    fullPoints.push({ x: pB.x, y: prev.y });
    fullPoints.push(pB);
    return fullPoints;
  }

  const stub = 20;
  const dirA = pA.dir || 'bottom';
  const dirB = pB.dir || 'top';

  const sA = {
    x: pA.x + (dirA === 'right' ? stub : dirA === 'left' ? -stub : 0),
    y: pA.y + (dirA === 'bottom' ? stub : dirA === 'top' ? -stub : 0)
  };

  const sB = {
    x: pB.x + (dirB === 'right' ? stub : dirB === 'left' ? -stub : 0),
    y: pB.y + (dirB === 'bottom' ? stub : dirB === 'top' ? -stub : 0)
  };

  const points: { x: number; y: number }[] = [pA, sA];
  const offset = ((wireIndex % 6) - 2.5) * 5;

  if (dirA === 'bottom' && dirB === 'top') {
    if (sA.y <= sB.y) {
      const yMid = sA.y + (sB.y - sA.y) * 0.5 + offset;
      points.push({ x: sA.x, y: yMid });
      points.push({ x: sB.x, y: yMid });
    } else {
      const xDetour = Math.max(sA.x, sB.x) + 40 + Math.abs(offset);
      points.push({ x: sA.x, y: sA.y + 15 });
      points.push({ x: xDetour, y: sA.y + 15 });
      points.push({ x: xDetour, y: sB.y - 15 });
      points.push({ x: sB.x, y: sB.y - 15 });
    }
  } else if (dirA === 'top' && dirB === 'bottom') {
    if (sA.y >= sB.y) {
      const yMid = sA.y + (sB.y - sA.y) * 0.5 + offset;
      points.push({ x: sA.x, y: yMid });
      points.push({ x: sB.x, y: yMid });
    } else {
      const xDetour = Math.min(sA.x, sB.x) - 40 - Math.abs(offset);
      points.push({ x: sA.x, y: sA.y - 15 });
      points.push({ x: xDetour, y: sA.y - 15 });
      points.push({ x: xDetour, y: sB.y + 15 });
      points.push({ x: sB.x, y: sB.y + 15 });
    }
  } else if (dirA === 'bottom' && dirB === 'bottom') {
    const yMax = Math.max(sA.y, sB.y) + 25 + Math.abs(offset);
    points.push({ x: sA.x, y: yMax });
    points.push({ x: sB.x, y: yMax });
  } else if (dirA === 'top' && dirB === 'top') {
    const yMin = Math.min(sA.y, sB.y) - 25 - Math.abs(offset);
    points.push({ x: sA.x, y: yMin });
    points.push({ x: sB.x, y: yMin });
  } else {
    const xMid = sA.x + (sB.x - sA.x) * 0.5;
    points.push({ x: xMid, y: sA.y });
    points.push({ x: xMid, y: sB.y });
  }

  points.push(sB);
  points.push(pB);

  const clean: { x: number; y: number }[] = [];
  for (let i = 0; i < points.length; i++) {
    const pt = points[i];
    if (clean.length > 0) {
      const prev = clean[clean.length - 1];
      if (Math.abs(prev.x - pt.x) < 0.5 && Math.abs(prev.y - pt.y) < 0.5) continue;
    }
    clean.push(pt);
  }

  return clean;
}

export interface CurvedWirePath {
  start: TerminalPosition;
  cp1: { x: number; y: number };
  cp2: { x: number; y: number };
  end: TerminalPosition;
  rawPoints?: { x: number; y: number }[];
}

export function calculateCurvedPath(
  posA: TerminalPosition,
  posB: TerminalPosition,
  wireIndex: number = 0
): CurvedWirePath {
  const rawPoints = calculateManhattanPath(posA, posB, wireIndex);
  return {
    start: posA,
    cp1: rawPoints[1] || posA,
    cp2: rawPoints[rawPoints.length - 2] || posB,
    end: posB,
    rawPoints
  };
}

export function getBezierPoints(
  path: CurvedWirePath | { p1: { x: number; y: number }; cp1: { x: number; y: number }; cp2: { x: number; y: number }; p2: { x: number; y: number } } | any,
  numSamples: number = 18
): { x: number; y: number }[] {
  if (path.rawPoints && path.rawPoints.length > 0) {
    return path.rawPoints;
  }
  const p0 = path.start || path.p1 || { x: 0, y: 0 };
  const p1 = path.cp1 || p0;
  const p2 = path.cp2 || p1;
  const p3 = path.end || path.p2 || p2;

  const points: { x: number; y: number }[] = [];
  for (let i = 0; i <= numSamples; i++) {
    const t = i / numSamples;
    const invT = 1 - t;
    const t2 = t * t;
    const invT2 = invT * invT;

    const x =
      invT2 * invT * p0.x +
      3 * invT2 * t * p1.x +
      3 * invT * t2 * p2.x +
      t2 * t * p3.x;

    const y =
      invT2 * invT * p0.y +
      3 * invT2 * t * p1.y +
      3 * invT * t2 * p2.y +
      t2 * t * p3.y;

    points.push({ x, y });
  }

  return points;
}

export function calculateCurvedWirePath(
  posA: TerminalPosition,
  posB: TerminalPosition,
  wireIndex: number = 0
): { p1: { x: number; y: number }; cp1: { x: number; y: number }; cp2: { x: number; y: number }; p2: { x: number; y: number } } {
  const dx = posB.x - posA.x;
  const dy = posB.y - posA.y;
  const dist = Math.hypot(dx, dy);
  const curvature = Math.min(80, Math.max(30, dist * 0.35));

  const cp1 = {
    x: posA.x + (posA.dir === 'right' ? curvature : posA.dir === 'left' ? -curvature : 0),
    y: posA.y + (posA.dir === 'bottom' ? curvature : posA.dir === 'top' ? -curvature : 0)
  };

  const cp2 = {
    x: posB.x + (posB.dir === 'right' ? curvature : posB.dir === 'left' ? -curvature : 0),
    y: posB.y + (posB.dir === 'bottom' ? curvature : posB.dir === 'top' ? -curvature : 0)
  };

  return { p1: posA, cp1, cp2, p2: posB };
}

// ----------------------------------------------------------------------------
// RENDERIZAÇÃO NA CAMADA SUPERIOR: TERMINAL ILHÓS TUBULAR PRATEADO & CAPA
// ----------------------------------------------------------------------------

export function renderFerruleTerminal(
  ctx: CanvasRenderingContext2D,
  pos: { x: number; y: number },
  dir: 'top' | 'bottom' | 'left' | 'right',
  gauge: number | string = 2.5,
  cam: { zoom: number },
  isLive = false,
  isOverheated = false
): void {
  const numGauge = typeof gauge === 'number' ? gauge : parseFloat(String(gauge)) || 2.5;
  const zoom = cam.zoom;
  ctx.save();
  ctx.translate(pos.x, pos.y);

  if (dir === 'top') ctx.rotate(0);
  else if (dir === 'bottom') ctx.rotate(Math.PI);
  else if (dir === 'left') ctx.rotate(-Math.PI / 2);
  else if (dir === 'right') ctx.rotate(Math.PI / 2);

  const ferruleW = Math.max(2.8, (numGauge <= 2.5 ? 3.6 : numGauge <= 6 ? 4.8 : 6.2) * zoom);
  const tubeLen = 7 * zoom;
  const collarLen = 5 * zoom;
  const collarColor = FERRULE_COLLAR_COLORS[numGauge] || '#0284c7';

  // 1. Tubo Metálico Prateado de Cobre Eletrolítico Estanhado
  const tubeGrad = ctx.createLinearGradient(-ferruleW / 2, 0, ferruleW / 2, 0);
  tubeGrad.addColorStop(0, '#94a3b8');
  tubeGrad.addColorStop(0.3, '#f8fafc');
  tubeGrad.addColorStop(0.7, '#cbd5e1');
  tubeGrad.addColorStop(1, '#64748b');
  ctx.fillStyle = tubeGrad;
  ctx.fillRect(-ferruleW / 2, 0, ferruleW, tubeLen);
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 0.6 * zoom;
  ctx.strokeRect(-ferruleW / 2, 0, ferruleW, tubeLen);

  // 2. Capa Plástica Isolante Colorida (Collar)
  const collarW = ferruleW + 2.2 * zoom;
  ctx.fillStyle = isOverheated ? '#b91c1c' : collarColor;
  ctx.beginPath();
  ctx.roundRect(-collarW / 2, tubeLen - 0.5 * zoom, collarW, collarLen, 1.5 * zoom);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.lineWidth = 0.8 * zoom;
  ctx.stroke();

  // Brilho especular no tubo
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.lineWidth = 0.6 * zoom;
  ctx.beginPath();
  ctx.moveTo(0, 1 * zoom);
  ctx.lineTo(0, tubeLen - 1 * zoom);
  ctx.stroke();

  ctx.restore();
}

// ----------------------------------------------------------------------------
// RENDERIZAÇÃO NA CAMADA INFERIOR: CONDUTORES COM CURVAS BÉZIER SUAVES
// ----------------------------------------------------------------------------

export function renderCurvedWireBack(
  ctx: CanvasRenderingContext2D,
  curvedPath: CurvedWirePath | { p1: { x: number; y: number }; cp1: { x: number; y: number }; cp2: { x: number; y: number }; p2: { x: number; y: number } } | any,
  options: {
    wireType?: string;
    gauge?: number;
    cam: { zoom: number };
    toScreen?: (p: { x: number; y: number }) => { x: number; y: number };
    isLive?: boolean;
    isSelected?: boolean;
    isOverheated?: boolean;
    isBurned?: boolean;
    animTick?: number;
    [key: string]: any;
  }
): void {
  const {
    wireType = 'L1',
    gauge = 2.5,
    cam,
    isLive = false,
    isSelected = false,
    isOverheated = false,
    isBurned = false,
    animTick = 0
  } = options;

  const p1 = (curvedPath as any).p1 || (curvedPath as any).start;
  const p2 = (curvedPath as any).p2 || (curvedPath as any).end;
  const cp1 = curvedPath.cp1;
  const cp2 = curvedPath.cp2;

  const norm = WIRE_NORM_COLORS[wireType] || WIRE_NORM_COLORS['L1'];
  const wireW = Math.max(2.4, (gauge <= 2.5 ? 3.4 : gauge <= 6 ? 4.4 : 5.8) * cam.zoom);

  ctx.save();

  // 1. Sombra projetada sob o condutor
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.lineWidth = wireW + 2 * cam.zoom;
  ctx.lineCap = 'round';
  ctx.save();
  ctx.translate(2 * cam.zoom, 3 * cam.zoom);
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, p2.x, p2.y);
  ctx.stroke();
  ctx.restore();

  // 2. Brilho Térmico (Joule Glow) quando T > 60°C
  if (isOverheated) {
    const pulse = (Math.sin(animTick * 0.15) + 1) * 0.5;
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = (12 + pulse * 14) * cam.zoom;
    ctx.strokeStyle = isBurned ? '#1c1917' : `rgb(${Math.round(235 + pulse * 20)}, ${Math.round(50 + pulse * 80)}, 15)`;
  } else {
    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = isBurned ? '#18181b' : norm.base;
  }

  ctx.lineWidth = wireW;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, p2.x, p2.y);
  ctx.stroke();
  ctx.shadowColor = 'transparent';

  // 3. Faixa listrada amarelo/verde para condutores de proteção PE
  if (norm.isStriped && !isOverheated && !isBurned) {
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = wireW * 0.85;
    ctx.setLineDash([8 * cam.zoom, 8 * cam.zoom]);
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, p2.x, p2.y);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // 4. Friso de Luz Especular Tridimensional
  ctx.strokeStyle = isOverheated ? '#fed7aa' : isBurned ? '#44403c' : norm.highlight;
  ctx.lineWidth = Math.max(0.8, 1.2 * cam.zoom);
  ctx.globalAlpha = 0.65;
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, p2.x, p2.y);
  ctx.stroke();
  ctx.globalAlpha = 1.0;

  // 5. Pulso Dinâmico de Corrente quando energizado
  if (isLive && !isBurned) {
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = Math.max(1.1, 1.8 * cam.zoom);
    ctx.setLineDash([6 * cam.zoom, 10 * cam.zoom]);
    ctx.lineDashOffset = -animTick * 1.8;
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, p2.x, p2.y);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  ctx.restore();
}

/**
 * RENDERIZAÇÃO COMPLETA: Fio na camada inferior e Terminais Ilhós na camada superior
 */
export function renderCurvedWireWithFerrules(
  ctx: CanvasRenderingContext2D,
  curvedPath: { p1: { x: number; y: number }; cp1: { x: number; y: number }; cp2: { x: number; y: number }; p2: { x: number; y: number } },
  dirA: 'top' | 'bottom' | 'left' | 'right',
  dirB: 'top' | 'bottom' | 'left' | 'right',
  options: {
    wireType?: string;
    gauge?: number;
    cam: { zoom: number };
    isLive?: boolean;
    isSelected?: boolean;
    isOverheated?: boolean;
    isBurned?: boolean;
    animTick?: number;
    [key: string]: any;
  }
): void {
  renderCurvedWireBack(ctx, curvedPath, options);

  renderFerruleTerminal(
    ctx,
    curvedPath.p1,
    dirA,
    options.gauge || 2.5,
    options.cam,
    options.isLive,
    options.isOverheated
  );

  renderFerruleTerminal(
    ctx,
    curvedPath.p2,
    dirB,
    options.gauge || 2.5,
    options.cam,
    options.isLive,
    options.isOverheated
  );
}

export function drawProfessionalWire(
  ctx: CanvasRenderingContext2D,
  screenPoints: { x: number; y: number }[],
  wireType = 'L1',
  cam: { zoom: number },
  isLive = false,
  isSelected = false,
  animTick = 0,
  isOverheated = false
): void {
  if (!screenPoints || screenPoints.length < 2) return;
  const p1 = screenPoints[0];
  const p2 = screenPoints[screenPoints.length - 1];
  const cp1 = { x: (p1.x + p2.x) / 2, y: p1.y + 40 * cam.zoom };
  const cp2 = { x: (p1.x + p2.x) / 2, y: p2.y - 40 * cam.zoom };

  renderCurvedWireWithFerrules(
    ctx,
    { p1, cp1, cp2, p2 },
    'bottom',
    'top',
    { wireType, cam, isLive, isSelected, isOverheated, animTick }
  );
}

export interface JunctionDot {
  x: number;
  y: number;
  netType: string;
}

export function findJunctionDots(
  components: any[],
  wires: any[],
  busbars: Busbar[] = []
): JunctionDot[] {
  if (!Array.isArray(wires)) return [];
  const pointCounts = new Map<string, { count: number; x: number; y: number; netType: string }>();

  wires.forEach((wire, wireIdx) => {
    const posA = getNodeWorldPos(wire.a?.c, wire.a?.t, components, busbars);
    const posB = getNodeWorldPos(wire.b?.c, wire.b?.t, components, busbars);
    const path = calculateManhattanPath(posA, posB, wireIdx, wire.waypoints);

    path.forEach((pt, idx) => {
      if (idx === 0 || idx === path.length - 1) {
        const key = `${Math.round(pt.x / 6) * 6},${Math.round(pt.y / 6) * 6}`;
        const existing = pointCounts.get(key);
        if (existing) {
          existing.count += 1;
        } else {
          pointCounts.set(key, {
            count: 1,
            x: pt.x,
            y: pt.y,
            netType: wire.type || 'L1'
          });
        }
      }
    });
  });

  const dots: JunctionDot[] = [];
  pointCounts.forEach(entry => {
    if (entry.count >= 3) {
      dots.push({
        x: entry.x,
        y: entry.y,
        netType: entry.netType
      });
    }
  });

  return dots;
}

export function autoOrganizeCircuitWiring(project: any): any {
  if (!project || !Array.isArray(project.components)) return project;
  const GRID_SNAP = 40;
  const updatedComponents = project.components.map((c: any, idx: number) => {
    let nx = Math.round(c.x / GRID_SNAP) * GRID_SNAP;
    let ny = Math.round(c.y / GRID_SNAP) * GRID_SNAP;

    for (let i = 0; i < idx; i++) {
      const prev = project.components[i];
      if (Math.abs(nx - prev.x) < 80 && Math.abs(ny - prev.y) < 60) {
        nx += 120;
      }
    }

    return { ...c, x: nx, y: ny };
  });

  return { ...project, components: updatedComponents, updated: Date.now() };
}
