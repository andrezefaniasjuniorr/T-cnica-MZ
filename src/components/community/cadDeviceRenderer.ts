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
// 4. MOTOR DE RENDERIZAÇÃO REALISTA DE CAIXAS E MODULARIDADE DIN
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
  const isDamaged = Boolean(st.damaged);

  ctx.save();

  // 1. Sombra Realista com Difusão Suave (Soft Drop Shadow)
  ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
  ctx.shadowBlur = 10 * zoom;
  ctx.shadowOffsetX = 2 * zoom;
  ctx.shadowOffsetY = 4 * zoom;
  ctx.fillStyle = '#05070c';
  ctx.beginPath();
  ctx.roundRect(-cw / 2, -ch / 2, cw, ch, rad);
  ctx.fill();
  ctx.shadowColor = 'transparent'; // Limpa sombra para os próximos elementos

  // 2. Presilhas DIN 35mm Traseiras (Encaixe Superior e Inferior com Bisel)
  ctx.fillStyle = '#090d16';
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1 * zoom;
  // Superior
  ctx.beginPath();
  ctx.roundRect(-cw * 0.28, -ch / 2 - 3 * zoom, cw * 0.56, 3.5 * zoom, 1 * zoom);
  ctx.fill();
  ctx.stroke();
  // Inferior (Mecanismo de mola DIN)
  ctx.beginPath();
  ctx.roundRect(-cw * 0.28, ch / 2 - 0.5 * zoom, cw * 0.56, 3.5 * zoom, 1 * zoom);
  ctx.fill();
  ctx.stroke();

  // 3. Corpo Principal — Gradiente Termoplástico Texturizado (RAL 7035 / Policarbonato)
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
    boxGrad.addColorStop(0, '#2b3748');   // Topo iluminado levemente
    boxGrad.addColorStop(0.08, '#1e293b'); // Corpo principal cinza escuro industrial
    boxGrad.addColorStop(0.85, '#0f172a');
    boxGrad.addColorStop(1, '#070a14');   // Sombra inferior interna
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

  // 4. Friso e Chanfro Tridimensional Interno (Efeito de Injeção Plástica)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.09)';
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.roundRect(-cw / 2 + 2.5 * zoom, -ch / 2 + 2.5 * zoom, cw - 5 * zoom, ch - 5 * zoom, rad - 1);
  ctx.stroke();

  // Sombra interna inferior do chanfro
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.beginPath();
  ctx.roundRect(-cw / 2 + 3.5 * zoom, -ch / 2 + 3.5 * zoom, cw - 7 * zoom, ch - 7 * zoom, rad - 1.5);
  ctx.stroke();

  // 5. Marca Comercial Customizável
  if (brandText) {
    renderCustomBrandWatermark(ctx, brandText, -cw / 2 + 6 * zoom, -ch / 2 + 8 * zoom, zoom);
  }

  // 6. Rótulo Compacto Padrão (Tipografia Técnica)
  const compactName = getCompactDeviceLabel(c.code, c.label);
  ctx.fillStyle = '#f1f5f9';
  ctx.font = `bold ${Math.max(7, 8.5 * zoom)}px 'Segoe UI', monospace`;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'top';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.shadowBlur = 2 * zoom;
  ctx.fillText(compactName, cw / 2 - 6 * zoom, -ch / 2 + 5 * zoom);
  ctx.shadowColor = 'transparent';

  // 7. Renderização por Categoria de Dispositivo
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
  } else if (d.kind.startsWith('load_') || ['load_ac', 'load_cooktop', 'load_shower', 'load_microwave'].includes(d.kind)) {
    renderRealisticLoad(ctx, c, d, st, cw, ch, zoom, time, simRunning);
  } else if (['earth_rod', 'earth_pit', 'bare_copper', 'junction_box'].includes(d.kind)) {
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
    ctx.fillStyle = st.energized ? '#34d399' : '#93c5fd';
    ctx.font = `${Math.max(14, 18 * zoom)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(d.icon, 0, 2 * zoom);
  }

  // 8. Bornes com Parafusos Metálicos Realistas e Fenda Profunda
  renderMetallicScrewTerminals(ctx, c, d, cw, ch, zoom);

  // 9. Efeitos Visuais Dinâmicos (Arco Elétrico, Faíscas, Calor e Fumaça)
  renderFaultVisualEffects(ctx, st, cw, ch, zoom, time);

  ctx.restore();
}

// ----------------------------------------------------------------------------
// 5. SUB-RENDERIZADORES MODULARES APRIMORADOS
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
  // Moldura chanfrada de policarbonato escuro com brilho superior
  ctx.fillStyle = '#02040a';
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.roundRect(-bezelW / 2, bezelY, bezelW, bezelH, 3 * zoom);
  ctx.fill();
  ctx.stroke();

  // Fundo LCD Digital com efeito retroiluminado realista
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

  // Brilho especular inclinado no vidro do display (Glass Glare)
  const glareGrad = ctx.createLinearGradient(-bezelW / 2, bezelY, bezelW / 2, bezelY + bezelH * 0.6);
  glareGrad.addColorStop(0, 'rgba(255, 255, 255, 0.08)');
  glareGrad.addColorStop(0.4, 'rgba(255, 255, 255, 0.0)');
  ctx.fillStyle = glareGrad;
  ctx.beginPath();
  ctx.roundRect(-bezelW / 2 + 2 * zoom, bezelY + 2 * zoom, bezelW - 4 * zoom, bezelH - 4 * zoom, 2 * zoom);
  ctx.fill();

  let displayValue = '---';
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

  // Segmentos digitais iluminados com Glow intenso
  ctx.fillStyle = simRunning ? '#34d399' : '#334155';
  ctx.font = `bold ${Math.max(11, 14 * zoom)}px 'Courier New', monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  if (simRunning) {
    ctx.shadowColor = '#10b981';
    ctx.shadowBlur = 8 * zoom;
  }
  ctx.fillText(displayValue, 0, bezelY + bezelH * 0.44);
  ctx.shadowColor = 'transparent';

  // Unidade de medida discreta no canto inferior direito
  ctx.fillStyle = simRunning ? '#a7f3d0' : '#475569';
  ctx.font = `bold ${Math.max(5.5, 6.5 * zoom)}px sans-serif`;
  ctx.textAlign = 'right';
  ctx.fillText(unit, bezelW / 2 - 4 * zoom, bezelY + bezelH - 4 * zoom);

  ctx.restore();
}

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

  // Manípulo Basculante 3D
  const handleW = slotW - 3 * zoom;
  const handleH = 15 * zoom;
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

  ctx.fillStyle = hGrad;
  ctx.beginPath();
  ctx.roundRect(-handleW / 2, handleY, handleW, handleH, 3 * zoom);
  ctx.fill();

  // Ranhuras texturizadas antiderrapantes na alavanca
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.lineWidth = 1 * zoom;
  for (let i = -handleW * 0.32; i <= handleW * 0.32; i += 3.5 * zoom) {
    ctx.beginPath();
    ctx.moveTo(i, handleY + 2.5 * zoom);
    ctx.lineTo(i, handleY + handleH - 2.5 * zoom);
    ctx.stroke();
  }

  // Símbolo I / O / TRIP gravado com contraste
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${Math.max(7.5, 8.5 * zoom)}px 'Segoe UI', monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 2 * zoom;
  ctx.fillText(isTrip ? 'TRIP' : isClosed ? 'I' : 'O', 0, handleY + handleH / 2);
  ctx.shadowColor = 'transparent';

  // Botão de Teste (T) em IDRs / RCDs com relevo esférico
  if (d.kind === 'rcd' || d.kind === 'rcbo') {
    const testR = 4 * zoom;
    const testX = cw * 0.32;
    const testY = 0;
    
    const tGrad = ctx.createRadialGradient(testX - 1, testY - 1, 0.5, testX, testY, testR);
    tGrad.addColorStop(0, '#7dd3fc');
    tGrad.addColorStop(0.6, '#0284c7');
    tGrad.addColorStop(1, '#0369a1');
    ctx.fillStyle = tGrad;
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
  const travel = isPressed ? 2 * zoom : 0;
  const rButton = (rOuter - 3.5 * zoom) * (isPressed ? 0.94 : 1.0);

  ctx.save();
  // Anel metálico cromado externo biselado
  const bezel = ctx.createRadialGradient(0, 0, rOuter * 0.4, 0, 0, rOuter);
  bezel.addColorStop(0, '#f1f5f9');
  bezel.addColorStop(0.5, '#64748b');
  bezel.addColorStop(1, '#0f172a');
  ctx.fillStyle = bezel;
  ctx.beginPath();
  ctx.arc(0, 0, rOuter, 0, Math.PI * 2);
  ctx.fill();

  // Corpo do botão com gradiente radial esférico 3D
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
  ctx.arc(0, travel, rButton, 0, Math.PI * 2);
  ctx.fill();

  // Inscrição no botão
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${Math.max(8, 9.5 * zoom)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowBlur = 2 * zoom;
  ctx.fillText(isEstop ? 'STOP' : isNO ? 'I' : 'O', 0, travel);

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

  if (isEnergized) {
    ctx.shadowColor = '#34d399';
    ctx.shadowBlur = 6 * zoom;
  }

  ctx.fillStyle = isEnergized ? '#a7f3d0' : '#94a3b8';
  ctx.font = `bold ${Math.max(7, 8 * zoom)}px 'Segoe UI', monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(isEnergized ? '▲ ATRACADO (ON)' : '▼ REPOUSO (OFF)', 0, pY + pH / 2);
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
  const isBurned = Boolean(st.isBurned || st.damaged || c?.state?.isBurned);
  const isRunning = Boolean(simRunning && st.running && (st.rpm || 0) > 0 && !isBurned);
  const rpm = isRunning ? (st.rpm || 0) : 0;
  const radius = Math.min(cw, ch) * 0.3;
  const rotDir = st.rotationDir || c?.state?.rotationDir || 'CW';
  const phaseSeq = st.phaseSequence || c?.state?.phaseSequence || (rotDir === 'CW' ? 'RST' : 'RTS');
  const dir = rotDir === 'CCW' ? -1 : 1;

  ctx.save();
  // Carcaça cilíndrica com gradiente radial metálico
  const carGrad = ctx.createRadialGradient(0, -2 * zoom, radius * 0.15, 0, 0, radius);
  if (isBurned) {
    carGrad.addColorStop(0, '#1c1917');
    carGrad.addColorStop(0.7, '#0f172a');
    carGrad.addColorStop(1, '#020617');
  } else {
    carGrad.addColorStop(0, isRunning ? (rotDir === 'CW' ? '#047857' : '#0284c7') : '#334155');
    carGrad.addColorStop(0.85, isRunning ? (rotDir === 'CW' ? '#022c22' : '#0c4a6e') : '#1e293b');
    carGrad.addColorStop(1, '#050811');
  }
  ctx.fillStyle = carGrad;
  ctx.beginPath();
  ctx.arc(0, -2 * zoom, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = isBurned ? '#44403c' : '#475569';
  ctx.lineWidth = 1.2 * zoom;
  ctx.stroke();

  // Aletas de refrigeração do estator detalhadas
  ctx.strokeStyle = isBurned ? '#292524' : (isRunning ? '#10b981' : '#475569');
  ctx.lineWidth = 1.2 * zoom;
  for (let a = 0; a < 8; a++) {
    const angle = (a * Math.PI) / 4;
    ctx.beginPath();
    ctx.moveTo(Math.cos(angle) * (radius * 0.82), -2 * zoom + Math.sin(angle) * (radius * 0.82));
    ctx.lineTo(Math.cos(angle) * radius, -2 * zoom + Math.sin(angle) * radius);
    ctx.stroke();
  }

  // Eixo interno com aletas giratórias em animação suave
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

  // Seta Indicadora Curva de Sentido de Giro
  if (isRunning) {
    ctx.save();
    ctx.translate(0, -2 * zoom);
    const arrowR = radius * 0.9;
    const arrowColor = rotDir === 'CW' ? '#34d399' : '#38bdf8';
    ctx.strokeStyle = arrowColor;
    ctx.lineWidth = 1.8 * zoom;

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
      ctx.lineTo(tx - 4 * zoom, ty - 3.5 * zoom);
      ctx.lineTo(tx + 0.5 * zoom, ty - 5 * zoom);
    } else {
      const tx = Math.cos(Math.PI * 0.85) * arrowR;
      const ty = Math.sin(Math.PI * 0.85) * arrowR;
      ctx.moveTo(tx, ty);
      ctx.lineTo(tx + 4 * zoom, ty - 3.5 * zoom);
      ctx.lineTo(tx - 0.5 * zoom, ty - 5 * zoom);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // Rótulos inferiores informativos
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
    ctx.font = `bold ${Math.max(7.5, 9 * zoom)}px monospace`;
    ctx.fillText(`${Math.round(rpm)} RPM`, 0, ch / 2 - 3.5 * zoom);
  } else {
    ctx.fillStyle = '#64748b';
    ctx.font = `bold ${Math.max(7, 8 * zoom)}px monospace`;
    ctx.fillText('PARADO', 0, ch / 2 - 7 * zoom);
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

  ctx.save();
  if (isOn) {
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur = 20 * zoom;

    const onGrad = ctx.createRadialGradient(-3 * zoom, -5 * zoom, 1 * zoom, 0, -2 * zoom, r);
    onGrad.addColorStop(0, '#ffffff');
    onGrad.addColorStop(0.35, '#fef08a');
    onGrad.addColorStop(0.8, '#eab308');
    onGrad.addColorStop(1, '#ca8a04');
    ctx.fillStyle = onGrad;
  } else {
    const offGrad = ctx.createRadialGradient(-3 * zoom, -5 * zoom, 1 * zoom, 0, -2 * zoom, r);
    offGrad.addColorStop(0, '#475569');
    offGrad.addColorStop(0.7, '#1e293b');
    offGrad.addColorStop(1, '#090d16');
    ctx.fillStyle = offGrad;
  }

  ctx.beginPath();
  ctx.arc(0, -2 * zoom, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = isOn ? '#fef08a' : '#334155';
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
  
  if (d.kind === 'load_ac') {
    const bodyW = cw * 0.88;
    const bodyH = ch * 0.54;
    const bodyY = -bodyH * 0.45;

    const acGrad = ctx.createLinearGradient(0, bodyY, 0, bodyY + bodyH);
    acGrad.addColorStop(0, '#ffffff');
    acGrad.addColorStop(0.2, '#f8fafc');
    acGrad.addColorStop(0.75, '#e2e8f0');
    acGrad.addColorStop(1, '#cbd5e1');
    ctx.fillStyle = acGrad;
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.2 * zoom;
    ctx.beginPath();
    ctx.roundRect(-bodyW / 2, bodyY, bodyW, bodyH, 5 * zoom);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-bodyW * 0.44, bodyY + bodyH - 6.5 * zoom, bodyW * 0.88, 3.5 * zoom);

    const tempVal = c.params?.temp || 21;
    ctx.fillStyle = isEnergized ? '#0284c7' : '#64748b';
    ctx.font = `bold ${Math.max(8.5, 11 * zoom)}px 'Segoe UI', sans-serif`;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    if (isEnergized) {
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 8 * zoom;
    }
    ctx.fillText(`${tempVal}°C`, bodyW / 2 - 8 * zoom, bodyY + bodyH * 0.38);
    ctx.shadowColor = 'transparent';

    ctx.fillStyle = isEnergized ? '#38bdf8' : '#cbd5e1';
    ctx.beginPath();
    ctx.arc(bodyW / 2 - 34 * zoom, bodyY + bodyH * 0.38, 2.5 * zoom, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#475569';
    ctx.font = `bold ${Math.max(5.5, 6.5 * zoom)}px sans-serif`;
    ctx.textAlign = 'left';
    ctx.fillText('INVERTER 12k', -bodyW / 2 + 8 * zoom, bodyY + bodyH * 0.38);

  } else if (d.kind === 'load_cooktop') {
    const topW = cw * 0.88;
    const topH = ch * 0.6;
    const topY = -topH * 0.45;

    const glassGrad = ctx.createLinearGradient(0, topY, 0, topY + topH);
    glassGrad.addColorStop(0, '#1e293b');
    glassGrad.addColorStop(0.25, '#090d16');
    glassGrad.addColorStop(0.85, '#020617');
    glassGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = glassGrad;
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.roundRect(-topW / 2, topY, topW, topH, 4 * zoom);
    ctx.fill();
    ctx.stroke();

    const zoneRadius = 9.5 * zoom;
    const zones = [
      { x: -topW * 0.25, y: topY + topH * 0.32 },
      { x: topW * 0.25, y: topY + topH * 0.32 },
      { x: -topW * 0.25, y: topY + topH * 0.72 },
      { x: topW * 0.25, y: topY + topH * 0.72 }
    ];

    zones.forEach((z, idx) => {
      const active = isEnergized && (idx === 0 || idx === 1);
      ctx.strokeStyle = active ? '#ef4444' : 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = active ? 2.2 * zoom : 1 * zoom;
      if (active) {
        ctx.shadowColor = '#f97316';
        ctx.shadowBlur = 10 * zoom;
      }
      ctx.beginPath();
      ctx.arc(z.x, z.y, zoneRadius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(z.x, z.y, zoneRadius * 0.5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowColor = 'transparent';

      if (active) {
        ctx.fillStyle = 'rgba(239, 68, 68, 0.3)';
        ctx.beginPath();
        ctx.arc(z.x, z.y, zoneRadius, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    ctx.fillStyle = isEnergized ? '#f97316' : '#64748b';
    ctx.font = `bold ${Math.max(6, 7 * zoom)}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText(isEnergized ? 'HEAT: [ 9 ]' : 'STANDBY', 0, topY + topH * 0.9);

  } else if (d.kind === 'load_shower') {
    const cupRadius = Math.min(cw, ch) * 0.28;
    const cupY = -2 * zoom;

    const cupGrad = ctx.createRadialGradient(-3 * zoom, cupY - 3 * zoom, 2 * zoom, 0, cupY, cupRadius);
    cupGrad.addColorStop(0, '#ffffff');
    cupGrad.addColorStop(0.7, '#cbd5e1');
    cupGrad.addColorStop(1, '#64748b');
    ctx.fillStyle = cupGrad;
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.2 * zoom;
    ctx.beginPath();
    ctx.arc(0, cupY, cupRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    const knobR = 6.5 * zoom;
    ctx.fillStyle = isEnergized ? '#ef4444' : '#334155';
    ctx.beginPath();
    ctx.arc(0, cupY, knobR, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#1e293b';
    for (let h = -cupRadius * 0.6; h <= cupRadius * 0.6; h += 3.8 * zoom) {
      ctx.beginPath();
      ctx.arc(h, cupY + cupRadius * 0.65, 0.9 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }

    if (isEnergized) {
      for (let v = 0; v < 4; v++) {
        const vY = cupY + cupRadius + ((time * 30 + v * 10) % 30) * zoom;
        const vX = Math.sin(time * 3.5 + v) * 6 * zoom;
        const alpha = Math.max(0, 0.6 - (vY / (cupRadius * 2.5)));
        ctx.fillStyle = `rgba(56, 189, 248, ${alpha})`;
        ctx.beginPath();
        ctx.arc(vX, vY, 2.2 * zoom, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.fillStyle = '#0f172a';
    ctx.font = `bold ${Math.max(6.5, 7.5 * zoom)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(isEnergized ? '7500W' : 'OFF', 0, ch / 2 - 8 * zoom);

  } else if (d.kind === 'load_microwave') {
    const mwW = cw * 0.86;
    const mwH = ch * 0.54;
    const mwY = -mwH * 0.45;

    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.2 * zoom;
    ctx.beginPath();
    ctx.roundRect(-mwW / 2, mwY, mwW, mwH, 4 * zoom);
    ctx.fill();
    ctx.stroke();

    const doorW = mwW * 0.62;
    const doorH = mwH * 0.8;
    ctx.fillStyle = '#060a12';
    ctx.beginPath();
    ctx.roundRect(-mwW / 2 + 3 * zoom, mwY + 3 * zoom, doorW, doorH, 2.5 * zoom);
    ctx.fill();

    if (isEnergized) {
      ctx.fillStyle = 'rgba(250, 204, 21, 0.45)';
      ctx.beginPath();
      ctx.ellipse(-mwW / 2 + 3 * zoom + doorW / 2, mwY + 3 * zoom + doorH * 0.65, doorW * 0.36, 5 * zoom, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    const pnlX = -mwW / 2 + doorW + 6 * zoom;
    const pnlW = mwW - doorW - 9 * zoom;
    ctx.fillStyle = '#020617';
    ctx.fillRect(pnlX, mwY + 4 * zoom, pnlW, 12 * zoom);

    ctx.fillStyle = isEnergized ? '#22c55e' : '#64748b';
    ctx.font = `bold ${Math.max(6.5, 7.5 * zoom)}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(isEnergized ? '01:30' : '12:00', pnlX + pnlW / 2, mwY + 10 * zoom);

    ctx.fillStyle = '#475569';
    for (let b = 0; b < 3; b++) {
      ctx.fillRect(pnlX + 2 * zoom, mwY + 19 * zoom + b * 5.5 * zoom, pnlW - 4 * zoom, 3.2 * zoom);
    }
  }

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

  if (d.kind === 'earth_rod') {
    const rodW = 10 * zoom;
    const rodH = ch * 0.68;
    const rodY = -rodH * 0.4;

    const copperGrad = ctx.createLinearGradient(-rodW / 2, 0, rodW / 2, 0);
    copperGrad.addColorStop(0, '#9a3412');
    copperGrad.addColorStop(0.35, '#ea580c');
    copperGrad.addColorStop(0.7, '#fdba74');
    copperGrad.addColorStop(1, '#7c2d12');
    ctx.fillStyle = copperGrad;
    ctx.fillRect(-rodW / 2, rodY, rodW, rodH - 8 * zoom);

    ctx.beginPath();
    ctx.moveTo(-rodW / 2, rodY + rodH - 8 * zoom);
    ctx.lineTo(0, rodY + rodH);
    ctx.lineTo(rodW / 2, rodY + rodH - 8 * zoom);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#ca8a04';
    ctx.strokeStyle = '#854d0e';
    ctx.lineWidth = 1 * zoom;
    ctx.fillRect(-rodW * 0.85, rodY, rodW * 1.7, 10 * zoom);
    ctx.strokeRect(-rodW * 0.85, rodY, rodW * 1.7, 10 * zoom);

    ctx.fillStyle = '#4ade80';
    ctx.font = `bold ${Math.max(10, 12 * zoom)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('⏚', 0, rodY + rodH * 0.45);

    const rOhm = c.params?.resistance ?? 10;
    ctx.fillStyle = '#f8fafc';
    ctx.font = `bold ${Math.max(6.5, 8 * zoom)}px monospace`;
    ctx.fillText(`${rOhm} Ω`, 0, ch / 2 - 6 * zoom);

  } else if (d.kind === 'earth_pit') {
    const pitR = Math.min(cw, ch) * 0.33;

    const pitGrad = ctx.createRadialGradient(0, 0, pitR * 0.4, 0, 0, pitR);
    pitGrad.addColorStop(0, '#0f172a');
    pitGrad.addColorStop(0.7, '#334155');
    pitGrad.addColorStop(1, '#020617');
    ctx.fillStyle = pitGrad;
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.arc(0, 0, pitR, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    const bepW = pitR * 1.35;
    const bepH = 11 * zoom;
    ctx.fillStyle = '#ea580c';
    ctx.strokeStyle = '#7c2d12';
    ctx.lineWidth = 1 * zoom;
    ctx.fillRect(-bepW / 2, -bepH / 2, bepW, bepH);
    ctx.strokeRect(-bepW / 2, -bepH / 2, bepW, bepH);

    for (let p = -bepW * 0.36; p <= bepW * 0.36; p += 9 * zoom) {
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(p, 0, 2 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = '#4ade80';
    ctx.font = `bold ${Math.max(6.5, 7.5 * zoom)}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText('BEP TERRA', 0, ch / 2 - 8 * zoom);

  } else if (d.kind === 'bare_copper') {
    const cableW = cw * 0.8;
    const cableH = 13 * zoom;
    ctx.fillStyle = '#ea580c';
    ctx.fillRect(-cableW / 2, -cableH / 2, cableW, cableH);

    ctx.strokeStyle = '#fdba74';
    ctx.lineWidth = 1.4 * zoom;
    for (let x = -cableW / 2; x <= cableW / 2; x += 5.5 * zoom) {
      ctx.beginPath();
      ctx.moveTo(x, -cableH / 2);
      ctx.lineTo(x + 4.5 * zoom, cableH / 2);
      ctx.stroke();
    }

    const gauge = c.params?.gauge ?? 35;
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.max(6.5, 7.5 * zoom)}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText(`${gauge} mm² NU`, 0, ch / 2 - 8 * zoom);

  } else if (d.kind === 'junction_box') {
    const boxW = cw * 0.84;
    const boxH = ch * 0.64;

    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.roundRect(-boxW / 2, -boxH / 2, boxW, boxH, 5 * zoom);
    ctx.fill();
    ctx.stroke();

    const wagoColors = ['#b45309', '#0284c7', '#16a34a'];
    const wagoLabels = ['L', 'N', 'PE'];

    [-boxW * 0.28, 0, boxW * 0.28].forEach((wx, idx) => {
      const wW = 16.5 * zoom;
      const wH = boxH * 0.58;
      const wY = -wH / 2;

      ctx.fillStyle = 'rgba(255, 255, 255, 0.14)';
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 0.9 * zoom;
      ctx.beginPath();
      ctx.roundRect(wx - wW / 2, wY, wW, wH, 2.5 * zoom);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#f97316';
      ctx.fillRect(wx - wW / 2 + 2 * zoom, wY + 2 * zoom, wW - 4 * zoom, 5.5 * zoom);

      ctx.fillStyle = wagoColors[idx];
      ctx.font = `bold ${Math.max(6.5, 7.5 * zoom)}px monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(wagoLabels[idx], wx, wY + wH - 3 * zoom);
    });

    ctx.fillStyle = '#cbd5e1';
    ctx.font = `bold ${Math.max(6, 7 * zoom)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('WAGO 221 (32A)', 0, -boxH / 2 - 3 * zoom);
  }

  ctx.restore();
}

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
      screwGrad.addColorStop(1, '#1e293b');
    }

    ctx.fillStyle = screwGrad;
    ctx.beginPath();
    ctx.arc(tx, ty, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 0.9 * zoom;
    ctx.stroke();

    // Fenda do parafuso em cruz/reta com profundidade realista
    ctx.strokeStyle = '#090d16';
    ctx.lineWidth = 1.1 * zoom;
    ctx.beginPath();
    ctx.moveTo(tx - r * 0.65, ty);
    ctx.lineTo(tx + r * 0.65, ty);
    ctx.moveTo(tx, ty - r * 0.65);
    ctx.lineTo(tx, ty + r * 0.65);
    ctx.stroke();

    const displayLabel = termId === 'N_IN' || termId === 'N_OUT' ? 'N' : termId;
    ctx.fillStyle = isNeutral ? '#38bdf8' : isPE ? '#4ade80' : '#f1f5f9';
    ctx.font = `bold ${Math.max(6.5, 7.5 * zoom)}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = off.dir === 'top' ? 'bottom' : 'top';
    const labelY = off.dir === 'top' ? ty - 4.5 * zoom : ty + 4.5 * zoom;
    ctx.fillText(displayLabel, tx, labelY);

    ctx.restore();
  });
}

// ----------------------------------------------------------------------------
// 6. MOTOR DE EFEITOS VISUAIS DE FALHA (CURTO-CIRCUITO, FAÍSCAS E AQUECIMENTO)
// ----------------------------------------------------------------------------

function renderFaultVisualEffects(
  ctx: CanvasRenderingContext2D,
  st: DeviceSimulationState,
  cw: number,
  ch: number,
  zoom: number,
  time: number
) {
  const now = Date.now();
  const sparkStart = st.sparkStartTime || 0;
  const isSparkExplosionActive = Boolean(st.sparking && (!sparkStart || (now - sparkStart < 1500)));

  const isFault = Boolean(st.fault || isSparkExplosionActive);
  const isThermal = Boolean(st.thermal);
  const isDamaged = Boolean(st.damaged || st.isBurned);

  if (!isFault && !isThermal && !isDamaged) return;

  ctx.save();

  // 1. Sobreaquecimento / Efeito Térmico Incandescente Pulsante
  if (isThermal) {
    const pulse = (Math.sin(time * 9) + 1) * 0.5;
    const glowRadius = (14 + pulse * 10) * zoom;

    ctx.strokeStyle = `rgba(239, 68, 68, ${0.45 + pulse * 0.5})`;
    ctx.lineWidth = 3.5 * zoom;
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = glowRadius;
    ctx.beginPath();
    ctx.roundRect(-cw / 2 - 3 * zoom, -ch / 2 - 3 * zoom, cw + 6 * zoom, ch + 6 * zoom, 8 * zoom);
    ctx.stroke();

    const thermGrad = ctx.createRadialGradient(0, 0, 2 * zoom, 0, 0, cw * 0.55);
    thermGrad.addColorStop(0, `rgba(250, 204, 21, ${0.25 + pulse * 0.25})`);
    thermGrad.addColorStop(0.6, `rgba(234, 88, 12, ${0.35 + pulse * 0.25})`);
    thermGrad.addColorStop(1, 'rgba(127, 29, 29, 0)');
    ctx.fillStyle = thermGrad;
    ctx.beginPath();
    ctx.roundRect(-cw / 2, -ch / 2, cw, ch, 6 * zoom);
    ctx.fill();
  }

  // 2. Curto-Circuito: Clarão de Arco Elétrico e Faíscas Brilhantes de Alta Performance
  if (isSparkExplosionActive) {
    const flashSize = (24 + Math.random() * 20) * zoom;
    const flashGrad = ctx.createRadialGradient(0, 0, 2 * zoom, 0, 0, flashSize);
    flashGrad.addColorStop(0, '#ffffff');
    flashGrad.addColorStop(0.3, '#38bdf8');
    flashGrad.addColorStop(0.7, '#f59e0b');
    flashGrad.addColorStop(1, 'transparent');

    ctx.fillStyle = flashGrad;
    ctx.beginPath();
    ctx.arc(0, 0, flashSize, 0, Math.PI * 2);
    ctx.fill();

    const sparkCount = 18;
    for (let i = 0; i < sparkCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const len = (18 + Math.random() * 34) * zoom;
      const sx = Math.cos(angle) * (len * 0.2);
      const sy = Math.sin(angle) * (len * 0.2);
      const ex = Math.cos(angle) * len;
      const ey = Math.sin(angle) * len;

      ctx.strokeStyle = Math.random() > 0.3 ? '#fef08a' : '#f87171';
      ctx.lineWidth = (1.3 + Math.random() * 1.8) * zoom;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(ex, ey);
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(ex, ey, 1.5 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 3. Queima Definitiva: Carbonização por Fuligem Negra e Partículas de Fumaça Dinâmicas
  if (isDamaged || st.smokeAlpha) {
    const sootGrad = ctx.createRadialGradient(0, 0, 4 * zoom, 0, 0, Math.max(cw, ch) * 0.48);
    sootGrad.addColorStop(0, 'rgba(10, 15, 28, 0.9)');
    sootGrad.addColorStop(0.55, 'rgba(20, 30, 45, 0.7)');
    sootGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = sootGrad;
    ctx.beginPath();
    ctx.arc(0, 0, Math.max(cw, ch) * 0.48, 0, Math.PI * 2);
    ctx.fill();

    // Fissuras de queima texturizadas
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.lineWidth = 1.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(-cw * 0.22, -ch * 0.28);
    ctx.lineTo(0, 0);
    ctx.lineTo(cw * 0.24, ch * 0.22);
    ctx.stroke();

    // Partículas de fumaça orgânicas subindo em nuvens gaussianas
    const smokePuffs = 6;
    for (let s = 0; s < smokePuffs; s++) {
      const puffOffset = ((time * 28 + s * 14) % 60) * zoom;
      const puffX = Math.sin(time * 2.2 + s * 1.5) * 8 * zoom;
      const puffY = -ch / 2 - puffOffset;
      const puffRadius = (6 + s * 3.2) * zoom;
      const alpha = Math.max(0, 0.5 - (puffOffset / (60 * zoom)));

      ctx.fillStyle = `rgba(148, 163, 184, ${alpha})`;
      ctx.beginPath();
      ctx.arc(puffX, puffY, puffRadius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
}