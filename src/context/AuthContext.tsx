import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, TechnicianProfile, CompanyProfile, UserRole, AdminSubRole, UserStatus, SolicitacaoSelo } from '../types';
import { auth, db, isFirebaseConfigured } from '../firebase/config';
import { safeGetDoc, safeSetDoc } from '../firebase/db';
import { safeGetStorageItem, safeSetStorageItem, safeRemoveStorageItem } from '../utils/storage';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updatePassword as fbUpdatePassword
} from 'firebase/auth';
import {
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  onSnapshot,
  query,
  where,
  getDocs,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { giveHeartOrLike, recalculateUserStarsAndRanking } from '../services/engagement';
import { parseDateToMillis, parseDateToIso, THREE_DAYS_MS } from '../utils/date';
import {
  calcularDiasRestantesTrial,
  checkDeviceTrialUsedAsync,
  markDeviceTrialUsed,
  checkDeviceTrialUsed
} from '../utils/trial';

// Declaração de propriedades globais no Window para evitar erros de compilação
declare global {
  interface Window {
    applyRoleBasedUI?: (role: string) => void;
  }
}

interface AuthContextType {
  currentUser: User | null;
  currentTechProfile: TechnicianProfile | null;
  currentCompanyProfile: CompanyProfile | null;
  usersList: User[];
  techList: TechnicianProfile[];
  companyList: CompanyProfile[];
  isAuthenticated: boolean;
  isLoading: boolean;
  isClient: boolean;
  isTechnician: boolean;
  isCompany: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isFinanceAdmin: boolean;
  isModerator: boolean;

  // Selo MZ & Permissions
  temSeloMZ: boolean;
  statusSelo: 'nenhum' | 'pendente_aprovacao' | 'aprovado' | 'rejeitado' | 'expirado';
  seloDaysRemaining: number;
  isSeloExpired: boolean;
  isAccountActive: boolean;
  accountStatusLabel: string;
  isTrialActive: boolean;
  trialDaysRemaining: number;
  isTrialValid: boolean;
  isTrialExpired: boolean;
  temAcessoTrial?: boolean;
  trialExpirado?: boolean;
  hasAccess: boolean;
  isRestrictedTechnician: boolean;
  solicitacoesSelo: SolicitacaoSelo[];
  solicitarSeloMZ: (operadora: 'mpesa' | 'emola', mensagemTransacao: string) => Promise<{ success: boolean; error?: string }>;
  aprovarSeloMZ: (solicitacaoId: string, userId: string) => Promise<{ success: boolean; error?: string }>;
  rejeitarSeloMZ: (solicitacaoId: string, userId: string, motivo?: string) => Promise<{ success: boolean; error?: string }>;
  grantTrial3Days: (userId: string) => Promise<{ success: boolean; error?: string }>;
  revokeTrial: (userId: string) => Promise<{ success: boolean; error?: string }>;
  grantSelo30Days: (userId: string) => Promise<{ success: boolean; error?: string }>;

  // Paywall & Subscription State
  isSubscriptionActive: boolean;
  activePlanTier: 'basico' | 'profissional' | 'empresa_vip' | null;
  activePlanId: string | null;
  subscriptionExpirationDate: string | null;
  daysRemainingOnSubscription: number;
  canAccessSaraAi: boolean;
  canAccessOSGenerator: boolean;
  canPublishMarket: boolean;
  hasTopMuralHighlight: boolean;

  activateUserSubscription: (planId: string, durationDays?: number, transactionCode?: string) => Promise<boolean>;

  loginAsClient: (name: string) => { success: boolean; user: User };
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string; user?: User }>;
  register: (data: {
    name: string;
    email: string;
    phone: string;
    password?: string;
    role: UserRole;
    tipo?: 'cliente' | 'tecnico' | 'empresa' | string;
    tipoConta?: 'cliente' | 'tecnico' | 'empresa';
    idade?: number;
    experienceYears?: number;
    photoURL?: string;
    avatarUrl?: string;
    specialty?: string;
    province?: string;
    city?: string;
    nuit?: string;
    commercialName?: string;
    industry?: string;
    address?: string;
    website?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  changePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
  cadastrarEmpresa: (email: string, senha: string, dadosEmpresa: any) => Promise<{ success: boolean; user?: any; error?: string }>;
  updateCurrentUserProfile: (data: Partial<User>) => Promise<void>;
  updateCurrentTechProfile: (data: Partial<TechnicianProfile>) => Promise<void>;
  updateCurrentCompanyProfile: (data: Partial<CompanyProfile>) => Promise<void>;
  giveTechnicianLike: (techUserId: string) => Promise<{ success: boolean; totalLikes: number; hasLiked?: boolean; error?: string }>;
  toggleTechnicianLike: (techUserId: string) => Promise<{ success: boolean; totalLikes: number; hasLiked: boolean; error?: string }>;
  switchUserRole: (newRole: UserRole) => Promise<void>;
  updateUserStatus: (userId: string, status: UserStatus) => Promise<void>;
  deleteUserAccount: (userId: string) => Promise<void>;
  approveUserAccount: (userId: string) => Promise<void>;
  rejectUserAccount: (userId: string, reason?: string) => Promise<void>;
  toggleUserVerification: (userId: string) => Promise<void>;
  grantManualSubscription30Days: (userId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_USER_KEY = 'tecnicamz_auth_user_id';
export const CACHED_USER_KEY = 'tecnicamz_cached_user';
export const CACHED_TECH_PROFILE_KEY = 'tecnicamz_cached_tech_profile';
export const CACHED_COMPANY_PROFILE_KEY = 'tecnicamz_cached_company_profile';
export const LAST_ROUTE_KEY = 'tecnicamz_last_route';

export const sanitizeUserForCache = (u: User | null): Partial<User> | null => {
  if (!u) return null;
  return {
    uid: u.uid,
    name: u.name,
    nome: u.nome,
    email: u.email,
    role: u.role,
    tipo: u.tipo,
    tipoConta: u.tipoConta,
    phone: u.phone,
    province: u.province,
    city: u.city,
    idade: u.idade,
    experienceYears: (u as any).experienceYears ?? (u as any).anosExperiencia,
    avatarUrl: u.avatarUrl && !u.avatarUrl.startsWith('data:') ? u.avatarUrl : undefined,
    photoURL: u.photoURL && !u.photoURL.startsWith('data:') ? u.photoURL : undefined,
    status: u.status,
    statusConta: u.statusConta,
    statusAprovacao: u.statusAprovacao,
    temSeloMZ: u.temSeloMZ,
    isVerified: u.isVerified,
    statusSelo: u.statusSelo,
    verifiedAt: u.verifiedAt,
    verifiedUntil: u.verifiedUntil,
    dataSeloAprovacao: u.dataSeloAprovacao,
    dataExpiracao: u.dataExpiracao,
    statusAssinatura: u.statusAssinatura,
    adminSubRole: u.adminSubRole,
    activePlanId: u.activePlanId,
    subscriptionStatus: u.subscriptionStatus,
    subscriptionExpiresAt: u.subscriptionExpiresAt,
    isTrialActive: u.isTrialActive,
    stars: u.stars,
    pontos: u.pontos,
    points: u.points,
    totalLikes: u.totalLikes,
    likesCount: u.likesCount,
    createdAt: u.createdAt
  };
};

export const sanitizeTechProfileForCache = (t: TechnicianProfile | null): Partial<TechnicianProfile> | null => {
  if (!t) return null;
  return {
    userId: t.userId,
    name: t.name,
    email: t.email,
    phone: t.phone,
    whatsapp: t.whatsapp,
    province: t.province,
    city: t.city,
    district: t.district,
    specialties: t.specialties,
    bio: t.bio,
    experienceYears: t.experienceYears,
    idade: t.idade,
    rating: t.rating,
    reviewsCount: t.reviewsCount,
    completedJobsCount: t.completedJobsCount,
    availability: t.availability,
    avatarUrl: t.avatarUrl && !t.avatarUrl.startsWith('data:') ? t.avatarUrl : undefined,
    photoURL: t.photoURL && !t.photoURL.startsWith('data:') ? t.photoURL : undefined,
    status: t.status,
    statusAprovacao: t.statusAprovacao,
    isVerified: t.isVerified,
    temSeloMZ: t.temSeloMZ,
    statusSelo: t.statusSelo,
    verifiedAt: t.verifiedAt,
    verifiedUntil: t.verifiedUntil,
    subscriptionStatus: t.subscriptionStatus,
    subscriptionExpiresAt: t.subscriptionExpiresAt,
    pontos: t.pontos,
    points: t.points,
    totalLikes: t.totalLikes,
    createdAt: t.createdAt
  };
};

export const sanitizeCompanyProfileForCache = (c: CompanyProfile | null): Partial<CompanyProfile> | null => {
  if (!c) return null;
  return {
    userId: c.userId,
    companyName: c.companyName,
    commercialName: c.commercialName,
    nuit: c.nuit,
    email: c.email,
    phone: c.phone,
    whatsapp: c.whatsapp,
    province: c.province,
    city: c.city,
    district: c.district,
    address: c.address,
    industry: c.industry,
    description: c.description,
    rating: c.rating,
    reviewsCount: c.reviewsCount,
    avatarUrl: c.avatarUrl && !c.avatarUrl.startsWith('data:') ? c.avatarUrl : undefined,
    logoUrl: c.logoUrl && !c.logoUrl.startsWith('data:') ? c.logoUrl : undefined,
    status: c.status,
    statusAprovacao: c.statusAprovacao,
    isVerified: c.isVerified,
    temSeloMZ: c.temSeloMZ,
    statusSelo: c.statusSelo,
    verifiedAt: c.verifiedAt,
    verifiedUntil: c.verifiedUntil,
    createdAt: c.createdAt
  };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [usersList, setUsersList] = useState<User[]>(() => {
    return safeGetStorageItem<User[]>('tecnicamz_users', []);
  });

  const [techList, setTechList] = useState<TechnicianProfile[]>(() => {
    return safeGetStorageItem<TechnicianProfile[]>('tecnicamz_technicians', []);
  });

  const [companyList, setCompanyList] = useState<CompanyProfile[]>(() => {
    return safeGetStorageItem<CompanyProfile[]>('tecnicamz_companies', []);
  });

  const [solicitacoesSelo, setSolicitacoesSelo] = useState<SolicitacaoSelo[]>(() => {
    return safeGetStorageItem<SolicitacaoSelo[]>('tecnicamz_solicitacoes_selo', []);
  });

  // Abertura Instantânea: lê o cachedUser imediatamente em 0ms
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const cached = safeGetStorageItem<User | null>(CACHED_USER_KEY, null);
    if (cached && cached.uid) {
      return cached;
    }
    const savedClientName = typeof window !== 'undefined' ? localStorage.getItem('clienteNome') : null;
    if (savedClientName) {
      return {
        uid: `client_${savedClientName.toLowerCase().replace(/\s+/g, '_')}`,
        name: savedClientName,
        email: '',
        phone: '',
        role: 'client',
        tipoConta: 'cliente',
        statusAprovacao: 'aprovado',
        statusConta: 'ativa',
        status: 'active',
        createdAt: new Date().toISOString()
      };
    }
    const savedId = safeGetStorageItem<string | null>(LOCAL_STORAGE_USER_KEY, null);
    if (savedId) {
      const initialUsers = safeGetStorageItem<User[]>('tecnicamz_users', []);
      const found = initialUsers.find(u => u.uid === savedId);
      if (found) return found;
    }
    return null;
  });

  const [currentTechProfile, setCurrentTechProfile] = useState<TechnicianProfile | null>(() => {
    return safeGetStorageItem<TechnicianProfile | null>(CACHED_TECH_PROFILE_KEY, null);
  });

  const [currentCompanyProfile, setCurrentCompanyProfile] = useState<CompanyProfile | null>(() => {
    return safeGetStorageItem<CompanyProfile | null>(CACHED_COMPANY_PROFILE_KEY, null);
  });

  const [isLoading, setIsLoading] = useState<boolean>(() => {
    const cached = safeGetStorageItem<User | null>(CACHED_USER_KEY, null);
    if (cached && cached.uid) return false;
    const savedClientName = typeof window !== 'undefined' ? localStorage.getItem('clienteNome') : null;
    if (savedClientName) return false;
    const savedId = safeGetStorageItem<string | null>(LOCAL_STORAGE_USER_KEY, null);
    if (savedId) return false;

    return isFirebaseConfigured && !!auth;
  });

  // Sync real-time Firestore listeners for users, technicians, and companies
  useEffect(() => {
    if (!isFirebaseConfigured || !db) return;

    const unsubUsers = onSnapshot(
      collection(db, 'users'),
      (snapshot) => {
        const users: User[] = [];
        snapshot.forEach((docSnap) => {
          users.push({ ...docSnap.data(), uid: docSnap.id } as User);
        });
        setUsersList(users);
      },
      (err) => console.warn("Erro Firestore ignorado:", err)
    );

    const unsubUsuarios = onSnapshot(
      collection(db, 'usuarios'),
      (snapshot) => {
        const usersFromUsuarios: User[] = [];
        const techsFromUsuarios: TechnicianProfile[] = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data() || {};
          const rawTipo = String(d.tipo || d.tipoConta || d.role || '').toLowerCase().trim();
          const isCompanyAccount = rawTipo === 'empresa' || rawTipo === 'company' || d.tipo === 'empresa' || d.tipoConta === 'empresa' || d.role === 'company';
          const isClientAccount = rawTipo === 'cliente' || rawTipo === 'client' || d.tipo === 'cliente' || d.tipoConta === 'cliente' || d.role === 'client';
          const isAdminAccount = rawTipo === 'admin' || d.role === 'admin';
          const isSuperAdminAccount = rawTipo === 'super_admin' || d.role === 'super_admin';
          const role = isCompanyAccount ? 'company' : isClientAccount ? 'client' : (isSuperAdminAccount ? 'super_admin' : (isAdminAccount ? 'admin' : 'technician'));
          const tipoConta: 'cliente' | 'tecnico' | 'empresa' = isCompanyAccount ? 'empresa' : isClientAccount ? 'cliente' : 'tecnico';
          const isTech = !isCompanyAccount && !isClientAccount && (role === 'technician' || tipoConta === 'tecnico');
          const defaultName = d.nome || d.name || (isCompanyAccount ? 'Empresa Registada' : 'Técnico Especialista');
          const cleanPhone = d.phone || d.telefone || '';
          const userExp = typeof d.experienceYears === 'number' ? d.experienceYears : (typeof d.anosExperiencia === 'number' ? d.anosExperiencia : undefined);

          const hasSeloApproved = Boolean(d.temSeloMZ || d.statusSelo === 'aprovado' || d.isVerified);

          const userObj: User = {
            uid: docSnap.id,
            name: defaultName,
            nome: defaultName,
            email: d.email || '',
            phone: cleanPhone,
            nuit: d.nuit || '',
            role: role,
            tipo: tipoConta,
            tipoConta: tipoConta,
            idade: d.idade ? Number(d.idade) : undefined,
            experienceYears: userExp,
            anosExperiencia: userExp,
            photoURL: d.photoURL || d.avatarUrl || d.foto || '',
            avatarUrl: d.avatarUrl || d.photoURL || d.foto || '',
            specialty: d.specialty || d.especialidade || (role === 'technician' ? 'Eletricidade' : undefined),
            province: d.province || d.provincia || '',
            city: d.city || d.cidade || '',
            status: d.status || 'active',
            statusConta: hasSeloApproved ? 'ativa' : (d.statusConta || 'ativa'),
            statusAprovacao: d.statusAprovacao || 'aprovado',
            temSeloMZ: hasSeloApproved,
            isVerified: hasSeloApproved,
            statusSelo: d.statusSelo || (hasSeloApproved ? 'aprovado' : 'nenhum'),
            verifiedAt: parseDateToIso(d.verifiedAt || d.dataSeloAprovacao),
            verifiedUntil: parseDateToIso(d.verifiedUntil),
            dataSeloAprovacao: parseDateToIso(d.dataSeloAprovacao || d.verifiedAt),
            subscriptionExpiresAt: parseDateToIso(d.subscriptionExpiresAt || d.dataExpiracao || d.verifiedUntil),
            dataExpiracao: parseDateToIso(d.dataExpiracao || d.subscriptionExpiresAt || d.verifiedUntil),
            subscriptionStatus: hasSeloApproved ? 'active' : (d.subscriptionStatus || 'none'),
            statusAssinatura: hasSeloApproved ? 'ativa' : (d.statusAssinatura || 'none'),
            isTrialActive: d.isTrialActive !== undefined ? Boolean(d.isTrialActive) : true,
            totalLikes: typeof d.totalLikes === 'number' ? d.totalLikes : 0,
            scoreEngajamento: typeof d.scoreEngajamento === 'number' ? d.scoreEngajamento : (typeof d.pontos === 'number' ? d.pontos : 0),
            pontos: typeof d.pontos === 'number' ? d.pontos : (typeof d.scoreEngajamento === 'number' ? d.scoreEngajamento : 0),
            streakCount: typeof d.streakCount === 'number' ? d.streakCount : (typeof d.sequenciaDias === 'number' ? d.sequenciaDias : 1),
            lastLoginDate: d.lastLoginDate || d.ultimoAcesso || '',
            createdAt: parseDateToIso(d.createdAt || d.criadoEm || d.dataCadastro)
          } as any;
          usersFromUsuarios.push(userObj);

          if (isTech) {
            techsFromUsuarios.push({
              userId: docSnap.id,
              name: defaultName,
              email: d.email || '',
              phone: cleanPhone,
              whatsapp: d.whatsapp || cleanPhone,
              showWhatsappButton: d.showWhatsappButton ?? true,
              customWhatsappMessage: d.customWhatsappMessage || `Olá ${defaultName}, vi seu perfil na TécnicaMZ e gostaria de solicitar um orçamento.`,
              province: d.province || d.provincia || '',
              city: d.city || d.cidade || '',
              specialties: Array.isArray(d.specialties) ? d.specialties : (d.specialty ? [d.specialty] : (d.especialidade ? [d.especialidade] : ['Eletricidade'])),
              bio: d.bio || `Profissional qualificado em ${d.specialty || d.especialidade || 'serviços técnicos'} em Moçambique.`,
              experienceYears: userExp !== undefined ? userExp : 2,
              idade: d.idade ? Number(d.idade) : undefined,
              avatarUrl: d.avatarUrl || d.photoURL || d.foto || '',
              photoURL: d.photoURL || d.avatarUrl || d.foto || '',
              totalLikes: typeof d.totalLikes === 'number' ? d.totalLikes : 0,
              scoreEngajamento: typeof d.scoreEngajamento === 'number' ? d.scoreEngajamento : (typeof d.pontos === 'number' ? d.pontos : 0),
              pontos: typeof d.pontos === 'number' ? d.pontos : (typeof d.scoreEngajamento === 'number' ? d.scoreEngajamento : 0),
              streakCount: typeof d.streakCount === 'number' ? d.streakCount : (typeof d.sequenciaDias === 'number' ? d.sequenciaDias : 1),
              lastLoginDate: d.lastLoginDate || d.ultimoAcesso || '',
              verificationStatus: hasSeloApproved ? 'approved' : (d.verificationStatus || 'none'),
              isVerified: hasSeloApproved,
              temSeloMZ: hasSeloApproved,
              statusSelo: d.statusSelo || (hasSeloApproved ? 'aprovado' : 'nenhum'),
              verifiedAt: parseDateToIso(d.verifiedAt || d.dataSeloAprovacao),
              verifiedUntil: parseDateToIso(d.verifiedUntil),
              subscriptionStatus: hasSeloApproved ? 'active' : (d.subscriptionStatus || 'none'),
              subscriptionExpiresAt: parseDateToIso(d.subscriptionExpiresAt || d.dataExpiracao || d.verifiedUntil),
              statusAprovacao: d.statusAprovacao || 'aprovado',
              statusConta: hasSeloApproved ? 'ativa' : (d.statusConta || 'ativa'),
              status: d.status || 'active',
              rating: typeof d.rating === 'number' ? d.rating : 5.0,
              reviewsCount: typeof d.reviewsCount === 'number' ? d.reviewsCount : 0,
              completedJobsCount: typeof d.completedJobsCount === 'number' ? d.completedJobsCount : 0,
              availability: d.availability || 'available',
              createdAt: d.createdAt || d.dataCadastro || new Date().toISOString()
            });
          }
        });

        setUsersList(prev => {
          const map = new Map(prev.map(u => [u.uid, u]));
          usersFromUsuarios.forEach(u => map.set(u.uid, { ...map.get(u.uid), ...u }));
          return Array.from(map.values());
        });

        if (techsFromUsuarios.length > 0) {
          setTechList(prev => {
            const map = new Map(prev.map(t => [t.userId, t]));
            techsFromUsuarios.forEach(t => map.set(t.userId, { ...map.get(t.userId), ...t }));
            return Array.from(map.values());
          });
        }
      },
      (err) => console.warn("Erro Firestore ignorado:", err)
    );

    const unsubTecnicos = onSnapshot(
      collection(db, 'tecnicos'),
      (snapshot) => {
        const usersFromTecnicos: User[] = [];
        const techsFromTecnicos: TechnicianProfile[] = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data() || {};
          const defaultName = d.nome_completo || d.nome || d.name || 'Técnico Especialista';
          const cleanPhone = d.telefone_whatsapp || d.telefone || d.phone || '';
          const cleanEmail = d.email_acesso || d.email || '';
          const rawSpecialty = d.especialidade_principal || d.specialty || d.especialidade || 'Eletricidade';
          const specialties = Array.isArray(d.specialties) ? d.specialties : [rawSpecialty];
          const userExp = typeof d.experienceYears === 'number' ? d.experienceYears : (typeof d.anosExperiencia === 'number' ? d.anosExperiencia : undefined);
          const hasSeloApproved = Boolean(d.temSeloMZ || d.statusSelo === 'aprovado' || d.isVerified);

          const userObj: User = {
            uid: docSnap.id,
            name: defaultName,
            nome: defaultName,
            email: cleanEmail,
            phone: cleanPhone,
            role: 'technician',
            tipo: 'tecnico',
            tipoConta: 'tecnico',
            idade: d.idade ? Number(d.idade) : undefined,
            experienceYears: userExp,
            anosExperiencia: userExp,
            photoURL: d.photoURL || d.avatarUrl || d.foto || '',
            avatarUrl: d.avatarUrl || d.photoURL || d.foto || '',
            specialty: rawSpecialty,
            province: d.provincia || d.province || '',
            city: d.cidade_distrito || d.cidade || d.city || '',
            status: d.status || 'active',
            statusConta: hasSeloApproved ? 'ativa' : (d.statusConta || 'ativa'),
            statusAprovacao: d.statusAprovacao || 'aprovado',
            temSeloMZ: hasSeloApproved,
            isVerified: hasSeloApproved,
            statusSelo: d.statusSelo || (hasSeloApproved ? 'aprovado' : 'nenhum'),
            isTrialActive: d.isTrialActive !== undefined ? Boolean(d.isTrialActive) : true,
            totalLikes: typeof d.totalLikes === 'number' ? d.totalLikes : 0,
            scoreEngajamento: typeof d.scoreEngajamento === 'number' ? d.scoreEngajamento : (typeof d.pontos === 'number' ? d.pontos : 0),
            pontos: typeof d.pontos === 'number' ? d.pontos : (typeof d.scoreEngajamento === 'number' ? d.scoreEngajamento : 0),
            streakCount: typeof d.streakCount === 'number' ? d.streakCount : 1,
            lastLoginDate: d.lastLoginDate || d.ultimoAcesso || '',
            createdAt: parseDateToIso(d.createdAt || d.criado_em || d.criadoEm || d.dataCadastro)
          } as any;
          usersFromTecnicos.push(userObj);

          techsFromTecnicos.push({
            userId: docSnap.id,
            name: defaultName,
            email: cleanEmail,
            phone: cleanPhone,
            whatsapp: d.whatsapp || cleanPhone,
            showWhatsappButton: d.showWhatsappButton ?? true,
            customWhatsappMessage: d.customWhatsappMessage || `Olá ${defaultName}, vi seu perfil na TécnicaMZ e gostaria de solicitar um orçamento.`,
            province: d.provincia || d.province || '',
            city: d.cidade_distrito || d.cidade || d.city || '',
            specialties: specialties,
            bio: d.bio || `Profissional qualificado em ${rawSpecialty} em Moçambique.`,
            experienceYears: userExp !== undefined ? userExp : 2,
            idade: d.idade ? Number(d.idade) : undefined,
            avatarUrl: d.avatarUrl || d.photoURL || d.foto || '',
            photoURL: d.photoURL || d.avatarUrl || d.foto || '',
            totalLikes: typeof d.totalLikes === 'number' ? d.totalLikes : 0,
            scoreEngajamento: typeof d.scoreEngajamento === 'number' ? d.scoreEngajamento : (typeof d.pontos === 'number' ? d.pontos : 0),
            pontos: typeof d.pontos === 'number' ? d.pontos : (typeof d.scoreEngajamento === 'number' ? d.scoreEngajamento : 0),
            streakCount: typeof d.streakCount === 'number' ? d.streakCount : 1,
            verificationStatus: hasSeloApproved ? 'approved' : (d.verificationStatus || 'none'),
            isVerified: hasSeloApproved,
            temSeloMZ: hasSeloApproved,
            statusSelo: d.statusSelo || (hasSeloApproved ? 'aprovado' : 'nenhum'),
            statusAprovacao: d.statusAprovacao || 'aprovado',
            statusConta: hasSeloApproved ? 'ativa' : (d.statusConta || 'ativa'),
            status: (d.status === 'blocked' || d.statusConta === 'bloqueada') ? 'blocked' : 'active',
            subscriptionStatus: hasSeloApproved ? 'active' : (d.subscriptionStatus || 'none'),
            rating: typeof d.rating === 'number' ? d.rating : 5.0,
            reviewsCount: typeof d.reviewsCount === 'number' ? d.reviewsCount : 0,
            completedJobsCount: typeof d.completedJobsCount === 'number' ? d.completedJobsCount : 0,
            availability: d.availability || 'available',
            createdAt: d.createdAt || d.criado_em || d.dataCadastro || new Date().toISOString()
          });
        });

        setUsersList(prev => {
          const map = new Map(prev.map(u => [u.uid, u]));
          usersFromTecnicos.forEach(u => map.set(u.uid, { ...map.get(u.uid), ...u }));
          return Array.from(map.values());
        });

        if (techsFromTecnicos.length > 0) {
          setTechList(prev => {
            const map = new Map(prev.map(t => [t.userId, t]));
            techsFromTecnicos.forEach(t => map.set(t.userId, { ...map.get(t.userId), ...t }));
            return Array.from(map.values());
          });
        }
      },
      (err) => console.warn("Erro Firestore tecnicos ignorado:", err)
    );

    const unsubTechs = onSnapshot(
      collection(db, 'technicians'),
      (snapshot) => {
        const techs: TechnicianProfile[] = [];
        snapshot.forEach((docSnap) => {
          techs.push({ ...docSnap.data(), userId: docSnap.id } as TechnicianProfile);
        });
        setTechList(techs);
      },
      (err) => console.warn("Erro Firestore ignorado:", err)
    );

    const unsubComps = onSnapshot(
      collection(db, 'companies'),
      (snapshot) => {
        const comps: CompanyProfile[] = [];
        snapshot.forEach((docSnap) => {
          comps.push({ ...docSnap.data(), userId: docSnap.id } as CompanyProfile);
        });
        setCompanyList(comps);
      },
      (err) => console.warn("Erro Firestore ignorado:", err)
    );

    const unsubSelo = onSnapshot(
      collection(db, 'solicitacoes_selo'),
      (snapshot) => {
        const selos: SolicitacaoSelo[] = [];
        snapshot.forEach((docSnap) => {
          selos.push({ ...docSnap.data(), id: docSnap.id } as SolicitacaoSelo);
        });
        selos.sort((a, b) => new Date(b.dataEnvio).getTime() - new Date(a.dataEnvio).getTime());
        setSolicitacoesSelo(selos);
      },
      (err) => console.warn("Erro Firestore ignorado:", err)
    );

    return () => {
      try {
        if (typeof unsubUsers === 'function') unsubUsers();
        if (typeof unsubUsuarios === 'function') unsubUsuarios();
        if (typeof unsubTecnicos === 'function') unsubTecnicos();
        if (typeof unsubTechs === 'function') unsubTechs();
        if (typeof unsubComps === 'function') unsubComps();
        if (typeof unsubSelo === 'function') unsubSelo();
      } catch (cleanupErr) {
        console.warn("Erro Firestore cleanup ignorado:", cleanupErr);
      }
    };
  }, []);

  // Sync current user profiles whenever currentUser, techList or companyList change
  useEffect(() => {
    if (currentUser) {
      safeSetStorageItem(LOCAL_STORAGE_USER_KEY, currentUser.uid);
      const sanitizedUser = sanitizeUserForCache(currentUser);
      if (sanitizedUser) {
        safeSetStorageItem(CACHED_USER_KEY, sanitizedUser);
      }
      if (currentUser.role === 'technician' || currentUser.tipo === 'tecnico' || currentUser.tipoConta === 'tecnico') {
        const tech = techList.find(t => t.userId === currentUser.uid);
        if (tech) {
          setCurrentTechProfile(tech);
          safeSetStorageItem(CACHED_TECH_PROFILE_KEY, sanitizeTechProfileForCache(tech));
        }
        setCurrentCompanyProfile(null);
      } else if (currentUser.role === 'company' || currentUser.tipo === 'empresa' || currentUser.tipoConta === 'empresa') {
        const comp = companyList.find(c => c.userId === currentUser.uid);
        if (comp) {
          setCurrentCompanyProfile(comp);
          safeSetStorageItem(CACHED_COMPANY_PROFILE_KEY, sanitizeCompanyProfileForCache(comp));
        }
        setCurrentTechProfile(null);
      } else {
        setCurrentTechProfile(null);
        setCurrentCompanyProfile(null);
      }
    } else {
      safeRemoveStorageItem(LOCAL_STORAGE_USER_KEY);
      safeRemoveStorageItem(CACHED_USER_KEY);
      safeRemoveStorageItem(CACHED_TECH_PROFILE_KEY);
      safeRemoveStorageItem(CACHED_COMPANY_PROFILE_KEY);
      setCurrentTechProfile(null);
      setCurrentCompanyProfile(null);
    }
  }, [currentUser?.uid, currentUser?.role, currentUser?.tipo, currentUser?.tipoConta, techList, companyList]);

  // Keep local storage synchronized with current lists (fallback)
  useEffect(() => {
    if (!isFirebaseConfigured) {
      safeSetStorageItem('tecnicamz_users', usersList);
    }
  }, [usersList]);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      safeSetStorageItem('tecnicamz_technicians', techList);
    }
  }, [techList]);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      safeSetStorageItem('tecnicamz_companies', companyList);
    }
  }, [companyList]);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      safeSetStorageItem('tecnicamz_solicitacoes_selo', solicitacoesSelo);
    }
  }, [solicitacoesSelo]);

  const loginAsClient = (clientName: string): { success: boolean; user: User } => {
    const trimmedName = (clientName || '').trim() || 'Cliente';
    if (typeof window !== 'undefined') {
      localStorage.setItem('clienteNome', trimmedName);
    }
    const clientUser: User = {
      uid: `client_${Date.now()}`,
      name: trimmedName,
      email: '',
      phone: '',
      role: 'client',
      tipoConta: 'cliente',
      statusAprovacao: 'aprovado',
      statusConta: 'ativa',
      status: 'active',
      createdAt: new Date().toISOString()
    };
    setCurrentUser(clientUser);
    safeSetStorageItem(LOCAL_STORAGE_USER_KEY, clientUser.uid);
    setUsersList(prev => {
      const filtered = prev.filter(u => u.uid !== clientUser.uid);
      return [clientUser, ...filtered];
    });
    return { success: true, user: clientUser };
  };

  const carregarPainelEmpresa = (userData: any) => {
    if (typeof window !== 'undefined') {
      if (window.location.hash !== '#empresa') {
        window.location.hash = '#empresa';
      }
      if (typeof window.applyRoleBasedUI === 'function') {
        window.applyRoleBasedUI('empresa');
      }
    }
  };

  const carregarPainelTecnico = (userData: any) => {
    if (typeof window !== 'undefined') {
      if (window.location.hash !== '#tecnico') {
        window.location.hash = '#tecnico';
      }
      if (typeof window.applyRoleBasedUI === 'function') {
        window.applyRoleBasedUI('tecnico');
      }
    }
  };

  const carregarPainelCliente = (userData: any) => {
    if (typeof window !== 'undefined') {
      if (window.location.hash !== '#cliente') {
        window.location.hash = '#cliente';
      }
      if (typeof window.applyRoleBasedUI === 'function') {
        window.applyRoleBasedUI('cliente');
      }
    }
  };

  const liberarAcessoApp = (user: User) => {
    setCurrentUser(user);
    safeSetStorageItem(LOCAL_STORAGE_USER_KEY, user.uid);
    const sanitized = sanitizeUserForCache(user);
    if (sanitized) {
      safeSetStorageItem(CACHED_USER_KEY, sanitized);
    }
    setUsersList(prev => {
      const existingIndex = prev.findIndex(u => u.uid === user.uid || (u.email && user.email && u.email.toLowerCase() === user.email.toLowerCase()));
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], ...user };
        return updated;
      }
      return [user, ...prev];
    });

    if (typeof window !== 'undefined') {
      const currentHash = (window.location.hash || '').replace(/^#/, '');
      const savedLastRoute = localStorage.getItem('tecnicamz_last_route');
      if (savedLastRoute && !currentHash) {
        window.location.hash = `#${savedLastRoute}`;
        return;
      }
      if (!currentHash || currentHash === 'login' || currentHash === 'auth') {
        const rawTipo = user.tipo || (user.role === 'company' || user.tipoConta === 'empresa' ? 'empresa' : user.role === 'client' || user.tipoConta === 'cliente' ? 'cliente' : 'tecnico');
        switch (rawTipo) {
          case 'empresa':
            carregarPainelEmpresa(user);
            break;
          case 'tecnico':
            if (user.role === 'super_admin' || user.role === 'admin') {
              window.location.hash = '#gestao-pro-mz';
            } else {
              carregarPainelTecnico(user);
            }
            break;
          case 'cliente':
            carregarPainelCliente(user);
            break;
          default:
            if (user.role === 'super_admin' || user.role === 'admin') {
              window.location.hash = '#gestao-pro-mz';
            } else {
              carregarPainelTecnico(user);
            }
        }
      }
    }
  };

  // Firebase auth state listener com sincronização em tempo real de aprovação do Selo
  useEffect(() => {
    let profileUnsub: (() => void) | null = null;
    let isMounted = true;

    const watchdogTimer = setTimeout(() => {
      if (isMounted) {
        setIsLoading(false);
      }
    }, 3000);

    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(
        auth,
        async (fbUser) => {
          try {
            if (typeof window !== 'undefined' && (window.isCreatingAccount || window.isRegistering)) {
              return;
            }

            if (profileUnsub) {
              profileUnsub();
              profileUnsub = null;
            }

            if (fbUser) {
              const normalizedEmail = (fbUser.email || '').trim().toLowerCase();
              const defaultName = fbUser.displayName || (normalizedEmail ? normalizedEmail.split('@')[0] : 'Técnico MZ');
              const isSuperAdminEmail = normalizedEmail === 'andrezefaniasjuniorr@gmail.com';

              const cachedMatch = usersList.find(u => u.uid === fbUser.uid || (u.email && u.email.toLowerCase() === normalizedEmail));
              const cachedTipo = cachedMatch?.tipo || cachedMatch?.tipoConta || (cachedMatch?.role === 'company' ? 'empresa' : undefined);

              const fallbackUser: User = {
                uid: fbUser.uid,
                name: cachedMatch?.name || defaultName,
                email: normalizedEmail,
                phone: cachedMatch?.phone || fbUser.phoneNumber || '',
                role: isSuperAdminEmail ? 'super_admin' : (cachedTipo === 'empresa' ? 'company' : (cachedTipo === 'cliente' ? 'client' : 'technician')),
                tipo: cachedTipo || (isSuperAdminEmail ? 'tecnico' : 'tecnico'),
                tipoConta: (cachedTipo as any) || (isSuperAdminEmail ? 'tecnico' : 'tecnico'),
                statusAprovacao: 'aprovado',
                statusConta: 'ativa',
                status: 'active',
                isTrialActive: cachedMatch?.isTrialActive !== undefined ? cachedMatch.isTrialActive : false,
                trialStart: cachedMatch?.trialStart || null,
                temAcessoTrial: cachedMatch?.temAcessoTrial,
                trialExpirado: cachedMatch?.trialExpirado,
                diasRestantesTrial: cachedMatch?.diasRestantesTrial,
                createdAt: cachedMatch?.createdAt || new Date().toISOString()
              };

              try {
                if (db) {
                  const userRef = doc(db, 'usuarios', fbUser.uid);
                  const usersRef = doc(db, 'users', fbUser.uid);
                  const tecnicosRef = doc(db, 'tecnicos', fbUser.uid);
                  const techniciansRef = doc(db, 'technicians', fbUser.uid);

                  let userSnap = await safeGetDoc(userRef, 2, 400);
                  let usersSnap = await safeGetDoc(usersRef, 2, 400);
                  let tecnicosSnap = await safeGetDoc(tecnicosRef, 2, 400);
                  let techniciansSnap = await safeGetDoc(techniciansRef, 2, 400);

                  const usuarioData = (userSnap && userSnap.exists()) ? userSnap.data() : {};
                  const usersData = (usersSnap && usersSnap.exists()) ? usersSnap.data() : {};
                  const tecnicosData = (tecnicosSnap && tecnicosSnap.exists()) ? tecnicosSnap.data() : {};
                  const techniciansData = (techniciansSnap && techniciansSnap.exists()) ? techniciansSnap.data() : {};
                  const rawData = { ...usuarioData, ...usersData, ...techniciansData, ...tecnicosData };

                  let hasCompanyDoc = false;
                  if (rawData.tipo !== 'empresa' && rawData.tipoConta !== 'empresa' && rawData.role !== 'company') {
                    const compCheck = await safeGetDoc(doc(db, 'companies', fbUser.uid), 1, 300);
                    const empCheck = await safeGetDoc(doc(db, 'empresas', fbUser.uid), 1, 300);
                    hasCompanyDoc = Boolean((compCheck && compCheck.exists()) || (empCheck && empCheck.exists()));
                  }

                  const isSuper = isSuperAdminEmail || rawData.role === 'super_admin' || rawData.tipoConta === 'super_admin';
                  const rawTipo = String(rawData.tipo || rawData.tipoConta || rawData.tipo_cadastro || rawData.role || (hasCompanyDoc ? 'empresa' : '')).toLowerCase().trim();

                  let tipo: 'empresa' | 'tecnico' | 'cliente';
                  let tipoConta: 'empresa' | 'tecnico' | 'cliente';
                  let role: UserRole;

                  if (isSuper) {
                    tipo = 'tecnico';
                    tipoConta = 'tecnico';
                    role = 'super_admin';
                  } else if (rawTipo === 'empresa' || rawTipo === 'company' || rawData.tipo === 'empresa' || rawData.tipoConta === 'empresa' || rawData.role === 'company' || hasCompanyDoc) {
                    tipo = 'empresa';
                    tipoConta = 'empresa';
                    role = 'company';
                  } else if (rawTipo === 'cliente' || rawTipo === 'client' || rawData.tipo === 'cliente' || rawData.tipoConta === 'cliente' || rawData.role === 'client') {
                    tipo = 'cliente';
                    tipoConta = 'cliente';
                    role = 'client';
                  } else if (rawTipo === 'admin' || rawData.role === 'admin') {
                    tipo = 'tecnico';
                    tipoConta = 'tecnico';
                    role = 'admin';
                  } else {
                    tipo = 'tecnico';
                    tipoConta = 'tecnico';
                    role = 'technician';
                  }

                  const statusAprovacao = isSuper ? 'aprovado' : (rawData.statusAprovacao || (rawData.status === 'pending_approval' ? 'pendente' : 'aprovado'));
                  const parsedUserExp = typeof rawData.experienceYears === 'number' ? rawData.experienceYears : (typeof rawData.anosExperiencia === 'number' ? rawData.anosExperiencia : undefined);

                  const hasSeloActive = isSuper || Boolean(rawData.temSeloMZ || rawData.statusSelo === 'aprovado' || rawData.isVerified || rawData.verificationStatus === 'approved');

                  // Cálculo preciso dos 3 dias grátis a partir do trialStart
                  const userTrialStart = rawData.trialStart || tecnicosData.trialStart || usersData.trialStart || null;
                  let calculatedTrial = userTrialStart ? calcularDiasRestantesTrial(userTrialStart) : null;
                  if (!calculatedTrial && (rawData.createdAt || rawData.criado_em)) {
                    calculatedTrial = calcularDiasRestantesTrial(rawData.createdAt || rawData.criado_em);
                  }

                  const finalTemAcessoTrial = isSuper ? true : (
                    calculatedTrial ? calculatedTrial.temAcessoTrial : Boolean(rawData.temAcessoTrial ?? (rawData.isTrialActive !== false))
                  );
                  const finalTrialExpirado = isSuper ? false : (
                    calculatedTrial ? calculatedTrial.trialExpirado : Boolean(rawData.trialExpirado ?? !finalTemAcessoTrial)
                  );
                  const finalDiasRestantes = isSuper ? 3 : (
                    calculatedTrial ? calculatedTrial.diasRestantes : (typeof rawData.diasRestantes === 'number' ? rawData.diasRestantes : (typeof rawData.diasRestantesTrial === 'number' ? rawData.diasRestantesTrial : 0))
                  );

                  const firestoreUserData: User = {
                    uid: fbUser.uid,
                    name: rawData.nome_completo || rawData.nome_empresa || rawData.name || rawData.nome || (tipo === 'empresa' ? 'Empresa Registada' : defaultName),
                    nome: rawData.nome_completo || rawData.nome_empresa || rawData.nome || rawData.name || (tipo === 'empresa' ? 'Empresa Registada' : defaultName),
                    email: normalizedEmail,
                    phone: rawData.telefone_whatsapp || rawData.telefone_empresa || rawData.phone || rawData.telefone || fbUser.phoneNumber || '',
                    nuit: rawData.nuit || rawData.nuit_empresa || '',
                    role: role,
                    tipo: tipo,
                    tipoConta: tipoConta,
                    statusAprovacao: statusAprovacao,
                    statusConta: hasSeloActive ? 'ativa' : (rawData.statusConta || 'ativa'),
                    status: rawData.status || (statusAprovacao === 'pendente' ? 'pending_approval' : 'active'),
                    adminSubRole: isSuper ? 'super_admin' : rawData.adminSubRole,
                    specialty: rawData.especialidade_principal || rawData.specialty || rawData.especialidade || (role === 'technician' ? 'Eletricidade' : undefined),
                    experienceYears: parsedUserExp,
                    anosExperiencia: parsedUserExp,
                    province: rawData.provincia || rawData.province || '',
                    city: rawData.cidade_distrito || rawData.city || rawData.cidade || '',
                    avatarUrl: rawData.avatarUrl || rawData.photoURL || rawData.fotoUrl || rawData.foto || fbUser.photoURL || undefined,
                    photoURL: rawData.photoURL || rawData.avatarUrl || rawData.fotoUrl || rawData.foto || fbUser.photoURL || undefined,
                    isVerified: hasSeloActive,
                    temSeloMZ: hasSeloActive,
                    statusSelo: isSuper ? 'aprovado' : (hasSeloActive ? 'aprovado' : (rawData.statusSelo || 'nenhum')),
                    verifiedAt: parseDateToIso(rawData.verifiedAt || rawData.dataSeloAprovacao),
                    verifiedUntil: parseDateToIso(rawData.verifiedUntil),
                    dataSeloAprovacao: parseDateToIso(rawData.dataSeloAprovacao || rawData.verifiedAt),
                    subscriptionExpiresAt: parseDateToIso(rawData.subscriptionExpiresAt || rawData.dataExpiracao || rawData.verifiedUntil),
                    dataExpiracao: parseDateToIso(rawData.dataExpiracao || rawData.subscriptionExpiresAt || rawData.verifiedUntil),
                    statusAssinatura: hasSeloActive ? 'ativa' : (rawData.statusAssinatura || 'none'),
                    subscriptionStatus: hasSeloActive ? 'active' : (rawData.subscriptionStatus || 'none'),
                    activePlanId: rawData.activePlanId || (hasSeloActive ? 'pro' : undefined),

                    // Controle Estrito dos 3 Dias Grátis
                    trialStart: userTrialStart || rawData.trialStart || null,
                    temAcessoTrial: finalTemAcessoTrial,
                    trialExpirado: finalTrialExpirado,
                    diasRestantes: finalDiasRestantes,
                    diasRestantesTrial: finalDiasRestantes,
                    isTrialActive: finalTemAcessoTrial,

                    dataSeloEnvio: rawData.dataSeloEnvio,
                    motivoRejeicaoSelo: rawData.motivoRejeicaoSelo,
                    mensagemTransacaoSelo: rawData.mensagemTransacaoSelo,
                    operadoraSelo: rawData.operadoraSelo,
                    totalLikes: typeof rawData.totalLikes === 'number' ? rawData.totalLikes : (typeof rawData.likesCount === 'number' ? rawData.likesCount : (typeof rawData.curtidas === 'number' ? rawData.curtidas : 0)),
                    likesCount: typeof rawData.likesCount === 'number' ? rawData.likesCount : (typeof rawData.totalLikes === 'number' ? rawData.totalLikes : (typeof rawData.curtidas === 'number' ? rawData.curtidas : 0)),
                    scoreEngajamento: typeof rawData.scoreEngajamento === 'number' ? rawData.scoreEngajamento : (typeof rawData.points === 'number' ? rawData.points : (typeof rawData.pontos === 'number' ? rawData.pontos : 0)),
                    pontos: typeof rawData.pontos === 'number' ? rawData.pontos : (typeof rawData.points === 'number' ? rawData.points : (typeof rawData.scoreEngajamento === 'number' ? rawData.scoreEngajamento : 0)),
                    points: typeof rawData.points === 'number' ? rawData.points : (typeof rawData.pontos === 'number' ? rawData.pontos : (typeof rawData.scoreEngajamento === 'number' ? rawData.scoreEngajamento : 0)),
                    stars: typeof rawData.stars === 'number' ? rawData.stars : Math.min(5, Math.floor(((rawData.points ?? rawData.pontos ?? rawData.scoreEngajamento ?? 0) / 200))),
                    badges: rawData.badges || { excelente: 0, util: 0, tecnico: 0 },
                    streakCount: typeof rawData.streakCount === 'number' ? rawData.streakCount : (typeof rawData.sequenciaDias === 'number' ? rawData.sequenciaDias : 1),
                    lastLoginDate: rawData.lastLoginDate || rawData.ultimoAcesso || '',
                    createdAt: parseDateToIso(rawData.createdAt || rawData.criadoEm || rawData.dataCadastro),
                    updatedAt: rawData.updatedAt
                  } as any;

                  // Ouvinte em tempo real do perfil para refletir aprovação do Selo MZ instantaneamente
                  try {
                    profileUnsub = onSnapshot(usersRef, (liveSnap) => {
                      if (liveSnap.exists()) {
                        const live = liveSnap.data() || {};
                        const liveSeloApproved = Boolean(
                          live.statusSelo === 'aprovado' ||
                          live.temSeloMZ ||
                          live.isVerified ||
                          live.statusAssinatura === 'ativa' ||
                          live.subscriptionStatus === 'active'
                        );

                        setCurrentUser(prev => {
                          if (!prev) return prev;
                          return {
                            ...prev,
                            name: live.name || live.nome || prev.name,
                            phone: live.phone || live.telefone || prev.phone,
                            avatarUrl: live.avatarUrl || live.photoURL || prev.avatarUrl,
                            photoURL: live.photoURL || live.avatarUrl || prev.photoURL,
                            idade: typeof live.idade === 'number' ? live.idade : prev.idade,
                            experienceYears: typeof live.experienceYears === 'number' ? live.experienceYears : (typeof live.anosExperiencia === 'number' ? live.anosExperiencia : (prev as any).experienceYears),
                            anosExperiencia: typeof live.anosExperiencia === 'number' ? live.anosExperiencia : (typeof live.experienceYears === 'number' ? live.experienceYears : (prev as any).anosExperiencia),
                            province: live.province || live.provincia || prev.province,
                            city: live.city || live.cidade || prev.city,
                            specialties: Array.isArray(live.specialties) ? live.specialties : (live.especialidade ? [live.especialidade] : prev.specialties),
                            bio: live.bio || prev.bio,
                            whatsapp: live.whatsapp || prev.whatsapp,
                            temSeloMZ: Boolean(liveSeloApproved || prev.temSeloMZ),
                            isVerified: Boolean(liveSeloApproved || prev.isVerified),
                            statusSelo: liveSeloApproved ? ('aprovado' as const) : (live.statusSelo || prev.statusSelo),
                            statusAprovacao: live.statusAprovacao || prev.statusAprovacao,
                            statusConta: liveSeloApproved ? ('ativa' as const) : (live.statusConta || prev.statusConta),
                            status: liveSeloApproved ? ('active' as const) : (live.status || prev.status),
                            statusAssinatura: liveSeloApproved ? 'ativa' : (live.statusAssinatura || prev.statusAssinatura),
                            subscriptionStatus: liveSeloApproved ? ('active' as const) : (live.subscriptionStatus || prev.subscriptionStatus),
                            verifiedUntil: parseDateToIso(live.verifiedUntil) || prev.verifiedUntil,
                            verifiedAt: parseDateToIso(live.verifiedAt || live.dataSeloAprovacao) || prev.verifiedAt,
                            dataSeloAprovacao: parseDateToIso(live.dataSeloAprovacao || live.verifiedAt) || prev.dataSeloAprovacao,
                            subscriptionExpiresAt: parseDateToIso(live.subscriptionExpiresAt || live.dataExpiracao || live.verifiedUntil) || prev.subscriptionExpiresAt,
                            dataExpiracao: parseDateToIso(live.dataExpiracao || live.subscriptionExpiresAt || live.verifiedUntil) || prev.dataExpiracao,
                            activePlanId: live.activePlanId || live.plano || prev.activePlanId,
                            isTrialActive: live.isTrialActive !== undefined ? Boolean(live.isTrialActive) : prev.isTrialActive,
                            totalLikes: typeof live.totalLikes === 'number' ? live.totalLikes : prev.totalLikes,
                            likesCount: typeof live.likesCount === 'number' ? live.likesCount : prev.likesCount,
                            scoreEngajamento: typeof live.scoreEngajamento === 'number' ? live.scoreEngajamento : prev.scoreEngajamento,
                            pontos: typeof live.pontos === 'number' ? live.pontos : prev.pontos,
                            points: typeof live.points === 'number' ? live.points : prev.points,
                            stars: typeof live.stars === 'number' ? live.stars : prev.stars,
                            badges: live.badges || prev.badges,
                            streakCount: typeof live.streakCount === 'number' ? live.streakCount : prev.streakCount,
                            lastLoginDate: live.lastLoginDate || prev.lastLoginDate
                          };
                        });
                      }
                    }, (syncErr) => {
                      console.warn("Erro Firestore ignorado:", syncErr);
                    });
                  } catch (liveErr) {
                    console.warn('Aviso ao iniciar ouvinte em tempo real do perfil:', liveErr);
                  }

                  liberarAcessoApp(firestoreUserData);
                }
              } catch (error: any) {
                console.warn("Aviso na verificação do perfil, mantendo acesso do Auth:", error?.message || error);
                liberarAcessoApp(fallbackUser);
              }
            } else {
              const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;
              const cached = safeGetStorageItem<User | null>(CACHED_USER_KEY, null);
              if (isOffline && cached && cached.uid) {
                return;
              }

              const savedClientName = typeof window !== 'undefined' ? localStorage.getItem('clienteNome') : null;
              if (savedClientName) {
                const clientUser: User = {
                  uid: `client_${savedClientName.toLowerCase().replace(/\s+/g, '_')}`,
                  name: savedClientName,
                  email: '',
                  phone: '',
                  role: 'client',
                  tipoConta: 'cliente',
                  statusAprovacao: 'aprovado',
                  statusConta: 'ativa',
                  status: 'active',
                  createdAt: new Date().toISOString()
                };
                setCurrentUser(clientUser);
              } else {
                setCurrentUser(null);
                safeRemoveStorageItem(LOCAL_STORAGE_USER_KEY);
                safeRemoveStorageItem(CACHED_USER_KEY);
                safeRemoveStorageItem(CACHED_TECH_PROFILE_KEY);
                safeRemoveStorageItem(CACHED_COMPANY_PROFILE_KEY);
              }
            }
          } catch (unhandledAuthErr) {
            console.warn('[Auth] Erro inesperado em onAuthStateChanged:', unhandledAuthErr);
          } finally {
            if (isMounted) {
              clearTimeout(watchdogTimer);
              setIsLoading(false);
            }
          }
        },
        (authError) => {
          console.warn('[Auth] Erro no listener onAuthStateChanged:', authError);
          if (isMounted) {
            clearTimeout(watchdogTimer);
            setIsLoading(false);
          }
        }
      );

      return () => {
        isMounted = false;
        clearTimeout(watchdogTimer);
        unsubscribe();
        if (profileUnsub) {
          profileUnsub();
        }
      };
    } else {
      clearTimeout(watchdogTimer);
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password?: string): Promise<{ success: boolean; error?: string; user?: User }> => {
    setIsLoading(true);
    try {
      const normalizedEmail = (email || '').trim().toLowerCase();

      if (isFirebaseConfigured && auth && password) {
        try {
          const userCredential = await signInWithEmailAndPassword(auth, normalizedEmail, password);
          const fbUser = userCredential.user;

          let foundUser: User | null = null;
          const defaultName = fbUser.displayName || (normalizedEmail ? normalizedEmail.split('@')[0] : 'Técnico MZ');
          const isSuperAdminEmail = normalizedEmail === 'andrezefaniasjuniorr@gmail.com';

          if (db) {
            try {
              const userRef = doc(db, 'usuarios', fbUser.uid);
              const usersRef = doc(db, 'users', fbUser.uid);
              const tecnicosRef = doc(db, 'tecnicos', fbUser.uid);
              const techniciansRef = doc(db, 'technicians', fbUser.uid);

              let userSnap = await safeGetDoc(userRef, 2, 400);
              let usersSnap = await safeGetDoc(usersRef, 2, 400);
              let tecnicosSnap = await safeGetDoc(tecnicosRef, 2, 400);
              let techniciansSnap = await safeGetDoc(techniciansRef, 2, 400);

              const usuarioData = (userSnap && userSnap.exists()) ? userSnap.data() : {};
              const usersData = (usersSnap && usersSnap.exists()) ? usersSnap.data() : {};
              const tecnicosData = (tecnicosSnap && tecnicosSnap.exists()) ? tecnicosSnap.data() : {};
              const techniciansData = (techniciansSnap && techniciansSnap.exists()) ? techniciansSnap.data() : {};
              const docData = { ...usuarioData, ...usersData, ...techniciansData, ...tecnicosData };

              let hasCompanyDoc = false;
              if (docData.tipo !== 'empresa' && docData.tipoConta !== 'empresa' && docData.role !== 'company') {
                const compCheck = await safeGetDoc(doc(db, 'companies', fbUser.uid), 1, 300);
                const empCheck = await safeGetDoc(doc(db, 'empresas', fbUser.uid), 1, 300);
                hasCompanyDoc = Boolean((compCheck && compCheck.exists()) || (empCheck && empCheck.exists()));
              }

              const rawTipo = String(docData.tipo || docData.tipoConta || docData.role || (hasCompanyDoc ? 'empresa' : '')).toLowerCase().trim();
              const isSuper = isSuperAdminEmail || rawTipo === 'super_admin' || docData.role === 'super_admin';

              let tipo: 'cliente' | 'tecnico' | 'empresa';
              let tipoConta: 'cliente' | 'tecnico' | 'empresa';
              let role: UserRole;

              if (isSuper) {
                tipo = 'tecnico';
                tipoConta = 'tecnico';
                role = 'super_admin';
              } else if (rawTipo === 'empresa' || rawTipo === 'company' || docData.tipo === 'empresa' || docData.tipoConta === 'empresa' || docData.role === 'company' || hasCompanyDoc) {
                tipo = 'empresa';
                tipoConta = 'empresa';
                role = 'company';
              } else if (rawTipo === 'cliente' || rawTipo === 'client' || docData.tipo === 'cliente' || docData.tipoConta === 'cliente' || docData.role === 'client') {
                tipo = 'cliente';
                tipoConta = 'cliente';
                role = 'client';
              } else if (rawTipo === 'admin' || docData.role === 'admin') {
                tipo = 'tecnico';
                tipoConta = 'tecnico';
                role = 'admin';
              } else {
                tipo = 'tecnico';
                tipoConta = 'tecnico';
                role = 'technician';
              }

              const statusAprovacao = isSuper ? 'aprovado' : (docData.statusAprovacao || (docData.status === 'pending_approval' ? 'pendente' : 'aprovado'));
              const parsedUserExp = typeof docData.experienceYears === 'number' ? docData.experienceYears : (typeof docData.anosExperiencia === 'number' ? docData.anosExperiencia : undefined);
              const hasSeloApproved = isSuper || Boolean(docData.temSeloMZ || docData.statusSelo === 'aprovado' || docData.isVerified);

              const docTrialStart = docData.trialStart || tecnicosData.trialStart || null;
              let calculatedTrial = docTrialStart ? calcularDiasRestantesTrial(docTrialStart) : null;
              if (!calculatedTrial && (docData.createdAt || docData.criado_em)) {
                calculatedTrial = calcularDiasRestantesTrial(docData.createdAt || docData.criado_em);
              }
              const finalTemAcessoTrial = isSuper ? true : (
                calculatedTrial ? calculatedTrial.temAcessoTrial : Boolean(docData.temAcessoTrial ?? (docData.isTrialActive !== false))
              );
              const finalTrialExpirado = isSuper ? false : (
                calculatedTrial ? calculatedTrial.trialExpirado : Boolean(docData.trialExpirado ?? !finalTemAcessoTrial)
              );
              const finalDiasRestantes = isSuper ? 3 : (
                calculatedTrial ? calculatedTrial.diasRestantes : (typeof docData.diasRestantes === 'number' ? docData.diasRestantes : (typeof docData.diasRestantesTrial === 'number' ? docData.diasRestantesTrial : 0))
              );

              foundUser = {
                uid: fbUser.uid,
                name: docData.name || docData.nome || docData.nome_completo || fbUser.displayName || (tipo === 'empresa' ? 'Empresa Registada' : defaultName),
                nome: docData.nome || docData.name || docData.nome_completo || fbUser.displayName || (tipo === 'empresa' ? 'Empresa Registada' : defaultName),
                email: normalizedEmail,
                phone: docData.phone || docData.telefone || docData.telefone_whatsapp || fbUser.phoneNumber || '',
                nuit: docData.nuit || docData.nuit_empresa || '',
                role: role,
                tipo: tipo,
                tipoConta: tipoConta,
                statusAprovacao: statusAprovacao,
                statusConta: hasSeloApproved ? 'ativa' : (docData.statusConta || 'ativa'),
                status: docData.status || (statusAprovacao === 'pendente' ? 'pending_approval' : 'active'),
                adminSubRole: isSuper ? 'super_admin' : docData.adminSubRole,
                specialty: docData.specialty || docData.especialidade || docData.especialidade_principal || (role === 'technician' ? 'Eletricidade' : undefined),
                experienceYears: parsedUserExp,
                anosExperiencia: parsedUserExp,
                province: docData.province || docData.provincia || '',
                city: docData.city || docData.cidade || docData.cidade_distrito || '',
                avatarUrl: docData.avatarUrl || docData.photoURL || docData.fotoUrl || docData.foto || fbUser.photoURL || undefined,
                photoURL: docData.photoURL || docData.avatarUrl || docData.fotoUrl || docData.foto || fbUser.photoURL || undefined,
                isVerified: hasSeloApproved,
                temSeloMZ: hasSeloApproved,
                statusSelo: isSuper ? 'aprovado' : (hasSeloApproved ? 'aprovado' : (docData.statusSelo || 'nenhum')),
                verifiedAt: parseDateToIso(docData.verifiedAt || docData.dataSeloAprovacao),
                verifiedUntil: parseDateToIso(docData.verifiedUntil),
                dataSeloAprovacao: parseDateToIso(docData.dataSeloAprovacao || docData.verifiedAt),
                subscriptionExpiresAt: parseDateToIso(docData.subscriptionExpiresAt || docData.dataExpiracao || docData.verifiedUntil),
                dataExpiracao: parseDateToIso(docData.dataExpiracao || docData.subscriptionExpiresAt || docData.verifiedUntil),
                subscriptionStatus: hasSeloApproved ? 'active' : (docData.subscriptionStatus || 'none'),
                statusAssinatura: hasSeloApproved ? 'ativa' : (docData.statusAssinatura || 'none'),
                activePlanId: docData.activePlanId || (hasSeloApproved ? 'pro' : undefined),

                // Controle Estrito dos 3 Dias Grátis
                trialStart: docTrialStart || null,
                temAcessoTrial: finalTemAcessoTrial,
                trialExpirado: finalTrialExpirado,
                diasRestantes: finalDiasRestantes,
                diasRestantesTrial: finalDiasRestantes,
                isTrialActive: finalTemAcessoTrial,

                createdAt: parseDateToIso(docData.createdAt || docData.criadoEm || docData.dataCadastro)
              } as any;
            } catch (err) {
              console.warn('Firestore lookup error in login:', err);
            }
          }

          if (!foundUser) {
            foundUser = {
              uid: fbUser.uid,
              name: defaultName,
              email: normalizedEmail,
              phone: '',
              role: isSuperAdminEmail ? 'super_admin' : 'technician',
              tipoConta: 'tecnico',
              statusAprovacao: 'aprovado',
              statusConta: 'ativa',
              status: 'active',
              isTrialActive: false,
              temAcessoTrial: false,
              trialExpirado: true,
              diasRestantesTrial: 0,
              createdAt: new Date().toISOString()
            };
          }

          liberarAcessoApp(foundUser);
          return { success: true, user: foundUser };
        } catch (fbErr: any) {
          return { success: false, error: fbErr.message || 'Falha na autenticação via Firebase.' };
        }
      }

      const match = usersList.find(u => (u.email || '').toLowerCase() === normalizedEmail && normalizedEmail);
      if (match) {
        liberarAcessoApp(match);
        return { success: true, user: match };
      }

      return { success: false, error: 'Nenhuma conta encontrada com este e-mail.' };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Falha ao autenticar.' };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: any): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const normalizedEmail = (data?.email || '').toString().trim().toLowerCase();
      const rawPhone = (data?.phone || '').toString().trim();

      // Bloqueio de novo teste grátis no mesmo celular
      const hasLocalFlag = typeof window !== 'undefined' && localStorage.getItem('tecnicaMZ_trial_usado') === 'true';
      const deviceJaTeveTrial = hasLocalFlag || (await checkDeviceTrialUsedAsync());

      let generatedUid = `user_${Date.now()}`;

      if (isFirebaseConfigured && auth && data.password) {
        const userCredential = await createUserWithEmailAndPassword(auth, normalizedEmail, data.password);
        generatedUid = userCredential.user.uid;
      }

      // Se o documento já existe, NUNCA regrave o trialStart
      let existingTecnicoSnap = null;
      if (isFirebaseConfigured && db) {
        existingTecnicoSnap = await safeGetDoc(doc(db, 'tecnicos', generatedUid), 1, 300).catch(() => null);
      }
      const existingData = (existingTecnicoSnap && existingTecnicoSnap.exists()) ? existingTecnicoSnap.data() : null;

      let finalTrialStart: any = null;
      let finalDiasRestantes = 0;
      let finalTemAcessoTrial = false;
      let finalTrialExpirado = true;

      if (existingData && existingData.trialStart) {
        // Documento já existe: preserva rigorosamente o trialStart original e NUNCA regrava
        finalTrialStart = existingData.trialStart;
        const calc = calcularDiasRestantesTrial(existingData.trialStart);
        finalDiasRestantes = calc.diasRestantes;
        finalTemAcessoTrial = calc.temAcessoTrial;
        finalTrialExpirado = calc.trialExpirado;
      } else if (deviceJaTeveTrial) {
        // SE JÁ TEVE TRIAL NESTE CELULAR: Crie a conta com trialStart = null, diasRestantes = 0, temAcessoTrial = false, trialExpirado = true. NÃO dê 3 dias.
        finalTrialStart = null;
        finalDiasRestantes = 0;
        finalTemAcessoTrial = false;
        finalTrialExpirado = true;
      } else {
        // SE NUNCA TEVE: Dê os 3 dias normalmente e grave a flag
        finalTrialStart = serverTimestamp ? serverTimestamp() : new Date().toISOString();
        finalDiasRestantes = 3;
        finalTemAcessoTrial = true;
        finalTrialExpirado = false;
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('tecnicaMZ_trial_usado', 'true');
          } catch {}
        }
        await markDeviceTrialUsed();
      }

      const defaultName = data.name?.trim() || normalizedEmail.split('@')[0];
      const isAutoApproved = data.role === 'client' || data.role === 'super_admin' || data.role === 'admin';
      const statusAprovacao = isAutoApproved ? 'aprovado' : 'pendente';
      const status: UserStatus = isAutoApproved ? 'active' : 'pending_approval';

      const newUser: User = {
        uid: generatedUid,
        name: defaultName,
        nome: defaultName,
        email: normalizedEmail,
        phone: rawPhone,
        role: data.role || 'technician',
        tipoConta: data.tipoConta || 'tecnico',
        tipo: data.tipo || 'tecnico',
        status: status,
        statusAprovacao: statusAprovacao,
        statusConta: 'ativa',
        isVerified: false,
        temSeloMZ: false,
        statusSelo: 'nenhum',
        trialStart: finalTrialStart,
        diasRestantesTrial: finalDiasRestantes,
        temAcessoTrial: finalTemAcessoTrial,
        trialExpirado: finalTrialExpirado,
        isTrialActive: finalTemAcessoTrial,
        createdAt: new Date().toISOString()
      } as any;

      if (isFirebaseConfigured && db) {
        const extraPayload = {
          ...newUser,
          specialty: data.specialty || 'Eletricidade',
          specialties: data.specialty ? [data.specialty] : ['Eletricidade'],
          diasRestantes: finalDiasRestantes
        };
        await safeSetDoc(doc(db, 'tecnicos', generatedUid), extraPayload);
        await safeSetDoc(doc(db, 'users', generatedUid), newUser);
        await safeSetDoc(doc(db, 'usuarios', generatedUid), newUser);
        if (data.role === 'technician') {
          await setDoc(doc(db, 'technicians', generatedUid), extraPayload, { merge: true });
        }
      }

      liberarAcessoApp(newUser);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Falha ao registar conta.' };
    } finally {
      setIsLoading(false);
    }
  };

  const cadastrarEmpresa = async (
    email: string,
    senha: string,
    dadosEmpresa: any
  ): Promise<{ success: boolean; user?: any; error?: string }> => {
    setIsLoading(true);
    try {
      const normalizedEmail = (email || '').toString().trim().toLowerCase();
      const nomeEmpresa = (typeof dadosEmpresa === 'object' ? (dadosEmpresa?.nome || dadosEmpresa?.name) : dadosEmpresa) || 'Empresa';

      let generatedUid = `company_${Date.now()}`;
      if (isFirebaseConfigured && auth && senha) {
        const userCredential = await createUserWithEmailAndPassword(auth, normalizedEmail, senha);
        generatedUid = userCredential.user.uid;
      }

      const newCompanyUser: User = {
        uid: generatedUid,
        name: nomeEmpresa,
        email: normalizedEmail,
        phone: dadosEmpresa?.telefone || '',
        role: 'company',
        tipo: 'empresa',
        tipoConta: 'empresa',
        status: 'pending_approval',
        statusAprovacao: 'pendente',
        statusConta: 'ativa',
        isVerified: false,
        temSeloMZ: false,
        statusSelo: 'nenhum',
        createdAt: new Date().toISOString()
      };

      if (isFirebaseConfigured && db) {
        await safeSetDoc(doc(db, 'users', generatedUid), newCompanyUser);
        await safeSetDoc(doc(db, 'companies', generatedUid), { userId: generatedUid, companyName: nomeEmpresa, ...dadosEmpresa });
      }

      liberarAcessoApp(newCompanyUser);
      return { success: true, user: newCompanyUser };
    } catch (error: any) {
      return { success: false, error: error?.message || 'Falha ao cadastrar empresa.' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      if (isFirebaseConfigured && auth) {
        await signOut(auth);
      }
    } catch (err) {
      console.warn('Sign out error:', err);
    } finally {
      setCurrentUser(null);
      setCurrentTechProfile(null);
      setCurrentCompanyProfile(null);
      safeRemoveStorageItem(LOCAL_STORAGE_USER_KEY);
      safeRemoveStorageItem(CACHED_USER_KEY);
      safeRemoveStorageItem(CACHED_TECH_PROFILE_KEY);
      safeRemoveStorageItem(CACHED_COMPANY_PROFILE_KEY);
      safeRemoveStorageItem(LAST_ROUTE_KEY);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('clienteNome');
        window.location.hash = '';
      }
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      if (isFirebaseConfigured && auth) {
        await sendPasswordResetEmail(auth, email.trim().toLowerCase());
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Erro ao enviar e-mail de recuperação.' };
    }
  };

  const changePassword = async (newPassword: string) => {
    try {
      if (isFirebaseConfigured && auth?.currentUser) {
        await fbUpdatePassword(auth.currentUser, newPassword);
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Erro ao alterar a palavra-passe.' };
    }
  };

  const updateCurrentUserProfile = async (data: Partial<User>) => {
    if (!currentUser) return;
    const nowIso = new Date().toISOString();
    const updated = { ...currentUser, ...data, updatedAt: nowIso };
    setCurrentUser(updated);
    setUsersList(prev => prev.map(u => (u.uid === currentUser.uid ? updated : u)));

    if (isFirebaseConfigured && db) {
      await setDoc(doc(db, 'users', currentUser.uid), { ...data, updatedAt: nowIso }, { merge: true }).catch(() => {});
      await setDoc(doc(db, 'usuarios', currentUser.uid), { ...data, updatedAt: nowIso }, { merge: true }).catch(() => {});
    }
  };

  const updateCurrentTechProfile = async (data: Partial<TechnicianProfile>) => {
    if (!currentUser) return;
    const nowIso = new Date().toISOString();
    const updated: TechnicianProfile = {
      ...(currentTechProfile || ({} as TechnicianProfile)),
      ...data,
      userId: currentUser.uid,
      updatedAt: nowIso
    };
    setCurrentTechProfile(updated);
    if (isFirebaseConfigured && db) {
      await setDoc(doc(db, 'technicians', currentUser.uid), updated, { merge: true }).catch(() => {});
    }
  };

  const updateCurrentCompanyProfile = async (data: Partial<CompanyProfile>) => {
    if (!currentUser) return;
    const updated: CompanyProfile = {
      ...(currentCompanyProfile || ({} as CompanyProfile)),
      ...data,
      userId: currentUser.uid,
      updatedAt: new Date().toISOString()
    };
    setCurrentCompanyProfile(updated);
    if (isFirebaseConfigured && db) {
      await setDoc(doc(db, 'companies', currentUser.uid), updated, { merge: true }).catch(() => {});
    }
  };

  const toggleTechnicianLike = async (
    techUserId: string
  ): Promise<{ success: boolean; totalLikes: number; hasLiked: boolean; error?: string }> => {
    if (!techUserId) return { success: false, totalLikes: 0, hasLiked: false, error: 'ID de técnico inválido.' };

    const currentVoterId = currentUser?.uid || (() => {
      let guestId = localStorage.getItem('tecnicamz_voter_uid');
      if (!guestId) {
        guestId = 'guest_' + Math.random().toString(36).substring(2, 9);
        localStorage.setItem('tecnicamz_voter_uid', guestId);
      }
      return guestId;
    })();

    const LIKE_STORAGE_KEY = 'tecnicamz_liked_techs_list';
    let likedList: string[] = [];
    try {
      const raw = localStorage.getItem(LIKE_STORAGE_KEY);
      if (raw) {
        likedList = JSON.parse(raw);
        if (!Array.isArray(likedList)) likedList = [];
      }
    } catch {
      likedList = [];
    }

    const targetTech = techList.find(t => t.userId === techUserId);
    const techLikedUsers = Array.isArray((targetTech as any)?.likedByUsers) ? (targetTech as any).likedByUsers : [];

    const alreadyLiked = techLikedUsers.includes(currentVoterId) || likedList.includes(techUserId);
    const willLike = !alreadyLiked;

    if (willLike) {
      if (!likedList.includes(techUserId)) likedList.push(techUserId);
    } else {
      likedList = likedList.filter(id => id !== techUserId);
    }
    try {
      localStorage.setItem(LIKE_STORAGE_KEY, JSON.stringify(likedList));
    } catch (e) {
      console.warn('Storage save error:', e);
    }

    let newLikes = targetTech?.totalLikes || 0;
    let newScore = targetTech?.scoreEngajamento || 0;
    try {
      const heartRes = await giveHeartOrLike(techUserId, willLike);
      if (heartRes.success) {
        newLikes = heartRes.likesCount;
        newScore = heartRes.points;
      } else {
        const delta = willLike ? 1 : -1;
        newLikes = Math.max(0, newLikes + delta);
        newScore = Math.max(0, newScore + delta);
      }
    } catch (err) {
      const delta = willLike ? 1 : -1;
      newLikes = Math.max(0, newLikes + delta);
      newScore = Math.max(0, newScore + delta);
    }

    setTechList(prev =>
      prev.map(t => {
        if (t.userId !== techUserId) return t;
        const currentVoters = Array.isArray((t as any).likedByUsers) ? (t as any).likedByUsers : [];
        const updatedVoters = willLike
          ? currentVoters.includes(currentVoterId)
            ? currentVoters
            : [...currentVoters, currentVoterId]
          : currentVoters.filter((id: string) => id !== currentVoterId);
        return {
          ...t,
          totalLikes: newLikes,
          scoreEngajamento: newScore,
          pontos: newScore,
          points: newScore,
          likedByUsers: updatedVoters
        } as any;
      })
    );

    setUsersList(prev =>
      prev.map(u =>
        u.uid === techUserId
          ? {
              ...u,
              totalLikes: newLikes,
              scoreEngajamento: newScore,
              pontos: newScore,
              points: newScore
            }
          : u
      )
    );

    if (currentUser?.uid === techUserId) {
      setCurrentUser(prev =>
        prev
          ? { ...prev, totalLikes: newLikes, scoreEngajamento: newScore, pontos: newScore, points: newScore }
          : null
      );
      setCurrentTechProfile(prev =>
        prev
          ? { ...prev, totalLikes: newLikes, scoreEngajamento: newScore, pontos: newScore, points: newScore }
          : null
      );
    }

    if (isFirebaseConfigured && db) {
      try {
        const likeDocId = `${techUserId}_${currentVoterId}`;
        const likeDocRef = doc(db, 'technician_likes', likeDocId);

        if (willLike) {
          await setDoc(likeDocRef, {
            techUserId,
            likedBy: currentVoterId,
            voterName: currentUser?.name || 'Cliente',
            likedAt: new Date().toISOString()
          }, { merge: true });

          await updateDoc(doc(db, 'technicians', techUserId), {
            likedByUsers: arrayUnion(currentVoterId),
            totalLikes: newLikes,
            scoreEngajamento: newScore,
            updatedAt: new Date().toISOString()
          } as any).catch(() => {});
        } else {
          await deleteDoc(likeDocRef).catch(() => {});

          await updateDoc(doc(db, 'technicians', techUserId), {
            likedByUsers: arrayRemove(currentVoterId),
            totalLikes: newLikes,
            scoreEngajamento: newScore,
            updatedAt: new Date().toISOString()
          } as any).catch(() => {});
        }

        await recalculateUserStarsAndRanking(techUserId);
      } catch (err) {
        console.warn('Firestore toggle technician like error:', err);
      }
    }

    return { success: true, hasLiked: willLike, totalLikes: newLikes };
  };

  const giveTechnicianLike = async (techUserId: string) => toggleTechnicianLike(techUserId);

  const switchUserRole = async (newRole: UserRole) => {
    if (!currentUser) return;
    const updated = { ...currentUser, role: newRole, updatedAt: new Date().toISOString() };
    setCurrentUser(updated);
    if (isFirebaseConfigured && db) {
      await updateDoc(doc(db, 'users', currentUser.uid), { role: newRole, updatedAt: new Date().toISOString() }).catch(() => {});
    }
  };

  const updateUserStatus = async (userId: string, status: UserStatus) => {
    setUsersList(prev => prev.map(u => (u.uid === userId ? { ...u, status } : u)));
    if (isFirebaseConfigured && db) {
      await updateDoc(doc(db, 'users', userId), { status, updatedAt: new Date().toISOString() }).catch(() => {});
    }
  };

  const approveUserAccount = async (userId: string) => {
    const nowIso = new Date().toISOString();
    setUsersList(prev =>
      prev.map(u =>
        u.uid === userId
          ? { ...u, statusAprovacao: 'aprovado', status: 'active', statusConta: 'ativa', updatedAt: nowIso }
          : u
      )
    );
    setTechList(prev =>
      prev.map(t =>
        t.userId === userId
          ? { ...t, statusAprovacao: 'aprovado', status: 'active', statusConta: 'ativa', updatedAt: nowIso }
          : t
      )
    );
    setCompanyList(prev =>
      prev.map(c =>
        c.userId === userId
          ? { ...c, statusAprovacao: 'aprovado', status: 'active', statusConta: 'ativa', updatedAt: nowIso }
          : c
      )
    );

    if (currentUser?.uid === userId) {
      setCurrentUser(prev =>
        prev ? { ...prev, statusAprovacao: 'aprovado', status: 'active', statusConta: 'ativa', updatedAt: nowIso } : null
      );
    }

    if (isFirebaseConfigured && db) {
      const updatePayload = {
        statusAprovacao: 'aprovado',
        status: 'active',
        statusConta: 'ativa',
        updatedAt: nowIso
      };
      await updateDoc(doc(db, 'users', userId), updatePayload).catch(() => {});
      await updateDoc(doc(db, 'usuarios', userId), updatePayload).catch(() => {});
      await updateDoc(doc(db, 'technicians', userId), updatePayload).catch(() => {});
      await updateDoc(doc(db, 'companies', userId), updatePayload).catch(() => {});
    }
  };

  const rejectUserAccount = async (userId: string, reason = '') => {
    const nowIso = new Date().toISOString();
    setUsersList(prev =>
      prev.map(u =>
        u.uid === userId
          ? { ...u, statusAprovacao: 'rejeitado', status: 'suspended', suspensionReason: reason, rejectionReason: reason, updatedAt: nowIso }
          : u
      )
    );

    if (currentUser?.uid === userId) {
      setCurrentUser(prev =>
        prev ? { ...prev, statusAprovacao: 'rejeitado', status: 'suspended', suspensionReason: reason, rejectionReason: reason, updatedAt: nowIso } : null
      );
    }

    if (isFirebaseConfigured && db) {
      const updatePayload = {
        statusAprovacao: 'rejeitado',
        status: 'suspended',
        suspensionReason: reason,
        rejectionReason: reason,
        updatedAt: nowIso
      };
      await updateDoc(doc(db, 'users', userId), updatePayload).catch(() => {});
      await updateDoc(doc(db, 'usuarios', userId), updatePayload).catch(() => {});
    }
  };

  const toggleUserVerification = async (userId: string) => {
    await grantSelo30Days(userId);
  };

  const grantTrial3Days = async (userId: string): Promise<{ success: boolean; error?: string }> => {
    const nowIso = new Date().toISOString();
    setUsersList(prev =>
      prev.map(u => (u.uid === userId ? { ...u, isTrialActive: true, createdAt: nowIso, updatedAt: nowIso } : u))
    );
    if (currentUser?.uid === userId) {
      setCurrentUser(prev => (prev ? { ...prev, isTrialActive: true, createdAt: nowIso, updatedAt: nowIso } : null));
    }
    if (isFirebaseConfigured && db) {
      await updateDoc(doc(db, 'users', userId), { isTrialActive: true, updatedAt: nowIso }).catch(() => {});
      await updateDoc(doc(db, 'usuarios', userId), { isTrialActive: true, updatedAt: nowIso }).catch(() => {});
      await updateDoc(doc(db, 'technicians', userId), { isTrialActive: true, updatedAt: nowIso }).catch(() => {});
    }
    return { success: true };
  };

  const revokeTrial = async (userId: string): Promise<{ success: boolean; error?: string }> => {
    const nowIso = new Date().toISOString();
    setUsersList(prev =>
      prev.map(u => (u.uid === userId ? { ...u, isTrialActive: false, updatedAt: nowIso } : u))
    );
    if (currentUser?.uid === userId) {
      setCurrentUser(prev => (prev ? { ...prev, isTrialActive: false, updatedAt: nowIso } : null));
    }
    if (isFirebaseConfigured && db) {
      await updateDoc(doc(db, 'users', userId), { isTrialActive: false, updatedAt: nowIso }).catch(() => {});
      await updateDoc(doc(db, 'usuarios', userId), { isTrialActive: false, updatedAt: nowIso }).catch(() => {});
      await updateDoc(doc(db, 'technicians', userId), { isTrialActive: false, updatedAt: nowIso }).catch(() => {});
    }
    return { success: true };
  };

  // ATIVAÇÃO ROBUSTA DO SELO MZ POR 30 DIAS
  const grantSelo30Days = async (userId: string): Promise<{ success: boolean; error?: string }> => {
    const now = new Date();
    const nowIso = now.toISOString();
    const verifiedUntilIso = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const approvalData = {
      isVerified: true,
      temSeloMZ: true,
      statusSelo: 'aprovado' as const,
      statusAprovacao: 'aprovado' as const,
      statusConta: 'ativa' as const,
      status: 'active' as UserStatus,
      statusAssinatura: 'ativa',
      subscriptionStatus: 'active' as const,
      verifiedAt: nowIso,
      verifiedUntil: verifiedUntilIso,
      dataSeloAprovacao: nowIso,
      subscriptionExpiresAt: verifiedUntilIso,
      dataExpiracao: verifiedUntilIso,
      activePlanId: 'pro',
      plano: 'pro',
      updatedAt: nowIso
    };

    setUsersList(prev => prev.map(u => (u.uid === userId ? { ...u, ...approvalData } : u)));
    setTechList(prev => prev.map(t => (t.userId === userId ? { ...t, ...approvalData, verificationStatus: 'approved' } : t)));
    setCompanyList(prev => prev.map(c => (c.userId === userId ? { ...c, ...approvalData, verificationStatus: 'verified' } : c)));

    if (currentUser?.uid === userId) {
      setCurrentUser(prev => (prev ? { ...prev, ...approvalData } : null));
    }

    if (isFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, 'users', userId), approvalData).catch(() => {});
        await updateDoc(doc(db, 'usuarios', userId), approvalData).catch(() => {});
        await updateDoc(doc(db, 'technicians', userId), {
          ...approvalData,
          verificationStatus: 'approved'
        }).catch(() => {});
        await updateDoc(doc(db, 'companies', userId), {
          ...approvalData,
          verificationStatus: 'verified'
        }).catch(() => {});
      } catch (err) {
        console.warn('grantSelo30Days error:', err);
      }
    }
    return { success: true };
  };

  const grantManualSubscription30Days = async (userId: string) => {
    await grantSelo30Days(userId);
  };

  const deleteUserAccount = async (userId: string) => {
    setUsersList(prev => prev.filter(u => u.uid !== userId));
    setTechList(prev => prev.filter(t => t.userId !== userId));
    setCompanyList(prev => prev.filter(c => c.userId !== userId));
    if (currentUser?.uid === userId) {
      setCurrentUser(null);
    }
    if (isFirebaseConfigured && db) {
      await deleteDoc(doc(db, 'users', userId)).catch(() => {});
      await deleteDoc(doc(db, 'usuarios', userId)).catch(() => {});
      await deleteDoc(doc(db, 'technicians', userId)).catch(() => {});
      await deleteDoc(doc(db, 'companies', userId)).catch(() => {});
    }
  };

  const isCompany = currentUser?.tipoConta === 'empresa' || currentUser?.role === 'company';
  const isTechnician = !isCompany && (currentUser?.tipoConta === 'tecnico' || currentUser?.role === 'technician');
  const isClient = !isCompany && !isTechnician && (currentUser?.tipoConta === 'cliente' || currentUser?.role === 'client');
  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'super_admin';
  const isSuperAdmin = currentUser?.role === 'super_admin' || currentUser?.adminSubRole === 'super_admin';
  const isFinanceAdmin = isSuperAdmin || currentUser?.adminSubRole === 'finance_admin';
  const isModerator = isSuperAdmin || currentUser?.adminSubRole === 'moderator';

  // 1. Verificação Rigorosa e Segura de Expiração do Selo MZ
  const isSeloExpired = React.useMemo<boolean>(() => {
    if (!currentUser) return false;
    if (
      currentUser.role === 'super_admin' ||
      currentUser.role === 'admin' ||
      currentUser.adminSubRole === 'super_admin' ||
      (currentUser.email && currentUser.email.toLowerCase() === 'andrezefaniasjuniorr@gmail.com')
    ) {
      return false;
    }

    // Se o selo está ativamente aprovado, só expira se a data for REALMENTE no passado
    const hasSeloApproved = Boolean(currentUser.temSeloMZ || currentUser.statusSelo === 'aprovado' || currentUser.isVerified);
    if (!hasSeloApproved) {
      if (currentUser.statusSelo === 'expirado') return true;
      return false;
    }

    let targetUntilMs: number | null = null;
    const rawUntil = currentUser.verifiedUntil || currentUser.subscriptionExpiresAt || currentUser.dataExpiracao;
    if (rawUntil) {
      const ms = parseDateToMillis(rawUntil);
      if (ms && ms > 0) targetUntilMs = ms;
    }

    if (!targetUntilMs) {
      const rawAt = currentUser.dataSeloAprovacao || currentUser.verifiedAt;
      if (rawAt) {
        const atMs = parseDateToMillis(rawAt);
        if (atMs && atMs > 0) {
          targetUntilMs = atMs + 30 * 24 * 60 * 60 * 1000;
        }
      }
    }

    // Se possui selo aprovado e a data é futura, NÃO está expirado
    if (targetUntilMs !== null && targetUntilMs > 0) {
      return Date.now() >= targetUntilMs;
    }

    return false;
  }, [currentUser]);

  // 2. Selo MZ Válido
  const isSeloValid = React.useMemo<boolean>(() => {
    if (!currentUser) return false;
    if (
      currentUser.role === 'super_admin' ||
      currentUser.role === 'admin' ||
      currentUser.adminSubRole === 'super_admin' ||
      (currentUser.email && currentUser.email.toLowerCase() === 'andrezefaniasjuniorr@gmail.com')
    ) {
      return true;
    }

    if (isSeloExpired) return false;
    return Boolean(currentUser.isVerified || currentUser.temSeloMZ || currentUser.statusSelo === 'aprovado');
  }, [currentUser, isSeloExpired]);

  const seloDaysRemaining = React.useMemo<number>(() => {
    if (!currentUser) return 0;
    if (
      currentUser.role === 'super_admin' ||
      currentUser.role === 'admin' ||
      currentUser.adminSubRole === 'super_admin' ||
      (currentUser.email && currentUser.email.toLowerCase() === 'andrezefaniasjuniorr@gmail.com')
    ) {
      return 30;
    }

    if (isSeloExpired) return 0;
    const hasSeloFlag = Boolean(currentUser.isVerified || currentUser.temSeloMZ || currentUser.statusSelo === 'aprovado');
    if (!hasSeloFlag) return 0;

    let targetUntilMs: number | null = null;
    const rawUntil = currentUser.verifiedUntil || currentUser.subscriptionExpiresAt || currentUser.dataExpiracao;
    if (rawUntil) {
      const ms = parseDateToMillis(rawUntil);
      if (ms && ms > 0) targetUntilMs = ms;
    }

    if (!targetUntilMs) {
      const rawAt = currentUser.dataSeloAprovacao || currentUser.verifiedAt;
      if (rawAt) {
        const atMs = parseDateToMillis(rawAt);
        if (atMs && atMs > 0) {
          targetUntilMs = atMs + 30 * 24 * 60 * 60 * 1000;
        }
      }
    }

    if (!targetUntilMs) return 30;
    const diffMs = targetUntilMs - Date.now();
    if (diffMs <= 0) return 0;
    return Math.max(1, Math.ceil(diffMs / (24 * 60 * 60 * 1000)));
  }, [currentUser, isSeloExpired]);

  const temSeloMZ = React.useMemo<boolean>(() => {
    if (isSeloExpired) return false;
    return isSeloValid;
  }, [isSeloValid, isSeloExpired]);

  const statusSelo = React.useMemo<'nenhum' | 'pendente_aprovacao' | 'aprovado' | 'rejeitado' | 'expirado'>(() => {
    if (!currentUser) return 'nenhum';
    if (isSeloExpired) return 'expirado';
    if (isSeloValid) return 'aprovado';
    return (currentUser.statusSelo as any) || 'nenhum';
  }, [currentUser, isSeloValid, isSeloExpired]);

  // 3. Teste Grátis (3 Dias)
  const trialCalc = React.useMemo(() => {
    if (!currentUser) {
      return { diasRestantes: 0, temAcessoTrial: false, trialExpirado: true };
    }
    // Admins bypass
    if (
      currentUser.role === 'super_admin' ||
      currentUser.role === 'admin' ||
      currentUser.adminSubRole === 'super_admin'
    ) {
      return { diasRestantes: 3, temAcessoTrial: true, trialExpirado: false };
    }

    // Se o usuário explicitamente já teve trial marcado como inativo/expirado
    if (currentUser.temAcessoTrial === false || currentUser.trialExpirado === true || currentUser.isTrialActive === false) {
      return { diasRestantes: 0, temAcessoTrial: false, trialExpirado: true };
    }

    // Calcula dinamicamente com base no trialStart (ou data de criação de fallback)
    const startVal = currentUser.trialStart || currentUser.createdAt || (currentUser as any).criado_em || (currentUser as any).criadoEm;
    if (!startVal) {
      return { diasRestantes: 0, temAcessoTrial: false, trialExpirado: true };
    }

    return calcularDiasRestantesTrial(startVal);
  }, [currentUser]);

  const isTrialActive = React.useMemo<boolean>(() => {
    if (!currentUser) return false;
    if (
      currentUser.role === 'super_admin' ||
      currentUser.role === 'admin' ||
      currentUser.adminSubRole === 'super_admin'
    ) {
      return true;
    }
    return trialCalc.temAcessoTrial;
  }, [currentUser, trialCalc]);

  const trialDaysRemaining = React.useMemo<number>(() => {
    if (!currentUser) return 0;
    if (
      currentUser.role === 'super_admin' ||
      currentUser.role === 'admin' ||
      currentUser.adminSubRole === 'super_admin'
    ) {
      return 3;
    }
    return trialCalc.diasRestantes;
  }, [currentUser, trialCalc]);

  const isTrialValid = React.useMemo<boolean>(() => {
    if (!currentUser) return false;
    if (
      currentUser.role === 'super_admin' ||
      currentUser.role === 'admin' ||
      currentUser.adminSubRole === 'super_admin'
    ) {
      return true;
    }
    return trialCalc.temAcessoTrial;
  }, [currentUser, trialCalc]);

  const isTrialExpired = React.useMemo<boolean>(() => {
    if (!currentUser) return false;
    if (
      currentUser.role === 'super_admin' ||
      currentUser.role === 'admin' ||
      currentUser.adminSubRole === 'super_admin'
    ) {
      return false;
    }
    return trialCalc.trialExpirado;
  }, [currentUser, trialCalc]);

  // 4. Assinatura Ativa
  const isSubscriptionActive = React.useMemo(() => {
    if (!currentUser) return false;
    if (
      currentUser.role === 'super_admin' ||
      currentUser.role === 'admin' ||
      currentUser.adminSubRole === 'super_admin' ||
      (currentUser.email && currentUser.email.toLowerCase() === 'andrezefaniasjuniorr@gmail.com')
    ) {
      return true;
    }

    if (isSeloValid) {
      return true;
    }

    if (isTrialValid) {
      return true;
    }

    return false;
  }, [currentUser, isSeloValid, isTrialValid]);

  // 5. Estado Ativo da Conta e Rótulo
  const isAccountActive = React.useMemo<boolean>(() => {
    if (!currentUser) return false;
    if (
      currentUser.role === 'super_admin' ||
      currentUser.role === 'admin' ||
      currentUser.adminSubRole === 'super_admin'
    ) {
      return true;
    }
    if (currentUser.role === 'client' || currentUser.tipoConta === 'cliente') {
      return currentUser.status !== 'blocked' && currentUser.statusConta !== 'bloqueada';
    }
    return isSeloValid || isSubscriptionActive || isTrialValid;
  }, [currentUser, isSeloValid, isSubscriptionActive, isTrialValid]);

  const accountStatusLabel = React.useMemo<string>(() => {
    if (!currentUser) return '';
    if (isSeloExpired) return 'NÃO ATIVA (Selo Expirado)';
    if (currentUser.status === 'blocked' || currentUser.statusConta === 'bloqueada') return 'Bloqueada';
    if (isAccountActive) return 'Sessão Ativa';
    return 'NÃO ATIVA';
  }, [currentUser, isSeloExpired, isAccountActive]);

  // 6. Regra de Acesso Geral à Plataforma
  const hasAccess = React.useMemo<boolean>(() => {
    if (!currentUser) return false;
    if (
      currentUser.role === 'super_admin' ||
      currentUser.role === 'admin' ||
      currentUser.adminSubRole === 'super_admin' ||
      currentUser.role === 'client' ||
      currentUser.tipoConta === 'cliente'
    ) {
      return true;
    }
    return isSeloValid || isTrialValid || isSubscriptionActive;
  }, [currentUser, isSeloValid, isTrialValid, isSubscriptionActive]);

  const isRestrictedTechnician = React.useMemo<boolean>(() => {
    if (!currentUser) return false;
    if (
      currentUser.role === 'super_admin' ||
      currentUser.role === 'admin' ||
      currentUser.adminSubRole === 'super_admin'
    ) {
      return false;
    }
    const isTech = currentUser.tipoConta === 'tecnico' || currentUser.role === 'technician';
    if (!isTech) return false;
    return !hasAccess;
  }, [currentUser, hasAccess]);

  const activePlanTier = React.useMemo<'basico' | 'profissional' | 'empresa_vip' | null>(() => {
    if (!currentUser) return null;
    if (
      currentUser.role === 'super_admin' ||
      currentUser.role === 'admin' ||
      currentUser.adminSubRole === 'super_admin' ||
      (currentUser.email && currentUser.email.toLowerCase() === 'andrezefaniasjuniorr@gmail.com')
    ) {
      return 'empresa_vip';
    }
    if (!isSubscriptionActive) return null;
    return 'profissional';
  }, [currentUser, isSubscriptionActive]);

  const activePlanId = React.useMemo(() => {
    if (!currentUser) return null;
    if (
      currentUser.role === 'super_admin' ||
      currentUser.role === 'admin' ||
      currentUser.adminSubRole === 'super_admin' ||
      (currentUser.email && currentUser.email.toLowerCase() === 'andrezefaniasjuniorr@gmail.com')
    ) {
      return 'plano_tecnico_pro';
    }
    return currentUser.planoAssinatura || currentUser.activePlanId || 'plano_tecnico_pro';
  }, [currentUser]);

  const subscriptionExpirationDate = React.useMemo(() => {
    if (!currentUser) return null;
    if (
      currentUser.role === 'super_admin' ||
      currentUser.role === 'admin' ||
      currentUser.adminSubRole === 'super_admin' ||
      (currentUser.email && currentUser.email.toLowerCase() === 'andrezefaniasjuniorr@gmail.com')
    ) {
      return '2099-12-31T23:59:59.000Z';
    }
    return currentUser.dataExpiracao || currentUser.subscriptionExpiresAt || null;
  }, [currentUser]);

  const daysRemainingOnSubscription = React.useMemo(() => {
    if (!subscriptionExpirationDate) return 0;
    const diffMs = new Date(subscriptionExpirationDate).getTime() - Date.now();
    if (diffMs <= 0) return 0;
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  }, [subscriptionExpirationDate]);

  const canAccessSaraAi = Boolean(isSubscriptionActive);
  const canAccessOSGenerator = Boolean(isSubscriptionActive);
  const canPublishMarket = Boolean(isSubscriptionActive);
  const hasTopMuralHighlight = Boolean(isSubscriptionActive);

  const activateUserSubscription = async (
    planId: string,
    durationDays = 30,
    transactionCode?: string
  ): Promise<boolean> => {
    if (!currentUser) return false;
    const res = await grantSelo30Days(currentUser.uid);
    return res.success;
  };

  // Bloqueio do loop destrutivo: só marca expirado no banco se a data real for de fato no passado
  React.useEffect(() => {
    if (!currentUser?.uid) return;
    if (
      currentUser.role === 'super_admin' ||
      currentUser.role === 'admin' ||
      currentUser.adminSubRole === 'super_admin'
    ) {
      return;
    }

    if (isSeloExpired && currentUser.statusSelo !== 'expirado') {
      const nowIso = new Date().toISOString();
      const expiredPayload = {
        isVerified: false,
        temSeloMZ: false,
        statusSelo: 'expirado' as const,
        statusConta: 'inativa' as const,
        statusAssinatura: 'expirada',
        subscriptionStatus: 'expired' as const,
        updatedAt: nowIso
      };

      setCurrentUser(prev => (prev ? { ...prev, ...expiredPayload } : null));

      if (isFirebaseConfigured && db) {
        updateDoc(doc(db, 'users', currentUser.uid), expiredPayload).catch(() => {});
        updateDoc(doc(db, 'usuarios', currentUser.uid), expiredPayload).catch(() => {});
        updateDoc(doc(db, 'technicians', currentUser.uid), {
          ...expiredPayload,
          verificationStatus: 'none'
        }).catch(() => {});
      }
    }
  }, [currentUser?.uid, isSeloExpired, currentUser?.statusSelo]);

  const solicitarSeloMZ = async (
    operadora: 'mpesa' | 'emola',
    mensagemTransacao: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser) {
      return { success: false, error: 'Usuário não autenticado.' };
    }

    const trimmedMsg = mensagemTransacao.trim();
    if (trimmedMsg.length < 15) {
      return { success: false, error: 'Cole a mensagem de confirmação SMS completa da operadora.' };
    }

    const nowIso = new Date().toISOString();
    const reqId = `selo_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const novaSolicitacao: SolicitacaoSelo = {
      id: reqId,
      userId: currentUser.uid,
      usuarioNome: currentUser.name,
      usuarioEmail: currentUser.email,
      usuarioTelefone: currentUser.phone || '',
      userRole: currentUser.role,
      tipoConta: (currentUser.tipoConta as any) || 'tecnico',
      operadora,
      mensagemTransacao: trimmedMsg,
      valor: 50,
      statusSelo: 'pendente_aprovacao',
      dataEnvio: nowIso
    };

    const updatedUser: User = {
      ...currentUser,
      statusSelo: 'pendente_aprovacao',
      operadoraSelo: operadora,
      mensagemTransacaoSelo: trimmedMsg,
      dataSeloEnvio: nowIso,
      updatedAt: nowIso
    };

    setCurrentUser(updatedUser);
    setUsersList(prev => prev.map(u => (u.uid === currentUser.uid ? updatedUser : u)));
    setSolicitacoesSelo(prev => [novaSolicitacao, ...prev.filter(s => s.id !== reqId)]);

    if (isFirebaseConfigured && db) {
      await setDoc(doc(db, 'solicitacoes_selo', reqId), novaSolicitacao).catch(() => {});
      await updateDoc(doc(db, 'users', currentUser.uid), {
        statusSelo: 'pendente_aprovacao',
        operadoraSelo: operadora,
        mensagemTransacaoSelo: trimmedMsg,
        dataSeloEnvio: nowIso,
        updatedAt: nowIso
      }).catch(() => {});
      await updateDoc(doc(db, 'usuarios', currentUser.uid), {
        statusSelo: 'pendente_aprovacao',
        dataSeloEnvio: nowIso,
        updatedAt: nowIso
      }).catch(() => {});
    }

    return { success: true };
  };

  const aprovarSeloMZ = async (
    solicitacaoId: string,
    userId: string
  ): Promise<{ success: boolean; error?: string }> => {
    return grantSelo30Days(userId);
  };

  const rejeitarSeloMZ = async (
    solicitacaoId: string,
    userId: string,
    motivo = 'Código de transação não localizado ou SMS inválido.'
  ): Promise<{ success: boolean; error?: string }> => {
    const nowIso = new Date().toISOString();

    setSolicitacoesSelo(prev =>
      prev.map(s =>
        s.id === solicitacaoId
          ? {
              ...s,
              statusSelo: 'rejeitado',
              motivoRejeicao: motivo,
              dataResposta: nowIso
            }
          : s
      )
    );

    const rejectionPayload = {
      temSeloMZ: false,
      statusSelo: 'rejeitado' as const,
      motivoRejeicaoSelo: motivo,
      updatedAt: nowIso
    };

    setUsersList(prev => prev.map(u => (u.uid === userId ? { ...u, ...rejectionPayload } : u)));

    if (currentUser?.uid === userId) {
      setCurrentUser(prev => (prev ? { ...prev, ...rejectionPayload } : null));
    }

    if (isFirebaseConfigured && db) {
      await updateDoc(doc(db, 'solicitacoes_selo', solicitacaoId), {
        statusSelo: 'rejeitado',
        motivoRejeicao: motivo,
        dataResposta: nowIso
      }).catch(() => {});
      await updateDoc(doc(db, 'users', userId), rejectionPayload).catch(() => {});
      await updateDoc(doc(db, 'usuarios', userId), rejectionPayload).catch(() => {});
    }

    return { success: true };
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.cadastrarEmpresa = cadastrarEmpresa;
      window.carregarPainelEmpresa = carregarPainelEmpresa;
      window.carregarPainelTecnico = carregarPainelTecnico;
      window.carregarPainelCliente = carregarPainelCliente;
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentTechProfile,
        currentCompanyProfile,
        usersList,
        techList,
        companyList,
        isAuthenticated: Boolean(currentUser),
        isLoading,
        isClient,
        isTechnician,
        isCompany,
        isAdmin,
        isSuperAdmin,
        isFinanceAdmin,
        isModerator,

        temSeloMZ,
        statusSelo,
        seloDaysRemaining,
        isSeloExpired,
        isAccountActive,
        accountStatusLabel,
        isTrialActive,
        trialDaysRemaining,
        isTrialValid,
        isTrialExpired,
        temAcessoTrial: trialCalc.temAcessoTrial,
        trialExpirado: trialCalc.trialExpirado,
        hasAccess,
        isRestrictedTechnician,
        solicitacoesSelo,
        solicitarSeloMZ,
        aprovarSeloMZ,
        rejeitarSeloMZ,
        grantSelo30Days,
        grantTrial3Days,
        revokeTrial,

        isSubscriptionActive,
        activePlanTier,
        activePlanId,
        subscriptionExpirationDate,
        daysRemainingOnSubscription,
        canAccessSaraAi,
        canAccessOSGenerator,
        canPublishMarket,
        hasTopMuralHighlight,
        activateUserSubscription,

        loginAsClient,
        login,
        register,
        cadastrarEmpresa,
        logout,
        resetPassword,
        changePassword,
        updateCurrentUserProfile,
        updateCurrentTechProfile,
        updateCurrentCompanyProfile,
        giveTechnicianLike,
        toggleTechnicianLike,
        switchUserRole,
        updateUserStatus,
        deleteUserAccount,
        approveUserAccount,
        rejectUserAccount,
        toggleUserVerification,
        grantManualSubscription30Days
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};