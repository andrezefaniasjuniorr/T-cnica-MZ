/**
 * PlatformRegistry - Centralized Dynamic Discovery System para TécnicaMZ Pro
 * 
 * Permite que novos componentes elétricos, módulos, ferramentas e cards
 * sejam auto-registrados dinamicamente na memória do agente Sara IA sem
 * necessidade de reescrever seu código-base.
 */

export interface PlatformComponent {
  id: string;
  code: string;
  name: string;
  category: 'protection' | 'control' | 'signaling' | 'loads' | 'busbars' | 'accessories';
  keywords: string[];
  description: string;
  standard?: string;
  defaultTerminals?: string[];
  defaultParams?: Record<string, any>;
  onBusbarCompatible?: boolean;
}

export interface PlatformModule {
  id: string;
  name: string;
  route: string;
  category: 'comunidade' | 'ferramentas' | 'gestao' | 'ensino' | 'mercado';
  keywords: string[];
  description: string;
  action?: () => void;
}

export interface PlatformTool {
  id: string;
  name: string;
  description: string;
  category: 'simulator' | 'sizing' | 'report' | 'navigation' | 'system';
  parameters?: Record<string, { type: string; description: string; required?: boolean }>;
  execute: (args: any, context?: any) => Promise<any> | any;
}

class PlatformRegistryClass {
  private components: Map<string, PlatformComponent> = new Map();
  private modules: Map<string, PlatformModule> = new Map();
  private tools: Map<string, PlatformTool> = new Map();
  private listeners: Array<() => void> = [];

  constructor() {
    this.seedDefaultRegistry();
  }

  /**
   * Registra ou atualiza um componente elétrico no catálogo dinâmico
   */
  public registerComponent(comp: PlatformComponent): void {
    this.components.set(comp.code.toLowerCase(), comp);
    this.components.set(comp.id.toLowerCase(), comp);
    this.notifyListeners();
  }

  /**
   * Registra ou atualiza múltiplos componentes de uma vez
   */
  public registerComponents(comps: PlatformComponent[]): void {
    comps.forEach(c => {
      this.components.set(c.code.toLowerCase(), c);
      this.components.set(c.id.toLowerCase(), c);
    });
    this.notifyListeners();
  }

  /**
   * Registra um módulo ou card da plataforma
   */
  public registerModule(module: PlatformModule): void {
    this.modules.set(module.id.toLowerCase(), module);
    this.notifyListeners();
  }

  /**
   * Registra uma ferramenta executável para o agente
   */
  public registerTool(tool: PlatformTool): void {
    this.tools.set(tool.id.toLowerCase(), tool);
    this.notifyListeners();
  }

  /**
   * Busca um componente por código, nome aproximado ou palavras-chave
   */
  public findComponent(query: string): PlatformComponent | undefined {
    if (!query) return undefined;
    const clean = query.toLowerCase().trim();

    // 1. Busca exata por código ou id
    if (this.components.has(clean)) {
      return this.components.get(clean);
    }

    // 2. Busca por nome exato ou inclusão
    const all = Array.from(new Set(this.components.values()));
    const exactName = all.find(c => c.name.toLowerCase() === clean);
    if (exactName) return exactName;

    // 3. Busca por correspondência de palavras-chave
    const keywordMatch = all.find(c =>
      c.keywords.some(k => clean.includes(k.toLowerCase()) || k.toLowerCase().includes(clean))
    );
    if (keywordMatch) return keywordMatch;

    // 4. Busca parcial no nome
    const partialName = all.find(c => c.name.toLowerCase().includes(clean) || clean.includes(c.name.toLowerCase()));
    if (partialName) return partialName;

    return undefined;
  }

  /**
   * Busca um módulo da plataforma por rota, nome ou palavra-chave
   */
  public findModule(query: string): PlatformModule | undefined {
    if (!query) return undefined;
    const clean = query.toLowerCase().trim();

    if (this.modules.has(clean)) {
      return this.modules.get(clean);
    }

    const all = Array.from(this.modules.values());
    const match = all.find(m =>
      m.name.toLowerCase().includes(clean) ||
      clean.includes(m.name.toLowerCase()) ||
      m.keywords.some(k => clean.includes(k.toLowerCase()))
    );

    return match;
  }

  /**
   * Busca uma ferramenta executável
   */
  public findTool(idOrName: string): PlatformTool | undefined {
    const clean = idOrName.toLowerCase().trim();
    if (this.tools.has(clean)) return this.tools.get(clean);
    const all = Array.from(this.tools.values());
    return all.find(t => t.name.toLowerCase() === clean || t.id.toLowerCase().includes(clean));
  }

  public getAllComponents(): PlatformComponent[] {
    return Array.from(new Set(this.components.values()));
  }

  public getAllModules(): PlatformModule[] {
    return Array.from(this.modules.values());
  }

  public getAllTools(): PlatformTool[] {
    return Array.from(this.tools.values());
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(l => {
      try {
        l();
      } catch (e) {
        console.error('Erro ao notificar listener do PlatformRegistry:', e);
      }
    });
  }

  /**
   * Popula o catálogo com todos os componentes elétricos da bancada CAD e módulos do sistema
   */
  private seedDefaultRegistry(): void {
    // 1. Componentes Elétricos CAD
    const defaultComps: PlatformComponent[] = [
      {
        id: 'cb_tri',
        code: 'cb_tri',
        name: 'Disjuntor Tripolar Motor (Q1)',
        category: 'protection',
        keywords: ['disjuntor tripolar', 'disjuntor motor', 'q1', 'disjuntor 3 polos', 'disjuntor trifasico'],
        description: 'Disjuntor termomagnético tripolar para proteção de circuitos de força trifásicos e motores.',
        standard: 'IEC 60947-2',
        defaultTerminals: ['1', '2', '3', '4', '5', '6'],
        onBusbarCompatible: true
      },
      {
        id: 'cb_bi',
        code: 'cb_bi',
        name: 'Disjuntor Bipolar (Q2)',
        category: 'protection',
        keywords: ['disjuntor bipolar', 'disjuntor 2 polos', 'disjuntor comando', 'q2'],
        description: 'Disjuntor termomagnético bipolar para proteção de circuitos de comando e bifásicos.',
        standard: 'IEC 60898-1',
        defaultTerminals: ['1', '2', '3', '4'],
        onBusbarCompatible: true
      },
      {
        id: 'cb_mono',
        code: 'cb_mono',
        name: 'Disjuntor Monopolar (Q3)',
        category: 'protection',
        keywords: ['disjuntor monopolar', 'disjuntor mono', 'disjuntor 1 polo', 'q3'],
        description: 'Disjuntor termomagnético monopolar 1P para iluminação e comando.',
        standard: 'IEC 60898-1',
        defaultTerminals: ['1', '2'],
        onBusbarCompatible: true
      },
      {
        id: 'idr_tetrapolar',
        code: 'idr_tetrapolar',
        name: 'Interruptor Diferencial Residual (IDR 30mA)',
        category: 'protection',
        keywords: ['idr', 'diferencial residual', 'dr', 'tetrapolar', 'dr 30ma'],
        description: 'Dispositivo IDR tetrapolar de alta sensibilidade 30mA para proteção contra choques elétricos.',
        standard: 'IEC 61008-1',
        defaultTerminals: ['1', '2', '3', '4', '5', '6', 'N1', 'N2'],
        onBusbarCompatible: true
      },
      {
        id: 'contactor',
        code: 'contactor',
        name: 'Contator de Potência (K1)',
        category: 'control',
        keywords: ['contator', 'contator de potencia', 'k1', 'contatora', 'chave magnetica'],
        description: 'Contator eletromagnético tripolar com contatos auxiliares 13-14 NA para acionamento de cargas.',
        standard: 'IEC 60947-4-1',
        defaultTerminals: ['A1', 'A2', '1', '2', '3', '4', '5', '6', '13', '14'],
        onBusbarCompatible: true
      },
      {
        id: 'contactor_k2',
        code: 'contactor_k2',
        name: 'Contator Auxiliar / Reverso (K2)',
        category: 'control',
        keywords: ['contator k2', 'contatora k2', 'reverso'],
        description: 'Segundo contator para circuitos de reversão e partida estrela-triângulo.',
        standard: 'IEC 60947-4-1',
        defaultTerminals: ['A1', 'A2', '1', '2', '3', '4', '5', '6', '13', '14'],
        onBusbarCompatible: true
      },
      {
        id: 'thermal_relay',
        code: 'thermal_relay',
        name: 'Relé Térmico de Sobrecarga (FT1)',
        category: 'protection',
        keywords: ['rele termico', 'sobrecarga', 'ft1', 'rele bimetalico'],
        description: 'Relé de proteção térmica com contatos 95-96 NF (desarme) e 97-98 NA (sinalização de falha).',
        standard: 'IEC 60947-4-1',
        defaultTerminals: ['1', '2', '3', '4', '5', '6', '95', '96', '97', '98'],
        onBusbarCompatible: true
      },
      {
        id: 'timer_ton',
        code: 'timer_ton',
        name: 'Temporizador com Retardo na Energização (TON)',
        category: 'control',
        keywords: ['temporizador', 'timer', 'ton', 'rele de tempo'],
        description: 'Relé temporizador eletrônico com contatos comutadores 15-16 NF e 15-18 NA.',
        standard: 'IEC 61812-1',
        defaultTerminals: ['A1', 'A2', '15', '16', '18'],
        onBusbarCompatible: true
      },
      {
        id: 'button_na',
        code: 'button_na',
        name: 'Botoeira de Partida Liga (S1 - NA)',
        category: 'control',
        keywords: ['botoeira liga', 'botao liga', 'botoeira na', 's1', 'verde'],
        description: 'Botão pulsador frontal de contato normalmente aberto (13-14 ou 3-4).',
        standard: 'IEC 60947-5-1',
        defaultTerminals: ['3', '4'],
        onBusbarCompatible: false
      },
      {
        id: 'button_nf',
        code: 'button_nf',
        name: 'Botoeira de Parada Desliga (S0 - NF)',
        category: 'control',
        keywords: ['botoeira desliga', 'botao desliga', 'botoeira nf', 's0', 'vermelho'],
        description: 'Botão pulsador frontal de contato normalmente fechado (11-12 ou 1-2).',
        standard: 'IEC 60947-5-1',
        defaultTerminals: ['1', '2'],
        onBusbarCompatible: false
      },
      {
        id: 'emergency_stop',
        code: 'emergency_stop',
        name: 'Botoeira de Emergência Cogumelo com Trava',
        category: 'control',
        keywords: ['emergencia', 'cogumelo', 'parada de emergencia', 'botao de emergencia'],
        description: 'Botoeira tipo soco-cogumelo com trava giratória de emergência norma NR-10/NR-12.',
        standard: 'IEC 60947-5-5',
        defaultTerminals: ['1', '2'],
        onBusbarCompatible: false
      },
      {
        id: 'led_green',
        code: 'led_green',
        name: 'Sinalizador Luminoso LED Verde (L1)',
        category: 'signaling',
        keywords: ['sinalizador verde', 'led verde', 'lampada verde', 'piloto verde'],
        description: 'Sinalizador luminoso 220V/24V indicativo de máquina em operação normal.',
        standard: 'IEC 60073',
        defaultTerminals: ['X1', 'X2'],
        onBusbarCompatible: false
      },
      {
        id: 'led_red',
        code: 'led_red',
        name: 'Sinalizador Luminoso LED Vermelho (Falha)',
        category: 'signaling',
        keywords: ['sinalizador vermelho', 'led vermelho', 'lampada vermelha', 'piloto falha'],
        description: 'Sinalizador luminoso indicativo de falha, desarme térmico ou parada emergencial.',
        standard: 'IEC 60073',
        defaultTerminals: ['X1', 'X2'],
        onBusbarCompatible: false
      },
      {
        id: 'motor_3phase',
        code: 'motor_3phase',
        name: 'Motor Elétrico de Indução Trifásico (M1)',
        category: 'loads',
        keywords: ['motor trifasico', 'motor', 'm1', 'gaiola de esquilo', 'motor eletrico'],
        description: 'Motor assíncrono trifásico de gaiola com 6 pontas (U1, V1, W1 / U2, V2, W2) para partida direta, estrela-triângulo ou reversão.',
        standard: 'IEC 60034-1',
        defaultTerminals: ['U1', 'V1', 'W1', 'PE'],
        onBusbarCompatible: false
      },
      {
        id: 'transformer',
        code: 'transformer',
        name: 'Transformador de Comando (220V / 24V)',
        category: 'loads',
        keywords: ['transformador', 'trafo', 'fonte comando'],
        description: 'Transformador de isolamento galvânico para circuito de extra-baixa tensão de segurança.',
        standard: 'IEC 61558',
        defaultTerminals: ['P1', 'P2', 'S1', 'S2'],
        onBusbarCompatible: true
      },
      {
        id: 'din_rail',
        code: 'din_rail',
        name: 'Trilho DIN 35mm Metálico (IEC 60715)',
        category: 'busbars',
        keywords: ['trilho din', 'trilho', 'perfil din', 'calha din'],
        description: 'Trilho de fixação mecânica padrão de 35mm para disjuntores, contatores e relés.',
        standard: 'IEC 60715',
        onBusbarCompatible: false
      },
      {
        id: 'busbar_phase',
        code: 'busbar_phase',
        name: 'Barramento de Cobre Fase (L1, L2, L3)',
        category: 'busbars',
        keywords: ['barramento fase', 'barramento cobre', 'barramento l1', 'barramento l2', 'barramento l3'],
        description: 'Barramento de distribuição de cobre eletrolítico com isoladores.',
        standard: 'IEC 61439-1',
        onBusbarCompatible: false
      },
      {
        id: 'busbar_neutral',
        code: 'busbar_neutral',
        name: 'Barramento de Neutro (N)',
        category: 'busbars',
        keywords: ['barramento neutro', 'barra neutro', 'neutro n'],
        description: 'Barramento isolado para terminação de condutores neutros (azul celeste).',
        standard: 'IEC 60364',
        onBusbarCompatible: false
      },
      {
        id: 'busbar_earth',
        code: 'busbar_earth',
        name: 'Barramento de Proteção Terra (PE)',
        category: 'busbars',
        keywords: ['barramento terra', 'barra terra', 'terra pe', 'protecao'],
        description: 'Barramento condutor de equipotencialização e aterramento de proteção (verde/amarelo).',
        standard: 'IEC 60364',
        onBusbarCompatible: false
      }
    ];

    this.registerComponents(defaultComps);

    // 2. Módulos e Seções da Plataforma
    const defaultModules: PlatformModule[] = [
      {
        id: 'community',
        name: 'Comunidade & Mural Técnico',
        route: 'community',
        category: 'comunidade',
        keywords: ['mural', 'comunidade', 'feed', 'postagens', 'publicacoes', 'inicio'],
        description: 'Feed interativo com projetos elétricos, discussões e bancada CAD.'
      },
      {
        id: 'cad_simulator',
        name: 'Simulador CAD de Comandos Elétricos',
        route: 'cad_simulator',
        category: 'ferramentas',
        keywords: ['simulador', 'cad', 'bancada', 'circuito', 'comandos eletricos', 'esquema eletrico', 'diagrama'],
        description: 'Bancada virtual CAD para desenhar, simular e diagnosticar circuitos elétricos industriais e prediais.'
      },
      {
        id: 'tools',
        name: 'Central de Ferramentas Técnicas',
        route: 'tools',
        category: 'ferramentas',
        keywords: ['ferramentas', 'calculadoras', 'utilitarios', 'tecnica tools'],
        description: 'Coleção completa de utilitários técnicos de dimensionamento, cálculo e documentação.'
      },
      {
        id: 'cable_sizing',
        name: 'Dimensionamento de Cabos & Queda de Tensão',
        route: 'tools?tool=cable',
        category: 'ferramentas',
        keywords: ['dimensionamento de cabos', 'queda de tensao', 'condutores', 'secao do cabo', 'bitola'],
        description: 'Cálculo de corrente nominal, capacidade de condução e verificação de queda de tensão em Moçambique.'
      },
      {
        id: 'solar_sizing',
        name: 'Dimensionamento Solar Fotovoltaico',
        route: 'tools?tool=solar',
        category: 'ferramentas',
        keywords: ['solar', 'fotovoltaico', 'paineis solares', 'inversor', 'bateria'],
        description: 'Dimensionamento de geradores fotovoltaicos on-grid e off-grid por província de Moçambique.'
      },
      {
        id: 'service_order',
        name: 'Gerador de Ordem de Serviço & Contratos PDF',
        route: 'tools?tool=service_order',
        category: 'gestao',
        keywords: ['ordem de servico', 'os', 'contrato', 'orcamento pdf', 'recibo'],
        description: 'Emissão profissional de ordens de serviço e orçamentos em PDF com selo técnico.'
      },
      {
        id: 'qgd_panel',
        name: 'Identificação de Quadros Gerais (QGD)',
        route: 'tools?tool=qgd',
        category: 'ferramentas',
        keywords: ['quadro geral', 'qgd', 'painel eletrico', 'tabela de disjuntores'],
        description: 'Mapeamento de circuitos e geração de etiquetas de disjuntores para quadros de distribuição.'
      },
      {
        id: 'grounding_tool',
        name: 'Cálculo de Aterramento & Resistividade do Solo',
        route: 'tools?tool=grounding',
        category: 'ferramentas',
        keywords: ['aterramento', 'resistividade', 'hastes', 'eletrodo'],
        description: 'Cálculo de resistência de malhas de terra e hastes cravadas.'
      },
      {
        id: 'market',
        name: 'Mercado Técnico de Materiais & Equipamentos',
        route: 'market',
        category: 'mercado',
        keywords: ['mercado', 'loja', 'comprar', 'materiais eletricos', 'vendas'],
        description: 'Classificados de ferramentas, disjuntores, cabos e instrumentos de teste em Moçambique.'
      },
      {
        id: 'technicians_directory',
        name: 'Diretório de Técnicos Especialistas',
        route: 'technicians_directory',
        category: 'comunidade',
        keywords: ['tecnicos', 'diretorio', 'eletricistas', 'profissionais', 'contratar'],
        description: 'Encontre profissionais certificados pelo Selo MZ em todas as províncias.'
      },
      {
        id: 'jobs',
        name: 'Bolsa de Vagas e Oportunidades de Emprego',
        route: 'jobs',
        category: 'gestao',
        keywords: ['vagas', 'empregos', 'trabalho', 'oportunidades', 'candidaturas'],
        description: 'Oportunidades de emprego e estágios na área técnica e eletrotécnica.'
      },
      {
        id: 'academy',
        name: 'Academia TécnicaMZ de Ensino & Certificação',
        route: 'academy',
        category: 'ensino',
        keywords: ['academia', 'cursos', 'aulas', 'treinamento', 'certificados', 'provas'],
        description: 'Cursos técnicos, módulos práticos, simulados e avaliações com emissão de certificado oficial.'
      },
      {
        id: 'settings',
        name: 'Configurações de Perfil & Selo MZ',
        route: 'settings',
        category: 'gestao',
        keywords: ['configuracoes', 'perfil', 'selo mz', 'ajustes', 'conta'],
        description: 'Gerenciamento de credenciais, logotipos da empresa e verificação profissional.'
      }
    ];

    defaultModules.forEach(m => this.registerModule(m));
  }
}

export const platformRegistry = new PlatformRegistryClass();
