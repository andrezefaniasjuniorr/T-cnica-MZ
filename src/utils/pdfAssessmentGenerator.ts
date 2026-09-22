import jsPDF from 'jspdf';
import { AssessmentAttempt } from '../types/assessment';

/**
 * Gerador de Folha Oficial de Avaliação em PDF (Layout Vertical Acadêmico - A4).
 * Correção matemática rigorosa de largura para impedir vazamento em qualquer resolução.
 */
export function generateAssessmentPDF(attempt: AssessmentAttempt): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Dimensões Rígidas do Papel A4 (210mm x 297mm)
  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const margin = 12; // 12mm de margem esquerda/direita
  const contentWidth = pageWidth - margin * 2; // 186mm exatos de largura útil
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
   * Função de Impressão Rígida com Margem de Segurança Embutida
   */
  const printSafeBlock = (
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    fontSize: number,
    fontStyle: 'normal' | 'bold' | 'italic' = 'normal',
    color: [number, number, number] = [15, 23, 42],
    maxLines: number = 2
  ): number => {
    doc.setFont('helvetica', fontStyle);
    doc.setFontSize(fontSize);
    doc.setTextColor(color[0], color[1], color[2]);

    const cleanText = (text || '').replace(/\s+/g, ' ').trim();
    // splitTextToSize com limite estrito de largura em mm
    const lines = doc.splitTextToSize(cleanText, maxWidth);
    const linesToPrint = lines.slice(0, maxLines);
    
    const lineHeight = (fontSize * 0.3527) * 1.2; // Altura de linha em mm
    
    linesToPrint.forEach((line: string, index: number) => {
      doc.text(line, x, y + (index * lineHeight));
    });

    return linesToPrint.length * lineHeight;
  };

  // ==========================================================================
  // 1. CABEÇALHO ACADÊMICO COMPACTO (Altura: 28mm)
  // ==========================================================================
  doc.setFillColor(15, 23, 42); // Dark Navy
  doc.roundedRect(margin, cursorY, contentWidth, 28, 1.5, 1.5, 'F');

  // Marca
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

  if (isPassed) {
    doc.setFillColor(16, 185, 129);
    doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 1, 1, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(255, 255, 255);
    doc.text('ALCANÇADO', badgeX + badgeW / 2, badgeY + 3.8, { align: 'center' });
    doc.setFontSize(5);
    doc.text('Aprovado (≥ 80%)', badgeX + badgeW / 2, badgeY + 7, { align: 'center' });
  } else {
    doc.setFillColor(225, 29, 72);
    doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 1, 1, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(255, 255, 255);
    doc.text('NÃO ALCANÇADO', badgeX + badgeW / 2, badgeY + 3.8, { align: 'center' });
    doc.setFontSize(5);
    doc.text('Reavaliação (< 80%)', badgeX + badgeW / 2, badgeY + 7, { align: 'center' });
  }

  // Divisor Interno
  doc.setDrawColor(51, 65, 85);
  doc.setLineWidth(0.2);
  doc.line(margin + 4, cursorY + 15, margin + contentWidth - 4, cursorY + 15);

  // Dados do Aluno e Módulo
  const studentName = attempt.technicianName || 'Técnico Autorizado';
  printSafeBlock(`Aluno: ${studentName}`, margin + 4, cursorY + 18, 110, 6.5, 'normal', [226, 232, 240], 1);
  printSafeBlock(`Módulo: ${attempt.moduleTitle}`, margin + 4, cursorY + 22.5, 110, 6.5, 'normal', [203, 213, 225], 1);

  const attemptLabel = attempt.attemptNumber === 1 ? '1ª Avaliação Oficial' : `${attempt.attemptNumber - 1}ª Reavaliação`;
  printSafeBlock(`Tentativa: ${attemptLabel}`, margin + 120, cursorY + 18, 58, 6.5, 'normal', [226, 232, 240], 1);
  printSafeBlock(`Data: ${attempt.date}`, margin + 120, cursorY + 22.5, 58, 6.5, 'normal', [203, 213, 225], 1);

  cursorY += 30;

  // ==========================================================================
  // 2. BARRA DE TÍTULO DA AULA E REFERÊNCIA TÉCNICA (Altura: 6.5mm)
  // ==========================================================================
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.2);
  doc.roundedRect(margin, cursorY, contentWidth, 6.5, 1, 1, 'FD');

  printSafeBlock(`Aula: ${attempt.lessonTitle}`, margin + 3, cursorY + 4, 115, 6.5, 'bold', [15, 23, 42], 1);
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6);
  doc.setTextColor(2, 132, 199);
  doc.text(`Norma: ${attempt.norma || 'IEC 60364'} | Ref: ${attempt.authCode}`, margin + contentWidth - 3, cursorY + 4.2, { align: 'right' });

  cursorY += 8;

  // ==========================================================================
  // 3. ESTRUTURA VERTICAL DAS QUESTÕES (CARDS ULTRA-SEGUROS)
  // ==========================================================================
  const cardHeight = 36;
  const cardGap = 2;

  mcQuestions.forEach((q, idx) => {
    const studentLetter = attempt.mcAnswers[q.id];
    const correctOpt = q.options.find(o => o.isCorrect);
    const correctLetter = correctOpt?.displayLetter || 'A';
    const isAnswerCorrect = studentLetter === correctLetter;
    const studentOpt = q.options.find(o => o.displayLetter === studentLetter);

    // Fundo do Card
    doc.setFillColor(250, 250, 250);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.2);
    doc.roundedRect(margin, cursorY, contentWidth, cardHeight, 1, 1, 'FD');

    // Faixa Lateral de Status
    doc.setFillColor(isAnswerCorrect ? 16 : 225, isAnswerCorrect ? 185 : 29, isAnswerCorrect ? 129 : 72);
    doc.roundedRect(margin, cursorY, 2.5, cardHeight, 0.8, 0.8, 'F');

    // Título da Questão + Badge Status
    printSafeBlock(`Questão ${idx + 1} de ${totalQuestions}`, margin + 5, cursorY + 4, 80, 7, 'bold', [30, 41, 59], 1);

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

    // Enunciado (Largura máxima 150mm - Proibido vazar)
    printSafeBlock(q.question, margin + 5, cursorY + 8.2, contentWidth - 28, 6.2, 'normal', [15, 23, 42], 2);

    // Bloco Estruturado de Respostas (Largura útil de 84mm cada coluna)
    const respY = cursorY + 17;
    const colWidth = 84;

    // Coluna 1: Sua Resposta
    const studentText = studentLetter ? `Sua Resposta: [${studentLetter}] ${studentOpt?.text || ''}` : 'Sua Resposta: (Não respondida)';
    const studentColor: [number, number, number] = isAnswerCorrect ? [16, 185, 129] : [225, 29, 72];
    printSafeBlock(studentText, margin + 5, respY, colWidth, 5.8, 'bold', studentColor, 2);

    // Coluna 2: Guia Oficial
    const guiaX = margin + 5 + colWidth + 4; // 12 + 5 + 84 + 4 = 105mm
    const correctText = `Guia Oficial: [${correctLetter}] ${correctOpt?.text || ''}`;
    printSafeBlock(correctText, guiaX, respY, colWidth, 5.8, 'normal', [4, 120, 87], 2);

    // Fundamentação Técnica (Largura Máxima 174mm com margem interna rigorosa)
    const expText = q.explanation || q.keyTakeaway || 'Conformidade com os padrões normativos da IEC.';
    printSafeBlock(`Fundamentação: ${expText}`, margin + 5, cursorY + 31.5, contentWidth - 12, 5.2, 'italic', [100, 116, 139], 1);

    cursorY += cardHeight + cardGap;
  });

  cursorY += 1;

  // ==========================================================================
  // 4. PAINEL DE RESUMO E CHAVE DE SEGURANÇA (Altura: 24mm)
  // ==========================================================================
  doc.setFillColor(15, 23, 42);
  doc.roundedRect(margin, cursorY, contentWidth, 24, 1.5, 1.5, 'F');

  printSafeBlock('RESUMO DE DESEMPENHO E APROVEITAMENTO', margin + 4, cursorY + 5.5, 120, 7.5, 'bold', [56, 189, 248], 1);
  printSafeBlock(
    `Resultado: ${correctCount} de ${totalQuestions} acertos (${finalScorePercent}%) • Exigência IEC: 80%`,
    margin + 4,
    cursorY + 10,
    120,
    6.5,
    'normal',
    [241, 245, 249],
    1
  );

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6);
  doc.setTextColor(52, 211, 153);
  doc.text(`Autenticação: ${attempt.authCode}`, margin + 4, cursorY + 14.5);

  // Box da Nota
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

  // Rodapé
  printSafeBlock(
    'Documento emitido eletronicamente pela Plataforma TécnicaMZ Pro. Validez acadêmica e técnica nos termos do regulamento.',
    margin + 4,
    cursorY + 19.5,
    120,
    5,
    'italic',
    [148, 163, 184],
    1
  );

  // Nomeação do arquivo
  const sanitizedTitle = (attempt.lessonTitle || 'Avaliacao')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .substring(0, 25);
  doc.save(`TecnicaMZ_${sanitizedTitle}_T${attempt.attemptNumber}.pdf`);
}
