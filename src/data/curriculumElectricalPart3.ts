import { AcademyModule } from '../types/academy';

export const ELECTRICAL_MODULES_PART3: AcademyModule[] = [
  // ==========================================================================
  // MÓDULO 8: MÉDIA TENSÃO, REDES DE DISTRIBUIÇÃO & POSTOS DE TRANSFORMAÇÃO (PT)
  // ==========================================================================
  {
    id: 'elec_mod_8_media_tensao_pt',
    area: 'eletrotecnica',
    order: 8,
    title: 'Módulo 8: Média Tensão, Redes de Distribuição & Postos de Transformação (PT)',
    description: 'Postos de transformação cabinados e aéreos padrão EDM (11kV, 22kV, 33kV), transformadores a óleo/seco, celas MT, fusíveis HH e as 5 Regras de Ouro (EN 50110).',
    icon: 'Radio',
    normasReferencia: ['IEC 60076-1', 'IEC 62271-200', 'EN 50110-1'],
    lessons: [
      {
        id: 'elec_m8_ec1_pt_transformadores_edm',
        moduleId: 'elec_mod_8_media_tensao_pt',
        moduleTitle: 'Módulo 8: Média Tensão, Redes de Distribuição & Postos de Transformação (PT)',
        order: 1,
        code: 'EC 8.1',
        title: 'Postos de Transformação (PT) e Transformadores de Distribuição EDM',
        norma: 'IEC 60076-1 / IEC 61936-1',
        level: 'Avançado',
        durationMinutes: 16,
        theory: {
          conceito: 'Em Moçambique, a Eletricidade de Moçambique (EDM) distribui energia em Média Tensão (MT) primariamente nas classes de 11 kV, 22 kV e 33 kV a 50 Hz. Os Postos de Transformação (PTs) rebaixam a MT para a Baixa Tensão (BT) de utilização a 400 V entre fases e 230 V entre fase e neutro. Os PTs classificam-se em:\n• PT Aéreo em Poste: transformadores compactos de até 160 kVA ou 250 kVA montados em cruzetas de concreto ou poste duplo.\n• PT Cabinado / Alvenaria / Compacto Blindado: instalações acima de 250 kVA (ex: 400, 630, 1000, 1600 kVA) com celas modulares de manobra e cuba de contenção de óleo.',
          formulas: [
            { label: 'Corrente Nominal em Média Tensão', formula: 'I_MT = S / (√3 × V_MT)', explicacao: 'Ex: Para PT de 400 kVA em 22 kV: I_MT = 400000 / (√3 × 22000) = 10,50 A' },
            { label: 'Corrente Nominal em Baixa Tensão (400V)', formula: 'I_BT = S / (√3 × V_BT)', explicacao: 'Ex: Para PT de 400 kVA em 400 V: I_BT = 400000 / (√3 × 400) = 577,35 A' },
            { label: 'Relação de Transformação (k)', formula: 'k = V_prim / V_sec = I_sec / I_prim', explicacao: 'Transformador 22000V / 400V -> k = 55' }
          ],
          pontosOperacionais: [
            'Proteção intrínseca de transformadores a óleo: Relé Buchholz (instalado na tubulação entre a cuba principal e o tanque de expansão/conservador para detectar geração lenta de gases e descolamento súbito de óleo por curto-circuito interno).',
            'Ensaio de Rigidez Dielétrica do Óleo Mineral Isolante (IEC 60156): amostragem anual de óleo; o valor de ruptura dielétrica deve ser superior a 30 kV a 50 kV entre eletrodos esféricos de 2,5 mm. Se cair abaixo de 20 kV, o óleo contém água e umidade, exigindo termo-vácuo imediato.',
            'Bacia de Contenção de Óleo: mandatória pela IEC 61936-1 em PTs cabinados para conter 100% do volume do óleo mineral com brita corta-chamas para prevenir contaminação de lençóis freáticos e incêndio.',
            'Secador de ar com sílica gel: cristais de sílica gel azul ficam rosa/vermelhos quando saturados de umidade, devendo ser substituídos ou regenerados em estufa para não sugar ar úmido para dentro do transformador durante variações térmicas de carga.'
          ],
          fieldCase: {
            localizacao: 'Manica, Centro de Moçambique',
            cenario: 'Transformador aéreo trifásico de 250 kVA 22 kV / 400 V que alimenta uma cooperativa agrícola operando com aquecimento anormal na parte superior da carcaça e desarmes repentinos pelo termômetro de topo.',
            diagnostico: 'A análise química e física de amostra do óleo mineral revelou rigidez dielétrica de apenas 16 kV (abaixo do limiar seguro) e índice de umidade de 48 ppm, além de grânulos de sílica gel totalmente saturados na cor rosa. O transformador respirava ar úmido nas noites frias de Manica, condensando água no óleo.',
            solucaoNormativa: 'Tratamento do óleo por termo-vácuo no local, restaurando a rigidez para 54 kV, substituição da sílica gel do reservatório e reaperto com junta de cortiça nitrílica nova. O transformador voltou a operar com temperatura de topo estável a 58°C.'
          },
          funcionamento: 'A indução eletromagnética mútua transfere a potência do primário de MT para o secundário de BT com rendimento superior a 98%, isolando galvanicamente a rede de alta tensão dos aparelhos domésticos e industriais.',
          aplicacaoMocambique: 'A EDM exige aprovação prévia de projeto e inspeção de comissionamento de cabines de transformação antes de efetuar a ligação do ramal aéreo ou subterrâneo à rede nacional.',
          exemploPratico: 'Dimensionamento do disjuntor geral de BT para um PT de 630 kVA 400V: I_BT = 630000 / (1,732 × 400) = 909 A. O disjuntor em caixa aberta (ACB) deve ter calibre nominal de 1000A com disparador eletrônico regulado para 910A.',
          calculationSnippet: 'I_MT = S / (√3 × V_MT) | I_BT = S / (√3 × 400V) | Óleo dielétrico: rigidez > 30 kV'
        },
        quiz: {
          question: 'Em um Posto de Transformação (PT) industrial privado conectado à rede de Média Tensão da EDM de 22 kV 50Hz, foi instalado um transformador trifásico com potência nominal de 400 kVA. Qual é a corrente nominal de linha teórica no lado de Média Tensão (primário) segundo a IEC 60076?',
          options: [
            { id: 'A', text: 'I_MT = 10,50 A (calculado por S / [√3 × 22000]).', isCorrect: true, feedback: 'Perfeito! Pela fórmula trifásica: I_MT = 400.000 VA / (√3 × 22.000 V) = 400.000 / 38.105 = 10,50 Amperes.' },
            { id: 'B', text: 'I_MT = 577 A.', isCorrect: false, feedback: '577 A é a corrente no lado de Baixa Tensão (400V), não no lado de Média Tensão!' },
            { id: 'C', text: 'I_MT = 1,0 A.', isCorrect: false, feedback: 'Valor incorreto; subdimensionamento grosseiro.' },
            { id: 'D', text: 'I_MT = 100 A.', isCorrect: false, feedback: '100 A em 22 kV corresponderia a uma potência imensa de 3,8 MVA.' }
          ],
          explanation: 'Para sistemas trifásicos equilibrados, a relação entre potência aparente (S), tensão de linha (V_L) e corrente de linha (I_L) é dada por: S = √3 × V_L × I_L. Isolando a corrente nominal no primário de Média Tensão (22 kV): I_MT = 400000 VA / (1,73205 × 22000 V) = 400000 / 38105,1 ≈ 10,50 A.',
          keyTakeaway: 'I_MT = S / (√3 × V_MT): PT de 400 kVA em 22 kV consome apenas 10,5 A nominais no primário.',
          xpReward: 50
        }
      },
      {
        id: 'elec_m8_ec2_celas_regras_ouro_en50110',
        moduleId: 'elec_mod_8_media_tensao_pt',
        moduleTitle: 'Módulo 8: Média Tensão, Redes de Distribuição & Postos de Transformação (PT)',
        order: 2,
        code: 'EC 8.2',
        title: 'Celas de Média Tensão, Fusíveis HH e as 5 Regras de Ouro (EN 50110)',
        norma: 'EN 50110-1 / IEC 62271-200 / IEC 60282-1',
        level: 'Avançado',
        durationMinutes: 18,
        theory: {
          conceito: 'A intervenção em cabines de Média Tensão (MT) envolve risco extremo de arco elétrico e choque elétrico com potencial fatal. A norma europeia EN 50110-1 estabelece o procedimento inegociável das Cinco Regras de Ouro de Segurança Elétrica para desenergização e consignação prévia de qualquer equipamento de MT antes do início dos trabalhos.',
          formulas: [
            { label: 'As 5 Regras de Ouro (EN 50110-1)', formula: '1. Seccionar -> 2. Bloquear -> 3. Verificar Ausência -> 4. Aterrar/Curto-circuitar -> 5. Sinalizar', explicacao: 'Sequência cronológica obrigatória e insubstituível para trabalhar com risco zero' },
            { label: 'Dimensionamento de Fusível HH (Alto Poder de Corte)', formula: 'I_fusivel_HH ≈ (1,5 a 2,0) × I_nominal_MT', explicacao: 'Protege contra curtos-circuitos internos no transformador sem queimar com a corrente inrush' },
            { label: 'Distância de Segurança no Ar (22 kV)', formula: 'd_min = 220 mm (IEC 61936-1)', explicacao: 'Distância mínima entre partes sob tensão de 22 kV e pessoas/ferramentas' }
          ],
          pontosOperacionais: [
            '1ª Regra: Seccionar e isolar completamente todas as fontes de alimentação (abertura de disjuntores e seccionadores com corte visível).',
            '2ª Regra: Bloquear contra religação intempestiva através de cadeados de segurança (LOTO - Lockout/Tagout) e retenção das chaves mestras mecânicas.',
            '3ª Regra: Verificar a ausência efetiva de tensão através de Detector de Tensão Óptico-Acústico capacitivo testado imediatamente antes e depois do uso.',
            '4ª Regra: Aterrar e colocar em curto-circuito todas as fases através da chave de aterramento rápido da cela ou conjunto de aterramento temporário móvel.',
            '5ª Regra: Proteger contra elementos adjacentes sob tensão e delimitar a zona de trabalho com fitas zebradas e placas de advertência de perigo de morte.',
            'Fusíveis HH (IEC 60282-1): possuem percussor mecânico acionado pela fusão do elemento interno que dispara mecanicamente a abertura tripolar do interruptor-seccionador, evitando a queima do transformador por operação monofásica.'
          ],
          fieldCase: {
            localizacao: 'Costa do Sol, Maputo',
            cenario: 'Manobra de manutenção preventiva programada em uma cela de chegada de 22 kV de um complexo hospitalar. A equipe precisava substituir os fusíveis HH de proteção do transformador de 630 kVA.',
            diagnostico: 'Ao chegar, o técnico novato ia abrindo a porta da cela de fusíveis diretamente com a chave manual. O encarregado experiente impediu a ação e executou o procedimento das 5 Regras: abriu o interruptor de MT, travou com cadeado LOTO, inseriu a vara de manobra com detector de tensão (que confirmou 0V), acionou o seccionador de terra incorporado com intertravamento mecânico que liberou a fechadura da porta da cela e delimitou a área de trabalho.',
            solucaoNormativa: 'Substituição segura dos três fusíveis HH de 24 kV 31,5A com percussor de 50N utilizando luvas isolantes de borracha Classe 4 (36 kV). Ao religar, seguiu-se a ordem inversa (desaterrar, destravar e fechar), concluindo o serviço com total conformidade e risco zero.'
          },
          funcionamento: 'A chave de aterramento rápido (Earthing Switch) de uma cela de MT possui fechamento brusco com capacidade de fechamento sob curto-circuito (Make-Proof), garantindo que, se houver engano e a rede estiver viva, o arco fique contido dentro da cela blindada sem ferir o técnico.',
          aplicacaoMocambique: 'A EDM exige autorização formal de corte e documento de consignação assinado pelo despachante de distribuição da rede antes de qualquer intervenção em cabines de MT privadas.',
          exemploPratico: 'Para um PT de 250 kVA em 22 kV: I_MT = 6,56 A. Seleciona-se fusível HH padrão de 16 A ou 20 A (fator de aprox. 2,5 vezes In) para suportar o inrush da magnetização inicial.',
          calculationSnippet: '5 Regras: Seccionar -> Bloquear -> Ausência -> Aterrar -> Sinalizar | Fusível HH com percussor'
        },
        quiz: {
          question: 'Segundo a norma europeia EN 50110-1 sobre exploração e trabalho em instalações elétricas de Alta e Média Tensão, qual é a ordem sequencial cronológica estrita das Cinco Regras de Ouro de Segurança antes de iniciar qualquer serviço?',
          options: [
            { id: 'A', text: '1. Aterrar -> 2. Limpar com pano -> 3. Ligar o gerador -> 4. Seccionar -> 5. Chamar socorro.', isCorrect: false, feedback: 'Aterrar antes de seccionar provocaria um curto-circuito explosivo mortal!' },
            { id: 'B', text: '1. Seccionar completamente -> 2. Bloquear contra religação (LOTO) -> 3. Verificar ausência de tensão -> 4. Aterrar e curto-circuitar as fases -> 5. Sinalizar e delimitar a zona de trabalho.', isCorrect: true, feedback: 'Correto! Essa é a sequência universal e inegociável das 5 Regras de Ouro da EN 50110-1 para garantir que o técnico nunca trabalhe sob tensão.' },
            { id: 'C', text: '1. Desligar apenas a lâmpada -> 2. Usar luvas de pano -> 3. Trabalhar rápido -> 4. Ligar novamente -> 5. Cobrar o cliente.', isCorrect: false, feedback: 'Total negligência com perigo de morte iminente.' },
            { id: 'D', text: '1. Medir a corrente -> 2. Trocar o fusível com a rede ligada -> 3. Aterrar o neutro -> 4. Correr se faiscar.', isCorrect: false, feedback: 'Comportamento proibido e criminoso em alta tensão.' }
          ],
          explanation: 'A norma EN 50110-1 prescreve a execução rigorosa das 5 Regras de Ouro nesta ordem exata: 1. Seccionar a instalação de todas as fontes; 2. Bloquear e travar os aparelhos de manobra contra religamento involuntário; 3. Verificar com detector adequado a ausência comprovada de tensão; 4. Aterrar e colocar em curto-circuito todos os condutores ativos; 5. Proteger contra partes vizinhas energizadas e sinalizar a área delimitada de trabalho.',
          keyTakeaway: '5 Regras de Ouro (EN 50110-1): Seccionar, Bloquear, Verificar Ausência, Aterrar e Sinalizar.',
          xpReward: 50
        }
      }
    ]
  },

  // ==========================================================================
  // MÓDULO 9: CLIMATIZAÇÃO, HVAC & REFRIGERAÇÃO (EN 378)
  // ==========================================================================
  {
    id: 'elec_mod_9_climatizacao_hvac',
    area: 'eletrotecnica',
    order: 9,
    title: 'Módulo 9: Climatização, HVAC & Refrigeração (Norma EN 378)',
    description: 'Ciclo frigorífico fundamental, superaquecimento, sub-resfriamento, fluidos ecológicos A2L (R32) e diagnóstico eletromecânico em compressores Inverter e VRF.',
    icon: 'Wind',
    normasReferencia: ['EN 378-1', 'EN 378-2', 'IEC 60335-2-40', 'ISO 5149'],
    lessons: [
      {
        id: 'elec_m9_ec1_ciclo_superaquecimento',
        moduleId: 'elec_mod_9_climatizacao_hvac',
        moduleTitle: 'Módulo 9: Climatização, HVAC & Refrigeração (Norma EN 378)',
        order: 1,
        code: 'EC 9.1',
        title: 'Ciclo Frigorífico por Compressão de Vapor, Superaquecimento e Sub-resfriamento',
        norma: 'EN 378-1 / EN 378-2',
        level: 'Intermediário',
        durationMinutes: 16,
        theory: {
          conceito: 'O ciclo de refrigeração por compressão de vapor transfere calor de um ambiente frio (interior) para um ambiente mais quente (exterior) através de 4 transformações termodinâmicas fundamentais com mudança de fase do fluido:\n1. Compressão (Vapor Baixa Pressão -> Vapor Alta Pressão superaquecido);\n2. Condensação (Rejeição de calor latente: Vapor Alta Pressão -> Líquido sub-resfriado);\n3. Expansão (Queda brusca de pressão por capilar ou válvula termostática);\n4. Evaporação (Absorção de calor latente do recinto: Líquido Baixa Pressão -> Vapor).',
          formulas: [
            { label: 'Superaquecimento Útil (Superheat - SH)', formula: 'SH = T_sucção_real - T_evaporação_saturada', explicacao: 'Medido na saída do evaporador. Faixa ideal típica: 5 K a 8 K (garante vapor 100% seco ao compressor)' },
            { label: 'Sub-resfriamento (Subcooling - SC)', formula: 'SC = T_condensação_saturada - T_líquido_real', explicacao: 'Medido na linha de líquido antes da válvula de expansão. Faixa ideal: 3 K a 6 K' },
            { label: 'Volume e Pressão Saturada', formula: 'P_abs = P_manometrica + 1,013 bar', explicacao: 'Conversão da pressão do manifold para tabela P/T do fluido refrigerante' }
          ],
          pontosOperacionais: [
            'PERIGO MORTAL DO GOLPE DE LÍQUIDO: Compressores são bombas projetadas exclusivamente para comprimir vapores elásticos. Se o superaquecimento for nulo (SH = 0 K), fluido no estado líquido entra nos cilindros; como líquidos são incompressíveis, ocorre quebra instantânea de palhetas, pistões e bielas!',
            'Superaquecimento muito alto (SH > 15 K): indica falta de fluido refrigerante (vazamento) ou válvula de expansão obstruída; o compressor trabalha sem resfriamento de sucção, superaquece e queima o verniz do enrolamento elétrico do estator.',
            'Sub-resfriamento baixo (SC < 2 K): indica carga insuficiente de fluido refrigerante na linha de líquido.',
            'Sub-resfriamento muito alto (SC > 10 K): indica excesso de carga de refrigerante (sobrecarga) ou condensador com aletas entupidas de poeira.',
            'Uso obrigatório de termômetro de contato tipo clamp (alicate) acoplado a vacuômetro e manifold digital para medição simultânea de P e T.'
          ],
          fieldCase: {
            localizacao: 'Beira, Província de Sofala',
            cenario: 'Câmara frigorífica comercial de conservação de camarão operando a -18°C com compressor semi-hermético de 7,5 kW sofrendo quebra repetida de placas de válvulas e óleo espumando no visor.',
            diagnostico: 'A medição simultânea com manifold digital no tubo de sucção acusou: Pressão de sucção correspondente a Tevap = -24°C, e a temperatura medida no tubo com o clamp era de exatamente -24°C. Superaquecimento útil: SH = -24 - (-24) = 0 K! A válvula de expansão termostática (TXV) estava com o bulbo solto no ar, abrindo totalmente e inundando o compressor de líquido refrigerante.',
            solucaoNormativa: 'Fixação firme do bulbo sensor da TXV no tubo de sucção na posição 2 horas (evitando o fundo onde corre óleo), isolado termicamente com manta elastomérica, e calibração da mola da TXV para superaquecimento estável de SH = 6 K. Zero quebras mecânicas registradas nos 12 meses seguintes.'
          },
          funcionamento: 'A mudança de estado físico (evaporação e condensação) absorve e libera centenas de vezes mais calor por quilograma do que a simples variação de temperatura sem mudança de fase.',
          aplicacaoMocambique: 'A umidade e o calor extremo de cidades litorâneas exigem condensadores limpos: poeira e maresia grudadas nas aletas impedem a dissipação do calor, elevando a pressão de condensação para mais de 35 bar e desarmando compressores por alta pressão.',
          exemploPratico: 'Num sistema Split R410A: manômetro de baixa indica 8,5 bar (T_evap = 3°C na régua). O termômetro acoplado na tubulação de sucção lê 9°C. Superaquecimento: SH = 9 - 3 = 6 K. O valor está perfeito (entre 5 K e 8 K).'
          ,calculationSnippet: 'SH = T_sucção - T_sat_evap (ideal: 5 a 8 K) | SC = T_sat_cond - T_líquido (ideal: 3 a 6 K)'
        },
        quiz: {
          question: 'Durante o diagnóstico técnico em um sistema de refrigeração industrial segundo a norma EN 378, o técnico mede na linha de sucção uma temperatura real do tubo de Tsuc = 2 °C e a pressão saturada de evaporação convertida indica Tevap = 2 °C. O Superaquecimento útil é SH = 0 K. Qual é o perigo mecânico imediato para o compressor?',
          options: [
            { id: 'A', text: 'O compressor vai congelar externamente e esfriar a sala com dobro de eficiência.', isCorrect: false, feedback: 'Totalmente incorreto; eficiência é destruída e há risco iminente de quebra catastrófica.' },
            { id: 'B', text: 'Risco iminente de Golpe de Líquido (retorno de refrigerante líquido aos cilindros), quebrando placas de válvula, bielas e pistões, pois líquidos são incompressíveis.', isCorrect: true, feedback: 'Perfeito! Superaquecimento zero (SH = 0 K) significa que há líquido entrando no compressor. Como líquidos são incompressíveis, o golpe mecânico quebra as palhetas e danifica os pistões imediatamente.' },
            { id: 'C', text: 'O compressor passará a gerar eletricidade e injetar na rede.', isCorrect: false, feedback: 'Impossível fisicamente.' },
            { id: 'D', text: 'Nenhum perigo, pois o valor de 0 K é o padrão exigido pela norma.', isCorrect: false, feedback: 'A norma e os fabricantes exigem superaquecimento mínimo entre 5 K e 8 K.' }
          ],
          explanation: 'O Superaquecimento útil (SH) é a garantia física de que todo o fluido refrigerante líquido evaporou antes de chegar à entrada do compressor. Quando SH = 0 K, o refrigerante ainda se encontra na curva de saturação (mistura líquido-vapor). Compressores frigoríficos são máquinas de deslocamento positivo projetadas exclusivamente para gases; a entrada de líquido causa o catastrófico "golpe de líquido" (hydraulic shock), destruindo mecanicamente válvulas, bielas e mancais.',
          keyTakeaway: 'SH = 0 K = Golpe de Líquido: Compressores quebram mecanicamente se receberem refrigerante líquido.',
          xpReward: 50
        }
      },
      {
        id: 'elec_m9_ec2_fluidos_ecologicos_en378',
        moduleId: 'elec_mod_9_climatizacao_hvac',
        moduleTitle: 'Módulo 9: Climatização, HVAC & Refrigeração (Norma EN 378)',
        order: 2,
        code: 'EC 9.2',
        title: 'Fluidos Refrigerantes Ecológicos (R32, R290) e Protocolos EN 378',
        norma: 'EN 378-1 / ISO 817 / IEC 60335-2-40',
        level: 'Avançado',
        durationMinutes: 16,
        theory: {
          conceito: 'A regulamentação ambiental mundial (Protocolo de Montreal e Emenda de Kigali) baniu os CFCs (R12) e HCFCs (R22) devido à destruição da camada de ozônio (ODP > 0) e está em fase avançada de substituição dos HFCs de alto efeito estufa (como R410A com GWP = 2088). A nova geração de fluidos adota:\n• R32 (Difluorometano): Fluido puro, GWP = 675 (redução de 68%), classificado pela ISO 817 como Classe A2L (Baixa Toxicidade, Levemente Inflamável).\n• R290 (Propano puro): GWP = 3, eficiência termodinâmica superior, classificado como Classe A3 (Baixa Toxicidade, Altamente Inflamável).',
          formulas: [
            { label: 'Classificação de Segurança ISO 817', formula: 'Toxicidade: A (Baixa) ou B (Alta) | Inflamabilidade: 1 (Não), 2L (Leve), 2 (Média), 3 (Alta)', explicacao: 'R32 = A2L | R290 = A3 | R410A = A1' },
            { label: 'Vácuo Profundo Obrigatório', formula: 'Pressão Final ≤ 500 microns de Hg (0,66 mbar)', explicacao: 'Vaporiza e remove 100% da água líquida contida no interior das tubulações a 20°C' },
            { label: 'Teste de Estanqueidade com Nitrogênio Seco (OFN)', formula: 'P_teste = 1,1 × PS_max (típico 35 a 42 bar)', explicacao: 'Pressurização exclusiva com Nitrogênio Isento de Oxigênio (OFN); NUNCA usar oxigênio ou ar!' }
          ],
          pontosOperacionais: [
            'REGRA DE SEGURANÇA VITAL: NUNCA pressurizar tubulações de ar-condicionado com Oxigênio puro ou Ar Comprimido! O óleo de refrigeração sintético POE misturado com oxigênio sob pressão gera combustão espontânea e detonação de choque térmico com força de dinamite, matando técnicos.',
            'Procedimento correto de Vácuo: Bomba de vácuo de duplo estágio com vacuômetro eletrônico digital de precisão. Atingir < 500 microns e realizar o Teste de Estabilidade de Vácuo durante 15 minutos: se a pressão subir até a pressão ambiente, há vazamento físico; se subir até 1500 microns e estabilizar, há umidade dentro da tubulação.',
            'Ferramentas Spark-Free para R32 (A2L) e R290 (A3): recolhedoras de fluido e bombas de vácuo devem ter motores sem escovas (brushless) e relés de partida vedados que não emitam faíscas elétricas.',
            'Carga em fase líquida: fluidos mistos (blends zeotrópicos como R410A) devem ser carregados EXCLUSIVAMENTE com o cilindro virado para baixo (em fase líquida) com balança eletrônica de precisão, para evitar desfracionamento da mistura química.'
          ],
          fieldCase: {
            localizacao: 'Zimpeto, Maputo',
            cenario: 'Técnico autônomo realizou instalação de um ar-condicionado Split Inverter R32 de 18000 BTU e utilizou um compressor de geladeira caseiro adaptado para fazer vácuo durante 5 minutos.',
            diagnostico: 'O compressor caseiro não atinge vácuo profundo (chegou apenas a 200 mbar). O vapor d\'água residual reagiu quimicamente com o óleo sintético POE (Poliéster) por hidrólise ácida, formando ácido fluorídrico e lamas metálicas que obstruíram a válvula de expansão eletrônica e queimaram o estator do compressor após 40 dias de funcionamento.',
            solucaoNormativa: 'Limpeza de toda a tubulação com fluido de lavagem solvente biodegradável, nitrogênio seco a 30 bar, instalação de filtro secador antiácido e execução de vácuo rigoroso até 220 microns com bomba de vácuo homologada de dois estágios antes da carga de fluido R32 virgem por balança digital.'
          },
          funcionamento: 'A água a 20°C ferve e evapora a 23 mbar (17500 microns). Abaixo de 500 microns, qualquer traço microscópico de umidade é convertido em vapor seco e ejetado pela bomba de vácuo.',
          aplicacaoMocambique: 'A importação de aparelhos com gás R22 é proibida e aparelhos com R410A estão sendo substituídos por R32 nas lojas de Moçambique. Técnicos certificados no manuseio de A2L lideram os contratos empresariais.',
          exemploPratico: 'Teste de estanqueidade segundo EN 378: pressurizar com Nitrogênio OFN a 10 bar, 25 bar e finalmente 38 bar. Aplicar detergente neutro ou detector ultrassônico em todas as juntas flangeadas e aguardar 24 horas sem queda de pressão corrigida pela temperatura.',
          calculationSnippet: 'Vácuo ≤ 500 microns | Pressurização com Nitrogênio OFN | R32 = A2L (equipamento anti-faísca)'
        },
        quiz: {
          question: 'Durante a instalação e comissionamento de um sistema de climatização Inverter que utiliza o novo fluido ecológico R32 (Classe A2L) sob a norma EN 378, qual procedimento de ensaio de estanqueidade e desidratação é estritamente OBRIGATÓRIO?',
          options: [
            { id: 'A', text: 'Pressurizar com oxigênio medicinal a 50 bar e não fazer vácuo.', isCorrect: false, feedback: 'Perigo extremo de explosão mortal por reação espontânea entre oxigênio e óleo POE!' },
            { id: 'B', text: 'Realizar o teste de estanqueidade exclusivamente com Nitrogênio Seco (OFN) sob pressão normatizada e executar vácuo profundo até atingir pressão residual inferior a 500 microns de Hg com vacuômetro digital.', isCorrect: true, feedback: 'Correto! A norma EN 378 prescreve teste de pressão com gás inerte seco (Nitrogênio Isento de Oxigênio) e vácuo profundo < 500 microns para eliminar todo o vapor d\'água antes da carga.' },
            { id: 'C', text: 'Purgar o ar abrindo a válvula de serviço por 3 segundos com o próprio gás do aparelho.', isCorrect: false, feedback: 'A prática de expurgo livre é proibida por lei ambiental e deixa ar/umidade no circuito.' },
            { id: 'D', text: 'Lavar a tubulação por dentro com água morna e sabão.', isCorrect: false, feedback: 'Água destrói o óleo POE e queima o compressor em poucos dias.' }
          ],
          explanation: 'A norma EN 378 e manuais de engenharia de refrigeração estabelecem que o teste de pressão de estanqueidade deve ser feito obrigatoriamente com gás inerte seguro, especificamente Nitrogênio Isento de Oxigênio (OFN - Oxygen Free Nitrogen). O ar atmosférico ou oxigênio puro são proibidos devido ao risco severo de explosão em contato com o óleo de refrigeração. Adicionalmente, a desidratação do sistema requer vácuo profundo medido com vacuômetro eletrônico abaixo de 500 microns de mercúrio (0,66 mbar).',
          keyTakeaway: 'Estanqueidade com Nitrogênio OFN e Vácuo < 500 microns de Hg são mandatórios na EN 378.',
          xpReward: 50
        }
      },
      {
        id: 'elec_m9_ec3_vrf_inverter_bldc',
        moduleId: 'elec_mod_9_climatizacao_hvac',
        moduleTitle: 'Módulo 9: Climatização, HVAC & Refrigeração (Norma EN 378)',
        order: 3,
        code: 'EC 9.3',
        title: 'Diagnóstico Eletromecânico em Compressores Inverter BLDC e Sistemas VRF',
        norma: 'IEC 60335-2-40 / EN 378-2',
        level: 'Avançado',
        durationMinutes: 18,
        theory: {
          conceito: 'Compressores Inverter de alta eficiência utilizam motores trifásicos síncronos de ímãs permanentes (Brushless DC - BLDC / PMSM) acionados por módulos de potência IPM (Intelligent Power Module) integrados na placa eletrônica. Em sistemas de Fluxo de Refrigerante Variável (VRF / VRV), uma única unidade condensadora externa alimenta dezenas de evaporadoras internas com expansão individual modulada por válvulas eletrônicas de expansão (EEV com motor de passo).',
          formulas: [
            { label: 'Balanceamento de Enrolamento BLDC', formula: 'R_UV = R_VW = R_WU (Tolerância ≤ 2%)', explicacao: 'Resistência ôhmica miliohmimétrica entre as 3 fases deve ser estritamente igual' },
            { label: 'Resistência de Isolação do Compressor Inverter', formula: 'R_iso ≥ 100 MΩ (a 500 Vcc)', explicacao: 'Medição entre qualquer terminal do motor e a carcaça de cobre/ferro aterrada' },
            { label: 'Tensão de Saída do Módulo IPM (em funcionamento)', formula: 'V_UV ≈ V_VW ≈ V_WU (AC simétrico)', explicacao: 'Tensões alternadas moduladas em PWM simétricas sob carga' }
          ],
          pontosOperacionais: [
            'Como testar um compressor Inverter: 1. Desconectar o chicote de cabos dos bornes U, V, W; 2. Medir com multímetro digital na menor escala de resistência ôhmica entre os pares U-V, V-W e W-U. Valores típicos variam entre 0,5 Ω e 3,0 Ω dependendo do porte, mas os três valores DEVEM ser perfeitamente iguais! Se houver diferença superior a 0,1 Ω, há espiras em curto no estator.',
            'Teste do Módulo de Potência IPM com multímetro na escala de diodo: medir a queda de tensão entre os 6 diodos internos (Ponta positiva no P e negativa em U, V, W -> deve dar OL; ponta negativa no P e positiva em U,V,W -> deve dar aprox. 0,45V a 0,55V). Repetir a medição para o polo negativo N.',
            'Comunicação serial de 2 fios em sistemas VRF: protocolo RS485 com resistor de terminação de fim de linha de 120 Ω; fiação com cabo blindado trançado de 2 × 0,75 mm² polarizado.',
            'Ciclo de Retorno de Óleo automático: como sistemas VRF operam com tubulações com comprimento de até 150 a 1000 metros, a condensadora aciona a cada 4 horas uma purga de alta velocidade para arrastar o óleo de volta ao cárter do compressor.'
          ],
          fieldCase: {
            localizacao: 'Avenida 24 de Julho, Maputo',
            cenario: 'Edifício corporativo com sistema VRF de 14 HP acusando código de erro "P4" (Sobrecarga de corrente no compressor Inverter / Falha de IPM) com parada total da climatização de todo o andar.',
            diagnostico: 'Com o sistema desligado, a equipe desconectou os bornes do compressor. A medição de resistência acusou: R_UV = 1,12 Ω, R_VW = 1,11 Ω, R_WU = 1,12 Ω (motor perfeito). No entanto, o teste na escala de diodo do módulo IPM na placa mãe acusou 0,00 V entre o barramento positivo DC (P) e o pino U (curto-circuito interno do IGBT de alta por sobretensão).',
            solucaoNormativa: 'Substituição da placa principal de potência (Inverter Board) com aplicação de pasta térmica de prata no dissipador de alumínio e instalação de SPD Classe II de 40 kA dedicado no quadro elétrico de força do VRF. O sistema inicializou com sucesso e modulou a rotação suavemente.'
          },
          funcionamento: 'A modulação por vetor espacial (SVPWM) monitora a força contraeletromotriz (B-EMF) gerada pelos ímãs de neodímio do rotor, sincronizando os pulsos elétricos sem necessidade de sensores mecânicos Hall.',
          aplicacaoMocambique: 'A corrosão por salitre em cidades costeiras corrói trilhas finas das placas eletrônicas de condensadoras VRF expostas ao ar livre. É indispensável aplicar verniz tropicalizado de uretano em todas as placas de circuito impresso.',
          exemploPratico: 'Diagnóstico de Válvula de Expansão Eletrônica (EEV): bobina de 5 ou 6 fios com motor de passo. A resistência entre o fio comum de alimentação e cada uma das 4 fases deve ser idêntica (típico 46 Ω ± 3 Ω). Se alguma fase ler infinito, a bobina está queimada e a válvula fica travada fechada.',
          calculationSnippet: 'Motor Inverter BLDC: R_UV = R_VW = R_WU | IPM: teste de diodos na escala de semicondutores'
        },
        quiz: {
          question: 'Em um sistema de ar condicionado Inverter com motor de compressor BLDC trifásico trifásico que não parte e acusa alarme de sobrecorrente, o técnico desconecta os cabos e mede com multímetro calibrado as seguintes resistências ôhmicas entre os bornes: R_UV = 1,42 Ω, R_VW = 1,41 Ω e R_WU = 0,22 Ω. Qual é o diagnóstico técnico correto?',
          options: [
            { id: 'A', text: 'O compressor está em perfeito estado e o problema é falta de gás.', isCorrect: false, feedback: 'As resistências estão totalmente desbalanceadas.' },
            { id: 'B', text: 'O compressor apresenta curto-circuito interno entre espiras do enrolamento da fase W-U (apenas 0,22 Ω), exigindo a substituição mecânica do compressor.', isCorrect: true, feedback: 'Exato! Em compressores Inverter BLDC, as três leituras de enrolamento devem ser rigorosamente idênticas. A leitura de 0,22 Ω evidencia curto interno entre espiras.' },
            { id: 'C', text: 'A placa eletrônica está invertendo o sentido de giro.', isCorrect: false, feedback: 'A medição ôhmica foi realizada diretamente nos bornes do motor desconectado.' },
            { id: 'D', text: 'Basta lubrificar a borboleta do compressor com óleo de motor de carro.', isCorrect: false, feedback: 'Procedimento absurdo que destruiria totalmente o sistema frigorífico.' }
          ],
          explanation: 'Os compressores Inverter com motores BLDC de ímãs permanentes possuem enrolamentos estatóricos simétricos de altíssima precisão. As resistências ôhmicas medidas entre qualquer par de fases (U-V, V-W e W-U) devem ser estritamente iguais com tolerância máxima de 2%. Uma leitura de 0,22 Ω enquanto as outras medem 1,42 Ω confirma um curto-circuito interno severo entre espiras de cobre da fase W-U, o que provoca sobrecorrente destrutiva no módulo IPM e inviabiliza a partida.',
          keyTakeaway: 'Compressores Inverter BLDC: R_UV = R_VW = R_WU. Diferença ôhmica indica queima do estator.',
          xpReward: 50
        }
      }
    ]
  },

  // ==========================================================================
  // MÓDULO 10: SEGURANÇA ELETRÔNICA, CCTV & CONTROLE DE ACESSO
  // ==========================================================================
  {
    id: 'elec_mod_10_seguranca_cctv',
    area: 'eletrotecnica',
    order: 10,
    title: 'Módulo 10: Segurança Eletrônica, CCTV & Controle de Acesso',
    description: 'Infraestrutura de CCTV IP (PoE 802.3af/at/bt), cercas elétricas normatizadas (IEC 60335-2-76) com aterramento dedicado e sistemas de controle de acesso Fail-Safe.',
    icon: 'ShieldCheck',
    normasReferencia: ['IEC 60335-2-76', 'IEEE 802.3af/at/bt', 'ISO/IEC 11801'],
    lessons: [
      {
        id: 'elec_m10_ec1_cctv_ip_poe',
        moduleId: 'elec_mod_10_seguranca_cctv',
        moduleTitle: 'Módulo 10: Segurança Eletrônica, CCTV & Controle de Acesso',
        order: 1,
        code: 'EC 10.1',
        title: 'Infraestrutura de CCTV IP, Padrões PoE e Cabeamento Estruturado',
        norma: 'IEEE 802.3af / IEEE 802.3at / ISO/IEC 11801',
        level: 'Intermediário',
        durationMinutes: 15,
        theory: {
          conceito: 'Sistemas modernos de videovigilância utilizam Câmeras IP conectadas a Gravadores de Vídeo em Rede (NVR) através de infraestrutura de cabeamento estruturado Cat6/Cat6A. A tecnologia Power over Ethernet (PoE) transmite dados de rede e energia elétrica contínua (48Vcc a 54Vcc) simultaneamente no mesmo cabo de par trançado UTP/STP, eliminando a necessidade de tomadas locais de 230V junto às câmeras.',
          formulas: [
            { label: 'Padrão PoE 802.3af (Tipo 1)', formula: 'Potência na Fonte: 15,4 W | Potência na Câmera: 12,95 W', explicacao: 'Ideal para câmeras dome e bullet fixas convencionais' },
            { label: 'Padrão PoE+ 802.3at (Tipo 2)', formula: 'Potência na Fonte: 30,0 W | Potência na Câmera: 25,5 W', explicacao: 'Exigido para câmeras com iluminação infravermelha potente e aquecedor' },
            { label: 'Padrão Hi-PoE / PoE++ 802.3bt (Tipo 3 e 4)', formula: 'Potência na Fonte: 60 W a 90 W', explicacao: 'Exigido para câmeras móveis PTZ de longo alcance com motor e limpador de lente' },
            { label: 'Distância Máxima de Cabeamento UTP Cat6', formula: 'L_max = 90 m (Link Permanente) + 10 m (Patch Cords) = 100 m', explicacao: 'Limite físico da norma Ethernet para evitar perda de pacotes e queda de tensão' }
          ],
          pontosOperacionais: [
            'Calculo do Balanço de Potência (PoE Power Budget): o switch PoE de 8 ou 16 portas possui um limite total em Watts (ex: 120W). A soma da potência máxima de todas as câmeras com o infravermelho e aquecedor ligados à noite não pode exceder o Power Budget do switch!',
            'Taxas de compressão de vídeo: a migração de H.264 para H.265 e H.265+ reduz o consumo de banda de rede e o espaço em disco no NVR em mais de 50% a 70% para a mesma resolução 4K.',
            'Queda de tensão em cabos longos: a resistência de condutores de alumínio cobreado (CCA) baratos é muito superior à do cobre puro 100%. NUNCA usar cabo CCA em instalações PoE; cabos de alumínio derretem ou provocam reinicialização noturna de câmeras.',
            'Uso de protetores de surto RJ45 PoE na entrada das câmeras externas montadas em postes para desviar descargas induzidas por raios.'
          ],
          fieldCase: {
            localizacao: 'Bairro Triunfo, Cidade de Maputo',
            cenario: 'Condomínio fechado com 14 câmeras IP onde duas câmeras móveis PTZ externas reiniciavam ciclicamente toda vez que escurecia às 18h30.',
            diagnostico: 'As câmeras estavam conectadas por cabo Cat6 de 85 metros a um switch padrão PoE 802.3af (máximo de 15,4W por porta). Durante o dia, sem iluminação noturna, a câmera consumia apenas 8W. Ao anoitecer, o acendimento dos potentes canhões de LED infravermelho de 50 metros elevava o consumo para 22W. O switch cortava a alimentação por sobrecorrente de porta.',
            solucaoNormativa: 'Substituição das portas por injetores PoE+ 802.3at dedicados de 30W com cabo Cat6 100% cobre homologado. As câmeras PTZ passaram a operar com estabilidade total 24 horas por dia.'
          },
          funcionamento: 'A fonte PoE detecta a assinatura resistiva (25 kΩ) da câmera antes de injetar a tensão de 48V, evitando queimar computadores convencionais plugados na mesma porta.',
          aplicacaoMocambique: 'A maresia e poeira em áreas industriais de Moçambique exigem caixas de passagem IP66 e conectores RJ45 blindados com silicone dielétrico nas emendas externas para evitar oxidação verde de cobre.',
          exemploPratico: 'Dimensionamento de HD para NVR: 8 câmeras de 4MP em H.265 a 15 fps com gravação contínua consomem aprox. 16 Mbps total = 170 GB/dia. Para 30 dias de gravação contínua, exige-se HD de vigilância dedicado (Western Digital Purple ou Seagate SkyHawk) de 6 TB.',
          calculationSnippet: 'PoE: 15,4W | PoE+: 30W | PoE++: 60-90W | Distância máx = 100 metros cabo 100% cobre'
        },
        quiz: {
          question: 'Em um projeto de segurança eletrônica predial com câmeras de alta resolução, o técnico precisa alimentar uma câmera IP Speed Dome PTZ externa com consumo nominal máximo de 24 W quando os motores e o iluminador infravermelho estão ligados. Qual padrão Power over Ethernet (PoE) deve ser obrigatoriamente especificado no switch segundo a norma IEEE?',
          options: [
            { id: 'A', text: 'Padrão PoE 802.3af (Tipo 1), que fornece até 15,4 W na porta.', isCorrect: false, feedback: '15,4 W é insuficiente para alimentar uma carga de 24 W; a câmera reiniciará constantemente.' },
            { id: 'B', text: 'Padrão PoE+ 802.3at (Tipo 2), que fornece até 30,0 W na fonte e garante 25,5 W úteis no dispositivo.', isCorrect: true, feedback: 'Correto! O padrão IEEE 802.3at (PoE+) fornece até 30 W por porta, atendendo com folga a demanda de 24 W da câmera PTZ sob carga noturna.' },
            { id: 'C', text: 'Conectar diretamente na tomada de 230 V sem fonte.', isCorrect: false, feedback: 'Causaria explosão e queima imediata da placa eletrônica da câmera.' },
            { id: 'D', text: 'Cabo USB doméstico de 5 Volts.', isCorrect: false, feedback: '5V não transmite energia em cabos de rede de longa distância.' }
          ],
          explanation: 'O padrão original IEEE 802.3af (PoE Tipo 1) é limitado a uma potência máxima de 15,4 W na porta do switch (entregando cerca de 12,95 W na ponta do cabo após perdas ôhmicas). Câmeras PTZ com motores de movimentação rápida e canhões infravermelhos consomem mais de 20 W, exigindo a adoção do padrão IEEE 802.3at (PoE+ Tipo 2), capaz de entregar até 30 W na porta e 25,5 W úteis no dispositivo final.',
          keyTakeaway: 'Câmeras PTZ (> 13W): exigem obrigatoriamente switches com padrão PoE+ (IEEE 802.3at) até 30W.',
          xpReward: 50
        }
      },
      {
        id: 'elec_m10_ec2_cerca_eletrica_normas',
        moduleId: 'elec_mod_10_seguranca_cctv',
        moduleTitle: 'Módulo 10: Segurança Eletrônica, CCTV & Controle de Acesso',
        order: 2,
        code: 'EC 10.2',
        title: 'Cercas Elétricas Normatizadas (IEC 60335-2-76) e Aterramento Dedicado',
        norma: 'IEC 60335-2-76 / IEC 60364-4-41',
        level: 'Avançado',
        durationMinutes: 16,
        theory: {
          conceito: 'Cercas elétricas de segurança perimetral são projetadas para dissuadir invasões através de choques de alta tensão não letais. A norma internacional mandatória IEC 60335-2-76 (Anexo BB) regulamenta rigorosamente os parâmetros dos eletrificadores para garantir a segurança da vida humana, impedindo a parada cardíaca irreversível em pessoas ou animais que toquem na fiação.',
          formulas: [
            { label: 'Energia Máxima do Pulso (Norma IEC)', formula: 'E_pulso ≤ 5,0 Joules (sob carga de 500 Ω)', explicacao: 'Energia máxima do choque para não causar fibrilação ventricular' },
            { label: 'Tensão de Pico do Pulso', formula: 'V_pico = 8.000 V a 10.000 V (8 kV a 10 kV)', explicacao: 'Alta tensão para romper a resistência da pele e roupas sem queimar tecidos' },
            { label: 'Duração e Frequência dos Pulsos', formula: 'Duração < 0,1 ms (100 μs) | Intervalo = 1 pulso por segundo (1 Hz)', explicacao: 'Garante que a vítima consiga soltar o condutor durante a pausa de 1 segundo' },
            { label: 'Separação Física de Aterramentos', formula: 'Distância Mínima ≥ 10 metros', explicacao: 'Separação estrita entre o eletrodo de terra da cerca e o terra da rede da EDM' }
          ],
          pontosOperacionais: [
            'REGRA CRÍTICA DE ATERRAMENTO: É TERMINANTEMENTE PROIBIDO interligar a haste de aterramento do eletrificador da cerca elétrica à malha de terra da instalação residencial ou da EDM! O pulso de 10 kV retorna pela terra; se estiverem juntos, pulsos de milhares de volts atingirão a carcaça de geladeiras, computadores e torneiras elétricas!',
            'O aterramento da cerca deve ser composto por 3 hastes de cobre cobreado (5/8" × 2,4m) em linha espaçadas de 2 metros com cabo de alta isolação exclusivo.',
            'Altura mínima de instalação: os fios eletrificados da cerca devem estar instalados a uma altura mínima de 2,20 metros em relação ao solo em muros residenciais para impedir o contato acidental de crianças.',
            'Placas de advertência obrigatórias: instaladas a cada 10 metros, na cor amarelo e preto com símbolo universal de raio e os dizeres "PERIGO - CERCA ELÉTRICA" em português legível.'
          ],
          fieldCase: {
            localizacao: 'Matola Rio, Maputo',
            cenario: 'Residência particular onde televisores SMART e a placa eletrônica do portão automático queimavam a cada disparo de alarme da cerca elétrica, e a moradora sentia formigamento na torneira do chuveiro.',
            diagnostico: 'O técnico amador que instalou o eletrificador ligou o fio de retorno de terra do aparelho na mesma barra de terra (PE) do quadro de distribuição da casa. Cada pulso de 10000V gerava indução transitória reversa no condutor de terra doméstico, destruindo os circuitos lógicos de baixa tensão e eletrificando os canos de água.',
            solucaoNormativa: 'Desconexão imediata do terra comum. Cravação de 3 hastes de terra dedicadas a 14 metros de distância da casa, conectadas por cabo de dupla isolação de 20 kV diretamente ao borne "Terra" do eletrificador. O ruído elétrico e as queimas cessaram instantaneamente.'
          },
          funcionamento: 'O eletrificador carrega um banco interno de capacitores de alta tensão e os descarrega em fração de microssegundo através de um transformador de pulsos acionado por tiristor.',
          aplicacaoMocambique: 'A criminalidade urbana faz da cerca elétrica o dispositivo de segurança perimetral mais comum em cidades moçambicanas. Instalações fora da IEC 60335-2-76 configuram crime de homicídio culposo ou lesão corporal grave.'
          ,exemploPratico: 'Fio de cerca elétrica: arame de aço inoxidável austenítico 304 ou 316 (ou liga especial de alumínio) de 0,7 mm a 1,2 mm com isoladores de polipropileno virgem com proteção UV contra o sol forte da África austral.',
          calculationSnippet: 'IEC 60335-2-76: Pulso ≤ 5J | Intervalo ≥ 1s | Terra da cerca separado ≥ 10m do terra EDM'
        },
        quiz: {
          question: 'De acordo com a norma internacional de segurança de eletrificadores IEC 60335-2-76, qual é a distância mínima obrigatória que deve separar o elétrodo de aterramento exclusivo de uma cerca elétrica em relação a qualquer elétrodo de terra da rede elétrica da concessionária (EDM) ou de telecomunicações?',
          options: [
            { id: 'A', text: 'Não há necessidade de separação, devem ser soldados juntos na mesma haste.', isCorrect: false, feedback: 'Erro gravíssimo! Faria os pulsos de 10 kV da cerca penetrarem na carcaça de eletrodomésticos, matando usuários.' },
            { id: 'B', text: 'Mínimo absoluto de 10 metros de distância física entre os eletrodos de terra.', isCorrect: true, feedback: 'Correto! A IEC 60335-2-76 exige que o aterramento da cerca elétrica fique situado a pelo menos 10 metros de distância de qualquer outro sistema de aterramento para evitar transferência de alta tensão.' },
            { id: 'C', text: 'Exatamente 10 centímetros.', isCorrect: false, feedback: '10 cm não impede a condução iônica do pulso de alta tensão pelo solo.' },
            { id: 'D', text: '50 metros no ar e 0 metros na terra.', isCorrect: false, feedback: 'Afirmação incoerente e sem base normativa.' }
          ],
          explanation: 'A norma IEC 60335-2-76 (Anexo BB) proíbe expressamente a conexão do terra do eletrificador ao neutro ou à malha de terra de proteção da instalação elétrica ou telefônica. Para garantir que os pulsos de alta tensão (até 10.000 V) gerados durante o choque não sejam transferidos para os equipamentos elétricos residenciais através do solo, os eletrodos de terra do eletrificador devem estar localizados a uma distância de pelo menos 10 metros de qualquer outra haste ou elétrodo de aterramento.',
          keyTakeaway: 'Aterramento de cerca elétrica: deve ficar a pelo menos 10 metros de distância do aterramento da EDM.',
          xpReward: 50
        }
      },
      {
        id: 'elec_m10_ec3_controle_acesso_failsafe',
        moduleId: 'elec_mod_10_seguranca_cctv',
        moduleTitle: 'Módulo 10: Segurança Eletrônica, CCTV & Controle de Acesso',
        order: 3,
        code: 'EC 10.3',
        title: 'Sistemas de Controle de Acesso, Eletroímãs Fail-Safe vs Fail-Secure',
        norma: 'EN 60839-11-1 / EN 13637',
        level: 'Intermediário',
        durationMinutes: 15,
        theory: {
          conceito: 'Sistemas de Controle de Acesso Eletrônico regulam a entrada e saída de pessoas em áreas restritas utilizando credenciais (cartões RFID 13,56 MHz / 125 kHz, biometria digital, reconhecimento facial) acopladas a controladoras de porta e dispositivos eletromecânicos de travamento. O princípio fundamental de segurança patrimonial versus preservação da vida humana divide as fechaduras em dois grupos opostos:\n• Fail-Safe (Seguro contra Falha): Destranca na falta de energia elétrica (prioridade: SALVAR VIDAS).\n• Fail-Secure (Seguro contra Invasão): Permanece trancado na falta de energia elétrica (prioridade: GUARDAR PATRIMÔNIO).',
          formulas: [
            { label: 'Eletroímã Magnético (Eletromagnet Lock)', formula: 'Tipo Fail-Safe (alimentado para travar)', explicacao: 'Força de sustentação magnética: 280 kgf, 350 kgf ou 500 kgf a 12 Vcc' },
            { label: 'Fechadura Solenoide / Trinco Elétrico', formula: 'Geralmente Fail-Secure (pulso elétrico para destravar)', explicacao: 'Mantém a porta trancada em caso de corte de energia na rua' },
            { label: 'Bateria de Backup (No-Break 12V)', formula: 'Capacidade Ah = (I_total_A × Horas_autonomia) / 0,8', explicacao: 'Baterias seladas VRLA de 12V 7Ah garantem operação contínua' }
          ],
          pontosOperacionais: [
            'REGRA DE ROTAS DE FUGA E INCÊNDIO (EN 13637): Portas de saída de emergência e rotas de fuga contra incêndio DEVEM ser obrigatoriamente configuradas em modo FAIL-SAFE (eletroímãs)! Se o alarme de incêndio disparar ou a energia for cortada, as portas destrancam instantaneamente para evitar que as pessoas morram presas.',
            'Botão "Quebre o Vidro" (Emergency Break Glass): instalado em série com a alimentação de 12V do eletroímã na saída de cada porta crítica, permitindo o corte mecânico direto da energia da fechadura mesmo que o software da controladora congele.',
            'Diodo de Roda Livre (Flyback Diode 1N4007): obrigatório em paralelo com a bobina de qualquer fechadura eletromecânica com o catodo no polo positivo para extinguir a contraeletromotriz (indutiva) que queima os relés das controladoras.',
            'Protocolo Wiegand (D0 e D1) versus RS485 / OSDP: o protocolo OSDP (Open Supervised Device Protocol) com criptografia AES-128 substitui o padrão Wiegand por ser imune a clonagem de cartões.'
          ],
          fieldCase: {
            localizacao: 'Nampula Cidade, Nampula',
            cenario: 'Agência bancária onde a porta corta-fogo de evacuação lateral possuía trinco elétrico Fail-Secure. Durante um princípio de incêndio com fumaça e corte do disjuntor geral, os funcionários entraram em pânico porque a porta de saída permaneceu rigidamente trancada.',
            diagnostico: 'A instalação violava flagrantemente as normas internacionais de segurança humana (EN 13637): usar uma fechadura que mantém a porta bloqueada sem energia em rota de fuga é uma infração gravíssima com risco de mortes em massa.',
            solucaoNormativa: 'Substituição por fechadura eletromagnética Fail-Safe de 280 kgf integrada ao painel de detecção de incêndio, que corta os 12V de alimentação assim que qualquer detector de fumaça aciona, liberando a passagem imediata.'
          },
          funcionamento: 'O eletroímã gera um campo magnético potente que atrai uma placa de aço (bloco de atrito) fixada na folha da porta com força de retenção de centenas de quilos sem nenhuma peça móvel de desgaste.',
          aplicacaoMocambique: 'Edifícios corporativos e condomínios em Maputo utilizam amplamente controladoras IP com leitores de reconhecimento facial alimentados por fontes no-break de 12V 5A com bateria interna.',
          exemploPratico: 'Porta de cofre ou tesouraria de valores: usa sistema Fail-Secure (se a energia cair, ninguém entra). Porta de saída de emergência de cinema ou shopping: usa sistema Fail-Safe (se a energia cair, todos conseguem sair).',
          calculationSnippet: 'Fail-Safe: corta energia = DESTRANCA (Rotas de fuga) | Fail-Secure: corta energia = TRANCADO'
        },
        quiz: {
          question: 'Em um projeto de automação predial e controle de acesso de acordo com a norma europeia de rotas de evacuação EN 13637, qual tipo de fechadura elétrica DEVE ser especificada obrigatoriamente para portas situadas em rotas de fuga e saídas de emergência contra incêndio?',
          options: [
            { id: 'A', text: 'Fechadura Fail-Secure (que permanece travada na ausência de energia para evitar furtos).', isCorrect: false, feedback: 'Totalmente proibido! Trancaria as pessoas dentro do prédio em chamas, causando mortes por asfixia.' },
            { id: 'B', text: 'Fechadura Fail-Safe (como eletroímãs magnéticos), que destranca automaticamente e libera a passagem imediata em caso de corte de energia elétrica ou alarme de incêndio.', isCorrect: true, feedback: 'Correto! Em rotas de fuga a preservação da vida humana é prioritária: o sistema deve ser Fail-Safe, liberando a porta instantaneamente sem energia.' },
            { id: 'C', text: 'Correntes de aço com cadeado manual com chave guardada no cofre.', isCorrect: false, feedback: 'Violação criminosa de segurança pública.' },
            { id: 'D', text: 'Qualquer fechadura manual que precise de senha digitada no escuro.', isCorrect: false, feedback: 'Em pânico e fumaça é impossível digitar senhas.' }
          ],
          explanation: 'As normas internacionais de proteção contra incêndio e saídas de emergência (EN 13637 e NFPA 101) exigem que qualquer porta posicionada ao longo de uma rota de fuga de pessoas opere no modo Fail-Safe (falha segura). Dispositivos Fail-Safe necessitam de energia elétrica constante para manter a porta trancada (como fechaduras eletromagnéticas). Ao ocorrer um corte de eletricidade ou disparo da central de alarme de incêndio, o circuito de alimentação de 12 V é desenergizado e a porta abre livremente para garantir a evacuação imediata.',
          keyTakeaway: 'Rotas de fuga e saídas de emergência: EXIGEM obrigatoriamente fechaduras Fail-Safe (destrancam sem energia).',
          xpReward: 50
        }
      }
    ]
  },

  // ==========================================================================
  // MÓDULO 11: ENERGIA SOLAR FOTOVOLTAICA (IEC 61730 / IEC 61215)
  // ==========================================================================
  {
    id: 'elec_mod_11_energia_solar',
    area: 'eletrotecnica',
    order: 11,
    title: 'Módulo 11: Energia Solar Fotovoltaica (IEC 61730 / IEC 61215)',
    description: 'Dimensionamento de arranjos FV, janela de tensão MPPT, coeficientes térmicos, proteções CC (fusíveis gPV, chaves DC-PV2, SPDs CC) e bancos LiFePO4.',
    icon: 'Sun',
    normasReferencia: ['IEC 61215', 'IEC 61730', 'IEC 62548', 'IEC 62109'],
    lessons: [
      {
        id: 'elec_m11_ec1_dimensionamento_mppt_voc',
        moduleId: 'elec_mod_11_energia_solar',
        moduleTitle: 'Módulo 11: Energia Solar Fotovoltaica (IEC 61730 / IEC 61215)',
        order: 1,
        code: 'EC 11.1',
        title: 'Dimensionamento de Arranjos Fotovoltaicos, Janela MPPT e Correção de Voc',
        norma: 'IEC 62548 / IEC 61215',
        level: 'Avançado',
        durationMinutes: 18,
        theory: {
          conceito: 'O dimensionamento elétrico de geradores solares fotovoltaicos conecta módulos em série (formando Strings para elevar a tensão) e em paralelo (para somar correntes). O inversor utiliza o algoritmo de Rastreamento do Ponto de Máxima Potência (MPPT) para extrair o rendimento máximo instantâneo da curva I-V. A regra de ouro é garantir que a string opere rigorosamente dentro da janela de tensão do MPPT em qualquer condição climática anual.',
          formulas: [
            { label: 'Tensão Máxima de Circuito Aberto (Frio Extremo)', formula: 'V_oc_max = V_oc_STC × [1 + (β_Voc / 100) × (T_min - 25)]', explicacao: 'β_Voc é negativo (típico -0,28%/°C): a tensão de circuito aberto SOBE nas manhãs frias de inverno!' },
            { label: 'Tensão Mínima de Máxima Potência (Calor Extremo)', formula: 'V_mp_min = V_mp_STC × [1 + (γ_Vmp / 100) × (T_celula_max - 25)]', explicacao: 'A tensão de operação CAI em dias de verão escaldante (célula a 65°C)' },
            { label: 'Critério Crítico do Inversor', formula: 'N_modulos × V_oc_max ≤ V_max_inversor (ex: 600V, 1000V ou 1500V)', explicacao: 'Ultrapassar a tensão máxima queima a ponte de entrada do inversor de forma irreversível' },
            { label: 'Janela Operacional MPPT', formula: 'V_mppt_min ≤ N_modulos × V_mp_min', explicacao: 'A string não pode cair abaixo do limite inferior do MPPT nos dias quentes' }
          ],
          pontosOperacionais: [
            'Associação em Série: Soma as tensões (V_total = N × V) mantendo a mesma corrente (I = I_modulo). Atenção: módulos em série DEVEM ter a mesma corrente e orientação; uma célula sombreada reduz a corrente de toda a string!',
            'Associação em Paralelo: Soma as correntes (I_total = N × I) mantendo a mesma tensão.',
            'Orientação e Inclinação em Moçambique (Hemisfério Sul): Os módulos devem ser voltados obrigatoriamente para o NORTE geográfico com ângulo de inclinação entre 15° e 25° (correspondente à latitude local) para captar máxima irradiação anual e permitir auto-limpeza pela chuva.',
            'Conectores solares padronizados MC4: NUNCA conectar e desconectar sob carga em corrente contínua; a interrupção de circuitos CC gera arco elétrico persistente que funde os dedos e derrete os conectores plásticos.'
          ],
          fieldCase: {
            localizacao: 'Lichinga, Província de Niassa',
            cenario: 'Sistema solar comercial com inversor On-Grid de 1000 Vcc que entrava em alarme de falha crítica "DC Overvoltage" toda manhã de julho às 6h45, bloqueando a geração de energia.',
            diagnostico: 'O instalador calculou as strings com 20 módulos de 550W (Voc_STC = 49,8V a 25°C: 20 × 49,8 = 996V). Como Lichinga atinge 5°C nas madrugadas de inverno, com coeficiente β_Voc = -0,28%/°C, a tensão subia para: Voc = 49,8 × [1 + (-0,0028 × (5 - 25))] = 49,8 × 1,056 = 52,59 V por módulo. A string atingia 20 × 52,59 = 1051,8 Vcc, superando o limite de destruição de 1000V do inversor!',
            solucaoNormativa: 'Reconfiguração do arranjo em strings de 18 módulos (tensão máxima no inverno = 18 × 52,59 = 946,6 Vcc). O inversor operou perfeitamente em todas as manhãs frias de inverno sem alarmes.'
          },
          funcionamento: 'Os fótons da luz solar liberam elétrons na junção P-N de silício monocristalino (efeito fotovoltaico), gerando corrente contínua que flui através das fitas condutoras (busbars).',
          aplicacaoMocambique: 'Moçambique possui uma das maiores irradiações solares da África (5,0 a 6,5 kWh/m²/dia). No entanto, o calor extremo de cidades como Tete e Chimoio (célula atingindo 70°C) reduz a potência dos módulos em até 18% a 20%, exigindo sobredimensionamento correto de potência (Fator de Sobredimensionamento do Inversor FDR entre 1,20 e 1,35).'
          ,exemploPratico: 'Módulo de 550W: Vmp = 41,5V, Imp = 13,25A. String de 12 módulos: Tensão de operação no MPPT = 12 × 41,5V = 498Vcc. Corrente da string = 13,25A. Potência da string = 498 × 13,25 = 6600W (6,6 kWp).'
          ,calculationSnippet: 'Voc_max = Voc × [1 + β × (Tmin - 25)] | Norte geográfico | Conectores MC4'
        },
        quiz: {
          question: 'Em um projeto de usina solar fotovoltaica segundo a IEC 62548, um técnico está calculando o número máximo de módulos em série para uma string conectada a um inversor cuja tensão máxima absoluta de entrada suportada é de 1000 Vcc. Os módulos possuem Voc_STC = 50 V a 25°C e o coeficiente térmico é β_Voc = -0,30 %/°C. Na região de instalação a temperatura mínima de inverno pode atingir 5°C. Qual é a tensão máxima que cada módulo alcançará nessa manhã fria e qual é o número máximo de módulos em série admissível?',
          options: [
            { id: 'A', text: 'Voc = 50 V (a temperatura não afeta a tensão); máx. 20 módulos.', isCorrect: false, feedback: 'Totalmente errado! A tensão de painéis solares sobe no frio devido ao coeficiente térmico negativo.' },
            { id: 'B', text: 'Voc_max = 53,0 V (com a correção térmica); número máximo de 18 módulos em série (18 × 53,0 V = 954 Vcc < 1000 Vcc).', isCorrect: true, feedback: 'Perfeito! A 5°C: ΔT = 5 - 25 = -20°C. O aumento é de -0,30% × (-20) = +6%. Tensão corrigida: 50 V × 1,06 = 53,0 V por módulo. Para não ultrapassar 1000V: 1000 / 53 = 18,86 -> arredonda para baixo: 18 módulos.' },
            { id: 'C', text: 'Voc_max = 25 V; número máximo de 40 módulos em série.', isCorrect: false, feedback: 'A tensão sobe no frio, não cai pela metade.' },
            { id: 'D', text: 'Voc_max = 75 V; máx. 5 módulos.', isCorrect: false, feedback: 'Superestimação absurda da variação térmica.' }
          ],
          explanation: 'O coeficiente de temperatura da tensão de circuito aberto (β_Voc) é sempre negativo. Quando a temperatura ambiente cai abaixo da temperatura de teste padrão (25°C), a tensão de circuito aberto aumenta. Cálculo da tensão de circuito aberto máxima a 5°C: Voc_max = 50 V × [1 + (-0,0030 × (5 - 25))] = 50 V × [1 + 0,06] = 53,0 V por módulo. Para não exceder o limite de destruição do inversor de 1000 Vcc: N_max = 1000 V / 53,0 V = 18,86 módulos. Arredondando para o número inteiro inferior seguro, o limite absoluto é de 18 módulos em série por string.',
          keyTakeaway: 'No frio, a tensão solar sobe: sempre calcule Voc_max na temperatura mínima de inverno para não queimar o inversor.',
          xpReward: 50
        }
      },
      {
        id: 'elec_m11_ec2_protecoes_dc_gpv',
        moduleId: 'elec_mod_11_energia_solar',
        moduleTitle: 'Módulo 11: Energia Solar Fotovoltaica (IEC 61730 / IEC 61215)',
        order: 2,
        code: 'EC 11.2',
        title: 'Proteção em Corrente Contínua: Fusíveis gPV, Chaves DC-PV2 e SPDs CC',
        norma: 'IEC 62548 / IEC 60269-6 / IEC 61643-31',
        level: 'Avançado',
        durationMinutes: 16,
        theory: {
          conceito: 'A proteção elétrica no lado de Corrente Contínua (CC) de um arranjo solar possui desafios técnicos únicos e perigosos: a corrente contínua não possui passagem natural pelo zero (ao contrário da rede alternada de 50 Hz). Arcos elétricos em corrente contínua não se extinguem espontaneamente, sustentando-se no ar até a destruição de caixas de junção (String Boxes) e início de incêndios. A norma IEC 62548 define o uso de componentes certificados exclusivamente para aplicação fotovoltaica em CC.',
          formulas: [
            { label: 'Condição de Necessidade de Fusíveis gPV', formula: 'N_strings_paralelo ≥ 3', explicacao: 'Com 3 ou mais strings em paralelo no mesmo MPPT, o fusível de string é obrigatório' },
            { label: 'Dimensionamento do Fusível gPV (IEC 60269-6)', formula: '1,4 × I_sc_mod ≤ I_n_fusivel ≤ 2,4 × I_sc_mod', explicacao: 'Suporta a corrente máxima do módulo sem abrir indevidamente em picos de insolação' },
            { label: 'Chave Seccionadora sob Carga CC', formula: 'Categoria de Utilização DC-PV2 (IEC 60947-3)', explicacao: 'Capacidade comprovada de interromper corrente contínua e extinguir o arco elétrico com câmara deionizadora magnética' },
            { label: 'Tensão Máxima do SPD Fotovoltaico', formula: 'U_cpv ≥ 1,2 × V_oc_max', explicacao: 'Evita a condução prematura do varistor do DPS CC sob tensão máxima de circuito aberto' }
          ],
          pontosOperacionais: [
            'PERIGO DE INCÊNDIO: NUNCA utilizar disjuntores ou fusíveis de Corrente Alternada (AC) comuns em circuitos solares de Corrente Contínua! Disjuntores AC comuns não extinguem o arco CC; em caso de curto, a câmara queima, o plástico se funde e o quadro pega fogo!',
            'Fusíveis classe gPV (IEC 60269-6): projetados com elemento de prata pura imerso em areia de quartzo de alta pureza para interromper correntes de curto-circuito em menos de 10 milissegundos em tensões de até 1000Vcc ou 1500Vcc.',
            'Chave Seccionadora Rotativa CC: deve possuir barreira física anti-arco e manobra rápida independente da velocidade da mão do operador (ação rápida "snap-action").',
            'Descarregador de Sobretensões CC (IEC 61643-31): DPS exclusivo para CC com configuração em "Y" com varistores e centelhador para evitar que a queima do componente coloque o polo positivo em curto permanente com a terra.'
          ],
          fieldCase: {
            localizacao: 'Inhambane, Província de Inhambane',
            cenario: 'Incêndio em armazém comercial iniciado na caixa de junção (String Box) fotovoltaica de um sistema de 15 kWp com perda total do telhado.',
            diagnostico: 'A perícia dos bombeiros identificou que o eletricista utilizou um disjuntor bipolar termomagnético comercial de 230 Vac comum como seccionadora do circuito de 650 Vcc dos painéis. Ao tentar desligar o sistema sob carga com os módulos expostos ao sol do meio-dia, o arco elétrico CC não se apagou entre os contatos, saltou para a tampa plástica e incendiou o quadro de distribuição e o forro de madeira.',
            solucaoNormativa: 'Reconstrução da String Box com chave seccionadora rotativa certificada para Corrente Contínua categoria DC-PV2 1000 Vcc 32A, fusíveis gPV de 1000 Vcc em porta-fusíveis selados com LED indicador de queima e SPD fotovoltaico Tipo 1+2 homologado pela IEC 61643-31.'
          },
          funcionamento: 'A areia de quartzo contida dentro do tubo cerâmico do fusível gPV funde com o calor do arco elétrico de prata, transformando-se em um vidro isolante vítreo que bloqueia a passagem de elétrons.',
          aplicacaoMocambique: 'A alta taxa de tempestades elétricas em Moçambique exige SPDs CC conectados diretamente à malha de aterramento dos suportes metálicos dos painéis no telhado com cabo de cobre nu de pelo menos 16 mm².',
          exemploPratico: 'Módulo solar com Isc = 13,8 A. Dimensionamento do fusível gPV: In ≥ 1,4 × 13,8 A = 19,32 A. Seleciona-se o fusível gPV comercial padronizado de 20 A ou 25 A 1000 Vcc.',
          calculationSnippet: 'gPV obrigatório com ≥ 3 strings | Chave categoria DC-PV2 | Proibido usar disjuntor AC em CC!'
        },
        quiz: {
          question: 'Em uma instalação solar fotovoltaica com 4 strings em paralelo conectadas a um único MPPT de um inversor de 1000 Vcc, por que a norma internacional IEC 62548 EXIGE o uso de fusíveis dedicados classe gPV em cada string e PROÍBE expressamente o uso de disjuntores de Corrente Alternada (AC)?',
          options: [
            { id: 'A', text: 'Porque fusíveis gPV tornam os cabos invisíveis para economizar estética.', isCorrect: false, feedback: 'Sem qualquer fundamento técnico.' },
            { id: 'B', text: 'Porque a Corrente Contínua não tem passagem por zero para apagar o arco elétrico, e com 3 ou mais strings uma string com defeito recebe a corrente reversa de todas as outras somadas, gerando incêndio se não houver fusível gPV para corte rápido.', isCorrect: true, feedback: 'Correto! Em CC o arco é contínuo e persistente. Se uma string entrar em curto, as outras 3 strings injetam sua corrente combinada na falha. O fusível gPV isola a string defeituosa e a chave DC-PV2 extingue o arco com segurança.' },
            { id: 'C', text: 'Porque os disjuntores AC são muito caros e a norma visa reduzir custos.', isCorrect: false, feedback: 'Disjuntores AC são mais baratos, mas explodem em corrente contínua.' },
            { id: 'D', text: 'Porque em corrente contínua a energia solar flui em forma de ondas de rádio.', isCorrect: false, feedback: 'Afirmação sem sentido físico.' }
          ],
          explanation: 'Existem duas razões técnicas críticas: 1) A corrente contínua (CC) não possui a passagem natural pelo ponto zero que ocorre 100 vezes por segundo na corrente alternada (50 Hz). Disjuntores comuns de AC não possuem câmaras com ímãs de sopro magnético para esticar e extinguir arcos CC, resultando em arco persistente e incêndio se manobrados sob carga. 2) Quando há 3 ou mais strings em paralelo, se uma sofrer um curto-circuito interno, ela receberá a soma das correntes reversas de todas as outras strings em paralelo, superando a capacidade do cabo. O fusível gPV (IEC 60269-6) é projetado para desarmar sob essa corrente reversa e interromper o arco CC em milissegundos.',
          keyTakeaway: 'CC não tem passagem por zero: Exige chaves categoria DC-PV2 e fusíveis gPV dedicados.',
          xpReward: 50
        }
      },
      {
        id: 'elec_m11_ec3_baterias_lifepo4_offgrid',
        moduleId: 'elec_mod_11_energia_solar',
        moduleTitle: 'Módulo 11: Energia Solar Fotovoltaica (IEC 61730 / IEC 61215)',
        order: 3,
        code: 'EC 11.3',
        title: 'Sistemas Off-Grid e Híbridos: Dimensionamento de Baterias LiFePO4 e Cabos CC',
        norma: 'IEC 62619 / IEC 62485-2 / IEC 60364-5-52',
        level: 'Avançado',
        durationMinutes: 18,
        theory: {
          conceito: 'Sistemas solares isolados (Off-Grid) e Híbridos com armazenamento armazenam o excedente de energia solar diurna para atender ao consumo noturno ou durante cortes da rede da EDM. A química de Lítio Ferro Fosfato (LiFePO4 / LFP) substituiu amplamente as antigas baterias de Chumbo-Ácido/Gel devido à densidade energética superior, vida útil de mais de 4000 a 6000 ciclos (contra 800 ciclos do chumbo) e tolerância a descargas profundas sem degradação acelerada.',
          formulas: [
            { label: 'Energia Útil da Bateria (Wh)', formula: 'E_bateria_Wh = (Consumo_Diario_Wh × Dias_Autonomia) / (DoD × η_inversor)', explicacao: 'DoD (Profundidade de Descarga): 80% a 90% para Lítio LiFePO4 | 50% para Chumbo-Ácido' },
            { label: 'Capacidade em Amperes-hora (Ah)', formula: 'C_Ah = E_bateria_Wh / V_banco_CC', explicacao: 'Bancos padrão em 24Vcc ou preferencialmente 48Vcc para reduzir corrente' },
            { label: 'Corrente Máxima do Barramento da Bateria', formula: 'I_bateria_max = P_pico_inversor / (V_banco_min × η)', explicacao: 'Ex: Inversor de 5000 W em banco 48V (mín. 44V) com η = 92% -> I = 5000 / (44 × 0,92) = 123,5 A!' },
            { label: 'Ciclo de Vida LiFePO4 vs Chumbo', formula: 'Vida LiFePO4 ≥ 6000 ciclos a 80% DoD (mais de 15 anos)', explicacao: 'Chumbo-Ácido entrega apenas 800 a 1200 ciclos se descarregado a 50%' }
          ],
          pontosOperacionais: [
            'Gerenciamento Eletrônico BMS (Battery Management System - IEC 62619): o BMS integrado é o coração da bateria de lítio, controlando a tensão individual de cada célula, temperatura e balanceamento ativo. NUNCA carregar ou descarregar bateria de lítio sem BMS ativo!',
            'Seção dos Cabos de Bateria: Em 48V, a corrente atinge mais de 100A a 150A contínuos. O uso de cabos finos gera queda de tensão excessiva que faz o inversor desligar por "Low Battery Voltage" mesmo com a bateria carregada!',
            'Cabo mínimo recomendado para inversores de 5 kW 48V: cabo de cobre flexível de alta temperatura de 35 mm² a 50 mm² com terminais de compressão estanhados prensados com alicate hidráulico.',
            'Proteção da Bateria: uso obrigatório de seccionadora com fusível ultrarrápido classe aR ou NH gG (ex: 160A ou 200A) ou disjuntor termomagnético CC de alta capacidade de corte junto ao polo positivo.'
          ],
          fieldCase: {
            localizacao: 'Praia do Bilene, Província de Gaza',
            cenario: 'Pousada ecológica isolada da rede elétrica com sistema solar de 5 kW e banco de baterias LiFePO4 de 48V 200Ah (9,6 kWh). O inversor desligava com alarme de bateria esgotada toda vez que ligavam a bomba d\'água de 1,5 CV, mesmo com a bateria indicando 85% de carga.',
            diagnostico: 'O instalador utilizou cabos elétricos de apenas 16 mm² com 3 metros de distância entre o inversor e o banco de baterias. Sob o pico de partida do motor (corrente na bateria de 115 A), a queda de tensão na fiação (ΔV = 2 × L × I × ρ / S = 2 × 3 × 115 × 0,0225 / 16 = 0,97 V no cabo mais a perda por mau contato em terminais de olhal mal prensados somava quase 3,2 V). A tensão nos bornes do inversor caía abaixo do corte de 44 V.',
            solucaoNormativa: 'Aproximação do banco de baterias para 60 cm do inversor, substituição dos cabos por condutores flexíveis de 50 mm² com terminais tubulares estanhados prensados a 8 toneladas com alicate hidráulico. A queda de tensão caiu para menos de 0,15 V e o sistema passou a partir a bomba suavemente.'
          },
          funcionamento: 'A intercalação reversível de íons de lítio entre o catodo de fosfato de ferro e o anodo de grafite ocorre sem liberação de oxigênio térmico, tornando a química LiFePO4 a mais segura do mundo contra risco de fuga térmica (thermal runaway) e combustão.',
          aplicacaoMocambique: 'A temperatura ambiente elevada no interior de Moçambique degrada baterias de chumbo em menos de 2 anos (a cada 8°C acima de 25°C, a vida do chumbo cai pela metade). As baterias LiFePO4 suportam 40°C com degradação mínima, sendo o melhor investimento técnico.',
          exemploPratico: 'Consumo diário de uma residência: 8000 Wh/dia (8 kWh). Autonomia de 1 dia com bateria LiFePO4 (DoD = 85%, η = 90%): Energia da bateria = 8000 / (0,85 × 0,90) = 10457 Wh. Em banco de 48V: Capacidade = 10457 / 48 = 217,8 Ah. Instalam-se dois módulos de lítio de 48V 100Ah em paralelo (ou 1 módulo de 48V 200Ah).',
          calculationSnippet: 'LiFePO4: DoD 80-90% | 6000 ciclos | Cabos de 50mm² em 48V | BMS obrigatório (IEC 62619)'
        },
        quiz: {
          question: 'Em um sistema solar fotovoltaico autônomo (Off-Grid) de 48 Vcc que alimenta uma residência em Moçambique, qual é a principal razão técnica que torna as baterias de Lítio Ferro Fosfato (LiFePO4) imensamente superiores às baterias tradicionais de Chumbo-Ácido/Gel?',
          options: [
            { id: 'A', text: 'Baterias de lítio pesam 10 vezes mais e aquecem o recinto no inverno.', isCorrect: false, feedback: 'Pelo contrário: são muito mais leves e compactas que as de chumbo.' },
            { id: 'B', text: 'As baterias LiFePO4 suportam até 80-90% de Profundidade de Descarga (DoD) com mais de 4000 a 6000 ciclos de vida útil e excelente tolerância ao calor tropical, enquanto as de chumbo só suportam 50% de DoD e duram apenas 800 a 1200 ciclos, degradando-se rapidamente no calor.', isCorrect: true, feedback: 'Perfeito! O Lítio LiFePO4 entrega o dobro de energia útil diária por Ah instalado, dura mais de 10 a 15 anos diários e tolera o clima quente de Moçambique sem perder vida útil prematuramente.' },
            { id: 'C', text: 'Baterias de lítio funcionam sem condutores elétricos por telepatia quântica.', isCorrect: false, feedback: 'Afirmação sem qualquer sentido científico.' },
            { id: 'D', text: 'Baterias de chumbo são proibidas porque geram ouro em vez de eletricidade.', isCorrect: false, feedback: 'Afirmação jocosa.' }
          ],
          explanation: 'A tecnologia de Lítio Ferro Fosfato (LiFePO4 / IEC 62619) revolucionou os sistemas solares isolados por oferecer quatro vantagens inquestionáveis sobre o Chumbo-Ácido: 1) Profundidade de Descarga (DoD) utilizável de 80% a 90% (contra apenas 50% do chumbo, necessitando de metade da capacidade nominal em Ah); 2) Vida útil de 4.000 a 6.000 ciclos (mais de 12 a 15 anos de uso diário) contra míseros 800 a 1.200 ciclos do chumbo (2 a 3 anos de vida); 3) Alta eficiência de carga e descarga (95% a 98% contra 75% a 80% do chumbo); 4) Resistência a temperaturas de até 40°C a 45°C típicas de Moçambique sem colapso prematuro.',
          keyTakeaway: 'Baterias LiFePO4: 80-90% de descarga útil e mais de 6000 ciclos de vida útil no calor.',
          xpReward: 50
        }
      }
    ]
  }
];
