import jsPDF from 'jspdf';
import { AssessmentAttempt } from '../types/assessment';

/**
 * Gerador de Folha Oficial de Avaliação em PDF (Layout Vertical Acadêmico - A4).
 * Estrutura reescrita em fluxo vertical contínuo para eliminação definitiva de vazamentos.
 */
export function generateAssessmentPDF(attempt: AssessmentAttempt): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Dimensões Padrão A4 (210mm x 297mm)
  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const margin = 12; // Margens laterais de 12mm
  const contentWidth = pageWidth - margin * 2; // 186mm livres para texto
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
   * Utilitário de Impressão Segura Multilinha
   * Imprime o texto e retorna a altura exata consumida em mm.
   */
  const printText = (
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    fontSize: number,
    fontStyle: 'normal' | 'bold' | 'italic' = 'normal',
    color: [number, number, number] = [15, 23, 42],
    lineHeightRatio: number = 1.3
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
  // 1. CABEÇALHO OFICIAL (MANTIDO)
  // ==========================================================================
  doc.setFillColor(15, 23, 42); // Dark Navy #0F172A
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

  // Linha Divisória do Cabeçalho
  doc.setDrawColor(51, 65, 85);
  doc.setLineWidth(0.2);
  doc.line(margin + 4, cursorY + 15, margin + contentWidth - 4, cursorY + 15);

  // Metadados da Avaliação
  const studentName = attempt.technicianName || 'Técnico Autorizado';
  printText(`Aluno: ${studentName}`, margin + 4, cursorY + 18, 110, 6.5, 'normal', [226, 232, 240]);
  printText(`Módulo: ${attempt.moduleTitle}`, margin + 4, cursorY + 22.5, 110, 6.5, 'normal', [203, 213, 225]);

  const attemptLabel = attempt.attemptNumber === 1 ? '1ª Avaliação Oficial' : `${attempt.attemptNumber - 1}ª Reavaliação`;
  printText(`Tentativa: ${attemptLabel}`, margin + 120, cursorY + 18, 58, 6.5, 'normal', [226, 232, 240]);
  printText(`Data: ${attempt.date}`, margin + 120, cursorY + 22.5, 58, 6.5, 'normal', [203, 213, 225]);

  cursorY += 31;

  // ==========================================================================
  // 2. BARRA DE REFERÊNCIA DA AULA E NORMA
  // ==========================================================================
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.2);
  doc.roundedRect(margin, cursorY, contentWidth, 6, 0.8, 0.8, 'FD');

  printText(`Aula: ${attempt.lessonTitle}`, margin + 3, cursorY + 3.8, 115, 6, 'bold', [15, 23, 42]);
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(5.8);
  doc.setTextColor(2, 132, 199);
  doc.text(`Norma: ${attempt.norma || 'IEC 60364'} | Ref: ${attempt.authCode}`, margin + contentWidth - 3, cursorY + 3.8, { align: 'right' });

  cursorY += 9;

  // ==========================================================================
  // 3. NOVA ESTRUTURA VERTICAL DE QUESTÕES (SEM COLUNAS, FLUXO LIVRE)
  // ==========================================================================
  mcQuestions.forEach((q, idx) => {
    const studentLetter = attempt.mcAnswers[q.id];
    const correctOpt = q.options.find(o => o.isCorrect);
    const correctLetter = correctOpt?.displayLetter || 'A';
    const isAnswerCorrect = studentLetter === correctLetter;
    const studentOpt = q.options.find(o => o.displayLetter === studentLetter);

    // Linha de Divisão Superior da Questão
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(margin, cursorY, margin + contentWidth, cursorY);
    cursorY += 3.5;

    // A. Indicador e Título da Questão
    const badgeColor: [number, number, number] = isAnswerCorrect ? [16, 185, 129] : [225, 29, 72];
    
    // Pequeno marcador colorido na esquerda
    doc.setFillColor(badgeColor[0], badgeColor[1], badgeColor[2]);
    doc.roundedRect(margin, cursorY - 2.2, 2, 4, 0.5, 0.5, 'F');

    printText(`QUESTÃO ${idx + 1} DE ${totalQuestions}`, margin + 4, cursorY, 80, 6.5, 'bold', badgeColor);

    const statusLabel = isAnswerCorrect ? 'CORRETO ✓' : 'INCORRETO ✗';
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6);
    doc.setTextColor(badgeColor[0], badgeColor[1], badgeColor[2]);
    doc.text(statusLabel, margin + contentWidth, cursorY, { align: 'right' });

    cursorY += 4;

    // B. Enunciado da Questão (Largura total: 186mm)
    const qHeight = printText(q.question, margin + 4, cursorY, contentWidth - 4, 6.2, 'bold', [15, 23, 42]);
    cursorY += qHeight + 1.5;

    // C. Sua Resposta (Linha própria dedicada)
    const studentText = studentLetter 
      ? `Sua Resposta: [${studentLetter}] ${studentOpt?.text || ''}` 
      : 'Sua Resposta: (Não respondida)';
    
    const respHeight = printText(studentText, margin + 4, cursorY, contentWidth - 4, 5.8, 'bold', badgeColor);
    cursorY += respHeight + 1;

    // D. Guia Oficial / Resposta Correta (Exibida somente se o aluno errou)
    if (!isAnswerCorrect) {
      const correctText = `Gabarito Oficial: [${correctLetter}] ${correctOpt?.text || ''}`;
      const corrHeight = printText(correctText, margin + 4, cursorY, contentWidth - 4, 5.8, 'normal', [5, 150, 105]);
      cursorY += corrHeight + 1;
    }

    // E. Explicação Técnica Integrada (Sem o rótulo "Fundamentação", com recuo elegante)
    const expText = q.explanation || q.keyTakeaway || '';
    if (expText) {
      const expHeight = printText(expText, margin + 4, cursorY, contentWidth - 4, 5.2, 'italic', [100, 116, 139]);
      cursorY += expHeight + 1.5;
    } else {
      cursorY += 1;
    }
  });

  // Linha Final da última questão
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(margin, cursorY, margin + contentWidth, cursorY);
  cursorY += 4;

  // ==========================================================================
  // 4. PAINEL DE RESUMO DE DESEMPENHO (RODAPÉ)
  // ==========================================================================
  doc.setFillColor(15, 23, 42);
  doc.roundedRect(margin, cursorY, contentWidth, 22, 1.5, 1.5, 'F');

  printText('RESUMO DE DESEMPENHO E APROVEITAMENTO', margin + 4, cursorY + 5, 120, 7.5, 'bold', [56, 189, 248]);
  printText(
    `Resultado: ${correctCount} de ${totalQuestions} acertos (${finalScorePercent}%) • Exigência IEC: 80%`,
    margin + 4,
    cursorY + 9.5,
    120,
    6,
    'normal',
    [241, 245, 249]
  );

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(5.8);
  doc.setTextColor(52, 211, 153);
  doc.text(`Autenticação: ${attempt.authCode}`, margin + 4, cursorY + 13.5);

  // Quadrado da Nota
  const scoreBoxW = 32;
  const scoreBoxH = 15;
  const scoreBoxX = margin + contentWidth - scoreBoxW - 4;
  const scoreBoxY = cursorY + 3.5;

  doc.setFillColor(30, 41, 59);
  doc.setDrawColor(51, 65, 85);
  doc.setLineWidth(0.2);
  doc.roundedRect(scoreBoxX, scoreBoxY, scoreBoxW, scoreBoxH, 1, 1, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(255, 255, 255);
  doc.text(`${finalScorePercent}%`, scoreBoxX + scoreBoxW / 2, scoreBoxY + 7, { align: 'center' });

  doc.setFontSize(5.2);
  doc.setTextColor(isPassed ? 52 : 244, isPassed ? 211 : 63, isPassed ? 153 : 94);
  doc.text(isPassed ? 'ALCANÇADO' : 'NÃO ALCANÇADO', scoreBoxX + scoreBoxW / 2, scoreBoxY + 11.5, { align: 'center' });

  // Nota Rodapé
  printText(
    'Documento emitido eletronicamente pela Plataforma TécnicaMZ Pro. Validez acadêmica e técnica nos termos do regulamento.',
    margin + 4,
    cursorY + 18,
    120,
    4.8,
    'italic',
    [148, 163, 184]
  );

  // Download do arquivo
  const sanitizedTitle = (attempt.lessonTitle || 'Avaliacao')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .substring(0, 25);
  doc.save(`TecnicaMZ_${sanitizedTitle}_T${attempt.attemptNumber}.pdf`);
}
