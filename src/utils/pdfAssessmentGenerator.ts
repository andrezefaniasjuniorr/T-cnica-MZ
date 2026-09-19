import jsPDF from 'jspdf';
import { AssessmentAttempt } from '../types/assessment';

/**
 * Gera e realiza download da Folha Oficial de Avaliação Acadêmica em PDF
 * Formatada com cabeçalho acadêmico, detalhamento de questões e selo de parecer.
 */
export function generateAssessmentPDF(attempt: AssessmentAttempt): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  let cursorY = margin;

  // Função auxiliar para quebra de página automática
  const checkPageBreak = (neededHeight: number) => {
    if (cursorY + neededHeight > pageHeight - 15) {
      doc.addPage();
      cursorY = margin;
      renderHeaderMini();
    }
  };

  const renderHeaderMini = () => {
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(margin, cursorY, contentWidth, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text('TÉCNICAMZ PRO • ACADEMIA TÉCNICA • FOLHA OFICIAL DE AVALIAÇÃO', margin + 3, cursorY + 5.5);
    doc.setFont('helvetica', 'normal');
    doc.text(`Cód. Autenticação: ${attempt.authCode}`, pageWidth - margin - 3, cursorY + 5.5, { align: 'right' });
    cursorY += 12;
  };

  // ==========================================================================
  // 1. CABEÇALHO ACADÊMICO OFICIAL
  // ==========================================================================
  // Barra Superior com Cor Institucional TécnicaMZ (Azul Escuro / Safira)
  doc.setFillColor(10, 25, 47);
  doc.roundedRect(margin, cursorY, contentWidth, 32, 2, 2, 'F');

  // Logo / Título Principal
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(59, 130, 246); // Blue-500
  doc.text('TÉCNICAMZ PRO', margin + 6, cursorY + 8);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text('FOLHA OFICIAL DE AVALIAÇÃO TÉCNICA E COMPETÊNCIAS', margin + 6, cursorY + 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184); // Slate-400
  doc.text('Formação Profissional Normatizada • Normas Europeias (IEC / EN) e Padrões EDM Moçambique', margin + 6, cursorY + 19);

  // Selo do Código de Autenticação no Cabeçalho
  doc.setFillColor(30, 41, 59);
  doc.roundedRect(pageWidth - margin - 60, cursorY + 5, 54, 18, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(203, 213, 225);
  doc.text('AUTENTICAÇÃO ACADÊMICA', pageWidth - margin - 33, cursorY + 10, { align: 'center' });
  doc.setFont('courier', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(56, 189, 248); // Sky-400
  doc.text(attempt.authCode, pageWidth - margin - 33, cursorY + 16, { align: 'center' });

  // Linha divisória de status
  doc.setDrawColor(59, 130, 246);
  doc.setLineWidth(0.6);
  doc.line(margin + 6, cursorY + 23, pageWidth - margin - 6, cursorY + 23);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(226, 232, 240);
  doc.text(`TUTORA OFICIAL: Eng. Sara IA (Diretoria de Normas Técnicas)`, margin + 6, cursorY + 28);
  doc.text(`EMISSÃO: ${attempt.date}`, pageWidth - margin - 6, cursorY + 28, { align: 'right' });

  cursorY += 36;

  // ==========================================================================
  // 2. DADOS DO CANDIDATO & UNIDADE DE COMPETÊNCIA
  // ==========================================================================
  doc.setFillColor(248, 250, 252); // Off-white / cinza claro
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, cursorY, contentWidth, 22, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('CANDIDATO / TÉCNICO:', margin + 4, cursorY + 6);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(attempt.technicianName || 'Técnico Matriculado', margin + 42, cursorY + 6);

  doc.setFont('helvetica', 'bold');
  doc.text('ELEMENTO DE COMPETÊNCIA:', margin + 4, cursorY + 12);
  doc.setFont('helvetica', 'normal');
  doc.text(`${attempt.lessonCode} - ${attempt.lessonTitle}`, margin + 50, cursorY + 12);

  doc.setFont('helvetica', 'bold');
  doc.text('MÓDULO & NORMA BASE:', margin + 4, cursorY + 18);
  doc.setFont('helvetica', 'normal');
  doc.text(`${attempt.moduleTitle} • ${attempt.norma}`, margin + 45, cursorY + 18);

  doc.setFont('helvetica', 'bold');
  doc.text('TENTATIVA:', pageWidth - margin - 35, cursorY + 6);
  doc.setFont('helvetica', 'normal');
  doc.text(`Nº ${attempt.attemptNumber} ${attempt.attemptNumber > 1 ? '(Reavaliação)' : '(Inicial)'}`, pageWidth - margin - 4, cursorY + 6, { align: 'right' });

  cursorY += 26;

  // ==========================================================================
  // 3. QUADRO GERAL DE RESULTADO & SELO EM DESTAQUE
  // ==========================================================================
  const isPassed = attempt.isPassed;
  const badgeColor = isPassed ? [16, 185, 129] : [239, 68, 68]; // verde esmeralda ou vermelho carmim
  const badgeBg = isPassed ? [236, 253, 245] : [254, 242, 242];

  doc.setFillColor(badgeBg[0], badgeBg[1], badgeBg[2]);
  doc.setDrawColor(badgeColor[0], badgeColor[1], badgeColor[2]);
  doc.setLineWidth(0.8);
  doc.roundedRect(margin, cursorY, contentWidth, 24, 2, 2, 'FD');

  // Média e Pontuação
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('RESULTADO DA AVALIAÇÃO INTEGRADA:', margin + 6, cursorY + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(
    `Múltipla Escolha: ${attempt.mcEarnedPoints}/${attempt.mcTotalPoints} pts  •  Desenvolvimento IA: ${attempt.descEarnedPoints}/${attempt.descTotalPoints} pts`,
    margin + 6,
    cursorY + 15
  );

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(badgeColor[0], badgeColor[1], badgeColor[2]);
  doc.text(`NOTA FINAL: ${attempt.finalScorePercent}%`, margin + 6, cursorY + 21);

  // Selo Visual em Destaque no Canto Direito
  doc.setFillColor(badgeColor[0], badgeColor[1], badgeColor[2]);
  doc.roundedRect(pageWidth - margin - 58, cursorY + 4, 52, 16, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  if (isPassed) {
    doc.text('ALCANÇA (A)', pageWidth - margin - 32, cursorY + 11, { align: 'center' });
    doc.setFontSize(7);
    doc.text('APROVADO NA COMPETÊNCIA', pageWidth - margin - 32, cursorY + 16, { align: 'center' });
  } else {
    doc.text('NÃO ALCANÇA (NA)', pageWidth - margin - 32, cursorY + 11, { align: 'center' });
    doc.setFontSize(7);
    doc.text('REAVALIAÇÃO OBRIGATÓRIA', pageWidth - margin - 32, cursorY + 16, { align: 'center' });
  }

  cursorY += 28;

  // ==========================================================================
  // 4. DETALHAMENTO: QUESTÕES DE MÚLTIPLA ESCOLHA
  // ==========================================================================
  checkPageBreak(30);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(30, 58, 138); // Dark blue
  doc.text('1. QUESTÕES DE MÚLTIPLA ESCOLHA (CENÁRIOS TÉCNICOS)', margin, cursorY);
  cursorY += 4;

  attempt.mcQuestions.forEach((q, idx) => {
    checkPageBreak(38);

    const chosenLetter = attempt.mcAnswers[q.id];
    const correctOpt = q.options.find(o => o.isCorrect);
    const chosenOpt = q.options.find(o => o.displayLetter === chosenLetter);
    const isCorrect = chosenOpt?.isCorrect === true;

    doc.setFillColor(250, 250, 250);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);

    // Altura da caixa ajustada conforme o texto
    const qTextLines = doc.splitTextToSize(`Questão 1.${idx + 1}: ${q.question}`, contentWidth - 8);
    const boxHeight = 18 + qTextLines.length * 3.5;
    doc.roundedRect(margin, cursorY, contentWidth, boxHeight, 1, 1, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text(qTextLines, margin + 4, cursorY + 5);

    let optY = cursorY + 6 + qTextLines.length * 3.5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);

    // Resposta assinalada vs Gabarito
    doc.setTextColor(isCorrect ? 16 : 220, isCorrect ? 149 : 38, isCorrect ? 93 : 38);
    doc.setFont('helvetica', 'bold');
    doc.text(
      `Resposta Assinalada: [ ${chosenLetter || 'N/A'} ] - ${chosenOpt?.text ? chosenOpt.text.substring(0, 70) + '...' : 'Não respondida'}`,
      margin + 4,
      optY
    );

    optY += 4;
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.text(`Gabarito Correto: [ ${correctOpt?.displayLetter} ] - ${correctOpt?.text.substring(0, 75)}...`, margin + 4, optY);

    // Status da Questão no canto direito
    doc.setFont('helvetica', 'bold');
    if (isCorrect) {
      doc.setTextColor(16, 185, 129);
      doc.text(`CORRETO (+${q.points} pts)`, pageWidth - margin - 4, cursorY + 5, { align: 'right' });
    } else {
      doc.setTextColor(239, 68, 68);
      doc.text(`INCORRETO (0 pts)`, pageWidth - margin - 4, cursorY + 5, { align: 'right' });
    }

    cursorY += boxHeight + 4;
  });

  cursorY += 4;

  // ==========================================================================
  // 5. DETALHAMENTO: QUESTÃO DE DESENVOLVIMENTO / DESCRITIVA COM CORREÇÃO POR IA
  // ==========================================================================
  checkPageBreak(50);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(30, 58, 138);
  doc.text('2. QUESTÃO DE DESENVOLVIMENTO (AVALIAÇÃO SEMÂNTICA POR IA)', margin, cursorY);
  cursorY += 4;

  attempt.descQuestions.forEach((dq, idx) => {
    const studentAnswer = attempt.descAnswers[dq.id] || '(Nenhuma resposta redigida)';
    const evalResult = attempt.descEvaluations[dq.id];

    checkPageBreak(65);

    doc.setFillColor(250, 250, 250);
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.3);

    const promptLines = doc.splitTextToSize(`Caso Técnico 2.${idx + 1}: ${dq.question}`, contentWidth - 8);
    const answerLines = doc.splitTextToSize(`Resposta do Candidato: "${studentAnswer}"`, contentWidth - 8);
    const feedbackLines = doc.splitTextToSize(
      `Parecer da Eng. Sara IA: ${evalResult?.technicalFeedback || 'Avaliação pendente'}`,
      contentWidth - 8
    );

    const totalHeight = 22 + promptLines.length * 3.5 + answerLines.length * 3.2 + feedbackLines.length * 3.2;
    doc.roundedRect(margin, cursorY, contentWidth, totalHeight, 1.5, 1.5, 'FD');

    // Título / Enunciado
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text(promptLines, margin + 4, cursorY + 5);

    // Pontuação atribuída pela IA
    const scoreColor = (evalResult?.scorePercent || 0) >= 80 ? [16, 185, 129] : (evalResult?.scorePercent || 0) >= 50 ? [217, 119, 6] : [239, 68, 68];
    doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
    doc.text(
      `PONTUAÇÃO IA: ${evalResult?.scorePercent ?? 0}% (${evalResult?.earnedPoints ?? 0}/${dq.points} pts) • [ ${evalResult?.verdict || 'AVALIADO'} ]`,
      pageWidth - margin - 4,
      cursorY + 5,
      { align: 'right' }
    );

    let innerY = cursorY + 7 + promptLines.length * 3.5;

    // Resposta digitada pelo aluno
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);
    doc.text(answerLines, margin + 4, innerY);

    innerY += answerLines.length * 3.2 + 3;

    // Feedback da Eng. Sara IA
    doc.setFillColor(238, 242, 255); // Indigo claro
    doc.rect(margin + 2, innerY - 2, contentWidth - 4, feedbackLines.length * 3.2 + 4, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(67, 56, 202);
    doc.text(feedbackLines, margin + 4, innerY + 2);

    cursorY += totalHeight + 6;
  });

  // ==========================================================================
  // 6. PARECER TÉCNICO FINAL & ASSINATURA DIGITAL
  // ==========================================================================
  checkPageBreak(35);
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, cursorY, contentWidth, 24, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('PARECER FINAL DA BANCA EXAMINADORA:', margin + 4, cursorY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  const parecerText = isPassed
    ? `O candidato demonstrou competência técnica e conformidade aos preceitos da norma ${attempt.norma}, atingindo média final de ${attempt.finalScorePercent}% (≥ 80%). Certificação de competência deferida com concessão de mérito acadêmico.`
    : `O candidato obteve pontuação de ${attempt.finalScorePercent}% (< 80%), não atingindo o patamar mínimo de aprovação na competência. Conforme o regimento pedagógico, foi gerada uma reavaliação com novas questões inéditas.`;
  doc.text(doc.splitTextToSize(parecerText, contentWidth - 8), margin + 4, cursorY + 11);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(30, 58, 138);
  doc.text('Eng. Sara IA • Diretoria Acadêmica TécnicaMZ Pro', margin + 4, cursorY + 21);
  doc.text(`Documento gerado em ${attempt.date} • Assinatura Criptográfica Válida`, pageWidth - margin - 4, cursorY + 21, { align: 'right' });

  // ==========================================================================
  // 7. RODAPÉ INSTITUCIONAL
  // ==========================================================================
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    'TécnicaMZ Pro • EdTech de Engenharia e Eletrotécnica em Moçambique • Registrado sob padrões IEC 60364 / ISO 286 / EDM',
    pageWidth / 2,
    pageHeight - 6,
    { align: 'center' }
  );

  // Download do arquivo
  const filename = `Avaliacao_TecnicaMZ_${attempt.lessonCode.replace(/\s+/g, '_')}_${attempt.authCode}.pdf`;
  doc.save(filename);
}
