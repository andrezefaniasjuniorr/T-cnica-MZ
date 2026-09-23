// ============================================================================
// TÉCNICAMZ PRO — MOTOR CAD ELÉTRICO, AUTOMAÇÃO & SIMULAÇÃO INDUSTRIAL (V11)
// Conforme normas IEC 60947 (Aparelhagem de Baixa Tensão) e IEC 60364 (Instalações Elétricas)
// ============================================================================

export interface TerminalDef {
  0: string; // Terminal ID (ex: '1', '2', 'A1', 'A2', 'L1', 'U', etc.)
  1: string; // Terminal Function: 'IN' | 'OUT' | 'COIL' | 'COM' | 'NO' | 'NC' | 'PWR' | 'PE' | 'A' | 'B' | 'C' | 'G' | 'D' | 'S' | 'K' | 'AUX' | 'DATA'
  2: string; // Terminal Default Net Wire Type: 'L1' | 'L2' | 'L3' | 'N' | 'PE' | '24+' | '24-' | 'CTRL'
}

export interface Busbar {
  id: string;
  type: 'din' | 'phase_l1' | 'phase_l2' | 'phase_l3' | 'neutral' | 'earth';
  x: number;
  y: number;
  length: number;
  orientation: 'horizontal' | 'vertical';
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

export const COMPONENT_CATALOG: ComponentDef[] = [
  // SISTEMAS SOLARES FOTOVOLTAICOS (CC / CA)
  {
    code: 'PV_PANEL',
    name: 'Painel Fotovoltaico Monocristalino (450W / Voc 48V)',
    cat: 'solar',
    icon: '☀️',
    terminals: [['+', 'PWR', '24+'], ['-', 'PWR', '24-'], ['PE', 'PE', 'PE']],
    kind: 'pv_panel',
    params: { power: 450, voc: 48, isc: 11.2, vmpp: 41.5, impp: 10.8 }
  },
  {
    code: 'PV_STRINGBOX',
    name: 'String Box CC Fotovoltaica (DPS CC + Seccionadora 1000V)',
    cat: 'solar',
    icon: '📦',
    terminals: [
      ['IN+', 'IN', '24+'], ['IN-', 'IN', '24-'],
      ['OUT+', 'OUT', '24+'], ['OUT-', 'OUT', '24-'],
      ['PE', 'PE', 'PE']
    ],
    kind: 'stringbox',
    params: { vMax: 1000, spdClass: 'Type II CC' }
  },
  {
    code: 'PV_INVERTER',
    name: 'Inversor Solar On-Grid MPPT 3.0kW (230V CA)',
    cat: 'solar',
    icon: '⚡',
    terminals: [
      ['PV+', 'IN', '24+'], ['PV-', 'IN', '24-'],
      ['L', 'OUT', 'L1'], ['N', 'OUT', 'N'], ['PE', 'PE', 'PE']
    ],
    kind: 'pv_inverter',
    params: { mpptMin: 60, mpptMax: 500, pNom: 3000, eff: 0.975 }
  },
  {
    code: 'PV_SPD_DC',
    name: 'DPS Fotovoltaico CC (Dispositivo Contra Surtos 600Vdc)',
    cat: 'solar',
    icon: '⚡',
    terminals: [['+', 'IN', '24+'], ['-', 'IN', '24-'], ['PE', 'PE', 'PE']],
    kind: 'spd_dc',
    params: { uc: 600, in: 20 }
  },
  {
    code: 'PHOTO_CELL',
    name: 'Sensor Crepuscular / Fotocélula (10A 230V)',
    cat: 'automation',
    icon: '🌓',
    terminals: [['L', 'PWR', 'L1'], ['N', 'PWR', 'N'], ['LOAD', 'OUT', 'L1']],
    kind: 'sensor',
    params: { luxThreshold: 15, delay: 2 }
  },

  // FONTES E ALIMENTAÇÃO
  {
    code: 'SRC_AC1',
    name: 'Fonte Monofásica (230V / 50Hz)',
    cat: 'sources',
    icon: '⌁',
    terminals: [['L', 'OUT', 'L1'], ['N', 'OUT', 'N']],
    kind: 'source',
    params: { voltage: 230, frequency: 50 },
    sourceType: 'AC'
  },
  {
    code: 'SRC_AC3',
    name: 'Rede Trifásica (400V / 50Hz)',
    cat: 'sources',
    icon: '⚡',
    terminals: [['L1', 'OUT', 'L1'], ['L2', 'OUT', 'L2'], ['L3', 'OUT', 'L3'], ['N', 'OUT', 'N'], ['PE', 'PE', 'PE']],
    kind: 'source',
    params: { voltage: 400, frequency: 50 },
    sourceType: 'AC3'
  },
  {
    code: 'SRC_DC24',
    name: 'Fonte CC Industrial (24V)',
    cat: 'sources',
    icon: '⎓',
    terminals: [['+', 'OUT', '24+'], ['-', 'OUT', '24-']],
    kind: 'source',
    params: { voltage: 24 },
    sourceType: 'DC'
  },
  {
    code: 'BAT',
    name: 'Bateria Chumbo-Ácido (12V)',
    cat: 'sources',
    icon: '🔋',
    terminals: [['+', 'OUT', '24+'], ['-', 'OUT', '24-']],
    kind: 'source',
    params: { voltage: 12 },
    sourceType: 'DC'
  },
  {
    code: 'PSU',
    name: 'Fonte Chaveada 230V / 24Vdc',
    cat: 'sources',
    icon: '▣',
    terminals: [['L', 'IN', 'L1'], ['N', 'IN', 'N'], ['+', 'OUT', '24+'], ['-', 'OUT', '24-']],
    kind: 'converter',
    params: { vin: 230, vout: 24, power: 120 }
  },
  {
    code: 'TRF',
    name: 'Transformador de Comando (230/24V)',
    cat: 'sources',
    icon: '⟂',
    terminals: [['P1', 'IN', 'L1'], ['P2', 'IN', 'N'], ['S1', 'OUT', 'CTRL'], ['S2', 'OUT', 'N']],
    kind: 'transformer',
    params: { ratio: 9.58, vsec: 24 }
  },
  {
    code: 'GND',
    name: 'Aterramento de Proteção (PE / Terra)',
    cat: 'sources',
    icon: '⏚',
    terminals: [['G', 'PE', 'PE']],
    kind: 'ground',
    params: {}
  },

  // PROTEÇÃO COM CONDUTOR DE NEUTRO (IEC 60947-2 / IEC 60898-1)
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
    params: { current: 16, curve: 'C', closed: true }
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
    params: { current: 25, curve: 'C', closed: true }
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
    params: { current: 32, curve: 'C', closed: true }
  },
  {
    code: 'MCCB',
    name: 'Disjuntor Caixa Moldada 3P+N',
    cat: 'protection',
    icon: '▰',
    terminals: [
      ['1', 'IN', 'L1'], ['2', 'OUT', 'L1'],
      ['3', 'IN', 'L2'], ['4', 'OUT', 'L2'],
      ['5', 'IN', 'L3'], ['6', 'OUT', 'L3'],
      ['N_IN', 'IN', 'N'], ['N_OUT', 'OUT', 'N']
    ],
    kind: 'breaker3',
    params: { current: 63, curve: 'C', closed: true }
  },
  {
    code: 'FUSE',
    name: 'Fusível Diazed / Cartucho',
    cat: 'protection',
    icon: '⏤',
    terminals: [['1', 'IN', 'L1'], ['2', 'OUT', 'L1']],
    kind: 'fuse',
    params: { current: 10, closed: true }
  },
  {
    code: 'FU3',
    name: 'Seccionadora com Fusíveis 3P',
    cat: 'protection',
    icon: '⏤',
    terminals: [['1', 'IN', 'L1'], ['2', 'OUT', 'L1'], ['3', 'IN', 'L2'], ['4', 'OUT', 'L2'], ['5', 'IN', 'L3'], ['6', 'OUT', 'L3']],
    kind: 'fuse3',
    params: { current: 25, closed: true }
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
    params: { current: 40, leakage: 30, closed: true }
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
    params: { current: 63, leakage: 30, closed: true }
  },
  {
    code: 'RCBO',
    name: 'Disjuntor Diferencial Residual RCBO 1P+N (30mA)',
    cat: 'protection',
    icon: '◉',
    terminals: [
      ['1', 'IN', 'L1'], ['2', 'OUT', 'L1'],
      ['N_IN', 'IN', 'N'], ['N_OUT', 'OUT', 'N']
    ],
    kind: 'rcbo',
    params: { current: 16, leakage: 30, closed: true }
  },
  {
    code: 'SPD',
    name: 'Dispositivo Contra Surtos DPS Monofásico (L+N+PE)',
    cat: 'protection',
    icon: '⚡',
    terminals: [['L', 'IN', 'L1'], ['N', 'IN', 'N'], ['PE', 'PE', 'PE']],
    kind: 'spd',
    params: { Uc: 275, In: 20 }
  },
  {
    code: 'SPD3',
    name: 'Dispositivo Contra Surtos DPS Trifásico (3P+N+PE)',
    cat: 'protection',
    icon: '⚡',
    terminals: [
      ['L1', 'IN', 'L1'], ['L2', 'IN', 'L2'], ['L3', 'IN', 'L3'],
      ['N', 'IN', 'N'], ['PE', 'PE', 'PE']
    ],
    kind: 'spd',
    params: { Uc: 440, In: 40 }
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
    params: { current: 18, resetMode: 'manual' }
  },
  {
    code: 'PHASE',
    name: 'Relé de Falta e Sequência de Fase',
    cat: 'protection',
    icon: 'ABC',
    terminals: [['L1', 'IN', 'L1'], ['L2', 'IN', 'L2'], ['L3', 'IN', 'L3'], ['N', 'IN', 'N'], ['11', 'COM', 'CTRL'], ['14', 'NO', 'CTRL'], ['12', 'NC', 'CTRL']],
    kind: 'phaseRelay',
    params: { delay: 0.5 }
  },

  // COMANDO & CHAVEAMENTO
  {
    code: 'PBNO',
    name: 'Botoeira Pulsadora NA (Verde - S1 Liga)',
    cat: 'command',
    icon: '●',
    terminals: [['3', 'IN', 'CTRL'], ['4', 'NO', 'CTRL']],
    kind: 'push',
    params: { closed: false },
    momentary: true
  },
  {
    code: 'PBNC',
    name: 'Botoeira Pulsadora NF (Vermelha - S0 Desliga)',
    cat: 'command',
    icon: '○',
    terminals: [['1', 'IN', 'CTRL'], ['2', 'NC', 'CTRL']],
    kind: 'push',
    params: { closed: true },
    momentary: true
  },
  {
    code: 'SW',
    name: 'Interruptor Simples Unipolar',
    cat: 'command',
    icon: '⏻',
    terminals: [['1', 'IN', 'L1'], ['2', 'OUT', 'L1']],
    kind: 'switch',
    params: { closed: false }
  },
  {
    code: 'THREE_WAY',
    name: 'Interruptor Paralelo (Three-Way / Escada)',
    cat: 'command',
    icon: '☵',
    terminals: [['COM', 'COM', 'L1'], ['1', 'NO', 'CTRL'], ['2', 'NC', 'CTRL']],
    kind: 'selector',
    params: { position: 0 }
  },
  {
    code: 'FOUR_WAY',
    name: 'Comutador Intermediário (Four-Way / Cruzamento)',
    cat: 'command',
    icon: '☶',
    terminals: [['1', 'IN', 'CTRL'], ['2', 'IN', 'CTRL'], ['3', 'OUT', 'CTRL'], ['4', 'OUT', 'CTRL']],
    kind: 'selector',
    params: { crossed: false }
  },
  {
    code: 'SEL',
    name: 'Seletor Man/Auto (2 Posições)',
    cat: 'command',
    icon: '◐',
    terminals: [['1', 'COM', 'CTRL'], ['2', 'NO', 'CTRL'], ['3', 'NC', 'CTRL']],
    kind: 'selector',
    params: { position: 0 }
  },
  {
    code: 'ESTOP',
    name: 'Botoeira de Emergência NF Cogumelo',
    cat: 'command',
    icon: '⛔',
    terminals: [['1', 'IN', 'CTRL'], ['2', 'NC', 'CTRL']],
    kind: 'switch',
    params: { closed: true },
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
    params: { coil: 230 }
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
    params: { coil: 230 }
  },
  {
    code: 'TIMER',
    name: 'Relé Temporizador com Retardo na Energização (TON)',
    cat: 'command',
    icon: '⏱',
    terminals: [['A1', 'COIL', 'CTRL'], ['A2', 'COIL', 'N'], ['15', 'COM', 'CTRL'], ['16', 'NC', 'CTRL'], ['18', 'NO', 'CTRL']],
    kind: 'timer',
    params: { delay: 5, mode: 'TON' }
  },
  {
    code: 'FLASH',
    name: 'Relé Intermitente Cíclico',
    cat: 'command',
    icon: '◌',
    terminals: [['A1', 'COIL', 'CTRL'], ['A2', 'COIL', 'N'], ['15', 'COM', 'CTRL'], ['18', 'NO', 'CTRL']],
    kind: 'flasher',
    params: { period: 1 }
  },
  {
    code: 'BUZZ',
    name: 'Sirene Sonora / Buzzer de Alarme',
    cat: 'command',
    icon: '🔊',
    terminals: [['+', 'IN', '24+'], ['-', 'IN', '24-']],
    kind: 'load',
    params: { power: 5 }
  },

  // MOTORES
  {
    code: 'M1PH',
    name: 'Motor Monofásico 230V CA',
    cat: 'motors',
    icon: 'M',
    terminals: [['L', 'IN', 'L1'], ['N', 'IN', 'N'], ['PE', 'PE', 'PE']],
    kind: 'motor1',
    params: { power: 750, rpm: 1450, pf: 0.82 }
  },
  {
    code: 'M3PH',
    name: 'Motor Trifásico de Indução Gaiola de Esquilo (MIT)',
    cat: 'motors',
    icon: 'M3',
    terminals: [['U', 'IN', 'L1'], ['V', 'IN', 'L2'], ['W', 'IN', 'L3'], ['PE', 'PE', 'PE']],
    kind: 'motor3',
    params: { power: 3000, rpm: 2920, voltage: 400, pf: 0.86 }
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
    params: { power: 120, rpm: 1350 }
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
    params: { distance: 5 }
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
    name: 'Voltímetro Digital RMS',
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
    name: 'Wattímetro Trifásico / Monofásico',
    cat: 'measurement',
    icon: 'W',
    terminals: [['L', 'A', 'CTRL'], ['N', 'B', 'CTRL'], ['I1', 'AUX', 'CTRL'], ['I2', 'AUX', 'CTRL']],
    kind: 'meterW',
    params: {}
  },
  {
    code: 'FREQ',
    name: 'Frequencímetro Digital',
    cat: 'measurement',
    icon: 'Hz',
    terminals: [['1', 'A', 'CTRL'], ['2', 'B', 'CTRL']],
    kind: 'meterF',
    params: {}
  },
  {
    code: 'ENERGY',
    name: 'Medidor de Energia Ativa (kWh)',
    cat: 'measurement',
    icon: 'kWh',
    terminals: [['L', 'A', 'CTRL'], ['N', 'B', 'CTRL']],
    kind: 'meterE',
    params: { energy: 0 }
  },
  {
    code: 'COS',
    name: 'Cosfímetro (Fator de Potência cos φ)',
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
    params: { power: 60, voltage: 230 }
  },
  {
    code: 'PILOT_GREEN',
    name: 'Sinaleiro Piloto Verde (Ligado)',
    cat: 'loads',
    icon: '🟢',
    terminals: [['L', 'IN', 'CTRL'], ['N', 'IN', 'N']],
    kind: 'lamp',
    params: { power: 3, voltage: 230, color: 'green' }
  },
  {
    code: 'PILOT_RED',
    name: 'Sinaleiro Piloto Vermelho (Desligado)',
    cat: 'loads',
    icon: '🔴',
    terminals: [['L', 'IN', 'CTRL'], ['N', 'IN', 'N']],
    kind: 'lamp',
    params: { power: 3, voltage: 230, color: 'red' }
  },
  {
    code: 'PILOT_YELLOW',
    name: 'Sinaleiro Piloto Amarelo (Falha Térmica)',
    cat: 'loads',
    icon: '🟡',
    terminals: [['L', 'IN', 'CTRL'], ['N', 'IN', 'N']],
    kind: 'lamp',
    params: { power: 3, voltage: 230, color: 'yellow' }
  },
  {
    code: 'HEATER',
    name: 'Resistência de Aquecimento Industrial',
    cat: 'loads',
    icon: '♨',
    terminals: [['L', 'IN', 'L1'], ['N', 'IN', 'N']],
    kind: 'heater',
    params: { power: 2000, voltage: 230 }
  },
  {
    code: 'OUTLET',
    name: 'Tomada 2P+T 16A 230V (Schuko / Padrão MZ)',
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
    params: { power: 1400, current: 6.2, voltage: 230, wireGauge: 2.5, btu: 12000, temp: 21 }
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
// COMPLEX NUMBER ARITHMETIC FOR AC PHASOR SOLVER
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
// PRE-BUILT REFERENCE CIRCUIT GENERATORS
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
      params: { voltage: 400, frequency: 50 },
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
      params: { current: 32, curve: 'C', closed: true },
      state: { closed: true, tripped: false },
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
      params: { coil: 230 },
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
      params: { power: 7500, rpm: 2920, voltage: 400 },
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
      params: { closed: true },
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
      params: { closed: false },
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
    { id: 'W1', a: { c: 'SRC1', t: 'L1' }, b: { c: 'Q1', t: '1' }, type: 'L1', live: true },
    { id: 'W2', a: { c: 'SRC1', t: 'L2' }, b: { c: 'Q1', t: '3' }, type: 'L2', live: true },
    { id: 'W3', a: { c: 'SRC1', t: 'L3' }, b: { c: 'Q1', t: '5' }, type: 'L3', live: true },

    // Força: Q1 -> KM1
    { id: 'W4', a: { c: 'Q1', t: '2' }, b: { c: 'KM1', t: '1' }, type: 'L1', live: true },
    { id: 'W5', a: { c: 'Q1', t: '4' }, b: { c: 'KM1', t: '3' }, type: 'L2', live: true },
    { id: 'W6', a: { c: 'Q1', t: '6' }, b: { c: 'KM1', t: '5' }, type: 'L3', live: true },

    // Força: KM1 -> F1
    { id: 'W7', a: { c: 'KM1', t: '2' }, b: { c: 'F1', t: '1' }, type: 'L1', live: false },
    { id: 'W8', a: { c: 'KM1', t: '4' }, b: { c: 'F1', t: '3' }, type: 'L2', live: false },
    { id: 'W9', a: { c: 'KM1', t: '6' }, b: { c: 'F1', t: '5' }, type: 'L3', live: false },

    // Força: F1 -> M1
    { id: 'W10', a: { c: 'F1', t: '2' }, b: { c: 'M1', t: 'U' }, type: 'L1', live: false },
    { id: 'W11', a: { c: 'F1', t: '4' }, b: { c: 'M1', t: 'V' }, type: 'L2', live: false },
    { id: 'W12', a: { c: 'F1', t: '6' }, b: { c: 'M1', t: 'W' }, type: 'L3', live: false },

    // Comando: L1 -> 95 F1 (Contato NF Proteção) -> S0
    { id: 'W13', a: { c: 'SRC1', t: 'L1' }, b: { c: 'F1', t: '95' }, type: 'CTRL', live: true },
    { id: 'W14', a: { c: 'F1', t: '96' }, b: { c: 'S0', t: '1' }, type: 'CTRL', live: true },

    // Comando: S0 -> S1
    { id: 'W15', a: { c: 'S0', t: '2' }, b: { c: 'S1', t: '3' }, type: 'CTRL', live: true },

    // Contato de Selo 13-14 KM1 em paralelo com S1 (3-4)
    { id: 'W16', a: { c: 'S1', t: '3' }, b: { c: 'KM1', t: '13' }, type: 'CTRL', live: true },
    { id: 'W17', a: { c: 'S1', t: '4' }, b: { c: 'KM1', t: '14' }, type: 'CTRL', live: false },

    // Acionamento da Bobina KM1 A1-A2
    { id: 'W18', a: { c: 'KM1', t: '14' }, b: { c: 'KM1', t: 'A1' }, type: 'CTRL', live: false },
    { id: 'W19', a: { c: 'KM1', t: 'A2' }, b: { c: 'SRC1', t: 'N' }, type: 'N', live: false },

    // Sinalização H1 (Verde) em paralelo com a bobina KM1
    { id: 'W20', a: { c: 'KM1', t: 'A1' }, b: { c: 'H1', t: 'L' }, type: 'CTRL', live: false },
    { id: 'W21', a: { c: 'H1', t: 'N' }, b: { c: 'SRC1', t: 'N' }, type: 'N', live: false }
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
      params: { voltage: 230, frequency: 50 },
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
      state: { closed: true, tripped: false },
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
      state: { closed: true },
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
      state: { closed: true },
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
      state: { closed: true },
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
      params: { power: 60, voltage: 230 },
      state: { energized: false },
      label: 'E1: Lâmpada 230V'
    }
  ];

  const wires = [
    { id: 'W1', a: { c: 'SRC1', t: 'L' }, b: { c: 'Q1', t: '1' }, type: 'L1', live: true },
    { id: 'W2', a: { c: 'Q1', t: '2' }, b: { c: 'S1', t: 'COM' }, type: 'L1', live: true },
    { id: 'W3', a: { c: 'S1', t: '1' }, b: { c: 'S2', t: '1' }, type: 'CTRL', live: true },
    { id: 'W4', a: { c: 'S1', t: '2' }, b: { c: 'S2', t: '2' }, type: 'CTRL', live: false },
    { id: 'W5', a: { c: 'S2', t: '3' }, b: { c: 'S3', t: '1' }, type: 'CTRL', live: true },
    { id: 'W6', a: { c: 'S2', t: '4' }, b: { c: 'S3', t: '2' }, type: 'CTRL', live: false },
    { id: 'W7', a: { c: 'S3', t: 'COM' }, b: { c: 'E1', t: 'L' }, type: 'L1', live: false },
    { id: 'W8', a: { c: 'E1', t: 'N' }, b: { c: 'SRC1', t: 'N' }, type: 'N', live: false }
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
      params: { voltage: 230, frequency: 50 },
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
      state: { closed: true, tripped: false },
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
      params: { current: 40, leakage: 30, closed: true },
      state: { closed: true, tripped: false },
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
      state: { closed: true, tripped: false },
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
      params: { power: 100, voltage: 230 },
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
      state: { closed: true, tripped: false },
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
      params: {},
      state: { energized: true },
      label: 'Tomadas Gerais'
    }
  ];

  const wires = [
    { id: 'W1', a: { c: 'SRC1', t: 'L' }, b: { c: 'Q_MAIN', t: '1' }, type: 'L1', live: true },
    { id: 'W2', a: { c: 'Q_MAIN', t: '2' }, b: { c: 'RCD1', t: '1' }, type: 'L1', live: true },
    { id: 'W3', a: { c: 'SRC1', t: 'N' }, b: { c: 'RCD1', t: '3' }, type: 'N', live: false },
    // Barramento Pós-DR
    { id: 'W4', a: { c: 'RCD1', t: '2' }, b: { c: 'Q_C1', t: '1' }, type: 'L1', live: true },
    { id: 'W5', a: { c: 'RCD1', t: '2' }, b: { c: 'Q_C2', t: '1' }, type: 'L1', live: true },
    // Cargas C1 e C2
    { id: 'W6', a: { c: 'Q_C1', t: '2' }, b: { c: 'LAMP1', t: 'L' }, type: 'L1', live: true },
    { id: 'W7', a: { c: 'LAMP1', t: 'N' }, b: { c: 'RCD1', t: '4' }, type: 'N', live: false },
    { id: 'W8', a: { c: 'Q_C2', t: '2' }, b: { c: 'OUTLET1', t: 'L' }, type: 'L1', live: true },
    { id: 'W9', a: { c: 'OUTLET1', t: 'N' }, b: { c: 'RCD1', t: '4' }, type: 'N', live: false }
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
      params: { uc: 600, in: 20 },
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
      params: { pNom: 3000, mpptMin: 60, mpptMax: 500 },
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
      state: { closed: true, tripped: false },
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
      params: { current: 25, leakage: 30, closed: true },
      state: { closed: true, tripped: false },
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
      params: {},
      state: { energized: true },
      label: 'Cargas AC / Quadro QDL'
    }
  ];

  const wires = [
    // CC da String para a String Box
    { id: 'W_PV1', a: { c: 'PV_STR1', t: '+' }, b: { c: 'SB1', t: 'IN+' }, type: '24+', live: true },
    { id: 'W_PV2', a: { c: 'PV_STR1', t: '-' }, b: { c: 'SB1', t: 'IN-' }, type: '24-', live: true },
    // Aterramento da carcaça dos painéis
    { id: 'W_PE1', a: { c: 'PV_STR1', t: 'PE' }, b: { c: 'SB1', t: 'PE' }, type: 'PE', live: false },
    // String Box para Inversor Solar
    { id: 'W_PV3', a: { c: 'SB1', t: 'OUT+' }, b: { c: 'INV1', t: 'PV+' }, type: '24+', live: true },
    { id: 'W_PV4', a: { c: 'SB1', t: 'OUT-' }, b: { c: 'INV1', t: 'PV-' }, type: '24-', live: true },
    // Saída CA do Inversor para Disjuntor CA
    { id: 'W_AC1', a: { c: 'INV1', t: 'L' }, b: { c: 'Q_AC1', t: '1' }, type: 'L1', live: true },
    { id: 'W_AC2', a: { c: 'INV1', t: 'N' }, b: { c: 'RCD_PV', t: '3' }, type: 'N', live: false },
    { id: 'W_AC3', a: { c: 'Q_AC1', t: '2' }, b: { c: 'RCD_PV', t: '1' }, type: 'L1', live: true },
    // Pós IDR para Quadro de Cargas
    { id: 'W_AC4', a: { c: 'RCD_PV', t: '2' }, b: { c: 'LOAD_AC1', t: 'L' }, type: 'L1', live: true },
    { id: 'W_AC5', a: { c: 'RCD_PV', t: '4' }, b: { c: 'LOAD_AC1', t: 'N' }, type: 'N', live: false },
    // Terra Geral
    { id: 'W_PE2', a: { c: 'INV1', t: 'PE' }, b: { c: 'LOAD_AC1', t: 'PE' }, type: 'PE', live: false }
  ];

  return { components, wires };
}

