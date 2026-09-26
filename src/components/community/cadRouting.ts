// ============================================================================
// TÉCNICAMZ PRO — MOTOR DE ROTEAMENTO DE CONDUTORES, FÍSICA E ANATOMIA IEC/DIN
// Normas: IEC 60669 (Interruptores), NBR 14136, IEC 60364-5-52, DIN 46228-4
// Pinagem Física NBR/IEC: 1P (L/R), 2P (L1/L2/L1'/L2'), 3-Way (C/R1/R2), 4-Way (IN1/IN2/OUT1/OUT2)
// Roteamento em Canaletas Retas com Dobras Curvas Suaves (Fillet R=12-14px)
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

/**
 * Retorna a espessura proporcional do condutor no canvas conforme a bitola real (mm²)
 */
export function getWireGaugeThickness(gauge: number = 2.5, zoom: number = 1.0): number {
  const z = Math.max(0.35, Math.min(2.5, zoom));
  switch (Number(gauge)) {
    case 1.5:
      return Math.max(2.4, 3.2 * z);
    case 2.5:
      return Math.max(3.0, 4.2 * z);
    case 4.0:
      return Math.max(3.6, 5.2 * z);
    case 6.0:
      return Math.max(4.2, 6.2 * z);
    case 10.0:
      return Math.max(5.0, 7.6 * z);
    case 16.0:
      return Math.max(6.0, 9.0 * z);
    default:
      return Math.max(3.0, 4.2 * z);
  }
}

/**
 * Topologia e Posição Normativa dos Bornes conforme Padrão Físico Real NBR / IEC
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

  // 1. Terra de Proteção (PE / GND): Exclusivamente Lateral Direita
  if (termId === 'PE' || termId === 'G' || func === 'PE') {
    return { x: w / 2, y: 0, dir: 'right' };
  }

  // --------------------------------------------------------------------------
  // INTERRUPTORES, COMUTADORES E DIMMERS (PINAGEM NBR/IEC REAL)
  // --------------------------------------------------------------------------
  // A. Interruptor Simples Unipolar (1P): 2 Bornes (L e R / 1 e 2)
  if (comp.code === 'SW' || d.kind === 'switch') {
    if (termId === 'L' || termId === '1' || func === 'IN') {
      return { x: 0, y: -h / 2, dir: 'top' };      // Borne Linha / Entrada
    }
    if (termId === 'R' || termId === '2' || func === 'OUT') {
      return { x: 0, y: h / 2, dir: 'bottom' };   // Borne Retorno / Saída
    }
  }

  // B. Interruptor Bipolar (2P): 4 Bornes (L1, L2 no topo; L1', L2' na base)
  if (comp.code === 'SW2' || d.kind === 'switch2') {
    if (termId === 'L1' || termId === '1') return { x: -w * 0.25, y: -h / 2, dir: 'top' };
    if (termId === 'L2' || termId === '3') return { x: w * 0.25, y: -h / 2, dir: 'top' };
    if (termId === "L1'" || termId === '2') return { x: -w * 0.25, y: h / 2, dir: 'bottom' };
    if (termId === "L2'" || termId === '4') return { x: w * 0.25, y: h / 2, dir: 'bottom' };
  }

  // C. Interruptor 3-WAY (Paralelo / Escada): Exatamente 3 Bornes
  // Topo: Comum 'C' (ou 'COM') | Base: Retorno 1 'R1' e Retorno 2 'R2'
  if (comp.code === 'THREE_WAY') {
    if (termId === 'C' || termId === 'COM' || func === 'COM') {
      return { x: 0, y: -h / 2, dir: 'top' };
    }
    if (termId === 'R1' || termId === '1') {
      return { x: -w * 0.25, y: h / 2, dir: 'bottom' };
    }
    if (termId === 'R2' || termId === '2') {
      return { x: w * 0.25, y: h / 2, dir: 'bottom' };
    }
  }

  // D. Interruptor 4-WAY (Intermediário / Cruzamento): Exatamente 4 Bornes
  // Topo: Entradas de Balanço 'IN1' e 'IN2' | Base: Saídas de Balanço 'OUT1' e 'OUT2'
  if (comp.code === 'FOUR_WAY') {
    if (termId === 'IN1' || termId === '1') {
      return { x: -w * 0.25, y: -h / 2, dir: 'top' };
    }
    if (termId === 'IN2' || termId === '2') {
      return { x: w * 0.25, y: -h / 2, dir: 'top' };
    }
    if (termId === 'OUT1' || termId === '3') {
      return { x: -w * 0.25, y: h / 2, dir: 'bottom' };
    }
    if (termId === 'OUT2' || termId === '4') {
      return { x: w * 0.25, y: h / 2, dir: 'bottom' };
    }
  }

  // E. Dimmer Rotativo: Entrada 'IN', Neutro 'N' e Saída 'OUT'
  if (comp.code === 'DIMMER' || d.kind === 'dimmer') {
    if (termId === 'IN' || termId === '1') return { x: -w * 0.22, y: -h / 2, dir: 'top' };
    if (termId === 'N') return { x: w * 0.22, y: -h / 2, dir: 'top' };
    if (termId === 'OUT' || termId === '2') return { x: 0, y: h / 2, dir: 'bottom' };
  }

  // --------------------------------------------------------------------------
  // MOTORES ELÉTRICOS (IEC 60034)
  // --------------------------------------------------------------------------
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

  // --------------------------------------------------------------------------
  // CONTACTORES DE POTÊNCIA (IEC 60947-4-1)
  // --------------------------------------------------------------------------
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

  // --------------------------------------------------------------------------
  // RELÉ TÉRMICO DE SOBRECARGA (OLR)
  // --------------------------------------------------------------------------
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

  // --------------------------------------------------------------------------
  // DISJUNTORES TETRAPOLARES / TRIPOLARES (MCB3, MCCB, FU3)
  // --------------------------------------------------------------------------
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

  // --------------------------------------------------------------------------
  // DISJUNTOR BIPOLAR (MCB2)
  // --------------------------------------------------------------------------
  if (d.kind === 'breaker2') {
    if (termId === '1') return { x: -w * 0.3, y: -h / 2, dir: 'top' };
    if (termId === '3') return { x: 0, y: -h / 2, dir: 'top' };
    if (termId === 'N' || termId === 'N_IN') return { x: w * 0.3, y: -h / 2, dir: 'top' };

    if (termId === '2') return { x: -w * 0.3, y: h / 2, dir: 'bottom' };
    if (termId === '4') return { x: 0, y: h / 2, dir: 'bottom' };
    if (termId === 'N_OUT') return { x: w * 0.3, y: h / 2, dir: 'bottom' };
  }

  // --------------------------------------------------------------------------
  // DISJUNTORES UNIPOLARES (MCB1, RCBO) E FUSÍVEIS
  // --------------------------------------------------------------------------
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

  if (d.kind === 'fuse') {
    if (termId === '1' || func === 'IN') return { x: 0, y: -h / 2, dir: 'top' };
    return { x: 0, y: h / 2, dir: 'bottom' };
  }

  // --------------------------------------------------------------------------
  // DISPOSITIVO CONTRA SURTOS (DPS / SPD)
  // --------------------------------------------------------------------------
  if (d.kind === 'spd') {
    if (termId === 'L' || termId === '1') return { x: -w * 0.25, y: -h / 2, dir: 'top' };
    if (termId === 'L1') return { x: -w * 0.33, y: -h / 2, dir: 'top' };
    if (termId === 'L2') return { x: -w * 0.11, y: -h / 2, dir: 'top' };
    if (termId === 'L3') return { x: w * 0.11, y: -h / 2, dir: 'top' };
    if (termId === 'N' || termId === 'N_IN') return { x: w * 0.3, y: -h / 2, dir: 'top' };
    if (termId === 'PE') return { x: 0, y: h / 2, dir: 'bottom' };
  }

  // --------------------------------------------------------------------------
  // INTERRUPTORES DIFERENCIAIS RESIDUAIS (IDR / RCD)
  // --------------------------------------------------------------------------
  if (d.kind === 'rcd' || d.kind === 'rcd4') {
    if (d.kind === 'rcd4' || (d.terminals && d.terminals.length >= 8)) {
      if (termId === '1') return { x: -w * 0.33, y: -h / 2, dir: 'top' };
      if (termId === '3') return { x: -w * 0.11, y: -h / 2, dir: 'top' };
      if (termId === '5') return { x: w * 0.11, y: -h / 2, dir: 'top' };
      if (termId === 'N' || termId === 'N_IN') return { x: w * 0.33, y: -h / 2, dir: 'top' };

      if (termId === '2') return { x: -w * 0.33, y: h / 2, dir: 'bottom' };
      if (termId === '4') return { x: -w * 0.11, y: h / 2, dir: 'bottom' };
      if (termId === '6') return { x: w * 0.11, y: h / 2, dir: 'bottom' };
      if (termId === 'N_OUT') return { x: w * 0.33, y: h / 2, dir: 'bottom' };
    } else {
      if (termId === '1') return { x: -w * 0.22, y: -h / 2, dir: 'top' };
      if (termId === 'N' || termId === 'N_IN') return { x: w * 0.22, y: -h / 2, dir: 'top' };
      if (termId === '2') return { x: -w * 0.22, y: h / 2, dir: 'bottom' };
      if (termId === 'N_OUT') return { x: w * 0.22, y: h / 2, dir: 'bottom' };
    }
  }

  // --------------------------------------------------------------------------
  // BOTOEIRAS E CHAVES SELETORAS
  // --------------------------------------------------------------------------
  if (d.kind === 'push' || d.kind === 'pushbutton' || d.kind === 'estop') {
    if (termId === '1' || termId === '3' || termId === '13' || termId === '11') {
      return { x: -w * 0.28, y: -h / 2, dir: 'top' };
    }
    if (termId === '2' || termId === '4' || termId === '14' || termId === '12') {
      return { x: w * 0.28, y: h / 2, dir: 'bottom' };
    }
  }
  if (d.kind === 'selector') {
    if (termId === '1' || termId === 'COM') return { x: 0, y: -h / 2, dir: 'top' };
    if (termId === '2' || termId === 'NO') return { x: -w * 0.25, y: h / 2, dir: 'bottom' };
    if (termId === '3' || termId === 'NC') return { x: w * 0.25, y: h / 2, dir: 'bottom' };
  }

  // --------------------------------------------------------------------------
  // RELÉS TEMPORIZADORES (TON) E AUXILIARES
  // --------------------------------------------------------------------------
  if (d.kind === 'timer' || d.kind === 'relay') {
    if (termId === 'A1') return { x: -w * 0.35, y: -h / 2, dir: 'top' };
    if (termId === '15' || termId === '11' || termId === 'COM') return { x: 0, y: -h / 2, dir: 'top' };
    if (termId === 'A2') return { x: -w * 0.35, y: h / 2, dir: 'bottom' };
    if (termId === '16' || termId === '12' || termId === 'NC') return { x: -w * 0.15, y: h / 2, dir: 'bottom' };
    if (termId === '18' || termId === '14' || termId === 'NO') return { x: w * 0.25, y: h / 2, dir: 'bottom' };
  }

  // --------------------------------------------------------------------------
  // FONTES DE ALIMENTAÇÃO
  // --------------------------------------------------------------------------
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

  // --------------------------------------------------------------------------
  // CARGAS, LÂMPADAS E SINALIZADORES
  // --------------------------------------------------------------------------
  if (d.kind === 'lamp' || d.kind === 'load' || d.cat === 'loads' || d.code?.startsWith('PILOT')) {
    const idx = d.terminals?.findIndex(x => x[0] === termId) ?? 0;
    if (idx === 0 || termId === '+' || termId === '1' || termId === 'X1' || termId === 'L') {
      return { x: 0, y: -h / 2, dir: 'top' };
    }
    return { x: 0, y: h / 2, dir: 'bottom' };
  }

  // Fallback Normativo
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
 * Retorna as coordenadas mundiais de um terminal com rotação geométrica
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
 * Resolução de Coordenadas de Terminais (Componente ou Barramento)
 */
export function getNodeWorldPos(
  nodeId: string,
  termId: string,
  components: any[],
  busbars: Busbar[] = []
): TerminalPosition {
  const comp = components?.find(c => c.id === nodeId);
  if (comp) {
    return getTerminalWorldPos(comp, termId);
  }

  const bb = busbars?.find(b => b.id === nodeId);
  if (bb) {
    const bbPos = getBusbarTerminalWorldPos(bb, termId);
    if (bbPos) return bbPos;
  }

  return { x: 0, y: 0, dir: 'bottom', normId: termId };
}

// ----------------------------------------------------------------------------
// ROTEAMENTO RETO DE CANALETAS COM DOBRAS CURVAS NOS VÉRTICES (FILLET ARCS)
// ----------------------------------------------------------------------------

export interface FilletManhattanPath {
  points: { x: number; y: number }[];
  radius: number;
}

/**
 * Roteamento industrial retilíneo com dobras curvas suaves nos vértices
 */
export function calculateFilletManhattanPath(
  posA: TerminalPosition,
  posB: TerminalPosition,
  wireIndex: number = 0,
  waypoints: { x: number; y: number }[] = []
): FilletManhattanPath {
  const dirA = posA.dir || 'bottom';
  const dirB = posB.dir || 'top';
  const stub = 16;
  const bundleOffset = ((wireIndex % 7) - 3) * 6;

  const sA = {
    x: posA.x + (dirA === 'right' ? stub : dirA === 'left' ? -stub : 0),
    y: posA.y + (dirA === 'bottom' ? stub : dirA === 'top' ? -stub : 0)
  };

  const sB = {
    x: posB.x + (dirB === 'right' ? stub : dirB === 'left' ? -stub : 0),
    y: posB.y + (dirB === 'bottom' ? stub : dirB === 'top' ? -stub : 0)
  };

  const rawPoints: { x: number; y: number }[] = [posA, sA];

  if (waypoints && waypoints.length > 0) {
    let prev = sA;
    waypoints.forEach(wp => {
      rawPoints.push({ x: wp.x, y: prev.y });
      rawPoints.push({ x: wp.x, y: wp.y });
      prev = wp;
    });
    rawPoints.push({ x: sB.x, y: prev.y });
  } else {
    if (dirA === 'bottom' && dirB === 'top') {
      if (sA.y + 12 <= sB.y) {
        const yMid = sA.y + (sB.y - sA.y) * 0.5 + bundleOffset;
        rawPoints.push({ x: sA.x, y: yMid });
        rawPoints.push({ x: sB.x, y: yMid });
      } else {
        const isALeft = sA.x < sB.x;
        const xDetour = isALeft
          ? Math.min(sA.x, sB.x) - 32 - Math.abs(bundleOffset)
          : Math.max(sA.x, sB.x) + 32 + Math.abs(bundleOffset);
        const yDown = sA.y + 22 + Math.abs(bundleOffset);
        const yUp = sB.y - 22 - Math.abs(bundleOffset);

        rawPoints.push({ x: sA.x, y: yDown });
        rawPoints.push({ x: xDetour, y: yDown });
        rawPoints.push({ x: xDetour, y: yUp });
        rawPoints.push({ x: sB.x, y: yUp });
      }
    } else if (dirA === 'top' && dirB === 'bottom') {
      if (sA.y >= sB.y + 12) {
        const yMid = sA.y + (sB.y - sA.y) * 0.5 + bundleOffset;
        rawPoints.push({ x: sA.x, y: yMid });
        rawPoints.push({ x: sB.x, y: yMid });
      } else {
        const xDetour = Math.max(sA.x, sB.x) + 32 + Math.abs(bundleOffset);
        const yUp = sA.y - 22 - Math.abs(bundleOffset);
        const yDown = sB.y + 22 + Math.abs(bundleOffset);

        rawPoints.push({ x: sA.x, y: yUp });
        rawPoints.push({ x: xDetour, y: yUp });
        rawPoints.push({ x: xDetour, y: yDown });
        rawPoints.push({ x: sB.x, y: yDown });
      }
    } else if (dirA === 'bottom' && dirB === 'bottom') {
      const yMax = Math.max(sA.y, sB.y) + 24 + Math.abs(bundleOffset);
      rawPoints.push({ x: sA.x, y: yMax });
      rawPoints.push({ x: sB.x, y: yMax });
    } else if (dirA === 'top' && dirB === 'top') {
      const yMin = Math.min(sA.y, sB.y) - 24 - Math.abs(bundleOffset);
      rawPoints.push({ x: sA.x, y: yMin });
      rawPoints.push({ x: sB.x, y: yMin });
    } else {
      const xMid = sA.x + (sB.x - sA.x) * 0.5 + bundleOffset;
      rawPoints.push({ x: xMid, y: sA.y });
      rawPoints.push({ x: xMid, y: sB.y });
    }
  }

  rawPoints.push(sB);
  rawPoints.push(posB);

  const cleanPoints: { x: number; y: number }[] = [];
  for (let i = 0; i < rawPoints.length; i++) {
    const pt = rawPoints[i];
    if (cleanPoints.length > 0) {
      const prev = cleanPoints[cleanPoints.length - 1];
      if (Math.abs(prev.x - pt.x) < 0.8 && Math.abs(prev.y - pt.y) < 0.8) continue;
    }
    cleanPoints.push(pt);
  }

  return {
    points: cleanPoints,
    radius: 12
  };
}

/**
 * Converte os pontos ortogonais em comando SVG 'd' com cantos arredondados (fillet)
 */
export function getFilletSvgPathString(points: { x: number; y: number }[], radius: number = 12): string {
  if (!points || points.length < 2) return '';
  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;

  for (let i = 1; i < points.length - 1; i++) {
    const p1 = points[i - 1];
    const p2 = points[i];
    const p3 = points[i + 1];

    const d1 = Math.hypot(p2.x - p1.x, p2.y - p1.y);
    const d2 = Math.hypot(p3.x - p2.x, p3.y - p2.y);
    const r = Math.min(radius, d1 / 2, d2 / 2);

    if (r > 1 && d1 > 1 && d2 > 1) {
      const ax = p2.x + ((p1.x - p2.x) / d1) * r;
      const ay = p2.y + ((p1.y - p2.y) / d1) * r;
      const bx = p2.x + ((p3.x - p2.x) / d2) * r;
      const by = p2.y + ((p3.y - p2.y) / d2) * r;
      d += ` L ${ax.toFixed(1)} ${ay.toFixed(1)} Q ${p2.x.toFixed(1)} ${p2.y.toFixed(1)} ${bx.toFixed(1)} ${by.toFixed(1)}`;
    } else {
      d += ` L ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }
  }

  d += ` L ${points[points.length - 1].x.toFixed(1)} ${points[points.length - 1].y.toFixed(1)}`;
  return d;
}

export function traceFilletPathCanvas(
  ctx: CanvasRenderingContext2D,
  screenPoints: { x: number; y: number }[],
  radius: number = 12
): void {
  if (!screenPoints || screenPoints.length < 2) return;
  ctx.beginPath();
  ctx.moveTo(screenPoints[0].x, screenPoints[0].y);

  for (let i = 1; i < screenPoints.length - 1; i++) {
    const p1 = screenPoints[i - 1];
    const p2 = screenPoints[i];
    const p3 = screenPoints[i + 1];

    const d1 = Math.hypot(p2.x - p1.x, p2.y - p1.y);
    const d2 = Math.hypot(p3.x - p2.x, p3.y - p2.y);
    const r = Math.min(radius, d1 / 2, d2 / 2);

    ctx.arcTo(p2.x, p2.y, p3.x, p3.y, r);
  }

  ctx.lineTo(screenPoints[screenPoints.length - 1].x, screenPoints[screenPoints.length - 1].y);
}

export interface WireRenderOptions {
  wireType?: string;
  gauge?: number;
  cam: { zoom: number; pan?: { x: number; y: number } };
  isLive?: boolean;
  isSelected?: boolean;
  isOverheated?: boolean;
  animTick?: number;
  toScreen: (p: { x: number; y: number }) => { x: number; y: number };
}

/**
 * CAMADA Z-INDEX 2: CONDUTORES NO FUNDO DO ARMÁRIO
 */
export function renderCurvedWireBack(
  ctx: CanvasRenderingContext2D,
  filletPath: FilletManhattanPath,
  options: WireRenderOptions
): void {
  const {
    wireType = 'L1',
    gauge = 2.5,
    cam,
    isLive = false,
    isSelected = false,
    isOverheated = false,
    animTick = 0,
    toScreen
  } = options;

  if (!filletPath || !filletPath.points || filletPath.points.length < 2) return;

  const screenPoints = filletPath.points.map(p => toScreen(p));
  const z = Math.max(0.35, Math.min(2.5, cam.zoom));
  const radius = (filletPath.radius || 12) * z;
  const wireW = getWireGaugeThickness(gauge, z);
  const norm = WIRE_NORM_COLORS[wireType] || WIRE_NORM_COLORS['L1'];

  ctx.save();

  if (isSelected) {
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.55)';
    ctx.lineWidth = wireW + 9 * z;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    traceFilletPathCanvas(ctx, screenPoints, radius);
    ctx.stroke();
  }

  ctx.save();
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.lineWidth = wireW + 2 * z;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.translate(2 * z, 3.5 * z);
  traceFilletPathCanvas(ctx, screenPoints, radius);
  ctx.stroke();
  ctx.restore();

  ctx.strokeStyle = '#050a14';
  ctx.lineWidth = wireW + 1.2 * z;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  traceFilletPathCanvas(ctx, screenPoints, radius);
  ctx.stroke();

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
  ctx.lineJoin = 'round';
  traceFilletPathCanvas(ctx, screenPoints, radius);
  ctx.stroke();
  ctx.shadowColor = 'transparent';

  if (norm.isStriped && !isOverheated) {
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = wireW * 0.82;
    ctx.setLineDash([8 * z, 8 * z]);
    traceFilletPathCanvas(ctx, screenPoints, radius);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  ctx.strokeStyle = isOverheated ? '#fef08a' : norm.highlight;
  ctx.lineWidth = Math.max(0.8, wireW * 0.28);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.globalAlpha = 0.65;
  traceFilletPathCanvas(ctx, screenPoints, radius);
  ctx.stroke();
  ctx.globalAlpha = 1.0;

  if (isLive) {
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = Math.max(1.1, wireW * 0.35);
    ctx.setLineDash([6 * z, 10 * z]);
    ctx.lineDashOffset = -animTick * 1.5;
    traceFilletPathCanvas(ctx, screenPoints, radius);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  ctx.restore();
}

/**
 * CAMADA Z-INDEX 5: TERMINAIS ILHÓS TUBULARES (FERRULES) COM PARAFUSO DE APERTO
 */
export function renderFerruleTerminal(
  ctx: CanvasRenderingContext2D,
  screenPos: { x: number; y: number },
  dir: 'top' | 'bottom' | 'left' | 'right',
  wireType: string = 'L1',
  gauge: number = 2.5,
  cam: { zoom: number },
  isLive: boolean = false,
  isOverheated: boolean = false
): void {
  const norm = WIRE_NORM_COLORS[wireType] || WIRE_NORM_COLORS['L1'];
  const z = Math.max(0.35, Math.min(2.5, cam.zoom));

  ctx.save();
  ctx.translate(screenPos.x, screenPos.y);

  let angle = 0;
  if (dir === 'top') angle = -Math.PI / 2;
  else if (dir === 'bottom') angle = Math.PI / 2;
  else if (dir === 'left') angle = Math.PI;
  else if (dir === 'right') angle = 0;

  ctx.rotate(angle);

  const scaleByGauge = Math.max(0.85, Math.min(1.45, Math.sqrt(gauge / 2.5)));
  const tubeLen = 9.0 * z * scaleByGauge;
  const collarLen = 8.0 * z * scaleByGauge;
  const tubeHalfW = 1.6 * z * scaleByGauge;
  const collarEndHalfW = 2.8 * z * scaleByGauge;

  // 1. Alvéolo do Borne
  ctx.fillStyle = '#060a12';
  ctx.beginPath();
  ctx.roundRect(-3.2 * z, -3.6 * z, 4.0 * z, 7.2 * z, 1.0 * z);
  ctx.fill();
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 0.9 * z;
  ctx.stroke();

  // 2. Cabeça do Parafuso de Fixação
  ctx.fillStyle = '#94a3b8';
  ctx.beginPath();
  ctx.arc(-1.2 * z, 0, 2.2 * z, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 0.8 * z;
  ctx.stroke();

  ctx.strokeStyle = '#090d16';
  ctx.lineWidth = 0.85 * z;
  ctx.beginPath();
  ctx.moveTo(-2.4 * z, 0);
  ctx.lineTo(0.0 * z, 0);
  ctx.moveTo(-1.2 * z, -1.2 * z);
  ctx.lineTo(-1.2 * z, 1.2 * z);
  ctx.stroke();

  // 3. Ponta de Cobre Multifilar
  ctx.fillStyle = isOverheated ? '#ea580c' : '#b45309';
  ctx.fillRect(-0.4 * z, -tubeHalfW * 0.7, 2.8 * z, tubeHalfW * 1.4);

  // 4. Luva Metálica Estanhada Crimpada
  const metalGrad = ctx.createLinearGradient(0, -tubeHalfW, 0, tubeHalfW);
  metalGrad.addColorStop(0, '#64748b');
  metalGrad.addColorStop(0.2, '#ffffff');
  metalGrad.addColorStop(0.5, '#cbd5e1');
  metalGrad.addColorStop(0.85, '#94a3b8');
  metalGrad.addColorStop(1, '#334155');

  ctx.fillStyle = metalGrad;
  ctx.beginPath();
  ctx.roundRect(0.8 * z, -tubeHalfW, tubeLen, tubeHalfW * 2, 0.6 * z);
  ctx.fill();
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 0.6 * z;
  ctx.stroke();

  const drawCrimpIndent = (xPos: number) => {
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 0.8 * z;
    ctx.beginPath();
    ctx.moveTo(xPos, -tubeHalfW + 0.3 * z);
    ctx.lineTo(xPos, tubeHalfW - 0.3 * z);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = 0.5 * z;
    ctx.beginPath();
    ctx.moveTo(xPos + 0.5 * z, -tubeHalfW + 0.3 * z);
    ctx.lineTo(xPos + 0.5 * z, tubeHalfW - 0.3 * z);
    ctx.stroke();
  };

  drawCrimpIndent(3.2 * z);
  drawCrimpIndent(6.5 * z);

  // 5. Capa Cônica Isolante Plástica
  const collarStartX = tubeLen - 0.5 * z;
  const collarEndX = collarStartX + collarLen;
  const collarStartHalfW = tubeHalfW + 0.4 * z;

  const collarGrad = ctx.createLinearGradient(0, -collarEndHalfW, 0, collarEndHalfW);
  collarGrad.addColorStop(0, '#020617');
  collarGrad.addColorStop(0.25, norm.highlight || '#ffffff');
  collarGrad.addColorStop(0.55, norm.base);
  collarGrad.addColorStop(0.85, norm.base);
  collarGrad.addColorStop(1, '#050b14');

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

  if (norm.isStriped) {
    ctx.fillStyle = '#eab308';
    ctx.fillRect(collarStartX + 2.5 * z, -collarEndHalfW * 0.9, 1.8 * z, collarEndHalfW * 1.8);
  }

  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.beginPath();
  ctx.ellipse(collarEndX + 0.8 * z, 0, 0.8 * z, collarEndHalfW * 0.85, 0, 0, Math.PI * 2);
  ctx.fill();

  if (isLive) {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = 0.8 * z;
    ctx.beginPath();
    ctx.arc(-1.2 * z, 0, 2.4 * z, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
}

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
  const filletPath = calculateFilletManhattanPath(posA, posB, options.wireIndex || 0, wire.waypoints);

  renderCurvedWireBack(ctx, filletPath, {
    wireType: wire.type || 'L1',
    gauge: Number(wire.gauge || 2.5),
    cam,
    isLive: options.isLive,
    isSelected: options.isSelected,
    isOverheated: options.isOverheated,
    animTick: options.animTick || 0,
    toScreen: options.toScreen
  });

  renderFerruleTerminal(
    ctx,
    options.toScreen(posA),
    posA.dir || 'bottom',
    wire.type || 'L1',
    Number(wire.gauge || 2.5),
    cam,
    options.isLive,
    options.isOverheated
  );

  renderFerruleTerminal(
    ctx,
    options.toScreen(posB),
    posB.dir || 'top',
    wire.type || 'L1',
    Number(wire.gauge || 2.5),
    cam,
    options.isLive,
    options.isOverheated
  );
}

export function getBezierPoints(
  filletPath: FilletManhattanPath,
  numSamples: number = 20
): { x: number; y: number }[] {
  if (!filletPath || !filletPath.points) return [];
  return filletPath.points;
}

export const calculateCurvedPath = calculateFilletManhattanPath;
export const getCurvedSvgPathString = (path: FilletManhattanPath) => getFilletSvgPathString(path.points, path.radius);

export function findJunctionDots(
  components: any[],
  wires: any[],
  busbars: Busbar[] = []
): { x: number; y: number; netType: string }[] {
  if (!Array.isArray(wires)) return [];

  const pointCounts = new Map<string, { count: number; x: number; y: number; netType: string }>();

  wires.forEach((wire, wireIdx) => {
    const posA = getNodeWorldPos(wire.a?.c, wire.a?.t, components, busbars);
    const posB = getNodeWorldPos(wire.b?.c, wire.b?.t, components, busbars);
    const path = calculateFilletManhattanPath(posA, posB, wireIdx, wire.waypoints);
    const pts = path.points;

    pts.forEach(pt => {
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
    });
  });

  const dots: { x: number; y: number; netType: string }[] = [];
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
      if (Math.abs(nx - prev.x) < 90 && Math.abs(ny - prev.y) < 70) {
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
  const pA = screenPoints[0];
  const pB = screenPoints[screenPoints.length - 1];

  const posA: TerminalPosition = { x: pA.x, y: pA.y, dir: 'bottom', normId: 'A' };
  const posB: TerminalPosition = { x: pB.x, y: pB.y, dir: 'top', normId: 'B' };
  const path = calculateFilletManhattanPath(posA, posB, 0);

  renderCurvedWireBack(ctx, path, {
    wireType,
    gauge: 2.5,
    cam,
    isLive,
    isSelected,
    isOverheated,
    animTick,
    toScreen: p => p
  });
}