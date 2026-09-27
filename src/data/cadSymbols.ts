// ============================================================================
// TÉCNICAMZ PRO — CATÁLOGO COMPLETO DE COMPONENTES CAD ELÉTRICOS & SIMBOLOGIA IEC
// Normas: IEC 60617 / DIN EN 60617, IEC 60947, IEC 60364 & NBR 5410
// 7 Categorias Normatizadas com Bornes Exatos, Dimensões e Parâmetros Editáveis
// ============================================================================

export interface EditablePropDef {
  key: string;
  label: string;
  type: 'number' | 'text' | 'select' | 'boolean';
  options?: { label: string; value: any }[];
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
}

export interface ComponentDef {
  code: string;
  name: string;
  cat: 'sources' | 'protection' | 'command' | 'motors' | 'automation' | 'electronics' | 'measurement' | 'loads' | 'legacy' | 'solar' | 'infra';
  icon: string;
  terminals: [string, string, string][]; // [id, function, defaultWireType]
  kind: string;
  params: Record<string, any>;
  editableProps?: EditablePropDef[];
  sourceType?: 'AC' | 'AC3' | 'DC';
  momentary?: boolean;
  emergency?: boolean;
  defaultW?: number;
  defaultH?: number;
}

export const CATEGORIES: Record<string, string> = {
  all: 'Todos os Dispositivos',
  sources: '1. Fontes & Geração de Energia',
  protection: '2. Dispositivos de Proteção',
  infra: '3. Condutores & Infraestrutura',
  command: '4. Comando Elétrico & Motores',
  automation: '5. Automação & Sensores',
  loads: '6. Cargas Reais & Potência',
  measurement: '7. Instrumentação & Medição',
  solar: 'Energia Solar Fotovoltaica',
  busbars: 'Trilhos & Barramentos (DIN)'
};

export const WIRE_COLORS: Record<string, string> = {
  L1: '#991b1b',      // Castanho / Vermelho - Fase R/L1
  L2: '#0f172a',      // Preto - Fase S/L2
  L3: '#57534e',      // Cinza - Fase T/L3
  N: '#0284c7',       // Azul Claro - Neutro
  PE: '#15803d',      // Verde / Amarelo - Terra de Proteção
  '24+': '#dc2626',   // Vermelho - DC Positivo (+24V)
  '24-': '#1e3a8a',   // Azul Escuro - DC Negativo (0V)
  CTRL: '#d97706'     // Âmbar / Amarelo - Comando & Intertravamento
};

// ----------------------------------------------------------------------------
// CATÁLOGO COMPLETO DE COMPONENTES INDUSTRIAIS (7 CATEGORIAS EXIGIDAS)
// ----------------------------------------------------------------------------

export const COMPONENT_CATALOG: ComponentDef[] = [
  // ==========================================================================
  // 1. FONTES E GERAÇÃO DE ENERGIA
  // ==========================================================================
  {
    code: 'SRC_AC1',
    name: 'Fonte CA Monofásica (Rede Concessionária 127V / 220V / 230V)',
    cat: 'sources',
    icon: '⚡',
    terminals: [
      ['L', 'PWR', 'L1'],
      ['N', 'PWR', 'N'],
      ['PE', 'PE', 'PE']
    ],
    kind: 'source',
    sourceType: 'AC',
    params: { voltage: 230, freq: 50, earthingSystem: 'TN-S', maxCurrent: 63, rInt: 0.05 },
    editableProps: [
      { key: 'voltage', label: 'Tensão de Fase (V)', type: 'select', options: [{ label: '127 V (F-N)', value: 127 }, { label: '220 V (F-N)', value: 220 }, { label: '230 V (F-N IEC)', value: 230 }, { label: '380 V', value: 380 }] },
      { key: 'freq', label: 'Frequência (Hz)', type: 'select', options: [{ label: '50 Hz (IEC/África/Europa)', value: 50 }, { label: '60 Hz (Brasil/EUA)', value: 60 }] },
      { key: 'earthingSystem', label: 'Esquema de Aterramento', type: 'select', options: [{ label: 'TN-S (Neutro e PE separados)', value: 'TN-S' }, { label: 'TN-C (Neutro e PE combinados)', value: 'TN-C' }, { label: 'TT (Terra independente)', value: 'TT' }, { label: 'IT (Neutro isolado)', value: 'IT' }] },
      { key: 'maxCurrent', label: 'Capacidade do Ramal (A)', type: 'number', min: 10, max: 200, step: 5, unit: 'A' }
    ]
  },
  {
    code: 'SRC_AC3',
    name: 'Alimentação Trifásica Industrial (230V / 400V 3F+N+PE)',
    cat: 'sources',
    icon: '⚡',
    terminals: [
      ['L1', 'PWR', 'L1'],
      ['L2', 'PWR', 'L2'],
      ['L3', 'PWR', 'L3'],
      ['N', 'PWR', 'N'],
      ['PE', 'PE', 'PE']
    ],
    kind: 'source',
    sourceType: 'AC3',
    params: { lineVoltage: 400, phaseVoltage: 230, freq: 50, earthingSystem: 'TN-S', maxCurrent: 125 },
    editableProps: [
      { key: 'lineVoltage', label: 'Tensão de Linha (V)', type: 'select', options: [{ label: '220V Linha / 127V Fase', value: 220 }, { label: '380V Linha / 220V Fase', value: 380 }, { label: '400V Linha / 230V Fase (IEC)', value: 400 }, { label: '440V Linha / 254V Fase', value: 440 }] },
      { key: 'freq', label: 'Frequência (Hz)', type: 'select', options: [{ label: '50 Hz', value: 50 }, { label: '60 Hz', value: 60 }] },
      { key: 'maxCurrent', label: 'Disjuntor Geral Entrada (A)', type: 'number', min: 25, max: 630, step: 5, unit: 'A' }
    ]
  },
  {
    code: 'BAT',
    name: 'Banco de Baterias Estacionárias CC (12V / 24V / 48V - LiFePO4 / Chumbo)',
    cat: 'sources',
    icon: '🔋',
    terminals: [
      ['+', 'PWR', '24+'],
      ['-', 'PWR', '24-'],
      ['PE', 'PE', 'PE']
    ],
    kind: 'source',
    sourceType: 'DC',
    params: { voltage: 24, capacityAh: 200, chemistry: 'LiFePO4', soc: 95, internalRes: 0.015 },
    editableProps: [
      { key: 'voltage', label: 'Tensão Nominal (V)', type: 'select', options: [{ label: '12 V', value: 12 }, { label: '24 V', value: 24 }, { label: '48 V', value: 48 }] },
      { key: 'capacityAh', label: 'Capacidade (Ah)', type: 'number', min: 10, max: 1000, step: 10, unit: 'Ah' },
      { key: 'chemistry', label: 'Química da Célula', type: 'select', options: [{ label: 'Lítio LiFePO4 (LFP)', value: 'LiFePO4' }, { label: 'Chumbo-Ácido Ventilada', value: 'Chumbo-Ácido' }, { label: 'Gel VRLA', value: 'Gel' }, { label: 'Lítio NMC', value: 'Lítio NMC' }] },
      { key: 'soc', label: 'Estado de Carga - SOC (%)', type: 'number', min: 0, max: 100, step: 1, unit: '%' }
    ]
  },
  {
    code: 'PV_PANEL',
    name: 'Painel Fotovoltaico Monocristalino Half-Cell 550Wp',
    cat: 'sources',
    icon: '☀️',
    terminals: [
      ['+', 'PWR', '24+'],
      ['-', 'PWR', '24-'],
      ['PE', 'PE', 'PE']
    ],
    kind: 'pv_panel',
    params: { power: 550, voc: 49.8, isc: 13.9, vmpp: 41.8, impp: 13.15, irradiance: 1000 },
    editableProps: [
      { key: 'power', label: 'Potência de Pico (Wp)', type: 'number', min: 100, max: 700, step: 25, unit: 'Wp' },
      { key: 'voc', label: 'Tensão Circuito Aberto Voc (V)', type: 'number', min: 20, max: 60, step: 0.5, unit: 'V' },
      { key: 'isc', label: 'Corrente Curto-Circuito Isc (A)', type: 'number', min: 5, max: 20, step: 0.1, unit: 'A' },
      { key: 'irradiance', label: 'Irradiância Solar (W/m²)', type: 'number', min: 0, max: 1200, step: 50, unit: 'W/m²' }
    ]
  },
  {
    code: 'PV_INVERTER',
    name: 'Inversor Solar Híbrido 5.0kW On/Off-Grid (230V CA / MPPT 500Vcc)',
    cat: 'sources',
    icon: '⚡',
    terminals: [
      ['PV+', 'IN', '24+'],
      ['PV-', 'IN', '24-'],
      ['BAT+', 'IN', '24+'],
      ['BAT-', 'IN', '24-'],
      ['L', 'OUT', 'L1'],
      ['N', 'OUT', 'N'],
      ['PE', 'PE', 'PE']
    ],
    kind: 'pv_inverter',
    params: { pNom: 5000, vOut: 230, mpptMin: 120, mpptMax: 500, efficiency: 0.976 },
    editableProps: [
      { key: 'pNom', label: 'Potência Nominal (W)', type: 'number', min: 1000, max: 15000, step: 500, unit: 'W' },
      { key: 'vOut', label: 'Tensão de Saída CA (V)', type: 'select', options: [{ label: '127 V', value: 127 }, { label: '220 V', value: 220 }, { label: '230 V', value: 230 }] }
    ]
  },
  {
    code: 'PV_STRINGBOX',
    name: 'String Box Fotovoltaica CC (Seccionadora 1000V + DPS CC 600V)',
    cat: 'sources',
    icon: '📦',
    terminals: [
      ['IN+', 'IN', '24+'],
      ['IN-', 'IN', '24-'],
      ['OUT+', 'OUT', '24+'],
      ['OUT-', 'OUT', '24-'],
      ['PE', 'PE', 'PE']
    ],
    kind: 'stringbox',
    params: { vMax: 1000, spdClass: 'Classe II CC', isClosed: true }
  },
  {
    code: 'GENERATOR_DIESEL',
    name: 'Grupo Gerador Diesel Standby 10 kVA / 8 kW (Trifásico/Monofásico)',
    cat: 'sources',
    icon: '⚙️',
    terminals: [
      ['L1', 'PWR', 'L1'],
      ['L2', 'PWR', 'L2'],
      ['L3', 'PWR', 'L3'],
      ['N', 'PWR', 'N'],
      ['PE', 'PE', 'PE']
    ],
    kind: 'generator',
    sourceType: 'AC3',
    params: { kva: 10, kw: 8, voltage: 400, freq: 50, running: false, autoStart: true },
    editableProps: [
      { key: 'kva', label: 'Potência Aparente (kVA)', type: 'number', min: 5, max: 500, step: 5, unit: 'kVA' },
      { key: 'voltage', label: 'Tensão Nominal (V)', type: 'select', options: [{ label: '230V Monofásico', value: 230 }, { label: '400V Trifásico', value: 400 }] }
    ]
  },
  {
    code: 'ATS_100A',
    name: 'Chave de Transferência Automática ATS 100A 4P (Rede / Gerador)',
    cat: 'sources',
    icon: '🔄',
    terminals: [
      ['MA_L1', 'IN', 'L1'], ['MA_L2', 'IN', 'L2'], ['MA_L3', 'IN', 'L3'], ['MA_N', 'IN', 'N'],
      ['GEN_L1', 'IN', 'L1'], ['GEN_L2', 'IN', 'L2'], ['GEN_L3', 'IN', 'L3'], ['GEN_N', 'IN', 'N'],
      ['LOAD_L1', 'OUT', 'L1'], ['LOAD_L2', 'OUT', 'L2'], ['LOAD_L3', 'OUT', 'L3'], ['LOAD_N', 'OUT', 'N'],
      ['PE', 'PE', 'PE']
    ],
    kind: 'ats',
    params: { ratedCurrent: 100, transferDelaySec: 0.5, sourceSelected: 'MAIN' },
    editableProps: [
      { key: 'ratedCurrent', label: 'Corrente Nominal (A)', type: 'select', options: [{ label: '63 A', value: 63 }, { label: '100 A', value: 100 }, { label: '160 A', value: 160 }, { label: '250 A', value: 250 }] },
      { key: 'transferDelaySec', label: 'Tempo de Comutação (s)', type: 'number', min: 0.2, max: 10, step: 0.1, unit: 's' }
    ]
  },
  {
    code: 'MTS_100A',
    name: 'Chave de Transferência Manual MTS 1-0-2 (100A 4 Polos)',
    cat: 'sources',
    icon: '🔀',
    terminals: [
      ['MA_L1', 'IN', 'L1'], ['MA_L2', 'IN', 'L2'], ['MA_L3', 'IN', 'L3'], ['MA_N', 'IN', 'N'],
      ['GEN_L1', 'IN', 'L1'], ['GEN_L2', 'IN', 'L2'], ['GEN_L3', 'IN', 'L3'], ['GEN_N', 'IN', 'N'],
      ['LOAD_L1', 'OUT', 'L1'], ['LOAD_L2', 'OUT', 'L2'], ['LOAD_L3', 'OUT', 'L3'], ['LOAD_N', 'OUT', 'N']
    ],
    kind: 'mts',
    params: { position: 1, ratedCurrent: 100 },
    editableProps: [
      { key: 'position', label: 'Posição do Comutador', type: 'select', options: [{ label: '1 - Rede Concessionária', value: 1 }, { label: '0 - Desligado / Isolado', value: 0 }, { label: '2 - Gerador Diesel', value: 2 }] }
    ]
  },
  {
    code: 'PSU',
    name: 'Fonte Chaveada Industrial 24Vcc / 10A (Entrada 100-240Vca)',
    cat: 'sources',
    icon: '🔌',
    terminals: [
      ['L', 'IN', 'L1'],
      ['N', 'IN', 'N'],
      ['PE', 'PE', 'PE'],
      ['+24V', 'OUT', '24+'],
      ['0V', 'OUT', '24-']
    ],
    kind: 'psu',
    params: { vIn: 230, vOut: 24, iOutMax: 10 },
    editableProps: [
      { key: 'vOut', label: 'Tensão de Saída (V)', type: 'select', options: [{ label: '12 Vcc', value: 12 }, { label: '24 Vcc', value: 24 }, { label: '48 Vcc', value: 48 }] },
      { key: 'iOutMax', label: 'Corrente Máxima (A)', type: 'number', min: 1, max: 40, step: 1, unit: 'A' }
    ]
  },

  // ==========================================================================
  // 2. DISPOSITIVOS DE PROTEÇÃO
  // ==========================================================================
  {
    code: 'MCB_1P',
    name: 'Disjuntor Unipolar Parcial 1P Curva C (1 Polo 18mm)',
    cat: 'protection',
    icon: '🛡️',
    terminals: [
      ['1', 'IN', 'L1'],
      ['2', 'OUT', 'L1']
    ],
    kind: 'breaker_1p',
    params: { rating: 16, curve: 'C', breakingCapacity: 6, poles: 1 },
    editableProps: [
      { key: 'rating', label: 'Corrente Nominal In (A)', type: 'select', options: [{ label: '6 A', value: 6 }, { label: '10 A', value: 10 }, { label: '16 A', value: 16 }, { label: '20 A', value: 20 }, { label: '25 A', value: 25 }, { label: '32 A', value: 32 }, { label: '40 A', value: 40 }] },
      { key: 'curve', label: 'Curva de Disparo', type: 'select', options: [{ label: 'Curva B', value: 'B' }, { label: 'Curva C', value: 'C' }, { label: 'Curva D', value: 'D' }] }
    ]
  },
  {
    code: 'MCB1',
    name: 'Disjuntor Termomagnético Monopolar MCB 1P+N (Curva C 16A)',
    cat: 'protection',
    icon: '🛡️',
    terminals: [
      ['1', 'IN', 'L1'],
      ['N_IN', 'IN', 'N'],
      ['2', 'OUT', 'L1'],
      ['N_OUT', 'OUT', 'N']
    ],
    kind: 'breaker',
    params: { rating: 16, curve: 'C', breakingCapacity: 6, poles: 1 },
    editableProps: [
      { key: 'rating', label: 'Corrente Nominal In (A)', type: 'select', options: [{ label: '6 A', value: 6 }, { label: '10 A', value: 10 }, { label: '16 A', value: 16 }, { label: '20 A', value: 20 }, { label: '25 A', value: 25 }, { label: '32 A', value: 32 }, { label: '40 A', value: 40 }, { label: '50 A', value: 50 }, { label: '63 A', value: 63 }] },
      { key: 'curve', label: 'Curva de Disparo', type: 'select', options: [{ label: 'Curva B (3 a 5x In - Aquecimento/Resistivo)', value: 'B' }, { label: 'Curva C (5 a 10x In - Iluminação/Motores Leves)', value: 'C' }, { label: 'Curva D (10 a 20x In - Transformadores/Motores Pesados)', value: 'D' }] },
      { key: 'breakingCapacity', label: 'Poder de Corte Icn (kA)', type: 'select', options: [{ label: '4.5 kA', value: 4.5 }, { label: '6.0 kA (Residencial)', value: 6.0 }, { label: '10.0 kA (Industrial)', value: 10.0 }] }
    ]
  },
  {
    code: 'MCB2',
    name: 'Disjuntor Bipolar MCB 2P (Curva C 32A)',
    cat: 'protection',
    icon: '🛡️',
    terminals: [
      ['1', 'IN', 'L1'],
      ['3', 'IN', 'L2'],
      ['2', 'OUT', 'L1'],
      ['4', 'OUT', 'L2']
    ],
    kind: 'breaker2',
    params: { rating: 32, curve: 'C', breakingCapacity: 6, poles: 2 },
    editableProps: [
      { key: 'rating', label: 'Corrente Nominal In (A)', type: 'select', options: [{ label: '10 A', value: 10 }, { label: '16 A', value: 16 }, { label: '20 A', value: 20 }, { label: '25 A', value: 25 }, { label: '32 A', value: 32 }, { label: '40 A', value: 40 }, { label: '50 A', value: 50 }, { label: '63 A', value: 63 }] },
      { key: 'curve', label: 'Curva de Disparo', type: 'select', options: [{ label: 'Curva B', value: 'B' }, { label: 'Curva C', value: 'C' }, { label: 'Curva D', value: 'D' }] }
    ]
  },
  {
    code: 'MCB3',
    name: 'Disjuntor Tripolar MCB 3P (Curva C 63A - Proteção Geral / Motor)',
    cat: 'protection',
    icon: '🛡️',
    terminals: [
      ['1', 'IN', 'L1'],
      ['3', 'IN', 'L2'],
      ['5', 'IN', 'L3'],
      ['2', 'OUT', 'L1'],
      ['4', 'OUT', 'L2'],
      ['6', 'OUT', 'L3']
    ],
    kind: 'breaker3',
    params: { rating: 63, curve: 'C', breakingCapacity: 10, poles: 3 },
    editableProps: [
      { key: 'rating', label: 'Corrente Nominal In (A)', type: 'select', options: [{ label: '16 A', value: 16 }, { label: '25 A', value: 25 }, { label: '32 A', value: 32 }, { label: '40 A', value: 40 }, { label: '50 A', value: 50 }, { label: '63 A', value: 63 }, { label: '80 A', value: 80 }, { label: '100 A', value: 100 }, { label: '125 A', value: 125 }] },
      { key: 'curve', label: 'Curva de Disparo', type: 'select', options: [{ label: 'Curva B', value: 'B' }, { label: 'Curva C', value: 'C' }, { label: 'Curva D', value: 'D' }] }
    ]
  },
  {
    code: 'MCB4',
    name: 'Disjuntor Tetrapolar MCB 4P / 3P+N (Curva C 80A)',
    cat: 'protection',
    icon: '🛡️',
    terminals: [
      ['1', 'IN', 'L1'], ['3', 'IN', 'L2'], ['5', 'IN', 'L3'], ['N_IN', 'IN', 'N'],
      ['2', 'OUT', 'L1'], ['4', 'OUT', 'L2'], ['6', 'OUT', 'L3'], ['N_OUT', 'OUT', 'N']
    ],
    kind: 'breaker3',
    params: { rating: 80, curve: 'C', breakingCapacity: 10, poles: 4 }
  },
  {
    code: 'MCCB',
    name: 'Disjuntor Caixa Moldada MCCB 250A Tripolar (Ajuste Térmico/Magnético)',
    cat: 'protection',
    icon: '🏢',
    terminals: [
      ['1', 'IN', 'L1'], ['3', 'IN', 'L2'], ['5', 'IN', 'L3'],
      ['2', 'OUT', 'L1'], ['4', 'OUT', 'L2'], ['6', 'OUT', 'L3']
    ],
    kind: 'breaker3',
    params: { rating: 250, icu: 36, thermalAdj: 1.0, magAdj: 10 },
    editableProps: [
      { key: 'rating', label: 'Corrente Nominal do Frame (A)', type: 'select', options: [{ label: '125 A', value: 125 }, { label: '160 A', value: 160 }, { label: '250 A', value: 250 }, { label: '400 A', value: 400 }, { label: '630 A', value: 630 }] },
      { key: 'thermalAdj', label: 'Ajuste Térmico Ir (0.8 a 1.0 In)', type: 'number', min: 0.7, max: 1.0, step: 0.05 },
      { key: 'magAdj', label: 'Disparo Magnético Im (5 a 10 In)', type: 'number', min: 5, max: 12, step: 1 }
    ]
  },
  {
    code: 'FUSE',
    name: 'Fusível Industrial NH00 gG/aM (Alta Capacidade 120kA)',
    cat: 'protection',
    icon: '⚡',
    terminals: [
      ['1', 'IN', 'L1'],
      ['2', 'OUT', 'L1']
    ],
    kind: 'fuse',
    params: { rating: 63, type: 'gG', size: 'NH00', icu: 120 },
    editableProps: [
      { key: 'rating', label: 'Corrente Nominal (A)', type: 'select', options: [{ label: '16 A', value: 16 }, { label: '25 A', value: 25 }, { label: '36 A', value: 36 }, { label: '50 A', value: 50 }, { label: '63 A', value: 63 }, { label: '100 A', value: 100 }, { label: '160 A', value: 160 }] },
      { key: 'type', label: 'Classe de Aplicação', type: 'select', options: [{ label: 'gG (Geral - Cabos e Linhas)', value: 'gG' }, { label: 'aM (Proteção de Motores)', value: 'aM' }, { label: 'aR (Ultra-Rápido - Semicondutores)', value: 'aR' }] }
    ]
  },
  {
    code: 'FU3',
    name: 'Seccionadora Tripolar para Fusíveis NH (Base NH00 160A)',
    cat: 'protection',
    icon: '⚡',
    terminals: [
      ['1', 'IN', 'L1'], ['3', 'IN', 'L2'], ['5', 'IN', 'L3'],
      ['2', 'OUT', 'L1'], ['4', 'OUT', 'L2'], ['6', 'OUT', 'L3']
    ],
    kind: 'fuse3',
    params: { rating: 160 }
  },
  {
    code: 'RCD',
    name: 'Interruptor Diferencial Residual IDR 2P 40A / 30mA (Botão Teste)',
    cat: 'protection',
    icon: '🛡️',
    terminals: [
      ['1', 'IN', 'L1'],
      ['N_IN', 'IN', 'N'],
      ['2', 'OUT', 'L1'],
      ['N_OUT', 'OUT', 'N']
    ],
    kind: 'rcd',
    params: { rating: 40, sensitivityMA: 30, testTriggered: false },
    editableProps: [
      { key: 'sensitivityMA', label: 'Sensibilidade de Fuga IΔn (mA)', type: 'select', options: [{ label: '10 mA (Áreas Molhadas / Hospital)', value: 10 }, { label: '30 mA (Proteção Humana NBR 5410)', value: 30 }, { label: '300 mA (Proteção Contra Incêndio)', value: 300 }, { label: '500 mA (Industrial)', value: 500 }] },
      { key: 'rating', label: 'Corrente Nominal dos Contatos (A)', type: 'select', options: [{ label: '25 A', value: 25 }, { label: '40 A', value: 40 }, { label: '63 A', value: 63 }] }
    ]
  },
  {
    code: 'RCD4',
    name: 'Interruptor Diferencial Residual IDR 4P 63A / 30mA Trifásico',
    cat: 'protection',
    icon: '🛡️',
    terminals: [
      ['1', 'IN', 'L1'], ['3', 'IN', 'L2'], ['5', 'IN', 'L3'], ['N_IN', 'IN', 'N'],
      ['2', 'OUT', 'L1'], ['4', 'OUT', 'L2'], ['6', 'OUT', 'L3'], ['N_OUT', 'OUT', 'N']
    ],
    kind: 'rcd4',
    params: { rating: 63, sensitivityMA: 30 }
  },
  {
    code: 'RCBO',
    name: 'Disjuntor Diferencial Combinado RCBO 1P+N 20A / 30mA (Curva C)',
    cat: 'protection',
    icon: '🛡️',
    terminals: [
      ['1', 'IN', 'L1'],
      ['N_IN', 'IN', 'N'],
      ['2', 'OUT', 'L1'],
      ['N_OUT', 'OUT', 'N'],
      ['FE', 'PE', 'PE']
    ],
    kind: 'rcbo',
    params: { rating: 20, sensitivityMA: 30, curve: 'C' }
  },
  {
    code: 'SPD',
    name: 'DPS Classe II 40kA Monopolar (Cartucho Removível + Indicador Verde/Vermelho)',
    cat: 'protection',
    icon: '⚡',
    terminals: [
      ['L', 'IN', 'L1'],
      ['PE', 'OUT', 'PE']
    ],
    kind: 'spd',
    params: { uc: 275, imax: 40, in: 20, lifeHealthy: true },
    editableProps: [
      { key: 'imax', label: 'Corrente Máxima de Descarga Imax (kA)', type: 'select', options: [{ label: '20 kA', value: 20 }, { label: '40 kA (Padrão Painel QGD)', value: 40 }, { label: '65 kA', value: 65 }] },
      { key: 'uc', label: 'Tensão Contínua Máxima Uc (Vca)', type: 'select', options: [{ label: '175 Vca', value: 175 }, { label: '275 Vca', value: 275 }, { label: '385 Vca', value: 385 }] }
    ]
  },
  {
    code: 'SPD3',
    name: 'Conjunto DPS Tetrapolar 3P+N Classe II 40kA (Modos Comum e Diferencial)',
    cat: 'protection',
    icon: '⚡',
    terminals: [
      ['L1', 'IN', 'L1'], ['L2', 'IN', 'L2'], ['L3', 'IN', 'L3'], ['N', 'IN', 'N'],
      ['PE', 'OUT', 'PE']
    ],
    kind: 'spd3',
    params: { imax: 40, in: 20 }
  },
  {
    code: 'MPCB',
    name: 'Disjuntor-Motor Magnético-Térmico (Ajuste 10-16A / Icu 100kA)',
    cat: 'protection',
    icon: '🛡️',
    terminals: [
      ['1', 'IN', 'L1'], ['3', 'IN', 'L2'], ['5', 'IN', 'L3'],
      ['2', 'OUT', 'L1'], ['4', 'OUT', 'L2'], ['6', 'OUT', 'L3']
    ],
    kind: 'mpcb',
    params: { minCurrent: 10, maxCurrent: 16, currentSetting: 14, icu: 100 }
  },
  {
    code: 'OLR',
    name: 'Relé Térmico de Sobrecarga Bimetálico (Classe 10 - Bornes 95/96 NF e 97/98 NA)',
    cat: 'protection',
    icon: '🔥',
    terminals: [
      ['1', 'IN', 'L1'], ['3', 'IN', 'L2'], ['5', 'IN', 'L3'],
      ['2', 'OUT', 'L1'], ['4', 'OUT', 'L2'], ['6', 'OUT', 'L3'],
      ['95', 'NC', 'CTRL'], ['96', 'NC', 'CTRL'],
      ['97', 'NO', 'CTRL'], ['98', 'NO', 'CTRL']
    ],
    kind: 'overload',
    params: { minCurrent: 7.0, maxCurrent: 10.0, currentSetting: 8.5, tripClass: 'Class 10' },
    editableProps: [
      { key: 'currentSetting', label: 'Corrente Ajustada Ir (A)', type: 'number', min: 1, max: 100, step: 0.5, unit: 'A' },
      { key: 'tripClass', label: 'Classe de Disparo', type: 'select', options: [{ label: 'Classe 10 (Disparo em ≤10s a 7.2x Ir)', value: 'Class 10' }, { label: 'Classe 20 (Disparo em ≤20s para partidas pesadas)', value: 'Class 20' }] }
    ]
  },

  // ==========================================================================
  // 3. CONDUTORES E INFRAESTRUTURA
  // ==========================================================================
  {
    code: 'WIRE',
    name: 'Condutor de Cobre Flexível NBR 5410 / IEC 60228 (1.5mm² a 16mm²)',
    cat: 'infra',
    icon: '〰️',
    terminals: [
      ['A', 'PWR', 'L1'],
      ['B', 'PWR', 'L1']
    ],
    kind: 'wire_component',
    params: { gauge: 2.5, insulation: 'PVC 70°C', lengthM: 5 },
    editableProps: [
      { key: 'gauge', label: 'Bitola Nominal (mm²)', type: 'select', options: [{ label: '1.5 mm² (17.5A max)', value: 1.5 }, { label: '2.5 mm² (24A max)', value: 2.5 }, { label: '4.0 mm² (32A max)', value: 4.0 }, { label: '6.0 mm² (41A max)', value: 6.0 }, { label: '10.0 mm² (57A max)', value: 10.0 }, { label: '16.0 mm² (76A max)', value: 16.0 }] },
      { key: 'insulation', label: 'Isolação', type: 'select', options: [{ label: 'PVC 70°C (NBR NM 247-3)', value: 'PVC 70°C' }, { label: 'HEPR / XLPE 90°C (Baixa Emissão de Fumaça)', value: 'HEPR 90°C' }] },
      { key: 'lengthM', label: 'Comprimento Estimado (m)', type: 'number', min: 0.5, max: 100, step: 0.5, unit: 'm' }
    ]
  },
  {
    code: 'BARE_COPPER',
    name: 'Cabo de Cobre Nu para Malha de Aterramento (25mm² / 50mm²)',
    cat: 'infra',
    icon: '⚡',
    terminals: [
      ['A', 'PE', 'PE'],
      ['B', 'PE', 'PE']
    ],
    kind: 'bare_copper',
    params: { gauge: 25, lengthM: 10 }
  },
  {
    code: 'EARTH_ROD',
    name: 'Haste de Aterramento em Aço Cobreado 2.40m / 5/8" (Resistência Rpt)',
    cat: 'infra',
    icon: '📍',
    terminals: [
      ['PE', 'PE', 'PE']
    ],
    kind: 'earth_rod',
    params: { resistance: 10, lengthM: 2.4 },
    editableProps: [
      { key: 'resistance', label: 'Resistência Medida (Ω)', type: 'number', min: 1, max: 100, step: 1, unit: 'Ω' }
    ]
  },
  {
    code: 'SPLIT_BOLT',
    name: 'Conector Split-Bolt de Alta Pressão em Latão Forjado Estanhado',
    cat: 'infra',
    icon: '🔩',
    terminals: [
      ['IN1', 'PWR', 'PE'],
      ['IN2', 'PWR', 'PE'],
      ['OUT', 'PWR', 'PE']
    ],
    kind: 'junction_box',
    params: { maxGauge: 50 }
  },

  // ==========================================================================
  // 4. COMANDO ELÉTRICO E MOTORES
  // ==========================================================================
  {
    code: 'CONTACTOR',
    name: 'Contator de Potência Tripolar 25A AC-3 (Bobina A1/A2 + 1NA 13-14 + 1NF 21-22)',
    cat: 'command',
    icon: '🔲',
    terminals: [
      ['1', 'IN', 'L1'], ['3', 'IN', 'L2'], ['5', 'IN', 'L3'],
      ['2', 'OUT', 'L1'], ['4', 'OUT', 'L2'], ['6', 'OUT', 'L3'],
      ['A1', 'COIL', 'CTRL'], ['A2', 'COIL', 'N'],
      ['13', 'NO', 'CTRL'], ['14', 'NO', 'CTRL'],
      ['21', 'NC', 'CTRL'], ['22', 'NC', 'CTRL']
    ],
    kind: 'contactor',
    params: { currentAC3: 25, coilVoltage: 230, coilPowerVA: 8.5 },
    editableProps: [
      { key: 'currentAC3', label: 'Capacidade Nominal AC-3 (A)', type: 'select', options: [{ label: '9 A (4 kW)', value: 9 }, { label: '12 A (5.5 kW)', value: 12 }, { label: '18 A (7.5 kW)', value: 18 }, { label: '25 A (11 kW)', value: 25 }, { label: '32 A (15 kW)', value: 32 }, { label: '50 A (22 kW)', value: 50 }, { label: '65 A (30 kW)', value: 65 }] },
      { key: 'coilVoltage', label: 'Tensão da Bobina A1/A2', type: 'select', options: [{ label: '24 Vcc', value: 24 }, { label: '24 Vca', value: 24 }, { label: '110 Vca', value: 110 }, { label: '220/230 Vca', value: 230 }, { label: '380 Vca', value: 380 }] }
    ]
  },
  {
    code: 'RELAY',
    name: 'Relé Auxiliar de Interface Industrial 24Vcc / 230Vca (2 Reversíveis DPDT)',
    cat: 'command',
    icon: '📦',
    terminals: [
      ['A1', 'COIL', 'CTRL'], ['A2', 'COIL', 'N'],
      ['11', 'COM', 'CTRL'], ['12', 'NC', 'CTRL'], ['14', 'NO', 'CTRL'],
      ['21', 'COM', 'CTRL'], ['22', 'NC', 'CTRL'], ['24', 'NO', 'CTRL']
    ],
    kind: 'relay',
    params: { coilVoltage: 24, maxCurrent: 10 }
  },
  {
    code: 'PHASE',
    name: 'Relé Monitor de Falta e Sequência de Fase RPF (R-S-T com Ajuste de Assimetria)',
    cat: 'command',
    icon: '👁️',
    terminals: [
      ['L1', 'IN', 'L1'], ['L2', 'IN', 'L2'], ['L3', 'IN', 'L3'], ['N', 'IN', 'N'],
      ['11', 'COM', 'CTRL'], ['12', 'NC', 'CTRL'], ['14', 'NO', 'CTRL']
    ],
    kind: 'phase_relay',
    params: { asymmetryPercent: 15, underVoltage: 340, ok: true }
  },
  {
    code: 'TIMER',
    name: 'Relé Temporizador Eletrônico ON-DELAY (Retardo na Energização 0.1s a 60s)',
    cat: 'command',
    icon: '⏱️',
    terminals: [
      ['A1', 'COIL', 'CTRL'], ['A2', 'COIL', 'N'],
      ['15', 'COM', 'CTRL'], ['16', 'NC', 'CTRL'], ['18', 'NO', 'CTRL']
    ],
    kind: 'timer',
    params: { delaySec: 5, mode: 'TON' },
    editableProps: [
      { key: 'delaySec', label: 'Tempo de Retardo (s)', type: 'number', min: 0.5, max: 60, step: 0.5, unit: 's' }
    ]
  },
  {
    code: 'FLASH',
    name: 'Relé Cíclico / Intermitente (Sinalizador Pisca-Pisca T_on / T_off)',
    cat: 'command',
    icon: '💡',
    terminals: [
      ['A1', 'COIL', 'CTRL'], ['A2', 'COIL', 'N'],
      ['15', 'COM', 'CTRL'], ['18', 'NO', 'CTRL']
    ],
    kind: 'flasher',
    params: { periodSec: 1 }
  },
  {
    code: 'DISCONNECT_SW',
    name: 'Chave Seccionadora Rotativa Sob Carga 3P 63A (Trava Cadeado LOTO)',
    cat: 'command',
    icon: '⭕',
    terminals: [
      ['1', 'IN', 'L1'], ['3', 'IN', 'L2'], ['5', 'IN', 'L3'],
      ['2', 'OUT', 'L1'], ['4', 'OUT', 'L2'], ['6', 'OUT', 'L3']
    ],
    kind: 'switch',
    params: { rating: 63, closed: true }
  },
  {
    code: 'SOFTSTARTER',
    name: 'Soft-Starter Digital Microprocessada (Rampa de Tensão 0-60s com Bypass)',
    cat: 'command',
    icon: '📈',
    terminals: [
      ['1/L1', 'IN', 'L1'], ['3/L2', 'IN', 'L2'], ['5/L3', 'IN', 'L3'],
      ['2/T1', 'OUT', 'L1'], ['4/T2', 'OUT', 'L2'], ['6/T3', 'OUT', 'L3'],
      ['DI1', 'IN', 'CTRL'], ['COM', 'IN', 'CTRL'],
      ['13', 'NO', 'CTRL'], ['14', 'NO', 'CTRL']
    ],
    kind: 'vfd',
    params: { rampTimeSec: 10, initialVoltagePercent: 40, bypassClosed: false },
    editableProps: [
      { key: 'rampTimeSec', label: 'Tempo de Rampa de Partida (s)', type: 'number', min: 1, max: 60, step: 1, unit: 's' },
      { key: 'initialVoltagePercent', label: 'Tensão de Pedestal Inicial (%)', type: 'number', min: 30, max: 70, step: 5, unit: '%' }
    ]
  },
  {
    code: 'VFD',
    name: 'Inversor de Frequência Vetorial 0-60Hz (Controle Escalar V/F e Display LCD)',
    cat: 'command',
    icon: '📊',
    terminals: [
      ['R/L1', 'IN', 'L1'], ['S/L2', 'IN', 'L2'], ['T/L3', 'IN', 'L3'],
      ['U', 'OUT', 'L1'], ['V', 'OUT', 'L2'], ['W', 'OUT', 'L3'],
      ['FWD', 'IN', 'CTRL'], ['REV', 'IN', 'CTRL'], ['DCOM', 'IN', 'CTRL']
    ],
    kind: 'vfd',
    params: { targetFreq: 50, currentFreq: 0, accelTimeSec: 5, decelTimeSec: 5 },
    editableProps: [
      { key: 'targetFreq', label: 'Frequência de Operação (Hz)', type: 'number', min: 5, max: 120, step: 1, unit: 'Hz' },
      { key: 'accelTimeSec', label: 'Tempo de Aceleração (s)', type: 'number', min: 1, max: 30, step: 1, unit: 's' }
    ]
  },
  {
    code: 'LIMIT',
    name: 'Chave Fim de Curso Eletromecânica com Rolete (1NA + 1NF IP67)',
    cat: 'command',
    icon: '🛑',
    terminals: [
      ['13', 'NO', 'CTRL'], ['14', 'NO', 'CTRL'],
      ['21', 'NC', 'CTRL'], ['22', 'NC', 'CTRL']
    ],
    kind: 'limit',
    params: { actuated: false }
  },

  // ==========================================================================
  // 5. AUTOMAÇÃO E SENSORES
  // ==========================================================================
  {
    code: 'PHOTO_CELL',
    name: 'Relé Fotoelétrico Crepuscular (Fotocélula Iluminação Pública 1000W)',
    cat: 'automation',
    icon: '🌓',
    terminals: [
      ['L', 'IN', 'L1'],
      ['N', 'IN', 'N'],
      ['LOAD', 'OUT', 'CTRL']
    ],
    kind: 'sensor',
    params: { dark: true, thresholdLux: 10 }
  },
  {
    code: 'PIR_SENSOR',
    name: 'Sensor de Presença Infravermelho Passivo PIR (Ângulo 360° / Alcance 6m)',
    cat: 'automation',
    icon: '🚶',
    terminals: [
      ['L', 'IN', 'L1'],
      ['N', 'IN', 'N'],
      ['OUT', 'OUT', 'CTRL']
    ],
    kind: 'sensor',
    params: { detected: false, timerMin: 1 }
  },
  {
    code: 'SW',
    name: 'Interruptor Simples Unipolar 10A 250V (Tecla Basculante com Marca I/O)',
    cat: 'automation',
    icon: '🔘',
    terminals: [
      ['1', 'IN', 'L1'],
      ['2', 'OUT', 'L1']
    ],
    kind: 'switch',
    params: { closed: false }
  },
  {
    code: 'SW2',
    name: 'Interruptor Bipolar 2P 10A 250V (Corte de Fase e Neutro ou 2 Fases)',
    cat: 'automation',
    icon: '🔘',
    terminals: [
      ['1', 'IN', 'L1'],
      ['3', 'IN', 'L2'],
      ['2', 'OUT', 'L1'],
      ['4', 'OUT', 'L2']
    ],
    kind: 'switch2',
    params: { closed: false }
  },
  {
    code: 'SW_DOUBLE',
    name: 'Interruptor Duplo 2 Teclas (Fase Comum + Retornos Independentes R1 e R2)',
    cat: 'automation',
    icon: '🔘🔘',
    terminals: [
      ['1', 'IN', 'L1'],
      ['2', 'OUT', 'L1'],
      ['4', 'OUT', 'L1']
    ],
    kind: 'switch_double',
    params: { closed1: false, closed2: false }
  },
  {
    code: 'DIMMER',
    name: 'Dimmer Rotativo Eletrônico (0-100% 230V 600W)',
    cat: 'automation',
    icon: '◐',
    terminals: [
      ['IN', 'IN', 'L1'],
      ['OUT', 'OUT', 'L1'],
      ['N', 'IN', 'N']
    ],
    kind: 'dimmer',
    params: { percent: 100 }
  },
  {
    code: 'THREE_WAY',
    name: 'Interruptor Paralelo (Three-Way / Comutador de Escada SPDT)',
    cat: 'automation',
    icon: '🔀',
    terminals: [
      ['COM', 'IN', 'L1'],
      ['1', 'OUT', 'CTRL'],
      ['2', 'OUT', 'CTRL']
    ],
    kind: 'selector',
    params: { position: 0 },
    editableProps: [
      { key: 'position', label: 'Posição do Contato COM', type: 'select', options: [{ label: 'Via 1 (COM ligado a 1)', value: 0 }, { label: 'Via 2 (COM ligado a 2)', value: 1 }] }
    ]
  },
  {
    code: 'FOUR_WAY',
    name: 'Interruptor Intermediário (Four-Way / Inversor Cruzado DPDT)',
    cat: 'automation',
    icon: '🔁',
    terminals: [
      ['1', 'IN', 'CTRL'],
      ['2', 'IN', 'CTRL'],
      ['3', 'OUT', 'CTRL'],
      ['4', 'OUT', 'CTRL']
    ],
    kind: 'selector',
    params: { crossed: false },
    editableProps: [
      { key: 'crossed', label: 'Modo de Condução', type: 'select', options: [{ label: 'Direto (1→3 e 2→4)', value: false }, { label: 'Cruzado (1→4 e 2→3)', value: true }] }
    ]
  },
  {
    code: 'PBNO',
    name: 'Botoeira Pulsadora Liga (Contato NA - Verde com Anel Metálico)',
    cat: 'automation',
    icon: '🟢',
    terminals: [
      ['3', 'IN', 'CTRL'],
      ['4', 'OUT', 'CTRL']
    ],
    kind: 'push',
    momentary: true,
    params: { pressed: false }
  },
  {
    code: 'PBNC',
    name: 'Botoeira Pulsadora Desliga (Contato NF - Vermelha com Anel Metálico)',
    cat: 'automation',
    icon: '🔴',
    terminals: [
      ['1', 'IN', 'CTRL'],
      ['2', 'OUT', 'CTRL']
    ],
    kind: 'push',
    momentary: true,
    params: { pressed: false }
  },
  {
    code: 'ESTOP',
    name: 'Botoeira de Emergência Tipo Cogumelo 40mm com Trava Mecânica (NF)',
    cat: 'automation',
    icon: '🛑',
    terminals: [
      ['1', 'IN', 'CTRL'],
      ['2', 'OUT', 'CTRL']
    ],
    kind: 'push',
    emergency: true,
    params: { pressed: false }
  },
  {
    code: 'DIMMER',
    name: 'Dimmer Eletrônico Triac (Variador de Tensão e Luminosidade 0-100%)',
    cat: 'automation',
    icon: '🎛️',
    terminals: [
      ['L', 'IN', 'L1'],
      ['OUT', 'OUT', 'L1']
    ],
    kind: 'dimmer',
    params: { levelPercent: 100 },
    editableProps: [
      { key: 'levelPercent', label: 'Nível de Saída (%)', type: 'number', min: 0, max: 100, step: 5, unit: '%' }
    ]
  },
  {
    code: 'SONOFF_WIFI',
    name: 'Módulo Relé Inteligente Wi-Fi Sonoff MINI R2 (10A com Entrada S1/S2)',
    cat: 'automation',
    icon: '📡',
    terminals: [
      ['L_IN', 'IN', 'L1'], ['N_IN', 'IN', 'N'],
      ['L_OUT', 'OUT', 'L1'],
      ['S1', 'IN', 'CTRL'], ['S2', 'IN', 'CTRL']
    ],
    kind: 'relay',
    params: { wifiConnected: true, state: false }
  },
  {
    code: 'SIREN_12V',
    name: 'Sirene Audiovisual Industrial 115dB / Buzzer 220V',
    cat: 'automation',
    icon: '📢',
    terminals: [
      ['+', 'IN', 'CTRL'],
      ['-', 'IN', 'N']
    ],
    kind: 'load_ac',
    params: { active: false, power: 15 }
  },
  {
    code: 'MAG_SENSOR',
    name: 'Sensor Magnético Reed Switch (Superfície para Porta/Janela)',
    cat: 'automation',
    icon: '🧲',
    terminals: [
      ['1', 'IN', 'CTRL'],
      ['2', 'OUT', 'CTRL']
    ],
    kind: 'switch',
    params: { closed: true }
  },
  {
    code: 'FLOAT_SW',
    name: 'Chave Boia Automática de Nível (Contatos Reversíveis Caixa/Cisterna)',
    cat: 'automation',
    icon: '💧',
    terminals: [
      ['COM', 'IN', 'CTRL'],
      ['NO', 'OUT', 'CTRL'],
      ['NC', 'OUT', 'CTRL']
    ],
    kind: 'switch',
    params: { levelHigh: true }
  },

  // ==========================================================================
  // 6. CARGAS REAIS E POTÊNCIA
  // ==========================================================================
  {
    code: 'M1PH',
    name: 'Motor Monofásico de Indução 1.5 CV (230V com Capacitor de Partida)',
    cat: 'loads',
    icon: '⚙️',
    terminals: [
      ['L', 'IN', 'L1'],
      ['N', 'IN', 'N'],
      ['PE', 'PE', 'PE']
    ],
    kind: 'motor1',
    params: { hp: 1.5, voltage: 230, cosPhi: 0.82, eff: 0.78, rpm: 1450, running: false },
    editableProps: [
      { key: 'hp', label: 'Potência do Motor (CV)', type: 'select', options: [{ label: '0.5 CV (370W)', value: 0.5 }, { label: '1.0 CV (735W)', value: 1.0 }, { label: '1.5 CV (1100W)', value: 1.5 }, { label: '2.0 CV (1500W)', value: 2.0 }, { label: '3.0 CV (2200W)', value: 3.0 }] }
    ]
  },
  {
    code: 'M3PH',
    name: 'Motor de Indução Trifásico Gaiola de Esquilo (2 CV a 50 CV - Y-Δ 6 Bornes)',
    cat: 'motors',
    icon: '⚙️',
    terminals: [
      ['U1', 'IN', 'L1'],
      ['V1', 'IN', 'L2'],
      ['W1', 'IN', 'L3'],
      ['W2', 'IN', 'L1'],
      ['U2', 'IN', 'L2'],
      ['V2', 'IN', 'L3'],
      ['PE', 'PE', 'PE']
    ],
    kind: 'motor3',
    params: { hp: 5.0, voltage: 400, cosPhi: 0.85, eff: 0.88, rpm: 2920, running: false, startingMethod: 'DOL' },
    editableProps: [
      { key: 'hp', label: 'Potência Mecânica (CV / HP)', type: 'select', options: [
        { label: '2 CV (1.5 kW - In=3.4A)', value: 2 },
        { label: '3 CV (2.2 kW - In=4.8A)', value: 3 },
        { label: '5 CV (3.7 kW - In=7.8A)', value: 5 },
        { label: '7.5 CV (5.5 kW - In=11.2A)', value: 7.5 },
        { label: '10 CV (7.5 kW - In=15.0A)', value: 10 },
        { label: '15 CV (11 kW - In=21.5A)', value: 15 },
        { label: '20 CV (15 kW - In=29.0A)', value: 20 },
        { label: '30 CV (22 kW - In=42.0A)', value: 30 },
        { label: '50 CV (37 kW - In=68.0A)', value: 50 }
      ] },
      { key: 'voltage', label: 'Tensão de Alimentação (V)', type: 'select', options: [{ label: '230V Trifásico', value: 230 }, { label: '400V Trifásico (IEC)', value: 400 }] },
      { key: 'startingMethod', label: 'Método de Partida Previsto', type: 'select', options: [{ label: 'Partida Direta (Ip = 7x In)', value: 'DOL' }, { label: 'Estrela-Triângulo Y-Δ (Ip = 2.3x In)', value: 'STAR_DELTA' }, { label: 'Soft-Starter (Ip = 2.5 a 3x In)', value: 'SOFT' }, { label: 'Inversor VFD (Ip = 1.0 a 1.2x In)', value: 'VFD' }] }
    ]
  },
  {
    code: 'LOAD_SHOWER',
    name: 'Chuveiro Elétrico Blindado (5500W / 7500W a 220V - NBR 5410)',
    cat: 'loads',
    icon: '🚿',
    terminals: [
      ['L', 'IN', 'L1'],
      ['N', 'IN', 'N'],
      ['PE', 'PE', 'PE']
    ],
    kind: 'load_shower',
    params: { power: 7500, voltage: 220, position: 'Inverno' },
    editableProps: [
      { key: 'power', label: 'Potência Máxima (W)', type: 'select', options: [{ label: '5500 W (25A a 220V)', value: 5500 }, { label: '6800 W (31A a 220V)', value: 6800 }, { label: '7500 W (34A a 220V)', value: 7500 }] },
      { key: 'position', label: 'Seletor de Temperatura', type: 'select', options: [{ label: 'Desligado (Frio)', value: 'Off' }, { label: 'Verão (Morno - 50% Potência)', value: 'Verao' }, { label: 'Inverno (Máximo)', value: 'Inverno' }] }
    ]
  },
  {
    code: 'LOAD_AC',
    name: 'Ar Condicionado Split Inverter (12.000 a 24.000 BTU/h - cos φ 0.95)',
    cat: 'loads',
    icon: '❄️',
    terminals: [
      ['L', 'IN', 'L1'],
      ['N', 'IN', 'N'],
      ['PE', 'PE', 'PE']
    ],
    kind: 'load_ac',
    params: { btu: 12000, power: 1080, voltage: 220 },
    editableProps: [
      { key: 'btu', label: 'Capacidade Térmica (BTU/h)', type: 'select', options: [{ label: '9.000 BTU (800W)', value: 9000 }, { label: '12.000 BTU (1080W)', value: 12000 }, { label: '18.000 BTU (1600W)', value: 18000 }, { label: '24.000 BTU (2200W)', value: 24000 }] }
    ]
  },
  {
    code: 'PUMP',
    name: 'Bomba d’Água Centrífuga/Submersa Monofásica/Trifásica (1 a 5 CV)',
    cat: 'loads',
    icon: '🚰',
    terminals: [
      ['L1', 'IN', 'L1'],
      ['L2', 'IN', 'L2'],
      ['L3', 'IN', 'L3'],
      ['PE', 'PE', 'PE']
    ],
    kind: 'pump',
    params: { hp: 2.0, power: 1500, voltage: 400, running: false }
  },
  {
    code: 'LAMP',
    name: 'Luminária LED Comercial / Industrial (18W Tubular a 50W Plafon)',
    cat: 'loads',
    icon: '💡',
    terminals: [
      ['L', 'IN', 'L1'],
      ['N', 'IN', 'N'],
      ['PE', 'PE', 'PE']
    ],
    kind: 'lamp',
    params: { power: 18, voltage: 230 },
    editableProps: [
      { key: 'power', label: 'Potência LED (W)', type: 'select', options: [{ label: '9 W (Bulbo E27)', value: 9 }, { label: '18 W (Tubular T8 120cm)', value: 18 }, { label: '36 W (Painel 60x60)', value: 36 }, { label: '50 W (Plafon de Alta Potência)', value: 50 }] }
    ]
  },
  {
    code: 'FLOODLIGHT',
    name: 'Refletor Projetor LED Industrial 200W IP66 (18.000 Lúmens)',
    cat: 'loads',
    icon: '🔦',
    terminals: [
      ['L', 'IN', 'L1'],
      ['N', 'IN', 'N'],
      ['PE', 'PE', 'PE']
    ],
    kind: 'lamp',
    params: { power: 200, voltage: 230 }
  },
  {
    code: 'OUTLET',
    name: 'Tomada de Uso Geral TUG / TUE 2P+T (10A / 20A 250V)',
    cat: 'loads',
    icon: '🔌',
    terminals: [
      ['L', 'IN', 'L1'],
      ['N', 'IN', 'N'],
      ['PE', 'PE', 'PE']
    ],
    kind: 'outlet',
    params: { rating: 10, connectedLoadW: 100 },
    editableProps: [
      { key: 'rating', label: 'Corrente Nominal da Tomada', type: 'select', options: [{ label: '10 A (Pinos Ø 4.0mm)', value: 10 }, { label: '20 A (Pinos Ø 4.8mm - Cargas Especiais)', value: 20 }] },
      { key: 'connectedLoadW', label: 'Carga Conectada na Tomada (W)', type: 'number', min: 0, max: 4400, step: 100, unit: 'W' }
    ]
  },
  {
    code: 'IND_SOCKET',
    name: 'Tomada Industrial de Sobrepor CEE IEC 60309 3P+N+T 32A 400V (Vermelha IP67)',
    cat: 'loads',
    icon: '🔴',
    terminals: [
      ['L1', 'IN', 'L1'], ['L2', 'IN', 'L2'], ['L3', 'IN', 'L3'], ['N', 'IN', 'N'],
      ['PE', 'PE', 'PE']
    ],
    kind: 'outlet',
    params: { rating: 32, voltage: 400 }
  },
  {
    code: 'HEATER',
    name: 'Resistência Elétrica de Aquecimento / Forno 3000W 230V',
    cat: 'loads',
    icon: '♨️',
    terminals: [
      ['1', 'IN', 'L1'],
      ['2', 'IN', 'N'],
      ['PE', 'PE', 'PE']
    ],
    kind: 'heater',
    params: { power: 3000, voltage: 230 }
  },

  // ==========================================================================
  // 7. INSTRUMENTAÇÃO E MEDIÇÃO
  // ==========================================================================
  {
    code: 'VM',
    name: 'Voltímetro Digital True-RMS de Painel DIN (Display LED 7 Seg)',
    cat: 'measurement',
    icon: '📟',
    terminals: [
      ['V+', 'IN', 'L1'],
      ['V-', 'IN', 'N']
    ],
    kind: 'measurement',
    params: { displayVal: 0, unit: 'V' }
  },
  {
    code: 'AM',
    name: 'Amperímetro Digital True-RMS de Painel DIN (Com TC Integrado 0-100A)',
    cat: 'measurement',
    icon: '📟',
    terminals: [
      ['I_IN', 'IN', 'L1'],
      ['I_OUT', 'OUT', 'L1']
    ],
    kind: 'measurement',
    params: { displayVal: 0, unit: 'A' }
  },
  {
    code: 'WM',
    name: 'Multimedidor Multifunção de Grandezas Elétricas (V, A, kW, kVAR, cos φ, Hz, kWh)',
    cat: 'measurement',
    icon: '📈',
    terminals: [
      ['L1', 'IN', 'L1'], ['L2', 'IN', 'L2'], ['L3', 'IN', 'L3'], ['N', 'IN', 'N'],
      ['I1', 'IN', 'L1'], ['I2', 'IN', 'L2'], ['I3', 'IN', 'L3']
    ],
    kind: 'measurement',
    params: { vRms: 0, iRms: 0, pKw: 0, cosPhi: 1.0, freq: 50, energyKWh: 0 }
  },
  {
    code: 'FREQ',
    name: 'Frequencímetro Digital de Precisão (45.0 a 65.0 Hz)',
    cat: 'measurement',
    icon: '📊',
    terminals: [
      ['L', 'IN', 'L1'],
      ['N', 'IN', 'N']
    ],
    kind: 'measurement',
    params: { displayVal: 50.0, unit: 'Hz' }
  },

  // SINALIZADORES VISUAIS
  {
    code: 'PILOT_GREEN',
    name: 'Sinaleiro LED Industrial Verde 22Vmm (Indicação de Ligado / Operação)',
    cat: 'command',
    icon: '🟢',
    terminals: [
      ['L', 'IN', 'CTRL'],
      ['N', 'IN', 'N']
    ],
    kind: 'lamp',
    params: { color: 'green', isOn: false }
  },
  {
    code: 'PILOT_RED',
    name: 'Sinaleiro LED Industrial Vermelho 22mm (Indicação de Falha / Trip / Desarme)',
    cat: 'command',
    icon: '🔴',
    terminals: [
      ['L', 'IN', 'CTRL'],
      ['N', 'IN', 'N']
    ],
    kind: 'lamp',
    params: { color: 'red', isOn: false }
  },
  {
    code: 'PILOT_YELLOW',
    name: 'Sinaleiro LED Industrial Amarelo 22mm (Indicação de Alerta / Atenção)',
    cat: 'command',
    icon: '🟡',
    terminals: [
      ['L', 'IN', 'CTRL'],
      ['N', 'IN', 'N']
    ],
    kind: 'lamp',
    params: { color: 'yellow', isOn: false }
  }
];

export const COMPONENT_MAP = new Map<string, ComponentDef>(
  COMPONENT_CATALOG.map(c => [c.code, c])
);

// Mapeamento de sinônimos/aliases para compatibilidade reversa
const COMPONENT_ALIASES: Record<string, string> = {
  PHOTOCELL: 'PHOTO_CELL',
  GEN_DIESEL: 'GENERATOR_DIESEL',
  ATS_SWITCH: 'ATS_100A',
  MTS_SWITCH: 'MTS_100A',
  PV_INVERTER_ONGRID: 'PV_INVERTER',
  PV_INVERTER_OFFGRID: 'PV_INVERTER',
  PV_INVERTER_HYBRID: 'PV_INVERTER',
  BAT_LIFEPO4: 'BAT',
  SRC1: 'SRC_AC1',
  SRC3: 'SRC_AC3',
  SRC_DC: 'BAT',
  SRC_DC24: 'BAT',
  SEL: 'THREE_WAY',
  FLOAT: 'LIMIT_SWITCH',
  LIMIT: 'LIMIT_SWITCH'
};

export function getComponentDef(code: string): ComponentDef {
  const direct = COMPONENT_MAP.get(code);
  if (direct) return direct;
  const aliasCode = COMPONENT_ALIASES[code];
  if (aliasCode && COMPONENT_MAP.has(aliasCode)) {
    return COMPONENT_MAP.get(aliasCode)!;
  }
  return COMPONENT_CATALOG[0];
}
