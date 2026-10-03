// ============================================================================
// TÉCNICAMZ PRO — MOTOR DE ROTEAMENTO DE CONDUTORES, FÍSICA E ANATOMIA IEC/DIN (V21)
// Normas: IEC 60669, NBR 14136, IEC 60947, IEC 60898, IEC 60034, IEC 62109, DIN 46228-4
// Mapeamento Normativo e Coordenadas Espaciais sem Sobreposição:
// - Condutores Isolados: L1, L2, L3, N, PE, 24+, 24-, CTRL
// - Circulação Dinâmica de Corrente Proporcional (v ∝ I)
// - Exibição da Tensão de Linha (V), Queda Ôhmica (ΔV), Frequência (Hz) e Temp (°C)
// - Resolução de Corrente Inteligente (A / mA sem truncamento a zero)
// - Aquecimento Joule Contínuo, Fumaça e Carbonização com Ruptura
// ============================================================================

import { getComponentDef } from './cadEngine';
import { Busbar, getBusbarTerminalWorldPos } from './cadBusbars';

export interface TerminalPosition {
  x: number;
  y: number;
  dir: 'top' | 'bottom' | 'left' | 'right';
  normId: string;
}

export const WIRE_NORM_COLORS: Record<
  string,
  { base: string; highlight: string; name: string; isStriped?: boolean; isBare?: boolean }
> = {
  L1: { base: '#991b1b', highlight: '#f87171', name: 'L1 • Castanho/Vermelho' },
  L2: { base: '#0f172a', highlight: '#475569', name: 'L2 • Preto' },
  L3: { base: '#57534e', highlight: '#a8a29e', name: 'L3 • Cinza' },
  N: { base: '#0284c7', highlight: '#38bdf8', name: 'N • Neutro Azul' },
  PE: { base: '#15803d', highlight: '#eab308', name: 'PE • Terra Verde/Amarelo', isStriped: true },
  NU: { base: '#b45309', highlight: '#f59e0b', name: 'NU • Condutor de Cobre Nu', isBare: true },
  '24+': { base: '#dc2626', highlight: '#fca5a5', name: 'DC+ • Vermelho (+PV/+24V)' },
  '24-': { base: '#1e3a8a', highlight: '#60a5fa', name: 'DC- • Azul Escuro (-PV/0V)' },
  CTRL: { base: '#d97706', highlight: '#fde047', name: 'Comando • Âmbar' }
};

export const AVAILABLE_GAUGES: number[] = [1.5, 2.5, 4.0, 6.0, 10.0, 16.0, 25.0, 35.0];

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
    case 25.0:
      return Math.max(7.2, 10.5 * z);
    case 35.0:
      return Math.max(8.5, 12.0 * z);
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

  // --------------------------------------------------------------------------
  // DISPOSITIVOS DE PROTEÇÃO CONTRA SURTOS DPS (SPD / SPD3) - TOP/BOTTOM
  // --------------------------------------------------------------------------
  if (comp.code === 'SPD' || d.kind === 'spd') {
    if (termId === 'L' || termId === '1') return { x: -w * 0.25, y: -h / 2, dir: 'top' };
    if (termId === 'N') return { x: w * 0.25, y: -h / 2, dir: 'top' };
    if (termId === 'PE') return { x: 0, y: h / 2, dir: 'bottom' };
  }

  if (comp.code === 'SPD3' || d.kind === 'spd3') {
    if (termId === 'L1') return { x: -w * 0.36, y: -h / 2, dir: 'top' };
    if (termId === 'L2') return { x: -w * 0.12, y: -h / 2, dir: 'top' };
    if (termId === 'L3') return { x: w * 0.12, y: -h / 2, dir: 'top' };
    if (termId === 'N') return { x: w * 0.36, y: -h / 2, dir: 'top' };
    if (termId === 'PE') return { x: 0, y: h / 2, dir: 'bottom' };
  }

  // --------------------------------------------------------------------------
  // ATERRAMENTO E INFRAESTRUTURA (HASTE, CAIXA BEP, WAGO)
  // --------------------------------------------------------------------------
  if (comp.code === 'EARTH_ROD') {
    return { x: 0, y: -h / 2, dir: 'top' };
  }

  if (comp.code === 'EARTH_PIT') {
    if (termId === 'BEP1') return { x: -w * 0.30, y: -h / 2, dir: 'top' };
    if (termId === 'BEP2') return { x: 0, y: -h / 2, dir: 'top' };
    if (termId === 'BEP3') return { x: w * 0.30, y: -h / 2, dir: 'top' };
    if (termId === 'GND' || termId === 'PE') return { x: 0, y: h / 2, dir: 'bottom' };
  }

  if (comp.code === 'JUNCTION_BOX') {
    if (termId === 'L_IN') return { x: -w * 0.30, y: -h / 2, dir: 'top' };
    if (termId === 'N_IN') return { x: 0, y: -h / 2, dir: 'top' };
    if (termId === 'PE_IN') return { x: w * 0.30, y: -h / 2, dir: 'top' };
    if (termId === 'L1') return { x: -w * 0.36, y: h / 2, dir: 'bottom' };
    if (termId === 'L2') return { x: -w * 0.20, y: h / 2, dir: 'bottom' };
    if (termId === 'N1') return { x: -w * 0.04, y: h / 2, dir: 'bottom' };
    if (termId === 'N2') return { x: w * 0.12, y: h / 2, dir: 'bottom' };
    if (termId === 'PE1') return { x: w * 0.30, y: h / 2, dir: 'bottom' };
  }

  // --------------------------------------------------------------------------
  // GERAÇÃO E TRANSFERÊNCIA (GMG DIESEL, ATS, MTS)
  // --------------------------------------------------------------------------
  if (comp.code === 'GEN_DIESEL' || d.kind === 'generator_diesel') {
    if (termId === 'L1') return { x: -w * 0.36, y: h / 2, dir: 'bottom' };
    if (termId === 'L2') return { x: -w * 0.12, y: h / 2, dir: 'bottom' };
    if (termId === 'L3') return { x: w * 0.12, y: h / 2, dir: 'bottom' };
    if (termId === 'N') return { x: w * 0.36, y: h / 2, dir: 'bottom' };
    if (termId === 'PE') return { x: w / 2, y: 0, dir: 'right' };
    if (termId === 'REMOTE_START') return { x: -w * 0.35, y: -h / 2, dir: 'top' };
  }

  if (comp.code === 'ATS_SWITCH' || d.kind === 'ats_switch') {
    if (termId === 'N_L1') return { x: -w * 0.42, y: -h / 2, dir: 'top' };
    if (termId === 'N_L2') return { x: -w * 0.30, y: -h / 2, dir: 'top' };
    if (termId === 'N_L3') return { x: -w * 0.18, y: -h / 2, dir: 'top' };
    if (termId === 'N_N') return { x: -w * 0.06, y: -h / 2, dir: 'top' };
    if (termId === 'G_L1') return { x: w * 0.06, y: -h / 2, dir: 'top' };
    if (termId === 'G_L2') return { x: w * 0.18, y: -h / 2, dir: 'top' };
    if (termId === 'G_L3') return { x: w * 0.30, y: -h / 2, dir: 'top' };
    if (termId === 'G_N') return { x: w * 0.42, y: -h / 2, dir: 'top' };
    if (termId === 'LOAD_L1') return { x: -w * 0.36, y: h / 2, dir: 'bottom' };
    if (termId === 'LOAD_L2') return { x: -w * 0.12, y: h / 2, dir: 'bottom' };
    if (termId === 'LOAD_L3') return { x: w * 0.12, y: h / 2, dir: 'bottom' };
    if (termId === 'LOAD_N') return { x: w * 0.36, y: h / 2, dir: 'bottom' };
    if (termId === 'GEN_START') return { x: w / 2, y: 0, dir: 'right' };
  }

  if (comp.code === 'MTS_SWITCH' || d.kind === 'mts_switch') {
    if (termId === 'R_L1') return { x: -w * 0.40, y: -h / 2, dir: 'top' };
    if (termId === 'R_L2') return { x: -w * 0.28, y: -h / 2, dir: 'top' };
    if (termId === 'R_L3') return { x: -w * 0.16, y: -h / 2, dir: 'top' };
    if (termId === 'R_N') return { x: -w * 0.04, y: -h / 2, dir: 'top' };
    if (termId === 'G_L1') return { x: w * 0.08, y: -h / 2, dir: 'top' };
    if (termId === 'G_L2') return { x: w * 0.20, y: -h / 2, dir: 'top' };
    if (termId === 'G_L3') return { x: w * 0.32, y: -h / 2, dir: 'top' };
    if (termId === 'G_N') return { x: w * 0.44, y: -h / 2, dir: 'top' };
    if (termId === 'OUT_L1') return { x: -w * 0.36, y: h / 2, dir: 'bottom' };
    if (termId === 'OUT_L2') return { x: -w * 0.12, y: h / 2, dir: 'bottom' };
    if (termId === 'OUT_L3') return { x: w * 0.12, y: h / 2, dir: 'bottom' };
    if (termId === 'OUT_N') return { x: w * 0.36, y: h / 2, dir: 'bottom' };
  }

  // --------------------------------------------------------------------------
  // MOTORES ELÉTRICOS E ELETROBOMBAS CENTRÍFUGAS (IEC 60034)
  // --------------------------------------------------------------------------
  if (comp.code === 'PUMP' || d.kind === 'pump') {
    if (termId === 'U') return { x: w * 0.08, y: -h / 2, dir: 'top' };
    if (termId === 'V') return { x: w * 0.18, y: -h / 2, dir: 'top' };
    if (termId === 'W') return { x: w * 0.28, y: -h / 2, dir: 'top' };
    if (termId === 'PE') return { x: w * 0.40, y: -h / 2, dir: 'top' };
  }

  if (comp.code === 'M3PH_6L' || d.kind === 'motor3_6lead') {
    if (termId === 'U1') return { x: -w * 0.30, y: -h / 2, dir: 'top' };
    if (termId === 'V1') return { x: 0, y: -h / 2, dir: 'top' };
    if (termId === 'W1') return { x: w * 0.30, y: -h / 2, dir: 'top' };
    if (termId === 'W2') return { x: -w * 0.30, y: h / 2, dir: 'bottom' };
    if (termId === 'U2') return { x: 0, y: h / 2, dir: 'bottom' };
    if (termId === 'V2') return { x: w * 0.30, y: h / 2, dir: 'bottom' };
  }

  if (d.kind === 'motor3') {
    if (termId === 'U') return { x: -w * 0.25, y: -h / 2, dir: 'top' };
    if (termId === 'V') return { x: 0, y: -h / 2, dir: 'top' };
    if (termId === 'W') return { x: w * 0.25, y: -h / 2, dir: 'top' };
  }

  if (d.kind === 'motor1' || comp.code === 'FAN') {
    if (termId === 'L') return { x: -w * 0.22, y: -h / 2, dir: 'top' };
    if (termId === 'N') return { x: w * 0.22, y: -h / 2, dir: 'top' };
  }

  if (d.kind === 'motorDC') {
    if (termId === '+') return { x: -w * 0.22, y: -h / 2, dir: 'top' };
    if (termId === '-') return { x: w * 0.22, y: -h / 2, dir: 'top' };
  }

  // --------------------------------------------------------------------------
  // INSTRUMENTOS DE MEDIÇÃO REAL (VM, AM, OHM, WM, FREQ, COS)
  // --------------------------------------------------------------------------
  if (comp.code === 'VM' || comp.code === 'OHM') {
    if (termId === '+') return { x: -w * 0.25, y: -h / 2, dir: 'top' };
    if (termId === '-') return { x: w * 0.25, y: -h / 2, dir: 'top' };
  }

  if (comp.code === 'AM') {
    if (termId === 'IN') return { x: 0, y: -h / 2, dir: 'top' };
    if (termId === 'OUT') return { x: 0, y: h / 2, dir: 'bottom' };
  }

  if (comp.code === 'FREQ' || comp.code === 'COS') {
    if (termId === 'L') return { x: -w * 0.25, y: -h / 2, dir: 'top' };
    if (termId === 'N') return { x: w * 0.25, y: -h / 2, dir: 'top' };
  }

  if (comp.code === 'WM') {
    if (termId === 'I_IN') return { x: -w * 0.32, y: -h / 2, dir: 'top' };
    if (termId === 'I_OUT') return { x: -w * 0.32, y: h / 2, dir: 'bottom' };
    if (termId === 'V+') return { x: w * 0.32, y: -h / 2, dir: 'top' };
    if (termId === 'V-') return { x: w * 0.32, y: h / 2, dir: 'bottom' };
  }

  // Terra de Proteção padrão (PE / GND): Lateral Direita para demais equipamentos
  if (termId === 'PE' || termId === 'G' || func === 'PE') {
    return { x: w / 2, y: 0, dir: 'right' };
  }

  // --------------------------------------------------------------------------
  // INTERRUPTORES, COMUTADORES E CONTROLES
  // --------------------------------------------------------------------------
  if (comp.code === 'SW' || d.kind === 'switch') {
    if (termId === 'L' || termId === '1') return { x: 0, y: -h / 2, dir: 'top' };
    if (termId === 'R' || termId === '2') return { x: 0, y: h / 2, dir: 'bottom' };
  }

  if (comp.code === 'SW2' || d.kind === 'switch2') {
    if (termId === '1' || termId === 'L1') return { x: -w * 0.25, y: -h / 2, dir: 'top' };
    if (termId === '3' || termId === 'L2') return { x: w * 0.25, y: -h / 2, dir: 'top' };
    if (termId === '2' || termId === "L1'") return { x: -w * 0.25, y: h / 2, dir: 'bottom' };
    if (termId === '4' || termId === "L2'") return { x: w * 0.25, y: h / 2, dir: 'bottom' };
  }

  if (comp.code === 'SW_DOUBLE' || d.kind === 'switch_double') {
    if (termId === 'L' || termId === '1') return { x: 0, y: -h / 2, dir: 'top' };
    if (termId === 'R1' || termId === '2') return { x: -w * 0.28, y: h / 2, dir: 'bottom' };
    if (termId === 'R2' || termId === '4' || termId === '3') return { x: w * 0.28, y: h / 2, dir: 'bottom' };
  }

  if (comp.code === 'THREE_WAY') {
    if (termId === 'C' || termId === 'COM') return { x: 0, y: -h / 2, dir: 'top' };
    if (termId === 'R1' || termId === '1') return { x: -w * 0.28, y: h / 2, dir: 'bottom' };
    if (termId === 'R2' || termId === '2') return { x: w * 0.28, y: h / 2, dir: 'bottom' };
  }

  if (comp.code === 'FOUR_WAY') {
    if (termId === 'IN1' || termId === '1') return { x: -w * 0.28, y: -h / 2, dir: 'top' };
    if (termId === 'IN2' || termId === '2') return { x: w * 0.28, y: -h / 2, dir: 'top' };
    if (termId === 'OUT1' || termId === '3') return { x: -w * 0.28, y: h / 2, dir: 'bottom' };
    if (termId === 'OUT2' || termId === '4') return { x: w * 0.28, y: h / 2, dir: 'bottom' };
  }

  if (comp.code === 'DIMMER' || d.kind === 'dimmer') {
    if (termId === 'IN' || termId === '1') return { x: -w * 0.24, y: -h / 2, dir: 'top' };
    if (termId === 'N') return { x: w * 0.24, y: -h / 2, dir: 'top' };
    if (termId === 'OUT' || termId === '2') return { x: 0, y: h / 2, dir: 'bottom' };
  }

  if (comp.code === 'SEL' || d.kind === 'selector') {
    if (termId === 'C' || termId === '1' || termId === 'COM') return { x: 0, y: -h / 2, dir: 'top' };
    if (termId === 'MAN' || termId === '2') return { x: -w * 0.35, y: h / 2, dir: 'bottom' };
    if (termId === '0') return { x: 0, y: h / 2, dir: 'bottom' };
    if (termId === 'AUTO' || termId === '3') return { x: w * 0.35, y: h / 2, dir: 'bottom' };
  }

  if (comp.code === 'PHOTOCELL') {
    if (termId === 'F') return { x: -w * 0.25, y: -h / 2, dir: 'top' };
    if (termId === 'N') return { x: w * 0.25, y: -h / 2, dir: 'top' };
    if (termId === 'R') return { x: 0, y: h / 2, dir: 'bottom' };
  }

  if (comp.code === 'PIR_SENSOR') {
    if (termId === 'L') return { x: -w * 0.25, y: -h / 2, dir: 'top' };
    if (termId === 'N') return { x: w * 0.25, y: -h / 2, dir: 'top' };
    if (termId === 'OUT') return { x: 0, y: h / 2, dir: 'bottom' };
  }

  if (comp.code === 'LIMIT') {
    if (termId === '1') return { x: 0, y: -h / 2, dir: 'top' };
    if (termId === '2') return { x: 0, y: h / 2, dir: 'bottom' };
  }

  if (comp.code === 'FLOAT') {
    if (termId === 'COM' || termId === '1') return { x: 0, y: -h / 2, dir: 'top' };
    if (termId === 'NA' || termId === '2') return { x: -w * 0.26, y: h / 2, dir: 'bottom' };
    if (termId === 'NF' || termId === '3') return { x: w * 0.26, y: h / 2, dir: 'bottom' };
  }

  // --------------------------------------------------------------------------
  // DISJUNTORES, FUSÍVEIS E PROTEÇÃO DIN
  // --------------------------------------------------------------------------
  if (comp.code === 'MCB_1P' || d.kind === 'breaker_1p') {
    if (termId === '1') return { x: 0, y: -h / 2, dir: 'top' };
    if (termId === '2') return { x: 0, y: h / 2, dir: 'bottom' };
  }

  // DISJUNTOR MONOFÁSICO 1P+N (FASE NO POLO ESQUERDO, NEUTRO NO POLO DIREITO)
  if (comp.code === 'MCB1' || d.kind === 'breaker' || d.kind === 'rcbo') {
    if (termId === '1' || termId === 'L') return { x: -w * 0.25, y: -h / 2, dir: 'top' };
    if (termId === 'N' || termId === 'N_IN') return { x: w * 0.25, y: -h / 2, dir: 'top' };
    if (termId === '2' || termId === 'L_OUT') return { x: -w * 0.25, y: h / 2, dir: 'bottom' };
    if (termId === 'N_OUT') return { x: w * 0.25, y: h / 2, dir: 'bottom' };
  }

  if (comp.code === 'MPCB' || d.kind === 'motor_breaker') {
    if (termId === '1') return { x: -w * 0.30, y: -h / 2, dir: 'top' };
    if (termId === '3') return { x: 0, y: -h / 2, dir: 'top' };
    if (termId === '5') return { x: w * 0.30, y: -h / 2, dir: 'top' };
    if (termId === '2') return { x: -w * 0.30, y: h / 2, dir: 'bottom' };
    if (termId === '4') return { x: 0, y: h / 2, dir: 'bottom' };
    if (termId === '6') return { x: w * 0.30, y: h / 2, dir: 'bottom' };
  }

  if (comp.code === 'MCB2' || d.kind === 'breaker2') {
    if (termId === '1') return { x: -w * 0.25, y: -h / 2, dir: 'top' };
    if (termId === '3') return { x: w * 0.25, y: -h / 2, dir: 'top' };
    if (termId === '2') return { x: -w * 0.25, y: h / 2, dir: 'bottom' };
    if (termId === '4') return { x: w * 0.25, y: h / 2, dir: 'bottom' };
  }

  if (comp.code === 'MCB3' || comp.code === 'MCCB' || d.kind === 'breaker3' || d.kind === 'mccb') {
    if (termId === '1') return { x: -w * 0.36, y: -h / 2, dir: 'top' };
    if (termId === '3') return { x: -w * 0.12, y: -h / 2, dir: 'top' };
    if (termId === '5') return { x: w * 0.12, y: -h / 2, dir: 'top' };
    if (termId === 'N' || termId === 'N_IN') return { x: w * 0.36, y: -h / 2, dir: 'top' };

    if (termId === '2') return { x: -w * 0.36, y: h / 2, dir: 'bottom' };
    if (termId === '4') return { x: -w * 0.12, y: h / 2, dir: 'bottom' };
    if (termId === '6') return { x: w * 0.12, y: h / 2, dir: 'bottom' };
    if (termId === 'N_OUT') return { x: w * 0.36, y: h / 2, dir: 'bottom' };
  }

  if (d.kind === 'rcd' || d.kind === 'rcd4' || comp.code === 'RCD' || comp.code === 'RCD4') {
    if (comp.code === 'RCD4' || (d.terminals && d.terminals.length >= 8)) {
      if (termId === '1') return { x: -w * 0.36, y: -h / 2, dir: 'top' };
      if (termId === '3') return { x: -w * 0.12, y: -h / 2, dir: 'top' };
      if (termId === '5') return { x: w * 0.12, y: -h / 2, dir: 'top' };
      if (termId === 'N' || termId === 'N_IN') return { x: w * 0.36, y: -h / 2, dir: 'top' };

      if (termId === '2') return { x: -w * 0.36, y: h / 2, dir: 'bottom' };
      if (termId === '4') return { x: -w * 0.12, y: h / 2, dir: 'bottom' };
      if (termId === '6') return { x: w * 0.12, y: h / 2, dir: 'bottom' };
      if (termId === 'N_OUT') return { x: w * 0.36, y: h / 2, dir: 'bottom' };
    } else {
      if (termId === '1' || termId === 'L') return { x: -w * 0.25, y: -h / 2, dir: 'top' };
      if (termId === 'N' || termId === 'N_IN') return { x: w * 0.25, y: -h / 2, dir: 'top' };
      if (termId === '2' || termId === 'OUT') return { x: -w * 0.25, y: h / 2, dir: 'bottom' };
      if (termId === 'N_OUT') return { x: w * 0.25, y: h / 2, dir: 'bottom' };
    }
  }

  if (d.kind === 'fuse') {
    if (termId === '1') return { x: 0, y: -h / 2, dir: 'top' };
    if (termId === '2') return { x: 0, y: h / 2, dir: 'bottom' };
  }

  if (d.kind === 'fuse3') {
    if (termId === '1') return { x: -w * 0.28, y: -h / 2, dir: 'top' };
    if (termId === '3') return { x: 0, y: -h / 2, dir: 'top' };
    if (termId === '5') return { x: w * 0.28, y: -h / 2, dir: 'top' };
    if (termId === '2') return { x: -w * 0.28, y: h / 2, dir: 'bottom' };
    if (termId === '4') return { x: 0, y: h / 2, dir: 'bottom' };
    if (termId === '6') return { x: w * 0.28, y: h / 2, dir: 'bottom' };
  }

  // --------------------------------------------------------------------------
  // ENERGIA SOLAR & ARMAZENAMENTO
  // --------------------------------------------------------------------------
  if (comp.code === 'PV_PANEL') {
    if (termId === '+') return { x: -w * 0.25, y: -h / 2, dir: 'top' };
    if (termId === '-') return { x: w * 0.25, y: -h / 2, dir: 'top' };
  }

  if (comp.code === 'PV_INVERTER_ONGRID') {
    if (termId === 'DC1+') return { x: -w * 0.38, y: -h / 2, dir: 'top' };
    if (termId === 'DC1-') return { x: -w * 0.22, y: -h / 2, dir: 'top' };
    if (termId === 'DC2+') return { x: w * 0.22, y: -h / 2, dir: 'top' };
    if (termId === 'DC2-') return { x: w * 0.38, y: -h / 2, dir: 'top' };
    if (termId === 'AC_L1') return { x: -w * 0.36, y: h / 2, dir: 'bottom' };
    if (termId === 'AC_L2') return { x: -w * 0.12, y: h / 2, dir: 'bottom' };
    if (termId === 'AC_L3') return { x: w * 0.12, y: h / 2, dir: 'bottom' };
    if (termId === 'AC_N') return { x: w * 0.36, y: h / 2, dir: 'bottom' };
  }

  if (comp.code === 'PV_INVERTER_OFFGRID') {
    if (termId === 'PV+') return { x: -w * 0.36, y: -h / 2, dir: 'top' };
    if (termId === 'PV-') return { x: -w * 0.14, y: -h / 2, dir: 'top' };
    if (termId === 'BAT+') return { x: w * 0.14, y: -h / 2, dir: 'top' };
    if (termId === 'BAT-') return { x: w * 0.36, y: -h / 2, dir: 'top' };
    if (termId === 'AC_L') return { x: -w * 0.25, y: h / 2, dir: 'bottom' };
    if (termId === 'AC_N') return { x: w * 0.25, y: h / 2, dir: 'bottom' };
  }

  if (comp.code === 'PV_INVERTER_HYBRID') {
    if (termId === 'PV1+') return { x: -w * 0.36, y: -h / 2, dir: 'top' };
    if (termId === 'PV1-') return { x: -w * 0.14, y: -h / 2, dir: 'top' };
    if (termId === 'BAT+') return { x: w * 0.14, y: -h / 2, dir: 'top' };
    if (termId === 'BAT-') return { x: w * 0.36, y: -h / 2, dir: 'top' };
    if (termId === 'GRID_L') return { x: -w * 0.36, y: h / 2, dir: 'bottom' };
    if (termId === 'GRID_N') return { x: -w * 0.14, y: h / 2, dir: 'bottom' };
    if (termId === 'EPS_L') return { x: w * 0.14, y: h / 2, dir: 'bottom' };
    if (termId === 'EPS_N') return { x: w * 0.36, y: h / 2, dir: 'bottom' };
  }

  if (comp.code === 'BAT_LIFEPO4') {
    if (termId === '+') return { x: -w * 0.25, y: -h / 2, dir: 'top' };
    if (termId === '-') return { x: w * 0.25, y: -h / 2, dir: 'top' };
  }

  if (comp.code === 'SMART_METER') {
    if (termId === 'L_IN') return { x: -w * 0.25, y: -h / 2, dir: 'top' };
    if (termId === 'N_IN') return { x: w * 0.25, y: -h / 2, dir: 'top' };
    if (termId === 'L_OUT') return { x: -w * 0.25, y: h / 2, dir: 'bottom' };
    if (termId === 'N_OUT') return { x: w * 0.25, y: h / 2, dir: 'bottom' };
  }

  // --------------------------------------------------------------------------
  // CONTACTORES DE POTÊNCIA E BLOCOS AUXILIARES
  // --------------------------------------------------------------------------
  if (d.kind === 'contactor') {
    if (termId === 'A1') return { x: -w * 0.38, y: -h / 2, dir: 'top' };
    if (termId === '1') return { x: -w * 0.18, y: -h / 2, dir: 'top' };
    if (termId === '3') return { x: 0, y: -h / 2, dir: 'top' };
    if (termId === '5') return { x: w * 0.18, y: -h / 2, dir: 'top' };
    if (termId === '13') return { x: w * 0.33, y: -h / 2, dir: 'top' };
    if (termId === '21') return { x: w * 0.44, y: -h / 2, dir: 'top' };

    if (termId === 'A2') return { x: -w * 0.38, y: h / 2, dir: 'bottom' };
    if (termId === '2') return { x: -w * 0.18, y: h / 2, dir: 'bottom' };
    if (termId === '4') return { x: 0, y: h / 2, dir: 'bottom' };
    if (termId === '6') return { x: w * 0.18, y: h / 2, dir: 'bottom' };
    if (termId === '14') return { x: w * 0.33, y: h / 2, dir: 'bottom' };
    if (termId === '22') return { x: w * 0.44, y: h / 2, dir: 'bottom' };
  }

  if (comp.code === 'AUX_BLOCK_2NA2NF') {
    if (termId === '53') return { x: -w * 0.36, y: -h / 2, dir: 'top' };
    if (termId === '61') return { x: -w * 0.12, y: -h / 2, dir: 'top' };
    if (termId === '71') return { x: w * 0.12, y: -h / 2, dir: 'top' };
    if (termId === '83') return { x: w * 0.36, y: -h / 2, dir: 'top' };

    if (termId === '54') return { x: -w * 0.36, y: h / 2, dir: 'bottom' };
    if (termId === '62') return { x: -w * 0.12, y: h / 2, dir: 'bottom' };
    if (termId === '72') return { x: w * 0.12, y: h / 2, dir: 'bottom' };
    if (termId === '84') return { x: w * 0.36, y: h / 2, dir: 'bottom' };
  }

  // --------------------------------------------------------------------------
  // RELÉS TEMPORIZADORES, TERMOSTATOS E AUTOMAÇÃO
  // --------------------------------------------------------------------------
  if (comp.code === 'TIMER_STAR_DELTA') {
    if (termId === 'A1') return { x: -w * 0.28, y: -h / 2, dir: 'top' };
    if (termId === '15') return { x: w * 0.28, y: -h / 2, dir: 'top' };
    if (termId === 'A2') return { x: -w * 0.28, y: h / 2, dir: 'bottom' };
    if (termId === '18') return { x: 0, y: h / 2, dir: 'bottom' };
    if (termId === '28') return { x: w * 0.28, y: h / 2, dir: 'bottom' };
  }

  if (comp.code === 'TIMER_TOF') {
    if (termId === 'A1') return { x: -w * 0.32, y: -h / 2, dir: 'top' };
    if (termId === 'Y1') return { x: 0, y: -h / 2, dir: 'top' };
    if (termId === 'A2') return { x: w * 0.32, y: -h / 2, dir: 'top' };
    if (termId === '15') return { x: -w * 0.28, y: h / 2, dir: 'bottom' };
    if (termId === '16') return { x: 0, y: h / 2, dir: 'bottom' };
    if (termId === '18') return { x: w * 0.28, y: h / 2, dir: 'bottom' };
  }

  if (comp.code === 'TIMER_DIGITAL') {
    if (termId === 'L') return { x: -w * 0.25, y: -h / 2, dir: 'top' };
    if (termId === 'N') return { x: w * 0.25, y: -h / 2, dir: 'top' };
    if (termId === '15') return { x: -w * 0.28, y: h / 2, dir: 'bottom' };
    if (termId === '16') return { x: 0, y: h / 2, dir: 'bottom' };
    if (termId === '18') return { x: w * 0.28, y: h / 2, dir: 'bottom' };
  }

  if (comp.code === 'THERMOSTAT_DIGITAL') {
    if (termId === 'L') return { x: -w * 0.36, y: -h / 2, dir: 'top' };
    if (termId === 'N') return { x: -w * 0.14, y: -h / 2, dir: 'top' };
    if (termId === 'S1') return { x: w * 0.14, y: -h / 2, dir: 'top' };
    if (termId === 'S2') return { x: w * 0.36, y: -h / 2, dir: 'top' };
    if (termId === 'COM') return { x: -w * 0.28, y: h / 2, dir: 'bottom' };
    if (termId === 'NO') return { x: 0, y: h / 2, dir: 'bottom' };
    if (termId === 'NC') return { x: w * 0.28, y: h / 2, dir: 'bottom' };
  }

  if (d.kind === 'timer' || d.kind === 'relay') {
    if (termId === 'A1') return { x: -w * 0.35, y: -h / 2, dir: 'top' };
    if (termId === '15' || termId === '11' || termId === 'COM') return { x: 0, y: -h / 2, dir: 'top' };
    if (termId === 'A2') return { x: -w * 0.35, y: h / 2, dir: 'bottom' };
    if (termId === '16' || termId === '12' || termId === 'NC') return { x: -w * 0.15, y: h / 2, dir: 'bottom' };
    if (termId === '18' || termId === '14' || termId === 'NO') return { x: w * 0.25, y: h / 2, dir: 'bottom' };
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
  // BOTOEIRAS
  // --------------------------------------------------------------------------
  if (d.kind === 'push' || d.kind === 'pushbutton' || d.kind === 'estop') {
    if (termId === '1' || termId === '3' || termId === '13' || termId === '11') {
      return { x: -w * 0.28, y: -h / 2, dir: 'top' };
    }
    if (termId === '2' || termId === '4' || termId === '14' || termId === '12') {
      return { x: w * 0.28, y: h / 2, dir: 'bottom' };
    }
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

  // Fallback Normativo Proporcional
  const idx = d.terminals ? d.terminals.findIndex(x => x[0] === termId) : 0;
  const isInput = func === 'IN' || func === 'COM' || idx % 2 === 0;
  const colRatio = Math.max(1, Math.ceil((d.terminals?.length || 2) / 2));
  const colIndex = Math.floor(idx / 2);
  const xOffset = colRatio > 1 ? ((colIndex / (colRatio - 1)) - 0.5) * (w * 0.72) : 0;

  return {
    x: xOffset,
    y: isInput ? -h / 2 : h / 2,
    dir: isInput ? 'top' : 'bottom'
  };
}

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

export const calculateCurvedPath = calculateFilletManhattanPath;

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

export const getCurvedSvgPathString = (path: FilletManhattanPath) => getFilletSvgPathString(path.points, path.radius);

export function getBezierPoints(
  filletPath: FilletManhattanPath,
  numSamples: number = 20
): { x: number; y: number }[] {
  if (!filletPath || !filletPath.points) return [];
  return filletPath.points;
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
  isSmoke?: boolean;
  isCarbonized?: boolean;
  temp?: number;
  current?: number;
  voltage?: number;       // Tensão elétrica real de trabalho (ex: 230V / 400V)
  voltageDrop?: number;   // Queda de tensão ôhmica ao longo do cabo (ex: 0.18V)
  frequency?: number;     // Frequência real (ex: 50.0 Hz)
  smoke?: boolean;
  carbonized?: boolean;
  animTick?: number;
  toScreen: (p: { x: number; y: number }) => { x: number; y: number };
}

function blendHexColor(c1: string, c2: string, factor: number): string {
  const f = Math.max(0, Math.min(1, factor));
  const parse = (hex: string) => {
    const h = hex.replace('#', '');
    if (h.length === 3) {
      return [parseInt(h[0] + h[0], 16), parseInt(h[1] + h[1], 16), parseInt(h[2] + h[2], 16)];
    }
    return [
      parseInt(h.substring(0, 2), 16) || 0,
      parseInt(h.substring(2, 4), 16) || 0,
      parseInt(h.substring(4, 6), 16) || 0
    ];
  };
  const [r1, g1, b1] = parse(c1);
  const [r2, g2, b2] = parse(c2);
  const r = Math.round(r1 + (r2 - r1) * f);
  const g = Math.round(g1 + (g2 - g1) * f);
  const b = Math.round(b1 + (b2 - b1) * f);
  return `rgb(${r}, ${g}, ${b})`;
}

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
    toScreen
  } = options;

  if (!filletPath || !filletPath.points || filletPath.points.length < 2) return;

  // RELÓGIO IMUNE A CONGELAMENTO: Se animTick for 0, usa timestamp contínuo em tempo real
  const tick = (options.animTick !== undefined && options.animTick > 0)
    ? options.animTick
    : (performance.now() * 0.06);

  const actualTemp = options.temp ?? 25.0;
  const actualCurrent = Math.max(0, options.current ?? 0);
  const actualVoltageDrop = options.voltageDrop ?? 0;
  const actualVoltage = options.voltage ?? (isLive ? 230 : 0);
  const actualSmoke = Boolean(options.smoke ?? options.isSmoke ?? (actualTemp >= 130.0));
  const actualCarbonized = Boolean(options.carbonized ?? options.isCarbonized ?? (actualTemp >= 240.0));
  const actualOverheated = Boolean(options.isOverheated ?? (actualTemp > 70.0));

  const screenPoints = filletPath.points.map(p => toScreen(p));
  const z = Math.max(0.35, Math.min(2.5, cam.zoom));
  const radius = (filletPath.radius || 12) * z;
  const wireW = getWireGaugeThickness(gauge, z);
  const norm = WIRE_NORM_COLORS[wireType] || WIRE_NORM_COLORS['L1'];

  ctx.save();

  // Glow de seleção quando clicado
  if (isSelected) {
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.75)';
    ctx.lineWidth = wireW + 9 * z;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    traceFilletPathCanvas(ctx, screenPoints, radius);
    ctx.stroke();
  }

  // Sombra de profundidade no fundo do painel
  ctx.save();
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.lineWidth = wireW + 2 * z;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.translate(2 * z, 3.5 * z);
  traceFilletPathCanvas(ctx, screenPoints, radius);
  ctx.stroke();
  ctx.restore();

  // Borda escura do condutor
  ctx.strokeStyle = actualCarbonized ? '#09090b' : '#050a14';
  ctx.lineWidth = wireW + 1.2 * z;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  traceFilletPathCanvas(ctx, screenPoints, radius);
  ctx.stroke();

  // 1. GRADIENTE TÉRMICO DE COR (Base -> Incandescente se Temp > 50°C -> Carbonizado se >= 240°C)
  const heatPulse = (Math.sin(tick * 0.22) + 1) * 0.5;

  if (actualCarbonized) {
    ctx.strokeStyle = '#121214'; // Preto carvão fuligem
  } else if (actualTemp > 50.0) {
    const fHeat = Math.min(1.0, (actualTemp - 50.0) / 90.0);
    const hotTarget = actualSmoke
      ? `rgb(${Math.round(245 + heatPulse * 10)}, ${Math.round(40 + heatPulse * 40)}, 10)`
      : `rgb(${Math.round(230 + heatPulse * 25)}, ${Math.round(70 + heatPulse * 70)}, 15)`;
    ctx.strokeStyle = blendHexColor(norm.base, hotTarget, fHeat);
    ctx.shadowColor = actualSmoke ? '#ef4444' : '#f97316';
    ctx.shadowBlur = (6 + fHeat * 14 + heatPulse * 8) * z;
  } else if (norm.isBare) {
    const copperGrad = ctx.createLinearGradient(
      screenPoints[0].x,
      screenPoints[0].y,
      screenPoints[screenPoints.length - 1].x,
      screenPoints[screenPoints.length - 1].y
    );
    copperGrad.addColorStop(0, '#b45309');
    copperGrad.addColorStop(0.5, '#d97706');
    copperGrad.addColorStop(1, '#92400e');
    ctx.strokeStyle = copperGrad;
  } else {
    ctx.strokeStyle = norm.base;
  }

  ctx.lineWidth = wireW;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  traceFilletPathCanvas(ctx, screenPoints, radius);
  ctx.stroke();
  ctx.shadowColor = 'transparent';

  // 2. QUEBRA E PONTAS ROMPIDAS SE CARBONIZADO (≥ 240°C)
  if (actualCarbonized) {
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = Math.max(1, wireW * 0.4);
    ctx.setLineDash([4 * z, 8 * z]);
    traceFilletPathCanvas(ctx, screenPoints, radius);
    ctx.stroke();
    ctx.setLineDash([]);

    if (screenPoints.length >= 2) {
      const midIdx = Math.floor(screenPoints.length / 2);
      const bPt = screenPoints[midIdx];
      ctx.save();
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(bPt.x, bPt.y, wireW * 0.9, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#f97316';
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 9 * z;
      [-1, 1].forEach((dir) => {
        const off = dir * (4 * z);
        ctx.beginPath();
        ctx.arc(bPt.x + off, bPt.y, 2 * z, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();
    }
  }

  // 3. PARTÍCULAS DE FUMAÇA ANIMADAS (≥ 130°C ou smoke = true)
  if (actualSmoke && !actualCarbonized) {
    ctx.save();
    screenPoints.forEach((sp, idx) => {
      if (idx % 2 === 0) {
        for (let p = 0; p < 2; p++) {
          const phase = (tick * 1.6 + idx * 9.2 + p * 17.5) % 60;
          const progress = phase / 60;
          const driftX = Math.sin(tick * 0.09 + idx + p) * (11 * z) * progress;
          const riseY = -progress * (38 * z);
          const puffR = (5 + progress * 15) * z;
          const alpha = (1 - progress) * 0.52;

          ctx.fillStyle = `rgba(226, 232, 240, ${alpha.toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(sp.x + driftX, sp.y + riseY, puffR, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    });
    ctx.restore();
  }

  // Listra Verde-Amarela para PE
  if (norm.isStriped && !actualOverheated && !actualCarbonized) {
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = wireW * 0.82;
    ctx.setLineDash([8 * z, 8 * z]);
    traceFilletPathCanvas(ctx, screenPoints, radius);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // Estrias metálicas de cordoalha trançada para Condutor Nu (NU)
  if (norm.isBare && !actualOverheated && !actualCarbonized) {
    ctx.strokeStyle = 'rgba(254, 215, 170, 0.45)';
    ctx.lineWidth = Math.max(1, wireW * 0.7);
    ctx.setLineDash([3 * z, 3 * z]);
    traceFilletPathCanvas(ctx, screenPoints, radius);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // Filete de brilho superior 3D
  if (!actualCarbonized) {
    ctx.strokeStyle = actualOverheated ? '#fef08a' : norm.highlight;
    ctx.lineWidth = Math.max(0.8, wireW * 0.28);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalAlpha = 0.65;
    traceFilletPathCanvas(ctx, screenPoints, radius);
    ctx.stroke();
    ctx.globalAlpha = 1.0;
  }

  // 4. CIRCULAÇÃO FÍSICA REAL DE CORRENTE: VELOCIDADE PROPORCIONAL À INTENSIDADE (v ∝ I)
  if (isLive && !actualCarbonized) {
    if (actualCurrent > 0.005) {
      // CORRENTE FLUINDO: Os elétrons se movem na velocidade proporcional aos Amperes!
      const speedMultiplier = Math.min(28.0, Math.max(1.4, Math.sqrt(actualCurrent) * 2.8));
      const dashLen = Math.max(4 * z, Math.min(12 * z, (5 + Math.sqrt(actualCurrent) * 0.85) * z));
      const gapLen = Math.max(5 * z, Math.min(15 * z, (9 + Math.sqrt(actualCurrent) * 0.5) * z));

      ctx.strokeStyle = actualCurrent > 20.0 ? '#fef08a' : '#ffffff';
      ctx.lineWidth = Math.max(1.2, wireW * 0.38);
      ctx.setLineDash([dashLen, gapLen]);
      ctx.lineDashOffset = -tick * speedMultiplier;
      traceFilletPathCanvas(ctx, screenPoints, radius);
      ctx.stroke();
      ctx.setLineDash([]);
    } else {
      // APENAS TENSÃO PRESENTE (SEM CARGA): Sinal estático discreto indicando potencial elétrico
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = Math.max(0.9, wireW * 0.24);
      ctx.setLineDash([3 * z, 8 * z]);
      traceFilletPathCanvas(ctx, screenPoints, radius);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  // 5. MEDIDOR FLUTUANTE NO CABO (COM TENSÃO REAL, AMPERES / mA, FREQUÊNCIA HZ, TEMP E QUEDA ΔV)
  const showBadge = isSelected || actualOverheated || actualTemp > 50.0 || actualSmoke || actualCarbonized;

  if (showBadge && screenPoints.length >= 2) {
    let totalLen = 0;
    for (let i = 0; i < screenPoints.length - 1; i++) {
      totalLen += Math.hypot(screenPoints[i + 1].x - screenPoints[i].x, screenPoints[i + 1].y - screenPoints[i].y);
    }
    const targetMid = totalLen * 0.5;
    let accumulated = 0;
    let midX = screenPoints[Math.floor(screenPoints.length / 2)].x;
    let midY = screenPoints[Math.floor(screenPoints.length / 2)].y;

    for (let i = 0; i < screenPoints.length - 1; i++) {
      const d = Math.hypot(screenPoints[i + 1].x - screenPoints[i].x, screenPoints[i + 1].y - screenPoints[i].y);
      if (accumulated + d >= targetMid) {
        const ratio = d > 0 ? (targetMid - accumulated) / d : 0;
        midX = screenPoints[i].x + (screenPoints[i + 1].x - screenPoints[i].x) * ratio;
        midY = screenPoints[i].y + (screenPoints[i + 1].y - screenPoints[i].y) * ratio;
        break;
      }
      accumulated += d;
    }

    ctx.save();
    const freqVal = options.frequency !== undefined ? options.frequency : (isLive ? 50.0 : 0.0);

    // Formatação de Corrente com Alta Resolução (sem truncar miliamperes a zero)
    let currentFormatted = '0.00 A';
    if (actualCurrent === 0) {
      currentFormatted = isLive ? '0.00 A (Circ. Aberto)' : '0.00 A (Off)';
    } else if (actualCurrent < 1.0) {
      currentFormatted = `${(actualCurrent * 1000).toFixed(0)} mA (${actualCurrent.toFixed(3)}A)`;
    } else {
      currentFormatted = `${actualCurrent.toFixed(2)} A`;
    }

    // Formatação da Queda de Tensão (ΔV)
    const dropFormatted = actualVoltageDrop > 0 && actualVoltageDrop < 0.01
      ? `${(actualVoltageDrop * 1000).toFixed(1)} mV`
      : `${actualVoltageDrop.toFixed(2)} V`;

    const badgeTxt = actualCarbonized
      ? `⚡ 0.0A • 🔥 ROMPIDO (${actualTemp.toFixed(1)}°C) • ΔV: ${dropFormatted}`
      : `[ ${actualVoltage}V • ${currentFormatted} • ${freqVal.toFixed(1)} Hz • ${actualTemp.toFixed(1)} °C • ΔV: ${dropFormatted} ]`;

    ctx.font = `bold ${Math.max(8, 9.5 * z)}px 'Courier New', monospace`;
    const tw = ctx.measureText(badgeTxt).width + 16 * z;
    const th = 17 * z;
    const badgeY = midY - 18 * z;

    ctx.fillStyle = '#030712';
    ctx.strokeStyle = actualCarbonized
      ? '#ef4444'
      : actualSmoke
      ? '#f97316'
      : actualOverheated
      ? '#f59e0b'
      : isSelected
      ? '#38bdf8'
      : '#64748b';

    ctx.lineWidth = 1.3 * z;
    ctx.shadowColor = ctx.strokeStyle;
    ctx.shadowBlur = 9 * z;

    ctx.beginPath();
    ctx.roundRect(midX - tw / 2, badgeY - th / 2, tw, th, 4 * z);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(midX - 4 * z, badgeY + th / 2);
    ctx.lineTo(midX, badgeY + th / 2 + 3.5 * z);
    ctx.lineTo(midX + 4 * z, badgeY + th / 2);
    ctx.fill();
    ctx.stroke();

    ctx.shadowColor = 'transparent';
    ctx.fillStyle = actualCarbonized
      ? '#fca5a5'
      : actualOverheated
      ? '#fed7aa'
      : isSelected
      ? '#7dd3fc'
      : '#e2e8f0';

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(badgeTxt, midX, badgeY);
    ctx.restore();
  }

  ctx.restore();
}

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

  // Alvéolo do Borne
  ctx.fillStyle = '#060a12';
  ctx.beginPath();
  ctx.roundRect(-3.2 * z, -3.6 * z, 4.0 * z, 7.2 * z, 1.0 * z);
  ctx.fill();
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 0.9 * z;
  ctx.stroke();

  // Cabeça do Parafuso Pozidriv
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

  // Ponta de Cobre
  ctx.fillStyle = isOverheated ? '#ea580c' : '#b45309';
  ctx.fillRect(-0.4 * z, -tubeHalfW * 0.7, 2.8 * z, tubeHalfW * 1.4);

  // Luva Metálica Estanhada
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

  if (norm.isBare) {
    const lugGrad = ctx.createLinearGradient(0, -collarEndHalfW, 0, collarEndHalfW);
    lugGrad.addColorStop(0, '#78350f');
    lugGrad.addColorStop(0.3, '#f59e0b');
    lugGrad.addColorStop(0.7, '#b45309');
    lugGrad.addColorStop(1, '#451a03');

    ctx.fillStyle = lugGrad;
    ctx.beginPath();
    ctx.roundRect(tubeLen, -tubeHalfW * 1.2, collarLen * 0.8, tubeHalfW * 2.4, 0.8 * z);
    ctx.fill();
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 0.6 * z;
    ctx.stroke();
  } else {
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
  }

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
    current: Number(wire.current || 0),
    voltage: Number(wire.voltage || 0),
    temp: Number(wire.temp || 25),
    voltageDrop: Number(wire.voltageDrop || 0),
    frequency: Number(wire.frequency || 0),
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