import { AcademyModule } from '../types/academy';

// ============================================================================
// MÓDULO 3: CONDUTORES, LINHAS ELÉTRICAS E CANALIZAÇÕES
// Padrão Didático Avançado - Academia TécnicaMZ & Sara IA
// Boas Práticas de Engenharia e Padrões Industriais de Mercado
// ============================================================================

export const MODULE_3_CONDUTORES: AcademyModule = {
  id: 'elec_mod_3_condutores_linhas',
  area: 'eletrotecnica',
  order: 3,
  title: 'Módulo 3: Condutores, Linhas Elétricas e Canalizações',
  description: 'Resistividade e condutividade dos materiais, capacidade de condução de corrente (Iz), cálculo prático de queda de tensão em circuitos monofásicos e trifásicos, fatores de correção térmica, de agrupamento e assentamento, e dimensionamento de esteiras, canaletas e tubagens.',
  icon: 'Layers',
  normasReferencia: [
    'Boas Práticas de Engenharia e Padrões Industriais de Mercado',
    'IEC 60364-5-52',
    'IEC 60228',
    'IEC 61084'
  ],
  lessons: [
    // ------------------------------------------------------------------------
    // ELEMENTO 3.1: Resistividade dos Materiais e Capacidade de Condução (Iz)
    // ------------------------------------------------------------------------
    {
      id: 'elec_m3_ec1_resistividade_capacidade_iz',
      moduleId: 'elec_mod_3_condutores_linhas',
      moduleTitle: 'Módulo 3: Condutores, Linhas Elétricas e Canalizações',
      order: 1,
      code: 'EC 3.1',
      title: 'Resistividade dos Materiais e Capacidade de Condução de Corrente (Iz)',
      norma: 'Boas Práticas de Engenharia e Padrões Industriais de Mercado',
      level: 'Intermediário',
      durationMinutes: 16,
      theory: {
        conceito: 'A condução de corrente elétrica em condutores metálicos é limitada pelo efeito Joule (dissipação de calor P = R·I²) e pela temperatura máxima que a isolação dielétrica suporta em regime contínuo. Os dois metais condutores predominantes na indústria são o Cobre eletrolítico recozido (resistividade ρ = 0,0178 Ω·mm²/m a 20 °C; condutividade 100% IACS) e o Alumínio elétrico grau EC (ρ = 0,0282 Ω·mm²/m a 20 °C; condutividade ~61% IACS). O cobre oferece menor seção para a mesma corrente, alta resistência mecânica à tração e menor dilatação térmica. O alumínio é três vezes mais leve e econômico, porém exige bitolas superiores, conexões com terminais bimetálicos Cu-Al e graxa antioxidante para impedir corrosão galvânica e relaxamento térmico por escoamento a frio (creep). A Capacidade de Condução de Corrente (Iz) representa a máxima corrente contínua que o condutor transporta sem que a alma metálica ultrapasse o limite térmico do isolante: 70 °C para isolação termoplástica de Policloreto de Vinila (PVC) e 90 °C para materiais termofixos reticulados como Polietileno Reticulado (XLPE) e Borracha Etileno-Propileno (EPR). O dimensionamento por capacidade de corrente deve satisfazer a regra fundamental de proteção contra sobrecarga: IB ≤ In ≤ Iz.',
        formulas: [
          {
            label: 'Segunda Lei de Ohm (Resistência do Condutor)',
            formula: 'R = ρ × (L / S)',
            explicacao: 'R em Ω, resistividade ρ em Ω·mm²/m, comprimento L em m e seção S em mm²'
          },
          {
            label: 'Regra de Coordenação de Sobrecarga',
            formula: 'I_B ≤ I_n ≤ I_z',
            explicacao: 'Corrente de projeto (IB) ≤ Corrente nominal do disjuntor (In) ≤ Capacidade do cabo (Iz)'
          },
          {
            label: 'Densidade de Corrente Elétrica',
            formula: 'J = I / S',
            explicacao: 'Densidade superficial de fluxo de corrente expressa em A/mm²'
          },
          {
            label: 'Relação de Equivalência Cobre vs Alumínio',
            formula: 'S_Al ≈ 1,60 × S_Cu',
            explicacao: 'Para idêntica resistência ôhmica por metro, o condutor de alumínio requer seção 60% maior'
          }
        ],
        pontosOperacionais: [
          'Limites térmicos contínuos: PVC suporta 70 °C em regime normal e 160 °C em curto-circuito; XLPE e EPR suportam 90 °C contínuos e 250 °C em curto-circuito.',
          'Emendas e conexões com alumínio: nunca aparafusar diretamente cobre com alumínio; o potencial eletroquímico degrada a junção. Usar conectores bimetálicos com compressão calibrada e pasta decapante inibidora de óxido.',
          'Classes de encordoamento conforme padrões industriais: Classe 1 (fio sólido rígido), Classe 2 (cabo rígido multifilar encordoado), Classe 5 e 6 (cabos flexíveis e extraflexíveis para painéis e calhas vibratórias).',
          'A bitola mínima regulamentar para circuitos terminais fixos é 1,5 mm² para iluminação e 2,5 mm² para tomadas de uso geral em cobre.'
        ],
        fieldCase: {
          localizacao: 'Terminal Frigorífico de Nacala, Província de Nampula',
          cenario: 'Em um alimentador de 80 metros que supria 5 compressores frigoríficos de amônia (corrente contínua de pico de 92 A), cabos de PVC de 25 mm² instalados em leito perfurado apresentavam amolecimento da capa, deformação plástica e cheiro de plástico queimado após 3 horas de marcha ininterrupta.',
          diagnostico: 'O condutor com isolamento em PVC de 25 mm² possui Iz tabelado de 89 A em bandeja perfurada (método E). Sob corrente de 92 A contínuos, a temperatura no cobre atingiu 84 °C, superando em 14 °C o limite térmico contínuo do PVC (70 °C), degradando a rigidez dielétrica e acelerando o envelhecimento prematuro.',
          solucaoNormativa: 'Substituição do circuito por cabos de cobre com isolamento de XLPE de 25 mm² (capacidade Iz = 114 A a 90 °C). A temperatura de regime estabilizou em 64 °C, proporcionando folga operacional de 44% e absoluta conformidade com as Boas Práticas de Engenharia e Padrões Industriais de Mercado.'
        },
        funcionamento: 'Quando a corrente circula pelo condutor, a potência dissipada por atrito eletrônico converte-se em fluxo térmico que se dissipa por condução pelo isolante e convecção/radiação para o ar circundante. O equilíbrio térmico estacionário é atingido quando a taxa de geração de calor iguala a taxa de dissipação ao meio ambiente.',
        aplicacaoMocambique: 'Em províncias com elevadas temperaturas sazonais como Tete, Manica e Gaza (onde o ar atinge 42 °C à sombra), o uso de isolamento XLPE/EPR de 90 °C é altamente recomendado para alimentadores industriais para evitar redução drástica da capacidade de corrente por fator de temperatura.',
        exemploPratico: 'Um circuito trifásico opera com corrente de projeto IB = 54 A. Seleciona-se um disjuntor termomagnético de In = 63 A. Pela regra de coordenação (IB ≤ In ≤ Iz), a capacidade de corrente Iz do cabo de cobre escolhido deve ser estritamente superior ou igual a 63 A (por exemplo, cabo de 16 mm² em PVC com Iz = 68 A, ou cabo de 10 mm² em XLPE com Iz = 73 A).',
        calculationSnippet: 'IB ≤ In ≤ Iz | R = ρ × (L / S) | PVC máx 70 °C | XLPE máx 90 °C'
      },
      quiz: {
        question: 'Um alimentador industrial transporta uma corrente de projeto de IB = 48 A contínua. Para a proteção deste circuito, foi escolhido um disjuntor termomagnético de calibre nominal In = 50 A. De acordo com o critério da capacidade de condução de corrente (Iz), qual deve ser a capacidade mínima corrigida do cabo selecionado?',
        options: [
          { id: 'A', text: 'Iz deve ser pelo menos 48 A.', isCorrect: false, feedback: 'Incorreto. Se Iz for 48 A e o disjuntor for de 50 A, o disjuntor não protegerá o cabo contra sobrecargas entre 48 A e 50 A.' },
          { id: 'B', text: 'Iz deve ser maior ou igual a 50 A (Iz ≥ In ≥ IB).', isCorrect: true, feedback: 'Correto! A regra de ouro inegociável de coordenação térmica exige que IB ≤ In ≤ Iz, garantindo que o disjuntor desarme antes que o cabo exceda sua temperatura limite.' },
          { id: 'C', text: 'Iz pode ser 35 A, pois o disjuntor compensa o aquecimento.', isCorrect: false, feedback: 'Totalmente incorreto! Um cabo com Iz = 35 A protegido por disjuntor de 50 A entraria em combustão.' },
          { id: 'D', text: 'Iz deve ser exatamente o dobro de IB, totalizando 96 A.', isCorrect: false, feedback: 'Incorreto. Embora uma margem de segurança seja saudável, a regra normativa requer Iz ≥ In.' }
        ],
        explanation: 'A condição fundamental de proteção térmica contra sobrecargas determina que a corrente nominal do dispositivo de proteção (In) deve ser maior ou igual à corrente de projeto do circuito (IB) para evitar disparos intempestivos, e menor ou igual à capacidade de condução de corrente admissível do condutor (Iz), ou seja, IB ≤ In ≤ Iz.',
        keyTakeaway: 'Coordenação fundamental: IB ≤ In ≤ Iz. O disjuntor protege o cabo, logo seu calibre não pode superar a capacidade Iz do condutor.',
        xpReward: 50
      },
      assessmentQuestions: [
        {
          id: 'elec_m3_ec1_q1_resistencia_segunda_lei',
          type: 'multiple_choice',
          question: 'Um alimentador de força com 120 metros de comprimento é constituído por condutores unipolares de cobre com seção reta de 35 mm². Considerando a resistividade do cobre a 20 °C como ρ = 0,0178 Ω·mm²/m, qual é a resistência ôhmica pura R de um único condutor ao longo deste percurso?',
          scenario: 'Cálculo analítico da resistência ôhmica de condutores para verificação de perdas por condução.',
          norma: 'Boas Práticas de Engenharia e Padrões Industriais de Mercado',
          points: 33,
          explanation: 'Aplicando a Segunda Lei de Ohm: R = ρ × (L / S) = 0,0178 Ω·mm²/m × (120 m / 35 mm²) = 0,0178 × 3,4286 ≈ 0,0610 Ω (61,0 mΩ).',
          keyTakeaway: 'R = ρ · L / S: A resistência varia linearmente com o comprimento e inversamente com a área da seção transversal.',
          options: [
            { id: 'opt_1_1', text: 'R ≈ 0,061 Ω (ou 61,0 mΩ).', isCorrect: true, feedback: 'Correto! R = 0,0178 × (120 / 35) = 0,06103 Ω.' },
            { id: 'opt_1_2', text: 'R ≈ 0,185 Ω.', isCorrect: false, feedback: 'Incorreto. Valor correspondente a erro de cálculo na razão L/S.' },
            { id: 'opt_1_3', text: 'R ≈ 5,19 Ω.', isCorrect: false, feedback: 'Incorreto. A seção foi multiplicada em vez de ser o denominador da equação.' },
            { id: 'opt_1_4', text: 'R ≈ 0,0015 Ω.', isCorrect: false, feedback: 'Incorreto. Houve engano com ordens decimais na unidade de medida.' }
          ]
        },
        {
          id: 'elec_m3_ec1_q2_equivalencia_cobre_aluminio',
          type: 'multiple_choice',
          question: 'Em um projeto de infraestrutura industrial, deseja-se substituir um alimentador existente de cobre com seção transversal de 70 mm² (ρ_Cu = 0,0178 Ω·mm²/m) por condutores de alumínio (ρ_Al = 0,0282 Ω·mm²/m), mantendo exatamente a mesma resistência ôhmica por metro. Qual é a seção teórica comercial padronizada de alumínio imediatamente superior que atende a essa equivalência?',
          scenario: 'Substituição técnica de cabos de cobre por alumínio em barramentos e linhas de distribuição.',
          norma: 'Boas Práticas de Engenharia e Padrões Industriais de Mercado',
          points: 33,
          explanation: 'Para igualdade de resistência R_Cu = R_Al: ρ_Cu / S_Cu = ρ_Al / S_Al ⇒ S_Al = S_Cu × (ρ_Al / ρ_Cu) = 70 × (0,0282 / 0,0178) = 70 × 1,584 ≈ 110,9 mm². A seção comercial padronizada imediatamente superior é 120 mm².',
          keyTakeaway: 'S_Al = S_Cu × (ρ_Al / ρ_Cu): O alumínio requer seção aproximada de 1,6 vezes a do cobre para manter a mesma condutância.',
          options: [
            { id: 'opt_2_1', text: 'Seção de 120 mm² de alumínio.', isCorrect: true, feedback: 'Excelente! A seção exata calculada é 110,9 mm², devendo-se adotar o padrão comercial de 120 mm².' },
            { id: 'opt_2_2', text: 'Seção de 70 mm² de alumínio.', isCorrect: false, feedback: 'Incorreto. Seções iguais resultariam em resistência 58% mais alta no condutor de alumínio.' },
            { id: 'opt_2_3', text: 'Seção de 95 mm² de alumínio.', isCorrect: false, feedback: 'Incorreto. 95 mm² ainda deixaria a resistência 16% superior à do condutor de cobre de 70 mm².' },
            { id: 'opt_2_4', text: 'Seção de 185 mm² de alumínio.', isCorrect: false, feedback: 'Incorreto. Superdimensionamento excessivo sem necessidade técnica ou econômica.' }
          ]
        },
        {
          id: 'elec_m3_ec1_q3_coordenacao_sobrecarga',
          type: 'multiple_choice',
          question: 'Uma linha trifásica alimenta um quadro terminal com corrente de projeto calculada em IB = 74 A. Os cabos instalados possuem capacidade de condução de corrente corrigida Iz = 86 A. Qual dos seguintes calibres nominais padronizados de disjuntor termomagnético satisfaz com precisão a regra de coordenação contra sobrecargas IB ≤ In ≤ Iz?',
          scenario: 'Seleção do calibre de proteção para conformidade estrita com o limite térmico do condutor.',
          norma: 'Boas Práticas de Engenharia e Padrões Industriais de Mercado',
          points: 34,
          explanation: 'A regra fundamental estabelece IB ≤ In ≤ Iz. Com IB = 74 A e Iz = 86 A, o valor de In deve estar no intervalo [74 A, 86 A]. O calibre comercial normalizado que se enquadra nessa faixa é In = 80 A.',
          keyTakeaway: 'IB ≤ In ≤ Iz: Com IB = 74 A e Iz = 86 A, a única proteção padronizada que atende à dupla desigualdade é In = 80 A.',
          options: [
            { id: 'opt_3_1', text: 'Disjuntor de In = 80 A.', isCorrect: true, feedback: 'Correto! 74 A ≤ 80 A ≤ 86 A, satisfazendo plenamente a condição de proteção contra sobrecarga.' },
            { id: 'opt_3_2', text: 'Disjuntor de In = 63 A.', isCorrect: false, feedback: 'Incorreto. 63 A é menor que IB (74 A), disparando em falso em operação contínua normal.' },
            { id: 'opt_3_3', text: 'Disjuntor de In = 100 A.', isCorrect: false, feedback: 'Incorreto. 100 A excede Iz (86 A), deixando o cabo desprotegido contra sobreaquecimento perigoso.' },
            { id: 'opt_3_4', text: 'Disjuntor de In = 125 A.', isCorrect: false, feedback: 'Incorreto. Colocaria a instalação em risco iminente de colapso térmico e incêndio.' }
          ]
        }
      ]
    },

    // ------------------------------------------------------------------------
    // ELEMENTO 3.2: Cálculo Prático de Queda de Tensão (Monofásica e Trifásica)
    // ------------------------------------------------------------------------
    {
      id: 'elec_m3_ec2_calculo_queda_tensao',
      moduleId: 'elec_mod_3_condutores_linhas',
      moduleTitle: 'Módulo 3: Condutores, Linhas Elétricas e Canalizações',
      order: 2,
      code: 'EC 3.2',
      title: 'Cálculo Prático de Queda de Tensão (Monofásica e Trifásica)',
      norma: 'Boas Práticas de Engenharia e Padrões Industriais de Mercado',
      level: 'Avançado',
      durationMinutes: 18,
      theory: {
        conceito: 'A queda de tensão (ΔV) é a perda de potencial elétrico que ocorre ao longo dos condutores devido à sua impedância interna (resistência ôhmica R e reatância indutiva X) quando percorridos pela corrente de carga. Quedas excessivas reduzem o torque dos motores (o conjugado de partida decresce com o quadrado da tensão: C ∝ V²), provocam aquecimento adicional em cargas de torque constante, causam cintilação luminosa (flicker) e reinicializam equipamentos eletrônicos sensíveis. As Boas Práticas de Engenharia e Padrões Industriais de Mercado fixam limites máximos de queda de tensão admissível: tipicamente 3% para circuitos de iluminação e 5% para circuitos de força e tomadas a partir da origem da instalação privada (ou até 7% a 8% quando a instalação dispõe de transformador próprio de média para baixa tensão). Em circuitos de corrente alternada com condutores de seção até 16 mm², a resistência R é amplamente dominante sobre a reatância X; para seções de 25 mm² ou superiores, a reatância indutiva dos cabos agrupados deve ser obrigatoriamente considerada na equação vetorial com o fator de potência cos(φ) da carga.',
        formulas: [
          {
            label: 'Queda de Tensão Monofásica (V)',
            formula: 'ΔV_mono = 2 × I × L × (R_km × cos φ + X_km × sen φ) / 1000',
            explicacao: 'Fator 2 contabiliza o percurso de ida pela Fase e volta pelo Neutro'
          },
          {
            label: 'Queda de Tensão Trifásica Equilibrada (V)',
            formula: 'ΔV_tri = √3 × I × L × (R_km × cos φ + X_km × sen φ) / 1000',
            explicacao: 'Multiplicador √3 ≈ 1,732 para tensão de linha em sistemas trifásicos'
          },
          {
            label: 'Queda de Tensão Percentual (%)',
            formula: 'ΔV(%) = (ΔV / V_nominal) × 100',
            explicacao: 'Relação percentual em relação à tensão nominal (ex: 230 V mono ou 400 V trifásico)'
          },
          {
            label: 'Seção Mínima por Queda de Tensão (Resistiva pura)',
            formula: 'S_mono = (2 × ρ × L × I) / ΔV_adm  |  S_tri = (√3 × ρ × L × I) / ΔV_adm',
            explicacao: 'Permite determinar a bitola mínima necessária para não violar o limite ΔV_adm'
          }
        ],
        pontosOperacionais: [
          'Em circuitos monofásicos, o comprimento L é a distância física entre o quadro e a carga, mas a corrente percorre 2·L (ida e volta), exigindo o fator 2 na fórmula.',
          'Em sistemas trifásicos rigorosamente equilibrados, a corrente no neutro é nula; a queda de tensão entre fases utiliza o fator multiplicativo √3 ≈ 1,732.',
          'A queda de tensão na partida de motores elétricos trifásicos de indução não deve ultrapassar 10% a 15% nos barramentos de partida para assegurar aceleração firme e evitar travamento do rotor.',
          'Para circuitos longos (> 50 metros), o critério de queda de tensão frequentemente exige uma bitola de condutor substancialmente superior à indicada pelo critério de capacidade de corrente Iz.'
        ],
        fieldCase: {
          localizacao: 'Estação de Bombeamento Agrícola de Chókwè, Província de Gaza',
          cenario: 'Um motor trifásico de 18,5 kW 400 V (In = 35 A, cos φ = 0,85) alimentado por um cabo subterrâneo de 16 mm² em cobre ao longo de 220 metros apresentava desligamentos por sobrecarga térmica após 20 minutos de funcionamento contínuo, com queima frequente do contator.',
          diagnostico: 'Com resistência unitária do cabo de 16 mm² a 70 °C de R ≈ 1,38 Ω/km, a queda de tensão calculada no percurso era de ΔV = √3 × 35 × 0,220 × 1,38 × 0,85 ≈ 15,6 V (3,9% em regime). Porém, na partida direta do motor (Ip = 6 × In = 210 A com cos φ_partida = 0,35), a queda de tensão subiu para 23,4% (tensão nos bornes despencou para 306 V). O motor demorava 14 segundos para atingir a rotação nominal sob conjugado enfraquecido, aquecendo severamente os enrolamentos.',
          solucaoNormativa: 'Substituição do alimentador por cabo de cobre de 50 mm² (R ≈ 0,44 Ω/km) associado à instalação de um soft-starter com rampa de tensão controlada. A queda de tensão na partida foi contida em 7,2% e o tempo de aceleração caiu para 3,8 segundos com corrente térmica estabilizada.'
        },
        funcionamento: 'Ao transitar pelo condutor, a corrente defasa-se em relação à tensão de acordo com a impedância da carga. A projeção da queda de tensão fasorial na direção da tensão da fonte depende da soma R·cos(φ) + X·sen(φ). Em cargas puramente resistivas (cos φ = 1,0), a reatância não impacta a queda longitudinal de tensão.',
        aplicacaoMocambique: 'Nas extensas instalações rurais e agroindustriais de Moçambique, onde bombas e geradores estão comumente a 150 a 400 metros dos centros de distribuição, o cálculo rigoroso de queda de tensão é a etapa crítica que define a bitola econômica do projeto.',
        exemploPratico: 'Circuito monofásico de 230 V alimentando aquecedor de 4600 W (I = 20 A, cos φ = 1,0) a 60 metros de distância com cabo de 6 mm² (R = 3,67 Ω/km): ΔV = 2 × 20 A × 0,060 km × 3,67 Ω/km × 1,0 = 8,81 V. Em porcentagem: (8,81 / 230) × 100 = 3,83%, dentro do limite máximo de 4% a 5% para força.',
        calculationSnippet: 'ΔV_mono = 2·I·L·(R·cosφ + X·senφ) | ΔV_tri = √3·I·L·(R·cosφ + X·senφ) | ΔV% = (ΔV/V)·100'
      },
      quiz: {
        question: 'Um alimentador trifásico de 400 V alimenta uma carga de 50 A equilibrada com fator de potência cos φ = 0,80 ao longo de 100 metros de linha. Os condutores de cobre possuem resistência unitária de R = 0,727 Ω/km e reatância de X = 0,080 Ω/km. Sabendo que sen φ = 0,60, qual é a queda de tensão inter-fases aproximada e sua porcentagem?',
        options: [
          { id: 'A', text: 'ΔV ≈ 5,45 V (1,36%).', isCorrect: true, feedback: 'Correto! Impedância longitudinal: (0,727 × 0,8 + 0,08 × 0,6) = 0,5816 + 0,048 = 0,6296 Ω/km. ΔV = √3 × 50 A × 0,100 km × 0,6296 Ω/km = 1,732 × 5 × 0,6296 ≈ 5,45 V. Percentual: (5,45 / 400) × 100 = 1,36%.' },
          { id: 'B', text: 'ΔV ≈ 18,2 V (4,55%).', isCorrect: false, feedback: 'Incorreto. Multiplicou com erro pelo fator de ida e volta monofásico e sem considerar o comprimento em km.' },
          { id: 'C', text: 'ΔV ≈ 36,4 V (9,10%).', isCorrect: false, feedback: 'Incorreto. Calculou utilizando 230 V como tensão de base e sem conversão adequada.' },
          { id: 'D', text: 'ΔV ≈ 1,20 V (0,30%).', isCorrect: false, feedback: 'Incorreto. Esqueceu de multiplicar pela raiz de 3 no sistema trifásico.' }
        ],
        explanation: 'Para circuito trifásico: ΔV = √3 × I × L × (R·cos φ + X·sen φ). Calculando o termo composto: (0,727 × 0,80 + 0,080 × 0,60) = 0,5816 + 0,048 = 0,6296 Ω/km. Em 0,100 km com 50 A: ΔV = 1,732 × 50 × 0,100 × 0,6296 = 5,452 V. Em percentual da rede de 400 V: (5,452 / 400) × 100 = 1,36%, valor excelente bem abaixo do limite máximo de 5%.',
        keyTakeaway: 'ΔV_tri = √3 × I × L × (R·cos φ + X·sen φ). Com 400 V, 1,36% de queda garante estabilidade plena aos receptores.',
        xpReward: 50
      },
      assessmentQuestions: [
        {
          id: 'elec_m3_ec2_q1_queda_monofasica_resistor',
          type: 'multiple_choice',
          question: 'Um circuito terminal monofásico de 230 V alimenta uma carga puramente resistiva de 3680 W (corrente I = 16 A, cos φ = 1,0) situada a uma distância de 45 metros do quadro de distribuição. O cabo de cobre utilizado de 2,5 mm² possui resistência efetiva em regime de R = 8,90 Ω/km (desprezando-se a reatância). Qual é o valor absoluto da queda de tensão ΔV e sua respectiva porcentagem em relação à tensão nominal?',
          scenario: 'Verificação da queda de tensão em circuitos terminais monofásicos residenciais e comerciais.',
          norma: 'Boas Práticas de Engenharia e Padrões Industriais de Mercado',
          points: 33,
          explanation: 'Para circuito monofásico: ΔV = 2 × I × L × R. Com I = 16 A, L = 0,045 km e R = 8,90 Ω/km: ΔV = 2 × 16 × 0,045 × 8,90 = 12,816 V. Percentual: ΔV(%) = (12,816 / 230) × 100 ≈ 5,57%.',
          keyTakeaway: 'ΔV_mono = 2 · I · L · R: Para 16 A a 45 m em cabo de 2,5 mm², a queda é de 12,82 V (5,57%).',
          options: [
            { id: 'opt_1_1', text: 'ΔV ≈ 12,82 V (ou 5,57%).', isCorrect: true, feedback: 'Correto! 2 × 16 A × 0,045 km × 8,90 Ω/km = 12,816 V; (12,816 / 230) × 100 = 5,57%.' },
            { id: 'opt_1_2', text: 'ΔV ≈ 6,41 V (ou 2,79%).', isCorrect: false, feedback: 'Incorreto. Esqueceu de multiplicar pelo fator 2 referente ao trajeto de ida e volta monofásico.' },
            { id: 'opt_1_3', text: 'ΔV ≈ 25,63 V (ou 11,14%).', isCorrect: false, feedback: 'Incorreto. Duplicou indevidamente o comprimento da linha.' },
            { id: 'opt_1_4', text: 'ΔV ≈ 3,20 V (ou 1,39%).', isCorrect: false, feedback: 'Incorreto. Houve erro grosseiro de unidades métricas.' }
          ]
        },
        {
          id: 'elec_m3_ec2_q2_queda_trifasica_motor',
          type: 'multiple_choice',
          question: 'Uma linha trifásica de 400 V alimenta um quadro de força industrial com corrente equilibrada de 80 A e fator de potência cos φ = 0,85 (sen φ ≈ 0,527). O alimentador possui 150 metros de comprimento com cabos de cobre de 35 mm² (R = 0,62 Ω/km e X = 0,08 Ω/km). Qual é a queda de tensão inter-fases ΔV e o percentual correspondente?',
          scenario: 'Dimensionamento de alimentadores trifásicos para centros de controle de motores (CCM).',
          norma: 'Boas Práticas de Engenharia e Padrões Industriais de Mercado',
          points: 33,
          explanation: 'Impedância composta: (R·cos φ + X·sen φ) = (0,62 × 0,85 + 0,08 × 0,527) = 0,527 + 0,0422 = 0,5692 Ω/km. Queda trifásica: ΔV = √3 × 80 A × 0,150 km × 0,5692 Ω/km = 1,732 × 12 × 0,5692 ≈ 11,83 V. Percentual: (11,83 / 400) × 100 ≈ 2,96%.',
          keyTakeaway: 'ΔV_tri = √3 · I · L · (R·cos φ + X·sen φ). Com 11,83 V (2,96%), o circuito cumpre plenamente o critério de máxima eficiência.',
          options: [
            { id: 'opt_2_1', text: 'ΔV ≈ 11,83 V (ou 2,96%).', isCorrect: true, feedback: 'Excelente! A queda inter-fases é 11,83 V, correspondendo a 2,96% da tensão nominal de 400 V.' },
            { id: 'opt_2_2', text: 'ΔV ≈ 23,66 V (ou 5,92%).', isCorrect: false, feedback: 'Incorreto. Utilizou a equação monofásica (fator 2) em vez da trifásica (√3).' },
            { id: 'opt_2_3', text: 'ΔV ≈ 6,83 V (ou 1,71%).', isCorrect: false, feedback: 'Incorreto. Esqueceu o fator √3 na composição da tensão de linha.' },
            { id: 'opt_2_4', text: 'ΔV ≈ 31,50 V (ou 7,88%).', isCorrect: false, feedback: 'Incorreto. Erro de conversão de metros para quilômetros na impedância longitudinal.' }
          ]
        },
        {
          id: 'elec_m3_ec2_q3_secao_minima_queda_admissivel',
          type: 'multiple_choice',
          question: 'Projeta-se um circuito monofásico de 230 V para alimentar uma luminária externa a 80 metros de distância com corrente contínua de I = 10 A (cos φ = 1,0). A queda de tensão máxima admissível por projeto é fixada em estritamente 3,0% (ΔV_máx = 0,03 × 230 V = 6,90 V). Adotando a resistividade do cobre em temperatura de regime como ρ = 0,020 Ω·mm²/m, qual é a seção transversal mínima comercial que impede que a queda de tensão ultrapasse esse limite?',
          scenario: 'Dimensionamento da seção mínima condutora condicionada pela queda de tensão máxima admissível.',
          norma: 'Boas Práticas de Engenharia e Padrões Industriais de Mercado',
          points: 34,
          explanation: 'Isolando a seção na equação da queda: ΔV = (2 × ρ × L × I) / S ⇒ S ≥ (2 × ρ × L × I) / ΔV_máx. Substituindo os valores: S ≥ (2 × 0,020 × 80 × 10) / 6,90 = 32 / 6,90 ≈ 4,64 mm². Entre as seções comerciais normalizadas (1,5; 2,5; 4; 6; 10 mm²), a seção imediatamente superior é 6 mm².',
          keyTakeaway: 'S ≥ (2 · ρ · L · I) / ΔV_adm: A bitola de 4 mm² resulta em queda de 3,48% (inaceitável); deve-se adotar o cabo de 6 mm² (queda de 2,32%).',
          options: [
            { id: 'opt_3_1', text: 'Cabo com seção transversal de 6 mm².', isCorrect: true, feedback: 'Perfeito! O valor mínimo teórico é 4,64 mm², exigindo a seção comercial de 6 mm² para não violar os 3% de queda máxima.' },
            { id: 'opt_3_2', text: 'Cabo com seção transversal de 4 mm².', isCorrect: false, feedback: 'Incorreto. 4 mm² resultaria em ΔV = 8,0 V (3,48%), violando o limite máximo estipulado de 3,0%.' },
            { id: 'opt_3_3', text: 'Cabo com seção transversal de 2,5 mm².', isCorrect: false, feedback: 'Incorreto. Em 2,5 mm² a queda atingiria 5,56%, gerando cintilação visível e perda de eficiência.' },
            { id: 'opt_3_4', text: 'Cabo com seção transversal de 10 mm².', isCorrect: false, feedback: 'Incorreto. Embora tecnicamente atenda, 10 mm² é superdimensionado e antieconômico quando 6 mm² já satisfaz a regra.' }
          ]
        }
      ]
    },

    // ------------------------------------------------------------------------
    // ELEMENTO 3.3: Fatores de Correção por Agrupamento, Temperatura e Assentamento
    // ------------------------------------------------------------------------
    {
      id: 'elec_m3_ec3_fatores_correcao',
      moduleId: 'elec_mod_3_condutores_linhas',
      moduleTitle: 'Módulo 3: Condutores, Linhas Elétricas e Canalizações',
      order: 3,
      code: 'EC 3.3',
      title: 'Fatores de Correção por Agrupamento, Temperatura e Assentamento',
      norma: 'Boas Práticas de Engenharia e Padrões Industriais de Mercado',
      level: 'Avançado',
      durationMinutes: 18,
      theory: {
        conceito: 'As tabelas padronizadas de capacidade de condução de corrente (Iz) indicam valores nominais calculados para condições de referência estritas: condutores operando isoladamente (sem circuitos vizinhos gerando calor mútuo) a uma temperatura ambiente de referência de 30 °C para linhas ao ar livre ou 20 °C para linhas enterradas no solo. Em instalações reais de engenharia, múltiplos circuitos compartilham o mesmo eletroduto, calha ou esteira (aquecimento mútuo por agrupamento), operam sob temperaturas ambientes mais elevadas (galpões industriais quentes, clima tropical) e em diferentes métodos de assentamento (enterrados com resistividade térmica do solo variável, embutidos em alvenaria ou instalados em ar livre perfurado). Para manter a integridade térmica do condutor, deve-se aplicar o Fator de Correção Total (FCT), obtido pelo produto de todos os coeficientes redutores: FCT = F_temp × F_agrup × F_solo. A capacidade de condução efetiva corrigida torna-se: Iz_corrigido = Iz_tabelado × FCT. Alternativamente, para dimensionar um condutor, calcula-se a corrente fictícia corrigida de projeto: IB_ficticio = IB / FCT, selecionando o cabo cuja capacidade tabelada de catálogo seja igual ou superior a IB_ficticio.',
        formulas: [
          {
            label: 'Fator de Correção Total (FCT)',
            formula: 'FCT = F_temp × F_agrup × F_solo',
            explicacao: 'Produtório dos coeficientes de redução ambiental e de instalação'
          },
          {
            label: 'Capacidade de Condução Real Corrigida (Iz\')',
            formula: 'I_z\' = I_z(tabela) × FCT',
            explicacao: 'Capacidade real máxima de condução do cabo nas condições de serviço'
          },
          {
            label: 'Corrente Fictícia de Projeto para Seleção',
            formula: 'I_B\' = I_B / FCT',
            explicacao: 'Permite consultar diretamente tabelas de condutores com a corrente corrigida'
          },
          {
            label: 'Fator de Correção de Temperatura (F_temp)',
            formula: 'F_temp = √[(θ_max - θ_amb) / (θ_max - 30 °C)]',
            explicacao: 'Onde θ_max é 70 °C para PVC ou 90 °C para XLPE/EPR e θ_amb é a temperatura ambiente real'
          }
        ],
        pontosOperacionais: [
          'Fator de agrupamento para múltiplos circuitos no mesmo duto fechado: 2 circuitos = 0,80; 3 circuitos = 0,70; 4 circuitos = 0,65; 6 circuitos = 0,55; 9 ou mais circuitos = 0,50.',
          'Nunca amontoar cabos de potência em eletrodutos fechados sem aplicar o fator de agrupamento; cabos operando a 100% de carga sem fator de redução derretem a isolação por aprisionamento térmico.',
          'Em esteiras perfuradas e leitos com espaçamento mínimo de um diâmetro de cabo (1 × D) entre condutores vizinhos em camada única, o fator de agrupamento eleva-se para 1,0 (sem redução térmica).',
          'A temperatura ambiente adotada em projeto para regiões tropicais sem ar-condicionado deve ser de pelo menos 35 °C a 40 °C, e sob telhas metálicas sem isolamento pode atingir 50 °C a 60 °C.'
        ],
        fieldCase: {
          localizacao: 'Parque Industrial de Beluluane, Província de Maputo',
          cenario: 'Em uma fábrica metalúrgica, 6 circuitos trifásicos independentes alimentando fornos de têmpera (cada um com IB = 32 A) foram passados no interior de uma mesma canaleta fechada de PVC embutida no piso, sob temperatura média do ambiente fabril de 40 °C. Os cabos de cobre utilizados eram de 6 mm² em PVC (Iz tabelado de 41 A em método B2). Após 4 meses, ocorreu curto-circuito catastrófico generalizado por fusão coletiva do isolamento.',
          diagnostico: 'Para PVC a 40 °C, o fator de temperatura é F_temp = 0,87. Para 6 circuitos agrupados na mesma canaleta fechada, o fator de agrupamento é F_agrup = 0,57. O FCT resultou em: 0,87 × 0,57 = 0,496. A capacidade real corrigida do cabo de 6 mm² era de apenas Iz\' = 41 A × 0,496 = 20,3 A. Conduzindo 32 A contínuos (uma sobrecarga térmica permanente de 57%), os cabos atingiram mais de 105 °C, destruindo completamente o PVC.',
          solucaoNormativa: 'Redimensionamento completo: divisão dos circuitos em esteira aramada ventilada em camada única com espaçamento de 1 diâmetro (F_agrup = 1,00) e substituição por cabos de cobre isolados em XLPE de 10 mm² (Iz tabelado = 73 A; F_temp a 40 °C = 0,91; Iz\' = 73 × 0,91 = 66,4 A >> 32 A).'
        },
        funcionamento: 'O calor gerado no condutor interno deve ser transferido para o exterior. Quando vários condutores aquecidos estão em contato mútuo dentro de um volume restrito, a resistência térmica de saída aumenta exponencialmente, elevando a temperatura de equilíbrio térmico para muito além do patamar suportado pelo polímero.',
        aplicacaoMocambique: 'Nas províncias de Tete, Sofala e Zambézia, temperaturas ambientes de 40 °C a 45 °C em coberturas industriais de chapa de zinco são comuns durante o verão. Dimensionar alimentadores com fator FCT unitário (1,0) nessas condições é uma das principais causas de queimas de instalações na região.',
        exemploPratico: 'Um circuito com corrente IB = 42 A deve ser instalado em ambiente a 45 °C (cabo de PVC: F_temp = 0,79) compartilhado com mais 2 circuitos no mesmo conduto (total de 3 circuitos: F_agrup = 0,70). O FCT é 0,79 × 0,70 = 0,553. A corrente fictícia necessária para consultar a tabela é IB\' = 42 / 0,553 = 75,9 A. Deve-se escolher um condutor cuja capacidade nominal tabelada seja de pelo menos 76 A (cabo de 25 mm² de PVC com Iz = 80 A).' ,
        calculationSnippet: 'FCT = F_temp × F_agrup × F_solo | Iz\' = Iz × FCT | IB\' = IB / FCT'
      },
      quiz: {
        question: 'Deseja-se dimensionar um alimentador trifásico que conduzirá uma corrente contínua de projeto IB = 36 A. A linha passará por um eletroduto fechado contendo no total 3 circuitos agrupados (fator de agrupamento F_agrup = 0,70) em uma região onde a temperatura ambiente atinge 40 °C (fator de correção de temperatura para condutor PVC F_temp = 0,87). Qual é a capacidade de condução de corrente mínima tabelada (Iz_tabelado) que o cabo de PVC deve possuir nas tabelas de referência para suportar essa instalação?',
        options: [
          { id: 'A', text: 'Iz_tabelado deve ser de pelo menos 59,1 A.', isCorrect: true, feedback: 'Correto! FCT = 0,87 × 0,70 = 0,609. A corrente de referência necessária é IB\' = IB / FCT = 36 / 0,609 ≈ 59,11 A.' },
          { id: 'B', text: 'Iz_tabelado deve ser de 36 A, pois os fatores só se aplicam ao disjuntor.', isCorrect: false, feedback: 'Totalmente incorreto! Os fatores corrigem a dissipação térmica do condutor.' },
          { id: 'C', text: 'Iz_tabelado deve ser de 21,9 A.', isCorrect: false, feedback: 'Incorreto. Multiplicou a corrente pelos fatores em vez de dividir (36 × 0,609 = 21,9 A).' },
          { id: 'D', text: 'Iz_tabelado deve ser de 120 A para qualquer circuito.', isCorrect: false, feedback: 'Incorreto. Valor desproporcional sem fundamentação matemática no projeto.' }
        ],
        explanation: 'O Fator de Correção Total é o produto dos fatores ambientais: FCT = F_temp × F_agrup = 0,87 × 0,70 = 0,609. Para selecionar o condutor na tabela padrão de 30 °C, calcula-se a corrente de projeto corrigida: IB\' = IB / FCT = 36 A / 0,609 = 59,11 A. Portanto, o condutor deve possuir Iz tabelado ≥ 59,2 A (o que normalmente corresponde a um cabo de cobre de 16 mm² em eletroduto embutido).',
        keyTakeaway: 'IB\' = IB / (F_temp · F_agrup). A corrente fictícia de dimensionamento sobe de 36 A para 59,1 A devido ao aquecimento conjunto.',
        xpReward: 50
      },
      assessmentQuestions: [
        {
          id: 'elec_m3_ec3_q1_calculo_fator_temperatura',
          type: 'multiple_choice',
          question: 'Um alimentador com cabos isolados em XLPE (temperatura máxima contínua de serviço de 90 °C) opera em uma sala de máquinas não climatizada cuja temperatura ambiente no verão atinge 50 °C. Aplicando a fórmula analítica do fator de correção de temperatura F_temp = √[(θ_max - θ_amb) / (θ_max - 30 °C)], qual é o fator de correção de temperatura resultante a ser aplicado à capacidade nominal do cabo?',
          scenario: 'Determinação analítica precisa do fator de correção por temperatura ambiente elevada.',
          norma: 'Boas Práticas de Engenharia e Padrões Industriais de Mercado',
          points: 33,
          explanation: 'Substituindo os dados: θ_max = 90 °C, θ_amb = 50 °C. Numerador: 90 - 50 = 40 °C. Denominador: 90 - 30 = 60 °C. Razão: 40 / 60 = 0,6667. Raiz quadrada: F_temp = √(0,6667) ≈ 0,8165 (ou 0,82).',
          keyTakeaway: 'F_temp = √[(90 - 50)/(90 - 30)] = √(40/60) ≈ 0,82: O condutor a 50 °C perde aproximadamente 18% da sua capacidade de corrente.',
          options: [
            { id: 'opt_1_1', text: 'F_temp ≈ 0,82 (ou 0,816).', isCorrect: true, feedback: 'Correto! F_temp = √(40 / 60) = √0,6667 ≈ 0,8165.' },
            { id: 'opt_1_2', text: 'F_temp ≈ 0,67.', isCorrect: false, feedback: 'Incorreto. Esqueceu de extrair a raiz quadrada da razão térmica (40/60 = 0,667).' },
            { id: 'opt_1_3', text: 'F_temp ≈ 0,91.', isCorrect: false, feedback: 'Incorreto. Valor correspondente a temperatura ambiente de 40 °C, não 50 °C.' },
            { id: 'opt_1_4', text: 'F_temp ≈ 1,18.', isCorrect: false, feedback: 'Incorreto. Fator maior que 1 só ocorre para temperaturas inferiores a 30 °C.' }
          ]
        },
        {
          id: 'elec_m3_ec3_q2_agrupamento_canaleta_fechada',
          type: 'multiple_choice',
          question: 'Um cabo de cobre com isolamento de PVC de 10 mm² possui capacidade de condução de corrente tabelada em catálogo de Iz = 52 A (método de instalação B1 - eletroduto embutido em alvenaria a 30 °C). Caso sejam instalados 4 circuitos monofásicos agrupados no mesmo eletroduto sob temperatura ambiente de 35 °C (fatores normativos: F_agrup = 0,65 e F_temp = 0,94), qual será a capacidade real de condução de corrente corrigida (Iz\') deste condutor?',
          scenario: 'Avaliação da redução de capacidade de corrente por efeito combinado de agrupamento e temperatura.',
          norma: 'Boas Práticas de Engenharia e Padrões Industriais de Mercado',
          points: 33,
          explanation: 'O Fator de Correção Total é: FCT = F_temp × F_agrup = 0,94 × 0,65 = 0,611. A capacidade real corrigida é: Iz\' = Iz × FCT = 52 A × 0,611 ≈ 31,77 A.',
          keyTakeaway: 'Iz\' = Iz · FCT: A capacidade do cabo de 10 mm² é reduzida de 52 A para aproximadamente 31,8 A devido ao agrupamento de 4 circuitos e calor de 35 °C.',
          options: [
            { id: 'opt_2_1', text: 'Iz\' ≈ 31,8 A.', isCorrect: true, feedback: 'Excelente! Iz\' = 52 A × (0,94 × 0,65) = 52 × 0,611 = 31,77 A.' },
            { id: 'opt_2_2', text: 'Iz\' ≈ 48,9 A.', isCorrect: false, feedback: 'Incorreto. Aplicou apenas o fator de temperatura (52 × 0,94 = 48,88 A), ignorando o agrupamento.' },
            { id: 'opt_2_3', text: 'Iz\' ≈ 33,8 A.', isCorrect: false, feedback: 'Incorreto. Aplicou apenas o fator de agrupamento (52 × 0,65 = 33,8 A), ignorando a temperatura.' },
            { id: 'opt_2_4', text: 'Iz\' ≈ 18,2 A.', isCorrect: false, feedback: 'Incorreto. Multiplicou duas vezes pelo fator de agrupamento por engano de cálculo.' }
          ]
        },
        {
          id: 'elec_m3_ec3_q3_dimensionamento_ficticio_subterraneo',
          type: 'multiple_choice',
          question: 'Um alimentador trifásico subterrâneo deve conduzir IB = 110 A. Os cabos unipolares serão enterrados diretamente no solo sob temperatura do solo de 25 °C (F_temp_solo = 0,95 para XLPE) e resistividade térmica do terreno elevada de 2,0 K·m/W (fator de correção de resistividade do solo F_solo = 0,80), com 2 circuitos paralelos na mesma vala espaçados de 20 cm (fator de agrupamento subterrâneo F_agrup = 0,85). Qual é a corrente fictícia corrigida de projeto IB\' a ser utilizada para a seleção do cabo nas tabelas de referência?',
          scenario: 'Cálculo de corrente equivalente para linhas subterrâneas de média e baixa tensão com solo desfavorável.',
          norma: 'Boas Práticas de Engenharia e Padrões Industriais de Mercado',
          points: 34,
          explanation: 'Calculando o FCT composto: FCT = F_temp_solo × F_solo × F_agrup = 0,95 × 0,80 × 0,85 = 0,646. A corrente fictícia de seleção é: IB\' = IB / FCT = 110 A / 0,646 ≈ 170,28 A.',
          keyTakeaway: 'IB\' = IB / FCT: Com FCT = 0,646, a corrente fictícia sobe para 170,3 A, exigindo um condutor de catálogo com Iz ≥ 171 A.',
          options: [
            { id: 'opt_3_1', text: 'IB\' ≈ 170,3 A.', isCorrect: true, feedback: 'Perfeito! FCT = 0,95 × 0,80 × 0,85 = 0,646; IB\' = 110 / 0,646 = 170,28 A.' },
            { id: 'opt_3_2', text: 'IB\' ≈ 71,1 A.', isCorrect: false, feedback: 'Incorreto. Multiplicou a corrente pelo fator em vez de dividir (110 × 0,646 = 71,06 A).' },
            { id: 'opt_3_3', text: 'IB\' ≈ 137,5 A.', isCorrect: false, feedback: 'Incorreto. Deixou de computar o fator de resistividade térmica do solo (0,80).' },
            { id: 'opt_3_4', text: 'IB\' ≈ 110,0 A.', isCorrect: false, feedback: 'Incorreto. Desconsiderar os fatores térmicos do solo levaria à queima prematura do cabo enterrado.' }
          ]
        }
      ]
    },

    // ------------------------------------------------------------------------
    // ELEMENTO 3.4: Dimensionamento e Seleção de Esteiras, Canaletas e Tubagens
    // ------------------------------------------------------------------------
    {
      id: 'elec_m3_ec4_esteiras_canaletas_tubagens',
      moduleId: 'elec_mod_3_condutores_linhas',
      moduleTitle: 'Módulo 3: Condutores, Linhas Elétricas e Canalizações',
      order: 4,
      code: 'EC 3.4',
      title: 'Dimensionamento e Seleção de Esteiras, Canaletas e Tubagens',
      norma: 'Boas Práticas de Engenharia e Padrões Industriais de Mercado',
      level: 'Intermediário',
      durationMinutes: 16,
      theory: {
        conceito: 'As canalizações elétricas formam o envoltório mecânico e a infraestrutura de suporte destinada a acomodar, proteger e rotear condutores elétricos contra impactos físicos, umidade, poeira, substâncias químicas e radiação UV. Compreendem eletrodutos (metálicos rígidos, PVC roscável ou corrugado flexível), calhas e canaletas industriais perfuradas ou cegas com tampa, esteiras aramadas e leitos tipo escada para cabos pesados. A seleção e o dimensionamento geométrico das canalizações são governados estritamente pela Taxa Máxima de Ocupação da Área Interna Útil (espaço livre para ventilação térmica e esforço de tração na enfiação) e pelas regras de segregação física de circuitos: é terminantemente proibido compartilhar o mesmo duto físico entre cabos de potência (230 V / 400 V) e cabos de extrabaixa tensão de controle e sinal analógico/digital sensíveis (0-10 V, 4-20 mA, redes Ethernet/RS485), exceto se houver septo divisor metálico contínuo devidamente aterrado ou blindagem integral com aterramento unipolar.',
        formulas: [
          {
            label: 'Taxa Máxima de Ocupação em Eletrodutos',
            formula: '1 cabo: 53%  |  2 cabos: 31%  |  ≥ 3 cabos: 40%',
            explicacao: 'Porcentagem máxima da área interna livre ocupada pela soma das áreas externas dos cabos'
          },
          {
            label: 'Área da Seção Reta Circular',
            formula: 'A = (π × D²) / 4 ≈ 0,7854 × D²',
            explicacao: 'Cálculo da área interna do eletroduto ou área externa cilíndrica de cada cabo'
          },
          {
            label: 'Taxa Máxima de Ocupação em Canaletas com Tampa',
            formula: 'Área_cabos ≤ 40% a 45% da Área_útil da canaleta',
            explicacao: 'Garante fluxo convectivo de ar e espaço para derivações e expansão futura'
          },
          {
            label: 'Capacidade de Carga Mecânica em Leito (kg/m)',
            formula: 'Carga_total = Σ (Peso_cabos/metro) × Fator_dinamico (1,25)',
            explicacao: 'Verificação do vão entre suportes de sustentação para não encurvar a estrutura'
          }
        ],
        pontosOperacionais: [
          'Regra dos 40%: Para 3 ou mais cabos em eletroduto, pelo menos 60% da área interna deve permanecer rigorosamente vazia para circulação de ar convectivo e facilidade de passagem sem esmagar o isolamento.',
          'Raio de curvatura mínimo: o raio interno de curvatura durante a instalação de cabos de potência de baixa tensão não deve ser inferior a 6 a 8 vezes o diâmetro externo total do cabo (D_ext) para cabos não armados, e 12 vezes para cabos armados com fita ou malha de aço.',
          'Máximo de curvas por trecho de tubulação: entre duas caixas de passagem consecutivas, o percurso não pode conter mais de 3 curvas de 90° (total de 270°) e comprimento máximo de 15 metros em trechos retos (ou 30 metros com caixas intermediárias).',
          'Segregação obrigatória: calhas metálicas com septo divisor interno são exigidas para rotear lado a lado circuitos de força e circuitos de telecomunicações/CLP, mantendo a blindagem eletromagnética.'
        ],
        fieldCase: {
          localizacao: 'Cervejaria de Manhiça, Província de Maputo',
          cenario: 'Durante a expansão de uma linha de engarrafamento, a equipe de montagem passou 12 novos cabos de força de 4 mm² e 6 mm² dentro de um eletroduto de PVC existente de 32 mm externo (diâmetro interno útil de 27 mm). O tubo ficou 100% preenchido sob forte pressão mecânica com auxílio de talha para puxar a fiação. Após 3 semanas de produção em 2 turnos, o eletroduto deformou-se pelo calor e os condutores entraram em curto-circuito interno.',
          diagnostico: 'Área interna do tubo: A_int = π × 27² / 4 = 572,5 mm². O somatório das áreas externas dos 12 cabos perfazia 348 mm², resultando em uma taxa de ocupação de 60,8% (mais de 50% acima do limite de 40%). O aprisionamento térmico impediu qualquer resfriamento, cozinhando o PVC e colapsando o isolamento.',
          solucaoNormativa: 'Remoção dos cabos da tubulação e instalação de uma esteira metálica aramada tipo leito de 200 mm de largura suspensa por tirantes de aço, distribuindo os cabos em camada única com fixação por abraçadeiras plásticas resistentes a UV, restabelecendo a ventilação natural com taxa de ocupação inferior a 30%.'
        },
        funcionamento: 'O ar dentro de uma canalização fechada comporta-se como meio isolante térmico quando estagnado. A presença de 60% de espaço livre permite convecção térmica natural em circuito fechado, transferindo o calor da superfície dos cabos para as paredes externas do eletroduto, que então irradiam para o ambiente.',
        aplicacaoMocambique: 'Nas instalações costeiras expostas à maresia em Moçambique (portos de Maputo, Beira e Nacala), tubulações e esteiras metálicas devem ser de aço inoxidável AISI 316 ou aço galvanizado a fogo por imersão a quente (HDG) com espessura de zinco mínima de 55 a 85 μm para evitar corrosão acelerada.',
        exemploPratico: 'Um circuito requer a passagem de 5 condutores com diâmetro externo de 6,0 mm cada. Área de cada cabo: a_cabo = π × 6² / 4 = 28,27 mm². Área total dos cabos: 5 × 28,27 = 141,35 mm². Para taxa máxima de 40%, a área interna mínima do eletroduto deve ser: A_min = 141,35 / 0,40 = 353,4 mm². O diâmetro interno mínimo necessário é D_int = √(4 × 353,4 / π) ≈ 21,2 mm, devendo-se especificar no mínimo um eletroduto de 25 mm ou 32 mm.',
        calculationSnippet: 'A_cabos ≤ 0,40 × A_tubo (para ≥ 3 cabos) | Raio curvatura ≥ 6 a 8 D | Máx 3 curvas 90°'
      },
      quiz: {
        question: 'Segundo as Boas Práticas de Engenharia e Padrões Industriais de Mercado, qual é a taxa máxima recomendada de ocupação da área da seção transversal interna de um eletroduto rígido ou flexível quando nele são instalados três ou mais condutores elétricos?',
        options: [
          { id: 'A', text: '100%, preenchendo todo o volume disponível para economizar tubos.', isCorrect: false, feedback: 'Totalmente proibido! Causa destruição térmica por aprisionamento de calor e impossibilita enfiação.' },
          { id: 'B', text: '40% da área útil interna do eletroduto (reservando 60% de ar livre).', isCorrect: true, feedback: 'Correto! A regra de ouro dos 40% para 3 ou mais cabos assegura convecção de calor e puxamento suave sem atrito destrutivo.' },
          { id: 'C', text: '75% desde que se utilize vaselina líquida para lubrificação.', isCorrect: false, feedback: 'Incorreto. 75% bloqueia a circulação de ar e derivados de petróleo atacam o isolamento plástico.' },
          { id: 'D', text: '15% apenas, independentemente do diâmetro.', isCorrect: false, feedback: 'Incorreto. 15% seria superdimensionamento geométrico desnecessário para instalações prediais e industriais.' }
        ],
        explanation: 'A taxa máxima de ocupação em eletrodutos estabelece: 53% para 1 condutor, 31% para 2 condutores e 40% para 3 ou mais condutores. Essa reserva de 60% de espaço livre é indispensável para evitar atrito excessivo durante a enfiação dos cabos e permitir a convecção do ar interno para dissipação do calor gerado por efeito Joule.',
        keyTakeaway: 'Regra dos 40%: Mantenha pelo menos 60% da seção interna do eletroduto livre para ventilação térmica e passagem segura dos condutores.',
        xpReward: 50
      },
      assessmentQuestions: [
        {
          id: 'elec_m3_ec4_q1_ocupacao_eletroduto_tres_cabos',
          type: 'multiple_choice',
          question: 'Em uma instalação comercial, pretende-se passar 4 condutores unipolares de cobre de 6 mm² dentro de um eletroduto circular. Cada condutor possui diâmetro externo total de 5,0 mm (área transversal externa aproximada de 19,63 mm² por cabo). Qual é o diâmetro interno mínimo d_int que o eletroduto deve possuir para respeitar estritamente a taxa máxima de ocupação de 40%?',
          scenario: 'Cálculo de dimensionamento geométrico de eletrodutos para circuitos elétricos terminais.',
          norma: 'Boas Práticas de Engenharia e Padrões Industriais de Mercado',
          points: 33,
          explanation: 'Área total ocupada pelos 4 cabos: A_cabos = 4 × 19,63 mm² = 78,54 mm². Com a taxa limite de 40% (0,40): Área interna mínima necessária do duto = 78,54 / 0,40 = 196,35 mm². Diâmetro interno mínimo: d_int = √(4 × 196,35 / π) = √(250) ≈ 15,81 mm (adotando comercialmente duto com diâmetro interno ≥ 16 mm, tipicamente DN 20 mm / 25 mm).',
          keyTakeaway: 'A_duto ≥ A_cabos / 0,40: O eletroduto deve ter área interna de pelo menos 196,4 mm² (diâmetro interno mínimo de 15,8 mm).',
          options: [
            { id: 'opt_1_1', text: 'Diâmetro interno mínimo de 15,8 mm (área útil ≥ 196,4 mm²).', isCorrect: true, feedback: 'Correto! 4 × 19,63 = 78,54 mm²; 78,54 / 0,40 = 196,35 mm²; d = √(4 × 196,35 / π) ≈ 15,81 mm.' },
            { id: 'opt_1_2', text: 'Diâmetro interno mínimo de 10,0 mm.', isCorrect: false, feedback: 'Incorreto. 10 mm geraria uma área de apenas 78,5 mm², resultando em 100% de ocupação.' },
            { id: 'opt_1_3', text: 'Diâmetro interno mínimo de 25,4 mm.', isCorrect: false, feedback: 'Incorreto. 25,4 mm atende mas não é o valor mínimo analítico estrito.' },
            { id: 'opt_1_4', text: 'Diâmetro interno mínimo de 8,5 mm.', isCorrect: false, feedback: 'Incorreto. Os 4 cabos sequer caberiam fisicamente dentro dessa dimensão.' }
          ]
        },
        {
          id: 'elec_m3_ec4_q2_raio_curvatura_instalacao',
          type: 'multiple_choice',
          question: 'Um cabo de potência trifásico tetrapolar não armado com isolamento em XLPE possui diâmetro externo total de D = 32 mm. Durante a instalação em leito de cabos com mudança de direção horizontal a 90°, qual deve ser o raio interno de curvatura mínimo R_min a ser respeitado para não deformar o isolante nem fissurar a blindagem metálica?',
          scenario: 'Critérios mecânicos de curvatura na montagem de linhas elétricas industriais.',
          norma: 'Boas Práticas de Engenharia e Padrões Industriais de Mercado',
          points: 33,
          explanation: 'Pelas Boas Práticas e normas de fabricação de cabos (IEC 60502), o raio interno de curvatura mínimo para cabos multipolares de baixa tensão não armados é de 6 a 8 vezes o diâmetro externo (D). Adotando o padrão seguro de 8 × D: R_min = 8 × 32 mm = 256 mm (ou aproximadamente 25 a 30 cm). Curvaturas com raio inferior estrangulam a capa e geram pontos quentes por compressão do dielétrico.',
          keyTakeaway: 'R_min = 8 × D_ext: Para um cabo de 32 mm de diâmetro, o raio de curvatura não pode ser inferior a 256 mm (≈ 26 cm).',
          options: [
            { id: 'opt_2_1', text: 'Raio interno mínimo de 256 mm (aproximadamente 26 cm).', isCorrect: true, feedback: 'Excelente! R_min = 8 × 32 mm = 256 mm, preservando a integridade física do isolamento dielétrico.' },
            { id: 'opt_2_2', text: 'Raio interno mínimo de 32 mm (curvatura em quina viva de 1 × D).', isCorrect: false, feedback: 'Incorreto e destrutivo! Dobrar um cabo de 32 mm em quina viva rompe a isolação e causa curto-circuito iminente.' },
            { id: 'opt_2_3', text: 'Raio interno mínimo de 64 mm (2 × D).', isCorrect: false, feedback: 'Incorreto. 2 × D causa deformação permanente e microfissuras na camada externa.' },
            { id: 'opt_2_4', text: 'Raio interno mínimo de 1200 mm (1,2 metros).', isCorrect: false, feedback: 'Incorreto. Raio excessivo aplicável apenas a cabos de alta tensão com isolamento especial de chumbo.' }
          ]
        },
        {
          id: 'elec_m3_ec4_q3_segregacao_forca_controle',
          type: 'multiple_choice',
          question: 'Em uma esteira de cabos industrial de 400 mm de largura, é necessário instalar circuitos de força trifásicos de 400 V alimentando inversores de frequência e cabos de instrumentação analógica de 4-20 mA que ligam transmissores de pressão a um CLP. Qual é o procedimento técnico obrigatório para prevenir interferências eletromagnéticas (EMI) e garantir a conformidade da instalação?',
          scenario: 'Compatibilidade eletromagnética e roteamento seguro de sinais em infraestruturas industriais.',
          norma: 'Boas Práticas de Engenharia e Padrões Industriais de Mercado',
          points: 34,
          explanation: 'Pelas regras de compatibilidade eletromagnética (EMC) e Boas Práticas Industriais, circuitos de potência com ruído de comutação PWM (como saídas de inversores) devem ser fisicamente separados de circuitos de sinal de medição sensíveis (4-20 mA). A prática correta exige separação física mínima de 20 a 30 cm ou a instalação de um septo divisor metálico contínuo aterrado ao longo de toda a esteira, além do uso de cabos de sinal com par trançado e malha de blindagem aterrada em ponto único.',
          keyTakeaway: 'Segregação de condutos: Cabos de potência e cabos de instrumentação 4-20 mA exigem separação física ou septo metálico aterrado para evitar indução eletromagnética.',
          options: [
            { id: 'opt_3_1', text: 'Instalar septo metálico contínuo aterrado ou manter separação física mínima de 20 a 30 cm, utilizando cabos de instrumentação blindados.', isCorrect: true, feedback: 'Perfeito! O septo metálico aterrado atua como blindagem eletrostática e magnética eficaz contra ruídos de comutação.' },
            { id: 'opt_3_2', text: 'Amarrar os cabos de 4-20 mA diretamente sobre os cabos de força do inversor para economizar abraçadeiras.', isCorrect: false, feedback: 'Gravíssimo erro! Os pulsos de alta frequência do inversor destruiriam o sinal do transmissor por indução mútua.' },
            { id: 'opt_3_3', text: 'Aumentar a tensão dos transmissores para 400 V para que os sinais fiquem compatíveis.', isCorrect: false, feedback: 'Totalmente absurdo! Explodiria imediatamente os módulos de entrada analógica do CLP.' },
            { id: 'opt_3_4', text: 'Enrolar fita isolante plástica comum em volta de todos os cabos juntos.', isCorrect: false, feedback: 'Incorreto. Fita plástica comum não oferece nenhuma blindagem contra campos eletromagnéticos.' }
          ]
        }
      ]
    }
  ]
};
