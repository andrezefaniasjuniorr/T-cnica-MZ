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
  PaymentStatus,
  MarketItem,
  MarketComment,
  AcademyArticle,
  ConversationItem,
  MessageItem,
  BudgetEstimate,
  ApplicationStatus,
  CommunityPost,
  CommunityComment,
  StoryItem,
  StoryViewer,
  StoryReaction
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
import { auth, db, isFirebaseConfigured } from '../firebase/config';
import { safeGetStorageItem, safeSetStorageItem } from '../utils/storage';
import { doc, setDoc, updateDoc, deleteDoc, collection, onSnapshot, serverTimestamp, arrayUnion, increment } from 'firebase/firestore';

const formatTimestampToIso = (val: any): string => {
  if (!val) return new Date().toISOString();
  if (typeof val === 'string') return val;
  if (val && typeof val.toDate === 'function') {
    try {
      return val.toDate().toISOString();
    } catch {
      return new Date().toISOString();
    }
  }
  if (val && typeof val.seconds === 'number') {
    return new Date(val.seconds * 1000).toISOString();
  }
  if (val instanceof Date) return val.toISOString();
  return new Date().toISOString();
};

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
  stories: StoryItem[];

  // Stories / Status Actions
  createStory: (storyData: {
    imageUrl?: string;
    text?: string;
    backgroundColor?: string;
    textColor?: string;
  }) => Promise<{ success: boolean; id?: string; error?: string }>;
  viewStory: (storyId: string) => Promise<void>;
  reactToStory: (storyId: string, emoji: string) => Promise<void>;
  deleteStory: (storyId: string) => Promise<void>;

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
    technicianId?: string;
    userName: string;
    userRole: any;
    userPhone?: string;
    phoneNumber?: string;
    planId: string;
    planName: string;
    amountMZN: number;
    method: PaymentMethod;
    transactionCode: string;
    transactionReference?: string;
    receiptUrl?: string;
    proofUrl?: string;
    message?: string;
    status?: PaymentStatus;
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
  toggleMarketItemLike: (itemId: string) => void;
  addMarketItemComment: (itemId: string, text: string, replyToId?: string, replyToName?: string) => void;
  toggleMarketCommentLike: (itemId: string, commentId: string) => void;
  deleteMarketItemComment: (itemId: string, commentId: string) => void;

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
  addPostComment: (postId: string, text: string, replyToId?: string, replyToName?: string) => Promise<{ success: boolean; error?: string }>;
  toggleCommunityCommentLike: (postId: string, commentId: string) => void;
  deleteCommunityComment: (postId: string, commentId: string) => void;
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
  sendAdminNotification: (
    target: 'all' | 'client' | 'technician' | 'company' | string,
    title: string,
    message: string,
    type?: 'info' | 'success' | 'warning' | 'alert',
    linkTab?: string
  ) => Promise<{ success: boolean; error?: string }>;

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
    return safeGetStorageItem<TechnicianProfile[]>('tecnicamz_technicians', []);
  });

  const [companies, setCompanies] = useState<CompanyProfile[]>(() => {
    return safeGetStorageItem<CompanyProfile[]>('tecnicamz_companies', []);
  });

  const [jobs, setJobs] = useState<JobOpening[]>(() => {
    return safeGetStorageItem<JobOpening[]>('tecnicamz_jobs', []);
  });

  const [applications, setApplications] = useState<JobApplication[]>(() => {
    return safeGetStorageItem<JobApplication[]>('tecnicamz_job_applications', []);
  });

  const [plans, setPlans] = useState<SubscriptionPlan[]>(() => {
    return safeGetStorageItem<SubscriptionPlan[]>('tecnicamz_plans', INITIAL_PLANS);
  });

  const [payments, setPayments] = useState<PaymentRecord[]>(() => {
    return safeGetStorageItem<PaymentRecord[]>('tecnicamz_payments', []);
  });

  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>(() => {
    return safeGetStorageItem<ServiceRequest[]>('tecnicamz_requests', []);
  });

  const [proposals, setProposals] = useState<Proposal[]>(() => {
    return safeGetStorageItem<Proposal[]>('tecnicamz_proposals', []);
  });

  const [reviews, setReviews] = useState<Review[]>(() => {
    return safeGetStorageItem<Review[]>('tecnicamz_reviews', []);
  });

  const [portfolio, setPortfolio] = useState<PortfolioItem[]>(() => {
    return safeGetStorageItem<PortfolioItem[]>('tecnicamz_portfolio', []);
  });

  const [marketItems, setMarketItems] = useState<MarketItem[]>(() => {
    return safeGetStorageItem<MarketItem[]>('tecnicamz_market', []);
  });

  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>(() => {
    return safeGetStorageItem<CommunityPost[]>('tecnicamz_community_posts', []);
  });

  const [academyArticles, setAcademyArticles] = useState<AcademyArticle[]>(() => {
    return safeGetStorageItem<AcademyArticle[]>('tecnicamz_academy', INITIAL_ACADEMY_ARTICLES);
  });

  const [conversations, setConversations] = useState<ConversationItem[]>(() => {
    return safeGetStorageItem<ConversationItem[]>('tecnicamz_conversations', []);
  });

  const [messages, setMessages] = useState<MessageItem[]>(() => {
    return safeGetStorageItem<MessageItem[]>('tecnicamz_messages', []);
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    return safeGetStorageItem<NotificationItem[]>('tecnicamz_notifications', []);
  });

  const [reports, setReports] = useState<ReportItem[]>(() => {
    return safeGetStorageItem<ReportItem[]>('tecnicamz_reports', []);
  });

  const [adminLogs, setAdminLogs] = useState<AdminLogItem[]>(() => {
    return safeGetStorageItem<AdminLogItem[]>('tecnicamz_admin_logs', []);
  });

  const [settings, setSettings] = useState<PlatformSettings>(() => {
    return safeGetStorageItem<PlatformSettings>('tecnicamz_settings', INITIAL_SETTINGS);
  });

  const [favorites, setFavorites] = useState<string[]>(() => {
    return safeGetStorageItem<string[]>('tecnicamz_favorites', []);
  });

  const [budgetEstimates, setBudgetEstimates] = useState<BudgetEstimate[]>(() => {
    return safeGetStorageItem<BudgetEstimate[]>('tecnicamz_budget_estimates', []);
  });

  const [stories, setStories] = useState<StoryItem[]>(() => {
    const rawStories = safeGetStorageItem<StoryItem[]>('tecnicamz_stories', []);
    const now = Date.now();
    return rawStories.filter((s: StoryItem) => !s.expiresAt || new Date(s.expiresAt).getTime() > now);
  });

  // Real-time Firestore Listeners
  useEffect(() => {
    if (!isFirebaseConfigured || !db) return;

    // 1. Stories / Histórias (Status 24h) real-time sync
    const storiesMap = new Map<string, StoryItem>();
    const updateMergedStories = () => {
      const now = Date.now();
      const list = Array.from(storiesMap.values())
        .filter(s => !s.expiresAt || new Date(s.expiresAt).getTime() > now);
      list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      setStories(list);
    };

    const mapStoryDoc = (docSnap: any): StoryItem => {
      const data = docSnap.data() || {};
      const createdAtIso = formatTimestampToIso(data.createdAt || data.data);
      const nowTime = new Date(createdAtIso).getTime();
      const expiresAtIso = data.expiresAt || new Date(nowTime + 24 * 60 * 60 * 1000).toISOString();
      const deleteAtIso = data.deleteAt || new Date(nowTime + 7 * 24 * 60 * 60 * 1000).toISOString();

      const visualizadores = Array.isArray(data.visualizadores) ? data.visualizadores : [];
      const viewers = Array.isArray(data.viewers) ? data.viewers : [];
      const viewsCount = typeof data.viewsCount === 'number'
        ? Math.max(data.viewsCount, visualizadores.length, viewers.length)
        : Math.max(visualizadores.length, viewers.length);

      return {
        id: docSnap.id,
        authorId: data.authorId || data.autorId || data.userId || '',
        authorName: data.authorName || data.autor || data.autorNome || 'Técnico MZ',
        authorRole: data.authorRole || data.autorTipo || 'technician',
        authorAvatar: data.authorAvatar || data.autorFoto || data.foto || data.avatarUrl || '',
        authorSpecialty: data.authorSpecialty || data.especialidade || (data.authorRole === 'company' ? 'Empresa Registada' : 'Técnico Especialista'),
        authorProvince: data.authorProvince || data.provincia || 'Maputo',
        authorWhatsapp: data.authorWhatsapp || data.whatsapp || data.phone || '',
        authorPhone: data.authorPhone || data.telefone || data.phone || '',
        imageUrl: data.imageUrl || data.imagem || data.foto || undefined,
        text: data.text || data.texto || data.conteudo || '',
        backgroundColor: data.backgroundColor || 'from-slate-900 via-blue-950 to-indigo-950',
        textColor: data.textColor || '#ffffff',
        viewsCount,
        viewers,
        visualizadores,
        reactions: Array.isArray(data.reactions) ? data.reactions : (Array.isArray(data.likes) ? data.likes : []),
        createdAt: createdAtIso,
        expiresAt: expiresAtIso,
        deleteAt: deleteAtIso
      };
    };

    const unsubHistorias = onSnapshot(
      collection(db, 'historias'),
      (snapshot) => {
        snapshot.forEach((docSnap) => {
          storiesMap.set(docSnap.id, mapStoryDoc(docSnap));
        });
        updateMergedStories();
      },
      (err) => console.warn('Realtime historias notice:', err)
    );

    const unsubStories = onSnapshot(
      collection(db, 'stories'),
      (snapshot) => {
        snapshot.forEach((docSnap) => {
          if (!storiesMap.has(docSnap.id)) {
            storiesMap.set(docSnap.id, mapStoryDoc(docSnap));
          }
        });
        updateMergedStories();
      },
      (err) => console.warn('Realtime stories notice:', err)
    );

    // 2. Mural / Community Posts real-time sync & subcollection comments
    const postsMap = new Map<string, CommunityPost>();
    const commentUnsubs = new Map<string, () => void>();

    const updateMergedPosts = () => {
      const posts = Array.from(postsMap.values());
      posts.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      setCommunityPosts(posts);
    };

    const subscribePostComments = (postId: string) => {
      if (!postId || commentUnsubs.has(postId)) return;
      try {
        const unsub = onSnapshot(
          collection(db, 'mural_posts', postId, 'comentarios'),
          (commSnap) => {
            if (!commSnap.empty) {
              const loadedComments: CommunityComment[] = [];
              commSnap.forEach((cDoc) => {
                const cData = cDoc.data() || {};
                loadedComments.push({
                  id: cDoc.id,
                  postId,
                  authorId: cData.autorId || cData.authorId || '',
                  authorName: cData.autorNome || cData.authorName || 'Técnico MZ',
                  authorRole: cData.authorRole || cData.autorTipo || 'technician',
                  authorAvatar: cData.autorFoto || cData.authorAvatar || cData.authorPhoto || '',
                  authorSpecialty: cData.authorSpecialty || cData.especialidade || '',
                  text: cData.texto || cData.text || '',
                  replyToId: cData.replyToId || undefined,
                  replyToName: cData.replyToName || undefined,
                  likes: Array.isArray(cData.likes) ? cData.likes : [],
                  createdAt: formatTimestampToIso(cData.criadoEm || cData.createdAt || cData.createdAtIso)
                });
              });
              loadedComments.sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());

              // Update post map and state
              const existing = postsMap.get(postId);
              if (existing) {
                const mergedPost = {
                  ...existing,
                  comments: loadedComments,
                  commentsCount: Math.max(loadedComments.length, existing.commentsCount || 0)
                };
                postsMap.set(postId, mergedPost);
                updateMergedPosts();
              }
            }
          },
          (err) => console.warn(`Subcollection comments notice for ${postId}:`, err)
        );
        commentUnsubs.set(postId, unsub);
      } catch (err) {
        console.warn('Error subscribing to post comments:', err);
      }
    };

    const mapPostDoc = (docSnap: any): CommunityPost => {
      const data = docSnap.data() || {};
      const rawLikes = Array.isArray(data.likes) ? data.likes : (Array.isArray(data.curtidas) ? data.curtidas : []);
      const rawReactions = data.reactions || {};
      const usefulLikes = Array.isArray(rawReactions.useful) && rawReactions.useful.length > 0 ? rawReactions.useful : rawLikes;

      return {
        id: docSnap.id,
        authorId: data.authorId || data.autorId || data.userId || '',
        authorName: data.authorName || data.autor || data.autorNome || data.name || 'Técnico MZ',
        authorRole: data.authorRole || data.autorTipo || 'technician',
        authorAvatar: data.authorAvatar || data.autorFoto || data.foto || data.avatarUrl || '',
        authorSpecialty: data.authorSpecialty || data.especialidade || (data.authorRole === 'company' ? 'Empresa' : 'Técnico Especialista'),
        authorProvince: data.authorProvince || data.provincia || 'Maputo',
        authorWhatsapp: data.authorWhatsapp || data.whatsapp || data.phone || '',
        title: data.title || data.titulo || 'Publicação no Mural',
        content: data.content || data.conteudo || data.texto || '',
        category: data.category || data.categoria || 'Geral',
        tags: Array.isArray(data.tags) ? data.tags : [],
        images: Array.isArray(data.images) && data.images.length > 0
          ? data.images
          : (data.foto ? [data.foto] : (data.imageUrl ? [data.imageUrl] : (data.imagem ? [data.imagem] : []))),
        reactions: {
          useful: usefulLikes,
          insightful: Array.isArray(rawReactions.insightful) ? rawReactions.insightful : [],
          applause: Array.isArray(rawReactions.applause) ? rawReactions.applause : [],
          question: Array.isArray(rawReactions.question) ? rawReactions.question : []
        },
        commentsCount: typeof data.commentsCount === 'number' ? data.commentsCount : (Array.isArray(data.comments) ? data.comments.length : 0),
        comments: Array.isArray(data.comments) ? data.comments : [],
        pinned: Boolean(data.pinned),
        createdAt: formatTimestampToIso(data.createdAt || data.data || data.dataEnvio || data.createdAtIso)
      };
    };

    const unsubMuralPosts = onSnapshot(
      collection(db, 'mural_posts'),
      (snapshot) => {
        snapshot.forEach((docSnap) => {
          postsMap.set(docSnap.id, mapPostDoc(docSnap));
          subscribePostComments(docSnap.id);
        });
        updateMergedPosts();
      },
      (err) => console.warn('Realtime mural_posts notice:', err)
    );

    const unsubCommunityPosts = onSnapshot(
      collection(db, 'community_posts'),
      (snapshot) => {
        snapshot.forEach((docSnap) => {
          if (!postsMap.has(docSnap.id)) {
            postsMap.set(docSnap.id, mapPostDoc(docSnap));
          }
          subscribePostComments(docSnap.id);
        });
        updateMergedPosts();
      },
      (err) => console.warn('Realtime community_posts notice:', err)
    );

    const unsubMarket = onSnapshot(
      collection(db, 'market_items'),
      (snapshot) => {
        const items: MarketItem[] = [];
        snapshot.forEach((docSnap) => {
          items.push({ ...docSnap.data(), id: docSnap.id } as MarketItem);
        });
        items.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        setMarketItems(items);
      },
      (err) => console.warn('Realtime market_items notice:', err)
    );

    const unsubConversations = onSnapshot(
      collection(db, 'conversations'),
      (snapshot) => {
        const list: ConversationItem[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ ...docSnap.data(), id: docSnap.id } as ConversationItem);
        });
        list.sort((a, b) => new Date(b.lastMessageAt || 0).getTime() - new Date(a.lastMessageAt || 0).getTime());
        setConversations(list);
      },
      (err) => console.warn('Realtime conversations notice:', err)
    );

    const unsubMessages = onSnapshot(
      collection(db, 'messages'),
      (snapshot) => {
        const list: MessageItem[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ ...docSnap.data(), id: docSnap.id } as MessageItem);
        });
        list.sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
        setMessages(list);
      },
      (err) => console.warn('Realtime messages notice:', err)
    );

    // 3. Technicians & Usuários real-time sync for "Técnicos MZ"
    const techsMap = new Map<string, TechnicianProfile>();
    const updateMergedTechs = () => {
      const list = Array.from(techsMap.values());
      // Sort strictly descending based on total engagement (totalLikes / scoreEngajamento / pontos / curtidas)
      list.sort((a, b) => {
        const likesA = (a.totalLikes ?? (a as any).curtidas ?? (a as any).pontos ?? 0);
        const likesB = (b.totalLikes ?? (b as any).curtidas ?? (b as any).pontos ?? 0);
        if (likesB !== likesA) return likesB - likesA;
        const scoreA = (a.scoreEngajamento ?? (a as any).pontos ?? 0);
        const scoreB = (b.scoreEngajamento ?? (b as any).pontos ?? 0);
        if (scoreB !== scoreA) return scoreB - scoreA;
        return (b.rating ?? 5) - (a.rating ?? 5);
      });
      setTechnicians(list);
    };

    const mapTechDoc = (docSnap: any): TechnicianProfile | null => {
      const data = docSnap.data() || {};
      const role = String(data.role || data.tipoConta || '').toLowerCase().trim();
      const isTech = role === 'technician' || role === 'tecnico' || data.tipoConta === 'tecnico' || data.role === 'technician' || !role;

      if (!isTech && role && role !== 'admin' && role !== 'super_admin') {
        return null;
      }

      const defaultName = data.name || data.nome || 'Técnico Especialista';
      const cleanPhone = data.phone || data.telefone || '';
      const cleanWhatsapp = data.whatsapp || cleanPhone || '';
      const specialties = Array.isArray(data.specialties) && data.specialties.length > 0
        ? data.specialties
        : (data.specialty ? [data.specialty] : (data.especialidade ? [data.especialidade] : ['Eletricidade']));

      const totalLikes = typeof data.totalLikes === 'number'
        ? data.totalLikes
        : (typeof data.curtidas === 'number'
          ? data.curtidas
          : (typeof data.likes === 'number'
            ? data.likes
            : (typeof data.pontos === 'number' ? data.pontos : 0)));

      const scoreEngajamento = typeof data.scoreEngajamento === 'number'
        ? data.scoreEngajamento
        : (typeof data.pontos === 'number'
          ? data.pontos
          : totalLikes);

      return {
        userId: docSnap.id,
        name: defaultName,
        email: data.email || '',
        phone: cleanPhone,
        whatsapp: cleanWhatsapp,
        showWhatsappButton: data.showWhatsappButton ?? true,
        customWhatsappMessage: data.customWhatsappMessage || `Olá ${defaultName}, vi seu perfil na TécnicaMZ e gostaria de solicitar um orçamento.`,
        province: data.province || data.provincia || 'Maputo Cidade',
        city: data.city || data.cidade || 'Maputo',
        district: data.district || data.distrito,
        specialties: specialties,
        bio: data.bio || `Profissional qualificado em ${specialties.join(', ')} em Moçambique.`,
        experienceYears: typeof data.experienceYears === 'number' ? data.experienceYears : 2,
        avatarUrl: data.avatarUrl || data.photoURL || data.foto || '',
        photoURL: data.photoURL || data.avatarUrl || data.foto || '',
        totalLikes,
        scoreEngajamento,
        verificationStatus: data.verificationStatus || (data.isVerified ? 'approved' : 'none'),
        statusAprovacao: data.statusAprovacao || 'aprovado',
        statusConta: data.statusConta || 'ativa',
        status: data.status || 'active',
        isVerified: Boolean(data.isVerified || data.verificationStatus === 'approved'),
        subscriptionStatus: data.subscriptionStatus || 'none',
        activePlanId: data.activePlanId,
        subscriptionExpiresAt: data.subscriptionExpiresAt || data.dataExpiracao,
        rating: typeof data.rating === 'number' ? data.rating : 5.0,
        reviewsCount: typeof data.reviewsCount === 'number' ? data.reviewsCount : 0,
        completedJobsCount: typeof data.completedJobsCount === 'number' ? data.completedJobsCount : 0,
        availability: data.availability || 'available',
        featured: Boolean(data.featured),
        idade: data.idade ? Number(data.idade) : undefined,
        createdAt: formatTimestampToIso(data.createdAt || data.dataCadastro || data.dataCriacao)
      };
    };

    const unsubTechs = onSnapshot(
      collection(db, 'technicians'),
      (snapshot) => {
        snapshot.forEach((docSnap) => {
          const tech = mapTechDoc(docSnap);
          if (tech) techsMap.set(docSnap.id, tech);
        });
        updateMergedTechs();
      },
      (err) => console.warn('Realtime technicians notice:', err)
    );

    const unsubUsuarios = onSnapshot(
      collection(db, 'usuarios'),
      (snapshot) => {
        snapshot.forEach((docSnap) => {
          const tech = mapTechDoc(docSnap);
          if (tech) {
            const existing = techsMap.get(docSnap.id);
            techsMap.set(docSnap.id, existing ? { ...existing, ...tech } : tech);
          }
        });
        updateMergedTechs();
      },
      (err) => console.warn('Realtime usuarios notice:', err)
    );

    const unsubUsers = onSnapshot(
      collection(db, 'users'),
      (snapshot) => {
        snapshot.forEach((docSnap) => {
          const tech = mapTechDoc(docSnap);
          if (tech) {
            const existing = techsMap.get(docSnap.id);
            techsMap.set(docSnap.id, existing ? { ...existing, ...tech } : tech);
          }
        });
        updateMergedTechs();
      },
      (err) => console.warn('Realtime users notice:', err)
    );

    const unsubComps = onSnapshot(
      collection(db, 'companies'),
      (snapshot) => {
        const list: CompanyProfile[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ ...docSnap.data(), userId: docSnap.id } as CompanyProfile);
        });
        setCompanies(list);
      },
      (err) => console.warn('Realtime companies notice:', err)
    );

    const unsubJobs = onSnapshot(
      collection(db, 'jobs'),
      (snapshot) => {
        const list: JobOpening[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ ...docSnap.data(), id: docSnap.id } as JobOpening);
        });
        setJobs(list);
      },
      (err) => console.warn('Realtime jobs notice:', err)
    );

    const unsubRequests = onSnapshot(
      collection(db, 'serviceRequests'),
      (snapshot) => {
        const list: ServiceRequest[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ ...docSnap.data(), id: docSnap.id } as ServiceRequest);
        });
        setServiceRequests(list);
      },
      (err) => console.warn('Realtime serviceRequests notice:', err)
    );

    const unsubProposals = onSnapshot(
      collection(db, 'proposals'),
      (snapshot) => {
        const list: Proposal[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ ...docSnap.data(), id: docSnap.id } as Proposal);
        });
        setProposals(list);
      },
      (err) => console.warn('Realtime proposals notice:', err)
    );

    const unsubReviews = onSnapshot(
      collection(db, 'reviews'),
      (snapshot) => {
        const list: Review[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ ...docSnap.data(), id: docSnap.id } as Review);
        });
        setReviews(list);
      },
      (err) => console.warn('Realtime reviews notice:', err)
    );

    const unsubPayments = onSnapshot(
      collection(db, 'payments'),
      (snapshot) => {
        const list: PaymentRecord[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ ...docSnap.data(), id: docSnap.id } as PaymentRecord);
        });
        setPayments(list);
      },
      (err) => console.warn('Realtime payments notice:', err)
    );

    const unsubNotifications = onSnapshot(
      collection(db, 'notifications'),
      (snapshot) => {
        const list: NotificationItem[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ ...docSnap.data(), id: docSnap.id } as NotificationItem);
        });
        list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        setNotifications(list);
      },
      (err) => console.warn('Realtime notifications notice:', err)
    );

    return () => {
      unsubHistorias();
      unsubStories();
      unsubMuralPosts();
      unsubCommunityPosts();
      commentUnsubs.forEach(u => u());
      unsubMarket();
      unsubConversations();
      unsubMessages();
      unsubTechs();
      unsubUsuarios();
      unsubUsers();
      unsubComps();
      unsubJobs();
      unsubRequests();
      unsubProposals();
      unsubReviews();
      unsubPayments();
      unsubNotifications();
    };
  }, []);

  // Sync to localStorage
  useEffect(() => {
    safeSetStorageItem('tecnicamz_stories', stories);
  }, [stories]);

  useEffect(() => {
    safeSetStorageItem('tecnicamz_technicians', technicians);
  }, [technicians]);

  useEffect(() => {
    safeSetStorageItem('tecnicamz_companies', companies);
  }, [companies]);

  useEffect(() => {
    safeSetStorageItem('tecnicamz_jobs', jobs);
  }, [jobs]);

  useEffect(() => {
    safeSetStorageItem('tecnicamz_job_applications', applications);
  }, [applications]);

  useEffect(() => {
    safeSetStorageItem('tecnicamz_plans', plans);
  }, [plans]);

  useEffect(() => {
    safeSetStorageItem('tecnicamz_payments', payments);
  }, [payments]);

  useEffect(() => {
    safeSetStorageItem('tecnicamz_requests', serviceRequests);
  }, [serviceRequests]);

  useEffect(() => {
    safeSetStorageItem('tecnicamz_proposals', proposals);
  }, [proposals]);

  useEffect(() => {
    safeSetStorageItem('tecnicamz_reviews', reviews);
  }, [reviews]);

  useEffect(() => {
    safeSetStorageItem('tecnicamz_portfolio', portfolio);
  }, [portfolio]);

  useEffect(() => {
    safeSetStorageItem('tecnicamz_market', marketItems);
  }, [marketItems]);

  useEffect(() => {
    safeSetStorageItem('tecnicamz_community_posts', communityPosts);
  }, [communityPosts]);

  useEffect(() => {
    safeSetStorageItem('tecnicamz_academy', academyArticles);
  }, [academyArticles]);

  useEffect(() => {
    safeSetStorageItem('tecnicamz_conversations', conversations);
  }, [conversations]);

  useEffect(() => {
    safeSetStorageItem('tecnicamz_messages', messages);
  }, [messages]);

  useEffect(() => {
    safeSetStorageItem('tecnicamz_notifications', notifications);
  }, [notifications]);

  useEffect(() => {
    safeSetStorageItem('tecnicamz_reports', reports);
  }, [reports]);

  useEffect(() => {
    safeSetStorageItem('tecnicamz_admin_logs', adminLogs);
  }, [adminLogs]);

  useEffect(() => {
    safeSetStorageItem('tecnicamz_settings', settings);
  }, [settings]);

  useEffect(() => {
    safeSetStorageItem('tecnicamz_favorites', favorites);
  }, [favorites]);

  useEffect(() => {
    safeSetStorageItem('tecnicamz_budget_estimates', budgetEstimates);
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
    technicianId?: string;
    userName: string;
    userRole: any;
    userPhone?: string;
    phoneNumber?: string;
    planId: string;
    planName: string;
    amountMZN: number;
    method: PaymentMethod;
    transactionCode: string;
    transactionReference?: string;
    receiptUrl?: string;
    proofUrl?: string;
    message?: string;
    status?: PaymentStatus;
  }): Promise<{ success: boolean; paymentId?: string; error?: string }> => {
    try {
      const paymentId = `pay_${Date.now()}`;
      const newPayment: PaymentRecord = {
        id: paymentId,
        ...data,
        status: data.status || 'pending',
        submittedAt: new Date().toISOString()
      };

      setPayments(prev => [newPayment, ...prev]);

      // Save to Firestore collections 'pagamentos' and 'payments'
      if (isFirebaseConfigured && db) {
        try {
          await setDoc(doc(db, 'pagamentos', paymentId), newPayment);
          await setDoc(doc(db, 'payments', paymentId), newPayment);
        } catch (dbErr) {
          console.warn('Firestore payment record save notice:', dbErr);
        }
      }

      // Notify Admins
      createNotification(
        'admin_owner',
        'Novo Pagamento Registado',
        `${data.userName} efetuou pagamento de ${data.amountMZN} MZN (${data.method.toUpperCase()}) para ${data.planName}.`,
        'success',
        'admin',
        'payments'
      );

      createNotification(
        data.userId,
        'Pagamento Confirmado',
        `O seu pagamento de ${data.amountMZN} MZN para o plano ${data.planName} foi processado com sucesso.`,
        'success',
        data.userRole === 'technician' ? 'technician' : 'company',
        'payments'
      );

      return { success: true, paymentId };
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
  const addMarketItem = async (itemData: Omit<MarketItem, 'id' | 'createdAt' | 'status'>) => {
    const newItem: MarketItem = {
      ...itemData,
      id: `market_${Date.now()}`,
      status: 'active',
      createdAt: new Date().toISOString()
    };
    setMarketItems(prev => [newItem, ...prev]);

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'market_items', newItem.id), newItem);
      } catch (err) {
        console.warn('Firestore add market item error:', err);
      }
    }
  };

  const updateMarketItemStatus = async (itemId: string, status: MarketItem['status']) => {
    setMarketItems(prev => prev.map(m => (m.id === itemId ? { ...m, status } : m)));

    if (isFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, 'market_items', itemId), { status });
      } catch (err) {
        console.warn('Firestore update market item status error:', err);
      }
    }
  };

  const deleteMarketItem = async (itemId: string) => {
    setMarketItems(prev => prev.filter(m => m.id !== itemId));

    if (isFirebaseConfigured && db) {
      try {
        await deleteDoc(doc(db, 'market_items', itemId));
      } catch (err) {
        console.warn('Firestore delete market item error:', err);
      }
    }
  };

  const editMarketItem = async (itemId: string, data: Partial<MarketItem>) => {
    setMarketItems(prev => prev.map(m => (m.id === itemId ? { ...m, ...data } : m)));

    if (isFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, 'market_items', itemId), data);
      } catch (err) {
        console.warn('Firestore edit market item error:', err);
      }
    }
  };

  const toggleMarketItemLike = async (itemId: string) => {
    if (!currentUser) return;
    const userId = currentUser.uid;

    let updatedItem: MarketItem | undefined;
    let sellerIdToUpdate: string | undefined;
    let isLikeAdded = false;

    setMarketItems(prev =>
      prev.map(item => {
        if (item.id !== itemId) return item;
        sellerIdToUpdate = item.sellerId;
        const currentLikes = item.likes || [];
        const hasLiked = currentLikes.includes(userId);
        isLikeAdded = !hasLiked;
        const updatedLikes = hasLiked
          ? currentLikes.filter(id => id !== userId)
          : [...currentLikes, userId];

        const itemUpdated = {
          ...item,
          likes: updatedLikes
        };
        updatedItem = itemUpdated;
        return itemUpdated;
      })
    );

    if (isFirebaseConfigured && db && updatedItem) {
      try {
        await setDoc(doc(db, 'market_items', itemId), updatedItem, { merge: true });

        // Update seller's score & totalLikes if seller is a technician
        if (sellerIdToUpdate && sellerIdToUpdate !== userId) {
          const delta = isLikeAdded ? 1 : -1;
          const targetTech = technicians.find(t => t.userId === sellerIdToUpdate);
          const currentLikes = targetTech?.totalLikes || 0;
          const newLikes = Math.max(0, currentLikes + delta);
          const newScore = Math.max(0, (targetTech?.scoreEngajamento || 0) + delta);

          setTechnicians(prev => prev.map(t => t.userId === sellerIdToUpdate ? { ...t, totalLikes: newLikes, scoreEngajamento: newScore } : t));
          await updateDoc(doc(db, 'technicians', sellerIdToUpdate), {
            totalLikes: newLikes,
            scoreEngajamento: newScore,
            updatedAt: new Date().toISOString()
          }).catch(() => {});
          await updateDoc(doc(db, 'users', sellerIdToUpdate), {
            totalLikes: newLikes,
            scoreEngajamento: newScore,
            updatedAt: new Date().toISOString()
          }).catch(() => {});
        }
      } catch (err) {
        console.warn('Firestore update market item like error:', err);
      }
    }
  };

  const addMarketItemComment = async (
    itemId: string,
    text: string,
    replyToId?: string,
    replyToName?: string
  ) => {
    if (!currentUser || !text.trim()) return;

    const techProfile = technicians.find(t => t.userId === currentUser.uid);

    const newComment: MarketComment = {
      id: `mcomm_${Date.now()}`,
      itemId,
      authorId: currentUser.uid,
      authorName: currentUser.name,
      authorRole: currentUser.role,
      authorAvatar: currentUser.avatarUrl,
      authorSpecialty: techProfile?.specialties[0],
      text: text.trim(),
      replyToId,
      replyToName,
      likes: [],
      createdAt: new Date().toISOString()
    };

    let updatedItem: MarketItem | undefined;

    setMarketItems(prev =>
      prev.map(item => {
        if (item.id !== itemId) return item;
        const existingComments = item.comments || [];
        const itemUpdated = {
          ...item,
          commentsCount: (item.commentsCount || existingComments.length) + 1,
          comments: [...existingComments, newComment]
        };
        updatedItem = itemUpdated;
        return itemUpdated;
      })
    );

    if (isFirebaseConfigured && db && updatedItem) {
      try {
        await setDoc(doc(db, 'market_items', itemId), updatedItem, { merge: true });
      } catch (err) {
        console.warn('Firestore add market comment error:', err);
      }
    }
  };

  const toggleMarketCommentLike = async (itemId: string, commentId: string) => {
    if (!currentUser) return;
    const userId = currentUser.uid;

    let updatedItem: MarketItem | undefined;

    setMarketItems(prev =>
      prev.map(item => {
        if (item.id !== itemId) return item;
        const comments = (item.comments || []).map(comm => {
          if (comm.id !== commentId) return comm;
          const currentLikes = comm.likes || [];
          const hasLiked = currentLikes.includes(userId);
          const updatedLikes = hasLiked
            ? currentLikes.filter(id => id !== userId)
            : [...currentLikes, userId];
          return { ...comm, likes: updatedLikes };
        });

        const itemUpdated = {
          ...item,
          comments
        };
        updatedItem = itemUpdated;
        return itemUpdated;
      })
    );

    if (isFirebaseConfigured && db && updatedItem) {
      try {
        await setDoc(doc(db, 'market_items', itemId), updatedItem, { merge: true });
      } catch (err) {
        console.warn('Firestore toggle market comment like error:', err);
      }
    }
  };

  const deleteMarketItemComment = async (itemId: string, commentId: string) => {
    let updatedItem: MarketItem | undefined;

    setMarketItems(prev =>
      prev.map(item => {
        if (item.id !== itemId) return item;
        const filteredComments = (item.comments || []).filter(c => c.id !== commentId);
        const itemUpdated = {
          ...item,
          commentsCount: Math.max(0, filteredComments.length),
          comments: filteredComments
        };
        updatedItem = itemUpdated;
        return itemUpdated;
      })
    );

    if (isFirebaseConfigured && db && updatedItem) {
      try {
        await setDoc(doc(db, 'market_items', itemId), updatedItem, { merge: true });
      } catch (err) {
        console.warn('Firestore delete market comment error:', err);
      }
    }
  };

  // Technical Community Feed
  const addCommunityPost = async (postData: {
    title: string;
    content: string;
    category: string;
    tags?: string[];
    images?: string[];
  }) => {
    if (!currentUser) return;

    // Find if user is technician with specialty
    const techProfile = technicians.find(t => t.userId === currentUser.uid);
    const compProfile = companies.find(c => c.userId === currentUser.uid);

    const newPostId = `post_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const isoNow = new Date().toISOString();

    const newPost: CommunityPost = {
      id: newPostId,
      authorId: currentUser.uid,
      authorName: currentUser.name,
      authorRole: currentUser.role,
      authorAvatar: currentUser.avatarUrl || techProfile?.avatarUrl || compProfile?.logoUrl || '',
      authorSpecialty: techProfile?.specialties?.[0] || (currentUser.role === 'company' ? 'Empresa / Indústria' : 'TécnicaMZ Profissional'),
      authorProvince: techProfile?.province || currentUser.province || 'Maputo',
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
      createdAt: isoNow
    };

    setCommunityPosts(prev => [newPost, ...prev]);

    if (isFirebaseConfigured && db) {
      try {
        const firestoreData = {
          ...newPost,
          autorId: currentUser.uid,
          autor: currentUser.name,
          autorNome: currentUser.name,
          autorTipo: currentUser.role,
          autorFoto: currentUser.avatarUrl || techProfile?.avatarUrl || '',
          foto: postData.images?.[0] || '',
          titulo: postData.title.trim(),
          conteudo: postData.content.trim(),
          categoria: postData.category,
          likes: [],
          curtidas: [],
          data: serverTimestamp(),
          createdAt: serverTimestamp(),
          createdAtIso: isoNow
        };

        // Salvar diretamente na coleção mural_posts
        await setDoc(doc(db, 'mural_posts', newPost.id), firestoreData);
        // Também salvar na coleção community_posts para máxima retrocompatibilidade
        await setDoc(doc(db, 'community_posts', newPost.id), firestoreData);
      } catch (err) {
        console.warn('Firestore add community post error:', err);
      }
    }
  };

  const togglePostReaction = async (postId: string, reactionType: 'useful' | 'insightful' | 'applause' | 'question') => {
    if (!currentUser) return;
    const userId = currentUser.uid;

    let updatedPost: CommunityPost | undefined;
    let authorIdToUpdate: string | undefined;
    let isReactionAdded = false;

    setCommunityPosts(prev =>
      prev.map(p => {
        if (p.id !== postId) return p;
        authorIdToUpdate = p.authorId;

        const currentList = p.reactions[reactionType] || [];
        const hasReacted = currentList.includes(userId);
        isReactionAdded = !hasReacted;
        const updatedList = hasReacted
          ? currentList.filter(id => id !== userId)
          : [...currentList, userId];

        const postUpdated = {
          ...p,
          reactions: {
            ...p.reactions,
            [reactionType]: updatedList
          }
        };
        updatedPost = postUpdated;
        return postUpdated;
      })
    );

    if (isFirebaseConfigured && db && updatedPost) {
      try {
        const usefulLikes = (updatedPost as CommunityPost).reactions?.useful || [];
        const payloadToUpdate = {
          ...updatedPost,
          likes: usefulLikes,
          curtidas: usefulLikes,
          updatedAt: new Date().toISOString()
        };

        await setDoc(doc(db, 'mural_posts', postId), payloadToUpdate, { merge: true }).catch(() => {});
        await setDoc(doc(db, 'community_posts', postId), payloadToUpdate, { merge: true }).catch(() => {});

        // Update post author's score & totalLikes if author is a technician
        if (authorIdToUpdate && authorIdToUpdate !== userId) {
          const delta = isReactionAdded ? 1 : -1;
          const targetTech = technicians.find(t => t.userId === authorIdToUpdate);
          const currentLikes = targetTech?.totalLikes || 0;
          const newLikes = Math.max(0, currentLikes + delta);
          const newScore = Math.max(0, (targetTech?.scoreEngajamento || 0) + delta);

          setTechnicians(prev => prev.map(t => t.userId === authorIdToUpdate ? { ...t, totalLikes: newLikes, scoreEngajamento: newScore } : t));
          await updateDoc(doc(db, 'technicians', authorIdToUpdate), {
            totalLikes: newLikes,
            scoreEngajamento: newScore,
            updatedAt: new Date().toISOString()
          }).catch(() => {});
          await updateDoc(doc(db, 'usuarios', authorIdToUpdate), {
            totalLikes: newLikes,
            scoreEngajamento: newScore,
            updatedAt: new Date().toISOString()
          }).catch(() => {});
          await updateDoc(doc(db, 'users', authorIdToUpdate), {
            totalLikes: newLikes,
            scoreEngajamento: newScore,
            updatedAt: new Date().toISOString()
          }).catch(() => {});
        }
      } catch (err) {
        console.warn('Firestore update reaction error:', err);
      }
    }
  };

  const addPostComment = async (
    postId: string,
    text: string,
    replyToId?: string,
    replyToName?: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser || !text.trim()) {
      return { success: false, error: 'Texto do comentário não pode estar vazio.' };
    }

    const techProfile = technicians.find(t => t.userId === currentUser.uid);
    const commentId = `comm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const nowIso = new Date().toISOString();

    const newComment: CommunityComment = {
      id: commentId,
      postId,
      authorId: currentUser.uid,
      authorName: currentUser.name,
      authorRole: currentUser.role,
      authorAvatar: currentUser.avatarUrl || techProfile?.avatarUrl || '',
      authorSpecialty: techProfile?.specialties?.[0] || (currentUser.role === 'company' ? 'Empresa' : 'Técnico Especialista'),
      text: text.trim(),
      replyToId,
      replyToName,
      likes: [],
      createdAt: nowIso
    };

    let updatedPost: CommunityPost | undefined;

    setCommunityPosts(prev =>
      prev.map(p => {
        if (p.id !== postId) return p;
        const postUpdated = {
          ...p,
          commentsCount: (p.commentsCount || 0) + 1,
          comments: [...(p.comments || []), newComment]
        };
        updatedPost = postUpdated;
        return postUpdated;
      })
    );

    if (isFirebaseConfigured && db) {
      try {
        const commentFirestoreData = {
          id: commentId,
          postId,
          texto: text.trim(),
          text: text.trim(),
          autorId: currentUser.uid,
          authorId: currentUser.uid,
          autorNome: currentUser.name,
          authorName: currentUser.name,
          autorFoto: newComment.authorAvatar,
          authorAvatar: newComment.authorAvatar,
          authorPhoto: newComment.authorAvatar,
          authorRole: currentUser.role,
          authorSpecialty: newComment.authorSpecialty,
          replyToId: replyToId || null,
          replyToName: replyToName || null,
          likes: [],
          curtidas: 0,
          criadoEm: serverTimestamp(),
          createdAt: serverTimestamp(),
          createdAtIso: nowIso
        };

        // Salvar na subcoleção comentarios de mural_posts e community_posts
        await setDoc(doc(db, 'mural_posts', postId, 'comentarios', commentId), commentFirestoreData);
        await setDoc(doc(db, 'community_posts', postId, 'comentarios', commentId), commentFirestoreData).catch(() => {});

        // Atualizar documento pai
        if (updatedPost) {
          await setDoc(doc(db, 'mural_posts', postId), updatedPost, { merge: true }).catch(() => {});
          await setDoc(doc(db, 'community_posts', postId), updatedPost, { merge: true }).catch(() => {});
        }
      } catch (err: any) {
        console.warn('Firestore add comment error:', err);
        return { success: false, error: err?.message || 'Erro ao gravar comentário no banco de dados.' };
      }
    }

    return { success: true };
  };

  const toggleCommunityCommentLike = async (postId: string, commentId: string) => {
    if (!currentUser) return;
    const userId = currentUser.uid;

    let updatedPost: CommunityPost | undefined;

    setCommunityPosts(prev =>
      prev.map(p => {
        if (p.id !== postId) return p;
        const comments = p.comments.map(comm => {
          if (comm.id !== commentId) return comm;
          const currentLikes = comm.likes || [];
          const hasLiked = currentLikes.includes(userId);
          const updatedLikes = hasLiked
            ? currentLikes.filter(id => id !== userId)
            : [...currentLikes, userId];
          return { ...comm, likes: updatedLikes };
        });

        const postUpdated = {
          ...p,
          comments
        };
        updatedPost = postUpdated;
        return postUpdated;
      })
    );

    if (isFirebaseConfigured && db && updatedPost) {
      try {
        await setDoc(doc(db, 'mural_posts', postId), updatedPost, { merge: true }).catch(() => {});
        await setDoc(doc(db, 'community_posts', postId), updatedPost, { merge: true }).catch(() => {});
        // Atualizar também na subcoleção se existir
        const currentComm = updatedPost.comments.find(c => c.id === commentId);
        if (currentComm) {
          await updateDoc(doc(db, 'mural_posts', postId, 'comentarios', commentId), {
            likes: currentComm.likes,
            curtidas: currentComm.likes.length
          }).catch(() => {});
        }
      } catch (err) {
        console.warn('Firestore toggle comment like error:', err);
      }
    }
  };

  const deleteCommunityComment = async (postId: string, commentId: string) => {
    let updatedPost: CommunityPost | undefined;
    setCommunityPosts(prev =>
      prev.map(p => {
        if (p.id !== postId) return p;
        const comments = p.comments.filter(comm => comm.id !== commentId);
        const postUpdated = {
          ...p,
          commentsCount: Math.max(0, p.commentsCount - 1),
          comments
        };
        updatedPost = postUpdated;
        return postUpdated;
      })
    );

    if (isFirebaseConfigured && db) {
      try {
        await deleteDoc(doc(db, 'mural_posts', postId, 'comentarios', commentId)).catch(() => {});
        await deleteDoc(doc(db, 'community_posts', postId, 'comentarios', commentId)).catch(() => {});
        if (updatedPost) {
          await setDoc(doc(db, 'mural_posts', postId), updatedPost, { merge: true }).catch(() => {});
          await setDoc(doc(db, 'community_posts', postId), updatedPost, { merge: true }).catch(() => {});
        }
      } catch (err) {
        console.warn('Firestore delete comment error:', err);
      }
    }
  };

  const deleteCommunityPost = async (postId: string) => {
    setCommunityPosts(prev => prev.filter(p => p.id !== postId));

    if (isFirebaseConfigured && db) {
      try {
        await deleteDoc(doc(db, 'mural_posts', postId)).catch(() => {});
        await deleteDoc(doc(db, 'community_posts', postId)).catch(() => {});
      } catch (err) {
        console.warn('Firestore delete community post error:', err);
      }
    }
  };

  // Stories / Status (24h) System
  const createStory = async (storyData: {
    imageUrl?: string;
    text?: string;
    backgroundColor?: string;
    textColor?: string;
  }): Promise<{ success: boolean; id?: string; error?: string }> => {
    if (!currentUser) {
      return { success: false, error: 'Faça login para publicar uma história.' };
    }

    const techProfile = technicians.find(t => t.userId === currentUser.uid);
    const compProfile = companies.find(c => c.userId === currentUser.uid);

    const now = new Date();
    const expiresAtDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours
    const deleteAtDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
    const storyId = `historia_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const newStory: StoryItem = {
      id: storyId,
      authorId: currentUser.uid,
      authorName: currentUser.name,
      authorRole: currentUser.role,
      authorAvatar: currentUser.avatarUrl || techProfile?.avatarUrl || compProfile?.logoUrl,
      authorSpecialty: techProfile?.specialties?.[0] || (currentUser.role === 'company' ? 'Empresa Registada' : 'Técnico Especialista'),
      authorProvince: techProfile?.province || compProfile?.province || currentUser.province || 'Maputo',
      authorWhatsapp: techProfile?.whatsapp || compProfile?.whatsapp || currentUser.phone || '',
      authorPhone: techProfile?.phone || compProfile?.phone || currentUser.phone || '',
      imageUrl: storyData.imageUrl,
      text: storyData.text,
      backgroundColor: storyData.backgroundColor || 'from-slate-900 via-blue-950 to-indigo-950',
      textColor: storyData.textColor || '#ffffff',
      viewsCount: 0,
      viewers: [],
      reactions: [],
      createdAt: now.toISOString(),
      expiresAt: expiresAtDate.toISOString(),
      deleteAt: deleteAtDate.toISOString()
    };

    setStories(prev => [newStory, ...prev]);

    if (isFirebaseConfigured && db) {
      try {
        const firestoreStoryPayload: Record<string, any> = {
          id: storyId,
          authorId: currentUser.uid,
          authorName: currentUser.name,
          authorPhoto: newStory.authorAvatar || '',
          authorRole: currentUser.role,
          authorSpecialty: newStory.authorSpecialty,
          authorProvince: newStory.authorProvince,
          authorWhatsapp: newStory.authorWhatsapp,
          authorPhone: newStory.authorPhone,
          autorId: currentUser.uid,
          autor: currentUser.name,
          autorNome: currentUser.name,
          autorTipo: currentUser.role,
          autorFoto: newStory.authorAvatar || '',
          texto: storyData.text || '',
          text: storyData.text || '',
          conteudo: storyData.text || '',
          backgroundColor: newStory.backgroundColor,
          textColor: newStory.textColor,
          viewsCount: 0,
          viewers: [],
          reactions: [],
          data: serverTimestamp(),
          createdAt: serverTimestamp(),
          createdAtIso: now.toISOString(),
          expiresAt: expiresAtDate.toISOString(),
          deleteAt: deleteAtDate.toISOString()
        };

        // Incluir mídia se for história com imagem
        if (storyData.imageUrl) {
          firestoreStoryPayload.mediaUrl = storyData.imageUrl;
          firestoreStoryPayload.imageUrl = storyData.imageUrl;
          firestoreStoryPayload.foto = storyData.imageUrl;
          firestoreStoryPayload.imagem = storyData.imageUrl;
        }

        // Salvar diretamente na coleção historias
        await setDoc(doc(db, 'historias', storyId), firestoreStoryPayload);
        // Também salvar na coleção stories para compatibilidade total
        await setDoc(doc(db, 'stories', storyId), firestoreStoryPayload).catch(() => {});
      } catch (err: any) {
        console.warn('Firestore create story error:', err);
        return { success: false, error: err?.message || 'Erro ao gravar história no Firestore.' };
      }
    }

    return { success: true, id: storyId };
  };

  const viewStory = async (storyId: string) => {
    if (!currentUser) return;
    const userId = currentUser.uid;

    const currentStory = stories.find(s => s.id === storyId);
    if (!currentStory) return;

    // Check if already viewed by this user
    const alreadyViewed = (currentStory.viewers || []).some(v => v.userId === userId) ||
                          (currentStory.visualizadores || []).includes(userId);
    if (alreadyViewed) return;

    const newViewer: StoryViewer = {
      userId: currentUser.uid,
      userName: currentUser.name || 'Usuário MZ',
      userRole: currentUser.role,
      userAvatar: currentUser.avatarUrl || currentUser.photoURL || '',
      viewedAt: new Date().toISOString()
    };

    const updatedViewers = [...(currentStory.viewers || []), newViewer];
    const updatedVisualizadores = [...(currentStory.visualizadores || []), userId];
    const updatedViewsCount = Math.max((currentStory.viewsCount || 0) + 1, updatedVisualizadores.length);

    setStories(prev =>
      prev.map(s =>
        s.id === storyId
          ? {
              ...s,
              viewsCount: updatedViewsCount,
              viewers: updatedViewers,
              visualizadores: updatedVisualizadores
            }
          : s
      )
    );

    if (isFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, 'historias', storyId), {
          viewsCount: increment(1),
          visualizadores: arrayUnion(userId),
          viewers: arrayUnion(newViewer)
        }).catch(async () => {
          await setDoc(doc(db, 'historias', storyId), {
            viewsCount: updatedViewsCount,
            visualizadores: updatedVisualizadores,
            viewers: updatedViewers
          }, { merge: true }).catch(() => {});
        });

        await updateDoc(doc(db, 'stories', storyId), {
          viewsCount: increment(1),
          visualizadores: arrayUnion(userId),
          viewers: arrayUnion(newViewer)
        }).catch(async () => {
          await setDoc(doc(db, 'stories', storyId), {
            viewsCount: updatedViewsCount,
            visualizadores: updatedVisualizadores,
            viewers: updatedViewers
          }, { merge: true }).catch(() => {});
        });
      } catch (err) {
        console.warn('Firestore view story error:', err);
      }
    }
  };

  const reactToStory = async (storyId: string, emoji: string) => {
    if (!currentUser) return;

    const currentStory = stories.find(s => s.id === storyId);
    if (!currentStory) return;

    const newReaction: StoryReaction = {
      id: `react_${Date.now()}`,
      userId: currentUser.uid,
      userName: currentUser.name,
      userAvatar: currentUser.avatarUrl,
      emoji,
      createdAt: new Date().toISOString()
    };

    const updatedReactions = [...(currentStory.reactions || []), newReaction];

    setStories(prev =>
      prev.map(s =>
        s.id === storyId
          ? {
              ...s,
              reactions: updatedReactions
            }
          : s
      )
    );

    if (isFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, 'historias', storyId), {
          reactions: updatedReactions
        }).catch(() => {});
        await updateDoc(doc(db, 'stories', storyId), {
          reactions: updatedReactions
        }).catch(() => {});
      } catch (err) {
        console.warn('Firestore react to story error:', err);
      }
    }

    // Send notification to story author if it's someone else
    if (currentStory.authorId !== currentUser.uid) {
      createNotification(
        currentStory.authorId,
        `Reação à sua História ${emoji}`,
        `${currentUser.name} reagiu com ${emoji} ao seu status no mural.`,
        'info',
        'community'
      );
    }
  };

  const deleteStory = async (storyId: string) => {
    setStories(prev => prev.filter(s => s.id !== storyId));

    if (isFirebaseConfigured && db) {
      try {
        await deleteDoc(doc(db, 'historias', storyId)).catch(() => {});
        await deleteDoc(doc(db, 'stories', storyId)).catch(() => {});
      } catch (err) {
        console.warn('Firestore delete story error:', err);
      }
    }
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
  const sendMessage = async (conversationId: string, text: string) => {
    if (!currentUser || !text.trim()) return;

    const now = new Date();
    const deleteAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const newMsg: MessageItem = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      conversationId,
      senderId: currentUser.uid,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      text: text.trim(),
      createdAt: now.toISOString()
    };

    setMessages(prev => [...prev, newMsg]);

    const updatedConvData = {
      lastMessage: text.trim(),
      lastMessageAt: now.toISOString()
    };

    // Update conversation metadata
    setConversations(prev =>
      prev.map(c =>
        c.id === conversationId
          ? {
              ...c,
              ...updatedConvData
            }
          : c
      )
    );

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'messages', newMsg.id), { ...newMsg, deleteAt });
        await setDoc(doc(db, 'conversations', conversationId), updatedConvData, { merge: true });
      } catch (err) {
        console.warn('Firestore send message error:', err);
      }
    }

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

    if (isFirebaseConfigured && db) {
      try {
        setDoc(doc(db, 'conversations', newId), newConv);
      } catch (err) {
        console.warn('Firestore create conversation error:', err);
      }
    }

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
    setNotifications(prev =>
      prev.map(n =>
        n.userId === currentUser.uid ||
        n.userId === 'all' ||
        n.userId === currentUser.role ||
        n.userId === currentUser.tipoConta
          ? { ...n, read: true }
          : n
      )
    );
  };

  const unreadNotificationsCount = currentUser
    ? notifications.filter(
        n =>
          (n.userId === currentUser.uid ||
            n.userId === 'all' ||
            n.userId === currentUser.role ||
            n.userId === currentUser.tipoConta) &&
          !n.read
      ).length
    : 0;

  const sendAdminNotification = async (
    target: 'all' | 'client' | 'technician' | 'company' | string,
    title: string,
    message: string,
    type: 'info' | 'success' | 'warning' | 'alert' = 'info',
    linkTab?: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!title.trim() || !message.trim()) {
      return { success: false, error: 'Título e mensagem são obrigatórios.' };
    }

    const newNotif: NotificationItem = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: target,
      title: title.trim(),
      message: message.trim(),
      type,
      read: false,
      linkTab,
      createdAt: new Date().toISOString()
    };

    setNotifications(prev => [newNotif, ...prev]);

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'notifications', newNotif.id), newNotif);
      } catch (err: any) {
        console.warn('Firestore notification broadcast error:', err);
      }
      try {
        // Also save to notificacoes if schema requires
        await setDoc(doc(db, 'notificacoes', newNotif.id), newNotif);
      } catch (e) {}
    }

    addAdminLog(`Envio de comunicado oficial para: ${target}`, undefined, title.trim());
    return { success: true };
  };

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
        stories,
        createStory,
        viewStory,
        reactToStory,
        deleteStory,
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
        toggleMarketItemLike,
        addMarketItemComment,
        toggleMarketCommentLike,
        deleteMarketItemComment,
        addCommunityPost,
        togglePostReaction,
        addPostComment,
        toggleCommunityCommentLike,
        deleteCommunityComment,
        deleteCommunityPost,
        addAcademyArticle,
        verifyAcademyArticle,
        sendMessage,
        startOrGetConversation,
        saveBudgetEstimate,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        unreadNotificationsCount,
        sendAdminNotification,
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
