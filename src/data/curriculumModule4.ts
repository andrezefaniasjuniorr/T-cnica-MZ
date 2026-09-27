import { AcademyModule } from '../types/academy';

// ============================================================================
// MÓDULO 4: APARELHAGEM DE CORTE, PROTEÇÃO E SECCIONAMENTO
// Padrão Didático Avançado - Academia TécnicaMZ & Sara IA
// Boas Práticas de Engenharia e Padrões Industriais de Mercado
// ============================================================================

export const MODULE_4_APARELHAGEM_PROTECAO: AcademyModule = {
  id: 'elec_mod_4_aparelhagem_protecao',
  area: 'eletrotecnica',
  order: 4,
  title: 'Módulo 4: Aparelhagem de Corte, Proteção e Seccionamento',
  description: 'Fusíveis industriais e residenciais (NH, Diazed, Cartucho cilíndrico), Disjuntores termomagnéticos (MCB e MCCB - Curvas B, C e D), Dispositivos Diferenciais Residuais (DR/RCD - Tipos AC, A, F e B), Descarregadores de Sobretensões (DPS Classes I, II e III), e Poder de Corte (Icu/Ics) com Seletividade Cronométrica, Amperimétrica e Energética (I²t).',
  icon: 'ShieldCheck',
  normasReferencia: [
    'Boas Práticas de Engenharia e Padrões Industriais de Mercado',
    'IEC 60269-1 / IEC 60269-2',
    'IEC 60898-1 / IEC 60947-2',
    'IEC 61008-1 / IEC 62423',
    'IEC 61643-11'
  ],
  lessons: [
    // ------------------------------------------------------------------------
    // ELEMENTO 4.1: Fusíveis Industriais e Residenciais (NH, Diazed, Cartucho)
    // ------------------------------------------------------------------------
    {
      id: 'elec_m4_ec1_fusiveis_industriais_residenciais',
      moduleId: 'elec_mod_4_aparelhagem_protecao',
      moduleTitle: 'Módulo 4: Aparelhagem de Corte, Proteção e Seccionamento',
      order: 1,
      code: 'EC 4.1',
      title: 'Fusíveis Industriais e Residenciais (NH, Diazed, Cartucho)',
      norma: 'Boas Práticas de Engenharia e Padrões Industriais de Mercado',
      level: 'Intermediário',
      durationMinutes: 16,
      theory: {
        conceito: 'O fusível é o dispositivo de proteção contra sobrecorrentes mais rápido e confiável da engenharia elétrica, atuando pela fusão calibrada de um elo metálico condutor (geralmente prata pura ou cobre eletrolítico com gargantas usinadas) quando submetido ao calor de correntes excessivas (efeito Joule: Q = ∫ R·i² dt). Seu interior é preenchido com areia de sílica de alta pureza e granulometria controlada, que resfria e vitrifica o arco elétrico em microsegundos, extinguindo a falta antes mesmo que a corrente de curto-circuito atinja seu primeiro pico natural da onda senoidal (efeito limitador de corrente). As categorias de aplicação normalizadas dividem-se em duas letras fundamentais: a primeira letra indica a faixa de interrupção ("g" para proteção de faixa plena contra sobrecargas e curtos-circuitos; "a" para faixa parcial apenas contra curto-circuito, exigindo relé térmico em série); a segunda letra indica o tipo de equipamento protegido ("G" ou "L" para cabos e linhas gerais; "M" para motores e manobra; "R" para semicondutores ultrarrápidos; "PV" para módulos solares fotovoltaicos). Os fusíveis NH (Niederspannungs-Hochleistungs, de Alta Capacidade de Ruptura até 120 kA com facas estanhadas de encaixe) são os padrões dominantes em quadros gerais industriais (tamanhos NH 000 até NH 4a), manuseados exclusivamente com punho saca-fusível isolado para 1000 V. Os fusíveis Diazed (DII e DIII) utilizam parafuso de ajuste inviolável na base para impedir a troca por calibres superiores. Os fusíveis de Cartucho Cilíndrico (10×38 mm, 14×51 mm, 22×58 mm) são amplamente aplicados em trilho DIN para circuitos de comando, transformadores e proteção individual de inversores.',
        formulas: [
          {
            label: 'Energia Específica Passante (Joule Integral)',
            formula: 'I²t = ∫ i²(t) dt \t(A²s)',
            explicacao: 'Mede o estresse térmico total que o fusível permite passar durante o curto-circuito'
          },
          {
            label: 'Relação de Seletividade entre Fusíveis gG em Série',
            formula: 'I_n_montante ≥ 1,60 × I_n_jusante',
            explicacao: 'Garante que o I²t total do fusível a jusante seja menor que o I²t de pré-arco do montante'
          },
          {
            label: 'Corrente de Não Fusão e de Fusão (Faixa Plena gG)',
            formula: 'I_nf = 1,25 × I_n (não funde em 1h a 2h)  |  I_f = 1,60 × I_n (funde garantido)',
            explicacao: 'Curva tempo-corrente padronizada de sobrecarga contínua'
          },
          {
            label: 'Capacidade de Interrupção Nominal (Poder de Corte)',
            formula: 'I_1 ≥ 100 kA a 120 kA em 500 Vca',
            explicacao: 'Capacidade de suportar e extinguir curtos de extrema severidade sem explosão da cerâmica'
          }
        ],
        pontosOperacionais: [
          'Nunca, sob nenhuma circunstância, reparar um fusível queimado utilizando pedaços de arame de cobre ou "fios de cabelo"! Isso elimina a proteção, converte o suporte em uma bomba de fogo e causa incêndios fatais.',
          'Manuseio seguro de fusíveis NH: usar sempre o punho saca-fusível de neoprene com luva isolante de alta tensão (Classe 0 - 1000 V) e protetor facial de policarbonato com viseira contra arco elétrico (Arc Flash).',
          'Fusíveis da classe aM (acompanhamento de motor) toleram correntes de partida pesadas de até 8 a 10 vezes In por vários segundos sem fundir, mas NUNCA devem ser usados sozinhos para proteger cabos contra sobrecarga moderada (exigem relé bimetálico associado).',
          'O pino indicador vermelho de queima (espoleta mecânica) na parte superior do cartucho salta imediatamente quando o elo interno se rompe, permitindo diagnóstico visual imediato sem necessidade de multímetro.'
        ],
        fieldCase: {
          localizacao: 'Subestação do Porto da Beira, Província de Sofala',
          cenario: 'Em um QGBT industrial alimentado diretamente por um transformador a óleo de 1000 kVA (corrente de curto presumida no barramento de 28 kA), ocorreu um curto franco fase-fase na alimentação de um guindaste elétrico. O circuito era protegido por uma seccionadora unipolar com fusíveis NH 00 de 160 A gG.',
          diagnostico: 'A queima foi contida silenciosamente em apenas 3,8 milissegundos dentro do corpo de esteatita cerâmica dos fusíveis NH. A areia de sílica fundiu-se em fulgurito vítreo no ponto do arco, dissipando 98% da energia. O poder de corte nominal dos fusíveis NH instalados era de 120 kA, suportando o curto de 28 kA com folga imensa e impedindo que o barramento principal de cobre sofresse flambagem eletrodinâmica.',
          solucaoNormativa: 'Verificação do circuito do guindaste, eliminação do esmagamento do cabo de potência, inspeção dos contatos das garras da base NH com paquímetro (pressão elástica preservada) e reposição imediata por novos fusíveis originais certificados NH 00 160 A gG 500 V com punho saca-fusível isolado.'
        },
        funcionamento: 'Ao circular uma corrente de curto-circuito, as zonas estreitas usinadas da fita de prata atingem o ponto de fusão (961 °C) em frações de milissegundo. O metal vaporiza-se, gerando dezenas de arcos elétricos em série. O arco de plasma penetra na areia de sílica, que absorve o calor e se transforma instantaneamente em um corpo vítreo isolante de quartzo fundido, extinguindo a corrente antes do pico da onda.',
        aplicacaoMocambique: 'A EDM e as grandes indústrias açucareiras e mineradoras em Moçambique utilizam exclusivamente bases e fusíveis seccionadores NH nas saídas de baixa tensão dos Postos de Transformação (PTs) devido à sua robustez imbatível e altíssima capacidade de interrupção perante curtos atmosféricos.',
        exemploPratico: 'Num circuito com cabo de 95 mm² (Iz = 220 A) alimentado por um fusível geral montante de 315 A gG: para selecionar o fusível jusante de proteção com seletividade total garantida, calcula-se In_jusante ≤ 315 / 1,60 = 196,8 A. Adota-se um fusível NH de 160 A ou 200 A gG, garantindo que em qualquer curto na linha apenas o fusível local se queime.',
        calculationSnippet: 'In_montante ≥ 1,6 × In_jusante | gG: sobrecarga + curto | aM: curto exclusivo | NH: até 120 kA'
      },
      quiz: {
        question: 'Qual é a principal diferença de comportamento funcional e aplicação técnica entre um fusível industrial da classe "gG" e um fusível da classe "aM"?',
        options: [
          { id: 'A', text: 'O fusível gG é exclusivo para corrente contínua e o aM é para corrente alternada.', isCorrect: false, feedback: 'Incorreto. Ambos operam perfeitamente em corrente alternada e possuem variantes para CC.' },
          { id: 'B', text: 'O fusível gG protege em faixa plena (sobrecargas e curtos-circuitos gerais), enquanto o aM é de faixa parcial (atua exclusivamente contra curtos-circuitos em circuitos de motores).', isCorrect: true, feedback: 'Correto! O "g" significa full-range (faixa plena: sobrecarga + curto) para uso geral (G). O "a" significa accompanied/partial-range (apenas curto-circuito para proteção de motores M).' },
          { id: 'C', text: 'O fusível aM funde com correntes muito baixas para proteger placas de computador sensíveis.', isCorrect: false, feedback: 'Incorreto. Fusíveis para eletrônica ultrarrápida são da classe aR ou gR.' },
          { id: 'D', text: 'O fusível gG é descartável e o fusível aM pode ser rearmado mecanicamente por alavanca.', isCorrect: false, feedback: 'Incorreto. Todo fusível atua por fusão térmica e deve ser substituído após a atuação.' }
        ],
        explanation: 'Pela IEC 60269: a classe gG (General purpose) possui curva tempo-corrente que assegura a interrupção tanto de sobrecargas sustentadas moderadas quanto de curtos-circuitos violentos. A classe aM (Motor circuit) foi desenhada para tolerar a alta corrente transitória de partida de motores elétricos sem abrir, operando apenas contra correntes de curto-circuito a partir de 4 vezes In; portanto, circuitos com fusíveis aM exigem obrigatoriamente um relé de sobrecarga térmico em série.',
        keyTakeaway: 'gG = faixa plena (sobrecarga e curto para cabos). aM = faixa parcial (apenas curto para motores, suporta a corrente de partida).',
        xpReward: 50
      },
      assessmentQuestions: [
        {
          id: 'elec_m4_ec1_q1_seletividade_fusiveis_gg',
          type: 'multiple_choice',
          question: 'Em um painel de distribuição geral, um fusível NH a montante possui calibre nominal de 250 A gG. Para alimentar um subpainel derivado e assegurar 100% de seletividade amperimétrica e térmica total entre ambos (obedecendo à razão de seletividade padronizada de 1:1,60), qual é o calibre nominal máximo de fusível gG que pode ser instalado a jusante?',
          scenario: 'Estudo de coordenação e seletividade em cascata entre fusíveis industriais tipo NH.',
          norma: 'Boas Práticas de Engenharia e Padrões Industriais de Mercado',
          points: 33,
          explanation: 'Para garantir seletividade total entre fusíveis da mesma classe (gG), o calibre do montante deve ser de pelo menos 1,6 vezes o calibre do jusante: In_montante ≥ 1,6 × In_jusante ⇒ In_jusante ≤ In_montante / 1,6 = 250 A / 1,6 = 156,25 A. Entre os calibres padronizados comerciais de fusíveis NH (100 A, 125 A, 160 A, 200 A), o valor nominal máximo que respeita rigorosamente essa relação é 160 A (relação real 250 / 160 = 1,56 ≈ 1,60) ou, com margem conservadora estrita (≤ 156,25 A), o calibre de 125 A ou 160 A com curvas de I²t validadas.',
          keyTakeaway: 'In_jusante ≤ In_montante / 1,6: Para fusível montante de 250 A, o limite é 156 A a 160 A de acordo com as curvas I²t do fabricante.',
          options: [
            { id: 'opt_1_1', text: 'Fusível de calibre máximo de 160 A (ou 125 A para margem estrita).', isCorrect: true, feedback: 'Correto! 250 A / 1,60 = 156,25 A; os fabricantes certificam seletividade plena com 160 A ou 125 A gG.' },
            { id: 'opt_1_2', text: 'Fusível de calibre 225 A.', isCorrect: false, feedback: 'Incorreto. Com 225 A a relação é de apenas 1,11, provocando queima simultânea dos dois fusíveis sob curto.' },
            { id: 'opt_1_3', text: 'Fusível de calibre 250 A idêntico ao montante.', isCorrect: false, feedback: 'Incorreto. Fusíveis do mesmo calibre em série não possuem seletividade alguma.' },
            { id: 'opt_1_4', text: 'Fusível de calibre 315 A.', isCorrect: false, feedback: 'Totalmente incorreto. O jusante seria maior que o montante, invertendo a proteção.' }
          ]
        },
        {
          id: 'elec_m4_ec1_q2_funcao_areia_silica',
          type: 'multiple_choice',
          question: 'Qual é a função termodinâmica e dielétrica primordial desempenhada pela areia de sílica de alta pureza que preenche hermeticamente o corpo cerâmico dos fusíveis industriais NH e Diazed?',
          scenario: 'Princípio físico de extinção de arco elétrico e poder de corte em fusíveis HRC.',
          norma: 'Boas Práticas de Engenharia e Padrões Industriais de Mercado',
          points: 33,
          explanation: 'No momento da fusão sob curto-circuito, o elo de prata vaporiza gerando um arco elétrico de plasma ionizado a mais de 3000 °C. A areia de quartzo (sílica) de granulação calibrada absorve violentamente esse calor latente, fundindo-se e vitrificando ao redor do arco (formando um túnel de vidro isolante chamado fulgurito), o que extingue o arco elétrico em microsegundos e impede a explosão mecânica do corpo cerâmico.',
          keyTakeaway: 'A areia de sílica absorve a energia térmica extrema do arco elétrico, fundindo-se em vidro isolante que extingue o plasma sem estilhaçar a cerâmica.',
          options: [
            { id: 'opt_2_1', text: 'Resfriar o plasma do arco elétrico e vitrificar-se em um corpo isolante, extinguindo o arco em milissegundos.', isCorrect: true, feedback: 'Excelente! A areia de sílica transforma-se em sílica vítrea altamente resistente, extinguindo o curto com segurança total.' },
            { id: 'opt_2_2', text: 'Conduzir eletricidade em paralelo para diminuir a resistência interna do fusível.', isCorrect: false, feedback: 'Incorreto. A areia de sílica é um dielétrico isolante de altíssima resistividade.' },
            { id: 'opt_2_3', text: 'Servir apenas como contrapeso mecânico para o fusível não vibrar na base.', isCorrect: false, feedback: 'Incorreto. A areia tem papel termodinâmico vital na extinção do arco elétrico.' },
            { id: 'opt_2_4', text: 'Manter o elo metálico úmido para facilitar a queima por sobrecarga.', isCorrect: false, feedback: 'Incorreto. A areia de sílica deve ser rigorosamente seca; umidade provocaria explosão de vapor d\'água.' }
          ]
        },
        {
          id: 'elec_m4_ec1_q3_risco_substituicao_improvisada',
          type: 'multiple_choice',
          question: 'Em uma instalação industrial, após a queima de um fusível NH de 100 A, um operador sem capacitação substituiu o cartucho queimado por um pedaço de vergalhão de cobre maciço aparafusado entre as facas de contato. Quais são as consequências técnicas e de segurança imediatas dessa prática proibida?',
          scenario: 'Análise de falhas catastróficas decorrentes de adulteração mecânica da aparelhagem de proteção.',
          norma: 'Boas Práticas de Engenharia e Padrões Industriais de Mercado',
          points: 34,
          explanation: 'Adulterar o fusível com cobre maciço ("jumpeamento") elimina totalmente a proteção contra sobrecorrentes. Em caso de novo curto-circuito, a corrente de defeito circulará sem interrupção por centenas de milissegundos até que os cabos da instalação ou o próprio transformador da concessionária entrem em combustão espontânea ou ocorra uma explosão por arco elétrico (Arc Flash) com projeção de cobre fundido, colocando vidas humanas em perigo de morte e destruindo o patrimônio.',
          keyTakeaway: 'Jumpear fusíveis é crime contra a segurança do trabalho: remove a proteção térmica e de curto-circuito, causando incêndios e explosões severas.',
          options: [
            { id: 'opt_3_1', text: 'Eliminação da proteção, provocando incêndio dos cabos condutores e explosão por arco elétrico (Arc Flash) no próximo curto.', isCorrect: true, feedback: 'Perfeito! O vergalhão de cobre não possui capacidade de interrupção, levando o painel e os cabos à destruição térmica e mecânica total.' },
            { id: 'opt_3_2', text: 'Melhoria na eficiência energética, pois o cobre maciço reduz as perdas por aquecimento em 50%.', isCorrect: false, feedback: 'Afirmação criminosa e desprovida de qualquer fundamento de engenharia.' },
            { id: 'opt_3_3', text: 'Aumento da sensibilidade do circuito, fazendo com que desarmem disjuntores a jusante com maior precisão.', isCorrect: false, feedback: 'Incorreto. Não há desarme no ponto com cobre maciço.' },
            { id: 'opt_3_4', text: 'O circuito continuará 100% seguro desde que a pintura da porta do quadro esteja em dia.', isCorrect: false, feedback: 'Totalmente absurdo.' }
          ]
        }
      ]
    },

    // ------------------------------------------------------------------------
    // ELEMENTO 4.2: Disjuntores Termomagnéticos (MCB/MCCB - Curvas B, C e D)
    // ------------------------------------------------------------------------
    {
      id: 'elec_m4_ec2_disjuntores_termomagneticos_mcb_mccb',
      moduleId: 'elec_mod_4_aparelhagem_protecao',
      moduleTitle: 'Módulo 4: Aparelhagem de Corte, Proteção e Seccionamento',
      order: 2,
      code: 'EC 4.2',
      title: 'Disjuntores Termomagnéticos (MCB/MCCB - Curvas B, C e D)',
      norma: 'Boas Práticas de Engenharia e Padrões Industriais de Mercado',
      level: 'Intermediário',
      durationMinutes: 18,
      theory: {
        conceito: 'Os disjuntores termomagnéticos são aparelhos de manobra mecânica e proteção automática capazes de estabelecer, conduzir e interromper correntes sob condições normais de circuito, bem como interromper automaticamente correntes anormais predeterminadas (sobrecargas e curtos-circuitos). A proteção opera por dois mecanismos físicos integrados: 1) Disparador Térmico (lâmina bimetálica constituída por dois metais com coeficientes de dilatação térmica distintos; sob sobrecarga moderada e prolongada, a lâmina encurva-se gradualmente por aquecimento Joule até destravar o trinco mecânico de abertura com tempo inversamente proporcional à corrente); 2) Disparador Magnético (bobina eletromagnética com êmbolo móvel de ferro; sob corrente de curto-circuito elevada, o campo magnético intenso atrai o êmbolo instantaneamente em menos de 10 a 20 milissegundos, superando o esforço elástico e liberando os contatos). Os disjuntores dividem-se construtivamente em: MCB (Miniature Circuit Breaker - disjuntores modulares em trilho DIN até 125 A com disparadores fixos) e MCCB (Molded Case Circuit Breaker - disjuntores em caixa moldada para potências elevadas de 63 A até 1600 A, dotados de disparadores termomagnéticos ajustáveis ou relés eletrônicos microprocessados). As curvas de disparo magnético instantâneo padronizadas determinam o múltiplo da corrente nominal (In) no qual o disparador magnético atua sem retardo intencional: Curva B (3 a 5 × In), Curva C (5 a 10 × In) e Curva D (10 a 20 × In).',
        formulas: [
          {
            label: 'Curva B (Disparo Magnético Instantâneo)',
            formula: '3 × I_n ≤ I_mag ≤ 5 × I_n',
            explicacao: 'Cargas puramente resistivas, aquecedores, geradores e cabos com comprimento elevado'
          },
          {
            label: 'Curva C (Disparo Magnético Instantâneo)',
            formula: '5 × I_n ≤ I_mag ≤ 10 × I_n',
            explicacao: 'Uso geral residencial e comercial: iluminação mista, tomadas e pequenos motores'
          },
          {
            label: 'Curva D (Disparo Magnético Instantâneo)',
            formula: '10 × I_n ≤ I_mag ≤ 20 × I_n',
            explicacao: 'Cargas com forte corrente de inrush: transformadores BT/BT, motores pesados, máquinas de raio-X'
          },
          {
            label: 'Tempo Máximo de Atuação em Curto-Circuito',
            formula: 't_abertura ≤ 0,02 a 0,04 s (menos de 1 a 2 ciclos)',
            explicacao: 'Velocidade essencial para limitar a energia específica passante I²t nos condutores'
          }
        ],
        pontosOperacionais: [
          'Erro gravíssimo de campo: nunca aumente o calibre nominal (In) de um disjuntor porque ele desarma na partida de um motor ou máquina! Isso deixa o cabo desprotegido contra incêndio por sobrecarga contínua. A ação correta é manter o calibre nominal compatível com a fiação e migrar a curva de atuação (exemplo: substituir um disjuntor de 20 A Curva C por um de 20 A Curva D).',
          'A câmara de extinção de arco com aletas deionizadoras de aço divide o arco em dezenas de arcos menores, alongando-o e resfriando-o bruscamente para extinguir a corrente na primeira passagem por zero.',
          'Disjuntores em caixa moldada (MCCB) permitem regulagem fina de proteção: ajuste térmico Ir (proteção de sobrecarga ajustável tipicamente de 0,7 a 1,0 × In) e ajuste magnético Im (de 3 a 10 × Ir).',
          'Classes de limitação de energia: disjuntores Classe 3 de limitação I²t reduzem em até 80% o estresse mecânico e térmico sobre os cabos a jusante em relação a disjuntores convencionais.'
        ],
        fieldCase: {
          localizacao: 'Moinho de Trigo de Matola, Província de Maputo',
          cenario: 'Um compressor de ar de parafuso de 15 kW 400 V (In = 28 A, corrente de partida direta Ip = 175 A durante 1,4 segundo) desarmava instantaneamente o disjuntor de proteção toda vez que o pressostato comandava o religamento da máquina.',
          diagnostico: 'O disjuntor instalado no painel era um MCB de 32 A Curva B. Na Curva B, o disparo magnético ocorre entre 3 e 5 vezes In (96 A a 160 A). Como a corrente de partida de 175 A superava o limiar magnético de 160 A, o êmbolo eletromagnético atuava em 15 milissegundos, desarmando o disjuntor em falso sem que houvesse qualquer defeito na linha.',
          solucaoNormativa: 'Substituição do disjuntor por um MCB de 32 A Curva D (limiar magnético entre 10 e 20 vezes In, ou seja, de 320 A a 640 A). A corrente transitória de partida de 175 A ficou perfeitamente dentro da zona de tolerância transitória da Curva D, permitindo a partida suave do compressor, enquanto a fiação de 6 mm² (Iz = 38 A) permaneceu rigorosamente protegida contra sobrecargas pelo bimetal de 32 A.'
        },
        funcionamento: 'Durante a manobra de abertura sob curto, os contatos principais se separam em alta velocidade. O arco elétrico que surge entre as pastilhas de prata-óxido de estanho é soprado magneticamente por placas condutoras em direção à câmara de corte, onde dezenas de aletas divisoras segmentam o arco, refrigerando-o e forçando a tensão de arco a superar a tensão da rede até a extinção plena.',
        aplicacaoMocambique: 'A proximidade de muitos estabelecimentos comerciais e oficinas com Postos de Transformação (PTs) da EDM de 630 kVA a 1000 kVA resulta em correntes de curto-circuito presumidas superiores a 6 kA ou 10 kA na entrada geral, exigindo a seleção rigorosa de disjuntores industriais com suportabilidade comprovada.',
        exemploPratico: 'Circuito com cabo de 4 mm² (capacidade Iz = 28 A em conduto embutido): Disjuntor termomagnético selecionado In = 25 A Curva C. O bimetal desarma em caso de sobrecarga sustentada (> 32 A contínuos), e o magnético atua instantaneamente para correntes de curto entre 125 A e 250 A (5 a 10 × In), garantindo proteção total e sem desarmes falsos na ligação de pequenos eletrodomésticos.',
        calculationSnippet: 'Curva B: 3-5 In | Curva C: 5-10 In | Curva D: 10-20 In | In ≤ Iz sempre'
      },
      quiz: {
        question: 'Em um projeto elétrico, foi dimensionado um circuito terminal para alimentar um banco de transformadores de iluminação de néon e motores especiais cuja corrente nominal total é In = 16 A, porém com forte corrente transitória de magnetização inicial (inrush) de 12 vezes a corrente nominal (192 A durante 100 ms). Qual tipo de curva de disjuntor termomagnético MCB deve ser empregado para suportar o pico sem abrir e manter a fiação protegida?',
        options: [
          { id: 'A', text: 'Disjuntor de 16 A Curva B.', isCorrect: false, feedback: 'Incorreto. A Curva B atua entre 3 e 5 In (48 A a 80 A) e desarmaria instantaneamente com o pico de 192 A.' },
          { id: 'B', text: 'Disjuntor de 16 A Curva C.', isCorrect: false, feedback: 'Incorreto. A Curva C atua entre 5 e 10 In (80 A a 160 A); com 192 A o disparo magnético atuaria em falso.' },
          { id: 'C', text: 'Disjuntor de 16 A Curva D.', isCorrect: true, feedback: 'Correto! A Curva D tem disparo magnético instantâneo ajustado entre 10 e 20 vezes In (160 A a 320 A), suportando o pico transitório de 192 A sem desarmar e mantendo o cabo de 2,5 mm² protegido pelo bimetal de 16 A.' },
          { id: 'D', text: 'Disjuntor de 63 A Curva B.', isCorrect: false, feedback: 'Totalmente proibido! Um disjuntor de 63 A deixaria a fiação desprotegida contra sobrecargas, causando incêndio.' }
        ],
        explanation: 'A Curva D é normatizada com disparo magnético instantâneo entre 10 e 20 vezes a corrente nominal (In). Para um disjuntor de 16 A, essa faixa magnética situa-se entre 160 A e 320 A. Como o pico transitório de inrush do circuito atinge 192 A, ele situa-se perfeitamente dentro da faixa da Curva D, assegurando a operação estável sem desarmes intempestivos e sem comprometer a proteção térmica da fiação.',
        keyTakeaway: 'Inrush elevado (10 a 15 In): use Curva D (10-20 In), mantendo o calibre nominal In rigorosamente dimensionado para a capacidade Iz do condutor.',
        xpReward: 50
      },
      assessmentQuestions: [
        {
          id: 'elec_m4_ec2_q1_faixas_disparo_curvas_mcb',
          type: 'multiple_choice',
          question: 'Três disjuntores termomagnéticos de mesmo calibre nominal In = 20 A possuem, respectivamente, Curvas B, C e D de atuação. Quais são os limites exatos da corrente de disparo magnético instantâneo para cada um desses três disjuntores?',
          scenario: 'Verificação dos limiares eletromagnéticos de disparo de disjuntores modulares em trilho DIN.',
          norma: 'Boas Práticas de Engenharia e Padrões Industriais de Mercado',
          points: 33,
          explanation: 'As faixas normalizadas são:\n• Curva B (3 a 5 × In): 3 × 20 A a 5 × 20 A = 60 A a 100 A.\n• Curva C (5 a 10 × In): 5 × 20 A a 10 × 20 A = 100 A a 200 A.\n• Curva D (10 a 20 × In): 10 × 20 A a 20 × 20 A = 200 A a 400 A.',
          keyTakeaway: 'Para In = 20 A: Curva B atua entre 60 A e 100 A; Curva C entre 100 A e 200 A; Curva D entre 200 A e 400 A.',
          options: [
            { id: 'opt_1_1', text: 'Curva B: 60 A a 100 A | Curva C: 100 A a 200 A | Curva D: 200 A a 400 A.', isCorrect: true, feedback: 'Correto! Respeita com exatidão matemática os múltiplos 3-5 In, 5-10 In e 10-20 In.' },
            { id: 'opt_1_2', text: 'Curva B: 20 A a 40 A | Curva C: 40 A a 80 A | Curva D: 80 A a 160 A.', isCorrect: false, feedback: 'Incorreto. Valores de múltiplos incompatíveis com os padrões internacionais.' },
            { id: 'opt_1_3', text: 'Curva B: 100 A a 200 A | Curva C: 200 A a 400 A | Curva D: 400 A a 800 A.', isCorrect: false, feedback: 'Incorreto. Inverteu a ordem de sensibilidade das curvas.' },
            { id: 'opt_1_4', text: 'Todos atuam rigorosamente com 20 A instantâneo.', isCorrect: false, feedback: 'Incorreto. 20 A é a corrente nominal contínua, não a faixa de disparo magnético.' }
          ]
        },
        {
          id: 'elec_m4_ec2_q2_mccb_ajuste_termomagnetico',
          type: 'multiple_choice',
          question: 'Em um quadro de distribuição geral industrial, foi especificado um Disjuntor em Caixa Moldada (MCCB) de corrente de carcaça In = 250 A com disparador térmico ajustável entre 0,7 e 1,0 × In e disparador magnético ajustável entre 5 e 10 × Ir. Se a corrente de projeto da carga contínua for IB = 180 A e a capacidade do cabo for Iz = 210 A, qual regulagem de Ir e de Im deve ser ajustada no disjuntor para cumprir rigorosamente as Boas Práticas de Engenharia?',
          scenario: 'Calibração dos ajustes térmico e magnético de disjuntores em caixa moldada (MCCB).',
          norma: 'Boas Práticas de Engenharia e Padrões Industriais de Mercado',
          points: 33,
          explanation: 'Pela regra fundamental de sobrecarga: IB ≤ Ir ≤ Iz. Como IB = 180 A e Iz = 210 A, o ajuste térmico Ir deve ser ajustado para um valor nessa faixa. Com carcaça de 250 A: selecionando Ir = 0,80 × 250 A = 200 A, temos 180 A ≤ 200 A ≤ 210 A (perfeita conformidade). Para o ajuste magnético Im, com fator de 6 a 8 vezes Ir (ex: 6 × 200 A = 1200 A), assegura-se a imunidade a transitórios com desarme ultrarrápido em caso de curto franco.',
          keyTakeaway: 'Ajuste MCCB: Ir = 0,8 × 250 A = 200 A (atende IB = 180 A ≤ Ir ≤ Iz = 210 A); Im ajustado conforme estudo de curto-circuito.',
          options: [
            { id: 'opt_2_1', text: 'Ajustar o disparador térmico para Ir = 200 A (fator 0,80 × In), garantindo 180 A ≤ Ir ≤ 210 A.', isCorrect: true, feedback: 'Excelente! Ir = 200 A protege o condutor de 210 A e opera confortavelmente com a carga de 180 A.' },
            { id: 'opt_2_2', text: 'Ajustar o disparador térmico no máximo de Ir = 250 A (fator 1,0 × In).', isCorrect: false, feedback: 'Incorreto. 250 A superaria a capacidade do condutor Iz = 210 A, violando a regra de sobrecarga.' },
            { id: 'opt_2_3', text: 'Ajustar o disparador térmico em Ir = 150 A.', isCorrect: false, feedback: 'Incorreto. 150 A é menor que IB (180 A) e causaria desarme contínuo indevido com a carga normal.' },
            { id: 'opt_2_4', text: 'Desativar o bimetal térmico e deixar apenas o disparo magnético ativo.', isCorrect: false, feedback: 'Incorreto. Deixaria a linha totalmente desprotegida contra sobrecargas graduais.' }
          ]
        },
        {
          id: 'elec_m4_ec2_q3_limite_energia_passante_i2t',
          type: 'multiple_choice',
          question: 'Ao selecionar um disjuntor termomagnético MCB para proteger um condutor de cobre de 2,5 mm² isolado em PVC contra curtos-circuitos, a suportabilidade térmica máxima admissível do condutor é dada por k²·S² = (115)² × (2,5)² = 82.656 A²s. Para assegurar a proteção integral do condutor segundo as Boas Práticas, qual condição a energia específica passante (I²t) do disjuntor deve satisfazer durante o corte do curto-circuito?',
          scenario: 'Verificação da integridade térmica de condutores submetidos a correntes de curto-circuito.',
          norma: 'Boas Práticas de Engenharia e Padrões Industriais de Mercado',
          points: 34,
          explanation: 'A condição normativa de proteção contra curto-circuito em tempos inferiores a 0,1 s é a equação de energia passante: I²t_disjuntor ≤ k² × S². Para o cabo de 2,5 mm² de PVC (constante k = 115 para cobre com PVC), a máxima energia suportada sem destruição da isolação é 82.656 A²s. Portanto, o disjuntor deve apresentar energia passante I²t estritamente menor ou igual a 82.656 A²s em sua corrente de curto presumida.',
          keyTakeaway: 'I²t_passante ≤ k² · S²: A energia liberada durante a abertura do arco no disjuntor não pode exceder o estresse térmico suportado pela massa de cobre do condutor.',
          options: [
            { id: 'opt_3_1', text: 'O disjuntor deve garantir I²t_passante ≤ 82.656 A²s durante toda a interrupção da falta.', isCorrect: true, feedback: 'Perfeito! Respeita a inequação térmica k²·S² ≥ I²t, impedindo que o cobre atinja a temperatura de degradação do isolamento.' },
            { id: 'opt_3_2', text: 'O disjuntor deve permitir passar pelo menos 200.000 A²s para queimar o ponto do curto.', isCorrect: false, feedback: 'Totalmente incorreto. 200.000 A²s destruiria completamente a capa do cabo em chamas.' },
            { id: 'opt_3_3', text: 'A energia passante do disjuntor é irrelevante desde que a tensão seja 230 V.', isCorrect: false, feedback: 'Incorreto. O estresse térmico I²t é o parâmetro mais crítico em curtos-circuitos francos.' },
            { id: 'opt_3_4', text: 'O disjuntor deve ser escolhido com k = 0 para ter energia passante nula.', isCorrect: false, feedback: 'Incorreto. k é uma constante intrínseca do material metálico condutor e isolante.' }
          ]
        }
      ]
    },

    // ------------------------------------------------------------------------
    // ELEMENTO 4.3: Dispositivos Diferenciais Residuais (DR/RCD - Tipos AC, A, F, B)
    // ------------------------------------------------------------------------
    {
      id: 'elec_m4_ec3_dispositivos_diferenciais_rcd_dr',
      moduleId: 'elec_mod_4_aparelhagem_protecao',
      moduleTitle: 'Módulo 4: Aparelhagem de Corte, Proteção e Seccionamento',
      order: 3,
      code: 'EC 4.3',
      title: 'Dispositivos Diferenciais Residuais (DR/RCD - Tipos AC, A, F, B)',
      norma: 'Boas Práticas de Engenharia e Padrões Industriais de Mercado',
      level: 'Avançado',
      durationMinutes: 18,
      theory: {
        conceito: 'O Dispositivo Diferencial Residual (DR / RCD / IDR) é o componente fundamental de segurança destinado a proteger pessoas contra choques elétricos por contato direto ou indireto e proteger edificações contra incêndios causados por correntes de fuga persistentes à terra. Seu funcionamento baseia-se na Primeira Lei de Kirchhoff e no princípio do balanço magnético em um transformador toroidal de núcleo ferromagnético de alta permeabilidade: todos os condutores ativos (fases e neutro) passam obrigatoriamente através do interior do toroide. Em regime normal e sem falhas, a soma vetorial instantânea das correntes é rigorosamente nula (Σ I = 0), não induzindo fluxo magnético no núcleo. Caso ocorra uma falha de isolamento ou contato humano com uma fase viva, uma fração da corrente drena para a terra através do solo ou da carcaça metálica, gerando um desbalanço de corrente residual (I_Δn). Esse desbalanço induz uma força eletromotriz na bobina secundária de detecção, que aciona um relé polarizado de altíssima sensibilidade, destravando a mola de abertura dos contatos em menos de 30 a 40 milissegundos. Pela IEC 62423 e normas correlatas, os RCDs classificam-se em 4 tipos fundamentais com base na forma de onda da corrente de fuga que conseguem detectar: Tipo AC (exclusivo para correntes alternadas puramente senoidais de 50/60 Hz; cega na presença de componentes DC); Tipo A (detecta correntes senoidais e correntes contínuas pulsantes monofásicas geradas por pontes retificadoras comuns); Tipo F (detecta formas de onda compostas e frequências mistas de até 1 kHz provenientes de aparelhos com inversores monofásicos como bombas de calor e máquinas de lavar inverter); Tipo B (detecta correntes alternadas até 100 kHz, contínuas pulsantes e Corrente Contínua Pura / DC alisada com ondulação residual; obrigatório em inversores trifásicos, carregadores de veículos elétricos e sistemas fotovoltaicos).',
        formulas: [
          {
            label: 'Equação Fundamental de Corrente Residual no Toroide',
            formula: 'I_Δ = |i_F1 + i_F2 + i_F3 + i_N| > I_Δn',
            explicacao: 'Condição matemática para disparo automático do mecanismo diferencial'
          },
          {
            label: 'Sensibilidade de Proteção de Vidas Humanas',
            formula: 'I_Δn ≤ 30 mA \t(Tempo de desarme t ≤ 40 ms a 5 × I_Δn)',
            explicacao: 'Limiar biomédico que impede a ocorrência de fibrilação ventricular cardíaca irreversível'
          },
          {
            label: 'Sensibilidade de Proteção contra Incêndios',
            formula: 'I_Δn = 300 mA a 500 mA',
            explicacao: 'Limita a potência de arco elétrico de fuga à terra abaixo de 60 W a 100 W (ignição)'
          },
          {
            label: 'Condição Obrigatória em Regime de Aterramento TT',
            formula: 'R_A × I_Δn ≤ U_L \t(U_L = 50 V seco ou 25 V molhado)',
            explicacao: 'Garante que a carcaça nunca atinja tensão perigosa antes do desligamento'
          }
        ],
        pontosOperacionais: [
          'Fenômeno de cegueira ("blinding") de RCDs: correntes de fuga contínuas puras (DC) superiores a 6 mA saturam o núcleo magnético toroidal de RCDs Tipo AC e Tipo A, paralisando o mecanismo. NESSA CONDIÇÃO, O RCD NÃO DESARMA NEM MESMO SE UMA PESSOA LEVAR UM CHOQUE DE 230 V ALTERNADO!',
          'O condutor de Proteção (PE - fio verde-amarelo) NUNCA deve passar pelo interior do toroide do RCD; caso passe, a corrente de fuga que retorna pelo PE anulará o desbalanço e o DR nunca atuará.',
          'Emendas e contato do Neutro com a massa ou aterramento a jusante do RCD causam desarmes em falso frequentes toda vez que qualquer carga da casa for ligada.',
          'Botão de teste "T": deve ser acionado obrigatoriamente a cada 1 a 6 meses para movimentar mecanicamente as travas e testar a integridade do circuito de disparo.'
        ],
        fieldCase: {
          localizacao: 'Estação de Carga de Veículos Elétricos da Baixa de Maputo',
          cenario: 'Em um ponto de recarga rápida de veículos elétricos (EV Charger) trifásico de 22 kW, o instalador havia colocado um interruptor diferencial residual tetrapolar comum de 40 A Tipo AC de 30 mA. Durante o carregamento de uma frota de vans elétricas, o motorista sentiu formigamento intenso ao encostar na carcaça metálica molhada da estação de carga sob chuva.',
          diagnostico: 'A medição com osciloscópio e alicate de corrente diferencial revelou uma fuga contínua pura de 18 mA DC proveniente do retificador chaveado de bordo do veículo. Essa fuga DC saturou completamente o núcleo de ferro do RCD Tipo AC, paralisando seu mecanismo e impedindo que atuasse mesmo com a tensão de toque atingindo 42 V no piso molhado.',
          solucaoNormativa: 'Substituição imediata do dispositivo por um RCD tetrapolar Tipo B certificado para 30 mA com imunidade a componentes contínuas até 100 kHz. No ensaio de injeção de rampa DC, o novo RCD Tipo B atuou com precisão cirúrgica aos 16 mA DC em apenas 22 milissegundos.'
        },
        funcionamento: 'Os RCDs Tipo B incorporam tecnologia eletrônica híbrida: utilizam o toroide tradicional para detecção passiva de faltas em 50 Hz e um segundo circuito com gerador oscilador de fluxo saturado (fluxgate / sensor Hall) alimentado eletronicamente para monitorar permanentemente qualquer desvio de corrente contínua pura ou de alta frequência.',
        aplicacaoMocambique: 'A generalização de ares-condicionados do tipo "Inverter" em habitações e edifícios em Moçambique torna a aplicação de RCDs Tipo A ou Tipo F indispensável, pois os antigos RCDs Tipo AC já não oferecem proteção confiável contra fugas com componentes contínuas pulsantes geradas por eletrônica de potência.',
        exemploPratico: 'Um circuito trifásico sem neutro alimenta um motor através de inversor VFD. Fuga à terra com componente contínua de 12 mA DC e 20 mA de ruído em 8 kHz: um RCD Tipo AC ignora a falta e satura; um RCD Tipo A também falha; somente um RCD Tipo B identifica com precisão a magnitude composta e desliga os contatos em 25 ms.',
        calculationSnippet: 'Tipo AC: só AC senoidal | Tipo A: AC + DC pulsante | Tipo B: DC pura + inversores VFD'
      },
      quiz: {
        question: 'Em uma linha de envase industrial equipada com três inversores de frequência trifásicos (VFD) com retificadores de ponte completa de 6 diodos e barramento CC de 560 V, qual classe de dispositivo diferencial residual (DR/RCD) deve ser especificada de acordo com as Boas Práticas e normas técnicas para garantir a proteção de pessoas contra choques?',
        options: [
          { id: 'A', text: 'RCD Tipo AC convencional de baixo custo.', isCorrect: false, feedback: 'Incorreto. O Tipo AC sofre saturação magnética (cegueira) com fugas DC trifásicas e falha em desarmar.' },
          { id: 'B', text: 'RCD Tipo A padrão residencial.', isCorrect: false, feedback: 'Incorreto. O Tipo A só opera em DC pulsante monofásico de meia-onda; retificadores trifásicos geram DC puro alisado.' },
          { id: 'C', text: 'RCD Tipo B, projetado especificamente para detectar correntes diferenciais residuais alternadas, contínuas pulsantes e de corrente contínua pura (DC alisada).', isCorrect: true, feedback: 'Excelente! Apenas o Tipo B (e B+) possui transdutores magnéticos ativos para detectar fugas de CC pura oriundas de retificadores trifásicos de inversores.' },
          { id: 'D', text: 'Não se deve usar RCD algum, apenas isolar a máquina com tapete de borracha.', isCorrect: false, feedback: 'Incorreto. O desligamento automático por proteção diferencial é inegociável.' }
        ],
        explanation: 'Retificadores trifásicos alimentados por 400 V geram no barramento intermediário uma tensão contínua com ondulação de 300 Hz que, em caso de fuga à carcaça, produz uma corrente contínua pura (DC alisada). Correntes DC acima de 6 mA saturam os núcleos toroidais de RCDs Tipo AC e Tipo A, tornando-os incapazes de operar. O RCD Tipo B (padronizado pela IEC 62423) é o único dispositivo tecnicamente qualificado para proteger circuitos com conversores trifásicos e inversores de frequência.',
        keyTakeaway: 'Inversores trifásicos, no-breaks industriais e carregadores EV exigem RCD Tipo B para impedir a cegueira magnética por corrente contínua pura.',
        xpReward: 50
      },
      assessmentQuestions: [
        {
          id: 'elec_m4_ec3_q1_limiar_biomedico_fibrilacao',
          type: 'multiple_choice',
          question: 'Qual é o fundamento biomédico e eletrofisiológico consagrado internacionalmente pela engenharia clínica que determina o valor de I_Δn = 30 mA como a sensibilidade máxima de dispositivos diferenciais residuais destinados à proteção de seres humanos contra contatos diretos e indiretos?',
          scenario: 'Fundamentos da segurança humana e efeitos fisiológicos da corrente elétrica no organismo.',
          norma: 'Boas Práticas de Engenharia e Padrões Industriais de Mercado',
          points: 33,
          explanation: 'Estudos eletrofisiológicos das curvas tempo-corrente demonstram que uma corrente elétrica alternada de 50/60 Hz que atravesse o corpo humano com valor até 30 mA raramente provoca fibrilação ventricular do coração (zona de disparo antes do limiar irreversível), independentemente do tempo de passagem. Acima de 50 mA a 100 mA, o risco de parada cardíaca por fibrilação ventricular sobe exponencialmente para quase 100%. Por isso, a sensibilidade máxima admitida para salvar vidas humanas é rigorosamente 30 mA.',
          keyTakeaway: '30 mA é o limite fisiológico máximo seguro contra fibrilação ventricular fatal no coração humano.',
          options: [
            { id: 'opt_1_1', text: '30 mA é o limiar máximo de corrente que não deflagra fibrilação ventricular cardíaca letal no corpo humano.', isCorrect: true, feedback: 'Correto! É a fronteira comprovada da medicina e engenharia de segurança entre o choque não letal e a parada cardíaca.' },
            { id: 'opt_1_2', text: '30 mA é a corrente que impede que lâmpadas LED queimem por sobretensão.', isCorrect: false, feedback: 'Incorreto. DR não tem relação com queima de lâmpadas por sobretensão.' },
            { id: 'opt_1_3', text: '30 mA foi escolhido apenas porque facilita a fabricação de molas mais baratas.', isCorrect: false, feedback: 'Incorreto. O valor é fundamentado em curvas fisiológicas universais de segurança biológica.' },
            { id: 'opt_1_4', text: '30 mA é a sensibilidade indicada para proteger transformadores de média tensão de 33 kV.', isCorrect: false, feedback: 'Incorreto. Transformadores de MT utilizam relés secundários de proteção de terra 50N/51N.' }
          ]
        },
        {
          id: 'elec_m4_ec3_q2_fenomeno_cegueira_blinding',
          type: 'multiple_choice',
          question: 'Em uma perícia de acidente em bancada de ensaios elétricos, constatou-se que um RCD Tipo AC de 30 mA falhou completamente em atuar durante um choque de 230 V alternados sofrido por um técnico. A investigação apontou que, no mesmo circuito, havia uma fuga de corrente contínua pura de 15 mA DC fluindo para a terra a partir de uma fonte chaveada defeituosa. Qual fenômeno físico explica essa falha catastrófica do RCD?',
          scenario: 'Diagnóstico pericial de falha de desarme por saturação magnética de núcleo toroidal.',
          norma: 'Boas Práticas de Engenharia e Padrões Industriais de Mercado',
          points: 33,
          explanation: 'O fenômeno é denominado "cegueira do RCD" (RCD blinding). A corrente contínua pura (DC) de 15 mA gera um fluxo magnético constante e unidirecional no núcleo de ferrite ou permalloy do transformador toroidal do RCD Tipo AC, deslocando o ponto de trabalho para a região de saturação magnética profunda (curva B-H horizontal). Nessa condição saturada, a permeabilidade magnética cai para níveis próximos aos do ar, tornando o toroide totalmente incapaz de transformar variações alternadas de corrente em tensão de disparo, paralisando o dispositivo.',
          keyTakeaway: 'Cegueira magnética (blinding): Fugas DC > 6 mA saturam o núcleo de RCDs Tipo AC e Tipo A, impedindo o desarme contra choques elétricos.',
          options: [
            { id: 'opt_2_1', text: 'Saturação magnética unidirecional do núcleo toroidal ("blinding"), que anula a indução de tensão no secundário de disparo.', isCorrect: true, feedback: 'Excelente! A componente contínua satura a curva de histerese B-H do toroide, cegando o dispositivo.' },
            { id: 'opt_2_2', text: 'Rompimento da mola mecânica principal devido à gravidade atmosférica local.', isCorrect: false, feedback: 'Incorreto. Trata-se de uma causa física magnética, não mecânica externa.' },
            { id: 'opt_2_3', text: 'O cabo de terra estava muito bem aterrado com resistência menor que 1 Ohm.', isCorrect: false, feedback: 'Incorreto. Baixa resistência de terra facilitaria a condução da falta e o desligamento.' },
            { id: 'opt_2_4', text: 'Inversão dos polos de fase e neutro que queima o toroide instantaneamente.', isCorrect: false, feedback: 'Incorreto. RCDs monofásicos funcionam perfeitamente independentemente da polaridade relativa.' }
          ]
        },
        {
          id: 'elec_m4_ec3_q3_calculo_tensao_toque_tt',
          type: 'multiple_choice',
          question: 'Em uma instalação industrial operando em esquema de aterramento TT (com tensão de fase 230 V e tensão de toque limite de segurança U_L = 50 V), a resistência medida do eletrodo de terra das massas metálicas é de R_A = 22 Ω. Qual é o valor máximo admissível para a sensibilidade I_Δn do dispositivo diferencial residual que garante que a tensão na carcaça metálica jamais atinja 50 V em caso de falta plena à terra?',
          scenario: 'Cálculo analítico da condição de segurança R_A · I_Δn ≤ U_L em sistemas de aterramento TT.',
          norma: 'Boas Práticas de Engenharia e Padrões Industriais de Mercado',
          points: 34,
          explanation: 'Pela regra consagrada para regime TT: R_A × I_Δn ≤ U_L. Isolando a corrente diferencial máxima: I_Δn ≤ U_L / R_A = 50 V / 22 Ω ≈ 2,27 A (2270 mA). Portanto, qualquer RCD padronizado de 30 mA, 100 mA, 300 mA ou 500 mA cumpre a inequação com imensa folga. Por exemplo, com um RCD de 300 mA (0,3 A), a tensão de toque máxima antes do desarme será de apenas: V_toque = 22 Ω × 0,3 A = 6,6 V, infinitamente inferior a 50 V.',
          keyTakeaway: 'R_A · I_Δn ≤ U_L: Com R_A = 22 Ω e limite de 50 V, a corrente de disparo máxima admissível é 2,27 A; um RCD de 30 mA ou 300 mA garante segurança plena.',
          options: [
            { id: 'opt_3_1', text: 'I_Δn deve ser menor ou igual a 2,27 A (sendo plenamente satisfeito por RCDs de 30 mA, 300 mA ou 500 mA).', isCorrect: true, feedback: 'Correto! 50 V / 22 Ω = 2,27 A. Dispositivos comerciais de 30 mA ou 300 mA limitam a tensão de toque a níveis totalmente inofensivos (< 7 V).' },
            { id: 'opt_3_2', text: 'I_Δn deve ser estritamente maior que 50 A.', isCorrect: false, feedback: 'Incorreto. 50 A em 22 Ohms geraria uma tensão letal de 1100 V nas carcaças metálicas.' },
            { id: 'opt_3_3', text: 'I_Δn deve ser de exatamente 0,001 mA com custo de laboratório espacial.', isCorrect: false, feedback: 'Incorreto. Valor impraticável que desarmaria com a própria capacitância natural dos cabos.' },
            { id: 'opt_3_4', text: 'A tensão de toque no esquema TT não depende do valor de R_A.', isCorrect: false, feedback: 'Incorreto. A resistência de terra R_A é o elemento primordial que define a tensão de falta.' }
          ]
        }
      ]
    },

    // ------------------------------------------------------------------------
    // ELEMENTO 4.4: Descarregadores de Sobretensões (DPS Classe I, II e III)
    // ------------------------------------------------------------------------
    {
      id: 'elec_m4_ec4_descarregadores_sobretensoes_dps',
      moduleId: 'elec_mod_4_aparelhagem_protecao',
      moduleTitle: 'Módulo 4: Aparelhagem de Corte, Proteção e Seccionamento',
      order: 4,
      code: 'EC 4.4',
      title: 'Descarregadores de Sobretensões (DPS Classe I, II e III)',
      norma: 'Boas Práticas de Engenharia e Padrões Industriais de Mercado',
      level: 'Avançado',
      durationMinutes: 18,
      theory: {
        conceito: 'Os Descarregadores de Sobretensões (DPS / SPD - Surge Protective Devices) são aparelhos projetados para limitar sobretensões transitórias de origem atmosférica (descargas elétricas atmosféricas diretas ou induzidas) ou de manobra na rede de média e alta tensão (chaveamento de bancos de capacitores, desarmes de disjuntores da subestação), desviando com segurança as severas correntes de surto transitórias para a terra. Os elementos de corte internos mais utilizados são o Varistor de Óxido Metálico (MOV - Metal Oxide Varistor, de resposta ultrarrápida em nanossegundos e comportamento resistivo fortemente não linear) e o Centelhador a Gás / Centelhador de Faísca encapsulado (Spark Gap, de altíssima capacidade de escoamento energético sem degradação). A classificação internacional estabelece 3 classes de ensaio e aplicação: Classe I (Tipo 1 - testado com forma de onda de altíssima energia 10/350 μs, caracterizada por corrente impulsiva I_imp; obrigatório no Quadro Geral QGBT de edificações dotadas de para-raios externo SPDA ou alimentadas por linhas aéreas desprotegidas); Classe II (Tipo 2 - testado com forma de onda de indução indireta 8/20 μs, avaliado pela corrente nominal de descarga I_n e corrente máxima I_max; instalado nos quadros de distribuição intermediários); Classe III (Tipo 3 - testado com onda combinada de 1,2/50 μs e 8/20 μs, posicionado o mais próximo possível das cargas eletrônicas sensíveis, como servidores, CLPs e equipamentos médicos). A eficácia da proteção é determinada pelo Nível de Proteção Efetivo (Up), que deve ser rigorosamente inferior à suportabilidade dielétrica dos equipamentos (Uw), e pelo cumprimento inegociável da "Regra dos 50 cm" no comprimento dos condutores de conexão.',
        formulas: [
          {
            label: 'Forma de Onda de Corrente Classe I (Impacto Direto de Raio)',
            formula: 'Onda 10/350 μs \t(Parâmetro I_imp)',
            explicacao: 'Frente de onda em 10 μs e meia-cauda em 350 μs (alta energia integral de carga Q)'
          },
          {
            label: 'Forma de Onda de Corrente Classe II (Indução Atmosférica)',
            formula: 'Onda 8/20 μs \t(Parâmetros I_n e I_max)',
            explicacao: 'Frente de onda em 8 μs e cauda rápida de 20 μs (surtos induzidos comuns)'
          },
          {
            label: 'Critério de Coordenação de Tensão (Proteção Efetiva)',
            formula: 'U_p_efetivo = U_p + ΔU_cabos ≤ U_w',
            explicacao: 'Up do DPS somado à queda indutiva nos cabos deve ser inferior à tensão suportada Uw'
          },
          {
            label: 'Regra dos 50 cm (Indutância Parasita dos Condutores)',
            formula: 'L_total = L1 + L2 + L3 ≤ 0,50 m \t(ΔV ≈ L × di/dt ≈ 1000 V/m)',
            explicacao: 'Comprimento máximo entre Fase-DPS e DPS-Barramento PE para não degradar a proteção'
          }
        ],
        pontosOperacionais: [
          'Regra dos 50 cm inegociável: a cada 1 metro de cabo de conexão do DPS, a indutância parasita do condutor (aprox. 1 μH/m) soma cerca de 1000 V adicionais de sobretensão no momento da rápida subida da corrente do raio (L · di/dt). Cabos longos de conexão anulam completamente a proteção do DPS!',
          'Coordenação em cascata: quando um DPS Classe I é instalado no QGBT e um DPS Classe II é colocado no quadro parcial a jusante, deve existir um comprimento mínimo de cabo de 5 a 10 metros entre eles (ou indutor de desacoplamento) para assegurar que o Classe I dispare antes que o Classe II atinja seu limite de energia.',
          'Fusível ou disjuntor de backup dedicado: caso a corrente de curto presumida no quadro ou o calibre do disjuntor geral exceda o valor máximo especificado pelo fabricante do DPS (geralmente > 125 A ou 160 A), é obrigatório instalar fusíveis gG coordenados em série antes de cada polo do DPS.',
          'Janela de inspeção de estado do cartucho: Verde = Em serviço normal; Vermelha = Varistor degradado por fim de vida útil ou surto violento, com desconector térmico interno acionado, exigindo substituição imediata do módulo plugável.'
        ],
        fieldCase: {
          localizacao: 'Centro de Dados Bancário de Nampula',
          cenario: 'Em uma agência bancária equipada com torre de telecomunicações de 30 metros de altura com para-raios do tipo Franklin no topo do prédio, ocorreu uma trovoada severa. As fontes de alimentação dos roteadores principais e servidores queimaram instantaneamente, apesar de existir um DPS Classe II de 40 kA instalado no painel de entrada.',
          diagnostico: 'A perícia técnica constatou duas não conformidades graves: 1) O edifício possui sistema de proteção contra descargas atmosféricas externo (SPDA), o que torna OBRIGATÓRIO um DPS Classe I (onda 10/350 μs com Iimp ≥ 25 kA por polo); o Classe II instalado suportava apenas onda induzida 8/20 μs e entrou em saturação térmica com destruição dos varistores; 2) O eletricista ligou o DPS ao barramento de terra com um condutor de 1,60 m de comprimento formando voltas espirais (adicionando mais de 1600 V de sobretensão indutiva nos bornes das fontes).',
          solucaoNormativa: 'Instalação de conjunto combinado DPS Classe I+II com centelhador de faísca (Spark Gap) de Iimp = 25 kA e Up = 1,5 kV, montado adjacente aos barramentos com cabos rígidos retos de 16 mm² e comprimento total somado de apenas 18 cm, além de fusíveis de backup NH 00 de 63 A gG dedicados. Zero falhas nas temporadas seguintes de chuva.'
        },
        funcionamento: 'Sob a tensão alternada de operação de 230 V, a resistência do varistor de óxido de zinco (ZnO) é de centenas de megaohms, circulando uma corrente microscópica de fuga (< 1 mA). Quando uma frente de onda de alta tensão atinge o condutor, as junções semicondutoras de grãos de ZnO entram em condução por efeito túnel em menos de 25 nanossegundos, colapsando a resistência para frações de miliohm e drenando a corrente do raio para o solo.',
        aplicacaoMocambique: 'Moçambique situa-se em uma das zonas de maior nível ceraúnico do continente africano, com até 70 a 90 dias de trovoada por ano nas regiões centro e norte (Manica, Tete, Zambézia e Niassa). Qualquer instalação industrial, comercial ou torre de rádio sem DPS Classe I e II coordenado sofre perda certa de placas e inversores.',
        exemploPratico: 'Edificação com entrada trifásica 400 V sem para-raios externo: especifica-se no QGBT um DPS tetrapolar Classe II (Tipo 2) com Uc = 275 V (tensão máxima contínua), In = 20 kA, Imax = 40 kA e Up ≤ 1,4 kV. Ligação executada com cabo de 6 mm² entre barramentos e DPS com comprimento total de 22 cm, garantindo proteção perfeita aos equipamentos eletrônicos cuja suportabilidade dielétrica Uw é de 1,5 kV a 2,5 kV.',
        calculationSnippet: 'Classe I: 10/350 μs (Iimp) | Classe II: 8/20 μs (In/Imax) | Cabos ≤ 50 cm | Up < Uw'
      },
      quiz: {
        question: 'Em um edifício industrial dotado de sistema externo de proteção contra descargas atmosféricas (SPDA / Para-raios tipo Gaiola de Faraday), qual classe de Descarregador de Sobretensões (DPS/SPD) deve ser obrigatoriamente instalada no Quadro Geral de Baixa Tensão (QGBT) de acordo com as Boas Práticas e normas internacionais de proteção?',
        options: [
          { id: 'A', text: 'Apenas DPS Classe III do tipo filtro de linha para tomadas.', isCorrect: false, feedback: 'Incorreto. Classe III é apenas para proteção fina de bancada e explodiria com o primeiro surto do QGBT.' },
          { id: 'B', text: 'DPS Classe I (ou Classe I+II combinada), ensaiado com a forma de onda impulsiva de alta energia de 10/350 μs (I_imp).', isCorrect: true, feedback: 'Correto! Edifícios com para-raios externo podem receber a corrente direta do raio descendo pelas descidas do SPDA, exigindo suporte à onda energética 10/350 μs (Classe I).' },
          { id: 'C', text: 'DPS exclusivo Classe II de 5 kA com onda 8/20 μs.', isCorrect: false, feedback: 'Incorreto. A onda 8/20 μs não possui conteúdo de energia suficiente para suportar corrente direta de raio.' },
          { id: 'D', text: 'Não é necessário DPS no quadro se o edifício já possuir para-raios no teto.', isCorrect: false, feedback: 'Grave engano! O para-raios protege a estrutura física do prédio, mas injeta milhares de volts na terra, queimando os equipamentos elétricos se não houver DPS.' }
        ],
        explanation: 'Quando um edifício possui para-raios externo (SPDA), metade da corrente da descarga atmosférica é descarregada no solo e a outra fração reflete-se para dentro da instalação elétrica através das ligações equipotenciais. O ensaio com onda 10/350 μs (Classe I / Tipo 1) simula o conteúdo energético massivo de uma descarga atmosférica direta. Apenas dispositivos Classe I possuem componentes robustos (como Spark Gaps e varistores de grande porte) capazes de absorver esse impacto no QGBT sem destruição.',
        keyTakeaway: 'Edifício com para-raios externo (SPDA) = DPS Classe I (onda 10/350 μs) OBRIGATÓRIO na entrada do QGBT.',
        xpReward: 50
      },
      assessmentQuestions: [
        {
          id: 'elec_m4_ec4_q1_regra_50cm_queda_indutiva',
          type: 'multiple_choice',
          question: 'Em uma inspeção de qualidade, observou-se que um DPS Classe II foi instalado com cabos de conexão cuja soma total dos comprimentos (fase até o DPS + DPS até a barra de terra PE) era de 1,50 metro. Sabendo que um raio induz uma taxa de subida de corrente da ordem de di/dt = 1 kA/μs e que a indutância típica de condutores elétricos é de L_unit = 1 μH/m (1 × 10⁻⁶ H/m), qual é a sobretensão indutiva adicional ΔV_L gerada exclusivamente pelo excesso de comprimento desses cabos?',
          scenario: 'Cálculo da queda indutiva dinâmica em condutores de conexão de supressores de surto.',
          norma: 'Boas Práticas de Engenharia e Padrões Industriais de Mercado',
          points: 33,
          explanation: 'Pela Lei de Faraday da indução eletromagnética: ΔV_L = L_total × (di/dt). Para 1,50 metro de condutor: L_total = 1,50 m × 1 μH/m = 1,5 μH = 1,5 × 10⁻⁶ H. Com taxa di/dt = 1 kA/μs = 1000 A / (10⁻⁶ s) = 10⁹ A/s: ΔV_L = 1,5 × 10⁻⁶ H × 10⁹ A/s = 1500 V (1,5 kV adicionais). Essa sobretensão soma-se diretamente ao nível Up do DPS, podendo elevar a tensão resultante para mais de 3000 V nos bornes dos equipamentos sensíveis e destruí-los.',
          keyTakeaway: 'ΔV_L = L · di/dt: 1,5 m de cabo adiciona 1500 V de sobretensão puramente indutiva, comprovando a necessidade vital da regra dos 50 cm (L ≤ 0,5 m).',
          options: [
            { id: 'opt_1_1', text: 'ΔV_L = 1500 V adicionais de sobretensão perigosa nos terminais dos equipamentos.', isCorrect: true, feedback: 'Correto! 1,5 μH × 10⁹ A/s = 1500 V, anulando completamente a eficácia do nível de proteção do DPS.' },
            { id: 'opt_1_2', text: 'ΔV_L = 1,5 V inofensivos.', isCorrect: false, feedback: 'Incorreto. Erro grave na conversão das escalas de microssegundos (10⁻⁶ s).' },
            { id: 'opt_1_3', text: 'ΔV_L = 0 V, pois condutores de cobre não possuem reatância indutiva.', isCorrect: false, feedback: 'Incorreto. Todo condutor real apresenta indutância parasita distribuída de aprox. 1 μH/m.' },
            { id: 'opt_1_4', text: 'ΔV_L = 230 V correspondente à tensão de fase.', isCorrect: false, feedback: 'Incorreto. A queda indutiva é gerada exclusivamente pela dinâmica transitória di/dt do surto.' }
          ]
        },
        {
          id: 'elec_m4_ec4_q2_diferenca_ondas_classe_i_ii',
          type: 'multiple_choice',
          question: 'Qual é a diferença física e energética fundamental entre as ondas de teste padronizadas de 10/350 μs (Classe I) e 8/20 μs (Classe II) utilizadas na certificação de Descarregadores de Sobretensões?',
          scenario: 'Caracterização metrológica das formas de onda impulsivas de ensaio de DPS.',
          norma: 'Boas Práticas de Engenharia e Padrões Industriais de Mercado',
          points: 33,
          explanation: 'A forma de onda 10/350 μs possui tempo de subida de 10 μs e tempo de meia-amplitude de cauda de 350 μs, enquanto a onda 8/20 μs tem cauda de apenas 20 μs. Como a energia térmica e a carga elétrica integral (Q = ∫ i dt) dependem da área sob a curva no tempo, a onda 10/350 μs transfere de 10 a 20 vezes mais energia específica (A²s) e carga (Coulombs) do que a onda 8/20 μs de mesmo valor de pico de corrente, simulando o impacto severo da descarga direta do raio.',
          keyTakeaway: 'A onda 10/350 μs (Classe I) possui cauda 17 vezes mais longa que a 8/20 μs (Classe II), transferindo energia massiva de descargas atmosféricas diretas.',
          options: [
            { id: 'opt_2_1', text: 'A onda 10/350 μs possui cauda muito mais longa e transfere de 10 a 20 vezes mais energia térmica do que a onda 8/20 μs.', isCorrect: true, feedback: 'Excelente! A duração prolongada da onda 10/350 μs impõe estresse energético drástico suportado apenas por DPS Classe I.' },
            { id: 'opt_2_2', text: 'A onda 8/20 μs é mais destrutiva e só é suportada por cabos de fibra óptica.', isCorrect: false, feedback: 'Incorreto. A onda 8/20 μs possui muito menos energia do que a 10/350 μs.' },
            { id: 'opt_2_3', text: 'Ambas as ondas possuem rigorosamente a mesma energia, mudando apenas a cor do invólucro do DPS.', isCorrect: false, feedback: 'Incorreto. Os conteúdos de carga em Coulombs e energia em Joules são drasticamente diferentes.' },
            { id: 'opt_2_4', text: 'A onda 10/350 μs é aplicada apenas em circuitos de corrente contínua pura.', isCorrect: false, feedback: 'Incorreto. Ambas as ondas de teste aplicam-se a sistemas de corrente alternada e contínua.' }
          ]
        },
        {
          id: 'elec_m4_ec4_q3_funcao_desconector_termico',
          type: 'multiple_choice',
          question: 'Em um módulo de DPS com varistor de óxido metálico (MOV), qual é a função essencial do desconector térmico interno mecânico associado ao indicador visual verde/vermelho?',
          scenario: 'Modos de falha de varistores de óxido de zinco e prevenção de curto-circuito interno.',
          norma: 'Boas Práticas de Engenharia e Padrões Industriais de Mercado',
          points: 34,
          explanation: 'Ao final de sua vida útil ou após absorver múltiplos surtos fortes, o varistor de óxido de zinco sofre degradação progressiva em sua estrutura de microgrãos semicondutores, aumentando sua corrente de fuga contínua sob tensão nominal de 230 V. Esse aumento de corrente provoca aquecimento constante (avalanche térmica). O desconector térmico consiste em uma pastilha de solda especial calibrada (baixo ponto de fusão, ~130 °C) que derrete com esse aquecimento sustentado, liberando uma mola mecânica que desconecta fisicamente o varistor da rede antes que ele entre em curto-circuito pleno com fogo, acionando a bandeira visual vermelha na janela de inspeção.',
          keyTakeaway: 'O desconector térmico desliga o varistor degradado antes que ele sofra avalanche térmica com explosão e incêndio, sinalizando a cor vermelha para troca.',
          options: [
            { id: 'opt_3_1', text: 'Desconectar o varistor da rede antes que ele sofra avalanche térmica e incendeie o quadro, alterando a janela visual para vermelho.', isCorrect: true, feedback: 'Perfeito! Previne curto-circuito permanente à terra e fogo no interior do painel elétrico.' },
            { id: 'opt_3_2', text: 'Aumentar a velocidade da corrente para acelerar a internet do cliente.', isCorrect: false, feedback: 'Totalmente descabido e sem qualquer relação com a física elétrica.' },
            { id: 'opt_3_3', text: 'Ligar automaticamente um gerador a diesel de emergência.', isCorrect: false, feedback: 'Incorreto. Essa é uma função do quadro de transferência automática QTA, não do DPS.' },
            { id: 'opt_3_4', text: 'Recarregar a bateria interna do varistor com energia solar.', isCorrect: false, feedback: 'Incorreto. Varistores não contêm baterias nem armazenam energia química.' }
          ]
        }
      ]
    },

    // ------------------------------------------------------------------------
    // ELEMENTO 4.5: Poder de Corte (Icu/Ics) e Seletividade
    // ------------------------------------------------------------------------
    {
      id: 'elec_m4_ec5_poder_corte_seletividade',
      moduleId: 'elec_mod_4_aparelhagem_protecao',
      moduleTitle: 'Módulo 4: Aparelhagem de Corte, Proteção e Seccionamento',
      order: 5,
      code: 'EC 4.5',
      title: 'Poder de Corte (Icu/Ics) e Seletividade Cronométrica/Amperimétrica',
      norma: 'Boas Práticas de Engenharia e Padrões Industriais de Mercado',
      level: 'Avançado',
      durationMinutes: 18,
      theory: {
        conceito: 'O Poder de Corte (Capacidade de Ruptura ou Interrupção) e a Seletividade entre dispositivos de proteção constituem os dois pilares mais críticos da segurança e da continuidade operacional em sistemas elétricos de potência. O Poder de Corte representa a máxima corrente de curto-circuito presumida que um disjuntor é capaz de interromper com sucesso sob sua tensão nominal sem sofrer destruição física violenta ou emissão descontrolada de chamas e estilhaços condutores. Pelos padrões industriais de mercado (IEC 60947-2 para ambiente industrial e IEC 60898-1 para instalações domésticas), definem-se: Icu (Capacidade Última de Interrupção de Curto-Circuito - sequência de teste O - t - CO: o disjuntor interrompe o curto, aguarda tempo de resfriamento e fecha novamente em curto, podendo ficar inoperante após o teste); Ics (Capacidade de Interrupção de Curto-Circuito em Serviço - sequência O - t - CO - t - CO: o disjuntor interrompe três curtos sucessivos e DEVE continuar 100% operacional, apto a conduzir sua corrente nominal contínua e manter a rigidez dielétrica, expresso como porcentagem de Icu: 25%, 50%, 75% ou 100%). Em instalações industriais críticas, deve-se exigir Ics = 100% de Icu. A Seletividade (Coordenação de Proteções) garante que, na ocorrência de uma sobrecorrente ou curto-circuito, atue EXCLUSIVAMENTE o dispositivo de proteção imediatamente a montante do ponto de falha, isolando o menor trecho possível e mantendo todos os outros circuitos sãos do edifício perfeitamente energizados. Os métodos de obtenção de seletividade compreendem: 1) Seletividade Amperimétrica (escalonamento dos limiares de corrente de disparo); 2) Seletividade Cronométrica (temporização intencional de retardo de desarme Δt de 100 a 300 ms em disjuntores da Categoria B segundo IEC 60947-2 dotados de parâmetro Icw); 3) Seletividade Energética / Limitação (baseada na não sobreposição das curvas de energia específica passante I²t); 4) Seletividade Lógica / ZSI (Zone Selective Interlocking com troca de sinais digitais por cabo piloto entre relés eletrônicos).',
        formulas: [
          {
            label: 'Condição Básica de Poder de Corte',
            formula: 'I_cu ≥ I_k_presumida \t(e preferencialmente I_cs ≥ I_k)',
            explicacao: 'A capacidade de interrupção do disjuntor deve superar o curto presumido no local de instalação'
          },
          {
            label: 'Relação Percentual de Poder de Serviço',
            formula: 'I_cs = % × I_cu \t(típicos: 50%, 75% ou 100%)',
            explicacao: 'Indica a robustez mecânica do disjuntor para continuar operando após abrir curtos'
          },
          {
            label: 'Critério de Seletividade Cronométrica',
            formula: 't_montante - t_jusante ≥ Δt_margem \t(Δt ≥ 70 ms a 150 ms)',
            explicacao: 'Diferencial de tempo necessário para o disjuntor jusante abrir antes do montante se mover'
          },
          {
            label: 'Critério de Seletividade Energética em Curto-Circuito',
            formula: 'I²t_total_jusante < I²t_prearco_ou_disparo_montante',
            explicacao: 'A energia térmica liberada no arco a jusante não atinge o limiar de disparo a montante'
          }
        ],
        pontosOperacionais: [
          'Disjuntores domésticos comuns (IEC 60898) têm Icn padronizado em 3 kA, 4,5 kA ou 6 kA. Instalados em quadros industriais próximos a subestações onde o curto atinge 15 kA a 25 kA, esses disjuntores explodem literalmente, fundindo a caixa plástica e projetando cobre vaporizado.',
          'Categoria de utilização segundo IEC 60947-2: Categoria A (disjuntores sem retardo intencional de curta duração, como todos os MCBs modulares); Categoria B (disjuntores projetados com temporização intencional sob curto e suportabilidade de corrente suportável de curta duração Icw, como MCCBs eletrônicos e disjuntores abertos ACB).',
          'A seletividade total entre dois MCBs modulares comuns em trilho DIN é praticamente impossível para curtos francos elevados, pois ambos disparam suas bobinas magnéticas instantâneas simultaneamente em menos de 10 ms (seletividade parcial apenas até a corrente de disparo magnético do disjuntor montante).',
          'Tabelas de coordenação dos fabricantes: a validação de seletividade energética e filiação (cascading) deve ser sempre verificada nas tabelas oficiais de ensaios laboratoriais cruzados emitidas pelos fabricantes certificados (ex: ABB, Schneider, Siemens, Chint, Legrand).'
        ],
        fieldCase: {
          localizacao: 'Hospital Geral de Marrere, Província de Nampula',
          cenario: 'Um curto-circuito franco fase-neutro ocorrido na tomada de um aspirador cirúrgico portátil de 1,5 kW na sala de emergência fez desarmar o disjuntor geral da subestação de 630 A, deixando em blecaute total todo o bloco cirúrgico, incubadoras neonatais e a UTI.',
          diagnostico: 'Ausência total de estudo e coordenação de seletividade: 1) O disjuntor geral em caixa moldada de 630 A era do tipo termomagnético simples sem temporização (tsd = 0 s) e com magnético fixo em 5 × In (3150 A); 2) O curto no circuito terminal atingiu 3800 A devido à proximidade da cabine de transformação (25 metros com cabo grosso); 3) Ambas as bobinas magnéticas (do disjuntor de 16 A da tomada e do geral de 630 A) atuaram em simultâneo em 8 milissegundos, colapsando a energia de todo o complexo hospitalar.',
          solucaoNormativa: 'Substituição do disjuntor geral por um disjuntor em caixa moldada Categoria B com disparador microprocessado eletrônico (ajuste LSI), calibrando o retardo de curta duração em Isd = 4 × Ir com temporização tsd = 150 ms com Icw garantido. Em testes de falta programada com injeção secundária de 4000 A, o MCB terminal de 16 A eliminou o defeito em 5 ms enquanto o disjuntor geral de 630 A permaneceu perfeitamente firme e fechado, assegurando 100% de seletividade total.'
        },
        funcionamento: 'Ao ocorrer um curto a jusante, a corrente sobe com altíssima taxa di/dt. Na seletividade cronométrica, o disjuntor a montante detecta a sobrecorrente, mas seu relé eletrônico retém a ordem de desarme durante o tempo tsd programado (ex: 100 ms). Se o disjuntor a jusante abrir e extinguir a corrente dentro desse intervalo, o relé a montante cancela a contagem de tempo e retorna ao estado de repouso sem interromper os demais circuitos.',
        aplicacaoMocambique: 'Em instalações industriais de processamento contínuo (fábricas de cimento na Matola, açúcar em Xinavane e terminais de carvão em Moatize), um blecaute geral provocado por falta de seletividade em uma tomada secundária custa centenas de milhares de dólares em perdas de produção e danos a fornos.',
        exemploPratico: 'Quadro Principal: Disjuntor MCCB de 400 A com Icu = 50 kA, Ics = 50 kA (100% Icu) e ajuste de retardo tsd = 100 ms. Subquadro Derivado: Disjuntor MCB Curva C de 32 A com Icu = 10 kA (Classe 3 de limitação I²t = 28.000 A²s). Um curto de 4500 A no subquadro é extinto pelo MCB em 4 ms com dissipação de 28.000 A²s, abaixo do limiar de detecção térmica/magnética do MCCB de 400 A (suporta 90.000 A²s), garantindo 100% de seletividade total.',
        calculationSnippet: 'Icu ≥ Ik_presumida | Ics = % de Icu (100% ideal) | Δt ≥ 100 ms | I²t_jusante < I²t_montante'
      },
      quiz: {
        question: 'Qual é o significado técnico normativo da sigla "Ics" (Capacidade de Interrupção de Curto-Circuito em Serviço) e por que um disjuntor industrial com especificação Ics = 100% Icu é superior a um com Ics = 50% Icu?',
        options: [
          { id: 'A', text: 'Ics significa que o disjuntor só pode ser ligado em corrente contínua estática.', isCorrect: false, feedback: 'Incorreto. Ics aplica-se a corrente alternada e contínua e refere-se a curto-circuito em serviço.' },
          { id: 'B', text: 'Ics mede a capacidade do disjuntor de interromper curtos sucessivos e continuar apto a operar normalmente e conduzir sua corrente nominal contínua sem necessidade de troca ou reparo imediato.', isCorrect: true, feedback: 'Perfeito! Ics = 100% de Icu garante que após abrir o curto máximo presumido, o aparelho mantém suas propriedades dielétricas e mecânicas intactas, pronto para voltar ao trabalho.' },
          { id: 'C', text: 'Ics é o tempo que o operador tem para fugir da sala elétrica quando o disjuntor desarma.', isCorrect: false, feedback: 'Totalmente descabido.' },
          { id: 'D', text: 'Ics = 50% é melhor porque consome metade da energia da rede durante o curto.', isCorrect: false, feedback: 'Incorreto. Ics = 50% significa que o disjuntor perde metade de sua robustez após o ensaio de serviço.' }
        ],
        explanation: 'Pela IEC 60947-2, Icu (Ultimate) é o poder de corte limite após o qual o disjuntor pode sofrer danos permanentes e precisar de substituição. Já o Ics (Service) é o poder de corte em serviço, após o qual o disjuntor é submetido a ensaios rigorosos de elevação de temperatura na corrente nominal e de rigidez dielétrica, comprovando que continua 100% confiável em serviço. Um disjuntor com Ics = 100% Icu oferece a máxima robustez mecânica e elétrica do mercado.',
        keyTakeaway: 'Ics = 100% Icu: Máxima confiabilidade industrial, garantindo retorno imediato à operação plena após a extinção de curtos-circuitos severos.',
        xpReward: 50
      },
      assessmentQuestions: [
        {
          id: 'elec_m4_ec5_q1_diferenca_icu_ics',
          type: 'multiple_choice',
          question: 'Dois disjuntores em caixa moldada de 250 A possuem o mesmo poder de corte último Icu = 50 kA a 400 V. No entanto, o fabricante do Disjuntor "A" especifica Ics = 100% Icu (50 kA) e o fabricante do Disjuntor "B" especifica Ics = 50% Icu (25 kA). O que acontece na prática caso ambos interrompam um curto-circuito real de 35 kA na instalação?',
          scenario: 'Análise comparativa de desempenho pós-falha entre disjuntores industriais com diferentes níveis de Ics.',
          norma: 'Boas Práticas de Engenharia e Padrões Industriais de Mercado',
          points: 33,
          explanation: 'Como o curto de 35 kA é inferior a 50 kA (Icu), ambos conseguirão extinguir o arco com sucesso. Porém, para o Disjuntor B, 35 kA excede sua capacidade de serviço garantida Ics (25 kA); seus contatos e câmara sofrem desgaste excessivo e a norma exige que ele seja retirado de serviço e inspecionado/substituído. Já o Disjuntor A possui Ics de 50 kA (suporta 35 kA com ampla folga de serviço), podendo ser rearmado imediatamente após sanar a falha com garantia de conduzir sua carga nominal sem superaquecimento.',
          keyTakeaway: 'Ics = 100% Icu (Disjuntor A) garante que após o curto de 35 kA o disjuntor continua apto para serviço contínuo sem substituição; o Disjuntor B sofre degradação severa.',
          options: [
            { id: 'opt_1_1', text: 'O Disjuntor A permanece apto para continuar em serviço contínuo normal; o Disjuntor B teve seu limite Ics (25 kA) superado e necessita de inspeção/substituição.', isCorrect: true, feedback: 'Correto! Ics define a aptidão de permanecer operando após curtos severos sem risco de colapso térmico.' },
            { id: 'opt_1_2', text: 'Ambos explodem imediatamente porque 35 kA é uma corrente excessiva para 250 A.', isCorrect: false, feedback: 'Incorreto. Ambos possuem Icu de 50 kA, logo nenhum dos dois explode com 35 kA.' },
            { id: 'opt_1_3', text: 'O Disjuntor B é melhor porque desarmou mais rápido do que o Disjuntor A.', isCorrect: false, feedback: 'Incorreto. Ics não é parâmetro de velocidade de disparo, mas de suportabilidade ao estresse mecânico e térmico.' },
            { id: 'opt_1_4', text: 'Nenhuma diferença, Icu e Ics são termos sinônimos inventados para marketing.', isCorrect: false, feedback: 'Incorreto. São ensaios normalizados padronizados com sequências operacionais completamente distintas.' }
          ]
        },
        {
          id: 'elec_m4_ec5_q2_seletividade_total_vs_parcial',
          type: 'multiple_choice',
          question: 'Em um estudo de coordenação de proteções elétricas prediais, qual é a definição exata de "Seletividade Total" em comparação com "Seletividade Parcial" entre dois disjuntores conectados em série (montante e jusante)?',
          scenario: 'Conceituação técnica de seletividade em sistemas de distribuição de energia elétrica.',
          norma: 'Boas Práticas de Engenharia e Padrões Industriais de Mercado',
          points: 33,
          explanation: '• Seletividade Total (Total Selectivity): para qualquer valor de sobrecorrente ou curto-circuito possível no ponto de jusante (desde uma leve sobrecarga até a máxima corrente de curto presumida I_k_máx), apenas o disjuntor a jusante desarma, mantendo o montante fechado.\n• Seletividade Parcial (Partial Selectivity): a coordenação é assegurada apenas até uma determinada corrente limite de seletividade (I_s). Caso ocorra um curto com magnitude superior a I_s, ambos os disjuntores desarmam simultaneamente, provocando blecaute no alimentador principal.',
          keyTakeaway: 'Seletividade Total: O disjuntor jusante abre sozinho em qualquer intensidade de defeito até o Ik máximo. Seletividade Parcial: Apenas até o limite Is.',
          options: [
            { id: 'opt_2_1', text: 'Seletividade Total garante que apenas o disjuntor a jusante atue para qualquer valor de corrente até o curto máximo presumido; Seletividade Parcial atua apenas até uma corrente limite Is.', isCorrect: true, feedback: 'Excelente! A seletividade total preserva 100% da continuidade de serviço nas outras áreas saudáveis da instalação.' },
            { id: 'opt_2_2', text: 'Seletividade Total desliga todos os disjuntores da fábrica e Seletividade Parcial desliga apenas um.', isCorrect: false, feedback: 'Incorreto. Desligar tudo é a antítese da seletividade.' },
            { id: 'opt_2_3', text: 'Seletividade Total aplica-se apenas a circuitos com fusíveis e Seletividade Parcial a disjuntores.', isCorrect: false, feedback: 'Incorreto. Os conceitos aplicam-se a qualquer combinação de fusíveis, disjuntores e relés.' },
            { id: 'opt_2_4', text: 'Seletividade Total depende exclusivamente da marca dos cabos elétricos utilizados.', isCorrect: false, feedback: 'Incorreto. Depende da coordenação das curvas tempo-corrente dos dispositivos de corte.' }
          ]
        },
        {
          id: 'elec_m4_ec5_q3_temporizacao_seletividade_cronometrica',
          type: 'multiple_choice',
          question: 'Em um sistema industrial com disjuntores microprocessados em cascata (Quadro Geral QGBT montante e Quadro Secundário jusante), o disjuntor jusante possui tempo máximo de interrupção de curto de t_jusante = 40 ms. Para garantir seletividade cronométrica plena entre ambos adotando uma margem de segurança de desarmes e inércia mecânica de Δt = 80 ms, qual deve ser o ajuste mínimo do retardo de curta duração (tsd) programado no disjuntor montante?',
          scenario: 'Cálculo de temporização e escalonamento cronométrico de relés eletrônicos de proteção.',
          norma: 'Boas Práticas de Engenharia e Padrões Industriais de Mercado',
          points: 34,
          explanation: 'Para assegurar seletividade cronométrica, o tempo de retardo do dispositivo a montante deve satisfazer: t_montante ≥ t_jusante + Δt_margem. Substituindo os valores do projeto: tsd_montante ≥ 40 ms + 80 ms = 120 ms. Na escala padronizada dos disparadores eletrônicos (típicos: 50 ms, 100 ms, 150 ms, 200 ms, 300 ms), o ajuste comercial imediatamente superior que satisfaz plenamente a condição é tsd = 150 ms.',
          keyTakeaway: 'tsd_montante ≥ t_jusante + Δt_margem: 40 ms + 80 ms = 120 ms; adota-se o degrau padronizado de tsd = 150 ms para garantir seletividade total sem disparos intempestivos.',
          options: [
            { id: 'opt_3_1', text: 'Ajuste de retardo tsd ≥ 120 ms (adotando o patamar padronizado de 150 ms no relé eletrônico).', isCorrect: true, feedback: 'Perfeito! 40 ms de abertura do jusante + 80 ms de margem de inércia mecânica = 120 ms mínimos, calibrado em 150 ms.' },
            { id: 'opt_3_2', text: 'Ajuste de retardo tsd = 0 ms (disparo instantâneo sem temporização).', isCorrect: false, feedback: 'Incorreto. Com 0 ms, o disjuntor montante desarmaria junto com o jusante, eliminando a seletividade.' },
            { id: 'opt_3_3', text: 'Ajuste de retardo tsd = 5000 ms (5 segundos).', isCorrect: false, feedback: 'Incorreto. 5 segundos de curto-circuito derreteriam os barramentos de cobre da subestação.' },
            { id: 'opt_3_4', text: 'Ajuste de retardo tsd = 20 ms.', isCorrect: false, feedback: 'Incorreto. 20 ms é menor do que o tempo que o próprio disjuntor jusante leva para abrir (40 ms).' }
          ]
        }
      ]
    }
  ]
};
