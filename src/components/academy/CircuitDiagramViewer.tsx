import React, { useState } from 'react';
import {
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Info,
  ShieldCheck,
  Zap,
  Activity,
  CheckCircle2,
  RotateCcw
} from 'lucide-react';

export type WireHighlight = 'all' | 'phase' | 'neutral' | 'earth' | 'return';

export interface CircuitDiagramViewerProps {
  diagramId?: string;
  lessonCode?: string;
  lessonTitle?: string;
  norma?: string;
  baseFontSize?: number; // Para responder ao controle de fonte global
  className?: string;
}

export const CircuitDiagramViewer: React.FC<CircuitDiagramViewerProps> = ({
  diagramId,
  lessonCode = 'EC',
  lessonTitle = 'Esquema de Circuito',
  norma = 'IEC 60364',
  baseFontSize = 15,
  className = ''
}) => {
  const [highlight, setHighlight] = useState<WireHighlight>('all');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [activeInspectorPoint, setActiveInspectorPoint] = useState<string | null>(null);

  // Determinar qual diagrama desenhar
  const resolvedDiagram = React.useMemo(() => {
    if (diagramId) return diagramId;
    const lower = (lessonTitle || '').toLowerCase();
    const code = (lessonCode || '').toLowerCase();

    if (lower.includes('comutador') || lower.includes('escada') || lower.includes('ilumina') || lower.includes('three-way') || lower.includes('interruptor')) {
      return 'three_way_lighting';
    }
    if (lower.includes('quadro') || lower.includes('dps') || lower.includes('disjuntor') || lower.includes('proteç') || lower.includes('tomada') || lower.includes('rcd') || lower.includes('diferencial')) {
      return 'distribution_board_qgd';
    }
    if (lower.includes('motor') || lower.includes('contator') || lower.includes('partida') || lower.includes('trifásico') || lower.includes('estrela')) {
      return 'direct_motor_starter';
    }
    if (lower.includes('solar') || lower.includes('fotovoltaic') || lower.includes('inversor') || lower.includes('bateria') || lower.includes('mppt')) {
      return 'solar_pv_system';
    }
    if (lower.includes('aterramento') || lower.includes('terra') || lower.includes('elétrodo') || lower.includes('tn-s') || lower.includes('tt')) {
      return 'earthing_systems';
    }
    if (lower.includes('bomba') || lower.includes('automação') || lower.includes('boia')) {
      return 'water_pump_automation';
    }
    if (lower.includes('hidráulic') || lower.includes('óleo')) {
      return 'hydraulic_circuit';
    }
    if (lower.includes('pneumátic') || lower.includes('ar comprimido')) {
      return 'pneumatic_circuit';
    }
    // Padrão: quadro de distribuição unifilar
    return 'distribution_board_qgd';
  }, [diagramId, lessonTitle, lessonCode]);

  // Opacidades e estilos baseados no condutor realçado
  const getWireOpacity = (type: WireHighlight) => {
    if (highlight === 'all') return 1;
    return highlight === type ? 1 : 0.22;
  };

  const getWireStrokeWidth = (type: WireHighlight, defaultWidth: number = 3) => {
    if (highlight === type) return defaultWidth + 2;
    return defaultWidth;
  };

  return (
    <div
      className={`rounded-2xl bg-[#070D18] border border-blue-900/40 overflow-hidden shadow-xl ${
        isExpanded ? 'fixed inset-4 z-50 flex flex-col bg-[#070D18]/98 backdrop-blur-md' : ''
      } ${className}`}
      style={{
        fontSize: `${Math.max(12, Math.min(22, baseFontSize))}px`
      }}
    >
      {/* Topo do Visualizador: Título, Norma e Ações */}
      <div className="p-3 sm:p-4 bg-[#0F172A] border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 uppercase tracking-wider">
                {norma}
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                Diagrama Vetorial Límpido
              </span>
            </div>
            <h4 className="text-xs sm:text-sm font-black text-white truncate mt-0.5">
              {resolvedDiagram === 'three_way_lighting' && 'Circuito de Iluminação Three-Way (Vai-Vem de Escada)'}
              {resolvedDiagram === 'distribution_board_qgd' && 'Quadro Geral de Distribuição (QGD) • Disjuntor Geral, IDR 30mA & DPS'}
              {resolvedDiagram === 'direct_motor_starter' && 'Partida Direta de Motor Trifásico • Circuito de Força & Comando'}
              {resolvedDiagram === 'solar_pv_system' && 'Instalação Solar Fotovoltaica Híbrida • CC, Inversor, Bateria & CA'}
              {resolvedDiagram === 'earthing_systems' && 'Esquema de Aterramento e Equipotencialização (TT vs TN-S)'}
              {resolvedDiagram === 'water_pump_automation' && 'Circuito de Automação de Eletrobomba com Boias de Nível'}
              {resolvedDiagram === 'hydraulic_circuit' && 'Circuito Hidráulico Industrial • Válvula 4/3 e Cilindro Dupla Ação'}
              {resolvedDiagram === 'pneumatic_circuit' && 'Circuito Eletropneumático Industrial • FRL e Válvula 5/2'}
            </h4>
          </div>
        </div>

        {/* Ferramentas: Zoom, Reset, Fullscreen */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setZoomLevel(prev => Math.max(0.7, prev - 0.15))}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
            title="Diminuir Zoom"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="font-mono text-[11px] text-slate-400 px-1 min-w-[36px] text-center">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setZoomLevel(prev => Math.min(1.6, prev + 0.15))}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
            title="Aumentar Zoom"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => { setZoomLevel(1); setHighlight('all'); }}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
            title="Resetar Zoom e Destaque"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 border border-blue-500/30 transition cursor-pointer ml-1"
            title={isExpanded ? 'Sair da tela cheia' : 'Expandir diagrama'}
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Barra de Filtros Interativos de Condutores (Código de Cores Normativo IEC) */}
      <div className="px-3 sm:px-4 py-2 bg-[#0B132B] border-b border-slate-800/80 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar shrink-0">
        <div className="flex items-center gap-1.5 text-[11px] font-bold">
          <span className="text-slate-400 mr-1 text-[10px] uppercase tracking-wider hidden sm:inline">
            Realçar:
          </span>

          <button
            type="button"
            onClick={() => setHighlight('all')}
            className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
              highlight === 'all'
                ? 'bg-slate-700 text-white shadow-xs'
                : 'bg-slate-900/60 text-slate-400 hover:text-slate-200'
            }`}
          >
            Todos
          </button>

          {/* FASE: Castanho / Vermelho */}
          <button
            type="button"
            onClick={() => setHighlight('phase')}
            className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
              highlight === 'phase'
                ? 'bg-rose-950 text-rose-300 border border-rose-500 font-black shadow-xs ring-2 ring-rose-500/20'
                : 'bg-slate-900/60 text-slate-300 hover:text-rose-300 border border-slate-800'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#E11D48] shrink-0" />
            <span>Fase (L)</span>
          </button>

          {/* NEUTRO: Azul Claro */}
          <button
            type="button"
            onClick={() => setHighlight('neutral')}
            className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
              highlight === 'neutral'
                ? 'bg-sky-950 text-sky-300 border border-sky-400 font-black shadow-xs ring-2 ring-sky-400/20'
                : 'bg-slate-900/60 text-slate-300 hover:text-sky-300 border border-slate-800'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#0284C7] shrink-0" />
            <span>Neutro (N)</span>
          </button>

          {/* TERRA / PROTEÇÃO: Verde-Amarelo */}
          <button
            type="button"
            onClick={() => setHighlight('earth')}
            className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
              highlight === 'earth'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-400 font-black shadow-xs ring-2 ring-emerald-400/20'
                : 'bg-slate-900/60 text-slate-300 hover:text-emerald-300 border border-slate-800'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-emerald-400 to-yellow-400 shrink-0" />
            <span>Terra (PE)</span>
          </button>

          {/* RETORNO: Laranja */}
          <button
            type="button"
            onClick={() => setHighlight('return')}
            className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
              highlight === 'return'
                ? 'bg-amber-950 text-amber-300 border border-amber-400 font-black shadow-xs ring-2 ring-amber-400/20'
                : 'bg-slate-900/60 text-slate-300 hover:text-amber-300 border border-slate-800'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#F97316] shrink-0" />
            <span>Retorno</span>
          </button>
        </div>

        <div className="text-[10px] text-slate-400 font-mono hidden md:flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Norma Europeia IEC 60446</span>
        </div>
      </div>

      {/* ÁREA PRINCIPAL DO SVG VETORIZADO */}
      <div className={`p-4 overflow-auto flex items-center justify-center bg-[#070D18] ${
        isExpanded ? 'flex-1' : 'min-h-[320px] max-h-[500px]'
      }`}>
        <div
          className="transition-transform duration-200 w-full flex justify-center"
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
        >
          {/* ============================================================= */}
          {/* DIAGRAMA 1: THREE-WAY / VAI-VEM DE ESCADA                     */}
          {/* ============================================================= */}
          {resolvedDiagram === 'three_way_lighting' && (
            <svg
              viewBox="0 0 850 380"
              className="w-full max-w-[850px] select-none"
              style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))' }}
            >
              <defs>
                <pattern id="grid_pattern" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1E293B" strokeWidth="0.5" opacity="0.4" />
                </pattern>
                <linearGradient id="bulbGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.8" />
                </linearGradient>
              </defs>

              <rect width="850" height="380" fill="#0A0F1D" rx="16" />
              <rect width="850" height="380" fill="url(#grid_pattern)" rx="16" />

              {/* TÍTULO NO SVG */}
              <text x="30" y="36" fill="#94A3B8" fontSize="12" fontWeight="bold" fontFamily="monospace">
                CIRCUITO BIFÁSICO/MONOFÁSICO 230V 50Hz • COMUTAÇÃO DE ESCADA (THREE-WAY)
              </text>

              {/* ================= BARRAMENTO DE ENTRADA (QGD) ================= */}
              <g transform="translate(40, 70)">
                {/* Caixa QGD */}
                <rect x="0" y="0" width="130" height="260" rx="10" fill="#111827" stroke="#334155" strokeWidth="1.5" />
                <text x="14" y="24" fill="#38BDF8" fontSize="11" fontWeight="bold">QUADRO GERAL</text>
                <text x="14" y="38" fill="#64748B" fontSize="9">Disjuntor 10A Curva B</text>

                {/* Disjuntor MCB 10A */}
                <rect x="25" y="55" width="80" height="60" rx="6" fill="#1E293B" stroke="#475569" strokeWidth="1.5" />
                <text x="44" y="80" fill="#E2E8F0" fontSize="11" fontWeight="bold">MCB 10A</text>
                <text x="40" y="96" fill="#10B981" fontSize="9" fontWeight="bold">LIGADO [I]</text>

                {/* Borne Fase L */}
                <circle cx="65" cy="130" r="5" fill="#E11D48" />
                <text x="32" y="146" fill="#FDA4AF" fontSize="10" fontWeight="bold">Fase L (230V)</text>

                {/* Barramento Neutro */}
                <rect x="20" y="170" width="90" height="20" rx="4" fill="#0369A1" opacity="0.8" />
                <circle cx="65" cy="180" r="4" fill="#38BDF8" />
                <text x="30" y="206" fill="#7DD3FC" fontSize="10" fontWeight="bold">Barra Neutro N</text>

                {/* Barramento Terra PE */}
                <rect x="20" y="220" width="90" height="20" rx="4" fill="#065F46" opacity="0.8" />
                <circle cx="65" cy="230" r="4" fill="#34D399" />
                <text x="30" y="254" fill="#6EE7B7" fontSize="10" fontWeight="bold">Barra Terra PE</text>
              </g>

              {/* ================= CONDUTOR DE FASE (CASTANHO/VERMELHO) ================= */}
              {/* Do QGD até o Borne Comum do Comutador 1 */}
              <path
                d="M 105 200 L 230 200 L 230 230 L 260 230"
                fill="none"
                stroke="#E11D48"
                strokeWidth={getWireStrokeWidth('phase', 3.5)}
                opacity={getWireOpacity('phase')}
                strokeLinecap="round"
              />
              <text x="140" y="192" fill="#FDA4AF" fontSize="10" fontWeight="bold" opacity={getWireOpacity('phase')}>
                Fase L (1,5 mm²)
              </text>

              {/* ================= COMUTADOR 1 (PONTO DE ESCADA A) ================= */}
              <g transform="translate(260, 160)">
                <rect x="0" y="0" width="130" height="150" rx="12" fill="#1E293B" stroke="#38BDF8" strokeWidth="2" />
                <text x="14" y="24" fill="#38BDF8" fontSize="11" fontWeight="bold">COMUTADOR A</text>
                <text x="14" y="38" fill="#94A3B8" fontSize="9">3 Bornes (Three-Way)</text>

                {/* Borne Comum (L) */}
                <circle cx="20" cy="70" r="6" fill="#E11D48" />
                <text x="32" y="74" fill="#FFFFFF" fontSize="10" fontWeight="bold">L (Comum)</text>

                {/* Alavanca de comutação */}
                <line x1="20" y1="70" x2="110" y2="50" stroke="#F8FAFC" strokeWidth="3" strokeLinecap="round" />

                {/* Bornes de Saída 1 e 2 */}
                <circle cx="110" cy="50" r="6" fill="#F97316" />
                <text x="85" y="44" fill="#FED7AA" fontSize="10" fontWeight="bold">Via 1</text>

                <circle cx="110" cy="100" r="6" fill="#F97316" />
                <text x="85" y="118" fill="#FED7AA" fontSize="10" fontWeight="bold">Via 2</text>
              </g>

              {/* ================= CONDUTORES RETORNO PARALELO (VIAS 1 E 2) ================= */}
              {/* Via 1 Superior (Laranja) */}
              <path
                d="M 370 210 L 490 210"
                fill="none"
                stroke="#F97316"
                strokeWidth={getWireStrokeWidth('return', 3)}
                opacity={getWireOpacity('return')}
                strokeDasharray="6,3"
              />
              <text x="390" y="202" fill="#FED7AA" fontSize="10" fontWeight="bold" opacity={getWireOpacity('return')}>
                Via Retorno 1
              </text>

              {/* Via 2 Inferior (Laranja) */}
              <path
                d="M 370 260 L 490 260"
                fill="none"
                stroke="#F97316"
                strokeWidth={getWireStrokeWidth('return', 3)}
                opacity={getWireOpacity('return')}
                strokeDasharray="6,3"
              />
              <text x="390" y="278" fill="#FED7AA" fontSize="10" fontWeight="bold" opacity={getWireOpacity('return')}>
                Via Retorno 2
              </text>

              {/* ================= COMUTADOR 2 (PONTO DE ESCADA B) ================= */}
              <g transform="translate(490, 160)">
                <rect x="0" y="0" width="130" height="150" rx="12" fill="#1E293B" stroke="#38BDF8" strokeWidth="2" />
                <text x="14" y="24" fill="#38BDF8" fontSize="11" fontWeight="bold">COMUTADOR B</text>
                <text x="14" y="38" fill="#94A3B8" fontSize="9">3 Bornes (Three-Way)</text>

                {/* Bornes de Entrada 1 e 2 */}
                <circle cx="20" cy="50" r="6" fill="#F97316" />
                <text x="32" y="44" fill="#FED7AA" fontSize="10" fontWeight="bold">Via 1</text>

                <circle cx="20" cy="100" r="6" fill="#F97316" />
                <text x="32" y="118" fill="#FED7AA" fontSize="10" fontWeight="bold">Via 2</text>

                {/* Alavanca de comutação */}
                <line x1="20" y1="50" x2="110" y2="70" stroke="#F8FAFC" strokeWidth="3" strokeLinecap="round" />

                {/* Borne Comum de Saída para a Lâmpada */}
                <circle cx="110" cy="70" r="6" fill="#F97316" />
                <text x="65" y="74" fill="#FFFFFF" fontSize="10" fontWeight="bold">L (Saída)</text>
              </g>

              {/* ================= RETORNO DA LÂMPADA ================= */}
              <path
                d="M 600 230 L 680 230 L 680 180 L 710 180"
                fill="none"
                stroke="#F97316"
                strokeWidth={getWireStrokeWidth('return', 3.5)}
                opacity={getWireOpacity('return')}
              />
              <text x="620" y="222" fill="#FED7AA" fontSize="10" fontWeight="bold" opacity={getWireOpacity('return')}>
                Retorno
              </text>

              {/* ================= LÂMPADA / LUMINÁRIA ================= */}
              <g transform="translate(710, 110)">
                <rect x="0" y="0" width="110" height="150" rx="12" fill="#111827" stroke="#F59E0B" strokeWidth="2" />
                <text x="18" y="24" fill="#F59E0B" fontSize="11" fontWeight="bold">LUMINÁRIA</text>
                <text x="24" y="38" fill="#94A3B8" fontSize="9">LED 230V 18W</text>

                {/* Lâmpada Ilustrada */}
                <circle cx="55" cy="75" r="24" fill="url(#bulbGlow)" stroke="#F59E0B" strokeWidth="2" />
                <path d="M 45 99 L 65 99 L 60 110 L 50 110 Z" fill="#94A3B8" />

                {/* Borne Retorno (Centro do soquete) */}
                <circle cx="20" cy="70" r="5" fill="#F97316" />
                <text x="8" y="90" fill="#FED7AA" fontSize="9">Retorno</text>

                {/* Borne Neutro (Rosca do soquete) */}
                <circle cx="90" cy="70" r="5" fill="#0284C7" />
                <text x="65" y="90" fill="#7DD3FC" fontSize="9">Neutro</text>

                {/* Borne Terra PE (Carcaça metálica) */}
                <circle cx="55" cy="130" r="5" fill="#10B981" />
                <text x="40" y="145" fill="#6EE7B7" fontSize="9">Terra PE</text>
              </g>

              {/* ================= CONDUTOR DE NEUTRO (AZUL CLARO) ================= */}
              {/* Do QGD direto até a Lâmpada pelo topo */}
              <path
                d="M 105 250 L 170 250 L 170 80 L 800 80 L 800 180"
                fill="none"
                stroke="#0284C7"
                strokeWidth={getWireStrokeWidth('neutral', 3)}
                opacity={getWireOpacity('neutral')}
                strokeLinecap="round"
              />
              <text x="420" y="72" fill="#7DD3FC" fontSize="10" fontWeight="bold" opacity={getWireOpacity('neutral')}>
                Neutro N Contínuo (IEC 60364-5-52: NUNCA SECCIONAR)
              </text>

              {/* ================= CONDUTOR DE TERRA PE (VERDE-AMARELO) ================= */}
              <path
                d="M 105 300 L 150 300 L 150 350 L 765 350 L 765 260"
                fill="none"
                stroke="#10B981"
                strokeWidth={getWireStrokeWidth('earth', 3)}
                opacity={getWireOpacity('earth')}
                strokeDasharray="10,4"
                strokeLinecap="round"
              />
              <text x="350" y="344" fill="#6EE7B7" fontSize="10" fontWeight="bold" opacity={getWireOpacity('earth')}>
                Condutor de Proteção PE (Carcaças Metálicas e Calhas)
              </text>
            </svg>
          )}

          {/* ============================================================= */}
          {/* DIAGRAMA 2: QUADRO GERAL DE DISTRIBUIÇÃO (QGD)                */}
          {/* ============================================================= */}
          {resolvedDiagram === 'distribution_board_qgd' && (
            <svg
              viewBox="0 0 880 400"
              className="w-full max-w-[880px] select-none"
              style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))' }}
            >
              <rect width="880" height="400" fill="#0A0F1D" rx="16" />

              <text x="30" y="36" fill="#94A3B8" fontSize="12" fontWeight="bold" fontFamily="monospace">
                DIAGRAMA MULTIFILAR DO QUADRO GERAL (QGD) • IEC 60364-4-41 / IEC 60898
              </text>

              {/* ENTRADA EDM 230V */}
              <g transform="translate(30, 70)">
                <rect x="0" y="0" width="130" height="290" rx="10" fill="#111827" stroke="#475569" strokeWidth="1.5" />
                <text x="14" y="24" fill="#F8FAFC" fontSize="11" fontWeight="bold">ENTRADA EDM</text>
                <text x="14" y="38" fill="#94A3B8" fontSize="9">Ramal 10 mm² Monofásico</text>

                {/* Fase */}
                <circle cx="35" cy="80" r="7" fill="#E11D48" />
                <text x="50" y="84" fill="#FDA4AF" fontSize="11" fontWeight="bold">Fase L</text>

                {/* Neutro */}
                <circle cx="35" cy="150" r="7" fill="#0284C7" />
                <text x="50" y="154" fill="#7DD3FC" fontSize="11" fontWeight="bold">Neutro N</text>

                {/* Terra */}
                <circle cx="35" cy="220" r="7" fill="#10B981" />
                <text x="50" y="224" fill="#6EE7B7" fontSize="11" fontWeight="bold">Terra PE</text>
              </g>

              {/* DISJUNTOR GERAL BIPOLAR 40A */}
              <g transform="translate(200, 70)">
                <rect x="0" y="0" width="120" height="120" rx="10" fill="#1E293B" stroke="#E11D48" strokeWidth="2" />
                <text x="12" y="22" fill="#FFFFFF" fontSize="10" fontWeight="bold">DISJ. GERAL</text>
                <text x="12" y="36" fill="#FDA4AF" fontSize="9">40A Curva C (6kA)</text>
                <rect x="25" y="48" width="70" height="50" rx="6" fill="#0F172A" />
                <text x="35" y="78" fill="#10B981" fontSize="12" fontWeight="black">LIGADO</text>
              </g>

              {/* DISPOSITIVO DPS (SURTOS CLIMATÉRICOS) */}
              <g transform="translate(200, 220)">
                <rect x="0" y="0" width="120" height="140" rx="10" fill="#1E293B" stroke="#F59E0B" strokeWidth="1.5" />
                <text x="12" y="22" fill="#F59E0B" fontSize="10" fontWeight="bold">DPS CLASSE II</text>
                <text x="12" y="36" fill="#CBD5E1" fontSize="9">In 20kA / Imax 40kA</text>
                <rect x="25" y="50" width="70" height="60" rx="6" fill="#0F172A" stroke="#10B981" strokeWidth="1.5" />
                <text x="36" y="84" fill="#10B981" fontSize="10" fontWeight="bold">STATUS OK</text>
              </g>

              {/* INTERRUPTOR DIFERENCIAL RESIDUAL (IDR / RCD 30mA) */}
              <g transform="translate(360, 70)">
                <rect x="0" y="0" width="140" height="150" rx="10" fill="#1E293B" stroke="#10B981" strokeWidth="2" />
                <text x="12" y="22" fill="#34D399" fontSize="10" fontWeight="bold">IDR 40A / 30mA</text>
                <text x="12" y="36" fill="#94A3B8" fontSize="9">Proteção Choque Humano</text>
                <circle cx="35" cy="70" r="12" fill="#0F172A" stroke="#38BDF8" strokeWidth="1.5" />
                <text x="28" y="74" fill="#38BDF8" fontSize="10" fontWeight="bold">TEST</text>
                <text x="56" y="74" fill="#94A3B8" fontSize="9">Botão Mensal</text>
                <text x="16" y="120" fill="#FDE047" fontSize="9" fontWeight="bold">IΔn = 0,03A (≤ 30ms)</text>
              </g>

              {/* BARRAMENTO PENTE E CIRCUITOS TERMINAIS */}
              <g transform="translate(540, 70)">
                <rect x="0" y="0" width="310" height="290" rx="12" fill="#111827" stroke="#334155" strokeWidth="1.5" />
                <text x="16" y="24" fill="#38BDF8" fontSize="11" fontWeight="bold">CIRCUITOS TERMINAIS INDEPENDENTES</text>

                {/* Circuito 1: Iluminação 10A */}
                <g transform="translate(15, 45)">
                  <rect x="0" y="0" width="85" height="100" rx="6" fill="#1E293B" stroke="#64748B" />
                  <text x="8" y="18" fill="#F8FAFC" fontSize="9" fontWeight="bold">CIRC 1: LUZ</text>
                  <text x="8" y="32" fill="#38BDF8" fontSize="9">MCB 10A (B)</text>
                  <text x="8" y="52" fill="#94A3B8" fontSize="8">Cabo 1,5 mm²</text>
                  <circle cx="42" cy="78" r="6" fill="#E11D48" />
                  <text x="8" y="94" fill="#FDA4AF" fontSize="8">Lâmpadas</text>
                </g>

                {/* Circuito 2: Tomadas TUG 16A */}
                <g transform="translate(110, 45)">
                  <rect x="0" y="0" width="85" height="100" rx="6" fill="#1E293B" stroke="#64748B" />
                  <text x="8" y="18" fill="#F8FAFC" fontSize="9" fontWeight="bold">CIRC 2: TUG</text>
                  <text x="8" y="32" fill="#38BDF8" fontSize="9">MCB 16A (C)</text>
                  <text x="8" y="52" fill="#94A3B8" fontSize="8">Cabo 2,5 mm²</text>
                  <circle cx="42" cy="78" r="6" fill="#E11D48" />
                  <text x="8" y="94" fill="#FDA4AF" fontSize="8">Tomadas Gerais</text>
                </g>

                {/* Circuito 3: Climatização AC 20A */}
                <g transform="translate(205, 45)">
                  <rect x="0" y="0" width="85" height="100" rx="6" fill="#1E293B" stroke="#64748B" />
                  <text x="8" y="18" fill="#F8FAFC" fontSize="9" fontWeight="bold">CIRC 3: AC</text>
                  <text x="8" y="32" fill="#38BDF8" fontSize="9">MCB 20A (C)</text>
                  <text x="8" y="52" fill="#94A3B8" fontSize="8">Cabo 4,0 mm²</text>
                  <circle cx="42" cy="78" r="6" fill="#E11D48" />
                  <text x="8" y="94" fill="#FDA4AF" fontSize="8">Ar Condicionado</text>
                </g>

                {/* Barramentos Internos de Neutro e Terra */}
                <rect x="15" y="170" width="275" height="35" rx="6" fill="#0369A1" opacity="0.3" stroke="#0284C7" />
                <text x="25" y="192" fill="#7DD3FC" fontSize="10" fontWeight="bold">BARRAMENTO DE NEUTRO (ISOLADO)</text>

                <rect x="15" y="225" width="275" height="35" rx="6" fill="#065F46" opacity="0.3" stroke="#10B981" />
                <text x="25" y="247" fill="#6EE7B7" fontSize="10" fontWeight="bold">BARRAMENTO DE TERRA PE (LIGADO À CARCAÇA)</text>
              </g>

              {/* LIGAÇÕES VETORIZADAS DE FASE */}
              <path
                d="M 160 150 L 200 150 M 320 150 L 360 150 M 500 150 L 555 150"
                fill="none"
                stroke="#E11D48"
                strokeWidth={getWireStrokeWidth('phase', 3.5)}
                opacity={getWireOpacity('phase')}
              />

              {/* LIGAÇÕES DE NEUTRO */}
              <path
                d="M 160 220 L 180 220 L 180 180 L 200 180 M 320 180 L 360 180 M 500 180 L 525 180 L 525 255 L 555 255"
                fill="none"
                stroke="#0284C7"
                strokeWidth={getWireStrokeWidth('neutral', 3)}
                opacity={getWireOpacity('neutral')}
              />

              {/* LIGAÇÕES DE TERRA PE */}
              <path
                d="M 160 290 L 555 290"
                fill="none"
                stroke="#10B981"
                strokeWidth={getWireStrokeWidth('earth', 3)}
                opacity={getWireOpacity('earth')}
                strokeDasharray="8,4"
              />
            </svg>
          )}

          {/* ============================================================= */}
          {/* DIAGRAMA 3: PARTIDA DIRETA DE MOTOR TRIFÁSICO                 */}
          {/* ============================================================= */}
          {resolvedDiagram === 'direct_motor_starter' && (
            <svg
              viewBox="0 0 850 390"
              className="w-full max-w-[850px] select-none"
              style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))' }}
            >
              <rect width="850" height="390" fill="#0A0F1D" rx="16" />

              <text x="30" y="36" fill="#94A3B8" fontSize="12" fontWeight="bold" fontFamily="monospace">
                CIRCUITO DE FORÇA E COMANDO • PARTIDA DIRETA DE MOTOR TRIFÁSICO 400V 50Hz (IEC 60947)
              </text>

              {/* CIRCUITO DE FORÇA (ESQUERDA) */}
              <g transform="translate(40, 60)">
                <rect x="0" y="0" width="360" height="305" rx="10" fill="#111827" stroke="#334155" />
                <text x="16" y="24" fill="#38BDF8" fontSize="11" fontWeight="bold">CIRCUITO DE POTÊNCIA (FORÇA 400V)</text>

                {/* 3 Fases L1, L2, L3 */}
                <circle cx="80" cy="55" r="5" fill="#E11D48" />
                <text x="70" y="45" fill="#FDA4AF" fontSize="9" fontWeight="bold">L1</text>

                <circle cx="160" cy="55" r="5" fill="#F59E0B" />
                <text x="150" y="45" fill="#FDE68A" fontSize="9" fontWeight="bold">L2</text>

                <circle cx="240" cy="55" r="5" fill="#94A3B8" />
                <text x="230" y="45" fill="#E2E8F0" fontSize="9" fontWeight="bold">L3</text>

                {/* Disjuntor-Motor Q1 */}
                <rect x="50" y="75" width="220" height="40" rx="6" fill="#1E293B" stroke="#475569" />
                <text x="80" y="98" fill="#F8FAFC" fontSize="10" fontWeight="bold">DISJUNTOR-MOTOR Q1</text>

                {/* Contator Principal KM1 */}
                <rect x="50" y="135" width="220" height="45" rx="6" fill="#1E293B" stroke="#3B82F6" strokeWidth="1.5" />
                <text x="90" y="162" fill="#93C5FD" fontSize="11" fontWeight="bold">CONTATOR KM1</text>

                {/* Relé Térmico F1 */}
                <rect x="50" y="200" width="220" height="40" rx="6" fill="#1E293B" stroke="#F59E0B" />
                <text x="85" y="224" fill="#FDE68A" fontSize="10" fontWeight="bold">RELÉ TÉRMICO F1</text>

                {/* Motor Trifásico M1 */}
                <circle cx="160" cy="275" r="24" fill="#1E293B" stroke="#10B981" strokeWidth="2" />
                <text x="146" y="280" fill="#34D399" fontSize="12" fontWeight="black">M 3~</text>
              </g>

              {/* CIRCUITO DE COMANDO 230V (DIREITA) */}
              <g transform="translate(430, 60)">
                <rect x="0" y="0" width="380" height="305" rx="10" fill="#111827" stroke="#334155" />
                <text x="16" y="24" fill="#F59E0B" fontSize="11" fontWeight="bold">CIRCUITO DE COMANDO (230V AC)</text>

                {/* Fusível / MCB Comando */}
                <rect x="40" y="50" width="60" height="28" rx="4" fill="#1E293B" stroke="#64748B" />
                <text x="48" y="68" fill="#F8FAFC" fontSize="9">F2 (2A)</text>

                {/* Contato NF 95-96 Relé Térmico */}
                <g transform="translate(40, 95)">
                  <rect x="0" y="0" width="130" height="30" rx="4" fill="#1E293B" stroke="#F59E0B" />
                  <text x="10" y="19" fill="#FDE68A" fontSize="9" fontWeight="bold">95-96 F1 (NF Térmico)</text>
                </g>

                {/* Botoeira S0 Desliga (NF Vermelho) */}
                <g transform="translate(40, 140)">
                  <rect x="0" y="0" width="130" height="32" rx="6" fill="#7F1D1D" stroke="#EF4444" />
                  <text x="12" y="20" fill="#FEE2E2" fontSize="9" fontWeight="bold">S0 DESLIGA (NF 1-2)</text>
                </g>

                {/* Botoeira S1 Liga (NA Verde) + Selo 13-14 KM1 */}
                <g transform="translate(40, 190)">
                  <rect x="0" y="0" width="130" height="32" rx="6" fill="#064E3B" stroke="#10B981" />
                  <text x="12" y="20" fill="#D1FAE5" fontSize="9" fontWeight="bold">S1 LIGA (NA 3-4)</text>

                  {/* Contato de Selo em Paralelo */}
                  <rect x="150" y="0" width="130" height="32" rx="6" fill="#1E293B" stroke="#3B82F6" />
                  <text x="160" y="20" fill="#93C5FD" fontSize="9" fontWeight="bold">13-14 KM1 (Selo)</text>
                </g>

                {/* Bobina A1-A2 do Contator KM1 */}
                <g transform="translate(100, 245)">
                  <circle cx="20" cy="20" r="18" fill="#1E3A8A" stroke="#60A5FA" strokeWidth="2" />
                  <text x="12" y="24" fill="#FFFFFF" fontSize="10" fontWeight="black">KM1</text>
                  <text x="46" y="16" fill="#93C5FD" fontSize="9" fontWeight="bold">Bobina 230V A1-A2</text>
                  <text x="46" y="30" fill="#94A3B8" fontSize="8">Sinalizador Verde Ligado</text>
                </g>
              </g>
            </svg>
          )}

          {/* ============================================================= */}
          {/* DIAGRAMA 4: ENERGIA SOLAR FOTOVOLTAICA HÍBRIDA                */}
          {/* ============================================================= */}
          {resolvedDiagram === 'solar_pv_system' && (
            <svg
              viewBox="0 0 860 390"
              className="w-full max-w-[860px] select-none"
              style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))' }}
            >
              <rect width="860" height="390" fill="#0A0F1D" rx="16" />

              <text x="30" y="36" fill="#94A3B8" fontSize="12" fontWeight="bold" fontFamily="monospace">
                SISTEMA SOLAR FOTOVOLTAICO HÍBRIDO • IEC 62109 / IEC 61730 (OFF-GRID & BACKUP)
              </text>

              {/* PAINÉIS SOLARES (ARRANJO FOTOVOLTAICO) */}
              <g transform="translate(30, 70)">
                <rect x="0" y="0" width="150" height="280" rx="10" fill="#111827" stroke="#38BDF8" strokeWidth="1.5" />
                <text x="14" y="24" fill="#38BDF8" fontSize="11" fontWeight="bold">GERADOR SOLAR</text>
                <text x="14" y="38" fill="#94A3B8" fontSize="9">String 6x 550W Tier 1</text>

                {/* 3 Módulos Ilustrados */}
                <rect x="15" y="55" width="120" height="60" rx="4" fill="#1E3A8A" stroke="#60A5FA" />
                <text x="30" y="90" fill="#BFDBFE" fontSize="9" fontWeight="bold">Módulo FV #1</text>

                <rect x="15" y="125" width="120" height="60" rx="4" fill="#1E3A8A" stroke="#60A5FA" />
                <text x="30" y="160" fill="#BFDBFE" fontSize="9" fontWeight="bold">Módulo FV #2</text>

                <rect x="15" y="195" width="120" height="60" rx="4" fill="#1E3A8A" stroke="#60A5FA" />
                <text x="30" y="230" fill="#BFDBFE" fontSize="9" fontWeight="bold">Módulo FV #n</text>
              </g>

              {/* STRING BOX CC (PROTEÇÃO) */}
              <g transform="translate(220, 100)">
                <rect x="0" y="0" width="130" height="220" rx="10" fill="#1E293B" stroke="#F59E0B" strokeWidth="1.5" />
                <text x="12" y="22" fill="#F59E0B" fontSize="10" fontWeight="bold">STRING BOX CC</text>
                <text x="12" y="36" fill="#CBD5E1" fontSize="8">Proteções Contínuas</text>

                <rect x="15" y="50" width="100" height="35" rx="4" fill="#0F172A" stroke="#EF4444" />
                <text x="24" y="72" fill="#FDA4AF" fontSize="9" fontWeight="bold">Fusíveis gPV 15A</text>

                <rect x="15" y="95" width="100" height="35" rx="4" fill="#0F172A" stroke="#F59E0B" />
                <text x="22" y="117" fill="#FDE68A" fontSize="9" fontWeight="bold">DPS CC 1000V</text>

                <rect x="15" y="140" width="100" height="35" rx="4" fill="#0F172A" stroke="#38BDF8" />
                <text x="20" y="162" fill="#BAE6FD" fontSize="9" fontWeight="bold">Chave Secc. CC</text>
              </g>

              {/* INVERSOR HÍBRIDO MPPT */}
              <g transform="translate(390, 80)">
                <rect x="0" y="0" width="180" height="260" rx="12" fill="#111827" stroke="#10B981" strokeWidth="2" />
                <text x="18" y="26" fill="#34D399" fontSize="12" fontWeight="bold">INVERSOR HÍBRIDO</text>
                <text x="18" y="42" fill="#94A3B8" fontSize="9">5 kW • MPPT 48V / 230V</text>

                {/* Display LCD */}
                <rect x="25" y="60" width="130" height="50" rx="6" fill="#022C22" stroke="#059669" />
                <text x="35" y="85" fill="#34D399" fontSize="10" fontWeight="mono">SOLAR: 2.85 kW</text>
                <text x="35" y="100" fill="#6EE7B7" fontSize="10" fontWeight="mono">CARGA: 1.40 kW</text>

                {/* Conversão CC para CA */}
                <text x="35" y="140" fill="#94A3B8" fontSize="9">CC (Painéis) → CA (230V)</text>
                <text x="35" y="160" fill="#94A3B8" fontSize="9">Carregador Inteligente LiFePO4</text>
              </g>

              {/* BANCO DE BATERIAS LiFePO4 */}
              <g transform="translate(610, 60)">
                <rect x="0" y="0" width="210" height="130" rx="10" fill="#1E293B" stroke="#3B82F6" strokeWidth="1.5" />
                <text x="16" y="24" fill="#60A5FA" fontSize="11" fontWeight="bold">BATERIA LÍTIO LiFePO4</text>
                <text x="16" y="38" fill="#94A3B8" fontSize="9">48V 100Ah (5,12 kWh) • BMS RS485</text>
                <rect x="20" y="55" width="170" height="20" rx="4" fill="#0284C7" opacity="0.3" stroke="#38BDF8" />
                <text x="30" y="70" fill="#BAE6FD" fontSize="10" fontWeight="bold">SOC: 92% • Ciclos: 6000+</text>
              </g>

              {/* QUADRO DE CARGAS CA RESIDENCIAL */}
              <g transform="translate(610, 210)">
                <rect x="0" y="0" width="210" height="140" rx="10" fill="#1E293B" stroke="#E11D48" strokeWidth="1.5" />
                <text x="16" y="24" fill="#FDA4AF" fontSize="11" fontWeight="bold">CARGAS CRÍTICAS (CA)</text>
                <text x="16" y="38" fill="#94A3B8" fontSize="9">Geladeiras, Iluminação, Roteador</text>
                <text x="16" y="70" fill="#10B981" fontSize="11" fontWeight="bold">230V 50Hz Onda Pura</text>
                <text x="16" y="90" fill="#94A3B8" fontSize="9">Tempo de Comutação: &lt; 10ms (UPS)</text>
              </g>
            </svg>
          )}

          {/* ============================================================= */}
          {/* DIAGRAMA 5: ATERRAMENTO TT vs TN-S                           */}
          {/* ============================================================= */}
          {resolvedDiagram === 'earthing_systems' && (
            <svg
              viewBox="0 0 850 380"
              className="w-full max-w-[850px] select-none"
              style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))' }}
            >
              <rect width="850" height="380" fill="#0A0F1D" rx="16" />

              <text x="30" y="36" fill="#94A3B8" fontSize="12" fontWeight="bold" fontFamily="monospace">
                ESQUEMAS DE LIGAÇÃO À TERRA (IEC 60364-4-41) • SISTEMAS TT vs TN-S
              </text>

              {/* POSTO DE TRANSFORMAÇÃO PT DA EDM */}
              <g transform="translate(40, 70)">
                <rect x="0" y="0" width="200" height="260" rx="10" fill="#111827" stroke="#475569" strokeWidth="1.5" />
                <text x="16" y="24" fill="#38BDF8" fontSize="11" fontWeight="bold">POSTO EDM (PT)</text>
                <text x="16" y="38" fill="#94A3B8" fontSize="9">Transformador 22kV / 400V</text>

                {/* Estrela de Neutro Aterrado no PT */}
                <circle cx="100" cy="100" r="30" fill="#1E293B" stroke="#0284C7" strokeWidth="2" />
                <text x="76" y="104" fill="#38BDF8" fontSize="11" fontWeight="black">N Aterrado</text>

                {/* Elétrodo de Terra do PT */}
                <rect x="85" y="180" width="30" height="60" rx="2" fill="#B45309" />
                <text x="50" y="258" fill="#FCD34D" fontSize="9" fontWeight="bold">Terra da EDM (Rb)</text>
              </g>

              {/* INSTALAÇÃO DO CONSUMIDOR (ESQUEMA TT) */}
              <g transform="translate(280, 70)">
                <rect x="0" y="0" width="250" height="260" rx="10" fill="#111827" stroke="#10B981" strokeWidth="1.5" />
                <text x="16" y="24" fill="#34D399" fontSize="11" fontWeight="bold">SISTEMA TT (PADRÃO MOÇAMBIQUE)</text>
                <text x="16" y="38" fill="#94A3B8" fontSize="9">Massa aterrada em elétrodo próprio</text>

                <rect x="25" y="60" width="200" height="70" rx="6" fill="#1E293B" stroke="#F59E0B" />
                <text x="35" y="85" fill="#F8FAFC" fontSize="10" fontWeight="bold">EQUIPAMENTO METÁLICO</text>
                <text x="35" y="102" fill="#FDE68A" fontSize="9">Ex: Máquina de Lavar / Fogão</text>

                {/* Elétrodo de Terra Local (Vareta Cooperweld) */}
                <rect x="110" y="170" width="30" height="70" rx="2" fill="#B45309" />
                <text x="60" y="258" fill="#FCD34D" fontSize="9" fontWeight="bold">Elétrodo do Cliente (Ra &lt; 20 Ω)</text>
              </g>

              {/* INSTALAÇÃO TN-S (CONDUTOR DE PROTEÇÃO SEPARADO) */}
              <g transform="translate(560, 70)">
                <rect x="0" y="0" width="250" height="260" rx="10" fill="#111827" stroke="#3B82F6" strokeWidth="1.5" />
                <text x="16" y="24" fill="#60A5FA" fontSize="11" fontWeight="bold">SISTEMA TN-S (REDE INDUSTRIAL)</text>
                <text x="16" y="38" fill="#94A3B8" fontSize="9">Neutro e PE separados na origem</text>

                <rect x="25" y="60" width="200" height="70" rx="6" fill="#1E293B" stroke="#38BDF8" />
                <text x="35" y="85" fill="#F8FAFC" fontSize="10" fontWeight="bold">QUADRO GERAL TGBT</text>
                <text x="35" y="102" fill="#BAE6FD" fontSize="9">Loop de Falha de Baixa Impedância</text>

                <text x="35" y="180" fill="#10B981" fontSize="10" fontWeight="bold">Disparo instantâneo por curto!</text>
                <text x="35" y="200" fill="#94A3B8" fontSize="9">Elimina tensão perigosa em &lt; 0,4s</text>
              </g>
            </svg>
          )}

          {/* ============================================================= */}
          {/* DIAGRAMA 6: AUTOMAÇÃO DE BOMBA D'ÁGUA                         */}
          {resolvedDiagram === 'water_pump_automation' && (
            <svg
              viewBox="0 0 850 380"
              className="w-full max-w-[850px] select-none"
              style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))' }}
            >
              <rect width="850" height="380" fill="#0A0F1D" rx="16" />
              <text x="30" y="36" fill="#94A3B8" fontSize="12" fontWeight="bold" fontFamily="monospace">
                CIRCUITO DE COMANDO AUTOMÁTICO DE BOMBA D'ÁGUA COM BOIAS DE NÍVEL (IEC 60947)
              </text>
              {/* Tanque e Bomba */}
              <g transform="translate(50, 70)">
                <rect x="0" y="0" width="220" height="260" rx="10" fill="#111827" stroke="#38BDF8" />
                <text x="16" y="24" fill="#38BDF8" fontSize="11" fontWeight="bold">RESERVATÓRIO SUPERIOR</text>
                <rect x="20" y="60" width="180" height="150" fill="#0369A1" opacity="0.3" rx="4" />
                <circle cx="110" cy="100" r="16" fill="#F59E0B" />
                <text x="90" y="140" fill="#FDE68A" fontSize="9" fontWeight="bold">Boia de Nível</text>
              </g>
              <g transform="translate(320, 70)">
                <rect x="0" y="0" width="220" height="260" rx="10" fill="#111827" stroke="#334155" />
                <text x="16" y="24" fill="#F8FAFC" fontSize="11" fontWeight="bold">QUADRO DE COMANDO</text>
                <rect x="20" y="50" width="180" height="40" rx="6" fill="#1E293B" />
                <text x="40" y="75" fill="#34D399" fontSize="10" fontWeight="bold">CHAVE MAN / AUTO</text>
                <rect x="20" y="110" width="180" height="50" rx="6" fill="#1E293B" stroke="#3B82F6" />
                <text x="40" y="140" fill="#93C5FD" fontSize="10" fontWeight="bold">CONTATOR KM1 (230V)</text>
              </g>
              <g transform="translate(590, 70)">
                <rect x="0" y="0" width="210" height="260" rx="10" fill="#111827" stroke="#10B981" />
                <text x="16" y="24" fill="#34D399" fontSize="11" fontWeight="bold">ELETROBOMBA 230V</text>
                <circle cx="105" cy="140" r="40" fill="#1E293B" stroke="#10B981" strokeWidth="2" />
                <text x="80" y="145" fill="#34D399" fontSize="12" fontWeight="black">BOMBA</text>
              </g>
            </svg>
          )}

          {/* ============================================================= */}
          {/* DIAGRAMA 7: CIRCUITO HIDRÁULICO INDUSTRIAL                    */}
          {resolvedDiagram === 'hydraulic_circuit' && (
            <svg
              viewBox="0 0 850 380"
              className="w-full max-w-[850px] select-none"
              style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))' }}
            >
              <rect width="850" height="380" fill="#0A0F1D" rx="16" />
              <text x="30" y="36" fill="#94A3B8" fontSize="12" fontWeight="bold" fontFamily="monospace">
                CIRCUITO HIDRÁULICO INDUSTRIAL (ISO 1219) • VÁLVULA 4/3 VIAS E CILINDRO DUPLA AÇÃO
              </text>
              <g transform="translate(60, 70)">
                <rect x="0" y="0" width="220" height="260" rx="10" fill="#111827" stroke="#F59E0B" />
                <text x="16" y="24" fill="#F59E0B" fontSize="11" fontWeight="bold">UNIDADE HIDRÁULICA</text>
                <text x="16" y="50" fill="#94A3B8" fontSize="9">Tanque de Óleo ISO VG 46</text>
                <circle cx="110" cy="120" r="30" fill="#1E293B" stroke="#F59E0B" strokeWidth="2" />
                <text x="85" y="125" fill="#FDE68A" fontSize="10" fontWeight="bold">BOMBA P</text>
                <rect x="40" y="180" width="140" height="30" rx="4" fill="#0F172A" stroke="#EF4444" />
                <text x="50" y="200" fill="#FDA4AF" fontSize="9">Válvula Alívio 160 bar</text>
              </g>
              <g transform="translate(320, 70)">
                <rect x="0" y="0" width="220" height="260" rx="10" fill="#111827" stroke="#3B82F6" />
                <text x="16" y="24" fill="#38BDF8" fontSize="11" fontWeight="bold">VÁLVULA DIRECIONAL</text>
                <text x="16" y="50" fill="#94A3B8" fontSize="9">4/3 Vias Centro Fechado</text>
                <rect x="25" y="80" width="170" height="90" rx="6" fill="#1E293B" stroke="#60A5FA" />
                <text x="40" y="130" fill="#93C5FD" fontSize="10" fontWeight="bold">SOLENOIDES Y1 / Y2</text>
              </g>
              <g transform="translate(580, 70)">
                <rect x="0" y="0" width="220" height="260" rx="10" fill="#111827" stroke="#10B981" />
                <text x="16" y="24" fill="#34D399" fontSize="11" fontWeight="bold">CILINDRO DUPLA AÇÃO</text>
                <rect x="30" y="100" width="160" height="60" rx="6" fill="#1E293B" stroke="#10B981" strokeWidth="2" />
                <text x="55" y="135" fill="#34D399" fontSize="10" fontWeight="bold">AVANÇO / RETORNO</text>
              </g>
            </svg>
          )}

          {/* ============================================================= */}
          {/* DIAGRAMA 8: CIRCUITO PNEUMÁTICO INDUSTRIAL                    */}
          {resolvedDiagram === 'pneumatic_circuit' && (
            <svg
              viewBox="0 0 850 380"
              className="w-full max-w-[850px] select-none"
              style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))' }}
            >
              <rect width="850" height="380" fill="#0A0F1D" rx="16" />
              <text x="30" y="36" fill="#94A3B8" fontSize="12" fontWeight="bold" fontFamily="monospace">
                CIRCUITO PNEUMÁTICO INDUSTRIAL (ISO 1219) • UNIDADE FRL & VÁLVULA 5/2 VIAS
              </text>
              <g transform="translate(60, 70)">
                <rect x="0" y="0" width="220" height="260" rx="10" fill="#111827" stroke="#38BDF8" />
                <text x="16" y="24" fill="#38BDF8" fontSize="11" fontWeight="bold">TRATAMENTO DE AR</text>
                <text x="16" y="50" fill="#94A3B8" fontSize="9">Conjunto FRL (Filtro, Reg, Lub)</text>
                <circle cx="110" cy="130" r="30" fill="#1E293B" stroke="#38BDF8" strokeWidth="2" />
                <text x="88" y="135" fill="#BAE6FD" fontSize="11" fontWeight="bold">6 BAR</text>
              </g>
              <g transform="translate(320, 70)">
                <rect x="0" y="0" width="220" height="260" rx="10" fill="#111827" stroke="#F59E0B" />
                <text x="16" y="24" fill="#F59E0B" fontSize="11" fontWeight="bold">VÁLVULA 5/2 VIAS</text>
                <text x="16" y="50" fill="#94A3B8" fontSize="9">Acionamento Solenoide 24Vdc</text>
                <rect x="30" y="100" width="160" height="60" rx="6" fill="#1E293B" stroke="#F59E0B" />
                <text x="45" y="135" fill="#FDE68A" fontSize="10" fontWeight="bold">PILOTADA POR AR</text>
              </g>
              <g transform="translate(580, 70)">
                <rect x="0" y="0" width="220" height="260" rx="10" fill="#111827" stroke="#10B981" />
                <text x="16" y="24" fill="#34D399" fontSize="11" fontWeight="bold">ATUADOR PNEUMÁTICO</text>
                <rect x="30" y="100" width="160" height="60" rx="6" fill="#1E293B" stroke="#10B981" strokeWidth="2" />
                <text x="50" y="135" fill="#34D399" fontSize="10" fontWeight="bold">CILINDRO ISO 15552</text>
              </g>
            </svg>
          )}
        </div>
      </div>

      {/* RODAPÉ DO DIAGRAMA COM INFORMAÇÃO DIDÁTICA E LEGENDA */}
      <div className="p-3 sm:p-4 bg-[#0B1220] border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <Info className="w-4 h-4 text-blue-400 shrink-0" />
          <span className="text-[11px] leading-tight text-slate-300">
            {highlight === 'phase' && 'Exibindo condutores energizados de Fase L. Nunca seccionar ou encostar sem bloqueio mecânico LOTO.'}
            {highlight === 'neutral' && 'Neutro N (Azul Claro) fecha o circuito com a terra do transformador. Não deve possuir fusível nem disjuntor unipolar isolado.'}
            {highlight === 'earth' && 'Condutor de Proteção PE (Verde-Amarelo) desvia correntes de fuga para a terra antes de atingirem o corpo humano.'}
            {highlight === 'return' && 'Retornos e comandos ligam os interruptores aos receptáculos de carga apenas quando acionados.'}
            {highlight === 'all' && 'Diagrama multifilar em conformidade estrita com os regulamentos de instalações elétricas e normas IEC / EN.'}
          </span>
        </div>

        <div className="flex items-center gap-2 text-[10px] text-slate-400 shrink-0">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Vetorização SVG HD • Sem Distorções</span>
        </div>
      </div>
    </div>
  );
};
