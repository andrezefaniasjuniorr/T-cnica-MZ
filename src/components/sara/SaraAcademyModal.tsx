import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
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
import { soundFX } from '../../utils/audio';

interface SaraAcademyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  userArea: AcademyArea;
  academyData: AcademyLocalData;
  onUpdateAcademyData: (data: AcademyLocalData) => void;
  onAskSara: (promptText: string, contextSummary?: string) => void;
}

type ActiveTab = 'curriculum' | 'lesson' | 'quiz';

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

  // Progresso calculado do curso
  const courseProgress = useMemo(
    () => computeCourseProgress(userArea, academyData),
    [userArea, academyData]
  );

  // Aba ativa: inicia na aula do dia
  const [activeTab, setActiveTab] = useState<ActiveTab>('lesson');

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

  // Botão "Tirar Dúvida na Aula com a Sara"
  const handleAskSara = () => {
    const chosenOption = selectedLesson.quiz.options.find(o => o.id === selectedOptionId);
    const chosenText = chosenOption ? `Minha resposta no teste foi: (${chosenOption.id}) "${chosenOption.text}".` : '';

    const promptText = `Olá Eng. Sara! Estou estudando a aula "${selectedLesson.title}" (${selectedLesson.norma}) na Minha Academia Técnica e gostaria de aprofundar uma dúvida de campo:

• Conceito: "${selectedLesson.theory.conceito}"
• Realidade em Moçambique: "${selectedLesson.theory.aplicacaoMocambique}"
• Pergunta do Desafio: "${selectedLesson.quiz.question}"
${chosenText}
• Resolução Oficial IEC/EN: "${selectedLesson.quiz.explanation}"

Pode me dar mais detalhes práticos sobre como diagnosticar isso com segurança em instalações reais em Moçambique e quais os erros mais comuns cometidos em campo?`;

    onClose();
    onAskSara(promptText, `Dúvida da Aula: ${selectedLesson.title} (${selectedLesson.norma})`);
  };

  // Avançar para a próxima aula não concluída
  const handleAdvanceNextLesson = () => {
    const allLessons = courseProgress.modulesWithProgress.flatMap(m => m.module.lessons);
    const currentIndex = allLessons.findIndex(l => l.id === selectedLesson.id);
    if (currentIndex >= 0 && currentIndex < allLessons.length - 1) {
      const nextLesson = allLessons[currentIndex + 1];
      setSelectedLesson(nextLesson);
      setActiveTab('lesson');
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

  return (
    <div
      id="sara_academy_modal_overlay"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200"
    >
      <div
        id="sara_academy_modal_window"
        className="w-full max-w-4xl h-[92vh] max-h-[860px] bg-[#0A0F1D] border border-[#1E293B] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100"
      >
        {/* ================================================================= */}
        {/* TOPO: IDENTIDADE VISUAL + GAMIFICAÇÃO + BOTÃO FECHAR              */}
        {/* ================================================================= */}
        <div className="px-4 py-3 bg-[#111827] border-b border-[#1E293B] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
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

          {/* Gamificação: Streak + XP + Nível + Fechar */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
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
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-slate-900/90 border border-[#1E293B] rounded-xl">
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
              className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
              title="Voltar ao Chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ================================================================= */}
        {/* NAVEGAÇÃO: 3 ABAS SUPERIORES DA ACADEMIA                         */}
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

            {/* ABA 3: TESTE DE FIXAÇÃO */}
            <button
              type="button"
              onClick={() => setActiveTab('quiz')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0 ${
                activeTab === 'quiz'
                  ? 'bg-[#3B82F6] text-white shadow-md'
                  : 'bg-[#111827] hover:bg-slate-800 text-[#94A3B8] hover:text-white border border-[#1E293B]'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>3. Teste de Fixação</span>
              {isLessonCompleted ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
              ) : (
                <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-amber-500/20 text-[#F59E0B] font-bold">
                  +50 XP
                </span>
              )}
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
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#0A0F1D]">

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
          {/* ABA 2: AULA DO DIA (CONTEÚDO TEÓRICO & PRÁTICO DE CAMPO)         */}
          {/* =============================================================== */}
          {activeTab === 'lesson' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Título da Aula e Norma Europeia */}
              <div className="p-4 rounded-2xl bg-[#111827] border border-[#1E293B] space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-lg bg-blue-500/20 text-[#3B82F6] text-xs font-black border border-blue-500/30 uppercase tracking-wider">
                      {selectedLesson.norma}
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      Nível {selectedLesson.level}
                    </span>
                    <span className="text-xs text-[#94A3B8] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {selectedLesson.durationMinutes} min
                    </span>
                  </div>

                  {isLessonCompleted ? (
                    <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-[#10B981] text-xs font-bold border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Aula Concluída
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-[#F59E0B] flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      +{selectedLesson.quiz.xpReward} XP Disponíveis
                    </span>
                  )}
                </div>

                <h3 className="text-base sm:text-lg font-black text-white leading-snug">
                  {selectedLesson.title}
                </h3>
                <p className="text-xs text-[#3B82F6] font-semibold">
                  {selectedLesson.moduleTitle}
                </p>
              </div>

              {/* 1. CONCEITO TÉCNICO OBJETIVO */}
              <div className="p-4 rounded-2xl bg-[#111827] border border-[#1E293B] space-y-2">
                <div className="flex items-center gap-2 text-xs font-black text-[#3B82F6] uppercase tracking-wider">
                  <Zap className="w-4 h-4 text-[#3B82F6]" />
                  <span>1. Conceito Técnico & Fundamentação Normativa</span>
                </div>
                <p className="text-xs sm:text-sm leading-relaxed text-slate-200">
                  {selectedLesson.theory.conceito}
                </p>
              </div>

              {/* 2. FUNCIONAMENTO DOS COMPONENTES */}
              <div className="p-4 rounded-2xl bg-[#111827] border border-[#1E293B] space-y-2">
                <div className="flex items-center gap-2 text-xs font-black text-amber-400 uppercase tracking-wider">
                  <Settings className="w-4 h-4 text-amber-400" />
                  <span>2. Funcionamento Operacional dos Componentes</span>
                </div>
                <p className="text-xs sm:text-sm leading-relaxed text-slate-200 whitespace-pre-line">
                  {selectedLesson.theory.funcionamento}
                </p>
                {selectedLesson.theory.calculationSnippet && (
                  <div className="mt-3 p-3 rounded-xl bg-slate-950 font-mono text-xs text-blue-300 border border-blue-900/40">
                    💡 <span className="font-bold">Fórmula & Cálculo Normativo:</span> {selectedLesson.theory.calculationSnippet}
                  </div>
                )}
              </div>

              {/* 3. APLICAÇÃO PRÁTICA EM MOÇAMBIQUE */}
              <div className="p-4 rounded-2xl bg-[#111827] border border-[#1E293B] space-y-2">
                <div className="flex items-center gap-2 text-xs font-black text-[#10B981] uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4 text-[#10B981]" />
                  <span>3. Aplicação Prática e Desafios Reais em Moçambique</span>
                </div>
                <p className="text-xs sm:text-sm leading-relaxed text-slate-200">
                  {selectedLesson.theory.aplicacaoMocambique}
                </p>
              </div>

              {/* 4. EXEMPLO REAL DE CAMPO / DIAGNÓSTICO */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-[#1E293B] space-y-2">
                <div className="flex items-center gap-2 text-xs font-black text-white uppercase tracking-wider">
                  <Wrench className="w-4 h-4 text-[#F59E0B]" />
                  <span>4. Caso Real de Instalação e Diagnóstico de Campo</span>
                </div>
                <p className="text-xs sm:text-sm leading-relaxed text-slate-300">
                  {selectedLesson.theory.exemploPratico}
                </p>
              </div>

              {/* BARRA DE AÇÃO INFERIOR DA AULA */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#1E293B]">
                <button
                  type="button"
                  onClick={handleAskSara}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer border border-[#1E293B]"
                  title="Envia as referências desta aula para a Sara IA no chat"
                >
                  <MessageSquare className="w-4 h-4 text-[#3B82F6]" />
                  <span>Tirar Dúvida na Aula com a Sara</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('quiz')}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#3B82F6] hover:bg-blue-600 text-white text-xs font-black transition flex items-center justify-center gap-2 shadow-md cursor-pointer"
                >
                  <span>Avançar para o Teste de Fixação</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* ABA 3: TESTE DE FIXAÇÃO (EXERCÍCIO INTERATIVO & XP)              */}
          {/* =============================================================== */}
          {activeTab === 'quiz' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Cabeçalho do Teste */}
              <div className="p-4 rounded-2xl bg-[#111827] border border-[#1E293B] flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-[#3B82F6] border border-blue-500/30 flex items-center justify-center shrink-0">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white">
                      Desafio Prático de Avaliação Técnica
                    </h3>
                    <p className="text-xs text-[#94A3B8]">
                      Norma de Referência: <span className="text-blue-300 font-bold">{selectedLesson.norma}</span>
                    </p>
                  </div>
                </div>

                <div className="px-3 py-1 rounded-xl bg-amber-500/20 text-[#F59E0B] border border-amber-500/30 text-xs font-black flex items-center gap-1.5 shrink-0">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>+{selectedLesson.quiz.xpReward} XP</span>
                </div>
              </div>

              {/* Pergunta Objetiva */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-[#1E293B] space-y-3">
                <p className="text-xs sm:text-sm font-black text-white leading-relaxed flex items-start gap-2">
                  <span className="text-[#3B82F6] text-base font-black shrink-0">Q:</span>
                  <span>{selectedLesson.quiz.question}</span>
                </p>

                {/* Opções Clicáveis com Feedback Visual Imediato (Verde Esmeralda / Vermelho) */}
                <div className="grid grid-cols-1 gap-2.5 pt-2">
                  {selectedLesson.quiz.options.map((option) => {
                    const isSelected = selectedOptionId === option.id;
                    let style = 'bg-[#111827] hover:bg-slate-800 text-slate-200 border-[#1E293B]';

                    if (hasAnswered) {
                      if (option.isCorrect) {
                        style = 'bg-emerald-950/80 border-[#10B981] text-emerald-100 ring-2 ring-emerald-500/40';
                      } else if (isSelected && !option.isCorrect) {
                        style = 'bg-rose-950/80 border-rose-500 text-rose-100 ring-2 ring-rose-500/40';
                      } else {
                        style = 'bg-slate-950/50 border-slate-900 text-slate-500 opacity-50';
                      }
                    }

                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => handleSelectOption(option)}
                        disabled={hasAnswered}
                        className={`w-full text-left p-3 sm:p-3.5 rounded-xl border transition flex items-start gap-3 cursor-pointer text-xs sm:text-sm leading-relaxed ${style}`}
                      >
                        <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs shrink-0 mt-0.5 ${
                          hasAnswered && option.isCorrect
                            ? 'bg-[#10B981] text-slate-950'
                            : hasAnswered && isSelected && !option.isCorrect
                            ? 'bg-rose-500 text-white'
                            : 'bg-slate-800 text-slate-300'
                        }`}>
                          {option.id}
                        </span>

                        <div className="flex-1">
                          <span className="font-medium">{option.text}</span>
                          {hasAnswered && (isSelected || option.isCorrect) && (
                            <p className={`mt-1.5 text-xs font-semibold leading-normal ${
                              option.isCorrect ? 'text-emerald-300' : 'text-rose-300'
                            }`}>
                              {option.feedback}
                            </p>
                          )}
                        </div>

                        {hasAnswered && option.isCorrect && (
                          <CheckCircle2 className="w-5 h-5 text-[#10B981] shrink-0 mt-0.5" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Resolução Comentada Passo a Passo (Exibida após a resposta) */}
              {hasAnswered && (
                <div className="p-4 rounded-2xl bg-blue-950/40 border border-blue-800/50 space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs font-black text-[#3B82F6] uppercase tracking-wider">
                      <BookOpen className="w-4 h-4" />
                      <span>Resolução Comentada ({selectedLesson.norma})</span>
                    </div>

                    {quizFeedback === 'correct' ? (
                      <span className="px-2.5 py-0.5 rounded-md bg-emerald-950 text-[#10B981] text-xs font-black border border-emerald-800">
                        +50 XP Conquistados!
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-md bg-amber-950 text-[#F59E0B] text-xs font-bold border border-amber-800">
                        +15 XP por Esforço
                      </span>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm leading-relaxed text-slate-200">
                    {selectedLesson.quiz.explanation}
                  </p>

                  <div className="p-3 rounded-xl bg-slate-950/80 border border-blue-900/40 text-xs font-bold text-blue-300">
                    📌 {selectedLesson.quiz.keyTakeaway}
                  </div>
                </div>
              )}

              {/* BOTÕES DE AÇÃO: DUVIDA COM SARA + CONCLUIR E PRÓXIMA AULA */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#1E293B]">
                <button
                  type="button"
                  onClick={handleAskSara}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer border border-[#1E293B]"
                  title="Abre o chat da Sara IA enviando os dados deste teste para tirar dúvidas"
                >
                  <MessageSquare className="w-4 h-4 text-[#3B82F6]" />
                  <span>Tirar Dúvida na Aula com a Sara</span>
                </button>

                <div className="w-full sm:w-auto flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('lesson')}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer border border-[#1E293B]"
                  >
                    Revisar Teoria
                  </button>

                  <button
                    type="button"
                    onClick={handleAdvanceNextLesson}
                    className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-[#3B82F6] hover:bg-blue-600 text-white text-xs font-black transition flex items-center justify-center gap-2 shadow-md cursor-pointer"
                  >
                    <span>Concluir & Próxima Aula</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
