import jsPDF from 'jspdf';
import { AssessmentAttempt } from '../types/assessment';

/**
 * Gerador de Folha Oficial de Avaliação em PDF (Layout Vertical Acadêmico - A4).
 * Exibe as respostas escolhidas e o Guia Oficial por extenso (100% integrais).
 * Rigorosamente mantido em 1 PÁGINA A4 com margens seguras.
 */
export function generateAssessmentPDF(attempt: AssessmentAttempt): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Configurações Globais de Layout
  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const margin = 12; // Margem lateral de 12mm
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

  // Função Auxiliar: Impressão Segura de Texto Multilinhas sem Estourar Margem
  const printSafeText = (
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
    const lines = doc.splitTextToSize(text || '', maxWidth);
    const linesToPrint = lines.slice(0, maxLines);
    doc.text(linesToPrint, x, y);
    return linesToPrint.length;
  };

  // ==========================================================================
  // 1. CABEÇALHO ACADÊMICO COMPACTO (Altura: 28mm)
  // ==========================================================================
  doc.setFillColor(15, 23, 42); // Navy Escuro Acadêmico
  doc.roundedRect(margin, cursorY, contentWidth, 28, 1.5, 1.5, 'F');

  // Identificação Institucional
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(56, 189, 248); // Sky Blue
  doc.text('TÉCNICAMZ PRO', margin + 4, cursorY + 5.5);

  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text('FOLHA OFICIAL DE AVALIAÇÃO DE COMPETÊNCIAS TÉCNICAS', margin + 4, cursorY + 9.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(148, 163, 184);
  doc.text('Padrão Normativo Europeu IEC / EN • Tutoria: Eng. Sara IA', margin + 4, cursorY + 13);

  // Badge de Status (Canto Superior Direito)
  const badgeW = 38;
  const badgeH = 9.5;
  const badgeX = margin + contentWidth - badgeW - 4;
  const badgeY = cursorY + 3.5;

  if (isPassed) {
    doc.setFillColor(16, 185, 129); // Emerald
    doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 1, 1, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(255, 255, 255);
    doc.text('ALCANÇADO', badgeX + badgeW / 2, badgeY + 4, { align: 'center' });
    doc.setFontSize(5.5);
    doc.text('Aprovado (≥ 80%)', badgeX + badgeW / 2, badgeY + 7.5, { align: 'center' });
  } else {
    doc.setFillColor(225, 29, 72); // Rose/Red
    doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 1, 1, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(255, 255, 255);
    doc.text('NÃO ALCANÇADO', badgeX + badgeW / 2, badgeY + 4, { align: 'center' });
    doc.setFontSize(5.5);
    doc.text('Reavaliação (< 80%)', badgeX + badgeW / 2, badgeY + 7.5, { align: 'center' });
  }

  // Divisor Interno
  doc.setDrawColor(51, 65, 85);
  doc.setLineWidth(0.2);
  doc.line(margin + 4, cursorY + 15, margin + contentWidth - 4, cursorY + 15);

  // Dados do Aluno e Módulo
  const studentName = attempt.technicianName || 'Técnico Autorizado';
  printSafeText(`Aluno: ${studentName}`, margin + 4, cursorY + 19, 110, 6.5, 'normal', [226, 232, 240]);
  printSafeText(`Módulo: ${attempt.moduleTitle}`, margin + 4, cursorY + 23.5, 110, 6.5, 'normal', [203, 213, 225]);

  const attemptLabel = attempt.attemptNumber === 1 ? '1ª Avaliação Oficial' : `${attempt.attemptNumber - 1}ª Reavaliação`;
  printSafeText(`Tentativa: ${attemptLabel}`, margin + 118, cursorY + 19, 60, 6.5, 'normal', [226, 232, 240]);
  printSafeText(`Data: ${attempt.date}`, margin + 118, cursorY + 23.5, 60, 6.5, 'normal', [203, 213, 225]);

  cursorY += 30;

  // ==========================================================================
  // 2. BARRA DE TÍTULO DA AULA E REFERÊNCIA TÉCNICA (Altura: 6.5mm)
  // ==========================================================================
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.2);
  doc.roundedRect(margin, cursorY, contentWidth, 6.5, 1, 1, 'FD');

  printSafeText(`Aula: ${attempt.lessonTitle}`, margin + 3, cursorY + 4.2, 125, 6.8, 'bold', [15, 23, 42]);
  
  doc.setFont('courier', 'bold');
  doc.setFontSize(6.2);
  doc.setTextColor(2, 132, 199);
  doc.text(`Norma: ${attempt.norma || 'IEC 60364'} | Ref: ${attempt.authCode}`, margin + contentWidth - 3, cursorY + 4.2, { align: 'right' });

  cursorY += 8;

  // ==========================================================================
  // 3. ESTRUTURA VERTICAL DAS QUESTÕES (RESPOSTAS E GUIA INTEIRAIS)
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

    // Indicador Lateral de Acerto / Erro
    doc.setFillColor(isAnswerCorrect ? 16 : 225, isAnswerCorrect ? 185 : 29, isAnswerCorrect ? 129 : 72);
    doc.roundedRect(margin, cursorY, 2.5, cardHeight, 0.8, 0.8, 'F');

    // Cabeçalho da Questão + Badge Status
    printSafeText(`Questão ${idx + 1} de ${totalQuestions}`, margin + 5, cursorY + 4.2, 80, 7.2, 'bold', [30, 41, 59]);

    const statusW = 22;
    const statusH = 4;
    const statusX = margin + contentWidth - statusW - 3;
    const statusY = cursorY + 1.6;

    doc.setFillColor(isAnswerCorrect ? 16 : 225, isAnswerCorrect ? 185 : 29, isAnswerCorrect ? 129 : 72);
    doc.roundedRect(statusX, statusY, statusW, statusH, 0.8, 0.8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5.8);
    doc.setTextColor(255, 255, 255);
    doc.text(isAnswerCorrect ? 'CORRETO ✓' : 'INCORRETO ✗', statusX + statusW / 2, statusY + 2.8, { align: 'center' });

    // Enunciado
    printSafeText(q.question, margin + 5, cursorY + 8.5, contentWidth - 32, 6.8, 'normal', [15, 23, 42], 2);

    // Bloco de Respostas: "Sua Resposta:" vs "Guia:" (Textos Completos)
    const respY = cursorY + 18;
    const halfWidth = (contentWidth - 12) / 2;

    // Resposta do Aluno (Completa)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.2);
    doc.setTextColor(71, 85, 105);
    doc.text('Sua Resposta:', margin + 5, respY);

    const studentText = studentLetter ? `[${studentLetter}] ${studentOpt?.text || ''}` : '(Não respondida)';
    const studentColor: [number, number, number] = isAnswerCorrect ? [16, 185, 129] : [225, 29, 72];
    printSafeText(studentText, margin + 5, respY + 3.5, halfWidth, 6, 'bold', studentColor, 2);

    // Guia Oficial (Resposta Correta Completa)
    const guiaX = margin + 6 + halfWidth;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.2);
    doc.setTextColor(5, 150, 105);
    doc.text('Guia Oficial:', guiaX, respY);

    const correctText = `[${correctLetter}] ${correctOpt?.text || ''}`;
    printSafeText(correctText, guiaX, respY + 3.5, halfWidth, 6, 'normal', [4, 120, 87], 2);

    // Explicação / Fundamentação Técnica no Rodapé do Card
    const expText = q.explanation || q.keyTakeaway || 'Conformidade com os padrões normativos da IEC.';
    printSafeText(`Fundamentação: ${expText}`, margin + 5, cursorY + 31.5, contentWidth - 10, 5.5, 'italic', [100, 116, 139], 1);

    cursorY += cardHeight + cardGap;
  });

  cursorY += 1;

  // ==========================================================================
  // 4. PAINEL DE RESUMO E CHAVE DE SEGURANÇA (Altura: 24mm)
  // ==========================================================================
  doc.setFillColor(15, 23, 42);
  doc.roundedRect(margin, cursorY, contentWidth, 24, 1.5, 1.5, 'F');

  printSafeText('RESUMO DE DESEMPENHO E APROVEITAMENTO', margin + 4, cursorY + 5.5, 120, 7.5, 'bold', [56, 189, 248]);
  printSafeText(
    `Resultado: ${correctCount} de ${totalQuestions} acertos (${finalScorePercent}%) • Exigência IEC: 80%`,
    margin + 4,
    cursorY + 10.5,
    120,
    6.8,
    'normal',
    [241, 245, 249]
  );

  doc.setFont('courier', 'bold');
  doc.setFontSize(6.2);
  doc.setTextColor(52, 211, 153);
  doc.text(`Autenticação: ${attempt.authCode}`, margin + 4, cursorY + 15);

  // Quadrado de Pontuação
  const scoreBoxW = 34;
  const scoreBoxH = 16;
  const scoreBoxX = margin + contentWidth - scoreBoxW - 4;
  const scoreBoxY = cursorY + 4;

  doc.setFillColor(30, 41, 59);
  doc.setDrawColor(51, 65, 85);
  doc.setLineWidth(0.2);
  doc.roundedRect(scoreBoxX, scoreBoxY, scoreBoxW, scoreBoxH, 1, 1, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.text(`${finalScorePercent}%`, scoreBoxX + scoreBoxW / 2, scoreBoxY + 7.5, { align: 'center' });

  doc.setFontSize(6);
  doc.setTextColor(isPassed ? 52 : 244, isPassed ? 211 : 63, isPassed ? 153 : 94);
  doc.text(isPassed ? 'ALCANÇADO' : 'NÃO ALCANÇADO', scoreBoxX + scoreBoxW / 2, scoreBoxY + 12.5, { align: 'center' });

  // Rodapé Informativo
  printSafeText(
    'Documento emitido eletronicamente pela Plataforma TécnicaMZ Pro. Validez acadêmica e técnica nos termos do regulamento.',
    margin + 4,
    cursorY + 20.5,
    120,
    5.2,
    'italic',
    [148, 163, 184]
  );

  // Nomeação e Download do Arquivo
  const sanitizedTitle = (attempt.lessonTitle || 'Avaliacao')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .substring(0, 25);
  doc.save(`TecnicaMZ_${sanitizedTitle}_T${attempt.attemptNumber}.pdf`);
}
