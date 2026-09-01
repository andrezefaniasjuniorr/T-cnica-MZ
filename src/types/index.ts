export type UserRole = 'client' | 'technician' | 'company' | 'admin' | 'super_admin';

export type AdminSubRole = 'super_admin' | 'finance_admin' | 'moderator' | 'support';

export type UserStatus = 'active' | 'suspended' | 'blocked' | 'pending_approval';

export type VerificationStatus = 'none' | 'pending' | 'approved' | 'rejected';

export type CompanyVerificationStatus = 'unverified' | 'in_review' | 'verified' | 'rejected' | 'pending';

export type SubscriptionStatus = 'none' | 'active' | 'expired';

export type AvailabilityStatus = 'available' | 'busy' | 'unavailable';

export type PaymentMethod = 'mpesa' | 'emola' | 'bank_transfer';

export type PaymentStatus = 'pending' | 'approved' | 'rejected';

export type RequestStatus = 'open' | 'receiving_proposals' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';

export type RequestUrgency = 'low' | 'normal' | 'urgent' | 'medium' | 'high';

export type ProposalStatus = 'pending' | 'accepted' | 'rejected';

export type JobContractType = 
  | 'Tempo Inteiro'
  | 'Tempo Parcial'
  | 'Freelancer'
  | 'Estágio'
  | 'Contrato'
  | 'Temporário'
  | 'Prestação de Serviços';

export type JobWorkplaceType = 'Presencial' | 'Híbrido' | 'Remoto';

export type ApplicationStatus = 
  | 'Recebida'
  | 'Em análise'
  | 'Selecionada'
  | 'Entrevista'
  | 'Aprovada'
  | 'Rejeitada';

export type ServiceProposal = Proposal;
export type ServiceCategory = string;
export type MozambiqueProvince = string;
export type ServiceUrgency = RequestUrgency;

export type PlanTier = 'basico' | 'profissional' | 'empresa_vip';

export type AccountType = 'cliente' | 'tecnico' | 'empresa';
export type ApprovalStatus = 'pendente' | 'aprovado' | 'rejeitado';
export type AccountStatus = 'ativa' | 'bloqueada' | 'suspensa';

export interface User {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  tipoConta?: 'cliente' | 'tecnico' | 'empresa';
  adminSubRole?: AdminSubRole;
  status: UserStatus;
  statusAprovacao?: ApprovalStatus;
  statusConta?: AccountStatus;
  isVerified?: boolean;
  temSeloMZ?: boolean;
  statusSelo?: 'nenhum' | 'pendente_aprovacao' | 'aprovado' | 'rejeitado';
  dataSeloEnvio?: string;
  dataSeloAprovacao?: string;
  motivoRejeicaoSelo?: string;
  mensagemTransacaoSelo?: string;
  operadoraSelo?: 'mpesa' | 'emola';
  specialty?: string;
  province?: string;
  city?: string;
  statusAssinatura?: 'ativa' | 'inativa' | 'expirada' | 'pendente' | string;
  dataExpiracao?: string; // ISO date string e.g. "2026-09-28T00:00:00.000Z"
  planoAtivo?: '50mt' | string;
  planoAssinatura?: 'plano_tecnico_pro' | 'profissional' | string;
  activePlanId?: string;
  subscriptionExpiresAt?: string;
  subscriptionStatus?: 'none' | 'active' | 'expired' | 'ativa';
  avatarUrl?: string;
  photoURL?: string;
  idade?: number;
  totalLikes?: number;
  scoreEngajamento?: number;
  suspensionReason?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface VerificationDocument {
  id: string;
  name: string;
  type: 'id_card' | 'certificate' | 'license' | 'nuit' | 'commercial_reg' | 'other';
  url: string;
  uploadedAt: string;
}

export interface PortfolioItem {
  id: string;
  technicianId: string;
  title: string;
  description: string;
  category: string;
  province: string;
  city?: string;
  photos: string[];
  imageUrl?: string;
  date: string;
  createdAt: string;
}

export interface Review {
  id: string;
  technicianId?: string;
  technicianName?: string;
  companyId?: string;
  clientId: string;
  clientName: string;
  clientAvatar?: string;
  requestId?: string;
  serviceRequestId?: string;
  category?: string;
  rating: number; // 1-5
  comment: string;
  createdAt: string;
}

export interface TechnicianPrivacySettings {
  showPhone: boolean;
  showWhatsapp: boolean;
  showEmail: boolean;
  allowDirectMessages: boolean;
  customWhatsappMessage?: string;
}

export interface TechnicianProfile {
  userId: string;
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  showWhatsappButton?: boolean;
  customWhatsappMessage?: string;
  privacy?: TechnicianPrivacySettings;
  province: string;
  city: string;
  district?: string;
  specialties: string[];
  bio: string;
  experienceYears: number;
  avatarUrl?: string;
  photoURL?: string;
  idade?: number;
  totalLikes?: number;
  scoreEngajamento?: number;
  coverUrl?: string;
  verificationStatus: VerificationStatus;
  verificationDocuments?: VerificationDocument[];
  verificationRejectionReason?: string;
  isVerified?: boolean;
  temSeloMZ?: boolean;
  statusSelo?: 'nenhum' | 'pendente_aprovacao' | 'aprovado' | 'rejeitado';
  statusAprovacao?: ApprovalStatus;
  statusConta?: AccountStatus;
  subscriptionStatus: SubscriptionStatus;
  activePlanId?: string;
  subscriptionExpiresAt?: string; // ISO date string
  rating: number;
  reviewsCount: number;
  completedJobsCount: number;
  availability: AvailabilityStatus;
  featured?: boolean;
  status: UserStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface CompanyPrivacySettings {
  showPhone: boolean;
  showWhatsapp: boolean;
  showEmail: boolean;
  showAddress: boolean;
}

export interface CompanyProfile {
  userId: string; // matches user uid
  companyName: string;
  commercialName: string;
  nuit: string;
  email: string;
  phone: string;
  whatsapp: string;
  showWhatsappButton?: boolean;
  website?: string;
  province: string;
  city: string;
  district?: string;
  address: string;
  industry: string; // Área de atuação principal
  description: string;
  slogan?: string;
  logoUrl?: string;
  avatarUrl?: string;
  photoURL?: string;
  coverUrl?: string;
  socialLinks?: {
    linkedin?: string;
    facebook?: string;
    instagram?: string;
  };
  verificationStatus: CompanyVerificationStatus;
  verificationDocuments?: VerificationDocument[];
  verificationRejectionReason?: string;
  isVerified?: boolean;
  temSeloMZ?: boolean;
  statusSelo?: 'nenhum' | 'pendente_aprovacao' | 'aprovado' | 'rejeitado';
  statusAprovacao?: ApprovalStatus;
  statusConta?: AccountStatus;
  privacy?: CompanyPrivacySettings;
  rating: number;
  reviewsCount: number;
  hiredTechniciansCount: number;
  activeJobsCount: number;
  featured?: boolean;
  status: UserStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface JobOpening {
  id: string;
  companyId: string;
  companyName: string;
  companyLogo?: string;
  companyVerified: boolean;
  companyNuit?: string;
  title: string;
  category: string; // Área profissional
  description: string;
  requirements: string[];
  minExperienceYears: number;
  educationLevel: string;
  workplaceType: JobWorkplaceType;
  contractType: JobContractType;
  province: string;
  city: string;
  salaryMinMZN?: number;
  salaryMaxMZN?: number;
  salaryDisplay: string; // e.g. "25.000 - 35.000 MZN" ou "A Combinar"
  benefits: string[];
  deadlineDate: string; // YYYY-MM-DD
  contactEmail: string;
  contactWhatsapp: string;
  applicationsCount: number;
  status: 'active' | 'paused' | 'closed';
  createdAt: string;
  updatedAt?: string;
}

export interface JobApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  companyId: string;
  companyName: string;
  technicianId: string;
  technicianName: string;
  technicianEmail: string;
  technicianPhone: string;
  technicianWhatsapp?: string;
  technicianAvatar?: string;
  technicianSpecialties?: string[];
  technicianSpecialty?: string;
  technicianExperienceYears: number;
  technicianProvince: string;
  technicianRating: number;
  technicianVerified: boolean;
  coverLetter: string;
  expectedSalaryMZN?: number | string;
  expectedSalary?: string;
  resumeUrl?: string;
  portfolioSummary?: string;
  status: ApplicationStatus;
  statusNotes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  priceMZN: number;
  durationDays: number;
  active: boolean;
  tier?: PlanTier;
  benefits: string[];
  permissions?: string[];
  restrictions?: string[];
  priority: number;
  isPopular?: boolean;
  badge?: string;
  targetRole?: 'technician' | 'company' | 'all';
  createdAt?: string;
  updatedAt?: string;
}

export interface PaymentRecord {
  id: string;
  userId: string;
  technicianId?: string;
  userName: string;
  userRole: UserRole;
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
  status: PaymentStatus;
  rejectionReason?: string;
  reviewedBy?: string;
  reviewedByName?: string;
  reviewedAt?: string;
  submittedAt: string;
  createdAt?: string;
}

export interface ServiceRequest {
  id: string;
  clientId: string;
  clientName: string;
  clientPhone?: string;
  clientAvatar?: string;
  title: string;
  category: string;
  description: string;
  province: string;
  city: string;
  address?: string;
  urgency: RequestUrgency;
  budgetMZN?: number;
  budgetMinMZN?: number;
  budgetMaxMZN?: number;
  preferredDate?: string;
  status: RequestStatus;
  acceptedTechnicianId?: string;
  acceptedTechnicianName?: string;
  acceptedProposalId?: string;
  assignedTechnicianId?: string;
  proposalsCount?: number;
  hasClientReviewed?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Proposal {
  id: string;
  requestId: string;
  requestTitle?: string;
  clientId: string;
  clientName?: string;
  technicianId: string;
  technicianName: string;
  technicianPhone?: string;
  technicianAvatar?: string;
  technicianAvatarUrl?: string;
  technicianRating: number;
  technicianVerified: boolean;
  laborCostMZN: number;
  materialsCostMZN: number;
  totalCostMZN: number;
  validityDays?: number;
  estimatedDays?: number | string;
  estimatedTime?: string;
  notes?: string;
  description?: string;
  materialsList?: { name: string; quantity: number; unitPriceMZN: number }[];
  status: ProposalStatus;
  createdAt: string;
}

export interface BudgetEstimate {
  id: string;
  technicianId: string;
  technicianName: string;
  technicianPhone?: string;
  clientName: string;
  clientPhone?: string;
  clientAddress?: string;
  serviceTitle?: string;
  projectTitle?: string;
  serviceDescription?: string;
  category?: string;
  items: { description: string; quantity?: number; unitPriceMZN?: number; totalMZN?: number; cost?: number }[];
  laborCostMZN: number;
  materialsCostMZN?: number;
  discountMZN?: number;
  totalMZN?: number;
  totalCostMZN?: number;
  validityDays?: number;
  validUntilDate?: string;
  province?: string;
  notes?: string;
  createdAt: string;
}

export interface MessageItem {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  text: string;
  createdAt: string;
}

export interface ConversationItem {
  id: string;
  participantIds: string[];
  participants: {
    id: string;
    name: string;
    role: UserRole;
    avatarUrl?: string;
  }[];
  lastMessage: string;
  lastMessageAt: string;
  unreadCount?: number;
  targetUserName?: string;
  targetUserId?: string;
  targetRole?: UserRole;
  contextType?: 'job' | 'request' | 'direct';
  contextTitle?: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  read: boolean;
  linkTab?: string;
  deeplink?: string;
  createdAt: string;
}

export interface ReportItem {
  id: string;
  reporterId: string;
  reporterName: string;
  reporterRole: UserRole;
  targetId: string;
  targetName: string;
  targetType: 'technician' | 'client' | 'company' | 'request' | 'job' | 'market';
  reason: string;
  details: string;
  status: 'pending' | 'resolved' | 'dismissed';
  resolutionNotes?: string;
  createdAt: string;
}

export interface AdminLogItem {
  id: string;
  adminId: string;
  adminName: string;
  adminRole: string;
  action: string;
  targetId?: string;
  targetName?: string;
  details?: string;
  timestamp: string;
}

export interface MarketComment {
  id: string;
  itemId: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  authorAvatar?: string;
  authorSpecialty?: string;
  text: string;
  replyToId?: string;
  replyToName?: string;
  likes?: string[];
  createdAt: string;
}

export interface MarketItem {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerRole: UserRole;
  sellerPhone?: string;
  sellerWhatsapp?: string;
  whatsapp?: string;
  phone?: string;
  showWhatsapp?: boolean;
  title: string;
  category: string;
  priceMZN: number;
  price?: number;
  priceDisplay?: string;
  province: string;
  city: string;
  location?: string;
  condition: 'Novo' | 'Como Novo' | 'Usado - Excelente' | 'Usado - Bom' | 'Para Peças' | string;
  brand?: string;
  model?: string;
  quantity?: number;
  description: string;
  images: string[];
  status: 'active' | 'sold' | 'paused' | 'moderated';
  likes?: string[];
  commentsCount?: number;
  comments?: MarketComment[];
  createdAt: string;
}

export interface CommunityComment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  authorAvatar?: string;
  authorSpecialty?: string;
  text: string;
  replyToId?: string;
  replyToName?: string;
  likes?: string[];
  createdAt: string;
}

export interface CommunityPost {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  authorAvatar?: string;
  authorSpecialty?: string;
  authorProvince: string;
  authorWhatsapp?: string;
  title: string;
  content: string;
  category: string;
  tags?: string[];
  images?: string[];
  reactions: {
    useful: string[];      // user IDs
    insightful: string[];  // user IDs
    applause: string[];    // user IDs
    question: string[];    // user IDs
  };
  commentsCount: number;
  comments: CommunityComment[];
  pinned?: boolean;
  createdAt: string;
  deleteAt?: string;
  expiresAt?: string;
}

export interface StoryReaction {
  id?: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  emoji: string;
  createdAt: string;
}

export interface StoryViewer {
  userId: string;
  userName: string;
  userRole?: UserRole;
  userAvatar?: string;
  viewedAt: string;
}

export interface StoryItem {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  authorAvatar?: string;
  authorSpecialty?: string;
  authorProvince?: string;
  authorWhatsapp?: string;
  authorPhone?: string;
  imageUrl?: string;
  text?: string;
  backgroundColor?: string;
  textColor?: string;
  viewsCount?: number;
  viewers?: StoryViewer[];
  reactions?: StoryReaction[];
  createdAt: string; // ISO string
  expiresAt: string; // ISO string (createdAt + 24 hours)
  deleteAt: string;  // ISO string (createdAt + 7 days)
}

export interface AcademyArticle {
  id: string;
  title: string;
  category: string;
  readTime?: string;
  readTimeMinutes?: number;
  author?: string;
  authorName?: string;
  source?: string;
  sourceUrl?: string;
  verifiedDate?: string;
  description?: string;
  summary?: string;
  content?: string;
  tags: string[];
  downloadable: boolean;
  verifiedByAdmin: boolean;
  status?: string;
  createdAt?: string;
}

export interface PaymentMethodConfig {
  mpesaNumber: string;
  mpesaName: string;
  emolaNumber: string;
  emolaName: string;
  bankName: string;
  bankAccount: string;
  bankHolder: string;
  bankNIB: string;
  instructions: string;
  mpesa?: { number: string; name: string; enabled?: boolean; instructions?: string };
  emola?: { number: string; name: string; enabled?: boolean; instructions?: string };
}

export interface PlatformSettings {
  platformName: string;
  slogan: string;
  supportPhone: string;
  supportEmail: string;
  whatsappSupport: string;
  supportWhatsapp?: string;
  paymentMethods: PaymentMethodConfig;
  mpesaNumber?: string;
  mpesaName?: string;
  categories: string[];
  provinces: string[];
  maintenanceMode: boolean;
  saraAiEnabled: boolean;
  registrationOpen: boolean;
  allowNewRegistrations?: boolean;
}

export const MOZAMBIQUE_PROVINCES = [
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
] as const;

export const TECHNICAL_CATEGORIES = [
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
] as const;

export interface SolicitacaoSelo {
  id: string;
  userId: string;
  usuarioNome: string;
  usuarioEmail: string;
  usuarioTelefone: string;
  userRole?: UserRole;
  tipoConta?: 'cliente' | 'tecnico' | 'empresa';
  operadora: 'mpesa' | 'emola';
  mensagemTransacao: string;
  valor?: number;
  statusSelo: 'pendente_aprovacao' | 'aprovado' | 'rejeitado';
  motivoRejeicao?: string;
  dataEnvio: string; // ISO date string
  dataResposta?: string;
  aprovadoPor?: string;
  respondidoPor?: string;
}

