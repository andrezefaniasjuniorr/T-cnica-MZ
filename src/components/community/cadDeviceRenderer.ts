// ============================================================================
// TÉCNICAMZ PRO — MOTOR DE RENDERIZAÇÃO REALISTA DE DISPOSITIVOS CAD ELÉTRICOS (V30)
// Design Industrial Ultra-Realista Completo: Sem Caixinhas Genéricas!
// Modelagem Pseudo-3D PBR Canvas2D para Todos os Dispositivos Industriais:
// Painéis Half-Cell MBB, Inversores On-Grid/Off-Grid/Híbridos, Baterias LiFePO4 Rack,
// Smart Meter, Motores WEG, TeSys KM, Relés OLR, Disjuntores DIN, DPS, ATS, MTS 1-0-2
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
  burned?: boolean;
  tripReason?: string;
  tripDetails?: string;
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
  status?: 'green' | 'red';
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
  PHASE: 'RPF FALTA FASE',

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
  JUNCTION_BOX: 'CAIXA WAGO',

  VM: 'VOLTÍMETRO',
  AM: 'AMPERÍMETRO',
  OHM: 'OHMÍMETRO',
  WM: 'WATTÍMETRO',
  FREQ: 'FREQ. HERTZ',
  COS: 'FASÍMETRO'
};

export function getCompactDeviceLabel(code: string, customLabel?: string): string {
  if (customLabel && customLabel.length <= 15 && !customLabel.includes(' ')) {
    return customLabel.toUpperCase();
  }
  return COMPACT_DEVICE_CODES[code] || code;
}

// ----------------------------------------------------------------------------
// 1. MÓDULO SOLAR FOTOVOLTAICO HALF-CELL MBB (PV_PANEL) HIPER-REALISTA
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
  const brandName = (c.brand || c.brandName || 'Tier-1 Mono MBB').toString();

  // 1. Moldura Perimétrica em Alumínio Anodizado Escovado 3D
  const frameBorder = Math.max(3.5, 4.8 * zoom);
  const fGrad = ctx.createLinearGradient(-cw / 2, -ch / 2, cw / 2, ch / 2);
  fGrad.addColorStop(0, '#f8fafc');
  fGrad.addColorStop(0.2, '#cbd5e1');
  fGrad.addColorStop(0.5, '#64748b');
  fGrad.addColorStop(0.8, '#94a3b8');
  fGrad.addColorStop(1, '#334155');

  ctx.fillStyle = fGrad;
  ctx.beginPath();
  ctx.roundRect(-cw / 2, -ch / 2, cw, ch, 4 * zoom);
  ctx.fill();
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1.2 * zoom;
  ctx.stroke();

  // Furos de aterramento e fixação nas abas da moldura
  [-cw * 0.38, cw * 0.38].forEach(hx => {
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(hx, -ch / 2 + frameBorder / 2, 1.2 * zoom, 0, Math.PI * 2);
    ctx.arc(hx, ch / 2 - frameBorder / 2, 1.2 * zoom, 0, Math.PI * 2);
    ctx.fill();
  });

  // 2. Vidro Temperado Antirreflexo e Matriz de Silício Monocristalino
  const innerW = cw - frameBorder * 2;
  const innerH = ch - frameBorder * 2;
  const glassX = -cw / 2 + frameBorder;
  const glassY = -ch / 2 + frameBorder;

  const cellGrad = ctx.createLinearGradient(glassX, glassY, glassX + innerW, glassY + innerH);
  if (isSunny) {
    cellGrad.addColorStop(0, '#0a2540');
    cellGrad.addColorStop(0.3, '#0b1d33');
    cellGrad.addColorStop(0.7, '#071526');
    cellGrad.addColorStop(1, '#020a14');
  } else {
    cellGrad.addColorStop(0, '#1e293b');
    cellGrad.addColorStop(0.5, '#0f172a');
    cellGrad.addColorStop(1, '#020617');
  }

  ctx.fillStyle = cellGrad;
  ctx.fillRect(glassX, glassY, innerW, innerH);

  // 3. Arquitetura Half-Cell: Divisão Física Central com Fita Branca
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(glassX, -1.2 * zoom, innerW, 2.4 * zoom);

  // 4. Barramentos Metálicos MBB (10 Busbars verticais contínuos de prata)
  const numMBB = 10;
  const busbarPitch = innerW / (numMBB + 1);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.lineWidth = 0.8 * zoom;

  for (let i = 1; i <= numMBB; i++) {
    const bx = glassX + i * busbarPitch;
    ctx.beginPath();
    ctx.moveTo(bx, glassY);
    ctx.lineTo(bx, glassY + innerH);
    ctx.stroke();
  }

  // 5. Linhas de Wafer das Células Solares
  const rows = 6;
  const rowH = innerH / rows;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 0.5 * zoom;
  for (let r = 1; r < rows; r++) {
    const ry = glassY + r * rowH;
    ctx.beginPath();
    ctx.moveTo(glassX, ry);
    ctx.lineTo(glassX + innerW, ry);
    ctx.stroke();
  }

  // 6. Brilho Reflexivo Solar Ótico (Glint Diagonal)
  if (isSunny) {
    const glint = ctx.createLinearGradient(glassX, glassY, glassX + innerW * 0.7, glassY + innerH * 0.7);
    glint.addColorStop(0, 'rgba(254, 240, 138, 0.22)');
    glint.addColorStop(0.2, 'rgba(56, 189, 248, 0.14)');
    glint.addColorStop(0.6, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = glint;
    ctx.fillRect(glassX, glassY, innerW, innerH);
  }

  // 7. Plaqueta Técnica Central com Gravação a Laser
  const tagW = Math.min(innerW * 0.85, 96 * zoom);
  const tagH = 34 * zoom;
  ctx.fillStyle = 'rgba(2, 6, 23, 0.92)';
  ctx.beginPath();
  ctx.roundRect(-tagW / 2, -tagH / 2, tagW, tagH, 3 * zoom);
  ctx.fill();
  ctx.strokeStyle = isSunny ? '#f59e0b' : '#475569';
  ctx.lineWidth = 1 * zoom;
  ctx.stroke();

  ctx.fillStyle = isSunny ? '#fde047' : '#94a3b8';
  ctx.font = `bold ${Math.max(5.5, 6.5 * zoom)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText(brandName.toUpperCase(), 0, -tagH / 2 + 8 * zoom);

  ctx.fillStyle = '#ffffff';
  ctx.font = `black ${Math.max(8, 9.5 * zoom)}px 'Courier New', monospace`;
  ctx.fillText(`${pMax}Wp • ${vmpp}V`, 0, -tagH / 2 + 19 * zoom);

  const currGen = isSunny ? ((pMax * (irr / 1000)) / Math.max(1, vmpp)).toFixed(1) : '0.0';
  ctx.fillStyle = isSunny ? '#34d399' : '#64748b';
  ctx.font = `bold ${Math.max(5.5, 6.5 * zoom)}px monospace`;
  ctx.fillText(`${irr} W/m² • ${currGen}A`, 0, -tagH / 2 + 29 * zoom);
}

// ----------------------------------------------------------------------------
// 2. INVERSOR SOLAR ON-GRID STRING TRIFÁSICO (PV_INVERTER_ONGRID)
// ----------------------------------------------------------------------------
export function renderCommercialOnGridInverter(
  ctx: CanvasRenderingContext2D,
  c: any,
  st: DeviceSimulationState,
  cw: number,
  ch: number,
  zoom: number,
  simRunning: boolean
) {
  const isOperating = Boolean(simRunning && st.running);
  const pNom = Number(c.params?.powerKW || 10).toFixed(1);
  const pKwNow = (st.powerKW || 0).toFixed(2);
  const vPv = st.pvVoltage || 0;
  const brandName = (c.brand || c.brandName || 'Huawei / Fronius Symo').toString();

  // 1. Aletas de Dissipação Térmica em Alumínio Fundido (Traseira/Laterais)
  ctx.fillStyle = '#334155';
  ctx.fillRect(-cw / 2 - 4 * zoom, -ch * 0.42, 4 * zoom, ch * 0.84);
  ctx.fillRect(cw / 2, -ch * 0.42, 4 * zoom, ch * 0.84);

  // 2. Carcaça Frontal Curvada em Branco Puro Automotivo (RAL 9003)
  const bGrad = ctx.createLinearGradient(-cw / 2, -ch / 2, cw / 2, ch / 2);
  bGrad.addColorStop(0, '#ffffff');
  bGrad.addColorStop(0.2, '#f8fafc');
  bGrad.addColorStop(0.8, '#e2e8f0');
  bGrad.addColorStop(1, '#cbd5e1');

  ctx.fillStyle = bGrad;
  ctx.beginPath();
  ctx.roundRect(-cw / 2, -ch / 2, cw, ch, 8 * zoom);
  ctx.fill();
  ctx.strokeStyle = isOperating ? '#10b981' : '#94a3b8';
  ctx.lineWidth = 1.6 * zoom;
  ctx.stroke();

  // 3. Display Gráfico Digital OLED Central
  const dispW = cw * 0.78;
  const dispH = 38 * zoom;
  const dispY = -ch * 0.08;
  ctx.fillStyle = '#020617';
  ctx.beginPath();
  ctx.roundRect(-dispW / 2, dispY - dispH / 2, dispW, dispH, 3 * zoom);
  ctx.fill();
  ctx.strokeStyle = '#1e293b';
  ctx.stroke();

  // Leitura digital OLED de injeção na rede
  ctx.fillStyle = isOperating ? '#34d399' : '#f59e0b';
  ctx.font = `black ${Math.max(8.5, 10.5 * zoom)}px 'Courier New', monospace`;
  ctx.textAlign = 'center';
  ctx.fillText(isOperating ? `${pKwNow} kW INJETANDO` : `MPPT ${pNom}kW STANDBY`, 0, dispY - 4 * zoom);

  ctx.fillStyle = '#38bdf8';
  ctx.font = `bold ${Math.max(6, 7 * zoom)}px monospace`;
  ctx.fillText(`PV: ${vPv}V • REDE: 400V 50Hz`, 0, dispY + 11 * zoom);

  // 4. Anel Indicador de Status LED Circular (Halo Central)
  const haloR = 7 * zoom;
  const haloY = -ch * 0.32;
  ctx.fillStyle = isOperating ? '#10b981' : '#f59e0b';
  ctx.beginPath();
  ctx.arc(0, haloY, haloR, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.2 * zoom;
  ctx.stroke();

  // 5. Chave Seccionadora DC Rotativa na Base Lateral
  const dcSwX = -cw * 0.32;
  const dcSwY = ch / 2 - 12 * zoom;
  ctx.fillStyle = '#dc2626';
  ctx.beginPath();
  ctx.arc(dcSwX, dcSwY, 5 * zoom, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#facc15';
  ctx.stroke();

  ctx.fillStyle = '#0f172a';
  ctx.font = `bold ${Math.max(6, 7.5 * zoom)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText(`${brandName} • 3-PHASE ON-GRID`, 0, ch / 2 - 6 * zoom);
}

// ----------------------------------------------------------------------------
// 3. INVERSOR SOLAR OFF-GRID SENOIDAL COM MPPT (PV_INVERTER_OFFGRID)
// ----------------------------------------------------------------------------
export function renderCommercialOffGridInverter(
  ctx: CanvasRenderingContext2D,
  c: any,
  st: DeviceSimulationState,
  cw: number,
  ch: number,
  zoom: number,
  simRunning: boolean
) {
  const isOperating = Boolean(simRunning && st.running);
  const pNom = ((c.params?.powerW || 5000) / 1000).toFixed(1);
  const vBat = st.batVoltage || 48;
  const vPv = st.pvVoltage || 0;
  const brandName = (c.brand || c.brandName || 'Growatt / Deye SPF').toString();

  // Gabinete vertical em azul cobalto industrial e grafite
  const gGrad = ctx.createLinearGradient(-cw / 2, -ch / 2, cw / 2, ch / 2);
  gGrad.addColorStop(0, '#0284c7');
  gGrad.addColorStop(0.35, '#0369a1');
  gGrad.addColorStop(0.7, '#0f172a');
  gGrad.addColorStop(1, '#020617');

  ctx.fillStyle = gGrad;
  ctx.beginPath();
  ctx.roundRect(-cw / 2, -ch / 2, cw, ch, 6 * zoom);
  ctx.fill();
  ctx.strokeStyle = isOperating ? '#38bdf8' : '#475569';
  ctx.lineWidth = 1.6 * zoom;
  ctx.stroke();

  // Grelha superior das ventoinhas de extração
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(-cw * 0.36, -ch / 2 + 4 * zoom, cw * 0.72, 8 * zoom);

  // Display LCD Sinóptico de Fluxo de Potência
  const lcdW = cw * 0.82;
  const lcdH = 42 * zoom;
  const lcdY = -ch * 0.08;

  ctx.fillStyle = '#064e3b';
  ctx.beginPath();
  ctx.roundRect(-lcdW / 2, lcdY - lcdH / 2, lcdW, lcdH, 3 * zoom);
  ctx.fill();
  ctx.strokeStyle = isOperating ? '#10b981' : '#475569';
  ctx.lineWidth = 1.2 * zoom;
  ctx.stroke();

  // Sinóptico digital
  ctx.fillStyle = isOperating ? '#34d399' : '#f87171';
  ctx.font = `black ${Math.max(7.5, 9.5 * zoom)}px 'Courier New', monospace`;
  ctx.textAlign = 'center';
  ctx.fillText(isOperating ? '230V CA SENOIDAL PURA' : 'OFF-GRID EM STANDBY', 0, lcdY - 8 * zoom);

  ctx.fillStyle = '#a7f3d0';
  ctx.font = `bold ${Math.max(6, 7 * zoom)}px monospace`;
  ctx.fillText(`PV: ${vPv}V ➔ BAT: ${vBat}V ➔ ${pNom}kW`, 0, lcdY + 6 * zoom);

  // Teclas tácteis de configuração (ESC, UP, DOWN, ENTER)
  const keyY = lcdY + lcdH / 2 + 10 * zoom;
  [-cw * 0.28, -cw * 0.09, cw * 0.09, cw * 0.28].forEach((kx, idx) => {
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.roundRect(kx - 6 * zoom, keyY - 4 * zoom, 12 * zoom, 8 * zoom, 1.5 * zoom);
    ctx.fill();
  });

  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${Math.max(6, 7.5 * zoom)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText(`${brandName} • MPPT 48V`, 0, ch / 2 - 6 * zoom);
}

// ----------------------------------------------------------------------------
// 4. INVERSOR SOLAR HÍBRIDO BIDIRECIONAL COM BACKUP EPS (PV_INVERTER_HYBRID)
// ----------------------------------------------------------------------------
export function renderCommercialHybridInverter(
  ctx: CanvasRenderingContext2D,
  c: any,
  st: DeviceSimulationState,
  cw: number,
  ch: number,
  zoom: number,
  simRunning: boolean
) {
  const isOperating = Boolean(simRunning && st.running);
  const pNom = Number(c.params?.powerKW || 6).toFixed(1);
  const brandName = (c.brand || c.brandName || 'Deye / GoodWe Hybrid').toString();

  // Gabinete contemporâneo branco acetinado com bordas chanfradas
  ctx.fillStyle = '#f8fafc';
  ctx.beginPath();
  ctx.roundRect(-cw / 2, -ch / 2, cw, ch, 8 * zoom);
  ctx.fill();
  ctx.strokeStyle = isOperating ? '#10b981' : '#64748b';
  ctx.lineWidth = 1.6 * zoom;
  ctx.stroke();

  // Tela sensível ao toque colorida central
  const touchW = cw * 0.8;
  const touchH = 44 * zoom;
  const touchY = -ch * 0.06;

  ctx.fillStyle = '#020617';
  ctx.beginPath();
  ctx.roundRect(-touchW / 2, touchY - touchH / 2, touchW, touchH, 4 * zoom);
  ctx.fill();
  ctx.strokeStyle = '#1e293b';
  ctx.stroke();

  // Animação de fluxo dinâmico híbrido
  ctx.fillStyle = isOperating ? '#38bdf8' : '#f59e0b';
  ctx.font = `black ${Math.max(8, 10 * zoom)}px 'Courier New', monospace`;
  ctx.textAlign = 'center';
  ctx.fillText(isOperating ? '230V EPS • BACKUP ATIVO' : 'SISTEMA HÍBRIDO PRONTO', 0, touchY - 6 * zoom);

  ctx.fillStyle = '#34d399';
  ctx.font = `bold ${Math.max(6, 7 * zoom)}px monospace`;
  ctx.fillText(`REDE ⇄ HÍBRIDO ${pNom}kW ⇄ BAT 48V`, 0, touchY + 9 * zoom);

  // Módulo de comunicação Wi-Fi / Dongle na lateral
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(cw / 2 - 3 * zoom, -ch * 0.2, 5 * zoom, 16 * zoom);
  ctx.fillStyle = isOperating ? '#22c55e' : '#334155';
  ctx.beginPath();
  ctx.arc(cw / 2 - 1 * zoom, -ch * 0.12, 1.5 * zoom, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#0f172a';
  ctx.font = `bold ${Math.max(6, 7.5 * zoom)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText(`${brandName} • ESS STORAGE`, 0, ch / 2 - 6 * zoom);
}

// ----------------------------------------------------------------------------
// 5. BATERIA DE LÍTIO LiFePO4 RACK 19" 3U (BAT_LIFEPO4)
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
  const brandName = (c.brand || c.brandName || 'Pylontech / Dyness').toString();
  const shortBrand = REAL_BRANDS[brandName as DeviceBrand]?.shortName || brandName.split(' ')[0];

  // 1. Chassi Metálico Rack 19" Preto Fosco com Pintura Eletrostática
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

  // Orelhas de fixação com furos M6
  const earW = 7 * zoom;
  [-cw / 2, cw / 2 - earW].forEach(ex => {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(ex, -ch / 2, earW, ch);
    ctx.strokeStyle = '#334155';
    ctx.strokeRect(ex, -ch / 2, earW, ch);
    [-ch * 0.3, ch * 0.3].forEach(sy => {
      ctx.fillStyle = '#cbd5e1';
      ctx.beginPath();
      ctx.arc(ex + earW / 2, sy, 1.8 * zoom, 0, Math.PI * 2);
      ctx.fill();
    });
  });

  // 2. Mini Display OLED do BMS
  const dW = cw * 0.44;
  const dH = 34 * zoom;
  const dX = -cw * 0.04;
  const dY = -2 * zoom;

  ctx.fillStyle = '#020617';
  ctx.beginPath();
  ctx.roundRect(dX - dW / 2, dY - dH / 2, dW, dH, 2.5 * zoom);
  ctx.fill();
  ctx.strokeStyle = '#1e293b';
  ctx.stroke();

  ctx.fillStyle = '#38bdf8';
  ctx.font = `black ${Math.max(8.5, 10.5 * zoom)}px 'Courier New', monospace`;
  ctx.textAlign = 'center';
  ctx.fillText(`${soc}% SOC`, dX, dY - dH / 2 + 10 * zoom);

  ctx.fillStyle = '#22c55e';
  ctx.font = `bold ${Math.max(6, 7 * zoom)}px monospace`;
  ctx.fillText(`${vNom}V • ${capAh}Ah`, dX, dY - dH / 2 + 22 * zoom);

  // Barra de LED de Estado de Carga (6 Segmentos)
  const barW = dW * 0.84;
  const barH = 4 * zoom;
  const barX = dX - barW / 2;
  const barY = dY + dH / 2 - 6 * zoom;

  ctx.fillStyle = '#090d16';
  ctx.fillRect(barX, barY, barW, barH);
  const fillW = (soc / 100) * barW;
  ctx.fillStyle = soc > 20 ? '#22c55e' : '#ef4444';
  ctx.fillRect(barX, barY, fillW, barH);

  // 3. Bornes Conectores SurLok de Alta Corrente (Positivo Vermelho / Negativo Preto)
  const postY = -ch * 0.18;
  // Borne Positivo (+)
  ctx.fillStyle = '#dc2626';
  ctx.beginPath();
  ctx.arc(cw * 0.3, postY, 4.5 * zoom, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1 * zoom;
  ctx.stroke();

  // Borne Negativo (-)
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(cw * 0.3, postY + 14 * zoom, 4.5 * zoom, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#38bdf8';
  ctx.stroke();

  // 4. Portas de Comunicação Duplas RJ45 (CAN / RS485)
  ctx.fillStyle = '#334155';
  ctx.fillRect(cw * 0.22, postY + 24 * zoom, 7 * zoom, 6 * zoom);
  ctx.fillRect(cw * 0.32, postY + 24 * zoom, 7 * zoom, 6 * zoom);

  ctx.fillStyle = '#cbd5e1';
  ctx.font = `bold ${Math.max(6, 7.5 * zoom)}px sans-serif`;
  ctx.textAlign = 'left';
  ctx.fillText(`${shortBrand} LiFePO4`, -cw * 0.32, -ch / 2 + 10 * zoom);
}

// ----------------------------------------------------------------------------
// 6. SMART METER MEDIDOR BIDIRECIONAL DIN RS-485 (SMART_METER)
// ----------------------------------------------------------------------------
export function renderCommercialSmartMeter(
  ctx: CanvasRenderingContext2D,
  c: any,
  st: DeviceSimulationState,
  cw: number,
  ch: number,
  zoom: number
) {
  const kwh = st.energyKWh || '0.00';
  const pW = Math.round((st.powerKW || 0) * 1000);

  ctx.fillStyle = '#f8fafc';
  ctx.beginPath();
  ctx.roundRect(-cw / 2, -ch / 2, cw, ch, 4 * zoom);
  ctx.fill();
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 1.2 * zoom;
  ctx.stroke();

  // Display LCD Azul Retroiluminado
  const dispW = cw * 0.82;
  const dispH = 34 * zoom;
  ctx.fillStyle = '#0284c7';
  ctx.beginPath();
  ctx.roundRect(-dispW / 2, -dispH / 2 - 2 * zoom, dispW, dispH, 2.5 * zoom);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = `black ${Math.max(8.5, 10 * zoom)}px 'Courier New', monospace`;
  ctx.textAlign = 'center';
  ctx.fillText(`${kwh} kWh`, 0, -4 * zoom);

  ctx.fillStyle = '#fef08a';
  ctx.font = `bold ${Math.max(6, 7 * zoom)}px monospace`;
  ctx.fillText(`P: ${pW} W ⇄ RS485`, 0, 7 * zoom);

  // LED de Pulso Óptico 1000 imp/kWh
  ctx.fillStyle = pW > 0 ? '#ef4444' : '#64748b';
  ctx.beginPath();
  ctx.arc(-cw * 0.28, ch * 0.3, 2 * zoom, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#0f172a';
  ctx.font = `bold ${Math.max(5.5, 6.5 * zoom)}px sans-serif`;
  ctx.fillText('SMART METER BIDIRECIONAL', 0, ch / 2 - 4 * zoom);
}

// ----------------------------------------------------------------------------
// 7. DEMAIS DISPOSITIVOS (DISJUNTORES, COMUTADORES, MOTORES, ATERRAMENTO)
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
  const isRcd = d.kind === 'rcd' || d.kind === 'rcd4' || d.kind === 'rcbo';
  const brandName = (c.brand || c.brandName || 'Schneider Electric').toString();
  const shortBrand = REAL_BRANDS[brandName as DeviceBrand]?.shortName || brandName.split(' ')[0];

  const isMagneticShort = st.tripReason === 'MAGNETIC_SHORT_CIRCUIT' || Boolean(st.tripReason?.includes('Magnético')) || Boolean(st.tripReason?.includes('SHORT'));
  const isDamagedIcu = Boolean(st.damaged || st.isBurned || st.burned || st.tripReason?.includes('Icu') || st.tripReason?.includes('Destruição'));

  // 1. CARCAÇA MODULAR DIN TH35 (CHAMUSCADA SE st.damaged / Icu EXCEDIDO)
  const grad = ctx.createLinearGradient(0, -ch / 2, 0, ch / 2);
  if (isDamagedIcu) {
    // Carcaça chamuscada por destruição de arco elétrico e Icu excedido
    grad.addColorStop(0, '#1c1917');
    grad.addColorStop(0.18, '#0c0a09');
    grad.addColorStop(0.55, '#18181b');
    grad.addColorStop(0.85, '#09090b');
    grad.addColorStop(1, '#050507');
  } else {
    grad.addColorStop(0, '#334155');
    grad.addColorStop(0.12, '#1e293b');
    grad.addColorStop(0.88, '#0f172a');
    grad.addColorStop(1, '#020617');
  }

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.roundRect(-cw / 2, -ch / 2, cw, ch, 4 * zoom);
  ctx.fill();
  ctx.strokeStyle = isDamagedIcu ? '#ef4444' : isTrip ? '#f59e0b' : '#475569';
  ctx.lineWidth = (isDamagedIcu ? 2 : 1.2) * zoom;
  ctx.stroke();

  // Se carcaça chamuscada: manchas severas de fuligem e fissuras térmicas de ruptura
  if (isDamagedIcu) {
    ctx.save();
    // Mancha carbonizada central intensa
    const burnGrad = ctx.createRadialGradient(0, -ch * 0.1, 2 * zoom, 0, -ch * 0.1, cw * 0.65);
    burnGrad.addColorStop(0, 'rgba(5, 5, 8, 0.95)');
    burnGrad.addColorStop(0.5, 'rgba(18, 18, 22, 0.8)');
    burnGrad.addColorStop(0.8, 'rgba(39, 39, 42, 0.4)');
    burnGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = burnGrad;
    ctx.beginPath();
    ctx.ellipse(0, -ch * 0.1, cw * 0.52, ch * 0.42, 0, 0, Math.PI * 2);
    ctx.fill();

    // Fissuras térmicas irregulares de alívio de explosão na carcaça plástica
    ctx.strokeStyle = '#f97316';
    ctx.lineWidth = 1.2 * zoom;
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 6 * zoom;
    ctx.beginPath();
    ctx.moveTo(-cw * 0.38, -ch * 0.22);
    ctx.lineTo(-cw * 0.15, -ch * 0.08);
    ctx.lineTo(-cw * 0.05, -ch * 0.15);
    ctx.lineTo(cw * 0.25, -ch * 0.02);
    ctx.lineTo(cw * 0.38, ch * 0.12);
    ctx.stroke();

    // Ramificação da trinca
    ctx.beginPath();
    ctx.moveTo(-cw * 0.15, -ch * 0.08);
    ctx.lineTo(-cw * 0.22, ch * 0.18);
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.restore();
  }

  // 2. RANHURAS DE DESCOMPRESSÃO DA CÂMARA DE EXTINÇÃO DE ARCO (DE-ION VENT SLOTS)
  const ventSlotW = Math.min(cw * 0.65, 26 * zoom);
  const ventSlotH = 1.8 * zoom;
  const ventSlotsY = -ch * 0.43;

  for (let s = 0; s < 4; s++) {
    const vy = ventSlotsY + s * (3.1 * zoom);
    // Vão da ranhura de descompressão
    ctx.fillStyle = isMagneticShort ? '#050507' : '#0b0f19';
    ctx.fillRect(-ventSlotW / 2, vy, ventSlotW, ventSlotH);
    ctx.strokeStyle = isMagneticShort ? 'rgba(239, 68, 68, 0.4)' : '#1e293b';
    ctx.lineWidth = 0.6 * zoom;
    ctx.strokeRect(-ventSlotW / 2, vy, ventSlotW, ventSlotH);
  }

  // Se disparado por curto magnético: MANCHAS PRETAS DE QUEIMA DE ARCO NAS RANHURAS
  if (isMagneticShort) {
    ctx.save();
    // Pluma de fuligem preta de descompressão do arco elétrico
    const sootArcGrad = ctx.createRadialGradient(0, ventSlotsY + 5 * zoom, 2 * zoom, 0, ventSlotsY + 5 * zoom, cw * 0.6);
    sootArcGrad.addColorStop(0, 'rgba(5, 5, 8, 0.96)');
    sootArcGrad.addColorStop(0.35, 'rgba(15, 15, 18, 0.88)');
    sootArcGrad.addColorStop(0.7, 'rgba(40, 25, 20, 0.45)');
    sootArcGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = sootArcGrad;
    ctx.beginPath();
    ctx.ellipse(0, ventSlotsY + 5 * zoom, cw * 0.52, 14 * zoom, 0, 0, Math.PI * 2);
    ctx.fill();

    // Chamuscado incandescente alaranjado ao redor das aletas da câmara de extinção
    ctx.strokeStyle = 'rgba(249, 115, 22, 0.65)';
    ctx.lineWidth = 0.9 * zoom;
    ctx.shadowColor = '#f97316';
    ctx.shadowBlur = 8 * zoom;
    for (let s = 0; s < 4; s++) {
      const vy = ventSlotsY + s * (3.1 * zoom);
      ctx.strokeRect(-ventSlotW / 2 - 1 * zoom, vy - 0.5 * zoom, ventSlotW + 2 * zoom, ventSlotH + 1 * zoom);
    }
    ctx.shadowBlur = 0;
    ctx.restore();
  }

  // 3. VISOR ÓTICO DE STATUS MECÂNICO
  const flagW = Math.min(cw * 0.45, 18 * zoom);
  const flagH = 4.5 * zoom;
  const flagY = -ch * 0.26;
  ctx.fillStyle = isDamagedIcu ? '#450a0a' : isTrip ? '#f59e0b' : isClosed ? '#dc2626' : '#16a34a';
  ctx.fillRect(-flagW / 2, flagY, flagW, flagH);
  ctx.strokeStyle = '#020617';
  ctx.lineWidth = 0.8 * zoom;
  ctx.strokeRect(-flagW / 2, flagY, flagW, flagH);

  // 4. ALAVANCA BASCULANTE ERGONÔMICA
  const levW = Math.min(cw * 0.42, 18 * zoom);
  const levH = 18 * zoom;
  const levY = isDamagedIcu ? -levH * 0.4 : isTrip ? -levH / 2 : isClosed ? -ch * 0.12 : 2 * zoom;

  const levGrad = ctx.createLinearGradient(0, levY, 0, levY + levH);
  if (isDamagedIcu) {
    levGrad.addColorStop(0, '#27272a');
    levGrad.addColorStop(1, '#09090b');
  } else if (isTrip) {
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
  ctx.strokeStyle = isDamagedIcu ? '#7f1d1d' : '#64748b';
  ctx.lineWidth = 0.8 * zoom;
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${Math.max(6.5, 7.5 * zoom)}px monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(isDamagedIcu ? 'DAMAGED' : isTrip ? 'TRIP' : isClosed ? 'I' : 'O', 0, levY + levH / 2);

  // Botão de teste mecânico para DR / RCBO
  if (isRcd) {
    const testR = 5 * zoom;
    const testX = cw * 0.28;
    const testY = -ch * 0.12;
    ctx.fillStyle = isDamagedIcu ? '#78350f' : '#f59e0b';
    ctx.beginPath();
    ctx.arc(testX, testY, testR, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#b45309';
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.max(5.5, 6.5 * zoom)}px sans-serif`;
    ctx.fillText('T', testX, testY);
  }

  // Marca Comercial
  ctx.fillStyle = isDamagedIcu ? '#71717a' : REAL_BRANDS[brandName as DeviceBrand]?.textColor || '#94a3b8';
  ctx.font = `bold ${Math.max(5.5, 6.5 * zoom)}px sans-serif`;
  ctx.fillText(shortBrand.toUpperCase(), 0, -ch / 2 + 8 * zoom);

  // Informações Técnicas Normativas (ou Alerta de Destruição por Icu)
  if (isDamagedIcu) {
    ctx.fillStyle = '#ef4444';
    ctx.font = `bold ${Math.max(6, 7 * zoom)}px monospace`;
    ctx.fillText(`DESTRUÍDO (Icu > ${icu}kA)`, 0, ch / 2 - 8 * zoom);
  } else if (isMagneticShort) {
    ctx.fillStyle = '#f59e0b';
    ctx.font = `bold ${Math.max(6, 7 * zoom)}px monospace`;
    ctx.fillText(`CURTO-CIRCUITO (${curve}${inA})`, 0, ch / 2 - 8 * zoom);
  } else {
    ctx.fillStyle = '#cbd5e1';
    ctx.font = `bold ${Math.max(6, 7 * zoom)}px monospace`;
    ctx.fillText(isRcd ? `${inA}A • 30mA` : `${curve}${inA} • ${icu}kA`, 0, ch / 2 - 8 * zoom);
  }
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
  const inA = c.params?.current || 16;
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
  ctx.fillStyle = isClosed ? '#064e3b' : '#1e293b';
  ctx.beginPath();
  ctx.roundRect(-bW * 0.32, -bH * 0.35, btnW, btnH, 2 * zoom);
  ctx.fill();

  ctx.fillStyle = isClosed ? '#34d399' : '#f1f5f9';
  ctx.font = `bold ${Math.max(8, 9 * zoom)}px monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('I', -bW * 0.32 + btnW / 2, -bH * 0.35 + btnH / 2);

  ctx.fillStyle = '#dc2626';
  ctx.beginPath();
  ctx.roundRect(-bW * 0.32 + btnW + 4 * zoom, -bH * 0.35, btnW, btnH, 2 * zoom);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.fillText('O', -bW * 0.32 + btnW + 4 * zoom + btnW / 2, -bH * 0.35 + btnH / 2);

  ctx.fillStyle = '#94a3b8';
  ctx.font = `bold ${Math.max(5.5, 6.5 * zoom)}px sans-serif`;
  ctx.fillText(`MPCB ${inA}A • 690V`, 0, ch / 2 - 9 * zoom);
}

export function renderCommercialFuseCarrier(
  ctx: CanvasRenderingContext2D,
  c: any,
  st: DeviceSimulationState,
  cw: number,
  ch: number,
  zoom: number
) {
  const isTrip = Boolean(st.burned || st.isBurned || st.tripped || st.fault);
  const inA = c.params?.current || 10;
  const is3P = c.code === 'FU3';

  // Base do porta-fusível seccionador
  ctx.fillStyle = isTrip ? '#090d16' : '#1e293b';
  ctx.beginPath();
  ctx.roundRect(-cw / 2, -ch / 2, cw, ch, 4 * zoom);
  ctx.fill();
  ctx.strokeStyle = isTrip ? '#ef4444' : '#475569';
  ctx.lineWidth = (isTrip ? 1.8 : 1) * zoom;
  ctx.stroke();

  const poles = is3P ? 3 : 1;
  const pW = (cw * 0.84) / poles;
  const pH = ch * 0.62;
  const startX = -cw * 0.42 + pW / 2;

  for (let i = 0; i < poles; i++) {
    const px = startX + i * pW;

    // Gaveta basculante do cartucho
    ctx.fillStyle = '#050a14';
    ctx.beginPath();
    ctx.roundRect(px - pW * 0.45, -pH / 2, pW * 0.9, pH, 3 * zoom);
    ctx.fill();
    ctx.strokeStyle = isTrip ? 'rgba(239, 68, 68, 0.4)' : '#1e293b';
    ctx.stroke();

    // CARTUCHO CERÂMICO 10x38 mm (ESTOURADO/CARBONIZADO EM PRETO FULIGEM SE isTrip / st.burned)
    const cartW = pW * 0.54;
    const cartH = pH * 0.82;
    const cartX = px - cartW / 2;
    const cartY = -cartH / 2;

    if (isTrip) {
      // Cartucho estourado/carbonizado em preto fuligem com queima térmica
      const charredGrad = ctx.createLinearGradient(cartX, 0, cartX + cartW, 0);
      charredGrad.addColorStop(0, '#09090b');
      charredGrad.addColorStop(0.3, '#1c1917');
      charredGrad.addColorStop(0.7, '#18181b');
      charredGrad.addColorStop(1, '#050507');

      ctx.fillStyle = charredGrad;
      ctx.beginPath();
      ctx.roundRect(cartX, cartY, cartW, cartH, 2.5 * zoom);
      ctx.fill();

      // Manchas de fuligem preta estourada projetadas para fora da gaveta
      const sootBlast = ctx.createRadialGradient(px, 0, 1 * zoom, px, 0, cartW * 1.5);
      sootBlast.addColorStop(0, 'rgba(5, 5, 8, 0.95)');
      sootBlast.addColorStop(0.5, 'rgba(24, 24, 27, 0.7)');
      sootBlast.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = sootBlast;
      ctx.beginPath();
      ctx.arc(px, 0, cartW * 1.4, 0, Math.PI * 2);
      ctx.fill();

      // Terminais metálicos (caps) descoloridos e oxidados pelo arco de queima
      [-cartH / 2, cartH / 2 - 5 * zoom].forEach(capY => {
        ctx.fillStyle = '#292524';
        ctx.fillRect(cartX, capY, cartW, 5 * zoom);
        ctx.strokeStyle = '#44403c';
        ctx.strokeRect(cartX, capY, cartW, 5 * zoom);
      });

      // VISOR ÓTICO CENTRAL COM O FILAMENTO ROMPIDO
      const winW = cartW * 0.75;
      const winH = 8 * zoom;
      const winY = -winH / 2;

      // Fundo escuro do visor chamuscado por vapor de prata/cobre
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(px - winW / 2, winY, winW, winH);
      ctx.strokeStyle = '#450a0a';
      ctx.lineWidth = 0.8 * zoom;
      ctx.strokeRect(px - winW / 2, winY, winW, winH);

      // FILAMENTO ROMPIDO: pontas fundidas separadas por gap aberto
      ctx.save();
      // Ponta esquerda do elo fusível com gota esférica de cobre fundido
      ctx.strokeStyle = '#ea580c';
      ctx.lineWidth = 1.3 * zoom;
      ctx.beginPath();
      ctx.moveTo(px - winW * 0.45, 0);
      ctx.lineTo(px - 1.8 * zoom, -0.8 * zoom);
      ctx.stroke();

      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.arc(px - 1.8 * zoom, -0.8 * zoom, 1.2 * zoom, 0, Math.PI * 2);
      ctx.fill();

      // Ponta direita do elo fusível com gota esférica de cobre fundido
      ctx.strokeStyle = '#ea580c';
      ctx.beginPath();
      ctx.moveTo(px + winW * 0.45, 0);
      ctx.lineTo(px + 1.8 * zoom, 0.8 * zoom);
      ctx.stroke();

      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.arc(px + 1.8 * zoom, 0.8 * zoom, 1.2 * zoom, 0, Math.PI * 2);
      ctx.fill();

      // Trincas no vidro do visor por pressão interna de arco
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 0.5 * zoom;
      ctx.beginPath();
      ctx.moveTo(px - 3 * zoom, -winH * 0.4);
      ctx.lineTo(px, winH * 0.4);
      ctx.lineTo(px + 3 * zoom, -winH * 0.2);
      ctx.stroke();
      ctx.restore();
    } else {
      // Cartucho cerâmico esteatita branco original
      const ceramicGrad = ctx.createLinearGradient(cartX, 0, cartX + cartW, 0);
      ceramicGrad.addColorStop(0, '#e2e8f0');
      ceramicGrad.addColorStop(0.3, '#ffffff');
      ceramicGrad.addColorStop(0.7, '#f8fafc');
      ceramicGrad.addColorStop(1, '#cbd5e1');

      ctx.fillStyle = ceramicGrad;
      ctx.beginPath();
      ctx.roundRect(cartX, cartY, cartW, cartH, 2.5 * zoom);
      ctx.fill();

      // Caps metálicos niquelados prateados nas extremidades
      [-cartH / 2, cartH / 2 - 5 * zoom].forEach(capY => {
        const capGrad = ctx.createLinearGradient(cartX, 0, cartX + cartW, 0);
        capGrad.addColorStop(0, '#94a3b8');
        capGrad.addColorStop(0.5, '#f1f5f9');
        capGrad.addColorStop(1, '#64748b');
        ctx.fillStyle = capGrad;
        ctx.fillRect(cartX, capY, cartW, 5 * zoom);
      });

      // Visor de inspeção com elo fusível intacto
      const winW = cartW * 0.75;
      const winH = 7 * zoom;
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(px - winW / 2, -winH / 2, winW, winH);
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 0.6 * zoom;
      ctx.strokeRect(px - winW / 2, -winH / 2, winW, winH);

      // Elo fusível intacto contínuo prateado
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1.2 * zoom;
      ctx.beginPath();
      ctx.moveTo(px - winW * 0.42, 0);
      ctx.lineTo(px + winW * 0.42, 0);
      ctx.stroke();
    }
  }

  // RÓTULO TEXTUAL NORMATIVO
  ctx.save();
  ctx.textAlign = 'center';
  if (isTrip) {
    ctx.fillStyle = '#ef4444';
    ctx.font = `bold ${Math.max(6.5, 7.5 * zoom)}px sans-serif`;
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 8 * zoom;
    ctx.fillText('FUSÍVEL ROMPIDO (I²t)', 0, ch / 2 - 7 * zoom);
  } else {
    ctx.fillStyle = '#38bdf8';
    ctx.font = `bold ${Math.max(6, 7 * zoom)}px sans-serif`;
    ctx.fillText(`FUSÍVEL ${inA}A gG`, 0, ch / 2 - 7 * zoom);
  }
  ctx.restore();
}

// ----------------------------------------------------------------------------
// CONTATOR DE POTÊNCIA INDUSTRIAL ULTRA-REALISTA 3D (PADRÃO TESYS / ABB AF)
// Carcaça Bipartida, Êmbolo Central Móvel com Deslocamento Real, Barreiras de Arco
// ----------------------------------------------------------------------------
export function renderIndustrialTeSysContactor(
  ctx: CanvasRenderingContext2D,
  c: any,
  d: any,
  st: any,
  cw: number,
  ch: number,
  zoom: number
) {
  const isEnergized = Boolean(st?.energized);
  const coilV = c?.params?.coil || 230;
  const ac3Current = c?.params?.ac3Current || c?.params?.current || 25;
  const brandName = (c?.brand || c?.brandName || 'Schneider Electric').toString();
  const shortBrand = REAL_BRANDS[brandName as DeviceBrand]?.shortName || brandName.split(' ')[0];

  // 1. CHASSI TRASEIRO DE FIXAÇÃO DIN TH35 COM TRAVAS METÁLICAS
  const baseW = cw;
  const baseH = ch;
  
  // Abas de fixação traseiras
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.roundRect(-baseW / 2, -baseH / 2 - 3 * zoom, baseW, baseH + 6 * zoom, 4 * zoom);
  ctx.fill();
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1.2 * zoom;
  ctx.stroke();

  // Travas de trilho DIN no topo e na base
  [-baseH / 2 - 2 * zoom, baseH / 2 + 1 * zoom].forEach(ty => {
    ctx.fillStyle = '#64748b';
    ctx.fillRect(-12 * zoom, ty, 24 * zoom, 2 * zoom);
  });

  // 2. CORPO PRINCIPAL EM TERMOPLÁSTICO INDUSTRIAL AUTOEXTINGUÍVEL
  const bodyGrad = ctx.createLinearGradient(-cw / 2, -ch / 2, cw / 2, ch / 2);
  bodyGrad.addColorStop(0, '#334155');
  bodyGrad.addColorStop(0.12, '#1e293b');
  bodyGrad.addColorStop(0.85, '#0f172a');
  bodyGrad.addColorStop(1, '#020617');

  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.roundRect(-cw / 2, -ch / 2, cw, ch, 6 * zoom);
  ctx.fill();
  ctx.strokeStyle = isEnergized ? '#10b981' : '#475569';
  ctx.lineWidth = isEnergized ? 2.2 * zoom : 1.4 * zoom;
  ctx.stroke();

  // Ranhuras laterais de descompressão da câmara de extinção de arco
  [-cw / 2 + 1 * zoom, cw / 2 - 4 * zoom].forEach(sx => {
    for (let i = -2; i <= 2; i++) {
      ctx.fillStyle = '#020617';
      ctx.fillRect(sx, i * 8 * zoom - 1.5 * zoom, 3 * zoom, 3 * zoom);
    }
  });

  // 3. BARREIRAS ISOLANTES ENTRE FASES (EVITA CURTO-CIRCUITO POR ARCO)
  const sepW = 1.8 * zoom;
  const sepH = 14 * zoom;
  [-cw * 0.09, cw * 0.09, cw * 0.25].forEach(bx => {
    // Barreira superior
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(bx - sepW / 2, -ch / 2 + 2 * zoom, sepW, sepH);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 0.8 * zoom;
    ctx.strokeRect(bx - sepW / 2, -ch / 2 + 2 * zoom, sepW, sepH);

    // Barreira inferior
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(bx - sepW / 2, ch / 2 - sepH - 2 * zoom, sepW, sepH);
    ctx.strokeRect(bx - sepW / 2, ch / 2 - sepH - 2 * zoom, sepW, sepH);
  });

  // 4. BLOCO FRONTAL REBAIXADO (PAINEL DO CONTROLADOR)
  const panelW = cw * 0.74;
  const panelH = ch * 0.54;
  const panelY = 0;

  const panelGrad = ctx.createLinearGradient(0, panelY - panelH / 2, 0, panelY + panelH / 2);
  panelGrad.addColorStop(0, '#0f172a');
  panelGrad.addColorStop(1, '#020617');
  ctx.fillStyle = panelGrad;
  ctx.beginPath();
  ctx.roundRect(-panelW / 2, panelY - panelH / 2, panelW, panelH, 4 * zoom);
  ctx.fill();
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1 * zoom;
  ctx.stroke();

  // 5. ÊMBOLO MECÂNICO CENTRAL MÓVEL (AMORTIZADOR E INDICADOR DE ATRACAMENTO)
  const plungerW = panelW * 0.62;
  const plungerH = 26 * zoom;
  const plungerY = panelY - 2 * zoom;

  // Caixa guia rebaixada do êmbolo
  ctx.fillStyle = '#020617';
  ctx.beginPath();
  ctx.roundRect(-plungerW / 2, plungerY - plungerH / 2, plungerW, plungerH, 3 * zoom);
  ctx.fill();
  ctx.strokeStyle = '#1e293b';
  ctx.stroke();

  // Deslocamento físico real do êmbolo: retrai quando atracado
  const plungeOffset = isEnergized ? 3.5 * zoom : 0;
  const pGrad = ctx.createLinearGradient(0, plungerY - plungerH / 2, 0, plungerY + plungerH / 2);
  if (isEnergized) {
    pGrad.addColorStop(0, '#065f46');
    pGrad.addColorStop(0.35, '#047857');
    pGrad.addColorStop(1, '#022c22');
  } else {
    pGrad.addColorStop(0, '#64748b');
    pGrad.addColorStop(0.4, '#475569');
    pGrad.addColorStop(0.85, '#1e293b');
    pGrad.addColorStop(1, '#0f172a');
  }

  ctx.fillStyle = pGrad;
  ctx.beginPath();
  ctx.roundRect(
    -plungerW / 2 + 2 * zoom,
    plungerY - plungerH / 2 + plungeOffset + 1 * zoom,
    plungerW - 4 * zoom,
    plungerH - plungeOffset - 2 * zoom,
    2 * zoom
  );
  ctx.fill();
  ctx.strokeStyle = isEnergized ? '#10b981' : '#64748b';
  ctx.lineWidth = 1 * zoom;
  ctx.stroke();

  // Trilho de engate de bloco auxiliar frontal
  ctx.fillStyle = isEnergized ? '#022c22' : '#0f172a';
  ctx.fillRect(-plungerW * 0.35, plungerY - 3 * zoom + plungeOffset, plungerW * 0.7, 6 * zoom);

  // Indicador mecânico visível no centro do êmbolo
  ctx.fillStyle = isEnergized ? '#34d399' : '#f8fafc';
  ctx.font = `black ${Math.max(7.5, 9 * zoom)}px monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(isEnergized ? 'I • ON' : 'O • OFF', 0, plungerY + plungeOffset);

  // 6. SINALIZAÇÃO DOS BORNES DA BOBINA (A1 NO TOPO / A2 NA BASE)
  ctx.font = `bold ${Math.max(5.5, 6.5 * zoom)}px monospace`;
  ctx.fillStyle = isEnergized ? '#34d399' : '#38bdf8';
  ctx.fillText(`A1 (${coilV}V)`, -cw * 0.38, -ch * 0.30);
  ctx.fillText('A2', -cw * 0.38, ch * 0.32);

  // 7. SINALIZAÇÃO DOS CONTATOS AUXILIARES INTEGRADOS (13-14 NA / 21-22 NF)
  ctx.fillStyle = '#34d399';
  ctx.fillText('13-14 NA', cw * 0.36, -ch * 0.30);
  ctx.fillStyle = '#f87171';
  ctx.fillText('21-22 NF', cw * 0.36, ch * 0.32);

  // 8. PLAQUETA TÉCNICA FRONTAL COM ESPECIFICAÇÃO DE ENGENHARIA IEC
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${Math.max(6.5, 7.5 * zoom)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText(
    `${shortBrand.toUpperCase()} • LC1D${ac3Current}`,
    0,
    ch / 2 - 13 * zoom
  );

  ctx.fillStyle = isEnergized ? '#34d399' : '#94a3b8';
  ctx.font = `bold ${Math.max(5.5, 6.5 * zoom)}px monospace`;
  ctx.fillText(
    isEnergized ? `BOBINA ATRACADA • AC-3: ${ac3Current}A` : `AC-3: ${ac3Current}A • DESENERGIZADO`,
    0,
    ch / 2 - 5 * zoom
  );
}

export function renderCommercialAuxBlock(
  ctx: CanvasRenderingContext2D,
  c: any,
  st: DeviceSimulationState,
  cw: number,
  ch: number,
  zoom: number
) {
  ctx.fillStyle = '#334155';
  ctx.beginPath();
  ctx.roundRect(-cw / 2, -ch / 2, cw, ch, 4 * zoom);
  ctx.fill();
  ctx.strokeStyle = '#64748b';
  ctx.stroke();

  ctx.fillStyle = '#0f172a';
  ctx.fillRect(-cw * 0.4, -ch * 0.25, cw * 0.8, ch * 0.5);

  ctx.fillStyle = '#f8fafc';
  ctx.font = `bold ${Math.max(6.5, 7.5 * zoom)}px monospace`;
  ctx.textAlign = 'center';
  ctx.fillText('BLOCO FRONTAL (2NA + 2NF)', 0, -3 * zoom);
  ctx.fillStyle = '#94a3b8';
  ctx.font = `bold ${Math.max(5.5, 6.5 * zoom)}px monospace`;
  ctx.fillText('53-54 / 61-62 / 71-72 / 83-84', 0, 7 * zoom);
}

export function renderCommercialIceCubeRelay(
  ctx: CanvasRenderingContext2D,
  c: any,
  st: DeviceSimulationState,
  cw: number,
  ch: number,
  zoom: number
) {
  const isEnergized = Boolean(st.energized);
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.roundRect(-cw / 2, ch * 0.15, cw, ch * 0.35, 3 * zoom);
  ctx.fill();

  const domeW = cw * 0.86;
  const domeH = ch * 0.65;
  const domeY = -ch * 0.18;
  ctx.fillStyle = isEnergized ? 'rgba(16, 185, 129, 0.25)' : 'rgba(203, 213, 225, 0.2)';
  ctx.beginPath();
  ctx.roundRect(-domeW / 2, domeY - domeH / 2, domeW, domeH, 4 * zoom);
  ctx.fill();
  ctx.strokeStyle = isEnergized ? '#10b981' : '#94a3b8';
  ctx.stroke();

  ctx.fillStyle = '#b45309';
  ctx.fillRect(-domeW * 0.25, domeY - domeH * 0.2, domeW * 0.5, domeH * 0.4);
}

export function renderCommercialDinTimer(
  ctx: CanvasRenderingContext2D,
  c: any,
  st: DeviceSimulationState,
  cw: number,
  ch: number,
  zoom: number
) {
  const isTimerOn = Boolean(st.energized);
  const mode = c.code === 'TIMER_STAR_DELTA' ? 'Y-Δ' : c.code === 'TIMER_TOF' ? 'TOF' : 'TON';

  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.roundRect(-cw / 2, -ch / 2, cw, ch, 4 * zoom);
  ctx.fill();

  const dialR = 12 * zoom;
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(0, -ch * 0.08, dialR, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#38bdf8';
  ctx.stroke();

  ctx.fillStyle = isTimerOn ? '#22c55e' : '#334155';
  ctx.beginPath();
  ctx.arc(-cw * 0.25, -ch * 0.32, 2.5 * zoom, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#cbd5e1';
  ctx.font = `bold ${Math.max(5.5, 6.5 * zoom)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText(`TIMER DIN (${mode})`, 0, -ch / 2 + 9 * zoom);
}

export function renderCommercialDigitalDevice(
  ctx: CanvasRenderingContext2D,
  c: any,
  st: DeviceSimulationState,
  cw: number,
  ch: number,
  zoom: number
) {
  const isThermostat = c.code === 'THERMOSTAT_DIGITAL';
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.roundRect(-cw / 2, -ch / 2, cw, ch, 4 * zoom);
  ctx.fill();

  const dispW = cw * 0.76;
  const dispH = 26 * zoom;
  ctx.fillStyle = '#020617';
  ctx.beginPath();
  ctx.roundRect(-dispW / 2, -ch * 0.26, dispW, dispH, 2 * zoom);
  ctx.fill();

  ctx.fillStyle = isThermostat ? '#ef4444' : '#38bdf8';
  ctx.font = `bold ${Math.max(8.5, 10.5 * zoom)}px 'Courier New', monospace`;
  ctx.textAlign = 'center';
  ctx.fillText(isThermostat ? '45.0 °C' : '14:30 OK', 0, -ch * 0.26 + 17 * zoom);
}

export function renderCommercialPhaseRelay(
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

  [-cw * 0.25, 0, cw * 0.25].forEach((lx, idx) => {
    ctx.fillStyle = isTrip ? '#dc2626' : '#22c55e';
    ctx.beginPath();
    ctx.arc(lx, -ch * 0.18, 3 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#cbd5e1';
    ctx.font = `bold ${Math.max(5.5, 6.5 * zoom)}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText(`L${idx + 1}`, lx, -ch * 0.18 + 10 * zoom);
  });

  ctx.fillStyle = isTrip ? '#ef4444' : '#38bdf8';
  ctx.font = `bold ${Math.max(6, 7 * zoom)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText(isTrip ? 'FALHA DE FASE' : 'RPF • REDE OK', 0, ch / 2 - 8 * zoom);
}

export function renderIndustrialOverloadRelay(
  ctx: CanvasRenderingContext2D,
  c: any,
  st: any,
  cw: number,
  ch: number,
  zoom: number
) {
  const isTrip = Boolean(st?.tripped);
  const inA = c?.params?.current || 16;

  // 1. PINOS DE COBRE DE ENGATE DIRETO NO CONTATOR (1, 3, 5)
  const pinW = 7 * zoom;
  const pinH = 10 * zoom;
  const pinY = -ch / 2 - pinH + 2 * zoom;

  [-cw * 0.28, 0, cw * 0.28].forEach(px => {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(px - pinW / 2 + 1, pinY + 1, pinW, pinH);

    const copperGrad = ctx.createLinearGradient(px - pinW / 2, pinY, px + pinW / 2, pinY);
    copperGrad.addColorStop(0, '#b45309');
    copperGrad.addColorStop(0.3, '#f59e0b');
    copperGrad.addColorStop(0.7, '#d97706');
    copperGrad.addColorStop(1, '#78350f');
    ctx.fillStyle = copperGrad;
    ctx.beginPath();
    ctx.roundRect(px - pinW / 2, pinY, pinW, pinH, 2 * zoom);
    ctx.fill();
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 0.8 * zoom;
    ctx.stroke();

    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(px, pinY + 3.5 * zoom, 1.5 * zoom, 0, Math.PI * 2);
    ctx.fill();
  });

  // 2. CARCAÇA ROBUSTA INDUSTRIAL BI-PARTIDA
  const bodyGrad = ctx.createLinearGradient(-cw / 2, -ch / 2, cw / 2, ch / 2);
  bodyGrad.addColorStop(0, '#1e293b');
  bodyGrad.addColorStop(0.15, '#0f172a');
  bodyGrad.addColorStop(0.85, '#090d16');
  bodyGrad.addColorStop(1, '#020617');

  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.roundRect(-cw / 2, -ch / 2, cw, ch, 6 * zoom);
  ctx.fill();
  ctx.strokeStyle = isTrip ? '#ef4444' : '#475569';
  ctx.lineWidth = isTrip ? 2.5 * zoom : 1.5 * zoom;
  ctx.stroke();

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.roundRect(-cw / 2 + 2 * zoom, -ch / 2 + 2 * zoom, cw - 4 * zoom, ch - 4 * zoom, 4 * zoom);
  ctx.stroke();

  // 3. BLOCO FRONTAL REBAIXADO
  const panW = cw * 0.90;
  const panH = ch * 0.58;
  const panY = -ch * 0.02;

  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.roundRect(-panW / 2, panY - panH / 2, panW, panH, 4 * zoom);
  ctx.fill();
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1.2 * zoom;
  ctx.stroke();

  // 4. DIAL DE REGULAGEM DE CORRENTE AMRELO
  const dialX = -panW * 0.26;
  const dialY = panY - 2 * zoom;
  const dialR = 14 * zoom;

  ctx.fillStyle = '#020617';
  ctx.beginPath();
  ctx.arc(dialX, dialY, dialR + 2.5 * zoom, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#475569';
  ctx.stroke();

  const dialGrad = ctx.createRadialGradient(dialX - 3 * zoom, dialY - 3 * zoom, 1, dialX, dialY, dialR);
  dialGrad.addColorStop(0, '#fef08a');
  dialGrad.addColorStop(0.4, '#eab308');
  dialGrad.addColorStop(0.85, '#ca8a04');
  dialGrad.addColorStop(1, '#854d0e');

  ctx.fillStyle = dialGrad;
  ctx.beginPath();
  ctx.arc(dialX, dialY, dialR, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#713f12';
  ctx.lineWidth = 1.2 * zoom;
  ctx.stroke();

  for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
    ctx.strokeStyle = '#020617';
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(dialX + Math.cos(a) * (dialR * 0.6), dialY + Math.sin(a) * (dialR * 0.6));
    ctx.lineTo(dialX + Math.cos(a) * (dialR * 0.95), dialY + Math.sin(a) * (dialR * 0.95));
    ctx.stroke();
  }

  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 1.6 * zoom;
  ctx.beginPath();
  ctx.moveTo(dialX - dialR * 0.45, dialY);
  ctx.lineTo(dialX + dialR * 0.45, dialY);
  ctx.stroke();

  ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
  ctx.beginPath();
  ctx.arc(dialX, dialY, dialR, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${Math.max(7.5, 9 * zoom)}px monospace`;
  ctx.textAlign = 'center';
  ctx.fillText(`${inA}A`, dialX, dialY + dialR + 8 * zoom);

  // 5. VISOR MECÂNICO DE DISPARO (TRIP FLAG)
  const flagX = panW * 0.04;
  const flagY = panY - 10 * zoom;
  const flagW = 12 * zoom;
  const flagH = 8 * zoom;

  ctx.fillStyle = '#020617';
  ctx.fillRect(flagX - flagW / 2, flagY - flagH / 2, flagW, flagH);
  ctx.fillStyle = isTrip ? '#ef4444' : '#16a34a';
  ctx.fillRect(flagX - flagW / 2 + 1, flagY - flagH / 2 + 1, flagW - 2, flagH - 2);

  // 6. BOTÃO DE RESET AZUL EM RELEVO
  const rstX = panW * 0.28;
  const rstY = panY - 10 * zoom;
  const rstR = 8.5 * zoom;

  const rstGrad = ctx.createRadialGradient(rstX - 2 * zoom, rstY - 2 * zoom, 1, rstX, rstY, rstR);
  rstGrad.addColorStop(0, '#38bdf8');
  rstGrad.addColorStop(0.5, '#0284c7');
  rstGrad.addColorStop(1, '#0369a1');

  ctx.fillStyle = rstGrad;
  ctx.beginPath();
  ctx.arc(rstX, rstY, rstR, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = isTrip ? '#ef4444' : '#ffffff';
  ctx.lineWidth = 1.2 * zoom;
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${Math.max(6, 7 * zoom)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(isTrip ? 'TRIP' : 'RESET', rstX, rstY);

  // 7. BOTÃO DE STOP VERMELHO
  const stopX = panW * 0.28;
  const stopY = panY + 12 * zoom;
  const stopW = 18 * zoom;
  const stopH = 9 * zoom;

  ctx.fillStyle = '#dc2626';
  ctx.beginPath();
  ctx.roundRect(stopX - stopW / 2, stopY - stopH / 2, stopW, stopH, 2 * zoom);
  ctx.fill();
  ctx.strokeStyle = '#991b1b';
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${Math.max(5.5, 6.5 * zoom)}px sans-serif`;
  ctx.fillText('STOP', stopX, stopY);

  // 8. ESPECIFICAÇÃO TÉCNICA E CONTATOS
  ctx.font = `bold ${Math.max(6, 7 * zoom)}px monospace`;
  ctx.fillStyle = '#ef4444';
  ctx.fillText('95-96 NF', -panW * 0.26, -ch / 2 + 10 * zoom);
  ctx.fillStyle = '#22c55e';
  ctx.fillText('97-98 NA', panW * 0.26, -ch / 2 + 10 * zoom);

  ctx.fillStyle = '#94a3b8';
  ctx.font = `bold ${Math.max(6, 7.5 * zoom)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('RELÉ TÉRMICO SOBRECARGA', 0, ch / 2 - 8 * zoom);
}

export function renderCommercialEStop(
  ctx: CanvasRenderingContext2D,
  c: any,
  st: DeviceSimulationState,
  cw: number,
  ch: number,
  zoom: number
) {
  const isTripped = Boolean(st.tripped || st.pressed || !st.closed);
  ctx.fillStyle = '#facc15';
  ctx.beginPath();
  ctx.roundRect(-cw / 2, -ch / 2, cw, ch, 6 * zoom);
  ctx.fill();

  const rM = Math.min(cw, ch) * 0.32;
  ctx.fillStyle = isTripped ? '#991b1b' : '#dc2626';
  ctx.beginPath();
  ctx.arc(0, 0, rM, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#7f1d1d';
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${Math.max(6.5, 7.5 * zoom)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('EMERGENCY', 0, -rM * 0.35);
  ctx.fillText('STOP', 0, rM * 0.35);
}

export function renderCommercialLimitSwitch(
  ctx: CanvasRenderingContext2D,
  c: any,
  st: DeviceSimulationState,
  cw: number,
  ch: number,
  zoom: number
) {
  const isActuated = Boolean(st.actuated);
  ctx.fillStyle = '#334155';
  ctx.beginPath();
  ctx.roundRect(-cw * 0.38, -ch * 0.25, cw * 0.76, ch * 0.65, 3 * zoom);
  ctx.fill();

  ctx.save();
  ctx.translate(0, -ch * 0.25);
  ctx.rotate(isActuated ? 0.35 : -0.2);
  ctx.fillStyle = '#94a3b8';
  ctx.fillRect(-2 * zoom, -18 * zoom, 4 * zoom, 18 * zoom);
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(0, -18 * zoom, 5 * zoom, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function renderCommercialFloatSwitch(
  ctx: CanvasRenderingContext2D,
  c: any,
  st: DeviceSimulationState,
  cw: number,
  ch: number,
  zoom: number
) {
  const isHigh = Boolean(st.high || st.closed);
  ctx.save();
  ctx.rotate(isHigh ? 0.45 : -0.45);
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(-2.5 * zoom, -ch * 0.45, 5 * zoom, 14 * zoom);
  ctx.fillStyle = '#ea580c';
  ctx.beginPath();
  ctx.ellipse(0, 0, 14 * zoom, 22 * zoom, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#c2410c';
  ctx.stroke();
  ctx.restore();
}

export function renderCommercialSensors(
  ctx: CanvasRenderingContext2D,
  c: any,
  st: DeviceSimulationState,
  cw: number,
  ch: number,
  zoom: number
) {
  if (c.code === 'PHOTOCELL') {
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.arc(0, 0, Math.min(cw, ch) * 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.max(6, 7 * zoom)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('FOTOCÉLULA', 0, 0);
  } else {
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.arc(0, 0, Math.min(cw, ch) * 0.36, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#cbd5e1';
    ctx.stroke();
    ctx.fillStyle = st.presenceDetected ? '#ef4444' : '#22c55e';
    ctx.beginPath();
    ctx.arc(0, 0, 3 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0f172a';
    ctx.font = `bold ${Math.max(6, 7 * zoom)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('PIR 360°', 0, ch * 0.26);
  }
}

export function renderCommercialAxialFan(
  ctx: CanvasRenderingContext2D,
  c: any,
  st: DeviceSimulationState,
  cw: number,
  ch: number,
  zoom: number,
  time: number,
  simRunning: boolean
) {
  const isRunning = Boolean(simRunning && st.running);
  const rpm = isRunning ? (st.rpm || 1400) : 0;
  const r = Math.min(cw, ch) * 0.38;

  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = isRunning ? '#10b981' : '#475569';
  ctx.lineWidth = 2 * zoom;
  ctx.stroke();

  const rotAngle = isRunning ? (time * (rpm / 60) * Math.PI * 2) : 0;
  ctx.save();
  ctx.rotate(rotAngle);
  for (let i = 0; i < 5; i++) {
    ctx.fillStyle = isRunning ? '#38bdf8' : '#64748b';
    ctx.beginPath();
    ctx.ellipse(r * 0.5, 0, r * 0.35, r * 0.12, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.rotate((Math.PI * 2) / 5);
  }
  ctx.restore();
}

export function renderCommercialGrounding(
  ctx: CanvasRenderingContext2D,
  c: any,
  cw: number,
  ch: number,
  zoom: number
) {
  if (c.code === 'EARTH_ROD') {
    ctx.fillStyle = '#b45309';
    ctx.fillRect(-3 * zoom, -ch / 2 + 10 * zoom, 6 * zoom, ch - 12 * zoom);
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(-8 * zoom, -ch / 2 + 12 * zoom, 16 * zoom, 10 * zoom);
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.max(6, 7 * zoom)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('HASTE 5/8"', 0, ch / 2 - 4 * zoom);
  } else {
    ctx.fillStyle = '#64748b';
    ctx.beginPath();
    ctx.arc(0, 0, Math.min(cw, ch) * 0.38, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#1e293b';
    ctx.stroke();

    ctx.fillStyle = '#b45309';
    ctx.fillRect(-cw * 0.25, -5 * zoom, cw * 0.5, 10 * zoom);
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.max(6, 7 * zoom)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('CAIXA BEP', 0, ch / 2 - 7 * zoom);
  }
}

export function renderCommercialJunctionBox(
  ctx: CanvasRenderingContext2D,
  cw: number,
  ch: number,
  zoom: number
) {
  ctx.fillStyle = '#334155';
  ctx.beginPath();
  ctx.roundRect(-cw / 2, -ch / 2, cw, ch, 6 * zoom);
  ctx.fill();

  [-cw * 0.24, 0, cw * 0.24].forEach((wx) => {
    ctx.fillStyle = 'rgba(241, 245, 249, 0.4)';
    ctx.fillRect(wx - 7 * zoom, -12 * zoom, 14 * zoom, 24 * zoom);
    ctx.fillStyle = '#f97316';
    ctx.fillRect(wx - 5 * zoom, -10 * zoom, 10 * zoom, 8 * zoom);
  });
}

export function renderCommercialAppliances(
  ctx: CanvasRenderingContext2D,
  c: any,
  st: DeviceSimulationState,
  cw: number,
  ch: number,
  zoom: number
) {
  const isOperating = Boolean(st.energized);
  if (c.code === 'LOAD_AC') {
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.roundRect(-cw / 2, -ch / 2, cw, ch, 5 * zoom);
    ctx.fill();
    ctx.strokeStyle = '#cbd5e1';
    ctx.stroke();

    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(-cw * 0.46, ch * 0.22, cw * 0.92, 6 * zoom);

    ctx.fillStyle = isOperating ? '#38bdf8' : '#94a3b8';
    ctx.font = `bold ${Math.max(8, 10 * zoom)}px 'Courier New', monospace`;
    ctx.textAlign = 'right';
    ctx.fillText(isOperating ? '22°C' : '--°C', cw * 0.38, -ch * 0.1);
  } else {
    ctx.fillStyle = '#020617';
    ctx.beginPath();
    ctx.roundRect(-cw / 2, -ch / 2, cw, ch, 4 * zoom);
    ctx.fill();

    [-cw * 0.24, cw * 0.24].forEach(zx => {
      ctx.strokeStyle = isOperating ? '#dc2626' : '#334155';
      ctx.lineWidth = 1.5 * zoom;
      ctx.beginPath();
      ctx.arc(zx, 0, 16 * zoom, 0, Math.PI * 2);
      ctx.stroke();
    });
  }
}

export function renderCommercialDimmer(
  ctx: CanvasRenderingContext2D,
  c: any,
  st: DeviceSimulationState,
  cw: number,
  ch: number,
  zoom: number
) {
  const pct = Number(c.params?.percent ?? st.percent ?? 100);
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.roundRect(-cw / 2, -ch / 2, cw, ch, 6 * zoom);
  ctx.fill();

  const knobR = Math.min(cw, ch) * 0.32;
  ctx.strokeStyle = '#0284c7';
  ctx.lineWidth = 3 * zoom;
  ctx.beginPath();
  ctx.arc(0, 0, knobR + 5 * zoom, -Math.PI * 0.8, -Math.PI * 0.8 + (pct / 100) * Math.PI * 1.6);
  ctx.stroke();

  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(0, 0, knobR, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#38bdf8';
  ctx.font = `bold ${Math.max(7.5, 9 * zoom)}px monospace`;
  ctx.textAlign = 'center';
  ctx.fillText(`${pct}%`, 0, ch / 2 - 8 * zoom);
}

export function renderCommercialRotaryCamSelector(
  ctx: CanvasRenderingContext2D,
  c: any,
  st: DeviceSimulationState,
  cw: number,
  ch: number,
  zoom: number
) {
  const pos = Number(c.params?.position ?? st.position ?? 0);
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.roundRect(-cw / 2, -ch / 2, cw, ch, 6 * zoom);
  ctx.fill();

  const fR = Math.min(cw, ch) * 0.34;
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(0, 0, fR, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#cbd5e1';
  ctx.font = `bold ${Math.max(6, 7 * zoom)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('MAN', -fR * 0.7, -fR * 0.6);
  ctx.fillText('0', 0, -fR * 0.8);
  ctx.fillText('AUTO', fR * 0.7, -fR * 0.6);

  ctx.save();
  ctx.rotate(pos === 1 ? -0.7 : pos === 2 ? 0.7 : 0);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(-2 * zoom, -fR * 0.8, 4 * zoom, fR * 1.6);
  ctx.restore();
}

// ----------------------------------------------------------------------------
// MOTOR TRIFÁSICO MIT HEAVY-DUTY INDUSTRIAL ULTRA-REALISTA (WEG W22 IE3 400V)
// Carcaça Aletada em Ferro Fundido, Prensa-Cabos, Olhal DIN 580, Eixo Retificado e Pés B3
// Efeitos: Estremecimento Proporcional ao RPM, Giro da Patilha (CW/CCW) e Seta Circular
// ----------------------------------------------------------------------------
export function renderIndustrialWegMotor(
  ctx: CanvasRenderingContext2D,
  c: any,
  d: any,
  st: any,
  cw: number,
  ch: number,
  zoom: number,
  time: number,
  simRunning: boolean
) {
  // 1. DETECÇÃO ROBUSTA DE FUNCIONAMENTO (imune a st.rpm undefined)
  const isRunning = Boolean(
    (simRunning && (st?.running || st?.energized || (st?.voltage && st.voltage > 50) || (st?.current && st.current > 0.05))) ||
    st?.running ||
    st?.energized ||
    c?.params?.running
  );

  const nominalRpm = Number(c?.params?.rpm || 2920);
  const rawRpm = Number(st?.rpm) > 0 ? Number(st?.rpm) : nominalRpm;
  const rpm = isRunning ? rawRpm : 0;
  const pNom = Number(c?.params?.power || 7500);
  const pKw = (pNom / 1000).toFixed(1);
  const pCv = ((pNom / 1000) * 1.36).toFixed(1);
  const vNom = c?.params?.voltage || 400;
  const brandName = (c?.brand || c?.brandName || 'WEG W22 Premium').toString();

  // Sentido de rotação: 1 = Horário (CW / Direto), -1 = Anti-Horário (CCW / Fases Invertidas)
  const isCCW = Boolean(
    st?.rotationDir === 'CCW' ||
    st?.phaseSequence === 'CBA' ||
    st?.phaseSequence === 'BAC' ||
    st?.phaseSequence === 'ACB' ||
    c?.params?.rotationDir === 'CCW' ||
    c?.params?.reverse ||
    st?.reverse ||
    (typeof st?.rpm === 'number' && st?.rpm < 0)
  );
  const dirSign = isCCW ? -1 : 1;

  // Relógio contínuo imune a congelamento
  const animTime = (time !== undefined && time > 0) ? time : (performance.now() * 0.001);

  // 2. FÍSICA DE ESTREMECIMENTO / TREMOR PROPORCIONAL AO RPM
  // Escala quadrática: em repouso = 0; em 2920 RPM = forte vibração mecânica nos pés de apoio
  const speedRatio = Math.min(1.5, Math.abs(rpm) / 2920);
  const vibAmp = isRunning ? (1.2 * speedRatio + 2.8 * Math.pow(speedRatio, 2)) * zoom : 0;
  const vibAngle = animTime * 52 * Math.PI * 2;
  const vibX = isRunning ? (Math.sin(vibAngle) * 0.7 + Math.sin(animTime * 38) * 0.3) * vibAmp : 0;
  const vibY = isRunning ? (Math.cos(vibAngle * 0.92) * 0.55 + Math.cos(animTime * 47) * 0.25) * vibAmp : 0;

  ctx.save();
  ctx.translate(vibX, vibY);

  // 1. SOMBRA DE OCLUSÃO AMBIENTE PROJETADA NO FUNDO
  ctx.save();
  ctx.fillStyle = 'rgba(2, 6, 23, 0.65)';
  ctx.beginPath();
  ctx.ellipse(0, ch * 0.38, cw * 0.46, ch * 0.14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 2. PÉS DE APOIO FUNDIDOS REFORÇADOS (MONTAGEM B3) COM NERVURAS LATERAIS
  const footW = cw * 0.94;
  const footH = 13 * zoom;
  const footY = ch / 2 - footH;

  // Sapatas de apoio
  [-footW * 0.36, footW * 0.36].forEach(fx => {
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(fx - 14 * zoom, footY);
    ctx.lineTo(fx - 20 * zoom, footY + footH);
    ctx.lineTo(fx + 20 * zoom, footY + footH);
    ctx.lineTo(fx + 14 * zoom, footY);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1 * zoom;
    ctx.stroke();

    const fGrad = ctx.createLinearGradient(fx - 18 * zoom, footY, fx + 18 * zoom, footY + footH);
    fGrad.addColorStop(0, '#334155');
    fGrad.addColorStop(0.5, '#1e293b');
    fGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = fGrad;
    ctx.beginPath();
    ctx.roundRect(fx - 18 * zoom, footY + 4 * zoom, 36 * zoom, footH - 4 * zoom, 2 * zoom);
    ctx.fill();
    ctx.strokeStyle = '#475569';
    ctx.stroke();

    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.arc(fx, footY + footH * 0.65, 3.5 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#090d16';
    ctx.lineWidth = 1 * zoom;
    ctx.stroke();

    ctx.fillStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.arc(fx, footY + footH * 0.65, 2.2 * zoom, 0, Math.PI * 2);
    ctx.fill();
  });

  // 3. OLHAL DE IÇAMENTO FORJADO (PADRÃO DIN 580) NO TOPO
  const eyeR = 7.5 * zoom;
  const eyeY = -ch / 2 + 5 * zoom;

  ctx.fillStyle = '#475569';
  ctx.fillRect(-5 * zoom, eyeY + eyeR * 0.7, 10 * zoom, 5 * zoom);
  ctx.strokeStyle = '#1e293b';
  ctx.strokeRect(-5 * zoom, eyeY + eyeR * 0.7, 10 * zoom, 5 * zoom);

  const eyeGrad = ctx.createLinearGradient(-eyeR, eyeY - eyeR, eyeR, eyeY + eyeR);
  eyeGrad.addColorStop(0, '#f1f5f9');
  eyeGrad.addColorStop(0.3, '#cbd5e1');
  eyeGrad.addColorStop(0.7, '#64748b');
  eyeGrad.addColorStop(1, '#334155');
  ctx.fillStyle = eyeGrad;
  ctx.beginPath();
  ctx.arc(0, eyeY, eyeR, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 1.2 * zoom;
  ctx.stroke();

  ctx.fillStyle = '#0a101d';
  ctx.beginPath();
  ctx.arc(0, eyeY, eyeR * 0.48, 0, Math.PI * 2);
  ctx.fill();

  // 4. CORPO DO ESTATOR EM FERRO FUNDIDO ALETADO (AZUL WEG REAL RAL 5009)
  const bodyW = cw * 0.82;
  const bodyH = ch * 0.68;
  const bodyY = -1 * zoom;

  const statorGrad = ctx.createLinearGradient(-bodyW / 2, bodyY - bodyH / 2, bodyW / 2, bodyY + bodyH / 2);
  if (isRunning) {
    statorGrad.addColorStop(0, '#0284c7');
    statorGrad.addColorStop(0.18, '#0369a1');
    statorGrad.addColorStop(0.5, '#075985');
    statorGrad.addColorStop(0.82, '#0369a1');
    statorGrad.addColorStop(1, '#0c4a6e');
  } else {
    statorGrad.addColorStop(0, '#0369a1');
    statorGrad.addColorStop(0.2, '#075985');
    statorGrad.addColorStop(0.55, '#0f3a56');
    statorGrad.addColorStop(0.85, '#082f49');
    statorGrad.addColorStop(1, '#051d2d');
  }

  ctx.fillStyle = statorGrad;
  ctx.beginPath();
  ctx.roundRect(-bodyW / 2, bodyY - bodyH / 2, bodyW, bodyH, 7 * zoom);
  ctx.fill();
  ctx.strokeStyle = isRunning ? '#38bdf8' : '#0284c7';
  ctx.lineWidth = isRunning ? 2.6 * zoom : 1.6 * zoom;
  ctx.stroke();

  // 5. ALETAS DE DISSIPAÇÃO TÉRMICA USINADAS EM PROFUNDIDADE 3D
  const numFins = 9;
  const finStep = (bodyH - 14 * zoom) / (numFins - 1);
  const finStartY = bodyY - bodyH / 2 + 7 * zoom;

  for (let i = 0; i < numFins; i++) {
    const fy = finStartY + i * finStep;

    ctx.strokeStyle = '#02131e';
    ctx.lineWidth = 2.6 * zoom;
    ctx.beginPath();
    ctx.moveTo(-bodyW * 0.48, fy + 0.8 * zoom);
    ctx.lineTo(bodyW * 0.48, fy + 0.8 * zoom);
    ctx.stroke();

    ctx.strokeStyle = isRunning ? '#0284c7' : '#0369a1';
    ctx.lineWidth = 1.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(-bodyW * 0.48, fy);
    ctx.lineTo(bodyW * 0.48, fy);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.48)';
    ctx.lineWidth = 0.9 * zoom;
    ctx.beginPath();
    ctx.moveTo(-bodyW * 0.46, fy - 0.9 * zoom);
    ctx.lineTo(bodyW * 0.46, fy - 0.9 * zoom);
    ctx.stroke();
  }

  // 6. CAIXA DE BORNES INDUSTRIAL IP66 (COM TAMPA PARAFUSADA E PRENSA-CABOS)
  const tBoxW = bodyW * 0.78;
  const tBoxH = 24 * zoom;
  const tBoxY = bodyY - bodyH / 2 + tBoxH / 2 + 2 * zoom;

  const boxGrad = ctx.createLinearGradient(-tBoxW / 2, tBoxY - tBoxH / 2, tBoxW / 2, tBoxY + tBoxH / 2);
  boxGrad.addColorStop(0, '#1e293b');
  boxGrad.addColorStop(0.5, '#0f172a');
  boxGrad.addColorStop(1, '#020617');
  ctx.fillStyle = boxGrad;
  ctx.beginPath();
  ctx.roundRect(-tBoxW / 2, tBoxY - tBoxH / 2, tBoxW, tBoxH, 4 * zoom);
  ctx.fill();
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 1.4 * zoom;
  ctx.stroke();

  const cOff = 3.5 * zoom;
  [
    { x: -tBoxW / 2 + cOff, y: tBoxY - tBoxH / 2 + cOff },
    { x: tBoxW / 2 - cOff, y: tBoxY - tBoxH / 2 + cOff },
    { x: -tBoxW / 2 + cOff, y: tBoxY + tBoxH / 2 - cOff },
    { x: tBoxW / 2 - cOff, y: tBoxY + tBoxH / 2 - cOff }
  ].forEach(sc => {
    ctx.fillStyle = '#64748b';
    ctx.beginPath();
    ctx.arc(sc.x, sc.y, 1.6 * zoom, 0, Math.PI * 2);
    ctx.fill();
  });

  const glandX = -tBoxW / 2 - 5 * zoom;
  ctx.fillStyle = '#94a3b8';
  ctx.fillRect(glandX, tBoxY - 4 * zoom, 6 * zoom, 8 * zoom);
  ctx.fillStyle = '#cbd5e1';
  ctx.fillRect(glandX - 2 * zoom, tBoxY - 5 * zoom, 2 * zoom, 10 * zoom);
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 0.8 * zoom;
  ctx.strokeRect(glandX - 2 * zoom, tBoxY - 5 * zoom, 8 * zoom, 10 * zoom);

  const bqlW = tBoxW - 14 * zoom;
  const bqlH = tBoxH - 6 * zoom;
  ctx.fillStyle = '#451a03';
  ctx.beginPath();
  ctx.roundRect(-bqlW / 2, tBoxY - bqlH / 2, bqlW, bqlH, 2 * zoom);
  ctx.fill();
  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = 1 * zoom;
  ctx.stroke();

  const termXOffsets = [-cw * 0.25, 0, cw * 0.25];
  const termLabels = ['U', 'V', 'W'];

  termXOffsets.forEach((tx, idx) => {
    const brassGrad = ctx.createLinearGradient(tx - 4 * zoom, tBoxY - 4 * zoom, tx + 4 * zoom, tBoxY + 4 * zoom);
    brassGrad.addColorStop(0, '#fef08a');
    brassGrad.addColorStop(0.3, '#f59e0b');
    brassGrad.addColorStop(0.85, '#d97706');
    brassGrad.addColorStop(1, '#78350f');

    ctx.fillStyle = brassGrad;
    ctx.beginPath();
    ctx.arc(tx, tBoxY - 1 * zoom, 4.2 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 0.9 * zoom;
    ctx.stroke();

    ctx.fillStyle = '#020617';
    ctx.beginPath();
    ctx.arc(tx, tBoxY - 1 * zoom, 1.5 * zoom, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fde047';
    ctx.font = `black ${Math.max(6, 7.5 * zoom)}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(termLabels[idx], tx, tBoxY + 7.5 * zoom);
  });

  // 7. BORNE DE ATERRAMENTO DA CARCAÇA COM IDENTIFICADOR (PE)
  const peX = bodyW / 2 + 2 * zoom;
  const peY = bodyY;
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.roundRect(peX - 2 * zoom, peY - 7 * zoom, 7 * zoom, 14 * zoom, 2 * zoom);
  ctx.fill();
  ctx.strokeStyle = '#475569';
  ctx.stroke();

  ctx.fillStyle = '#16a34a';
  ctx.beginPath();
  ctx.arc(peX + 2 * zoom, peY, 4 * zoom, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#eab308';
  ctx.lineWidth = 1 * zoom;
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${Math.max(5.5, 6.5 * zoom)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('PE', peX + 2 * zoom, peY + 9 * zoom);

  // 8. FLANGE DIANTEIRA COM TAMPA DE MANCAIS E PARAFUSOS PERIMÉTRICOS
  const shaftCenterY = bodyY + 6 * zoom;
  const flangeR = 19 * zoom;

  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(0, shaftCenterY, flangeR, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1.4 * zoom;
  ctx.stroke();

  for (let a = 0; a < Math.PI * 2; a += Math.PI / 3) {
    const px = Math.cos(a) * (flangeR - 3 * zoom);
    const py = shaftCenterY + Math.sin(a) * (flangeR - 3 * zoom);
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.arc(px, py, 1.4 * zoom, 0, Math.PI * 2);
    ctx.fill();
  }

  // 9. SETA CIRCULAR NORMATIVA INDICANDO O SENTIDO DA ROTAÇÃO (CW OU CCW)
  const arrowRadius = 22.5 * zoom;
  const arcSweep = Math.PI * 1.35; // Arco visível de ~243 graus
  const startAng = isCCW ? (Math.PI * 0.45) : (-Math.PI * 0.9);
  const endAng = isCCW ? (startAng - arcSweep) : (startAng + arcSweep);

  ctx.save();
  ctx.translate(0, shaftCenterY);

  ctx.beginPath();
  ctx.arc(0, 0, arrowRadius, startAng, endAng, isCCW);
  ctx.strokeStyle = isRunning ? (isCCW ? '#f59e0b' : '#10b981') : 'rgba(148, 163, 184, 0.45)';
  ctx.lineWidth = Math.max(1.8, 2.4 * zoom);
  ctx.lineCap = 'round';

  if (isRunning) {
    ctx.shadowColor = isCCW ? '#f59e0b' : '#34d399';
    ctx.shadowBlur = 10 * zoom;
    // Animação de fluxo dinâmico contínuo na direção do giro
    ctx.setLineDash([8 * zoom, 4 * zoom]);
    ctx.lineDashOffset = -dirSign * animTime * 45 * zoom;
  } else {
    ctx.setLineDash([4 * zoom, 4 * zoom]);
  }
  ctx.stroke();
  ctx.setLineDash([]);

  // Cabeça triangular da seta direcional
  const tipX = Math.cos(endAng) * arrowRadius;
  const tipY = Math.sin(endAng) * arrowRadius;
  const tangentAng = endAng + (isCCW ? -Math.PI / 2 : Math.PI / 2);
  const headLen = 7 * zoom;
  const headHalfW = 4 * zoom;

  const leftWingX = tipX - Math.cos(tangentAng) * headLen + Math.sin(tangentAng) * headHalfW;
  const leftWingY = tipY - Math.sin(tangentAng) * headLen - Math.cos(tangentAng) * headHalfW;
  const rightWingX = tipX - Math.cos(tangentAng) * headLen - Math.sin(tangentAng) * headHalfW;
  const rightWingY = tipY - Math.sin(tangentAng) * headLen + Math.cos(tangentAng) * headHalfW;

  ctx.fillStyle = isRunning ? (isCCW ? '#fbbf24' : '#34d399') : '#94a3b8';
  ctx.beginPath();
  ctx.moveTo(tipX + Math.cos(tangentAng) * (1.8 * zoom), tipY + Math.sin(tangentAng) * (1.8 * zoom));
  ctx.lineTo(leftWingX, leftWingY);
  ctx.lineTo(rightWingX, rightWingY);
  ctx.closePath();
  ctx.fill();

  ctx.restore();

  // 10. EIXO EM AÇO FORJADO RETIFICADO COM CHAVETA (PATILHA) GIRATÓRIA ANIMADA
  // Velocidade calibrada sem aliasing estroboscópico de 60Hz (~3.6 voltas/segundo a 2920 RPM)
  const visualRevPerSec = (rpm / 2920) * 3.6;
  const rotAngle = isRunning ? dirSign * (animTime * visualRevPerSec * Math.PI * 2) : 0;
  const shaftR = 12 * zoom;

  ctx.save();
  ctx.translate(0, shaftCenterY);
  ctx.rotate(rotAngle);

  const shaftGrad = ctx.createLinearGradient(-shaftR, -shaftR, shaftR, shaftR);
  shaftGrad.addColorStop(0, '#ffffff');
  shaftGrad.addColorStop(0.2, '#f1f5f9');
  shaftGrad.addColorStop(0.5, '#cbd5e1');
  shaftGrad.addColorStop(0.8, '#64748b');
  shaftGrad.addColorStop(1, '#1e293b');

  ctx.fillStyle = shaftGrad;
  ctx.beginPath();
  ctx.arc(0, 0, shaftR, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#020617';
  ctx.lineWidth = 1.2 * zoom;
  ctx.stroke();

  ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.arc(0, 0, shaftR * 0.65, 0, Math.PI * 2);
  ctx.stroke();

  // Chaveta / Patilha metálica retangular animada
  ctx.fillStyle = isRunning ? (isCCW ? '#d97706' : '#0284c7') : '#0369a1';
  ctx.fillRect(-2.2 * zoom, -shaftR, 4.4 * zoom, shaftR * 0.78);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 0.6 * zoom;
  ctx.strokeRect(-2.2 * zoom, -shaftR, 4.4 * zoom, shaftR * 0.78);
  ctx.restore();

  // 11. PLACA DE IDENTIFICAÇÃO INDUSTRIAL REBITADA
  const tagW = bodyW * 0.86;
  const tagH = 15 * zoom;
  const tagY = ch / 2 - 13 * zoom;

  const tagGrad = ctx.createLinearGradient(-tagW / 2, tagY - tagH / 2, tagW / 2, tagY + tagH / 2);
  tagGrad.addColorStop(0, '#f8fafc');
  tagGrad.addColorStop(0.3, '#e2e8f0');
  tagGrad.addColorStop(0.7, '#cbd5e1');
  tagGrad.addColorStop(1, '#94a3b8');

  ctx.fillStyle = tagGrad;
  ctx.beginPath();
  ctx.roundRect(-tagW / 2, tagY - tagH / 2, tagW, tagH, 2 * zoom);
  ctx.fill();
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 1 * zoom;
  ctx.stroke();

  const rOffX = tagW / 2 - 2.5 * zoom;
  const rOffY = tagH / 2 - 2.5 * zoom;
  [
    { x: -rOffX, y: tagY - rOffY },
    { x: rOffX, y: tagY - rOffY },
    { x: -rOffX, y: tagY + rOffY },
    { x: rOffX, y: tagY + rOffY }
  ].forEach(rb => {
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.arc(rb.x, rb.y, 1.2 * zoom, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.fillStyle = '#0f172a';
  ctx.font = `bold ${Math.max(6.5, 7.5 * zoom)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText(
    `${brandName.toUpperCase()} • ${pKw}kW (${pCv}CV) • ${vNom}V 3~`,
    0,
    tagY - 2 * zoom
  );

  const dirLabel = isCCW ? 'ANTI-HORÁRIO ⟲ (FASES INVERTIDAS)' : 'HORÁRIO ⟳ (DIRETO)';
  ctx.fillStyle = isRunning ? (isCCW ? '#b45309' : '#15803d') : '#475569';
  ctx.font = `bold ${Math.max(5.5, 6.5 * zoom)}px monospace`;
  ctx.fillText(
    isRunning ? `${Math.round(Math.abs(rpm))} RPM • ${dirLabel}` : 'MOTOR 3F MIT (U - V - W) • PRONTO',
    0,
    tagY + 5.5 * zoom
  );

  ctx.restore();
}

// ----------------------------------------------------------------------------
// MOTOR TRIFÁSICO DE 6 PONTAS ULTRA-ROBUSTO 3D (WEG W22 INDUSTRIAL Y-Δ)
// Carcaça Azul WEG Aletada, Placa de 6 Bornes com Pontes de Latão e Eixo Polido
// ----------------------------------------------------------------------------
export function renderCommercialMotor6Lead(
  ctx: CanvasRenderingContext2D,
  c: any,
  st: any,
  cw: number,
  ch: number,
  zoom: number,
  time: number,
  simRunning: boolean
) {
  const isRunning = Boolean(simRunning && st?.running && (st?.rpm || 0) > 0);
  const rpm = isRunning ? (st?.rpm || 0) : 0;
  const pNom = Number(c?.params?.power || 11000);
  const pKw = (pNom / 1000).toFixed(1);
  const pCv = ((pNom / 1000) * 1.36).toFixed(1);
  const connection = (c?.params?.connection || st?.connection || 'none').toString().toUpperCase();
  const brandName = (c?.brand || c?.brandName || 'WEG W22 Heavy Duty').toString();

  // 1. PÉS DE FIXAÇÃO INFERIORES EM FERRO FUNDIDO COM CHUMBADORES
  const footW = cw * 0.92;
  const footH = 10 * zoom;
  const footY = ch / 2 - footH;

  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.roundRect(-footW / 2, footY, footW, footH, 3 * zoom);
  ctx.fill();
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1.4 * zoom;
  ctx.stroke();

  // Parafusos sextavados de ancoragem com arruelas nos 4 cantos dos pés
  [-footW * 0.42, -footW * 0.28, footW * 0.28, footW * 0.42].forEach(bx => {
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.arc(bx, footY + footH / 2, 2.5 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#020617';
    ctx.lineWidth = 0.8 * zoom;
    ctx.stroke();
  });

  // 2. OLHAL DE IÇAMENTO NO TOPO (AÇO FORJADO CROMADO)
  const eyeR = 7 * zoom;
  const eyeY = -ch / 2 + 5 * zoom;
  ctx.fillStyle = '#94a3b8';
  ctx.beginPath();
  ctx.arc(0, eyeY, eyeR, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1.2 * zoom;
  ctx.stroke();
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(0, eyeY, eyeR * 0.45, 0, Math.PI * 2);
  ctx.fill();

  // 3. CORPO CILÍNDRICO PRINCIPAL DO ESTATOR (AZUL WEG REAL RAL 5009)
  const bodyW = cw * 0.78;
  const bodyH = ch * 0.70;
  const bodyY = -1 * zoom;

  const statorGrad = ctx.createLinearGradient(-bodyW / 2, bodyY - bodyH / 2, bodyW / 2, bodyY + bodyH / 2);
  statorGrad.addColorStop(0, '#0284c7');
  statorGrad.addColorStop(0.2, '#0369a1');
  statorGrad.addColorStop(0.5, '#075985');
  statorGrad.addColorStop(0.8, '#0369a1');
  statorGrad.addColorStop(1, '#0c4a6e');

  ctx.fillStyle = statorGrad;
  ctx.beginPath();
  ctx.roundRect(-bodyW / 2, bodyY - bodyH / 2, bodyW, bodyH, 8 * zoom);
  ctx.fill();
  ctx.strokeStyle = isRunning ? '#38bdf8' : '#0284c7';
  ctx.lineWidth = isRunning ? 2.5 * zoom : 1.6 * zoom;
  ctx.stroke();

  // 4. ALETAS LONGITUDINAIS DE REFRIGERAÇÃO COM FILETE DE BRILHO METÁLICO
  const numFins = 8;
  const finStep = (bodyH - 12 * zoom) / (numFins - 1);
  const finStartY = bodyY - bodyH / 2 + 6 * zoom;

  for (let i = 0; i < numFins; i++) {
    const fy = finStartY + i * finStep;
    // Ranhura escura da aleta
    ctx.strokeStyle = '#082f49';
    ctx.lineWidth = 2.2 * zoom;
    ctx.beginPath();
    ctx.moveTo(-bodyW * 0.46, fy);
    ctx.lineTo(bodyW * 0.46, fy);
    ctx.stroke();

    // Borda clara superior (reflexo da luz metálica)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(-bodyW * 0.44, fy - 0.8 * zoom);
    ctx.lineTo(bodyW * 0.44, fy - 0.8 * zoom);
    ctx.stroke();
  }

  // 5. CAIXA DE BORNES INDUSTRIAL CENTRAL COM A PLACA DE 6 BORNES (BAQUELITE + LATÃO)
  const tBoxW = bodyW * 0.88;
  const tBoxH = bodyH * 0.52;
  const tBoxY = bodyY;

  // Caixa externa preta com borda chanfrada
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.roundRect(-tBoxW / 2, tBoxY - tBoxH / 2, tBoxW, tBoxH, 4 * zoom);
  ctx.fill();
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 1.4 * zoom;
  ctx.stroke();

  // Placa interna de baquelite marrom
  const bqlW = tBoxW - 6 * zoom;
  const bqlH = tBoxH - 6 * zoom;
  ctx.fillStyle = '#451a03';
  ctx.beginPath();
  ctx.roundRect(-bqlW / 2, tBoxY - bqlH / 2, bqlW, bqlH, 2 * zoom);
  ctx.fill();
  ctx.strokeStyle = '#78350f';
  ctx.stroke();

  // Desenho dos 6 pinos roscados de latão (U1-V1-W1 em cima, W2-U2-V2 embaixo)
  const isDelta = connection.includes('DELTA') || connection.includes('Δ');
  const isStar = connection.includes('STAR') || connection.includes('Y');

  const colOffsets = [-bqlW * 0.30, 0, bqlW * 0.30];
  const rowTopY = tBoxY - bqlH * 0.25;
  const rowBotY = tBoxY + bqlH * 0.25;

  // Se estiver fechado em Estrela (Y): barra horizontal conectando a linha de baixo (W2-U2-V2)
  if (isStar) {
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(colOffsets[0] - 2 * zoom, rowBotY - 2 * zoom, colOffsets[2] - colOffsets[0] + 4 * zoom, 4 * zoom);
    ctx.strokeStyle = '#b45309';
    ctx.strokeRect(colOffsets[0] - 2 * zoom, rowBotY - 2 * zoom, colOffsets[2] - colOffsets[0] + 4 * zoom, 4 * zoom);
  }

  // Se estiver fechado em Triângulo (Δ): 3 barras verticais conectando U1-W2, V1-U2, W1-V2
  if (isDelta) {
    colOffsets.forEach(cx => {
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(cx - 2 * zoom, rowTopY - 2 * zoom, 4 * zoom, rowBotY - rowTopY + 4 * zoom);
      ctx.strokeStyle = '#b45309';
      ctx.strokeRect(cx - 2 * zoom, rowTopY - 2 * zoom, 4 * zoom, rowBotY - rowTopY + 4 * zoom);
    });
  }

  // Pinos de fixação dos 6 bornes
  colOffsets.forEach(cx => {
    [rowTopY, rowBotY].forEach(cy => {
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(cx, cy, 3 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 0.8 * zoom;
      ctx.stroke();

      ctx.fillStyle = '#020617';
      ctx.beginPath();
      ctx.arc(cx, cy, 1.2 * zoom, 0, Math.PI * 2);
      ctx.fill();
    });
  });

  // Identificação do fechamento atual no centro da placa
  ctx.fillStyle = isDelta ? '#fde047' : isStar ? '#38bdf8' : '#cbd5e1';
  ctx.font = `black ${Math.max(6.5, 7.5 * zoom)}px monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(
    isDelta
      ? 'TRIÂNGULO Δ (400V)'
      : isStar
      ? 'ESTRELA Y (690V)'
      : 'PLACA 6 BORNES (Y-Δ)',
    0,
    tBoxY
  );

  // 6. EIXO EM AÇO CROMADO POLIDO COM CHAVETA GIRATÓRIA (CENTRO)
  const rotAngle = isRunning ? (time * (rpm / 60) * Math.PI * 2) : 0;
  const shaftR = 11 * zoom;

  ctx.save();
  ctx.translate(bodyW * 0.38, bodyY);
  ctx.rotate(rotAngle);

  // Eixo usinado
  const shaftGrad = ctx.createLinearGradient(-shaftR, -shaftR, shaftR, shaftR);
  shaftGrad.addColorStop(0, '#ffffff');
  shaftGrad.addColorStop(0.3, '#cbd5e1');
  shaftGrad.addColorStop(0.7, '#64748b');
  shaftGrad.addColorStop(1, '#1e293b');
  ctx.fillStyle = shaftGrad;
  ctx.beginPath();
  ctx.arc(0, 0, shaftR, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 1 * zoom;
  ctx.stroke();

  // Rasgo de chaveta metálico
  ctx.fillStyle = '#0284c7';
  ctx.fillRect(-2 * zoom, -shaftR, 4 * zoom, shaftR * 0.7);
  ctx.restore();

  // 7. PLACA DE CARACTERÍSTICAS TÉCNICAS REBITADA NA BASE
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${Math.max(6.5, 7.5 * zoom)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText(
    `${brandName.toUpperCase()} • ${pKw}kW (${pCv}CV) • ${isRunning ? Math.round(rpm) + ' RPM' : '0 RPM'}`,
    0,
    ch / 2 - 14 * zoom
  );

  ctx.fillStyle = isRunning ? '#34d399' : '#94a3b8';
  ctx.font = `bold ${Math.max(5.5, 6.5 * zoom)}px monospace`;
  ctx.fillText(
    isRunning ? 'MOTOR EM OPERAÇÃO NOMINAL' : 'ESTRELA-TRIÂNGULO (6 PONTAS)',
    0,
    ch / 2 - 5 * zoom
  );
}

export function renderIndustrialCentrifugalPump(
  ctx: CanvasRenderingContext2D,
  c: any,
  st: DeviceSimulationState,
  cw: number,
  ch: number,
  zoom: number,
  time: number,
  simRunning: boolean
) {
  const isRunning = Boolean(simRunning && st.running && (st.rpm || 0) > 0);
  const rpm = isRunning ? (st.rpm || 0) : 0;
  const pNom = Number(c.params?.power || 3000);
  const pKw = (pNom / 1000).toFixed(1);
  const brandName = (c.brand || c.brandName || 'Grundfos / KSB').toString();

  const voluteH = ch * 0.65;
  const motorW = cw * 0.48;
  const motorH = ch * 0.55;

  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.roundRect(-cw * 0.46, ch * 0.32, cw * 0.92, 10 * zoom, 2 * zoom);
  ctx.fill();

  const motorX = cw * 0.18;
  const motorY = 0;
  ctx.fillStyle = isRunning ? '#047857' : '#0284c7';
  ctx.beginPath();
  ctx.roundRect(motorX - motorW / 2, motorY - motorH / 2, motorW, motorH, 4 * zoom);
  ctx.fill();
  ctx.strokeStyle = isRunning ? '#10b981' : '#0284c7';
  ctx.stroke();

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
  for (let y = motorY - motorH * 0.38; y <= motorY + motorH * 0.38; y += 5 * zoom) {
    ctx.beginPath();
    ctx.moveTo(motorX - motorW * 0.42, y);
    ctx.lineTo(motorX + motorW * 0.42, y);
    ctx.stroke();
  }

  const tbW = motorW * 0.72;
  const tbH = 14 * zoom;
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.roundRect(motorX - tbW / 2, motorY - motorH / 2 - tbH + 2 * zoom, tbW, tbH, 2 * zoom);
  ctx.fill();
  ctx.strokeStyle = '#475569';
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${Math.max(5.5, 6.5 * zoom)}px monospace`;
  ctx.textAlign = 'center';
  ctx.fillText('U-V-W • PE', motorX, motorY - motorH / 2 - 3 * zoom);

  const voluteX = -cw * 0.28;
  const voluteY = 2 * zoom;
  const volR = voluteH * 0.46;
  ctx.fillStyle = isRunning ? '#065f46' : '#0369a1';
  ctx.beginPath();
  ctx.arc(voluteX, voluteY, volR, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = isRunning ? '#34d399' : '#38bdf8';
  ctx.lineWidth = 1.8 * zoom;
  ctx.stroke();

  ctx.fillStyle = '#0f172a';
  ctx.fillRect(voluteX - 8 * zoom, voluteY - volR - 12 * zoom, 16 * zoom, 12 * zoom);
  ctx.fillStyle = '#64748b';
  ctx.fillRect(voluteX - 12 * zoom, voluteY - volR - 12 * zoom, 24 * zoom, 4 * zoom);

  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(voluteX, voluteY, volR * 0.5, 0, Math.PI * 2);
  ctx.fill();

  const rotAngle = isRunning ? (time * (rpm / 60) * Math.PI * 2) : 0;
  ctx.save();
  ctx.translate(voluteX, voluteY);
  ctx.rotate(rotAngle);
  for (let b = 0; b < 4; b++) {
    ctx.fillStyle = isRunning ? '#38bdf8' : '#475569';
    ctx.beginPath();
    ctx.arc(volR * 0.22, 0, 3 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.rotate(Math.PI / 2);
  }
  ctx.restore();

  ctx.fillStyle = isRunning ? '#34d399' : '#cbd5e1';
  ctx.font = `bold ${Math.max(6, 7 * zoom)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText(`${brandName} • ${pKw}kW • ${isRunning ? Math.round(rpm) + ' RPM' : 'DESLIGADA'}`, 0, ch / 2 - 8 * zoom);
}

export function renderCommercialSpd(
  ctx: CanvasRenderingContext2D,
  c: any,
  st: DeviceSimulationState,
  cw: number,
  ch: number,
  zoom: number
) {
  const isOk = st.status !== 'red' && !st.tripped;
  const uc = c.params?.uc || 275;
  const inKA = c.params?.in || 20;

  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.roundRect(-cw / 2, -ch / 2, cw, ch, 4 * zoom);
  ctx.fill();
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 1.2 * zoom;
  ctx.stroke();

  const cartW = cw * 0.76;
  const cartH = ch * 0.58;
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.roundRect(-cartW / 2, -cartH / 2, cartW, cartH, 3 * zoom);
  ctx.fill();

  const winW = cartW * 0.52;
  const winH = 7 * zoom;
  const winY = -cartH * 0.22;
  ctx.fillStyle = isOk ? '#16a34a' : '#dc2626';
  ctx.fillRect(-winW / 2, winY - winH / 2, winW, winH);
  ctx.strokeStyle = '#020617';
  ctx.strokeRect(-winW / 2, winY - winH / 2, winW, winH);

  ctx.fillStyle = '#38bdf8';
  ctx.font = `bold ${Math.max(6, 7 * zoom)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('DPS CLASSE II', 0, -ch / 2 + 9 * zoom);

  ctx.fillStyle = '#cbd5e1';
  ctx.font = `bold ${Math.max(5.5, 6.5 * zoom)}px monospace`;
  ctx.fillText(`Uc: ${uc}V~ • In: ${inKA}kA`, 0, ch / 2 - 8 * zoom);
}

export function renderCommercialSpd3(
  ctx: CanvasRenderingContext2D,
  c: any,
  st: DeviceSimulationState,
  cw: number,
  ch: number,
  zoom: number
) {
  const isOk = st.status !== 'red' && !st.tripped;
  const uc = c.params?.uc || 440;
  const inKA = c.params?.in || 40;

  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.roundRect(-cw / 2, -ch / 2, cw, ch, 4 * zoom);
  ctx.fill();
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 1.2 * zoom;
  ctx.stroke();

  const modW = (cw * 0.88) / 4;
  const modH = ch * 0.58;
  const startX = -cw * 0.44 + modW / 2;

  ['L1', 'L2', 'L3', 'N'].forEach((pole, idx) => {
    const px = startX + idx * modW;
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(px - modW * 0.44, -modH / 2, modW * 0.88, modH, 2 * zoom);
    ctx.fill();

    ctx.fillStyle = isOk ? '#16a34a' : '#dc2626';
    ctx.fillRect(px - modW * 0.28, -modH * 0.25, modW * 0.56, 6 * zoom);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = `bold ${Math.max(5.5, 6.5 * zoom)}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText(pole, px, modH * 0.3);
  });

  ctx.fillStyle = '#38bdf8';
  ctx.font = `bold ${Math.max(6, 7 * zoom)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('DPS TETRAPOLAR 3P+N (45kA)', 0, -ch / 2 + 9 * zoom);

  ctx.fillStyle = '#cbd5e1';
  ctx.font = `bold ${Math.max(5.5, 6.5 * zoom)}px monospace`;
  ctx.fillText(`Uc: ${uc}V~ • In: ${inKA}kA • T2`, 0, ch / 2 - 8 * zoom);
}

export function renderCommercialGenerator(
  ctx: CanvasRenderingContext2D,
  c: any,
  st: DeviceSimulationState,
  cw: number,
  ch: number,
  zoom: number,
  time: number,
  simRunning: boolean
) {
  const isRunning = Boolean(simRunning && (st.running || c.params?.running));
  const kva = c.params?.kva || 25;
  const brandName = (c.brand || c.brandName || 'Cummins Power / Cat').toString();

  const vibX = isRunning ? Math.sin(time * 45) * (0.8 * zoom) : 0;
  const vibY = isRunning ? Math.cos(time * 45) * (0.5 * zoom) : 0;

  ctx.save();
  ctx.translate(vibX, vibY);

  const baseH = 12 * zoom;
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.roundRect(-cw / 2, ch / 2 - baseH, cw, baseH, 2 * zoom);
  ctx.fill();

  const canW = cw;
  const canH = ch - baseH - 4 * zoom;
  const canY = -ch / 2 + canH / 2;

  const canGrad = ctx.createLinearGradient(-canW / 2, canY - canH / 2, canW / 2, canY + canH / 2);
  canGrad.addColorStop(0, '#facc15');
  canGrad.addColorStop(0.2, '#eab308');
  canGrad.addColorStop(0.8, '#ca8a04');
  canGrad.addColorStop(1, '#a16207');

  ctx.fillStyle = canGrad;
  ctx.beginPath();
  ctx.roundRect(-canW / 2, canY - canH / 2, canW, canH, 6 * zoom);
  ctx.fill();
  ctx.strokeStyle = '#713f12';
  ctx.lineWidth = 1.4 * zoom;
  ctx.stroke();

  // Escapamento
  const exhX = cw * 0.22;
  const exhY = canY - canH / 2 - 8 * zoom;
  ctx.fillStyle = '#475569';
  ctx.fillRect(exhX - 6 * zoom, exhY, 12 * zoom, 10 * zoom);

  // Grade de ventilação
  const louverX = -cw * 0.26;
  const louverW = cw * 0.28;
  const louverH = canH * 0.55;
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.roundRect(louverX - louverW / 2, canY - louverH / 2, louverW, louverH, 3 * zoom);
  ctx.fill();

  // Painel de controle digital DSE
  const dseX = cw * 0.16;
  const dseW = cw * 0.45;
  const dseH = canH * 0.62;
  ctx.fillStyle = '#020617';
  ctx.beginPath();
  ctx.roundRect(dseX - dseW / 2, canY - dseH / 2, dseW, dseH, 3 * zoom);
  ctx.fill();

  const lcdW = dseW * 0.85;
  const lcdH = dseH * 0.46;
  const lcdY = canY - dseH * 0.18;
  ctx.fillStyle = isRunning ? '#064e3b' : '#1e293b';
  ctx.fillRect(dseX - lcdW / 2, lcdY - lcdH / 2, lcdW, lcdH);

  ctx.fillStyle = isRunning ? '#34d399' : '#ef4444';
  ctx.font = `bold ${Math.max(6.5, 7.5 * zoom)}px 'Courier New', monospace`;
  ctx.textAlign = 'center';
  ctx.fillText(isRunning ? '400V • 50.0Hz' : 'GMG PARADO (OFF)', dseX, lcdY - 3 * zoom);

  ctx.fillStyle = isRunning ? '#a7f3d0' : '#94a3b8';
  ctx.font = `bold ${Math.max(5.5, 6.5 * zoom)}px monospace`;
  ctx.fillText(isRunning ? '1500 RPM • AVR OK' : 'MODO: AUTO / STANDBY', dseX, lcdY + 6 * zoom);

  ctx.fillStyle = '#0f172a';
  ctx.font = `bold ${Math.max(6, 7 * zoom)}px sans-serif`;
  ctx.textAlign = 'left';
  ctx.fillText(`${brandName} • ${kva} kVA`, -canW * 0.42, canY - canH * 0.35);

  ctx.restore();
}

export function renderCommercialMts(
  ctx: CanvasRenderingContext2D,
  c: any,
  st: any,
  cw: number,
  ch: number,
  zoom: number
) {
  const pos = Number(c?.params?.position ?? st?.position ?? 1);
  const brandName = (c?.brand || c?.brandName || 'SOCOMEC').toString();

  // 1. CARCAÇA EXTERNA PESADA (CINZA INDUSTRIAL RAL 7035 COM BORDA 3D)
  ctx.fillStyle = '#cbd5e1';
  ctx.beginPath();
  ctx.roundRect(-cw / 2, -ch / 2, cw, ch, 6 * zoom);
  ctx.fill();
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 2 * zoom;
  ctx.stroke();

  // Placa interna rebaixada em grafite escuro
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.roundRect(-cw * 0.44, -ch * 0.42, cw * 0.88, ch * 0.84, 4 * zoom);
  ctx.fill();
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 1 * zoom;
  ctx.stroke();

  // 2. FAIXAS INDICADORAS DE FONTE (SUPERIOR)
  // Fonte I (Rede)
  ctx.fillStyle = pos === 1 ? '#15803d' : '#1e293b';
  ctx.fillRect(-cw * 0.4, -ch * 0.38, cw * 0.36, 12 * zoom);
  ctx.fillStyle = pos === 1 ? '#86efac' : '#64748b';
  ctx.font = `bold ${Math.max(6, 7 * zoom)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('FONTE I • REDE', -cw * 0.22, -ch * 0.38 + 9 * zoom);

  // Fonte II (Gerador)
  ctx.fillStyle = pos === 2 ? '#0369a1' : '#1e293b';
  ctx.fillRect(cw * 0.04, -ch * 0.38, cw * 0.36, 12 * zoom);
  ctx.fillStyle = pos === 2 ? '#7dd3fc' : '#64748b';
  ctx.fillText('FONTE II • GMG', cw * 0.22, -ch * 0.38 + 9 * zoom);

  // 3. DISCO ROTATIVO CENTRAL (AÇO ESCOVADO)
  const dialY = ch * 0.05;
  const dialR = Math.min(cw, ch) * 0.32;

  ctx.fillStyle = '#e2e8f0';
  ctx.beginPath();
  ctx.arc(0, dialY, dialR, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 1.5 * zoom;
  ctx.stroke();

  // Marcações das 3 posições industriais: I, 0, II
  ctx.font = `bold ${Math.max(8, 10 * zoom)}px monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Posição I (-45°)
  ctx.fillStyle = pos === 1 ? '#15803d' : '#64748b';
  ctx.fillText('I', -dialR * 0.6, dialY - dialR * 0.55);

  // Posição 0 (Centro 0°)
  ctx.fillStyle = pos === 0 ? '#b45309' : '#64748b';
  ctx.fillText('0', 0, dialY - dialR * 0.65);

  // Posição II (+45°)
  ctx.fillStyle = pos === 2 ? '#0284c7' : '#64748b';
  ctx.fillText('II', dialR * 0.6, dialY - dialR * 0.55);

  // 4. GRANDE MANÍPULO ROTATIVO INDUSTRIAL TIPO PISTOLA (VERMELHO)
  // Gira fisicamente: -45° para Rede, 0° para Desligado, +45° para Gerador
  const angle = pos === 1 ? -Math.PI / 4 : pos === 2 ? Math.PI / 4 : 0;

  ctx.save();
  ctx.translate(0, dialY);
  ctx.rotate(angle);

  // Braço da alavanca vermelha
  const hW = 12 * zoom;
  const hLen = dialR * 1.3;
  ctx.fillStyle = '#dc2626';
  ctx.beginPath();
  ctx.roundRect(-hW / 2, -hLen, hW, hLen, 3 * zoom);
  ctx.fill();
  ctx.strokeStyle = '#7f1d1d';
  ctx.lineWidth = 1.2 * zoom;
  ctx.stroke();

  // Cubo central da alavanca com olhal de cadeado amarelo
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(0, 0, dialR * 0.42, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#eab308';
  ctx.lineWidth = 1.5 * zoom;
  ctx.stroke();

  // Seta de indicação na ponta da alavanca
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(0, -hLen - 2 * zoom);
  ctx.lineTo(-4 * zoom, -hLen + 4 * zoom);
  ctx.lineTo(4 * zoom, -hLen + 4 * zoom);
  ctx.closePath();
  ctx.fill();

  ctx.restore();

  // 5. RÓTULOS E ESTADO ATUAL NA PARTE INFERIOR
  ctx.fillStyle = pos === 1 ? '#22c55e' : pos === 2 ? '#38bdf8' : '#eab308';
  ctx.font = `bold ${Math.max(6.5, 7.5 * zoom)}px monospace`;
  ctx.textAlign = 'center';
  ctx.fillText(pos === 1 ? 'STATUS: REDE ATIVA' : pos === 2 ? 'STATUS: GERADOR ATIVO' : 'STATUS: CORTE TOTAL (0)', 0, ch * 0.32);

  ctx.fillStyle = '#64748b';
  ctx.font = `bold ${Math.max(5.5, 6.5 * zoom)}px sans-serif`;
  ctx.fillText(`${brandName} • CHAVE MANUAL I-0-II`, 0, ch / 2 - 5 * zoom);
}

export function renderCommercialAts(
  ctx: CanvasRenderingContext2D,
  c: any,
  st: DeviceSimulationState,
  cw: number,
  ch: number,
  zoom: number
) {
  const isGrid = (c.params?.sourceInUse ?? 'GRID') === 'GRID';
  const gridHealthy = c.params?.gridHealthy !== false;
  const brandName = (c.brand || c.brandName || 'Socomec ATyS / Schneider').toString();

  const gGrad = ctx.createLinearGradient(-cw / 2, -ch / 2, cw / 2, ch / 2);
  gGrad.addColorStop(0, '#e2e8f0');
  gGrad.addColorStop(0.3, '#cbd5e1');
  gGrad.addColorStop(0.8, '#94a3b8');
  gGrad.addColorStop(1, '#64748b');

  ctx.fillStyle = gGrad;
  ctx.beginPath();
  ctx.roundRect(-cw / 2, -ch / 2, cw, ch, 6 * zoom);
  ctx.fill();
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1.6 * zoom;
  ctx.stroke();

  const panW = cw * 0.88;
  const panH = ch * 0.58;
  ctx.fillStyle = '#090d16';
  ctx.beginPath();
  ctx.roundRect(-panW / 2, -panH / 2, panW, panH, 3 * zoom);
  ctx.fill();

  const lineY1 = -panH * 0.22;
  const lineY2 = panH * 0.22;

  ctx.strokeStyle = gridHealthy ? '#22c55e' : '#ef4444';
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(-panW * 0.38, lineY1);
  ctx.lineTo(-panW * 0.08, lineY1);
  ctx.stroke();

  ctx.strokeStyle = !isGrid ? '#f59e0b' : '#64748b';
  ctx.beginPath();
  ctx.moveTo(-panW * 0.38, lineY2);
  ctx.lineTo(-panW * 0.08, lineY2);
  ctx.stroke();

  ctx.strokeStyle = '#38bdf8';
  ctx.beginPath();
  ctx.moveTo(panW * 0.12, 0);
  ctx.lineTo(panW * 0.38, 0);
  ctx.stroke();

  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(-panW * 0.08, isGrid ? lineY1 : lineY2);
  ctx.lineTo(panW * 0.12, 0);
  ctx.stroke();

  ctx.fillStyle = '#1e293b';
  ctx.fillRect(-panW * 0.04, -panH * 0.38, panW * 0.42, 14 * zoom);
  ctx.fillStyle = isGrid ? '#34d399' : '#f59e0b';
  ctx.font = `bold ${Math.max(6, 7 * zoom)}px monospace`;
  ctx.textAlign = 'center';
  ctx.fillText(isGrid ? 'REDE CONCESS. (I)' : 'GERADOR DIESEL (II)', panW * 0.17, -panH * 0.38 + 9 * zoom);

  ctx.fillStyle = '#0f172a';
  ctx.font = `bold ${Math.max(6, 7 * zoom)}px sans-serif`;
  ctx.fillText(`${brandName} • ATS DUAL-POWER MOTORIZADO`, 0, ch / 2 - 8 * zoom);
}

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

  const recW = plateW * 0.76;
  const recH = plateH * 0.72;
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.roundRect(-recW / 2, -recH / 2, recW, recH, 3 * zoom);
  ctx.fill();

  if (c.code === 'THREE_WAY') {
    const keyW = recW - 4 * zoom;
    const keyH = recH - 4 * zoom;
    const pos = Number(c.params?.position ?? st.rockerAngle ?? (st.closed ? 1 : 0));
    const isR2 = pos === 1;

    ctx.fillStyle = isR2 ? '#1e293b' : '#f8fafc';
    ctx.beginPath();
    ctx.roundRect(-keyW / 2, -keyH / 2, keyW, keyH, 3 * zoom);
    ctx.fill();

    ctx.fillStyle = isR2 ? '#38bdf8' : '#0284c7';
    ctx.font = `bold ${Math.max(8, 9.5 * zoom)}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(isR2 ? 'ROTA: R2' : 'ROTA: R1', 0, -4 * zoom);
  } else if (c.code === 'FOUR_WAY') {
    const keyW = recW - 4 * zoom;
    const keyH = recH - 4 * zoom;
    const isCrossed = Boolean(c.params?.crossed ?? st.crossed ?? st.closed);

    ctx.fillStyle = isCrossed ? '#1e293b' : '#f8fafc';
    ctx.beginPath();
    ctx.roundRect(-keyW / 2, -keyH / 2, keyW, keyH, 3 * zoom);
    ctx.fill();

    ctx.fillStyle = isCrossed ? '#f59e0b' : '#10b981';
    ctx.font = `bold ${Math.max(8, 9.5 * zoom)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(isCrossed ? '⤮ CRUZADO' : '⇹ DIRETO', 0, -4 * zoom);
  } else if (c.code === 'SW_DOUBLE') {
    const keyGap = 3 * zoom;
    const keyW = (recW - keyGap - 4 * zoom) / 2;
    const keyH = recH - 4 * zoom;
    const k1 = Boolean(st.closed1 ?? st.closed);
    const k2 = Boolean(st.closed2);

    [-1, 1].forEach((dir, idx) => {
      const kx = dir * (keyW / 2 + keyGap / 2);
      const active = idx === 0 ? k1 : k2;
      ctx.fillStyle = active ? '#334155' : '#f1f5f9';
      ctx.beginPath();
      ctx.roundRect(kx - keyW / 2, -keyH / 2, keyW, keyH, 2.5 * zoom);
      ctx.fill();
      ctx.fillStyle = active ? '#22c55e' : '#64748b';
      ctx.beginPath();
      ctx.arc(kx, active ? keyH * 0.3 : -keyH * 0.3, 2 * zoom, 0, Math.PI * 2);
      ctx.fill();
    });
  } else {
    const keyW = recW - 4 * zoom;
    const keyH = recH - 4 * zoom;
    const isClosed = Boolean(st.closed);
    ctx.fillStyle = isClosed ? '#334155' : '#f8fafc';
    ctx.beginPath();
    ctx.roundRect(-keyW / 2, -keyH / 2, keyW, keyH, 3 * zoom);
    ctx.fill();

    ctx.fillStyle = isClosed ? '#10b981' : '#64748b';
    ctx.beginPath();
    ctx.arc(0, isClosed ? keyH * 0.28 : -keyH * 0.28, 2.5 * zoom, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = '#64748b';
  ctx.font = `bold ${Math.max(5, 6 * zoom)}px monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillText(`${shortBrand.toUpperCase()} • ${inA}A 250V~`, 0, plateH / 2 - 2 * zoom);
}

export function renderCommercialHarmonyPushButton(ctx: CanvasRenderingContext2D, c: any, st: any, cw: number, ch: number, zoom: number) {
  const isNO = c.code === 'PBNO';
  const isPressed = Boolean(st.pressed);
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.roundRect(-cw / 2, -ch / 2, cw, ch, 6 * zoom);
  ctx.fill();

  const rBezel = Math.min(cw, ch) * 0.32;
  ctx.fillStyle = isNO ? '#16a34a' : '#dc2626';
  ctx.beginPath();
  ctx.arc(0, isPressed ? 2 * zoom : 0, rBezel, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${Math.max(8, 10 * zoom)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(isNO ? 'I' : 'O', 0, isPressed ? 2 * zoom : 0);
}

export function renderCommercialCeilingLamp(ctx: CanvasRenderingContext2D, c: any, st: any, cw: number, ch: number, zoom: number) {
  const isLit = Boolean(st.energized && !st.tripped);
  const bulbR = Math.min(cw, ch) * 0.32;
  ctx.fillStyle = isLit ? '#fde047' : '#475569';
  ctx.beginPath();
  ctx.arc(0, 0, bulbR, 0, Math.PI * 2);
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

export function renderCommercialOutlet(ctx: CanvasRenderingContext2D, c: any, st: any, cw: number, ch: number, zoom: number) {
  const plateW = cw;
  const plateH = ch;
  const isEnergized = Boolean(st.energized || st.live);

  const applianceKey = (c.params?.pluggedAppliance || st.appliance || 'NONE').toString().toUpperCase();
  const configuredCurrent = Number(c.params?.current || 0);
  const isPlugged = applianceKey !== 'NONE' || (configuredCurrent > 0 && applianceKey !== 'NONE') || Boolean(c.params?.pluggedAppliance && c.params.pluggedAppliance !== 'NONE');

  // Cálculo da potência física e corrente real da carga conectada
  let appPowerW = 0;
  if (applianceKey === 'PHONE') appPowerW = 20;
  else if (applianceKey === 'HAIR_DRYER') appPowerW = 2000;
  else if (applianceKey === 'SHOWER') appPowerW = 5500;
  else if (applianceKey === 'WELDER') appPowerW = 7500;
  else if (applianceKey === 'CUSTOM') appPowerW = Number(c.params?.customPowerW || 2000);
  else appPowerW = Number(st.appliancePower || 0);

  const vNom = Number(c.params?.voltage || 230);
  const currentA = appPowerW > 0 ? (appPowerW / vNom) : Number(st.current || (isPlugged ? 10 : 0));

  let appName = 'Carga Conectada';
  if (applianceKey === 'PHONE') appName = 'Carregador Celular 20W';
  else if (applianceKey === 'HAIR_DRYER') appName = 'Secador Turbo 2000W';
  else if (applianceKey === 'SHOWER') appName = 'Chuveiro 5500W';
  else if (applianceKey === 'WELDER') appName = 'Inversora Solda 7.5kW';
  else if (applianceKey === 'CUSTOM') appName = `Carga Custom ${appPowerW}W`;
  else if (isPlugged) appName = `Carga ${appPowerW > 0 ? appPowerW + 'W' : ''}`;

  const currentFormatted = currentA < 1 && currentA > 0 ? `${currentA.toFixed(1)}A` : `${Math.round(currentA)}A`;
  const plaqueText = isPlugged ? `${appName} / ${currentFormatted}` : 'TOMADA 2P+T 16A • VAZIA';

  // 1. ESPELHO DA TOMADA (FACEPLATE TERMOPLÁSTICO INDUSTRIAL)
  const plateGrad = ctx.createLinearGradient(0, -plateH / 2, 0, plateH / 2);
  plateGrad.addColorStop(0, '#f8fafc');
  plateGrad.addColorStop(0.5, '#f1f5f9');
  plateGrad.addColorStop(1, '#e2e8f0');

  ctx.fillStyle = plateGrad;
  ctx.beginPath();
  ctx.roundRect(-plateW / 2, -plateH / 2, plateW, plateH, 6 * zoom);
  ctx.fill();
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 1.2 * zoom;
  ctx.stroke();

  // Parafusos decorativos de fixação do espelho
  [-plateW * 0.42, plateW * 0.42].forEach(sx => {
    ctx.fillStyle = '#64748b';
    ctx.beginPath();
    ctx.arc(sx, 0, 1.8 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 0.5 * zoom;
    ctx.stroke();
  });

  // 2. POÇO REBAIXADO DA TOMADA SCHUKO / NBR (CAVITY)
  const cavityR = Math.min(cw, ch) * 0.33;
  const cavityY = -ch * 0.05;

  const cavityGrad = ctx.createRadialGradient(0, cavityY, 2 * zoom, 0, cavityY, cavityR);
  cavityGrad.addColorStop(0, '#090d16');
  cavityGrad.addColorStop(0.75, '#0f172a');
  cavityGrad.addColorStop(1, '#1e293b');

  ctx.fillStyle = cavityGrad;
  ctx.beginPath();
  ctx.arc(0, cavityY, cavityR, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1.2 * zoom;
  ctx.stroke();

  // Molas metálicas de aterramento lateral Schuko
  [-cavityR + 1.2 * zoom, cavityR - 1.2 * zoom].forEach(gx => {
    ctx.fillStyle = '#d97706';
    ctx.fillRect(gx - 1.2 * zoom, cavityY - 3.5 * zoom, 2.4 * zoom, 7 * zoom);
  });

  if (!isPlugged) {
    // Alvéolos vazios (Fase, Terra central NBR, Neutro)
    [-cavityR * 0.52, 0, cavityR * 0.52].forEach(px => {
      ctx.fillStyle = '#020617';
      ctx.beginPath();
      ctx.arc(px, cavityY, 2.6 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 0.6 * zoom;
      ctx.stroke();
    });
  } else {
    // 3. PLUGUE 2P+T MACHO INDUSTRIAL DE BORRACHA PRETA CONECTADO NO CENTRO DO POÇO
    ctx.save();

    // Sombra de profundidade do plugue inserido
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.beginPath();
    ctx.arc(1.5 * zoom, cavityY + 2.5 * zoom, cavityR * 0.88, 0, Math.PI * 2);
    ctx.fill();

    // Corpo circular de borracha vulcanizada preta texturizada
    const rubberR = cavityR * 0.86;
    const plugGrad = ctx.createRadialGradient(0, cavityY - 2 * zoom, 2 * zoom, 0, cavityY, rubberR);
    plugGrad.addColorStop(0, '#27272a');
    plugGrad.addColorStop(0.45, '#18181b');
    plugGrad.addColorStop(0.85, '#09090b');
    plugGrad.addColorStop(1, '#050507');

    ctx.fillStyle = plugGrad;
    ctx.beginPath();
    ctx.arc(0, cavityY, rubberR, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = isEnergized ? 'rgba(34, 197, 94, 0.75)' : '#3f3f46';
    ctx.lineWidth = 1.6 * zoom;
    ctx.stroke();

    // Aletas / ranhuras ergonômicas de empunhadura na borracha
    for (let a = 0; a < 6; a++) {
      const ang = (a / 6) * Math.PI * 2;
      const gX1 = Math.cos(ang) * (rubberR * 0.58);
      const gY1 = cavityY + Math.sin(ang) * (rubberR * 0.58);
      const gX2 = Math.cos(ang) * (rubberR * 0.84);
      const gY2 = cavityY + Math.sin(ang) * (rubberR * 0.84);

      ctx.strokeStyle = '#27272a';
      ctx.lineWidth = 1.2 * zoom;
      ctx.beginPath();
      ctx.moveTo(gX1, gY1);
      ctx.lineTo(gX2, gY2);
      ctx.stroke();
    }

    // Passacabo de borracha cônico central (strain relief boot)
    const bootR = rubberR * 0.42;
    ctx.fillStyle = '#18181b';
    ctx.beginPath();
    ctx.arc(0, cavityY, bootR, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#3f3f46';
    ctx.lineWidth = 0.8 * zoom;
    ctx.stroke();

    // Anéis escalonados de alívio de tensão do passacabo
    [bootR * 0.75, bootR * 0.5].forEach(rStep => {
      ctx.strokeStyle = '#27272a';
      ctx.lineWidth = 0.7 * zoom;
      ctx.beginPath();
      ctx.arc(0, cavityY, rStep, 0, Math.PI * 2);
      ctx.stroke();
    });

    // 4. CABO FLEXÍVEL DE BORRACHA SAINDO DO PLUGUE (NEOPRENE HEAVY DUTY)
    const cableStartX = 0;
    const cableStartY = cavityY + 2 * zoom;
    const cableMidX = 9 * zoom;
    const cableMidY = cavityY + cavityR * 0.95;
    const cableEndX = -3 * zoom;
    const cableEndY = ch * 0.55;

    // Sombra do cabo flexível
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.lineWidth = 6 * zoom;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cableStartX + 2 * zoom, cableStartY + 2.5 * zoom);
    ctx.quadraticCurveTo(cableMidX + 2 * zoom, cableMidY + 2.5 * zoom, cableEndX + 2 * zoom, cableEndY + 2.5 * zoom);
    ctx.stroke();

    // Corpo do cabo de borracha preta
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 5.5 * zoom;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cableStartX, cableStartY);
    ctx.quadraticCurveTo(cableMidX, cableMidY, cableEndX, cableEndY);
    ctx.stroke();

    // Filete 3D de reflexão de luz na curvatura do cabo
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
    ctx.lineWidth = 1.3 * zoom;
    ctx.beginPath();
    ctx.moveTo(cableStartX, cableStartY);
    ctx.quadraticCurveTo(cableMidX - 0.5 * zoom, cableMidY - 0.5 * zoom, cableEndX - 0.5 * zoom, cableEndY);
    ctx.stroke();

    ctx.restore();
  }

  // 5. PLAQUETA DIGITAL 3D IDENTIFICANDO O APARELHO EM CARGA
  const plaqueW = Math.min(plateW * 0.92, 78 * zoom);
  const plaqueH = 14 * zoom;
  const plaqueY = ch * 0.32;

  // Fundo do display tecnológico (OLED / Dark Glassmorphism)
  ctx.save();
  ctx.fillStyle = '#030712';
  ctx.beginPath();
  ctx.roundRect(-plaqueW / 2, plaqueY - plaqueH / 2, plaqueW, plaqueH, 3.5 * zoom);
  ctx.fill();

  ctx.strokeStyle = isPlugged
    ? (isEnergized ? '#10b981' : '#f59e0b')
    : '#475569';
  ctx.lineWidth = 1 * zoom;
  ctx.shadowColor = isPlugged && isEnergized ? '#10b981' : 'transparent';
  ctx.shadowBlur = isPlugged && isEnergized ? 6 * zoom : 0;
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Texto digital na plaqueta
  ctx.fillStyle = isPlugged
    ? (isEnergized ? '#34d399' : '#fbbf24')
    : '#94a3b8';
  ctx.font = `bold ${Math.max(5.5, 6.8 * zoom)}px 'Courier New', monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(isPlugged ? `⚡ ${plaqueText}` : plaqueText, 0, plaqueY);
  ctx.restore();

  // 6. LED DE ALIMENTAÇÃO VERDE NO ESPELHO DA TOMADA
  const ledX = cw / 2 - 9 * zoom;
  const ledY = -ch / 2 + 9 * zoom;
  const ledR = 3 * zoom;

  // Aro cromado metálico do LED
  ctx.fillStyle = '#475569';
  ctx.beginPath();
  ctx.arc(ledX, ledY, ledR + 1 * zoom, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 0.5 * zoom;
  ctx.stroke();

  // Lente do LED (verde vivo com glow quando energizado)
  ctx.save();
  if (isEnergized) {
    ctx.fillStyle = '#22c55e';
    ctx.shadowColor = '#22c55e';
    ctx.shadowBlur = 8 * zoom;
    ctx.beginPath();
    ctx.arc(ledX, ledY, ledR, 0, Math.PI * 2);
    ctx.fill();

    // Ponto especular de brilho
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(ledX - 0.8 * zoom, ledY - 0.8 * zoom, 0.9 * zoom, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillStyle = '#064e3b';
    ctx.beginPath();
    ctx.arc(ledX, ledY, ledR, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

export function renderCommercialMeasurementMeter(
  ctx: CanvasRenderingContext2D,
  c: any,
  st: DeviceSimulationState,
  cw: number,
  ch: number,
  zoom: number
) {
  const code = c.code;
  const brand = (c.brand || 'FLUKE INDUSTRIAL').toUpperCase();

  // 1. Carcaça Industrial de Alta Resistência (Termoplástico DIN / Bancada)
  ctx.save();
  const bgGrad = ctx.createLinearGradient(-cw / 2, -ch / 2, cw / 2, ch / 2);
  bgGrad.addColorStop(0, '#1e293b');
  bgGrad.addColorStop(0.5, '#0f172a');
  bgGrad.addColorStop(1, '#090d16');
  ctx.fillStyle = bgGrad;
  ctx.beginPath();
  ctx.roundRect(-cw / 2, -ch / 2, cw, ch, 5 * zoom);
  ctx.fill();

  // Borda chanfrada de precisão
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1.2 * zoom;
  ctx.stroke();

  // 2. Visor Digital OLED / VFD de Alta Visibilidade
  const dispW = cw * 0.88;
  const dispH = ch * 0.52;
  const dispY = -ch * 0.05;

  ctx.fillStyle = '#020617';
  ctx.beginPath();
  ctx.roundRect(-dispW / 2, dispY - dispH / 2, dispW, dispH, 3.5 * zoom);
  ctx.fill();

  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1 * zoom;
  ctx.stroke();

  // Grade de fundo sutil do visor
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.04)';
  ctx.lineWidth = 0.5 * zoom;
  for (let gx = -dispW / 2 + 5 * zoom; gx < dispW / 2; gx += 8 * zoom) {
    ctx.beginPath();
    ctx.moveTo(gx, dispY - dispH / 2);
    ctx.lineTo(gx, dispY + dispH / 2);
    ctx.stroke();
  }

  // 3. Leituras Físicas Reais do Instrumento
  let mainVal = '0.0';
  let unit = '';
  let subText = '';
  let readoutColor = '#38bdf8'; // Cyan padrão

  if (code === 'VM') {
    const v = st.voltage ?? 0;
    mainVal = v.toFixed(1);
    unit = 'V';
    subText = 'TRUE-RMS • 0-600V CA/CC';
    readoutColor = v > 50 ? '#38bdf8' : '#64748b';
  } else if (code === 'AM') {
    const i = st.current ?? 0;
    mainVal = i.toFixed(2);
    unit = 'A';
    subText = 'SHUNT SÉRIE • 0.0005 Ω';
    readoutColor = i > 0.05 ? '#34d399' : '#64748b';
  } else if (code === 'OHM') {
    if (st.error) {
      mainVal = 'ALERTA!';
      unit = '';
      subText = 'CIRC. ENERGIZADO!';
      readoutColor = '#ef4444';
    } else {
      const r = st.resistance ?? 0;
      mainVal = typeof r === 'number' ? r.toFixed(2) : String(r);
      unit = 'Ω';
      subText = 'MALHA PASSIVA • Req';
      readoutColor = '#f59e0b';
    }
  } else if (code === 'WM') {
    const p = (st.powerKW ?? 0) * 1000;
    mainVal = p >= 1000 ? `${(p / 1000).toFixed(2)}k` : p.toFixed(0);
    unit = 'W';
    subText = `S: ${(st.powerKVA ?? 0).toFixed(2)}kVA • cosφ: ${(st.powerFactor ?? 1.0).toFixed(2)}`;
    readoutColor = p > 10 ? '#a855f7' : '#64748b';
  } else if (code === 'FREQ') {
    const f = st.frequency ?? 0;
    mainVal = f > 0 ? f.toFixed(1) : '0.0';
    unit = 'Hz';
    subText = 'ONDA FUNDAMENTAL CA';
    readoutColor = f > 0 ? '#06b6d4' : '#64748b';
  } else if (code === 'COS') {
    const pf = st.powerFactor ?? 1.0;
    mainVal = pf.toFixed(2);
    unit = 'φ';
    subText = 'FATOR DE POTÊNCIA (COS)';
    readoutColor = '#10b981';
  }

  // Display LED / VFD Glow
  ctx.save();
  ctx.fillStyle = readoutColor;
  ctx.shadowColor = readoutColor;
  ctx.shadowBlur = 6 * zoom;

  // Valor Principal
  ctx.font = `bold ${Math.max(9, 13 * zoom)}px 'Courier New', monospace`;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.fillText(mainVal, dispW * 0.22, dispY - 1 * zoom);

  // Unidade de Medida
  ctx.font = `bold ${Math.max(6.5, 9 * zoom)}px sans-serif`;
  ctx.textAlign = 'left';
  ctx.fillText(unit, dispW * 0.26, dispY - 1 * zoom);

  // Sub-texto de telemetria
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#64748b';
  ctx.font = `bold ${Math.max(4.5, 5.5 * zoom)}px monospace`;
  ctx.textAlign = 'center';
  ctx.fillText(subText, 0, dispY + dispH * 0.35);
  ctx.restore();

  // 4. Marca e Rótulo Superior
  ctx.fillStyle = '#94a3b8';
  ctx.font = `bold ${Math.max(5, 6.5 * zoom)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText(brand, 0, -ch / 2 + 4.5 * zoom);

  // 5. Rótulo Inferior / Tipo de Instrumento
  ctx.fillStyle = '#f8fafc';
  ctx.font = `bold ${Math.max(5.5, 7.5 * zoom)}px monospace`;
  ctx.textBaseline = 'bottom';
  const devTitle = COMPACT_DEVICE_CODES[code] || code;
  ctx.fillText(devTitle, 0, ch / 2 - 4.5 * zoom);

  ctx.restore();
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
  ctx.fillStyle = '#cbd5e1';
  ctx.font = `bold ${Math.max(6, 7 * zoom)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('RESISTÊNCIA 2000W', 0, 0);
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

// ----------------------------------------------------------------------------
// 8. BORNES DE PARAFUSO METÁLICOS E EFEITOS
// ----------------------------------------------------------------------------
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

    const isNeutral = termId === 'N' || termId.includes('N') || termId === 'N_IN' || termId === 'N_OUT';
    const isPE = termId === 'PE' || termId === 'G' || termId === 'GND';

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
  const isFaultActive = Boolean(st.fault || st.sparking || st.burned || st.isBurned || st.damaged);
  const isSevere = Boolean(st.burned || st.isBurned || st.damaged);
  const hasSparks = Boolean(st.sparking || st.fault || isSevere);
  const hasSmoke = Boolean(isFaultActive || st.thermal || (st.temperature && st.temperature > 70));

  ctx.save();

  // 1. MANCHAS DE FULIGEM ESCURA DE QUEIMA (DARK SOOT BURN MARKS)
  // Deposição realista de carbono e chamuscado gerado por arco elétrico e queima
  if (isFaultActive || st.damaged || st.isBurned || st.burned) {
    const sootPatches = [
      { x: 0, y: -ch * 0.05, rx: cw * 0.48, ry: ch * 0.44, opacity: 0.92 },
      { x: -cw * 0.22, y: -ch * 0.18, rx: cw * 0.32, ry: ch * 0.36, opacity: 0.78 },
      { x: cw * 0.18, y: -ch * 0.24, rx: cw * 0.28, ry: ch * 0.32, opacity: 0.82 },
      { x: cw * 0.06, y: ch * 0.16, rx: cw * 0.38, ry: ch * 0.28, opacity: 0.72 }
    ];

    sootPatches.forEach(p => {
      ctx.save();
      const sootGrad = ctx.createRadialGradient(p.x, p.y, 2 * zoom, p.x, p.y, Math.max(p.rx, p.ry));
      sootGrad.addColorStop(0, `rgba(5, 5, 8, ${p.opacity})`);
      sootGrad.addColorStop(0.4, `rgba(18, 18, 22, ${(p.opacity * 0.85).toFixed(3)})`);
      sootGrad.addColorStop(0.75, `rgba(39, 39, 42, ${(p.opacity * 0.4).toFixed(3)})`);
      sootGrad.addColorStop(1, 'rgba(24, 24, 27, 0)');

      ctx.fillStyle = sootGrad;
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, p.rx, p.ry, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // Borda incandescente em chamas/brasas ao redor da carcaça
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1.8 * zoom;
    ctx.shadowColor = 'rgba(239, 68, 68, 0.95)';
    ctx.shadowBlur = 12 * zoom;
    ctx.beginPath();
    ctx.roundRect(-cw / 2 - 2 * zoom, -ch / 2 - 2 * zoom, cw + 4 * zoom, ch + 4 * zoom, 6 * zoom);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  // 2. ANÉIS DE FUMAÇA CINZENTA VOLUMÉTRICA ANIMADA EM CANVAS2D
  // Nuvens toroidais de fumaça que sobem, expandem e dispersam com turbulência
  if (hasSmoke) {
    ctx.save();
    const ringCount = isSevere ? 6 : 4;
    for (let i = 0; i < ringCount; i++) {
      const phase = ((time * 1.6 + i * (3.5 / ringCount)) % 3.5) / 3.5; // ciclo 0 a 1
      const riseProgress = Math.pow(phase, 0.85);
      const yRise = -ch * 0.28 - riseProgress * (ch * 0.85 + 45 * zoom);
      const xTurbulence = Math.sin(time * 2.8 + i * 1.9) * (14 * zoom * riseProgress);

      const ringR = (7 + riseProgress * 32) * zoom;
      const ringW = (3 + riseProgress * 8) * zoom;
      const alpha = Math.sin(riseProgress * Math.PI) * (isSevere ? 0.65 : 0.42);

      // Corpo toroidal volumétrico com gradiente suave
      ctx.save();
      const smokeGrad = ctx.createRadialGradient(
        xTurbulence,
        yRise,
        Math.max(1, ringR - ringW),
        xTurbulence,
        yRise,
        ringR + ringW
      );
      smokeGrad.addColorStop(0, `rgba(148, 163, 184, 0)`);
      smokeGrad.addColorStop(0.35, `rgba(203, 213, 225, ${alpha.toFixed(3)})`);
      smokeGrad.addColorStop(0.7, `rgba(100, 116, 139, ${(alpha * 0.7).toFixed(3)})`);
      smokeGrad.addColorStop(1, `rgba(51, 65, 85, 0)`);

      ctx.fillStyle = smokeGrad;
      ctx.beginPath();
      ctx.arc(xTurbulence, yRise, ringR + ringW, 0, Math.PI * 2);
      ctx.fill();

      // Centro do anel de fumaça com linha suave
      ctx.strokeStyle = `rgba(226, 232, 240, ${(alpha * 0.45).toFixed(3)})`;
      ctx.lineWidth = Math.max(1, ringW * 0.4);
      ctx.beginPath();
      ctx.arc(xTurbulence, yRise, ringR, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
  }

  // 3. GERADOR PROCEDURAL DE FAÍSCAS INCANDESCENTES (ARC FLASH SPARKS)
  // Faíscas que voam para fora do dispositivo com rastro de plasma e alta velocidade
  if (hasSparks) {
    ctx.save();

    // Arc flash plasma glow central
    const flashPulse = (Math.sin(time * 48) + Math.cos(time * 33) + 2) * 0.25;
    const arcRadius = (cw * 0.36 + flashPulse * 16 * zoom);
    const arcGrad = ctx.createRadialGradient(0, 0, 1 * zoom, 0, 0, arcRadius);
    arcGrad.addColorStop(0, 'rgba(255, 255, 255, 0.96)');
    arcGrad.addColorStop(0.25, 'rgba(254, 240, 138, 0.88)');
    arcGrad.addColorStop(0.6, 'rgba(249, 115, 22, 0.48)');
    arcGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');

    ctx.fillStyle = arcGrad;
    ctx.beginPath();
    ctx.arc(0, 0, arcRadius, 0, Math.PI * 2);
    ctx.fill();

    // 24 Faíscas incandescentes individuais voando em 360 graus
    const numSparks = 24;
    for (let s = 0; s < numSparks; s++) {
      const speed = 2.4 + (s % 7) * 0.65;
      const sparkLife = ((time * speed + s * 0.173) % 1.0); // 0 a 1

      const baseAngle = (s / numSparks) * Math.PI * 2 + Math.sin(s * 7.1) * 0.35;
      const flyDist = (cw * 0.15 + (cw * 0.65 + 45 * zoom) * Math.pow(sparkLife, 0.82));

      // Cabeça da faísca
      const sx = Math.cos(baseAngle) * flyDist + Math.sin(time * 8 + s) * (3 * zoom);
      const sy = Math.sin(baseAngle) * flyDist - (sparkLife * 12 * zoom);

      // Comprimento do rastro (tail streak)
      const tailLen = (5 + sparkLife * 14) * zoom;
      const tx = sx - Math.cos(baseAngle) * tailLen;
      const ty = sy - Math.sin(baseAngle) * tailLen;

      const sparkAlpha = Math.max(0, 1 - Math.pow(sparkLife, 1.4));

      // Traço luminoso incandescente do rastro
      const sparkGrad = ctx.createLinearGradient(tx, ty, sx, sy);
      sparkGrad.addColorStop(0, `rgba(239, 68, 68, 0)`);
      sparkGrad.addColorStop(0.4, `rgba(249, 115, 22, ${(sparkAlpha * 0.7).toFixed(3)})`);
      sparkGrad.addColorStop(0.85, `rgba(254, 240, 138, ${sparkAlpha.toFixed(3)})`);
      sparkGrad.addColorStop(1, `rgba(255, 255, 255, ${sparkAlpha.toFixed(3)})`);

      ctx.strokeStyle = sparkGrad;
      ctx.lineWidth = Math.max(1.2, (2.6 - sparkLife * 1.5) * zoom);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(sx, sy);
      ctx.stroke();

      // Ponto de brasa incandescente na ponta
      ctx.fillStyle = sparkLife < 0.35 ? '#ffffff' : sparkLife < 0.7 ? '#fef08a' : '#f97316';
      ctx.beginPath();
      ctx.arc(sx, sy, Math.max(0.8, (2.0 - sparkLife * 1.2) * zoom), 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  ctx.restore();
}

// ----------------------------------------------------------------------------
// 9. MOTOR PRINCIPAL DE DESPACHO E RENDERIZAÇÃO
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

  // DESPACHO COMPLETO E 100% COBERTO (ZERO CAIXAS GENÉRICAS)
  if (
    c.code === 'THREE_WAY' ||
    c.code === 'FOUR_WAY' ||
    c.code === 'SW' ||
    c.code === 'SW2' ||
    c.code === 'SW_DOUBLE' ||
    c.code.startsWith('SW_')
  ) {
    renderCommercialRockerSwitch(ctx, c, d, st, cw, ch, zoom);
  } else if (c.code === 'DIMMER' || d.kind === 'dimmer') {
    renderCommercialDimmer(ctx, c, st, cw, ch, zoom);
  } else if (c.code === 'SEL' || d.kind === 'selector') {
    renderCommercialRotaryCamSelector(ctx, c, st, cw, ch, zoom);
  } else if (c.code === 'ESTOP' || d.kind === 'estop') {
    renderCommercialEStop(ctx, c, st, cw, ch, zoom);
  } else if (c.code === 'LIMIT' || (d.kind === 'switch' && c.code === 'LIMIT')) {
    renderCommercialLimitSwitch(ctx, c, st, cw, ch, zoom);
  } else if (c.code === 'FLOAT' || d.kind === 'float_switch') {
    renderCommercialFloatSwitch(ctx, c, st, cw, ch, zoom);
  } else if (c.code === 'PHOTOCELL' || c.code === 'PIR_SENSOR' || d.kind === 'photocell' || d.kind === 'pir_sensor') {
    renderCommercialSensors(ctx, c, st, cw, ch, zoom);
  } else if (c.code === 'MPCB' || d.kind === 'motor_breaker') {
    renderCommercialMotorBreaker(ctx, c, st, cw, ch, zoom, isClosed, isTrip);
  } else if (c.code === 'FUSE' || c.code === 'FU3' || d.kind === 'fuse' || d.kind === 'fuse3') {
    renderCommercialFuseCarrier(ctx, c, st, cw, ch, zoom);
  } else if (c.code === 'SPD' || d.kind === 'spd') {
    renderCommercialSpd(ctx, c, st, cw, ch, zoom);
  } else if (c.code === 'SPD3' || d.kind === 'spd3') {
    renderCommercialSpd3(ctx, c, st, cw, ch, zoom);
  } else if (c.code === 'PHASE' || d.kind === 'phaseRelay') {
    renderCommercialPhaseRelay(ctx, c, st, cw, ch, zoom);
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
  } else if (c.code === 'AUX_BLOCK_2NA2NF' || d.kind === 'aux_block') {
    renderCommercialAuxBlock(ctx, c, st, cw, ch, zoom);
  } else if (c.code === 'RELAY' || d.kind === 'relay') {
    renderCommercialIceCubeRelay(ctx, c, st, cw, ch, zoom);
  } else if (c.code === 'TIMER' || c.code === 'TIMER_TOF' || c.code === 'TIMER_STAR_DELTA') {
    renderCommercialDinTimer(ctx, c, st, cw, ch, zoom);
  } else if (c.code === 'TIMER_DIGITAL' || c.code === 'THERMOSTAT_DIGITAL') {
    renderCommercialDigitalDevice(ctx, c, st, cw, ch, zoom);
  } else if (c.code === 'OLR' || d.kind === 'overload') {
    renderIndustrialOverloadRelay(ctx, c, st, cw, ch, zoom);
  } else if (c.code === 'PUMP' || d.kind === 'pump') {
    renderIndustrialCentrifugalPump(ctx, c, st, cw, ch, zoom, time, simRunning);
  } else if (c.code === 'M3PH_6L' || d.kind === 'motor3_6lead') {
    renderCommercialMotor6Lead(ctx, c, st, cw, ch, zoom, time, simRunning);
  } else if (c.code === 'FAN' || d.kind === 'fan') {
    renderCommercialAxialFan(ctx, c, st, cw, ch, zoom, time, simRunning);
  } else if (d.kind.startsWith('motor') || c.code === 'M1PH' || c.code === 'M3PH' || c.code === 'MDC') {
    renderIndustrialWegMotor(ctx, c, d, st, cw, ch, zoom, time, simRunning);
  } else if (c.code === 'GEN_DIESEL' || d.kind === 'generator_diesel') {
    renderCommercialGenerator(ctx, c, st, cw, ch, zoom, time, simRunning);
  } else if (c.code === 'ATS_SWITCH' || d.kind === 'ats_switch') {
    renderCommercialAts(ctx, c, st, cw, ch, zoom);
  } else if (c.code === 'MTS_SWITCH' || d.kind === 'mts_switch') {
    renderCommercialMts(ctx, c, st, cw, ch, zoom);
  } else if (c.code === 'PV_PANEL' || d.kind === 'pv_panel') {
    renderCommercialPvPanel(ctx, c, st, cw, ch, zoom);
  } else if (c.code === 'BAT_LIFEPO4' || d.kind === 'battery' || d.kind === 'bat_lifepo4') {
    renderCommercialLiFePO4(ctx, c, st, cw, ch, zoom);
  } else if (c.code === 'PV_INVERTER_ONGRID' || d.kind === 'pv_inverter_ongrid') {
    renderCommercialOnGridInverter(ctx, c, st, cw, ch, zoom, simRunning);
  } else if (c.code === 'PV_INVERTER_OFFGRID' || d.kind === 'pv_inverter_offgrid') {
    renderCommercialOffGridInverter(ctx, c, st, cw, ch, zoom, simRunning);
  } else if (c.code === 'PV_INVERTER_HYBRID' || d.kind === 'pv_inverter_hybrid') {
    renderCommercialHybridInverter(ctx, c, st, cw, ch, zoom, simRunning);
  } else if (c.code === 'SMART_METER' || d.kind === 'smart_meter') {
    renderCommercialSmartMeter(ctx, c, st, cw, ch, zoom);
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
  } else if (['VM', 'AM', 'OHM', 'WM', 'FREQ', 'COS'].includes(c.code) || d.cat === 'measurement') {
    renderCommercialMeasurementMeter(ctx, c, st, cw, ch, zoom);
  } else if (c.code === 'EARTH_ROD' || c.code === 'EARTH_PIT') {
    renderCommercialGrounding(ctx, c, cw, ch, zoom);
  } else if (c.code === 'JUNCTION_BOX') {
    renderCommercialJunctionBox(ctx, cw, ch, zoom);
  } else if (c.code === 'LOAD_AC' || c.code === 'LOAD_COOKTOP') {
    renderCommercialAppliances(ctx, c, st, cw, ch, zoom);
  } else if (c.code.startsWith('SRC_') || d.kind === 'source') {
    renderCommercialPowerSource(ctx, c, st, cw, ch, zoom);
  } else {
    renderCommercialRockerSwitch(ctx, c, d, st, cw, ch, zoom);
  }

  renderMetallicScrewTerminals(ctx, c, d, cw, ch, zoom);

  if (st.thermal || st.damaged || st.sparking || st.fault || st.isBurned || st.burned) {
    renderFaultEffects(ctx, cw, ch, zoom, time, st);
  }

  ctx.restore();
}