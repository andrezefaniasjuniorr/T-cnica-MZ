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
  Maximize2,
  Sun,
  BatteryCharging
} from 'lucide-react';
import { getComponentDef, WIRE_COLORS } from './cadEngine';
import {
  calculateFilletManhattanPath,
  getFilletSvgPathString,
  getNodeWorldPos,
  findJunctionDots,
  getWireGaugeThickness
} from './cadRouting';

interface CadCircuitPreviewCardProps {
  circuit: CadCircuitProject;
  onTestCircuit?: () => void;
  className?: string;
  hideTestButton?: boolean;
}

export const CadCircuitPreviewCard: React.FC<CadCircuitPreviewCardProps> = ({
  circuit,
  onTestCircuit,
  className = '',
  hideTestButton = false
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
  const [isDaylight, setIsDaylight] = useState<boolean>(true);

  const animationRef = useRef<number | null>(null);

  // Física de Inércia do Motor no Card
  useEffect(() => {
    let lastTime = performance.now();
    const targetRpm = motorTargetOn ? 2920 : 0;

    const updatePhysics = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      setCurrentRpm(prevRpm => {
        if (Math.abs(prevRpm - targetRpm) < 1) return targetRpm;
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

  // Cálculo da Bounding Box do Circuito Customizado
  const customSvgBounds = useMemo(() => {
    if (!hasCustomCadData || !circuit.cadData) {
      return { vbX: 0, vbY: 0, vbW: 760, vbH: 240 };
    }
    const comps = circuit.cadData.components || [];
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

    const pad = 45;
    const vbX = minX - pad;
    const vbY = minY - pad;
    const vbW = Math.max(380, maxX - minX + pad * 2);
    const vbH = Math.max(200, maxY - minY + pad * 2);

    return { vbX, vbY, vbW, vbH };
  }, [hasCustomCadData, circuit.cadData]);

  const junctionDots = useMemo(() => {
    if (!hasCustomCadData || !circuit.cadData) return [];
    return findJunctionDots(circuit.cadData.components, circuit.cadData.wires || []);
  }, [hasCustomCadData, circuit.cadData]);

  /**
   * Renderizador de Terminal Ilhós Tubular (Ferrule) com Parafuso de Aperto no SVG
   */
  const renderSvgFerrule = (
    x: number,
    y: number,
    dir: 'top' | 'bottom' | 'left' | 'right' = 'bottom',
    wireType: string = 'L1',
    gauge: number = 2.5
  ) => {
    let angle = 0;
    if (dir === 'top') angle = -90;
    else if (dir === 'bottom') angle = 90;
    else if (dir === 'left') angle = 180;
    else if (dir === 'right') angle = 0;

    const wireColor = WIRE_COLORS[wireType] || '#f59e0b';
    const scale = Math.max(0.85, Math.min(1.35, Math.sqrt(gauge / 2.5)));

    return (
      <g key={`ferrule_${x}_${y}_${dir}_${wireType}`} transform={`translate(${x}, ${y}) rotate(${angle}) scale(${scale})`}>
        <rect x="-3.2" y="-3.5" width="4.2" height="7" rx="1" fill="#040812" stroke="#1e293b" strokeWidth="0.8" />
        <circle cx="-1.2" cy="0" r="2.2" fill="#94a3b8" stroke="#334155" strokeWidth="0.6" />
        <line x1="-2.4" y1="0" x2="0" y2="0" stroke="#090d16" strokeWidth="0.8" />
        <line x1="-1.2" y1="-1.2" x2="-1.2" y2="1.2" stroke="#090d16" strokeWidth="0.8" />

        <rect x="0" y="-1" width="2.4" height="2" fill="#b45309" />
        <line x1="0.4" y1="-0.6" x2="2.2" y2="-0.6" stroke="#f59e0b" strokeWidth="0.5" />
        <line x1="0.4" y1="0.6" x2="2.2" y2="0.6" stroke="#f59e0b" strokeWidth="0.5" />

        <rect x="0.8" y="-1.6" width="8.5" height="3.2" rx="0.5" fill="#cbd5e1" stroke="#475569" strokeWidth="0.6" />
        <line x1="3.2" y1="-1.4" x2="3.2" y2="1.4" stroke="#1e293b" strokeWidth="0.8" />
        <line x1="6.5" y1="-1.4" x2="6.5" y2="1.4" stroke="#1e293b" strokeWidth="0.8" />

        <path d="M 8 -2 L 13.5 -3.2 L 13.5 3.2 L 8 2 Z" fill={wireColor} stroke="#090d16" strokeWidth="0.6" />
        {wireType === 'PE' && (
          <rect x="9.8" y="-2.6" width="1.8" height="5.2" fill="#eab308" />
        )}
      </g>
    );
  };

  /**
   * Renderizador visual SVG ultra-realista para TODOS os componentes no preview (Zero Caixas Genéricas)
   */
  const renderDeviceVisualSvg = (c: any) => {
    const d = getComponentDef(c.code);
    const w = c.w || 90;
    const h = c.h || 80;
    const isClosed = Boolean(c.state?.closed);
    const isTripped = Boolean(c.state?.tripped);

    // 1. Módulo Solar Fotovoltaico Half-Cell MBB (PV_PANEL)
    if (c.code === 'PV_PANEL' || d.kind === 'pv_panel') {
      const pMax = Number(c.params?.pMax ?? 550);
      const vmpp = Number(c.params?.vmpp ?? 41.8);
      const isSun = (c.params?.irradiance ?? 1000) > 0;
      return (
        <g>
          {/* Moldura de alumínio anodizado prata 3D */}
          <rect x={-w / 2} y={-h / 2} width={w} height={h} rx="4" fill="#64748B" stroke="#1E293B" strokeWidth="1.2" />
          <rect x={-w / 2 + 3} y={-h / 2 + 3} width={w - 6} height={h - 6} rx="2" fill={isSun ? '#0B1D33' : '#0F172A'} />
          {/* Divisão física Half-Cell central branca */}
          <rect x={-w / 2 + 3} y="-1" width={w - 6} height="2" fill="#F8FAFC" />
          {/* Barramentos verticais metálicos Multi-Busbar (MBB) */}
          {[-w * 0.32, -w * 0.16, 0, w * 0.16, w * 0.32].map((bx, idx) => (
            <line key={`pv_bb_${idx}`} x1={bx} y1={-h / 2 + 3} x2={bx} y2={h / 2 - 3} stroke="#FFFFFF" strokeWidth="0.8" opacity="0.6" />
          ))}
          {/* Brilho reflexivo solar ótico */}
          {isSun && (
            <polygon points={`${-w * 0.4},${-h * 0.4} ${w * 0.2},${-h * 0.4} ${-w * 0.2},${h * 0.4} ${-w * 0.4},${h * 0.4}`} fill="rgba(254, 240, 138, 0.18)" />
          )}
          {/* Plaqueta de especificação laser */}
          <rect x={-w * 0.36} y={-h * 0.16} width={w * 0.72} height="20" rx="2" fill="rgba(2,6,23,0.85)" stroke={isSun ? '#F59E0B' : '#475569'} strokeWidth="0.8" />
          <text x="0" y="-3" fill={isSun ? '#FDE047' : '#94A3B8'} fontSize="7" fontWeight="bold" textAnchor="middle">
            {pMax}Wp • {vmpp}V
          </text>
          <text x="0" y="7" fill={isSun ? '#34D399' : '#64748B'} fontSize="5.5" fontWeight="bold" textAnchor="middle">
            HALF-CELL MBB
          </text>
        </g>
      );
    }

    // 2. Inversor On-Grid String Trifásico (PV_INVERTER_ONGRID)
    if (c.code === 'PV_INVERTER_ONGRID' || d.kind === 'pv_inverter_ongrid') {
      const isRun = Boolean(c.state?.running);
      return (
        <g>
          {/* Aletas traseiras de dissipação */}
          <rect x={-w / 2 - 3} y={-h * 0.4} width="3" height={h * 0.8} fill="#334155" />
          <rect x={w / 2} y={-h * 0.4} width="3" height={h * 0.8} fill="#334155" />
          {/* Carcaça frontal em branco puro com cantos curvos */}
          <rect x={-w / 2} y={-h / 2} width={w} height={h} rx="8" fill="#F8FAFC" stroke={isRun ? '#10B981' : '#94A3B8'} strokeWidth="1.5" />
          {/* Display OLED com leitura de potência */}
          <rect x={-w * 0.4} y={-h * 0.16} width={w * 0.8} height={h * 0.42} rx="3" fill="#020617" />
          <text x="0" y="-1" fill={isRun ? '#34D399' : '#F59E0B'} fontSize="7.5" fontWeight="bold" textAnchor="middle">
            {isRun ? '10.0 kW INJETANDO' : 'MPPT STANDBY'}
          </text>
          <text x="0" y="10" fill="#38BDF8" fontSize="5.5" fontWeight="bold" textAnchor="middle">
            400V 3F • 50.0Hz
          </text>
          {/* Halo central LED de status */}
          <circle cx="0" cy={-h * 0.32} r="5" fill={isRun ? '#10B981' : '#F59E0B'} stroke="#FFFFFF" strokeWidth="1" />
          {/* Chave seccionadora CC */}
          <circle cx={-w * 0.3} cy={h * 0.35} r="4" fill="#DC2626" stroke="#FACC15" strokeWidth="0.8" />
        </g>
      );
    }

    // 3. Inversor Off-Grid Senoidal com MPPT (PV_INVERTER_OFFGRID)
    if (c.code === 'PV_INVERTER_OFFGRID' || d.kind === 'pv_inverter_offgrid') {
      const isRun = Boolean(c.state?.running);
      return (
        <g>
          {/* Carcaça mural em azul cobalto e grafite */}
          <rect x={-w / 2} y={-h / 2} width={w} height={h} rx="6" fill="#0369A1" stroke={isRun ? '#38BDF8' : '#475569'} strokeWidth="1.5" />
          {/* Grelha superior das ventoinhas */}
          <rect x={-w * 0.35} y={-h / 2 + 3} width={w * 0.7} height="6" fill="#0F172A" />
          {/* Tela LCD gráfica com diagrama de fluxo */}
          <rect x={-w * 0.4} y={-h * 0.16} width={w * 0.8} height={h * 0.46} rx="3" fill="#064E3B" stroke={isRun ? '#10B981' : '#475569'} strokeWidth="1" />
          <text x="0" y="-2" fill={isRun ? '#34D399' : '#F87171'} fontSize="7" fontWeight="bold" textAnchor="middle">
            {isRun ? '230V CA PURA 5kW' : 'OFF-GRID STANDBY'}
          </text>
          <text x="0" y="9" fill="#A7F3D0" fontSize="5.5" fontWeight="bold" textAnchor="middle">
            PV ➔ BAT 48V ➔ AC
          </text>
          {/* Teclas tácteis de navegação */}
          {[-w * 0.25, -w * 0.08, w * 0.08, w * 0.25].map((kx, idx) => (
            <rect key={`key_${idx}`} x={kx - 4} y={h * 0.34} width="8" height="5" rx="1" fill="#334155" />
          ))}
        </g>
      );
    }

    // 4. Inversor Híbrido Bidirecional com EPS (PV_INVERTER_HYBRID)
    if (c.code === 'PV_INVERTER_HYBRID' || d.kind === 'pv_inverter_hybrid') {
      const isRun = Boolean(c.state?.running);
      return (
        <g>
          <rect x={-w / 2} y={-h / 2} width={w} height={h} rx="7" fill="#F8FAFC" stroke={isRun ? '#10B981' : '#64748B'} strokeWidth="1.5" />
          <rect x={-w * 0.42} y={-h * 0.18} width={w * 0.84} height={h * 0.5} rx="4" fill="#020617" />
          <text x="0" y="-2" fill={isRun ? '#38BDF8' : '#F59E0B'} fontSize="7.5" fontWeight="bold" textAnchor="middle">
            {isRun ? '230V EPS • BACKUP ATIVO' : 'HÍBRIDO PRONTO'}
          </text>
          <text x="0" y="10" fill="#34D399" fontSize="5.5" fontWeight="bold" textAnchor="middle">
            REDE ⇄ HÍBRIDO ⇄ BAT
          </text>
          {/* Dongle Wi-Fi lateral */}
          <rect x={w / 2 - 2} y="-10" width="4" height="14" fill="#0F172A" />
        </g>
      );
    }

    // 5. Bateria de Lítio LiFePO4 Rack 19" 3U (BAT_LIFEPO4)
    if (c.code === 'BAT_LIFEPO4' || d.kind === 'battery' || d.kind === 'bat_lifepo4') {
      const soc = Math.max(0, Math.min(100, Number(c.params?.socPercent ?? 90)));
      return (
        <g>
          {/* Chassi metálico preto fosco */}
          <rect x={-w / 2} y={-h / 2} width={w} height={h} rx="4" fill="#0F172A" stroke="#334155" strokeWidth="1.4" />
          {/* Orelhas de fixação de rack 19" */}
          <rect x={-w / 2} y={-h / 2} width="6" height={h} fill="#1E293B" stroke="#334155" />
          <rect x={w / 2 - 6} y={-h / 2} width="6" height={h} fill="#1E293B" stroke="#334155" />
          <circle cx={-w / 2 + 3} cy={-h * 0.3} r="1.5" fill="#CBD5E1" />
          <circle cx={-w / 2 + 3} cy={h * 0.3} r="1.5" fill="#CBD5E1" />
          <circle cx={w / 2 - 3} cy={-h * 0.3} r="1.5" fill="#CBD5E1" />
          <circle cx={w / 2 - 3} cy={h * 0.3} r="1.5" fill="#CBD5E1" />
          {/* Display OLED */}
          <rect x={-w * 0.38} y={-h * 0.22} width={w * 0.44} height={h * 0.44} rx="2" fill="#020617" />
          <text x={-w * 0.16} y="-3" fill="#38BDF8" fontSize="8" fontWeight="bold" textAnchor="middle">
            {soc}% SOC
          </text>
          <text x={-w * 0.16} y="8" fill="#22C55E" fontSize="5.5" fontWeight="bold" textAnchor="middle">
            51.2V 100Ah
          </text>
          {/* Barra de LEDs de carga */}
          <rect x={-w * 0.35} y={h * 0.12} width={w * 0.38} height="3" fill="#090D16" />
          <rect x={-w * 0.35} y={h * 0.12} width={(w * 0.38) * (soc / 100)} height="3" fill={soc > 20 ? '#22C55E' : '#EF4444'} />
          {/* Bornes SurLok (+ Vermelho / - Preto) */}
          <circle cx={w * 0.26} cy="-8" r="4.5" fill="#DC2626" stroke="#FFFFFF" strokeWidth="0.8" />
          <circle cx={w * 0.26} cy="8" r="4.5" fill="#020617" stroke="#38BDF8" strokeWidth="0.8" />
        </g>
      );
    }

    // 6. Smart Meter Medidor Bidirecional RS-485 (SMART_METER)
    if (c.code === 'SMART_METER' || d.kind === 'smart_meter') {
      return (
        <g>
          <rect x={-w / 2} y={-h / 2} width={w} height={h} rx="4" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="1.2" />
          <rect x={-w * 0.38} y={-h * 0.24} width={w * 0.76} height={h * 0.44} rx="2.5" fill="#0284C7" />
          <text x="0" y="-3" fill="#FFFFFF" fontSize="8.5" fontWeight="bold" textAnchor="middle">
            {c.state?.energyKWh || '0.00'} kWh
          </text>
          <text x="0" y="8" fill="#FEF08A" fontSize="5.5" fontWeight="bold" textAnchor="middle">
            P: {Math.round((c.state?.powerKW || 0) * 1000)}W ⇄ RS485
          </text>
          {/* LED óptico */}
          <circle cx={-w * 0.25} cy={h * 0.3} r="2" fill="#EF4444" />
          <text x="0" y={h * 0.34} fill="#0F172A" fontSize="5.5" fontWeight="bold" textAnchor="middle">
            SMART METER
          </text>
        </g>
      );
    }

    // 7. Grupo Gerador a Diesel (GEN_DIESEL)
    if (c.code === 'GEN_DIESEL') {
      const isRun = Boolean(c.state?.running || c.params?.running);
      return (
        <g>
          <rect x={-w / 2} y={h * 0.32} width={w} height={h * 0.16} rx="2" fill="#0F172A" stroke="#334155" strokeWidth="1" />
          <rect x={-w / 2} y={-h / 2} width={w} height={h * 0.8} rx="6" fill="#EAB308" stroke="#713F12" strokeWidth="1.5" />
          <rect x={-w / 2} y={-h / 2} width="8" height={h * 0.8} fill="#1E293B" />
          <rect x={w / 2 - 8} y={-h / 2} width="8" height={h * 0.8} fill="#1E293B" />
          <rect x={w * 0.2} y={-h / 2 - 8} width="12" height="10" rx="1" fill="#475569" />
          <rect x={-w * 0.42} y={-h * 0.28} width={w * 0.28} height={h * 0.45} rx="3" fill="#0F172A" />
          <rect x={w * 0.04} y={-h * 0.35} width={w * 0.4} height={h * 0.55} rx="3" fill="#020617" stroke="#334155" strokeWidth="1" />
          <rect x={w * 0.08} y={-h * 0.3} width={w * 0.32} height={h * 0.26} fill={isRun ? '#064E3B' : '#1E293B'} stroke={isRun ? '#10B981' : '#475569'} />
          <text x={w * 0.24} y={-h * 0.16} fill={isRun ? '#34D399' : '#EF4444'} fontSize="6.5" fontWeight="bold" textAnchor="middle">
            {isRun ? '400V 50Hz' : 'GMG OFF'}
          </text>
        </g>
      );
    }

    // 8. Chave Comutadora Manual (MTS_SWITCH) com Seletor 1 - 0 - 2
    if (c.code === 'MTS_SWITCH') {
      const pos = Number(c.params?.position ?? 1);
      const handleAngle = pos === 1 ? -45 : pos === 2 ? 45 : 0;
      return (
        <g>
          <rect x={-w / 2} y={-h / 2} width={w} height={h} rx="6" fill="#1E293B" stroke="#475569" strokeWidth="1.5" />
          <circle cx="0" cy="0" r={Math.min(w, h) * 0.34} fill="#0F172A" stroke="#334155" strokeWidth="1.2" />
          <text x="-16" y="-14" fill={pos === 1 ? '#34D399' : '#64748B'} fontSize="7" fontWeight="bold">I</text>
          <text x="0" y="-18" fill={pos === 0 ? '#F59E0B' : '#64748B'} fontSize="7" fontWeight="bold" textAnchor="middle">0</text>
          <text x="16" y="-14" fill={pos === 2 ? '#38BDF8' : '#64748B'} fontSize="7" fontWeight="bold" textAnchor="end">II</text>
          <g transform={`rotate(${handleAngle})`}>
            <rect x="-4" y="-20" width="8" height="24" rx="2" fill="#DC2626" stroke="#FFFFFF" strokeWidth="0.8" />
            <circle cx="0" cy="-14" r="1.5" fill="#FFFFFF" />
          </g>
        </g>
      );
    }

    // 9. Quadro de Transferência Automática (ATS_SWITCH)
    if (c.code === 'ATS_SWITCH') {
      const isGrid = (c.params?.sourceInUse ?? 'GRID') === 'GRID';
      return (
        <g>
          <rect x={-w / 2} y={-h / 2} width={w} height={h} rx="6" fill="#CBD5E1" stroke="#334155" strokeWidth="1.5" />
          <rect x={-w * 0.42} y={-h * 0.36} width={w * 0.84} height={h * 0.72} rx="4" fill="#090D16" />
          <line x1={-w * 0.32} y1="-12" x2="-6" y2="-12" stroke={isGrid ? '#22C55E' : '#64748B'} strokeWidth="2" />
          <line x1={-w * 0.32} y1="12" x2="-6" y2="12" stroke={!isGrid ? '#F59E0B' : '#64748B'} strokeWidth="2" />
          <line x1="8" y1="0" x2={w * 0.32} y2="0" stroke="#38BDF8" strokeWidth="2" />
          <line x1="-6" y1={isGrid ? -12 : 12} x2="8" y2="0" stroke="#FFFFFF" strokeWidth="2" />
          <circle cx={-w * 0.32} cy="-12" r="3" fill={isGrid ? '#22C55E' : '#475569'} />
          <circle cx={-w * 0.32} cy="12" r="3" fill={!isGrid ? '#F59E0B' : '#475569'} />
          <text x="0" y={h * 0.26} fill={isGrid ? '#34D399' : '#F59E0B'} fontSize="6.5" fontWeight="bold" textAnchor="middle">
            {isGrid ? 'REDE OK' : 'GMG ATIVO'}
          </text>
        </g>
      );
    }

    // 10. Eletrobomba Centrífuga em Voluta Caracol (PUMP)
    if (c.code === 'PUMP' || d.kind === 'pump') {
      const isRun = Boolean(c.state?.running);
      return (
        <g>
          <rect x={-w * 0.45} y={h * 0.32} width={w * 0.9} height={8} rx="2" fill="#0F172A" />
          <rect x="0" y={-h * 0.28} width={w * 0.44} height={h * 0.56} rx="4" fill={isRun ? '#047857' : '#0284C7'} stroke={isRun ? '#10B981' : '#0369A1'} strokeWidth="1.2" />
          <line x1="8" y1="-8" x2={w * 0.4} y2="-8" stroke="rgba(255,255,255,0.3)" />
          <line x1="8" y1="0" x2={w * 0.4} y2="0" stroke="rgba(255,255,255,0.3)" />
          <line x1="8" y1="8" x2={w * 0.4} y2="8" stroke="rgba(255,255,255,0.3)" />
          <rect x={w * 0.08} y={-h * 0.44} width={w * 0.28} height="10" rx="1.5" fill="#1E293B" stroke="#475569" strokeWidth="0.8" />
          <circle cx={-w * 0.24} cy="2" r={h * 0.3} fill={isRun ? '#065F46' : '#0369A1'} stroke={isRun ? '#34D399' : '#38BDF8'} strokeWidth="1.5" />
          <rect x={-w * 0.3} y={-h * 0.46} width="12" height="12" fill="#0F172A" stroke="#38BDF8" strokeWidth="1" />
          <rect x={-w * 0.34} y={-h * 0.46} width="20" height="3" fill="#64748B" />
          <circle cx={-w * 0.24} cy="2" r={h * 0.16} fill="#0F172A" stroke="#475569" strokeWidth="1" />
        </g>
      );
    }

    // 11. DPS Monofásico e Tetrapolar (SPD / SPD3)
    if (c.code === 'SPD' || c.code === 'SPD3' || d.kind === 'spd' || d.kind === 'spd3') {
      const is3P = c.code === 'SPD3' || d.kind === 'spd3';
      const isOk = c.state?.status !== 'red' && !isTripped;
      return (
        <g>
          <rect x={-w / 2} y={-h / 2} width={w} height={h} rx="4" fill="#1E293B" stroke="#475569" strokeWidth="1.2" />
          {is3P ? (
            <g>
              {[-w * 0.33, -w * 0.11, w * 0.11, w * 0.33].map((px, idx) => (
                <g key={`spd_cart_${idx}`} transform={`translate(${px}, 0)`}>
                  <rect x={-w * 0.09} y={-h * 0.3} width={w * 0.18} height={h * 0.6} rx="2" fill="#0F172A" stroke="#334155" />
                  <rect x={-w * 0.06} y={-h * 0.18} width={w * 0.12} height="5" fill={isOk ? '#16A34A' : '#DC2626'} />
                  <text x="0" y={h * 0.18} fill="#CBD5E1" fontSize="5.5" fontWeight="bold" textAnchor="middle">
                    {['L1', 'L2', 'L3', 'N'][idx]}
                  </text>
                </g>
              ))}
            </g>
          ) : (
            <g>
              <rect x={-w * 0.36} y={-h * 0.3} width={w * 0.72} height={h * 0.6} rx="2" fill="#0F172A" stroke="#334155" />
              <rect x={-w * 0.22} y={-h * 0.18} width={w * 0.44} height="6" fill={isOk ? '#16A34A' : '#DC2626'} />
              <text x="0" y={h * 0.18} fill="#38BDF8" fontSize="7" fontWeight="bold" textAnchor="middle">MOV 20kA</text>
            </g>
          )}
        </g>
      );
    }

    // 12. Seccionadora de Fusíveis (FUSE / FU3)
    if (c.code === 'FUSE' || c.code === 'FU3' || d.kind === 'fuse' || d.kind === 'fuse3') {
      const is3P = c.code === 'FU3';
      const poles = is3P ? 3 : 1;
      const pW = (w * 0.8) / poles;
      return (
        <g>
          <rect x={-w / 2} y={-h / 2} width={w} height={h} rx="4" fill="#1E293B" stroke="#475569" strokeWidth="1.2" />
          {Array.from({ length: poles }).map((_, idx) => {
            const px = -w * 0.4 + pW / 2 + idx * pW;
            return (
              <g key={`fuse_${idx}`}>
                <rect x={px - pW * 0.4} y={-h * 0.3} width={pW * 0.8} height={h * 0.6} rx="2" fill="#0F172A" stroke="#334155" />
                <rect x={px - pW * 0.2} y={-h * 0.2} width={pW * 0.4} height={h * 0.4} fill="#F8FAFC" />
                <rect x={px - pW * 0.2} y={-h * 0.2} width={pW * 0.4} height="3" fill="#CBD5E1" />
                <rect x={px - pW * 0.2} y={h * 0.2 - 3} width={pW * 0.4} height="3" fill="#CBD5E1" />
              </g>
            );
          })}
        </g>
      );
    }

    // 13. Relé Falta de Fase (PHASE - RPF)
    if (c.code === 'PHASE' || d.kind === 'phaseRelay') {
      return (
        <g>
          <rect x={-w / 2} y={-h / 2} width={w} height={h} rx="4" fill="#1E293B" stroke="#475569" strokeWidth="1.2" />
          <circle cx={-w * 0.25} cy="-6" r="3" fill={isTripped ? '#DC2626' : '#22C55E'} />
          <circle cx="0" cy="-6" r="3" fill={isTripped ? '#DC2626' : '#22C55E'} />
          <circle cx={w * 0.25} cy="-6" r="3" fill={isTripped ? '#DC2626' : '#22C55E'} />
          <text x="0" y={h * 0.22} fill={isTripped ? '#EF4444' : '#38BDF8'} fontSize="6.5" fontWeight="bold" textAnchor="middle">
            {isTripped ? 'FALTA DE FASE' : 'RPF • REDE OK'}
          </text>
        </g>
      );
    }

    // 14. Relés Temporizadores e Auxiliares
    if (c.code === 'TIMER' || c.code === 'TIMER_TOF' || c.code === 'TIMER_STAR_DELTA') {
      return (
        <g>
          <rect x={-w / 2} y={-h / 2} width={w} height={h} rx="4" fill="#1E293B" stroke="#475569" strokeWidth="1.2" />
          <circle cx="0" cy="-4" r={Math.min(w, h) * 0.24} fill="#0F172A" stroke="#38BDF8" strokeWidth="1" />
          <line x1="0" y1="-4" x2="8" y2="-4" stroke="#FFFFFF" strokeWidth="1.5" />
          <circle cx={-w * 0.25} cy={-h * 0.25} r="2" fill={Boolean(c.state?.energized) ? '#22C55E' : '#334155'} />
          <text x="0" y={h * 0.26} fill="#CBD5E1" fontSize="6.5" fontWeight="bold" textAnchor="middle">TIMER DIN</text>
        </g>
      );
    }

    if (c.code === 'RELAY' || d.kind === 'relay') {
      return (
        <g>
          <rect x={-w / 2} y={h * 0.12} width={w} height={h * 0.38} rx="2" fill="#0F172A" />
          <rect x={-w * 0.42} y={-h * 0.42} width={w * 0.84} height={h * 0.6} rx="3" fill="rgba(203,213,225,0.25)" stroke="#94A3B8" strokeWidth="1" />
          <rect x={-w * 0.24} y={-h * 0.3} width={w * 0.48} height={h * 0.36} fill="#B45309" />
        </g>
      );
    }

    if (c.code === 'TIMER_DIGITAL' || c.code === 'THERMOSTAT_DIGITAL') {
      const isTherm = c.code === 'THERMOSTAT_DIGITAL';
      return (
        <g>
          <rect x={-w / 2} y={-h / 2} width={w} height={h} rx="4" fill="#1E293B" stroke="#475569" strokeWidth="1.2" />
          <rect x={-w * 0.38} y={-h * 0.28} width={w * 0.76} height={h * 0.35} rx="2" fill="#020617" />
          <text x="0" y={-h * 0.08} fill={isTherm ? '#EF4444' : '#38BDF8'} fontSize="8" fontWeight="bold" textAnchor="middle">
            {isTherm ? '45.0 °C' : '14:30'}
          </text>
        </g>
      );
    }

    // 15. Aterramento (EARTH_ROD, EARTH_PIT, JUNCTION_BOX)
    if (c.code === 'EARTH_ROD') {
      return (
        <g>
          <rect x="-3" y={-h / 2 + 10} width="6" height={h - 12} fill="#B45309" />
          <rect x="-7" y={-h / 2 + 10} width="14" height="8" fill="#F59E0B" />
        </g>
      );
    }

    if (c.code === 'EARTH_PIT') {
      return (
        <g>
          <circle cx="0" cy="0" r={Math.min(w, h) * 0.38} fill="#64748B" stroke="#1E293B" strokeWidth="1.5" />
          <rect x={-w * 0.25} y="-4" width={w * 0.5} height="8" fill="#B45309" />
        </g>
      );
    }

    if (c.code === 'JUNCTION_BOX') {
      return (
        <g>
          <rect x={-w / 2} y={-h / 2} width={w} height={h} rx="5" fill="#334155" stroke="#475569" strokeWidth="1.2" />
          {[-w * 0.22, 0, w * 0.22].map((wx, idx) => (
            <rect key={`wago_${idx}`} x={wx - 6} y="-10" width="12" height="20" rx="1" fill="#F97316" />
          ))}
        </g>
      );
    }

    // 16. Fotocélula e Sensor PIR
    if (c.code === 'PHOTOCELL') {
      return (
        <g>
          <circle cx="0" cy="0" r={Math.min(w, h) * 0.36} fill="#0284C7" stroke="#38BDF8" strokeWidth="1.5" />
          <circle cx="0" cy="0" r="5" fill="#FDE047" />
        </g>
      );
    }

    if (c.code === 'PIR_SENSOR') {
      return (
        <g>
          <circle cx="0" cy="0" r={Math.min(w, h) * 0.36} fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.5" />
          <circle cx="0" cy="0" r="4" fill={c.state?.presenceDetected ? '#EF4444' : '#22C55E'} />
        </g>
      );
    }

    // 17. Exaustor Axial Industrial (FAN)
    if (c.code === 'FAN' || d.kind === 'fan') {
      return (
        <g>
          <circle cx="0" cy="0" r={Math.min(w, h) * 0.38} fill="#1E293B" stroke="#475569" strokeWidth="1.5" />
          <circle cx="0" cy="0" r="8" fill="#0F172A" />
          <line x1="-14" y1="0" x2="14" y2="0" stroke="#38BDF8" strokeWidth="3" />
          <line x1="0" y1="-14" x2="0" y2="14" stroke="#38BDF8" strokeWidth="3" />
        </g>
      );
    }

    // 18. Cargas Modernas (LOAD_AC, HEATER, LOAD_COOKTOP)
    if (c.code === 'LOAD_AC') {
      return (
        <g>
          <rect x={-w / 2} y={-h / 2} width={w} height={h} rx="4" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.2" />
          <rect x={-w * 0.44} y={h * 0.22} width={w * 0.88} height="5" fill="#E2E8F0" />
          <text x={w * 0.26} y="-2" fill="#38BDF8" fontSize="7" fontWeight="bold">22°C</text>
        </g>
      );
    }

    if (c.code === 'HEATER') {
      return (
        <g>
          <rect x={-w / 2} y={-h / 2} width={w} height={h} rx="4" fill="#1E293B" stroke="#64748B" strokeWidth="1.2" />
          <path d={`M ${-w * 0.3} 0 Q ${-w * 0.15} -12 0 0 Q ${w * 0.15} 12 ${w * 0.3} 0`} fill="none" stroke="#F97316" strokeWidth="2.5" />
        </g>
      );
    }

    // 19. Interruptores e Comutadores (Moldura 4x2 com Tecla Basculante)
    if (['SW', 'SW2', 'SW_DOUBLE', 'THREE_WAY', 'FOUR_WAY'].includes(c.code)) {
      const isPosActive = c.code === 'THREE_WAY'
        ? Number(c.params?.position ?? 0) === 1
        : c.code === 'FOUR_WAY'
        ? Boolean(c.params?.crossed)
        : isClosed;

      return (
        <g>
          <rect x={-w / 2} y={-h / 2} width={w} height={h} rx="6" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="1.2" />
          <rect x={-w * 0.36} y={-h * 0.35} width={w * 0.72} height={h * 0.7} rx="3" fill="#0F172A" />
          
          {c.code === 'SW_DOUBLE' ? (
            <g>
              <rect x={-w * 0.32} y={-h * 0.3} width={w * 0.3} height={h * 0.6} rx="2" fill="#334155" />
              <rect x={w * 0.02} y={-h * 0.3} width={w * 0.3} height={h * 0.6} rx="2" fill="#334155" />
              <circle cx={-w * 0.17} cy={h * 0.15} r="2" fill="#22C55E" />
              <circle cx={w * 0.17} cy={h * 0.15} r="2" fill="#475569" />
            </g>
          ) : (
            <g>
              <rect x={-w * 0.33} y={-h * 0.32} width={w * 0.66} height={h * 0.64} rx="3" fill={isPosActive ? '#1E293B' : '#475569'} />
              <line x1={-w * 0.3} y1="0" x2={w * 0.3} y2="0" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
              <circle cx="0" cy={isPosActive ? h * 0.2 : -h * 0.2} r="2.5" fill={isPosActive ? '#22C55E' : '#64748B'} />
              <text x="0" y="2" fill="#FFFFFF" fontSize="8" fontWeight="bold" textAnchor="middle" dominantBaseline="middle">
                {c.code === 'FOUR_WAY' ? (isPosActive ? '✕' : '═') : c.code === 'THREE_WAY' ? (isPosActive ? 'R2' : 'R1') : (isPosActive ? 'I' : 'O')}
              </text>
            </g>
          )}
        </g>
      );
    }

    // 20. Dimmer Rotativo
    if (c.code === 'DIMMER') {
      const pct = Number(c.params?.percent ?? 100);
      return (
        <g>
          <rect x={-w / 2} y={-h / 2} width={w} height={h} rx="6" fill="#1E293B" stroke="#475569" strokeWidth="1.2" />
          <circle cx="0" cy="-2" r={Math.min(w, h) * 0.34} fill="#0F172A" stroke="#38BDF8" strokeWidth="1.5" />
          <circle cx="0" cy="-2" r={Math.min(w, h) * 0.22} fill="#334155" stroke="#94A3B8" strokeWidth="1" />
          <line x1="0" y1="-2" x2="6" y2="-12" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
          <text x="0" y={h / 2 - 6} fill="#38BDF8" fontSize="7.5" fontWeight="bold" textAnchor="middle">{pct}%</text>
        </g>
      );
    }

    // 21. Chave Seletora Man/Auto
    if (c.code === 'SEL') {
      return (
        <g>
          <rect x={-w / 2} y={-h / 2} width={w} height={h} rx="6" fill="#1E293B" stroke="#475569" strokeWidth="1.2" />
          <circle cx="0" cy="-2" r={Math.min(w, h) * 0.34} fill="#CBD5E1" stroke="#475569" strokeWidth="1" />
          <rect x="-3" y="-14" width="6" height="24" rx="2" fill="#0F172A" />
          <rect x="-1.5" y="-13" width="3" height="6" fill="#FFFFFF" />
          <text x="-14" y="-12" fill="#94A3B8" fontSize="6" fontWeight="bold">M</text>
          <text x="0" y="-16" fill="#94A3B8" fontSize="6" fontWeight="bold">0</text>
          <text x="14" y="-12" fill="#94A3B8" fontSize="6" fontWeight="bold">A</text>
        </g>
      );
    }

    // 22. Botoeira de Emergência (E-STOP)
    if (c.code === 'ESTOP') {
      return (
        <g>
          <rect x={-w / 2} y={-h / 2} width={w} height={h} rx="6" fill="#0F172A" stroke="#334155" strokeWidth="1.2" />
          <circle cx="0" cy="-2" r={Math.min(w, h) * 0.38} fill="#FACC15" stroke="#CA8A04" strokeWidth="1.5" />
          <circle cx="0" cy="-2" r={Math.min(w, h) * 0.26} fill="#DC2626" stroke="#991B1B" strokeWidth="1.5" />
          <text x="0" y="-1" fill="#FFFFFF" fontSize="7" fontWeight="bold" textAnchor="middle" dominantBaseline="middle">STOP</text>
        </g>
      );
    }

    // 23. Botoeiras Pulsadoras (PBNO / PBNC)
    if (c.code === 'PBNO' || c.code === 'PBNC') {
      const isNO = c.code === 'PBNO';
      return (
        <g>
          <rect x={-w / 2} y={-h / 2} width={w} height={h} rx="6" fill="#1E293B" stroke="#334155" strokeWidth="1.2" />
          <circle cx="0" cy="-2" r={Math.min(w, h) * 0.36} fill="#CBD5E1" stroke="#475569" strokeWidth="1" />
          <circle cx="0" cy="-2" r={Math.min(w, h) * 0.26} fill={isNO ? '#16A34A' : '#DC2626'} stroke={isNO ? '#14532D' : '#7F1D1D'} strokeWidth="1.2" />
          <text x="0" y="-1" fill="#FFFFFF" fontSize="8" fontWeight="bold" textAnchor="middle" dominantBaseline="middle">
            {isNO ? 'I' : 'O'}
          </text>
        </g>
      );
    }

    // 24. Disjuntores Modulares DIN e IDRs
    if (d.kind === 'breaker' || d.kind === 'breaker2' || d.kind === 'breaker3' || d.kind === 'rcd' || d.kind === 'rcd4' || d.kind === 'rcbo') {
      return (
        <g>
          <rect x={-w / 2} y={-h / 2} width={w} height={h} rx="5" fill="#0F172A" stroke={isTripped ? '#EF4444' : isClosed ? '#10B981' : '#334155'} strokeWidth="1.5" />
          <rect x="-10" y={-h * 0.32} width="20" height="4" rx="1" fill={isTripped ? '#F59E0B' : isClosed ? '#DC2626' : '#16A34A'} />
          <rect x="-8" y={isClosed ? -h * 0.16 : 2} width="16" height="12" rx="2" fill={isTripped ? '#D97706' : isClosed ? '#B91C1C' : '#334155'} stroke="#64748B" strokeWidth="0.8" />
          <text x="0" y={isClosed ? -h * 0.16 + 6 : 8} fill="#FFFFFF" fontSize="7" fontWeight="bold" textAnchor="middle" dominantBaseline="middle">
            {isTripped ? 'TRIP' : isClosed ? 'I' : 'O'}
          </text>
        </g>
      );
    }

    // 25. Motores Trifásicos
    if (d.kind === 'motor3' || d.kind === 'motor1' || c.code === 'M3PH_6L') {
      return (
        <g>
          <rect x={-w / 2} y={-h / 2} width={w} height={h} rx="6" fill="#0B132B" stroke="#334155" strokeWidth="1.5" />
          <circle cx="0" cy="-4" r="16" fill="#0F172A" stroke="#34D399" strokeWidth="1.5" />
          <text x="0" y="-3" fill="#34D399" fontSize="10" fontWeight="bold" textAnchor="middle" dominantBaseline="middle">
            {c.code === 'M3PH_6L' ? 'M 6P' : d.kind === 'motor3' ? 'M 3~' : 'M 1~'}
          </text>
        </g>
      );
    }

    // 26. Lâmpadas e Sinalizadores
    if (d.kind === 'lamp' || c.code.startsWith('PILOT')) {
      const isPilot = c.code.startsWith('PILOT');
      const pColor = c.code.includes('GREEN') ? '#22C55E' : c.code.includes('RED') ? '#EF4444' : '#EAB308';
      return (
        <g>
          <rect x={-w / 2} y={-h / 2} width={w} height={h} rx="6" fill="#0B132B" stroke="#334155" strokeWidth="1.5" />
          <circle cx="0" cy="-2" r="13" fill="#1E293B" stroke={isPilot ? pColor : '#FACC15'} strokeWidth="1.5" />
          <text x="0" y="-1" fill={isPilot ? pColor : '#FDE047'} fontSize="11" textAnchor="middle" dominantBaseline="middle">
            {isPilot ? '●' : '💡'}
          </text>
        </g>
      );
    }

    // 27. Tomadas
    if (c.code === 'OUTLET' || d.kind === 'outlet') {
      return (
        <g>
          <rect x={-w / 2} y={-h / 2} width={w} height={h} rx="6" fill="#F8FAFC" stroke="#64748B" strokeWidth="1.2" />
          <circle cx="0" cy="0" r={Math.min(w, h) * 0.32} fill="#0F172A" />
          <circle cx="-6" cy="0" r="2" fill="#020617" />
          <circle cx="6" cy="0" r="2" fill="#020617" />
        </g>
      );
    }

    // 28. Fontes de Alimentação
    if (c.code.startsWith('SRC_') || d.kind === 'source') {
      return (
        <g>
          <rect x={-w / 2} y={-h / 2} width={w} height={h} rx="6" fill="#1E293B" stroke="#38BDF8" strokeWidth="1.5" />
          <rect x={-w * 0.38} y="-12" width={w * 0.76} height="24" rx="2" fill="#020617" />
          <text x="0" y="4" fill="#38BDF8" fontSize="10" fontWeight="bold" textAnchor="middle">
            {c.code === 'SRC_AC3' ? '400V 3F' : '230V 1F'}
          </text>
        </g>
      );
    }

    // Fallback estilizado
    return (
      <g>
        <rect x={-w / 2} y={-h / 2} width={w} height={h} rx="6" fill="#0B132B" stroke="#334155" strokeWidth="1.5" />
        <text x="0" y="-2" fill="#93C5FD" fontSize="16" textAnchor="middle" dominantBaseline="middle">
          {d.icon || '⚡'}
        </text>
      </g>
    );
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
        {/* CIRCUITO CUSTOMIZADO (Z-INDEX: FIOS RETOS NO FUNDO)               */}
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

              {/* Fundo do Painel */}
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

              {/* CAMADA 1: CONDUTORES RETOS COM CURVAS NOS CANTOS (PASSAM POR TRÁS) */}
              {(circuit.cadData.wires || []).map((w: any, wireIdx: number) => {
                const posA = getNodeWorldPos(w.a?.c, w.a?.t, circuit.cadData.components, circuit.cadData.busbars || []);
                const posB = getNodeWorldPos(w.b?.c, w.b?.t, circuit.cadData.components, circuit.cadData.busbars || []);
                const fillet = calculateFilletManhattanPath(posA, posB, wireIdx, w.waypoints);
                const pathStr = getFilletSvgPathString(fillet.points, fillet.radius);
                const wireColor = WIRE_COLORS[w.type] || '#f59e0b';
                const wireThickness = getWireGaugeThickness(w.gauge || 2.5, 0.85);

                return (
                  <g key={w.id || wireIdx}>
                    <path
                      d={pathStr}
                      stroke="rgba(0,0,0,0.5)"
                      strokeWidth={wireThickness + 2.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                      transform="translate(1.5, 2.5)"
                    />
                    <path
                      d={pathStr}
                      stroke="#030712"
                      strokeWidth={wireThickness + 1.2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                    <path
                      d={pathStr}
                      stroke={wireColor}
                      strokeWidth={wireThickness}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                    {w.type === 'PE' && (
                      <path
                        d={pathStr}
                        stroke="#eab308"
                        strokeWidth={wireThickness * 0.82}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeDasharray="6 6"
                        fill="none"
                      />
                    )}
                    <path
                      d={pathStr}
                      stroke="rgba(255,255,255,0.4)"
                      strokeWidth={Math.max(0.7, wireThickness * 0.28)}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                  </g>
                );
              })}

              {/* CAMADA 2: TRILHOS DIN E BARRAMENTOS */}
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
                  ? '#0f172a'
                  : bb.type === 'phase_l3'
                  ? '#57534e'
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

              {/* CAMADA 3: DISPOSITIVOS ELÉTRICOS COM DESIGN REALISTA */}
              {(circuit.cadData.components || []).map((c: any) => {
                const d = getComponentDef(c.code);
                const h = c.h || 80;

                return (
                  <g key={c.id} transform={`translate(${c.x}, ${c.y}) rotate(${c.rot || 0})`}>
                    {renderDeviceVisualSvg(c)}

                    <text
                      x="0"
                      y={h / 2 - 7}
                      fill="#E2E8F0"
                      fontSize="8"
                      fontWeight="bold"
                      textAnchor="middle"
                      fontFamily="sans-serif"
                    >
                      {c.label || d.name}
                    </text>
                  </g>
                );
              })}

              {/* CAMADA 4: TERMINAIS ILHÓS TUBULARES (FERRULES) COM PARAFUSO DE APERTO */}
              {(circuit.cadData.wires || []).map((w: any) => {
                const posA = getNodeWorldPos(w.a?.c, w.a?.t, circuit.cadData.components, circuit.cadData.busbars || []);
                const posB = getNodeWorldPos(w.b?.c, w.b?.t, circuit.cadData.components, circuit.cadData.busbars || []);
                const wireGauge = Number(w.gauge || 2.5);

                return (
                  <g key={`ferrules_${w.id}`}>
                    {renderSvgFerrule(posA.x, posA.y, posA.dir, w.type, wireGauge)}
                    {renderSvgFerrule(posB.x, posB.y, posB.dir, w.type, wireGauge)}
                  </g>
                );
              })}

              {/* Nós de Derivação */}
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
            </svg>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800">
              <span className="font-mono">
                {circuit.cadData.components.length} dispositivos • {circuit.cadData.wires?.length || 0} conexões industriais
              </span>
              <span className="text-emerald-400 font-bold">Fiação Realista IEC 60947 / 60364</span>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* PRESET 1: MOTOR DIRECT STARTER                                    */}
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

              <text x="25" y="44" fill="#EF4444" fontSize="10" fontWeight="bold" fontFamily="monospace">L1 (400V)</text>
              <text x="25" y="69" fill="#F59E0B" fontSize="10" fontWeight="bold" fontFamily="monospace">L2 (400V)</text>
              <text x="25" y="94" fill="#3B82F6" fontSize="10" fontWeight="bold" fontFamily="monospace">L3 (400V)</text>

              <path d="M 95 40 L 160 40" stroke="#EF4444" strokeWidth="3" strokeLinecap="round" fill="none" />
              <path d="M 95 65 L 160 65" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" fill="none" />
              <path d="M 95 90 L 160 90" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" fill="none" />

              <path d="M 240 40 L 290 40" stroke={motorTargetOn ? '#EF4444' : '#64748B'} strokeWidth="3" strokeLinecap="round" fill="none" />
              <path d="M 240 65 L 290 65" stroke={motorTargetOn ? '#F59E0B' : '#64748B'} strokeWidth="3" strokeLinecap="round" fill="none" />
              <path d="M 240 90 L 290 90" stroke={motorTargetOn ? '#3B82F6' : '#64748B'} strokeWidth="3" strokeLinecap="round" fill="none" />

              <path d="M 375 40 L 425 40" stroke={motorTargetOn ? '#EF4444' : '#64748B'} strokeWidth="3" strokeLinecap="round" fill="none" />
              <path d="M 375 65 L 425 65" stroke={motorTargetOn ? '#F59E0B' : '#64748B'} strokeWidth="3" strokeLinecap="round" fill="none" />
              <path d="M 375 90 L 425 90" stroke={motorTargetOn ? '#3B82F6' : '#64748B'} strokeWidth="3" strokeLinecap="round" fill="none" />

              <path d="M 510 40 L 530 40 Q 540 40 540 46 L 540 50 Q 540 56 550 56 L 570 56" stroke={motorTargetOn ? '#EF4444' : '#64748B'} strokeWidth="3" strokeLinecap="round" fill="none" />
              <path d="M 510 65 L 570 65" stroke={motorTargetOn ? '#F59E0B' : '#64748B'} strokeWidth="3" strokeLinecap="round" fill="none" />
              <path d="M 510 90 L 530 90 Q 540 90 540 84 L 540 78 Q 540 74 550 74 L 570 74" stroke={motorTargetOn ? '#3B82F6' : '#64748B'} strokeWidth="3" strokeLinecap="round" fill="none" />

              {/* Q1: Disjuntor-Motor */}
              <g transform="translate(160, 20)">
                <rect x="0" y="0" width="80" height="95" rx="6" fill="#0B132B" stroke="#3B82F6" strokeWidth="1.5" />
                <rect x="22" y="10" width="36" height="5" rx="1.5" fill={motorTargetOn ? '#DC2626' : '#16A34A'} />
                <rect x="26" y="24" width="28" height="18" rx="3" fill={motorTargetOn ? '#991B1B' : '#334155'} />
                <text x="40" y="36" fill="#FFFFFF" fontSize="9" fontWeight="bold" textAnchor="middle">{motorTargetOn ? 'I' : 'O'}</text>
                <text x="40" y="60" fill="#93C5FD" fontSize="9.5" fontWeight="bold" textAnchor="middle">Q1: MCB</text>
                <text x="40" y="74" fill="#64748B" fontSize="8" textAnchor="middle">3P • 25A</text>
              </g>

              {/* KM1: Contator Principal */}
              <g transform="translate(290, 20)">
                <rect x="0" y="0" width="85" height="95" rx="6" fill="#0B132B" stroke="#10B981" strokeWidth="1.5" />
                <rect x="18" y="12" width="49" height="24" rx="3" fill={motorTargetOn ? '#065F46' : '#1E293B'} stroke={motorTargetOn ? '#10B981' : '#475569'} />
                <text x="42.5" y="27" fill={motorTargetOn ? '#34D399' : '#94A3B8'} fontSize="8.5" fontWeight="bold" textAnchor="middle">
                  {motorTargetOn ? '▲ RETIDO' : '▼ ABERTO'}
                </text>
                <text x="42.5" y="56" fill="#6EE7B7" fontSize="10" fontWeight="bold" textAnchor="middle">KM1 (KM)</text>
                <text x="42.5" y="70" fill="#64748B" fontSize="8.5" textAnchor="middle">AC-3 • 25A</text>
              </g>

              {/* F1: Relé Térmico */}
              <g transform="translate(425, 20)">
                <rect x="0" y="0" width="85" height="95" rx="6" fill="#0B132B" stroke="#F59E0B" strokeWidth="1.5" />
                <circle cx="42.5" cy="24" r="11" fill="#1E293B" stroke="#F59E0B" strokeWidth="1.5" />
                <text x="42.5" y="28" fill="#FCD34D" fontSize="9" fontWeight="bold" textAnchor="middle">OK</text>
                <text x="42.5" y="56" fill="#FCD34D" fontSize="10" fontWeight="bold" textAnchor="middle">F1: OLR</text>
                <text x="42.5" y="70" fill="#64748B" fontSize="8.5" textAnchor="middle">9-13A • Cl.10</text>
              </g>

              {/* M1: Motor Trifásico */}
              <g transform="translate(570, 15)">
                <rect x="0" y="0" width="150" height="105" rx="10" fill="#0B132B" stroke={isMotorRunning ? '#10B981' : '#3B82F6'} strokeWidth={isMotorRunning ? 2.5 : 1.5} />
                <text x="16" y="26" fill="#FFFFFF" fontSize="11" fontWeight="bold">M1: Motor 3~</text>
                <text x="16" y="44" fill="#94A3B8" fontSize="9">7.5 kW • 400V • 50 Hz</text>

                <circle cx="105" cy="65" r="24" fill={isMotorRunning ? 'url(#motorPulseGrad)' : '#1E293B'} stroke={isMotorRunning ? '#34D399' : '#475569'} strokeWidth="2" />
                <text x="105" y="69" fill={isMotorRunning ? '#FFFFFF' : '#64748B'} fontSize="9" fontWeight="bold" textAnchor="middle">
                  {Math.round(currentRpm)} RPM
                </text>
              </g>

              {/* Terminais Ferrules */}
              {renderSvgFerrule(160, 40, 'left', 'L1', 4.0)}
              {renderSvgFerrule(160, 65, 'left', 'L2', 4.0)}
              {renderSvgFerrule(160, 90, 'left', 'L3', 4.0)}
              {renderSvgFerrule(240, 40, 'right', 'L1', 4.0)}
              {renderSvgFerrule(240, 65, 'right', 'L2', 4.0)}
              {renderSvgFerrule(240, 90, 'right', 'L3', 4.0)}
              {renderSvgFerrule(290, 40, 'left', 'L1', 4.0)}
              {renderSvgFerrule(290, 65, 'left', 'L2', 4.0)}
              {renderSvgFerrule(290, 90, 'left', 'L3', 4.0)}
              {renderSvgFerrule(375, 40, 'right', 'L1', 4.0)}
              {renderSvgFerrule(375, 65, 'right', 'L2', 4.0)}
              {renderSvgFerrule(375, 90, 'right', 'L3', 4.0)}
              {renderSvgFerrule(425, 40, 'left', 'L1', 4.0)}
              {renderSvgFerrule(425, 65, 'left', 'L2', 4.0)}
              {renderSvgFerrule(425, 90, 'left', 'L3', 4.0)}
              {renderSvgFerrule(510, 40, 'right', 'L1', 4.0)}
              {renderSvgFerrule(510, 65, 'right', 'L2', 4.0)}
              {renderSvgFerrule(510, 90, 'right', 'L3', 4.0)}
              {renderSvgFerrule(570, 56, 'left', 'L1', 4.0)}
              {renderSvgFerrule(570, 65, 'left', 'L2', 4.0)}
              {renderSvgFerrule(570, 74, 'left', 'L3', 4.0)}

              {/* Comando */}
              <g transform="translate(40, 145)">
                <rect x="0" y="0" width="680" height="70" rx="8" fill="#050A14" stroke="#1E293B" strokeWidth="1" />
                <text x="20" y="24" fill="#FCD34D" fontSize="10" fontWeight="bold">Circuito de Comando 230V AC</text>

                <path d="M 180 35 L 220 35" stroke="#F59E0B" strokeWidth="2" fill="none" />
                <path d="M 300 35 L 330 35" stroke="#F59E0B" strokeWidth="2" fill="none" />
                <path d="M 410 35 L 440 35" stroke="#F59E0B" strokeWidth="2" fill="none" />
                <path d="M 540 35 L 594 35" stroke="#F59E0B" strokeWidth="2" fill="none" />

                <rect x="220" y="15" width="80" height="40" rx="4" fill="#1E293B" stroke="#EF4444" />
                <circle cx="236" cy="35" r="9" fill="#DC2626" stroke="#991B1B" />
                <text x="250" y="32" fill="#FCA5A5" fontSize="8.5" fontWeight="bold">S0 (Parar)</text>
                <text x="250" y="44" fill="#94A3B8" fontSize="7.5">NF (1-2)</text>

                <rect x="330" y="15" width="80" height="40" rx="4" fill="#1E293B" stroke="#10B981" />
                <circle cx="346" cy="35" r="9" fill="#16A34A" stroke="#14532D" />
                <text x="360" y="32" fill="#86EFAC" fontSize="8.5" fontWeight="bold">S1 (Ligar)</text>
                <text x="360" y="44" fill="#94A3B8" fontSize="7.5">NA (3-4)</text>

                <rect x="440" y="15" width="100" height="40" rx="4" fill="#1E293B" stroke="#3B82F6" />
                <text x="455" y="32" fill="#93C5FD" fontSize="9" fontWeight="bold">Selo KM1</text>
                <text x="455" y="46" fill={motorTargetOn ? '#34D399' : '#64748B'} fontSize="8">
                  {motorTargetOn ? 'RETIDO (13-14)' : 'ABERTO'}
                </text>

                <circle cx="610" cy="35" r="16" fill={motorTargetOn ? '#065F46' : '#1E293B'} stroke="#10B981" strokeWidth="2" />
                <text x="610" y="39" fill="#FFFFFF" fontSize="9" fontWeight="bold" textAnchor="middle">A1-A2</text>

                {renderSvgFerrule(220, 35, 'left', 'CTRL', 1.5)}
                {renderSvgFerrule(300, 35, 'right', 'CTRL', 1.5)}
                {renderSvgFerrule(330, 35, 'left', 'CTRL', 1.5)}
                {renderSvgFerrule(410, 35, 'right', 'CTRL', 1.5)}
                {renderSvgFerrule(440, 35, 'left', 'CTRL', 1.5)}
                {renderSvgFerrule(540, 35, 'right', 'CTRL', 1.5)}
                {renderSvgFerrule(594, 35, 'left', 'CTRL', 1.5)}
              </g>
            </svg>

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
                <span>{isMotorRunning ? `Motor em Regime (${Math.round(currentRpm)} RPM)` : currentRpm > 0 ? `Desacelerando (${Math.round(currentRpm)} RPM)` : 'Carga em Repouso'}</span>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* PRESET 2: FOUR-WAY LIGHTING                                       */}
        {/* ================================================================= */}
        {!hasCustomCadData && circuitType === 'four_way' && (
          <div className="space-y-3">
            <svg viewBox="0 0 760 210" className="w-full h-auto min-h-[150px] max-h-[220px]">
              <rect width="760" height="210" fill="#070D1A" rx="10" />

              <text x="25" y="45" fill="#EF4444" fontSize="11" fontWeight="bold" fontFamily="monospace">Fase L1 (230V)</text>
              <text x="25" y="175" fill="#3B82F6" fontSize="11" fontWeight="bold" fontFamily="monospace">Neutro N</text>

              <path d="M 125 40 L 160 40" stroke="#EF4444" strokeWidth="2.5" fill="none" />
              <path d="M 125 170 L 680 170" stroke="#3B82F6" strokeWidth="2.5" fill="none" />

              <path d="M 270 40 L 330 40" stroke={swA ? '#64748B' : '#F59E0B'} strokeWidth="2" strokeDasharray="4,4" fill="none" />
              <path d="M 270 75 L 330 75" stroke={swA ? '#F59E0B' : '#64748B'} strokeWidth="2" strokeDasharray="4,4" fill="none" />

              <path d="M 450 40 L 510 40" stroke={swB ? '#F59E0B' : '#64748B'} strokeWidth="2" strokeDasharray="4,4" fill="none" />
              <path d="M 450 75 L 510 75" stroke={swB ? '#64748B' : '#F59E0B'} strokeWidth="2" strokeDasharray="4,4" fill="none" />

              <path d="M 620 58 L 668 58 Q 680 58 680 70 L 680 90" stroke={isFourWayLampOn ? '#F59E0B' : '#64748B'} strokeWidth="2.5" fill="none" />
              <path d="M 680 144 L 680 170" stroke="#3B82F6" strokeWidth="2.5" fill="none" />

              {/* S1: Three-Way Realista */}
              <g transform="translate(160, 20)">
                <rect x="0" y="0" width="110" height="85" rx="6" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="1.2" />
                <rect x="25" y="10" width="60" height="65" rx="3" fill="#0F172A" />
                <rect x="28" y="13" width="54" height="59" rx="2" fill={swA ? '#1E293B' : '#475569'} />
                <circle cx="55" cy={swA ? 58 : 26} r="2.5" fill={swA ? '#22C55E' : '#94A3B8'} />
                <text x="55" y="44" fill="#FFFFFF" fontSize="8.5" fontWeight="bold" textAnchor="middle">{swA ? '▼ R2' : '▲ R1'}</text>
              </g>

              {/* S2: Four-Way Realista */}
              <g transform="translate(330, 20)">
                <rect x="0" y="0" width="120" height="85" rx="6" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="1.2" />
                <rect x="30" y="10" width="60" height="65" rx="3" fill="#0F172A" />
                <rect x="33" y="13" width="54" height="59" rx="2" fill={swB ? '#1E293B' : '#475569'} />
                <text x="60" y="43" fill={swB ? '#38BDF8' : '#FCD34D'} fontSize="12" fontWeight="bold" textAnchor="middle">{swB ? '✕' : '═'}</text>
                <text x="60" y="60" fill="#94A3B8" fontSize="6.5" fontWeight="bold" textAnchor="middle">{swB ? 'CRUZADO' : 'DIRETO'}</text>
              </g>

              {/* S3: Three-Way Realista */}
              <g transform="translate(510, 20)">
                <rect x="0" y="0" width="110" height="85" rx="6" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="1.2" />
                <rect x="25" y="10" width="60" height="65" rx="3" fill="#0F172A" />
                <rect x="28" y="13" width="54" height="59" rx="2" fill={swC ? '#1E293B' : '#475569'} />
                <circle cx="55" cy={swC ? 58 : 26} r="2.5" fill={swC ? '#22C55E' : '#94A3B8'} />
                <text x="55" y="44" fill="#FFFFFF" fontSize="8.5" fontWeight="bold" textAnchor="middle">{swC ? '▼ R2' : '▲ R1'}</text>
              </g>

              {/* Lâmpada */}
              <g transform="translate(650, 90)">
                <circle cx="30" cy="30" r="24" fill={isFourWayLampOn ? '#FEF08A' : '#1E293B'} stroke={isFourWayLampOn ? '#FACC15' : '#475569'} strokeWidth="2" />
                <text x="30" y="35" fill={isFourWayLampOn ? '#854D0E' : '#94A3B8'} fontSize="11" fontWeight="bold" textAnchor="middle">
                  {isFourWayLampOn ? '💡 100W' : 'OFF'}
                </text>
              </g>

              {renderSvgFerrule(160, 40, 'left', 'L1', 2.5)}
              {renderSvgFerrule(270, 40, 'right', 'CTRL', 2.5)}
              {renderSvgFerrule(270, 75, 'right', 'CTRL', 2.5)}
              {renderSvgFerrule(330, 40, 'left', 'CTRL', 2.5)}
              {renderSvgFerrule(330, 75, 'left', 'CTRL', 2.5)}
              {renderSvgFerrule(450, 40, 'right', 'CTRL', 2.5)}
              {renderSvgFerrule(450, 75, 'right', 'CTRL', 2.5)}
              {renderSvgFerrule(510, 40, 'left', 'CTRL', 2.5)}
              {renderSvgFerrule(510, 75, 'left', 'CTRL', 2.5)}
              {renderSvgFerrule(620, 58, 'right', 'CTRL', 2.5)}
              {renderSvgFerrule(680, 90, 'top', 'CTRL', 2.5)}
              {renderSvgFerrule(680, 144, 'bottom', 'N', 2.5)}
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
        {/* PRESET 3: SISTEMA SOLAR FOTOVOLTAICO INTERATIVO                   */}
        {/* ================================================================= */}
        {!hasCustomCadData && circuitType === 'solar' && (
          <div className="space-y-3">
            <svg viewBox="0 0 760 210" className="w-full h-auto min-h-[160px] max-h-[220px]">
              <rect width="760" height="210" fill="#070D1A" rx="10" />

              {/* Fios DC e AC */}
              <path d="M 140 60 L 210 60" stroke="#DC2626" strokeWidth="3" fill="none" />
              <path d="M 140 140 L 320 140 Q 340 140 340 110 L 340 90" stroke="#DC2626" strokeWidth="3" fill="none" />
              <path d="M 430 65 L 490 65" stroke="#991B1B" strokeWidth="2.5" fill="none" />
              <path d="M 430 85 L 490 85" stroke="#0284C7" strokeWidth="2.5" fill="none" />
              <path d="M 570 65 L 630 65" stroke="#991B1B" strokeWidth="2.5" fill="none" />
              <path d="M 570 85 L 630 85" stroke="#0284C7" strokeWidth="2.5" fill="none" />

              {/* PV Panel 550Wp */}
              <g transform="translate(30, 20)">
                <rect x="0" y="0" width="110" height="90" rx="4" fill="#0B1D33" stroke="#64748B" strokeWidth="1.2" />
                <rect x="0" y="44" width="110" height="2" fill="#F8FAFC" />
                {[-35, -18, 0, 18, 35].map((bx, idx) => (
                  <line key={`s_pv_${idx}`} x1={55 + bx} y1="0" x2={55 + bx} y2="90" stroke="#FFFFFF" strokeWidth="0.8" opacity="0.5" />
                ))}
                <text x="55" y="40" fill={isDaylight ? '#FDE047' : '#94A3B8'} fontSize="8" fontWeight="bold" textAnchor="middle">
                  {isDaylight ? '550Wp (1000 W/m²)' : '0 W (NOITE)'}
                </text>
              </g>

              {/* Bateria LiFePO4 48V */}
              <g transform="translate(30, 120)">
                <rect x="0" y="0" width="110" height="70" rx="4" fill="#0F172A" stroke="#334155" strokeWidth="1.2" />
                <rect x="6" y="0" width="4" height="70" fill="#1E293B" />
                <rect x="100" y="0" width="4" height="70" fill="#1E293B" />
                <rect x="20" y="15" width="50" height="25" rx="2" fill="#020617" />
                <text x="45" y="32" fill="#38BDF8" fontSize="8.5" fontWeight="bold" textAnchor="middle">90% SOC</text>
                <text x="55" y="58" fill="#22C55E" fontSize="7" fontWeight="bold" textAnchor="middle">LiFePO4 5.12kWh</text>
              </g>

              {/* Inversor Solar */}
              <g transform="translate(210, 25)">
                <rect x="0" y="0" width="120" height="95" rx="6" fill="#F8FAFC" stroke="#10B981" strokeWidth="1.5" />
                <rect x="10" y="15" width="100" height="42" rx="3" fill="#020617" />
                <text x="60" y="34" fill="#34D399" fontSize="8" fontWeight="bold" textAnchor="middle">
                  {isDaylight ? '5.0 kW GERANDO' : 'BAT ➔ 230V EPS'}
                </text>
                <text x="60" y="48" fill="#38BDF8" fontSize="6.5" fontWeight="bold" textAnchor="middle">
                  INVERSOR HÍBRIDO
                </text>
                <circle cx="60" cy="74" r="5" fill="#10B981" />
              </g>

              {/* Smart Meter */}
              <g transform="translate(490, 30)">
                <rect x="0" y="0" width="80" height="85" rx="4" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="1.2" />
                <rect x="10" y="15" width="60" height="30" rx="2" fill="#0284C7" />
                <text x="40" y="34" fill="#FFFFFF" fontSize="8" fontWeight="bold" textAnchor="middle">42.5 kWh</text>
                <text x="40" y="65" fill="#0F172A" fontSize="6.5" fontWeight="bold" textAnchor="middle">SMART METER</text>
              </g>

              {/* Cargas AC */}
              <g transform="translate(630, 30)">
                <rect x="0" y="0" width="100" height="85" rx="6" fill="#0B132B" stroke="#334155" strokeWidth="1.5" />
                <circle cx="50" cy="35" r="16" fill="#FEF08A" stroke="#FACC15" strokeWidth="2" />
                <text x="50" y="40" fill="#854D0E" fontSize="9" fontWeight="bold" textAnchor="middle">💡 230V</text>
                <text x="50" y="70" fill="#34D399" fontSize="7" fontWeight="bold" textAnchor="middle">ALIMENTADO</text>
              </g>

              {renderSvgFerrule(140, 60, 'right', '24+', 4.0)}
              {renderSvgFerrule(210, 60, 'left', '24+', 4.0)}
              {renderSvgFerrule(430, 65, 'right', 'L1', 2.5)}
              {renderSvgFerrule(490, 65, 'left', 'L1', 2.5)}
              {renderSvgFerrule(570, 65, 'right', 'L1', 2.5)}
              {renderSvgFerrule(630, 65, 'left', 'L1', 2.5)}
            </svg>

            <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/80 text-xs">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDaylight(!isDaylight);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  isDaylight
                    ? 'bg-amber-950 text-amber-300 border border-amber-800 hover:bg-amber-900'
                    : 'bg-indigo-950 text-indigo-300 border border-indigo-800 hover:bg-indigo-900'
                }`}
              >
                <Sun className={`w-3.5 h-3.5 ${isDaylight ? 'animate-spin' : ''}`} />
                <span>{isDaylight ? '☀️ Radiação 1000 W/m² (Dia)' : '🌙 Sem Sol 0 W/m² (Noite / Bateria)'}</span>
              </button>

              <div className="px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isDaylight ? 'FV Ativo • Carregando Bateria' : 'Bateria LiFePO4 Suprindo Inversor'}</span>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* PRESET 4: QUADRO QGD / IDR                                        */}
        {/* ================================================================= */}
        {!hasCustomCadData && circuitType !== 'direct_motor' && circuitType !== 'four_way' && circuitType !== 'solar' && (
          <div className="space-y-3">
            <svg viewBox="0 0 760 190" className="w-full h-auto min-h-[140px] max-h-[200px]">
              <rect width="760" height="190" fill="#070D1A" rx="10" />

              <path d="M 170 90 L 230 90" stroke="#EF4444" strokeWidth="3.2" fill="none" />
              <path d="M 380 90 L 440 90" stroke={drTripped ? '#64748B' : '#EF4444'} strokeWidth="3.2" fill="none" />
              
              {/* Geral: MCB */}
              <g transform="translate(30, 20)">
                <rect x="0" y="0" width="140" height="140" rx="8" fill="#0B132B" stroke="#3B82F6" strokeWidth="1.5" />
                <rect x="50" y="18" width="40" height="6" rx="2" fill="#DC2626" />
                <rect x="55" y="32" width="30" height="20" rx="3" fill="#B91C1C" />
                <text x="70" y="45" fill="#FFFFFF" fontSize="9" fontWeight="bold" textAnchor="middle">I-ON</text>
                <text x="16" y="78" fill="#93C5FD" fontSize="11" fontWeight="bold">Geral: MCB 63A</text>
                <text x="16" y="96" fill="#64748B" fontSize="9">Curva C • Icu 10kA</text>
                <text x="70" y="122" fill="#10B981" fontSize="10" fontWeight="bold" textAnchor="middle">ARMADO</text>
              </g>

              {/* IDR / DR 30mA */}
              <g transform="translate(230, 20)">
                <rect x="0" y="0" width="150" height="140" rx="8" fill="#0B132B" stroke="#10B981" strokeWidth="1.5" />
                <rect x="50" y="18" width="50" height="6" rx="2" fill={drTripped ? '#F59E0B' : '#DC2626'} />
                <rect x="55" y="32" width="40" height="20" rx="3" fill={drTripped ? '#78350F' : '#B91C1C'} />
                <text x="75" y="45" fill="#FFFFFF" fontSize="9" fontWeight="bold" textAnchor="middle">{drTripped ? 'TRIP' : 'I-ON'}</text>
                <circle cx="120" cy="42" r="6" fill="#0284C7" stroke="#BAE6FD" />
                <text x="120" y="45" fill="#FFFFFF" fontSize="7" fontWeight="bold" textAnchor="middle">T</text>
                <text x="16" y="78" fill="#6EE7B7" fontSize="11" fontWeight="bold">IDR / DR 30mA</text>
                <text x="16" y="96" fill="#64748B" fontSize="9">Tipo A • I_Δn = 0.03A</text>
                <text x="75" y="122" fill={drTripped ? '#FCA5A5' : '#86EFAC'} fontSize="9.5" fontWeight="bold" textAnchor="middle">
                  {drTripped ? 'DISPARADO (FALTA)' : 'OPERANDO'}
                </text>
              </g>

              {/* Circuitos Terminais */}
              <g transform="translate(440, 20)">
                <rect x="0" y="0" width="280" height="140" rx="8" fill="#0B132B" stroke="#F59E0B" strokeWidth="1.5" />
                <text x="16" y="28" fill="#FCD34D" fontSize="11" fontWeight="bold">Circuitos Terminais Protegidos</text>
                <text x="16" y="55" fill="#94A3B8" fontSize="9">C1: Iluminação 10A • Cabo 1.5 mm²</text>
                <text x="16" y="80" fill="#94A3B8" fontSize="9">C2: Tomadas TUG 16A • Cabo 2.5 mm²</text>
                <text x="16" y="105" fill="#94A3B8" fontSize="9">C3: Ar Condicionado 20A • Cabo 4.0 mm²</text>
                <text x="16" y="130" fill="#10B981" fontSize="9" fontWeight="bold">Status: Equilibrado • 50 Hz</text>
              </g>

              {renderSvgFerrule(170, 90, 'right', 'L1', 6.0)}
              {renderSvgFerrule(230, 90, 'left', 'L1', 6.0)}
              {renderSvgFerrule(380, 90, 'right', 'L1', 6.0)}
              {renderSvgFerrule(440, 90, 'left', 'L1', 6.0)}
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

        {!hideTestButton && onTestCircuit && (
          <button
            type="button"
            onClick={onTestCircuit}
            className="px-5 py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white font-black rounded-xl text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-blue-900/40 active:scale-95 cursor-pointer border border-blue-400/40 shrink-0"
          >
            <Zap className="w-4 h-4 fill-amber-300 text-amber-300 animate-bounce" />
            <span>⚡ Testar Circuito</span>
            <Maximize2 className="w-3.5 h-3.5 text-blue-200 ml-1" />
          </button>
        )}
      </div>
    </div>
  );
};