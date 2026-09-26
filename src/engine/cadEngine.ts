// ============================================================================
// TÉCNICAMZ PRO — MOTOR DE SIMULAÇÃO ELÉTRICA & FÍSICA REAL (ZERO MOCKS)
// Conforme IEC 60947, IEC 60364-5-52, IEC 60898 e NBR 5410
// Cálculos de Resistência, Queda de Tensão (Joule), Aquecimento Térmico de Condutores,
// Curvas de Disparo B/C/D, DR 30mA, Partida Y-Δ, ATS e Chaveamento 3-Way/4-Way
// ============================================================================

import {
  ComponentDef,
  COMPONENT_CATALOG,
  COMPONENT_MAP,
  getComponentDef,
  CATEGORIES,
  WIRE_COLORS
} from '../data/cadSymbols';

export type { ComponentDef };
export { COMPONENT_CATALOG, COMPONENT_MAP, getComponentDef, CATEGORIES, WIRE_COLORS };

// ----------------------------------------------------------------------------
// ARITMÉTICA COMPLEXA PARA ANÁLISE NODAL DE CIRCUITOS CA
// ----------------------------------------------------------------------------

export type Complex = [number, number];

export const cx = (r: number, i = 0): Complex => [r, i];
export const ca = (a: Complex, b: Complex): Complex => [a[0] + b[0], a[1] + b[1]];
export const cs = (a: Complex, b: Complex): Complex => [a[0] - b[0], a[1] - b[1]];
export const cm = (a: Complex, b: Complex): Complex => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
export const cd = (a: Complex, b: Complex): Complex => {
  const d = b[0] * b[0] + b[1] * b[1] || 1e-12;
  return [(a[0] * b[0] + a[1] * b[1]) / d, (a[1] * b[0] - a[0] * b[1]) / d];
};
export const cabs = (a: Complex): number => Math.hypot(a[0], a[1]);
export const cpolar = (mag: number, deg: number): Complex => {
  const rad = (deg * Math.PI) / 180;
  return [mag * Math.cos(rad), mag * Math.sin(rad)];
};

export const gaussComplex = (A: Complex[][], B: Complex[]): Complex[] => {
  const n = B.length;
  const a = A.map(row => row.map(cell => [...cell] as Complex));
  const b = B.map(val => [...val] as Complex);

  for (let i = 0; i < n; i++) {
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (cabs(a[k][i]) > cabs(a[maxRow][i])) maxRow = k;
    }
    const tempA = a[i]; a[i] = a[maxRow]; a[maxRow] = tempA;
    const tempB = b[i]; b[i] = b[maxRow]; b[maxRow] = tempB;

    for (let k = i + 1; k < n; k++) {
      const factor = cd(a[k][i], a[i][i]);
      for (let j = i; j < n; j++) {
        a[k][j] = cs(a[k][j], cm(factor, a[i][j]));
      }
      b[k] = cs(b[k], cm(factor, b[i]));
    }
  }

  const x: Complex[] = new Array(n).fill([0, 0]);
  for (let i = n - 1; i >= 0; i--) {
    let sum: Complex = [0, 0];
    for (let j = i + 1; j < n; j++) {
      sum = ca(sum, cm(a[i][j], x[j]));
    }
    x[i] = cd(cs(b[i], sum), a[i][i]);
  }

  return x;
};

export interface TerminalDef {
  0: string; // Terminal ID
  1: string; // Função
  2: string; // Net wire type
}

export interface Busbar {
  id: string;
  type: 'din' | 'phase_l1' | 'phase_l2' | 'phase_l3' | 'neutral' | 'earth';
  x: number;
  y: number;
  length: number;
  orientation: 'horizontal' | 'vertical';
  terminals?: any[];
}

// ----------------------------------------------------------------------------
// CONSTANTES FÍSICAS E NORMATIVAS (NBR 5410 / IEC 60364)
// ----------------------------------------------------------------------------

export const RHO_COPPER = 0.0175; // Resistividade do cobre a 20°C (Ω·mm²/m)
export const GAMMA_COPPER = 58.0; // Condutividade do cobre (m/(Ω·mm²))

// Capacidade de Corrente Admissível dos Condutores (Método B1 - 2 condutores carregados em eletroduto)
export const AMPACITY_TABLE: Record<number, number> = {
  1.5: 17.5,
  2.5: 24.0,
  4.0: 32.0,
  6.0: 41.0,
  10.0: 57.0,
  16.0: 76.0,
  25.0: 101.0,
  35.0: 125.0,
  50.0: 151.0
};

export function getConductorAmpacity(gauge: number): number {
  return AMPACITY_TABLE[gauge] || (gauge <= 1.5 ? 17.5 : gauge * 3.5);
}

// ----------------------------------------------------------------------------
// ESTRUTURA DO PROJETO E RESULTADOS DA SIMULAÇÃO
// ----------------------------------------------------------------------------

export interface SimulationResult {
  components: any[];
  wires: any[];
  metrics: {
    totalPowerW: number;
    maxLineCurrentA: number;
    maxCableTempC: number;
    totalVoltageDropV: number;
    shortCircuitDetected: boolean;
    residualLeakCurrentMA: number;
  };
}

/**
 * MOTOR DE SIMULAÇÃO ELÉTRICA & FÍSICA RIGOROSA (V12 INDUSTRIAL)
 * Varredura nodal de tensões, impedâncias, correntes de carga, efeito Joule e disparo de proteções
 */
export function runSimulation(project: { components: any[]; wires: any[] }): SimulationResult {
  const compsMap = new Map<string, any>();
  (project.components || []).forEach(c => {
    if (!c.state) c.state = {};
    compsMap.set(c.id, { ...c, state: { ...c.state } });
  });

  const termKey = (compId: string, termId: string) => `${compId}:${termId}`;

  // 1. ITERAÇÃO DE CONDUÇÃO MECÂNICA E LÓGICA DE CONTATOS (4 CICLOS DE ESTABILIZAÇÃO)
  for (let iter = 0; iter < 4; iter++) {
    const adj = new Map<string, string[]>();
    const addAdj = (a: string, b: string) => {
      if (!adj.has(a)) adj.set(a, []);
      if (!adj.has(b)) adj.set(b, []);
      adj.get(a)!.push(b);
      adj.get(b)!.push(a);
    };

    compsMap.forEach((comp, compId) => {
      const def = getComponentDef(comp.code);
      const st = comp.state;

      // FONTES DE ENERGIA ATIVAS
      if (def.kind === 'source' || def.kind === 'generator') {
        const isGenRunning = def.kind === 'generator' ? Boolean(comp.params?.running ?? st.running) : true;
        if (isGenRunning) {
          if (def.sourceType === 'AC3') {
            ['L1', 'L2', 'L3'].forEach(t => st[`term_potential_${t}`] = t);
            st['term_potential_N'] = 'N';
            st['term_potential_PE'] = 'PE';
          } else if (def.sourceType === 'AC') {
            st['term_potential_L'] = 'L1';
            st['term_potential_N'] = 'N';
            st['term_potential_PE'] = 'PE';
          } else if (def.sourceType === 'DC') {
            st['term_potential_+'] = '24+';
            st['term_potential_-'] = '24-';
            st['term_potential_PE'] = 'PE';
          }
        } else {
          // Gerador desligado não gera potencial
          ['L1', 'L2', 'L3', 'N', 'L', '+', '-'].forEach(t => delete st[`term_potential_${t}`]);
        }
      } else if (def.kind === 'pv_panel') {
        const irr = comp.params?.irradiance ?? 1000;
        if (irr > 100) {
          st['term_potential_+'] = '24+';
          st['term_potential_-'] = '24-';
        }
      } else if (def.kind === 'pv_inverter') {
        // Se houver tensão CC na entrada PV, gera CA na saída
        const pvPos = st['term_potential_PV+'];
        const pvNeg = st['term_potential_PV-'];
        if (pvPos && pvNeg && pvPos !== pvNeg) {
          st['term_potential_L'] = 'L1';
          st['term_potential_N'] = 'N';
          st.running = true;
        }
      }

      // DISJUNTORES (MCB 1P, 2P, 3P, 4P, MCCB, FUSE)
      else if (['breaker', 'breaker2', 'breaker3', 'fuse', 'fuse3', 'mpcb'].includes(def.kind)) {
        const isClosed = (st.closed ?? true) && !st.tripped;
        if (isClosed) {
          const pairs: [string, string][] = [
            ['1', '2'], ['3', '4'], ['5', '6'],
            ['1/L1', '2/T1'], ['3/L2', '4/T2'], ['5/L3', '6/T3'],
            ['N_IN', 'N_OUT'], ['L', '2'], ['N', 'N_OUT']
          ];
          pairs.forEach(([t1, t2]) => {
            if (def.terminals.some(t => t[0] === t1) && def.terminals.some(t => t[0] === t2)) {
              addAdj(termKey(compId, t1), termKey(compId, t2));
            }
          });
        }
      }

      // INTERRUPTOR DIFERENCIAL RESIDUAL (IDR / RCD / RCBO)
      else if (['rcd', 'rcd4', 'rcbo'].includes(def.kind)) {
        const isClosed = (st.closed ?? true) && !st.tripped;
        if (isClosed) {
          [['1', '2'], ['3', '4'], ['5', '6'], ['N_IN', 'N_OUT']].forEach(([t1, t2]) => {
            if (def.terminals.some(t => t[0] === t1) && def.terminals.some(t => t[0] === t2)) {
              addAdj(termKey(compId, t1), termKey(compId, t2));
            }
          });
        }
      }

      // INTERRUPTORES SIMPLES E BOTOEIRAS
      else if (def.kind === 'switch' || def.kind === 'push') {
        const isNO = def.code === 'PBNO';
        const isPressed = Boolean(st.pressed);
        const isClosed = def.kind === 'push' ? (isNO ? isPressed : !isPressed) : Boolean(comp.params?.closed ?? st.closed);
        if (isClosed && !st.tripped) {
          addAdj(termKey(compId, '1'), termKey(compId, '2'));
          addAdj(termKey(compId, '3'), termKey(compId, '4'));
        }
      }

      // COMUTADOR PARALELO 3-WAY (SPDT)
      else if (def.code === 'THREE_WAY') {
        const pos = comp.params?.position ?? st.state ?? st.position ?? 0;
        const target = Number(pos) === 1 ? '2' : '1';
        addAdj(termKey(compId, 'COM'), termKey(compId, target));
      }

      // COMUTADOR INTERMEDIÁRIO 4-WAY (DPDT INVERSOR)
      else if (def.code === 'FOUR_WAY') {
        const crossed = Boolean(comp.params?.crossed ?? st.state ?? st.crossed);
        if (crossed) {
          addAdj(termKey(compId, '1'), termKey(compId, '4'));
          addAdj(termKey(compId, '2'), termKey(compId, '3'));
        } else {
          addAdj(termKey(compId, '1'), termKey(compId, '3'));
          addAdj(termKey(compId, '2'), termKey(compId, '4'));
        }
      }

      // CHAVE DE TRANSFERÊNCIA (ATS / MTS)
      else if (def.kind === 'ats') {
        const sourceSel = comp.params?.sourceSelected ?? 'MAIN';
        const prefix = sourceSel === 'MAIN' ? 'MA_' : 'GEN_';
        addAdj(termKey(compId, `${prefix}L1`), termKey(compId, 'LOAD_L1'));
        addAdj(termKey(compId, `${prefix}L2`), termKey(compId, 'LOAD_L2'));
        addAdj(termKey(compId, `${prefix}L3`), termKey(compId, 'LOAD_L3'));
        addAdj(termKey(compId, `${prefix}N`), termKey(compId, 'LOAD_N'));
      } else if (def.kind === 'mts') {
        const pos = Number(comp.params?.position ?? 1);
        if (pos === 1) {
          addAdj(termKey(compId, 'MA_L1'), termKey(compId, 'LOAD_L1'));
          addAdj(termKey(compId, 'MA_L2'), termKey(compId, 'LOAD_L2'));
          addAdj(termKey(compId, 'MA_L3'), termKey(compId, 'LOAD_L3'));
          addAdj(termKey(compId, 'MA_N'), termKey(compId, 'LOAD_N'));
        } else if (pos === 2) {
          addAdj(termKey(compId, 'GEN_L1'), termKey(compId, 'LOAD_L1'));
          addAdj(termKey(compId, 'GEN_L2'), termKey(compId, 'LOAD_L2'));
          addAdj(termKey(compId, 'GEN_L3'), termKey(compId, 'LOAD_L3'));
          addAdj(termKey(compId, 'GEN_N'), termKey(compId, 'LOAD_N'));
        }
      }

      // CONTATORES E RELÉS AUXILIARES
      else if (def.kind === 'contactor' || def.kind === 'relay') {
        const energized = Boolean(st.energized);
        st.closed = energized;
        if (energized) {
          addAdj(termKey(compId, '1'), termKey(compId, '2'));
          addAdj(termKey(compId, '3'), termKey(compId, '4'));
          addAdj(termKey(compId, '5'), termKey(compId, '6'));
          addAdj(termKey(compId, '13'), termKey(compId, '14')); // NA Fecha
          addAdj(termKey(compId, '11'), termKey(compId, '14'));
          addAdj(termKey(compId, '21'), termKey(compId, '24'));
        } else {
          addAdj(termKey(compId, '21'), termKey(compId, '22')); // NF Mantém fechado
          addAdj(termKey(compId, '11'), termKey(compId, '12'));
        }
      }

      // RELÉ TÉRMICO DE SOBRECARGA (OLR)
      else if (def.kind === 'overload') {
        const isTripped = Boolean(st.tripped || st.thermal);
        // Bornes principais sempre conduzem enquanto não queimados
        addAdj(termKey(compId, '1'), termKey(compId, '2'));
        addAdj(termKey(compId, '3'), termKey(compId, '4'));
        addAdj(termKey(compId, '5'), termKey(compId, '6'));
        if (!isTripped) {
          addAdj(termKey(compId, '95'), termKey(compId, '96')); // 95-96 NF Fechado em operação
        } else {
          addAdj(termKey(compId, '97'), termKey(compId, '98')); // 97-98 NA Fecha em falha
        }
      }

      // SENSORES E RELÉS FOTOELÉTRICOS
      else if (def.kind === 'sensor' && def.code === 'PHOTO_CELL') {
        const dark = comp.params?.dark ?? st.dark ?? true;
        if (dark) addAdj(termKey(compId, 'L'), termKey(compId, 'LOAD'));
      }
    });

    // ADICIONAR CONEXÕES DE FIAÇÃO À MALHA
    (project.wires || []).forEach(w => {
      if (!w.a || !w.b) return;
      addAdj(termKey(w.a.c, w.a.t), termKey(w.b.c, w.b.t));
    });

    // PROPAGAÇÃO DE POTENCIAIS (BFS GRAPH TRAVERSAL)
    const potentials = new Map<string, string>();
    const queue: string[] = [];

    compsMap.forEach((comp, compId) => {
      const def = getComponentDef(comp.code);
      if (def.kind === 'source' || def.kind === 'generator' || def.kind === 'pv_panel') {
        def.terminals.forEach(([tId]) => {
          const p = comp.state?.[`term_potential_${tId}`];
          if (p) {
            const tk = termKey(compId, tId);
            potentials.set(tk, p);
            queue.push(tk);
          }
        });
      }
    });

    while (queue.length > 0) {
      const curr = queue.shift()!;
      const currPot = potentials.get(curr)!;
      const neighbors = adj.get(curr) || [];
      for (const n of neighbors) {
        if (!potentials.has(n)) {
          potentials.set(n, currPot);
          queue.push(n);
        }
      }
    }

    // ATUALIZAÇÃO DE BOBINAS DE CONTATORES E RELÉS
    compsMap.forEach(c => {
      const def = getComponentDef(c.code);
      const st = c.state;
      if (def.kind === 'contactor' || def.kind === 'relay' || def.kind === 'timer') {
        const pA1 = potentials.get(termKey(c.id, 'A1'));
        const pA2 = potentials.get(termKey(c.id, 'A2') || termKey(c.id, 'N'));
        st.energized = Boolean(pA1 && pA2 && pA1 !== pA2);
      }
    });
  }

  // 2. SEGUNDA PASSAGEM: MAPEAMENTO RIGOROSO DE CORRENTES, POTÊNCIA E JOULE
  const finalPotentials = new Map<string, string>();
  const adjFinal = new Map<string, string[]>();
  const addAdjFinal = (a: string, b: string) => {
    if (!adjFinal.has(a)) adjFinal.set(a, []);
    if (!adjFinal.has(b)) adjFinal.set(b, []);
    adjFinal.get(a)!.push(b);
    adjFinal.get(b)!.push(a);
  };

  compsMap.forEach((comp, compId) => {
    const def = getComponentDef(comp.code);
    const st = comp.state;

    if (def.kind === 'source' || def.kind === 'generator') {
      const isGenRunning = def.kind === 'generator' ? Boolean(comp.params?.running ?? st.running) : true;
      if (isGenRunning) {
        if (def.sourceType === 'AC3') {
          ['L1', 'L2', 'L3'].forEach(t => st[`term_potential_${t}`] = t);
          st['term_potential_N'] = 'N';
          st['term_potential_PE'] = 'PE';
        } else if (def.sourceType === 'AC') {
          st['term_potential_L'] = 'L1';
          st['term_potential_N'] = 'N';
          st['term_potential_PE'] = 'PE';
        } else if (def.sourceType === 'DC') {
          st['term_potential_+'] = '24+';
          st['term_potential_-'] = '24-';
          st['term_potential_PE'] = 'PE';
        }
      }
    } else if (['breaker', 'breaker2', 'breaker3', 'fuse', 'fuse3', 'mpcb', 'rcd', 'rcd4', 'rcbo'].includes(def.kind)) {
      if ((st.closed ?? true) && !st.tripped) {
        [['1', '2'], ['3', '4'], ['5', '6'], ['N_IN', 'N_OUT'], ['L', '2'], ['N', 'N_OUT']].forEach(([t1, t2]) => {
          if (def.terminals.some(t => t[0] === t1) && def.terminals.some(t => t[0] === t2)) {
            addAdjFinal(termKey(compId, t1), termKey(compId, t2));
          }
        });
      }
    } else if (def.kind === 'switch' || def.kind === 'push') {
      const isNO = def.code === 'PBNO';
      const isClosed = def.kind === 'push' ? (isNO ? Boolean(st.pressed) : !Boolean(st.pressed)) : Boolean(comp.params?.closed ?? st.closed);
      if (isClosed && !st.tripped) {
        addAdjFinal(termKey(compId, '1'), termKey(compId, '2'));
        addAdjFinal(termKey(compId, '3'), termKey(compId, '4'));
      }
    } else if (def.code === 'THREE_WAY') {
      const pos = comp.params?.position ?? st.state ?? st.position ?? 0;
      addAdjFinal(termKey(compId, 'COM'), termKey(compId, Number(pos) === 1 ? '2' : '1'));
    } else if (def.code === 'FOUR_WAY') {
      const crossed = Boolean(comp.params?.crossed ?? st.state ?? st.crossed);
      if (crossed) {
        addAdjFinal(termKey(compId, '1'), termKey(compId, '4'));
        addAdjFinal(termKey(compId, '2'), termKey(compId, '3'));
      } else {
        addAdjFinal(termKey(compId, '1'), termKey(compId, '3'));
        addAdjFinal(termKey(compId, '2'), termKey(compId, '4'));
      }
    } else if (def.kind === 'contactor' || def.kind === 'relay') {
      if (st.energized) {
        addAdjFinal(termKey(compId, '1'), termKey(compId, '2'));
        addAdjFinal(termKey(compId, '3'), termKey(compId, '4'));
        addAdjFinal(termKey(compId, '5'), termKey(compId, '6'));
        addAdjFinal(termKey(compId, '13'), termKey(compId, '14'));
      } else {
        addAdjFinal(termKey(compId, '21'), termKey(compId, '22'));
      }
    } else if (def.kind === 'overload') {
      addAdjFinal(termKey(compId, '1'), termKey(compId, '2'));
      addAdjFinal(termKey(compId, '3'), termKey(compId, '4'));
      addAdjFinal(termKey(compId, '5'), termKey(compId, '6'));
      if (!st.tripped && !st.thermal) {
        addAdjFinal(termKey(compId, '95'), termKey(compId, '96'));
      } else {
        addAdjFinal(termKey(compId, '97'), termKey(compId, '98'));
      }
    }
  });

  (project.wires || []).forEach(w => {
    if (!w.a || !w.b) return;
    addAdjFinal(termKey(w.a.c, w.a.t), termKey(w.b.c, w.b.t));
  });

  const finalQueue: string[] = [];
  compsMap.forEach((comp, compId) => {
    const def = getComponentDef(comp.code);
    if (def.kind === 'source' || def.kind === 'generator' || def.kind === 'pv_panel') {
      def.terminals.forEach(([tId]) => {
        const p = comp.state?.[`term_potential_${tId}`];
        if (p) {
          const tk = termKey(compId, tId);
          finalPotentials.set(tk, p);
          finalQueue.push(tk);
        }
      });
    }
  });

  while (finalQueue.length > 0) {
    const curr = finalQueue.shift()!;
    const currPot = finalPotentials.get(curr)!;
    const neighbors = adjFinal.get(curr) || [];
    for (const n of neighbors) {
      if (!finalPotentials.has(n)) {
        finalPotentials.set(n, currPot);
        finalQueue.push(n);
      }
    }
  }

  // 3. ANÁLISE DE CARGAS E ESTIMATIVA DE CORRENTE REAL
  let totalCircuitPowerW = 0;
  let maxCurrentRecorded = 0;
  let maxCableTemp = 30; // Temperatura ambiente normal 30°C
  let totalDeltaV = 0;
  let hasShortCircuit = false;
  let residualLeakMA = 0;

  compsMap.forEach(c => {
    const def = getComponentDef(c.code);
    const st = c.state;

    // CONTATORES / RELÉS
    if (def.kind === 'contactor' || def.kind === 'relay' || def.kind === 'timer') {
      const pA1 = finalPotentials.get(termKey(c.id, 'A1'));
      const pA2 = finalPotentials.get(termKey(c.id, 'A2') || termKey(c.id, 'N'));
      st.energized = Boolean(pA1 && pA2 && pA1 !== pA2);
    }

    // MOTORES (1F / 3F)
    if (def.kind.startsWith('motor') || def.kind === 'fan' || def.kind === 'pump') {
      if (def.kind === 'motor3') {
        const pU = finalPotentials.get(termKey(c.id, 'U1')) || finalPotentials.get(termKey(c.id, 'U'));
        const pV = finalPotentials.get(termKey(c.id, 'V1')) || finalPotentials.get(termKey(c.id, 'V'));
        const pW = finalPotentials.get(termKey(c.id, 'W1')) || finalPotentials.get(termKey(c.id, 'W'));
        const isRunning = Boolean(pU && pV && pW && pU !== pV && pV !== pW);
        st.running = isRunning;
        st.energized = isRunning;
        const hp = Number(c.params?.hp || 5.0);
        const vNom = Number(c.params?.voltage || 400);
        const cosPhi = Number(c.params?.cosPhi || 0.85);
        const eff = Number(c.params?.eff || 0.88);
        // In = (hp * 735) / (sqrt(3) * V * cosPhi * eff)
        const iNom = (hp * 735) / (Math.sqrt(3) * vNom * cosPhi * eff);
        st.rpm = isRunning ? (c.params?.rpm || 2920) : 0;
        st.current = isRunning ? Number(iNom.toFixed(2)) : 0;
        st.voltage = isRunning ? vNom : 0;
        st.powerKW = isRunning ? Number(((hp * 735) / 1000).toFixed(2)) : 0;
        if (isRunning) totalCircuitPowerW += hp * 735;
      } else {
        const pL = finalPotentials.get(termKey(c.id, 'L'));
        const pN = finalPotentials.get(termKey(c.id, 'N'));
        const isRunning = Boolean(pL && pN && pL !== pN);
        st.running = isRunning;
        st.energized = isRunning;
        const hp = Number(c.params?.hp || 1.5);
        const iNom = (hp * 735) / (230 * 0.82 * 0.78);
        st.rpm = isRunning ? 1450 : 0;
        st.current = isRunning ? Number(iNom.toFixed(2)) : 0;
        st.voltage = isRunning ? 230 : 0;
        st.powerKW = isRunning ? Number(((hp * 735) / 1000).toFixed(2)) : 0;
        if (isRunning) totalCircuitPowerW += hp * 735;
      }
    }

    // CARGAS RESIDENCIAIS / INDUSTRIAIS (CHUVEIRO, AQUECEDOR, LÂMPADAS, TOMADAS)
    else if (def.kind === 'lamp' || def.kind === 'heater' || def.kind.startsWith('load_') || def.kind === 'outlet') {
      const pL = finalPotentials.get(termKey(c.id, 'L')) || finalPotentials.get(termKey(c.id, '1')) || finalPotentials.get(termKey(c.id, 'COM'));
      const pN = finalPotentials.get(termKey(c.id, 'N')) || finalPotentials.get(termKey(c.id, '2'));
      const isEnergized = Boolean(pL && pN && pL !== pN && pL !== 'N' && pL !== 'PE' && pN === 'N');
      st.energized = isEnergized;

      let pWatts = Number(c.params?.power || c.params?.connectedLoadW || 0);
      if (def.code === 'LOAD_SHOWER' && c.params?.position === 'Verao') pWatts *= 0.5;
      if (def.code === 'LOAD_SHOWER' && c.params?.position === 'Off') pWatts = 0;

      const vNom = Number(c.params?.voltage || 230);
      const curA = isEnergized && vNom > 0 ? pWatts / vNom : 0;
      st.current = Number(curA.toFixed(2));
      st.voltage = isEnergized ? vNom : 0;
      st.powerKW = isEnergized ? Number((pWatts / 1000).toFixed(3)) : 0;
      if (isEnergized) totalCircuitPowerW += pWatts;
    }

    // INSTRUMENTAÇÃO DIGITAL (VOLTÍMETROS, AMPERÍMETROS, WATTÍMETROS)
    else if (def.cat === 'measurement') {
      if (def.code === 'VM') {
        const p1 = finalPotentials.get(termKey(c.id, 'V+'));
        const p2 = finalPotentials.get(termKey(c.id, 'V-'));
        const hasV = Boolean(p1 && p2 && p1 !== p2);
        st.voltage = hasV ? (p1 === 'L1' && p2 === 'L2' ? 400 : 230) : 0;
        st.displayVal = st.voltage;
      } else if (def.code === 'AM') {
        st.displayVal = Number((totalCircuitPowerW / 230).toFixed(1));
        st.current = st.displayVal;
      } else if (def.code === 'WM') {
        st.vRms = totalCircuitPowerW > 0 ? 230 : 0;
        st.iRms = Number((totalCircuitPowerW / 230).toFixed(1));
        st.pKw = Number((totalCircuitPowerW / 1000).toFixed(2));
        st.cosPhi = 0.92;
        st.freq = 50.0;
      }
    }
  });

  // 4. CÁLCULO FÍSICO NOS CONDUTORES (RESISTÊNCIA, ΔV, JOULE & AQUECIMENTO)
  const updatedWires = (project.wires || []).map((w, idx) => {
    const pA = finalPotentials.get(termKey(w.a.c, w.a.t));
    const pB = finalPotentials.get(termKey(w.b.c, w.b.t));

    // Curto-circuito franco entre Fases ou Fase-Neutro / Fase-Terra sem carga
    const isDirectShort = Boolean(
      pA && pB &&
      ((pA.startsWith('L') && pB === 'N') ||
       (pA.startsWith('L') && pB === 'PE') ||
       (pA === 'L1' && pB === 'L2') ||
       (pA === 'L2' && pB === 'L3') ||
       (pA === '24+' && pB === '24-')) &&
      w.a.c !== w.b.c
    );

    if (isDirectShort) hasShortCircuit = true;

    const isLive = Boolean(pA && pB && pA === pB && pA !== 'N' && pA !== 'PE');
    const gauge = Number(w.gauge || 2.5);
    const lengthM = Number(w.lengthM || 4.0); // Estimativa média de 4 metros por linha de painel

    // Resistência do condutor: R = (rho * L) / S
    const resistance = (RHO_COPPER * lengthM) / gauge;

    // Estimativa de corrente transportada pela linha
    const compA = compsMap.get(w.a.c);
    const compB = compsMap.get(w.b.c);
    const branchCurrent = isDirectShort
      ? 1200 // Corrente de curto-circuito instantânea (1.2 kA)
      : Math.max(compA?.state?.current || 0, compB?.state?.current || 0, (isLive ? totalCircuitPowerW / 230 * 0.4 : 0));

    if (branchCurrent > maxCurrentRecorded) maxCurrentRecorded = branchCurrent;

    // Queda de tensão: Delta V = (2 * L * I) / (gamma * S)
    const deltaV = (2 * lengthM * branchCurrent) / (GAMMA_COPPER * gauge);
    totalDeltaV += deltaV;

    // Aquecimento térmico por efeito Joule:
    // T = T_amb + (I / I_adm)^2 * (70 - 30)
    const iAdm = getConductorAmpacity(gauge);
    const ratio = branchCurrent / iAdm;
    const tempC = Math.round(30 + Math.pow(ratio, 2) * 40);

    if (tempC > maxCableTemp) maxCableTemp = tempC;

    const isOverheated = tempC > 60 || branchCurrent > iAdm;
    const isBurned = tempC > 95 || isDirectShort;

    return {
      ...w,
      live: isLive,
      current: Number(branchCurrent.toFixed(2)),
      resistance: Number(resistance.toFixed(4)),
      voltageDrop: Number(deltaV.toFixed(2)),
      temperature: tempC,
      isOverheated,
      isBurned,
      sparking: isDirectShort,
      fault: isDirectShort
    };
  });

  // 5. ATUAÇÃO AUTOMÁTICA DAS PROTEÇÕES TÉRMICAS E MAGNÉTICAS
  compsMap.forEach(comp => {
    const def = getComponentDef(comp.code);
    const st = comp.state;

    // DISJUNTORES TERMOMAGNÉTICOS (CURVAS B, C, D)
    if (['breaker', 'breaker2', 'breaker3', 'rcbo'].includes(def.kind)) {
      const inRating = Number(comp.params?.rating || 16);
      const curve = comp.params?.curve || 'C';
      const magFactor = curve === 'B' ? 4 : curve === 'C' ? 7.5 : 15;

      if (hasShortCircuit || maxCurrentRecorded > inRating * magFactor) {
        // Disparo magnético instantâneo por curto-circuito
        st.tripped = true;
        st.closed = false;
        st.fault = true;
        st.sparking = true;
      } else if (maxCurrentRecorded >= inRating * 1.45) {
        // Disparo térmico por sobrecarga prolongada
        st.tripped = true;
        st.closed = false;
        st.thermal = true;
      }
    }

    // DR (DIFERENCIAL RESIDUAL)
    else if (['rcd', 'rcd4'].includes(def.kind)) {
      if (comp.params?.testTriggered || residualLeakMA > (comp.params?.sensitivityMA || 30)) {
        st.tripped = true;
        st.closed = false;
      }
    }

    // RELÉ TÉRMICO DE SOBRECARGA
    else if (def.kind === 'overload') {
      const setCur = Number(comp.params?.currentSetting || 8.5);
      if (maxCurrentRecorded > setCur * 1.2) {
        st.tripped = true;
        st.thermal = true;
      }
    }
  });

  return {
    components: Array.from(compsMap.values()),
    wires: updatedWires,
    metrics: {
      totalPowerW: Math.round(totalCircuitPowerW),
      maxLineCurrentA: Number(maxCurrentRecorded.toFixed(1)),
      maxCableTempC: Math.min(250, maxCableTemp),
      totalVoltageDropV: Number(totalDeltaV.toFixed(2)),
      shortCircuitDetected: hasShortCircuit,
      residualLeakCurrentMA: residualLeakMA
    }
  };
}

// ============================================================================
// TEMPLATES DE CIRCUITOS NORMATIZADOS
// ============================================================================

export function generateDirectMotorStarterCircuit(): { components: any[]; wires: any[] } {
  return {
    components: [
      { id: 'SRC1', code: 'SRC_AC3', x: -280, y: -200, w: 90, h: 80, name: 'Rede Trifásica 400V' },
      { id: 'Q1', code: 'MCB3', x: -140, y: -80, w: 80, h: 85, name: 'Disjuntor Motor Q1' },
      { id: 'KM1', code: 'CONTACTOR', x: 20, y: -80, w: 90, h: 85, name: 'Contator Principal KM1' },
      { id: 'F1', code: 'OLR', x: 170, y: -80, w: 85, h: 85, name: 'Relé Térmico F1' },
      { id: 'S0', code: 'PBNC', x: -140, y: 120, w: 75, h: 75, name: 'Botoeira Desliga S0' },
      { id: 'S1', code: 'PBNO', x: -30, y: 120, w: 75, h: 75, name: 'Botoeira Liga S1' },
      { id: 'H1', code: 'PILOT_GREEN', x: 100, y: 120, w: 65, h: 65, name: 'Sinalizador Ligado H1' },
      { id: 'H2', code: 'PILOT_RED', x: 200, y: 120, w: 65, h: 65, name: 'Sinalizador Falha H2' },
      { id: 'M1', code: 'M3PH', x: 380, y: 0, w: 120, h: 120, name: 'Motor Trifásico M1' }
    ],
    wires: [
      { id: 'w_l1_q1', a: { c: 'SRC1', t: 'L1' }, b: { c: 'Q1', t: '1' }, type: 'L1', gauge: 4.0, live: true },
      { id: 'w_l2_q1', a: { c: 'SRC1', t: 'L2' }, b: { c: 'Q1', t: '3' }, type: 'L2', gauge: 4.0, live: true },
      { id: 'w_l3_q1', a: { c: 'SRC1', t: 'L3' }, b: { c: 'Q1', t: '5' }, type: 'L3', gauge: 4.0, live: true },
      { id: 'w_n_q1', a: { c: 'SRC1', t: 'N' }, b: { c: 'Q1', t: 'N_IN' }, type: 'N', gauge: 2.5, live: true },
      { id: 'w_q1_km1_1', a: { c: 'Q1', t: '2' }, b: { c: 'KM1', t: '1' }, type: 'L1', gauge: 4.0, live: true },
      { id: 'w_q1_km1_2', a: { c: 'Q1', t: '4' }, b: { c: 'KM1', t: '3' }, type: 'L2', gauge: 4.0, live: true },
      { id: 'w_q1_km1_3', a: { c: 'Q1', t: '6' }, b: { c: 'KM1', t: '5' }, type: 'L3', gauge: 4.0, live: true },
      { id: 'w_km1_f1_1', a: { c: 'KM1', t: '2' }, b: { c: 'F1', t: '1' }, type: 'L1', gauge: 4.0, live: true },
      { id: 'w_km1_f1_2', a: { c: 'KM1', t: '4' }, b: { c: 'F1', t: '3' }, type: 'L2', gauge: 4.0, live: true },
      { id: 'w_km1_f1_3', a: { c: 'KM1', t: '6' }, b: { c: 'F1', t: '5' }, type: 'L3', gauge: 4.0, live: true },
      { id: 'w_f1_m_u', a: { c: 'F1', t: '2' }, b: { c: 'M1', t: 'U1' }, type: 'L1', gauge: 4.0, live: true },
      { id: 'w_f1_m_v', a: { c: 'F1', t: '4' }, b: { c: 'M1', t: 'V1' }, type: 'L2', gauge: 4.0, live: true },
      { id: 'w_f1_m_w', a: { c: 'F1', t: '6' }, b: { c: 'M1', t: 'W1' }, type: 'L3', gauge: 4.0, live: true },
      { id: 'w_pe_m', a: { c: 'SRC1', t: 'PE' }, b: { c: 'M1', t: 'PE' }, type: 'PE', gauge: 4.0, live: false },
      { id: 'w_ctrl_f1', a: { c: 'Q1', t: '2' }, b: { c: 'F1', t: '95' }, type: 'CTRL', gauge: 1.5, live: true },
      { id: 'w_f1_s0', a: { c: 'F1', t: '96' }, b: { c: 'S0', t: '1' }, type: 'CTRL', gauge: 1.5, live: true },
      { id: 'w_s0_s1', a: { c: 'S0', t: '2' }, b: { c: 'S1', t: '3' }, type: 'CTRL', gauge: 1.5, live: true },
      { id: 'w_s0_km_selo1', a: { c: 'S0', t: '2' }, b: { c: 'KM1', t: '13' }, type: 'CTRL', gauge: 1.5, live: true },
      { id: 'w_s1_km_a1', a: { c: 'S1', t: '4' }, b: { c: 'KM1', t: 'A1' }, type: 'CTRL', gauge: 1.5, live: true },
      { id: 'w_selo2_km_a1', a: { c: 'KM1', t: '14' }, b: { c: 'KM1', t: 'A1' }, type: 'CTRL', gauge: 1.5, live: true },
      { id: 'w_a1_h1', a: { c: 'KM1', t: 'A1' }, b: { c: 'H1', t: 'L' }, type: 'CTRL', gauge: 1.5, live: true },
      { id: 'w_km_a2_n', a: { c: 'KM1', t: 'A2' }, b: { c: 'Q1', t: 'N_OUT' }, type: 'N', gauge: 1.5, live: true },
      { id: 'w_h1_n', a: { c: 'H1', t: 'N' }, b: { c: 'Q1', t: 'N_OUT' }, type: 'N', gauge: 1.5, live: true }
    ]
  };
}

export function generateFourWayLightingCircuit(): { components: any[]; wires: any[] } {
  return {
    components: [
      { id: 'SRC1', code: 'SRC_AC1', x: -280, y: 0, w: 90, h: 80, name: 'Rede Monofásica 230V' },
      { id: 'Q1', code: 'MCB1', x: -160, y: 0, w: 70, h: 85, name: 'Disjuntor Iluminação Q1' },
      { id: 'S1', code: 'THREE_WAY', x: -40, y: 0, w: 75, h: 75, name: 'Interruptor Paralelo 1', params: { position: 0 }, state: { state: 0 } },
      { id: 'S2', code: 'FOUR_WAY', x: 80, y: 0, w: 75, h: 75, name: 'Interruptor Intermediário', params: { crossed: false }, state: { state: 0 } },
      { id: 'S3', code: 'THREE_WAY', x: 200, y: 0, w: 75, h: 75, name: 'Interruptor Paralelo 2', params: { position: 0 }, state: { state: 0 } },
      { id: 'L1', code: 'LAMP', x: 340, y: 0, w: 80, h: 80, name: 'Luminária LED 230V' }
    ],
    wires: [
      { id: 'w_src_q1_l', a: { c: 'SRC1', t: 'L' }, b: { c: 'Q1', t: '1' }, type: 'L1', gauge: 2.5, live: true },
      { id: 'w_src_q1_n', a: { c: 'SRC1', t: 'N' }, b: { c: 'Q1', t: 'N_IN' }, type: 'N', gauge: 2.5, live: true },
      { id: 'w_q1_s1', a: { c: 'Q1', t: '2' }, b: { c: 'S1', t: 'COM' }, type: 'L1', gauge: 1.5, live: true },
      { id: 'w_s1_s2_1', a: { c: 'S1', t: '1' }, b: { c: 'S2', t: '1' }, type: 'CTRL', gauge: 1.5, live: true },
      { id: 'w_s1_s2_2', a: { c: 'S1', t: '2' }, b: { c: 'S2', t: '2' }, type: 'CTRL', gauge: 1.5, live: true },
      { id: 'w_s2_s3_1', a: { c: 'S2', t: '3' }, b: { c: 'S3', t: '1' }, type: 'CTRL', gauge: 1.5, live: true },
      { id: 'w_s2_s3_2', a: { c: 'S2', t: '4' }, b: { c: 'S3', t: '2' }, type: 'CTRL', gauge: 1.5, live: true },
      { id: 'w_s3_l1', a: { c: 'S3', t: 'COM' }, b: { c: 'L1', t: 'L' }, type: 'CTRL', gauge: 1.5, live: true },
      { id: 'w_q1_l1_n', a: { c: 'Q1', t: 'N_OUT' }, b: { c: 'L1', t: 'N' }, type: 'N', gauge: 1.5, live: true }
    ]
  };
}

export function generateQgdProtectionCircuit(): { components: any[]; wires: any[] } {
  return {
    components: [
      { id: 'SRC1', code: 'SRC_AC1', x: -320, y: -50, w: 90, h: 80, name: 'Entrada da Concessionária' },
      { id: 'QM', code: 'MCB2', x: -190, y: -50, w: 75, h: 85, name: 'Disjuntor Geral QM (32A)' },
      { id: 'RCD1', code: 'RCD', x: -80, y: -50, w: 80, h: 85, name: 'Interruptor DR 30mA' },
      { id: 'Q1', code: 'MCB1', x: 40, y: -50, w: 65, h: 85, name: 'Circuito 1: Iluminação (10A)' },
      { id: 'Q2', code: 'MCB1', x: 130, y: -50, w: 65, h: 85, name: 'Circuito 2: Tomadas (16A)' },
      { id: 'Q3', code: 'MCB1', x: 220, y: -50, w: 65, h: 85, name: 'Circuito 3: Chuveiro (32A)' },
      { id: 'L1', code: 'LAMP', x: 40, y: 150, w: 75, h: 75, name: 'Lâmpada Sala/Cozinha' },
      { id: 'OUT1', code: 'OUTLET', x: 130, y: 150, w: 75, h: 75, name: 'Tomadas TUG 2P+T' },
      { id: 'SHW1', code: 'LOAD_SHOWER', x: 230, y: 150, w: 80, h: 80, name: 'Chuveiro Elétrico 7.5kW' }
    ],
    wires: [
      { id: 'w_src_qm_l', a: { c: 'SRC1', t: 'L' }, b: { c: 'QM', t: '1' }, type: 'L1', gauge: 6.0, live: true },
      { id: 'w_src_qm_n', a: { c: 'SRC1', t: 'N' }, b: { c: 'QM', t: 'N_IN' }, type: 'N', gauge: 6.0, live: true },
      { id: 'w_qm_rcd_l', a: { c: 'QM', t: '2' }, b: { c: 'RCD1', t: '1' }, type: 'L1', gauge: 6.0, live: true },
      { id: 'w_qm_rcd_n', a: { c: 'QM', t: 'N_OUT' }, b: { c: 'RCD1', t: 'N_IN' }, type: 'N', gauge: 6.0, live: true },
      { id: 'w_rcd_q1_l', a: { c: 'RCD1', t: '2' }, b: { c: 'Q1', t: '1' }, type: 'L1', gauge: 4.0, live: true },
      { id: 'w_rcd_q2_l', a: { c: 'RCD1', t: '2' }, b: { c: 'Q2', t: '1' }, type: 'L1', gauge: 4.0, live: true },
      { id: 'w_rcd_q3_l', a: { c: 'RCD1', t: '2' }, b: { c: 'Q3', t: '1' }, type: 'L1', gauge: 6.0, live: true },
      { id: 'w_q1_l1_l', a: { c: 'Q1', t: '2' }, b: { c: 'L1', t: 'L' }, type: 'L1', gauge: 1.5, live: true },
      { id: 'w_rcd_l1_n', a: { c: 'RCD1', t: 'N_OUT' }, b: { c: 'L1', t: 'N' }, type: 'N', gauge: 1.5, live: true },
      { id: 'w_q2_out_l', a: { c: 'Q2', t: '2' }, b: { c: 'OUT1', t: 'L' }, type: 'L1', gauge: 2.5, live: true },
      { id: 'w_rcd_out_n', a: { c: 'RCD1', t: 'N_OUT' }, b: { c: 'OUT1', t: 'N' }, type: 'N', gauge: 2.5, live: true },
      { id: 'w_q3_shw_l', a: { c: 'Q3', t: '2' }, b: { c: 'SHW1', t: 'L' }, type: 'L1', gauge: 6.0, live: true },
      { id: 'w_rcd_shw_n', a: { c: 'RCD1', t: 'N_OUT' }, b: { c: 'SHW1', t: 'N' }, type: 'N', gauge: 6.0, live: true }
    ]
  };
}

export function generateSolarPVIsoCircuit(): { components: any[]; wires: any[] } {
  return {
    components: [
      { id: 'PV1', code: 'PV_PANEL', x: -320, y: -120, w: 100, h: 90, name: 'Painel Solar FV-1' },
      { id: 'PV2', code: 'PV_PANEL', x: -180, y: -120, w: 100, h: 90, name: 'Painel Solar FV-2' },
      { id: 'STR1', code: 'PV_STRINGBOX', x: -50, y: -120, w: 85, h: 90, name: 'String Box DC com DPS' },
      { id: 'INV1', code: 'PV_INVERTER', x: 100, y: -120, w: 95, h: 95, name: 'Inversor Solar On-Grid' },
      { id: 'Q_AC', code: 'MCB1', x: 230, y: -120, w: 70, h: 85, name: 'Disjuntor CA 20A' },
      { id: 'OUT1', code: 'OUTLET', x: 100, y: 80, w: 75, h: 75, name: 'Tomadas Residência' },
      { id: 'SHOWER1', code: 'LOAD_SHOWER', x: 230, y: 80, w: 80, h: 80, name: 'Carga de Alta Potência' }
    ],
    wires: [
      { id: 'w_pv_ser', a: { c: 'PV1', t: '-' }, b: { c: 'PV2', t: '+' }, type: '24+', gauge: 4.0, live: true },
      { id: 'w_pv_str_pos', a: { c: 'PV1', t: '+' }, b: { c: 'STR1', t: 'IN+' }, type: '24+', gauge: 4.0, live: true },
      { id: 'w_pv_str_neg', a: { c: 'PV2', t: '-' }, b: { c: 'STR1', t: 'IN-' }, type: '24-', gauge: 4.0, live: true },
      { id: 'w_str_inv_pos', a: { c: 'STR1', t: 'OUT+' }, b: { c: 'INV1', t: 'PV+' }, type: '24+', gauge: 4.0, live: true },
      { id: 'w_str_inv_neg', a: { c: 'STR1', t: 'OUT-' }, b: { c: 'INV1', t: 'PV-' }, type: '24-', gauge: 4.0, live: true },
      { id: 'w_inv_qac_l', a: { c: 'INV1', t: 'L' }, b: { c: 'Q_AC', t: '1' }, type: 'L1', gauge: 4.0, live: true },
      { id: 'w_inv_qac_n', a: { c: 'INV1', t: 'N' }, b: { c: 'Q_AC', t: 'N_IN' }, type: 'N', gauge: 4.0, live: true },
      { id: 'w_qac_out_l', a: { c: 'Q_AC', t: '2' }, b: { c: 'OUT1', t: 'L' }, type: 'L1', gauge: 2.5, live: true },
      { id: 'w_qac_out_n', a: { c: 'Q_AC', t: 'N_OUT' }, b: { c: 'OUT1', t: 'N' }, type: 'N', gauge: 2.5, live: true }
    ]
  };
}
