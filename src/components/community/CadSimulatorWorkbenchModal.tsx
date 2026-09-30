// ============================================================================
// TÉCNICAMZ PRO — MOTOR WORKBENCH CAD SIMULATOR (V25)
// Simulação Física MNA, Telemetria True-RMS, Animação Contínua & Fiação IEC/DIN
// Suporte a Rotação de Tela Mobile (Horizontal/Landscape) e Telemetria em Tempo Real
// ============================================================================

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CadCircuitProject } from '../../types';
import { soundFX } from '../../utils/audio';
import {
  COMPONENT_CATALOG,
  COMPONENT_MAP,
  CATEGORIES,
  WIRE_COLORS,
  GAUGE_AMPACITY,
  getComponentDef,
  solveCircuitPhysicsStep,
  generateDirectMotorStarterCircuit,
  generateFourWayLightingCircuit,
  generateQgdProtectionCircuit,
  generateSolarPVIsoCircuit,
  ComponentDef,
  OUTLET_APPLIANCES,
  OutletApplianceType,
  APPLIANCE_PRESETS
} from './cadEngine';
import {
  Busbar,
  BusbarTerminal,
  PanelEnclosureConfig,
  PANEL_PRESETS,
  generateBusbarTerminals,
  findNearestBusbarTerminal,
  drawPanelEnclosure,
  drawBusbars,
  snapComponentToBusbars,
  DEFAULT_MOTOR_BUSBARS,
  DEFAULT_QGD_BUSBARS,
  DEFAULT_FOURWAY_BUSBARS
} from './cadBusbars';
import {
  getTerminalWorldPos,
  getNodeWorldPos,
  calculateFilletManhattanPath,
  getFilletSvgPathString,
  getWireGaugeThickness,
  renderCurvedWireBack,
  renderFerruleTerminal,
  autoOrganizeCircuitWiring,
  WIRE_NORM_COLORS,
  AVAILABLE_GAUGES,
  findJunctionDots,
  TerminalPosition
} from './cadRouting';
import { generateMuralSnapshot } from './cadSnapshot';
import { renderDevice, REAL_BRANDS, DeviceBrand } from './cadDeviceRenderer';
import {
  Zap,
  Play,
  Square,
  Plus,
  Trash2,
  Copy,
  RotateCw,
  Maximize2,
  X,
  Download,
  Upload,
  Image as ImageIcon,
  Activity,
  Sliders,
  Send,
  AlertTriangle,
  Search,
  Layers,
  Cpu,
  FileText,
  Radio,
  Volume2,
  VolumeX,
  Gauge,
  Tag,
  Sun,
  BatteryCharging,
  Flame,
  Power,
  RotateCcw,
  ZapOff,
  Shield,
  Thermometer
} from 'lucide-react';
import { CadVoiceDiagnosticPanel } from './CadVoiceDiagnosticPanel';
import { simulatorDiagnostics, DiagnosticEngineState } from '../../services/simulatorVoiceDiagnostics';
import { voiceOrchestrator } from '../../services/voiceOrchestrator';
import { generateCadProjectPDF } from '../../utils/saraPdfGenerator';

interface CadSimulatorWorkbenchModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCircuit?: CadCircuitProject | null;
  onPublishCircuit: (
    circuitData: CadCircuitProject,
    publishDetails: {
      title: string;
      description: string;
      category: string;
      allowTesting: boolean;
      tags: string[];
    }
  ) => Promise<void>;
  currentUser: any;
  temSeloMZ?: boolean;
}

let globalIsDragging = false;
export const getIsCadDragging = () => globalIsDragging;
export const setIsCadDragging = (dragging: boolean) => {
  globalIsDragging = dragging;
  if (typeof window !== 'undefined') {
    (window as any).__cadIsDragging = dragging;
  }
};

export const CadSimulatorWorkbenchModal: React.FC<CadSimulatorWorkbenchModalProps> = ({
  isOpen,
  onClose,
  initialCircuit,
  onPublishCircuit,
  currentUser,
  temSeloMZ = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const svgGroupRef = useRef<SVGGElement | null>(null);
  const scopeCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const ghostRef = useRef<HTMLDivElement | null>(null);
  const ghostTextRef = useRef<HTMLSpanElement | null>(null);

  const isDraggingRef = useRef<boolean>(false);
  const hasPendingDragChangesRef = useRef<boolean>(false);
  const [simVersion, setSimVersion] = useState<number>(0);
  const lastLiveSummaryRef = useRef<string>('');

  const [project, setProject] = useState<{
    version: number;
    name: string;
    components: any[];
    wires: any[];
    busbars: Busbar[];
    panelConfig?: PanelEnclosureConfig;
    updated?: number;
  }>({
    version: 14,
    name: initialCircuit?.title || 'Projeto TécnicaMz Pro',
    components: [],
    wires: [],
    busbars: [],
    panelConfig: PANEL_PRESETS.large,
    updated: Date.now()
  });

  const [activeTool, setActiveTool] = useState<'select' | 'wire' | 'pan'>('select');
  const [selectedWireType, setSelectedWireType] = useState<string>('L1');
  const [selectedCompId, setSelectedCompId] = useState<string | null>(null);
  const [selectedWireId, setSelectedWireId] = useState<string | null>(null);
  const [selectedBusbarId, setSelectedBusbarId] = useState<string | null>(null);
  const [hoveredTerminalId, setHoveredTerminalId] = useState<string | null>(null);
  const [isPanelConfigOpen, setIsPanelConfigOpen] = useState<boolean>(false);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isThermalMode, setIsThermalMode] = useState<boolean>(false);

  // ESTADO DE ROTAÇÃO HORIZONTAL (MOBILE / TABLET)
  const [isLandscape, setIsLandscape] = useState<boolean>(false);

  const [showLibrary, setShowLibrary] = useState<boolean>(true);
  const [showProps, setShowProps] = useState<boolean>(false);
  const [showMeters, setShowMeters] = useState<boolean>(true);
  const [showScope, setShowScope] = useState<boolean>(false);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [faultAlert, setFaultAlert] = useState<string | null>(null);

  const [meterV, setMeterV] = useState<number>(0);
  const [meterA, setMeterA] = useState<number>(0);
  const [meterW, setMeterW] = useState<number>(0);
  const [meterHz, setMeterHz] = useState<number>(50);
  const [meterPF, setMeterPF] = useState<number>(1.0);

  const [scopeChannel, setScopeChannel] = useState<'CH1' | 'CH2' | 'DUAL'>('DUAL');
  const [scopeVoltsDiv, setScopeVoltsDiv] = useState<number>(100);

  const [isPublishDialogOpen, setIsPublishDialogOpen] = useState<boolean>(false);
  const [publishTitle, setPublishTitle] = useState<string>('');
  const [publishCategory, setPublishCategory] = useState<string>('Comandos Elétricos');
  const [publishDescription, setPublishDescription] = useState<string>('');
  const [allowTesting, setAllowTesting] = useState<boolean>(true);
  const [publishTags, setPublishTags] = useState<string[]>(['Simulação CAD', 'IEC 60947', 'Bancada MZ']);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);

  const undoStackRef = useRef<any[]>([]);
  const redoStackRef = useRef<any[]>([]);

  const cameraRef = useRef<{ zoom: number; pan: { x: number; y: number }; grid: number }>({
    zoom: 1,
    pan: { x: 0, y: 0 },
    grid: 20
  });

  const simRef = useRef<{
    time: number;
    lastTick: number;
    trippedSet: Set<string>;
    events: { time: string; text: string; type: string }[];
    scopeHistory: { t: number; v: number; i: number }[];
    wireStart: { c: string; t: string } | null;
    drag: any;
    touchMap: Map<number, { x: number; y: number; clientX: number; clientY: number }>;
    pinch: { initialDist: number; initialMid: { x: number; y: number }; startZoom: number; startPan: { x: number; y: number } } | null;
    longPressTimer: any;
    isLongPressTriggered: boolean;
    lastContactorState: boolean;
    motorRpm: number;
    firedAlertsSet: Set<string>;
    pointerWorld: { x: number; y: number } | null;
    energizedBusbars: Set<string>;
    lastPhysResult: any;
  }>({
    time: 0,
    lastTick: performance.now(),
    trippedSet: new Set(),
    events: [],
    scopeHistory: [],
    wireStart: null,
    drag: null,
    touchMap: new Map(),
    pinch: null,
    longPressTimer: null,
    isLongPressTriggered: false,
    lastContactorState: false,
    motorRpm: 0,
    firedAlertsSet: new Set(),
    pointerWorld: null,
    energizedBusbars: new Set(),
    lastPhysResult: null
  });

  const projectRef = useRef(project);
  useEffect(() => {
    projectRef.current = project;
  }, [project]);

  const isRunningRef = useRef(isRunning);
  useEffect(() => {
    isRunningRef.current = isRunning;
  }, [isRunning]);

  const isThermalModeRef = useRef(isThermalMode);
  useEffect(() => {
    isThermalModeRef.current = isThermalMode;
  }, [isThermalMode]);

  const selectedCompIdRef = useRef(selectedCompId);
  useEffect(() => {
    selectedCompIdRef.current = selectedCompId;
  }, [selectedCompId]);

  const selectedWireIdRef = useRef(selectedWireId);
  useEffect(() => {
    selectedWireIdRef.current = selectedWireId;
  }, [selectedWireId]);

  const selectedWireTypeRef = useRef(selectedWireType);
  useEffect(() => {
    selectedWireTypeRef.current = selectedWireType;
  }, [selectedWireType]);

  const selectedBusbarIdRef = useRef(selectedBusbarId);
  useEffect(() => {
    selectedBusbarIdRef.current = selectedBusbarId;
  }, [selectedBusbarId]);

  const hoveredTerminalIdRef = useRef(hoveredTerminalId);
  useEffect(() => {
    hoveredTerminalIdRef.current = hoveredTerminalId;
  }, [hoveredTerminalId]);

  const showScopeRef = useRef(showScope);
  useEffect(() => {
    showScopeRef.current = showScope;
  }, [showScope]);

  const scopeChannelRef = useRef(scopeChannel);
  useEffect(() => {
    scopeChannelRef.current = scopeChannel;
  }, [scopeChannel]);

  const scopeVoltsDivRef = useRef(scopeVoltsDiv);
  useEffect(() => {
    scopeVoltsDivRef.current = scopeVoltsDiv;
  }, [scopeVoltsDiv]);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  }, []);

  const addEvent = useCallback((text: string, type: 'info' | 'warn' | 'trip' = 'info') => {
    const timeStr = new Date().toLocaleTimeString();
    simRef.current.events.unshift({ time: timeStr, text, type });
    if (simRef.current.events.length > 50) simRef.current.events.pop();
  }, []);

  const pushHistory = useCallback(() => {
    undoStackRef.current.push(JSON.parse(JSON.stringify(projectRef.current)));
    if (undoStackRef.current.length > 30) undoStackRef.current.shift();
    redoStackRef.current = [];
  }, []);

  const handleUndo = useCallback(() => {
    if (undoStackRef.current.length === 0) {
      showToast('Nada para desfazer');
      return;
    }
    redoStackRef.current.push(JSON.parse(JSON.stringify(projectRef.current)));
    const prev = undoStackRef.current.pop();
    projectRef.current = prev;
    setProject(prev);
    setSelectedCompId(null);
    setSelectedWireId(null);
    showToast('Ação desfeita');
  }, [showToast]);

  const handleRedo = useCallback(() => {
    if (redoStackRef.current.length === 0) {
      showToast('Nada para refazer');
      return;
    }
    undoStackRef.current.push(JSON.parse(JSON.stringify(projectRef.current)));
    const next = redoStackRef.current.pop();
    projectRef.current = next;
    setProject(next);
    setSelectedCompId(null);
    setSelectedWireId(null);
    showToast('Ação refeita');
  }, [showToast]);

  const AUTOSAVE_STORAGE_KEY = 'tecnicamz_cad_autosave';

  const handleFit = useCallback(() => {
    const canvas = canvasRef.current;
    const curProj = projectRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    if (curProj.components.length === 0 && (!curProj.busbars || curProj.busbars.length === 0)) {
      cameraRef.current.zoom = 1;
      cameraRef.current.pan = { x: rect.width / 4, y: rect.height / 4 };
      return;
    }

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    curProj.components.forEach(c => {
      const w = c.w || 90;
      const h = c.h || 75;
      minX = Math.min(minX, c.x - w / 2);
      maxX = Math.max(maxX, c.x + w / 2);
      minY = Math.min(minY, c.y - h / 2);
      maxY = Math.max(maxY, c.y + h / 2);
    });

    (curProj.busbars || []).forEach(b => {
      const isH = b.orientation === 'horizontal';
      const halfL = (b.length || 600) / 2;
      const halfH = (b.type === 'din' ? 35 : 14) / 2;
      minX = Math.min(minX, b.x - (isH ? halfL : halfH));
      maxX = Math.max(maxX, b.x + (isH ? halfL : halfH));
      minY = Math.min(minY, b.y - (isH ? halfH : halfL));
      maxY = Math.max(maxY, b.y + (isH ? halfH : halfL));
    });

    if (curProj.panelConfig?.enabled) {
      const halfW = curProj.panelConfig.width / 2;
      const halfH = curProj.panelConfig.height / 2;
      const px = curProj.panelConfig.x || 0;
      const py = curProj.panelConfig.y || 0;
      minX = Math.min(minX, px - halfW);
      maxX = Math.max(maxX, px + halfW);
      minY = Math.min(minY, py - halfH);
      maxY = Math.max(maxY, py + halfH);
    }

    const padding = 100;
    const w = Math.max(250, maxX - minX + padding * 2);
    const h = Math.max(250, maxY - minY + padding * 2);
    const z = Math.max(0.25, Math.min(1.4, Math.min(rect.width / w, rect.height / h)));

    cameraRef.current.zoom = z;
    cameraRef.current.pan = {
      x: rect.width / 2 - ((minX + maxX) / 2) * z,
      y: rect.height / 2 - ((minY + maxY) / 2) * z
    };
  }, []);

  // FUNÇÃO DE ROTAÇÃO DA TELA (MOBILE LANDSCAPE)
  const handleToggleOrientation = async () => {
    try {
      if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen().catch(() => {});
      }

      if (screen.orientation && typeof (screen.orientation as any).lock === 'function') {
        const isCurrentLandscape = screen.orientation.type.includes('landscape');
        if (!isCurrentLandscape) {
          await (screen.orientation as any).lock('landscape').catch(() => {});
          setIsLandscape(true);
          showToast('Tela rotacionada para Horizontal (Paisagem)');
        } else {
          if (typeof (screen.orientation as any).unlock === 'function') {
            (screen.orientation as any).unlock();
          }
          if (document.fullscreenElement && document.exitFullscreen) {
            await document.exitFullscreen().catch(() => {});
          }
          setIsLandscape(false);
          showToast('Tela retornada para Vertical');
        }
      } else {
        const nextState = !isLandscape;
        setIsLandscape(nextState);
        showToast(nextState ? 'Modo Horizontal ativado' : 'Modo Vertical ativado');
      }

      setTimeout(handleFit, 300);
    } catch (err) {
      console.warn('Erro ao alternar orientação:', err);
      showToast('Gire o dispositivo para tela cheia');
    }
  };

  useEffect(() => {
    const handleOrientationChange = () => {
      const isLand = window.innerWidth > window.innerHeight || (screen.orientation && screen.orientation.type.includes('landscape'));
      setIsLandscape(Boolean(isLand));
      setTimeout(handleFit, 200);
    };

    window.addEventListener('resize', handleOrientationChange);
    if (screen.orientation) {
      screen.orientation.addEventListener('change', handleOrientationChange);
    }
    return () => {
      window.removeEventListener('resize', handleOrientationChange);
      if (screen.orientation) {
        screen.orientation.removeEventListener('change', handleOrientationChange);
      }
    };
  }, [handleFit]);

  useEffect(() => {
    if (initialCircuit?.cadData?.components && initialCircuit.cadData.components.length > 0) {
      const loadedProj = {
        version: initialCircuit.cadData.version || 14,
        name: initialCircuit.cadData.name || initialCircuit.title,
        components: initialCircuit.cadData.components,
        wires: initialCircuit.cadData.wires || [],
        busbars: initialCircuit.cadData.busbars || DEFAULT_MOTOR_BUSBARS,
        panelConfig: initialCircuit.cadData.panelConfig || PANEL_PRESETS.large,
        updated: Date.now()
      };
      projectRef.current = loadedProj;
      setProject(loadedProj);
      setPublishTitle(initialCircuit.title);
      setPublishDescription(initialCircuit.description || '');
      setPublishCategory(initialCircuit.category || 'Comandos Elétricos');
      addEvent(`Circuito "${initialCircuit.title}" carregado.`);
    } else {
      const savedRaw = localStorage.getItem(AUTOSAVE_STORAGE_KEY);
      if (savedRaw) {
        try {
          const parsed = JSON.parse(savedRaw);
          if (parsed && (Array.isArray(parsed.components) || Array.isArray(parsed.wires))) {
            const restoredProj = {
              version: parsed.version || 14,
              name: parsed.name || 'Projeto Restabelecido',
              components: parsed.components || [],
              wires: parsed.wires || [],
              busbars: parsed.busbars || [],
              panelConfig: parsed.panelConfig || PANEL_PRESETS.large,
              updated: Date.now()
            };
            projectRef.current = restoredProj;
            setProject(restoredProj);
            setPublishTitle(parsed.name || 'Projeto de Painel Elétrico');
            addEvent('Projeto anterior recuperado.');
            return;
          }
        } catch (e) {
          console.warn('Erro localStorage:', e);
        }
      }

      const emptyProj = {
        version: 14,
        name: 'Novo Projeto de Painel',
        components: [],
        wires: [],
        busbars: [],
        panelConfig: PANEL_PRESETS.large,
        updated: Date.now()
      };
      projectRef.current = emptyProj;
      setProject(emptyProj);
      setPublishTitle('Novo Projeto de Painel');
      setPublishCategory('Comandos Elétricos');
      setPublishDescription('');
      addEvent('Bancada pronta. Selecione um modelo.');
    }
  }, [initialCircuit, addEvent]);

  useEffect(() => {
    if (!project) return;
    try {
      localStorage.setItem(AUTOSAVE_STORAGE_KEY, JSON.stringify(project));
    } catch (err) {
      console.warn('Falha no auto-save:', err);
    }
  }, [project]);

  const loadPreset = useCallback((type: 'motor' | 'four_way' | 'qgd' | 'solar' | 'new') => {
    pushHistory();
    let nextProj: any;
    if (type === 'new') {
      nextProj = {
        version: 14,
        name: 'Novo Projeto Técnico MZ',
        components: [],
        wires: [],
        busbars: [],
        panelConfig: PANEL_PRESETS.medium,
        updated: Date.now()
      };
      projectRef.current = nextProj;
      setProject(nextProj);
      setSelectedCompId(null);
      setSelectedWireId(null);
      setSelectedBusbarId(null);
      setShowProps(false);
      showToast('Novo projeto criado');
      return;
    }
    if (type === 'motor') {
      const p = generateDirectMotorStarterCircuit();
      nextProj = {
        version: 14,
        name: 'Partida Direta de Motor Trifásico (IEC 60947)',
        components: p.components,
        wires: p.wires,
        busbars: DEFAULT_MOTOR_BUSBARS,
        panelConfig: PANEL_PRESETS.large,
        updated: Date.now()
      };
      showToast('Partida Direta carregada');
    } else if (type === 'four_way') {
      const p = generateFourWayLightingCircuit();
      nextProj = {
        version: 14,
        name: 'Comutação Four-Way / Three-Way',
        components: p.components,
        wires: p.wires,
        busbars: DEFAULT_FOURWAY_BUSBARS,
        panelConfig: PANEL_PRESETS.compact,
        updated: Date.now()
      };
      showToast('Comutação Four-Way carregada');
    } else if (type === 'qgd') {
      const p = generateQgdProtectionCircuit();
      nextProj = {
        version: 14,
        name: 'Quadro QGD com IDR 30mA',
        components: p.components,
        wires: p.wires,
        busbars: DEFAULT_QGD_BUSBARS,
        panelConfig: PANEL_PRESETS.medium,
        updated: Date.now()
      };
      showToast('Quadro QGD carregado');
    } else if (type === 'solar') {
      const p = generateSolarPVIsoCircuit();
      nextProj = {
        version: 14,
        name: 'Sistema Solar Fotovoltaico On-Grid (IEC 62548)',
        components: p.components,
        wires: p.wires,
        busbars: [],
        panelConfig: PANEL_PRESETS.industrial,
        updated: Date.now()
      };
      showToast('Sistema Solar Fotovoltaico carregado');
    }

    projectRef.current = nextProj;
    setProject(nextProj);
    setSelectedCompId(null);
    setSelectedWireId(null);
    setSelectedBusbarId(null);
    setShowProps(false);
    setTimeout(handleFit, 60);
  }, [pushHistory, handleFit, showToast]);

  const addComponentToCanvas = useCallback((code: string, customX?: number, customY?: number) => {
    const cdef = getComponentDef(code);
    pushHistory();

    const canvas = canvasRef.current;
    let spawnX = customX ?? 0;
    let spawnY = customY ?? 0;
    if (customX === undefined && canvas) {
      const rect = canvas.getBoundingClientRect();
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      spawnX = Math.round((cx - cameraRef.current.pan.x) / (cameraRef.current.zoom * cameraRef.current.grid)) * cameraRef.current.grid;
      spawnY = Math.round((cy - cameraRef.current.pan.y) / (cameraRef.current.zoom * cameraRef.current.grid)) * cameraRef.current.grid;
    }

    let defaultW = 90;
    let defaultH = 75;
    if (code === 'MCB_1P') defaultW = 50;
    else if (code === 'MCB2') defaultW = 75;
    else if (code === 'MPCB') { defaultW = 95; defaultH = 85; }
    else if (code === 'MCCB') { defaultW = 120; defaultH = 92; }
    else if (code === 'CONTACTOR') { defaultW = 110; defaultH = 88; }
    else if (code === 'AUX_BLOCK_2NA2NF') { defaultW = 85; defaultH = 70; }
    else if (code === 'OLR') { defaultW = 105; defaultH = 88; }
    else if (code === 'PBNO' || code === 'PBNC') { defaultW = 75; defaultH = 78; }
    else if (code === 'FUSE') { defaultW = 46; defaultH = 75; }
    else if (code === 'FU3') { defaultW = 88; defaultH = 75; }
    else if (code === 'SPD') { defaultW = 55; defaultH = 80; }
    else if (code === 'SPD3') { defaultW = 110; defaultH = 80; }
    else if (code.startsWith('SRC_')) { defaultW = 120; defaultH = 85; }
    else if (code === 'GEN_DIESEL') { defaultW = 150; defaultH = 100; }
    else if (code === 'ATS_SWITCH') { defaultW = 155; defaultH = 100; }
    else if (code === 'MTS_SWITCH') { defaultW = 135; defaultH = 95; }
    else if (code === 'PV_PANEL') { defaultW = 110; defaultH = 100; }
    else if (code === 'PV_INVERTER_ONGRID') { defaultW = 145; defaultH = 100; }
    else if (code === 'PV_INVERTER_OFFGRID') { defaultW = 135; defaultH = 95; }
    else if (code === 'PV_INVERTER_HYBRID') { defaultW = 140; defaultH = 100; }
    else if (code === 'BAT_LIFEPO4') { defaultW = 125; defaultH = 85; }
    else if (code === 'SMART_METER') { defaultW = 80; defaultH = 80; }
    else if (code === 'M3PH_6L' || code === 'M3PH') { defaultW = 125; defaultH = 95; }
    else if (code === 'M1PH' || code === 'FAN') { defaultW = 110; defaultH = 85; }
    else if (code === 'PUMP') { defaultW = 125; defaultH = 95; }
    else if (code === 'PHOTOCELL') { defaultW = 75; defaultH = 80; }
    else if (code === 'PIR_SENSOR') { defaultW = 80; defaultH = 80; }
    else if (code === 'TIMER_DIGITAL' || code === 'TIMER_STAR_DELTA' || code === 'TIMER_TOF') { defaultW = 85; defaultH = 80; }
    else if (code === 'THERMOSTAT_DIGITAL') { defaultW = 95; defaultH = 80; }
    else if (code === 'EARTH_ROD') { defaultW = 40; defaultH = 90; }
    else if (code === 'EARTH_PIT') { defaultW = 90; defaultH = 75; }
    else if (code === 'JUNCTION_BOX') { defaultW = 105; defaultH = 80; }
    else if (code === 'LAMP') { defaultW = 85; defaultH = 85; }
    else if (['VM', 'AM', 'OHM', 'WM', 'FREQ', 'COS'].includes(code)) { defaultW = 92; defaultH = 82; }

    const newComp = {
      id: `${code}_${Math.random().toString(36).substring(2, 7)}`,
      code,
      x: spawnX,
      y: spawnY,
      rot: 0,
      w: defaultW,
      h: defaultH,
      brand: 'Schneider Electric' as DeviceBrand,
      brandName: 'Schneider Electric',
      params: JSON.parse(JSON.stringify(cdef.params || {})),
      state: {
        closed: cdef.params?.closed ?? false,
        closed1: false,
        closed2: false,
        energized: false,
        running: false,
        tripped: false,
        position: cdef.params?.position ?? 0,
        rpm: 0
      },
      label: cdef.name
    };

    setProject(prev => {
      const next = {
        ...prev,
        components: [...prev.components, newComp],
        updated: Date.now()
      };
      projectRef.current = next;
      return next;
    });
    setSelectedCompId(newComp.id);
    setSelectedWireId(null);
    soundFX.playClick();
    addEvent(`${cdef.name} inserido no diagrama.`);
    showToast(`${cdef.name} adicionado`);
  }, [pushHistory, addEvent, showToast]);

  const handleLibraryPointerDown = useCallback((e: React.PointerEvent, code: string, name: string) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    const startX = e.clientX;
    const startY = e.clientY;
    let isDraggingLibrary = false;

    const onPointerMove = (ev: PointerEvent) => {
      const dist = Math.hypot(ev.clientX - startX, ev.clientY - startY);
      if (!isDraggingLibrary && dist > 6) {
        isDraggingLibrary = true;
        isDraggingRef.current = true;
        setIsCadDragging(true);
        if (ghostRef.current) {
          ghostRef.current.style.display = 'flex';
          if (ghostTextRef.current) {
            ghostTextRef.current.textContent = code.substring(0, 4);
          }
        }
      }

      if (isDraggingLibrary && ghostRef.current) {
        ghostRef.current.style.transform = `translate3d(${ev.clientX - 16}px, ${ev.clientY - 16}px, 0)`;
      }
    };

    const onPointerUp = (ev: PointerEvent) => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);

      if (isDraggingLibrary) {
        isDraggingRef.current = false;
        setIsCadDragging(false);
        if (ghostRef.current) {
          ghostRef.current.style.display = 'none';
        }

        const canvas = canvasRef.current;
        if (canvas) {
          const rect = canvas.getBoundingClientRect();
          if (
            ev.clientX >= rect.left &&
            ev.clientX <= rect.right &&
            ev.clientY >= rect.top &&
            ev.clientY <= rect.bottom
          ) {
            const cam = cameraRef.current;
            const targetX = Math.round(((ev.clientX - rect.left - cam.pan.x) / cam.zoom) / 20) * 20;
            const targetY = Math.round(((ev.clientY - rect.top - cam.pan.y) / cam.zoom) / 20) * 20;
            addComponentToCanvas(code, targetX, targetY);
          }
        }
      }
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerup', onPointerUp, { passive: true });
  }, [addComponentToCanvas]);

  const [isDiagnosticPanelOpen, setIsDiagnosticPanelOpen] = useState(false);
  const [diagnosticState, setDiagnosticState] = useState<DiagnosticEngineState>(
    simulatorDiagnostics.getState()
  );

  useEffect(() => {
    const unsub = simulatorDiagnostics.subscribe(s => setDiagnosticState(s));
    return () => unsub();
  }, []);

  useEffect(() => {
    const unregister = voiceOrchestrator.registerCadBridge({
      isOpen: true,
      openSimulator: () => {},
      closeSimulator: onClose,
      getProject: () => projectRef.current,
      setProject: (newP: any) => {
        projectRef.current = newP;
        setProject(newP);
      },
      isRunning: isRunning,
      setIsRunning: setIsRunning,
      addComponent: (type: string, x?: number, y?: number, onBusbar?: boolean) => {
        addComponentToCanvas(type);
        return type;
      },
      connectTerminals: (params: any) => {
        const { sourceCompId, sourceTerminal, targetCompId, targetTerminal, wireType } = params;
        const curP = projectRef.current;
        const compA = curP.components.find((c: any) => c.id === sourceCompId || c.code === sourceCompId);
        const compB = curP.components.find((c: any) => c.id === targetCompId || c.code === targetCompId);
        if (!compA || !compB) return false;

        const defA = getComponentDef(compA.code);
        const defB = getComponentDef(compB.code);
        const tA = sourceTerminal || defA?.terminals?.[0]?.[0] || '1';
        const tB = targetTerminal || defB?.terminals?.[0]?.[0] || '2';

        pushHistory();
        const newWire = {
          id: `W_${Math.random().toString(36).substring(2, 7)}`,
          a: { c: compA.id, t: tA },
          b: { c: compB.id, t: tB },
          type: wireType || 'L1',
          gauge: wireType === 'NU' ? 16.0 : 2.5,
          length: 3.0,
          live: isRunning
        };
        const updated = {
          ...curP,
          wires: [...curP.wires, newWire],
          updated: Date.now()
        };
        projectRef.current = updated;
        setProject(updated);
        showToast('Condutores interligados');
        return true;
      },
      removeComponent: (compId: string) => {
        pushHistory();
        const curP = projectRef.current;
        const updated = {
          ...curP,
          components: curP.components.filter((c: any) => c.id !== compId),
          wires: curP.wires.filter((w: any) => w.a.c !== compId && w.b.c !== compId),
          updated: Date.now()
        };
        projectRef.current = updated;
        setProject(updated);
        showToast('Componente removido');
        return true;
      },
      clearCanvas: () => {
        loadPreset('new');
      },
      triggerSimulation: (action: 'start' | 'stop' | 'toggle') => {
        let nextState = !isRunning;
        if (action === 'start') nextState = true;
        else if (action === 'stop') nextState = false;
        setIsRunning(nextState);
        return nextState;
      }
    });

    return () => {
      unregister();
    };
  }, [isRunning, addComponentToCanvas, pushHistory, loadPreset, onClose, showToast]);

  const rotateSelectedComponent = useCallback(() => {
    if (!selectedCompId) return;
    pushHistory();
    setProject(prev => {
      const updated = {
        ...prev,
        components: prev.components.map(c => (c.id === selectedCompId ? { ...c, rot: (c.rot + 90) % 360 } : c)),
        updated: Date.now()
      };
      projectRef.current = updated;
      return updated;
    });
    soundFX.playClick();
    showToast('Componente girado 90°');
  }, [selectedCompId, pushHistory, showToast]);

  const duplicateSelectedComponent = useCallback(() => {
    if (!selectedCompId) return;
    const comp = projectRef.current.components.find(c => c.id === selectedCompId);
    if (!comp) return;
    pushHistory();
    const dup = JSON.parse(JSON.stringify(comp));
    dup.id = `${comp.code}_${Math.random().toString(36).substring(2, 7)}`;
    dup.x += 40;
    dup.y += 40;
    setProject(prev => {
      const updated = {
        ...prev,
        components: [...prev.components, dup],
        updated: Date.now()
      };
      projectRef.current = updated;
      return updated;
    });
    setSelectedCompId(dup.id);
    soundFX.playClick();
    showToast('Componente duplicado');
  }, [selectedCompId, pushHistory, showToast]);

  const addBusbar = useCallback(
    (
      type: 'din' | 'phase_l1' | 'phase_l2' | 'phase_l3' | 'neutral' | 'earth',
      x?: number,
      y?: number,
      length = 680,
      orientation: 'horizontal' | 'vertical' = 'horizontal'
    ) => {
      pushHistory();
      const cam = cameraRef.current;
      const canvas = canvasRef.current;
      let targetX = 0;
      let targetY = 0;

      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        const cx = rect.width / 2;
        const cy = rect.height / 2;
        targetX = Math.round((cx - cam.pan.x) / (cam.zoom * 20)) * 20;
        targetY = Math.round((cy - cam.pan.y) / (cam.zoom * 20)) * 20;
      }

      if (x !== undefined) targetX = x;
      if (y !== undefined) targetY = y;

      const busbarId = `BB_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const terminals = generateBusbarTerminals(busbarId, type, targetX, targetY, length, orientation);

      const newBusbar: Busbar = {
        id: busbarId,
        type,
        x: targetX,
        y: targetY,
        length,
        orientation,
        terminals
      };

      setProject((prev: any) => {
        const updated = {
          ...prev,
          busbars: [...(prev.busbars || []), newBusbar],
          updated: Date.now()
        };
        projectRef.current = updated;
        return updated;
      });

      setSelectedBusbarId(newBusbar.id);
      setSelectedCompId(null);
      setSelectedWireId(null);
      setShowProps(false);
      soundFX?.playClick?.();

      const typeLabel =
        type === 'din'
          ? 'Trilho DIN 35mm'
          : type === 'phase_l1'
          ? 'Barramento Fase L1'
          : type === 'phase_l2'
          ? 'Barramento Fase L2'
          : type === 'phase_l3'
          ? 'Barramento Fase L3'
          : type === 'neutral'
          ? 'Barramento Neutro'
          : 'Barramento Terra PE';

      showToast(`${typeLabel} adicionado.`);
      addEvent(`${typeLabel} inserido no diagrama.`);
    },
    [pushHistory, addEvent, showToast]
  );

  const deleteWire = useCallback((wireId: string) => {
    pushHistory();
    setProject((prev: any) => {
      const updated = {
        ...prev,
        wires: (prev.wires || []).filter((w: any) => w.id !== wireId),
        busbars: (prev.busbars || []).map((b: any) => ({
          ...b,
          terminals: (b.terminals || []).map((t: any) =>
            t.connectedWireId === wireId ? { ...t, isOccupied: false, connectedWireId: undefined } : t
          )
        })),
        updated: Date.now()
      };
      projectRef.current = updated;
      return updated;
    });
    setSelectedWireId(null);
    soundFX?.playClick?.();
    showToast('Condutor removido');
  }, [pushHistory, showToast]);

  const updateSelectedWire = useCallback(
    (updates: { type?: string; gauge?: number }) => {
      if (!selectedWireId) return;
      pushHistory();
      setProject(prev => {
        const updated = {
          ...prev,
          wires: prev.wires.map(w => (w.id === selectedWireId ? { ...w, ...updates } : w)),
          updated: Date.now()
        };
        projectRef.current = updated;
        return updated;
      });
      soundFX?.playClick?.();
      showToast('Condutor atualizado');
    },
    [selectedWireId, pushHistory, showToast]
  );

  const updateComponentProperty = useCallback((paramKey: string, val: any) => {
    if (!selectedCompId) return;
    pushHistory();
    setProject(prev => ({
      ...prev,
      components: prev.components.map(c => {
        if (c.id === selectedCompId) {
          const nextParams = { ...c.params, [paramKey]: val };
          const nextState = { ...c.state };
          if (paramKey === 'voltage') nextState.voltage = val;
          if (paramKey === 'power') nextState.powerKW = val / 1000;
          if (paramKey === 'pMax') nextState.powerKW = val / 1000;
          if (paramKey === 'socPercent') nextState.percent = val;
          return {
            ...c,
            params: nextParams,
            state: nextState
          };
        }
        return c;
      }),
      updated: Date.now()
    }));
  }, [selectedCompId, pushHistory]);

  const deleteSelected = useCallback(() => {
    if (selectedCompId) {
      pushHistory();
      setProject(prev => {
        const updated = {
          ...prev,
          components: prev.components.filter(c => c.id !== selectedCompId),
          wires: prev.wires.filter(w => w.a.c !== selectedCompId && w.b.c !== selectedCompId),
          updated: Date.now()
        };
        projectRef.current = updated;
        return updated;
      });
      setSelectedCompId(null);
      setShowProps(false);
      soundFX.playClick();
      showToast('Componente removido');
    } else if (selectedWireId) {
      deleteWire(selectedWireId);
    } else if (selectedBusbarId) {
      pushHistory();
      setProject((prev: any) => {
        const updated = {
          ...prev,
          busbars: (prev.busbars || []).filter((b: any) => b.id !== selectedBusbarId),
          updated: Date.now()
        };
        projectRef.current = updated;
        return updated;
      });
      setSelectedBusbarId(null);
      soundFX?.playClick?.();
      showToast('Barramento/Trilho removido');
    }
  }, [selectedCompId, selectedWireId, selectedBusbarId, deleteWire, pushHistory, showToast]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        deleteSelected();
      } else if (e.key === 'Escape') {
        setSelectedCompId(null);
        setSelectedWireId(null);
        setSelectedBusbarId(null);
        simRef.current.wireStart = null;
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        handleRedo();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, deleteSelected, handleUndo, handleRedo]);

  const triggerComponentCommand = useCallback(
    (compId: string, action: 'toggle' | 'on' | 'off' | 'pulse' | 'reset' | 'test_rcd', clickRelX: number = 0) => {
      setProject(prev => {
        const updated = {
          ...prev,
          components: prev.components.map(c => {
            if (c.id === compId) {
              const d = getComponentDef(c.code);
              const st = { ...c.state };
              const params = { ...(c.params || {}) };

              if (action === 'test_rcd') {
                params.testPressed = true;
                soundFX?.playClick?.();
                setTimeout(() => {
                  c.params.testPressed = false;
                }, 200);
              } else if (action === 'reset') {
                st.tripped = false;
                st.fault = false;
                st.faultCause = '';
                st.burned = false;
                st.closed = d.params?.closed ?? false;
                st.energized = false;
                st.running = false;
                st.rpm = 0;
                simRef.current.trippedSet.delete(compId);
                addEvent(`${d.name}: Proteção resetada.`, 'info');
              } else if (action === 'pulse') {
                const isNC = c.code === 'PBNC' || (d.params?.closed === true && Boolean(d.momentary));
                st.pressed = true;
                st.closed = isNC ? false : true;
                soundFX?.playClick?.();

                setTimeout(() => {
                  setProject(curr => {
                    const currUpdated = {
                      ...curr,
                      components: curr.components.map(item =>
                        item.id === compId
                          ? {
                              ...item,
                              state: {
                                ...item.state,
                                pressed: false,
                                closed: isNC ? true : false
                              }
                            }
                          : item
                      ),
                      updated: Date.now()
                    };
                    projectRef.current = currUpdated;
                    return currUpdated;
                  });
                }, 350);
              } else {
                if (c.code === 'GEN_DIESEL') {
                  const nextGenState = !Boolean(st.running || params.running);
                  st.running = nextGenState;
                  params.running = nextGenState;
                  st.voltage = nextGenState ? 400 : 0;
                  st.rpm = nextGenState ? 1500 : 0;
                  st.frequency = nextGenState ? 50 : 0;
                  st.energized = nextGenState;
                  soundFX?.playClick?.();
                  addEvent(
                    nextGenState
                      ? 'GMG DIESEL: Grupo Gerador acionado com sucesso (400V 50Hz, 1500 RPM).'
                      : 'GMG DIESEL: Motor desligado.',
                    nextGenState ? 'info' : 'warn'
                  );
                } else if (c.code === 'ATS_SWITCH') {
                  const curGrid = params.gridHealthy !== false;
                  params.gridHealthy = !curGrid;
                  soundFX?.playClick?.();
                  addEvent(
                    !curGrid
                      ? 'ATS: Rede restabelecida. Transferindo para Concessionária...'
                      : 'ATS: Falha na Rede detectada! Acionando GMG e transferindo carga...',
                    'warn'
                  );
                } else if (c.code === 'MTS_SWITCH') {
                  const curPos = Number(params.position ?? 1);
                  let nextPos = 1;
                  if (curPos === 1) nextPos = 0;
                  else if (curPos === 0) nextPos = 2;
                  else nextPos = 1;

                  params.position = nextPos;
                  st.position = nextPos;
                  soundFX?.playClick?.();
                  const posLabel =
                    nextPos === 1 ? 'I (REDE)' : nextPos === 0 ? '0 (DESLIGADO/ISOLADO)' : 'II (GERADOR)';
                  addEvent(`MTS: Chave de transferência manual manobrada para ${posLabel}.`, 'info');
                } else if (c.code === 'SPD' || c.code === 'SPD3') {
                  const curHealth = params.health !== 0;
                  params.health = curHealth ? 0 : 100;
                  st.status = curHealth ? 'red' : 'green';
                  soundFX?.playClick?.();
                  addEvent(
                    `DPS: Cartucho ${curHealth ? 'DESARMADO / QUEIMADO (Vermelho)' : 'SUBSTITUÍDO / OK (Verde)'}.`,
                    curHealth ? 'warn' : 'info'
                  );
                } else if (c.code === 'PUMP') {
                  soundFX?.playClick?.();
                  addEvent(`Eletrobomba: Status operacional ${st.running ? 'EM MARCHA (2880 RPM)' : 'EM REPOUSO'}.`, 'info');
                } else if (c.code === 'PHOTOCELL') {
                  const curLux = params.ambientLux ?? 100;
                  const nextLux = curLux <= 20 ? 120 : 10;
                  params.ambientLux = nextLux;
                  st.closed = nextLux <= 20;
                  soundFX?.playClick?.();
                  addEvent(
                    nextLux <= 20
                      ? 'Fotocélula: Anoitecer detectado (<20 lux). Contato fechado.'
                      : 'Fotocélula: Luz solar detectada (>20 lux). Contato aberto.',
                    'info'
                  );
                } else if (c.code === 'PIR_SENSOR') {
                  params.presenceDetected = true;
                  soundFX?.playClick?.();
                  addEvent('Sensor PIR: Presença detectada! Contato ativado.', 'info');
                  setTimeout(() => {
                    setProject(curr => ({
                      ...curr,
                      components: curr.components.map(item =>
                        item.id === compId
                          ? { ...item, params: { ...item.params, presenceDetected: false } }
                          : item
                      )
                    }));
                  }, 4000);
                } else if (c.code === 'PV_PANEL') {
                  const curIrr = params.irradiance ?? 1000;
                  params.irradiance = curIrr === 0 ? 1000 : 0;
                  soundFX?.playClick?.();
                  addEvent(
                    params.irradiance === 1000
                      ? 'Painel Solar: Radiação solar nominal (1000 W/m²).'
                      : 'Painel Solar: Sem radiação solar (0 W/m² - Noite).',
                    'info'
                  );
                } else if (c.code === 'ESTOP') {
                  const isLocked = Boolean(st.pressed || st.tripped || !st.closed);
                  const nextLocked = !isLocked;
                  st.pressed = nextLocked;
                  st.tripped = nextLocked;
                  st.closed = !nextLocked;
                  params.closed = !nextLocked;
                  soundFX?.playClick?.();
                  addEvent(
                    nextLocked ? 'E-STOP TRAVADO: Circuito desarmado!' : 'E-STOP DESTRAVADO: Circuito em serviço.',
                    nextLocked ? 'warn' : 'info'
                  );
                } else if (c.code === 'LIMIT') {
                  const nextActuated = !Boolean(st.actuated || st.pressed);
                  st.actuated = nextActuated;
                  st.pressed = nextActuated;
                  st.closed = !nextActuated;
                  soundFX?.playClick?.();
                  addEvent(`Fim de curso ${nextActuated ? 'ATUADO (haste defletida)' : 'em REPOUSO'}.`, 'info');
                } else if (c.code === 'FLOAT') {
                  const nextHigh = !Boolean(st.high || st.closed);
                  st.high = nextHigh;
                  st.closed = nextHigh;
                  params.closed = nextHigh;
                  soundFX?.playClick?.();
                  addEvent(
                    nextHigh
                      ? 'Bóia de nível: NÍVEL ALTO (contato NA fechado).'
                      : 'Bóia de nível: NÍVEL BAIXO (contato NF fechado).',
                    'info'
                  );
                } else if (c.code === 'SEL') {
                  const curPos = Number(params.position ?? st.position ?? 0);
                  let nextPos = 0;
                  if (curPos === 0) nextPos = 1;
                  else if (curPos === 1) nextPos = 2;
                  else nextPos = 0;

                  params.position = nextPos;
                  st.position = nextPos;
                  st.rockerAngle = nextPos;
                  soundFX?.playClick?.();
                  const posName =
                    nextPos === 1 ? 'MARCHA 1 (MAN)' : nextPos === 2 ? 'MARCHA 2 (AUTO)' : 'CENTRO (DESLIGADO)';
                  addEvent(`Chave Seletora comutada para ${posName}.`, 'info');
                } else if (c.code === 'SW_DOUBLE') {
                  if (clickRelX < 0) {
                    const nextK1 = !Boolean(st.closed1 ?? st.closed);
                    st.closed1 = nextK1;
                    st.closed = nextK1;
                    params.closed1 = nextK1;
                    soundFX?.playClick?.();
                    addEvent(`Interruptor duplo Tecla 1 (R1): ${nextK1 ? 'LIGADA' : 'DESLIGADA'}.`, 'info');
                  } else {
                    const nextK2 = !Boolean(st.closed2);
                    st.closed2 = nextK2;
                    params.closed2 = nextK2;
                    soundFX?.playClick?.();
                    addEvent(`Interruptor duplo Tecla 2 (R2): ${nextK2 ? 'LIGADA' : 'DESLIGADA'}.`, 'info');
                  }
                } else if (c.code === 'DIMMER') {
                  const curPct = Number(params.percent ?? 100);
                  const nextPct = curPct >= 100 ? 0 : curPct + 25;
                  params.percent = nextPct;
                  st.percent = nextPct;
                  soundFX?.playClick?.();
                  addEvent(`Dimmer ajustado para ${nextPct}% (modulação de tensão eficaz).`, 'info');
                } else if (c.code === 'THREE_WAY') {
                  const nextPos = (params.position ?? 0) === 0 ? 1 : 0;
                  params.position = nextPos;
                  st.rockerAngle = nextPos;
                  st.closed = nextPos === 1;
                  soundFX?.playClick?.();
                  addEvent(`Three-Way comutado para rota ${nextPos === 0 ? 'R1' : 'R2'}.`, 'info');
                } else if (c.code === 'FOUR_WAY') {
                  const nextCrossed = !Boolean(params.crossed);
                  params.crossed = nextCrossed;
                  st.rockerAngle = nextCrossed ? 1 : 0;
                  st.closed = nextCrossed;
                  soundFX?.playClick?.();
                  addEvent(`Four-Way comutado para modo ${nextCrossed ? 'Cruzado' : 'Direto'}.`, 'info');
                } else {
                  const nextOn = action === 'toggle' ? !st.closed : action === 'on';
                  st.closed = nextOn;
                  st.rockerAngle = nextOn ? 1 : 0;
                  params.closed = nextOn;
                }
              }
              return { ...c, state: st, params };
            }
            return c;
          }),
          updated: Date.now()
        };
        projectRef.current = updated;
        return updated;
      });
      soundFX.playClick();
    },
    [addEvent]
  );

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(projectRef.current, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(projectRef.current.name || 'circuito_tecnicamz').replace(/\s+/g, '_')}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Arquivo JSON baixado');
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = event => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (Array.isArray(imported.components) && Array.isArray(imported.wires)) {
          pushHistory();
          const importedProj = {
            version: imported.version || 14,
            name: imported.name || 'Projeto Importado',
            components: imported.components,
            wires: imported.wires,
            busbars: Array.isArray(imported.busbars) ? imported.busbars : [],
            updated: Date.now()
          };
          projectRef.current = importedProj;
          setProject(importedProj);
          setSelectedCompId(null);
          setSelectedWireId(null);
          setSelectedBusbarId(null);
          showToast('Projeto importado');
          setTimeout(handleFit, 60);
        } else {
          alert('Arquivo JSON inválido.');
        }
      } catch (err) {
        alert('Erro ao carregar arquivo JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleExportImage = () => {
    try {
      const dataUrl = generateMuralSnapshot(projectRef.current, {
        title: projectRef.current.name || 'Diagrama Técnico TécnicaMZ',
        width: 1600,
        height: 900
      });
      if (!dataUrl) return;
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `${(projectRef.current.name || 'esquema_eletrico').replace(/\s+/g, '_')}.png`;
      link.click();
      showToast('Diagrama exportado com enquadramento (Auto-Fit)');
    } catch {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `${(projectRef.current.name || 'esquema_eletrico').replace(/\s+/g, '_')}.png`;
      link.click();
      showToast('Diagrama exportado em PNG');
    }
  };

  const handleConfirmPublish = async () => {
    if (!publishTitle.trim() || !publishDescription.trim()) {
      alert('Informe um título e uma descrição técnica para o circuito.');
      return;
    }

    setIsPublishing(true);
    try {
      const snapshotUrl = generateMuralSnapshot(projectRef.current, {
        title: publishTitle.trim(),
        width: 1200,
        height: 720
      });

      const circuitDataToPublish: CadCircuitProject = {
        title: publishTitle.trim(),
        category: publishCategory,
        norma: 'IEC 60947 / IEC 60364',
        description: publishDescription.trim(),
        allowTesting,
        circuitType: 'custom',
        tags: publishTags,
        createdAt: new Date().toISOString(),
        cadData: {
          version: projectRef.current.version || 14,
          name: publishTitle.trim(),
          components: projectRef.current.components,
          wires: projectRef.current.wires,
          busbars: projectRef.current.busbars || [],
          panelConfig: projectRef.current.panelConfig,
          snapshot: snapshotUrl,
          updated: Date.now()
        }
      };

      await onPublishCircuit(circuitDataToPublish, {
        title: publishTitle.trim(),
        description: publishDescription.trim(),
        category: publishCategory,
        allowTesting,
        tags: publishTags
      });

      soundFX.playSuccess();
      setIsPublishDialogOpen(false);
      showToast('Circuito publicado com sucesso no Mural Técnico!');
      onClose();
    } catch (err: any) {
      console.error('Erro ao publicar circuito:', err);
      alert(err?.message || 'Falha ao publicar projeto.');
    } finally {
      setIsPublishing(false);
    }
  };

  useEffect(() => {
    return () => {
      soundFX.stopMotorSound();
      soundFX.stopBuzzerSound();
    };
  }, []);

  const terminalPos = useCallback((comp: any, termId: string) => {
    return getTerminalWorldPos(comp, termId);
  }, []);

  // ==========================================================================
  // LOOP DE RENDERIZAÇÃO DO CANVAS 2D COM FÍSICA NODAL INTEGRADA
  // ==========================================================================
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.max(1, window.devicePixelRatio || 1);
      const targetW = Math.round(rect.width * dpr);
      const targetH = Math.round(rect.height * dpr);
      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
      }
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas, { passive: true });

    const render = (now: number) => {
      try {
        const dt = Math.min(0.1, (now - simRef.current.lastTick) / 1000);
        simRef.current.lastTick = now;

        if (isRunningRef.current) {
          simRef.current.time += dt;
        }

        const rect = canvas.getBoundingClientRect();
        const w = rect.width;
        const h = rect.height;
        if (w === 0 || h === 0) return;

        const dpr = Math.max(1, window.devicePixelRatio || 1);
        const targetW = Math.round(w * dpr);
        const targetH = Math.round(h * dpr);
        if (canvas.width !== targetW || canvas.height !== targetH) {
          canvas.width = targetW;
          canvas.height = targetH;
        }

        ctx.save();
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        const cam = cameraRef.current;
        const currentProj = projectRef.current;
        const isSimRunning = isRunningRef.current;

        // Fundo
        ctx.fillStyle = '#060D1A';
        ctx.fillRect(0, 0, w, h);

        // Grade técnica
        ctx.save();
        const baseGrid = cam.grid || 20;
        const step = baseGrid * cam.zoom;
        const ox = ((cam.pan.x % step) + step) % step;
        const oy = ((cam.pan.y % step) + step) % step;

        ctx.strokeStyle = 'rgba(56, 189, 248, 0.07)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let x = ox; x < w; x += step) {
          ctx.moveTo(x, 0);
          ctx.lineTo(x, h);
        }
        for (let y = oy; y < h; y += step) {
          ctx.moveTo(0, y);
          ctx.lineTo(w, y);
        }
        ctx.stroke();
        ctx.restore();

        const toScreen = (p: { x: number; y: number }) => ({
          x: p.x * cam.zoom + cam.pan.x,
          y: p.y * cam.zoom + cam.pan.y
        });

        // 1. SOLUÇÃO DO MOTOR FÍSICO MNA NO INÍCIO DO FRAME
        const physResult = solveCircuitPhysicsStep(
          currentProj,
          dt,
          simRef.current.time,
          isSimRunning
        );
        simRef.current.lastPhysResult = physResult;
        simRef.current.energizedBusbars = new Set(physResult.energizedBusbarIds || []);

        // CAMADA 1: Moldura do Quadro
        if (currentProj.panelConfig?.enabled) {
          drawPanelEnclosure(ctx, cam, currentProj.panelConfig);
        }

        // CAMADA 2: CONDUTORES
        const baseSystemV = physResult.mainVoltageRMS > 0 ? physResult.mainVoltageRMS : 230;

        (currentProj.wires || []).forEach((wire: any, wireIdx: number) => {
          const posA = getNodeWorldPos(wire.a?.c, wire.a?.t, currentProj.components, currentProj.busbars || []);
          const posB = getNodeWorldPos(wire.b?.c, wire.b?.t, currentProj.components, currentProj.busbars || []);
          const filletPath = calculateFilletManhattanPath(posA, posB, wireIdx, wire.waypoints);
          const isSelected = wire.id === selectedWireIdRef.current;
          const isLive = isRunningRef.current && Boolean(wire.live);

          let calculatedWireV = 0;
          if (isLive) {
            if (wire.type === 'PE' || wire.type === 'NU') {
              calculatedWireV = 0;
            } else if (wire.type === 'N') {
              calculatedWireV = Number(wire.voltageDrop || 0.2);
            } else if (wire.type === '24+' || wire.type === '24-') {
              calculatedWireV = 24.0;
            } else if (wire.type?.startsWith('L') || wire.type === 'CTRL') {
              calculatedWireV = baseSystemV;
            } else {
              calculatedWireV = 230.0;
            }
          }
          wire.voltage = calculatedWireV;

          renderCurvedWireBack(ctx, filletPath, {
            wireType: wire.type || 'L1',
            gauge: Number(wire.gauge || 2.5),
            cam,
            isLive,
            isSelected: isSelected || isThermalModeRef.current,
            isOverheated: Boolean(wire.overheated),
            isSmoke: Boolean(wire.smoke),
            isCarbonized: Boolean(wire.carbonized),
            current: Number(wire.current || 0),
            voltage: calculatedWireV,
            temp: Number(wire.temp || 25),
            smoke: Boolean(wire.smoke),
            carbonized: Boolean(wire.carbonized),
            voltageDrop: Number(wire.voltageDrop || 0),
            frequency: Number(wire.frequency || (isLive ? (physResult.activeFrequency || 50.0) : 0.0)),
            animTick: simRef.current.time * 60,
            toScreen
          });
        });

        // CAMADA 3: TRILHOS DIN E BARRAMENTOS
        drawBusbars(
          ctx,
          cam,
          currentProj.busbars || [],
          selectedBusbarIdRef.current,
          hoveredTerminalIdRef.current,
          simRef.current.energizedBusbars
        );

        // CAMADA 4: DISPOSITIVOS ELÉTRICOS
        currentProj.components.forEach(c => {
          const s = toScreen({ x: c.x, y: c.y });
          ctx.save();
          ctx.translate(s.x, s.y);
          ctx.rotate(((c.rot || 0) * Math.PI) / 180);

          try {
            renderDevice(ctx, {
              component: c,
              camera: cam,
              isSelected: c.id === selectedCompIdRef.current,
              time: simRef.current.time,
              simRunning: isRunningRef.current
            });
          } catch (renderErr) {
            console.error(`Erro ao renderizar componente ${c.id}:`, renderErr);
          }

          ctx.restore();
        });

        // CAMADA 5: TERMINAIS FERRULES
        (currentProj.wires || []).forEach((wire: any) => {
          const posA = getNodeWorldPos(wire.a?.c, wire.a?.t, currentProj.components, currentProj.busbars || []);
          const posB = getNodeWorldPos(wire.b?.c, wire.b?.t, currentProj.components, currentProj.busbars || []);
          const isLive = isRunningRef.current && Boolean(wire.live);
          const isOverheated = Boolean(wire.overheated);
          const wireGauge = Number(wire.gauge || 2.5);

          renderFerruleTerminal(
            ctx,
            toScreen(posA),
            posA.dir || 'bottom',
            wire.type || 'L1',
            wireGauge,
            cam,
            isLive,
            isOverheated
          );

          renderFerruleTerminal(
            ctx,
            toScreen(posB),
            posB.dir || 'top',
            wire.type || 'L1',
            wireGauge,
            cam,
            isLive,
            isOverheated
          );
        });

        // CAMADA 6: TELEMETRIA TÁTICA FLUTUANTE NO DISPOSITIVO SELECIONADO (ALTA RESOLUÇÃO)
        if (selectedCompIdRef.current) {
          const selectedC = (currentProj.components || []).find((item: any) => item.id === selectedCompIdRef.current);
          if (selectedC) {
            const s = toScreen({ x: selectedC.x, y: selectedC.y });
            const sH = (selectedC.h || 75) * cam.zoom;
            const hudY = s.y - sH / 2 - 18 * cam.zoom;

            ctx.save();
            const isEnergized = Boolean(selectedC.state?.energized || selectedC.state?.running);
            const isTripped = Boolean(selectedC.state?.tripped);

            let vValNum = Number(selectedC.state?.voltage || 0);
            if (!vValNum && isEnergized) {
              if (selectedC.code.includes('3PH') || selectedC.code === 'PUMP' || selectedC.code === 'GEN_DIESEL') {
                vValNum = 400.0;
              } else if (selectedC.code === 'BAT_LIFEPO4') {
                vValNum = Number(selectedC.params?.voltage || 51.2);
              } else if (selectedC.code === 'SRC_DC24') {
                vValNum = 24.0;
              } else {
                vValNum = 230.0;
              }
            }

            // CORRENTE REAL: Leitura com cálculo de contingência para motores e cargas
            let currentNum = Number(selectedC.state?.current || 0);
            if ((!currentNum || currentNum <= 0.001) && isEnergized) {
              const pWatts = Number(selectedC.state?.powerW || (selectedC.state?.powerKW ? Number(selectedC.state.powerKW) * 1000 : 0) || selectedC.params?.power || 1500);
              const pfRaw = selectedC.params?.pf ?? selectedC.params?.powerFactor ?? 0.85;
              const pf = Number(String(pfRaw).replace(',', '.')) || 0.85;
              const vEff = vValNum > 50 ? vValNum : 400;

              if (selectedC.code.includes('3PH') || selectedC.code === 'PUMP' || selectedC.code === 'M3PH_6L' || selectedC.code === 'M3PH') {
                currentNum = pWatts / (Math.sqrt(3) * vEff * pf);
              } else if (selectedC.code === 'M1PH' || selectedC.code === 'FAN' || selectedC.code === 'LAMP' || selectedC.code === 'HEATER') {
                currentNum = pWatts / (vValNum > 50 ? vValNum : 230);
              } else if (selectedC.code === 'OUTLET') {
                const outletP = Number(selectedC.params?.powerW || selectedC.params?.customPowerW || 0);
                currentNum = outletP > 0 ? (outletP / 230) : Number(selectedC.params?.targetCurrent || 0);
              }
            }

            if (selectedC.state && currentNum > 0) {
              selectedC.state.current = Number(currentNum.toFixed(2));
            }

            let iFormatted = '0.00 A';
            if (currentNum > 0 && currentNum < 1.0) {
              iFormatted = `${(currentNum * 1000).toFixed(0)} mA (${currentNum.toFixed(3)}A)`;
            } else {
              iFormatted = `${currentNum.toFixed(2)} A`;
            }

            const pVal = selectedC.state?.powerW !== undefined
              ? Number(selectedC.state.powerW).toFixed(0)
              : selectedC.state?.powerKW !== undefined
              ? (Number(selectedC.state.powerKW) * 1000).toFixed(0)
              : (Number(selectedC.params?.power || 1500)).toFixed(0);

            const hzVal = Number(selectedC.state?.frequency || (isEnergized ? (physResult.activeFrequency || 50.0) : 0)).toFixed(1);
            const pfValRaw = selectedC.params?.pf ?? selectedC.params?.powerFactor ?? 0.85;
            const pfVal = Number(String(pfValRaw).replace(',', '.')).toFixed(2);
            const tempVal = Number(selectedC.state?.temp || 25.0).toFixed(1);

            let statusTxt = `⚡ ${vValNum.toFixed(1)}V  |  ⌁ ${iFormatted}  |  ♨ ${pVal}W  |  ⏱ ${hzVal}Hz  |  cosφ ${pfVal}`;

            if (isTripped) {
              statusTxt = `⚠️ DISPARADO / BLOQUEADO  |  0.00 A  |  ${tempVal}°C`;
            } else if (selectedC.state?.closed === false && !isEnergized) {
              statusTxt = `○ CONTATO ABERTO  |  0.00 A  |  ${tempVal}°C`;
            } else if (selectedC.code === 'M3PH' || selectedC.code === 'PUMP' || selectedC.code === 'M3PH_6L') {
              const rpmVal = Math.round(Number(selectedC.state?.rpm) > 0 ? Number(selectedC.state?.rpm) : (isEnergized ? Number(selectedC.params?.rpm || 2920) : 0));
              statusTxt = `⚡ ${vValNum.toFixed(0)}V 3~  |  ⌁ ${iFormatted}  |  ⚙ ${rpmVal} RPM  |  ♨ ${pVal}W  |  cosφ ${pfVal}`;
            }

            ctx.font = `bold ${Math.max(9, 11 * cam.zoom)}px 'Courier New', monospace`;
            const textWidth = ctx.measureText(statusTxt).width;
            const badgeW = textWidth + 18 * cam.zoom;
            const badgeH = 22 * cam.zoom;

            // Fundo holográfico escuro
            ctx.fillStyle = 'rgba(3, 7, 18, 0.94)';
            ctx.beginPath();
            if (typeof (ctx as any).roundRect === 'function') {
              (ctx as any).roundRect(s.x - badgeW / 2, hudY - badgeH / 2, badgeW, badgeH, 4 * cam.zoom);
            } else {
              ctx.rect(s.x - badgeW / 2, hudY - badgeH / 2, badgeW, badgeH);
            }
            ctx.fill();

            // Borda com glow
            ctx.strokeStyle = isTripped ? '#ef4444' : isEnergized ? '#10b981' : '#38bdf8';
            ctx.lineWidth = 1.2 * cam.zoom;
            ctx.shadowColor = ctx.strokeStyle;
            ctx.shadowBlur = 8 * cam.zoom;
            ctx.stroke();
            ctx.shadowBlur = 0;

            // Ponta indicadora
            ctx.fillStyle = ctx.strokeStyle;
            ctx.beginPath();
            ctx.moveTo(s.x - 4 * cam.zoom, hudY + badgeH / 2);
            ctx.lineTo(s.x + 4 * cam.zoom, hudY + badgeH / 2);
            ctx.lineTo(s.x, hudY + badgeH / 2 + 4 * cam.zoom);
            ctx.fill();

            // Texto de telemetria
            ctx.fillStyle = '#f8fafc';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(statusTxt, s.x, hudY);
            ctx.restore();
          }
        }

        // Fio em criação
        if (simRef.current.wireStart) {
          const startPos = getNodeWorldPos(
            simRef.current.wireStart.c,
            simRef.current.wireStart.t,
            currentProj.components,
            currentProj.busbars || []
          );
          const curWorld = simRef.current.pointerWorld || { x: startPos.x, y: startPos.y + 60 };
          const targetPos: TerminalPosition = {
            x: curWorld.x,
            y: curWorld.y,
            dir: startPos.dir === 'top' ? 'bottom' : 'top',
            normId: 'cursor'
          };

          const previewPath = calculateFilletManhattanPath(startPos, targetPos, 0);
          renderCurvedWireBack(ctx, previewPath, {
            wireType: selectedWireTypeRef.current,
            gauge: selectedWireTypeRef.current === 'NU' ? 16.0 : 2.5,
            cam,
            isLive: false,
            isSelected: true,
            isOverheated: false,
            voltage: 230,
            animTick: simRef.current.time * 60,
            toScreen
          });

          renderFerruleTerminal(
            ctx,
            toScreen(startPos),
            startPos.dir || 'bottom',
            selectedWireTypeRef.current,
            selectedWireTypeRef.current === 'NU' ? 16.0 : 2.5,
            cam,
            false,
            false
          );
        }

        if (svgGroupRef.current) {
          svgGroupRef.current.setAttribute('transform', `translate(${cam.pan.x}, ${cam.pan.y}) scale(${cam.zoom})`);
        }

        // MODO TERMOGRAFIA FLIR
        if (isThermalModeRef.current) {
          ctx.save();
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

          ctx.font = 'bold 12px "Courier New", monospace';
          ctx.fillStyle = '#f97316';
          ctx.shadowColor = '#ea580c';
          ctx.shadowBlur = 6;
          ctx.fillText('[ MODO TERMOGRAFIA FLIR ATIVO ]', 20, 28);
          ctx.shadowBlur = 0;

          const scaleX = w - 42;
          const scaleY = 48;
          const scaleW = 12;
          const scaleH = 110;

          const flirGrad = ctx.createLinearGradient(0, scaleY, 0, scaleY + scaleH);
          flirGrad.addColorStop(0, '#ffffff');
          flirGrad.addColorStop(0.2, '#ef4444');
          flirGrad.addColorStop(0.5, '#f59e0b');
          flirGrad.addColorStop(0.75, '#8b5cf6');
          flirGrad.addColorStop(1, '#1e3a8a');

          ctx.fillStyle = flirGrad;
          ctx.fillRect(scaleX, scaleY, scaleW, scaleH);
          ctx.strokeStyle = '#f97316';
          ctx.lineWidth = 1;
          ctx.strokeRect(scaleX, scaleY, scaleW, scaleH);

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 8.5px monospace';
          ctx.textAlign = 'right';
          ctx.fillText('150°C', scaleX - 4, scaleY + 8);
          ctx.fillText('70°C', scaleX - 4, scaleY + scaleH * 0.5 + 3);
          ctx.fillText('20°C', scaleX - 4, scaleY + scaleH);

          ctx.restore();
        }

        // EVENTOS E ALERTAS
        if (physResult.hasDirectShort) {
          const faultKey = 'short_circuit_direct';
          if (!simRef.current.firedAlertsSet.has(faultKey)) {
            simRef.current.firedAlertsSet.add(faultKey);
            soundFX.playShortCircuitSpark();
            soundFX.playBreakerSwitch(true);
            setFaultAlert(physResult.shortCause || 'Curto-Circuito Fase-Neutro Detectado!');
            addEvent(physResult.shortCause || 'Curto-circuito detectado.', 'trip');
          }
        } else {
          simRef.current.firedAlertsSet.delete('short_circuit_direct');
          if (faultAlert && faultAlert.includes('Curto-Circuito')) {
            setFaultAlert(null);
          }
        }

        if (physResult.burnedIds && physResult.burnedIds.length > 0) {
          physResult.burnedIds.forEach(id => {
            const burnedKey = `burned_${id}`;
            if (!simRef.current.firedAlertsSet.has(burnedKey)) {
              simRef.current.firedAlertsSet.add(burnedKey);
              soundFX.playShortCircuitSpark();
              const comp = currentProj.components.find(c => c.id === id);
              const compLabel = comp?.label || comp?.code || id;
              const reason = comp?.state?.tripReason || 'Destruição por sobrecorrente / fusão';
              setFaultAlert(`ALERTA: ${compLabel} QUEIMOU! (${reason})`);
              addEvent(`${compLabel} QUEIMADO: ${reason}`, 'trip');
            }
          });
        }

        if (physResult.trippedIds && physResult.trippedIds.length > 0) {
          physResult.trippedIds.forEach(id => {
            const tripKey = `tripped_${id}`;
            if (!simRef.current.firedAlertsSet.has(tripKey)) {
              simRef.current.firedAlertsSet.add(tripKey);
              soundFX.playBreakerSwitch(true);
              const comp = currentProj.components.find(c => c.id === id);
              const compLabel = comp?.label || comp?.code || id;
              const reason = comp?.state?.tripReason === 'MAGNETIC_SHORT_CIRCUIT'
                ? (comp?.state?.tripDetails || 'Disparo Magnético Instantâneo (Curto-Circuito)')
                : (comp?.state?.tripReason || 'Disparo de proteção IEC 60898');
              addEvent(`${compLabel} desarmou: ${reason}`, 'trip');
            }
          });
        }

        const kmComp = currentProj.components.find(c => c.code === 'CONTACTOR');
        const kmEnergized = Boolean(kmComp?.state?.energized);
        if (kmEnergized !== simRef.current.lastContactorState) {
          soundFX.playContactorThump(kmEnergized);
          simRef.current.lastContactorState = kmEnergized;
        }

        const motorComp = currentProj.components.find(c => ['M3PH', 'M1PH', 'M3PH_6L', 'PUMP'].includes(c.code));
        if (motorComp && motorComp.state) {
          const targetRpm = motorComp.state.running ? Number(motorComp.state.rpm || (motorComp.code === 'PUMP' ? 2880 : 2920)) : 0;
          if (targetRpm > (simRef.current.motorRpm || 0)) {
            simRef.current.motorRpm = Math.min(targetRpm, (simRef.current.motorRpm || 0) + 120);
          } else {
            simRef.current.motorRpm = Math.max(0, (simRef.current.motorRpm || 0) - 75);
          }

          if (simRef.current.motorRpm > 0) {
            soundFX.updateMotorSound(true, simRef.current.motorRpm / 2920, motorComp.code.includes('3PH') || motorComp.code === 'PUMP');
          } else {
            soundFX.stopMotorSound();
          }
        }

        setMeterV(physResult.mainVoltageRMS);
        setMeterA(physResult.totalLineCurrent);
        setMeterW(Math.round(physResult.totalActivePower));
        setMeterHz(physResult.activeFrequency);
        setMeterPF(physResult.activePF);

        if (isSimRunning) {
          simRef.current.scopeHistory.push({
            t: simRef.current.time,
            v: physResult.mainVoltageRMS * Math.sin(2 * Math.PI * (physResult.activeFrequency || 50) * simRef.current.time),
            i: physResult.totalLineCurrent * Math.sin(2 * Math.PI * (physResult.activeFrequency || 50) * simRef.current.time - 0.5)
          });
          if (simRef.current.scopeHistory.length > 400) {
            simRef.current.scopeHistory.shift();
          }
        }

        if (showScopeRef.current && scopeCanvasRef.current && !isDraggingRef.current) {
          const sCanvas = scopeCanvasRef.current;
          const sCtx = sCanvas.getContext('2d');
          if (sCtx) {
            const sw = sCanvas.width;
            const sh = sCanvas.height;
            sCtx.fillStyle = '#040d1a';
            sCtx.fillRect(0, 0, sw, sh);

            sCtx.strokeStyle = 'rgba(56, 189, 248, 0.15)';
            sCtx.lineWidth = 1;
            for (let x = 0; x < sw; x += 30) {
              sCtx.beginPath();
              sCtx.moveTo(x, 0);
              sCtx.lineTo(x, sh);
              sCtx.stroke();
            }
            for (let y = 0; y < sh; y += 25) {
              sCtx.beginPath();
              sCtx.moveTo(0, y);
              sCtx.lineTo(sw, y);
              sCtx.stroke();
            }

            sCtx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
            sCtx.setLineDash([2, 4]);
            sCtx.beginPath();
            sCtx.moveTo(0, sh / 2);
            sCtx.lineTo(sw, sh / 2);
            sCtx.stroke();
            sCtx.setLineDash([]);

            const hist = simRef.current.scopeHistory;
            const n = hist.length;

            const curChannel = scopeChannelRef.current;
            const curVDiv = scopeVoltsDivRef.current;

            if ((curChannel === 'CH1' || curChannel === 'DUAL') && n > 1) {
              sCtx.strokeStyle = '#38bdf8';
              sCtx.lineWidth = 2;
              sCtx.beginPath();
              const vScale = (sh / 2.2) / (curVDiv * 4);
              for (let i = 0; i < n; i++) {
                const px = (i / Math.max(1, n - 1)) * sw;
                const py = sh / 2 - hist[i].v * vScale;
                if (i === 0) sCtx.moveTo(px, py);
                else sCtx.lineTo(px, py);
              }
              sCtx.stroke();
            }

            if ((curChannel === 'CH2' || curChannel === 'DUAL') && n > 1) {
              sCtx.strokeStyle = '#f59e0b';
              sCtx.lineWidth = 2;
              sCtx.beginPath();
              const iScale = (sh / 2.2) / 25;
              for (let i = 0; i < n; i++) {
                const px = (i / Math.max(1, n - 1)) * sw;
                const py = sh / 2 - hist[i].i * iScale;
                if (i === 0) sCtx.moveTo(px, py);
                else sCtx.lineTo(px, py);
              }
              sCtx.stroke();
            }
          }
        }

        const currentLiveSummary =
          currentProj.wires.map((w: any) => (w.live ? '1' : '0')).join('') +
          currentProj.components.map((c: any) => (c.state?.energized ? '1' : '0')).join('');
        if (currentLiveSummary !== lastLiveSummaryRef.current) {
          lastLiveSummaryRef.current = currentLiveSummary;
          setSimVersion(v => v + 1);
        }

        ctx.restore();
      } catch (loopErr) {
        console.error('Erro no loop do simulador:', loopErr);
        try { ctx.restore(); } catch {}
      } finally {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    animationFrameId = requestAnimationFrame(render);
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isOpen, terminalPos]);

  const getHitWireId = (
    worldX: number,
    worldY: number,
    wires: any[],
    components: any[],
    busbars: any[],
    zoom: number
  ): string | null => {
    for (const comp of components) {
      const rad = (-comp.rot * Math.PI) / 180;
      const dx = worldX - comp.x;
      const dy = worldY - comp.y;
      const rx = dx * Math.cos(rad) - dy * Math.sin(rad);
      const ry = dx * Math.sin(rad) + dy * Math.cos(rad);
      const halfW = (comp.w || 90) / 2 + 10;
      const halfH = (comp.h || 75) / 2 + 14;
      if (Math.abs(rx) <= halfW && Math.abs(ry) <= halfH) {
        return null;
      }
    }

    for (const bb of busbars) {
      const isH = bb.orientation === 'horizontal';
      const halfL = ((bb.length || 600) + 12) / 2;
      const halfH = ((bb.type === 'din' ? 35 : 16) + 12) / 2;
      const rx = isH ? halfL : halfH;
      const ry = isH ? halfH : halfL;
      if (Math.abs(worldX - bb.x) <= rx && Math.abs(worldY - bb.y) <= ry) {
        return null;
      }
    }

    for (const comp of components) {
      const d = getComponentDef(comp.code);
      for (const t of d.terminals) {
        const tp = terminalPos(comp, t[0]);
        if (Math.hypot(tp.x - worldX, tp.y - worldY) < Math.max(16, 22 / zoom)) {
          return null;
        }
      }
    }

    const threshold = 14 / Math.max(0.2, zoom);
    for (let i = wires.length - 1; i >= 0; i--) {
      const wire = wires[i];
      const posA = getNodeWorldPos(wire.a?.c, wire.a?.t, components, busbars);
      const posB = getNodeWorldPos(wire.b?.c, wire.b?.t, components, busbars);
      const fillet = calculateFilletManhattanPath(posA, posB, i, wire.waypoints);
      const pts = fillet.points;
      for (let j = 0; j < pts.length - 1; j++) {
        const p1 = pts[j];
        const p2 = pts[j + 1];
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const lenSq = dx * dx + dy * dy;
        let dist = 0;
        if (lenSq === 0) {
          dist = Math.hypot(worldX - p1.x, worldY - p1.y);
        } else {
          const t = Math.max(0, Math.min(1, ((worldX - p1.x) * dx + (worldY - p1.y) * dy) / lenSq));
          const projX = p1.x + t * dx;
          const projY = p1.y + t * dy;
          dist = Math.hypot(worldX - projX, worldY - projY);
        }
        if (dist <= threshold) {
          return wire.id;
        }
      }
    }
    return null;
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      canvas.setPointerCapture(e.pointerId);
    } catch {}

    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    simRef.current.touchMap.set(e.pointerId, { x: px, y: py, clientX: e.clientX, clientY: e.clientY });

    // Cancela imediatamente qualquer temporizador anterior
    if (simRef.current.longPressTimer) {
      clearTimeout(simRef.current.longPressTimer);
      simRef.current.longPressTimer = null;
    }
    simRef.current.isLongPressTriggered = false;

    // 1. PINCH-TO-ZOOM (2 DEDOS NO CELULAR)
    if (simRef.current.touchMap.size === 2) {
      setShowProps(false);
      simRef.current.drag = null;
      const touches = Array.from(simRef.current.touchMap.values());
      const dist = Math.hypot(touches[1].clientX - touches[0].clientX, touches[1].clientY - touches[0].clientY);
      simRef.current.pinch = {
        initialDist: dist,
        initialMid: {
          x: (touches[0].x + touches[1].x) / 2,
          y: (touches[0].y + touches[1].y) / 2
        },
        startZoom: cameraRef.current.zoom,
        startPan: { ...cameraRef.current.pan }
      };
      return;
    }

    const cam = cameraRef.current;
    const worldX = (px - cam.pan.x) / cam.zoom;
    const worldY = (py - cam.pan.y) / cam.zoom;

    simRef.current.drag = {
      id: e.pointerId,
      startX: worldX,
      startY: worldY,
      screenStartX: e.clientX,
      screenStartY: e.clientY,
      mode: 'pan',
      mouse: { x: worldX, y: worldY },
      compId: null
    };

    const terminalHitRadius = Math.max(16, 22 / cam.zoom);

    // 2. Bornes de Barramento
    const nearestBusbarTerm = findNearestBusbarTerminal(
      projectRef.current.busbars || [],
      { x: worldX, y: worldY },
      terminalHitRadius
    );

    if (nearestBusbarTerm && (activeTool === 'wire' || simRef.current.wireStart !== null || e.shiftKey)) {
      setShowProps(false);
      if (!simRef.current.wireStart) {
        simRef.current.wireStart = { c: nearestBusbarTerm.busbar.id, t: nearestBusbarTerm.terminal.id };
        showToast(`Iniciado no ${nearestBusbarTerm.busbar.type.toUpperCase()}. Toque no destino.`);
      } else {
        const startC = simRef.current.wireStart.c;
        const startT = simRef.current.wireStart.t;
        if (startC === nearestBusbarTerm.busbar.id && startT === nearestBusbarTerm.terminal.id) {
          simRef.current.wireStart = null;
          showToast('Conexão cancelada');
          return;
        }
        pushHistory();
        const newWire = {
          id: `W_${Math.random().toString(36).substring(2, 7)}`,
          a: { c: startC, t: startT },
          b: { c: nearestBusbarTerm.busbar.id, t: nearestBusbarTerm.terminal.id },
          type: selectedWireType,
          gauge: selectedWireType === 'NU' ? 16.0 : 2.5,
          length: 3.0,
          live: isRunning
        };
        const updated = {
          ...projectRef.current,
          wires: [...projectRef.current.wires, newWire],
          updated: Date.now()
        };
        projectRef.current = updated;
        setProject(updated);
        soundFX.playClick();
        showToast('Condutor conectado');
        simRef.current.wireStart = null;
      }
      return;
    }

    // 3. Bornes de Dispositivos
    for (const c of projectRef.current.components) {
      const d = getComponentDef(c.code);
      for (const t of d.terminals) {
        const tp = terminalPos(c, t[0]);
        const dist = Math.hypot(tp.x - worldX, tp.y - worldY);
        if (dist < terminalHitRadius) {
          if (activeTool === 'wire' || simRef.current.wireStart !== null || e.shiftKey) {
            setShowProps(false);
            if (!simRef.current.wireStart) {
              simRef.current.wireStart = { c: c.id, t: t[0] };
              showToast(`Iniciado em ${c.label || d.name} [${t[0]}]. Toque no destino.`);
            } else {
              const startC = simRef.current.wireStart.c;
              const startT = simRef.current.wireStart.t;
              if (startC === c.id && startT === t[0]) {
                simRef.current.wireStart = null;
                showToast('Conexão cancelada');
                return;
              }
              pushHistory();
              const newWire = {
                id: `W_${Math.random().toString(36).substring(2, 7)}`,
                a: { c: startC, t: startT },
                b: { c: c.id, t: t[0] },
                type: selectedWireType,
                gauge: selectedWireType === 'NU' ? 16.0 : 2.5,
                length: 3.0,
                live: isRunning
              };
              const updated = {
                ...projectRef.current,
                wires: [...projectRef.current.wires, newWire],
                updated: Date.now()
              };
              projectRef.current = updated;
              setProject(updated);
              soundFX.playClick();
              showToast('Condutor conectado');
              simRef.current.wireStart = null;
            }
          } else {
            setShowProps(false);
            setSelectedCompId(c.id);
            setSelectedWireId(null);
            setSelectedBusbarId(null);
            simRef.current.drag.mode = 'comp';
            simRef.current.drag.compId = c.id;
            simRef.current.drag.offsetX = worldX - c.x;
            simRef.current.drag.offsetY = worldY - c.y;

            const targetId = c.id;
            simRef.current.longPressTimer = setTimeout(() => {
              // TRAVA DE SEGURANÇA: só abre se o dedo AINDA estiver segurando o componente
              if (simRef.current.drag && simRef.current.drag.compId === targetId) {
                simRef.current.isLongPressTriggered = true;
                setShowProps(true);
                soundFX?.playClick?.();
                showToast('Propriedades abertas');
              }
            }, 550);
          }
          return;
        }
      }
    }

    // 4. Corpo do Dispositivo
    for (let i = projectRef.current.components.length - 1; i >= 0; i--) {
      const c = projectRef.current.components[i];
      const rad = (-c.rot * Math.PI) / 180;
      const dx = worldX - c.x;
      const dy = worldY - c.y;
      const rx = dx * Math.cos(rad) - dy * Math.sin(rad);
      const ry = dx * Math.sin(rad) + dy * Math.cos(rad);

      const w = (c.w || 90) + 8;
      const h = (c.h || 75) + 8;

      if (Math.abs(rx) <= w / 2 && Math.abs(ry) <= h / 2) {
        setShowProps(false);
        setSelectedCompId(c.id);
        setSelectedWireId(null);
        setSelectedBusbarId(null);
        simRef.current.drag.mode = 'comp';
        simRef.current.drag.compId = c.id;
        simRef.current.drag.offsetX = worldX - c.x;
        simRef.current.drag.offsetY = worldY - c.y;
        simRef.current.drag.clickRelX = rx;

        const targetId = c.id;
        simRef.current.longPressTimer = setTimeout(() => {
          // TRAVA DE SEGURANÇA: só abre se o dedo AINDA estiver segurando o componente
          if (simRef.current.drag && simRef.current.drag.compId === targetId) {
            simRef.current.isLongPressTriggered = true;
            setShowProps(true);
            soundFX?.playClick?.();
            showToast('Propriedades abertas');
          }
        }, 550);

        const d = getComponentDef(c.code);
        if (Boolean(d.momentary) || d.kind === 'push' || c.code === 'PBNO' || c.code === 'PBNC') {
          triggerComponentCommand(c.id, 'pulse');
        }
        return;
      }
    }

    // 5. Barramento Elétrico ou Trilho DIN
    for (let i = (projectRef.current.busbars || []).length - 1; i >= 0; i--) {
      const b = projectRef.current.busbars[i];
      const isH = b.orientation === 'horizontal';
      const halfL = ((b.length || 600) + 12) / 2;
      const halfH = ((b.type === 'din' ? 35 : 16) + 12) / 2;
      const rx = isH ? halfL : halfH;
      const ry = isH ? halfH : halfL;

      if (Math.abs(worldX - b.x) <= rx && Math.abs(worldY - b.y) <= ry) {
        setShowProps(false);
        setSelectedBusbarId(b.id);
        setSelectedCompId(null);
        setSelectedWireId(null);
        simRef.current.drag.mode = 'busbar';
        simRef.current.drag.busbarId = b.id;
        simRef.current.drag.offsetX = worldX - b.x;
        simRef.current.drag.offsetY = worldY - b.y;
        soundFX?.playClick?.();
        return;
      }
    }

    // 6. Seleção de Condutor
    if (simRef.current.wireStart === null) {
      const hitWireId = getHitWireId(
        worldX,
        worldY,
        projectRef.current.wires,
        projectRef.current.components,
        projectRef.current.busbars || [],
        cam.zoom
      );
      if (hitWireId) {
        setShowProps(false);
        setSelectedWireId(hitWireId);
        setSelectedCompId(null);
        setSelectedBusbarId(null);
        soundFX?.playClick?.();
        simRef.current.drag.mode = 'pan';
        return;
      }
    }

    // 7. Clique no Vazio (fecha propriedades e desmarca tudo)
    setShowProps(false);
    setSelectedCompId(null);
    setSelectedWireId(null);
    setSelectedBusbarId(null);
    simRef.current.drag.mode = 'pan';
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    simRef.current.touchMap.set(e.pointerId, { x: px, y: py, clientX: e.clientX, clientY: e.clientY });

    // EXECUÇÃO DO PINCH-TO-ZOOM COM 2 DEDOS NO CELULAR
    if (simRef.current.touchMap.size === 2) {
      const touches = Array.from(simRef.current.touchMap.values());
      const currentDist = Math.hypot(touches[1].clientX - touches[0].clientX, touches[1].clientY - touches[0].clientY);
      const currentMid = {
        x: (touches[0].x + touches[1].x) / 2,
        y: (touches[0].y + touches[1].y) / 2
      };

      if (!simRef.current.pinch) {
        simRef.current.pinch = {
          initialDist: currentDist,
          initialMid: currentMid,
          startZoom: cameraRef.current.zoom,
          startPan: { ...cameraRef.current.pan }
        };
      } else {
        const pinch = simRef.current.pinch;
        const scale = currentDist / Math.max(10, pinch.initialDist);
        const newZoom = Math.max(0.12, Math.min(5.0, pinch.startZoom * scale));

        const midX = pinch.initialMid.x;
        const midY = pinch.initialMid.y;
        cameraRef.current.zoom = newZoom;
        cameraRef.current.pan.x = midX - (midX - pinch.startPan.x) * (newZoom / pinch.startZoom) + (currentMid.x - pinch.initialMid.x);
        cameraRef.current.pan.y = midY - (midY - pinch.startPan.y) * (newZoom / pinch.startZoom) + (currentMid.y - pinch.initialMid.y);

        if (svgGroupRef.current) {
          svgGroupRef.current.setAttribute('transform', `translate(${cameraRef.current.pan.x}, ${cameraRef.current.pan.y}) scale(${cameraRef.current.zoom})`);
        }
      }
      return;
    }

    const cam = cameraRef.current;
    const worldX = (px - cam.pan.x) / cam.zoom;
    const worldY = (py - cam.pan.y) / cam.zoom;
    simRef.current.pointerWorld = { x: worldX, y: worldY };

    const drag = simRef.current.drag;
    if (!drag) return;

    drag.mouse = { x: worldX, y: worldY };

    // Se o dedo moveu mais de 8 pixels, cancela o temporizador de pressão longa
    const moveDist = Math.hypot(e.clientX - drag.screenStartX, e.clientY - drag.screenStartY);
    if (moveDist > 8 && simRef.current.longPressTimer) {
      clearTimeout(simRef.current.longPressTimer);
      simRef.current.longPressTimer = null;
    }

    if (drag.mode === 'comp' && drag.compId) {
      if (!isDraggingRef.current) {
        isDraggingRef.current = true;
        setIsCadDragging(true);
      }
      hasPendingDragChangesRef.current = true;

      const compId = drag.compId;
      const offsetX = drag.offsetX ?? 0;
      const offsetY = drag.offsetY ?? 0;
      const grid = cam.grid || 20;
      let targetX = Math.round((worldX - offsetX) / grid) * grid;
      let targetY = Math.round((worldY - offsetY) / grid) * grid;

      const currentComp = projectRef.current.components.find((c: any) => c.id === compId);
      if (currentComp) {
        const snapTolerance = Math.max(16, 26 / cam.zoom);
        const snapped = snapComponentToBusbars(currentComp, targetX, targetY, projectRef.current.busbars || [], snapTolerance);
        currentComp.x = snapped.x;
        currentComp.y = snapped.y;
      }
    } else if (drag.mode === 'busbar' && drag.busbarId) {
      if (!isDraggingRef.current) {
        isDraggingRef.current = true;
        setIsCadDragging(true);
      }
      hasPendingDragChangesRef.current = true;

      const busbarId = drag.busbarId;
      const offsetX = drag.offsetX ?? 0;
      const offsetY = drag.offsetY ?? 0;
      const grid = cam.grid || 20;
      const targetX = Math.round((worldX - offsetX) / grid) * grid;
      const targetY = Math.round((worldY - offsetY) / grid) * grid;

      const bb = (projectRef.current.busbars || []).find((b: any) => b.id === busbarId);
      if (bb) {
        bb.x = targetX;
        bb.y = targetY;
        bb.terminals = generateBusbarTerminals(bb.id, bb.type, targetX, targetY, bb.length, bb.orientation);
      }
    } else if (drag.mode === 'pan') {
      cam.pan.x += e.clientX - drag.screenStartX;
      cam.pan.y += e.clientY - drag.screenStartY;
      drag.screenStartX = e.clientX;
      drag.screenStartY = e.clientY;
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    simRef.current.touchMap.delete(e.pointerId);

    if (simRef.current.touchMap.size < 2) {
      simRef.current.pinch = null;
    }

    // Cancela imediatamente o temporizador caso o usuário solte o dedo antes dos 550ms
    if (simRef.current.longPressTimer) {
      clearTimeout(simRef.current.longPressTimer);
      simRef.current.longPressTimer = null;
    }

    const canvas = canvasRef.current;
    if (canvas) {
      try {
        if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId);
      } catch {}
    }

    const drag = simRef.current.drag;
    const wasLongPress = simRef.current.isLongPressTriggered;

    // Se NÃO foi pressão longa (ou seja, foi toque rápido de clique), garante que a janela NUNCA abra
    if (!wasLongPress) {
      setShowProps(false);
    }

    if (!drag) {
      simRef.current.isLongPressTriggered = false;
      return;
    }

    const moveDist = Math.hypot(e.clientX - drag.screenStartX, e.clientY - drag.screenStartY);

    if (hasPendingDragChangesRef.current) {
      hasPendingDragChangesRef.current = false;
      pushHistory();
      setProject({
        ...projectRef.current,
        components: [...projectRef.current.components],
        busbars: [...(projectRef.current.busbars || [])],
        updated: Date.now()
      });
    }

    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      setIsCadDragging(false);
    }

    // SE FOI UM TOQUE RÁPIDO (< 550ms e sem arrastar):
    // Manobra o dispositivo normalmente sem abrir propriedades
    if (!wasLongPress && moveDist < 8 && drag.mode === 'comp' && drag.compId) {
      const c = projectRef.current.components.find((item: any) => item.id === drag.compId);
      if (c) {
        const d = getComponentDef(c.code);
        if (
          c.code === 'THREE_WAY' ||
          c.code === 'FOUR_WAY' ||
          c.code === 'SW' ||
          c.code === 'SW2' ||
          c.code === 'SW_DOUBLE' ||
          c.code === 'SEL' ||
          c.code === 'ESTOP' ||
          c.code === 'LIMIT' ||
          c.code === 'FLOAT' ||
          c.code === 'DIMMER' ||
          c.code === 'GEN_DIESEL' ||
          c.code === 'ATS_SWITCH' ||
          c.code === 'MTS_SWITCH' ||
          c.code === 'PV_PANEL' ||
          c.code === 'PHOTOCELL' ||
          c.code === 'PIR_SENSOR' ||
          c.code === 'SPD' ||
          c.code === 'SPD3' ||
          c.code === 'PUMP' ||
          d.kind === 'breaker' ||
          d.kind === 'breaker_1p' ||
          d.kind === 'breaker2' ||
          d.kind === 'breaker3' ||
          d.kind === 'motor_breaker' ||
          d.kind === 'mccb' ||
          d.kind === 'switch' ||
          d.kind === 'switch_double' ||
          d.kind === 'selector'
        ) {
          triggerComponentCommand(c.id, 'toggle', drag.clickRelX || 0);
        } else if (d.kind === 'rcd' || d.kind === 'rcd4' || d.kind === 'rcbo') {
          triggerComponentCommand(c.id, 'test_rcd');
        }
      }
    }

    simRef.current.isLongPressTriggered = false;
    simRef.current.drag = null;
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const cam = cameraRef.current;
    const factor = e.deltaY < 0 ? 1.15 : 0.85;
    const newZoom = Math.max(0.1, Math.min(5.0, cam.zoom * factor));

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    cam.pan.x = mouseX - (mouseX - cam.pan.x) * (newZoom / cam.zoom);
    cam.pan.y = mouseY - (mouseY - cam.pan.y) * (newZoom / cam.zoom);
    cam.zoom = newZoom;

    if (svgGroupRef.current) {
      svgGroupRef.current.setAttribute('transform', `translate(${cam.pan.x}, ${cam.pan.y}) scale(${cam.zoom})`);
    }
  };

  const selectedComponent = project.components.find((c: any) => c.id === selectedCompId);
  const selectedWire = project.wires.find((w: any) => w.id === selectedWireId);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] bg-[#050A14] flex flex-col justify-between overflow-hidden select-none text-slate-200 font-sans" style={{ touchAction: 'none' }}>
      {/* 1. BARRA SUPERIOR (HEADER) */}
      <header className="h-14 landscape:h-10 px-3 sm:px-4 bg-[#0B132B] border-b border-blue-900/50 flex items-center justify-between gap-2 shrink-0 z-30 shadow-xl">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black shadow-md shadow-blue-900/40">
            ⚡
          </div>
          <div>
            <h1 className="text-xs sm:text-sm font-black text-white tracking-wide flex items-center gap-1.5">
              <span>TécnicaMZ Pro</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 font-mono border border-blue-800">
                CAD V25
              </span>
            </h1>
            <p className="text-[10px] text-slate-400 hidden md:block">
              {project.name} • Simulação Nodal MNA Real & IEC 60947
            </p>
          </div>
        </div>

        {/* Comandos Centrais do Header */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          <button
            type="button"
            onClick={() => {
              const next = !isRunning;
              setIsRunning(next);
              if (next) {
                soundFX.playSuccess();
                addEvent('Simulação física iniciada (RUN).', 'info');
                showToast('Simulador energizado');
              } else {
                soundFX.playClick();
                addEvent('Simulação parada (STOP). Cargas desenergizadas.', 'warn');
                showToast('Simulador parado');
              }
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-md ${
              isRunning ? 'bg-rose-600 text-white animate-pulse' : 'bg-emerald-600 text-white'
            }`}
          >
            {isRunning ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{isRunning ? 'Parar' : 'Simular'}</span>
          </button>

          <div className="h-6 w-px bg-slate-800 mx-1 hidden sm:block" />

          <button
            type="button"
            onClick={() => setActiveTool('select')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
              activeTool === 'select' ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-300'
            }`}
          >
            <span>↖</span>
            <span className="hidden sm:inline">Mover</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTool('wire');
              showToast('Modo Condutor: selecione os bornes de conexão');
            }}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
              activeTool === 'wire' ? 'bg-amber-600 text-white' : 'bg-slate-900 text-slate-300'
            }`}
          >
            <span>⌁</span>
            <span className="hidden sm:inline">Condutor</span>
          </button>

          <select
            value={selectedWireType}
            onChange={e => setSelectedWireType(e.target.value)}
            className="px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-[11px] font-bold text-slate-200 outline-none cursor-pointer"
          >
            <option value="L1">L1 (Castanho)</option>
            <option value="L2">L2 (Preto)</option>
            <option value="L3">L3 (Cinza)</option>
            <option value="N">N (Neutro)</option>
            <option value="PE">PE (Terra Isolado)</option>
            <option value="NU">NU (Cobre Nu / Aterramento)</option>
            <option value="24+">+24V DC / +PV</option>
            <option value="24-">0V DC / -PV</option>
            <option value="CTRL">Comando (Amarelo)</option>
          </select>

          <div className="h-6 w-px bg-slate-800 mx-1 hidden sm:block" />

          <button
            type="button"
            onClick={() => loadPreset('motor')}
            className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold border border-slate-800 transition cursor-pointer hidden md:flex items-center gap-1"
          >
            <span>⚡ Partida 3F</span>
          </button>

          <button
            type="button"
            onClick={() => loadPreset('four_way')}
            className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold border border-slate-800 transition cursor-pointer hidden md:flex items-center gap-1"
          >
            <span>💡 Four-Way</span>
          </button>

          <button
            type="button"
            onClick={() => loadPreset('qgd')}
            className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold border border-slate-800 transition cursor-pointer hidden md:flex items-center gap-1"
          >
            <span>🛡️ QGD DR</span>
          </button>

          <button
            type="button"
            onClick={() => loadPreset('solar')}
            className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-300 text-xs font-bold border border-slate-800 transition cursor-pointer hidden md:flex items-center gap-1"
          >
            <span>☀️ Solar FV</span>
          </button>

          <div className="h-6 w-px bg-slate-800 mx-1 hidden sm:block" />

          <button
            type="button"
            onClick={() => {
              const next = !isThermalMode;
              setIsThermalMode(next);
              isThermalModeRef.current = next;
              showToast(next ? '📷 Modo Termografia FLIR ativado' : 'Termografia desativada');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
              isThermalMode
                ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white border-amber-400 shadow-md shadow-amber-900/50 animate-pulse'
                : 'bg-slate-900 hover:bg-slate-800 text-amber-300 border-amber-500/30'
            }`}
            title="Alternar Câmera Térmica FLIR"
          >
            <Thermometer className="w-3.5 h-3.5 text-amber-300" />
            <span>📷 Termografia</span>
          </button>
        </div>

        {/* Ações da Direita */}
        <div className="flex items-center gap-1.5">
          {/* BOTÃO PRÓPRIO DE ROTAÇÃO PARA MODO HORIZONTAL (LANDSCAPE) */}
          <button
            type="button"
            onClick={handleToggleOrientation}
            className={`px-2.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border cursor-pointer ${
              isLandscape
                ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-900/40'
                : 'bg-slate-900 hover:bg-slate-800 text-amber-300 border-amber-500/30'
            }`}
            title="Alternar Modo Horizontal / Vertical (Girar Tela)"
          >
            <RotateCw className={`w-3.5 h-3.5 transition-transform duration-300 ${isLandscape ? 'rotate-90 text-white' : 'text-amber-300'}`} />
            <span className="text-[11px] font-bold">{isLandscape ? 'Vertical' : 'Girar'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsDiagnosticPanelOpen(true)}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border cursor-pointer ${
              diagnosticState.isSpeaking ? 'bg-purple-600/30 text-purple-300 animate-pulse' : 'bg-slate-900 text-indigo-400 border-indigo-500/30'
            }`}
          >
            {diagnosticState.isSpeaking ? <Radio className="w-3.5 h-3.5 animate-spin" /> : <Volume2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{diagnosticState.isSpeaking ? 'Voz Ativa...' : 'Diagnósticos'}</span>
          </button>

          <button
            type="button"
            onClick={() => simulatorDiagnostics.toggleMute()}
            className={`p-2 rounded-xl text-xs font-bold transition border cursor-pointer ${
              diagnosticState.isMuted ? 'bg-rose-500/20 text-rose-400 border-rose-500/40' : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}
          >
            {diagnosticState.isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={() => {
              generateCadProjectPDF(projectRef.current, { authorName: 'Eletro-Jr • Técnico Responsável' });
              showToast('PDF Técnico gerado');
            }}
            className="px-2.5 py-2 rounded-xl bg-slate-900 text-sky-400 border border-slate-800 text-xs font-bold flex items-center gap-1 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">PDF</span>
          </button>

          <button type="button" onClick={handleExportImage} className="p-2 rounded-xl bg-slate-900 text-slate-300 border border-slate-800 cursor-pointer">
            <ImageIcon className="w-4 h-4" />
          </button>

          <button type="button" onClick={handleExportJSON} className="p-2 rounded-xl bg-slate-900 text-slate-300 border border-slate-800 hidden sm:flex cursor-pointer">
            <Download className="w-4 h-4" />
          </button>

          <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 rounded-xl bg-slate-900 text-slate-300 border border-slate-800 hidden sm:flex cursor-pointer">
            <Upload className="w-4 h-4" />
          </button>
          <input ref={fileInputRef} type="file" accept="application/json" onChange={handleImportJSON} className="hidden" />

          <button type="button" onClick={onClose} className="p-2 rounded-xl bg-slate-900 hover:bg-rose-900 text-slate-400 hover:text-white border border-slate-800 ml-1 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. ÁREA DE TRABALHO DO DIAGRAMA */}
      <div className="relative flex-1 w-full min-h-0 overflow-hidden touch-none select-none">
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onWheel={handleWheel}
          className="absolute inset-0 w-full h-full touch-none cursor-crosshair"
          style={{ willChange: 'transform' }}
        />

        {/* CAMADA SVG PASSIVA */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
          <g ref={svgGroupRef} transform={`translate(${cameraRef.current.pan.x}, ${cameraRef.current.pan.y}) scale(${cameraRef.current.zoom})`} style={{ pointerEvents: 'none' }}>
            {(project.wires || []).map((wire: any, wireIdx: number) => {
              if (wire.id !== selectedWireId) return null;
              const posA = getNodeWorldPos(wire.a?.c, wire.a?.t, project.components, project.busbars || []);
              const posB = getNodeWorldPos(wire.b?.c, wire.b?.t, project.components, project.busbars || []);
              const fillet = calculateFilletManhattanPath(posA, posB, wireIdx, wire.waypoints);
              const dStr = getFilletSvgPathString(fillet.points, fillet.radius);

              return (
                <path
                  key={`sel_${wire.id || wireIdx}`}
                  d={dStr}
                  stroke="#38bdf8"
                  strokeWidth="10"
                  strokeOpacity="0.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  style={{ pointerEvents: 'none' }}
                />
              );
            })}
          </g>
        </svg>

        <div
          ref={ghostRef}
          className="fixed top-0 left-0 pointer-events-none z-50 hidden opacity-60 rounded-lg border border-blue-400 bg-blue-900/90 items-center justify-center text-white"
          style={{ width: 32, height: 32 }}
        >
          <span ref={ghostTextRef} className="text-[9px] font-black font-mono text-blue-200">CAD</span>
        </div>

        {isThermalMode && (
          <div className="absolute top-4 left-4 z-40 px-3.5 py-1.5 rounded-xl bg-orange-950/90 border border-orange-500/80 text-orange-300 text-xs font-mono font-black shadow-2xl flex items-center gap-2 backdrop-blur-md animate-pulse">
            <Thermometer className="w-4 h-4 text-amber-400" />
            <span>[ MODO TERMOGRAFIA FLIR ATIVO ]</span>
          </div>
        )}

        {faultAlert && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 px-4 py-2 rounded-xl bg-rose-950/90 border border-rose-600 text-rose-200 text-xs font-bold shadow-2xl flex items-center gap-2 animate-bounce">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>{faultAlert}</span>
          </div>
        )}

        {toastMessage && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 px-4 py-2 rounded-xl bg-slate-900/90 border border-blue-500/40 text-blue-200 text-xs font-black shadow-2xl backdrop-blur-md">
            {toastMessage}
          </div>
        )}

        {/* JANELA FLUTUANTE DE EDIÇÃO DO CONDUTOR SELECIONADO */}
        {selectedWire && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 px-3 py-2 rounded-2xl bg-[#091226]/95 border border-blue-500/60 shadow-2xl backdrop-blur-xl flex items-center gap-2 text-xs animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-1.5 pr-2 border-r border-slate-700 font-mono text-slate-300 font-bold">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: WIRE_NORM_COLORS[selectedWire.type]?.base || '#f59e0b' }} />
              <span>{selectedWire.id}</span>
              {selectedWire.current !== undefined && (
                <span className="text-emerald-400 text-[10px]">
                  ({Number(selectedWire.current) < 1.0 && Number(selectedWire.current) > 0
                    ? `${(Number(selectedWire.current) * 1000).toFixed(0)}mA`
                    : `${Number(selectedWire.current).toFixed(2)}A`})
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              {(['L1', 'L2', 'L3', 'N', 'PE', 'NU', 'CTRL'] as const).map(wType => {
                const isActive = (selectedWire.type || 'L1') === wType;
                const styleNorm = WIRE_NORM_COLORS[wType];
                return (
                  <button
                    key={wType}
                    type="button"
                    title={styleNorm?.name || wType}
                    onClick={() => updateSelectedWire({ type: wType })}
                    className={`px-2 py-1 rounded-lg font-black text-[10px] transition cursor-pointer border ${
                      isActive
                        ? 'bg-blue-600 text-white border-blue-300 shadow-md shadow-blue-900/50'
                        : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    {wType}
                  </button>
                );
              })}
            </div>

            <div className="h-5 w-px bg-slate-700 mx-0.5" />

            <div className="flex items-center gap-1">
              <Gauge className="w-3.5 h-3.5 text-amber-400" />
              <select
                value={selectedWire.gauge || 2.5}
                onChange={e => updateSelectedWire({ gauge: Number(e.target.value) })}
                className="px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-[11px] font-bold text-amber-300 outline-none cursor-pointer"
              >
                {AVAILABLE_GAUGES.map(g => (
                  <option key={g} value={g}>
                    {g} mm² ({GAUGE_AMPACITY[g] || 21}A)
                  </option>
                ))}
              </select>
            </div>

            <div className="h-5 w-px bg-slate-700 mx-0.5" />

            <button
              type="button"
              onClick={() => deleteWire(selectedWire.id)}
              className="p-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800 transition cursor-pointer"
              title="Excluir Condutor"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => setSelectedWireId(null)}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition cursor-pointer"
              title="Fechar"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* PAINEL LATERAL: BIBLIOTECA EXPANSIVA */}
        {showLibrary && (
          <div className="absolute left-3 top-3 bottom-3 w-76 max-w-[calc(100vw-24px)] bg-[#0A1224]/95 border border-blue-900/50 rounded-2xl shadow-2xl flex flex-col z-20 backdrop-blur-md overflow-hidden">
            <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-[#0E1A33]">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-black text-white">Biblioteca Técnica MZ</span>
              </div>
              <button type="button" onClick={() => setShowLibrary(false)} className="p-1 rounded text-slate-400 hover:text-white cursor-pointer">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-2.5 border-b border-slate-800 space-y-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Pesquisar componentes..."
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>

              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
                {Object.entries(CATEGORIES).map(([catKey, catLabel]) => (
                  <button
                    key={catKey}
                    type="button"
                    onClick={() => setSelectedCategory(catKey)}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap cursor-pointer ${
                      selectedCategory === catKey ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-400'
                    }`}
                  >
                    {catLabel}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
              {COMPONENT_CATALOG.filter(c => {
                const matchCat = selectedCategory === 'all' || c.cat === selectedCategory;
                const matchSearch = !searchQuery.trim() || c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.code.toLowerCase().includes(searchQuery.toLowerCase());
                return matchCat && matchSearch;
              }).map(c => (
                <button
                  key={c.code}
                  type="button"
                  onPointerDown={(e) => handleLibraryPointerDown(e, c.code, c.name)}
                  onClick={() => addComponentToCanvas(c.code)}
                  className="w-full p-2 rounded-xl bg-slate-900/60 hover:bg-blue-950/40 border border-slate-800 flex items-center justify-between text-left cursor-grab"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-sm">
                      {c.icon}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-200">{c.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{c.code}</div>
                    </div>
                  </div>
                  <Plus className="w-3.5 h-3.5 text-slate-500" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* PAINEL LATERAL: PROPRIEDADES PARAMÉTRICAS DO DISPOSITIVO */}
        {showProps && selectedComponent && (
          <div className="absolute right-3 top-3 bottom-3 w-88 max-w-[calc(100vw-24px)] bg-[#0A1224]/95 border border-blue-900/50 rounded-2xl shadow-2xl flex flex-col z-20 backdrop-blur-md overflow-hidden animate-in slide-in-from-right duration-200">
            <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-[#0E1A33]">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-black text-white">Dimensionamento & Propriedades</span>
              </div>
              <button type="button" onClick={() => setShowProps(false)} className="p-1 rounded text-slate-400 hover:text-white cursor-pointer">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-[10px] text-slate-400 font-mono">ID: {selectedComponent.id}</div>
                <div className="text-xs font-black text-blue-300">{selectedComponent.code} • {selectedComponent.label || selectedComponent.code}</div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold block mb-1">Rótulo Técnico</label>
                <input
                  type="text"
                  value={selectedComponent.label || ''}
                  onChange={e => {
                    const nextVal = e.target.value;
                    setProject(prev => ({
                      ...prev,
                      components: prev.components.map(c => c.id === selectedCompId ? { ...c, label: nextVal } : c),
                      updated: Date.now()
                    }));
                  }}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-bold outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold flex items-center gap-1.5 mb-1">
                  <Tag className="w-3 h-3 text-emerald-400" />
                  <span>Fabricante / Linha Comercial</span>
                </label>
                <select
                  value={selectedComponent.brand || 'Schneider Electric'}
                  onChange={e => {
                    const brandName = e.target.value as DeviceBrand;
                    setProject(prev => ({
                      ...prev,
                      components: prev.components.map(c =>
                        c.id === selectedCompId
                          ? { ...c, brand: brandName, brandName }
                          : c
                      ),
                      updated: Date.now()
                    }));
                    showToast(`Fabricante alterado para ${brandName}`);
                  }}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-emerald-300 font-bold outline-none cursor-pointer"
                >
                  {Object.keys(REAL_BRANDS).map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>

                {selectedComponent.brand && REAL_BRANDS[selectedComponent.brand as DeviceBrand] && (
                  <div
                    className="mt-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black flex items-center justify-between border"
                    style={{
                      backgroundColor: REAL_BRANDS[selectedComponent.brand as DeviceBrand].badgeBg,
                      borderColor: REAL_BRANDS[selectedComponent.brand as DeviceBrand].primaryColor,
                      color: REAL_BRANDS[selectedComponent.brand as DeviceBrand].textColor
                    }}
                  >
                    <span>Linha Certificada</span>
                    <span>{REAL_BRANDS[selectedComponent.brand as DeviceBrand].shortName}</span>
                  </div>
                )}
              </div>

              {/* PARÂMETROS DE MÓDULO SOLAR (PV_PANEL) */}
              {selectedComponent.code === 'PV_PANEL' && (
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-amber-900/40 space-y-2.5">
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[11px]">
                    <Sun className="w-3.5 h-3.5" />
                    <span>Dimensionamento Fotovoltaico</span>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 font-bold block mb-1">Potência Nominal (Wp)</label>
                    <div className="grid grid-cols-4 gap-1 mb-1.5">
                      {[400, 450, 550, 650].map(p => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => {
                            updateComponentProperty('pMax', p);
                            updateComponentProperty('vmpp', Number((p / 13.15).toFixed(1)));
                          }}
                          className={`py-1 rounded text-[10px] font-bold border ${
                            (selectedComponent.params?.pMax ?? 550) === p
                              ? 'bg-amber-600 text-white border-amber-400'
                              : 'bg-slate-900 text-slate-300 border-slate-700'
                          }`}
                        >
                          {p}W
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="100"
                        max="800"
                        step="10"
                        value={selectedComponent.params?.pMax ?? 550}
                        onChange={e => updateComponentProperty('pMax', Number(e.target.value))}
                        className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-amber-300 font-mono font-bold"
                      />
                      <span className="text-slate-400 font-mono">Wp</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-400 font-bold block mb-1">Tensão Vmpp (V)</label>
                      <input
                        type="number"
                        min="18"
                        max="70"
                        step="0.5"
                        value={selectedComponent.params?.vmpp ?? 41.8}
                        onChange={e => updateComponentProperty('vmpp', Number(e.target.value))}
                        className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-sky-300 font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 font-bold block mb-1">Tensão Voc (V)</label>
                      <input
                        type="number"
                        min="20"
                        max="85"
                        step="0.5"
                        value={selectedComponent.params?.voc ?? 49.8}
                        onChange={e => updateComponentProperty('voc', Number(e.target.value))}
                        className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-sky-300 font-mono font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold mb-1">
                      <span>Irradiância Solar</span>
                      <span className="text-amber-400 font-mono">{selectedComponent.params?.irradiance ?? 1000} W/m²</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1200"
                      step="50"
                      value={selectedComponent.params?.irradiance ?? 1000}
                      onChange={e => updateComponentProperty('irradiance', Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {/* PARÂMETROS DE BATERIA LiFePO4 */}
              {selectedComponent.code === 'BAT_LIFEPO4' && (
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-sky-900/40 space-y-2.5">
                  <div className="flex items-center gap-1.5 text-sky-400 font-bold text-[11px]">
                    <BatteryCharging className="w-3.5 h-3.5" />
                    <span>Dimensionamento da Bateria</span>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 font-bold block mb-1">Tensão Nominal do Banco</label>
                    <div className="grid grid-cols-4 gap-1">
                      {[12, 24, 48, 51.2].map(v => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => updateComponentProperty('voltage', v)}
                          className={`py-1 rounded text-[10px] font-bold border ${
                            Number(selectedComponent.params?.voltage ?? 51.2) === v
                              ? 'bg-sky-600 text-white border-sky-300'
                              : 'bg-slate-900 text-slate-300 border-slate-700'
                          }`}
                        >
                          {v}V
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 font-bold block mb-1">Capacidade (Ah)</label>
                    <select
                      value={selectedComponent.params?.capacityAh ?? 100}
                      onChange={e => updateComponentProperty('capacityAh', Number(e.target.value))}
                      className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded text-emerald-300 font-mono font-bold cursor-pointer"
                    >
                      <option value="50">50 Ah</option>
                      <option value="100">100 Ah (Padrão 3U Rack)</option>
                      <option value="150">150 Ah</option>
                      <option value="200">200 Ah</option>
                      <option value="280">280 Ah</option>
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold mb-1">
                      <span>Nível de Carga (SOC)</span>
                      <span className="text-emerald-400 font-mono">{selectedComponent.params?.socPercent ?? 90}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={selectedComponent.params?.socPercent ?? 90}
                      onChange={e => updateComponentProperty('socPercent', Number(e.target.value))}
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {/* PARÂMETROS DE DISJUNTORES, FUSÍVEIS E IDRs */}
              {selectedComponent.params?.current !== undefined && (
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-1.5 text-blue-400 font-bold text-[11px]">
                    <Shield className="w-3.5 h-3.5" />
                    <span>Proteção Termomagnética</span>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 font-bold block mb-1">Corrente Nominal (In)</label>
                    <select
                      value={selectedComponent.params.current}
                      onChange={e => updateComponentProperty('current', Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-amber-300 font-mono font-bold cursor-pointer"
                    >
                      {[6, 10, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125].map(val => (
                        <option key={val} value={val}>{val} A</option>
                      ))}
                    </select>
                  </div>

                  {selectedComponent.params?.curve !== undefined && (
                    <div>
                      <label className="text-[10px] text-slate-400 font-bold block mb-1">Curva de Disparo IEC</label>
                      <select
                        value={selectedComponent.params.curve || 'C'}
                        onChange={e => updateComponentProperty('curve', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono font-bold cursor-pointer"
                      >
                        <option value="B">Curva B (3 a 5 x In - Cargas Resistivas)</option>
                        <option value="C">Curva C (5 a 10 x In - Uso Geral / Motores)</option>
                        <option value="D">Curva D (10 a 20 x In - Alta Corrente de Partida)</option>
                      </select>
                    </div>
                  )}

                  {selectedComponent.params?.icu !== undefined && (
                    <div>
                      <label className="text-[10px] text-slate-400 font-bold block mb-1">Capacidade de Interrupção (Icu)</label>
                      <select
                        value={selectedComponent.params.icu || 6}
                        onChange={e => updateComponentProperty('icu', Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-emerald-300 font-mono font-bold cursor-pointer"
                      >
                        {[4.5, 6, 10, 16, 25, 36, 50].map(v => (
                          <option key={v} value={v}>{v} kA</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}

              {/* PARÂMETROS DE CONTATORES */}
              {selectedComponent.code === 'CONTACTOR' && (
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
                    <Zap className="w-3.5 h-3.5" />
                    <span>Dimensionamento do Contator</span>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 font-bold block mb-1">Corrente AC-3 (Ie)</label>
                    <select
                      value={selectedComponent.params?.ac3Current ?? selectedComponent.params?.current ?? 25}
                      onChange={e => updateComponentProperty('ac3Current', Number(e.target.value))}
                      className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded text-emerald-300 font-mono font-bold cursor-pointer"
                    >
                      {[9, 12, 18, 25, 32, 40, 50, 65, 80, 95].map(a => (
                        <option key={a} value={a}>{a} A (AC-3)</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 font-bold block mb-1">Tensão da Bobina (A1-A2)</label>
                    <select
                      value={selectedComponent.params?.coil ?? 230}
                      onChange={e => updateComponentProperty('coil', Number(e.target.value))}
                      className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded text-sky-300 font-mono font-bold cursor-pointer"
                    >
                      <option value="24">24V AC/DC</option>
                      <option value="110">110V AC</option>
                      <option value="230">230V AC (Monofásico)</option>
                      <option value="400">400V AC (Bifásico)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* PARÂMETROS DE MOTORES E BOMBAS */}
              {['motor3', 'motor1', 'motor3_6lead', 'pump', 'fan'].some(k => selectedComponent.code.includes('M') || selectedComponent.code === 'PUMP' || selectedComponent.code === 'FAN') && (
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-1.5 text-sky-400 font-bold text-[11px]">
                    <Activity className="w-3.5 h-3.5" />
                    <span>Dados do Motor / Carga Mecânica</span>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold mb-1">
                      <span>Potência Nominal</span>
                      <span className="text-amber-400 font-mono">
                        {((selectedComponent.params?.power || (selectedComponent.code === 'PUMP' ? 3000 : 7500)) / 735.5).toFixed(1)} CV ({((selectedComponent.params?.power || (selectedComponent.code === 'PUMP' ? 3000 : 7500)) / 1000).toFixed(1)} kW)
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="250"
                        max="75000"
                        step="250"
                        value={selectedComponent.params?.power || (selectedComponent.code === 'PUMP' ? 3000 : 7500)}
                        onChange={e => updateComponentProperty('power', Number(e.target.value))}
                        className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-amber-300 font-mono font-bold"
                      />
                      <span className="text-slate-400 font-mono">W</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-400 font-bold block mb-1">Rotação (RPM)</label>
                      <select
                        value={selectedComponent.params?.rpm || (selectedComponent.code === 'PUMP' ? 2880 : 2920)}
                        onChange={e => updateComponentProperty('rpm', Number(e.target.value))}
                        className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-white font-mono font-bold cursor-pointer"
                      >
                        <option value="960">960 RPM (6 Polos)</option>
                        <option value="1450">1450 RPM (4 Polos)</option>
                        <option value="2880">2880 RPM (Bomba Centrífuga)</option>
                        <option value="2920">2920 RPM (2 Polos)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 font-bold block mb-1">Fator de Potência</label>
                      <input
                        type="number"
                        min="0.7"
                        max="0.98"
                        step="0.01"
                        value={selectedComponent.params?.pf || 0.85}
                        onChange={e => updateComponentProperty('pf', Number(e.target.value))}
                        className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-emerald-300 font-mono font-bold"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* PARÂMETROS DE CARGA DA TOMADA (OUTLET) */}
              {(selectedComponent.code === 'OUTLET' || selectedComponent.code?.startsWith('OUTLET')) && (
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-amber-900/50 space-y-2.5">
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[11px]">
                    <Power className="w-3.5 h-3.5" />
                    <span>Carga Conectada na Tomada (Plug & Test)</span>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 font-bold block mb-1">Nome do Aparelho / Carga</label>
                    <input
                      type="text"
                      value={selectedComponent.params?.applianceName || 'Carga Geral'}
                      onChange={e => updateComponentProperty('applianceName', e.target.value)}
                      placeholder="Ex: Chuveiro, Secador, Bomba..."
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-bold outline-none"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold mb-1">
                      <span>Potência Nominal da Carga:</span>
                      <span className="text-amber-400 font-mono font-bold">
                        {Number(selectedComponent.params?.powerW || (selectedComponent.params?.customPowerW || 0))} W
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="0"
                        max="12000"
                        step="50"
                        value={Number(selectedComponent.params?.powerW || (selectedComponent.params?.customPowerW || 0))}
                        onChange={e => {
                          const wVal = Math.max(0, Number(e.target.value));
                          const vNom = Number(selectedComponent.params?.voltage || 230);
                          const pf = Number(selectedComponent.params?.powerFactor || 1.0);
                          const iVal = Number((wVal / (vNom * pf)).toFixed(1));
                          updateComponentProperty('powerW', wVal);
                          updateComponentProperty('customPowerW', wVal);
                          updateComponentProperty('targetCurrent', iVal);
                          if (wVal > 0 && selectedComponent.params?.pluggedAppliance === 'NONE') {
                            updateComponentProperty('pluggedAppliance', 'CUSTOM');
                          }
                        }}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-amber-300 font-mono font-bold outline-none"
                      />
                      <span className="text-slate-400 font-mono font-bold">Watts</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 font-bold block mb-1">Aparelhos Pré-Configurados</label>
                    <select
                      value={selectedComponent.params?.pluggedAppliance || 'NONE'}
                      onChange={e => {
                        const appKey = e.target.value;
                        const preset = APPLIANCE_PRESETS.find(p => p.id === appKey);
                        updateComponentProperty('pluggedAppliance', appKey);
                        if (preset) {
                          updateComponentProperty('applianceName', preset.label);
                          updateComponentProperty('powerW', preset.powerW);
                          updateComponentProperty('customPowerW', preset.powerW);
                          updateComponentProperty('targetCurrent', preset.currentA);
                        }
                      }}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-amber-300 font-bold outline-none cursor-pointer"
                    >
                      {APPLIANCE_PRESETS.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.label} {p.powerW > 0 ? `(${p.powerW}W • ~${p.currentA}A)` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Botões de Ação Direta */}
              <div className="pt-2 border-t border-slate-800 space-y-1.5">
                <button
                  type="button"
                  onClick={rotateSelectedComponent}
                  className="w-full py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-700 cursor-pointer"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Girar 90°</span>
                </button>
                <button
                  type="button"
                  onClick={duplicateSelectedComponent}
                  className="w-full py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-700 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Duplicar</span>
                </button>
                <button
                  type="button"
                  onClick={deleteSelected}
                  className="w-full py-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-300 font-bold text-xs flex items-center justify-center gap-1.5 border border-rose-800 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remover Dispositivo</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* OSCILOSCÓPIO DIGITAL FLUTUANTE */}
        {showScope && (
          <div className="absolute right-3 top-3 w-80 bg-[#0A1224]/95 border border-blue-900/60 rounded-2xl shadow-2xl p-3 z-20 backdrop-blur-md space-y-2">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-sky-400" />
                <span className="text-xs font-black text-white">Osciloscópio Digital</span>
              </div>
              <div className="flex items-center gap-1">
                <select
                  value={scopeChannel}
                  onChange={e => setScopeChannel(e.target.value as any)}
                  className="bg-slate-900 text-[10px] font-bold text-slate-300 border border-slate-700 rounded px-1.5 py-0.5 cursor-pointer"
                >
                  <option value="DUAL">DUAL</option>
                  <option value="CH1">CH1 (V)</option>
                  <option value="CH2">CH2 (I)</option>
                </select>
                <button type="button" onClick={() => setShowScope(false)} className="p-0.5 rounded text-slate-400 hover:text-white cursor-pointer">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <canvas ref={scopeCanvasRef} width={296} height={140} className="w-full h-36 bg-[#040D1A] rounded-xl border border-slate-800" />

            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <div><span className="text-sky-400 font-bold">CH1:</span> {scopeVoltsDiv} V/div</div>
              <div><span className="text-amber-400 font-bold">CH2:</span> 5 A/div</div>
              <div>TB: 5 ms/div</div>
            </div>
          </div>
        )}

        {/* PAINEL FLUTUANTE DE MEDIÇÕES TRUE-RMS */}
        {showMeters && (
          <div className="absolute left-3 bottom-3 z-10 px-3.5 py-2.5 rounded-2xl bg-[#0A1224]/90 border border-blue-900/40 shadow-xl backdrop-blur-md flex items-center gap-4 text-xs font-mono">
            <div>Tensão: <strong className="text-amber-400">{meterV.toFixed(1)} V</strong></div>
            <div className="h-4 w-px bg-slate-800" />
            <div>Corrente: <strong className="text-emerald-400">{meterA < 1.0 && meterA > 0 ? `${(meterA * 1000).toFixed(0)} mA` : `${meterA.toFixed(2)} A`}</strong></div>
            <div className="h-4 w-px bg-slate-800" />
            <div>Potência: <strong className="text-blue-400">{meterW} W</strong></div>
            <div className="h-4 w-px bg-slate-800" />
            <div>FP: <strong className="text-purple-300">{meterPF.toFixed(2)}</strong></div>
          </div>
        )}

        {/* CONTROLES DE ZOOM E FIT */}
        <div className="absolute right-3 bottom-3 z-10 flex items-center gap-1.5 p-1.5 rounded-xl bg-[#0A1224]/90 border border-blue-900/40 shadow-xl backdrop-blur-md">
          <button
            type="button"
            onClick={() => { cameraRef.current.zoom = Math.max(0.1, cameraRef.current.zoom * 0.85); }}
            className="w-7 h-7 rounded-lg bg-slate-900 text-slate-300 font-bold text-xs cursor-pointer"
          >
            −
          </button>
          <button
            type="button"
            onClick={() => { cameraRef.current.zoom = 1.0; }}
            className="text-[11px] font-mono px-1.5 py-0.5 text-slate-300 font-bold cursor-pointer"
          >
            {Math.round((cameraRef.current?.zoom || 1) * 100)}%
          </button>
          <button
            type="button"
            onClick={() => { cameraRef.current.zoom = Math.min(5.0, cameraRef.current.zoom * 1.15); }}
            className="w-7 h-7 rounded-lg bg-slate-900 text-slate-300 font-bold text-xs cursor-pointer"
          >
            +
          </button>
          <button
            type="button"
            onClick={handleFit}
            className="px-2 py-1 rounded-lg bg-slate-900 text-slate-300 text-[11px] font-bold cursor-pointer"
          >
            ⌗ Fit
          </button>
        </div>
      </div>

      {/* 3. DOCK INFERIOR DE CONTROLES */}
      <footer className="h-12 bg-[#0B132B] border-t border-blue-900/50 flex items-center justify-between px-3 sm:px-5 z-40 shrink-0 shadow-2xl select-none">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => setShowLibrary(!showLibrary)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border ${
              showLibrary ? 'bg-blue-600 text-white border-blue-400' : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Biblioteca</span>
          </button>

          <button
            type="button"
            onClick={() => setShowProps(!showProps)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border ${
              showProps ? 'bg-amber-600 text-white border-amber-400' : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Propriedades</span>
          </button>

          <button
            type="button"
            onClick={() => setShowScope(!showScope)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border ${
              showScope ? 'bg-sky-600 text-white border-sky-400' : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Osciloscópio</span>
          </button>

          <button
            type="button"
            onClick={() => setShowMeters(!showMeters)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border ${
              showMeters ? 'bg-emerald-600 text-white border-emerald-400' : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Medições</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => {
              pushHistory();
              const organized = autoOrganizeCircuitWiring(projectRef.current);
              projectRef.current = organized;
              setProject(organized);
              soundFX.playSuccess();
              showToast('Canaletas e condutores alinhados');
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-900 text-amber-300 border border-slate-700 hover:bg-slate-800 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <span>📐</span>
            <span className="hidden md:inline">Auto-Organizar</span>
          </button>

          <button
            type="button"
            onClick={handleFit}
            className="px-3 py-1.5 rounded-xl bg-slate-900 text-slate-300 border border-slate-700 hover:bg-slate-800 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Enquadrar</span>
          </button>

          <button
            type="button"
            onClick={() => setIsPublishDialogOpen(true)}
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-blue-900/40 cursor-pointer border border-blue-400/40"
          >
            <Zap className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
            <span>Publicar</span>
          </button>
        </div>
      </footer>

      {/* 4. MODAL DE PUBLICAÇÃO */}
      {isPublishDialogOpen && (
        <div className="fixed inset-0 z-[100000] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0D152A] rounded-3xl border border-blue-900/60 p-6 max-w-lg w-full space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-black text-white">Publicar Circuito no Mural</h3>
              <button type="button" onClick={() => setIsPublishDialogOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-200 mb-1">Título do Circuito</label>
                <input
                  type="text"
                  value={publishTitle}
                  onChange={e => setPublishTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-200 mb-1">Área Técnica</label>
                <select
                  value={publishCategory}
                  onChange={e => setPublishCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white cursor-pointer"
                >
                  <option value="Comandos Elétricos">Comandos Elétricos</option>
                  <option value="Instalações Elétricas">Instalações Elétricas</option>
                  <option value="Energia Solar">Energia Solar</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-200 mb-1">Descrição</label>
                <textarea
                  rows={3}
                  value={publishDescription}
                  onChange={e => setPublishDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button type="button" onClick={() => setIsPublishDialogOpen(false)} className="px-4 py-2 text-slate-400 text-xs font-bold cursor-pointer">
                Cancelar
              </button>
              <button
                type="button"
                disabled={isPublishing || !publishTitle.trim()}
                onClick={handleConfirmPublish}
                className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs cursor-pointer"
              >
                {isPublishing ? 'Publicando...' : 'Confirmar e Publicar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PAINEL DE DIAGNÓSTICOS DE VOZ IEC */}
      <CadVoiceDiagnosticPanel
        isOpen={isDiagnosticPanelOpen}
        onClose={() => setIsDiagnosticPanelOpen(false)}
        onTriggerVisualEffect={() => {}}
      />
    </div>
  );
};