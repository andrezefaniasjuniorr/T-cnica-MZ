import jsPDF from 'jspdf';
import { AssessmentAttempt } from '../types/assessment';

/**
 * Gerador de Folha Oficial de Avaliação em PDF (Layout Vertical Acadêmico - A4).
 * Cards dinâmicos com ajuste automático de altura para justificativa/explicação.
 */
export function generateAssessmentPDF(attempt: AssessmentAttempt): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const margin = 12; // 12mm de margem
  const contentWidth = pageWidth - margin * 2; // 186mm úteis
  let cursorY = 10;

  const isPassed = attempt.finalScorePercent >= 80;
  const mcQuestions = attempt.mcQuestions || [];
  const totalQuestions = mcQuestions.length || 5;

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
   * Imprime bloco de texto com quebra automática e retorna a altura total consumida (em mm)
   */
  const printTextBlock = (
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    fontSize: number,
    fontStyle: 'normal' | 'bold' | 'italic' = 'normal',
    color: [number, number, number] = [15, 23, 42],
    lineHeightFactor: number = 1.25
  ): number => {
    doc.setFont('helvetica', fontStyle);
    doc.setFontSize(fontSize);
    doc.setTextColor(color[0], color[1], color[2]);

    const cleanText = (text || '').replace(/\s+/g, ' ').trim();
    if (!cleanText) return 0;

    const lines: string[] = doc.splitTextToSize(cleanText, maxWidth);
    const lineHeight = (fontSize * 0.3527) * lineHeightFactor; // conversão pt para mm

    lines.forEach((line, index) => {
      doc.text(line, x, y + (index * lineHeight));
    });

    return lines.length * lineHeight;
  };

  // ==========================================================================
  // 1. CABEÇALHO ACADÊMICO COMPACTO (Altura: 28mm)
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

  // Badge Status
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

  // Divisor Interno
  doc.setDrawColor(51, 65, 85);
  doc.setLineWidth(0.2);
  doc.line(margin + 4, cursorY + 15, margin + contentWidth - 4, cursorY + 15);

  // Dados do Aluno e Módulo
  const studentName = attempt.technicianName || 'Técnico Autorizado';
  printTextBlock(`Aluno: ${studentName}`, margin + 4, cursorY + 18, 110, 6.5, 'normal', [226, 232, 240]);
  printTextBlock(`Módulo: ${attempt.moduleTitle}`, margin + 4, cursorY + 22.5, 110, 6.5, 'normal', [203, 213, 225]);

  const attemptLabel = attempt.attemptNumber === 1 ? '1ª Avaliação Oficial' : `${attempt.attemptNumber - 1}ª Reavaliação`;
  printTextBlock(`Tentativa: ${attemptLabel}`, margin + 120, cursorY + 18, 58, 6.5, 'normal', [226, 232, 240]);
  printTextBlock(`Data: ${attempt.date}`, margin + 120, cursorY + 22.5, 58, 6.5, 'normal', [203, 213, 225]);

  cursorY += 30;

  // ==========================================================================
  // 2. BARRA DE TÍTULO DA AULA E REFERÊNCIA TÉCNICA
  // ==========================================================================
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.2);
  doc.roundedRect(margin, cursorY, contentWidth, 6.5, 1, 1, 'FD');

  printTextBlock(`Aula: ${attempt.lessonTitle}`, margin + 3, cursorY + 4, 115, 6.5, 'bold', [15, 23, 42]);
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6);
  doc.setTextColor(2, 132, 199);
  doc.text(`Norma: ${attempt.norma || 'IEC 60364'} | Ref: ${attempt.authCode}`, margin + contentWidth - 3, cursorY + 4.2, { align: 'right' });

  cursorY += 8.5;

  // ==========================================================================
  // 3. ESTRUTURA VERTICAL DAS QUESTÕES (CARDS COM ALTURA DINÂMICA)
  // ==========================================================================
  const cardGap = 2;

  mcQuestions.forEach((q, idx) => {
    const studentLetter = attempt.mcAnswers[q.id];
    const correctOpt = q.options.find(o => o.isCorrect);
    const correctLetter = correctOpt?.displayLetter || 'A';
    const isAnswerCorrect = studentLetter === correctLetter;
    const studentOpt = q.options.find(o => o.displayLetter === studentLetter);

    // Texto de explicação/justificação limpo (sem rótulo "Fundamentação:")
    const expText = q.explanation || q.keyTakeaway || 'Conformidade integral com os parâmetros e especificações das normas técnicas da IEC.';

    // Pré-cálculo da altura necessária para a justificativa
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(5.5);
    const expLines = doc.splitTextToSize(expText, contentWidth - 10);
    const expHeight = expLines.length * ((5.5 * 0.3527) * 1.2);

    // Pré-cálculo da altura do enunciado da questão
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.2);
    const qLines = doc.splitTextToSize(q.question, contentWidth - 28);
    const qHeight = qLines.length * ((6.2 * 0.3527) * 1.2);

    // Altura dinamicamente calculada para o card
    const cardDynamicHeight = Math.max(34, 16 + qHeight + expHeight + 6);

    // Fundo do Card
    doc.setFillColor(250, 250, 250);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.2);
    doc.roundedRect(margin, cursorY, contentWidth, cardDynamicHeight, 1, 1, 'FD');

    // Indicador Lateral Acerto / Erro
    doc.setFillColor(isAnswerCorrect ? 16 : 225, isAnswerCorrect ? 185 : 29, isAnswerCorrect ? 129 : 72);
    doc.roundedRect(margin, cursorY, 2.5, cardDynamicHeight, 0.8, 0.8, 'F');

    // Cabeçalho da Questão
    printTextBlock(`Questão ${idx + 1} de ${totalQuestions}`, margin + 5, cursorY + 4, 80, 7, 'bold', [30, 41, 59]);

    // Badge Status (CORRETO / INCORRETO)
    const statusW = 20;
    const statusH = 4;
    const statusX = margin + contentWidth - statusW - 3;
    const statusY = cursorY + 1.5;

    doc.setFillColor(isAnswerCorrect ? 16 : 225, isAnswerCorrect ? 185 : 29, isAnswerCorrect ? 129 : 72);
    doc.roundedRect(statusX, statusY, statusW, statusH, 0.8, 0.8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5.5);
    doc.setTextColor(255, 255, 255);
    doc.text(isAnswerCorrect ? 'CORRETO ✓' : 'INCORRETO ✗', statusX + statusW / 2, statusY + 2.7, { align: 'center' });

    // Enunciado com altura dinâmica
    let innerCursorY = cursorY + 8;
    const renderedQHeight = printTextBlock(q.question, margin + 5, innerCursorY, contentWidth - 28, 6.2, 'normal', [15, 23, 42]);
    innerCursorY += renderedQHeight + 2.5;

    // Bloco de Respostas em 2 Colunas
    const colWidth = 84;
    const studentText = studentLetter ? `Sua Resposta: [${studentLetter}] ${studentOpt?.text || ''}` : 'Sua Resposta: (Não respondida)';
    const studentColor: [number, number, number] = isAnswerCorrect ? [16, 185, 129] : [225, 29, 72];
    
    printTextBlock(studentText, margin + 5, innerCursorY, colWidth, 5.8, 'bold', studentColor);

    const guiaX = margin + 5 + colWidth + 4;
    const correctText = `Guia Oficial: [${correctLetter}] ${correctOpt?.text || ''}`;
    printTextBlock(correctText, guiaX, innerCursorY, colWidth, 5.8, 'normal', [4, 120, 87]);

    innerCursorY += 6.5;

    // Texto da Explicação/Justificativa (Sem a palavra "Fundamentação", com margem total de 176mm)
    printTextBlock(expText, margin + 5, innerCursorY, contentWidth - 10, 5.5, 'italic', [100, 116, 139]);

    cursorY += cardDynamicHeight + cardGap;
  });

  cursorY += 1;

  // ==========================================================================
  // 4. PAINEL DE RESUMO E CHAVE DE SEGURANÇA (Altura: 24mm)
  // ==========================================================================
  doc.setFillColor(15, 23, 42);
  doc.roundedRect(margin, cursorY, contentWidth, 24, 1.5, 1.5, 'F');

  printTextBlock('RESUMO DE DESEMPENHO E APROVEITAMENTO', margin + 4, cursorY + 5.5, 120, 7.5, 'bold', [56, 189, 248]);
  printTextBlock(
    `Resultado: ${correctCount} de ${totalQuestions} acertos (${finalScorePercent}%) • Exigência IEC: 80%`,
    margin + 4,
    cursorY + 10,
    120,
    6.5,
    'normal',
    [241, 245, 249]
  );

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6);
  doc.setTextColor(52, 211, 153);
  doc.text(`Autenticação: ${attempt.authCode}`, margin + 4, cursorY + 14.5);

  // Quadrado da Nota (%)
  const scoreBoxW = 34;
  const scoreBoxH = 16;
  const scoreBoxX = margin + contentWidth - scoreBoxW - 4;
  const scoreBoxY = cursorY + 4;

  doc.setFillColor(30, 41, 59);
  doc.setDrawColor(51, 65, 85);
  doc.setLineWidth(0.2);
  doc.roundedRect(scoreBoxX, scoreBoxY, scoreBoxW, scoreBoxH, 1, 1, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text(`${finalScorePercent}%`, scoreBoxX + scoreBoxW / 2, scoreBoxY + 7.5, { align: 'center' });

  doc.setFontSize(5.5);
  doc.setTextColor(isPassed ? 52 : 244, isPassed ? 211 : 63, isPassed ? 153 : 94);
  doc.text(isPassed ? 'ALCANÇADO' : 'NÃO ALCANÇADO', scoreBoxX + scoreBoxW / 2, scoreBoxY + 12, { align: 'center' });

  // Rodapé Informativo
  printTextBlock(
    'Documento emitido eletronicamente pela Plataforma TécnicaMZ Pro. Validez acadêmica e técnica nos termos do regulamento.',
    margin + 4,
    cursorY + 19.5,
    120,
    5,
    'italic',
    [148, 163, 184]
  );

  // Download do PDF
  const sanitizedTitle = (attempt.lessonTitle || 'Avaliacao')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .substring(0, 25);
  doc.save(`TecnicaMZ_${sanitizedTitle}_T${attempt.attemptNumber}.pdf`);
}
