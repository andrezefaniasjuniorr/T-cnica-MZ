import React, { createContext, useContext, useState, useEffect } from 'react';
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
  NotificationItem,
  ReportItem,
  AdminLogItem,
  PlatformSettings,
  UserStatus,
  VerificationStatus,
  CompanyVerificationStatus,
  PaymentMethod,
  MarketItem,
  AcademyArticle,
  ConversationItem,
  MessageItem,
  BudgetEstimate,
  ApplicationStatus,
  CommunityPost,
  CommunityComment
} from '../types';
import {
  INITIAL_TECHNICIANS,
  INITIAL_COMPANIES,
  INITIAL_JOBS,
  INITIAL_JOB_APPLICATIONS,
  INITIAL_PLANS,
  INITIAL_PAYMENTS,
  INITIAL_SERVICE_REQUESTS,
  INITIAL_PROPOSALS,
  INITIAL_REVIEWS,
  INITIAL_PORTFOLIO,
  INITIAL_MARKET_ITEMS,
  INITIAL_ACADEMY_ARTICLES,
  INITIAL_CONVERSATIONS,
  INITIAL_MESSAGES,
  INITIAL_NOTIFICATIONS,
  INITIAL_REPORTS,
  INITIAL_ADMIN_LOGS,
  INITIAL_SETTINGS,
  INITIAL_COMMUNITY_POSTS
} from '../data/initialData';
import { useAuth } from './AuthContext';

interface DataContextType {
  technicians: TechnicianProfile[];
  companies: CompanyProfile[];
  jobs: JobOpening[];
  applications: JobApplication[];
  plans: SubscriptionPlan[];
  payments: PaymentRecord[];
  serviceRequests: ServiceRequest[];
  proposals: Proposal[];
  reviews: Review[];
  portfolio: PortfolioItem[];
  marketItems: MarketItem[];
  academyArticles: AcademyArticle[];
  conversations: ConversationItem[];
  messages: MessageItem[];
  notifications: NotificationItem[];
  reports: ReportItem[];
  adminLogs: AdminLogItem[];
  settings: PlatformSettings;
  favorites: string[];
  budgetEstimates: BudgetEstimate[];

  // Technician Actions
  getTechnicianById: (userId: string) => TechnicianProfile | undefined;
  updateTechnicianStatus: (userId: string, status: UserStatus, reason?: string) => void;
  verifyTechnician: (userId: string, status: VerificationStatus, reason?: string) => void;
  toggleFeaturedTechnician: (userId: string) => void;
  deleteTechnician: (userId: string) => void;
  submitVerificationDocuments: (userId: string, docNames: string[]) => void;

  // Company Actions
  getCompanyById: (userId: string) => CompanyProfile | undefined;
  verifyCompany: (userId: string, status: CompanyVerificationStatus, reason?: string) => void;
  updateCompanyStatus: (userId: string, status: UserStatus) => void;
  toggleFeaturedCompany: (userId: string) => void;
  deleteCompany: (userId: string) => void;

  // Job Openings & Applications
  createJobOpening: (job: Omit<JobOpening, 'id' | 'createdAt' | 'applicationsCount' | 'status'>) => void;
  updateJobStatus: (jobId: string, status: JobOpening['status']) => void;
  applyToJob: (data: Omit<JobApplication, 'id' | 'createdAt' | 'status'>) => Promise<{ success: boolean; error?: string }>;
  updateApplicationStatus: (appId: string, status: ApplicationStatus, notes?: string) => void;

  // Plan & Payment Actions
  updatePlan: (planId: string, data: Partial<SubscriptionPlan>) => void;
  createPlan: (plan: Omit<SubscriptionPlan, 'id' | 'createdAt'>) => void;
  togglePlanActive: (planId: string) => void;
  submitPayment: (data: {
    userId: string;
    userName: string;
    userRole: any;
    userPhone?: string;
    planId: string;
    planName: string;
    amountMZN: number;
    method: PaymentMethod;
    transactionCode: string;
    receiptUrl?: string;
    message?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  approvePayment: (paymentId: string, adminId: string, adminName: string) => void;
  rejectPayment: (paymentId: string, adminId: string, adminName: string, reason: string) => void;

  // Service Requests & Proposals
  createServiceRequest: (data: Omit<ServiceRequest, 'id' | 'createdAt' | 'status' | 'proposalsCount'>) => void;
  addServiceRequest: (data: Omit<ServiceRequest, 'id' | 'createdAt' | 'status' | 'proposalsCount'>) => void;
  updateRequestStatus: (requestId: string, status: ServiceRequest['status']) => void;
  submitProposal: (data: Omit<Proposal, 'id' | 'createdAt' | 'status'>) => void;
  acceptProposal: (proposalId: string) => void;
  rejectProposal: (proposalId: string) => void;

  // Reviews
  addReview: (data: Omit<Review, 'id' | 'createdAt'>) => void;

  // Portfolio
  addPortfolioItem: (item: Omit<PortfolioItem, 'id' | 'createdAt'>) => void;
  deletePortfolioItem: (itemId: string) => void;

  // Market
  addMarketItem: (item: Omit<MarketItem, 'id' | 'createdAt' | 'status'>) => void;
  updateMarketItemStatus: (itemId: string, status: MarketItem['status']) => void;
  deleteMarketItem: (itemId: string) => void;
  editMarketItem: (itemId: string, data: Partial<MarketItem>) => void;

  // Technical Community Feed
  communityPosts: CommunityPost[];
  addCommunityPost: (post: {
    title: string;
    content: string;
    category: string;
    tags?: string[];
    images?: string[];
  }) => void;
  togglePostReaction: (postId: string, reactionType: 'useful' | 'insightful' | 'applause' | 'question') => void;
  addPostComment: (postId: string, text: string) => void;
  deleteCommunityPost: (postId: string) => void;

  // Academy
  addAcademyArticle: (article: Omit<AcademyArticle, 'id' | 'verifiedByAdmin'>) => void;
  verifyAcademyArticle: (articleId: string) => void;

  // Messaging
  sendMessage: (conversationId: string, text: string) => void;
  startOrGetConversation: (targetUserId: string, targetUserName: string, targetUserRole: any, context?: { type: 'job' | 'request' | 'direct'; title: string }) => string;

  // Budget Estimates Generator
  saveBudgetEstimate: (estimate: Omit<BudgetEstimate, 'id' | 'createdAt'>) => BudgetEstimate;

  // Notifications
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  unreadNotificationsCount: number;

  // Favorites
  toggleFavorite: (targetId: string) => void;
  isFavorite: (targetId: string) => boolean;

  // Settings
  updateSettings: (newSettings: Partial<PlatformSettings>) => void;

  // Reports
  submitReport: (report: Omit<ReportItem, 'id' | 'createdAt' | 'status'>) => void;
  resolveReport: (reportId: string, notes?: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();

  const [technicians, setTechnicians] = useState<TechnicianProfile[]>(() => {
    const saved = localStorage.getItem('tecnicamz_technicians');
    return saved ? JSON.parse(saved) : INITIAL_TECHNICIANS;
  });

  const [companies, setCompanies] = useState<CompanyProfile[]>(() => {
    const saved = localStorage.getItem('tecnicamz_companies');
    return saved ? JSON.parse(saved) : INITIAL_COMPANIES;
  });

  const [jobs, setJobs] = useState<JobOpening[]>(() => {
    const saved = localStorage.getItem('tecnicamz_jobs');
    return saved ? JSON.parse(saved) : INITIAL_JOBS;
  });

  const [applications, setApplications] = useState<JobApplication[]>(() => {
    const saved = localStorage.getItem('tecnicamz_job_applications');
    return saved ? JSON.parse(saved) : INITIAL_JOB_APPLICATIONS;
  });

  const [plans, setPlans] = useState<SubscriptionPlan[]>(() => {
    const saved = localStorage.getItem('tecnicamz_plans');
    return saved ? JSON.parse(saved) : INITIAL_PLANS;
  });

  const [payments, setPayments] = useState<PaymentRecord[]>(() => {
    const saved = localStorage.getItem('tecnicamz_payments');
    return saved ? JSON.parse(saved) : INITIAL_PAYMENTS;
  });

  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>(() => {
    const saved = localStorage.getItem('tecnicamz_requests');
    return saved ? JSON.parse(saved) : INITIAL_SERVICE_REQUESTS;
  });

  const [proposals, setProposals] = useState<Proposal[]>(() => {
    const saved = localStorage.getItem('tecnicamz_proposals');
    return saved ? JSON.parse(saved) : INITIAL_PROPOSALS;
  });

  const [reviews, setReviews] = useState<Review[]>(() => {
    const saved = localStorage.getItem('tecnicamz_reviews');
    return saved ? JSON.parse(saved) : INITIAL_REVIEWS;
  });

  const [portfolio, setPortfolio] = useState<PortfolioItem[]>(() => {
    const saved = localStorage.getItem('tecnicamz_portfolio');
    return saved ? JSON.parse(saved) : INITIAL_PORTFOLIO;
  });

  const [marketItems, setMarketItems] = useState<MarketItem[]>(() => {
    const saved = localStorage.getItem('tecnicamz_market');
    return saved ? JSON.parse(saved) : INITIAL_MARKET_ITEMS;
  });

  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>(() => {
    const saved = localStorage.getItem('tecnicamz_community_posts');
    return saved ? JSON.parse(saved) : INITIAL_COMMUNITY_POSTS;
  });

  const [academyArticles, setAcademyArticles] = useState<AcademyArticle[]>(() => {
    const saved = localStorage.getItem('tecnicamz_academy');
    return saved ? JSON.parse(saved) : INITIAL_ACADEMY_ARTICLES;
  });

  const [conversations, setConversations] = useState<ConversationItem[]>(() => {
    const saved = localStorage.getItem('tecnicamz_conversations');
    return saved ? JSON.parse(saved) : INITIAL_CONVERSATIONS;
  });

  const [messages, setMessages] = useState<MessageItem[]>(() => {
    const saved = localStorage.getItem('tecnicamz_messages');
    return saved ? JSON.parse(saved) : INITIAL_MESSAGES;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('tecnicamz_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [reports, setReports] = useState<ReportItem[]>(() => {
    const saved = localStorage.getItem('tecnicamz_reports');
    return saved ? JSON.parse(saved) : INITIAL_REPORTS;
  });

  const [adminLogs, setAdminLogs] = useState<AdminLogItem[]>(() => {
    const saved = localStorage.getItem('tecnicamz_admin_logs');
    return saved ? JSON.parse(saved) : INITIAL_ADMIN_LOGS;
  });

  const [settings, setSettings] = useState<PlatformSettings>(() => {
    const saved = localStorage.getItem('tecnicamz_settings');
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('tecnicamz_favorites');
    return saved ? JSON.parse(saved) : ['tech_mateus'];
  });

  const [budgetEstimates, setBudgetEstimates] = useState<BudgetEstimate[]>(() => {
    const saved = localStorage.getItem('tecnicamz_budget_estimates');
    return saved ? JSON.parse(saved) : [];
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('tecnicamz_technicians', JSON.stringify(technicians));
  }, [technicians]);

  useEffect(() => {
    localStorage.setItem('tecnicamz_companies', JSON.stringify(companies));
  }, [companies]);

  useEffect(() => {
    localStorage.setItem('tecnicamz_jobs', JSON.stringify(jobs));
  }, [jobs]);

  useEffect(() => {
    localStorage.setItem('tecnicamz_job_applications', JSON.stringify(applications));
  }, [applications]);

  useEffect(() => {
    localStorage.setItem('tecnicamz_plans', JSON.stringify(plans));
  }, [plans]);

  useEffect(() => {
    localStorage.setItem('tecnicamz_payments', JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem('tecnicamz_requests', JSON.stringify(serviceRequests));
  }, [serviceRequests]);

  useEffect(() => {
    localStorage.setItem('tecnicamz_proposals', JSON.stringify(proposals));
  }, [proposals]);

  useEffect(() => {
    localStorage.setItem('tecnicamz_reviews', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem('tecnicamz_portfolio', JSON.stringify(portfolio));
  }, [portfolio]);

  useEffect(() => {
    localStorage.setItem('tecnicamz_market', JSON.stringify(marketItems));
  }, [marketItems]);

  useEffect(() => {
    localStorage.setItem('tecnicamz_community_posts', JSON.stringify(communityPosts));
  }, [communityPosts]);

  useEffect(() => {
    localStorage.setItem('tecnicamz_academy', JSON.stringify(academyArticles));
  }, [academyArticles]);

  useEffect(() => {
    localStorage.setItem('tecnicamz_conversations', JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    localStorage.setItem('tecnicamz_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('tecnicamz_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('tecnicamz_reports', JSON.stringify(reports));
  }, [reports]);

  useEffect(() => {
    localStorage.setItem('tecnicamz_admin_logs', JSON.stringify(adminLogs));
  }, [adminLogs]);

  useEffect(() => {
    localStorage.setItem('tecnicamz_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('tecnicamz_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('tecnicamz_budget_estimates', JSON.stringify(budgetEstimates));
  }, [budgetEstimates]);

  // Helper log generator
  const addAdminLog = (action: string, targetId?: string, targetName?: string, details?: string) => {
    if (!currentUser) return;
    const newLog: AdminLogItem = {
      id: `log_${Date.now()}`,
      adminId: currentUser.uid,
      adminName: currentUser.name,
      adminRole: currentUser.adminSubRole || currentUser.role,
      action,
      targetId,
      targetName,
      details,
      timestamp: new Date().toISOString()
    };
    setAdminLogs(prev => [newLog, ...prev]);
  };

  // Helper notification generator
  const createNotification = (userId: string, title: string, message: string, type: 'info' | 'success' | 'warning' | 'alert', linkTab?: string, deeplink?: string) => {
    const newNotif: NotificationItem = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
      title,
      message,
      type,
      read: false,
      linkTab,
      deeplink,
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // Technician Get & Updates
  const getTechnicianById = (userId: string) => technicians.find(t => t.userId === userId);

  const updateTechnicianStatus = (userId: string, status: UserStatus, reason?: string) => {
    setTechnicians(prev =>
      prev.map(t => (t.userId === userId ? { ...t, status, suspensionReason: reason, updatedAt: new Date().toISOString() } : t))
    );
    addAdminLog(`Alteração de status do técnico para ${status}`, userId, undefined, reason);
  };

  const verifyTechnician = (userId: string, status: VerificationStatus, reason?: string) => {
    setTechnicians(prev =>
      prev.map(t =>
        t.userId === userId
          ? {
              ...t,
              verificationStatus: status,
              verificationRejectionReason: reason,
              updatedAt: new Date().toISOString()
            }
          : t
      )
    );
    addAdminLog(`Verificação de técnico: ${status}`, userId, undefined, reason);
    createNotification(
      userId,
      status === 'approved' ? '✓ Selo Verificado Aprovado!' : 'Status de Verificação Atualizado',
      status === 'approved'
        ? 'Parabéns! Sua documentação foi aprovada pela equipa TécnicaMZ.'
        : `Sua verificação foi marcada como ${status}. Motivo: ${reason || 'Revise seus documentos.'}`,
      status === 'approved' ? 'success' : 'warning',
      'technician',
      'overview'
    );
  };

  const toggleFeaturedTechnician = (userId: string) => {
    setTechnicians(prev =>
      prev.map(t => (t.userId === userId ? { ...t, featured: !t.featured, updatedAt: new Date().toISOString() } : t))
    );
  };

  const deleteTechnician = (userId: string) => {
    setTechnicians(prev => prev.filter(t => t.userId !== userId));
    addAdminLog(`Técnico removido/expulso permanentemente`, userId);
  };

  const submitVerificationDocuments = (userId: string, docNames: string[]) => {
    const newDocs = docNames.map((name, i) => ({
      id: `doc_${Date.now()}_${i}`,
      name,
      type: 'certificate' as const,
      url: `https://example.com/docs/${name}`,
      uploadedAt: new Date().toISOString()
    }));

    setTechnicians(prev =>
      prev.map(t =>
        t.userId === userId
          ? {
              ...t,
              verificationStatus: 'pending',
              verificationDocuments: [...(t.verificationDocuments || []), ...newDocs],
              updatedAt: new Date().toISOString()
            }
          : t
      )
    );

    // Notify admins
    createNotification(
      'admin_owner',
      'Nova Documentação para Análise',
      `O técnico ${userId} enviou ${docNames.length} documento(s) para aprovação de selo.`,
      'info',
      'admin',
      'verifications'
    );
  };

  // Company Get & Updates
  const getCompanyById = (userId: string) => companies.find(c => c.userId === userId);

  const verifyCompany = (userId: string, status: CompanyVerificationStatus, reason?: string) => {
    setCompanies(prev =>
      prev.map(c =>
        c.userId === userId
          ? {
              ...c,
              verificationStatus: status,
              verificationRejectionReason: reason,
              updatedAt: new Date().toISOString()
            }
          : c
      )
    );
    addAdminLog(`Verificação de empresa (NUIT): ${status}`, userId, undefined, reason);
    createNotification(
      userId,
      status === 'verified' ? '✓ Empresa Verificada Aprovada!' : 'Status Empresarial Atualizado',
      status === 'verified'
        ? 'O seu cadastro empresarial e NUIT foram certificados pela TécnicaMZ.'
        : `Atualização de verificação: ${status}.`,
      status === 'verified' ? 'success' : 'warning',
      'company',
      'overview'
    );
  };

  const updateCompanyStatus = (userId: string, status: UserStatus) => {
    setCompanies(prev => prev.map(c => (c.userId === userId ? { ...c, status, updatedAt: new Date().toISOString() } : c)));
  };

  const toggleFeaturedCompany = (userId: string) => {
    setCompanies(prev => prev.map(c => (c.userId === userId ? { ...c, featured: !c.featured, updatedAt: new Date().toISOString() } : c)));
  };

  const deleteCompany = (userId: string) => {
    setCompanies(prev => prev.filter(c => c.userId !== userId));
    addAdminLog(`Empresa removida/expulsa permanentemente`, userId);
  };

  // Job Openings
  const createJobOpening = (jobData: Omit<JobOpening, 'id' | 'createdAt' | 'applicationsCount' | 'status'>) => {
    const newJob: JobOpening = {
      ...jobData,
      id: `job_${Date.now()}`,
      applicationsCount: 0,
      status: 'active',
      createdAt: new Date().toISOString()
    };
    setJobs(prev => [newJob, ...prev]);

    // Update company active jobs count
    setCompanies(prev =>
      prev.map(c => (c.userId === jobData.companyId ? { ...c, activeJobsCount: (c.activeJobsCount || 0) + 1 } : c))
    );

    createNotification(
      jobData.companyId,
      'Vaga Publicada com Sucesso!',
      `Sua oportunidade "${newJob.title}" já está visível para técnicos em Moçambique.`,
      'success',
      'company',
      'my_jobs'
    );
  };

  const updateJobStatus = (jobId: string, status: JobOpening['status']) => {
    setJobs(prev => prev.map(j => (j.id === jobId ? { ...j, status, updatedAt: new Date().toISOString() } : j)));
  };

  const applyToJob = async (data: Omit<JobApplication, 'id' | 'createdAt' | 'status'>): Promise<{ success: boolean; error?: string }> => {
    try {
      // Check if already applied
      const existing = applications.find(a => a.jobId === data.jobId && a.technicianId === data.technicianId);
      if (existing) {
        return { success: false, error: 'Você já submeteu uma candidatura para esta vaga.' };
      }

      const newApp: JobApplication = {
        ...data,
        id: `app_${Date.now()}`,
        status: 'Recebida',
        createdAt: new Date().toISOString()
      };

      setApplications(prev => [newApp, ...prev]);

      // Increment job counter
      setJobs(prev =>
        prev.map(j => (j.id === data.jobId ? { ...j, applicationsCount: j.applicationsCount + 1 } : j))
      );

      // Notify company
      createNotification(
        data.companyId,
        'Nova Candidatura Recebida',
        `${data.technicianName} candidatou-se à vaga "${data.jobTitle}".`,
        'info',
        'company',
        'applications'
      );

      // Notify technician
      createNotification(
        data.technicianId,
        'Candidatura Enviada',
        `Sua candidatura para "${data.jobTitle}" na empresa ${data.companyName} foi entregue.`,
        'success',
        'technician',
        'my_proposals'
      );

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Erro ao submeter candidatura.' };
    }
  };

  const updateApplicationStatus = (appId: string, status: ApplicationStatus, notes?: string) => {
    const targetApp = applications.find(a => a.id === appId);
    if (!targetApp) return;

    setApplications(prev =>
      prev.map(a =>
        a.id === appId
          ? { ...a, status, statusNotes: notes || a.statusNotes, updatedAt: new Date().toISOString() }
          : a
      )
    );

    // Notify technician of progress
    createNotification(
      targetApp.technicianId,
      `Status de Candidatura: ${status}`,
      `A empresa ${targetApp.companyName} atualizou a sua candidatura para "${targetApp.jobTitle}" para o status: ${status}.`,
      status === 'Aprovada' || status === 'Selecionada' ? 'success' : 'info',
      'technician',
      'my_proposals'
    );
  };

  // Plans & Payments
  const updatePlan = (planId: string, data: Partial<SubscriptionPlan>) => {
    setPlans(prev => prev.map(p => (p.id === planId ? { ...p, ...data, updatedAt: new Date().toISOString() } : p)));
    addAdminLog('Atualização de plano de assinatura', planId);
  };

  const createPlan = (planData: Omit<SubscriptionPlan, 'id' | 'createdAt'>) => {
    const newPlan: SubscriptionPlan = {
      ...planData,
      id: `plan_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setPlans(prev => [...prev, newPlan]);
    addAdminLog('Criação de novo plano de assinatura', newPlan.id, newPlan.name);
  };

  const togglePlanActive = (planId: string) => {
    setPlans(prev => prev.map(p => (p.id === planId ? { ...p, active: !p.active } : p)));
  };

  const submitPayment = async (data: {
    userId: string;
    userName: string;
    userRole: any;
    userPhone?: string;
    planId: string;
    planName: string;
    amountMZN: number;
    method: PaymentMethod;
    transactionCode: string;
    receiptUrl?: string;
    message?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      const newPayment: PaymentRecord = {
        id: `pay_${Date.now()}`,
        ...data,
        status: 'pending',
        submittedAt: new Date().toISOString()
      };

      setPayments(prev => [newPayment, ...prev]);

      // Notify Admins
      createNotification(
        'admin_owner',
        'Novo Pagamento para Aprovação',
        `${data.userName} enviou comprovativo de ${data.amountMZN} MZN (${data.method.toUpperCase()}).`,
        'warning',
        'admin',
        'payments'
      );

      createNotification(
        data.userId,
        'Comprovativo em Análise',
        'Recebemos seu comprovativo de pagamento. Nossa equipa ativará seu plano após conferência.',
        'info',
        data.userRole === 'technician' ? 'technician' : 'company',
        'payments'
      );

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Falha ao registrar pagamento.' };
    }
  };

  const approvePayment = (paymentId: string, adminId: string, adminName: string) => {
    const pay = payments.find(p => p.id === paymentId);
    if (!pay) return;

    setPayments(prev =>
      prev.map(p =>
        p.id === paymentId
          ? {
              ...p,
              status: 'approved',
              reviewedBy: adminId,
              reviewedByName: adminName,
              reviewedAt: new Date().toISOString()
            }
          : p
      )
    );

    // Calculate expiry (30 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    const expiresAtIso = expiresAt.toISOString();

    if (pay.userRole === 'technician') {
      setTechnicians(prev =>
        prev.map(t =>
          t.userId === pay.userId
            ? {
                ...t,
                subscriptionStatus: 'active',
                activePlanId: pay.planId,
                subscriptionExpiresAt: expiresAtIso,
                updatedAt: new Date().toISOString()
              }
            : t
        )
      );
    }

    addAdminLog('Aprovação de Pagamento', paymentId, `${pay.userName} (${pay.amountMZN} MZN)`);

    createNotification(
      pay.userId,
      '🎉 Assinatura Ativada com Sucesso!',
      `Seu pagamento de ${pay.amountMZN} MZN foi aprovado! Seu plano "${pay.planName}" está ativo por 30 dias.`,
      'success',
      pay.userRole === 'technician' ? 'technician' : 'company',
      'overview'
    );
  };

  const rejectPayment = (paymentId: string, adminId: string, adminName: string, reason: string) => {
    const pay = payments.find(p => p.id === paymentId);
    if (!pay) return;

    setPayments(prev =>
      prev.map(p =>
        p.id === paymentId
          ? {
              ...p,
              status: 'rejected',
              rejectionReason: reason,
              reviewedBy: adminId,
              reviewedByName: adminName,
              reviewedAt: new Date().toISOString()
            }
          : p
      )
    );

    addAdminLog('Rejeição de Pagamento', paymentId, `${pay.userName}`, reason);

    createNotification(
      pay.userId,
      'Pagamento Rejeitado',
      `O comprovativo enviado não pôde ser aprovado. Motivo: ${reason}`,
      'alert',
      pay.userRole === 'technician' ? 'technician' : 'company',
      'payments'
    );
  };

  // Service Requests & Proposals
  const createServiceRequest = (data: Omit<ServiceRequest, 'id' | 'createdAt' | 'status' | 'proposalsCount'>) => {
    const newReq: ServiceRequest = {
      ...data,
      id: `req_${Date.now()}`,
      status: 'open',
      proposalsCount: 0,
      createdAt: new Date().toISOString()
    };
    setServiceRequests(prev => [newReq, ...prev]);

    // Notify technicians matching category
    technicians
      .filter(t => t.specialties.includes(data.category) && t.subscriptionStatus === 'active')
      .forEach(t => {
        createNotification(
          t.userId,
          `Novo Pedido em ${data.category}`,
          `Um cliente publicou: "${data.title}" em ${data.province}. Envie sua proposta agora!`,
          'info',
          'technician',
          'available_requests'
        );
      });
  };

  const updateRequestStatus = (requestId: string, status: ServiceRequest['status']) => {
    setServiceRequests(prev =>
      prev.map(r => (r.id === requestId ? { ...r, status, updatedAt: new Date().toISOString() } : r))
    );
  };

  const submitProposal = (data: Omit<Proposal, 'id' | 'createdAt' | 'status'>) => {
    const newProp: Proposal = {
      ...data,
      id: `prop_${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    setProposals(prev => [newProp, ...prev]);

    // Increment request proposal count
    setServiceRequests(prev =>
      prev.map(r =>
        r.id === data.requestId
          ? {
              ...r,
              proposalsCount: (r.proposalsCount || 0) + 1,
              status: r.status === 'open' ? 'receiving_proposals' : r.status
            }
          : r
      )
    );

    // Notify client
    createNotification(
      data.clientId,
      'Nova Proposta Recebida!',
      `O técnico ${data.technicianName} enviou um orçamento no valor de ${data.totalCostMZN} MZN para o seu pedido.`,
      'info',
      'client',
      'requests'
    );
  };

  const acceptProposal = (proposalId: string) => {
    const prop = proposals.find(p => p.id === proposalId);
    if (!prop) return;

    setProposals(prev =>
      prev.map(p => (p.id === proposalId ? { ...p, status: 'accepted' } : p.requestId === prop.requestId ? { ...p, status: 'rejected' } : p))
    );

    setServiceRequests(prev =>
      prev.map(r =>
        r.id === prop.requestId
          ? {
              ...r,
              status: 'in_progress',
              acceptedTechnicianId: prop.technicianId,
              acceptedTechnicianName: prop.technicianName,
              acceptedProposalId: prop.id,
              updatedAt: new Date().toISOString()
            }
          : r
      )
    );

    createNotification(
      prop.technicianId,
      '🎉 Proposta Aceite pelo Cliente!',
      `O cliente aceitou sua proposta de ${prop.totalCostMZN} MZN para "${prop.requestTitle || 'o serviço'}". Entre em contato para iniciar o trabalho.`,
      'success',
      'technician',
      'my_proposals'
    );
  };

  const rejectProposal = (proposalId: string) => {
    setProposals(prev => prev.map(p => (p.id === proposalId ? { ...p, status: 'rejected' } : p)));
  };

  // Reviews
  const addReview = (data: Omit<Review, 'id' | 'createdAt'>) => {
    const newRev: Review = {
      ...data,
      id: `rev_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setReviews(prev => [newRev, ...prev]);

    if (data.technicianId) {
      // Recalculate technician rating
      const techReviews = [...reviews.filter(r => r.technicianId === data.technicianId), newRev];
      const avg = Number((techReviews.reduce((sum, r) => sum + r.rating, 0) / techReviews.length).toFixed(1));

      setTechnicians(prev =>
        prev.map(t =>
          t.userId === data.technicianId
            ? {
                ...t,
                rating: avg,
                reviewsCount: techReviews.length,
                completedJobsCount: t.completedJobsCount + 1
              }
            : t
        )
      );

      createNotification(
        data.technicianId,
        'Nova Avaliação de Cliente ⭐',
        `${data.clientName} avaliou o seu serviço com nota ${data.rating}/5.`,
        'success',
        'technician',
        'overview'
      );
    }
  };

  // Portfolio
  const addPortfolioItem = (item: Omit<PortfolioItem, 'id' | 'createdAt'>) => {
    const newItem: PortfolioItem = {
      ...item,
      id: `port_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setPortfolio(prev => [newItem, ...prev]);
  };

  const deletePortfolioItem = (itemId: string) => {
    setPortfolio(prev => prev.filter(p => p.id !== itemId));
  };

  // Market
  const addMarketItem = (itemData: Omit<MarketItem, 'id' | 'createdAt' | 'status'>) => {
    const newItem: MarketItem = {
      ...itemData,
      id: `market_${Date.now()}`,
      status: 'active',
      createdAt: new Date().toISOString()
    };
    setMarketItems(prev => [newItem, ...prev]);
  };

  const updateMarketItemStatus = (itemId: string, status: MarketItem['status']) => {
    setMarketItems(prev => prev.map(m => (m.id === itemId ? { ...m, status } : m)));
  };

  const deleteMarketItem = (itemId: string) => {
    setMarketItems(prev => prev.filter(m => m.id !== itemId));
  };

  const editMarketItem = (itemId: string, data: Partial<MarketItem>) => {
    setMarketItems(prev => prev.map(m => (m.id === itemId ? { ...m, ...data } : m)));
  };

  // Technical Community Feed
  const addCommunityPost = (postData: {
    title: string;
    content: string;
    category: string;
    tags?: string[];
    images?: string[];
  }) => {
    if (!currentUser) return;

    // Find if user is technician with specialty
    const techProfile = technicians.find(t => t.userId === currentUser.uid);

    const newPost: CommunityPost = {
      id: `post_${Date.now()}`,
      authorId: currentUser.uid,
      authorName: currentUser.name,
      authorRole: currentUser.role,
      authorAvatar: currentUser.avatarUrl,
      authorSpecialty: techProfile?.specialties[0] || (currentUser.role === 'company' ? 'Empresa / Indústria' : 'TécnicaMZ Profissional'),
      authorProvince: techProfile?.province || 'Maputo',
      authorWhatsapp: techProfile?.whatsapp || currentUser.phone || '',
      title: postData.title.trim(),
      content: postData.content.trim(),
      category: postData.category,
      tags: postData.tags || [],
      images: postData.images || [],
      reactions: {
        useful: [],
        insightful: [],
        applause: [],
        question: []
      },
      commentsCount: 0,
      comments: [],
      pinned: false,
      createdAt: new Date().toISOString()
    };

    setCommunityPosts(prev => [newPost, ...prev]);
  };

  const togglePostReaction = (postId: string, reactionType: 'useful' | 'insightful' | 'applause' | 'question') => {
    if (!currentUser) return;
    const userId = currentUser.uid;

    setCommunityPosts(prev =>
      prev.map(p => {
        if (p.id !== postId) return p;

        const currentList = p.reactions[reactionType] || [];
        const hasReacted = currentList.includes(userId);
        const updatedList = hasReacted
          ? currentList.filter(id => id !== userId)
          : [...currentList, userId];

        return {
          ...p,
          reactions: {
            ...p.reactions,
            [reactionType]: updatedList
          }
        };
      })
    );
  };

  const addPostComment = (postId: string, text: string) => {
    if (!currentUser || !text.trim()) return;

    const techProfile = technicians.find(t => t.userId === currentUser.uid);

    const newComment: CommunityComment = {
      id: `comm_${Date.now()}`,
      postId,
      authorId: currentUser.uid,
      authorName: currentUser.name,
      authorRole: currentUser.role,
      authorAvatar: currentUser.avatarUrl,
      authorSpecialty: techProfile?.specialties[0],
      text: text.trim(),
      createdAt: new Date().toISOString()
    };

    setCommunityPosts(prev =>
      prev.map(p => {
        if (p.id !== postId) return p;
        return {
          ...p,
          commentsCount: p.commentsCount + 1,
          comments: [...p.comments, newComment]
        };
      })
    );
  };

  const deleteCommunityPost = (postId: string) => {
    setCommunityPosts(prev => prev.filter(p => p.id !== postId));
  };

  // Academy
  const addAcademyArticle = (articleData: Omit<AcademyArticle, 'id' | 'verifiedByAdmin'>) => {
    const newArt: AcademyArticle = {
      ...articleData,
      id: `acad_${Date.now()}`,
      verifiedByAdmin: false
    };
    setAcademyArticles(prev => [newArt, ...prev]);
  };

  const verifyAcademyArticle = (articleId: string) => {
    setAcademyArticles(prev => prev.map(a => (a.id === articleId ? { ...a, verifiedByAdmin: true } : a)));
  };

  // Messaging System
  const sendMessage = (conversationId: string, text: string) => {
    if (!currentUser || !text.trim()) return;

    const newMsg: MessageItem = {
      id: `msg_${Date.now()}`,
      conversationId,
      senderId: currentUser.uid,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      text: text.trim(),
      createdAt: new Date().toISOString()
    };

    setMessages(prev => [...prev, newMsg]);

    // Update conversation metadata
    setConversations(prev =>
      prev.map(c =>
        c.id === conversationId
          ? {
              ...c,
              lastMessage: text.trim(),
              lastMessageAt: new Date().toISOString()
            }
          : c
      )
    );

    // Notify other participant
    const conv = conversations.find(c => c.id === conversationId);
    if (conv) {
      const otherId = conv.participantIds.find(id => id !== currentUser.uid);
      if (otherId) {
        createNotification(
          otherId,
          `Nova Mensagem de ${currentUser.name}`,
          text.trim().substring(0, 60) + (text.length > 60 ? '...' : ''),
          'info',
          'messages',
          conversationId
        );
      }
    }
  };

  const startOrGetConversation = (
    targetUserId: string,
    targetUserName: string,
    targetUserRole: any,
    context?: { type: 'job' | 'request' | 'direct'; title: string }
  ): string => {
    if (!currentUser) return '';

    // Check if conversation already exists between these 2 users
    const existing = conversations.find(
      c => c.participantIds.includes(currentUser.uid) && c.participantIds.includes(targetUserId)
    );

    if (existing) {
      return existing.id;
    }

    const newId = `conv_${Date.now()}`;
    const newConv: ConversationItem = {
      id: newId,
      participantIds: [currentUser.uid, targetUserId],
      participants: [
        { id: currentUser.uid, name: currentUser.name, role: currentUser.role, avatarUrl: currentUser.avatarUrl },
        { id: targetUserId, name: targetUserName, role: targetUserRole }
      ],
      lastMessage: 'Conversa iniciada',
      lastMessageAt: new Date().toISOString(),
      contextType: context?.type || 'direct',
      contextTitle: context?.title
    };

    setConversations(prev => [newConv, ...prev]);
    return newId;
  };

  // Budget Estimate Generator Save
  const saveBudgetEstimate = (data: Omit<BudgetEstimate, 'id' | 'createdAt'>): BudgetEstimate => {
    const newEst: BudgetEstimate = {
      ...data,
      id: `est_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setBudgetEstimates(prev => [newEst, ...prev]);
    return newEst;
  };

  // Notifications Actions
  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsAsRead = () => {
    if (!currentUser) return;
    setNotifications(prev => prev.map(n => (n.userId === currentUser.uid ? { ...n, read: true } : n)));
  };

  const unreadNotificationsCount = currentUser
    ? notifications.filter(n => n.userId === currentUser.uid && !n.read).length
    : 0;

  // Favorites
  const toggleFavorite = (targetId: string) => {
    setFavorites(prev => (prev.includes(targetId) ? prev.filter(id => id !== targetId) : [...prev, targetId]));
  };

  const isFavorite = (targetId: string) => favorites.includes(targetId);

  // Settings
  const updateSettings = (newSettings: Partial<PlatformSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    addAdminLog('Atualização de configurações da plataforma');
  };

  // Reports
  const submitReport = (reportData: Omit<ReportItem, 'id' | 'createdAt' | 'status'>) => {
    const newReport: ReportItem = {
      ...reportData,
      id: `rep_${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    setReports(prev => [newReport, ...prev]);

    createNotification(
      'admin_owner',
      'Nova Denúncia Registada',
      `Denúncia contra ${reportData.targetName} (${reportData.reason}).`,
      'alert',
      'admin',
      'reports'
    );
  };

  const resolveReport = (reportId: string, notes?: string) => {
    setReports(prev =>
      prev.map(r => (r.id === reportId ? { ...r, status: 'resolved', resolutionNotes: notes } : r))
    );
    addAdminLog('Resolução de Denúncia', reportId, undefined, notes);
  };

  return (
    <DataContext.Provider
      value={{
        technicians,
        companies,
        jobs,
        applications,
        plans,
        payments,
        serviceRequests,
        proposals,
        reviews,
        portfolio,
        marketItems,
        communityPosts,
        academyArticles,
        conversations,
        messages,
        notifications,
        reports,
        adminLogs,
        settings,
        favorites,
        budgetEstimates,
        getTechnicianById,
        updateTechnicianStatus,
        verifyTechnician,
        toggleFeaturedTechnician,
        deleteTechnician,
        submitVerificationDocuments,
        getCompanyById,
        verifyCompany,
        updateCompanyStatus,
        toggleFeaturedCompany,
        deleteCompany,
        createJobOpening,
        updateJobStatus,
        applyToJob,
        updateApplicationStatus,
        updatePlan,
        createPlan,
        togglePlanActive,
        submitPayment,
        approvePayment,
        rejectPayment,
        createServiceRequest,
        addServiceRequest: createServiceRequest,
        updateRequestStatus,
        submitProposal,
        acceptProposal,
        rejectProposal,
        addReview,
        addPortfolioItem,
        deletePortfolioItem,
        addMarketItem,
        updateMarketItemStatus,
        deleteMarketItem,
        editMarketItem,
        addCommunityPost,
        togglePostReaction,
        addPostComment,
        deleteCommunityPost,
        addAcademyArticle,
        verifyAcademyArticle,
        sendMessage,
        startOrGetConversation,
        saveBudgetEstimate,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        unreadNotificationsCount,
        toggleFavorite,
        isFavorite,
        updateSettings,
        submitReport,
        resolveReport
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
