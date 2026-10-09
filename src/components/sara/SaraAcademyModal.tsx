import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  ArrowLeft,
  BookOpen,
  GraduationCap,
  CheckCircle2,
  Lock,
  Play,
  Flame,
  Award,
  Zap,
  HelpCircle,
  Sparkles,
  ChevronRight,
  RotateCcw,
  MessageSquare,
  Clock,
  ShieldCheck,
  Cpu,
  Sun,
  Settings,
  Wind,
  Wrench,
  Activity,
  Maximize2,
  Shield,
  ArrowRight,
  Layers,
  AlertTriangle
} from 'lucide-react';
import {
  AcademyArea,
  AcademyLesson,
  AcademyLocalData,
  AcademyModule,
  AcademyOption
} from '../../types/academy';
import {
  computeCourseProgress,
  getMasteryLevelInfo,
  recordLessonCompletion,
  getTodayDateString
} from '../../services/saraAcademyService';
import { setActiveAcademyContext } from '../../services/saraAcademyContext';
import { soundFX } from '../../utils/audio';
import { useModalHistory, dismissModalWithoutHistory } from '../../utils/modalHistory';
import { FontScaleControl, useAcademyFontScale } from '../academy/FontScaleControl';
import { CircuitDiagramViewer } from '../academy/CircuitDiagramViewer';
import { InteractiveVisualLab } from '../academy/InteractiveVisualLab';
import { CircuitBlockFlowViewer } from '../academy/CircuitBlockFlowViewer';
import { SaraDailyHacksFeed } from '../academy/SaraDailyHacksFeed';
import { AssessmentExamView } from '../academy/AssessmentExamView';
import { ProfessionalLessonViewer } from '../academy/ProfessionalLessonViewer';

interface SaraAcademyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  userArea: AcademyArea;
  academyData: AcademyLocalData;
  onUpdateAcademyData: (data: AcademyLocalData) => void;
  onAskSara: (promptText: string, contextSummary?: string) => void;
}

type ActiveTab = 'curriculum' | 'lesson' | 'quiz' | 'hacks';

export const SaraAcademyModal: React.FC<SaraAcademyModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  userArea,
  academyData,
  onUpdateAcademyData,
  onAskSara
}) => {
  const userId = currentUser?.uid || 'guest';

  // Controle global de escala de fonte (12px a 22px, padrão 15px)
  const {
    fontSize,
    scaleRatio,
    increase,
    decrease,
    reset,
    canIncrease,
    canDecrease,
    isDefault
  } = useAcademyFontScale();

  // Progresso calculado do curso
  const courseProgress = useMemo(
    () => computeCourseProgress(userArea, academyData),
    [userArea, academyData]
  );

  // Aba ativa: inicia na aula do dia
  const [activeTab, setActiveTab] = useState<ActiveTab>('lesson');

  // Modo de visualização da lição: Laboratório Interativo (física e animações) ou Esquema Técnico (diagramas IEC)
  const [lessonVisualTab, setLessonVisualTab] = useState<'simulation' | 'schematic'>('simulation');

  // Aula atualmente selecionada para visualização
  const [selectedLesson, setSelectedLesson] = useState<AcademyLesson>(
    () => courseProgress.currentLesson
  );

  // Módulo da aula selecionada
  const selectedModule = useMemo(() => {
    for (const modWithProg of courseProgress.modulesWithProgress) {
      if (modWithProg.module.lessons.some(l => l.id === selectedLesson.id)) {
        return modWithProg.module;
      }
    }
    return courseProgress.currentModule;
  }, [courseProgress, selectedLesson]);

  // Estado do Teste de Fixação (Quiz)
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState<boolean>(false);
  const [quizFeedback, setQuizFeedback] = useState<'correct' | 'wrong' | null>(null);

  // Nível de maestria
  const mastery = useMemo(() => getMasteryLevelInfo(academyData.xp), [academyData.xp]);

  // Se a aula selecionada já foi concluída anteriormente
  const isLessonCompleted = useMemo(() => {
    return (academyData.completedLessonIds || []).includes(selectedLesson.id);
  }, [academyData.completedLessonIds, selectedLesson.id]);

  // Reseta estado do quiz ao trocar de aula
  useEffect(() => {
    setSelectedOptionId(null);
    setHasAnswered(false);
    setQuizFeedback(null);
  }, [selectedLesson.id]);

  // Sincroniza aula se a área do usuário mudar
  useEffect(() => {
    const allCurrentLessons = courseProgress.modulesWithProgress.flatMap(m => m.module.lessons);
    if (!allCurrentLessons.some(l => l.id === selectedLesson.id)) {
      setSelectedLesson(courseProgress.currentLesson);
    }
  }, [userArea, courseProgress, selectedLesson.id]);

  // Conexão de Contexto Global (Academia <-> Sara IA)
  useEffect(() => {
    if (isOpen && selectedLesson) {
      setActiveAcademyContext(selectedModule, selectedLesson, userArea);
    }
  }, [isOpen, selectedModule, selectedLesson, userArea]);

  // Módulo e navegação sequencial da aula ativa
  const currentModule = useMemo(() => {
    return courseProgress.modulesWithProgress.find(m => m.module.id === selectedLesson.moduleId)?.module;
  }, [courseProgress, selectedLesson.moduleId]);

  const allFlatLessons = useMemo(() => {
    return courseProgress.modulesWithProgress.flatMap(m => m.module.lessons);
  }, [courseProgress]);

  const currentLessonIndex = useMemo(() => {
    return allFlatLessons.findIndex(l => l.id === selectedLesson.id);
  }, [allFlatLessons, selectedLesson.id]);

  // Gerenciamento com History API (botão voltar fecha a academia e retorna à Sara IA)
  // DEVE ser chamado antes de qualquer early return para respeitar as Regras dos Hooks
  useModalHistory(isOpen, 'sara_academy', onClose);

  if (!isOpen) return null;

  // Selecionar uma aula no Índice
  const handleSelectLessonFromCurriculum = (lesson: AcademyLesson, status: string) => {
    if (status === 'locked') return;
    setSelectedLesson(lesson);
    setActiveTab('lesson');
  };

  // Tratar resposta do teste de fixação
  const handleSelectOption = async (option: AcademyOption) => {
    if (hasAnswered) return;

    setSelectedOptionId(option.id);
    setHasAnswered(true);

    const isCorrect = option.isCorrect;
    setQuizFeedback(isCorrect ? 'correct' : 'wrong');

    try {
      if (isCorrect) {
        soundFX.playSuccess();
      } else {
        soundFX.playComment();
      }
    } catch {}

    const res = await recordLessonCompletion(
      userId,
      userArea,
      selectedLesson.id,
      isCorrect
    );

    onUpdateAcademyData(res.updatedData);
  };

  // Tratar conclusão da avaliação integrada (Múltipla Escolha + Descritiva IA)
  const handleExamCompletion = async (earnedXp: number) => {
    try {
      if (earnedXp >= 80) {
        soundFX.playSuccess();
      } else {
        soundFX.playComment();
      }
    } catch {}

    const isPassed = earnedXp >= 80;
    const res = await recordLessonCompletion(
      userId,
      userArea,
      selectedLesson.id,
      isPassed
    );

    onUpdateAcademyData(res.updatedData);
  };

  // Botão "Tirar Dúvida no Exame com a Sara"
  const handleAskSaraExam = (questionContext: string) => {
    dismissModalWithoutHistory('sara_academy');
    onClose();
    onAskSara(questionContext, `Dúvida do Exame: ${selectedLesson.title} (${selectedLesson.norma})`);
  };

  // Botão "Tirar Dúvida na Aula com a Sara"
  // Diretriz técnica: passe ao modal apenas: { elementName: currentLesson.topicTitle, norm: currentLesson.normCode }.
  // Não envie o texto longo da aula. A Sara IA explica em detalhes com base apenas no nome do elemento e na norma correspondente.
  const handleAskSara = () => {
    const elementName = selectedLesson.title;
    const norm = selectedLesson.norma;
    const doubtPayload = `Elemento: ${elementName} | Norma: ${norm}`;

    dismissModalWithoutHistory('sara_academy');
    onClose();
    onAskSara(doubtPayload, `Elemento: ${elementName} (${norm})`);
  };

  const hasPrevLesson = currentLessonIndex > 0;
  const hasNextLesson = currentLessonIndex >= 0 && currentLessonIndex < allFlatLessons.length - 1;

  const handlePrevLesson = () => {
    if (hasPrevLesson) {
      setSelectedLesson(allFlatLessons[currentLessonIndex - 1]);
      setActiveTab('lesson');
    }
  };

  const handleNextLesson = () => {
    if (hasNextLesson) {
      setSelectedLesson(allFlatLessons[currentLessonIndex + 1]);
      setActiveTab('lesson');
    }
  };

  // Avançar para a próxima aula não concluída
  const handleAdvanceNextLesson = () => {
    if (hasNextLesson) {
      handleNextLesson();
    } else {
      setActiveTab('curriculum');
    }
  };

  // Ícones dinâmicos dos módulos
  const renderModuleIcon = (iconName: string) => {
    switch (iconName) {
      case 'Zap': return <Zap className="w-4 h-4 text-amber-400" />;
      case 'Cpu': return <Cpu className="w-4 h-4 text-blue-400" />;
      case 'ShieldCheck': return <ShieldCheck className="w-4 h-4 text-emerald-400" />;
      case 'Sun': return <Sun className="w-4 h-4 text-amber-400" />;
      case 'Settings': return <Settings className="w-4 h-4 text-cyan-400" />;
      case 'Wind': return <Wind className="w-4 h-4 text-sky-400" />;
      case 'Wrench': return <Wrench className="w-4 h-4 text-amber-400" />;
      case 'Activity': return <Activity className="w-4 h-4 text-emerald-400" />;
      case 'Maximize2': return <Maximize2 className="w-4 h-4 text-indigo-400" />;
      case 'Shield': return <Shield className="w-4 h-4 text-rose-400" />;
      default: return <Layers className="w-4 h-4 text-blue-400" />;
    }
  };

  const modalContent = (
    <div
      id="sara_academy_modal_overlay"
      className="fixed inset-0 w-screen h-[100dvh] z-[100000] bg-[#0A0F1D] overflow-hidden flex flex-col animate-in fade-in duration-200"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100dvh',
        zIndex: 100000,
        backgroundColor: '#0A0F1D',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        id="sara_academy_modal_window"
        className="w-full h-full bg-[#0A0F1D] flex flex-col overflow-hidden text-slate-100"
        style={{
          flex: '1 1 0%',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          maxHeight: '100%',
          overflow: 'hidden',
        }}
      >
        {/* ================================================================= */}
        {/* TOPO: IDENTIDADE VISUAL + GAMIFICAÇÃO + BOTÃO FECHAR              */}
        {/* ================================================================= */}
        <div className="px-3 sm:px-4 py-3 bg-[#111827] border-b border-[#1E293B] flex items-center justify-between gap-2 sm:gap-3 shrink-0 sticky top-0 z-20">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Botão Voltar (Seta de recuo) */}
            <button
              type="button"
              onClick={onClose}
              onTouchEnd={(e) => {
                e.preventDefault();
                onClose();
              }}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-white border border-slate-700 active:scale-95 transition flex items-center gap-1.5 text-xs font-mono font-bold cursor-pointer shrink-0 z-30"
              title="Voltar ao Chat"
              aria-label="Voltar ao Chat"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">VOLTAR</span>
            </button>

            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm sm:text-base font-black text-white tracking-tight truncate">
                  Minha Academia Técnica
                </h2>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-blue-500/20 text-[#3B82F6] border border-blue-500/30 uppercase tracking-wider">
                  {userArea === 'eletrotecnica' ? 'Padrão Europeu IEC' : 'Padrão Europeu EN / ISO'}
                </span>
              </div>
              <p className="text-[11px] text-[#94A3B8] truncate">
                {userArea === 'eletrotecnica'
                  ? 'Curso de Eletrotécnica Aplicada • Proteções, Aterramento & Solar'
                  : 'Curso de Mecânica Industrial • Hidráulica, Pneumática & Preditiva'}
              </p>
            </div>
          </div>

          {/* Gamificação: Streak + XP + Nível + Controle de Fonte + Fechar */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* CONTROLE GLOBAL DE TAMANHO DE FONTE [ A- | A+ ] */}
            <FontScaleControl
              fontSize={fontSize}
              onIncrease={increase}
              onDecrease={decrease}
              onReset={reset}
              canIncrease={canIncrease}
              canDecrease={canDecrease}
              isDefault={isDefault}
              className="scale-90 sm:scale-100 origin-right"
            />

            {/* Streak */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-black ${
                academyData.streak > 0
                  ? 'bg-amber-500/20 text-[#F59E0B] border border-amber-500/30'
                  : 'bg-slate-900 text-slate-500 border border-slate-800'
              }`}
              title={`${academyData.streak} dia(s) consecutivos de estudo`}
            >
              <Flame className={`w-4 h-4 ${academyData.streak > 0 ? 'text-[#F59E0B] fill-amber-500 animate-pulse' : 'text-slate-500'}`} />
              <span>{academyData.streak}d</span>
            </div>

            {/* XP e Nível */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-slate-900/90 border border-[#1E293B] rounded-xl">
              <Award className="w-4 h-4 text-[#F59E0B]" />
              <div className="text-right leading-none">
                <div className="text-xs font-black text-white">
                  {academyData.xp} <span className="text-[10px] text-[#3B82F6] font-bold">XP</span>
                </div>
                <div className="text-[9px] text-[#94A3B8] font-semibold mt-0.5">
                  {mastery.level}
                </div>
              </div>
            </div>

            {/* Botão Fechar Modal */}
            <button
              type="button"
              onClick={onClose}
              onTouchEnd={(e) => {
                e.preventDefault();
                onClose();
              }}
              className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white active:scale-95 transition cursor-pointer z-30"
              title="Fechar Academia"
              aria-label="Fechar Academia"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ================================================================= */}
        {/* NAVEGAÇÃO: 4 ABAS SUPERIORES DA ACADEMIA                         */}
        {/* ================================================================= */}
        <div className="px-4 py-2 bg-[#0A0F1D] border-b border-[#1E293B] flex items-center justify-between gap-2 overflow-x-auto no-scrollbar shrink-0">
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* ABA 1: ÍNDICE DO CURSO */}
            <button
              type="button"
              onClick={() => setActiveTab('curriculum')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0 ${
                activeTab === 'curriculum'
                  ? 'bg-[#3B82F6] text-white shadow-md'
                  : 'bg-[#111827] hover:bg-slate-800 text-[#94A3B8] hover:text-white border border-[#1E293B]'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>1. Índice do Curso</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-black/30 font-black">
                {courseProgress.completedModulesCount}/{courseProgress.totalModules}
              </span>
            </button>

            {/* ABA 2: AULA DO DIA */}
            <button
              type="button"
              onClick={() => setActiveTab('lesson')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0 ${
                activeTab === 'lesson'
                  ? 'bg-[#3B82F6] text-white shadow-md'
                  : 'bg-[#111827] hover:bg-slate-800 text-[#94A3B8] hover:text-white border border-[#1E293B]'
              }`}
            >
              <Play className="w-4 h-4" />
              <span>2. Aula do Dia</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-blue-900/50 text-blue-200 border border-blue-400/30 font-bold truncate max-w-[120px]">
                {selectedLesson.norma}
              </span>
            </button>

            {/* ABA 3: AVALIAÇÃO DE COMPETÊNCIA */}
            <button
              type="button"
              onClick={() => setActiveTab('quiz')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0 ${
                activeTab === 'quiz'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md font-black'
                  : 'bg-[#111827] hover:bg-slate-800 text-[#94A3B8] hover:text-white border border-[#1E293B]'
              }`}
            >
              <HelpCircle className="w-4 h-4 text-purple-400" />
              <span>3. Avaliação de Competência</span>
              {isLessonCompleted ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
              ) : (
                <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                  IA • ≥80%
                </span>
              )}
            </button>

            {/* ABA 4: PÍLULAS & HACKS DO DIA */}
            <button
              type="button"
              onClick={() => setActiveTab('hacks')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0 ${
                activeTab === 'hacks'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-md'
                  : 'bg-[#111827] hover:bg-slate-800 text-[#94A3B8] hover:text-white border border-[#1E293B]'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>4. Pílulas & Hacks</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-amber-400/20 text-amber-300 font-bold border border-amber-400/30">
                Feed Diário
              </span>
            </button>
          </div>

          {/* Progresso Geral do Curso */}
          <div className="hidden md:flex items-center gap-2.5 shrink-0 pl-2">
            <div className="text-right">
              <span className="text-[10px] text-[#94A3B8] font-bold block">Progresso Geral</span>
              <span className="text-xs font-black text-[#10B981]">{courseProgress.overallPercent}% Concluído</span>
            </div>
            <div className="w-24 bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
              <div
                className="bg-[#10B981] h-2 rounded-full transition-all duration-500"
                style={{ width: `${courseProgress.overallPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* CORPO DO MODAL (CONTEÚDO DINÂMICO CONFORME A ABA SELECIONADA)    */}
        {/* ================================================================= */}
        <div
          className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#0A0F1D] transition-[font-size] duration-150"
          style={{ fontSize: `${fontSize}px` }}
        >

          {/* =============================================================== */}
          {/* ABA 1: ÍNDICE DO CURSO (GRADE CURRICULAR SEQUENCIAL)            */}
          {/* =============================================================== */}
          {activeTab === 'curriculum' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Resumo do Curso */}
              <div className="p-4 rounded-2xl bg-[#111827] border border-[#1E293B] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#3B82F6]" />
                    <span>Grade Curricular Oficial ({userArea === 'eletrotecnica' ? 'Eletrotécnica IEC' : 'Mecânica EN/ISO'})</span>
                  </h3>
                  <p className="text-xs text-[#94A3B8] mt-1">
                    Complete as aulas sequencialmente para desbloquear os módulos avançados e conquistar o título de Especialista IEC.
                  </p>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-[#1E293B] flex items-center gap-3 shrink-0">
                  <div className="text-center">
                    <span className="text-xs font-black text-white">{courseProgress.totalModules}</span>
                    <span className="text-[10px] text-[#94A3B8] block">Módulos</span>
                  </div>
                  <div className="w-px h-6 bg-[#1E293B]" />
                  <div className="text-center">
                    <span className="text-xs font-black text-[#10B981]">{courseProgress.completedModulesCount}</span>
                    <span className="text-[10px] text-[#94A3B8] block">Concluídos</span>
                  </div>
                  <div className="w-px h-6 bg-[#1E293B]" />
                  <div className="text-center">
                    <span className="text-xs font-black text-[#F59E0B]">{academyData.xp}</span>
                    <span className="text-[10px] text-[#94A3B8] block">XP Total</span>
                  </div>
                </div>
              </div>

              {/* Lista de Módulos Sequenciais */}
              <div className="space-y-3">
                {courseProgress.modulesWithProgress.map((modItem, idx) => {
                  const isLocked = modItem.status === 'locked';
                  const isCompleted = modItem.status === 'completed';
                  const isInProgress = modItem.status === 'in_progress';

                  return (
                    <div
                      key={modItem.module.id}
                      className={`rounded-2xl border transition overflow-hidden ${
                        isCompleted
                          ? 'bg-[#111827]/90 border-emerald-900/40'
                          : isInProgress
                          ? 'bg-[#111827] border-blue-500/50 shadow-md ring-1 ring-blue-500/20'
                          : 'bg-slate-950/60 border-slate-800/80 opacity-60'
                      }`}
                    >
                      {/* Cabeçalho do Módulo */}
                      <div className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1E293B]">
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                            isCompleted
                              ? 'bg-emerald-500/20 text-[#10B981] border border-emerald-500/30'
                              : isInProgress
                              ? 'bg-blue-500/20 text-[#3B82F6] border border-blue-500/30'
                              : 'bg-slate-800 text-slate-500'
                          }`}>
                            {isCompleted ? (
                              <CheckCircle2 className="w-4 h-4" />
                            ) : isLocked ? (
                              <Lock className="w-4 h-4" />
                            ) : (
                              renderModuleIcon(modItem.module.icon)
                            )}
                          </div>

                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-bold text-[#94A3B8]">
                                Módulo {idx + 1} de {courseProgress.totalModules}
                              </span>
                              {isCompleted && (
                                <span className="text-[10px] font-black px-2 py-0.2 rounded-md bg-emerald-500/20 text-[#10B981] border border-emerald-500/30">
                                  CONCLUÍDO
                                </span>
                              )}
                              {isInProgress && (
                                <span className="text-[10px] font-black px-2 py-0.2 rounded-md bg-blue-500/20 text-[#3B82F6] border border-blue-500/30">
                                  EM ANDAMENTO
                                </span>
                              )}
                              {isLocked && (
                                <span className="text-[10px] font-black px-2 py-0.2 rounded-md bg-slate-800 text-slate-400 border border-slate-700">
                                  BLOQUEADO
                                </span>
                              )}
                            </div>
                            <h4 className="text-sm font-black text-white mt-0.5">
                              {modItem.module.title}
                            </h4>
                            <p className="text-xs text-[#94A3B8] mt-1 line-clamp-2">
                              {modItem.module.description}
                            </p>
                          </div>
                        </div>

                        {/* Barra de Progresso do Módulo */}
                        <div className="w-full sm:w-44 flex flex-col items-end gap-1 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#1E293B]">
                          <div className="w-full flex items-center justify-between text-[11px]">
                            <span className="text-[#94A3B8]">
                              {modItem.completedCount}/{modItem.totalCount} Aulas
                            </span>
                            <span className={`font-mono font-bold ${isCompleted ? 'text-[#10B981]' : 'text-[#3B82F6]'}`}>
                              {modItem.percent}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-2 rounded-full transition-all duration-500 ${
                                isCompleted ? 'bg-[#10B981]' : 'bg-[#3B82F6]'
                              }`}
                              style={{ width: `${modItem.percent}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Lista de Aulas do Módulo */}
                      <div className="p-3 bg-slate-950/40 space-y-2">
                        {modItem.lessonsWithStatus.map((lesItem) => {
                          const isLesCompleted = lesItem.status === 'completed';
                          const isLesAvailable = lesItem.status === 'available';
                          const isLesLocked = lesItem.status === 'locked';
                          const isSelected = selectedLesson.id === lesItem.lesson.id;

                          return (
                            <button
                              key={lesItem.lesson.id}
                              type="button"
                              onClick={() => handleSelectLessonFromCurriculum(lesItem.lesson, lesItem.status)}
                              disabled={isLesLocked}
                              className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between gap-3 transition cursor-pointer ${
                                isSelected
                                  ? 'bg-blue-950/60 border-[#3B82F6] ring-1 ring-blue-500/50'
                                  : isLesCompleted
                                  ? 'bg-emerald-950/30 hover:bg-emerald-950/50 border-emerald-900/40'
                                  : isLesAvailable
                                  ? 'bg-[#111827] hover:bg-slate-800 border-[#1E293B]'
                                  : 'bg-slate-900/40 border-slate-850 opacity-40 cursor-not-allowed'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                                  isLesCompleted
                                    ? 'bg-emerald-500/20 text-[#10B981]'
                                    : isLesAvailable
                                    ? 'bg-blue-500/20 text-[#3B82F6]'
                                    : 'bg-slate-800 text-slate-500'
                                }`}>
                                  {isLesCompleted ? (
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                  ) : isLesLocked ? (
                                    <Lock className="w-3 h-3" />
                                  ) : (
                                    <Play className="w-3 h-3 fill-current" />
                                  )}
                                </div>

                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="text-xs font-bold text-white truncate">
                                      {lesItem.lesson.title}
                                    </span>
                                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-800 text-blue-300 border border-slate-700">
                                      {lesItem.lesson.norma}
                                    </span>
                                  </div>
                                  <span className="text-[10px] text-[#94A3B8] flex items-center gap-1 mt-0.5">
                                    <Clock className="w-3 h-3" />
                                    {lesItem.lesson.durationMinutes} min • Nível {lesItem.lesson.level}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                {isLesCompleted && (
                                  <span className="text-[10px] font-bold text-[#10B981] hidden sm:inline">
                                    Concluída
                                  </span>
                                )}
                                {isLesAvailable && (
                                  <span className="text-[10px] font-bold text-[#3B82F6] flex items-center gap-1">
                                    Acessar <ChevronRight className="w-3.5 h-3.5" />
                                  </span>
                                )}
                                {isLesLocked && (
                                  <span className="text-[10px] text-slate-500">
                                    Bloqueada
                                  </span>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* ABA 2: AULA DO DIA (PADRÃO PROFISSIONAL DE FABRICANTE)          */}
          {/* =============================================================== */}
          {activeTab === 'lesson' && (
            <div className="animate-in fade-in duration-150">
              <ProfessionalLessonViewer
                lesson={selectedLesson}
                module={currentModule}
                moduleIndex={currentModule?.order}
                totalModules={courseProgress.totalModules}
                isCompleted={isLessonCompleted}
                baseFontSize={fontSize}
                onAdvanceToQuiz={() => setActiveTab('quiz')}
                onAskSara={handleAskSara}
                onNextLesson={handleNextLesson}
                onPrevLesson={handlePrevLesson}
                hasNextLesson={hasNextLesson}
                hasPrevLesson={hasPrevLesson}
              />
            </div>
          )}
          {/* =============================================================== */}
          {/* ABA 3: AVALIAÇÃO INTEGRADA (MÚLTIPLA ESCOLHA + DESCRITIVA IA)    */}
          {/* =============================================================== */}
          {activeTab === 'quiz' && (
            <AssessmentExamView
              lesson={selectedLesson}
              baseFontSize={fontSize}
              userName={currentUser?.name || currentUser?.displayName || 'Técnico Matriculado'}
              userId={userId}
              onCompleteSuccess={handleExamCompletion}
              onAskSara={handleAskSaraExam}
              onGoToLesson={() => setActiveTab('lesson')}
            />
          )}

          {/* =============================================================== */}
          {/* ABA 4: PÍLULAS & HACKS DO DIA (FEED INTERATIVO DIÁRIO)           */}
          {/* =============================================================== */}
          {activeTab === 'hacks' && (
            <div className="animate-in fade-in duration-150">
              <SaraDailyHacksFeed
                academyData={academyData}
                onUpdateAcademyData={onUpdateAcademyData}
                baseFontSize={fontSize}
              />
            </div>
          )}

        </div>
      </div>
    </div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(modalContent, document.body);
};
