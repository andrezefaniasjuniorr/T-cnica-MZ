// ============================================================================
// TÉCNICAMZ PRO — MOTOR CAD ELÉTRICO, FÍSICA NODAL & SOLAR PHOTOVOLTAIC (V31)
// Rastreamento Topológico Estrito de Malha CC: Associação Real de Baterias (V)
// Strings Fotovoltaicas (Série/Paralelo), Balanço Dinâmico de Cargas e Curvas IEC
// ============================================================================

export type ComponentCategory =
  | 'all'
  | 'sources'
  | 'protection'
  | 'command'
  | 'motors'
  | 'automation'
  | 'electronics'
  | 'measurement'
  | 'loads'
  | 'legacy'
  | 'solar'
  | 'generators'
  | 'grounding'
  | 'busbars';

export interface TerminalDef {
  0: string; // Terminal ID
  1: string; // Função: 'IN' | 'OUT' | 'COIL' | 'COM' | 'NO' | 'NC' | 'PWR' | 'PE' | etc.
  2: string; // Tipo Condutor: 'L1' | 'L2' | 'L3' | 'N' | 'PE' | 'NU' | '24+' | '24-' | 'CTRL'
}

export interface Busbar {
  id: string;
  type: 'din' | 'phase_l1' | 'phase_l2' | 'phase_l3' | 'neutral' | 'earth';
  x: number;
  y: number;
  length: number;
  orientation: 'horizontal' | 'vertical';
  terminals?: { id: string; x: number; y: number }[];
}

export interface ComponentDef {
  code: string;
  name: string;
  cat: ComponentCategory;
  icon: string;
  terminals: [string, string, string][];
  kind: string;
  params: Record<string, any>;
  sourceType?: 'AC' | 'AC3' | 'DC';
  momentary?: boolean;
  emergency?: boolean;
}

export const CATEGORIES: Record<string, string> = {
  all: 'Todos os Dispositivos',
  measurement: 'Instrumentação & Medição Real',
  solar: 'Energia Solar & Armazenamento',
  generators: 'Geração & Transferência (ATS/MTS)',
  protection: 'Proteção & Seccionamento',
  command: 'Comandos & Acionamentos',
  motors: 'Motores & Cargas Mecânicas',
  automation: 'Automação & Temporização',
  electronics: 'Eletrônica & Semicondutores',
  grounding: 'Aterramento & Distribuição',
  loads: 'Iluminação & Potência',
  sources: 'Rede Elétrica & Subestações',
  busbars: 'Trilhos DIN & Barramentos',
  legacy: 'Eletromecânicos'
};

export const WIRE_COLORS: Record<string, string> = {
  L1: '#b45309', // Castanho / Fase 1
  L2: '#1e293b', // Preto / Fase 2
  L3: '#64748b', // Cinzento / Fase 3
  N: '#0284c7',  // Azul Claro / Neutro
  PE: '#10b981', // Verde-Amarelo / Terra PE
  NU: '#b45309', // Cobre Nu / Aterramento Nu
  '24+': '#ef4444', // Vermelho / DC Positivo (+PV / +BAT / +24V)
  '24-': '#3b82f6', // Azul Escuro / DC Negativo (-PV / -BAT / 0V)
  CTRL: '#f59e0b' // Amarelo / Comando & Intertravamento
};

// Constantes Físicas dos Condutores de Cobre e Ambiente (IEC 60228 / NBR 5410)
export const COPPER_RESISTIVITY = 0.0175; // Ω·mm²/m a 20°C
export const COPPER_TEMP_COEFF = 0.00393; // 1/°C a 20°C
export const COPPER_ALPHA_TEMP = 0.00393; // 1/°C
export const COPPER_DENSITY = 8960; // kg/m³
export const COPPER_SPECIFIC_HEAT = 385; // J/(kg·K)
export const AMBIENT_TEMPERATURE = 25.0; // °C
export const PVC_MAX_TEMP = 70.0; // °C
export const PVC_CRITICAL_MELT_TEMP = 130.0; // °C
export const PVC_CARBONIZATION_TEMP = 240.0; // °C
export const WIRE_SMOKE_TEMP = 130.0; // °C
export const WIRE_CARBONIZED_TEMP = 240.0; // °C
export const THERMAL_DISSIPATION_COEFF = 16.0; // W/(m²·K)

export type OutletApplianceType = 'NONE' | 'PHONE' | 'HAIR_DRYER' | 'SHOWER' | 'WELDER' | 'CUSTOM';

export const APPLIANCE_PRESETS = [
  { id: 'NONE', label: 'Nenhum', powerW: 0, currentA: 0, description: 'Tomada descarregada' },
  { id: 'PHONE', label: 'Carregador Celular', powerW: 20, currentA: 0.1, description: 'Carga leve GaN (20W • ~0.1A)' },
  { id: 'HAIR_DRYER', label: 'Secador 2200W', powerW: 2200, currentA: 9.6, description: 'Eletrodoméstico resistivo (2200W • ~9.6A)' },
  { id: 'SHOWER', label: 'Chuveiro 5500W', powerW: 5500, currentA: 23.9, description: 'Carga pesada monofásica (5500W • ~23.9A)' },
  { id: 'WELDER', label: 'Solda 7500W', powerW: 7500, currentA: 32.6, description: 'Inversora de solda severa (7500W • ~32.6A)' },
  { id: 'CUSTOM', label: 'Customizado (Slider)', powerW: 2000, currentA: 8.7, description: 'Potência configurada pelo usuário' }
] as const;

export const OUTLET_APPLIANCES: Record<string, { label: string; powerW: number; pf: number; name: string }> = {
  NONE: { label: 'Sem Carga (Vazio)', powerW: 0, pf: 1.0, name: 'Tomada Vazia' },
  PHONE: { label: 'Carregador Celular GaN', powerW: 20, pf: 0.95, name: 'Carregador Celular' },
  HAIR_DRYER: { label: 'Secador de Cabelo Turbo', powerW: 2200, pf: 0.99, name: 'Secador Turbo' },
  SHOWER: { label: 'Chuveiro Elétrico 5.5kW', powerW: 5500, pf: 1.0, name: 'Chuveiro Elétrico' },
  WELDER: { label: 'Inversora de Solda Industrial', powerW: 7500, pf: 0.85, name: 'Inversora Solda' },
  CUSTOM: { label: 'Carga Customizada', powerW: 2000, pf: 0.98, name: 'Carga Customizada' }
};

export const GAUGE_AMPACITY: Record<number, number> = {
  1.5: 15.5,
  2.5: 21.0,
  4.0: 28.0,
  6.0: 36.0,
  10.0: 50.0,
  16.0: 68.0,
  25.0: 89.0,
  35.0: 110.0
};

// ----------------------------------------------------------------------------
// CATÁLOGO COMPLETO DE COMPONENTES REAIS
// ----------------------------------------------------------------------------
export const COMPONENT_CATALOG: ComponentDef[] = [
  // 1. INSTRUMENTOS DE MEDIÇÃO
  {
    code: 'VM',
    name: 'Voltímetro Digital Industrial True-RMS (0-600V CA/CC)',
    cat: 'measurement',
    icon: '🅅',
    terminals: [
      ['+', 'IN', 'L1'],
      ['-', 'IN', 'N']
    ],
    kind: 'voltmeter',
    params: { internalR: 10000000, voltage: 0 }
  },
  {
    code: 'AM',
    name: 'Amperímetro Digital True-RMS em Série (0-100A CA/CC)',
    cat: 'measurement',
    icon: '🄰',
    terminals: [
      ['IN', 'IN', 'L1'],
      ['OUT', 'OUT', 'L1']
    ],
    kind: 'ammeter',
    params: { internalR: 0.0005, shuntR: 0.0005, current: 0 }
  },
  {
    code: 'OHM',
    name: 'Ohmímetro Digital de Precisão (0.01Ω - 20MΩ)',
    cat: 'measurement',
    icon: 'Ω',
    terminals: [
      ['+', 'IN', 'CTRL'],
      ['-', 'IN', 'CTRL']
    ],
    kind: 'ohmmeter',
    params: { testVoltage: 1.5, resistance: 0, error: '' }
  },
  {
    code: 'WM',
    name: 'Wattímetro / Analisador Multifunção (kW / kVA / kVAR / FP)',
    cat: 'measurement',
    icon: '🅆',
    terminals: [
      ['I_IN', 'IN', 'L1'],
      ['I_OUT', 'OUT', 'L1'],
      ['V+', 'IN', 'L1'],
      ['V-', 'IN', 'N']
    ],
    kind: 'wattmeter',
    params: { internalR: 0.0005, powerActiveKW: 0, powerApparentKVA: 0, powerFactor: 1.0 }
  },
  {
    code: 'FREQ',
    name: 'Frequencímetro Digital de Painel (10-100 Hz)',
    cat: 'measurement',
    icon: '∿',
    terminals: [
      ['L', 'IN', 'L1'],
      ['N', 'IN', 'N']
    ],
    kind: 'frequencymeter',
    params: { internalR: 5000000, frequency: 50.0 }
  },
  {
    code: 'COS',
    name: 'Fasímetro / Medidor de Cos φ (0.00 a 1.00)',
    cat: 'measurement',
    icon: 'φ',
    terminals: [
      ['I_IN', 'IN', 'L1'],
      ['I_OUT', 'OUT', 'L1'],
      ['V+', 'IN', 'L1'],
      ['V-', 'IN', 'N']
    ],
    kind: 'powerfactormeter',
    params: { internalR: 0.0005, powerFactor: 1.0 }
  },

  // 2. DISJUNTORES, FUSÍVEIS E PROTEÇÃO DIN
  {
    code: 'MCB_1P',
    name: 'Disjuntor Unipolar Parcial 1P Curva C (1 Polo 18mm)',
    cat: 'protection',
    icon: '▣',
    terminals: [['1', 'IN', 'L1'], ['2', 'OUT', 'L1']],
    kind: 'breaker_1p',
    params: { current: 16, curve: 'C', icu: 6, closed: true, temp: 25, bimetalDeflection: 0, tripped: false }
  },
  {
    code: 'MCB1',
    name: 'Disjuntor Monofásico 1P+N Curva C (Fase + Neutro)',
    cat: 'protection',
    icon: '▣',
    terminals: [
      ['1', 'IN', 'L1'], ['2', 'OUT', 'L1'],
      ['N_IN', 'IN', 'N'], ['N_OUT', 'OUT', 'N']
    ],
    kind: 'breaker',
    params: { current: 16, curve: 'C', icu: 6, closed: true, temp: 25, bimetalDeflection: 0, tripped: false }
  },
  {
    code: 'MCB2',
    name: 'Disjuntor Bipolar 2P Curva C (2 Fases)',
    cat: 'protection',
    icon: '▣',
    terminals: [
      ['1', 'IN', 'L1'], ['2', 'OUT', 'L1'],
      ['3', 'IN', 'L2'], ['4', 'OUT', 'L2']
    ],
    kind: 'breaker2',
    params: { current: 25, curve: 'C', icu: 6, closed: true, temp: 25, bimetalDeflection: 0, tripped: false }
  },
  {
    code: 'MPCB',
    name: 'Disjuntor-Motor Magnético-Térmico 3P (Comunicação Start-Stop)',
    cat: 'protection',
    icon: '⚙',
    terminals: [
      ['1', 'IN', 'L1'], ['2', 'OUT', 'L1'],
      ['3', 'IN', 'L2'], ['4', 'OUT', 'L2'],
      ['5', 'IN', 'L3'], ['6', 'OUT', 'L3']
    ],
    kind: 'motor_breaker',
    params: { current: 16, rangeMin: 10, rangeMax: 16, icu: 10, closed: true, temp: 25, bimetalDeflection: 0, tripped: false }
  },
  {
    code: 'MCB3',
    name: 'Disjuntor Tetrapolar 3P+N Curva C (3 Fases + Neutro)',
    cat: 'protection',
    icon: '▣',
    terminals: [
      ['1', 'IN', 'L1'], ['2', 'OUT', 'L1'],
      ['3', 'IN', 'L2'], ['4', 'OUT', 'L2'],
      ['5', 'IN', 'L3'], ['6', 'OUT', 'L3'],
      ['N_IN', 'IN', 'N'], ['N_OUT', 'OUT', 'N']
    ],
    kind: 'breaker3',
    params: { current: 32, curve: 'C', icu: 6, closed: true, temp: 25, bimetalDeflection: 0, tripped: false }
  },
  {
    code: 'MCCB',
    name: 'Disjuntor Caixa Moldada 3P+N Industrial (Icu 36kA Ajustável)',
    cat: 'protection',
    icon: '▰',
    terminals: [
      ['1', 'IN', 'L1'], ['2', 'OUT', 'L1'],
      ['3', 'IN', 'L2'], ['4', 'OUT', 'L2'],
      ['5', 'IN', 'L3'], ['6', 'OUT', 'L3'],
      ['N_IN', 'IN', 'N'], ['N_OUT', 'OUT', 'N']
    ],
    kind: 'mccb',
    params: { current: 63, curve: 'C', closed: true, icu: 36, temp: 25, bimetalDeflection: 0, tripped: false }
  },
  {
    code: 'FUSE',
    name: 'Porta-Fusível Seccionável DIN 10x38mm (Cerâmico gG)',
    cat: 'protection',
    icon: '⏤',
    terminals: [['1', 'IN', 'L1'], ['2', 'OUT', 'L1']],
    kind: 'fuse',
    params: { current: 10, closed: true, temp: 25, i2t: 0, burned: false }
  },
  {
    code: 'FU3',
    name: 'Seccionadora Tripolar de Fusíveis 3P 10x38mm',
    cat: 'protection',
    icon: '⏤',
    terminals: [
      ['1', 'IN', 'L1'], ['2', 'OUT', 'L1'],
      ['3', 'IN', 'L2'], ['4', 'OUT', 'L2'],
      ['5', 'IN', 'L3'], ['6', 'OUT', 'L3']
    ],
    kind: 'fuse3',
    params: { current: 25, closed: true, temp: 25, i2t: 0, burned: false }
  },
  {
    code: 'RCD',
    name: 'Interruptor Diferencial Residual IDR 2P+N (30mA / Botão T)',
    cat: 'protection',
    icon: '◉',
    terminals: [
      ['1', 'IN', 'L1'], ['2', 'OUT', 'L1'],
      ['N_IN', 'IN', 'N'], ['N_OUT', 'OUT', 'N']
    ],
    kind: 'rcd',
    params: { current: 40, leakage: 0.03, closed: true, tripped: false, testPressed: false }
  },
  {
    code: 'RCD4',
    name: 'Interruptor Diferencial Residual IDR Tetrapolar 3P+N (30mA)',
    cat: 'protection',
    icon: '◉',
    terminals: [
      ['1', 'IN', 'L1'], ['2', 'OUT', 'L1'],
      ['3', 'IN', 'L2'], ['4', 'OUT', 'L2'],
      ['5', 'IN', 'L3'], ['6', 'OUT', 'L3'],
      ['N_IN', 'IN', 'N'], ['N_OUT', 'OUT', 'N']
    ],
    kind: 'rcd4',
    params: { current: 63, leakage: 0.03, closed: true, tripped: false, testPressed: false }
  },
  {
    code: 'RCBO',
    name: 'Disjuntor Diferencial Residual RCBO 1P+N (30mA / Curva C)',
    cat: 'protection',
    icon: '◉',
    terminals: [
      ['1', 'IN', 'L1'], ['2', 'OUT', 'L1'],
      ['N_IN', 'IN', 'N'], ['N_OUT', 'OUT', 'N']
    ],
    kind: 'rcbo',
    params: { current: 16, curve: 'C', icu: 6, leakage: 0.03, closed: true, temp: 25, bimetalDeflection: 0, tripped: false, testPressed: false }
  },
  {
    code: 'SPD',
    name: 'DPS Monofásico com Cartucho Plugável (L+N+PE / 20kA)',
    cat: 'protection',
    icon: '⚡',
    terminals: [['L', 'IN', 'L1'], ['N', 'IN', 'N'], ['PE', 'PE', 'PE']],
    kind: 'spd',
    params: { uc: 275, in: 20, imax: 45, health: 100, status: 'green' }
  },
  {
    code: 'SPD3',
    name: 'DPS Tetrapolar com Cartuchos Plugáveis (3P+N+PE / 45kA)',
    cat: 'protection',
    icon: '⚡',
    terminals: [
      ['L1', 'IN', 'L1'], ['L2', 'IN', 'L2'], ['L3', 'IN', 'L3'],
      ['N', 'IN', 'N'], ['PE', 'PE', 'PE']
    ],
    kind: 'spd3',
    params: { uc: 440, in: 40, imax: 65, health: 100, status: 'green' }
  },
  {
    code: 'OLR',
    name: 'Relé Térmico de Sobrecarga (95-96 NF / 97-98 NA)',
    cat: 'protection',
    icon: '🌡',
    terminals: [
      ['1', 'IN', 'L1'], ['2', 'OUT', 'L1'],
      ['3', 'IN', 'L2'], ['4', 'OUT', 'L2'],
      ['5', 'IN', 'L3'], ['6', 'OUT', 'L3'],
      ['95', 'NC', 'CTRL'], ['96', 'NC', 'CTRL'],
      ['97', 'NO', 'CTRL'], ['98', 'NO', 'CTRL']
    ],
    kind: 'overload',
    params: { current: 16, resetMode: 'manual', thermalAccumulator: 0, tripped: false }
  },
  {
    code: 'PHASE',
    name: 'Relé de Falta e Sequência de Fase (RPF)',
    cat: 'protection',
    icon: 'ABC',
    terminals: [
      ['L1', 'IN', 'L1'], ['L2', 'IN', 'L2'], ['L3', 'IN', 'L3'], ['N', 'IN', 'N'],
      ['11', 'COM', 'CTRL'], ['14', 'NO', 'CTRL'], ['12', 'NC', 'CTRL']
    ],
    kind: 'phaseRelay',
    params: { asymmetryMax: 0.15, underVoltage: 180, delay: 0.5, tripped: false }
  },

  // 3. COMANDOS E CONTATORES
  {
    code: 'SW',
    name: 'Interruptor Simples Unipolar 1P (10A 250V)',
    cat: 'command',
    icon: '⏻',
    terminals: [
      ['L', 'IN', 'L1'],
      ['R', 'OUT', 'L1']
    ],
    kind: 'switch',
    params: { closed: false, rockerAngle: 0 }
  },
  {
    code: 'SW2',
    name: 'Interruptor Bipolar 2P (10A 250V)',
    cat: 'command',
    icon: '⏻',
    terminals: [
      ['L1', 'IN', 'L1'],
      ['L2', 'IN', 'L2'],
      ["L1'", 'OUT', 'L1'],
      ["L2'", 'OUT', 'L2']
    ],
    kind: 'switch2',
    params: { closed: false, rockerAngle: 0 }
  },
  {
    code: 'SW_DOUBLE',
    name: 'Interruptor Duplo 2 Teclas (Fase Comum + 2 Retornos)',
    cat: 'command',
    icon: '⏻⏻',
    terminals: [
      ['L', 'IN', 'L1'],
      ['R1', 'OUT', 'L1'],
      ['R2', 'OUT', 'L1']
    ],
    kind: 'switch_double',
    params: { closed1: false, closed2: false }
  },
  {
    code: 'THREE_WAY',
    name: 'Interruptor Paralelo (Three-Way / Escada 10A)',
    cat: 'command',
    icon: '☵',
    terminals: [
      ['C', 'COM', 'L1'],
      ['R1', 'OUT', 'CTRL'],
      ['R2', 'OUT', 'CTRL']
    ],
    kind: 'selector',
    params: { position: 0, rockerAngle: 0 }
  },
  {
    code: 'FOUR_WAY',
    name: 'Interruptor Intermediário (Four-Way / Cruzamento 10A)',
    cat: 'command',
    icon: '☶',
    terminals: [
      ['IN1', 'IN', 'CTRL'],
      ['IN2', 'IN', 'CTRL'],
      ['OUT1', 'OUT', 'CTRL'],
      ['OUT2', 'OUT', 'CTRL']
    ],
    kind: 'selector',
    params: { crossed: false, rockerAngle: 0 }
  },
  {
    code: 'DIMMER',
    name: 'Dimmer Rotativo Eletrônico (0-100% 230V 600W)',
    cat: 'command',
    icon: '◐',
    terminals: [
      ['IN', 'IN', 'L1'],
      ['OUT', 'OUT', 'L1'],
      ['N', 'IN', 'N']
    ],
    kind: 'dimmer',
    params: { percent: 100, pMax: 600, voltage: 230 }
  },
  {
    code: 'SEL',
    name: 'Chave Seletora Rotativa 3 Posições (MAN - 0 - AUTO)',
    cat: 'command',
    icon: '◐',
    terminals: [
      ['C', 'COM', 'CTRL'],
      ['MAN', 'NO', 'CTRL'],
      ['0', 'AUX', 'CTRL'],
      ['AUTO', 'NO', 'CTRL']
    ],
    kind: 'selector',
    params: { position: 0 }
  },
  {
    code: 'CONTACTOR',
    name: 'Contator de Potência 3P 25A (AC-3) + Contatos Auxiliares',
    cat: 'command',
    icon: 'KM',
    terminals: [
      ['A1', 'COIL', 'CTRL'], ['A2', 'COIL', 'N'],
      ['1', 'IN', 'L1'], ['2', 'OUT', 'L1'],
      ['3', 'IN', 'L2'], ['4', 'OUT', 'L2'],
      ['5', 'IN', 'L3'], ['6', 'OUT', 'L3'],
      ['13', 'NO', 'CTRL'], ['14', 'NO', 'CTRL'],
      ['21', 'NC', 'CTRL'], ['22', 'NC', 'CTRL']
    ],
    kind: 'contactor',
    params: { coil: 230, minPickupRatio: 0.85, ac3Current: 25 }
  },
  {
    code: 'AUX_BLOCK_2NA2NF',
    name: 'Bloco de Contatos Auxiliares Frontal (2NA + 2NF)',
    cat: 'command',
    icon: '⊞',
    terminals: [
      ['53', 'NO', 'CTRL'], ['54', 'NO', 'CTRL'],
      ['61', 'NC', 'CTRL'], ['62', 'NC', 'CTRL'],
      ['71', 'NC', 'CTRL'], ['72', 'NC', 'CTRL'],
      ['83', 'NO', 'CTRL'], ['84', 'NO', 'CTRL']
    ],
    kind: 'aux_block',
    params: {}
  },
  {
    code: 'RELAY',
    name: 'Relé Auxiliar Industrial de Soquete DIN (1 Reversível)',
    cat: 'command',
    icon: 'KA',
    terminals: [
      ['A1', 'COIL', 'CTRL'], ['A2', 'COIL', 'N'],
      ['11', 'COM', 'CTRL'], ['12', 'NC', 'CTRL'], ['14', 'NO', 'CTRL']
    ],
    kind: 'relay',
    params: { coil: 230, minPickupRatio: 0.85 }
  },
  {
    code: 'TIMER',
    name: 'Relé Temporizador com Retardo na Energização (TON)',
    cat: 'automation',
    icon: '⏱',
    terminals: [
      ['A1', 'COIL', 'CTRL'], ['A2', 'COIL', 'N'],
      ['15', 'COM', 'CTRL'], ['16', 'NC', 'CTRL'], ['18', 'NO', 'CTRL']
    ],
    kind: 'timer',
    params: { delay: 5, mode: 'TON', elapsed: 0, minPickupRatio: 0.85 }
  },
  {
    code: 'TIMER_TOF',
    name: 'Relé Temporizador com Retardo na Desenergização (TOF)',
    cat: 'automation',
    icon: '⏱',
    terminals: [
      ['A1', 'PWR', 'CTRL'], ['A2', 'PWR', 'N'],
      ['Y1', 'IN', 'CTRL'],
      ['15', 'COM', 'CTRL'], ['16', 'NC', 'CTRL'], ['18', 'NO', 'CTRL']
    ],
    kind: 'timer_tof',
    params: { delay: 5, elapsed: 0 }
  },
  {
    code: 'TIMER_STAR_DELTA',
    name: 'Relé Temporizador Estrela-Triângulo Dedicado (Y-Δ 50ms Pausa)',
    cat: 'automation',
    icon: 'Y-Δ',
    terminals: [
      ['A1', 'COIL', 'CTRL'], ['A2', 'COIL', 'N'],
      ['15', 'COM', 'CTRL'],
      ['18', 'OUT', 'CTRL'],
      ['28', 'OUT', 'CTRL']
    ],
    kind: 'timer_star_delta',
    params: { delaySec: 6, pauseMs: 50, phase: 'star', elapsed: 0 }
  },
  {
    code: 'TIMER_DIGITAL',
    name: 'Interruptor Horário Digital Programável Semanal (Trilho DIN)',
    cat: 'automation',
    icon: '🕦',
    terminals: [
      ['L', 'IN', 'L1'], ['N', 'IN', 'N'],
      ['15', 'COM', 'CTRL'], ['16', 'NC', 'CTRL'], ['18', 'NO', 'CTRL']
    ],
    kind: 'timer_digital',
    params: { isRelayOn: false, currentMode: 'AUTO' }
  },
  {
    code: 'THERMOSTAT_DIGITAL',
    name: 'Termostato Digital Industrial com Sonda Térmica NTC',
    cat: 'automation',
    icon: '🌡',
    terminals: [
      ['L', 'IN', 'L1'], ['N', 'IN', 'N'],
      ['COM', 'COM', 'CTRL'], ['NO', 'NO', 'CTRL'], ['NC', 'NC', 'CTRL'],
      ['S1', 'AUX', 'CTRL'], ['S2', 'AUX', 'CTRL']
    ],
    kind: 'thermostat_digital',
    params: { currentTemp: 25.0, setpoint: 45.0 }
  },
  {
    code: 'PBNO',
    name: 'Botoeira Pulsadora NA 22mm (Verde - S1 Liga)',
    cat: 'command',
    icon: '●',
    terminals: [['3', 'IN', 'CTRL'], ['4', 'NO', 'CTRL']],
    kind: 'push',
    params: { closed: false, pressed: false },
    momentary: true
  },
  {
    code: 'PBNC',
    name: 'Botoeira Pulsadora NF 22mm (Vermelha - S0 Desliga)',
    cat: 'command',
    icon: '○',
    terminals: [['1', 'IN', 'CTRL'], ['2', 'NC', 'CTRL']],
    kind: 'push',
    params: { closed: true, pressed: false },
    momentary: true
  },
  {
    code: 'ESTOP',
    name: 'Botoeira de Emergência NF Cogumelo 40mm com Trava',
    cat: 'command',
    icon: '⛔',
    terminals: [['1', 'IN', 'CTRL'], ['2', 'NC', 'CTRL']],
    kind: 'switch',
    params: { closed: true, pressed: false, tripped: false },
    emergency: true
  },
  {
    code: 'LIMIT',
    name: 'Fim de Curso Blindado com Rolete Articulado (NF)',
    cat: 'command',
    icon: '⌁',
    terminals: [['1', 'IN', 'CTRL'], ['2', 'NC', 'CTRL']],
    kind: 'switch',
    params: { closed: true, actuated: false }
  },
  {
    code: 'FLOAT',
    name: 'Bóia de Nível com Contato Reversor Hermético IP68',
    cat: 'command',
    icon: '≋',
    terminals: [
      ['COM', 'IN', 'L1'],
      ['NA', 'OUT', 'CTRL'],
      ['NF', 'OUT', 'CTRL']
    ],
    kind: 'float_switch',
    params: { closed: false, high: false }
  },
  {
    code: 'PHOTOCELL',
    name: 'Relé Fotoelétrico / Fotocélula Crepuscular (10A 230V)',
    cat: 'command',
    icon: '☼',
    terminals: [
      ['F', 'IN', 'L1'],
      ['N', 'IN', 'N'],
      ['R', 'OUT', 'L1']
    ],
    kind: 'photocell',
    params: { ambientLux: 100, thresholdLux: 20, closed: false }
  },
  {
    code: 'PIR_SENSOR',
    name: 'Sensor de Presença Infravermelho PIR 360° de Teto',
    cat: 'command',
    icon: '👁',
    terminals: [
      ['L', 'IN', 'L1'],
      ['N', 'IN', 'N'],
      ['OUT', 'OUT', 'L1']
    ],
    kind: 'pir_sensor',
    params: { presenceDetected: false, durationSec: 30 }
  },

  // 4. GERAÇÃO & TRANSFERÊNCIA
  {
    code: 'GEN_DIESEL',
    name: 'Grupo Gerador a Diesel Trifásico (GMG 25kVA 400V com AVR)',
    cat: 'generators',
    icon: '⛽',
    terminals: [
      ['L1', 'OUT', 'L1'], ['L2', 'OUT', 'L2'], ['L3', 'OUT', 'L3'],
      ['N', 'OUT', 'N'], ['PE', 'PE', 'PE'],
      ['REMOTE_START', 'IN', 'CTRL']
    ],
    kind: 'generator_diesel',
    params: { kva: 25, voltage: 400, frequency: 50, running: false, rpm: 1500 }
  },
  {
    code: 'ATS_SWITCH',
    name: 'Quadro de Transferência Automática (ATS Rede/Gerador Motorizado)',
    cat: 'generators',
    icon: '⇄',
    terminals: [
      ['N_L1', 'IN', 'L1'], ['N_L2', 'IN', 'L2'], ['N_L3', 'IN', 'L3'], ['N_N', 'IN', 'N'],
      ['G_L1', 'IN', 'L1'], ['G_L2', 'IN', 'L2'], ['G_L3', 'IN', 'L3'], ['G_N', 'IN', 'N'],
      ['LOAD_L1', 'OUT', 'L1'], ['LOAD_L2', 'OUT', 'L2'], ['LOAD_L3', 'OUT', 'L3'], ['LOAD_N', 'OUT', 'N'],
      ['GEN_START', 'OUT', 'CTRL']
    ],
    kind: 'ats_switch',
    params: { sourceInUse: 'GRID', gridHealthy: true }
  },
  {
    code: 'MTS_SWITCH',
    name: 'Chave Comutadora de Transferência Manual I-0-II (Rede/0/Gerador)',
    cat: 'generators',
    icon: '⇄',
    terminals: [
      ['R_L1', 'IN', 'L1'], ['R_L2', 'IN', 'L2'], ['R_L3', 'IN', 'L3'], ['R_N', 'IN', 'N'],
      ['G_L1', 'IN', 'L1'], ['G_L2', 'IN', 'L2'], ['G_L3', 'IN', 'L3'], ['G_N', 'IN', 'N'],
      ['OUT_L1', 'OUT', 'L1'], ['OUT_L2', 'OUT', 'L2'], ['OUT_L3', 'OUT', 'L3'], ['OUT_N', 'OUT', 'N']
    ],
    kind: 'mts_switch',
    params: { position: 1 }
  },

  // 5. ENERGIA SOLAR & ARMAZENAMENTO
  {
    code: 'PV_PANEL',
    name: 'Módulo Fotovoltaico Monocristalino Half-Cell 550Wp (Tier 1)',
    cat: 'solar',
    icon: '☀️',
    terminals: [
      ['+', 'OUT', '24+'],
      ['-', 'OUT', '24-'],
      ['PE', 'PE', 'PE']
    ],
    kind: 'pv_panel',
    params: { pMax: 550, voc: 49.8, isc: 13.9, vmpp: 41.8, impp: 13.15, irradiance: 1000 }
  },
  {
    code: 'PV_INVERTER_ONGRID',
    name: 'Inversor Solar On-Grid Grid-Tie com Duplo MPPT (10kW Trifásico)',
    cat: 'solar',
    icon: '⚡',
    terminals: [
      ['DC1+', 'IN', '24+'], ['DC1-', 'IN', '24-'],
      ['DC2+', 'IN', '24+'], ['DC2-', 'IN', '24-'],
      ['AC_L1', 'OUT', 'L1'], ['AC_L2', 'OUT', 'L2'], ['AC_L3', 'OUT', 'L3'],
      ['AC_N', 'OUT', 'N'], ['PE', 'PE', 'PE']
    ],
    kind: 'pv_inverter_ongrid',
    params: { powerKW: 10, mpptMinV: 160, mpptMaxV: 850, syncActive: false, gridVoltage: 400 }
  },
  {
    code: 'PV_INVERTER_OFFGRID',
    name: 'Inversor Solar Off-Grid 5kW 48V (Carregador Solar MPPT + AC Pura)',
    cat: 'solar',
    icon: '⚡',
    terminals: [
      ['PV+', 'IN', '24+'], ['PV-', 'IN', '24-'],
      ['BAT+', 'IN', '24+'], ['BAT-', 'IN', '24-'],
      ['AC_L', 'OUT', 'L1'], ['AC_N', 'OUT', 'N'], ['PE', 'PE', 'PE']
    ],
    kind: 'pv_inverter_offgrid',
    params: { powerW: 5000, batVoltage: 51.2, acOutVoltage: 230, running: false }
  },
  {
    code: 'PV_INVERTER_HYBRID',
    name: 'Inversor Solar Híbrido Inteligente (Rede + Bateria + Backup EPS)',
    cat: 'solar',
    icon: '⚡',
    terminals: [
      ['PV1+', 'IN', '24+'], ['PV1-', 'IN', '24-'],
      ['BAT+', 'IN', '24+'], ['BAT-', 'IN', '24-'],
      ['GRID_L', 'IN', 'L1'], ['GRID_N', 'IN', 'N'],
      ['EPS_L', 'OUT', 'L1'], ['EPS_N', 'OUT', 'N'],
      ['PE', 'PE', 'PE']
    ],
    kind: 'pv_inverter_hybrid',
    params: { powerKW: 6, mode: 'HYBRID', epsActive: false }
  },
  {
    code: 'BAT_LIFEPO4',
    name: 'Bateria de Lítio LiFePO4 Rack 48V 100Ah (5.12kWh com BMS)',
    cat: 'solar',
    icon: '🔋',
    terminals: [
      ['+', 'OUT', '24+'],
      ['-', 'OUT', '24-'],
      ['PE', 'PE', 'PE']
    ],
    kind: 'bat_lifepo4',
    params: { voltage: 51.2, capacityAh: 100, socPercent: 95, bmsOk: true }
  },
  {
    code: 'SMART_METER',
    name: 'Smart Meter Medidor Bidirecional RS-485 para Inversores',
    cat: 'solar',
    icon: '🎛',
    terminals: [
      ['L_IN', 'IN', 'L1'], ['N_IN', 'IN', 'N'],
      ['L_OUT', 'OUT', 'L1'], ['N_OUT', 'OUT', 'N']
    ],
    kind: 'smart_meter',
    params: { importedKWh: 0, exportedKWh: 0, powerW: 0 }
  },

  // 6. MOTORES & BOMBAS
  {
    code: 'M1PH',
    name: 'Motor Monofásico 230V CA (1 CV / 1450 RPM)',
    cat: 'motors',
    icon: 'M',
    terminals: [['L', 'IN', 'L1'], ['N', 'IN', 'N'], ['PE', 'PE', 'PE']],
    kind: 'motor1',
    params: { power: 750, rpm: 1450, voltage: 230, pf: 0.82 }
  },
  {
    code: 'M3PH',
    name: 'Motor Trifásico MIT 3 Pontas (10 CV / 400V 2920 RPM)',
    cat: 'motors',
    icon: 'M3',
    terminals: [['U', 'IN', 'L1'], ['V', 'IN', 'L2'], ['W', 'IN', 'L3'], ['PE', 'PE', 'PE']],
    kind: 'motor3',
    params: { power: 7500, rpm: 2920, voltage: 400, pf: 0.86 }
  },
  {
    code: 'M3PH_6L',
    name: 'Motor Trifásico de 6 Pontas (Partida Estrela-Triângulo Y-Δ)',
    cat: 'motors',
    icon: 'M6',
    terminals: [
      ['U1', 'IN', 'L1'], ['V1', 'IN', 'L2'], ['W1', 'IN', 'L3'],
      ['W2', 'IN', 'L1'], ['U2', 'IN', 'L2'], ['V2', 'IN', 'L3'],
      ['PE', 'PE', 'PE']
    ],
    kind: 'motor3_6lead',
    params: { power: 11000, rpm: 2940, voltageDelta: 400, voltageStar: 690, pf: 0.88, connection: 'none' }
  },
  {
    code: 'FAN',
    name: 'Exaustor / Ventilador Axial Industrial 230V',
    cat: 'motors',
    icon: '🌀',
    terminals: [['L', 'IN', 'L1'], ['N', 'IN', 'N'], ['PE', 'PE', 'PE']],
    kind: 'fan',
    params: { power: 250, rpm: 1400, voltage: 230 }
  },
  {
    code: 'PUMP',
    name: 'Eletrobomba Centrífuga Trifásica em Caracol (Voluta)',
    cat: 'motors',
    icon: '💧',
    terminals: [['U', 'IN', 'L1'], ['V', 'IN', 'L2'], ['W', 'IN', 'L3'], ['PE', 'PE', 'PE']],
    kind: 'pump',
    params: { power: 3000, rpm: 2880, voltage: 400, pf: 0.85 }
  },

  // 7. FONTES, ILUMINAÇÃO & CARGAS
  {
    code: 'SRC_AC1',
    name: 'Alimentação Monofásica (230V / 50Hz True-RMS Digital)',
    cat: 'sources',
    icon: '⌁',
    terminals: [['L', 'OUT', 'L1'], ['N', 'OUT', 'N']],
    kind: 'source',
    params: { voltage: 230, frequency: 50, internalR: 0.05, closed: true },
    sourceType: 'AC'
  },
  {
    code: 'SRC_AC3',
    name: 'Rede Trifásica Subestação (400V 3F+N+PE com Voltímetro)',
    cat: 'sources',
    icon: '⚡',
    terminals: [['L1', 'OUT', 'L1'], ['L2', 'OUT', 'L2'], ['L3', 'OUT', 'L3'], ['N', 'OUT', 'N'], ['PE', 'PE', 'PE']],
    kind: 'source',
    params: { voltage: 400, frequency: 50, internalR: 0.03, closed: true },
    sourceType: 'AC3'
  },
  {
    code: 'SRC_DC24',
    name: 'Fonte CC Industrial de Precisão (24Vcc)',
    cat: 'sources',
    icon: '⎓',
    terminals: [['+', 'OUT', '24+'], ['-', 'OUT', '24-']],
    kind: 'source',
    params: { voltage: 24, internalR: 0.02, closed: true },
    sourceType: 'DC'
  },
  {
    code: 'BAT',
    name: 'Bateria Chumbo-Ácido Estacionária (12V 60Ah)',
    cat: 'sources',
    icon: '🔋',
    terminals: [['+', 'OUT', '24+'], ['-', 'OUT', '24-']],
    kind: 'source',
    params: { voltage: 12, capacityAh: 60, internalR: 0.015, closed: true },
    sourceType: 'DC'
  },
  {
    code: 'OUTLET',
    name: 'Tomada de Uso Geral 2P+T 16A 230V (Plug & Test)',
    cat: 'loads',
    icon: '▣',
    terminals: [['L', 'IN', 'L1'], ['N', 'IN', 'N'], ['PE', 'PE', 'PE']],
    kind: 'outlet',
    params: {
      current: 16,
      voltage: 230,
      pluggedAppliance: 'NONE',
      applianceName: 'Carga Geral',
      powerW: 0,
      powerFactor: 1.0,
      customPowerW: 2000,
      targetCurrent: 0
    }
  },
  {
    code: 'LAMP',
    name: 'Lâmpada Residencial E27 (Bulbo de Vidro com Filamento)',
    cat: 'loads',
    icon: '💡',
    terminals: [['L', 'IN', 'L1'], ['N', 'IN', 'N']],
    kind: 'lamp',
    params: { power: 60, voltage: 230, pf: 1.0 }
  },
  {
    code: 'PILOT_GREEN',
    name: 'Sinaleiro Piloto Industrial 22mm Verde',
    cat: 'loads',
    icon: '🟢',
    terminals: [['L', 'IN', 'CTRL'], ['N', 'IN', 'N']],
    kind: 'lamp',
    params: { power: 5, voltage: 230, color: 'green', pf: 1.0 }
  },
  {
    code: 'PILOT_RED',
    name: 'Sinaleiro Piloto Industrial 22mm Vermelho',
    cat: 'loads',
    icon: '🔴',
    terminals: [['L', 'IN', 'CTRL'], ['N', 'IN', 'N']],
    kind: 'lamp',
    params: { power: 5, voltage: 230, color: 'red', pf: 1.0 }
  },
  {
    code: 'PILOT_YELLOW',
    name: 'Sinaleiro Piloto Industrial 22mm Amarelo',
    cat: 'loads',
    icon: '🟡',
    terminals: [['L', 'IN', 'CTRL'], ['N', 'IN', 'N']],
    kind: 'lamp',
    params: { power: 5, voltage: 230, color: 'yellow', pf: 1.0 }
  },
  {
    code: 'HEATER',
    name: 'Resistência Elétrica Tubular de Aquecimento (2000W 230V)',
    cat: 'loads',
    icon: '♨',
    terminals: [['L', 'IN', 'L1'], ['N', 'IN', 'N']],
    kind: 'heater',
    params: { power: 2000, voltage: 230, pf: 1.0 }
  },
  {
    code: 'LOAD_AC',
    name: 'Ar Condicionado Split Inverter 12.000 BTU com Display',
    cat: 'loads',
    icon: '❄',
    terminals: [['L', 'IN', 'L1'], ['N', 'IN', 'N'], ['PE', 'PE', 'PE']],
    kind: 'load_ac',
    params: { power: 1400, voltage: 230, pf: 0.95 }
  },
  {
    code: 'LOAD_COOKTOP',
    name: 'Fogão de Indução Vitrocerâmico (Zonas Radiantes 7.2kW)',
    cat: 'loads',
    icon: '♨',
    terminals: [['L1', 'IN', 'L1'], ['L2', 'IN', 'L2'], ['N', 'IN', 'N'], ['PE', 'PE', 'PE']],
    kind: 'load_cooktop',
    params: { power: 7200, voltage: 230, pf: 0.98 }
  },
  {
    code: 'EARTH_ROD',
    name: 'Haste de Aterramento Cobreada 5/8" x 2.4m com Grampo',
    cat: 'grounding',
    icon: '⏚',
    terminals: [['PE', 'PE', 'PE']],
    kind: 'earth_rod',
    params: { resistanceOhm: 8.5 }
  },
  {
    code: 'EARTH_PIT',
    name: 'Caixa de Inspeção BEP (Barramento de Equipotencialização)',
    cat: 'grounding',
    icon: '⌸',
    terminals: [
      ['BEP1', 'PE', 'PE'], ['BEP2', 'PE', 'PE'],
      ['BEP3', 'PE', 'PE'], ['GND', 'PE', 'PE']
    ],
    kind: 'earth_pit',
    params: { resistanceOhm: 3.2 }
  },
  {
    code: 'JUNCTION_BOX',
    name: 'Caixa de Derivação com Bornes WAGO Rápidos (L / N / PE)',
    cat: 'grounding',
    icon: '⊞',
    terminals: [
      ['L_IN', 'IN', 'L1'], ['L1', 'OUT', 'L1'], ['L2', 'OUT', 'L1'],
      ['N_IN', 'IN', 'N'], ['N1', 'OUT', 'N'], ['N2', 'OUT', 'N'],
      ['PE_IN', 'PE', 'PE'], ['PE1', 'PE', 'PE']
    ],
    kind: 'junction_box',
    params: { maxCurrent: 32 }
  }
];

export const COMPONENT_MAP = new Map<string, ComponentDef>(
  COMPONENT_CATALOG.map(c => [c.code, c])
);

export function getComponentDef(code: string): ComponentDef {
  return COMPONENT_MAP.get(code) || COMPONENT_CATALOG[0];
}

// ----------------------------------------------------------------------------
// ARITMÉTICA COMPLEXA
// ----------------------------------------------------------------------------
export interface Complex {
  re: number;
  im: number;
}

export function cx(re = 0, im = 0): Complex {
  return { re: Number(re) || 0, im: Number(im) || 0 };
}

export function ca(a: Complex, b: Complex): Complex {
  return cx(a.re + b.re, a.im + b.im);
}

export function cs(a: Complex, b: Complex): Complex {
  return cx(a.re - b.re, a.im - b.im);
}

export function cm(a: Complex, b: Complex): Complex {
  return cx(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re);
}

export function cd(a: Complex, b: Complex): Complex {
  const d = b.re * b.re + b.im * b.im || 1e-30;
  return cx((a.re * b.re + a.im * b.im) / d, (a.im * b.re - a.re * b.im) / d);
}

export function cabs(a: Complex): number {
  return Math.hypot(a.re, a.im);
}

export function cpolar(m: number, deg: number): Complex {
  const rad = (deg * Math.PI) / 180;
  return cx(m * Math.cos(rad), m * Math.sin(rad));
}

// ----------------------------------------------------------------------------
// RASTREAMENTO TOPOLÓGICO DE MALHA CC
// ----------------------------------------------------------------------------
export interface DCLoopResult {
  isClosed: boolean;
  totalVoltage: number;
  maxPowerW: number;
  elements: any[];
  wiresInLoop: any[];
}

function traceDCPortLoop(
  posNode: string,
  negNode: string,
  wires: any[],
  comps: any[]
): DCLoopResult {
  const empty: DCLoopResult = { isClosed: false, totalVoltage: 0, maxPowerW: 0, elements: [], wiresInLoop: [] };
  
  const startWire = wires.find(w => !w.fault && !w.burned && !w.carbonized &&
    ((`${w.a?.c}:${w.a?.t}` === posNode) || (`${w.b?.c}:${w.b?.t}` === posNode))
  );

  if (!startWire) return empty;

  let currentNode = posNode;
  let currentWire = startWire;
  const visitedNodes = new Set<string>([posNode]);
  const visitedWires = new Set<string>();
  const elements: any[] = [];
  const wiresInLoop: any[] = [];
  let totalVoltage = 0;
  let maxPowerW = 0;

  let safetyCount = 0;
  while (safetyCount < 20) {
    safetyCount++;
    visitedWires.add(currentWire.id);
    wiresInLoop.push(currentWire);

    const wireA = `${currentWire.a?.c}:${currentWire.a?.t}`;
    const wireB = `${currentWire.b?.c}:${currentWire.b?.t}`;
    const nextTerminal = (wireA === currentNode) ? wireB : wireA;

    if (nextTerminal === negNode) {
      return {
        isClosed: totalVoltage > 0,
        totalVoltage: Math.abs(Number(totalVoltage.toFixed(1))),
        maxPowerW,
        elements,
        wiresInLoop
      };
    }

    const parts = nextTerminal.split(':');
    if (parts.length < 2) return empty;
    const nextCompId = parts[0];
    const nextTermId = parts[1];

    const comp = comps.find(c => c.id === nextCompId);
    if (!comp || visitedNodes.has(nextTerminal)) {
      return empty;
    }

    visitedNodes.add(nextTerminal);

    if (comp.code === 'PV_PANEL' || comp.kind === 'pv_panel') {
      const irr = Number(comp.params?.irradiance ?? 1000);
      const vmpp = Number(comp.params?.vmpp ?? 41.8);
      const pMax = Number(comp.params?.pMax ?? 550);

      const vPanel = irr > 0 ? (vmpp * (0.85 + 0.15 * (irr / 1000))) : 0;
      const pPanel = irr > 0 ? (pMax * (irr / 1000)) : 0;

      totalVoltage += vPanel;
      maxPowerW += pPanel;
      elements.push(comp);

      comp.state = comp.state || {};
      comp.state.voltage = Number(vPanel.toFixed(1));
      comp.state.running = irr > 0;
      comp.state.energized = irr > 0;

      const exitTerm = nextTermId === '+' ? '-' : '+';
      const exitNode = `${comp.id}:${exitTerm}`;
      visitedNodes.add(exitNode);

      const nextWire = wires.find(w => 
        !w.fault && !w.burned && !w.carbonized &&
        !visitedWires.has(w.id) &&
        ((`${w.a?.c}:${w.a?.t}` === exitNode) || (`${w.b?.c}:${w.b?.t}` === exitNode))
      );

      if (!nextWire) return empty;
      currentNode = exitNode;
      currentWire = nextWire;
      continue;
    }

    if (comp.code === 'BAT_LIFEPO4' || comp.kind === 'battery') {
      const vNom = Number(comp.params?.voltage || 51.2);
      const soc = Number(comp.params?.socPercent ?? comp.state?.percent ?? 95);
      const vBat = vNom * (0.92 + 0.16 * (soc / 100));

      totalVoltage += vBat;
      maxPowerW += vBat * Number(comp.params?.capacityAh || 100);
      elements.push(comp);

      comp.state = comp.state || {};
      comp.state.voltage = Number(vBat.toFixed(1));
      comp.state.energized = true;

      const exitTerm = nextTermId === '+' ? '-' : '+';
      const exitNode = `${comp.id}:${exitTerm}`;
      visitedNodes.add(exitNode);

      const nextWire = wires.find(w => 
        !w.fault && !w.burned && !w.carbonized &&
        !visitedWires.has(w.id) &&
        ((`${w.a?.c}:${w.a?.t}` === exitNode) || (`${w.b?.c}:${w.b?.t}` === exitNode))
      );

      if (!nextWire) return empty;
      currentNode = exitNode;
      currentWire = nextWire;
      continue;
    }

    return empty;
  }

  return empty;
}

// ----------------------------------------------------------------------------
// MOTOR DE FÍSICA NODAL REAL & DISPOSITIVOS DE PROTEÇÃO COM CURVAS IEC
// ----------------------------------------------------------------------------
export interface SimulationStepResult {
  hasDirectShort: boolean;
  shortCause: string;
  totalActivePower: number;
  totalLineCurrent: number;
  activeFrequency: number;
  activePF: number;
  mainVoltageRMS: number;
  trippedIds: string[];
  burnedIds: string[];
  energizedBusbarIds: string[];
}

interface InternalEdge {
  target: string;
  r: number;
  wireId?: string;
  compId?: string;
  pole?: string;
  attenuation?: number;
}

export function solveCircuitPhysicsStep(
  project: { components: any[]; wires: any[]; busbars?: Busbar[] },
  dt: number,
  simTime: number,
  isSimRunning: boolean
): SimulationStepResult {
  const result: SimulationStepResult = {
    hasDirectShort: false,
    shortCause: '',
    totalActivePower: 0,
    totalLineCurrent: 0,
    activeFrequency: 0,
    activePF: 1.0,
    mainVoltageRMS: 0,
    trippedIds: [],
    burnedIds: [],
    energizedBusbarIds: []
  };

  const comps = project.components || [];
  const wires = project.wires || [];
  const busbars = project.busbars || [];

  if (!isSimRunning) {
    wires.forEach(w => {
      w.live = false;
      w.current = 0;
      w.voltageDrop = 0;
      w.overheated = false;
      w.smoke = false;

      const t = Number(w.temp ?? AMBIENT_TEMPERATURE);
      if (t > AMBIENT_TEMPERATURE) {
        w.temp = Number(Math.max(AMBIENT_TEMPERATURE, t - dt * 4.0).toFixed(1));
        w.overheated = w.temp > PVC_MAX_TEMP;
        w.smoke = w.temp > PVC_CRITICAL_MELT_TEMP;
      } else {
        w.temp = AMBIENT_TEMPERATURE;
      }
    });

    comps.forEach(c => {
      if (!c.state) c.state = {};
      c.state.energized = false;
      c.state.running = false;
      c.state.current = 0;
      c.state.voltage = 0;
      c.state.powerKW = 0;
      c.state.rpm = 0;
      c.state.temp = Math.max(AMBIENT_TEMPERATURE, (c.state.temp || AMBIENT_TEMPERATURE) - dt * 3.0);
    });

    return result;
  }

  // 1. RASTREAMENTO REAL DOS INVERSORES SOLARES E MALHAS CC
  const pvInverters = comps.filter(c => c.code === 'PV_INVERTER_OFFGRID' || c.kind === 'pv_inverter_offgrid');

  pvInverters.forEach(inv => {
    inv.state = inv.state || {};

    const pvLoop = traceDCPortLoop(`${inv.id}:PV+`, `${inv.id}:PV-`, wires, comps);
    const batLoop = traceDCPortLoop(`${inv.id}:BAT+`, `${inv.id}:BAT-`, wires, comps);

    const vPv = pvLoop.isClosed ? Math.max(0, pvLoop.totalVoltage) : 0;
    const vBat = batLoop.isClosed ? Math.max(0, batLoop.totalVoltage) : 0;

    inv.state.pvVoltage = Number(vPv.toFixed(1));
    inv.state.batVoltage = Number(vBat.toFixed(1));

    const canOperate = (vBat >= 40.0) || (vPv >= 50.0);
    inv.state.running = canOperate;
    inv.state.energized = canOperate;
    inv.state.voltage = canOperate ? 230.0 : 0;
    inv.state.frequency = canOperate ? 50.0 : 0;

    inv.state['__pvLoop'] = pvLoop;
    inv.state['__batLoop'] = batLoop;
  });

  // 2. CONSTRUÇÃO DO GRAFO NODAL DE ADJACÊNCIA ELÉTRICA
  const graph = new Map<string, InternalEdge[]>();

  const addGraphEdge = (
    u: string,
    v: string,
    r: number,
    wireId?: string,
    attenuation = 1.0,
    compId?: string,
    pole?: string
  ) => {
    if (!graph.has(u)) graph.set(u, []);
    if (!graph.has(v)) graph.set(v, []);
    graph.get(u)!.push({ target: v, r, wireId, attenuation, compId, pole });
    graph.get(v)!.push({ target: u, r, wireId, attenuation, compId, pole });
  };

  wires.forEach(w => {
    if (w.fault || w.burned || w.carbonized) return;
    const u = `${w.a?.c}:${w.a?.t}`;
    const v = `${w.b?.c}:${w.b?.t}`;
    const gauge = Number(w.gauge || 2.5);
    const length = Number(w.length || 2.0);
    const temp = Number(w.temp ?? AMBIENT_TEMPERATURE);
    const rhoT = COPPER_RESISTIVITY * (1 + COPPER_ALPHA_TEMP * (temp - 20));
    const r = (rhoT * length) / gauge;
    w.resistance = Number(r.toFixed(5));
    addGraphEdge(u, v, Math.max(1e-5, r), w.id);
  });

  busbars.forEach(bb => {
    if (bb.type === 'din' || !bb.terminals) return;
    const spine = `${bb.id}:SPINE`;
    bb.terminals.forEach(t => {
      addGraphEdge(`${bb.id}:${t.id}`, spine, 0.0003);
    });
  });

  // 3. CONVERGÊNCIA ITERATIVA ELETROMECÂNICA
  const maxIterations = 6;
  let pass = 0;
  let stateChanged = true;

  type SourcePole = { id: string; net: string; v: number; angle: number; sourceId: string };
  let sourcePoles: SourcePole[] = [];
  let reachMap = new Map<
    string,
    Map<string, { rPath: number; vFactor: number; sourcePole: SourcePole; pathEdges: InternalEdge[] }>
  >();

  while (stateChanged && pass < maxIterations) {
    pass++;
    stateChanged = false;

    comps.forEach(c => {
      c.state = c.state || {};
      const d = getComponentDef(c.code);
      const isBurned = Boolean(c.state.isBurned || c.state.burned || c.state.damaged);
      const isTripped = Boolean(c.state.tripped);

      // Continuidade de passagem do Smart Meter
      if (c.code === 'SMART_METER' || d.kind === 'smart_meter') {
        addGraphEdge(`${c.id}:L_IN`, `${c.id}:L_OUT`, 0.001, undefined, 1.0, c.id, 'P1');
        addGraphEdge(`${c.id}:N_IN`, `${c.id}:N_OUT`, 0.001, undefined, 1.0, c.id, 'PN');
      }

      // Disjuntores Termomagnéticos
      if (['breaker', 'breaker_1p', 'breaker2', 'breaker3', 'mccb', 'motor_breaker', 'rcbo'].includes(d.kind)) {
        const isClosed = c.state.closed !== false && !isTripped && !isBurned;
        c.state.flagColor = isTripped ? 'yellow' : isClosed ? 'red' : 'green';
        c.state.leverPos = isTripped ? 'trip' : isClosed ? 'up' : 'down';

        if (isClosed) {
          addGraphEdge(`${c.id}:1`, `${c.id}:2`, 0.002, undefined, 1.0, c.id, 'P1');
          if (['MCB2', 'MCB3', 'MCCB', 'MPCB'].includes(c.code)) {
            addGraphEdge(`${c.id}:3`, `${c.id}:4`, 0.002, undefined, 1.0, c.id, 'P2');
          }
          if (['MCB3', 'MCCB', 'MPCB'].includes(c.code)) {
            addGraphEdge(`${c.id}:5`, `${c.id}:6`, 0.002, undefined, 1.0, c.id, 'P3');
          }
          if (c.code !== 'MPCB' && c.code !== 'MCB_1P' && c.code !== 'MCB2') {
            addGraphEdge(`${c.id}:N_IN`, `${c.id}:N_OUT`, 0.001, undefined, 1.0, c.id, 'PN');
          }
        }
      }

      // Fusíveis
      if (['fuse', 'fuse3'].includes(d.kind)) {
        const isFuseOk = !c.state.burned && !c.state.isBurned && c.state.closed !== false;
        if (isFuseOk) {
          addGraphEdge(`${c.id}:1`, `${c.id}:2`, 0.002, undefined, 1.0, c.id, 'P1');
          if (c.code === 'FU3') {
            addGraphEdge(`${c.id}:3`, `${c.id}:4`, 0.002, undefined, 1.0, c.id, 'P2');
            addGraphEdge(`${c.id}:5`, `${c.id}:6`, 0.002, undefined, 1.0, c.id, 'P3');
          }
        }
      }

      // IDRs
      if (['rcd', 'rcd4'].includes(d.kind)) {
        if (c.state.closed !== false && !isTripped) {
          addGraphEdge(`${c.id}:1`, `${c.id}:2`, 0.002, undefined, 1.0, c.id, 'P1');
          addGraphEdge(`${c.id}:N_IN`, `${c.id}:N_OUT`, 0.001, undefined, 1.0, c.id, 'PN');
          if (c.code === 'RCD4') {
            addGraphEdge(`${c.id}:3`, `${c.id}:4`, 0.002, undefined, 1.0, c.id, 'P2');
            addGraphEdge(`${c.id}:5`, `${c.id}:6`, 0.002, undefined, 1.0, c.id, 'P3');
          }
        }
      }

      // Comutadora Manual MTS
      if (c.code === 'MTS_SWITCH') {
        const pos = Number(c.params?.position ?? 1);
        if (pos === 1) {
          addGraphEdge(`${c.id}:R_L1`, `${c.id}:OUT_L1`, 0.002, undefined, 1.0, c.id, 'P1');
          addGraphEdge(`${c.id}:R_L2`, `${c.id}:OUT_L2`, 0.002, undefined, 1.0, c.id, 'P2');
          addGraphEdge(`${c.id}:R_L3`, `${c.id}:OUT_L3`, 0.002, undefined, 1.0, c.id, 'P3');
          addGraphEdge(`${c.id}:R_N`, `${c.id}:OUT_N`, 0.002, undefined, 1.0, c.id, 'PN');
        } else if (pos === 2) {
          addGraphEdge(`${c.id}:G_L1`, `${c.id}:OUT_L1`, 0.002, undefined, 1.0, c.id, 'P1');
          addGraphEdge(`${c.id}:G_L2`, `${c.id}:OUT_L2`, 0.002, undefined, 1.0, c.id, 'P2');
          addGraphEdge(`${c.id}:G_L3`, `${c.id}:OUT_L3`, 0.002, undefined, 1.0, c.id, 'P3');
          addGraphEdge(`${c.id}:G_N`, `${c.id}:OUT_N`, 0.002, undefined, 1.0, c.id, 'PN');
        }
      }

      // Contator KM
      if (d.kind === 'contactor') {
        if (c.state.energized) {
          addGraphEdge(`${c.id}:1`, `${c.id}:2`, 0.002, undefined, 1.0, c.id, 'P1');
          addGraphEdge(`${c.id}:3`, `${c.id}:4`, 0.002, undefined, 1.0, c.id, 'P2');
          addGraphEdge(`${c.id}:5`, `${c.id}:6`, 0.002, undefined, 1.0, c.id, 'P3');
          addGraphEdge(`${c.id}:13`, `${c.id}:14`, 0.002, undefined, 1.0, c.id, 'PAUX1');
        } else {
          addGraphEdge(`${c.id}:21`, `${c.id}:22`, 0.002, undefined, 1.0, c.id, 'PAUX2');
        }
      }

      // Relé Térmico OLR
      if (d.kind === 'overload') {
        addGraphEdge(`${c.id}:1`, `${c.id}:2`, 0.005, undefined, 1.0, c.id, 'P1');
        addGraphEdge(`${c.id}:3`, `${c.id}:4`, 0.005, undefined, 1.0, c.id, 'P2');
        addGraphEdge(`${c.id}:5`, `${c.id}:6`, 0.005, undefined, 1.0, c.id, 'P3');
        if (!isTripped) {
          addGraphEdge(`${c.id}:95`, `${c.id}:96`, 0.002, undefined, 1.0, c.id, 'PNC');
        } else {
          addGraphEdge(`${c.id}:97`, `${c.id}:98`, 0.002, undefined, 1.0, c.id, 'PNO');
        }
      }

      // Interruptores
      if (c.code === 'SW' && c.state.closed) addGraphEdge(`${c.id}:L`, `${c.id}:R`, 0.002);
      if (c.code === 'THREE_WAY') {
        const pos = Number(c.params?.position ?? (c.state?.closed ? 1 : 0));
        addGraphEdge(`${c.id}:C`, pos === 0 ? `${c.id}:R1` : `${c.id}:R2`, 0.002);
      }
      if (c.code === 'PBNO' && (c.state.pressed || c.state.closed)) addGraphEdge(`${c.id}:3`, `${c.id}:4`, 0.002);
      if (c.code === 'PBNC' && !c.state.pressed && c.state.closed !== false) addGraphEdge(`${c.id}:1`, `${c.id}:2`, 0.002);
    });

    // 4. FONTES DE ENERGIA ATIVAS
    sourcePoles = [];
    comps.forEach(c => {
      const rippleV = (Math.sin(simTime * 6.28) * 0.35 + Math.cos(simTime * 18.8) * 0.15);
      const vNom = Number(c.params?.voltage || 230) + rippleV;
      const fNom = Number(c.params?.frequency || 50) + (Math.sin(simTime * 2.5) * 0.03);

      if (c.code === 'SRC_AC3') {
        sourcePoles.push({ id: `${c.id}:L1`, net: 'L1', v: vNom / Math.sqrt(3), angle: 0, sourceId: c.id });
        sourcePoles.push({ id: `${c.id}:L2`, net: 'L2', v: vNom / Math.sqrt(3), angle: -120, sourceId: c.id });
        sourcePoles.push({ id: `${c.id}:L3`, net: 'L3', v: vNom / Math.sqrt(3), angle: 120, sourceId: c.id });
        sourcePoles.push({ id: `${c.id}:N`, net: 'N', v: 0, angle: 0, sourceId: c.id });
        sourcePoles.push({ id: `${c.id}:PE`, net: 'PE', v: 0, angle: 0, sourceId: c.id });
        result.mainVoltageRMS = Number(vNom.toFixed(1));
        result.activeFrequency = Number(fNom.toFixed(1));
      } else if (c.code === 'GEN_DIESEL' && (c.state?.running || c.params?.running)) {
        sourcePoles.push({ id: `${c.id}:L1`, net: 'L1', v: 400 / Math.sqrt(3), angle: 0, sourceId: c.id });
        sourcePoles.push({ id: `${c.id}:L2`, net: 'L2', v: 400 / Math.sqrt(3), angle: -120, sourceId: c.id });
        sourcePoles.push({ id: `${c.id}:L3`, net: 'L3', v: 400 / Math.sqrt(3), angle: 120, sourceId: c.id });
        sourcePoles.push({ id: `${c.id}:N`, net: 'N', v: 0, angle: 0, sourceId: c.id });
        sourcePoles.push({ id: `${c.id}:PE`, net: 'PE', v: 0, angle: 0, sourceId: c.id });
        c.state.voltage = 400.0;
        c.state.rpm = 1500;
        c.state.frequency = 50.0;
        c.state.energized = true;
        if (result.mainVoltageRMS === 0) result.mainVoltageRMS = 400.0;
        result.activeFrequency = 50.0;
      } else if (c.code === 'SRC_AC1') {
        sourcePoles.push({ id: `${c.id}:L`, net: 'L1', v: vNom, angle: 0, sourceId: c.id });
        sourcePoles.push({ id: `${c.id}:N`, net: 'N', v: 0, angle: 0, sourceId: c.id });
        result.mainVoltageRMS = Number(vNom.toFixed(1));
        result.activeFrequency = Number(fNom.toFixed(1));
      } else if (c.code === 'PV_INVERTER_OFFGRID' && c.state?.running) {
        sourcePoles.push({ id: `${c.id}:AC_L`, net: 'L1', v: 230.0, angle: 0, sourceId: c.id });
        sourcePoles.push({ id: `${c.id}:AC_N`, net: 'N', v: 0.0, angle: 0, sourceId: c.id });
        if (result.mainVoltageRMS === 0) result.mainVoltageRMS = 230.0;
        if (result.activeFrequency === 0) result.activeFrequency = 50.0;
      }
    });

    // BFS Nodal de Propagação
    reachMap = new Map();
    sourcePoles.forEach(sp => {
      const queue: { node: string; rPath: number; vFactor: number; path: InternalEdge[] }[] = [
        { node: sp.id, rPath: 0, vFactor: 1.0, path: [] }
      ];
      const visited = new Set<string>([sp.id]);
      if (!reachMap.has(sp.id)) reachMap.set(sp.id, new Map());
      const poleMap = reachMap.get(sp.id)!;
      poleMap.set(sp.id, { rPath: 0, vFactor: 1.0, sourcePole: sp, pathEdges: [] });

      while (queue.length > 0) {
        const { node, rPath, vFactor, path } = queue.shift()!;
        const edges = graph.get(node) || [];
        for (const edge of edges) {
          if (!visited.has(edge.target)) {
            visited.add(edge.target);
            const totalR = rPath + edge.r;
            const nextVFactor = vFactor * (edge.attenuation ?? 1.0);
            const nextPath = [...path, edge];
            poleMap.set(edge.target, { rPath: totalR, vFactor: nextVFactor, sourcePole: sp, pathEdges: nextPath });
            queue.push({ node: edge.target, rPath: totalR, vFactor: nextVFactor, path: nextPath });
          }
        }
      }
    });

    // Excitação das Bobinas de Contator
    comps.forEach(c => {
      if (c.code === 'CONTACTOR') {
        const nA1 = `${c.id}:A1`;
        const nA2 = `${c.id}:A2`;
        let hasPhase = false, hasNeut = false;
        sourcePoles.forEach(sp => {
          const m = reachMap.get(sp.id);
          if (m && sp.net.startsWith('L') && m.has(nA1)) hasPhase = true;
          if (m && sp.net === 'N' && m.has(nA2)) hasNeut = true;
        });
        const coilOn = hasPhase && hasNeut && !result.hasDirectShort;
        if (c.state.energized !== coilOn) {
          c.state.energized = coilOn;
          stateChanged = true;
        }
      }
    });
  }

  // 5. MAPEAMENTO DE CORRENTE REAL
  const wireCurrentMap = new Map<string, number>();
  const compPoleCurrentMap = new Map<string, Map<string, number>>();

  const addPathCurrent = (pathEdges: InternalEdge[], currentVal: number) => {
    pathEdges.forEach(edge => {
      if (edge.wireId) {
        const curW = wireCurrentMap.get(edge.wireId) || 0;
        wireCurrentMap.set(edge.wireId, curW + currentVal);
      }
      if (edge.compId) {
        if (!compPoleCurrentMap.has(edge.compId)) {
          compPoleCurrentMap.set(edge.compId, new Map());
        }
        const pMap = compPoleCurrentMap.get(edge.compId)!;
        const pKey = edge.pole || 'P1';
        pMap.set(pKey, (pMap.get(pKey) || 0) + currentVal);
      }
    });
  };

  // 6. DETECÇÃO DE CURTO-CIRCUITO DIRETO
  sourcePoles.forEach(spPhase => {
    if (!spPhase.net.startsWith('L')) return;
    const pMap = reachMap.get(spPhase.id);
    if (!pMap) return;

    sourcePoles.forEach(spNeut => {
      if (spNeut.net !== 'N') return;
      const reach = pMap.get(spNeut.id);
      if (reach && reach.rPath < 0.25) {
        result.hasDirectShort = true;
        result.shortCause = 'Curto-Circuito Direto Fase-Neutro';
        const prospectiveIsc = Math.min(18000, spPhase.v / Math.max(0.015, reach.rPath));
        addPathCurrent(reach.pathEdges, prospectiveIsc);
      }
    });
  });

  // 7. CÁLCULO DE CORRENTE DAS CARGAS AC (LÂMPADAS, MOTORES, TOMADAS)
  comps.forEach(load => {
    load.state = load.state || {};
    const d = getComponentDef(load.code);

    // Motor Trifásico
    if (['motor3', 'pump'].includes(d.kind) || load.code === 'PUMP' || load.code === 'M3PH') {
      const nU = `${load.id}:U`, nV = `${load.id}:V`, nW = `${load.id}:W`;
      let hasL1 = false, hasL2 = false, hasL3 = false;
      let pathL1: InternalEdge[] = [], pathL2: InternalEdge[] = [], pathL3: InternalEdge[] = [];
      let rL1 = 0, rL2 = 0, rL3 = 0;

      sourcePoles.forEach(sp => {
        const m = reachMap.get(sp.id);
        if (!m) return;
        if (sp.net === 'L1' && m.has(nU)) { hasL1 = true; rL1 = m.get(nU)!.rPath; pathL1 = m.get(nU)!.pathEdges; }
        if (sp.net === 'L2' && m.has(nV)) { hasL2 = true; rL2 = m.get(nV)!.rPath; pathL2 = m.get(nV)!.pathEdges; }
        if (sp.net === 'L3' && m.has(nW)) { hasL3 = true; rL3 = m.get(nW)!.rPath; pathL3 = m.get(nW)!.pathEdges; }
      });

      if (hasL1 && hasL2 && hasL3 && !result.hasDirectShort && !load.state.isBurned) {
        const pNom = Number(load.params?.power || 7500);
        const rpmNom = Number(load.params?.rpm || 2920);
        const pfNom = Number(load.params?.pf || 0.86);
        const iNominal = pNom / (Math.sqrt(3) * 400 * pfNom);

        load.state.startupTime = (load.state.startupTime || 0) + dt;
        const currentRpm = Number(load.state.rpm || 0);
        const slip = Math.max(0.027, (3000 - currentRpm) / 3000);

        const inrushFactor = 1.0 + (5.5 * Math.pow(slip / 1.0, 1.4));
        const dynamicCurrent = iNominal * inrushFactor;

        const avgR = (rL1 + rL2 + rL3) / 3;
        const deltaV = Math.sqrt(3) * dynamicCurrent * avgR;
        const vReal = Math.max(300, 400 - deltaV);
        const pReal = Math.sqrt(3) * vReal * dynamicCurrent * pfNom;

        load.state.running = true;
        load.state.energized = true;
        load.state.voltage = Number(vReal.toFixed(1));
        load.state.current = Number(dynamicCurrent.toFixed(2));
        load.state.powerKW = Number((pReal / 1000).toFixed(2));

        result.totalActivePower += pReal;
        result.totalLineCurrent += dynamicCurrent;

        addPathCurrent(pathL1, dynamicCurrent);
        addPathCurrent(pathL2, dynamicCurrent);
        addPathCurrent(pathL3, dynamicCurrent);
      } else {
        load.state.running = false;
        load.state.energized = false;
        load.state.current = 0;
        load.state.voltage = 0;
        load.state.startupTime = 0;
      }
      return;
    }

    // Cargas Monofásicas (Lâmpadas, Resistências, etc.)
    if (['HEATER', 'LAMP', 'PILOT_GREEN', 'PILOT_RED', 'PILOT_YELLOW'].includes(load.code)) {
      const nL = `${load.id}:L`, nN = `${load.id}:N`;
      let phasePole: SourcePole | null = null, neutPole: SourcePole | null = null;
      let pathL: InternalEdge[] = [], pathN: InternalEdge[] = [];
      let rL = 0, rN = 0;

      sourcePoles.forEach(sp => {
        const m = reachMap.get(sp.id);
        if (m && sp.net.startsWith('L') && m.has(nL)) { phasePole = sp; rL = m.get(nL)!.rPath; pathL = m.get(nL)!.pathEdges; }
        if (m && sp.net === 'N' && m.has(nN)) { neutPole = sp; rN = m.get(nN)!.rPath; pathN = m.get(nN)!.pathEdges; }
      });

      if (phasePole && neutPole && !result.hasDirectShort && !load.state.isBurned) {
        const pNom = Number(load.params?.power || 60);
        const vSource = phasePole.v;
        const iNom = pNom / Math.max(1, vSource);
        const vDrop = (rL + rN) * iNom;
        const vEff = Math.max(0, vSource - vDrop);

        load.state.energized = true;
        load.state.voltage = Number(vEff.toFixed(1));
        load.state.current = Number(iNom.toFixed(3));
        load.state.powerKW = Number((pNom / 1000).toFixed(3));

        result.totalActivePower += pNom;
        result.totalLineCurrent += iNom;

        addPathCurrent(pathL, iNom);
        addPathCurrent(pathN, iNom);
      } else {
        load.state.energized = false;
        load.state.current = 0;
        load.state.voltage = 0;
      }
      return;
    }

    // Tomadas com Cargas Dinâmicas
    if (load.code === 'OUTLET') {
      const nL = `${load.id}:L`, nN = `${load.id}:N`;
      let phasePole: SourcePole | null = null, neutPole: SourcePole | null = null;
      let pathL: InternalEdge[] = [], pathN: InternalEdge[] = [];

      sourcePoles.forEach(sp => {
        const m = reachMap.get(sp.id);
        if (m && sp.net.startsWith('L') && m.has(nL)) { phasePole = sp; pathL = m.get(nL)!.pathEdges; }
        if (m && sp.net === 'N' && m.has(nN)) { neutPole = sp; pathN = m.get(nN)!.pathEdges; }
      });

      const isPlugged = Boolean(phasePole && neutPole && !result.hasDirectShort);
      load.state.energized = isPlugged;

      if (isPlugged) {
        const pWatts = Number(load.params?.powerW || (load.params?.customPowerW || 0));
        const currentA = pWatts > 0 ? (pWatts / 230) : Number(load.params?.targetCurrent || 0);

        load.state.voltage = 230;
        load.state.current = Number(currentA.toFixed(2));
        load.state.powerKW = Number(((currentA * 230) / 1000).toFixed(2));

        result.totalLineCurrent += currentA;
        result.totalActivePower += currentA * 230;

        addPathCurrent(pathL, currentA);
        addPathCurrent(pathN, currentA);
      } else {
        load.state.current = 0;
        load.state.powerKW = 0;
      }
    }
  });

  // 8. TELEMETRIA DO SMART METER (LEITURA REAL EM TEMPO REAL)
  comps.forEach(c => {
    if (c.code === 'SMART_METER') {
      const poleMap = compPoleCurrentMap.get(c.id);
      const measuredI = poleMap ? (poleMap.get('P1') || 0) : 0;
      const meterP = measuredI * 230;
      c.state.current = Number(measuredI.toFixed(2));
      c.state.powerKW = Number((meterP / 1000).toFixed(3));
      c.state.powerW = Math.round(meterP);
      c.state.energyKWh = Number(((c.state.energyKWh || 0) + (meterP / 1000) * (dt / 3600)).toFixed(4));
      c.state.energized = measuredI > 0.005;
    }
  });

  // 9. BALANÇO DE POTÊNCIA CC DO INVERSOR SOLAR OFF-GRID
  pvInverters.forEach(inv => {
    if (!inv.state?.running) {
      inv.state.powerW = 0;
      inv.state.powerKW = 0;
      inv.state.current = 0;
      inv.params.powerW = 0;
      return;
    }

    const poleMap = compPoleCurrentMap.get(inv.id);
    const iAcOut = poleMap ? (poleMap.get('P1') || 0) : 0;
    const pAcOut = iAcOut * 230;
    inv.state.powerW = Math.round(pAcOut);
    inv.state.powerKW = Number((pAcOut / 1000).toFixed(3));
    inv.params.powerW = Math.round(pAcOut);
    inv.state.current = Number(iAcOut.toFixed(2));

    const eta = 0.93;
    const pDcRequired = pAcOut > 0 ? (pAcOut / eta) : 0;

    const pvLoop: DCLoopResult = inv.state['__pvLoop'];
    const batLoop: DCLoopResult = inv.state['__batLoop'];

    const pPvAvail = pvLoop?.maxPowerW || 0;
    const vPv = Number(inv.state.pvVoltage || 0);
    const vBat = Number(inv.state.batVoltage || 51.2);

    if (pPvAvail >= pDcRequired && pPvAvail > 0 && vPv > 0) {
      const pPvDraw = Math.min(pPvAvail, pDcRequired + 400);
      const iPv = Number((pPvDraw / vPv).toFixed(2));

      if (pvLoop?.wiresInLoop) {
        pvLoop.wiresInLoop.forEach(w => { w.current = iPv; w.live = true; });
      }

      const pSurplus = Math.max(0, pPvDraw - pDcRequired);
      const iBatChg = vBat > 0 ? Number((pSurplus / vBat).toFixed(2)) : 0;

      if (batLoop?.wiresInLoop) {
        batLoop.wiresInLoop.forEach(w => { w.current = iBatChg; w.live = true; });
      }

      if (batLoop?.elements) {
        batLoop.elements.forEach(b => {
          if (b.params) {
            b.state = b.state || {};
            const capAh = Number(b.params.capacityAh || 100);
            const nextSoc = Math.min(100, Number(b.params.socPercent || 95) + (iBatChg * dt / (capAh * 36)));
            b.params.socPercent = Number(nextSoc.toFixed(2));
            b.state.percent = Math.round(nextSoc);
            b.state.current = iBatChg;
          }
        });
      }
    } else if (vBat >= 40.0) {
      const pFromPv = Math.min(pPvAvail, pDcRequired);
      const pFromBat = pDcRequired - pFromPv;

      const iPv = vPv > 0 ? Number((pFromPv / vPv).toFixed(2)) : 0;
      if (pvLoop?.wiresInLoop) {
        pvLoop.wiresInLoop.forEach(w => { w.current = iPv; w.live = iPv > 0; });
      }

      const iBatDischg = vBat > 0 ? Number((pFromBat / vBat).toFixed(2)) : 0;
      if (batLoop?.wiresInLoop) {
        batLoop.wiresInLoop.forEach(w => { w.current = iBatDischg; w.live = true; });
      }

      if (batLoop?.elements) {
        batLoop.elements.forEach(b => {
          if (b.params) {
            b.state = b.state || {};
            const capAh = Number(b.params.capacityAh || 100);
            const nextSoc = Math.max(0, Number(b.params.socPercent || 95) - (iBatDischg * dt / (capAh * 36)));
            b.params.socPercent = Number(nextSoc.toFixed(2));
            b.state.percent = Math.round(nextSoc);
            b.state.current = iBatDischg;
          }
        });
      }
    }
  });

  // 10. AVALIAÇÃO FÍSICA E DISPARO DOS DISPOSITIVOS DE PROTEÇÃO
  comps.forEach(prot => {
    prot.state = prot.state || {};
    const d = getComponentDef(prot.code);

    const poleMap = compPoleCurrentMap.get(prot.id);
    let maxCurrent = 0;
    let phaseSum = 0;
    let neutralVal = 0;

    if (poleMap) {
      poleMap.forEach((cVal, pKey) => {
        if (pKey === 'PN') {
          neutralVal += cVal;
        } else {
          phaseSum += cVal;
          if (cVal > maxCurrent) maxCurrent = cVal;
        }
      });
    }

    prot.state.current = Number(maxCurrent.toFixed(2));

    // A. Disjuntores Termomagnéticos
    if (['breaker', 'breaker_1p', 'breaker2', 'breaker3', 'mccb', 'motor_breaker', 'rcbo'].includes(d.kind)) {
      if (prot.state.tripped || prot.state.burned || prot.state.closed === false) return;

      const breakerIn = Number(prot.params?.current || 16);
      const breakerIcu = Number(prot.params?.icu || 6) * 1000;
      const curve = (prot.params?.curve || 'C').toUpperCase();

      if (maxCurrent > breakerIcu) {
        prot.state.damaged = true;
        prot.state.burned = true;
        prot.state.isBurned = true;
        prot.state.tripped = true;
        prot.state.closed = false;
        prot.state.leverPos = 'trip';
        prot.state.flagColor = 'yellow';
        prot.state.tripReason = `DESTRUÍDO: Isc (${(maxCurrent / 1000).toFixed(1)}kA) > Icu (${(breakerIcu / 1000).toFixed(1)}kA)`;
        result.burnedIds.push(prot.id);
        result.trippedIds.push(prot.id);
        return;
      }

      let magMult = 7.5;
      if (curve === 'B') magMult = 4.0;
      else if (curve === 'C') magMult = 7.5;
      else if (curve === 'D') magMult = 14.0;
      if (d.kind === 'motor_breaker') magMult = 13.0;

      if (maxCurrent >= (magMult * breakerIn)) {
        prot.state.tripped = true;
        prot.state.closed = false;
        prot.state.leverPos = 'trip';
        prot.state.flagColor = 'yellow';
        prot.state.tripReason = 'MAGNETIC_SHORT_CIRCUIT';
        prot.state.tripDetails = `Disparo Magnético Instantâneo (${maxCurrent.toFixed(0)}A ≥ ${(magMult * breakerIn).toFixed(0)}A)`;
        result.trippedIds.push(prot.id);
        return;
      }

      if (maxCurrent > (1.05 * breakerIn)) {
        const overloadRatio = maxCurrent / breakerIn;
        const thermalSpeed = Math.pow(overloadRatio, 2.2) * 1.5;
        prot.state.bimetalDeflection = (prot.state.bimetalDeflection || 0) + thermalSpeed * dt;
        prot.state.temp = Number((AMBIENT_TEMPERATURE + prot.state.bimetalDeflection * 45).toFixed(1));

        if (prot.state.bimetalDeflection >= 1.0) {
          prot.state.tripped = true;
          prot.state.closed = false;
          prot.state.leverPos = 'trip';
          prot.state.flagColor = 'yellow';
          prot.state.tripReason = `SOBRECARGA TÉRMICA (${maxCurrent.toFixed(1)}A > In ${breakerIn}A)`;
          prot.state.tripDetails = `Disparo Térmico Bimetálico por sobrecarga continuada (${(overloadRatio * 100).toFixed(0)}% da nominal).`;
          result.trippedIds.push(prot.id);
        }
      } else {
        prot.state.bimetalDeflection = Math.max(0, (prot.state.bimetalDeflection || 0) - 0.4 * dt);
        prot.state.temp = Number((AMBIENT_TEMPERATURE + (prot.state.bimetalDeflection || 0) * 45).toFixed(1));
      }
    }

    // B. Fusíveis
    if (['fuse', 'fuse3'].includes(d.kind)) {
      if (prot.state.burned || prot.state.isBurned) return;

      const fuseIn = Number(prot.params?.current || 10);
      if (maxCurrent > (1.2 * fuseIn)) {
        const fuseRatio = maxCurrent / fuseIn;
        const i2tInc = Math.pow(fuseRatio, 2.4) * 1.2 * dt;
        prot.state.i2t = (prot.state.i2t || 0) + i2tInc;
        prot.state.temp = Number((AMBIENT_TEMPERATURE + prot.state.i2t * 60).toFixed(1));

        if (prot.state.i2t >= 1.0 || maxCurrent >= (8 * fuseIn)) {
          prot.state.burned = true;
          prot.state.isBurned = true;
          prot.state.tripped = true;
          prot.state.closed = false;
          if (prot.params) prot.params.burned = true;
          prot.state.tripReason = `FUSÍVEL ROMPIDO (I²t: ${maxCurrent.toFixed(1)}A > ${fuseIn}A)`;
          result.burnedIds.push(prot.id);
          result.trippedIds.push(prot.id);
        }
      } else {
        prot.state.i2t = Math.max(0, (prot.state.i2t || 0) - 0.3 * dt);
      }
    }

    // C. Relé Térmico de Sobrecarga (OLR)
    if (d.kind === 'overload') {
      if (prot.state.tripped) return;

      const olrIr = Number(prot.params?.current || 16);
      if (maxCurrent > (1.05 * olrIr)) {
        const olrRatio = maxCurrent / olrIr;
        const heatInc = Math.pow(olrRatio, 2.2) * 0.6 * dt;
        prot.state.thermalAccumulator = (prot.state.thermalAccumulator || 0) + heatInc;
        prot.state.temp = Number((AMBIENT_TEMPERATURE + prot.state.thermalAccumulator * 50).toFixed(1));

        if (prot.state.thermalAccumulator >= 1.0) {
          prot.state.tripped = true;
          prot.state.tripReason = `SOBRECARGA DO MOTOR (${maxCurrent.toFixed(1)}A > Ir ${olrIr}A)`;
          result.trippedIds.push(prot.id);
        }
      } else {
        prot.state.thermalAccumulator = Math.max(0, (prot.state.thermalAccumulator || 0) - 0.2 * dt);
      }
    }

    // D. IDR Diferencial Residual
    if (['rcd', 'rcd4'].includes(d.kind)) {
      if (prot.state.tripped || prot.state.closed === false) return;

      const rcdSens = Number(prot.params?.leakage || 0.03);
      const residualLeakage = Math.abs(phaseSum - neutralVal);

      if (prot.params?.testPressed || residualLeakage >= (rcdSens * 0.7)) {
        prot.state.tripped = true;
        prot.state.closed = false;
        prot.state.leverPos = 'trip';
        prot.state.flagColor = 'yellow';
        prot.state.tripReason = prot.params?.testPressed
          ? 'TESTE MANUAL IDR'
          : `FUGA À TERRA (${(residualLeakage * 1000).toFixed(0)}mA ≥ ${(rcdSens * 1000).toFixed(0)}mA)`;
        result.trippedIds.push(prot.id);
      }
    }
  });

  // 11. INSTRUMENTOS DE MEDIÇÃO
  comps.forEach(inst => {
    inst.state = inst.state || {};

    if (inst.code === 'VM') {
      const nPlus = `${inst.id}:+`;
      const nMinus = `${inst.id}:-`;
      let vPlus = 0, vMinus = 0;

      sourcePoles.forEach(sp => {
        const m = reachMap.get(sp.id);
        if (m && m.has(nPlus)) vPlus = sp.v;
        if (m && m.has(nMinus)) vMinus = sp.v;
      });

      const vDiff = Math.abs(vPlus - vMinus);
      inst.state.voltage = Number(vDiff.toFixed(1));
      inst.state.energized = vDiff > 5;
    } else if (inst.code === 'AM') {
      const poleMap = compPoleCurrentMap.get(inst.id);
      const measuredCurrent = poleMap ? (poleMap.get('P1') || 0) : 0;
      inst.state.current = Number(measuredCurrent.toFixed(2));
      inst.state.energized = measuredCurrent > 0.02;
    } else if (inst.code === 'WM') {
      const vMeas = result.mainVoltageRMS || 230;
      const poleMap = compPoleCurrentMap.get(inst.id);
      const iMeas = poleMap ? (poleMap.get('P1') || 0) : 0;
      const pf = result.activePF || 0.86;
      inst.state.voltage = Number(vMeas.toFixed(1));
      inst.state.current = Number(iMeas.toFixed(2));
      inst.state.powerKW = Number(((vMeas * iMeas * pf) / 1000).toFixed(2));
    }
  });

  // 12. EQUAÇÃO TÉRMICA CONTÍNUA JOULE NOS CONDUTORES
  wires.forEach(w => {
    const nodeA = `${w.a?.c}:${w.a?.t}`;
    const nodeB = `${w.b?.c}:${w.b?.t}`;

    let isLive = false;
    sourcePoles.forEach(sp => {
      const map = reachMap.get(sp.id);
      if (map && (map.has(nodeA) || map.has(nodeB))) isLive = true;
    });

    const current = wireCurrentMap.get(w.id) || 0;
    w.current = Number(current.toFixed(3));
    w.live = isLive && !w.burned && !w.carbonized;
    w.frequency = isLive ? (result.activeFrequency || 50.0) : 0.0;

    const gauge = Number(w.gauge || 2.5);
    const length = Number(w.length || 2.0);
    const currentTemp = Number(w.temp ?? AMBIENT_TEMPERATURE);

    const rhoT = COPPER_RESISTIVITY * (1 + COPPER_ALPHA_TEMP * (currentTemp - 20));
    const rWire = (rhoT * length) / gauge;
    w.voltageDrop = Number((current * rWire).toFixed(3));

    const pJoule = rWire * Math.pow(current, 2);
    const pDiss = 0.9 * (gauge / 2.5) * Math.max(0, currentTemp - AMBIENT_TEMPERATURE);
    const cTh = Math.max(0.5, 3.8 * gauge * length);

    const deltaT = ((pJoule - pDiss) / cTh) * dt * 8.0;
    const nextTemp = Math.max(AMBIENT_TEMPERATURE, currentTemp + deltaT);
    w.temp = Number(nextTemp.toFixed(1));

    w.overheated = w.temp >= PVC_MAX_TEMP;
    w.smoke = w.temp >= PVC_CRITICAL_MELT_TEMP;

    if (w.temp >= PVC_CARBONIZATION_TEMP) {
      w.carbonized = true;
      w.burned = true;
      w.fault = true;
      w.current = 0;
      w.live = false;
    }
  });

  return result;
}

// ----------------------------------------------------------------------------
// CIRCUITOS DE REFERÊNCIA NORMATIVOS
// ----------------------------------------------------------------------------
export function generateDirectMotorStarterCircuit(): { components: any[]; wires: any[] } {
  const components = [
    {
      id: 'SRC1',
      code: 'SRC_AC3',
      x: -360,
      y: -90,
      rot: 0,
      w: 125,
      h: 85,
      params: { voltage: 400, frequency: 50, internalR: 0.03, closed: true },
      state: { energized: true, running: true },
      label: 'Rede 400V 3F+N+PE'
    },
    {
      id: 'Q1',
      code: 'MPCB',
      x: -210,
      y: -90,
      rot: 0,
      w: 95,
      h: 85,
      params: { current: 16, closed: true, temp: 25 },
      state: { closed: true, tripped: false, flagColor: 'red', leverPos: 'up' },
      label: 'Q1: Disjuntor-Motor'
    },
    {
      id: 'KM1',
      code: 'CONTACTOR',
      x: -50,
      y: -90,
      rot: 0,
      w: 110,
      h: 85,
      params: { coil: 230, minPickupRatio: 0.85 },
      state: { closed: false, energized: false },
      label: 'KM1: Contator Principal'
    },
    {
      id: 'F1',
      code: 'OLR',
      x: 110,
      y: -90,
      rot: 0,
      w: 105,
      h: 80,
      params: { current: 16, resetMode: 'manual' },
      state: { tripped: false },
      label: 'F1: Relé Térmico'
    },
    {
      id: 'M1',
      code: 'M3PH',
      x: 280,
      y: -90,
      rot: 0,
      w: 120,
      h: 90,
      params: { power: 7500, rpm: 2920, voltage: 400, pf: 0.86 },
      state: { running: false, energized: false, rpm: 0 },
      label: 'M1: Motor Trifásico'
    },
    {
      id: 'S0',
      code: 'PBNC',
      x: -210,
      y: 130,
      rot: 0,
      w: 90,
      h: 65,
      params: { closed: true, pressed: false },
      state: { closed: true, pressed: false },
      label: 'S0: Desliga (NF)'
    },
    {
      id: 'S1',
      code: 'PBNO',
      x: -60,
      y: 130,
      rot: 0,
      w: 90,
      h: 65,
      params: { closed: false, pressed: false },
      state: { closed: false, pressed: false },
      label: 'S1: Liga (NA)'
    },
    {
      id: 'H1',
      code: 'PILOT_GREEN',
      x: 110,
      y: 130,
      rot: 0,
      w: 85,
      h: 65,
      params: { power: 3, voltage: 230 },
      state: { energized: false },
      label: 'H1: Em Marcha'
    }
  ];

  const wires = [
    { id: 'W1', a: { c: 'SRC1', t: 'L1' }, b: { c: 'Q1', t: '1' }, type: 'L1', gauge: 4.0, length: 2.5, live: false },
    { id: 'W2', a: { c: 'SRC1', t: 'L2' }, b: { c: 'Q1', t: '3' }, type: 'L2', gauge: 4.0, length: 2.5, live: false },
    { id: 'W3', a: { c: 'SRC1', t: 'L3' }, b: { c: 'Q1', t: '5' }, type: 'L3', gauge: 4.0, length: 2.5, live: false },
    { id: 'W4', a: { c: 'Q1', t: '2' }, b: { c: 'KM1', t: '1' }, type: 'L1', gauge: 4.0, length: 1.5, live: false },
    { id: 'W5', a: { c: 'Q1', t: '4' }, b: { c: 'KM1', t: '3' }, type: 'L2', gauge: 4.0, length: 1.5, live: false },
    { id: 'W6', a: { c: 'Q1', t: '6' }, b: { c: 'KM1', t: '5' }, type: 'L3', gauge: 4.0, length: 1.5, live: false },
    { id: 'W7', a: { c: 'KM1', t: '2' }, b: { c: 'F1', t: '1' }, type: 'L1', gauge: 4.0, length: 1.2, live: false },
    { id: 'W8', a: { c: 'KM1', t: '4' }, b: { c: 'F1', t: '3' }, type: 'L2', gauge: 4.0, length: 1.2, live: false },
    { id: 'W9', a: { c: 'KM1', t: '6' }, b: { c: 'F1', t: '5' }, type: 'L3', gauge: 4.0, length: 1.2, live: false },
    { id: 'W10', a: { c: 'F1', t: '2' }, b: { c: 'M1', t: 'U' }, type: 'L1', gauge: 4.0, length: 6.0, live: false },
    { id: 'W11', a: { c: 'F1', t: '4' }, b: { c: 'M1', t: 'V' }, type: 'L2', gauge: 4.0, length: 6.0, live: false },
    { id: 'W12', a: { c: 'F1', t: '6' }, b: { c: 'M1', t: 'W' }, type: 'L3', gauge: 4.0, length: 6.0, live: false },
    { id: 'W13', a: { c: 'SRC1', t: 'L1' }, b: { c: 'F1', t: '95' }, type: 'CTRL', gauge: 1.5, length: 3.0, live: false },
    { id: 'W14', a: { c: 'F1', t: '96' }, b: { c: 'S0', t: '1' }, type: 'CTRL', gauge: 1.5, length: 2.0, live: false },
    { id: 'W15', a: { c: 'S0', t: '2' }, b: { c: 'S1', t: '3' }, type: 'CTRL', gauge: 1.5, length: 1.0, live: false },
    { id: 'W16', a: { c: 'S1', t: '3' }, b: { c: 'KM1', t: '13' }, type: 'CTRL', gauge: 1.5, length: 2.5, live: false },
    { id: 'W17', a: { c: 'S1', t: '4' }, b: { c: 'KM1', t: '14' }, type: 'CTRL', gauge: 1.5, length: 2.5, live: false },
    { id: 'W18', a: { c: 'KM1', t: '14' }, b: { c: 'KM1', t: 'A1' }, type: 'CTRL', gauge: 1.5, length: 0.8, live: false },
    { id: 'W19', a: { c: 'KM1', t: 'A2' }, b: { c: 'SRC1', t: 'N' }, type: 'N', gauge: 1.5, length: 3.5, live: false },
    { id: 'W20', a: { c: 'KM1', t: 'A1' }, b: { c: 'H1', t: 'L' }, type: 'CTRL', gauge: 1.5, length: 2.0, live: false },
    { id: 'W21', a: { c: 'H1', t: 'N' }, b: { c: 'SRC1', t: 'N' }, type: 'N', gauge: 1.5, length: 3.5, live: false }
  ];

  return { components, wires };
}

export function generateFourWayLightingCircuit(): { components: any[]; wires: any[] } {
  const components = [
    {
      id: 'SRC1',
      code: 'SRC_AC1',
      x: -360,
      y: 0,
      rot: 0,
      w: 110,
      h: 80,
      params: { voltage: 230, frequency: 50, closed: true },
      state: { energized: true },
      label: 'Fonte 230V AC'
    },
    {
      id: 'Q1',
      code: 'MCB_1P',
      x: -220,
      y: 0,
      rot: 0,
      w: 50,
      h: 75,
      params: { current: 10, curve: 'C', closed: true },
      state: { closed: true, tripped: false, flagColor: 'red', leverPos: 'up' },
      label: 'Q1: MCB 1P 10A'
    },
    {
      id: 'S1',
      code: 'THREE_WAY',
      x: -70,
      y: 0,
      rot: 0,
      w: 95,
      h: 75,
      params: { position: 0 },
      state: { closed: false, rockerAngle: 0 },
      label: 'S1: Three-Way (Entrada)'
    },
    {
      id: 'S2',
      code: 'FOUR_WAY',
      x: 90,
      y: 0,
      rot: 0,
      w: 100,
      h: 75,
      params: { crossed: false },
      state: { closed: false, rockerAngle: 0 },
      label: 'S2: Four-Way (Cruzamento)'
    },
    {
      id: 'S3',
      code: 'THREE_WAY',
      x: 250,
      y: 0,
      rot: 0,
      w: 95,
      h: 75,
      params: { position: 0 },
      state: { closed: false, rockerAngle: 0 },
      label: 'S3: Three-Way (Saída)'
    },
    {
      id: 'E1',
      code: 'LAMP',
      x: 390,
      y: 0,
      rot: 0,
      w: 85,
      h: 85,
      params: { power: 60, voltage: 230, pf: 1.0 },
      state: { energized: false },
      label: 'E1: Lâmpada E27'
    }
  ];

  const wires = [
    { id: 'W1', a: { c: 'SRC1', t: 'L' }, b: { c: 'Q1', t: '1' }, type: 'L1', gauge: 1.5, length: 1.5, live: false },
    { id: 'W2', a: { c: 'Q1', t: '2' }, b: { c: 'S1', t: 'C' }, type: 'L1', gauge: 1.5, length: 2.0, live: false },
    { id: 'W3', a: { c: 'S1', t: 'R1' }, b: { c: 'S2', t: 'IN1' }, type: 'CTRL', gauge: 1.5, length: 3.0, live: false },
    { id: 'W4', a: { c: 'S1', t: 'R2' }, b: { c: 'S2', t: 'IN2' }, type: 'CTRL', gauge: 1.5, length: 3.0, live: false },
    { id: 'W5', a: { c: 'S2', t: 'OUT1' }, b: { c: 'S3', t: 'R1' }, type: 'CTRL', gauge: 1.5, length: 3.0, live: false },
    { id: 'W6', a: { c: 'S2', t: 'OUT2' }, b: { c: 'S3', t: 'R2' }, type: 'CTRL', gauge: 1.5, length: 3.0, live: false },
    { id: 'W7', a: { c: 'S3', t: 'C' }, b: { c: 'E1', t: 'L' }, type: 'L1', gauge: 1.5, length: 2.5, live: false },
    { id: 'W8', a: { c: 'E1', t: 'N' }, b: { c: 'SRC1', t: 'N' }, type: 'N', gauge: 1.5, length: 6.0, live: false }
  ];

  return { components, wires };
}

export function generateQgdProtectionCircuit(): { components: any[]; wires: any[] } {
  const components = [
    {
      id: 'SRC1',
      code: 'SRC_AC1',
      x: -360,
      y: 0,
      rot: 0,
      w: 110,
      h: 80,
      params: { voltage: 230, frequency: 50, closed: true },
      state: { energized: true },
      label: 'Rede Baixa Tensão'
    },
    {
      id: 'Q_MAIN',
      code: 'MCB1',
      x: -210,
      y: 0,
      rot: 0,
      w: 90,
      h: 75,
      params: { current: 63, curve: 'C', icu: 10, closed: true },
      state: { closed: true, tripped: false, flagColor: 'red', leverPos: 'up' },
      label: 'Geral: 1P+N 63A'
    },
    {
      id: 'RCD1',
      code: 'RCD',
      x: -60,
      y: 0,
      rot: 0,
      w: 100,
      h: 75,
      params: { current: 40, leakage: 0.03, closed: true, testPressed: false },
      state: { closed: true, tripped: false, flagColor: 'red', leverPos: 'up' },
      label: 'IDR 2P 30mA'
    },
    {
      id: 'Q_C1',
      code: 'MCB_1P',
      x: 110,
      y: -90,
      rot: 0,
      w: 50,
      h: 75,
      params: { current: 10, curve: 'C', icu: 6, closed: true },
      state: { closed: true, tripped: false, flagColor: 'red', leverPos: 'up' },
      label: 'C1: Ilum 10A'
    },
    {
      id: 'LAMP1',
      code: 'LAMP',
      x: 250,
      y: -90,
      rot: 0,
      w: 85,
      h: 85,
      params: { power: 100, voltage: 230, pf: 1.0 },
      state: { energized: true },
      label: 'Lâmpadas 100W'
    },
    {
      id: 'Q_C2',
      code: 'MCB_1P',
      x: 110,
      y: 90,
      rot: 0,
      w: 50,
      h: 75,
      params: { current: 16, curve: 'C', icu: 6, closed: true },
      state: { closed: true, tripped: false, flagColor: 'red', leverPos: 'up' },
      label: 'C2: TUG 16A'
    },
    {
      id: 'OUTLET1',
      code: 'OUTLET',
      x: 250,
      y: 90,
      rot: 0,
      w: 85,
      h: 70,
      params: { current: 16, voltage: 230, pluggedAppliance: 'NONE', customPowerW: 2000, targetCurrent: 0 },
      state: { energized: true, appliance: 'NONE', appliancePower: 0 },
      label: 'Tomadas Gerais 16A'
    }
  ];

  const wires = [
    { id: 'W1', a: { c: 'SRC1', t: 'L' }, b: { c: 'Q_MAIN', t: '1' }, type: 'L1', gauge: 10.0, length: 1.0, live: false },
    { id: 'W2', a: { c: 'Q_MAIN', t: '2' }, b: { c: 'RCD1', t: '1' }, type: 'L1', gauge: 10.0, length: 1.2, live: false },
    { id: 'W3', a: { c: 'SRC1', t: 'N' }, b: { c: 'Q_MAIN', t: 'N_IN' }, type: 'N', gauge: 10.0, length: 1.0, live: false },
    { id: 'W4', a: { c: 'Q_MAIN', t: 'N_OUT' }, b: { c: 'RCD1', t: 'N_IN' }, type: 'N', gauge: 10.0, length: 1.2, live: false },
    { id: 'W5', a: { c: 'RCD1', t: '2' }, b: { c: 'Q_C1', t: '1' }, type: 'L1', gauge: 4.0, length: 1.5, live: false },
    { id: 'W6', a: { c: 'RCD1', t: '2' }, b: { c: 'Q_C2', t: '1' }, type: 'L1', gauge: 4.0, length: 1.5, live: false },
    { id: 'W7', a: { c: 'Q_C1', t: '2' }, b: { c: 'LAMP1', t: 'L' }, type: 'L1', gauge: 1.5, length: 3.5, live: false },
    { id: 'W8', a: { c: 'LAMP1', t: 'N' }, b: { c: 'RCD1', t: 'N_OUT' }, type: 'N', gauge: 1.5, length: 3.5, live: false },
    { id: 'W9', a: { c: 'Q_C2', t: '2' }, b: { c: 'OUTLET1', t: 'L' }, type: 'L1', gauge: 2.5, length: 4.0, live: false },
    { id: 'W10', a: { c: 'OUTLET1', t: 'N' }, b: { c: 'RCD1', t: 'N_OUT' }, type: 'N', gauge: 2.5, length: 4.0, live: false }
  ];

  return { components, wires };
}

export function generateSolarPVIsoCircuit(): { components: any[]; wires: any[] } {
  const components = [
    {
      id: 'PV1',
      code: 'PV_PANEL',
      x: -360,
      y: -60,
      rot: 0,
      w: 110,
      h: 100,
      params: { pMax: 550, voc: 49.8, isc: 13.9, vmpp: 41.8, impp: 13.15, irradiance: 1000 },
      state: { energized: false, running: false, voltage: 0 },
      label: 'Módulo FV 1 (550W)'
    },
    {
      id: 'PV2',
      code: 'PV_PANEL',
      x: -230,
      y: -60,
      rot: 0,
      w: 110,
      h: 100,
      params: { pMax: 550, voc: 49.8, isc: 13.9, vmpp: 41.8, impp: 13.15, irradiance: 1000 },
      state: { energized: false, running: false, voltage: 0 },
      label: 'Módulo FV 2 (550W)'
    },
    {
      id: 'BAT1',
      code: 'BAT_LIFEPO4',
      x: -360,
      y: 90,
      rot: 0,
      w: 125,
      h: 85,
      params: { voltage: 51.2, capacityAh: 100, socPercent: 95 },
      state: { energized: false, voltage: 0 },
      label: 'Bateria LiFePO4 48V'
    },
    {
      id: 'INV1',
      code: 'PV_INVERTER_OFFGRID',
      x: -60,
      y: 0,
      rot: 0,
      w: 125,
      h: 90,
      params: { powerW: 5000, batVoltage: 51.2, acOutVoltage: 230, running: false },
      state: { energized: false, running: false, voltage: 0, pvVoltage: 0, batVoltage: 0 },
      label: 'Inversor Off-Grid 5kW'
    },
    {
      id: 'METER1',
      code: 'SMART_METER',
      x: 120,
      y: 0,
      rot: 0,
      w: 75,
      h: 80,
      params: { importedKWh: 0, exportedKWh: 0, powerW: 0 },
      state: { energized: false, powerKW: 0 },
      label: 'Smart Meter RS-485'
    },
    {
      id: 'LAMP1',
      code: 'LAMP',
      x: 260,
      y: 0,
      rot: 0,
      w: 85,
      h: 85,
      params: { power: 60, voltage: 230, pf: 1.0 },
      state: { energized: false, voltage: 0, current: 0, powerKW: 0 },
      label: 'Cargas AC 230V'
    }
  ];

  const wires = [
    { id: 'W_SERIE', a: { c: 'PV1', t: '+' }, b: { c: 'PV2', t: '-' }, type: '24+', gauge: 4.0, length: 1.5, live: false },
    { id: 'W_PV_P', a: { c: 'PV2', t: '+' }, b: { c: 'INV1', t: 'PV+' }, type: '24+', gauge: 4.0, length: 3.0, live: false },
    { id: 'W_PV_M', a: { c: 'PV1', t: '-' }, b: { c: 'INV1', t: 'PV-' }, type: '24-', gauge: 4.0, length: 4.5, live: false },
    { id: 'W_BAT_P', a: { c: 'BAT1', t: '+' }, b: { c: 'INV1', t: 'BAT+' }, type: '24+', gauge: 16.0, length: 2.0, live: false },
    { id: 'W_BAT_M', a: { c: 'BAT1', t: '-' }, b: { c: 'INV1', t: 'BAT-' }, type: '24-', gauge: 16.0, length: 2.0, live: false },
    { id: 'W_AC_L', a: { c: 'INV1', t: 'AC_L' }, b: { c: 'METER1', t: 'L_IN' }, type: 'L1', gauge: 2.5, length: 2.0, live: false },
    { id: 'W_AC_N', a: { c: 'INV1', t: 'AC_N' }, b: { c: 'METER1', t: 'N_IN' }, type: 'N', gauge: 2.5, length: 2.0, live: false },
    { id: 'W_OUT_L', a: { c: 'METER1', t: 'L_OUT' }, b: { c: 'LAMP1', t: 'L' }, type: 'L1', gauge: 2.5, length: 2.0, live: false },
    { id: 'W_OUT_N', a: { c: 'METER1', t: 'N_OUT' }, b: { c: 'LAMP1', t: 'N' }, type: 'N', gauge: 2.5, length: 2.0, live: false }
  ];

  return { components, wires };
}