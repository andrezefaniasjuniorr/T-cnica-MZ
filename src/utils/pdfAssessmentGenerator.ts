import jsPDF from 'jspdf';
import { AssessmentAttempt } from '../types/assessment';

/**
 * Gerador de Folha Oficial de Avaliação em PDF (Layout Vertical Compacto - A4).
 * Estrutura 100% vertical em cards para eliminar tabelas horizontais espremidas,
 * textos sobrepostos e palavras esticadas.
 * Rigorosamente contido em exatamente 1 PÁGINA A4 (210mm x 297mm).
 */
export function generateAssessmentPDF(attempt: AssessmentAttempt): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const margin = 14;
  const contentWidth = pageWidth - margin * 2; // 182mm
  let cursorY = 11;

  const isPassed = attempt.finalScorePercent >= 80;
  const mcQuestions = attempt.mcQuestions || [];
  const totalQuestions = mcQuestions.length || 5;

  // Contagem precisa de acertos
  let correctCount = 0;
  mcQuestions.forEach(q => {
    const studentChoice = attempt.mcAnswers[q.id];
    const correctOpt = q.options.find(o => o.isCorrect);
    if (studentChoice && correctOpt && studentChoice === correctOpt.displayLetter) {
      correctCount++;
    }
  });

  const finalScorePercent = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : attempt.finalScorePercent;

  // ==========================================================================
  // 1. CABEÇALHO COMPACTO VERTICAL (Height: 32mm)
  // ==========================================================================
  doc.setFillColor(10, 25, 47); // Dark Navy #0A192F
  doc.roundedRect(margin, cursorY, contentWidth, 32, 2, 2, 'F');

  // Marca TécnicaMZ Pro
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12.5);
  doc.setTextColor(56, 189, 248); // Sky Blue #38BDF8
  doc.text('TÉCNICAMZ PRO', margin + 5, cursorY + 6.5);

  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('FOLHA OFICIAL DE AVALIAÇÃO DE COMPETÊNCIAS TÉCNICAS', margin + 5, cursorY + 11.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184); // Slate 400
  doc.text('Padrão Normativo Europeu IEC / EN • Tutoria Oficial: Eng. Sara IA', margin + 5, cursorY + 15.5);

  // Badge em Destaque no Canto Superior Direito (ALCANÇADO / NÃO ALCANÇADO)
  const badgeW = 44;
  const badgeH = 11;
  const badgeX = margin + contentWidth - badgeW - 4;
  const badgeY = cursorY + 4;

  if (isPassed) {
    doc.setFillColor(16, 185, 129); // Emerald 500
    doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 1.5, 1.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(255, 255, 255);
    doc.text('ALCANÇADO', badgeX + badgeW / 2, badgeY + 4.5, { align: 'center' });
    doc.setFontSize(6);
    doc.text('Critério Aprovado (≥ 80%)', badgeX + badgeW / 2, badgeY + 8.5, { align: 'center' });
  } else {
    doc.setFillColor(225, 29, 72); // Rose 600
    doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 1.5, 1.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text('NÃO ALCANÇADO', badgeX + badgeW / 2, badgeY + 4.5, { align: 'center' });
    doc.setFontSize(6);
    doc.text('Reavaliação Necessária (< 80%)', badgeX + badgeW / 2, badgeY + 8.5, { align: 'center' });
  }

  // Linha sutil de divisão no cabeçalho
  doc.setDrawColor(30, 41, 59);
  doc.setLineWidth(0.3);
  doc.line(margin + 5, cursorY + 19, margin + contentWidth - 5, cursorY + 19);

  // Metadados do Aluno e Exame
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(203, 213, 225); // Slate 300
  const studentNameStr = attempt.technicianName || 'Técnico Autorizado';
  doc.text(`Aluno: ${studentNameStr}`, margin + 5, cursorY + 24);

  const cleanModule = attempt.moduleTitle.length > 55 ? attempt.moduleTitle.substring(0, 52) + '...' : attempt.moduleTitle;
  doc.text(`Módulo: ${cleanModule}`, margin + 5, cursorY + 28.5);

  const attemptLabel =
    attempt.attemptNumber === 1
      ? '1ª Avaliação Oficial'
      : attempt.attemptNumber === 2
      ? '1ª Reavaliação'
      : '2ª Reavaliação (Final)';
  doc.text(`Tentativa: ${attemptLabel}`, margin + contentWidth - 62, cursorY + 24);
  doc.text(`Data: ${attempt.date}`, margin + contentWidth - 62, cursorY + 28.5);

  cursorY += 34.5;

  // ==========================================================================
  // 2. FAIXA DE IDENTIFICAÇÃO DA LIÇÃO & NORMA (Height: 7mm)
  // ==========================================================================
  doc.setFillColor(241, 245, 249); // Slate 100
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, cursorY, contentWidth, 7, 1, 1, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  const cleanLesson = attempt.lessonTitle.length > 70 ? attempt.lessonTitle.substring(0, 68) + '...' : attempt.lessonTitle;
  doc.text(`Aula: ${cleanLesson}`, margin + 3.5, cursorY + 4.8);

  doc.setFont('courier', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(2, 132, 199);
  doc.text(`Ref: ${attempt.norma || 'IEC 60364'} • ID: ${attempt.authCode}`, margin + contentWidth - 3.5, cursorY + 4.8, { align: 'right' });

  cursorY += 9;

  // ==========================================================================
  // 3. LISTA VERTICAL DE QUESTÕES (CARD LAYOUT VERTICAL) (Height: ~170mm)
  // 5 Cards Verticais: Sem colunas espremidas, sem palavras quebradas
  // ==========================================================================
  const cardHeight = 33.5;
  const cardGap = 2.2;

  mcQuestions.forEach((q, idx) => {
    const studentLetter = attempt.mcAnswers[q.id];
    const correctOpt = q.options.find(o => o.isCorrect);
    const correctLetter = correctOpt?.displayLetter || 'A';
    const isAnswerCorrect = studentLetter === correctLetter;

    const studentOpt = q.options.find(o => o.displayLetter === studentLetter);

    // Card background
    doc.setFillColor(248, 250, 252); // Slate 50
    doc.setDrawColor(226, 232, 240); // Slate 200
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, cursorY, contentWidth, cardHeight, 1.5, 1.5, 'FD');

    // Faixa colorida na lateral esquerda (3mm) indicando Acerto ou Erro
    doc.setFillColor(isAnswerCorrect ? 16 : 239, isAnswerCorrect ? 185 : 68, isAnswerCorrect ? 129 : 68);
    doc.roundedRect(margin, cursorY, 3, cardHeight, 1, 1, 'F');

    // Linha Superior do Card: [Q#] e Badge de Status
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);
    doc.text(`Questão ${idx + 1} de ${totalQuestions}`, margin + 5.5, cursorY + 4.8);

    // Badge Status [CORRETO ✓] ou [INCORRETO ✗]
    const statusW = 24;
    const statusH = 4.8;
    const statusX = margin + contentWidth - statusW - 3;
    const statusY = cursorY + 2.2;

    if (isAnswerCorrect) {
      doc.setFillColor(16, 185, 129); // Emerald
      doc.roundedRect(statusX, statusY, statusW, statusH, 1, 1, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor(255, 255, 255);
      doc.text('CORRETO ✓', statusX + statusW / 2, statusY + 3.4, { align: 'center' });
    } else {
      doc.setFillColor(225, 29, 72); // Rose
      doc.roundedRect(statusX, statusY, statusW, statusH, 1, 1, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor(255, 255, 255);
      doc.text('INCORRETO ✗', statusX + statusW / 2, statusY + 3.4, { align: 'center' });
    }

    // Enunciado da Questão em 1 a 2 linhas (fonte 8.5pt limpa, com largura de 145mm)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42); // Slate 900
    const qLines = doc.splitTextToSize(q.question, contentWidth - 36);
    const qLinesTrimmed = qLines.slice(0, 2);
    doc.text(qLinesTrimmed, margin + 5.5, cursorY + 9.5);

    // Linha intermediária: Resposta do Aluno vs Gabarito Oficial (Espaço Amplo Horizontal)
    const ansY = cursorY + 19;

    // "Sua Resposta:"
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.2);
    doc.setTextColor(71, 85, 105);
    doc.text('Sua Resposta:', margin + 5.5, ansY);

    doc.setFont('helvetica', 'bold');
    if (!studentLetter) {
      doc.setTextColor(148, 163, 184);
      doc.text('(Não respondida)', margin + 25, ansY);
    } else {
      doc.setTextColor(isAnswerCorrect ? 16 : 225, isAnswerCorrect ? 185 : 29, isAnswerCorrect ? 129 : 72);
      const studentTxt = studentOpt ? studentOpt.text : '';
      const cleanStudentTxt = studentTxt.length > 48 ? studentTxt.substring(0, 46) + '...' : studentTxt;
      doc.text(`[${studentLetter}] ${cleanStudentTxt}`, margin + 25, ansY);
    }

    // "Gabarito Oficial:"
    const gabX = margin + 102;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.2);
    doc.setTextColor(5, 150, 105); // Emerald 600
    doc.text('Gabarito:', gabX, ansY);

    const correctTxt = correctOpt ? correctOpt.text : '';
    const cleanCorrectTxt = correctTxt.length > 46 ? correctTxt.substring(0, 44) + '...' : correctTxt;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(4, 120, 87);
    doc.text(`[${correctLetter}] ${cleanCorrectTxt}`, gabX + 13, ansY);

    // Linha Inferior: Fundamentação Técnica e Normativa
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(6.2);
    doc.setTextColor(100, 116, 139); // Slate 500
    const explanationText = q.explanation || q.keyTakeaway || '';
    const cleanExp = explanationText.length > 130 ? explanationText.substring(0, 127) + '...' : explanationText;
    doc.text(`Norma: ${q.norma || attempt.norma || 'IEC'} • Justificativa: ${cleanExp}`, margin + 5.5, cursorY + 28);

    cursorY += cardHeight + cardGap;
  });

  cursorY += 1;

  // ==========================================================================
  // 4. BLOCO DE RESUMO E VALIDAÇÃO NO RODAPÉ (Height: 28mm)
  // Total de Acertos, Nota Final (%) e Código de Verificação
  // ==========================================================================
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.roundedRect(margin, cursorY, contentWidth, 28, 2, 2, 'F');

  // Coluna Esquerda: Estatísticas e Autenticidade
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(56, 189, 248); // Sky Blue
  doc.text('RESUMO DE DESEMPENHO E APROVEITAMENTO', margin + 5, cursorY + 6.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(241, 245, 249);
  doc.text(
    `Total de Acertos: ${correctCount} de ${totalQuestions} questões (${finalScorePercent}%) • Critério: Mínimo 80% (Padrão IEC / EDM)`,
    margin + 5,
    cursorY + 12
  );

  doc.setFont('courier', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(52, 211, 153); // Emerald 400
  doc.text(`Código de Autenticação Oficial: ${attempt.authCode}`, margin + 5, cursorY + 17);

  // Coluna Direita: Box de Pontuação em Destaque
  const scoreBoxW = 40;
  const scoreBoxH = 18;
  const scoreBoxX = margin + contentWidth - scoreBoxW - 4;
  const scoreBoxY = cursorY + 4;

  doc.setFillColor(30, 41, 59); // Slate 800
  doc.setDrawColor(51, 65, 85);
  doc.setLineWidth(0.3);
  doc.roundedRect(scoreBoxX, scoreBoxY, scoreBoxW, scoreBoxH, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text(`${finalScorePercent}%`, scoreBoxX + scoreBoxW / 2, scoreBoxY + 8, { align: 'center' });

  doc.setFontSize(7);
  doc.setTextColor(isPassed ? 52 : 244, isPassed ? 211 : 63, isPassed ? 153 : 94);
  doc.text(isPassed ? 'ALCANÇADO' : 'NÃO ALCANÇADO', scoreBoxX + scoreBoxW / 2, scoreBoxY + 13.5, { align: 'center' });

  // Assinatura de Certificação
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(5.8);
  doc.setTextColor(148, 163, 184);
  doc.text(
    'Documento emitido eletronicamente pela Plataforma TécnicaMZ Pro. Reconhecido para fins de histórico e comprovação de proficiência.',
    margin + 5,
    cursorY + 23.5
  );

  // Nome do arquivo PDF
  const sanitizedTitle = (attempt.lessonTitle || 'Avaliacao')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .substring(0, 30);
  const fileName = `TecnicaMZ_${sanitizedTitle}_Tentativa${attempt.attemptNumber}.pdf`;

  // Salvar PDF
  doc.save(fileName);
}
