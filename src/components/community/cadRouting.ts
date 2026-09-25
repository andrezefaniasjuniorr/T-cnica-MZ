// ============================================================================
// TÉCNICAMZ PRO — MOTOR DE ROTEAMENTO ORTOGONAL (MANHATTAN) & IEC/DIN TOPOLOGY
// Normas: IEC 60446 (Cores de Condutores), IEC 60364-5-52 (Fiação de Quadros)
// Suporte a Curvaturas Suaves (Fillet Arcs), Destaque 3D Cilíndrico e Ilhós
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
  DC_POS: { base: '#dc2626', highlight: '#fca5a5', name: 'DC+ • Vermelho' },
  DC_NEG: { base: '#1e3a8a', highlight: '#60a5fa', name: 'DC- • Azul Escuro' },
  CTRL: { base: '#d97706', highlight: '#fde047', name: 'Comando • Âmbar' }
};

/**
 * Topologia e Anatomia Normativa dos Componentes Conforme IEC/DIN:
 * - Entradas: Exclusivamente no Topo (Superior)
 * - Saídas: Exclusivamente na Base (Inferior)
 * - Terra / PE: Exclusivamente na Lateral (Direita)
 * - Nenhuma conexão lateral para fases ou comando
 */
export function getNormativeTerminalOffset(
  comp: any,
  termId: string
): { x: number; y: number; dir: 'top' | 'bottom' | 'left' | 'right' } {
  if (!comp) return { x: 0, y: 0, dir: 'bottom' };
  const d = getComponentDef(comp.code);
  const w = comp.w || 90;
  const h = comp.h || 80;
  const termEntry = d.terminals ? d.terminals.find(x => x[0] === termId) : null;
  const func = termEntry ? termEntry[1] : '';

  // 1. Terra de Proteção (PE / GND): Exclusivamente Lateral
  if (termId === 'PE' || termId === 'G' || func === 'PE') {
    return { x: w / 2, y: 0, dir: 'right' };
  }

  // 2. Motores Elétricos: Bornes de alimentação U, V, W exclusivamente no topo
  if (d.kind === 'motor3') {
    if (termId === 'U') return { x: -w * 0.25, y: -h / 2, dir: 'top' };
    if (termId === 'V') return { x: 0, y: -h / 2, dir: 'top' };
    if (termId === 'W') return { x: w * 0.25, y: -h / 2, dir: 'top' };
  }
  if (d.kind === 'motor1') {
    if (termId === 'L') return { x: -w * 0.22, y: -h / 2, dir: 'top' };
    if (termId === 'N') return { x: w * 0.22, y: -h / 2, dir: 'top' };
  }
  if (d.kind === 'motorDC') {
    if (termId === '+') return { x: -w * 0.22, y: -h / 2, dir: 'top' };
    if (termId === '-') return { x: w * 0.22, y: -h / 2, dir: 'top' };
  }

  // 3. Contactores de Potência (IEC 60947-4-1)
  if (d.kind === 'contactor') {
    if (termId === 'A1') return { x: -w * 0.38, y: -h / 2, dir: 'top' };
    if (termId === '1') return { x: -w * 0.18, y: -h / 2, dir: 'top' };
    if (termId === '3') return { x: 0, y: -h / 2, dir: 'top' };
    if (termId === '5') return { x: w * 0.18, y: -h / 2, dir: 'top' };
    if (termId === '13') return { x: w * 0.33, y: -h / 2, dir: 'top' };
    if (termId === '21') return { x: w * 0.42, y: -h / 2, dir: 'top' };

    if (termId === 'A2') return { x: -w * 0.38, y: h / 2, dir: 'bottom' };
    if (termId === '2') return { x: -w * 0.18, y: h / 2, dir: 'bottom' };
    if (termId === '4') return { x: 0, y: h / 2, dir: 'bottom' };
    if (termId === '6') return { x: w * 0.18, y: h / 2, dir: 'bottom' };
    if (termId === '14') return { x: w * 0.33, y: h / 2, dir: 'bottom' };
    if (termId === '22') return { x: w * 0.42, y: h / 2, dir: 'bottom' };
  }

  // 4. Relé Térmico de Sobrecarga (OLR)
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

  // 5. Disjuntores e Seccionadoras Tetrapolares / Tripolares com Neutro (3P+N: MCB3, MCCB, FU3)
  if (d.kind === 'breaker3' || d.kind === 'fuse3') {
    if (termId === '1') return { x: -w * 0.33, y: -h / 2, dir: 'top' };
    if (termId === '3') return { x: -w * 0.11, y: -h / 2, dir: 'top' };
    if (termId === '5') return { x: w * 0.11, y: -h / 2, dir: 'top' };
    if (termId === 'N' || termId === 'N_IN') return { x: w * 0.33, y: -h / 2, dir: 'top' };

    if (termId === '2') return { x: -w * 0.33, y: h / 2, dir: 'bottom' };
    if (termId === '4') return { x: -w * 0.11, y: h / 2, dir: 'bottom' };
    if (termId === '6') return { x: w * 0.11, y: h / 2, dir: 'bottom' };
    if (termId === 'N_OUT') return { x: w * 0.33, y: h / 2, dir: 'bottom' };
  }

  // 5.5 Disjuntor Bipolar com Neutro (2P+N: MCB2)
  if (d.kind === 'breaker2') {
    if (termId === '1') return { x: -w * 0.3, y: -h / 2, dir: 'top' };
    if (termId === '3') return { x: 0, y: -h / 2, dir: 'top' };
    if (termId === 'N' || termId === 'N_IN') return { x: w * 0.3, y: -h / 2, dir: 'top' };

    if (termId === '2') return { x: -w * 0.3, y: h / 2, dir: 'bottom' };
    if (termId === '4') return { x: 0, y: h / 2, dir: 'bottom' };
    if (termId === 'N_OUT') return { x: w * 0.3, y: h / 2, dir: 'bottom' };
  }

  // 6. Disjuntores Unipolares com Neutro (1P+N: MCB1, RCBO)
  if (d.kind === 'breaker' || d.kind === 'rcbo') {
    if (termId === '1' || termId === 'L' || func === 'IN') {
      return { x: -w * 0.22, y: -h / 2, dir: 'top' };
    }
    if (termId === 'N' || termId === 'N_IN') {
      return { x: w * 0.22, y: -h / 2, dir: 'top' };
    }
    if (termId === '2' || func === 'OUT') {
      return { x: -w * 0.22, y: h / 2, dir: 'bottom' };
    }
    if (termId === 'N_OUT') {
      return { x: w * 0.22, y: h / 2, dir: 'bottom' };
    }
    return { x: 0, y: h / 2, dir: 'bottom' };
  }

  // 6.5 Fusíveis Simples
  if (d.kind === 'fuse') {
    if (termId === '1' || func === 'IN') return { x: 0, y: -h / 2, dir: 'top' };
    return { x: 0, y: h / 2, dir: 'bottom' };
  }

  // 6.8 Dispositivo Contra Surtos DPS (Monofásico L+N+PE e Trifásico 3P+N+PE)
  if (d.kind === 'spd') {
    if (termId === 'L' || termId === '1') return { x: -w * 0.25, y: -h / 2, dir: 'top' };
    if (termId === 'L1') return { x: -w * 0.33, y: -h / 2, dir: 'top' };
    if (termId === 'L2') return { x: -w * 0.11, y: -h / 2, dir: 'top' };
    if (termId === 'L3') return { x: w * 0.11, y: -h / 2, dir: 'top' };
    if (termId === 'N' || termId === 'N_IN') return { x: w * 0.3, y: -h / 2, dir: 'top' };
    if (termId === 'PE') return { x: 0, y: h / 2, dir: 'bottom' };
  }

  // 7. Disjuntor Diferencial Residual (RCD / IDR Tetrapolar 3P+N e Bipolar 1P+N)
  if (d.kind === 'rcd' || d.kind === 'rcd4') {
    if (d.kind === 'rcd4' || d.terminals.length >= 8) {
      if (termId === '1') return { x: -w * 0.33, y: -h / 2, dir: 'top' };
      if (termId === '3') return { x: -w * 0.11, y: -h / 2, dir: 'top' };
      if (termId === '5') return { x: w * 0.11, y: -h / 2, dir: 'top' };
      if (termId === 'N' || termId === 'N_IN') return { x: w * 0.33, y: -h / 2, dir: 'top' };

      if (termId === '2') return { x: -w * 0.33, y: h / 2, dir: 'bottom' };
      if (termId === '4') return { x: -w * 0.11, y: h / 2, dir: 'bottom' };
      if (termId === '6') return { x: w * 0.11, y: h / 2, dir: 'bottom' };
      if (termId === 'N_OUT') return { x: w * 0.33, y: h / 2, dir: 'bottom' };
    } else {
      // IDR Bipolar (1P+N)
      if (termId === '1') return { x: -w * 0.22, y: -h / 2, dir: 'top' };
      if (termId === 'N' || termId === 'N_IN') return { x: w * 0.22, y: -h / 2, dir: 'top' };
      if (termId === '2') return { x: -w * 0.22, y: h / 2, dir: 'bottom' };
      if (termId === 'N_OUT') return { x: w * 0.22, y: h / 2, dir: 'bottom' };
    }
  }

  // 7.5 Aterramento Físico (Haste Copperweld, Caixa de Inspeção, Cobre Nu)
  if (d.kind === 'earth_rod') {
    return { x: 0, y: -h / 2, dir: 'top' };
  }
  if (d.kind === 'earth_pit') {
    if (termId === 'PE1') return { x: -w * 0.28, y: -h / 2, dir: 'top' };
    if (termId === 'PE2') return { x: 0, y: -h / 2, dir: 'top' };
    if (termId === 'PE3') return { x: w * 0.28, y: -h / 2, dir: 'top' };
    if (termId === 'GND') return { x: 0, y: h / 2, dir: 'bottom' };
  }
  if (d.kind === 'bare_copper') {
    if (termId === 'IN') return { x: -w * 0.35, y: -h / 2, dir: 'top' };
    if (termId === 'OUT') return { x: w * 0.35, y: h / 2, dir: 'bottom' };
  }

  // 7.8 Caixa de Derivação com Bornes Rápidos WAGO
  if (d.kind === 'junction_box') {
    if (termId === 'L_IN') return { x: -w * 0.32, y: -h / 2, dir: 'top' };
    if (termId === 'L_OUT1') return { x: -w * 0.32, y: h / 2, dir: 'bottom' };
    if (termId === 'L_OUT2') return { x: -w / 2, y: 0, dir: 'left' };
    if (termId === 'N_IN') return { x: 0, y: -h / 2, dir: 'top' };
    if (termId === 'N_OUT1') return { x: 0, y: h / 2, dir: 'bottom' };
    if (termId === 'N_OUT2') return { x: 0, y: 0, dir: 'top' };
    if (termId === 'PE_IN') return { x: w * 0.32, y: -h / 2, dir: 'top' };
    if (termId === 'PE_OUT') return { x: w * 0.32, y: h / 2, dir: 'bottom' };
  }

  // 7.9 Cargas Especiais 3D (Ar Condicionado, Chuveiro, Fogão, Micro-ondas)
  if (d.kind === 'load_ac' || d.kind === 'load_shower' || d.kind === 'load_microwave') {
    if (termId === 'L' || termId === '1') return { x: -w * 0.26, y: -h / 2, dir: 'top' };
    if (termId === 'N') return { x: 0, y: -h / 2, dir: 'top' };
    if (termId === 'PE') return { x: w * 0.26, y: -h / 2, dir: 'top' };
  }
  if (d.kind === 'load_cooktop') {
    if (termId === '1') return { x: -w * 0.33, y: -h / 2, dir: 'top' };
    if (termId === '3') return { x: -w * 0.11, y: -h / 2, dir: 'top' };
    if (termId === 'N') return { x: w * 0.11, y: -h / 2, dir: 'top' };
    if (termId === 'PE') return { x: w * 0.33, y: -h / 2, dir: 'top' };
  }

  // 8. Botões de Comando e Parada de Emergência (BTN_NO, BTN_NC, E_STOP)
  if (d.kind === 'pushbutton' || d.kind === 'estop' || d.cat === 'command') {
    if (termId === '1' || termId === '13' || termId === '11') {
      return { x: -w * 0.28, y: -h / 2, dir: 'top' };
    }
    if (termId === '2' || termId === '14' || termId === '12') {
      return { x: w * 0.28, y: h / 2, dir: 'bottom' };
    }
  }

  // 9. Relé Temporizador (TIMER, RELAY)
  if (d.kind === 'timer' || d.kind === 'relay') {
    if (termId === 'A1') return { x: -w * 0.35, y: -h / 2, dir: 'top' };
    if (termId === '15' || termId === 'COM') return { x: 0, y: -h / 2, dir: 'top' };
    if (termId === 'A2') return { x: -w * 0.35, y: h / 2, dir: 'bottom' };
    if (termId === '16' || termId === 'NC') return { x: -w * 0.15, y: h / 2, dir: 'bottom' };
    if (termId === '18' || termId === 'NO') return { x: w * 0.25, y: h / 2, dir: 'bottom' };
  }

  // 10. Fontes de Alimentação (SRC_AC3, SRC_AC1, SRC_DC24, BAT)
  if (d.kind === 'source') {
    if (d.sourceType === 'AC3') {
      if (termId === 'L1') return { x: -w * 0.35, y: h / 2, dir: 'bottom' };
      if (termId === 'L2') return { x: -w * 0.12, y: h / 2, dir: 'bottom' };
      if (termId === 'L3') return { x: w * 0.12, y: h / 2, dir: 'bottom' };
      if (termId === 'N') return { x: w * 0.35, y: h / 2, dir: 'bottom' };
      if (termId === 'PE') return { x: w / 2, y: 0, dir: 'right' };
    } else {
      const idx = d.terminals.findIndex(x => x[0] === termId);
      const frac = d.terminals.length > 1 ? (idx / (d.terminals.length - 1) - 0.5) * 0.6 : 0;
      return { x: w * frac, y: h / 2, dir: 'bottom' };
    }
  }

  // 11. Cargas / Lâmpadas / Sinalizadores
  if (d.kind === 'lamp' || d.kind === 'load' || d.cat === 'loads' || d.code?.startsWith('PILOT')) {
    const idx = d.terminals?.findIndex(x => x[0] === termId) ?? 0;
    if (idx === 0 || termId === '+' || termId === '1' || termId === 'X1' || termId === 'L') {
      return { x: 0, y: -h / 2, dir: 'top' };
    }
    return { x: 0, y: h / 2, dir: 'bottom' };
  }

  // 12. Regra Geral de Fallback Normativo:
  const idx = d.terminals ? d.terminals.findIndex(x => x[0] === termId) : 0;
  const isInput = func === 'IN' || func === 'COM' || idx % 2 === 0;
  const colRatio = Math.max(1, Math.ceil((d.terminals?.length || 2) / 2));
  const colIndex = Math.floor(idx / 2);
  const xOffset = colRatio > 1 ? ((colIndex / (colRatio - 1)) - 0.5) * (w * 0.7) : 0;

  return {
    x: xOffset,
    y: isInput ? -h / 2 : h / 2,
    dir: isInput ? 'top' : 'bottom'
  };
}

/**
 * Retorna as coordenadas mundiais de um terminal de componente com rotação
 */
export function getTerminalWorldPos(comp: any, termId: string): TerminalPosition {
  if (!comp) return { x: 0, y: 0, dir: 'bottom', normId: termId };
  const offset = getNormativeTerminalOffset(comp, termId);
  const rad = ((comp.rot || 0) * Math.PI) / 180;
  const rx = offset.x * Math.cos(rad) - offset.y * Math.sin(rad);
  const ry = offset.x * Math.sin(rad) + offset.y * Math.cos(rad);

  let dir = offset.dir;
  const rotDeg = ((comp.rot || 0) % 360 + 360) % 360;
  if (rotDeg === 90) {
    if (dir === 'top') dir = 'right';
    else if (dir === 'bottom') dir = 'left';
    else if (dir === 'right') dir = 'bottom';
    else if (dir === 'left') dir = 'top';
  } else if (rotDeg === 180) {
    if (dir === 'top') dir = 'bottom';
    else if (dir === 'bottom') dir = 'top';
    else if (dir === 'right') dir = 'left';
    else if (dir === 'left') dir = 'right';
  } else if (rotDeg === 270) {
    if (dir === 'top') dir = 'left';
    else if (dir === 'bottom') dir = 'right';
    else if (dir === 'right') dir = 'top';
    else if (dir === 'left') dir = 'bottom';
  }

  return {
    x: comp.x + rx,
    y: comp.y + ry,
    dir,
    normId: termId
  };
}

/**
 * Função Unificada de Resolução de Coordenadas de Terminais:
 * Suporta tanto componentes padrão como bornes de barramentos (L1, L2, L3, N, PE)!
 */
export function getNodeWorldPos(
  nodeId: string,
  termId: string,
  components: any[],
  busbars: Busbar[] = []
): TerminalPosition {
  // 1. Procura primeiro nos componentes
  const comp = components?.find(c => c.id === nodeId);
  if (comp) {
    return getTerminalWorldPos(comp, termId);
  }

  // 2. Procura nos barramentos
  const bb = busbars?.find(b => b.id === nodeId);
  if (bb) {
    const bbPos = getBusbarTerminalWorldPos(bb, termId);
    if (bbPos) return bbPos;
  }

  // Fallback seguro
  return { x: 0, y: 0, dir: 'bottom', normId: termId };
}

/**
 * Algoritmo de Roteamento Ortogonal Manhattan (90° Manhattan Wiring):
 * Respeita stubs de saída e permite waypoints intermediários.
 */
export function calculateManhattanPath(
  pA: { x: number; y: number; dir?: 'top' | 'bottom' | 'left' | 'right' },
  pB: { x: number; y: number; dir?: 'top' | 'bottom' | 'left' | 'right' },
  wireIndex: number = 0,
  waypoints: { x: number; y: number }[] = []
): { x: number; y: number }[] {
  // Se houver waypoints definidos pelo usuário (ex: passando pelas canaletas laterais)
  if (waypoints && waypoints.length > 0) {
    const fullPoints: { x: number; y: number }[] = [pA];
    let prev = pA;

    waypoints.forEach(wp => {
      // Degrau ortogonal até o waypoint
      fullPoints.push({ x: wp.x, y: prev.y });
      fullPoints.push({ x: wp.x, y: wp.y });
      prev = wp;
    });

    fullPoints.push({ x: pB.x, y: prev.y });
    fullPoints.push(pB);

    return fullPoints;
  }

  const stub = 18;
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
  const offset = ((wireIndex % 5) - 2) * 6;

  if (dirA === 'bottom' && dirB === 'top') {
    if (sA.y <= sB.y) {
      const yMid = sA.y + (sB.y - sA.y) * 0.5 + offset;
      points.push({ x: sA.x, y: yMid });
      points.push({ x: sB.x, y: yMid });
    } else {
      const xDetour = Math.max(sA.x, sB.x) + 36 + Math.abs(offset);
      points.push({ x: sA.x, y: sA.y + 14 });
      points.push({ x: xDetour, y: sA.y + 14 });
      points.push({ x: xDetour, y: sB.y - 14 });
      points.push({ x: sB.x, y: sB.y - 14 });
    }
  } else if (dirA === 'top' && dirB === 'bottom') {
    if (sA.y >= sB.y) {
      const yMid = sA.y + (sB.y - sA.y) * 0.5 + offset;
      points.push({ x: sA.x, y: yMid });
      points.push({ x: sB.x, y: yMid });
    } else {
      const xDetour = Math.min(sA.x, sB.x) - 36 - Math.abs(offset);
      points.push({ x: sA.x, y: sA.y - 14 });
      points.push({ x: xDetour, y: sA.y - 14 });
      points.push({ x: xDetour, y: sB.y + 14 });
      points.push({ x: sB.x, y: sB.y + 14 });
    }
  } else if (dirA === 'bottom' && dirB === 'bottom') {
    const yMax = Math.max(sA.y, sB.y) + 24 + Math.abs(offset);
    points.push({ x: sA.x, y: yMax });
    points.push({ x: sB.x, y: yMax });
  } else if (dirA === 'top' && dirB === 'top') {
    const yMin = Math.min(sA.y, sB.y) - 24 - Math.abs(offset);
    points.push({ x: sA.x, y: yMin });
    points.push({ x: sB.x, y: yMin });
  } else if (dirA === 'right' || dirB === 'right' || dirA === 'left' || dirB === 'left') {
    if (dirA === 'right') {
      points.push({ x: sA.x + 12, y: sA.y });
      points.push({ x: sA.x + 12, y: sB.y });
    } else {
      points.push({ x: sA.x, y: sB.y });
    }
  } else {
    points.push({ x: sA.x, y: sB.y });
  }

  points.push(sB);
  points.push(pB);

  // Limpeza de pontos redundantes colineares
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

/**
 * Traçado Suave com Cantos Arredondados (Fillet Corners)
 */
function traceFilletPath(
  ctx: CanvasRenderingContext2D,
  pts: { x: number; y: number }[],
  radius = 10
) {
  if (pts.length < 2) return;
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);

  for (let i = 1; i < pts.length - 1; i++) {
    const p1 = pts[i - 1];
    const p2 = pts[i];
    const p3 = pts[i + 1];

    const d1 = Math.hypot(p2.x - p1.x, p2.y - p1.y);
    const d2 = Math.hypot(p3.x - p2.x, p3.y - p2.y);
    const curRadius = Math.min(radius, d1 / 2, d2 / 2);

    ctx.arcTo(p2.x, p2.y, p3.x, p3.y, curRadius);
  }

  ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
}

export interface CurvedWirePath {
  start: TerminalPosition;
  cp1: { x: number; y: number };
  cp2: { x: number; y: number };
  end: TerminalPosition;
}

/**
 * Calcula a geometria hiper-realista da curva Bézier cúbica de um condutor flexível de painel.
 * Respeita a orientação física de saída/entrada dos bornes (dir) e gera caimento catenário natural.
 */
export function calculateCurvedPath(
  posA: TerminalPosition,
  posB: TerminalPosition,
  wireIndex: number = 0
): CurvedWirePath {
  const dirA = posA.dir || 'bottom';
  const dirB = posB.dir || 'top';

  const dx = posB.x - posA.x;
  const dy = posB.y - posA.y;
  const dist = Math.hypot(dx, dy);

  // Vetor normal unitário de saída do borne (perpendicular à carcaça do dispositivo)
  const vA = {
    x: dirA === 'right' ? 1 : dirA === 'left' ? -1 : 0,
    y: dirA === 'bottom' ? 1 : dirA === 'top' ? -1 : 0
  };
  const vB = {
    x: dirB === 'right' ? 1 : dirB === 'left' ? -1 : 0,
    y: dirB === 'bottom' ? 1 : dirB === 'top' ? -1 : 0
  };

  // Caimento/tensão de flexão proporcional à distância com limites físicos realistas
  const baseSag = Math.min(Math.max(dist * 0.42, 35), 180);

  // Afastamento suave de feixe (bundle offset) para condutores paralelos (L1, L2, L3, N, PE)
  const bundleOffset = ((wireIndex % 7) - 3) * 6;
  const perpX = dist > 0.001 ? -dy / dist : 0;
  const perpY = dist > 0.001 ? dx / dist : 1;

  // Pontos de controle Bézier que garantem saída reta do terminal tubular e curvatura suave nas canaletas
  const cp1 = {
    x: posA.x + vA.x * baseSag + perpX * bundleOffset,
    y: posA.y + vA.y * baseSag + perpY * bundleOffset
  };

  const cp2 = {
    x: posB.x + vB.x * baseSag + perpX * bundleOffset,
    y: posB.y + vB.y * baseSag + perpY * bundleOffset
  };

  return {
    start: posA,
    cp1,
    cp2,
    end: posB
  };
}

/**
 * Avalia amostras uniformes da curva Bézier para detecção de colisão (hit-test) e cálculos de física
 */
export function getBezierPoints(
  path: CurvedWirePath,
  numSamples: number = 18
): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = [];
  const p0 = path.start;
  const p1 = path.cp1;
  const p2 = path.cp2;
  const p3 = path.end;

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

export interface CurvedWireRenderOptions {
  wireType?: string;
  cam: { zoom: number; pan?: { x: number; y: number } };
  isLive?: boolean;
  isSelected?: boolean;
  isOverheated?: boolean;
  animTick?: number;
  toScreen: (p: { x: number; y: number }) => { x: number; y: number };
}

/**
 * CAMADA 2: RENDERIZAÇÃO TRASEIRA DOS CONDUTORES (CORPO CURVO DO FIO)
 * O corpo dos fios passa por TRÁS dos dispositivos (como em canaletas de quadro real).
 * Inclui: Sombra projetada, PVC cilíndrico de alta definição, listras PE zebradas,
 * brilho especular longitudinal, fluxo de elétrons e efeito térmico se sobreaquecido.
 */
export function renderCurvedWireBack(
  ctx: CanvasRenderingContext2D,
  path: CurvedWirePath,
  options: CurvedWireRenderOptions
): void {
  const {
    wireType = 'L1',
    cam,
    isLive = false,
    isSelected = false,
    isOverheated = false,
    animTick = 0,
    toScreen
  } = options;

  const sA = toScreen(path.start);
  const sCP1 = toScreen(path.cp1);
  const sCP2 = toScreen(path.cp2);
  const sB = toScreen(path.end);

  const norm = WIRE_NORM_COLORS[wireType] || WIRE_NORM_COLORS['L1'];
  const z = Math.max(0.35, Math.min(2.5, cam.zoom));
  const wireW = Math.max(2.4, 3.8 * z);

  const traceBezier = (c: CanvasRenderingContext2D) => {
    c.beginPath();
    c.moveTo(sA.x, sA.y);
    c.bezierCurveTo(sCP1.x, sCP1.y, sCP2.x, sCP2.y, sB.x, sB.y);
  };

  ctx.save();

  // 1. Halo de Seleção Neon Pulsante
  if (isSelected) {
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
    ctx.lineWidth = wireW + 9 * z;
    ctx.lineCap = 'round';
    traceBezier(ctx);
    ctx.stroke();
  }

  // 2. Sombra Projetada Profunda (Drop Shadow) no Fundo do Quadro (Sensação 3D Real)
  ctx.save();
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.lineWidth = wireW + 2 * z;
  ctx.lineCap = 'round';
  ctx.translate(2.2 * z, 3.8 * z);
  traceBezier(ctx);
  ctx.stroke();
  ctx.restore();

  // 3. Contorno Escuro de Profundidade do Cabo
  ctx.strokeStyle = '#050b14';
  ctx.lineWidth = wireW + 1.2 * z;
  ctx.lineCap = 'round';
  traceBezier(ctx);
  ctx.stroke();

  // 4. Corpo Primário da Isolação em PVC / XLPE
  if (isOverheated) {
    const pulse = (Math.sin(animTick * 0.18) + 1) * 0.5;
    ctx.strokeStyle = `rgb(${Math.round(235 + pulse * 20)}, ${Math.round(50 + pulse * 80)}, 15)`;
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = (12 + pulse * 14) * z;
  } else {
    ctx.strokeStyle = norm.base;
  }
  ctx.lineWidth = wireW;
  ctx.lineCap = 'round';
  traceBezier(ctx);
  ctx.stroke();
  ctx.shadowColor = 'transparent';

  // 5. Preservar Identificação Normatizada NBR 5410 / IEC: Listras Zebradas Amarelas para Terra (PE)
  if (norm.isStriped && !isOverheated) {
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = wireW * 0.82;
    ctx.setLineDash([7 * z, 7 * z]);
    traceBezier(ctx);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // 6. Brilho Longitudinal de Alta Definição (Cilindro Especular do PVC)
  ctx.strokeStyle = isOverheated ? '#fef08a' : norm.highlight;
  ctx.lineWidth = Math.max(0.75, 1.2 * z);
  ctx.lineCap = 'round';
  ctx.globalAlpha = 0.65;
  traceBezier(ctx);
  ctx.stroke();
  ctx.globalAlpha = 1.0;

  // 7. Fluxo de Cargas Elétricas / Elétrons em Tempo Real (Live Current Animation)
  if (isLive) {
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = Math.max(1.1, 1.8 * z);
    ctx.setLineDash([5 * z, 9 * z]);
    ctx.lineDashOffset = -animTick * 1.6;
    traceBezier(ctx);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // 8. Fumaça e Incandescência Térmica se Sobreaquecido
  if (isOverheated) {
    const numPuffs = 4;
    for (let p = 0; p < numPuffs; p++) {
      const t = (p + 0.5) / numPuffs;
      const invT = 1 - t;
      const t2 = t * t;
      const invT2 = invT * invT;
      const midX = invT2 * invT * sA.x + 3 * invT2 * t * sCP1.x + 3 * invT * t2 * sCP2.x + t2 * t * sB.x;
      const midY = invT2 * invT * sA.y + 3 * invT2 * t * sCP1.y + 3 * invT * t2 * sCP2.y + t2 * t * sB.y;

      const puffLife = (animTick * 0.4 + p * 12) % 40;
      const puffX = midX + Math.sin(animTick * 0.08 + p) * 6 * z;
      const puffY = midY - puffLife * 1.3 * z;
      const puffRadius = (3.5 + puffLife * 0.28) * z;
      const alpha = Math.max(0, 0.4 - puffLife / 40);

      ctx.fillStyle = `rgba(148, 163, 184, ${alpha})`;
      ctx.beginPath();
      ctx.arc(puffX, puffY, puffRadius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
}

/**
 * CAMADA 4: RENDERIZAÇÃO HIPER-REALISTA DO TERMINAL ILHÓS TUBULAR (CORD END FERRULE)
 * Renderizado no plano frontal, perfeitamente alinhado e inserido dentro do parafuso/borne do dispositivo:
 * 1. Capa isolante de polipropileno colorido (luva cônica) ajustada à cor normativa do condutor.
 * 2. Tubo metálico de cobre eletrolítico estanhado/prateado crimpado com ranhuras de prensagem.
 * 3. Ponta de cobre multifilar exposta dentro do tubo metálico entrando na cavidade do borne.
 * 4. Cavidade/alvéolo de encaixe 3D no parafuso do borne.
 */
export function renderFerruleTerminal(
  ctx: CanvasRenderingContext2D,
  screenPos: { x: number; y: number },
  dir: 'top' | 'bottom' | 'left' | 'right',
  wireType: string = 'L1',
  cam: { zoom: number },
  isLive: boolean = false,
  isOverheated: boolean = false
): void {
  const norm = WIRE_NORM_COLORS[wireType] || WIRE_NORM_COLORS['L1'];
  const z = Math.max(0.35, Math.min(2.5, cam.zoom));

  ctx.save();
  ctx.translate(screenPos.x, screenPos.y);

  // Ângulo onde o terminal aponta para fora do dispositivo em direção ao cabo
  let angle = 0;
  if (dir === 'top') angle = -Math.PI / 2;
  else if (dir === 'bottom') angle = Math.PI / 2;
  else if (dir === 'left') angle = Math.PI;
  else if (dir === 'right') angle = 0;

  ctx.rotate(angle);

  // Dimensões do Terminal Ilhós Pré-isolado conforme DIN 46228-4
  const tubeLen = 8.5 * z;      // Comprimento do tubo de cobre estanhado crimpado
  const collarLen = 7.5 * z;    // Comprimento da luva plástica isolante
  const tubeHalfW = 1.6 * z;    // Meia-largura do tubo prateado crimpado
  const collarEndHalfW = 2.8 * z; // Meia-largura da entrada cônica plástica

  // 1. Alvéolo/Cavidade do Borne do Dispositivo (Encaixe 3D do Parafuso)
  ctx.fillStyle = '#090e17';
  ctx.beginPath();
  ctx.roundRect(-2.8 * z, -3.2 * z, 3.4 * z, 6.4 * z, 0.8 * z);
  ctx.fill();
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 0.8 * z;
  ctx.stroke();

  // Cabeça do Parafuso de Aperto do Borne
  ctx.fillStyle = '#64748b';
  ctx.beginPath();
  ctx.arc(-1.2 * z, 0, 1.8 * z, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 0.6 * z;
  ctx.stroke();
  // Fenda do Parafuso Phillips / Pozidriv
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 0.7 * z;
  ctx.beginPath();
  ctx.moveTo(-2.2 * z, 0);
  ctx.lineTo(-0.2 * z, 0);
  ctx.stroke();

  // 2. Ponta Sutil do Cabo de Cobre Multifilar Exposto dentro do Tubo Prateado
  ctx.fillStyle = isOverheated ? '#ea580c' : '#b45309';
  ctx.fillRect(-0.4 * z, -1.1 * z, 2.6 * z, 2.2 * z);
  // Fios individuais de cobre flexível (micro-filamentos)
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 0.5 * z;
  ctx.beginPath();
  ctx.moveTo(0, -0.6 * z);
  ctx.lineTo(2.2 * z, -0.6 * z);
  ctx.moveTo(0, 0);
  ctx.lineTo(2.5 * z, 0);
  ctx.moveTo(0, 0.6 * z);
  ctx.lineTo(2.2 * z, 0.6 * z);
  ctx.stroke();

  // 3. Tubo Metálico de Cobre Estanhado / Prateado Crimpado (Tin-Plated Copper Ferrule)
  const metalGrad = ctx.createLinearGradient(0, -tubeHalfW, 0, tubeHalfW);
  metalGrad.addColorStop(0, '#64748b');      // Sombra metálica superior
  metalGrad.addColorStop(0.2, '#ffffff');    // Brilho cromado especular intenso
  metalGrad.addColorStop(0.5, '#cbd5e1');    // Prata estanhada brilhante
  metalGrad.addColorStop(0.85, '#94a3b8');   // Corpo estanhado
  metalGrad.addColorStop(1, '#334155');      // Sombra inferior de profundidade

  ctx.fillStyle = metalGrad;
  ctx.beginPath();
  ctx.roundRect(0.8 * z, -tubeHalfW, tubeLen, tubeHalfW * 2, 0.6 * z);
  ctx.fill();
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 0.6 * z;
  ctx.stroke();

  // Marcas de Crimpagem Trapezoidal / Hexagonal (Prensagem Industrial com Alicate de Terminal)
  const drawCrimpIndent = (xPos: number) => {
    // Ranhura escura de compressão
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 0.8 * z;
    ctx.beginPath();
    ctx.moveTo(xPos, -tubeHalfW + 0.3 * z);
    ctx.lineTo(xPos, tubeHalfW - 0.3 * z);
    ctx.stroke();
    // Borda clara de reflexo do chanfro da crimpagem
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = 0.5 * z;
    ctx.beginPath();
    ctx.moveTo(xPos + 0.5 * z, -tubeHalfW + 0.3 * z);
    ctx.lineTo(xPos + 0.5 * z, tubeHalfW - 0.3 * z);
    ctx.stroke();
  };

  drawCrimpIndent(3.2 * z);
  drawCrimpIndent(6.2 * z);

  // 4. Capa Isolante de Plástico Colorido (Luva de Polipropileno Pré-Isolada Cônica)
  const collarStartX = tubeLen - 0.5 * z;
  const collarEndX = collarStartX + collarLen;
  const collarStartHalfW = tubeHalfW + 0.4 * z;

  const collarGrad = ctx.createLinearGradient(0, -collarEndHalfW, 0, collarEndHalfW);
  collarGrad.addColorStop(0, '#020617');                      // Borda escura cilíndrica
  collarGrad.addColorStop(0.22, norm.highlight || '#ffffff');  // Reflexo de brilho plástico PVC
  collarGrad.addColorStop(0.55, norm.base);                   // Cor normativa do condutor
  collarGrad.addColorStop(0.85, norm.base);
  collarGrad.addColorStop(1, '#050b14');                      // Sombra inferior

  ctx.fillStyle = collarGrad;
  ctx.beginPath();
  ctx.moveTo(collarStartX, -collarStartHalfW);
  ctx.lineTo(collarEndX, -collarEndHalfW);
  ctx.arcTo(collarEndX + 1.2 * z, -collarEndHalfW, collarEndX + 1.2 * z, -1.8 * z, 1.0 * z);
  ctx.lineTo(collarEndX + 1.2 * z, 1.8 * z);
  ctx.arcTo(collarEndX + 1.2 * z, collarEndHalfW, collarEndX, collarEndHalfW, 1.0 * z);
  ctx.lineTo(collarStartX, collarStartHalfW);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = 'rgba(15, 23, 42, 0.75)';
  ctx.lineWidth = 0.7 * z;
  ctx.stroke();

  // Linha de Reflexo Especular da Luva Plástica
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
  ctx.lineWidth = 0.75 * z;
  ctx.beginPath();
  ctx.moveTo(collarStartX + 0.5 * z, -collarStartHalfW * 0.6);
  ctx.lineTo(collarEndX - 0.5 * z, -collarEndHalfW * 0.6);
  ctx.stroke();

  // Se for Condutor de Proteção (Terra PE): Faixa Zebrada Amarela na Luva Verde
  if (norm.isStriped) {
    ctx.fillStyle = '#eab308';
    ctx.fillRect(collarStartX + 2.5 * z, -collarEndHalfW * 0.9, 1.8 * z, collarEndHalfW * 1.8);
  }

  // 5. Borda de Acomodação/Entrada do Cabo Flexível
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.beginPath();
  ctx.ellipse(collarEndX + 0.8 * z, 0, 0.8 * z, collarEndHalfW * 0.85, 0, 0, Math.PI * 2);
  ctx.fill();

  // 6. Efeito Ativo Sutil de Energização no Borne
  if (isLive) {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 0.8 * z;
    ctx.beginPath();
    ctx.arc(-1.2 * z, 0, 2.2 * z, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Função utilitária unificada de renderização de condutores curvos com ferrules
 */
export function renderCurvedWireWithFerrules(
  ctx: CanvasRenderingContext2D,
  wire: any,
  project: any,
  cam: { zoom: number; pan?: { x: number; y: number } },
  options: {
    wireIndex?: number;
    isSelected?: boolean;
    isLive?: boolean;
    isOverheated?: boolean;
    animTick?: number;
    toScreen: (p: { x: number; y: number }) => { x: number; y: number };
  }
): void {
  const posA = getNodeWorldPos(wire.a?.c, wire.a?.t, project.components, project.busbars || []);
  const posB = getNodeWorldPos(wire.b?.c, wire.b?.t, project.components, project.busbars || []);
  const curvedPath = calculateCurvedPath(posA, posB, options.wireIndex || 0);

  // Renderiza corpo do fio
  renderCurvedWireBack(ctx, curvedPath, {
    wireType: wire.type || 'L1',
    cam,
    isLive: options.isLive,
    isSelected: options.isSelected,
    isOverheated: options.isOverheated,
    animTick: options.animTick || 0,
    toScreen: options.toScreen
  });

  // Renderiza ferrules
  renderFerruleTerminal(
    ctx,
    options.toScreen(posA),
    posA.dir || 'bottom',
    wire.type || 'L1',
    cam,
    options.isLive,
    options.isOverheated
  );

  renderFerruleTerminal(
    ctx,
    options.toScreen(posB),
    posB.dir || 'top',
    wire.type || 'L1',
    cam,
    options.isLive,
    options.isOverheated
  );
}

/**
 * RENDERIZAÇÃO ESTÉTICA PROFISSIONAL DE CABOS NO CANVAS 2D (COMPATIBILIDADE SNAPSHOT/LEGADO)
 */
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

  const norm = WIRE_NORM_COLORS[wireType] || WIRE_NORM_COLORS['L1'];
  const wireW = Math.max(2.4, 3.8 * cam.zoom);
  const filletRadius = Math.max(6, 12 * cam.zoom);

  ctx.save();

  // 1. Se selecionado: Halo de seleção pulsante
  if (isSelected) {
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
    ctx.lineWidth = wireW + 10 * cam.zoom;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    traceFilletPath(ctx, screenPoints, filletRadius);
    ctx.stroke();
  }

  // 2. Sombra de profundidade projetada na placa de montagem
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.lineWidth = wireW + 2 * cam.zoom;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.save();
  ctx.translate(2 * cam.zoom, 3.5 * cam.zoom);
  traceFilletPath(ctx, screenPoints, filletRadius);
  ctx.stroke();
  ctx.restore();

  // 3. Corpo Primário da Isolação de PVC/XLPE
  if (isOverheated) {
    const pulse = (Math.sin(animTick * 0.15) + 1) * 0.5;
    ctx.strokeStyle = `rgb(${Math.round(235 + pulse * 20)}, ${Math.round(50 + pulse * 80)}, 15)`;
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = (10 + pulse * 12) * cam.zoom;
  } else {
    ctx.strokeStyle = norm.base;
  }
  ctx.lineWidth = wireW;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  traceFilletPath(ctx, screenPoints, filletRadius);
  ctx.stroke();
  ctx.shadowColor = 'transparent';

  // 4. Se for Terra (PE): Listras Amarelas de Segurança IEC
  if (norm.isStriped && !isOverheated) {
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = wireW * 0.85;
    ctx.setLineDash([8 * cam.zoom, 8 * cam.zoom]);
    traceFilletPath(ctx, screenPoints, filletRadius);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // 5. Linha de Reflexo Especular Superior 3D (Cilindro do Cabo)
  ctx.strokeStyle = isOverheated ? '#fed7aa' : norm.highlight;
  ctx.lineWidth = Math.max(0.75, 1.2 * cam.zoom);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.globalAlpha = 0.65;
  traceFilletPath(ctx, screenPoints, filletRadius);
  ctx.stroke();
  ctx.globalAlpha = 1.0;

  // 6. Animação de Fluxo de Cargas se Energizado
  if (isLive) {
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = Math.max(1.1, 1.8 * cam.zoom);
    ctx.setLineDash([5 * cam.zoom, 9 * cam.zoom]);
    ctx.lineDashOffset = -animTick * 1.5;
    traceFilletPath(ctx, screenPoints, filletRadius);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // 7. Terminais Ilhós nos 2 Extremos
  const pA = screenPoints[0];
  const pB = screenPoints[screenPoints.length - 1];
  const pNextA = screenPoints[1] || pA;
  const pPrevB = screenPoints[screenPoints.length - 2] || pB;

  const getDirFromVector = (dx: number, dy: number): 'top' | 'bottom' | 'left' | 'right' => {
    if (Math.abs(dx) > Math.abs(dy)) {
      return dx > 0 ? 'right' : 'left';
    }
    return dy > 0 ? 'bottom' : 'top';
  };

  renderFerruleTerminal(ctx, pA, getDirFromVector(pNextA.x - pA.x, pNextA.y - pA.y), wireType, cam, isLive, isOverheated);
  renderFerruleTerminal(ctx, pB, getDirFromVector(pPrevB.x - pB.x, pPrevB.y - pB.y), wireType, cam, isLive, isOverheated);

  ctx.restore();
}

export interface JunctionDot {
  x: number;
  y: number;
  netType: string;
}

/**
 * Identifica os nós de derivação reais (Junction Dots) em derivações em T
 */
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

/**
 * Auto-Organizar Fios e Conexões na grade CAD
 */
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

    return {
      ...c,
      x: nx,
      y: ny
    };
  });

  return {
    ...project,
    components: updatedComponents,
    updated: Date.now()
  };
}
