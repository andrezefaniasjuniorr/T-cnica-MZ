import { AcademyModule } from '../types/academy';

// ============================================================================
// MÓDULO 2: INSTRUMENTAÇÃO, MEDIÇÃO E GRANDEZAS ELÉTRICAS
// Padrão Didático Avançado - Academia TécnicaMZ & Sara IA
// Boas Práticas de Engenharia e Padrões Industriais de Mercado
// ============================================================================

export const MODULE_2_INSTRUMENTACAO: AcademyModule = {
  id: 'elec_mod_2_instrumentacao',
  area: 'eletrotecnica',
  order: 2,
  title: 'Módulo 2: Instrumentação, Medição e Grandezas Elétricas',
  description: 'Multímetros e Alicates Amperimétricos com Categoria de Segurança, Osciloscópios Digitais e Megómetros, Grandezas em CA e True-RMS, Fator de Potência e Harmónicos (THD), e Método de Aron para Potência Trifásica.',
  icon: 'Activity',
  normasReferencia: [
    'Boas Práticas de Engenharia e Padrões Industriais de Mercado',
    'IEC 61010-1',
    'IEC 61557',
    'IEC 60051'
  ],
  lessons: [
    // ------------------------------------------------------------------------
    // ELEMENTO 2.1: Multímetros e Alicates Amperimétricos (Uso Seguro e Medição de R, V, I)
    // ------------------------------------------------------------------------
    {
      id: 'elec_m2_ec1_multimetros_alicate_amperimetro',
      moduleId: 'elec_mod_2_instrumentacao',
      moduleTitle: 'Módulo 2: Instrumentação, Medição e Grandezas Elétricas',
      order: 1,
      code: 'EC 2.1',
      title: 'Multímetros e Alicates Amperimétricos (Uso Seguro e Medição de R, V, I)',
      norma: 'Boas Práticas de Engenharia e Padrões Industriais de Mercado',
      level: 'Básico',
      durationMinutes: 16,
      theory: {
        conceito: 'A instrumentação elétrica de bancada e campo requer rigor absoluto em procedimentos operacionais para garantir a integridade física do técnico e a exatidão dos diagnósticos. O padrão internacional de segurança estabelece Categorias de Sobretensão (CAT I a CAT IV) com base na proximidade da fonte geradora e na magnitude de transientes atmosféricos: CAT II (cargas plugadas em tomadas), CAT III (quadros de distribuição prediais e motores) e CAT IV (origem da instalação, entrada de rede da concessionária e linhas aéreas até 1000 V com suportabilidade de surtos transitórios de 8 kV). Multímetros industriais profissionais utilizam fusíveis cerâmicos de alta capacidade de ruptura preenchidos com areia de sílica (HRC - High Rupture Capacity, 1000 V / 11 A com poder de interrupção de até 100 kA); fusíveis de vidro baratos vaporizam sob curto-circuito, gerando explosão de plasma no interior do instrumento. Para medir Tensão (V), o voltímetro possui altíssima impedância (> 10 MΩ) e conecta-se SEMPRE em PARALELO com o elemento. Para medir Resistência (Ω) e Continuidade, o circuito deve estar 100% DESENERGIZADO, pois o ohmímetro injeta uma pequena corrente de ensaio; injetar tensão externa destrói a escala. Para medir Corrente (A), o amperímetro tradicional é ligado em SÉRIE (baixa resistência interna de shunt), exigindo atenção extrema para não tentar medir tensão com as pontas no borne de 10 A. O Alicate Amperímetro elimina o risco de abertura do circuito, medindo a corrente pelo campo magnético através de um transformador de corrente (TC de núcleo bipartido para CA) ou por sensor de Efeito Hall (para CA e CC), exigindo que se abrace rigorosamente um único condutor por vez.',
        formulas: [
          {
            label: 'Incerteza Instrumental Absoluta',
            formula: 'Incerteza = ± [(% da Leitura) + (N × Resolução)]',
            explicacao: 'Faixa de tolerância metrológica de acordo com as especificações do fabricante'
          },
          {
            label: 'Impedância de Entrada do Voltímetro',
            formula: 'R_in ≥ 10 MΩ \t(Atenuação de carga do circuito)',
            explicacao: 'Alta impedância para evitar carregamento do divisor de tensão sob teste'
          },
          {
            label: 'Cancelamento em Garra Múltipla',
            formula: 'I_medida = |I_fase - I_neutro| = I_fuga',
            explicacao: 'Abraçar fase e neutro simultaneamente mede apenas a fuga residual à terra'
          },
          {
            label: 'Multiplicador por Espiras (TC)',
            formula: 'I_real = I_display / N_espiras',
            explicacao: 'Para correntes muito baixas, enrolam-se N espiras do cabo na garra do alicate'
          }
        ],
        pontosOperacionais: [
          'Protocolo de Ouro "Verificar Bornes Antes de Medir": o erro mais letal na eletrotécnica é deixar a ponta de prova vermelha no borne de corrente (10 A) e tocar em barramentos trifásicos de 400 V achando que está medindo tensão; o borne de corrente é um curto-circuito pleno (< 0,01 Ω) e gera explosão por arco elétrico.',
          'Uso Correto do Alicate Amperímetro: abraçar SEMPRE apenas o condutor de fase ou apenas o neutro; se abraçar o cabo com fase e neutro juntos, os campos magnéticos opostos cancelam-se e o visor indicará 0,0 A mesmo sob carga pesada.',
          'Inspeção Visual Prévia das Pontas de Prova: antes de qualquer intervenção, inspecionar a isolação dos cabos de teste contra cortes e trincas, e verificar a ponta metálica que deve possuir capa protetora de segurança deixando expostos apenas 4 mm de metal (redução de risco de arco entre barras próximas).',
          'Fusíveis de Proteção Cerâmicos HRC: nunca substituir um fusível queimado de multímetro por fio de cobre, solda de estanho ou fusível automotivo de vidro; utilize unicamente peças de cerâmica de alta capacidade de interrupção (1000 V / 30 kA).'
        ],
        fieldCase: {
          localizacao: 'Terminal Portuário de Contentores de Maputo',
          cenario: 'Um técnico de manutenção júnior foi verificar a tensão entre as três fases de um disjuntor geral de 630 A em um quadro QGBT de 400 V utilizando um multímetro comum não-industrial. Ao encostar as ponteiras entre L1 e L2, ocorreu uma explosão violenta com estilhaçamento do multímetro e queima das mãos do profissional.',
          diagnostico: 'A perícia técnica constatou que o cabo vermelho do multímetro estava inserido no borne de medição de corrente "10 A". Ao tocar entre fases a 400 V, o shunt de 0,01 Ω causou um curto-circuito fase-fase direto. Além disso, o instrumento utilizava um fusível de vidro comum de 250 V improvisado; o fusível vaporizou em arco de plasma contínuo que explodiu o invólucro plástico.',
          solucaoNormativa: 'Padronização obrigatória de multímetros industriais com classificação CAT IV 600 V / CAT III 1000 V com fusíveis cerâmicos HRC originais de 1000 V / 11 A 20 kA e barreiras internas anti-arco, implementação de ponteiras retráteis com proteção de dedos e reciclagem técnica sobre a verificação sistemática de bornes conforme as Boas Práticas de Engenharia e Padrões Industriais de Mercado.'
        },
        funcionamento: 'O multímetro digital converte sinais analógicos em dados digitais através de um Conversor A/D (Analógico-Digital) de alta resolução. Na escala de tensão, um divisor resistivo de precisão atenua o sinal mantendo a impedância de entrada em 10 MΩ. Na escala de corrente, a corrente flui por um resistor shunt calibrado de baixíssimo valor ôhmico e o voltímetro interno lê a microtensão proporcional à corrente (V_shunt = I·R_shunt). No alicate amperímetro CA, o núcleo de ferro laminado bipartido fecha-se em torno do condutor atuando como o primário de 1 espira de um transformador de corrente.',
        aplicacaoMocambique: 'Nas instalações industriais e marítimas de Moçambique, a corrosão por salinidade e a umidade aceleram a deterioração dos cabos e bornes. A utilização de alicates amperímetros de alça estreita permite aferir correntes em painéis apertados sem risco de toque acidental.',
        exemploPratico: 'Para medir uma corrente muito baixa de 0,20 A (200 mA) com um alicate amperímetro com resolução de 0,1 A, enrolam-se 10 espiras do condutor passando por dentro da garra. A leitura exibida no visor será de 2,0 A. O valor real da corrente é obtido dividindo a leitura pelo número de espiras: I_real = 2,0 A / 10 = 0,20 A, multiplicando a resolução por 10.',
        calculationSnippet: 'CAT III/IV | R_in ≥ 10 MΩ | Fusível Cerâmico HRC 1000V'
      },
      quiz: {
        question: 'Um técnico de manutenção utiliza um alicate amperímetro digital True-RMS em um circuito monofásico de 230 V que alimenta uma estufa industrial operando normalmente com corrente nominal contínua de 15,0 A. Se o técnico abraçar acidentalmente com a garra do alicate o cabo de fase e o cabo de neutro juntos ao mesmo tempo, qual leitura o display do instrumento apresentará e por quê?',
        options: [
          { id: 'A', text: 'Apresentará 30,0 A, pois o alicate soma a corrente de ida da fase com a corrente de retorno do neutro.', isCorrect: false, feedback: 'Incorreto. As correntes fluem em sentidos opostos, não no mesmo sentido.' },
          { id: 'B', text: 'Apresentará aproximadamente 0,0 A, pois as correntes de fase e neutro possuem sentidos opostos e seus fluxos magnéticos se anulam no núcleo.', isCorrect: true, feedback: 'Correto! Em um circuito saudável, a corrente que vai pela fase retorna pelo neutro em sentido oposto. Os campos magnéticos contrários cancelam-se mutuamente no núcleo toroidal do alicate (B_res = 0), resultando em leitura nula.' },
          { id: 'C', text: 'Apresentará 15,0 A normalmente, pois o alicate mede a corrente média do circuito independente do número de fios.', isCorrect: false, feedback: 'Incorreto. O alicate mede a resultante do campo magnético de todos os condutores abraçados.' },
          { id: 'D', text: 'O display exibirá "O.L" por sobrecarga de saturação magnética.', isCorrect: false, feedback: 'Incorreto. O campo resultante é nulo, logo não há saturação magnética.' }
        ],
        explanation: 'O alicate amperímetro opera pelo princípio da indução eletromagnética (Lei de Ampère): a tensão induzida na bobina secundária é diretamente proporcional ao campo magnético líquido que atravessa a abertura da garra. Em um circuito monofásico normal de 15 A, a corrente flui pela fase e retorna pelo neutro com mesmo módulo e sentido oposto. Os dois fluxos magnéticos possuem sinais contrários e anulam-se no núcleo de ferro (Φ_total = Φ_fase - Φ_neutro = 0), resultando em leitura de 0,0 A.',
        keyTakeaway: 'Alicate Amperímetro: Deve abraçar rigorosamente um único condutor ativo por vez; abraçar fase e neutro juntos anula a medição.',
        xpReward: 50
      },
      assessmentQuestions: [
        {
          id: 'elec_m2_ec1_q1_garra_multiplos_fios',
          type: 'multiple_choice',
          question: 'Um técnico de manutenção utiliza um alicate amperímetro digital True-RMS em um circuito monofásico de 230 V que alimenta uma estufa industrial operando normalmente com corrente nominal contínua de 15,0 A. Se o técnico abraçar acidentalmente com a garra do alicate o cabo de fase e o cabo de neutro juntos ao mesmo tempo, qual leitura o display do instrumento apresentará e por quê?',
          scenario: 'Interpretação do princípio magnético de medição com alicates amperímetros e efeito de cancelamento de fluxo.',
          norma: 'Boas Práticas de Engenharia e Padrões Industriais de Mercado',
          points: 33,
          explanation: 'As correntes de fase e de neutro possuem mesmo módulo (15 A) e sentidos opostos. Os fluxos magnéticos gerados no interior do núcleo bipartido cancelam-se (Φ = Φ_fase - Φ_neutro = 0), resultando em leitura de 0,0 A (ou corrente de fuga residual ínfima se houver defeito).',
          keyTakeaway: 'Alicate Amperímetro: Abraçar fase e neutro simultaneamente anula a leitura por oposição de campo magnético.',
          options: [
            { id: 'opt_m21_1', text: 'Apresentará aproximadamente 0,0 A, pois as correntes possuem sentidos opostos e seus fluxos magnéticos se anulam no núcleo.', isCorrect: true, feedback: 'Correto! Os campos magnéticos gerados por correntes opostas cancelam-se perfeitamente no núcleo toroidal.' },
            { id: 'opt_m21_2', text: 'Apresentará 30,0 A, pois o alicate soma a corrente de ida da fase com a corrente de retorno do neutro.', isCorrect: false, feedback: 'Incorreto. A soma só ocorreria se os condutores transportassem correntes no mesmo sentido.' },
            { id: 'opt_m21_3', text: 'Apresentará 15,0 A normalmente, pois o alicate lê a corrente líquida de um dos condutores.', isCorrect: false, feedback: 'Incorreto. O sensor responde à soma vetorial dos campos de todos os condutores inseridos.' },
            { id: 'opt_m21_4', text: 'O alicate desarmará o disjuntor do painel por indução reversa.', isCorrect: false, feedback: 'Incorreto. O alicate é um instrumento passivo de medição e não injeta corrente no circuito.' }
          ]
        },
        {
          id: 'elec_m2_ec1_q2_incerteza_multimetro',
          type: 'multiple_choice',
          question: 'Um multímetro digital industrial de 3 ½ dígitos possui em sua escala de 200,0 V CC uma especificação de exatidão metrológica de ± (0,5% da leitura + 2 dígitos). Ao realizar a medição de uma fonte contínua regulada de bancada, o visor exibe estavelmente o valor de 120,0 V. Qual é a faixa real admissível de tensão em que se encontra a grandeza física medida?',
          scenario: 'Interpretação metrológica de incerteza instrumental e resolução de instrumentos digitais.',
          norma: 'Boas Práticas de Engenharia e Padrões Industriais de Mercado',
          points: 33,
          explanation: '1) Parcela percentual da leitura: 0,5% de 120,0 V = 0,60 V. 2) Parcela dos dígitos: a resolução na escala de 200,0 V é de 0,1 V por dígito; logo 2 dígitos equivalem a 2 × 0,1 V = 0,20 V. 3) Incerteza total: ± (0,60 + 0,20) = ± 0,80 V. A faixa real admissível estende-se de (120,0 - 0,8) V a (120,0 + 0,8) V, ou seja, de 119,2 V a 120,8 V.',
          keyTakeaway: 'Incerteza: ± (% Leitura + N dígitos): 0,5% de 120 V (0,6 V) + 2 dígitos (0,2 V) resulta em incerteza total de ± 0,8 V.',
          options: [
            { id: 'opt_m22_1', text: 'Entre 119,2 V e 120,8 V (incerteza absoluta de ± 0,8 V).', isCorrect: true, feedback: 'Perfeito! 0,5% de 120 V = 0,6 V; 2 dígitos de 0,1 V = 0,2 V; Incerteza = ± 0,8 V (faixa 119,2 V a 120,8 V).' },
            { id: 'opt_m22_2', text: 'Entre 119,4 V e 120,6 V (incerteza absoluta de ± 0,6 V).', isCorrect: false, feedback: 'Incorreto. Considerou apenas a parcela percentual de 0,5% e esqueceu os 2 dígitos do conversor A/D.' },
            { id: 'opt_m22_3', text: 'Entre 118,0 V e 122,0 V (incerteza absoluta de ± 2,0 V).', isCorrect: false, feedback: 'Incorreto. Interpretou erradamente os 2 dígitos como se fossem 2 Volts inteiros.' },
            { id: 'opt_m22_4', text: 'Rigorosamente 120,00 V sem qualquer margem de erro por ser digital.', isCorrect: false, feedback: 'Incorreto. Todo instrumento real de medição física possui incerteza metrológica intrínseca.' }
          ]
        },
        {
          id: 'elec_m2_ec1_q3_diagnostico_pontas_fusivel',
          type: 'multiple_choice',
          question: 'Um técnico necessita verificar a resistência ôhmica de uma bobina desenergizada. Ao selecionar a escala de 200 Ω de seu multímetro e encostar firmemente as duas pontas de prova diretamente uma contra a outra (curto-circuito intencional), o display permanece exibindo "O.L" (Overload / Infinito) em vez de indicar aproximadamente 0,1 Ω a 0,2 Ω. Em seguida, na escala de teste sonoro de continuidade, o instrumento não apita ao fechar as pontas. Qual é a interpretação técnica correta dessa condição?',
          scenario: 'Diagnóstico de falha instrumental em pontas de prova e circuito de medição de resistência.',
          norma: 'Boas Práticas de Engenharia e Padrões Industriais de Mercado',
          points: 34,
          explanation: 'Ao colocar as pontas de prova em curto direto, o circuito de teste deve apresentar resistência desprezível (~0,1 a 0,2 Ω) e acionar o buzzer sonoro. Se o visor continua exibindo "O.L" (circuito aberto), há interrupção interna no circuito do próprio instrumento: ruptura do condutor de cobre no interior de uma das pontas de prova por fadiga mecânica ou fusível de proteção interna de cerâmica aberto por sobretensão prévia. O instrumento não pode ser utilizado até o reparo.',
          keyTakeaway: 'Autoteste do Multímetro: Pontas em curto devem indicar ~0 Ω e apitar; indicar "O.L" acusa ponta rompida ou fusível interno aberto.',
          options: [
            { id: 'opt_m23_1', text: 'Há interrupção no circuito de teste do próprio instrumento: ponta de prova com condutor partido ou fusível interno de proteção aberto.', isCorrect: true, feedback: 'Excelente! Pontas em curto devem fechar o circuito (~0,1 Ω); manter "O.L" indica ponta partida ou fusível interno queimado.' },
            { id: 'opt_m23_2', text: 'O multímetro está funcionando perfeitamente e indica que a resistência do ar entre as pontas é infinita.', isCorrect: false, feedback: 'Incorreto. As pontas estavam em contato metálico direto firme, não separadas no ar.' },
            { id: 'opt_m23_3', text: 'A escala de 200 Ω deve ser calibrada aplicando tensão de 230 V com o multímetro.', isCorrect: false, feedback: 'Incorreto e perigoso! Aplicar tensão na escala de resistência queima a proteção do multímetro.' },
            { id: 'opt_m23_4', text: 'A bateria interna de 9 V do multímetro está invertida nos polos.', isCorrect: false, feedback: 'Incorreto. Bateria invertida impediria o funcionamento do display ou o visor indicaria alerta de bateria fraca.' }
          ]
        }
      ]
    },

    // ------------------------------------------------------------------------
    // ELEMENTO 2.2: Osciloscópios e Megómetros (Leitura de Sinais e Testes de Isolação)
    // ------------------------------------------------------------------------
    {
      id: 'elec_m2_ec2_osciloscopios_megometros',
      moduleId: 'elec_mod_2_instrumentacao',
      moduleTitle: 'Módulo 2: Instrumentação, Medição e Grandezas Elétricas',
      order: 2,
      code: 'EC 2.2',
      title: 'Osciloscópios e Megómetros (Leitura de Sinais e Testes de Isolação)',
      norma: 'Boas Práticas de Engenharia e Padrões Industriais de Mercado',
      level: 'Intermediário',
      durationMinutes: 18,
      theory: {
        conceito: 'O Osciloscópio Digital (DSO) e o Megômetro (Medidor de Resistência de Isolação) são os dois instrumentos mais avançados para diagnóstico dinâmico de sinais e avaliação da integridade física de isolantes dielétricos. O Osciloscópio plota no domínio do tempo a forma de onda exata da grandeza (Volts versus tempo), permitindo mensurar amplitudes de pico a pico (V_pp), frequências, tempos de subida (rise time), ruídos e harmônicos através dos ajustes de Escala Vertical (Volts/divisão), Base de Tempo Horizontal (tempo/divisão) e Disparo (Trigger). O uso de pontas atenuadoras 10X eleva a impedância do osciloscópio para 10 MΩ e reduz a capacitância parasitária, exigindo calibração prévia do trimmer de compensação de ponta em onda quadrada de 1 kHz para eliminar deformações capacitivas. A garra de terra do osciloscópio é ligada diretamente ao terra de proteção da tomada: conectá-la a pontos sob tensão causa curto-circuito franco fase-terra; para medir sinais de potência flutuantes (como saída PWM de inversores), exige-se ponta diferencial ativa de alta tensão. O Megômetro realiza ensaios destrutivos controlados de rigidez dielétrica, injetando tensões contínuas elevadas (250 V, 500 V, 1000 V ou 2500 V CC) em circuitos rigorosamente DESENERGIZADOS para medir a corrente microscópica de fuga que atravessa o isolamento em Megaohms (MΩ) ou Gigaohms (GΩ). O diagnóstico preditivo avalia o Índice de Polarização (IP = R_10min / R_1min) e a Absorção Dielétrica (DAR = R_60s / R_30s): isolantes secos e saudáveis polarizam suas moléculas elevando a resistência ao longo do tempo (IP ≥ 2,0); isolantes contaminados por umidade mantêm corrente de fuga constante (IP < 1,5), sinalizando risco iminente de queima.',
        formulas: [
          {
            label: 'Tensão Pico a Pico no Osciloscópio',
            formula: 'V_pp = N_div_verticais × (Volts/div) × Fator_Atenuação',
            explicacao: 'Cálculo direto da amplitude pico a pico com correção da ponta de prova'
          },
          {
            label: 'Período e Frequência do Sinal',
            formula: 'T = N_div_horizontais × (Tempo/div) \t| \tf = 1 / T',
            explicacao: 'Período T em segundos e frequência f em Hertz calculados da tela do osciloscópio'
          },
          {
            label: 'Resistência de Isolação do Megômetro',
            formula: 'R_iso = V_teste(CC) / I_fuga \t(em MΩ ou GΩ)',
            explicacao: 'Relação entre a alta tensão contínua aplicada e a microcorrente de fuga'
          },
          {
            label: 'Índice de Polarização (IP)',
            formula: 'IP = R_10_min / R_1_min \t(IP ≥ 2,0 = Excelente)',
            explicacao: 'Relação entre resistência medida a 10 minutos e a 1 minuto de injeção CC'
          }
        ],
        pontosOperacionais: [
          'Compensação de Frequência da Ponta 10X: conectar a ponta no terminal de teste de 1 kHz do osciloscópio; se os cantos superiores da onda quadrada estiverem pontiagudos (hipercompensação) ou arredondados (subcompensação), ajustar o parafuso trimmer até obter uma onda perfeitamente plana.',
          'O Perigo Mortal do Terra do Osciloscópio: a garra tipo jacaré de terra do canal do osciloscópio é aterrada internamente ao chassi metálico; nunca ligue a garra de terra na fase de um circuito! Para medir entre duas fases ou no barramento CC de um inversor, utilize pontas diferenciais de alta tensão certificadas.',
          'Regra de Ouro do Teste com Megômetro: o circuito deve estar 100% desenergizado, bloqueado e com componentes eletrônicos sensíveis (sensores, placas de comando, relés de estado sólido) DESCONECTADOS antes do teste, pois a injeção de 500 V ou 1000 V CC queima circuitos integrados instantaneamente.',
          'Descarga Capacitiva Obrigatória: cabos elétricos longos e enrolamentos de motores atuam como capacitores gigantes que acumulam carga estática perigosa sob 1000 V CC; ao término do ensaio, o megômetro deve manter a ponta conectada até descarregar a tensão a zero volts através de seu resistor interno.'
        ],
        fieldCase: {
          localizacao: 'Fábrica de Cimento de Matola, Província de Maputo',
          cenario: 'Um motor elétrico trifásico de 400 V 75 kW que acionava um moinho de clínquer desarmava o disjuntor de proteção geral após fortes chuvas que inundaram as galerias de cabos. Com um multímetro comum na escala de continuidade, o eletricista mediu resistência infinita (> 2 MΩ) entre os condutores de fase e a carcaça e concluiu erroneamente que a fiação estava perfeita.',
          diagnostico: 'O multímetro comum injeta apenas 2 a 3 Volts CC em seu teste de resistência, incapaz de romper a película microscópica de umidade infiltrada na emenda dos cabos. Ao aplicar o Megômetro industrial com injeção de 500 V CC conforme as Boas Práticas de Engenharia e Padrões Industriais de Mercado, a resistência de isolamento real caiu imediatamente para 0,12 MΩ (120 kΩ), muito abaixo do limite mínimo aceitável de 1,0 MΩ, comprovando fuga severa sob tensão de trabalho.',
          solucaoNormativa: 'Secagem das galerias, corte da emenda infiltrada, execução de nova emenda selada com resina epóxi termorretrátil estanque e repetição do teste com megômetro a 1000 V CC, obtendo-se leitura estável de 480 MΩ com Índice de Polarização IP = 2,4, liberando a máquina com plena segurança operacional.'
        },
        funcionamento: 'O osciloscópio amostra milhões de pontos por segundo através de conversores A/D de alta velocidade e reconstrói graficamente a onda na tela com interpolação vetorial. No megômetro, um gerador eletrônico inversor eleva a tensão da bateria interna para centenas ou milhares de Volts CC contínuos e um amplificador de corrente de alta sensibilidade (electrômetro) mede microamperes ou nanoamperes de corrente de fuga através do isolante.',
        aplicacaoMocambique: 'Nas minas de Moatize e nas indústrias pesadas do centro e norte de Moçambique, os motores operam em regime severo sob poeira condutiva e umidade. A medição periódica trimestral do Índice de Polarização (IP) é a técnica preditiva padrão para agendar lavagem e revernizamento de estatores antes que ocorra queima catastrófica em serviço.',
        exemploPratico: 'Num teste de osciloscópio: um sinal ocupa 6 divisões verticais a 50 V/div (V_pp = 300 V; amplitude de pico V_p = 150 V). Na horizontal, 1 ciclo ocupa 8 divisões a 2,5 ms/div (T = 8 × 2,5 ms = 20 ms = 0,02 s). Frequência f = 1 / 0,02 = 50 Hz (frequência nominal da rede elétrica de Moçambique).',
        calculationSnippet: 'f = 1 / T | V_pp = div_v × (V/div) | IP = R_10min / R_1min ≥ 2,0'
      },
      quiz: {
        question: 'A tela de um osciloscópio digital exibe uma onda senoidal perfeitamente estabilizada. O ajuste vertical está configurado em 50 V/divisão (já calibrado para a ponta em uso) e o sinal ocupa exatamente 6 divisões verticais de pico a pico (V_pp). O ajuste horizontal de base de tempo está em 2,5 ms/divisão e um ciclo completo da onda ocupa exatamente 8 divisões horizontais. Determine o valor da amplitude de pico V_p da tensão e a frequência f do sinal em Hertz.',
        options: [
          { id: 'A', text: 'V_p = 150 V e f = 50 Hz.', isCorrect: true, feedback: 'Correto! V_pp = 6 div × 50 V/div = 300 V, logo V_p = 300 / 2 = 150 V. Período T = 8 div × 2,5 ms/div = 20 ms = 0,02 s; f = 1 / 0,02 s = 50 Hz.' },
          { id: 'B', text: 'V_p = 300 V e f = 50 Hz.', isCorrect: false, feedback: 'Incorreto. 300 V é a tensão pico a pico (V_pp); a amplitude de pico V_p é a metade (150 V).' },
          { id: 'C', text: 'V_p = 150 V e f = 20 Hz.', isCorrect: false, feedback: 'Incorreto. Confundiu o período de 20 ms com a frequência; f = 1 / T = 1 / 0,02 s = 50 Hz.' },
          { id: 'D', text: 'V_p = 75 V e f = 60 Hz.', isCorrect: false, feedback: 'Incorreto. Erro de cálculo na leitura das divisões verticais e na inversão do período.' }
        ],
        explanation: '1) Amplitude Vertical: A tensão pico a pico é V_pp = 6 divisões × 50 V/div = 300 V. A amplitude de pico em relação ao zero de referência é a metade: V_p = V_pp / 2 = 300 V / 2 = 150 V. 2) Período e Frequência Horizontal: O período é T = 8 divisões × 2,5 ms/div = 20 ms = 0,020 segundos. A frequência é o inverso do período: f = 1 / T = 1 / 0,020 s = 50 Hz (frequência padrão da rede elétrica EDM).',
        keyTakeaway: 'Osciloscópio: V_p = (Div_v × Escala_v) / 2 e f = 1 / (Div_h × Base_tempo); 6 div a 50V/div = 150 Vp; 8 div a 2,5ms = 50 Hz.',
        xpReward: 50
      },
      assessmentQuestions: [
        {
          id: 'elec_m2_ec2_q1_osciloscopio_calculo',
          type: 'multiple_choice',
          question: 'A tela de um osciloscópio digital exibe uma onda senoidal perfeitamente estabilizada. O ajuste vertical está configurado em 50 V/divisão (já calibrado para a ponta em uso) e o sinal ocupa exatamente 6 divisões verticais de pico a pico (V_pp). O ajuste horizontal de base de tempo está em 2,5 ms/divisão e um ciclo completo da onda ocupa exatamente 8 divisões horizontais. Determine o valor da amplitude de pico V_p da tensão e a frequência f do sinal em Hertz.',
          scenario: 'Leitura e interpretação de formas de onda periódicas no osciloscópio para determinação de amplitude de pico e frequência.',
          norma: 'Boas Práticas de Engenharia e Padrões Industriais de Mercado',
          points: 33,
          explanation: 'V_pp = 6 × 50 = 300 V, logo V_p = 300 / 2 = 150 V. Período T = 8 × 2,5 ms = 20 ms = 0,02 s. Frequência f = 1 / T = 1 / 0,02 s = 50 Hz.',
          keyTakeaway: 'Osciloscópio: V_p = V_pp / 2 (150 V) e f = 1 / T (50 Hz).',
          options: [
            { id: 'opt_m221_1', text: 'V_p = 150 V e f = 50 Hz.', isCorrect: true, feedback: 'Correto! V_pp = 300 V -> V_p = 150 V; T = 20 ms -> f = 1 / 0,02 = 50 Hz.' },
            { id: 'opt_m221_2', text: 'V_p = 300 V e f = 50 Hz.', isCorrect: false, feedback: 'Incorreto. 300 V é o valor pico a pico total, não a amplitude de pico V_p.' },
            { id: 'opt_m221_3', text: 'V_p = 150 V e f = 200 Hz.', isCorrect: false, feedback: 'Incorreto. Erro na inversão da base de tempo.' },
            { id: 'opt_m221_4', text: 'V_p = 106 V e f = 50 Hz.', isCorrect: false, feedback: 'Incorreto. 106 V seria a tensão eficaz (RMS), não a amplitude de pico solicitada.' }
          ]
        },
        {
          id: 'elec_m2_ec2_q2_indice_polarizacao',
          type: 'multiple_choice',
          question: 'Durante o comissionamento de um transformador de distribuição a seco trifásico de 400 kVA, o engenheiro realiza o ensaio de resistência de isolamento com megômetro microprocessado a 1000 V CC entre o primário e a carcaça aterrada. Foram registrados os seguintes valores: R_1min = 80 MΩ e R_10min = 96 MΩ. Calcule o Índice de Polarização (IP) e apresente o diagnóstico conclusivo sobre a integridade do isolamento segundo os padrões industriais de mercado.',
          scenario: 'Cálculo do Índice de Polarização (IP) e diagnóstico preditivo da qualidade dielétrica de transformadores.',
          norma: 'Boas Práticas de Engenharia e Padrões Industriais de Mercado',
          points: 33,
          explanation: 'O Índice de Polarização é definido por IP = R_10min / R_1min = 96 MΩ / 80 MΩ = 1,20. Pelos padrões industriais consolidados, um isolamento elétrico saudável e seco deve apresentar IP ≥ 2,0. Um valor de IP = 1,20 (< 1,5) diagnostica contaminação severa por umidade higroscópica e poeira nos enrolamentos, exigindo secagem e tratamento prévio antes de energizar.',
          keyTakeaway: 'IP = R_10min / R_1min: Valores abaixo de 1,50 indicam isolamento úmido ou contaminado que reprova o equipamento.',
          options: [
            { id: 'opt_m222_1', text: 'IP = 1,20; isolamento insatisfatório (reprovado por alta absorção de umidade/contaminação, pois IP < 1,50).', isCorrect: true, feedback: 'Excelente! IP = 96 / 80 = 1,20. Como é inferior a 1,50, comprova umidade excessiva e risco de curto se energizado.' },
            { id: 'opt_m222_2', text: 'IP = 1,20; isolamento considerado excelente e apto para energização imediata.', isCorrect: false, feedback: 'Incorreto. O critério industrial mínimo para isolamento saudável exige IP ≥ 2,0.' },
            { id: 'opt_m222_3', text: 'IP = 0,83; isolamento com fuga reversa destrutiva.', isCorrect: false, feedback: 'Incorreto. Inverteu o cálculo dividindo a leitura de 1 minuto pela de 10 minutos (80 / 96).' },
            { id: 'opt_m222_4', text: 'IP = 16,0; isolamento hiperdimensionado.', isCorrect: false, feedback: 'Incorreto. Subtraiu as resistências (96 - 80) em vez de calcular a razão matemática.' }
          ]
        },
        {
          id: 'elec_m2_ec2_q3_ensaio_cabos_subterraneos',
          type: 'multiple_choice',
          question: 'Um técnico executa o ensaio de isolamento de uma linha subterrânea recém-lançada de cabos tetrapolares de 4 × 16 mm² com 120 metros de extensão entre um gerador de emergência e o quadro QTA. Com todos os circuitos desenergizados e desconectados, o técnico injeta 500 V CC com megômetro entre cada condutor de fase e o condutor de terra/neutro. A Fase L1 mediu 850 MΩ; a Fase L2 mediu 920 MΩ; entretanto, a Fase L3 estabilizou em apenas 0,35 MΩ (350 kΩ). Qual é a interpretação técnica rigorosa desse conjunto de medições?',
          scenario: 'Interpretação de medições de resistência de isolamento em condutores elétricos subterrâneos segundo as boas práticas.',
          norma: 'Boas Práticas de Engenharia e Padrões Industriais de Mercado',
          points: 34,
          explanation: 'As Boas Práticas de Engenharia e Padrões Industriais de Mercado fixam o valor mínimo admissível de resistência de isolamento em 1,0 MΩ para circuitos de baixa tensão sob ensaio de 500 V CC. Enquanto L1 (850 MΩ) e L2 (920 MΩ) estão em perfeitas condições, a Fase L3 registrou 0,35 MΩ (< 1,0 MΩ), comprovando que seu isolamento foi danificado mecanicamente (esmagamento, corte na quina da tubulação ou infiltração de água), exigindo reparo antes da energização.',
          keyTakeaway: 'Resistência Mínima de Isolação em BT: 1,0 MΩ a 500 V CC; valor de 0,35 MΩ reprova a linha e indica condutor danificado.',
          options: [
            { id: 'opt_m223_1', text: 'As fases L1 e L2 estão conformes, mas a Fase L3 está reprovada (0,35 MΩ < 1,0 MΩ), indicando dano mecânico na isolação ou umidade no duto.', isCorrect: true, feedback: 'Correto! O limite mínimo normativo é 1,0 MΩ. A Fase L3 está com fuga excessiva e causará disparo de proteções se energizada.' },
            { id: 'opt_m223_2', text: 'Todos os condutores estão aprovados, pois qualquer valor acima de 0,1 MΩ é suficiente para corrente contínua.', isCorrect: false, feedback: 'Incorreto. O padrão internacional mínimo consolidado é rigorosamente 1,0 MΩ sob 500 V CC.' },
            { id: 'opt_m223_3', text: 'A medição da Fase L3 está correta porque cabos subterrâneos sempre perdem 90% da resistência natural.', isCorrect: false, feedback: 'Incorreto. Cabos novos intactos em dutos devem apresentar centenas de Megaohms como L1 e L2.' },
            { id: 'opt_m223_4', text: 'O megômetro descalibrou na terceira medição e o ensaio deve ser repetido com multímetro comum.', isCorrect: false, feedback: 'Incorreto. O multímetro não possui tensão suficiente para ensaios de isolamento dielétrico.' }
          ]
        }
      ]
    },

    // ------------------------------------------------------------------------
    // ELEMENTO 2.3: Grandezas em CA: Valores de Pico, Médio, Eficaz e True-RMS
    // ------------------------------------------------------------------------
    {
      id: 'elec_m2_ec3_grandezas_ca_truerms',
      moduleId: 'elec_mod_2_instrumentacao',
      moduleTitle: 'Módulo 2: Instrumentação, Medição e Grandezas Elétricas',
      order: 3,
      code: 'EC 2.3',
      title: 'Grandezas em CA: Valores de Pico, Médio, Eficaz e True-RMS',
      norma: 'Boas Práticas de Engenharia e Padrões Industriais de Mercado',
      level: 'Básico',
      durationMinutes: 16,
      theory: {
        conceito: 'Em corrente alternada (CA), a tensão e a corrente variam continuamente em magnitude e periodicamente em sentido, exigindo definições metrológicas precisas para quantificar sua capacidade de realizar trabalho e transferir potência. A função senoidal pura é expressa por v(t) = V_p·sen(ωt). O Valor de Pico (V_p) é o valor instantâneo máximo atingido pela onda em relação ao zero; o Valor Pico a Pico (V_pp = 2·V_p) é a amplitude total entre crista positiva e vale negativo. O Valor Médio (V_med) é a média aritmética dos valores instantâneos: em um ciclo completo simétrico, V_med = 0; em meio ciclo senoidal, V_med = (2·V_p) / π ≈ 0,637·V_p. O Valor Eficaz ou RMS (Root Mean Square) é a grandeza mais fundamental da eletrotécnica: representa o valor constante de corrente contínua que dissipa rigorosamente a mesma potência média térmica por efeito Joule na mesma resistência resistiva: V_rms = √[(1/T) ∫ v²(t) dt]. Para uma senóide pura, V_rms = V_p / √2 ≈ 0,7071·V_p (e V_p = √2·V_rms ≈ 1,4142·V_rms). O Fator de Forma (k_f = V_rms / V_med ≈ 1,11) e o Fator de Crista (k_c = V_p / V_rms = √2 ≈ 1,414) definem o perfil geométrico da onda. Instrumentos comuns de resposta média retificam o sinal, medem o valor médio e multiplicam por 1,11 assumindo que a onda é uma senóide perfeita. Quando medem ondas distorcidas geradas por eletrônica de potência (inversores, no-breaks, computadores, iluminação LED), esses medidores erram em até 40% a menos. Já os instrumentos True-RMS (Valor Eficaz Verdadeiro) amostram a forma real do sinal ou utilizam transdutores térmicos integradores, calculando a raiz quadrada média verdadeira com exatidão absoluta.',
        formulas: [
          {
            label: 'Relação de Pico e Eficaz (Senóide Pura)',
            formula: 'V_rms = V_p / √2 ≈ 0,7071 × V_p \t| \tV_p = √2 × V_rms ≈ 1,4142 × V_rms',
            explicacao: 'V_rms = 230 V na rede EDM resulta em tensão máxima de pico V_p ≈ 325,3 V'
          },
          {
            label: 'Tensão Pico a Pico',
            formula: 'V_pp = 2 × V_p = 2 × √2 × V_rms ≈ 2,8284 × V_rms',
            explicacao: 'Amplitude total de oscilação que solicita a rigidez dos dielétricos'
          },
          {
            label: 'Fator de Forma e Fator de Crista',
            formula: 'k_f = V_rms / V_med ≈ 1,11 \t| \tk_c = V_p / V_rms ≈ 1,414',
            explicacao: 'Em pulsos de corrente não lineares, k_c pode superar 3,0 a 5,0'
          },
          {
            label: 'Equação Universal de Valor Eficaz',
            formula: 'V_rms = √[(1 / T) × ∫₀ᵀ v²(t) dt] \t(True-RMS por DSP)',
            explicacao: 'Cálculo matemático rigoroso do valor eficaz independente da forma de onda'
          }
        ],
        pontosOperacionais: [
          'Diferença Crucial de Leitura em Campo: Medidores comuns baratos medem valor médio e calibram para 1,11; em cargas com inversores VFD ou fontes de computador, eles subestimam a corrente real em até 40%, mascarando sobrecargas perigosas em cabos e transformadores.',
          'Exigência Obrigatória de True-RMS: As boas práticas de engenharia e os padrões industriais de mercado exigem exclusivamente o uso de alicates e multímetros certificados com tecnologia True-RMS para medição de correntes e tensões em qualquer instalação comercial ou industrial moderna.',
          'Fator de Crista e Saturação de Instrumentos: Ao medir cargas com pulsos muito estreitos de corrente (fontes chaveadas), verificar a especificação do fator de crista do alicate (geralmente k_c ≤ 3,0 em fundo de escala); se o sinal exceder a faixa linear do conversor, a medição saturará e perderá exatidão.',
          'Tensão Suportável de Dielétricos e Varistores: Embora a tensão nominal da rede da EDM seja de 230 Vrms, componentes de isolamento, capacitores e protetores de surto DPS devem ser dimensionados para a tensão de pico máxima contínua (mínimo de 325 V a 385 V).'
        ],
        fieldCase: {
          localizacao: 'Data Center Bancário de Maputo, Província de Maputo',
          cenario: 'Um quadro elétrico que alimentava 40 racks de servidores e no-breaks operava com cabos de alimentação superaquecidos a 68 °C. O eletricista predial utilizou um alicate amperímetro comum de baixo custo e mediu 42 A contínuos (abaixo da capacidade nominal do cabo de 55 A), não compreendendo por que o disjuntor de 50 A desarmava por sobrecarga térmica a cada duas horas.',
          diagnostico: 'As fontes chaveadas comutadas dos servidores drenam corrente em pulsos estreitos não-senoidais com alto teor harmônico e fator de crista de k_c = 2,9. O instrumento de resposta média subestimava o sinal em 32%. Ao conectar um alicate amperímetro industrial certificado True-RMS com banda passante de 1 kHz, o valor eficaz verdadeiro medido foi de 61,8 A! A instalação operava com 23% de sobrecorrente térmica contínua.',
          solucaoNormativa: 'Padronização do uso exclusivo de instrumentos True-RMS pela equipe de manutenção, redistribuição imediata das cargas de servidores em novos circuitos terminais dedicados e substituição dos cabos alimentadores por condutores de 16 mm² compatíveis com a corrente eficaz verdadeira segundo as Boas Práticas de Engenharia e Padrões Industriais de Mercado.'
        },
        funcionamento: 'A equivalência energética do valor RMS decorre da física térmica do efeito Joule: a potência instantânea dissipada em um resistor é p(t) = R·[i(t)]². Como a corrente varia no tempo, a potência média é a integral de i² dividida pelo período. Ao tirar a raiz quadrada dessa média, obtém-se o valor escalar constante que, elevado ao quadrado e multiplicado por R, resulta exatamente na mesma potência de uma fonte CC idêntica.',
        aplicacaoMocambique: 'A proliferação de lâmpadas LED de baixa qualidade, condicionadores de ar tipo inverter e carregadores eletrônicos nas residências e comércios de Moçambique torna quase impossível encontrar formas de onda puramente senoidais na rede de baixa tensão. O uso de instrumentos True-RMS tornou-se mandatório em todo o país.',
        exemploPratico: 'Na rede pública de 230 Vrms da EDM: a tensão de pico é V_p = 230 × 1,4142 = 325,3 V. A tensão pico a pico que estressa o isolamento do cabo é V_pp = 2 × 325,3 = 650,6 V. Qualquer capacitor conectado em paralelo com a rede deve possuir tensão nominal mínima de isolamento de 400 V ou 450 V CC para suportar o pico com segurança.',
        calculationSnippet: 'V_p = √2 × V_rms ≈ 1,4142 × V_rms | V_pp = 2 × V_p | k_c = V_p / V_rms'
      },
      quiz: {
        question: 'Em uma tomada de bancada conectada à rede pública de baixa tensão da EDM com valor eficaz nominal medido de V_rms = 230,0 V em 50 Hz com forma de onda senoidal pura: qual é o valor exato da tensão máxima de pico (V_p) e da amplitude de tensão pico a pico (V_pp) que solicita os materiais isolantes e varistores de proteção?',
        options: [
          { id: 'A', text: 'V_p ≈ 325,3 V e V_pp ≈ 650,5 V.', isCorrect: true, feedback: 'Correto! V_p = √2 × V_rms = 1,4142 × 230,0 V = 325,27 V ≈ 325,3 V. A tensão pico a pico é o dobro: V_pp = 2 × 325,27 V = 650,54 V ≈ 650,5 V.' },
          { id: 'B', text: 'V_p = 230,0 V e V_pp = 460,0 V.', isCorrect: false, feedback: 'Incorreto. 230 V é a tensão eficaz (RMS), não o valor máximo de pico de uma senóide.' },
          { id: 'C', text: 'V_p ≈ 162,6 V e V_pp ≈ 325,3 V.', isCorrect: false, feedback: 'Incorreto. Dividiu a tensão eficaz por √2 em vez de multiplicar.' },
          { id: 'D', text: 'V_p ≈ 400,0 V e V_pp ≈ 800,0 V.', isCorrect: false, feedback: 'Incorreto. 400 V é a tensão nominal de linha inter-fases em trifásico, não o pico da fase de 230 V.' }
        ],
        explanation: 'Para uma forma de onda alternada senoidal pura, a relação matemática fundamental entre o valor eficaz (RMS) e o valor de pico é V_p = √2 × V_rms. Substituindo o valor nominal da EDM: V_p = 1,414213 × 230,0 V = 325,27 V ≈ 325,3 V. A tensão pico a pico corresponde à excursão total entre o extremo positivo e o extremo negativo: V_pp = 2 × V_p = 2 × 325,27 V = 650,54 V ≈ 650,5 V.',
        keyTakeaway: 'V_p = √2 × V_rms (325,3 V) e V_pp = 2 × V_p (650,5 V): A isolação deve suportar picos instantâneos 41% superiores ao valor eficaz.',
        xpReward: 50
      },
      assessmentQuestions: [
        {
          id: 'elec_m2_ec3_q1_pico_eficaz_senoidal',
          type: 'multiple_choice',
          question: 'Em uma tomada de bancada conectada à rede pública de baixa tensão da EDM com valor eficaz nominal medido de V_rms = 230,0 V em 50 Hz com forma de onda senoidal pura: qual é o valor exato da tensão máxima de pico (V_p) e da amplitude de tensão pico a pico (V_pp) que solicita os materiais isolantes e varistores de proteção?',
          scenario: 'Cálculo de grandezas instantâneas e valores de pico em regime alternado senoidal puro.',
          norma: 'Boas Práticas de Engenharia e Padrões Industriais de Mercado',
          points: 33,
          explanation: 'V_p = √2 × V_rms = 1,4142 × 230,0 = 325,27 V ≈ 325,3 V. V_pp = 2 × V_p = 2 × 325,27 = 650,54 V ≈ 650,5 V.',
          keyTakeaway: 'V_p = 1,4142 × V_rms; para 230 Vrms a crista de pico atinge 325,3 V e V_pp atinge 650,5 V.',
          options: [
            { id: 'opt_m231_1', text: 'V_p ≈ 325,3 V e V_pp ≈ 650,5 V.', isCorrect: true, feedback: 'Correto! V_p = √2 × 230 = 325,3 V; V_pp = 2 × 325,3 = 650,5 V.' },
            { id: 'opt_m231_2', text: 'V_p = 230,0 V e V_pp = 460,0 V.', isCorrect: false, feedback: 'Incorreto. Confundiu valor eficaz com valor de pico.' },
            { id: 'opt_m231_3', text: 'V_p ≈ 162,6 V e V_pp ≈ 325,3 V.', isCorrect: false, feedback: 'Incorreto. Dividiu a tensão por √2 em vez de multiplicar.' },
            { id: 'opt_m231_4', text: 'V_p ≈ 356,0 V e V_pp ≈ 712,0 V.', isCorrect: false, feedback: 'Incorreto. Erro de aproximação aritmética na raiz de 2.' }
          ]
        },
        {
          id: 'elec_m2_ec3_q2_erro_resposta_media',
          type: 'multiple_choice',
          question: 'Um circuito eletrônico industrial de potência com controle por tiristores gera uma forma de onda de corrente em onda quadrada simétrica alternada com amplitude de pico I_p = 10,0 A (para a qual se sabe matematicamente que o valor eficaz real é I_rms = 10,0 A e o valor médio do semiciclo é I_med = 10,0 A). Um instrumento comum de resposta média calibrado para senóides (que mede o valor médio e multiplica pelo fator 1,11) é colocado em série com um alicate amperímetro de tecnologia True-RMS. Quais leituras serão exibidas nos dois instrumentos e qual é o erro percentual do medidor comum?',
          scenario: 'Análise comparativa metrológica de erro entre instrumentos de resposta média calibrados em RMS e instrumentos True-RMS.',
          norma: 'Boas Práticas de Engenharia e Padrões Industriais de Mercado',
          points: 33,
          explanation: '1) O medidor True-RMS calcula a raiz quadrada média real e exibe exatamente I_True-RMS = 10,0 A. 2) O medidor comum mede o valor médio (10,0 A) e aplica o fator senoidal padrão fixo: I_comum = 1,11 × 10,0 A = 11,1 A. 3) O erro relativo é: Erro = [(11,1 - 10,0) / 10,0] × 100% = +11,0% a mais da corrente real.',
          keyTakeaway: 'Medidores de resposta média assumem k_f = 1,11 de uma senóide; em ondas não-senoidais erram sistematicamente (+11% em onda quadrada).',
          options: [
            { id: 'opt_m232_1', text: 'True-RMS lê 10,0 A; Medidor Comum lê 11,1 A (erro de +11,0% a mais).', isCorrect: true, feedback: 'Perfeito! O True-RMS lê o valor eficaz real (10,0 A); o comum aplica 1,11 × I_med resultando em 11,1 A (+11% de erro).' },
            { id: 'opt_m232_2', text: 'True-RMS lê 14,1 A; Medidor Comum lê 10,0 A (erro de -29,1%).', isCorrect: false, feedback: 'Incorreto. O valor eficaz de onda quadrada é igual ao seu valor de pico (10 A), não √2 vezes o pico.' },
            { id: 'opt_m232_3', text: 'Ambos os instrumentos lerão rigorosamente 10,0 A com erro nulo.', isCorrect: false, feedback: 'Incorreto. Medidores comuns erram sob qualquer forma de onda que não seja senóide pura.' },
            { id: 'opt_m232_4', text: 'True-RMS lê 7,07 A; Medidor Comum lê 10,0 A.', isCorrect: false, feedback: 'Incorreto. Multiplicou por 0,707 que só é válido para senóides, não para onda quadrada.' }
          ]
        },
        {
          id: 'elec_m2_ec3_q3_fator_crista_saturacao',
          type: 'multiple_choice',
          question: 'Ao monitorar os condutores de alimentação de um conjunto de inversores de frequência com um osciloscópio e analisador de energia, o técnico registra uma corrente eficaz de I_rms = 20,0 A e uma corrente de crista máxima de pico de I_p = 64,0 A. Calcule o Fator de Crista (k_c) dessa forma de onda e interprete se um alicate amperímetro com especificação de catálogo de k_c ≤ 2,0 em fundo de escala é tecnicamente adequado para monitorar essa carga contínua.',
          scenario: 'Cálculo de fator de crista e diagnóstico de saturação dinâmica em instrumentos de medição de corrente.',
          norma: 'Boas Práticas de Engenharia e Padrões Industriais de Mercado',
          points: 34,
          explanation: 'O Fator de Crista é a razão entre a corrente de pico e a corrente eficaz: k_c = I_p / I_rms = 64,0 A / 20,0 A = 3,2. Como o fator de crista do circuito (3,2) é superior à capacidade linear máxima suportada pelo instrumento (k_c ≤ 2,0), os amplificadores de entrada e o conversor A/D do alicate entrarão em saturação (ceifamento de pico), gerando erro severo de medição por incapacidade de capturar a amplitude total dos pulsos estreitos.',
          keyTakeaway: 'k_c = I_p / I_rms: Fator de crista de 3,2 satura alicates comuns especificados para k_c ≤ 2,0, falseando a medição.',
          options: [
            { id: 'opt_m233_1', text: 'k_c = 3,2; o instrumento é INADEQUADO, pois entrará em saturação/ceifamento ao exceder seu limite linear de k_c ≤ 2,0.', isCorrect: true, feedback: 'Excelente! k_c = 64 / 20 = 3,2. O alicate satura por ter capacidade máxima de apenas 2,0, gerando submedição grave.' },
            { id: 'opt_m233_2', text: 'k_c = 0,31; o instrumento é perfeitamente adequado com ampla folga de segurança.', isCorrect: false, feedback: 'Incorreto. Inverteu o cálculo dividindo a corrente eficaz pelo pico (20 / 64).' },
            { id: 'opt_m233_3', text: 'k_c = 1,41; o instrumento medirá com erro desprezível de 1%.', isCorrect: false, feedback: 'Incorreto. 1,41 é o fator de crista de uma senóide pura, não da onda com pico de 64 A sob 20 A eficazes.' },
            { id: 'opt_m233_4', text: 'k_c = 3,2; o instrumento é adequado porque qualquer alicate True-RMS suporta fator de crista infinito.', isCorrect: false, feedback: 'Incorreto. Todo conversor A/D real possui limite físico finito de faixa dinâmica de crista.' }
          ]
        }
      ]
    },

    // ------------------------------------------------------------------------
    // ELEMENTO 2.4: Fator de Potência (Triângulo de Potências P, Q, S) e Harmónicos (THD)
    // ------------------------------------------------------------------------
    {
      id: 'elec_m2_ec4_fator_potencia_harmonics_thd',
      moduleId: 'elec_mod_2_instrumentacao',
      moduleTitle: 'Módulo 2: Instrumentação, Medição e Grandezas Elétricas',
      order: 4,
      code: 'EC 2.4',
      title: 'Fator de Potência (Triângulo de Potências P, Q, S) e Harmónicos (THD)',
      norma: 'Boas Práticas de Engenharia e Padrões Industriais de Mercado',
      level: 'Intermediário',
      durationMinutes: 18,
      theory: {
        conceito: 'Em sistemas de corrente alternada, a potência total movimentada divide-se em componentes ativas e reativas representadas geometricamente pelo Triângulo de Potências. A Potência Ativa (P, em Watts ou kW) é a taxa temporal em que a energia elétrica é efetivamente convertida em trabalho útil (energia mecânica no eixo, radiação luminosa ou calor térmico) e é faturada pela concessionária (kWh). A Potência Reativa (Q, em VAr ou kVAr) é necessária para criar e sustentar os campos magnéticos alternados em motores de indução e transformadores (reativo indutivo, +Q) ou campos elétricos em capacitores (reativo capacitivo, -Q); ela oscila entre a fonte e a carga sem produzir trabalho direto, mas sobrecarrega condutores e geradores com corrente adicional inútil. A Potência Aparente (S, em VA ou kVA) é o produto das grandezas eficazes totais (S = V_rms·I_rms = √(P² + Q²)). O Fator de Potência de Deslocamento (DPF = cos φ₁) expressa o cosseno da defasagem angular entre a tensão e a corrente na frequência fundamental de 50 Hz. Contudo, em ambientes industriais modernos com cargas não-lineares (retificadores, inversores VFD, no-breaks, computadores), a corrente é distorcida e rica em frequências harmônicas (h = 2, 3, 5, 7, ... com f_h = h·50 Hz), introduzindo a Potência de Distorção (D, em VAd) na equação geral da potência aparente: S = √(P² + Q² + D²). A Distorção Harmônica Total de Corrente (THD_I = [√(Σ I_h²) / I₁] × 100%) degrada o Fator de Potência Total Real: FP_total = cos φ₁ · [1 / √(1 + THD_I²)]. Harmônicos de 3ª ordem (150 Hz) e seus múltiplos ímpares (triplens) somam-se aritmeticamente no condutor de neutro de sistemas trifásicos, provocando sobreaquecimento severo e risco de incêndio mesmo em sistemas com fases equilibradas.',
        formulas: [
          {
            label: 'Triângulo de Potências Clássico (Senoidal)',
            formula: 'S = √(P² + Q²) \t| \tP = S × cos φ \t| \tQ = S × sen φ',
            explicacao: 'Potência Ativa (W), Reativa (VAr) e Aparente (VA) no regime linear puro'
          },
          {
            label: 'Potência Aparente com Distorção Harmônica',
            formula: 'S = √(P² + Q² + D²)',
            explicacao: 'D é a potência de distorção harmônica em VAd produzida por cargas não-lineares'
          },
          {
            label: 'Fator de Potência Total Real',
            formula: 'FP_total = P / S = cos φ₁ × [1 / √(1 + THD_I²)]',
            explicacao: 'O FP cai com a defasagem angular e também com a distorção harmônica'
          },
          {
            label: 'Distorção Harmônica Total de Corrente (THD)',
            formula: 'THD_I = [√(I₂² + I₃² + I₄² + ...) / I₁] × 100%',
            explicacao: 'Relação percentual entre o conteúdo harmônico total e a corrente fundamental de 50 Hz'
          }
        ],
        pontosOperacionais: [
          'Diferença Crítica entre cos φ e FP Real: Muitos eletricistas medem apenas o cos φ fundamental (que pode estar em 0,98) e não entendem por que o transformador está superaquecido e a fatura da EDM vem penalizada; com THD_I de 60%, o FP real despenca para 0,84.',
          'O Risco Fatal da Ressonância com Bancos de Capacitores: Conectar bancos de capacitores comuns em instalações com alto THD de 5ª (250 Hz) e 7ª harmônica (350 Hz) cria um circuito tanque LC ressonante em paralelo com a indutância do transformador da EDM; as correntes harmônicas amplificam-se em até 10 vezes, estufando e explodindo os capacitores.',
          'Solução com Filtros Desintonizados (Detuned): Em redes com THD_I > 15%, é obrigatório instalar reatores de dessintonia em série com os capacitores (reatores de bloqueio de 7% ou 14%, sintonizados em 189 Hz ou 134 Hz), tornando o conjunto indutivo para todas as frequências harmônicas.',
          'Sobrecarga Crítica do Condutor de Neutro por 3ª Harmônica: Em edifícios de escritórios e bancos, as correntes de 3ª harmônica (150 Hz) das fontes monofásicas somam-se no neutro; a corrente de neutro pode atingir de 130% a 170% da corrente de fase, exigindo condutores de neutro com seção duplicada (200%).'
        ],
        fieldCase: {
          localizacao: 'Zona Industrial da Machava, Província de Maputo',
          cenario: 'Uma fábrica metalúrgica equipada com pontes retificadoras e máquinas de solda inversora pagava multas pesadas de energia reativa à EDM, registrando fator de potência médio de 0,78. O eletricista local conectou um banco de capacitores fixo comum de 50 kVAr. Duas semanas após a instalação, dois estágios de capacitores estufaram e explodiram com fumaça tóxica.',
          diagnostico: 'A medição com analisador de qualidade de energia revelou que a corrente da instalação possuía THD_I de 42% com forte componente de 5ª harmônica (250 Hz). A reatância capacitiva diminui com a frequência (X_C = 1 / [2π·f·C]); a 250 Hz a impedância dos capacitores caiu 5 vezes, drenando correntes harmônicas gigantescas que superaqueceram os dielétricos em ressonância paralela com o transformador da subestação.',
          solucaoNormativa: 'Substituição por um banco automático de capacitores com indutores anti-ressonância (detuned a 7% / 189 Hz) associado a um filtro ativo de harmônicos (AHF), elevando o fator de potência para 0,95 e reduzindo o THD_I de 42% para menos de 4%, eliminando o risco de explosão conforme as Boas Práticas de Engenharia e Padrões Industriais de Mercado.'
        },
        funcionamento: 'A potência ativa é a única que realiza trabalho efetivo ao longo do tempo porque resulta do produto de componentes de tensão e corrente que estão na mesma frequência e em fase, gerando potência média positiva. Componentes reativas oscilam com média líquida nula em um ciclo completo, e componentes harmônicas de corrente em frequências diferentes da tensão fundamental não produzem trabalho ativo líquido com a tensão da rede, convertendo-se integralmente em perdas térmicas e distorção.',
        aplicacaoMocambique: 'A EDM instala contadores eletrônicos inteligentes de quatro quadrantes que registram separadamente a energia ativa (kWh), a energia reativa indutiva (kVArh) e a capacitiva. Instalações que não corrigem o fator de potência ou sobrecorrigem para regime capacitivo em vazio sofrem pesadas sobretaxas na fatura de energia.',
        exemploPratico: 'Uma indústria com P = 80 kW e S = 100 kVA opera com FP = 80 / 100 = 0,80. Pelo Triângulo de Potências: Q = √(100² - 80²) = √(10000 - 6400) = √3600 = 60 kVAr. Para corrigir o FP para 0,95 (tan φ₂ = 0,3287, enquanto tan φ₁ = 0,75), a potência do banco de capacitores necessária é Q_c = P × (tan φ₁ - tan φ₂) = 80 × (0,75 - 0,3287) = 80 × 0,4213 = 33,7 kVAr.',
        calculationSnippet: 'S = √(P² + Q²) | FP = P / S | FP_total = cos φ₁ / √(1 + THD²)'
      },
      quiz: {
        question: 'Um analisador de energia conectado ao painel geral monofásico de 230 V 50 Hz de uma oficina registra uma potência ativa de P = 18,4 kW e uma corrente eficaz contínua de I = 100,0 A. Calcule a potência aparente S, o fator de potência (FP) da instalação e a potência reativa Q consumida pela carga.',
        options: [
          { id: 'A', text: 'S = 23,0 kVA, FP = 0,80 e Q = 13,8 kVAr.', isCorrect: true, feedback: 'Correto! S = V × I = 230 V × 100 A = 23000 VA = 23,0 kVA. FP = P / S = 18,4 kW / 23,0 kVA = 0,80. Pelo Teorema de Pitágoras: Q = √(S² - P²) = √(23,0² - 18,4²) = √(529 - 338,56) = √190,44 = 13,8 kVAr.' },
          { id: 'B', text: 'S = 18,4 kVA, FP = 1,00 e Q = 0 kVAr.', isCorrect: false, feedback: 'Incorreto. A potência aparente calculada é de 23 kVA, superior à potência ativa de 18,4 kW.' },
          { id: 'C', text: 'S = 23,0 kVA, FP = 1,25 e Q = 4,6 kVAr.', isCorrect: false, feedback: 'Incorreto. O fator de potência nunca pode ultrapassar 1,00; dividiu S por P invertido.' },
          { id: 'D', text: 'S = 23,0 kVA, FP = 0,80 e Q = 4,6 kVAr.', isCorrect: false, feedback: 'Incorreto. Subtraiu algebricamente (23,0 - 18,4 = 4,6) em vez de aplicar Pitágoras vetorial √(S² - P²).' }
        ],
        explanation: '1) Potência Aparente: S = V × I = 230 V × 100,0 A = 23000 VA = 23,0 kVA. 2) Fator de Potência: FP = P / S = 18,4 kW / 23,0 kVA = 0,80. 3) Potência Reativa pelo Triângulo de Potências: Q = √(S² - P²) = √(23,0² - 18,4²) = √(529 - 338,56) = √190,44 = 13,8 kVAr. O fator de potência de 0,80 está abaixo do mínimo regulamentar de 0,92 exigido pela concessionária.',
        keyTakeaway: 'Triângulo de Potências: S = V × I = 23 kVA; FP = P / S = 0,80; Q = √(S² - P²) = 13,8 kVAr.',
        xpReward: 50
      },
      assessmentQuestions: [
        {
          id: 'elec_m2_ec4_q1_triangulo_potencias_calc',
          type: 'multiple_choice',
          question: 'Um analisador de energia conectado ao painel geral monofásico de 230 V 50 Hz de uma oficina registra uma potência ativa de P = 18,4 kW e uma corrente eficaz contínua de I = 100,0 A. Calcule a potência aparente S, o fator de potência (FP) da instalação e a potência reativa Q consumida pela carga.',
          scenario: 'Determinação completa das componentes do Triângulo de Potências em regime de corrente alternada.',
          norma: 'Boas Práticas de Engenharia e Padrões Industriais de Mercado',
          points: 33,
          explanation: 'S = V × I = 230 × 100 = 23000 VA = 23,0 kVA. FP = P / S = 18,4 / 23,0 = 0,80. Q = √(S² - P²) = √(23² - 18,4²) = √(529 - 338,56) = √190,44 = 13,8 kVAr.',
          keyTakeaway: 'S = V × I = 23 kVA; FP = P / S = 0,80; Q = √(S² - P²) = 13,8 kVAr.',
          options: [
            { id: 'opt_m241_1', text: 'S = 23,0 kVA, FP = 0,80 e Q = 13,8 kVAr.', isCorrect: true, feedback: 'Correto! S = 23 kVA; FP = 18,4 / 23 = 0,80; Q = √(23² - 18,4²) = 13,8 kVAr.' },
            { id: 'opt_m241_2', text: 'S = 23,0 kVA, FP = 1,25 e Q = 4,6 kVAr.', isCorrect: false, feedback: 'Incorreto. O fator de potência nunca é maior que 1,00.' },
            { id: 'opt_m241_3', text: 'S = 18,4 kVA, FP = 1,00 e Q = 0 kVAr.', isCorrect: false, feedback: 'Incorreto. A potência aparente real é de 23 kVA.' },
            { id: 'opt_m241_4', text: 'S = 23,0 kVA, FP = 0,80 e Q = 4,6 kVAr.', isCorrect: false, feedback: 'Incorreto. Subtraiu algebricamente (23 - 18,4) ignorando a defasagem vetorial de 90° de Q.' }
          ]
        },
        {
          id: 'elec_m2_ec4_q2_fator_potencia_thd',
          type: 'multiple_choice',
          question: 'Uma carga industrial eletrônica opera com fator de deslocamento fundamental quase unitário (cos φ₁ = 0,98), mas apresenta uma taxa de distorção harmônica total de corrente medida em THD_I = 60% (ou 0,60 em valor unitário). Qual é o Fator de Potência Real Total (FP_total) dessa instalação e qual é a interpretação técnica conclusiva do resultado?',
          scenario: 'Interpretação e cálculo do impacto da distorção harmônica na degradação do fator de potência real.',
          norma: 'Boas Práticas de Engenharia e Padrões Industriais de Mercado',
          points: 33,
          explanation: 'O fator de potência real com harmônicos é dado por: FP_total = cos φ₁ × [1 / √(1 + THD_I²)]. Substituindo os valores: FP_total = 0,98 × [1 / √(1 + 0,60²)] = 0,98 × [1 / √(1 + 0,36)] = 0,98 × [1 / √1,36] = 0,98 × (1 / 1,16619) = 0,98 × 0,8575 ≈ 0,84. Interpretação: Mesmo que a tensão e a corrente estejam em fase na fundamental, os harmônicos de corrente reduzem o FP real para 0,84, exigindo filtros harmônicos pois bancos de capacitores comuns não corrigem esse problema.',
          keyTakeaway: 'FP_total = cos φ₁ / √(1 + THD_I²): Harmônicos de corrente (THD = 60%) derrubam o fator de potência de 0,98 para 0,84.',
          options: [
            { id: 'opt_m242_1', text: 'FP_total ≈ 0,84; a distorção harmônica reduz severamente o FP mesmo com cos φ₁ quase unitário, não sendo corrigível por capacitores simples.', isCorrect: true, feedback: 'Excelente! FP_total = 0,98 / √(1 + 0,36) = 0,98 / 1,166 = 0,84. Os harmônicos degradam o fator de potência total.' },
            { id: 'opt_m242_2', text: 'FP_total = 0,98; os harmônicos de corrente não exercem nenhuma influência no fator de potência.', isCorrect: false, feedback: 'Incorreto. A potência de distorção D eleva a potência aparente S, reduzindo o FP_total = P / S.' },
            { id: 'opt_m242_3', text: 'FP_total ≈ 0,38; subtrai-se diretamente o THD do cosseno fi (0,98 - 0,60).', isCorrect: false, feedback: 'Incorreto. A relação entre harmônicos e potência aparente é quadrática vetorial.' },
            { id: 'opt_m242_4', text: 'FP_total = 1,00 em virtude do efeito de cancelamento de harmônicos.', isCorrect: false, feedback: 'Incorreto. O THD gera correntes adicionais reais que elevam o aquecimento dos cabos.' }
          ]
        },
        {
          id: 'elec_m2_ec4_q3_corrente_neutro_triplens',
          type: 'multiple_choice',
          question: 'Em um edifício corporativo com alimentação trifásica de 400/230 V, as correntes eficazes de linha medidas com alicate True-RMS são perfeitamente equilibradas nas três fases: I_L1 = 40 A, I_L2 = 40 A e I_L3 = 40 A. Contudo, ao medir o condutor de neutro com o mesmo instrumento, o display registra I_N = 68 A (superior a qualquer uma das fases!). O analisador espectral constata forte presença de 3ª harmônica (150 Hz) em 60% da fundamental. Qual é o diagnóstico técnico conclusivo e a explicação física dessa medição?',
          scenario: 'Interpretação da soma construtiva de harmônicos de terceira ordem (triplens) no condutor de neutro.',
          norma: 'Boas Práticas de Engenharia e Padrões Industriais de Mercado',
          points: 34,
          explanation: 'Os harmônicos de 3ª ordem (150 Hz) e seus múltiplos ímpares (triplens) possuem sequência zero: eles estão em fase entre si nas três fases do sistema (3 × 120° = 360° = 0°). Consequentemente, em vez de se anularem no neutro como ocorre com as correntes de 50 Hz perfeitamente equilibradas, as correntes de 3ª harmônica das 3 fases somam-se aritmeticamente de forma construtiva no neutro (I_N ≈ 3 × I_h3), resultando em corrente de neutro de 68 A superior às correntes de fase (40 A), com alto risco de incêndio por superaquecimento se o neutro não for sobredimensionado.',
          keyTakeaway: 'Harmônicos de 3ª ordem têm sequência zero e somam-se no neutro; fases a 40 A podem gerar neutro a 68 A em cargas eletrônicas.',
          options: [
            { id: 'opt_m243_1', text: 'As correntes de 3ª harmônica (150 Hz) têm sequência zero e somam-se aritmeticamente no condutor de neutro, provocando corrente de neutro superior à das fases.', isCorrect: true, feedback: 'Correto! As correntes triplens estão em fase nas três linhas e acumulam-se no neutro (68 A > 40 A), exigindo neutro sobredimensionado.' },
            { id: 'opt_m243_2', text: 'Há um curto-circuito franco entre duas fases jogando corrente de retorno no barramento de aterramento.', isCorrect: false, feedback: 'Incorreto. Um curto franco desarmaria o disjuntor instantaneamente e as fases estariam desbalanceadas.' },
            { id: 'opt_m243_3', text: 'O alicate True-RMS está descalibrado, pois a corrente no neutro nunca pode ser maior que a de fase.', isCorrect: false, feedback: 'Incorreto. Em ambientes com cargas eletrônicas não-lineares, a corrente no neutro frequentemente supera as fases.' },
            { id: 'opt_m243_4', text: 'Trata-se de corrente reativa capacitiva retornando para a subestação da concessionária.', isCorrect: false, feedback: 'Incorreto. O fenômeno é provocado pela distorção de 3ª harmônica de sequência zero das fontes chaveadas.' }
          ]
        }
      ]
    },

    // ------------------------------------------------------------------------
    // ELEMENTO 2.5: Medição de Potência Trifásica em Bancada (Método de Aron/2 Watímetros)
    // ------------------------------------------------------------------------
    {
      id: 'elec_m2_ec5_medicao_trifasica_aron',
      moduleId: 'elec_mod_2_instrumentacao',
      moduleTitle: 'Módulo 2: Instrumentação, Medição e Grandezas Elétricas',
      order: 5,
      code: 'EC 2.5',
      title: 'Medição de Potência Trifásica em Bancada (Método de Aron/2 Watímetros)',
      norma: 'Boas Práticas de Engenharia e Padrões Industriais de Mercado',
      level: 'Intermediário',
      durationMinutes: 18,
      theory: {
        conceito: 'A medição de potência em sistemas polifásicos é fundamentada no Teorema de Blondel: para mensurar a potência ativa total de uma rede com N condutores, são necessários exatamente (N - 1) wattímetros, qualquer que seja o grau de desbalanceamento das cargas ou a distorção das formas de onda. Em sistemas trifásicos a 3 fios (sem condutor de neutro, ou com neutro isolado), são necessários apenas (3 - 1) = 2 wattímetros, configuração conhecida mundialmente como Método dos Dois Wattímetros ou Método de Aron. Na topologia de Aron, escolhe-se uma das linhas como referência comum de potencial (geralmente a Fase L2): a bobina de corrente do Wattímetro 1 (W₁) é ligada em série na Linha 1 e sua bobina de tensão é ligada entre Linha 1 e Linha 2 (tensão V₁₂); a bobina de corrente do Wattímetro 2 (W₂) é ligada em série na Linha 3 e sua bobina de tensão entre Linha 3 e Linha 2 (tensão V₃₂). Em cargas equilibradas com tensão de linha V_L e corrente de linha I_L com defasagem de carga φ: W₁ = V_L·I_L·cos(30° - φ) e W₂ = V_L·I_L·cos(30° + φ). A soma algébrica das duas leituras resulta sempre na Potência Ativa Total do sistema: P_total = W₁ + W₂ (válido inclusive para cargas desequilibradas!). Em regime equilibrado, a diferença das leituras fornece diretamente a Potência Reativa Total: Q_total = √3·(W₁ - W₂). A relação entre as duas leituras permite determinar o Fator de Potência com precisão através de tan φ = √3·[(W₁ - W₂) / (W₁ + W₂)]. Um comportamento dinâmico vital ocorre com fatores de potência baixos: quando cos φ = 1,0 (φ = 0°), W₁ = W₂ > 0; quando cos φ = 0,5 (φ = 60°), W₂ = 0 (o segundo wattímetro marca exatamente zero Watts!); e quando cos φ < 0,5 (φ > 60°, como em motores a vazio), W₂ torna-se NEGATIVO, exigindo a inversão da polaridade da bobina de tensão para leitura e computando o valor como subtração: P_total = W₁ - |W₂|.',
        formulas: [
          {
            label: 'Potência Ativa Total (Método de Aron)',
            formula: 'P_total = W₁ + W₂',
            explicacao: 'Válido universalmente para sistemas trifásicos a 3 condutores (com ou sem equilíbrio)'
          },
          {
            label: 'Potência Reativa Total (Carga Equilibrada)',
            formula: 'Q_total = √3 × (W₁ - W₂)',
            explicacao: 'Permite obter a potência reativa da instalação sem utilizar varímetros adicionais'
          },
          {
            label: 'Fator de Potência pela Razão de Leituras',
            formula: 'tan φ = √3 × [(W₁ - W₂) / (W₁ + W₂)] \t| \tFP = cos φ',
            explicacao: 'Cálculo direto do fator de potência a partir das duas indicações dos wattímetros'
          },
          {
            label: 'Potência Aparente Total por Aron',
            formula: 'S_total = 2 × √[W₁² + W₂² - (W₁ × W₂)]',
            explicacao: 'Módulo da potência aparente total do sistema trifásico equilibrado'
          }
        ],
        pontosOperacionais: [
          'Deflexão Negativa de Ponteiro em Wattímetro Analógico: Se a carga possuir fator de potência indutivo inferior a 0,50 (motor em vazio), o ângulo ultrapassa 60° e cos(30° + φ) torna-se negativo; o ponteiro do wattímetro 2 bate para trás no batente; inverte-se a polaridade da bobina de tensão e anota-se a leitura com sinal NEGATIVO.',
          'Soma Algébrica Rigorosa: Quando W₂ for negativo, NUNCA somar os valores em módulo; a potência ativa real consumida é a subtração: P_total = W₁ + (-|W₂|) = W₁ - |W₂|; desconsiderar o sinal negativo falseia o rendimento e a demanda.',
          'Respeito às Marcas de Polaridade (Bornes ±): Os bornes de polaridade (geralmente identificados por asterisco * ou sinal ±) das bobinas de corrente e tensão de ambos os wattímetros devem ser conectados rigorosamente no sentido da fonte para a carga; inverter um borne altera a fase em 180° e destrói o cálculo.',
          'Limitação Normativa do Método de Aron: O método com 2 wattímetros aplica-se estritamente a sistemas a 3 condutores (sem neutro ou com neutro não distribuído); se houver condutor de neutro distribuído com correntes de retorno monofásicas, o Teorema de Blondel exige obrigatoriamente 3 wattímetros.'
        ],
        fieldCase: {
          localizacao: 'Laboratório de Ensaios Eletromecânicos do IICM, Cidade de Maputo',
          cenario: 'Durante um ensaio de bancada didática para levantar a curva de rendimento de um motor de indução trifásico de 15 kW 400 V operando em vazio pelo Método de Aron, os formandos constataram que o Wattímetro 2 bateu bruscamente para trás no batente zero. Ao inverter a bobina de tensão, leram 450 W e o Wattímetro 1 marcava 1850 W. Os estudantes somaram 1850 + 450 = 2300 W, mas o motor operava frio sem compatibilidade com essa potência de perdas.',
          diagnostico: 'Motores de indução trifásicos funcionando em vazio consomem corrente predominantemente magnetizante (indutiva), operando com fator de potência muito baixo (cos φ ≈ 0,25 a 0,35, ângulo φ > 70°). Na equação de Aron, como (30° + φ) > 90°, cos(30° + φ) é negativo. A leitura real de W₂ era -450 W.',
          solucaoNormativa: 'Aplicação da regra algébrica do Método de Aron: a potência ativa real em vazio absorvida pelo motor é P_total = W₁ + W₂ = 1850 + (-450) = 1400 W (1,4 kW de perdas em vazio no ferro e atrito). A potência reativa é Q_total = √3 × [1850 - (-450)] = √3 × 2300 = 3983,7 VAr (3,98 kVAr). O fator de potência real em vazio é FP = 1400 / √(1400² + 3984²) = 1400 / 4222 = 0,33, resultado perfeitamente coerente com as Boas Práticas de Engenharia e Padrões Industriais de Mercado.'
        },
        funcionamento: 'O método de Aron é uma das mais brilhantes demonstrações práticas do cálculo vetorial na engenharia eletrotécnica: ao escolher a fase L2 como ponto comum de potencial, as tensões compostas V₁₂ e V₃₂ e as correntes de linha I₁ e I₃ contêm implicitamente a projeção de todas as componentes ativas e reativas do sistema trifásico. As duas grandezas escalares lidas nos wattímetros contêm informação suficiente para reconstruir integralmente o fasor de potência trifásico sem necessidade de medir a fase L2 diretamente.',
        aplicacaoMocambique: 'Em indústrias moçambicanas alimentadas por transformadores com secundário em triângulo (Delta) ou estrela sem neutro a 400 V, a medição com dois elementos é o método padrão utilizado por analisadores portáteis de bancada em partidas de compressores e moinhos.',
        exemploPratico: 'Num ensaio com W₁ = 4000 W e W₂ = 4000 W: P_total = 8000 W; Q_total = √3 × (4000 - 4000) = 0 VAr; tan φ = 0, logo cos φ = 1,00 (carga puramente resistiva balanceada). Se W₁ = 4000 W e W₂ = 0 W: P_total = 4000 W; tan φ = √3 × (4000 / 4000) = √3 ≈ 1,732, logo φ = 60° e cos φ = 0,50.',
        calculationSnippet: 'P = W₁ + W₂ | Q = √3 × (W₁ - W₂) | tan φ = √3 × (W₁ - W₂) / (W₁ + W₂)'
      },
      quiz: {
        question: 'Dois wattímetros analógicos conectados pelo Método de Aron para medir a potência absorvida por um forno de indução trifásico equilibrado sem neutro registram as seguintes leituras de bancada: W₁ = 6000 W e W₂ = 2000 W. Determine a potência ativa total P_total, a potência reativa total Q_total e o fator de potência (cos φ) da instalação.',
        options: [
          { id: 'A', text: 'P_total = 8,0 kW, Q_total ≈ 6,93 kVAr e cos φ ≈ 0,76.', isCorrect: true, feedback: 'Correto! P_total = W₁ + W₂ = 6000 + 2000 = 8000 W = 8,0 kW. Q_total = √3 × (W₁ - W₂) = 1,732 × (6000 - 2000) = 1,732 × 4000 = 6928 VAr ≈ 6,93 kVAr. tan φ = √3 × (4000 / 8000) = 0,866 -> φ ≈ 40,9° -> cos φ ≈ 0,756 ≈ 0,76.' },
          { id: 'B', text: 'P_total = 4,0 kW, Q_total = 8,0 kVAr e cos φ = 0,50.', isCorrect: false, feedback: 'Incorreto. Subtraiu as leituras para obter a potência ativa em vez de somar W₁ + W₂.' },
          { id: 'C', text: 'P_total = 8,0 kW, Q_total = 4,0 kVAr e cos φ = 0,89.', isCorrect: false, feedback: 'Incorreto. Esqueceu o fator √3 (1,732) no cálculo da potência reativa total.' },
          { id: 'D', text: 'P_total = 12,0 kW, Q_total = 12,0 kVAr e cos φ = 1,00.', isCorrect: false, feedback: 'Incorreto. Erro grave na soma das potências dos instrumentos.' }
        ],
        explanation: '1) Potência Ativa Total: P_total = W₁ + W₂ = 6000 W + 2000 W = 8000 W = 8,0 kW. 2) Potência Reativa Total: Q_total = √3 × (W₁ - W₂) = 1,73205 × (6000 - 2000) = 1,73205 × 4000 = 6928,2 VAr ≈ 6,93 kVAr. 3) Fator de Potência: Potência aparente S = √(P² + Q²) = √(8000² + 6928²) = √(64.000.000 + 47.997.184) = √111.997.184 = 10582,8 VA ≈ 10,58 kVA. Então cos φ = P / S = 8000 / 10582,8 ≈ 0,756 ≈ 0,76 (ou diretamente por tan φ = √3 × [4000 / 8000] = 0,8660, com φ = 40,89° e cos φ = 0,756).',
        keyTakeaway: 'Método de Aron: P = W₁ + W₂ = 8 kW; Q = √3 × (W₁ - W₂) = 6,93 kVAr; FP = P / √(P² + Q²) = 0,76.',
        xpReward: 50
      },
      assessmentQuestions: [
        {
          id: 'elec_m2_ec5_q1_aron_direto',
          type: 'multiple_choice',
          question: 'Dois wattímetros conectados pelo Método de Aron para medir a potência absorvida por um forno de indução trifásico equilibrado sem neutro registram as seguintes leituras de bancada: W₁ = 6000 W e W₂ = 2000 W. Determine a potência ativa total P_total, a potência reativa total Q_total e o fator de potência (cos φ) da instalação.',
          scenario: 'Cálculo de potência ativa, reativa e fator de potência a partir das leituras do Método dos Dois Wattímetros.',
          norma: 'Boas Práticas de Engenharia e Padrões Industriais de Mercado',
          points: 33,
          explanation: 'P_total = W₁ + W₂ = 6000 + 2000 = 8000 W = 8,0 kW. Q_total = √3 × (W₁ - W₂) = 1,732 × 4000 = 6928 VAr ≈ 6,93 kVAr. S = √(8000² + 6928²) = 10583 VA. FP = 8000 / 10583 ≈ 0,756 ≈ 0,76.',
          keyTakeaway: 'Método de Aron: P = W₁ + W₂; Q = √3 × (W₁ - W₂); FP = P / S ≈ 0,76.',
          options: [
            { id: 'opt_m251_1', text: 'P_total = 8,0 kW, Q_total ≈ 6,93 kVAr e cos φ ≈ 0,76.', isCorrect: true, feedback: 'Correto! P = 8000 W; Q = √3 × 4000 = 6928 VAr; FP = 8000 / 10583 = 0,76.' },
            { id: 'opt_m251_2', text: 'P_total = 4,0 kW, Q_total = 8,0 kVAr e cos φ = 0,50.', isCorrect: false, feedback: 'Incorreto. A potência ativa é a soma W₁ + W₂, não a subtração.' },
            { id: 'opt_m251_3', text: 'P_total = 8,0 kW, Q_total = 4,0 kVAr e cos φ = 0,89.', isCorrect: false, feedback: 'Incorreto. Esqueceu o fator multiplicador √3 na potência reativa.' },
            { id: 'opt_m251_4', text: 'P_total = 8,0 kW, Q_total = 0 kVAr e cos φ = 1,00.', isCorrect: false, feedback: 'Incorreto. Q só seria nula se W₁ fosse rigorosamente igual a W₂.' }
          ]
        },
        {
          id: 'elec_m2_ec5_q2_aron_deflexao_negativa',
          type: 'multiple_choice',
          question: 'Em um ensaio de bancada trifásica de 400 V sem neutro utilizando o Método de Aron, o Wattímetro 1 indica uma leitura positiva de W₁ = 3200 W, enquanto o Wattímetro 2 (após a inversão de polaridade necessária de sua bobina de potencial) marca uma leitura correspondente a 800 W negativos (W₂ = -800 W). Calcule a potência ativa real total P_total, a potência reativa total Q_total e determine o fator de potência exato da carga.',
          scenario: 'Interpretação e cálculo de medição com deflexão negativa (fator de potência inferior a 0,50) no Método de Aron.',
          norma: 'Boas Práticas de Engenharia e Padrões Industriais de Mercado',
          points: 33,
          explanation: '1) Potência Ativa Total: P_total = W₁ + W₂ = 3200 + (-800) = 2400 W = 2,4 kW. 2) Potência Reativa Total: Q_total = √3 × [W₁ - W₂] = √3 × [3200 - (-800)] = √3 × 4000 = 6928,2 VAr ≈ 6,93 kVAr. 3) Fator de Potência: tan φ = √3 × [(3200 - (-800)) / (3200 + (-800))] = √3 × (4000 / 2400) = 1,73205 × 1,6667 = 2,88675. O ângulo é φ = arctan(2,88675) = 70,89°. O fator de potência é cos φ = cos(70,89°) ≈ 0,327 ≈ 0,33 (confirmando que FP < 0,50 induz leitura negativa em W₂).',
          keyTakeaway: 'Leitura Negativa em Aron: Ocorre quando FP < 0,50 (φ > 60°); a potência ativa total é a soma algébrica real P = 3200 - 800 = 2400 W.',
          options: [
            { id: 'opt_m252_1', text: 'P_total = 2,4 kW, Q_total ≈ 6,93 kVAr e cos φ ≈ 0,33.', isCorrect: true, feedback: 'Excelente! P = 3200 - 800 = 2400 W; Q = √3 × 4000 = 6928 VAr; FP = 2400 / 7332 = 0,33.' },
            { id: 'opt_m252_2', text: 'P_total = 4,0 kW, Q_total ≈ 4,16 kVAr e cos φ ≈ 0,69.', isCorrect: false, feedback: 'Incorreto. Somou os módulos (3200 + 800 = 4000 W) desconsiderando o sinal negativo de W₂.' },
            { id: 'opt_m252_3', text: 'P_total = 2,4 kW, Q_total = 2,4 kVAr e cos φ = 0,707.', isCorrect: false, feedback: 'Incorreto. Erro de cálculo na potência reativa com sinais opostos.' },
            { id: 'opt_m252_4', text: 'P_total = 3,2 kW, Q_total = 0,8 kVAr e cos φ = 0,97.', isCorrect: false, feedback: 'Incorreto. Ignorou a contribuição de W₂ no circuito.' }
          ]
        },
        {
          id: 'elec_m2_ec5_q3_aron_leitura_nula',
          type: 'multiple_choice',
          question: 'Em um ensaio de bancada pelo Método de Aron alimentando um banco de cargas trifásicas equilibradas sem neutro, o Wattímetro 1 marca exatamente W₁ = 5000 W e o Wattímetro 2 permanece rigorosamente na marca zero (W₂ = 0 W). Qual é o fator de potência (cos φ) da carga, a potência ativa total e a potência reativa total do sistema trifásico?',
          scenario: 'Interpretação da condição notável de leitura nula em um dos wattímetros do Método de Aron.',
          norma: 'Boas Práticas de Engenharia e Padrões Industriais de Mercado',
          points: 34,
          explanation: '1) Potência Ativa Total: P_total = W₁ + W₂ = 5000 + 0 = 5000 W = 5,0 kW. 2) Condição de W₂ = 0: Pela equação W₂ = V_L·I_L·cos(30° + φ) = 0, para o cosseno ser nulo o ângulo deve ser 90°, ou seja, 30° + φ = 90° -> φ = 60°. O fator de potência é cos(60°) = 0,50 exatos! 3) Potência Reativa Total: Q_total = √3 × (W₁ - W₂) = √3 × (5000 - 0) = 1,73205 × 5000 = 8660,25 VAr ≈ 8,66 kVAr.',
          keyTakeaway: 'Condição Especial de Aron: Quando um wattímetro marca exatamente zero (W₂ = 0), o fator de potência da carga é rigorosamente cos φ = 0,50 (φ = 60°).',
          options: [
            { id: 'opt_m253_1', text: 'cos φ = 0,50, P_total = 5,0 kW e Q_total ≈ 8,66 kVAr.', isCorrect: true, feedback: 'Perfeito! Quando W₂ = 0, o ângulo de carga é φ = 60° e o FP é exatamente cos(60°) = 0,50; P = 5 kW e Q = √3 × 5000 = 8,66 kVAr.' },
            { id: 'opt_m253_2', text: 'cos φ = 1,00, P_total = 5,0 kW e Q_total = 0 kVAr.', isCorrect: false, feedback: 'Incorreto. O FP só seria 1,00 se ambos os wattímetros marcassem valores iguais e positivos (W₁ = W₂).' },
            { id: 'opt_m253_3', text: 'cos φ = 0,00, P_total = 0 kW e Q_total = 5,0 kVAr.', isCorrect: false, feedback: 'Incorreto. O sistema está consumindo 5 kW de potência ativa real.' },
            { id: 'opt_m253_4', text: 'cos φ = 0,707, P_total = 10,0 kW e Q_total = 5,0 kVAr.', isCorrect: false, feedback: 'Incorreto. FP de 0,707 corresponderia a φ = 45°, onde W₂ seria diferente de zero.' }
          ]
        }
      ]
    }
  ]
};
