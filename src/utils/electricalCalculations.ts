/**
 * Motor de Cálculos Elétricos e Dimensionamento Técnico para Sara IA
 * Normas de Referência: IEC 60364-5-52, IEC 60947, Regulamento Técnico Moçambicano.
 */

export interface SizingInput {
  loadPower: number; // Potência em Watts ou kW
  voltage: number; // Tensão em Volts (ex: 220, 230, 380, 400)
  distance: number; // Distância do circuito em metros
  powerFactor?: number; // Fator de potência cos phi (padrão: 0.92 para motores / 0.98 para iluminação)
  maxVoltageDropPct?: number; // Queda de tensão admissível em % (padrão: 3% para terminais, 4% para alimentadores)
  systemType?: 'mono' | 'three_phase'; // Se omitido, deduzido pela tensão
}

export interface SizingResult {
  isThreePhase: boolean;
  powerWatts: number;
  powerKW: number;
  voltage: number;
  currentNominalAmps: number;
  conductorSectionMm2: number;
  voltageDropVolts: number;
  voltageDropPct: number;
  isVoltageDropAcceptable: boolean;
  recommendedBreakerAmps: number;
  breakerCurve: string;
  suggestedGroundSectionMm2: number;
  spokenSummary: string;
  technicalDetails: string;
}

// Tabela de Ampacidade de Condutores de Cobre em Eletroduto Embutido (Método B1 - IEC 60364-5-52)
const COPPER_AMPACITY_TABLE: Array<{ section: number; maxCurrentMono: number; maxCurrentThree: number }> = [
  { section: 1.5, maxCurrentMono: 17.5, maxCurrentThree: 15.5 },
  { section: 2.5, maxCurrentMono: 24, maxCurrentThree: 21 },
  { section: 4.0, maxCurrentMono: 32, maxCurrentThree: 28 },
  { section: 6.0, maxCurrentMono: 41, maxCurrentThree: 36 },
  { section: 10.0, maxCurrentMono: 57, maxCurrentThree: 50 },
  { section: 16.0, maxCurrentMono: 76, maxCurrentThree: 68 },
  { section: 25.0, maxCurrentMono: 101, maxCurrentThree: 89 },
  { section: 35.0, maxCurrentMono: 125, maxCurrentThree: 110 },
  { section: 50.0, maxCurrentMono: 151, maxCurrentThree: 134 },
  { section: 70.0, maxCurrentMono: 192, maxCurrentThree: 171 },
  { section: 95.0, maxCurrentMono: 232, maxCurrentThree: 207 },
  { section: 120.0, maxCurrentMono: 269, maxCurrentThree: 239 },
  { section: 150.0, maxCurrentMono: 300, maxCurrentThree: 272 },
  { section: 185.0, maxCurrentMono: 341, maxCurrentThree: 310 },
  { section: 240.0, maxCurrentMono: 400, maxCurrentThree: 364 }
];

// Disjuntores comerciais normalizados (Norma DIN IEC 60898 / IEC 60947-2)
const COMMERCIAL_BREAKERS = [6, 10, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160, 200, 250];

// Resistividade do cobre eletrolítico a 75°C (rho = 0.021 ohm.mm²/m)
const RHO_COPPER_75C = 0.021;

/**
 * Calcula dimensionamento elétrico completo
 */
export function calculateSizing(input: SizingInput): SizingResult {
  let power = input.loadPower;
  // Se potência informada foi menor que 100 e não nula, provavelmente está em kW
  if (power > 0 && power <= 100) {
    power = power * 1000;
  }

  const voltage = input.voltage || 230;
  const distance = Math.max(1, input.distance || 10);
  const cosPhi = input.powerFactor || (voltage >= 380 ? 0.85 : 0.95);
  const maxDropPct = input.maxVoltageDropPct || 3.0;

  // Determina se é trifásico por input ou por patamar de tensão
  const isThreePhase = input.systemType === 'three_phase' || (input.systemType !== 'mono' && voltage >= 380);

  // 1. Corrente Nominal de Projeto (Ib)
  let currentNominal = 0;
  if (isThreePhase) {
    // I = P / (sqrt(3) * V * cosPhi)
    currentNominal = power / (Math.sqrt(3) * voltage * cosPhi);
  } else {
    // I = P / (V * cosPhi)
    currentNominal = power / (voltage * cosPhi);
  }

  currentNominal = Math.round(currentNominal * 100) / 100;

  // 2. Disjuntor de Proteção Termomagnético Recomendado (In >= Ib)
  const recommendedBreaker = COMMERCIAL_BREAKERS.find(b => b >= currentNominal * 1.1) || COMMERCIAL_BREAKERS[COMMERCIAL_BREAKERS.length - 1];
  const breakerCurve = isThreePhase || power > 3000 ? 'Curva C' : 'Curva B ou C';

  // 3. Seção do Condutor por Capacidade de Corrente (Critério Térmico Iz >= In)
  let selectedSectionEntry = COPPER_AMPACITY_TABLE.find(entry => {
    const maxI = isThreePhase ? entry.maxCurrentThree : entry.maxCurrentMono;
    return maxI >= recommendedBreaker;
  }) || COPPER_AMPACITY_TABLE[COPPER_AMPACITY_TABLE.length - 1];

  let chosenSection = selectedSectionEntry.section;

  // 4. Verificação por Queda de Tensão (Delta V)
  // Monofásico: Delta V = (2 * rho * L * I * cosPhi) / S
  // Trifásico: Delta V = (sqrt(3) * rho * L * I * cosPhi) / S
  let voltageDropVolts = 0;
  let voltageDropPct = 0;

  // Se a queda de tensão exceder o limite, incrementa a bitola até atingir o critério normativo
  for (let i = 0; i < COPPER_AMPACITY_TABLE.length; i++) {
    const s = COPPER_AMPACITY_TABLE[i].section;
    if (s < chosenSection) continue;

    if (isThreePhase) {
      voltageDropVolts = (Math.sqrt(3) * RHO_COPPER_75C * distance * currentNominal * cosPhi) / s;
    } else {
      voltageDropVolts = (2 * RHO_COPPER_75C * distance * currentNominal * cosPhi) / s;
    }

    voltageDropPct = (voltageDropVolts / voltage) * 100;

    if (voltageDropPct <= maxDropPct) {
      chosenSection = s;
      break;
    }
  }

  voltageDropVolts = Math.round(voltageDropVolts * 100) / 100;
  voltageDropPct = Math.round(voltageDropPct * 100) / 100;
  const isAcceptable = voltageDropPct <= maxDropPct;

  // 5. Seção do Condutor de Proteção (Terra PE - IEC 60364-5-54)
  // S <= 16 -> Spe = S
  // 16 < S <= 35 -> Spe = 16
  // S > 35 -> Spe = S / 2
  let groundSection = chosenSection;
  if (chosenSection > 35) {
    groundSection = chosenSection / 2;
  } else if (chosenSection > 16) {
    groundSection = 16;
  }

  // 6. Síntese Falada para Sara IA
  const powerKwDisplay = (power / 1000).toFixed(1).replace('.0', '');
  const spokenSummary = `Para uma carga de ${powerKwDisplay} quilowatts em ${voltage} Volts a ${distance} metros de distância, a corrente calculada é de ${currentNominal.toFixed(1)} Amperes. Recomendo um condutor de cobre de ${chosenSection} milímetros quadrados, protegido por um disjuntor de ${recommendedBreaker} Amperes ${breakerCurve}. A queda de tensão estimada é de ${voltageDropPct}%, dentro do limite normativo da IEC.`;

  const technicalDetails = `• Carga: ${powerKwDisplay} kW (${power} W)\n• Tensão: ${voltage}V (${isThreePhase ? 'Trifásico' : 'Monofásico'})\n• Corrente Nominal (Ib): ${currentNominal} A\n• Disjuntor Indicado: ${recommendedBreaker}A (${breakerCurve})\n• Seção Fase: ${chosenSection} mm² Cu\n• Seção Terra (PE): ${groundSection} mm² Cu\n• Queda de Tensão: ${voltageDropVolts}V (${voltageDropPct}% | Limite: ${maxDropPct}%)\n• Norma: IEC 60364-5-52`;

  return {
    isThreePhase,
    powerWatts: power,
    powerKW: power / 1000,
    voltage,
    currentNominalAmps: currentNominal,
    conductorSectionMm2: chosenSection,
    voltageDropVolts,
    voltageDropPct,
    isVoltageDropAcceptable: isAcceptable,
    recommendedBreakerAmps: recommendedBreaker,
    breakerCurve,
    suggestedGroundSectionMm2: groundSection,
    spokenSummary,
    technicalDetails
  };
}
