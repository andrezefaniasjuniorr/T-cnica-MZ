import {
  TechnicianProfile,
  CompanyProfile,
  JobOpening,
  JobApplication,
  SubscriptionPlan,
  PaymentRecord,
  ServiceRequest,
  Proposal,
  Review,
  PortfolioItem,
  PlatformSettings,
  User,
  MarketItem,
  AcademyArticle,
  ConversationItem,
  MessageItem,
  NotificationItem,
  ReportItem,
  AdminLogItem,
  CommunityPost
} from '../types';

export const INITIAL_SETTINGS: PlatformSettings = {
  platformName: 'TécnicaMZ Pro',
  slogan: 'A Maior Rede Profissional e Plataforma Técnica de Moçambique',
  supportPhone: '+258 84 123 4567',
  supportEmail: 'suporte@tecnicamz.co.mz',
  whatsappSupport: '+258841234567',
  paymentMethods: {
    mpesaNumber: '84 500 1234',
    mpesaName: 'TécnicaMZ Serviços Lda',
    emolaNumber: '86 500 1234',
    emolaName: 'TécnicaMZ Serviços Lda',
    bankName: 'Millennium BIM',
    bankAccount: '1234567890',
    bankHolder: 'TécnicaMZ Serviços Lda',
    bankNIB: '000100000123456789012',
    instructions: 'Envie o valor exato do plano via M-Pesa ou e-Mola. No descritivo da transação, coloque seu nome e número de telefone. Anexe o comprovativo ou informe o código da transação.'
  },
  categories: [
    'Eletricidade',
    'Energia Solar',
    'Eletrônica',
    'Informática',
    'Redes',
    'CCTV e Segurança',
    'Frio e Climatização',
    'Mecânica',
    'Automação',
    'PLC',
    'Construção Civil',
    'Canalização',
    'Serralharia',
    'Refrigeração',
    'Telecomunicações',
    'Manutenção Industrial',
    'Eletrodomésticos',
    'Outros'
  ],
  provinces: [
    'Maputo Cidade',
    'Maputo Província',
    'Gaza',
    'Inhambane',
    'Sofala',
    'Manica',
    'Tete',
    'Zambézia',
    'Nampula',
    'Niassa',
    'Cabo Delgado'
  ],
  maintenanceMode: false,
  saraAiEnabled: true,
  registrationOpen: true
};

export const INITIAL_PLANS: SubscriptionPlan[] = [
  {
    id: 'plano_basico',
    name: 'Pacote Básico',
    priceMZN: 50,
    durationDays: 30,
    tier: 'basico',
    active: true,
    priority: 1,
    targetRole: 'all',
    createdAt: '2025-01-01',
    permissions: [
      'Acesso de navegação ao Feed e Mural de Notícias',
      'Perfil público de técnico básico na TécnicaMZ',
      'Visualização do Diretório de Técnicos e Empresas',
      'Visualização de Vagas de Emprego disponíveis'
    ],
    restrictions: [
      'Bloqueia Gerador de OS em PDF',
      'Bloqueia Acesso à Sara IA (Engenharia MZ)',
      'Bloqueia Publicações e anúncios no Mercado'
    ],
    benefits: [
      'Acesso ao Feed e Mural de Notícias',
      'Perfil público de técnico básico',
      'Visualização de vagas e pedidos'
    ]
  },
  {
    id: 'plano_profissional',
    name: 'Pacote Profissional',
    priceMZN: 199,
    durationDays: 30,
    tier: 'profissional',
    active: true,
    priority: 2,
    isPopular: true,
    badge: 'Mais Popular',
    targetRole: 'all',
    createdAt: '2025-01-01',
    permissions: [
      'Tudo incluído no Pacote Básico (50 MT)',
      'Selo oficial de "Técnico Verificado" no perfil',
      'Gerador de Ordens de Serviço (OS) em PDF ilimitado',
      'Acesso total e irrestrito à Sara IA (Engenharia MZ)',
      'Calculadoras técnicas completas (Solar, Cabos, Ar Condicionado)',
      'Envio ilimitado de propostas para clientes'
    ],
    restrictions: [
      'Bloqueia anúncios na aba Mercado',
      'Sem destaque no topo do Mural da Comunidade'
    ],
    benefits: [
      'Tudo do Pacote 50 MT',
      'Selo de "Técnico Verificado" no perfil',
      'Gerador de Ordens de Serviço (OS) em PDF ilimitado',
      'Acesso total à Sara IA'
    ]
  },
  {
    id: 'plano_empresa_vip',
    name: 'Pacote Empresa / VIP',
    priceMZN: 499,
    durationDays: 30,
    tier: 'empresa_vip',
    active: true,
    priority: 3,
    badge: 'Acesso Total VIP',
    targetRole: 'all',
    createdAt: '2025-01-01',
    permissions: [
      'Acesso total sem restrições a toda a plataforma TécnicaMZ',
      'Selo exclusivo "Empresa VIP" ou "Técnico VIP"',
      'Anúncios ilimitados no Mercado TécnicaMZ',
      'Destaque automático de publicações no topo do Mural',
      'Gerador de Ordens de Serviço (OS) em PDF ilimitado',
      'Acesso irrestrito à Sara IA e todas as ferramentas',
      'Publicação e gestão de vagas de emprego (/jobs)',
      'Prioridade máxima em buscas e recomendações'
    ],
    restrictions: [],
    benefits: [
      'Acesso total sem restrições a toda a plataforma',
      'Selo "Empresa VIP" / "Técnico VIP"',
      'Anúncios ilimitados no Mercado',
      'Destaque automático de publicações no topo do Mural'
    ]
  }
];

// All mock and fake user/content data removed in favor of real Firebase Firestore sync
export const INITIAL_USERS: User[] = [];
export const INITIAL_TECHNICIANS: TechnicianProfile[] = [];
export const INITIAL_COMPANIES: CompanyProfile[] = [];
export const INITIAL_JOBS: JobOpening[] = [];
export const INITIAL_JOB_APPLICATIONS: JobApplication[] = [];
export const INITIAL_SERVICE_REQUESTS: ServiceRequest[] = [];
export const INITIAL_PROPOSALS: Proposal[] = [];
export const INITIAL_PAYMENTS: PaymentRecord[] = [];
export const INITIAL_REVIEWS: Review[] = [];
export const INITIAL_PORTFOLIO: PortfolioItem[] = [];
export const INITIAL_MARKET_ITEMS: MarketItem[] = [];
export const INITIAL_ACADEMY_ARTICLES: AcademyArticle[] = [];
export const INITIAL_CONVERSATIONS: ConversationItem[] = [];
export const INITIAL_MESSAGES: MessageItem[] = [];
export const INITIAL_NOTIFICATIONS: NotificationItem[] = [];
export const INITIAL_REPORTS: ReportItem[] = [];
export const INITIAL_ADMIN_LOGS: AdminLogItem[] = [];
export const INITIAL_COMMUNITY_POSTS: CommunityPost[] = [];
