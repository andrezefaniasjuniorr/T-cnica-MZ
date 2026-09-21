import React, { useState, useMemo } from 'react';
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

  // Mini interatividade local no preview do feed
  const [motorOn, setMotorOn] = useState<boolean>(false);
  const [swA, setSwA] = useState<boolean>(false);
  const [swB, setSwB] = useState<boolean>(false);
  const [swC, setSwC] = useState<boolean>(false);
  const [drTripped, setDrTripped] = useState<boolean>(false);

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

  // Nós de derivação exclusivos (Junction Dots) calculados no circuito
  const junctionDots = useMemo(() => {
    if (!hasCustomCadData || !circuit.cadData) return [];
    return findJunctionDots(circuit.cadData.components, circuit.cadData.wires || []);
  }, [hasCustomCadData, circuit.cadData]);

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
        {/* 0. CIRCUITO CUSTOMIZADO FIEL (DESENHADO PELO TÉCNICO NO WORKBENCH) */}
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

              {/* Condutores Manhattan Ortogonais a 90° */}
              {(circuit.cadData.wires || []).map((w: any, wireIdx: number) => {
                const compA = circuit.cadData?.components.find((c: any) => c.id === w.a?.c);
                const compB = circuit.cadData?.components.find((c: any) => c.id === w.b?.c);
                if (!compA || !compB) return null;

                const posA = getTerminalWorldPos(compA, w.a?.t);
                const posB = getTerminalWorldPos(compB, w.b?.t);
                const pathPts = calculateManhattanPath(posA, posB, wireIdx);
                if (pathPts.length === 0) return null;

                const dStr = pathPts.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                const wireColor = WIRE_COLORS[w.type] || '#f59e0b';

                return (
                  <path
                    key={w.id || wireIdx}
                    d={dStr}
                    stroke={wireColor}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                );
              })}

              {/* Nós de derivação exclusivos (Junction Dots em derivações T) */}
              {junctionDots.map((jd, idx) => (
                <circle
                  key={`jd_${idx}`}
                  cx={jd.x}
                  cy={jd.y}
                  r="4"
                  fill={WIRE_COLORS[jd.netType] || '#f59e0b'}
                  stroke="#050A14"
                  strokeWidth="1.5"
                />
              ))}

              {/* Componentes Elétricos Cadastrados */}
              {(circuit.cadData.components || []).map((c: any) => {
                const d = getComponentDef(c.code);
                const w = c.w || 90;
                const h = c.h || 80;
                const isMotor = d.kind === 'motor3' || d.kind === 'motor1';

                return (
                  <g key={c.id} transform={`translate(${c.x}, ${c.y}) rotate(${c.rot || 0})`}>
                    {/* Corpo do Componente */}
                    <rect
                      x={-w / 2}
                      y={-h / 2}
                      width={w}
                      height={h}
                      rx="8"
                      fill="#0B1528"
                      stroke="#1E3A5F"
                      strokeWidth="1.5"
                    />

                    {/* Símbolo central / Ícone */}
                    {isMotor ? (
                      <g>
                        <circle cx="0" cy="-4" r="15" fill="#1E293B" stroke="#34D399" strokeWidth="1.5" />
                        <text x="0" y="0" fill="#34D399" fontSize="10" fontWeight="bold" textAnchor="middle">
                          M 3~
                        </text>
                      </g>
                    ) : (
                      <text x="0" y="-2" fill="#93C5FD" fontSize="18" textAnchor="middle" dominantBaseline="middle">
                        {d.icon || '⚡'}
                      </text>
                    )}

                    {/* Rótulo / Nome do Componente */}
                    <text
                      x="0"
                      y={h / 2 - 8}
                      fill="#E2E8F0"
                      fontSize="9"
                      fontWeight="bold"
                      textAnchor="middle"
                      fontFamily="sans-serif"
                    >
                      {c.label || d.name}
                    </text>

                    {/* Terminais Normativos */}
                    {d.terminals.map(term => {
                      const tPos = getTerminalWorldPos(c, term[0]);
                      const localX = tPos.x - c.x;
                      const localY = tPos.y - c.y;

                      return (
                        <g key={term[0]}>
                          <circle
                            cx={localX}
                            cy={localY}
                            r="3.5"
                            fill="#38BDF8"
                            stroke="#0B1528"
                            strokeWidth="1.5"
                          />
                          <text
                            x={localX}
                            y={localY < 0 ? localY - 5 : localY + 9}
                            fill="#94A3B8"
                            fontSize="7"
                            fontWeight="bold"
                            textAnchor="middle"
                            fontFamily="monospace"
                          >
                            {term[0]}
                          </text>
                        </g>
                      );
                    })}
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
        {/* 1. MOTOR DIRECT STARTER SCHEMATIC (FALLBACK PRESET)                */}
        {/* ================================================================= */}
        {!hasCustomCadData && circuitType === 'direct_motor' && (
          <div className="space-y-3">
            <svg viewBox="0 0 760 230" className="w-full h-auto min-h-[160px] max-h-[220px]">
              <defs>
                <pattern id="cad_grid_mini" width="16" height="16" patternUnits="userSpaceOnUse">
                  <path d="M 16 0 L 0 0 0 16" fill="none" stroke="#1E293B" strokeWidth="0.5" opacity="0.35" />
                </pattern>
                <linearGradient id="motorPulseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#059669" stopOpacity="0.3" />
                </linearGradient>
              </defs>

              <rect width="760" height="230" fill="#070D1A" rx="10" />
              <rect width="760" height="230" fill="url(#cad_grid_mini)" rx="10" />

              {/* Linhas de Alimentação L1, L2, L3 */}
              <text x="25" y="45" fill="#EF4444" fontSize="11" fontWeight="bold" fontFamily="monospace">L1 (380V)</text>
              <text x="25" y="70" fill="#F59E0B" fontSize="11" fontWeight="bold" fontFamily="monospace">L2 (380V)</text>
              <text x="25" y="95" fill="#3B82F6" fontSize="11" fontWeight="bold" fontFamily="monospace">L3 (380V)</text>
              <text x="25" y="120" fill="#10B981" fontSize="11" fontWeight="bold" fontFamily="monospace">PE (Terra)</text>

              <line x1="95" y1="40" x2="160" y2="40" stroke="#EF4444" strokeWidth="2.5" />
              <line x1="95" y1="65" x2="160" y2="65" stroke="#F59E0B" strokeWidth="2.5" />
              <line x1="95" y1="90" x2="160" y2="90" stroke="#3B82F6" strokeWidth="2.5" />
              <line x1="95" y1="115" x2="630" y2="115" stroke="#10B981" strokeWidth="2" strokeDasharray="5,4" />

              {/* Q1: Disjuntor-Motor */}
              <g transform="translate(160, 20)">
                <rect x="0" y="0" width="80" height="95" rx="6" fill="#0F172A" stroke="#3B82F6" strokeWidth="1.5" />
                <text x="14" y="22" fill="#93C5FD" fontSize="10" fontWeight="bold">Q1 (MCB)</text>
                <text x="14" y="38" fill="#64748B" fontSize="9">3P • 25A</text>
                <circle cx="40" cy="60" r="12" fill={motorOn ? '#10B981' : '#EF4444'} />
                <text x="33" y="64" fill="#FFFFFF" fontSize="9" fontWeight="bold">{motorOn ? 'ON' : 'OFF'}</text>
              </g>

              {/* Fios Q1 -> KM1 */}
              <line x1="240" y1="40" x2="290" y2="40" stroke={motorOn ? '#EF4444' : '#64748B'} strokeWidth="2.5" />
              <line x1="240" y1="65" x2="290" y2="65" stroke={motorOn ? '#F59E0B' : '#64748B'} strokeWidth="2.5" />
              <line x1="240" y1="90" x2="290" y2="90" stroke={motorOn ? '#3B82F6' : '#64748B'} strokeWidth="2.5" />

              {/* KM1: Contator Principal */}
              <g transform="translate(290, 20)">
                <rect x="0" y="0" width="85" height="95" rx="6" fill="#0F172A" stroke="#10B981" strokeWidth="1.5" />
                <text x="14" y="22" fill="#6EE7B7" fontSize="10" fontWeight="bold">KM1 (Contator)</text>
                <text x="14" y="38" fill="#64748B" fontSize="9">AC-3 • 25A</text>
                <rect x="18" y="52" width="48" height="24" rx="4" fill={motorOn ? '#065F46' : '#1E293B'} stroke={motorOn ? '#10B981' : '#475569'} />
                <text x="24" y="68" fill={motorOn ? '#34D399' : '#94A3B8'} fontSize="9" fontWeight="bold">
                  {motorOn ? 'RETIDO' : 'ABERTO'}
                </text>
              </g>

              {/* Fios KM1 -> F1 */}
              <line x1="375" y1="40" x2="425" y2="40" stroke={motorOn ? '#EF4444' : '#64748B'} strokeWidth="2.5" />
              <line x1="375" y1="65" x2="425" y2="65" stroke={motorOn ? '#F59E0B' : '#64748B'} strokeWidth="2.5" />
              <line x1="375" y1="90" x2="425" y2="90" stroke={motorOn ? '#3B82F6' : '#64748B'} strokeWidth="2.5" />

              {/* F1: Relé Térmico de Sobrecarga (OLR) */}
              <g transform="translate(425, 20)">
                <rect x="0" y="0" width="85" height="95" rx="6" fill="#0F172A" stroke="#F59E0B" strokeWidth="1.5" />
                <text x="14" y="22" fill="#FCD34D" fontSize="10" fontWeight="bold">F1 (Térmico)</text>
                <text x="14" y="38" fill="#64748B" fontSize="9">9-13A • Cl.10</text>
                <circle cx="42" cy="62" r="10" fill="#1E293B" stroke="#F59E0B" strokeWidth="1.5" />
                <text x="35" y="66" fill="#FCD34D" fontSize="9" fontWeight="bold">OK</text>
              </g>

              {/* Fios F1 -> Motor M1 */}
              <line x1="510" y1="40" x2="570" y2="40" stroke={motorOn ? '#EF4444' : '#64748B'} strokeWidth="2.5" />
              <line x1="510" y1="65" x2="570" y2="65" stroke={motorOn ? '#F59E0B' : '#64748B'} strokeWidth="2.5" />
              <line x1="510" y1="90" x2="570" y2="90" stroke={motorOn ? '#3B82F6' : '#64748B'} strokeWidth="2.5" />

              {/* Motor Trifásico M1 */}
              <g transform="translate(570, 15)">
                <rect x="0" y="0" width="150" height="105" rx="10" fill="#0F172A" stroke={motorOn ? '#10B981' : '#3B82F6'} strokeWidth={motorOn ? 2.5 : 1.5} />
                <text x="16" y="26" fill="#FFFFFF" fontSize="11" fontWeight="bold">M1: Motor Trifásico</text>
                <text x="16" y="44" fill="#94A3B8" fontSize="9">7.5 kW • 400V • 50 Hz</text>

                {/* Rotor animado */}
                <circle cx="105" cy="65" r="24" fill={motorOn ? 'url(#motorPulseGrad)' : '#1E293B'} stroke={motorOn ? '#34D399' : '#475569'} strokeWidth="2" />
                <text x="105" y="70" fill={motorOn ? '#FFFFFF' : '#64748B'} fontSize="10" fontWeight="bold" textAnchor="middle">
                  {motorOn ? '2920 RPM' : 'PARADO'}
                </text>
              </g>

              {/* Circuito de Comando Simplificado */}
              <g transform="translate(40, 145)">
                <rect x="0" y="0" width="680" height="70" rx="8" fill="#0A1122" stroke="#1E293B" strokeWidth="1" />
                <text x="20" y="24" fill="#FCD34D" fontSize="10" fontWeight="bold">Circuito de Comando 230V AC</text>

                {/* S0 Botoeira NF Desliga */}
                <rect x="220" y="15" width="80" height="40" rx="4" fill="#1E293B" stroke="#EF4444" />
                <text x="235" y="32" fill="#FCA5A5" fontSize="9" fontWeight="bold">S0 (Parar)</text>
                <text x="240" y="46" fill="#94A3B8" fontSize="8">NF (1-2)</text>

                {/* S1 Botoeira NA Liga */}
                <rect x="330" y="15" width="80" height="40" rx="4" fill="#1E293B" stroke="#10B981" />
                <text x="345" y="32" fill="#86EFAC" fontSize="9" fontWeight="bold">S1 (Ligar)</text>
                <text x="350" y="46" fill="#94A3B8" fontSize="8">NA (3-4)</text>

                {/* Selo KM1 */}
                <rect x="440" y="15" width="100" height="40" rx="4" fill="#1E293B" stroke="#3B82F6" />
                <text x="455" y="32" fill="#93C5FD" fontSize="9" fontWeight="bold">Selo KM1 (13-14)</text>
                <text x="455" y="46" fill={motorOn ? '#34D399' : '#64748B'} fontSize="8">
                  {motorOn ? 'RETIDO' : 'ABERTO'}
                </text>

                {/* Bobina KM1 (A1-A2) */}
                <circle cx="610" cy="35" r="16" fill={motorOn ? '#065F46' : '#1E293B'} stroke="#10B981" strokeWidth="2" />
                <text x="610" y="39" fill="#FFFFFF" fontSize="9" fontWeight="bold" textAnchor="middle">A1-A2</text>
              </g>
            </svg>

            {/* Ação rápida de teste no card */}
            <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/80 text-xs">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMotorOn(!motorOn);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    motorOn
                      ? 'bg-rose-950 text-rose-300 border border-rose-800 hover:bg-rose-900'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-800 hover:bg-emerald-900'
                  }`}
                >
                  <Play className={`w-3.5 h-3.5 ${motorOn ? 'rotate-90' : ''}`} />
                  <span>{motorOn ? 'Pressionar S0 (Parar)' : 'Pressionar S1 (Ligar)'}</span>
                </button>
              </div>

              <div className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1.5 ${
                motorOn
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}>
                <span className={`w-2 h-2 rounded-full ${motorOn ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
                <span>{motorOn ? 'Motor Girando a 2920 RPM' : 'Carga em Repouso'}</span>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* 2. FOUR-WAY / THREE-WAY LIGHTING SCHEMATIC (FALLBACK PRESET)       */}
        {/* ================================================================= */}
        {!hasCustomCadData && circuitType === 'four_way' && (
          <div className="space-y-3">
            <svg viewBox="0 0 760 210" className="w-full h-auto min-h-[150px] max-h-[220px]">
              <rect width="760" height="210" fill="#070D1A" rx="10" />

              {/* Barra Fase L1 e Neutro N */}
              <text x="25" y="45" fill="#EF4444" fontSize="11" fontWeight="bold" fontFamily="monospace">Fase L1 (230V)</text>
              <text x="25" y="175" fill="#3B82F6" fontSize="11" fontWeight="bold" fontFamily="monospace">Neutro N</text>

              <line x1="125" y1="40" x2="160" y2="40" stroke="#EF4444" strokeWidth="2.5" />
              <line x1="125" y1="170" x2="680" y2="170" stroke="#3B82F6" strokeWidth="2.5" />

              {/* Three-Way 1 (Pavimento 1) */}
              <g transform="translate(160, 20)">
                <rect x="0" y="0" width="110" height="85" rx="6" fill="#0F172A" stroke="#3B82F6" strokeWidth="1.5" />
                <text x="14" y="24" fill="#93C5FD" fontSize="10" fontWeight="bold">S1: Three-Way</text>
                <text x="14" y="40" fill="#64748B" fontSize="9">Pavimento 1</text>
                <circle cx="55" cy="58" r="10" fill={swA ? '#3B82F6' : '#1E293B'} stroke="#3B82F6" />
                <text x="50" y="62" fill="#FFFFFF" fontSize="9" fontWeight="bold">{swA ? 'V2' : 'V1'}</text>
              </g>

              {/* Vias Paralelas 1 e 2 entre S1 e S2 */}
              <line x1="270" y1="40" x2="330" y2="40" stroke={swA ? '#64748B' : '#F59E0B'} strokeWidth="2" strokeDasharray="3,3" />
              <line x1="270" y1="75" x2="330" y2="75" stroke={swA ? '#F59E0B' : '#64748B'} strokeWidth="2" strokeDasharray="3,3" />

              {/* Four-Way (Pavimento 2 - Intermediário) */}
              <g transform="translate(330, 20)">
                <rect x="0" y="0" width="120" height="85" rx="6" fill="#0F172A" stroke="#F59E0B" strokeWidth="1.5" />
                <text x="14" y="24" fill="#FCD34D" fontSize="10" fontWeight="bold">S2: Four-Way</text>
                <text x="14" y="40" fill="#64748B" fontSize="9">Pavimento 2 (Interm.)</text>
                <circle cx="60" cy="58" r="10" fill={swB ? '#F59E0B' : '#1E293B'} stroke="#F59E0B" />
                <text x="55" y="62" fill="#FFFFFF" fontSize="9" fontWeight="bold">{swB ? '✕' : '═'}</text>
              </g>

              {/* Vias Paralelas 1 e 2 entre S2 e S3 */}
              <line x1="450" y1="40" x2="510" y2="40" stroke={swB ? '#F59E0B' : '#64748B'} strokeWidth="2" strokeDasharray="3,3" />
              <line x1="450" y1="75" x2="510" y2="75" stroke={swB ? '#64748B' : '#F59E0B'} strokeWidth="2" strokeDasharray="3,3" />

              {/* Three-Way 3 (Pavimento 3) */}
              <g transform="translate(510, 20)">
                <rect x="0" y="0" width="110" height="85" rx="6" fill="#0F172A" stroke="#3B82F6" strokeWidth="1.5" />
                <text x="14" y="24" fill="#93C5FD" fontSize="10" fontWeight="bold">S3: Three-Way</text>
                <text x="14" y="40" fill="#64748B" fontSize="9">Pavimento 3</text>
                <circle cx="55" cy="58" r="10" fill={swC ? '#3B82F6' : '#1E293B'} stroke="#3B82F6" />
                <text x="50" y="62" fill="#FFFFFF" fontSize="9" fontWeight="bold">{swC ? 'V2' : 'V1'}</text>
              </g>

              {/* Retorno para a Lâmpada H1 */}
              <line x1="620" y1="58" x2="680" y2="58" stroke={isFourWayLampOn ? '#F59E0B' : '#64748B'} strokeWidth="2.5" />
              <line x1="680" y1="58" x2="680" y2="90" stroke={isFourWayLampOn ? '#F59E0B' : '#64748B'} strokeWidth="2.5" />

              {/* Lâmpada H1 */}
              <g transform="translate(650, 90)">
                <circle cx="30" cy="30" r="24" fill={isFourWayLampOn ? '#FEF08A' : '#1E293B'} stroke={isFourWayLampOn ? '#FACC15' : '#475569'} strokeWidth="2" />
                <text x="30" y="35" fill={isFourWayLampOn ? '#854D0E' : '#94A3B8'} fontSize="11" fontWeight="bold" textAnchor="middle">
                  {isFourWayLampOn ? '💡 100W' : 'OFF'}
                </text>
              </g>

              {/* Neutro subindo para a Lâmpada */}
              <line x1="680" y1="144" x2="680" y2="170" stroke="#3B82F6" strokeWidth="2.5" />
            </svg>

            {/* Ação rápida de teste no card */}
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
        {/* 3. QUADRO QGD / IDR / SOLAR / OUTROS (FALLBACK PRESET)             */}
        {/* ================================================================= */}
        {!hasCustomCadData && circuitType !== 'direct_motor' && circuitType !== 'four_way' && (
          <div className="space-y-3">
            <svg viewBox="0 0 760 190" className="w-full h-auto min-h-[140px] max-h-[200px]">
              <rect width="760" height="190" fill="#070D1A" rx="10" />
              {/* QGD schematic block preview */}
              <g transform="translate(30, 20)">
                <rect x="0" y="0" width="140" height="140" rx="8" fill="#0F172A" stroke="#3B82F6" strokeWidth="1.5" />
                <text x="16" y="28" fill="#93C5FD" fontSize="11" fontWeight="bold">Geral: MCB 63A</text>
                <text x="16" y="46" fill="#64748B" fontSize="9">Curva C • Icu 10kA</text>
                <rect x="16" y="60" width="108" height="30" rx="4" fill="#1E293B" />
                <text x="35" y="80" fill="#10B981" fontSize="10" fontWeight="bold">ARMADO</text>
              </g>

              <line x1="170" y1="90" x2="230" y2="90" stroke="#EF4444" strokeWidth="3" />

              {/* IDR 30mA */}
              <g transform="translate(230, 20)">
                <rect x="0" y="0" width="150" height="140" rx="8" fill="#0F172A" stroke="#10B981" strokeWidth="1.5" />
                <text x="16" y="28" fill="#6EE7B7" fontSize="11" fontWeight="bold">IDR / DR 30mA</text>
                <text x="16" y="46" fill="#64748B" fontSize="9">Tipo A • I_Δn = 0.03A</text>
                <rect x="16" y="60" width="118" height="30" rx="4" fill={drTripped ? '#7F1D1D' : '#064E3B'} />
                <text x="32" y="80" fill={drTripped ? '#FCA5A5' : '#86EFAC'} fontSize="10" fontWeight="bold">
                  {drTripped ? 'DISPARADO (FALTA)' : 'NORMAL'}
                </text>
              </g>

              <line x1="380" y1="90" x2="440" y2="90" stroke={drTripped ? '#64748B' : '#EF4444'} strokeWidth="3" />

              {/* Barramento e Circuitos Terminais */}
              <g transform="translate(440, 20)">
                <rect x="0" y="0" width="280" height="140" rx="8" fill="#0F172A" stroke="#F59E0B" strokeWidth="1.5" />
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

      {/* CAD Card Footer: Highlighted "Testar Circuito" Action Button */}
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

        {/* 4.d BOTÃO DE AÇÃO DESTACADO: "⚡ Testar Circuito" */}
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
