import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CadCircuitProject } from '../../types';
import { soundFX } from '../../utils/audio';
import {
  COMPONENT_CATALOG,
  COMPONENT_MAP,
  CATEGORIES,
  WIRE_COLORS,
  getComponentDef,
  cx,
  ca,
  cs,
  cm,
  cd,
  cabs,
  cpolar,
  gaussComplex,
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
  PanelEnclosureSize,
  PanelBackplateStyle,
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
  calculateManhattanPath,
  drawProfessionalWire,
  autoOrganizeCircuitWiring,
  WIRE_NORM_COLORS
} from './cadRouting';
import {
  Zap,
  Play,
  Square,
  RotateCcw,
  Plus,
  Trash2,
  Copy,
  RotateCw,
  Maximize2,
  Minimize2,
  X,
  Share2,
  Download,
  Upload,
  Image as ImageIcon,
  Activity,
  Sliders,
  Send,
  AlertTriangle,
  Info,
  CheckCircle2,
  Search,
  Layers,
  Cpu,
  Eye,
  Settings2,
  FileText,
  Bot,
  Sparkles,
  Radio,
  Volume2,
  VolumeX,
  Sun
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

export const CadSimulatorWorkbenchModal: React.FC<CadSimulatorWorkbenchModalProps> = ({
  isOpen,
  onClose,
  initialCircuit,
  onPublishCircuit,
  currentUser,
  temSeloMZ = false
}) => {
  // Referência do Canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const scopeCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Estados do Projeto CAD
  const [project, setProject] = useState<{
    version: number;
    name: string;
    components: any[];
    wires: any[];
    busbars: Busbar[];
    panelConfig?: PanelEnclosureConfig;
    updated?: number;
  }>({
    version: 11,
    name: initialCircuit?.title || 'Projeto TécnicaMz Pro',
    components: [],
    wires: [],
    busbars: [],
    panelConfig: PANEL_PRESETS.large,
    updated: Date.now()
  });

  // Ferramenta Ativa & Seleção
  const [activeTool, setActiveTool] = useState<'select' | 'wire' | 'pan'>('select');
  const [selectedWireType, setSelectedWireType] = useState<string>('L1');
  const [selectedCompId, setSelectedCompId] = useState<string | null>(null);
  const [selectedWireId, setSelectedWireId] = useState<string | null>(null);
  const [selectedBusbarId, setSelectedBusbarId] = useState<string | null>(null);
  const [hoveredTerminalId, setHoveredTerminalId] = useState<string | null>(null);
  const [isPanelConfigOpen, setIsPanelConfigOpen] = useState<boolean>(false);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  // Painéis Flutuantes Visíveis / Minimizados
  const [showLibrary, setShowLibrary] = useState<boolean>(true);
  const [showProps, setShowProps] = useState<boolean>(true);
  const [showMeters, setShowMeters] = useState<boolean>(true);
  const [showScope, setShowScope] = useState<boolean>(false);
  const [showSolver, setShowSolver] = useState<boolean>(false);
  const [showEvents, setShowEvents] = useState<boolean>(false);

  // Biblioteca / Pesquisa
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Notificações Toast & Falha
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [faultAlert, setFaultAlert] = useState<string | null>(null);

  // Leituras Globais de Instrumentação
  const [meterV, setMeterV] = useState<number>(0);
  const [meterA, setMeterA] = useState<number>(0);
  const [meterW, setMeterW] = useState<number>(0);
  const [meterHz, setMeterHz] = useState<number>(50);
  const [meterPF, setMeterPF] = useState<number>(1.0);
  const [solverIters, setSolverIters] = useState<number>(0);
  const [solverShortDetected, setSolverShortDetected] = useState<boolean>(false);

  // Controles do Osciloscópio True-RMS
  const [scopeChannel, setScopeChannel] = useState<'CH1' | 'CH2' | 'DUAL'>('DUAL');
  const [scopeVoltsDiv, setScopeVoltsDiv] = useState<number>(100);
  const [scopeTimeDiv, setScopeTimeDiv] = useState<number>(2);

  // Diálogo de Publicação no Mural
  const [isPublishDialogOpen, setIsPublishDialogOpen] = useState<boolean>(false);
  const [publishTitle, setPublishTitle] = useState<string>('');
  const [publishCategory, setPublishCategory] = useState<string>('Comandos Elétricos');
  const [publishDescription, setPublishDescription] = useState<string>('');
  const [allowTesting, setAllowTesting] = useState<boolean>(true);
  const [publishTags, setPublishTags] = useState<string[]>(['Simulação CAD', 'IEC 60947', 'Bancada MZ']);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);

  // Histórico de Undo / Redo
  const undoStackRef = useRef<any[]>([]);
  const redoStackRef = useRef<any[]>([]);

  // Estados Interiores do Canvas (Câmera, Pan, Zoom, Simulação)
  const cameraRef = useRef<{
    zoom: number;
    pan: { x: number; y: number };
    grid: number;
  }>({
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
    pinch: {
      initialDist: number;
      initialMid: { x: number; y: number };
      startZoom: number;
      startPan: { x: number; y: number };
    } | null;
    longPressTimer: any;
    lastContactorState: boolean;
    motorRpm: number;
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
    motorRpm: 0
  });

  // Mensagem Toast Rápida
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  }, []);

  const addEvent = useCallback((text: string, type: 'info' | 'warn' | 'trip' = 'info') => {
    const timeStr = new Date().toLocaleTimeString();
    simRef.current.events.unshift({ time: timeStr, text, type });
    if (simRef.current.events.length > 50) simRef.current.events.pop();
  }, []);

  // Salvar Histórico Undo
  const pushHistory = useCallback(() => {
    undoStackRef.current.push(JSON.parse(JSON.stringify(project)));
    if (undoStackRef.current.length > 30) undoStackRef.current.shift();
    redoStackRef.current = [];
  }, [project]);

  const handleUndo = useCallback(() => {
    if (undoStackRef.current.length === 0) {
      showToast('Nada para desfazer');
      return;
    }
    redoStackRef.current.push(JSON.parse(JSON.stringify(project)));
    const prev = undoStackRef.current.pop();
    setProject(prev);
    setSelectedCompId(null);
    setSelectedWireId(null);
    showToast('Ação desfeita');
  }, [project, showToast]);

  const handleRedo = useCallback(() => {
    if (redoStackRef.current.length === 0) {
      showToast('Nada para refazer');
      return;
    }
    undoStackRef.current.push(JSON.parse(JSON.stringify(project)));
    const next = redoStackRef.current.pop();
    setProject(next);
    setSelectedCompId(null);
    setSelectedWireId(null);
    showToast('Ação refeita');
  }, [project, showToast]);

  // Carregar Circuito Inicial / Preset
  useEffect(() => {
    if (initialCircuit?.cadData?.components && initialCircuit.cadData.components.length > 0) {
      setProject({
        version: initialCircuit.cadData.version || 11,
        name: initialCircuit.cadData.name || initialCircuit.title,
        components: initialCircuit.cadData.components,
        wires: initialCircuit.cadData.wires || [],
        busbars: initialCircuit.cadData.busbars || DEFAULT_MOTOR_BUSBARS,
        panelConfig: initialCircuit.cadData.panelConfig || PANEL_PRESETS.large,
        updated: Date.now()
      });
      setPublishTitle(initialCircuit.title);
      setPublishDescription(initialCircuit.description || '');
      setPublishCategory(initialCircuit.category || 'Comandos Elétricos');
      addEvent(`Circuito "${initialCircuit.title}" carregado com sucesso.`);
    } else {
      // Carrega preset padrão de acordo com circuitType
      const ctype = initialCircuit?.circuitType || 'direct_motor';
      if (ctype === 'four_way') {
        const p = generateFourWayLightingCircuit();
        setProject({
          version: 11,
          name: 'Comutação Four-Way / Three-Way (IEC 60364)',
          components: p.components,
          wires: p.wires,
          busbars: DEFAULT_FOURWAY_BUSBARS,
          panelConfig: PANEL_PRESETS.compact,
          updated: Date.now()
        });
        setPublishTitle('Comutação Four-Way / Three-Way em 3 Pavimentos (IEC 60364)');
        setPublishCategory('Instalações Elétricas');
        setPublishDescription('Esquema de comutação intermediária com 2 Three-Way e 1 Four-Way para acionamento independente de lâmpadas.');
      } else if (ctype === 'qgd_protection') {
        const p = generateQgdProtectionCircuit();
        setProject({
          version: 11,
          name: 'Quadro QGD com Proteção IDR 30mA (IEC 60364)',
          components: p.components,
          wires: p.wires,
          busbars: DEFAULT_QGD_BUSBARS,
          panelConfig: PANEL_PRESETS.medium,
          updated: Date.now()
        });
        setPublishTitle('Quadro de Distribuição QGD com IDR 30mA e Seletividade');
        setPublishCategory('Proteção & Aterramento');
        setPublishDescription('Quadro geral de baixa tensão com disjuntor de 63A, IDR 30mA Tipo A e circuitos terminais protegidos.');
      } else {
        const p = generateDirectMotorStarterCircuit();
        setProject({
          version: 11,
          name: 'Partida Direta de Motor Trifásico (IEC 60947-4-1)',
          components: p.components,
          wires: p.wires,
          busbars: DEFAULT_MOTOR_BUSBARS,
          panelConfig: PANEL_PRESETS.large,
          updated: Date.now()
        });
        setPublishTitle('Partida Direta de Motor Trifásico com Selo e Relé Térmico (IEC 60947)');
        setPublishCategory('Comandos Elétricos');
        setPublishDescription('Circuito completo de força e comando para motor trifásico 380V (7.5 kW). Inclui coordenação Tipo 2 com disjuntor-motor Q1, contator KM1, relé de sobrecarga F1 e botoeiras S0/S1.');
      }
    }
  }, [initialCircuit, addEvent]);

  // Função para centralizar / auto-enquadrar circuito na folha
  const handleFit = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || (project.components.length === 0 && (!project.busbars || project.busbars.length === 0))) {
      cameraRef.current.zoom = 1;
      cameraRef.current.pan = { x: canvas ? canvas.width / 4 : 0, y: canvas ? canvas.height / 4 : 0 };
      return;
    }
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    project.components.forEach(c => {
      minX = Math.min(minX, c.x - c.w / 2);
      maxX = Math.max(maxX, c.x + c.w / 2);
      minY = Math.min(minY, c.y - c.h / 2);
      maxY = Math.max(maxY, c.y + c.h / 2);
    });
    (project.busbars || []).forEach(b => {
      const isH = b.orientation === 'horizontal';
      const halfL = (b.length || 600) / 2;
      const halfH = (b.type === 'din' ? 35 : 14) / 2;
      minX = Math.min(minX, b.x - (isH ? halfL : halfH));
      maxX = Math.max(maxX, b.x + (isH ? halfL : halfH));
      minY = Math.min(minY, b.y - (isH ? halfH : halfL));
      maxY = Math.max(maxY, b.y + (isH ? halfH : halfL));
    });

    if (project.panelConfig?.enabled) {
      const halfW = project.panelConfig.width / 2;
      const halfH = project.panelConfig.height / 2;
      const px = project.panelConfig.x || 0;
      const py = project.panelConfig.y || 0;
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
    showToast('Circuito enquadrado na tela');
  }, [project.components, project.busbars, showToast]);

  // Carregar Presets Rápidos
  const loadPreset = useCallback((type: 'motor' | 'four_way' | 'qgd' | 'solar' | 'new') => {
    pushHistory();
    if (type === 'new') {
      setProject({
        version: 11,
        name: 'Novo Projeto Técnico MZ',
        components: [],
        wires: [],
        busbars: [],
        panelConfig: PANEL_PRESETS.medium,
        updated: Date.now()
      });
      setSelectedCompId(null);
      setSelectedWireId(null);
      setSelectedBusbarId(null);
      showToast('Novo projeto em branco criado');
      return;
    }
    if (type === 'motor') {
      const p = generateDirectMotorStarterCircuit();
      setProject({
        version: 11,
        name: 'Partida Direta de Motor Trifásico (IEC 60947)',
        components: p.components,
        wires: p.wires,
        busbars: DEFAULT_MOTOR_BUSBARS,
        panelConfig: PANEL_PRESETS.large,
        updated: Date.now()
      });
      showToast('Partida Direta carregada');
    } else if (type === 'four_way') {
      const p = generateFourWayLightingCircuit();
      setProject({
        version: 11,
        name: 'Comutação Four-Way / Three-Way',
        components: p.components,
        wires: p.wires,
        busbars: DEFAULT_FOURWAY_BUSBARS,
        panelConfig: PANEL_PRESETS.compact,
        updated: Date.now()
      });
      showToast('Comutação Four-Way carregada');
    } else if (type === 'qgd') {
      const p = generateQgdProtectionCircuit();
      setProject({
        version: 11,
        name: 'Quadro QGD com IDR 30mA',
        components: p.components,
        wires: p.wires,
        busbars: DEFAULT_QGD_BUSBARS,
        panelConfig: PANEL_PRESETS.medium,
        updated: Date.now()
      });
      showToast('Quadro QGD carregado');
    } else if (type === 'solar') {
      const p = generateSolarPVIsoCircuit();
      setProject({
        version: 11,
        name: 'Sistema Solar Fotovoltaico On-Grid com String Box (IEC 62548)',
        components: p.components,
        wires: p.wires,
        busbars: [],
        panelConfig: PANEL_PRESETS.industrial,
        updated: Date.now()
      });
      showToast('Sistema Solar Fotovoltaico carregado');
    }
    setSelectedCompId(null);
    setSelectedWireId(null);
    setSelectedBusbarId(null);
    setTimeout(handleFit, 60);
  }, [pushHistory, handleFit, showToast]);

  // Adicionar Componente à Bancada
  const addComponentToCanvas = useCallback((code: string) => {
    const cdef = getComponentDef(code);
    pushHistory();

    const canvas = canvasRef.current;
    let spawnX = 0;
    let spawnY = 0;
    if (canvas) {
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

    setProject(prev => ({
      ...prev,
      components: [...prev.components, newComp],
      updated: Date.now()
    }));
    setSelectedCompId(newComp.id);
    setSelectedWireId(null);
    soundFX.playClick();
    addEvent(`${cdef.name} inserido no diagrama.`);
    showToast(`${cdef.name} adicionado`);
  }, [pushHistory, addEvent, showToast]);

  // Avisos Técnicos por Voz & Diagnóstico IEC (Voz Feminina em Português)
  const [isDiagnosticPanelOpen, setIsDiagnosticPanelOpen] = useState(false);
  const [diagnosticState, setDiagnosticState] = useState<DiagnosticEngineState>(
    simulatorDiagnostics.getState()
  );

  useEffect(() => {
    const unsub = simulatorDiagnostics.subscribe(s => setDiagnosticState(s));
    return () => unsub();
  }, []);

  // Registro da Ponte CAD com o Voice Orchestrator
  useEffect(() => {
    const unregister = voiceOrchestrator.registerCadBridge({
      isOpen: true,
      openSimulator: () => {},
      closeSimulator: onClose,
      getProject: () => project,
      setProject: setProject,
      isRunning: isRunning,
      setIsRunning: setIsRunning,
      addComponent: (type: string, x?: number, y?: number, onBusbar?: boolean) => {
        addComponentToCanvas(type);
        return type;
      },
      connectTerminals: (params: any) => {
        const { sourceCompId, sourceTerminal, targetCompId, targetTerminal, wireType } = params;
        const compA = project.components.find((c: any) => c.id === sourceCompId || c.code === sourceCompId);
        const compB = project.components.find((c: any) => c.id === targetCompId || c.code === targetCompId);
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
          live: isRunning
        };
        setProject(prev => ({
          ...prev,
          wires: [...prev.wires, newWire],
          updated: Date.now()
        }));
        showToast('Condutores interligados');
        return true;
      },
      removeComponent: (compId: string) => {
        pushHistory();
        setProject(prev => ({
          ...prev,
          components: prev.components.filter((c: any) => c.id !== compId),
          wires: prev.wires.filter((w: any) => w.a.c !== compId && w.b.c !== compId),
          updated: Date.now()
        }));
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
  }, [project, isRunning, addComponentToCanvas, pushHistory, loadPreset, onClose, showToast]);

  // Girar Componente Selecionado (90°)
  const rotateSelectedComponent = useCallback(() => {
    if (!selectedCompId) return;
    pushHistory();
    setProject(prev => {
      const updated = prev.components.map(c => {
        if (c.id === selectedCompId) {
          return { ...c, rot: (c.rot + 90) % 360 };
        }
        return c;
      });
      return { ...prev, components: updated, updated: Date.now() };
    });
    soundFX.playClick();
    showToast('Componente girado 90°');
  }, [selectedCompId, pushHistory, showToast]);

  // Duplicar Componente Selecionado
  const duplicateSelectedComponent = useCallback(() => {
    if (!selectedCompId) return;
    const comp = project.components.find(c => c.id === selectedCompId);
    if (!comp) return;
    pushHistory();
    const dup = JSON.parse(JSON.stringify(comp));
    dup.id = `${comp.code}_${Math.random().toString(36).substring(2, 7)}`;
    dup.x += 40;
    dup.y += 40;
    setProject(prev => ({
      ...prev,
      components: [...prev.components, dup],
      updated: Date.now()
    }));
    setSelectedCompId(dup.id);
    soundFX.playClick();
    showToast('Componente duplicado');
  }, [selectedCompId, project.components, pushHistory, showToast]);

  // Adicionar Barramento ou Trilho DIN ao Painel (Com Bornes de Ligação Elétrica)
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

    // Gera os pontos de entrada/saída para condutores
    const terminals = generateBusbarTerminals(
      busbarId,
      type,
      targetX,
      targetY,
      length,
      orientation
    );

    const newBusbar: Busbar = {
      id: busbarId,
      type,
      x: targetX,
      y: targetY,
      length,
      orientation,
      terminals
    };

    setProject((prev: any) => ({
      ...prev,
      busbars: [...(prev.busbars || []), newBusbar],
      updated: Date.now()
    }));

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

    showToast(`${typeLabel} adicionado com ${terminals.length} bornes de conexão.`);
    addEvent(`${typeLabel} inserido com nós de ligação elétricos.`);
  },
  [pushHistory, addEvent, showToast]
);

  // Excluir Seleção (Componente, Fio ou Barramento)
  const deleteSelected = useCallback(() => {
    if (selectedCompId) {
      pushHistory();
      setProject(prev => ({
        ...prev,
        components: prev.components.filter(c => c.id !== selectedCompId),
        wires: prev.wires.filter(w => w.a.c !== selectedCompId && w.b.c !== selectedCompId),
        updated: Date.now()
      }));
      setSelectedCompId(null);
      soundFX.playClick();
      showToast('Componente removido');
    } else if (selectedWireId) {
      pushHistory();
      setProject(prev => ({
        ...prev,
        wires: prev.wires.filter(w => w.id !== selectedWireId),
        updated: Date.now()
      }));
      setSelectedWireId(null);
      soundFX.playClick();
      showToast('Condutor removido');
    } else if (selectedBusbarId) {
      pushHistory();
      setProject((prev: any) => ({
        ...prev,
        busbars: (prev.busbars || []).filter((b: any) => b.id !== selectedBusbarId),
        updated: Date.now()
      }));
      setSelectedBusbarId(null);
      soundFX?.playClick?.();
      showToast('Barramento/Trilho removido');
    }
  }, [selectedCompId, selectedWireId, selectedBusbarId, pushHistory, showToast]);

  // Teclas de Atalho CAD (Delete, Backspace, Esc, Ctrl+Z)
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

  // Comandos Físicos Rápidos no Componente (Ligar, Desligar, Pulsar, Rearmar)
  const triggerComponentCommand = useCallback((compId: string, action: 'toggle' | 'on' | 'off' | 'pulse' | 'reset') => {
    setProject(prev => {
      const updated = prev.components.map(c => {
        if (c.id === compId) {
          const d = getComponentDef(c.code);
          const st = { ...c.state };

          if (action === 'reset') {
            st.tripped = false;
            st.fault = false;
            st.faultCause = '';
            st.burned = false;
            st.closed = d.params?.closed ?? false;
            st.energized = false;
            st.running = false;
            st.rpm = 0;
            simRef.current.trippedSet.delete(compId);
            addEvent(`${d.name}: Proteção / estado resetado.`, 'info');
          } else if (action === 'pulse') {
            st.pressed = true;
            st.closed = true;
            setTimeout(() => {
              setProject(curr => ({
                ...curr,
                components: curr.components.map(item =>
                  item.id === compId ? { ...item, state: { ...item.state, pressed: false, closed: d.momentary ? false : item.state.closed } } : item
                )
              }));
            }, 300);
          } else {
            const nextOn = action === 'toggle' ? !st.closed : action === 'on';
            st.closed = nextOn;
            st.commanded = nextOn;
          }
          return { ...c, state: st };
        }
        return c;
      });
      return { ...prev, components: updated, updated: Date.now() };
    });
    soundFX.playClick();
  }, [addEvent]);

  // ==========================================================================
  // EXPORTAÇÃO & IMPORTAÇÃO DE ARQUIVOS (JSON / IMAGEM PNG)
  // ==========================================================================
  const handleExportJSON = () => {
    const dataStr = JSON.stringify(project, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(project.name || 'circuito_tecnicamz').replace(/\s+/g, '_')}.json`;
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
          setProject({
            version: imported.version || 11,
            name: imported.name || 'Projeto Importado',
            components: imported.components,
            wires: imported.wires,
            busbars: Array.isArray(imported.busbars) ? imported.busbars : [],
            updated: Date.now()
          });
          setSelectedCompId(null);
          setSelectedWireId(null);
          setSelectedBusbarId(null);
          showToast('Projeto importado com sucesso');
          setTimeout(handleFit, 60);
        } else {
          alert('Arquivo JSON inválido. Estrutura de circuito não reconhecida.');
        }
      } catch (err) {
        alert('Erro ao carregar arquivo JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleExportImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `${(project.name || 'esquema_eletrico').replace(/\s+/g, '_')}.png`;
    link.click();
    showToast('Diagrama exportado em PNG de alta resolução');
  };

  // ==========================================================================
  // CONFIRMAÇÃO DE PUBLICAÇÃO NO MURAL TÉCNICO
  // ==========================================================================
  const handleConfirmPublish = async () => {
    if (!publishTitle.trim() || !publishDescription.trim()) {
      alert('Por favor, informe um título e uma descrição técnica para o circuito.');
      return;
    }

    setIsPublishing(true);
    try {
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
          version: project.version || 11,
          name: publishTitle.trim(),
          components: project.components,
          wires: project.wires,
          busbars: project.busbars || [],
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
      alert(err?.message || 'Falha ao publicar projeto no mural.');
    } finally {
      setIsPublishing(false);
    }
  };

  // Cleanup de sintetizadores sonoros ao desmontar o componente
  useEffect(() => {
    return () => {
      soundFX.stopMotorSound();
      soundFX.stopBuzzerSound();
    };
  }, []);

  // ==========================================================================
  // MOTOR DE CÁLCULO NODAL (MNA) & TOPOLOGIA NORMATIVA IEC/DIN
  // ==========================================================================
  const terminalPos = useCallback((comp: any, termId: string) => {
    return getTerminalWorldPos(comp, termId);
  }, []);

  // Loop de Renderização do Canvas 2D
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
    window.addEventListener('resize', resizeCanvas);

    // Render loop
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

      // 1. Limpar Fundo (Dark Industrial Theme)
      ctx.fillStyle = '#060D1A';
      ctx.fillRect(0, 0, w, h);

      // 2. Desenhar Grid CAD Técnico Adaptativo (Milimétrico & Macro)
      ctx.save();
      const baseGrid = cam.grid || 20;
      const step = baseGrid * cam.zoom;
      const ox = ((cam.pan.x % step) + step) % step;
      const oy = ((cam.pan.y % step) + step) % step;

      // Subdivisões finas (quando zoom > 1.8x)
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

      // Grade padrão
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

      // Módulos maiores (a cada 5 passos da grade = 100mm)
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

      // Cruzetas nos cruzamentos macro (+)
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      for (let x = macroOx; x < w; x += macroStep) {
        for (let y = macroOy; y < h; y += macroStep) {
          ctx.moveTo(x - 4, y);
          ctx.lineTo(x + 4, y);
          ctx.moveTo(x, y - 4);
          ctx.lineTo(x, y + 4);
        }
      }
      ctx.stroke();
      ctx.restore();

      // Transformação de Câmera
      const toScreen = (p: { x: number; y: number }) => ({
        x: p.x * cam.zoom + cam.pan.x,
        y: p.y * cam.zoom + cam.pan.y
      });

      // 2. Quadro Geral / Armário Elétrico Industrial (Moldura, Chapa de Fundo, Canaletas e Avisos IEC)
      if (project.panelConfig?.enabled) {
        drawPanelEnclosure(ctx, cam, project.panelConfig);
      }

      // Determina barramentos energizados na simulação
      const activeLiveBusbars = new Set<string>();
      if (isRunning) {
        activeLiveBusbars.add('phase_l1');
        activeLiveBusbars.add('phase_l2');
        activeLiveBusbars.add('phase_l3');
        activeLiveBusbars.add('neutral');
        activeLiveBusbars.add('earth');
      }

      // 2.5 Desenhar Barramentos Elétricos e Trilhos DIN (Norma IEC 60715 / IEC 60446)
      drawBusbars(
        ctx,
        cam,
        project.busbars || [],
        selectedBusbarId,
        hoveredTerminalId,
        activeLiveBusbars
      );

      // 3. Fiação Profissional Ortogonal (Manhattan, Fillets, Anilhas Crimpadas e 3D)
      project.wires.forEach((wire, wireIdx) => {
        const posA = getNodeWorldPos(wire.a?.c, wire.a?.t, project.components, project.busbars || []);
        const posB = getNodeWorldPos(wire.b?.c, wire.b?.t, project.components, project.busbars || []);
        const pathPoints = calculateManhattanPath(posA, posB, wireIdx, wire.waypoints);
        const screenPoints = pathPoints.map(p => toScreen(p));

        if (screenPoints.length < 2) return;

        const isSelected = wire.id === selectedWireId;
        drawProfessionalWire(
          ctx,
          screenPoints,
          wire.type || 'L1',
          cam,
          isRunning && Boolean(wire.live),
          isSelected,
          simRef.current.time * 60
        );
      });

      // Fio em Criação (Preview Ortogonal Manhattan com Iluminação 3D)
      const currentDrag = simRef.current.drag;
      if (simRef.current.wireStart && currentDrag?.mouse) {
        const sPos = getNodeWorldPos(simRef.current.wireStart.c, simRef.current.wireStart.t, project.components, project.busbars || []);
        const mPos = { x: currentDrag.mouse.x, y: currentDrag.mouse.y, dir: 'top' as const };
        const pPath = calculateManhattanPath(sPos, mPos, 999).map(p => toScreen(p));
        if (pPath.length >= 2) {
          drawProfessionalWire(ctx, pPath, selectedWireType, cam, false, true, 0);
        }
      }

      // 4. Componentes Elétricos
      project.components.forEach(c => {
        const d = getComponentDef(c.code);
        const s = toScreen({ x: c.x, y: c.y });
        const cw = c.w * cam.zoom;
        const ch = c.h * cam.zoom;
        const isSel = c.id === selectedCompId;
        const st = c.state || {};
        const isEnergized = st.energized || st.running;

        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.rotate((c.rot * Math.PI) / 180);

        // Corpo do componente
        const radius = 8 * cam.zoom;
        const x = -cw / 2;
        const y = -ch / 2;

        let gradTop = '#0a1628';
        let gradBottom = '#040914';
        let strokeColor = '#1e3a5f';
        let glowColor = 'transparent';

        if (st.tripped) {
          gradTop = '#3b0712';
          gradBottom = '#180307';
          strokeColor = '#ef4444';
          glowColor = 'rgba(239, 68, 68, 0.45)';
        } else if (isSel) {
          gradTop = '#0c2847';
          gradBottom = '#041324';
          strokeColor = '#38bdf8';
          glowColor = 'rgba(56, 189, 248, 0.5)';
        } else if (isEnergized) {
          gradTop = '#062c22';
          gradBottom = '#02120e';
          strokeColor = '#10b981';
          glowColor = 'rgba(16, 185, 129, 0.35)';
        }

        const bodyGrad = ctx.createLinearGradient(0, y, 0, y + ch);
        bodyGrad.addColorStop(0, gradTop);
        bodyGrad.addColorStop(1, gradBottom);

        ctx.save();

        if (glowColor !== 'transparent') {
          ctx.shadowColor = glowColor;
          ctx.shadowBlur = isSel ? 16 * cam.zoom : 10 * cam.zoom;
        }

        ctx.fillStyle = bodyGrad;
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = isSel ? 2.5 * cam.zoom : 1.5 * cam.zoom;

        // Borda arredondada
        ctx.beginPath();
        ctx.roundRect(x, y, cw, ch, radius);
        ctx.fill();
        ctx.stroke();

        ctx.shadowColor = 'transparent';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 1 * cam.zoom;
        ctx.beginPath();
        ctx.moveTo(x + radius, y + 1.5 * cam.zoom);
        ctx.lineTo(x + cw - radius, y + 1.5 * cam.zoom);
        ctx.stroke();

        ctx.restore();

        // Animação Eletromecânica Específica
        if (d.kind === 'motor3' || d.kind === 'motor1' || d.kind === 'fan') {
          ctx.save();
          
          const isRunning = st.running;
          const rotorColor = isRunning ? '#064e3b' : '#1e293b';
          const strokeRotor = isRunning ? '#10b981' : '#475569';

          if (isRunning) {
            ctx.shadowColor = '#10b981';
            ctx.shadowBlur = 10 * cam.zoom;
          }

          // Rotor com rotação contínua
          ctx.fillStyle = rotorColor;
          ctx.beginPath();
          ctx.arc(0, -5 * cam.zoom, 16 * cam.zoom, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = strokeRotor;
          ctx.lineWidth = 1.8 * cam.zoom;
          ctx.stroke();
          ctx.shadowColor = 'transparent';

          // Lâminas girando
          ctx.save();
          ctx.translate(0, -5 * cam.zoom);
          ctx.rotate(isRunning ? (simRef.current.time * (st.rpm || 1500) * 0.05) : 0);
          ctx.strokeStyle = isRunning ? '#6ee7b7' : '#64748b';
          ctx.lineWidth = 2 * cam.zoom;
          ctx.lineCap = 'round';

          for (let i = 0; i < 4; i++) {
            ctx.rotate(Math.PI / 2);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(0, -12 * cam.zoom);
            ctx.stroke();
          }
          ctx.restore();

          // Rótulo RPM
          ctx.fillStyle = isRunning ? '#34d399' : '#64748b';
          ctx.font = `bold ${Math.max(8, 9 * cam.zoom)}px monospace`;
          ctx.textAlign = 'center';

          if (isRunning) {
            ctx.shadowColor = 'rgba(52, 211, 153, 0.6)';
            ctx.shadowBlur = 6 * cam.zoom;
          }
          
          ctx.fillText(isRunning ? `${st.rpm || 2920} RPM` : 'PARADO', 0, 24 * cam.zoom);
          ctx.restore();

        } else if (d.kind === 'lamp') {
          // Lâmpada Sinalizadora de Painel Premium
          const lampOn = st.energized && !st.tripped;
          const lampRadius = 14 * cam.zoom;

          if (lampOn) {
            ctx.save();
            // Glow externo multicamada ultra brilhante
            ctx.shadowColor = '#facc15';
            ctx.shadowBlur = 28 * cam.zoom;
            ctx.fillStyle = '#fef08a';
            ctx.beginPath();
            ctx.arc(0, -4 * cam.zoom, lampRadius, 0, Math.PI * 2);
            ctx.fill();

            // Núcleo incandescente reluzente
            const lampGrad = ctx.createRadialGradient(0, -4 * cam.zoom, 2 * cam.zoom, 0, -4 * cam.zoom, lampRadius);
            lampGrad.addColorStop(0, '#ffffff');
            lampGrad.addColorStop(0.4, '#fef08a');
            lampGrad.addColorStop(1, '#eab308');
            ctx.fillStyle = lampGrad;
            ctx.beginPath();
            ctx.arc(0, -4 * cam.zoom, lampRadius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          } else {
            // Lâmpada desligada com reflexo em lente cônica de policarbonato
            const offGrad = ctx.createRadialGradient(-3 * cam.zoom, -7 * cam.zoom, 1 * cam.zoom, 0, -4 * cam.zoom, lampRadius);
            offGrad.addColorStop(0, '#334155');
            offGrad.addColorStop(0.7, '#1e293b');
            offGrad.addColorStop(1, '#0f172a');
            ctx.fillStyle = offGrad;
            ctx.beginPath();
            ctx.arc(0, -4 * cam.zoom, lampRadius, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#475569';
            ctx.lineWidth = 1.8 * cam.zoom;
            ctx.stroke();
          }

          // Filamento Interno Estilizado e Reforçado
          ctx.save();
          ctx.strokeStyle = lampOn ? '#ffffff' : '#94a3b8';
          ctx.lineWidth = lampOn ? 2.2 * cam.zoom : 1.5 * cam.zoom;
          if (lampOn) {
            ctx.shadowColor = '#fef08a';
            ctx.shadowBlur = 8 * cam.zoom;
          }
          ctx.beginPath();
          // Filamento em Zig-Zag duplo de Tungstênio
          ctx.moveTo(-7 * cam.zoom, 2 * cam.zoom);
          ctx.lineTo(-3 * cam.zoom, -8 * cam.zoom);
          ctx.lineTo(0, -3 * cam.zoom);
          ctx.lineTo(3 * cam.zoom, -8 * cam.zoom);
          ctx.lineTo(7 * cam.zoom, 2 * cam.zoom);
          ctx.stroke();
          ctx.restore();

        } else if (d.kind === 'contactor' || d.kind === 'relay') {
          // Contator Industrial / Relé de Potência
          const coilOn = st.energized;
          ctx.save();
          
          // Núcleo magnético em gradiente
          const coreGrad = ctx.createLinearGradient(0, -ch * 0.3, 0, 0);
          coreGrad.addColorStop(0, coilOn ? '#047857' : '#1e293b');
          coreGrad.addColorStop(1, coilOn ? '#064e3b' : '#0f172a');
          
          ctx.fillStyle = coreGrad;
          ctx.strokeStyle = coilOn ? '#10b981' : '#334155';
          ctx.lineWidth = 1.5 * cam.zoom;
          
          if (coilOn) {
            ctx.shadowColor = '#10b981';
            ctx.shadowBlur = 10 * cam.zoom;
          }
          
          ctx.beginPath();
          ctx.roundRect(-cw * 0.38, -ch * 0.3, cw * 0.76, ch * 0.32, 4 * cam.zoom);
          ctx.fill();
          ctx.stroke();

          // Indicador de Armadura Atracada
          ctx.fillStyle = coilOn ? '#34d399' : '#64748b';
          ctx.font = `bold ${Math.max(7, 8 * cam.zoom)}px monospace`;
          ctx.textAlign = 'center';
          ctx.fillText(coilOn ? '▲ ATRACADO' : '▼ REPOUSO', 0, -ch * 0.12);
          ctx.restore();

        } else if (d.kind === 'breaker' || d.kind === 'breaker3' || d.kind === 'overload') {
          // Alavanca de Disjuntor Curva Din/Caixa Moldada Ultra-Realista
          const isTrip = st.tripped;
          const isClosed = st.closed && !isTrip;
          ctx.save();

          // Trilho/Cavidade do Módulo do Disjuntor
          ctx.fillStyle = '#0f172a';
          ctx.strokeStyle = '#334155';
          ctx.lineWidth = 1 * cam.zoom;
          ctx.beginPath();
          ctx.roundRect(-10 * cam.zoom, -22 * cam.zoom, 20 * cam.zoom, 28 * cam.zoom, 3 * cam.zoom);
          ctx.fill();
          ctx.stroke();

          // Corpo da Manopla com Gradiente 3D
          const handleGrad = ctx.createLinearGradient(-8 * cam.zoom, 0, 8 * cam.zoom, 0);
          if (isTrip) {
            handleGrad.addColorStop(0, '#f87171');
            handleGrad.addColorStop(0.5, '#ef4444');
            handleGrad.addColorStop(1, '#991b1b');
            ctx.shadowColor = '#ef4444';
            ctx.shadowBlur = 12 * cam.zoom;
          } else if (isClosed) {
            handleGrad.addColorStop(0, '#4ade80');
            handleGrad.addColorStop(0.5, '#22c55e');
            handleGrad.addColorStop(1, '#15803d');
            ctx.shadowColor = '#22c55e';
            ctx.shadowBlur = 10 * cam.zoom;
          } else {
            handleGrad.addColorStop(0, '#94a3b8');
            handleGrad.addColorStop(0.5, '#64748b');
            handleGrad.addColorStop(1, '#334155');
          }

          ctx.fillStyle = handleGrad;
          const leverY = isClosed ? -20 * cam.zoom : isTrip ? -10 * cam.zoom : -2 * cam.zoom;
          ctx.beginPath();
          ctx.roundRect(-8 * cam.zoom, leverY, 16 * cam.zoom, 16 * cam.zoom, 4 * cam.zoom);
          ctx.fill();

          // Símbolo Impresso na Alavanca (I / O / TRIP)
          ctx.fillStyle = '#ffffff';
          ctx.font = `bold ${Math.max(8, 9 * cam.zoom)}px monospace`;
          ctx.textAlign = 'center';
          ctx.shadowColor = 'transparent';
          ctx.fillText(isTrip ? 'TRIP' : isClosed ? 'I' : 'O', 0, leverY + 11 * cam.zoom);
          ctx.restore();

        } else {
          // Ícone padrão do catálogo
          ctx.fillStyle = isEnergized ? '#6ee7b7' : '#93c5fd';
          ctx.font = `${Math.max(14, 18 * cam.zoom)}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(d.icon, 0, -5 * cam.zoom);
        }

        // Nome / Tag do Componente (Discreto e Centralizado)
        ctx.save();
        ctx.fillStyle = 'rgba(226, 232, 240, 0.75)';
        ctx.font = `600 ${Math.max(6, 7.5 * cam.zoom)}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText((c.label || d.name).toUpperCase(), 0, 0);
        ctx.restore();

        ctx.restore();

        // 5. Terminais de Ligação (Pinos Conectores Alta Visibilidade)
        d.terminals.forEach(term => {
          const tPos = toScreen(terminalPos(c, term[0]));
          ctx.save();
          
          // Sombra/Brilho Industrial nos Bornes
          ctx.shadowColor = '#000000';
          ctx.shadowBlur = 6 * cam.zoom;

          // Borne Metálico (Parafuso Latão/Níquel)
          const termGrad = ctx.createRadialGradient(tPos.x - 1, tPos.y - 1, 0.5, tPos.x, tPos.y, 5 * cam.zoom);
          termGrad.addColorStop(0, '#38bdf8');
          termGrad.addColorStop(0.5, '#0284c7');
          termGrad.addColorStop(1, '#0c4a6e');

          ctx.fillStyle = termGrad;
          ctx.strokeStyle = '#f8fafc';
          ctx.lineWidth = 1.8 * cam.zoom;
          ctx.beginPath();
          ctx.arc(tPos.x, tPos.y, 5 * cam.zoom, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Ponto Central do Borne
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(tPos.x, tPos.y, 1.5 * cam.zoom, 0, Math.PI * 2);
          ctx.fill();

          // Rótulo da Anotação do Borne (Ex: A1, 13, L1)
          ctx.shadowColor = 'transparent';
          ctx.fillStyle = '#38bdf8';
          ctx.font = `bold ${Math.max(7, 8 * cam.zoom)}px monospace`;
          ctx.textAlign = 'center';
          ctx.fillText(term[0], tPos.x, tPos.y - 8 * cam.zoom);
          ctx.restore();
        });

        // 6. Efeito de Curto-Circuito, Faíscas (Sparks) e Sobrecarga Térmica
        if (st.fault || st.tripped || st.thermal || st.sparking) {
          ctx.save();
          const p = toScreen({ x: c.x, y: c.y });
          const cw = (c.w || 90) * cam.zoom;
          const ch = (c.h || 70) * cam.zoom;

          // Brilho Térmico / Sobrecarga
          if (st.thermal || st.tripped) {
            ctx.strokeStyle = 'rgba(239, 68, 68, 0.75)';
            ctx.lineWidth = 3;
            ctx.shadowColor = '#ef4444';
            ctx.shadowBlur = 12;
            ctx.strokeRect(p.x - cw / 2 - 4, p.y - ch / 2 - 4, cw + 8, ch + 8);
          }

          // Faíscas elétricas / Sparks
          if (st.fault || st.sparking || st.tripped) {
            const count = 10;
            for (let i = 0; i < count; i++) {
              const angle = Math.random() * Math.PI * 2;
              const dist = (15 + Math.random() * 25) * cam.zoom;
              ctx.strokeStyle = Math.random() > 0.5 ? '#f59e0b' : '#ef4444';
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(p.x + Math.cos(angle) * dist, p.y + Math.sin(angle) * dist);
              ctx.stroke();
            }
          }
          ctx.restore();
        }
      });

      // 7. Simulação Transitória / Solver com Proteção de Estabilidade (Zero Crash)
      try {
        if (isRunning) {
          simRef.current.time += dt;

          // Atualiza estado de condução e dispositivos eletromecânicos
          const mcb = project.components.find(c => c.code === 'MCB3');
          const km = project.components.find(c => c.code === 'CONTACTOR');
          const olr = project.components.find(c => c.code === 'OLR');
          const motor = project.components.find(c => c.code === 'M3PH' || c.code === 'M1PH');
          const s1 = project.components.find(c => c.code === 'PBNO');
          const s0 = project.components.find(c => c.code === 'PBNC');
          const h1 = project.components.find(c => c.code === 'PILOT_GREEN');
          const h2 = project.components.find(c => c.code === 'PILOT_YELLOW');
          const buzz = project.components.find(c => c.code === 'BUZZ');

          if (mcb && km && motor) {
            const mcbOn = Boolean(mcb.state?.closed && !mcb.state?.tripped);
            const olrOk = Boolean(!olr?.state?.tripped);
            const s0Closed = s0?.state?.closed !== false;

            // Botoeira S1 com contato de selo KM1 (13-14)
            if (s1?.state?.pressed && s0Closed && olrOk) {
              km.state.energized = true;
              km.state.closed = true;
            } else if (!s0Closed || !olrOk) {
              km.state.energized = false;
              km.state.closed = false;
            }

            const kmOn = Boolean(km.state?.energized);

            // Disparo de som mecânico do contator na mudança de estado
            if (kmOn !== simRef.current.lastContactorState) {
              soundFX.playContactorThump(kmOn);
              simRef.current.lastContactorState = kmOn;
            }

            const isMotorRunning = Boolean(mcbOn && kmOn && olrOk);
            motor.state.running = isMotorRunning;
            motor.state.energized = isMotorRunning;

            // Inércia mecânica suave do rotor
            if (isMotorRunning) {
              simRef.current.motorRpm = Math.min(2920, (simRef.current.motorRpm || 0) + 140);
            } else {
              simRef.current.motorRpm = Math.max(0, (simRef.current.motorRpm || 0) - 90);
            }
            motor.state.rpm = Math.round(simRef.current.motorRpm);

            // Áudio industrial de motor em tempo real (Web Audio API)
            if (simRef.current.motorRpm > 20) {
              soundFX.updateMotorSound(true, simRef.current.motorRpm / 2920, motor.code === 'M3PH');
            } else {
              soundFX.stopMotorSound();
            }

            if (h1) h1.state.energized = kmOn;
            if (h2) h2.state.energized = !olrOk;

            // Alarme sonoro se sobrecarga
            if (buzz) {
              buzz.state.energized = !olrOk;
              soundFX.updateBuzzerSound(!olrOk, true);
            }

            // Disparo de aviso de diagnóstico por voz se relé térmico atuar
            if (!olrOk && olr && !simRef.current.trippedSet.has(olr.id)) {
              simRef.current.trippedSet.add(olr.id);
              simulatorDiagnostics.trigger('IND_THERMAL_RELAY', olr.id);
            }

            // Leituras elétricas True-RMS
            const currentA = isMotorRunning ? 14.8 * (simRef.current.motorRpm / 2920) : kmOn ? 0.35 : 0;
            setMeterV(mcbOn ? 400 : 0);
            setMeterA(Number(currentA.toFixed(2)));
            setMeterW(isMotorRunning ? Math.round(7500 * (simRef.current.motorRpm / 2920)) : 0);
            setMeterHz(50);
            setMeterPF(isMotorRunning ? 0.86 : 1.0);

            // Marca condutores ativos
            project.wires.forEach(w => {
              if (w.a.c === mcb.id || w.b.c === km.id || w.b.c === motor.id) {
                w.live = mcbOn;
              }
            });
          } else {
            soundFX.stopMotorSound();
            soundFX.stopBuzzerSound();
            setMeterV(230);
            setMeterA(1.2);
            setMeterW(276);
            setMeterHz(50);
            setMeterPF(0.95);
          }

          // Monitoramento Normativo Geral de Proteções Atuadas (RCD, MCB, PV)
          project.components.forEach(c => {
            if (c.code === 'RCD' && c.state?.tripped && !simRef.current.trippedSet.has(c.id)) {
              simRef.current.trippedSet.add(c.id);
              simulatorDiagnostics.trigger('RES_RCD_LEAKAGE', c.id);
            } else if ((c.code === 'MCB1' || c.code === 'MCB2' || c.code === 'MCB3') && c.state?.tripped && !simRef.current.trippedSet.has(c.id)) {
              simRef.current.trippedSet.add(c.id);
              simulatorDiagnostics.trigger('RES_OUTLET_OVERLOAD', c.id);
            } else if (c.code === 'PV_INVERTER' && c.state?.tripped && !simRef.current.trippedSet.has(c.id)) {
              simRef.current.trippedSet.add(c.id);
              simulatorDiagnostics.trigger('PV_ISLANDING', c.id);
            } else if (c.code === 'PV_SPD_DC' && c.state?.tripped && !simRef.current.trippedSet.has(c.id)) {
              simRef.current.trippedSet.add(c.id);
              simulatorDiagnostics.trigger('PV_SPD_TRIPPED', c.id);
            }
          });

          // Amostragem para Osciloscópio Digital
          simRef.current.scopeHistory.push({
            t: simRef.current.time,
            v: meterV * Math.sin(2 * Math.PI * 50 * simRef.current.time),
            i: meterA * Math.sin(2 * Math.PI * 50 * simRef.current.time - 0.5)
          });
          if (simRef.current.scopeHistory.length > 400) {
            simRef.current.scopeHistory.shift();
          }

          // Desenho no Osciloscópio Digital Multicanal
          if (showScope && scopeCanvasRef.current) {
            const sCanvas = scopeCanvasRef.current;
            const sCtx = sCanvas.getContext('2d');
            if (sCtx) {
              const sw = sCanvas.width;
              const sh = sCanvas.height;
              sCtx.fillStyle = '#040d1a';
              sCtx.fillRect(0, 0, sw, sh);

              // Grade reticulada de divisões
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

              // Linha zero central
              sCtx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
              sCtx.setLineDash([2, 4]);
              sCtx.beginPath();
              sCtx.moveTo(0, sh / 2);
              sCtx.lineTo(sw, sh / 2);
              sCtx.stroke();
              sCtx.setLineDash([]);

              const hist = simRef.current.scopeHistory;
              const n = hist.length;

              // Traçado CH1 (Tensão V - Azul)
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

              // Traçado CH2 (Corrente I - Âmbar)
              if ((scopeChannel === 'CH2' || scopeChannel === 'DUAL') && n > 1) {
                sCtx.strokeStyle = '#f59e0b';
                sCtx.lineWidth = 2;
                sCtx.beginPath();
                const iScale = (sh / 2.2) / 25; // Escala proporcional da corrente
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
        } else {
          soundFX.stopMotorSound();
          soundFX.stopBuzzerSound();
        }
      } catch (simErr) {
        console.error('Falha no ciclo de simulação protegida:', simErr);
      }

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [project, isRunning, selectedCompId, selectedWireId, selectedBusbarId, meterV, meterA, showScope, scopeChannel, scopeVoltsDiv, terminalPos]);

  // ==========================================================================
  // EVENTOS DE MOUSE / TOQUE NO CANVAS (PAN, ZOOM, SELEÇÃO, FIOS, MULTITOUCH)
  // ==========================================================================
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      canvas.setPointerCapture(e.pointerId);
    } catch {
      // Ignora erro se pointer capture falhar no dispositivo
    }

    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    // Registra ponto de contato para controle multitouch
    simRef.current.touchMap.set(e.pointerId, { x: px, y: py, clientX: e.clientX, clientY: e.clientY });

    // Se houver 2 toques simultâneos, inicializa gesto de Pinça (Pinch-to-Zoom e Two-Finger Pan)
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

    // Limpa timer anterior caso ainda exista
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

    // 0. Toque em terminal / borne de barramento elétrico para condutor
    const nearestBusbarTerm = findNearestBusbarTerminal(
      project.busbars || [],
      { x: worldX, y: worldY },
      18 / cam.zoom
    );

    if (nearestBusbarTerm && (activeTool === 'wire' || e.shiftKey)) {
      if (!simRef.current.wireStart) {
        simRef.current.wireStart = {
          c: nearestBusbarTerm.busbar.id,
          t: nearestBusbarTerm.terminal.id
        };
        showToast(`Condutor iniciado no ${nearestBusbarTerm.busbar.type.toUpperCase()} [${nearestBusbarTerm.terminal.id}]. Toque no destino.`);
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
            live: isRunning
          };
          setProject((prev: any) => ({
            ...prev,
            wires: [...prev.wires, newWire],
            busbars: (prev.busbars || []).map((bb: any) =>
              bb.id === nearestBusbarTerm.busbar.id
                ? {
                    ...bb,
                    terminals: (bb.terminals || []).map((term: any) =>
                      term.id === nearestBusbarTerm.terminal.id
                        ? { ...term, isOccupied: true, connectedWireId: newWire.id }
                        : term
                    )
                  }
                : bb
            ),
            updated: Date.now()
          }));
          soundFX.playClick();
          showToast('Condutor conectado ao barramento');
        }
        simRef.current.wireStart = null;
      }
      return;
    }

    // 1. Toque em terminal de componente para condutor
    for (const c of project.components) {
      const d = getComponentDef(c.code);
      for (const t of d.terminals) {
        const tp = terminalPos(c, t[0]);
        const dist = Math.hypot(tp.x - worldX, tp.y - worldY);
        if (dist < 14 / cam.zoom) {
          if (activeTool === 'wire' || e.shiftKey) {
            if (!simRef.current.wireStart) {
              simRef.current.wireStart = { c: c.id, t: t[0] };
              showToast(`Condutor iniciado em ${c.label || d.name} [${t[0]}]. Toque no destino.`);
            } else {
              // Conclui fio
              const startC = simRef.current.wireStart.c;
              const startT = simRef.current.wireStart.t;
              if (startC !== c.id || startT !== t[0]) {
                pushHistory();
                const newWire = {
                  id: `W_${Math.random().toString(36).substring(2, 7)}`,
                  a: { c: startC, t: startT },
                  b: { c: c.id, t: t[0] },
                  type: selectedWireType,
                  live: isRunning
                };
                setProject((prev: any) => ({
                  ...prev,
                  wires: [...prev.wires, newWire],
                  updated: Date.now()
                }));
                soundFX.playClick();
                showToast('Condutor conectado com sucesso');
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

    // 2. Toque em componente para mover, acionar ou abrir propriedades com Long-Press
    for (let i = project.components.length - 1; i >= 0; i--) {
      const c = project.components[i];
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

        // Inicia o timer de 400ms para abrir a janela de propriedades
        simRef.current.longPressTimer = setTimeout(() => {
          setShowProps(true);
          soundFX?.playClick?.();
          simRef.current.longPressTimer = null;
        }, 400);

        return;
      }
    }

    // 3. Toque em Barramento ou Trilho DIN
    for (let i = (project.busbars || []).length - 1; i >= 0; i--) {
      const b = project.busbars[i];
      const isH = b.orientation === 'horizontal';
      const halfL = (b.length || 600) / 2;
      const halfH = (b.type === 'din' ? 35 : 14) / 2;
      const rx = isH ? halfL : halfH;
      const ry = isH ? halfH : halfL;

      if (Math.abs(worldX - b.x) <= rx && Math.abs(worldY - b.y) <= ry) {
        setSelectedBusbarId(b.id);
        setSelectedCompId(null);
        setSelectedWireId(null);
        setShowProps(true);
        simRef.current.drag.mode = 'busbar';
        simRef.current.drag.busbarId = b.id;
        simRef.current.drag.offsetX = worldX - b.x;
        simRef.current.drag.offsetY = worldY - b.y;
        soundFX?.playClick?.();
        return;
      }
    }

    // 4. Toque em área vazia
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

    // Atualiza rastreio no touchMap
    if (simRef.current.touchMap.has(e.pointerId)) {
      simRef.current.touchMap.set(e.pointerId, { x: px, y: py, clientX: e.clientX, clientY: e.clientY });
    }

    // Gerencia Pinch-to-Zoom e Two-Finger Pan
    if (simRef.current.pinch && simRef.current.touchMap.size >= 2) {
      const touches = Array.from(simRef.current.touchMap.values());
      const t1 = touches[0];
      const t2 = touches[1];
      const currentDist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      const currentMid = { x: (t1.clientX + t2.clientX) / 2, y: (t1.clientY + t2.clientY) / 2 };

      const scale = currentDist / simRef.current.pinch.initialDist;
      const newZoom = Math.max(0.1, Math.min(5.0, simRef.current.pinch.startZoom * scale));
      const cam = cameraRef.current;

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

    const moveDist = Math.hypot(
      e.clientX - drag.screenStartX,
      e.clientY - drag.screenStartY
    );

    // Se o usuário arrastar mais que 6px, cancela o temporizador do Long-Press
    if (moveDist > 6 && simRef.current.longPressTimer) {
      clearTimeout(simRef.current.longPressTimer);
      simRef.current.longPressTimer = null;
    }

    const cam = cameraRef.current;
    const worldX = (px - cam.pan.x) / cam.zoom;
    const worldY = (py - cam.pan.y) / cam.zoom;

    const hoverTerm = findNearestBusbarTerminal(project.busbars || [], { x: worldX, y: worldY }, 18 / cam.zoom);
    setHoveredTerminalId(hoverTerm ? hoverTerm.terminal.id : null);

    drag.mouse = { x: worldX, y: worldY };

    if (drag.mode === 'comp' && drag.compId) {
      const compId = drag.compId;
      const offsetX = drag.offsetX ?? 0;
      const offsetY = drag.offsetY ?? 0;
      const grid = cam.grid || 20;
      let targetX = Math.round((worldX - offsetX) / grid) * grid;
      let targetY = Math.round((worldY - offsetY) / grid) * grid;

      const currentComp = project.components.find((c: any) => c.id === compId);
      if (currentComp) {
        // Encaixe magnético de precisão a Trilhos DIN e Barramentos Elétricos
        const snapTolerance = Math.max(16, 26 / cam.zoom);
        const snapped = snapComponentToBusbars(
          currentComp,
          targetX,
          targetY,
          project.busbars || [],
          snapTolerance
        );
        targetX = snapped.x;
        targetY = snapped.y;
      }

      setProject((prev: any) => {
        const updated = prev.components.map((c: any) => {
          if (c.id === compId) {
            return { ...c, x: targetX, y: targetY };
          }
          return c;
        });
        return { ...prev, components: updated };
      });
    } else if (drag.mode === 'busbar' && drag.busbarId) {
      const busbarId = drag.busbarId;
      const offsetX = drag.offsetX ?? 0;
      const offsetY = drag.offsetY ?? 0;
      const grid = cam.grid || 20;
      const targetX = Math.round((worldX - offsetX) / grid) * grid;
      const targetY = Math.round((worldY - offsetY) / grid) * grid;

      setProject((prev: any) => ({
        ...prev,
        busbars: (prev.busbars || []).map((b: any) =>
          b.id === busbarId
            ? {
                ...b,
                x: targetX,
                y: targetY,
                terminals: generateBusbarTerminals(b.id, b.type, targetX, targetY, b.length, b.orientation)
              }
            : b
        )
      }));
    } else if (drag.mode === 'pan') {
      const dx = e.clientX - drag.screenStartX;
      const dy = e.clientY - drag.screenStartY;
      cam.pan.x += dx;
      cam.pan.y += dy;
      drag.screenStartX = e.clientX;
      drag.screenStartY = e.clientY;
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    // Remove do touchMap
    simRef.current.touchMap.delete(e.pointerId);
    if (simRef.current.touchMap.size < 2) {
      simRef.current.pinch = null;
    }

    // Cancela o temporizador se soltar antes do tempo
    if (simRef.current.longPressTimer) {
      clearTimeout(simRef.current.longPressTimer);
      simRef.current.longPressTimer = null;
    }

    const canvas = canvasRef.current;
    if (canvas) {
      try {
        if (canvas.hasPointerCapture(e.pointerId)) {
          canvas.releasePointerCapture(e.pointerId);
        }
      } catch {
        // Ignora erro de liberação de captura
      }
    }

    const drag = simRef.current.drag;
    if (!drag) return;
    const moveDist = Math.hypot(
      e.clientX - drag.screenStartX,
      e.clientY - drag.screenStartY
    );

    // Se foi um clique rápido sem arrastar num componente mecânico, alterna seu estado físico
    if (moveDist < 6 && drag.mode === 'comp' && drag.compId) {
      const compId = drag.compId;
      const c = project.components.find((item: any) => item.id === compId);
      if (c) {
        const d = getComponentDef(c.code);
        if (d.momentary) {
          triggerComponentCommand(c.id, 'pulse');
        } else if (d.kind === 'breaker' || d.kind === 'breaker3' || d.kind === 'switch' || d.kind === 'selector') {
          triggerComponentCommand(c.id, 'toggle');
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
    setProject(prev => ({ ...prev, updated: Date.now() }));
  };

  // Componente selecionado ativo para o painel de propriedades
  const selectedComponent = project.components.find((c: any) => c.id === selectedCompId);
  const selectedDef = selectedComponent ? getComponentDef(selectedComponent.code) : null;
  const selectedBusbar = (project.busbars || []).find((b: any) => b.id === selectedBusbarId);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] bg-[#050A14] flex flex-col justify-between overflow-hidden select-none text-slate-200 font-sans">
      {/* 1. TOP HEADER / TOOLBAR PROFISSIONAL CAD */}
      <header className="h-14 px-3 sm:px-4 bg-[#0B132B] border-b border-blue-900/50 flex items-center justify-between gap-2 shrink-0 z-30 shadow-xl">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black shadow-md shadow-blue-900/40">
            ⚡
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xs sm:text-sm font-black text-white tracking-wide flex items-center gap-1.5">
                <span>TécnicaMZ Pro</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 font-mono border border-blue-800">
                  CAD V11
                </span>
              </h1>
            </div>
            <p className="text-[10px] text-slate-400 hidden md:block">
              {project.name} • Simulação MNA & Automação Industrial
            </p>
          </div>
        </div>

        {/* Barra Central de Ferramentas de Bancada */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {/* Botão de Simulação RUN / STOP */}
          <button
            type="button"
            onClick={() => {
              const next = !isRunning;
              setIsRunning(next);
              if (next) {
                soundFX.playSuccess();
                addEvent('Simulação do circuito iniciada (RUN).', 'info');
                showToast('Simulador energizado');
              } else {
                soundFX.playClick();
                addEvent('Simulação parada (STOP). Cargas desenergizadas com segurança.', 'warn');
                showToast('Simulador parado');
              }
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-md ${
              isRunning
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950 animate-pulse'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950'
            }`}
          >
            {isRunning ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{isRunning ? 'Parar' : 'Simular'}</span>
          </button>

          {/* Seletores de Ferramentas */}
          <div className="h-6 w-px bg-slate-800 mx-1 hidden sm:block" />

          <button
            type="button"
            onClick={() => setActiveTool('select')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
              activeTool === 'select'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
            title="Selecionar / Mover"
          >
            <span>↖</span>
            <span className="hidden sm:inline">Mover</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTool('wire');
              showToast('Modo Condutor: toque no primeiro e depois no segundo terminal para ligar');
            }}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
              activeTool === 'wire'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
            title="Traçar Condutor"
          >
            <span>⌁</span>
            <span className="hidden sm:inline">Condutor</span>
          </button>

          {/* Tipo de Condutor Seletor */}
          <select
            value={selectedWireType}
            onChange={e => setSelectedWireType(e.target.value)}
            className="px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-[11px] font-bold text-slate-200 outline-none"
            title="Tipo de Cabo / Fase"
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

          {/* Botão Auto-Organizar Fios e Componentes (Manhattan 90°) */}
          <button
            type="button"
            onClick={() => {
              pushHistory();
              setProject(prev => autoOrganizeCircuitWiring(prev));
              soundFX.playSuccess();
              showToast('Fios e componentes organizados ortogonalmente em 90°!');
              addEvent('Auto-organização ortogonal Manhattan executada.', 'info');
            }}
            className="px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-800 hover:border-amber-500/40"
            title="Auto-organizar condutores em 90° e alinhar à grade"
          >
            <span>📐</span>
            <span className="hidden md:inline">Auto-Organizar</span>
          </button>

          {/* Presets Rápidos */}
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
            className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-300 text-xs font-bold border border-slate-800 hover:border-amber-500/40 transition cursor-pointer hidden md:flex items-center gap-1"
            title="Carregar Sistema Solar Fotovoltaico On-Grid com String Box e Inversor (IEC 62548)"
          >
            <span>☀️ Solar FV</span>
          </button>

          {/* Botão de Configuração do Quadro Geral / Armário Elétrico */}
          <button
            type="button"
            onClick={() => setIsPanelConfigOpen(prev => !prev)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border transition cursor-pointer flex items-center gap-1.5 ${
              isPanelConfigOpen
                ? 'bg-amber-600/30 text-amber-300 border-amber-500/60 ring-1 ring-amber-400/40'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800 hover:border-slate-700'
            }`}
            title="Dimensionar e Configurar Quadro Geral / Armário Modular (IEC 61439 / IP65)"
          >
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Quadro Geral</span>
          </button>
        </div>

        {/* Ações de Direita: Avisos de Voz IEC, Relatório PDF, Publicar no Mural, Exportar & Fechar */}
        <div className="flex items-center gap-1.5">
          {/* Avisos Técnicos de Voz & Diagnóstico IEC */}
          <button
            type="button"
            onClick={() => setIsDiagnosticPanelOpen(true)}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border cursor-pointer ${
              diagnosticState.isSpeaking
                ? 'bg-purple-600/30 text-purple-300 border-purple-500/50 ring-2 ring-purple-500/40 animate-pulse'
                : diagnosticState.isMuted
                ? 'bg-slate-900 text-rose-400/80 border-slate-800 hover:bg-slate-800'
                : 'bg-slate-900 text-indigo-400 border-indigo-500/30 hover:bg-indigo-950/40 hover:text-indigo-300'
            }`}
            title="Avisos Técnicos de Voz & Diagnósticos (IEC 60947 / IEC 60364 / IEC 62548)"
          >
            {diagnosticState.isSpeaking ? (
              <Radio className="w-3.5 h-3.5 text-purple-300 animate-spin" />
            ) : diagnosticState.isMuted ? (
              <VolumeX className="w-3.5 h-3.5 text-rose-400" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
            )}
            <span className="hidden sm:inline">
              {diagnosticState.isSpeaking ? 'Aviso em Execução...' : 'Voz & Diagnósticos'}
            </span>
            {diagnosticState.logs.length > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-black bg-indigo-500/30 text-indigo-300 border border-indigo-500/40">
                {diagnosticState.logs.length}
              </span>
            )}
          </button>

          {/* Botão Rápido Mudo / Desmudo */}
          <button
            type="button"
            onClick={() => simulatorDiagnostics.toggleMute()}
            className={`p-2 rounded-xl text-xs font-bold transition border cursor-pointer ${
              diagnosticState.isMuted
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
            title={diagnosticState.isMuted ? 'Reativar Áudio da Voz' : 'Silenciar Avisos de Voz'}
          >
            {diagnosticState.isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>

          {/* Gerar Relatório Técnico em PDF */}
          <button
            type="button"
            onClick={() => {
              generateCadProjectPDF(project, { authorName: 'Eletro-Jr • Técnico Responsável' });
              showToast('Relatório Técnico em PDF gerado!');
            }}
            className="px-2.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-sky-400 hover:text-sky-300 border border-slate-800 transition cursor-pointer flex items-center gap-1 text-xs font-bold"
            title="Gerar e Baixar Relatório Técnico Oficial em PDF (IEC 60947)"
          >
            <FileText className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden lg:inline">PDF Técnico</span>
          </button>

          {/* BOTÃO MESTRE: PUBLICAR NO MURAL DO TÉCNICAMZ */}
          <button
            type="button"
            onClick={() => setIsPublishDialogOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-black transition flex items-center gap-1.5 shadow-lg shadow-blue-900/40 active:scale-95 cursor-pointer border border-blue-400/30"
            title="Publicar este projeto no Mural dos Técnicos"
          >
            <Zap className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
            <span className="hidden sm:inline">Publicar no Mural</span>
          </button>

          {/* Exportar Imagem PNG */}
          <button
            type="button"
            onClick={handleExportImage}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition cursor-pointer"
            title="Exportar Imagem do Diagrama (PNG)"
          >
            <ImageIcon className="w-4 h-4" />
          </button>

          {/* Exportar JSON */}
          <button
            type="button"
            onClick={handleExportJSON}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition cursor-pointer hidden sm:flex"
            title="Exportar Arquivo (.json)"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Importar JSON */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition cursor-pointer hidden sm:flex"
            title="Importar Arquivo (.json)"
          >
            <Upload className="w-4 h-4" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            onChange={handleImportJSON}
            className="hidden"
          />

          {/* Fechar Bancada CAD */}
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900 hover:bg-rose-900/60 text-slate-400 hover:text-white border border-slate-800 transition cursor-pointer ml-1"
            title="Sair da Bancada CAD"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. ÁREA DE TRABALHO PRINCIPAL (CANVAS 2D + PAINÉIS FLUTUANTES) */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
        {/* CANVAS 2D DO SIMULADOR */}
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onWheel={handleWheel}
          className="absolute inset-0 w-full h-full touch-none cursor-crosshair"
        />

        {/* BANNER DE FALHA / CURTO-CIRCUITO SE OCORRER */}
        {faultAlert && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 px-4 py-2 rounded-xl bg-rose-950/90 border border-rose-600 text-rose-200 text-xs font-bold shadow-2xl flex items-center gap-2 animate-bounce">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>{faultAlert}</span>
          </div>
        )}

        {/* TOAST DE NOTIFICAÇÃO RÁPIDA */}
        {toastMessage && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 px-4 py-2 rounded-xl bg-slate-900/90 border border-blue-500/40 text-blue-200 text-xs font-black shadow-2xl backdrop-blur-md">
            {toastMessage}
          </div>
        )}

        {/* PAINEL FLUTUANTE ESQUERDO: BIBLIOTECA DE COMPONENTES */}
        {showLibrary && (
          <div className="absolute left-3 top-3 bottom-16 sm:bottom-4 w-72 max-w-[calc(100vw-24px)] bg-[#0A1224]/95 border border-blue-900/50 rounded-2xl shadow-2xl flex flex-col z-20 backdrop-blur-md overflow-hidden">
            {/* Header da Biblioteca */}
            <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-[#0E1A33]">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-black text-white">Biblioteca de Componentes</span>
              </div>
              <button
                type="button"
                onClick={() => setShowLibrary(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Barra de Pesquisa e Categorias */}
            <div className="p-2.5 border-b border-slate-800 space-y-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Pesquisar disjuntor, motor, relé..."
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Chips de Categoria */}
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
                {Object.entries(CATEGORIES).map(([catKey, catLabel]) => (
                  <button
                    key={catKey}
                    type="button"
                    onClick={() => setSelectedCategory(catKey)}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap transition ${
                      selectedCategory === catKey
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    {catLabel}
                  </button>
                ))}
              </div>
            </div>

            {/* Lista com Componentes */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
              {/* Seção Especial de Trilhos DIN e Barramentos Elétricos (IEC 60715) */}
              {(selectedCategory === 'busbars' || selectedCategory === 'all') && (!searchQuery.trim() || 'trilho din barramento cobre pe neutro l1 l2 l3 fase'.includes(searchQuery.toLowerCase())) && (
                <div className="space-y-1.5 pt-0.5 pb-2 border-b border-slate-800/80">
                  <div className="px-2 py-1 text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center justify-between">
                    <span>Trilhos & Barramentos (IEC 60715)</span>
                    <span className="text-[9px] font-mono text-slate-500">Mecânica/Elétrica</span>
                  </div>

                  {/* Trilho DIN 35mm Horizontal */}
                  <button
                    type="button"
                    onClick={() => {
                      addBusbar('din', undefined, undefined, 680, 'horizontal');
                      soundFX?.playClick?.();
                    }}
                    className="w-full p-2 rounded-xl bg-slate-900/70 hover:bg-slate-800 border border-slate-700/60 hover:border-amber-500/50 flex items-center justify-between text-left transition group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0 border border-amber-500/20">
                        DIN
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-200 group-hover:text-amber-300 leading-tight">
                          Trilho DIN 35mm (Horizontal)
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          IEC 60715 • Alumínio/Aço • 680mm
                        </div>
                      </div>
                    </div>
                    <Plus className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400" />
                  </button>

                  {/* Trilho DIN 35mm Vertical */}
                  <button
                    type="button"
                    onClick={() => {
                      addBusbar('din', undefined, undefined, 420, 'vertical');
                      soundFX?.playClick?.();
                    }}
                    className="w-full p-2 rounded-xl bg-slate-900/70 hover:bg-slate-800 border border-slate-700/60 hover:border-amber-500/50 flex items-center justify-between text-left transition group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0 border border-amber-500/20">
                        DIN↕
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-200 group-hover:text-amber-300 leading-tight">
                          Trilho DIN 35mm (Vertical)
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          IEC 60715 • Montagem em Coluna • 420mm
                        </div>
                      </div>
                    </div>
                    <Plus className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400" />
                  </button>

                  {/* Barramento Fases (L1, L2, L3) */}
                  <div className="grid grid-cols-3 gap-1 pt-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        addBusbar('phase_l1', undefined, undefined, 600, 'horizontal');
                        soundFX?.playClick?.();
                      }}
                      className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-800/50 text-[10px] font-bold text-red-300 text-center transition cursor-pointer"
                    >
                      + Barr. L1
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        addBusbar('phase_l2', undefined, undefined, 600, 'horizontal');
                        soundFX?.playClick?.();
                      }}
                      className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-600 text-[10px] font-bold text-slate-200 text-center transition cursor-pointer"
                    >
                      + Barr. L2
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        addBusbar('phase_l3', undefined, undefined, 600, 'horizontal');
                        soundFX?.playClick?.();
                      }}
                      className="p-1.5 rounded-lg bg-amber-950/40 hover:bg-amber-900/60 border border-amber-800/50 text-[10px] font-bold text-amber-300 text-center transition cursor-pointer"
                    >
                      + Barr. L3
                    </button>
                  </div>

                  {/* Barramento Neutro N & Terra PE */}
                  <div className="grid grid-cols-2 gap-1 pt-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        addBusbar('neutral', undefined, undefined, 600, 'horizontal');
                        soundFX?.playClick?.();
                      }}
                      className="p-1.5 rounded-lg bg-sky-950/40 hover:bg-sky-900/60 border border-sky-800/50 text-[10px] font-bold text-sky-300 text-center transition cursor-pointer"
                    >
                      + Neutro (N)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        addBusbar('earth', undefined, undefined, 600, 'horizontal');
                        soundFX?.playClick?.();
                      }}
                      className="p-1.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-800/50 text-[10px] font-bold text-emerald-300 text-center transition cursor-pointer"
                    >
                      + Terra (PE)
                    </button>
                  </div>
                </div>
              )}

              {COMPONENT_CATALOG.filter(c => {
                const matchCat = selectedCategory === 'all' || c.cat === selectedCategory;
                const matchSearch =
                  !searchQuery.trim() ||
                  c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  c.code.toLowerCase().includes(searchQuery.toLowerCase());
                return matchCat && matchSearch;
              }).map(c => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => addComponentToCanvas(c.code)}
                  className="w-full p-2 rounded-xl bg-slate-900/60 hover:bg-blue-950/40 border border-slate-800 hover:border-blue-700/50 flex items-center justify-between text-left transition group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-sm shrink-0 border border-blue-500/20 group-hover:scale-105 transition">
                      {c.icon}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-200 group-hover:text-blue-300 leading-tight">
                        {c.name}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {c.code} • {c.terminals.length} terminais
                      </div>
                    </div>
                  </div>
                  <Plus className="w-3.5 h-3.5 text-slate-600 group-hover:text-blue-400" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* PAINEL FLUTUANTE DIREITO: PROPRIEDADES DO BARRAMENTO / TRILHO SELECIONADO */}
        {showProps && selectedBusbar && (
          <div className="absolute right-3 top-3 w-80 max-w-[calc(100vw-24px)] max-h-[calc(100%-80px)] bg-[#0A1224]/95 border border-amber-500/40 rounded-2xl shadow-2xl flex flex-col z-20 backdrop-blur-md overflow-hidden">
            <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-[#0E1A33]">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-black text-white">
                  {selectedBusbar.type === 'din' ? 'Trilho DIN 35mm (IEC 60715)' : 'Barramento Elétrico (Cobre)'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBusbarId(null)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-3 overflow-y-auto space-y-3.5 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1">Padrão Normativo</label>
                <select
                  value={selectedBusbar.type}
                  onChange={e => {
                    const nextType = e.target.value as any;
                    setProject((prev: any) => ({
                      ...prev,
                      busbars: (prev.busbars || []).map((b: any) =>
                        b.id === selectedBusbarId ? { ...b, type: nextType } : b
                      ),
                      updated: Date.now()
                    }));
                  }}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white font-bold text-xs"
                >
                  <option value="din">Trilho DIN 35mm (IEC/EN 60715)</option>
                  <option value="phase_l1">Barramento Fase L1 (Castanho / Vermelho)</option>
                  <option value="phase_l2">Barramento Fase L2 (Preto)</option>
                  <option value="phase_l3">Barramento Fase L3 (Cinza / Âmbar)</option>
                  <option value="neutral">Barramento Neutro N (Azul Celeste)</option>
                  <option value="earth">Barramento Proteção PE (Verde/Amarelo)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1">Orientação de Montagem</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setProject((prev: any) => ({
                        ...prev,
                        busbars: (prev.busbars || []).map((b: any) =>
                          b.id === selectedBusbarId
                            ? {
                                ...b,
                                orientation: 'horizontal',
                                terminals: generateBusbarTerminals(b.id, b.type, b.x, b.y, b.length, 'horizontal')
                              }
                            : b
                        ),
                        updated: Date.now()
                      }));
                    }}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                      selectedBusbar.orientation === 'horizontal'
                        ? 'bg-blue-600 text-white border-blue-400'
                        : 'bg-slate-900 text-slate-300 border-slate-800'
                    }`}
                  >
                    Horizontal
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setProject((prev: any) => ({
                        ...prev,
                        busbars: (prev.busbars || []).map((b: any) =>
                          b.id === selectedBusbarId
                            ? {
                                ...b,
                                orientation: 'vertical',
                                terminals: generateBusbarTerminals(b.id, b.type, b.x, b.y, b.length, 'vertical')
                              }
                            : b
                        ),
                        updated: Date.now()
                      }));
                    }}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                      selectedBusbar.orientation === 'vertical'
                        ? 'bg-blue-600 text-white border-blue-400'
                        : 'bg-slate-900 text-slate-300 border-slate-800'
                    }`}
                  >
                    Vertical
                  </button>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-bold text-slate-400">Comprimento Mecânico</label>
                  <span className="text-[11px] font-mono text-amber-400 font-bold">
                    {selectedBusbar.length} mm
                  </span>
                </div>
                <input
                  type="range"
                  min="200"
                  max="1400"
                  step="20"
                  value={selectedBusbar.length}
                  onChange={e => {
                    const nextLen = Number(e.target.value);
                    setProject((prev: any) => ({
                      ...prev,
                      busbars: (prev.busbars || []).map((b: any) =>
                        b.id === selectedBusbarId
                          ? {
                              ...b,
                              length: nextLen,
                              terminals: generateBusbarTerminals(b.id, b.type, b.x, b.y, nextLen, b.orientation)
                            }
                          : b
                      ),
                      updated: Date.now()
                    }));
                  }}
                  className="w-full accent-amber-500"
                />
              </div>

              <div className="p-2.5 rounded-xl bg-blue-950/30 border border-blue-900/40 text-[11px] text-slate-400 space-y-1">
                <div className="text-blue-300 font-bold">Acoplamento Magnético Ativo</div>
                <p>
                  Arraste componentes elétricos (disjuntores, contatores, relés) para perto do trilho/barramento para encaixe automático com travamento DIN.
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={deleteSelected}
                  className="w-full py-2 rounded-xl bg-rose-950 hover:bg-rose-900 text-rose-300 text-xs font-bold flex items-center justify-center gap-1 border border-rose-900 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remover do Diagrama</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PAINEL FLUTUANTE: CONFIGURAÇÕES DO QUADRO GERAL / ARMÁRIO MODULAR */}
        {isPanelConfigOpen && (
          <div className="absolute right-3 top-3 w-88 max-w-[calc(100vw-24px)] max-h-[calc(100%-80px)] bg-[#0A1224]/95 border border-amber-500/50 rounded-2xl shadow-2xl flex flex-col z-20 backdrop-blur-md overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-3 border-b border-amber-900/50 flex items-center justify-between bg-amber-950/30">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-black text-amber-300">Quadro Geral & Armário Modular</span>
              </div>
              <button
                type="button"
                onClick={() => setIsPanelConfigOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-3.5 overflow-y-auto space-y-4 text-xs">
              {/* Presets Rápidos de Tamanho */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                  Tamanho & Capacidade Modular (IEC 61439)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'compact', name: 'Compacto', spec: '24 Módulos (740×520)' },
                    { id: 'medium', name: 'Médio', spec: '48 Módulos (940×700)' },
                    { id: 'large', name: 'Grande', spec: '72 Módulos (1140×860)' },
                    { id: 'industrial', name: 'Industrial', spec: 'NEMA / IP65 (1280×980)' }
                  ].map(preset => {
                    const isCur = project.panelConfig?.size === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          const base = (PANEL_PRESETS as any)[preset.id] || PANEL_PRESETS.large;
                          setProject((prev: any) => ({
                            ...prev,
                            panelConfig: {
                              ...base,
                              backplate: prev.panelConfig?.backplate || base.backplate,
                              nameplateText: prev.panelConfig?.nameplateText || base.nameplateText
                            },
                            updated: Date.now()
                          }));
                          showToast(`Painel alterado para padrão ${preset.name}`);
                          setTimeout(handleFit, 60);
                        }}
                        className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col ${
                          isCur
                            ? 'bg-amber-600/30 text-amber-200 border-amber-400/80 ring-1 ring-amber-400/30'
                            : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <span className="font-black text-xs">{preset.name}</span>
                        <span className="text-[10px] text-slate-400 mt-0.5">{preset.spec}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Placa de Montagem Interna (Chapa de Fundo) */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                  Acabamento da Chapa de Fundo (Placa de Montagem)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'orange_industrial', name: 'Laranja Epóxi', color: 'bg-amber-600' },
                    { id: 'galvanized', name: 'Galvanizado', color: 'bg-slate-600' },
                    { id: 'white', name: 'Branco Epóxi', color: 'bg-slate-200 text-slate-900' },
                    { id: 'brushed_steel', name: 'Aço Escovado', color: 'bg-slate-500' }
                  ].map(mat => {
                    const isCur = project.panelConfig?.backplate === mat.id;
                    return (
                      <button
                        key={mat.id}
                        type="button"
                        onClick={() => {
                          setProject((prev: any) => ({
                            ...prev,
                            panelConfig: {
                              ...(prev.panelConfig || PANEL_PRESETS.large),
                              backplate: mat.id
                            },
                            updated: Date.now()
                          }));
                        }}
                        className={`p-2 rounded-xl border text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
                          isCur
                            ? 'bg-blue-600/20 text-white border-blue-400 ring-1 ring-blue-400/30'
                            : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <span className={`w-3.5 h-3.5 rounded-full ${mat.color} border border-white/20`} />
                        <span>{mat.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Toggles de Acessórios & Canaletas */}
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2.5">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-slate-300 font-bold">Canaletas Perfuradas com Fendas</span>
                  <input
                    type="checkbox"
                    checked={Boolean(project.panelConfig?.hasDucts)}
                    onChange={e => {
                      const val = e.target.checked;
                      setProject((prev: any) => ({
                        ...prev,
                        panelConfig: {
                          ...(prev.panelConfig || PANEL_PRESETS.large),
                          hasDucts: val
                        },
                        updated: Date.now()
                      }));
                    }}
                    className="w-4 h-4 accent-amber-500 rounded"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-slate-300 font-bold">Moldura Metálica & Vedação IP65</span>
                  <input
                    type="checkbox"
                    checked={Boolean(project.panelConfig?.enabled)}
                    onChange={e => {
                      const val = e.target.checked;
                      setProject((prev: any) => ({
                        ...prev,
                        panelConfig: {
                          ...(prev.panelConfig || PANEL_PRESETS.large),
                          enabled: val
                        },
                        updated: Date.now()
                      }));
                    }}
                    className="w-4 h-4 accent-amber-500 rounded"
                  />
                </label>
              </div>

              {/* Plaqueta de Identificação Técnica */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">
                  Etiqueta / Plaqueta Técnica de Identificação
                </label>
                <input
                  type="text"
                  value={project.panelConfig?.nameplateText || ''}
                  onChange={e => {
                    const txt = e.target.value;
                    setProject((prev: any) => ({
                      ...prev,
                      panelConfig: {
                        ...(prev.panelConfig || PANEL_PRESETS.large),
                        nameplateText: txt
                      },
                      updated: Date.now()
                    }));
                  }}
                  placeholder="Ex: QGBT-01 • ALIMENTAÇÃO PRINCIPAL 400V"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono text-xs focus:border-amber-400 focus:outline-none"
                />
              </div>

              {/* Botão de Enquadramento */}
              <div className="pt-2 border-t border-slate-800 flex gap-2">
                <button
                  type="button"
                  onClick={handleFit}
                  className="flex-1 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white text-xs font-bold border border-blue-500/40 transition cursor-pointer"
                >
                  Centralizar Quadro
                </button>
                <button
                  type="button"
                  onClick={() => setIsPanelConfigOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition cursor-pointer"
                >
                  Concluir
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PAINEL FLUTUANTE DIREITO: PROPRIEDADES DO COMPONENTE SELECIONADO */}
        {showProps && selectedComponent && (
          <div className="absolute right-3 top-3 w-80 max-w-[calc(100vw-24px)] max-h-[calc(100%-80px)] bg-[#0A1224]/95 border border-blue-900/50 rounded-2xl shadow-2xl flex flex-col z-20 backdrop-blur-md overflow-hidden">
            <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-[#0E1A33]">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-black text-white">Propriedades & Comandos</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCompId(null)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-3 overflow-y-auto space-y-3.5 text-xs">
              {/* Título & Identificador */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1">Rótulo / Etiqueta</label>
                <input
                  type="text"
                  value={selectedComponent.label || ''}
                  onChange={e => {
                    const val = e.target.value;
                    setProject(prev => ({
                      ...prev,
                      components: prev.components.map(c =>
                        c.id === selectedCompId ? { ...c, label: val } : c
                      )
                    }));
                  }}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white font-bold text-xs"
                />
              </div>

              {/* Botões de Manobra Direta (Física) */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1.5">Acionamento Manual</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => triggerComponentCommand(selectedComponent.id, 'on')}
                    className="px-3 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white font-bold border border-emerald-500/40 text-xs transition cursor-pointer"
                  >
                    ▶ Ligar / Fechar
                  </button>
                  <button
                    type="button"
                    onClick={() => triggerComponentCommand(selectedComponent.id, 'off')}
                    className="px-3 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white font-bold border border-rose-500/40 text-xs transition cursor-pointer"
                  >
                    ■ Desligar / Abrir
                  </button>
                  <button
                    type="button"
                    onClick={() => triggerComponentCommand(selectedComponent.id, 'pulse')}
                    className="px-3 py-2 rounded-xl bg-amber-600/20 hover:bg-amber-600 text-amber-300 hover:text-white font-bold border border-amber-500/40 text-xs transition cursor-pointer"
                  >
                    ⚡ Pulsar (300ms)
                  </button>
                  <button
                    type="button"
                    onClick={() => triggerComponentCommand(selectedComponent.id, 'reset')}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold border border-slate-700 text-xs transition cursor-pointer"
                  >
                    🔄 Rearmar
                  </button>
                </div>
              </div>

              {/* Parâmetros Elétricos do Componente */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="block text-[10px] font-bold text-slate-400">Parâmetros de Projeto</label>
                {Object.entries(selectedComponent.params || {}).map(([key, val]) => (
                  <div key={key} className="flex items-center justify-between gap-2">
                    <span className="text-[11px] text-slate-400 font-mono">{key}</span>
                    <input
                      type="text"
                      value={String(val)}
                      onChange={e => {
                        const nextVal = isNaN(Number(e.target.value)) ? e.target.value : Number(e.target.value);
                        setProject(prev => ({
                          ...prev,
                          components: prev.components.map(c => {
                            if (c.id === selectedCompId) {
                              return {
                                ...c,
                                params: { ...c.params, [key]: nextVal }
                              };
                            }
                            return c;
                          })
                        }));
                      }}
                      className="w-24 px-2 py-1 bg-slate-900 border border-slate-800 rounded text-right font-mono text-xs text-white"
                    />
                  </div>
                ))}
              </div>

              {/* Botões de Ação na Seleção: Girar, Duplicar, Excluir */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={rotateSelectedComponent}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold flex items-center gap-1 border border-slate-800"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Girar</span>
                </button>
                <button
                  type="button"
                  onClick={duplicateSelectedComponent}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold flex items-center gap-1 border border-slate-800"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Duplicar</span>
                </button>
                <button
                  type="button"
                  onClick={deleteSelected}
                  className="px-2.5 py-1.5 rounded-lg bg-rose-950 hover:bg-rose-900 text-rose-300 text-xs font-bold flex items-center gap-1 border border-rose-900"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Excluir</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PAINEL FLUTUANTE DE INSTRUMENTAÇÃO DIGITAL & MEDIÇÕES RMS */}
        {showMeters && (
          <div className="absolute left-3 bottom-16 sm:bottom-3 z-10 px-3.5 py-2.5 rounded-2xl bg-[#0A1224]/90 border border-blue-900/40 shadow-xl backdrop-blur-md flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Tensão:</span>
              <strong className="text-amber-400">{meterV.toFixed(1)} V</strong>
            </div>
            <div className="h-4 w-px bg-slate-800" />
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Corrente:</span>
              <strong className={meterA > 0 ? 'text-emerald-400' : 'text-slate-500'}>
                {meterA.toFixed(2)} A
              </strong>
            </div>
            <div className="h-4 w-px bg-slate-800" />
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Potência:</span>
              <strong className="text-blue-400">{meterW.toFixed(0)} W</strong>
            </div>
            <div className="h-4 w-px bg-slate-800" />
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">FP:</span>
              <strong className="text-purple-300">{meterPF.toFixed(2)}</strong>
            </div>
          </div>
        )}

        {/* CONTROLE DE ZOOM & FIT FLUTUANTE NO CANTO INFERIOR DIREITO */}
        <div className="absolute right-3 bottom-16 sm:bottom-3 z-10 flex items-center gap-1.5 p-1.5 rounded-xl bg-[#0A1224]/90 border border-blue-900/40 shadow-xl backdrop-blur-md">
          <button
            type="button"
            onClick={() => {
              cameraRef.current.zoom = Math.max(0.1, cameraRef.current.zoom * 0.85);
              setProject(prev => ({ ...prev, updated: Date.now() }));
            }}
            className="w-7 h-7 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-xs cursor-pointer"
            title="Diminuir Zoom (Zoom Out)"
          >
            −
          </button>
          <button
            type="button"
            onClick={() => {
              cameraRef.current.zoom = 1.0;
              setProject(prev => ({ ...prev, updated: Date.now() }));
            }}
            className="text-[11px] font-mono px-1.5 py-0.5 rounded hover:bg-slate-800 text-slate-300 font-bold cursor-pointer"
            title="Redefinir Zoom para 100%"
          >
            {Math.round((cameraRef.current?.zoom || 1) * 100)}%
          </button>
          <button
            type="button"
            onClick={() => {
              cameraRef.current.zoom = Math.min(5.0, cameraRef.current.zoom * 1.15);
              setProject(prev => ({ ...prev, updated: Date.now() }));
            }}
            className="w-7 h-7 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-xs cursor-pointer"
            title="Aumentar Zoom (Zoom In)"
          >
            +
          </button>
          <div className="h-4 w-px bg-slate-800 mx-0.5" />
          <button
            type="button"
            onClick={() => {
              handleFit();
              setProject(prev => ({ ...prev, updated: Date.now() }));
            }}
            className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-[11px] font-bold cursor-pointer"
            title="Enquadrar Todo o Circuito (Fit)"
          >
            ⌗ Fit
          </button>
        </div>

        {/* OSCILOSCÓPIO DIGITAL FLUTUANTE */}
        {showScope && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 w-96 max-w-[calc(100vw-24px)] bg-[#0A1224]/95 border border-blue-900/50 rounded-2xl shadow-2xl z-30 backdrop-blur-md overflow-hidden flex flex-col">
            <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-[#0E1A33]">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-black text-white">Osciloscópio Digital True-RMS</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex rounded-lg bg-slate-900 p-0.5 border border-slate-700 text-[10px] font-bold">
                  {(['CH1', 'CH2', 'DUAL'] as const).map(ch => (
                    <button
                      key={ch}
                      type="button"
                      onClick={() => setScopeChannel(ch)}
                      className={`px-2 py-0.5 rounded ${
                        scopeChannel === ch
                          ? ch === 'CH1' ? 'bg-blue-600 text-white' : ch === 'CH2' ? 'bg-amber-600 text-white' : 'bg-emerald-600 text-white'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {ch}
                    </button>
                  ))}
                </div>
                <select
                  value={scopeVoltsDiv}
                  onChange={e => setScopeVoltsDiv(Number(e.target.value))}
                  className="bg-slate-900 text-slate-300 border border-slate-700 rounded px-1.5 py-0.5 text-[10px] font-mono outline-none"
                  title="Sensibilidade Vertical (V/Div)"
                >
                  <option value={50}>50 V/div</option>
                  <option value={100}>100 V/div</option>
                  <option value={200}>200 V/div</option>
                </select>
                <button
                  type="button"
                  onClick={() => setShowScope(false)}
                  className="p-1 rounded text-slate-400 hover:text-white ml-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div className="p-3 space-y-2">
              <canvas
                ref={scopeCanvasRef}
                width={360}
                height={160}
                className="w-full h-40 bg-[#040D1A] rounded-xl border border-slate-800 block"
              />
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-2 h-2 rounded-full bg-blue-400" />
                  <span>CH1: <strong className="text-blue-400">{meterV.toFixed(1)} V</strong></span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-2 h-2 rounded-full bg-amber-400" />
                  <span>CH2: <strong className="text-amber-400">{meterA.toFixed(2)} A</strong></span>
                </span>
                <span>f: <strong className="text-emerald-400">{meterHz.toFixed(1)} Hz</strong></span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. DOCK MOBILE DE NAVEGAÇÃO RÁPIDA (SOMENTE TELAS PEQUENAS) */}
      <footer className="sm:hidden h-14 bg-[#0A1224] border-t border-slate-800 flex items-center justify-around px-2 z-30 shrink-0">
        <button
          type="button"
          onClick={() => setShowLibrary(!showLibrary)}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${
            showLibrary ? 'text-blue-400' : 'text-slate-400'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Biblioteca</span>
        </button>

        <button
          type="button"
          onClick={() => setShowProps(!showProps)}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${
            showProps && selectedComponent ? 'text-blue-400' : 'text-slate-400'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Propriedades</span>
        </button>

        <button
          type="button"
          onClick={() => setShowScope(!showScope)}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${
            showScope ? 'text-blue-400' : 'text-slate-400'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Osciloscópio</span>
        </button>

        <button
          type="button"
          onClick={handleFit}
          className="flex flex-col items-center gap-0.5 text-[10px] font-bold text-slate-400"
        >
          <Maximize2 className="w-4 h-4" />
          <span>Enquadrar</span>
        </button>

        <button
          type="button"
          onClick={() => setIsPublishDialogOpen(true)}
          className="flex flex-col items-center gap-0.5 text-[10px] font-black text-amber-300"
        >
          <Zap className="w-4 h-4 fill-amber-300" />
          <span>Publicar</span>
        </button>
      </footer>

      {/* 4. MODAL DE PUBLICAÇÃO NO MURAL */}
      {isPublishDialogOpen && (
        <div className="fixed inset-0 z-[100000] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#0D152A] rounded-3xl border border-blue-900/60 p-5 sm:p-7 max-w-lg w-full space-y-5 shadow-2xl animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
                  <Zap className="w-4 h-4 fill-amber-300 text-amber-300" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-white">Publicar Circuito no Mural</h3>
                  <p className="text-[11px] text-slate-400">Compartilhe este esquema CAD interativo com a comunidade</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPublishDialogOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-200 mb-1">Título do Projeto CAD *</label>
                <input
                  type="text"
                  value={publishTitle}
                  onChange={e => setPublishTitle(e.target.value)}
                  placeholder="Ex: Partida Direta de Motor com Selo e Relé Térmico (IEC 60947)"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-200 mb-1">Área Técnica *</label>
                <select
                  value={publishCategory}
                  onChange={e => setPublishCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-200 text-xs sm:text-sm font-bold focus:outline-none focus:border-blue-500"
                >
                  <option value="Comandos Elétricos">Comandos Elétricos</option>
                  <option value="Instalações Elétricas">Instalações Elétricas Prediais</option>
                  <option value="Proteção & Aterramento">Proteção & Aterramento</option>
                  <option value="Energia Solar">Energia Solar Fotovoltaica</option>
                  <option value="Eletrônica & Automação">Eletrônica & Automação</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-200 mb-1">Descrição / Procedimento Técnico *</label>
                <textarea
                  rows={4}
                  value={publishDescription}
                  onChange={e => setPublishDescription(e.target.value)}
                  placeholder="Explique o funcionamento do circuito, dimensionamento dos componentes e orientações de segurança..."
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-blue-500 leading-relaxed"
                />
              </div>

              <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-900/50 flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="allowTestingCheckbox"
                  checked={allowTesting}
                  onChange={e => setAllowTesting(e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="allowTestingCheckbox" className="cursor-pointer text-slate-200">
                  <span className="font-bold block text-blue-300">
                    Permitir que outros técnicos testem este circuito
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Habilita o botão <strong>"⚡ Testar Circuito"</strong> no Mural para simulação e teste em tempo real na bancada CAD por qualquer membro.
                  </span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsPublishDialogOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white font-bold text-xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isPublishing || !publishTitle.trim()}
                onClick={handleConfirmPublish}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-black text-xs transition flex items-center gap-2 shadow-lg shadow-blue-900/50 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isPublishing ? 'Publicando...' : 'Confirmar e Publicar no Mural'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PAINEL MODAL DE AVISOS TÉCNICOS POR VOZ & DIAGNÓSTICO IEC */}
      <CadVoiceDiagnosticPanel
        isOpen={isDiagnosticPanelOpen}
        onClose={() => setIsDiagnosticPanelOpen(false)}
        onTriggerVisualEffect={(effect, compCode) => {
          setProject(prev => ({
            ...prev,
            components: prev.components.map(c => {
              if (
                (compCode && (c.code === compCode || c.id === compCode)) ||
                (effect === 'thermal' && (c.code === 'OLR' || c.code === 'MCB1' || c.code === 'MCB2' || c.code === 'MCB3')) ||
                (effect === 'sparks' && (c.code === 'CONTACTOR' || c.code === 'MCB3' || c.code === 'RCD')) ||
                (effect === 'led_inverter' && c.code === 'PV_INVERTER') ||
                (effect === 'tripped_breaker' && (c.code === 'MCB1' || c.code === 'MCB2' || c.code === 'MCB3' || c.code === 'RCD'))
              ) {
                return {
                  ...c,
                  state: {
                    ...c.state,
                    tripped: effect === 'tripped_breaker' ? true : c.state.tripped,
                    thermal: effect === 'thermal',
                    fault: effect === 'sparks' || effect === 'led_inverter',
                    sparking: effect === 'sparks'
                  }
                };
              }
              return c;
            })
          }));

          // Reset do efeito temporário após 3.5 segundos
          setTimeout(() => {
            setProject(prev => ({
              ...prev,
              components: prev.components.map(c => ({
                ...c,
                state: {
                  ...c.state,
                  thermal: false,
                  sparking: false
                }
              }))
            }));
          }, 3500);
        }}
      />
    </div>
  );
};
