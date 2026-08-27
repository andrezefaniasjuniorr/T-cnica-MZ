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
    id: 'plan_prof',
    name: 'Técnico Profissional',
    priceMZN: 199,
    durationDays: 30,
    active: true,
    priority: 1,
    targetRole: 'technician',
    createdAt: '2025-01-01',
    benefits: [
      'Perfil profissional verificado na TécnicaMZ',
      'Receber e responder a pedidos de clientes',
      'Candidatar-se a vagas de empresas (/jobs)',
      'Portfólio com até 8 trabalhos realizados',
      'Aparecer na lista oficial com botão WhatsApp direto',
      'Calculadoras técnicas básicas (Solar, Cabos, BTU)'
    ]
  },
  {
    id: 'plan_premium',
    name: 'Técnico Destaque Pro',
    priceMZN: 399,
    durationDays: 30,
    active: true,
    priority: 2,
    targetRole: 'technician',
    createdAt: '2025-01-01',
    benefits: [
      'Tudo do Plano Profissional',
      'Selo Ouro de Verificação Técnica Pro',
      'Destaque no topo da lista da sua província',
      'Acesso prioritário a pedidos de empresas e clientes',
      'Portfólio ilimitado com fotos em alta resolução',
      'Acesso ilimitado à Sara IA e todas as calculadoras'
    ]
  },
  {
    id: 'plan_empresa_start',
    name: 'Empresa Standard',
    priceMZN: 899,
    durationDays: 30,
    active: true,
    priority: 3,
    targetRole: 'company',
    createdAt: '2025-01-01',
    benefits: [
      'Perfil empresarial verificado com NUIT',
      'Publicação de até 3 vagas de emprego (/jobs)',
      'Acesso ao banco de técnicos certificados de Moçambique',
      'Solicitação de cotações diretas a técnicos',
      'Suporte prioritário via WhatsApp'
    ]
  },
  {
    id: 'plan_empresa_corp',
    name: 'Empresa Corporativa',
    priceMZN: 1999,
    durationDays: 30,
    active: true,
    priority: 4,
    targetRole: 'company',
    createdAt: '2025-01-01',
    benefits: [
      'Perfil Corporativo com Selo Diamante',
      'Publicação ILIMITADA de vagas de emprego',
      'Destaque na página inicial e no diretório de empresas',
      'Acesso antecipado a técnicos com melhores avaliações',
      'Gestor de conta dedicado TécnicaMZ',
      'Relatórios e métricas de contratação'
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
