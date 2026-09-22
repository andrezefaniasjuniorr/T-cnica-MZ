import { AcademyLesson } from '../types/academy';
import {
  AssessmentMCQuestion,
  AssessmentAttempt,
  ShuffledAssessmentOption
} from '../types/assessment';

/**
 * Embaralhamento rigoroso Fisher-Yates para garantir distribuição uniforme do gabarito.
 * É estritamente proibido que a resposta correta fique sempre na mesma alternativa.
 */
export function shuffleOptionsWithLabels(
  options: { id: string; text: string; isCorrect: boolean; feedback: string }[]
): ShuffledAssessmentOption[] {
  const letters: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D'];
  const shuffled = [...options];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = shuffled[i];
    shuffled[i] = shuffled[j];
    shuffled[j] = temp;
  }

  return shuffled.map((opt, idx) => ({
    ...opt,
    displayLetter: letters[idx] || 'D'
  }));
}

/**
 * Algoritmo Anti-Repetição baseado no localStorage:
 * Garante que questões já vistas em tentativas anteriores na mesma aula/dispositivo
 * NÃO se repitam até que o banco de questões seja totalmente esgotado.
 */
export function getSeenQuestionIds(lessonId: string): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const key = `tmz_seen_qids_${lessonId}`;
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch (err: any) {
    console.warn('Erro ao ler seen questions:', err);
    return [];
  }
}

export function saveSeenQuestionIds(lessonId: string, newIds: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    const key = `tmz_seen_qids_${lessonId}`;
    const current = getSeenQuestionIds(lessonId);
    const combined = Array.from(new Set([...current, ...newIds]));
    localStorage.setItem(key, JSON.stringify(combined));
  } catch (err: any) {
    console.error('Erro ao salvar seen questions:', err);
  }
}

export function resetSeenQuestionsForLesson(lessonId: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(`tmz_seen_qids_${lessonId}`);
  } catch (err: any) {
    console.error('Erro ao resetar seen questions:', err);
  }
}

// ============================================================================
// REPOSITÓRIO ESTRATÉGICO DE QUESTÕES POR TEMA / MÓDULO (ZERO TEMPLATES)
// Questões autênticas, práticas, de cálculo, defeito, diagnóstico e normas IEC
// ============================================================================

interface RawQuestion {
  id: string;
  question: string;
  scenario?: string;
  norma: string;
  points: number;
  explanation: string;
  keyTakeaway: string;
  options: { id: string; text: string; isCorrect: boolean; feedback: string }[];
}

/**
 * Questões Temáticas Especializadas para Física Elétrica, Leis e Grandezas (Módulo 1)
 */
function getModule1Questions(lessonId: string, norma: string): RawQuestion[] {
  return [
    {
      id: `${lessonId}_m1_ohm_calc`,
      question: 'Um aquecedor industrial de água de 4600 W opera sob tensão de 230 V monofásico. Qual o valor da corrente nominal de operação e a resistência ôhmica do elemento de aquecimento?',
      scenario: 'Comissionamento em bancada de resistência pura segundo a IEC 60038.',
      norma: 'IEC 60038 / IEC 60364-1',
      points: 20,
      explanation: 'Pela Lei de Joule e Ohm: I = P / V = 4600 / 230 = 20 A. A resistência é R = V / I = 230 / 20 = 11,5 Ω (ou R = V² / P = 230² / 4600 = 11,5 Ω).',
      keyTakeaway: 'R = V / I e P = V × I. Para 4600 W em 230 V, a corrente é 20 A e a resistência é 11,5 Ω.',
      options: [
        { id: 'opt1', text: 'I = 20 A e R = 11,5 Ω.', isCorrect: true, feedback: 'Correto! 4600 W / 230 V = 20 A; 230 V / 20 A = 11,5 Ω.' },
        { id: 'opt2', text: 'I = 10 A e R = 23 Ω.', isCorrect: false, feedback: 'Incorreto. 10 A geraria apenas 2300 W de potência.' },
        { id: 'opt3', text: 'I = 46 A e R = 5 Ω.', isCorrect: false, feedback: 'Incorreto. Dividiu a potência por 100 em vez de 230 V.' },
        { id: 'opt4', text: 'I = 20 A e R = 230 Ω.', isCorrect: false, feedback: 'Incorreto. A resistência foi superestimada em 20 vezes.' }
      ]
    },
    {
      id: `${lessonId}_m1_temp_coppercable`,
      question: 'Em uma linha que alimenta um motor na região central de Moçambique, a temperatura ambiente eleva-se de 20 °C para 45 °C no verão. Qual o impacto físico direto na resistência ôhmica dos condutores de cobre?',
      scenario: 'Operação de cabos elétricos sob temperaturas elevadas na província de Tete ou Gaza.',
      norma: 'IEC 60364-5-52',
      points: 20,
      explanation: 'O cobre tem coeficiente de temperatura positivo (α ≈ +0,00393 / °C). Com o aumento de temperatura, a agitação térmica atômica cresce, aumentando as colisões de elétrons e elevando a resistência ôhmica do cabo, o que agrava a queda de tensão.',
      keyTakeaway: 'Temperatura elevada = maior resistência ôhmica = maior queda de tensão e perdas por Joule.',
      options: [
        { id: 'opt1', text: 'A resistência ôhmica aumenta, elevando a queda de tensão e exigindo fator de correção de temperatura.', isCorrect: true, feedback: 'Correto! O cobre tem coeficiente positivo (mais calor = maior resistência).' },
        { id: 'opt2', text: 'A resistência ôhmica diminui, permitindo conduzir mais corrente sem aquecer.', isCorrect: false, feedback: 'Incorreto. Isso violaria as leis dos condutores metálicos (comportamento de termistor NTC).' },
        { id: 'opt3', text: 'A resistência permanece inalterada, pois varia estritamente com o comprimento do cabo.', isCorrect: false, feedback: 'Incorreto. A resistência depende do comprimento, seção e temperatura.' },
        { id: 'opt4', text: 'A reatância indutiva anula o aumento da resistência ôhmica em 50 Hz.', isCorrect: false, feedback: 'Incorreto. A reatância independe da temperatura do cobre.' }
      ]
    },
    {
      id: `${lessonId}_m1_kirchhoff_loop`,
      question: 'Segundo a Lei das Malhas de Kirchhoff (2ª Lei), ao percorrer um circuito fechado contendo uma fonte de 230 V e três cargas em série com quedas de tensão de 50 V e 110 V nas duas primeiras, qual a tensão na terceira carga?',
      scenario: 'Verificação de queda de tensão em circuitos série.',
      norma: 'IEC 60027',
      points: 20,
      explanation: 'Pela 2ª Lei de Kirchhoff, a soma algébrica das diferenças de potencial em uma malha fechada é nula: 230 V - 50 V - 110 V - V3 = 0, logo V3 = 70 V.',
      keyTakeaway: 'A soma das quedas de tensão em série é igual à tensão total da fonte.',
      options: [
        { id: 'opt1', text: 'V3 = 70 V.', isCorrect: true, feedback: 'Correto! 230 V - 50 V - 110 V = 70 V.' },
        { id: 'opt2', text: 'V3 = 160 V.', isCorrect: false, feedback: 'Incorreto. 160 V é a soma das duas primeiras quedas, não o saldo restante.' },
        { id: 'opt3', text: 'V3 = 230 V.', isCorrect: false, feedback: 'Incorreto. A terceira carga não recebe a tensão total da fonte.' },
        { id: 'opt4', text: 'V3 = 0 V por simetria de fase.', isCorrect: false, feedback: 'Incorreto. O circuito fechado com corrente não tem queda nula em carga resistiva.' }
      ]
    },
    {
      id: `${lessonId}_m1_power_triangle`,
      question: 'Uma fábrica consome 80 kW de potência ativa com uma potência aparente total de 100 kVA. Qual é o fator de potência (cos φ) da instalação e qual o volume de potência reativa (Q)?',
      scenario: 'Análise de tarifação de energia reativa segundo o padrão da EDM.',
      norma: 'IEC 60831 / IEC 60038',
      points: 20,
      explanation: 'FP = P / S = 80 / 100 = 0,80. Pelo Teorema de Pitágoras no Triângulo de Potências: Q = √(S² - P²) = √(100² - 80²) = √(10000 - 6400) = √3600 = 60 kVAr.',
      keyTakeaway: 'FP = 0,80 e Q = 60 kVAr. Estando abaixo de 0,92, a instalação sofre multas por excesso de reativos.',
      options: [
        { id: 'opt1', text: 'Fator de Potência = 0,80 e Potência Reativa Q = 60 kVAr.', isCorrect: true, feedback: 'Excelente! FP = 80/100 = 0,80 e Q = √(100² - 80²) = 60 kVAr.' },
        { id: 'opt2', text: 'Fator de Potência = 1,25 e Potência Reativa Q = 20 kVAr.', isCorrect: false, feedback: 'Incorreto. O FP nunca pode ser maior que 1,00.' },
        { id: 'opt3', text: 'Fator de Potência = 0,80 e Potência Reativa Q = 20 kVAr.', isCorrect: false, feedback: 'Incorreto. Subtraiu algebricamente (100 - 80) em vez de usar Pitágoras vetorial.' },
        { id: 'opt4', text: 'Fator de Potência = 0,64 e Potência Reativa Q = 80 kVAr.', isCorrect: false, feedback: 'Incorreto. 0,64 seria (0,80)², o que não representa o cosseno fi.' }
      ]
    },
    {
      id: `${lessonId}_m1_faraday_lenz`,
      question: 'Ao aproximar o polo norte de um ímã permanente de uma bobina condutora fechada, qual fenômeno eletromagnético ocorre segundo a Lei de Faraday-Lenz?',
      scenario: 'Princípio de funcionamento de geradores, alternadores e transformadores.',
      norma: 'IEC 60027',
      points: 20,
      explanation: 'A variação temporal do fluxo magnético induz uma força eletromotriz (Faraday). Pela Lei de Lenz, a corrente induzida circula em um sentido que cria um polo norte na face voltada ao ímã, opondo-se à aproximação deste.',
      keyTakeaway: 'A corrente induzida sempre cria um campo magnético que se opõe à variação do fluxo indutor.',
      options: [
        { id: 'opt1', text: 'Induz-se uma corrente que gera um campo magnético em oposição à aproximação do ímã.', isCorrect: true, feedback: 'Perfeito! O sinal negativo da Lei de Faraday (e = -dΦ/dt) reflete a oposição de Lenz.' },
        { id: 'opt2', text: 'A bobina atrai o ímã com força dobrada acelerando-o espontaneamente.', isCorrect: false, feedback: 'Incorreto. Violaria o Princípio da Conservação de Energia.' },
        { id: 'opt3', text: 'Nenhuma corrente é induzida, pois o ímã não possui condutores elétricos internos.', isCorrect: false, feedback: 'Incorreto. A indução decorre exclusivamente da variação do fluxo magnético no espaço.' },
        { id: 'opt4', text: 'A tensão induzida é puramente contínua constante independente da velocidade de aproximação.', isCorrect: false, feedback: 'Incorreto. A amplitude é diretamente proporcional à velocidade da variação (dΦ/dt).' }
      ]
    }
  ];
}

/**
 * Questões Temáticas Especializadas para Instalações Prediais & IEC 60364 (Módulo 2)
 */
function getModule2Questions(lessonId: string, norma: string): RawQuestion[] {
  return [
    {
      id: `${lessonId}_m2_thru_three_way`,
      question: 'Em um circuito de iluminação com dois comutadores de escada (interruptores paralelos / three-way), quantos condutores de ligação (retornos paralelos) devem ser instalados entre ambos os mecanismos?',
      scenario: 'Comando de lâmpada em dois pontos distintos de um corredor ou escadaria.',
      norma: 'IEC 60364-5-52',
      points: 20,
      explanation: 'No esquema padrão europeu de comutação de escada, a fase chega ao polo comum do 1º comutador, dois condutores de retorno paralelo ligam os bornes laterais de ambos, e o polo comum do 2º comutador leva o retorno da lâmpada.',
      keyTakeaway: 'Dois condutores de retorno conectam os bornes laterais dos dois comutadores paralelos.',
      options: [
        { id: 'opt1', text: 'Exatamente 2 condutores de retorno dedicados entre os comutadores.', isCorrect: true, feedback: 'Correto! São os dois condutores viajantes que alternam o caminho da fase.' },
        { id: 'opt2', text: 'Apenas 1 condutor que transporta a fase e o neutro juntos.', isCorrect: false, feedback: 'Incorreto e perigoso. Fase e neutro no mesmo borne causariam curto-circuito pleno.' },
        { id: 'opt3', text: '4 condutores cruzados com o condutor de proteção PE.', isCorrect: false, feedback: 'Incorreto. 4 condutores são usados nos intermediários (four-way), não entre escadas normais.' },
        { id: 'opt4', text: 'Nenhum condutor metálico, pois a norma exige acionamento por rádio frequência.', isCorrect: false, feedback: 'Incorreto. A comutação cabeada tradicional é padronizada na IEC 60364.' }
      ]
    },
    {
      id: `${lessonId}_m2_four_way_intermed`,
      question: 'Para acionar um ponto de luz a partir de 4 locais distintos em uma instalação predial, qual combinação de mecanismos deve ser rigorosamente empregada?',
      scenario: 'Comando de iluminação em salas de reuniões amplas ou corredores com múltiplos acessos.',
      norma: 'IEC 60364-1',
      points: 20,
      explanation: 'Para N pontos de comando: utilizam-se sempre 2 comutadores de escada (nas extremidades) e (N - 2) comutadores inversores de grupo / intermediários (four-way) no meio. Para 4 pontos: 2 de escada e 2 intermediários.',
      keyTakeaway: 'N pontos = 2 comutadores de escada nas pontas + (N - 2) comutadores intermediários.',
      options: [
        { id: 'opt1', text: '2 comutadores de escada (three-way) nas pontas e 2 comutadores intermediários (four-way) no meio.', isCorrect: true, feedback: 'Exato! A regra universal é: 2 paralelas nas extremidades e o restante intermediários.' },
        { id: 'opt2', text: '4 comutadores simples unipolares ligados todos em série direta.', isCorrect: false, feedback: 'Incorreto. Em série, bastaria um interruptor desligado para apagar e bloquear todos os demais.' },
        { id: 'opt3', text: '4 comutadores intermediários (four-way) sem comutadores de escada.', isCorrect: false, feedback: 'Incorreto. O intermediário precisa receber os 2 retornos de um comutador de escada na entrada.' },
        { id: 'opt4', text: '1 interruptor bipolar geral associado a 3 botões de campainha sem relé.', isCorrect: false, feedback: 'Incorreto. Botão de pressão sem telerruptor/relé de impulso não retém a lâmpada acesa.' }
      ]
    },
    {
      id: `${lessonId}_m2_socket_circuit_sizing`,
      question: 'Segundo as prescrições da IEC 60364-5-52 para circuitos de tomadas de uso geral (TUG 2P+T 16 A 230 V) em residências, qual a seção mínima de condutor de cobre e o calibre do disjuntor de proteção recomendado?',
      scenario: 'Dimensionamento de circuitos terminais residenciais e comerciais.',
      norma: 'IEC 60364-5-52',
      points: 20,
      explanation: 'Para tomadas de uso geral (16 A), a seção mínima regulamentar de condutor de cobre é 2,5 mm², protegida por disjuntor termomagnético de In = 16 A (ou 20 A dependendo do método de instalação e capacidade Iz).',
      keyTakeaway: 'Tomadas 16 A requerem condutores de no mínimo 2,5 mm² e proteção por MCB de 16 A curva C.',
      options: [
        { id: 'opt1', text: 'Condutor de cobre de 2,5 mm² protegido por disjuntor MCB de 16 A.', isCorrect: true, feedback: 'Perfeito! 2,5 mm² suporta com segurança a corrente nominal das tomadas de 16 A.' },
        { id: 'opt2', text: 'Condutor de 1,0 mm² protegido por disjuntor de 32 A.', isCorrect: false, feedback: 'Incorreto e criminoso. O cabo de 1,0 mm² derreteria sob fogo muito antes de o disjuntor de 32 A atuar.' },
        { id: 'opt3', text: 'Condutor de 0,75 mm² sem disjuntor, direto ao barramento geral.', isCorrect: false, feedback: 'Incorreto. 0,75 mm² é proibido em circuitos de tomadas prediais fixas.' },
        { id: 'opt4', text: 'Condutor de 10 mm² associado a fusível gG de 63 A.', isCorrect: false, feedback: 'Incorreto. Superdimensionamento antieconômico e incompatível com os bornes da tomada.' }
      ]
    },
    {
      id: `${lessonId}_m2_voltage_drop_rule`,
      question: 'Qual é o limite máximo regulamentar de queda de tensão admissível (ΔU) estipulado pela IEC 60364 entre a origem da instalação (quadro geral) e o ponto de utilização mais distante em circuitos terminais de iluminação?',
      scenario: 'Verificação em projeto e comissionamento de comprimentos longos de cabos.',
      norma: 'IEC 60364-5-52',
      points: 20,
      explanation: 'A norma IEC 60364-5-52 recomenda queda de tensão máxima de 3% para circuitos de iluminação e 5% para outros usos (força motriz e tomadas) a partir da rede pública de baixa tensão.',
      keyTakeaway: 'Queda de tensão máxima: 3% para iluminação e 5% para outros usos.',
      options: [
        { id: 'opt1', text: 'Máximo de 3% para circuitos de iluminação e 5% para outros usos.', isCorrect: true, feedback: 'Correto! 3% em 230 V corresponde a uma queda máxima de 6,9 V nos bornes da luminária.' },
        { id: 'opt2', text: 'Máximo de 15% para qualquer tipo de circuito terminal.', isCorrect: false, feedback: 'Incorreto. 15% causaria cintilação severa, perda de rendimento e queima de eletrônicos.' },
        { id: 'opt3', text: '0%, não sendo tolerada nenhuma variação de potencial no cobre.', isCorrect: false, feedback: 'Incorreto. Todo condutor real possui resistência interna intrínseca.' },
        { id: 'opt4', text: '50 V independentemente da tensão nominal da rede.', isCorrect: false, feedback: 'Incorreto. A queda é sempre percentual proporcional à tensão de alimentação.' }
      ]
    },
    {
      id: `${lessonId}_m2_color_coding_iec`,
      question: 'Em conformidade rigorosa com o padrão europeu harmonizado de identificação por cores de cabos elétricos (IEC 60446 / EN 60446), quais cores devem ser utilizadas para os condutores Neutro, Terra de Proteção (PE) e Fase?',
      scenario: 'Fiação e montagem de quadros elétricos de distribuição.',
      norma: 'IEC 60446 / EN 60446',
      points: 20,
      explanation: 'Pela IEC 60446: Neutro = Azul Claro; Proteção (PE) = Verde-Amarelo (bicolor); Fases = Castanho (L1), Preto (L2), Cinzento (L3). O azul é estritamente reservado ao neutro.',
      keyTakeaway: 'Neutro = Azul Claro | Terra PE = Verde-Amarelo | Fases = Castanho, Preto, Cinzento.',
      options: [
        { id: 'opt1', text: 'Neutro: Azul claro | Terra (PE): Verde-amarelo | Fases: Castanho, Preto ou Cinzento.', isCorrect: true, feedback: 'Excelente! Padrão normativo europeu adotado e fiscalizado pela EDM.' },
        { id: 'opt2', text: 'Neutro: Preto | Terra (PE): Vermelho | Fases: Azul claro.', isCorrect: false, feedback: 'Incorreto. Azul claro nunca pode ser fase na norma IEC; isso causaria acidentes fatais.' },
        { id: 'opt3', text: 'Neutro: Verde-amarelo | Terra (PE): Castanho | Fases: Branco.', isCorrect: false, feedback: 'Incorreto. Verde-amarelo é exclusivo para o condutor de proteção PE.' },
        { id: 'opt4', text: 'Todas as cores são livres desde que identificadas com fita crepe amadora.', isCorrect: false, feedback: 'Incorreto. A padronização de cores no isolamento de fábrica é obrigatória por norma.' }
      ]
    }
  ];
}

/**
 * Questões Temáticas Especializadas para Proteções, Disjuntores e Aterramentos (Módulo 3)
 */
function getModule3Questions(lessonId: string, norma: string): RawQuestion[] {
  return [
    {
      id: `${lessonId}_m3_mcb_curves`,
      question: 'Ao proteger o circuito de alimentação de um motor de indução trifásico que apresenta corrente de pico de partida de 6 a 8 vezes a corrente nominal (In), qual curva de disparo termomagnético de disjuntor MCB deve ser especificada?',
      scenario: 'Seleção de disjuntores modulares para cargas com corrente de inrush.',
      norma: 'IEC 60898-1 / IEC 60947-2',
      points: 20,
      explanation: 'A Curva D dispara magneticamente entre 10 e 20 vezes In (indicada para grandes motores e transformadores). A Curva C dispara entre 5 e 10 vezes In (adequada para motores comuns e cargas indutivas moderadas). A Curva B (3 a 5 In) desarmaria indevidamente na partida.',
      keyTakeaway: 'Curva B (3-5 In: resistivo) | Curva C (5-10 In: motores comuns) | Curva D (10-20 In: partidas pesadas).',
      options: [
        { id: 'opt1', text: 'Curva C ou Curva D, que suportam os picos de corrente da partida sem desarme indevido.', isCorrect: true, feedback: 'Correto! A curva C tolera de 5 a 10 In e a curva D de 10 a 20 In no instante da partida.' },
        { id: 'opt2', text: 'Curva B, que atua instantaneamente com apenas 3 a 5 vezes a corrente nominal.', isCorrect: false, feedback: 'Incorreto. A curva B desarmaria em falso toda vez que o motor recebesse comando de partida.' },
        { id: 'opt3', text: 'Curva Z ultrarrápida exclusiva para circuitos eletrônicos.', isCorrect: false, feedback: 'Incorreto. A curva Z é para proteção de semicondutores delicados, não motores.' },
        { id: 'opt4', text: 'Qualquer disjuntor sem disparador magnético, apenas com lâmina bimetálica.', isCorrect: false, feedback: 'Incorreto. A ausência de proteção magnética impediria a extinção de curtos-circuitos.' }
      ]
    },
    {
      id: `${lessonId}_m3_rcd_sensitivity`,
      question: 'Por qual razão técnica e biomédica a norma IEC 60364-4-41 estipula a sensibilidade de IΔn = 30 mA como o limite máximo de corrente residual para interruptores diferenciais (IDR/DR) destinados à proteção adicional de vidas humanas contra choques elétricos?',
      scenario: 'Proteção contra contatos diretos e indiretos em áreas molhadas e tomadas gerais.',
      norma: 'IEC 60364-4-41 / IEC 61008',
      points: 20,
      explanation: 'Acima de 30 a 50 mA através do tórax humano, o limiar de fibrilação ventricular do coração é atingido, com parada cardiorrespiratória irreversível. Dispositivos com 300 mA protegem apenas contra incêndio, não contra choque letal.',
      keyTakeaway: '30 mA é o limiar de segurança fisiológica contra fibrilação ventricular cardíaca.',
      options: [
        { id: 'opt1', text: '30 mA é o limiar que impede a ocorrência de fibrilação ventricular cardíaca em seres humanos.', isCorrect: true, feedback: 'Perfeito! É a proteção da integridade da vida humana contra paradas cardíacas.' },
        { id: 'opt2', text: '30 mA é a corrente que faz o disjuntor consumir menos energia elétrica do cliente.', isCorrect: false, feedback: 'Incorreto. O DR não consome corrente de trabalho, opera por balanço toroidal magnético.' },
        { id: 'opt3', text: 'Valores menores que 30 mA danificariam os enrolamentos do transformador da EDM.', isCorrect: false, feedback: 'Incorreto. O transformador opera com centenas de amperes e não é afetado pelo DR.' },
        { id: 'opt4', text: 'Porque disjuntores de 300 mA disparam mais rápido que os de 30 mA.', isCorrect: false, feedback: 'Incorreto. 300 mA exige uma fuga 10 vezes maior para desarmar, sendo letal ao ser humano.' }
      ]
    },
    {
      id: `${lessonId}_m3_earthing_tt_tn`,
      question: 'Em um esquema de aterramento TT típico de residências alimentadas pela rede pública aérea em Moçambique, qual o requisito mandatório para assegurar a proteção contra contatos indiretos em caso de fuga de fase para a massa metálica?',
      scenario: 'Conformidade de segurança com a concessionária de energia EDM.',
      norma: 'IEC 60364-4-41',
      points: 20,
      explanation: 'No esquema TT, a massa da instalação é aterrada em eletrodo independente do neutro do transformador. A impedância do circuito de falta é alta, gerando correntes de curto pequenas que não sensibilizam disjuntores termomagnéticos. Portanto, o uso de dispositivo diferencial residual (RCD / DR) é estritamente obrigatório (Ra × IΔn ≤ 50 V).',
      keyTakeaway: 'No sistema TT, o uso de dispositivo diferencial residual (DR/RCD) é estritamente obrigatório.',
      options: [
        { id: 'opt1', text: 'Obrigatório o uso de dispositivo diferencial residual (DR/IDR), pois o disjuntor termomagnético comum não desarmará.', isCorrect: true, feedback: 'Correto! A alta resistência da terra no esquema TT impede que a corrente de falta atinja o limiar magnético do disjuntor.' },
        { id: 'opt2', text: 'Ligar diretamente a carcaça ao cabo neutro na tomada sem condutor terra PE.', isCorrect: false, feedback: 'Proibido e letal! Isso transformaria indevidamente o circuito em um TN-C clandestino.' },
        { id: 'opt3', text: 'Eliminar qualquer haste de terra e isolar a carcaça com borracha.', isCorrect: false, feedback: 'Incorreto. As massas metálicas devem estar todas equipotencializadas e aterradas.' },
        { id: 'opt4', text: 'Usar apenas fusíveis de areia de 100 A em todas as fases.', isCorrect: false, feedback: 'Incorreto. O fusível jamais abriria com a corrente de fuga modesta da terra.' }
      ]
    },
    {
      id: `${lessonId}_m3_spd_surge_protec`,
      question: 'Em uma região com alta densidade de descargas atmosféricas (raios), qual a função primordial de um Dispositivo de Proteção contra Surtos (DPS) Classe II instalado no quadro de distribuição predial?',
      scenario: 'Proteção de eletrodomésticos, inversores e placas eletrônicas contra sobretensões transitórias.',
      norma: 'IEC 61643-11 / IEC 60364-5-534',
      points: 20,
      explanation: 'O DPS com varistor de óxido metálico (MOV) apresenta impedância quase infinita na tensão de rede (230 V), mas comuta instantaneamente em nanossegundos para baixíssima impedância quando surge uma sobretensão transitória (kV), drenando a onda de corrente para a terra e ceifando a tensão residual a níveis seguros.',
      keyTakeaway: 'O DPS desvia picos transitórios de alta tensão para o sistema de aterramento em nanossegundos.',
      options: [
        { id: 'opt1', text: 'Escoar surtos transitórios de sobretensão atmosférica para a terra, ceifando a tensão residual suportada pelos aparelhos.', isCorrect: true, feedback: 'Perfeito! O varistor entra em condução rápida e protege os equipamentos sensíveis.' },
        { id: 'opt2', text: 'Desarmar como disjuntor quando o consumo de corrente dos motores passar de 20 A.', isCorrect: false, feedback: 'Incorreto. DPS protege contra sobretensões transitórias (Volts), não sobrecorrentes (Amperes).' },
        { id: 'opt3', text: 'Elevar a tensão de 230 V para 400 V durante as quedas de energia da concessionária.', isCorrect: false, feedback: 'Incorreto. DPS não é regulador de tensão nem no-break.' },
        { id: 'opt4', text: 'Filtrar exclusivamente a frequência de 50 Hz transformando-a em corrente contínua.', isCorrect: false, feedback: 'Incorreto. Essa é a função de um retificador de eletrônica de potência.' }
      ]
    },
    {
      id: `${lessonId}_m3_coordination_selectivity`,
      question: 'O que significa obter Seletividade Total (Coordenação) entre o disjuntor geral de um quadro elétrico e os disjuntores dos circuitos terminais derivados?',
      scenario: 'Projeto de continuidade de serviço em edifícios comerciais e hospitais.',
      norma: 'IEC 60947-2',
      points: 20,
      explanation: 'Seletividade total garante que, ocorrendo uma sobrecarga ou curto-circuito em um circuito terminal derivado (ex: tomadas da sala 2), apenas o disjuntor daquele circuito atue, mantendo o disjuntor geral fechado e todos os outros circuitos do prédio energizados sem blecaute total.',
      keyTakeaway: 'Seletividade: Apenas o dispositivo imediatamente montante da falha deve desarmar.',
      options: [
        { id: 'opt1', text: 'Apenas o disjuntor do circuito defeituoso desarma, mantendo o disjuntor geral e os demais circuitos energizados.', isCorrect: true, feedback: 'Correto! Preserva a continuidade do fornecimento e facilita a localização da falha.' },
        { id: 'opt2', text: 'Todos os disjuntores da instalação desarmam juntos simultaneamente em qualquer mínima falha.', isCorrect: false, feedback: 'Incorreto. Isso é falta total de seletividade e causa transtornos severos.' },
        { id: 'opt3', text: 'O disjuntor geral desarma primeiro para proteger os disjuntores menores derivados.', isCorrect: false, feedback: 'Incorreto. Isso cortaria a energia de toda a instalação desnecessariamente.' },
        { id: 'opt4', text: 'A instalação opera sem condutor neutro para que a corrente circule em circuito fechado.', isCorrect: false, feedback: 'Incorreto. Nada tem a ver com o conceito de coordenação de proteções.' }
      ]
    }
  ];
}

/**
 * Questões Temáticas Especializadas para Comandos Industriais e Acionamentos (Módulo 5)
 */
function getModule5Questions(lessonId: string, norma: string): RawQuestion[] {
  return [
    {
      id: `${lessonId}_m5_contactor_terminals`,
      question: 'Em um contator de potência tripolar industrial com bobina de comando (IEC 60947-4-1), quais são as designações normativas padronizadas dos terminais da bobina eletromagnética e do contato auxiliar normalmente aberto?',
      scenario: 'Leitura de esquemas de comando e ligação prática de contatores.',
      norma: 'IEC 60947-4-1',
      points: 20,
      explanation: 'Pela IEC: Terminais da bobina eletromagnética = A1 e A2; Contatos de força principais = 1-3-5 (L1-L2-L3) e 2-4-6 (T1-T2-T3); Contato auxiliar Normalmente Aberto (NA/NO) = 13-14; Contato auxiliar Normalmente Fechado (NF/NC) = 21-22.',
      keyTakeaway: 'Bobina: A1-A2 | Contato NA de retenção: 13-14 | Contato NF de intertravamento: 21-22.',
      options: [
        { id: 'opt1', text: 'Bobina: A1 e A2 | Contato auxiliar NA (selo): terminais 13 e 14.', isCorrect: true, feedback: 'Excelente! A1/A2 são a bobina e 13/14 é o contato de selo padronizado.' },
        { id: 'opt2', text: 'Bobina: 1 e 2 | Contato auxiliar NA: terminais L1 e L2.', isCorrect: false, feedback: 'Incorreto. 1-2 e L1-L2 são terminais do circuito de potência trifásico.' },
        { id: 'opt3', text: 'Bobina: 95 e 96 | Contato auxiliar NA: terminais A1 e A2.', isCorrect: false, feedback: 'Incorreto. 95 e 96 são os contatos NF do relé térmico de sobrecarga.' },
        { id: 'opt4', text: 'Bobina: PE e Terra | Contato auxiliar NA: terminais 97 e 98.', isCorrect: false, feedback: 'Incorreto. 97 e 98 são contatos de alarme de trip do relé térmico.' }
      ]
    },
    {
      id: `${lessonId}_m5_interlocking_reversal`,
      question: 'Em um circuito de partida direta com reversão de rotação de motor trifásico acionado por dois contatores (K1 horário e K2 anti-horário), qual medida de segurança por hardware é estritamente obrigatória para impedir curto-circuito entre fases?',
      scenario: 'Acionamento de esteiras, guinchos e portões industriais com inversão de marcha.',
      norma: 'IEC 60947-4-1',
      points: 20,
      explanation: 'Para inverter o sentido de giro de um motor trifásico, invertem-se duas fases entre si (ex: L1 e L3). Se K1 e K2 atracarem simultaneamente, ocorre um violento curto-circuito fase-fase bifásico. O intertravamento elétrico (passando o comando da bobina de K1 pelo contato NF 21-22 de K2 e vice-versa) associado a intertravamento mecânico é mandatório.',
      keyTakeaway: 'Intertravamento elétrico cruzado com contatos NF (21-22) impede acionamento simultâneo de K1 e K2.',
      options: [
        { id: 'opt1', text: 'Intertravamento elétrico cruzado utilizando os contatos NF (21-22) de cada contator na linha da bobina do outro.', isCorrect: true, feedback: 'Correto! Garante que um contator só possa ligar se o outro estiver comprovadamente desatracado.' },
        { id: 'opt2', text: 'Ligar as duas bobinas de K1 e K2 em paralelo direto no mesmo botão pulsador.', isCorrect: false, feedback: 'Catastrófico! As duas chaves fechariam juntas causando explosão imediata entre fases.' },
        { id: 'opt3', text: 'Aumentar a bitola dos cabos de alimentação para suportar o curto permanente.', isCorrect: false, feedback: 'Incorreto e absurdo. Curto-circuito deve ser prevenido, não tolerado.' },
        { id: 'opt4', text: 'Inverter o condutor neutro com o condutor terra para mudar a rotação.', isCorrect: false, feedback: 'Incorreto. Motores trifásicos não utilizam condutor neutro para rotação.' }
      ]
    },
    {
      id: `${lessonId}_m5_thermal_relay_trip`,
      question: 'O relé térmico bimetálico de sobrecarga (terminais auxiliares 95-96 e 97-98) atua para proteger o motor contra sobrecorrentes moderadas e prolongadas. Como seus contatos auxiliares devem ser conectados no circuito?',
      scenario: 'Proteção mecânica e elétrica contra travamento de rotor e sobrecarga contínua.',
      norma: 'IEC 60947-4-1',
      points: 20,
      explanation: 'O contato NF (95-96) deve ser ligado em série com a linha de comando das bobinas dos contatores, abrindo o circuito e desarmando a máquina se o motor sobreaquecer. O contato NA (97-98) fecha para acionar a lâmpada/sirene de alarme de falha.',
      keyTakeaway: 'Contato 95-96 (NF) desliga o comando; Contato 97-98 (NA) sinaliza a falha térmica.',
      options: [
        { id: 'opt1', text: 'Contato NF 95-96 em série com o comando para desenergizar a bobina; contato NA 97-98 para ligar sinalização de alarme.', isCorrect: true, feedback: 'Exato! Desliga a alimentação motora e avisa o operador da sobrecarga térmica.' },
        { id: 'opt2', text: 'Contato 95-96 ligado em paralelo com as fases de força de 400 V.', isCorrect: false, feedback: 'Incorreto. Contatos auxiliares são de baixa corrente de comando, explodiriam sob 400 V de força.' },
        { id: 'opt3', text: 'Contato 97-98 em curto-circuito permanente com a carcaça metálica.', isCorrect: false, feedback: 'Incorreto. Criaria uma fuga perigosa e não protegeria o enrolamento.' },
        { id: 'opt4', text: 'O relé térmico não possui contatos auxiliares, atua por quebra física dos condutores de cobre.', isCorrect: false, feedback: 'Incorreto. Ele aciona um mecanismo de engate que comuta contatos elétricos de comando.' }
      ]
    },
    {
      id: `${lessonId}_m5_star_delta_start`,
      question: 'Qual é o objetivo primordial da partida Estrela-Triângulo (Y-Δ) em motores de indução trifásicos e qual o impacto nas correntes e no torque durante a partida?',
      scenario: 'Redução do impacto de partida na rede de distribuição e geradores.',
      norma: 'IEC 60947-4-1',
      points: 20,
      explanation: 'Na ligação Estrela (Y), cada bobina recebe a tensão de fase (V_linha / √3 = 230 V em vez de 400 V). A corrente de partida (Ip) e o conjugado/torque de partida (Cp) caem para 1/3 (33%) dos seus valores de partida direta, reduzindo a queda de tensão na rede.',
      keyTakeaway: 'Partida Estrela-Triângulo: reduz a corrente de partida e o torque para 1/3 (33%) do valor direto.',
      options: [
        { id: 'opt1', text: 'Reduz a corrente de partida e o torque do motor para 1/3 (cerca de 33%) do valor em partida direta.', isCorrect: true, feedback: 'Correto! Alivia a rede elétrica mantendo a corrente de inrush sob controle.' },
        { id: 'opt2', text: 'Dobra a velocidade de rotação nominal do motor para economizar eletricidade.', isCorrect: false, feedback: 'Incorreto. A velocidade síncrona depende estritamente da frequência da rede e do número de polos.' },
        { id: 'opt3', text: 'Eleva a corrente para 300% para vencer a inércia da carga mais rapidamente.', isCorrect: false, feedback: 'Incorreto. O objetivo é reduzir a corrente, nunca aumentá-la.' },
        { id: 'opt4', text: 'Converte a alimentação trifásica da concessionária em monofásica aterrada.', isCorrect: false, feedback: 'Incorreto. O sistema opera continuamente em alimentação trifásica.' }
      ]
    },
    {
      id: `${lessonId}_m5_vfd_frequency_inverter`,
      question: 'Em um Inversor de Frequência (VFD) que comanda um motor de 50 Hz com 4 polos (velocidade síncrona de 1500 RPM a 50 Hz), qual será a velocidade síncrona do campo magnético girante se o VFD operar na frequência de 25 Hz?',
      scenario: 'Controle contínuo de rotação e vazão em bombas e ventiladores industriais.',
      norma: 'IEC 61800',
      points: 20,
      explanation: 'A fórmula da velocidade síncrona é Ns = (120 × f) / P. Para f = 25 Hz e P = 4 polos: Ns = (120 × 25) / 4 = 3000 / 4 = 750 RPM (exatamente a metade da velocidade nominal de 1500 RPM).',
      keyTakeaway: 'Ns = (120 × f) / P. A rotação varia diretamente proporcional à frequência f entregue pelo VFD.',
      options: [
        { id: 'opt1', text: '750 RPM.', isCorrect: true, feedback: 'Perfeito! Ns = (120 × 25) / 4 = 750 RPM (metade da velocidade nominal).' },
        { id: 'opt2', text: '1500 RPM inalterados, pois a velocidade do rotor é fixa de fábrica.', isCorrect: false, feedback: 'Incorreto. O VFD altera dinamicamente a rotação através da frequência.' },
        { id: 'opt3', text: '3000 RPM por aceleração de campo magnético.', isCorrect: false, feedback: 'Incorreto. 3000 RPM exigiria frequência de 100 Hz.' },
        { id: 'opt4', text: '0 RPM, pois o motor não gira abaixo da frequência nominal de 50 Hz.', isCorrect: false, feedback: 'Incorreto. VFDs controlam o motor suavemente de 0 Hz até a velocidade máxima com torque constante.' }
      ]
    }
  ];
}

/**
 * Questões Temáticas Especializadas para Eletrônica Aplicada e Retificação (Módulo 4)
 */
function getModule4Questions(lessonId: string, norma: string): RawQuestion[] {
  return [
    {
      id: `${lessonId}_m4_graetz_bridge_diodes`,
      question: 'Em uma ponte retificadora de onda completa monofásica em Ponte de Graetz (4 diodos de silício) conectada a um secundário de transformador de 24 V RMS 50 Hz, qual a queda de tensão contínua típica provocada pela condução dos diodos em cada semiciclo?',
      scenario: 'Dimensionamento de fontes lineares e circuitos retificadores de alimentação.',
      norma: 'IEC 60146',
      points: 20,
      explanation: 'Em cada semiciclo (positivo ou negativo), a corrente atravessa sempre 2 diodos em série na ponte de Graetz. Sendo diodos de silício comuns (queda direta Vf ≈ 0,7 V cada), a queda total é de 2 × 0,7 V = 1,4 V sobre o valor de pico.',
      keyTakeaway: 'Na ponte de Graetz, conduzem 2 diodos por semiciclo, provocando queda de tensão de aproximadamente 1,4 V.',
      options: [
        { id: 'opt1', text: 'Aproximadamente 1,4 V (dois diodos de silício conduzindo em série por semiciclo).', isCorrect: true, feedback: 'Correto! Cada diodo de silício consome cerca de 0,7 V na condução direta.' },
        { id: 'opt2', text: 'Zero Volts, pois diodos ideais não apresentam resistência interna.', isCorrect: false, feedback: 'Incorreto. Diodos semicondutores reais de silício possuem barreira de potencial de 0,7 V.' },
        { id: 'opt3', text: '24 V contínuos, anulando completamente a tensão de saída.', isCorrect: false, feedback: 'Incorreto. Os diodos não anulam a tensão, apenas retificam o sentido da corrente.' },
        { id: 'opt4', text: '4,8 V devido à dissipação capacitiva dos cátodos.', isCorrect: false, feedback: 'Incorreto. A barreira de potencial é de 0,7 V por junção PN.' }
      ]
    },
    {
      id: `${lessonId}_m4_filter_ripple_calc`,
      question: 'Qual é o papel do capacitor eletrolítico de alta capacitância conectado em paralelo com a saída de uma ponte retificadora e o que representa o "Ripple" (ondulação residual)?',
      scenario: 'Filtragem capacitiva em fontes de alimentação para automação.',
      norma: 'IEC 60146',
      points: 20,
      explanation: 'O capacitor armazena carga no pico da senóide e a devolve suavemente à carga quando a tensão da rede cai, filtrando a corrente pulsante e transformando-a em tensão contínua quase pura. A pequena variação pico a pico restante é o Ripple.',
      keyTakeaway: 'O capacitor de filtro suaviza a tensão pulsante reduzindo a ondulação de Ripple.',
      options: [
        { id: 'opt1', text: 'Armazenar carga no pico e descarregar nos vales, suavizando a tensão contínua e reduzindo o Ripple.', isCorrect: true, feedback: 'Excelente! Quanto maior a capacitância C para uma mesma carga, menor será o Ripple.' },
        { id: 'opt2', text: 'Inverter a polaridade da tensão de saída a cada ciclo de 50 Hz.', isCorrect: false, feedback: 'Incorreto. A função é manter a polaridade contínua e estável.' },
        { id: 'opt3', text: 'Dissipar a potência em forma de calor para evitar curto-circuito.', isCorrect: false, feedback: 'Incorreto. O capacitor armazena e entrega energia reativa, não deve superaquecer.' },
        { id: 'opt4', text: 'Substituir os diodos permitindo passar corrente alternada diretamente.', isCorrect: false, feedback: 'Incorreto. O capacitor de filtro opera no lado de corrente contínua retificada.' }
      ]
    },
    {
      id: `${lessonId}_m4_freewheeling_diode`,
      question: 'Por que é indispensável instalar um diodo em antiparalelo (diodo de roda livre / flyback) nos bornes da bobina de corrente contínua (CC) de um relé acionado por um transistor BJT ou MOSFET?',
      scenario: 'Proteção de saídas a transistor em CLPs e placas eletrônicas de controle.',
      norma: 'IEC 60947-5-1',
      points: 20,
      explanation: 'A bobina do relé é um indutor. Ao cortar bruscamente a corrente com o transistor, a lei de indução (V = -L·di/dt) gera um pico de sobretensão reversa de centenas de volts que destruiria a junção semicondutora do transistor. O diodo flyback oferece um caminho seguro para descarregar essa energia indutiva.',
      keyTakeaway: 'O diodo flyback dissipa o pico indutivo de sobretensão (-L di/dt), salvando o transistor de queima imediata.',
      options: [
        { id: 'opt1', text: 'Drenar o pico de alta tensão indutiva induzido no corte da bobina, evitando a queima do transistor.', isCorrect: true, feedback: 'Perfeito! Evita a destruição do transistor por avalanche de sobretensão reversa.' },
        { id: 'opt2', text: 'Acelerar o aquecimento da bobina para fechar os contatos mais rapidamente.', isCorrect: false, feedback: 'Incorreto. Aquecimento em bobinas é indesejável e queima o verniz isolante.' },
        { id: 'opt3', text: 'Permitir que o relé seja alimentado com tensão alternada de 230 V sem queimar.', isCorrect: false, feedback: 'Incorreto. Bobinas CC com flyback em rede CA gerariam curto-circuito no semiciclo oposto.' },
        { id: 'opt4', text: 'Inverter o polo positivo do relé transformando o contato NA em NF.', isCorrect: false, feedback: 'Incorreto. Os contatos mecânicos do relé são independentes da polaridade elétrica da bobina.' }
      ]
    }
  ];
}

/**
 * Questões Temáticas Especializadas para Média Tensão, Redes e Postos de Transformação PT (Módulos 6 e 8)
 */
function getModule6And8Questions(lessonId: string, norma: string): RawQuestion[] {
  return [
    {
      id: `${lessonId}_m8_five_golden_rules`,
      question: 'Qual é a sequência cronológica mandatória e inviolável das 5 Regras de Ouro de Segurança (EN 50110 / NR-10) antes de iniciar qualquer intervenção física em celas ou barramentos de Média Tensão (22 kV)?',
      scenario: 'Procedimento operacional de manutenção em cabines primárias e postos de transformação.',
      norma: 'EN 50110-1 / IEC 61936-1',
      points: 20,
      explanation: 'As 5 Regras de Ouro: 1) Seccionar completamente a alimentação; 2) Bloquear contra religamento acidental (LOTO); 3) Constatar a ausência de tensão com detector comprovadamente testado; 4) Aterrar e colocar em curto-circuito todas as fases; 5) Sinalizar e delimitar a zona de trabalho.',
      keyTakeaway: '1. Seccionar | 2. Bloquear (LOTO) | 3. Verificar Ausência | 4. Aterrar e Curto-circuitar | 5. Sinalizar.',
      options: [
        { id: 'opt1', text: '1. Seccionar, 2. Bloquear (LOTO), 3. Constatar ausência de tensão, 4. Aterrar e colocar em curto-circuito, 5. Sinalizar.', isCorrect: true, feedback: 'Perfeito! A sequência salva vidas diariamente no setor elétrico de potência.' },
        { id: 'opt2', text: '1. Aterrar, 2. Seccionar, 3. Religar para testar se há faísca, 4. Bloquear, 5. Trabalhar.', isCorrect: false, feedback: 'Catastrófico! Aterrar barramento energizado gera explosão por arco elétrico de média tensão.' },
        { id: 'opt3', text: '1. Colocar luvas de couro, 2. Abrir a porta da cela, 3. Medir com multímetro de baixa tensão.', isCorrect: false, feedback: 'Gravíssimo! Multímetros comuns não suportam média tensão e explodem na mão do operador.' },
        { id: 'opt4', text: 'Apenas desligar o disjuntor de baixa tensão no quadro geral do edifício.', isCorrect: false, feedback: 'Incorreto. A média tensão da concessionária continuaria 100% viva e letal no primário.' }
      ]
    },
    {
      id: `${lessonId}_m8_transformer_dyn11`,
      question: 'Em transformadores de distribuição de postos de transformação de média tensão para baixa tensão (22 kV para 400/230 V), o grupo de ligação predominante no padrão da EDM é Dyn11. O que representa esta nomenclatura?',
      scenario: 'Especificação técnica de transformadores de potência segundo a IEC 60076.',
      norma: 'IEC 60076-1',
      points: 20,
      explanation: 'Dyn11 significa: D = Enrolamento primário em Triângulo (Delta); y = Enrolamento secundário em Estrela; n = Neutro acessível para o secundário de baixa tensão; 11 = Ângulo de defasagem de 330° (11 × 30° = 330° ou -30°) entre as tensões do primário e do secundário.',
      keyTakeaway: 'Dyn11: Primário Triângulo, Secundário Estrela com Neutro acessível e defasagem de 330°.',
      options: [
        { id: 'opt1', text: 'Primário em Triângulo, Secundário em Estrela com Neutro acessível e defasagem angular de 330°.', isCorrect: true, feedback: 'Excelente! Dyn11 permite alimentar cargas monofásicas de 230 V e trifásicas de 400 V com neutro aterrado.' },
        { id: 'opt2', text: 'Dupla isolação seca para transformadores imersos em água salgada.', isCorrect: false, feedback: 'Incorreto. Dyn11 refere-se aos enrolamentos e defasagem eletromagnética.' },
        { id: 'opt3', text: 'Transformador elevador para usinas de 11 kV com primário em estrela.', isCorrect: false, feedback: 'Incorreto. É um transformador redutor de distribuição de média para baixa tensão.' },
        { id: 'opt4', text: 'Ligação monofásica a 2 fios com 11 derivações de regulação sob carga.', isCorrect: false, feedback: 'Incorreto. O transformador Dyn11 é trifásico com neutro.' }
      ]
    }
  ];
}

/**
 * Questões Temáticas Especializadas para Energia Solar Fotovoltaica (Módulo 11)
 */
function getModule11Questions(lessonId: string, norma: string): RawQuestion[] {
  return [
    {
      id: `${lessonId}_m11_voc_cold_temp`,
      question: 'Ao calcular o número máximo de módulos fotovoltaicos em série (string) para conectar a um inversor, qual grandeza de tensão deve ser calculada para a temperatura mínima histórica do local da usina solar?',
      scenario: 'Dimensionamento de sistemas fotovoltaicos on-grid e off-grid.',
      norma: 'IEC 62548 / IEC 60364-7-712',
      points: 20,
      explanation: 'O coeficiente de temperatura da tensão de circuito aberto (Voc) dos módulos solares é negativo (aproximadamente -0,28% a -0,35% / °C). Em manhãs frias de inverno com céu limpo, a tensão Voc sobe substancialmente. Se ultrapassar a tensão máxima de entrada do inversor (Vmax_inversor), danifica os componentes eletrônicos.',
      keyTakeaway: 'Mais frio = maior tensão Voc. Sempre dimensione o número máximo de painéis considerando o inverno mais rigoroso.',
      options: [
        { id: 'opt1', text: 'Tensão de Circuito Aberto máxima (Voc_max) calculada para a temperatura mínima recorde do local.', isCorrect: true, feedback: 'Perfeito! Evita a queima catastrófica do inversor por sobretensão ao amanhecer em dias frios.' },
        { id: 'opt2', text: 'Corrente de Curto-Circuito (Isc) calculada para 70 °C.', isCorrect: false, feedback: 'Incorreto. A corrente diminui ligeiramente com o frio e depende primordialmente do Sol.' },
        { id: 'opt3', text: 'Apenas a tensão média nominal informada na etiqueta do fabricante a 25 °C.', isCorrect: false, feedback: 'Incorreto. Ignorar o coeficiente de temperatura queima inversores no inverno.' },
        { id: 'opt4', text: 'Potência reativa capacitiva gerada pelo silício monocristalino.', isCorrect: false, feedback: 'Incorreto. Módulos fotovoltaicos produzem corrente contínua pura (DC), não reativos.' }
      ]
    },
    {
      id: `${lessonId}_m11_stringbox_dc_switch`,
      question: 'Por que é proibido pela norma IEC 60364-7-712 utilizar disjuntores de corrente alternada (CA) comuns na String Box de corrente contínua (CC) de um arranjo solar fotovoltaico?',
      scenario: 'Segurança contra arcos elétricos e incêndios em sistemas fotovoltaicos.',
      norma: 'IEC 60364-7-712',
      points: 20,
      explanation: 'A corrente alternada cruza o zero 100 vezes por segundo (em 50 Hz), o que facilita a extinção natural do arco elétrico na abertura dos contatos. A corrente contínua (CC) não passa pelo zero: ao abrir os contatos de um disjuntor CA sob alta tensão CC, forma-se um arco elétrico contínuo de plasma de alta temperatura que derrete o equipamento e incendeia o quadro.',
      keyTakeaway: 'Corrente contínua não tem passagem por zero; componentes CC possuem câmaras especiais de extinção de arco magnético.',
      options: [
        { id: 'opt1', text: 'A corrente contínua não possui passagem por zero, mantendo o arco elétrico que derrete e incendeia chaves comuns de CA.', isCorrect: true, feedback: 'Excelente! Disjuntores e seccionadores solares possuem ímãs e câmaras de extinção rápida de arco CC.' },
        { id: 'opt2', text: 'Porque disjuntores CA reduzem o rendimento de geração dos painéis em 50%.', isCorrect: false, feedback: 'Incorreto. O problema é de segurança contra incêndio e explosão por arco contínuo.' },
        { id: 'opt3', text: 'Porque a corrente alternada atrai raios atmosféricos para a estrutura de alumínio.', isCorrect: false, feedback: 'Incorreto. A atração de raios nada tem a ver com a tecnologia do disjuntor.' },
        { id: 'opt4', text: 'Disjuntores CA funcionam normalmente em CC desde que o cabo terra seja verde.', isCorrect: false, feedback: 'Incorreto e de altíssimo risco de incêndio! A norma proíbe expressamente dispositivos CA em strings CC.' }
      ]
    }
  ];
}

/**
 * Questões Temáticas Especializadas para Instrumentação e Manutenção (Módulo 7)
 */
function getModule7Questions(lessonId: string, norma: string): RawQuestion[] {
  return [
    {
      id: `${lessonId}_m7_insulation_megger`,
      question: 'Ao realizar ensaio de resistência de isolamento (Megômetro / Megger) em um circuito de baixa tensão (230/400 V) segundo a IEC 60364-6, qual tensão de ensaio contínua (DC) deve ser injetada e qual o valor mínimo regulamentar de resistência admissível?',
      scenario: 'Comissionamento e inspeção de isolamento de cabos após puxamento em eletrodutos.',
      norma: 'IEC 60364-6',
      points: 20,
      explanation: 'Para circuitos com tensão nominal de até 500 V (como as redes de 230/400 V da EDM), a norma IEC 60364-6 estipula tensão de ensaio de 500 V DC e resistência de isolamento mínima de 1,0 MΩ (1000 kΩ) entre condutores vivos e condutores vivos e a terra.',
      keyTakeaway: 'Ensaio de isolamento em 230/400 V: Tensão de teste = 500 V DC | Resistência mínima = 1,0 MΩ.',
      options: [
        { id: 'opt1', text: 'Tensão de ensaio de 500 V DC e resistência mínima aceitável de 1,0 MΩ (1 Megaohm).', isCorrect: true, feedback: 'Correto! 500 V contínuos e mínimo de 1 MΩ conforme a tabela da IEC 60364-6.' },
        { id: 'opt2', text: 'Tensão de 12 V alternados e resistência mínima de 10 Ω.', isCorrect: false, feedback: 'Incorreto. 12 V não polariza o dielétrico para testar a rigidez do isolamento de PVC/XLPE.' },
        { id: 'opt3', text: 'Tensão de 10.000 V contínuos e resistência de no mínimo 0,1 Ω.', isCorrect: false, feedback: 'Incorreto. 10 kV perfuraria o isolamento de cabos de baixa tensão destruindo a fiação.' },
        { id: 'opt4', text: 'O ensaio deve ser feito com o circuito energizado em 230 V medindo corrente de curto.', isCorrect: false, feedback: 'Incorreto e letal. Medir isolamento com rede ligada queima o megômetro e causa arco elétrico.' }
      ]
    },
    {
      id: `${lessonId}_m7_true_rms_clamp`,
      question: 'Por que é indispensável utilizar um alicate amperímetro com tecnologia True-RMS (Valor Eficaz Verdadeiro) para medir correntes em instalações com inversores, computadores e no-breaks?',
      scenario: 'Diagnóstico de sobrecarga em condutores neutros por correntes harmônicas.',
      norma: 'IEC 61010 / IEC 61557',
      points: 20,
      explanation: 'Cargas não lineares (fontes chaveadas, retificadores, inversores) distorcem a onda de corrente, que deixa de ser uma senóide pura e torna-se rica em harmônicos (3º, 5º, 7º). Instrumentos comuns de resposta média erram a leitura em até 40% a menos, mascarando sobrecargas térmicas perigosas.',
      keyTakeaway: 'Alicates comuns medem apenas senóides puras; cargas eletrônicas distorcidas exigem True-RMS.',
      options: [
        { id: 'opt1', text: 'Cargas eletrônicas geram formas de onda não senoidais distorcidas; medidores comuns erram em até 40% a menos da corrente real.', isCorrect: true, feedback: 'Exato! O True-RMS calcula a raiz quadrada média real da forma de onda independente da distorção.' },
        { id: 'opt2', text: 'Para evitar que o instrumento consuma a energia do circuito que está sendo medido.', isCorrect: false, feedback: 'Incorreto. Alicates amperímetros usam indução magnética ou efeito Hall e não drenam carga.' },
        { id: 'opt3', text: 'Porque instrumentos comuns funcionam exclusivamente com pilhas recarregáveis solares.', isCorrect: false, feedback: 'Incorreto. A tecnologia True-RMS refere-se ao algoritmo de cálculo matemático do sinal elétrico.' },
        { id: 'opt4', text: 'True-RMS é exigido apenas se o condutor for de alumínio em vez de cobre.', isCorrect: false, feedback: 'Incorreto. A forma da onda independe do material metálico condutor.' }
      ]
    }
  ];
}

/**
 * Constrói uma questão técnica personalizada a partir do Field Case real da Lição
 */
function buildFieldCaseQuestion(lesson: AcademyLesson): RawQuestion | null {
  const fc = lesson.theory?.fieldCase;
  if (!fc || !fc.cenario || !fc.diagnostico || !fc.solucaoNormativa) return null;

  return {
    id: `${lesson.id}_field_case`,
    question: `[Estudo de Caso Real - ${fc.localizacao || 'Moçambique'}] Diante do seguinte cenário de campo: "${fc.cenario.substring(0, 140)}...", qual foi o diagnóstico técnico conclusivo e a solução normativa aplicada?`,
    scenario: `${fc.cenario}`,
    norma: lesson.norma || 'IEC 60364',
    points: 20,
    explanation: `Diagnóstico: ${fc.diagnostico} Solução Normativa aplicada: ${fc.solucaoNormativa}`,
    keyTakeaway: `Solução de campo: ${fc.solucaoNormativa}`,
    options: [
      {
        id: 'opt_fc_1',
        text: `${fc.diagnostico.substring(0, 110)}... Solução: ${fc.solucaoNormativa.substring(0, 90)}...`,
        isCorrect: true,
        feedback: `Correto! Este é o diagnóstico e a solução normativa auditada no caso real.`
      },
      {
        id: 'opt_fc_2',
        text: 'Apenas substituição imediata dos fusíveis por outros de maior capacidade sem recalcular a queda de tensão.',
        isCorrect: false,
        feedback: 'Incorreto. Aumentar fusível sem corrigir a bitola do cabo causa superaquecimento e incêndio.'
      },
      {
        id: 'opt_fc_3',
        text: 'Desconexão do condutor de terra PE para neutralizar os desarmes do relé de proteção.',
        isCorrect: false,
        feedback: 'Incorreto e criminoso. Desconectar o terra coloca em risco a vida dos operadores.'
      },
      {
        id: 'opt_fc_4',
        text: 'Instalação de transformador elevador improvisado no final da linha sem alterar a fiação.',
        isCorrect: false,
        feedback: 'Incorreto. Solução incorreta que agravaria ainda mais as perdas por efeito Joule na fiação fina.'
      }
    ]
  };
}

/**
 * Constrói uma questão técnica personalizada a partir de Fórmulas e Cálculos da Lição
 */
function buildFormulaQuestion(lesson: AcademyLesson): RawQuestion | null {
  const formulas = lesson.theory?.formulas;
  if (!formulas || formulas.length === 0) return null;

  const f = formulas[0];
  return {
    id: `${lesson.id}_formula_core`,
    question: `No dimensionamento técnico e conformidade com a norma ${lesson.norma}, como se aplica e interpreta a fórmula "${f.label}": [ ${f.formula} ]?`,
    scenario: `Cálculo de projeto para ${lesson.title}.`,
    norma: lesson.norma || 'IEC 60364',
    points: 20,
    explanation: `A expressão "${f.formula}" representa: ${f.explicacao}. É a base matemática mandatória para cálculos de projeto da ${lesson.norma}.`,
    keyTakeaway: `${f.label}: ${f.formula} (${f.explicacao})`,
    options: [
      {
        id: 'opt_fm_1',
        text: `${f.explicacao} regido rigorosamente pela fórmula ${f.formula}.`,
        isCorrect: true,
        feedback: `Perfeito! ${f.explicacao}.`
      },
      {
        id: 'opt_fm_2',
        text: `Esta fórmula aplica-se exclusivamente a baterias químicas em circuito aberto, não a condutores.`,
        isCorrect: false,
        feedback: `Incorreto. A expressão é fundamental para ${lesson.title}.`
      },
      {
        id: 'opt_fm_3',
        text: `Representa o cancelamento total de potências reativas sem necessidade de condutor de fase.`,
        isCorrect: false,
        feedback: `Incorreto. Não condiz com o fundamento de ${f.label}.`
      },
      {
        id: 'opt_fm_4',
        text: `Indica que a resistência ôhmica cai para zero quando a corrente atinge seu pico máximo.`,
        isCorrect: false,
        feedback: `Incorreto. A resistência é uma propriedade física e não cai a zero em condutores normais.`
      }
    ]
  };
}

/**
 * Constrói questões técnicas a partir dos Pontos Operacionais da Lição
 */
function buildOperationalPointsQuestions(lesson: AcademyLesson): RawQuestion[] {
  const pts = lesson.theory?.pontosOperacionais;
  if (!pts || pts.length === 0) return [];

  const results: RawQuestion[] = [];

  pts.forEach((ptText, pIdx) => {
    if (pIdx > 2) return; // Máximo 3 questões de pontos operacionais por aula
    results.push({
      id: `${lesson.id}_oper_pt_${pIdx + 1}`,
      question: `Em relação às boas práticas e procedimentos de segurança na execução de "${lesson.title}", qual diretriz operacional deve ser estritamente cumprida pelo técnico credenciado?`,
      scenario: `Procedimentos de montagem, teste e segurança segundo ${lesson.norma}.`,
      norma: lesson.norma || 'IEC 60364',
      points: 20,
      explanation: `Diretriz operacional normativa: ${ptText}`,
      keyTakeaway: `Regra de operação: ${ptText.substring(0, 100)}...`,
      options: [
        {
          id: `opt_op_true_${pIdx}`,
          text: ptText,
          isCorrect: true,
          feedback: 'Correto! Esta é a prescrição técnica de segurança recomendada pela norma.'
        },
        {
          id: `opt_op_false1_${pIdx}`,
          text: 'Realizar ajustes mecânicos de torque e conexões elétricas com a rede 100% energizada sem uso de EPI.',
          isCorrect: false,
          feedback: 'Incorreto e gravíssimo. O trabalho desenergizado é a primeira regra de segurança.'
        },
        {
          id: `opt_op_false2_${pIdx}`,
          text: 'Ignorar a elevação de temperatura ambiente na capacidade de condução de corrente dos cabos.',
          isCorrect: false,
          feedback: 'Incorreto. A temperatura ambiente altera a capacidade térmica dos condutores (fator de correção).'
        },
        {
          id: `opt_op_false3_${pIdx}`,
          text: 'Substituir condutores de cobre dimensionados por arames de ferro zincado em caso de emergência.',
          isCorrect: false,
          feedback: 'Incorreto. O ferro possui alta resistividade e causaria superaquecimento e incêndio imediato.'
        }
      ]
    });
  });

  return results;
}

/**
 * Gerador de Banco de 15 a 25 Questões Técnicas Especializadas para qualquer lição (ZERO TEMPLATES)
 */
export function generateQuestionPoolForLesson(lesson: AcademyLesson): AssessmentMCQuestion[] {
  const code = (lesson.code || '').toLowerCase();
  const title = (lesson.title || '').toLowerCase();
  const norma = lesson.norma || 'IEC 60364';

  const pool: AssessmentMCQuestion[] = [];

  // 1. QUESTÃO NÚCLEO ORIGINAL DA AULA (Se disponível no quiz da lição)
  if (lesson.quiz && lesson.quiz.question && lesson.quiz.options && lesson.quiz.options.length >= 4) {
    pool.push({
      id: `${lesson.id}_core_quiz`,
      type: 'multiple_choice',
      question: lesson.quiz.question,
      scenario: `Fundamentação teórica de ${lesson.title}.`,
      norma: lesson.norma,
      points: 20,
      explanation: lesson.quiz.explanation || 'Conceito e cálculo normativo da lição.',
      keyTakeaway: lesson.quiz.keyTakeaway || 'Regra de ouro técnica da aula.',
      options: lesson.quiz.options.map((o: any) => ({
        id: o.id || String(Math.random()),
        text: o.text,
        isCorrect: o.isCorrect,
        feedback: o.feedback || (o.isCorrect ? 'Alternativa correta!' : 'Alternativa incorreta.')
      }))
    });
  }

  // 2. QUESTÕES DO FIELD CASE REAL (Se existir)
  const fcQ = buildFieldCaseQuestion(lesson);
  if (fcQ) pool.push(fcQ as AssessmentMCQuestion);

  // 3. QUESTÕES DE FÓRMULA E CÁLCULO REAL (Se existir)
  const fmQ = buildFormulaQuestion(lesson);
  if (fmQ) pool.push(fmQ as AssessmentMCQuestion);

  // 4. QUESTÕES DOS PONTOS OPERACIONAIS (Até 3 questões)
  const opQs = buildOperationalPointsQuestions(lesson);
  opQs.forEach(q => pool.push(q as AssessmentMCQuestion));

  // 5. QUESTÕES ESPECIALIZADAS POR MÓDULO E CONTEÚDO (M1 a M11)
  let specialized: RawQuestion[] = [];

  if (code.includes('m1_') || title.includes('física') || title.includes('ohm') || title.includes('potência') || title.includes('kirchhoff')) {
    specialized = getModule1Questions(lesson.id, norma);
  } else if (code.includes('m2_') || title.includes('instalaç') || title.includes('esquemas') || title.includes('tomada') || title.includes('ilumina')) {
    specialized = getModule2Questions(lesson.id, norma);
  } else if (code.includes('m3_') || title.includes('proteç') || title.includes('disjuntor') || title.includes('residual') || title.includes('aterramento') || title.includes('dps')) {
    specialized = getModule3Questions(lesson.id, norma);
  } else if (code.includes('m4_') || title.includes('eletrônic') || title.includes('diodo') || title.includes('retifica') || title.includes('transistor')) {
    specialized = getModule4Questions(lesson.id, norma);
  } else if (code.includes('m5_') || title.includes('comando') || title.includes('motor') || title.includes('contator') || title.includes('inversor')) {
    specialized = getModule5Questions(lesson.id, norma);
  } else if (code.includes('m6_') || code.includes('m8_') || title.includes('média tensão') || title.includes('transformador') || title.includes('rede')) {
    specialized = getModule6And8Questions(lesson.id, norma);
  } else if (code.includes('m7_') || title.includes('manutenç') || title.includes('multímetro') || title.includes('megômetro') || title.includes('diagnóstic')) {
    specialized = getModule7Questions(lesson.id, norma);
  } else if (code.includes('m11_') || title.includes('solar') || title.includes('fotovoltaic') || title.includes('mppt')) {
    specialized = getModule11Questions(lesson.id, norma);
  } else {
    // Para outros módulos, mescla questões normativas de segurança e medição
    specialized = [
      ...getModule3Questions(lesson.id, norma),
      ...getModule7Questions(lesson.id, norma)
    ];
  }

  // Adiciona as questões especializadas evitando IDs duplicadas
  specialized.forEach(sq => {
    if (!pool.some(p => p.id === sq.id)) {
      pool.push(sq as AssessmentMCQuestion);
    }
  });

  // Garante que o pool tenha sempre pelo menos 15 questões distintas e ricas
  if (pool.length < 15) {
    const backupSources = [
      ...getModule1Questions(lesson.id, norma),
      ...getModule2Questions(lesson.id, norma),
      ...getModule3Questions(lesson.id, norma),
      ...getModule5Questions(lesson.id, norma),
      ...getModule7Questions(lesson.id, norma)
    ];
    for (const bq of backupSources) {
      if (pool.length >= 18) break;
      if (!pool.some(p => p.id === bq.id)) {
        pool.push(bq as AssessmentMCQuestion);
      }
    }
  }

  return pool;
}

/**
 * Função geradora dinâmica de avaliações:
 * 1. Seleciona rigorosamente 5 questões autênticas de Múltipla Escolha.
 * 2. Aplica algoritmo ANTI-REPETIÇÃO com localStorage:
 *    - Filtra as questões já vistas anteriormente na mesma aula pelo aluno no dispositivo.
 *    - Se as não vistas forem insuficientes (< 5), reseta a lista de vistas e reinicia o ciclo limpo.
 *    - Salva as IDs sorteadas para proibir repetição nas próximas tentativas.
 * 3. Embaralha as alternativas A, B, C e D usando Fisher-Yates (garantindo que o gabarito nunca fique fixo na mesma letra).
 * 4. Removidas 100% de quaisquer questões descritivas/abertas.
 * 5. Critério normativo: >= 80% = ALCANÇADO | < 80% = NÃO ALCANÇADO.
 */
export function generateAssessmentForLesson(
  lesson: AcademyLesson,
  attemptNumber: number = 1,
  technicianName: string = 'Técnico Autorizado',
  technicianId: string = 'guest'
): AssessmentAttempt {
  // 1. Obter o banco extenso completo da lição (15 a 25 questões ricas e sem templates)
  const fullPool = generateQuestionPoolForLesson(lesson);

  // 2. Algoritmo Anti-Repetição baseado no localStorage
  const seenIds = getSeenQuestionIds(lesson.id);
  let candidates = fullPool.filter((q: AssessmentMCQuestion) => !seenIds.includes(q.id));

  // Se o banco foi esgotado (menos de 5 questões inéditas restantes), reinicia o ciclo
  if (candidates.length < 5) {
    resetSeenQuestionsForLesson(lesson.id);
    candidates = [...fullPool];
  }

  // Embaralhar candidatos com Fisher-Yates
  const shuffledCandidates = [...candidates];
  for (let i = shuffledCandidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = shuffledCandidates[i];
    shuffledCandidates[i] = shuffledCandidates[j];
    shuffledCandidates[j] = temp;
  }

  // Selecionar exatamente 5 questões de múltipla escolha
  const selectedQuestions = shuffledCandidates.slice(0, 5);

  // Salvar as IDs das questões selecionadas no localStorage para não repetir na reavaliação
  const selectedIds = selectedQuestions.map((q: AssessmentMCQuestion) => q.id);
  saveSeenQuestionIds(lesson.id, selectedIds);

  // Embaralhar as alternativas A, B, C, D de cada questão individualmente
  const formattedMC = selectedQuestions.map((q: AssessmentMCQuestion) => ({
    ...q,
    points: 20, // 5 questões × 20 pontos = 100 pontos totais
    options: shuffleOptionsWithLabels(q.options)
  }));

  // Geração de código de autenticidade único para o exame
  const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const authCode = `TMZ-ACAD-${dateStr}-${randomHex}`;

  return {
    attemptId: `${lesson.id}_att_${Date.now()}`,
    attemptNumber,
    maxAttempts: 3, // 1ª Avaliação + 2 Reavaliações permitidas
    lessonId: lesson.id,
    lessonCode: lesson.code || 'EC',
    lessonTitle: lesson.title,
    moduleTitle: lesson.moduleTitle,
    norma: lesson.norma,
    technicianName,
    technicianId,
    date: new Date().toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    authCode,
    mcQuestions: formattedMC,
    mcAnswers: {},
    mcEarnedPoints: 0,
    mcTotalPoints: 100,
    correctAnswersCount: 0,
    totalQuestionsCount: formattedMC.length,
    finalScorePercent: 0,
    status: 'NAO_ALCANCA',
    isPassed: false
  };
}
