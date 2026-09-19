import React, { useState } from 'react';
import {
  Zap,
  ArrowRight,
  Lightbulb,
  CheckCircle2,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  Info
} from 'lucide-react';

export interface CircuitBlockFlowViewerProps {
  rawText?: string;
  topic?: string;
  norma?: string;
  baseFontSize?: number;
  className?: string;
}

export const CircuitBlockFlowViewer: React.FC<CircuitBlockFlowViewerProps> = ({
  rawText = '',
  topic = 'Comutação e Esquema Funcional',
  norma = 'IEC 60364',
  baseFontSize = 14,
  className = ''
}) => {
  // Estado para simulação interativa de Comutadores (Four-Way / Three-Way)
  const isFourWay =
    rawText.toLowerCase().includes('four-way') ||
    rawText.toLowerCase().includes('cruzamento') ||
    rawText.toLowerCase().includes('viajantes') ||
    topic.toLowerCase().includes('four-way') ||
    topic.toLowerCase().includes('comutador');

  // Estados dos comutadores (simulação física)
  const [swA, setSwA] = useState<boolean>(false); // Posição A: Borne 1 (false) ou Borne 2 (true)
  const [swB, setSwB] = useState<boolean>(false); // Posição B: Direto (false) ou Cruzado (true)
  const [swC, setSwC] = useState<boolean>(false); // Posição C: Borne 1 (false) ou Borne 2 (true)

  // Lógica booleana da lâmpada: qualquer alteração inverte o estado (XOR de 3 vias)
  const isLampOn = swA !== swB !== swC;

  // Se for Four-Way, renderizamos o circuito esquemático SVG simulado interativo
  if (isFourWay) {
    return (
      <div className={`p-4 rounded-2xl bg-gradient-to-b from-[#080E1E] to-[#050A14] border border-blue-900/50 shadow-lg space-y-3 ${className}`}>
        <div className="flex items-center justify-between gap-2 flex-wrap pb-1 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Zap className="w-4 h-4" />
            </span>
            <div>
              <h4 className="text-xs sm:text-sm font-black text-white flex items-center gap-2">
                <span>Diagrama Esquemático Interativo: Four-Way (Cruzamento)</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                  {norma}
                </span>
              </h4>
              <p className="text-[11px] text-slate-400">
                Clique nos comutadores para testar o acendimento e a comutação das 4 vias viajantes
              </p>
            </div>
          </div>

          <div className={`px-3 py-1 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all ${
            isLampOn
              ? 'bg-amber-500/20 text-amber-300 border border-amber-400/50 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
              : 'bg-slate-900 text-slate-400 border border-slate-800'
          }`}>
            <Lightbulb className={`w-4 h-4 ${isLampOn ? 'text-amber-400 fill-amber-400' : 'text-slate-500'}`} />
            <span>Lâmpada: {isLampOn ? 'LIGADA (230V)' : 'DESLIGADA (0V)'}</span>
          </div>
        </div>

        {/* Circuito SVG Dinâmico */}
        <div className="w-full overflow-x-auto py-2">
          <svg viewBox="0 0 860 260" className="w-full min-w-[700px] h-auto select-none">
            <defs>
              <linearGradient id="lampGlowInteractive" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FEF08A" stopOpacity="1" />
                <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.85" />
              </linearGradient>
            </defs>

            {/* Fundo do painel elétrico */}
            <rect width="860" height="260" fill="#0A1020" rx="14" stroke="#1E293B" strokeWidth="1" />

            {/* 1. Fonte de Fase L (Castanho) */}
            <g transform="translate(30, 95)">
              <rect x="0" y="0" width="70" height="70" rx="8" fill="#111827" stroke="#E11D48" strokeWidth="1.5" />
              <text x="14" y="24" fill="#FDA4AF" fontSize="10" fontWeight="bold">FASE L</text>
              <text x="16" y="42" fill="#94A3B8" fontSize="9">230 V</text>
              <circle cx="55" cy="35" r="5" fill="#E11D48" />
            </g>

            {/* Fio da Fase até Comutador S1 */}
            <line x1="85" y1="130" x2="140" y2="130" stroke="#E11D48" strokeWidth="3.5" strokeLinecap="round" />

            {/* 2. Comutador S1 (Escada 3 Vias) */}
            <g
              transform="translate(140, 60)"
              className="cursor-pointer hover:opacity-90 transition"
              onClick={() => setSwA(!swA)}
            >
              <rect x="0" y="0" width="130" height="140" rx="10" fill="#151E32" stroke="#38BDF8" strokeWidth={swA ? 2 : 1.5} />
              <text x="14" y="24" fill="#38BDF8" fontSize="11" fontWeight="bold">S1: ESCADA</text>
              <text x="14" y="38" fill="#94A3B8" fontSize="8.5">Entrada Corredor</text>

              {/* Borne Comum */}
              <circle cx="20" cy="70" r="5" fill="#E11D48" />
              <text x="10" y="90" fill="#FDA4AF" fontSize="8" fontWeight="bold">Comum</text>

              {/* Bornes Saída */}
              <circle cx="110" cy="45" r="5" fill="#F59E0B" />
              <text x="75" y="42" fill="#FCD34D" fontSize="8">Via 1</text>
              <circle cx="110" cy="95" r="5" fill="#F59E0B" />
              <text x="75" y="102" fill="#FCD34D" fontSize="8">Via 2</text>

              {/* Lâmina do interruptor */}
              <line
                x1="20"
                y1="70"
                x2="110"
                y2={swA ? 95 : 45}
                stroke="#F8FAFC"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              <rect x="25" y="115" width="80" height="18" rx="4" fill="#1E293B" stroke="#475569" />
              <text x="32" y="128" fill="#94A3B8" fontSize="8">Posição: {swA ? 'Via 2' : 'Via 1'}</text>
            </g>

            {/* Fios Viajantes 1 e 2 (Trecho 1) */}
            <line
              x1="250"
              y1="105"
              x2="330"
              y2="105"
              stroke="#F59E0B"
              strokeWidth={!swA ? 3.5 : 2}
              opacity={!swA ? 1 : 0.35}
            />
            <line
              x1="250"
              y1="155"
              x2="330"
              y2="155"
              stroke="#F59E0B"
              strokeWidth={swA ? 3.5 : 2}
              opacity={swA ? 1 : 0.35}
            />

            {/* 3. Comutador S2 (FOUR-WAY / CRUZAMENTO 4 VIAS) */}
            <g
              transform="translate(330, 45)"
              className="cursor-pointer hover:opacity-90 transition"
              onClick={() => setSwB(!swB)}
            >
              <rect
                x="0"
                y="0"
                width="160"
                height="170"
                rx="12"
                fill="#151E32"
                stroke="#F59E0B"
                strokeWidth={2}
              />
              <text x="14" y="24" fill="#F59E0B" fontSize="11" fontWeight="bold">S2: FOUR-WAY (CRUZAMENTO)</text>
              <text x="14" y="38" fill="#94A3B8" fontSize="8.5">Ponto Intermediário (4 Bornes)</text>

              {/* Bornes de Entrada (Esquerda) */}
              <circle cx="15" cy="60" r="5" fill="#F59E0B" />
              <circle cx="15" cy="110" r="5" fill="#F59E0B" />

              {/* Bornes de Saída (Direita) */}
              <circle cx="145" cy="60" r="5" fill="#F59E0B" />
              <circle cx="145" cy="110" r="5" fill="#F59E0B" />

              {/* Mecanismo Cruzado ou Direto */}
              {!swB ? (
                // Conexão Direta (Paralelo: 1->3 e 2->4)
                <>
                  <line x1="15" y1="60" x2="145" y2="60" stroke="#F8FAFC" strokeWidth="3.5" strokeLinecap="round" />
                  <line x1="15" y1="110" x2="145" y2="110" stroke="#F8FAFC" strokeWidth="3.5" strokeLinecap="round" />
                  <text x="45" y="88" fill="#38BDF8" fontSize="9" fontWeight="bold">[ Modo Direto = ]</text>
                </>
              ) : (
                // Conexão Cruzada (Cruzamento X: 1->4 e 2->3)
                <>
                  <line x1="15" y1="60" x2="145" y2="110" stroke="#F8FAFC" strokeWidth="3.5" strokeLinecap="round" />
                  <line x1="15" y1="110" x2="145" y2="60" stroke="#F8FAFC" strokeWidth="3.5" strokeLinecap="round" />
                  <text x="45" y="88" fill="#F59E0B" fontSize="9" fontWeight="bold">[ Modo Cruzado X ]</text>
                </>
              )}

              <rect x="25" y="142" width="110" height="20" rx="4" fill="#0F172A" stroke="#334155" />
              <text x="32" y="156" fill="#FDE68A" fontSize="8.5">Clique para Comutar</text>
            </g>

            {/* Fios Viajantes 3 e 4 (Trecho 2) */}
            <line
              x1="490"
              y1="105"
              x2="560"
              y2="105"
              stroke="#F59E0B"
              strokeWidth={3}
              opacity={0.8}
            />
            <line
              x1="490"
              y1="155"
              x2="560"
              y2="155"
              stroke="#F59E0B"
              strokeWidth={3}
              opacity={0.8}
            />

            {/* 4. Comutador S3 (Escada Final 3 Vias) */}
            <g
              transform="translate(560, 60)"
              className="cursor-pointer hover:opacity-90 transition"
              onClick={() => setSwC(!swC)}
            >
              <rect x="0" y="0" width="130" height="140" rx="10" fill="#151E32" stroke="#38BDF8" strokeWidth={swC ? 2 : 1.5} />
              <text x="14" y="24" fill="#38BDF8" fontSize="11" fontWeight="bold">S3: ESCADA</text>
              <text x="14" y="38" fill="#94A3B8" fontSize="8.5">Saída Corredor</text>

              {/* Bornes de Entrada */}
              <circle cx="20" cy="45" r="5" fill="#F59E0B" />
              <text x="30" y="42" fill="#FCD34D" fontSize="8">Via 1</text>
              <circle cx="20" cy="95" r="5" fill="#F59E0B" />
              <text x="30" y="102" fill="#FCD34D" fontSize="8">Via 2</text>

              {/* Borne Comum de Retorno */}
              <circle cx="110" cy="70" r="5" fill="#F97316" />
              <text x="70" y="90" fill="#FDBA74" fontSize="8" fontWeight="bold">Retorno</text>

              {/* Lâmina do interruptor */}
              <line
                x1="110"
                y1="70"
                x2="20"
                y2={swC ? 95 : 45}
                stroke="#F8FAFC"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              <rect x="25" y="115" width="80" height="18" rx="4" fill="#1E293B" stroke="#475569" />
              <text x="32" y="128" fill="#94A3B8" fontSize="8">Posição: {swC ? 'Via 2' : 'Via 1'}</text>
            </g>

            {/* Fio de Retorno L' até a Lâmpada */}
            <line
              x1="670"
              y1="130"
              x2="735"
              y2="130"
              stroke={isLampOn ? '#F97316' : '#64748B'}
              strokeWidth={isLampOn ? 3.5 : 2}
              strokeLinecap="round"
            />

            {/* 5. Lâmpada no Teto */}
            <g transform="translate(735, 90)">
              <circle
                cx="40"
                cy="40"
                r="30"
                fill={isLampOn ? 'url(#lampGlowInteractive)' : '#1E293B'}
                stroke={isLampOn ? '#F59E0B' : '#475569'}
                strokeWidth="2.5"
                style={{
                  filter: isLampOn ? 'drop-shadow(0 0 16px rgba(245, 158, 11, 0.8))' : 'none'
                }}
              />
              <text x="24" y="44" fill={isLampOn ? '#78350F' : '#94A3B8'} fontSize="11" fontWeight="bold">
                {isLampOn ? 'ON' : 'OFF'}
              </text>
              <text x="14" y="90" fill="#CBD5E1" fontSize="9" fontWeight="bold">Luminária</text>
              <text x="20" y="104" fill="#94A3B8" fontSize="8">LED 230V</text>
            </g>

            {/* Neutro N de retorno para a lâmpada */}
            <path
              d="M 805 130 L 840 130 L 840 230 L 30 230 L 30 180"
              fill="none"
              stroke="#0284C7"
              strokeWidth="2.5"
              opacity="0.85"
            />
            <text x="400" y="245" fill="#38BDF8" fontSize="9" fontWeight="bold">
              Condutor Neutro N (Azul Claro) • Retorno fechado à barra do QGD
            </text>
          </svg>
        </div>

        {/* Legenda Explicativa Didática */}
        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] text-slate-300 flex items-start gap-2">
          <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-amber-400">Regra de Ouro da Comutação Cruzada (Four-Way): </span>
            <span>
              Em um circuito Four-Way para N pontos (onde N ≥ 3), utilizam-se sempre <strong>2 Comutadores de Escada</strong> nos extremos e <strong>(N - 2) Comutadores Intermediários</strong> no meio. O comutador Four-Way cruza internamente o par de fios viajantes, invertendo o estado do circuito independentemente da posição das outras teclas.
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Se for uma sequência de passos com "->", geramos o Diagrama de Blocos Vetorial Sequencial
  const steps = rawText
    .split('->')
    .map(s => s.trim().replace(/^\[|\]$/g, '').replace(/^\d+\.\s*/, ''))
    .filter(Boolean);

  if (steps.length >= 3) {
    return (
      <div className={`p-4 rounded-2xl bg-gradient-to-b from-[#080E1E] to-[#050A14] border border-blue-900/50 shadow-lg space-y-3 ${className}`}>
        <div className="flex items-center justify-between gap-2 pb-1 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <h4 className="text-xs sm:text-sm font-black text-white">
              Diagrama de Blocos Funcional & Fluxo de Intervenção
            </h4>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
            {norma}
          </span>
        </div>

        {/* Sequência Interativa em Blocos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-1">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between hover:border-blue-500/50 hover:bg-slate-800/80 transition group relative"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="w-5 h-5 rounded-full bg-blue-600/30 text-blue-300 border border-blue-500/40 text-[10px] font-black flex items-center justify-center">
                  {idx + 1}
                </span>
                {idx < steps.length - 1 && (
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 transition" />
                )}
              </div>
              <p className="text-xs font-bold text-slate-200 leading-snug">
                {step}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Fallback padrão se não for sequencial
  return null;
};
