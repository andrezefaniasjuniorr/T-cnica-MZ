// ============================================================================
// TÉCNICAMZ PRO — MOTOR DE RENDERIZAÇÃO REALISTA 3D DE DISPOSITIVOS CAD ELÉTRICOS
// Normas: IEC 60947 (Aparelhagem BT), IEC 60364, DIN EN 50022 (Trilhos DIN 35mm)
// Visualização 3D Isometric / Orthographic PBR, Nomenclatura Compacta & Efeitos
// ============================================================================

import { getComponentDef } from './cadEngine';
import { getNormativeTerminalOffset } from './cadRouting';

// ----------------------------------------------------------------------------
// 1. TIPOS & INTERFACES ATUALIZADAS
// ----------------------------------------------------------------------------

export type DeviceBrand =
  | 'Schneider Electric'
  | 'Legrand'
  | 'Efapel'
  | 'Chint'
  | 'ABB'
  | 'Siemens'
  | 'Eaton';

export interface BrandStyle {
  name: DeviceBrand;
  shortName: string;
  primaryColor: string;
  accentColor: string;
  badgeBg: string;
  textColor: string;
  logoSvgText?: string;
}

export interface DeviceFaultState {
  fault?: boolean;          // Curto-circuito ativo
  sparking?: boolean;       // Centelhamento / arco elétrico
  sparkStartTime?: number;  // Início do evento de arco elétrico (~1.5s)
  isBurned?: boolean;       // Queima permanente do dispositivo (desativa condução)
  rotationDir?: 'CW' | 'CCW'; // Sentido horário ou anti-horário
  phaseSequence?: string;   // Sequência de fase RST ou RTS
  thermal?: boolean;        // Sobrecarga térmica / aquecimento
  temperature?: number;     // Temperatura estimada (°C)
  damaged?: boolean;        // Dispositivo queimado / danificado
  tripped?: boolean;        // Desarmado por proteção
  smokeAlpha?: number;      // Densidade da fumaça (0..1)
}

export interface DeviceSimulationState extends DeviceFaultState {
  closed?: boolean;
  pressed?: boolean;
  energized?: boolean;
  running?: boolean;
  rpm?: number;
  voltage?: number;         // Valor RMS de tensão (V)
  current?: number;         // Valor RMS de corrente (A)
  frequency?: number;       // Frequência (Hz)
  powerKW?: number;         // Potência ativa (kW)
  powerFactor?: number;     // Fator de potência (cos φ)
  energyKWh?: number;       // Energia acumulada (kWh)
  [key: string]: any;
}

export interface RenderDeviceOptions {
  component: {
    id: string;
    code: string;
    x: number;
    y: number;
    w?: number;
    h?: number;
    rot?: number;
    label?: string;
    brand?: DeviceBrand | string;
    brandName?: string;
    state?: DeviceSimulationState;
    params?: Record<string, any>;
  };
  camera: {
    zoom: number;
    pan: { x: number; y: number };
  };
  isSelected?: boolean;
  time?: number;            // Timestamp para animações contínuas
  simRunning?: boolean;
}

// ----------------------------------------------------------------------------
// 2. NOMENCLATURA COMPACTA INDUSTRIAL (IEC / ABNT / DIN)
// ----------------------------------------------------------------------------

export const COMPACT_DEVICE_CODES: Record<string, string> = {
  // Dispositivos de Proteção com Neutro (1P+N, 2P+N, 3P+N)
  MCB1: 'MCB 1P+N',
  MCB2: 'MCB 2P+N',
  MCB3: 'MCB 3P+N',
  MCB4: 'MCB 4P',
  MCCB: 'MCCB',
  RCD: 'IDR 2P+N',
  RCD4: 'IDR 3P+N',
  RCBO: 'RCBO 1P+N',
  FUSE: 'FUSE',
  FU3: 'FUSE 3P',
  SPD: 'DPS 1P+N',
  SPD3: 'DPS 3P+N',
  OLR: 'OLR',
  PHASE: 'RPF',

  // Dispositivos de Comando & Chaveamento
  PBNO: 'B/NA',
  PBNC: 'B/NF',
  SW: 'SW 1P',
  THREE_WAY: '3-WAY',
  FOUR_WAY: '4-WAY',
  ESTOP: 'E-STOP',
  SEL: 'SEL',
  LIMIT: 'LIMIT',
  FLOAT: 'FLOAT',
  CONTACTOR: 'KM',
  RELAY: 'KA',
  TIMER: 'KT (TON)',
  FLASH: 'KT (CYC)',
  BUZZ: 'BUZZ',

  // Motores & Cargas 3D Realistas
  M1PH: 'M 1F',
  M3PH: 'M 3F',
  MDC: 'M CC',
  FAN: 'FAN',
  PUMP: 'PUMP',
  LAMP: 'LAMP',
  HEATER: 'HEAT',
  LOAD_AC: 'AC 12k',
  LOAD_COOKTOP: 'COOKTOP',
  LOAD_SHOWER: 'CHUVEIRO',
  LOAD_MICROWAVE: 'MICRO',

  // Aterramento Físico & Caixas
  EARTH_ROD: 'HASTE PE',
  EARTH_PIT: 'CAIXA BEP',
  BARE_COPPER: 'CU NU',
  JUNCTION_BOX: 'WAGO CX',

  // Instrumentação & Medição
  VM: 'VOLT',
  AM: 'AMP',
  WM: 'WATT',
  FREQ: 'FREQ',
  ENERGY: 'kWh',
  COS: 'COS φ',
  SCOPE: 'DSO',

  // Fontes & Sistemas Solares
  SRC_AC1: 'AC 1F+N',
  SRC_AC3: 'AC 3F+N',
  SRC_DC24: 'DC 24V',
  BAT: 'BAT 12V',
  PSU: 'SMPS',
  GND: 'PE / GND',
  PV_PANEL: 'PV MOD',
  PV_INVERTER: 'INV MPPT',
  PV_STRINGBOX: 'STR-BOX',
  PV_SPD_DC: 'SPD DC'
};

// ----------------------------------------------------------------------------
// 3. SELEÇÃO DE MARCAS INDUSTRIAIS REAIS
// ----------------------------------------------------------------------------

export const REAL_BRANDS: Record<DeviceBrand, BrandStyle> = {
  'Schneider Electric': {
    name: 'Schneider Electric',
    shortName: 'Schneider',
    primaryColor: '#009933',
    accentColor: '#34d399',
    badgeBg: 'rgba(0, 153, 51, 0.22)',
    textColor: '#86efac'
  },
  Legrand: {
    name: 'Legrand',
    shortName: 'legrand',
    primaryColor: '#e11d48',
    accentColor: '#fb7185',
    badgeBg: 'rgba(225, 29, 72, 0.22)',
    textColor: '#fda4af'
  },
  Efapel: {
    name: 'Efapel',
    shortName: 'EFAPEL',
    primaryColor: '#0284c7',
    accentColor: '#38bdf8',
    badgeBg: 'rgba(2, 132, 199, 0.22)',
    textColor: '#7dd3fc'
  },
  Chint: {
    name: 'Chint',
    shortName: 'CHNT',
    primaryColor: '#2563eb',
    accentColor: '#60a5fa',
    badgeBg: 'rgba(37, 99, 235, 0.22)',
    textColor: '#93c5fd'
  },
  ABB: {
    name: 'ABB',
    shortName: 'ABB',
    primaryColor: '#dc2626',
    accentColor: '#f87171',
    badgeBg: 'rgba(220, 38, 38, 0.22)',
    textColor: '#fca5a5'
  },
  Siemens: {
    name: 'Siemens',
    shortName: 'SIEMENS',
    primaryColor: '#0d9488',
    accentColor: '#2dd4bf',
    badgeBg: 'rgba(13, 148, 136, 0.22)',
    textColor: '#5eead4'
  },
  Eaton: {
    name: 'Eaton',
    shortName: 'EATON',
    primaryColor: '#0284c7',
    accentColor: '#38bdf8',
    badgeBg: 'rgba(2, 132, 199, 0.22)',
    textColor: '#bae6fd'
  }
};

/**
 * Retorna o rótulo compacto oficial para exibição no Canvas
 */
export function getCompactDeviceLabel(code: string, customLabel?: string): string {
  if (customLabel && customLabel.length <= 10 && !customLabel.includes(' ')) {
    return customLabel.toUpperCase();
  }
  return COMPACT_DEVICE_CODES[code] || code;
}

// ----------------------------------------------------------------------------
// 4. MOTOR DE RENDERIZAÇÃO REALISTA 3D DE CAIXAS, MODULARIDADE E EFEITOS
// ----------------------------------------------------------------------------

/**
 * Desenha o corpo modular 3D termoplástico industrial DIN com iluminação direcional,
 * biselamentos de borda, chanfros laterais, trilho DIN, manípulos, medições e cargas.
 */
export function renderDevice(
  ctx: CanvasRenderingContext2D,
  options: RenderDeviceOptions
): void {
  const { component: c, camera: cam, isSelected = false, time = 0, simRunning = false } = options;
  const d = getComponentDef(c.code);
  const st: DeviceSimulationState = c.state || {};
  const zoom = cam.zoom;

  // Dimensões escaladas e extrusão tridimensional
  const cw = (c.w || 90) * zoom;
  const ch = (c.h || 75) * zoom;
  const depth3d = Math.max(4, 7 * zoom); // Profundidade 3D em perspectiva
  const rad = 6 * zoom;

  // Marca Comercial Customizável
  const brandText = (c.brandName !== undefined ? c.brandName : c.brand)?.toString().trim() || '';

  // Estados Operacionais
  const isTrip = Boolean(st.tripped);
  const isClosed = Boolean(st.closed) && !isTrip;
  const isThermal = Boolean(st.thermal);
  const isDamaged = Boolean(st.damaged);

  ctx.save();

  // 1. Sombra Tridimensional Projetada (Drop Shadow + Ambient Occlusion)
  ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
  ctx.beginPath();
  ctx.roundRect(-cw / 2 + depth3d + 2 * zoom, -ch / 2 + depth3d + 4 * zoom, cw, ch, rad);
  ctx.fill();

  // 2. Face Traseira / Extrusão Lateral 3D (Efeito de Profundidade do Módulo)
  const sideGrad = ctx.createLinearGradient(-cw / 2, -ch / 2, -cw / 2 + depth3d, -ch / 2 + depth3d);
  sideGrad.addColorStop(0, '#090d16');
  sideGrad.addColorStop(1, '#1e293b');

  // Lado Direito / Profundidade Externa
  ctx.fillStyle = sideGrad;
  ctx.beginPath();
  ctx.moveTo(cw / 2, -ch / 2 + rad);
  ctx.lineTo(cw / 2 + depth3d, -ch / 2 + rad + depth3d);
  ctx.lineTo(cw / 2 + depth3d, ch / 2 - rad + depth3d);
  ctx.lineTo(cw / 2, ch / 2 - rad);
  ctx.closePath();
  ctx.fill();

  // Face Inferior 3D
  ctx.fillStyle = '#020617';
  ctx.beginPath();
  ctx.moveTo(-cw / 2 + rad, ch / 2);
  ctx.lineTo(-cw / 2 + rad + depth3d, ch / 2 + depth3d);
  ctx.lineTo(cw / 2 - rad + depth3d, ch / 2 + depth3d);
  ctx.lineTo(cw / 2 - rad, ch / 2);
  ctx.closePath();
  ctx.fill();

  // 3. Presilhas DIN 35mm Traseiras (Mecanismo Metálico com Molas)
  ctx.fillStyle = '#0f172a';
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1 * zoom;
  // Presilha superior
  ctx.beginPath();
  ctx.roundRect(-cw * 0.25, -ch / 2 - 5 * zoom, cw * 0.5, 5 * zoom, 1 * zoom);
  ctx.fill();
  ctx.stroke();
  // Presilha inferior mecânica
  ctx.beginPath();
  ctx.roundRect(-cw * 0.25, ch / 2, cw * 0.5, 5 * zoom, 1 * zoom);
  ctx.fill();
  ctx.stroke();

  // 4. Face Frontal Principal — Gradiente Policarbonato 3D com Luz Superior Directa
  const boxGrad = ctx.createLinearGradient(-cw / 2, -ch / 2, cw / 2, ch / 2);
  if (isDamaged) {
    boxGrad.addColorStop(0, '#262626');
    boxGrad.addColorStop(0.5, '#0a0a0a');
    boxGrad.addColorStop(1, '#171717');
  } else if (isThermal) {
    boxGrad.addColorStop(0, '#991b1b');
    boxGrad.addColorStop(0.5, '#450a0a');
    boxGrad.addColorStop(1, '#18181b');
  } else {
    // Policarbonato texturizado RAL 7035
    boxGrad.addColorStop(0, '#334155');
    boxGrad.addColorStop(0.2, '#1e293b');
    boxGrad.addColorStop(0.8, '#0f172a');
    boxGrad.addColorStop(1, '#020617');
  }

  ctx.fillStyle = boxGrad;
  ctx.strokeStyle = isSelected
    ? '#38bdf8'
    : isThermal
    ? '#ef4444'
    : isClosed
    ? '#10b981'
    : '#475569';
  ctx.lineWidth = isSelected ? 2.5 * zoom : 1.5 * zoom;

  if (isSelected) {
    ctx.shadowColor = 'rgba(56, 189, 248, 0.6)';
    ctx.shadowBlur = 14 * zoom;
  }

  ctx.beginPath();
  ctx.roundRect(-cw / 2, -ch / 2, cw, ch, rad);
  ctx.fill();
  ctx.stroke();
  ctx.shadowColor = 'transparent';

  // 5. Bezel Especular 3D Superior/Esquerdo (Reflexo de Biselamento)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.roundRect(-cw / 2 + 2 * zoom, -ch / 2 + 2 * zoom, cw - 4 * zoom, ch - 4 * zoom, rad - 1);
  ctx.stroke();

  // 6. Marca Comercial Customizável
  if (brandText) {
    renderCustomBrandWatermark(ctx, brandText, -cw / 2 + 6 * zoom, -ch / 2 + 10 * zoom, zoom);
  }

  // 7. Rótulo Compacto Padrão (IEC / ABNT)
  const compactName = getCompactDeviceLabel(c.code, c.label);
  ctx.fillStyle = '#f8fafc';
  ctx.font = `bold ${Math.max(7, 8.5 * zoom)}px monospace`;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'top';
  ctx.fillText(compactName, cw / 2 - 6 * zoom, -ch / 2 + 5 * zoom);

  // 8. Renderização Específica por Categoria
  if (d.cat === 'measurement') {
    renderDigitalMeasurementPanel(ctx, c, d, st, cw, ch, zoom, simRunning, time);
  } else if (
    d.kind === 'breaker' ||
    d.kind === 'breaker2' ||
    d.kind === 'breaker3' ||
    d.kind === 'rcd' ||
    d.kind === 'rcd4' ||
    d.kind === 'rcbo'
  ) {
    renderDinSwitchHandle(ctx, c, d, st, cw, ch, zoom, isClosed, isTrip);
  } else if (
    d.kind.startsWith('load_') ||
    ['load_ac', 'load_cooktop', 'load_shower', 'load_microwave', 'heater'].includes(d.kind) ||
    d.code.startsWith('LOAD_')
  ) {
    renderRealisticLoad(ctx, c, d, st, cw, ch, zoom, time, simRunning);
  } else if (
    ['earth_rod', 'earth_pit', 'bare_copper', 'junction_box'].includes(d.kind) ||
    ['EARTH_ROD', 'EARTH_PIT', 'BARE_COPPER', 'JUNCTION_BOX'].includes(c.code)
  ) {
    renderGroundingAndJunction(ctx, c, d, st, cw, ch, zoom, time, simRunning);
  } else if (d.kind === 'push' || d.kind === 'switch') {
    renderPushButtonActuator(ctx, c, d, st, cw, ch, zoom);
  } else if (d.kind === 'contactor' || d.kind === 'relay') {
    renderContactorArmature(ctx, c, d, st, cw, ch, zoom);
  } else if (d.kind === 'motor3' || d.kind === 'motor1' || d.kind === 'fan') {
    renderMotorRotor(ctx, c, d, st, cw, ch, zoom, time, simRunning);
  } else if (d.kind === 'lamp') {
    renderPilotLamp(ctx, c, d, st, cw, ch, zoom);
  } else {
    // Fallback genérico com iluminação 3D
    ctx.fillStyle = st.energized ? '#34d399' : '#93c5fd';
    ctx.font = `${Math.max(14, 18 * zoom)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(d.icon, 0, 2 * zoom);
  }

  // 9. Bornes Metálicos em 3D com Parafusos em Fenda / Phillips
  renderMetallicScrewTerminals(ctx, c, d, cw, ch, zoom);

  // 10. Efeitos Físicos Visuais de Falha (Arc Flash, Aquecimento, Fumaça)
  renderFaultVisualEffects(ctx, st, cw, ch, zoom, time);

  ctx.restore();
}

// ----------------------------------------------------------------------------
// 5. SUB-RENDERIZADORES MODULARES & EFEITOS 3D
// ----------------------------------------------------------------------------

/**
 * Marca d'água/Logo do Fabricante
 */
function renderCustomBrandWatermark(
  ctx: CanvasRenderingContext2D,
  brandText: string,
  x: number,
  y: number,
  zoom: number
) {
  if (!brandText) return;
  ctx.save();
  const text = brandText.length > 14 ? brandText.substring(0, 14) : brandText;
  ctx.font = `bold ${Math.max(6, 7 * zoom)}px sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  const metrics = ctx.measureText(text);
  const tagW = Math.max(26 * zoom, metrics.width + 6 * zoom);
  const tagH = 9 * zoom;

  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  ctx.strokeStyle = 'rgba(51, 65, 85, 0.8)';
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.roundRect(x - 2 * zoom, y - 1 * zoom, tagW, tagH, 2 * zoom);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#cbd5e1';
  ctx.fillText(text, x + 1 * zoom, y);
  ctx.restore();
}

/**
 * Instrumentos de medição com Display Digital 3D (LCD / 7 Segmentos Retroiluminado)
 */
function renderDigitalMeasurementPanel(
  ctx: CanvasRenderingContext2D,
  c: any,
  d: any,
  st: DeviceSimulationState,
  cw: number,
  ch: number,
  zoom: number,
  simRunning: boolean,
  time: number
) {
  const bezelW = cw * 0.78;
  const bezelH = ch * 0.46;
  const bezelY = -bezelH * 0.38;

  ctx.save();
  // Moldura 3D Profunda com biselamento
  ctx.fillStyle = '#020617';
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1.4 * zoom;
  ctx.beginPath();
  ctx.roundRect(-bezelW / 2, bezelY, bezelW, bezelH, 3 * zoom);
  ctx.fill();
  ctx.stroke();

  // Vidro Proteção Especular e Gradiente do LCD
  const lcdGrad = ctx.createLinearGradient(0, bezelY, 0, bezelY + bezelH);
  if (simRunning) {
    lcdGrad.addColorStop(0, '#022c22');
    lcdGrad.addColorStop(0.5, '#065f46');
    lcdGrad.addColorStop(1, '#021c15');
  } else {
    lcdGrad.addColorStop(0, '#0f172a');
    lcdGrad.addColorStop(1, '#020617');
  }

  ctx.fillStyle = lcdGrad;
  ctx.beginPath();
  ctx.roundRect(-bezelW / 2 + 2 * zoom, bezelY + 2 * zoom, bezelW - 4 * zoom, bezelH - 4 * zoom, 2 * zoom);
  ctx.fill();

  let displayValue = '---';
  let unit = '';

  switch (d.code) {
    case 'VM': {
      const volts = simRunning && typeof st.voltage === 'number' ? st.voltage : 0.0;
      displayValue = volts > 0.1 ? volts.toFixed(1) : '0.0';
      unit = 'V RMS';
      break;
    }
    case 'AM': {
      const amps = simRunning && typeof st.current === 'number' ? st.current : 0.0;
      displayValue = amps > 0.01 ? amps.toFixed(2) : '0.00';
      unit = 'A RMS';
      break;
    }
    case 'FREQ': {
      const freq = simRunning && typeof st.frequency === 'number' ? st.frequency : 0.0;
      displayValue = freq > 0.5 ? freq.toFixed(1) : '0.0';
      unit = 'Hz';
      break;
    }
    case 'WM': {
      const kw = simRunning && typeof st.powerKW === 'number' ? st.powerKW : 0.0;
      displayValue = kw > 0.005 ? kw.toFixed(2) : '0.00';
      unit = 'kW';
      break;
    }
    case 'COS': {
      const pf = simRunning && typeof st.powerFactor === 'number' ? st.powerFactor : 1.0;
      displayValue = pf.toFixed(2);
      unit = 'cos φ';
      break;
    }
    case 'ENERGY': {
      const kwh = simRunning && typeof st.energyKWh === 'number' ? st.energyKWh : 0.0;
      displayValue = kwh.toFixed(1);
      unit = 'kWh';
      break;
    }
    default:
      displayValue = simRunning ? 'LIVE' : 'OFF';
      unit = d.icon || '';
  }

  // Segmentos LCD 7-seg Iluminados com Glow Effect
  ctx.fillStyle = simRunning ? '#34d399' : '#475569';
  ctx.font = `bold ${Math.max(10, 13 * zoom)}px monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  if (simRunning) {
    ctx.shadowColor = '#10b981';
    ctx.shadowBlur = 8 * zoom;
  }
  ctx.fillText(displayValue, 0, bezelY + bezelH * 0.45);
  ctx.shadowColor = 'transparent';

  // Unidade de Engenharia Sutil
  ctx.fillStyle = simRunning ? '#a7f3d0' : '#64748b';
  ctx.font = `bold ${Math.max(6, 6.5 * zoom)}px sans-serif`;
  ctx.textAlign = 'right';
  ctx.fillText(unit, bezelW / 2 - 4 * zoom, bezelY + bezelH - 3 * zoom);

  ctx.restore();
}

/**
 * Manípulo 3D Basculante DIN para Disjuntores e RCDs
 */
function renderDinSwitchHandle(
  ctx: CanvasRenderingContext2D,
  c: any,
  d: any,
  st: DeviceSimulationState,
  cw: number,
  ch: number,
  zoom: number,
  isClosed: boolean,
  isTrip: boolean
) {
  ctx.save();

  const slotW = (d.kind === 'breaker3' || d.kind === 'rcd4' ? 32 : d.kind === 'breaker2' ? 24 : 18) * zoom;
  const slotH = 26 * zoom;

  // Cavidade Recuada da Alavanca
  ctx.fillStyle = '#030712';
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.roundRect(-slotW / 2, -slotH / 2, slotW, slotH, 3 * zoom);
  ctx.fill();
  ctx.stroke();

  // Manípulo Extrudado 3D com Projeção Basculante
  const handleW = slotW - 3 * zoom;
  const handleH = 14 * zoom;
  const handleY = isClosed ? -slotH / 2 + 2 * zoom : isTrip ? -handleH / 2 : slotH / 2 - handleH - 2 * zoom;

  const hGrad = ctx.createLinearGradient(0, handleY, 0, handleY + handleH);
  if (isTrip) {
    hGrad.addColorStop(0, '#f87171');
    hGrad.addColorStop(0.5, '#dc2626');
    hGrad.addColorStop(1, '#7f1d1d');
  } else if (isClosed) {
    hGrad.addColorStop(0, '#4ade80');
    hGrad.addColorStop(0.5, '#16a34a');
    hGrad.addColorStop(1, '#14532d');
  } else {
    hGrad.addColorStop(0, '#64748b');
    hGrad.addColorStop(0.5, '#334155');
    hGrad.addColorStop(1, '#0f172a');
  }

  // Sombra Tridimensional sob a Alavanca
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillRect(-handleW / 2, handleY + handleH, handleW, 3 * zoom);

  ctx.fillStyle = hGrad;
  ctx.beginPath();
  ctx.roundRect(-handleW / 2, handleY, handleW, handleH, 3 * zoom);
  ctx.fill();

  // Textura Antiderrapante 3D
  ctx.strokeStyle = 'rgba(255,255,255,0.25)';
  ctx.lineWidth = 1 * zoom;
  for (let i = -handleW * 0.3; i <= handleW * 0.3; i += 4 * zoom) {
    ctx.beginPath();
    ctx.moveTo(i, handleY + 2 * zoom);
    ctx.lineTo(i, handleY + handleH - 2 * zoom);
    ctx.stroke();
  }

  // Marcação I / O / TRIP
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${Math.max(7, 8 * zoom)}px monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(isTrip ? 'TRIP' : isClosed ? 'I' : 'O', 0, handleY + handleH / 2);

  // Botão de Teste IDR
  if (d.kind === 'rcd' || d.kind === 'rcbo') {
    const testR = 4 * zoom;
    const testX = cw * 0.32;
    const testY = 0;
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(testX, testY, testR, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0f172a';
    ctx.font = `bold ${Math.max(6, 6.5 * zoom)}px sans-serif`;
    ctx.fillText('T', testX, testY);
  }

  ctx.restore();
}

/**
 * NEW: Renderizador Realista 3D de Cargas (Ar Condicionado Split, Cooktop Indução, Chuveiro Elétrico e Micro-ondas)
 */
function renderRealisticLoad(
  ctx: CanvasRenderingContext2D,
  c: any,
  d: any,
  st: DeviceSimulationState,
  cw: number,
  ch: number,
  zoom: number,
  time: number,
  simRunning: boolean
) {
  const code = (c.code || '').toUpperCase();
  const kind = (d.kind || '').toLowerCase();
  const isEnergized = Boolean(st.energized || st.running);

  ctx.save();

  if (code === 'LOAD_AC' || kind === 'load_ac') {
    // ------------------------------------------------------------------------
    // AR CONDICIONADO SPLIT INVERTER 3D
    // ------------------------------------------------------------------------
    const bodyW = cw * 0.85;
    const bodyH = ch * 0.5;
    const bodyY = -bodyH * 0.3;

    // Carcaça Termoplástica Branca Especular
    const acGrad = ctx.createLinearGradient(0, bodyY, 0, bodyY + bodyH);
    acGrad.addColorStop(0, '#ffffff');
    acGrad.addColorStop(0.7, '#e2e8f0');
    acGrad.addColorStop(1, '#cbd5e1');

    ctx.fillStyle = acGrad;
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.2 * zoom;
    ctx.beginPath();
    ctx.roundRect(-bodyW / 2, bodyY, bodyW, bodyH, 4 * zoom);
    ctx.fill();
    ctx.stroke();

    // Defletor de Ar / Aleta Inferior Oscillante
    const bladeY = bodyY + bodyH - 4 * zoom;
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(-bodyW * 0.42, bladeY, bodyW * 0.84, 2 * zoom);

    // Display Digital Oculto Inverter
    if (isEnergized && simRunning) {
      ctx.fillStyle = '#0284c7';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 6 * zoom;
      ctx.font = `bold ${Math.max(7, 8 * zoom)}px monospace`;
      ctx.textAlign = 'right';
      ctx.fillText('21°C', bodyW * 0.38, bodyY + bodyH * 0.4);
      ctx.shadowColor = 'transparent';
    }

  } else if (code === 'LOAD_COOKTOP' || kind === 'load_cooktop') {
    // ------------------------------------------------------------------------
    // PLACA DE INDUÇÃO / COOKTOP VITROCERÂMICO 3D
    // ------------------------------------------------------------------------
    const glassW = cw * 0.82;
    const glassH = ch * 0.6;
    const glassY = -glassH * 0.35;

    // Vidro Vitrocerâmico Preto Espelhado
    const glassGrad = ctx.createLinearGradient(-glassW / 2, glassY, glassW / 2, glassY + glassH);
    glassGrad.addColorStop(0, '#18181b');
    glassGrad.addColorStop(0.5, '#09090b');
    glassGrad.addColorStop(1, '#27272a');

    ctx.fillStyle = glassGrad;
    ctx.strokeStyle = '#52525b';
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.roundRect(-glassW / 2, glassY, glassW, glassH, 3 * zoom);
    ctx.fill();
    ctx.stroke();

    // Zonas de Indução Circular Iluminadas
    const radius = 10 * zoom;
    const centers = [-glassW * 0.22, glassW * 0.22];

    centers.forEach((cx) => {
      ctx.beginPath();
      ctx.arc(cx, glassY + glassH * 0.5, radius, 0, Math.PI * 2);
      ctx.strokeStyle = isEnergized ? '#ef4444' : '#3f3f46';
      ctx.lineWidth = 1.5 * zoom;
      if (isEnergized) {
        ctx.shadowColor = '#dc2626';
        ctx.shadowBlur = 8 * zoom;
      }
      ctx.stroke();
      ctx.shadowColor = 'transparent';
    });

  } else if (code === 'LOAD_SHOWER' || kind === 'load_shower') {
    // ------------------------------------------------------------------------
    // CHUVEIRO ELÉTRICO DE ALTA POTÊNCIA 3D
    // ------------------------------------------------------------------------
    const rHead = Math.min(cw, ch) * 0.32;
    const showerY = -2 * zoom;

    // Cabeçote Termoplástico Cilindro 3D
    const shwGrad = ctx.createRadialGradient(0, showerY - 3 * zoom, 2 * zoom, 0, showerY, rHead);
    shwGrad.addColorStop(0, '#ffffff');
    shwGrad.addColorStop(0.6, '#cbd5e1');
    shwGrad.addColorStop(1, '#64748b');

    ctx.fillStyle = shwGrad;
    ctx.beginPath();
    ctx.arc(0, showerY, rHead, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.2 * zoom;
    ctx.stroke();

    // Crivo / Micro-orifícios de Água
    ctx.fillStyle = '#334155';
    for (let i = 0; i < 8; i++) {
      const ang = (i * Math.PI) / 4;
      ctx.beginPath();
      ctx.arc(Math.cos(ang) * (rHead * 0.55), showerY + Math.sin(ang) * (rHead * 0.55), 1.2 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }

    // Se energizado: Simulação de Fluxo de Água
    if (isEnergized && simRunning) {
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
      ctx.lineWidth = 1 * zoom;
      for (let k = -rHead * 0.6; k <= rHead * 0.6; k += 4 * zoom) {
        const offset = (time * 40 + k * 3) % 10;
        ctx.beginPath();
        ctx.moveTo(k, showerY + rHead);
        ctx.lineTo(k, showerY + rHead + 6 * zoom + offset);
        ctx.stroke();
      }
    }

  } else if (code === 'LOAD_MICROWAVE' || kind === 'load_microwave') {
    // ------------------------------------------------------------------------
    // FORNO MICRO-ONDAS INDUSTRIAL 3D
    // ------------------------------------------------------------------------
    const mW = cw * 0.85;
    const mH = ch * 0.52;
    const mY = -mH * 0.35;

    // Gabinete em Aço Inox Escovado
    const mwGrad = ctx.createLinearGradient(-mW / 2, mY, mW / 2, mY + mH);
    mwGrad.addColorStop(0, '#94a3b8');
    mwGrad.addColorStop(0.5, '#cbd5e1');
    mwGrad.addColorStop(1, '#64748b');

    ctx.fillStyle = mwGrad;
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.2 * zoom;
    ctx.beginPath();
    ctx.roundRect(-mW / 2, mY, mW, mH, 3 * zoom);
    ctx.fill();
    ctx.stroke();

    // Porta de Visor Oculto com Rede Proteção
    const doorW = mW * 0.6;
    ctx.fillStyle = isEnergized ? 'rgba(254, 240, 138, 0.35)' : '#020617';
    ctx.fillRect(-mW / 2 + 4 * zoom, mY + 4 * zoom, doorW, mH - 8 * zoom);

  } else {
    // Carga Resistiva / Aquecedor Generico
    ctx.fillStyle = isEnergized ? '#f97316' : '#64748b';
    ctx.font = `${Math.max(14, 18 * zoom)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⚡', 0, 0);
  }

  ctx.restore();
}

/**
 * NEW: Renderizador de Aterramento Físico (BEP, Haste Copperweld, Cobre Nu e Caixa WAGO)
 */
function renderGroundingAndJunction(
  ctx: CanvasRenderingContext2D,
  c: any,
  d: any,
  st: DeviceSimulationState,
  cw: number,
  ch: number,
  zoom: number,
  time: number,
  simRunning: boolean
) {
  const code = (c.code || '').toUpperCase();
  const kind = (d.kind || '').toLowerCase();

  ctx.save();

  if (code === 'EARTH_ROD' || kind === 'earth_rod') {
    // ------------------------------------------------------------------------
    // HASTE DE ATERRAMENTO COPPERWELD 3D (Alta Condutividade)
    // ------------------------------------------------------------------------
    const rodW = 10 * zoom;
    const rodH = ch * 0.72;

    // Perfil Núcleo de Aço Cobreado Gradiente Metálico
    const rodGrad = ctx.createLinearGradient(-rodW / 2, 0, rodW / 2, 0);
    rodGrad.addColorStop(0, '#b45309');
    rodGrad.addColorStop(0.4, '#f59e0b');
    rodGrad.addColorStop(0.8, '#d97706');
    rodGrad.addColorStop(1, '#78350f');

    ctx.fillStyle = rodGrad;
    ctx.fillRect(-rodW / 2, -rodH / 2, rodW, rodH);

    // Conector de Aperto em Latão / Bronze
    ctx.fillStyle = '#eab308';
    ctx.strokeStyle = '#854d0e';
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.roundRect(-rodW * 0.8, -rodH / 4, rodW * 1.6, 10 * zoom, 2 * zoom);
    ctx.fill();
    ctx.stroke();

  } else if (code === 'EARTH_PIT' || kind === 'earth_pit') {
    // ------------------------------------------------------------------------
    // BARRAMENTO DE EQUIPOTENCIALIZAÇÃO PRINCIPAL (BEP) / CAIXA ATERRAMENTO
    // ------------------------------------------------------------------------
    const pitW = cw * 0.82;
    const pitH = ch * 0.55;

    // Caixa Termoplástica Insulada
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#10b981'; // Cor da Norma PE
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.roundRect(-pitW / 2, -pitH / 2, pitW, pitH, 4 * zoom);
    ctx.fill();
    ctx.stroke();

    // Barra Cobre Maciço no Interior do BEP
    const barW = pitW * 0.75;
    const barH = 10 * zoom;
    const barGrad = ctx.createLinearGradient(-barW / 2, 0, barW / 2, 0);
    barGrad.addColorStop(0, '#d97706');
    barGrad.addColorStop(0.5, '#f59e0b');
    barGrad.addColorStop(1, '#b45309');

    ctx.fillStyle = barGrad;
    ctx.fillRect(-barW / 2, -barH / 2, barW, barH);

    // Parafusos M6 de Aterramento
    ctx.fillStyle = '#fef08a';
    for (let x = -barW * 0.35; x <= barW * 0.35; x += barW * 0.23) {
      ctx.beginPath();
      ctx.arc(x, 0, 2.2 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }

  } else if (code === 'BARE_COPPER' || kind === 'bare_copper') {
    // ------------------------------------------------------------------------
    // CABO DE COBRE NU MULTIFILAR
    // ------------------------------------------------------------------------
    const w = cw * 0.8;
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 4 * zoom;
    ctx.beginPath();
    ctx.moveTo(-w / 2, 0);
    ctx.lineTo(w / 2, 0);
    ctx.stroke();

    // Textura Espiral de Fios Trançados
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1 * zoom;
    for (let x = -w / 2; x < w / 2; x += 5 * zoom) {
      ctx.beginPath();
      ctx.moveTo(x, -2 * zoom);
      ctx.lineTo(x + 3 * zoom, 2 * zoom);
      ctx.stroke();
    }

  } else if (code === 'JUNCTION_BOX' || kind === 'junction_box') {
    // ------------------------------------------------------------------------
    // CONECTOR RÁPIDO COMPACTO WAGO / CAIXA DE PASSAGEM 3D
    // ------------------------------------------------------------------------
    const boxW = cw * 0.72;
    const boxH = ch * 0.52;

    // Policarbonato Transparente
    ctx.fillStyle = 'rgba(241, 245, 249, 0.25)';
    ctx.strokeStyle = '#f97316'; // Laranja WAGO
    ctx.lineWidth = 1.8 * zoom;
    ctx.beginPath();
    ctx.roundRect(-boxW / 2, -boxH / 2, boxW, boxH, 3 * zoom);
    ctx.fill();
    ctx.stroke();

    // Alavancas de Conexão Laranja
    const levW = boxW * 0.2;
    for (let i = -boxW * 0.3; i <= boxW * 0.3; i += boxW * 0.3) {
      ctx.fillStyle = '#ea580c';
      ctx.fillRect(i - levW / 2, -boxH / 2 + 2 * zoom, levW, 6 * zoom);
    }
  }

  ctx.restore();
}

/**
 * Botoeiras Industriais 3D
 */
function renderPushButtonActuator(
  ctx: CanvasRenderingContext2D,
  c: any,
  d: any,
  st: DeviceSimulationState,
  cw: number,
  ch: number,
  zoom: number
) {
  const isPressed = Boolean(st.pressed);
  const isNO = c.code === 'PBNO';
  const isEstop = c.code === 'ESTOP';

  const rOuter = Math.min(cw, ch) * 0.34;
  const travel = isPressed ? 2.5 * zoom : 0;
  const rButton = (rOuter - 3 * zoom) * (isPressed ? 0.92 : 1.0);

  ctx.save();

  // Anel Cromado Especular
  const bezel = ctx.createRadialGradient(-rOuter * 0.3, -rOuter * 0.3, rOuter * 0.1, 0, 0, rOuter);
  bezel.addColorStop(0, '#ffffff');
  bezel.addColorStop(0.5, '#94a3b8');
  bezel.addColorStop(1, '#1e293b');
  ctx.fillStyle = bezel;
  ctx.beginPath();
  ctx.arc(0, 0, rOuter, 0, Math.PI * 2);
  ctx.fill();

  // Atuador Cilíndrico Extrudado
  const btnGrad = ctx.createRadialGradient(-rButton * 0.3, -rButton * 0.3 + travel, rButton * 0.1, 0, travel, rButton);
  if (isEstop) {
    btnGrad.addColorStop(0, '#f87171');
    btnGrad.addColorStop(0.5, '#dc2626');
    btnGrad.addColorStop(1, '#7f1d1d');
  } else if (isNO) {
    btnGrad.addColorStop(0, '#86efac');
    btnGrad.addColorStop(0.5, '#16a34a');
    btnGrad.addColorStop(1, '#14532d');
  } else {
    btnGrad.addColorStop(0, '#fca5a5');
    btnGrad.addColorStop(0.5, '#dc2626');
    btnGrad.addColorStop(1, '#7f1d1d');
  }

  ctx.fillStyle = btnGrad;
  ctx.beginPath();
  ctx.arc(0, travel, rButton, 0, Math.PI * 2);
  ctx.fill();

  // Gravação no Botão
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${Math.max(8, 9 * zoom)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(isEstop ? 'STOP' : isNO ? 'I' : 'O', 0, travel);

  ctx.restore();
}

/**
 * Contatores de Potência (KM)
 */
function renderContactorArmature(
  ctx: CanvasRenderingContext2D,
  c: any,
  d: any,
  st: DeviceSimulationState,
  cw: number,
  ch: number,
  zoom: number
) {
  const isEnergized = Boolean(st.energized);
  const pW = cw * 0.68;
  const pH = ch * 0.3;
  const pY = -pH * 0.4;

  ctx.save();

  ctx.fillStyle = '#030712';
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.roundRect(-pW / 2, pY, pW, pH, 3 * zoom);
  ctx.fill();
  ctx.stroke();

  const pGrad = ctx.createLinearGradient(0, pY, 0, pY + pH);
  if (isEnergized) {
    pGrad.addColorStop(0, '#065f46');
    pGrad.addColorStop(0.5, '#059669');
    pGrad.addColorStop(1, '#022c22');
  } else {
    pGrad.addColorStop(0, '#334155');
    pGrad.addColorStop(0.5, '#1e293b');
    pGrad.addColorStop(1, '#0f172a');
  }

  ctx.fillStyle = pGrad;
  ctx.beginPath();
  ctx.roundRect(-pW / 2 + 2 * zoom, pY + 2 * zoom, pW - 4 * zoom, pH - 4 * zoom, 2 * zoom);
  ctx.fill();

  ctx.fillStyle = isEnergized ? '#a7f3d0' : '#94a3b8';
  ctx.font = `bold ${Math.max(7, 8 * zoom)}px monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(isEnergized ? '▲ ATRACADO' : '▼ REPOUSO', 0, pY + pH / 2);

  ctx.restore();
}

/**
 * Rotor de Motores Elétricos 3D com Rotação
 */
function renderMotorRotor(
  ctx: CanvasRenderingContext2D,
  c: any,
  d: any,
  st: DeviceSimulationState,
  cw: number,
  ch: number,
  zoom: number,
  time: number,
  simRunning: boolean
) {
  const isBurned = Boolean(st.isBurned || st.damaged || c?.state?.isBurned);
  const isRunning = Boolean(simRunning && st.running && (st.rpm || 0) > 0 && !isBurned);
  const rpm = isRunning ? (st.rpm || 0) : 0;
  const radius = Math.min(cw, ch) * 0.29;
  const rotDir = st.rotationDir || c?.state?.rotationDir || 'CW';
  const phaseSeq = st.phaseSequence || c?.state?.phaseSequence || (rotDir === 'CW' ? 'RST' : 'RTS');
  const dir = rotDir === 'CCW' ? -1 : 1;

  ctx.save();

  // Carcaça Cilíndrica Estator 3D
  const carGrad = ctx.createRadialGradient(-radius * 0.3, -2 * zoom - radius * 0.3, radius * 0.1, 0, -2 * zoom, radius);
  if (isBurned) {
    carGrad.addColorStop(0, '#1c1917');
    carGrad.addColorStop(0.7, '#0f172a');
    carGrad.addColorStop(1, '#020617');
  } else {
    carGrad.addColorStop(0, isRunning ? (rotDir === 'CW' ? '#065f46' : '#075985') : '#475569');
    carGrad.addColorStop(0.8, isRunning ? (rotDir === 'CW' ? '#042f2e' : '#0c4a6e') : '#1e293b');
    carGrad.addColorStop(1, '#020617');
  }
  ctx.fillStyle = carGrad;
  ctx.beginPath();
  ctx.arc(0, -2 * zoom, radius, 0, Math.PI * 2);
  ctx.fill();

  // Aletas de Ventilação Estator
  ctx.strokeStyle = isBurned ? '#44403c' : (isRunning ? '#059669' : '#334155');
  ctx.lineWidth = 1 * zoom;
  for (let a = 0; a < 8; a++) {
    const angle = (a * Math.PI) / 4;
    ctx.beginPath();
    ctx.moveTo(Math.cos(angle) * (radius * 0.84), -2 * zoom + Math.sin(angle) * (radius * 0.84));
    ctx.lineTo(Math.cos(angle) * radius, -2 * zoom + Math.sin(angle) * radius);
    ctx.stroke();
  }

  // Eixo Rotor Dinâmico 3D
  ctx.save();
  ctx.translate(0, -2 * zoom);
  ctx.rotate(isRunning ? (dir * time * (rpm / 60) * Math.PI * 2) : 0);

  ctx.strokeStyle = isBurned ? '#52525b' : (isRunning ? (rotDir === 'CW' ? '#6ee7b7' : '#7dd3fc') : '#94a3b8');
  ctx.lineWidth = 2.2 * zoom;
  ctx.lineCap = 'round';
  for (let i = 0; i < 4; i++) {
    ctx.rotate(Math.PI / 2);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, radius * 0.72);
    ctx.stroke();
  }
  ctx.restore();

  // Seta Indicadora de Sentido de Giro (CW / CCW)
  if (isRunning) {
    ctx.save();
    ctx.translate(0, -2 * zoom);
    const arrowR = radius * 0.88;
    const arrowColor = rotDir === 'CW' ? '#34d399' : '#38bdf8';
    ctx.strokeStyle = arrowColor;
    ctx.lineWidth = 1.6 * zoom;

    ctx.beginPath();
    if (rotDir === 'CW') {
      ctx.arc(0, 0, arrowR, -Math.PI * 0.65, Math.PI * 0.15);
    } else {
      ctx.arc(0, 0, arrowR, -Math.PI * 0.35, Math.PI * 0.85, true);
    }
    ctx.stroke();

    ctx.fillStyle = arrowColor;
    ctx.beginPath();
    if (rotDir === 'CW') {
      const tx = Math.cos(Math.PI * 0.15) * arrowR;
      const ty = Math.sin(Math.PI * 0.15) * arrowR;
      ctx.moveTo(tx, ty);
      ctx.lineTo(tx - 3.5 * zoom, ty - 3.5 * zoom);
      ctx.lineTo(tx + 0.5 * zoom, ty - 4.5 * zoom);
    } else {
      const tx = Math.cos(Math.PI * 0.85) * arrowR;
      const ty = Math.sin(Math.PI * 0.85) * arrowR;
      ctx.moveTo(tx, ty);
      ctx.lineTo(tx + 3.5 * zoom, ty - 3.5 * zoom);
      ctx.lineTo(tx - 0.5 * zoom, ty - 4.5 * zoom);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // Rótulos de Estado do Motor
  ctx.textAlign = 'center';

  if (isBurned) {
    ctx.fillStyle = '#ef4444';
    ctx.font = `bold ${Math.max(6.5, 7.5 * zoom)}px monospace`;
    ctx.fillText('AVARIA (QUEIMADO)', 0, ch / 2 - 7 * zoom);
  } else if (isRunning) {
    const dirLabel = `${rotDir} • ${phaseSeq}`;
    ctx.fillStyle = rotDir === 'CW' ? '#34d399' : '#38bdf8';
    ctx.font = `bold ${Math.max(6.5, 7.5 * zoom)}px monospace`;
    ctx.fillText(dirLabel, 0, ch / 2 - 13 * zoom);

    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.max(7, 8.5 * zoom)}px monospace`;
    ctx.fillText(`${Math.round(rpm)} RPM`, 0, ch / 2 - 3.5 * zoom);
  } else {
    ctx.fillStyle = '#64748b';
    ctx.font = `bold ${Math.max(7, 8 * zoom)}px monospace`;
    ctx.fillText('PARADO', 0, ch / 2 - 7 * zoom);
  }

  ctx.restore();
}

/**
 * Sinalizadores de Painel / Lâmpada Piloto
 */
function renderPilotLamp(
  ctx: CanvasRenderingContext2D,
  c: any,
  d: any,
  st: DeviceSimulationState,
  cw: number,
  ch: number,
  zoom: number
) {
  const isOn = Boolean(st.energized && !st.tripped);
  const r = 13 * zoom;

  ctx.save();
  if (isOn) {
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur = 18 * zoom;

    const onGrad = ctx.createRadialGradient(0, -2 * zoom, 2 * zoom, 0, -2 * zoom, r);
    onGrad.addColorStop(0, '#ffffff');
    onGrad.addColorStop(0.4, '#fef08a');
    onGrad.addColorStop(1, '#eab308');
    ctx.fillStyle = onGrad;
  } else {
    const offGrad = ctx.createRadialGradient(-2 * zoom, -4 * zoom, 1 * zoom, 0, -2 * zoom, r);
    offGrad.addColorStop(0, '#334155');
    offGrad.addColorStop(0.7, '#1e293b');
    offGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = offGrad;
  }

  ctx.beginPath();
  ctx.arc(0, -2 * zoom, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = isOn ? '#fef08a' : '#475569';
  ctx.lineWidth = 1.5 * zoom;
  ctx.stroke();

  ctx.restore();
}

/**
 * NEW: Renderiza Bornes Metálicos Tridimensionais com Parafusos em Fenda / Phillips
 */
function renderMetallicScrewTerminals(
  ctx: CanvasRenderingContext2D,
  c: any,
  d: any,
  cw: number,
  ch: number,
  zoom: number
) {
  const termCount = d.terminals ? d.terminals.length : 0;
  if (termCount === 0) return;

  ctx.save();

  d.terminals.forEach((term: any) => {
    // Cálculo do offset normativo do borne
    const offset = getNormativeTerminalOffset(term.id, cw, ch, zoom);
    const tx = offset.x;
    const ty = offset.y;
    const rScrew = 3.8 * zoom;

    // Alvéolo Recuado do Borne
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.arc(tx, ty, rScrew + 1.2 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Cabeça do Parafuso de Latão/Aço Especular 3D
    const screwGrad = ctx.createRadialGradient(tx - rScrew * 0.3, ty - rScrew * 0.3, rScrew * 0.1, tx, ty, rScrew);
    screwGrad.addColorStop(0, '#ffffff');
    screwGrad.addColorStop(0.5, '#94a3b8');
    screwGrad.addColorStop(1, '#475569');

    ctx.fillStyle = screwGrad;
    ctx.beginPath();
    ctx.arc(tx, ty, rScrew, 0, Math.PI * 2);
    ctx.fill();

    // Fenda Transversal em Ângulo 3D
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(tx - rScrew * 0.6, ty - rScrew * 0.6);
    ctx.lineTo(tx + rScrew * 0.6, ty + rScrew * 0.6);
    ctx.stroke();
  });

  ctx.restore();
}

/**
 * NEW: Efeitos Físicos Visuais de Falha (Centelhamento / Arco Elétrico, Aquecimento Térmico e Fumaça)
 */
function renderFaultVisualEffects(
  ctx: CanvasRenderingContext2D,
  st: DeviceSimulationState,
  cw: number,
  ch: number,
  zoom: number,
  time: number
) {
  ctx.save();

  // 1. Centelhamento / Arco Elétrico (Arc Flash / Sparking)
  if (st.sparking || st.fault) {
    const sparkCount = 6;
    ctx.strokeStyle = '#38bdf8';
    ctx.shadowColor = '#60a5fa';
    ctx.shadowBlur = 12 * zoom;
    ctx.lineWidth = 1.5 * zoom;

    for (let i = 0; i < sparkCount; i++) {
      const ang = (Math.random() * Math.PI * 2);
      const dist = (Math.random() * cw * 0.4);
      const sx = Math.cos(ang) * dist;
      const sy = Math.sin(ang) * dist;

      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx + (Math.random() - 0.5) * 12 * zoom, sy + (Math.random() - 0.5) * 12 * zoom);
      ctx.stroke();
    }
  }

  // 2. Sobreaquecimento Térmico (Aura Brilhante de Calor)
  if (st.thermal && st.temperature) {
    const heatAlpha = Math.min(0.65, (st.temperature - 40) / 100);
    if (heatAlpha > 0) {
      ctx.fillStyle = `rgba(239, 68, 68, ${heatAlpha})`;
      ctx.beginPath();
      ctx.roundRect(-cw / 2, -ch / 2, cw, ch, 6 * zoom);
      ctx.fill();
    }
  }

  // 3. Fumaça de Queima Permanece Ativa
  if (st.smokeAlpha && st.smokeAlpha > 0.05) {
    ctx.fillStyle = `rgba(120, 113, 108, ${st.smokeAlpha * 0.5})`;
    for (let k = 0; k < 3; k++) {
      const smokeR = (12 + k * 8) * zoom;
      const offsetY = -ch / 2 - (k * 10 * zoom) - ((time * 20) % 15);
      ctx.beginPath();
      ctx.arc((Math.sin(time + k) * 8) * zoom, offsetY, smokeR, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
}

/**
 * Renderiza Cargas 3D Realistas de Alta Potência (Ar Condicionado, Fogão de Indução, Chuveiro, Micro-ondas)
 */
function renderRealisticLoad(
  ctx: CanvasRenderingContext2D,
  c: any,
  d: any,
  st: DeviceSimulationState,
  cw: number,
  ch: number,
  zoom: number,
  time: number,
  simRunning: boolean
) {
  const isEnergized = Boolean(st.energized && !st.tripped);

  ctx.save();
  
  if (d.kind === 'load_ac') {
    // ------------------------------------------------------------------------
    // AR CONDICIONADO SPLIT INVERTER 12000 BTU
    // ------------------------------------------------------------------------
    const bodyW = cw * 0.85;
    const bodyH = ch * 0.52;
    const bodyY = -bodyH * 0.45;

    // Chassi branco acetinado com acabamento curvo
    const acGrad = ctx.createLinearGradient(0, bodyY, 0, bodyY + bodyH);
    acGrad.addColorStop(0, '#f8fafc');
    acGrad.addColorStop(0.3, '#f1f5f9');
    acGrad.addColorStop(0.8, '#e2e8f0');
    acGrad.addColorStop(1, '#cbd5e1');
    ctx.fillStyle = acGrad;
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.roundRect(-bodyW / 2, bodyY, bodyW, bodyH, 4 * zoom);
    ctx.fill();
    ctx.stroke();

    // Palhetas de insuflamento de ar (louvers) na base
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-bodyW * 0.45, bodyY + bodyH - 6 * zoom, bodyW * 0.9, 3.5 * zoom);

    // Display digital oculto / display LED azul
    const tempVal = c.params?.temp || 21;
    ctx.fillStyle = isEnergized ? '#0284c7' : '#94a3b8';
    ctx.font = `bold ${Math.max(8, 10 * zoom)}px sans-serif`;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    if (isEnergized) {
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 6 * zoom;
    }
    ctx.fillText(`${tempVal}°C`, bodyW / 2 - 8 * zoom, bodyY + bodyH * 0.4);
    ctx.shadowColor = 'transparent';

    // Ícone de floco de neve / LED indicador
    ctx.fillStyle = isEnergized ? '#38bdf8' : '#cbd5e1';
    ctx.beginPath();
    ctx.arc(bodyW / 2 - 32 * zoom, bodyY + bodyH * 0.4, 2.5 * zoom, 0, Math.PI * 2);
    ctx.fill();

    // Rótulo Inverter
    ctx.fillStyle = '#475569';
    ctx.font = `bold ${Math.max(5, 6 * zoom)}px sans-serif`;
    ctx.textAlign = 'left';
    ctx.fillText('INVERTER 12k', -bodyW / 2 + 8 * zoom, bodyY + bodyH * 0.4);

  } else if (d.kind === 'load_cooktop') {
    // ------------------------------------------------------------------------
    // FOGÃO DE INDUÇÃO ELETROMAGNÉTICO (4 ZONAS / VITROCERÂMICO)
    // ------------------------------------------------------------------------
    const topW = cw * 0.86;
    const topH = ch * 0.58;
    const topY = -topH * 0.45;

    // Vidro vitrocerâmico temperado preto espelhado
    const glassGrad = ctx.createLinearGradient(0, topY, 0, topY + topH);
    glassGrad.addColorStop(0, '#1e293b');
    glassGrad.addColorStop(0.3, '#090d16');
    glassGrad.addColorStop(0.8, '#020617');
    glassGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = glassGrad;
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.2 * zoom;
    ctx.beginPath();
    ctx.roundRect(-topW / 2, topY, topW, topH, 3 * zoom);
    ctx.fill();
    ctx.stroke();

    // 4 Zonas de indução circulares
    const zoneRadius = 9 * zoom;
    const zones = [
      { x: -topW * 0.25, y: topY + topH * 0.32 },
      { x: topW * 0.25, y: topY + topH * 0.32 },
      { x: -topW * 0.25, y: topY + topH * 0.72 },
      { x: topW * 0.25, y: topY + topH * 0.72 }
    ];

    zones.forEach((z, idx) => {
      const active = isEnergized && (idx === 0 || idx === 1);
      ctx.strokeStyle = active ? '#ef4444' : 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = active ? 2 * zoom : 1 * zoom;
      if (active) {
        ctx.shadowColor = '#f97316';
        ctx.shadowBlur = 8 * zoom;
      }
      ctx.beginPath();
      ctx.arc(z.x, z.y, zoneRadius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(z.x, z.y, zoneRadius * 0.5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowColor = 'transparent';

      if (active) {
        ctx.fillStyle = 'rgba(239, 68, 68, 0.25)';
        ctx.beginPath();
        ctx.arc(z.x, z.y, zoneRadius, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Barra de controle de toque central
    ctx.fillStyle = isEnergized ? '#f97316' : '#64748b';
    ctx.font = `bold ${Math.max(6, 6.5 * zoom)}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText(isEnergized ? 'HEAT: [ 9 ]' : 'STANDBY', 0, topY + topH * 0.88);

  } else if (d.kind === 'load_shower') {
    // ------------------------------------------------------------------------
    // CHUVEIRO ELÉTRICO MULTITEMPERATURA (7500W ALTA POTÊNCIA)
    // ------------------------------------------------------------------------
    const cupRadius = Math.min(cw, ch) * 0.26;
    const cupY = -2 * zoom;

    // Corpo cilíndrico termoplástico de aquecimento
    const cupGrad = ctx.createRadialGradient(-3 * zoom, cupY - 3 * zoom, 2 * zoom, 0, cupY, cupRadius);
    cupGrad.addColorStop(0, '#ffffff');
    cupGrad.addColorStop(0.7, '#e2e8f0');
    cupGrad.addColorStop(1, '#94a3b8');
    ctx.fillStyle = cupGrad;
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.arc(0, cupY, cupRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Seletor de temperatura central (I / II / III)
    const knobR = 6 * zoom;
    ctx.fillStyle = isEnergized ? '#ef4444' : '#475569';
    ctx.beginPath();
    ctx.arc(0, cupY, knobR, 0, Math.PI * 2);
    ctx.fill();

    // Crivo perfurado inferior (chuveiro)
    ctx.fillStyle = '#334155';
    for (let h = -cupRadius * 0.6; h <= cupRadius * 0.6; h += 4 * zoom) {
      ctx.beginPath();
      ctx.arc(h, cupY + cupRadius * 0.65, 0.8 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }

    // Vapor térmico subindo se energizado
    if (isEnergized) {
      for (let v = 0; v < 3; v++) {
        const vY = cupY + cupRadius + ((time * 25 + v * 12) % 25) * zoom;
        const vX = Math.sin(time * 3 + v) * 5 * zoom;
        ctx.fillStyle = 'rgba(56, 189, 248, 0.35)';
        ctx.beginPath();
        ctx.arc(vX, vY, 2 * zoom, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.fillStyle = '#0f172a';
    ctx.font = `bold ${Math.max(6, 6.5 * zoom)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(isEnergized ? '7500W' : 'OFF', 0, ch / 2 - 8 * zoom);

  } else if (d.kind === 'load_microwave') {
    // ------------------------------------------------------------------------
    // FORNO MICRO-ONDAS DIGITAL 1200W
    // ------------------------------------------------------------------------
    const mwW = cw * 0.84;
    const mwH = ch * 0.52;
    const mwY = -mwH * 0.45;

    // Gabinete metálico aço escovado
    ctx.fillStyle = '#334155';
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1.2 * zoom;
    ctx.beginPath();
    ctx.roundRect(-mwW / 2, mwY, mwW, mwH, 3 * zoom);
    ctx.fill();
    ctx.stroke();

    // Porta com visor de vidro escuro
    const doorW = mwW * 0.62;
    const doorH = mwH * 0.78;
    ctx.fillStyle = '#090d16';
    ctx.beginPath();
    ctx.roundRect(-mwW / 2 + 3 * zoom, mwY + 3 * zoom, doorW, doorH, 2 * zoom);
    ctx.fill();

    // Prato giratório iluminado se ativo
    if (isEnergized) {
      ctx.fillStyle = 'rgba(250, 204, 21, 0.4)';
      ctx.beginPath();
      ctx.ellipse(-mwW / 2 + 3 * zoom + doorW / 2, mwY + 3 * zoom + doorH * 0.65, doorW * 0.35, 5 * zoom, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Painel digital lateral (Relógio / Timer)
    const pnlX = -mwW / 2 + doorW + 6 * zoom;
    const pnlW = mwW - doorW - 9 * zoom;
    ctx.fillStyle = '#020617';
    ctx.fillRect(pnlX, mwY + 4 * zoom, pnlW, 11 * zoom);

    ctx.fillStyle = isEnergized ? '#22c55e' : '#64748b';
    ctx.font = `bold ${Math.max(6, 7 * zoom)}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(isEnergized ? '01:30' : '12:00', pnlX + pnlW / 2, mwY + 9.5 * zoom);

    // Botões de comando da membrana
    ctx.fillStyle = '#475569';
    for (let b = 0; b < 3; b++) {
      ctx.fillRect(pnlX + 2 * zoom, mwY + 18 * zoom + b * 5 * zoom, pnlW - 4 * zoom, 3 * zoom);
    }
  }

  ctx.restore();
}

/**
 * Renderiza Aterramento Físico (Haste Copperweld, BEP, Cobre Nu) e Caixas WAGO
 */
function renderGroundingAndJunction(
  ctx: CanvasRenderingContext2D,
  c: any,
  d: any,
  st: DeviceSimulationState,
  cw: number,
  ch: number,
  zoom: number,
  time: number,
  simRunning: boolean
) {
  ctx.save();

  if (d.kind === 'earth_rod') {
    // ------------------------------------------------------------------------
    // HASTE COPPERWELD (Aço Cobreado 5/8" x 2.4m)
    // ------------------------------------------------------------------------
    const rodW = 10 * zoom;
    const rodH = ch * 0.65;
    const rodY = -rodH * 0.4;

    // Haste metálica com gradiente cobreado brilhante
    const copperGrad = ctx.createLinearGradient(-rodW / 2, 0, rodW / 2, 0);
    copperGrad.addColorStop(0, '#9a3412');
    copperGrad.addColorStop(0.3, '#ea580c');
    copperGrad.addColorStop(0.7, '#fdba74');
    copperGrad.addColorStop(1, '#7c2d12');
    ctx.fillStyle = copperGrad;
    ctx.fillRect(-rodW / 2, rodY, rodW, rodH - 8 * zoom);

    // Ponta cônica de cravação no solo
    ctx.beginPath();
    ctx.moveTo(-rodW / 2, rodY + rodH - 8 * zoom);
    ctx.lineTo(0, rodY + rodH);
    ctx.lineTo(rodW / 2, rodY + rodH - 8 * zoom);
    ctx.closePath();
    ctx.fill();

    // Grampo de latão mecânico no topo
    ctx.fillStyle = '#ca8a04';
    ctx.strokeStyle = '#854d0e';
    ctx.lineWidth = 1 * zoom;
    ctx.fillRect(-rodW * 0.8, rodY, rodW * 1.6, 9 * zoom);
    ctx.strokeRect(-rodW * 0.8, rodY, rodW * 1.6, 9 * zoom);

    // Símbolo normativo de terra (⏚)
    ctx.fillStyle = '#4ade80';
    ctx.font = `bold ${Math.max(10, 12 * zoom)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('⏚', 0, rodY + rodH * 0.45);

    // Medição de resistência de aterramento (Ω)
    const rOhm = c.params?.resistance ?? 10;
    ctx.fillStyle = '#f8fafc';
    ctx.font = `bold ${Math.max(6, 7.5 * zoom)}px monospace`;
    ctx.fillText(`${rOhm} Ω`, 0, ch / 2 - 6 * zoom);

  } else if (d.kind === 'earth_pit') {
    // ------------------------------------------------------------------------
    // CAIXA DE INSPEÇÃO DE ATERRAMENTO COM BEP
    // ------------------------------------------------------------------------
    const pitR = Math.min(cw, ch) * 0.32;

    // Anel de concreto / polipropileno da caixa
    const pitGrad = ctx.createRadialGradient(0, 0, pitR * 0.4, 0, 0, pitR);
    pitGrad.addColorStop(0, '#1e293b');
    pitGrad.addColorStop(0.7, '#334155');
    pitGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = pitGrad;
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.arc(0, 0, pitR, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Barra de Equipotencialização Principal (BEP) em cobre
    const bepW = pitR * 1.3;
    const bepH = 10 * zoom;
    ctx.fillStyle = '#ea580c';
    ctx.strokeStyle = '#9a3412';
    ctx.lineWidth = 1 * zoom;
    ctx.fillRect(-bepW / 2, -bepH / 2, bepW, bepH);
    ctx.strokeRect(-bepW / 2, -bepH / 2, bepW, bepH);

    // Parafusos de latão na BEP
    for (let p = -bepW * 0.35; p <= bepW * 0.35; p += 9 * zoom) {
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(p, 0, 1.8 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = '#4ade80';
    ctx.font = `bold ${Math.max(6, 7 * zoom)}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText('BEP TERRA', 0, ch / 2 - 8 * zoom);

  } else if (d.kind === 'bare_copper') {
    // ------------------------------------------------------------------------
    // CABO DE COBRE NU TRANÇADO
    // ------------------------------------------------------------------------
    const cableW = cw * 0.78;
    const cableH = 12 * zoom;
    ctx.fillStyle = '#ea580c';
    ctx.fillRect(-cableW / 2, -cableH / 2, cableW, cableH);

    // Trançado de condutores de cobre nu
    ctx.strokeStyle = '#fdba74';
    ctx.lineWidth = 1.2 * zoom;
    for (let x = -cableW / 2; x <= cableW / 2; x += 6 * zoom) {
      ctx.beginPath();
      ctx.moveTo(x, -cableH / 2);
      ctx.lineTo(x + 4 * zoom, cableH / 2);
      ctx.stroke();
    }

    const gauge = c.params?.gauge ?? 35;
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.max(6, 7 * zoom)}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText(`${gauge} mm² NU`, 0, ch / 2 - 8 * zoom);

  } else if (d.kind === 'junction_box') {
    // ------------------------------------------------------------------------
    // CAIXA DE DERIVAÇÃO COM CONECTORES WAGO 221
    // ------------------------------------------------------------------------
    const boxW = cw * 0.82;
    const boxH = ch * 0.62;

    // Fundo da caixa octogonal/quadrada termoplástica
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.roundRect(-boxW / 2, -boxH / 2, boxW, boxH, 4 * zoom);
    ctx.fill();
    ctx.stroke();

    // 3 Conectores rápidos WAGO 221 (Fase, Neutro, Terra)
    const wagoColors = ['#b45309', '#0284c7', '#16a34a'];
    const wagoLabels = ['L', 'N', 'PE'];

    [-boxW * 0.28, 0, boxW * 0.28].forEach((wx, idx) => {
      const wW = 16 * zoom;
      const wH = boxH * 0.55;
      const wY = -wH / 2;

      // Corpo transparente do conector WAGO
      ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 0.8 * zoom;
      ctx.beginPath();
      ctx.roundRect(wx - wW / 2, wY, wW, wH, 2 * zoom);
      ctx.fill();
      ctx.stroke();

      // Alavanca de pressão laranja WAGO
      ctx.fillStyle = '#f97316';
      ctx.fillRect(wx - wW / 2 + 2 * zoom, wY + 2 * zoom, wW - 4 * zoom, 5 * zoom);

      ctx.fillStyle = wagoColors[idx];
      ctx.font = `bold ${Math.max(6, 7 * zoom)}px monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(wagoLabels[idx], wx, wY + wH - 3 * zoom);
    });

    ctx.fillStyle = '#cbd5e1';
    ctx.font = `bold ${Math.max(5.5, 6.5 * zoom)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('WAGO 221 (32A)', 0, -boxH / 2 - 3 * zoom);
  }

  ctx.restore();
}

/**
 * Renderiza bornes industriais com parafusos metálicos visíveis e fendas (+/-)
 * Conexão de fases e neutro mapeada conforme IEC 60947 (1/3/5/N superior, 2/4/6/N inferior)
 */
function renderMetallicScrewTerminals(
  ctx: CanvasRenderingContext2D,
  c: any,
  d: any,
  cw: number,
  ch: number,
  zoom: number
) {
  if (!d.terminals) return;

  d.terminals.forEach((term: [string, string, string]) => {
    const termId = term[0];
    const off = getNormativeTerminalOffset(c, termId);
    const tx = off.x * zoom;
    const ty = off.y * zoom;
    const r = 4.2 * zoom;

    ctx.save();
    // Rebaixo plástico escuro do borne DIN
    ctx.fillStyle = '#050a12';
    ctx.beginPath();
    ctx.arc(tx, ty, r + 1.5 * zoom, 0, Math.PI * 2);
    ctx.fill();

    // Parafuso metálico zincado / latão
    const screwGrad = ctx.createRadialGradient(tx - 1, ty - 1, 0.5, tx, ty, r);
    const isNeutral = termId === 'N' || termId.includes('N');
    const isPE = termId === 'PE' || termId === 'G';

    if (isNeutral) {
      screwGrad.addColorStop(0, '#7dd3fc');
      screwGrad.addColorStop(0.6, '#0284c7');
      screwGrad.addColorStop(1, '#0c4a6e');
    } else if (isPE) {
      screwGrad.addColorStop(0, '#86efac');
      screwGrad.addColorStop(0.6, '#16a34a');
      screwGrad.addColorStop(1, '#14532d');
    } else {
      screwGrad.addColorStop(0, '#f8fafc');
      screwGrad.addColorStop(0.5, '#94a3b8');
      screwGrad.addColorStop(1, '#334155');
    }

    ctx.fillStyle = screwGrad;
    ctx.beginPath();
    ctx.arc(tx, ty, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 0.8 * zoom;
    ctx.stroke();

    // Fenda do parafuso metálico (+ ou -)
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(tx - r * 0.6, ty);
    ctx.lineTo(tx + r * 0.6, ty);
    ctx.moveTo(tx, ty - r * 0.6);
    ctx.lineTo(tx, ty + r * 0.6);
    ctx.stroke();

    // Rótulo normativo explícito do borne (1, 3, 5, N no topo / 2, 4, 6, N na base)
    const displayLabel = termId === 'N_IN' || termId === 'N_OUT' ? 'N' : termId;
    ctx.fillStyle = isNeutral ? '#38bdf8' : isPE ? '#4ade80' : '#e2e8f0';
    ctx.font = `bold ${Math.max(6, 7 * zoom)}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = off.dir === 'top' ? 'bottom' : 'top';
    const labelY = off.dir === 'top' ? ty - 4 * zoom : ty + 4 * zoom;
    ctx.fillText(displayLabel, tx, labelY);

    ctx.restore();
  });
}

/**
 * ----------------------------------------------------------------------------
 * ITEM 4: MOTOR DE EFEITOS VISUAIS DE FALHA (CURTO-CIRCUITO, FAÍSCAS E AQUECIMENTO)
 * ----------------------------------------------------------------------------
 */
function renderFaultVisualEffects(
  ctx: CanvasRenderingContext2D,
  st: DeviceSimulationState,
  cw: number,
  ch: number,
  zoom: number,
  time: number
) {
  // O clarão e centelhamento da explosão duram ~1.5 segundos e cessam
  const now = Date.now();
  const sparkStart = st.sparkStartTime || 0;
  const isSparkExplosionActive = Boolean(st.sparking && (!sparkStart || (now - sparkStart < 1500)));

  const isFault = Boolean(st.fault || isSparkExplosionActive);
  const isThermal = Boolean(st.thermal);
  const isDamaged = Boolean(st.damaged || st.isBurned);

  if (!isFault && !isThermal && !isDamaged) return;

  ctx.save();

  // 1. Sobreaquecimento / Efeito Térmico Incandescente
  if (isThermal) {
    const pulse = (Math.sin(time * 8) + 1) * 0.5; // 0..1
    const glowRadius = (12 + pulse * 8) * zoom;

    ctx.strokeStyle = `rgba(239, 68, 68, ${0.4 + pulse * 0.5})`;
    ctx.lineWidth = 3 * zoom;
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = glowRadius;
    ctx.beginPath();
    ctx.roundRect(-cw / 2 - 3 * zoom, -ch / 2 - 3 * zoom, cw + 6 * zoom, ch + 6 * zoom, 8 * zoom);
    ctx.stroke();

    // Radiação térmica interna no corpo do componente
    const thermGrad = ctx.createRadialGradient(0, 0, 2 * zoom, 0, 0, cw * 0.55);
    thermGrad.addColorStop(0, `rgba(250, 204, 21, ${0.2 + pulse * 0.2})`);
    thermGrad.addColorStop(0.6, `rgba(234, 88, 12, ${0.3 + pulse * 0.2})`);
    thermGrad.addColorStop(1, 'rgba(127, 29, 29, 0)');
    ctx.fillStyle = thermGrad;
    ctx.beginPath();
    ctx.roundRect(-cw / 2, -ch / 2, cw, ch, 6 * zoom);
    ctx.fill();
  }

  // 2. Curto-Circuito: Clarão de Arco Elétrico e Faíscas Brilhantes (Duração de ~1.5s)
  if (isSparkExplosionActive) {
    // Clarão central plasma de alta intensidade
    const flashSize = (22 + Math.random() * 18) * zoom;
    const flashGrad = ctx.createRadialGradient(0, 0, 2 * zoom, 0, 0, flashSize);
    flashGrad.addColorStop(0, '#ffffff');
    flashGrad.addColorStop(0.25, '#38bdf8');
    flashGrad.addColorStop(0.65, '#f59e0b');
    flashGrad.addColorStop(1, 'transparent');

    ctx.fillStyle = flashGrad;
    ctx.beginPath();
    ctx.arc(0, 0, flashSize, 0, Math.PI * 2);
    ctx.fill();

    // Faíscas incandescentes projetadas em múltiplos ângulos
    const sparkCount = 16;
    for (let i = 0; i < sparkCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const len = (16 + Math.random() * 30) * zoom;
      const sx = Math.cos(angle) * (len * 0.25);
      const sy = Math.sin(angle) * (len * 0.25);
      const ex = Math.cos(angle) * len;
      const ey = Math.sin(angle) * len;

      ctx.strokeStyle = Math.random() > 0.35 ? '#fef08a' : '#ef4444';
      ctx.lineWidth = (1.2 + Math.random() * 1.6) * zoom;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(ex, ey);
      ctx.stroke();

      // Ponto de plasma na extremidade
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(ex, ey, 1.4 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 3. Queima / Dano Definitivo (isBurned: true) com Fuligem Negra e Fumaça
  if (isDamaged || st.smokeAlpha) {
    // Mancha profunda de queima por fuligem preta (soot carbonization)
    const sootGrad = ctx.createRadialGradient(0, 0, 4 * zoom, 0, 0, Math.max(cw, ch) * 0.45);
    sootGrad.addColorStop(0, 'rgba(15, 23, 42, 0.85)');
    sootGrad.addColorStop(0.6, 'rgba(30, 41, 59, 0.65)');
    sootGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = sootGrad;
    ctx.beginPath();
    ctx.arc(0, 0, Math.max(cw, ch) * 0.45, 0, Math.PI * 2);
    ctx.fill();

    // Rachaduras / marcas pretas de queima em bornes
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(-cw * 0.2, -ch * 0.25);
    ctx.lineTo(0, 0);
    ctx.lineTo(cw * 0.22, ch * 0.2);
    ctx.stroke();

    // Partículas de fumaça cinzenta subindo verticalmente
    const smokePuffs = 5;
    for (let s = 0; s < smokePuffs; s++) {
      const puffOffset = ((time * 26 + s * 16) % 55) * zoom;
      const puffX = Math.sin(time * 2.5 + s) * 7 * zoom;
      const puffY = -ch / 2 - puffOffset;
      const puffRadius = (5 + s * 3) * zoom;
      const alpha = Math.max(0, 0.45 - (puffOffset / (55 * zoom)));

      ctx.fillStyle = `rgba(148, 163, 184, ${alpha})`;
      ctx.beginPath();
      ctx.arc(puffX, puffY, puffRadius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
}
