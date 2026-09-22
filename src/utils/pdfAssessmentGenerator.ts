import jsPDF from 'jspdf';
import { AssessmentAttempt } from '../types/assessment';

/**
 * Gerador de Folha Oficial de Avaliação em PDF (Layout Acadêmico Vertical - A4).
 * Margens padrão de digitação A4 (20mm) com correção total de kerning/fonte.
 */
export function generateAssessmentPDF(attempt: AssessmentAttempt): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Dimensões A4 Padrão (210mm x 297mm)
  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
  
  // Margens Padrão de Digitação Acadêmica (20mm)
  const margin = 20; 
  const contentWidth = pageWidth - (margin * 2); // 170mm úteis
  let cursorY = margin; // Início aos 20mm no topo

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
   * Utilitário Unificado de Texto: Garante fonte idêntica (Helvetica) sem separação de caracteres.
   */
  const printUniformText = (
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    fontSize: number,
    fontStyle: 'normal' | 'bold' | 'italic' = 'normal',
    color: [number, number, number] = [15, 23, 42],
    lineHeightFactor: number = 1.3
  ): number => {
    // Força e reseta estritamente a fonte antes do cálculo de texto
    doc.setFont('helvetica', fontStyle);
    doc.setFontSize(fontSize);
    doc.setTextColor(color[0], color[1], color[2]);

    // Limpa caracteres invisíveis ou múltiplos espaços que causam a separação das letras
    const cleanText = (text || '')
      .replace(/[\r\n\t]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanText) return 0;

    // Quebra de linha exata com base nos 170mm das margens
    const lines: string[] = doc.splitTextToSize(cleanText, maxWidth);
    const lineHeight = (fontSize * 0.3527) * lineHeightFactor; // Converte pt para mm

    lines.forEach((line, index) => {
      // Impressão simples sem alinhamento justificado para evitar kerning artificial
      doc.text(line, x, y + (index * lineHeight), { align: 'left' });
    });

    return lines.length * lineHeight;
  };

  // ==========================================================================
  // 1. CABEÇALHO ACADÊMICO UNIFORME (Altura: 26mm)
  // ==========================================================================
  doc.setFillColor(15, 23, 42); // Navy
  doc.roundedRect(margin, cursorY, contentWidth, 26, 1, 1, 'F');

  printUniformText('TÉCNICAMZ PRO', margin + 4, cursorY + 5.5, 110, 10, 'bold', [56, 189, 248]);
  printUniformText('FOLHA OFICIAL DE AVALIAÇÃO DE COMPETÊNCIAS TÉCNICAS', margin + 4, cursorY + 9.5, 110, 7, 'bold', [255, 255, 255]);
  printUniformText('Padrão Normativo Europeu IEC / EN • Tutoria: Eng. Sara IA', margin + 4, cursorY + 13, 110, 6, 'normal', [148, 163, 184]);

  // Badge Status do Cabeçalho
  const badgeW = 34;
  const badgeH = 8;
  const badgeX = margin + contentWidth - badgeW - 4;
  const badgeY = cursorY + 3.5;

  doc.setFillColor(isPassed ? 16 : 225, isPassed ? 185 : 29, isPassed ? 129 : 72);
  doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 0.8, 0.8, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(255, 255, 255);
  doc.text(isPassed ? 'ALCANÇADO' : 'NÃO ALCANÇADO', badgeX + badgeW / 2, badgeY + 3.5, { align: 'center' });
  doc.setFontSize(4.8);
  doc.text(isPassed ? 'Aprovado (≥ 80%)' : 'Reavaliação (< 80%)', badgeX + badgeW / 2, badgeY + 6.2, { align: 'center' });

  // Linha Divisória
  doc.setDrawColor(51, 65, 85);
  doc.setLineWidth(0.2);
  doc.line(margin + 4, cursorY + 15, margin + contentWidth - 4, cursorY + 15);

  // Metadados do Aluno
  const studentName = attempt.technicianName || 'Técnico Autorizado';
  printUniformText(`Aluno: ${studentName}`, margin + 4, cursorY + 18, 100, 6.2, 'normal', [226, 232, 240]);
  printUniformText(`Módulo: ${attempt.moduleTitle}`, margin + 4, cursorY + 21.5, 100, 6.2, 'normal', [203, 213, 225]);

  const attemptLabel = attempt.attemptNumber === 1 ? '1ª Avaliação Oficial' : `${attempt.attemptNumber - 1}ª Reavaliação`;
  printUniformText(`Tentativa: ${attemptLabel}`, margin + 110, cursorY + 18, 55, 6.2, 'normal', [226, 232, 240]);
  printUniformText(`Data: ${attempt.date}`, margin + 110, cursorY + 21.5, 55, 6.2, 'normal', [203, 213, 225]);

  cursorY += 29;

  // Barra de Aula e Norma
  printUniformText(`AULA: ${attempt.lessonTitle.toUpperCase()}`, margin, cursorY, 110, 6.5, 'bold', [15, 23, 42]);
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6);
  doc.setTextColor(2, 132, 199);
  doc.text(`Norma: ${attempt.norma || 'IEC 60364'} | Ref: ${attempt.authCode}`, margin + contentWidth, cursorY, { align: 'right' });

  cursorY += 2;
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.3);
  doc.line(margin, cursorY, margin + contentWidth, cursorY);

  cursorY += 4.5;

  // ==========================================================================
  // 2. QUESTÕES EM FLUXO ESTRITAMENTE VERTICAL (1 COLUNA PURA, FONTE ÚNICA)
  // ==========================================================================
  mcQuestions.forEach((q, idx) => {
    const studentLetter = attempt.mcAnswers[q.id];
    const correctOpt = q.options.find(o => o.isCorrect);
    const correctLetter = correctOpt?.displayLetter || 'A';
    const isAnswerCorrect = studentLetter === correctLetter;
    const studentOpt = q.options.find(o => o.displayLetter === studentLetter);

    // Indicador e Número da Questão
    const statusColor: [number, number, number] = isAnswerCorrect ? [16, 185, 129] : [225, 29, 72];
    printUniformText(`QUESTÃO ${idx + 1} DE ${totalQuestions}`, margin, cursorY, 80, 6.5, 'bold', [15, 23, 42]);

    const statusLabel = isAnswerCorrect ? 'CORRETO [✓]' : 'INCORRETO [✗]';
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
    doc.text(statusLabel, margin + contentWidth, cursorY, { align: 'right' });

    cursorY += 3.5;

    // Enunciado (Utiliza todos os 170mm de largura útil)
    const qHeight = printUniformText(q.question, margin, cursorY, contentWidth, 6, 'normal', [15, 23, 42]);
    cursorY += qHeight + 1.2;

    // Sua Resposta (Alinhada verticalmente abaixo do enunciado)
    const studentText = studentLetter 
      ? `Sua Resposta: [${studentLetter}] ${studentOpt?.text || ''}` 
      : 'Sua Resposta: (Não respondida)';
    const respHeight = printUniformText(studentText, margin + 2, cursorY, contentWidth - 2, 5.5, 'bold', statusColor);
    cursorY += respHeight + 1;

    // Gabarito Oficial (Abaixo da resposta do aluno)
    if (!isAnswerCorrect) {
      const correctText = `Gabarito Oficial: [${correctLetter}] ${correctOpt?.text || ''}`;
      const corrHeight = printUniformText(correctText, margin + 2, cursorY, contentWidth - 2, 5.5, 'normal', [5, 150, 105]);
      cursorY += corrHeight + 1;
    }

    // Explicação / Justificativa
    const expText = q.explanation || q.keyTakeaway || '';
    if (expText) {
      const expHeight = printUniformText(expText, margin + 2, cursorY, contentWidth - 2, 5, 'italic', [100, 116, 139]);
      cursorY += expHeight + 1.5;
    } else {
      cursorY += 1;
    }

    // Separador entre Questões
    if (idx < totalQuestions - 1) {
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.15);
      doc.line(margin, cursorY, margin + contentWidth, cursorY);
      cursorY += 3;
    }
  });

  // ==========================================================================
  // 3. RODAPÉ ACADÊMICO MANTIDO DENTRO DAS MARGENS
  // ==========================================================================
  cursorY += 2;
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.3);
  doc.line(margin, cursorY, margin + contentWidth, cursorY);

  cursorY += 3.5;

  printUniformText(`DESEMPENHO FINAL: ${correctCount}/${totalQuestions} Acertos (${finalScorePercent}%)`, margin, cursorY, 110, 6.5, 'bold', [15, 23, 42]);

  const statusFinalText = isPassed ? 'SITUAÇÃO: ALCANÇADO (≥80%)' : 'SITUAÇÃO: NÃO ALCANÇADO (<80%)';
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(isPassed ? 16 : 225, isPassed ? 185 : 29, isPassed ? 129 : 72);
  doc.text(statusFinalText, margin + contentWidth, cursorY, { align: 'right' });

  cursorY += 3.5;

  printUniformText(`Código de Autenticação: ${attempt.authCode} • Emitido eletronicamente pela Plataforma TécnicaMZ Pro`, margin, cursorY, contentWidth, 5, 'normal', [100, 116, 139]);

  // Download do PDF
  const sanitizedTitle = (attempt.lessonTitle || 'Avaliacao')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .substring(0, 25);
  doc.save(`TecnicaMZ_${sanitizedTitle}_T${attempt.attemptNumber}.pdf`);
}
