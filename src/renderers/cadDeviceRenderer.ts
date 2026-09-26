// ============================================================================
// TÉCNICAMZ PRO — MOTOR DE RENDERIZAÇÃO REALISTA 3D DE DISPOSITIVOS CAD
// Normas: IEC 60947, IEC 60898, IEC 60364 & DIN EN 50022
// ZERO CAIXAS GENÉRICAS: Modelos Industriais Comerciais Detalhados,
// Disjuntores com Janela Mecânica (Verde/Vermelho/Trip), DR com Botão T,
// DPS com Cartucho Plugável, Motores Aletados com 6 Bornes e Ventoinha Animada
// ============================================================================

import { getComponentDef } from '../engine/cadEngine';
import { getNormativeTerminalOffset } from '../engine/cadRouting';

export type DeviceBrand =
  | 'Schneider Electric'
  | 'Legrand'
  | 'Efapel'
  | 'Chint'
  | 'ABB'
  | 'Siemens'
  | 'Eaton';

export interface DeviceSimulationState {
  closed?: boolean;
  pressed?: boolean;
  energized?: boolean;
  running?: boolean;
  rpm?: number;
  voltage?: number;
  current?: number;
  frequency?: number;
  powerKW?: number;
  tripped?: boolean;
  thermal?: boolean;
  fault?: boolean;
  sparking?: boolean;
  damaged?: boolean;
  smokeAlpha?: number;
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
    name?: string;
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
// UTILITÁRIOS GRÁFICOS DE PBR & TEXTURAS INDUSTRIAIS
// ----------------------------------------------------------------------------

function drawMetallicTexture(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  angle = 0
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  const grad = ctx.createLinearGradient(-r, -r, r, r);
  grad.addColorStop(0, '#f8fafc');
  grad.addColorStop(0.2, '#94a3b8');
  grad.addColorStop(0.5, '#cbd5e1');
  grad.addColorStop(0.8, '#475569');
  grad.addColorStop(1, '#1e293b');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();

  const specGrad = ctx.createLinearGradient(-r, 0, r, 0);
  specGrad.addColorStop(0, 'rgba(255,255,255,0)');
  specGrad.addColorStop(0.5, 'rgba(255,255,255,0.45)');
  specGrad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = specGrad;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawIndustrialScrew(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  rotation = 0.785
) {
  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.beginPath();
  ctx.arc(x + 0.5, y + 0.8, radius + 0.5, 0, Math.PI * 2);
  ctx.fill();

  drawMetallicTexture(ctx, x, y, radius, rotation);

  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = Math.max(1, radius * 0.35);
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-radius * 0.65, 0);
  ctx.lineTo(radius * 0.65, 0);
  ctx.stroke();

  ctx.lineWidth = Math.max(0.6, radius * 0.18);
  ctx.beginPath();
  ctx.moveTo(0, -radius * 0.65);
  ctx.lineTo(0, radius * 0.65);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(255,255,255,0.6)';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.82, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
}

// ----------------------------------------------------------------------------
// RENDERIZAÇÃO PRINCIPAL DO DISPOSITIVO
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

  const isTrip = Boolean(st.tripped);
  const isClosed = Boolean((st.closed ?? true) && !isTrip);
  const isThermal = Boolean(st.thermal);
  const isDamaged = Boolean(st.damaged);

  ctx.save();

  // Sombra suave sob o equipamento
  ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
  ctx.shadowBlur = 10 * zoom;
  ctx.shadowOffsetX = 2 * zoom;
  ctx.shadowOffsetY = 4 * zoom;
  ctx.fillStyle = '#05070c';
  ctx.beginPath();
  ctx.roundRect(-cw / 2, -ch / 2, cw, ch, rad);
  ctx.fill();
  ctx.shadowColor = 'transparent';

  // Presilhas DIN 35mm Traseiras
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

  // Corpo Principal com Gradiente Termoplástico Industrial V0
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

  // Chanfro interno e relevo 3D
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.09)';
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.roundRect(-cw / 2 + 2.5 * zoom, -ch / 2 + 2.5 * zoom, cw - 5 * zoom, ch - 5 * zoom, rad - 1);
  ctx.stroke();

  // Rótulo de Identificação
  const labelText = c.label || c.name || d.name.slice(0, 16);
  ctx.fillStyle = '#f1f5f9';
  ctx.font = `bold ${Math.max(7, 8.5 * zoom)}px 'Segoe UI', monospace`;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'top';
  ctx.fillText(labelText.slice(0, 14), cw / 2 - 6 * zoom, -ch / 2 + 5 * zoom);

  // RENDERIZAÇÃO ESPECÍFICA DO CORPO DO DISPOSITIVO
  if (['breaker', 'breaker2', 'breaker3', 'rcd', 'rcd4', 'rcbo', 'mpcb', 'fuse', 'fuse3'].includes(d.kind)) {
    renderDinBreakerDetails(ctx, c, d, st, cw, ch, zoom, isClosed, isTrip);
  } else if (d.kind === 'spd' || d.kind === 'spd3') {
    renderSpdSurgeModule(ctx, c, d, st, cw, ch, zoom);
  } else if (d.kind === 'contactor' || d.kind === 'relay') {
    renderContactorArmature(ctx, c, d, st, cw, ch, zoom);
  } else if (d.kind === 'overload') {
    renderThermalOverloadRelay(ctx, c, d, st, cw, ch, zoom);
  } else if (d.kind.startsWith('motor') || d.kind === 'fan' || d.kind === 'pump') {
    renderIndustrialMotor(ctx, c, d, st, cw, ch, zoom, time, simRunning);
  } else if (c.code === 'THREE_WAY') {
    renderThreeWaySwitch(ctx, c, st, cw, ch, zoom);
  } else if (c.code === 'FOUR_WAY') {
    renderFourWaySwitch(ctx, c, st, cw, ch, zoom);
  } else if (d.kind === 'switch' || d.kind === 'push') {
    renderPushButtonSwitch(ctx, c, d, st, cw, ch, zoom);
  } else if (d.cat === 'measurement' || d.kind === 'vfd' || d.kind === 'pv_inverter') {
    renderDigitalLcdPanel(ctx, c, d, st, cw, ch, zoom, simRunning, time);
  } else if (d.kind === 'lamp') {
    renderPilotOrLamp(ctx, c, d, st, cw, ch, zoom);
  } else {
    // Cargas reais (Chuveiro, Ar condicionado, Aquecedor, etc.)
    renderRealLoadDevice(ctx, c, d, st, cw, ch, zoom, simRunning);
  }

  // BORNES DE CONEXÃO COM PARAFUSOS POZIDRIV
  renderTerminalScrews(ctx, c, d, cw, ch, zoom);

  // EFEITOS DE FALHA (ARCO ELÉTRICO, FAÍSCAS ⚡ E FUMAÇA 💨)
  if (st.sparking || st.fault || st.thermal || st.damaged) {
    renderFaultEffects(ctx, cw, ch, zoom, time, st);
  }

  ctx.restore();
}

// ----------------------------------------------------------------------------
// DISJUNTORES (MCB/MCCB) COM JANELA MECÂNICA (VERDE/VERMELHO/TRIP)
// ----------------------------------------------------------------------------

function renderDinBreakerDetails(
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
  const slotW = (d.kind === 'breaker3' || d.kind === 'rcd4' ? 36 : d.kind === 'breaker2' ? 26 : 20) * zoom;
  const slotH = 30 * zoom;

  // 1. JANELA COM INDICADOR MECÂNICO NORMATIZADO (IEC 60898: VERDE=OFF, VERMELHO=ON, TRIP=AMARELO)
  const flagW = Math.min(slotW * 0.85, 20 * zoom);
  const flagH = 6.5 * zoom;
  const flagY = -slotH / 2 - 8 * zoom;

  ctx.save();
  ctx.fillStyle = '#050811';
  ctx.beginPath();
  ctx.roundRect(-flagW / 2, flagY, flagW, flagH, 2 * zoom);
  ctx.fill();
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 0.8 * zoom;
  ctx.stroke();

  // Cor mecânica do flag
  const flagColor = isTrip ? '#eab308' : isClosed ? '#ef4444' : '#22c55e';
  ctx.fillStyle = flagColor;
  ctx.beginPath();
  ctx.roundRect(-flagW / 2 + 1.5 * zoom, flagY + 1.5 * zoom, flagW - 3 * zoom, flagH - 3 * zoom, 1 * zoom);
  ctx.fill();

  ctx.fillStyle = isClosed || isTrip ? '#ffffff' : '#052e16';
  ctx.font = `bold ${Math.max(5.5, 6.5 * zoom)}px monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(isTrip ? 'TRIP' : isClosed ? 'ON' : 'OFF', 0, flagY + flagH / 2);
  ctx.restore();

  // 2. CAVIDADE REBAIXADA DA ALAVANCA
  ctx.fillStyle = '#03060c';
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.roundRect(-slotW / 2, -slotH / 2, slotW, slotH, 3 * zoom);
  ctx.fill();
  ctx.stroke();

  // 3. ALAVANCA BASCULANTE FÍSICA
  const handleW = slotW - 4 * zoom;
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

  // Ranhuras antiderrapantes
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.lineWidth = 1 * zoom;
  for (let i = -handleW * 0.32; i <= handleW * 0.32; i += 3.5 * zoom) {
    ctx.beginPath();
    ctx.moveTo(i, handleY + 2.5 * zoom);
    ctx.lineTo(i, handleY + handleH - 2.5 * zoom);
    ctx.stroke();
  }

  // 4. BOTÃO "T" DE TESTE EM ALTO-RELEVO (EXCLUSIVO PARA DR / RCD / RCBO)
  if (d.kind === 'rcd' || d.kind === 'rcd4' || d.kind === 'rcbo') {
    const testR = 5 * zoom;
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
    ctx.font = `bold ${Math.max(6.5, 7.5 * zoom)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('T', testX, testY);
  }
}

// ----------------------------------------------------------------------------
// DPS COM CARTUCHO PLUGÁVEL E INDICADOR ÓPTICO DE VIDA ÚTIL
// ----------------------------------------------------------------------------

function renderSpdSurgeModule(
  ctx: CanvasRenderingContext2D,
  c: any,
  d: any,
  st: DeviceSimulationState,
  cw: number,
  ch: number,
  zoom: number
) {
  // Cartucho plugável destacado
  const cartW = cw * 0.7;
  const cartH = ch * 0.65;
  ctx.fillStyle = '#1e293b';
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.roundRect(-cartW / 2, -cartH / 2, cartW, cartH, 4 * zoom);
  ctx.fill();
  ctx.stroke();

  // Presilha de extração do cartucho
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(-cartW * 0.35, -cartH / 2 + 2 * zoom, cartW * 0.7, 3 * zoom);

  // Janela indicadora de vida útil (Verde = Operacional / Vermelho = Esgotado)
  const isHealthy = Boolean(c.params?.lifeHealthy ?? true);
  const indW = 16 * zoom;
  const indH = 8 * zoom;
  ctx.fillStyle = isHealthy ? '#22c55e' : '#ef4444';
  ctx.beginPath();
  ctx.roundRect(-indW / 2, 2 * zoom, indW, indH, 2 * zoom);
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 0.6 * zoom;
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${Math.max(6, 7 * zoom)}px monospace`;
  ctx.textAlign = 'center';
  ctx.fillText('DPS', 0, -cartH / 2 + 12 * zoom);
  ctx.fillText(isHealthy ? 'OK' : 'DEF', 0, 7 * zoom);
}

// ----------------------------------------------------------------------------
// CONTATORES E RELÉS DE POTÊNCIA
// ----------------------------------------------------------------------------

function renderContactorArmature(
  ctx: CanvasRenderingContext2D,
  c: any,
  d: any,
  st: DeviceSimulationState,
  cw: number,
  ch: number,
  zoom: number
) {
  const coilOn = Boolean(st.energized);
  const pW = cw * 0.62;
  const pH = ch * 0.44;
  const pY = -pH / 2;

  // Cavidade da armadura solenóide
  ctx.fillStyle = '#020617';
  ctx.fillRect(-pW / 2 - 1.5, pY - 1.5, pW + 3, pH + 3);

  // Armadura móvel
  const plungeOffset = coilOn ? 2.5 * zoom : 0;
  const pGrad = ctx.createLinearGradient(0, pY, 0, pY + pH);
  pGrad.addColorStop(0, coilOn ? '#1e293b' : '#334155');
  pGrad.addColorStop(0.5, coilOn ? '#0f172a' : '#1e293b');
  pGrad.addColorStop(1, coilOn ? '#020617' : '#0f172a');
  ctx.fillStyle = pGrad;
  ctx.beginPath();
  ctx.roundRect(-pW / 2 + 1, pY + 1 + plungeOffset, pW - 2, pH - 2, 2 * zoom);
  ctx.fill();

  // Indicador de Bobina A1/A2 Energizada (LED Verde)
  ctx.fillStyle = coilOn ? '#34d399' : '#334155';
  ctx.shadowColor = coilOn ? '#34d399' : 'transparent';
  ctx.shadowBlur = 8 * zoom;
  ctx.beginPath();
  ctx.arc(pW * 0.32, pY + 6 * zoom, 3 * zoom, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.fillStyle = '#94a3b8';
  ctx.font = `bold ${Math.max(6, 7 * zoom)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText(coilOn ? 'KM ATRACADO' : 'KM DESLIGADO', 0, 0);
}

// ----------------------------------------------------------------------------
// RELÉ TÉRMICO DE SOBRECARGA COM BOTÃO RESET E DISCO DE AJUSTE
// ----------------------------------------------------------------------------

function renderThermalOverloadRelay(
  ctx: CanvasRenderingContext2D,
  c: any,
  d: any,
  st: DeviceSimulationState,
  cw: number,
  ch: number,
  zoom: number
) {
  // Disco rotativo de ajuste de corrente
  const dialR = 10 * zoom;
  drawMetallicTexture(ctx, -cw * 0.22, 0, dialR);
  ctx.fillStyle = '#0f172a';
  ctx.font = `bold ${Math.max(5.5, 6.5 * zoom)}px monospace`;
  ctx.textAlign = 'center';
  ctx.fillText(`${c.params?.currentSetting || 8.5}A`, -cw * 0.22, 2 * zoom);

  // Botão RESET Azul
  ctx.fillStyle = '#0284c7';
  ctx.beginPath();
  ctx.arc(cw * 0.22, -6 * zoom, 4.5 * zoom, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${Math.max(5, 6 * zoom)}px sans-serif`;
  ctx.fillText('RESET', cw * 0.22, -6 * zoom);

  // Botão STOP Vermelho
  ctx.fillStyle = '#dc2626';
  ctx.beginPath();
  ctx.arc(cw * 0.22, 8 * zoom, 4.5 * zoom, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.fillText('STOP', cw * 0.22, 8 * zoom);
}

// ----------------------------------------------------------------------------
// MOTOR ELÉTRICO INDUSTRIAL ALETADO COM ANIMAÇÃO REAL DE ROTAÇÃO
// ----------------------------------------------------------------------------

function renderIndustrialMotor(
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
  const isRunning = Boolean(st.running);
  const rpm = isRunning ? st.rpm || 2920 : 0;
  const r = Math.min(cw, ch) * 0.44;

  // Carcaça circular aletada
  const motorGrad = ctx.createRadialGradient(0, 0, r * 0.2, 0, 0, r);
  motorGrad.addColorStop(0, '#38bdf8');
  motorGrad.addColorStop(0.7, '#0284c7');
  motorGrad.addColorStop(1, '#0369a1');
  ctx.fillStyle = motorGrad;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#075985';
  ctx.lineWidth = 2 * zoom;
  ctx.stroke();

  // Aletas radiais de resfriamento em ferro fundido
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.lineWidth = 1.4 * zoom;
  for (let i = 0; i < 12; i++) {
    const ang = (i * Math.PI * 2) / 12;
    ctx.beginPath();
    ctx.moveTo(Math.cos(ang) * (r * 0.45), Math.sin(ang) * (r * 0.45));
    ctx.lineTo(Math.cos(ang) * r, Math.sin(ang) * r);
    ctx.stroke();
  }

  // Caixa de bornes superior (U1, V1, W1, U2, V2, W2)
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(-cw * 0.3, -r - 10 * zoom, cw * 0.6, 12 * zoom);
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 1 * zoom;
  ctx.strokeRect(-cw * 0.3, -r - 10 * zoom, cw * 0.6, 12 * zoom);

  ctx.fillStyle = '#38bdf8';
  ctx.font = `bold ${Math.max(5.5, 6.5 * zoom)}px monospace`;
  ctx.textAlign = 'center';
  ctx.fillText('U1 V1 W1 • U2 V2 W2', 0, -r - 3 * zoom);

  // Eixo Central e Ventoinha Traseira com Giro Real Contínuo
  const rotAng = isRunning ? (time * 0.015 * (rpm / 100)) % (Math.PI * 2) : 0;
  ctx.save();
  ctx.rotate(rotAng);

  // Pás da ventoinha
  ctx.fillStyle = isRunning ? '#facc15' : '#64748b';
  for (let b = 0; b < 4; b++) {
    ctx.save();
    ctx.rotate((b * Math.PI) / 2);
    ctx.fillRect(-2 * zoom, -r * 0.35, 4 * zoom, r * 0.35);
    ctx.restore();
  }

  // Eixo de aço com chaveta
  drawMetallicTexture(ctx, 0, 0, r * 0.22);
  ctx.fillStyle = '#0284c7';
  ctx.fillRect(r * 0.08, -1.5 * zoom, r * 0.1, 3 * zoom); // Chaveta
  ctx.restore();
}

// ----------------------------------------------------------------------------
// COMUTADOR PARALELO 3-WAY (SPDT) COM VISUALIZAÇÃO DE CONTATO
// ----------------------------------------------------------------------------

function renderThreeWaySwitch(
  ctx: CanvasRenderingContext2D,
  c: any,
  st: DeviceSimulationState,
  cw: number,
  ch: number,
  zoom: number
) {
  const pos = c.params?.position ?? st.state ?? st.position ?? 0;
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 2 * zoom;

  // Terminal COM na base
  ctx.beginPath();
  ctx.arc(0, ch * 0.25, 3 * zoom, 0, Math.PI * 2);
  ctx.arc(-cw * 0.25, -ch * 0.25, 2.5 * zoom, 0, Math.PI * 2);
  ctx.arc(cw * 0.25, -ch * 0.25, 2.5 * zoom, 0, Math.PI * 2);
  ctx.fillStyle = '#38bdf8';
  ctx.fill();
  ctx.stroke();

  // Lâmina basculante comutadora
  ctx.strokeStyle = '#facc15';
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(0, ch * 0.2);
  ctx.lineTo(Number(pos) === 0 ? -cw * 0.22 : cw * 0.22, -ch * 0.2);
  ctx.stroke();

  ctx.fillStyle = '#f1f5f9';
  ctx.font = `bold ${Math.max(7, 8 * zoom)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText(Number(pos) === 0 ? 'ROTA 1' : 'ROTA 2', 0, 0);
}

// ----------------------------------------------------------------------------
// COMUTADOR INTERMEDIÁRIO 4-WAY COM VISUALIZAÇÃO DIRETO / CRUZADO
// ----------------------------------------------------------------------------

function renderFourWaySwitch(
  ctx: CanvasRenderingContext2D,
  c: any,
  st: DeviceSimulationState,
  cw: number,
  ch: number,
  zoom: number
) {
  const crossed = Boolean(c.params?.crossed ?? st.state ?? st.crossed);
  ctx.strokeStyle = crossed ? '#ef4444' : '#10b981';
  ctx.lineWidth = 2 * zoom;

  // 4 Terminais
  const tX = cw * 0.26;
  const tY = ch * 0.26;
  [[-tX, -tY], [tX, -tY], [-tX, tY], [tX, tY]].forEach(([x, y]) => {
    ctx.beginPath();
    ctx.arc(x, y, 2.5 * zoom, 0, Math.PI * 2);
    ctx.fillStyle = '#38bdf8';
    ctx.fill();
    ctx.stroke();
  });

  // Linhas internas comutadas
  ctx.beginPath();
  if (crossed) {
    // Cruzado: 1->4 e 2->3
    ctx.moveTo(-tX, -tY);
    ctx.lineTo(tX, tY);
    ctx.moveTo(tX, -tY);
    ctx.lineTo(-tX, tY);
  } else {
    // Reto: 1->3 e 2->4
    ctx.moveTo(-tX, -tY);
    ctx.lineTo(-tX, tY);
    ctx.moveTo(tX, -tY);
    ctx.lineTo(tX, tY);
  }
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${Math.max(7, 8 * zoom)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText(crossed ? '⤮ CRUZADO' : '⇹ DIRETO', 0, 0);
}

// ----------------------------------------------------------------------------
// BOTOEIRAS INDUSTRIAIS IP65 COM ANEL CROMADO E ATUADOR DE SILICONE
// ----------------------------------------------------------------------------

function renderPushButtonSwitch(
  ctx: CanvasRenderingContext2D,
  c: any,
  d: any,
  st: DeviceSimulationState,
  cw: number,
  ch: number,
  zoom: number
) {
  const isNO = c.code === 'PBNO';
  const isEmergency = Boolean(d.emergency);
  const isPressed = Boolean(st.pressed);

  const rOuter = Math.min(cw, ch) * 0.38;
  drawMetallicTexture(ctx, 0, 0, rOuter, 2.35);

  const travel = isPressed ? 2.5 * zoom : 0;
  const rBtn = isEmergency ? rOuter * 1.05 : rOuter - 4 * zoom;

  // Botão de Silicone / Cogumelo
  const btnGrad = ctx.createRadialGradient(-rBtn * 0.3, -rBtn * 0.3, 1, 0, 0, rBtn);
  if (isEmergency || c.code === 'PBNC') {
    btnGrad.addColorStop(0, '#f87171');
    btnGrad.addColorStop(0.7, '#dc2626');
    btnGrad.addColorStop(1, '#7f1d1d');
  } else {
    btnGrad.addColorStop(0, '#4ade80');
    btnGrad.addColorStop(0.7, '#16a34a');
    btnGrad.addColorStop(1, '#14532d');
  }

  ctx.fillStyle = btnGrad;
  ctx.beginPath();
  ctx.arc(0, travel, rBtn, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${Math.max(7, 9 * zoom)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(isEmergency ? 'EMERG' : isNO ? 'I' : 'O', 0, travel);
}

// ----------------------------------------------------------------------------
// DISPLAYS DIGITAIS LCD PARA INSTRUMENTAÇÃO, SOLAR E INVERSORES
// ----------------------------------------------------------------------------

function renderDigitalLcdPanel(
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
  const lcdW = cw * 0.78;
  const lcdH = ch * 0.52;
  const lcdY = -lcdH / 2 + 2 * zoom;

  // Moldura do LCD
  ctx.fillStyle = '#020617';
  ctx.beginPath();
  ctx.roundRect(-lcdW / 2, lcdY, lcdW, lcdH, 3 * zoom);
  ctx.fill();
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1 * zoom;
  ctx.stroke();

  // Fundo retroiluminado verde/ciano
  ctx.fillStyle = simRunning ? '#064e3b' : '#041e17';
  ctx.fillRect(-lcdW / 2 + 2, lcdY + 2, lcdW - 4, lcdH - 4);

  // Leitura numérica dos parâmetros reais calculados
  let valStr = '0.0';
  let unitStr = 'V';

  if (c.code === 'VM') {
    valStr = (st.voltage || 0).toFixed(0);
    unitStr = 'V';
  } else if (c.code === 'AM') {
    valStr = (st.current || 0).toFixed(1);
    unitStr = 'A';
  } else if (c.code === 'WM') {
    valStr = (st.powerKW || 0).toFixed(2);
    unitStr = 'kW';
  } else if (c.code === 'FREQ') {
    valStr = (st.frequency || 50.0).toFixed(1);
    unitStr = 'Hz';
  } else if (d.kind === 'vfd') {
    valStr = ((c.params?.currentFreq ?? 50.0)).toFixed(1);
    unitStr = 'Hz';
  } else if (d.kind === 'pv_inverter') {
    valStr = ((c.params?.pNom ?? 5000) / 1000).toFixed(1);
    unitStr = 'kW';
  }

  ctx.fillStyle = simRunning ? '#34d399' : '#065f46';
  ctx.font = `bold ${Math.max(10, 13 * zoom)}px 'Courier New', monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${valStr} ${unitStr}`, 0, lcdY + lcdH / 2);
}

// ----------------------------------------------------------------------------
// SINALIZADORES PILOTO E LÂMPADAS
// ----------------------------------------------------------------------------

function renderPilotOrLamp(
  ctx: CanvasRenderingContext2D,
  c: any,
  d: any,
  st: DeviceSimulationState,
  cw: number,
  ch: number,
  zoom: number
) {
  const isOn = Boolean(st.energized || st.isOn);
  const r = Math.min(cw, ch) * 0.35;
  const isRed = c.code === 'PILOT_RED';
  const isGreen = c.code === 'PILOT_GREEN';

  drawMetallicTexture(ctx, 0, 0, r * 1.15);

  const lensGrad = ctx.createRadialGradient(-r * 0.25, -r * 0.25, 1, 0, 0, r);
  if (isOn) {
    if (isRed) {
      lensGrad.addColorStop(0, '#fca5a5');
      lensGrad.addColorStop(0.5, '#ef4444');
      lensGrad.addColorStop(1, '#991b1b');
    } else if (isGreen) {
      lensGrad.addColorStop(0, '#86efac');
      lensGrad.addColorStop(0.5, '#22c55e');
      lensGrad.addColorStop(1, '#15803d');
    } else {
      lensGrad.addColorStop(0, '#fef08a');
      lensGrad.addColorStop(0.5, '#eab308');
      lensGrad.addColorStop(1, '#a16207');
    }
    ctx.shadowColor = isRed ? '#ef4444' : '#22c55e';
    ctx.shadowBlur = 12 * zoom;
  } else {
    lensGrad.addColorStop(0, '#475569');
    lensGrad.addColorStop(1, '#1e293b');
    ctx.shadowColor = 'transparent';
  }

  ctx.fillStyle = lensGrad;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowColor = 'transparent';
}

// ----------------------------------------------------------------------------
// CARGAS REAIS (CHUVEIRO, TOMADAS, AQUECEDOR)
// ----------------------------------------------------------------------------

function renderRealLoadDevice(
  ctx: CanvasRenderingContext2D,
  c: any,
  d: any,
  st: DeviceSimulationState,
  cw: number,
  ch: number,
  zoom: number,
  simRunning: boolean
) {
  const isEnergized = Boolean(st.energized);
  ctx.fillStyle = isEnergized ? '#1e3a8a' : '#0f172a';
  ctx.beginPath();
  ctx.roundRect(-cw * 0.35, -ch * 0.35, cw * 0.7, ch * 0.7, 4 * zoom);
  ctx.fill();

  ctx.fillStyle = isEnergized ? '#60a5fa' : '#64748b';
  ctx.font = `bold ${Math.max(6.5, 8 * zoom)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(c.code === 'LOAD_SHOWER' ? '🚿 CHUVEIRO' : c.code === 'OUTLET' ? '🔌 TOMADA' : 'CARGA', 0, 0);
}

// ----------------------------------------------------------------------------
// PARAFUSOS METÁLICOS DOS BORNES COM ALVÉOLOS PROFUNDOS
// ----------------------------------------------------------------------------

function renderTerminalScrews(
  ctx: CanvasRenderingContext2D,
  c: any,
  d: any,
  cw: number,
  ch: number,
  zoom: number
) {
  if (!d.terminals) return;
  d.terminals.forEach(([tId]: [string, string, string]) => {
    const off = getNormativeTerminalOffset(c, tId);
    const sx = off.x * zoom;
    const sy = off.y * zoom;

    // Alvéolo escavado
    ctx.fillStyle = '#05070f';
    ctx.beginPath();
    ctx.arc(sx, sy, 4.5 * zoom, 0, Math.PI * 2);
    ctx.fill();

    // Parafuso Pozidriv
    drawIndustrialScrew(ctx, sx, sy, 3.5 * zoom, 0.5);
  });
}

// ----------------------------------------------------------------------------
// EFEITOS DINÂMICOS DE FALHA (ARCO ELÉTRICO ⚡ E FUMAÇA 💨)
// ----------------------------------------------------------------------------

function renderFaultEffects(
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
    const smokeY = -ch / 2 - (time * 0.05) % (40 * zoom);
    ctx.fillStyle = 'rgba(100, 116, 139, 0.45)';
    ctx.beginPath();
    ctx.arc(0, smokeY, 8 * zoom, 0, Math.PI * 2);
    ctx.arc(4 * zoom, smokeY - 6 * zoom, 12 * zoom, 0, Math.PI * 2);
    ctx.fill();
  }

  // Faíscas e arco elétrico (⚡)
  if (st.sparking || st.fault) {
    ctx.strokeStyle = '#fef08a';
    ctx.shadowColor = '#eab308';
    ctx.shadowBlur = 15 * zoom;
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.moveTo(-cw * 0.2, 0);
    ctx.lineTo(-cw * 0.05, -8 * zoom);
    ctx.lineTo(cw * 0.05, 6 * zoom);
    ctx.lineTo(cw * 0.2, 0);
    ctx.stroke();
  }

  ctx.restore();
}
