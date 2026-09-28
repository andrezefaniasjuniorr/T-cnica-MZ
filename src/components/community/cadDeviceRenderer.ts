// ============================================================================
// TÉCNICAMZ PRO — MOTOR DE RENDERIZAÇÃO REALISTA DE DISPOSITIVOS CAD ELÉTRICOS (V27)
// Design Industrial Ultra-Realista Completo: Motores WEG com Aletas, TeSys KM,
// Relés OLR, Comutadores Modulares 3-Way & 4-Way, Disjuntores DIN e Solar FV
// ============================================================================

import { getComponentDef } from './cadEngine';
import { getNormativeTerminalOffset } from './cadRouting';

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

export interface DeviceFaultState {
  fault?: boolean;
  sparking?: boolean;
  sparkStartTime?: number;
  isBurned?: boolean;
  rotationDir?: 'CW' | 'CCW';
  phaseSequence?: string;
  thermal?: boolean;
  temperature?: number;
  damaged?: boolean;
  tripped?: boolean;
  smokeAlpha?: number;
  flagColor?: 'red' | 'green' | 'yellow';
  leverPos?: 'up' | 'down' | 'trip';
  rockerAngle?: number;
}

export interface DeviceSimulationState extends DeviceFaultState {
  closed?: boolean;
  closed1?: boolean;
  closed2?: boolean;
  pressed?: boolean;
  energized?: boolean;
  running?: boolean;
  rpm?: number;
  voltage?: number;
  current?: number;
  frequency?: number;
  powerKW?: number;
  powerFactor?: number;
  energyKWh?: number;
  actuated?: boolean;
  high?: boolean;
  position?: number;
  percent?: number;
  color?: string;
  pvVoltage?: number;
  batVoltage?: number;
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
  time?: number;
  simRunning?: boolean;
}

export const COMPACT_DEVICE_CODES: Record<string, string> = {
  MCB_1P: 'MCB 1P',
  MCB1: 'MCB 1P+N',
  MCB2: 'MCB 2P',
  MPCB: 'DISJ. MOTOR',
  MCB3: 'MCB 3P+N',
  MCCB: 'MCCB CAIXA',
  RCD: 'IDR 2P 30mA',
  RCD4: 'IDR 4P 30mA',
  RCBO: 'RCBO 1P+N',
  FUSE: 'FUSÍVEL 10x38',
  FU3: 'SECC. 3P FUS',
  SPD: 'DPS 1P+N',
  SPD3: 'DPS 3P+N',
  OLR: 'OLR TÉRMICO',
  PHASE: 'RPF',

  PBNO: 'B/NA START',
  PBNC: 'B/NF STOP',
  SW: 'SW 1P',
  SW2: 'SW 2P',
  SW_DOUBLE: 'SW 2x1P',
  THREE_WAY: '3-WAY',
  FOUR_WAY: '4-WAY',
  DIMMER: 'DIMMER',
  ESTOP: 'E-STOP',
  SEL: 'SEL 3 POS',
  LIMIT: 'FIM CURSO',
  FLOAT: 'BÓIA NÍVEL',
  PHOTOCELL: 'FOTOCÉLULA',
  PIR_SENSOR: 'SENSOR PIR',
  CONTACTOR: 'KM CONTACTOR',
  AUX_BLOCK_2NA2NF: 'BLOCO 2NA+2NF',
  RELAY: 'KA RELÉ AUX',
  TIMER: 'KT (TON)',
  TIMER_TOF: 'KT (TOF)',
  TIMER_STAR_DELTA: 'KT (Y-Δ)',
  TIMER_DIGITAL: 'TIMER DIGITAL',
  THERMOSTAT_DIGITAL: 'TERMOSTATO',

  GEN_DIESEL: 'GERADOR DIESEL',
  ATS_SWITCH: 'ATS REDE/GER',
  MTS_SWITCH: 'MTS I-0-II',
  PV_PANEL: 'MÓDULO FV',
  PV_INVERTER_ONGRID: 'INV. ON-GRID',
  PV_INVERTER_OFFGRID: 'INV. OFF-GRID',
  PV_INVERTER_HYBRID: 'INV. HÍBRIDO',
  BAT_LIFEPO4: 'BAT. LiFePO4',
  SMART_METER: 'SMART METER',

  M1PH: 'MOTOR 1F',
  M3PH: 'MOTOR MIT 3F',
  M3PH_6L: 'MOTOR 6P (Y-Δ)',
  MDC: 'MOTOR CC',
  FAN: 'EXAUSTOR IND',
  PUMP: 'BOMBA CENTRÍF.',
  LAMP: 'LÂMPADA E27',
  HEATER: 'RESISTÊNCIA',
  OUTLET: 'TOMADA 2P+T',

  EARTH_ROD: 'HASTE TERRA',
  EARTH_PIT: 'CAIXA BEP',
  JUNCTION_BOX: 'CAIXA WAGO'
};

export function getCompactDeviceLabel(code: string, customLabel?: string): string {
  if (customLabel && customLabel.length <= 15 && !customLabel.includes(' ')) {
    return customLabel.toUpperCase();
  }
  return COMPACT_DEVICE_CODES[code] || code;
}

// ----------------------------------------------------------------------------
// 1. DISPOSITIVOS MODULARES DE PROTEÇÃO (DISJUNTORES DIN / IDR / RCBO / MCCB)
// ----------------------------------------------------------------------------
export function renderCommercialDinBreaker(
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
  const inA = c.params?.current || 16;
  const curve = c.params?.curve || 'C';
  const icu = c.params?.icu || 6;
  const brandName = (c.brand || c.brandName || 'Schneider Electric').toString();
  const shortBrand = REAL_BRANDS[brandName as DeviceBrand]?.shortName || brandName.split(' ')[0];

  const grad = ctx.createLinearGradient(0, -ch / 2, 0, ch / 2);
  grad.addColorStop(0, '#334155');
  grad.addColorStop(0.12, '#1e293b');
  grad.addColorStop(0.88, '#0f172a');
  grad.addColorStop(1, '#020617');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.roundRect(-cw / 2, -ch / 2, cw, ch, 4 * zoom);
  ctx.fill();
  ctx.strokeStyle = isTrip ? '#ef4444' : '#475569';
  ctx.lineWidth = 1.2 * zoom;
  ctx.stroke();

  // Visor ótico mecânico (Verde = Desligado, Vermelho = Ligado, Amarelo = Desarmado)
  const flagW = Math.min(cw * 0.5, 20 * zoom);
  const flagH = 4.5 * zoom;
  const flagY = -ch * 0.28;
  ctx.fillStyle = isTrip ? '#f59e0b' : isClosed ? '#dc2626' : '#16a34a';
  ctx.fillRect(-flagW / 2, flagY, flagW, flagH);
  ctx.strokeStyle = '#020617';
  ctx.lineWidth = 0.8 * zoom;
  ctx.strokeRect(-flagW / 2, flagY, flagW, flagH);

  // Alavanca basculante ergonômica com ranhuras táteis
  const levW = Math.min(cw * 0.45, 18 * zoom);
  const levH = 18 * zoom;
  const levY = isTrip ? -levH / 2 : isClosed ? -ch * 0.12 : 2 * zoom;

  const levGrad = ctx.createLinearGradient(0, levY, 0, levY + levH);
  if (isTrip) {
    levGrad.addColorStop(0, '#fbbf24');
    levGrad.addColorStop(1, '#b45309');
  } else if (isClosed) {
    levGrad.addColorStop(0, '#f87171');
    levGrad.addColorStop(1, '#b91c1c');
  } else {
    levGrad.addColorStop(0, '#64748b');
    levGrad.addColorStop(1, '#1e293b');
  }

  ctx.fillStyle = levGrad;
  ctx.beginPath();
  ctx.roundRect(-levW / 2, levY, levW, levH, 2.5 * zoom);
  ctx.fill();
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 0.8 * zoom;
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${Math.max(6.5, 7.5 * zoom)}px monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(isTrip ? 'TRIP' : isClosed ? 'I' : 'O', 0, levY + levH / 2);

  // Marca gravada na parte superior
  ctx.fillStyle = REAL_BRANDS[brandName as DeviceBrand]?.textColor || '#94a3b8';
  ctx.font = `bold ${Math.max(5.5, 6.5 * zoom)}px sans-serif`;
  ctx.fillText(shortBrand.toUpperCase(), 0, -ch / 2 + 8 * zoom);

  // Dados essenciais: Curva, Corrente e Icu
  ctx.fillStyle = '#cbd5e1';
  ctx.font = `bold ${Math.max(6.5, 7.5 * zoom)}px monospace`;
  ctx.fillText(`${curve}${inA} • ${icu}kA`, 0, ch / 2 - 8 * zoom);
}

// ----------------------------------------------------------------------------
// 2. DISJUNTOR-MOTOR MAGNÉTICO-TÉRMICO (MPCB)
// ----------------------------------------------------------------------------
export function renderCommercialMotorBreaker(
  ctx: CanvasRenderingContext2D,
  c: any,
  st: DeviceSimulationState,
  cw: number,
  ch: number,
  zoom: number,
  isClosed: boolean,
  isTrip: boolean
) {
  const inA = c.params?.current || 16;
  const brandName = (c.brand || c.brandName || 'Schneider Electric').toString();
  const shortBrand = REAL_BRANDS[brandName as DeviceBrand]?.shortName || brandName.split(' ')[0];

  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.roundRect(-cw / 2, -ch / 2, cw, ch, 4 * zoom);
  ctx.fill();
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 1.2 * zoom;
  ctx.stroke();

  const bW = cw * 0.78;
  const bH = ch * 0.54;
  ctx.fillStyle = '#090d16';
  ctx.beginPath();
  ctx.roundRect(-bW / 2, -bH / 2 + 2 * zoom, bW, bH, 3 * zoom);
  ctx.fill();

  const btnW = 16 * zoom;
  const btnH = 20 * zoom;
  const isStartDown = isClosed;
  ctx.fillStyle = isStartDown ? '#064e3b' : '#1e293b';
  ctx.beginPath();
  ctx.roundRect(-bW * 0.32, -bH * 0.35 + (isStartDown ? 1.5 * zoom : 0), btnW, btnH, 2 * zoom);
  ctx.fill();
  ctx.strokeStyle = isStartDown ? '#10b981' : '#64748b';
  ctx.stroke();

  ctx.fillStyle = isStartDown ? '#34d399' : '#f1f5f9';
  ctx.font = `bold ${Math.max(8, 9 * zoom)}px monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('I', -bW * 0.32 + btnW / 2, -bH * 0.35 + btnH / 2);

  const isStopSalient = !isClosed || isTrip;
  ctx.fillStyle = '#dc2626';
  ctx.beginPath();
  ctx.roundRect(-bW * 0.32 + btnW + 4 * zoom, -bH * 0.35 - (isStopSalient ? 1.5 * zoom : 0), btnW, btnH, 2 * zoom);
  ctx.fill();
  ctx.strokeStyle = '#7f1d1d';
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.fillText('O', -bW * 0.32 + btnW + 4 * zoom + btnW / 2, -bH * 0.35 + btnH / 2);

  // Dial de ajuste térmico calibrado
  const dialX = bW * 0.28;
  const dialY = -bH * 0.12;
  const dialR = 10 * zoom;

  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.arc(dialX, dialY, dialR, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#b45309';
  ctx.stroke();

  ctx.strokeStyle = '#090d16';
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.moveTo(dialX - dialR * 0.6, dialY);
  ctx.lineTo(dialX + dialR * 0.6, dialY);
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${Math.max(5.5, 6.5 * zoom)}px sans-serif`;
  ctx.fillText(`${inA}A`, dialX, dialY + dialR + 5 * zoom);

  ctx.fillStyle = '#94a3b8';
  ctx.font = `bold ${Math.max(5.5, 6.5 * zoom)}px sans-serif`;
  ctx.fillText(`${shortBrand.toUpperCase()} • MPCB 690V`, 0, ch / 2 - 9 * zoom);
}

// ----------------------------------------------------------------------------
// 3. CONTATOR INDUSTRIAL (ESTILO TESYS / SIRIUS / AF)
// ----------------------------------------------------------------------------
export function renderIndustrialTeSysContactor(
  ctx: CanvasRenderingContext2D,
  c: any,
  d: any,
  st: DeviceSimulationState,
  cw: number,
  ch: number,
  zoom: number
) {
  const isEnergized = Boolean(st.energized);
  const coilV = c.params?.coil || 230;
  const ac3Current = c.params?.ac3Current || c.params?.current || 25;
  const brandName = (c.brand || c.brandName || 'Schneider Electric').toString();
  const shortBrand = REAL_BRANDS[brandName as DeviceBrand]?.shortName || brandName.split(' ')[0];

  const cGrad = ctx.createLinearGradient(0, -ch / 2, 0, ch / 2);
  cGrad.addColorStop(0, '#334155');
  cGrad.addColorStop(0.12, '#1e293b');
  cGrad.addColorStop(0.88, '#0f172a');
  cGrad.addColorStop(1, '#020617');
  ctx.fillStyle = cGrad;
  ctx.beginPath();
  ctx.roundRect(-cw / 2, -ch / 2, cw, ch, 5 * zoom);
  ctx.fill();
  ctx.strokeStyle = isEnergized ? '#10b981' : '#475569';
  ctx.lineWidth = 1.6 * zoom;
  ctx.stroke();

  const auxW = cw * 0.70;
  const auxH = ch * 0.52;
  const auxY = -1 * zoom;

  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.roundRect(-auxW / 2, auxY - auxH / 2, auxW, auxH, 3 * zoom);
  ctx.fill();
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1 * zoom;
  ctx.stroke();

  const pW = auxW * 0.62;
  const pH = 24 * zoom;
  ctx.fillStyle = '#020617';
  ctx.beginPath();
  ctx.roundRect(-pW / 2, auxY - pH / 2, pW, pH, 2 * zoom);
  ctx.fill();

  const plunge = isEnergized ? 3.5 * zoom : 0;
  ctx.fillStyle = isEnergized ? '#10b981' : '#334155';
  ctx.beginPath();
  ctx.roundRect(-pW / 2 + 1.5 * zoom, auxY - pH / 2 + plunge, pW - 3 * zoom, pH - plunge, 2 * zoom);
  ctx.fill();

  ctx.fillStyle = isEnergized ? '#a7f3d0' : '#f1f5f9';
  ctx.font = `bold ${Math.max(6.5, 7.5 * zoom)}px monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(isEnergized ? '▲ ATRACADO' : '▼ REPOUSO', 0, auxY + plunge / 2);

  ctx.fillStyle = '#cbd5e1';
  ctx.font = `bold ${Math.max(5.5, 6.5 * zoom)}px sans-serif`;
  ctx.fillText(`${shortBrand} • AC-3 ${ac3Current}A (${coilV}V~)`, 0, ch / 2 - 9 * zoom);
}

// ----------------------------------------------------------------------------
// 4. RELÉ TÉRMICO DE SOBRECARGA BIMETÁLICO (OLR)
// ----------------------------------------------------------------------------
export function renderIndustrialOverloadRelay(
  ctx: CanvasRenderingContext2D,
  c: any,
  st: DeviceSimulationState,
  cw: number,
  ch: number,
  zoom: number
) {
  const isTrip = Boolean(st.tripped);
  const inA = c.params?.current || 16;
  const brandName = (c.brand || c.brandName || 'Schneider Electric').toString();
  const shortBrand = REAL_BRANDS[brandName as DeviceBrand]?.shortName || brandName.split(' ')[0];

  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.roundRect(-cw / 2, -ch / 2, cw, ch, 4 * zoom);
  ctx.fill();
  ctx.strokeStyle = isTrip ? '#ef4444' : '#475569';
  ctx.lineWidth = 1.4 * zoom;
  ctx.stroke();

  // Pinos de cobre maciço para conexão direta no contator
  [-cw * 0.28, 0, cw * 0.28].forEach(px => {
    ctx.fillStyle = '#b45309';
    ctx.fillRect(px - 2.5 * zoom, -ch / 2 - 4 * zoom, 5 * zoom, 5 * zoom);
  });

  const dialX = -cw * 0.22;
  const dialY = -2 * zoom;
  const dialR = 12 * zoom;

  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.arc(dialX, dialY, dialR, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#b45309';
  ctx.stroke();

  ctx.strokeStyle = '#020617';
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(dialX, dialY);
  ctx.lineTo(dialX + dialR * 0.7, dialY);
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${Math.max(5.5, 6.5 * zoom)}px monospace`;
  ctx.textAlign = 'center';
  ctx.fillText(`${inA}A`, dialX, dialY + dialR + 5 * zoom);

  // Botões de RESET e STOP
  const rstX = cw * 0.22;
  const rstY = -dialR * 0.55;
  ctx.fillStyle = isTrip ? '#ef4444' : '#0284c7';
  ctx.beginPath();
  ctx.arc(rstX, rstY, 7 * zoom, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${Math.max(5, 6 * zoom)}px sans-serif`;
  ctx.textBaseline = 'middle';
  ctx.fillText(isTrip ? 'TRIP' : 'RESET', rstX, rstY);

  ctx.fillStyle = '#cbd5e1';
  ctx.font = `bold ${Math.max(5.5, 6.5 * zoom)}px sans-serif`;
  ctx.fillText(`${shortBrand} • 95-96 NF / 97-98 NA`, 0, ch / 2 - 9 * zoom);
}

// ----------------------------------------------------------------------------
// 5. MOTOR INDUSTRIAL WEG COM ALETAS DE VENTILAÇÃO E ROTAÇÃO
// ----------------------------------------------------------------------------
export function renderIndustrialWegMotor(
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
  const isRunning = Boolean(simRunning && st.running && (st.rpm || 0) > 0);
  const rpm = isRunning ? (st.rpm || 0) : 0;
  const pNom = Number(c.params?.power || 7500);
  const pKw = (pNom / 1000).toFixed(1);
  const vNom = c.params?.voltage || 400;
  const brandName = (c.brand || c.brandName || 'WEG Motors').toString();
  const r = Math.min(cw, ch) * 0.38;

  const isCCW = st.rotationDir === 'CCW';
  const dirMultiplier = isCCW ? -1 : 1;
  const rotAngle = isRunning ? (dirMultiplier * time * (rpm / 60) * Math.PI * 2) : 0;

  // Caixa de bornes de ligação no topo do motor
  const tBoxW = cw * 0.48;
  const tBoxH = 13 * zoom;
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(-tBoxW / 2, -r - tBoxH + 2 * zoom, tBoxW, tBoxH);
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 1 * zoom;
  ctx.strokeRect(-tBoxW / 2, -r - tBoxH + 2 * zoom, tBoxW, tBoxH);

  // Carcaça de ferro fundido com aletas de refrigeração
  const mGrad = ctx.createRadialGradient(0, 0, r * 0.15, 0, 0, r);
  if (isRunning) {
    mGrad.addColorStop(0, '#047857');
    mGrad.addColorStop(0.65, '#065f46');
    mGrad.addColorStop(1, '#022c22');
  } else {
    mGrad.addColorStop(0, '#0284c7');
    mGrad.addColorStop(0.65, '#0369a1');
    mGrad.addColorStop(1, '#075985');
  }

  ctx.fillStyle = mGrad;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = isRunning ? '#10b981' : '#0284c7';
  ctx.lineWidth = 2 * zoom;
  ctx.stroke();

  // Aletas do estator (refrigeração radial)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
  ctx.lineWidth = 1.2 * zoom;
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 6) {
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * (r * 0.55), Math.sin(a) * (r * 0.55));
    ctx.lineTo(Math.cos(a) * (r * 0.96), Math.sin(a) * (r * 0.96));
    ctx.stroke();
  }

  // Cubo central e ventoinha
  const hubR = r * 0.52;
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(0, 0, hubR, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1 * zoom;
  ctx.stroke();

  ctx.save();
  ctx.rotate(rotAngle);
  const bladeR = hubR * 0.88;
  for (let b = 0; b < 6; b++) {
    ctx.fillStyle = isRunning ? (isCCW ? '#f59e0b' : '#34d399') : '#64748b';
    ctx.beginPath();
    ctx.ellipse(bladeR * 0.55, 0, bladeR * 0.35, bladeR * 0.14, 0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.rotate(Math.PI / 3);
  }

  // Eixo usinado com rasgo de chaveta
  const shaftR = hubR * 0.38;
  const sGrad = ctx.createLinearGradient(-shaftR, -shaftR, shaftR, shaftR);
  sGrad.addColorStop(0, '#ffffff');
  sGrad.addColorStop(0.5, '#cbd5e1');
  sGrad.addColorStop(1, '#64748b');
  ctx.fillStyle = sGrad;
  ctx.beginPath();
  ctx.arc(0, 0, shaftR, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#0284c7';
  ctx.fillRect(-2 * zoom, -shaftR * 0.9, 4 * zoom, shaftR * 0.7);
  ctx.restore();

  // Dados essenciais visíveis: Marca, Potência em kW, Tensão e RPM
  ctx.fillStyle = isRunning ? '#a7f3d0' : '#ffffff';
  ctx.font = `bold ${Math.max(6.5, 7.5 * zoom)}px monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText(`${brandName} • ${pKw}kW ${vNom}V • ${isRunning ? Math.round(rpm) : 0} RPM`, 0, ch / 2 - 10 * zoom);
}

// ----------------------------------------------------------------------------
// 6. INTERRUPTORES RESIDENCIAIS & COMERCIAIS MODULARES (1P, 2P, 2x1P, 3-WAY, 4-WAY)
// ----------------------------------------------------------------------------
export function renderCommercialRockerSwitch(
  ctx: CanvasRenderingContext2D,
  c: any,
  d: any,
  st: DeviceSimulationState,
  cw: number,
  ch: number,
  zoom: number
) {
  const brandName = (c.brand || c.brandName || 'Schneider Electric').toString();
  const shortBrand = REAL_BRANDS[brandName as DeviceBrand]?.shortName || brandName.split(' ')[0];
  const inA = c.params?.current || 10;

  // Placa de acabamento termoplástico acetinado (Padrão 4x2 / 45x45 modular)
  const plateW = cw;
  const plateH = ch;
  const plateGrad = ctx.createLinearGradient(0, -plateH / 2, 0, plateH / 2);
  plateGrad.addColorStop(0, '#f8fafc');
  plateGrad.addColorStop(0.08, '#e2e8f0');
  plateGrad.addColorStop(0.92, '#cbd5e1');
  plateGrad.addColorStop(1, '#94a3b8');

  ctx.fillStyle = plateGrad;
  ctx.beginPath();
  ctx.roundRect(-plateW / 2, -plateH / 2, plateW, plateH, 6 * zoom);
  ctx.fill();
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 1 * zoom;
  ctx.stroke();

  // Chanfro interno e moldura rebaixada
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.roundRect(-plateW / 2 + 2 * zoom, -plateH / 2 + 2 * zoom, plateW - 4 * zoom, plateH - 4 * zoom, 4 * zoom);
  ctx.stroke();

  // Nicho central rebaixado para tecla(s)
  const recW = plateW * 0.76;
  const recH = plateH * 0.72;
  const recGrad = ctx.createLinearGradient(0, -recH / 2, 0, recH / 2);
  recGrad.addColorStop(0, '#0f172a');
  recGrad.addColorStop(0.15, '#1e293b');
  recGrad.addColorStop(0.85, '#334155');
  recGrad.addColorStop(1, '#475569');

  ctx.fillStyle = recGrad;
  ctx.beginPath();
  ctx.roundRect(-recW / 2, -recH / 2, recW, recH, 3 * zoom);
  ctx.fill();
  ctx.strokeStyle = '#020617';
  ctx.lineWidth = 1 * zoom;
  ctx.stroke();

  // --------------------------------------------------------------------------
  // CASO 1: COMUTADOR PARALELO 3-WAY (ESCADA)
  // --------------------------------------------------------------------------
  if (c.code === 'THREE_WAY') {
    const keyW = recW - 4 * zoom;
    const keyH = recH - 4 * zoom;
    const pos = Number(c.params?.position ?? st.rockerAngle ?? (st.closed ? 1 : 0));
    const isR2 = pos === 1;

    const kGrad = ctx.createLinearGradient(0, -keyH / 2, 0, keyH / 2);
    if (isR2) {
      kGrad.addColorStop(0, '#1e293b');
      kGrad.addColorStop(0.3, '#334155');
      kGrad.addColorStop(1, '#64748b');
    } else {
      kGrad.addColorStop(0, '#f8fafc');
      kGrad.addColorStop(0.7, '#e2e8f0');
      kGrad.addColorStop(1, '#cbd5e1');
    }

    ctx.fillStyle = kGrad;
    ctx.beginPath();
    ctx.roundRect(-keyW / 2, -keyH / 2, keyW, keyH, 3 * zoom);
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1 * zoom;
    ctx.stroke();

    // Rota comutada e iluminação de guia
    ctx.fillStyle = isR2 ? '#38bdf8' : '#0284c7';
    ctx.font = `black ${Math.max(8, 9.5 * zoom)}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(isR2 ? 'ROTA: R2' : 'ROTA: R1', 0, -4 * zoom);

    ctx.fillStyle = isR2 ? '#f1f5f9' : '#334155';
    ctx.font = `bold ${Math.max(6, 7 * zoom)}px sans-serif`;
    ctx.fillText('3-WAY (PARALELO)', 0, 8 * zoom);

  // --------------------------------------------------------------------------
  // CASO 2: COMUTADOR INTERMEDIÁRIO 4-WAY (CRUZAMENTO)
  // --------------------------------------------------------------------------
  } else if (c.code === 'FOUR_WAY') {
    const keyW = recW - 4 * zoom;
    const keyH = recH - 4 * zoom;
    const isCrossed = Boolean(c.params?.crossed ?? st.crossed ?? st.closed);

    const kGrad = ctx.createLinearGradient(0, -keyH / 2, 0, keyH / 2);
    if (isCrossed) {
      kGrad.addColorStop(0, '#1e293b');
      kGrad.addColorStop(0.5, '#334155');
      kGrad.addColorStop(1, '#475569');
    } else {
      kGrad.addColorStop(0, '#ffffff');
      kGrad.addColorStop(0.5, '#e2e8f0');
      kGrad.addColorStop(1, '#94a3b8');
    }

    ctx.fillStyle = kGrad;
    ctx.beginPath();
    ctx.roundRect(-keyW / 2, -keyH / 2, keyW, keyH, 3 * zoom);
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1 * zoom;
    ctx.stroke();

    ctx.fillStyle = isCrossed ? '#f59e0b' : '#10b981';
    ctx.font = `black ${Math.max(8, 9.5 * zoom)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(isCrossed ? '⤮ CRUZADO' : '⇹ DIRETO', 0, -4 * zoom);

    ctx.fillStyle = isCrossed ? '#f1f5f9' : '#334155';
    ctx.font = `bold ${Math.max(6, 7 * zoom)}px sans-serif`;
    ctx.fillText('4-WAY INTERMEDIÁRIO', 0, 8 * zoom);

  // --------------------------------------------------------------------------
  // CASO 3: INTERRUPTOR DUPLO 2 TECLAS
  // --------------------------------------------------------------------------
  } else if (c.code === 'SW_DOUBLE') {
    const keyGap = 3 * zoom;
    const keyW = (recW - keyGap - 4 * zoom) / 2;
    const keyH = recH - 4 * zoom;

    const k1 = Boolean(st.closed1 ?? st.closed);
    const k2 = Boolean(st.closed2);

    const drawKey = (cxKey: number, active: boolean, label: string) => {
      ctx.save();
      ctx.translate(cxKey, 0);
      ctx.fillStyle = active ? '#334155' : '#f1f5f9';
      ctx.beginPath();
      ctx.roundRect(-keyW / 2, -keyH / 2, keyW, keyH, 2.5 * zoom);
      ctx.fill();
      ctx.strokeStyle = '#0f172a';
      ctx.stroke();

      ctx.fillStyle = active ? '#22c55e' : '#64748b';
      ctx.beginPath();
      ctx.arc(0, active ? keyH * 0.3 : -keyH * 0.3, 2 * zoom, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = active ? '#ffffff' : '#0f172a';
      ctx.font = `bold ${Math.max(5.5, 6.5 * zoom)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, 0, 0);
      ctx.restore();
    };

    drawKey(-keyW / 2 - keyGap / 2, k1, 'R1');
    drawKey(keyW / 2 + keyGap / 2, k2, 'R2');

  // --------------------------------------------------------------------------
  // CASO 4: INTERRUPTOR SIMPLES (SW) OU BIPOLAR (SW2)
  // --------------------------------------------------------------------------
  } else {
    const keyW = recW - 4 * zoom;
    const keyH = recH - 4 * zoom;
    const isClosed = Boolean(st.closed);

    ctx.fillStyle = isClosed ? '#334155' : '#f8fafc';
    ctx.beginPath();
    ctx.roundRect(-keyW / 2, -keyH / 2, keyW, keyH, 3 * zoom);
    ctx.fill();
    ctx.strokeStyle = isClosed ? '#0f172a' : '#94a3b8';
    ctx.stroke();

    ctx.fillStyle = isClosed ? '#10b981' : '#64748b';
    ctx.beginPath();
    ctx.arc(0, isClosed ? keyH * 0.28 : -keyH * 0.28, 2.5 * zoom, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = isClosed ? '#ffffff' : '#1e293b';
    ctx.font = `bold ${Math.max(7, 8.5 * zoom)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(isClosed ? 'LIGADO (I)' : 'DESLIGADO (O)', 0, 0);
  }

  // Marca comercial e especificação técnica gravadas na moldura
  ctx.fillStyle = '#64748b';
  ctx.font = `bold ${Math.max(5, 6 * zoom)}px monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillText(`${shortBrand.toUpperCase()} • ${inA}A 250V~`, 0, plateH / 2 - 2 * zoom);
}

// ----------------------------------------------------------------------------
// 7. MÓDULO SOLAR FOTOVOLTAICO INDUSTRIAL HIPER-REALISTA (HALF-CELL MBB)
// ----------------------------------------------------------------------------
export function renderCommercialPvPanel(
  ctx: CanvasRenderingContext2D,
  c: any,
  st: DeviceSimulationState,
  cw: number,
  ch: number,
  zoom: number
) {
  const pMax = Number(c.params?.pMax ?? 550);
  const vmpp = Number(c.params?.vmpp ?? 41.8);
  const irr = Number(c.params?.irradiance ?? 1000);
  const isSunny = irr > 0;
  const brandName = (c.brand || c.brandName || 'Tier-1 Solar').toString();
  const shortBrand = REAL_BRANDS[brandName as DeviceBrand]?.shortName || brandName.split(' ')[0];

  // Moldura de alumínio anodizado prata escovado com chanfro 3D
  const frameBorder = Math.max(3, 4.5 * zoom);
  const frameGrad = ctx.createLinearGradient(-cw / 2, -ch / 2, cw / 2, ch / 2);
  frameGrad.addColorStop(0, '#e2e8f0');
  frameGrad.addColorStop(0.2, '#cbd5e1');
  frameGrad.addColorStop(0.5, '#64748b');
  frameGrad.addColorStop(0.8, '#94a3b8');
  frameGrad.addColorStop(1, '#334155');

  ctx.fillStyle = frameGrad;
  ctx.beginPath();
  ctx.roundRect(-cw / 2, -ch / 2, cw, ch, 4 * zoom);
  ctx.fill();
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1 * zoom;
  ctx.stroke();

  // Vidro antirreflexo e matriz de células de silício monocristalino
  const innerW = cw - frameBorder * 2;
  const innerH = ch - frameBorder * 2;
  const glassX = -cw / 2 + frameBorder;
  const glassY = -ch / 2 + frameBorder;

  const cellGrad = ctx.createLinearGradient(glassX, glassY, glassX + innerW, glassY + innerH);
  if (isSunny) {
    cellGrad.addColorStop(0, '#0f2942');
    cellGrad.addColorStop(0.3, '#0b1d30');
    cellGrad.addColorStop(0.7, '#071524');
    cellGrad.addColorStop(1, '#030a12');
  } else {
    cellGrad.addColorStop(0, '#1e293b');
    cellGrad.addColorStop(0.5, '#0f172a');
    cellGrad.addColorStop(1, '#020617');
  }

  ctx.fillStyle = cellGrad;
  ctx.fillRect(glassX, glassY, innerW, innerH);

  // Grade física de células (Half-Cell e barramentos MBB)
  ctx.save();
  ctx.beginPath();
  ctx.rect(glassX, glassY, innerW, innerH);
  ctx.clip();

  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.moveTo(glassX, 0);
  ctx.lineTo(glassX + innerW, 0);
  ctx.stroke();

  const cols = 6;
  const rows = 4;
  const colW = innerW / cols;
  const rowH = innerH / rows;

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 0.6 * zoom;
  for (let cIdx = 1; cIdx < cols; cIdx++) {
    const xLine = glassX + cIdx * colW;
    ctx.beginPath();
    ctx.moveTo(xLine, glassY);
    ctx.lineTo(xLine, glassY + innerH);
    ctx.stroke();
  }
  for (let rIdx = 1; rIdx < rows; rIdx++) {
    const yLine = glassY + rIdx * rowH;
    ctx.beginPath();
    ctx.moveTo(glassX, yLine);
    ctx.lineTo(glassX + innerW, yLine);
    ctx.stroke();
  }

  if (isSunny) {
    const glint = ctx.createLinearGradient(glassX, glassY, glassX + innerW * 0.7, glassY + innerH * 0.7);
    glint.addColorStop(0, 'rgba(254, 240, 138, 0.18)');
    glint.addColorStop(0.2, 'rgba(56, 189, 248, 0.12)');
    glint.addColorStop(0.6, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = glint;
    ctx.fillRect(glassX, glassY, innerW, innerH);
  }
  ctx.restore();

  // Plaqueta técnica central: Marca, Wp e Vmpp em tempo real
  const tagW = Math.min(innerW * 0.82, 95 * zoom);
  const tagH = 34 * zoom;
  ctx.fillStyle = 'rgba(2, 6, 23, 0.92)';
  ctx.beginPath();
  ctx.roundRect(-tagW / 2, -tagH / 2, tagW, tagH, 3 * zoom);
  ctx.fill();
  ctx.strokeStyle = isSunny ? '#f59e0b' : '#334155';
  ctx.lineWidth = 1 * zoom;
  ctx.stroke();

  ctx.fillStyle = isSunny ? '#fde047' : '#94a3b8';
  ctx.font = `bold ${Math.max(5.5, 6.5 * zoom)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText(shortBrand.toUpperCase(), 0, -tagH / 2 + 3 * zoom);

  ctx.fillStyle = '#ffffff';
  ctx.font = `black ${Math.max(7.5, 9.5 * zoom)}px 'Courier New', monospace`;
  ctx.fillText(`${pMax}Wp • ${vmpp}V`, 0, -tagH / 2 + 12 * zoom);

  const currGen = isSunny ? ((pMax * (irr / 1000)) / Math.max(1, vmpp)).toFixed(1) : '0.0';
  ctx.fillStyle = isSunny ? '#34d399' : '#64748b';
  ctx.font = `bold ${Math.max(5.5, 6.5 * zoom)}px monospace`;
  ctx.fillText(`${irr} W/m² • ${currGen}A`, 0, -tagH / 2 + 23 * zoom);
}

// ----------------------------------------------------------------------------
// 8. BATERIA DE LÍTIO LiFePO4 RACK 19" INDUSTRIAL HIPER-REALISTA
// ----------------------------------------------------------------------------
export function renderCommercialLiFePO4(
  ctx: CanvasRenderingContext2D,
  c: any,
  st: DeviceSimulationState,
  cw: number,
  ch: number,
  zoom: number
) {
  const vNom = Number(c.params?.voltage ?? 51.2);
  const capAh = Number(c.params?.capacityAh ?? 100);
  const soc = Math.max(0, Math.min(100, Number(c.params?.socPercent ?? st.percent ?? 90)));
  const brandName = (c.brand || c.brandName || 'LiFePO4 PowerRack').toString();
  const shortBrand = REAL_BRANDS[brandName as DeviceBrand]?.shortName || brandName.split(' ')[0];
  const isHealthy = c.params?.bmsOk !== false && !st.tripped;

  // Chassi metálico 3U preto fosco texturizado (Rack 19" RAL 9005)
  const chassisGrad = ctx.createLinearGradient(-cw / 2, -ch / 2, cw / 2, ch / 2);
  chassisGrad.addColorStop(0, '#1e293b');
  chassisGrad.addColorStop(0.1, '#0f172a');
  chassisGrad.addColorStop(0.85, '#090d16');
  chassisGrad.addColorStop(1, '#020617');

  ctx.fillStyle = chassisGrad;
  ctx.beginPath();
  ctx.roundRect(-cw / 2, -ch / 2, cw, ch, 4 * zoom);
  ctx.fill();
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1.4 * zoom;
  ctx.stroke();

  // Orelhas de fixação de rack 19" com furos M6
  const earW = 7 * zoom;
  [-cw / 2, cw / 2 - earW].forEach(ex => {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(ex, -ch / 2, earW, ch);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 0.8 * zoom;
    ctx.strokeRect(ex, -ch / 2, earW, ch);

    [-ch * 0.35, ch * 0.35].forEach(sy => {
      ctx.fillStyle = '#cbd5e1';
      ctx.beginPath();
      ctx.arc(ex + earW / 2, sy, 1.8 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#090d16';
      ctx.lineWidth = 0.6 * zoom;
      ctx.stroke();
    });
  });

  // Display LCD/OLED digital iluminado
  const dW = cw * 0.44;
  const dH = 34 * zoom;
  const dX = -cw * 0.04;
  const dY = -2 * zoom;

  ctx.fillStyle = '#020617';
  ctx.beginPath();
  ctx.roundRect(dX - dW / 2, dY - dH / 2, dW, dH, 2.5 * zoom);
  ctx.fill();
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1 * zoom;
  ctx.stroke();

  // Leitura digital: SOC%, Tensão e Ah
  ctx.fillStyle = '#38bdf8';
  ctx.font = `black ${Math.max(8.5, 10.5 * zoom)}px 'Courier New', monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText(`${soc}% SOC`, dX, dY - dH / 2 + 3 * zoom);

  ctx.fillStyle = '#22c55e';
  ctx.font = `bold ${Math.max(6, 7.5 * zoom)}px monospace`;
  ctx.fillText(`${vNom}V • ${capAh}Ah`, dX, dY - dH / 2 + 15 * zoom);

  // Barra de LED de status de carga
  const barW = dW * 0.85;
  const barH = 4 * zoom;
  const barX = dX - barW / 2;
  const barY = dY - dH / 2 + 25 * zoom;

  ctx.fillStyle = '#090d16';
  ctx.fillRect(barX, barY, barW, barH);
  const fillW = (soc / 100) * barW;
  ctx.fillStyle = soc > 20 ? '#22c55e' : '#ef4444';
  ctx.fillRect(barX, barY, fillW, barH);

  // LEDs de status RUN e ALARM
  const ledGroupX = cw * 0.28;
  const ledY = -ch * 0.2;
  ['RUN', 'ALM'].forEach((txt, idx) => {
    const lx = ledGroupX + (idx === 0 ? -6 * zoom : 6 * zoom);
    const isOn = idx === 0 ? isHealthy : !isHealthy;
    ctx.fillStyle = isOn ? (idx === 0 ? '#22c55e' : '#ef4444') : '#334155';
    ctx.beginPath();
    ctx.arc(lx, ledY, 1.8 * zoom, 0, Math.PI * 2);
    ctx.fill();
  });

  // Marca gravada
  ctx.fillStyle = '#cbd5e1';
  ctx.font = `bold ${Math.max(6, 7 * zoom)}px sans-serif`;
  ctx.textAlign = 'left';
  ctx.fillText(`${shortBrand.toUpperCase()} LiFePO4`, -cw * 0.32, -ch / 2 + 10 * zoom);
}

// ----------------------------------------------------------------------------
// 9. DEMAIS DISPOSITIVOS INDUSTRIAIS
// ----------------------------------------------------------------------------
export function renderCommercialOffGridInverter(ctx: CanvasRenderingContext2D, c: any, st: any, cw: number, ch: number, zoom: number, simRunning: boolean) {
  const isOperating = Boolean(simRunning && st.running);
  const pNom = ((c.params?.powerW || 5000) / 1000).toFixed(1);
  ctx.fillStyle = '#e2e8f0';
  ctx.beginPath();
  ctx.roundRect(-cw / 2, -ch / 2, cw, ch, 6 * zoom);
  ctx.fill();
  ctx.strokeStyle = isOperating ? '#10b981' : '#64748b';
  ctx.lineWidth = 1.8 * zoom;
  ctx.stroke();

  const dW = cw * 0.74;
  const dH = 34 * zoom;
  ctx.fillStyle = '#020617';
  ctx.fillRect(-dW / 2, -dH / 2 - 2 * zoom, dW, dH);

  ctx.fillStyle = isOperating ? '#22c55e' : '#ef4444';
  ctx.font = `bold ${Math.max(7.5, 9 * zoom)}px 'Courier New', monospace`;
  ctx.textAlign = 'center';
  ctx.fillText(isOperating ? `230V CA • ${pNom}kW` : 'STANDBY (SEM DC)', 0, -6 * zoom);

  ctx.fillStyle = '#38bdf8';
  ctx.font = `bold ${Math.max(5.5, 6.5 * zoom)}px monospace`;
  ctx.fillText(`BAT: ${st.batVoltage || 0}V | PV: ${st.pvVoltage || 0}V`, 0, 4 * zoom);
}

export function renderCommercialOnGridInverter(ctx: CanvasRenderingContext2D, c: any, st: any, cw: number, ch: number, zoom: number, simRunning: boolean) {
  const isOperating = Boolean(simRunning && st.running);
  const pNom = Number(c.params?.powerKW || 10).toFixed(1);
  ctx.fillStyle = '#f8fafc';
  ctx.beginPath();
  ctx.roundRect(-cw / 2, -ch / 2, cw, ch, 6 * zoom);
  ctx.fill();
  ctx.strokeStyle = isOperating ? '#22c55e' : '#64748b';
  ctx.stroke();

  const dW = cw * 0.76;
  const dH = 34 * zoom;
  ctx.fillStyle = '#020617';
  ctx.fillRect(-dW / 2, -dH / 2 - 3 * zoom, dW, dH);

  ctx.fillStyle = isOperating ? '#34d399' : '#f59e0b';
  ctx.font = `bold ${Math.max(7.5, 9 * zoom)}px 'Courier New', monospace`;
  ctx.textAlign = 'center';
  ctx.fillText(isOperating ? `${(st.powerKW || 0).toFixed(2)} kW INJETANDO` : `MPPT ${pNom}kW STANDBY`, 0, -6 * zoom);
}

export function renderCommercialHybridInverter(ctx: CanvasRenderingContext2D, c: any, st: any, cw: number, ch: number, zoom: number, simRunning: boolean) {
  const isOperating = Boolean(simRunning && st.running);
  const pNom = Number(c.params?.powerKW || 6).toFixed(1);
  ctx.fillStyle = '#f1f5f9';
  ctx.beginPath();
  ctx.roundRect(-cw / 2, -ch / 2, cw, ch, 6 * zoom);
  ctx.fill();
  ctx.strokeStyle = isOperating ? '#10b981' : '#64748b';
  ctx.stroke();

  const dW = cw * 0.74;
  const dH = 34 * zoom;
  ctx.fillStyle = '#020617';
  ctx.fillRect(-dW / 2, -dH / 2 - 3 * zoom, dW, dH);

  ctx.fillStyle = isOperating ? '#34d399' : '#f59e0b';
  ctx.font = `bold ${Math.max(7.5, 9 * zoom)}px 'Courier New', monospace`;
  ctx.textAlign = 'center';
  ctx.fillText(isOperating ? `230V EPS • ${pNom}kW` : 'STANDBY HÍBRIDO', 0, -4 * zoom);
}

export function renderCommercialSmartMeter(ctx: CanvasRenderingContext2D, c: any, st: any, cw: number, ch: number, zoom: number) {
  ctx.fillStyle = '#f8fafc';
  ctx.beginPath();
  ctx.roundRect(-cw / 2, -ch / 2, cw, ch, 4 * zoom);
  ctx.fill();
  ctx.strokeStyle = '#94a3b8';
  ctx.stroke();

  const dW = cw * 0.76;
  const dH = 30 * zoom;
  ctx.fillStyle = '#020617';
  ctx.fillRect(-dW / 2, -dH / 2 - 2 * zoom, dW, dH);

  ctx.fillStyle = '#38bdf8';
  ctx.font = `bold ${Math.max(8, 9.5 * zoom)}px 'Courier New', monospace`;
  ctx.textAlign = 'center';
  ctx.fillText(`${st.energyKWh || '0.00'} kWh`, 0, -5 * zoom);

  ctx.fillStyle = '#34d399';
  ctx.font = `bold ${Math.max(5.5, 6.5 * zoom)}px monospace`;
  ctx.fillText(`${Math.round((st.powerKW || 0) * 1000)}W • 230V`, 0, 5 * zoom);
}

export function renderCommercialGenerator(ctx: CanvasRenderingContext2D, c: any, st: any, cw: number, ch: number, zoom: number, time: number, simRunning: boolean) {
  const isRunning = Boolean(simRunning && (st.running || c.params?.running));
  const kva = c.params?.kva || 25;
  ctx.fillStyle = '#ca8a04';
  ctx.beginPath();
  ctx.roundRect(-cw / 2, -ch / 2, cw, ch, 6 * zoom);
  ctx.fill();

  const dX = cw * 0.14;
  ctx.fillStyle = '#020617';
  ctx.fillRect(dX - 22 * zoom, -17 * zoom, 44 * zoom, 26 * zoom);
  ctx.fillStyle = isRunning ? '#22c55e' : '#ef4444';
  ctx.font = `bold ${Math.max(6, 7 * zoom)}px monospace`;
  ctx.textAlign = 'center';
  ctx.fillText(isRunning ? `${kva}kVA 400V` : 'GMG OFF', dX, -4 * zoom);
}

export function renderCommercialAts(ctx: CanvasRenderingContext2D, c: any, st: any, cw: number, ch: number, zoom: number) {
  const isGrid = (c.params?.sourceInUse ?? 'GRID') === 'GRID';
  ctx.fillStyle = '#cbd5e1';
  ctx.beginPath();
  ctx.roundRect(-cw / 2, -ch / 2, cw, ch, 6 * zoom);
  ctx.fill();

  ctx.fillStyle = isGrid ? '#22c55e' : '#f59e0b';
  ctx.beginPath();
  ctx.arc(0, 0, 8 * zoom, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#0f172a';
  ctx.font = `bold ${Math.max(6, 7 * zoom)}px monospace`;
  ctx.textAlign = 'center';
  ctx.fillText(`ATS • ${isGrid ? 'REDE OK' : 'GMG ATIVO'}`, 0, ch / 2 - 10 * zoom);
}

export function renderCommercialMts(ctx: CanvasRenderingContext2D, c: any, st: any, cw: number, ch: number, zoom: number) {
  const pos = Number(c.params?.position ?? 1);
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.roundRect(-cw / 2, -ch / 2, cw, ch, 6 * zoom);
  ctx.fill();

  ctx.fillStyle = '#cbd5e1';
  ctx.font = `bold ${Math.max(6, 7 * zoom)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText(pos === 1 ? 'I (REDE)' : pos === 2 ? 'II (GMG)' : '0 (DESL)', 0, 0);
}

export function renderCommercialRotarySelector(ctx: CanvasRenderingContext2D, c: any, st: any, cw: number, ch: number, zoom: number) {
  const pos = Number(c.params?.position ?? st.position ?? 0);
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.roundRect(-cw / 2, -ch / 2, cw, ch, 6 * zoom);
  ctx.fill();
  ctx.fillStyle = '#cbd5e1';
  ctx.font = `bold ${Math.max(6, 7 * zoom)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText(pos === 1 ? 'MAN' : pos === 2 ? 'AUTO' : '0 (DESL)', 0, 0);
}

export function renderCommercialHarmonyPushButton(
  ctx: CanvasRenderingContext2D,
  c: any,
  st: DeviceSimulationState,
  cw: number,
  ch: number,
  zoom: number
) {
  const isNO = c.code === 'PBNO';
  const isPressed = Boolean(st.pressed);

  const tagW = cw * 0.88;
  const tagH = 14 * zoom;
  const tagY = -ch / 2 + tagH / 2 + 2 * zoom;

  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.roundRect(-tagW / 2, tagY - tagH / 2, tagW, tagH, 2 * zoom);
  ctx.fill();
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1 * zoom;
  ctx.stroke();

  ctx.fillStyle = isNO ? '#34d399' : '#f87171';
  ctx.font = `bold ${Math.max(6, 7 * zoom)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(isNO ? 'START • (3-4)' : 'STOP • (1-2)', 0, tagY);

  const btnCenterY = ch * 0.10;
  const rBezel = Math.min(cw, ch) * 0.34;
  ctx.fillStyle = '#64748b';
  ctx.beginPath();
  ctx.arc(0, btnCenterY, rBezel, 0, Math.PI * 2);
  ctx.fill();

  const travel = isPressed ? 3 * zoom : 0;
  const rCap = rBezel * 0.76 - (isPressed ? 1 * zoom : 0);

  ctx.fillStyle = isNO ? '#16a34a' : '#dc2626';
  ctx.beginPath();
  ctx.arc(0, btnCenterY + travel, rCap, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${Math.max(9, 11 * zoom)}px sans-serif`;
  ctx.fillText(isNO ? 'I' : 'O', 0, btnCenterY + travel);
}

export function renderCommercialCeilingLamp(ctx: CanvasRenderingContext2D, c: any, st: any, cw: number, ch: number, zoom: number) {
  const isLit = Boolean(st.energized && !st.tripped);
  const pW = c.params?.power || 60;
  const socW = 18 * zoom;
  const socH = 12 * zoom;
  const socY = -ch * 0.28;

  ctx.fillStyle = '#b45309';
  ctx.fillRect(-socW / 2, socY, socW, socH);

  const bulbR = Math.min(cw, ch) * 0.32;
  const bulbY = socY + socH + bulbR * 0.75;

  if (isLit) {
    ctx.save();
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur = 24 * zoom;
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(0, bulbY, bulbR * 1.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  ctx.fillStyle = isLit ? '#fde047' : '#475569';
  ctx.beginPath();
  ctx.arc(0, bulbY, bulbR, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = isLit ? '#ca8a04' : '#64748b';
  ctx.stroke();

  ctx.fillStyle = isLit ? '#854d0e' : '#cbd5e1';
  ctx.font = `bold ${Math.max(6, 7 * zoom)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText(isLit ? `${pW}W • ACESA` : `${pW}W 230V`, 0, ch / 2 - 6 * zoom);
}

export function renderCommercialPanelPilot(ctx: CanvasRenderingContext2D, c: any, st: any, cw: number, ch: number, zoom: number) {
  const isOn = Boolean(st.energized && !st.tripped);
  const color = c.code.includes('GREEN') ? 'green' : c.code.includes('RED') ? 'red' : 'yellow';
  const rBezel = Math.min(cw, ch) * 0.36;

  ctx.fillStyle = '#94a3b8';
  ctx.beginPath();
  ctx.arc(0, 0, rBezel, 0, Math.PI * 2);
  ctx.fill();

  const rLens = rBezel * 0.74;
  ctx.fillStyle = isOn ? (color === 'green' ? '#22c55e' : color === 'red' ? '#ef4444' : '#eab308') : '#334155';
  ctx.beginPath();
  ctx.arc(0, 0, rLens, 0, Math.PI * 2);
  ctx.fill();
}

export function renderCommercialOutlet(ctx: CanvasRenderingContext2D, c: any, st: any, cw: number, ch: number, zoom: number) {
  const plateW = cw;
  const plateH = ch;
  ctx.fillStyle = '#f8fafc';
  ctx.beginPath();
  ctx.roundRect(-plateW / 2, -plateH / 2, plateW, plateH, 6 * zoom);
  ctx.fill();
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 1 * zoom;
  ctx.stroke();

  const cavityR = Math.min(plateW, plateH) * 0.34;
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(0, 0, cavityR, 0, Math.PI * 2);
  ctx.fill();

  [-cavityR * 0.52, 0, cavityR * 0.52].forEach(px => {
    ctx.fillStyle = '#020617';
    ctx.beginPath();
    ctx.arc(px, 0, 2.5 * zoom, 0, Math.PI * 2);
    ctx.fill();
  });
}

export function renderCommercialPowerSource(ctx: CanvasRenderingContext2D, c: any, st: any, cw: number, ch: number, zoom: number) {
  const is3P = c.code === 'SRC_AC3';
  const vNom = c.params?.voltage || (is3P ? 400 : 230);
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.roundRect(-cw / 2, -ch / 2, cw, ch, 5 * zoom);
  ctx.fill();
  ctx.strokeStyle = is3P ? '#f59e0b' : '#38bdf8';
  ctx.stroke();

  ctx.fillStyle = '#020617';
  ctx.fillRect(-cw * 0.38, -ch * 0.22, cw * 0.76, 22 * zoom);
  ctx.fillStyle = is3P ? '#facc15' : '#34d399';
  ctx.font = `bold ${Math.max(9, 11 * zoom)}px 'Courier New', monospace`;
  ctx.textAlign = 'center';
  ctx.fillText(`${Number(vNom).toFixed(1)} V`, 0, -ch * 0.08);
}

export function renderCommercialIndustrialHeater(ctx: CanvasRenderingContext2D, c: any, st: any, cw: number, ch: number, zoom: number) {
  const isHeat = Boolean(st.energized);
  const pW = c.params?.power || 2000;
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.roundRect(-cw / 2, -ch / 2, cw, ch, 4 * zoom);
  ctx.fill();
  ctx.strokeStyle = isHeat ? '#f97316' : '#64748b';
  ctx.lineWidth = 2.5 * zoom;
  ctx.stroke();

  ctx.fillStyle = '#cbd5e1';
  ctx.font = `bold ${Math.max(6, 7 * zoom)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText(`${pW}W`, 0, 0);
}

export function renderCommercialGenericBox(ctx: CanvasRenderingContext2D, c: any, d: any, st: any, cw: number, ch: number, zoom: number) {
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.roundRect(-cw / 2, -ch / 2, cw, ch, 4 * zoom);
  ctx.fill();
}

export function renderMetallicScrewTerminals(ctx: CanvasRenderingContext2D, c: any, d: any, cw: number, ch: number, zoom: number) {
  if (!d || !d.terminals) return;
  d.terminals.forEach((term: [string, string, string]) => {
    const termId = term[0];
    const off = getNormativeTerminalOffset(c, termId);
    if (!off) return;
    const tx = off.x * zoom;
    const ty = off.y * zoom;
    const r = 4.2 * zoom;

    ctx.save();
    ctx.fillStyle = '#020409';
    ctx.beginPath();
    ctx.arc(tx, ty, r + 1.5 * zoom, 0, Math.PI * 2);
    ctx.fill();

    const isNeutral = termId === 'N' || termId.includes('N');
    const isPE = termId === 'PE' || termId === 'G';

    ctx.fillStyle = isNeutral ? '#0284c7' : isPE ? '#16a34a' : '#94a3b8';
    ctx.beginPath();
    ctx.arc(tx, ty, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 0.9 * zoom;
    ctx.stroke();

    ctx.strokeStyle = '#090d16';
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(tx - r * 0.6, ty);
    ctx.lineTo(tx + r * 0.6, ty);
    ctx.moveTo(tx, ty - r * 0.6);
    ctx.lineTo(tx, ty + r * 0.6);
    ctx.stroke();

    ctx.fillStyle = isNeutral ? '#38bdf8' : isPE ? '#4ade80' : '#f1f5f9';
    ctx.font = `bold ${Math.max(6, 7 * zoom)}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = off.dir === 'top' ? 'bottom' : 'top';
    const labelY = off.dir === 'top' ? ty - 4 * zoom : ty + 4 * zoom;
    ctx.fillText(termId, tx, labelY);

    ctx.restore();
  });
}

export function renderFaultEffects(
  ctx: CanvasRenderingContext2D,
  cw: number,
  ch: number,
  zoom: number,
  time: number,
  st: DeviceSimulationState
) {
  ctx.save();
  if (st.thermal || st.damaged) {
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2.5 * zoom;
    ctx.shadowColor = 'rgba(239, 68, 68, 0.8)';
    ctx.shadowBlur = 10 * zoom;
    ctx.beginPath();
    ctx.roundRect(-cw / 2 - 2 * zoom, -ch / 2 - 2 * zoom, cw + 4 * zoom, ch + 4 * zoom, 6 * zoom);
    ctx.stroke();
  }
  ctx.restore();
}

// ----------------------------------------------------------------------------
// 10. MOTOR PRINCIPAL DE DESPACHO E RENDERIZAÇÃO
// ----------------------------------------------------------------------------
export function renderDevice(
  ctx: CanvasRenderingContext2D,
  options: RenderDeviceOptions
): void {
  const { component: c, camera: cam, isSelected = false, time = 0, simRunning = false } = options;
  const d = getComponentDef(c.code);
  const st: DeviceSimulationState = c.state || {};
  const zoom = cam.zoom;

  const cw = (c.w || 90) * zoom;
  const ch = (c.h || 75) * zoom;

  const isTrip = Boolean(st.tripped);
  const isClosed = Boolean((st.closed ?? true) && !isTrip);

  ctx.save();

  if (isSelected) {
    ctx.save();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5 * zoom;
    ctx.shadowColor = 'rgba(56, 189, 248, 0.7)';
    ctx.shadowBlur = 12 * zoom;
    ctx.beginPath();
    ctx.roundRect(-cw / 2 - 3 * zoom, -ch / 2 - 3 * zoom, cw + 6 * zoom, ch + 6 * zoom, 6 * zoom);
    ctx.stroke();
    ctx.restore();
  }

  // DESPACHO COM PRIORIDADE EXATA PARA EVITAR DESVIOS DE COMUTADORES
  if (
    c.code === 'THREE_WAY' ||
    c.code === 'FOUR_WAY' ||
    c.code === 'SW' ||
    c.code === 'SW2' ||
    c.code === 'SW_DOUBLE' ||
    c.code.startsWith('SW_')
  ) {
    renderCommercialRockerSwitch(ctx, c, d, st, cw, ch, zoom);
  } else if (c.code === 'MPCB' || d.kind === 'motor_breaker') {
    renderCommercialMotorBreaker(ctx, c, st, cw, ch, zoom, isClosed, isTrip);
  } else if (
    d.kind === 'breaker' ||
    d.kind === 'breaker_1p' ||
    d.kind === 'breaker2' ||
    d.kind === 'breaker3' ||
    d.kind === 'rcd' ||
    d.kind === 'rcd4' ||
    d.kind === 'rcbo' ||
    d.kind === 'mccb' ||
    c.code.startsWith('MCB') ||
    c.code.startsWith('RCD')
  ) {
    renderCommercialDinBreaker(ctx, c, d, st, cw, ch, zoom, isClosed, isTrip);
  } else if (c.code === 'CONTACTOR' || d.kind === 'contactor') {
    renderIndustrialTeSysContactor(ctx, c, d, st, cw, ch, zoom);
  } else if (c.code === 'OLR' || d.kind === 'overload') {
    renderIndustrialOverloadRelay(ctx, c, st, cw, ch, zoom);
  } else if (c.code === 'M3PH_6L' || d.kind === 'motor3_6l') {
    renderCommercialMotor6Lead(ctx, c, st, cw, ch, zoom, time, simRunning);
  } else if (d.kind.startsWith('motor') || c.code === 'M1PH' || c.code === 'M3PH' || c.code === 'MDC') {
    renderIndustrialWegMotor(ctx, c, d, st, cw, ch, zoom, time, simRunning);
  } else if (c.code === 'PV_PANEL' || d.kind === 'pv_panel') {
    renderCommercialPvPanel(ctx, c, st, cw, ch, zoom);
  } else if (c.code === 'BAT_LIFEPO4' || d.kind === 'battery') {
    renderCommercialLiFePO4(ctx, c, st, cw, ch, zoom);
  } else if (c.code === 'PV_INVERTER_ONGRID' || d.kind === 'pv_inverter_ongrid') {
    renderCommercialOnGridInverter(ctx, c, st, cw, ch, zoom, simRunning);
  } else if (c.code === 'PV_INVERTER_OFFGRID' || d.kind === 'pv_inverter_offgrid') {
    renderCommercialOffGridInverter(ctx, c, st, cw, ch, zoom, simRunning);
  } else if (c.code === 'PV_INVERTER_HYBRID' || d.kind === 'pv_inverter_hybrid') {
    renderCommercialHybridInverter(ctx, c, st, cw, ch, zoom, simRunning);
  } else if (c.code === 'GEN_DIESEL' || d.kind === 'generator_diesel') {
    renderCommercialGenerator(ctx, c, st, cw, ch, zoom, time, simRunning);
  } else if (c.code === 'ATS_SWITCH' || d.kind === 'ats_switch') {
    renderCommercialAts(ctx, c, st, cw, ch, zoom);
  } else if (c.code === 'MTS_SWITCH' || d.kind === 'mts_switch') {
    renderCommercialMts(ctx, c, st, cw, ch, zoom);
  } else if (c.code === 'SMART_METER' || d.kind === 'smart_meter') {
    renderCommercialSmartMeter(ctx, c, st, cw, ch, zoom);
  } else if (c.code === 'SEL' || (d.kind === 'selector' && c.code !== 'THREE_WAY' && c.code !== 'FOUR_WAY')) {
    renderCommercialRotarySelector(ctx, c, st, cw, ch, zoom);
  } else if (c.code === 'PBNO' || c.code === 'PBNC') {
    renderCommercialHarmonyPushButton(ctx, c, st, cw, ch, zoom);
  } else if (c.code === 'LAMP' || d.kind === 'lamp') {
    renderCommercialCeilingLamp(ctx, c, st, cw, ch, zoom);
  } else if (c.code.startsWith('PILOT') || d.kind === 'pilot') {
    renderCommercialPanelPilot(ctx, c, st, cw, ch, zoom);
  } else if (c.code === 'OUTLET' || d.kind === 'outlet') {
    renderCommercialOutlet(ctx, c, st, cw, ch, zoom);
  } else if (c.code === 'HEATER' || d.kind === 'heater') {
    renderCommercialIndustrialHeater(ctx, c, st, cw, ch, zoom);
  } else if (c.code.startsWith('SRC_') || d.kind === 'source') {
    renderCommercialPowerSource(ctx, c, st, cw, ch, zoom);
  } else {
    renderCommercialGenericBox(ctx, c, d, st, cw, ch, zoom);
  }

  renderMetallicScrewTerminals(ctx, c, d, cw, ch, zoom);

  if (st.thermal || st.damaged || st.sparking || st.fault) {
    renderFaultEffects(ctx, cw, ch, zoom, time, st);
  }

  ctx.restore();
}