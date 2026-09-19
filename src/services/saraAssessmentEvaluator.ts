import {
  AssessmentDescriptiveQuestion,
  DescriptiveEvaluationResult
} from '../types/assessment';

/**
 * Avaliador de Respostas Descritivas Técnicas pela Eng. Sara IA.
 * Combina chamada ao modelo Gemini via endpoint de backend com algoritmo de
 * avaliação de contingência (NLP técnico com análise de termos-chave IEC/ISO).
 */
export async function evaluateDescriptiveAnswer(
  question: AssessmentDescriptiveQuestion,
  studentAnswer: string
): Promise<DescriptiveEvaluationResult> {
  const cleanAnswer = (studentAnswer || '').trim();

  // Resposta em branco ou irrelevante (< 10 caracteres)
  if (cleanAnswer.length < 10) {
    return {
      scorePercent: 0,
      verdict: 'NÃO_ALCANÇA',
      matchedKeywords: [],
      missingPoints: question.expectedKeywords,
      technicalFeedback: 'Nenhuma resposta técnica substancial foi apresentada. Para obter pontuação em questões de desenvolvimento da Academia TécnicaMZ, é necessário descrever o procedimento técnico com termos normativos fundamentados.',
      normativeAlignment: `Ausência de fundamentação na norma ${question.norma}.`,
      earnedPoints: 0
    };
  }

  // Tentativa de avaliação via backend com Gemini
  try {
    const response = await fetch('/api/sara/evaluate-assessment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        question: question.question,
        contextScenario: question.contextScenario,
        studentAnswer: cleanAnswer,
        expectedKeywords: question.expectedKeywords,
        norma: question.norma,
        guidelineAnswer: question.guidelineAnswer,
        rubricCriteria: question.rubricCriteria
      })
    });

    if (response.ok) {
      const data = await response.json();
      if (data && typeof data.scorePercent === 'number') {
        const scorePercent = Math.max(0, Math.min(100, Math.round(data.scorePercent)));
        const earnedPoints = Math.round((scorePercent / 100) * question.points);

        let verdict: 'ALCANÇA' | 'PARCIALMENTE_ALCANÇA' | 'NÃO_ALCANÇA' = 'NÃO_ALCANÇA';
        if (scorePercent >= 80) verdict = 'ALCANÇA';
        else if (scorePercent >= 45) verdict = 'PARCIALMENTE_ALCANÇA';

        return {
          scorePercent,
          verdict,
          matchedKeywords: Array.isArray(data.matchedKeywords) ? data.matchedKeywords : [],
          missingPoints: Array.isArray(data.missingPoints) ? data.missingPoints : [],
          technicalFeedback: data.technicalFeedback || 'Avaliação processada com sucesso pela Eng. Sara IA.',
          normativeAlignment: data.normativeAlignment || `Aderência à norma ${question.norma}.`,
          earnedPoints
        };
      }
    }
  } catch (err) {
    console.warn('[Avaliador Sara IA] Falha de conexão com backend. Utilizando motor de contingência local:', err);
  }

  // Motor de Contingência Local (NLP Eletromecânico de Alta Precisão)
  return fallbackLocalEvaluation(question, cleanAnswer);
}

/**
 * Motor local de contingência para correção descritiva baseado em termos-chave,
 * densidade semântica técnica, citação normativa e procedimento prático.
 */
function fallbackLocalEvaluation(
  question: AssessmentDescriptiveQuestion,
  answer: string
): DescriptiveEvaluationResult {
  const normalize = (txt: string) =>
    txt
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

  const normalizedAnswer = normalize(answer);
  const words = normalizedAnswer.split(/\s+/).filter(w => w.length > 2);

  const matchedKeywords: string[] = [];
  const missingPoints: string[] = [];

  // Verificação de cada termo-chave esperado
  question.expectedKeywords.forEach(kw => {
    const normKw = normalize(kw);
    // Checa termo exato ou partes relevantes
    const parts = normKw.split(/\s+/);
    const isMatched = parts.every(p => normalizedAnswer.includes(p)) || normalizedAnswer.includes(normKw);
    if (isMatched) {
      matchedKeywords.push(kw);
    } else {
      missingPoints.push(kw);
    }
  });

  const keywordRatio = question.expectedKeywords.length > 0
    ? matchedKeywords.length / question.expectedKeywords.length
    : 0.5;

  // Verificação de termos de metrologia / engenharia comuns
  const technicalTokens = [
    'medir', 'multimetro', 'tensao', 'corrente', 'resistencia', 'isolamento',
    'norma', 'iec', 'iso', 'edm', 'curto', 'sobrecarga', 'disjuntor', 'rele',
    'queda', 'calibrado', 'seguranca', 'desenergizar', 'bloqueio', 'loto',
    'torque', 'relogio comparador', 'c3', 'bep', 'dps', 'terra', 'aterramento'
  ];

  let technicalTokensCount = 0;
  technicalTokens.forEach(token => {
    if (normalizedAnswer.includes(token)) technicalTokensCount++;
  });

  // Cálculo da pontuação proporcional
  // 50% baseado na cobertura dos termos-chave da rubrica
  // 30% baseado na riqueza técnica e vocabulário de engenharia
  // 20% baseado na profundidade da explicação (extensão mínima de 25 palavras)
  const keywordScore = keywordRatio * 50;
  const tokenScore = Math.min(30, (technicalTokensCount / 4) * 30);
  const depthScore = Math.min(20, (words.length / 30) * 20);

  let totalScore = Math.round(keywordScore + tokenScore + depthScore);

  // Bonificação se acertou a maioria dos termos-chave obrigatórios
  if (keywordRatio >= 0.75 && words.length >= 25) {
    totalScore = Math.max(totalScore, 85);
  } else if (keywordRatio >= 0.5 && words.length >= 20) {
    totalScore = Math.max(totalScore, 65);
  }

  // Trava de segurança: respostas muito curtas (< 15 palavras) não podem tirar nota máxima
  if (words.length < 15) {
    totalScore = Math.min(totalScore, 40);
  }

  const scorePercent = Math.max(0, Math.min(100, totalScore));
  const earnedPoints = Math.round((scorePercent / 100) * question.points);

  let verdict: 'ALCANÇA' | 'PARCIALMENTE_ALCANÇA' | 'NÃO_ALCANÇA' = 'NÃO_ALCANÇA';
  let technicalFeedback = '';

  if (scorePercent >= 80) {
    verdict = 'ALCANÇA';
    technicalFeedback = `Excelente raciocínio técnico de campo! Você articulou os conceitos fundamentais exigidos (${matchedKeywords.join(', ')}), demonstrando compreensão plena dos procedimentos e normas de segurança.`;
  } else if (scorePercent >= 50) {
    verdict = 'PARCIALMENTE_ALCANÇA';
    technicalFeedback = `Resposta no caminho certo, com boa noção prática. No entanto, para alcançar a excelência técnica segundo a ${question.norma}, é fundamental detalhar mais os seguintes pontos que ficaram omissos: ${missingPoints.join(', ')}.`;
  } else {
    verdict = 'NÃO_ALCANÇA';
    technicalFeedback = `A resposta apresentada está incompleta ou carece de fundamentação técnica rigorosa. Recomenda-se revisar a lição e citar expressamente termos como: ${missingPoints.join(', ')}.`;
  }

  return {
    scorePercent,
    verdict,
    matchedKeywords,
    missingPoints,
    technicalFeedback,
    normativeAlignment: `Análise de conformidade executada com base nas diretrizes da norma ${question.norma}.`,
    earnedPoints
  };
}
