// ============================================================================
// TÉCNICAMZ PRO — MOTOR CAD ELÉTRICO, FÍSICA NODAL & MATRIZ DE COMUTAÇÃO (V21)
// Modelagem Paramétrica Dinâmica: Fotovoltaico (pMax, Vmpp, Impp), Baterias LiFePO4
// (Tensão, Ah, SOC), Inversores, Motores e Proteções Ajustáveis em Tempo Real
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
  solar: 'Energia Solar & Armazenamento',
  generators: 'Geração & Transferência (ATS/MTS)',
  protection: 'Proteção & Seccionamento',
  command: 'Comandos & Acionamentos',
  motors: 'Motores & Cargas Mecânicas',
  automation: 'Automação & Temporização',
  electronics: 'Eletrônica & Semicondutores',
  measurement: 'Instrumentação & Medição',
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
  '24+': '#ef4444', // Vermelho / DC Positivo (+24V / +48V / +PV)
  '24-': '#3b82f6', // Azul Escuro / DC Negativo (0V / -PV)
  CTRL: '#f59e0b' // Amarelo / Comando & Intertravamento
};

export const COPPER_RESISTIVITY = 0.0175; // Ω·mm²/m
export const COPPER_CONDUCTIVITY = 57.14;
export const AMBIENT_TEMPERATURE = 25.0;
export const PVC_MAX_TEMP = 70.0;
export const THERMAL_DISSIPATION_COEFF = 0.12;

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
  // ==========================================================================
  // 1. COMANDOS, SENSORES E CONTROLES
  // ==========================================================================
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

  // ==========================================================================
  // 2. CONTACTORES, RELÉS E TEMPORIZADORES DIN
  // ==========================================================================
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

  // ==========================================================================
  // 3. DISJUNTORES, FUSÍVEIS E PROTEÇÃO DIN
  // ==========================================================================
  {
    code: 'MCB_1P',
    name: 'Disjuntor Unipolar Parcial 1P Curva C (1 Polo 18mm)',
    cat: 'protection',
    icon: '▣',
    terminals: [['1', 'IN', 'L1'], ['2', 'OUT', 'L1']],
    kind: 'breaker_1p',
    params: { current: 16, curve: 'C', closed: true, temp: 25, overloadTimer: 0, tripped: false }
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
    params: { current: 16, curve: 'C', closed: true, temp: 25, overloadTimer: 0, tripped: false }
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
    params: { current: 25, curve: 'C', closed: true, temp: 25, overloadTimer: 0, tripped: false }
  },
  {
    code: 'MPCB',
    name: 'Disjuntor-Motor Magnético-Térmico 3P (Sem Neutro / Start-Stop)',
    cat: 'protection',
    icon: '⚙',
    terminals: [
      ['1', 'IN', 'L1'], ['2', 'OUT', 'L1'],
      ['3', 'IN', 'L2'], ['4', 'OUT', 'L2'],
      ['5', 'IN', 'L3'], ['6', 'OUT', 'L3']
    ],
    kind: 'motor_breaker',
    params: { current: 16, rangeMin: 10, rangeMax: 16, closed: true, temp: 25, overloadTimer: 0, tripped: false }
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
    params: { current: 32, curve: 'C', closed: true, temp: 25, overloadTimer: 0, tripped: false }
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
    params: { current: 63, curve: 'C', closed: true, icu: 36, temp: 25, overloadTimer: 0, tripped: false }
  },
  {
    code: 'FUSE',
    name: 'Porta-Fusível Seccionável DIN 10x38mm (Cerâmico gG)',
    cat: 'protection',
    icon: '⏤',
    terminals: [['1', 'IN', 'L1'], ['2', 'OUT', 'L1']],
    kind: 'fuse',
    params: { current: 10, closed: true, temp: 25, burned: false }
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
    params: { current: 25, closed: true, temp: 25, burned: false }
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
    params: { current: 16, curve: 'C', leakage: 0.03, closed: true, temp: 25, overloadTimer: 0, tripped: false, testPressed: false }
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
    params: { current: 18, resetMode: 'manual', heatAccumulator: 0, tripped: false }
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

  // ==========================================================================
  // 4. GERAÇÃO & TRANSFERÊNCIA (GMG, ATS, MTS)
  // ==========================================================================
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
    params: { kva: 25, voltage: 400, frequency: 50, running: false, rpm: 1500, fuelPercent: 95 }
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
    params: { sourceInUse: 'GRID', gridHealthy: true, autoMode: true }
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
    params: { position: 1 } // 1: Rede (I), 0: Desligado/Neutro (0), 2: Gerador (II)
  },

  // ==========================================================================
  // 5. ENERGIA SOLAR & ARMAZENAMENTO INTELIGENTE
  // ==========================================================================
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
    params: { powerW: 5000, batVoltage: 48, acOutVoltage: 230, running: false }
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
    params: { voltage: 51.2, capacityAh: 100, socPercent: 90, bmsOk: true }
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

  // ==========================================================================
  // 6. MOTORES & MÁQUINAS
  // ==========================================================================
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
    params: { power: 3000, rpm: 2880, voltage: 400, pf: 0.85, flowM3h: 18.5, headMeters: 32 }
  },

  // ==========================================================================
  // 7. ATERRAMENTO & DISTRIBUIÇÃO
  // ==========================================================================
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
  },

  // ==========================================================================
  // 8. FONTES, ILUMINAÇÃO & CARGAS
  // ==========================================================================
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
    name: 'Sinaleiro Piloto Industrial 22mm Verde (Em Marcha)',
    cat: 'loads',
    icon: '🟢',
    terminals: [['L', 'IN', 'CTRL'], ['N', 'IN', 'N']],
    kind: 'lamp',
    params: { power: 3, voltage: 230, color: 'green', pf: 1.0 }
  },
  {
    code: 'PILOT_RED',
    name: 'Sinaleiro Piloto Industrial 22mm Vermelho (Desligado)',
    cat: 'loads',
    icon: '🔴',
    terminals: [['L', 'IN', 'CTRL'], ['N', 'IN', 'N']],
    kind: 'lamp',
    params: { power: 3, voltage: 230, color: 'red', pf: 1.0 }
  },
  {
    code: 'PILOT_YELLOW',
    name: 'Sinaleiro Piloto Industrial 22mm Amarelo (Falha / Alerta)',
    cat: 'loads',
    icon: '🟡',
    terminals: [['L', 'IN', 'CTRL'], ['N', 'IN', 'N']],
    kind: 'lamp',
    params: { power: 3, voltage: 230, color: 'yellow', pf: 1.0 }
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
    code: 'OUTLET',
    name: 'Tomada de Uso Geral 2P+T 16A 230V (Schuko / NBR)',
    cat: 'loads',
    icon: '▣',
    terminals: [['L', 'IN', 'L1'], ['N', 'IN', 'N'], ['PE', 'PE', 'PE']],
    kind: 'outlet',
    params: { current: 16, voltage: 230 }
  }
];

export const COMPONENT_MAP = new Map<string, ComponentDef>(
  COMPONENT_CATALOG.map(c => [c.code, c])
);

export function getComponentDef(code: string): ComponentDef {
  return COMPONENT_MAP.get(code) || COMPONENT_CATALOG[0];
}

// ----------------------------------------------------------------------------
// ARITMÉTICA COMPLEXA PARA SOLVER FASORIAL CA
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

export function gaussComplex(A: Complex[][], b: Complex[]): Complex[] {
  const n = b.length;
  const M = A.map((r, i) => r.map(x => ({ ...x })).concat([{ ...b[i] }]));

  for (let k = 0; k < n; k++) {
    let piv = k;
    let best = cabs(M[k][k]);
    for (let i = k + 1; i < n; i++) {
      const v = cabs(M[i][k]);
      if (v > best) {
        best = v;
        piv = i;
      }
    }
    if (best < 1e-12) continue;
    if (piv !== k) [M[k], M[piv]] = [M[piv], M[k]];

    for (let i = k + 1; i < n; i++) {
      const f = cd(M[i][k], M[k][k]);
      if (cabs(f) < 1e-15) continue;
      for (let j = k; j <= n; j++) {
        M[i][j] = cs(M[i][j], cm(f, M[k][j]));
      }
    }
  }

  const x = Array.from({ length: n }, () => cx());
  for (let i = n - 1; i >= 0; i--) {
    let v = { ...M[i][n] };
    for (let j = i + 1; j < n; j++) {
      v = cs(v, cm(M[i][j], x[j]));
    }
    x[i] = cabs(M[i][i]) < 1e-12 ? cx() : cd(v, M[i][i]);
  }
  return x;
}

// ----------------------------------------------------------------------------
// MOTOR DE FÍSICA NODAL REAL & GRAFO DE CONECTIVIDADE SEM MOCKS
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
      w.temp = Math.max(AMBIENT_TEMPERATURE, (w.temp || AMBIENT_TEMPERATURE) - dt * 5.0);
    });

    comps.forEach(c => {
      if (!c.state) c.state = {};
      c.state.energized = false;
      c.state.running = false;
      c.state.current = 0;
      c.state.voltage = 0;
      c.state.powerKW = 0;
      c.state.rpm = 0;
      c.state.thermal = false;
      c.state.flagColor = 'green';
      c.state.leverPos = 'down';
      c.state.temp = Math.max(AMBIENT_TEMPERATURE, (c.state.temp || AMBIENT_TEMPERATURE) - dt * 5.0);
    });

    return result;
  }

  // 1. CONSTRUÇÃO DO GRAFO NODAL DE ADJACÊNCIA
  const graph = new Map<string, InternalEdge[]>();

  const addGraphEdge = (u: string, v: string, r: number, wireId?: string, attenuation = 1.0) => {
    if (!graph.has(u)) graph.set(u, []);
    if (!graph.has(v)) graph.set(v, []);
    graph.get(u)!.push({ target: v, r, wireId, attenuation });
    graph.get(v)!.push({ target: u, r, wireId, attenuation });
  };

  // A. Arestas de Condutores com Resistência Real R = ρ * L / S (inclui Cobre Nu / NU)
  wires.forEach(w => {
    if (w.fault || w.burned) return;
    const u = `${w.a.c}:${w.a.t}`;
    const v = `${w.b.c}:${w.b.t}`;
    const gauge = Number(w.gauge || 2.5);
    const length = Number(w.length || 2.0);
    const r = (COPPER_RESISTIVITY * length) / gauge;
    addGraphEdge(u, v, r, w.id);
  });

  // B. Arestas Internas dos Barramentos (Pentes condutores de baixa impedância)
  busbars.forEach(bb => {
    if (bb.type === 'din' || !bb.terminals) return;
    const spine = `${bb.id}:SPINE`;
    bb.terminals.forEach(t => {
      addGraphEdge(`${bb.id}:${t.id}`, spine, 0.0005);
    });
  });

  // ==========================================================================
  // RESOLUÇÃO DE CADEIA SOLAR DC (SÉRIE E PARALELO REAL TOTALMENTE PARAMÉTRICA)
  // ==========================================================================
  const pvPanels = comps.filter(c => c.code === 'PV_PANEL');
  pvPanels.forEach(pv => {
    pv.state = pv.state || {};
    const irr = Number(pv.params?.irradiance ?? 1000);
    const pMaxNom = Number(pv.params?.pMax ?? 550);
    const vmppNom = Number(pv.params?.vmpp ?? 41.8);
    const vocNom = Number(pv.params?.voc ?? (vmppNom * 1.19));
    const imppNom = Number(pv.params?.impp ?? (pMaxNom / Math.max(1, vmppNom)));

    const effRatio = Math.max(0, Math.min(1.2, irr / 1000));
    const vGenerated = effRatio > 0.05
      ? Number((vmppNom * (0.95 + 0.05 * Math.log(effRatio + 0.1))).toFixed(1))
      : 0;
    const iGenerated = Number((imppNom * effRatio).toFixed(2));
    const pKwGenerated = Number(((vGenerated * iGenerated) / 1000).toFixed(3));

    pv.state.voltage = vGenerated;
    pv.state.current = iGenerated;
    pv.state.powerKW = pKwGenerated;
    pv.state.energized = vGenerated > 5;
  });

  // 2. CONVERGÊNCIA ITERATIVA ELETROMECÂNICA
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
      const isBurned = Boolean(c.state.isBurned || c.state.damaged);
      const isTripped = Boolean(c.state.tripped);

      // Disjuntores Termomagnéticos e Caixa Moldada (Se desligado, isola completamente a saída)
      if (['breaker', 'breaker_1p', 'breaker2', 'breaker3', 'mccb', 'motor_breaker', 'rcbo'].includes(d.kind)) {
        const isClosed = c.state.closed !== false && !isTripped && !isBurned;
        c.state.flagColor = isTripped ? 'yellow' : isClosed ? 'red' : 'green';
        c.state.leverPos = isTripped ? 'trip' : isClosed ? 'up' : 'down';

        if (isClosed) {
          addGraphEdge(`${c.id}:1`, `${c.id}:2`, 0.002);
          if (['MCB2', 'MCB3', 'MCCB', 'MPCB'].includes(c.code)) {
            addGraphEdge(`${c.id}:3`, `${c.id}:4`, 0.002);
          }
          if (['MCB3', 'MCCB', 'MPCB'].includes(c.code)) {
            addGraphEdge(`${c.id}:5`, `${c.id}:6`, 0.002);
          }
          if (c.code !== 'MPCB' && c.code !== 'MCB_1P' && c.code !== 'MCB2') {
            addGraphEdge(`${c.id}:N_IN`, `${c.id}:N_OUT`, 0.001);
          }
        }
      }

      // Fusíveis
      if (['fuse', 'fuse3'].includes(d.kind)) {
        if (!c.state.burned && c.state.closed !== false) {
          addGraphEdge(`${c.id}:1`, `${c.id}:2`, 0.003);
          if (c.code === 'FU3') {
            addGraphEdge(`${c.id}:3`, `${c.id}:4`, 0.003);
            addGraphEdge(`${c.id}:5`, `${c.id}:6`, 0.003);
          }
        }
      }

      // Dispositivos DR (IDR 2P e IDR 4P)
      if (['rcd', 'rcd4'].includes(d.kind)) {
        c.state.flagColor = isTripped ? 'yellow' : c.state.closed !== false ? 'red' : 'green';
        c.state.leverPos = isTripped ? 'trip' : c.state.closed !== false ? 'up' : 'down';

        if (c.state.closed !== false && !isTripped) {
          addGraphEdge(`${c.id}:1`, `${c.id}:2`, 0.002);
          addGraphEdge(`${c.id}:N_IN`, `${c.id}:N_OUT`, 0.001);
          if (c.code === 'RCD4') {
            addGraphEdge(`${c.id}:3`, `${c.id}:4`, 0.002);
            addGraphEdge(`${c.id}:5`, `${c.id}:6`, 0.002);
          }
        }
      }

      // DPS (Protetores contra Surtos Atmosféricos - Monofásico SPD e Tetrapolar SPD3)
      if (c.code === 'SPD' || c.code === 'SPD3') {
        const isCartridgeOk = c.params?.health === undefined || c.params.health > 0;
        c.state.status = isCartridgeOk ? 'green' : 'red';
        // Sob regime normal, apresenta impedância elevada ao condutor de proteção PE (fuga residual < 1mA)
        // Sob surto transitório desvia a energia ao aterramento
        if (c.code === 'SPD') {
          addGraphEdge(`${c.id}:L`, `${c.id}:PE`, 50000.0);
          addGraphEdge(`${c.id}:N`, `${c.id}:PE`, 50000.0);
        } else if (c.code === 'SPD3') {
          addGraphEdge(`${c.id}:L1`, `${c.id}:PE`, 50000.0);
          addGraphEdge(`${c.id}:L2`, `${c.id}:PE`, 50000.0);
          addGraphEdge(`${c.id}:L3`, `${c.id}:PE`, 50000.0);
          addGraphEdge(`${c.id}:N`, `${c.id}:PE`, 50000.0);
        }
      }

      // Contator de Potência (KM)
      if (d.kind === 'contactor') {
        if (c.state.energized) {
          addGraphEdge(`${c.id}:1`, `${c.id}:2`, 0.002);
          addGraphEdge(`${c.id}:3`, `${c.id}:4`, 0.002);
          addGraphEdge(`${c.id}:5`, `${c.id}:6`, 0.002);
          addGraphEdge(`${c.id}:13`, `${c.id}:14`, 0.002);
        } else {
          addGraphEdge(`${c.id}:21`, `${c.id}:22`, 0.002);
        }
      }

      // Bloco Auxiliar Frontal 2NA + 2NF
      if (c.code === 'AUX_BLOCK_2NA2NF') {
        const kmParent = comps.find(k => k.code === 'CONTACTOR');
        const kmOn = Boolean(kmParent?.state?.energized);
        if (kmOn) {
          addGraphEdge(`${c.id}:53`, `${c.id}:54`, 0.002);
          addGraphEdge(`${c.id}:83`, `${c.id}:84`, 0.002);
        } else {
          addGraphEdge(`${c.id}:61`, `${c.id}:62`, 0.002);
          addGraphEdge(`${c.id}:71`, `${c.id}:72`, 0.002);
        }
      }

      // Relé Térmico (OLR)
      if (d.kind === 'overload') {
        addGraphEdge(`${c.id}:1`, `${c.id}:2`, 0.005);
        addGraphEdge(`${c.id}:3`, `${c.id}:4`, 0.005);
        addGraphEdge(`${c.id}:5`, `${c.id}:6`, 0.005);
        if (!isTripped) {
          addGraphEdge(`${c.id}:95`, `${c.id}:96`, 0.002);
        } else {
          addGraphEdge(`${c.id}:97`, `${c.id}:98`, 0.002);
        }
      }

      // Chave de Transferência Manual (MTS I-0-II)
      // 1: REDE (I), 0: ISOLADO/DESLIGADO (0), 2: GERADOR (II)
      if (c.code === 'MTS_SWITCH') {
        const pos = Number(c.params?.position ?? 1);
        if (pos === 1) {
          addGraphEdge(`${c.id}:R_L1`, `${c.id}:OUT_L1`, 0.002);
          addGraphEdge(`${c.id}:R_L2`, `${c.id}:OUT_L2`, 0.002);
          addGraphEdge(`${c.id}:R_L3`, `${c.id}:OUT_L3`, 0.002);
          addGraphEdge(`${c.id}:R_N`, `${c.id}:OUT_N`, 0.002);
        } else if (pos === 2) {
          addGraphEdge(`${c.id}:G_L1`, `${c.id}:OUT_L1`, 0.002);
          addGraphEdge(`${c.id}:G_L2`, `${c.id}:OUT_L2`, 0.002);
          addGraphEdge(`${c.id}:G_L3`, `${c.id}:OUT_L3`, 0.002);
          addGraphEdge(`${c.id}:G_N`, `${c.id}:OUT_N`, 0.002);
        }
        // Na posição 0, absolutamente nenhum contato fecha (corte total de segurança)
      }

      // Quadro de Transferência Automática (ATS Rede / Gerador)
      if (c.code === 'ATS_SWITCH') {
        const gridHealthy = c.params?.gridHealthy !== false;
        if (gridHealthy) {
          c.params.sourceInUse = 'GRID';
          addGraphEdge(`${c.id}:N_L1`, `${c.id}:LOAD_L1`, 0.002);
          addGraphEdge(`${c.id}:N_L2`, `${c.id}:LOAD_L2`, 0.002);
          addGraphEdge(`${c.id}:N_L3`, `${c.id}:LOAD_L3`, 0.002);
          addGraphEdge(`${c.id}:N_N`, `${c.id}:LOAD_N`, 0.002);
        } else {
          c.params.sourceInUse = 'GEN';
          // Quando a rede falha, o ATS aciona o contato seco GEN_START para dar partida no GMG
          addGraphEdge(`${c.id}:G_L1`, `${c.id}:LOAD_L1`, 0.002);
          addGraphEdge(`${c.id}:G_L2`, `${c.id}:LOAD_L2`, 0.002);
          addGraphEdge(`${c.id}:G_L3`, `${c.id}:LOAD_L3`, 0.002);
          addGraphEdge(`${c.id}:G_N`, `${c.id}:LOAD_N`, 0.002);
        }
      }

      // Smart Meter passagem interna
      if (c.code === 'SMART_METER') {
        addGraphEdge(`${c.id}:L_IN`, `${c.id}:L_OUT`, 0.001);
        addGraphEdge(`${c.id}:N_IN`, `${c.id}:N_OUT`, 0.001);
      }

      // Interruptores
      if (c.code === 'SW') {
        if (c.state.closed) addGraphEdge(`${c.id}:L`, `${c.id}:R`, 0.002);
      } else if (c.code === 'SW2') {
        if (c.state.closed) {
          addGraphEdge(`${c.id}:L1`, `${c.id}:L1'`, 0.002);
          addGraphEdge(`${c.id}:L2`, `${c.id}:L2'`, 0.002);
        }
      } else if (c.code === 'SW_DOUBLE') {
        if (c.state.closed1) addGraphEdge(`${c.id}:L`, `${c.id}:R1`, 0.002);
        if (c.state.closed2) addGraphEdge(`${c.id}:L`, `${c.id}:R2`, 0.002);
      } else if (c.code === 'THREE_WAY') {
        const pos = Number(c.params?.position ?? (c.state?.closed ? 1 : 0));
        addGraphEdge(`${c.id}:C`, pos === 0 ? `${c.id}:R1` : `${c.id}:R2`, 0.002);
      } else if (c.code === 'FOUR_WAY') {
        const crossed = Boolean(c.params?.crossed ?? c.state?.closed);
        if (!crossed) {
          addGraphEdge(`${c.id}:IN1`, `${c.id}:OUT1`, 0.002);
          addGraphEdge(`${c.id}:IN2`, `${c.id}:OUT2`, 0.002);
        } else {
          addGraphEdge(`${c.id}:IN1`, `${c.id}:OUT2`, 0.002);
          addGraphEdge(`${c.id}:IN2`, `${c.id}:OUT1`, 0.002);
        }
      } else if (c.code === 'SEL') {
        const pos = Number(c.params?.position ?? c.state?.position ?? 0);
        if (pos === 1) addGraphEdge(`${c.id}:C`, `${c.id}:MAN`, 0.002);
        else if (pos === 2) addGraphEdge(`${c.id}:C`, `${c.id}:AUTO`, 0.002);
      } else if (c.code === 'FLOAT') {
        const isHigh = Boolean(c.state?.high || c.state?.closed);
        if (isHigh) addGraphEdge(`${c.id}:COM`, `${c.id}:NA`, 0.002);
        else addGraphEdge(`${c.id}:COM`, `${c.id}:NF`, 0.002);
      } else if (c.code === 'PHOTOCELL') {
        const isDark = (c.params?.ambientLux ?? 100) <= (c.params?.thresholdLux ?? 20);
        if (isDark) addGraphEdge(`${c.id}:F`, `${c.id}:R`, 0.002);
      } else if (c.code === 'DIMMER') {
        const pct = Math.max(0, Math.min(100, Number(c.params?.percent ?? 100)));
        if (pct > 0) addGraphEdge(`${c.id}:IN`, `${c.id}:OUT`, 0.01, undefined, pct / 100.0);
      } else if (c.code === 'LIMIT') {
        if (!c.state?.actuated && c.state?.closed !== false) addGraphEdge(`${c.id}:1`, `${c.id}:2`, 0.002);
      } else if (c.code === 'ESTOP') {
        if (!c.state?.pressed && !c.state?.tripped && c.state?.closed !== false) addGraphEdge(`${c.id}:1`, `${c.id}:2`, 0.002);
      } else if (c.code === 'PBNO') {
        if (c.state.pressed || c.state.closed) addGraphEdge(`${c.id}:3`, `${c.id}:4`, 0.002);
      } else if (c.code === 'PBNC') {
        if (!c.state.pressed && c.state.closed !== false) addGraphEdge(`${c.id}:1`, `${c.id}:2`, 0.002);
      } else if (c.code === 'JUNCTION_BOX') {
        addGraphEdge(`${c.id}:L_IN`, `${c.id}:L1`, 0.0005);
        addGraphEdge(`${c.id}:L_IN`, `${c.id}:L2`, 0.0005);
        addGraphEdge(`${c.id}:N_IN`, `${c.id}:N1`, 0.0005);
        addGraphEdge(`${c.id}:N_IN`, `${c.id}:N2`, 0.0005);
        addGraphEdge(`${c.id}:PE_IN`, `${c.id}:PE1`, 0.0005);
      } else if (c.code === 'EARTH_PIT') {
        addGraphEdge(`${c.id}:BEP1`, `${c.id}:GND`, 0.0005);
        addGraphEdge(`${c.id}:BEP2`, `${c.id}:GND`, 0.0005);
        addGraphEdge(`${c.id}:BEP3`, `${c.id}:GND`, 0.0005);
      }
    });

    // Fontes de Tensão Primárias Reais (Valores lidos dinamicamente de c.params)
    sourcePoles = [];
    comps.forEach(c => {
      const isSrc = c.code.startsWith('SRC_') || c.code === 'BAT' || c.code === 'GEN_DIESEL' || c.code === 'BAT_LIFEPO4' || c.code === 'PV_PANEL';
      const isClosed = c.params?.closed !== false && c.state?.closed !== false && !c.state?.tripped && !c.state?.isBurned;
      if (!isSrc || !isClosed) return;

      const vNom = Number(c.params?.voltage || (c.code === 'GEN_DIESEL' ? 400 : c.code === 'BAT_LIFEPO4' ? (c.params?.voltage ?? 51.2) : c.code === 'PV_PANEL' ? (c.state?.voltage || 41.8) : 230));
      result.activeFrequency = Number(c.params?.frequency || 50);

      if (c.code === 'SRC_AC3') {
        sourcePoles.push({ id: `${c.id}:L1`, net: 'L1', v: vNom / Math.sqrt(3), angle: 0, sourceId: c.id });
        sourcePoles.push({ id: `${c.id}:L2`, net: 'L2', v: vNom / Math.sqrt(3), angle: -120, sourceId: c.id });
        sourcePoles.push({ id: `${c.id}:L3`, net: 'L3', v: vNom / Math.sqrt(3), angle: 120, sourceId: c.id });
        sourcePoles.push({ id: `${c.id}:N`, net: 'N', v: 0, angle: 0, sourceId: c.id });
        sourcePoles.push({ id: `${c.id}:PE`, net: 'PE', v: 0, angle: 0, sourceId: c.id });
        result.mainVoltageRMS = vNom;
      } else if (c.code === 'GEN_DIESEL') {
        // Gerador diesel trifásico gera tensão quando ativado manualmente ou por partida remota
        const isGenRunning = Boolean(c.state?.running || c.params?.running);
        if (isGenRunning) {
          sourcePoles.push({ id: `${c.id}:L1`, net: 'L1', v: vNom / Math.sqrt(3), angle: 0, sourceId: c.id });
          sourcePoles.push({ id: `${c.id}:L2`, net: 'L2', v: vNom / Math.sqrt(3), angle: -120, sourceId: c.id });
          sourcePoles.push({ id: `${c.id}:L3`, net: 'L3', v: vNom / Math.sqrt(3), angle: 120, sourceId: c.id });
          sourcePoles.push({ id: `${c.id}:N`, net: 'N', v: 0, angle: 0, sourceId: c.id });
          sourcePoles.push({ id: `${c.id}:PE`, net: 'PE', v: 0, angle: 0, sourceId: c.id });

          c.state.voltage = vNom;
          c.state.rpm = 1500;
          c.state.frequency = 50;
          c.state.energized = true;

          if (result.mainVoltageRMS === 0) {
            result.mainVoltageRMS = vNom;
          }
          if (result.activeFrequency === 0) {
            result.activeFrequency = 50;
          }
        } else {
          c.state.voltage = 0;
          c.state.rpm = 0;
          c.state.energized = false;
        }
      } else if (c.code === 'SRC_AC1') {
        sourcePoles.push({ id: `${c.id}:L`, net: 'L1', v: vNom, angle: 0, sourceId: c.id });
        sourcePoles.push({ id: `${c.id}:N`, net: 'N', v: 0, angle: 0, sourceId: c.id });
        result.mainVoltageRMS = vNom;
      } else if (c.code === 'SRC_DC24' || c.code === 'BAT' || c.code === 'BAT_LIFEPO4') {
        sourcePoles.push({ id: `${c.id}:+`, net: '24+', v: vNom, angle: 0, sourceId: c.id });
        sourcePoles.push({ id: `${c.id}:-`, net: '24-', v: 0, angle: 0, sourceId: c.id });
      } else if (c.code === 'PV_PANEL') {
        if ((c.state?.voltage || 0) > 2) {
          sourcePoles.push({ id: `${c.id}:+`, net: '24+', v: Number(c.state.voltage), angle: 0, sourceId: c.id });
          sourcePoles.push({ id: `${c.id}:-`, net: '24-', v: 0, angle: 0, sourceId: c.id });
        }
      }
    });

    // Fontes de Aterramento Real
    comps.forEach(c => {
      if (c.code === 'EARTH_ROD') {
        sourcePoles.push({ id: `${c.id}:PE`, net: 'PE', v: 0, angle: 0, sourceId: c.id });
      } else if (c.code === 'EARTH_PIT') {
        sourcePoles.push({ id: `${c.id}:GND`, net: 'PE', v: 0, angle: 0, sourceId: c.id });
      }
    });

    // BFS Nodal com Rastreamento de Caminho Físico
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

    // Lógica de Partida Remota do Gerador (ATS -> GMG REMOTE_START)
    comps.forEach(gmg => {
      if (gmg.code === 'GEN_DIESEL') {
        const remoteNode = `${gmg.id}:REMOTE_START`;
        let remoteSignalActive = false;

        sourcePoles.forEach(sp => {
          const map = reachMap.get(sp.id);
          if (map && map.has(remoteNode)) {
            remoteSignalActive = true;
          }
        });

        // Se o ATS comutou para modo de emergência ou enviou sinal para REMOTE_START, inicia o GMG
        const atsActiveEmergency = comps.some(ats => ats.code === 'ATS_SWITCH' && ats.params?.sourceInUse === 'GEN');
        const shouldRun = Boolean(gmg.params?.running || remoteSignalActive || atsActiveEmergency);

        if (gmg.state?.running !== shouldRun) {
          gmg.state.running = shouldRun;
          gmg.params.running = shouldRun;
          stateChanged = true;
        }
      }
    });

    // Inversores Solares
    comps.forEach(inv => {
      inv.state = inv.state || {};

      if (inv.code === 'PV_INVERTER_OFFGRID') {
        const nBatP = `${inv.id}:BAT+`;
        const nPvP = `${inv.id}:PV+`;
        let batConnected = false;
        let vBat = 0;
        let pvConnected = false;
        let vPv = 0;

        sourcePoles.forEach(sp => {
          const m = reachMap.get(sp.id);
          if (!m) return;
          if (m.has(nBatP) && sp.net === '24+') { batConnected = true; vBat = sp.v; }
          if (m.has(nPvP) && sp.net === '24+') { pvConnected = true; vPv += sp.v; }
        });

        const isPowered = (batConnected && vBat >= 40) || (pvConnected && vPv >= 50);
        if (isPowered !== inv.state.running) {
          inv.state.running = isPowered;
          inv.state.energized = isPowered;
          stateChanged = true;
        }

        inv.state.batVoltage = vBat > 0 ? Number(vBat.toFixed(1)) : 0;
        inv.state.pvVoltage = vPv > 0 ? Number(vPv.toFixed(1)) : 0;

        if (isPowered) {
          const acOutV = Number(inv.params?.acOutVoltage || 230);
          inv.state.voltage = acOutV;
          sourcePoles.push({ id: `${inv.id}:AC_L`, net: 'L1', v: acOutV, angle: 0, sourceId: inv.id });
          sourcePoles.push({ id: `${inv.id}:AC_N`, net: 'N', v: 0, angle: 0, sourceId: inv.id });
          addGraphEdge(`${inv.id}:AC_L`, `${inv.id}:AC_N_VIRT`, 0.001);
        }
      } else if (inv.code === 'PV_INVERTER_ONGRID') {
        const nDc1P = `${inv.id}:DC1+`;
        const nGridL1 = `${inv.id}:AC_L1`;
        let vString = 0;
        let gridPresent = false;

        sourcePoles.forEach(sp => {
          const m = reachMap.get(sp.id);
          if (!m) return;
          if (m.has(nDc1P) && sp.net === '24+') vString += sp.v;
          if (m.has(nGridL1) && sp.net === 'L1') gridPresent = true;
        });

        const mpptMin = Number(inv.params?.mpptMinV || 160);
        const mpptMax = Number(inv.params?.mpptMaxV || 850);
        const inMpptWindow = vString >= mpptMin && vString <= mpptMax;
        const isSync = inMpptWindow && gridPresent;
        inv.state.running = isSync;
        inv.state.energized = isSync;
        inv.state.pvVoltage = Number(vString.toFixed(1));
        if (inv.params) inv.params.syncActive = isSync;

        if (isSync) {
          const pInvNom = Number(inv.params?.powerKW || 10);
          inv.state.powerKW = Number(Math.min(pInvNom, (vString * 12) / 1000).toFixed(2));
          inv.state.voltage = 400.0;
        } else {
          inv.state.powerKW = 0;
        }
      } else if (inv.code === 'PV_INVERTER_HYBRID') {
        const nBatP = `${inv.id}:BAT+`;
        const nPvP = `${inv.id}:PV1+`;
        let hasDC = false;
        let vDC = 0;

        sourcePoles.forEach(sp => {
          const m = reachMap.get(sp.id);
          if (!m) return;
          if ((m.has(nBatP) || m.has(nPvP)) && sp.net === '24+') { hasDC = true; vDC = Math.max(vDC, sp.v); }
        });

        const isRunning = hasDC && vDC >= 40;
        inv.state.running = isRunning;
        inv.state.energized = isRunning;
        inv.state.pvVoltage = Number(vDC.toFixed(1));

        if (isRunning) {
          inv.state.voltage = 230.0;
          sourcePoles.push({ id: `${inv.id}:EPS_L`, net: 'L1', v: 230, angle: 0, sourceId: inv.id });
          sourcePoles.push({ id: `${inv.id}:EPS_N`, net: 'N', v: 0, angle: 0, sourceId: inv.id });
        }
      }
    });

    // Bobinas (KM, KA, Timers)
    comps.forEach(c => {
      if (['CONTACTOR', 'RELAY', 'TIMER', 'TIMER_STAR_DELTA', 'TIMER_TOF'].includes(c.code)) {
        const nodeA1 = `${c.id}:A1`;
        const nodeA2 = `${c.id}:A2`;

        let phasePoleFound: SourcePole | null = null;
        let neutralPoleFound: SourcePole | null = null;

        sourcePoles.forEach(sp => {
          const map = reachMap.get(sp.id);
          if (!map) return;
          if ((sp.net.startsWith('L') || sp.net === '24+') && map.has(nodeA1)) phasePoleFound = sp;
          if ((sp.net === 'N' || sp.net === '24-') && map.has(nodeA2)) neutralPoleFound = sp;
        });

        const coilPowered = Boolean(phasePoleFound && neutralPoleFound && !result.hasDirectShort);
        if (c.state.energized !== coilPowered) {
          c.state.energized = coilPowered;
          stateChanged = true;
        }
      }
    });
  }

  // 3. CURTO-CIRCUITO DIRETO FASE-NEUTRO
  sourcePoles.forEach(spPhase => {
    if (!spPhase.net.startsWith('L') && spPhase.net !== '24+') return;
    const phaseMap = reachMap.get(spPhase.id);
    if (!phaseMap) return;

    sourcePoles.forEach(spNeutral => {
      if (spNeutral.net !== 'N' && spNeutral.net !== '24-') return;
      const reachToNeutral = phaseMap.get(spNeutral.id);
      if (reachToNeutral && reachToNeutral.rPath < 0.2) {
        result.hasDirectShort = true;
        result.shortCause = 'Curto-Circuito Direto Fase-Neutro';
      }
    });
  });

  if (result.hasDirectShort) {
    comps.forEach(c => {
      if (['MCB1', 'MCB_1P', 'MCB2', 'MCB3', 'MCCB', 'MPCB', 'RCBO', 'FUSE', 'FU3'].includes(c.code)) {
        if (c.state && !c.state.tripped && !c.state.burned) {
          c.state.tripped = true;
          c.state.closed = false;
          c.state.temp = 120.0;
          result.trippedIds.push(c.id);
        }
      }
    });
  }

  // 4. IDENTIFICAR QUAIS BARRAMENTOS ESTÃO EFETIVAMENTE ENERGIZADOS
  const energizedBusbarsSet = new Set<string>();
  busbars.forEach(bb => {
    if (bb.type === 'din') return;
    const spineNode = `${bb.id}:SPINE`;

    sourcePoles.forEach(sp => {
      const map = reachMap.get(sp.id);
      if (!map) return;
      if (map.has(spineNode)) {
        if (bb.type.startsWith('phase') && sp.net.startsWith('L')) {
          energizedBusbarsSet.add(bb.id);
          energizedBusbarsSet.add(bb.type);
        } else if (bb.type === 'neutral' && sp.net === 'N') {
          energizedBusbarsSet.add(bb.id);
          energizedBusbarsSet.add(bb.type);
        } else if (bb.type === 'earth' && (sp.net === 'PE' || sp.net === 'GND')) {
          energizedBusbarsSet.add(bb.id);
          energizedBusbarsSet.add(bb.type);
        }
      }
    });
  });
  result.energizedBusbarIds = Array.from(energizedBusbarsSet);

  // 5. RESOLUÇÃO REAL DAS CARGAS & PROPAGAÇÃO DE CORRENTE POR TODA A CADEIA
  const wireCurrentMap = new Map<string, number>();

  const addPathCurrent = (pathEdges: InternalEdge[], currentVal: number) => {
    pathEdges.forEach(edge => {
      if (edge.wireId) {
        const cur = wireCurrentMap.get(edge.wireId) || 0;
        wireCurrentMap.set(edge.wireId, cur + currentVal);
      }
    });
  };

  comps.forEach(load => {
    load.state = load.state || {};
    const d = getComponentDef(load.code);
    const isMotor = ['motor3', 'motor1', 'motor3_6lead', 'fan', 'pump'].includes(d.kind) || load.code === 'PUMP';
    const isAppliance = ['HEATER', 'LAMP', 'PILOT_GREEN', 'PILOT_RED', 'PILOT_YELLOW', 'BUZZ', 'LOAD_AC', 'LOAD_COOKTOP'].includes(load.code);

    if (!isMotor && !isAppliance) return;

    // MOTOR TRIFÁSICO DE 6 PONTAS (Y-Δ)
    if (load.code === 'M3PH_6L') {
      const nU1 = `${load.id}:U1`;
      const nV1 = `${load.id}:V1`;
      const nW1 = `${load.id}:W1`;
      const nU2 = `${load.id}:U2`;
      const nV2 = `${load.id}:V2`;
      const nW2 = `${load.id}:W2`;

      let hasL1 = false, hasL2 = false, hasL3 = false;
      let pathL1: InternalEdge[] = [], pathL2: InternalEdge[] = [], pathL3: InternalEdge[] = [];

      sourcePoles.forEach(sp => {
        const m = reachMap.get(sp.id);
        if (!m) return;
        if (sp.net === 'L1' && m.has(nU1)) { hasL1 = true; pathL1 = m.get(nU1)!.pathEdges; }
        if (sp.net === 'L2' && m.has(nV1)) { hasL2 = true; pathL2 = m.get(nV1)!.pathEdges; }
        if (sp.net === 'L3' && m.has(nW1)) { hasL3 = true; pathL3 = m.get(nW1)!.pathEdges; }
      });

      const starShorted = graph.get(nU2)?.some(e => e.target === nV2 || e.target === nW2);
      const isStar = hasL1 && hasL2 && hasL3 && Boolean(starShorted);
      const isDelta = hasL1 && hasL2 && hasL3 && !starShorted;

      if (isStar || isDelta) {
        const pNom = Number(load.params?.power || 11000);
        const vNom = isDelta ? 400 : (400 / Math.sqrt(3));
        const pf = Number(load.params?.pf || 0.88);
        const iReal = pNom / (Math.sqrt(3) * (isDelta ? 400 : 230) * pf);

        load.state.running = true;
        load.state.energized = true;
        load.state.voltage = Math.round(vNom);
        load.state.current = Number(iReal.toFixed(2));
        load.state.powerKW = Number((pNom / 1000).toFixed(2));
        load.state.rpm = isDelta ? 2940 : 2850;
        load.params.connection = isDelta ? 'DELTA (Δ)' : 'STAR (Y)';

        result.totalActivePower += pNom;
        result.totalLineCurrent += iReal;

        addPathCurrent(pathL1, iReal);
        addPathCurrent(pathL2, iReal);
        addPathCurrent(pathL3, iReal);
      } else {
        load.state.running = false;
        load.state.energized = false;
        load.state.voltage = 0;
        load.state.current = 0;
        load.state.rpm = 0;
        load.params.connection = 'none';
      }
      return;
    }

    // MOTOR TRIFÁSICO PADRÃO / ELETROBOMBA CENTRÍFUGA (PUMP)
    if (d.kind === 'motor3' || load.code === 'PUMP') {
      const nodeU = `${load.id}:U`;
      const nodeV = `${load.id}:V`;
      const nodeW = `${load.id}:W`;

      let hasL1 = false, hasL2 = false, hasL3 = false;
      let totalRPath = 0;
      let pathL1: InternalEdge[] = [], pathL2: InternalEdge[] = [], pathL3: InternalEdge[] = [];

      sourcePoles.forEach(sp => {
        const m = reachMap.get(sp.id);
        if (!m) return;
        if (sp.net === 'L1' && m.has(nodeU)) { hasL1 = true; totalRPath += m.get(nodeU)!.rPath; pathL1 = m.get(nodeU)!.pathEdges; }
        if (sp.net === 'L2' && m.has(nodeV)) { hasL2 = true; totalRPath += m.get(nodeV)!.rPath; pathL2 = m.get(nodeV)!.pathEdges; }
        if (sp.net === 'L3' && m.has(nodeW)) { hasL3 = true; totalRPath += m.get(nodeW)!.rPath; pathL3 = m.get(nodeW)!.pathEdges; }
      });

      const is3PhaseClosed = hasL1 && hasL2 && hasL3 && !result.hasDirectShort && !load.state.isBurned;

      if (is3PhaseClosed) {
        const pNom = Number(load.params?.power || (load.code === 'PUMP' ? 3000 : 7500));
        const vNom = 400;
        const pf = Number(load.params?.pf || 0.85);

        const iEstimated = pNom / (Math.sqrt(3) * vNom * pf);
        const deltaV = Math.sqrt(3) * (totalRPath / 3) * iEstimated;
        const vReal = Math.max(0, vNom - deltaV);
        const pReal = pNom * Math.pow(vReal / vNom, 2);
        const iReal = pReal / (Math.sqrt(3) * vReal * pf);

        load.state.running = true;
        load.state.energized = true;
        load.state.voltage = Math.round(vReal);
        load.state.current = Number(iReal.toFixed(2));
        load.state.powerKW = Number((pReal / 1000).toFixed(2));
        load.state.rpm = Math.round(Number(load.params?.rpm || (load.code === 'PUMP' ? 2880 : 2920)) * (vReal / vNom));

        result.totalActivePower += pReal;
        result.totalLineCurrent += iReal;

        addPathCurrent(pathL1, iReal);
        addPathCurrent(pathL2, iReal);
        addPathCurrent(pathL3, iReal);
      } else {
        load.state.running = false;
        load.state.energized = false;
        load.state.voltage = 0;
        load.state.current = 0;
        load.state.rpm = 0;
      }
      return;
    }

    // CARGAS MONOFÁSICAS, EXAUSTORES, LÂMPADAS E SINALIZADORES
    const tL = ['L', '1', '+', 'L_IN'].find(t => load.terminals?.some((x: any) => x[0] === t)) || 'L';
    const tN = ['N', '2', '-', 'N_IN'].find(t => load.terminals?.some((x: any) => x[0] === t)) || 'N';

    const nodeL = `${load.id}:${tL}`;
    const nodeN = `${load.id}:${tN}`;

    let phasePole: SourcePole | null = null;
    let neutralPole: SourcePole | null = null;
    let rPhase = 0, rNeutral = 0;
    let vAttenuation = 1.0;
    let pathL: InternalEdge[] = [];
    let pathN: InternalEdge[] = [];

    sourcePoles.forEach(sp => {
      const m = reachMap.get(sp.id);
      if (!m) return;
      if ((sp.net.startsWith('L') || sp.net === '24+') && m.has(nodeL)) {
        phasePole = sp;
        const entry = m.get(nodeL)!;
        rPhase = entry.rPath;
        vAttenuation = entry.vFactor;
        pathL = entry.pathEdges;
      }
      if ((sp.net === 'N' || sp.net === '24-') && m.has(nodeN)) {
        neutralPole = sp;
        const entry = m.get(nodeN)!;
        rNeutral = entry.rPath;
        pathN = entry.pathEdges;
      }
    });

    const isLoopClosed = Boolean(phasePole && neutralPole && !result.hasDirectShort && !load.state.isBurned && vAttenuation > 0.02);

    if (isLoopClosed) {
      const pNom = Number(load.params?.power || 100);
      const vNom = Number(load.params?.voltage || 230);
      const pf = Number(load.params?.pf || 1.0);

      const vAvailable = vNom * vAttenuation;
      const iEst = (pNom / (vNom * pf)) * vAttenuation;
      const deltaV = (rPhase + rNeutral) * iEst;
      const vEffective = Math.max(0, vAvailable - deltaV);
      const pReal = pNom * Math.pow(vEffective / vNom, 2);
      const iReal = pReal / (Math.max(1, vEffective) * pf);

      load.state.energized = true;
      load.state.running = true;
      load.state.voltage = Number(vEffective.toFixed(1));
      load.state.current = Number(iReal.toFixed(2));
      load.state.powerKW = Number((pReal / 1000).toFixed(2));
      if (d.kind === 'fan' || d.kind === 'motor1') {
        load.state.rpm = Math.round(Number(load.params?.rpm || 1400) * (vEffective / vNom));
      }

      result.totalActivePower += pReal;
      result.totalLineCurrent += iReal;

      addPathCurrent(pathL, iReal);
      addPathCurrent(pathN, iReal);
    } else {
      load.state.energized = false;
      load.state.running = false;
      load.state.voltage = 0;
      load.state.current = 0;
      load.state.powerKW = 0;
      load.state.rpm = 0;
    }
  });

  // Bobinas de Contatores e Relés
  comps.forEach(c => {
    if (['CONTACTOR', 'RELAY', 'TIMER', 'TIMER_STAR_DELTA', 'TIMER_TOF'].includes(c.code) && c.state.energized) {
      const nodeA1 = `${c.id}:A1`;
      const nodeA2 = `${c.id}:A2`;
      sourcePoles.forEach(sp => {
        const m = reachMap.get(sp.id);
        if (!m) return;
        if (m.has(nodeA1)) addPathCurrent(m.get(nodeA1)!.pathEdges, 0.08);
        if (m.has(nodeA2)) addPathCurrent(m.get(nodeA2)!.pathEdges, 0.08);
      });
    }
  });

  // 6. ATUALIZAÇÃO FINAL DOS CONDUTORES: TENSÃO PRESENTE (LIVE) E FLUXO REAL DE CORRENTE
  wires.forEach(w => {
    const nodeA = `${w.a.c}:${w.a.t}`;
    const nodeB = `${w.b.c}:${w.b.t}`;

    let isConnectedToLivePotential = false;

    sourcePoles.forEach(sp => {
      const map = reachMap.get(sp.id);
      if (!map) return;
      if (map.has(nodeA) || map.has(nodeB)) {
        isConnectedToLivePotential = true;
      }
    });

    const currentCarried = wireCurrentMap.get(w.id) || 0;
    w.current = Number(currentCarried.toFixed(2));
    w.live = isConnectedToLivePotential;

    if (currentCarried > 0) {
      const gauge = Number(w.gauge || 2.5);
      const capacity = GAUGE_AMPACITY[gauge] || 21.0;

      if (currentCarried > capacity * 1.05) {
        w.overheated = true;
        w.temp = (w.temp || AMBIENT_TEMPERATURE) + (currentCarried * 0.15 * dt);
      } else {
        w.overheated = false;
        w.temp = Math.max(AMBIENT_TEMPERATURE, (w.temp || AMBIENT_TEMPERATURE) - dt * 2.0);
      }
    } else {
      w.voltageDrop = 0;
      w.overheated = false;
      w.temp = Math.max(AMBIENT_TEMPERATURE, (w.temp || AMBIENT_TEMPERATURE) - dt * 3.0);
    }
  });

  // 7. DISPARO DE PROTEÇÕES TÉRMICAS E MAGNÉTICAS
  comps.forEach(prot => {
    prot.state = prot.state || {};
    if (prot.state.tripped || prot.state.burned) return;

    const isProtective = ['MCB1', 'MCB_1P', 'MCB2', 'MCB3', 'MCCB', 'MPCB', 'RCBO', 'FUSE', 'FU3', 'OLR'].includes(prot.code);
    if (!isProtective) return;

    const inCurrent = Number(prot.params?.current || 16);
    const connectedWires = wires.filter(w => w.a.c === prot.id || w.b.c === prot.id);
    const maxI = connectedWires.reduce((max, w) => Math.max(max, Number(w.current || 0)), 0);

    const ratio = maxI / Math.max(0.1, inCurrent);
    prot.state.loadRatio = Number(ratio.toFixed(2));

    if (ratio >= 1.13 && ratio <= 1.45) {
      prot.state.thermal = true;
      prot.params.overloadTimer = (prot.params.overloadTimer || 0) + dt;
      if (prot.params.overloadTimer >= 6.0) {
        prot.state.tripped = true;
        prot.state.closed = false;
        result.trippedIds.push(prot.id);
      }
    } else if (ratio > 1.45) {
      prot.state.tripped = true;
      prot.state.closed = false;
      prot.state.temp = 120.0;
      result.trippedIds.push(prot.id);
    }
  });

  // Teste de Fuga à Terra IDR
  comps.forEach(rcd => {
    if (['RCD', 'RCD4', 'RCBO'].includes(rcd.code)) {
      rcd.state = rcd.state || {};
      if (rcd.state.tripped) return;
      if (rcd.params?.testPressed) {
        rcd.state.tripped = true;
        rcd.state.closed = false;
        result.trippedIds.push(rcd.id);
      }
    }
  });

  // Medições True-RMS e Smart Meter
  comps.forEach(m => {
    if (m.code === 'VM') {
      const nodeA = `${m.id}:+`;
      const nodeB = `${m.id}:-`;
      let vA = 0, vB = 0;

      sourcePoles.forEach(sp => {
        const map = reachMap.get(sp.id);
        if (!map) return;
        if (map.has(nodeA)) vA = sp.v * map.get(nodeA)!.vFactor;
        if (map.has(nodeB)) vB = sp.v * map.get(nodeB)!.vFactor;
      });

      m.state.voltage = (vA > 0 || vB > 0) && vA !== vB ? Math.abs(vA - vB) : 0.0;
    } else if (m.code === 'AM') {
      const wiresIn = wires.filter(w => w.a.c === m.id || w.b.c === m.id);
      m.state.current = wiresIn.reduce((max, w) => Math.max(max, Number(w.current || 0)), 0);
    } else if (m.code === 'WM') {
      m.state.powerKW = Number((result.totalActivePower / 1000).toFixed(2));
      m.state.voltage = result.mainVoltageRMS;
      m.state.current = result.totalLineCurrent;
    } else if (m.code === 'FREQ') {
      m.state.frequency = result.mainVoltageRMS > 0 ? result.activeFrequency : 0;
    } else if (m.code === 'COS') {
      m.state.powerFactor = result.totalLineCurrent > 0 ? result.activePF : 1.0;
    } else if (m.code === 'SMART_METER') {
      const pThrough = result.totalActivePower;
      m.state.powerKW = Number((pThrough / 1000).toFixed(2));
      m.state.voltage = result.mainVoltageRMS || 230.0;
      m.state.current = result.totalLineCurrent;
      m.state.energyKWh = Number(((m.state.energyKWh || 0) + (pThrough * (dt / 3600)) / 1000).toFixed(2));
    } else if (m.code === 'ENERGY') {
      if (result.totalActivePower > 0) {
        m.state.energyKWh = (m.state.energyKWh || 0) + (result.totalActivePower * (dt / 3600)) / 1000;
      }
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
      params: { current: 63, curve: 'C', closed: true },
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
      params: { current: 10, curve: 'C', closed: true },
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
      params: { current: 16, curve: 'C', closed: true },
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
      params: { current: 16, voltage: 230 },
      state: { energized: true },
      label: 'Tomadas Gerais'
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
      state: { energized: true, running: true },
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
      state: { energized: true, running: true },
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
      state: { energized: true },
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
      params: { powerW: 5000, batVoltage: 48, acOutVoltage: 230, running: true },
      state: { energized: true, running: true, voltage: 230 },
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
      params: { importedKWh: 0, exportedKWh: 0 },
      state: { energized: true },
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
      params: { power: 100, voltage: 230, pf: 1.0 },
      state: { energized: true },
      label: 'Cargas AC 230V'
    }
  ];

  const wires = [
    { id: 'W_SERIE', a: { c: 'PV1', t: '+' }, b: { c: 'PV2', t: '-' }, type: '24+', gauge: 4.0, length: 1.5, live: true },
    { id: 'W_PV_P', a: { c: 'PV2', t: '+' }, b: { c: 'INV1', t: 'PV+' }, type: '24+', gauge: 4.0, length: 3.0, live: true },
    { id: 'W_PV_M', a: { c: 'PV1', t: '-' }, b: { c: 'INV1', t: 'PV-' }, type: '24-', gauge: 4.0, length: 4.5, live: true },
    { id: 'W_BAT_P', a: { c: 'BAT1', t: '+' }, b: { c: 'INV1', t: 'BAT+' }, type: '24+', gauge: 16.0, length: 2.0, live: true },
    { id: 'W_BAT_M', a: { c: 'BAT1', t: '-' }, b: { c: 'INV1', t: 'BAT-' }, type: '24-', gauge: 16.0, length: 2.0, live: true },
    { id: 'W_AC_L', a: { c: 'INV1', t: 'AC_L' }, b: { c: 'METER1', t: 'L_IN' }, type: 'L1', gauge: 2.5, length: 2.0, live: true },
    { id: 'W_AC_N', a: { c: 'INV1', t: 'AC_N' }, b: { c: 'METER1', t: 'N_IN' }, type: 'N', gauge: 2.5, length: 2.0, live: true },
    { id: 'W_OUT_L', a: { c: 'METER1', t: 'L_OUT' }, b: { c: 'LAMP1', t: 'L' }, type: 'L1', gauge: 2.5, length: 2.0, live: true },
    { id: 'W_OUT_N', a: { c: 'METER1', t: 'N_OUT' }, b: { c: 'LAMP1', t: 'N' }, type: 'N', gauge: 2.5, length: 2.0, live: true }
  ];

  return { components, wires };
}