import jsPDF from 'jspdf';
import { AssessmentAttempt } from '../types/assessment';

/**
 * Gerador de Folha Oficial de Avaliação em PDF (Layout Acadêmico Minimalista - A4).
 * Design ultra-limpo, sem quadros ou colunas, 100% otimizado para 1 página.
 */
export function generateAssessmentPDF(attempt: AssessmentAttempt): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Dimensões A4
  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const margin = 12; // 12mm de margem
  const contentWidth = pageWidth - margin * 2; // 186mm úteis
  let cursorY = 10;

  const isPassed = attempt.finalScorePercent >= 80;
  const mcQuestions = attempt.mcQuestions || [];
  const totalQuestions = mcQuestions.length || 5;

  // Recálculo do total de acertos
  let correctCount = 0;
  mcQuestions.forEach(q => {
    const studentChoice = attempt.mcAnswers[q.id];
    const correctOpt = q.options.find(o => o.isCorrect);
    if (studentChoice && correctOpt && studentChoice === correctOpt.displayLetter) {
      correctCount++;
    }
  });

  const finalScorePercent = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : attempt.finalScorePercent;

  /**
   * Utilitário de Impressão Segura Multilinha.
   * Retorna a altura exata consumida em mm.
   */
  const printText = (
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    fontSize: number,
    fontStyle: 'normal' | 'bold' | 'italic' = 'normal',
    color: [number, number, number] = [15, 23, 42],
    lineHeightRatio: number = 1.25
  ): number => {
    doc.setFont('helvetica', fontStyle);
    doc.setFontSize(fontSize);
    doc.setTextColor(color[0], color[1], color[2]);

    const cleanText = (text || '').replace(/\s+/g, ' ').trim();
    if (!cleanText) return 0;

    const lines: string[] = doc.splitTextToSize(cleanText, maxWidth);
    const lineHeight = (fontSize * 0.3527) * lineHeightRatio;

    lines.forEach((line, index) => {
      doc.text(line, x, y + (index * lineHeight));
    });

    return lines.length * lineHeight;
  };

  // ==========================================================================
  // 1. CABEÇALHO ACADÊMICO MANTIDO (Altura: 28mm)
  // ==========================================================================
  doc.setFillColor(15, 23, 42); // Dark Navy
  doc.roundedRect(margin, cursorY, contentWidth, 28, 1.5, 1.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(56, 189, 248);
  doc.text('TÉCNICAMZ PRO', margin + 4, cursorY + 5.5);

  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text('FOLHA OFICIAL DE AVALIAÇÃO DE COMPETÊNCIAS TÉCNICAS', margin + 4, cursorY + 9.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(148, 163, 184);
  doc.text('Padrão Normativo Europeu IEC / EN • Tutoria: Eng. Sara IA', margin + 4, cursorY + 13);

  // Badge Status do Cabeçalho
  const badgeW = 36;
  const badgeH = 9;
  const badgeX = margin + contentWidth - badgeW - 4;
  const badgeY = cursorY + 3.5;

  doc.setFillColor(isPassed ? 16 : 225, isPassed ? 185 : 29, isPassed ? 129 : 72);
  doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 1, 1, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  doc.text(isPassed ? 'ALCANÇADO' : 'NÃO ALCANÇADO', badgeX + badgeW / 2, badgeY + 3.8, { align: 'center' });
  doc.setFontSize(5);
  doc.text(isPassed ? 'Aprovado (≥ 80%)' : 'Reavaliação (< 80%)', badgeX + badgeW / 2, badgeY + 7, { align: 'center' });

  // Divisor do Cabeçalho
  doc.setDrawColor(51, 65, 85);
  doc.setLineWidth(0.2);
  doc.line(margin + 4, cursorY + 15, margin + contentWidth - 4, cursorY + 15);

  // Dados do Aluno e Módulo
  const studentName = attempt.technicianName || 'Técnico Autorizado';
  printText(`Aluno: ${studentName}`, margin + 4, cursorY + 18, 110, 6.5, 'normal', [226, 232, 240]);
  printText(`Módulo: ${attempt.moduleTitle}`, margin + 4, cursorY + 22.5, 110, 6.5, 'normal', [203, 213, 225]);

  const attemptLabel = attempt.attemptNumber === 1 ? '1ª Avaliação Oficial' : `${attempt.attemptNumber - 1}ª Reavaliação`;
  printText(`Tentativa: ${attemptLabel}`, margin + 120, cursorY + 18, 58, 6.5, 'normal', [226, 232, 240]);
  printText(`Data: ${attempt.date}`, margin + 120, cursorY + 22.5, 58, 6.5, 'normal', [203, 213, 225]);

  cursorY += 31;

  // Barra Fina Informativa de Aula
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`AULA: ${attempt.lessonTitle.toUpperCase()}`, margin, cursorY);
  
  doc.setFontSize(6);
  doc.setTextColor(2, 132, 199);
  doc.text(`Norma: ${attempt.norma || 'IEC 60364'} | Ref: ${attempt.authCode}`, margin + contentWidth, cursorY, { align: 'right' });

  cursorY += 2;
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.4);
  doc.line(margin, cursorY, margin + contentWidth, cursorY);

  cursorY += 4;

  // ==========================================================================
  // 2. QUESTÕES EM FLUXO ACADÊMICO PURA E SIMPLES (UM ABAIXO DO OUTRO)
  // ==========================================================================
  mcQuestions.forEach((q, idx) => {
    const studentLetter = attempt.mcAnswers[q.id];
    const correctOpt = q.options.find(o => o.isCorrect);
    const correctLetter = correctOpt?.displayLetter || 'A';
    const isAnswerCorrect = studentLetter === correctLetter;
    const studentOpt = q.options.find(o => o.displayLetter === studentLetter);

    // A. Número da Questão e Status
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`QUESTÃO ${idx + 1} DE ${totalQuestions}`, margin, cursorY);

    const statusText = isAnswerCorrect ? 'CORRETO [✓]' : 'INCORRETO [✗]';
    const statusColor: [number, number, number] = isAnswerCorrect ? [16, 185, 129] : [225, 29, 72];
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
    doc.text(statusText, margin + contentWidth, cursorY, { align: 'right' });

    cursorY += 3.5;

    // B. Enunciado
    const qHeight = printText(q.question, margin, cursorY, contentWidth, 6, 'bold', [15, 23, 42]);
    cursorY += qHeight + 1.2;

    // C. Sua Resposta (Abaixo do enunciado)
    const studentText = studentLetter 
      ? `Sua Resposta: [${studentLetter}] ${studentOpt?.text || ''}` 
      : 'Sua Resposta: (Não respondida)';
    const respHeight = printText(studentText, margin + 3, cursorY, contentWidth - 3, 5.5, 'normal', statusColor);
    cursorY += respHeight + 1;

    // D. Gabarito Oficial (Abaixo da sua resposta, se tiver errado)
    if (!isAnswerCorrect) {
      const correctText = `Gabarito Oficial: [${correctLetter}] ${correctOpt?.text || ''}`;
      const corrHeight = printText(correctText, margin + 3, cursorY, contentWidth - 3, 5.5, 'bold', [5, 150, 105]);
      cursorY += corrHeight + 1;
    }

    // E. Explicação Técnica (Abaixo do gabarito, sem rótulo "Fundamentação")
    const expText = q.explanation || q.keyTakeaway || '';
    if (expText) {
      const expHeight = printText(expText, margin + 3, cursorY, contentWidth - 3, 5, 'italic', [100, 116, 139]);
      cursorY += expHeight + 1.5;
    } else {
      cursorY += 1;
    }

    // Separador Discreto entre Questões
    if (idx < totalQuestions - 1) {
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.15);
      doc.line(margin, cursorY, margin + contentWidth, cursorY);
      cursorY += 3;
    }
  });

  // ==========================================================================
  // 3. RESUMO SIMPLES NO RODAPÉ (TEXTO PLANO SEM QUADROS)
  // ==========================================================================
  cursorY += 2;
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.4);
  doc.line(margin, cursorY, margin + contentWidth, cursorY);

  cursorY += 3.5;

  // Linha 1 do Rodapé: Desempenho e Porcentagem
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`DESEMPENHO FINAL: ${correctCount}/${totalQuestions} Acertos (${finalScorePercent}%)`, margin, cursorY);

  const statusFinalText = isPassed ? 'SITUAÇÃO: ALCANÇADO (≥80%)' : 'SITUAÇÃO: NÃO ALCANÇADO (<80%)';
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(isPassed ? 16 : 225, isPassed ? 185 : 29, isPassed ? 129 : 72);
  doc.text(statusFinalText, margin + contentWidth, cursorY, { align: 'right' });

  cursorY += 3.5;

  // Linha 2 do Rodapé: Autenticidade e Nota de Emissão
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Código de Autenticação: ${attempt.authCode} • Emitido eletronicamente pela Plataforma TécnicaMZ Pro`, margin, cursorY);

  // Nomeação e Download do PDF
  const sanitizedTitle = (attempt.lessonTitle || 'Avaliacao')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .substring(0, 25);
  doc.save(`TecnicaMZ_${sanitizedTitle}_T${attempt.attemptNumber}.pdf`);
}
