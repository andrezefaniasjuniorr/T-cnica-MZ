import { AcademyModule } from '../types/academy';
import { MECHANICAL_EXPANDED_LESSONS } from './curriculumMechanicalExpanded';

export const MECHANICAL_MODULES: AcademyModule[] = [
  // ==========================================================================
  // ESPECIALIDADE: MECÂNICA INDUSTRIAL (PADRÃO EUROPEU EN / ISO)
  // ==========================================================================
  {
    id: 'mec_mod_1_fundamentos',
    area: 'mecanica',
    order: 1,
    title: 'Módulo 1: Fundamentos de Mecânica Industrial & Ajustes',
    description: 'Sistema de tolerâncias e ajustes ISO (H7/g6, H7/p6), medição metrológica de precisão e fadiga de materiais mecânicos.',
    icon: 'Wrench',
    normasReferencia: ['ISO 286-1', 'ISO 286-2', 'DIN 7157', 'ISO 3611', 'ISO 898-1', 'ISO 15243'],
    lessons: [
      {
        id: 'mec_m1_l1_tolerancias_ajustes_iso',
        moduleId: 'mec_mod_1_fundamentos',
        moduleTitle: 'Módulo 1: Fundamentos de Mecânica Industrial & Ajustes',
        order: 1,
        code: 'MC 1.1',
        title: 'Sistema de Tolerâncias e Ajustes ISO (Furo Base H7 / Eixo)',
        norma: 'ISO 286-1 / ISO 286-2',
        level: 'Básico',
        durationMinutes: 14,
        theory: {
          conceito: 'O sistema de tolerâncias ISO 286 define desvios dimensionais admissíveis para fabricação e montagem de componentes mecânicos acoplados (eixos e furos). A posição do campo de tolerância é indicada por letras (maiúsculas para furos [A a ZC] e minúsculas para eixos [a a zc]), acompanhada da classe de precisão numérica (IT01 a IT18).',
          formulas: [
            { label: 'Afastamento Superior do Furo', formula: 'ES = D_max - D_nominal', explicacao: 'Limite superior de usinagem do furo' },
            { label: 'Afastamento Inferior do Furo (H7)', formula: 'EI = 0 μm (exatamente zero no Furo Base)', explicacao: 'A linha zero coincide com a dimensão nominal' },
            { label: 'Ajuste H7/g6 (Folga Garantida)', formula: 'Folga Mínima = EI - es > 0', explicacao: 'Eixo sempre menor que o furo, permitindo filme de óleo lubrificante' },
            { label: 'Ajuste H7/p6 (Interferência Prensada)', formula: 'Interferência Mínima = ei - ES > 0', explicacao: 'Eixo sempre maior que o furo, exigindo prensa hidráulica ou aquecedor por indução' }
          ],
          pontosOperacionais: [
            'No sistema do Furo Base H7, o furo é usinado com referência fixa e a folga ou aperto é obtida usinando o eixo com tolerância específica.',
            'Ajuste H7/g6: ideal para peças que deslizam livremente ou engrenagens com chaveta deslizante.',
            'Ajuste H7/p6: união permanente com aperto pesado que transmite torque sem chaveta ou suporta anéis de rolamentos com carga rotativa pesada.',
            'Montagem de rolamentos: aquecer o rolamento em aquecedor indutivo térmico até exatamente 110°C (NUNCA ultrapassar 120°C para não alterar o tratamento térmico do aço). NUNCA bater com martelo de aço direto na pista do rolamento!'
          ],
          fieldCase: {
            localizacao: 'Nacala Porto, Nampula',
            cenario: 'Mancal bipartido de redutor de velocidade em britadeira que apresentava temperatura anormal de 92°C e ruído metálico estridente.',
            diagnostico: 'A medição metrológica com micrômetro interno revelou que o furo estava com diâmetro 120,08 mm para um anel externo de rolamento que exigia tolerância h6 (+0 / -0,022 mm). A folga diametral excessiva de 0,10 mm fazia o anel externo girar dentro do mancal, gerando fricção destrutiva.',
            solucaoNormativa: 'Recuperação do alojamento por metalização a frio e retífica de precisão para tolerância H7 (+0,035 / 0 mm). A temperatura estabilizou em 58°C e o ruído cessou.'
          },
          funcionamento: 'A tolerância geométrica e dimensional assegura que peças fabricadas em continentes diferentes se encaixem perfeitamente sem necessidade de ajuste manual no canteiro de obras.',
          aplicacaoMocambique: 'Nas oficinas de usinagem e manutenção em Moçambique, torneiros frequentemente lixam eixos manualmente até o rolamento entrar solto. Isso destrói a interferência H7/k6 exigida por fabricantes como SKF e quebra os rolamentos em poucos meses.',
          exemploPratico: 'Para um eixo nominal de 50 mm com furo H7 (50,000 mm a 50,030 mm) e eixo g6 (49,984 mm a 49,991 mm): a folga mínima garantida é 50,000 - 49,991 = 0,009 mm (9 μm), permitindo rotação perfeita com lubrificante.',
          calculationSnippet: 'H7/g6 = Folga garantida (deslizamento) | H7/p6 = Interferência prensada | Aquecimento máx rolamento = 110°C'
        },
        quiz: {
          question: 'Em um projeto mecânico segundo a norma ISO 286, necessita-se montar uma engrenagem que deve transmitir torque com chaveta e cuja bucha de bronze deve deslizar suavemente sobre o eixo de aço durante a operação com película de óleo. Qual sistema de ajuste de Furo Base é o mais adequado?',
          options: [
            { id: 'A', text: 'H7/p6 (Ajuste com interferência severa que exige prensa pesada).', isCorrect: false, feedback: 'H7/p6 é prensado fixo e trava totalmente o movimento deslizante.' },
            { id: 'B', text: 'H7/g6 (Ajuste com folga garantida para deslizamento e filme de lubrificação).', isCorrect: true, feedback: 'Exato! H7/g6 garante folga micrométrica contínua para deslizamento suave sem travamento mecânico.' },
            { id: 'C', text: 'H7/s6 (Ajuste para montagem por contração térmica profunda).', isCorrect: false, feedback: 'H7/s6 possui interferência pesadíssima para união permanente.' },
            { id: 'D', text: 'A11/d11 (Tolerância grosseira de caldeiraria pesada).', isCorrect: false, feedback: 'A11/d11 cria folga excessiva que geraria vibração e destruição da chaveta.' }
          ],
          explanation: 'Segundo a ISO 286, o par H7/g6 representa o ajuste com folga padrão para peças mecânicas que devem deslizar ou girar com precisão e fina película de óleo lubrificante, sem folgas excessivas que causem desvios de centro.',
          keyTakeaway: 'ISO 286: Furo H7 + Eixo g6 = deslizamento suave com folga; Eixo p6 = montagem prensada com interferência.',
          xpReward: 50
        }
      },
      ...(MECHANICAL_EXPANDED_LESSONS['mec_mod_1_fundamentos'] || [])
    ]
  },

  {
    id: 'mec_mod_2_pneumatica',
    area: 'mecanica',
    order: 2,
    title: 'Módulo 2: Pneumática Industrial & Tratamento de Ar',
    description: 'Unidades de Tratamento FRL, ponto de orvalho, válvulas direcionais 5/2 e 5/3 vias e classe de pureza de ar comprimido ISO 8573.',
    icon: 'Wind',
    normasReferencia: ['ISO 8573-1', 'ISO 4414', 'ISO 5599-1', 'ISO 1219-1'],
    lessons: [
      {
        id: 'mec_m2_l1_qualidade_ar_frl',
        moduleId: 'mec_mod_2_pneumatica',
        moduleTitle: 'Módulo 2: Pneumática Industrial & Tratamento de Ar',
        order: 1,
        code: 'MC 2.1',
        title: 'Qualidade do Ar Comprimido (ISO 8573-1) e Conjuntos FRL',
        norma: 'ISO 8573-1 / ISO 4414',
        level: 'Intermediário',
        durationMinutes: 14,
        theory: {
          conceito: 'O ar comprimido atmosférico contém contaminantes nocivos: vapor d’água, partículas de poeira e aerossóis de óleo do compressor. A norma ISO 8573-1 classifica a pureza do ar comprimido através de três dígitos [Partículas : Água : Óleo], por exemplo [Classe 1:4:1].',
          formulas: [
            { label: 'Classes de Pureza ISO 8573-1', formula: 'Classe [Partículas : Água : Óleo]', explicacao: 'Padrão internacional de qualidade de ar comprimido' },
            { label: 'Força Teórica de Cilindro Pneumático', formula: 'F_teorica = P × A_embolo', explicacao: 'Ex: Cilindro Ø 50mm (A = 19,63 cm²) a 6 bar (60 N/cm²) gera F = 1178 N' },
            { label: 'Ponto de Orvalho sob Pressão (PDP)', formula: 'PDP = +3 °C (Secador por Refrigeração)', explicacao: 'Condensa 95% do vapor d\'água presente na linha de ar' }
          ],
          pontosOperacionais: [
            'Secador por Refrigeração: reduz a temperatura do ar comprimido a +3°C, condensando o vapor em água líquida que é expulsa por purgador capacitivo eletrônico.',
            'Unidade FRL (Filtro, Regulador, Lubrificador): instalada no ponto de consumo.\n  - Filtro: remove partículas (5 μm a 40 μm) e gotas residuais.\n  - Regulador com manômetro: estabiliza a pressão a 6 bar.\n  - Lubrificador: pulveriza névoa de óleo para componentes que não possuam lubrificação permanente.',
            'ATENÇÃO COM VEDAÇÕES MODERNAS: válvulas e atuadores modernos possuem graxa sintética permanente de fábrica; colocar óleo comum no copo da FRL dissolve a graxa original, exigindo lubrificação para sempre.',
            'Purgadores automáticos emperrados com ferrugem são a maior fonte de desperdício de ar e passagem de água para a fábrica.'
          ],
          fieldCase: {
            localizacao: 'Chókwè, Província de Gaza',
            cenario: 'Linha de empacotamento automático de arroz sofrendo paradas contínuas porque os atuadores pneumáticos prendiam a meio curso travando os pistões.',
            diagnostico: 'Ao desmontar um cilindro, o técnico encontrou uma pasta leitosa viscosa (emulsão de água e óleo degradado). A causa raiz foi o purgador do reservatório travado fechado e ausência de secador de ar, inundando a rede com mais de 30 litros de água por dia.',
            solucaoNormativa: 'Instalação de secador por refrigeração + filtro coalescente grau 0,01 μm classe 1:4:2 ISO 8573 e drenos capacitivos automáticos. Eliminação de 100% dos travamentos mecânicos.'
          },
          funcionamento: 'A expansão adiabática do ar comprimido realiza trabalho mecânico rápido, limpo e com segurança intrínseca em atmosferas inflamáveis.',
          aplicacaoMocambique: 'A umidade relativa do ar em cidades costeiras como Beira e Pemba chega a 85% a 35°C. Um compressor de parafuso condensa dezenas de litros de água por turno, exigindo secagem industrial mandante.',
          exemploPratico: 'Para calcular a força de avanço de um cilindro de 63 mm a 6 bar: Raio r = 3,15 cm. Área A = π × (3,15)² = 31,17 cm². Força = 31,17 cm² × 60 N/cm² = 1870 N (aprox. 190 kgf de força útil).',
          calculationSnippet: 'F = P × A | Secador PDP +3°C | Pureza ISO 8573-1 [Partículas : Água : Óleo]'
        },
        quiz: {
          question: 'Em uma fábrica farmacêutica ou alimentícia em Moçambique com cilindros e garras pneumáticas autolubrificadas com graxa sintética de fábrica, qual erro grave na montagem da unidade FRL NÃO deve ser cometido segundo a ISO 4414?',
          options: [
            { id: 'A', text: 'Instalar regulador de pressão na entrada da linha.', isCorrect: false, feedback: 'O regulador é essencial e obrigatório para controle de força.' },
            { id: 'B', text: 'Adicionar óleo mineral no copo lubrificador da FRL, o que dissolveria a graxa de vedação interna dos componentes modernos.', isCorrect: true, feedback: 'Exato! Atuadores e válvulas modernas possuem lubrificação permanente de fábrica. Injetar óleo mineral através do lubrificador dissolve essa graxa especial e exige lubrificação contínua irreversível.' },
            { id: 'C', text: 'Utilizar tubulação de alumínio calibrado na rede de ar.', isCorrect: false, feedback: 'Alumínio é o melhor material para redes modernas, sem corrosão.' },
            { id: 'D', text: 'Instalar dreno automático no fundo do copo do filtro.', isCorrect: false, feedback: 'Dreno automático é altamente recomendado para evitar transbordamento de condensado.' }
          ],
          explanation: 'A norma ISO 4414 alerta que a grande maioria das válvulas e atuadores pneumáticos modernos possui graxa de vedação de longa duração de fábrica. O uso indevido de lubrificadores com óleo mineral comum dissolve essa graxa sintética; uma vez iniciado o uso de óleo, o sistema nunca mais pode operar sem ele sob risco de travamento imediato das vedações.',
          keyTakeaway: 'Pneumática moderna: Verifique se os componentes são autolubrificados antes de ativar o copo lubrificador da FRL.',
          xpReward: 50
        }
      },
      ...(MECHANICAL_EXPANDED_LESSONS['mec_mod_2_pneumatica'] || [])
    ]
  },

  {
    id: 'mec_mod_3_hidraulica',
    area: 'mecanica',
    order: 3,
    title: 'Módulo 3: Hidráulica Industrial & Circuitos de Óleo',
    description: 'Bombas volumétricas, válvulas de alívio e proporcionais, controle de contaminação ISO 4406 e cavitação hidráulica.',
    icon: 'Activity',
    normasReferencia: ['ISO 4413', 'ISO 4406', 'ISO 1219-1', 'ISO 6264', 'ISO 10300'],
    lessons: [
      {
        id: 'mec_m3_l1_cavitacao_contaminacao',
        moduleId: 'mec_mod_3_hidraulica',
        moduleTitle: 'Módulo 3: Hidráulica Industrial & Circuitos de Óleo',
        order: 1,
        code: 'MC 3.1',
        title: 'Cavitação em Bombas Hidráulicas e Contaminação de Óleo (ISO 4406)',
        norma: 'ISO 4413 / ISO 4406',
        level: 'Avançado',
        durationMinutes: 16,
        theory: {
          conceito: 'A hidráulica industrial utiliza fluidos líquidos sob alta pressão (160 bar a 350 bar) para transmitir forças imensas com controle preciso. A confiabilidade de qualquer circuito hidráulico depende de dois fatores críticos: evitar o fenômeno destrutivo da cavitação na sucção das bombas e controlar a contaminação sólida de micropartículas no óleo segundo a norma ISO 4406.',
          formulas: [
            { label: 'Pressão Hidráulica Básica', formula: 'P = F / A', explicacao: '1 bar = 100 kPa = 10 N/cm²' },
            { label: 'Código de Contaminação ISO 4406', formula: '[Partículas > 4 μm / > 6 μm / > 14 μm]', explicacao: 'Ex: 18/16/13 define a contagem de partículas por ml de fluido' },
            { label: 'Velocidade Máxima na Linha de Sucção', formula: 'v_sucção ≤ 1,0 m/s a 1,5 m/s', explicacao: 'Garante que a perda de carga não faça a pressão cair abaixo da pressão de vapor' }
          ],
          pontosOperacionais: [
            'Sintoma inconfundível de Cavitação: ruído metálico estridente na carcaça da bomba semelhante a brita, cascalho ou bolinhas de gude sendo trituradas sob alta rotação.',
            'Causas de cavitação: filtro de sucção entupido, óleo muito viscoso (frio), diâmetro de tubo de sucção estrangulado ou respiro do reservatório obstruído.',
            'Aeração vs Cavitação: Aeração é a entrada de ar externo na sucção (óleo espumando esbranquiçado no visor); cavitação é a evaporação do próprio óleo por vácuo excessivo.',
            'Mais de 75% a 80% das falhas prematuras em válvulas proporcionais e servoválvulas hidráulicas são causadas por micropartículas abrasivas invisíveis a olho nu (> 4 a 6 μm) que riscam os carretéis.'
          ],
          fieldCase: {
            localizacao: 'Moatize, Tete',
            cenario: 'Escavadeira hidráulica de mineração de 90 toneladas com bomba de pistões axiais de 350 bar que perdeu força motriz com ruído ensurdecedor de moagem de cascalho na carcaça.',
            diagnostico: 'A medição do vácuo na linha de sucção acusou depressão de -0,6 bar (limite admissível é de no máximo -0,2 bar). O filtro de sucção interno do tanque estava completamente colmatado por borras asfálticas de óleo superaquecido. As microbolhas de vapor colapsavam a 350 bar, arrancando lascas de metal dos sapatilhos dos pistões.',
            solucaoNormativa: 'Troca da bomba danificada, lavagem e flushing do reservatório, substituição do elemento filtrante e instalação de indicador elétrico de saturação diferencial no filtro de sucção. O vácuo normalizou em -0,08 bar.'
          },
          funcionamento: 'As bolhas de vapor formadas no vácuo de sucção entram na câmara de alta pressão e implodem em microssegundos com ondas de choque pontuais de mais de 10.000 bar.',
          aplicacaoMocambique: 'A poeira fina em usinas de carvão e britadeiras em Moçambique contamina tanques hidráulicos mal vedados. O uso de filtros de ar tipo dessecante com sílica gel nos respiros é mandatório para proteger as bombas.',
          exemploPratico: 'Para empurrar uma carga de 500 kN (50 toneladas) com um cilindro hidráulico de diâmetro de êmbolo de 160 mm (Área A = 201 cm²): P = 500000 N / 201 cm² = 2487 N/cm² = 248,7 bar de pressão de trabalho.',
          calculationSnippet: 'P = F / A | Ruído de brita = Cavitação (v_sucção ≤ 1,2 m/s) | ISO 4406 limpa válvulas'
        },
        quiz: {
          question: 'Durante a operação de uma prensa hidráulica com bomba de pistões axiais de 250 bar, o operador nota um ruído sonoro agudo muito forte semelhante a cascalho/pedras trituradas dentro da bomba e vibração na mangueira de sucção. Qual é o diagnóstico técnico mais provável e a causa física correspondente?',
          options: [
            { id: 'A', text: 'O motor elétrico está girando ao contrário gerando sobretensão.', isCorrect: false, feedback: 'Giro invertido não gera esse ruído específico e a bomba simplesmente não descarregaria pressão.' },
            { id: 'B', text: 'Cavitação decorrente de restrição na linha de sucção (filtro de sucção colmatado ou óleo frio com viscosidade excessiva).', isCorrect: true, feedback: 'Exato! A queda de pressão na sucção abaixo da pressão de vapor gera bolhas que implodem na saída, arrancando lascas metálicas dos pistões.' },
            { id: 'C', text: 'A válvula de segurança de alívio está regulada com pressão baixa demais.', isCorrect: false, feedback: 'Válvula de alívio abrindo gera apenas chiado contínuo suave de fluxo de óleo sem trituração de metal.' },
            { id: 'D', text: 'O óleo está limpo demais e perdeu o atrito estático com a carcaça.', isCorrect: false, feedback: 'Óleo limpo é a condição ideal; não existe "limpo demais" em hidráulica.' }
          ],
          explanation: 'O ruído característico de "bombeamento de cascalho" é o sintoma clássico de cavitação hidráulica (ISO 4413). Ocorre quando a restrição de sucção (filtro saturado, tubulação estreita ou viscosidade inadequada) faz a pressão cair abaixo da pressão de vaporização do óleo, gerando implosão violenta de microbolhas nas faces dos pistões.',
          keyTakeaway: 'Ruído de brita na bomba hidráulica = Cavitação! Verifique filtro de sucção e nível de óleo imediatamente.',
          xpReward: 50
        }
      },
      ...(MECHANICAL_EXPANDED_LESSONS['mec_mod_3_hidraulica'] || [])
    ]
  },

  {
    id: 'mec_mod_4_manutencao',
    area: 'mecanica',
    order: 4,
    title: 'Módulo 4: Manutenção Preditiva & Análise de Vibrações',
    description: 'Espectros FFT de vibração (1X, 2X, harmônicos), severidade segundo a ISO 10816-3 e termografia de mancais.',
    icon: 'Maximize2',
    normasReferencia: ['ISO 10816-3', 'ISO 20816-1', 'ISO 13373', 'ISO 15243', 'ASTM D445'],
    lessons: [
      {
        id: 'mec_m4_l1_analise_vibracoes_iso10816',
        moduleId: 'mec_mod_4_manutencao',
        moduleTitle: 'Módulo 4: Manutenção Preditiva & Análise de Vibrações',
        order: 1,
        code: 'MC 4.1',
        title: 'Severidade de Vibração (ISO 10816-3) e Diagnóstico por Espectro FFT',
        norma: 'ISO 10816-3 / ISO 20816-1',
        level: 'Avançado',
        durationMinutes: 16,
        theory: {
          conceito: 'A análise de vibração mecânica permite diagnosticar falhas incipientes (desbalanceamento, desalinhamento, folgas mecânicas e defeitos em pistas de rolamentos) meses antes de ocorrer a parada catastrófica da máquina. A norma ISO 10816-3 classifica a severidade de vibração pela velocidade global RMS (mm/s) na faixa de 10 Hz a 1000 Hz.',
          formulas: [
            { label: 'Frequência Fundamental de Rotação (1X)', formula: 'f_1X = RPM / 60 (Hz)', explicacao: 'Motor de 1500 RPM -> f = 1500 / 60 = 25 Hz' },
            { label: 'Severidade de Velocidade Global RMS', formula: 'V_rms = √[(1/T) × ∫ v(t)² dt]', explicacao: 'Medida em mm/s RMS de acordo com a ISO 10816-3' },
            { label: 'Zonas de Severidade ISO 10816-3', formula: 'Zona A (Boa) | Zona B (Aceitável) | Zona C (Restrita) | Zona D (Perigo > 4,5 ou 7,1 mm/s)', explicacao: 'Classificação de risco de falha catastrófica em máquinas industriais' }
          ],
          pontosOperacionais: [
            'Pico dominante em 1X da rotação no sentido radial = Desbalanceamento de massa do rotor.',
            'Picos dominantes em 2X e 3X com defasagem no sentido axial = Desalinhamento angular ou paralelo de acoplamento.',
            'Harmônicos múltiplos em alta frequência com ruído de fundo elevado = Folga mecânica ou desgaste de mancais de deslizamento.',
            'Frequências de defeito de rolamento (BPFO, BPFI, BSF, FTF): aparecem em faixas ultra-altas (500 Hz a 10 kHz), detectáveis por aceleração de pico ou demodulação de envelope.'
          ],
          fieldCase: {
            localizacao: 'Rio Umbeluzi, Província de Maputo',
            cenario: 'Bomba centrífuga de captação de água operando com vibração global de 8,2 mm/s RMS (Zona D de perigo iminente). A equipe planejava trocar os rolamentos às cegas.',
            diagnostico: 'A análise espectral FFT com acelerômetro piezoelétrico revelou pico gigante em 2X da frequência de giro (50 Hz) e alta amplitude na direção axial. O problema era desalinhamento angular no acoplamento flexível de pinos.',
            solucaoNormativa: 'Alinhamento a laser dos eixos do motor e da bomba com calços calibrados de aço inox. A vibração caiu para 1,1 mm/s RMS (Zona A de excelência), poupando milhares de meticais em rolamentos desnecessários.'
          },
          funcionamento: 'O transdutor piezoelétrico gera uma carga elétrica proporcional à aceleração mecânica, que é convertida pelo processador DSP através da Transformada Rápida de Fourier (FFT) em amplitudes por frequência.',
          aplicacaoMocambique: 'Ventiladores industriais de exaustão em indústrias cimenteiras e fundições acumulam poeira irregularmente nas pás, gerando desbalanceamento em 1X. O balanceamento dinâmico em dois planos no local economiza dias de desmontagem.',
          exemploPratico: 'Motor de 3000 RPM (50 Hz). Se o espectro FFT indicar pico dominante em 50 Hz radial, trata-se de desbalanceamento de massa. Se o pico for em 100 Hz axial, trata-se de desalinhamento angular.',
          calculationSnippet: '1X radial = Desbalanceamento | 2X/3X axial = Desalinhamento | Zona D (> 4,5 mm/s) = Perigo'
        },
        quiz: {
          question: 'Durante a medição de vibração preditiva com acelerômetro em um motor elétrico de 75 kW (1450 RPM / 24,1 Hz) acoplado a um ventilador industrial, o medidor aponta um valor global de velocidade de 7,8 mm/s RMS (Zona D da ISO 10816-3). A análise do espectro FFT revela um pico dominante exatamente na frequência de rotação 1X (24,1 Hz) no sentido radial. Qual é o diagnóstico mecânico correto?',
          options: [
            { id: 'A', text: 'Desbalanceamento de massa do rotor do ventilador.', isCorrect: true, feedback: 'Exato! O desbalanceamento estático ou dinâmico gera força centrífuga que se manifesta como um pico senoidal dominante puramente em 1X da frequência de giro no plano radial.' },
            { id: 'B', text: 'Desalinhamento angular severo de eixos.', isCorrect: false, feedback: 'Desalinhamento angular manifesta-se tipicamente com forte componente axial e harmônicos em 2X e 3X.' },
            { id: 'C', text: 'Cavitação na carcaça do ventilador.', isCorrect: false, feedback: 'Cavitação ocorre em fluidos líquidos incompressíveis e gera ruído de alta frequência (> 2000 Hz), não 1X.' },
            { id: 'D', text: 'Falta de lubrificação por graxa no rolamento.', isCorrect: false, feedback: 'Falta de graxa gera componentes de alta frequência e fator de crista elevado nos estágios iniciais, não pico 1X.' }
          ],
          explanation: 'Na análise espectral de vibrações segundo a ISO 10816 e ISO 13373, um pico dominante exclusivo na frequência fundamental de rotação (1X da velocidade síncrona/rotação) medido no sentido radial é a assinatura clássica de desbalanceamento mecânico de massa do conjunto girante.',
          keyTakeaway: 'Espectro FFT: Pico dominante em 1X radial = Desbalanceamento; Picos em 2X/3X axial = Desalinhamento.',
          xpReward: 50
        }
      },
      ...(MECHANICAL_EXPANDED_LESSONS['mec_mod_4_manutencao'] || [])
    ]
  }
];

