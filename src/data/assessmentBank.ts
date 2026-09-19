import {
  AcademyLesson
} from '../types/academy';
import {
  AssessmentMCQuestion,
  AssessmentDescriptiveQuestion,
  AssessmentAttempt,
  ShuffledAssessmentOption
} from '../types/assessment';

/**
 * Embaralhamento rigoroso Fisher-Yates para garantir distribuição uniforme do gabarito.
 * É estritamente proibido que a resposta correta fique sempre na mesma alternativa (ex: sempre B).
 */
export function shuffleOptionsWithLabels(
  options: { id: string; text: string; isCorrect: boolean; feedback: string }[]
): ShuffledAssessmentOption[] {
  const letters: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D'];
  const shuffled = [...options];

  // Fisher-Yates shuffle
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // Atribuição de novas letras sequenciais A, B, C, D após o embaralhamento
  return shuffled.map((opt, idx) => ({
    ...opt,
    displayLetter: letters[idx] || 'D'
  }));
}

// Banco Especializado de Questões por Elemento de Competência (EC)
// Contém Múltipla Escolha (Set 1 e Set 2 para Reavaliação) e Questões Descritivas Técnicas
interface ECQuestionBank {
  mcSet1: AssessmentMCQuestion[];
  mcSet2: AssessmentMCQuestion[]; // Banco de Reavaliação (Perguntas Inéditas)
  descSet1: AssessmentDescriptiveQuestion[];
  descSet2: AssessmentDescriptiveQuestion[]; // Banco de Reavaliação
}

export const ASSESSMENT_BANK: Record<string, ECQuestionBank> = {
  // ==========================================================================
  // EC 1.1: Grandezas Fundamentais e Lei de Ohm Aplicada (IEC 60038 / IEC 60364-1)
  // ==========================================================================
  elec_m1_ec1_grandezas_ohm: {
    mcSet1: [
      {
        id: 'elec_ec1_mc1',
        type: 'multiple_choice',
        question: 'Um aquecedor industrial de água em Moçambique opera sob tensão nominal de 230 V monofásico 50 Hz consumindo 10 A de corrente nominal em regime contínuo. Ao medir a resistência da resistência desligada em bancada, qual valor ôhmico teórico deve ser obtido segundo a 1ª Lei de Ohm?',
        scenario: 'Manutenção preventiva em boiler industrial de 2,3 kW em Maputo.',
        diagramId: 'distribution_board_qgd',
        diagramTitle: 'Quadro Geral de Alimentação da Carga Resistiva',
        norma: 'IEC 60038 / IEC 60364-1',
        points: 20,
        explanation: 'Pela 1ª Lei de Ohm: R = V / I = 230 V / 10 A = 23 Ω.',
        keyTakeaway: 'R = V / I. Resistência abaixo de 23 Ω indicaria espiras em curto; resistência infinita indicaria filamento rompido.',
        options: [
          { id: 'opt_1', text: '23 Ω exatos calculados por R = V / I.', isCorrect: true, feedback: 'Excelente! R = 230 V / 10 A = 23 Ω.' },
          { id: 'opt_2', text: '2,3 Ω decorrentes da impedância do cobre.', isCorrect: false, feedback: 'Incorreto. 2,3 Ω drenaria 100 A, causando queima instantânea do condutor.' },
          { id: 'opt_3', text: '2300 Ω correspondentes à potência ativa em watts.', isCorrect: false, feedback: 'Incorreto. 2300 é a potência em Watts, não a resistência em Ohms.' },
          { id: 'opt_4', text: 'Zero Ohms por se tratar de carga puramente resistiva.', isCorrect: false, feedback: 'Incorreto. 0 Ω é a definição física de um curto-circuito pleno.' }
        ]
      },
      {
        id: 'elec_ec1_mc2',
        type: 'multiple_choice',
        question: 'Em uma linha alimentadora em Moçambique de 100 metros de comprimento em condutores de cobre (resistividade ρ = 0,0225 Ω·mm²/m a 70°C), qual é a consequência técnica imediata do aumento excessivo da temperatura ambiente (ex: 42°C em Tete) sobre a resistência elétrica dos cabos?',
        scenario: 'Dimensionamento de alimentador externo sob sol escaldante na província de Tete.',
        norma: 'IEC 60364-5-52',
        points: 20,
        explanation: 'O cobre tem coeficiente de temperatura positivo (α = +0,00393/°C). O aumento da temperatura eleva a resistividade ρ, aumentando a resistência ôhmica total do cabo e agravando a queda de tensão.',
        keyTakeaway: 'Temperatura elevada = maior resistência ôhmica = maior queda de tensão e menor capacidade de corrente (Iz).',
        options: [
          { id: 'opt_1', text: 'A resistência ôhmica diminui, facilitando a condução de elétrons livres.', isCorrect: false, feedback: 'Incorreto. Em condutores metálicos como o cobre, o aquecimento aumenta a vibração da rede cristalina e eleva a resistência.' },
          { id: 'opt_2', text: 'A resistência ôhmica se eleva, provocando maior queda de tensão (ΔU) e perdas Joule no alimentador.', isCorrect: true, feedback: 'Correto! Coeficiente térmico positivo do cobre eleva R e agrava a queda de tensão.' },
          { id: 'opt_3', text: 'A resistência permanece constante, pois depende apenas da seção transversal em milímetros quadrados.', isCorrect: false, feedback: 'Incorreto. A resistência depende de R = ρ·(L/S), e a resistividade ρ varia fortemente com a temperatura.' },
          { id: 'opt_4', text: 'A tensão da rede pública da EDM dobra automaticamente para compensar a dissipação.', isCorrect: false, feedback: 'Incorreto. A tensão da concessionária é independente do aquecimento pontual da fiação interna.' }
        ]
      },
      {
        id: 'elec_ec1_mc3',
        type: 'multiple_choice',
        question: 'Segundo as normas de segurança IEC 61010, qual procedimento de medição com multímetro digital em bancada causará queima catastrófica do fusível interno ou do aparelho?',
        scenario: 'Aferição de grandezas elétricas no quadro geral por eletricista recém-admitido.',
        norma: 'IEC 61010-1',
        points: 20,
        explanation: 'Tentar medir resistência (escala de Ohms) ou continuidade com o circuito energizado coloca a fonte de tensão diretamente sobre a ponte de medição interna de baixa impedância do multímetro.',
        keyTakeaway: 'Regra de ouro: Medição de Resistência (Ω) e Continuidade SEMPRE com circuito desenergizado.',
        options: [
          { id: 'opt_1', text: 'Medir tensão alternada (VAC) colocando as pontas de prova em paralelo com a fase e o neutro.', isCorrect: false, feedback: 'Incorreto. A medição de tensão é feita exatamente em paralelo.' },
          { id: 'opt_2', text: 'Medir corrente alternada com alicate amperímetro envolvendo apenas um único condutor de fase.', isCorrect: false, feedback: 'Incorreto. Essa é a forma correta de usar alicate amperímetro.' },
          { id: 'opt_3', text: 'Inserir as pontas de prova na escala de Resistência (Ω) em um circuito energizado a 230 V.', isCorrect: true, feedback: 'Correto! Medir ohms em circuito energizado queima o fusível interno e destrói o conversor A/D.' },
          { id: 'opt_4', text: 'Verificar a presença de fase encostando a ponta de prova em detector de tensão por indução sem contato.', isCorrect: false, feedback: 'Incorreto. O detector de campo elétrico sem contato é seguro e normatizado.' }
        ]
      }
    ],
    mcSet2: [
      {
        id: 'elec_ec1_mc4_var',
        type: 'multiple_choice',
        question: 'Uma carga monofásica puramente resistiva de 4600 W está conectada à rede de 230 V 50 Hz. Se a tensão fornecida pela rede cair 10% (ficando em 207 V devido à sobrecarga de linha), qual será a nova potência dissipada pela carga?',
        scenario: 'Reavaliação de Competência: Variação de tensão e potência Joule (P = V² / R).',
        norma: 'IEC 60038',
        points: 20,
        explanation: 'A resistência é R = 230² / 4600 = 11,5 Ω. Com V = 207 V, a potência é P = 207² / 11,5 = 3726 W (uma redução de 19%, pois a potência varia com o quadrado da tensão).',
        keyTakeaway: 'Em cargas resistivas, P varia com V². Uma queda de 10% na tensão reduz a potência em cerca de 19%.',
        options: [
          { id: 'opt_v1', text: '4140 W, reduzindo exatamente 10% de forma estritamente linear.', isCorrect: false, feedback: 'Incorreto. A potência depende do quadrado da tensão (P = V²/R).' },
          { id: 'opt_v2', text: '3726 W, pois a potência diminui com o quadrado da tensão aplicada (207² / 11,5 Ω).', isCorrect: true, feedback: 'Exato! P = V²/R resulta em 3726 W (queda de 19% na potência gerada).' },
          { id: 'opt_v3', text: '5100 W, porque a corrente sobe para compensar a queda de tensão em carga resistiva.', isCorrect: false, feedback: 'Incorreto. Em cargas resistivas, menor tensão implica menor corrente (I = V/R).' },
          { id: 'opt_v4', text: '2300 W, caindo pela metade devido ao desbalanceamento.', isCorrect: false, feedback: 'Incorreto. O cálculo exato decorre da relação quadrática.' }
        ]
      },
      {
        id: 'elec_ec1_mc5_var',
        type: 'multiple_choice',
        question: 'Segundo o triângulo de potências da IEC 60027, quando alimentamos uma carga indutiva (motor elétrico de indução), qual relação trigonométrica define a Potência Aparente (S, em kVA)?',
        scenario: 'Reavaliação: Cargas reativas e correção do fator de potência industrial.',
        diagramId: 'direct_motor_starter',
        diagramTitle: 'Esquema de Partida de Motor de Indução Trifásico',
        norma: 'IEC 60027',
        points: 20,
        explanation: 'A potência aparente S é a hipotenusa do triângulo de potências: S = √(P² + Q²), onde P é a potência ativa em kW e Q é a potência reativa em kvar.',
        keyTakeaway: 'S = √(P² + Q²). O fator de potência é cos(φ) = P / S.',
        options: [
          { id: 'opt_v1', text: 'S = P + Q por soma aritmética simples.', isCorrect: false, feedback: 'Incorreto. P e Q estão em quadratura de fase (90° de defasagem), exigindo soma vetorial.' },
          { id: 'opt_v2', text: 'S = √(P² + Q²), correspondente à soma vetorial fasorial da potência ativa e reativa.', isCorrect: true, feedback: 'Correto! A potência aparente em kVA é a hipotenusa fasorial.' },
          { id: 'opt_v3', text: 'S = P / Q apenas quando o fator de potência for unitário.', isCorrect: false, feedback: 'Incorreto. P/Q é a cotangente do ângulo de defasagem.' },
          { id: 'opt_v4', text: 'S = V × I × cos(φ) para regime senoidal permanente.', isCorrect: false, feedback: 'Incorreto. V × I × cos(φ) é a fórmula da potência ativa P, não da potência aparente S.' }
        ]
      },
      {
        id: 'elec_ec1_mc6_var',
        type: 'multiple_choice',
        question: 'Em uma instalação trifásica equilibrada a quatro fios (3F+N) em Moçambique com 400 V entre fases e 230 V entre qualquer fase e o condutor neutro, qual deve ser a corrente teórica circulando pelo condutor neutro em condições ideais de equilíbrio de cargas?',
        scenario: 'Reavaliação: Balanceamento de fases no barramento principal.',
        diagramId: 'distribution_board_qgd',
        diagramTitle: 'Barramento Tetrapolar QGD - Distribuição Equilibrada',
        norma: 'IEC 60364-1',
        points: 20,
        explanation: 'Pela 1ª Lei de Kirchhoff (Lei dos Nós), a soma fasorial das correntes em um sistema trifásico equilibrado com defasagem angular de 120° é nula: I_N = I_L1 + I_L2 + I_L3 = 0 A.',
        keyTakeaway: 'Carga perfeitamente equilibrada = Corrente nula no neutro (I_N = 0 A).',
        options: [
          { id: 'opt_v1', text: 'Três vezes a corrente da fase de maior carga.', isCorrect: false, feedback: 'Incorreto. As correntes se cancelam fasorialmente devido ao ângulo de 120°.' },
          { id: 'opt_v2', text: 'Aproximadamente zero amperes (I_N ≈ 0 A) devido ao cancelamento vetorial a 120°.', isCorrect: true, feedback: 'Exato! A soma fasorial das 3 fases equilibradas é nula no neutro.' },
          { id: 'opt_v3', text: 'A média aritmética simples das três correntes de fase.', isCorrect: false, feedback: 'Incorreto. A eletrotécnica AC opera com fasores angulares, não médias simples.' },
          { id: 'opt_v4', text: 'Igual à corrente de curto-circuito simétrica da subestação.', isCorrect: false, feedback: 'Incorreto. Essa corrente só ocorre em falha franca para a terra.' }
        ]
      }
    ],
    descSet1: [
      {
        id: 'elec_ec1_desc1',
        type: 'descriptive',
        title: 'Diagnóstico de Queda de Tensão Crítica em Bomba Submersível de 1,5 kW',
        question: 'Explique passo a passo o procedimento técnico de diagnóstico de queda de tensão em campo. Indique quais medições você deve executar, com qual instrumento, a fórmula da queda de tensão (ΔU), e justifique a solução normativa de aumento de seção de condutor segundo a IEC 60364.',
        contextScenario: 'Um agricultor em Boane relata que sua eletrobomba submersível monofásica de 230V 1,5 kW (9,5 A nominais), localizada a 110 metros do quadro elétrico principal, desliga misteriosamente após alguns minutos de funcionamento nos horários de pico.',
        diagramId: 'water_pump_automation',
        diagramTitle: 'Diagrama Unifilar do Circuito Alimentador da Eletrobomba',
        norma: 'IEC 60364-5-52 / IEC 60038',
        expectedKeywords: ['queda de tensão', 'multímetro', 'tensão nos bornes', 'seção do cabo', 'resistência', 'efeito joule', 'relé térmico'],
        points: 40,
        guidelineAnswer: 'Procedimento correto: 1) Medir a tensão no quadro geral (230 V) e nos bornes do motor durante a partida e em operação contínua com multímetro True-RMS. 2) Se a tensão na bomba cair para menos de 218 V (queda > 5% limite da IEC), o motor drena sobrecorrente para manter a potência mecânica, superaquecendo as bobinas e disparando o protetor térmico. 3) Calcular a resistência do condutor R = 2·ρ·(L/S). 4) Substituir o condutor subdimensionado (ex: 1,5 mm²) por seção adequada (mínimo 4 mm² ou 6 mm²), reduzindo a resistência de loop para restabelecer a tensão dentro da faixa nominal da EDM (230 V ± 10%).',
        rubricCriteria: [
          { criterion: 'Identificação da causa raiz: Queda de tensão excessiva na linha de 110m provocando sobrecorrente e desarme térmico.', weightPercent: 35 },
          { criterion: 'Procedimento metrológico de medição nos bornes com carga e circuito energizado via multímetro.', weightPercent: 25 },
          { criterion: 'Aplicação da fórmula e justificativa do aumento de seção do condutor (S em mm²) conforme IEC 60364.', weightPercent: 40 }
        ]
      }
    ],
    descSet2: [
      {
        id: 'elec_ec1_desc2_var',
        type: 'descriptive',
        title: 'Reavaliação: Superaquecimento de Linha por Efeito Joule e Sobrecarga Térmica',
        question: 'Descreva a fundamentação física do Efeito Joule (P = R·I²) em cabos elétricos. Quais são os riscos normativos de instalar um cabo com bitola inferior à capacidade de corrente calculada? Detalhe 3 verificações operacionais indispensáveis antes de liberar a instalação.',
        contextScenario: 'Durante vistoria técnica em um armazém frigorífico em Nacala, o técnico detecta canaletas plásticas deformadas pelo calor excessivo de cabos de 2,5 mm² alimentando motores de compressores que drenam 22 A continuamente.',
        diagramId: 'distribution_board_qgd',
        diagramTitle: 'Esquema de Alimentadores e Proteção Termomagnética',
        norma: 'IEC 60364-4-43 / IEC 60364-5-52',
        expectedKeywords: ['efeito joule', 'degradação do isolamento', 'capacidade de condução', 'disjuntor', 'temperatura', 'seção transversal'],
        points: 40,
        guidelineAnswer: 'Pelo Efeito Joule, a potência dissipada em forma de calor na fiação é P = R × I². Cabos de 2,5 mm² em PVC possuem corrente admissível máxima de cerca de 18-21 A em método de referência. Sob 22 A contínuos, a temperatura ultrapassa o limite térmico de 70°C do PVC, degradando irreversivelmente a isolação dielétrica com risco iminente de curto-circuito e incêndio. Verificações: 1) Substituição imediata dos cabos por condutores de 4 mm² ou 6 mm²; 2) Coordenação correta do disjuntor termomagnético (Ib ≤ In ≤ Iz); 3) Medição termográfica de temperatura das conexões e teste de isolamento com megômetro a 500V.',
        rubricCriteria: [
          { criterion: 'Explicação física do Efeito Joule (P = R·I²) e relação entre corrente e calor.', weightPercent: 30 },
          { criterion: 'Diagnóstico do risco de perda de isolamento PVC (> 70°C) e curto-circuito.', weightPercent: 35 },
          { criterion: 'Proposta de adequação da seção do cabo e coordenação com a proteção conforme IEC 60364-4-43.', weightPercent: 35 }
        ]
      }
    ]
  },

  // ==========================================================================
  // EC 3.1: Proteção Contra Sobretensões Transitórias (DPS) IEC 61643-11 / IEC 60364-5-53
  // ==========================================================================
  elec_m3_ec1_dps_sobretensoes: {
    mcSet1: [
      {
        id: 'elec_ec3_mc1',
        type: 'multiple_choice',
        question: 'Em regiões com elevado índice isoceráunico em Moçambique (como Tete, Zambézia e Niassa), qual é a configuração recomendada de Descarregadores de Sobretensão (DPS) na entrada de um edifício alimentado por linha aérea segundo a IEC 60364-5-53?',
        scenario: 'Projeto de proteção atmosférica para edifício comercial em Tete.',
        diagramId: 'distribution_board_qgd',
        diagramTitle: 'Quadro Geral com Disposição de DPS Classe I+II e Barramento BEP',
        norma: 'IEC 61643-11 / IEC 60364-5-53',
        points: 20,
        explanation: 'Linhas aéreas expostas exigem DPS Classe I (capaz de drenar correntes parciais de raio em onda 10/350 μs) no quadro principal, associado a DPS Classe II (onda 8/20 μs) nos quadros de distribuição.',
        keyTakeaway: 'Entrada aérea exposta = DPS Classe I (10/350 μs) no QGD principal.',
        options: [
          { id: 'opt_1', text: 'Instalar apenas DPS Classe III nos filtros de linha das tomadas.', isCorrect: false, feedback: 'Incorreto. DPS Classe III só suporta pequenas sobretensões residuais em eletrônicos.' },
          { id: 'opt_2', text: 'DPS combinado Classe I+II (onda 10/350 μs e 8/20 μs) no Quadro Geral de Distribuição (QGD).', isCorrect: true, feedback: 'Perfeito! Classe I+II suporta o impacto direto de raios e sobretensões de comutação.' },
          { id: 'opt_3', text: 'Disjuntor termomagnético curva C de 32 A dispensa o uso de DPS.', isCorrect: false, feedback: 'Incorreto. Disjuntores comuns não protegem contra picos de microssegundos de sobretensão.' },
          { id: 'opt_4', text: 'Eliminar a conexão de aterramento do DPS para evitar que o raio entre no prédio.', isCorrect: false, feedback: 'Incorreto e perigoso. O DPS precisa do aterramento para escoar a corrente de surto à terra.' }
        ]
      },
      {
        id: 'elec_ec3_mc2',
        type: 'multiple_choice',
        question: 'Segundo a IEC 60364-5-53, qual é o comprimento máximo recomendado para a soma das conexões do condutor do DPS (fase até o DPS + DPS até o barramento de terra PE)?',
        scenario: 'Instalação de DPS em trilho DIN no interior do quadro elétrico.',
        diagramId: 'distribution_board_qgd',
        diagramTitle: 'Regra dos 50 cm: Conexão Ultracurta dos Condutores de DPS',
        norma: 'IEC 60364-5-53',
        points: 20,
        explanation: 'A indutância do condutor (L ≈ 1 μH/m) gera uma queda de tensão indutiva L·(di/dt) gigantesca durante o surto rápido. O comprimento total das conexões deve ser ≤ 0,5 m (50 cm).',
        keyTakeaway: 'Regra dos 50 cm: Conexão do DPS ao barramento de terra não deve exceder 0,5 metro.',
        options: [
          { id: 'opt_1', text: 'Máximo de 50 cm (0,5 metro) para minimizar a impedância indutiva (L·di/dt).', isCorrect: true, feedback: 'Correto! A regra dos 50 cm evita sobretensões adicionais causadas pela indutância dos fios longos.' },
          { id: 'opt_2', text: 'Mínimo de 3 metros para amortecer o choque elétrico.', isCorrect: false, feedback: 'Incorreto. Fios compridos aumentam a indutância e invalidam a proteção do DPS.' },
          { id: 'opt_3', text: 'Qualquer comprimento, desde que o cabo seja verde-amarelo.', isCorrect: false, feedback: 'Incorreto. O comprimento físico é determinante na proteção contra surtos.' },
          { id: 'opt_4', text: 'Exatamente 1,2 metros segundo o código predial da EDM.', isCorrect: false, feedback: 'Incorreto. A norma internacional fixa o limite estrito em 0,5 m.' }
        ]
      },
      {
        id: 'elec_ec3_mc3',
        type: 'multiple_choice',
        question: 'Quando a janelinha de sinalização de um cartucho de DPS modular à base de Varistor de Óxido Metálico (MOV) muda de cor de verde para vermelho, qual é a ação obrigatória do eletricista?',
        scenario: 'Inspeção visual periódica pós-tempestade em quadro elétrico hospitalar.',
        norma: 'IEC 61643-11',
        points: 20,
        explanation: 'A cor vermelha indica que o desligador térmico interno desconectou o varistor degradado após escoar sobretensões sucessivas. O cartucho perdeu a capacidade de proteção e deve ser substituído imediatamente.',
        keyTakeaway: 'Sinalizador vermelho no DPS = Cartucho queimado/degradado. Substituição imediata.',
        options: [
          { id: 'opt_1', text: 'Apertar o botão de reset mecânico localizado na lateral.', isCorrect: false, feedback: 'Incorreto. DPS à base de varistor não tem reset; o elemento sacrificatório foi destruído.' },
          { id: 'opt_2', text: 'Substituir imediatamente o cartucho plugável avariado por um novo com a mesma especificação.', isCorrect: true, feedback: 'Correto! Vermelho indica varistor desconectado por proteção térmica.' },
          { id: 'opt_3', text: 'Ligar uma lâmpada em paralelo para descarregar o capacitor interno.', isCorrect: false, feedback: 'Incorreto e sem fundamento técnico.' },
          { id: 'opt_4', text: 'Aguardar 24 horas para o resfriamento espontâneo do semicondutor.', isCorrect: false, feedback: 'Incorreto. A desconexão térmica interna é irreversível.' }
        ]
      }
    ],
    mcSet2: [
      {
        id: 'elec_ec3_mc4_var',
        type: 'multiple_choice',
        question: 'Em um sistema de aterramento do tipo TT (onde as massas da instalação são ligadas a um elétrodo de terra independente do neutro do transformador), qual configuração de DPS (conexão 1+1 ou 3+1) deve ser utilizada segundo a IEC 60364-5-53?',
        scenario: 'Reavaliação: Esquemas de aterramento e conexão CT2 de DPS.',
        diagramId: 'earthing_systems',
        diagramTitle: 'Esquema de Aterramento TT e Conexão de DPS',
        norma: 'IEC 60364-5-53',
        points: 20,
        explanation: 'No esquema TT, usa-se a configuração 3+1 (ou 1+1 em monofásico): DPSs de varistor entre as fases e o neutro, e um centelhador a gás (GDT) de alta robustez entre o neutro e a terra (PE).',
        keyTakeaway: 'Esquema TT = Conexão tipo 3+1 (Fases -> Neutro via varistor, Neutro -> Terra via centelhador GDT).',
        options: [
          { id: 'opt_v1', text: 'Ligar os varistores diretamente de cada fase para o eletrodo de terra sem passar pelo neutro.', isCorrect: false, feedback: 'Incorreto. Em TT, isso causaria correntes de fuga permanentes perigosas para as massas.' },
          { id: 'opt_v2', text: 'Configuração 3+1 (varistores entre Fase-Neutro e centelhador a gás GDT entre Neutro-Terra).', isCorrect: true, feedback: 'Exato! A configuração CT2 (3+1) garante segurança máxima no sistema TT.' },
          { id: 'opt_v3', text: 'No esquema TT é terminantemente proibido instalar qualquer classe de DPS.', isCorrect: false, feedback: 'Incorreto. O DPS é fundamental em qualquer esquema de aterramento.' },
          { id: 'opt_v4', text: 'Usar apenas fusíveis de areia de sílica tipo gG de ação rápida.', isCorrect: false, feedback: 'Incorreto. Fusíveis não substituem descarregadores de sobretensão.' }
        ]
      },
      {
        id: 'elec_ec3_mc5_var',
        type: 'multiple_choice',
        question: 'Qual é a função do dispositivo de proteção contra sobrecorrentes de backup (fusível ou disjuntor) instalado a montante de um DPS?',
        scenario: 'Reavaliação: Coordenação de proteção de backup para descarregadores de surto.',
        norma: 'IEC 61643-11',
        points: 20,
        explanation: 'Em caso de fim de vida útil com falha em curto-circuito pleno do varistor, a proteção de backup desconecta o DPS da rede de energia para evitar arco elétrico e incêndio no quadro.',
        keyTakeaway: 'Proteção de backup desliga o DPS defeituoso em curto, evitando incêndio.',
        options: [
          { id: 'opt_v1', text: 'Desconectar com segurança o DPS caso ele entre em curto-circuito no fim de vida útil.', isCorrect: true, feedback: 'Correto! Evita que um varistor em curto cause curto-circuito permanente no barramento do quadro.' },
          { id: 'opt_v2', text: 'Aumentar a velocidade do raio para que ele chegue mais rápido ao solo.', isCorrect: false, feedback: 'Incorreto.' },
          { id: 'opt_v3', text: 'Impedir que a corrente de surto do raio atinja o eletrodo de aterramento.', isCorrect: false, feedback: 'Incorreto. A corrente de surto DEVE escoar para o aterramento.' },
          { id: 'opt_v4', text: 'Transformar a energia da sobretensão em energia reativa indutiva.', isCorrect: false, feedback: 'Incorreto.' }
        ]
      },
      {
        id: 'elec_ec3_mc6_var',
        type: 'multiple_choice',
        question: 'O parâmetro Up (Nível de Proteção de Tensão) indicado na placa frontal de um DPS deve ser comparado com qual característica dos equipamentos a proteger?',
        scenario: 'Reavaliação: Coordenação de isolamento conforme IEC 60664-1.',
        norma: 'IEC 60664-1 / IEC 60364-4-44',
        points: 20,
        explanation: 'O nível de proteção Up do DPS deve ser inferior à tensão suportável de impulso (Uw) dos equipamentos sensíveis (ex: para equipamentos eletrônicos Categoria I/II, Uw = 1,5 kV; logo, Up do DPS deve ser ≤ 1,5 kV).',
        keyTakeaway: 'Up do DPS deve ser menor que o Uw (tensão suportável de impulso) dos equipamentos.',
        options: [
          { id: 'opt_v1', text: 'Com a tensão nominal de operação da concessionária EDM (230 V).', isCorrect: false, feedback: 'Incorreto. A tensão nominal é a tensão de rede, não a tensão de impulso.' },
          { id: 'opt_v2', text: 'Com a tensão suportável de impulso (Uw) dos equipamentos eletrônicos sensíveis.', isCorrect: true, feedback: 'Exato! Up < Uw garante que a tensão residual não destrua os circuitos eletrônicos.' },
          { id: 'opt_v3', text: 'Com a corrente de curto-circuito do disjuntor de entrada.', isCorrect: false, feedback: 'Incorreto. Up é uma grandeza de tensão (Volts/kV).' },
          { id: 'opt_v4', text: 'Com o tempo de atuação do diferencial residual de 30 mA.', isCorrect: false, feedback: 'Incorreto.' }
        ]
      }
    ],
    descSet1: [
      {
        id: 'elec_ec3_desc1',
        type: 'descriptive',
        title: 'Plano de Proteção Contra Raios e Surtos em Estação de Telecomunicações',
        question: 'Você foi contratado para projetar a proteção contra sobretensões transitórias em uma torre de telecomunicações no interior de Nampula que sofreu queima repetida de placas de inversores e retificadores durante tempestades. Descreva detalhadamente a topologia de DPS recomendada (Classes I, II e III), o esquema de equipotencialização no BEP e a regra física de roteamento dos cabos de terra.',
        contextScenario: 'Instalação isolada no topo de elevação rochosa em Nampula com linha aérea de média/baixa tensão exposta e histórico de 3 queimas catastróficas na última estação chuvosa.',
        diagramId: 'solar_pv_system',
        diagramTitle: 'Esquema de Equipotencialização e Proteção DPS em Telecom',
        norma: 'IEC 62305 / IEC 61643-11',
        expectedKeywords: ['dps classe i', 'dps classe ii', 'barramento de equipotencialização', 'bep', 'regra dos 50 cm', 'varistor', 'centelhador', 'aterramento'],
        points: 40,
        guidelineAnswer: 'Solução integrada de engenharia: 1) No quadro principal de entrada (QGD): Instalação de DPS Classe I (onda 10/350 μs, Iimp ≥ 25 kA por polo) à base de centelhador a gás ou varistor reforçado para drenar a corrente direta do raio. 2) Nos quadros de distribuição internos: DPS Classe II (onda 8/20 μs, In ≥ 20 kA, Up ≤ 1,5 kV) para limitar a sobretensão residual. 3) Próximo aos retificadores sensíveis: DPS Classe III. 4) Equipotencialização: Interligar todas as massas metálicas, carcaças da torre e condutores de proteção a um único Barramento de Equipotencialização Principal (BEP). 5) Respeitar rigorosamente a regra dos 50 cm (cabos de conexão curtos e retilíneos, sem curvas fechadas ou espiras indutivas).',
        rubricCriteria: [
          { criterion: 'Especificação coordenada das classes de DPS (Classe I no QGD e Classe II nos quadros internos).', weightPercent: 35 },
          { criterion: 'Detalhes de equipotencialização no BEP e malha de aterramento única sem laços de terra.', weightPercent: 35 },
          { criterion: 'Regra física de conexão ultracurta (regra dos 50 cm) para mitigar indutância parasita.', weightPercent: 30 }
        ]
      }
    ],
    descSet2: [
      {
        id: 'elec_ec3_desc2_var',
        type: 'descriptive',
        title: 'Reavaliação: Auditoria de Instalação de DPS e Não Conformidades de Campo',
        question: 'Durante uma auditoria técnica em uma indústria têxtil na Beira, você encontra DPS instalados com cabos de conexão de 1,4 metros de comprimento formando voltas dentro da canaleta plástica. Justifique por que essa instalação NÃO cumpre a IEC 60364-5-53 e explique a consequência matemática da indutância (V = L·di/dt) sobre a proteção das máquinas.',
        contextScenario: 'Auditoria elétrica pós-incêndio em quadro de comando de teares industriais que sofreram falha catastrófica apesar de terem DPS instalados.',
        diagramId: 'distribution_board_qgd',
        diagramTitle: 'Auditoria de Conexões em QGD Industrial',
        norma: 'IEC 60364-5-53',
        expectedKeywords: ['indutância', 'comprimento dos cabos', 'regra dos 50 cm', 'queda de tensão indutiva', 'nível de proteção up', 'iec 60364-5-53'],
        points: 40,
        guidelineAnswer: 'A instalação está em grave não conformidade com a IEC 60364-5-53. Condutores elétricos possuem indutância própria de aproximadamente 1 μH por metro. Em um surto atmosférico com taxa de variação de corrente di/dt de 10 kA / 8 μs = 1,25 × 10⁹ A/s, um cabo de 1,4 m (excesso de 0,9 m) gera uma queda de tensão indutiva adicional V = L·(di/dt) = (1,4 × 10⁻⁶ H) × (1,25 × 10⁹ A/s) ≈ 1750 Volts! Essa sobretensão indutiva soma-se diretamente ao nível de proteção Up do DPS (ex: 1500 V + 1750 V = 3250 V), destruindo o isolamento dos equipamentos industriais mesmo com o DPS atuando perfeitamente. Ação corretiva: Reduzir imediatamente os cabos para menos de 50 cm e eliminar voltas indutivas.',
        rubricCriteria: [
          { criterion: 'Demonstração física da equação V = L·di/dt e da indutância de condutores longos.', weightPercent: 40 },
          { criterion: 'Citação formal da não conformidade perante a regra dos 50 cm da IEC 60364-5-53.', weightPercent: 30 },
          { criterion: 'Procedimento prático de correção e re-roteamento direto dos condutores de fase e terra.', weightPercent: 30 }
        ]
      }
    ]
  },

  // ==========================================================================
  // MECÂNICA 1: SISTEMA DE TOLERÂNCIAS E AJUSTES ISO (ISO 286-1 / ISO 286-2)
  // ==========================================================================
  mec_m1_l1_tolerancias_ajustes_iso: {
    mcSet1: [
      {
        id: 'mec_ec1_mc1',
        type: 'multiple_choice',
        question: 'No sistema internacional de ajustes e tolerâncias ISO 286, o que define a designação de acoplamento Ø50 H7/g6?',
        scenario: 'Ajuste mecânico de rolamento em eixo de ventilador de exaustão industrial.',
        diagramId: 'hydraulic_circuit',
        diagramTitle: 'Ajuste de Mancal e Eixo Retificado',
        norma: 'ISO 286-1 / ISO 286-2',
        points: 20,
        explanation: 'Furo H7 tem afastamento inferior nulo (zona de tolerância H no furo base). O eixo com letra minúscula "g" situa-se abaixo da linha zero, resultando em folga suave que permite rotação ou deslizamento com filme de óleo.',
        keyTakeaway: 'H7/g6 = Ajuste com folga deslizante de precisão.',
        options: [
          { id: 'opt_1', text: 'Ajuste prensado com interferência severa que exige prensa hidráulica de 50 toneladas.', isCorrect: false, feedback: 'Incorreto. Ajuste com interferência usa letras minúsculas avançadas como p, r, s.' },
          { id: 'opt_2', text: 'Ajuste com folga móvel suave que permite deslizamento ou rotação com lubrificação.', isCorrect: true, feedback: 'Correto! Furo H7 com eixo g6 garante folga positiva para movimento mecânico.' },
          { id: 'opt_3', text: 'Ajuste incerto com probabilidade idêntica de aperto e folga aleatória.', isCorrect: false, feedback: 'Incorreto. Ajustes incertos utilizam letras como j, k, m.' },
          { id: 'opt_4', text: 'Furo rosqueado para parafusos métricos de passo fino.', isCorrect: false, feedback: 'Incorreto. H7/g6 refere-se a eixos lisos retificados e buchas cilíndricas.' }
        ]
      },
      {
        id: 'mec_ec1_mc2',
        type: 'multiple_choice',
        question: 'Para montar a pista interna de um rolamento de esferas com interferência (ajuste H7/p6) em um eixo retificado sem danificar os corpos rolantes nem as pistas, qual método térmico é mandatório segundo a ISO 15243?',
        scenario: 'Montagem de rolamento em oficina de manutenção industrial em Matola.',
        norma: 'ISO 15243 / DIN 5425',
        points: 20,
        explanation: 'O aquecedor por indução eletromagnética com desmagnetização automática aquece uniformemente a pista interna até 110°C, expandindo o diâmetro para encaixe suave e sem choque mecânico.',
        keyTakeaway: 'Montagem de rolamento com interferência: Aquecedor por indução térmica a 110°C (nunca maçarico direto).',
        options: [
          { id: 'opt_1', text: 'Golpear diretamente a pista externa com marreta de ferro fundido até encaixar.', isCorrect: false, feedback: 'Incorreto e destrutivo! Transmite choque pelos corpos rolantes, causando falso brinelamento imediato.' },
          { id: 'opt_2', text: 'Aquecimento por indução eletromagnética com controle térmico até 110°C.', isCorrect: true, feedback: 'Perfeito! Dilata uniformemente a pista interna para montagem livre de tensões de choque.' },
          { id: 'opt_3', text: 'Aquecimento com maçarico oxiacetilênico diretamente sobre a gaiola de retenção.', isCorrect: false, feedback: 'Incorreto. Queima a têmpera do aço do rolamento e destrói os retentores.' },
          { id: 'opt_4', text: 'Lixar o eixo com lixa d’água até que o rolamento entre folgado com a mão.', isCorrect: false, feedback: 'Incorreto. Destrói a tolerância de projeto e causa giro do anel no eixo.' }
        ]
      },
      {
        id: 'mec_ec1_mc3',
        type: 'multiple_choice',
        question: 'Qual instrumento de metrologia dimensional é o mais indicado segundo a DIN 878 para aferir com precisão micrométrica o empenamento ou batimento radial (runout) de um eixo girando sobre prismas em V?',
        scenario: 'Controle de qualidade de eixo usinado em torno CNC.',
        norma: 'DIN 878 / ISO 3611',
        points: 20,
        explanation: 'O relógio comparador centesimal ou milesimal montado em base magnética mede deslocamentos lineares com resolução de 0,01 mm ou 0,001 mm à medida que o eixo é rotacionado manualmente sobre prismas em V.',
        keyTakeaway: 'Batimento radial de eixo = Relógio comparador sobre base magnética e blocos prismáticos.',
        options: [
          { id: 'opt_1', text: 'Paquímetro universal com nônio de 0,05 mm.', isCorrect: false, feedback: 'Incorreto. O paquímetro não permite medir variações contínuas de batimento em rotação.' },
          { id: 'opt_2', text: 'Relógio comparador centesimal apoiado em base magnética e apalpador no diâmetro do eixo.', isCorrect: true, feedback: 'Exato! O relógio comparador detecta desvios de concentricidade e circularidade de 0,01 mm.' },
          { id: 'opt_3', text: 'Trena metálica milimetrada de precisão classe II.', isCorrect: false, feedback: 'Incorreto. Inadequada para tolerâncias mecânicas micrométricas.' },
          { id: 'opt_4', text: 'Calibrador de folga tipo lâmina (feelers gauge).', isCorrect: false, feedback: 'Incorreto. Calibrador de lâmina é usado para medir folgas entre superfícies planas.' }
        ]
      }
    ],
    mcSet2: [
      {
        id: 'mec_ec1_mc4_var',
        type: 'multiple_choice',
        question: 'Em um parafuso de fixação de cabeçote mecânico com marcação de classe de resistência 10.9 gravada no topo sextavado (ISO 898-1), o que significam os números "10" e "9"?',
        scenario: 'Reavaliação: Especificação e aperto de parafusos de alta resistência.',
        norma: 'ISO 898-1',
        points: 20,
        explanation: 'O "10" multiplicado por 100 indica a resistência mínima à tração Rm = 1000 N/mm² (MPa). O ".9" indica que o limite de escoamento Re é 90% do Rm, ou seja, Re = 900 N/mm².',
        keyTakeaway: 'Classe 10.9: Rm = 1000 MPa, Escoamento Re = 900 MPa.',
        options: [
          { id: 'opt_v1', text: 'Comprimento de 10 cm e rosca de 9 milímetros de diâmetro.', isCorrect: false, feedback: 'Incorreto. Trata-se de propriedades metalúrgicas mecânicas, não dimensões.' },
          { id: 'opt_v2', text: 'Resistência à tração de 1000 MPa e limite de escoamento de 900 MPa.', isCorrect: true, feedback: 'Correto! 10 × 100 = 1000 N/mm² e 1000 × 0,9 = 900 N/mm².' },
          { id: 'opt_v3', text: 'Torque de aperto máximo de 10,9 N·m em chave dinamométrica.', isCorrect: false, feedback: 'Incorreto. O torque depende do diâmetro nominal e do atrito da rosca.' },
          { id: 'opt_v4', text: 'Aço inoxidável austenítico com 10% de cromo e 9% de níquel.', isCorrect: false, feedback: 'Incorreto. Aço inoxidável usa a classificação A2/A4.' }
        ]
      },
      {
        id: 'mec_ec1_mc5_var',
        type: 'multiple_choice',
        question: 'Segundo a ISO 15243, qual é a principal causa física do fenômeno de falso brinelamento (fretting corrosion) em rolamentos industriais?',
        scenario: 'Reavaliação: Análise de falhas em mancais e rolamentos.',
        norma: 'ISO 15243',
        points: 20,
        explanation: 'O falso brinelamento ocorre quando máquinas reservas desligadas sofrem microvibrações induzidas por máquinas vizinhas em operação. Os corpos rolantes oscilam microscopicamente sem girar, rompendo o filme de óleo e oxidando pontualmente as pistas de rolamento.',
        keyTakeaway: 'Falso brinelamento = Microvibrações em rolamento parado rompendo o filme lubrificante.',
        options: [
          { id: 'opt_v1', text: 'Microvibrações externas em equipamentos parados provocando contato metal-metal sem renovação do filme lubrificante.', isCorrect: true, feedback: 'Perfeito! Vibrações induzidas em rolamento estático geram marcas idênticas a cavidades oxidadas.' },
          { id: 'opt_v2', text: 'Excesso de rotação ultrapassando 50.000 RPM sob carga pura de empuxo.', isCorrect: false, feedback: 'Incorreto. Isso geraria superaquecimento e engripamento.' },
          { id: 'opt_v3', text: 'Injeção de graxa sintética com sabão de lítio de alta pureza.', isCorrect: false, feedback: 'Incorreto. Graxa de lítio é o padrão industrial.' },
          { id: 'opt_v4', text: 'Aperto insuficiente da porca trava KM da bucha cônica.', isCorrect: false, feedback: 'Incorreto.' }
        ]
      },
      {
        id: 'mec_ec1_mc6_var',
        type: 'multiple_choice',
        question: 'Durante o aperto de parafusos críticos com torquímetro de estalo calibrado, qual é o impacto de lubrificar com óleo uma rosca que foi calculada pelo fabricante para aperto a seco?',
        scenario: 'Reavaliação: Controle de torque e atrito em uniões parafusadas.',
        norma: 'VDI 2230',
        points: 20,
        explanation: 'A lubrificação reduz o coeficiente de atrito na rosca e sob a cabeça do parafuso. Mantendo o mesmo torque no torquímetro, a força de protensão gerada (tensão axial de tração) sobe perigosamente em até 40-50%, podendo esticar e romper o parafuso na zona de escoamento.',
        keyTakeaway: 'Lubrificar rosca calculada a seco = Superpré-carga perigosa e risco de cisalhamento/ruptura.',
        options: [
          { id: 'opt_v1', text: 'A força de aperto diminui pela metade porque o óleo faz a chave dinamométrica escorregar.', isCorrect: false, feedback: 'Incorreto. O torque medido é o mesmo, mas o atrito menor converte mais torque em força axial.' },
          { id: 'opt_v2', text: 'A tensão de tração axial (pré-carga) no parafuso aumenta perigosamente, com alto risco de escoamento ou ruptura.', isCorrect: true, feedback: 'Correto! Menor atrito com mesmo torque = tração muito maior no corpo do parafuso.' },
          { id: 'opt_v3', text: 'O coeficiente de segurança mecânico aumenta proporcionalmente à viscosidade do lubrificante.', isCorrect: false, feedback: 'Incorreto.' },
          { id: 'opt_v4', text: 'Não há qualquer alteração mecânica, pois o torquímetro mede diretamente a força de tração em Newtons.', isCorrect: false, feedback: 'Incorreto. O torquímetro mede torque (N·m), que depende criticamente do atrito.' }
        ]
      }
    ],
    descSet1: [
      {
        id: 'mec_ec1_desc1',
        type: 'descriptive',
        title: 'Diagnóstico de Falha Prematura e Procedimento de Montagem de Rolamento C3',
        question: 'Um redutor industrial de velocidade em uma mineradora em Moatize apresentou quebra prematura do rolamento de rolos cônicos do eixo de saída após apenas 70 horas de operação. A pista apresentava marcas profundas de lascamento (spalling) e coloração azulada decorrente de atrito térmico severo. Descreva o procedimento de diagnóstico de folga interna radial (ex: necessidade de folga C3 em altas temperaturas), o método correto de montagem com controle de pré-carga e a instrumentação necessária.',
        contextScenario: 'Redutor operando em ambiente de mineração com temperatura operacional de carcaça atingindo 85°C e poeira abrasiva de carvão.',
        diagramId: 'hydraulic_circuit',
        diagramTitle: 'Mancal e Conjunto de Rolamentos com Ajuste Cônico',
        norma: 'ISO 15243 / ISO 286',
        expectedKeywords: ['folga radial c3', 'dilatação térmica', 'aquecimento por indução', 'relógio comparador', 'pré-carga', 'lubrificação', 'spalling'],
        points: 40,
        guidelineAnswer: 'Diagnóstico e Procedimento: 1) Causa Raiz: Montagem de rolamento com folga radial normal (CN) em equipamento operando a 85°C. A dilatação térmica do eixo superou a folga interna, travando os rolos e gerando calor excessivo por atrito metálico (azulamento). 2) Correção Normativa: Selecionar rolamento com folga radial ampliada C3 (25-45 μm adicionais de folga interna) para compensar a expansão térmica. 3) Montagem: Aquecimento da pista interna por indução a 110°C (sem chamas). 4) Ajuste de pré-carga com calços calibrados e aferição do deslocamento axial com relógio comparador centesimal montado em base magnética. 5) Lubrificação com graxa sintética com aditivação extrema pressão (EP) e vedação contra poeira de carvão com labirintos.',
        rubricCriteria: [
          { criterion: 'Identificação da causa raiz térmica e justificativa para seleção de folga radial C3.', weightPercent: 35 },
          { criterion: 'Metodologia de montagem sem impacto mecânico via aquecedor indutivo eletromagnético.', weightPercent: 35 },
          { criterion: 'Aferição de pré-carga e folga com relógio comparador e calços conforme normas de tolerâncias.', weightPercent: 30 }
        ]
      }
    ],
    descSet2: [
      {
        id: 'mec_ec1_desc2_var',
        type: 'descriptive',
        title: 'Reavaliação: Alinhamento de Precisão e Correção de Pé Manco (Soft Foot)',
        question: 'Durante a instalação de uma bomba centrífuga acoplada a um motor elétrico de 55 kW em uma cervejaria em Maputo, o técnico nota vibrações elevadas ao apertar o pé de fixação dianteiro direito do motor. Explique o que é o fenômeno de "Pé Manco" (Soft Foot), como diagnosticá-lo com relógio comparador e qual é a técnica correta de nivelamento com calços calibrados segundo a ISO 10816.',
        contextScenario: 'Comissionamento de conjunto motobomba industrial pós-manutenção mecânica.',
        diagramId: 'direct_motor_starter',
        diagramTitle: 'Base Mecânica do Motor e Pontos de Calço',
        norma: 'ISO 10816 / ISO 20816',
        expectedKeywords: ['pé manco', 'soft foot', 'relógio comparador', 'calços calibrados', 'alinhamento a laser', 'tensão na carcaça'],
        points: 40,
        guidelineAnswer: 'O Pé Manco (Soft Foot) ocorre quando um ou mais pés da máquina não assentam coplanarmente sobre a base usinada, como uma cadeira de quatro pernas onde uma é mais curta. Ao apertar o parafuso de fixação, a carcaça do motor é torcida elasticamente, ovalizando os mancais, reduzindo a folga dos rolamentos e desbalanceando o entreferro eletromagnético. Diagnóstico: 1) Instalar relógio comparador centesimal na vertical sobre o pé a ser testado, com apalpador na sapata; 2) Soltar o parafuso de fixação: se o relógio registrar deslocamento superior a 0,05 mm, há pé manco naquele ponto; 3) Medir a folga real com cálibre de lâminas em todos os 4 cantos do pé; 4) Inserir calços calibrados de aço inox pré-cortados (máximo 3 calços por pé); 5) Reapertar com torquímetro e reconfirmar o alinhamento de precisão dos eixos.',
        rubricCriteria: [
          { criterion: 'Definição mecânica precisa de Pé Manco e suas consequências de torção e vibração na carcaça.', weightPercent: 35 },
          { criterion: 'Procedimento metrológico de teste com relógio comparador e cálibre de folgas.', weightPercent: 35 },
          { criterion: 'Solução técnica com calços pré-cortados de inox e limite aceitável de folga (< 0,05 mm).', weightPercent: 30 }
        ]
      }
    ]
  }
};

/**
 * Função geradora dinâmica de avaliações:
 * 1. Seleciona 3 questões de múltipla escolha e 1 a 2 questões descritivas.
 * 2. Realiza embaralhamento rigoroso das alternativas de múltipla escolha a cada tentativa (distribuindo uniformemente a resposta correta entre A, B, C e D).
 * 3. Se for reavaliação (attemptNumber > 1), utiliza o Set 2 com questões completamente diferentes para o mesmo EC!
 */
export function generateAssessmentForLesson(
  lesson: AcademyLesson,
  attemptNumber: number = 1,
  technicianName: string = 'Técnico Autorizado',
  technicianId: string = 'guest'
): AssessmentAttempt {
  const bank = ASSESSMENT_BANK[lesson.id];
  const isReassessment = attemptNumber > 1;

  // Se o banco específico tiver questões cadastradas, utiliza os conjuntos dedicados
  let mcRawPool: AssessmentMCQuestion[] = [];
  let descRawPool: AssessmentDescriptiveQuestion[] = [];

  if (bank) {
    mcRawPool = isReassessment && bank.mcSet2.length > 0 ? bank.mcSet2 : bank.mcSet1;
    descRawPool = isReassessment && bank.descSet2.length > 0 ? bank.descSet2 : bank.descSet1;
  }

  // Fallback didático avançado (Diretriz: Cenários Diferenciados de Campo, Percepção Direta e Foco em Raciocínio Prático):
  if (mcRawPool.length < 3) {
    const isMec = lesson.moduleId?.includes('mec') || lesson.id?.startsWith('mec_');
    const localidade1 = attemptNumber % 2 === 1 ? 'Matola' : 'Beira';
    const localidade2 = attemptNumber % 2 === 1 ? 'Nampula' : 'Tete';
    const localidade3 = attemptNumber % 2 === 1 ? 'Nacala' : 'Maputo';

    const fallbackMC: AssessmentMCQuestion[] = [
      {
        id: `${lesson.id}_gen_mc1_${attemptNumber}`,
        type: 'multiple_choice',
        question: isMec
          ? `Em uma intervenção técnica na ${localidade1}, um técnico precisa comissionar componentes de ${lesson.title} operando sob vibração e carga contínua. Considerando as exigências da norma ${lesson.norma}, qual critério mandatório deve ser adotado no dimensionamento e fixação para assegurar a confiabilidade mecânica?`
          : `Em uma instalação técnica na ${localidade1}, o alimentador de ${lesson.title} opera sob temperatura ambiente de 35 °C. Segundo as regras de coordenação e dimensionamento da norma ${lesson.norma}, qual relação matemática entre a corrente de projeto (Ib), a corrente nominal da proteção (In) e a capacidade de condução dos condutores (Iz) deve ser rigorosamente respeitada?`,
        scenario: `Dimensionamento e comissionamento técnico de ${lesson.title} na ${localidade1} (${lesson.norma}).`,
        diagramId: isMec ? 'hydraulic_circuit' : 'distribution_board_qgd',
        diagramTitle: `Esquema de Aplicação de Campo: ${lesson.norma}`,
        norma: lesson.norma,
        points: 20,
        explanation: isMec
          ? `Segundo a ${lesson.norma}, o torque de aperto controlado por torquímetro calibrado e o alinhamento geométrico são mandatórios para evitar fadiga por vibração.`
          : `A regra fundamental de proteção da IEC 60364 é: Ib ≤ In ≤ Iz (com I2 ≤ 1,45 × Iz), garantindo que o condutor nunca sofra sobreaquecimento antes da atuação do disjuntor.`,
        keyTakeaway: isMec
          ? 'Respeite as tabelas de torque e folga da norma com instrumento calibrado.'
          : 'Regra de ouro: Ib ≤ In ≤ Iz. O cabo deve suportar mais corrente que a proteção nominal.',
        options: [
          {
            id: 'opt_c1',
            text: isMec
              ? `Aplicar torque de aperto conforme a classe do fixador com torquímetro calibrado e verificar alinhamento e folgas conforme ${lesson.norma}.`
              : `Atender rigorosamente à condição Ib ≤ In ≤ Iz, aplicando previamente os fatores de correção de temperatura e agrupamento para determinar Iz.`,
            isCorrect: true,
            feedback: 'Exato! Essa é a regra técnica primária para garantir integridade física e evitar colapso operacional.'
          },
          {
            id: 'opt_w1',
            text: isMec
              ? 'Apertar as conexões até o limite mecânico com chave de impacto manual sem controle de torque.'
              : 'Dimensionar a proteção In com valor menor que a corrente de projeto Ib para economizar energia.',
            isCorrect: false,
            feedback: 'Incorreto. Isso gera disparos intempestivos imediatos assim que o circuito atingir a carga nominal.'
          },
          {
            id: 'opt_w2',
            text: isMec
              ? 'Omitir a verificação de folgas operacionais desde que o óleo lubrificante esteja no nível máximo.'
              : 'Aumentar a bitola do disjuntor sem verificar se os cabos existentes suportam a nova corrente térmica.',
            isCorrect: false,
            feedback: 'Incorreto e perigoso. Elevar a proteção sem redimensionar cabos anula a proteção contra incêndio.'
          },
          {
            id: 'opt_w3',
            text: isMec
              ? 'Instalar peças com folga livre sem verificar tolerâncias ISO de ajuste.'
              : 'Desconsiderar o fator de correção de temperatura porque o aquecimento dos cabos dissipa naturalmente à noite.',
            isCorrect: false,
            feedback: 'Incorreto. Em climas quentes como Moçambique, a omissão do fator térmico provoca degradação acelerada do isolamento.'
          }
        ]
      },
      {
        id: `${lesson.id}_gen_mc2_${attemptNumber}`,
        type: 'multiple_choice',
        question: isMec
          ? `Durante a manutenção preventiva de ${lesson.title} em ${localidade2}, qual instrumento de medição metrológica deve ser utilizado para inspecionar o desgaste radial e excentricidade, e qual critério normativo deve guiar o técnico?`
          : `Durante os ensaios de verificação inicial (comissionamento) de ${lesson.title} em ${localidade2} antes da energização, qual ensaio com instrumento dedicado é mandatório pela norma ${lesson.norma} para assegurar que não há risco de fuga de corrente ou curto-circuito?`,
        scenario: `Ensaios de campo e verificação metrológica em ${localidade2} em conformidade com ${lesson.norma}.`,
        norma: lesson.norma,
        points: 20,
        explanation: isMec
          ? 'Para medição de desgaste e folgas radiais/axiais, o relógio comparador milesimal ou micrômetro calibrado é o instrumento padrão normatizado.'
          : `Pela norma ${lesson.norma} (IEC 60364-6), a medição da Resistência de Isolamento com megômetro a 500 Vcc deve apresentar valor mínimo de 1,0 MΩ entre condutores vivos e terra.`,
        keyTakeaway: isMec
          ? 'Instrumentos metrológicos calibrados garantem que folgas mecânicas estejam na tolerância de projeto.'
          : 'Resistência de Isolamento: Ensaio a 500 Vcc com circuito desenergizado, aceitação ≥ 1,0 MΩ.',
        options: [
          {
            id: 'opt_c2',
            text: isMec
              ? `Relógio comparador com base magnética e micrômetro externo, comparando as folgas com a tolerância prescrita na ${lesson.norma}.`
              : `Ensaio de Resistência de Isolamento com megômetro a 500 Vcc com o circuito desenergizado, exigindo valor mínimo de 1,0 MΩ entre fases, neutro e PE.`,
            isCorrect: true,
            feedback: 'Correto! Procedimento normativo mandatório executado antes de liberar a máquina ou linha para serviço.'
          },
          {
            id: 'opt_w4',
            text: isMec
              ? 'Verificação visual aproximada à luz do dia sem uso de instrumentos com escala métrica.'
              : 'Teste rápido encostando uma lâmpada piloto de 230 V entre a carcaça e o condutor neutro energizado.',
            isCorrect: false,
            feedback: 'Incorreto e anti-técnico. Lâmpadas piloto não medem resistência de isolamento e colocam o operador em risco direto.'
          },
          {
            id: 'opt_w5',
            text: isMec
              ? 'Medição com régua comum de plástico de 30 cm sobre a carcaça externa.'
              : 'Medição apenas da corrente com alicate amperímetro após energizar o circuito defeituoso.',
            isCorrect: false,
            feedback: 'Incorreto. Energizar um circuito sem testar o isolamento prévio pode gerar arco elétrico ou explosão em caso de curto.'
          },
          {
            id: 'opt_w6',
            text: isMec
              ? 'Aquecimento manual com maçarico para testar a dilatação sem aferição de temperatura.'
              : 'Verificação com caneta de teste de neon simples encostada no isolamento dos cabos desligados.',
            isCorrect: false,
            feedback: 'Incorreto. Canetas de teste neon são apenas detectores qualitativos de presença de fase, não medem isolação.'
          }
        ]
      },
      {
        id: `${lesson.id}_gen_mc3_${attemptNumber}`,
        type: 'multiple_choice',
        question: `Em uma ocorrência real de campo em ${localidade3}, um sistema associado a ${lesson.title} apresentou aquecimento anormal e desarmes recorrentes em horário de pico. Ao analisar o caso segundo a ${lesson.norma}, qual fator operacional de campo causou essa anomalia e qual a solução correta?`,
        scenario: `Diagnóstico de falha real e intervenção corretiva em ${localidade3}.`,
        norma: lesson.norma,
        points: 20,
        explanation: `O subdimensionamento por não considerar a temperatura ambiente elevada e conexões com torque insuficiente criam pontos quentes (efeito Joule: P = R × I²), provocando desarmes prematuros do disjuntor térmico. A solução é reapertar com torquímetro e corrigir a capacidade de condução.`,
        keyTakeaway: 'Mau contato e calor ambiente multiplicam as perdas térmicas. Sempre use torque correto e desclassificação térmica.',
        options: [
          {
            id: 'opt_c3',
            text: 'Conexões frouxas gerando resistência de contato e omissão do fator de temperatura ambiente; solução: reaperto com torquímetro e readequação de condutores.',
            isCorrect: true,
            feedback: 'Excelente análise prática! Resistência de contato somada à alta temperatura é a causa número 1 de falhas em campo.'
          },
          {
            id: 'opt_w7',
            text: 'Tensão excessiva fornecida pela concessionária pública que queimou as resistências internas.',
            isCorrect: false,
            feedback: 'Incorreto. A queima por mau contato e sobreaquecimento pontual decorre de perdas locais nas conexões e cabos.'
          },
          {
            id: 'opt_w8',
            text: 'Substituição da proteção térmica por um jumper de cobre maciço para impedir novos desarmes.',
            isCorrect: false,
            feedback: 'Crime técnico gravíssimo. Eliminar proteções destrói a instalação e gera risco fatal de incêndio.'
          },
          {
            id: 'opt_w9',
            text: 'Inversão dos cabos de aterramento (PE) com a fase para aumentar o fluxo de elétrons.',
            isCorrect: false,
            feedback: 'Incorreto e letal. Ligar fase na carcaça eletrifica as partes metálicas e causa choque elétrico mortal.'
          }
        ]
      }
    ];

    mcRawPool = [...fallbackMC, ...mcRawPool].slice(0, 3);
  }

  if (descRawPool.length === 0) {
    const isMec = lesson.moduleId?.includes('mec') || lesson.id?.startsWith('mec_');
    const localidadeCenario = attemptNumber % 2 === 1 ? 'Matola' : 'Beira';

    descRawPool = [
      {
        id: `${lesson.id}_gen_desc1_${attemptNumber}`,
        type: 'descriptive',
        title: `Estudo de Caso Prático: ${lesson.title}`,
        question: isMec
          ? `Você foi designado para executar o comissionamento e testes de aceitação técnica de "${lesson.title}" em uma instalação fabril na ${localidadeCenario}, em conformidade com a norma ${lesson.norma}.
Apresente seu plano de intervenção estruturado em 3 pontos obrigatórios:
1. Instrumentação & Medições: Quais ferramentas e instrumentos calibrados você usará (ex: torquímetro, relógio comparador, manômetro)?
2. Critérios e Tolerâncias: Quais grandezas e limites estabelecidos pela norma ${lesson.norma} determinarão se o equipamento está aprovado?
3. Procedimento de Segurança: Quais medidas de bloqueio e despressurização/desenergização (LOTO) devem ser tomadas antes da intervenção?`
          : `Você foi acionado para uma intervenção técnica e certificação normativa de "${lesson.title}" em uma unidade industrial/comercial na ${localidadeCenario}, segundo a norma ${lesson.norma}.
Apresente o seu parecer técnico e roteiro de ensaios estruturado em 3 pontos obrigatórios:
1. Instrumentos e Ensaios Prévios: Quais instrumentos calibrados (ex: Megômetro, Multímetro True-RMS, Alicate de fuga) você utilizará e quais ensaios executará com o circuito desenergizado?
2. Critérios de Aceitação Normativa: Quais valores mínimos de isolamento, continuidade ou queda de tensão estabelecidos pela ${lesson.norma} indicarão conformidade?
3. Ações Corretivas e Segurança: Descreva as precauções de segurança obrigatórias (LOTO, EPIs, teste de ausência de tensão) e as boas práticas de fixação e aperto para evitar sobreaquecimento futuro.`,
        contextScenario: `Cenário real de campo: Intervenção técnica e certificação de conformidade para ${lesson.title} em ${localidadeCenario} (${lesson.norma}).`,
        diagramId: isMec ? 'hydraulic_circuit' : 'distribution_board_qgd',
        diagramTitle: `Esquema de Circuito e Pontos de Teste: ${lesson.norma}`,
        norma: lesson.norma,
        points: 40,
        expectedKeywords: ['procedimento', 'medição', 'norma', 'segurança', 'ensaio', 'proteção', 'conformidade', 'loto', 'isolamento', 'torque'],
        guidelineAnswer: `O procedimento técnico segundo a ${lesson.norma} requer: 1) Desenergização segura com bloqueio e etiquetagem (LOTO) e teste de ausência de tensão; 2) Inspeção visual minuciosa do estado físico de cabos, terminais, torque de aperto e conexões de terra; 3) Medições com instrumentos calibrados (multímetro True-RMS, megômetro para ensaio de resistência de isolamento ≥ 1,0 MΩ a 500 Vcc ou torquímetro calibrado para fixações mecânicas); 4) Comparação dos valores aferidos com os limites da norma ${lesson.norma}; 5) Emissão de relatório técnico conclusivo assinado.`,
        rubricCriteria: [
          { criterion: 'Detalhamento do procedimento operacional sequencial de medição ou montagem com instrumentação correta.', weightPercent: 35 },
          { criterion: `Especificação dos critérios normativos e limites de aceitação da norma ${lesson.norma}.`, weightPercent: 35 },
          { criterion: 'Aderência às normas de segurança de campo (LOTO, EPIs, torque e prevenção de sobreaquecimento).', weightPercent: 30 }
        ]
      }
    ];
  }

  // Embaralhar as alternativas das questões de múltipla escolha rigorosamente
  const shuffledMC = mcRawPool.map(q => ({
    ...q,
    options: shuffleOptionsWithLabels(q.options)
  }));

  // Geração de código de autenticidade único para o exame
  const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const authCode = `TMZ-ACAD-${dateStr}-${randomHex}`;

  return {
    attemptId: `${lesson.id}_att_${Date.now()}`,
    attemptNumber,
    lessonId: lesson.id,
    lessonCode: lesson.code || 'EC',
    lessonTitle: lesson.title,
    moduleTitle: lesson.moduleTitle,
    norma: lesson.norma,
    technicianName,
    technicianId,
    date: new Date().toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    authCode,
    mcQuestions: shuffledMC,
    descQuestions: descRawPool.slice(0, 1),
    mcAnswers: {},
    descAnswers: {},
    descEvaluations: {},
    mcEarnedPoints: 0,
    mcTotalPoints: shuffledMC.reduce((sum, q) => sum + q.points, 0),
    descEarnedPoints: 0,
    descTotalPoints: descRawPool.slice(0, 1).reduce((sum, q) => sum + q.points, 0),
    finalScorePercent: 0,
    status: 'NAO_ALCANCA',
    isPassed: false
  };
}
