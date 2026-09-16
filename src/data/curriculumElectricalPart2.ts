import { AcademyModule } from '../types/academy';

export const ELECTRICAL_MODULES_PART2: AcademyModule[] = [
  // ==========================================================================
  // MÓDULO 4: ELETRÔNICA ANALÓGICA & DIGITAL E FONTES DE ALIMENTAÇÃO
  // ==========================================================================
  {
    id: 'elec_mod_4_eletronica',
    area: 'eletrotecnica',
    order: 4,
    title: 'Módulo 4: Eletrônica Analógica & Digital e Fontes de Alimentação',
    description: 'Eletrônica de potência (diodos, MOSFETs, IGBTs, SCR/Triac), lógica digital booleana e fontes chaveadas SMPS (Buck, Boost, PWM).',
    icon: 'Cpu',
    normasReferencia: ['IEC 60747', 'IEC 61204', 'IEC 60617'],
    lessons: [
      {
        id: 'elec_m4_ec1_semicondutores_potencia',
        moduleId: 'elec_mod_4_eletronica',
        moduleTitle: 'Módulo 4: Eletrônica Analógica & Digital e Fontes de Alimentação',
        order: 1,
        code: 'EC 4.1',
        title: 'Eletrônica de Potência: Diodos, MOSFETs, IGBTs e Tiristores',
        norma: 'IEC 60747 / IEC 60146',
        level: 'Intermediário',
        durationMinutes: 15,
        theory: {
          conceito: 'A eletrônica de potência realiza o controle e conversão de energia elétrica com alto rendimento através do chaveamento de semicondutores. Diodos realizam retificação não controlada; Transistores MOSFET operam com alta velocidade e baixa perda em tensões até 600V; IGBTs combinam entrada isolada por tensão (gate MOS) com condução bipolar de altíssima corrente e tensão (inversores de tração e motores); SCRs e Triacs controlam o ângulo de disparo de fase em AC.',
          formulas: [
            { label: 'Tensão Retificada Monofásica (Onda Completa)', formula: 'V_dc = (2 × V_max) / π ≈ 0,90 × V_rms', explicacao: 'V_dc ≈ 207 V para rede 230 Vrms' },
            { label: 'Tensão Retificada Trifásica (Ponte de Graetz B6)', formula: 'V_dc = (3 × √2 / π) × V_LL ≈ 1,35 × V_LL', explicacao: 'V_dc ≈ 540 V para rede 400 V inter-fases' },
            { label: 'Tensão no Barramento CC de Inversor (com filtro C)', formula: 'V_bus = √2 × V_LL ≈ 1,414 × 400 V ≈ 565 Vdc', explicacao: 'Tensão real medida nos capacitores de link CC de um VFD' }
          ],
          pontosOperacionais: [
            'O IGBT (Insulated Gate Bipolar Transistor) é o componente-chave na ponte inversora de quase todos os inversores de frequência (VFDs) e no-breaks industriais trifásicos.',
            'O gate de MOSFETs e IGBTs é extremamente sensível à eletricidade estática (ESD); toque com pulseira antiestática ou descarregue a carcaça antes de manusear placas.',
            'Teste com multímetro na escala de diodo: um diodo em bom estado conduz com queda de 0,4V a 0,7V no sentido direto (Anodo no cabo vermelho, Catodo no preto) e dá circuito aberto (OL) no sentido inverso.',
            'Tiristores (SCR) necessitam de um pulso de corrente no gatilho (Gate) e só desligam quando a corrente principal anódica cai abaixo da corrente de manutenção (holding current Ih).'
          ],
          fieldCase: {
            localizacao: 'Boane, Província de Maputo',
            cenario: 'Máquina de solda inversora industrial trifásica de 400A que parou repentinamente de gerar arco elétrico com led de alarme "OC" (Over Current) aceso.',
            diagnostico: 'Com o circuito desenergizado e capacitores descarregados com resistor de 1 kΩ 10W, o teste em escala de diodo entre Coletor e Emissor dos módulos IGBT revelou leitura de 0,00 V (curto-circuito pleno) em dois IGBTs do braço superior da ponte H, causado por pico de sobretensão da rede sem SPD.',
            solucaoNormativa: 'Substituição do par de módulos IGBT acoplados com pasta térmica de alta condutividade e aperto calibrado com chave dinamométrica a 3,5 Nm, além de substituição dos diodos zener de proteção de gate e instalação de varistores na entrada.'
          },
          funcionamento: 'O chaveamento em alta frequência (de 2 kHz a 20 kHz) permite modular a largura de pulso (PWM), sintetizando uma onda senoidal de frequência e tensão variáveis para acionar motores elétricos com velocidade controlada.',
          aplicacaoMocambique: 'A instabilidade de tensão e picos inductivos provocados por geradores a diesel em Moçambique são a causa mais comum de queima de módulos IGBT em oficinas e indústrias que operam fora da rede principal.',
          exemploPratico: 'Num inversor trifásico de 400V, a medição do barramento CC com multímetro DC deve apontar aproximadamente 560V a 570V. Se apresentar menos de 450V sob carga, há falha em diodos da ponte retificadora ou capacitor eletrolítico de filtragem esgotado.',
          calculationSnippet: 'V_bus = 1,414 × 400V ≈ 565 Vdc | IGBT = Alta potência e chaveamento PWM'
        },
        quiz: {
          question: 'Em um inversor de frequência trifásico conectado à rede da EDM de 400V 50Hz, qual é o valor esperado da tensão contínua (DC) medida no barramento de capacitores (Link CC) quando em operação normal em vazio?',
          options: [
            { id: 'A', text: 'Aproximadamente 230 Vdc.', isCorrect: false, feedback: '230 Vdc é a tensão de fase alternada eficaz (RMS), não o barramento trifásico retificado.' },
            { id: 'B', text: 'Aproximadamente 565 Vdc (√2 × 400 V).', isCorrect: true, feedback: 'Correto! A ponte retificadora trifásica carrega os capacitores de filtragem até o valor de pico da tensão de linha: 400 V × 1,4142 ≈ 565 Vdc.' },
            { id: 'C', text: '1000 Vdc.', isCorrect: false, feedback: '1000 Vdc superaria a isolação dos capacitores, causando explosão.' },
            { id: 'D', text: '0 Vdc, pois a tensão é alternada pura.', isCorrect: false, feedback: 'O barramento CC (Link DC) converte AC para contínua para alimentar a ponte inversora.' }
          ],
          explanation: 'A retificação trifásica de onda completa de uma rede de 400 Vrms com capacitores de filtragem eleva a tensão contínua no barramento (DC Bus) até o valor de pico inter-fases: V_bus = √2 × V_LL = 1,4142 × 400 V ≈ 565 Vdc. Esse valor serve de diagnóstico fundamental para testar a ponte retificadora e o banco de capacitores.',
          keyTakeaway: 'Barramento CC trifásico 400V = aprox. 565 Vdc (tensão de pico da rede retificada).',
          xpReward: 50
        }
      },
      {
        id: 'elec_m4_ec2_logica_digital_booleana',
        moduleId: 'elec_mod_4_eletronica',
        moduleTitle: 'Módulo 4: Eletrônica Analógica & Digital e Fontes de Alimentação',
        order: 2,
        code: 'EC 4.2',
        title: 'Lógica Digital, Portas Lógicas e Álgebra Booleana Aplicada',
        norma: 'IEC 60617-12 / IEC 61131-3',
        level: 'Intermediário',
        durationMinutes: 14,
        theory: {
          conceito: 'A eletrônica digital processa sinais discretos representados por níveis lógicos binários (0 e 1, ou Falso e Verdadeiro). Na indústria, a lógica digital governa os circuitos de intertravamento de segurança, relés programáveis e controladores lógicos (PLCs). As portas lógicas elementares são AND (E), OR (OU), NOT (NÃO/Inversor), NAND, NOR e XOR (OU-Exclusivo).',
          formulas: [
            { label: 'Porta AND (E)', formula: 'Y = A · B', explicacao: 'Saída 1 se, e somente se, todas as entradas forem 1' },
            { label: 'Porta OR (OU)', formula: 'Y = A + B', explicacao: 'Saída 1 se qualquer uma das entradas for 1' },
            { label: 'Porta NAND (Universal)', formula: 'Y = NOT (A · B)', explicacao: 'Qualquer circuito booleano pode ser construído exclusivamente com portas NAND' },
            { label: 'Teorema de De Morgan', formula: 'NOT (A · B) = NOT A + NOT B', explicacao: 'A negação de uma conjunção é a disjunção das negações' }
          ],
          pontosOperacionais: [
            'Em automação industrial, os níveis de tensão lógicos são tipicamente 0Vcc (Nível Baixo / Lógico 0) e +24Vcc (Nível Alto / Lógico 1), diferindo do padrão TTL de laboratório (0-5V).',
            'Sistemas de parada de emergência e intertravamento crítico são projetados em Lógica Negativa Fail-Safe (Normalmente Fechado - NF): o botão conduz 24V em repouso. Se o fio romper, a tensão cai para 0V e a máquina desliga automaticamente.',
            'Optoacopladores fornecem isolação galvânica completa (até 2500V ou mais) entre a lógica de controle digital e os ruídos eletromagnéticos de motores e contatores de campo.',
            'Portas XOR (OU-Exclusivo) produzem saída 1 apenas quando as entradas são diferentes entre si, sendo fundamentais em circuitos comparadores de fase e geradores de paridade.'
          ],
          fieldCase: {
            localizacao: 'Moatize, Província de Tete',
            cenario: 'Esteira transportadora de minério que não ligava após intervenção de manutenção. O operador apertava o botão de marcha verde no painel mas o contator não acionava.',
            diagnostico: 'A lógica de liberação no PLC dependia de: [Botão Marcha = 1] AND [Grade de Proteção Fechada = 1] AND [Sensor de Alinhamento de Fita = 1] AND [Chave de Emergência por Cabo Puxado = 1]. A medição com voltímetro nas entradas digitais de 24V revelou 0V no sensor de emergência por cabo, que estava desarmado mecanicamente por poeira acumulada.',
            solucaoNormativa: 'Limpeza e rearmamento mecânico do cabo de tração de emergência. A entrada 24V normalizou (Lógico 1) e a porta lógica AND interna do CLP liberou o comando de acionamento do motor da esteira.'
          },
          funcionamento: 'A álgebra booleana permite simplificar funções lógicas complexas, reduzindo o número de relés físicos e o tempo de ciclo de processamento do programa.',
          aplicacaoMocambique: 'Em ambientes industriais pesados com poeira condutiva e umidade (cimento, mineração, portos), sensores digitais conectados a entradas de CLPs exigem cabos blindados e aterramento da malha para evitar pulsos falsos de nível lógico.',
          exemploPratico: 'Intertravamento de segurança de prensa: a prensa só desce se [Botão Esquerdo acionado] AND [Botão Direito acionado simultaneamente] AND [Cortina Óptica desobstruída]. Se o operador soltar qualquer mão, a lógica AND vai para 0 e a prensa freia instantaneamente.',
          calculationSnippet: 'AND: Y = A · B | Fail-Safe: 24V contínuo com botão NF (corte = parada segura)'
        },
        quiz: {
          question: 'Em um circuito digital de segurança industrial que comanda a partida de um moinho, a liberação de funcionamento Y ocorre apenas se a proteção de grade (A) estiver fechada (A=1) E a lubrificação forçada (B) estiver com pressão normal (B=1). Se qualquer uma dessas duas condições falhar, a saída Y deve ir imediatamente para 0 (bloqueio). Qual função lógica expressa essa operação?',
          options: [
            { id: 'A', text: 'Função OR (Y = A + B).', isCorrect: false, feedback: 'A função OR ligaria o moinho mesmo sem lubrificação se apenas a grade estivesse fechada, fundindo os mancais!' },
            { id: 'B', text: 'Função AND (Y = A · B).', isCorrect: true, feedback: 'Correto! A operação lógica AND exige simultaneamente todas as condições verdadeiras (1) para produzir saída 1.' },
            { id: 'C', text: 'Função NOT (Y = NOT A).', isCorrect: false, feedback: 'Inverte apenas uma entrada sem avaliar a lubrificação.' },
            { id: 'D', text: 'Função XOR (Y = A ⊕ B).', isCorrect: false, feedback: 'XOR desarmaria se ambas estivessem normais (1 e 1 = 0).' }
          ],
          explanation: 'A operação de intertravamento em série é a definição direta da porta lógica AND (E): a saída Y será nível alto (1) se, e somente se, todas as condições de segurança associadas às entradas forem verdadeiras (A=1 e B=1). Matematicamente: Y = A · B.',
          keyTakeaway: 'Intertravamento de segurança simultâneo = Lógica AND (Y = A · B).',
          xpReward: 50
        }
      },
      {
        id: 'elec_m4_ec3_fontes_chaveadas_smps',
        moduleId: 'elec_mod_4_eletronica',
        moduleTitle: 'Módulo 4: Eletrônica Analógica & Digital e Fontes de Alimentação',
        order: 3,
        code: 'EC 4.3',
        title: 'Fontes de Alimentação Chaveadas (SMPS): Topologias Buck, Boost e PWM',
        norma: 'IEC 61204 / IEC 60950 / IEC 62368-1',
        level: 'Avançado',
        durationMinutes: 16,
        theory: {
          conceito: 'Fontes Chaveadas (Switched-Mode Power Supplies - SMPS) substituíram as fontes lineares pesadas e ineficientes por operarem com modulação por largura de pulso (PWM) em altas frequências (50 kHz a 500 kHz). Com rendimento tipicamente superior a 85-92%, utilizam componentes reativos de armazenamento (indutores e capacitores) e semicondutores operando exclusivamente como chaves abertas ou fechadas.',
          formulas: [
            { label: 'Razão Cíclica (Duty Cycle)', formula: 'D = T_on / T', explicacao: 'Fração do período total em que a chave semicondutora permanece ligada' },
            { label: 'Topologia Buck (Step-Down / Redutora)', formula: 'V_out = D × V_in', explicacao: 'Tensão de saída sempre menor que a tensão de entrada' },
            { label: 'Topologia Boost (Step-Up / Elevadora)', formula: 'V_out = V_in / (1 - D)', explicacao: 'Tensão de saída sempre maior que a de entrada (ex: circuitos PFC)' },
            { label: 'Topologia Flyback Isolada', formula: 'V_out = V_in × (N_sec / N_pri) × [D / (1 - D)]', explicacao: 'Padrão em fontes de 24Vcc industriais e carregadores com isolamento galvânico' }
          ],
          pontosOperacionais: [
            'A malha de realimentação óptica: um CI de referência de precisão (como TL431) acoplado a um optoacoplador (PC817) ajusta a largura de pulso do CI oscilador PWM primário para manter a tensão de 24V estável mesmo com oscilações bruscas na entrada de 230V.',
            'Causa de falha mais comum em fontes chaveadas: capacitores eletrolíticos de filtragem do secundário estufados ou secos devido ao calor contínuo, elevando a Resistência Série Equivalente (ESR) e gerando ripple excessivo que desliga a fonte.',
            'Resistor de partida (Start-up Resistor): resistor de alto valor (ex: 100kΩ a 470kΩ) no lado primário que fornece corrente inicial para o CI PWM carregar seu capacitor de Vcc. Se abrir, a fonte fica totalmente inoperante ("morta").',
            'Nunca testar uma fonte chaveada sem carga mínima se a topologia não possuir pré-carga interna; algumas fontes antigas disparam a tensão para valores perigosos em vazio.'
          ],
          fieldCase: {
            localizacao: 'Dondo, Província de Sofala',
            cenario: 'Fonte chaveada de trilho DIN 230Vac para 24Vcc 10A que alimenta o CLP e os módulos de sensores de uma fábrica de cimento parou de fornecer tensão. O fusível de entrada de vidro de 3,15A estava intacto.',
            diagnostico: 'Com osciloscópio e multímetro: o retificador e o capacitor principal de 400V tinham 320Vdc perfeitos. No entanto, no pino Vcc do CI PWM (UC3842) a tensão media apenas 4,2V pulsantes, abaixo do limiar de partida (UVLO de 16V). O resistor de partida primário de 220 kΩ estava completamente aberto (resistência infinita).',
            solucaoNormativa: 'Substituição do resistor SMD de partida de 220 kΩ e troca preventiva do capacitor eletrolítico de 47 μF 50V da alimentação auxiliar do CI. A fonte restabeleceu instantaneamente os 24,05 Vcc estáveis sob carga nominal de 8A.'
          },
          funcionamento: 'Ao operar em dezenas de quilohertz, o transformador de núcleo de ferrite pode ser dezenas de vezes menor e mais leve do que um transformador laminado de 50 Hz com a mesma potência.',
          aplicacaoMocambique: 'A rede elétrica de baixa tensão no interior de Moçambique sofre variações frequentes de 160V a 260V. Fontes industriais com faixa de entrada universal "Full-Range" (85V a 264Vac com PFC ativo) são indispensáveis para garantir que painéis de automação não reiniciem sozinhos.',
          exemploPratico: 'Num circuito Buck alimentado por 24Vcc onde a carga exige 12Vcc estáveis: ajusta-se a modulação PWM para razão cíclica D = 0,50 (50%). V_out = 0,50 × 24V = 12V.',
          calculationSnippet: 'Buck: V_out = D × V_in | Boost: V_out = V_in / (1-D) | Falha típica: ESR alto em capacitores'
        },
        quiz: {
          question: 'Em uma fonte de alimentação industrial chaveada do tipo Buck (redutora sem isolamento galvânico), a tensão contínua de entrada é Vin = 48 Vcc. Se o modulador PWM estiver operando com uma razão cíclica (Duty Cycle) D = 0,25 (25%), qual será a tensão teórica de saída Vout nos bornes da carga?',
          options: [
            { id: 'A', text: '192 Vcc.', isCorrect: false, feedback: '192 Vcc seria o resultado de um circuito Boost (elevador), não Buck.' },
            { id: 'B', text: '12 Vcc.', isCorrect: true, feedback: 'Exato! Pela fórmula da topologia Buck: V_out = D × V_in = 0,25 × 48 V = 12 Vcc.' },
            { id: 'C', text: '24 Vcc.', isCorrect: false, feedback: '24 Vcc exigiria D = 0,50 (50%).' },
            { id: 'D', text: '48 Vcc.', isCorrect: false, feedback: '48 Vcc ocorreria apenas com a chave permanentemente ligada (D = 1,0).' }
          ],
          explanation: 'A topologia chaveada Buck é um conversor step-down cuja relação de transferência de tensão é linearmente proporcional à razão cíclica de condução da chave: V_out = D × V_in. Portanto: V_out = 0,25 × 48 V = 12 Vcc.',
          keyTakeaway: 'Topologia Buck: V_out = D × V_in. Com D = 25% e Vin = 48V, a saída é 12V.',
          xpReward: 50
        }
      }
    ]
  },

  // ==========================================================================
  // MÓDULO 5: MOTORES ELÉTRICOS, AUTOMAÇÃO & PLCS (IEC 61131-3)
  // ==========================================================================
  {
    id: 'elec_mod_5_motores_automacao',
    area: 'eletrotecnica',
    order: 5,
    title: 'Módulo 5: Motores Elétricos, Automação & Controladores Lógicos (PLCs)',
    description: 'Motores de indução trifásicos, partidas (Direta, Estrela-Triângulo), inversores de frequência (VFDs), soft-starters e programação de PLCs (IEC 61131-3).',
    icon: 'Cpu',
    normasReferencia: ['IEC 60034-1', 'IEC 60947-4-1', 'IEC 61131-3', 'IEC 61800-3'],
    lessons: [
      {
        id: 'elec_m5_ec1_motores_partidas',
        moduleId: 'elec_mod_5_motores_automacao',
        moduleTitle: 'Módulo 5: Motores Elétricos, Automação & Controladores Lógicos (PLCs)',
        order: 1,
        code: 'EC 5.1',
        title: 'Motores Trifásicos de Indução e Partidas: Direta e Estrela-Triângulo',
        norma: 'IEC 60034-1 / IEC 60947-4-1',
        level: 'Intermediário',
        durationMinutes: 16,
        theory: {
          conceito: 'O motor assíncrono trifásico com rotor em gaiola de esquilo é o motor mais utilizado na indústria mundial devido à robustez mecânica. A velocidade síncrona do campo magnético girante depende da frequência da rede (50 Hz em Moçambique) e do número de pares de polos. A partida direta exige correntes de pico de 6 a 8 vezes a corrente nominal (Ip/In), exigindo métodos de alívio como a partida Estrela-Triângulo em motores de média potência.',
          formulas: [
            { label: 'Velocidade Síncrona do Campo', formula: 'n_s = (120 × f) / p', explicacao: 'f = 50 Hz. Para motor de 4 polos (2 pares): ns = (120 × 50) / 4 = 1500 rpm' },
            { label: 'Escorregamento Relativo', formula: 's = (n_s - n) / n_s', explicacao: 'Diferença entre o campo e o rotor sob carga (típico 2% a 5%)' },
            { label: 'Relação Estrela-Triângulo (Tensão)', formula: 'V_fase_Y = V_linha / √3', explicacao: 'Cada bobina recebe apenas 230V na rede 400V durante a partida em Estrela' },
            { label: 'Redução de Corrente e Torque em Estrela', formula: 'I_partida_Y = (1/3) × I_partida_Δ | T_partida_Y = (1/3) × T_partida_Δ', explicacao: 'Tanto a corrente de partida quanto o torque mecânico caem para exatamente 33% (1/3)' }
          ],
          pontosOperacionais: [
            'Condição OBRIGATÓRIA para partida Estrela-Triângulo em rede EDM 400V: a placa do motor DEVE especificar 400V em Triângulo (Δ) e 690V em Estrela (Y) com 6 bornes de ligação acessíveis (U1-V1-W1 / U2-V2-W2). Se a placa indicar 230V/400V, o motor QUEIMA se for ligado em triângulo a 400V!',
            'A partida Estrela-Triângulo só pode ser aplicada a cargas que partem em vazio ou com baixo torque resistente (bombas centrífugas, ventiladores com damper fechado), pois o torque mecânico é reduzido a 1/3 do nominal.',
            'O tempo de transição do relé temporizador de Estrela para Triângulo deve ser calibrado com precisão (geralmente entre 5s e 10s) quando o motor atinge aprox. 80-85% da rotação nominal.',
            'Intertravamento elétrico por contato auxiliar NF nos contatores K2 (Triângulo) e K3 (Estrela) é mandatório para evitar curto-circuito bifásico mortal no fechamento simultâneo.'
          ],
          fieldCase: {
            localizacao: 'Nampula, Província de Nampula',
            cenario: 'Moageira com motor trifásico novo de 30 kW (In = 58 A) que desarmava os fusíveis aéreos do transformador da EDM a cada tentativa de partida direta com carga.',
            diagnostico: 'A corrente de partida direta atingia Ip = 7,2 × 58 A = 417 Amperes por fase durante 4 segundos, causando queda de tensão de 18% no ramal e queima de fusíveis HH da cabine da EDM.',
            solucaoNormativa: 'Montagem de painel de partida Estrela-Triângulo automatizado com três contatores tripolares, relé térmico ajustado em 0,58 × In (na linha de fase interna do triângulo) e temporizador eletrônico regulado para 7 segundos. A corrente de partida foi reduzida para 139 A (redução para 1/3), permitindo a partida suave sem oscilações na rede da EDM.'
          },
          funcionamento: 'Na ligação Estrela, os três enrolamentos são ligados a um ponto comum neutro artificial, recebendo 58% da tensão de linha (230V). Após a aceleração, o contator de estrela abre e o de triângulo fecha, aplicando os 400V plenos nas bobinas.',
          aplicacaoMocambique: 'A EDM impõe limites rigorosos para partida direta de motores trifásicos em áreas urbanas (geralmente permitido apenas até 5,5 kW / 7,5 CV). Motores acima desse porte exigem partidas com alívio de corrente.',
          exemploPratico: 'Motor de 4 polos em rede 50Hz: ns = 1500 rpm. Na placa indica 1440 rpm com carga plena. Escorregamento: s = (1500 - 1440) / 1500 = 60 / 1500 = 0,04 (4%).',
          calculationSnippet: 'ns = 120 × f / p | I_Y = (1/3) × I_Δ | Motor 400V/690V obrigatório para rede 400V'
        },
        quiz: {
          question: 'Em uma rede elétrica trifásica de 400 V 50 Hz da EDM, um eletrotécnico precisa instalar um motor elétrico com sistema de partida Estrela-Triângulo convencional. Quais especificações de tensão de placa o motor DEVE apresentar obrigatoriamente para não queimar quando comutar para Triângulo?',
          options: [
            { id: 'A', text: 'Tensão de placa 230 V (Triângulo) / 400 V (Estrela).', isCorrect: false, feedback: 'Erro fatal! Em triângulo a 400V, as bobinas de 230V receberiam sobretensão de 73% e queimariam em segundos.' },
            { id: 'B', text: 'Tensão de placa 400 V (Triângulo) / 690 V (Estrela).', isCorrect: true, feedback: 'Correto! Em rede de 400V, cada enrolamento suporta 400V contínuos (tensão nominal em Triângulo) e parte em Estrela com 230V seguros.' },
            { id: 'C', text: 'Tensão de placa 110 V / 220 V.', isCorrect: false, feedback: 'Totalmente incompatível com redes europeias/moçambicanas de 400V.' },
            { id: 'D', text: 'Qualquer tensão de motor monofásico.', isCorrect: false, feedback: 'Partida estrela-triângulo só existe em motores trifásicos.' }
          ],
          explanation: 'Na rede de 400 V, ao comutar para Triângulo (Δ), a tensão de linha (400 V) é aplicada diretamente sobre cada um dos enrolamentos do motor. Portanto, a menor tensão indicada na placa do motor (correspondente à ligação em Triângulo) deve ser de 400 V (ou seja, motor 400 V Δ / 690 V Y). Se fosse utilizado um motor de 230 V Δ / 400 V Y, a comutação para Triângulo aplicaria 400 V em bobinas feitas para 230 V, destruindo o isolamento.',
          keyTakeaway: 'Rede 400V: Partida Estrela-Triângulo exige motor 400V Δ / 690V Y com 6 bornes.',
          xpReward: 50
        }
      },
      {
        id: 'elec_m5_ec2_vfd_softstarter',
        moduleId: 'elec_mod_5_motores_automacao',
        moduleTitle: 'Módulo 5: Motores Elétricos, Automação & Controladores Lógicos (PLCs)',
        order: 2,
        code: 'EC 5.2',
        title: 'Inversores de Frequência (VFD) e Soft-Starters: Parametrização e EMC',
        norma: 'IEC 61800-3 / IEC 61800-5-1',
        level: 'Avançado',
        durationMinutes: 16,
        theory: {
          conceito: 'A eletrônica moderna oferece duas tecnologias principais para acionamento de motores:\n1. Soft-Starter: Controla a tensão RMS aplicada ao motor variando o ângulo de disparo de tiristores anti-paralelos durante a aceleração e desaceleração (a frequência permanece fixa em 50 Hz). Não varia a velocidade em regime contínuo.\n2. Inversor de Frequência (VFD): Converte AC em DC e depois sintetiza uma nova onda AC com frequência (0 a 400 Hz) e tensão simultaneamente variáveis (controle V/f escalar ou vetorial orientado a campo). Permite controle contínuo de velocidade, torque máximo na partida com corrente igual à nominal (Ip ≈ In) e frenagem regenerativa.',
          formulas: [
            { label: 'Rotação Variável por Inversor', formula: 'n = [120 × f × (1 - s)] / p', explicacao: 'A velocidade mecânica varia em proporção direta com a frequência sintetizada f' },
            { label: 'Controle Escalar V/f Constante', formula: 'V / f = Constante', explicacao: 'Mantém o fluxo magnético constante no entreferro até a frequência base (50 Hz)' },
            { label: 'Corrente de Partida em VFD', formula: 'I_partida ≤ 1,1 × I_nominal', explicacao: 'O VFD elimina completamente o pico de partida, partindo com torque pleno e corrente nominal' }
          ],
          pontosOperacionais: [
            'Diferença de aplicação: se o processo exige apenas evitar pancada na partida/parada mecânica (ex: bomba de água para evitar golpe de aríete), usa-se Soft-Starter (mais econômica). Se exige regular vazão contínua ou velocidade de processo (ex: exaustor variável, guindaste), usa-se VFD.',
            'Compatibilidade Eletromagnética (EMC - IEC 61800-3): A saída PWM do inversor emite ruídos de alta frequência. É obrigatório utilizar cabos de potência blindados e simétricos com prensas-cabos metálicas que garantam contato 360° com a carcaça aterrada.',
            'Filtro dV/dt ou reator de carga: cabos longos entre o VFD e o motor (> 30 a 50 metros) criam ondas refletidas que dobram a tensão nos terminais do motor (até 1200V de pico), perfurando o esmalte isolante dos enrolamentos.',
            'Parâmetros essenciais de configuração inicial de um inversor: Corrente Nominal de Placa (A), Tensão (V), Frequência Base (50 Hz), Rotação (RPM), Rampa de Aceleração (s) e Rampa de Desaceleração (s).'
          ],
          fieldCase: {
            localizacao: 'Rio Umbeluzi, Província de Maputo',
            cenario: 'Estação de bombagem de água potável onde a tubulação de PVC de grande porte sofria rupturas constantes (golpe de aríete) a cada parada da motobomba de 45 kW.',
            diagnostico: 'O motor era acionado por partida direta. Ao desligar, a coluna d\'água retornava bruscamente contra a válvula de retenção, provocando um pico de sobrepressão de 14 bar na linha que rebentava flanges e tubos.',
            solucaoNormativa: 'Instalação de Soft-Starter com função integrada de "Pump Control" (rampa suave de desaceleração hidráulica de 15 segundos). A redução controlada da pressão na parada eliminou totalmente o golpe de aríete e as rupturas de canalização.'
          },
          funcionamento: 'O inversor retifica a rede AC em uma ponte de diodos, filtra em capacitores de barramento DC e recria as três fases através de 6 chaves IGBT acionadas por algoritmos PWM de alta precisão.',
          aplicacaoMocambique: 'Em sistemas de irrigação no Vale do Limpopo e bombas de água solares, o uso de inversores com controle vetorial permite acionar motobombas com energia gerada por painéis solares variando a vazão conforme a insolação diária.',
          exemploPratico: 'Bomba operando a 35 Hz através de VFD: rotação cai para 70% da nominal. Pelas leis de afinidade das bombas centrífugas, o consumo elétrico cai para o cubo da velocidade: P = (0,70)³ ≈ 34,3% da potência nominal, economizando mais de 65% de energia.',
          calculationSnippet: 'Soft-Starter: alívio de partida (50Hz fixo) | VFD: variação contínua de velocidade (f variável)'
        },
        quiz: {
          question: 'Qual é a principal diferença funcional entre uma Soft-Starter e um Inversor de Frequência (VFD) no controle de um motor elétrico de indução trifásico?',
          options: [
            { id: 'A', text: 'A Soft-Starter altera a frequência da rede para acelerar o motor, enquanto o VFD apenas reduz a tensão.', isCorrect: false, feedback: 'Totalmente invertido! O VFD varia a frequência e a tensão; a Soft-Starter altera apenas a tensão com frequência fixa.' },
            { id: 'B', text: 'A Soft-Starter controla a tensão RMS na partida e parada mantendo os 50 Hz fixos (sem variar velocidade em regime permanente); o VFD varia a frequência e a tensão, permitindo controle de velocidade contínuo em qualquer ponto de trabalho.', isCorrect: true, feedback: 'Correto! A Soft-Starter atua apenas nas rampas de partida/parada. O VFD altera a frequência gerada (Hz), controlando a rotação de forma contínua e precisa.' },
            { id: 'C', text: 'A Soft-Starter só funciona em corrente contínua e o VFD só funciona em corrente alternada.', isCorrect: false, feedback: 'Ambos são equipamentos projetados para motores trifásicos de corrente alternada.' },
            { id: 'D', text: 'O VFD não permite controlar o torque do motor na partida.', isCorrect: false, feedback: 'Inversores com controle vetorial entregam torque máximo pleno (até 200%) em velocidade zero.' }
          ],
          explanation: 'Uma Soft-Starter utiliza pares de tiristores em anti-paralelo para modular o ângulo de condução de fase, reduzindo a tensão eficaz durante a partida e a parada com frequência de 50 Hz fixa. Após a partida, ela fecha um contator de bypass. Já o Inversor de Frequência (VFD) retifica e sintetiza uma nova onda senoidal com frequência (Hz) e tensão (V) totalmente variáveis, viabilizando o controle permanente da velocidade e do processo produtivo.',
          keyTakeaway: 'Soft-Starter: rampa de tensão na partida (50Hz fixo) | VFD: variação de frequência e rotação contínua.',
          xpReward: 50
        }
      },
      {
        id: 'elec_m5_ec3_plc_ladder_sensores',
        moduleId: 'elec_mod_5_motores_automacao',
        moduleTitle: 'Módulo 5: Motores Elétricos, Automação & Controladores Lógicos (PLCs)',
        order: 3,
        code: 'EC 5.3',
        title: 'PLCs (IEC 61131-3), Linguagem Ladder, Sinais 4-20mA e Sensores',
        norma: 'IEC 61131-3 / IEC 60947-5-2',
        level: 'Avançado',
        durationMinutes: 18,
        theory: {
          conceito: 'Controladores Lógicos Programáveis (PLCs / CLPs) são computadores industriais robustos dedicados a controlar processos em tempo real através de um ciclo contínuo de varredura (Scan Cycle: 1. Leitura das Entradas -> 2. Execução do Programa -> 3. Atualização das Saídas -> 4. Autodiagnóstico). A norma IEC 61131-3 padroniza 5 linguagens de programação: Ladder (LD), Diagrama de Blocos de Função (FBD), Texto Estruturado (ST), Lista de Instruções (IL) e Grafo Sequencial de Funções (SFC).',
          formulas: [
            { label: 'Conversão Analógica 4-20 mA (Linear)', formula: 'Valor_Fisico = Min + [(Sinal_mA - 4) / 16] × (Max - Min)', explicacao: '4 mA corresponde ao zero da escala física e 20 mA ao valor máximo' },
            { label: 'Resolução Digital A/D (12 bits)', formula: 'N_niveis = 2¹² = 4096 divisões (0 a 4095)', explicacao: 'Precisão digital da conversão de uma entrada analógica' },
            { label: 'Zero Vivo (Live Zero)', formula: 'Sinal < 3,6 mA = Falha / Cabo Partido', explicacao: 'O laço 4-20mA identifica rompimento de fiação se a corrente cair a zero' }
          ],
          pontosOperacionais: [
            'Vantagem decisiva do sinal 4-20 mA em relação a 0-10 V: a corrente é imune à resistência de cabos longos (a tensão se ajusta no transmissor) e permite a detecção imediata de fio rompido ("Zero Vivo": se I = 0 mA, o fio foi cortado).',
            'Sensores Industriais de Proximidade (IEC 60947-5-2): Indutivo (detecta apenas metais ferrosos e não ferrosos), Capacitivo (detecta plásticos, líquidos e grãos), Óptico/Fotoelétrico (reflexão difusa, barreira ou retroreflexivo).',
            'Configuração de saída de sensores transistorizados: PNP (chaves ligadas ao +24V, comum na Europa/IEC) vs NPN (chaves ligadas ao 0V GND, comum na Ásia/Japão). Não misturar sem cartão de entrada compatível!',
            'Estrutura clássica em Ladder: Linhas horizontais (Rungs) lidas da esquerda para a direita e de cima para baixo. Contatos NA (--| |--), contatos NF (--|/|--) e Bobinas de Saída (--( )--).'
          ],
          fieldCase: {
            localizacao: 'Matola, Parque Industrial',
            cenario: 'Linha automatizada de envase de cerveja onde o tanque principal transbordava esporadicamente sem acusar alarme no painel supervisório SCADA.',
            diagnostico: 'O sensor de nível hidrostático transmitia sinal analógico de 0 a 10 V através de cabo paralelo de 80 metros sem blindagem, passando pelo mesmo leito de cabos de força dos inversores de frequência. A indução eletromagnética de alta frequência distorcia o sinal de tensão em até 2,5 V, fazendo o PLC ler nível baixo quando o tanque estava cheio.',
            solucaoNormativa: 'Substituição do transmissor por modelo com saída 4-20 mA alimentado em laço a 24 Vcc com cabo de par trançado e malha blindada aterrada em apenas um ponto no painel. O erro de leitura caiu para menos de 0,1%, cessando os transbordamentos.'
          },
          funcionamento: 'O ciclo de scan do PLC executa centenas de vezes por segundo (tempo de ciclo de 1 a 10 ms), assegurando respostas instantâneas a emergências e sincronismo de esteiras.',
          aplicacaoMocambique: 'Fábricas de cimento, açúcar e engarrafadoras em Moçambique utilizam massivamente CLPs Siemens (S7-1200/1500), Schneider (Modicon) e Allen-Bradley. Dominar o padrão IEC 61131-3 e o laço 4-20 mA é o maior diferencial de empregabilidade para técnicos.',
          exemploPratico: 'Lógica de Selo em Ladder: um botão de pulso verde NA (Start) fecha a bobina de saída K1. Um contato auxiliar NA de K1 em paralelo com o botão Start mantém a bobina alimentada mesmo após o operador soltar o dedo, até que o botão vermelho NF (Stop) abra o circuito.',
          calculationSnippet: 'IEC 61131-3: Ladder, FBD, ST | 4-20mA: Zero Vivo detecta cabo partido se I < 3,6mA'
        },
        quiz: {
          question: 'Em automação industrial segundo a norma IEC 61131, por que o laço de corrente analógico de 4 a 20 mA é mundialmente preferido em relação ao sinal de tensão de 0 a 10 V para transmissores de campo distantes?',
          options: [
            { id: 'A', text: 'Porque o sinal de 4-20 mA não sofre atenuação pela resistência ôhmica de cabos longos e o "Zero Vivo" (4 mA) permite ao CLP detectar instantaneamente se o condutor foi rompido (se I = 0 mA).', isCorrect: true, feedback: 'Perfeito! A corrente é constante em todo o laço elétrico independente da distância do fio, e a corrente mínima de 4 mA diferencia com precisão o valor zero real de um cabo quebrado ou desconectado.' },
            { id: 'B', text: 'Porque 4-20 mA consome mais de 1000 W de potência tornando o circuito imune ao frio.', isCorrect: false, feedback: 'O consumo de potência de um laço de 24V a 20mA é de apenas 0,48 W.' },
            { id: 'C', text: 'Porque o padrão de 0-10 V só funciona em computadores domésticos.', isCorrect: false, feedback: '0-10V é padrão industrial analógico, porém suscetível à queda de tensão em fiações compridas.' },
            { id: 'D', text: 'Porque a IEC proíbe o uso de sinais de tensão em qualquer painel elétrico.', isCorrect: false, feedback: 'Sinais 0-10V são permitidos para distâncias curtas dentro do mesmo painel.' }
          ],
          explanation: 'O padrão analógico de 4 a 20 mA oferece duas vantagens técnicas fundamentais: 1) Como a variável é transmitida em corrente, a resistência ôhmica do cabo não gera erro de medida (ao contrário de sinais em tensão 0-10V que sofrem queda de tensão IR ao longo do percurso); 2) O conceito de "Zero Vivo" (onde 4 mA representa 0% da variável física) permite ao CLP diagnosticar com total clareza falhas de fiação: se a corrente medida for 0 mA (< 3,6 mA), o controlador sabe com certeza matemática que o condutor foi partido ou desconectado.',
          keyTakeaway: '4-20 mA: Imune à queda de tensão em cabos longos e detecta fio quebrado via Zero Vivo (I < 3,6 mA).',
          xpReward: 50
        }
      }
    ]
  },

  // ==========================================================================
  // MÓDULO 6: INSTALAÇÕES INDUSTRIAIS & REDES DE POTÊNCIA
  // ==========================================================================
  {
    id: 'elec_mod_6_industriais',
    area: 'eletrotecnica',
    order: 6,
    title: 'Módulo 6: Instalações Elétricas Industriais & Redes de Potência',
    description: 'Barramentos blindados (Busways), dimensionamento de eletrocalhas e leitos, e compensação de reativos com Bancos de Capacitores Automáticos.',
    icon: 'Layers',
    normasReferencia: ['IEC 60364-5-52', 'IEC 61439-6', 'IEC 60831-1'],
    lessons: [
      {
        id: 'elec_m6_ec1_busways_leitos',
        moduleId: 'elec_mod_6_industriais',
        moduleTitle: 'Módulo 6: Instalações Elétricas Industriais & Redes de Potência',
        order: 1,
        code: 'EC 6.1',
        title: 'Barramentos Blindados (Busways), Eletrocalhas e Fator de Agrupamento',
        norma: 'IEC 61439-6 / IEC 60364-5-52',
        level: 'Avançado',
        durationMinutes: 15,
        theory: {
          conceito: 'A distribuição de energia em grandes galpões industriais é realizada por Barramentos Blindados (Busways / Blindobarramentos) ou por condutores multipolares dispostos em Leitos e Eletrocalhas perfuradas. O calor gerado por cabos empilhados sem espaçamento mútuo degrada drasticamente a capacidade de condução de corrente, exigindo a aplicação mandatória do Fator de Agrupamento (kg) e do Fator de Temperatura (kt).',
          formulas: [
            { label: 'Capacidade de Corrente Corrigida', formula: 'I_z = I_z_tabela × k_temp × k_agrup', explicacao: 'Capacidade real de condução do condutor sob as condições reais de instalação' },
            { label: 'Fator de Agrupamento (IEC 60364-5-52 Tabela B.52.17)', formula: 'k_agrup < 1,0', explicacao: 'Ex: 6 circuitos trifásicos agrupados em eletrocalha -> kg ≈ 0,55 (perda de 45% da capacidade!)' },
            { label: 'Taxa Máxima de Ocupação de Eletrocalha', formula: 'Ocupação ≤ 40% da área útil', explicacao: 'Garante ventilação por convecção natural e espaço para manutenção' }
          ],
          pontosOperacionais: [
            'Vantagens do Barramento Blindado (Busway - IEC 61439-6): reduz drasticamente o espaço físico em relação a feixes de cabos grossos, possui baixíssima reatância (menor queda de tensão) e permite instalar caixas de derivação tipo plug-in com disjuntores sob carga ao longo do trajeto.',
            'Disposição de cabos unipolares em leito: devem ser fixados em formação Trevo (Trifólio) amarrados com abraçadeiras não magnéticas (aço inox ou poliamida especial), garantindo o cancelamento mútua dos campos magnéticos e evitando forças de repulsão eletrodinâmica em curto-circuito.',
            'Nunca passar apenas um condutor de fase por furo individual em chapa de aço de painel; a corrente alternada induz correntes parasitas de Foucault na chapa de aço, aquecendo-a até o rubro!',
            'Continuidade de aterramento das calhas: todas as seções de eletrocalhas metálicas devem ser interligadas com cordoalhas flexíveis de cobre estanhado e aterradas na malha principal.'
          ],
          fieldCase: {
            localizacao: 'Matola, Parque Industrial',
            cenario: 'Fábrica de embalagens plásticas onde cabos alimentadores de 95 mm² em PVC em um leito suspenso operavam a 82°C (muito acima do limite seguro de 70°C do PVC), exalando forte cheiro de plástico queimado.',
            diagnostico: 'Havia 16 circuitos trifásicos empilhados em três camadas desordenadas no mesmo leito metálico sem nenhum espaçamento entre eles. O instalador não aplicou o fator de correção por agrupamento (kg = 0,48 para aquela configuração). O cabo de 95 mm² que suportava 250A em ar livre teve sua capacidade reduzida para apenas 120A, operando em sobrecarga térmica crítica.',
            solucaoNormativa: 'Instalação de um segundo leito de cabos paralelo, redistribuindo os condutores em camada única espaçada por um diâmetro de cabo, e substituição dos cabos de PVC por cabos com isolamento em XLPE (resistência térmica contínua de 90°C). A temperatura de operação caiu para 48°C.'
          },
          funcionamento: 'O calor gerado no núcleo de cobre precisa ser transferido para o ar ambiente por condução e convecção. Quando cabos são amontoados, o calor de um condutor aquece o condutor vizinho, gerando efeito estufa no feixe.',
          aplicacaoMocambique: 'A temperatura ambiente nos pavilhões industriais de Moçambique ultrapassa frequentemente 40°C a 45°C sob telhados de chapa de zinco sem isolamento térmico, exigindo fatores de correção de temperatura severos (kt ≈ 0,82 a 0,71).'
          ,exemploPratico: 'Cabo de 50 mm² XLPE com capacidade nominal de 190A na tabela. Instalado em ambiente a 40°C (kt = 0,91) agrupado com outros 3 circuitos (kg = 0,70): Iz_real = 190 × 0,91 × 0,70 = 121 A. O disjuntor de proteção não pode ser superior a 125 A.',
          calculationSnippet: 'Iz = Iz_tabela × kt × kg | Ocupação máx calha = 40% | Trifólio cancela campos induzidos'
        },
        quiz: {
          question: 'Em um projeto elétrico industrial em Moçambique, um técnico precisa dimensionar um grupo de cabos de cobre instalados em uma eletrocalha perfurada com 4 circuitos trifásicos agrupados em ambiente com temperatura de 40°C. Por que o técnico NÃO pode utilizar diretamente a capacidade de condução de corrente pura tabelada a 30°C da IEC 60364-5-52?',
          options: [
            { id: 'A', text: 'Porque a capacidade tabelada refere-se a um único circuito em ar livre a 30°C; o agrupamento mútuo e a temperatura elevada reduzem a dissipação térmica, exigindo a aplicação dos fatores de correção kg e kt para evitar derretimento da isolação.', isCorrect: true, feedback: 'Correto! Cabos agrupados e ambiente quente impedem a dissipação do calor por efeito Joule, exigindo a desclassificação da capacidade de corrente através de Iz = Iz_tab × kt × kg.' },
            { id: 'B', text: 'Porque a frequência da rede diminui de 50 Hz para 25 Hz em eletrocalhas.', isCorrect: false, feedback: 'A frequência da rede elétrica não é afetada pelo método de instalação dos cabos.' },
            { id: 'C', text: 'Porque em eletrocalhas a corrente elétrica se converte em corrente contínua pura.', isCorrect: false, feedback: 'Afirmação totalmente absurda.' },
            { id: 'D', text: 'Porque a norma exige multiplicar a corrente por 3 para compensar o peso do cabo.', isCorrect: false, feedback: 'Fatores de correção referem-se a temperatura e agrupamento térmico, não peso mecânico.' }
          ],
          explanation: 'As tabelas de capacidade de condução de corrente da norma IEC 60364-5-52 são padronizadas para um único circuito isolado operando à temperatura ambiente de referência de 30°C no ar. Quando múltiplos circuitos dividem a mesma eletrocalha e a temperatura do ambiente é superior a 30°C, a dissipação térmica é drasticamente prejudicada. É mandatório aplicar os fatores redutores de temperatura (kt) e de agrupamento (kg): Iz = Iz_tabela × kt × kg.',
          keyTakeaway: 'Iz = Iz_tab × kt × kg: Agrupamento e calor ambiente reduzem obrigatoriamente a corrente suportada por cabos.',
          xpReward: 50
        }
      },
      {
        id: 'elec_m6_ec2_banco_capacitores_potencia',
        moduleId: 'elec_mod_6_industriais',
        moduleTitle: 'Módulo 6: Instalações Elétricas Industriais & Redes de Potência',
        order: 2,
        code: 'EC 6.2',
        title: 'Bancos de Capacitores Automáticos e Cálculo de Reativos (Qc)',
        norma: 'IEC 60831-1 / IEC 61921',
        level: 'Avançado',
        durationMinutes: 16,
        theory: {
          conceito: 'Grandes indústrias operam com cargas altamente indutivas (motores, fornos de indução, transformadores), rebaixando o Fator de Potência global. A correção centralizada no QGBT é realizada por Bancos de Capacitores Automáticos acionados por um Controlador Automático de Fator de Potência (Varimétrico) com relés por passos, mantendo o cos φ acima de 0,95 sem provocar sobretensão capacitiva em vazio.',
          formulas: [
            { label: 'Potência Reativa do Banco (Qc)', formula: 'Q_c = P × (tan φ1 - tan φ2)', explicacao: 'P = Potência Ativa (kW); φ1 = ângulo inicial; φ2 = ângulo desejado (ex: cos φ2 = 0,95)' },
            { label: 'Corrente Nominal do Banco Trifásico', formula: 'I_c = Q_c / (√3 × V_L)', explicacao: 'Corrente nominal absorvida pelos capacitores em regime permanente' },
            { label: 'Sobredimensionamento de Segurança', formula: 'I_disjuntor_cabo ≥ 1,43 × I_c', explicacao: 'Sobredimensionamento de 43% exigido pela IEC 60831 para suportar harmônicas e tolerância de fabricação' }
          ],
          pontosOperacionais: [
            'Contatores Especiais para Capacitores: contatores padrão AC-3 quebram ou colam os contatos devido à corrente de inrush de dezenas de vezes a nominal na energização. É mandatório empregar contatores para capacitores categoria AC-6b com blocos de contatos de pré-inserção e resistores de amortecimento.',
            'Resistores de Descarga Integrados: a IEC 60831 exige que as células capacitivas descarreguem a tensão residual para menos de 50V em no máximo 1 a 3 minutos após o desligamento antes de uma reconexão.',
            'Reatores Anti-Harmônicos (Dessintonização): em fábricas onde a taxa de distorção harmônica de tensão (THD-V) é superior a 3-5%, os capacitores entram em ressonância com a indutância da rede, explodindo ou queimando fusíveis. Deve-se instalar reatores de bloqueio em série (típico 7% para frequência de ressonância em 189 Hz).',
            'O Transformador de Corrente (TC) do controlador automático deve ser instalado a montante de todas as cargas e dos próprios capacitores, medindo a corrente total de entrada.'
          ],
          fieldCase: {
            localizacao: 'Nacala Porto, Nampula',
            cenario: 'Moagem de trigo industrial recebendo faturas da EDM com multas pesadas mensais de energia reativa indutiva (FP médio medido de 0,74). O consumo ativo médio da fábrica era de 280 kW sob rede de 400 V 50 Hz.',
            diagnostico: 'Com cos φ1 = 0,74 -> tan φ1 = 0,909. Para atingir o fator de potência ideal de cos φ2 = 0,96 -> tan φ2 = 0,292. A potência reativa capacitiva requerida calculada: Qc = 280 × (0,909 - 0,292) = 280 × 0,617 = 172,7 kVAr.',
            solucaoNormativa: 'Instalação de um Banco Automático de 180 kVAr montado em 6 passos (10 + 20 + 30 + 40 + 40 + 40 kVAr) com controlador microprocessado de 6 estágios e contatores com resistores de pré-inserção AC-6b. O fator de potência subiu para 0,96 contínuo, zerando a multa da EDM e aliviando a corrente do transformador em 80 A.'
          },
          funcionamento: 'Ao conectar capacitores em paralelo com as cargas indutivas, a corrente magnetizante circula apenas localmente entre o capacitor e o motor, evitando circular pelos cabos e geradores da EDM.',
          aplicacaoMocambique: 'A tarifa de penalização por energia reativa da concessionária EDM pune severamente o consumo com cos φ < 0,92. Bancos de capacitores bem dimensionados se pagam sozinhos em menos de 4 a 8 meses em indústrias moçambicanas.',
          exemploPratico: 'Fábrica de 100 kW com cos φ = 0,80 (tan φ = 0,75) querendo atingir cos φ = 0,95 (tan φ = 0,33): Qc = 100 × (0,75 - 0,33) = 42 kVAr. Instala-se um banco de 45 kVAr em 3 passos de 15 kVAr.',
          calculationSnippet: 'Qc = P × (tan φ1 - tan φ2) | Contatores AC-6b com pré-inserção obrigatórios'
        },
        quiz: {
          question: 'Em uma instalação industrial alimentada a 400V 50Hz, uma carga consome uma potência ativa contínua de P = 200 kW com fator de potência inicial cos φ1 = 0,70 (tan φ1 = 1,02). Deseja-se corrigir o fator de potência para cos φ2 = 0,95 (tan φ2 = 0,33). Qual deve ser a potência reativa capacitiva (Qc) do banco de capacitores segundo a IEC 60831?',
          options: [
            { id: 'A', text: 'Qc = 200 kVAr.', isCorrect: false, feedback: '200 kVAr sobrecorrigiria a instalação para regime capacitivo perigoso.' },
            { id: 'B', text: 'Qc = 138 kVAr (Qc = 200 × [1,02 - 0,33]).', isCorrect: true, feedback: 'Perfeito! Pela fórmula normativa: Qc = P × (tan φ1 - tan φ2) = 200 × (1,02 - 0,33) = 200 × 0,69 = 138 kVAr.' },
            { id: 'C', text: 'Qc = 50 kVAr.', isCorrect: false, feedback: '50 kVAr seria insuficiente para atingir 0,95.' },
            { id: 'D', text: 'Qc = 15 kVAr.', isCorrect: false, feedback: 'Valor muito abaixo da demanda reativa calculada.' }
          ],
          explanation: 'O cálculo da potência reativa capacitiva necessária para correção do fator de potência é obtido pela fórmula fundamental: Qc = P × (tan φ1 - tan φ2). Substituindo os valores fornecidos: Qc = 200 kW × (1,02 - 0,33) = 200 × 0,69 = 138 kVAr. Na prática, seleciona-se um banco comercial automático padronizado de 140 kVAr ou 150 kVAr subdividido em passos.',
          keyTakeaway: 'Qc = P × (tan φ1 - tan φ2): Fórmula fundamental para cálculo de bancos de capacitores industriais.',
          xpReward: 50
        }
      }
    ]
  },

  // ==========================================================================
  // MÓDULO 7: MANUTENÇÃO, INSPEÇÃO TÉCNICA & ENSAIOS NORMATIVOS
  // ==========================================================================
  {
    id: 'elec_mod_7_manutencao_ensaios',
    area: 'eletrotecnica',
    order: 7,
    title: 'Módulo 7: Manutenção, Inspeção Técnica & Ensaios Normativos',
    description: 'Manutenção Preditiva, Preventiva e Corretiva, ensaios com Megóhmetro (Riso ≥ 1 MΩ), Telurômetro, ensaio de RCDs e termografia infravermelha.',
    icon: 'Wrench',
    normasReferencia: ['IEC 60364-6', 'EN 50110-1', 'ISO 18434-1'],
    lessons: [
      {
        id: 'elec_m7_ec1_tipologias_manutencao',
        moduleId: 'elec_mod_7_manutencao_ensaios',
        moduleTitle: 'Módulo 7: Manutenção, Inspeção Técnica & Ensaios Normativos',
        order: 1,
        code: 'EC 7.1',
        title: 'Tipologias de Manutenção: Corretiva, Preventiva e Preditiva',
        norma: 'EN 13306 / IEC 60364-6',
        level: 'Intermediário',
        durationMinutes: 14,
        theory: {
          conceito: 'A gestão da manutenção elétrica industrial organiza-se em três níveis estratégicos fundamentais:\n1. Manutenção Corretiva: Executada após a ocorrência da falha (quebra-repara). É a mais custosa e perigosa, gerando paradas não planejadas de produção.\n2. Manutenção Preventiva: Baseada em intervalos pré-determinados de tempo ou horas de operação (plano cronológico com reapertos de torque, limpeza, troca periódica de escovas).\n3. Manutenção Preditiva / Baseada na Condição (CBM): Monitora parâmetros físicos em tempo real ou em rondas periódicas (termografia infravermelha, análise de vibração, análise de rigidez do óleo isolante) para intervir apenas antes do ponto de quebra funcional.',
          formulas: [
            { label: 'Tempo Médio Entre Falhas (MTBF)', formula: 'MTBF = Tempo Total de Operação / Número de Falhas', explicacao: 'Indicador de confiabilidade do sistema (quanto maior, melhor)' },
            { label: 'Tempo Médio de Reparo (MTTR)', formula: 'MTTR = Tempo Total em Manutenção / Número de Falhas', explicacao: 'Indicador de manutenibilidade e agilidade da equipe técnica' },
            { label: 'Disponibilidade Operacional', formula: 'D = MTBF / (MTBF + MTTR)', explicacao: 'Meta industrial típica: D ≥ 98,5%' }
          ],
          pontosOperacionais: [
            'O reaperto sistemático "cego" de parafusos com força excessiva sem torquímetro danifica as roscas de latão e deforma as barras de cobre, causando afrouxamento futuro por escoamento mecânico do material.',
            'Torques normativos padrão para barramentos de cobre com parafusos de aço 8.8: M6 = 9 a 11 Nm; M8 = 20 a 25 Nm; M10 = 40 a 50 Nm; M12 = 70 a 85 Nm.',
            'Aplicação de tinta lacre vermelha (Torque Seal) sobre os parafusos após o aperto com chave dinamométrica para identificar visualmente qualquer afrouxamento em inspeções preventivas futuras.',
            'Despoeiramento com aspirador industrial antiestático com filtro HEPA: NUNCA usar soprador de ar comprimido comum de oficina dentro de painéis elétricos, pois a umidade e óleo da linha de ar comprimido contaminam barramentos e causam curtos-circuitos imediatos!'
          ],
          fieldCase: {
            localizacao: 'Vilankulo, Província de Inhambane',
            cenario: 'Resort turístico com queima recorrente de contatores do sistema central de climatização a cada três meses, gerando prejuízos de hóspedes sem ar-condicionado.',
            diagnostico: 'A equipe de manutenção aplicava apenas manutenção corretiva, trocando o contator após queimar. A perícia identificou que a maresia costeira acelerava a oxidação e que o técnico anterior apertava os bornes com chave manual comum. A vibração do contator afrouxava o borne, elevando a resistência de contato e fundindo os terminais plásticos.',
            solucaoNormativa: 'Criação de um Plano Preventivo Trimestral com limpeza com álcool isopropílico, reaperto com torquímetro dinamométrico calibrado e pulverização de verniz protetor anti-maresia tropicalizado nos terminais elétricos. Zero queimas de contatores no ano subsequente.'
          },
          funcionamento: 'A curva da banheira demonstra que falhas elétricas se concentram no período inicial (mortalidade infantil por erro de montagem) e no período final por desgaste térmico do isolamento.',
          aplicacaoMocambique: 'A escassez de peças sobressalentes de reposição imediata em cidades do interior de Moçambique torna a manutenção preditiva e preventiva vital: esperar um transformador ou inversor queimar para consertar significa fábrica parada por semanas aguardando importação de peças da África do Sul.',
          exemploPratico: 'Um motor que opera 1000 horas e sofreu 2 quebras: MTBF = 1000 / 2 = 500 horas. Se o reparo durou 10 horas: MTTR = 10 / 2 = 5 horas. Disponibilidade: D = 500 / 505 = 99,01%.',
          calculationSnippet: 'Preventiva = Tempo fixo | Preditiva = Condição física | Torquímetro calibrado obrigatório'
        },
        quiz: {
          question: 'Qual é a principal vantagem técnica e financeira da Manutenção Preditiva (baseada na condição física real do ativo) quando comparada à Manutenção Corretiva pura em instalações elétricas industriais?',
          options: [
            { id: 'A', text: 'A manutenção preditiva dispensa o uso de qualquer ferramenta técnica ou instrumento de teste.', isCorrect: false, feedback: 'A manutenção preditiva baseia-se exatamente em ferramentas de alta tecnologia como câmeras térmicas e megôhmetros.' },
            { id: 'B', text: 'Permite identificar a degradação e anomalias térmicas/isolantes em estágio inicial sob carga, possibilitando planejar a intervenção programada antes da quebra funcional e evitando prejuízos catastróficos de paralisação não planejada.', isCorrect: true, feedback: 'Exato! A manutenção preditiva monitora os sintomas iniciais (calor, vibração, resistência de isolamento) e intervém no momento ótimo, evitando o colapso e paradas bruscas de produção.' },
            { id: 'C', text: 'A manutenção preditiva consiste em esperar o equipamento queimar para substituir por um novo.', isCorrect: false, feedback: 'Isso é a definição de manutenção corretiva reativa.' },
            { id: 'D', text: 'Garante que os cabos elétricos nunca conduzam corrente acima de 1 A.', isCorrect: false, feedback: 'Afirmação sem nexo técnico.' }
          ],
          explanation: 'A Manutenção Preditiva atua através da medição de variáveis físicas operacionais (como gradiente de temperatura termográfica, análise de resistência de isolamento e análise de óleo dielétrico) sem desenergizar a instalação desnecessariamente. Isso possibilita detectar a falha incipiente muito antes do colapso funcional, programando a troca com antecedência, reduzindo o custo de reparo em até 70% e eliminando perdas brutas de produção por parada imprevista.',
          keyTakeaway: 'Manutenção Preditiva: Detecta a anomalia incipiente antes da quebra, eliminando paradas de surpresa.',
          xpReward: 50
        }
      },
      {
        id: 'elec_m7_ec2_ensaios_eletricos_normativos',
        moduleId: 'elec_mod_7_manutencao_ensaios',
        moduleTitle: 'Módulo 7: Manutenção, Inspeção Técnica & Ensaios Normativos',
        order: 2,
        code: 'EC 7.2',
        title: 'Ensaios Elétricos Normativos: Megóhmetro (Riso), Telurômetro e Ensaio de RCDs',
        norma: 'IEC 60364-6 / IEC 61557-1 / IEC 61557-2',
        level: 'Avançado',
        durationMinutes: 16,
        theory: {
          conceito: 'A norma internacional IEC 60364-6 prescreve a sequência rigorosa e inegociável de ensaios elétricos para comissionamento e inspeção periódica de instalações de baixa tensão antes de colocá-las em serviço comercial: 1. Continuidade dos condutores de proteção PE e equipotencialidade; 2. Resistência de Isolação (Riso) com Megóhmetro em CC; 3. Resistência do elétrodo de terra com Telurômetro; 4. Teste de tempo e corrente de disparo de dispositivos diferenciais (RCD); 5. Polaridade e sequência de fases.',
          formulas: [
            { label: 'Tensão de Ensaio de Isolação (Circuitos até 500V)', formula: 'V_ensaio = 500 Vcc', explicacao: 'Tensão contínua injetada entre condutores ativos e entre condutores e a terra PE' },
            { label: 'Resistência de Isolação Mínima Admissível', formula: 'R_iso ≥ 1,0 MΩ (1000 kΩ)', explicacao: 'IEC 60364-6 Tabela 6.1: valor mínimo absoluto em instalações de baixa tensão' },
            { label: 'Método de Queda de Potencial de Terra (Telurômetro)', formula: 'Distância da Sonda de Potencial = 62% da distância total', explicacao: 'Ponto exato fora do cone de influência do elétrodo principal de aterramento' },
            { label: 'Tempo Máximo de Disparo de RCD 30mA a 1×IΔn', formula: 't_disparo ≤ 300 ms (t ≤ 40 ms a 5×IΔn)', explicacao: 'Garante corte da energia antes de causar fibrilação cardíaca' }
          ],
          pontosOperacionais: [
            'CUIDADO EXTREMO COM O MEGÓHMETRO: Como o instrumento injeta 500 Vcc ou 1000 Vcc, é terminantemente OBRIGATÓRIO desconectar previamente todos os equipamentos eletrônicos sensíveis (computadores, CLPs, módulos eletrônicos de LED) e descarregadores de sobretensão (SPDs), caso contrário a tensão de teste destruirá os varistores e fontes!',
            'Descarga de cabos longos: após injetar tensão contínua no ensaio de isolação, o cabo atua como um capacitor carregado; deve-se manter a ponta de teste aterrada para descarregar a carga estática antes de tocar nos condutores.',
            'Medição de terra com Telurômetro de 3 estacas: a haste sob teste (E), a estaca intermediária de potencial (P a 62% da distância) e a estaca externa de corrente (C a 20 a 30 metros de distância) em linha reta.',
            'O teste do botão "T" do RCD testa apenas a mecânica; o ensaio normativo da IEC 60364-6 exige injetar corrente diferencial calibrada com instrumento multifunção medindo o tempo exato de disparo em milissegundos.'
          ],
          fieldCase: {
            localizacao: 'Quelimane, Província da Zambézia',
            cenario: 'Edifício bancário recém-construído onde o engenheiro responsável realizava o comissionamento antes da ligação final da EDM. O circuito terminal dos aparelhos de ar condicionado de 4 mm² no 1º andar apresentava disparo intempestivo.',
            diagnostico: 'Com a rede desenergizada e cargas desconectadas, o ensaio de isolação com Megóhmetro a 500 Vcc entre a Fase Castanha e o condutor de Terra PE acusou Riso = 0,18 MΩ (180 kΩ), violando o limite mínimo de 1,0 MΩ. A inspeção no forro de gesso localizou um parafuso autoatarraxante que perfurou o eletroduto corrugado e espetou o isolamento do cabo de fase.',
            solucaoNormativa: 'Substituição do trecho de condutor danificado. O novo teste com Megóhmetro registrou Riso > 999 MΩ (isolamento perfeito). O circuito foi energizado em total conformidade com a IEC 60364-6.'
          },
          funcionamento: 'A corrente de fuga através do isolamento degradado aquece o PVC e gera microarcos elétricos que carbonizam o polímero até a combustão espontânea.',
          aplicacaoMocambique: 'A humidade relativa do ar em cidades litorâneas como Beira e Nacala frequentemente atinge 90%. A penetração de umidade e salitre em caixas de passagem expostas degrada a resistência de isolação, exigindo vedações estanques IP65/IP66.',
          exemploPratico: 'Numa instalação residencial de 230V: teste de Riso entre Neutro e Terra PE com todas as lâmpadas removidas e disjuntores ligados: leitura de 125 MΩ. O isolamento está impecável e 125 vezes acima do mínimo normativo de 1 MΩ.',
          calculationSnippet: 'IEC 60364-6: Riso ≥ 1,0 MΩ a 500Vcc | Telurômetro regra 62% | RCD t ≤ 300ms a 1×IΔn'
        },
        quiz: {
          question: 'De acordo com a norma internacional IEC 60364-6 (Tabela 6.1), qual é a tensão contínua de ensaio e o valor mínimo admissível de Resistência de Isolação (Riso) para circuitos elétricos de Baixa Tensão com tensão nominal de até 500 V (incluindo redes 230V / 400V)?',
          options: [
            { id: 'A', text: 'Tensão de ensaio de 12 Vcc e Riso mínimo de 10 Ω.', isCorrect: false, feedback: '12V não tem capacidade de testar a rigidez dielétrica da isolação.' },
            { id: 'B', text: 'Tensão de ensaio de 500 Vcc e Resistência de Isolação mínima de 1,0 MΩ (1 Megohm).', isCorrect: true, feedback: 'Correto! A Tabela 6.1 da IEC 60364-6 estipula expressamente 500 Vcc em corrente contínua e Riso ≥ 1,0 MΩ para circuitos com tensão nominal de até 500 V.' },
            { id: 'C', text: 'Tensão de ensaio de 10.000 Vca e Riso mínimo de 100 GΩ.', isCorrect: false, feedback: 'Tensão de média/alta tensão que destruiria os cabos de baixa tensão.' },
            { id: 'D', text: 'Não existe valor mínimo normatizado, qualquer valor acima de zero é aceitável.', isCorrect: false, feedback: 'Qualquer valor abaixo de 1 MΩ representa risco crítico de choque ou incêndio.' }
          ],
          explanation: 'A norma IEC 60364-6 (Capítulo 61 - Verificação Inicial) estabelece em sua Tabela 6.1 que para circuitos com tensão nominal até 500 V (como as redes padrão 230 V monofásicas e 400 V trifásicas), o ensaio de isolamento deve ser realizado com tensão contínua de 500 Vcc e o valor medido entre condutores ativos e a terra deve ser igual ou superior a 1,0 MΩ (1000000 de Ohms).',
          keyTakeaway: 'IEC 60364-6: Ensaio de Isolação a 500 Vcc com Riso mínima de 1,0 MΩ.',
          xpReward: 50
        }
      },
      {
        id: 'elec_m7_ec3_termografia_infravermelha',
        moduleId: 'elec_mod_7_manutencao_ensaios',
        moduleTitle: 'Módulo 7: Manutenção, Inspeção Técnica & Ensaios Normativos',
        order: 3,
        code: 'EC 7.3',
        title: 'Termografia Infravermelha e Avaliação de Gradiente Térmico (ΔT)',
        norma: 'ISO 18434-1 / IEC 60364-6',
        level: 'Avançado',
        durationMinutes: 15,
        theory: {
          conceito: 'A inspeção termográfica por infravermelho é o método preditivo não invasivo mais eficaz para detectar anomalias térmicas em conexões elétricas sob carga sem interromper a operação da fábrica. Conexões frouxas, oxidadas ou subdimensionadas desenvolvem alta resistência de contato (Rc), dissipando calor por efeito Joule (P = Rc × I²). A gravidade é avaliada pelo gradiente térmico diferencial (ΔT) entre a conexão suspeita e uma conexão idêntica na mesma condição de carga.',
          formulas: [
            { label: 'Calor Gerado na Conexão', formula: 'P_dissipada = R_contato × I²', explicacao: 'O aumento da resistência de contato faz a temperatura disparar exponencialmente com a corrente' },
            { label: 'Critério de Severidade Térmica (ISO 18434-1)', formula: 'ΔT = T_ponto_quente - T_referencia', explicacao: 'Diferença de temperatura comparada a conexões semelhantes sob a mesma corrente' },
            { label: 'Gravidade Leve (Monitorar)', formula: 'ΔT < 10 °C', explicacao: 'Anomalia em estágio inicial; programar inspeção na próxima manutenção preventiva' },
            { label: 'Gravidade Grave (Intervir em breve)', formula: '10 °C ≤ ΔT ≤ 35 °C', explicacao: 'Risco de degradação acelerada do isolante; intervir na primeira oportunidade' },
            { label: 'Gravidade Crítica (Intervenção Imediata)', formula: 'ΔT > 35 °C', explicacao: 'Risco iminente de fusão do metal, arco elétrico e incêndio catastrófico' }
          ],
          pontosOperacionais: [
            'Condição OBRIGATÓRIA para ensaio termográfico válido: o circuito deve estar operando com carga mínima de pelo menos 40% a 50% da corrente nominal por pelo menos 1 hora para atingir estabilidade térmica. Fazer termografia em painéis desligados ou em vazio é totalmente inútil!',
            'Parâmetro de Emissividade (ε): Cobre polido e barramentos de alumínio brilhantes têm baixíssima emissividade (ε ≈ 0,1 a 0,2), refletindo o calor do operador e dando leituras falsamente frias! Para medir com precisão, aplique fita isolante fosca preta ou tinta (ε = 0,95) no barramento.',
            'Abertura de portas de painel com proteção individual (EPI para risco de arco elétrico: capuz de proteção facial com viseira anti-arco, luvas isolantes e vestimenta de algodão retardante de chamas).',
            'Sempre registrar no laudo termográfico: foto térmica com escala de cores, foto visual visível, corrente medida com alicate amperímetro no instante exato do disparo e valor calibrado de emissividade.'
          ],
          fieldCase: {
            localizacao: 'Moatize, Província de Tete',
            cenario: 'Subestação principal de britagem primária de carvão mineral operando a plena carga em dia com temperatura ambiente de 41°C.',
            diagnostico: 'A ronda termográfica com câmera calibrada registrou no borne de saída da Fase S do disjuntor geral de 800A uma temperatura de 118°C, enquanto as Fases R e T operavam a 49°C. Gradiente térmico: ΔT = 118 - 49 = 69°C (Classificação Crítica: ΔT > 35°C com risco iminente de incêndio e perda do disjuntor de alta capacidade).',
            solucaoNormativa: 'Parada técnica programada na troca de turno de emergência. A desmontagem revelou que a arruela de pressão estava partida e o parafuso de cobre apresentava rosca espanada e oxidação preta. Substituição do parafuso por aço 8.8 bicromatizado, arruelas cônicas Belleville novas e aperto com chave dinamométrica a 45 Nm. Na religação, a Fase S normalizou para 50°C (ΔT = 1°C).'
          },
          funcionamento: 'A radiação eletromagnética infravermelha emitida por qualquer corpo com temperatura acima do zero absoluto é captada pelo sensor bolométrico da câmera e convertida em um mapa de cores de temperatura real.',
          aplicacaoMocambique: 'Com temperaturas ambiente no verão que ultrapassam 40°C em Moçambique, a margem térmica dos barramentos é reduzida, fazendo com que conexões mal apertadas derretam muito mais depressa do que em climas frios.',
          exemploPratico: 'Barramento com Fase A = 42°C, Fase B = 43°C e Fase C = 78°C sob corrente de 150A. ΔT = 78 - 42,5 = 35,5°C. Situação Crítica: intervenção imediata necessária antes do fechamento do expediente.',
          calculationSnippet: 'ΔT = T_anomalia - T_ref | ΔT > 35°C = Crítico (Risco de Incêndio) | Emissividade ε = 0,95'
        },
        quiz: {
          question: 'Durante uma inspeção termográfica preditiva segundo a norma ISO 18434-1 em um QGBT industrial operando com 70% de carga, o técnico detecta que o terminal de entrada da Fase R de um disjuntor opera a 92 °C, enquanto os terminais das Fases S e T operam a 45 °C na mesma corrente. Qual é o valor do gradiente térmico (ΔT) e qual ação técnica deve ser tomada?',
          options: [
            { id: 'A', text: 'ΔT = 10 °C; situação perfeitamente normal que não requer nenhuma ação.', isCorrect: false, feedback: 'O cálculo correto de 92 - 45 resulta em 47 °C, não 10 °C.' },
            { id: 'B', text: 'ΔT = 47 °C; trata-se de uma anomalia de Severidade Crítica (ΔT > 35 °C) com risco iminente de fusão do terminal e incêndio, exigindo intervenção técnica corretiva imediata.', isCorrect: true, feedback: 'Exato! O gradiente térmico ΔT = 92 °C - 45 °C = 47 °C supera com folga o limite crítico de 35 °C da ISO 18434-1, exigindo desenergização urgente para limpeza e reaperto calibrado.' },
            { id: 'C', text: 'ΔT = 137 °C; deve-se resfriar o disjuntor jogando água com mangueira.', isCorrect: false, feedback: 'Jogar água em equipamento elétrico energizado causaria explosão por arco elétrico e choque letal!' },
            { id: 'D', text: 'ΔT = 0 °C; a temperatura de 92 °C é a ideal para amolecer os cabos.', isCorrect: false, feedback: '92 °C derrete o isolamento de PVC (limite de 70 °C).' }
          ],
          explanation: 'O gradiente térmico relativo é a diferença de temperatura entre o ponto com anomalia e uma fase de referência com carga idêntica: ΔT = 92 °C - 45 °C = 47 °C. Pela norma ISO 18434-1 e critérios internacionais de termografia elétrica, qualquer anomalia com ΔT superior a 35 °C é classificada como "Crítica / Emergencial", indicando que a conexão está em processo acelerado de degradação térmica com risco iminente de destruição por arco elétrico ou fogo.',
          keyTakeaway: 'ΔT > 35 °C: Gravidade Crítica na termografia elétrica, exigindo reparo emergencial.',
          xpReward: 50
        }
      }
    ]
  }
];
