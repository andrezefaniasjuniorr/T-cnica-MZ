// ============================================================================
// TÉCNICAMZ PRO — MOTOR DE RENDERIZAÇÃO REALISTA DE DISPOSITIVOS CAD ELÉTRICOS (V25)
// Design Industrial Ultra-Realista Completo (Zero Erros / Todas Exportações Restauradas)
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
// 1. SUB-RENDERIZADORES VISUAIS DECLARADOS PRIMEIRO
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

  // Visor ótico mecânico
  const flagW = Math.min(cw * 0.5, 20 * zoom);
  const flagH = 4.5 * zoom;
  const flagY = -ch * 0.28;
  ctx.fillStyle = isTrip ? '#f59e0b' : isClosed ? '#dc2626' : '#16a34a';
  ctx.fillRect(-flagW / 2, flagY, flagW, flagH);
  ctx.strokeStyle = '#020617';
  ctx.lineWidth = 0.8 * zoom;
  ctx.strokeRect(-flagW / 2, flagY, flagW, flagH);

  // Alavanca basculante
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

  const inA = c.params?.current || 16;
  const curve = c.params?.curve || 'C';
  ctx.fillStyle = '#cbd5e1';
  ctx.font = `bold ${Math.max(6, 7 * zoom)}px sans-serif`;
  ctx.fillText(`${curve}${inA} • 6kA`, 0, ch / 2 - 8 * zoom);
}

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
  ctx.fillText('10-16A', dialX, dialY + dialR + 5 * zoom);

  ctx.fillStyle = '#cbd5e1';
  ctx.font = `bold ${Math.max(6.5, 7.5 * zoom)}px sans-serif`;
  ctx.fillText('MPCB • 3P 690V', 0, ch / 2 - 9 * zoom);
}

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
  const plGrad = ctx.createLinearGradient(0, auxY - pH / 2, 0, auxY + pH / 2);
  if (isEnergized) {
    plGrad.addColorStop(0, '#047857');
    plGrad.addColorStop(0.5, '#10b981');
    plGrad.addColorStop(1, '#064e3b');
  } else {
    plGrad.addColorStop(0, '#64748b');
    plGrad.addColorStop(0.5, '#334155');
    plGrad.addColorStop(1, '#1e293b');
  }

  ctx.fillStyle = plGrad;
  ctx.beginPath();
  ctx.roundRect(-pW / 2 + 1.5 * zoom, auxY - pH / 2 + plunge, pW - 3 * zoom, pH - plunge, 2 * zoom);
  ctx.fill();

  ctx.fillStyle = isEnergized ? '#a7f3d0' : '#f1f5f9';
  ctx.font = `bold ${Math.max(6.5, 7.5 * zoom)}px monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(isEnergized ? '▲ ATRACADO' : '▼ REPOUSO', 0, auxY + plunge / 2);

  ctx.fillStyle = '#94a3b8';
  ctx.font = `bold ${Math.max(5.5, 6.5 * zoom)}px sans-serif`;
  ctx.fillText('TeSys LC1D25 • AC-3 25A', 0, ch / 2 - 9 * zoom);
}

export function renderIndustrialOverloadRelay(
  ctx: CanvasRenderingContext2D,
  c: any,
  st: DeviceSimulationState,
  cw: number,
  ch: number,
  zoom: number
) {
  const isTrip = Boolean(st.tripped);

  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.roundRect(-cw / 2, -ch / 2, cw, ch, 4 * zoom);
  ctx.fill();
  ctx.strokeStyle = isTrip ? '#ef4444' : '#475569';
  ctx.lineWidth = 1.4 * zoom;
  ctx.stroke();

  // Pinos de cobre rígidos para encaixe no contator
  [-cw * 0.28, 0, cw * 0.28].forEach(px => {
    ctx.fillStyle = '#b45309';
    ctx.fillRect(px - 2.5 * zoom, -ch / 2 - 4 * zoom, 5 * zoom, 5 * zoom);
  });

  // Dial bimetálico graduado de corrente
  const dialX = -cw * 0.22;
  const dialY = -2 * zoom;
  const dialR = 12 * zoom;

  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.arc(dialX, dialY, dialR, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#b45309';
  ctx.lineWidth = 1 * zoom;
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
  ctx.fillText('10-16A', dialX, dialY + dialR + 5 * zoom);

  // Botão de RESET
  const rstX = cw * 0.22;
  const rstY = -dialR * 0.55;
  const rstR = 7 * zoom;

  ctx.fillStyle = isTrip ? '#ef4444' : '#0284c7';
  ctx.beginPath();
  ctx.arc(rstX, rstY, rstR, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1 * zoom;
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${Math.max(5, 6 * zoom)}px sans-serif`;
  ctx.textBaseline = 'middle';
  ctx.fillText(isTrip ? 'TRIP' : 'RESET', rstX, rstY);

  // Botão de STOP
  const stopX = cw * 0.22;
  const stopY = dialR * 0.65;
  const stopR = 6 * zoom;

  ctx.fillStyle = '#dc2626';
  ctx.beginPath();
  ctx.arc(stopX, stopY, stopR, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#7f1d1d';
  ctx.lineWidth = 1 * zoom;
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${Math.max(5, 6 * zoom)}px sans-serif`;
  ctx.fillText('STOP', stopX, stopY);

  ctx.fillStyle = isTrip ? '#ef4444' : '#22c55e';
  ctx.beginPath();
  ctx.arc(0, -ch * 0.28, 2.5 * zoom, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#cbd5e1';
  ctx.font = `bold ${Math.max(5.5, 6.5 * zoom)}px sans-serif`;
  ctx.fillText('95-96 NF • 97-98 NA', 0, ch / 2 - 9 * zoom);
}

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
  const r = Math.min(cw, ch) * 0.38;

  const isCCW = st.rotationDir === 'CCW';
  const dirMultiplier = isCCW ? -1 : 1;
  const rotAngle = isRunning ? (dirMultiplier * time * (rpm / 60) * Math.PI * 2) : 0;

  const tBoxW = cw * 0.48;
  const tBoxH = 13 * zoom;
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(-tBoxW / 2, -r - tBoxH + 2 * zoom, tBoxW, tBoxH);
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 1 * zoom;
  ctx.strokeRect(-tBoxW / 2, -r - tBoxH + 2 * zoom, tBoxW, tBoxH);

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

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.lineWidth = 1.2 * zoom;
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 6) {
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * (r * 0.55), Math.sin(a) * (r * 0.55));
    ctx.lineTo(Math.cos(a) * (r * 0.96), Math.sin(a) * (r * 0.96));
    ctx.stroke();
  }

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

  ctx.fillStyle = isRunning ? (isCCW ? '#f59e0b' : '#34d399') : '#94a3b8';
  ctx.font = `bold ${Math.max(6.5, 7.5 * zoom)}px monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  if (isRunning) {
    ctx.fillText(`${Math.round(rpm)} RPM • ${isCCW ? '↺ ANTI-HORÁRIO' : '↻ HORÁRIO'}`, 0, ch / 2 - 10 * zoom);
  } else {
    ctx.fillText('0 RPM • PARADO', 0, ch / 2 - 10 * zoom);
  }
}

export function renderIndustrialHarmonyPushButton(
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

  const bGrad = ctx.createLinearGradient(-rBezel, btnCenterY - rBezel, rBezel, btnCenterY + rBezel);
  bGrad.addColorStop(0, '#ffffff');
  bGrad.addColorStop(0.2, '#cbd5e1');
  bGrad.addColorStop(0.5, '#64748b');
  bGrad.addColorStop(0.85, '#94a3b8');
  bGrad.addColorStop(1, '#334155');
  ctx.fillStyle = bGrad;
  ctx.beginPath();
  ctx.arc(0, btnCenterY, rBezel, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1.2 * zoom;
  ctx.stroke();

  ctx.fillStyle = '#090d16';
  ctx.beginPath();
  ctx.arc(0, btnCenterY, rBezel * 0.84, 0, Math.PI * 2);
  ctx.fill();

  const travel = isPressed ? 3 * zoom : 0;
  const rCap = rBezel * 0.76 - (isPressed ? 1 * zoom : 0);

  const capGrad = ctx.createRadialGradient(-rCap * 0.35, btnCenterY - rCap * 0.35 + travel, 1, 0, btnCenterY + travel, rCap);
  if (isNO) {
    capGrad.addColorStop(0, '#86efac');
    capGrad.addColorStop(0.35, '#22c55e');
    capGrad.addColorStop(0.75, '#16a34a');
    capGrad.addColorStop(1, '#14532d');
  } else {
    capGrad.addColorStop(0, '#fca5a5');
    capGrad.addColorStop(0.35, '#ef4444');
    capGrad.addColorStop(0.75, '#dc2626');
    capGrad.addColorStop(1, '#7f1d1d');
  }

  ctx.fillStyle = capGrad;
  ctx.beginPath();
  ctx.arc(0, btnCenterY + travel, rCap, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = isPressed ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.4)';
  ctx.lineWidth = 1 * zoom;
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${Math.max(9, 11 * zoom)}px sans-serif`;
  ctx.fillText(isNO ? 'I' : 'O', 0, btnCenterY + travel);
}

export function renderCommercialCeilingLamp(ctx: CanvasRenderingContext2D, c: any, st: any, cw: number, ch: number, zoom: number) {
  const isLit = Boolean(st.energized && !st.tripped);
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
  ctx.fillText(isLit ? '60W • ACESA' : '60W 230V', 0, ch / 2 - 6 * zoom);
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

export function renderCommercialOffGridInverter(ctx: CanvasRenderingContext2D, c: any, st: any, cw: number, ch: number, zoom: number, simRunning: boolean) {
  const isOperating = Boolean(simRunning && st.running);
  ctx.fillStyle = '#e2e8f0';
  ctx.beginPath();
  ctx.roundRect(-cw / 2, -ch / 2, cw, ch, 6 * zoom);
  ctx.fill();
  ctx.strokeStyle = isOperating ? '#10b981' : '#64748b';
  ctx.lineWidth = 1.8 * zoom;
  ctx.stroke();

  const dW = cw * 0.74;
  const dH = 34 * zoom;
  const dY = -2 * zoom;
  ctx.fillStyle = '#020617';
  ctx.fillRect(-dW / 2, dY - dH / 2, dW, dH);

  ctx.fillStyle = isOperating ? '#22c55e' : '#ef4444';
  ctx.font = `bold ${Math.max(7.5, 9 * zoom)}px 'Courier New', monospace`;
  ctx.textAlign = 'center';
  ctx.fillText(isOperating ? '230V CA • 5kW ATIVO' : 'STANDBY (SEM DC)', 0, dY - 4 * zoom);

  ctx.fillStyle = '#38bdf8';
  ctx.font = `bold ${Math.max(5.5, 6.5 * zoom)}px monospace`;
  ctx.fillText(`BAT: ${st.batVoltage || 0}V | PV: ${st.pvVoltage || 0}V`, 0, dY + 6 * zoom);
}

export function renderCommercialOnGridInverter(ctx: CanvasRenderingContext2D, c: any, st: any, cw: number, ch: number, zoom: number, simRunning: boolean) {
  const isOperating = Boolean(simRunning && st.running);
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
  ctx.fillText(isOperating ? `${(st.powerKW || 0).toFixed(2)} kW INJETANDO` : 'MPPT STANDBY', 0, -6 * zoom);
}

export function renderCommercialHybridInverter(ctx: CanvasRenderingContext2D, c: any, st: any, cw: number, ch: number, zoom: number, simRunning: boolean) {
  const isOperating = Boolean(simRunning && st.running);
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
  ctx.fillText(isOperating ? '230V EPS • HÍBRIDO' : 'STANDBY HÍBRIDO', 0, -4 * zoom);
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

export function renderCommercialPvPanel(ctx: CanvasRenderingContext2D, c: any, st: any, cw: number, ch: number, zoom: number) {
  const isSunny = (c.params?.irradiance ?? 1000) > 0;
  ctx.fillStyle = '#020617';
  ctx.beginPath();
  ctx.roundRect(-cw / 2, -ch / 2, cw, ch, 4 * zoom);
  ctx.fill();
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 2 * zoom;
  ctx.stroke();

  const glassGrad = ctx.createLinearGradient(-cw / 2, -ch / 2, cw / 2, ch / 2);
  glassGrad.addColorStop(0, isSunny ? '#0c4a6e' : '#0f172a');
  glassGrad.addColorStop(0.5, isSunny ? '#082f49' : '#020617');
  glassGrad.addColorStop(1, '#020617');
  ctx.fillStyle = glassGrad;
  ctx.fillRect(-cw / 2 + 3 * zoom, -ch / 2 + 3 * zoom, cw - 6 * zoom, ch - 6 * zoom);

  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.roundRect(-30 * zoom, -12 * zoom, 60 * zoom, 24 * zoom, 3 * zoom);
  ctx.fill();

  ctx.fillStyle = isSunny ? '#facc15' : '#94a3b8';
  ctx.font = `bold ${Math.max(6.5, 7.5 * zoom)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText(`${st.voltage || 41.8}V • 550W`, 0, -2 * zoom);
}

export function renderCommercialLiFePO4(ctx: CanvasRenderingContext2D, c: any, st: any, cw: number, ch: number, zoom: number) {
  ctx.fillStyle = '#090d16';
  ctx.beginPath();
  ctx.roundRect(-cw / 2, -ch / 2, cw, ch, 4 * zoom);
  ctx.fill();
  ctx.strokeStyle = '#334155';
  ctx.stroke();

  const dX = -cw * 0.12;
  ctx.fillStyle = '#020617';
  ctx.fillRect(dX - 24 * zoom, -14 * zoom, 48 * zoom, 28 * zoom);

  ctx.fillStyle = '#38bdf8';
  ctx.font = `bold ${Math.max(7, 9 * zoom)}px 'Courier New', monospace`;
  ctx.textAlign = 'center';
  ctx.fillText(`${c.params?.socPercent ?? 95}% SOC`, dX, -3 * zoom);
  ctx.fillStyle = '#22c55e';
  ctx.font = `bold ${Math.max(5.5, 6.5 * zoom)}px monospace`;
  ctx.fillText(`51.2V • BMS OK`, dX, 6 * zoom);
}

export function renderCommercialGenerator(ctx: CanvasRenderingContext2D, c: any, st: any, cw: number, ch: number, zoom: number, time: number, simRunning: boolean) {
  const isRunning = Boolean(simRunning && (st.running || c.params?.running));
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
  ctx.fillText(isRunning ? '400V 50Hz' : 'GMG OFF', dX, -4 * zoom);
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

export function renderCommercialMotor6Lead(ctx: CanvasRenderingContext2D, c: any, st: any, cw: number, ch: number, zoom: number, time: number, simRunning: boolean) {
  renderIndustrialWegMotor(ctx, c, null, st, cw, ch, zoom, time, simRunning);
}

export function renderCommercialPhotocell(ctx: CanvasRenderingContext2D, c: any, st: any, cw: number, ch: number, zoom: number) {
  const isDark = (c.params?.ambientLux ?? 100) <= 20;
  ctx.fillStyle = isDark ? '#1e3a8a' : '#38bdf8';
  ctx.beginPath();
  ctx.arc(0, -2 * zoom, Math.min(cw, ch) * 0.36, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = isDark ? '#34d399' : '#0f172a';
  ctx.font = `bold ${Math.max(6, 7 * zoom)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText(isDark ? 'NOITE' : 'DIA', 0, ch / 2 - 8 * zoom);
}

export function renderCommercialPirSensor(ctx: CanvasRenderingContext2D, c: any, st: any, cw: number, ch: number, zoom: number) {
  ctx.fillStyle = '#f8fafc';
  ctx.beginPath();
  ctx.arc(0, -2 * zoom, Math.min(cw, ch) * 0.36, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = c.params?.presenceDetected ? '#ef4444' : '#22c55e';
  ctx.beginPath();
  ctx.arc(0, -2 * zoom, 3 * zoom, 0, Math.PI * 2);
  ctx.fill();
}

export function renderCommercialStarDeltaTimer(ctx: CanvasRenderingContext2D, c: any, st: any, cw: number, ch: number, zoom: number) {
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.roundRect(-cw / 2, -ch / 2, cw, ch, 4 * zoom);
  ctx.fill();
  const phase = c.params?.phase || 'star';
  ctx.fillStyle = phase === 'star' ? '#facc15' : '#22c55e';
  ctx.font = `bold ${Math.max(6.5, 7.5 * zoom)}px monospace`;
  ctx.textAlign = 'center';
  ctx.fillText(`Y-Δ • ${phase.toUpperCase()}`, 0, 0);
}

export function renderCommercialDigitalTimer(ctx: CanvasRenderingContext2D, c: any, st: any, cw: number, ch: number, zoom: number) {
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.roundRect(-cw / 2, -ch / 2, cw, ch, 4 * zoom);
  ctx.fill();
  ctx.fillStyle = '#020617';
  ctx.fillRect(-cw * 0.35, -ch * 0.25, cw * 0.7, ch * 0.4);
  ctx.fillStyle = '#38bdf8';
  ctx.font = `bold ${Math.max(7, 8.5 * zoom)}px 'Courier New', monospace`;
  ctx.textAlign = 'center';
  ctx.fillText('18:30 AUTO', 0, -ch * 0.05);
}

export function renderCommercialDigitalThermostat(ctx: CanvasRenderingContext2D, c: any, st: any, cw: number, ch: number, zoom: number) {
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.roundRect(-cw / 2, -ch / 2, cw, ch, 4 * zoom);
  ctx.fill();
  ctx.fillStyle = '#ef4444';
  ctx.font = `bold ${Math.max(8, 10 * zoom)}px monospace`;
  ctx.textAlign = 'center';
  ctx.fillText(`${c.params?.currentTemp || 25.0}°C`, 0, 0);
}

export function renderCommercialAuxBlock(ctx: CanvasRenderingContext2D, c: any, st: any, cw: number, ch: number, zoom: number) {
  ctx.fillStyle = '#334155';
  ctx.beginPath();
  ctx.roundRect(-cw / 2, -ch / 2, cw, ch, 3 * zoom);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${Math.max(6, 7 * zoom)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('BLOCO 2NA + 2NF', 0, 0);
}

export function renderCommercialGroundRod(ctx: CanvasRenderingContext2D, c: any, st: any, cw: number, ch: number, zoom: number) {
  ctx.fillStyle = '#b45309';
  ctx.fillRect(-4 * zoom, -ch / 2, 8 * zoom, ch);
}

export function renderCommercialBepPit(ctx: CanvasRenderingContext2D, c: any, st: any, cw: number, ch: number, zoom: number) {
  ctx.fillStyle = '#334155';
  ctx.beginPath();
  ctx.roundRect(-cw / 2, -ch / 2, cw, ch, 5 * zoom);
  ctx.fill();
  ctx.fillStyle = '#b45309';
  ctx.fillRect(-cw * 0.38, -6 * zoom, cw * 0.76, 12 * zoom);
}

export function renderCommercialWagoBox(ctx: CanvasRenderingContext2D, c: any, st: any, cw: number, ch: number, zoom: number) {
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.roundRect(-cw / 2, -ch / 2, cw, ch, 5 * zoom);
  ctx.fill();
}

export function renderCommercialPowerSource(ctx: CanvasRenderingContext2D, c: any, st: any, cw: number, ch: number, zoom: number) {
  const is3P = c.code === 'SRC_AC3';
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
  ctx.fillText(is3P ? '400.0 V' : '230.0 V', 0, -ch * 0.08);
}

export function renderCommercialAuxRelay(ctx: CanvasRenderingContext2D, c: any, d: any, st: any, cw: number, ch: number, zoom: number) {
  ctx.fillStyle = '#090d16';
  ctx.beginPath();
  ctx.roundRect(-cw / 2, -ch / 2, cw, ch, 4 * zoom);
  ctx.fill();
}

export function renderCommercialExhaustFan(ctx: CanvasRenderingContext2D, c: any, st: any, cw: number, ch: number, zoom: number, time: number, simRunning: boolean) {
  const isRunning = Boolean(simRunning && st.running);
  const r = Math.min(cw, ch) * 0.4;
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.rotate(isRunning ? time * 18 : 0);
  ctx.fillStyle = isRunning ? '#38bdf8' : '#64748b';
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.ellipse(0, r * 0.4, 6 * zoom, r * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.rotate(Math.PI / 2);
  }
  ctx.restore();
}

export function renderCommercialWaterPump(ctx: CanvasRenderingContext2D, c: any, st: any, cw: number, ch: number, zoom: number, time: number, simRunning: boolean) {
  const isRunning = Boolean(simRunning && st.running);
  ctx.fillStyle = isRunning ? '#0284c7' : '#1e293b';
  ctx.beginPath();
  ctx.roundRect(-cw * 0.4, -ch * 0.35, cw * 0.55, ch * 0.7, 6 * zoom);
  ctx.fill();
  ctx.strokeStyle = isRunning ? '#38bdf8' : '#475569';
  ctx.stroke();
}

export function renderCommercialIndustrialHeater(ctx: CanvasRenderingContext2D, c: any, st: any, cw: number, ch: number, zoom: number) {
  const isHeat = Boolean(st.energized);
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.roundRect(-cw / 2, -ch / 2, cw, ch, 4 * zoom);
  ctx.fill();
  ctx.strokeStyle = isHeat ? '#f97316' : '#64748b';
  ctx.lineWidth = 2.5 * zoom;
  ctx.stroke();
}

export function renderCommercialFuse(ctx: CanvasRenderingContext2D, c: any, d: any, st: any, cw: number, ch: number, zoom: number) {
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.roundRect(-cw / 2, -ch / 2, cw, ch, 3 * zoom);
  ctx.fill();
}

export function renderCommercialSpd(ctx: CanvasRenderingContext2D, c: any, d: any, st: any, cw: number, ch: number, zoom: number) {
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.roundRect(-cw / 2, -ch / 2, cw, ch, 4 * zoom);
  ctx.fill();
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

export function renderCommercialFloatSwitch(ctx: CanvasRenderingContext2D, c: any, st: any, cw: number, ch: number, zoom: number) {
  const isHigh = Boolean(st.closed || st.high);
  ctx.fillStyle = '#ea580c';
  ctx.beginPath();
  ctx.ellipse(0, 0, 14 * zoom, 22 * zoom, isHigh ? 0.75 : -0.75, 0, Math.PI * 2);
  ctx.fill();
}

export function renderCommercialEmergencyStop(ctx: CanvasRenderingContext2D, c: any, st: any, cw: number, ch: number, zoom: number) {
  const rPlate = Math.min(cw, ch) * 0.46;
  ctx.fillStyle = '#facc15';
  ctx.beginPath();
  ctx.arc(0, 0, rPlate, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#dc2626';
  ctx.beginPath();
  ctx.arc(0, 0, rPlate * 0.65, 0, Math.PI * 2);
  ctx.fill();
}

export function renderCommercialLimitSwitch(ctx: CanvasRenderingContext2D, c: any, st: any, cw: number, ch: number, zoom: number) {
  ctx.fillStyle = '#334155';
  ctx.beginPath();
  ctx.roundRect(-cw * 0.35, -ch * 0.25, cw * 0.7, ch * 0.6, 4 * zoom);
  ctx.fill();
}

export function renderCommercialPushButton(ctx: CanvasRenderingContext2D, c: any, st: any, cw: number, ch: number, zoom: number) {
  renderIndustrialHarmonyPushButton(ctx, c, st, cw, ch, zoom);
}

export function renderCommercialDimmer(ctx: CanvasRenderingContext2D, c: any, st: any, cw: number, ch: number, zoom: number) {
  const pct = Number(c.params?.percent ?? 100);
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.roundRect(-cw / 2, -ch / 2, cw, ch, 6 * zoom);
  ctx.fill();
  ctx.fillStyle = '#38bdf8';
  ctx.font = `bold ${Math.max(7, 8 * zoom)}px monospace`;
  ctx.textAlign = 'center';
  ctx.fillText(`${pct}%`, 0, 0);
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

// ----------------------------------------------------------------------------
// 2. INTERRUPTORES RESIDENCIAIS / COMERCIAIS REALISTAS (1P, 2P, DUPLO, 3-WAY, 4-WAY)
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
  // Placa de espelho termoplástico acetinado (Padrão 4x2 / Módulo DIN)
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
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
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

  // Roteamento conforme o tipo de interruptor
  if (c.code === 'SW_DOUBLE') {
    // ------------------------------------------------------------------------
    // INTERRUPTOR DUPLO: 2 TECLAS BASCULANTES INDEPENDENTES (LADO A LADO)
    // ------------------------------------------------------------------------
    const keyGap = 3 * zoom;
    const keyW = (recW - keyGap - 4 * zoom) / 2;
    const keyH = recH - 4 * zoom;

    const k1 = Boolean(st.closed1 ?? st.closed);
    const k2 = Boolean(st.closed2);

    const drawSingleRocker = (
      centerX: number,
      isClosed: boolean,
      keyLabel: string,
      retLabel: string
    ) => {
      ctx.save();
      ctx.translate(centerX, 0);

      // Sombra e gradiente da tecla basculante
      const kGrad = ctx.createLinearGradient(0, -keyH / 2, 0, keyH / 2);
      if (isClosed) {
        // Pressionada para baixo (ON)
        kGrad.addColorStop(0, '#1e293b');
        kGrad.addColorStop(0.3, '#334155');
        kGrad.addColorStop(0.8, '#475569');
        kGrad.addColorStop(1, '#64748b');
      } else {
        // Levantada / Repouso (OFF)
        kGrad.addColorStop(0, '#f8fafc');
        kGrad.addColorStop(0.2, '#f1f5f9');
        kGrad.addColorStop(0.7, '#e2e8f0');
        kGrad.addColorStop(1, '#cbd5e1');
      }

      ctx.fillStyle = kGrad;
      ctx.beginPath();
      ctx.roundRect(-keyW / 2, -keyH / 2, keyW, keyH, 2.5 * zoom);
      ctx.fill();
      ctx.strokeStyle = isClosed ? '#0f172a' : '#94a3b8';
      ctx.lineWidth = 0.9 * zoom;
      ctx.stroke();

      // Friso tátil de inclinação no meio da tecla
      const bevelY = isClosed ? 2 * zoom : -2 * zoom;
      ctx.strokeStyle = isClosed ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.7)';
      ctx.lineWidth = 1 * zoom;
      ctx.beginPath();
      ctx.moveTo(-keyW / 2 + 3 * zoom, bevelY);
      ctx.lineTo(keyW / 2 - 3 * zoom, bevelY);
      ctx.stroke();

      // Indicador luminoso LED / gravação
      const ledY = isClosed ? keyH * 0.28 : -keyH * 0.28;
      ctx.fillStyle = isClosed ? '#10b981' : '#64748b';
      if (isClosed) {
        ctx.shadowColor = '#34d399';
        ctx.shadowBlur = 6 * zoom;
      }
      ctx.beginPath();
      ctx.arc(0, ledY, 2.2 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Textos gravados a laser
      ctx.fillStyle = isClosed ? '#f8fafc' : '#334155';
      ctx.font = `bold ${Math.max(6, 7 * zoom)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(keyLabel, 0, isClosed ? -keyH * 0.22 : keyH * 0.22);

      ctx.font = `bold ${Math.max(5, 6 * zoom)}px monospace`;
      ctx.fillStyle = isClosed ? '#38bdf8' : '#64748b';
      ctx.fillText(retLabel, 0, 0);

      ctx.restore();
    };

    // Tecla 1 (Esquerda -> R1)
    drawSingleRocker(-keyW / 2 - keyGap / 2, k1, k1 ? 'ON' : 'OFF', 'R1');
    // Tecla 2 (Direita -> R2)
    drawSingleRocker(keyW / 2 + keyGap / 2, k2, k2 ? 'ON' : 'OFF', 'R2');

  } else if (c.code === 'THREE_WAY') {
    // ------------------------------------------------------------------------
    // COMUTADOR PARALELO 3-WAY (ESCADA)
    // ------------------------------------------------------------------------
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

    // Rota comutada
    ctx.fillStyle = isR2 ? '#38bdf8' : '#0284c7';
    ctx.font = `bold ${Math.max(7, 8.5 * zoom)}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(isR2 ? 'ROTA: R2' : 'ROTA: R1', 0, -4 * zoom);

    ctx.fillStyle = isR2 ? '#f1f5f9' : '#334155';
    ctx.font = `bold ${Math.max(6, 7 * zoom)}px sans-serif`;
    ctx.fillText('3-WAY (PARALELO)', 0, 8 * zoom);

  } else if (c.code === 'FOUR_WAY') {
    // ------------------------------------------------------------------------
    // COMUTADOR INTERMEDIÁRIO 4-WAY (CRUZAMENTO)
    // ------------------------------------------------------------------------
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
    ctx.font = `bold ${Math.max(7, 9 * zoom)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(isCrossed ? '⤮ CRUZADO' : '⇹ DIRETO', 0, -4 * zoom);

    ctx.fillStyle = isCrossed ? '#f1f5f9' : '#334155';
    ctx.font = `bold ${Math.max(6, 7 * zoom)}px sans-serif`;
    ctx.fillText('4-WAY INTERMEDIÁRIO', 0, 8 * zoom);

  } else {
    // ------------------------------------------------------------------------
    // INTERRUPTOR SIMPLES (SW) OU BIPOLAR (SW2): TECLA ÚNICA LARGA
    // ------------------------------------------------------------------------
    const keyW = recW - 4 * zoom;
    const keyH = recH - 4 * zoom;
    const isClosed = Boolean(st.closed);

    const kGrad = ctx.createLinearGradient(0, -keyH / 2, 0, keyH / 2);
    if (isClosed) {
      kGrad.addColorStop(0, '#1e293b');
      kGrad.addColorStop(0.2, '#334155');
      kGrad.addColorStop(0.8, '#475569');
      kGrad.addColorStop(1, '#64748b');
    } else {
      kGrad.addColorStop(0, '#ffffff');
      kGrad.addColorStop(0.15, '#f8fafc');
      kGrad.addColorStop(0.75, '#e2e8f0');
      kGrad.addColorStop(1, '#cbd5e1');
    }

    ctx.fillStyle = kGrad;
    ctx.beginPath();
    ctx.roundRect(-keyW / 2, -keyH / 2, keyW, keyH, 3 * zoom);
    ctx.fill();
    ctx.strokeStyle = isClosed ? '#0f172a' : '#94a3b8';
    ctx.lineWidth = 1 * zoom;
    ctx.stroke();

    // Relevo da tecla basculante
    const bevelY = isClosed ? 3 * zoom : -3 * zoom;
    ctx.strokeStyle = isClosed ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.7)';
    ctx.lineWidth = 1.2 * zoom;
    ctx.beginPath();
    ctx.moveTo(-keyW / 2 + 4 * zoom, bevelY);
    ctx.lineTo(keyW / 2 - 4 * zoom, bevelY);
    ctx.stroke();

    // LED de Status
    const ledY = isClosed ? keyH * 0.28 : -keyH * 0.28;
    ctx.fillStyle = isClosed ? '#10b981' : '#64748b';
    if (isClosed) {
      ctx.shadowColor = '#34d399';
      ctx.shadowBlur = 6 * zoom;
    }
    ctx.beginPath();
    ctx.arc(0, ledY, 2.5 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Rótulos gravados
    ctx.fillStyle = isClosed ? '#f8fafc' : '#334155';
    ctx.font = `bold ${Math.max(7, 8.5 * zoom)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(isClosed ? 'LIGADO (I)' : 'DESLIGADO (O)', 0, isClosed ? -keyH * 0.22 : keyH * 0.22);

    ctx.font = `bold ${Math.max(5.5, 6.5 * zoom)}px monospace`;
    ctx.fillStyle = isClosed ? '#38bdf8' : '#64748b';
    ctx.fillText(c.code === 'SW2' ? 'BIPOLAR 2P 10A' : 'UNIPOLAR 1P 10A', 0, 0);
  }

  // Rótulo inferior da norma
  ctx.fillStyle = '#64748b';
  ctx.font = `bold ${Math.max(5, 6 * zoom)}px monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillText('IEC 60669 • 250V~', 0, plateH / 2 - 2 * zoom);
}

// ----------------------------------------------------------------------------
// 3. TOMADA REALISTA 2P+T (NBR 14136 / SCHUKO / IEC 60884)
// ----------------------------------------------------------------------------

export function renderCommercialOutlet(
  ctx: CanvasRenderingContext2D,
  c: any,
  st: DeviceSimulationState,
  cw: number,
  ch: number,
  zoom: number
) {
  // Espelho de acabamento
  const plateW = cw;
  const plateH = ch;
  const plateGrad = ctx.createLinearGradient(0, -plateH / 2, 0, plateH / 2);
  plateGrad.addColorStop(0, '#f8fafc');
  plateGrad.addColorStop(0.1, '#e2e8f0');
  plateGrad.addColorStop(0.9, '#cbd5e1');
  plateGrad.addColorStop(1, '#94a3b8');

  ctx.fillStyle = plateGrad;
  ctx.beginPath();
  ctx.roundRect(-plateW / 2, -plateH / 2, plateW, plateH, 6 * zoom);
  ctx.fill();
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 1 * zoom;
  ctx.stroke();

  // Cavidade rebaixada hexagonal / circular
  const cavityR = Math.min(plateW, plateH) * 0.34;
  const cavGrad = ctx.createRadialGradient(0, 0, 1, 0, 0, cavityR);
  cavGrad.addColorStop(0, '#0f172a');
  cavGrad.addColorStop(0.7, '#1e293b');
  cavGrad.addColorStop(1, '#020617');

  ctx.fillStyle = cavGrad;
  ctx.beginPath();
  ctx.arc(0, 0, cavityR, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1.2 * zoom;
  ctx.stroke();

  // 3 Orifícios padrão 2P+T (Fase, Terra, Neutro)
  const holeR = 2.4 * zoom;
  const offsetPin = cavityR * 0.52;

  // Terra no centro
  ctx.fillStyle = '#020617';
  ctx.beginPath();
  ctx.arc(0, 0, holeR * 1.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 0.8 * zoom;
  ctx.stroke();

  // Fase (Esquerda) e Neutro (Direita)
  [-offsetPin, offsetPin].forEach((px, idx) => {
    ctx.fillStyle = '#020617';
    ctx.beginPath();
    ctx.arc(px, 0, holeR, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = idx === 0 ? '#ef4444' : '#0284c7';
    ctx.lineWidth = 0.8 * zoom;
    ctx.stroke();
  });

  // Indicador de Energização
  const isLive = Boolean(st.energized);
  ctx.fillStyle = isLive ? '#10b981' : '#64748b';
  if (isLive) {
    ctx.shadowColor = '#34d399';
    ctx.shadowBlur = 6 * zoom;
  }
  ctx.beginPath();
  ctx.arc(0, -cavityR - 5 * zoom, 2 * zoom, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Rótulos de especificação
  ctx.fillStyle = isLive ? '#15803d' : '#475569';
  ctx.font = `bold ${Math.max(5.5, 6.5 * zoom)}px monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillText('2P+T • 16A 250V~', 0, plateH / 2 - 3 * zoom);
}

// ----------------------------------------------------------------------------
// 4. EFEITOS DINÂMICOS DE FALHA (ARCO ELÉTRICO ⚡ E FUMAÇA 💨)
// ----------------------------------------------------------------------------

export function renderFaultEffects(
  ctx: CanvasRenderingContext2D,
  cw: number,
  ch: number,
  zoom: number,
  time: number,
  st: DeviceSimulationState
) {
  ctx.save();

  // Fumaça subindo (💨)
  if (st.thermal || st.damaged) {
    const smokeY = -ch / 2 - ((time * 0.04) % (35 * zoom));
    ctx.fillStyle = 'rgba(148, 163, 184, 0.4)';
    ctx.beginPath();
    ctx.arc(0, smokeY, 7 * zoom, 0, Math.PI * 2);
    ctx.arc(5 * zoom, smokeY - 5 * zoom, 10 * zoom, 0, Math.PI * 2);
    ctx.fill();

    // Contorno vermelho de superaquecimento térmico
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2.5 * zoom;
    ctx.shadowColor = 'rgba(239, 68, 68, 0.8)';
    ctx.shadowBlur = 10 * zoom;
    ctx.beginPath();
    ctx.roundRect(-cw / 2 - 2 * zoom, -ch / 2 - 2 * zoom, cw + 4 * zoom, ch + 4 * zoom, 6 * zoom);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  // Faíscas e arco elétrico (⚡)
  if (st.sparking || st.fault) {
    ctx.strokeStyle = '#fef08a';
    ctx.shadowColor = '#eab308';
    ctx.shadowBlur = 14 * zoom;
    ctx.lineWidth = 2.2 * zoom;
    ctx.beginPath();
    ctx.moveTo(-cw * 0.22, 0);
    ctx.lineTo(-cw * 0.06, -7 * zoom);
    ctx.lineTo(cw * 0.06, 6 * zoom);
    ctx.lineTo(cw * 0.22, 0);
    ctx.stroke();
  }

  ctx.restore();
}

// ----------------------------------------------------------------------------
// 5. MOTOR PRINCIPAL DE RENDERIZAÇÃO REALISTA (EXPORTADO)
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

  // Contorno de Seleção no Canvas
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

  // Despacho Normativo para Sub-Renderizadores Especializados
  if (c.code === 'MPCB' || d.kind === 'motor_breaker') {
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
    c.code === 'MCB_1P' ||
    c.code === 'MCB1' ||
    c.code === 'MCB2' ||
    c.code === 'MCB3' ||
    c.code === 'MCCB' ||
    c.code === 'RCD' ||
    c.code === 'RCD4' ||
    c.code === 'RCBO'
  ) {
    renderCommercialDinBreaker(ctx, c, d, st, cw, ch, zoom, isClosed, isTrip);
  } else if (d.kind === 'fuse' || d.kind === 'fuse3' || c.code === 'FUSE' || c.code === 'FU3') {
    renderCommercialFuse(ctx, c, d, st, cw, ch, zoom);
  } else if (d.kind === 'spd' || d.kind === 'spd3' || c.code === 'SPD' || c.code === 'SPD3') {
    renderCommercialSpd(ctx, c, d, st, cw, ch, zoom);
  } else if (c.code === 'CONTACTOR' || d.kind === 'contactor') {
    renderIndustrialTeSysContactor(ctx, c, d, st, cw, ch, zoom);
  } else if (c.code === 'AUX_BLOCK_2NA2NF' || d.kind === 'aux_block') {
    renderCommercialAuxBlock(ctx, c, st, cw, ch, zoom);
  } else if (c.code === 'OLR' || d.kind === 'overload') {
    renderIndustrialOverloadRelay(ctx, c, st, cw, ch, zoom);
  } else if (c.code === 'RELAY' || d.kind === 'relay') {
    renderCommercialAuxRelay(ctx, c, d, st, cw, ch, zoom);
  } else if (c.code === 'TIMER' || c.code === 'TIMER_TOF' || d.kind === 'timer' || d.kind === 'timer_tof') {
    renderCommercialAuxRelay(ctx, c, d, st, cw, ch, zoom);
  } else if (c.code === 'TIMER_STAR_DELTA' || d.kind === 'timer_star_delta') {
    renderCommercialStarDeltaTimer(ctx, c, st, cw, ch, zoom);
  } else if (c.code === 'TIMER_DIGITAL' || d.kind === 'timer_digital') {
    renderCommercialDigitalTimer(ctx, c, st, cw, ch, zoom);
  } else if (c.code === 'THERMOSTAT_DIGITAL' || d.kind === 'thermostat_digital') {
    renderCommercialDigitalThermostat(ctx, c, st, cw, ch, zoom);
  } else if (c.code === 'PBNO' || c.code === 'PBNC') {
    renderIndustrialHarmonyPushButton(ctx, c, st, cw, ch, zoom);
  } else if (c.code === 'ESTOP' || d.kind === 'estop') {
    renderCommercialEmergencyStop(ctx, c, st, cw, ch, zoom);
  } else if (c.code === 'LIMIT' || d.kind === 'limit') {
    renderCommercialLimitSwitch(ctx, c, st, cw, ch, zoom);
  } else if (c.code === 'FLOAT' || d.kind === 'float_switch') {
    renderCommercialFloatSwitch(ctx, c, st, cw, ch, zoom);
  } else if (c.code === 'SEL' || d.kind === 'selector') {
    renderCommercialRotarySelector(ctx, c, st, cw, ch, zoom);
  } else if (c.code === 'DIMMER' || d.kind === 'dimmer') {
    renderCommercialDimmer(ctx, c, st, cw, ch, zoom);
  } else if (
    c.code === 'SW' ||
    c.code === 'SW2' ||
    c.code === 'SW_DOUBLE' ||
    c.code === 'THREE_WAY' ||
    c.code === 'FOUR_WAY' ||
    d.kind === 'switch' ||
    d.kind === 'switch2' ||
    d.kind === 'switch_double'
  ) {
    renderCommercialRockerSwitch(ctx, c, d, st, cw, ch, zoom);
  } else if (c.code === 'M3PH_6L' || d.kind === 'motor3_6l') {
    renderCommercialMotor6Lead(ctx, c, st, cw, ch, zoom, time, simRunning);
  } else if (d.kind.startsWith('motor') || c.code === 'M1PH' || c.code === 'M3PH' || c.code === 'MDC') {
    renderIndustrialWegMotor(ctx, c, d, st, cw, ch, zoom, time, simRunning);
  } else if (c.code === 'FAN' || d.kind === 'fan') {
    renderCommercialExhaustFan(ctx, c, st, cw, ch, zoom, time, simRunning);
  } else if (c.code === 'PUMP' || d.kind === 'pump') {
    renderCommercialWaterPump(ctx, c, st, cw, ch, zoom, time, simRunning);
  } else if (c.code === 'LAMP' || d.kind === 'lamp') {
    renderCommercialCeilingLamp(ctx, c, st, cw, ch, zoom);
  } else if (c.code.startsWith('PILOT') || d.kind === 'pilot') {
    renderCommercialPanelPilot(ctx, c, st, cw, ch, zoom);
  } else if (c.code === 'OUTLET' || d.kind === 'outlet') {
    renderCommercialOutlet(ctx, c, st, cw, ch, zoom);
  } else if (c.code === 'HEATER' || d.kind === 'heater') {
    renderCommercialIndustrialHeater(ctx, c, st, cw, ch, zoom);
  } else if (c.code === 'PHOTOCELL' || d.kind === 'photocell') {
    renderCommercialPhotocell(ctx, c, st, cw, ch, zoom);
  } else if (c.code === 'PIR_SENSOR' || d.kind === 'pir_sensor') {
    renderCommercialPirSensor(ctx, c, st, cw, ch, zoom);
  } else if (c.code === 'PV_PANEL' || d.kind === 'pv_panel') {
    renderCommercialPvPanel(ctx, c, st, cw, ch, zoom);
  } else if (c.code === 'PV_INVERTER_ONGRID' || d.kind === 'pv_inverter_ongrid') {
    renderCommercialOnGridInverter(ctx, c, st, cw, ch, zoom, simRunning);
  } else if (c.code === 'PV_INVERTER_OFFGRID' || d.kind === 'pv_inverter_offgrid') {
    renderCommercialOffGridInverter(ctx, c, st, cw, ch, zoom, simRunning);
  } else if (c.code === 'PV_INVERTER_HYBRID' || d.kind === 'pv_inverter_hybrid') {
    renderCommercialHybridInverter(ctx, c, st, cw, ch, zoom, simRunning);
  } else if (c.code === 'BAT_LIFEPO4' || d.kind === 'battery') {
    renderCommercialLiFePO4(ctx, c, st, cw, ch, zoom);
  } else if (c.code === 'GEN_DIESEL' || d.kind === 'generator_diesel') {
    renderCommercialGenerator(ctx, c, st, cw, ch, zoom, time, simRunning);
  } else if (c.code === 'ATS_SWITCH' || d.kind === 'ats_switch') {
    renderCommercialAts(ctx, c, st, cw, ch, zoom);
  } else if (c.code === 'MTS_SWITCH' || d.kind === 'mts_switch') {
    renderCommercialMts(ctx, c, st, cw, ch, zoom);
  } else if (c.code === 'SMART_METER' || d.kind === 'smart_meter') {
    renderCommercialSmartMeter(ctx, c, st, cw, ch, zoom);
  } else if (c.code === 'SRC1' || c.code === 'SRC3' || c.code === 'SRC_DC' || d.kind === 'source' || d.kind === 'source3') {
    renderCommercialPowerSource(ctx, c, st, cw, ch, zoom);
  } else if (c.code === 'EARTH_ROD' || d.kind === 'ground_rod') {
    renderCommercialGroundRod(ctx, c, st, cw, ch, zoom);
  } else if (c.code === 'EARTH_PIT' || d.kind === 'bep_pit') {
    renderCommercialBepPit(ctx, c, st, cw, ch, zoom);
  } else if (c.code === 'JUNCTION_BOX' || d.kind === 'junction_box') {
    renderCommercialWagoBox(ctx, c, st, cw, ch, zoom);
  } else {
    renderCommercialGenericBox(ctx, c, d, st, cw, ch, zoom);
  }

  // Bornes metálicos e parafusos de aperto
  renderMetallicScrewTerminals(ctx, c, d, cw, ch, zoom);

  // Efeitos térmicos, faíscas e arcos de curto-circuito
  if (st.thermal || st.damaged || st.sparking || st.fault) {
    renderFaultEffects(ctx, cw, ch, zoom, time, st);
  }

  ctx.restore();
}