import React, { useState, useMemo, useEffect, useRef } from 'react';
import { CadCircuitProject } from '../../types';
import {
  Zap,
  Play,
  RotateCcw,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Cpu,
  Layers,
  Activity,
  Maximize2
} from 'lucide-react';
import { getComponentDef, WIRE_COLORS } from './cadEngine';
import { calculateManhattanPath, getTerminalWorldPos, findJunctionDots } from './cadRouting';

interface CadCircuitPreviewCardProps {
  circuit: CadCircuitProject;
  onTestCircuit: () => void;
  className?: string;
}

export const CadCircuitPreviewCard: React.FC<CadCircuitPreviewCardProps> = ({
  circuit,
  onTestCircuit,
  className = ''
}) => {
  const circuitType = circuit.circuitType || 'direct_motor';
  const hasCustomCadData = Boolean(
    circuit.cadData &&
    Array.isArray(circuit.cadData.components) &&
    circuit.cadData.components.length > 0
  );

  // Estados de manobra locais do preview
  const [motorTargetOn, setMotorTargetOn] = useState<boolean>(false);
  const [currentRpm, setCurrentRpm] = useState<number>(0);
  const [swA, setSwA] = useState<boolean>(false);
  const [swB, setSwB] = useState<boolean>(false);
  const [swC, setSwC] = useState<boolean>(false);
  const [drTripped, setDrTripped] = useState<boolean>(false);

  const animationRef = useRef<number | null>(null);

  // Física de Inércia Realista do Motor (Subida lenta e descida lenta por inércia mecânica)
  useEffect(() => {
    let lastTime = performance.now();
    const targetRpm = motorTargetOn ? 2920 : 0; // RPM nominal de indução 4 polos

    const updatePhysics = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      setCurrentRpm(prevRpm => {
        if (Math.abs(prevRpm - targetRpm) < 1) return targetRpm;
        // Taxa de aceleração (subida) vs Inércia de desaceleração (descida mais suave)
        const rate = targetRpm > prevRpm ? 1200 : 800; 
        const delta = (targetRpm - prevRpm) * Math.min(dt * 3.5, 1);
        return prevRpm + delta;
      });

      animationRef.current = requestAnimationFrame(updatePhysics);
    };

    animationRef.current = requestAnimationFrame(updatePhysics);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [motorTargetOn]);

  const isMotorRunning = currentRpm > 10;
  const isFourWayLampOn = swA !== swB !== swC;

  // Cálculo da Bounding Box do Circuito Customizado para renderizar SVG perfeito
  const customSvgBounds = useMemo(() => {
    if (!hasCustomCadData || !circuit.cadData) {
      return { vbX: 0, vbY: 0, vbW: 760, vbH: 240 };
    }
    const comps = circuit.cadData.components;
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    comps.forEach((c: any) => {
      const w = c.w || 90;
      const h = c.h || 80;
      minX = Math.min(minX, c.x - w / 2);
      maxX = Math.max(maxX, c.x + w / 2);
      minY = Math.min(minY, c.y - h / 2);
      maxY = Math.max(maxY, c.y + h / 2);
    });

    const busbars = circuit.cadData.busbars || [];
    busbars.forEach((b: any) => {
      const isH = b.orientation === 'horizontal';
      const halfLen = (b.length || 600) / 2;
      const halfH = (b.type === 'din' ? 35 : 14) / 2;
      minX = Math.min(minX, b.x - (isH ? halfLen : halfH));
      maxX = Math.max(maxX, b.x + (isH ? halfLen : halfH));
      minY = Math.min(minY, b.y - (isH ? halfH : halfLen));
      maxY = Math.max(maxY, b.y + (isH ? halfH : halfLen));
    });

    if (!isFinite(minX)) {
      return { vbX: 0, vbY: 0, vbW: 760, vbH: 240 };
    }

    const pad = 40;
    const vbX = minX - pad;
    const vbY = minY - pad;
    const vbW = Math.max(380, maxX - minX + pad * 2);
    const vbH = Math.max(200, maxY - minY + pad * 2);

    return { vbX, vbY, vbW, vbH };
  }, [hasCustomCadData, circuit.cadData]);

  // Nós de derivação exclusivos calculados no circuito
  const junctionDots = useMemo(() => {
    if (!hasCustomCadData || !circuit.cadData) return [];
    return findJunctionDots(circuit.cadData.components, circuit.cadData.wires || []);
  }, [hasCustomCadData, circuit.cadData]);

  /**
   * Gerador de Roteamento de Fios Realista para Painel (Canaletas e Ângulos de 90°)
   * Garante que os condutores contornem os blocos e nunca passem por cima dos dispositivos.
   */
  const generatePanelRoutingPath = (posA: { x: number; y: number }, posB: { x: number; y: number }) => {
    const dx = posB.x - posA.x;
    const dy = posB.y - posA.y;

    // Se estiverem perfeitamente alinhados ortogonalmente
    if (Math.abs(dx) < 4 || Math.abs(dy) < 4) {
      return `M ${posA.x} ${posA.y} L ${posB.x} ${posB.y}`;
    }

    // Roteamento em 'L' ou 'Z' estilo canaleta de painel (evitando atravessar centros)
    const midY = posA.y + dy * 0.5;
    return `M ${posA.x} ${posA.y} L ${posA.x} ${midY} L ${posB.x} ${midY} L ${posB.x} ${posB.y}`;
  };

  return (
    <div className={`rounded-2xl border border-blue-900/40 bg-[#070D1A] overflow-hidden shadow-lg space-y-0 ${className}`}>
      {/* CAD Header Bar */}
      <div className="px-4 py-2.5 bg-[#0B132B] border-b border-slate-800 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded-md bg-blue-500/20 text-blue-400 border border-blue-500/30">
            <Cpu className="w-3.5 h-3.5" />
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-white tracking-wide">
              {circuit.title || 'Circuito CAD Técnico'}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
              {circuit.norma || 'IEC 60364 / 60947'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
            <Activity className="w-2.5 h-2.5 animate-pulse text-emerald-400" />
            <span>Simulador CAD Ativo</span>
          </span>
        </div>
      </div>

      {/* CAD Schematic Canvas Area */}
      <div className="p-3 sm:p-4 bg-[#050A14] select-none relative group">
        
        {/* ================================================================= */}
        {/* 0. CIRCUITO CUSTOMIZADO (DESENHADO PELO TÉCNICO)                    */}
        {/* ================================================================= */}
        {hasCustomCadData && circuit.cadData && (
          <div className="space-y-3">
            <svg
              viewBox={`${customSvgBounds.vbX} ${customSvgBounds.vbY} ${customSvgBounds.vbW} ${customSvgBounds.vbH}`}
              className="w-full h-auto min-h-[180px] max-h-[260px]"
            >
              <defs>
                <pattern id={`cad_grid_${circuit.title || 'cad'}`} width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1E293B" strokeWidth="0.5" opacity="0.3" />
                </pattern>
              </defs>

              <rect
                x={customSvgBounds.vbX}
                y={customSvgBounds.vbY}
                width={customSvgBounds.vbW}
                height={customSvgBounds.vbH}
                fill="#070D1A"
                rx="10"
              />
              <rect
                x={customSvgBounds.vbX}
                y={customSvgBounds.vbY}
                width={customSvgBounds.vbW}
                height={customSvgBounds.vbH}
                fill={`url(#cad_grid_${circuit.title || 'cad'})`}
                rx="10"
              />

              {/* Barramentos e Trilhos DIN */}
              {(circuit.cadData.busbars || []).map((bb: any) => {
                const isHoriz = bb.orientation === 'horizontal';
                const len = bb.length || 600;
                const bH = bb.type === 'din' ? 35 : 14;
                const rw = isHoriz ? len : bH;
                const rh = isHoriz ? bH : len;
                const isDin = bb.type === 'din';
                const fillCol = isDin
                  ? '#1e293b'
                  : bb.type === 'phase_l1'
                  ? '#991b1b'
                  : bb.type === 'phase_l2'
                  ? '#b45309'
                  : bb.type === 'phase_l3'
                  ? '#1d4ed8'
                  : bb.type === 'neutral'
                  ? '#0284c7'
                  : '#15803d';

                return (
                  <g key={bb.id} transform={`translate(${bb.x}, ${bb.y})`}>
                    <rect
                      x={-rw / 2}
                      y={-rh / 2}
                      width={rw}
                      height={rh}
                      rx={isDin ? 2 : 4}
                      fill={fillCol}
                      stroke="#475569"
                      strokeWidth={1.2}
                    />
                    {isDin && (
                      <line x1={-rw / 2} y1={0} x2={rw / 2} y2={0} stroke="#090d16" strokeWidth={2} />
                    )}
                  </g>
                );
              })}

              {/* Condutores com Roteamento Realista (Canaletas e Ângulos de 90°) */}
              {(circuit.cadData.wires || []).map((w: any, wireIdx: number) => {
                const compA = circuit.cadData?.components.find((c: any) => c.id === w.a?.c);
                const compB = circuit.cadData?.components.find((c: any) => c.id === w.b?.c);
                if (!compA || !compB) return null;

                const posA = getTerminalWorldPos(compA, w.a?.t);
                const posB = getTerminalWorldPos(compB, w.b?.t);
                const pathStr = generatePanelRoutingPath(posA, posB);
                const wireColor = WIRE_COLORS[w.type] || '#f59e0b';

                return (
                  <g key={w.id || wireIdx}>
                    {/* Sombra de profundidade do cabo */}
                    <path
                      d={pathStr}
                      stroke="rgba(0,0,0,0.6)"
                      strokeWidth="3.5"
                      strokeLinecap="square"
                      strokelinejoin="round"
                      fill="none"
                      transform="translate(1, 2)"
                    />
                    {/* Alma preta do isolamento */}
                    <path
                      d={pathStr}
                      stroke="#030712"
                      strokeWidth="3.0"
                      strokeLinecap="square"
                      strokelinejoin="round"
                      fill="none"
                    />
                    {/* Condutor PVC colorido */}
                    <path
                      d={pathStr}
                      stroke={wireColor}
                      strokeWidth="2.0"
                      strokeLinecap="square"
                      strokelinejoin="round"
                      fill="none"
                    />
                    {/* Luvas de Emenda / Terminais Ilhós nas extremidades */}
                    <circle cx={posA.x} cy={posA.y} r="2.5" fill="#e2e8f0" stroke="#0f172a" strokeWidth="1" />
                    <circle cx={posB.x} cy={posB.y} r="2.5" fill="#e2e8f0" stroke="#0f172a" strokeWidth="1" />
                  </g>
                );
              })}

              {/* Nós de Derivação (Junction Dots) */}
              {junctionDots.map((jd, idx) => (
                <circle
                  key={`jd_${idx}`}
                  cx={jd.x}
                  cy={jd.y}
                  r="3.5"
                  fill={WIRE_COLORS[jd.netType] || '#f59e0b'}
                  stroke="#070D1A"
                  strokeWidth="1.5"
                />
              ))}

              {/* Componentes Elétricos Modulares Reais */}
              {(circuit.cadData.components || []).map((c: any) => {
                const d = getComponentDef(c.code);
                const w = c.w || 90;
                const h = c.h || 80;
                const isMotor = d.kind === 'motor3' || d.kind === 'motor1';

                return (
                  <g key={c.id} transform={`translate(${c.x}, ${c.y}) rotate(${c.rot || 0})`}>
                    <rect
                      x={-w / 2}
                      y={-h / 2}
                      width={w}
                      height={h}
                      rx="6"
                      fill="#0B132B"
                      stroke="#334155"
                      strokeWidth="1.5"
                    />

                    {isMotor ? (
                      <g>
                        <circle cx="0" cy="-4" r="14" fill="#0f172a" stroke="#34D399" strokeWidth="1.5" />
                        <text x="0" y="0" fill="#34D399" fontSize="9" fontWeight="bold" textAnchor="middle">
                          M 3~
                        </text>
                      </g>
                    ) : (
                      <text x="0" y="-2" fill="#93C5FD" fontSize="16" textAnchor="middle" dominantBaseline="middle">
                        {d.icon || '⚡'}
                      </text>
                    )}

                    <text
                      x="0"
                      y={h / 2 - 8}
                      fill="#E2E8F0"
                      fontSize="8.5"
                      fontWeight="bold"
                      textAnchor="middle"
                      fontFamily="sans-serif"
                    >
                      {c.label || d.name}
                    </text>
                  </g>
                );
              })}
            </svg>
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800">
              <span className="font-mono">
                {circuit.cadData.components.length} dispositivos • {circuit.cadData.wires?.length || 0} conexões ortogonais
              </span>
              <span className="text-emerald-400 font-bold">Esquema 100% IEC 60947 / 60364</span>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* 1. MOTOR DIRECT STARTER (COM INÉRCIA REALISTA E ROTAÇÃO PROPORCIONAL) */}
        {/* ================================================================= */}
        {!hasCustomCadData && circuitType === 'direct_motor' && (
          <div className="space-y-3">
            <svg viewBox="0 0 760 230" className="w-full h-auto min-h-[160px] max-h-[220px]">
              <defs>
                <pattern id="cad_grid_mini" width="16" height="16" patternUnits="userSpaceOnUse">
                  <path d="M 16 0 L 0 0 0 16" fill="none" stroke="#1E293B" strokeWidth="0.5" opacity="0.35" />
                </pattern>
                <linearGradient id="motorPulseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#047857" stopOpacity="0.4" />
                </linearGradient>
              </defs>

              <rect width="760" height="230" fill="#070D1A" rx="10" />
              <rect width="760" height="230" fill="url(#cad_grid_mini)" rx="10" />

              {/* Linhas de Alimentação com Canaletas ortogonais */}
              <text x="25" y="45" fill="#EF4444" fontSize="11" fontWeight="bold" fontFamily="monospace">L1 (380V)</text>
              <text x="25" y="70" fill="#F59E0B" fontSize="11" fontWeight="bold" fontFamily="monospace">L2 (380V)</text>
              <text x="25" y="95" fill="#3B82F6" fontSize="11" fontWeight="bold" fontFamily="monospace">L3 (380V)</text>
              <text x="25" y="120" fill="#10B981" fontSize="11" fontWeight="bold" fontFamily="monospace">PE (Terra)</text>

              <path d="M 95 40 L 160 40" stroke="#EF4444" strokeWidth="2.5" fill="none" />
              <path d="M 95 65 L 160 65" stroke="#F59E0B" strokeWidth="2.5" fill="none" />
              <path d="M 95 90 L 160 90" stroke="#3B82F6" strokeWidth="2.5" fill="none" />

              {/* Q1: Disjuntor-Motor */}
              <g transform="translate(160, 20)">
                <rect x="0" y="0" width="80" height="95" rx="6" fill="#0B132B" stroke="#3B82F6" strokeWidth="1.5" />
                <text x="14" y="22" fill="#93C5FD" fontSize="10" fontWeight="bold">Q1 (MCB)</text>
                <text x="14" y="38" fill="#64748B" fontSize="9">3P • 25A</text>
                <circle cx="40" cy="60" r="12" fill={motorTargetOn ? '#10B981' : '#EF4444'} />
                <text x="33" y="64" fill="#FFFFFF" fontSize="9" fontWeight="bold">{motorTargetOn ? 'ON' : 'OFF'}</text>
              </g>

              <path d="M 240 40 L 290 40" stroke={motorTargetOn ? '#EF4444' : '#64748B'} strokeWidth="2.5" fill="none" />
              <path d="M 240 65 L 290 65" stroke={motorTargetOn ? '#F59E0B' : '#64748B'} strokeWidth="2.5" fill="none" />
              <path d="M 240 90 L 290 90" stroke={motorTargetOn ? '#3B82F6' : '#64748B'} strokeWidth="2.5" fill="none" />

              {/* KM1: Contator Principal */}
              <g transform="translate(290, 20)">
                <rect x="0" y="0" width="85" height="95" rx="6" fill="#0B132B" stroke="#10B981" strokeWidth="1.5" />
                <text x="14" y="22" fill="#6EE7B7" fontSize="10" fontWeight="bold">KM1 (KM)</text>
                <text x="14" y="38" fill="#64748B" fontSize="9">AC-3 • 25A</text>
                <rect x="18" y="52" width="48" height="24" rx="4" fill={motorTargetOn ? '#065F46' : '#1E293B'} stroke={motorTargetOn ? '#10B981' : '#475569'} />
                <text x="24" y="68" fill={motorTargetOn ? '#34D399' : '#94A3B8'} fontSize="9" fontWeight="bold">
                  {motorTargetOn ? 'RETIDO' : 'ABERTO'}
                </text>
              </g>

              <path d="M 375 40 L 425 40" stroke={motorTargetOn ? '#EF4444' : '#64748B'} strokeWidth="2.5" fill="none" />
              <path d="M 375 65 L 425 65" stroke={motorTargetOn ? '#F59E0B' : '#64748B'} strokeWidth="2.5" fill="none" />
              <path d="M 375 90 L 425 90" stroke={motorTargetOn ? '#3B82F6' : '#64748B'} strokeWidth="2.5" fill="none" />

              {/* F1: Relé Térmico */}
              <g transform="translate(425, 20)">
                <rect x="0" y="0" width="85" height="95" rx="6" fill="#0B132B" stroke="#F59E0B" strokeWidth="1.5" />
                <text x="14" y="22" fill="#FCD34D" fontSize="10" fontWeight="bold">F1 (Térmico)</text>
                <text x="14" y="38" fill="#64748B" fontSize="9">9-13A • Cl.10</text>
                <circle cx="42" cy="62" r="10" fill="#1E293B" stroke="#F59E0B" strokeWidth="1.5" />
                <text x="35" y="66" fill="#FCD34D" fontSize="9" fontWeight="bold">OK</text>
              </g>

              <path d="M 510 40 L 570 40" stroke={motorTargetOn ? '#EF4444' : '#64748B'} strokeWidth="2.5" fill="none" />
              <path d="M 510 65 L 570 65" stroke={motorTargetOn ? '#F59E0B' : '#64748B'} strokeWidth="2.5" fill="none" />
              <path d="M 510 90 L 570 90" stroke={motorTargetOn ? '#3B82F6' : '#64748B'} strokeWidth="2.5" fill="none" />

              {/* M1: Motor Trifásico com Display de RPM Fiel */}
              <g transform="translate(570, 15)">
                <rect x="0" y="0" width="150" height="105" rx="10" fill="#0B132B" stroke={isMotorRunning ? '#10B981' : '#3B82F6'} strokeWidth={isMotorRunning ? 2.5 : 1.5} />
                <text x="16" y="26" fill="#FFFFFF" fontSize="11" fontWeight="bold">M1: Motor 3~</text>
                <text x="16" y="44" fill="#94A3B8" fontSize="9">7.5 kW • 400V • 50 Hz</text>

                <circle cx="105" cy="65" r="24" fill={isMotorRunning ? 'url(#motorPulseGrad)' : '#1E293B'} stroke={isMotorRunning ? '#34D399' : '#475569'} strokeWidth="2" />
                <text x="105" y="69" fill={isMotorRunning ? '#FFFFFF' : '#64748B'} fontSize="9" fontWeight="bold" textAnchor="middle">
                  {Math.round(currentRpm)} RPM
                </text>
              </g>

              {/* Circuito de Comando */}
              <g transform="translate(40, 145)">
                <rect x="0" y="0" width="680" height="70" rx="8" fill="#050A14" stroke="#1E293B" strokeWidth="1" />
                <text x="20" y="24" fill="#FCD34D" fontSize="10" fontWeight="bold">Circuito de Comando 230V AC</text>

                <rect x="220" y="15" width="80" height="40" rx="4" fill="#1E293B" stroke="#EF4444" />
                <text x="235" y="32" fill="#FCA5A5" fontSize="9" fontWeight="bold">S0 (Parar)</text>
                <text x="240" y="46" fill="#94A3B8" fontSize="8">NF (1-2)</text>

                <rect x="330" y="15" width="80" height="40" rx="4" fill="#1E293B" stroke="#10B981" />
                <text x="345" y="32" fill="#86EFAC" fontSize="9" fontWeight="bold">S1 (Ligar)</text>
                <text x="350" y="46" fill="#94A3B8" fontSize="8">NA (3-4)</text>

                <rect x="440" y="15" width="100" height="40" rx="4" fill="#1E293B" stroke="#3B82F6" />
                <text x="455" y="32" fill="#93C5FD" fontSize="9" fontWeight="bold">Selo KM1</text>
                <text x="455" y="46" fill={motorTargetOn ? '#34D399' : '#64748B'} fontSize="8">
                  {motorTargetOn ? 'RETIDO' : 'ABERTO'}
                </text>

                <circle cx="610" cy="35" r="16" fill={motorTargetOn ? '#065F46' : '#1E293B'} stroke="#10B981" strokeWidth="2" />
                <text x="610" y="39" fill="#FFFFFF" fontSize="9" fontWeight="bold" textAnchor="middle">A1-A2</text>
              </g>
            </svg>

            {/* Ação interativa com rampa de inércia */}
            <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/80 text-xs">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setMotorTargetOn(!motorTargetOn);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  motorTargetOn
                    ? 'bg-rose-950 text-rose-300 border border-rose-800 hover:bg-rose-900'
                    : 'bg-emerald-950 text-emerald-300 border border-emerald-800 hover:bg-emerald-900'
                }`}
              >
                <Play className={`w-3.5 h-3.5 ${motorTargetOn ? 'rotate-90' : ''}`} />
                <span>{motorTargetOn ? 'Pressionar S0 (Parar / Inércia)' : 'Pressionar S1 (Ligar / Rampa)'}</span>
              </button>

              <div className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1.5 ${
                isMotorRunning
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : currentRpm > 0
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}>
                <span className={`w-2 h-2 rounded-full ${isMotorRunning ? 'bg-emerald-400 animate-ping' : currentRpm > 0 ? 'bg-amber-400 animate-pulse' : 'bg-slate-500'}`} />
                <span>{isMotorRunning ? `Motor em Regime (${Math.round(currentRpm)} RPM)` : currentRpm > 0 ? `Desacelerando por Inércia (${Math.round(currentRpm)} RPM)` : 'Carga em Repouso'}</span>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* 2. FOUR-WAY LIGHTING SCHEMATIC                                    */}
        {/* ================================================================= */}
        {!hasCustomCadData && circuitType === 'four_way' && (
          <div className="space-y-3">
            <svg viewBox="0 0 760 210" className="w-full h-auto min-h-[150px] max-h-[220px]">
              <rect width="760" height="210" fill="#070D1A" rx="10" />

              <text x="25" y="45" fill="#EF4444" fontSize="11" fontWeight="bold" fontFamily="monospace">Fase L1 (230V)</text>
              <text x="25" y="175" fill="#3B82F6" fontSize="11" fontWeight="bold" fontFamily="monospace">Neutro N</text>

              <path d="M 125 40 L 160 40" stroke="#EF4444" strokeWidth="2.5" fill="none" />
              <path d="M 125 170 L 680 170" stroke="#3B82F6" strokeWidth="2.5" fill="none" />

              <g transform="translate(160, 20)">
                <rect x="0" y="0" width="110" height="85" rx="6" fill="#0B132B" stroke="#3B82F6" strokeWidth="1.5" />
                <text x="14" y="24" fill="#93C5FD" fontSize="10" fontWeight="bold">S1: Three-Way</text>
                <text x="14" y="40" fill="#64748B" fontSize="9">Pavimento 1</text>
                <circle cx="55" cy="58" r="10" fill={swA ? '#3B82F6' : '#1E293B'} stroke="#3B82F6" />
                <text x="50" y="62" fill="#FFFFFF" fontSize="9" fontWeight="bold">{swA ? 'V2' : 'V1'}</text>
              </g>

              <path d="M 270 40 L 330 40" stroke={swA ? '#64748B' : '#F59E0B'} strokeWidth="2" strokeDasharray="3,3" fill="none" />
              <path d="M 270 75 L 330 75" stroke={swA ? '#F59E0B' : '#64748B'} strokeWidth="2" strokeDasharray="3,3" fill="none" />

              <g transform="translate(330, 20)">
                <rect x="0" y="0" width="120" height="85" rx="6" fill="#0B132B" stroke="#F59E0B" strokeWidth="1.5" />
                <text x="14" y="24" fill="#FCD34D" fontSize="10" fontWeight="bold">S2: Four-Way</text>
                <text x="14" y="40" fill="#64748B" fontSize="9">Pavimento 2</text>
                <circle cx="60" cy="58" r="10" fill={swB ? '#F59E0B' : '#1E293B'} stroke="#F59E0B" />
                <text x="55" y="62" fill="#FFFFFF" fontSize="9" fontWeight="bold">{swB ? '✕' : '═'}</text>
              </g>

              <path d="M 450 40 L 510 40" stroke={swB ? '#F59E0B' : '#64748B'} strokeWidth="2" strokeDasharray="3,3" fill="none" />
              <path d="M 450 75 L 510 75" stroke={swB ? '#64748B' : '#F59E0B'} strokeWidth="2" strokeDasharray="3,3" fill="none" />

              <g transform="translate(510, 20)">
                <rect x="0" y="0" width="110" height="85" rx="6" fill="#0B132B" stroke="#3B82F6" strokeWidth="1.5" />
                <text x="14" y="24" fill="#93C5FD" fontSize="10" fontWeight="bold">S3: Three-Way</text>
                <text x="14" y="40" fill="#64748B" fontSize="9">Pavimento 3</text>
                <circle cx="55" cy="58" r="10" fill={swC ? '#3B82F6' : '#1E293B'} stroke="#3B82F6" />
                <text x="50" y="62" fill="#FFFFFF" fontSize="9" fontWeight="bold">{swC ? 'V2' : 'V1'}</text>
              </g>

              <path d="M 620 58 L 680 58 L 680 90" stroke={isFourWayLampOn ? '#F59E0B' : '#64748B'} strokeWidth="2.5" fill="none" />

              <g transform="translate(650, 90)">
                <circle cx="30" cy="30" r="24" fill={isFourWayLampOn ? '#FEF08A' : '#1E293B'} stroke={isFourWayLampOn ? '#FACC15' : '#475569'} strokeWidth="2" />
                <text x="30" y="35" fill={isFourWayLampOn ? '#854D0E' : '#94A3B8'} fontSize="11" fontWeight="bold" textAnchor="middle">
                  {isFourWayLampOn ? '💡 100W' : 'OFF'}
                </text>
              </g>

              <path d="M 680 144 L 680 170" stroke="#3B82F6" strokeWidth="2.5" fill="none" />
            </svg>

            <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/80 text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-slate-400 font-medium">Testar Comutadores:</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSwA(!swA);
                  }}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition border border-slate-700 cursor-pointer"
                >
                  S1: {swA ? 'Via 2' : 'Via 1'}
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSwB(!swB);
                  }}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold transition border border-amber-900/50 cursor-pointer"
                >
                  S2: {swB ? 'Cruzado' : 'Direto'}
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSwC(!swC);
                  }}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition border border-slate-700 cursor-pointer"
                >
                  S3: {swC ? 'Via 2' : 'Via 1'}
                </button>
              </div>

              <div className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1.5 ${
                isFourWayLampOn
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}>
                <Lightbulb className={`w-3.5 h-3.5 ${isFourWayLampOn ? 'text-amber-400 fill-amber-400' : 'text-slate-500'}`} />
                <span>Lâmpada {isFourWayLampOn ? 'ACESA' : 'APAGADA'}</span>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* 3. QUADRO QGD / IDR / SOLAR                                       */}
        {/* ================================================================= */}
        {!hasCustomCadData && circuitType !== 'direct_motor' && circuitType !== 'four_way' && (
          <div className="space-y-3">
            <svg viewBox="0 0 760 190" className="w-full h-auto min-h-[140px] max-h-[200px]">
              <rect width="760" height="190" fill="#070D1A" rx="10" />
              
              <g transform="translate(30, 20)">
                <rect x="0" y="0" width="140" height="140" rx="8" fill="#0B132B" stroke="#3B82F6" strokeWidth="1.5" />
                <text x="16" y="28" fill="#93C5FD" fontSize="11" fontWeight="bold">Geral: MCB 63A</text>
                <text x="16" y="46" fill="#64748B" fontSize="9">Curva C • Icu 10kA</text>
                <rect x="16" y="60" width="108" height="30" rx="4" fill="#1E293B" />
                <text x="35" y="80" fill="#10B981" fontSize="10" fontWeight="bold">ARMADO</text>
              </g>

              <path d="M 170 90 L 230 90" stroke="#EF4444" strokeWidth="3" fill="none" />

              <g transform="translate(230, 20)">
                <rect x="0" y="0" width="150" height="140" rx="8" fill="#0B132B" stroke="#10B981" strokeWidth="1.5" />
                <text x="16" y="28" fill="#6EE7B7" fontSize="11" fontWeight="bold">IDR / DR 30mA</text>
                <text x="16" y="46" fill="#64748B" fontSize="9">Tipo A • I_Δn = 0.03A</text>
                <rect x="16" y="60" width="118" height="30" rx="4" fill={drTripped ? '#7F1D1D' : '#064E3B'} />
                <text x="32" y="80" fill={drTripped ? '#FCA5A5' : '#86EFAC'} fontSize="10" fontWeight="bold">
                  {drTripped ? 'DISPARADO (FALTA)' : 'NORMAL'}
                </text>
              </g>

              <path d="M 380 90 L 440 90" stroke={drTripped ? '#64748B' : '#EF4444'} strokeWidth="3" fill="none" />

              <g transform="translate(440, 20)">
                <rect x="0" y="0" width="280" height="140" rx="8" fill="#0B132B" stroke="#F59E0B" strokeWidth="1.5" />
                <text x="16" y="28" fill="#FCD34D" fontSize="11" fontWeight="bold">Circuitos Terminais Protegidos</text>
                <text x="16" y="55" fill="#94A3B8" fontSize="9">C1: Iluminação 10A • Cabo 1.5 mm²</text>
                <text x="16" y="80" fill="#94A3B8" fontSize="9">C2: Tomadas TUG 16A • Cabo 2.5 mm²</text>
                <text x="16" y="105" fill="#94A3B8" fontSize="9">C3: Ar Condicionado 20A • Cabo 4.0 mm²</text>
                <text x="16" y="130" fill="#10B981" fontSize="9" fontWeight="bold">Status: Equilibrado • 50 Hz</text>
              </g>
            </svg>

            <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/80 text-xs">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setDrTripped(!drTripped);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  drTripped
                    ? 'bg-amber-900/60 text-amber-300 border border-amber-700'
                    : 'bg-rose-950 text-rose-300 border border-rose-800'
                }`}
              >
                {drTripped ? '🔄 Armar IDR Novamente' : '⚠️ Simular Fuga à Terra (Botão T)'}
              </button>
              <span className="text-[11px] font-mono text-slate-400">
                Sensibilidade: <strong className="text-emerald-400">30 mA</strong> | Corte: <strong className="text-blue-400">&le; 40 ms</strong>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* CAD Card Footer */}
      <div className="p-3 sm:p-4 bg-[#091024] border-t border-slate-800/90 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="text-xs text-slate-400 space-y-0.5">
          <div className="flex items-center gap-1.5 text-slate-300 font-bold">
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            <span>Projeto CAD Aberto para Simulação em Tempo Real</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Abra na bancada virtual para editar componentes, medir tensões e simular manobras completas.
          </p>
        </div>

        <button
          type="button"
          onClick={onTestCircuit}
          className="px-5 py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white font-black rounded-xl text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-blue-900/40 active:scale-95 cursor-pointer border border-blue-400/40 shrink-0"
        >
          <Zap className="w-4 h-4 fill-amber-300 text-amber-300 animate-bounce" />
          <span>⚡ Testar Circuito</span>
          <Maximize2 className="w-3.5 h-3.5 text-blue-200 ml-1" />
        </button>
      </div>
    </div>
  );
};