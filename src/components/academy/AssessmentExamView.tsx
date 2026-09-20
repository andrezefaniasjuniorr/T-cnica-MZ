import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertCircle,
  BookOpen,
  ArrowRight,
  RotateCcw,
  Download,
  MessageSquare,
  Zap,
  Layers,
  Award,
  Clock,
  ShieldCheck,
  Send,
  Loader2,
  FileText,
  LayoutList,
  Columns,
  HelpCircle,
  Wrench,
  Shield,
  Check
} from 'lucide-react';
import { AcademyLesson } from '../../types/academy';
import {
  AssessmentAttempt,
  AssessmentMCQuestion,
  AssessmentDescriptiveQuestion
} from '../../types/assessment';
import {
  generateAssessmentForLesson
} from '../../data/assessmentBank';
import {
  evaluateDescriptiveAnswer
} from '../../services/saraAssessmentEvaluator';
import {
  generateAssessmentPDF
} from '../../utils/pdfAssessmentGenerator';

export interface AssessmentExamViewProps {
  lesson: AcademyLesson;
  baseFontSize: number;
  userName?: string;
  userId?: string;
  onCompleteSuccess: (earnedXp: number) => void;
  onAskSara: (contextQuestion: string) => void;
  onGoToLesson: () => void;
}

type DescSubField = 'sub1' | 'sub2' | 'sub3';

interface DescSubAnswers {
  sub1: string; // 1. Instrumentos e Ensaios (15 pts)
  sub2: string; // 2. Critérios Normativos (15 pts)
  sub3: string; // 3. Ações Corretivas e Segurança (10 pts)
}

export const AssessmentExamView: React.FC<AssessmentExamViewProps> = ({
  lesson,
  baseFontSize = 15,
  userName = 'Técnico Matriculado',
  userId = 'guest',
  onCompleteSuccess,
  onAskSara,
  onGoToLesson
}) => {
  // Estado da tentativa de avaliação
  const [attemptNumber, setAttemptNumber] = useState<number>(1);
  const [currentExam, setCurrentExam] = useState<AssessmentAttempt>(() =>
    generateAssessmentForLesson(lesson, 1, userName, userId)
  );

  // Respostas do aluno
  const [mcAnswers, setMcAnswers] = useState<Record<string, string>>({});
  const [descAnswers, setDescAnswers] = useState<Record<string, string>>({});

  // Subquestões da questão de desenvolvimento (Instrumentos, Critérios Normativos, Ações Corretivas)
  const [activeSubTab, setActiveSubTab] = useState<Record<string, DescSubField>>({});
  const [subAnswersMap, setSubAnswersMap] = useState<Record<string, DescSubAnswers>>({});
  const [subViewMode, setSubViewMode] = useState<'tabs' | 'stacked'>('tabs');

  // Estados de submissão e avaliação
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [hasEvaluated, setHasEvaluated] = useState<boolean>(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState<boolean>(false);

  // Recarrega o exame caso a lição mude
  useEffect(() => {
    setAttemptNumber(1);
    setMcAnswers({});
    setDescAnswers({});
    setSubAnswersMap({});
    setActiveSubTab({});
    setHasEvaluated(false);
    setIsEvaluating(false);
    setCurrentExam(generateAssessmentForLesson(lesson, 1, userName, userId));
  }, [lesson.id, userName, userId]);

  // Parser para carregar subquestões se houver texto pré-existente
  const parseSubSections = (text: string): DescSubAnswers => {
    if (!text) return { sub1: '', sub2: '', sub3: '' };
    if (text.includes('1. INSTRUMENTOS') || text.includes('1. Instrumentos')) {
      const p1 = text.split(/1\.\s*INSTRUMENTOS[^:]*:/i)[1] || '';
      const p2Split = p1.split(/2\.\s*CRITÉRIOS[^:]*:/i);
      const sub1 = (p2Split[0] || '').trim();
      if (p2Split[1]) {
        const p3Split = p2Split[1].split(/3\.\s*AÇÕES[^:]*:/i);
        const sub2 = (p3Split[0] || '').trim();
        const sub3 = (p3Split[1] || '').trim();
        return { sub1, sub2, sub3 };
      }
    }
    return { sub1: text, sub2: '', sub3: '' };
  };

  const getSubAnswers = (qId: string): DescSubAnswers => {
    if (subAnswersMap[qId]) return subAnswersMap[qId];
    const existing = descAnswers[qId] || '';
    return parseSubSections(existing);
  };

  // Manipulador de digitação por subquestão com consolidação estruturada
  const handleTypeSubAnswer = (qId: string, field: DescSubField, value: string) => {
    if (hasEvaluated) return;
    const current = getSubAnswers(qId);
    const updated = { ...current, [field]: value };
    setSubAnswersMap(prev => ({ ...prev, [qId]: updated }));

    const consolidated = [
      `1. INSTRUMENTOS E ENSAIOS:`,
      updated.sub1.trim(),
      ``,
      `2. CRITÉRIOS NORMATIVOS:`,
      updated.sub2.trim(),
      ``,
      `3. AÇÕES CORRETIVAS E SEGURANÇA:`,
      updated.sub3.trim()
    ].join('\n').trim();

    setDescAnswers(prev => ({ ...prev, [qId]: consolidated }));
  };

  // Manipulador de seleção de alternativa em questão de múltipla escolha
  const handleSelectMCOption = (questionId: string, displayLetter: string) => {
    if (hasEvaluated) return;
    setMcAnswers(prev => ({ ...prev, [questionId]: displayLetter }));
  };

  // Manipulador de digitação na questão descritiva
  const handleTypeDescAnswer = (questionId: string, text: string) => {
    if (hasEvaluated) return;
    setDescAnswers(prev => ({ ...prev, [questionId]: text }));
  };

  // Submissão do exame para avaliação integrada
  const handleSubmitExam = async () => {
    if (isEvaluating || hasEvaluated) return;

    // Validações amigáveis
    const unAnsweredMC = currentExam.mcQuestions.filter(q => !mcAnswers[q.id]);
    if (unAnsweredMC.length > 0) {
      alert(`Por favor, responda a todas as questões de múltipla escolha antes de submeter (${unAnsweredMC.length} pendente(s)).`);
      return;
    }

    const unAnsweredDesc = currentExam.descQuestions.filter(q => !descAnswers[q.id] || descAnswers[q.id].trim().length < 10);
    if (unAnsweredDesc.length > 0) {
      if (!confirm('A questão de desenvolvimento técnico está em branco ou muito curta. Deseja submeter mesmo assim? (Respostas sem fundamentação receberão 0% na questão descritiva)')) {
        return;
      }
    }

    setIsEvaluating(true);

    try {
      // 1. Correção das questões de múltipla escolha
      let mcEarned = 0;
      currentExam.mcQuestions.forEach(q => {
        const chosenLetter = mcAnswers[q.id];
        const chosenOpt = q.options.find(o => o.displayLetter === chosenLetter);
        if (chosenOpt && chosenOpt.isCorrect) {
          mcEarned += q.points;
        }
      });

      // 2. Correção das questões descritivas via Eng. Sara IA
      const descEvaluations: Record<string, any> = {};
      let descEarned = 0;

      for (const dq of currentExam.descQuestions) {
        const answer = descAnswers[dq.id] || '';
        const evalResult = await evaluateDescriptiveAnswer(dq, answer);
        descEvaluations[dq.id] = evalResult;
        descEarned += evalResult.earnedPoints;
      }

      // 3. Média Ponderada e Veredicto
      const totalPossible = currentExam.mcTotalPoints + currentExam.descTotalPoints;
      const totalEarned = mcEarned + descEarned;
      const finalPercent = totalPossible > 0 ? Math.round((totalEarned / totalPossible) * 100) : 0;
      const isPassed = finalPercent >= 80;
      const status = isPassed ? 'ALCANCA' : 'NAO_ALCANCA';

      const evaluatedAttempt: AssessmentAttempt = {
        ...currentExam,
        mcAnswers,
        descAnswers,
        descEvaluations,
        mcEarnedPoints: mcEarned,
        descEarnedPoints: descEarned,
        finalScorePercent: finalPercent,
        status,
        isPassed
      };

      setCurrentExam(evaluatedAttempt);
      setHasEvaluated(true);

      // Notifica conclusão com XP (+100 se aprovado >=80%, +25 se esforço <80%)
      const awardedXp = isPassed ? 100 : 25;
      onCompleteSuccess(awardedXp);
    } catch (error) {
      console.error('Erro durante a correção do exame:', error);
      alert('Houve um erro ao processar a avaliação. Por favor, tente novamente.');
    } finally {
      setIsEvaluating(false);
    }
  };

  // Gerar Nova Reavaliação com Questões Inéditas para o mesmo EC
  const handleStartReassessment = () => {
    const nextAttemptNum = attemptNumber + 1;
    setAttemptNumber(nextAttemptNum);
    setMcAnswers({});
    setDescAnswers({});
    setHasEvaluated(false);
    setIsEvaluating(false);

    // Gera um novo exame com o pool de Reavaliação (Set 2 / Perguntas Inéditas)
    const newAttempt = generateAssessmentForLesson(lesson, nextAttemptNum, userName, userId);
    setCurrentExam(newAttempt);

    // Rola suavemente para o topo do exame
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Download do Relatório Oficial em PDF
  const handleDownloadPDF = () => {
    setIsDownloadingPdf(true);
    try {
      generateAssessmentPDF(currentExam);
    } catch (err) {
      console.error('Falha ao gerar PDF de avaliação:', err);
      alert('Não foi possível gerar o PDF. Verifique se o navegador permite downloads.');
    } finally {
      setTimeout(() => setIsDownloadingPdf(false), 800);
    }
  };

  // Preparar pergunta para a Sara IA
  const handleAskSaraAboutExam = () => {
    const summary = `Olá Eng. Sara! Estou no exame de ${currentExam.lessonCode} (${currentExam.lessonTitle}). Minha nota foi ${currentExam.finalScorePercent}% (${currentExam.status === 'ALCANCA' ? 'Alcança' : 'Não Alcança'}). Poderia me orientar sobre as questões e os conceitos da norma ${currentExam.norma}?`;
    onAskSara(summary);
  };

  return (
    <div
      className="space-y-6 animate-in fade-in duration-200"
      style={{
        fontSize: `${Math.max(12, Math.min(22, baseFontSize))}px`
      }}
    >
      {/* =================================================================== */}
      {/* CABEÇALHO DO EXAME DE COMPETÊNCIA                                  */}
      {/* =================================================================== */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#0F172A] border border-blue-900/50 shadow-lg space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-blue-500/20 text-[#3B82F6] border border-blue-500/30 text-xs font-black uppercase tracking-wider">
              {currentExam.lessonCode} • AVALIAÇÃO DE COMPETÊNCIA
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold border border-slate-700">
              {currentExam.norma}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-lg text-xs font-black border ${
              attemptNumber > 1
                ? 'bg-amber-500/20 text-[#F59E0B] border-amber-500/40'
                : 'bg-emerald-500/20 text-[#10B981] border-emerald-500/40'
            }`}>
              Tentativa #{attemptNumber} {attemptNumber > 1 ? '(Reavaliação Inédita)' : '(Inicial)'}
            </span>

            <div className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 text-xs font-mono">
              ID: {currentExam.authCode.split('-').slice(-1)[0]}
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-base sm:text-lg font-black text-white leading-snug">
            {currentExam.lessonTitle}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed">
            Exame prático de avaliação e diagnóstico de campo. A aprovação exige nota final <strong className="text-emerald-400 font-black">≥ 80% (Alcança - A)</strong>. Suas alternativas são embaralhadas dinamicamente a cada tentativa.
          </p>
        </div>

        {/* Barra de Progresso / Instruções Rápidas */}
        <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-300 border-t border-slate-800">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-blue-400" />
            <span>{currentExam.mcQuestions.length} Questões Objetivas ({currentExam.mcTotalPoints} pts)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>{currentExam.descQuestions.length} Questão de Desenvolvimento IA ({currentExam.descTotalPoints} pts)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Critério de Aprovação: 80%</span>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* SEÇÃO 1: QUESTÕES DE MÚLTIPLA ESCOLHA (COM GABARITO EMBARALHADO)   */}
      {/* =================================================================== */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-black text-white uppercase tracking-wider">
            <span className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-black shrink-0">1</span>
            <span>Múltipla Escolha: Cenários e Análise Prática</span>
          </div>
          <span className="text-xs font-semibold text-slate-400">
            {Object.keys(mcAnswers).length} de {currentExam.mcQuestions.length} respondidas
          </span>
        </div>

        {currentExam.mcQuestions.map((q, qIndex) => {
          const chosenLetter = mcAnswers[q.id];
          const chosenOpt = q.options.find(o => o.displayLetter === chosenLetter);
          const isCorrect = chosenOpt?.isCorrect === true;

          return (
            <div
              key={q.id}
              className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-sm"
            >
              {/* Cabeçalho da Questão */}
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 text-xs font-black uppercase">
                    Questão 1.{qIndex + 1} • {q.points} Pontos
                  </span>
                  {q.scenario && (
                    <p className="text-xs text-slate-400 italic pt-1">
                      Contexto: {q.scenario}
                    </p>
                  )}
                </div>

                {hasEvaluated && (
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-black flex items-center gap-1 shrink-0 ${
                    isCorrect
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}>
                    {isCorrect ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    <span>{isCorrect ? `+${q.points} pts` : '0 pts'}</span>
                  </span>
                )}
              </div>

              {/* Enunciado */}
              <p className="text-xs sm:text-sm font-black text-white leading-relaxed">
                {q.question}
              </p>

              {/* Lista de Alternativas (Embaralhadas dinamicamente: A, B, C, D) */}
              <div className="grid grid-cols-1 gap-2.5 pt-1">
                {q.options.map(option => {
                  const isSelected = chosenLetter === option.displayLetter;
                  let style = 'bg-[#111827] hover:bg-slate-800 text-slate-200 border-[#1E293B]';

                  if (hasEvaluated) {
                    if (option.isCorrect) {
                      style = 'bg-emerald-950/80 border-[#10B981] text-emerald-100 ring-2 ring-emerald-500/40';
                    } else if (isSelected && !option.isCorrect) {
                      style = 'bg-rose-950/80 border-rose-500 text-rose-100 ring-2 ring-rose-500/40';
                    } else {
                      style = 'bg-slate-950/50 border-slate-900 text-slate-500 opacity-50';
                    }
                  } else if (isSelected) {
                    style = 'bg-blue-950/80 border-[#3B82F6] text-blue-100 ring-2 ring-blue-500/40';
                  }

                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => handleSelectMCOption(q.id, option.displayLetter)}
                      disabled={hasEvaluated}
                      className={`w-full text-left p-3 rounded-xl border transition flex items-start gap-3 cursor-pointer text-xs sm:text-sm leading-relaxed ${style}`}
                    >
                      <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs shrink-0 mt-0.5 ${
                        hasEvaluated && option.isCorrect
                          ? 'bg-[#10B981] text-slate-950'
                          : hasEvaluated && isSelected && !option.isCorrect
                          ? 'bg-rose-500 text-white'
                          : isSelected
                          ? 'bg-[#3B82F6] text-white'
                          : 'bg-slate-800 text-slate-300'
                      }`}>
                        {option.displayLetter}
                      </span>

                      <div className="flex-1">
                        <span className="font-medium">{option.text}</span>
                        {hasEvaluated && (isSelected || option.isCorrect) && (
                          <p className={`mt-1.5 text-xs font-semibold leading-normal ${
                            option.isCorrect ? 'text-emerald-300' : 'text-rose-300'
                          }`}>
                            {option.feedback}
                          </p>
                        )}
                      </div>

                      {hasEvaluated && option.isCorrect && (
                        <CheckCircle2 className="w-5 h-5 text-[#10B981] shrink-0 mt-0.5" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explicação / Resolução da Questão pós-avaliação */}
              {hasEvaluated && (
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 space-y-1 animate-in fade-in">
                  <div className="flex items-center gap-1.5 font-bold text-blue-400">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Fundamentação Técnica ({q.norma})</span>
                  </div>
                  <p className="leading-relaxed">{q.explanation}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* =================================================================== */}
      {/* SEÇÃO 2: QUESTÃO DESCRITIVA / DESENVOLVIMENTO TÉCNICO (AVALIAÇÃO IA) */}
      {/* =================================================================== */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-black text-white uppercase tracking-wider">
            <span className="w-6 h-6 rounded-lg bg-purple-600 text-white flex items-center justify-center text-xs font-black shrink-0">2</span>
            <span>Questão de Desenvolvimento Técnico • Correção por IA</span>
          </div>
          <span className="text-xs font-semibold text-purple-400">
            Avaliadora: Eng. Sara IA
          </span>
        </div>

        {currentExam.descQuestions.map((dq, dIndex) => {
          const studentText = descAnswers[dq.id] || '';
          const evalResult = currentExam.descEvaluations[dq.id];
          const wordCount = studentText.trim().split(/\s+/).filter(Boolean).length;

          return (
            <div
              key={dq.id}
              className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-purple-900/40 space-y-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 text-xs font-black uppercase">
                    Caso Prático 2.{dIndex + 1} • {dq.points} Pontos
                  </span>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-200">
                    {dq.title || 'Diagnóstico de Procedimento Técnico'}
                  </h3>
                </div>

                {hasEvaluated && evalResult && (
                  <div className={`px-3 py-1 rounded-xl text-xs font-black flex items-center gap-1.5 shrink-0 ${
                    evalResult.scorePercent >= 80
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : evalResult.scorePercent >= 50
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                  }`}>
                    <span>{evalResult.scorePercent}%</span>
                    <span>({evalResult.earnedPoints}/{dq.points} pts)</span>
                  </div>
                )}
              </div>

              {/* Cenário Prático Contextualizado */}
              <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-900/30 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-purple-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Cenário Prático de Engenharia:</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {dq.contextScenario}
                </p>
              </div>

              {/* Enunciado do Desenvolvimento Geral */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-purple-400">
                  <BookOpen className="w-3.5 h-3.5 shrink-0" />
                  <span>DESAFIO DE ENGENHARIA DE CAMPO:</span>
                </div>
                <p className="text-xs sm:text-sm font-bold text-white leading-relaxed">
                  {dq.question}
                </p>
                <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-amber-300/90 pt-1">
                  <HelpCircle className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                  <span>Dica da Tutora Sara: Responda ordenadamente às 3 subquestões abaixo citando instrumentos, grandezas e ações segundo a norma {dq.norma}.</span>
                </div>
              </div>

              {/* ======================================================= */}
              {/* REESTRUTURAÇÃO EM 3 SUBQUESTÕES INDEPENDENTES (40 PTS)  */}
              {/* ======================================================= */}
              {(() => {
                const subAns = getSubAnswers(dq.id);
                const currentTab = activeSubTab[dq.id] || 'sub1';

                const subQuestionsMeta: Array<{
                  id: DescSubField;
                  title: string;
                  points: number;
                  icon: any;
                  subtitle: string;
                  guide: string;
                  placeholder: string;
                  value: string;
                }> = [
                  {
                    id: 'sub1',
                    title: '1. Instrumentos e Ensaios',
                    points: 15,
                    icon: Wrench,
                    subtitle: 'Equipamentos calibrados e testes com circuito desenergizado',
                    guide: 'Quais instrumentos de ensaio (ex: Megômetro 500Vcc, Multímetro True-RMS, Torquímetro, etc.) você utilizará e que testes executará?',
                    placeholder: 'Ex: Com o circuito desenergizado, utilizarei o Megômetro a 500Vcc para medir a resistência de isolamento entre condutores ativos e terra, e multímetro True-RMS para verificação de continuidade ôhmica...',
                    value: subAns.sub1
                  },
                  {
                    id: 'sub2',
                    title: '2. Critérios Normativos',
                    points: 15,
                    icon: Shield,
                    subtitle: 'Limites matemáticos, grandezas e tolerâncias regulamentares',
                    guide: `Quais limites mínimos de isolamento, queda de tensão e tolerâncias da norma ${dq.norma} determinarão a conformidade técnica?`,
                    placeholder: 'Ex: Conforme a norma aplicável, a resistência de isolamento mínima deve ser ≥ 1,0 MΩ. A queda de tensão máxima tolerada é de 3% para iluminação e 5% para força...',
                    value: subAns.sub2
                  },
                  {
                    id: 'sub3',
                    title: '3. Ações Corretivas',
                    points: 10,
                    icon: ShieldCheck,
                    subtitle: '5 Regras de Ouro (LOTO), EPIs e torque controlado',
                    guide: 'Quais medidas de segurança (LOTO, bloqueio mecânico, teste de ausência de tensão) e ações de correção de aperto serão adotadas?',
                    placeholder: 'Ex: Aplicação das 5 Regras de Ouro: seccionamento visível, bloqueio mecânico LOTO com cadeado e etiqueta, constatação de ausência de tensão com detector bipolar, luvas isolantes 1000V e aperto com torquímetro calibrado para evitar sobreaquecimento...',
                    value: subAns.sub3
                  }
                ];

                return (
                  <div className="space-y-3 pt-1">
                    {/* Barra de Seleção de Subquestões & Alternância de Visualização */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {subQuestionsMeta.map(sq => {
                          const isFilled = sq.value.trim().length >= 15;
                          const isActive = currentTab === sq.id;
                          const IconComp = sq.icon;

                          return (
                            <button
                              key={sq.id}
                              type="button"
                              onClick={() => setActiveSubTab(prev => ({ ...prev, [dq.id]: sq.id }))}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 border ${
                                isActive
                                  ? 'bg-purple-600 text-white border-purple-500 shadow-sm'
                                  : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                              }`}
                            >
                              <IconComp className="w-3.5 h-3.5 shrink-0" />
                              <span>{sq.title}</span>
                              <span className="px-1 py-0.2 rounded bg-black/40 text-[10px] text-purple-200">
                                {sq.points} pts
                              </span>
                              {isFilled && (
                                <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Alternador de Modo: Abas vs Lista Completa */}
                      <button
                        type="button"
                        onClick={() => setSubViewMode(m => (m === 'tabs' ? 'stacked' : 'tabs'))}
                        className="self-end sm:self-auto px-2.5 py-1 rounded-md text-[11px] font-semibold text-slate-400 bg-slate-950 border border-slate-800 hover:text-white transition flex items-center gap-1.5"
                      >
                        {subViewMode === 'tabs' ? (
                          <>
                            <LayoutList className="w-3 h-3" />
                            <span>Ver 3 Subquestões Juntas</span>
                          </>
                        ) : (
                          <>
                            <Columns className="w-3 h-3" />
                            <span>Modo Abas Individuais</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* MODO 1: ABAS INDIVIDUAIS (FOCADO & RESPONSIVO) */}
                    {subViewMode === 'tabs' && (
                      <div className="space-y-3">
                        {subQuestionsMeta
                          .filter(sq => sq.id === currentTab)
                          .map(sq => {
                            const subWords = sq.value.trim() ? sq.value.trim().split(/\s+/).length : 0;
                            return (
                              <div
                                key={sq.id}
                                className="p-4 rounded-xl bg-slate-950/70 border border-purple-900/30 space-y-3"
                              >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-800/80 pb-2">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-xs font-black">
                                        Subquestão {sq.title.split('.')[0]} • {sq.points} Pontos
                                      </span>
                                      <span className="text-xs font-bold text-white">
                                        {sq.title.split('. ')[1]}
                                      </span>
                                    </div>
                                    <p className="text-[11px] text-slate-400 mt-1">{sq.subtitle}</p>
                                  </div>
                                  <span className="text-[11px] text-slate-500">
                                    Palavras: <strong className="text-purple-300">{subWords}</strong> (min. 10)
                                  </span>
                                </div>

                                <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed">
                                  {sq.guide}
                                </p>

                                <textarea
                                  value={sq.value}
                                  onChange={e => handleTypeSubAnswer(dq.id, sq.id, e.target.value)}
                                  disabled={hasEvaluated}
                                  rows={4}
                                  placeholder={sq.placeholder}
                                  className="w-full p-3.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 text-xs sm:text-sm leading-relaxed resize-y transition"
                                />

                                {/* Navegação Rápida entre Subquestões */}
                                <div className="flex items-center justify-between pt-1">
                                  <button
                                    type="button"
                                    disabled={sq.id === 'sub1'}
                                    onClick={() => {
                                      const prevId = sq.id === 'sub3' ? 'sub2' : 'sub1';
                                      setActiveSubTab(prev => ({ ...prev, [dq.id]: prevId }));
                                    }}
                                    className="px-3 py-1 rounded text-xs text-slate-400 bg-slate-900 border border-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:text-white"
                                  >
                                    ← Subquestão Anterior
                                  </button>

                                  <button
                                    type="button"
                                    disabled={sq.id === 'sub3'}
                                    onClick={() => {
                                      const nextId = sq.id === 'sub1' ? 'sub2' : 'sub3';
                                      setActiveSubTab(prev => ({ ...prev, [dq.id]: nextId }));
                                    }}
                                    className="px-3 py-1 rounded text-xs font-bold text-purple-300 bg-purple-950/60 border border-purple-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-purple-900/60"
                                  >
                                    Próxima Subquestão →
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    )}

                    {/* MODO 2: TODAS AS 3 SUBQUESTÕES JUNTAS (SETORIZADO E LIMPO) */}
                    {subViewMode === 'stacked' && (
                      <div className="space-y-4">
                        {subQuestionsMeta.map(sq => {
                          const subWords = sq.value.trim() ? sq.value.trim().split(/\s+/).length : 0;
                          return (
                            <div
                              key={sq.id}
                              className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2.5"
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                <div className="flex items-center gap-2">
                                  <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-xs font-black">
                                    {sq.title}
                                  </span>
                                  <span className="text-xs font-bold text-slate-300">
                                    ({sq.points} pts)
                                  </span>
                                </div>
                                <span className="text-[11px] text-slate-500">
                                  Palavras: <strong className="text-purple-300">{subWords}</strong>
                                </span>
                              </div>

                              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                                {sq.guide}
                              </p>

                              <textarea
                                value={sq.value}
                                onChange={e => handleTypeSubAnswer(dq.id, sq.id, e.target.value)}
                                disabled={hasEvaluated}
                                rows={3}
                                placeholder={sq.placeholder}
                                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 text-xs sm:text-sm leading-relaxed resize-y transition"
                              />
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Resumo Consolidado e Contador Global de Palavras */}
                    <div className="flex items-center justify-between text-[11px] text-slate-500 px-1 pt-1">
                      <span>Total de palavras no desenvolvimento: <strong className="text-slate-300">{wordCount}</strong></span>
                      <span>Total ponderado: <strong>40 Pontos</strong> (Soma: 15 + 15 + 10)</span>
                    </div>
                  </div>
                );
              })()}

              {/* Feedback e Parecer Semântico da Eng. Sara IA (Após Avaliação) */}
              {hasEvaluated && evalResult && (
                <div className="p-4 rounded-xl bg-slate-950 border border-purple-800/40 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs font-black text-purple-400">
                      <Sparkles className="w-4 h-4" />
                      <span>PARECER DE ENGENHARIA DA SARA IA:</span>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                      evalResult.scorePercent >= 80
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : evalResult.scorePercent >= 50
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-rose-950 text-rose-300 border border-rose-800'
                    }`}>
                      {evalResult.verdict === 'ALCANÇA' ? 'Competência Alcançada' : evalResult.verdict === 'PARCIALMENTE_ALCANÇA' ? 'Parcialmente Correto' : 'Não Alcança'}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                    {evalResult.technicalFeedback}
                  </p>

                  {/* Chips de Termos Identificados vs Faltantes */}
                  <div className="space-y-1.5 pt-1">
                    {evalResult.matchedKeywords.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[11px] font-bold text-emerald-400">Termos Corretos:</span>
                        {evalResult.matchedKeywords.map((kw, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-medium"
                          >
                            ✓ {kw}
                          </span>
                        ))}
                      </div>
                    )}

                    {evalResult.missingPoints.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[11px] font-bold text-amber-400">Omissões a Praticar:</span>
                        {evalResult.missingPoints.map((kw, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-medium"
                          >
                            ⚠ {kw}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Resposta Guia Exemplar da Sara IA */}
                  <div className="p-3 rounded-lg bg-blue-950/30 border border-blue-900/40 text-xs text-blue-200 space-y-1">
                    <span className="font-bold text-blue-400">📖 Procedimento Modelo da Tutora:</span>
                    <p className="text-slate-300 leading-relaxed">{dq.guidelineAnswer}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* =================================================================== */}
      {/* PAINEL DE RESULTADO FINAL & SELO ACADÊMICO EM DESTAQUE             */}
      {/* =================================================================== */}
      {hasEvaluated && (
        <div className={`p-5 sm:p-6 rounded-2xl border shadow-xl space-y-4 animate-in fade-in duration-300 ${
          currentExam.isPassed
            ? 'bg-emerald-950/40 border-emerald-500/50 shadow-emerald-900/20'
            : 'bg-rose-950/40 border-rose-500/50 shadow-rose-900/20'
        }`}>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-xs font-black text-slate-400 uppercase tracking-wider">
                Média Final Ponderada (Objetivas + IA)
              </span>
              <div className="flex items-baseline justify-center sm:justify-start gap-3">
                <span className={`text-3xl sm:text-4xl font-black ${
                  currentExam.isPassed ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {currentExam.finalScorePercent}%
                </span>
                <span className="text-xs sm:text-sm font-bold text-slate-300">
                  ({currentExam.mcEarnedPoints + currentExam.descEarnedPoints} de {currentExam.mcTotalPoints + currentExam.descTotalPoints} pts)
                </span>
              </div>
            </div>

            {/* SELO VISUAL EM DESTAQUE */}
            <div className={`px-5 py-3 rounded-2xl border flex flex-col items-center justify-center text-center shadow-md ${
              currentExam.isPassed
                ? 'bg-emerald-600 text-white border-emerald-400 ring-4 ring-emerald-500/30'
                : 'bg-rose-600 text-white border-rose-400 ring-4 ring-rose-500/30'
            }`}>
              <div className="flex items-center gap-1.5 text-base sm:text-lg font-black tracking-wide">
                {currentExam.isPassed ? <Award className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                <span>{currentExam.isPassed ? 'ALCANÇA (A)' : 'NÃO ALCANÇA (NA)'}</span>
              </div>
              <span className="text-[11px] font-semibold opacity-90">
                {currentExam.isPassed ? 'Aprovado na Competência (≥ 80%)' : 'Exige Reavaliação (< 80%)'}
              </span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed text-center sm:text-left">
            {currentExam.isPassed
              ? `Parabéns, ${userName}! Você atingiu a proficiência mandatória na competência ${currentExam.lessonCode} segundo a norma ${currentExam.norma}. Sua folha oficial de avaliação foi autenticada com sucesso.`
              : `Atenção, ${userName}. Para garantir a segurança e a conformidade nas instalações técnicas normatizadas, a aprovação exige nota mínima de 80%. Não desanime! Uma nova reavaliação com perguntas totalmente inéditas está pronta para você.`}
          </p>

          {/* BOTÕES DE AÇÃO: BAIXAR PDF, REAVALIAÇÃO OU CONCLUIR */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            {/* Botão Baixar Folha de Avaliação em PDF */}
            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={isDownloadingPdf}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition flex items-center justify-center gap-2 border border-slate-700 cursor-pointer shadow-sm"
              title="Gera e baixa a folha acadêmica oficial em formato PDF com cabeçalho e selo de competência"
            >
              {isDownloadingPdf ? (
                <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
              ) : (
                <FileText className="w-4 h-4 text-blue-400" />
              )}
              <span>{isDownloadingPdf ? 'Gerando PDF...' : 'Baixar Folha de Avaliação em PDF'}</span>
            </button>

            {/* Se Não Alcançou (<80%): Botão Gerar Nova Reavaliação */}
            {!currentExam.isPassed && (
              <button
                type="button"
                onClick={handleStartReassessment}
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Iniciar Nova Reavaliação (Questões Inéditas)</span>
              </button>
            )}

            {/* Se Alcançou (>=80%): Botão Concluir e Próxima Aula */}
            {currentExam.isPassed && (
              <button
                type="button"
                onClick={onGoToLesson}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <span>Concluir & Avançar (+100 XP)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {/* Tirar Dúvida com Sara IA */}
            <button
              type="button"
              onClick={handleAskSaraAboutExam}
              className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-bold transition flex items-center justify-center gap-2 border border-slate-700 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-purple-400" />
              <span>Tirar Dúvida com a Eng. Sara</span>
            </button>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* BOTÃO DE SUBMISSÃO INICIAL (QUANDO AINDA NÃO SUBMETEU)               */}
      {/* =================================================================== */}
      {!hasEvaluated && (
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onGoToLesson}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer border border-slate-700"
          >
            Revisar Teoria da Aula
          </button>

          <button
            type="button"
            onClick={handleSubmitExam}
            disabled={isEvaluating}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs sm:text-sm font-black transition flex items-center justify-center gap-2 shadow-lg cursor-pointer"
          >
            {isEvaluating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Eng. Sara IA está avaliando seu exame...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Submeter Avaliação para a Eng. Sara IA</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
