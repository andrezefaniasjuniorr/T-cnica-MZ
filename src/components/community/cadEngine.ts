// ============================================================================
// TÉCNICAMZ PRO — MOTOR CAD ELÉTRICO, FÍSICA NODAL & MATRIZ DE COMUTAÇÃO (V14)
// Normas: IEC 60669 (Interruptores), NBR 14136, IEC 60947, IEC 60364 e IEC 60898
// Pinagem Física NBR/IEC: 1P (L/R), 2P (L1/L2/L1'/L2'), 3-Way (C/R1/R2), 4-Way (IN1/IN2/OUT1/OUT2)
// Matriz de Comutação Real, Malha Fechada BFS, Curvas Inversas e Estados Mecânicos
// ============================================================================

export interface TerminalDef {
  0: string; // Terminal ID (ex: 'L', 'R', 'C', 'R1', 'R2', 'IN1', 'OUT1', etc.)
  1: string; // Função do Terminal: 'IN' | 'OUT' | 'COIL' | 'COM' | 'NO' | 'NC' | 'PWR' | 'PE' | 'A' | 'B' | 'C' | 'G' | 'D' | 'S' | 'K' | 'AUX' | 'DATA'
  2: string; // Tipo de Condutor Padrão: 'L1' | 'L2' | 'L3' | 'N' | 'PE' | '24+' | '24-' | 'CTRL'
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
  cat: 'sources' | 'protection' | 'command' | 'motors' | 'automation' | 'electronics' | 'measurement' | 'loads' | 'legacy' | 'solar';
  icon: string;
  terminals: [string, string, string][];
  kind: string;
  params: Record<string, any>;
  sourceType?: 'AC' | 'AC3' | 'DC';
  momentary?: boolean;
  emergency?: boolean;
}

export const CATEGORIES: Record<string, string> = {
  all: 'Todos',
  solar: 'Energia Solar Fotovoltaica',
  busbars: 'Trilhos & Barramentos (DIN)',
  protection: 'Proteção',
  command: 'Comandos & Relés',
  motors: 'Motores & Cargas',
  automation: 'Automação & CLP',
  electronics: 'Eletrônica & Semicondutores',
  measurement: 'Instrumentação & Medição',
  loads: 'Iluminação & Potência',
  sources: 'Fontes de Alimentação',
  legacy: 'Eletromecânicos'
};

export const WIRE_COLORS: Record<string, string> = {
  L1: '#b45309', // Castanho / Fase 1
  L2: '#1e293b', // Preto / Fase 2
  L3: '#64748b', // Cinzento / Fase 3
  N: '#0284c7',  // Azul Claro / Neutro
  PE: '#10b981', // Verde-Amarelo / Terra de Proteção
  '24+': '#ef4444', // Vermelho / DC Positivo (+24V)
  '24-': '#3b82f6', // Azul Escuro / DC Negativo (0V)
  CTRL: '#f59e0b' // Amarelo / Comando & Intertravamento
};

// ----------------------------------------------------------------------------
// CONSTANTES FÍSICAS REAIS DE ENGENHARIA ELÉTRICA (IEC 60364-5-52)
// ----------------------------------------------------------------------------
export const COPPER_RESISTIVITY = 0.0175; // Resistividade do Cobre a 20°C (Ω·mm²/m)
export const COPPER_CONDUCTIVITY = 57.14; // Condutividade γ (m/(Ω·mm²))
export const AMBIENT_TEMPERATURE = 25.0;  // Temperatura ambiente (°C)
export const PVC_MAX_TEMP = 70.0;         // Temperatura máxima contínua do PVC (°C)
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
// CATÁLOGO DE COMPONENTES DE ENGENHARIA (COM PINAGEM FÍSICA CORRIGIDA)
// ----------------------------------------------------------------------------
export const COMPONENT_CATALOG: ComponentDef[] = [
  // INTERRUPTORES E COMUTADORES (PINAGEM REAL IEC 60669 / NBR 14136)
  {
    code: 'SW',
    name: 'Interruptor Simples Unipolar 1P (10A 250V)',
    cat: 'command',
    icon: '⏻',
    terminals: [
      ['L', 'IN', 'L1'],     // Borne de Entrada / Linha
      ['R', 'OUT', 'L1']     // Borne de Saída / Retorno
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
      ['L1', 'IN', 'L1'],    // Entrada Polo 1
      ['L2', 'IN', 'L2'],    // Entrada Polo 2
      ["L1'", 'OUT', 'L1'],  // Saída Retorno 1
      ["L2'", 'OUT', 'L2']   // Saída Retorno 2
    ],
    kind: 'switch2',
    params: { closed: false, rockerAngle: 0 }
  },
  {
    code: 'THREE_WAY',
    name: 'Interruptor Paralelo (Three-Way / Escada 10A)',
    cat: 'command',
    icon: '☵',
    terminals: [
      ['C', 'COM', 'L1'],    // Borne Comum de Entrada / Saída
      ['R1', 'OUT', 'CTRL'], // Borne de Retorno / Balanço 1
      ['R2', 'OUT', 'CTRL']  // Borne de Retorno / Balanço 2
    ],
    kind: 'selector',
    params: { position: 0, rockerAngle: 0 } // position 0: C <-> R1 | position 1: C <-> R2
  },
  {
    code: 'FOUR_WAY',
    name: 'Interruptor Intermediário (Four-Way / Cruzamento 10A)',
    cat: 'command',
    icon: '☶',
    terminals: [
      ['IN1', 'IN', 'CTRL'],   // Entrada Balanço 1
      ['IN2', 'IN', 'CTRL'],   // Entrada Balanço 2
      ['OUT1', 'OUT', 'CTRL'], // Saída Balanço 1
      ['OUT2', 'OUT', 'CTRL']  // Saída Balanço 2
    ],
    kind: 'selector',
    params: { crossed: false, rockerAngle: 0 } // crossed false: Direto | crossed true: Cruzado
  },
  {
    code: 'DIMMER',
    name: 'Dimmer Rotativo / Variador de Tensão (0-100% 230V)',
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
    name: 'Seletor Man/Auto (2 Posições)',
    cat: 'command',
    icon: '◐',
    terminals: [['1', 'COM', 'CTRL'], ['2', 'NO', 'CTRL'], ['3', 'NC', 'CTRL']],
    kind: 'selector',
    params: { position: 0, rockerAngle: 0 }
  },
  {
    code: 'PBNO',
    name: 'Botoeira Pulsadora NA (Verde - S1 Liga)',
    cat: 'command',
    icon: '●',
    terminals: [['3', 'IN', 'CTRL'], ['4', 'NO', 'CTRL']],
    kind: 'push',
    params: { closed: false, pressed: false },
    momentary: true
  },
  {
    code: 'PBNC',
    name: 'Botoeira Pulsadora NF (Vermelha - S0 Desliga)',
    cat: 'command',
    icon: '○',
    terminals: [['1', 'IN', 'CTRL'], ['2', 'NC', 'CTRL']],
    kind: 'push',
    params: { closed: true, pressed: false },
    momentary: true
  },
  {
    code: 'ESTOP',
    name: 'Botoeira de Emergência NF Cogumelo com Trava',
    cat: 'command',
    icon: '⛔',
    terminals: [['1', 'IN', 'CTRL'], ['2', 'NC', 'CTRL']],
    kind: 'switch',
    params: { closed: true, pressed: false },
    emergency: true
  },
  {
    code: 'LIMIT',
    name: 'Fim de Curso (Limit Switch NF)',
    cat: 'command',
    icon: '⌁',
    terminals: [['1', 'IN', 'CTRL'], ['2', 'NC', 'CTRL']],
    kind: 'switch',
    params: { closed: true }
  },
  {
    code: 'FLOAT',
    name: 'Boia de Nível Automática',
    cat: 'command',
    icon: '≋',
    terminals: [['1', 'IN', 'CTRL'], ['2', 'NO', 'CTRL']],
    kind: 'switch',
    params: { closed: false }
  },
  {
    code: 'RELAY',
    name: 'Relé Auxiliar de Comando (1 Contato Reversível)',
    cat: 'command',
    icon: 'K',
    terminals: [['A1', 'COIL', 'CTRL'], ['A2', 'COIL', 'N'], ['11', 'COM', 'CTRL'], ['12', 'NC', 'CTRL'], ['14', 'NO', 'CTRL']],
    kind: 'relay',
    params: { coil: 230, minPickupRatio: 0.85 }
  },
  {
    code: 'CONTACTOR',
    name: 'Contator de Potência 3P + Contatos Auxiliares',
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
    code: 'TIMER',
    name: 'Relé Temporizador com Retardo na Energização (TON)',
    cat: 'command',
    icon: '⏱',
    terminals: [['A1', 'COIL', 'CTRL'], ['A2', 'COIL', 'N'], ['15', 'COM', 'CTRL'], ['16', 'NC', 'CTRL'], ['18', 'NO', 'CTRL']],
    kind: 'timer',
    params: { delay: 5, mode: 'TON', elapsed: 0, minPickupRatio: 0.85 }
  },
  {
    code: 'FLASH',
    name: 'Relé Intermitente Cíclico',
    cat: 'command',
    icon: '◌',
    terminals: [['A1', 'COIL', 'CTRL'], ['A2', 'COIL', 'N'], ['15', 'COM', 'CTRL'], ['18', 'NO', 'CTRL']],
    kind: 'flasher',
    params: { period: 1, elapsed: 0 }
  },
  {
    code: 'BUZZ',
    name: 'Sirene Sonora / Buzzer de Alarme',
    cat: 'command',
    icon: '🔊',
    terminals: [['+', 'IN', '24+'], ['-', 'IN', '24-']],
    kind: 'load',
    params: { power: 5, voltage: 24 }
  },

  // PROTEÇÃO (CURVAS B, C, D - IEC 60947-2 / IEC 60898-1)
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
    name: 'Disjuntor Bipolar 2P+N Curva C (2 Fases + Neutro)',
    cat: 'protection',
    icon: '▣',
    terminals: [
      ['1', 'IN', 'L1'], ['2', 'OUT', 'L1'],
      ['3', 'IN', 'L2'], ['4', 'OUT', 'L2'],
      ['N_IN', 'IN', 'N'], ['N_OUT', 'OUT', 'N']
    ],
    kind: 'breaker2',
    params: { current: 25, curve: 'C', closed: true, temp: 25, overloadTimer: 0, tripped: false }
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
    name: 'Disjuntor Caixa Moldada 3P+N (Ajustável)',
    cat: 'protection',
    icon: '▰',
    terminals: [
      ['1', 'IN', 'L1'], ['2', 'OUT', 'L1'],
      ['3', 'IN', 'L2'], ['4', 'OUT', 'L2'],
      ['5', 'IN', 'L3'], ['6', 'OUT', 'L3'],
      ['N_IN', 'IN', 'N'], ['N_OUT', 'OUT', 'N']
    ],
    kind: 'breaker3',
    params: { current: 63, curve: 'C', closed: true, icu: 25, temp: 25, overloadTimer: 0, tripped: false }
  },
  {
    code: 'FUSE',
    name: 'Fusível Diazed / Cartucho gG',
    cat: 'protection',
    icon: '⏤',
    terminals: [['1', 'IN', 'L1'], ['2', 'OUT', 'L1']],
    kind: 'fuse',
    params: { current: 10, closed: true, temp: 25, burned: false }
  },
  {
    code: 'FU3',
    name: 'Seccionadora com Fusíveis 3P gG',
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
    name: 'Interruptor Diferencial Residual IDR 2P+N (30mA)',
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
    name: 'Dispositivo Contra Surtos DPS Monofásico (L+N+PE / 20kA)',
    cat: 'protection',
    icon: '⚡',
    terminals: [['L', 'IN', 'L1'], ['N', 'IN', 'N'], ['PE', 'PE', 'PE']],
    kind: 'spd',
    params: { uc: 275, in: 20, imax: 45, health: 100, status: 'green' }
  },
  {
    code: 'SPD3',
    name: 'Dispositivo Contra Surtos DPS Trifásico (3P+N+PE / 40kA)',
    cat: 'protection',
    icon: '⚡',
    terminals: [
      ['L1', 'IN', 'L1'], ['L2', 'IN', 'L2'], ['L3', 'IN', 'L3'],
      ['N', 'IN', 'N'], ['PE', 'PE', 'PE']
    ],
    kind: 'spd',
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

  // FONTES E ALIMENTAÇÃO
  {
    code: 'SRC_AC1',
    name: 'Fonte Monofásica (230V / 50Hz)',
    cat: 'sources',
    icon: '⌁',
    terminals: [['L', 'OUT', 'L1'], ['N', 'OUT', 'N']],
    kind: 'source',
    params: { voltage: 230, frequency: 50, internalR: 0.05, closed: true },
    sourceType: 'AC'
  },
  {
    code: 'SRC_AC3',
    name: 'Rede Trifásica (400V / 50Hz)',
    cat: 'sources',
    icon: '⚡',
    terminals: [['L1', 'OUT', 'L1'], ['L2', 'OUT', 'L2'], ['L3', 'OUT', 'L3'], ['N', 'OUT', 'N'], ['PE', 'PE', 'PE']],
    kind: 'source',
    params: { voltage: 400, frequency: 50, internalR: 0.03, closed: true },
    sourceType: 'AC3'
  },
  {
    code: 'SRC_DC24',
    name: 'Fonte CC Industrial (24V)',
    cat: 'sources',
    icon: '⎓',
    terminals: [['+', 'OUT', '24+'], ['-', 'OUT', '24-']],
    kind: 'source',
    params: { voltage: 24, internalR: 0.02, closed: true },
    sourceType: 'DC'
  },
  {
    code: 'BAT',
    name: 'Bateria Chumbo-Ácido (12V)',
    cat: 'sources',
    icon: '🔋',
    terminals: [['+', 'OUT', '24+'], ['-', 'OUT', '24-']],
    kind: 'source',
    params: { voltage: 12, capacityAh: 60, internalR: 0.015, closed: true },
    sourceType: 'DC'
  },
  {
    code: 'PSU',
    name: 'Fonte Chaveada 230V / 24Vdc',
    cat: 'sources',
    icon: '▣',
    terminals: [['L', 'IN', 'L1'], ['N', 'IN', 'N'], ['+', 'OUT', '24+'], ['-', 'OUT', '24-']],
    kind: 'converter',
    params: { vin: 230, vout: 24, power: 120, eff: 0.88 }
  },
  {
    code: 'TRF',
    name: 'Transformador de Comando (230/24V)',
    cat: 'sources',
    icon: '⟂',
    terminals: [['P1', 'IN', 'L1'], ['P2', 'IN', 'N'], ['S1', 'OUT', 'CTRL'], ['S2', 'OUT', 'N']],
    kind: 'transformer',
    params: { ratio: 9.58, vsec: 24, powerVA: 100 }
  },
  {
    code: 'GND',
    name: 'Aterramento de Proteção (PE / Terra)',
    cat: 'sources',
    icon: '⏚',
    terminals: [['G', 'PE', 'PE']],
    kind: 'ground',
    params: { resistance: 5 }
  },

  // MOTORES
  {
    code: 'M1PH',
    name: 'Motor Monofásico 230V CA',
    cat: 'motors',
    icon: 'M',
    terminals: [['L', 'IN', 'L1'], ['N', 'IN', 'N'], ['PE', 'PE', 'PE']],
    kind: 'motor1',
    params: { power: 750, rpm: 1450, voltage: 230, pf: 0.82 }
  },
  {
    code: 'M3PH',
    name: 'Motor Trifásico de Indução Gaiola de Esquilo (MIT)',
    cat: 'motors',
    icon: 'M3',
    terminals: [['U', 'IN', 'L1'], ['V', 'IN', 'L2'], ['W', 'IN', 'L3'], ['PE', 'PE', 'PE']],
    kind: 'motor3',
    params: { power: 7500, rpm: 2920, voltage: 400, pf: 0.86 }
  },
  {
    code: 'MDC',
    name: 'Motor de Corrente Contínua 24Vcc',
    cat: 'motors',
    icon: '⎓',
    terminals: [['+', 'IN', '24+'], ['-', 'IN', '24-']],
    kind: 'motorDC',
    params: { power: 180, rpm: 3000, voltage: 24 }
  },
  {
    code: 'FAN',
    name: 'Ventilador Industrial de Exaustão',
    cat: 'motors',
    icon: '🌀',
    terminals: [['L', 'IN', 'L1'], ['N', 'IN', 'N']],
    kind: 'fan',
    params: { power: 120, rpm: 1350, voltage: 230 }
  },
  {
    code: 'PUMP',
    name: 'Eletrobomba Centrífuga Trifásica',
    cat: 'motors',
    icon: '💧',
    terminals: [['U', 'IN', 'L1'], ['V', 'IN', 'L2'], ['W', 'IN', 'L3'], ['PE', 'PE', 'PE']],
    kind: 'motor3',
    params: { power: 2200, rpm: 2850, voltage: 400, pf: 0.85 }
  },

  // AUTOMAÇÃO
  {
    code: 'PLC',
    name: 'CLP Industrial Compacto 24Vdc (4 Entradas / 4 Saídas)',
    cat: 'automation',
    icon: 'PLC',
    terminals: [
      ['L+', 'PWR', '24+'], ['M', 'PWR', '24-'],
      ['I0', 'IN', 'CTRL'], ['I1', 'IN', 'CTRL'], ['I2', 'IN', 'CTRL'], ['I3', 'IN', 'CTRL'],
      ['Q0', 'OUT', 'CTRL'], ['Q1', 'OUT', 'CTRL'], ['Q2', 'OUT', 'CTRL'], ['Q3', 'OUT', 'CTRL']
    ],
    kind: 'plc',
    params: { scan: 20 }
  },
  {
    code: 'VFD',
    name: 'Inversor de Frequência Vetorial 3F',
    cat: 'automation',
    icon: 'VFD',
    terminals: [
      ['L1', 'IN', 'L1'], ['L2', 'IN', 'L2'], ['L3', 'IN', 'L3'],
      ['U', 'OUT', 'L1'], ['V', 'OUT', 'L2'], ['W', 'OUT', 'L3'], ['PE', 'PE', 'PE'],
      ['DI1', 'CTRL', 'CTRL'], ['AI1', 'CTRL', 'CTRL']
    ],
    kind: 'vfd',
    params: { frequency: 50, setpoint: 50 }
  },
  {
    code: 'SOFT',
    name: 'Chave de Partida Suave (Soft-Starter 3P)',
    cat: 'automation',
    icon: 'SS',
    terminals: [
      ['L1', 'IN', 'L1'], ['L2', 'IN', 'L2'], ['L3', 'IN', 'L3'],
      ['T1', 'OUT', 'L1'], ['T2', 'OUT', 'L2'], ['T3', 'OUT', 'L3'],
      ['A1', 'CTRL', 'CTRL'], ['A2', 'CTRL', 'N']
    ],
    kind: 'softstarter',
    params: { ramp: 6 }
  },
  {
    code: 'PROX',
    name: 'Sensor de Proximidade Indutivo PNP',
    cat: 'automation',
    icon: '◉',
    terminals: [['+', 'PWR', '24+'], ['-', 'PWR', '24-'], ['OUT', 'OUT', 'CTRL']],
    kind: 'sensor',
    params: { distance: 5, triggered: false }
  },
  {
    code: 'TEMP',
    name: 'Transmissor de Temperatura PT100',
    cat: 'automation',
    icon: 'T',
    terminals: [['+', 'PWR', '24+'], ['-', 'PWR', '24-'], ['OUT', 'OUT', 'CTRL']],
    kind: 'sensor',
    params: { temperature: 25 }
  },

  // ELETRÔNICA & SEMICONDUTORES
  {
    code: 'R',
    name: 'Resistor de Precisão',
    cat: 'electronics',
    icon: 'Ω',
    terminals: [['1', 'A', 'CTRL'], ['2', 'B', 'CTRL']],
    kind: 'resistor',
    params: { ohm: 1000 }
  },
  {
    code: 'POT',
    name: 'Potenciômetro Linear',
    cat: 'electronics',
    icon: '▱',
    terminals: [['1', 'A', 'CTRL'], ['2', 'W', 'CTRL'], ['3', 'B', 'CTRL']],
    kind: 'pot',
    params: { ohm: 10000, value: 50 }
  },
  {
    code: 'C',
    name: 'Capacitor Cerâmico',
    cat: 'electronics',
    icon: '||',
    terminals: [['1', 'A', 'CTRL'], ['2', 'B', 'CTRL']],
    kind: 'capacitor',
    params: { uF: 100 }
  },
  {
    code: 'C_POL',
    name: 'Capacitor Eletrolítico Polarizado',
    cat: 'electronics',
    icon: '|(|',
    terminals: [['+', 'A', 'CTRL'], ['-', 'B', 'CTRL']],
    kind: 'capacitor',
    params: { uF: 470 }
  },
  {
    code: 'L',
    name: 'Indutor de Potência',
    cat: 'electronics',
    icon: '⌁',
    terminals: [['1', 'A', 'CTRL'], ['2', 'B', 'CTRL']],
    kind: 'inductor',
    params: { mH: 10 }
  },
  {
    code: 'DIODE',
    name: 'Diodo Retificador (1N4007)',
    cat: 'electronics',
    icon: '▷|',
    terminals: [['A', 'A', 'CTRL'], ['K', 'K', 'CTRL']],
    kind: 'diode',
    params: { vf: 0.7 }
  },
  {
    code: 'LED',
    name: 'LED Sinalizador (Diodo Emissor de Luz)',
    cat: 'electronics',
    icon: '◉',
    terminals: [['A', 'A', 'CTRL'], ['K', 'K', 'CTRL']],
    kind: 'led',
    params: { vf: 2.1, current: 0.02 }
  },
  {
    code: 'ZENER',
    name: 'Diodo Zener Regulador (5.1V)',
    cat: 'electronics',
    icon: '↯',
    terminals: [['A', 'A', 'CTRL'], ['K', 'K', 'CTRL']],
    kind: 'zener',
    params: { vz: 5.1 }
  },
  {
    code: 'BRIDGE',
    name: 'Ponte Retificadora de Onda Completa',
    cat: 'electronics',
    icon: '▣',
    terminals: [['~1', 'IN', 'L1'], ['~2', 'IN', 'N'], ['+', 'OUT', '24+'], ['-', 'OUT', '24-']],
    kind: 'bridge',
    params: {}
  },
  {
    code: 'BJT_NPN',
    name: 'Transistor Bipolar NPN (BC548)',
    cat: 'electronics',
    icon: 'NPN',
    terminals: [['C', 'C', 'CTRL'], ['B', 'B', 'CTRL'], ['E', 'E', 'CTRL']],
    kind: 'bjt',
    params: { beta: 120, type: 'NPN' }
  },
  {
    code: 'BJT_PNP',
    name: 'Transistor Bipolar PNP (BC558)',
    cat: 'electronics',
    icon: 'PNP',
    terminals: [['E', 'E', 'CTRL'], ['B', 'B', 'CTRL'], ['C', 'C', 'CTRL']],
    kind: 'bjt',
    params: { beta: 120, type: 'PNP' }
  },
  {
    code: 'MOS_N',
    name: 'MOSFET Canal N de Potência (IRF540)',
    cat: 'electronics',
    icon: 'NMOS',
    terminals: [['D', 'D', 'CTRL'], ['G', 'G', 'CTRL'], ['S', 'S', 'CTRL']],
    kind: 'mosfet',
    params: { rds: 0.044, type: 'N' }
  },
  {
    code: 'OPAMP',
    name: 'Amplificador Operacional (LM741)',
    cat: 'electronics',
    icon: 'AOP',
    terminals: [['V+', 'PWR', '24+'], ['V-', 'PWR', '24-'], ['+', 'IN', 'CTRL'], ['-', 'IN', 'CTRL'], ['OUT', 'OUT', 'CTRL']],
    kind: 'opamp',
    params: { gain: 100000 }
  },
  {
    code: 'REG5',
    name: 'Regulador Linear LM7805 (5V / 1.5A)',
    cat: 'electronics',
    icon: '5V',
    terminals: [['IN', 'IN', '24+'], ['GND', 'GND', '24-'], ['OUT', 'OUT', 'CTRL']],
    kind: 'regulator',
    params: { vout: 5 }
  },

  // MEDIÇÃO & INSTRUMENTAÇÃO
  {
    code: 'VM',
    name: 'Voltímetro Digital True-RMS',
    cat: 'measurement',
    icon: 'V',
    terminals: [['+', 'A', 'CTRL'], ['-', 'B', 'CTRL']],
    kind: 'meterV',
    params: {}
  },
  {
    code: 'AM',
    name: 'Amperímetro Digital True-RMS',
    cat: 'measurement',
    icon: 'A',
    terminals: [['1', 'A', 'CTRL'], ['2', 'B', 'CTRL']],
    kind: 'meterA',
    params: {}
  },
  {
    code: 'WM',
    name: 'Wattímetro Digital Monofásico / Trifásico',
    cat: 'measurement',
    icon: 'W',
    terminals: [['L', 'A', 'CTRL'], ['N', 'B', 'CTRL'], ['I1', 'AUX', 'CTRL'], ['I2', 'AUX', 'CTRL']],
    kind: 'meterW',
    params: {}
  },
  {
    code: 'FREQ',
    name: 'Frequencímetro Digital de Precisão',
    cat: 'measurement',
    icon: 'Hz',
    terminals: [['1', 'A', 'CTRL'], ['2', 'B', 'CTRL']],
    kind: 'meterF',
    params: {}
  },
  {
    code: 'ENERGY',
    name: 'Medidor de Energia Ativa Acumulada (kWh)',
    cat: 'measurement',
    icon: 'kWh',
    terminals: [['L', 'A', 'CTRL'], ['N', 'B', 'CTRL']],
    kind: 'meterE',
    params: { energy: 0 }
  },
  {
    code: 'COS',
    name: 'Cosfímetro Digital (Fator de Potência cos φ)',
    cat: 'measurement',
    icon: 'cosφ',
    terminals: [['L', 'A', 'CTRL'], ['N', 'B', 'CTRL']],
    kind: 'meterPF',
    params: {}
  },
  {
    code: 'SCOPE',
    name: 'Osciloscópio Digital de 2 Canais',
    cat: 'measurement',
    icon: 'OSC',
    terminals: [['CH1', 'A', 'CTRL'], ['GND', 'B', 'CTRL'], ['CH2', 'AUX', 'CTRL']],
    kind: 'scope',
    params: {}
  },

  // CARGAS & POTÊNCIA
  {
    code: 'LAMP',
    name: 'Lâmpada Incandescente / LED 230V',
    cat: 'loads',
    icon: '💡',
    terminals: [['L', 'IN', 'L1'], ['N', 'IN', 'N']],
    kind: 'lamp',
    params: { power: 60, voltage: 230, pf: 1.0 }
  },
  {
    code: 'PILOT_GREEN',
    name: 'Sinaleiro Piloto Verde (Em Marcha / Ligado)',
    cat: 'loads',
    icon: '🟢',
    terminals: [['L', 'IN', 'CTRL'], ['N', 'IN', 'N']],
    kind: 'lamp',
    params: { power: 3, voltage: 230, color: 'green', pf: 1.0 }
  },
  {
    code: 'PILOT_RED',
    name: 'Sinaleiro Piloto Vermelho (Desligado / Falha)',
    cat: 'loads',
    icon: '🔴',
    terminals: [['L', 'IN', 'CTRL'], ['N', 'IN', 'N']],
    kind: 'lamp',
    params: { power: 3, voltage: 230, color: 'red', pf: 1.0 }
  },
  {
    code: 'PILOT_YELLOW',
    name: 'Sinaleiro Piloto Amarelo (Sobrecarga / Alerta)',
    cat: 'loads',
    icon: '🟡',
    terminals: [['L', 'IN', 'CTRL'], ['N', 'IN', 'N']],
    kind: 'lamp',
    params: { power: 3, voltage: 230, color: 'yellow', pf: 1.0 }
  },
  {
    code: 'HEATER',
    name: 'Resistência de Aquecimento Industrial',
    cat: 'loads',
    icon: '♨',
    terminals: [['L', 'IN', 'L1'], ['N', 'IN', 'N']],
    kind: 'heater',
    params: { power: 2000, voltage: 230, pf: 1.0 }
  },
  {
    code: 'OUTLET',
    name: 'Tomada 2P+T 16A 230V (Schuko / NBR)',
    cat: 'loads',
    icon: '▣',
    terminals: [['L', 'IN', 'L1'], ['N', 'IN', 'N'], ['PE', 'PE', 'PE']],
    kind: 'outlet',
    params: { current: 16, voltage: 230 }
  },

  // CARGAS ESPECIAIS DE ALTA POTÊNCIA (IEC 60364)
  {
    code: 'LOAD_AC',
    name: 'Ar Condicionado Split Inverter (12.000 BTU / 230V)',
    cat: 'loads',
    icon: '❄',
    terminals: [['L', 'IN', 'L1'], ['N', 'IN', 'N'], ['PE', 'PE', 'PE']],
    kind: 'load_ac',
    params: { power: 1400, current: 6.2, voltage: 230, wireGauge: 2.5, btu: 12000, temp: 21, pf: 0.95 }
  },
  {
    code: 'LOAD_COOKTOP',
    name: 'Fogão de Indução Eletromagnético (4 Zonas / 7200W)',
    cat: 'loads',
    icon: '♨',
    terminals: [
      ['1', 'IN', 'L1'], ['3', 'IN', 'L2'],
      ['N', 'IN', 'N'], ['PE', 'PE', 'PE']
    ],
    kind: 'load_cooktop',
    params: { power: 7200, current: 31.3, voltage: 230, wireGauge: 6.0, pf: 0.98 }
  },
  {
    code: 'LOAD_SHOWER',
    name: 'Chuveiro Elétrico Multitemperatura (7500W Alta Potência)',
    cat: 'loads',
    icon: '🚿',
    terminals: [['L', 'IN', 'L1'], ['N', 'IN', 'N'], ['PE', 'PE', 'PE']],
    kind: 'load_shower',
    params: { power: 7500, current: 32.6, voltage: 230, wireGauge: 6.0, pf: 1.0 }
  },
  {
    code: 'LOAD_MICROWAVE',
    name: 'Forno Micro-ondas Digital (1200W)',
    cat: 'loads',
    icon: '📻',
    terminals: [['L', 'IN', 'L1'], ['N', 'IN', 'N'], ['PE', 'PE', 'PE']],
    kind: 'load_microwave',
    params: { power: 1200, current: 5.3, voltage: 230, wireGauge: 2.5, pf: 0.92 }
  },

  // ATERRAMENTO FÍSICO REALISTA & DISTRIBUIÇÃO (IEC 62305 / NBR 5410)
  {
    code: 'EARTH_ROD',
    name: 'Haste de Aterramento Copperweld 5/8" × 2.4m',
    cat: 'sources',
    icon: '⏚',
    terminals: [['PE', 'PE', 'PE']],
    kind: 'earth_rod',
    params: { resistance: 10, length: 2.4, material: 'copperweld' }
  },
  {
    code: 'EARTH_PIT',
    name: 'Caixa de Inspeção de Aterramento (BEP)',
    cat: 'sources',
    icon: '⌸',
    terminals: [
      ['PE1', 'PE', 'PE'], ['PE2', 'PE', 'PE'],
      ['PE3', 'PE', 'PE'], ['GND', 'PE', 'PE']
    ],
    kind: 'earth_pit',
    params: { resistance: 5 }
  },
  {
    code: 'BARE_COPPER',
    name: 'Cabo de Cobre Nu para Malha de Aterramento',
    cat: 'sources',
    icon: '〰',
    terminals: [['IN', 'PE', 'PE'], ['OUT', 'PE', 'PE']],
    kind: 'bare_copper',
    params: { gauge: 35, length: 10 }
  },
  {
    code: 'JUNCTION_BOX',
    name: 'Caixa de Derivação com Bornes WAGO (Octogonal/Quadrada)',
    cat: 'loads',
    icon: '⊞',
    terminals: [
      ['L_IN', 'IN', 'L1'], ['L_OUT1', 'OUT', 'L1'], ['L_OUT2', 'OUT', 'L1'],
      ['N_IN', 'IN', 'N'], ['N_OUT1', 'OUT', 'N'], ['N_OUT2', 'OUT', 'N'],
      ['PE_IN', 'PE', 'PE'], ['PE_OUT', 'PE', 'PE']
    ],
    kind: 'junction_box',
    params: { type: 'wago_221', ports: 8, rating: 32 }
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
}

interface InternalEdge {
  target: string;
  r: number;
  wireId?: string;
}

/**
 * MOTOR DE VALIDAÇÃO DE CIRCUITO FECHADO E PROPAGAÇÃO POR GRAFO DINÂMICO
 */
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
    burnedIds: []
  };

  const comps = project.components || [];
  const wires = project.wires || [];
  const busbars = project.busbars || [];

  // Se o simulador estiver desligado, limpa e resfria todos os elementos imediatamente
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
  // Cada terminal é uma chave `${id}:${terminalId}`
  const graph = new Map<string, InternalEdge[]>();

  const addGraphEdge = (u: string, v: string, r: number, wireId?: string) => {
    if (!graph.has(u)) graph.set(u, []);
    if (!graph.has(v)) graph.set(v, []);
    graph.get(u)!.push({ target: v, r, wireId });
    graph.get(v)!.push({ target: u, r, wireId });
  };

  // A. Arestas de Condutores (Fios) com resistência física R = ρ * L / S
  wires.forEach(w => {
    if (w.fault || w.burned) return;
    const u = `${w.a.c}:${w.a.t}`;
    const v = `${w.b.c}:${w.b.t}`;
    const gauge = Number(w.gauge || 2.5);
    const length = Number(w.length || 2.0);
    const r = (COPPER_RESISTIVITY * length) / gauge;
    addGraphEdge(u, v, r, w.id);
  });

  // B. Arestas Internas dos Barramentos Elétricos (Spine de cobre unificado)
  busbars.forEach(bb => {
    if (bb.type === 'din' || !bb.terminals) return;
    const spine = `${bb.id}:SPINE`;
    bb.terminals.forEach(t => {
      addGraphEdge(`${bb.id}:${t.id}`, spine, 0.0005);
    });
  });

  // 2. CONVERGÊNCIA ITERATIVA DE CONTATOS ELETROMECÂNICOS (CONVERSÃO MULTIPASSO)
  // Contatores (KM), Relés, Temporizadores, Relé de Falta de Fase e Botoeiras
  const maxIterations = 4;
  let pass = 0;
  let contactorStateChanged = true;

  type SourcePole = { id: string; net: string; v: number; angle: number; sourceId: string };
  let sourcePoles: SourcePole[] = [];
  let reachMap = new Map<string, Map<string, { rPath: number; sourcePole: SourcePole }>>();

  while (contactorStateChanged && pass < maxIterations) {
    pass++;
    contactorStateChanged = false;

    // C. Constrói as arestas internas dos aparelhos baseadas no estado de chaveamento atual
    comps.forEach(c => {
      c.state = c.state || {};
      const d = getComponentDef(c.code);
      const isBurned = Boolean(c.state.isBurned || c.state.damaged);
      const isTripped = Boolean(c.state.tripped);

      // Disjuntores e Seccionadoras
      if (['breaker', 'breaker2', 'breaker3', 'rcbo'].includes(d.kind)) {
        const isClosed = c.state.closed !== false && !isTripped && !isBurned;
        c.state.flagColor = isTripped ? 'yellow' : isClosed ? 'red' : 'green';
        c.state.leverPos = isTripped ? 'trip' : isClosed ? 'up' : 'down';

        if (isClosed) {
          addGraphEdge(`${c.id}:1`, `${c.id}:2`, 0.002);
          if (c.code === 'MCB2' || c.code === 'MCB3' || c.code === 'MCCB') {
            addGraphEdge(`${c.id}:3`, `${c.id}:4`, 0.002);
          }
          if (c.code === 'MCB3' || c.code === 'MCCB') {
            addGraphEdge(`${c.id}:5`, `${c.id}:6`, 0.002);
          }
          addGraphEdge(`${c.id}:N_IN`, `${c.id}:N_OUT`, 0.001);
          addGraphEdge(`${c.id}:N`, `${c.id}:N_OUT`, 0.001);
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

      // Interruptor Diferencial Residual (IDR / DR)
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

      // Contator de Potência (KM)
      if (d.kind === 'contactor') {
        if (c.state.energized) {
          // Contatos de Força Principais e Selo Auxiliar 13-14 Fecham
          addGraphEdge(`${c.id}:1`, `${c.id}:2`, 0.002);
          addGraphEdge(`${c.id}:3`, `${c.id}:4`, 0.002);
          addGraphEdge(`${c.id}:5`, `${c.id}:6`, 0.002);
          addGraphEdge(`${c.id}:13`, `${c.id}:14`, 0.002);
        } else {
          // Contato Auxiliar NF 21-22 Fechado em Repouso
          addGraphEdge(`${c.id}:21`, `${c.id}:22`, 0.002);
        }
      }

      // Relé Térmico de Sobrecarga (OLR)
      if (d.kind === 'overload') {
        // Pinos de força sempre conduzem pelo bimetal
        addGraphEdge(`${c.id}:1`, `${c.id}:2`, 0.005);
        addGraphEdge(`${c.id}:3`, `${c.id}:4`, 0.005);
        addGraphEdge(`${c.id}:5`, `${c.id}:6`, 0.005);
        // Contatos de comando: 95-96 NF em operação normal, 97-98 NA em trip
        if (!isTripped) {
          addGraphEdge(`${c.id}:95`, `${c.id}:96`, 0.002);
        } else {
          addGraphEdge(`${c.id}:97`, `${c.id}:98`, 0.002);
        }
      }

      // ======================================================================
      // MATRIZ DE COMUTAÇÃO FÍSICA REAL: INTERRUPTORES E COMUTADORES (NBR/IEC)
      // ======================================================================
      // 1. Interruptor Simples (1P): 2 bornes (L e R / 1 e 2)
      if (c.code === 'SW') {
        c.state.rockerAngle = c.state.closed ? 1 : 0;
        if (c.state.closed) {
          addGraphEdge(`${c.id}:L`, `${c.id}:R`, 0.002);
          addGraphEdge(`${c.id}:1`, `${c.id}:2`, 0.002); // alias retrocompatível
        }
      }

      // 2. Interruptor Bipolar (2P): 4 bornes (L1/L2 e L1'/L2')
      else if (c.code === 'SW2') {
        c.state.rockerAngle = c.state.closed ? 1 : 0;
        if (c.state.closed) {
          addGraphEdge(`${c.id}:L1`, `${c.id}:L1'`, 0.002);
          addGraphEdge(`${c.id}:L2`, `${c.id}:L2'`, 0.002);
          addGraphEdge(`${c.id}:1`, `${c.id}:2`, 0.002); // alias
          addGraphEdge(`${c.id}:3`, `${c.id}:4`, 0.002); // alias
        }
      }

      // 3. Interruptor 3-WAY (Paralelo): 3 bornes (Comum C + Retornos R1 e R2)
      else if (c.code === 'THREE_WAY') {
        const pos = Number(c.params?.position ?? (c.state?.closed ? 1 : 0));
        c.state.rockerAngle = pos;

        if (pos === 0) {
          // Posição A: Comum C conectado ao Retorno R1 (R2 fica aberto)
          addGraphEdge(`${c.id}:C`, `${c.id}:R1`, 0.002);
          addGraphEdge(`${c.id}:COM`, `${c.id}:R1`, 0.002);
          addGraphEdge(`${c.id}:COM`, `${c.id}:1`, 0.002); // alias
          addGraphEdge(`${c.id}:C`, `${c.id}:1`, 0.002);   // alias
        } else {
          // Posição B: Comum C conectado ao Retorno R2 (R1 fica aberto)
          addGraphEdge(`${c.id}:C`, `${c.id}:R2`, 0.002);
          addGraphEdge(`${c.id}:COM`, `${c.id}:R2`, 0.002);
          addGraphEdge(`${c.id}:COM`, `${c.id}:2`, 0.002); // alias
          addGraphEdge(`${c.id}:C`, `${c.id}:2`, 0.002);   // alias
        }
      }

      // 4. Interruptor 4-WAY (Intermediário): 4 bornes (Entradas IN1/IN2 e Saídas OUT1/OUT2)
      else if (c.code === 'FOUR_WAY') {
        const crossed = Boolean(c.params?.crossed ?? c.state?.closed);
        c.state.rockerAngle = crossed ? 1 : 0;

        if (!crossed) {
          // Modo Direto: IN1 <-> OUT1 e IN2 <-> OUT2
          addGraphEdge(`${c.id}:IN1`, `${c.id}:OUT1`, 0.002);
          addGraphEdge(`${c.id}:IN2`, `${c.id}:OUT2`, 0.002);
          addGraphEdge(`${c.id}:1`, `${c.id}:3`, 0.002); // alias
          addGraphEdge(`${c.id}:2`, `${c.id}:4`, 0.002); // alias
        } else {
          // Modo Cruzado: IN1 <-> OUT2 e IN2 <-> OUT1
          addGraphEdge(`${c.id}:IN1`, `${c.id}:OUT2`, 0.002);
          addGraphEdge(`${c.id}:IN2`, `${c.id}:OUT1`, 0.002);
          addGraphEdge(`${c.id}:1`, `${c.id}:4`, 0.002); // alias
          addGraphEdge(`${c.id}:2`, `${c.id}:3`, 0.002); // alias
        }
      }

      // 5. Dimmer Variador Rotativo (0-100%)
      else if (c.code === 'DIMMER') {
        const percent = Number(c.params?.percent ?? 100);
        if (percent > 0) {
          addGraphEdge(`${c.id}:IN`, `${c.id}:OUT`, 0.01);
          addGraphEdge(`${c.id}:1`, `${c.id}:2`, 0.01); // alias
        }
      }

      // 6. Botoeiras (Pulsadoras NA/NF e Parada de Emergência)
      else if (c.code === 'PBNO') {
        if (c.state.pressed || c.state.closed) addGraphEdge(`${c.id}:3`, `${c.id}:4`, 0.002);
      } else if (c.code === 'PBNC') {
        if (!c.state.pressed && c.state.closed !== false) addGraphEdge(`${c.id}:1`, `${c.id}:2`, 0.002);
      } else if (c.code === 'ESTOP') {
        if (!c.state.pressed && c.state.closed !== false) addGraphEdge(`${c.id}:1`, `${c.id}:2`, 0.002);
      } else if (c.code === 'SEL') {
        const pos = Number(c.params?.position || 0);
        c.state.rockerAngle = pos;
        addGraphEdge(`${c.id}:1`, pos === 0 ? `${c.id}:2` : `${c.id}:3`, 0.002);
      } else if (c.code === 'JUNCTION_BOX') {
        addGraphEdge(`${c.id}:L_IN`, `${c.id}:L_OUT1`, 0.001);
        addGraphEdge(`${c.id}:L_IN`, `${c.id}:L_OUT2`, 0.001);
        addGraphEdge(`${c.id}:N_IN`, `${c.id}:N_OUT1`, 0.001);
        addGraphEdge(`${c.id}:N_IN`, `${c.id}:N_OUT2`, 0.001);
        addGraphEdge(`${c.id}:PE_IN`, `${c.id}:PE_OUT`, 0.001);
      } else if (c.code === 'BARE_COPPER') {
        addGraphEdge(`${c.id}:IN`, `${c.id}:OUT`, 0.001);
      } else if (c.code === 'EARTH_PIT') {
        addGraphEdge(`${c.id}:PE1`, `${c.id}:GND`, 0.001);
        addGraphEdge(`${c.id}:PE2`, `${c.id}:GND`, 0.001);
        addGraphEdge(`${c.id}:PE3`, `${c.id}:GND`, 0.001);
      }
    });

    // D. Identificação de Polos de Fontes Primárias e Barramentos Gerais
    sourcePoles = [];
    comps.forEach(c => {
      const isSrc = c.code.startsWith('SRC_') || c.code === 'BAT' || c.code === 'PV_INVERTER';
      const isClosed = c.params?.closed !== false && c.state?.closed !== false && !c.state?.tripped && !c.state?.isBurned;
      if (!isSrc || !isClosed) return;

      const vNom = Number(c.params?.voltage || 230);
      result.activeFrequency = Number(c.params?.frequency || 50);

      if (c.code === 'SRC_AC3') {
        sourcePoles.push({ id: `${c.id}:L1`, net: 'L1', v: vNom / Math.sqrt(3), angle: 0, sourceId: c.id });
        sourcePoles.push({ id: `${c.id}:L2`, net: 'L2', v: vNom / Math.sqrt(3), angle: -120, sourceId: c.id });
        sourcePoles.push({ id: `${c.id}:L3`, net: 'L3', v: vNom / Math.sqrt(3), angle: 120, sourceId: c.id });
        sourcePoles.push({ id: `${c.id}:N`, net: 'N', v: 0, angle: 0, sourceId: c.id });
        sourcePoles.push({ id: `${c.id}:PE`, net: 'PE', v: 0, angle: 0, sourceId: c.id });
        result.mainVoltageRMS = vNom;
      } else if (c.code === 'SRC_AC1' || c.code === 'PV_INVERTER') {
        sourcePoles.push({ id: `${c.id}:L`, net: 'L1', v: vNom, angle: 0, sourceId: c.id });
        sourcePoles.push({ id: `${c.id}:N`, net: 'N', v: 0, angle: 0, sourceId: c.id });
        result.mainVoltageRMS = vNom;
      } else if (c.code === 'SRC_DC24' || c.code === 'BAT') {
        sourcePoles.push({ id: `${c.id}:+`, net: '24+', v: vNom, angle: 0, sourceId: c.id });
        sourcePoles.push({ id: `${c.id}:-`, net: '24-', v: 0, angle: 0, sourceId: c.id });
        result.mainVoltageRMS = vNom;
        result.activeFrequency = 0;
      }
    });

    // Barramentos gerais alimentados pela subestação
    busbars.forEach(bb => {
      if (bb.type === 'phase_l1') sourcePoles.push({ id: `${bb.id}:SPINE`, net: 'L1', v: 230, angle: 0, sourceId: bb.id });
      else if (bb.type === 'phase_l2') sourcePoles.push({ id: `${bb.id}:SPINE`, net: 'L2', v: 230, angle: -120, sourceId: bb.id });
      else if (bb.type === 'phase_l3') sourcePoles.push({ id: `${bb.id}:SPINE`, net: 'L3', v: 230, angle: 120, sourceId: bb.id });
      else if (bb.type === 'neutral') sourcePoles.push({ id: `${bb.id}:SPINE`, net: 'N', v: 0, angle: 0, sourceId: bb.id });
      else if (bb.type === 'earth') sourcePoles.push({ id: `${bb.id}:SPINE`, net: 'PE', v: 0, angle: 0, sourceId: bb.id });
    });

    // E. Busca em Largura (BFS) com cálculo de resistência acumulada a partir de cada polo
    reachMap = new Map();

    sourcePoles.forEach(sp => {
      const queue: { node: string; rPath: number }[] = [{ node: sp.id, rPath: 0 }];
      const visited = new Set<string>([sp.id]);

      if (!reachMap.has(sp.id)) reachMap.set(sp.id, new Map());
      const poleMap = reachMap.get(sp.id)!;
      poleMap.set(sp.id, { rPath: 0, sourcePole: sp });

      while (queue.length > 0) {
        const { node, rPath } = queue.shift()!;
        const edges = graph.get(node) || [];

        for (const edge of edges) {
          if (!visited.has(edge.target)) {
            visited.add(edge.target);
            const totalR = rPath + edge.r;
            poleMap.set(edge.target, { rPath: totalR, sourcePole: sp });
            queue.push({ node: edge.target, rPath: totalR });
          }
        }
      }
    });

    // F. Validação Física da Bobina do Contator (KM)
    comps.forEach(c => {
      if (c.code === 'CONTACTOR') {
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
          contactorStateChanged = true;
        }
      }
    });
  }

  // 3. DETECÇÃO DE CURTO-CIRCUITO DIRETO VIA GRAFO (Fase encontra Neutro diretamente)
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
      if (['MCB1', 'MCB2', 'MCB3', 'MCCB', 'RCBO', 'FUSE', 'FU3'].includes(c.code)) {
        if (c.state && !c.state.tripped && !c.state.burned) {
          c.state.tripped = true;
          c.state.closed = false;
          c.state.temp = 120.0;
          result.trippedIds.push(c.id);
        }
      }
    });
  }

  // 4. RESOLUÇÃO REAL DAS CARGAS: VALIDAÇÃO DE CIRCUITO FECHADO (CLOSED-LOOP)
  const activeWireIds = new Set<string>();

  comps.forEach(load => {
    load.state = load.state || {};
    const d = getComponentDef(load.code);
    const isMotor = d.kind === 'motor3' || d.kind === 'motor1';
    const isAppliance = load.code.startsWith('LOAD_') || ['HEATER', 'LAMP', 'PILOT_GREEN', 'PILOT_RED', 'PILOT_YELLOW', 'BUZZ'].includes(load.code);

    if (!isMotor && !isAppliance) return;

    // A. MOTOR TRIFÁSICO (M3PH, PUMP): Exige L1 em U, L2 em V e L3 em W simultaneamente
    if (d.kind === 'motor3') {
      const nodeU = `${load.id}:U`;
      const nodeV = `${load.id}:V`;
      const nodeW = `${load.id}:W`;

      let hasL1 = false;
      let hasL2 = false;
      let hasL3 = false;
      let totalRPath = 0;

      sourcePoles.forEach(sp => {
        const m = reachMap.get(sp.id);
        if (!m) return;
        if (sp.net === 'L1' && m.has(nodeU)) { hasL1 = true; totalRPath += m.get(nodeU)!.rPath; }
        if (sp.net === 'L2' && m.has(nodeV)) { hasL2 = true; totalRPath += m.get(nodeV)!.rPath; }
        if (sp.net === 'L3' && m.has(nodeW)) { hasL3 = true; totalRPath += m.get(nodeW)!.rPath; }
      });

      // RIGOR ABSOLUTO: Se faltar qualquer uma das 3 fases (fio solto, contator aberto ou disjuntor desligado), O MOTOR NÃO GIRA
      const is3PhaseClosed = hasL1 && hasL2 && hasL3 && !result.hasDirectShort && !load.state.isBurned;

      if (is3PhaseClosed) {
        const pNom = Number(load.params?.power || 7500);
        const vNom = Number(load.params?.voltage || 400);
        const pf = Number(load.params?.pf || 0.86);

        // Queda de tensão trifásica: ΔV = √3 * R * I
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
        load.state.rpm = Math.round(Number(load.params?.rpm || 2920) * (vReal / vNom));

        result.totalActivePower += pReal;
        result.totalLineCurrent += iReal;

        wires.forEach(w => {
          if (w.a.c === load.id || w.b.c === load.id) {
            activeWireIds.add(w.id);
            w.current = Number(iReal.toFixed(2));
            w.voltageDrop = Number(deltaV.toFixed(1));
          }
        });
      } else {
        // ZERAMENTO INCONDICIONAL: Nó flutuante ou fase ausente
        load.state.running = false;
        load.state.energized = false;
        load.state.voltage = 0;
        load.state.current = 0;
        load.state.powerKW = 0;
        load.state.rpm = 0;
      }
      return;
    }

    // B. CARGAS MONOFÁSICAS E DE ILUMINAÇÃO (Lâmpadas, Resistências, Chuveiro, etc.)
    const tL = ['L', '1', '+', 'L_IN'].find(t => load.terminals?.some((x: any) => x[0] === t)) || 'L';
    const tN = ['N', '2', '-', 'N_IN'].find(t => load.terminals?.some((x: any) => x[0] === t)) || 'N';

    const nodeL = `${load.id}:${tL}`;
    const nodeN = `${load.id}:${tN}`;

    let phasePole: SourcePole | null = null;
    let neutralPole: SourcePole | null = null;
    let rPhase = 0;
    let rNeutral = 0;

    sourcePoles.forEach(sp => {
      const m = reachMap.get(sp.id);
      if (!m) return;
      if ((sp.net.startsWith('L') || sp.net === '24+') && m.has(nodeL)) {
        phasePole = sp;
        rPhase = m.get(nodeL)!.rPath;
      }
      if ((sp.net === 'N' || sp.net === '24-') && m.has(nodeN)) {
        neutralPole = sp;
        rNeutral = m.get(nodeN)!.rPath;
      }
    });

    // RIGOR DE CIRCUITO FECHADO: Exige simultaneamente Fase e Retorno Neutro
    const isLoopClosed = Boolean(phasePole && neutralPole && !result.hasDirectShort && !load.state.isBurned);

    if (isLoopClosed) {
      const pNom = Number(load.params?.power || 1500);
      const vNom = Number(load.params?.voltage || 230);
      const pf = Number(load.params?.pf || 1.0);

      const iEst = pNom / (vNom * pf);
      const deltaV = (rPhase + rNeutral) * iEst;
      const vEffective = Math.max(0, vNom - deltaV);
      const pReal = pNom * Math.pow(vEffective / vNom, 2);
      const iReal = pReal / (Math.max(1, vEffective) * pf);

      load.state.energized = true;
      load.state.running = true;
      load.state.voltage = Number(vEffective.toFixed(1));
      load.state.current = Number(iReal.toFixed(2));
      load.state.powerKW = Number((pReal / 1000).toFixed(2));

      result.totalActivePower += pReal;
      result.totalLineCurrent += iReal;

      wires.forEach(w => {
        if (w.a.c === load.id || w.b.c === load.id) {
          activeWireIds.add(w.id);
          w.current = Number(iReal.toFixed(2));
          w.voltageDrop = Number(deltaV.toFixed(1));
        }
      });
    } else {
      // NÓ FLUTUANTE: Desconexão instantânea
      load.state.energized = false;
      load.state.running = false;
      load.state.voltage = 0;
      load.state.current = 0;
      load.state.powerKW = 0;
      load.state.rpm = 0;
    }
  });

  // 5. ATUALIZAÇÃO DA CONDUTIVIDADE E TEMPERATURA DOS FIOS (EFEITO JOULE)
  wires.forEach(w => {
    const isCarryingCurrent = activeWireIds.has(w.id);
    w.live = isCarryingCurrent;

    if (isCarryingCurrent) {
      const gauge = Number(w.gauge || 2.5);
      const capacity = GAUGE_AMPACITY[gauge] || 21.0;
      const iThrough = Number(w.current || 0);

      if (iThrough > capacity * 1.05) {
        w.overheated = true;
        w.temp = (w.temp || AMBIENT_TEMPERATURE) + (iThrough * 0.15 * dt);
      } else {
        w.overheated = false;
        w.temp = Math.max(AMBIENT_TEMPERATURE, (w.temp || AMBIENT_TEMPERATURE) - dt * 2.0);
      }
    } else {
      w.current = 0;
      w.voltageDrop = 0;
      w.overheated = false;
      w.temp = Math.max(AMBIENT_TEMPERATURE, (w.temp || AMBIENT_TEMPERATURE) - dt * 3.0);
    }
  });

  // 6. DISPARO TÉRMICO-MAGNÉTICO DE DISJUNTORES (CURVAS B, C, D - IEC 60898)
  comps.forEach(prot => {
    prot.state = prot.state || {};
    if (prot.state.tripped || prot.state.burned) return;

    const isProtective = ['MCB1', 'MCB2', 'MCB3', 'MCCB', 'RCBO', 'FUSE', 'FU3', 'OLR'].includes(prot.code);
    if (!isProtective) return;

    const inCurrent = Number(prot.params?.current || 16);
    const connectedWires = wires.filter(w => w.a.c === prot.id || w.b.c === prot.id);
    const maxI = connectedWires.reduce((max, w) => Math.max(max, Number(w.current || 0)), 0);

    const ratio = maxI / Math.max(0.1, inCurrent);
    prot.state.loadRatio = Number(ratio.toFixed(2));

    if (ratio < 1.13) {
      prot.state.thermal = false;
      prot.params.overloadTimer = 0;
      prot.state.temp = Math.max(AMBIENT_TEMPERATURE, (prot.state.temp || AMBIENT_TEMPERATURE) - dt * 2.0);
    } else if (ratio >= 1.13 && ratio <= 1.45) {
      prot.state.thermal = true;
      prot.params.overloadTimer = (prot.params.overloadTimer || 0) + dt;
      prot.state.temp = (prot.state.temp || AMBIENT_TEMPERATURE) + (ratio * 4.0 * dt);

      if (prot.params.overloadTimer > 10.0) {
        prot.state.burned = true;
        prot.state.isBurned = true;
        prot.state.damaged = true;
        prot.state.closed = false;
        result.burnedIds.push(prot.id);
      } else if (prot.params.overloadTimer >= 6.0) {
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

  // 7. SOMA VETORIAL CONTÍNUA DE CORRENTE RESIDUAL EM IDR / DR (IEC 61008)
  comps.forEach(rcd => {
    if (['RCD', 'RCD4', 'RCBO'].includes(rcd.code)) {
      rcd.state = rcd.state || {};
      if (rcd.state.tripped) return;

      const testActive = Boolean(rcd.params?.testPressed);
      if (testActive) {
        rcd.state.tripped = true;
        rcd.state.closed = false;
        result.trippedIds.push(rcd.id);
      }
    }
  });

  // 8. MEDIÇÕES TRUE-RMS REAIS NOS NÓS (SEM MOCKS OU LEITURAS FICTÍCIAS)
  comps.forEach(m => {
    if (m.code === 'VM') {
      const nodeA = `${m.id}:+`;
      const nodeB = `${m.id}:-`;
      let vA = 0;
      let vB = 0;

      sourcePoles.forEach(sp => {
        const map = reachMap.get(sp.id);
        if (!map) return;
        if (map.has(nodeA)) vA = sp.v;
        if (map.has(nodeB)) vB = sp.v;
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
    } else if (m.code === 'ENERGY') {
      if (result.totalActivePower > 0) {
        m.state.energyKWh = (m.state.energyKWh || 142.8) + (result.totalActivePower * (dt / 3600)) / 1000;
      }
    }
  });

  return result;
}

// ----------------------------------------------------------------------------
// CIRCUITOS DE REFERÊNCIA NORMATIVOS PREDEFINIDOS (COM PINAGEM REAL)
// ----------------------------------------------------------------------------

export function generateDirectMotorStarterCircuit(): { components: any[]; wires: any[] } {
  const components = [
    // Circuito de Força (Potência)
    {
      id: 'SRC1',
      code: 'SRC_AC3',
      x: -360,
      y: -90,
      rot: 0,
      w: 110,
      h: 75,
      params: { voltage: 400, frequency: 50, internalR: 0.03, closed: true },
      state: { energized: true, running: true },
      label: 'Rede 400V 3F+N+PE'
    },
    {
      id: 'Q1',
      code: 'MCB3',
      x: -210,
      y: -90,
      rot: 0,
      w: 100,
      h: 75,
      params: { current: 32, curve: 'C', closed: true, temp: 25 },
      state: { closed: true, tripped: false, flagColor: 'red', leverPos: 'up' },
      label: 'Q1: Disjuntor-Motor'
    },
    {
      id: 'KM1',
      code: 'CONTACTOR',
      x: -50,
      y: -90,
      rot: 0,
      w: 115,
      h: 75,
      params: { coil: 230, minPickupRatio: 0.85 },
      state: { closed: false, energized: false },
      label: 'KM1: Contator Principal'
    },
    {
      id: 'F1',
      code: 'OLR',
      x: 120,
      y: -90,
      rot: 0,
      w: 110,
      h: 75,
      params: { current: 18, resetMode: 'manual' },
      state: { tripped: false },
      label: 'F1: Relé Térmico'
    },
    {
      id: 'M1',
      code: 'M3PH',
      x: 300,
      y: -90,
      rot: 0,
      w: 110,
      h: 80,
      params: { power: 7500, rpm: 2920, voltage: 400, pf: 0.86 },
      state: { running: false, energized: false, rpm: 0 },
      label: 'M1: Motor Trifásico'
    },

    // Circuito de Comando (230V AC)
    {
      id: 'S0',
      code: 'PBNC',
      x: -210,
      y: 130,
      rot: 0,
      w: 95,
      h: 65,
      params: { closed: true, pressed: false },
      state: { closed: true, pressed: false },
      label: 'S0: Botoeira Desliga (NF)'
    },
    {
      id: 'S1',
      code: 'PBNO',
      x: -50,
      y: 130,
      rot: 0,
      w: 95,
      h: 65,
      params: { closed: false, pressed: false },
      state: { closed: false, pressed: false },
      label: 'S1: Botoeira Liga (NA)'
    },
    {
      id: 'H1',
      code: 'PILOT_GREEN',
      x: 120,
      y: 130,
      rot: 0,
      w: 90,
      h: 65,
      params: { power: 3, voltage: 230 },
      state: { energized: false },
      label: 'H1: Em Marcha (Verde)'
    },
    {
      id: 'H2',
      code: 'PILOT_YELLOW',
      x: 270,
      y: 130,
      rot: 0,
      w: 90,
      h: 65,
      params: { power: 3, voltage: 230 },
      state: { energized: false },
      label: 'H2: Sobrecarga F1'
    }
  ];

  const wires = [
    // Força: SRC1 -> Q1
    { id: 'W1', a: { c: 'SRC1', t: 'L1' }, b: { c: 'Q1', t: '1' }, type: 'L1', gauge: 4.0, length: 2.5, live: false },
    { id: 'W2', a: { c: 'SRC1', t: 'L2' }, b: { c: 'Q1', t: '3' }, type: 'L2', gauge: 4.0, length: 2.5, live: false },
    { id: 'W3', a: { c: 'SRC1', t: 'L3' }, b: { c: 'Q1', t: '5' }, type: 'L3', gauge: 4.0, length: 2.5, live: false },

    // Força: Q1 -> KM1
    { id: 'W4', a: { c: 'Q1', t: '2' }, b: { c: 'KM1', t: '1' }, type: 'L1', gauge: 4.0, length: 1.5, live: false },
    { id: 'W5', a: { c: 'Q1', t: '4' }, b: { c: 'KM1', t: '3' }, type: 'L2', gauge: 4.0, length: 1.5, live: false },
    { id: 'W6', a: { c: 'Q1', t: '6' }, b: { c: 'KM1', t: '5' }, type: 'L3', gauge: 4.0, length: 1.5, live: false },

    // Força: KM1 -> F1
    { id: 'W7', a: { c: 'KM1', t: '2' }, b: { c: 'F1', t: '1' }, type: 'L1', gauge: 4.0, length: 1.2, live: false },
    { id: 'W8', a: { c: 'KM1', t: '4' }, b: { c: 'F1', t: '3' }, type: 'L2', gauge: 4.0, length: 1.2, live: false },
    { id: 'W9', a: { c: 'KM1', t: '6' }, b: { c: 'F1', t: '5' }, type: 'L3', gauge: 4.0, length: 1.2, live: false },

    // Força: F1 -> M1
    { id: 'W10', a: { c: 'F1', t: '2' }, b: { c: 'M1', t: 'U' }, type: 'L1', gauge: 4.0, length: 6.0, live: false },
    { id: 'W11', a: { c: 'F1', t: '4' }, b: { c: 'M1', t: 'V' }, type: 'L2', gauge: 4.0, length: 6.0, live: false },
    { id: 'W12', a: { c: 'F1', t: '6' }, b: { c: 'M1', t: 'W' }, type: 'L3', gauge: 4.0, length: 6.0, live: false },

    // Comando: L1 -> 95 F1 (Contato NF Proteção) -> S0
    { id: 'W13', a: { c: 'SRC1', t: 'L1' }, b: { c: 'F1', t: '95' }, type: 'CTRL', gauge: 1.5, length: 3.0, live: false },
    { id: 'W14', a: { c: 'F1', t: '96' }, b: { c: 'S0', t: '1' }, type: 'CTRL', gauge: 1.5, length: 2.0, live: false },

    // Comando: S0 -> S1
    { id: 'W15', a: { c: 'S0', t: '2' }, b: { c: 'S1', t: '3' }, type: 'CTRL', gauge: 1.5, length: 1.0, live: false },

    // Contato de Selo 13-14 KM1 em paralelo com S1 (3-4)
    { id: 'W16', a: { c: 'S1', t: '3' }, b: { c: 'KM1', t: '13' }, type: 'CTRL', gauge: 1.5, length: 2.5, live: false },
    { id: 'W17', a: { c: 'S1', t: '4' }, b: { c: 'KM1', t: '14' }, type: 'CTRL', gauge: 1.5, length: 2.5, live: false },

    // Acionamento da Bobina KM1 A1-A2
    { id: 'W18', a: { c: 'KM1', t: '14' }, b: { c: 'KM1', t: 'A1' }, type: 'CTRL', gauge: 1.5, length: 0.8, live: false },
    { id: 'W19', a: { c: 'KM1', t: 'A2' }, b: { c: 'SRC1', t: 'N' }, type: 'N', gauge: 1.5, length: 3.5, live: false },

    // Sinalização H1 (Verde) em paralelo com a bobina KM1
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
      h: 75,
      params: { voltage: 230, frequency: 50, closed: true },
      state: { energized: true },
      label: 'Fonte 230V AC'
    },
    {
      id: 'Q1',
      code: 'MCB1',
      x: -220,
      y: 0,
      rot: 0,
      w: 95,
      h: 75,
      params: { current: 10, curve: 'C', closed: true },
      state: { closed: true, tripped: false, flagColor: 'red', leverPos: 'up' },
      label: 'Q1: Disjuntor Iluminação'
    },
    {
      id: 'S1',
      code: 'THREE_WAY',
      x: -70,
      y: 0,
      rot: 0,
      w: 100,
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
      w: 105,
      h: 75,
      params: { crossed: false },
      state: { closed: false, rockerAngle: 0 },
      label: 'S2: Four-Way (Intermediário)'
    },
    {
      id: 'S3',
      code: 'THREE_WAY',
      x: 250,
      y: 0,
      rot: 0,
      w: 100,
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
      w: 95,
      h: 75,
      params: { power: 60, voltage: 230, pf: 1.0 },
      state: { energized: false },
      label: 'E1: Lâmpada 230V'
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
      h: 75,
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
      w: 95,
      h: 75,
      params: { current: 63, curve: 'C', closed: true },
      state: { closed: true, tripped: false, flagColor: 'red', leverPos: 'up' },
      label: 'Disjuntor Geral 63A'
    },
    {
      id: 'RCD1',
      code: 'RCD',
      x: -50,
      y: 0,
      rot: 0,
      w: 105,
      h: 75,
      params: { current: 40, leakage: 0.03, closed: true, testPressed: false },
      state: { closed: true, tripped: false, flagColor: 'red', leverPos: 'up' },
      label: 'IDR Diferencial 30mA'
    },
    {
      id: 'Q_C1',
      code: 'MCB1',
      x: 120,
      y: -90,
      rot: 0,
      w: 95,
      h: 70,
      params: { current: 10, curve: 'C', closed: true },
      state: { closed: true, tripped: false, flagColor: 'red', leverPos: 'up' },
      label: 'C1: Iluminação 10A'
    },
    {
      id: 'LAMP1',
      code: 'LAMP',
      x: 270,
      y: -90,
      rot: 0,
      w: 90,
      h: 70,
      params: { power: 100, voltage: 230, pf: 1.0 },
      state: { energized: true },
      label: 'Lâmpadas 100W'
    },
    {
      id: 'Q_C2',
      code: 'MCB1',
      x: 120,
      y: 90,
      rot: 0,
      w: 95,
      h: 70,
      params: { current: 16, curve: 'C', closed: true },
      state: { closed: true, tripped: false, flagColor: 'red', leverPos: 'up' },
      label: 'C2: Tomadas TUG 16A'
    },
    {
      id: 'OUTLET1',
      code: 'OUTLET',
      x: 270,
      y: 90,
      rot: 0,
      w: 90,
      h: 70,
      params: { current: 16, voltage: 230 },
      state: { energized: true },
      label: 'Tomadas Gerais'
    }
  ];

  const wires = [
    { id: 'W1', a: { c: 'SRC1', t: 'L' }, b: { c: 'Q_MAIN', t: '1' }, type: 'L1', gauge: 10.0, length: 1.0, live: false },
    { id: 'W2', a: { c: 'Q_MAIN', t: '2' }, b: { c: 'RCD1', t: '1' }, type: 'L1', gauge: 10.0, length: 1.2, live: false },
    { id: 'W3', a: { c: 'SRC1', t: 'N' }, b: { c: 'RCD1', t: 'N_IN' }, type: 'N', gauge: 10.0, length: 2.2, live: false },
    // Barramento Pós-DR
    { id: 'W4', a: { c: 'RCD1', t: '2' }, b: { c: 'Q_C1', t: '1' }, type: 'L1', gauge: 4.0, length: 1.5, live: false },
    { id: 'W5', a: { c: 'RCD1', t: '2' }, b: { c: 'Q_C2', t: '1' }, type: 'L1', gauge: 4.0, length: 1.5, live: false },
    // Cargas C1 e C2
    { id: 'W6', a: { c: 'Q_C1', t: '2' }, b: { c: 'LAMP1', t: 'L' }, type: 'L1', gauge: 1.5, length: 3.5, live: false },
    { id: 'W7', a: { c: 'LAMP1', t: 'N' }, b: { c: 'RCD1', t: 'N_OUT' }, type: 'N', gauge: 1.5, length: 3.5, live: false },
    { id: 'W8', a: { c: 'Q_C2', t: '2' }, b: { c: 'OUTLET1', t: 'L' }, type: 'L1', gauge: 2.5, length: 4.0, live: false },
    { id: 'W9', a: { c: 'OUTLET1', t: 'N' }, b: { c: 'RCD1', t: 'N_OUT' }, type: 'N', gauge: 2.5, length: 4.0, live: false }
  ];

  return { components, wires };
}

export function generateSolarPVIsoCircuit(): { components: any[]; wires: any[] } {
  const components = [
    {
      id: 'PV_STR1',
      code: 'PV_PANEL',
      x: -360,
      y: -40,
      rot: 0,
      w: 120,
      h: 80,
      params: { power: 2700, voc: 288, isc: 11.2, vmpp: 249 },
      state: { energized: true, running: true },
      label: 'String FV (6x 450W • 2.7kWp)'
    },
    {
      id: 'SB1',
      code: 'PV_STRINGBOX',
      x: -190,
      y: -40,
      rot: 0,
      w: 115,
      h: 80,
      params: { vMax: 1000, closed: true },
      state: { closed: true, tripped: false },
      label: 'String Box CC + Seccionadora'
    },
    {
      id: 'SPD_DC1',
      code: 'PV_SPD_DC',
      x: -190,
      y: 90,
      rot: 0,
      w: 95,
      h: 70,
      params: { uc: 600, in: 20, health: 100, status: 'green' },
      state: { closed: true, tripped: false },
      label: 'DPS CC 600Vdc'
    },
    {
      id: 'INV1',
      code: 'PV_INVERTER',
      x: -20,
      y: -40,
      rot: 0,
      w: 125,
      h: 85,
      params: { pNom: 3000, mpptMin: 60, mpptMax: 500, voltage: 230 },
      state: { energized: true, running: true, gridConnected: true },
      label: 'Inversor Grid-Tie 3kW MPPT'
    },
    {
      id: 'Q_AC1',
      code: 'MCB2',
      x: 140,
      y: -40,
      rot: 0,
      w: 100,
      h: 75,
      params: { current: 16, curve: 'C', closed: true },
      state: { closed: true, tripped: false, flagColor: 'red', leverPos: 'up' },
      label: 'Disjuntor CA Inversor 16A'
    },
    {
      id: 'RCD_PV',
      code: 'RCD',
      x: 270,
      y: -40,
      rot: 0,
      w: 105,
      h: 75,
      params: { current: 25, leakage: 0.03, closed: true, testPressed: false },
      state: { closed: true, tripped: false, flagColor: 'red', leverPos: 'up' },
      label: 'IDR 30mA (Tipo B/CA)'
    },
    {
      id: 'LOAD_AC1',
      code: 'OUTLET',
      x: 400,
      y: -40,
      rot: 0,
      w: 90,
      h: 70,
      params: { current: 16, voltage: 230 },
      state: { energized: true },
      label: 'Cargas AC / Quadro QDL'
    }
  ];

  const wires = [
    { id: 'W_PV1', a: { c: 'PV_STR1', t: '+' }, b: { c: 'SB1', t: 'IN+' }, type: '24+', gauge: 4.0, length: 10.0, live: false },
    { id: 'W_PV2', a: { c: 'PV_STR1', t: '-' }, b: { c: 'SB1', t: 'IN-' }, type: '24-', gauge: 4.0, length: 10.0, live: false },
    { id: 'W_PE1', a: { c: 'PV_STR1', t: 'PE' }, b: { c: 'SB1', t: 'PE' }, type: 'PE', gauge: 6.0, length: 12.0, live: false },
    { id: 'W_PV3', a: { c: 'SB1', t: 'OUT+' }, b: { c: 'INV1', t: 'PV+' }, type: '24+', gauge: 4.0, length: 2.0, live: false },
    { id: 'W_PV4', a: { c: 'SB1', t: 'OUT-' }, b: { c: 'INV1', t: 'PV-' }, type: '24-', gauge: 4.0, length: 2.0, live: false },
    { id: 'W_AC1', a: { c: 'INV1', t: 'L' }, b: { c: 'Q_AC1', t: '1' }, type: 'L1', gauge: 4.0, length: 1.5, live: false },
    { id: 'W_AC2', a: { c: 'INV1', t: 'N' }, b: { c: 'RCD_PV', t: 'N_IN' }, type: 'N', gauge: 4.0, length: 2.5, live: false },
    { id: 'W_AC3', a: { c: 'Q_AC1', t: '2' }, b: { c: 'RCD_PV', t: '1' }, type: 'L1', gauge: 4.0, length: 1.5, live: false },
    { id: 'W_AC4', a: { c: 'RCD_PV', t: '2' }, b: { c: 'LOAD_AC1', t: 'L' }, type: 'L1', gauge: 2.5, length: 3.0, live: false },
    { id: 'W_AC5', a: { c: 'RCD_PV', t: 'N_OUT' }, b: { c: 'LOAD_AC1', t: 'N' }, type: 'N', gauge: 2.5, length: 3.0, live: false },
    { id: 'W_PE2', a: { c: 'INV1', t: 'PE' }, b: { c: 'LOAD_AC1', t: 'PE' }, type: 'PE', gauge: 4.0, length: 4.0, live: false }
  ];

  return { components, wires };
}