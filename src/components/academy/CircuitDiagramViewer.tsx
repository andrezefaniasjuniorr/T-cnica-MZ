import React, { useState, useEffect, useRef } from 'react';
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
  RotateCcw,
  Compass,
  FileCode,
  Sliders,
  Move
} from 'lucide-react';

export type WireHighlight = 'all' | 'phase' | 'neutral' | 'earth' | 'return';
export type DiagramViewType = 'multifilar' | 'unifilar' | 'comando' | 'vetorial';

export interface CircuitDiagramViewerProps {
  diagramId?: string;
  lessonCode?: string;
  lessonTitle?: string;
  norma?: string;
  baseFontSize?: number;
  className?: string;
  initialView?: DiagramViewType;
}

export const CircuitDiagramViewer: React.FC<CircuitDiagramViewerProps> = ({
  diagramId,
  lessonCode = 'EC',
  lessonTitle = 'Esquema de Circuito',
  norma = 'IEC 60364',
  baseFontSize = 15,
  className = '',
  initialView = 'multifilar'
}) => {
  const [highlight, setHighlight] = useState<WireHighlight>('all');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [activeView, setActiveView] = useState<DiagramViewType>(initialView);

  // Pan / arrasto
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });

  // Fechar com tecla Escape no modo Lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isExpanded) {
        setIsExpanded(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isExpanded]);

  // Reseta pan ao mudar zoom ou fechar fullscreen
  const handleResetZoom = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    setHighlight('all');
  };

  // Determina família de diagramas
  const diagramFamily = React.useMemo(() => {
    if (diagramId) return diagramId;
    const lower = (lessonTitle || '').toLowerCase();

    if (lower.includes('comutador') || lower.includes('escada') || lower.includes('ilumina') || lower.includes('three-way') || lower.includes('interruptor')) {
      return 'lighting';
    }
    if (lower.includes('motor') || lower.includes('contator') || lower.includes('partida') || lower.includes('trifásico') || lower.includes('estrela')) {
      return 'motors';
    }
    if (lower.includes('solar') || lower.includes('fotovoltaic') || lower.includes('inversor') || lower.includes('bateria') || lower.includes('mppt')) {
      return 'solar';
    }
    if (lower.includes('aterramento') || lower.includes('terra') || lower.includes('elétrodo') || lower.includes('tn-s') || lower.includes('tt')) {
      return 'earthing';
    }
    if (lower.includes('bomba') || lower.includes('automação') || lower.includes('boia')) {
      return 'pump';
    }
    if (lower.includes('pt') || lower.includes('transformador') || lower.includes('média tensão') || lower.includes('subestação')) {
      return 'substation';
    }
    if (lower.includes('climatiz') || lower.includes('ar condicionado') || lower.includes('refrigera') || lower.includes('hvac')) {
      return 'hvac';
    }
    if (lower.includes('física') || lower.includes('ohm') || lower.includes('potência') || lower.includes('fator') || lower.includes('kirchhoff')) {
      return 'physics';
    }
    if (lower.includes('hidráulic') || lower.includes('óleo')) {
      return 'hydraulic';
    }
    if (lower.includes('pneumátic') || lower.includes('ar comprimido')) {
      return 'pneumatic';
    }
    return 'distribution';
  }, [diagramId, lessonTitle]);

  // Abas de visualização didática disponíveis para este tópico (Multiplicidade)
  const availableViews = React.useMemo(() => {
    switch (diagramFamily) {
      case 'lighting':
        return [
          { id: 'multifilar' as DiagramViewType, label: 'Esquema Multifilar (Conexões)', icon: Zap },
          { id: 'unifilar' as DiagramViewType, label: 'Esquema Unifilar Normativo (Tubulação)', icon: FileCode }
        ];
      case 'motors':
        return [
          { id: 'multifilar' as DiagramViewType, label: 'Circuito de Força (Potência 400V)', icon: Zap },
          { id: 'comando' as DiagramViewType, label: 'Circuito de Comando & Lógica (230V)', icon: Sliders }
        ];
      case 'physics':
        return [
          { id: 'vetorial' as DiagramViewType, label: 'Diagrama Vetorial Fasorial & Triângulo de Potências', icon: Compass },
          { id: 'multifilar' as DiagramViewType, label: 'Circuito AC Fundamental de Medição', icon: Zap }
        ];
      case 'solar':
        return [
          { id: 'multifilar' as DiagramViewType, label: 'Instalação Híbrida Completa (CC / CA)', icon: Zap },
          { id: 'unifilar' as DiagramViewType, label: 'String Box & Proteções Normativas', icon: FileCode }
        ];
      case 'distribution':
      case 'earthing':
      default:
        return [
          { id: 'multifilar' as DiagramViewType, label: 'Quadro Geral QGD (Multifilar)', icon: Zap },
          { id: 'unifilar' as DiagramViewType, label: 'Diagrama Unifilar IEC 60364', icon: FileCode },
          { id: 'vetorial' as DiagramViewType, label: 'Aterramento & Equipotencialização (TT/TN-S)', icon: ShieldCheck }
        ];
    }
  }, [diagramFamily]);

  // Garante que a view ativa pertença às opções disponíveis
  useEffect(() => {
    if (!availableViews.some(v => v.id === activeView)) {
      setActiveView(availableViews[0].id);
    }
  }, [availableViews, activeView]);

  // Opacidades e estilos baseados no condutor realçado
  const getWireOpacity = (type: WireHighlight) => {
    if (highlight === 'all') return 1;
    return highlight === type ? 1 : 0.22;
  };

  const getWireStrokeWidth = (type: WireHighlight, defaultWidth: number = 3) => {
    if (highlight === type) return defaultWidth + 2;
    return defaultWidth;
  };

  // Manipulação de Pan com mouse/touch
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel <= 1 && !isExpanded) return;
    setIsPanning(true);
    setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    setPanOffset({
      x: e.clientX - panStart.x,
      y: e.clientY - panStart.y
    });
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  return (
    <div
      className={`rounded-2xl bg-[#070D18] border border-blue-900/40 shadow-xl transition-all ${
        isExpanded
          ? 'fixed inset-0 z-[99999] w-screen h-screen bg-[#070D18]/98 backdrop-blur-md flex flex-col'
          : 'w-full'
      } ${className}`}
      style={{
        fontSize: `${Math.max(12, Math.min(22, baseFontSize))}px`
      }}
    >
      {/* =================================================================== */}
      {/* TOPO: TÍTULO, NORMA, MULTIPLICIDADE DE DIAGRAMAS & FERRAMENTAS     */}
      {/* =================================================================== */}
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
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                Diagrama Normativo Oficial
              </span>
              {isExpanded && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                  Modo Lightbox Completo (100% Tela)
                </span>
              )}
            </div>
            <h4 className="text-xs sm:text-sm font-black text-white truncate mt-0.5">
              {lessonCode ? `${lessonCode}: ` : ''}{lessonTitle}
            </h4>
          </div>
        </div>

        {/* Ferramentas: Zoom, Reset, Fullscreen */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setZoomLevel(prev => Math.max(0.6, Number((prev - 0.15).toFixed(2))))}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
            title="Diminuir Zoom"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="font-mono text-[11px] text-slate-400 px-1 min-w-[42px] text-center select-none">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setZoomLevel(prev => Math.min(2.5, Number((prev + 0.15).toFixed(2))))}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
            title="Aumentar Zoom"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleResetZoom}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
            title="Resetar Zoom, Posição e Filtros"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => {
              setIsExpanded(!isExpanded);
              setPanOffset({ x: 0, y: 0 });
            }}
            className="p-1.5 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 border border-blue-500/30 transition cursor-pointer ml-1"
            title={isExpanded ? 'Sair da tela cheia (ESC)' : 'Expandir diagrama (Lightbox Sem Cortes)'}
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* =================================================================== */}
      {/* SELEÇÃO MULTIPLA DIDÁTICA (UNIFILAR, MULTIFILAR, COMANDO, VETORIAL)  */}
      {/* =================================================================== */}
      <div className="px-3 sm:px-4 py-2 bg-[#0B132B] border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mr-1 hidden sm:inline">
            Modo Visual:
          </span>
          {availableViews.map(view => {
            const IconComponent = view.icon;
            const isActive = activeView === view.id;
            return (
              <button
                key={view.id}
                type="button"
                onClick={() => {
                  setActiveView(view.id);
                  handleResetZoom();
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-400'
                    : 'bg-slate-900/70 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
                }`}
              >
                <IconComponent className="w-3.5 h-3.5" />
                <span>{view.label}</span>
              </button>
            );
          })}
        </div>

        {/* Realce Interativo de Condutores (Apenas para esquemas elétricos com cabos) */}
        {activeView !== 'vetorial' && (
          <div className="flex items-center gap-1 text-[11px] font-bold overflow-x-auto no-scrollbar">
            <span className="text-slate-400 mr-1 text-[10px] uppercase tracking-wider hidden md:inline">
              Filtro:
            </span>
            <button
              type="button"
              onClick={() => setHighlight('all')}
              className={`px-2 py-0.5 rounded text-[11px] transition cursor-pointer ${
                highlight === 'all'
                  ? 'bg-slate-700 text-white font-bold'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              Todos
            </button>
            <button
              type="button"
              onClick={() => setHighlight('phase')}
              className={`px-2 py-0.5 rounded text-[11px] transition flex items-center gap-1 cursor-pointer ${
                highlight === 'phase'
                  ? 'bg-rose-950 text-rose-300 border border-rose-500 font-bold'
                  : 'bg-slate-900/60 text-slate-300 hover:text-rose-300'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#E11D48]" />
              <span>Fase</span>
            </button>
            <button
              type="button"
              onClick={() => setHighlight('neutral')}
              className={`px-2 py-0.5 rounded text-[11px] transition flex items-center gap-1 cursor-pointer ${
                highlight === 'neutral'
                  ? 'bg-sky-950 text-sky-300 border border-sky-400 font-bold'
                  : 'bg-slate-900/60 text-slate-300 hover:text-sky-300'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#0284C7]" />
              <span>Neutro</span>
            </button>
            <button
              type="button"
              onClick={() => setHighlight('earth')}
              className={`px-2 py-0.5 rounded text-[11px] transition flex items-center gap-1 cursor-pointer ${
                highlight === 'earth'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-400 font-bold'
                  : 'bg-slate-900/60 text-slate-300 hover:text-emerald-300'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-gradient-to-r from-emerald-400 to-yellow-400" />
              <span>Terra PE</span>
            </button>
          </div>
        )}
      </div>

      {/* =================================================================== */}
      {/* ÁREA PRINCIPAL DO SVG VETORIZADO (SEM CORTES, COM PAN & ZOOM LIVRE) */}
      {/* =================================================================== */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`p-3 sm:p-6 flex items-center justify-center bg-[#070D18] overflow-auto select-none transition-all ${
          isExpanded
            ? 'flex-1 w-full h-full min-h-[75vh] cursor-grab active:cursor-grabbing'
            : 'w-full min-h-[360px]'
        }`}
        style={{ touchAction: 'pan-x pan-y' }}
      >
        <div
          className="transition-transform duration-100 flex items-center justify-center w-full"
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
            transformOrigin: 'center center'
          }}
        >
          {/* =============================================================== */}
          {/* 1. ILUMINAÇÃO THREE-WAY: MULTIFILAR / CONEXÕES REAIS            */}
          {/* =============================================================== */}
          {diagramFamily === 'lighting' && activeView === 'multifilar' && (
            <svg
              viewBox="0 0 880 390"
              className="w-full max-w-[880px] h-auto object-contain"
              style={{ filter: 'drop-shadow(0 4px 14px rgba(0,0,0,0.6))' }}
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
              <rect width="880" height="390" fill="#0A0F1D" rx="16" />
              <rect width="880" height="390" fill="url(#grid_pattern)" rx="16" />

              <text x="30" y="34" fill="#94A3B8" fontSize="12" fontWeight="bold" fontFamily="monospace">
                COMUTAÇÃO DE ESCADA THREE-WAY (IEC 60364) • ESQUEMA MULTIFILAR FÍSICO COM RETORNOS
              </text>

              {/* Quadro Geral QGD */}
              <g transform="translate(30, 65)">
                <rect x="0" y="0" width="130" height="280" rx="10" fill="#111827" stroke="#334155" strokeWidth="1.5" />
                <text x="14" y="24" fill="#38BDF8" fontSize="11" fontWeight="bold">QUADRO GERAL</text>
                <text x="14" y="38" fill="#64748B" fontSize="9">MCB 10A Curva B</text>

                <rect x="25" y="55" width="80" height="60" rx="6" fill="#1E293B" stroke="#475569" strokeWidth="1.5" />
                <text x="44" y="80" fill="#E2E8F0" fontSize="11" fontWeight="bold">MCB 10A</text>
                <text x="40" y="96" fill="#10B981" fontSize="9" fontWeight="bold">LIGADO [I]</text>

                <circle cx="65" cy="135" r="5" fill="#E11D48" />
                <text x="32" y="152" fill="#FDA4AF" fontSize="10" fontWeight="bold">Fase L (230V)</text>

                <rect x="20" y="180" width="90" height="22" rx="4" fill="#0369A1" opacity="0.8" />
                <circle cx="65" cy="191" r="4" fill="#38BDF8" />
                <text x="28" y="218" fill="#7DD3FC" fontSize="10" fontWeight="bold">Barra Neutro N</text>

                <rect x="20" y="235" width="90" height="22" rx="4" fill="#065F46" opacity="0.8" />
                <circle cx="65" cy="246" r="4" fill="#34D399" />
                <text x="28" y="272" fill="#6EE7B7" fontSize="10" fontWeight="bold">Barra Terra PE</text>
              </g>

              {/* Condutor de Fase L até Comutador 1 */}
              <path
                d="M 95 200 L 220 200 L 220 230 L 250 230"
                fill="none"
                stroke="#E11D48"
                strokeWidth={getWireStrokeWidth('phase', 3.5)}
                opacity={getWireOpacity('phase')}
                strokeLinecap="round"
              />
              <text x="135" y="190" fill="#FDA4AF" fontSize="10" fontWeight="bold" opacity={getWireOpacity('phase')}>
                Fase L (1,5 mm²)
              </text>

              {/* Comutador 1 */}
              <g transform="translate(250, 160)">
                <rect x="0" y="0" width="130" height="140" rx="10" fill="#111827" stroke="#64748B" strokeWidth="1.5" />
                <text x="14" y="22" fill="#F8FAFC" fontSize="11" fontWeight="bold">COMUTADOR 1</text>
                <text x="14" y="36" fill="#94A3B8" fontSize="9">Ponto Inicial Escada</text>
                <circle cx="20" cy="70" r="6" fill="#E11D48" />
                <text x="12" y="92" fill="#FDA4AF" fontSize="9" fontWeight="bold">Comum</text>
                <circle cx="110" cy="50" r="5" fill="#F59E0B" />
                <text x="75" y="44" fill="#FCD34D" fontSize="9">Borne 1</text>
                <circle cx="110" cy="90" r="5" fill="#F59E0B" />
                <text x="75" y="104" fill="#FCD34D" fontSize="9">Borne 2</text>
                <line x1="20" y1="70" x2="110" y2="50" stroke="#F8FAFC" strokeWidth="3" strokeLinecap="round" />
              </g>

              {/* Fios de Retorno Paralelos (L1 e L2) */}
              <path
                d="M 360 210 L 510 210"
                fill="none"
                stroke="#F59E0B"
                strokeWidth={getWireStrokeWidth('return', 3)}
                opacity={getWireOpacity('return')}
              />
              <text x="400" y="202" fill="#FDE68A" fontSize="10" fontWeight="bold" opacity={getWireOpacity('return')}>
                Retorno L1
              </text>
              <path
                d="M 360 250 L 510 250"
                fill="none"
                stroke="#F59E0B"
                strokeWidth={getWireStrokeWidth('return', 3)}
                opacity={getWireOpacity('return')}
              />
              <text x="400" y="266" fill="#FDE68A" fontSize="10" fontWeight="bold" opacity={getWireOpacity('return')}>
                Retorno L2
              </text>

              {/* Comutador 2 */}
              <g transform="translate(510, 160)">
                <rect x="0" y="0" width="130" height="140" rx="10" fill="#111827" stroke="#64748B" strokeWidth="1.5" />
                <text x="14" y="22" fill="#F8FAFC" fontSize="11" fontWeight="bold">COMUTADOR 2</text>
                <text x="14" y="36" fill="#94A3B8" fontSize="9">Ponto Final Escada</text>
                <circle cx="20" cy="50" r="5" fill="#F59E0B" />
                <circle cx="20" cy="90" r="5" fill="#F59E0B" />
                <circle cx="110" cy="70" r="6" fill="#F97316" />
                <text x="70" y="92" fill="#FDBA74" fontSize="9" fontWeight="bold">Lâmpada</text>
                <line x1="20" y1="50" x2="110" y2="70" stroke="#F8FAFC" strokeWidth="3" strokeLinecap="round" />
              </g>

              {/* Retorno da Lâmpada */}
              <path
                d="M 620 230 L 710 230 L 710 200"
                fill="none"
                stroke="#F97316"
                strokeWidth={getWireStrokeWidth('return', 3.5)}
                opacity={getWireOpacity('return')}
              />

              {/* Luminária / Lâmpada */}
              <g transform="translate(710, 100)">
                <rect x="0" y="0" width="130" height="170" rx="12" fill="#111827" stroke="#F59E0B" strokeWidth="2" />
                <text x="24" y="24" fill="#F59E0B" fontSize="11" fontWeight="bold">LUMINÁRIA</text>
                <text x="28" y="38" fill="#94A3B8" fontSize="9">LED 230V 18W</text>
                <circle cx="65" cy="85" r="26" fill="url(#bulbGlow)" stroke="#F59E0B" strokeWidth="2" />
                <circle cx="25" cy="85" r="5" fill="#F97316" />
                <text x="12" y="105" fill="#FED7AA" fontSize="9">Retorno</text>
                <circle cx="105" cy="85" r="5" fill="#0284C7" />
                <text x="85" y="105" fill="#7DD3FC" fontSize="9">Neutro</text>
                <circle cx="65" cy="140" r="5" fill="#10B981" />
                <text x="50" y="155" fill="#6EE7B7" fontSize="9">Terra PE</text>
              </g>

              {/* Neutro Direto do QGD até a Lâmpada */}
              <path
                d="M 95 256 L 160 256 L 160 80 L 815 80 L 815 185"
                fill="none"
                stroke="#0284C7"
                strokeWidth={getWireStrokeWidth('neutral', 3)}
                opacity={getWireOpacity('neutral')}
                strokeLinecap="round"
              />
              <text x="420" y="72" fill="#7DD3FC" fontSize="10" fontWeight="bold" opacity={getWireOpacity('neutral')}>
                Neutro N Contínuo (IEC 60364-5-52: NUNCA SECCIONAR)
              </text>

              {/* Terra PE até a Carcaça da Luminária */}
              <path
                d="M 95 311 L 180 311 L 180 350 L 775 350 L 775 270"
                fill="none"
                stroke="#10B981"
                strokeWidth={getWireStrokeWidth('earth', 3)}
                opacity={getWireOpacity('earth')}
                strokeDasharray="10,4"
              />
              <text x="360" y="344" fill="#6EE7B7" fontSize="10" fontWeight="bold" opacity={getWireOpacity('earth')}>
                Condutor de Proteção PE (Equipotencialização de Massas)
              </text>
            </svg>
          )}

          {/* =============================================================== */}
          {/* 2. ILUMINAÇÃO: UNIFILAR NORMATIVO (TUBULAÇÃO E CONDUTORES)       */}
          {/* =============================================================== */}
          {diagramFamily === 'lighting' && activeView === 'unifilar' && (
            <svg
              viewBox="0 0 880 380"
              className="w-full max-w-[880px] h-auto object-contain"
              style={{ filter: 'drop-shadow(0 4px 14px rgba(0,0,0,0.6))' }}
            >
              <rect width="880" height="380" fill="#0A0F1D" rx="16" />
              <text x="30" y="36" fill="#94A3B8" fontSize="12" fontWeight="bold" fontFamily="monospace">
                PLANTA & ESQUEMA UNIFILAR NORMATIVO IEC (TUBULAÇÃO E REPRESENTAÇÃO DE CONDUTORES)
              </text>

              {/* Tubulação / Eletroduto Principal */}
              <line x1="80" y1="180" x2="800" y2="180" stroke="#475569" strokeWidth="6" strokeLinecap="round" />
              <text x="360" y="150" fill="#CBD5E1" fontSize="11" fontWeight="bold">
                Eletroduto Corrugado Ø 20 mm (3/4")
              </text>

              {/* QGD */}
              <g transform="translate(60, 110)">
                <rect x="0" y="0" width="70" height="140" fill="#1E293B" stroke="#38BDF8" strokeWidth="2" />
                <line x1="0" y1="0" x2="70" y2="140" stroke="#38BDF8" strokeWidth="1.5" />
                <text x="-15" y="165" fill="#38BDF8" fontSize="11" fontWeight="bold">QGD (Circuito 1)</text>
              </g>

              {/* Trecho 1: Fase, Neutro, Terra */}
              <g transform="translate(200, 140)">
                {/* Fase */}
                <line x1="10" y1="20" x2="10" y2="60" stroke="#E11D48" strokeWidth="2.5" />
                <text x="6" y="15" fill="#FDA4AF" fontSize="9">F</text>
                {/* Neutro */}
                <line x1="25" y1="20" x2="25" y2="40" stroke="#0284C7" strokeWidth="2.5" />
                <line x1="20" y1="20" x2="25" y2="20" stroke="#0284C7" strokeWidth="2.5" />
                <text x="21" y="15" fill="#7DD3FC" fontSize="9">N</text>
                {/* Terra */}
                <line x1="40" y1="20" x2="40" y2="40" stroke="#10B981" strokeWidth="2.5" />
                <line x1="35" y1="20" x2="45" y2="20" stroke="#10B981" strokeWidth="2.5" />
                <text x="35" y="15" fill="#6EE7B7" fontSize="9">PE</text>
                <text x="-5" y="80" fill="#94A3B8" fontSize="9">3x 1,5mm²</text>
              </g>

              {/* Comutador A */}
              <g transform="translate(300, 240)">
                <circle cx="20" cy="20" r="18" fill="#1E293B" stroke="#F59E0B" strokeWidth="2" />
                <text x="14" y="24" fill="#FDE68A" fontSize="11" fontWeight="bold">S1</text>
                <line x1="20" y1="2" x2="20" y2="-60" stroke="#475569" strokeWidth="4" />
                <text x="-25" y="55" fill="#CBD5E1" fontSize="10">Comutador Escada A</text>
              </g>

              {/* Trecho 2: Dois Retornos L1 e L2 */}
              <g transform="translate(430, 140)">
                <line x1="10" y1="25" x2="10" y2="55" stroke="#F59E0B" strokeWidth="2.5" />
                <line x1="25" y1="25" x2="25" y2="55" stroke="#F59E0B" strokeWidth="2.5" />
                <text x="2" y="15" fill="#FDE68A" fontSize="9">2 Retornos</text>
                <text x="0" y="75" fill="#94A3B8" fontSize="9">2x 1,5mm²</text>
              </g>

              {/* Comutador B */}
              <g transform="translate(560, 240)">
                <circle cx="20" cy="20" r="18" fill="#1E293B" stroke="#F59E0B" strokeWidth="2" />
                <text x="14" y="24" fill="#FDE68A" fontSize="11" fontWeight="bold">S2</text>
                <line x1="20" y1="2" x2="20" y2="-60" stroke="#475569" strokeWidth="4" />
                <text x="-25" y="55" fill="#CBD5E1" fontSize="10">Comutador Escada B</text>
              </g>

              {/* Trecho 3: Retorno, Neutro, Terra */}
              <g transform="translate(670, 140)">
                <line x1="10" y1="25" x2="10" y2="55" stroke="#F97316" strokeWidth="2.5" />
                <line x1="25" y1="20" x2="25" y2="40" stroke="#0284C7" strokeWidth="2.5" />
                <line x1="20" y1="20" x2="25" y2="20" stroke="#0284C7" strokeWidth="2.5" />
                <line x1="40" y1="20" x2="40" y2="40" stroke="#10B981" strokeWidth="2.5" />
                <line x1="35" y1="20" x2="45" y2="20" stroke="#10B981" strokeWidth="2.5" />
                <text x="5" y="75" fill="#94A3B8" fontSize="9">R + N + PE</text>
              </g>

              {/* Ponto de Luz no Teto */}
              <g transform="translate(770, 140)">
                <circle cx="40" cy="40" r="32" fill="#1E293B" stroke="#F59E0B" strokeWidth="2.5" />
                <line x1="15" y1="15" x2="65" y2="65" stroke="#F59E0B" strokeWidth="2" />
                <line x1="15" y1="65" x2="65" y2="15" stroke="#F59E0B" strokeWidth="2" />
                <text x="32" y="44" fill="#FDE68A" fontSize="12" fontWeight="bold">a</text>
                <text x="10" y="95" fill="#CBD5E1" fontSize="10" fontWeight="bold">Luminária a</text>
                <text x="14" y="110" fill="#94A3B8" fontSize="9">LED 18W / 230V</text>
              </g>
            </svg>
          )}

          {/* =============================================================== */}
          {/* 3. QUADRO GERAL DE DISTRIBUIÇÃO QGD (MULTIFILAR)                */}
          {/* =============================================================== */}
          {(diagramFamily === 'distribution' || diagramFamily === 'earthing') && activeView === 'multifilar' && (
            <svg
              viewBox="0 0 880 400"
              className="w-full max-w-[880px] h-auto object-contain"
              style={{ filter: 'drop-shadow(0 4px 14px rgba(0,0,0,0.6))' }}
            >
              <rect width="880" height="400" fill="#0A0F1D" rx="16" />
              <text x="30" y="34" fill="#94A3B8" fontSize="12" fontWeight="bold" fontFamily="monospace">
                QUADRO GERAL DE DISTRIBUIÇÃO QGD (IEC 60364-4-41) • DISJUNTOR GERAL, IDR 30mA & DPS
              </text>

              {/* Entrada EDM */}
              <g transform="translate(30, 70)">
                <rect x="0" y="0" width="130" height="290" rx="10" fill="#111827" stroke="#38BDF8" strokeWidth="1.5" />
                <text x="14" y="24" fill="#38BDF8" fontSize="11" fontWeight="bold">ENTRADA REDE EDM</text>
                <text x="14" y="40" fill="#94A3B8" fontSize="9">Ramal 230V / 50Hz</text>
                <circle cx="65" cy="80" r="8" fill="#E11D48" />
                <text x="24" y="105" fill="#FDA4AF" fontSize="10" fontWeight="bold">Fase L (Castanho)</text>
                <circle cx="65" cy="150" r="8" fill="#0284C7" />
                <text x="24" y="175" fill="#7DD3FC" fontSize="10" fontWeight="bold">Neutro N (Azul)</text>
                <circle cx="65" cy="220" r="8" fill="#10B981" />
                <text x="16" y="245" fill="#6EE7B7" fontSize="10" fontWeight="bold">Terra PE (Verde/Am)</text>
              </g>

              {/* Disjuntor Geral Bipolar */}
              <g transform="translate(190, 70)">
                <rect x="0" y="0" width="150" height="150" rx="10" fill="#1E293B" stroke="#64748B" strokeWidth="1.5" />
                <text x="14" y="24" fill="#F8FAFC" fontSize="11" fontWeight="bold">DISJUNTOR GERAL</text>
                <text x="14" y="40" fill="#94A3B8" fontSize="9">MCB Bipolar 40A Curva C</text>
                <rect x="25" y="60" width="100" height="50" rx="6" fill="#0F172A" stroke="#3B82F6" />
                <text x="40" y="90" fill="#60A5FA" fontSize="11" fontWeight="bold">40A • 6kA</text>
              </g>

              {/* DPS Classe II */}
              <g transform="translate(190, 240)">
                <rect x="0" y="0" width="150" height="120" rx="10" fill="#1E293B" stroke="#F59E0B" strokeWidth="1.5" />
                <text x="14" y="22" fill="#F59E0B" fontSize="11" fontWeight="bold">DPS TIPO II (SOBRETENSÃO)</text>
                <text x="14" y="38" fill="#94A3B8" fontSize="9">Uc 275V • Imax 40kA</text>
                <rect x="25" y="55" width="100" height="40" rx="4" fill="#065F46" />
                <text x="44" y="80" fill="#34D399" fontSize="10" fontWeight="bold">STATUS: OK</text>
              </g>

              {/* IDR 30mA */}
              <g transform="translate(380, 70)">
                <rect x="0" y="0" width="160" height="290" rx="10" fill="#1E293B" stroke="#10B981" strokeWidth="2" />
                <text x="14" y="24" fill="#10B981" fontSize="11" fontWeight="bold">DIFERENCIAL (IDR / RCD)</text>
                <text x="14" y="40" fill="#94A3B8" fontSize="9">In 40A • IΔn 30mA • Bipolar</text>
                <rect x="30" y="65" width="100" height="80" rx="6" fill="#0F172A" stroke="#10B981" />
                <text x="45" y="100" fill="#34D399" fontSize="12" fontWeight="bold">30 mA</text>
                <text x="36" y="125" fill="#CBD5E1" fontSize="9">Disparo &lt; 40ms</text>
                <circle cx="80" cy="180" r="14" fill="#E11D48" />
                <text x="73" y="184" fill="#FFFFFF" fontSize="11" fontWeight="bold">T</text>
                <text x="32" y="210" fill="#FDA4AF" fontSize="9">Botão de Teste Mensal</text>
              </g>

              {/* Disjuntores dos Circuitos Terminais */}
              <g transform="translate(580, 70)">
                <rect x="0" y="0" width="270" height="290" rx="10" fill="#111827" stroke="#334155" strokeWidth="1.5" />
                <text x="16" y="24" fill="#F8FAFC" fontSize="11" fontWeight="bold">CIRCUITOS TERMINAIS</text>
                {/* Circuito 1 */}
                <rect x="15" y="45" width="240" height="65" rx="6" fill="#1E293B" stroke="#475569" />
                <text x="25" y="68" fill="#F8FAFC" fontSize="11" fontWeight="bold">C1: Iluminação • MCB 10A</text>
                <text x="25" y="85" fill="#94A3B8" fontSize="9">Cabo 1,5 mm² • Proteção contra sobrecarga</text>
                {/* Circuito 2 */}
                <rect x="15" y="125" width="240" height="65" rx="6" fill="#1E293B" stroke="#475569" />
                <text x="25" y="148" fill="#F8FAFC" fontSize="11" fontWeight="bold">C2: Tomadas TUG • MCB 16A</text>
                <text x="25" y="165" fill="#94A3B8" fontSize="9">Cabo 2,5 mm² • Proteção com IDR 30mA</text>
                {/* Circuito 3 */}
                <rect x="15" y="205" width="240" height="65" rx="6" fill="#1E293B" stroke="#475569" />
                <text x="25" y="228" fill="#F8FAFC" fontSize="11" fontWeight="bold">C3: Ar Condicionado • MCB 20A</text>
                <text x="25" y="245" fill="#94A3B8" fontSize="9">Cabo 4,0 mm² • Carga específica TUE</text>
              </g>
            </svg>
          )}

          {/* =============================================================== */}
          {/* 4. QUADRO GERAL: DIAGRAMA UNIFILAR IEC 60364                    */}
          {/* =============================================================== */}
          {(diagramFamily === 'distribution' || diagramFamily === 'lighting') && activeView === 'unifilar' && (
            <svg
              viewBox="0 0 880 390"
              className="w-full max-w-[880px] h-auto object-contain"
              style={{ filter: 'drop-shadow(0 4px 14px rgba(0,0,0,0.6))' }}
            >
              <rect width="880" height="390" fill="#0A0F1D" rx="16" />
              <text x="30" y="34" fill="#94A3B8" fontSize="12" fontWeight="bold" fontFamily="monospace">
                ESQUEMA UNIFILAR NORMATIVO IEC 60364 • QUADRO DE DISTRIBUIÇÃO E COORDENAÇÃO
              </text>

              {/* Linha Geral de Alimentação */}
              <line x1="60" y1="120" x2="200" y2="120" stroke="#38BDF8" strokeWidth="4" />
              <text x="60" y="95" fill="#38BDF8" fontSize="11" fontWeight="bold">Ramal EDM 230V</text>
              <text x="60" y="110" fill="#94A3B8" fontSize="9">2x 10 mm² Cu</text>

              {/* Símbolo Disjuntor Geral */}
              <g transform="translate(200, 100)">
                <rect x="0" y="0" width="40" height="40" fill="#1E293B" stroke="#38BDF8" strokeWidth="2" />
                <line x1="5" y1="35" x2="35" y2="5" stroke="#38BDF8" strokeWidth="2" />
                <text x="-10" y="60" fill="#F8FAFC" fontSize="10" fontWeight="bold">MCB 2P 40A</text>
                <text x="-5" y="74" fill="#94A3B8" fontSize="9">Curva C</text>
              </g>

              <line x1="240" y1="120" x2="320" y2="120" stroke="#E2E8F0" strokeWidth="3" />

              {/* Ramificação DPS */}
              <line x1="270" y1="120" x2="270" y2="240" stroke="#F59E0B" strokeWidth="2.5" />
              <g transform="translate(250, 240)">
                <rect x="0" y="0" width="40" height="40" fill="#1E293B" stroke="#F59E0B" strokeWidth="2" />
                <line x1="5" y1="20" x2="35" y2="20" stroke="#F59E0B" strokeWidth="2" />
                <line x1="20" y1="5" x2="20" y2="35" stroke="#F59E0B" strokeWidth="2" />
                <text x="-15" y="60" fill="#F59E0B" fontSize="10" fontWeight="bold">DPS 275V</text>
                <text x="-10" y="74" fill="#94A3B8" fontSize="9">Imax 40kA</text>
              </g>

              {/* IDR 30mA */}
              <g transform="translate(320, 100)">
                <rect x="0" y="0" width="45" height="40" fill="#1E293B" stroke="#10B981" strokeWidth="2" />
                <ellipse cx="22" cy="20" rx="14" ry="10" fill="none" stroke="#10B981" strokeWidth="2" />
                <text x="-10" y="60" fill="#10B981" fontSize="10" fontWeight="bold">IDR 2P 40A</text>
                <text x="-5" y="74" fill="#94A3B8" fontSize="9">IΔn = 30mA</text>
              </g>

              {/* Barramento Principal Distribuidor */}
              <line x1="365" y1="120" x2="520" y2="120" stroke="#E2E8F0" strokeWidth="3" />
              <line x1="520" y1="60" x2="520" y2="300" stroke="#3B82F6" strokeWidth="5" strokeLinecap="round" />
              <text x="470" y="50" fill="#60A5FA" fontSize="10" fontWeight="bold">Barramento Fase L</text>

              {/* Saída Circuito 1 */}
              <line x1="520" y1="100" x2="620" y2="100" stroke="#E2E8F0" strokeWidth="2.5" />
              <g transform="translate(620, 85)">
                <rect x="0" y="0" width="30" height="30" fill="#1E293B" stroke="#E2E8F0" strokeWidth="1.5" />
                <text x="40" y="15" fill="#F8FAFC" fontSize="10" fontWeight="bold">Circuito 1: Iluminação Geral</text>
                <text x="40" y="28" fill="#94A3B8" fontSize="9">MCB 10A • 3x 1,5 mm² • 850 W</text>
              </g>

              {/* Saída Circuito 2 */}
              <line x1="520" y1="180" x2="620" y2="180" stroke="#E2E8F0" strokeWidth="2.5" />
              <g transform="translate(620, 165)">
                <rect x="0" y="0" width="30" height="30" fill="#1E293B" stroke="#E2E8F0" strokeWidth="1.5" />
                <text x="40" y="15" fill="#F8FAFC" fontSize="10" fontWeight="bold">Circuito 2: Tomadas TUG Sala/Quartos</text>
                <text x="40" y="28" fill="#94A3B8" fontSize="9">MCB 16A • 3x 2,5 mm² • 2200 W</text>
              </g>

              {/* Saída Circuito 3 */}
              <line x1="520" y1="260" x2="620" y2="260" stroke="#E2E8F0" strokeWidth="2.5" />
              <g transform="translate(620, 245)">
                <rect x="0" y="0" width="30" height="30" fill="#1E293B" stroke="#E2E8F0" strokeWidth="1.5" />
                <text x="40" y="15" fill="#F8FAFC" fontSize="10" fontWeight="bold">Circuito 3: Climatização AC 18.000 BTU</text>
                <text x="40" y="28" fill="#94A3B8" fontSize="9">MCB 20A • 3x 4,0 mm² • 2800 W</text>
              </g>
            </svg>
          )}

          {/* =============================================================== */}
          {/* 5. MOTORES TRIFÁSICOS: FORÇA (POTÊNCIA 400V)                     */}
          {/* =============================================================== */}
          {diagramFamily === 'motors' && activeView === 'multifilar' && (
            <svg
              viewBox="0 0 880 390"
              className="w-full max-w-[880px] h-auto object-contain"
              style={{ filter: 'drop-shadow(0 4px 14px rgba(0,0,0,0.6))' }}
            >
              <rect width="880" height="390" fill="#0A0F1D" rx="16" />
              <text x="30" y="34" fill="#94A3B8" fontSize="12" fontWeight="bold" fontFamily="monospace">
                PARTIDA DIRETA DE MOTOR TRIFÁSICO (IEC 60947-4-1) • CIRCUITO DE FORÇA E POTÊNCIA 400V
              </text>

              {/* Barramento Trifásico L1, L2, L3 + PE */}
              <g transform="translate(50, 60)">
                <line x1="0" y1="10" x2="800" y2="10" stroke="#78350F" strokeWidth="4" />
                <text x="10" y="5" fill="#D97706" fontSize="10" fontWeight="bold">L1 (Castanho)</text>
                <line x1="0" y1="30" x2="800" y2="30" stroke="#1E293B" strokeWidth="4" />
                <text x="10" y="25" fill="#94A3B8" fontSize="10" fontWeight="bold">L2 (Preto)</text>
                <line x1="0" y1="50" x2="800" y2="50" stroke="#475569" strokeWidth="4" />
                <text x="10" y="45" fill="#CBD5E1" fontSize="10" fontWeight="bold">L3 (Cinzento)</text>
              </g>

              {/* Disjuntor-Motor QM1 */}
              <g transform="translate(200, 140)">
                <rect x="0" y="0" width="130" height="90" rx="8" fill="#1E293B" stroke="#38BDF8" strokeWidth="1.5" />
                <text x="16" y="22" fill="#38BDF8" fontSize="11" fontWeight="bold">DISJUNTOR-MOTOR</text>
                <text x="16" y="36" fill="#94A3B8" fontSize="9">QM1 • Ajuste Térmico 10-16A</text>
                <rect x="25" y="50" width="80" height="28" rx="4" fill="#0F172A" stroke="#38BDF8" />
                <text x="42" y="68" fill="#38BDF8" fontSize="10" fontWeight="bold">Icu = 50kA</text>
              </g>

              {/* Contator de Potência KM1 */}
              <g transform="translate(380, 140)">
                <rect x="0" y="0" width="130" height="90" rx="8" fill="#1E293B" stroke="#3B82F6" strokeWidth="1.5" />
                <text x="18" y="22" fill="#60A5FA" fontSize="11" fontWeight="bold">CONTATOR KM1</text>
                <text x="18" y="36" fill="#94A3B8" fontSize="9">Contatos 1-2, 3-4, 5-6</text>
                <rect x="25" y="50" width="80" height="28" rx="4" fill="#0F172A" stroke="#3B82F6" />
                <text x="44" y="68" fill="#60A5FA" fontSize="10" fontWeight="bold">AC-3 18A</text>
              </g>

              {/* Relé Térmico de Sobrecarga F1 */}
              <g transform="translate(560, 140)">
                <rect x="0" y="0" width="130" height="90" rx="8" fill="#1E293B" stroke="#F59E0B" strokeWidth="1.5" />
                <text x="18" y="22" fill="#F59E0B" fontSize="11" fontWeight="bold">RELÉ TÉRMICO F1</text>
                <text x="18" y="36" fill="#94A3B8" fontSize="9">Bimetálico Diferencial</text>
                <rect x="25" y="50" width="80" height="28" rx="4" fill="#0F172A" stroke="#F59E0B" />
                <text x="42" y="68" fill="#FDE68A" fontSize="10" fontWeight="bold">Classe 10A</text>
              </g>

              {/* Motor de Indução Trifásico M1 */}
              <g transform="translate(730, 130)">
                <circle cx="55" cy="55" r="50" fill="#111827" stroke="#10B981" strokeWidth="2.5" />
                <text x="44" y="50" fill="#34D399" fontSize="16" fontWeight="black">M1</text>
                <text x="42" y="70" fill="#10B981" fontSize="12" fontWeight="bold">3 ~</text>
                <text x="22" y="125" fill="#34D399" fontSize="10" fontWeight="bold">Motor 7,5 kW</text>
                <text x="20" y="140" fill="#94A3B8" fontSize="9">400V 50Hz • cos φ 0,85</text>
              </g>
            </svg>
          )}

          {/* =============================================================== */}
          {/* 6. MOTORES: CIRCUITO DE COMANDO & LÓGICA (230V)                  */}
          {/* =============================================================== */}
          {diagramFamily === 'motors' && activeView === 'comando' && (
            <svg
              viewBox="0 0 880 390"
              className="w-full max-w-[880px] h-auto object-contain"
              style={{ filter: 'drop-shadow(0 4px 14px rgba(0,0,0,0.6))' }}
            >
              <rect width="880" height="390" fill="#0A0F1D" rx="16" />
              <text x="30" y="34" fill="#94A3B8" fontSize="12" fontWeight="bold" fontFamily="monospace">
                CIRCUITO DE COMANDO E INTERTRAVAMENTO (IEC 60947) • BOTOEIRAS, SELO 13-14 E BOBINA A1-A2
              </text>

              {/* Barramento de Comando L e N */}
              <line x1="80" y1="80" x2="800" y2="80" stroke="#E11D48" strokeWidth="3" />
              <text x="80" y="65" fill="#FDA4AF" fontSize="11" fontWeight="bold">Fase de Comando L1 (230V)</text>
              <line x1="80" y1="340" x2="800" y2="340" stroke="#0284C7" strokeWidth="3" />
              <text x="80" y="360" fill="#7DD3FC" fontSize="11" fontWeight="bold">Neutro N (0V)</text>

              {/* Contato NF 95-96 do Relé Térmico */}
              <g transform="translate(140, 80)">
                <line x1="30" y1="0" x2="30" y2="40" stroke="#E11D48" strokeWidth="2.5" />
                <rect x="15" y="40" width="30" height="30" fill="#1E293B" stroke="#F59E0B" strokeWidth="1.5" />
                <line x1="10" y1="55" x2="45" y2="55" stroke="#F59E0B" strokeWidth="2" />
                <text x="50" y="55" fill="#FDE68A" fontSize="9">F1 (95-96 NF)</text>
                <line x1="30" y1="70" x2="30" y2="100" stroke="#E11D48" strokeWidth="2.5" />
              </g>

              {/* Botoeira S0 Desliga (NF) */}
              <g transform="translate(140, 180)">
                <rect x="15" y="0" width="30" height="30" fill="#7F1D1D" stroke="#EF4444" strokeWidth="1.5" />
                <text x="22" y="20" fill="#FFFFFF" fontSize="11" fontWeight="bold">0</text>
                <text x="50" y="20" fill="#FCA5A5" fontSize="10" fontWeight="bold">S0 (Parada NF)</text>
                <line x1="30" y1="30" x2="30" y2="60" stroke="#E11D48" strokeWidth="2.5" />
              </g>

              {/* Ramo Paralelo: Botoeira S1 Liga (NA) e Selo KM1 (13-14) */}
              <g transform="translate(320, 180)">
                {/* Botoeira S1 */}
                <rect x="0" y="0" width="35" height="30" fill="#065F46" stroke="#10B981" strokeWidth="1.5" />
                <text x="14" y="20" fill="#FFFFFF" fontSize="11" fontWeight="bold">I</text>
                <text x="45" y="20" fill="#6EE7B7" fontSize="10" fontWeight="bold">S1 (Partida NA)</text>

                {/* Selo KM1 13-14 */}
                <g transform="translate(0, 50)">
                  <rect x="0" y="0" width="35" height="30" fill="#1E293B" stroke="#3B82F6" strokeWidth="1.5" />
                  <text x="45" y="20" fill="#93C5FD" fontSize="10" fontWeight="bold">KM1 (Selo 13-14)</text>
                </g>
              </g>

              {/* Bobina do Contator KM1 A1-A2 */}
              <g transform="translate(560, 220)">
                <rect x="0" y="0" width="70" height="50" rx="6" fill="#1E293B" stroke="#3B82F6" strokeWidth="2" />
                <text x="18" y="28" fill="#93C5FD" fontSize="12" fontWeight="black">KM1</text>
                <text x="14" y="44" fill="#60A5FA" fontSize="9">A1 - A2 (230V)</text>
                <line x1="35" y1="50" x2="35" y2="120" stroke="#0284C7" strokeWidth="2.5" />
              </g>

              {/* Sinalização Luminosa: Verde = Ligado, Vermelho = Falha */}
              <g transform="translate(720, 220)">
                <circle cx="25" cy="25" r="18" fill="#065F46" stroke="#10B981" strokeWidth="2" />
                <text x="18" y="29" fill="#FFFFFF" fontSize="10" fontWeight="bold">H1</text>
                <text x="-5" y="55" fill="#6EE7B7" fontSize="9" fontWeight="bold">Operando (Verde)</text>
              </g>
            </svg>
          )}

          {/* =============================================================== */}
          {/* 7. FÍSICA ELÉTRICA: DIAGRAMA VETORIAL & TRIÂNGULO DE POTÊNCIAS   */}
          {/* =============================================================== */}
          {diagramFamily === 'physics' && (
            <svg
              viewBox="0 0 880 390"
              className="w-full max-w-[880px] h-auto object-contain"
              style={{ filter: 'drop-shadow(0 4px 14px rgba(0,0,0,0.6))' }}
            >
              <rect width="880" height="390" fill="#0A0F1D" rx="16" />
              <text x="30" y="34" fill="#94A3B8" fontSize="12" fontWeight="bold" fontFamily="monospace">
                DIAGRAMA FASORIAL VETORIAL & TRIÂNGULO DE POTÊNCIAS AC (IEC 60027 / IEC 60831)
              </text>

              {/* TRIÂNGULO DE POTÊNCIAS */}
              <g transform="translate(80, 80)">
                {/* Cateto Adjacente: Potência Ativa P (kW) */}
                <line x1="0" y1="200" x2="300" y2="200" stroke="#10B981" strokeWidth="5" strokeLinecap="round" />
                <polygon points="300,195 315,200 300,205" fill="#10B981" />
                <text x="80" y="230" fill="#34D399" fontSize="12" fontWeight="black">
                  POTÊNCIA ATIVA P = V × I × cos φ (kW)
                </text>
                <text x="80" y="248" fill="#94A3B8" fontSize="10">
                  Trabalho mecânico útil, iluminação e calor
                </text>

                {/* Cateto Oposto: Potência Reativa Q (kVAr) */}
                <line x1="300" y1="200" x2="300" y2="40" stroke="#F59E0B" strokeWidth="5" strokeLinecap="round" />
                <polygon points="295,40 300,25 305,40" fill="#F59E0B" />
                <text x="315" y="110" fill="#FDE68A" fontSize="12" fontWeight="black">
                  POTÊNCIA REATIVA Q (kVAr)
                </text>
                <text x="315" y="128" fill="#94A3B8" fontSize="10">
                  Campo magnético de motores e reatores
                </text>

                {/* Hipotenusa: Potência Aparente S (kVA) */}
                <line x1="0" y1="200" x2="300" y2="40" stroke="#3B82F6" strokeWidth="5" strokeLinecap="round" />
                <polygon points="295,35 310,30 305,48" fill="#3B82F6" />
                <text x="80" y="100" fill="#93C5FD" fontSize="13" fontWeight="black">
                  POTÊNCIA APARENTE S = √(P² + Q²) (kVA)
                </text>
                <text x="80" y="118" fill="#94A3B8" fontSize="10">
                  Dimensão de cabos, disjuntores e transformadores
                </text>

                {/* Arco do Ângulo de Desfasamento φ */}
                <path d="M 60 200 A 60 60 0 0 0 52 170" fill="none" stroke="#E11D48" strokeWidth="3" />
                <text x="70" y="185" fill="#FDA4AF" fontSize="12" fontWeight="bold">
                  Ângulo φ (cos φ = P / S)
                </text>
              </g>

              {/* PAINEL DE CRITÉRIOS NORMATIVOS EDM */}
              <g transform="translate(540, 75)">
                <rect x="0" y="0" width="300" height="270" rx="12" fill="#111827" stroke="#334155" strokeWidth="1.5" />
                <text x="20" y="30" fill="#38BDF8" fontSize="12" fontWeight="bold">
                  REGULAMENTAÇÃO EDM & LIMITES
                </text>

                <rect x="20" y="50" width="260" height="55" rx="6" fill="#0F172A" stroke="#10B981" />
                <text x="30" y="72" fill="#34D399" fontSize="11" fontWeight="bold">Fator de Potência Alvo: ≥ 0,92</text>
                <text x="30" y="90" fill="#CBD5E1" fontSize="9">Isento de multas por consumo de reativo</text>

                <rect x="20" y="120" width="260" height="55" rx="6" fill="#0F172A" stroke="#EF4444" />
                <text x="30" y="142" fill="#FCA5A5" fontSize="11" fontWeight="bold">FP &lt; 0,92: Multa da Concessionária</text>
                <text x="30" y="160" fill="#CBD5E1" fontSize="9">Sobrecarga de cabos e quedas de tensão</text>

                <rect x="20" y="190" width="260" height="60" rx="6" fill="#0F172A" stroke="#3B82F6" />
                <text x="30" y="212" fill="#60A5FA" fontSize="11" fontWeight="bold">Correção com Banco de Capacitores</text>
                <text x="30" y="230" fill="#CBD5E1" fontSize="9">Qc = P × [tan(φ1) - tan(φ2)]</text>
              </g>
            </svg>
          )}

          {/* =============================================================== */}
          {/* 8. SOLAR FOTOVOLTAICO: INSTALAÇÃO HÍBRIDA & PROTEÇÕES CC/CA     */}
          {diagramFamily === 'solar' && (
            <svg
              viewBox="0 0 880 390"
              className="w-full max-w-[880px] h-auto object-contain"
              style={{ filter: 'drop-shadow(0 4px 14px rgba(0,0,0,0.6))' }}
            >
              <rect width="880" height="390" fill="#0A0F1D" rx="16" />
              <text x="30" y="34" fill="#94A3B8" fontSize="12" fontWeight="bold" fontFamily="monospace">
                INSTALAÇÃO SOLAR FOTOVOLTAICA HÍBRIDA (IEC 62446 / IEC 60364-7-712) • CC, BATERIAS & CA
              </text>

              {/* Painéis Solares PV */}
              <g transform="translate(40, 70)">
                <rect x="0" y="0" width="130" height="150" rx="8" fill="#1E293B" stroke="#F59E0B" strokeWidth="2" />
                <text x="14" y="24" fill="#F59E0B" fontSize="11" fontWeight="bold">ARRANJO SOLAR PV</text>
                <text x="14" y="38" fill="#94A3B8" fontSize="9">String CC 450V • 5 kWp</text>
                {/* Células */}
                <rect x="15" y="50" width="45" height="35" fill="#0F172A" stroke="#3B82F6" />
                <rect x="70" y="50" width="45" height="35" fill="#0F172A" stroke="#3B82F6" />
                <rect x="15" y="95" width="45" height="35" fill="#0F172A" stroke="#3B82F6" />
                <rect x="70" y="95" width="45" height="35" fill="#0F172A" stroke="#3B82F6" />
              </g>

              {/* String Box CC */}
              <g transform="translate(220, 70)">
                <rect x="0" y="0" width="130" height="150" rx="8" fill="#111827" stroke="#EF4444" strokeWidth="1.5" />
                <text x="14" y="24" fill="#FCA5A5" fontSize="11" fontWeight="bold">STRING BOX CC</text>
                <text x="14" y="40" fill="#94A3B8" fontSize="9">Fusíveis gPV 1000V 15A</text>
                <text x="14" y="65" fill="#F59E0B" fontSize="10" fontWeight="bold">DPS CC 1000V</text>
                <text x="14" y="95" fill="#38BDF8" fontSize="10" fontWeight="bold">Seccionadora CC</text>
              </g>

              {/* Inversor Híbrido */}
              <g transform="translate(400, 70)">
                <rect x="0" y="0" width="150" height="180" rx="10" fill="#1E293B" stroke="#3B82F6" strokeWidth="2" />
                <text x="14" y="26" fill="#60A5FA" fontSize="12" fontWeight="black">INVERSOR HÍBRIDO</text>
                <text x="14" y="42" fill="#94A3B8" fontSize="9">5 kW • MPPT 120-500V</text>
                <rect x="25" y="60" width="100" height="50" rx="4" fill="#0F172A" stroke="#3B82F6" />
                <text x="35" y="85" fill="#38BDF8" fontSize="11" fontWeight="bold">CC  ⮀  CA</text>
                <text x="30" y="102" fill="#10B981" fontSize="9" fontWeight="bold">Sincronismo EDM</text>
              </g>

              {/* Banco de Baterias LiFePO4 */}
              <g transform="translate(400, 270)">
                <rect x="0" y="0" width="150" height="85" rx="8" fill="#111827" stroke="#10B981" strokeWidth="2" />
                <text x="14" y="22" fill="#34D399" fontSize="11" fontWeight="bold">BANCO DE BATERIAS</text>
                <text x="14" y="38" fill="#94A3B8" fontSize="9">LiFePO4 48V • 10 kWh</text>
                <text x="14" y="65" fill="#CBD5E1" fontSize="9" fontWeight="bold">BMS Integrado com CanBus</text>
              </g>

              {/* Quadro CA e Saída para Cargas Críticas */}
              <g transform="translate(610, 70)">
                <rect x="0" y="0" width="220" height="220" rx="10" fill="#111827" stroke="#334155" strokeWidth="1.5" />
                <text x="16" y="24" fill="#F8FAFC" fontSize="11" fontWeight="bold">QUADRO CA & BACKUP</text>
                <text x="16" y="42" fill="#94A3B8" fontSize="9">Chave de Transferência Automática</text>

                <rect x="15" y="60" width="190" height="40" rx="4" fill="#1E293B" stroke="#3B82F6" />
                <text x="25" y="84" fill="#60A5FA" fontSize="10" fontWeight="bold">Entrada Concessionária EDM</text>

                <rect x="15" y="115" width="190" height="40" rx="4" fill="#1E293B" stroke="#10B981" />
                <text x="25" y="139" fill="#34D399" fontSize="10" fontWeight="bold">Cargas Prioritárias (Backup)</text>
              </g>
            </svg>
          )}

          {/* =============================================================== */}
          {/* 9. AUTOMAÇÃO DE BOMBA DE ÁGUA COM BOIAS DE NÍVEL                */}
          {diagramFamily === 'pump' && (
            <svg
              viewBox="0 0 880 390"
              className="w-full max-w-[880px] h-auto object-contain"
              style={{ filter: 'drop-shadow(0 4px 14px rgba(0,0,0,0.6))' }}
            >
              <rect width="880" height="390" fill="#0A0F1D" rx="16" />
              <text x="30" y="34" fill="#94A3B8" fontSize="12" fontWeight="bold" fontFamily="monospace">
                AUTOMAÇÃO DE ELETROBOMBA (IEC 60947) • CONTROLE DE NÍVEL CISTERNA & CAIXA ALTA
              </text>
              <g transform="translate(60, 80)">
                <rect x="0" y="0" width="160" height="230" rx="10" fill="#111827" stroke="#0284C7" strokeWidth="2" />
                <text x="16" y="26" fill="#38BDF8" fontSize="11" fontWeight="bold">CISTERNA (INFERIOR)</text>
                <text x="16" y="44" fill="#94A3B8" fontSize="9">Boia de Nível de Segurança</text>
                <circle cx="80" cy="140" r="16" fill="#F59E0B" />
                <text x="35" y="180" fill="#CBD5E1" fontSize="9">Evita funcionamento a seco</text>
              </g>
              <g transform="translate(320, 80)">
                <rect x="0" y="0" width="200" height="230" rx="10" fill="#1E293B" stroke="#3B82F6" strokeWidth="2" />
                <text x="16" y="26" fill="#60A5FA" fontSize="11" fontWeight="bold">QUADRO DE COMANDO</text>
                <text x="16" y="44" fill="#94A3B8" fontSize="9">Chave Seletora [Manual / Auto]</text>
                <rect x="25" y="70" width="150" height="45" rx="4" fill="#0F172A" stroke="#3B82F6" />
                <text x="40" y="96" fill="#60A5FA" fontSize="10" fontWeight="bold">Contator KM1 + Térmico</text>
                <rect x="25" y="130" width="150" height="45" rx="4" fill="#0F172A" stroke="#10B981" />
                <text x="40" y="156" fill="#34D399" fontSize="10" fontWeight="bold">Relé Falta de Fase</text>
              </g>
              <g transform="translate(600, 80)">
                <rect x="0" y="0" width="180" height="230" rx="10" fill="#111827" stroke="#10B981" strokeWidth="2" />
                <text x="16" y="26" fill="#34D399" fontSize="11" fontWeight="bold">CAIXA ALTA (SUPERIOR)</text>
                <text x="16" y="44" fill="#94A3B8" fontSize="9">Boia Superior de Transbordo</text>
                <circle cx="90" cy="90" r="16" fill="#F59E0B" />
                <text x="25" y="140" fill="#CBD5E1" fontSize="9">Desliga bomba ao encher</text>
              </g>
            </svg>
          )}

          {/* =============================================================== */}
          {/* 10. CIRCUITO HIDRÁULICO INDUSTRIAL (ISO 1219)                   */}
          {diagramFamily === 'hydraulic' && (
            <svg
              viewBox="0 0 880 390"
              className="w-full max-w-[880px] h-auto object-contain"
              style={{ filter: 'drop-shadow(0 4px 14px rgba(0,0,0,0.6))' }}
            >
              <rect width="880" height="390" fill="#0A0F1D" rx="16" />
              <text x="30" y="34" fill="#94A3B8" fontSize="12" fontWeight="bold" fontFamily="monospace">
                CIRCUITO HIDRÁULICO INDUSTRIAL (ISO 1219) • VÁLVULA 4/3 VIAS E CILINDRO DUPLA AÇÃO
              </text>
              <g transform="translate(50, 75)">
                <rect x="0" y="0" width="220" height="260" rx="10" fill="#111827" stroke="#F59E0B" />
                <text x="16" y="24" fill="#F59E0B" fontSize="11" fontWeight="bold">CENTRAL HIDRÁULICA</text>
                <text x="16" y="50" fill="#94A3B8" fontSize="9">Reservatório Óleo ISO VG 46</text>
                <circle cx="110" cy="120" r="30" fill="#1E293B" stroke="#F59E0B" strokeWidth="2" />
                <text x="85" y="125" fill="#FDE68A" fontSize="10" fontWeight="bold">BOMBA P</text>
                <rect x="30" y="180" width="160" height="35" rx="4" fill="#0F172A" stroke="#EF4444" />
                <text x="42" y="202" fill="#FDA4AF" fontSize="9" fontWeight="bold">Válvula Alívio 160 bar</text>
              </g>
              <g transform="translate(320, 75)">
                <rect x="0" y="0" width="220" height="260" rx="10" fill="#111827" stroke="#3B82F6" />
                <text x="16" y="24" fill="#38BDF8" fontSize="11" fontWeight="bold">VÁLVULA DIRECIONAL</text>
                <text x="16" y="50" fill="#94A3B8" fontSize="9">4/3 Vias Centro Fechado</text>
                <rect x="25" y="80" width="170" height="90" rx="6" fill="#1E293B" stroke="#60A5FA" />
                <text x="40" y="130" fill="#93C5FD" fontSize="10" fontWeight="bold">SOLENOIDES Y1 / Y2</text>
              </g>
              <g transform="translate(590, 75)">
                <rect x="0" y="0" width="220" height="260" rx="10" fill="#111827" stroke="#10B981" />
                <text x="16" y="24" fill="#34D399" fontSize="11" fontWeight="bold">CILINDRO DUPLA AÇÃO</text>
                <rect x="30" y="100" width="160" height="60" rx="6" fill="#1E293B" stroke="#10B981" strokeWidth="2" />
                <text x="55" y="135" fill="#34D399" fontSize="10" fontWeight="bold">AVANÇO / RETORNO</text>
              </g>
            </svg>
          )}

          {/* =============================================================== */}
          {/* 11. CIRCUITO PNEUMÁTICO INDUSTRIAL (ISO 1219)                   */}
          {diagramFamily === 'pneumatic' && (
            <svg
              viewBox="0 0 880 390"
              className="w-full max-w-[880px] h-auto object-contain"
              style={{ filter: 'drop-shadow(0 4px 14px rgba(0,0,0,0.6))' }}
            >
              <rect width="880" height="390" fill="#0A0F1D" rx="16" />
              <text x="30" y="34" fill="#94A3B8" fontSize="12" fontWeight="bold" fontFamily="monospace">
                CIRCUITO PNEUMÁTICO INDUSTRIAL (ISO 1219) • UNIDADE FRL & VÁLVULA 5/2 VIAS
              </text>
              <g transform="translate(50, 75)">
                <rect x="0" y="0" width="220" height="260" rx="10" fill="#111827" stroke="#38BDF8" />
                <text x="16" y="24" fill="#38BDF8" fontSize="11" fontWeight="bold">TRATAMENTO DE AR</text>
                <text x="16" y="50" fill="#94A3B8" fontSize="9">Conjunto FRL (Filtro, Reg, Lub)</text>
                <circle cx="110" cy="130" r="30" fill="#1E293B" stroke="#38BDF8" strokeWidth="2" />
                <text x="88" y="135" fill="#BAE6FD" fontSize="11" fontWeight="bold">6 BAR</text>
              </g>
              <g transform="translate(320, 75)">
                <rect x="0" y="0" width="220" height="260" rx="10" fill="#111827" stroke="#F59E0B" />
                <text x="16" y="24" fill="#F59E0B" fontSize="11" fontWeight="bold">VÁLVULA 5/2 VIAS</text>
                <text x="16" y="50" fill="#94A3B8" fontSize="9">Acionamento Solenoide 24Vdc</text>
                <rect x="30" y="100" width="160" height="60" rx="6" fill="#1E293B" stroke="#F59E0B" />
                <text x="45" y="135" fill="#FDE68A" fontSize="10" fontWeight="bold">PILOTADA POR AR</text>
              </g>
              <g transform="translate(590, 75)">
                <rect x="0" y="0" width="220" height="260" rx="10" fill="#111827" stroke="#10B981" />
                <text x="16" y="24" fill="#34D399" fontSize="11" fontWeight="bold">ATUADOR PNEUMÁTICO</text>
                <rect x="30" y="100" width="160" height="60" rx="6" fill="#1E293B" stroke="#10B981" strokeWidth="2" />
                <text x="50" y="135" fill="#34D399" fontSize="10" fontWeight="bold">CILINDRO ISO 15552</text>
              </g>
            </svg>
          )}
        </div>
      </div>

      {/* =================================================================== */}
      {/* RODAPÉ: DICAS, LEGENDA NORMATIVA E STATUS                           */}
      {/* =================================================================== */}
      <div className="p-3 sm:p-4 bg-[#0B1220] border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs shrink-0">
        <div className="flex items-center gap-2 text-slate-300">
          <Info className="w-4 h-4 text-blue-400 shrink-0" />
          <span className="text-[11px] leading-tight text-slate-300">
            {isExpanded
              ? 'Dica Lightbox: Arraste com o mouse/touch para navegar livremente pelo esquema em tela cheia sem cortes.'
              : highlight === 'phase'
              ? 'Exibindo condutores energizados de Fase L. Nunca seccionar sem bloqueio mecânico LOTO.'
              : highlight === 'neutral'
              ? 'Neutro N (Azul Claro) fecha o circuito com a terra da subestação. Não deve possuir chave unipolar isolada.'
              : highlight === 'earth'
              ? 'Condutor de Proteção PE (Verde-Amarelo) desvia correntes de fuga para o elétrodo de aterramento.'
              : highlight === 'return'
              ? 'Retornos e comandos ligam os interruptores aos receptáculos de carga apenas quando acionados.'
              : 'Diagramas vetorizados em alta resolução com 100% de pertinência às normas IEC, EN e ISO.'}
          </span>
        </div>

        <div className="flex items-center gap-3 text-[10px] text-slate-400 shrink-0">
          {isExpanded && (
            <span className="text-slate-400 bg-slate-800 px-2 py-0.5 rounded font-mono hidden sm:inline">
              Pressione ESC para fechar
            </span>
          )}
          <div className="flex items-center gap-1.5 text-emerald-400">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Vetorização SVG HD • 100% Responsivo</span>
          </div>
        </div>
      </div>
    </div>
  );
};
