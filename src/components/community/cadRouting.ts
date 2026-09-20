// ============================================================================
// TÉCNICAMZ PRO — MOTOR DE ROTEAMENTO ORTOGONAL (MANHATTAN) & IEC/DIN TOPOLOGY
// ============================================================================

import { getComponentDef } from './cadEngine';

export interface TerminalPosition {
  x: number;
  y: number;
  dir: 'top' | 'bottom' | 'left' | 'right';
  normId: string;
}

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
    // Entradas no Topo: Bobina A1, Fases 1, 3, 5 e Contatos Auxiliares 13 (NA), 21 (NF)
    if (termId === 'A1') return { x: -w * 0.38, y: -h / 2, dir: 'top' };
    if (termId === '1') return { x: -w * 0.18, y: -h / 2, dir: 'top' };
    if (termId === '3') return { x: 0, y: -h / 2, dir: 'top' };
    if (termId === '5') return { x: w * 0.18, y: -h / 2, dir: 'top' };
    if (termId === '13') return { x: w * 0.33, y: -h / 2, dir: 'top' };
    if (termId === '21') return { x: w * 0.42, y: -h / 2, dir: 'top' };

    // Saídas na Base: Bobina A2, Fases 2, 4, 6 e Contatos Auxiliares 14 (NA), 22 (NF)
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

  // 5. Disjuntores e Seccionadoras Tripolares (MCB3, MCCB, FU3)
  if (d.kind === 'breaker3' || d.kind === 'fuse3') {
    if (termId === '1') return { x: -w * 0.28, y: -h / 2, dir: 'top' };
    if (termId === '3') return { x: 0, y: -h / 2, dir: 'top' };
    if (termId === '5') return { x: w * 0.28, y: -h / 2, dir: 'top' };

    if (termId === '2') return { x: -w * 0.28, y: h / 2, dir: 'bottom' };
    if (termId === '4') return { x: 0, y: h / 2, dir: 'bottom' };
    if (termId === '6') return { x: w * 0.28, y: h / 2, dir: 'bottom' };
  }

  // 6. Disjuntores Unipolares e Fusíveis (MCB1, FUSE, SPD)
  if (d.kind === 'breaker' || d.kind === 'fuse' || d.kind === 'spd') {
    if (termId === '1' || termId === 'L' || func === 'IN') {
      return { x: 0, y: -h / 2, dir: 'top' };
    }
    return { x: 0, y: h / 2, dir: 'bottom' };
  }

  // 7. Dispositivos Diferenciais Residuais (RCD, RCBO)
  if (d.kind === 'rcd' || d.kind === 'rcbo') {
    if (termId === '1') return { x: -w * 0.25, y: -h / 2, dir: 'top' };
    if (termId === '3' || termId === 'N_IN') return { x: w * 0.25, y: -h / 2, dir: 'top' };
    if (termId === '2') return { x: -w * 0.25, y: h / 2, dir: 'bottom' };
    if (termId === '4' || termId === 'N_OUT') return { x: w * 0.25, y: h / 2, dir: 'bottom' };
  }

  // 8. Botoeiras (PBNO, PBNC, ESTOP) e Chaves (SW)
  if (d.kind === 'push' || d.kind === 'switch') {
    if (termId === '1' || termId === '3' || func === 'IN' || func === 'COM') {
      return { x: 0, y: -h / 2, dir: 'top' };
    }
    return { x: 0, y: h / 2, dir: 'bottom' };
  }

  // 9. Relé Auxiliar e Temporizadores (RELAY, TIMER, FLASH)
  if (d.kind === 'relay' || d.kind === 'timer' || d.kind === 'flasher') {
    if (termId === 'A1') return { x: -w * 0.35, y: -h / 2, dir: 'top' };
    if (termId === 'A2') return { x: -w * 0.35, y: h / 2, dir: 'bottom' };
    if (termId === '11' || termId === '15' || func === 'COM') return { x: 0, y: -h / 2, dir: 'top' };
    if (termId === '12' || termId === '16' || func === 'NC') return { x: w * 0.25, y: h / 2, dir: 'bottom' };
    if (termId === '14' || termId === '18' || func === 'NO') return { x: -w * 0.05, y: h / 2, dir: 'bottom' };
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

  // 11. Cargas / Lâmpadas / Sinalizadores (LAMP, PILOT_GREEN, PILOT_RED, BUZZ, HEATER)
  if (d.kind === 'lamp' || d.kind === 'load' || d.cat === 'loads' || d.code.startsWith('PILOT')) {
    const idx = d.terminals.findIndex(x => x[0] === termId);
    if (idx === 0 || termId === '+' || termId === '1' || termId === 'X1' || termId === 'L') {
      return { x: 0, y: -h / 2, dir: 'top' };
    }
    return { x: 0, y: h / 2, dir: 'bottom' };
  }

  // 12. Regra Geral de Fallback Normativo:
  const idx = d.terminals.findIndex(x => x[0] === termId);
  const isInput = func === 'IN' || func === 'COM' || idx % 2 === 0;
  const colRatio = Math.max(1, Math.ceil(d.terminals.length / 2));
  const colIndex = Math.floor(idx / 2);
  const xOffset = colRatio > 1 ? ((colIndex / (colRatio - 1)) - 0.5) * (w * 0.7) : 0;

  return {
    x: xOffset,
    y: isInput ? -h / 2 : h / 2,
    dir: isInput ? 'top' : 'bottom'
  };
}

/**
 * Retorna as coordenadas mundiais de um terminal com rotação
 */
export function getTerminalWorldPos(comp: any, termId: string): TerminalPosition {
  if (!comp) return { x: 0, y: 0, dir: 'bottom', normId: termId };
  const offset = getNormativeTerminalOffset(comp, termId);
  const rad = ((comp.rot || 0) * Math.PI) / 180;
  const rx = offset.x * Math.cos(rad) - offset.y * Math.sin(rad);
  const ry = offset.x * Math.sin(rad) + offset.y * Math.cos(rad);

  // Calcula a direção resultante após a rotação
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
 * Algoritmo de Roteamento Ortogonal Manhattan (90° Manhattan Wiring):
 * Garante que os condutores dobrem exclusivamente em ângulos retos de 90°
 * respeitando os stubs normativos de saída de cada terminal e aplicando
 * espaçamentos ordenados entre fios paralelos.
 */
export function calculateManhattanPath(
  pA: { x: number; y: number; dir?: 'top' | 'bottom' | 'left' | 'right' },
  pB: { x: number; y: number; dir?: 'top' | 'bottom' | 'left' | 'right' },
  wireIndex: number = 0
): { x: number; y: number }[] {
  const stub = 20;
  const dirA = pA.dir || 'bottom';
  const dirB = pB.dir || 'top';

  // 1. Ponto de saída do terminal A com stub ortogonal
  const sA = {
    x: pA.x + (dirA === 'right' ? stub : dirA === 'left' ? -stub : 0),
    y: pA.y + (dirA === 'bottom' ? stub : dirA === 'top' ? -stub : 0)
  };

  // 2. Ponto de aproximação do terminal B com stub ortogonal
  const sB = {
    x: pB.x + (dirB === 'right' ? stub : dirB === 'left' ? -stub : 0),
    y: pB.y + (dirB === 'bottom' ? stub : dirB === 'top' ? -stub : 0)
  };

  const points: { x: number; y: number }[] = [pA, sA];
  const offset = ((wireIndex % 5) - 2) * 8; // Offset anti-sobreposição entre fios paralelos

  if (dirA === 'bottom' && dirB === 'top') {
    if (sA.y <= sB.y) {
      // Direção descendente natural: desce até metade e vira a 90°
      const yMid = sA.y + (sB.y - sA.y) * 0.5 + offset;
      points.push({ x: sA.x, y: yMid });
      points.push({ x: sB.x, y: yMid });
    } else {
      // A está abaixo de B: desvio lateral desimpedido
      const xDetour = Math.max(sA.x, sB.x) + 40 + Math.abs(offset);
      points.push({ x: sA.x, y: sA.y + 15 });
      points.push({ x: xDetour, y: sA.y + 15 });
      points.push({ x: xDetour, y: sB.y - 15 });
      points.push({ x: sB.x, y: sB.y - 15 });
    }
  } else if (dirA === 'top' && dirB === 'bottom') {
    if (sA.y >= sB.y) {
      // Direção ascendente natural
      const yMid = sA.y + (sB.y - sA.y) * 0.5 + offset;
      points.push({ x: sA.x, y: yMid });
      points.push({ x: sB.x, y: yMid });
    } else {
      // A está acima de B
      const xDetour = Math.min(sA.x, sB.x) - 40 - Math.abs(offset);
      points.push({ x: sA.x, y: sA.y - 15 });
      points.push({ x: xDetour, y: sA.y - 15 });
      points.push({ x: xDetour, y: sB.y + 15 });
      points.push({ x: sB.x, y: sB.y + 15 });
    }
  } else if (dirA === 'bottom' && dirB === 'bottom') {
    // Ambos saem para baixo
    const yMax = Math.max(sA.y, sB.y) + 25 + Math.abs(offset);
    points.push({ x: sA.x, y: yMax });
    points.push({ x: sB.x, y: yMax });
  } else if (dirA === 'top' && dirB === 'top') {
    // Ambos saem para cima
    const yMin = Math.min(sA.y, sB.y) - 25 - Math.abs(offset);
    points.push({ x: sA.x, y: yMin });
    points.push({ x: sB.x, y: yMin });
  } else if (dirA === 'right' || dirB === 'right' || dirA === 'left' || dirB === 'left') {
    // Conexão lateral (ex: terminal PE ou aterramento)
    if (dirA === 'right') {
      points.push({ x: sA.x + 10, y: sA.y });
      points.push({ x: sA.x + 10, y: sB.y });
    } else {
      points.push({ x: sA.x, y: sB.y });
    }
  } else {
    // Caso padrão ortogonal em degrau
    points.push({ x: sA.x, y: sB.y });
  }

  points.push(sB);
  points.push(pB);

  // Filtra vértices colineares redundantes mantendo ângulos puros de 90°
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

export interface JunctionDot {
  x: number;
  y: number;
  netType: string;
}

/**
 * Identifica os nós de derivação reais (Junction Dots):
 * - Nós aparecem EXCLUSIVAMENTE em derivações em T (quando 3 ou mais ramos de condutores se conectam)
 * - Em cruzamentos normais (onde 2 fios simplesmente passam um pelo outro) NÃO É DESENHADO NÓ!
 */
export function findJunctionDots(
  components: any[],
  wires: any[]
): JunctionDot[] {
  if (!Array.isArray(components) || !Array.isArray(wires)) return [];

  // Mapear pontos terminais de cada fio
  const pointCounts = new Map<string, { count: number; x: number; y: number; netType: string }>();

  wires.forEach((wire, wireIdx) => {
    const compA = components.find(c => c.id === wire.a?.c);
    const compB = components.find(c => c.id === wire.b?.c);
    if (!compA || !compB) return;

    const posA = getTerminalWorldPos(compA, wire.a.t);
    const posB = getTerminalWorldPos(compB, wire.b.t);
    const path = calculateManhattanPath(posA, posB, wireIdx);

    // Avalia os pontos do caminho (especialmente extremidades e vértices)
    path.forEach((pt, idx) => {
      // Considera conexões nos terminais e nós intermediários
      if (idx === 0 || idx === path.length - 1) {
        const key = `${Math.round(pt.x / 4) * 4},${Math.round(pt.y / 4) * 4}`;
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

  // Retorna apenas pontos onde há união em T (3 ou mais conexões compartilhadas)
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
 * Auto-Organizar Fios e Conexões (Grid Snap e Alinhamento Ortogonal):
 * Reposiciona componentes ordenadamente na grade CAD (múltiplos de 40px)
 * eliminando sobreposições e garantindo rotas limpas a 90°.
 */
export function autoOrganizeCircuitWiring(project: any): any {
  if (!project || !Array.isArray(project.components)) return project;

  const GRID_SNAP = 40;
  const updatedComponents = project.components.map((c: any, idx: number) => {
    // Alinha à grade
    let nx = Math.round(c.x / GRID_SNAP) * GRID_SNAP;
    let ny = Math.round(c.y / GRID_SNAP) * GRID_SNAP;

    // Se estiver sobreposto a outro componente anterior, afasta
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

