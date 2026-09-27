import { AcademyModule } from '../types/academy';

// ============================================================================
// MÓDULO 1: PRINCÍPIOS DA FÍSICA ELÉTRICA & LEIS FUNDAMENTAIS
// Padrão Didático Avançado - Academia TécnicaMZ & Sara IA
// Boas Práticas de Engenharia e Padrões Industriais de Mercado
// ============================================================================

export const MODULE_1_FISICA: AcademyModule = {
  id: 'elec_mod_1_fisica',
  area: 'eletrotecnica',
  order: 1,
  title: 'Módulo 1: Princípios da Física Elétrica & Leis Fundamentais',
  description: 'Eletrostática, Carga e Campo Elétrico, Tensão e Leis de Ohm, Variação Térmica de Condutores, Leis de Kirchhoff e Teoremas de Thévenin, Norton e Superposição em CC.',
  icon: 'Zap',
  normasReferencia: [
    'Boas Práticas de Engenharia e Padrões Industriais de Mercado',
    'IEC 60027',
    'IEC 60038'
  ],
  lessons: [
    // ------------------------------------------------------------------------
    // ELEMENTO 1.1: Eletrostática, Carga Elétrica, Campo Elétrico e Potencial
    // ------------------------------------------------------------------------
    {
      id: 'elec_m1_ec1_eletrostatica_potencial',
      moduleId: 'elec_mod_1_fisica',
      moduleTitle: 'Módulo 1: Princípios da Física Elétrica & Leis Fundamentais',
      order: 1,
      code: 'EC 1.1',
      title: 'Eletrostática, Carga Elétrica, Campo Elétrico e Potencial',
      norma: 'Boas Práticas de Engenharia e Padrões Industriais de Mercado',
      level: 'Básico',
      durationMinutes: 16,
      theory: {
        conceito: 'A Eletrostática estuda as cargas elétricas em repouso e as forças e campos que interagem entre elas. Toda matéria é constituída de átomos formados por prótons (carga positiva), elétrons (carga negativa de valor elementar e = 1,602 × 10⁻¹⁹ C) e nêutrons. A carga elétrica é uma grandeza quantizada (Q = n·e) e conservativa: em um sistema eletricamente isolado, a soma algébrica das cargas permanece constante. A interação entre duas cargas pontuais em repouso é governada pela Lei de Coulomb (F = k·|q₁·q₂|/r²). Uma carga gera ao seu redor um Campo Elétrico (E = F/q), que representa a força exercida por unidade de carga de teste. Em placas condutoras paralelas, o campo elétrico é uniforme (E = V/d). O Potencial Elétrico (V = W/q) quantifica a energia potencial eletrostática por unidade de carga, medido em Volts (Joules por Coulomb). Todo meio isolante possui uma rigidez dielétrica máxima (campo elétrico crítico, tipicamente 3 kV/mm no ar); quando esse limite é superado, ocorre a ruptura dielétrica com ionização do meio e formação de arco elétrico violento.',
        formulas: [
          {
            label: 'Carga Elétrica e Quantização',
            formula: 'Q = I × t = n × e',
            explicacao: 'Carga total em Coulombs (C), onde e = 1,602 × 10⁻¹⁹ C é a carga elementar'
          },
          {
            label: 'Lei de Coulomb Eletrostática',
            formula: 'F = k_e × (|q₁ × q₂| / r²)',
            explicacao: 'Força em Newtons (N), com constante eletrostática k_e ≈ 8,99 × 10⁹ N·m²/C²'
          },
          {
            label: 'Intensidade de Campo Elétrico Uniforme',
            formula: 'E = V / d',
            explicacao: 'Gradiente de potencial entre condutores (V/m ou V/mm), indicador de risco de arco'
          },
          {
            label: 'Trabalho e Energia Potencial Eletrostática',
            formula: 'W = Q × ΔV',
            explicacao: 'Trabalho em Joules (J) necessário para deslocar uma carga Q sob ddp ΔV'
          }
        ],
        pontosOperacionais: [
          'Gaiola de Faraday e Blindagem Eletrostática: condutores ocos mantêm campo elétrico interno estritamente nulo (E = 0); cabos de sinal analógico e inversores VFD devem possuir malha trançada aterrada em ponto único para repelir ruídos eletrostáticos induzidos.',
          'Descargas Eletrostáticas (ESD): o corpo humano acumula tensões eletrostáticas de até 15.000 V pelo atrito com solados e ar seco; antes de tocar em placas eletrônicas ou cartões CLP, é mandatório usar pulseira antiestática dissipativa aterrada.',
          'Efeito das Pontas e Descarga Corona: o campo elétrico se concentra exponencialmente em quinas vivas e pontas condutoras, superando a rigidez dielétrica do ar; barramentos de média tensão e painéis devem possuir bordas arredondadas e afastamentos dielétricos rigorosos.',
          'Afastamento Seguro em Painéis: ar seco possui rigidez dielétrica de ~3 kV/mm, porém sob umidade litorânea e poeira cai para menos de 1 kV/mm; manter distâncias de isolamento no ar (clearance) e de escoamento (creepage) conforme os padrões de engenharia.'
        ],
        fieldCase: {
          localizacao: 'Subestação Industrial de Boane, Província de Maputo',
          cenario: 'Em um painel de média tensão de 11 kV com barramentos nus de cobre sob alta umidade (88%), foram constatados ruídos audíveis de centelhamento (zumbido de rádio e estalos) e odor característico de ozônio (O₃), com formação de arcos pontuais entre fases.',
          diagnostico: 'As barras metálicas foram cortadas com rebarbas pontiagudas e instaladas com separação de apenas 32 mm. O efeito das pontas elevou a intensidade de campo elétrico local além de 3,5 kV/mm, excedendo a rigidez dielétrica do ar úmido e deflagrando efeito corona e pré-arcos luminosos.',
          solucaoNormativa: 'Desenergização e bloqueio LOTO, lixamento e arredondamento rigoroso de todas as arestas vivas das barras condutoras, aplicação de tubos termorretráteis de poliolefina isolante para 15 kV e ampliação do espaçamento livre entre fases para 120 mm, restabelecendo o gradiente seguro de campo elétrico segundo as Boas Práticas de Engenharia e Padrões Industriais de Mercado.'
        },
        funcionamento: 'A distribuição de cargas em condutores em equilíbrio reside exclusivamente em sua superfície externa. Em regime estático, não há corrente circulando no interior do metal, o que torna o potencial elétrico rigorosamente constante em toda a peça condutora (superfície equipotencial). Na indústria, controlar campos elétricos e evitar acúmulo estático previne incêndios em atmosferas explosivas e protege semicondutores ultrassensíveis.',
        aplicacaoMocambique: 'Nas regiões litorâneas de Moçambique (Maputo, Beira, Nacala), a névoa salina combinada à umidade do ar deposita uma camada condutiva higroscópica sobre isoladores de porcelana e epóxi. O gradiente de potencial da linha ioniza a película superficial, provocando centelhamento (flashover). A manutenção preventiva requer lavagem desenergizada e aplicação de graxa de silicone nos isoladores.',
        exemploPratico: 'Em um filtro eletrostático de emissões industriais, aplica-se uma ddp de 30.000 V CC entre fios centrais e placas coletoras espaçadas de 100 mm. O campo resultante é E = 30.000 / 0,10 = 300.000 V/m (300 kV/m), suficiente para ionizar o ar e polarizar partículas de poeira de carvão, fazendo-as migrar e fixar nas placas metálicas.',
        calculationSnippet: 'E = V / d | W = Q × ΔV | Q = I × t'
      },
      quiz: {
        question: 'Uma corrente contínua de 4,0 A flui através de um condutor de cobre durante 2,5 minutos (150 segundos). Qual é a carga total Q transportada em Coulombs e o número aproximado de elétrons livres que atravessaram a seção reta do condutor (considere e = 1,602 × 10⁻¹⁹ C)?',
        options: [
          { id: 'A', text: 'Q = 10 C e n = 6,24 × 10¹⁹ elétrons.', isCorrect: false, feedback: 'Incorreto. Multiplicou a corrente pelo tempo em minutos (4 × 2,5 = 10) sem converter minutos para segundos.' },
          { id: 'B', text: 'Q = 600 C e n = 3,75 × 10²¹ elétrons.', isCorrect: true, feedback: 'Correto! Q = I × t = 4,0 A × 150 s = 600 C. O número de elétrons é n = Q / e = 600 / (1,602 × 10⁻¹⁹) ≈ 3,75 × 10²¹ elétrons.' },
          { id: 'C', text: 'Q = 37,5 C e n = 1,50 × 10²⁰ elétrons.', isCorrect: false, feedback: 'Incorreto. Erro de cálculo na relação entre corrente, tempo e carga fundamental.' },
          { id: 'D', text: 'Q = 600 C e n = 9,60 × 10⁻¹⁷ elétrons.', isCorrect: false, feedback: 'Incorreto. Multiplicou a carga elementar em vez de dividir 600 C pela carga elementar.' }
        ],
        explanation: 'Pela definição fundamental de corrente elétrica, a carga é o produto da corrente pelo tempo no Sistema Internacional: Q = I × t = 4,0 A × 150 s = 600 Coulombs. O número de portadores de carga elementar que constitui essa carga é dado por n = Q / e = 600 / (1,602 × 10⁻¹⁹) = 3,745 × 10²¹ elétrons livres.',
        keyTakeaway: 'Q = I × t e n = Q / e: 4 A em 150 s equivalem a 600 C ou 3,75 × 10²¹ elétrons.',
        xpReward: 50
      },
      assessmentQuestions: [
        {
          id: 'elec_m1_ec1_q1_carga_eletrons',
          type: 'multiple_choice',
          question: 'Uma corrente contínua de 4,0 A flui através de um condutor de cobre durante 2,5 minutos (150 segundos). Qual é a carga total Q transportada em Coulombs e o número aproximado de elétrons livres que atravessaram a seção reta do condutor (considere e = 1,602 × 10⁻¹⁹ C)?',
          scenario: 'Cálculo de transporte de carga em condutor metálico sob regime de corrente contínua constante.',
          norma: 'Boas Práticas de Engenharia e Padrões Industriais de Mercado',
          points: 33,
          explanation: 'Q = I × t = 4,0 A × 150 s = 600 C. Como cada elétron possui e = 1,602 × 10⁻¹⁹ C, o total de partículas é n = 600 / (1,602 × 10⁻¹⁹) ≈ 3,75 × 10²¹ elétrons.',
          keyTakeaway: 'Q = I × t: No SI o tempo deve ser sempre em segundos; 4 A em 150 s transportam 600 C.',
          options: [
            { id: 'opt_1_1', text: 'Q = 600 C e n = 3,75 × 10²¹ elétrons.', isCorrect: true, feedback: 'Correto! 4,0 A × 150 s = 600 C; 600 / (1,602 × 10⁻¹⁹) = 3,75 × 10²¹ elétrons.' },
            { id: 'opt_1_2', text: 'Q = 10 C e n = 6,24 × 10¹⁹ elétrons.', isCorrect: false, feedback: 'Incorreto. O tempo foi mantido em minutos (2,5 min) em vez de ser convertido para 150 segundos.' },
            { id: 'opt_1_3', text: 'Q = 375 C e n = 2,34 × 10²¹ elétrons.', isCorrect: false, feedback: 'Incorreto. Houve engano nas operações aritméticas básicas.' },
            { id: 'opt_1_4', text: 'Q = 600 C e n = 9,61 × 10⁻¹⁷ elétrons.', isCorrect: false, feedback: 'Incorreto. A carga elementar foi multiplicada pela carga total em vez de ser o divisor.' }
          ]
        },
        {
          id: 'elec_m1_ec1_q2_campo_disrupcao',
          type: 'multiple_choice',
          question: 'Em um painel de comando em corrente contínua, dois barramentos planos paralelos operam sob uma ddp de 1500 V CC. Sabendo que a rigidez dielétrica do ar atmosférico local é de 3000 V/mm, qual é a distância mínima de separação d para que a intensidade do campo elétrico não ultrapasse 50% do limite de ruptura dielétrica (adotando fator de segurança de 2, ou seja, E_admissível = 1500 V/mm)?',
          scenario: 'Dimensionamento do isolamento no ar (clearance) contra arcos elétricos em cubículos elétricos de CC.',
          norma: 'Boas Práticas de Engenharia e Padrões Industriais de Mercado',
          points: 33,
          explanation: 'Para placas paralelas, o campo é uniforme: E = V / d. Isolando a distância: d = V / E. Com E_admissível = 1500 V/mm e V = 1500 V, obtemos d = 1500 V / 1500 V/mm = 1,0 mm.',
          keyTakeaway: 'd = V / E: A distância de isolamento dielétrico é inversamente proporcional ao campo elétrico máximo admissível.',
          options: [
            { id: 'opt_2_1', text: 'd = 1,0 mm (ou 0,001 m).', isCorrect: true, feedback: 'Correto! d = V / E_admissível = 1500 V / 1500 V/mm = 1,0 mm.' },
            { id: 'opt_2_2', text: 'd = 0,5 mm (ou 0,0005 m).', isCorrect: false, feedback: 'Incorreto. 0,5 mm geraria um campo de 3000 V/mm, atingindo 100% da rigidez dielétrica sem nenhuma margem de segurança.' },
            { id: 'opt_2_3', text: 'd = 2,0 mm (ou 0,002 m).', isCorrect: false, feedback: 'Incorreto. 2,0 mm limitaria o campo a 750 V/mm (fator de segurança 4), acima do critério estipulado de 50%.' },
            { id: 'opt_2_4', text: 'd = 4,5 mm (ou 0,0045 m).', isCorrect: false, feedback: 'Incorreto. Multiplicou a ddp pela rigidez sem aplicar a relação dimensional correta.' }
          ]
        },
        {
          id: 'elec_m1_ec1_q3_trabalho_potencial',
          type: 'multiple_choice',
          question: 'Em um sistema industrial de purificação eletrostática, uma carga pontual positiva Q = 2,5 mC (2,5 × 10⁻³ C) é deslocada entre duas superfícies equipotenciais, movendo-se de um potencial inicial V_A = 200 V para um potencial mais elevado V_B = 1400 V. Qual é o trabalho elétrico W realizado pela força externa contra as forças do campo eletrostático?',
          scenario: 'Cálculo de trabalho elétrico e energia potencial eletrostática em sistemas eletrostáticos industriais.',
          norma: 'Boas Práticas de Engenharia e Padrões Industriais de Mercado',
          points: 34,
          explanation: 'O trabalho realizado por uma força externa contra o campo é W = Q × ΔV = Q × (V_B - V_A). Calculando a ddp: ΔV = 1400 V - 200 V = 1200 V. Então: W = 2,5 × 10⁻³ C × 1200 V = 3,0 Joules.',
          keyTakeaway: 'W = Q × ΔV: O trabalho contra o campo depende apenas do valor da carga e da diferença de potencial entre as superfícies equipotenciais.',
          options: [
            { id: 'opt_3_1', text: 'W = 3,0 Joules.', isCorrect: true, feedback: 'Excelente! ΔV = 1400 - 200 = 1200 V; W = 2,5 × 10⁻³ C × 1200 V = 3,0 J.' },
            { id: 'opt_3_2', text: 'W = 3,5 Joules.', isCorrect: false, feedback: 'Incorreto. Usou 1400 V direto sem subtrair o potencial inicial de 200 V (2,5 mC × 1400 V = 3,5 J).' },
            { id: 'opt_3_3', text: 'W = 0,5 Joules.', isCorrect: false, feedback: 'Incorreto. Calculou 200 V × 2,5 mC em vez de considerar a ddp total de 1200 V.' },
            { id: 'opt_3_4', text: 'W = 3000 Joules.', isCorrect: false, feedback: 'Incorreto. Esqueceu de converter miliCoulombs (10⁻³) para Coulombs no SI.' }
          ]
        }
      ]
    },

    // ------------------------------------------------------------------------
    // ELEMENTO 1.2: Tensão (DDP), Corrente Elétrica e Resistência (Lei de Ohm)
    // ------------------------------------------------------------------------
    {
      id: 'elec_m1_ec2_tensao_corrente_ohm',
      moduleId: 'elec_mod_1_fisica',
      moduleTitle: 'Módulo 1: Princípios da Física Elétrica & Leis Fundamentais',
      order: 2,
      code: 'EC 1.2',
      title: 'Tensão (DDP), Corrente Elétrica e Resistência (Lei de Ohm)',
      norma: 'Boas Práticas de Engenharia e Padrões Industriais de Mercado',
      level: 'Básico',
      durationMinutes: 16,
      theory: {
        conceito: 'A Corrente Elétrica (I, em Amperes) é o fluxo ordenado de portadores de carga através de uma seção transversal de um condutor por unidade de tempo (I = dq/dt). A Diferença de Potencial Elétrico ou Tensão (V, em Volts) é a força eletromotriz que impele e orienta esses portadores ao longo do circuito. A Resistência Elétrica (R, em Ohms Ω) é a oposição física que o meio material impõe ao livre movimento dos elétrons livres devido a colisões atômicas. A 1ª Lei de Ohm estipula que, em condutores ôhmicos mantidos a temperatura constante, a intensidade da corrente é diretamente proporcional à ddp aplicada e inversamente proporcional à resistência do condutor (V = I·R). A 2ª Lei de Ohm estabelece as dimensões físicas da resistência: R = ρ·(L / S), onde ρ é a resistividade do material (para o cobre eletrolítico ρ = 0,0178 Ω·mm²/m a 20°C), L é o comprimento do circuito e S é a seção transversal. A potência elétrica dissipada por efeito Joule em uma resistência pura em CC é dada por P = V·I = R·I² = V²/R (em Watts).',
        formulas: [
          {
            label: '1ª Lei de Ohm Fundamental',
            formula: 'V = I × R \t| \tI = V / R \t| \tR = V / I',
            explicacao: 'Relação linear estrita entre tensão (V), corrente (A) e resistência ôhmica (Ω)'
          },
          {
            label: '2ª Lei de Ohm (Dimensões Físicas)',
            formula: 'R = ρ × (L / S)',
            explicacao: 'ρ cobre = 0,0178 Ω·mm²/m; L em metros; S em milímetros quadrados (mm²)'
          },
          {
            label: 'Potência Elétrica Ativa em CC (Joule)',
            formula: 'P = V × I = R × I² = V² / R',
            explicacao: 'Potência dissipada em calor por unidade de tempo em regime contínuo (Watts)'
          },
          {
            label: 'Densidade de Corrente Elétrica',
            formula: 'J = I / S',
            explicacao: 'Densidade de corrente em A/mm², parâmetro essencial para dimensionar barramentos'
          }
        ],
        pontosOperacionais: [
          'Diferenciação Prática de Estados do Circuito: Circuito Normal (carga absorve corrente calculada In), Circuito Aberto (R = ∞, I = 0 A, tensão plena da fonte nos terminais abertos) e Curto-Circuito (R ≈ 0 Ω, I atinge picos de milhares de Amperes limitados apenas pela resistência interna da fonte).',
          'Regra de Ouro da Medição de Resistência: medir resistência ou continuidade SEMPRE com o circuito 100% desenergizado e capacitores descarregados; aplicar tensão nos bornes de ohmímetro queima o fusível cerâmico de proteção.',
          'Queda de Tensão Admissível em CC: condutores longos em CC (linhas de baterias, usinas solares) apresentam queda ôhmica cumulativa (ΔV = R·I); as boas práticas industriais limitam a queda a no máximo 1% a 2% em alimentadores de potência.',
          'Densidade de Corrente em Barramentos: em barras de cobre maciço em painéis CC, adota-se densidade conservadora de 1,5 a 2,5 A/mm² para garantir operação contínua abaixo de 65°C.'
        ],
        fieldCase: {
          localizacao: 'Parque Industrial da Matola, Província de Maputo',
          cenario: 'Um banco de resistores de frenagem dinâmica de 12 kW alimentado por barramento CC de 600 V apresentava aquecimento excessivo nos condutores de alimentação de 4 mm² com comprimento de 45 metros (90 metros de ida e volta).',
          diagnostico: 'A corrente contínua nominal era I = P / V = 12000 / 600 = 20 A. A resistência total dos cabos a 20°C era R = 0,0178 × (90 / 4) = 0,4005 Ω. Sob 20 A, a queda de tensão era ΔV = 0,4005 × 20 = 8,01 V e a potência dissipada nos cabos confinada em duto fechado atingia P_perda = 0,4005 × 20² = 160,2 W, degradando o isolamento de PVC.',
          solucaoNormativa: 'Substituição da fiação por condutores de cobre de 10 mm² conforme as Boas Práticas de Engenharia e Padrões Industriais de Mercado, reduzindo a resistência para 0,16 Ω e a perda térmica nos cabos para 64 W, cessando o superaquecimento.'
        },
        funcionamento: 'A corrente elétrica em metais resulta da migração macroscópica de elétrons livres sob o efeito de um campo elétrico interno imposto pela diferença de potencial. Embora a velocidade individual caótica dos elétrons seja próxima à da luz, a velocidade de deriva média no sentido da corrente é da ordem de frações de milímetro por segundo. A energia elétrica, contudo, é transferida pelo campo eletromagnético quase instantaneamente.',
        aplicacaoMocambique: 'Em sistemas solares isolados (off-grid) de telecomunicações no interior de Moçambique que operam em 24 V ou 48 V CC, a corrente para alimentar potências elevadas é muito mais alta do que em redes de 230 V. Ignorar a 2ª Lei de Ohm e usar cabos finos provoca quedas de tensão superiores a 15%, desligando inversores por alarme de subtensão na bateria.',
        exemploPratico: 'Um banco de baterias de 48 V alimenta uma carga de telecomunicações de 960 W a 30 metros de distância (60 m de percurso de cabo). Corrente I = 960 / 48 = 20 A. Com cabo de 6 mm²: R = 0,0178 × 60 / 6 = 0,178 Ω. Queda de tensão ΔV = 20 × 0,178 = 3,56 V (queda de 7,4%, excessiva). Com cabo de 16 mm²: R = 0,0667 Ω e ΔV = 1,33 V (queda de 2,7%, perfeitamente segura).',
        calculationSnippet: 'V = I × R | R = ρ × (L / S) | P = V × I = R × I²'
      },
      quiz: {
        question: 'Um resistor industrial de aquecimento opera sob uma linha de alimentação contínua de 120 V CC e possui uma resistência ôhmica medida de 15 Ω. Qual é a intensidade da corrente contínua I que atravessa o resistor e qual é a potência térmica P dissipada continuamente por efeito Joule?',
        options: [
          { id: 'A', text: 'I = 8,0 A e P = 960 W.', isCorrect: true, feedback: 'Correto! Pela Lei de Ohm: I = V / R = 120 V / 15 Ω = 8,0 A. Potência P = V × I = 120 V × 8,0 A = 960 W (ou P = R × I² = 15 × 64 = 960 W).' },
          { id: 'B', text: 'I = 0,125 A e P = 15 W.', isCorrect: false, feedback: 'Incorreto. Dividiu a resistência pela tensão (15 / 120) invertendo a 1ª Lei de Ohm.' },
          { id: 'C', text: 'I = 8,0 A e P = 1800 W.', isCorrect: false, feedback: 'Incorreto. Multiplicou a corrente incorretamente no cálculo da potência.' },
          { id: 'D', text: 'I = 1800 A e P = 216 kW.', isCorrect: false, feedback: 'Incorreto. Multiplicou a tensão pela resistência em vez de dividir.' }
        ],
        explanation: 'Pela 1ª Lei de Ohm, isolando a corrente: I = V / R = 120 V / 15 Ω = 8,0 A. Pela equação da potência de Joule em regime contínuo: P = V × I = 120 V × 8,0 A = 960 Watts (0,96 kW). Como conferência: P = R × I² = 15 × 8² = 15 × 64 = 960 W.',
        keyTakeaway: 'I = V / R e P = V × I: 120 V aplicados em 15 Ω produzem 8 A e dissipam 960 W.',
        xpReward: 50
      },
      assessmentQuestions: [
        {
          id: 'elec_m1_ec2_q1_ohm_potencia',
          type: 'multiple_choice',
          question: 'Um resistor industrial de aquecimento opera sob uma linha de alimentação contínua de 120 V CC e possui uma resistência ôhmica medida de 15 Ω. Qual é a intensidade da corrente contínua I que atravessa o resistor e qual é a potência térmica P dissipada continuamente por efeito Joule?',
          scenario: 'Cálculo de corrente e dissipação térmica por efeito Joule em cargas resistivas puras em corrente contínua.',
          norma: 'Boas Práticas de Engenharia e Padrões Industriais de Mercado',
          points: 33,
          explanation: 'Pela 1ª Lei de Ohm: I = V / R = 120 / 15 = 8,0 A. A potência térmica dissipada é P = V × I = 120 × 8,0 = 960 W (ou P = R × I² = 15 × 64 = 960 W).',
          keyTakeaway: 'I = V / R e P = V × I: A potência em regime puramente resistivo CC é o produto direto da ddp pela corrente.',
          options: [
            { id: 'opt_21_1', text: 'I = 8,0 A e P = 960 W.', isCorrect: true, feedback: 'Correto! I = 120 / 15 = 8,0 A; P = 120 × 8 = 960 W.' },
            { id: 'opt_21_2', text: 'I = 0,125 A e P = 15 W.', isCorrect: false, feedback: 'Incorreto. Dividiu a resistência pela tensão (15 / 120), violando a 1ª Lei de Ohm.' },
            { id: 'opt_21_3', text: 'I = 8,0 A e P = 1800 W.', isCorrect: false, feedback: 'Incorreto. Erro de cálculo na potência dissipada.' },
            { id: 'opt_21_4', text: 'I = 15 A e P = 1800 W.', isCorrect: false, feedback: 'Incorreto. Considerou a corrente numericamente igual à resistência.' }
          ]
        },
        {
          id: 'elec_m1_ec2_q2_segunda_lei_queda',
          type: 'multiple_choice',
          question: 'Um cabo de cobre com comprimento total de ida e volta L = 80 metros e seção transversal S = 2,5 mm² opera sob corrente contínua a 20°C (resistividade do cobre ρ = 0,0178 Ω·mm²/m). Se o circuito transportar uma corrente de carga constante de 16 A CC, qual é a resistência ôhmica total R do cabo e a respectiva queda de tensão ΔV provocada pela linha?',
          scenario: 'Dimensionamento da resistência de fiação e verificação de queda de tensão em circuitos terminais de CC.',
          norma: 'Boas Práticas de Engenharia e Padrões Industriais de Mercado',
          points: 33,
          explanation: 'Pela 2ª Lei de Ohm: R = ρ × (L / S) = 0,0178 × (80 / 2,5) = 0,0178 × 32 = 0,5696 Ω ≈ 0,57 Ω. A queda de tensão provocada pela corrente de carga é ΔV = R × I = 0,5696 Ω × 16 A = 9,1136 V ≈ 9,1 V.',
          keyTakeaway: 'R = ρ × (L / S) e ΔV = R × I: 80 m de cabo de 2,5 mm² possuem ~0,57 Ω e provocam ~9,1 V de queda a 16 A.',
          options: [
            { id: 'opt_22_1', text: 'R ≈ 0,57 Ω e ΔV ≈ 9,1 V.', isCorrect: true, feedback: 'Excelente! R = 0,0178 × 80 / 2,5 = 0,5696 Ω; ΔV = 0,5696 × 16 = 9,11 V.' },
            { id: 'opt_22_2', text: 'R ≈ 1,42 Ω e ΔV ≈ 22,8 V.', isCorrect: false, feedback: 'Incorreto. Inverteu o cálculo dividindo a seção pelo comprimento.' },
            { id: 'opt_22_3', text: 'R ≈ 0,057 Ω e ΔV ≈ 0,91 V.', isCorrect: false, feedback: 'Incorreto. Erro de casa decimal na multiplicação pela resistividade.' },
            { id: 'opt_22_4', text: 'R ≈ 0,57 Ω e ΔV ≈ 2,28 V.', isCorrect: false, feedback: 'Incorreto. Dividiu a queda de tensão por 4 sem fundamento físico.' }
          ]
        },
        {
          id: 'elec_m1_ec2_q3_resistencia_fonte_cc',
          type: 'multiple_choice',
          question: 'Uma fonte de alimentação estabilizada em corrente contínua fornece uma tensão constante de 48 V a um elemento resistivo industrial que deve dissipar exatamente 240 W de potência ativa. Qual deve ser o valor nominal da resistência ôhmica R desse elemento e qual é a corrente de regime contínuo I drenada da fonte?',
          scenario: 'Dimensionamento de impedância de carga resistiva e demanda de corrente em fontes CC.',
          norma: 'Boas Práticas de Engenharia e Padrões Industriais de Mercado',
          points: 34,
          explanation: 'Da equação da potência P = V × I, temos I = P / V = 240 W / 48 V = 5,0 A. Pela Lei de Ohm: R = V / I = 48 V / 5,0 A = 9,6 Ω (ou diretamente por R = V² / P = 48² / 240 = 2304 / 240 = 9,6 Ω).',
          keyTakeaway: 'R = V² / P e I = P / V: Para 240 W em 48 V, a corrente é de 5,0 A e a resistência deve ser exatamente 9,6 Ω.',
          options: [
            { id: 'opt_23_1', text: 'R = 9,6 Ω e I = 5,0 A.', isCorrect: true, feedback: 'Correto! I = 240 / 48 = 5,0 A; R = 48 / 5,0 = 9,6 Ω.' },
            { id: 'opt_23_2', text: 'R = 19,2 Ω e I = 2,5 A.', isCorrect: false, feedback: 'Incorreto. Resultaria em apenas 120 W de potência dissipada.' },
            { id: 'opt_23_3', text: 'R = 4,8 Ω e I = 10,0 A.', isCorrect: false, feedback: 'Incorreto. Com 4,8 Ω a corrente seria de 10 A e a potência atingiria 480 W (o dobro do pretendido).' },
            { id: 'opt_23_4', text: 'R = 9,6 Ω e I = 11,5 A.', isCorrect: false, feedback: 'Incorreto. A corrente calculada não é compatível com a Lei de Ohm sob 48 V.' }
          ]
        }
      ]
    },

    // ------------------------------------------------------------------------
    // ELEMENTO 1.3: Variação Térmica dos Condutores (Coeficiente de Temperatura)
    // ------------------------------------------------------------------------
    {
      id: 'elec_m1_ec3_variacao_termica_condutores',
      moduleId: 'elec_mod_1_fisica',
      moduleTitle: 'Módulo 1: Princípios da Física Elétrica & Leis Fundamentais',
      order: 3,
      code: 'EC 1.3',
      title: 'Variação Térmica dos Condutores (Coeficiente de Temperatura)',
      norma: 'Boas Práticas de Engenharia e Padrões Industriais de Mercado',
      level: 'Básico',
      durationMinutes: 16,
      theory: {
        conceito: 'A resistência elétrica de condutores metálicos não é uma constante estática: ela varia diretamente com a temperatura do material. Nos metais puros como o cobre e o alumínio, o aquecimento intensifica a amplitude da agitação térmica dos íons da rede cristalina, aumentando a frequência de colisões dos elétrons de condução (espalhamento elétron-fônon) e elevando a resistividade. Essa dependência térmica é caracterizada pelo Coeficiente de Temperatura da Resistência (α), definido como a variação fracionária da resistência por grau Celsius de alteração de temperatura. Para o cobre recozido padrão internacional (IACS a 20°C), α₂₀ ≈ +0,00393 / °C (aproximadamente +0,4% por grau Celsius de elevação). A resistência em uma temperatura T qualquer é calculada por R(T) = R₀·[1 + α₀·(T - T₀)]. Alternativamente, utiliza-se a temperatura extrapolada de resistência nula do cobre (-234,5 °C), pela relação clássica R₂ / R₁ = (234,5 + T₂) / (234,5 + T₁). O aumento de resistência gera um ciclo vicioso em linhas com alta carga: mais resistência gera mais calor por Joule (P = R·I²), que aquece mais o cabo, elevando ainda mais a resistência e a queda de tensão.',
        formulas: [
          {
            label: 'Equação Linear de Variação Térmica',
            formula: 'R(T) = R₀ × [1 + α₀ × (T - T₀)]',
            explicacao: 'α cobre = +0,00393 / °C a 20°C; T e T₀ em graus Celsius (°C)'
          },
          {
            label: 'Relação Infeirda de Temperatura Zero (Cobre)',
            formula: 'R₂ / R₁ = (234,5 + T₂) / (234,5 + T₁)',
            explicacao: 'Fórmula direta exata para o cobre eletrolítico sem aproximação linear'
          },
          {
            label: 'Variação Absoluta de Resistência',
            formula: 'ΔR = R₀ × α₀ × ΔT',
            explicacao: 'Acréscimo de resistência ôhmica devido ao gradiente térmico ΔT'
          },
          {
            label: 'Elevação da Perda Joule por Aquecimento',
            formula: 'ΔP_Joule = ΔR × I²',
            explicacao: 'Perda adicional em Watts em condutores operando sob calor elevado'
          }
        ],
        pontosOperacionais: [
          'Impacto Severo em Condutores sob Clima Tropical: Em regiões com temperaturas ambiente de 40°C a 45°C e radiação solar direta em bandejas (como Tete e Manica), a resistência dos condutores sobe até 15% acima do valor de catálogo a 20°C, agravando as quedas de tensão.',
          'Método de Variação de Resistência para Medição de Temperatura em Máquinas: Para determinar a temperatura interna inacessível de enrolamentos de motores e transformadores sob carga, mede-se a resistência a frio (R₁) e a resistência a quente (R₂), aplicando a fórmula do cobre para isolar T₂.',
          'Ligas de Coeficiente Térmico Quase Nulo: Shunts de amperímetros e resistores de precisão de bancada utilizam ligas especiais como manganina (Cu-Mn-Ni) e constantan (Cu-Ni), onde α ≈ 0,00001 / °C, mantendo a leitura calibrada mesmo quando quentes.',
          'Termistores Industriais e Sensores PT100: Enquanto metais possuem coeficiente positivo (PTC), semicondutores e termistores NTC possuem coeficiente negativo (a resistência cai com o calor); termoresistências industriais PT100 usam platina pura com α = +0,00385 / °C para monitorar rolamentos.'
        ],
        fieldCase: {
          localizacao: 'Mina de Carvão de Moatize, Província de Tete',
          cenario: 'Um circuito de alimentação de 110 V CC para bobinas de disparo de disjuntores de média tensão passava por eletrocalha metálica externa no teto de galpão exposta a sol intenso, atingindo 55°C de temperatura superficial no verão (contra 20°C nominais).',
          diagnostico: 'A resistência do circuito a 20°C era de 1,20 Ω. Sob 55°C (ΔT = 35°C), a resistência dos condutores de cobre subiu para R(55) = 1,20 × [1 + 0,00393 × 35] = 1,365 Ω (elevação de 13,8%). No momento do comando simultâneo de disparo de emergência com corrente de pico de 30 A, a queda de tensão na fiação passou de 36 V para 41 V, deixando menos de 69 V na bobina mais distante e impedindo sua abertura segura.',
          solucaoNormativa: 'Redimensionamento dos cabos para seção de 6 mm² prevendo temperatura de trabalho de 70°C e instalação de chapas defletoras de sombreamento solar sobre as eletrocalhas, reduzindo a resistência para 0,45 Ω e estabilizando a operação de acordo com as Boas Práticas de Engenharia e Padrões Industriais de Mercado.'
        },
        funcionamento: 'O coeficiente de temperatura positivo nos metais garante estabilidade térmica intrínseca sob tensão constante: se um ponto aquece, sua resistência aumenta, o que tende a diminuir a corrente naquele ponto (efeito autorregulador em paralelo). Contudo, em regime de corrente imposta (como geradores CC ou linhas de solda), o aumento da resistência gera aquecimento proporcional a R·I², podendo queimar o isolamento de PVC se os fatores de correção de temperatura não forem aplicados.',
        aplicacaoMocambique: 'A indústria moçambicana sofre com paradas não planejadas causadas por cabos subdimensionados que aquecem no pico do verão. Aplicar o fator de correção de temperatura ambiente e considerar a variação de resistência ôhmica do cobre é indispensável nos projetos industriais locais.',
        exemploPratico: 'Um motor elétrico trifásico tem resistência de enrolamento de 2,00 Ω a 20°C. Ao final do ensaio de aquecimento a plena carga, a resistência medida nos bornes subiu para 2,47 Ω. Pela equação do cobre: T₂ = (2,47 / 2,00) × (234,5 + 20) - 234,5 = 1,235 × 254,5 - 234,5 = 314,3 - 234,5 = 79,8 °C (elevação de quase 60°C acima do ambiente).',
        calculationSnippet: 'R(T) = R₀ × [1 + α × ΔT] | R₂ / R₁ = (234,5 + T₂) / (234,5 + T₁)'
      },
      quiz: {
        question: 'Uma bobina eletromagnética de freio industrial enrolada com condutor de cobre apresenta uma resistência ôhmica de 25,0 Ω em temperatura ambiente de 20 °C. Sabendo que o coeficiente térmico do cobre é α = 0,00393 / °C, qual será o valor de sua resistência ôhmica quando a bobina atingir sua temperatura operacional estável de 70 °C?',
        options: [
          { id: 'A', text: 'R(70) ≈ 29,91 Ω.', isCorrect: true, feedback: 'Correto! ΔT = 70 - 20 = 50 °C; R(70) = 25,0 × [1 + (0,00393 × 50)] = 25,0 × [1 + 0,1965] = 25,0 × 1,1965 = 29,9125 Ω ≈ 29,91 Ω.' },
          { id: 'B', text: 'R(70) ≈ 25,20 Ω.', isCorrect: false, feedback: 'Incorreto. Somou apenas o coeficiente sem multiplicar pela resistência original da bobina.' },
          { id: 'C', text: 'R(70) ≈ 35,00 Ω.', isCorrect: false, feedback: 'Incorreto. Superestimou a variação térmica considerando um coeficiente excessivo de 0,008 / °C.' },
          { id: 'D', text: 'R(70) ≈ 20,08 Ω.', isCorrect: false, feedback: 'Incorreto. A resistência dos metais aumenta com a temperatura (α positivo); não diminui.' }
        ],
        explanation: 'A variação de temperatura é ΔT = T - T₀ = 70 °C - 20 °C = 50 °C. Aplicando a fórmula de variação térmica: R(T) = R₀ × [1 + α × ΔT] = 25,0 × [1 + 0,00393 × 50] = 25,0 × [1 + 0,1965] = 25,0 × 1,1965 = 29,9125 Ω ≈ 29,91 Ω. A resistência aumentou quase 20% exclusivamente por efeito do calor.',
        keyTakeaway: 'R(T) = R₀ × [1 + α × ΔT]: A resistência do cobre sobe quase 0,4% por °C de aquecimento.',
        xpReward: 50
      },
      assessmentQuestions: [
        {
          id: 'elec_m1_ec3_q1_variacao_resistencia',
          type: 'multiple_choice',
          question: 'Uma bobina eletromagnética de freio industrial enrolada com condutor de cobre apresenta uma resistência ôhmica de 25,0 Ω em temperatura ambiente de 20 °C. Sabendo que o coeficiente térmico do cobre é α = 0,00393 / °C, qual será o valor de sua resistência ôhmica quando a bobina atingir sua temperatura operacional estável de 70 °C?',
          scenario: 'Cálculo de variação térmica de resistência em enrolamentos de cobre sob elevação de temperatura de regime.',
          norma: 'Boas Práticas de Engenharia e Padrões Industriais de Mercado',
          points: 33,
          explanation: 'ΔT = 70 - 20 = 50 °C. R(70) = R₀ × [1 + α × ΔT] = 25,0 × [1 + (0,00393 × 50)] = 25,0 × 1,1965 = 29,9125 Ω ≈ 29,91 Ω.',
          keyTakeaway: 'R(T) = R₀ × [1 + α × ΔT]: O cobre eleva sua resistência com o calor (α = +0,00393 / °C).',
          options: [
            { id: 'opt_31_1', text: 'R(70) ≈ 29,91 Ω.', isCorrect: true, feedback: 'Correto! 25,0 × (1 + 0,00393 × 50) = 29,9125 Ω.' },
            { id: 'opt_31_2', text: 'R(70) ≈ 25,20 Ω.', isCorrect: false, feedback: 'Incorreto. Somou a variação percentual de forma descalibrada.' },
            { id: 'opt_31_3', text: 'R(70) ≈ 35,00 Ω.', isCorrect: false, feedback: 'Incorreto. Superdimensionamento errôneo da variação.' },
            { id: 'opt_31_4', text: 'R(70) ≈ 20,91 Ω.', isCorrect: false, feedback: 'Incorreto. Subtraiu a variação térmica como se o cobre tivesse coeficiente negativo.' }
          ]
        },
        {
          id: 'elec_m1_ec3_q2_temperatura_inferida',
          type: 'multiple_choice',
          question: 'O enrolamento de excitação em cobre de uma máquina industrial mediu uma resistência a frio de R₁ = 4,00 Ω à temperatura ambiente de T₁ = 20 °C. Após 4 horas de funcionamento contínuo sob carga nominal, a resistência ôhmica medida nos mesmos bornes subiu para R₂ = 4,88 Ω. Utilizando a constante inferida de temperatura zero do cobre (234,5 °C), qual foi a temperatura real T₂ atingida no interior do enrolamento?',
          scenario: 'Determinação de temperatura de trabalho em máquinas elétricas pelo método de medição de resistência a quente.',
          norma: 'Boas Práticas de Engenharia e Padrões Industriais de Mercado',
          points: 33,
          explanation: 'Pela relação clássica do cobre: R₂ / R₁ = (234,5 + T₂) / (234,5 + T₁). Razão das resistências: 4,88 / 4,00 = 1,22. Substituindo: 234,5 + T₂ = 1,22 × (234,5 + 20) = 1,22 × 254,5 = 310,49 °C. Logo: T₂ = 310,49 - 234,5 = 75,99 °C ≈ 76 °C.',
          keyTakeaway: 'T₂ = (R₂ / R₁) × (234,5 + T₁) - 234,5: A temperatura de enrolamentos pode ser diagnosticada com exatidão pela relação de resistências.',
          options: [
            { id: 'opt_32_1', text: 'T₂ ≈ 76,0 °C (elevação térmica ΔT = 56,0 °C).', isCorrect: true, feedback: 'Perfeito! R₂/R₁ = 1,22; 1,22 × 254,5 - 234,5 = 75,99 °C ≈ 76 °C.' },
            { id: 'opt_32_2', text: 'T₂ ≈ 48,8 °C (elevação térmica ΔT = 28,8 °C).', isCorrect: false, feedback: 'Incorreto. Supôs erradamente que a temperatura cresce 10 °C por Ohm.' },
            { id: 'opt_32_3', text: 'T₂ ≈ 98,5 °C (elevação térmica ΔT = 78,5 °C).', isCorrect: false, feedback: 'Incorreto. Erro no manuseio da constante 234,5 do cobre.' },
            { id: 'opt_32_4', text: 'T₂ ≈ 310,5 °C.', isCorrect: false, feedback: 'Incorreto. Esqueceu de subtrair a constante de 234,5 °C ao isolar T₂.' }
          ]
        },
        {
          id: 'elec_m1_ec3_q3_perda_joule_aquecimento',
          type: 'multiple_choice',
          question: 'Uma linha de distribuição em corrente contínua com condutores de cobre transporta uma corrente constante de 50 A CC. A 20 °C, a resistência total da linha é de 0,40 Ω. Em um dia de calor extremo, os cabos aquecem para 60 °C (considere α = 0,00393 / °C). Calcule o acréscimo de potência dissipada em calor por efeito Joule (ΔP = P_60 - P_20) exclusivamente devido à variação térmica da resistência.',
          scenario: 'Quantificação das perdas energéticas adicionais decorrentes do aumento da resistência térmica sob carga.',
          norma: 'Boas Práticas de Engenharia e Padrões Industriais de Mercado',
          points: 34,
          explanation: 'A 20 °C: P₂₀ = R₂₀ × I² = 0,40 × 50² = 0,40 × 2500 = 1000 W. Variação térmica: ΔT = 60 - 20 = 40 °C. R₆₀ = 0,40 × [1 + 0,00393 × 40] = 0,40 × 1,1572 = 0,46288 Ω. A 60 °C: P₆₀ = 0,46288 × 2500 = 1157,2 W. O acréscimo de potência dissipada é ΔP = 1157,2 - 1000 = 157,2 W (ou ΔP = ΔR × I² = 0,06288 × 2500 = 157,2 W).',
          keyTakeaway: 'ΔP = ΔR × I²: O aumento térmico de resistência eleva as perdas Joule na linha em mais de 15%.',
          options: [
            { id: 'opt_33_1', text: 'ΔP ≈ 157,2 W de acréscimo em calor.', isCorrect: true, feedback: 'Excelente! ΔR = 0,40 × 0,00393 × 40 = 0,06288 Ω; ΔP = 0,06288 × 50² = 157,2 W.' },
            { id: 'opt_33_2', text: 'ΔP ≈ 62,8 W de acréscimo em calor.', isCorrect: false, feedback: 'Incorreto. Multiplicou ΔR por I em vez de I².' },
            { id: 'opt_33_3', text: 'ΔP ≈ 400,0 W de acréscimo em calor.', isCorrect: false, feedback: 'Incorreto. Erro de cálculo superestimando a resistência final.' },
            { id: 'opt_33_4', text: 'ΔP = 0 W, pois a potência dissipada depende unicamente da corrente.', isCorrect: false, feedback: 'Incorreto. P = R × I², logo qualquer variação em R altera diretamente a perda térmica.' }
          ]
        }
      ]
    },

    // ------------------------------------------------------------------------
    // ELEMENTO 1.4: Leis de Kirchhoff (LKC e LKV) e Circuitos Série/Paralelo/Misto
    // ------------------------------------------------------------------------
    {
      id: 'elec_m1_ec4_leis_kirchhoff_circuitos',
      moduleId: 'elec_mod_1_fisica',
      moduleTitle: 'Módulo 1: Princípios da Física Elétrica & Leis Fundamentais',
      order: 4,
      code: 'EC 1.4',
      title: 'Leis de Kirchhoff (LKC e LKV) e Circuitos Série/Paralelo/Misto',
      norma: 'Boas Práticas de Engenharia e Padrões Industriais de Mercado',
      level: 'Básico',
      durationMinutes: 16,
      theory: {
        conceito: 'As Leis de Kirchhoff constituem o alicerce matemático universal para análise de redes e circuitos elétricos lineares. A 1ª Lei de Kirchhoff (LKC - Lei das Correntes ou Lei dos Nós) é uma consequência do Princípio da Conservação da Carga Elétrica: a soma algébrica das correntes que convergem para qualquer nó de um circuito é identicamente nula (Σ I_entra = Σ I_sai), significando que a carga elétrica não se acumula nem é destruída em uma junção condutora. A 2ª Lei de Kirchhoff (LKV - Lei das Tensões ou Lei das Malhas) fundamenta-se no Princípio da Conservação da Energia: a soma algébrica de todas as diferenças de potencial ao longo de qualquer percurso fechado (malha condutora) é igual a zero (Σ V_fontes = Σ V_quedas). Em associações em série, a corrente é comum a todos os elementos e as resistências somam-se diretamente (R_eq = R₁ + R₂ + ...), atuando como divisores de tensão (V_x = V_total·R_x / R_eq). Em associações em paralelo, a diferença de potencial é rigorosamente a mesma sobre todos os ramos e a condutância equivalente é a soma das condutâncias (1/R_eq = 1/R₁ + 1/R₂ + ...), atuando como divisores de corrente (I₁ = I_total·R₂ / [R₁ + R₂]). Circuitos mistos combinam malhas e nós, sendo resolvidos por reduções modulares de associações e equacionamento simultâneo de Kirchhoff.',
        formulas: [
          {
            label: '1ª Lei de Kirchhoff (LKC - Nós)',
            formula: 'Σ I_entra = Σ I_sai \t(ou Σ I_k = 0)',
            explicacao: 'Conservação da carga em qualquer ponto de convergência de condutores'
          },
          {
            label: '2ª Lei de Kirchhoff (LKV - Malhas)',
            formula: 'Σ V_fontes = Σ (R_k × I_k) \t(ou Σ V_k = 0)',
            explicacao: 'Conservação da energia ao percorrer qualquer percurso fechado'
          },
          {
            label: 'Regra do Divisor de Tensão (Série)',
            formula: 'V_x = V_total × (R_x / R_série)',
            explicacao: 'A tensão em um resistor em série é proporcional ao seu valor ôhmico relativo'
          },
          {
            label: 'Regra do Divisor de Corrente (2 Ramos)',
            formula: 'I₁ = I_total × [R₂ / (R₁ + R₂)]',
            explicacao: 'A corrente em um ramo é inversamente proporcional à sua própria resistência'
          }
        ],
        pontosOperacionais: [
          'Convenção Rigorosa de Polaridades nas Malhas: arbitrar previamente o sentido da corrente (horário ou anti-horário). Se ao percorrer a malha encontrar o polo negativo de uma fonte e sair pelo positivo, a ddp é positiva (+E); nas quedas de tensão em resistores a favor da corrente, o sinal é negativo (-R·I).',
          'Equacionamento Topológico Independente: para um circuito com B ramos e N nós, o número de equações de nós independentes pela LKC é (N - 1) e o número de equações de malhas fundamentais independentes pela LKV é M = B - (N - 1).',
          'Resistor Shunt em Paralelo: aplicação prática vital da LKC em amperímetros; coloca-se uma resistência de derivação de valor muito baixo (R_shunt) em paralelo com o galvanômetro para desviar a maior parte da corrente e evitar a queima do sensor.',
          'Divisores Resistivos de Tensão em Medição: atentar sempre para o efeito de carga; se o instrumento de medição conectado em paralelo tiver impedância comparável à resistência do divisor, a tensão medida cairá drasticamente falseando o diagnóstico.'
        ],
        fieldCase: {
          localizacao: 'Central Solar Fotovoltaica de Mocuba, Província da Zambézia',
          cenario: 'Um divisor de tensão resistivo CC (resistores R₁ = 90 kΩ e R₂ = 10 kΩ) instalado para reduzir a tensão de 1000 V CC de um barramento fotovoltaico para 100 V CC na entrada analógica de um CLP apresentava leitura de apenas 80 V no supervisório.',
          diagnostico: 'O projetista desconsiderou a resistência interna de entrada do cartão analógico do CLP (40 kΩ). Esse cartão ficou em paralelo com o resistor R₂ de 10 kΩ. Pela LKC e cálculo de resistências em paralelo: R_eq2 = (10 × 40) / (10 + 40) = 400 / 50 = 8,0 kΩ. Pelo divisor de tensão real: V_medido = 1000 × [8 / (90 + 8)] = 1000 × 8 / 98 = 81,6 V (erro de quase 20 V).',
          solucaoNormativa: 'Instalação de um amplificador isolador operacional (buffer follower) de alta impedância de entrada (> 10 MΩ) entre o divisor resistivo e o CLP, eliminando o desvio de corrente pela LKC e restaurando a leitura nominal de 100 V conforme as Boas Práticas de Engenharia e Padrões Industriais de Mercado.'
        },
        funcionamento: 'As Leis de Kirchhoff são independentes da natureza microscópica do condutor, aplicando-se a qualquer meio contínuo condutivo em baixas e médias frequências (regime quase-estacionário). Em instalações industriais de corrente contínua (como baterias de no-break e tracionamento elétrico), dominar a LKV e a LKC permite diagnosticar quedas de contato e derivações ocultas em minutos.',
        aplicacaoMocambique: 'Nas subestações da EDM, bancos de baterias de 110 V CC alimentam múltiplos circuitos de proteção e controle ligados em paralelo. Quando um condutor apresenta falha de contato ou oxidação nos bornes, a LKV revela imediatamente a perda de tensão nas réguas de bornes intermediárias.',
        exemploPratico: 'Um circuito com fonte de 24 V alimenta R₁ = 4 Ω em série com R₂ = 8 Ω. Corrente da malha I = 24 / (4 + 8) = 2 A. Quedas de tensão: V_R1 = 2 × 4 = 8 V; V_R2 = 2 × 8 = 16 V. Pela LKV: 24 V - 8 V - 16 V = 0 V (conservação perfeita da energia).',
        calculationSnippet: 'Σ I_nó = 0 | Σ V_malha = 0 | V_x = V_total × (R_x / R_eq)'
      },
      quiz: {
        question: 'Um circuito de malha única em corrente contínua é composto por duas fontes de tensão conectadas em oposição (E₁ = 48 V e E₂ = 12 V) e três resistores em série (R₁ = 4 Ω, R₂ = 6 Ω e R₃ = 8 Ω). Calcule a corrente I que circula na malha e a queda de tensão V_R2 no resistor R₂ segundo a Lei das Malhas de Kirchhoff (LKV).',
        options: [
          { id: 'A', text: 'I = 2,0 A e V_R2 = 12,0 V.', isCorrect: true, feedback: 'Correto! Tensão líquida E_liq = 48 - 12 = 36 V; R_série = 4 + 6 + 8 = 18 Ω; I = 36 / 18 = 2,0 A; V_R2 = 2,0 × 6 = 12,0 V.' },
          { id: 'B', text: 'I = 3,33 A e V_R2 = 20,0 V.', isCorrect: false, feedback: 'Incorreto. Somou as fontes (48 + 12 = 60 V) em vez de subtrair fontes em oposição.' },
          { id: 'C', text: 'I = 2,0 A e V_R2 = 6,0 V.', isCorrect: false, feedback: 'Incorreto. Dividiu a corrente pelo resistor em vez de multiplicar.' },
          { id: 'D', text: 'I = 1,0 A e V_R2 = 6,0 V.', isCorrect: false, feedback: 'Incorreto. Erro de cálculo na divisão da tensão líquida pela resistência equivalente.' }
        ],
        explanation: 'Pela LKV, percorrendo a malha fechada no sentido horário: E₁ - E₂ - (R₁ + R₂ + R₃) × I = 0. A tensão líquida resultante das fontes opostas é E_liq = 48 V - 12 V = 36 V. A resistência equivalente em série é R_série = 4 + 6 + 8 = 18 Ω. A corrente de malha é I = 36 V / 18 Ω = 2,0 A. A queda de tensão sobre o resistor R₂ é V_R2 = I × R₂ = 2,0 A × 6 Ω = 12,0 V.',
        keyTakeaway: 'LKV: Fontes opostas subtraem-se (48 - 12 = 36 V); 36 V aplicados em 18 Ω geram 2 A e provocam 12 V em R₂.',
        xpReward: 50
      },
      assessmentQuestions: [
        {
          id: 'elec_m1_ec4_q1_lkv_duas_fontes',
          type: 'multiple_choice',
          question: 'Um circuito de malha única em corrente contínua é composto por duas fontes de tensão conectadas em oposição (E₁ = 48 V e E₂ = 12 V) e três resistores em série (R₁ = 4 Ω, R₂ = 6 Ω e R₃ = 8 Ω). Calcule a corrente I que circula na malha e a queda de tensão V_R2 no resistor R₂ segundo a Lei das Malhas de Kirchhoff (LKV).',
          scenario: 'Análise de circuito série com fontes contínuas em oposição e aplicação da 2ª Lei de Kirchhoff.',
          norma: 'Boas Práticas de Engenharia e Padrões Industriais de Mercado',
          points: 33,
          explanation: 'E_liq = 48 - 12 = 36 V. R_total = 4 + 6 + 8 = 18 Ω. I = 36 / 18 = 2,0 A. V_R2 = I × R₂ = 2,0 × 6 = 12,0 V.',
          keyTakeaway: 'LKV: Σ V = 0; a corrente é a tensão líquida dividida pela resistência total em série.',
          options: [
            { id: 'opt_41_1', text: 'I = 2,0 A e V_R2 = 12,0 V.', isCorrect: true, feedback: 'Correto! 48 - 12 = 36 V; 36 / 18 = 2,0 A; 2,0 × 6 = 12,0 V.' },
            { id: 'opt_41_2', text: 'I = 3,33 A e V_R2 = 20,0 V.', isCorrect: false, feedback: 'Incorreto. Somou as fontes em oposição como se estivessem em série aditiva (60 / 18).' },
            { id: 'opt_41_3', text: 'I = 2,0 A e V_R2 = 18,0 V.', isCorrect: false, feedback: 'Incorreto. Erro aritmético no produto de I por R₂.' },
            { id: 'opt_41_4', text: 'I = 0,5 A e V_R2 = 3,0 V.', isCorrect: false, feedback: 'Incorreto. Erro severo na divisão da ddp pela resistência.' }
          ]
        },
        {
          id: 'elec_m1_ec4_q2_lkc_divisor_corrente',
          type: 'multiple_choice',
          question: 'Uma linha de corrente contínua alimenta um nó que se divide em dois ramos condutores em paralelo: o Ramo 1 possui uma resistência R₁ = 20 Ω e o Ramo 2 possui uma resistência R₂ = 30 Ω. Se a corrente total contínua que chega ao nó for I_total = 10,0 A, determine a corrente que flui por cada um dos ramos (I₁ e I₂) e a ddp V_nó entre os terminais do paralelo.',
          scenario: 'Aplicação da Lei dos Nós de Kirchhoff (LKC) e cálculo de divisor de corrente em circuitos paralelos.',
          norma: 'Boas Práticas de Engenharia e Padrões Industriais de Mercado',
          points: 33,
          explanation: 'R_eq = (20 × 30) / (20 + 30) = 600 / 50 = 12 Ω. V_nó = I_total × R_eq = 10,0 × 12 = 120 V. Pela Lei de Ohm nos ramos: I₁ = V_nó / R₁ = 120 / 20 = 6,0 A; I₂ = V_nó / R₂ = 120 / 30 = 4,0 A. Pela LKC: I₁ + I₂ = 6,0 + 4,0 = 10,0 A (conservação da carga).',
          keyTakeaway: 'LKC: Σ I_entra = Σ I_sai; o ramo de menor resistência conduz a maior parcela da corrente (6 A em 20 Ω vs 4 A em 30 Ω).',
          options: [
            { id: 'opt_42_1', text: 'I₁ = 6,0 A, I₂ = 4,0 A e V_nó = 120 V.', isCorrect: true, feedback: 'Excelente! R_eq = 12 Ω; V = 120 V; I₁ = 120 / 20 = 6,0 A; I₂ = 120 / 30 = 4,0 A.' },
            { id: 'opt_42_2', text: 'I₁ = 4,0 A, I₂ = 6,0 A e V_nó = 120 V.', isCorrect: false, feedback: 'Incorreto. Inverteu os ramos; a menor resistência (20 Ω) deve conduzir a maior corrente.' },
            { id: 'opt_42_3', text: 'I₁ = 5,0 A, I₂ = 5,0 A e V_nó = 250 V.', isCorrect: false, feedback: 'Incorreto. As correntes só seriam iguais se as resistências fossem idênticas.' },
            { id: 'opt_42_4', text: 'I₁ = 6,0 A, I₂ = 4,0 A e V_nó = 500 V.', isCorrect: false, feedback: 'Incorreto. Somou as resistências em vez de calcular o paralelo para a ddp do nó.' }
          ]
        },
        {
          id: 'elec_m1_ec4_q3_circuito_misto_potencia',
          type: 'multiple_choice',
          question: 'Um circuito misto de corrente contínua é alimentado por uma fonte estável de 60 V. O resistor R₁ = 5 Ω está conectado em série com uma associação em paralelo constituída por dois resistores iguais R₂ = 20 Ω e R₃ = 20 Ω. Calcule a resistência equivalente total do circuito R_total, a corrente total I_t fornecida pela fonte e a potência dissipada no resistor R₁.',
          scenario: 'Análise de circuito misto série-paralelo CC com determinação de potência ativa em componente individual.',
          norma: 'Boas Práticas de Engenharia e Padrões Industriais de Mercado',
          points: 34,
          explanation: 'Associação paralelo: R_p = (20 × 20) / (20 + 20) = 10 Ω. Resistência total: R_total = R₁ + R_p = 5 + 10 = 15 Ω. Corrente total: I_t = V / R_total = 60 / 15 = 4,0 A. Como R₁ está em série com a fonte, ele conduz a corrente total I_t = 4,0 A. Potência em R₁: P_R1 = R₁ × I_t² = 5 × 4,0² = 5 × 16 = 80 W.',
          keyTakeaway: 'Circuito misto: Reduz-se o paralelo primeiro (20 // 20 = 10 Ω), soma-se em série (10 + 5 = 15 Ω), calcula-se I_t = 4 A e P = R₁·I² = 80 W.',
          options: [
            { id: 'opt_43_1', text: 'R_total = 15 Ω, I_t = 4,0 A e P_R1 = 80 W.', isCorrect: true, feedback: 'Perfeito! R_p = 10 Ω; R_total = 15 Ω; I_t = 60 / 15 = 4,0 A; P_R1 = 5 × 4² = 80 W.' },
            { id: 'opt_43_2', text: 'R_total = 45 Ω, I_t = 1,33 A e P_R1 = 8,88 W.', isCorrect: false, feedback: 'Incorreto. Somou todos os resistores em série direta (5 + 20 + 20 = 45 Ω) ignorando o paralelo.' },
            { id: 'opt_43_3', text: 'R_total = 15 Ω, I_t = 4,0 A e P_R1 = 20 W.', isCorrect: false, feedback: 'Incorreto. Multiplicou R₁ por I em vez de I² no cálculo da potência.' },
            { id: 'opt_43_4', text: 'R_total = 10 Ω, I_t = 6,0 A e P_R1 = 180 W.', isCorrect: false, feedback: 'Incorreto. Desconsiderou o resistor R₁ na resistência total do circuito.' }
          ]
        }
      ]
    },

    // ------------------------------------------------------------------------
    // ELEMENTO 1.5: Teoremas de Circuitos em CC (Thevenin, Norton e Superposição)
    // ------------------------------------------------------------------------
    {
      id: 'elec_m1_ec5_teoremas_thevenin_norton',
      moduleId: 'elec_mod_1_fisica',
      moduleTitle: 'Módulo 1: Princípios da Física Elétrica & Leis Fundamentais',
      order: 5,
      code: 'EC 1.5',
      title: 'Teoremas de Circuitos em CC (Thevenin, Norton e Superposição)',
      norma: 'Boas Práticas de Engenharia e Padrões Industriais de Mercado',
      level: 'Intermediário',
      durationMinutes: 18,
      theory: {
        conceito: 'Os Teoremas de Circuitos em Corrente Contínua permitem simplificar redes lineares complexas de múltiplos ramos em circuitos equivalentes de dois terminais extremamente simples. O Teorema de Thévenin estabelece que qualquer circuito resistivo linear bilateral contendo fontes independentes e resistores pode ser substituído, em relação a dois terminais A e B, por uma única fonte de tensão ideal (V_th) em série com um resistor interno (R_th). A tensão de Thévenin V_th é a ddp de circuito aberto entre A e B com a carga removida. A resistência de Thévenin R_th é a resistência equivalente vista de A e B com todas as fontes independentes desativadas (fontes de tensão em curto-circuito e fontes de corrente em circuito aberto). O Teorema de Norton é o dual de Thévenin: substitui a rede por uma fonte de corrente ideal (I_N) em paralelo com um resistor R_N = R_th, onde I_N é a corrente de curto-circuito entre A e B (relação de transformação: V_th = I_N·R_th). O Teorema da Máxima Transferência de Potência dita que uma carga R_L absorve a potência máxima possível de um circuito quando sua resistência é rigorosamente igual à resistência interna da fonte (R_L = R_th), dissipando P_max = V_th² / (4·R_th) com rendimento de 50%. O Princípio da Superposição estabelece que em qualquer circuito linear com múltiplas fontes, a resposta total em qualquer ramo é a soma algébrica das respostas produzidas por cada fonte independente atuando isoladamente.',
        formulas: [
          {
            label: 'Equivalente de Thévenin',
            formula: 'V_th = V_ab (aberto) \t| \tR_th = V_th / I_N',
            explicacao: 'Substituição por fonte de tensão V_th em série com resistência R_th'
          },
          {
            label: 'Equivalente de Norton',
            formula: 'I_N = I_ab (curto) \t| \tR_N = R_th = V_th / I_N',
            explicacao: 'Substituição por fonte de corrente I_N em paralelo com resistência R_N'
          },
          {
            label: 'Corrente na Carga R_L',
            formula: 'I_L = V_th / (R_th + R_L)',
            explicacao: 'Cálculo instantâneo de corrente para qualquer valor de carga conectada'
          },
          {
            label: 'Teorema da Máxima Transferência de Potência',
            formula: 'P_max = V_th² / (4 × R_th) \t(quando R_L = R_th)',
            explicacao: 'Potência máxima absorvida pela carga conectada aos terminais'
          }
        ],
        pontosOperacionais: [
          'Desativação Correta de Fontes para Obter R_th: fontes de tensão independentes possuem resistência interna nula e devem ser substituídas por CURTO-CIRCUITO (fio direto); fontes de corrente independentes possuem resistência interna infinita e devem ser substituídas por CIRCUITO ABERTO (ramo interrompido).',
          'Atenção Crítica no Teorema da Superposição: a superposição aplica-se estritamente a grandezas lineares (tensão V e corrente I). NUNCA calcular potências isoladas por fonte e somá-las diretamente (P_total ≠ P₁ + P₂), pois a potência depende do quadrado da corrente (relação não linear)! Calcula-se primeiro a corrente total somada e depois calcula-se a potência.',
          'Modelagem de Fontes Reais na Prática: todo gerador, banco de baterias ou fonte chaveada CC real pode ser modelado por seu equivalente de Thévenin, onde R_th representa a impedância interna do cabeamento e da química das células.',
          'Máxima Transferência vs Rendimento Energético: a máxima transferência de potência (R_L = R_th) opera com rendimento de apenas 50% (metade da potência dissipa na fonte na forma de calor), sendo adotada em sistemas de telecomunicações e sensores, mas evitada em sistemas de potência e usinas onde o objetivo é alta eficiência (R_th << R_L, rendimento > 90%).'
        ],
        fieldCase: {
          localizacao: 'Estação Rádio de Telecomunicações do Zimpeto, Maputo',
          cenario: 'Um banco retificador CC de 48 V apresentava quedas de tensão anormais que desligavam o transmissor de rádio durante picos de transmissão. O instalador tentava trocar fontes sem saber se o problema estava no retificador ou na queda do cabeamento.',
          diagnostico: 'Aplicou-se o método de Thévenin nos terminais de alimentação do transmissor. A tensão em circuito aberto foi medida em V_th = 52,0 V. Ao conectar um resistor de teste de carga de 10 Ω, a tensão caiu para 40,0 V, com corrente de 4,0 A. Pelo teorema: R_th = (V_aberto - V_carga) / I_carga = (52,0 - 40,0) / 4,0 = 3,0 Ω. Uma resistência interna de 3,0 Ω era inaceitável para uma fonte de telecomunicações (provocada por barramentos frouxos e fusíveis oxidados), limitando a máxima potência entregável a P_max = 52² / (4 × 3) = 225 W, abaixo dos 300 W exigidos pelo rádio.',
          solucaoNormativa: 'Reaperto termográfico com chave dinamométrica, substituição de base de fusíveis por lâminas de cobre prateadas e troca dos cabos, reduzindo a R_th para 0,15 Ω. A capacidade de potência máxima subiu para > 4500 W e a tensão operou estabilizada em 48 V sob carga de acordo com as Boas Práticas de Engenharia e Padrões Industriais de Mercado.'
        },
        funcionamento: 'Os Teoremas de Thévenin e Norton simplificam drasticamente o trabalho do engenheiro eletrotécnico: ao analisar um sistema de distribuição com dezenas de resistores e geradores, todo o sistema a montante é condensado em dois únicos parâmetros (V_th e R_th). Isso permite calcular a corrente em qualquer carga variável instantaneamente sem precisar resolver sistemas de malhas a cada modificação.',
        aplicacaoMocambique: 'Em sistemas solares remotos com baterias no Niassa e Cabo Delgado, estimar a resistência interna de Thévenin do banco de acumuladores revela o estado de degradação química (envelhecimento das placas de chumbo-ácido). Baterias desgastadas elevam sua R_th interna, causando colapso imediato da tensão no momento do pico de partida de bombas CC.',
        exemploPratico: 'Um circuito com fonte de 20 V e divisor com R₁ = 5 Ω e R₂ = 20 Ω: Tensão de circuito aberto V_th = 20 × (20 / 25) = 16 V. Desativando a fonte (curto): R_th = (5 × 20) / (5 + 20) = 100 / 25 = 4 Ω. Ao conectar qualquer carga R_L aos terminais, a corrente é diretamente I_L = 16 / (4 + R_L). Se R_L = 4 Ω, obtém-se a máxima transferência: P_max = 16² / (4 × 4) = 256 / 16 = 16 W.',
        calculationSnippet: 'V_th = V_aberto | R_th = V_th / I_N | P_max = V_th² / (4 × R_th)'
      },
      quiz: {
        question: 'Um circuito de corrente contínua é composto por uma fonte de tensão V₁ = 36 V em série com um resistor R₁ = 6 Ω, conectada aos terminais de um resistor R₂ = 12 Ω em paralelo. Entre os terminais de saída desse divisor (A e B) é conectada uma resistência de carga externa R_L = 8 Ω. Determine a tensão de Thévenin V_th, a resistência de Thévenin R_th e a corrente final I_L que atravessa a carga R_L.',
        options: [
          { id: 'A', text: 'V_th = 24 V, R_th = 4,0 Ω e I_L = 2,0 A.', isCorrect: true, feedback: 'Correto! V_th = 36 × (12 / [6 + 12]) = 24 V; R_th = (6 × 12) / (6 + 12) = 72 / 18 = 4,0 Ω; I_L = 24 / (4,0 + 8) = 24 / 12 = 2,0 A.' },
          { id: 'B', text: 'V_th = 36 V, R_th = 18 Ω e I_L = 1,38 A.', isCorrect: false, feedback: 'Incorreto. Considerou a tensão total da fonte como V_th sem aplicar o divisor e somou os resistores em série para R_th.' },
          { id: 'C', text: 'V_th = 12 V, R_th = 4,0 Ω e I_L = 1,0 A.', isCorrect: false, feedback: 'Incorreto. Calculou a queda em R₁ como tensão de Thévenin em vez da tensão em R₂ nos terminais A e B.' },
          { id: 'D', text: 'V_th = 24 V, R_th = 18 Ω e I_L = 0,92 A.', isCorrect: false, feedback: 'Incorreto. Errou o cálculo da resistência de Thévenin ao não associar R₁ e R₂ em paralelo.' }
        ],
        explanation: '1) Tensão de Thévenin (tensão em aberto sobre R₂): V_th = V₁ × [R₂ / (R₁ + R₂)] = 36 V × [12 / (6 + 12)] = 36 × (12 / 18) = 24 V. 2) Resistência de Thévenin (com fonte V₁ em curto-circuito): R_th = R₁ // R₂ = (6 × 12) / (6 + 12) = 72 / 18 = 4,0 Ω. 3) Corrente na carga R_L conectada ao equivalente: I_L = V_th / (R_th + R_L) = 24 V / (4,0 Ω + 8 Ω) = 24 / 12 = 2,0 A.',
        keyTakeaway: 'Thévenin: V_th = 24 V e R_th = 4 Ω; conectando R_L = 8 Ω, a corrente é I_L = 24 / (4 + 8) = 2 A.',
        xpReward: 50
      },
      assessmentQuestions: [
        {
          id: 'elec_m1_ec5_q1_thevenin_completo',
          type: 'multiple_choice',
          question: 'Um circuito de corrente contínua é composto por uma fonte de tensão V₁ = 36 V em série com um resistor R₁ = 6 Ω, conectada aos terminais de um resistor R₂ = 12 Ω em paralelo. Entre os terminais de saída desse divisor (A e B) é conectada uma resistência de carga externa R_L = 8 Ω. Determine a tensão de Thévenin V_th, a resistência de Thévenin R_th e a corrente final I_L que atravessa a carga R_L.',
          scenario: 'Determinação de circuito equivalente de Thévenin e cálculo de corrente em carga externa.',
          norma: 'Boas Práticas de Engenharia e Padrões Industriais de Mercado',
          points: 33,
          explanation: 'V_th = 36 × (12 / 18) = 24 V. R_th = (6 × 12) / 18 = 4,0 Ω. I_L = V_th / (R_th + R_L) = 24 / (4,0 + 8) = 24 / 12 = 2,0 A.',
          keyTakeaway: 'Teorema de Thévenin: O circuito original reduz-se a uma fonte de 24 V em série com 4 Ω; com carga de 8 Ω flui 2,0 A.',
          options: [
            { id: 'opt_51_1', text: 'V_th = 24 V, R_th = 4,0 Ω e I_L = 2,0 A.', isCorrect: true, feedback: 'Correto! V_th = 24 V; R_th = 4,0 Ω; I_L = 24 / (4 + 8) = 2,0 A.' },
            { id: 'opt_51_2', text: 'V_th = 36 V, R_th = 18 Ω e I_L = 1,38 A.', isCorrect: false, feedback: 'Incorreto. Não aplicou a divisão de tensão e somou resistores em série.' },
            { id: 'opt_51_3', text: 'V_th = 12 V, R_th = 4,0 Ω e I_L = 1,0 A.', isCorrect: false, feedback: 'Incorreto. Tomou a tensão no resistor superior em vez da ddp nos terminais A e B.' },
            { id: 'opt_51_4', text: 'V_th = 24 V, R_th = 8,0 Ω e I_L = 1,5 A.', isCorrect: false, feedback: 'Incorreto. Erro no cálculo da resistência de Thévenin.' }
          ]
        },
        {
          id: 'elec_m1_ec5_q2_norton_maxima_potencia',
          type: 'multiple_choice',
          question: 'Um circuito de alimentação CC possui um equivalente de Norton composto por uma fonte de corrente contínua I_N = 5,0 A em paralelo com uma resistência de Norton R_N = 10 Ω. Calcule a tensão de Thévenin equivalente V_th, o valor da resistência de carga R_L necessária para absorver a máxima potência do circuito e o valor dessa potência máxima transferida P_max.',
          scenario: 'Transformação entre equivalentes de Norton e Thévenin e aplicação do Teorema da Máxima Transferência de Potência.',
          norma: 'Boas Práticas de Engenharia e Padrões Industriais de Mercado',
          points: 33,
          explanation: '1) Tensão de Thévenin: V_th = I_N × R_N = 5,0 A × 10 Ω = 50 V. 2) Pelo teorema da máxima potência, R_L deve ser igual à resistência interna: R_L = R_th = R_N = 10 Ω. 3) Potência máxima: P_max = V_th² / (4 × R_th) = 50² / (4 × 10) = 2500 / 40 = 62,5 W (ou I_L = 5,0 / 2 = 2,5 A; P = R_L × I_L² = 10 × 2,5² = 62,5 W).',
          keyTakeaway: 'Máxima Potência: Ocorre quando R_L = R_th (10 Ω); P_max = V_th² / (4 × R_th) = 62,5 W.',
          options: [
            { id: 'opt_52_1', text: 'V_th = 50 V, R_L = 10 Ω e P_max = 62,5 W.', isCorrect: true, feedback: 'Excelente! V_th = 50 V; R_L = 10 Ω; P_max = 50² / 40 = 62,5 W.' },
            { id: 'opt_52_2', text: 'V_th = 50 V, R_L = 5,0 Ω e P_max = 125,0 W.', isCorrect: false, feedback: 'Incorreto. R_L deve ser igual a R_th (10 Ω) para haver adaptação de máxima transferência de potência.' },
            { id: 'opt_52_3', text: 'V_th = 25 V, R_L = 10 Ω e P_max = 15,6 W.', isCorrect: false, feedback: 'Incorreto. Erro no cálculo da tensão de Thévenin a partir de Norton.' },
            { id: 'opt_52_4', text: 'V_th = 50 V, R_L = 10 Ω e P_max = 250,0 W.', isCorrect: false, feedback: 'Incorreto. Esqueceu o fator 4 no denominador da fórmula de potência máxima (V_th² / [4·R_th]).' }
          ]
        },
        {
          id: 'elec_m1_ec5_q3_superposicao_corrente',
          type: 'multiple_choice',
          question: 'Um resistor de carga R = 4 Ω está conectado em um circuito CC contendo duas fontes independentes: uma fonte de tensão contínua V₁ = 24 V com resistência interna R₁ = 2 Ω ligada a um nó, e uma fonte de corrente contínua I₂ = 3,0 A injetando corrente no mesmo nó em paralelo com o resistor R. Utilizando rigorosamente o Princípio da Superposição, determine a corrente total I_R que flui através do resistor de carga R.',
          scenario: 'Análise de circuito CC com múltiplas fontes independentes através do Princípio da Superposição linear.',
          norma: 'Boas Práticas de Engenharia e Padrões Industriais de Mercado',
          points: 34,
          explanation: '1) Efeito isolado de V₁ (com fonte de corrente I₂ aberta): R₁ e R ficam em série. A corrente é I_R(V1) = V₁ / (R₁ + R) = 24 / (2 + 4) = 24 / 6 = 4,0 A. 2) Efeito isolado de I₂ (com fonte de tensão V₁ em curto-circuito): A corrente de 3,0 A divide-se entre R₁ e R em paralelo. Pelo divisor de corrente: I_R(I2) = I₂ × [R₁ / (R₁ + R)] = 3,0 × [2 / (2 + 4)] = 3,0 × (2 / 6) = 1,0 A. 3) Superposição total: Como ambas as fontes injetam corrente no mesmo sentido através de R: I_R = I_R(V1) + I_R(I2) = 4,0 A + 1,0 A = 5,0 A.',
          keyTakeaway: 'Superposição: Efeito de V₁ = 4 A; Efeito de I₂ = 1 A; Corrente total linear somada = 5,0 A.',
          options: [
            { id: 'opt_53_1', text: 'I_R = 5,0 A.', isCorrect: true, feedback: 'Perfeito! Efeito V₁: 24 / 6 = 4,0 A; Efeito I₂: 3,0 × (2 / 6) = 1,0 A; Total: 4,0 + 1,0 = 5,0 A.' },
            { id: 'opt_53_2', text: 'I_R = 3,0 A.', isCorrect: false, feedback: 'Incorreto. Subtraiu as correntes em vez de somar suas contribuições no mesmo sentido.' },
            { id: 'opt_53_3', text: 'I_R = 7,0 A.', isCorrect: false, feedback: 'Incorreto. Somou a corrente total de I₂ diretamente sem aplicar o divisor resistivo no ramo.' },
            { id: 'opt_53_4', text: 'I_R = 2,5 A.', isCorrect: false, feedback: 'Incorreto. Erro de cálculo na análise dos circuitos parciais desativados.' }
          ]
        }
      ]
    }
  ]
};
