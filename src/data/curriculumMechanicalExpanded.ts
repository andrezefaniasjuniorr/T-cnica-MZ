import { AcademyLesson } from '../types/academy';

// ============================================================================
// LIÇÕES EXPANDIDAS DE MECÂNICA INDUSTRIAL (PADRÃO EUROPEU EN / ISO)
// Módulo 1: Fundamentos, Metrologia, Elementos de Fixação e Rolamentos
// Módulo 2: Pneumática Industrial, Válvulas 5/2, Redes e Segurança
// Módulo 3: Hidráulica Industrial, Válvulas de Pressão, Acumuladores e Vedações
// Módulo 4: Preditiva, Demodulação de Rolamentos, Alinhamento a Laser e Análise de Óleo
// ============================================================================

export const MECHANICAL_EXPANDED_LESSONS: Record<string, AcademyLesson[]> = {
  // --------------------------------------------------------------------------
  // MÓDULO 1: FUNDAMENTOS & AJUSTES
  // --------------------------------------------------------------------------
  mec_mod_1_fundamentos: [
    {
      id: 'mec_m1_l2_metrologia_precisao',
      moduleId: 'mec_mod_1_fundamentos',
      moduleTitle: 'Módulo 1: Fundamentos de Mecânica Industrial & Ajustes',
      order: 2,
      code: 'MC 1.2',
      title: 'Metrologia Dimensional de Precisão: Micrômetros, Súbitos e Relógios',
      norma: 'ISO 3611 / DIN 878 / DIN 863',
      level: 'Intermediário',
      durationMinutes: 14,
      theory: {
        conceito: 'A metrologia mecânica de precisão assegura que as medidas de eixos, cilindros e alojamentos respeitem as tolerâncias micrométricas de projeto. O micrômetro externo com resolução de 0,01 mm (ou 0,001 mm digital), o micrômetro interno de três pontas e o súbito comparador interno são as ferramentas essenciais para identificar ovalização, conicidade e desvios de diâmetro.',
        formulas: [
          { label: 'Passo do Fuso Micrométrico', formula: 'P = 0,5 mm por volta (50 divisões = 0,01 mm/div)', explicacao: 'Resolução padrão do tambor micrométrico' },
          { label: 'Dilatação Térmica Linear', formula: 'ΔL = L0 × α × ΔT', explicacao: 'Aço carbono: α ≈ 11,5 × 10⁻⁶ /°C (peça quente mede maior que fria)' },
          { label: 'Ovalização Geométrica', formula: 'Oval = D_max - D_min na mesma seção transversal', explicacao: 'Diferença entre duas medições perpendiculares a 90°' }
        ],
        pontosOperacionais: [
          'Temperatura padrão de referência metrológica: todas as medições de precisão devem ser feitas a 20°C (ISO 1). Peças recém-saídas do torno a 60°C estão dilatadas e encolherão após esfriar!',
          'A catraca do micrômetro deve dar sempre 3 a 5 cliques para exercer a pressão de contato constante e padronizada (5 a 10 N). Apertar forçando o tambor sem a catraca deforma o arco em até 0,02 mm.',
          'Uso do súbito: calibrar o relógio comparador com bloco padrão em anel micrométrico antes de introduzir no cilindro para medir conicidade e conicidade.',
          'Evitar erro de paralaxe: alinhar os olhos perpendicularmente à escala graduada analógica.'
        ],
        fieldCase: {
          localizacao: 'Matola, Província de Maputo',
          cenario: 'Oficina de retífica de motores marítimos com queima repetida de anéis de pistão após 100 horas de funcionamento em rebocador portuário.',
          diagnostico: 'A medição dos cilindros com súbito comparador revelou conicidade de 0,07 mm e ovalização de 0,05 mm no terço superior da camisa, causada por desgaste por atrito e retífica mal calibrada.',
          solucaoNormativa: 'Brunimento cruzado com brunidor automático a 45° respeitando a tolerância cilíndrica IT6 da norma DIN 878. A queima de óleo e os travamentos foram totalmente eliminados.'
        },
        funcionamento: 'O súbito transfere o desvio mecânico radial de um pino apalpador interno através de uma haste de alavanca para a haste móvel do relógio comparador analógico ou digital.',
        aplicacaoMocambique: 'Em Moçambique, oficinas frequentemente medem camisas de cilindro com paquímetros comuns. O paquímetro não tem alcance nem pontas esféricas para medir ovalização profunda, gerando diagnósticos errôneos.',
        exemploPratico: 'Medição de eixo de 60 mm: temperatura ambiente de 35°C em Tete. Eixo medido a 60,012 mm a quente terá dimensão real de 60,002 mm a 20°C (contração de 10 μm).',
        calculationSnippet: 'ΔL = L0 × α × ΔT | Resolução = 0,01 mm | Calibração padrão a 20°C'
      },
      quiz: {
        question: 'Ao medir com micrômetro o diâmetro de um eixo de precisão para rolamento recém-usinado que ainda está aquecido a 55°C após o passe de acabamento, qual fenômeno físico distorcerá a medição se o técnico não aguardar o resfriamento?',
        options: [
          { id: 'A', text: 'O eixo apresentará leitura menor do que a real devido à perda de densidade.', isCorrect: false, feedback: 'Dilatação térmica expande o material, fazendo-o medir MAIOR a quente.' },
          { id: 'B', text: 'O eixo apresentará diâmetro medido maior devido à dilatação térmica linear; após resfriar a 20°C, a peça encolherá e ficará abaixo da tolerância especificada.', isCorrect: true, feedback: 'Correto! Aço expande 11,5 μm/m/°C. A 55°C (ΔT = 35°C), uma peça de 100 mm mede 40 μm maior. Ao esfriar, fica frouxa no rolamento.' },
          { id: 'C', text: 'O micrômetro perderá a calibração magnética permanente.', isCorrect: false, feedback: 'Micrômetros mecânicos comuns não usam calibração magnética.' },
          { id: 'D', text: 'O aquecimento reduz o passo da rosca micrométrica para zero.', isCorrect: false, feedback: 'Afirmação sem base física.' }
        ],
        explanation: 'A norma metrológica ISO 1 define 20°C como a temperatura padrão de calibração e medição. Peças de aço aquecidas por usinagem expandem por dilatação térmica (ΔL = L0 × α × ΔT). Medir a quente resulta em usinagem excessiva; ao esfriar, o diâmetro encolhe e fica abaixo da tolerância permitida.',
        keyTakeaway: 'Sempre aguarde a peça atingir o equilíbrio térmico a 20°C antes da medição final com micrômetro.',
        xpReward: 50
      }
    },
    {
      id: 'mec_m1_l3_elementos_fixacao_torque',
      moduleId: 'mec_mod_1_fundamentos',
      moduleTitle: 'Módulo 1: Fundamentos de Mecânica Industrial & Ajustes',
      order: 3,
      code: 'MC 1.3',
      title: 'Elementos de Fixação Roscada: Classes 8.8, 10.9, 12.9 e Torque de Aperto',
      norma: 'ISO 898-1 / VDI 2230 / ISO 6789',
      level: 'Avançado',
      durationMinutes: 15,
      theory: {
        conceito: 'Parafusos industriais de alta resistência são projetados para atuar como molas elásticas sob tração que geram a força de fechamento (pré-carga F_M) necessária para impedir o deslizamento e a fadiga das peças unidas. A classe de resistência gravada na cabeça do parafuso (ex: 8.8, 10.9, 12.9) indica a resistência à tração e o limite de escoamento do aço.',
        formulas: [
          { label: 'Classe de Resistência (ex: 8.8)', formula: 'R_m = 8 × 100 = 800 N/mm² | R_e = 800 × 0,8 = 640 N/mm²', explicacao: '1º dígito × 100 = tração máxima; 2º dígito × 1º = escoamento' },
          { label: 'Classe 10.9 (Alta Resistência)', formula: 'R_m = 1000 N/mm² | R_e = 900 N/mm²', explicacao: 'Aço ligado temperado para motores, cabeçotes e flanges sob alta pressão' },
          { label: 'Cálculo de Torque de Aperto', formula: 'M_A = k × d × F_M', explicacao: 'k = fator de atrito (≈ 0,14 seco / 0,10 oleado); d = diâmetro nominal; F_M = força de pré-carga' }
        ],
        pontosOperacionais: [
          'Nunca aperte parafusos estruturais ou de flanges "no tato" com alavanca ou tubo extensor! O aperto excessivo atinge a zona plástica do parafuso, provocando escoamento e ruptura catastrófica.',
          'Sempre utilize chave dinamométrica (torquímetro) calibrada segundo a ISO 6789, aplicando o torque com movimento suave e contínuo até o estalo característico.',
          'Padrão de aperto em cruz (estrela) em flanges e mancais: aperte primeiro a 30%, depois a 70% e finalmente a 100% do torque nominal especificado.',
          'Lubrificação da rosca: se a especificação de fábrica pede rosca oleada (k = 0,10) e você monta a seco (k = 0,15), até 50% do torque aplicado é perdido em atrito, deixando o parafuso frouxo sob carga dinâmica.'
        ],
        fieldCase: {
          localizacao: 'Moatize, Província de Tete',
          cenario: 'Caminhão basculante de mineração de 240 toneladas com quebra recorrente dos parafusos de fixação da coroa do diferencial após troca de óleo.',
          diagnostico: 'Os mecânicos utilizaram chave de impacto pneumática sem controle de torque e reutilizaram parafusos classe 10.9 que já haviam sofrido estiramento plástico além do limite de escoamento.',
          solucaoNormativa: 'Substituição por parafusos originais novos classe 12.9, limpeza das roscas com solvente, aplicação de trava química de média resistência e aperto com torquímetro em 3 etapas sequenciais em padrão cruzado a 380 Nm. Falhas zeradas.'
        },
        funcionamento: 'A pré-carga elástica mantém as superfícies em contato sob compressão. Quando a carga externa atua, ela descarrega a compressão da junta antes de aumentar a tração no parafuso, protegendo-o da fadiga cíclica.',
        aplicacaoMocambique: 'A vibração contínua em pistas não pavimentadas e britadeiras no norte de Moçambique solta conexões roscadas sem pré-carga correta. O uso de torquímetro e arruelas de segurança Nord-Lock é indispensável.',
        exemploPratico: 'Parafuso M16 Classe 8.8 (seção resistente As = 157 mm²): Limite de escoamento Re = 640 N/mm². Força de aperto admissível a 90%: FM = 0,9 × 640 × 157 = 90,4 kN. Torque nominal com lubrificação: aprox. 175 Nm.',
        calculationSnippet: 'Classe 8.8: Rm = 800, Re = 640 N/mm² | MA = k · d · FM | Aperto cruzado com torquímetro'
      },
      quiz: {
        question: 'O que significam exatamente os números gravados na cabeça de um parafuso sextavado industrial marcado como "10.9" segundo a norma internacional ISO 898-1?',
        options: [
          { id: 'A', text: 'Diâmetro nominal de 10 mm e comprimento útil de 90 mm.', isCorrect: false, feedback: 'As dimensões métricas são identificadas por M e medição direta, não pela marcação da cabeça.' },
          { id: 'B', text: 'Resistência mínima à tração de 1000 N/mm² e limite de escoamento de 900 N/mm² (90% da resistência à tração).', isCorrect: true, feedback: 'Exato! 10 × 100 = 1000 N/mm² (tração máxima); 0,9 × 1000 = 900 N/mm² (limite de escoamento antes da deformação permanente).' },
          { id: 'C', text: 'Torque de aperto recomendado de 109 Nm.', isCorrect: false, feedback: 'O torque depende do diâmetro e fator de atrito, não apenas do material.' },
          { id: 'D', text: 'Grau de proteção contra ferrugem de 10 anos em ambiente grau 9.', isCorrect: false, feedback: 'A marcação da classe de resistência define propriedades mecânicas, não químicas.' }
        ],
        explanation: 'Segundo a ISO 898-1, o primeiro número multiplicado por 100 indica a resistência mínima à tração (10 × 100 = 1000 N/mm²). O segundo número indica a relação decimal entre o limite de escoamento e a resistência à tração (0,9 × 1000 = 900 N/mm²). Acima de 900 N/mm², o parafuso deforma plasticamente e perde a função elástica.',
        keyTakeaway: 'ISO 898-1: Classe 10.9 = 1000 N/mm² de tração e 900 N/mm² de escoamento elástico.',
        xpReward: 50
      }
    },
    {
      id: 'mec_m1_l4_rolamentos_montagem_lubrificacao',
      moduleId: 'mec_mod_1_fundamentos',
      moduleTitle: 'Módulo 1: Fundamentos de Mecânica Industrial & Ajustes',
      order: 4,
      code: 'MC 1.4',
      title: 'Montagem, Folgas Radiais (C3/C4) e Lubrificação de Rolamentos',
      norma: 'ISO 15243 / DIN 620 / ISO 281',
      level: 'Avançado',
      durationMinutes: 15,
      theory: {
        conceito: 'Rolamentos industriais transmitem cargas radiais e axiais com atrito mínimo através de corpos rolantes (esferas ou rolos cilíndricos/cônicos). Mais de 50% das falhas prematuras de rolamentos são causadas por montagem incorreta (impactos diretos na pista), lubrificação inadequada ou seleção errada da folga interna radial (Normal, C3, C4).',
        formulas: [
          { label: 'Folga Interna C3', formula: 'C3 > Folga Normal (CN)', explicacao: 'Folga maior para compensar dilatação térmica do anel interno quente' },
          { label: 'Aquecimento por Indução Seguro', formula: 'T_max ≤ 110 °C a 120 °C', explicacao: 'Acima de 125°C o aço sofre revenimento e perde dureza superficial HRC' },
          { label: 'Volume de Graxa para Relubrificação', formula: 'G = 0,005 × D × B (gramas)', explicacao: 'D = diâmetro externo (mm); B = largura do rolamento (mm)' }
        ],
        pontosOperacionais: [
          'Quando utilizar rolamento C3? Obrigatório em motores elétricos, redutores e bombas onde o anel interno aquece mais que o externo. Se usar folga Normal, a dilatação do anel interno elimina a folga e esmaga as esferas!',
          'Montagem por calor: utilize sempre aquecedor por indução desmagnetizador. NUNCA utilize maçarico a gás (aquece desigualmente e destrói as vedações) nem banho de óleo sujo.',
          'Nunca aplique força de montagem transmitida através dos corpos rolantes: para montar no eixo, apoie a bucha na pista interna; para montar na carcaça, apoie na pista externa.',
          'Excesso de graxa mata o rolamento: encher a carcaça a 100% de graxa provoca atrito fluido viscoso e superaquecimento rápido (mais de 90°C).'
        ],
        fieldCase: {
          localizacao: 'Nacala, Província de Nampula',
          cenario: 'Motor elétrico trifásico de 110 kW acionando moinho de cimento com travamento do rolamento dianteiro a cada 3 semanas com temperatura atingindo 105°C.',
          diagnostico: 'A equipe de manutenção estava instalando rolamentos comuns 6316 com folga Normal (CN) e enchendo completamente a cavidade da tampa com graxa até vazar. A dilatação do eixo aquecido travou a pista interna contra as esferas.',
          solucaoNormativa: 'Substituição por rolamento SKF 6316/C3 com folga ampliada, cálculo do volume exato de graxa de poliureia (G = 0,005 × 170 × 39 = 33 gramas) preenchendo apenas 30% do espaço livre. A temperatura estabilizou em 62°C.'
        },
        funcionamento: 'A película elastohidrodinâmica (EHL) de óleo ou graxa separa os corpos rolantes das pistas com uma espessura de filme microscópica de 0,1 a 1 μm sob pressões locais de até 30.000 bar.',
        aplicacaoMocambique: 'A poeira de carvão em Tete e a umidade salina no Porto de Maputo exigem rolamentos blindados com retentores tipo labirinto taconite e graxas especiais à base de sulfonato de cálcio ou complexo de lítio.',
        exemploPratico: 'Rolamento 6210 (D = 90 mm, B = 20 mm): Quantidade de graxa para lubrificação periódica: G = 0,005 × 90 × 20 = 9 gramas aplicados com engraxadeira calibrada.',
        calculationSnippet: 'G = 0,005 · D · B | C3 para motores térmicos | Aquecimento máx 110°C com desmagnetização'
      },
      quiz: {
        question: 'Em um motor elétrico industrial de alta rotação (3000 RPM / 2 polos) acoplado a uma bomba de água quente, por que a engenharia de manutenção prescreve obrigatoriamente rolamentos com folga interna radial classe C3 em vez de folga Normal?',
        options: [
          { id: 'A', text: 'Porque a folga C3 permite que o eixo gire mais rápido sem precisar de eletricidade.', isCorrect: false, feedback: 'A velocidade do motor é determinada pelos polos magnéticos e frequência da rede.' },
          { id: 'B', text: 'Porque o calor transmitido pelo eixo expande o anel interno do rolamento; a folga C3 compensa essa expansão térmica sem travar os corpos rolantes.', isCorrect: true, feedback: 'Correto! O anel interno aquece mais que o externo. A folga C3 absorve o crescimento dimensional mantendo a folga de trabalho operacional ideal.' },
          { id: 'C', text: 'Porque rolamentos C3 dispensam o uso de graxa lubrificante.', isCorrect: false, feedback: 'Todo rolamento de motor requer lubrificação periódica rigorosa.' },
          { id: 'D', text: 'Porque a folga C3 é menor e impede qualquer vibração mecânica.', isCorrect: false, feedback: 'C3 é MAIOR que a folga normal, não menor.' }
        ],
        explanation: 'A classe de folga C3 possui folga interna radial maior que a Normal (ISO 5753). Em motores elétricos, o rotor e o eixo aquecem significativamente durante a operação, fazendo o anel interno dilatar mais do que o anel externo. A folga C3 garante que, após a dilatação térmica, o rolamento opere com folga residual positiva sem pré-carga destrutiva.',
        keyTakeaway: 'Folga C3: Essencial em motores e máquinas térmicas para compensar a dilatação do anel interno quente.',
        xpReward: 50
      }
    }
  ],

  // --------------------------------------------------------------------------
  // MÓDULO 2: PNEUMÁTICA INDUSTRIAL & REDES
  // --------------------------------------------------------------------------
  mec_mod_2_pneumatica: [
    {
      id: 'mec_m2_l2_valvulas_direcionais',
      moduleId: 'mec_mod_2_pneumatica',
      moduleTitle: 'Módulo 2: Pneumática Industrial & Tratamento de Ar',
      order: 2,
      code: 'MC 2.2',
      title: 'Válvulas Direcionais 3/2, 5/2 e 5/3 Vias (Centros Aberto e Fechado)',
      norma: 'ISO 5599-1 / ISO 1219-1',
      level: 'Intermediário',
      durationMinutes: 15,
      theory: {
        conceito: 'Válvulas direcionais controlam a passagem, bloqueio e direção do fluxo de ar comprimido para comandar atuadores pneumáticos. A identificação normalizada é expressa por [Número de Vias / Número de Posições]. Conexões ISO normalizadas: 1 = Alimentação de Pressão; 2 e 4 = Vias de Trabalho dos Atuadores; 3 e 5 = Escapes para atmosfera.',
        formulas: [
          { label: 'Válvula 5/2 Vias', formula: '5 Vias (1, 2, 4, 3, 5) / 2 Posições', explicacao: 'Comando padrão de cilindros de dupla ação (avanço e recuo)' },
          { label: 'Válvula 5/3 Centro Fechado (CC)', formula: 'Todas as vias bloqueadas no centro', explicacao: 'Trava o cilindro em posição intermediária (retém pressão em ambas as câmaras)' },
          { label: 'Válvula 5/3 Centro Aberto ao Escape (COE)', formula: 'Vias 2 e 4 despressurizadas no centro', explicacao: 'Cilindro fica livre e solto para movimentação manual segura em paradas' }
        ],
        pontosOperacionais: [
          'Válvula 5/2 monoestável (retorno por mola): ao faltar energia na bobina solenoide, o cilindro recua imediatamente para a posição de repouso por segurança.',
          'Válvula 5/2 biestável (duplo solenoide): memoriza a última posição de comando mesmo na perda de energia elétrica, exigindo pulso de sentido oposto para comutar.',
          'Escape com silenciadores de bronze sinterizado: silenciadores entupidos com óleo velho e poeira aumentam a contrapressão no escape e reduzem a velocidade do cilindro em até 70%.',
          'Alimentação de solenoide: solenoides de 24 Vcc com diodo de supressão de surto (flyback) protegem os transistores de saída dos PLCs.'
        ],
        fieldCase: {
          localizacao: 'Beira, Província de Sofala',
          cenario: 'Máquina automática de envase de cerveja parando com falha de posicionamento intermitente no cilindro dosador principal.',
          diagnostico: 'A válvula 5/2 estava com o carretel travando por oxidação de alumínio gerada por condensação de água no ar e o silenciador da porta de escape 3 estava completamente obstruído por graxa preta.',
          solucaoNormativa: 'Limpeza e troca dos silenciadores por modelos de fluxo livre, instalação de dreno eletrônico no ramal e substituição da válvula por modelo ISO 5599 com vedação em carretel de cerâmica autolimpante.'
        },
        funcionamento: 'A energização da bobina solenoide desloca a armadura magnética móvel que abre um canal piloto de ar interno, empurrando o carretel principal para alternar as câmaras do cilindro.',
        aplicacaoMocambique: 'A maresia costeira na Beira e Maputo corrói molas de retorno de válvulas pneumáticas de baixa qualidade. O uso de válvulas com corpo em polímero técnico e molas de aço inox AISI 316 é altamente recomendado.',
        exemploPratico: 'Ligação de cilindro dupla ação em válvula 5/2: Conexão 1 -> Rede FRL 6 bar; Conexão 4 -> Câmara traseira (avanço); Conexão 2 -> Câmara dianteira (recuo); Portas 3 e 5 -> Silenciadores de escape.',
        calculationSnippet: 'Conexões ISO: 1=P, 2/4=Trabalho, 3/5=Escape | 5/2 = Dupla ação | Centro Fechado trava'
      },
      quiz: {
        question: 'Em uma célula de montagem robotizada, necessita-se de um circuito pneumático para um cilindro de dupla ação que, em caso de parada de emergência ou desenergização do comando elétrico, deve travar mecanicamente a haste exatamente na posição intermediária em que estiver. Qual configuração de válvula direcional atende a essa exigência normativa?',
        options: [
          { id: 'A', text: 'Válvula 3/2 normalmente aberta simples.', isCorrect: false, feedback: 'Válvulas 3/2 são exclusivas para cilindros de simples ação.' },
          { id: 'B', text: 'Válvula 5/3 vias com Centro Fechado (Closed Center).', isCorrect: true, feedback: 'Correto! A válvula 5/3 Centro Fechado bloqueia as conexões 2 e 4, aprisionando o ar em ambas as câmaras e travando a haste do cilindro no ponto em que estiver.' },
          { id: 'C', text: 'Válvula 5/2 monoestável sem mola de retorno.', isCorrect: false, feedback: 'Monoestável recua automaticamente ao faltar energia, não travando no ponto intermediário.' },
          { id: 'D', text: 'Válvula reguladora de fluxo unidirecional comum sem retorno.', isCorrect: false, feedback: 'Reguladora de fluxo apenas ajusta a velocidade, não a direção nem o travamento.' }
        ],
        explanation: 'A válvula direcional 5/3 vias com Centro Fechado (Closed Center) possui três posições: avanço, recuo e uma posição central neutra onde todas as portas de trabalho (2 e 4) ficam totalmente bloqueadas. Ao desenergizar ambos os solenoides, as molas centram o carretel, mantendo o ar aprisionado em ambas as câmaras e imobilizando a haste do cilindro.',
        keyTakeaway: 'Travamento de posição intermediária em pneumática exige válvula 5/3 Centro Fechado.',
        xpReward: 50
      }
    },
    {
      id: 'mec_m2_l3_redes_ar_anel_fechado',
      moduleId: 'mec_mod_2_pneumatica',
      moduleTitle: 'Módulo 2: Pneumática Industrial & Tratamento de Ar',
      order: 3,
      code: 'MC 2.3',
      title: 'Dimensionamento de Redes em Anel Fechado e Queda de Pressão (ISO 4414)',
      norma: 'ISO 4414 / EN 983',
      level: 'Avançado',
      durationMinutes: 15,
      theory: {
        conceito: 'A distribuição de ar comprimido em uma planta industrial deve garantir pressão e vazão estáveis em todos os pontos de consumo com perda de carga total inferior a 0,1 bar (ΔP ≤ 0,1 bar entre o compressor e o ponto mais distante). A topologia em Anel Fechado (Loop Fechado) com tubos calibrados e descidas tipo "Bengala" (Pescoço de Cisne) é a melhor prática de engenharia mecânica.',
        formulas: [
          { label: 'Limite Máximo de Queda de Pressão', formula: 'ΔP_total ≤ 0,1 bar (10 kPa)', explicacao: 'Cada 1 bar de perda extra na rede exige 7% a 10% mais energia do compressor' },
          { label: 'Velocidade Econômica do Ar Comprimido', formula: 'v_ar ≤ 6 a 10 m/s na linha principal', explicacao: 'Velocidades acima de 15 m/s causam turbulência extrema e arrasto de condensado' },
          { label: 'Volume do Reservatório Pulmão', formula: 'V_res = (q_L × t × P_atm) / (ΔP × P_trabalho)', explicacao: 'Armazena ar para suprir picos e ciclar o compressor em alívio' }
        ],
        pontosOperacionais: [
          'Vantagem do Anel Fechado: o ar flui simultaneamente em duas direções até o ponto de consumo, reduzindo pela metade a velocidade do ar e diminuindo a perda de carga em até 75% comparado à linha aberta única.',
          'Derivações tipo Bengala (Pescoço de Cisne): a saída para o ponto de trabalho deve ser conectada sempre pela parte SUPERIOR do tubo principal antes de descer, impedindo que a água condensada no fundo do cano caia para a máquina.',
          'Inclinação da rede principal: a tubulação deve possuir inclinação de 1% a 2% no sentido do fluxo em direção aos pontos de purga com drenos automáticos nas extremidades baixas.',
          'Tubulação de alumínio calibrado extrudado com conexões push-in: substitui tubos de aço galvanizado antigos que enferrujam internamente e soltam cascas que entopem válvulas.'
        ],
        fieldCase: {
          localizacao: 'Chókwè, Província de Gaza',
          cenario: 'Fábrica de conservas com linha linear de ar comprimido de 150 metros. Quando a etiquetadora ligava no fim da fábrica, a pressão caía de 7 bar para 4,2 bar, travando as máquinas.',
          diagnostico: 'Rede aberta em tubo galvanizado antigo de 1 polegada com velocidade de fluxo de 24 m/s e perda de carga de 2,8 bar. Além disso, as saídas para as máquinas saíam pela parte inferior do tubo, inundando os equipamentos com ferrugem.',
          solucaoNormativa: 'Fechamento do anel em tubo de alumínio calibrado de 40 mm (velocidade reduzida para 7 m/s), derivações superiores em bengala e inclusão de um reservatório pulmão de 500 litros no terço final da fábrica. A queda de pressão caiu para 0,08 bar contínuos.'
        },
        funcionamento: 'Ao conectar o final da linha ao início formando um anel contínuo, as pressões se equilibram dinamicamente, eliminando pontos mortos de estagnação de pressão na fábrica.',
        aplicacaoMocambique: 'A poeira e o calor do sul de Moçambique demandam reservatórios de ar certificados com teste hidrostático em dia e válvulas de segurança aferidas por caldeiraria competente.',
        exemploPratico: 'Para um consumo de 1200 L/min a 6 bar: em linha única de 25 mm a velocidade atinge 14 m/s (alta). Em anel fechado, a vazão divide-se em dois ramos de 600 L/min e a velocidade cai para 7 m/s com perda de carga quase nula.',
        calculationSnippet: 'ΔP ≤ 0,1 bar | v ≤ 10 m/s | Anel Fechado + Bengala Superior anti-condensado'
      },
      quiz: {
        question: 'Ao projetar uma linha de ar comprimido industrial segundo a ISO 4414, por que todas as derivações secundárias de descida para máquinas devem ser instaladas saindo pela parte SUPERIOR do tubo principal (técnica conhecida como Bengala ou Pescoço de Cisne)?',
        options: [
          { id: 'A', text: 'Para evitar que o peso do ar faça o cano curvar para baixo.', isCorrect: false, feedback: 'O ar comprimido tem densidade muito baixa e não curva tubulações industriais.' },
          { id: 'B', text: 'Para impedir que o condensado de água e óleo acumulado no fundo da tubulação principal escorra por gravidade para dentro das válvulas e atuadores das máquinas.', isCorrect: true, feedback: 'Exato! A água condensada corre no fundo do cano por gravidade. Ao sair por cima, apenas o ar seco é coletado, enquanto a água segue para os drenos inferiores.' },
          { id: 'C', text: 'Porque o ar comprimido na parte superior do tubo viaja com mais oxigênio.', isCorrect: false, feedback: 'O ar é homogêneo em toda a seção da tubulação.' },
          { id: 'D', text: 'Para economizar conexões e curvas durante a montagem.', isCorrect: false, feedback: 'A bengala usa mais curvas, priorizando a pureza do ar em relação ao custo.' }
        ],
        explanation: 'Em qualquer rede de ar comprimido, a umidade condensada não retida pelo secador escorre pela geratriz inferior (fundo) da tubulação principal por efeito da gravidade. A tomada de ar superior em bengala (pescoço de cisne) impede que essa água entre nos ramais de trabalho, direcionando o condensado para os drenos de purga automáticos nos pontos mais baixos da rede.',
        keyTakeaway: 'Derivações em bengala superior: Coletam ar limpo no topo e deixam o condensado escorrer para os drenos.',
        xpReward: 50
      }
    }
  ],

  // --------------------------------------------------------------------------
  // MÓDULO 3: HIDRÁULICA INDUSTRIAL & CIRCUITOS DE ALTA PRESSÃO
  // --------------------------------------------------------------------------
  mec_mod_3_hidraulica: [
    {
      id: 'mec_m3_l2_valvulas_pressao_alivio',
      moduleId: 'mec_mod_3_hidraulica',
      moduleTitle: 'Módulo 3: Hidráulica Industrial & Circuitos de Óleo',
      order: 2,
      code: 'MC 3.2',
      title: 'Válvulas Reguladoras de Pressão: Alívio Direto vs Pré-operadas (ISO 6264)',
      norma: 'ISO 6264 / ISO 4413',
      level: 'Avançado',
      durationMinutes: 15,
      theory: {
        conceito: 'A válvula de alívio (segurança) é o componente mais crítico de um sistema hidráulico, responsável por limitar a pressão máxima de trabalho e desviar o excesso de vazão da bomba para o reservatório. Válvulas de ação direta utilizam mola mecânica pesada sobre o obturador, enquanto válvulas pré-operadas utilizam um estágio piloto menor para controlar o estágio principal, proporcionando curva vazão-pressão quase perfeitamente horizontal.',
        formulas: [
          { label: 'Pressão de Abertura (Cracking Pressure)', formula: 'P_crack = F_mola / A_obturador', explicacao: 'Pressão em que a válvula começa a pingar o primeiro fluxo para o tanque' },
          { label: 'Sobrepressão de Abertura Plena (Override)', formula: 'ΔP_override = P_plena - P_crack', explicacao: 'Válvulas pré-operadas possuem override de apenas 3 a 5 bar; diretas até 30 bar' },
          { label: 'Potência Dissipada em Calor no Alívio', formula: 'P_calor (kW) = [P (bar) × Q (L/min)] / 600', explicacao: 'Ex: 200 bar a 60 L/min descarregando em alívio gera 20 kW de puro calor no óleo!' }
        ],
        pontosOperacionais: [
          'Válvula de ação direta: rápida resposta (10 a 20 ms), ideal para picos de choque, mas limitada a pequenas vazões (< 50 L/min) devido ao tamanho da mola.',
          'Válvula pré-operada: ideal para altas vazões (até 600 L/min) e pressões elevadas, mantendo a pressão estável independente da vazão de saída.',
          'Orifício de amortecimento do piloto obstruído por sujeira: se o orifício de 0,8 mm entupir, a válvula pré-operada trava fechada ou aberta, deixando a bomba sem alívio ou sem pressão.',
          'Nunca regule a válvula de alívio com o cilindro em movimento livre; o ajuste do manômetro deve ser feito com o atuador bloqueado no fim de curso sob pressão plena.'
        ],
        fieldCase: {
          localizacao: 'Complexo Industrial da Matola',
          cenario: 'Prensa hidráulica de reciclagem de papelão de 200 toneladas esquentava o óleo até 88°C em apenas 2 horas de trabalho, acionando alarme térmico contínuo.',
          diagnostico: 'A válvula de alívio principal estava regulada para 160 bar, mas a válvula de trabalho da prensa operava em 165 bar. Como resultado, 100% da vazão de 90 L/min da bomba descarregava continuamente sobre a válvula de alívio em vez de ir para o atuador, gerando 24 kW de calor ininterrupto.',
          solucaoNormativa: 'Reajuste criterioso da válvula de alívio para 190 bar (15% acima da pressão de trabalho da prensa de 165 bar). A temperatura do óleo no reservatório estabilizou em 54°C sem necessidade de radiador adicional.'
        },
        funcionamento: 'Na válvula pré-operada, a pressão atua em ambos os lados do pistão principal. Ao atingir o limite, o piloto abre, desbalanceando as forças e permitindo que o carretel principal suba suavemente.',
        aplicacaoMocambique: 'O calor ambiente de 40°C no verão moçambicano não perdoa circuitos com alívio desregulado. Óleo acima de 65°C oxida rapidamente, destrói vedações de NBR e gera verniz nos carretéis.',
        exemploPratico: 'Bomba de 40 L/min a 150 bar em alívio contínuo: Calor gerado = (150 × 40) / 600 = 10 kW. Equivale a ligar 5 ebulidores elétricos de água de 2000W mergulhados no tanque de óleo.',
        calculationSnippet: 'P_alivio = 1,15 × P_trabalho | P_calor = (P · Q) / 600 kW | Pré-operada = vazão constante'
      },
      quiz: {
        question: 'Em um circuito hidráulico industrial de 210 bar com bomba de deslocamento fixo de palhetas, qual é o critério técnico correto segundo a ISO 4413 para regular a pressão da Válvula de Alívio Principal (Relief Valve)?',
        options: [
          { id: 'A', text: 'Regular exatamente na mesma pressão da linha de trabalho para descarregar o motor.', isCorrect: false, feedback: 'Se regular igual, a válvula ficará sempre entreaberta vertendo óleo e superaquecendo o fluido.' },
          { id: 'B', text: 'Regular aproximadamente 10% a 15% acima da pressão máxima necessária de trabalho dos atuadores, garantindo que o óleo só verta para o tanque em sobrecargas ou fins de curso.', isCorrect: true, feedback: 'Correto! A margem de 10% a 15% evita abertura prematura durante o ciclo de trabalho normal e protege a integridade mecânica de bombas e tubulações.' },
          { id: 'C', text: 'Apertar o parafuso de regulagem até o final de rosca para máxima força.', isCorrect: false, feedback: 'Prática perigosa que estoura mangueiras e rompe carcaças de bombas.' },
          { id: 'D', text: 'Regular para 0 bar sempre que a máquina estiver ligada.', isCorrect: false, feedback: 'A zero bar o sistema não terá força hidráulica para executar trabalho útil.' }
        ],
        explanation: 'A norma ISO 4413 estabelece que válvulas limitadoras de pressão devem ser calibradas com uma margem de segurança de 10% a 15% acima da pressão de projeto da carga mais pesada. Isso impede que a válvula opere na zona de sobrepressão durante a operação normal, evitando desperdício de energia mecânica convertida em superaquecimento térmico do óleo.',
        keyTakeaway: 'Calibre a válvula de alívio com 10% a 15% acima da pressão de trabalho para evitar superaquecimento.',
        xpReward: 50
      }
    },
    {
      id: 'mec_m3_l3_acumuladores_hidraulicos_n2',
      moduleId: 'mec_mod_3_hidraulica',
      moduleTitle: 'Módulo 3: Hidráulica Industrial & Circuitos de Óleo',
      order: 3,
      code: 'MC 3.3',
      title: 'Acumuladores Hidráulicos: Pré-carga de Nitrogênio (N2) e Golpe de Aríete',
      norma: 'ISO 10300 / ASME VIII / EN 982',
      level: 'Avançado',
      durationMinutes: 15,
      theory: {
        conceito: 'Acumuladores hidropneumáticos de bexiga ou pistão armazenam energia potencial através da compressão de gás inerte (Nitrogênio seco N2). Suas principais funções no circuito são: fornecer vazão instantânea de pico em ciclos rápidos, manter pressão em caso de falha da bomba e absorver picos de choque hidráulico destrutivos (golpe de aríete por fechamento súbito de válvulas).',
        formulas: [
          { label: 'Transformação dos Gases (Boyle-Mariotte)', formula: 'P0 × V0 = P1 × V1 = P2 × V2 (Isotérmica / Adiabática)', explicacao: 'P0 = Pré-carga de N2; P1 = Pressão mínima de trabalho; P2 = Pressão máxima' },
          { label: 'Regra de Ouro da Pré-carga P0', formula: 'P0 ≈ 0,9 × P1_min (Armazenamento) | P0 ≈ 0,6 a 0,7 × P_trab (Choque)', explicacao: 'Garante que a bexiga não bata na válvula de base inferior' },
          { label: 'PROIBIÇÃO ABSOLUTA', formula: 'NUNCA USAR OXIGÊNIO (O2) OU AR COMPRIMIDO!', explicacao: 'A mistura de óleo sob pressão + oxigênio gera explosão por efeito diesel instantânea!' }
        ],
        pontosOperacionais: [
          'PERIGO DE MORTE: Acumuladores hidráulicos DEVEM ser pressurizados EXCLUSIVAMENTE com GÁS NITROGÊNIO PURO SECO (N2 grau industrial). Carregar com ar ou oxigênio causa explosão letal comparável a uma bomba de fragmentação!',
          'Dispositivo de Bloqueio e Alívio de Segurança: todo acumulador deve ter um bloco de segurança com válvula manual de descarga para o tanque e válvula de alívio selada.',
          'Antes de realizar manutenção em qualquer linha ligada a um acumulador, certifique-se de que a pressão de óleo foi aliviada manualmente para zero bar no manômetro!',
          'Sintoma de bexiga furada: a linha hidráulica sofre golpes secos violentos, o manômetro oscila como agulha louca e ao abrir o bico de N2 vaza óleo em vez de gás.'
        ],
        fieldCase: {
          localizacao: 'Moatize, Província de Tete',
          cenario: 'Circuito de frenagem de emergência de guincho de mina subterrânea falhando no teste de segurança de corte de energia da subestação.',
          diagnostico: 'O técnico de manutenção verificou a pressão do acumulador de bexiga de 20 litros com o dispositivo de carregamento VG3: a pressão de N2 estava em apenas 12 bar (o projeto exigia P0 = 90 bar). A bexiga havia perdido gás pelo bico Schraeder oxidado.',
          solucaoNormativa: 'Troca da válvula de enchimento e pressurização com cilindro de Nitrogênio seco N2 a 90 bar a 20°C com bloco de teste certificado. No ensaio de corte elétrico, o acumulador sustentou 8 frenagens completas consecutivas sem energia externa.'
        },
        funcionamento: 'O óleo incompressível entra pela parte inferior do vaso e esmaga a bexiga de borracha de nitrila cheia de gás. Quando a linha requer óleo, o gás comprimido empurra o óleo de volta para a tubulação em milissegundos.',
        aplicacaoMocambique: 'A vibração em britadeiras de agregados na província de Sofala quebra suportes de tubulação se não houver pequenos acumuladores de membrana para amortecer os pulsos das bombas de pistões.',
        exemploPratico: 'Circuito operando entre 100 bar (P1) e 160 bar (P2): Pressão de pré-carga correta de Nitrogênio: P0 = 0,9 × 100 = 90 bar de N2 medido com o lado de óleo totalmente despressurizado.',
        calculationSnippet: 'P0 = 0,9 × P1_min | EXCLUSIVO NITROGÊNIO N2 (Oxigênio explode) | Despressurizar antes de abrir'
      },
      quiz: {
        question: 'Durante a manutenção de rotina de um acumulador hidráulico de bexiga em uma ponte rolante portuária, qual gás é o ÚNICO internacionalmente permitido pelas normas ISO 4413 e ASME para realizar a pré-carga de pressão da bexiga?',
        options: [
          { id: 'A', text: 'Ar comprimido filtrado da rede pneumática da oficina.', isCorrect: false, feedback: 'O ar contém 21% de oxigênio; sob alta pressão e calor ele se mistura com o óleo e explode por efeito diesel!' },
          { id: 'B', text: 'Gás Nitrogênio puro e seco (N2).', isCorrect: true, feedback: 'Correto! O Nitrogênio é quimicamente inerte, não inflamável e não reage com o óleo mineral sob pressões de centenas de bar.' },
          { id: 'C', text: 'Oxigênio puro de solda oxiacetilênica.', isCorrect: false, feedback: 'Causa explosão imediata de violência devastadora!' },
          { id: 'D', text: 'Gás refrigerante R134a ou Freon.', isCorrect: false, feedback: 'Refrigerantes dissolvem a borracha da bexiga e são poluentes proibidos para essa função.' }
        ],
        explanation: 'Acumuladores hidráulicos operam sob pressões elevadíssimas (100 a 350 bar) em contato íntimo com óleo mineral inflamável. A presença de oxigênio do ar criaria uma mistura explosiva que detona espontaneamente pela compressão adiabática rápida (efeito diesel). O Nitrogênio puro seco (N2) é um gás inerte que não suporta combustão, sendo o único homologado mundialmente.',
        keyTakeaway: 'Regra de segurança de vida: Acumuladores hidráulicos carregam-se EXCLUSIVAMENTE com Nitrogênio puro (N2).',
        xpReward: 50
      }
    }
  ],

  // --------------------------------------------------------------------------
  // MÓDULO 4: MANUTENÇÃO PREDITIVA & ANÁLISE DE VIBRAÇÃO
  // --------------------------------------------------------------------------
  mec_mod_4_manutencao: [
    {
      id: 'mec_m4_l2_diagnostico_rolamentos_fft_envelope',
      moduleId: 'mec_mod_4_manutencao',
      moduleTitle: 'Módulo 4: Manutenção Preditiva & Análise de Vibrações',
      order: 2,
      code: 'MC 4.2',
      title: 'Diagnóstico de Rolamentos por Demodulação de Envelope e Frequências BPFO/BPFI',
      norma: 'ISO 13373-1 / ISO 15243',
      level: 'Avançado',
      durationMinutes: 16,
      theory: {
        conceito: 'Defeitos incipientes em rolamentos (microdescascamentos e trincas de fadiga abaixo da superfície) não aparecem nos espectros convencionais de velocidade na faixa de 10 a 1000 Hz. Eles geram impactos de altíssima frequência (2 a 20 kHz) que excitam a frequência de ressonância do acelerômetro. A técnica de Demodulação de Envelope (PeakVue / HFE) filtra esses pulsos e revela as frequências características exatas do defeito.',
        formulas: [
          { label: 'BPFO (Pista Externa)', formula: 'BPFO = (n/2) × f_r × [1 - (d/D) × cos(θ)]', explicacao: 'Pico não modulado por bandas laterais (defeito fixo na carcaça)' },
          { label: 'BPFI (Pista Interna)', formula: 'BPFI = (n/2) × f_r × [1 + (d/D) × cos(θ)]', explicacao: 'Pico MODULADO por bandas laterais de 1X (defeito gira com o eixo)' },
          { label: 'BSF (Esfera/Rolo) & FTF (Gaiola)', formula: 'BSF = Giro do elemento | FTF = Giro da gaiola (≈ 0,4 × f_r)', explicacao: 'Identificam avarias em esferas individuais ou quebra da gaiola guia' }
        ],
        pontosOperacionais: [
          '4 Estágios de Degradação de Rolamento:\n  - Estágio 1: Visível apenas em ultrassom e envelope de aceleração (meses antes da falha).\n  - Estágio 2: Frequências BPFO/BPFI aparecem fracas no espectro de aceleração.\n  - Estágio 3: Frequências fundamentais com múltiplos harmônicos e bandas laterais no espectro de velocidade (substituição programada imediata).\n  - Estágio 4: As frequências desaparecem e viram ruído aleatório ("tapete de grama") com alta temperatura - falha catastrófica iminente em poucas horas!',
          'Se houver picos na frequência BPFI com satélites (bandas laterais) espaçadas em 1X da rotação, a pista interna está lascada.',
          'Nunca instale o sensor de vibração em tampas finas de chapa ou protetores de acoplamento; fixe o acelerômetro por base magnética sólida ou prisioneiro rosqueado diretamente no corpo rígido do mancal.',
          'Limpeza da superfície: remova crostas de tinta grossa e ferrugem para não atenuar sinais de alta frequência.'
        ],
        fieldCase: {
          localizacao: 'Nacala Porto, Nampula',
          cenario: 'Ventilador principal de tiragem induzida de caldeira de recuperação operando a 1480 RPM (24,6 Hz). A vibração global RMS em velocidade estava normal em 2,1 mm/s (Zona A da ISO 10816).',
          diagnostico: 'A análise de aceleração com técnica de Demodulação de Envelope revelou pico acentuado em 76,4 Hz com harmônicos múltiplos e bandas laterais de 24,6 Hz. Cálculo cinemático do rolamento SKF 22220 confirmou BPFI exata da pista interna.',
          solucaoNormativa: 'Programação de parada técnica no fim de semana para troca do rolamento. A abertura do rolamento revelou descascamento incipiente de 4 mm na pista interna. Uma parada não programada teria custado mais de 2 milhões de meticais em paralisia da fábrica.'
        },
        funcionamento: 'Cada vez que uma esfera passa sobre uma fissura na pista, gera um microimpacto mecânico pontual semelhante a uma martelada minúscula. A frequência desses impactos depende puramente da geometria do rolamento e da rotação.',
        aplicacaoMocambique: 'A umidade e o calor das fábricas de cerveja e moagem em Moçambique geram corrosão por contato (fretting) em rolamentos parados que sofrem vibração de máquinas vizinhas. O envelope detecta esse dano antes da partida.',
        exemploPratico: 'Motor de 1450 RPM (fr = 24,16 Hz). Rolamento com BPFO calculada de 7,4 × fr = 178,8 Hz. Se aparecer um pico marcante em 178,8 Hz com harmônicos em 357,6 Hz, o defeito está comprovadamente na pista externa.',
        calculationSnippet: 'Estágio 1 a 4 | BPFO = Pista Externa | BPFI com bandas 1X = Pista Interna | Envelope salva máquinas'
      },
      quiz: {
        question: 'Durante o monitoramento de condição preditivo de um redutor industrial por acelerômetro, o espectro demodulado de envelope exibe um pico claro na frequência BPFI (Ball Pass Frequency Inner Ring) acompanhado por bandas laterais (sidebands) espaçadas exatamente na frequência de rotação do eixo (1X). O que essa assinatura vibratória indica com certeza?',
        options: [
          { id: 'A', text: 'Desbalanceamento residual do rotor elétrico.', isCorrect: false, feedback: 'Desbalanceamento não gera frequências de envelope com espaçamento BPFI.' },
          { id: 'B', text: 'Presença de um defeito mecânico (trinca ou descascamento) localizado na PISTA INTERNA do rolamento.', isCorrect: true, feedback: 'Correto! O defeito na pista interna gira junto com o eixo, entrando e saindo da zona de carga mais pesada a cada rotação, o que modula em amplitude o sinal com bandas laterais de 1X.' },
          { id: 'C', text: 'Desalinhamento paralelo no acoplamento elástico.', isCorrect: false, feedback: 'Desalinhamento gera picos em 2X e 3X no espectro de velocidade comum, não BPFI.' },
          { id: 'D', text: 'Correia de acionamento frouxa patinando na polia.', isCorrect: false, feedback: 'Patinagem de correias gera frequências fracionárias submúltiplas e ruído de atrito.' }
        ],
        explanation: 'A frequência BPFI indica o impacto dos corpos rolantes contra uma avaria na pista interna. Como a pista interna gira solidária ao eixo, o ponto danificado entra na zona de carga máxima inferior e sai para a zona de alívio superior a cada rotação completa (frequência 1X). Essa variação periódica de carga modula a amplitude dos pulsos, gerando bandas laterais características espaçadas exatamente em 1X ao redor da BPFI.',
        keyTakeaway: 'BPFI com bandas laterais de 1X = Dano na pista interna entrando e saindo da zona de carga.',
        xpReward: 50
      }
    },
    {
      id: 'mec_m4_l3_alinhamento_laser_pe_manco',
      moduleId: 'mec_mod_4_manutencao',
      moduleTitle: 'Módulo 4: Manutenção Preditiva & Análise de Vibrações',
      order: 3,
      code: 'MC 4.3',
      title: 'Alinhamento a Laser de Eixos e Correção de Pé Manco (Soft Foot)',
      norma: 'ISO 20816-1 / ANSI/ASA S2.75',
      level: 'Avançado',
      durationMinutes: 15,
      theory: {
        conceito: 'O desalinhamento entre eixos acoplados é responsável por mais de 40% das quebras de rolamentos, fadiga de eixos e destruição prematura de acoplamentos elásticos. O alinhamento a laser substitui métodos antigos imprecisos (régua e relógios comparadores sujeitos a deflexão de haste), calculando simultaneamente o desalinhamento angular (gap) e o desalinhamento paralelo (offset) nos planos horizontal e vertical.',
        formulas: [
          { label: 'Desalinhamento Paralelo (Offset)', formula: 'Δy nos planos Vertical e Horizontal (mm)', explicacao: 'Distância entre os eixos de rotação no centro do acoplamento' },
          { label: 'Desalinhamento Angular (Gap)', formula: 'Δθ = Gap / Diâmetro_cubo (mm/100mm ou mrad)', explicacao: 'Ângulo de inclinação relativa entre as linhas de centro' },
          { label: 'Tolerância de Alinhamento (1500 RPM)', formula: 'Offset ≤ 0,06 mm | Angular ≤ 0,05 mm/100 mm', explicacao: 'Limites normativos para operação suave e longa vida útil' }
        ],
        pontosOperacionais: [
          'REGRA ZERO - PÉ MANCO (SOFT FOOT): Antes de alinhar, afrouxe um parafuso de fixação do pé do motor por vez com o relógio encostado. Se o pé subir mais de 0,05 mm, existe pé manco que deve ser calçado com lâminas de aço inox calibradas antes de qualquer outra etapa!',
          'Nunca coloque mais de 3 ou 4 calços sob o mesmo pé da máquina (efeito mola); substitua pilhas de calços finos por um único calço espesso calibrado.',
          'Crescimento térmico (Thermal Growth): máquinas que operam quentes (como compressores de parafuso e bombas de óleo térmico) devem ser alinhadas "frias" com offset intencional para que atinjam o alinhamento perfeito quando atingirem a temperatura de regime!',
          'Apertar sempre a base com torquímetro para que o aperto dos chumbadores não torça a carcaça da máquina.'
        ],
        fieldCase: {
          localizacao: 'Marracuene, Província de Maputo',
          cenario: 'Bomba de água potável de alta pressão de 45 kW apresentando falhas nos acoplamentos de garras a cada 6 semanas com aquecimento severo nos mancais.',
          diagnostico: 'A equipe alinhava o conjunto com régua de aço e calibrador de lâminas no olho. A medição com sistema a laser de dois prismas acusou desalinhamento angular vertical de 0,38 mm/100 mm e pé manco diagonal de 0,14 mm no pé traseiro direito do motor.',
          solucaoNormativa: 'Correção do pé manco com calço de 0,15 mm e alinhamento a laser tridimensional com tolerância final de offset de 0,02 mm e angular de 0,03 mm/100 mm. O acoplamento completou 2 anos de operação contínua sem desgaste.'
        },
        funcionamento: 'Dois sensores emissores de laser semicondutor e receptores detectores de posição (PSD) medem as coordenadas do feixe luminoso enquanto os eixos são girados juntos em 3 pontos (ângulo de rotação de 60° a 360°).',
        aplicacaoMocambique: 'Bases de concreto mal niveladas ou atacadas por óleo degradado são comuns em indústrias moçambicanas, gerando deformação estrutural nos pés dos motores que exige calçamento técnico de precisão.',
        exemploPratico: 'Motor de 3000 RPM: a tolerância rigorosa exige offset máximo de 0,03 mm. Alinhar na régua deixa desvios típicos de 0,20 mm a 0,50 mm, multiplicando por 10 o esforço radial nos rolamentos.',
        calculationSnippet: 'Pé Manco ≤ 0,05 mm | Máx. 3 calços por pé | Offset ≤ 0,06 mm (1500 RPM) | Laser 3D'
      },
      quiz: {
        question: 'Durante o processo de alinhamento a laser de um motor elétrico de 90 kW acoplado a uma bomba centrífuga, por que é estritamente obrigatório verificar e eliminar a condição de "Pé Manco" (Soft Foot) ANTES de começar a movimentar a máquina para corrigir o alinhamento?',
        options: [
          { id: 'A', text: 'Porque o laser não liga se houver qualquer parafuso desapertado na base.', isCorrect: false, feedback: 'O laser funciona independentemente, mas os cálculos matemáticos serão totalmente corrompidos.' },
          { id: 'B', text: 'Porque o pé manco deforma a carcaça mecânica do motor ao apertar os parafusos da base, distorcendo o estator, desalinhando os mancais internamente e gerando falsas leituras.', isCorrect: true, feedback: 'Correto! Apertar um pé no ar enverga a carcaça de ferro fundido do motor, alterando o centro do eixo e provocando tensões mecânicas destrutivas nos rolamentos.' },
          { id: 'C', text: 'Porque a norma ISO 20816 proíbe o uso de calços metálicos de aço inox.', isCorrect: false, feedback: 'Calços de aço inoxidável calibrados são exatamente a recomendação normativa oficial.' },
          { id: 'D', text: 'Porque o pé manco faz o motor consumir menos energia e queimar por falta de carga.', isCorrect: false, feedback: 'Afirmação incorreta; pé manco aumenta perdas por atrito e vibração.' }
        ],
        explanation: 'O "Pé Manco" (Soft Foot) ocorre quando um dos pés da máquina não apoia perfeitamente plano sobre a base (como uma cadeira de quatro pernas onde uma é mais curta). Se os parafusos forem apertados com pé manco, a carcaça de ferro fundido ou aço deforma plasticamente, desalinhando internamente as pistas dos rolamentos e alterando a posição do eixo toda vez que um parafuso é apertado ou solto, tornando impossível qualquer alinhamento estável.',
        keyTakeaway: 'Corrija sempre o pé manco (< 0,05 mm) antes de alinhar para não torcer a carcaça da máquina.',
        xpReward: 50
      }
    },
    {
      id: 'mec_m4_l4_tribologia_analise_oleo',
      moduleId: 'mec_mod_4_manutencao',
      moduleTitle: 'Módulo 4: Manutenção Preditiva & Análise de Vibrações',
      order: 4,
      code: 'MC 4.4',
      title: 'Tribologia e Análise de Lubrificantes em Laboratório (ISO 4406, TAN, Viscosidade)',
      norma: 'ISO 4406 / ASTM D445 / ASTM D664',
      level: 'Avançado',
      durationMinutes: 16,
      theory: {
        conceito: 'A análise de óleo lubrificante é o "exame de sangue" das máquinas industriais. Ela monitora três pilares vitais: a condição de degradação do próprio lubrificante (viscosidade, oxidação e aditivos), a presença de contaminantes externos (água, poeira de sílica e fuligem) e o desgaste mecânico interno através da quantificação e morfologia de partículas metálicas (ferrografia analítica).',
        formulas: [
          { label: 'Viscosidade Cinemática (40 °C)', formula: 'Var. admissível = ± 10% da viscosidade nominal ISO VG', explicacao: 'ASTM D445: Óleo ISO VG 68 pode variar apenas entre 61,2 e 74,8 cSt' },
          { label: 'Índice de Acidez Total (TAN)', formula: 'TAN ≤ 2,0 mg KOH/g acima do óleo novo', explicacao: 'ASTM D664: Mede subprodutos ácidos gerados por oxidação térmica do óleo' },
          { label: 'Teor de Água por Karl Fischer', formula: 'Água ≤ 100 a 200 ppm (0,01% a 0,02%)', explicacao: 'ASTM D6304: Água livre ou emulsionada reduz a vida útil dos rolamentos em até 80%!' }
        ],
        pontosOperacionais: [
          'Coleta de amostra representativa: coletar SEMPRE com a máquina operando em temperatura de regime ou logo após desligar, na metade da altura do reservatório ou em ponto de amostragem dinâmico a montante dos filtros. NUNCA coletar no dreno de fundo do tanque (coleta apenas lama decantada)!',
          'Aumento repentino da viscosidade: indica oxidação severa do óleo por superaquecimento ou contaminação cruzada por óleo mais pesado.',
          'Queda repentina da viscosidade: indica contaminação por combustível diesel (fuga em bico injetor) ou solvente de limpeza.',
          'Ferrografia de Desgaste Severo: partículas em lâmina com estrias ou partículas esferoidais indicam fadiga por microchoque e rolamentos prestes a colapsar.'
        ],
        fieldCase: {
          localizacao: 'Moatize, Província de Tete',
          cenario: 'Redutor planetário de esteira transportadora de carvão de 1500 Nm perdendo engrenagens a cada 4 meses com óleo preto e cheiro acre de queimado.',
          diagnostico: 'A análise laboratorial de óleo registrou TAN = 4,8 mg KOH/g (óleo extremamente ácido e oxidado), viscosidade caindo de 320 cSt para 210 cSt por cisalhamento de polímero e contagem de partículas de silício (poeira de sílica) superior a 350 ppm.',
          solucaoNormativa: 'Substituição por óleo sintético polialfaolefina (PAO) ISO VG 320 com aditivação extrema pressão (EP), instalação de respirador dessecante com sílica gel e filtro absoluto de 3 μm na tampa. Intervalo de troca de óleo estendido de 1000 horas para 8000 horas sem desgaste.'
        },
        funcionamento: 'A ferrografia analítica utiliza um campo magnético de alta intensidade para separar partículas ferrosas de acordo com seu tamanho em uma lâmina de vidro para exame microscópico morfológico.',
        aplicacaoMocambique: 'A alta umidade tropical e a presença de poeira fina abrasiva de bauxita e carvão nas regiões centro e norte de Moçambique tornam o óleo industrial o primeiro componente a ser monitorado preventivamente.',
        exemploPratico: 'Se um óleo novo tem TAN = 0,2 mg KOH/g, o limite condenatório para troca ou purificação é atingido quando o TAN superar 1,5 a 2,0 mg KOH/g, momento em que o óleo passa a atacar quimicamente bronzinas de cobre e ligas amarelas.',
        calculationSnippet: 'Viscosidade ±10% | TAN máx +2,0 | Água < 200 ppm (Karl Fischer) | Amostragem dinâmica'
      },
      quiz: {
        question: 'Durante a análise laboratorial de rotina de uma amostra de óleo mineral ISO VG 220 retirado de um redutor de velocidade industrial, o laudo atesta um teor de umidade (água) de 800 ppm por Karl Fischer (ASTM D6304). Qual é o impacto direto dessa contaminação nos rolamentos do equipamento segundo a norma ISO 15243?',
        options: [
          { id: 'A', text: 'A água ajuda a resfriar o óleo aumentando a vida útil dos componentes em 50%.', isCorrect: false, feedback: 'Totalmente falso! Água destrói a película de óleo e causa oxidação acelerada.' },
          { id: 'B', text: 'A água quebra a película elastohidrodinâmica de lubrificação, causa fragilização por hidrogênio no aço e pode reduzir a vida útil dos rolamentos em mais de 75%.', isCorrect: true, feedback: 'Correto! Acima de 200 ppm, a água livre e dissolvida penetra nas microfissuras do aço sob alta pressão, liberando hidrogênio atômico que fragiliza e quebra os rolamentos rapidamente.' },
          { id: 'C', text: 'A água neutraliza a acidez tornando o óleo biodegradável.', isCorrect: false, feedback: 'Água acelera a formação de ácidos corrosivos pela hidrólise de aditivos.' },
          { id: 'D', text: 'Não há impacto algum se a temperatura de operação for inferior a 40°C.', isCorrect: false, feedback: 'Em temperaturas amenas a água condensa ainda mais rápido, piorando a corrosão.' }
        ],
        explanation: 'A água é um dos contaminantes mais destrutivos para óleos industriais. Quando o teor ultrapassa o limite seguro (tipicamente 100 a 200 ppm), a água colapsa a camada de filme lubrificante, gerando contato metal-metal. Além disso, a água sob altíssima pressão nas zonas de contato dos rolamentos dissocia-se, gerando fragilização por hidrogênio (hydrogen embrittlement) que causa descascamento precoce catastrófico do aço.',
        keyTakeaway: 'Água acima de 200 ppm é veneno para rolamentos: gera fragilização por hidrogênio e corrosão acelerada.',
        xpReward: 50
      }
    }
  ]
};
