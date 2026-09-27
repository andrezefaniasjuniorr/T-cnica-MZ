import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CadCircuitProject } from '../../types';
import { soundFX } from '../../utils/audio';
import {
  COMPONENT_CATALOG,
  COMPONENT_MAP,
  CATEGORIES,
  WIRE_COLORS,
  getComponentDef,
  solveCircuitPhysicsStep,
  generateDirectMotorStarterCircuit,
  generateFourWayLightingCircuit,
  generateQgdProtectionCircuit,
  generateSolarPVIsoCircuit,
  ComponentDef
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
  findJunctionDots,
  TerminalPosition
} from './cadRouting';
import { generateMuralSnapshot } from './cadSnapshot';
import { renderDevice } from './cadDeviceRenderer';
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
  VolumeX
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
    lastContactorState: boolean;
    motorRpm: number;
    firedAlertsSet: Set<string>;
    pointerWorld: { x: number; y: number } | null;
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
    lastContactorState: false,
    motorRpm: 0,
    firedAlertsSet: new Set(),
    pointerWorld: null
  });

  const projectRef = useRef(project);
  useEffect(() => {
    projectRef.current = project;
  }, [project]);

  const isRunningRef = useRef(isRunning);
  useEffect(() => {
    isRunningRef.current = isRunning;
  }, [isRunning]);

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
    showToast('Circuito enquadrado');
  }, [showToast]);

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
    else if (code === 'SPD') { defaultW = 60; defaultH = 75; }
    else if (code === 'SPD3') { defaultW = 110; defaultH = 75; }
    else if (code.startsWith('SRC_')) { defaultW = 120; defaultH = 85; }
    else if (code === 'GEN_DIESEL') { defaultW = 145; defaultH = 95; }
    else if (code === 'ATS_SWITCH') { defaultW = 150; defaultH = 95; }
    else if (code === 'MTS_SWITCH') { defaultW = 130; defaultH = 90; }
    else if (code === 'PV_PANEL') { defaultW = 110; defaultH = 100; }
    else if (code === 'PV_INVERTER_ONGRID') { defaultW = 145; defaultH = 100; }
    else if (code === 'PV_INVERTER_OFFGRID') { defaultW = 135; defaultH = 95; }
    else if (code === 'PV_INVERTER_HYBRID') { defaultW = 140; defaultH = 100; }
    else if (code === 'BAT_LIFEPO4') { defaultW = 125; defaultH = 85; }
    else if (code === 'SMART_METER') { defaultW = 80; defaultH = 80; }
    else if (code === 'M3PH_6L' || code === 'M3PH') { defaultW = 125; defaultH = 95; }
    else if (code === 'M1PH' || code === 'PUMP' || code === 'FAN') { defaultW = 110; defaultH = 85; }
    else if (code === 'PHOTOCELL') { defaultW = 75; defaultH = 80; }
    else if (code === 'PIR_SENSOR') { defaultW = 80; defaultH = 80; }
    else if (code === 'TIMER_DIGITAL' || code === 'TIMER_STAR_DELTA' || code === 'TIMER_TOF') { defaultW = 85; defaultH = 80; }
    else if (code === 'THERMOSTAT_DIGITAL') { defaultW = 95; defaultH = 80; }
    else if (code === 'EARTH_ROD') { defaultW = 40; defaultH = 90; }
    else if (code === 'EARTH_PIT') { defaultW = 90; defaultH = 75; }
    else if (code === 'JUNCTION_BOX') { defaultW = 105; defaultH = 80; }
    else if (code === 'LAMP') { defaultW = 85; defaultH = 85; }

    const newComp = {
      id: `${code}_${Math.random().toString(36).substring(2, 7)}`,
      code,
      x: spawnX,
      y: spawnY,
      rot: 0,
      w: defaultW,
      h: defaultH,
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
          gauge: 2.5,
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
      setShowProps(true);
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

  /**
   * ACIONAMENTO FÍSICO DIRETO DE COMPONENTES E INTERRUPTORES (LÓGICA REAL NBR/IEC)
   */
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
                // ================================================================
                // COMUTAÇÃO REAL E INTERATIVA DE DISPOSITIVOS
                // ================================================================
                if (c.code === 'GEN_DIESEL') {
                  const nextGenState = !Boolean(st.running || params.running);
                  st.running = nextGenState;
                  params.running = nextGenState;
                  soundFX?.playClick?.();
                  addEvent(nextGenState ? 'GMG DIESEL: Grupo Gerador acionado com sucesso (400V 50Hz).' : 'GMG DIESEL: Motor desligado.', nextGenState ? 'info' : 'warn');
                } else if (c.code === 'ATS_SWITCH') {
                  const curGrid = params.gridHealthy !== false;
                  params.gridHealthy = !curGrid;
                  soundFX?.playClick?.();
                  addEvent(!curGrid ? 'ATS: Rede restabelecida. Transferindo para Concessionária...' : 'ATS: Falha na Rede detectada! Acionando GMG e transferindo carga...', 'warn');
                } else if (c.code === 'MTS_SWITCH') {
                  const curPos = Number(params.position ?? 1);
                  let nextPos = 1;
                  if (curPos === 1) nextPos = 0;
                  else if (curPos === 0) nextPos = 2;
                  else nextPos = 1;
                  params.position = nextPos;
                  soundFX?.playClick?.();
                  const posLabel = nextPos === 1 ? 'I (REDE)' : nextPos === 2 ? 'II (GERADOR)' : '0 (DESLIGADO)';
                  addEvent(`MTS: Chave de transferência manual manobrada para ${posLabel}.`, 'info');
                } else if (c.code === 'PHOTOCELL') {
                  const curLux = params.ambientLux ?? 100;
                  const nextLux = curLux <= 20 ? 120 : 10;
                  params.ambientLux = nextLux;
                  st.closed = nextLux <= 20;
                  soundFX?.playClick?.();
                  addEvent(nextLux <= 20 ? 'Fotocélula: Anoitecer detectado (<20 lux). Contato fechado.' : 'Fotocélula: Luz solar detectada (>20 lux). Contato aberto.', 'info');
                } else if (c.code === 'PIR_SENSOR') {
                  params.presenceDetected = true;
                  soundFX?.playClick?.();
                  addEvent('Sensor PIR: Presença detectada! Contato ativado.', 'info');
                  setTimeout(() => {
                    setProject(curr => ({
                      ...curr,
                      components: curr.components.map(item => item.id === compId ? { ...item, params: { ...item.params, presenceDetected: false } } : item)
                    }));
                  }, 4000);
                } else if (c.code === 'PV_PANEL') {
                  const curIrr = params.irradiance ?? 1000;
                  params.irradiance = curIrr === 0 ? 1000 : 0;
                  soundFX?.playClick?.();
                  addEvent(params.irradiance === 1000 ? 'Painel Solar: Radiação solar nominal (1000 W/m²).' : 'Painel Solar: Sem radiação solar (0 W/m² - Noite).', 'info');
                } else if (c.code === 'ESTOP') {
                  const isLocked = Boolean(st.pressed || st.tripped || !st.closed);
                  const nextLocked = !isLocked;
                  st.pressed = nextLocked;
                  st.tripped = nextLocked;
                  st.closed = !nextLocked;
                  params.closed = !nextLocked;
                  soundFX?.playClick?.();
                  addEvent(nextLocked ? 'E-STOP TRAVADO: Circuito desarmado!' : 'E-STOP DESTRAVADO: Circuito em serviço.', nextLocked ? 'warn' : 'info');
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
                  addEvent(nextHigh ? 'Bóia de nível: NÍVEL ALTO (contato NA fechado).' : 'Bóia de nível: NÍVEL BAIXO (contato NF fechado).', 'info');
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
                  const posName = nextPos === 1 ? 'MARCHA 1 (MAN)' : nextPos === 2 ? 'MARCHA 2 (AUTO)' : 'CENTRO (DESLIGADO)';
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
  // LOOP DE RENDERIZAÇÃO DO CANVAS 2D (PROTEGIDO CONTRA CONGELAMENTO)
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

        // CAMADA 1: Moldura do Quadro
        if (currentProj.panelConfig?.enabled) {
          drawPanelEnclosure(ctx, cam, currentProj.panelConfig);
        }

        // CAMADA 2: CONDUTORES
        (currentProj.wires || []).forEach((wire: any, wireIdx: number) => {
          const posA = getNodeWorldPos(wire.a?.c, wire.a?.t, currentProj.components, currentProj.busbars || []);
          const posB = getNodeWorldPos(wire.b?.c, wire.b?.t, currentProj.components, currentProj.busbars || []);
          const filletPath = calculateFilletManhattanPath(posA, posB, wireIdx, wire.waypoints);
          const isSelected = wire.id === selectedWireIdRef.current;

          renderCurvedWireBack(ctx, filletPath, {
            wireType: wire.type || 'L1',
            gauge: Number(wire.gauge || 2.5),
            cam,
            isLive: isRunningRef.current && Boolean(wire.live),
            isSelected,
            isOverheated: Boolean(wire.overheated),
            animTick: simRef.current.time * 60,
            toScreen
          });
        });

        const activeLiveBusbars = new Set<string>();
        if (isRunningRef.current) {
          activeLiveBusbars.add('phase_l1');
          activeLiveBusbars.add('phase_l2');
          activeLiveBusbars.add('phase_l3');
          activeLiveBusbars.add('neutral');
          activeLiveBusbars.add('earth');
        }

        // CAMADA 3: TRILHOS DIN E BARRAMENTOS
        drawBusbars(
          ctx,
          cam,
          currentProj.busbars || [],
          selectedBusbarIdRef.current,
          hoveredTerminalIdRef.current,
          activeLiveBusbars
        );

        // CAMADA 4: DISPOSITIVOS ELÉTRICOS (PROTEGIDO INDIVIDUALMENTE)
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
            gauge: 2.5,
            cam,
            isLive: false,
            isSelected: true,
            isOverheated: false,
            animTick: simRef.current.time * 60,
            toScreen
          });

          renderFerruleTerminal(
            ctx,
            toScreen(startPos),
            startPos.dir || 'bottom',
            selectedWireTypeRef.current,
            2.5,
            cam,
            false,
            false
          );
        }

        if (svgGroupRef.current) {
          svgGroupRef.current.setAttribute('transform', `translate(${cam.pan.x}, ${cam.pan.y}) scale(${cam.zoom})`);
        }

        // MOTOR FÍSICO MNA
        const physResult = solveCircuitPhysicsStep(
          currentProj,
          dt,
          simRef.current.time,
          isSimRunning
        );

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

        const kmComp = currentProj.components.find(c => c.code === 'CONTACTOR');
        const kmEnergized = Boolean(kmComp?.state?.energized);
        if (kmEnergized !== simRef.current.lastContactorState) {
          soundFX.playContactorThump(kmEnergized);
          simRef.current.lastContactorState = kmEnergized;
        }

        const motorComp = currentProj.components.find(c => ['M3PH', 'M1PH', 'M3PH_6L', 'PUMP'].includes(c.code));
        if (motorComp && motorComp.state) {
          const targetRpm = motorComp.state.running ? Number(motorComp.state.rpm || 2920) : 0;
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

        // Render do Osciloscópio
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
    const threshold = 16 / Math.max(0.2, zoom);
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
      mouse: { x: worldX, y: worldY }
    };

    // Conexão em bornes de barramento
    const nearestBusbarTerm = findNearestBusbarTerminal(
      projectRef.current.busbars || [],
      { x: worldX, y: worldY },
      18 / cam.zoom
    );

    if (nearestBusbarTerm && (activeTool === 'wire' || e.shiftKey)) {
      if (!simRef.current.wireStart) {
        simRef.current.wireStart = { c: nearestBusbarTerm.busbar.id, t: nearestBusbarTerm.terminal.id };
        showToast(`Iniciado no ${nearestBusbarTerm.busbar.type.toUpperCase()}. Toque no destino.`);
      } else {
        const startC = simRef.current.wireStart.c;
        const startT = simRef.current.wireStart.t;
        if (startC !== nearestBusbarTerm.busbar.id || startT !== nearestBusbarTerm.terminal.id) {
          pushHistory();
          const newWire = {
            id: `W_${Math.random().toString(36).substring(2, 7)}`,
            a: { c: startC, t: startT },
            b: { c: nearestBusbarTerm.busbar.id, t: nearestBusbarTerm.terminal.id },
            type: selectedWireType,
            gauge: 2.5,
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
        }
        simRef.current.wireStart = null;
      }
      return;
    }

    // Conexão em bornes de componentes
    for (const c of projectRef.current.components) {
      const d = getComponentDef(c.code);
      for (const t of d.terminals) {
        const tp = terminalPos(c, t[0]);
        const dist = Math.hypot(tp.x - worldX, tp.y - worldY);
        if (dist < 14 / cam.zoom) {
          if (activeTool === 'wire' || e.shiftKey) {
            if (!simRef.current.wireStart) {
              simRef.current.wireStart = { c: c.id, t: t[0] };
              showToast(`Iniciado em ${c.label || d.name} [${t[0]}]. Toque no destino.`);
            } else {
              const startC = simRef.current.wireStart.c;
              const startT = simRef.current.wireStart.t;
              if (startC !== c.id || startT !== t[0]) {
                pushHistory();
                const newWire = {
                  id: `W_${Math.random().toString(36).substring(2, 7)}`,
                  a: { c: startC, t: startT },
                  b: { c: c.id, t: t[0] },
                  type: selectedWireType,
                  gauge: 2.5,
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
              }
              simRef.current.wireStart = null;
            }
          } else {
            setSelectedCompId(c.id);
            setSelectedWireId(null);
            setSelectedBusbarId(null);
            simRef.current.drag.mode = 'comp';
            simRef.current.drag.compId = c.id;
            simRef.current.drag.offsetX = worldX - c.x;
            simRef.current.drag.offsetY = worldY - c.y;
          }
          return;
        }
      }
    }

    // Clique no corpo do componente
    for (let i = projectRef.current.components.length - 1; i >= 0; i--) {
      const c = projectRef.current.components[i];
      const rad = (-c.rot * Math.PI) / 180;
      const dx = worldX - c.x;
      const dy = worldY - c.y;
      const rx = dx * Math.cos(rad) - dy * Math.sin(rad);
      const ry = dx * Math.sin(rad) + dy * Math.cos(rad);

      const w = c.w || 90;
      const h = c.h || 75;

      if (Math.abs(rx) <= w / 2 && Math.abs(ry) <= h / 2) {
        setSelectedCompId(c.id);
        setSelectedWireId(null);
        setSelectedBusbarId(null);
        simRef.current.drag.mode = 'comp';
        simRef.current.drag.compId = c.id;
        simRef.current.drag.offsetX = worldX - c.x;
        simRef.current.drag.offsetY = worldY - c.y;
        simRef.current.drag.clickRelX = rx;

        const d = getComponentDef(c.code);
        if (Boolean(d.momentary) || d.kind === 'push' || c.code === 'PBNO' || c.code === 'PBNC') {
          triggerComponentCommand(c.id, 'pulse');
        }
        return;
      }
    }

    // Clique no barramento
    for (let i = (projectRef.current.busbars || []).length - 1; i >= 0; i--) {
      const b = projectRef.current.busbars[i];
      const isH = b.orientation === 'horizontal';
      const halfL = (b.length || 600) / 2;
      const halfH = (b.type === 'din' ? 35 : 14) / 2;
      const rx = isH ? halfL : halfH;
      const ry = isH ? halfH : halfL;

      if (Math.abs(worldX - b.x) <= rx && Math.abs(worldY - b.y) <= ry) {
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

    // Clique no fio
    const hitWireId = getHitWireId(
      worldX,
      worldY,
      projectRef.current.wires,
      projectRef.current.components,
      projectRef.current.busbars || [],
      cam.zoom
    );
    if (hitWireId) {
      setSelectedWireId(hitWireId);
      setSelectedCompId(null);
      setSelectedBusbarId(null);
      setShowProps(false);
      soundFX?.playClick?.();
      simRef.current.drag.mode = 'pan';
      return;
    }

    setSelectedCompId(null);
    setSelectedWireId(null);
    setSelectedBusbarId(null);
    setShowProps(false);
    simRef.current.drag.mode = 'pan';
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    const cam = cameraRef.current;
    const worldX = (px - cam.pan.x) / cam.zoom;
    const worldY = (py - cam.pan.y) / cam.zoom;
    simRef.current.pointerWorld = { x: worldX, y: worldY };

    const drag = simRef.current.drag;
    if (!drag) return;

    drag.mouse = { x: worldX, y: worldY };

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

    const canvas = canvasRef.current;
    if (canvas) {
      try {
        if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId);
      } catch {}
    }

    const drag = simRef.current.drag;
    if (!drag) return;
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

    // Clique e atuação imediata em todos os dispositivos (exceto push buttons momentâneos que já atuam no down)
    if (moveDist < 8 && drag.mode === 'comp' && drag.compId) {
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
                CAD V17
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
            className="px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-[11px] font-bold text-slate-200 outline-none"
          >
            <option value="L1">L1 (Castanho)</option>
            <option value="L2">L2 (Preto)</option>
            <option value="L3">L3 (Cinza)</option>
            <option value="N">N (Neutro)</option>
            <option value="PE">PE (Terra)</option>
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
        </div>

        {/* Ações da Direita */}
        <div className="flex items-center gap-1.5">
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
            className="px-2.5 py-2 rounded-xl bg-slate-900 text-sky-400 border border-slate-800 text-xs font-bold flex items-center gap-1"
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">PDF</span>
          </button>

          <button type="button" onClick={handleExportImage} className="p-2 rounded-xl bg-slate-900 text-slate-300 border border-slate-800">
            <ImageIcon className="w-4 h-4" />
          </button>

          <button type="button" onClick={handleExportJSON} className="p-2 rounded-xl bg-slate-900 text-slate-300 border border-slate-800 hidden sm:flex">
            <Download className="w-4 h-4" />
          </button>

          <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 rounded-xl bg-slate-900 text-slate-300 border border-slate-800 hidden sm:flex">
            <Upload className="w-4 h-4" />
          </button>
          <input ref={fileInputRef} type="file" accept="application/json" onChange={handleImportJSON} className="hidden" />

          <button type="button" onClick={onClose} className="p-2 rounded-xl bg-slate-900 hover:bg-rose-900 text-slate-400 hover:text-white border border-slate-800 ml-1">
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

        <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
          <g ref={svgGroupRef} transform={`translate(${cameraRef.current.pan.x}, ${cameraRef.current.pan.y}) scale(${cameraRef.current.zoom})`}>
            {(project.wires || []).map((wire: any, wireIdx: number) => {
              const posA = getNodeWorldPos(wire.a?.c, wire.a?.t, project.components, project.busbars || []);
              const posB = getNodeWorldPos(wire.b?.c, wire.b?.t, project.components, project.busbars || []);
              const fillet = calculateFilletManhattanPath(posA, posB, wireIdx, wire.waypoints);
              const dStr = getFilletSvgPathString(fillet.points, fillet.radius);
              const isSelected = wire.id === selectedWireId;

              return (
                <g key={wire.id || wireIdx}>
                  {isSelected && (
                    <path d={dStr} stroke="#38bdf8" strokeWidth="10" strokeOpacity="0.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  )}
                  <path
                    d={dStr}
                    stroke="transparent"
                    strokeWidth="18"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                    style={{ pointerEvents: 'stroke', cursor: 'pointer' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedWireId(wire.id);
                      setSelectedCompId(null);
                      setSelectedBusbarId(null);
                      soundFX?.playClick?.();
                    }}
                  />
                </g>
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

        {/* PAINEL LATERAL: BIBLIOTECA EXPANSIVA */}
        {showLibrary && (
          <div className="absolute left-3 top-3 bottom-3 w-76 max-w-[calc(100vw-24px)] bg-[#0A1224]/95 border border-blue-900/50 rounded-2xl shadow-2xl flex flex-col z-20 backdrop-blur-md overflow-hidden">
            <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-[#0E1A33]">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-black text-white">Biblioteca Técnica MZ</span>
              </div>
              <button type="button" onClick={() => setShowLibrary(false)} className="p-1 rounded text-slate-400 hover:text-white">
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
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap ${
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

        {/* PAINEL LATERAL: PROPRIEDADES */}
        {showProps && selectedComponent && (
          <div className="absolute right-3 top-3 bottom-3 w-72 max-w-[calc(100vw-24px)] bg-[#0A1224]/95 border border-blue-900/50 rounded-2xl shadow-2xl flex flex-col z-20 backdrop-blur-md overflow-hidden">
            <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-[#0E1A33]">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-black text-white">Propriedades</span>
              </div>
              <button type="button" onClick={() => setShowProps(false)} className="p-1 rounded text-slate-400 hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-3 text-xs">
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
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-bold"
                />
              </div>

              {selectedComponent.params?.current !== undefined && (
                <div>
                  <label className="text-[10px] text-slate-400 font-bold block mb-1">Corrente Nominal (In)</label>
                  <select
                    value={selectedComponent.params.current}
                    onChange={e => {
                      const v = Number(e.target.value);
                      setProject(prev => ({
                        ...prev,
                        components: prev.components.map(c => c.id === selectedCompId ? { ...c, params: { ...c.params, current: v } } : c),
                        updated: Date.now()
                      }));
                    }}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-amber-300 font-mono font-bold"
                  >
                    {[6, 10, 16, 20, 25, 32, 40, 50, 63, 80, 100].map(val => (
                      <option key={val} value={val}>{val} A</option>
                    ))}
                  </select>
                </div>
              )}

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
                  <span>Remover</span>
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
                  className="bg-slate-900 text-[10px] font-bold text-slate-300 border border-slate-700 rounded px-1.5 py-0.5"
                >
                  <option value="DUAL">DUAL</option>
                  <option value="CH1">CH1 (V)</option>
                  <option value="CH2">CH2 (I)</option>
                </select>
                <button type="button" onClick={() => setShowScope(false)} className="p-0.5 rounded text-slate-400 hover:text-white">
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
            <div>Corrente: <strong className="text-emerald-400">{meterA.toFixed(2)} A</strong></div>
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

      {/* 3. DOCK INFERIOR DE CONTROLES (SEMPRE VISÍVEL NO PC E NO CELULAR) */}
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
              <button type="button" onClick={() => setIsPublishDialogOpen(false)} className="text-slate-400 hover:text-white">
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
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
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
              <button type="button" onClick={() => setIsPublishDialogOpen(false)} className="px-4 py-2 text-slate-400 text-xs font-bold">
                Cancelar
              </button>
              <button
                type="button"
                disabled={isPublishing || !publishTitle.trim()}
                onClick={handleConfirmPublish}
                className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs"
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