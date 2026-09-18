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
      },
      {
        id: 'elec_m4_ec4_amplificadores_operacionais_sensores',
        moduleId: 'elec_mod_4_eletronica',
        moduleTitle: 'Módulo 4: Eletrônica Analógica & Digital e Fontes de Alimentação',
        order: 4,
        code: 'EC 4.4',
        title: 'Amplificadores Operacionais e Condicionamento de Sinais 4-20mA / 0-10V',
        norma: 'IEC 60381-1 / IEC 60747-3',
        level: 'Avançado',
        durationMinutes: 15,
        theory: {
          conceito: 'Na instrumentação e controle de processos industriais, grandezas físicas (pressão, vazão, nível, temperatura) são convertidas em sinais elétricos padronizados: laço de corrente 4-20 mA ou tensão 0-10 V. Amplificadores operacionais (Op-Amps) realizam o condicionamento analógico: amplificação, filtragem ativa de ruído de alta frequência e conversão I/V ou V/I.',
          formulas: [
            { label: 'Conversão Corrente para Tensão', formula: 'V = I × R_shunt', explicacao: 'Resistor de precisão de 250 Ω converte 4-20 mA em 1-5 Vcc para entradas de microcontroladores' },
            { label: 'Ganho do Amplificador Não-Inversor', formula: 'A_v = 1 + (R_f / R_in)', explicacao: 'Determina a amplificação do sinal fraco de células de carga e termopares' },
            { label: 'Zero Vivo (Live Zero)', formula: 'I_min = 4 mA', explicacao: 'Permite distinguir imediatamente entre grandeza no zero (4 mA) e fio partido (0 mA)' }
          ],
          pontosOperacionais: [
            'O laço de corrente 4-20 mA é imune à queda de tensão ao longo de cabos longos (até 1000 metros), pois a fonte de corrente regula a tensão automaticamente para manter a corrente exata.',
            'O conceito de "Zero Vivo" (4 mA na escala mínima): se o transmissor medir 0 mA, o CLP dispara alarme imediato de "Falha de Linha / Cabo Rompido".',
            'Sempre utilize cabos de instrumentação trançados e blindados (par trançado blindado STP) com a malha aterrada em apenas UM ponto para evitar loops de terra.',
            'Ao medir 4-20 mA com multímetro, abra o laço e insira o amperímetro em série, ou use um alicate de corrente para processos (de miliamperes DC).'
          ],
          fieldCase: {
            localizacao: 'Chókwè, Província de Gaza',
            cenario: 'Sensor de nível hidrostático de represa com saída 4-20 mA enviando leituras oscilantes e erráticas para o painel da bomba de irrigação.',
            diagnostico: 'O técnico anterior aterrou a malha do cabo de sinal em ambas as pontas (no poço e no painel). A diferença de potencial de terra de 2,4V entre os dois locais induziu uma corrente espúria de 60 Hz na blindagem que se somava ao sinal analógico de 4-20 mA.',
            solucaoNormativa: 'Desconexão da malha no lado do sensor e aterramento exclusivo no borne PE do painel central. As oscilações cessaram imediatamente e a leitura de nível estabilizou em 4,20 mA (represa em nível mínimo calibrado).'
          },
          funcionamento: 'A impedância de saída de um transmissor de corrente é teoricamente infinita, forçando a corrente exata através de qualquer resistência de loop até o limite de carga permissível (típico 500 Ω a 750 Ω em 24 Vcc).',
          aplicacaoMocambique: 'Açucareiras de Maragra e cervejarias em Maputo utilizam milhares de laços de 4-20 mA para controlar pasteurização, dosagem de químicos e pressão de vapor em caldeiras.',
          exemploPratico: 'Transmissor de pressão de 0 a 10 bar com saída 4-20 mA. Se a pressão for 5 bar (50%), a corrente deve ser: I = 4 + (20 - 4) × 0,5 = 12 mA. Com resistor de carga de 250 Ω: V = 12 mA × 250 Ω = 3,0 Vcc medidos na entrada do CLP.',
          calculationSnippet: 'I = 4 + 16 × (Valor / Span) | R_shunt = 250 Ω para 1-5V | Malha aterrada em 1 só ponto'
        },
        quiz: {
          question: 'Em automação e instrumentação industrial, por qual motivo técnico o padrão de corrente 4-20 mA utiliza 4 mA como ponto de escala zero (Live Zero) em vez de 0 mA?',
          options: [
            { id: 'A', text: 'Para gastar menos bateria dos transmissores.', isCorrect: false, feedback: 'Consumir 4 mA gasta mais do que 0 mA.' },
            { id: 'B', text: 'Para permitir a detecção imediata de rompimento físico do cabo (quando o sinal cai para 0 mA) e permitir alimentar o próprio sensor através dos dois fios do laço.', isCorrect: true, feedback: 'Correto! Se a linha romper, a corrente cai para 0 mA, o que o CLP reconhece como falha de hardware e não como valor de medição zero.' },
            { id: 'C', text: 'Porque a norma proíbe a passagem de corrente contínua inferior a 4 mA.', isCorrect: false, feedback: 'Não existe proibição física dessa natureza.' },
            { id: 'D', text: 'Para compensar a resistência térmica dos condutores de alumínio.', isCorrect: false, feedback: 'Laços de instrumentação usam condutores de cobre.' }
          ],
          explanation: 'O padrão 4-20 mA adota o "Zero Vivo" (4 mA): quando a variável física está no valor mínimo da escala (ex: 0 bar), o sensor drena 4 mA. Se o cabo partir ou o sensor queimar, a corrente é zero (0 mA). O CLP identifica imediatamente a diferença entre "leitura mínima normal" (4 mA) e "defeito na fiação" (0 mA). Além disso, os 4 mA garantem energia mínima para alimentar a eletrônica interna do próprio transmissor (sensores a 2 fios).',
          keyTakeaway: 'Live Zero (4 mA): Garante alimentação do sensor e diferencia medição zero de cabo partido.',
          xpReward: 50
        }
      },
      {
        id: 'elec_m4_ec5_fontes_chaveadas_retificadores_flyback',
        moduleId: 'elec_mod_4_eletronica',
        moduleTitle: 'Módulo 4: Eletrônica Analógica & Digital e Fontes de Alimentação',
        order: 5,
        code: 'EC 4.5',
        title: 'Topologia Flyback, Isolamento Óptico e Diagnóstico de Fontes SMPS',
        norma: 'IEC 61204 / IEC 60950',
        level: 'Avançado',
        durationMinutes: 16,
        theory: {
          conceito: 'As fontes chaveadas isoladas (SMPS - Switched-Mode Power Supply) convertem AC de entrada (85-265V universal) para tensões CC estabilizadas (12V, 24V) com isolamento galvânico total através de um transformador de alta frequência. A topologia Flyback armazena energia magnética no núcleo durante a condução do MOSFET e a transfere para a saída quando o transistor desliga. A regulação de tensão é garantida por um optoacoplador e um circuito de referência zener de precisão (TL431).',
          formulas: [
            { label: 'Equação de Saída Flyback', formula: 'V_out = V_in × [D / (1 - D)] × (N_sec / N_pri)', explicacao: 'D = razão cíclica; N = relação de espiras do transformador' },
            { label: 'Frequência Típica de Chaveamento', formula: 'f_sw = 50 kHz a 130 kHz', explicacao: 'Permite transformadores magnéticos de ferrite extremamente compactos' },
            { label: 'Tensão de Isolamento de Optoacoplador', formula: 'V_iso ≥ 3750 Vrms a 5000 Vrms', explicacao: 'Segurança contra choque entre lado primário e secundário' }
          ],
          pontosOperacionais: [
            'Em diagnóstico de fontes chaveadas paradas: NUNCA meça com multímetro referenciado ao terra comum; o primário é referenciado ao negativo do retificador (-310 Vcc flutuante em relação à carcaça), exigindo transformador de isolamento para osciloscópio.',
            'Falha mais comum em fontes SMPS de CLPs e painéis: capacitores eletrolíticos de filtragem de saída estufados com aumento excessivo de ESR (Resistência Série Equivalente), gerando ripple e reinicialização contínua do CLP.',
            'O circuito "Snubber" RCD colocado em paralelo com o primário absorve picos de tensão indutiva (L · di/dt) que destruiriam o MOSFET no momento do corte da condução.',
            'Se o optoacoplador ou o TL431 abrir por defeito, a malha de realimentação é interrompida e a fonte pode entrar em sobretensão descontrolada ou acionar a proteção "hiccup" (soluço).'
          ],
          fieldCase: {
            localizacao: 'Dondo, Província de Sofala',
            cenario: 'Fonte chaveada de 24V 10A de um CLP de esteira de cimento parou de funcionar após um pico de tensão na rede. O led de "DC OK" piscava repetidamente a cada 1 segundo (hiccup mode).',
            diagnostico: 'O modo soluçante indicava que o CI modulador tentava dar partida, mas a tensão caía por sobrecarga no secundário. O teste de semicondutores no secundário localizou o diodo duplo Schottky de saída de 24V em curto-circuito pleno (0,0 Ω nos bornes).',
            solucaoNormativa: 'Substituição do diodo Schottky por modelo original de 40A 100V com pasta térmica nova e substituição preventiva dos dois capacitores eletrolíticos de 2200 μF 35V de baixo ESR. A fonte restaurou saída de 24,1 Vcc cravados sob carga plena.'
          },
          funcionamento: 'Ao alternar entre saturação e corte em mais de 65.000 vezes por segundo, a fonte SMPS atinge rendimento superior a 88%, dissipando pouquíssimo calor comparada a fontes lineares com transformadores de ferro 50 Hz.',
          aplicacaoMocambique: 'Em locais com variações severas de tensão (como 160V a 250V na mesma tarde), fontes SMPS automáticas "Full-Range" garantem 24V perfeitamente estáveis para sistemas de automação sem risco de desligamento.',
          exemploPratico: 'Teste rápido de fonte sem instrumentos complexos: meça a tensão no grande capacitor do primário (deve ler ~325 Vcc em rede 230V). Se tiver 0V, o fusível de entrada, termistor NTC ou ponte de diodos retificadora estão queimados.',
          calculationSnippet: 'Flyback: V_out proporcional a D/(1-D) | Ripple alto = capacitores de baixo ESR esgotados'
        },
        quiz: {
          question: 'Durante a manutenção de uma fonte de alimentação chaveada industrial (SMPS) de 24 Vcc de um quadro de automação, o técnico nota que a fonte não liga e que o fusível de entrada de vidro de 2A está aberto e completamente enegrecido (com marca de arco elétrico violento). Qual é a causa mais provável segundo o procedimento de bancada?',
          options: [
            { id: 'A', text: 'O led indicador frontal de DC OK está com defeito.', isCorrect: false, feedback: 'O led queimado não provocaria queima violenta do fusível principal de entrada.' },
            { id: 'B', text: 'Curto-circuito pleno nos componentes de chaveamento de alta tensão do primário (como a ponte retificadora de diodos ou o transistor MOSFET/IGBT principal).', isCorrect: true, feedback: 'Correto! Um fusível enegrecido por arco elétrico indica curto violento no primário com corrente instantânea de dezenas de amperes, tipicamente por destruição do MOSFET ou diodos da ponte.' },
            { id: 'C', text: 'A tensão de saída de 24V está com 23,8V.', isCorrect: false, feedback: 'Pequenas variações na saída não queimam o fusível da entrada AC.' },
            { id: 'D', text: 'O cabo de rede Ethernet do CLP está desconectado.', isCorrect: false, feedback: 'Totalmente sem relação com a alimentação da fonte.' }
          ],
          explanation: 'Quando um fusível abre com queima preta e vestígios de arco no vidro, ocorreu uma corrente de curto-circuito severa no estágio primário da fonte. Os candidatos imediatos são: varistor de proteção em curto por sobretensão, ponte de diodos retificadores perfurada ou o transistor chaveador (MOSFET) principal com quebra entre dreno e fonte (D-S).',
          keyTakeaway: 'Fusível enegrecido na entrada SMPS = Curto catastrófico no primário (Ponte de diodos ou MOSFET).',
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
      },
      {
        id: 'elec_m5_ec4_redes_industriais_modbus',
        moduleId: 'elec_mod_5_motores_automacao',
        moduleTitle: 'Módulo 5: Motores Elétricos, Automação & Controladores Lógicos (PLCs)',
        order: 4,
        code: 'EC 5.4',
        title: 'Redes Industriais: RS-485 Modbus RTU/TCP e Resistor de Terminação 120Ω',
        norma: 'IEC 61158 / EIA-485',
        level: 'Avançado',
        durationMinutes: 15,
        theory: {
          conceito: 'O protocolo Modbus é a espinha dorsal da comunicação entre CLPs, inversores de frequência, multimedidores de energia e sistemas SCADA. O meio físico RS-485 utiliza transmissão diferencial de tensão entre duas vias (A e B ou D+ e D-), permitindo conectar até 32 dispositivos em distâncias de até 1200 metros com alta imunidade a ruídos industriais.',
          formulas: [
            { label: 'Tensão Diferencial RS-485', formula: 'V_ab = V_a - V_b', explicacao: 'Nível lógico 1: V_ab < -200 mV | Nível lógico 0: V_ab > +200 mV' },
            { label: 'Resistor de Terminação de Linha', formula: 'R_t = 120 Ω (1/4 W)', explicacao: 'Instalado obrigatoriamente nas DUAS pontas extremas do barramento físico' },
            { label: 'Topologia Obrigatória', formula: 'Barramento Daisy-Chain (em linha)', explicacao: 'Proibido derivações em estrela ou ramais longos (stubs > 30 cm)' }
          ],
          pontosOperacionais: [
            'A topologia do cabo RS-485 DEVE ser estritamente em cadeia linear (Daisy-Chain: entra num aparelho e sai para o próximo). Ramificações em "T" ou estrela causam reflexão de sinal que derrubam a rede inteira.',
            'O resistor de terminação de 120 Ω casa com a impedância característica do cabo de par trançado. Deve ser ligado APENAS no primeiro e no último equipamento da linha.',
            'Polaridade A e B: se inverter os fios A e B em qualquer escravo, aquele aparelho não comunica (e em alguns fabricantes derruba toda a linha).',
            'Cada dispositivo escravo na rede Modbus RTU deve ter um endereço único (ID de 1 a 247) e rigorosamente a mesma taxa de transmissão (Baud Rate, ex: 9600 ou 19200 bps), paridade e bits de parada.'
          ],
          fieldCase: {
            localizacao: 'Nacala-Porto, Província de Nampula',
            cenario: 'Terminal de grãos com 12 inversores de frequência que comunicavam com o CLP central via Modbus RS-485. Frequentemente a leitura de velocidade travava e dava timeout em todos os motores.',
            diagnostico: 'A fiação foi instalada em topologia estrela com cabo paralelo comum de interfone e sem resistores de terminação. As reflexões de onda na ponta aberta do cabo geravam colisão de dados no barramento.',
            solucaoNormativa: 'Reestruturação para topologia Daisy-Chain com cabo blindado de par trançado próprio para RS-485 (120 Ω) e inclusão de dois resistores de terminação de 120 Ω nas duas extremidades físicas da rede. Taxa de erros de comunicação reduziu para 0%.'
          },
          funcionamento: 'A sinalização diferencial cancela o ruído induzido: qualquer interferência eletromagnética afeta ambos os fios A e B igualmente; como o receptor mede a diferença de tensão (Va - Vb), o ruído comum é rejeitado (CMRR elevado).',
          aplicacaoMocambique: 'A leitura remota de contadores de energia em painéis solares e grupos geradores em locais remotos de Moçambique utiliza quase universalmente Modbus RTU integrado a roteadores 4G.',
          exemploPratico: 'Leitura de corrente de um multimedidor Schneider com ID = 5. O CLP mestre envia comando Modbus função 03 (Read Holding Registers) para o registrador 3001. O medidor responde em 15 ms com o valor em ponto flutuante da corrente de fase.',
          calculationSnippet: 'Daisy-Chain linear obrigatória | 2 resistores de 120 Ω nas pontas | Par trançado blindado'
        },
        quiz: {
          question: 'Em uma rede de comunicação industrial RS-485 Modbus RTU conectando um CLP a 8 inversores de frequência ao longo de 250 metros, onde devem ser instalados os resistores de terminação de 120 Ω?',
          options: [
            { id: 'A', text: 'Em todos os 8 inversores e também no CLP (total de 9 resistores).', isCorrect: false, feedback: 'Isso sobrecarregaria os transceptores, reduzindo a impedância para menos de 15 Ω e queimando as portas de comunicação!' },
            { id: 'B', text: 'Apenas nos dois pontos extremos físicos do barramento (no primeiro dispositivo e no último dispositivo da linha).', isCorrect: true, feedback: 'Correto! Apenas os dois extremos recebem o resistor de 120 Ω para casar a impedância da linha e evitar reflexão de ondas.' },
            { id: 'C', text: 'No meio do cabo, enrolado com fita isolante.', isCorrect: false, feedback: 'No meio da linha não evita a reflexão das extremidades abertas.' },
            { id: 'D', text: 'Em nenhum lugar se a velocidade for inferior a 1 Megabaud.', isCorrect: false, feedback: 'Sem terminação em distâncias de 250m ocorrem reflexões destrutivas mesmo a 9600 bps.' }
          ],
          explanation: 'As linhas de transmissão RS-485 comportam-se como guias de onda. Quando o pulso elétrico atinge o fim do cabo e encontra um circuito aberto (alta impedância), a onda reflete de volta e colide com os bits seguintes. A instalação de exatamente dois resistores de 120 Ω (um em cada extremidade da linha) absorve a energia da onda sem reflexão.',
          keyTakeaway: 'Terminação RS-485: Exatamente dois resistores de 120 Ω, um em cada extremidade física da rede.',
          xpReward: 50
        }
      },
      {
        id: 'elec_m5_ec5_sensores_industriais_pnp_npn',
        moduleId: 'elec_mod_5_motores_automacao',
        moduleTitle: 'Módulo 5: Motores Elétricos, Automação & Controladores Lógicos (PLCs)',
        order: 5,
        code: 'EC 5.5',
        title: 'Sensores de Proximidade Indutivos, Ópticos e Ligação PNP vs NPN',
        norma: 'IEC 60947-5-2 / EN 60947-5-2',
        level: 'Intermediário',
        durationMinutes: 14,
        theory: {
          conceito: 'Sensores de proximidade detectam a presença física de objetos sem contato mecânico. Indutivos operam por correntes parasitas e detectam metais; capacitivos detectam materiais dielétricos (água, plástico, cereais); fotoelétricos utilizam feixes de luz infravermelha ou laser. A saída transistorizada de estado sólido chaveia a carga segundo duas arquiteturas: PNP (Sourcing - chaveia o polo positivo +24V) e NPN (Sinking - chaveia o polo negativo 0V).',
          formulas: [
            { label: 'Cores Padronizadas de Cabos (IEC)', formula: 'Marrom = +24V | Azul = 0V | Preto = Sinal de Saída', explicacao: 'Branco = Saída complementar NC em sensores de 4 fios' },
            { label: 'Sensor PNP (Comum na Europa/IEC)', formula: 'Saída = +24 Vcc quando acionado', explicacao: 'Liga no borne de entrada digital tipo Sink do CLP' },
            { label: 'Sensor NPN (Comum no Japão/Ásia)', formula: 'Saída = 0 Vcc (GND) quando acionado', explicacao: 'Drena a corrente da entrada Source do CLP' }
          ],
          pontosOperacionais: [
            'Código de cores universal IEC 60947-5-2: Marrom (Brown) = Alimentação Positiva (+Vcc, 10-30V); Azul (Blue) = Alimentação Negativa (0V GND); Preto (Black) = Sinal de Saída (Normalmente Aberto NO); Branco (White) = Sinal Normalmente Fechado NC.',
            'Fator de correção de distância sensora (Sn) para metais: Aço carbono = 1,0 (100% da distância); Aço inox = 0,7 (70%); Alumínio = 0,4 (40%); Cobre = 0,3 (30%). Para detectar alumínio ou cobre, o sensor deve estar bem mais próximo!',
            'Se você ligar um sensor PNP em uma entrada configurada para NPN, o CLP nunca reconhecerá o sinal, mesmo que o led do sensor acenda perfeitamente.',
            'Sempre instale o sensor com porca travada em suporte rígido com folga mecânica para que peças móveis na esteira não colidam contra a face frontal do sensor.'
          ],
          fieldCase: {
            localizacao: 'Marracuene, Província de Maputo',
            cenario: 'Máquina enchedora de garrafas de refrigerante importada da China substituída por peças de reposição locais. O sensor de fim de curso acendia a luz vermelha na garrafa, mas o CLP não registrava a entrada digital.',
            diagnostico: 'A máquina chinesa operava com lógica NPN (entradas digitais do CLP esperavam conexão ao 0V). O técnico local comprou um sensor padrão europeu PNP (que injeta +24V). A entrada digital recebia 24V em ambos os lados e a corrente de entrada era nula.',
            solucaoNormativa: 'Substituição pelo modelo correto com saída NPN transistorizada (ou inclusão de relé acoplador intermediário de 24V para conversão de nível lógico). O sinal passou a responder imediatamente.'
          },
          funcionamento: 'O oscilador interno do sensor indutivo cria um campo magnético alternado de alta frequência na face sensora. Quando um metal se aproxima, correntes parasitas (Foucault) amortecem a oscilação, disparando o circuito Schmitt-Trigger interno.',
          aplicacaoMocambique: 'Contagem de sacos de cimento, detecção de garrafas em engarrafadoras e posicionamento de guinchos em minas dependem de sensores indutivos e ópticos robustos com grau de proteção IP67.',
          exemploPratico: 'Teste com multímetro de sensor PNP: Ponta preta no fio Azul (0V), ponta vermelha no fio Preto (Sinal). Ao aproximar uma chave de fenda da face sensora, a tensão lida deve subir de 0V para aproximadamente 23,5 Vcc.',
          calculationSnippet: 'Marrom = +24V | Azul = 0V | Preto = Sinal | PNP = injeta +24V | NPN = drena para 0V'
        },
        quiz: {
          question: 'Em um sensor de proximidade industrial indutivo de 3 fios com saída PNP Normalmente Aberta (NO) de acordo com o padrão de cores da norma IEC 60947-5-2, qual é a ligação correta dos condutores?',
          options: [
            { id: 'A', text: 'Marrom = 230V AC; Azul = Neutro; Preto = Terra PE.', isCorrect: false, feedback: 'Isso ligaria alta tensão alternada em um sensor DC de 24V, explodindo o componente!' },
            { id: 'B', text: 'Marrom = +24 Vcc; Azul = 0 Vcc (GND); Preto = Sinal de saída (entrega +24 Vcc ao detectar o metal).', isCorrect: true, feedback: 'Perfeito! Marrom é o positivo (+24V), Azul é a referência (0V) e Preto é a saída de sinal PNP que conduz o positivo para a entrada do CLP.' },
            { id: 'C', text: 'Preto = +24 Vcc; Branco = 0 Vcc; Verde = Saída analógica.', isCorrect: false, feedback: 'Não segue o código normativo internacional de sensores.' },
            { id: 'D', text: 'Os fios podem ser ligados em qualquer ordem sem polaridade.', isCorrect: false, feedback: 'Sensores semicondutores DC têm polaridade rígida e diodo de proteção reversa.' }
          ],
          explanation: 'O padrão internacional IEC 60947-5-2 define para sensores CC de 3 fios: Fio Marrom (Brown) = Alimentação Positiva (+Vcc, 10-30Vcc); Fio Azul (Blue) = Negativo (0V / GND); Fio Preto (Black) = Saída de sinal (em sensores PNP, fornece +24Vcc à entrada digital quando comutado).',
          keyTakeaway: 'Código IEC 60947-5-2: Marrom = +24V, Azul = 0V, Preto = Sinal PNP (+24V na ativação).',
          xpReward: 50
        }
      },
      {
        id: 'elec_m5_ec6_seguranca_funcional_maquinas',
        moduleId: 'elec_mod_5_motores_automacao',
        moduleTitle: 'Módulo 5: Motores Elétricos, Automação & Controladores Lógicos (PLCs)',
        order: 6,
        code: 'EC 5.6',
        title: 'Segurança Funcional de Máquinas: Relés de Segurança e Parada de Emergência',
        norma: 'ISO 13849-1 / IEC 62061 / IEC 60204-1',
        level: 'Avançado',
        durationMinutes: 16,
        theory: {
          conceito: 'A segurança em máquinas industriais exige sistemas de comando à prova de falhas (Fail-Safe). A norma ISO 13849-1 estabelece Níveis de Desempenho (Performance Levels - PL de "a" até "e") e Categorias de Segurança (B, 1, 2, 3 e 4). Na Categoria 4 / PL e (risco de mutilação ou morte), uma única falha de componente (curto-circuito entre fios, contato soldado) não pode levar à perda da função de segurança e a falha deve ser detectada na próxima manobra.',
          formulas: [
            { label: 'Canal Duplo Redundante', formula: 'Arquitetura com 2 canais independentes (1oo2)', explicacao: 'Dois contatos NF monitorados simultaneamente pelo relé de segurança' },
            { label: 'Parada Categoria 0 (IEC 60204-1)', formula: 'Corte imediato de energia (desarme mecânico)', explicacao: 'Desenergização instantânea dos atuadores sem frenagem controlada' },
            { label: 'Parada Categoria 1', formula: 'Parada controlada seguida de corte de energia', explicacao: 'Inversor freia a máquina em 1 segundo e contator corta a alimentação em seguida' }
          ],
          pontosOperacionais: [
            'REGRA DE OURO DA SEGURANÇA: Botões de emergência e sensores de proteção NUNCA devem ser ligados diretamente a entradas comuns de CLP padrão de processo. Devem ser ligados a Relés de Segurança dedicados com saídas redundantes por contatos mecanicamente guiados (Force-guided).',
            'O botão de parada de emergência tipo "cogumelo" deve ter retenção mecânica, ação de abertura positiva (símbolo de seta em círculo) e ser acionado por corte de circuito NF (contato Normalmente Fechado).',
            'Discrepância de tempo (Cross-monitoring): o relé de segurança monitora se ambos os canais abrem em um intervalo menor que 400 ms. Se um canal abrir e o outro travar fechado, o relé entra em bloqueio de falha e proíbe o rearme.',
            'O circuito de rearme (Reset) deve ser manual, supervisionado (Rearme no pulso de desacionamento) e com visão total da zona de perigo pelo operador.'
          ],
          fieldCase: {
            localizacao: 'Mavalane, Maputo',
            cenario: 'Prensa enfardadeira de papel reciclado onde o operador sofreu amputação parcial da mão porque o botão de emergência falhou: um dos contatos auxiliares soldou eletricamente devido a um arco anterior.',
            diagnostico: 'A fábrica utilizava um botão de emergência com apenas 1 contato simples ligado direto a uma entrada de CLP comercial. Quando o contato soldou fechado, o CLP não leu a abertura do botão.',
            solucaoNormativa: 'Reconstrução total do circuito de segurança: instalação de botão com duplo contato NF de ruptura positiva, relé de segurança dedicado Categoria 4 / PLe e dois contatores de potência em série com monitoramento de contatos espelho (EDM - External Device Monitoring). A máquina agora é incapaz de operar se qualquer contato colar.'
          },
          funcionamento: 'Os relés de segurança utilizam microprocessadores redundantes ou relés mecânicos com contatos solidários (se o contato NA soldar, o contato NF é fisicamente impedido de fechar, acusando falha permanente).',
          aplicacaoMocambique: 'Serralharias de esquadrias, indústrias de moagem e linhas de prensagem em Moçambique sofrem elevados índices de acidentes de trabalho por falta de relés de segurança normatizados em prensas e serras circulares.',
          exemploPratico: 'Esquema de Emergência Categoria 4: [Botão Cogumelo 2 contatos NF] -> [Canais S11-S12 e S21-S22 do Relé de Segurança] -> [Saídas 13-14 e 23-24 acionam as bobinas dos contatores K1 e K2 em série] -> [Contatos auxiliares NF de K1 e K2 em série no laço de realimentação S33-S34 de Reset].',
          calculationSnippet: 'Categoria 4 / PLe | Canal Duplo Redundante | Contatos guiados com monitoramento de solda'
        },
        quiz: {
          question: 'De acordo com a norma internacional ISO 13849-1 e IEC 60204-1 para segurança funcional de máquinas, por que um circuito de Parada de Emergência de Categoria 4 exige a utilização de duplo canal independente com contatos de ruptura positiva em vez de um contato simples?',
          options: [
            { id: 'A', text: 'Para que a máquina funcione com o dobro da velocidade produtiva.', isCorrect: false, feedback: 'Segurança funcional não altera a velocidade produtiva de processo.' },
            { id: 'B', text: 'Para garantir redundância e monitoramento cruzado: se um contato colar, romper ou sofrer curto com a carcaça, o segundo canal abre o circuito com segurança e o sistema impede a religação até o conserto.', isCorrect: true, feedback: 'Correto! A Categoria 4 exige que nenhuma falha isolada leve à perda da função de segurança e que a falha seja imediatamente detectada antes de uma nova partida.' },
            { id: 'C', text: 'Porque botões de emergência de um único canal são proibidos em Moçambique pela alfândega.', isCorrect: false, feedback: 'É uma exigência técnica de integridade de segurança (SIL / PL), não aduaneira.' },
            { id: 'D', text: 'Para alimentar lâmpadas decorativas no painel frontal.', isCorrect: false, feedback: 'Totalmente descabido.' }
          ],
          explanation: 'A Categoria 4 (ISO 13849-1) requer arquitetura tolerante a falhas (duplo canal redundante). Se um dos contatos bolar ou soldar por arco, o outro canal independente interrompe a energia imediatamente. O relé de segurança detecta a discordância entre canais e bloqueia a máquina, exigindo intervenção técnica antes de autorizar qualquer novo reset.',
          keyTakeaway: 'Categoria 4 / PLe: Duplo canal redundante com monitoramento de falha garante parada mesmo se um contato soldar.',
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
      },
      {
        id: 'elec_m6_ec3_barramentos_cobre_esforcos',
        moduleId: 'elec_mod_6_industriais',
        moduleTitle: 'Módulo 6: Instalações Elétricas Industriais & Redes de Potência',
        order: 3,
        code: 'EC 6.3',
        title: 'Barramentos de Cobre: Densidade de Corrente e Esforços de Curto-Circuito',
        norma: 'DIN 43671 / IEC 61439-1',
        level: 'Avançado',
        durationMinutes: 15,
        theory: {
          conceito: 'Em quadros de distribuição geral de baixa tensão (QGBTs) acima de 250A, os cabos são substituídos por barramentos de cobre eletrolítico nu ou pintado. O dimensionamento envolve a densidade de corrente térmica contínua (A/mm²), o efeito pelicular (Skin Effect) em barras paralelas e, fundamentalmente, os suportes isoladores para resistir às forças eletrodinâmicas de repulsão entre barras durante um curto-circuito de pico (Ipk).',
          formulas: [
            { label: 'Densidade de Corrente Empírica', formula: 'J = I / S (A/mm²)', explicacao: 'Típico: 1,5 a 2,0 A/mm² para barras isoladas; até 2,5 A/mm² para barras pintadas foscas' },
            { label: 'Força Eletrodinâmica de Curto (IEC 60865)', formula: 'F = (μ0 / 2π) × (I_pk² / d) × L', explicacao: 'Força mecânica de impacto em Newtons que tenta arrancar e quebrar os isoladores' },
            { label: 'Corrente de Pico de Curto (Ipk)', formula: 'I_pk = k × √2 × I_cw', explicacao: 'k varia de 1,7 a 2,2 conforme a relação R/X do transformador' }
          ],
          pontosOperacionais: [
            'Pintura de barramentos em preto fosco: barras pintadas dissipam até 15% a 20% mais calor por radiação térmica do que barras de cobre nu polido (que têm baixa emissividade).',
            'Espaçamento entre isoladores de barramento: não basta o barramento aguentar a corrente contínua; a distância entre os suportes isoladores de epóxi ou poliamida reforçada deve ser calculada para suportar os impactos mecânicos de curto-circuito (ex: 50 kA de curto gera toneladas de força por metro!).',
            'Torque de aperto em barramentos: conexões parafusadas devem utilizar parafusos de aço 8.8 bicromatizado, arruelas cônicas Belleville de alta pressão e torquímetro calibrado (ex: M10 = 45 Nm, M12 = 75 Nm).',
            'Identificação por cores normatizadas IEC: Fase L1 = Castanho/Marrom; Fase L2 = Preto; Fase L3 = Cinzento; Neutro = Azul-claro; Terra PE = Verde/Amarelo.'
          ],
          fieldCase: {
            localizacao: 'Beira, Província de Sofala',
            cenario: 'Durante um curto-circuito trifásico no motor de um guindaste portuário de 250 kW, o QGBT principal sofreu destruição catastrófica interna: os barramentos de cobre entortaram como arame e os suportes isoladores de resina explodiram em pedaços.',
            diagnostico: 'Os barramentos foram montados com isoladores distanciados a cada 80 cm, sem cálculo dos esforços mecânicos da IEC 60865. A corrente de curto de pico de 65 kA produziu uma força de repulsão de mais de 12.000 N/m, rompendo os isoladores mecânicos.',
            solucaoNormativa: 'Reconstrução do painel com redução do vão entre isoladores para 25 cm, utilização de barras duplas em paralelo com separadores intermediários e isoladores de resina epóxi reforçada com fibra de vidro testados para 70 kA. O painel agora suporta qualquer curto-circuito pleno.'
          },
          funcionamento: 'Pela Lei de Biot-Savart e Força de Lorentz, condutores paralelos percorridos por correntes em sentidos opostos repelem-se com força proporcional ao quadrado da corrente (I²).',
          aplicacaoMocambique: 'Próximo a subestações da EDM de 66/33 kV e grandes transformadores de 1000 kVA a 2500 kVA em indústrias, os níveis de curto-circuito presumido são violentos (35 a 50 kA), tornando o cálculo de suportes de barramento uma questão de vida ou morte.',
          exemploPratico: 'Barra de cobre 50 × 10 mm (seção 500 mm²). Na tabela DIN 43671 para cobre nu a 35°C ambiente com elevação de 30°C: suporta aproximadamente 1020 A contínuos (J ≈ 2,04 A/mm²).',
          calculationSnippet: 'DIN 43671: J ≈ 2 A/mm² | Isoladores calculados para Ipk (IEC 60865) | Torque M10 = 45 Nm'
        },
        quiz: {
          question: 'Em um quadro geral QGBT industrial de 1600 A, por que é tecnicamente recomendado pintar os barramentos de cobre eletrolítico com tinta fosca escura (ou preto fosco) em vez de deixá-los em cobre nu polido?',
          options: [
            { id: 'A', text: 'Porque a cor escura atrai a eletricidade para dentro da barra.', isCorrect: false, feedback: 'Cor física não altera a atração de portadores de carga elétrica.' },
            { id: 'B', text: 'Porque a pintura fosca aumenta significativamente o coeficiente de emissividade térmica (de 0,1 para ~0,9), melhorando a dissipação de calor por radiação e aumentando a capacidade de condução de corrente em até 15-20%.', isCorrect: true, feedback: 'Exato! O cobre polido reflete a radiação térmica (baixa emissividade); a pintura fosca emite calor por infravermelho para o ar muito mais facilmente, permitindo à barra trabalhar mais fria com a mesma corrente.' },
            { id: 'C', text: 'Porque a tinta serve exclusivamente para esconder eventuais rachaduras no metal.', isCorrect: false, feedback: 'Isso seria negligência técnica grave.' },
            { id: 'D', text: 'Porque a tinta reduz a tensão da rede de 400V para 230V.', isCorrect: false, feedback: 'Pintura externa não altera a diferença de potencial elétrico entre fases.' }
          ],
          explanation: 'O cobre nu polido tem um coeficiente de emissividade muito baixo (ε ≈ 0,1 a 0,15), o que significa que ele quase não dissipa calor por radiação. Ao pintar o barramento com tinta fosca (preta, cinza ou das cores de identificação de fase), a emissividade sobe para ε ≈ 0,90 a 0,95. Essa melhoria na emissão térmica por radiação permite elevar a capacidade de condução de corrente contínua da barra em 15% a 20% para a mesma elevação de temperatura limite (DIN 43671).',
          keyTakeaway: 'Pintura fosca no barramento eleva a emissividade (ε ≈ 0,95), aumentando a dissipação térmica em até 20%.',
          xpReward: 50
        }
      },
      {
        id: 'elec_m6_ec4_diagramas_trifilares_bornes',
        moduleId: 'elec_mod_6_industriais',
        moduleTitle: 'Módulo 6: Instalações Elétricas Industriais & Redes de Potência',
        order: 4,
        code: 'EC 6.4',
        title: 'Diagramas Trifilares, Bornes de Passagem Sak e Anilhas IEC 61082',
        norma: 'IEC 61082-1 / IEC 60947-7-1',
        level: 'Intermediário',
        durationMinutes: 15,
        theory: {
          conceito: 'A engenharia de painéis elétricos exige padronização rigorosa da documentação e da fiação interna. Diagramas funcionais e trifilares representam todas as conexões ponto a ponto com identificação unívoca de fios (anilhas numéricas). Bornes de passagem (conhecidos no campo como réguas de bornes SAK ou tipo mola Push-In) formam a interface limpa e organizada entre o cabeamento interno do painel e os cabos externos de campo que vão para os motores e sensores.',
          formulas: [
            { label: 'Identificação de Bornes (IEC 60947-7-1)', formula: '-X1:1, -X1:2, -X1:3...', explicacao: '-X representa régua de bornes; o número após dois-pontos é o borne físico' },
            { label: 'Código de Letras IEC 81346', formula: 'Q = Disjuntor | K = Contator | F = Fusível | T = Trafo', explicacao: 'Padronização internacional de tags de componentes em esquemas elétricos' },
            { label: 'Seção Mínima de Comando', formula: 'S_comando ≥ 0,75 mm² a 1,0 mm²', explicacao: 'Fios flexíveis de cobre classe 5 com terminais ilhós prensados' }
          ],
          pontosOperacionais: [
            'Proibido decapar cabo e apertar condutor multifilar nu direto sob o parafuso do borne: é obrigatório cravar terminal ilhós tubular (ferrule) com alicate de crimpagem catracado hexagonal ou quadrangular.',
            'Separação de canaletas plásticas (ranhuradas): cabos de potência de 400V devem passar em canaletas separadas dos cabos de comando de 24V e sinais analógicos sensíveis para evitar interferência cruzada (Crosstalk).',
            'Numeração de cabos (Anilhamento): cada fio que sai de um borne deve levar uma anilha com o mesmo número impresso na outra extremidade e correspondente à folha e linha do projeto esquemático (ex: 204.3 = folha 2, linha 4, fio 3).',
            'Bornes seccionáveis com faca (-X:F): utilizados em circuitos analógicos de 4-20 mA para permitir abrir o laço e conectar o miliamperímetro sem soltar nenhum parafuso.'
          ],
          fieldCase: {
            localizacao: 'Zimpeto, Maputo',
            cenario: 'Painel de controle de câmaras frigoríficas recém-instalado com 48 motores e válvulas solenoides. Em caso de defeito, os técnicos levavam 4 horas para identificar qual fio correspondia a qual motor.',
            diagnostico: 'O instalador utilizou fios da mesma cor (todos azuis) sem nenhuma anilha de numeração e emendou os cabos no fundo do painel com fita isolante, sem nenhuma régua de bornes de passagem.',
            solucaoNormativa: 'Readequação completa: instalação de trilhos DIN com bornes de passagem tipo Push-In identificados com réguas -X1 (Potência 400V) e -X2 (Comando 24V), terminais ilhós em 100% dos fios e anilhamento térmico impresso ponto a ponto de acordo com as folhas do novo diagrama trifilar. O tempo de diagnóstico de falhas caiu de 4 horas para 10 minutos.'
          },
          funcionamento: 'A documentação estruturada segundo a IEC 61082 organiza o diagrama em folhas numeradas com coordenadas em colunas (1 a 8), permitindo que referências cruzadas indiquem exatamente em qual página cada contato auxiliar de contator ou relé atua.',
          aplicacaoMocambique: 'A rotatividade de equipes técnicas em mineradoras e agroindústrias de Moçambique torna painéis sem anilhas e sem bornes uma fonte crônica de acidentes graves e paradas prolongadas de produção.',
          exemploPratico: 'Leitura de referência cruzada: sob a bobina do contator -K1 na folha 3 coluna 2, há a anotação "4.5 NA / 6.1 NF". Isso indica ao técnico que um contato NA de K1 está na folha 4 coluna 5 e o NF está na folha 6 coluna 1.',
          calculationSnippet: 'IEC 81346: -Q (Disjuntor), -K (Contator), -X (Bornes) | Terminais ilhós obrigatórios'
        },
        quiz: {
          question: 'Em um projeto de montagem e cabeamento de um painel de automação industrial segundo a norma IEC 60947-7-1 e boas práticas internacionais, qual procedimento é considerado mandatório antes de conectar condutores flexíveis de cobre classe 5 nos bornes de passagem?',
          options: [
            { id: 'A', text: 'Soldar as pontas dos fios com estanho e ácido muriático.', isCorrect: false, feedback: 'O estanho escoa plasticamente sob pressão do parafuso (creep), afrouxando a conexão com o tempo!' },
            { id: 'B', text: 'Aplicar e prensar adequadamente terminais tubulares ilhós (ferrules) com alicate de crimpagem apropriado para garantir contato homogêneo e evitar a quebra de filamentos de cobre.', isCorrect: true, feedback: 'Correto! Terminais ilhós evitam a quebra de pernas de cobre, protegem contra mau contato e garantem a segurança de fixação no borne.' },
            { id: 'C', text: 'Cortar metade dos filamentos de cobre se o fio for muito grosso para o borne.', isCorrect: false, feedback: 'Prática inaceitável que causa sobreaquecimento e incêndio!' },
            { id: 'D', text: 'Prender o fio com fita crepe amarela.', isCorrect: false, feedback: 'Totalmente fora de cogitação técnica.' }
          ],
          explanation: 'Cabos flexíveis (classe 5) são formados por dezenas de filamentos finos de cobre. Se inseridos crus sob o aperto mecânico do borne, filamentos rompem-se ou escapam lateralmente, gerando faiscamento e resistência de contato. A aplicação de terminais tubulares do tipo ilhós (ferrules) com alicate de compressão calibrado é obrigatória para assegurar a integridade elétrica e mecânica.',
          keyTakeaway: 'Terminais ilhós tubulares são mandatórios em condutores flexíveis para conexão em bornes.',
          xpReward: 50
        }
      },
      {
        id: 'elec_m6_ec5_grupos_geradores_transferencia_ats',
        moduleId: 'elec_mod_6_industriais',
        moduleTitle: 'Módulo 6: Instalações Elétricas Industriais & Redes de Potência',
        order: 5,
        code: 'EC 6.5',
        title: 'Grupos Geradores a Diesel e Painéis de Transferência Automática (ATS)',
        norma: 'ISO 8528 / IEC 60947-6-1',
        level: 'Avançado',
        durationMinutes: 16,
        theory: {
          conceito: 'Em hospitais, data centers e indústrias onde a interrupção da rede concessionária gera prejuízos incalculáveis ou risco à vida, instalam-se Grupos Geradores de emergência (Gensets) a diesel acoplados a Painéis de Transferência Automática (ATS - Automatic Transfer Switch). O painel monitora a tensão da rede (subtensão, sobretensão, falta de fase) e gerencia o ciclo automático: partida do motor a diesel, confirmação de frequência/tensão e comutação segura da carga com intertravamento mecânico e elétrico absoluto.',
          formulas: [
            { label: 'Potência Aparente do Gerador', formula: 'S_kva = P_kw / cos φ', explicacao: 'Geralmente especificado para cos φ = 0,80 (ex: 200 kW -> 250 kVA)' },
            { label: 'Frequência do Alternador Síncrono', formula: 'f = (p × n) / 120', explicacao: 'Alternador de 4 polos em 50 Hz deve girar rigorosamente a 1500 RPM' },
            { label: 'Tempo Típico de Comutação ATS', formula: 't_total = t_deteccao + t_partida + t_estabilizacao ≈ 10 a 15 segundos', explicacao: 'Tempo até a carga ser re-alimentada pelo gerador após queda da rede' }
          ],
          pontosOperacionais: [
            'REGRA DE SEGURANÇA MÁXIMA - INTERTRAVAMENTO FÍSICO: A chave de transferência Rede/Gerador DEVE possuir intertravamento elétrico (por contatos NF) E intertravamento mecânico rígido (haste de bloqueio mecânico). É terminantemente PROIBIDO que a rede da EDM e o gerador fechem simultaneamente sem sincronizador, pois isso causaria explosão catastrófica do alternador!',
            'Tempo de Arrefecimento (Cool-Down): após o retorno estável da rede da EDM, a carga é re-transferida para a rede imediatamente, mas o motor a diesel DEVE continuar girando em vazio por 3 a 5 minutos para dissipar o calor do turbo e do bloco antes de desligar.',
            'Regulador Automático de Tensão (AVR): placa eletrônica que controla a corrente de excitação no rotor do alternador para manter os 400V fixos mesmo quando cargas pesadas são ligadas.',
            'Carregador de Baterias de Flutuação: montado dentro do painel ATS para manter as baterias de partida do motor diesel 100% carregadas 24 horas por dia.'
          ],
          fieldCase: {
            localizacao: 'Inhambane, Cidade de Inhambane',
            cenario: 'Hospital provincial onde o gerador a diesel de 150 kVA partia quando faltava energia, mas ao transferir a carga a chave comutadora travava no meio, deixando o bloco cirúrgico sem energia elétrica.',
            diagnostico: 'A chave de comutação motorizada estava descalibrada e não possuía intertravamento mecânico confiável; os operadores tentaram acionar a chave com uma alavanca manual enquanto a rede da EDM voltava, gerando um princípio de curto de retorno.',
            solucaoNormativa: 'Instalação de uma chave de transferência automática modular homologada IEC 60947-6-1 de transição aberta com quebra antes do fechamento (Break-Before-Make), com duplo intertravamento mecânico de gaveta e módulo microprocessado com registro de eventos. O sistema passou a transferir em 8 segundos sem falhas.'
          },
          funcionamento: 'Ao faltar energia na rede pública, o relé de supervisão despolariza, enviando sinal de partida remota (Remote Start) ao controlador do gerador. O motor diesel arranca pela bateria, atinge 1500 RPM e 400V, autorizando o contator do gerador a fechar.',
          aplicacaoMocambique: 'Dada a frequência de cortes de energia durante a época chuvosa e ciclones em Moçambique, a manutenção preventiva mensal de grupos geradores (teste semanal sob carga de 30 minutos) é a garantia de sobrevivência de empresas e hospitais.',
          exemploPratico: 'Alternador de 4 polos: rotação necessária para 50 Hz em Moçambique: n = (120 × 50) / 4 = 1500 rpm. Se a rotação cair para 1440 rpm por filtro de combustível entupido, a frequência cai para 48 Hz, afetando computadores e motores.',
          calculationSnippet: 'Intertravamento mecânico + elétrico obrigatório | n = 1500 RPM para 50 Hz | Cool-Down = 3 min'
        },
        quiz: {
          question: 'Em um sistema de emergência com Grupo Gerador a diesel e Painel de Transferência Automática (ATS) segundo a norma IEC 60947-6-1, por que é estritamente obrigatório que a comutação entre a Rede Concessionária (EDM) e o Gerador possua intertravamento mecânico além do elétrico?',
          options: [
            { id: 'A', text: 'Para garantir que o motor do gerador consuma menos combustível.', isCorrect: false, feedback: 'O intertravamento é um dispositivo puramente de segurança e manobra.' },
            { id: 'B', text: 'Para impedir fisicamente e de forma absoluta que as fontes Rede e Gerador fechem simultaneamente em oposição de fase, o que causaria um curto-circuito de retorno devastador com explosão do alternador e risco de eletrocutar técnicos da EDM na linha pública.', isCorrect: true, feedback: 'Correto! O intertravamento mecânico impede fisicamente o fechamento de ambos os contatores ao mesmo tempo, mesmo se uma bobina colar ou o comando eletrônico enlouquecer.' },
            { id: 'C', text: 'Para que a bateria do gerador nunca descarregue.', isCorrect: false, feedback: 'Quem cuida da bateria é o carregador de flutuação.' },
            { id: 'D', text: 'Para transformar corrente alternada em corrente contínua.', isCorrect: false, feedback: 'A chave transfere circuitos AC.' }
          ],
          explanation: 'O intertravamento elétrico (feito por contatos auxiliares) pode falhar se um dos contatores soldar os contatos de potência por arco elétrico. O intertravamento mecânico é uma trava física de aço que impede fisicamente que uma chave feche se a outra estiver fechada. Se as duas fontes fechassem juntas sem sincronismo perfeito, ocorreria um curto-circuito violento de dezenas de milhares de amperes, destruindo os enrolamentos do alternador e injetando tensão de volta na rede desenergizada da concessionária, podendo matar eletricistas da concessionária que trabalham no poste.',
          keyTakeaway: 'Intertravamento mecânico no ATS: Impede curto catastrófico entre a rede pública e o gerador.',
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
      },
      {
        id: 'elec_m7_ec4_analise_qualidade_energia_harmonicos',
        moduleId: 'elec_mod_7_manutencao_ensaios',
        moduleTitle: 'Módulo 7: Manutenção, Inspeção Técnica & Ensaios Normativos',
        order: 4,
        code: 'EC 7.4',
        title: 'Qualidade da Energia: Harmônicos THD, Desbalanço de Tensão e Fator K',
        norma: 'IEC 61000-4-30 / IEEE 519 / IEEE C57.110',
        level: 'Avançado',
        durationMinutes: 16,
        theory: {
          conceito: 'Cargas não lineares (computadores, iluminação LED, inversores VFD, pontes retificadoras) drenam corrente em pulsos, gerando correntes harmônicas de frequências múltiplas da fundamental (150 Hz para 3ª harmônica, 250 Hz para 5ª, 350 Hz para 7ª em rede de 50 Hz). Harmônicas de ordem 3 (triplens: 3ª, 9ª, 15ª) somam-se aritmeticamente no condutor neutro, podendo fazer a corrente de neutro atingir 1,73 a 2 vezes a corrente de fase, incendiando o cabo e superaquecendo transformadores.',
          formulas: [
            { label: 'Distorção Harmônica Total de Tensão (THD-V)', formula: 'THD_v = [√(Σ V_h²) / V_1] × 100%', explicacao: 'Limite normativo IEEE 519 / IEC 61000: THD-V ≤ 5% em baixa tensão (ponto de acoplamento comum)' },
            { label: 'Corrente de Neutro por 3ª Harmônica', formula: 'I_neutro ≈ 3 × I_h3', explicacao: 'As componentes triplens estão em fase no espaço temporal e somam-se diretamente no neutro' },
            { label: 'Fator K de Transformador (K-Factor)', formula: 'K = Σ [I_h² × h²] / Σ I_h²', explicacao: 'Mede a capacidade térmica do trafo de suportar correntes parasitas por harmônicas (K-4, K-13, K-20)' }
          ],
          pontosOperacionais: [
            'Em edifícios comerciais com maciça carga de TI e informática: o condutor de Neutro NUNCA deve ser reduzido; a norma prescreve neutro com o DOBRO da seção da fase (200% da fase) para evitar incêndio por sobreaquecimento de 3ª harmônica.',
            'Uso obrigatório de alicates amperímetros TRUE RMS: instrumentos comuns que medem valor médio calibrado em senoide pura erram em até 40% para baixo ao medir correntes distorcidas por fontes chaveadas.',
            'Filtros Ativos de Harmônicos (AHF): injetam correntes em contrafase em tempo real (cancelamento ativo), reduzindo o THD-I de 45% para menos de 3% no barramento.',
            'Transformadores fator K (K-Rated): possuem blindagem eletrostática entre primário e secundário e enrolamentos com condutores paralelos transpostos para minimizar perdas por efeito pelicular em alta frequência.'
          ],
          fieldCase: {
            localizacao: 'Polana Cimento, Maputo',
            cenario: 'Edifício de escritórios corporativos onde o disjuntor geral trifásico de 400A nunca desarmava, mas o barramento de neutro do QGBT derreteu o isolador e pegou fogo.',
            diagnostico: 'Com analisador de qualidade de energia classe A (IEC 61000-4-30), constatou-se correntes de fase de 220A por fase (cargas de TI equilibradas), mas a corrente medida no Neutro era de 345 Amperes! Análise espectral revelou 82% de 3ª harmônica gerada por centenas de computadores com fontes sem PFC.',
            solucaoNormativa: 'Substituição do barramento e cabo de neutro por condutor duplo de 240 mm² (capacidade de 500A) e instalação de um Filtro Ativo de Harmônicos (AHF) de 150A na entrada. A corrente no neutro caiu de 345A para 28A.'
          },
          funcionamento: 'Harmônicas aumentam as perdas no ferro por histerese (proporcional à frequência f) e por correntes parasitas de Foucault (proporcionais ao quadrado da frequência f²), provocando superaquecimento rápido em transformadores comuns.',
          aplicacaoMocambique: 'Bancos, empresas de telecomunicações e data centers em Moçambique sofrem queima prematura de transformadores a óleo quando operam com cargas eletrônicas pesadas sem trafos classificados K-13.',
          exemploPratico: 'Num circuito com 100A de corrente fundamental (50 Hz) e 30A de 3ª harmônica (150 Hz): THD-I = (30 / 100) × 100% = 30%. Corrente RMS real medida por multímetro True RMS: I_rms = √(100² + 30²) = 104,4 A.',
          calculationSnippet: 'IEEE 519: THD-V ≤ 5% | 3ª harmônica soma no Neutro: I_N ≈ 3 × Ih3 | True RMS obrigatório'
        },
        quiz: {
          question: 'Em uma instalação comercial moderna com alta densidade de computadores e servidores (cargas não lineares monofásicas com fontes comutadas), por que a corrente elétrica medida no condutor de Neutro pode ser superior à corrente medida nos condutores de Fase, mesmo com as três fases perfeitamente equilibradas?',
          options: [
            { id: 'A', text: 'Porque as correntes harmônicas de ordem 3 e seus múltiplos ímpares (3ª, 9ª, 15ª harmônicas - Triplens) estão em fase entre si nas três linhas e somam-se aritmeticamente no condutor neutro em vez de se cancelarem.', isCorrect: true, feedback: 'Correto! As harmônicas de ordem 3 (150 Hz) possuem sequência zero: elas não defasam em 120° como a fundamental, somando-se diretamente no neutro (I_N ≈ 3 × I_h3).' },
            { id: 'B', text: 'Porque o neutro conduz eletricidade estática acumulada no carpete.', isCorrect: false, feedback: 'Eletricidade estática é de pico e não corrente RMS contínua.' },
            { id: 'C', text: 'Porque o transformador da EDM inverte a polaridade a cada 10 minutos.', isCorrect: false, feedback: 'Redes de distribuição não invertem polaridade de operação.' },
            { id: 'D', text: 'Porque a impedância do aterramento puxa a tensão do neutro para cima.', isCorrect: false, feedback: 'Não explica a soma de correntes no neutro com fases equilibradas.' }
          ],
          explanation: 'Em sistemas trifásicos senoidais puros e equilibrados (50 Hz), as correntes de fase defasam-se em 120° e a soma vetorial no neutro é rigorosamente ZERO. Porém, para as harmônicas de ordem 3 (150 Hz) e seus múltiplos ímpares (denominadas harmônicas triplens ou de sequência zero), a defasagem entre fases é 3 × 120° = 360° = 0° (em fase!). Portanto, elas não se anulam: as componentes de 150 Hz das três fases somam-se diretamente no condutor neutro, podendo fazer a corrente de neutro atingir até 173% da corrente de fase.',
          keyTakeaway: 'Harmônicas de 3ª ordem (Triplens) somam-se no Neutro, exigindo neutro sobredimensionado (200%).',
          xpReward: 50
        }
      },
      {
        id: 'elec_m7_ec5_bloqueio_loto_cinco_regras_ouro',
        moduleId: 'elec_mod_7_manutencao_ensaios',
        moduleTitle: 'Módulo 7: Manutenção, Inspeção Técnica & Ensaios Normativos',
        order: 5,
        code: 'EC 7.5',
        title: 'Procedimento LOTO (Lockout/Tagout) e as 5 Regras de Ouro da Eletricidade',
        norma: 'EN 50110-1 / OSHA 1910.147 / IEC 60364',
        level: 'Intermediário',
        durationMinutes: 15,
        theory: {
          conceito: 'O trabalho em instalações elétricas desenergizadas é o método prioritário e mais seguro de manutenção. Para que um circuito seja considerado legalmente e tecnicamente "desenergizado" (e não apenas desligado), é obrigatório cumprir em ordem sequencial estrita as Cinco Regras de Ouro da Segurança Elétrica e aplicar o procedimento LOTO (Lockout / Tagout: Bloqueio Mecânico por Cadeado, Etiquetagem e Travamento).',
          formulas: [
            { label: 'As 5 Regras de Ouro (Sequência Obrigatória)', formula: '1. Seccionar | 2. Bloquear (LOTO) | 3. Constatar Ausência de Tensão | 4. Aterrar e Curto-circuitar | 5. Sinalizar a Zona', explicacao: 'Procedimento internacional rígido da EN 50110-1 para liberação de intervenção' },
            { label: 'Teste de Ausência de Tensão (Método 3 Pontos)', formula: 'Testar no Vivo -> Testar no Desligado -> Re-testar no Vivo', explicacao: 'Valida se o próprio detector de tensão ou voltímetro não está quebrado antes de confiar nele' },
            { label: 'Cadeado Pessoal LOTO', formula: '1 Homem = 1 Chave = 1 Cadeado', explicacao: 'Proibido chave-mestra compartilhada; cada técnico é dono exclusivo do seu cadeado' }
          ],
          pontosOperacionais: [
            'REGRA CRÍTICA - TESTE DE AUSÊNCIA DE TENSÃO: NUNCA confie apenas em chaves seccionadoras abertas ou em leds apagados no painel. É obrigatório utilizar detector de tensão sonoro/luminoso aprovado e calibrado, testando fase-fase e fase-terra.',
            'O teste dos 3 pontos do voltímetro: 1) Testa em um ponto sabidamente energizado (para ver se o voltímetro apita); 2) Testa nos condutores onde você vai trabalhar (deve dar zero volts); 3) Volta a testar no ponto energizado para garantir que o aparelho não quebrou nem a bateria acabou durante o teste!',
            'Aterramento temporário e curto-circuitamento: caso alguém ligue a energia por engano ou ocorra indução de linha aérea próxima, o aterramento temporário escoa a corrente para a terra e força o desarme instantâneo da proteção a montante sem atingir o operador.',
            'Garras de bloqueio múltiplo (Hasps): se 4 técnicos estão trabalhando na mesma máquina, a garra recebe 4 cadeados. O circuito só pode ser religado quando o último trabalhador retirar o seu cadeado pessoal.'
          ],
          fieldCase: {
            localizacao: 'Marracuene, Maputo',
            cenario: 'Técnico de manutenção realizava substituição de contator de uma esteira industrial desligada no botão frontal da máquina. Um colega de trabalho passou pelo painel geral, achou que o disjuntor caiu por acidente e religou a chave geral, eletrocutando o técnico que sofreu queimaduras graves por arco elétrico de 400V.',
            diagnostico: 'Não foi aplicado o procedimento LOTO. O técnico confiou em um comando de desligamento funcional (botão de stop) em vez de seccionar a fonte principal com cadeado mecânico pessoal e cartão de advertência.',
            solucaoNormativa: 'Implementação de política rígida de LOTO na fábrica: aquisição de estações de bloqueio com cadeados vermelhos individuais numerados, garras de bloqueio de 6 furos e treinamento prático obrigatório nas 5 Regras de Ouro com emissão de Permissão de Trabalho (PT).'
          },
          funcionamento: 'O bloqueio físico impede qualquer acionamento acidental humano ou religamento remoto por sistema supervisório ou desarme de temporizador automático.',
          aplicacaoMocambique: 'As normas de segurança do Ministério do Trabalho e da EDM em Moçambique exigem aplicação estrita das 5 Regras de Ouro para intervenções em quadros de distribuição e linhas aéreas.',
          exemploPratico: 'Sequência prática: 1) Abrir disjuntor geral -Q1; 2) Travar alavanca com garra e cadeado LOTO pessoal; 3) Testar com voltímetro nas 3 fases (0,0V); 4) Instalar conjunto de aterramento temporário trifásico em curto com o barramento PE; 5) Colocar fita zebrada e cone com etiqueta "HOMENS A TRABALHAR".',
          calculationSnippet: '5 Regras de Ouro: Seccionar -> Bloquear -> Verificar Ausência -> Aterrar -> Sinalizar'
        },
        quiz: {
          question: 'Segundo a norma internacional de segurança elétrica EN 50110-1 e os procedimentos de LOTO (Lockout/Tagout), qual é a sequência correta e mandatória das "Cinco Regras de Ouro" para garantir a desenergização segura antes de qualquer intervenção em instalações elétricas?',
          options: [
            { id: 'A', text: '1. Desligar o interruptor de parede; 2. Tocar rapidamente no fio com as costas da mão; 3. Começar a trabalhar.', isCorrect: false, feedback: 'Tocar no fio para testar é uma prática suicida que causa mortes por choque elétrico!' },
            { id: 'B', text: '1. Seccionar completamente todas as fontes; 2. Bloquear e travar contra religação intempestiva (LOTO); 3. Constatar a ausência de tensão com instrumento testado; 4. Aterrar e colocar em curto-circuito as fases; 5. Delimitar e sinalizar a zona de trabalho.', isCorrect: true, feedback: 'Perfeito! Esta é a sequência exata e consagrada mundialmente pelas 5 Regras de Ouro da Segurança Elétrica.' },
            { id: 'C', text: '1. Colocar o cadeado; 2. Ligar a máquina para testar; 3. Tirar o cadeado; 4. Cortar os cabos com alicate; 5. Avisar o supervisor.', isCorrect: false, feedback: 'Total inversão de etapas que causaria acidentes fatais.' },
            { id: 'D', text: '1. Usar luvas de couro comuns; 2. Trabalhar com a linha energizada para economizar tempo.', isCorrect: false, feedback: 'Trabalho desenergizado é a prioridade normativa absoluta.' }
          ],
          explanation: 'As Cinco Regras de Ouro (EN 50110-1 / NR-10) estabelecem a sequência rigorosa de vida para o eletrotécnico: 1) Seccionamento visível; 2) Impedimento de reenergização mecânico por bloqueio (LOTO); 3) Constatação da ausência de tensão através do teste de 3 pontos; 4) Instalação de aterramento temporário e curto-circuitamento de condutores ativos; 5) Proteção dos elementos sob tensão vizinhos e sinalização clara da zona de trabalho.',
          keyTakeaway: '5 Regras de Ouro da Segurança Elétrica salvam vidas: Seccionar, Bloquear, Verificar Tensão, Aterrar e Sinalizar.',
          xpReward: 50
        }
      }
    ]
  }
];
