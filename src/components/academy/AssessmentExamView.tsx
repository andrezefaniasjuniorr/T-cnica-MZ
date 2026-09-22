import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertCircle,
  BookOpen,
  RotateCcw,
  Download,
  MessageSquare,
  Award,
  Send,
  Loader2,
  Check,
  ChevronRight,
  ChevronLeft,
  FileCheck2,
  HelpCircle
} from 'lucide-react';
import { AcademyLesson } from '../../types/academy';
import {
  AssessmentAttempt,
  AssessmentMCQuestion,
  ShuffledAssessmentOption
} from '../../types/assessment';
import {
  generateAssessmentForLesson
} from '../../data/assessmentBank';
import {
  generateAssessmentPDF
} from '../../utils/pdfAssessmentGenerator';
import { soundFX } from '../../utils/audio';

export interface AssessmentExamViewProps {
  lesson: AcademyLesson;
  baseFontSize: number;
  userName?: string;
  userId?: string;
  onCompleteSuccess: (earnedXp: number) => void;
  onAskSara: (contextQuestion: string) => void;
  onGoToLesson: () => void;
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
  // Carrega tentativas anteriores do localStorage para gerenciar reavaliações
  const getStoredAttemptCount = (): number => {
    if (typeof window === 'undefined') return 1;
    try {
      const historyKey = `tmz_assessment_history_${lesson.id}`;
      const raw = localStorage.getItem(historyKey);
      if (raw) {
        const list = JSON.parse(raw);
        if (Array.isArray(list) && list.length > 0) {
          return Math.min(3, list.length + 1);
        }
      }
    } catch (e: any) {
      console.warn('Erro ao ler histórico de tentativas:', e);
    }
    return 1;
  };

  // Estado da tentativa de avaliação (1 = Inicial, 2 = 1ª Reavaliação, 3 = 2ª Reavaliação Final)
  const [attemptNumber, setAttemptNumber] = useState<number>(() => getStoredAttemptCount());
  const [currentExam, setCurrentExam] = useState<AssessmentAttempt>(() =>
    generateAssessmentForLesson(lesson, attemptNumber, userName, userId)
  );

  // Navegação entre questões durante o preenchimento
  const [activeQuestionIdx, setActiveQuestionIdx] = useState<number>(0);

  // Respostas do aluno: questionId -> displayLetter ('A' | 'B' | 'C' | 'D')
  const [mcAnswers, setMcAnswers] = useState<Record<string, string>>({});

  // Estados de submissão e avaliação
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [hasEvaluated, setHasEvaluated] = useState<boolean>(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState<boolean>(false);

  // Recarrega o exame caso a lição mude
  useEffect(() => {
    const nextAtt = getStoredAttemptCount();
    setAttemptNumber(nextAtt);
    setActiveQuestionIdx(0);
    setMcAnswers({});
    setHasEvaluated(false);
    setIsEvaluating(false);
    setCurrentExam(generateAssessmentForLesson(lesson, nextAtt, userName, userId));
  }, [lesson.id, userName, userId]);

  const questions: AssessmentMCQuestion[] = currentExam.mcQuestions || [];
  const activeQuestion: AssessmentMCQuestion = questions[activeQuestionIdx] || questions[0];
  const totalQuestions = questions.length;

  const answeredCount = Object.keys(mcAnswers).length;
  const isAllAnswered = answeredCount >= totalQuestions;

  // Manipulador de escolha de alternativa
  const handleSelectOption = (questionId: string, displayLetter: string) => {
    if (hasEvaluated) return;

    soundFX.playClick();
    setMcAnswers((prev: Record<string, string>) => ({
      ...prev,
      [questionId]: displayLetter
    }));
  };

  // Submeter Avaliação e Calcular Desempenho
  const handleSubmitExam = () => {
    if (!isAllAnswered) {
      alert(`Por favor, responda a todas as ${totalQuestions} questões antes de submeter a avaliação.`);
      return;
    }

    setIsEvaluating(true);
    soundFX.playClick();

    setTimeout(() => {
      let earnedPoints = 0;
      let correctCount = 0;

      questions.forEach((q: AssessmentMCQuestion) => {
        const studentChoice = mcAnswers[q.id];
        const correctOpt = q.options.find((o: ShuffledAssessmentOption) => o.isCorrect);
        if (studentChoice && correctOpt && studentChoice === correctOpt.displayLetter) {
          earnedPoints += q.points;
          correctCount++;
        }
      });

      const totalPoints = questions.reduce((sum: number, q: AssessmentMCQuestion) => sum + q.points, 0);
      const finalPercent = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
      const isPassed = finalPercent >= 80;
      const status = isPassed ? 'ALCANCA' : 'NAO_ALCANCA';

      const evaluatedAttempt: AssessmentAttempt = {
        ...currentExam,
        mcAnswers,
        mcEarnedPoints: earnedPoints,
        mcTotalPoints: totalPoints,
        correctAnswersCount: correctCount,
        totalQuestionsCount: totalQuestions,
        finalScorePercent: finalPercent,
        status,
        isPassed
      };

      setCurrentExam(evaluatedAttempt);
      setHasEvaluated(true);
      setIsEvaluating(false);

      // Salva no localStorage histórico completo com respostas
      try {
        const historyKey = `tmz_assessment_history_${lesson.id}`;
        const rawHistory = localStorage.getItem(historyKey);
        const historyList = rawHistory ? JSON.parse(rawHistory) : [];
        historyList.push({
          attemptNumber,
          date: evaluatedAttempt.date,
          scorePercent: finalPercent,
          correctAnswersCount: correctCount,
          totalQuestionsCount: totalQuestions,
          isPassed,
          mcAnswers,
          authCode: evaluatedAttempt.authCode
        });
        localStorage.setItem(historyKey, JSON.stringify(historyList));
      } catch (err: any) {
        console.warn('Erro ao salvar histórico de avaliação no localStorage:', err);
      }

      if (isPassed) {
        soundFX.playCorrect();
        onCompleteSuccess(100); // 100 XP por aprovação
      } else {
        soundFX.playIncorrect();
        onCompleteSuccess(25); // 25 XP pelo esforço
      }

      // Rola para o topo do resultado
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 400);
  };

  // Iniciar Reavaliação (até 2 reavaliações, total de 3 tentativas)
  const handleStartReassessment = () => {
    if (attemptNumber >= 3) {
      alert('Você atingiu o limite de 3 tentativas para esta avaliação. Recomendamos revisar a teoria e os esquemas práticos antes de tentar novamente.');
      return;
    }

    const nextAttemptNum = attemptNumber + 1;
    setAttemptNumber(nextAttemptNum);
    setActiveQuestionIdx(0);
    setMcAnswers({});
    setHasEvaluated(false);
    setIsEvaluating(false);

    // O gerador com anti-repetição seleciona automaticamente 5 novas questões 100% inéditas
    const newAttempt = generateAssessmentForLesson(lesson, nextAttemptNum, userName, userId);
    setCurrentExam(newAttempt);

    soundFX.playClick();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Download da Folha Única A4 em PDF
  const handleDownloadPDF = () => {
    setIsDownloadingPdf(true);
    try {
      soundFX.playClick();
      generateAssessmentPDF(currentExam);
    } catch (err: any) {
      console.error('Falha ao gerar PDF de avaliação:', err);
      alert('Não foi possível gerar o PDF. Verifique se o navegador permite downloads.');
    } finally {
      setTimeout(() => setIsDownloadingPdf(false), 600);
    }
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
            <span className="px-2.5 py-1 rounded-lg bg-blue-500/20 text-[#38bdf8] border border-blue-500/30 text-xs font-black uppercase tracking-wider">
              {currentExam.lessonCode} • AVALIAÇÃO OFICIAL
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold border border-slate-700">
              {currentExam.norma}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-1 rounded-lg text-xs font-black border ${
                attemptNumber > 1
                  ? 'bg-amber-500/20 text-[#F59E0B] border-amber-500/40'
                  : 'bg-emerald-500/20 text-[#10B981] border-emerald-500/40'
              }`}
            >
              Tentativa {attemptNumber} de 3 {attemptNumber === 1 ? '(Inicial)' : attemptNumber === 2 ? '(1ª Reavaliação)' : '(2ª Reavaliação Final)'}
            </span>

            <div className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 text-xs font-mono">
              ID: {currentExam.authCode.split('-').slice(-1)[0]}
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-lg sm:text-xl font-black text-white">
            {currentExam.lessonTitle}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Avaliação individual de 5 questões estratégicas. Critério de Aprovação: <strong className="text-emerald-400">≥ 80% (Alcançado)</strong>. Banco anti-repetição por dispositivo.
          </p>
        </div>

        {/* PROGRESSO DAS QUESTÕES RESPONDIDAS */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-800 text-xs text-slate-400">
          <span>Respondidas: <strong className="text-white">{answeredCount}</strong> de {totalQuestions}</span>
          <span>Critério: <strong className="text-emerald-400">≥ 4 de 5 corretas (80%)</strong></span>
        </div>
      </div>

      {/* =================================================================== */}
      {/* RESULTADO DA AVALIAÇÃO (BANNER DE STATUS APÓS SUBMISSÃO)          */}
      {/* =================================================================== */}
      {hasEvaluated && (
        <div
          className={`p-5 rounded-2xl border shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-200 ${
            currentExam.isPassed
              ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
              : 'bg-rose-950/40 border-rose-500/50 text-rose-200'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div
                className={`p-3 rounded-2xl ${
                  currentExam.isPassed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                }`}
              >
                {currentExam.isPassed ? <Award className="w-8 h-8" /> : <AlertCircle className="w-8 h-8" />}
              </div>
              <div>
                <span className="text-xs font-black uppercase tracking-wider opacity-80">
                  Parecer Técnico Normativo
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  {currentExam.isPassed ? 'COMPETÊNCIA ALCANÇADA' : 'NÃO ALCANÇADO'}
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  {currentExam.isPassed
                    ? `Parabéns! Você obteve ${currentExam.finalScorePercent}% de aproveitamento (${currentExam.correctAnswersCount} de ${totalQuestions} questões corretas).`
                    : `Você obteve ${currentExam.finalScorePercent}% (${currentExam.correctAnswersCount} de ${totalQuestions} corretas). O critério mínimo para aprovação é 80%.`}
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="text-3xl sm:text-4xl font-black text-white font-mono">
                {currentExam.finalScorePercent}%
              </div>
              <span className="text-xs text-slate-400">
                {currentExam.mcEarnedPoints} / {currentExam.mcTotalPoints} pts
              </span>
            </div>
          </div>

          {/* BOTÕES DE AÇÃO NO RESULTADO */}
          <div className="flex flex-wrap items-center justify-end gap-2.5 pt-3 border-t border-slate-800/80">
            {/* Botão Baixar PDF Folha Única */}
            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={isDownloadingPdf}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-900/40 transition cursor-pointer"
            >
              {isDownloadingPdf ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>Baixar Folha Oficial (PDF A4 Único)</span>
            </button>

            {/* Reavaliação se não atingiu 80% e ainda tem tentativas */}
            {!currentExam.isPassed && attemptNumber < 3 && (
              <button
                type="button"
                onClick={handleStartReassessment}
                className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-900/40 transition cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Fazer Reavaliação ({attemptNumber === 1 ? '1ª Reavaliação' : '2ª Reavaliação Final'})</span>
              </button>
            )}

            {/* Revisar Conteúdo da Aula */}
            <button
              type="button"
              onClick={onGoToLesson}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-2 border border-slate-700 transition cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>Revisar Teoria & Esquemas</span>
            </button>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* SEÇÃO 2: FEEDBACK TÉCNICO E GABARITO COMENTADO (APÓS AVALIAÇÃO)    */}
      {/* Exibe todas as 5 questões verticalmente com justificativas claras   */}
      {/* =================================================================== */}
      {hasEvaluated ? (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#0b1322] border border-blue-900/40">
            <div className="flex items-center gap-2.5">
              <FileCheck2 className="w-5 h-5 text-sky-400" />
              <h3 className="text-base sm:text-lg font-black text-white">
                Feedback Técnico e Gabarito Comentado
              </h3>
            </div>
            <span className="text-xs text-slate-400">
              {currentExam.correctAnswersCount} corretas de {totalQuestions}
            </span>
          </div>

          <div className="space-y-5">
            {questions.map((q: AssessmentMCQuestion, qIdx: number) => {
              const studentChoice = mcAnswers[q.id];
              const correctOpt = q.options.find((o: ShuffledAssessmentOption) => o.isCorrect);
              const isCorrect = studentChoice === correctOpt?.displayLetter;
              const studentOpt = q.options.find((o: ShuffledAssessmentOption) => o.displayLetter === studentChoice);

              return (
                <div
                  key={q.id}
                  className={`p-5 rounded-2xl border transition space-y-4 ${
                    isCorrect
                      ? 'bg-slate-900/90 border-emerald-500/40'
                      : 'bg-slate-900/90 border-rose-500/40'
                  }`}
                >
                  {/* Cabeçalho da Questão Comentada */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`w-7 h-7 rounded-lg font-black text-xs flex items-center justify-center ${
                          isCorrect ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        }`}
                      >
                        #{qIdx + 1}
                      </span>
                      <span className="text-xs font-bold text-slate-300">
                        Questão {qIdx + 1} de {totalQuestions}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-cyan-300 px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                        {q.points} pts
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase flex items-center gap-1 ${
                          isCorrect
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                        }`}
                      >
                        {isCorrect ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" /> Correto
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5" /> Incorreto
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Enunciado */}
                  <div className="space-y-1">
                    <h4 className="text-sm sm:text-base font-bold text-white leading-relaxed">
                      {q.question}
                    </h4>
                    {q.scenario && (
                      <p className="text-xs text-slate-400 italic bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                        📌 Cenário: {q.scenario}
                      </p>
                    )}
                  </div>

                  {/* Comparativo de Respostas */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
                    <div>
                      <span className="text-slate-400 block mb-1">Sua Escolha:</span>
                      {studentChoice ? (
                        <div
                          className={`font-bold flex items-start gap-1.5 ${
                            isCorrect ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono">
                            [{studentChoice}]
                          </span>
                          <span className="flex-1">{studentOpt?.text}</span>
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">(Não respondida)</span>
                      )}
                    </div>

                    <div>
                      <span className="text-emerald-400 block mb-1">Gabarito Oficial:</span>
                      <div className="font-bold text-emerald-300 flex items-start gap-1.5">
                        <span className="px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-700 font-mono text-emerald-300">
                          [{correctOpt?.displayLetter}]
                        </span>
                        <span className="flex-1">{correctOpt?.text}</span>
                      </div>
                    </div>
                  </div>

                  {/* Explicação Didática Geral */}
                  <div className="p-3.5 rounded-xl bg-blue-950/30 border border-blue-900/40 text-xs space-y-2">
                    <div className="flex items-center gap-2 font-bold text-sky-300">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>Explicação Básica e Didática:</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">
                      {q.explanation}
                    </p>
                    {q.keyTakeaway && (
                      <p className="text-amber-300/90 font-medium pt-1.5 border-t border-blue-900/40">
                        💡 Regra de Ouro ({q.norma}): {q.keyTakeaway}
                      </p>
                    )}
                  </div>

                  {/* Justificativa Detalhada de Cada Alínea / Alternativa */}
                  <div className="space-y-2 pt-1">
                    <span className="text-xs font-bold text-slate-400 block">
                      Detalhamento das Alíneas (Por que está certa ou errada):
                    </span>
                    <div className="space-y-1.5">
                      {q.options.map((opt: ShuffledAssessmentOption) => {
                        const isThisCorrect = opt.isCorrect;
                        const isStudentChoiceThis = studentChoice === opt.displayLetter;

                        return (
                          <div
                            key={opt.id}
                            className={`p-2.5 rounded-xl text-xs border transition ${
                              isThisCorrect
                                ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                                : isStudentChoiceThis
                                ? 'bg-rose-950/30 border-rose-500/40 text-rose-200'
                                : 'bg-slate-950/40 border-slate-800 text-slate-400'
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              <span
                                className={`px-1.5 py-0.5 rounded font-mono font-bold text-xs shrink-0 ${
                                  isThisCorrect
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                    : 'bg-slate-800 text-slate-300 border border-slate-700'
                                }`}
                              >
                                {opt.displayLetter}
                              </span>
                              <div className="flex-1 space-y-1">
                                <p className="font-medium text-slate-200">{opt.text}</p>
                                <p
                                  className={`text-xs ${
                                    isThisCorrect
                                      ? 'text-emerald-400 font-semibold'
                                      : 'text-slate-400 italic'
                                  }`}
                                >
                                  {isThisCorrect ? '✅ Por que está correta: ' : '❌ Por que é incorreta: '}
                                  {opt.feedback}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* =================================================================== */
        /* SEÇÃO DE PREENCHIMENTO DO EXAME (QUESTÃO ATIVA COM STEPPER)        */
        /* =================================================================== */
        <>
          {/* STEPPER DE NAVEGAÇÃO */}
          <div className="flex items-center justify-between gap-2 p-2.5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {questions.map((q: AssessmentMCQuestion, idx: number) => {
                const isAnswered = !!mcAnswers[q.id];
                const isCurrent = idx === activeQuestionIdx;

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => {
                      soundFX.playClick();
                      setActiveQuestionIdx(idx);
                    }}
                    className={`w-9 h-9 rounded-xl font-bold text-xs flex items-center justify-center transition cursor-pointer border ${
                      isCurrent
                        ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-900/40 scale-105'
                        : isAnswered
                        ? 'bg-blue-950/80 text-blue-300 border-blue-700'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Setas Anterior / Próxima */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={activeQuestionIdx === 0}
                onClick={() => {
                  soundFX.playClick();
                  setActiveQuestionIdx((prev: number) => Math.max(0, prev - 1));
                }}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 transition cursor-pointer disabled:cursor-not-allowed"
                title="Questão Anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                disabled={activeQuestionIdx === totalQuestions - 1}
                onClick={() => {
                  soundFX.playClick();
                  setActiveQuestionIdx((prev: number) => Math.min(totalQuestions - 1, prev + 1));
                }}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 transition cursor-pointer disabled:cursor-not-allowed"
                title="Próxima Questão"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* CARTÃO DA QUESTÃO ATIVA */}
          {activeQuestion && (
            <div className="p-5 sm:p-6 rounded-2xl bg-[#0b1322] border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-blue-600/30 text-blue-300 border border-blue-500/40 font-black text-xs flex items-center justify-center">
                    #{activeQuestionIdx + 1}
                  </span>
                  <span className="text-xs font-bold text-slate-400">
                    Questão {activeQuestionIdx + 1} de {totalQuestions}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-cyan-300 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                    {activeQuestion.points} pts
                  </span>
                  <span className="text-xs font-bold text-slate-400">
                    {activeQuestion.norma || currentExam.norma}
                  </span>
                </div>
              </div>

              {/* Enunciado da Questão */}
              <div className="space-y-2">
                <h3 className="text-base sm:text-lg font-bold text-white leading-relaxed">
                  {activeQuestion.question}
                </h3>
                {activeQuestion.scenario && (
                  <p className="text-xs text-slate-400 italic bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                    📌 Cenário Prático: {activeQuestion.scenario}
                  </p>
                )}
              </div>

              {/* ALTERNATIVAS A, B, C, D */}
              <div className="space-y-2.5 pt-2">
                {activeQuestion.options.map((opt: ShuffledAssessmentOption) => {
                  const isSelected = mcAnswers[activeQuestion.id] === opt.displayLetter;

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleSelectOption(activeQuestion.id, opt.displayLetter)}
                      className={`w-full text-left p-3.5 sm:p-4 rounded-xl border transition flex items-start gap-3.5 cursor-pointer ${
                        isSelected
                          ? 'bg-blue-950/60 border-blue-500 text-blue-100 shadow-md shadow-blue-950/50'
                          : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <span
                        className={`w-7 h-7 shrink-0 rounded-lg font-black text-xs flex items-center justify-center border transition ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-400'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        {opt.displayLetter}
                      </span>
                      <div className="flex-1 text-xs sm:text-sm pt-0.5 leading-relaxed">
                        {opt.text}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* =================================================================== */}
      {/* BARRA DE BOTÕES DE FINALIZAÇÃO E ENVIO                             */}
      {/* =================================================================== */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onAskSara(`Gostaria de ajuda sobre a lição ${lesson.title} (${lesson.norma}) e suas regras normativas.`)}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs flex items-center gap-2 border border-slate-700 transition cursor-pointer"
          >
            <MessageSquare className="w-4 h-4 text-blue-400" />
            <span>Tirar Dúvida com Eng. Sara</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {!hasEvaluated ? (
            <button
              type="button"
              onClick={handleSubmitExam}
              disabled={!isAllAnswered || isEvaluating}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-950 transition cursor-pointer disabled:cursor-not-allowed"
            >
              {isEvaluating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span>
                {isAllAnswered
                  ? 'Submeter Avaliação Oficial (Finalizar)'
                  : `Responda todas (${answeredCount}/${totalQuestions})`}
              </span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadPDF}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 transition cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Baixar PDF (1 Página A4)</span>
              </button>
              {currentExam.isPassed && (
                <button
                  type="button"
                  onClick={onGoToLesson}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 transition cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Avançar para Próxima Aula</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
