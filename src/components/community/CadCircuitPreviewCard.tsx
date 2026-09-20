import React, { useState } from 'react';
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

  // Mini interatividade local no preview do feed
  const [motorOn, setMotorOn] = useState<boolean>(false);
  const [swA, setSwA] = useState<boolean>(false);
  const [swB, setSwB] = useState<boolean>(false);
  const [swC, setSwC] = useState<boolean>(false);
  const [drTripped, setDrTripped] = useState<boolean>(false);

  const isFourWayLampOn = swA !== swB !== swC;

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
        {/* 1. MOTOR DIRECT STARTER SCHEMATIC                                 */}
        {/* ================================================================= */}
        {circuitType === 'direct_motor' && (
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
              <line x1="375" y1="40" x2="420" y2="40" stroke={motorOn ? '#EF4444' : '#64748B'} strokeWidth="2.5" />
              <line x1="375" y1="65" x2="420" y2="65" stroke={motorOn ? '#F59E0B' : '#64748B'} strokeWidth="2.5" />
              <line x1="375" y1="90" x2="420" y2="90" stroke={motorOn ? '#3B82F6' : '#64748B'} strokeWidth="2.5" />

              {/* F1: Relé Térmico */}
              <g transform="translate(420, 20)">
                <rect x="0" y="0" width="80" height="95" rx="6" fill="#0F172A" stroke="#F59E0B" strokeWidth="1.5" />
                <text x="14" y="22" fill="#FCD34D" fontSize="10" fontWeight="bold">F1 (Térmico)</text>
                <text x="14" y="38" fill="#64748B" fontSize="9">18 - 25A</text>
                <path d="M 25 58 Q 40 48 55 58" fill="none" stroke="#F59E0B" strokeWidth="2" />
                <path d="M 25 68 Q 40 58 55 68" fill="none" stroke="#F59E0B" strokeWidth="2" />
              </g>

              {/* Fios F1 -> Motor M1 */}
              <line x1="500" y1="40" x2="570" y2="50" stroke={motorOn ? '#EF4444' : '#64748B'} strokeWidth="2.5" />
              <line x1="500" y1="65" x2="570" y2="68" stroke={motorOn ? '#F59E0B' : '#64748B'} strokeWidth="2.5" />
              <line x1="500" y1="90" x2="570" y2="86" stroke={motorOn ? '#3B82F6' : '#64748B'} strokeWidth="2.5" />

              {/* M1: Motor Trifásico */}
              <g transform="translate(570, 25)">
                <circle cx="45" cy="45" r="42" fill="#0B132B" stroke={motorOn ? '#10B981' : '#334155'} strokeWidth="2" />
                {motorOn && (
                  <circle cx="45" cy="45" r="36" fill="none" stroke="#10B981" strokeWidth="2" strokeDasharray="8,6" className="animate-spin" style={{ transformOrigin: '45px 45px' }} />
                )}
                <text x="35" y="42" fill="#FFFFFF" fontSize="13" fontWeight="black">M1</text>
                <text x="31" y="58" fill={motorOn ? '#34D399' : '#94A3B8'} fontSize="9" fontWeight="bold">
                  {motorOn ? '2920 RPM' : 'PARADO'}
                </text>
              </g>

              {/* Circuito de Comando Inferior: Botão S0 (Desliga) e S1 (Liga) */}
              <g transform="translate(160, 140)">
                <rect x="0" y="0" width="490" height="70" rx="8" fill="#0A1020" stroke="#1E293B" />
                <text x="15" y="24" fill="#94A3B8" fontSize="10" fontWeight="bold">Linha de Comando 230V:</text>

                {/* S0 Botoeira NF */}
                <rect x="140" y="14" width="70" height="38" rx="6" fill="#1E293B" stroke="#EF4444" strokeWidth="1" />
                <text x="150" y="32" fill="#FCA5A5" fontSize="9" fontWeight="bold">S0 (NF)</text>
                <text x="150" y="44" fill="#64748B" fontSize="8">Desliga</text>

                {/* S1 Botoeira NA */}
                <rect x="230" y="14" width="70" height="38" rx="6" fill="#1E293B" stroke="#10B981" strokeWidth="1" />
                <text x="240" y="32" fill="#86EFAC" fontSize="9" fontWeight="bold">S1 (NA)</text>
                <text x="240" y="44" fill="#64748B" fontSize="8">Liga</text>

                {/* Status da Bobina KM1 */}
                <rect x="330" y="14" width="140" height="38" rx="6" fill={motorOn ? '#064E3B' : '#1E293B'} stroke={motorOn ? '#10B981' : '#334155'} />
                <text x="345" y="30" fill={motorOn ? '#6EE7B7' : '#94A3B8'} fontSize="9" fontWeight="bold">
                  Bobina KM1: {motorOn ? 'ENERGIZADA' : 'DESENERGIZADA'}
                </text>
                <text x="345" y="44" fill={motorOn ? '#A7F3D0' : '#64748B'} fontSize="8">
                  {motorOn ? 'I = 22.4 A (Carga Nominal)' : 'I = 0.0 A'}
                </text>
              </g>
            </svg>

            {/* Ação rápida de teste no card */}
            <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/80 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-medium">Comando Rápido:</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMotorOn(!motorOn);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    motorOn
                      ? 'bg-rose-900/60 text-rose-300 border border-rose-700 hover:bg-rose-900'
                      : 'bg-emerald-900/60 text-emerald-300 border border-emerald-700 hover:bg-emerald-900'
                  }`}
                >
                  <Play className="w-3 h-3" />
                  <span>{motorOn ? 'Pressionar S0 (Desligar)' : 'Pressionar S1 (Ligar)'}</span>
                </button>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                Tensão: <strong className="text-amber-400">380 V</strong> | Freq: <strong className="text-blue-400">50 Hz</strong>
              </span>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* 2. FOUR-WAY / THREE-WAY SCHEMATIC                                 */}
        {/* ================================================================= */}
        {circuitType === 'four_way' && (
          <div className="space-y-3">
            <svg viewBox="0 0 760 210" className="w-full h-auto min-h-[160px] max-h-[220px]">
              <defs>
                <pattern id="cad_grid_4way" width="16" height="16" patternUnits="userSpaceOnUse">
                  <path d="M 16 0 L 0 0 0 16" fill="none" stroke="#1E293B" strokeWidth="0.5" opacity="0.35" />
                </pattern>
                <linearGradient id="lampGlowCard" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FEF08A" stopOpacity="1" />
                  <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.8" />
                </linearGradient>
              </defs>

              <rect width="760" height="210" fill="#070D1A" rx="10" />
              <rect width="760" height="210" fill="url(#cad_grid_4way)" rx="10" />

              {/* Alimentação 230V */}
              <text x="25" y="45" fill="#EF4444" fontSize="11" fontWeight="bold" fontFamily="monospace">FASE L (230V)</text>
              <text x="25" y="175" fill="#38BDF8" fontSize="11" fontWeight="bold" fontFamily="monospace">NEUTRO N (0V)</text>

              {/* Fio da Fase */}
              <line x1="120" y1="40" x2="180" y2="40" stroke="#EF4444" strokeWidth="2.5" />

              {/* Comutador S1 (Three-Way) */}
              <g transform="translate(180, 20)">
                <rect x="0" y="0" width="100" height="90" rx="8" fill="#0F172A" stroke="#3B82F6" strokeWidth="1.5" />
                <text x="14" y="22" fill="#93C5FD" fontSize="10" fontWeight="bold">S1: Three-Way</text>
                <text x="14" y="36" fill="#64748B" fontSize="8">Ponto de Entrada</text>
                <circle cx="20" cy="55" r="4" fill="#EF4444" />
                <circle cx="80" cy="45" r="4" fill="#F59E0B" />
                <circle cx="80" cy="65" r="4" fill="#F59E0B" />
                <line x1="20" y1="55" x2="80" y2={swA ? 65 : 45} stroke="#EF4444" strokeWidth="2.5" />
              </g>

              {/* Vias Viajantes S1 -> S2 */}
              <line x1="280" y1="65" x2="350" y2="65" stroke={!swA ? '#EF4444' : '#475569'} strokeWidth="2" />
              <line x1="280" y1="85" x2="350" y2="85" stroke={swA ? '#EF4444' : '#475569'} strokeWidth="2" />

              {/* Comutador S2 (Four-Way Cruzamento Intermediário) */}
              <g transform="translate(350, 20)">
                <rect x="0" y="0" width="120" height="90" rx="8" fill="#0F172A" stroke="#F59E0B" strokeWidth="1.5" />
                <text x="14" y="22" fill="#FCD34D" fontSize="10" fontWeight="bold">S2: Four-Way</text>
                <text x="14" y="36" fill="#64748B" fontSize="8">Cruzamento 4 Vias</text>
                {/* 4 Bornes */}
                <circle cx="20" cy="45" r="4" fill="#F59E0B" />
                <circle cx="20" cy="65" r="4" fill="#F59E0B" />
                <circle cx="100" cy="45" r="4" fill="#F59E0B" />
                <circle cx="100" cy="65" r="4" fill="#F59E0B" />
                {swB ? (
                  <>
                    <line x1="20" y1="45" x2="100" y2="65" stroke="#F59E0B" strokeWidth="2.5" />
                    <line x1="20" y1="65" x2="100" y2="45" stroke="#F59E0B" strokeWidth="2.5" />
                  </>
                ) : (
                  <>
                    <line x1="20" y1="45" x2="100" y2="45" stroke="#F59E0B" strokeWidth="2.5" />
                    <line x1="20" y1="65" x2="100" y2="65" stroke="#F59E0B" strokeWidth="2.5" />
                  </>
                )}
              </g>

              {/* Vias Viajantes S2 -> S3 */}
              <line x1="470" y1="65" x2="530" y2="65" stroke="#475569" strokeWidth="2" />
              <line x1="470" y1="85" x2="530" y2="85" stroke="#475569" strokeWidth="2" />

              {/* Comutador S3 (Three-Way Final) */}
              <g transform="translate(530, 20)">
                <rect x="0" y="0" width="100" height="90" rx="8" fill="#0F172A" stroke="#3B82F6" strokeWidth="1.5" />
                <text x="14" y="22" fill="#93C5FD" fontSize="10" fontWeight="bold">S3: Three-Way</text>
                <text x="14" y="36" fill="#64748B" fontSize="8">Ponto de Saída</text>
                <circle cx="20" cy="45" r="4" fill="#F59E0B" />
                <circle cx="20" cy="65" r="4" fill="#F59E0B" />
                <circle cx="80" cy="55" r="4" fill={isFourWayLampOn ? '#EF4444' : '#64748B'} />
                <line x1="80" y1="55" x2="20" y2={swC ? 65 : 45} stroke={isFourWayLampOn ? '#EF4444' : '#64748B'} strokeWidth="2.5" />
              </g>

              {/* Fio de Retorno até Lâmpada */}
              <line x1="630" y1="75" x2="680" y2="75" stroke={isFourWayLampOn ? '#EF4444' : '#64748B'} strokeWidth="2.5" />

              {/* Lâmpada E1 */}
              <g transform="translate(680, 45)">
                <circle cx="30" cy="30" r="26" fill={isFourWayLampOn ? 'url(#lampGlowCard)' : '#1E293B'} stroke={isFourWayLampOn ? '#F59E0B' : '#475569'} strokeWidth="2" />
                <text x="22" y="28" fill={isFourWayLampOn ? '#78350F' : '#FFFFFF'} fontSize="11" fontWeight="bold">E1</text>
                <text x="12" y="42" fill={isFourWayLampOn ? '#78350F' : '#94A3B8'} fontSize="8" fontWeight="bold">
                  {isFourWayLampOn ? '230V AC' : '0V'}
                </text>
              </g>

              {/* Fio Neutro N contínuo até a lâmpada */}
              <line x1="120" y1="170" x2="710" y2="170" stroke="#38BDF8" strokeWidth="2.5" />
              <line x1="710" y1="170" x2="710" y2="100" stroke="#38BDF8" strokeWidth="2.5" />
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
        {/* 3. QUADRO QGD / IDR / SOLAR / OUTROS                              */}
        {/* ================================================================= */}
        {circuitType !== 'direct_motor' && circuitType !== 'four_way' && (
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
