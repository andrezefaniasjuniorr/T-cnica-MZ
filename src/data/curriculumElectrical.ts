import { AcademyModule } from '../types/academy';

// ============================================================================
// GRADE CURRICULAR COMPLETA: ELETRICISTA / ELETROTÉCNICA (PADRÃO EUROPEU IEC)
// CURSO PROFISSIONALIZANTE DO ZERO AO AVANÇADO - 11 MÓDULOS NORMATIZADOS
// ============================================================================

export const ELECTRICAL_MODULES: AcademyModule[] = [
  // ==========================================================================
  // MÓDULO 1: PRINCÍPIOS DA FÍSICA ELÉTRICA & LEIS FUNDAMENTAIS
  // ==========================================================================
  {
    id: 'elec_mod_1_fisica',
    area: 'eletrotecnica',
    order: 1,
    title: 'Módulo 1: Princípios da Física Elétrica & Leis Fundamentais',
    description: 'Grandezas fundamentais (V, I, R, P, Q, S), Leis de Ohm e Kirchhoff, triângulo de potências e balanceamento de fases.',
    icon: 'Zap',
    normasReferencia: ['IEC 60027', 'IEC 60038', 'IEC 60364-1'],
    lessons: [
      {
        id: 'elec_m1_ec1_grandezas_ohm',
        moduleId: 'elec_mod_1_fisica',
        moduleTitle: 'Módulo 1: Princípios da Física Elétrica & Leis Fundamentais',
        order: 1,
        code: 'EC 1.1',
        title: 'Grandezas Fundamentais e Lei de Ohm Aplicada',
        norma: 'IEC 60038 / IEC 60364-1',
        level: 'Básico',
        durationMinutes: 12,
        theory: {
          conceito: 'A corrente elétrica (I, em Amperes) é o fluxo ordenado de elétrons impulsionado pela Tensão (V, em Volts) através da oposição exercida pela Resistência (R, em Ohms). Em qualquer condutor, a intensidade da corrente é diretamente proporcional à diferença de potencial e inversamente proporcional à resistência do circuito.',
          formulas: [
            { label: 'Lei de Ohm Fundamental', formula: 'V = I × R', explicacao: 'Tensão (V) = Corrente (A) multiplicada pela Resistência (Ω)' },
            { label: 'Corrente de Circuito', formula: 'I = V / R', explicacao: 'Cálculo direto da corrente de carga em função da resistência' },
            { label: 'Resistência do Condutor', formula: 'R = ρ × (L / S)', explicacao: 'ρ cobre = 0,0178 Ω·mm²/m a 20°C (ajustado para 0,0225 a 70°C)' },
            { label: 'Potência Elétrica Ativa', formula: 'P = V × I = R × I²', explicacao: 'Potência dissipada por efeito Joule em cargas puramente resistivas' }
          ],
          pontosOperacionais: [
            'Diferença crítica entre circuito fechado (corrente normal), circuito aberto (R = ∞, I = 0) e curto-circuito (R ≈ 0, I atinge milhares de amperes gerando arco elétrico).',
            'Sempre medir resistência com o circuito 100% DESENERGIZADO e descarregado; injetar tensão no ohmímetro queima o fusível interno do instrumento.',
            'Aumento de temperatura eleva a resistência do cobre (coeficiente α = +0,00393/°C), reduzindo a capacidade de condução de corrente de cabos em climas quentes.',
            'Instrumentação recomendada: Multímetro Digital com categoria de sobretensão mínima CAT III 600V / CAT IV 300V segundo a IEC 61010.'
          ],
          fieldCase: {
            localizacao: 'Manhiça, Província de Maputo',
            cenario: 'Bomba submersível monofásica de 230V 1,5 kW instalada a 90 metros do quadro geral operando com cabo paralelo flexível de apenas 1,5 mm².',
            diagnostico: 'A resistência do cabo (R = 2 × 90m × 0,0225 / 1,5 = 2,7 Ω) provocava uma queda de tensão de 26V sob corrente de 9,5A. O motor recebia apenas 204V nos bornes, superaquecia e desarmava o protetor térmico após 8 minutos de bombeamento.',
            solucaoNormativa: 'Substituição do condutor por cabo subterrâneo de 4 mm² (R = 1,01 Ω). A tensão nos bornes subiu para 221V (queda inferior a 4%), normalizando a corrente e cessando os desarmes.'
          },
          funcionamento: 'A Lei de Ohm governa todos os condutores elétricos lineares. Em Moçambique, a rede de distribuição pública da EDM opera em 230V monofásico e 400V trifásico 50Hz (IEC 60038). A resistência específica dos condutores gera perdas térmicas contínuas por efeito Joule (P = R·I²), exigindo dimensionamento rigoroso da seção transversal (S em mm²).',
          aplicacaoMocambique: 'Com temperaturas ambiente superiores a 38°C em regiões como Tete, Chimoio e Gaza, a resistência ôhmica dos cabos aumenta significativamente, acentuando a queda de tensão e acelerando o ressecamento do isolamento em PVC.',
          exemploPratico: 'Verificação de resistência de aquecedor elétrico industrial de 4600W 230V: R = V² / P = 230² / 4600 = 11,5 Ω. Se o multímetro ler 0 Ω, há curto-circuito interno; se ler infinito (OL), o elemento resistivo está rompido.',
          calculationSnippet: 'V = I × R | P = V × I = R × I²'
        },
        quiz: {
          question: 'Um aquecedor de água industrial opera em 230 V monofásico 50 Hz com corrente nominal de 10 A. Se a resistência do elemento de aquecimento for medida em bancada com multímetro desligado, qual valor ôhmico teórico deve ser encontrado segundo a Lei de Ohm?',
          options: [
            { id: 'A', text: '2,3 Ω', isCorrect: false, feedback: '2,3 Ω resultaria em uma corrente catastrófica de 100 A (curto-circuito).' },
            { id: 'B', text: '23 Ω', isCorrect: true, feedback: 'Correto! Pela Lei de Ohm: R = V / I = 230 V / 10 A = 23 Ω.' },
            { id: 'C', text: '2300 Ω', isCorrect: false, feedback: '2300 Ω limitaria a corrente a apenas 0,1 A, gerando apenas 23 W de calor.' },
            { id: 'D', text: '0 Ω', isCorrect: false, feedback: '0 Ω indica curto-circuito pleno entre os polos do resistor.' }
          ],
          explanation: 'Pela 1ª Lei de Ohm (V = I × R), isolando a resistência obtemos R = V / I. Substituindo os valores nominais: R = 230 V / 10 A = 23 Ω. A potência dissipada é P = V × I = 230 × 10 = 2300 W (2,3 kW).',
          keyTakeaway: 'R = V / I: Resistência nominal de 230V a 10A é exatamente 23 Ohms.',
          xpReward: 50
        }
      },
      {
        id: 'elec_m1_ec2_potencia_ac_fator',
        moduleId: 'elec_mod_1_fisica',
        moduleTitle: 'Módulo 1: Princípios da Física Elétrica & Leis Fundamentais',
        order: 2,
        code: 'EC 1.2',
        title: 'Potência em Corrente Alternada (P, Q, S) e Fator de Potência',
        norma: 'IEC 60038 / IEC 60831',
        level: 'Básico',
        durationMinutes: 14,
        theory: {
          conceito: 'Em corrente alternada (50 Hz), existem três tipos de potência interligadas pelo Triângulo de Potências: Potência Ativa (P, em Watts/kW - realiza trabalho mecânico e luz), Potência Reativa (Q, em VAr/kVAr - magnetiza núcleos de motores e transformadores) e Potência Aparente (S, em VA/kVA - potência total fornecida pela rede e suportada por cabos e geradores).',
          formulas: [
            { label: 'Potência Ativa Monofásica', formula: 'P = V × I × cos φ', explicacao: 'Potência real consumida (W ou kW)' },
            { label: 'Potência Ativa Trifásica', formula: 'P = √3 × V_L × I_L × cos φ', explicacao: 'V_L = 400V entre fases na rede EDM' },
            { label: 'Potência Aparente Total', formula: 'S = √(P² + Q²)', explicacao: 'Dimensão total exigida de transformadores e cabos (VA ou kVA)' },
            { label: 'Fator de Potência', formula: 'FP = cos φ = P / S', explicacao: 'Relação entre trabalho útil e energia total movimentada' }
          ],
          pontosOperacionais: [
            'O Fator de Potência (cos φ) varia de 0 a 1. Valores abaixo de 0,92 geram multas pesadas da EDM para consumidores industriais e comerciais.',
            'Cargas indutivas (motores, transformadores, reatores eletromagnéticos) atrasam a corrente em relação à tensão, demandando reativos indutivos (+Q).',
            'Capacitores adiantam a corrente em 90°, fornecendo reativos capacitivos (-Q) que anulam a corrente indutiva nos condutores montante.',
            'Nunca sobrecorrigir para FP capacitivo (cos φ adiantado > 1,00), pois isso causa sobretensões perigosas em vazio na rede de baixa tensão.'
          ],
          fieldCase: {
            localizacao: 'Chimoio, Província de Manica',
            cenario: 'Serralharia industrial com três motores trifásicos de 7,5 kW operando com fator de potência medido de 0,71. O disjuntor geral de 63A desarmava frequentemente por sobrecorrente térmica sem aumento de produção.',
            diagnostico: 'Com FP = 0,71, a potência aparente era S = 22,5 kW / 0,71 = 31,7 kVA, exigindo uma corrente de linha de I = 31700 / (√3 × 400) = 45,7 A contínuos por fase, operando no limite térmico do cabo e disparando o disjuntor nos dias quentes.',
            solucaoNormativa: 'Instalação de um banco de capacitores fixo de 12,5 kVAr próximo aos motores. O FP subiu para 0,95, reduzindo a corrente de linha para 34,2 A (alívio de 25% na carga dos cabos), eliminando desarmes e evitando multas da concessionária.'
          },
          funcionamento: 'A energia reativa não realiza trabalho útil, mas é indispensável para criar os campos magnéticos dos motores de indução. Como ela sobrecarrega transformadores e cabos com corrente inútil, a correção do FP é uma exigência técnica e econômica fundamental em qualquer instalação industrial.',
          aplicacaoMocambique: 'A EDM monitora a potência reativa através de contadores eletrônicos de 4 quadrantes. Instalações que não corrigem o fator de potência pagam faturas com tarifas agravadas de energia reativa indutiva consumida fora das horas de ponta.',
          exemploPratico: 'Um transformador de 100 kVA operando com FP = 0,70 só consegue entregar 70 kW de potência ativa antes de queimar por sobrecorrente. Corrigindo o FP para 0,95, o mesmo transformador passa a entregar 95 kW com a mesma corrente térmica.',
          calculationSnippet: 'P = V × I × cos φ | S = √(P² + Q²) | FP = P / S'
        },
        quiz: {
          question: 'Em uma instalação trifásica alimentada a 400V 50Hz, um motor consome 16 kW de potência ativa com potência aparente de 20 kVA. Qual é o fator de potência (cos φ) da carga e qual ação corretiva é indicada segundo a norma IEC 60831?',
          options: [
            { id: 'A', text: 'FP = 1,25 (excelente, não requer nenhuma ação).', isCorrect: false, feedback: 'O fator de potência nunca pode ultrapassar 1,00. Dividiu S por P invertido.' },
            { id: 'B', text: 'FP = 0,80 (indutivo baixo; requer instalação de banco de capacitores para elevar acima de 0,92).', isCorrect: true, feedback: 'Exato! FP = P / S = 16 kW / 20 kVA = 0,80. Abaixo do limite de 0,92 exigido pela concessionária, necessitando capacitores.' },
            { id: 'C', text: 'FP = 0,50 (motor em curto-circuito).', isCorrect: false, feedback: 'O cálculo correto resulta em 0,80, não 0,50.' },
            { id: 'D', text: 'FP = 0,98 (não necessita de correção).', isCorrect: false, feedback: 'O valor real medido de 16/20 resulta em 0,80.' }
          ],
          explanation: 'O Fator de Potência é a razão entre a potência ativa e a potência aparente: FP = P / S = 16 kW / 20 kVA = 0,80. Estando abaixo de 0,92, a instalação sofre penalizações tarifárias e sobrecarga de corrente, sendo necessária a instalação de capacitores de correção.',
          keyTakeaway: 'FP = P / S: Fator de potência abaixo de 0,92 sobrecarrega condutores e exige compensação capacitiva.',
          xpReward: 50
        }
      },
      {
        id: 'elec_m1_ec3_kirchhoff_circuitos',
        moduleId: 'elec_mod_1_fisica',
        moduleTitle: 'Módulo 1: Princípios da Física Elétrica & Leis Fundamentais',
        order: 3,
        code: 'EC 1.3',
        title: 'Leis de Kirchhoff e Corrente no Neutro em Redes Trifásicas',
        norma: 'IEC 60364-5-52 / IEC 60038',
        level: 'Básico',
        durationMinutes: 14,
        theory: {
          conceito: 'A 1ª Lei de Kirchhoff (Lei dos Nós) estipula que a soma algébrica das correntes que convergem para um nó é igual a zero (a corrente total que entra é igual à que sai). Em sistemas trifásicos estrela (Y) com neutro a 400V/230V, o neutro é o nó de retorno das correntes de fase: I_N = -(I_R + I_S + I_T).',
          formulas: [
            { label: 'Lei dos Nós de Kirchhoff', formula: 'Σ I_entra = Σ I_sai', explicacao: 'Conservação da carga elétrica em qualquer ponto de junção' },
            { label: 'Lei das Malhas de Kirchhoff', formula: 'Σ V_fontes = Σ V_quedas', explicacao: 'A soma das quedas de tensão em qualquer circuito fechado é nula' },
            { label: 'Corrente no Neutro (Cargas Lineares)', formula: 'I_N = √(I_R² + I_S² + I_T² - I_R·I_S - I_S·I_T - I_T·I_R)', explicacao: 'Em carga perfeitamente equilibrada (I_R = I_S = I_T), I_N = 0 A' }
          ],
          pontosOperacionais: [
            'Em sistemas perfeitamente equilibrados, a corrente no neutro é zero. Contudo, em edifícios comerciais com iluminação LED e computadores, o desbalanceamento e a 3ª harmônica (150 Hz) se somam no neutro.',
            'A norma IEC 60364-5-52 proíbe reduzir a seção do neutro quando o desbalanceamento ou taxa de harmônicos de 3ª ordem ultrapassa 33%.',
            'NUNCA interromper ou instalar disjuntor unipolar no condutor de neutro sem corte simultâneo das fases; romper o neutro causa flutuação de tensão até 400V em cargas monofásicas, queimando eletrodomésticos.',
            'Sempre usar barramento de neutro com parafusos de aperto firme; neutro solto é a causa número 1 de queima em massa de aparelhos eletroeletrônicos.'
          ],
          fieldCase: {
            localizacao: 'Zimpeto, Maputo',
            cenario: 'Edifício de escritórios alimentado por ramal trifásico 400V/230V. Em uma tarde, lâmpadas começaram a explodir e computadores queimaram em um andar, enquanto no outro as luzes ficaram fracas e trêmulas.',
            diagnostico: 'O condutor de neutro no QGBT estava mal apertado e sofreu queima e desconexão por arco elétrico. Com o neutro rompido, as cargas monofásicas de 230V ficaram ligadas em série entre fases a 400V. A fase com menor carga recebeu mais de 340V, queimando fontes e circuitos.',
            solucaoNormativa: 'Reconstrução do barramento de neutro com terminal de compressão estanhado e instalação de Relé de Monitoramento de Falta de Fase e Neutro intertravado com a bobina de disparo do disjuntor geral.'
          },
          funcionamento: 'A Lei dos Nós explica por que o condutor de neutro conduz a corrente residual de desequilíbrio das três fases. Quando as correntes são desiguais, o vetor resultante flui pelo neutro de volta para a estrela do transformador da EDM.',
          aplicacaoMocambique: 'Em centros comerciais de Maputo e Matola, o uso massivo de ares-condicionados monofásicos distribuídos sem critério de balanceamento faz o neutro esquentar mais do que as fases, gerando risco de incêndio silencioso em bandejas de cabos.',
          exemploPratico: 'Num quadro de distribuição com Fase R = 40A, Fase S = 38A e Fase T = 41A, a corrente no neutro medida com alicate amperímetro foi de apenas 2,8A. O balanceamento está excelente e o neutro opera frio.',
          calculationSnippet: 'Σ I_nó = 0 | Neutro flutuante = sobretensão catastrófica até 400V'
        },
        quiz: {
          question: 'Em uma instalação comercial trifásica com neutro (400V / 230V 50Hz), o que acontece se o condutor de neutro for acidentalmente rompido enquanto cargas monofásicas desbalanceadas permanecem ligadas?',
          options: [
            { id: 'A', text: 'Todos os equipamentos desligam com segurança e a tensão cai para zero em todas as tomadas.', isCorrect: false, feedback: 'As fases continuam ativas a 400V entre si, gerando divisor de tensão não nulo.' },
            { id: 'B', text: 'Cria-se um neutro flutuante: a fase com menor carga sofre sobretensão destrutiva (até quase 400V) queimando aparelhos, enquanto a fase mais carregada sofre subtensão.', isCorrect: true, feedback: 'Perfeito! Sem a referência de zero do neutro, as cargas ficam em série entre duas fases de 400V. A menor impedância recebe menos tensão e a maior impedância recebe sobretensão destrutiva.' },
            { id: 'C', text: 'A frequência da rede sobe de 50 Hz para 100 Hz imediatamente.', isCorrect: false, feedback: 'A frequência é gerada na central hidrelétrica de Cahora Bassa e não se altera com o neutro.' },
            { id: 'D', text: 'O transformador da EDM desarma instantaneamente por corrente reversa.', isCorrect: false, feedback: 'O transformador não detecta o rompimento do neutro local na instalação do cliente.' }
          ],
          explanation: 'Com a interrupção do neutro em sistema trifásico desequilibrado, o ponto estrela flutua. O circuito monofásico de menor potência (maior resistência) recebe a maior parcela da tensão de linha (400V), superando 300V a 350V e queimando imediatamente fontes eletrônicas, lâmpadas e motores.',
          keyTakeaway: 'Neutro rompido em rede trifásica = sobretensão catastrófica nas cargas leves por deslocamento do neutro.',
          xpReward: 50
        }
      }
    ]
  },

  // ==========================================================================
  // MÓDULO 2: INSTALAÇÕES ELÉTRICAS PREDIAIS & PRÁTICAS BÁSICAS
  // ==========================================================================
  {
    id: 'elec_mod_2_predial',
    area: 'eletrotecnica',
    order: 2,
    title: 'Módulo 2: Instalações Elétricas Prediais & Práticas Básicas',
    description: 'Comandos de iluminação (Simples, Diverter/Three-Way, Intermediate/Four-Way), tomadas TUG/TUE, quadros parciais e normas IEC 60364-5-52.',
    icon: 'Layers',
    normasReferencia: ['IEC 60364-5-52', 'IEC 60364-4-41', 'IEC 60898-1'],
    lessons: [
      {
        id: 'elec_m2_ec1_comandos_iluminacao',
        moduleId: 'elec_mod_2_predial',
        moduleTitle: 'Módulo 2: Instalações Elétricas Prediais & Práticas Básicas',
        order: 1,
        code: 'EC 2.1',
        title: 'Comandos de Iluminação: Simples, Diverter (Three-Way) e Intermediário (Four-Way)',
        norma: 'IEC 60364-4-41 / IEC 60364-5-52',
        level: 'Básico',
        durationMinutes: 14,
        theory: {
          conceito: 'O controle de luminárias em instalações prediais utiliza esquemas padronizados de comutação: Interruptor Simples (um ponto), Diverter / Three-Way / Comutador de Escada (dois pontos distintos para escadas e corredores) e Intermediate / Four-Way / Interruptor Cruzamento (três ou mais pontos, posicionado entre dois comutadores de escada).',
          formulas: [
            { label: 'Bitola Mínima de Iluminação', formula: 'S_min = 1,5 mm²', explicacao: 'Condutores de cobre isolados para circuitos de iluminação (IEC 60364-5-52)' },
            { label: 'Proteção Máxima de Iluminação', formula: 'In_MCB ≤ 10 A ou 16 A', explicacao: 'Disjuntor magnetotérmico Curva B ou C dimensionado para o condutor' },
            { label: 'Cores Normativas IEC', formula: 'Fase: Castanho/Preto | Neutro: Azul Claro | PE: Verde/Amarelo', explicacao: 'Retornos de interruptores: Preto, Cinzento ou Branco (nunca Azul nem Verde-Amarelo)' }
          ],
          pontosOperacionais: [
            'REGRA DE OURO INEGOCIÁVEL: O interruptor deve SEMPRE seccionar o condutor de FASE, NUNCA o Neutro. Seccionar o neutro deixa o soquete da lâmpada energizado a 230V mesmo apagado, gerando risco fatal ao trocar uma lâmpada.',
            'Em circuitos Three-Way (comutadores de escada), utilizam-se 2 fios de ligação (retornos paralelos) entre os dois mecanismos.',
            'Para controlar de 3 ou mais pontos, instalam-se comutadores de escada nas pontas e interruptores intermediários (cruzamento com 4 bornes) nos pontos intermediários.',
            'Identificação de bornes de comutador: o borne Comum (L ou C) recebe a Fase no primeiro interruptor e sai para a Lâmpada no último; os bornes 1 e 2 ligam os fios viajantes.'
          ],
          fieldCase: {
            localizacao: 'Costa do Sol, Cidade de Maputo',
            cenario: 'Residência térrea onde a dona da casa tomava choques elétricos ao limpar o lustre da sala de jantar com o interruptor desligado.',
            diagnostico: 'O eletricista que executou a obra ligou a Fase direta ao soquete da luminária e passou o Neutro pelo interruptor. Como o neutro estava interrompido a lâmpada apagava, mas a carcaça e o bocal mantinham 230V vivos em relação ao piso molhado.',
            solucaoNormativa: 'Inversão das conexões na caixa de derivação: Fase direcionada ao borne L do interruptor e Neutro conectado diretamente ao polo roscado do receptáculo da lâmpada.'
          },
          funcionamento: 'O circuito Diverter possui contato reversível que direciona a corrente por uma de duas vias alternativas. O Intermediate inverte os dois condutores em cruz, permitindo alternar o estado do circuito independentemente da posição dos outros comutadores.',
          aplicacaoMocambique: 'Em moradias e edifícios residenciais em Moçambique, é frequente encontrar instalações antigas com fios unicolores pretos sem identificação. É mandatório aplicar fita termorretrátil colorida ou anilhas numéricas para evitar acidentes.',
          exemploPratico: 'Esquema Four-Way para corredor longo: [Fase] -> [Comutador Escada A] -> 2 fios viajantes -> [Comutador Cruzamento B] -> 2 fios viajantes -> [Comutador Escada C] -> [Retorno] -> [Luminária] -> [Neutro]. Qualquer tecla acende ou apaga.',
          calculationSnippet: 'Fase no interruptor SEMPRE | Retorno de escada = 2 vias | Cruzamento = 4 bornes'
        },
        quiz: {
          question: 'Em um corredor de hotel que requer o acendimento e apagamento das luminárias a partir de 4 locais distintos, qual configuração de interruptores deve ser utilizada segundo as boas práticas de instalações prediais?',
          options: [
            { id: 'A', text: '4 interruptores simples ligados em série na mesma fase.', isCorrect: false, feedback: 'Ligados em série, todos os 4 teriam que estar ligados simultaneamente para a luz acender.' },
            { id: 'B', text: '2 comutadores de escada (Three-Way) nas extremidades e 2 comutadores intermediários/cruzamento (Four-Way) no meio.', isCorrect: true, feedback: 'Correto! Os comutadores de escada ficam nos pontos extremos e todos os pontos intermediários utilizam comutadores de cruzamento (Four-Way).' },
            { id: 'C', text: '4 comutadores intermediários (Four-Way) sem comutador de escada.', isCorrect: false, feedback: 'O comutador de cruzamento requer a entrada de 2 vias geradas por um comutador de escada.' },
            { id: 'D', text: '4 sensores de presença sem condutor de neutro.', isCorrect: false, feedback: 'Sensores de presença eletrônicos necessitam de alimentação e não formam o circuito manual solicitado.' }
          ],
          explanation: 'Para comandar uma lâmpada de "N" pontos diferentes (com N ≥ 3): utilizam-se sempre 2 comutadores de escada (Diverter / Three-Way) nas pontas e (N - 2) comutadores de cruzamento (Intermediate / Four-Way) no meio. Para 4 pontos: 2 de escada e 2 intermediários.',
          keyTakeaway: 'N pontos de comando: 2 comutadores de escada nas extremidades e (N - 2) intermediários no centro.',
          xpReward: 50
        }
      },
      {
        id: 'elec_m2_ec2_tomadas_quadros',
        moduleId: 'elec_mod_2_predial',
        moduleTitle: 'Módulo 2: Instalações Elétricas Prediais & Práticas Básicas',
        order: 2,
        code: 'EC 2.2',
        title: 'Circuitos de Tomadas (TUG/TUE), Separação e Quadros Parciais',
        norma: 'IEC 60364-5-52 / IEC 60364-4-41',
        level: 'Básico',
        durationMinutes: 14,
        theory: {
          conceito: 'Instalações prediais seguras exigem a estrita separação de circuitos terminais por finalidade: Iluminação, Tomadas de Uso Geral (TUG) e Tomadas de Uso Específico (TUE - termoacumulador, fogão, ar condicionado). O Quadro Parcial de Distribuição (QPD) agrupa a proteção e o seccionamento dos circuitos locais.',
          formulas: [
            { label: 'Condição Fundamental de Proteção', formula: 'I_b ≤ I_n ≤ I_z', explicacao: 'Corrente de Projeto (Ib) ≤ Corrente Nominal MCB (In) ≤ Capacidade do Cabo (Iz)' },
            { label: 'Condutor Mínimo de Tomadas (TUG)', formula: 'S_min = 2,5 mm²', explicacao: 'Protegido tipicamente por MCB Curva C de 16 A (IEC 60364-5-52)' },
            { label: 'Proteção de Contato Indireto', formula: 'I_Δn ≤ 30 mA', explicacao: 'RCD/RCBO obrigatório em todos os circuitos de tomadas até 32A' }
          ],
          pontosOperacionais: [
            'Proibido misturar iluminação e tomadas no mesmo disjuntor em instalações novas (IEC 60364-3), garantindo que um curto numa tomada não deixe o recinto na escuridão total.',
            'Circuitos TUE de alta potência (termoacumuladores > 2 kW, ares condicionados > 12000 BTU) devem ter condutor dedicado de 4 mm² ou 6 mm² e disjuntor exclusivo.',
            'Barramentos tipo pente (pino ou garfo) isolados devem ser empregados no quadro em substituição a pontes artesanais de cabos flexíveis descascados.',
            'Todas as tomadas devem possuir alvéolos protegidos para crianças (obturadores móveis) e pino de terra PE funcional conectado à malha geral.'
          ],
          fieldCase: {
            localizacao: 'Polana Cimento, Maputo',
            cenario: 'Apartamento antigo reformado onde o disjuntor de 20A da cozinha desarmava diariamente por volta das 19h.',
            diagnostico: 'O instalador conectou o termoacumulador (2500W = 10,9A), o micro-ondas (1200W = 5,2A) e as tomadas da bancada no mesmo circuito de 2,5 mm². Quando o aquecedor ligava junto com o micro-ondas e a chaleira elétrica, a corrente atingia 27A, sobrecarregando o condutor e desarmando o disjuntor térmico.',
            solucaoNormativa: 'Lançamento de um circuito exclusivo de 4 mm² com disjuntor bipolar de 20A dedicado para o termoacumulador e redistribuição das tomadas da cozinha em dois circuitos independentes de 2,5 mm² com MCB 16A.'
          },
          funcionamento: 'A divisão de circuitos limita as consequências de uma falha local, facilita manutenções sem desenergizar a casa inteira e impede o aquecimento cumulativo em eletrodutos embutidos em alvenaria.',
          aplicacaoMocambique: 'Devido ao calor em Moçambique, ares condicionados operam simultaneamente com termoacumuladores. Dimensionar tomadas com fios de 1,5 mm² ou colocar múltiplos aparelhos no mesmo disjuntor causa aquecimento de caixas de embutir e incêndios.',
          exemploPratico: 'Um circuito com 8 tomadas de uso geral (TUG): cabo de cobre PVC 2,5 mm², disjuntor MCB Curva C 16A e RCD 30 mA. A capacidade de condução Iz do cabo embutido em alvenaria a 35°C é de aprox. 18,5 A, satisfazendo perfeitamente Ib (16A) ≤ In (16A) ≤ Iz (18,5A).',
          calculationSnippet: 'Ib ≤ In ≤ Iz | TUG = cabo 2,5 mm² + MCB 16A + RCD 30mA'
        },
        quiz: {
          question: 'Em uma instalação residencial monofásica a 230V, um circuito terminal exclusivo deve alimentar um termoacumulador (cilindro de água quente) de 3000 W. De acordo com a IEC 60364, qual é a corrente de projeto (Ib) e qual disjuntor magnetotérmico (In) com condutor de cobre deve ser especificado?',
          options: [
            { id: 'A', text: 'Ib = 6,5 A; cabo de 1,5 mm² com disjuntor de 10 A Curva B.', isCorrect: false, feedback: '3000 W a 230 V consome 13 A, muito acima de 10 A.' },
            { id: 'B', text: 'Ib = 13,04 A; cabo de 2,5 mm² (ou 4 mm²) protegido por disjuntor de 16 A Curva C.', isCorrect: true, feedback: 'Perfeito! Ib = P / V = 3000 / 230 = 13,04 A. O disjuntor padrão imediatamente superior é 16 A e o cabo de 2,5 mm² suporta até 18-21 A, cumprindo Ib ≤ In ≤ Iz.' },
            { id: 'C', text: 'Ib = 30 A; cabo de 10 mm² com disjuntor de 50 A Curva D.', isCorrect: false, feedback: 'Superdimensionamento excessivo sem necessidade técnica.' },
            { id: 'D', text: 'Ib = 8 A; cabo de 1,0 mm² ligado direto sem disjuntor.', isCorrect: false, feedback: 'Causaria derretimento do condutor e incêndio imediato.' }
          ],
          explanation: 'Calculando a corrente de projeto: Ib = P / V = 3000 W / 230 V = 13,04 A. A proteção deve satisfazer Ib ≤ In ≤ Iz. O disjuntor comercial padrão adequado é de 16 A (Curva C). O condutor de cobre de 2,5 mm² suporta 18,5 A a 21 A em eletroduto embutido, garantindo a integridade térmica do circuito.',
          keyTakeaway: 'Ib = P / V: Termoacumulador de 3 kW consome 13 A e exige condutor mín. 2,5 mm² com MCB 16A.',
          xpReward: 50
        }
      }
    ]
  },

  // ==========================================================================
  // MÓDULO 3: PROTEÇÕES ELÉTRICAS & NORMAS IEC (IEC 60364)
  // ==========================================================================
  {
    id: 'elec_mod_3_protecoes_iec',
    area: 'eletrotecnica',
    order: 3,
    title: 'Módulo 3: Proteções Elétricas & Normas IEC (IEC 60364)',
    description: 'Dimensionamento de MCB (Curvas B, C, D), capacidade de corte Icn, dispositivos diferenciais RCD/RCBO (Tipos AC, A, B), esquemas de aterramento TT/TN/IT e SPDs.',
    icon: 'ShieldCheck',
    normasReferencia: ['IEC 60364-4-41', 'IEC 60898-1', 'IEC 61008-1', 'IEC 61643-11'],
    lessons: [
      {
        id: 'elec_m3_ec1_mcb_curvas_icn',
        moduleId: 'elec_mod_3_protecoes_iec',
        moduleTitle: 'Módulo 3: Proteções Elétricas & Normas IEC (IEC 60364)',
        order: 1,
        code: 'EC 3.1',
        title: 'Disjuntores Magnetotérmicos (MCB): Curvas B, C, D e Poder de Corte (Icn)',
        norma: 'IEC 60898-1 / IEC 60947-2',
        level: 'Intermediário',
        durationMinutes: 14,
        theory: {
          conceito: 'Disjuntores magnetotérmicos (MCB) combinam proteção térmica (bimetal para sobrecargas moderadas e prolongadas) e proteção magnética (bobina eletromagnética para desarmes instantâneos em curto-circuito em menos de 0,1s). As curvas normalizadas B, C e D definem o múltiplo da corrente nominal (In) necessário para o disparo magnético instantâneo.',
          formulas: [
            { label: 'Curva B (Instantâneo)', formula: '3 × In a 5 × In', explicacao: 'Cargas resistivas, geradores e cabos longos com baixa corrente de curto' },
            { label: 'Curva C (Instantâneo)', formula: '5 × In a 10 × In', explicacao: 'Uso padrão geral: iluminação mista, tomadas, pequenos motores' },
            { label: 'Curva D (Instantâneo)', formula: '10 × In a 20 × In', explicacao: 'Cargas com forte inrush: transformadores, motores pesados, raio-X' },
            { label: 'Capacidade de Corte (Icn)', formula: 'Icn ≥ Ik_presumida', explicacao: 'Capacidade de extinguir o curto sem explosão do invólucro (ex: 6 kA, 10 kA)' }
          ],
          pontosOperacionais: [
            'Nunca aumente o calibre de corrente (In) de um disjuntor apenas porque ele desarma na partida de um motor! Isso deixa o cabo desprotegido contra incêndio. A solução correta é manter o In e mudar a Curva (ex: de C para D).',
            'O poder de interrupção nominal (Icn segundo IEC 60898 ou Icu segundo IEC 60947-2) deve ser superior à corrente de curto-circuito presumida no ponto de instalação.',
            'Quadros próximos a transformadores de distribuição da EDM frequentemente apresentam correntes de curto superiores a 6 kA ou 8 kA; disjuntores residenciais de 3 kA explodem nessas condições.',
            'Verificar sempre a classe de limitação de energia (Classe 3 é a melhor, reduzindo o I²t transferido para os cabos).'
          ],
          fieldCase: {
            localizacao: 'Nacala, Província de Nampula',
            cenario: 'Fábrica de processamento onde um compressor de ar industrial trifásico de 11 kW (In = 22 A) fazia desarmar o disjuntor geral do quadro toda vez que partia.',
            diagnostico: 'O disjuntor instalado era de 25A Curva B (disparo magnético entre 75A e 125A). A corrente de partida direta do compressor atingia 150A durante 1,2 segundos, entrando na zona de atuação magnética instantânea do Curva B.',
            solucaoNormativa: 'Substituição por MCB de 25A Curva D (disparo magnético entre 250A e 500A). O motor partiu normalmente sem desarmar e o condutor de 4 mm² continuou 100% protegido contra sobrecargas contínuas pelo bimetal de 25A.'
          },
          funcionamento: 'A câmara de extinção de arco com aletas deionizadoras divide o arco em arcos menores, resfriando-o e extinguindo-o na passagem por zero. Um disjuntor com Icn inadequado tem sua carcaça rompida, espalhando cobre fundido e fogo pelo painel.',
          aplicacaoMocambique: 'A proximidade de muitos edifícios com cabines de transformação da EDM em cidades litorâneas exige atenção redobrada ao poder de corte dos disjuntores gerais dos quadros (mínimo de 6 kA a 10 kA).',
          exemploPratico: 'Num circuito com cabo de 6 mm² (capacidade Iz = 34 A em canaleta): disjuntor correto In = 32 A Curva C ou D. Se fosse colocado disjuntor de 50 A, o cabo pegaria fogo antes de o disjuntor desarmar por sobrecarga.',
          calculationSnippet: 'Curva B: 3-5 In | Curva C: 5-10 In | Curva D: 10-20 In | Icn ≥ Ik'
        },
        quiz: {
          question: 'Em uma oficina de caldeiraria, foi instalado um transformador elevador monofásico de 5 kVA 230V (In = 21,7 A). Ao ligar o transformador à rede em vazio, o disjuntor de 25A Curva C desarma instantaneamente devido ao surto de magnetização (inrush). Qual é a solução tecnicamente correta segundo a IEC 60898?',
          options: [
            { id: 'A', text: 'Trocar o disjuntor por um de 63 A Curva C para aguentar o surto.', isCorrect: false, feedback: 'Erro gravíssimo! Deixaria o cabo de alimentação sem proteção térmica contra sobrecarga.' },
            { id: 'B', text: 'Substituir o disjuntor de 25 A Curva C por um disjuntor de 25 A Curva D, suportando o inrush sem comprometer a proteção térmica do cabo.', isCorrect: true, feedback: 'Correto! A Curva D tolera picos de magnetização transitória de 10 a 20 vezes In (250A a 500A) sem disparar e mantém a proteção térmica ajustada à bitola do cabo.' },
            { id: 'C', text: 'Instalar um disjuntor Curva B de 20 A.', isCorrect: false, feedback: 'Curva B é ainda mais sensível (3 a 5 In) e desarmaria com mais facilidade.' },
            { id: 'D', text: 'Retirar o condutor de aterramento da carcaça do transformador.', isCorrect: false, feedback: 'Violação criminosa de segurança contra choques elétricos.' }
          ],
          explanation: 'Cargas altamente indutivas e magnéticas (como transformadores em vazio e motores com partida pesada) produzem fortíssimas correntes transitórias de magnetização (inrush) de 10 a 15 vezes In. A IEC 60898 preconiza a Curva D (10 a 20 In magnético) para essas cargas, permitindo manter o calibre nominal In adequado ao cabo.',
          keyTakeaway: 'Inrush elevado: use Curva D (10-20 In) mantendo o calibre nominal compatível com a fiação.',
          xpReward: 50
        }
      },
      {
        id: 'elec_m3_ec2_rcd_rcbo_tipos',
        moduleId: 'elec_mod_3_protecoes_iec',
        moduleTitle: 'Módulo 3: Proteções Elétricas & Normas IEC (IEC 60364)',
        order: 2,
        code: 'EC 3.2',
        title: 'Dispositivos Diferenciais Residuais (RCD/RCBO): Tipos AC, A, B e Seletividade',
        norma: 'IEC 61008-1 / IEC 61009-1 / IEC 62423',
        level: 'Intermediário',
        durationMinutes: 15,
        theory: {
          conceito: 'Dispositivos Diferenciais Residuais (RCD / IDR) medem a soma vetorial das correntes nos condutores ativos (fases e neutro) através de um transformador toroidal. Se houver fuga para a terra superior à sensibilidade nominal (I_Δn), o mecanismo dispara desenergizando o circuito para salvar vidas e evitar incêndios.',
          formulas: [
            { label: 'Sensibilidade de Proteção de Vidas', formula: 'I_Δn ≤ 30 mA', explicacao: 'Disparo em t ≤ 40 ms para evitar fibrilação ventricular' },
            { label: 'Proteção contra Incêndios', formula: 'I_Δn = 300 mA', explicacao: 'Evita ignição de materiais combustíveis por arcos de fuga' },
            { label: 'Condição em Regime TT', formula: 'Ra × I_Δn ≤ 50 V', explicacao: 'Tensão de contato de segurança em locais secos (25V em locais úmidos)' }
          ],
          pontosOperacionais: [
            'Tipo AC: Detecta APENAS correntes alternadas puramente senoidais. É proibido em muitos países europeus para circuitos com eletrônica moderna.',
            'Tipo A: Detecta correntes alternadas e contínuas pulsantes (fontes monofásicas, inversores de máquina de lavar, retificadores simples).',
            'Tipo B: Detecta AC, DC pulsante e Corrente Contínua Pura (DC alisada). OBRIGATÓRIO em inversores solares trifásicos, carregadores de carros elétricos (EV) e VFDs industriais.',
            'Correntes contínuas saturam o toroide magnético de RCDs Tipo AC ou Tipo A, "cegando-os" e impedindo o desarme mesmo em caso de choque elétrico letal!'
          ],
          fieldCase: {
            localizacao: 'Matola Rio, Maputo',
            cenario: 'Indústria gráfica equipada com três inversores de frequência trifásicos protegida por um RCD geral Tipo AC de 300 mA. Durante manutenção, um operador encostou num condutor descascado e sofreu choque sem que o RCD desarmasse.',
            diagnostico: 'Os retificadores trifásicos de 6 pulsos dos inversores injetavam uma corrente de fuga residual de 35 mA em corrente contínua pura (DC). O núcleo toroidal do RCD Tipo AC estava totalmente saturado magneticamente pela componente DC, ficando paralisado e incapaz de detectar faltas alternadas.',
            solucaoNormativa: 'Substituição imediata por RCD Tipo B certificado pela IEC 62423. O RCD Tipo B opera com eletrônica de medição ativa e desarmou com precisão no teste de injeção de corrente DC.'
          },
          funcionamento: 'O RCD não substitui o disjuntor; ele protege exclusivamente contra fugas à terra e choques. O RCBO combina em um único módulo a proteção de disjuntor (sobrecarga e curto-circuito) e diferencial residual.',
          aplicacaoMocambique: 'Em locais húmidos da costa moçambicana com maresia e piscinas, a proteção com RCD de 30 mA é a única barreira que impede acidentes fatais por contato indireto ou direto com água.',
          exemploPratico: 'Teste obrigatório: pressionar o botão mensal "T" (Test) no corpo do RCD para verificar mecanicamente o mecanismo de disparo. Se não disparar, deve ser trocado imediatamente.',
          calculationSnippet: 'I_Δn ≤ 30 mA para proteção de pessoas | Inversores = RCD Tipo B obrigatório'
        },
        quiz: {
          question: 'Em uma linha de envase industrial que utiliza inversores de frequência trifásicos (VFD) com retificadores de ponte de 6 pulsos e barramento de corrente contínua, qual tipo de RCD deve ser especificado obrigatoriamente segundo a IEC 60364-5-53 e IEC 62423?',
          options: [
            { id: 'A', text: 'RCD Tipo AC padrão, por ser o mais econômico.', isCorrect: false, feedback: 'O Tipo AC satura magneticamente com fugas DC e cega completamente, não desarmando!' },
            { id: 'B', text: 'RCD Tipo B, projetado para detectar correntes diferenciais alternadas, de alta frequência e de corrente contínua pura (DC alisada).', isCorrect: true, feedback: 'Correto! A IEC 60364-5-53 (531.3.3) prescreve expressamente RCD Tipo B para cargas trifásicas que possam gerar fugas DC alisadas.' },
            { id: 'C', text: 'Eliminar o RCD e usar apenas cabo de terra sem proteção.', isCorrect: false, feedback: 'Violação frontal da proteção contra choques elétricos.' },
            { id: 'D', text: 'RCD Tipo A com corrente nominal de 100 A.', isCorrect: false, feedback: 'Tipo A só detecta corrente pulsante monofásica, falhando em DC puro trifásico.' }
          ],
          explanation: 'Retificadores trifásicos de 6 pulsos podem gerar correntes residuais de fuga em corrente contínua pura (DC alisada). Os RCDs comuns (Tipo AC e Tipo A) sofrem saturação de núcleo na presença de componentes DC superiores a 6 mA, perdendo a capacidade de desarme. Apenas o Tipo B (IEC 62423) possui circuitos capazes de medir correntes diferenciais contínuas e de alta frequência.',
          keyTakeaway: 'Inversores de frequência trifásicos e carregadores EV exigem RCD Tipo B (IEC 62423).',
          xpReward: 50
        }
      },
      {
        id: 'elec_m3_ec3_esquemas_aterramento',
        moduleId: 'elec_mod_3_protecoes_iec',
        moduleTitle: 'Módulo 3: Proteções Elétricas & Normas IEC (IEC 60364)',
        order: 3,
        code: 'EC 3.3',
        title: 'Sistemas de Aterramento (TT, TN-S, TN-C, IT) e Tensão de Toque',
        norma: 'IEC 60364-3 / IEC 60364-4-41 / IEC 60364-5-54',
        level: 'Avançado',
        durationMinutes: 16,
        theory: {
          conceito: 'A classificação IEC 60364-3 define a relação da fonte e das massas da instalação com a terra:\n• 1ª Letra (Situação da Fonte): T = Terra direta; I = Isolado da terra.\n• 2ª Letra (Situação das Massas): T = Terra local independente; N = Conectadas ao Neutro aterrado na fonte.\n• Letras Subsequentes: S = Condutor Neutro (N) e Proteção (PE) Separados; C = Condutor Combinado (PEN).',
          formulas: [
            { label: 'Disparo em TN-S', formula: 'Zs × Ia ≤ U0', explicacao: 'Zs = Impedância do loop de falta; Ia = corrente de disparo instantâneo; U0 = 230V' },
            { label: 'Tempo de Corte em 230V (TN)', formula: 't ≤ 0,4 s', explicacao: 'Tempo máximo para desligamento de circuitos terminais até 32A' },
            { label: 'Condição em Regime TT', formula: 'Ra × I_Δn ≤ 50 V', explicacao: 'Como If é baixa (limitada pela terra), RCD é mandatório para corte' }
          ],
          pontosOperacionais: [
            'No regime TT (padrão predominante em Moçambique na rede EDM), a corrente de falta à massa circula pelo solo e atinge tipicamente apenas 10A a 20A. Disjuntores magnetotérmicos NUNCA disparam em falta à terra no regime TT! O uso de RCD é 100% OBRIGATÓRIO.',
            'No regime TN-S, a falta à massa é um curto-circuito pleno fase-PE de altíssima corrente, disparando o disjuntor em milissegundos.',
            'No regime TN-C, o condutor PEN combina neutro e terra. É TERMINANTEMENTE PROIBIDO seccionar o PEN (nunca colocar chave ou fusível no PEN) e bitola mínima é 10 mm² em cobre.',
            'No regime IT, a 1ª falta não desliga o circuito (apenas soa alarme do monitor de isolação IMD), garantindo continuidade de cirurgias e processos contínuos.'
          ],
          fieldCase: {
            localizacao: 'Xai-Xai, Gaza',
            cenario: 'Panificadora alimentada em regime TT com eletrodo de terra medido em Ra = 16 Ω. Um cabo de fase tocou a carcaça metálica da amassadeira. O circuito era protegido por disjuntor Curva C de 32A sem RCD.',
            diagnostico: 'A corrente de falta foi de If = 230V / (16 Ω terra local + 4 Ω terra EDM) = 11,5 A. Para disparar instantaneamente, o MCB 32A Curva C exige pelo menos 160 A (5 × In). O disjuntor não desarmou e a carcaça permaneceu eletrificada a mais de 180V, dando choques graves nos padeiros.',
            solucaoNormativa: 'Instalação de um Interruptor Diferencial Residual (RCD) tetrapolar de 30 mA no quadro. Na simulação de falta, o RCD desligou a alimentação em 18 milissegundos, cumprindo Ra × I_Δn = 16 × 0,03 = 0,48 V << 50 V.'
          },
          funcionamento: 'A proteção contra choques fundamenta-se no desligamento automático da alimentação antes que a tensão de toque e o tempo de passagem pelo corpo humano causem parada cardíaca irreversível.',
          aplicacaoMocambique: 'A EDM fornece neutro aterrado no transformador mas não distribui cabo de terra aos clientes residenciais. Portanto, as instalações operam em regime TT, tornando irresponsável qualquer instalação sem RCD.',
          exemploPratico: 'Verificação de conformidade em regime TT com terra de 20 Ohms e RCD de 30 mA: Tensão de contato máxima = 20 Ω × 0,03 A = 0,6 V. Como 0,6 V é infinitamente menor que 50 V, a instalação está perfeitamente segura.',
          calculationSnippet: 'TT: RCD mandatório (Ra × I_Δn ≤ 50V) | TN-S: Zs × Ia ≤ U0 | IT: Não desliga na 1ª falta'
        },
        quiz: {
          question: 'Em uma instalação comercial conectada à rede pública da EDM em regime TT (tensão de fase 230V), a resistência do elétrodo de terra das massas é Ra = 15 Ω. Por que um disjuntor termomagnético Curva C de 32 A NÃO protege as pessoas contra choques elétricos por contato indireto?',
          options: [
            { id: 'A', text: 'Porque o disjuntor Curva C só funciona em corrente contínua.', isCorrect: false, feedback: 'Disjuntores Curva C operam perfeitamente em corrente alternada.' },
            { id: 'B', text: 'Porque a corrente de falta à terra (aprox. 12 A a 15 A) é insuficiente para acionar o disparo do disjuntor de 32 A (que necessita de 160 A magnético), mantendo a carcaça energizada.', isCorrect: true, feedback: 'Exato! A corrente de falta em regime TT é limitada pela resistência de terra (230 / 17 ≈ 13,5 A). O MCB Curva C 32A precisa de 160A para corte instantâneo. Sem RCD, a carcaça fica indefinidamente a 200V!' },
            { id: 'C', text: 'Porque a norma IEC 60364 proíbe totalmente o uso de disjuntores em redes TT.', isCorrect: false, feedback: 'Disjuntores são obrigatórios para sobrecargas e curtos entre fases/neutro.' },
            { id: 'D', text: 'Porque o disjuntor desarma rápido demais e queima o motor.', isCorrect: false, feedback: 'O problema é o oposto: ele não desarma de modo algum!' }
          ],
          explanation: 'No regime TT, a impedância do circuito de defeito inclui a resistência da terra da instalação (Ra) e a terra da fonte (Rb). Para Ra = 15 Ω, a corrente de fuga é de aprox. 13 A. Um disjuntor Curva C de 32 A necessita de 5 × In = 160 A para corte instantâneo. A corrente de 13 A não dispara o disjuntor, tornando mandatório o uso de RCD com Ra × I_Δn ≤ 50 V.',
          keyTakeaway: 'Regime TT: Disjuntor protege fios contra curto; RCD/IDR é OBRIGATÓRIO para proteger vidas de choques.',
          xpReward: 50
        }
      },
      {
        id: 'elec_m3_ec4_spd_sobretensoes',
        moduleId: 'elec_mod_3_protecoes_iec',
        moduleTitle: 'Módulo 3: Proteções Elétricas & Normas IEC (IEC 60364)',
        order: 4,
        code: 'EC 3.4',
        title: 'Descarregadores de Sobretensão (SPD): Classes I, II, III e Coordenação',
        norma: 'IEC 61643-11 / IEC 60364-5-534',
        level: 'Avançado',
        durationMinutes: 14,
        theory: {
          conceito: 'Descarregadores de Sobretensão (SPD / DPS) protegem equipamentos elétricos contra sobretensões transitórias causadas por raios (descargas atmosféricas diretas ou induzidas) e chaveamentos de manobra da rede de Média Tensão da EDM.',
          formulas: [
            { label: 'Classe I / Tipo 1 (Raio Direto)', formula: 'Onda 10/350 μs (I_imp)', explicacao: 'Testado com pulso de altíssima energia simulando impacto direto do raio' },
            { label: 'Classe II / Tipo 2 (Indução)', formula: 'Onda 8/20 μs (I_n / I_max)', explicacao: 'Proteção geral de quadros contra descargas atmosféricas indiretas' },
            { label: 'Nível de Proteção (Up)', formula: 'Up ≤ 1,5 kV', explicacao: 'Tensão residual suportada por equipamentos eletrodomésticos e eletrônicos' },
            { label: 'Regra dos 50 cm', formula: 'L1 + L2 + L3 ≤ 0,5 m', explicacao: 'Comprimento total dos cabos de conexão do SPD para não degradar a proteção' }
          ],
          pontosOperacionais: [
            'Edifícios com para-raios externo (SPDA / Gaiola de Faraday) EXIGEM obrigatoriamente SPD Classe I ou Classe I+II coordenado no QGBT principal.',
            'O comprimento total dos condutores de ligação do SPD (Fase ao SPD + SPD ao barramento PE) não deve exceder 50 cm. Cada metro de condutor adiciona aprox. 1 kV de queda indutiva no pico da onda transitória, anulando a proteção!',
            'Fusível de backup dedicado: se o disjuntor geral for superior ao suportado pelo SPD (ex: > 125A), deve-se instalar fusível NH gG coordenado em série com o SPD.',
            'A indicação visual na janela do cartucho: Verde = Em operação normal; Vermelho = Cartucho danificado por queima de varistor, exigindo substituição imediata.'
          ],
          fieldCase: {
            localizacao: 'Beira, Província de Sofala',
            cenario: 'Data center local com queima repetida de fontes de servidores durante tempestades elétricas, mesmo possuindo DPS instalado no quadro elétrico.',
            diagnostico: 'A perícia técnica constatou dois erros graves: 1) O eletricista ligou o SPD com 1,4 metro de cabo fino com voltas enroladas (indutância elevadíssima); 2) O SPD era apenas Classe II e o edifício possuía torre de rádio com para-raios direto no teto (exigência de Classe I com onda 10/350 μs).',
            solucaoNormativa: 'Instalação de SPD combinado Classe I+II (Iimp = 25 kA por polo) posicionado colado aos barramentos com comprimento total de cabos de 22 cm e fusíveis de proteção de 63A gG dedicados. Zero queimas nas duas estações de chuva seguintes.'
          },
          funcionamento: 'O varistor de óxido metálico (MOV) do SPD opera como resistor não linear: sob tensão nominal de 230V tem resistência de megaohms (circuito aberto). Quando a sobretensão atinge a rede, sua resistência cai para frações de ohm em nanossegundos, desviando a corrente do raio para a terra.',
          aplicacaoMocambique: 'Moçambique tem elevadíssima taxa ceraúnica (mais de 60 a 90 dias de trovoada por ano em Manica, Tete e Zambézia). Proteger instalações sem SPD resulta em perda certa de eletrodomésticos e inversores solares.',
          exemploPratico: 'Quadro residencial 230V: SPD Classe II monopolar de In = 20 kA, Imax = 40 kA, Uc = 275V e Up = 1,3 kV instalado entre Fase-Terra e Neutro-Terra com cabo flexível de 6 mm² de 25 cm.',
          calculationSnippet: 'Classe I: 10/350 μs | Classe II: 8/20 μs | Comprimento dos cabos ≤ 50 cm'
        },
        quiz: {
          question: 'De acordo com a IEC 60364-5-534 e IEC 61643-11, qual é o comprimento máximo recomendado para a soma de todos os condutores de ligação de um Descarregador de Sobretensão (SPD) entre a fase, o dispositivo e o barramento de terra PE?',
          options: [
            { id: 'A', text: 'Não há limite, qualquer comprimento de fio oferece a mesma proteção.', isCorrect: false, feedback: 'Totalmente falso! A indutância do condutor (1 μH/m) gera centenas de volts extras durante a alta taxa di/dt do raio.' },
            { id: 'B', text: 'Máximo de 0,5 metros (50 cm), para evitar que a queda de tensão indutiva (L · di/dt) degrade o nível de proteção efetivo do SPD.', isCorrect: true, feedback: 'Perfeito! A regra de ouro dos 50 cm da IEC garante que a tensão residual suportada pelo equipamento não seja extrapolada pela indutância dos cabos.' },
            { id: 'C', text: 'Mínimo de 3 metros para amortecer a onda de choque do raio.', isCorrect: false, feedback: '3 metros aumentariam a tensão sobre os equipamentos em mais de 3000 V, causando destruição!' },
            { id: 'D', text: 'Exatamente 1,5 metros para coincidir com a velocidade da luz.', isCorrect: false, feedback: 'Afirmação sem sentido físico ou normativo.' }
          ],
          explanation: 'Durante uma descarga atmosférica, a corrente sobe milhares de amperes por microssegundo (di/dt extremo). A indutância típica de 1 metro de cabo é de aprox. 1 μH, gerando uma sobretensão adicional de ΔV = L · (di/dt) ≈ 1000 V por metro. Portanto, a IEC 60364-5-534 estipula a "regra dos 50 cm" (comprimento total de conexão ≤ 0,5 m) para que a tensão real nos equipamentos não exceda o limite seguro Up.',
          keyTakeaway: 'Regra dos 50 cm: Cabos de conexão do SPD devem ter comprimento total ≤ 0,5 m.',
          xpReward: 50
        }
      }
    ]
  }
];
