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
  CommunityPost,
  StoryItem
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
    id: 'plano_tecnico_pro',
    name: 'Plano Técnico Pro',
    priceMZN: 50,
    durationDays: 30,
    tier: 'profissional',
    active: true,
    priority: 1,
    isPopular: true,
    badge: 'Acesso Total',
    targetRole: 'all',
    createdAt: '2025-01-01',
    permissions: [
      'Acesso Ilimitado ao Mural Técnico & Comunidade de Engenharia MZ',
      'Gerador de Ordens de Serviço (OS) Profissional em PDF Ilimitado',
      'Sara IA - Assistente Inteligente de Engenharia & Normas de Moçambique',
      'Selo Oficial de Técnico / Empresa Verificado no Perfil e Catálogo',
      'Publicação Ilimitada de Anúncios e Equipamentos no Mercado Técnico',
      'Acesso a Vagas e Oportunidades de Emprego em Todo o País',
      'Calculadoras Técnicas de Dimensionamento Solar, Cabos e Climatização'
    ],
    restrictions: [],
    benefits: [
      'Gerador de Ordens de Serviço em PDF Ilimitado',
      'Acesso Total à Sara IA de Engenharia',
      'Selo Oficial de Verificado no Perfil',
      'Anúncios Livres no Mercado TécnicaMZ',
      'Mural Técnico e Feed da Comunidade'
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
export const INITIAL_STORIES: StoryItem[] = [];
