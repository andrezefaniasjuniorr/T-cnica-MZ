// ============================================================================
// TÉCNICAMZ PRO — MOTOR DE RENDERIZAÇÃO REALISTA DE DISPOSITIVOS CAD ELÉTRICOS
// Normas: IEC 60947 (Aparelhagem BT), IEC 60364, DIN EN 50022 (Trilhos DIN 35mm)
// Design 3D Modular, Nomenclatura Compacta, Marcas Reais, Displays LCD & Efeitos
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
  fault?: boolean;          // Curto-circuito ativo
  sparking?: boolean;       // Centelhamento / arco elétrico
  sparkStartTime?: number;  // Início do evento de arco elétrico (~1.5s)
  isBurned?: boolean;       // Queima permanente do dispositivo (desativa condução)
  rotationDir?: 'CW' | 'CCW'; // Sentido horário ou anti-horário
  phaseSequence?: string;   // Sequência de fase RST ou RTS
  thermal?: boolean;        // Sobrecarga térmica / aquecimento
  temperature?: number;     // Temperatura estimada (°C)
  damaged?: boolean;        // Dispositivo queimado / danificado
  tripped?: boolean;        // Desarmado por proteção
  smokeAlpha?: number;      // Densidade da fumaça (0..1)
}

export interface DeviceSimulationState extends DeviceFaultState {
  closed?: boolean;
  pressed?: boolean;
  energized?: boolean;
  running?: boolean;
  rpm?: number;
  voltage?: number;         // Valor RMS de tensão (V)
  current?: number;         // Valor RMS de corrente (A)
  frequency?: number;       // Frequência (Hz)
  powerKW?: number;         // Potência ativa (kW)
  powerFactor?: number;     // Fator de potência (cos φ)
  energyKWh?: number;       // Energia acumulada (kWh)
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
  time?: number;            // Timestamp para animações contínuas
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

  // Motores & Cargas 3D
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
// 4. UTILITÁRIOS AUXILIARES DE RENDERIZAÇÃO 3D REALISTA (NOVOS)
// ----------------------------------------------------------------------------

/**
 * Renderiza a marca d'água/logotipo da marca em alta definição 3D com baixo relevo
 */
export function renderCustomBrandWatermark(
  ctx: CanvasRenderingContext2D,
  brandInput: string,
  x: number,
  y: number,
  zoom: number
): void {
  const brandKey = Object.keys(REAL_BRANDS).find(
    (b) => b.toLowerCase() === brandInput.toLowerCase()
  ) as DeviceBrand | undefined;

  const style = brandKey ? REAL_BRANDS[brandKey] : null;
  const displayText = style ? style.shortName : brandInput.toUpperCase();
  const fontSize = Math.max(7, 8 * zoom);

  ctx.save();
  // Sombra interna para efeito gravado no plástico (Inset Engraving)
  ctx.font = `bold ${fontSize}px "Segoe UI", Roboto, sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  // Sombra projetada para efeito de gravura 3D
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.fillText(displayText, x + 0.8 * zoom, y + 0.8 * zoom);

  // Efeito de iluminação na borda inferior do texto gravado
  ctx.fillStyle = style ? style.textColor : '#94a3b8';
  ctx.fillText(displayText, x, y);
  ctx.restore();
}

/**
 * Cria um gradiente tridimensional realista para corpos de policarbonato industrial
 */
export function create3DPolymerGradient(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  baseColor: 'light' | 'dark' | 'burned' | 'thermal' = 'dark'
): CanvasGradient {
  const grad = ctx.createLinearGradient(x, y, x + w, y + h);

  if (baseColor === 'burned') {
    grad.addColorStop(0, '#262626');
    grad.addColorStop(0.3, '#171717');
    grad.addColorStop(0.7, '#0a0a0a');
    grad.addColorStop(1, '#171717');
  } else if (baseColor === 'thermal') {
    grad.addColorStop(0, '#7f1d1d');
    grad.addColorStop(0.5, '#450a0a');
    grad.addColorStop(1, '#1c1917');
  } else if (baseColor === 'light') {
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.2, '#f1f5f9');
    grad.addColorStop(0.8, '#cbd5e1');
    grad.addColorStop(1, '#94a3b8');
  } else {
    // Dark RAL 7016 / 7035 Industrial Slate
    grad.addColorStop(0, '#334155');
    grad.addColorStop(0.15, '#1e293b');
    grad.addColorStop(0.85, '#0f172a');
    grad.addColorStop(1, '#020617');
  }

  return grad;
}

// ----------------------------------------------------------------------------
// 4. MOTOR DE RENDERIZAÇÃO REALISTA DE CAIXAS, MODULARIDADE E SISTEMA DE NEUTRO
// ----------------------------------------------------------------------------

/**
 * Desenha o corpo modular termoplástico industrial DIN com parafusos metálicos,
 * abas de fixação no trilho DIN 35mm, sistema de neutro, manípulos e logotipo sutil de marca.
 */
export function renderDevice(
  ctx: CanvasRenderingContext2D,
  options: RenderDeviceOptions
): void {
  const { component: c, camera: cam, isSelected = false, time = 0, simRunning = false } = options;
  const d = getComponentDef(c.code);
  const st: DeviceSimulationState = c.state || {};
  const zoom = cam.zoom;

  // Dimensões escaladas
  const cw = (c.w || 90) * zoom;
  const ch = (c.h || 75) * zoom;
  const rad = 6 * zoom;

  // Marca Comercial Customizável (definida livremente pelo técnico ou em branco)
  const brandText = (c.brandName !== undefined ? c.brandName : c.brand)?.toString().trim() || '';

  // Estados Operacionais
  const isTrip = Boolean(st.tripped);
  const isClosed = Boolean(st.closed) && !isTrip;
  const isFault = Boolean(st.fault || st.sparking);
  const isThermal = Boolean(st.thermal);
  const isDamaged = Boolean(st.damaged);

  ctx.save();

  // 1. Sombra e Perspectiva da Caixa Termoplástica
  ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
  ctx.beginPath();
  ctx.roundRect(-cw / 2 + 3 * zoom, -ch / 2 + 5 * zoom, cw, ch, rad);
  ctx.fill();

  // 2. Presilhas DIN 35mm (Trilho Traseiro Superior e Inferior)
  ctx.fillStyle = '#0b1120';
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1 * zoom;
  // Presilha superior
  ctx.beginPath();
  ctx.roundRect(-cw * 0.25, -ch / 2 - 4 * zoom, cw * 0.5, 4 * zoom, 1 * zoom);
  ctx.fill();
  ctx.stroke();
  // Presilha inferior (mecanismo de engate de mola DIN)
  ctx.beginPath();
  ctx.roundRect(-cw * 0.25, ch / 2, cw * 0.5, 4 * zoom, 1 * zoom);
  ctx.fill();
  ctx.stroke();

  // 3. Corpo Principal — Gradiente Termoplástico Policarbonato DIN
  const boxGrad = ctx.createLinearGradient(0, -ch / 2, 0, ch / 2);
  if (isDamaged) {
    boxGrad.addColorStop(0, '#1c1917');
    boxGrad.addColorStop(0.5, '#0c0a09');
    boxGrad.addColorStop(1, '#18181b');
  } else if (isThermal) {
    boxGrad.addColorStop(0, '#7f1d1d');
    boxGrad.addColorStop(0.5, '#450a0a');
    boxGrad.addColorStop(1, '#18181b');
  } else {
    // Tom industrial padrão (RAL 7035 / Gris Elétrico Texturizado)
    boxGrad.addColorStop(0, '#1e293b');
    boxGrad.addColorStop(0.12, '#0f172a');
    boxGrad.addColorStop(0.88, '#0a0f1d');
    boxGrad.addColorStop(1, '#050811');
  }

  ctx.fillStyle = boxGrad;
  ctx.strokeStyle = isSelected
    ? '#38bdf8'
    : isThermal
    ? '#ef4444'
    : isClosed
    ? '#10b981'
    : '#334155';
  ctx.lineWidth = isSelected ? 2.5 * zoom : 1.5 * zoom;

  if (isSelected) {
    ctx.shadowColor = 'rgba(56, 189, 248, 0.45)';
    ctx.shadowBlur = 12 * zoom;
  }

  ctx.beginPath();
  ctx.roundRect(-cw / 2, -ch / 2, cw, ch, rad);
  ctx.fill();
  ctx.stroke();
  ctx.shadowColor = 'transparent';

  // 4. Friso de Chanfro Tridimensional da Frente
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.roundRect(-cw / 2 + 3 * zoom, -ch / 2 + 3 * zoom, cw - 6 * zoom, ch - 6 * zoom, rad - 1);
  ctx.stroke();

  // 5. Marca Comercial Customizável (Exibida somente se preenchida pelo técnico)
  if (brandText) {
    renderCustomBrandWatermark(ctx, brandText, -cw / 2 + 6 * zoom, -ch / 2 + 10 * zoom, zoom);
  }

  // 6. Rótulo Compacto Padrão (Sem Poluição Visual)
  const compactName = getCompactDeviceLabel(c.code, c.label);
  ctx.fillStyle = '#f8fafc';
  ctx.font = `bold ${Math.max(7, 8.5 * zoom)}px monospace`;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'top';
  ctx.fillText(compactName, cw / 2 - 6 * zoom, -ch / 2 + 5 * zoom);

  // 7. Renderização por Categoria de Dispositivo
  if (d.cat === 'measurement') {
    // ------------------------------------------------------------------------
    // ITEM 3: INSTRUMENTAÇÃO DE MEDIÇÃO COM DISPLAY LCD / 7 SEGMENTOS REALISTA
    // ------------------------------------------------------------------------
    renderDigitalMeasurementPanel(ctx, c, d, st, cw, ch, zoom, simRunning, time);
  } else if (
    d.kind === 'breaker' ||
    d.kind === 'breaker2' ||
    d.kind === 'breaker3' ||
    d.kind === 'rcd' ||
    d.kind === 'rcd4' ||
    d.kind === 'rcbo'
  ) {
    // ------------------------------------------------------------------------
    // DISJUNTORES (1P+N, 2P+N, 3P+N) E RCDs COM MANÍPULOS DIN & I / O / TRIP
    // ------------------------------------------------------------------------
    renderDinSwitchHandle(ctx, c, d, st, cw, ch, zoom, isClosed, isTrip);
  } else if (d.kind.startsWith('load_') || ['load_ac', 'load_cooktop', 'load_shower', 'load_microwave'].includes(d.kind)) {
    // ------------------------------------------------------------------------
    // CARGAS REALISTAS 3D (Ar Condicionado, Fogão Indução, Chuveiro, Micro-ondas)
    // ------------------------------------------------------------------------
    renderRealisticLoad(ctx, c, d, st, cw, ch, zoom, time, simRunning);
  } else if (['earth_rod', 'earth_pit', 'bare_copper', 'junction_box'].includes(d.kind)) {
    // ------------------------------------------------------------------------
    // ATERRAMENTO FÍSICO (Haste Copperweld, BEP, Cobre Nu) & CAIXA WAGO
    // ------------------------------------------------------------------------
    renderGroundingAndJunction(ctx, c, d, st, cw, ch, zoom, time, simRunning);
  } else if (d.kind === 'push' || d.kind === 'switch') {
    // ------------------------------------------------------------------------
    // BOTOEIRAS INDUSTRIAIS (B/NA, B/NF, E-STOP)
    // ------------------------------------------------------------------------
    renderPushButtonActuator(ctx, c, d, st, cw, ch, zoom);
  } else if (d.kind === 'contactor' || d.kind === 'relay') {
    // ------------------------------------------------------------------------
    // CONTATORES DE POTÊNCIA (KM) COM VISOR DE ARMADURA ATRACADA
    // ------------------------------------------------------------------------
    renderContactorArmature(ctx, c, d, st, cw, ch, zoom);
  } else if (d.kind === 'motor3' || d.kind === 'motor1' || d.kind === 'fan') {
    // ------------------------------------------------------------------------
    // MOTORES ELÉTRICOS COM ROTOR E EIXO GIRATÓRIO
    // ------------------------------------------------------------------------
    renderMotorRotor(ctx, c, d, st, cw, ch, zoom, time, simRunning);
  } else if (d.kind === 'lamp') {
    // ------------------------------------------------------------------------
    // SINALIZADORES / LÂMPADAS DE PAINEL
    // ------------------------------------------------------------------------
    renderPilotLamp(ctx, c, d, st, cw, ch, zoom);
  } else {
    // Ícone representativo de fallback com iluminação
    ctx.fillStyle = st.energized ? '#34d399' : '#93c5fd';
    ctx.font = `${Math.max(14, 18 * zoom)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(d.icon, 0, 2 * zoom);
  }

  // 8. Bornes com Parafusos Metálicos Visíveis e Fendas (+ / -)
  renderMetallicScrewTerminals(ctx, c, d, cw, ch, zoom);

  // 9. Efeitos Visuais de Falha (Curto-circuito, Faíscas, Sobreaquecimento e Fumaça)
  renderFaultVisualEffects(ctx, st, cw, ch, zoom, time);

  ctx.restore();
}

// ----------------------------------------------------------------------------
// 5. SUB-RENDERIZADORES MODULARES
// ----------------------------------------------------------------------------

/**
 * Renderiza o logótipo/texto sutil da marca customizável do fabricante
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

  ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
  ctx.strokeStyle = 'rgba(51, 65, 85, 0.7)';
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
 * Renderiza o logótipo/texto sutil da marca do fabricante
 */
function renderBrandWatermark(
  ctx: CanvasRenderingContext2D,
  brand: BrandStyle,
  x: number,
  y: number,
  zoom: number
) {
  ctx.save();
  ctx.fillStyle = brand.textColor;
  ctx.font = `bold ${Math.max(6, 7 * zoom)}px sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  // Marca com fundo sutil arredondado
  ctx.fillStyle = brand.badgeBg;
  const tagW = 34 * zoom;
  const tagH = 9 * zoom;
  ctx.beginPath();
  ctx.roundRect(x - 2 * zoom, y - 1 * zoom, tagW, tagH, 2 * zoom);
  ctx.fill();

  ctx.fillStyle = brand.textColor;
  ctx.fillText(brand.shortName, x, y);
  ctx.restore();
}

/**
 * Renderiza instrumentos de medição com display digital (7 segmentos / LCD retroiluminado)
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
  // Bezel de encastre de painel 72x72mm
  const bezelW = cw * 0.76;
  const bezelH = ch * 0.44;
  const bezelY = -bezelH * 0.4;

  ctx.save();
  // Moldura chanfrada de policarbonato
  ctx.fillStyle = '#030712';
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.roundRect(-bezelW / 2, bezelY, bezelW, bezelH, 3 * zoom);
  ctx.fill();
  ctx.stroke();

  // Fundo LCD Digital com retroiluminação verde/azul ciano
  const isAc = d.code !== 'MDC';
  const lcdGrad = ctx.createLinearGradient(0, bezelY, 0, bezelY + bezelH);
  if (simRunning) {
    lcdGrad.addColorStop(0, '#022c22');
    lcdGrad.addColorStop(0.5, '#064e3b');
    lcdGrad.addColorStop(1, '#021c15');
  } else {
    lcdGrad.addColorStop(0, '#0f172a');
    lcdGrad.addColorStop(1, '#020617');
  }

  ctx.fillStyle = lcdGrad;
  ctx.beginPath();
  ctx.roundRect(-bezelW / 2 + 2 * zoom, bezelY + 2 * zoom, bezelW - 4 * zoom, bezelH - 4 * zoom, 2 * zoom);
  ctx.fill();

  // Valores medidos em tempo real dinâmicos (MNA / Kirchhoff)
  let displayValue = '---';
  let unit = '';

  switch (d.code) {
    case 'VM': {
      // Voltímetro Digital True-RMS - Medição Real nos Nós Conectados
      const volts = simRunning && typeof st.voltage === 'number' ? st.voltage : 0.0;
      displayValue = volts > 0.1 ? volts.toFixed(1) : '0.0';
      unit = 'V RMS';
      break;
    }
    case 'AM': {
      // Amperímetro Digital True-RMS - Medição Real em Série
      const amps = simRunning && typeof st.current === 'number' ? st.current : 0.0;
      displayValue = amps > 0.01 ? amps.toFixed(2) : '0.00';
      unit = 'A RMS';
      break;
    }
    case 'FREQ': {
      // Frequencímetro Digital - Frequência Real
      const freq = simRunning && typeof st.frequency === 'number' ? st.frequency : 0.0;
      displayValue = freq > 0.5 ? freq.toFixed(1) : '0.0';
      unit = 'Hz';
      break;
    }
    case 'WM': {
      // Wattímetro - Potência Ativa Real
      const kw = simRunning && typeof st.powerKW === 'number' ? st.powerKW : 0.0;
      displayValue = kw > 0.005 ? kw.toFixed(2) : '0.00';
      unit = 'kW';
      break;
    }
    case 'COS': {
      // Cosfímetro - Fator de Potência Real
      const pf = simRunning && typeof st.powerFactor === 'number' ? st.powerFactor : 1.0;
      displayValue = pf.toFixed(2);
      unit = 'cos φ';
      break;
    }
    case 'ENERGY': {
      // Medidor de Energia Ativa
      const kwh = simRunning && typeof st.energyKWh === 'number' ? st.energyKWh : 0.0;
      displayValue = kwh.toFixed(1);
      unit = 'kWh';
      break;
    }
    default:
      displayValue = simRunning ? 'LIVE' : 'OFF';
      unit = d.icon || '';
  }

  // Segmentos digitais 7-seg iluminados
  ctx.fillStyle = simRunning ? '#34d399' : '#475569';
  ctx.font = `bold ${Math.max(10, 13 * zoom)}px monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  if (simRunning) {
    ctx.shadowColor = '#10b981';
    ctx.shadowBlur = 6 * zoom;
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
 * Renderiza manípulos de comutação realistas para disjuntores DIN e RCDs (Monofásico, Bipolar e Trifásico)
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

  // Trilho / Berço de curso mecânico da alavanca
  const slotW = (d.kind === 'breaker3' || d.kind === 'rcd4' ? 32 : d.kind === 'breaker2' ? 24 : 18) * zoom;
  const slotH = 26 * zoom;
  ctx.fillStyle = '#060b13';
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.roundRect(-slotW / 2, -slotH / 2, slotW, slotH, 3 * zoom);
  ctx.fill();
  ctx.stroke();

  // Manípulo basculante com gradiente 3D
  const handleW = slotW - 3 * zoom;
  const handleH = 14 * zoom;
  const handleY = isClosed ? -slotH / 2 + 2 * zoom : isTrip ? -handleH / 2 : slotH / 2 - handleH - 2 * zoom;

  const hGrad = ctx.createLinearGradient(0, handleY, 0, handleY + handleH);
  if (isTrip) {
    // Alavanca em falha/desarme (Vermelho Alerta)
    hGrad.addColorStop(0, '#f87171');
    hGrad.addColorStop(0.5, '#dc2626');
    hGrad.addColorStop(1, '#7f1d1d');
  } else if (isClosed) {
    // Alavanca fechada (Verde IEC 60947 / Norma DIN)
    hGrad.addColorStop(0, '#4ade80');
    hGrad.addColorStop(0.5, '#16a34a');
    hGrad.addColorStop(1, '#14532d');
  } else {
    // Alavanca aberta (Cinza grafite fosco)
    hGrad.addColorStop(0, '#64748b');
    hGrad.addColorStop(0.5, '#334155');
    hGrad.addColorStop(1, '#0f172a');
  }

  ctx.fillStyle = hGrad;
  ctx.beginPath();
  ctx.roundRect(-handleW / 2, handleY, handleW, handleH, 3 * zoom);
  ctx.fill();

  // Textura de pegada antiderrapante na alavanca
  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  ctx.lineWidth = 1 * zoom;
  for (let i = -handleW * 0.3; i <= handleW * 0.3; i += 4 * zoom) {
    ctx.beginPath();
    ctx.moveTo(i, handleY + 2 * zoom);
    ctx.lineTo(i, handleY + handleH - 2 * zoom);
    ctx.stroke();
  }

  // Marcação indelével: I (Ligado), O (Desligado), TRIP (Desarmado)
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${Math.max(7, 8 * zoom)}px monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(isTrip ? 'TRIP' : isClosed ? 'I' : 'O', 0, handleY + handleH / 2);

  // Botão de Teste T em IDRs / RCDs
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
 * Renderiza Botoeiras Industriais (B/NA verde, B/NF vermelha, E-STOP)
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

  const rOuter = Math.min(cw, ch) * 0.32;
  const travel = isPressed ? 2.5 * zoom : 0;
  const rButton = (rOuter - 3 * zoom) * (isPressed ? 0.92 : 1.0);

  ctx.save();
  // Anel metálico cromado de fixação
  const bezel = ctx.createRadialGradient(0, 0, rOuter * 0.3, 0, 0, rOuter);
  bezel.addColorStop(0, '#f8fafc');
  bezel.addColorStop(0.5, '#64748b');
  bezel.addColorStop(1, '#1e293b');
  ctx.fillStyle = bezel;
  ctx.beginPath();
  ctx.arc(0, 0, rOuter, 0, Math.PI * 2);
  ctx.fill();

  // Botão atuador termoplástico
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

  // Inscrição gravada
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${Math.max(8, 9 * zoom)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(isEstop ? 'STOP' : isNO ? 'I' : 'O', 0, travel);

  ctx.restore();
}

/**
 * Renderiza Contatores de Potência (KM) com visor de armadura atracada
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
  const pW = cw * 0.65;
  const pH = ch * 0.28;
  const pY = -pH * 0.4;

  ctx.save();
  // Alvéolo da armadura móvel
  ctx.fillStyle = '#060b14';
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.roundRect(-pW / 2, pY, pW, pH, 3 * zoom);
  ctx.fill();
  ctx.stroke();

  // Núcleo mecânico móvel
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
  ctx.fillText(isEnergized ? '▲ ATRACADO (ON)' : '▼ REPOUSO (OFF)', 0, pY + pH / 2);

  ctx.restore();
}

/**
 * Renderiza Rotor de Motores Elétricos com giro proporcional ao RPM
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
  const radius = Math.min(cw, ch) * 0.28;
  const rotDir = st.rotationDir || c?.state?.rotationDir || 'CW';
  const phaseSeq = st.phaseSequence || c?.state?.phaseSequence || (rotDir === 'CW' ? 'RST' : 'RTS');
  const dir = rotDir === 'CCW' ? -1 : 1;

  ctx.save();
  // Carcaça cilíndrica com aletas térmicas
  const carGrad = ctx.createRadialGradient(0, -2 * zoom, radius * 0.2, 0, 0, radius);
  if (isBurned) {
    carGrad.addColorStop(0, '#1c1917');
    carGrad.addColorStop(0.7, '#0f172a');
    carGrad.addColorStop(1, '#020617');
  } else {
    carGrad.addColorStop(0, isRunning ? (rotDir === 'CW' ? '#065f46' : '#075985') : '#334155');
    carGrad.addColorStop(0.8, isRunning ? (rotDir === 'CW' ? '#042f2e' : '#0c4a6e') : '#1e293b');
    carGrad.addColorStop(1, '#090f1a');
  }
  ctx.fillStyle = carGrad;
  ctx.beginPath();
  ctx.arc(0, -2 * zoom, radius, 0, Math.PI * 2);
  ctx.fill();

  // Aletas de refrigeração do estator
  ctx.strokeStyle = isBurned ? '#44403c' : (isRunning ? '#059669' : '#475569');
  ctx.lineWidth = 1 * zoom;
  for (let a = 0; a < 8; a++) {
    const angle = (a * Math.PI) / 4;
    ctx.beginPath();
    ctx.moveTo(Math.cos(angle) * (radius * 0.84), -2 * zoom + Math.sin(angle) * (radius * 0.84));
    ctx.lineTo(Math.cos(angle) * radius, -2 * zoom + Math.sin(angle) * radius);
    ctx.stroke();
  }

  // Eixo giratório com inércia acoplada
  ctx.save();
  ctx.translate(0, -2 * zoom);
  ctx.rotate(isRunning ? (dir * time * (rpm / 60) * Math.PI * 2) : 0);

  ctx.strokeStyle = isBurned ? '#52525b' : (isRunning ? (rotDir === 'CW' ? '#6ee7b7' : '#7dd3fc') : '#94a3b8');
  ctx.lineWidth = 2 * zoom;
  ctx.lineCap = 'round';
  for (let i = 0; i < 4; i++) {
    ctx.rotate(Math.PI / 2);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, radius * 0.72);
    ctx.stroke();
  }
  ctx.restore();

  // Seta Indicadora de Sentido de Rotação (Horário CW / RST vs Anti-horário CCW / RTS)
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

    // Cabeça da seta de rotação
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

  // Rótulos de Estado do Motor: Sentido de Rotação & RPM
  ctx.textAlign = 'center';

  if (isBurned) {
    ctx.fillStyle = '#ef4444';
    ctx.font = `bold ${Math.max(6.5, 7.5 * zoom)}px monospace`;
    ctx.fillText('AVARIA (QUEIMADO)', 0, ch / 2 - 7 * zoom);
  } else if (isRunning) {
    // Rótulo de Sentido de Giro: "CW • RST" ou "CCW • RTS"
    const dirLabel = `${rotDir} • ${phaseSeq}`;
    ctx.fillStyle = rotDir === 'CW' ? '#34d399' : '#38bdf8';
    ctx.font = `bold ${Math.max(6.5, 7.5 * zoom)}px monospace`;
    ctx.fillText(dirLabel, 0, ch / 2 - 13 * zoom);

    // RPM Real em Sincronia
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
 * Renderiza Lâmpada Piloto / Sinalizadora com lente de policarbonato
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
