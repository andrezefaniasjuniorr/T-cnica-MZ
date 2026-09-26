// ============================================================================
// TÉCNICAMZ PRO — MOTOR DE RENDERIZAÇÃO REALISTA DE DISPOSITIVOS CAD ELÉTRICOS (V15)
// Normas: IEC 60669 (Interruptores), IEC 60947, IEC 60898 (Disjuntores), ISO 13850 (E-Stop)
// Teclas Basculantes com Dinâmica Angular, Visores Ópticos Vermelho/Verde e Bornes Reais
// ============================================================================

import { getComponentDef } from './cadEngine';
import { getNormativeTerminalOffset } from './cadRouting';

// ----------------------------------------------------------------------------
// 1. TIPOS & INTERFACES
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

// ----------------------------------------------------------------------------
// 2. NOMENCLATURA COMPACTA INDUSTRIAL (IEC / ABNT / DIN)
// ----------------------------------------------------------------------------

export const COMPACT_DEVICE_CODES: Record<string, string> = {
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

  PBNO: 'B/NA',
  PBNC: 'B/NF',
  SW: 'SW 1P',
  SW2: 'SW 2P',
  THREE_WAY: '3-WAY',
  FOUR_WAY: '4-WAY',
  DIMMER: 'DIMMER',
  ESTOP: 'E-STOP',
  SEL: 'SEL',
  LIMIT: 'LIMIT',
  FLOAT: 'FLOAT',
  CONTACTOR: 'KM',
  RELAY: 'KA',
  TIMER: 'KT (TON)',
  FLASH: 'KT (CYC)',
  BUZZ: 'BUZZ',

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

  EARTH_ROD: 'HASTE PE',
  EARTH_PIT: 'CAIXA BEP',
  BARE_COPPER: 'CU NU',
  JUNCTION_BOX: 'WAGO CX',

  VM: 'VOLT',
  AM: 'AMP',
  WM: 'WATT',
  FREQ: 'FREQ',
  ENERGY: 'kWh',
  COS: 'COS φ',
  SCOPE: 'DSO',

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

export function getCompactDeviceLabel(code: string, customLabel?: string): string {
  if (customLabel && customLabel.length <= 10 && !customLabel.includes(' ')) {
    return customLabel.toUpperCase();
  }
  return COMPACT_DEVICE_CODES[code] || code;
}

// ----------------------------------------------------------------------------
// 4. MOTOR PRINCIPAL DE RENDERIZAÇÃO REALISTA DE DISPOSITIVOS
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
  const rad = 5 * zoom;

  const brandText = (c.brandName !== undefined ? c.brandName : c.brand)?.toString().trim() || '';

  const isTrip = Boolean(st.tripped);
  const isClosed = Boolean(st.closed) && !isTrip;
  const isThermal = Boolean(st.thermal);
  const isDamaged = Boolean(st.damaged || st.isBurned);

  ctx.save();

  // 1. Sombra Realista Suave
  ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
  ctx.shadowBlur = 10 * zoom;
  ctx.shadowOffsetX = 2 * zoom;
  ctx.shadowOffsetY = 4 * zoom;
  ctx.fillStyle = '#05070c';
  ctx.beginPath();
  ctx.roundRect(-cw / 2, -ch / 2, cw, ch, rad);
  ctx.fill();
  ctx.shadowColor = 'transparent';

  // 2. Presilhas DIN 35mm Traseiras
  ctx.fillStyle = '#090d16';
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.roundRect(-cw * 0.28, -ch / 2 - 3 * zoom, cw * 0.56, 3.5 * zoom, 1 * zoom);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.roundRect(-cw * 0.28, ch / 2 - 0.5 * zoom, cw * 0.56, 3.5 * zoom, 1 * zoom);
  ctx.fill();
  ctx.stroke();

  // 3. Corpo Principal — Gradiente Termoplástico Texturizado
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
    boxGrad.addColorStop(0, '#2b3748');
    boxGrad.addColorStop(0.08, '#1e293b');
    boxGrad.addColorStop(0.85, '#0f172a');
    boxGrad.addColorStop(1, '#070a14');
  }

  ctx.fillStyle = boxGrad;
  ctx.strokeStyle = isSelected
    ? '#38bdf8'
    : isThermal
    ? '#ef4444'
    : isClosed
    ? '#10b981'
    : '#334155';
  ctx.lineWidth = isSelected ? 2.5 * zoom : 1.2 * zoom;

  if (isSelected) {
    ctx.shadowColor = 'rgba(56, 189, 248, 0.6)';
    ctx.shadowBlur = 14 * zoom;
  }

  ctx.beginPath();
  ctx.roundRect(-cw / 2, -ch / 2, cw, ch, rad);
  ctx.fill();
  ctx.stroke();
  ctx.shadowColor = 'transparent';

  // 4. Friso Interno Chanfrado
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.09)';
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.roundRect(-cw / 2 + 2.5 * zoom, -ch / 2 + 2.5 * zoom, cw - 5 * zoom, ch - 5 * zoom, rad - 1);
  ctx.stroke();

  // 5. Marca Comercial
  if (brandText) {
    renderCustomBrandWatermark(ctx, brandText, -cw / 2 + 6 * zoom, -ch / 2 + 8 * zoom, zoom);
  }

  // 6. Rótulo Compacto
  const compactName = getCompactDeviceLabel(c.code, c.label);
  ctx.fillStyle = '#f1f5f9';
  ctx.font = `bold ${Math.max(7, 8.5 * zoom)}px 'Segoe UI', monospace`;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'top';
  ctx.fillText(compactName, cw / 2 - 6 * zoom, -ch / 2 + 5 * zoom);

  // 7. RENDERIZAÇÃO ESPECÍFICA POR CATEGORIA
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
  } else if (c.code === 'DIMMER') {
    renderRotaryDimmer(ctx, c, d, st, cw, ch, zoom);
  } else if (
    c.code === 'SW' ||
    c.code === 'SW2' ||
    c.code === 'THREE_WAY' ||
    c.code === 'FOUR_WAY' ||
    c.code === 'SEL'
  ) {
    renderRockerSwitch(ctx, c, d, st, cw, ch, zoom);
  } else if (d.kind === 'push') {
    renderPushButtonActuator(ctx, c, d, st, cw, ch, zoom);
  } else if (d.kind === 'contactor' || d.kind === 'relay') {
    renderContactorArmature(ctx, c, d, st, cw, ch, zoom);
  } else if (d.kind === 'motor3' || d.kind === 'motor1' || d.kind === 'fan') {
    renderMotorRotor(ctx, c, d, st, cw, ch, zoom, time, simRunning);
  } else if (d.kind === 'lamp') {
    renderPilotLamp(ctx, c, d, st, cw, ch, zoom);
  } else if (d.kind.startsWith('load_')) {
    renderRealisticLoad(ctx, c, d, st, cw, ch, zoom, time, simRunning);
  } else if (['earth_rod', 'earth_pit', 'bare_copper', 'junction_box'].includes(d.kind)) {
    renderGroundingAndJunction(ctx, c, d, st, cw, ch, zoom, time, simRunning);
  } else {
    ctx.fillStyle = st.energized ? '#34d399' : '#93c5fd';
    ctx.font = `${Math.max(14, 18 * zoom)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(d.icon, 0, 2 * zoom);
  }

  // 8. Bornes com Parafusos Pozidriv e Pinagem NBR/IEC Real
  renderMetallicScrewTerminals(ctx, c, d, cw, ch, zoom);

  // 9. Efeitos de Falha (Curto, Faíscas, Sobreaquecimento e Fumaça)
  renderFaultVisualEffects(ctx, st, cw, ch, zoom, time);

  ctx.restore();
}

// ----------------------------------------------------------------------------
// 5. SUB-RENDERIZADORES VISUAIS E MECÂNICOS
// ----------------------------------------------------------------------------

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

  ctx.fillStyle = '#e2e8f0';
  ctx.fillText(text, x + 1 * zoom, y);
  ctx.restore();
}

/**
 * RENDERIZAÇÃO REALISTA DE DISJUNTORES COM VISOR MECÂNICO VERDE/VERMELHO (IEC 60898)
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
  const slotH = 28 * zoom;
  
  // Berço interno escuro
  ctx.fillStyle = '#03060c';
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.roundRect(-slotW / 2, -slotH / 2, slotW, slotH, 3 * zoom);
  ctx.fill();
  ctx.stroke();

  // VISOR ÓPTICO MECÂNICO DE ESTADO (IEC 60898)
  const flagW = slotW * 0.7;
  const flagH = 5 * zoom;
  const flagY = -slotH / 2 - 8 * zoom;

  ctx.fillStyle = isTrip ? '#f59e0b' : isClosed ? '#dc2626' : '#16a34a';
  ctx.beginPath();
  ctx.roundRect(-flagW / 2, flagY, flagW, flagH, 1.5 * zoom);
  ctx.fill();
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 0.8 * zoom;
  ctx.stroke();

  // Alavanca Basculante com Deslocamento Físico Real (ON=Cima, OFF=Baixo, TRIP=Centro)
  const handleW = slotW - 3 * zoom;
  const handleH = 15 * zoom;
  const handleY = isTrip ? -handleH / 2 : isClosed ? -slotH / 2 + 2 * zoom : slotH / 2 - handleH - 2 * zoom;

  const hGrad = ctx.createLinearGradient(0, handleY, 0, handleY + handleH);
  if (isTrip) {
    hGrad.addColorStop(0, '#fbbf24');
    hGrad.addColorStop(0.5, '#d97706');
    hGrad.addColorStop(1, '#78350f');
  } else if (isClosed) {
    hGrad.addColorStop(0, '#f87171');
    hGrad.addColorStop(0.5, '#dc2626');
    hGrad.addColorStop(1, '#7f1d1d');
  } else {
    hGrad.addColorStop(0, '#64748b');
    hGrad.addColorStop(0.5, '#334155');
    hGrad.addColorStop(1, '#0f172a');
  }

  ctx.fillStyle = hGrad;
  ctx.beginPath();
  ctx.roundRect(-handleW / 2, handleY, handleW, handleH, 3 * zoom);
  ctx.fill();

  // Ranhuras antiderrapantes
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.lineWidth = 1 * zoom;
  for (let i = -handleW * 0.32; i <= handleW * 0.32; i += 3.5 * zoom) {
    ctx.beginPath();
    ctx.moveTo(i, handleY + 2.5 * zoom);
    ctx.lineTo(i, handleY + handleH - 2.5 * zoom);
    ctx.stroke();
  }

  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${Math.max(7.5, 8.5 * zoom)}px monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(isTrip ? 'TRIP' : isClosed ? 'I' : 'O', 0, handleY + handleH / 2);

  // Botão mecânico de teste (T) em IDRs
  if (d.kind === 'rcd' || d.kind === 'rcd4' || d.kind === 'rcbo') {
    const testR = 4 * zoom;
    const testX = cw * 0.32;
    const testY = 0;
    
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.arc(testX, testY, testR, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#bae6fd';
    ctx.lineWidth = 0.8 * zoom;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.max(6, 7 * zoom)}px sans-serif`;
    ctx.fillText('T', testX, testY);
  }

  ctx.restore();
}

/**
 * RENDERIZAÇÃO REALISTA DE INTERRUPTORES BASCULANTES 3D (SW, SW2, THREE-WAY, FOUR-WAY)
 * Exibe inclinação física real, sombreamento reverso e indicação de comutação ativa
 */
function renderRockerSwitch(
  ctx: CanvasRenderingContext2D,
  c: any,
  d: any,
  st: DeviceSimulationState,
  cw: number,
  ch: number,
  zoom: number
) {
  ctx.save();

  // Avaliação do estado comutado do dispositivo
  const isPos1 = c.code === 'THREE_WAY' 
    ? (Number(c.params?.position ?? (st.closed ? 1 : 0)) === 1)
    : c.code === 'FOUR_WAY'
    ? Boolean(c.params?.crossed ?? st.closed)
    : Boolean(st.closed || st.rockerAngle === 1);

  const rW = cw * 0.68;
  const rH = ch * 0.58;

  // 1. Moldura externa chanfrada do espelho 4x2
  ctx.fillStyle = '#090e17';
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.roundRect(-rW / 2 - 2.5 * zoom, -rH / 2 - 2.5 * zoom, rW + 5 * zoom, rH + 5 * zoom, 4 * zoom);
  ctx.fill();
  ctx.stroke();

  // 2. Tecla Balancim com Dinâmica de Inclinação 3D
  const tiltGrad = ctx.createLinearGradient(0, -rH / 2, 0, rH / 2);
  if (isPos1) {
    tiltGrad.addColorStop(0, '#0f172a'); // Topo afundado na carcaça
    tiltGrad.addColorStop(0.48, '#1e293b');
    tiltGrad.addColorStop(0.52, '#334155'); // Divisão central da tecla
    tiltGrad.addColorStop(1, '#475569'); // Base levantada com luz
  } else {
    tiltGrad.addColorStop(0, '#475569'); // Topo levantado
    tiltGrad.addColorStop(0.48, '#334155');
    tiltGrad.addColorStop(0.52, '#1e293b');
    tiltGrad.addColorStop(1, '#0f172a'); // Base afundada
  }

  ctx.fillStyle = tiltGrad;
  ctx.beginPath();
  ctx.roundRect(-rW / 2, -rH / 2, rW, rH, 3 * zoom);
  ctx.fill();

  // Vinco central da tecla basculante
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(-rW / 2 + 3 * zoom, 0);
  ctx.lineTo(rW / 2 - 3 * zoom, 0);
  ctx.stroke();

  // 3. Inscrições e Indicadores Visuais de Comutação
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  if (c.code === 'FOUR_WAY') {
    // Modo 4-Way: Direto (═) ou Cruzado (✕)
    ctx.fillStyle = isPos1 ? '#38bdf8' : '#eab308';
    ctx.font = `bold ${Math.max(10, 13 * zoom)}px monospace`;
    ctx.fillText(isPos1 ? '✕' : '═', 0, 0);

    ctx.fillStyle = '#94a3b8';
    ctx.font = `bold ${Math.max(5.5, 6.5 * zoom)}px sans-serif`;
    ctx.fillText(isPos1 ? 'CRUZADO' : 'DIRETO', 0, isPos1 ? -rH * 0.28 : rH * 0.28);
  } else if (c.code === 'THREE_WAY') {
    // Modo 3-Way: Rota R1 (▲) ou Rota R2 (▼)
    ctx.fillStyle = isPos1 ? '#38bdf8' : '#94a3b8';
    ctx.font = `bold ${Math.max(7.5, 9 * zoom)}px sans-serif`;
    ctx.fillText('▼ R2', 0, rH * 0.25);

    ctx.fillStyle = !isPos1 ? '#38bdf8' : '#94a3b8';
    ctx.fillText('▲ R1', 0, -rH * 0.25);
  } else if (c.code === 'SW2') {
    // Modo Bipolar 2P
    ctx.fillStyle = isPos1 ? '#34d399' : '#64748b';
    ctx.font = `bold ${Math.max(8, 10 * zoom)}px monospace`;
    ctx.fillText(isPos1 ? 'I' : 'O', 0, isPos1 ? rH * 0.25 : -rH * 0.25);
  } else {
    // Modo Simples 1P
    ctx.fillStyle = isPos1 ? '#34d399' : '#64748b';
    ctx.font = `bold ${Math.max(8, 10 * zoom)}px monospace`;
    ctx.fillText(isPos1 ? 'I' : 'O', 0, isPos1 ? rH * 0.25 : -rH * 0.25);
  }

  // Ponto fluorescente indicador de posição ativa
  const dotY = isPos1 ? rH * 0.36 : -rH * 0.36;
  ctx.fillStyle = isPos1 ? '#34d399' : '#475569';
  ctx.beginPath();
  ctx.arc(0, dotY, 2.2 * zoom, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * RENDERIZAÇÃO REALISTA DE DIMMER ROTATIVO (0-100%)
 */
function renderRotaryDimmer(
  ctx: CanvasRenderingContext2D,
  c: any,
  d: any,
  st: DeviceSimulationState,
  cw: number,
  ch: number,
  zoom: number
) {
  ctx.save();

  const percent = Number(c.params?.percent ?? 100);
  const knobR = Math.min(cw, ch) * 0.32;
  const angle = (-135 + (percent / 100) * 270) * (Math.PI / 180);

  // Escala graduada de pontos circulares
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1.5 * zoom;
  for (let a = -135; a <= 135; a += 27) {
    const rad = a * (Math.PI / 180);
    const pX = Math.cos(rad) * (knobR + 5 * zoom);
    const pY = Math.sin(rad) * (knobR + 5 * zoom);
    ctx.fillStyle = (a <= (-135 + (percent / 100) * 270)) ? '#38bdf8' : '#334155';
    ctx.beginPath();
    ctx.arc(pX, pY, 1.2 * zoom, 0, Math.PI * 2);
    ctx.fill();
  }

  // Manípulo circular estriado
  const knobGrad = ctx.createRadialGradient(-2 * zoom, -2 * zoom, knobR * 0.1, 0, 0, knobR);
  knobGrad.addColorStop(0, '#475569');
  knobGrad.addColorStop(0.7, '#1e293b');
  knobGrad.addColorStop(1, '#090d16');

  ctx.fillStyle = knobGrad;
  ctx.beginPath();
  ctx.arc(0, 0, knobR, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 1.2 * zoom;
  ctx.stroke();

  // Traço indicador angular do potenciômetro
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 2.2 * zoom;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(Math.cos(angle) * (knobR * 0.8), Math.sin(angle) * (knobR * 0.8));
  ctx.stroke();

  // Display digital central de percentagem
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${Math.max(6.5, 8 * zoom)}px monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${percent}%`, 0, ch / 2 - 7 * zoom);

  ctx.restore();
}

/**
 * RENDERIZAÇÃO DE BOTOEIRAS E PARADA DE EMERGÊNCIA (ISO 13850)
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

  const rOuter = Math.min(cw, ch) * 0.35;
  const travel = isPressed ? 2.5 * zoom : 0;
  const rButton = (rOuter - 3.5 * zoom) * (isPressed ? 0.94 : 1.0);

  ctx.save();

  if (isEstop) {
    ctx.fillStyle = '#facc15';
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 1.2 * zoom;
    ctx.beginPath();
    ctx.arc(0, 0, rOuter + 2 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else {
    const bezel = ctx.createRadialGradient(0, 0, rOuter * 0.4, 0, 0, rOuter);
    bezel.addColorStop(0, '#f1f5f9');
    bezel.addColorStop(0.5, '#64748b');
    bezel.addColorStop(1, '#0f172a');
    ctx.fillStyle = bezel;
    ctx.beginPath();
    ctx.arc(0, 0, rOuter, 0, Math.PI * 2);
    ctx.fill();
  }

  const btnGrad = ctx.createRadialGradient(-rButton * 0.35, -rButton * 0.35 + travel, rButton * 0.1, 0, travel, rButton);
  if (isEstop) {
    btnGrad.addColorStop(0, '#f87171');
    btnGrad.addColorStop(0.5, '#dc2626');
    btnGrad.addColorStop(1, '#7f1d1d');
  } else if (isNO) {
    btnGrad.addColorStop(0, '#4ade80');
    btnGrad.addColorStop(0.5, '#16a34a');
    btnGrad.addColorStop(1, '#14532d');
  } else {
    btnGrad.addColorStop(0, '#fca5a5');
    btnGrad.addColorStop(0.5, '#ef4444');
    btnGrad.addColorStop(1, '#991b1b');
  }

  ctx.fillStyle = btnGrad;
  ctx.beginPath();
  ctx.arc(0, travel, isEstop ? rButton * 1.15 : rButton, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${Math.max(8, 9.5 * zoom)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(isEstop ? 'EMERG' : isNO ? 'I' : 'O', 0, travel);

  ctx.restore();
}

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
  ctx.fillStyle = '#02040a';
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.roundRect(-bezelW / 2, bezelY, bezelW, bezelH, 3 * zoom);
  ctx.fill();
  ctx.stroke();

  const lcdGrad = ctx.createLinearGradient(0, bezelY, 0, bezelY + bezelH);
  if (simRunning) {
    lcdGrad.addColorStop(0, '#02231c');
    lcdGrad.addColorStop(0.5, '#064e3b');
    lcdGrad.addColorStop(1, '#011611');
  } else {
    lcdGrad.addColorStop(0, '#090d16');
    lcdGrad.addColorStop(1, '#020617');
  }

  ctx.fillStyle = lcdGrad;
  ctx.beginPath();
  ctx.roundRect(-bezelW / 2 + 2 * zoom, bezelY + 2 * zoom, bezelW - 4 * zoom, bezelH - 4 * zoom, 2 * zoom);
  ctx.fill();

  let displayValue = '0.0';
  let unit = '';

  switch (d.code) {
    case 'VM':
      displayValue = simRunning && typeof st.voltage === 'number' ? st.voltage.toFixed(1) : '0.0';
      unit = 'V RMS';
      break;
    case 'AM':
      displayValue = simRunning && typeof st.current === 'number' ? st.current.toFixed(2) : '0.00';
      unit = 'A RMS';
      break;
    case 'FREQ':
      displayValue = simRunning && typeof st.frequency === 'number' ? st.frequency.toFixed(1) : '0.0';
      unit = 'Hz';
      break;
    case 'WM':
      displayValue = simRunning && typeof st.powerKW === 'number' ? st.powerKW.toFixed(2) : '0.00';
      unit = 'kW';
      break;
    case 'COS':
      displayValue = simRunning && typeof st.powerFactor === 'number' ? st.powerFactor.toFixed(2) : '1.0';
      unit = 'cos φ';
      break;
    case 'ENERGY':
      displayValue = simRunning && typeof st.energyKWh === 'number' ? st.energyKWh.toFixed(1) : '0.0';
      unit = 'kWh';
      break;
    default:
      displayValue = simRunning ? 'LIVE' : 'OFF';
      unit = d.icon || '';
  }

  ctx.fillStyle = simRunning ? '#34d399' : '#334155';
  ctx.font = `bold ${Math.max(11, 14 * zoom)}px 'Courier New', monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(displayValue, 0, bezelY + bezelH * 0.44);

  ctx.fillStyle = simRunning ? '#a7f3d0' : '#475569';
  ctx.font = `bold ${Math.max(5.5, 6.5 * zoom)}px sans-serif`;
  ctx.textAlign = 'right';
  ctx.fillText(unit, bezelW / 2 - 4 * zoom, bezelY + bezelH - 4 * zoom);

  ctx.restore();
}

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
  const pY = -pH * 0.38;

  ctx.save();
  ctx.fillStyle = '#02050a';
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.roundRect(-pW / 2, pY, pW, pH, 3 * zoom);
  ctx.fill();
  ctx.stroke();

  const pGrad = ctx.createLinearGradient(0, pY, 0, pY + pH);
  if (isEnergized) {
    pGrad.addColorStop(0, '#047857');
    pGrad.addColorStop(0.5, '#059669');
    pGrad.addColorStop(1, '#064e3b');
  } else {
    pGrad.addColorStop(0, '#475569');
    pGrad.addColorStop(0.5, '#1e293b');
    pGrad.addColorStop(1, '#090d16');
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
  const isBurned = Boolean(st.isBurned || st.damaged);
  const isRunning = Boolean(simRunning && st.running && (st.rpm || 0) > 0 && !isBurned);
  const rpm = isRunning ? (st.rpm || 0) : 0;
  const radius = Math.min(cw, ch) * 0.3;
  const rotDir = st.rotationDir || 'CW';
  const dir = rotDir === 'CCW' ? -1 : 1;

  ctx.save();
  const carGrad = ctx.createRadialGradient(0, -2 * zoom, radius * 0.15, 0, 0, radius);
  if (isBurned) {
    carGrad.addColorStop(0, '#1c1917');
    carGrad.addColorStop(1, '#020617');
  } else {
    carGrad.addColorStop(0, isRunning ? '#047857' : '#334155');
    carGrad.addColorStop(1, '#050811');
  }
  ctx.fillStyle = carGrad;
  ctx.beginPath();
  ctx.arc(0, -2 * zoom, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = isBurned ? '#44403c' : '#475569';
  ctx.lineWidth = 1.2 * zoom;
  ctx.stroke();

  ctx.save();
  ctx.translate(0, -2 * zoom);
  ctx.rotate(isRunning ? (dir * time * (rpm / 60) * Math.PI * 2) : 0);

  ctx.strokeStyle = isBurned ? '#52525b' : (isRunning ? '#6ee7b7' : '#94a3b8');
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

  ctx.textAlign = 'center';
  if (isBurned) {
    ctx.fillStyle = '#ef4444';
    ctx.font = `bold ${Math.max(6.5, 7.5 * zoom)}px monospace`;
    ctx.fillText('AVARIA (QUEIMADO)', 0, ch / 2 - 7 * zoom);
  } else if (isRunning) {
    ctx.fillStyle = '#34d399';
    ctx.font = `bold ${Math.max(7, 8.5 * zoom)}px monospace`;
    ctx.fillText(`${Math.round(rpm)} RPM`, 0, ch / 2 - 5 * zoom);
  } else {
    ctx.fillStyle = '#64748b';
    ctx.font = `bold ${Math.max(7, 8 * zoom)}px monospace`;
    ctx.fillText('0 RPM (PARADO)', 0, ch / 2 - 7 * zoom);
  }

  ctx.restore();
}

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
  const r = 14 * zoom;
  const lampColor = c.params?.color || (c.code.includes('GREEN') ? 'green' : c.code.includes('RED') ? 'red' : 'yellow');

  ctx.save();
  if (isOn) {
    ctx.shadowBlur = 18 * zoom;
    ctx.shadowColor = lampColor === 'green' ? '#22c55e' : lampColor === 'red' ? '#ef4444' : '#eab308';
    ctx.fillStyle = lampColor === 'green' ? '#4ade80' : lampColor === 'red' ? '#f87171' : '#facc15';
  } else {
    ctx.fillStyle = '#1e293b';
  }

  ctx.beginPath();
  ctx.arc(0, -2 * zoom, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = isOn ? '#ffffff' : '#334155';
  ctx.lineWidth = 1.8 * zoom;
  ctx.stroke();

  ctx.restore();
}

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

  const bodyW = cw * 0.88;
  const bodyH = ch * 0.54;
  const bodyY = -bodyH * 0.45;

  ctx.fillStyle = isEnergized ? '#1e293b' : '#0f172a';
  ctx.strokeStyle = isEnergized ? '#38bdf8' : '#334155';
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.roundRect(-bodyW / 2, bodyY, bodyW, bodyH, 4 * zoom);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = isEnergized ? '#38bdf8' : '#64748b';
  ctx.font = `bold ${Math.max(8, 10 * zoom)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(isEnergized ? `${st.voltage || 230}V • ${st.powerKW || 0}kW` : 'DESLIGADO', 0, bodyY + bodyH / 2);

  ctx.restore();
}

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
  const rodW = 10 * zoom;
  const rodH = ch * 0.68;
  const rodY = -rodH * 0.4;

  ctx.fillStyle = '#ea580c';
  ctx.fillRect(-rodW / 2, rodY, rodW, rodH - 8 * zoom);

  ctx.fillStyle = '#4ade80';
  ctx.font = `bold ${Math.max(10, 12 * zoom)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('⏚', 0, rodY + rodH * 0.45);
  ctx.restore();
}

/**
 * BORNES METÁLICOS POZIDRIV COM IDENTIFICAÇÃO FÍSICA REAL (NBR/IEC)
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
    const r = 4.5 * zoom;

    ctx.save();
    ctx.fillStyle = '#020409';
    ctx.beginPath();
    ctx.arc(tx, ty, r + 1.8 * zoom, 0, Math.PI * 2);
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
    ctx.lineWidth = 1.1 * zoom;
    ctx.beginPath();
    ctx.moveTo(tx - r * 0.65, ty);
    ctx.lineTo(tx + r * 0.65, ty);
    ctx.moveTo(tx, ty - r * 0.65);
    ctx.lineTo(tx, ty + r * 0.65);
    ctx.stroke();

    ctx.fillStyle = isNeutral ? '#38bdf8' : isPE ? '#4ade80' : '#f1f5f9';
    ctx.font = `bold ${Math.max(6.5, 7.5 * zoom)}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = off.dir === 'top' ? 'bottom' : 'top';
    const labelY = off.dir === 'top' ? ty - 4.5 * zoom : ty + 4.5 * zoom;
    ctx.fillText(termId, tx, labelY);

    ctx.restore();
  });
}

function renderFaultVisualEffects(
  ctx: CanvasRenderingContext2D,
  st: DeviceSimulationState,
  cw: number,
  ch: number,
  zoom: number,
  time: number
) {
  const isThermal = Boolean(st.thermal);
  const isDamaged = Boolean(st.damaged || st.isBurned);
  if (!isThermal && !isDamaged) return;

  ctx.save();
  if (isThermal) {
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 3 * zoom;
    ctx.beginPath();
    ctx.roundRect(-cw / 2 - 3 * zoom, -ch / 2 - 3 * zoom, cw + 6 * zoom, ch + 6 * zoom, 8 * zoom);
    ctx.stroke();
  }
  if (isDamaged) {
    ctx.fillStyle = 'rgba(10, 15, 28, 0.85)';
    ctx.beginPath();
    ctx.arc(0, 0, Math.max(cw, ch) * 0.45, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}