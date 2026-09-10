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
import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, onSnapshot, query, where, getDocs, serverTimestamp, increment, arrayUnion, arrayRemove } from 'firebase/firestore';
import { giveHeartOrLike, recalculateUserStarsAndRanking } from '../services/engagement';

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
  statusSelo: 'nenhum' | 'pendente_aprovacao' | 'aprovado' | 'rejeitado';
  isRestrictedTechnician: boolean;
  solicitacoesSelo: SolicitacaoSelo[];
  solicitarSeloMZ: (operadora: 'mpesa' | 'emola', mensagemTransacao: string) => Promise<{ success: boolean; error?: string }>;
  aprovarSeloMZ: (solicitacaoId: string, userId: string) => Promise<{ success: boolean; error?: string }>;
  rejeitarSeloMZ: (solicitacaoId: string, userId: string, motivo?: string) => Promise<{ success: boolean; error?: string }>;

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
    avatarUrl: u.avatarUrl && !u.avatarUrl.startsWith('data:') ? u.avatarUrl : undefined,
    photoURL: u.photoURL && !u.photoURL.startsWith('data:') ? u.photoURL : undefined,
    status: u.status,
    statusConta: u.statusConta,
    statusAprovacao: u.statusAprovacao,
    temSeloMZ: u.temSeloMZ,
    isVerified: u.isVerified,
    statusSelo: u.statusSelo,
    adminSubRole: u.adminSubRole,
    activePlanId: u.activePlanId,
    subscriptionStatus: u.subscriptionStatus,
    subscriptionExpiresAt: u.subscriptionExpiresAt,
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

  // Abertura Instantânea estilo WhatsApp: lê o cachedUser imediatamente em 0ms
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
    // Se o usuário ou cliente já está em cache, libera a montagem imediata (isLoading = false)
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
      (err) => {
        console.warn('Real-time users listener notice:', err);
      }
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
            photoURL: d.photoURL || d.avatarUrl || d.foto || '',
            avatarUrl: d.avatarUrl || d.photoURL || d.foto || '',
            specialty: d.specialty || d.especialidade || 'Eletricidade',
            province: d.province || d.provincia || 'Maputo Cidade',
            city: d.city || d.cidade || 'Maputo',
            status: d.status || 'active',
            statusConta: d.statusConta || 'ativa',
            statusAprovacao: d.statusAprovacao || 'aprovado',
            totalLikes: typeof d.totalLikes === 'number' ? d.totalLikes : 0,
            scoreEngajamento: typeof d.scoreEngajamento === 'number' ? d.scoreEngajamento : (typeof d.pontos === 'number' ? d.pontos : 0),
            pontos: typeof d.pontos === 'number' ? d.pontos : (typeof d.scoreEngajamento === 'number' ? d.scoreEngajamento : 0),
            streakCount: typeof d.streakCount === 'number' ? d.streakCount : (typeof d.sequenciaDias === 'number' ? d.sequenciaDias : 1),
            lastLoginDate: d.lastLoginDate || d.ultimoAcesso || '',
            createdAt: d.createdAt || d.dataCadastro || new Date().toISOString()
          };
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
              province: d.province || d.provincia || 'Maputo Cidade',
              city: d.city || d.cidade || 'Maputo',
              specialties: Array.isArray(d.specialties) ? d.specialties : (d.specialty ? [d.specialty] : (d.especialidade ? [d.especialidade] : ['Eletricidade'])),
              bio: d.bio || `Profissional qualificado em ${d.specialty || d.especialidade || 'serviços técnicos'} em Moçambique.`,
              experienceYears: typeof d.experienceYears === 'number' ? d.experienceYears : 2,
              avatarUrl: d.avatarUrl || d.photoURL || d.foto || '',
              photoURL: d.photoURL || d.avatarUrl || d.foto || '',
              totalLikes: typeof d.totalLikes === 'number' ? d.totalLikes : 0,
              scoreEngajamento: typeof d.scoreEngajamento === 'number' ? d.scoreEngajamento : (typeof d.pontos === 'number' ? d.pontos : 0),
              pontos: typeof d.pontos === 'number' ? d.pontos : (typeof d.scoreEngajamento === 'number' ? d.scoreEngajamento : 0),
              streakCount: typeof d.streakCount === 'number' ? d.streakCount : (typeof d.sequenciaDias === 'number' ? d.sequenciaDias : 1),
              lastLoginDate: d.lastLoginDate || d.ultimoAcesso || '',
              verificationStatus: d.verificationStatus || 'none',
              isVerified: Boolean(d.isVerified || d.verificationStatus === 'approved'),
              subscriptionStatus: d.subscriptionStatus || 'none',
              statusAprovacao: d.statusAprovacao || 'aprovado',
              statusConta: d.statusConta || 'ativa',
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
      (err) => console.warn('Real-time usuarios listener notice:', err)
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
      (err) => {
        console.warn('Real-time technicians listener notice:', err);
      }
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
      (err) => {
        console.warn('Real-time companies listener notice:', err);
      }
    );

    const unsubSelo = onSnapshot(
      collection(db, 'solicitacoes_selo'),
      (snapshot) => {
        const selos: SolicitacaoSelo[] = [];
        snapshot.forEach((docSnap) => {
          selos.push({ ...docSnap.data(), id: docSnap.id } as SolicitacaoSelo);
        });
        // Sort newest first
        selos.sort((a, b) => new Date(b.dataEnvio).getTime() - new Date(a.dataEnvio).getTime());
        setSolicitacoesSelo(selos);
      },
      (err) => {
        console.warn('Real-time solicitacoes_selo listener notice:', err);
      }
    );

    return () => {
      unsubUsers();
      unsubUsuarios();
      unsubTechs();
      unsubComps();
      unsubSelo();
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

  // Keep local storage synchronized with current lists (somente como fallback se Firebase não estiver ativo)
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

  // Helper: Login / Access as Client (Guest with Name stored in localStorage)
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

  // Helper: Funções de carregamento de painéis baseados no tipo de conta
  const carregarPainelEmpresa = (userData: any) => {
    if (typeof window !== 'undefined') {
      if (window.location.hash !== '#empresa') {
        window.location.hash = '#empresa';
      }
      if (typeof (window as any).applyRoleBasedUI === 'function') {
        (window as any).applyRoleBasedUI('empresa');
      }
    }
  };

  const carregarPainelTecnico = (userData: any) => {
    if (typeof window !== 'undefined') {
      if (window.location.hash !== '#tecnico') {
        window.location.hash = '#tecnico';
      }
      if (typeof (window as any).applyRoleBasedUI === 'function') {
        (window as any).applyRoleBasedUI('tecnico');
      }
    }
  };

  const carregarPainelCliente = (userData: any) => {
    if (typeof window !== 'undefined') {
      if (window.location.hash !== '#cliente') {
        window.location.hash = '#cliente';
      }
      if (typeof (window as any).applyRoleBasedUI === 'function') {
        (window as any).applyRoleBasedUI('cliente');
      }
    }
  };

  // Helper: Liberar acesso ao App com persistência, sincronização de lista e redirecionamento de tela
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

    // Auto-redirecionamento de rota/aba se estiver na raiz ou tela de login
    if (typeof window !== 'undefined') {
      const currentHash = (window.location.hash || '').replace(/^#/, '');
      // Se não houver rota explícita no hash, tenta preservar a última rota navegada (estilo WhatsApp)
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

  // Firebase auth state listener - runs once on mount
  useEffect(() => {
    let profileUnsub: (() => void) | null = null;
    let isMounted = true;

    // Watchdog de segurança: garante que isLoading NUNCA fique travado em true
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
            // Se estiver no processo de criação de conta, aguarda o setDoc terminar
            if (typeof window !== 'undefined' && (window.isCreatingAccount || window.isRegistering)) {
              console.log('[Auth] Cadastro em andamento (isCreatingAccount || isRegistering). Ignorando onAuthStateChanged temporariamente para evitar race condition.');
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

          // Verifica se já existe perfil em cache para evitar flash de perfil errado
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
            createdAt: new Date().toISOString()
          };

          try {
            if (db) {
              const userRef = doc(db, 'usuarios', fbUser.uid);
              const usersRef = doc(db, 'users', fbUser.uid);

              let userSnap = await safeGetDoc(userRef, 2, 400);
              let usersSnap = await safeGetDoc(usersRef, 2, 400);

              // Se ambos foram verificados online e nenhum existe, auto-repara o perfil verificando antes se é empresa
              if (userSnap && usersSnap && !userSnap.exists() && !usersSnap.exists()) {
                const compCheck = await safeGetDoc(doc(db, 'companies', fbUser.uid), 1, 300);
                const isCompanyDoc = Boolean(compCheck && compCheck.exists());

                const repairPayload = {
                  uid: fbUser.uid,
                  email: normalizedEmail,
                  nome: defaultName,
                  name: defaultName,
                  nuit: isCompanyDoc ? (compCheck.data()?.nuit || '') : '',
                  role: isSuperAdminEmail ? 'super_admin' : (isCompanyDoc ? 'company' : 'tecnico'),
                  tipo: isCompanyDoc ? 'empresa' : 'tecnico', // FIX: Identificador estrito do tipo de conta
                  tipoConta: isCompanyDoc ? 'empresa' : 'tecnico',
                  pontos: 0,
                  totalLikes: 0,
                  fotoUrl: fbUser.photoURL || '',
                  photoURL: fbUser.photoURL || '',
                  avatarUrl: fbUser.photoURL || '',
                  status: 'active',
                  statusConta: 'ativa',
                  statusAprovacao: 'aprovado',
                  criadoEm: serverTimestamp(),
                  createdAt: serverTimestamp(),
                  createdAtIso: new Date().toISOString()
                };

                await safeSetDoc(userRef, repairPayload);
                await safeSetDoc(usersRef, repairPayload);

                // Assegura documento de técnico apenas se não for empresa
                if (!isCompanyDoc && !isSuperAdminEmail) {
                  try {
                    const techRef = doc(db, 'technicians', fbUser.uid);
                    const techSnap = await safeGetDoc(techRef, 1, 300);
                    if (techSnap && !techSnap.exists()) {
                      await safeSetDoc(techRef, {
                        userId: fbUser.uid,
                        name: defaultName,
                        email: normalizedEmail,
                        phone: fbUser.phoneNumber || '',
                        province: 'Maputo Cidade',
                        city: 'Maputo',
                        specialties: ['Eletricidade'],
                        bio: 'Profissional técnico cadastrado na TécnicaMZ Pro.',
                        totalLikes: 0,
                        scoreEngajamento: 0,
                        rating: 5.0,
                        reviewsCount: 0,
                        completedJobsCount: 0,
                        status: 'active',
                        statusConta: 'ativa',
                        statusAprovacao: 'aprovado',
                        createdAt: serverTimestamp()
                      });
                    }
                  } catch (techSyncErr) {
                    console.warn('Sync tech profile notice:', techSyncErr);
                  }
                }

                userSnap = await safeGetDoc(userRef, 1, 300);
              }

              // Extrai com segurança os dados de perfil se o documento foi obtido
              const usuarioData = (userSnap && userSnap.exists()) ? userSnap.data() : {};
              const usersData = (usersSnap && usersSnap.exists()) ? usersSnap.data() : {};
              // Prioridade absoluta para a coleção 'users' onde o cadastro grava tipo: 'empresa'
              const rawData = { ...usuarioData, ...usersData };
              
              // Se os campos de tipo estiverem ausentes ou não confirmados, checa a coleção companies para confirmação
              let hasCompanyDoc = false;
              if (rawData.tipo !== 'empresa' && rawData.tipoConta !== 'empresa' && rawData.role !== 'company') {
                const compCheck = await safeGetDoc(doc(db, 'companies', fbUser.uid), 1, 300);
                hasCompanyDoc = Boolean(compCheck && compCheck.exists());
              }

              const isSuper = isSuperAdminEmail || rawData.role === 'super_admin' || rawData.tipoConta === 'super_admin';
              const rawTipo = String(rawData.tipo || rawData.tipoConta || rawData.role || (hasCompanyDoc ? 'empresa' : '')).toLowerCase().trim();

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

              const firestoreUserData: User = {
                uid: fbUser.uid,
                name: rawData.name || rawData.nome || (tipo === 'empresa' ? 'Empresa Registada' : defaultName),
                nome: rawData.nome || rawData.name || (tipo === 'empresa' ? 'Empresa Registada' : defaultName),
                email: normalizedEmail,
                phone: rawData.phone || rawData.telefone || fbUser.phoneNumber || '',
                nuit: rawData.nuit || '',
                role: role,
                tipo: tipo,
                tipoConta: tipoConta,
                statusAprovacao: statusAprovacao,
                statusConta: rawData.statusConta || 'ativa',
                status: rawData.status || (statusAprovacao === 'pendente' ? 'pending_approval' : 'active'),
                adminSubRole: isSuper ? 'super_admin' : rawData.adminSubRole,
                specialty: rawData.specialty || rawData.especialidade || (role === 'technician' ? 'Eletricidade' : undefined),
                province: rawData.province || rawData.provincia || 'Maputo Cidade',
                city: rawData.city || rawData.cidade || 'Maputo',
                avatarUrl: rawData.avatarUrl || rawData.photoURL || rawData.fotoUrl || rawData.foto || fbUser.photoURL || undefined,
                photoURL: rawData.photoURL || rawData.avatarUrl || rawData.fotoUrl || rawData.foto || fbUser.photoURL || undefined,
                temSeloMZ: isSuper ? true : Boolean(rawData.temSeloMZ || rawData.statusSelo === 'aprovado'),
                statusSelo: isSuper ? 'aprovado' : (rawData.statusSelo || (rawData.temSeloMZ ? 'aprovado' : 'nenhum')),
                dataSeloEnvio: rawData.dataSeloEnvio,
                dataSeloAprovacao: rawData.dataSeloAprovacao,
                motivoRejeicaoSelo: rawData.motivoRejeicaoSelo,
                mensagemTransacaoSelo: rawData.mensagemTransacaoSelo,
                operadoraSelo: rawData.operadoraSelo,
                statusAssinatura: rawData.statusAssinatura,
                dataExpiracao: rawData.dataExpiracao,
                subscriptionStatus: rawData.subscriptionStatus,
                activePlanId: rawData.activePlanId,
                totalLikes: typeof rawData.totalLikes === 'number' ? rawData.totalLikes : (typeof rawData.likesCount === 'number' ? rawData.likesCount : (typeof rawData.curtidas === 'number' ? rawData.curtidas : 0)),
                likesCount: typeof rawData.likesCount === 'number' ? rawData.likesCount : (typeof rawData.totalLikes === 'number' ? rawData.totalLikes : (typeof rawData.curtidas === 'number' ? rawData.curtidas : 0)),
                scoreEngajamento: typeof rawData.scoreEngajamento === 'number' ? rawData.scoreEngajamento : (typeof rawData.points === 'number' ? rawData.points : (typeof rawData.pontos === 'number' ? rawData.pontos : 0)),
                pontos: typeof rawData.pontos === 'number' ? rawData.pontos : (typeof rawData.points === 'number' ? rawData.points : (typeof rawData.scoreEngajamento === 'number' ? rawData.scoreEngajamento : 0)),
                points: typeof rawData.points === 'number' ? rawData.points : (typeof rawData.pontos === 'number' ? rawData.pontos : (typeof rawData.scoreEngajamento === 'number' ? rawData.scoreEngajamento : 0)),
                stars: typeof rawData.stars === 'number' ? rawData.stars : Math.min(5, Math.floor(((rawData.points ?? rawData.pontos ?? rawData.scoreEngajamento ?? 0) / 200))),
                badges: rawData.badges || { excelente: 0, util: 0, tecnico: 0 },
                streakCount: typeof rawData.streakCount === 'number' ? rawData.streakCount : (typeof rawData.sequenciaDias === 'number' ? rawData.sequenciaDias : 1),
                lastLoginDate: rawData.lastLoginDate || rawData.ultimoAcesso || '',
                createdAt: rawData.createdAt || rawData.dataCadastro || new Date().toISOString(),
                updatedAt: rawData.updatedAt
              };

              // ==============================================================
              // OFENSIVA DIÁRIA (DAILY STREAK CONTADOR DE SEQUÊNCIA)
              // ==============================================================
              const todayStr = new Date().toISOString().split('T')[0];
              const lastLoginDateRaw = rawData.lastLoginDate || rawData.ultimoAcesso || '';
              const lastLoginDay = lastLoginDateRaw ? lastLoginDateRaw.split('T')[0] : '';

              let updatedStreak = typeof rawData.streakCount === 'number' ? rawData.streakCount : (typeof rawData.sequenciaDias === 'number' ? rawData.sequenciaDias : 1);
              let bonusPoints = 0;

              if (lastLoginDay !== todayStr) {
                if (lastLoginDay) {
                  const lastDate = new Date(lastLoginDay + 'T00:00:00Z');
                  const todayDate = new Date(todayStr + 'T00:00:00Z');
                  const diffDays = Math.round((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
                  if (diffDays === 1) {
                    updatedStreak = updatedStreak + 1;
                    bonusPoints = 10;
                  } else {
                    updatedStreak = 1;
                    bonusPoints = 10;
                  }
                } else {
                  updatedStreak = 1;
                  bonusPoints = 10;
                }

                // Grava bônus de ofensiva diária no Firestore
                try {
                  const streakPayload = {
                    streakCount: updatedStreak,
                    lastLoginDate: todayStr,
                    ultimoAcesso: todayStr,
                    pontos: increment(bonusPoints),
                    scoreEngajamento: increment(bonusPoints)
                  };
                  updateDoc(userRef, streakPayload).catch(() => {});
                  updateDoc(usersRef, streakPayload).catch(() => {});
                  if (role === 'technician') {
                    updateDoc(doc(db, 'technicians', fbUser.uid), streakPayload).catch(() => {});
                  }
                } catch (stErr) {
                  console.warn('Erro ao atualizar ofensiva no Firestore:', stErr);
                }
              }

              firestoreUserData.streakCount = updatedStreak;
              firestoreUserData.lastLoginDate = todayStr;
              if (bonusPoints > 0) {
                firestoreUserData.pontos = (firestoreUserData.pontos || 0) + bonusPoints;
                firestoreUserData.scoreEngajamento = (firestoreUserData.scoreEngajamento || 0) + bonusPoints;
              }

              if (role === 'technician') {
                try {
                  const techDoc = await safeGetDoc(doc(db, 'technicians', fbUser.uid), 1, 300);
                  if (techDoc && techDoc.exists()) {
                    const tData = techDoc.data() as TechnicianProfile;
                    setCurrentTechProfile({ ...tData, userId: fbUser.uid });
                  }
                } catch (tErr) {
                  console.warn('Fetch tech doc on auth changed notice:', tErr);
                }
              }

              if (role === 'company') {
                try {
                  const compDoc = await safeGetDoc(doc(db, 'companies', fbUser.uid), 1, 300);
                  if (compDoc && compDoc.exists()) {
                    const cData = compDoc.data() as CompanyProfile;
                    setCurrentCompanyProfile({ ...cData, userId: fbUser.uid });
                  }
                } catch (cErr) {
                  console.warn('Fetch comp doc on auth changed notice:', cErr);
                }
              }

              // Sincronização em tempo real caso o Firestore reconecte ou haja atualização no perfil do usuário
              try {
                profileUnsub = onSnapshot(usersRef, (liveSnap) => {
                  if (liveSnap.exists()) {
                    const live = liveSnap.data();
                    setCurrentUser(prev => {
                      if (!prev) return prev;
                      return {
                        ...prev,
                        name: live.name || live.nome || prev.name,
                        phone: live.phone || live.telefone || prev.phone,
                        avatarUrl: live.avatarUrl || live.photoURL || prev.avatarUrl,
                        photoURL: live.photoURL || live.avatarUrl || prev.photoURL,
                        idade: typeof live.idade === 'number' ? live.idade : prev.idade,
                        province: live.province || live.provincia || prev.province,
                        city: live.city || live.cidade || prev.city,
                        specialties: Array.isArray(live.specialties) ? live.specialties : (live.especialidade ? [live.especialidade] : prev.specialties),
                        bio: live.bio || prev.bio,
                        whatsapp: live.whatsapp || prev.whatsapp,
                        temSeloMZ: Boolean(live.temSeloMZ || live.statusSelo === 'aprovado' || prev.temSeloMZ),
                        statusSelo: live.statusSelo || prev.statusSelo,
                        statusAprovacao: live.statusAprovacao || prev.statusAprovacao,
                        statusConta: live.statusConta || prev.statusConta,
                        totalLikes: typeof live.totalLikes === 'number' ? live.totalLikes : (typeof live.likesCount === 'number' ? live.likesCount : prev.totalLikes),
                        likesCount: typeof live.likesCount === 'number' ? live.likesCount : (typeof live.totalLikes === 'number' ? live.totalLikes : prev.likesCount),
                        scoreEngajamento: typeof live.scoreEngajamento === 'number' ? live.scoreEngajamento : (typeof live.points === 'number' ? live.points : prev.scoreEngajamento),
                        pontos: typeof live.pontos === 'number' ? live.pontos : (typeof live.points === 'number' ? live.points : prev.pontos),
                        points: typeof live.points === 'number' ? live.points : (typeof live.pontos === 'number' ? live.pontos : prev.points),
                        stars: typeof live.stars === 'number' ? live.stars : Math.min(5, Math.floor(((live.points ?? live.pontos ?? live.scoreEngajamento ?? 0) / 200))),
                        badges: live.badges || prev.badges || { excelente: 0, util: 0, tecnico: 0 },
                        streakCount: typeof live.streakCount === 'number' ? live.streakCount : prev.streakCount,
                        lastLoginDate: live.lastLoginDate || prev.lastLoginDate
                      };
                    });
                  }
                }, (syncErr) => {
                  console.warn('Sincronização em tempo real offline/aviso:', syncErr?.message);
                });
              } catch (liveErr) {
                console.warn('Aviso ao iniciar ouvinte em tempo real do perfil:', liveErr);
              }

              // 3. LÓGICA DE LOGIN E REDIRECIONAMENTO (switch userData.tipo)
              // Se a página atual for a de Login/Cadastro, manda para o painel correto
              if (typeof window !== 'undefined' && !window.isCreatingAccount && !window.isRegistering) {
                const paginaAtual = window.location.pathname;
                if (paginaAtual.includes('login') || paginaAtual.includes('cadastro')) {
                  const targetTipo = tipo || rawData.tipo || firestoreUserData.tipo;
                  if (targetTipo === "empresa" || role === "company") {
                    window.location.replace("painel-empresa.html");
                    return;
                  } else if (targetTipo === "tecnico" || role === "technician") {
                    window.location.replace("painel-tecnico.html");
                    return;
                  } else if (targetTipo === "cliente" || role === "client") {
                    window.location.replace("painel-cliente.html");
                    return;
                  }
                }
              }

              switch (rawData.tipo || firestoreUserData.tipo) {
                case "empresa":
                  carregarPainelEmpresa(firestoreUserData);
                  break;
                case "tecnico":
                  if (role === 'super_admin' || role === 'admin') {
                    window.location.hash = '#gestao-pro-mz';
                  } else {
                    carregarPainelTecnico(firestoreUserData);
                  }
                  break;
                case "cliente":
                  carregarPainelCliente(firestoreUserData);
                  break;
                default:
                  console.error("Tipo de conta desconhecido:", rawData.tipo);
                  if (role === 'super_admin' || role === 'admin') {
                    window.location.hash = '#gestao-pro-mz';
                  } else {
                    carregarPainelTecnico(firestoreUserData);
                  }
              }

              // Prossegue com o login e atualiza com os dados do Firestore
              liberarAcessoApp(firestoreUserData);
            }
          } catch (error: any) {
            const isOffline = error?.message?.includes('offline') || error?.code === 'unavailable';
            if (isOffline) {
              console.warn("Cliente Firestore temporariamente offline durante verificação do perfil, mantendo acesso do Auth.");
            } else {
              console.warn("Aviso na verificação do perfil, mantendo acesso do Auth:", error?.message || error);
            }
            liberarAcessoApp(fallbackUser);
          }
        } else {
          // Se estiver 100% offline, mantenha o usuário dentro da plataforma navegando pelos dados cacheados (Estilo WhatsApp)
          const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;
          const cached = safeGetStorageItem<User | null>(CACHED_USER_KEY, null);
          if (isOffline && cached && cached.uid) {
            console.log('[Auth] Modo offline ativo: mantendo sessão cacheada do usuário.');
            return;
          }

          // exibirTelaLogin()
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
  // Offline / unconfigured: check saved client name
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
      }
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password?: string): Promise<{ success: boolean; error?: string; user?: User }> => {
    setIsLoading(true);
    try {
      const normalizedEmail = (email || '').trim().toLowerCase();

      // If Firebase is configured and password is provided, authenticate directly via Firebase Auth
      if (isFirebaseConfigured && auth && password) {
        try {
          const userCredential = await signInWithEmailAndPassword(auth, normalizedEmail, password);
          const fbUser = userCredential.user;

          // 3. LOGIN DEFENSIVO: CONSULTA NA COLEÇÃO 'usuarios' e 'users' PELO 'user.uid'
          let foundUser: User | null = null;
          const defaultName = fbUser.displayName || (normalizedEmail ? normalizedEmail.split('@')[0] : 'Técnico MZ');
          const isSuperAdminEmail = normalizedEmail === 'andrezefaniasjuniorr@gmail.com';

          if (db) {
            try {
              const userRef = doc(db, 'usuarios', fbUser.uid);
              const usersRef = doc(db, 'users', fbUser.uid);

              let userSnap = await safeGetDoc(userRef, 2, 400);
              let usersSnap = await safeGetDoc(usersRef, 2, 400);

              // Auto-recuperação se o documento não existir no Firestore
              if (userSnap && usersSnap && !userSnap.exists() && !usersSnap.exists()) {
                const compCheck = await safeGetDoc(doc(db, 'companies', fbUser.uid), 1, 300);
                const isCompanyDoc = Boolean(compCheck && compCheck.exists());

                const repairPayload = {
                  uid: fbUser.uid,
                  email: normalizedEmail,
                  nome: defaultName,
                  name: defaultName,
                  nuit: isCompanyDoc ? (compCheck.data()?.nuit || '') : '',
                  role: isSuperAdminEmail ? 'super_admin' : (isCompanyDoc ? 'company' : 'tecnico'),
                  tipo: isCompanyDoc ? 'empresa' : 'tecnico', // FIX: Identificador estrito do tipo de conta
                  tipoConta: isCompanyDoc ? 'empresa' : 'tecnico',
                  pontos: 0,
                  totalLikes: 0,
                  fotoUrl: fbUser.photoURL || '',
                  photoURL: fbUser.photoURL || '',
                  avatarUrl: fbUser.photoURL || '',
                  status: 'active',
                  statusConta: 'ativa',
                  statusAprovacao: 'aprovado',
                  criadoEm: serverTimestamp(),
                  createdAt: serverTimestamp(),
                  createdAtIso: new Date().toISOString()
                };

                await safeSetDoc(userRef, repairPayload);
                await safeSetDoc(usersRef, repairPayload);

                if (!isCompanyDoc && !isSuperAdminEmail) {
                  try {
                    const techRef = doc(db, 'technicians', fbUser.uid);
                    const techSnap = await safeGetDoc(techRef, 1, 300);
                    if (techSnap && !techSnap.exists()) {
                      await safeSetDoc(techRef, {
                        userId: fbUser.uid,
                        name: defaultName,
                        email: normalizedEmail,
                        phone: fbUser.phoneNumber || '',
                        province: 'Maputo Cidade',
                        city: 'Maputo',
                        specialties: ['Eletricidade'],
                        bio: 'Profissional técnico cadastrado na TécnicaMZ Pro.',
                        totalLikes: 0,
                        scoreEngajamento: 0,
                        rating: 5.0,
                        reviewsCount: 0,
                        completedJobsCount: 0,
                        status: 'active',
                        statusConta: 'ativa',
                        statusAprovacao: 'aprovado',
                        createdAt: serverTimestamp()
                      });
                    }
                  } catch (tErr) {
                    console.warn('Tech sync notice:', tErr);
                  }
                }

                userSnap = await safeGetDoc(userRef, 1, 300);
              }

              const usuarioData = (userSnap && userSnap.exists()) ? userSnap.data() : {};
              const usersData = (usersSnap && usersSnap.exists()) ? usersSnap.data() : {};
              // Prioridade absoluta para 'users' gravado pelo cadastro de empresa
              const docData = { ...usuarioData, ...usersData };

              let hasCompanyDoc = false;
              if (docData.tipo !== 'empresa' && docData.tipoConta !== 'empresa' && docData.role !== 'company') {
                const compCheck = await safeGetDoc(doc(db, 'companies', fbUser.uid), 1, 300);
                hasCompanyDoc = Boolean(compCheck && compCheck.exists());
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

              foundUser = {
                uid: fbUser.uid,
                name: docData.name || docData.nome || fbUser.displayName || (tipo === 'empresa' ? 'Empresa Registada' : defaultName),
                nome: docData.nome || docData.name || fbUser.displayName || (tipo === 'empresa' ? 'Empresa Registada' : defaultName),
                email: normalizedEmail,
                phone: docData.phone || docData.telefone || fbUser.phoneNumber || '',
                nuit: docData.nuit || '',
                role: role,
                tipo: tipo,
                tipoConta: tipoConta,
                statusAprovacao: statusAprovacao,
                statusConta: docData.statusConta || 'ativa',
                status: docData.status || (statusAprovacao === 'pendente' ? 'pending_approval' : 'active'),
                adminSubRole: isSuper ? 'super_admin' : docData.adminSubRole,
                specialty: docData.specialty || docData.especialidade || (role === 'technician' ? 'Eletricidade' : undefined),
                province: docData.province || docData.provincia || 'Maputo Cidade',
                city: docData.city || docData.cidade || 'Maputo',
                avatarUrl: docData.avatarUrl || docData.photoURL || docData.fotoUrl || docData.foto || fbUser.photoURL || undefined,
                photoURL: docData.photoURL || docData.avatarUrl || docData.fotoUrl || docData.foto || fbUser.photoURL || undefined,
                temSeloMZ: isSuper ? true : Boolean(docData.temSeloMZ || docData.statusSelo === 'aprovado'),
                statusSelo: isSuper ? 'aprovado' : (docData.statusSelo || (docData.temSeloMZ ? 'aprovado' : 'nenhum')),
                dataSeloEnvio: docData.dataSeloEnvio,
                dataSeloAprovacao: docData.dataSeloAprovacao,
                motivoRejeicaoSelo: docData.motivoRejeicaoSelo,
                mensagemTransacaoSelo: docData.mensagemTransacaoSelo,
                operadoraSelo: docData.operadoraSelo,
                statusAssinatura: docData.statusAssinatura,
                dataExpiracao: docData.dataExpiracao,
                subscriptionStatus: docData.subscriptionStatus,
                activePlanId: docData.activePlanId,
                totalLikes: typeof docData.totalLikes === 'number' ? docData.totalLikes : (typeof docData.curtidas === 'number' ? docData.curtidas : 0),
                scoreEngajamento: typeof docData.scoreEngajamento === 'number' ? docData.scoreEngajamento : (typeof docData.pontos === 'number' ? docData.pontos : 0),
                createdAt: docData.createdAt || docData.dataCadastro || new Date().toISOString(),
                updatedAt: docData.updatedAt
              };

              if (role === 'technician') {
                try {
                  const techDoc = await safeGetDoc(doc(db, 'technicians', fbUser.uid), 1, 300);
                  if (techDoc && techDoc.exists()) {
                    const tData = techDoc.data() as TechnicianProfile;
                    setCurrentTechProfile({ ...tData, userId: fbUser.uid });
                  }
                } catch (tErr) {
                  console.warn('Fetch tech doc on login notice:', tErr);
                }
              }

              if (role === 'company') {
                try {
                  const compDoc = await safeGetDoc(doc(db, 'companies', fbUser.uid), 1, 300);
                  if (compDoc && compDoc.exists()) {
                    const cData = compDoc.data() as CompanyProfile;
                    setCurrentCompanyProfile({ ...cData, userId: fbUser.uid });
                  }
                } catch (cErr) {
                  console.warn('Fetch comp doc on login notice:', cErr);
                }
              }
            } catch (err) {
              console.warn('Firestore lookup error in login, using fallback:', err);
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
              createdAt: new Date().toISOString()
            };
          }

          if (foundUser.status === 'suspended' || foundUser.statusConta === 'suspensa') {
            return { success: false, error: 'Sua conta está suspensa. Entre em contato com o suporte.' };
          }
          if (foundUser.status === 'blocked' || foundUser.statusConta === 'bloqueada') {
            return { success: false, error: 'Acesso bloqueado por violação de políticas da plataforma.' };
          }

          liberarAcessoApp(foundUser);
          if (typeof window !== 'undefined') {
            if (foundUser.tipo === "empresa" || foundUser.role === "company" || foundUser.tipoConta === "empresa") {
              window.location.replace("painel-empresa.html");
            } else if (foundUser.tipo === "tecnico" || foundUser.role === "technician" || foundUser.tipoConta === "tecnico") {
              window.location.replace("painel-tecnico.html");
            } else if (foundUser.tipo === "cliente" || foundUser.role === "client" || foundUser.tipoConta === "cliente") {
              window.location.replace("painel-cliente.html");
            }
          }
          return { success: true, user: foundUser };
        } catch (fbErr: any) {
          console.warn('Firebase Auth sign in failed:', fbErr);
          if (
            fbErr.code === 'auth/user-not-found' ||
            fbErr.code === 'auth/wrong-password' ||
            fbErr.code === 'auth/invalid-credential' ||
            fbErr.code === 'auth/invalid-login-credentials'
          ) {
            return { success: false, error: 'E-mail ou palavra-passe incorretos.' };
          }
          if (fbErr.code === 'auth/invalid-email') {
            return { success: false, error: 'Endereço de e-mail inválido.' };
          }
          if (fbErr.code === 'auth/user-disabled') {
            return { success: false, error: 'Esta conta de utilizador foi desativada.' };
          }
          if (fbErr.code === 'auth/too-many-requests') {
            return { success: false, error: 'Muitas tentativas falhadas. Tente novamente mais tarde.' };
          }
          return { success: false, error: fbErr.message || 'Falha na autenticação via Firebase.' };
        }
      }

      // Check registered users list (for fallback)
      const match = usersList.find(u => (u.email || '').toLowerCase() === normalizedEmail && normalizedEmail);
      if (match) {
        if (match.status === 'suspended' || match.statusConta === 'suspensa') {
          return { success: false, error: 'Sua conta está suspensa. Entre em contato com o suporte.' };
        }
        if (match.status === 'blocked' || match.statusConta === 'bloqueada') {
          return { success: false, error: 'Acesso bloqueado por violação das políticas da plataforma.' };
        }
        const tipo: 'cliente' | 'empresa' | 'tecnico' = (match.tipo === 'empresa' || match.tipoConta === 'empresa' || match.role === 'company')
          ? 'empresa'
          : (match.tipo === 'cliente' || match.tipoConta === 'cliente' || match.role === 'client')
            ? 'cliente'
            : 'tecnico';
        const tipoConta = tipo;
        const userWithTipo: User = { ...match, tipo, tipoConta };
        setCurrentUser(userWithTipo);
        if (typeof window !== 'undefined') {
          if (tipo === "empresa" || match.role === "company") {
            window.location.replace("painel-empresa.html");
          } else if (tipo === "tecnico" || match.role === "technician") {
            window.location.replace("painel-tecnico.html");
          } else if (tipo === "cliente" || match.role === "client") {
            window.location.replace("painel-cliente.html");
          }
        }
        return { success: true, user: userWithTipo };
      }

      // If user is the designated super admin email
      if (normalizedEmail === 'andrezefaniasjuniorr@gmail.com') {
        const superAdminUser: User = {
          uid: 'admin_owner',
          name: 'André Zefanias Júnior',
          email: normalizedEmail,
          phone: '+258 84 999 0001',
          role: 'super_admin',
          adminSubRole: 'super_admin',
          tipoConta: 'tecnico',
          statusAprovacao: 'aprovado',
          statusConta: 'ativa',
          status: 'active',
          createdAt: new Date().toISOString()
        };
        setUsersList(prev => [superAdminUser, ...prev]);
        setCurrentUser(superAdminUser);
        return { success: true, user: superAdminUser };
      }

      return { success: false, error: 'Nenhuma conta de Técnico ou Empresa encontrada com este e-mail.' };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Falha ao autenticar.' };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: {
    name: string;
    email: string;
    phone: string;
    password?: string;
    role: UserRole;
    tipo?: 'cliente' | 'tecnico' | 'empresa';
    tipoConta?: 'cliente' | 'tecnico' | 'empresa';
    idade?: number;
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
  }): Promise<{ success: boolean; error?: string }> => {
    // Variável global de controle para pausar o listener global durante o cadastro
    if (typeof window !== 'undefined') {
      window.isCreatingAccount = true;
      window.isRegistering = true;
    }
    setIsLoading(true);
    try {
      const normalizedEmail = (data?.email || '').toString().trim().toLowerCase();
      const rawPhone = (data?.phone || '').toString().trim();
      const cleanPhoneDigits = rawPhone.replace(/\D/g, '');

      if (!normalizedEmail) {
        return { success: false, error: 'Por favor, informe um endereço de e-mail válido.' };
      }

      // ANTI-DUPLICITY VALIDATION: Check local cache safely
      const emailExistsLocal = usersList.some(u => (u?.email || '').toString().toLowerCase().trim() === normalizedEmail && normalizedEmail !== '');
      if (emailExistsLocal) {
        return {
          success: false,
          error: 'E-mail já existente! Este e-mail já está cadastrado na plataforma. Faça login ou utilize outro e-mail.'
        };
      }

      const phoneExistsLocal = cleanPhoneDigits && usersList.some(u => {
        const uPhoneDigits = (u?.phone || '').toString().replace(/\D/g, '');
        return uPhoneDigits && (uPhoneDigits === cleanPhoneDigits || uPhoneDigits.endsWith(cleanPhoneDigits) || cleanPhoneDigits.endsWith(uPhoneDigits));
      });

      if (phoneExistsLocal) {
        return {
          success: false,
          error: 'Número de telefone já cadastrado. Por favor utilize outro número ou inicie sessão.'
        };
      }

      // ANTI-DUPLICITY VALIDATION: Query Firestore database
      if (isFirebaseConfigured && db) {
        try {
          const emailQuery = query(collection(db, 'users'), where('email', '==', normalizedEmail));
          const emailSnap = await getDocs(emailQuery);
          if (!emailSnap.empty) {
            return {
              success: false,
              error: 'E-mail já existente! Este e-mail já está cadastrado na plataforma. Faça login ou utilize outro e-mail.'
            };
          }

          if (rawPhone) {
            const phoneQuery = query(collection(db, 'users'), where('phone', '==', rawPhone));
            const phoneSnap = await getDocs(phoneQuery);
            if (!phoneSnap.empty) {
              return {
                success: false,
                error: 'Número de telefone já cadastrado. Por favor utilize outro número ou inicie sessão.'
              };
            }
          }
        } catch (queryErr) {
          console.warn('Firestore duplicity check warning:', queryErr);
        }
      }
      
      // Auto-promote super admin
      let userRole = data.role;
      let adminSubRole: AdminSubRole | undefined = undefined;
      if (normalizedEmail === 'andrezefaniasjuniorr@gmail.com') {
        userRole = 'super_admin';
        adminSubRole = 'super_admin';
      }

      let generatedUid = `user_${Date.now()}`;

      // If Firebase Auth is configured and password is provided, create Firebase User
      if (isFirebaseConfigured && auth && data.password) {
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, normalizedEmail, data.password);
          generatedUid = userCredential.user.uid;
        } catch (fbErr: any) {
          if (fbErr.code === 'auth/email-already-in-use') {
            return {
              success: false,
              error: 'E-mail já existente! Este e-mail já está cadastrado na plataforma. Faça login ou utilize outro e-mail.'
            };
          } else {
            console.warn('Firebase user creation notice:', fbErr?.code || fbErr?.message);
            if (fbErr.code === 'auth/weak-password') {
              return { success: false, error: 'A palavra-passe deve ter pelo menos 6 caracteres.' };
            }
            if (fbErr.code === 'auth/invalid-email') {
              return { success: false, error: 'Endereço de e-mail inválido.' };
            }
            return { success: false, error: fbErr.message || 'Falha ao criar conta no Firebase.' };
          }
        }
      }

      const defaultName = data.name.trim() || normalizedEmail.split('@')[0];
      
      let tipoConta: 'cliente' | 'tecnico' | 'empresa' = data.tipoConta || (userRole === 'company' ? 'empresa' : userRole === 'technician' ? 'tecnico' : 'cliente');
      if (userRole === 'company') tipoConta = 'empresa';
      if (userRole === 'technician') tipoConta = 'tecnico';
      if (userRole === 'client') tipoConta = 'cliente';

      const strictTipo: 'cliente' | 'tecnico' | 'empresa' = (data.tipo as any) || tipoConta;

      const isAutoApproved = userRole === 'client' || userRole === 'super_admin' || userRole === 'admin';
      const statusAprovacao = isAutoApproved ? 'aprovado' : 'pendente';
      const status: UserStatus = isAutoApproved ? 'active' : 'pending_approval';

      const userAge = data.idade ? Number(data.idade) : 25;
      const userPhoto = data.photoURL || data.avatarUrl || undefined;

      const newUser: User = {
        uid: generatedUid,
        name: defaultName,
        nome: defaultName,
        email: normalizedEmail,
        phone: rawPhone,
        nuit: data.nuit?.trim() || '',
        role: userRole,
        tipo: strictTipo, // FIX: Identificador estrito do tipo de conta ("empresa", "tecnico", "cliente")
        tipoConta: tipoConta,
        idade: userAge,
        photoURL: userPhoto,
        avatarUrl: userPhoto,
        totalLikes: 0,
        scoreEngajamento: 0,
        adminSubRole: adminSubRole,
        status: status,
        statusAprovacao: statusAprovacao,
        statusConta: 'ativa',
        isVerified: false,
        specialty: data.specialty || (userRole === 'technician' ? 'Eletricidade' : undefined),
        province: data.province || 'Maputo Cidade',
        city: data.city || 'Maputo',
        createdAt: new Date().toISOString()
      };

      // Save user to Firestore if available
      if (isFirebaseConfigured && db) {
        try {
          const userDocPayload = {
            ...newUser,
            uid: generatedUid,
            nome: defaultName,
            name: defaultName,
            email: normalizedEmail,
            nuit: data.nuit?.trim() || '',
            telefone: rawPhone,
            phone: rawPhone,
            role: userRole,
            tipo: strictTipo, // FIX: Identificador estrito do tipo de conta ("empresa")
            tipoConta: tipoConta,
            status: status,
            statusConta: 'ativa',
            statusAprovacao: statusAprovacao,
            criadoEm: serverTimestamp(),
            createdAt: serverTimestamp(),
            createdAtIso: new Date().toISOString()
          };

          const usuarioPayload = {
            ...userDocPayload,
            idade: userAge,
            especialidade: data.specialty || (userRole === 'technician' ? 'Eletricidade' : undefined),
            specialty: data.specialty || (userRole === 'technician' ? 'Eletricidade' : undefined),
            provincia: data.province || 'Maputo Cidade',
            province: data.province || 'Maputo Cidade',
            cidade: data.city || 'Maputo',
            city: data.city || 'Maputo',
            foto: userPhoto || '',
            avatarUrl: userPhoto || '',
            photoURL: userPhoto || '',
            pontos: 0,
            curtidas: 0,
            totalLikes: 0,
            scoreEngajamento: 0,
            dataCadastro: serverTimestamp()
          };

          await safeSetDoc(doc(db, 'usuarios', generatedUid), usuarioPayload);
          await safeSetDoc(doc(db, 'users', generatedUid), userDocPayload);
        } catch (dbErr) {
          console.warn('Firestore user doc creation notice:', dbErr);
        }
      }

      const updatedUsers = [...usersList, newUser];
      setUsersList(updatedUsers);

      if (userRole === 'technician') {
        const cleanWhatsapp = cleanPhoneDigits ? (cleanPhoneDigits.startsWith('258') ? cleanPhoneDigits : `258${cleanPhoneDigits}`) : '';
        const newTech: TechnicianProfile = {
          userId: generatedUid,
          name: defaultName,
          email: normalizedEmail,
          phone: rawPhone,
          whatsapp: cleanWhatsapp,
          showWhatsappButton: true,
          customWhatsappMessage: `Olá ${defaultName}, vi seu perfil na TécnicaMZ e gostaria de solicitar um orçamento.`,
          province: data.province || 'Maputo Cidade',
          city: data.city || 'Maputo',
          specialties: data.specialty ? [data.specialty] : ['Eletricidade'],
          bio: `Profissional qualificado em ${data.specialty || 'serviços técnicos'} em ${data.province || 'Moçambique'}.`,
          experienceYears: 1,
          idade: userAge,
          photoURL: userPhoto,
          avatarUrl: userPhoto,
          totalLikes: 0,
          scoreEngajamento: 0,
          verificationStatus: 'none',
          statusAprovacao: 'pendente',
          statusConta: 'ativa',
          isVerified: false,
          subscriptionStatus: 'none',
          rating: 5.0,
          reviewsCount: 0,
          completedJobsCount: 0,
          availability: 'available',
          status: 'pending_approval',
          createdAt: new Date().toISOString()
        };

        if (isFirebaseConfigured && db) {
          try {
            await setDoc(doc(db, 'technicians', generatedUid), {
              ...newTech,
              createdAt: serverTimestamp(),
              createdAtIso: new Date().toISOString()
            }, { merge: true });
            await setDoc(doc(db, 'usuarios', generatedUid), {
              ...newTech,
              uid: generatedUid,
              nome: defaultName,
              telefone: rawPhone,
              tipoConta: 'tecnico',
              createdAt: serverTimestamp(),
              createdAtIso: new Date().toISOString()
            }, { merge: true });
          } catch (dbErr) {
            console.warn('Firestore tech doc creation error:', dbErr);
          }
        }

        const updatedTechs = [...techList, newTech];
        setTechList(updatedTechs);
        setCurrentTechProfile(newTech);
      } else if (userRole === 'company') {
        const cleanWhatsapp = cleanPhoneDigits ? (cleanPhoneDigits.startsWith('258') ? cleanPhoneDigits : `258${cleanPhoneDigits}`) : '';
        const newComp: CompanyProfile = {
          userId: generatedUid,
          companyName: defaultName,
          commercialName: data.commercialName?.trim() || defaultName,
          nuit: data.nuit?.trim() || '400000000',
          email: normalizedEmail,
          phone: rawPhone,
          whatsapp: cleanWhatsapp,
          showWhatsappButton: true,
          website: data.website?.trim(),
          province: data.province || 'Maputo Cidade',
          city: data.city || 'Maputo',
          address: data.address?.trim() || 'Moçambique',
          industry: data.industry?.trim() || 'Engenharia & Construção',
          description: `Empresa ${defaultName} registada na TécnicaMZ para contratação de profissionais técnicos especializados.`,
          logoUrl: userPhoto,
          verificationStatus: 'unverified',
          statusAprovacao: 'pendente',
          statusConta: 'ativa',
          isVerified: false,
          rating: 5.0,
          reviewsCount: 0,
          hiredTechniciansCount: 0,
          activeJobsCount: 0,
          status: 'pending_approval',
          createdAt: new Date().toISOString()
        };

        if (isFirebaseConfigured && db) {
          try {
            await setDoc(doc(db, 'companies', generatedUid), {
              ...newComp,
              tipo: 'empresa',
              tipoConta: 'empresa',
              role: 'company',
              createdAt: serverTimestamp(),
              createdAtIso: new Date().toISOString()
            }, { merge: true });
          } catch (dbErr) {
            console.warn('Firestore company doc creation error:', dbErr);
          }
        }

        const updatedComps = [...companyList, newComp];
        setCompanyList(updatedComps);
        setCurrentCompanyProfile(newComp);
      }

      // 3. Libera o monitoramento global e redireciona manualmente
      if (typeof window !== 'undefined') {
        window.isCreatingAccount = false;
        window.isRegistering = false;
      }

      // 3. LÓGICA DE LOGIN E REDIRECIONAMENTO (switch userData.tipo)
      switch (strictTipo) {
        case "empresa":
          carregarPainelEmpresa(newUser);
          if (typeof window !== 'undefined') {
            window.location.replace("painel-empresa.html");
          }
          break;
        case "tecnico":
          if (userRole === 'super_admin' || userRole === 'admin') {
            window.location.hash = '#gestao-pro-mz';
          } else {
            carregarPainelTecnico(newUser);
            if (typeof window !== 'undefined') {
              window.location.replace("painel-tecnico.html");
            }
          }
          break;
        case "cliente":
          carregarPainelCliente(newUser);
          if (typeof window !== 'undefined') {
            window.location.replace("painel-cliente.html");
          }
          break;
        default:
          liberarAcessoApp(newUser);
      }
      liberarAcessoApp(newUser);
      return { success: true };
    } catch (err: any) {
      if (typeof window !== 'undefined') {
        window.isCreatingAccount = false;
        window.isRegistering = false;
      }
      return { success: false, error: err?.message || 'Falha ao registar conta.' };
    } finally {
      if (typeof window !== 'undefined') {
        window.isCreatingAccount = false;
        window.isRegistering = false;
      }
      setIsLoading(false);
    }
  };

  // Cadastrar Empresa com mitigação direta da Race Condition
  const cadastrarEmpresa = async (
    email: string,
    senha: string,
    dadosEmpresa: any
  ): Promise<{ success: boolean; user?: any; error?: string }> => {
    // Variável global de controle para pausar o listener global durante o cadastro
    if (typeof window !== 'undefined') {
      window.isCreatingAccount = true;
      window.isRegistering = true;
    }
    setIsLoading(true);

    try {
      const normalizedEmail = (email || '').toString().trim().toLowerCase();
      const nomeEmpresa = (typeof dadosEmpresa === 'object' ? (dadosEmpresa?.nome || dadosEmpresa?.name || dadosEmpresa?.companyName) : dadosEmpresa) || normalizedEmail.split('@')[0];
      const nuitEmpresa = (typeof dadosEmpresa === 'object' ? (dadosEmpresa?.nuit || dadosEmpresa?.nuir) : '') || '400000000';
      const telefoneEmpresa = (typeof dadosEmpresa === 'object' ? (dadosEmpresa?.telefone || dadosEmpresa?.phone) : '') || '';
      const cleanPhoneDigits = telefoneEmpresa.replace(/\D/g, '');
      const cleanWhatsapp = cleanPhoneDigits ? (cleanPhoneDigits.startsWith('258') ? cleanPhoneDigits : `258${cleanPhoneDigits}`) : '';

      let generatedUid = `company_${Date.now()}`;
      let authUser: any = null;

      // 1. Cria a conta no Firebase Auth
      if (isFirebaseConfigured && auth && senha) {
        const userCredential = await createUserWithEmailAndPassword(auth, normalizedEmail, senha);
        authUser = userCredential.user;
        generatedUid = authUser.uid;
      }

      const newCompanyUser: User = {
        uid: generatedUid,
        name: nomeEmpresa,
        nome: nomeEmpresa,
        email: normalizedEmail,
        phone: telefoneEmpresa,
        nuit: nuitEmpresa,
        role: 'company',
        tipo: 'empresa', // <--- GRAVAÇÃO CRUCIAL
        tipoConta: 'empresa',
        status: 'pending_approval',
        statusAprovacao: 'pendente',
        statusConta: 'ativa',
        isVerified: false,
        createdAt: new Date().toISOString()
      };

      const newCompanyProfile: CompanyProfile = {
        userId: generatedUid,
        companyName: nomeEmpresa,
        commercialName: nomeEmpresa,
        nuit: nuitEmpresa,
        email: normalizedEmail,
        phone: telefoneEmpresa,
        whatsapp: cleanWhatsapp,
        showWhatsappButton: true,
        province: (typeof dadosEmpresa === 'object' && dadosEmpresa?.provincia) || 'Maputo Cidade',
        city: (typeof dadosEmpresa === 'object' && dadosEmpresa?.cidade) || 'Maputo',
        address: (typeof dadosEmpresa === 'object' && dadosEmpresa?.endereco) || 'Moçambique',
        industry: (typeof dadosEmpresa === 'object' && dadosEmpresa?.ramo) || 'Construção & Engenharia Elétrica',
        description: `Empresa ${nomeEmpresa} registada na TécnicaMZ para contratação de profissionais técnicos especializados.`,
        verificationStatus: 'unverified',
        statusAprovacao: 'pendente',
        statusConta: 'ativa',
        isVerified: false,
        rating: 5.0,
        reviewsCount: 0,
        hiredTechniciansCount: 0,
        activeJobsCount: 0,
        status: 'pending_approval',
        createdAt: new Date().toISOString()
      };

      // 2. OBRIGATÓRIO: Salva os dados no Firestore ANTES de qualquer redirecionamento
      if (isFirebaseConfigured && db) {
        const payload = {
          uid: generatedUid,
          nome: nomeEmpresa,
          name: nomeEmpresa,
          email: normalizedEmail,
          nuit: nuitEmpresa,
          phone: telefoneEmpresa,
          telefone: telefoneEmpresa,
          tipo: 'empresa', // <--- GRAVAÇÃO CRUCIAL
          tipoConta: 'empresa',
          role: 'company',
          status: 'pending_approval',
          statusConta: 'ativa',
          criadoEm: serverTimestamp(),
          createdAt: serverTimestamp(),
          createdAtIso: new Date().toISOString()
        };

        await safeSetDoc(doc(db, 'users', generatedUid), payload);
        await safeSetDoc(doc(db, 'usuarios', generatedUid), payload);
        await setDoc(doc(db, 'companies', generatedUid), {
          ...newCompanyProfile,
          tipo: 'empresa',
          tipoConta: 'empresa',
          role: 'company',
          createdAt: serverTimestamp(),
          createdAtIso: new Date().toISOString()
        }, { merge: true });
      }

      setUsersList(prev => [...prev.filter(u => u.uid !== generatedUid), newCompanyUser]);
      setCompanyList(prev => [...prev.filter(c => c.userId !== generatedUid), newCompanyProfile]);
      setCurrentCompanyProfile(newCompanyProfile);

      // 3. Libera o monitoramento global e redireciona manualmente
      if (typeof window !== 'undefined') {
        window.isCreatingAccount = false;
        window.isRegistering = false;
        window.location.replace("painel-empresa.html");
      }

      carregarPainelEmpresa(newCompanyUser);
      liberarAcessoApp(newCompanyUser);

      return { success: true, user: authUser || newCompanyUser };
    } catch (error: any) {
      if (typeof window !== 'undefined') {
        window.isCreatingAccount = false;
        window.isRegistering = false;
      }
      console.error("Erro no cadastro da empresa:", error);
      return { success: false, error: error?.message || 'Falha ao cadastrar empresa.' };
    } finally {
      if (typeof window !== 'undefined') {
        window.isCreatingAccount = false;
        window.isRegistering = false;
      }
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
        localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
        localStorage.removeItem(CACHED_USER_KEY);
        localStorage.removeItem(CACHED_TECH_PROFILE_KEY);
        localStorage.removeItem(CACHED_COMPANY_PROFILE_KEY);
        localStorage.removeItem(LAST_ROUTE_KEY);
        window.location.hash = '';
      }
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      if (isFirebaseConfigured && auth) {
        await sendPasswordResetEmail(auth, email.trim().toLowerCase());
        return { success: true };
      }
      // If Firebase Auth is not yet provisioned with email link
      return { success: true };
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        return { success: false, error: 'Nenhum usuário encontrado com este e-mail.' };
      }
      return { success: false, error: err?.message || 'Erro ao enviar e-mail de recuperação.' };
    }
  };

  const changePassword = async (newPassword: string): Promise<{ success: boolean; error?: string }> => {
    try {
      if (isFirebaseConfigured && auth?.currentUser) {
        await fbUpdatePassword(auth.currentUser, newPassword);
        return { success: true };
      }
      return { success: true };
    } catch (err: any) {
      if (err.code === 'auth/requires-recent-login') {
        return { success: false, error: 'Por segurança, termine a sessão e entre novamente antes de alterar a palavra-passe.' };
      }
      return { success: false, error: err?.message || 'Erro ao alterar a palavra-passe.' };
    }
  };

  const updateCurrentUserProfile = async (data: Partial<User>) => {
    if (!currentUser) return;
    const nowIso = new Date().toISOString();
    const updated = { ...currentUser, ...data, updatedAt: nowIso };
    setCurrentUser(updated);
    setUsersList(prev => prev.map(u => (u.uid === currentUser.uid ? updated : u)));

    const isTech = currentUser.role === 'technician' || currentUser.tipoConta === 'tecnico';

    if (isTech) {
      const techUpdate: Partial<TechnicianProfile> = {};
      if (data.name) techUpdate.name = data.name;
      if (data.phone) techUpdate.phone = data.phone;
      if (data.avatarUrl !== undefined) {
        techUpdate.avatarUrl = data.avatarUrl;
        techUpdate.photoURL = data.avatarUrl;
      }
      if (data.photoURL !== undefined) {
        techUpdate.photoURL = data.photoURL;
        techUpdate.avatarUrl = data.photoURL;
      }
      if (data.idade !== undefined) techUpdate.idade = data.idade;
      if (data.province) techUpdate.province = data.province;
      if (data.city) techUpdate.city = data.city;
      if (data.specialties) techUpdate.specialties = data.specialties;
      if (data.bio) techUpdate.bio = data.bio;
      if (data.whatsapp) techUpdate.whatsapp = data.whatsapp;
      if (Object.keys(techUpdate).length > 0) {
        updateCurrentTechProfile(techUpdate);
      }
    }

    if (isFirebaseConfigured && db) {
      try {
        const payload = {
          ...data,
          nome: data.name || currentUser.name,
          updatedAt: nowIso
        };
        // Gravação instantânea no Firestore em 'users' e 'usuarios'
        await setDoc(doc(db, 'users', currentUser.uid), payload, { merge: true });
        await setDoc(doc(db, 'usuarios', currentUser.uid), payload, { merge: true });

        if (isTech) {
          const techDocPayload: Record<string, any> = { updatedAt: nowIso };
          if (data.name) techDocPayload.name = data.name;
          if (data.phone) techDocPayload.phone = data.phone;
          if (data.avatarUrl !== undefined) {
            techDocPayload.avatarUrl = data.avatarUrl;
            techDocPayload.photoURL = data.avatarUrl;
          }
          if (data.photoURL !== undefined) {
            techDocPayload.photoURL = data.photoURL;
            techDocPayload.avatarUrl = data.photoURL;
          }
          if (data.idade !== undefined) techDocPayload.idade = data.idade;
          if (data.province) techDocPayload.province = data.province;
          if (data.city) techDocPayload.city = data.city;
          if (data.specialties) techDocPayload.specialties = data.specialties;
          if (data.bio) techDocPayload.bio = data.bio;
          if (data.whatsapp) techDocPayload.whatsapp = data.whatsapp;
          await setDoc(doc(db, 'technicians', currentUser.uid), techDocPayload, { merge: true });
        }
      } catch (err) {
        console.warn('Firestore user update error:', err);
      }
    }
  };

  const updateCurrentTechProfile = async (data: Partial<TechnicianProfile>) => {
    if (!currentUser || (currentUser.role !== 'technician' && currentUser.tipoConta !== 'tecnico')) return;
    const nowIso = new Date().toISOString();
    const existing = currentTechProfile || ({} as TechnicianProfile);
    const updated: TechnicianProfile = {
      ...existing,
      ...data,
      userId: currentUser.uid,
      updatedAt: nowIso
    };
    setCurrentTechProfile(updated);
    setTechList(prev => {
      const exists = prev.some(t => t.userId === currentUser.uid);
      if (exists) {
        return prev.map(t => (t.userId === currentUser.uid ? updated : t));
      }
      return [...prev, updated];
    });

    if (isFirebaseConfigured && db) {
      try {
        const techPayload = {
          ...data,
          userId: currentUser.uid,
          updatedAt: nowIso
        };
        // Grava instantaneamente no documento do técnico
        await setDoc(doc(db, 'technicians', currentUser.uid), techPayload, { merge: true });

        // Espelha dados nos documentos de usuário
        const userPayload: Record<string, any> = { updatedAt: nowIso };
        if (data.name) {
          userPayload.name = data.name;
          userPayload.nome = data.name;
        }
        if (data.phone) userPayload.phone = data.phone;
        if (data.avatarUrl !== undefined) {
          userPayload.avatarUrl = data.avatarUrl;
          userPayload.photoURL = data.avatarUrl;
        }
        if (data.photoURL !== undefined) {
          userPayload.photoURL = data.photoURL;
          userPayload.avatarUrl = data.photoURL;
        }
        if (data.idade !== undefined) userPayload.idade = data.idade;
        if (data.province) userPayload.province = data.province;
        if (data.city) userPayload.city = data.city;
        if (data.bio) userPayload.bio = data.bio;
        if (data.specialties) {
          userPayload.specialties = data.specialties;
          userPayload.especialidade = data.specialties[0];
        }
        if (data.whatsapp) userPayload.whatsapp = data.whatsapp;

        await setDoc(doc(db, 'users', currentUser.uid), userPayload, { merge: true });
        await setDoc(doc(db, 'usuarios', currentUser.uid), userPayload, { merge: true });
      } catch (err) {
        console.warn('Firestore tech update error:', err);
      }
    }
  };

  const updateCurrentCompanyProfile = async (data: Partial<CompanyProfile>) => {
    if (!currentUser || (currentUser.role !== 'company' && currentUser.tipoConta !== 'empresa')) return;
    const existing = currentCompanyProfile || ({} as CompanyProfile);
    const updated: CompanyProfile = {
      ...existing,
      ...data,
      userId: currentUser.uid,
      updatedAt: new Date().toISOString()
    };
    setCurrentCompanyProfile(updated);
    setCompanyList(prev => {
      const exists = prev.some(c => c.userId === currentUser.uid);
      if (exists) {
        return prev.map(c => (c.userId === currentUser.uid ? updated : c));
      }
      return [...prev, updated];
    });

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'companies', currentUser.uid), { ...data, updatedAt: new Date().toISOString() }, { merge: true });
      } catch (err) {
        console.warn('Firestore company update error:', err);
      }
    }
  };

  // 1 VOTO ÚNICO POR USUÁRIO COM PERSISTÊNCIA REAL-TIME NO FIRESTORE & TOGGLE (DESFAZ VOTO)
  const toggleTechnicianLike = async (
    techUserId: string
  ): Promise<{ success: boolean; totalLikes: number; hasLiked: boolean; error?: string }> => {
    if (!techUserId) return { success: false, totalLikes: 0, hasLiked: false, error: 'ID de técnico inválido.' };

    // Determina o UID do votante (ou ID persistente de convidado se anónimo)
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
    const techLikedUsers = Array.isArray(targetTech?.likedByUsers) ? targetTech.likedByUsers : [];

    // Verificação estrita de voto único por UID
    const alreadyLiked = techLikedUsers.includes(currentVoterId) || likedList.includes(techUserId);
    const willLike = !alreadyLiked;

    // Atualiza armazenamento local
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

    // Chama o serviço de engajamento atômico (Firestore transaction + recálculo de estrelas e ranking)
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

    // Atualização otimista de estado React em tempo real
    setTechList(prev =>
      prev.map(t => {
        if (t.userId !== techUserId) return t;
        const currentVoters = Array.isArray(t.likedByUsers) ? t.likedByUsers : [];
        const updatedVoters = willLike
          ? currentVoters.includes(currentVoterId)
            ? currentVoters
            : [...currentVoters, currentVoterId]
          : currentVoters.filter(id => id !== currentVoterId);
        return {
          ...t,
          totalLikes: newLikes,
          scoreEngajamento: newScore,
          pontos: newScore,
          points: newScore,
          likedByUsers: updatedVoters
        };
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

    // Persistência robusta no Firestore com verificação por UID
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
          }).catch(() => {});
        } else {
          await deleteDoc(likeDocRef).catch(() => {});

          await updateDoc(doc(db, 'technicians', techUserId), {
            likedByUsers: arrayRemove(currentVoterId),
            totalLikes: newLikes,
            scoreEngajamento: newScore,
            updatedAt: new Date().toISOString()
          }).catch(() => {});
        }

        // Recalcula a pontuação do técnico e a posição no ranking em tempo real
        await recalculateUserStarsAndRanking(techUserId);
      } catch (err) {
        console.warn('Firestore toggle technician like error:', err);
      }
    }

    return { success: true, hasLiked: willLike, totalLikes: newLikes };
  };

  const giveTechnicianLike = async (
    techUserId: string
  ): Promise<{ success: boolean; totalLikes: number; hasLiked?: boolean; error?: string }> => {
    return toggleTechnicianLike(techUserId);
  };

  const switchUserRole = async (newRole: UserRole) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, role: newRole, updatedAt: new Date().toISOString() };
    setCurrentUser(updatedUser);
    setUsersList(prev => prev.map(u => (u.uid === currentUser.uid ? updatedUser : u)));

    if (isFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, 'users', currentUser.uid), { role: newRole, updatedAt: new Date().toISOString() });
      } catch (err) {
        console.warn('Firestore role update error:', err);
      }
    }

    if (newRole === 'technician' && !currentTechProfile) {
      const cleanPhone = (currentUser.phone || '').replace(/\D/g, '');
      const cleanWhatsapp = cleanPhone ? (cleanPhone.startsWith('258') ? cleanPhone : `258${cleanPhone}`) : '';
      const newTech: TechnicianProfile = {
        userId: currentUser.uid,
        name: currentUser.name,
        email: currentUser.email,
        phone: currentUser.phone || '',
        whatsapp: cleanWhatsapp,
        showWhatsappButton: true,
        customWhatsappMessage: `Olá ${currentUser.name}, vi seu perfil na TécnicaMZ e gostaria de solicitar um orçamento.`,
        province: 'Maputo Cidade',
        city: 'Maputo',
        specialties: ['Eletricidade Geral'],
        bio: `Técnico credenciado na plataforma TécnicaMZ.`,
        experienceYears: 1,
        verificationStatus: 'none',
        subscriptionStatus: 'none',
        rating: 5.0,
        reviewsCount: 0,
        completedJobsCount: 0,
        availability: 'available',
        status: 'active',
        createdAt: new Date().toISOString()
      };
      setCurrentTechProfile(newTech);
      setTechList(prev => [...prev.filter(t => t.userId !== currentUser.uid), newTech]);
      if (isFirebaseConfigured && db) {
        try {
          await setDoc(doc(db, 'technicians', currentUser.uid), newTech);
        } catch (e) {
          console.warn('Firestore set tech doc error:', e);
        }
      }
    }
  };

  const updateUserStatus = async (userId: string, status: UserStatus) => {
    setUsersList(prev => prev.map(u => (u.uid === userId ? { ...u, status } : u)));
    if (isFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, 'users', userId), { status, updatedAt: new Date().toISOString() });
      } catch (err) {
        console.warn('Firestore update user status error:', err);
      }
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
      try {
        await updateDoc(doc(db, 'users', userId), {
          statusAprovacao: 'aprovado',
          status: 'active',
          statusConta: 'ativa',
          updatedAt: nowIso
        });
      } catch (err) {
        console.warn('Firestore approve user error:', err);
      }

      try {
        await updateDoc(doc(db, 'technicians', userId), {
          statusAprovacao: 'aprovado',
          status: 'active',
          statusConta: 'ativa',
          updatedAt: nowIso
        });
      } catch (err) {
        // May not exist if company
      }

      try {
        await updateDoc(doc(db, 'companies', userId), {
          statusAprovacao: 'aprovado',
          status: 'active',
          statusConta: 'ativa',
          updatedAt: nowIso
        });
      } catch (err) {
        // May not exist if tech
      }
    }
  };

  const rejectUserAccount = async (userId: string, reason = 'Cadastro não atende aos requisitos mínimos.') => {
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
      try {
        await updateDoc(doc(db, 'users', userId), {
          statusAprovacao: 'rejeitado',
          status: 'suspended',
          suspensionReason: reason,
          rejectionReason: reason,
          updatedAt: nowIso
        });
      } catch (err) {
        console.warn('Firestore reject user error:', err);
      }
    }
  };

  const toggleUserVerification = async (userId: string) => {
    const target = usersList.find(u => u.uid === userId);
    if (!target) return;
    const nowIso = new Date().toISOString();
    const newVerified = !target.isVerified;

    setUsersList(prev =>
      prev.map(u => (u.uid === userId ? { ...u, isVerified: newVerified, updatedAt: nowIso } : u))
    );
    setTechList(prev =>
      prev.map(t =>
        t.userId === userId
          ? { ...t, isVerified: newVerified, verificationStatus: newVerified ? 'approved' : 'none', updatedAt: nowIso }
          : t
      )
    );
    setCompanyList(prev =>
      prev.map(c =>
        c.userId === userId
          ? { ...c, isVerified: newVerified, verificationStatus: newVerified ? 'verified' : 'unverified', updatedAt: nowIso }
          : c
      )
    );

    if (currentUser?.uid === userId) {
      setCurrentUser(prev => (prev ? { ...prev, isVerified: newVerified, updatedAt: nowIso } : null));
    }

    if (isFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, 'users', userId), { isVerified: newVerified, updatedAt: nowIso });
      } catch (err) {
        console.warn('Firestore toggle user verified error:', err);
      }
      try {
        await updateDoc(doc(db, 'technicians', userId), {
          isVerified: newVerified,
          verificationStatus: newVerified ? 'approved' : 'none',
          updatedAt: nowIso
        });
      } catch {}
      try {
        await updateDoc(doc(db, 'companies', userId), {
          isVerified: newVerified,
          verificationStatus: newVerified ? 'verified' : 'unverified',
          updatedAt: nowIso
        });
      } catch {}
    }
  };

  const grantManualSubscription30Days = async (userId: string) => {
    const target = usersList.find(u => u.uid === userId);
    if (!target) return;

    const now = Date.now();
    const currentExp = target.dataExpiracao || target.subscriptionExpiresAt;
    const currentExpTime = currentExp ? new Date(currentExp).getTime() : 0;
    const baseTime = currentExpTime > now ? currentExpTime : now;
    const newExpDate = new Date(baseTime + 30 * 24 * 60 * 60 * 1000);
    const dataExpiracao = newExpDate.toISOString();
    const nowIso = new Date().toISOString();

    const updatedUser: User = {
      ...target,
      statusAssinatura: 'ativa',
      subscriptionStatus: 'active',
      planoAtivo: '50mt',
      planoAssinatura: 'plano_tecnico_pro',
      activePlanId: 'plano_tecnico_pro',
      dataExpiracao: dataExpiracao,
      subscriptionExpiresAt: dataExpiracao,
      updatedAt: nowIso
    };

    setUsersList(prev => prev.map(u => (u.uid === userId ? updatedUser : u)));
    if (currentUser?.uid === userId) {
      setCurrentUser(updatedUser);
    }

    if (isFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, 'users', userId), {
          statusAssinatura: 'ativa',
          subscriptionStatus: 'active',
          planoAtivo: '50mt',
          planoAssinatura: 'plano_tecnico_pro',
          activePlanId: 'plano_tecnico_pro',
          dataExpiracao: dataExpiracao,
          subscriptionExpiresAt: dataExpiracao,
          updatedAt: nowIso
        });
      } catch (err) {
        console.warn('Firestore grant manual subscription error:', err);
      }

      if (target.role === 'technician') {
        try {
          await updateDoc(doc(db, 'technicians', userId), {
            subscriptionStatus: 'active',
            activePlanId: 'plano_tecnico_pro',
            subscriptionExpiresAt: dataExpiracao,
            updatedAt: nowIso
          });
        } catch {}
      }
    }
  };

  const deleteUserAccount = async (userId: string) => {
    setUsersList(prev => prev.filter(u => u.uid !== userId));
    setTechList(prev => prev.filter(t => t.userId !== userId));
    setCompanyList(prev => prev.filter(c => c.userId !== userId));
    if (isFirebaseConfigured && db) {
      try {
        await deleteDoc(doc(db, 'users', userId));
        await deleteDoc(doc(db, 'technicians', userId));
        await deleteDoc(doc(db, 'companies', userId));
      } catch (err) {
        console.warn('Firestore delete user error:', err);
      }
    }
  };

  // =========================================================================
  // PAYWALL & SUBSCRIPTION STRICT COMPUTATIONS
  // =========================================================================
  const isSubscriptionActive = React.useMemo(() => {
    if (!currentUser) return false;
    // Super Admins and Admins bypass paywall
    if (
      currentUser.role === 'super_admin' ||
      currentUser.role === 'admin' ||
      currentUser.adminSubRole === 'super_admin'
    ) {
      return true;
    }
    if (currentUser.email && currentUser.email.toLowerCase() === 'andrezefaniasjuniorr@gmail.com') {
      return true;
    }

    // Selo MZ active unlocks full platform features
    if (currentUser.temSeloMZ || currentUser.statusSelo === 'aprovado') {
      return true;
    }

    // Check statusAssinatura or subscriptionStatus
    const status = (currentUser.statusAssinatura || currentUser.subscriptionStatus || '').toLowerCase();
    if (status === 'ativa' || status === 'active') {
      const expStr = currentUser.dataExpiracao || currentUser.subscriptionExpiresAt;
      if (!expStr) return true;
      const expTime = new Date(expStr).getTime();
      if (!isNaN(expTime) && expTime > Date.now()) {
        return true;
      }
    }

    return false;
  }, [currentUser]);

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

  // SINGLE PLAN 50 MT UNLOCKS ALL TOOLS UNRESTRICTED:
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

    const now = new Date();
    const expDate = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);
    const dataExpiracao = expDate.toISOString();

    const updatedUser: User = {
      ...currentUser,
      statusAssinatura: 'ativa',
      subscriptionStatus: 'active',
      planoAtivo: '50mt',
      planoAssinatura: 'plano_tecnico_pro',
      activePlanId: 'plano_tecnico_pro',
      dataExpiracao: dataExpiracao,
      subscriptionExpiresAt: dataExpiracao,
      isVerified: true,
      updatedAt: now.toISOString()
    };

    setCurrentUser(updatedUser);
    setUsersList(prev => prev.map(u => (u.uid === currentUser.uid ? updatedUser : u)));

    if (isFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, 'users', currentUser.uid), {
          statusAssinatura: 'ativa',
          subscriptionStatus: 'active',
          planoAtivo: '50mt',
          planoAssinatura: 'plano_tecnico_pro',
          activePlanId: 'plano_tecnico_pro',
          dataExpiracao: dataExpiracao,
          subscriptionExpiresAt: dataExpiracao,
          isVerified: true,
          updatedAt: now.toISOString()
        });
      } catch (err) {
        console.warn('Firestore user subscription update error:', err);
      }

      if (currentUser.role === 'technician') {
        try {
          await updateDoc(doc(db, 'technicians', currentUser.uid), {
            subscriptionStatus: 'active',
            activePlanId: 'plano_tecnico_pro',
            subscriptionExpiresAt: dataExpiracao,
            verificationStatus: 'approved',
            isVerified: true,
            updatedAt: now.toISOString()
          });
        } catch (err) {
          console.warn('Firestore tech sub update error:', err);
        }
      }
    }

    return true;
  };

  const isCompany = currentUser?.tipoConta === 'empresa' || currentUser?.role === 'company' || (currentUser?.role as any) === 'empresa';
  const isTechnician = !isCompany && (currentUser?.tipoConta === 'tecnico' || currentUser?.role === 'technician' || (currentUser?.role as any) === 'tecnico');
  const isClient = !isCompany && !isTechnician && (currentUser?.tipoConta === 'cliente' || currentUser?.role === 'client' || (currentUser?.role as any) === 'cliente');
  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'super_admin';
  const isSuperAdmin = currentUser?.role === 'super_admin' || currentUser?.adminSubRole === 'super_admin';
  const isFinanceAdmin = isSuperAdmin || currentUser?.adminSubRole === 'finance_admin';
  const isModerator = isSuperAdmin || currentUser?.adminSubRole === 'moderator';

  // SELO MZ CALCULATION & ACCESS CONTROL
  const temSeloMZ = React.useMemo<boolean>(() => {
    if (!currentUser) return false;
    if (
      currentUser.role === 'super_admin' ||
      currentUser.role === 'admin' ||
      currentUser.adminSubRole === 'super_admin' ||
      (currentUser.email && currentUser.email.toLowerCase() === 'andrezefaniasjuniorr@gmail.com')
    ) {
      return true;
    }
    return Boolean(currentUser.temSeloMZ || currentUser.statusSelo === 'aprovado');
  }, [currentUser]);

  const statusSelo = React.useMemo<'nenhum' | 'pendente_aprovacao' | 'aprovado' | 'rejeitado'>(() => {
    if (!currentUser) return 'nenhum';
    if (temSeloMZ) return 'aprovado';
    return currentUser.statusSelo || 'nenhum';
  }, [currentUser, temSeloMZ]);

  const isRestrictedTechnician = React.useMemo<boolean>(() => {
    if (!currentUser) return false;
    if (currentUser.role === 'super_admin' || currentUser.role === 'admin' || currentUser.adminSubRole === 'super_admin') {
      return false;
    }
    const isTech = currentUser.tipoConta === 'tecnico' || currentUser.role === 'technician';
    if (!isTech) return false;
    return !temSeloMZ;
  }, [currentUser, temSeloMZ]);

  // Sincronização automática com a chave 'tecnico_verificado' no localStorage
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('tecnico_verificado', temSeloMZ ? 'true' : 'false');
      } catch {}
    }
  }, [temSeloMZ]);

  // SELO MZ ACTIONS
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
      tipoConta: currentUser.tipoConta || 'tecnico',
      operadora,
      mensagemTransacao: trimmedMsg,
      valor: 50,
      statusSelo: 'pendente_aprovacao',
      dataEnvio: nowIso
    };

    // Update local currentUser
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

    // Update in Firestore
    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'solicitacoes_selo', reqId), novaSolicitacao);
      } catch (err) {
        console.warn('Firestore create solicitacao_selo error:', err);
      }

      try {
        await updateDoc(doc(db, 'users', currentUser.uid), {
          statusSelo: 'pendente_aprovacao',
          operadoraSelo: operadora,
          mensagemTransacaoSelo: trimmedMsg,
          dataSeloEnvio: nowIso,
          updatedAt: nowIso
        });
      } catch (err) {
        console.warn('Firestore update user selo error:', err);
      }
    }

    return { success: true };
  };

  const aprovarSeloMZ = async (
    solicitacaoId: string,
    userId: string
  ): Promise<{ success: boolean; error?: string }> => {
    const nowIso = new Date().toISOString();

    // Update solicitacoes list
    setSolicitacoesSelo(prev =>
      prev.map(s =>
        s.id === solicitacaoId
          ? {
              ...s,
              statusSelo: 'aprovado',
              dataResposta: nowIso,
              aprovadoPor: currentUser?.name || 'Administrador'
            }
          : s
      )
    );

    // Update users list
    setUsersList(prev =>
      prev.map(u =>
        u.uid === userId
          ? {
              ...u,
              temSeloMZ: true,
              statusSelo: 'aprovado',
              isVerified: true,
              statusAprovacao: 'aprovado',
              statusConta: 'ativa',
              status: 'active',
              statusAssinatura: 'ativa',
              subscriptionStatus: 'active',
              dataSeloAprovacao: nowIso,
              updatedAt: nowIso
            }
          : u
      )
    );

    // If current logged-in user is the one approved
    if (currentUser?.uid === userId) {
      setCurrentUser(prev =>
        prev
          ? {
              ...prev,
              temSeloMZ: true,
              statusSelo: 'aprovado',
              isVerified: true,
              statusAprovacao: 'aprovado',
              statusConta: 'ativa',
              status: 'active',
              statusAssinatura: 'ativa',
              subscriptionStatus: 'active',
              dataSeloAprovacao: nowIso,
              updatedAt: nowIso
            }
          : null
      );
    }

    if (isFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, 'solicitacoes_selo', solicitacaoId), {
          statusSelo: 'aprovado',
          dataResposta: nowIso,
          aprovadoPor: currentUser?.name || 'Administrador'
        });
      } catch (err) {
        console.warn('Firestore approve solicitacao_selo error:', err);
      }

      try {
        await updateDoc(doc(db, 'users', userId), {
          temSeloMZ: true,
          statusSelo: 'aprovado',
          isVerified: true,
          statusAprovacao: 'aprovado',
          statusConta: 'ativa',
          status: 'active',
          statusAssinatura: 'ativa',
          subscriptionStatus: 'active',
          dataSeloAprovacao: nowIso,
          updatedAt: nowIso
        });
      } catch (err) {
        console.warn('Firestore approve user selo error:', err);
      }

      try {
        await updateDoc(doc(db, 'technicians', userId), {
          temSeloMZ: true,
          statusSelo: 'aprovado',
          isVerified: true,
          verificationStatus: 'approved',
          statusAprovacao: 'aprovado',
          statusConta: 'ativa',
          status: 'active',
          subscriptionStatus: 'active',
          updatedAt: nowIso
        });
      } catch {
        // may not exist
      }
    }

    return { success: true };
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

    setUsersList(prev =>
      prev.map(u =>
        u.uid === userId
          ? {
              ...u,
              temSeloMZ: false,
              statusSelo: 'rejeitado',
              motivoRejeicaoSelo: motivo,
              updatedAt: nowIso
            }
          : u
      )
    );

    if (currentUser?.uid === userId) {
      setCurrentUser(prev =>
        prev
          ? {
              ...prev,
              temSeloMZ: false,
              statusSelo: 'rejeitado',
              motivoRejeicaoSelo: motivo,
              updatedAt: nowIso
            }
          : null
      );
    }

    if (isFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, 'solicitacoes_selo', solicitacaoId), {
          statusSelo: 'rejeitado',
          motivoRejeicao: motivo,
          dataResposta: nowIso
        });
      } catch (err) {
        console.warn('Firestore reject solicitacao_selo error:', err);
      }

      try {
        await updateDoc(doc(db, 'users', userId), {
          temSeloMZ: false,
          statusSelo: 'rejeitado',
          motivoRejeicaoSelo: motivo,
          updatedAt: nowIso
        });
      } catch (err) {
        console.warn('Firestore reject user selo error:', err);
      }
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
        isRestrictedTechnician,
        solicitacoesSelo,
        solicitarSeloMZ,
        aprovarSeloMZ,
        rejeitarSeloMZ,

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
