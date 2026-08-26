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
  CommunityComment
} from '../types';

export const INITIAL_SETTINGS: PlatformSettings = {
  platformName: 'TécnicaMZ',
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
    name: 'Técnico Premium VIP',
    priceMZN: 499,
    durationDays: 30,
    active: true,
    priority: 2,
    isPopular: true,
    targetRole: 'technician',
    createdAt: '2025-01-01',
    benefits: [
      'Tudo do Plano Profissional',
      'Destaque no topo das buscas da província',
      'Selo dourado de Membro Premium Verificado',
      'Gerador profissional de Orçamentos e Propostas PDF',
      'Acesso ilimitado à Sara IA (Assistente Técnico)',
      'Notificações instantâneas de novos pedidos e vagas',
      'Cartão Digital Interativo com QR Code'
    ]
  },
  {
    id: 'plan_company_pro',
    name: 'Empresa Recrutadora',
    priceMZN: 999,
    durationDays: 30,
    active: true,
    priority: 3,
    targetRole: 'company',
    createdAt: '2025-01-01',
    benefits: [
      'Publicação de vagas técnicas ilimitadas (/jobs)',
      'Acesso ao banco de técnicos certificados de Moçambique',
      'Gestão de candidatos com triagem por status',
      'Perfil corporativo com selo Empresa Verificada (NUIT)',
      'Sara IA para criação de descrições e requisitos de vagas',
      'Solicitações diretas de serviços para equipas técnicas'
    ]
  }
];

const getFutureDate = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
};

const getPastDate = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
};

export const INITIAL_USERS: User[] = [
  {
    uid: 'admin_owner',
    name: 'André Zefanias Júnior',
    email: 'andrezefaniasjuniorr@gmail.com',
    phone: '+258 84 999 0001',
    role: 'super_admin',
    adminSubRole: 'super_admin',
    status: 'active',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    createdAt: getPastDate(90)
  },
  {
    uid: 'admin_finance',
    name: 'Marta Sitoe',
    email: 'financeiro@tecnicamz.co.mz',
    phone: '+258 84 999 0002',
    role: 'admin',
    adminSubRole: 'finance_admin',
    status: 'active',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    createdAt: getPastDate(60)
  },
  {
    uid: 'admin_mod',
    name: 'Carlos Tembe',
    email: 'moderacao@tecnicamz.co.mz',
    phone: '+258 84 999 0003',
    role: 'admin',
    adminSubRole: 'moderator',
    status: 'active',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    createdAt: getPastDate(45)
  },
  {
    uid: 'tech_mateus',
    name: 'Mateus Cossa',
    email: 'mateus.cossa@gmail.com',
    phone: '+258 84 100 2001',
    role: 'technician',
    status: 'active',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    createdAt: getPastDate(40)
  },
  {
    uid: 'tech_arminia',
    name: 'Eng. Armínia Macamo',
    email: 'arminia.solar@gmail.com',
    phone: '+258 84 200 3002',
    role: 'technician',
    status: 'active',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    createdAt: getPastDate(50)
  },
  {
    uid: 'tech_edson',
    name: 'Edson Nhantumbo',
    email: 'edson.frio@gmail.com',
    phone: '+258 86 300 4003',
    role: 'technician',
    status: 'active',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    createdAt: getPastDate(80)
  },
  {
    uid: 'company_mozsolar',
    name: 'MozSolar Energy Ltd',
    email: 'recrutamento@mozsolar.co.mz',
    phone: '+258 84 555 9000',
    role: 'company',
    status: 'active',
    avatarUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f7?w=150&auto=format&fit=crop&q=80',
    createdAt: getPastDate(30)
  },
  {
    uid: 'company_cimentos',
    name: 'Indústria Cimentos de Moçambique',
    email: 'rh@cimentosmoz.co.mz',
    phone: '+258 84 333 8000',
    role: 'company',
    status: 'active',
    avatarUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=150&auto=format&fit=crop&q=80',
    createdAt: getPastDate(60)
  },
  {
    uid: 'client_joao',
    name: 'João Chissano',
    email: 'joao.chissano@gmail.com',
    phone: '+258 84 700 8001',
    role: 'client',
    status: 'active',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    createdAt: getPastDate(20)
  }
];

export const INITIAL_TECHNICIANS: TechnicianProfile[] = [
  {
    userId: 'tech_mateus',
    name: 'Mateus Cossa',
    email: 'mateus.cossa@gmail.com',
    phone: '+258 84 100 2001',
    whatsapp: '258841002001',
    showWhatsappButton: true,
    customWhatsappMessage: 'Olá Mateus, vi o seu perfil na TécnicaMZ e gostaria de solicitar um orçamento para serviço elétrico.',
    privacy: {
      showPhone: true,
      showWhatsapp: true,
      showEmail: false,
      allowDirectMessages: true
    },
    province: 'Maputo Cidade',
    city: 'Maputo',
    district: 'Polana Caniço',
    specialties: ['Eletricidade', 'Automação', 'CCTV e Segurança'],
    bio: 'Eletricista Industrial e Residencial com 8 anos de experiência comprovada. Especialista em quadros de distribuição, proteção diferencial, aterramento conforme normas EDM e automação predial.',
    experienceYears: 8,
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&auto=format&fit=crop&q=80',
    verificationStatus: 'approved',
    verificationDocuments: [
      {
        id: 'doc_1',
        name: 'Certificado_Instalador_Eletrico_IIM.pdf',
        type: 'certificate',
        url: 'https://example.com/doc1.pdf',
        uploadedAt: getPastDate(40)
      }
    ],
    subscriptionStatus: 'active',
    activePlanId: 'plan_premium',
    subscriptionExpiresAt: getFutureDate(27),
    rating: 4.9,
    reviewsCount: 24,
    completedJobsCount: 46,
    availability: 'available',
    featured: true,
    status: 'active',
    createdAt: getPastDate(40)
  },
  {
    userId: 'tech_arminia',
    name: 'Eng. Armínia Macamo',
    email: 'arminia.solar@gmail.com',
    phone: '+258 84 200 3002',
    whatsapp: '258842003002',
    showWhatsappButton: true,
    customWhatsappMessage: 'Olá Engenheira Armínia, vi o seu perfil na TécnicaMZ e gostaria de dimensionar um sistema solar.',
    privacy: {
      showPhone: true,
      showWhatsapp: true,
      showEmail: true,
      allowDirectMessages: true
    },
    province: 'Maputo Província',
    city: 'Matola',
    district: 'Tchumene',
    specialties: ['Energia Solar', 'Eletricidade', 'Manutenção Industrial'],
    bio: 'Engenheira Eletrotécnica especializada em dimensionamento e montagem de usinas fotovoltaicas híbridas e off-grid. Experiência com baterias LiFePO4 e inversores Deye, Growatt e Victron.',
    experienceYears: 6,
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&auto=format&fit=crop&q=80',
    verificationStatus: 'approved',
    verificationDocuments: [
      {
        id: 'doc_2',
        name: 'Diploma_Engenharia_UEM.pdf',
        type: 'certificate',
        url: 'https://example.com/doc2.pdf',
        uploadedAt: getPastDate(50)
      }
    ],
    subscriptionStatus: 'active',
    activePlanId: 'plan_premium',
    subscriptionExpiresAt: getFutureDate(19),
    rating: 5.0,
    reviewsCount: 18,
    completedJobsCount: 31,
    availability: 'available',
    featured: true,
    status: 'active',
    createdAt: getPastDate(50)
  },
  {
    userId: 'tech_edson',
    name: 'Edson Nhantumbo',
    email: 'edson.frio@gmail.com',
    phone: '+258 86 300 4003',
    whatsapp: '258863004003',
    showWhatsappButton: true,
    customWhatsappMessage: 'Olá Edson, vi seu perfil na TécnicaMZ e preciso de manutenção em ar condicionado.',
    privacy: {
      showPhone: true,
      showWhatsapp: true,
      showEmail: false,
      allowDirectMessages: true
    },
    province: 'Sofala',
    city: 'Beira',
    district: 'Macuti',
    specialties: ['Frio e Climatização', 'Refrigeração', 'Eletrodomésticos'],
    bio: 'Técnico de Refrigeração Comercial e Industrial. Instalação e manutenção preventiva de sistemas de ar condicionado split, VRF e câmaras frigoríficas.',
    experienceYears: 5,
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80',
    verificationStatus: 'approved',
    subscriptionStatus: 'expired',
    activePlanId: 'plan_prof',
    subscriptionExpiresAt: getPastDate(3),
    rating: 4.7,
    reviewsCount: 12,
    completedJobsCount: 19,
    availability: 'available',
    featured: false,
    status: 'active',
    createdAt: getPastDate(80)
  }
];

export const INITIAL_COMPANIES: CompanyProfile[] = [
  {
    userId: 'company_mozsolar',
    companyName: 'MozSolar Energy Limitada',
    commercialName: 'MozSolar Energy',
    nuit: '400192837',
    email: 'contacto@mozsolar.co.mz',
    phone: '+258 84 555 9000',
    whatsapp: '258845559000',
    showWhatsappButton: true,
    website: 'https://www.mozsolar.co.mz',
    province: 'Maputo Cidade',
    city: 'Maputo',
    district: 'Sommerschield',
    address: 'Av. Julius Nyerere, nº 1420, 3º Andar',
    industry: 'Energia Solar & Renovável',
    description: 'Líder em soluções de engenharia solar fotovoltaica, eletrificação rural e sistemas comerciais em Moçambique. Atuamos em projetos de minirredes de alta performance.',
    slogan: 'Energia Sustentável e Limpa para Todo Moçambique',
    logoUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f7?w=200&auto=format&fit=crop&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&auto=format&fit=crop&q=80',
    socialLinks: {
      linkedin: 'https://linkedin.com/company/mozsolar',
      facebook: 'https://facebook.com/mozsolar'
    },
    verificationStatus: 'verified',
    rating: 4.9,
    reviewsCount: 15,
    hiredTechniciansCount: 12,
    activeJobsCount: 2,
    featured: true,
    status: 'active',
    createdAt: getPastDate(30)
  },
  {
    userId: 'company_cimentos',
    companyName: 'Indústria Cimentos de Moçambique SA',
    commercialName: 'Cimentos de Moçambique',
    nuit: '400010992',
    email: 'rh@cimentosmoz.co.mz',
    phone: '+258 84 333 8000',
    whatsapp: '258843338000',
    showWhatsappButton: true,
    website: 'https://www.cimentosmoz.co.mz',
    province: 'Maputo Província',
    city: 'Matola',
    district: 'Machava Industrial',
    address: 'Parque Industrial da Matola, Talhão 42',
    industry: 'Manutenção Industrial & Manufatura',
    description: 'Empresa pioneira no setor de materiais de construção e produção industrial de cimento, com unidades fabris em Matola, Dondo e Nacala.',
    slogan: 'Construindo o Futuro de Moçambique com Solidez',
    logoUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=200&auto=format&fit=crop&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
    verificationStatus: 'verified',
    rating: 4.8,
    reviewsCount: 8,
    hiredTechniciansCount: 28,
    activeJobsCount: 1,
    featured: true,
    status: 'active',
    createdAt: getPastDate(60)
  }
];

export const INITIAL_JOBS: JobOpening[] = [
  {
    id: 'job_1',
    companyId: 'company_cimentos',
    companyName: 'Indústria Cimentos de Moçambique SA',
    companyLogo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=200&auto=format&fit=crop&q=80',
    companyVerified: true,
    companyNuit: '400010992',
    title: 'Técnico de Manutenção Eletromecânica Industrial',
    category: 'Manutenção Industrial',
    description: 'Procuramos um Técnico Eletromecânico para atuar na manutenção preventiva e corretiva de linhas de produção contínua, motores elétricos trifásicos de alta potência, redutores e esteiras transportadoras.',
    requirements: [
      'Nível Médio Técnico em Eletrotécnica ou Eletromecânica (IIM ou equivalente)',
      'Mínimo de 3 anos de experiência em ambiente fabril ou industrial',
      'Domínio de leitura de esquemas elétricos unifilares e trifásicos',
      'Conhecimento em parametrização de inversores de frequência e soft-starters',
      'Residência em Matola ou Maputo'
    ],
    minExperienceYears: 3,
    educationLevel: 'Técnico Médio Profissional',
    workplaceType: 'Presencial',
    contractType: 'Tempo Inteiro',
    province: 'Maputo Província',
    city: 'Matola',
    salaryMinMZN: 30000,
    salaryMaxMZN: 45000,
    salaryDisplay: '30.000 - 45.000 MZN',
    benefits: ['Transporte da empresa', 'Seguro de saúde', 'Alimentação no local', 'EPIs e ferramentas completas'],
    deadlineDate: '2026-09-30',
    contactEmail: 'vagas@cimentosmoz.co.mz',
    contactWhatsapp: '258843338000',
    applicationsCount: 4,
    status: 'active',
    createdAt: getPastDate(4)
  },
  {
    id: 'job_2',
    companyId: 'company_mozsolar',
    companyName: 'MozSolar Energy Limitada',
    companyLogo: 'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f7?w=200&auto=format&fit=crop&q=80',
    companyVerified: true,
    companyNuit: '400192837',
    title: 'Instalador Líder de Sistemas Solares Fotovoltaicos e Baterias de Lítio',
    category: 'Energia Solar',
    description: 'A MozSolar está a recrutar um Instalador Chefe para liderar equipas de montagem de centrais solares de 20kWp a 150kWp em projetos comerciais e agrícolas.',
    requirements: [
      'Formação comprovada em Energia Solar Fotovoltaica',
      'Experiência mínima de 2 anos em montagem de estruturas metálicas de telhado e solo',
      'Experiência prática em comissionamento de inversores Deye, Growatt ou SMA',
      'Carta de condução válida é uma vantagem',
      'Disponibilidade para deslocações pontuais entre províncias'
    ],
    minExperienceYears: 2,
    educationLevel: 'Técnico Básico ou Médio',
    workplaceType: 'Presencial',
    contractType: 'Tempo Inteiro',
    province: 'Maputo Cidade',
    city: 'Maputo',
    salaryMinMZN: 35000,
    salaryMaxMZN: 50000,
    salaryDisplay: '35.000 - 50.000 MZN',
    benefits: ['Bônus por produtividade de instalação', 'Diárias de deslocação', 'Formação técnica avançada em marcas'],
    deadlineDate: '2026-10-15',
    contactEmail: 'recrutamento@mozsolar.co.mz',
    contactWhatsapp: '258845559000',
    applicationsCount: 7,
    status: 'active',
    createdAt: getPastDate(2)
  },
  {
    id: 'job_3',
    companyId: 'company_mozsolar',
    companyName: 'MozSolar Energy Limitada',
    companyLogo: 'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f7?w=200&auto=format&fit=crop&q=80',
    companyVerified: true,
    companyNuit: '400192837',
    title: 'Técnico Especialista em CFTV IP e Segurança Eletrônica',
    category: 'CCTV e Segurança',
    description: 'Instalação de centrais de monitoramento de usinas solares com câmeras térmicas e sensores perimetrais IP.',
    requirements: [
      'Experiência em cabeamento estruturado e conectorização RJ45',
      'Configuração de NVRs Hikvision / Dahua e switches PoE gerenciáveis'
    ],
    minExperienceYears: 2,
    educationLevel: 'Técnico Médio',
    workplaceType: 'Híbrido',
    contractType: 'Prestação de Serviços',
    province: 'Sofala',
    city: 'Beira',
    salaryDisplay: '20.000 - 30.000 MZN / Projeto',
    benefits: ['Flexibilidade de horários', 'Material todo fornecido'],
    deadlineDate: '2026-09-20',
    contactEmail: 'projetos@mozsolar.co.mz',
    contactWhatsapp: '258845559000',
    applicationsCount: 2,
    status: 'active',
    createdAt: getPastDate(6)
  }
];

export const INITIAL_JOB_APPLICATIONS: JobApplication[] = [
  {
    id: 'app_1',
    jobId: 'job_1',
    jobTitle: 'Técnico de Manutenção Eletromecânica Industrial',
    companyId: 'company_cimentos',
    companyName: 'Indústria Cimentos de Moçambique SA',
    technicianId: 'tech_mateus',
    technicianName: 'Mateus Cossa',
    technicianEmail: 'mateus.cossa@gmail.com',
    technicianPhone: '+258 84 100 2001',
    technicianWhatsapp: '258841002001',
    technicianAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    technicianSpecialties: ['Eletricidade', 'Automação', 'CCTV e Segurança'],
    technicianExperienceYears: 8,
    technicianProvince: 'Maputo Cidade',
    technicianRating: 4.9,
    technicianVerified: true,
    coverLetter: 'Prezada equipa da Cimentos de Moçambique, possuo 8 anos de sólida atuação em quadros de comando industrial e motores elétricos. Gostaria de integrar a vossa equipa na fábrica da Matola.',
    status: 'Em análise',
    statusNotes: 'Perfil com ótima experiência prática e verificação aprovada na TécnicaMZ.',
    createdAt: getPastDate(3)
  },
  {
    id: 'app_2',
    jobId: 'job_2',
    jobTitle: 'Instalador Líder de Sistemas Solares Fotovoltaicos e Baterias de Lítio',
    companyId: 'company_mozsolar',
    companyName: 'MozSolar Energy Limitada',
    technicianId: 'tech_arminia',
    technicianName: 'Eng. Armínia Macamo',
    technicianEmail: 'arminia.solar@gmail.com',
    technicianPhone: '+258 84 200 3002',
    technicianWhatsapp: '258842003002',
    technicianAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
    technicianSpecialties: ['Energia Solar', 'Eletricidade'],
    technicianExperienceYears: 6,
    technicianProvince: 'Maputo Província',
    technicianRating: 5.0,
    technicianVerified: true,
    coverLetter: 'Olá equipa MozSolar, acompanho os vossos projetos de minirredes. Tenho vasta prática de campo com inversores Deye e bancos de lítio.',
    status: 'Selecionada',
    statusNotes: 'Candidata com formação superior e excelente portfólio fotovoltaico.',
    createdAt: getPastDate(1)
  }
];

export const INITIAL_SERVICE_REQUESTS: ServiceRequest[] = [
  {
    id: 'req_1',
    clientId: 'client_joao',
    clientName: 'João Chissano',
    clientPhone: '+258 84 700 8001',
    clientAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    title: 'Instalação de Sistema Solar Híbrido 5kVA para Residência',
    category: 'Energia Solar',
    description: 'Preciso de um técnico certificado para instalar 8 painéis de 550W no telhado, inversor híbrido 5kVA e bateria de lítio de 5kWh com quadro de transferência automática (ATS).',
    province: 'Maputo Cidade',
    city: 'Maputo (Triunfo)',
    urgency: 'urgent',
    budgetMZN: 15000,
    preferredDate: '2026-09-05',
    status: 'receiving_proposals',
    proposalsCount: 2,
    createdAt: getPastDate(2)
  },
  {
    id: 'req_2',
    clientId: 'client_joao',
    clientName: 'João Chissano',
    clientPhone: '+258 84 700 8001',
    clientAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    title: 'Revisão Geral do Quadro Elétrico e Substituição de Disjuntores',
    category: 'Eletricidade',
    description: 'O disjuntor geral está a desarmar com frequência quando o ar condicionado e o termoacumulador estão ligados simultaneamente. Preciso de balanceamento de fases.',
    province: 'Maputo Cidade',
    city: 'Maputo (Sommerschield)',
    urgency: 'normal',
    budgetMZN: 4500,
    status: 'in_progress',
    acceptedTechnicianId: 'tech_mateus',
    acceptedTechnicianName: 'Mateus Cossa',
    acceptedProposalId: 'prop_1',
    proposalsCount: 3,
    createdAt: getPastDate(5)
  }
];

export const INITIAL_PROPOSALS: Proposal[] = [
  {
    id: 'prop_1',
    requestId: 'req_2',
    requestTitle: 'Revisão Geral do Quadro Elétrico e Substituição de Disjuntores',
    clientId: 'client_joao',
    technicianId: 'tech_mateus',
    technicianName: 'Mateus Cossa',
    technicianPhone: '+258 84 100 2001',
    technicianAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    technicianRating: 4.9,
    technicianVerified: true,
    laborCostMZN: 3500,
    materialsCostMZN: 1200,
    totalCostMZN: 4700,
    validityDays: 10,
    description: 'Visita técnica com análise termográfica de barramentos, redistribuição uniforme das cargas por fase e troca de 2 disjuntores unipolares por curva C adequados.',
    status: 'accepted',
    createdAt: getPastDate(4)
  },
  {
    id: 'prop_2',
    requestId: 'req_1',
    requestTitle: 'Instalação de Sistema Solar Híbrido 5kVA para Residência',
    clientId: 'client_joao',
    technicianId: 'tech_arminia',
    technicianName: 'Eng. Armínia Macamo',
    technicianPhone: '+258 84 200 3002',
    technicianAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
    technicianRating: 5.0,
    technicianVerified: true,
    laborCostMZN: 12000,
    materialsCostMZN: 3000,
    totalCostMZN: 15000,
    validityDays: 15,
    description: 'Instalação completa com aterramento exclusivo de haste cobreada, DPS CC/CA de proteção contra sobretensões atmosféricas, parametrização do inversor e aplicativo Wi-Fi.',
    status: 'pending',
    createdAt: getPastDate(1)
  }
];

export const INITIAL_PAYMENTS: PaymentRecord[] = [
  {
    id: 'pay_101',
    userId: 'tech_mateus',
    userName: 'Mateus Cossa',
    userRole: 'technician',
    userPhone: '+258 84 100 2001',
    planId: 'plan_premium',
    planName: 'Técnico Premium VIP',
    amountMZN: 499,
    method: 'mpesa',
    transactionCode: 'MP260811902',
    receiptUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
    status: 'approved',
    reviewedBy: 'admin_owner',
    reviewedByName: 'André Zefanias Júnior',
    reviewedAt: getPastDate(3),
    submittedAt: getPastDate(3)
  },
  {
    id: 'pay_102',
    userId: 'company_mozsolar',
    userName: 'MozSolar Energy Limitada',
    userRole: 'company',
    userPhone: '+258 84 555 9000',
    planId: 'plan_company_pro',
    planName: 'Empresa Recrutadora',
    amountMZN: 999,
    method: 'bank_transfer',
    transactionCode: 'BIM-TRF-99210',
    receiptUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
    status: 'approved',
    reviewedBy: 'admin_finance',
    reviewedByName: 'Marta Sitoe',
    reviewedAt: getPastDate(20),
    submittedAt: getPastDate(20)
  },
  {
    id: 'pay_103',
    userId: 'tech_edson',
    userName: 'Edson Nhantumbo',
    userRole: 'technician',
    userPhone: '+258 86 300 4003',
    planId: 'plan_prof',
    planName: 'Técnico Profissional',
    amountMZN: 199,
    method: 'emola',
    transactionCode: 'EM260899014',
    status: 'pending',
    submittedAt: getPastDate(1)
  }
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev_1',
    technicianId: 'tech_mateus',
    clientId: 'client_joao',
    clientName: 'João Chissano',
    clientAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    rating: 5,
    comment: 'Mateus foi extremamente profissional. Identificou o sobreaquecimento num disjuntor antigo e reorganizou as cargas com perfeição. Recomendo com total confiança!',
    createdAt: getPastDate(10)
  },
  {
    id: 'rev_2',
    technicianId: 'tech_arminia',
    clientId: 'client_joao',
    clientName: 'João Chissano',
    clientAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    rating: 5,
    comment: 'A Eng. Armínia é das melhores profissionais de solar em Moçambique. O dimensionamento foi exato e a montagem impecável.',
    createdAt: getPastDate(15)
  }
];

export const INITIAL_PORTFOLIO: PortfolioItem[] = [
  {
    id: 'port_1',
    technicianId: 'tech_mateus',
    title: 'Montagem de Quadro Geral de Baixa Tensão (QGBT)',
    description: 'Instalação de barramento de cobre 250A, disjuntores caixa moldada e protetor contra surtos transitórios (DPS).',
    category: 'Eletricidade',
    province: 'Maputo Cidade',
    city: 'Maputo',
    photos: [
      'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80'
    ],
    date: '2026-07-20',
    createdAt: getPastDate(25)
  },
  {
    id: 'port_2',
    technicianId: 'tech_arminia',
    title: 'Usina Solar Comercial 15kWp com 3 Baterias de Lítio 48V',
    description: 'Instalação de 28 painéis solares monocristalinos bifaciais de 550W com inversor trifásico Deye em armazém comercial.',
    category: 'Energia Solar',
    province: 'Maputo Província',
    city: 'Matola',
    photos: [
      'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=600&auto=format&fit=crop&q=80'
    ],
    date: '2026-08-01',
    createdAt: getPastDate(18)
  }
];

export const INITIAL_MARKET_ITEMS: MarketItem[] = [
  {
    id: 'market_1',
    sellerId: 'tech_arminia',
    sellerName: 'Eng. Armínia Macamo',
    sellerRole: 'technician',
    sellerPhone: '+258 84 200 3002',
    sellerWhatsapp: '258842003002',
    showWhatsapp: true,
    title: 'Inversor Solar Híbrido 5kVA 48V MPPT 80A (Novo na Caixa)',
    category: 'Energia Solar',
    priceMZN: 28500,
    priceDisplay: '28.500 MZN',
    province: 'Maputo Província',
    city: 'Matola',
    location: 'Matola, Rio Covo',
    condition: 'Novo',
    brand: 'Deye / Must',
    model: '5048 MPPT',
    quantity: 2,
    description: 'Inversor novo com garantia de 1 ano, suporta conexão com gerador a diesel e paralelismo de até 9 unidades.',
    images: ['https://images.unsplash.com/photo-1509391365360-2e959784a276?w=600&auto=format&fit=crop&q=80'],
    status: 'active',
    createdAt: getPastDate(5)
  },
  {
    id: 'market_2',
    sellerId: 'tech_mateus',
    sellerName: 'Mateus Cossa',
    sellerRole: 'technician',
    sellerPhone: '+258 84 100 2001',
    sellerWhatsapp: '258841002001',
    showWhatsapp: true,
    title: 'Alicate Amperímetro Digital True-RMS Fluke 323 Original',
    category: 'Eletricidade',
    priceMZN: 8500,
    priceDisplay: '8.500 MZN',
    province: 'Maputo Cidade',
    city: 'Maputo',
    location: 'Maputo, Alto Maé',
    condition: 'Usado - Excelente',
    brand: 'Fluke',
    model: 'Fluke 323 CAT IV 300V',
    quantity: 1,
    description: 'Medição precisa de corrente CA até 400A e tensão até 600V. Acompanha pontas de prova originais e bolsa de transporte.',
    images: ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80'],
    status: 'active',
    createdAt: getPastDate(8)
  },
  {
    id: 'market_3',
    sellerId: 'company_mozsolar',
    sellerName: 'MozSolar Energy',
    sellerRole: 'company',
    sellerPhone: '+258 84 555 9000',
    sellerWhatsapp: '258845559000',
    showWhatsapp: true,
    title: 'Painel Solar Monocristalino Tier-1 550W Jinko Solar (Palete)',
    category: 'Energia Solar',
    priceMZN: 6800,
    priceDisplay: '6.800 MZN / un.',
    province: 'Maputo Cidade',
    city: 'Maputo',
    location: 'Porto de Maputo',
    condition: 'Novo',
    brand: 'Jinko Solar',
    model: 'Tiger Pro 72HC',
    quantity: 36,
    description: 'Módulos bifaciais de alta eficiência com garantia de fábrica de 25 anos de geração. Preço especial para técnicos da TécnicaMZ.',
    images: ['https://images.unsplash.com/photo-1509391365360-2e959784a276?w=600&auto=format&fit=crop&q=80'],
    status: 'active',
    createdAt: getPastDate(2)
  }
];

export const INITIAL_ACADEMY_ARTICLES: AcademyArticle[] = [
  {
    id: 'acad_1',
    title: 'Guia de Aterramento Elétrico (Sistemas TN-S e TT) Conforme Normas EDM Moçambique',
    category: 'Eletricidade',
    readTime: '8 min',
    author: 'Eng. André Zefanias Júnior',
    source: 'TécnicaMZ / Normas Elétricas de Moçambique',
    sourceUrl: 'https://www.edm.co.mz',
    verifiedDate: '2026-08-10',
    description: 'Como calcular a resistência de terra (< 10 Ohms) usando hastes cobreadas de 2.4m em solo arenoso e argiloso em Moçambique.',
    tags: ['Aterramento', 'Segurança EDM', 'Barramento de Proteção'],
    downloadable: true,
    verifiedByAdmin: true
  },
  {
    id: 'acad_2',
    title: 'Dimensionamento de Baterias de Lítio LiFePO4 vs Gel para Clima Tropical em Moçambique',
    category: 'Energia Solar',
    readTime: '12 min',
    author: 'Eng. Armínia Macamo',
    source: 'Laboratório de Energia Solar da UEM',
    sourceUrl: 'https://uem.mz',
    verifiedDate: '2026-08-15',
    description: 'Impacto da temperatura ambiente (+35°C no verão) nos ciclos de vida, profundidade de descarga DoD e corrente C de recarga.',
    tags: ['Baterias LiFePO4', 'Solar Fotovoltaico', 'Inversores Híbridos'],
    downloadable: true,
    verifiedByAdmin: true
  },
  {
    id: 'acad_3',
    title: 'Instalação de Câmeras IP PoE e Configuração de Acesso P2P sem Necessidade de IP Fixo',
    category: 'CCTV e Segurança',
    readTime: '10 min',
    author: 'Comunidade TécnicaMZ',
    source: 'Instituto Industrial de Maputo',
    sourceUrl: 'https://iim.ac.mz',
    verifiedDate: '2026-08-18',
    description: 'Passo a passo com crimpagem padrão T-568B, dimensionamento de banda por canal H.265 e proteção contra surtos ethernet.',
    tags: ['CFTV IP', 'Redes', 'Segurança Eletrônica'],
    downloadable: false,
    verifiedByAdmin: true
  }
];

export const INITIAL_CONVERSATIONS: ConversationItem[] = [
  {
    id: 'conv_1',
    participantIds: ['client_joao', 'tech_mateus'],
    participants: [
      { id: 'client_joao', name: 'João Chissano', role: 'client' },
      { id: 'tech_mateus', name: 'Mateus Cossa', role: 'technician' }
    ],
    lastMessage: 'Perfeito Mateus, pode vir amanhã às 10h para inspecionar o quadro elétrico.',
    lastMessageAt: getPastDate(1),
    contextType: 'request',
    contextTitle: 'Revisão Geral do Quadro Elétrico'
  },
  {
    id: 'conv_2',
    participantIds: ['company_cimentos', 'tech_mateus'],
    participants: [
      { id: 'company_cimentos', name: 'Indústria Cimentos de Moçambique SA', role: 'company' },
      { id: 'tech_mateus', name: 'Mateus Cossa', role: 'technician' }
    ],
    lastMessage: 'Recebemos a sua candidatura para a vaga de Eletromecânico. Gostaríamos de agendar uma entrevista técnica.',
    lastMessageAt: getPastDate(2),
    contextType: 'job',
    contextTitle: 'Vaga: Técnico Eletromecânico'
  }
];

export const INITIAL_MESSAGES: MessageItem[] = [
  {
    id: 'msg_1',
    conversationId: 'conv_1',
    senderId: 'client_joao',
    senderName: 'João Chissano',
    senderRole: 'client',
    text: 'Olá Mateus, vi sua proposta de 4.700 MZN para a revisão do quadro. O valor já inclui os disjuntores?',
    createdAt: getPastDate(2)
  },
  {
    id: 'msg_2',
    conversationId: 'conv_1',
    senderId: 'tech_mateus',
    senderName: 'Mateus Cossa',
    senderRole: 'technician',
    text: 'Olá Sr. João! Sim, inclui 2 disjuntores da Schneider Electric de 25A e a revisão completa com teste de carga.',
    createdAt: getPastDate(2)
  },
  {
    id: 'msg_3',
    conversationId: 'conv_1',
    senderId: 'client_joao',
    senderName: 'João Chissano',
    senderRole: 'client',
    text: 'Perfeito Mateus, pode vir amanhã às 10h para inspecionar o quadro elétrico.',
    createdAt: getPastDate(1)
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_1',
    userId: 'tech_mateus',
    title: 'Proposta Aceite!',
    message: 'João Chissano aceitou a sua proposta para o serviço de Revisão do Quadro Elétrico.',
    type: 'success',
    read: false,
    linkTab: 'technician',
    deeplink: 'proposals',
    createdAt: getPastDate(1)
  },
  {
    id: 'notif_2',
    userId: 'company_cimentos',
    title: 'Nova Candidatura Recebida',
    message: 'Mateus Cossa candidatou-se à vaga de Técnico de Manutenção Eletromecânica.',
    type: 'info',
    read: false,
    linkTab: 'company',
    deeplink: 'applications',
    createdAt: getPastDate(3)
  },
  {
    id: 'notif_3',
    userId: 'client_joao',
    title: 'Nova Proposta Recebida',
    message: 'A Eng. Armínia Macamo enviou uma proposta para o seu pedido de Sistema Solar Híbrido.',
    type: 'info',
    read: false,
    linkTab: 'client',
    deeplink: 'requests',
    createdAt: getPastDate(1)
  }
];

export const INITIAL_REPORTS: ReportItem[] = [
  {
    id: 'rep_1',
    reporterId: 'client_joao',
    reporterName: 'João Chissano',
    reporterRole: 'client',
    targetId: 'fake_profile_1',
    targetName: 'Técnico Não Registado',
    targetType: 'technician',
    reason: 'Preço abusivo ou documentação suspeita',
    details: 'Usuário tentou cobrar adiantamento sem apresentar qualquer documentação ou orçamento formal.',
    status: 'resolved',
    resolutionNotes: 'Perfil bloqueado após análise da equipa de moderação.',
    createdAt: getPastDate(20)
  }
];

export const INITIAL_ADMIN_LOGS: AdminLogItem[] = [
  {
    id: 'log_1',
    adminId: 'admin_owner',
    adminName: 'André Zefanias Júnior',
    adminRole: 'super_admin',
    action: 'Aprovação de Pagamento M-Pesa',
    targetId: 'pay_101',
    targetName: 'Mateus Cossa (499 MZN)',
    details: 'Transação MP260811902 confirmada no extrato M-Pesa. Assinatura Premium ativada por 30 dias.',
    timestamp: getPastDate(3)
  },
  {
    id: 'log_2',
    adminId: 'admin_finance',
    adminName: 'Marta Sitoe',
    adminRole: 'finance_admin',
    action: 'Aprovação de Assinatura Empresarial',
    targetId: 'pay_102',
    targetName: 'MozSolar Energy Ltd (999 MZN)',
    details: 'Comprovativo bancário BIM verificado com sucesso.',
    timestamp: getPastDate(20)
  }
];

export const INITIAL_COMMUNITY_POSTS: CommunityPost[] = [
  {
    id: 'post_1',
    authorId: 'tech_arminia',
    authorName: 'Eng. Armínia Macamo',
    authorRole: 'technician',
    authorAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
    authorSpecialty: 'Energia Solar Fotovoltaica',
    authorProvince: 'Maputo Província',
    authorWhatsapp: '258842003002',
    title: 'Dica Prática: Dimensionamento de Cabos CC para Strings Solares Longas',
    content: 'Colegas técnicos, ao realizarem instalações solares residenciais ou comerciais com distância superior a 35 metros entre o arranjo fotovoltaico no telhado e o inversor/quadro, nunca usem cabo solar inferior a 6mm²! A queda de tensão em corrente contínua degrada a eficiência do rastreador MPPT e causa aquecimento excessivo nos conectores MC4.\n\nSempre utilizem alicate crimpador calibrado para evitar centelhamento e conectores originais IP68.',
    category: 'Energia Solar',
    tags: ['Solar Fotovoltaico', 'Queda de Tensão', 'Conectores MC4', 'EDM'],
    images: [
      'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=600&auto=format&fit=crop&q=80'
    ],
    reactions: {
      useful: ['tech_mateus', 'admin_owner', 'tech_edson'],
      insightful: ['tech_mateus'],
      applause: ['admin_owner', 'client_joao'],
      question: []
    },
    commentsCount: 2,
    comments: [
      {
        id: 'comm_1',
        postId: 'post_1',
        authorId: 'tech_mateus',
        authorName: 'Mateus Cossa',
        authorRole: 'technician',
        authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
        authorSpecialty: 'Eletricidade Industrial',
        text: 'Excelente lembrete, Eng. Armínia! Já encontrei aqui na Matola vários sistemas desarmando o MPPT justamente por queda de 5% no cabo CC.',
        createdAt: getPastDate(2)
      },
      {
        id: 'comm_2',
        postId: 'post_1',
        authorId: 'admin_owner',
        authorName: 'André Zefanias Júnior',
        authorRole: 'super_admin',
        text: 'Ótima contribuição técnica para a comunidade da TécnicaMZ! As calculadoras de queda de tensão no menu de Ferramentas já estão atualizadas com essas fórmulas.',
        createdAt: getPastDate(1)
      }
    ],
    pinned: true,
    createdAt: getPastDate(3)
  },
  {
    id: 'post_2',
    authorId: 'tech_mateus',
    authorName: 'Mateus Cossa',
    authorRole: 'technician',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    authorSpecialty: 'Eletricidade e Automação',
    authorProvince: 'Maputo Cidade',
    authorWhatsapp: '258841002001',
    title: 'Comutação Automática Rede EDM / Gerador com ATS: Cuidado com o Neutro!',
    content: 'Atenção aos colegas montando quadros de transferência automática (ATS / QTA): lembrem-se de usar contactores ou chaves motorizadas tetrapolares (4 polos) quando o sistema envolver geradores trifásicos com aterramento independente. Cortar apenas as 3 fases mantendo o neutro compartilhado sem seccionamento pode criar correntes de retorno pelo aterramento da EDM.',
    category: 'Eletricidade',
    tags: ['ATS', 'Geradores', 'Norma EDM', 'Quadros Elétricos'],
    images: [
      'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop&q=80'
    ],
    reactions: {
      useful: ['tech_arminia', 'tech_edson'],
      insightful: ['tech_arminia'],
      applause: ['admin_owner'],
      question: []
    },
    commentsCount: 1,
    comments: [
      {
        id: 'comm_3',
        postId: 'post_2',
        authorId: 'tech_edson',
        authorName: 'Edson Nhantumbo',
        authorRole: 'technician',
        authorAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80',
        authorSpecialty: 'Refrigeração e Climatização',
        text: 'Muito bem observado! Isso também protege os compressores de ar condicionado inverter contra inversão ou queima de placa.',
        createdAt: getPastDate(1)
      }
    ],
    pinned: false,
    createdAt: getPastDate(5)
  },
  {
    id: 'post_3',
    authorId: 'tech_edson',
    authorName: 'Edson Nhantumbo',
    authorRole: 'technician',
    authorAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80',
    authorSpecialty: 'Frio e Climatização',
    authorProvince: 'Sofala',
    authorWhatsapp: '258863004003',
    title: 'Procedimento correto de Vácuo em Sistemas com Gás R32 / R410A',
    content: 'Para todos os técnicos de climatização aqui na Beira e Moçambique: a umidade ambiente é alta no nosso litoral. Não façam purga com o próprio refrigerante! Usem bomba de vácuo de duplo estágio e vacuômetro digital até atingir menos de 500 microns. Isso garante 10 anos de vida útil sem queima precoce de compressor.',
    category: 'Frio e Climatização',
    tags: ['Ar Condicionado', 'Vácuo', 'Gás R32', 'Refrigeração'],
    images: [
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80'
    ],
    reactions: {
      useful: ['tech_mateus', 'tech_arminia', 'admin_owner'],
      insightful: ['tech_mateus'],
      applause: ['tech_arminia'],
      question: []
    },
    commentsCount: 0,
    comments: [],
    pinned: false,
    createdAt: getPastDate(7)
  }
];

