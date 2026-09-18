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
      },
      {
        id: 'elec_m1_ec4_triangulo_potencias_rendimento',
        moduleId: 'elec_mod_1_fisica',
        moduleTitle: 'Módulo 1: Princípios da Física Elétrica & Leis Fundamentais',
        order: 4,
        code: 'EC 1.4',
        title: 'Triângulo de Potências, Eficiência Energética e Rendimento (η)',
        norma: 'IEC 60034-2-1 / IEC 60038',
        level: 'Básico',
        durationMinutes: 13,
        theory: {
          conceito: 'Nenhum motor ou transformador entrega 100% da potência elétrica que absorve da rede. A eficiência ou rendimento (η) é a razão entre a potência mecânica útil entregue no eixo (P_mec em Watts ou CV) e a potência elétrica ativa consumida (P_elec em Watts). A diferença é dissipada em calor nos enrolamentos (perdas Joule), perdas magnéticas no ferro (histerese e correntes de Foucault) e atrito.',
          formulas: [
            { label: 'Rendimento Eletromecânico', formula: 'η = P_util / P_absorvida', explicacao: 'Rendimento decimal (ex: 0,85 = 85% de eficiência)' },
            { label: 'Conversão CV para Watts', formula: '1 CV = 735,5 W (1 HP = 746 W)', explicacao: 'Potência indicada na placa de motores comerciais em Moçambique' },
            { label: 'Potência Elétrica Absorvida', formula: 'P_elec = (P_cv × 735,5) / η', explicacao: 'Potência real faturada e dimensionada para a proteção' }
          ],
          pontosOperacionais: [
            'A potência gravada na placa de identificação do motor (ex: 5,5 kW ou 7,5 CV) é a potência MECÂNICA na ponta do eixo, NUNCA a elétrica.',
            'Para dimensionar disjuntores, cabos e contatores, deve-se sempre calcular a potência elétrica total absorvida da rede dividindo pelo rendimento e fator de potência.',
            'Motores com classe de rendimento IE3 (Premium) operam significativamente mais frios do que motores antigos IE1, aumentando a vida útil dos rolamentos e enrolamentos.',
            'Verifique sempre se a ventoinha traseira do motor não está obstruída por poeira ou cavacos de madeira em oficinas.'
          ],
          fieldCase: {
            localizacao: 'Matola Rio, Província de Maputo',
            cenario: 'Moagem de farinha com motor de 10 CV trifásico 400V onde os cabos de alimentação de 2,5 mm² derretiam a isolação após 3 horas contínuas de operação.',
            diagnostico: 'O instalador calculou a corrente considerando apenas 10 CV = 7355 W sem levar em conta o rendimento de 82% (η = 0,82) e o fator de potência cos φ = 0,78 da máquina em carga. A corrente real de operação era de 18,2 A, superando o limite seguro do condutor.',
            solucaoNormativa: 'Substituição da fiação por cabos de 4 mm² em cobre e ajuste do relé de proteção bimetálico para 18,5 A com disjuntor-motor coordenado.'
          },
          funcionamento: 'Ao projetar instalações industriais e prediais, calcular a demanda exata exige conhecer a placa da máquina. Em Moçambique, onde as oscilações de tensão são frequentes, motores com baixo rendimento trabalham sobrecarregados e aquecem perigosamente.',
          aplicacaoMocambique: 'Moinhos de milho, bombas de irrigação em Gaza e oficinas de serralharia operam diariamente com motores pesados. Compreender o rendimento evita queimar equipamentos e garante orçamentos elétricos corretos.',
          exemploPratico: 'Motor de 5 CV (3677 W útil) com rendimento η = 0,85 e cos φ = 0,80 em 400V trifásico: Potência absorvida P = 3677 / 0,85 = 4325 W. Corrente I = 4325 / (1,732 × 400 × 0,80) = 7,8 A por fase.',
          calculationSnippet: 'P_absorvida = P_util / η | 1 CV = 735,5 W'
        },
        quiz: {
          question: 'Um motor trifásico de 400 V 50 Hz aciona um compressor de ar com potência mecânica de 7,35 kW no eixo (aprox. 10 CV). A placa indica rendimento η = 0,85 e cos φ = 0,82. Qual é a potência elétrica ativa (P_elec) absorvida da rede pela máquina?',
          options: [
            { id: 'A', text: '6,24 kW', isCorrect: false, feedback: 'O motor não pode absorver menos energia do que entrega no eixo; isso violaria o princípio de conservação de energia.' },
            { id: 'B', text: '7,35 kW', isCorrect: false, feedback: '7,35 kW é a potência mecânica pura entregue no eixo, desconsiderando as perdas de calor e atrito.' },
            { id: 'C', text: '8,65 kW', isCorrect: true, feedback: 'Perfeito! P_elec = P_mec / η = 7,35 kW / 0,85 = 8,647 kW (aprox. 8,65 kW absorvidos da rede).' },
            { id: 'D', text: '12,50 kW', isCorrect: false, feedback: 'Valor muito elevado, incompatível com o rendimento de 85%.' }
          ],
          explanation: 'O rendimento de uma máquina é dado por η = P_util / P_absorvida. Portanto, a potência elétrica ativa que o motor drena da rede da EDM é: P_absorvida = P_util / η = 7350 W / 0,85 = 8647 W ≈ 8,65 kW.',
          keyTakeaway: 'Potência absorvida da rede = Potência no eixo / Rendimento (η). Sempre maior que a potência nominal útil.',
          xpReward: 50
        }
      },
      {
        id: 'elec_m1_ec5_balanceamento_trifasico_campo',
        moduleId: 'elec_mod_1_fisica',
        moduleTitle: 'Módulo 1: Princípios da Física Elétrica & Leis Fundamentais',
        order: 5,
        code: 'EC 1.5',
        title: 'Balanceamento de Fases na Prática e Eliminação de Desequilíbrios',
        norma: 'IEC 60364-5-52 / IEC 60038',
        level: 'Básico',
        durationMinutes: 14,
        theory: {
          conceito: 'O balanceamento de fases consiste em distribuir as cargas monofásicas (iluminação, tomadas, pequenos motores e ares condicionados) de forma tão homogênea quanto possível entre as três fases L1, L2 e L3. Uma instalação equilibrada minimiza a corrente que retorna pelo condutor de neutro, reduz perdas Joule em até 30% e impede que o disjuntor principal dispare por sobrecorrente em apenas uma das fases.',
          formulas: [
            { label: 'Taxa de Desequilíbrio de Corrente', formula: 'Deseq (%) = [(I_max - I_med) / I_med] × 100', explicacao: 'Norma IEC recomenda manter o desequilíbrio abaixo de 10%' },
            { label: 'Corrente Média das Fases', formula: 'I_med = (I_L1 + I_L2 + I_L3) / 3', explicacao: 'Base de referência para o cálculo do equilíbrio de correntes' },
            { label: 'Potência por Fase Alvo', formula: 'P_fase = P_total_monofasica / 3', explicacao: 'Meta de potência conectada para cada uma das 3 fases do quadro' }
          ],
          pontosOperacionais: [
            'Medir as correntes das três fases no horário de pico (ex: entre 18h e 20h para residências, ou 10h e 14h para comércio) com alicate amperímetro True-RMS.',
            'Se a Fase L1 registrar 55 A e a Fase L3 registrar 18 A, o disjuntor geral de 63 A desarmará prematuramente, mesmo que a carga média total seja de apenas 36 A.',
            'A redistribuição deve ser feita fisicamente nos disjuntores do quadro parcial, alternando a conexão dos pentes ou fios de entrada dos disjuntores monofásicos.',
            'Nunca compense desequilíbrio aumentando a capacidade do disjuntor geral além do limite nominal do cabo de entrada da EDM.'
          ],
          fieldCase: {
            localizacao: 'Bairro Central, Maputo',
            cenario: 'Restaurante comercial com entrada trifásica 63A cujo disjuntor geral caía todos os dias ao meio-dia durante o preparo do almoço.',
            diagnostico: 'Com alicate amperímetro, o técnico mediu: Fase L1 = 61 A, Fase L2 = 22 A e Fase L3 = 19 A. Três fritadeiras elétricas e dois freezers estavam todos ligados em tomadas conectadas à mesma Fase L1.',
            solucaoNormativa: 'Remanejamento de circuitos no quadro: duas fritadeiras foram transferidas para L2 e os freezers para L3. Correntes resultantes: L1 = 34 A, L2 = 33 A, L3 = 35 A. Corrente de neutro caiu de 44 A para apenas 3 A. Desarmes totalmente solucionados.'
          },
          funcionamento: 'Quando as três fases carregam correntes de mesmo módulo defasadas de 120°, a soma fasorial no ponto comum de neutro cancela-se matematicamente. Menos corrente no neutro significa menos calor nos eletrodutos e menor queda de tensão em todas as tomadas.',
          aplicacaoMocambique: 'Em Moçambique, onde muitos quadros antigos não possuem projeto unifilar atualizado, é rotina eletricistas ligarem novas cargas na primeira fase que encontram com borne vago. O balanceamento é o serviço mais rápido e valorizado para solucionar desarmes misteriosos.',
          exemploPratico: 'Quadro comercial: Total de 15 ares condicionados split de 12000 BTU (6A cada). Divisão correta: exatamente 5 aparelhos na Fase L1 (30A), 5 na Fase L2 (30A) e 5 na Fase L3 (30A). Equilíbrio perfeito com corrente de neutro nula.',
          calculationSnippet: 'Deseq < 10% | P_fase = P_total / 3 | I_neutro ≈ 0 A em equilíbrio'
        },
        quiz: {
          question: 'Um técnico mede as correntes de entrada de um quadro de distribuição trifásico em horário de trabalho: Fase L1 = 48 A, Fase L2 = 14 A e Fase L3 = 16 A. O disjuntor geral é de 50 A e desarma com frequência. Qual é o diagnóstico correto e a ação normativa indicada?',
          options: [
            { id: 'A', text: 'Substituir imediatamente o disjuntor de 50 A por um de 100 A para evitar desarmes.', isCorrect: false, feedback: 'Totalmente incorreto e perigoso! Trocar o disjuntor sem trocar os cabos pode queimar a tubulação por sobrecarga contínua.' },
            { id: 'B', text: 'A instalação está com grave desbalanceamento de fases; deve-se remanejar circuitos monofásicos de L1 para L2 e L3, equalizando as correntes em torno de 26 A por fase.', isCorrect: true, feedback: 'Exato! A corrente total é 48 + 14 + 16 = 78 A. Distribuída igualmente dá 26 A por fase, operando com folga de quase 50% no disjuntor de 50 A!' },
            { id: 'C', text: 'O desarmamento ocorre por fuga de terra no condutor de neutro.', isCorrect: false, feedback: 'Disjuntor termomagnético comum desarma por sobrecorrente na Fase L1 (48 A muito próximo de 50 A térmico).' },
            { id: 'D', text: 'Instalar um motor trifásico na fase L2 para puxar corrente.', isCorrect: false, feedback: 'Não se adiciona carga desnecessária para corrigir desbalanceamento.' }
          ],
          explanation: 'A soma das correntes é 48 + 14 + 16 = 78 A. A corrente média ideal por fase seria 78 / 3 = 26 A. A Fase L1 está operando em 48 A (96% da capacidade do disjuntor de 50 A), desarmando por sobrecarga térmica. Remanejando circuitos de L1 para L2 e L3, todas as fases operam frias em ~26 A.',
          keyTakeaway: 'Balanceamento de fases divide o consumo igualmente, evita desarmes falsos e reduz drasticamente a corrente no neutro.',
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
      },
      {
        id: 'elec_m2_ec3_eletrodutos_enfiacao_normas',
        moduleId: 'elec_mod_2_predial',
        moduleTitle: 'Módulo 2: Instalações Elétricas Prediais & Práticas Básicas',
        order: 3,
        code: 'EC 2.3',
        title: 'Taxa de Ocupação de Eletrodutos, Curvas e Enfiação sem Atrito',
        norma: 'IEC 60364-5-52 / IEC 61386',
        level: 'Básico',
        durationMinutes: 13,
        theory: {
          conceito: 'A passagem de condutores em tubulações exige respeitar as taxas máximas de ocupação da área interna do eletroduto segundo a IEC 60364-5-52: máximo de 53% para 1 condutor, 31% para 2 condutores e 40% para 3 ou mais condutores. Deixar 60% de espaço livre garante a dissipação do calor gerado pelo efeito Joule e permite passar ou substituir condutores no futuro sem romper o isolamento.',
          formulas: [
            { label: 'Taxa para 3 ou mais Condutores', formula: 'Σ S_externa_cabos ≤ 0,40 × S_interna_tubo', explicacao: 'Máximo 40% de preenchimento para 3 ou mais cabos' },
            { label: 'Área da Seção Circular', formula: 'S = (π × D²) / 4', explicacao: 'Área com base no diâmetro externo do cabo ou interno do tubo' },
            { label: 'Limite de Curvas por Trecho', formula: 'Máx. 3 curvas de 90° (270° total)', explicacao: 'Distância máxima de 15m em linha reta ou 12m com curvas entre caixas' }
          ],
          pontosOperacionais: [
            'Nunca ultrapasse 40% de ocupação; forçar cabos em tubos apertados rasga a isolação de PVC e gera curtos invisíveis dentro da alvenaria.',
            'O número máximo de curvas entre duas caixas de passagem consecutivas é 3 curvas de 90° (ou equivalente a 270° de deflexão total). Se houver mais, instale uma caixa de derivação intermediária.',
            'Use lubrificante neutro à base de água ou vaselina industrial; produtos como sabão em pó ou detergente contêm soda e agentes corrosivos que ressecam o PVC após alguns anos.',
            'Em tubulações enterradas ou expostas a UV, utilize eletrodutos rígidos de PEAD ou PVC antichama certificado com grau de proteção mecânica IK08.'
          ],
          fieldCase: {
            localizacao: 'Triunfo, Maputo',
            cenario: 'Moradia nova onde o cliente queria passar um circuito adicional de ar condicionado de 4 mm² em um eletroduto corrugado de 20 mm onde já passavam 6 fios de 2,5 mm².',
            diagnostico: 'A área útil já estava ocupada a 52%. Ao puxar o novo cabo com força excessiva, a fiação existente travou, o fio de guia partiu e a isolação de um cabo de fase foi esfolada contra a parede interna corrugada, gerando fuga de corrente.',
            solucaoNormativa: 'Abertura de rasgo para eletroduto independente de 25 mm dedicado exclusivamente aos circuitos de climatização, restabelecendo a ocupação segura em ambos os tubos.'
          },
          funcionamento: 'O ar aprisionado dentro do eletroduto atua como isolante térmico. Quando os cabos operam sob carga, a temperatura interna sobe. Se a taxa de ocupação estiver dentro de 40%, o calor dissipa para a parede; se estiver entupido de fios, os cabos cozinham na própria temperatura e derretem.',
          aplicacaoMocambique: 'Tubos corrugados de baixa qualidade (amarelos leves de espessura fina) amassam com o peso do concreto durante a concretagem de lajes em Moçambique. Use sempre eletrodutos reforçados laranjas ou cinzentos nas lajes.',
          exemploPratico: 'Tubo de PVC de diâmetro interno 20 mm: Área interna = 314 mm². 40% útil = 125 mm². Cada cabo flexível de 2,5 mm² tem diâmetro externo aprox. 3,6 mm (área = 10,2 mm²). É seguro passar até 12 condutores de 2,5 mm², mas recomenda-se no máximo 6 a 8 por circuito térmico.',
          calculationSnippet: 'Ocupação máx. 40% para ≥ 3 cabos | Máx. 3 curvas de 90° entre caixas'
        },
        quiz: {
          question: 'De acordo com a IEC 60364-5-52, qual é a taxa máxima recomendada de ocupação da área da seção transversal interna de um eletroduto quando se instalam três ou mais condutores elétricos?',
          options: [
            { id: 'A', text: '100% (o tubo deve ser preenchido até não caber mais nenhum cabo).', isCorrect: false, feedback: 'Totalmente proibido! Causa superaquecimento, perda de isolamento e impossibilidade de manutenção.' },
            { id: 'B', text: '40% da área útil interna do eletroduto.', isCorrect: true, feedback: 'Correto! A norma fixa 40% para 3 ou mais cabos, reservando 60% de espaço livre para ventilação térmica e facilidade de enfiação.' },
            { id: 'C', text: '80% desde que se use detergente para lubrificar.', isCorrect: false, feedback: '80% gera aprisionamento térmico e detergente ataca quimicamente o PVC.' },
            { id: 'D', text: '15% apenas.', isCorrect: false, feedback: '15% seria superdimensionamento desnecessário na construção civil.' }
          ],
          explanation: 'A IEC 60364-5-52 define que, para 3 ou mais condutores no mesmo conduto, a soma das áreas externas dos cabos não pode exceder 40% da área interna do tubo. Isso garante espaço de ar para convecção térmica e tração livre durante a passagem da fiação.',
          keyTakeaway: 'Regra dos 40%: Mantenha pelo menos 60% de espaço livre no eletroduto para cabos operarem frios.',
          xpReward: 50
        }
      },
      {
        id: 'elec_m2_ec4_zonas_humidas_termoacumuladores',
        moduleId: 'elec_mod_2_predial',
        moduleTitle: 'Módulo 2: Instalações Elétricas Prediais & Práticas Básicas',
        order: 4,
        code: 'EC 2.4',
        title: 'Instalações em Zonas Húmidas (Casas de Banho) e Termoacumuladores',
        norma: 'IEC 60364-7-701 / EN 60529',
        level: 'Intermediário',
        durationMinutes: 15,
        theory: {
          conceito: 'Casas de banho e zonas húmidas são os locais de maior risco de choque fatal em uma residência, pois a pele molhada perde sua resistência elétrica natural (cai de 100.000 Ω para menos de 1.000 Ω). A norma IEC 60364-7-701 divide o ambiente em 4 volumes rigorosos: Volume 0 (interior da banheira/poliban), Volume 1 (até 2,25m de altura sobre a banheira), Volume 2 (faixa de 0,60m em torno do Volume 1) e Volume 3 (restante do espaço).',
          formulas: [
            { label: 'Resistência do Corpo Molhado', formula: 'R_corpo_molhado ≈ 800 a 1000 Ω', explicacao: 'Uma tensão de apenas 25V gera corrente letal de 25mA a 30mA' },
            { label: 'Tensão Limite de Segurança', formula: 'U_L = 25 V AC (ambientes húmidos)', explicacao: 'Tensão máxima de toque sem perigo de morte segundo IEC 60364-4-41' },
            { label: 'Proteção Diferencial Obrigatória', formula: 'I_Δn ≤ 30 mA (IDR / RCBO)', explicacao: 'Obrigatório em TODOS os circuitos que servem a casa de banho' }
          ],
          pontosOperacionais: [
            'Proibido instalar interruptores ou tomadas nos Volumes 0 e 1. No Volume 2 só são permitidas tomadas alimentadas por transformador de isolamento de baixa potência para barbeadores (SELV).',
            'Termoacumuladores (caldeiras de água) instalados no Volume 1 devem possuir grau de proteção mínimo IPX4 (à prova de salpicos) e fiação direta sem tomada comum no box.',
            'Obrigatória a Ligação Equipotencial Suplementar (LES): conectar tubulações metálicas de água fria, água quente e estrutura da banheira ao condutor de terra PE com fio verde-amarelo de no mínimo 4 mm².',
            'O disjuntor diferencial que protege o termoacumulador deve ser do Tipo A ou AC de 30 mA com teste mensal obrigatório.'
          ],
          fieldCase: {
            localizacao: 'Sommerschield, Maputo',
            cenario: 'Condomínio onde o chuveiro elétrico dava pequenos choques nas mãos ao fechar o registro metálico da água.',
            diagnostico: 'A resistência do chuveiro estava com fuga microscópica para a água e o registro metálico não possuía ligação equipotencial com o barramento de terra do quadro, mantendo 45V de diferença de potencial em relação ao ralo molhado.',
            solucaoNormativa: 'Instalação de cabo de equipotencialização de 4 mm² conectando os tubos metálicos ao terra PE e substituição do disjuntor termomagnético simples por um RCBO de 30 mA.'
          },
          funcionamento: 'A equipotencialização garante que todos os metais acessíveis fiquem rigorosamente no mesmo potencial elétrico da terra (0V). Mesmo que surja uma fuga, a diferença de potencial (ddp) entre o registro e o piso é zero, eliminando o choque elétrico.',
          aplicacaoMocambique: 'Em Moçambique é comum encontrar chuveiros elétricos instantâneos tipo "fame" ligados com emendas com fita isolante comum dentro do box do banheiro. Essas emendas em ambientes de vapor d\'água oxidam e pegam fogo.',
          exemploPratico: 'Termoacumulador de 80 litros 2000W: Instalação no Volume 2 com cabo flexível 3x2,5 mm² entrando diretamente na caixa de bornes IPX5 do aparelho através de bucim estanque, protegido no quadro por disjuntor bipolar 16A + IDR 30mA.',
          calculationSnippet: 'Volume 0 e 1: sem tomadas | IPX4 mínimo | IDR 30mA inegociável'
        },
        quiz: {
          question: 'De acordo com a norma internacional IEC 60364-7-701 para instalações em locais contendo banheira ou duche, qual afirmação sobre a instalação de tomadas de corrente é correta?',
          options: [
            { id: 'A', text: 'Podem ser instaladas dentro do Volume 1 desde que a tomada tenha tampa plástica comum.', isCorrect: false, feedback: 'Totalmente proibido! No Volume 1 não se pode colocar nenhuma tomada comum sob risco fatal de choque.' },
            { id: 'B', text: 'Tomadas de uso geral só são permitidas fora dos Volumes 0, 1 e 2 (a mais de 0,60 m do limite da banheira/duche), protegidas obrigatoriamente por RCD de 30 mA.', isCorrect: true, feedback: 'Perfeito! As tomadas gerais de 230V são restritas à área fora do alcance imediato do duche (Volume 3 / fora das zonas de risco) e protegidas por IDR 30mA.' },
            { id: 'C', text: 'Não há restrições de distância se a residência tiver haste de aterramento no quintal.', isCorrect: false, feedback: 'A água reduz drasticamente a resistência do corpo humano e requer distanciamento físico normatizado.' },
            { id: 'D', text: 'Pode-se instalar tomada comum no teto do Volume 0.', isCorrect: false, feedback: 'Volume 0 é o interior da banheira/poliban, proibido para qualquer tomada.' }
          ],
          explanation: 'A IEC 60364-7-701 proíbe a instalação de tomadas nos Volumes 0, 1 e 2 (salvo tomadas com transformador de isolamento SELV para barbeadores no Volume 2). Tomadas convencionais só são permitidas a partir do Volume 3 (a mais de 0,60 m da borda da zona húmida), obrigatoriamente com proteção diferencial residual de 30 mA.',
          keyTakeaway: 'Casas de banho: tomadas a pelo menos 60 cm do duche e SEMPRE com proteção por IDR 30 mA.',
          xpReward: 50
        }
      },
      {
        id: 'elec_m2_ec5_interfonia_campainhas_fechaduras',
        moduleId: 'elec_mod_2_predial',
        moduleTitle: 'Módulo 2: Instalações Elétricas Prediais & Práticas Básicas',
        order: 5,
        code: 'EC 2.5',
        title: 'Sistemas de Baixa Tensão: Campainhas, Interfonia e Fechaduras 12V',
        norma: 'IEC 60364-4-41 (SELV) / EN 50130',
        level: 'Básico',
        durationMinutes: 13,
        theory: {
          conceito: 'Os sistemas de comunicação, chamada e controle de acesso predial operam em Tensão Extrabaixa de Segurança (SELV - Safety Extra-Low Voltage), tipicamente 12V ou 24V AC/DC. Essa segregação protege os usuários de choques elétricos no portão externo e impede que oscilações da rede de 230V queimem módulos eletrônicos sensíveis.',
          formulas: [
            { label: 'Circuito SELV (Segurança)', formula: 'V_nominal ≤ 50 V AC ou 120 V DC', explicacao: 'Sem risco de choque elétrico perigoso ao toque humano direto' },
            { label: 'Corrente de Pulso de Fechadura', formula: 'I_pulso = P / V ≈ 12W / 12V = 1,0 A', explicacao: 'Pico de corrente momentâneo durante o disparo da bobina solenoide' },
            { label: 'Queda de Tensão em Fios Finos', formula: 'ΔV = 2 × L × (ρ / S) × I', explicacao: 'Fios telefônicos finos causam perda de força no destravamento magnético' }
          ],
          pontosOperacionais: [
            'Proibido passar cabos de sinal de interfone/fechadura de 12V no mesmo eletroduto de cabos de força de 230V; a indução eletromagnética gera zumbidos fortes no áudio e disparos fantasmas.',
            'Para fechaduras elétricas instaladas a mais de 25 metros da fonte/interfone, use cabo com bitola mínima de 1,0 mm² ou 1,5 mm² para evitar queda de tensão no pulso de abertura.',
            'Sempre instale um diodo de proteção flyback (ex: 1N4007) em paralelo reverso com bobinas de fechaduras 12V DC para absorver o pico de força contra-eletromotriz na desenergização.',
            'O transformador de campainha deve ser do tipo isolador de segurança com isolamento galvânico duplo segundo a IEC 61558-2-8.'
          ],
          fieldCase: {
            localizacao: 'Costa do Sol, Maputo',
            cenario: 'Moradia onde a fechadura elétrica do portão de ferro só abria de vez em quando; no interfone interno ouvia-se um zumbido contínuo no fone.',
            diagnostico: '1) O técnico anterior passou o cabo UTP do interfone na mesma tubulação corrugada do cabo de 230V do motor de portão (indução eletromagnética severa); 2) A distância de 40 metros com fio fino de 0,5 mm² derrubava os 12V para 8,2V no momento do pulso da bobina.',
            solucaoNormativa: 'Tubulação exclusiva para o interfone e substituição do condutor de alimentação da fechadura por cabo flexível de 1,5 mm². Tensão de pulso restaurada para 11,8V e funcionamento 100% confiável.'
          },
          funcionamento: 'A bobina solenoide da fechadura requer um campo magnético instantâneo para recolher o trinco de aço. Se a bitola do condutor for muito fina, a resistência do fio limita a corrente e a fechadura não tem força para destravar.',
          aplicacaoMocambique: 'A maresia e poeira em cidades costeiras como Maputo, Beira e Pemba oxidam rapidamente conexões em botoeiras externas de campainha e interfone. O uso de terminais estanques com fita de autofusão é mandatário.',
          exemploPratico: 'Esquema de ligação interfone com vídeo: [Fonte 12V DC] -> [Monitor interno] -> [Cabo 4 vias blindado em duto dedicado] -> [Painel de rua IP65] -> [Pulso de 12V com cabo 1,5 mm²] -> [Fechadura elétrica].',
          calculationSnippet: 'SELV ≤ 50V AC | Dutos separados de 230V | Cabo mín. 1,0 mm² para distâncias > 20m'
        },
        quiz: {
          question: 'Ao instalar um sistema de interfonia e fechadura elétrica de 12V em um condomínio residencial, qual é a prática normativa correta segundo a IEC 60364 para garantir áudio límpido e abertura sem falhas?',
          options: [
            { id: 'A', text: 'Passar os cabos de áudio de 12V no mesmo eletroduto da alimentação do ar-condicionado de 230V para economizar tubulação.', isCorrect: false, feedback: 'Grave erro! A indução eletromagnética causa zumbido de 50Hz ensurdecedor no áudio e queima componentes.' },
            { id: 'B', text: 'Segregar os cabos de sinal e extrabaixa tensão (12V) em eletroduto independente dos cabos de 230V e utilizar condutores de seção adequada para evitar queda de tensão no pulso.', isCorrect: true, feedback: 'Correto! A segregação física de condutos é norma mandatória (IEC 60364-5-52) para evitar interferências e garantir a força da bobina.' },
            { id: 'C', text: 'Ligar a fechadura de 12V diretamente na tomada de 230V da sala.', isCorrect: false, feedback: 'Explodiria a bobina e colocaria em risco fatal qualquer pessoa no portão.' },
            { id: 'D', text: 'Utilizar cabo de fibra óptica para alimentar eletricamente a bobina solenoide.', isCorrect: false, feedback: 'Fibra óptica transmite apenas dados ópticos (luz) e não conduz corrente elétrica para solenoides.' }
          ],
          explanation: 'Circuitos de extrabaixa tensão (SELV) e telecomunicação não podem compartilhar o mesmo duto com cabos de baixa tensão (230V/400V) a menos que todos os condutores sejam isolados para a tensão mais alta e blindados contra indução eletromagnética (IEC 60364-5-52). Para fechaduras a distância, a bitola mínima evita queda de tensão no disparo.',
          keyTakeaway: 'Segregação de condutos: Cabos de sinal e 12V sempre em tubulação separada de circuitos de potência 230V.',
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
      },
      {
        id: 'elec_m3_ec5_seletividade_amperimetrica_cronometrica',
        moduleId: 'elec_mod_3_protecoes_iec',
        moduleTitle: 'Módulo 3: Proteções Elétricas & Normas IEC (IEC 60364)',
        order: 5,
        code: 'EC 3.5',
        title: 'Seletividade Amperimétrica, Cronométrica e Energia Específica (I²t)',
        norma: 'IEC 60947-2 / IEC 60364-5-53',
        level: 'Avançado',
        durationMinutes: 15,
        theory: {
          conceito: 'Seletividade é a capacidade de um sistema de proteção desarmar exclusivamente o dispositivo de proteção imediatamente a montante da falta, mantendo todos os outros circuitos do edifício energizados e operacionais. A seletividade total evita que um curto-circuito em uma tomada de escritório derrube o disjuntor geral do prédio inteiro, paralisando serviços essenciais.',
          formulas: [
            { label: 'Condição de Seletividade Amperimétrica', formula: 'I_n_montante ≥ 1,6 a 2,0 × I_n_jusante', explicacao: 'Relação mínima de corrente nominal entre disjuntores em série' },
            { label: 'Seletividade Energética (Curto-Circuito)', formula: 'I²t_prearco_montante > I²t_corte_jusante', explicacao: 'A energia de abertura do disjuntor a jusante deve ser menor que a de disparo do montante' },
            { label: 'Tempo de Retardo Cronométrico', formula: 'Δt_seletividade ≥ 100 a 150 ms', explicacao: 'Diferencial de temporização entre curvas de relés eletrônicos' }
          ],
          pontosOperacionais: [
            'Seletividade total entre dois disjuntores modulares (MCBs) nem sempre é alcançada apenas pelo calibre nominal; em curtos-circuitos francos com corrente elevada, ambos podem disparar simultaneamente pela ação magnética instantânea.',
            'Para garantir seletividade total na entrada geral, utiliza-se Disjuntor em Caixa Moldada (MCCB) eletrônico com ajuste de retardo de curta duração (parâmetro Isd e tsd).',
            'Fusíveis do tipo NH gG oferecem excelente seletividade natural quando a relação entre fusíveis consecutivos for de pelo menos 1:1,6.',
            'Consulte sempre as tabelas de coordenação e seletividade fornecidas pelos fabricantes certificados (ex: ABB, Schneider, Siemens, Chint).'
          ],
          fieldCase: {
            localizacao: 'Hospital Central da Beira',
            cenario: 'Um curto-circuito em um esterilizador portátil de 2,2 kW na enfermaria fez desarmar o disjuntor geral da subestação de 400A, desligando a iluminação cirúrgica e o ar condicionado do bloco operatório.',
            diagnostico: 'Ausência total de estudo de seletividade: o disjuntor geral da subestação estava ajustado com disparo instantâneo sem temporização (tsd = 0 ms). A corrente de curto de 3500 A sensibilizou a bobina magnética do disjuntor geral antes que o MCB de 16A da enfermaria pudesse extinguir o arco.',
            solucaoNormativa: 'Ajuste do relé eletrônico do MCCB de 400A com retardo cronométrico tsd = 150 ms para correntes de curto moderadas e substituição do MCB da enfermaria por modelo de alta capacidade de limitação de corrente (Classe 3 de limitação I²t).'
          },
          funcionamento: 'Ao limitar a energia passante (I²t) para valores inferiores ao limiar de disparo térmico e magnético do disjuntor a montante, o arco elétrico da falha é extinto em menos de 5 milissegundos pelo dispositivo local.',
          aplicacaoMocambique: 'Em hospitais, agências bancárias e portos de Nacala e Maputo, a seletividade é mandatória para evitar paradas catastróficas em servidores e centros de cirurgia durante falhas de equipamentos secundários.',
          exemploPratico: 'Quadro Geral: MCCB de 160A com retardo magnético tsd = 100 ms. Quadro Parcial: MCB Curva C de 20A. Um curto de 2000 A na tomada faz o MCB abrir em 4 ms com I²t de 18.000 A²s. O MCCB de 160A suporta 45.000 A²s sem abrir, garantindo 100% de seletividade.',
          calculationSnippet: 'I_montante ≥ 1,6 × I_jusante | I²t_jusante < I²t_montante | tsd ≥ 100ms'
        },
        quiz: {
          question: 'Em um projeto de distribuição elétrica predial segundo a norma IEC 60947-2, qual é o objetivo técnico primordial do conceito de "Seletividade Total" entre dispositivos de proteção contra sobrecorrentes?',
          options: [
            { id: 'A', text: 'Garantir que todos os disjuntores da instalação desarmem juntos para multiplicar o poder de corte.', isCorrect: false, feedback: 'Isso é o oposto da seletividade; desarmar tudo gera blecaute em todo o edifício.' },
            { id: 'B', text: 'Assegurar que apenas o dispositivo de proteção imediatamente a montante do defeito atue, isolando a falha sem interromper o fornecimento aos demais circuitos saudáveis.', isCorrect: true, feedback: 'Perfeito! A seletividade total mantém a continuidade de serviço máxima, desconectando unicamente a carga em pane.' },
            { id: 'C', text: 'Impedir a passagem de corrente contínua pelos condutores de neutro.', isCorrect: false, feedback: 'Isso é função de filtros ou RCDs Tipo B, sem relação com seletividade.' },
            { id: 'D', text: 'Permitir a ligação de cabos de alumínio sem terminais bimetálicos.', isCorrect: false, feedback: 'Terminais bimetálicos são uma exigência mecânica contra corrosão galvânica.' }
          ],
          explanation: 'Seletividade Total (Total Selectivity) significa que para qualquer valor de sobrecorrente até a máxima capacidade de curto-circuito presumida no local, apenas o dispositivo mais próximo da falha desliga, garantindo a máxima continuidade de serviço para todo o restante da instalação.',
          keyTakeaway: 'Seletividade Total: Isola apenas o circuito defeituoso, mantendo a energia no restante do prédio.',
          xpReward: 50
        }
      },
      {
        id: 'elec_m3_ec6_coordenacao_motores_iec60947',
        moduleId: 'elec_mod_3_protecoes_iec',
        moduleTitle: 'Módulo 3: Proteções Elétricas & Normas IEC (IEC 60364)',
        order: 6,
        code: 'EC 3.6',
        title: 'Coordenação Tipo 1 e Tipo 2 para Partida de Motores (IEC 60947-4-1)',
        norma: 'IEC 60947-4-1 / IEC 60947-2',
        level: 'Avançado',
        durationMinutes: 14,
        theory: {
          conceito: 'A proteção de motores trifásicos envolve três elementos em série: o seccionador/proteção contra curto-circuito (disjuntor ou fusível), o contator para comando de manobra e o relé de sobrecarga térmica. A norma IEC 60947-4-1 classifica a coordenação dessa partida em Tipo 1 e Tipo 2.',
          formulas: [
            { label: 'Coordenação Tipo 1', formula: 'Permite dano ao contator / relé', explicacao: 'Não causa perigo externo, mas exige troca ou reparo dos componentes após curto' },
            { label: 'Coordenação Tipo 2', formula: 'Sem dano permitido ao contator / relé', explicacao: 'Apenas leve soldadura dos contatos do contator permitida, facilmente descolável' },
            { label: 'Ajuste do Relé Térmico', formula: 'I_ajuste = I_nominal_motor (In)', explicacao: 'Nunca ajustar acima da corrente nominal gravada na placa do motor' }
          ],
          pontosOperacionais: [
            'Coordenação Tipo 1 é aceitável apenas onde a parada do processo produtivo não causa prejuízos severos e há técnicos para trocar peças.',
            'Coordenação Tipo 2 é OBRIGATÓRIA em processos contínuos, hospitais, sistemas de combate a incêndio e mineração, onde o sistema deve voltar a operar em minutos.',
            'Disjuntores-motores termomagnéticos (MPCB) com alta capacidade de limitação de corrente são a solução mais compacta para alcançar Coordenação Tipo 2.',
            'O relé de sobrecarga térmico protege contra sobrecarga prolongada e falta de fase; quem protege contra curto-circuito é o elemento magnético do disjuntor ou o fusível ultrarrápido.'
          ],
          fieldCase: {
            localizacao: 'Complexo Portuário de Maputo',
            cenario: 'Bomba de recalque de combustível parou por curto-circuito na caixa de bornes. A partida utilizava contator e relé térmico com disjuntor comum não coordenado.',
            diagnostico: 'Após o curto, os contatos do contator soldaram completamente e o bimetal do relé de sobrecarga derreteu, pois o conjunto tinha apenas Coordenação Tipo 1 precária. A linha ficou parada 6 horas até chegarem peças novas.',
            solucaoNormativa: 'Substituição da montagem por conjunto testado pelo fabricante com Coordenação Tipo 2 (Disjuntor-Motor + Contator dimensionado segundo tabela IEC 60947-4-1). Em testes seguintes, após eliminar a falha, o motor reiniciou em 2 minutos sem troca de componentes.'
          },
          funcionamento: 'Na Coordenação Tipo 2, a energia específica passante (I²t) e o pico de corrente durante o curto-circuito são limitados a valores que os contatos de prata do contator conseguem suportar sem fusão permanente.',
          aplicacaoMocambique: 'A indústria cimenteira de Matola e as usinas de açúcar de Marromeu e Xinavane operam 24 horas por dia. Parar uma linha de moagem ou moenda por destruição de contatores causa prejuízos de milhares de dólares por hora.',
          exemploPratico: 'Motor 11 kW 400V (In = 22A): Conjunto Coordenação Tipo 2 formado por Disjuntor-Motor de 20-25A (Icu = 50 kA) e Contator tripular AC-3 de 25A. Proteção perfeita contra curto-circuito e sobrecarga sem queimar contatos.',
          calculationSnippet: 'Coordenação Tipo 2: Retorno imediato sem troca de peças | IEC 60947-4-1'
        },
        quiz: {
          question: 'Qual é a principal diferença prática entre a Coordenação Tipo 1 e a Coordenação Tipo 2 para um conjunto de partida de motor (disjuntor + contator + relé) de acordo com a IEC 60947-4-1?',
          options: [
            { id: 'A', text: 'A Coordenação Tipo 1 usa motor a gasolina e a Tipo 2 usa motor elétrico.', isCorrect: false, feedback: 'Totalmente incorreto; ambas se aplicam a motores elétricos.' },
            { id: 'B', text: 'Na Coordenação Tipo 2, o contator e o relé não sofrem danos durante um curto-circuito, permitindo o retorno imediato à operação após sanar a falha externa.', isCorrect: true, feedback: 'Correto! A Tipo 2 garante a continuidade do processo industrial sem necessidade de substituir o contator ou relé após o evento de curto.' },
            { id: 'C', text: 'A Coordenação Tipo 1 é mais rápida e segura do que a Tipo 2 em qualquer aplicação industrial.', isCorrect: false, feedback: 'Falso! A Tipo 1 admite destruição de contatores e relés, sendo menos robusta.' },
            { id: 'D', text: 'A Coordenação Tipo 2 dispensa a ligação do cabo de terra de proteção PE.', isCorrect: false, feedback: 'O aterramento de proteção PE é obrigatório em qualquer tipo de instalação.' }
          ],
          explanation: 'Segundo a IEC 60947-4-1: Na Coordenação Tipo 1, o contator ou relé podem ser danificados e exigir troca após o curto. Na Coordenação Tipo 2, nenhum dano ao contator ou relé é admitido (exceto leve soldagem facilmente descolável nos contatos), garantindo máxima disponibilidade industrial.',
          keyTakeaway: 'Coordenação Tipo 2: Máxima disponibilidade industrial com proteção total de contatores contra destruição por curto.',
          xpReward: 50
        }
      }
    ]
  }
];
