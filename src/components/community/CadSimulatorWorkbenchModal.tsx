import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
  const dragOverlayRef = useRef<HTMLDivElement | null>(null);

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
    if (!canvas || (curProj.components.length === 0 && (!curProj.busbars || curProj.busbars.length === 0))) {
      cameraRef.current.zoom = 1;
      cameraRef.current.pan = { x: canvas ? canvas.width / 4 : 0, y: canvas ? canvas.height / 4 : 0 };
      return;
    }
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    curProj.components.forEach(c => {
      minX = Math.min(minX, c.x - c.w / 2);
      maxX = Math.max(maxX, c.x + c.w / 2);
      minY = Math.min(minY, c.y - c.h / 2);
      maxY = Math.max(maxY, c.y + c.h / 2);
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

    const padding = 120;
    const w = Math.max(200, maxX - minX + padding * 2);
    const h = Math.max(200, maxY - minY + padding * 2);
    const rect = canvas.getBoundingClientRect();
    const z = Math.max(0.2, Math.min(1.5, Math.min(rect.width / w, rect.height / h)));
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

    const newComp = {
      id: `${code}_${Math.random().toString(36).substring(2, 7)}`,
      code,
      x: spawnX,
      y: spawnY,
      rot: 0,
      w: 100,
      h: 70,
      params: JSON.parse(JSON.stringify(cdef.params || {})),
      state: {
        closed: cdef.params?.closed ?? false,
        energized: false,
        running: false,
        tripped: false,
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
  const triggerComponentCommand = useCallback((compId: string, action: 'toggle' | 'on' | 'off' | 'pulse' | 'reset' | 'test_rcd') => {
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
              }, 400);
            } else {
              // COMUTAÇÃO REAL DE INTERRUPTORES (3-WAY, 4-WAY, SW, SW2, SEL)
              if (c.code === 'THREE_WAY') {
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
              } else if (c.code === 'SEL') {
                const nextPos = (params.position ?? 0) === 0 ? 1 : 0;
                params.position = nextPos;
                st.rockerAngle = nextPos;
                soundFX?.playClick?.();
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
  }, [addEvent]);

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
  // LOOP DE RENDERIZAÇÃO DO CANVAS 2D (5 CAMADAS FÍSICAS REAIS)
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
      const dt = Math.min(0.1, (now - simRef.current.lastTick) / 1000);
      simRef.current.lastTick = now;

      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      if (w === 0 || h === 0) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

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

      // 1. Limpar Fundo
      ctx.fillStyle = '#060D1A';
      ctx.fillRect(0, 0, w, h);

      // 2. Grade CAD Técnica
      ctx.save();
      const baseGrid = cam.grid || 20;
      const step = baseGrid * cam.zoom;
      const ox = ((cam.pan.x % step) + step) % step;
      const oy = ((cam.pan.y % step) + step) % step;

      if (cam.zoom > 1.8) {
        const subStep = step / 4;
        const subOx = ((cam.pan.x % subStep) + subStep) % subStep;
        const subOy = ((cam.pan.y % subStep) + subStep) % subStep;
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.035)';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        for (let x = subOx; x < w; x += subStep) {
          ctx.moveTo(x, 0);
          ctx.lineTo(x, h);
        }
        for (let y = subOy; y < h; y += subStep) {
          ctx.moveTo(0, y);
          ctx.lineTo(w, y);
        }
        ctx.stroke();
      }

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

      const macroStep = step * 5;
      const macroOx = ((cam.pan.x % macroStep) + macroStep) % macroStep;
      const macroOy = ((cam.pan.y % macroStep) + macroStep) % macroStep;
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.16)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      for (let x = macroOx; x < w; x += macroStep) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
      }
      for (let y = macroOy; y < h; y += macroStep) {
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
      }
      ctx.stroke();

      ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      for (let x = macroOx; x < w; x += macroStep) {
        for (let y = macroOy; y < h; y += macroStep) {
          ctx.moveTo(x - 4, y);
          ctx.lineTo(x + 4, y);
          ctx.moveTo(x, y - 4);
          ctx.lineTo(x + 4, y);
        }
      }
      ctx.stroke();
      ctx.restore();

      const toScreen = (p: { x: number; y: number }) => ({
        x: p.x * cam.zoom + cam.pan.x,
        y: p.y * cam.zoom + cam.pan.y
      });

      // ======================================================================
      // Z-INDEX REGRA 1 & 2: ORDEM FÍSICA ESTRITA
      // 1. Chapa de Montagem do Armário (Enclosure)
      // 2. Fiação Retilínea de Canaleta Traseira (Dobras Curvas nos Vértices)
      // 3. Trilhos DIN 35mm e Barramentos Elétricos
      // 4. Dispositivos Elétricos (Carcaça sobrepõe a fiação de fundo)
      // 5. Terminais Ilhós Tubulares / Ferrules e Parafusos de Fixação
      // ======================================================================

      // CAMADA 1: Moldura, Chapa Laranja e Canaletas
      if (currentProj.panelConfig?.enabled) {
        drawPanelEnclosure(ctx, cam, currentProj.panelConfig);
      }

      // CAMADA 2: CONDUTORES RETOS COM DOBRAS CURVAS (PASSAM POR TRÁS)
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

      // CAMADA 3: TRILHOS DIN 35mm E BARRAMENTOS (DESENHADOS SOBRE OS CABOS DE FUNDO)
      drawBusbars(
        ctx,
        cam,
        currentProj.busbars || [],
        selectedBusbarIdRef.current,
        hoveredTerminalIdRef.current,
        activeLiveBusbars
      );

      // CAMADA 4: DISPOSITIVOS ELÉTRICOS (DESENHADOS SOBRE OS FIOS E TRILHOS)
      currentProj.components.forEach(c => {
        const s = toScreen({ x: c.x, y: c.y });
        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.rotate(((c.rot || 0) * Math.PI) / 180);

        renderDevice(ctx, {
          component: c,
          camera: cam,
          isSelected: c.id === selectedCompIdRef.current,
          time: simRef.current.time,
          simRunning: isRunningRef.current
        });

        ctx.restore();
      });

      // CAMADA 5: TERMINAIS ILHÓS TUBULARES (FERRULES) E PARAFUSOS DE APERTO
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

      // 6. Linha de Pré-visualização de Fio em Criação
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

      // ======================================================================
      // 7. MOTOR DE FÍSICA NODAL REAL-TIME (CÁLCULO DINÂMICO IEC 60947/60364)
      // ======================================================================
      try {
        simRef.current.time += dt;

        // Executa a iteração física do grafo
        const physResult = solveCircuitPhysicsStep(
          currentProj,
          dt,
          simRef.current.time,
          isSimRunning
        );

        // Tratamento de curto-circuito físico
        if (physResult.hasDirectShort) {
          const faultKey = 'short_circuit_direct';
          if (!simRef.current.firedAlertsSet.has(faultKey)) {
            simRef.current.firedAlertsSet.add(faultKey);
            soundFX.playShortCircuitSpark();
            soundFX.playBreakerSwitch(true);
            setFaultAlert(physResult.shortCause || 'Curto-Circuito Fase-Neutro Detectado!');
            simulatorDiagnostics.speakCustomAlert(
              'Curto-Circuito',
              'Atenção: Curto-circuito detectado! Proteção desarmada imediatamente.',
              'sparks',
              1,
              faultKey
            );
            addEvent(physResult.shortCause || 'Curto-circuito detectado.', 'trip');
          }
        } else {
          simRef.current.firedAlertsSet.delete('short_circuit_direct');
          if (faultAlert && faultAlert.includes('Curto-Circuito')) {
            setFaultAlert(null);
          }
        }

        // Áudio e animação de contatores
        const kmComp = currentProj.components.find(c => c.code === 'CONTACTOR');
        const kmEnergized = Boolean(kmComp?.state?.energized);
        if (kmEnergized !== simRef.current.lastContactorState) {
          soundFX.playContactorThump(kmEnergized);
          simRef.current.lastContactorState = kmEnergized;
        }

        // Áudio e inércia do motor trifásico
        const motorComp = currentProj.components.find(c => c.code === 'M3PH' || c.code === 'M1PH');
        if (motorComp && motorComp.state) {
          const targetRpm = motorComp.state.running ? Number(motorComp.state.rpm || 2920) : 0;
          if (targetRpm > (simRef.current.motorRpm || 0)) {
            simRef.current.motorRpm = Math.min(targetRpm, (simRef.current.motorRpm || 0) + 120);
          } else {
            simRef.current.motorRpm = Math.max(0, (simRef.current.motorRpm || 0) - 75);
          }

          if (simRef.current.motorRpm > 0) {
            soundFX.updateMotorSound(true, simRef.current.motorRpm / 2920, motorComp.code === 'M3PH');
          } else {
            soundFX.stopMotorSound();
          }
        }

        // Atualização dos medidores da interface
        setMeterV(physResult.mainVoltageRMS);
        setMeterA(physResult.totalLineCurrent);
        setMeterW(Math.round(physResult.totalActivePower));
        setMeterHz(physResult.activeFrequency);
        setMeterPF(physResult.activePF);

        // Amostragem para o Osciloscópio Digital
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

            if ((scopeChannel === 'CH1' || scopeChannel === 'DUAL') && n > 1) {
              sCtx.strokeStyle = '#38bdf8';
              sCtx.lineWidth = 2;
              sCtx.beginPath();
              const vScale = (sh / 2.2) / (scopeVoltsDiv * 4);
              for (let i = 0; i < n; i++) {
                const px = (i / Math.max(1, n - 1)) * sw;
                const py = sh / 2 - hist[i].v * vScale;
                if (i === 0) sCtx.moveTo(px, py);
                else sCtx.lineTo(px, py);
              }
              sCtx.stroke();
            }

            if ((scopeChannel === 'CH2' || scopeChannel === 'DUAL') && n > 1) {
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

        const currentLiveSummary = currentProj.wires.map((w: any) => (w.live ? '1' : '0')).join('') +
          currentProj.components.map((c: any) => (c.state?.energized ? '1' : '0')).join('');
        if (currentLiveSummary !== lastLiveSummaryRef.current) {
          lastLiveSummaryRef.current = currentLiveSummary;
          setSimVersion(v => v + 1);
        }
      } catch (simErr) {
        console.error('Erro ciclo simulação:', simErr);
      }

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isOpen, terminalPos]);

  // Hit-test de seleção dos condutores
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

    if (simRef.current.touchMap.size === 2) {
      const touches = Array.from(simRef.current.touchMap.values());
      const t1 = touches[0];
      const t2 = touches[1];
      const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      const mid = { x: (t1.clientX + t2.clientX) / 2, y: (t1.clientY + t2.clientY) / 2 };

      simRef.current.pinch = {
        initialDist: Math.max(10, dist),
        initialMid: mid,
        startZoom: cameraRef.current.zoom,
        startPan: { ...cameraRef.current.pan }
      };
      simRef.current.drag = null;
      if (simRef.current.longPressTimer) {
        clearTimeout(simRef.current.longPressTimer);
        simRef.current.longPressTimer = null;
      }
      return;
    }

    const cam = cameraRef.current;
    const worldX = (px - cam.pan.x) / cam.zoom;
    const worldY = (py - cam.pan.y) / cam.zoom;

    if (simRef.current.longPressTimer) {
      clearTimeout(simRef.current.longPressTimer);
      simRef.current.longPressTimer = null;
    }

    simRef.current.drag = {
      id: e.pointerId,
      startX: worldX,
      startY: worldY,
      screenStartX: e.clientX,
      screenStartY: e.clientY,
      mode: 'pan',
      mouse: { x: worldX, y: worldY }
    };

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

    for (let i = projectRef.current.components.length - 1; i >= 0; i--) {
      const c = projectRef.current.components[i];
      const rad = (-c.rot * Math.PI) / 180;
      const dx = worldX - c.x;
      const dy = worldY - c.y;
      const rx = dx * Math.cos(rad) - dy * Math.sin(rad);
      const ry = dx * Math.sin(rad) + dy * Math.cos(rad);

      if (Math.abs(rx) <= c.w / 2 && Math.abs(ry) <= c.h / 2) {
        setSelectedCompId(c.id);
        setSelectedWireId(null);
        setSelectedBusbarId(null);
        simRef.current.drag.mode = 'comp';
        simRef.current.drag.compId = c.id;
        simRef.current.drag.offsetX = worldX - c.x;
        simRef.current.drag.offsetY = worldY - c.y;

        const d = getComponentDef(c.code);
        if (Boolean(d.momentary) || d.kind === 'push' || c.code === 'PBNO' || c.code === 'PBNC') {
          triggerComponentCommand(c.id, 'pulse');
        }

        if (simRef.current.longPressTimer) clearTimeout(simRef.current.longPressTimer);
        simRef.current.longPressTimer = setTimeout(() => {
          setShowProps(true);
          soundFX?.playClick?.();
          simRef.current.longPressTimer = null;
        }, 500);
        return;
      }
    }

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

        if (simRef.current.longPressTimer) clearTimeout(simRef.current.longPressTimer);
        simRef.current.longPressTimer = setTimeout(() => {
          setShowProps(true);
          soundFX?.playClick?.();
          simRef.current.longPressTimer = null;
        }, 500);
        return;
      }
    }

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

    if (simRef.current.touchMap.has(e.pointerId)) {
      simRef.current.touchMap.set(e.pointerId, { x: px, y: py, clientX: e.clientX, clientY: e.clientY });
    }

    if (simRef.current.pinch && simRef.current.touchMap.size >= 2) {
      const touches = Array.from(simRef.current.touchMap.values());
      const t1 = touches[0];
      const t2 = touches[1];
      const currentDist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      const currentMid = { x: (t1.clientX + t2.clientX) / 2, y: (t1.clientY + t2.clientY) / 2 };

      const scale = currentDist / simRef.current.pinch.initialDist;
      const newZoom = Math.max(0.1, Math.min(5.0, simRef.current.pinch.startZoom * scale));

      const midCanvasX = currentMid.x - rect.left;
      const midCanvasY = currentMid.y - rect.top;
      const initMidCanvasX = simRef.current.pinch.initialMid.x - rect.left;
      const initMidCanvasY = simRef.current.pinch.initialMid.y - rect.top;

      const worldMidX = (initMidCanvasX - simRef.current.pinch.startPan.x) / simRef.current.pinch.startZoom;
      const worldMidY = (initMidCanvasY - simRef.current.pinch.startPan.y) / simRef.current.pinch.startZoom;

      cam.zoom = newZoom;
      cam.pan.x = midCanvasX - worldMidX * newZoom;
      cam.pan.y = midCanvasY - worldMidY * newZoom;
      return;
    }

    const drag = simRef.current.drag;
    if (!drag) return;

    const moveDist = Math.hypot(e.clientX - drag.screenStartX, e.clientY - drag.screenStartY);
    if (moveDist > 6 && simRef.current.longPressTimer) {
      clearTimeout(simRef.current.longPressTimer);
      simRef.current.longPressTimer = null;
    }

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
    if (simRef.current.touchMap.size < 2) simRef.current.pinch = null;

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

    // DISPARO IMEDIATO DE CLIQUE TÁTIL EM INTERRUPTORES, DISJUNTORES E BOTÕES (MARGEM 8PX)
    if (moveDist < 8 && drag.mode === 'comp' && drag.compId) {
      const c = projectRef.current.components.find((item: any) => item.id === drag.compId);
      if (c) {
        const d = getComponentDef(c.code);
        if (
          c.code === 'THREE_WAY' ||
          c.code === 'FOUR_WAY' ||
          c.code === 'SW' ||
          c.code === 'SW2' ||
          c.code === 'SEL' ||
          d.kind === 'breaker' ||
          d.kind === 'breaker3' ||
          d.kind === 'switch' ||
          d.kind === 'selector'
        ) {
          triggerComponentCommand(c.id, 'toggle');
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
  const selectedBusbar = (project.busbars || []).find((b: any) => b.id === selectedBusbarId);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] bg-[#050A14] flex flex-col justify-between overflow-hidden select-none text-slate-200 font-sans" style={{ touchAction: 'none' }}>
      {/* 1. TOP HEADER / TOOLBAR */}
      <header className="h-14 landscape:h-10 px-3 sm:px-4 bg-[#0B132B] border-b border-blue-900/50 flex items-center justify-between gap-2 shrink-0 z-30 shadow-xl">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black shadow-md shadow-blue-900/40">
            ⚡
          </div>
          <div>
            <h1 className="text-xs sm:text-sm font-black text-white tracking-wide flex items-center gap-1.5">
              <span>TécnicaMZ Pro</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 font-mono border border-blue-800">
                CAD V14
              </span>
            </h1>
            <p className="text-[10px] text-slate-400 hidden md:block">
              {project.name} • Simulação Nodal MNA Real & IEC 60947
            </p>
          </div>
        </div>

        {/* Barra Central de Comandos */}
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
            <option value="24+">+24V DC</option>
            <option value="24-">0V DC</option>
            <option value="CTRL">Comando (Amarelo)</option>
          </select>

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
            className="px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-800"
          >
            <span>📐</span>
            <span className="hidden md:inline">Auto-Organizar</span>
          </button>

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

          <button
            type="button"
            onClick={() => setIsPanelConfigOpen(prev => !prev)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border transition cursor-pointer flex items-center gap-1.5 ${
              isPanelConfigOpen ? 'bg-amber-600/30 text-amber-300 border-amber-500/60' : 'bg-slate-900 text-slate-300 border-slate-800'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Quadro Geral</span>
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
            <span className="hidden sm:inline">{diagnosticState.isSpeaking ? 'Aviso em Execução...' : 'Voz & Diagnósticos'}</span>
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

          <button
            type="button"
            onClick={() => setIsPublishDialogOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-blue-900/40 cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
            <span className="hidden sm:inline">Publicar</span>
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

      {/* 2. ÁREA DE TRABALHO */}
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

        {selectedWireId && (() => {
          const selWire = project.wires.find(w => w.id === selectedWireId);
          return (
            <div className="absolute top-14 sm:top-16 left-1/2 -translate-x-1/2 z-30 flex flex-wrap items-center justify-center gap-2 bg-[#0F172A]/95 border border-sky-500/60 shadow-2xl backdrop-blur-md px-3.5 py-2 rounded-2xl">
              <span className="text-xs font-black text-sky-200">
                Condutor: <strong className="text-white font-mono">{selWire?.type || 'L1'}</strong>
                {selWire?.voltageDrop ? ` (ΔV: ${selWire.voltageDrop}V)` : ''}
              </span>

              <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
                {(['L1', 'L2', 'L3', 'N', 'PE'] as const).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      const updated = {
                        ...projectRef.current,
                        wires: projectRef.current.wires.map(w => (w.id === selectedWireId ? { ...w, type: t } : w)),
                        updated: Date.now()
                      };
                      projectRef.current = updated;
                      setProject(updated);
                      soundFX?.playClick?.();
                    }}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      selWire?.type === t ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1 bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-800 text-xs">
                <span className="text-[10px] text-slate-400">Bitola:</span>
                <select
                  value={Number(selWire?.gauge || 2.5)}
                  onChange={e => {
                    const g = Number(e.target.value);
                    const updated = {
                      ...projectRef.current,
                      wires: projectRef.current.wires.map(w => (w.id === selectedWireId ? { ...w, gauge: g } : w)),
                      updated: Date.now()
                    };
                    projectRef.current = updated;
                    setProject(updated);
                    showToast(`Bitola alterada para ${g} mm²`);
                  }}
                  className="bg-transparent text-amber-300 font-mono text-[11px] font-bold outline-none"
                >
                  <option value={1.5} className="bg-slate-900 text-white">1.5 mm²</option>
                  <option value={2.5} className="bg-slate-900 text-white">2.5 mm²</option>
                  <option value={4.0} className="bg-slate-900 text-white">4.0 mm²</option>
                  <option value={6.0} className="bg-slate-900 text-white">6.0 mm²</option>
                  <option value={10.0} className="bg-slate-900 text-white">10.0 mm²</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => deleteWire(selectedWireId)}
                className="px-2.5 py-1 rounded-xl bg-rose-600/30 text-rose-300 border border-rose-500/40 text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Excluir</span>
              </button>

              <button type="button" onClick={() => setSelectedWireId(null)} className="p-1 rounded-lg text-slate-400 hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })()}

        {/* BIBLIOTECA LATERAL ESQUERDA */}
        {showLibrary && (
          <div className="absolute left-3 top-3 bottom-16 sm:bottom-4 w-72 max-w-[calc(100vw-24px)] bg-[#0A1224]/95 border border-blue-900/50 rounded-2xl shadow-2xl flex flex-col z-20 backdrop-blur-md overflow-hidden">
            <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-[#0E1A33]">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-black text-white">Biblioteca Técnica</span>
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
                  placeholder="Pesquisar..."
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
              {(selectedCategory === 'busbars' || selectedCategory === 'all') && (
                <div className="space-y-1.5 pb-2 border-b border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => addBusbar('din', undefined, undefined, 680, 'horizontal')}
                    className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700/60 flex items-center justify-between text-left"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-xs">DIN</div>
                      <div className="text-xs font-bold text-slate-200">Trilho DIN 35mm</div>
                    </div>
                    <Plus className="w-3.5 h-3.5 text-slate-500" />
                  </button>
                  <div className="grid grid-cols-3 gap-1">
                    <button type="button" onClick={() => addBusbar('phase_l1')} className="p-1 rounded bg-red-950 text-[10px] text-red-300 font-bold">+ Barr. L1</button>
                    <button type="button" onClick={() => addBusbar('phase_l2')} className="p-1 rounded bg-slate-800 text-[10px] text-slate-300 font-bold">+ Barr. L2</button>
                    <button type="button" onClick={() => addBusbar('phase_l3')} className="p-1 rounded bg-amber-950 text-[10px] text-amber-300 font-bold">+ Barr. L3</button>
                  </div>
                  <div className="grid grid-cols-2 gap-1 pt-1">
                    <button type="button" onClick={() => addBusbar('neutral')} className="p-1 rounded bg-sky-950 text-[10px] text-sky-300 font-bold">+ Neutro (N)</button>
                    <button type="button" onClick={() => addBusbar('earth')} className="p-1 rounded bg-emerald-950 text-[10px] text-emerald-300 font-bold">+ Terra (PE)</button>
                  </div>
                </div>
              )}

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

        {/* PAINEL FLUTUANTE DE INSTRUMENTAÇÃO TRUE-RMS REAL */}
        {showMeters && (
          <div className="absolute left-3 bottom-16 sm:bottom-3 z-10 px-3.5 py-2.5 rounded-2xl bg-[#0A1224]/90 border border-blue-900/40 shadow-xl backdrop-blur-md flex items-center gap-4 text-xs font-mono">
            <div>Tensão: <strong className="text-amber-400">{meterV.toFixed(1)} V</strong></div>
            <div className="h-4 w-px bg-slate-800" />
            <div>Corrente: <strong className="text-emerald-400">{meterA.toFixed(2)} A</strong></div>
            <div className="h-4 w-px bg-slate-800" />
            <div>Potência: <strong className="text-blue-400">{meterW} W</strong></div>
            <div className="h-4 w-px bg-slate-800" />
            <div>FP: <strong className="text-purple-300">{meterPF.toFixed(2)}</strong></div>
          </div>
        )}

        {/* CONTROLE DE ZOOM & FIT */}
        <div className="absolute right-3 bottom-16 sm:bottom-3 z-10 flex items-center gap-1.5 p-1.5 rounded-xl bg-[#0A1224]/90 border border-blue-900/40 shadow-xl backdrop-blur-md">
          <button
            type="button"
            onClick={() => { cameraRef.current.zoom = Math.max(0.1, cameraRef.current.zoom * 0.85); }}
            className="w-7 h-7 rounded-lg bg-slate-900 text-slate-300 font-bold text-xs"
          >
            −
          </button>
          <button
            type="button"
            onClick={() => { cameraRef.current.zoom = 1.0; }}
            className="text-[11px] font-mono px-1.5 py-0.5 text-slate-300 font-bold"
          >
            {Math.round((cameraRef.current?.zoom || 1) * 100)}%
          </button>
          <button
            type="button"
            onClick={() => { cameraRef.current.zoom = Math.min(5.0, cameraRef.current.zoom * 1.15); }}
            className="w-7 h-7 rounded-lg bg-slate-900 text-slate-300 font-bold text-xs"
          >
            +
          </button>
          <button
            type="button"
            onClick={handleFit}
            className="px-2 py-1 rounded-lg bg-slate-900 text-slate-300 text-[11px] font-bold"
          >
            ⌗ Fit
          </button>
        </div>
      </div>

      {/* 3. DOCK DE NAVEGAÇÃO RÁPIDA (RODAPÉ RESPONSIVO) */}
      <footer className="flex lg:hidden h-11 bg-[#070D1B]/95 border-t border-slate-800 items-center justify-around px-2 z-40">
        <button type="button" onClick={() => setShowLibrary(!showLibrary)} className="text-[10px] text-slate-400 font-bold flex flex-col items-center">
          <Layers className="w-4 h-4" />
          <span>Biblioteca</span>
        </button>
        <button type="button" onClick={() => setShowProps(!showProps)} className="text-[10px] text-slate-400 font-bold flex flex-col items-center">
          <Sliders className="w-4 h-4" />
          <span>Propriedades</span>
        </button>
        <button type="button" onClick={handleFit} className="text-[10px] text-slate-400 font-bold flex flex-col items-center">
          <Maximize2 className="w-4 h-4" />
          <span>Enquadrar</span>
        </button>
        <button type="button" onClick={() => setIsPublishDialogOpen(true)} className="text-[10px] text-amber-300 font-bold flex flex-col items-center">
          <Zap className="w-4 h-4 fill-amber-300" />
          <span>Publicar</span>
        </button>
      </footer>

      {/* 4. MODAL DE PUBLICAÇÃO NO MURAL */}
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
