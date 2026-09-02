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
import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, onSnapshot, query, where, getDocs, serverTimestamp } from 'firebase/firestore';

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
  updateCurrentUserProfile: (data: Partial<User>) => Promise<void>;
  updateCurrentTechProfile: (data: Partial<TechnicianProfile>) => Promise<void>;
  updateCurrentCompanyProfile: (data: Partial<CompanyProfile>) => Promise<void>;
  giveTechnicianLike: (techUserId: string) => Promise<{ success: boolean; totalLikes: number }>;
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

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const savedId = safeGetStorageItem<string | null>(LOCAL_STORAGE_USER_KEY, null);
    if (savedId) {
      const initialUsers = safeGetStorageItem<User[]>('tecnicamz_users', []);
      const found = initialUsers.find(u => u.uid === savedId);
      if (found) return found;
    }
    return null;
  });

  const [currentTechProfile, setCurrentTechProfile] = useState<TechnicianProfile | null>(null);
  const [currentCompanyProfile, setCurrentCompanyProfile] = useState<CompanyProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(() => {
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
          const role = String(d.role || d.tipoConta || 'technician').toLowerCase().trim();
          const isTech = role === 'technician' || role === 'tecnico' || d.tipoConta === 'tecnico';
          const defaultName = d.name || d.nome || 'Técnico Especialista';
          const cleanPhone = d.phone || d.telefone || '';
          const userObj: User = {
            uid: docSnap.id,
            name: defaultName,
            email: d.email || '',
            phone: cleanPhone,
            role: (role === 'company' || role === 'empresa') ? 'company' : (role === 'admin' ? 'admin' : (role === 'super_admin' ? 'super_admin' : 'technician')),
            tipoConta: (role === 'company' || role === 'empresa') ? 'empresa' : 'tecnico',
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
            scoreEngajamento: typeof d.scoreEngajamento === 'number' ? d.scoreEngajamento : 0,
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
              scoreEngajamento: typeof d.scoreEngajamento === 'number' ? d.scoreEngajamento : 0,
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
      if (currentUser.role === 'technician') {
        const tech = techList.find(t => t.userId === currentUser.uid) || null;
        setCurrentTechProfile(tech);
        setCurrentCompanyProfile(null);
      } else if (currentUser.role === 'company') {
        const comp = companyList.find(c => c.userId === currentUser.uid) || null;
        setCurrentCompanyProfile(comp);
        setCurrentTechProfile(null);
      } else {
        setCurrentTechProfile(null);
        setCurrentCompanyProfile(null);
      }
    } else {
      safeRemoveStorageItem(LOCAL_STORAGE_USER_KEY);
      setCurrentTechProfile(null);
      setCurrentCompanyProfile(null);
    }
  }, [currentUser?.uid, currentUser?.role, techList, companyList]);

  // Keep local storage synchronized with current lists
  useEffect(() => {
    safeSetStorageItem('tecnicamz_users', usersList);
  }, [usersList]);

  useEffect(() => {
    safeSetStorageItem('tecnicamz_technicians', techList);
  }, [techList]);

  useEffect(() => {
    safeSetStorageItem('tecnicamz_companies', companyList);
  }, [companyList]);

  useEffect(() => {
    safeSetStorageItem('tecnicamz_solicitacoes_selo', solicitacoesSelo);
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

  // Helper: Liberar acesso ao App com persistência, sincronização de lista e redirecionamento de tela
  const liberarAcessoApp = (user: User) => {
    setCurrentUser(user);
    safeSetStorageItem(LOCAL_STORAGE_USER_KEY, user.uid);
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
      if (!currentHash || currentHash === 'login' || currentHash === 'auth') {
        if (user.role === 'technician' || user.tipoConta === 'tecnico') {
          window.location.hash = '#tecnico';
        } else if (user.role === 'company' || user.tipoConta === 'empresa') {
          window.location.hash = '#empresa';
        } else if (user.role === 'super_admin' || user.role === 'admin') {
          window.location.hash = '#gestao-pro-mz';
        } else if (user.role === 'client' || user.tipoConta === 'cliente') {
          window.location.hash = '#cliente';
        }
      }
    }
  };

  // Firebase auth state listener - runs once on mount
  useEffect(() => {
    let profileUnsub: (() => void) | null = null;

    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
        if (profileUnsub) {
          profileUnsub();
          profileUnsub = null;
        }

        if (fbUser) {
          const normalizedEmail = (fbUser.email || '').trim().toLowerCase();
          const defaultName = fbUser.displayName || (normalizedEmail ? normalizedEmail.split('@')[0] : 'Técnico MZ');
          const isSuperAdminEmail = normalizedEmail === 'andrezefaniasjuniorr@gmail.com';

          // Garante acesso imediato mesmo antes da resposta do Firestore
          const fallbackUser: User = {
            uid: fbUser.uid,
            name: defaultName,
            email: normalizedEmail,
            phone: fbUser.phoneNumber || '',
            role: isSuperAdminEmail ? 'super_admin' : 'technician',
            tipoConta: 'tecnico',
            statusAprovacao: 'aprovado',
            statusConta: 'ativa',
            status: 'active',
            createdAt: new Date().toISOString()
          };
          liberarAcessoApp(fallbackUser);

          try {
            if (db) {
              const userRef = doc(db, 'usuarios', fbUser.uid);
              const usersRef = doc(db, 'users', fbUser.uid);

              let userSnap = await safeGetDoc(userRef, 2, 400);
              let usersSnap = await safeGetDoc(usersRef, 2, 400);

              // Se ambos foram verificados online e nenhum existe, auto-repara o perfil
              if (userSnap && usersSnap && !userSnap.exists() && !usersSnap.exists()) {
                const repairPayload = {
                  uid: fbUser.uid,
                  email: normalizedEmail,
                  nome: defaultName,
                  name: defaultName,
                  role: isSuperAdminEmail ? 'super_admin' : 'tecnico',
                  tipoConta: 'tecnico',
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

                // Assegura também documento de técnico para manter compatibilidade
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

                userSnap = await safeGetDoc(userRef, 1, 300);
              }

              // Extrai com segurança os dados de perfil se o documento foi obtido
              const rawData = ((userSnap && userSnap.exists()) ? userSnap.data() : ((usersSnap && usersSnap.exists()) ? usersSnap.data() : {})) || {};
              const rawRole = String(rawData.role || rawData.tipoConta || '').toLowerCase().trim();
              const isSuper = isSuperAdminEmail || rawRole === 'super_admin' || rawData.role === 'super_admin';

              let tipoConta: 'cliente' | 'tecnico' | 'empresa';
              let role: UserRole;

              if (isSuper) {
                tipoConta = 'tecnico';
                role = 'super_admin';
              } else if (rawRole === 'admin' || rawData.role === 'admin') {
                tipoConta = 'tecnico';
                role = 'admin';
              } else if (rawRole === 'empresa' || rawRole === 'company' || rawData.tipoConta === 'empresa' || rawData.role === 'company') {
                tipoConta = 'empresa';
                role = 'company';
              } else {
                tipoConta = 'tecnico';
                role = 'technician';
              }

              const statusAprovacao = isSuper ? 'aprovado' : (rawData.statusAprovacao || (rawData.status === 'pending_approval' ? 'pendente' : 'aprovado'));

              const firestoreUserData: User = {
                uid: fbUser.uid,
                name: rawData.name || rawData.nome || defaultName,
                email: normalizedEmail,
                phone: rawData.phone || rawData.telefone || fbUser.phoneNumber || '',
                role: role,
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
                totalLikes: typeof rawData.totalLikes === 'number' ? rawData.totalLikes : (typeof rawData.curtidas === 'number' ? rawData.curtidas : 0),
                scoreEngajamento: typeof rawData.scoreEngajamento === 'number' ? rawData.scoreEngajamento : (typeof rawData.pontos === 'number' ? rawData.pontos : 0),
                createdAt: rawData.createdAt || rawData.dataCadastro || new Date().toISOString(),
                updatedAt: rawData.updatedAt
              };

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

              // Sincronização em tempo real caso o Firestore reconecte ou haja atualização
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
                        temSeloMZ: Boolean(live.temSeloMZ || live.statusSelo === 'aprovado' || prev.temSeloMZ),
                        statusSelo: live.statusSelo || prev.statusSelo,
                        statusAprovacao: live.statusAprovacao || prev.statusAprovacao,
                        statusConta: live.statusConta || prev.statusConta,
                        totalLikes: typeof live.totalLikes === 'number' ? live.totalLikes : prev.totalLikes,
                        scoreEngajamento: typeof live.scoreEngajamento === 'number' ? live.scoreEngajamento : prev.scoreEngajamento
                      };
                    });
                  }
                }, (syncErr) => {
                  console.warn('Sincronização em tempo real offline/aviso:', syncErr?.message);
                });
              } catch (liveErr) {
                console.warn('Aviso ao iniciar ouvinte em tempo real do perfil:', liveErr);
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
          }
        }
        setIsLoading(false);
      });
      return () => {
        unsubscribe();
        if (profileUnsub) {
          profileUnsub();
        }
      };
    } else {
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
                const repairPayload = {
                  uid: fbUser.uid,
                  email: normalizedEmail,
                  nome: defaultName,
                  name: defaultName,
                  role: isSuperAdminEmail ? 'super_admin' : 'tecnico',
                  tipoConta: 'tecnico',
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

                userSnap = await safeGetDoc(userRef, 1, 300);
              }

              const docData = ((userSnap && userSnap.exists()) ? userSnap.data() : ((usersSnap && usersSnap.exists()) ? usersSnap.data() : {})) || {};
              const rawRole = String(docData.role || docData.tipoConta || '').toLowerCase().trim();
              const isSuper = isSuperAdminEmail || rawRole === 'super_admin' || docData.role === 'super_admin';
              
              let tipoConta: 'cliente' | 'tecnico' | 'empresa';
              let role: UserRole;

              if (isSuper) {
                tipoConta = 'tecnico';
                role = 'super_admin';
              } else if (rawRole === 'admin' || docData.role === 'admin') {
                tipoConta = 'tecnico';
                role = 'admin';
              } else if (rawRole === 'empresa' || rawRole === 'company' || docData.tipoConta === 'empresa' || docData.role === 'company') {
                tipoConta = 'empresa';
                role = 'company';
              } else {
                tipoConta = 'tecnico';
                role = 'technician';
              }

              const statusAprovacao = isSuper ? 'aprovado' : (docData.statusAprovacao || (docData.status === 'pending_approval' ? 'pendente' : 'aprovado'));

              foundUser = {
                uid: fbUser.uid,
                name: docData.name || docData.nome || fbUser.displayName || defaultName,
                email: normalizedEmail,
                phone: docData.phone || docData.telefone || fbUser.phoneNumber || '',
                role: role,
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
        const tipoConta = match.tipoConta || (match.role === 'company' ? 'empresa' : 'tecnico');
        const userWithTipo = { ...match, tipoConta };
        setCurrentUser(userWithTipo);
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

      const isAutoApproved = userRole === 'client' || userRole === 'super_admin' || userRole === 'admin';
      const statusAprovacao = isAutoApproved ? 'aprovado' : 'pendente';
      const status: UserStatus = isAutoApproved ? 'active' : 'pending_approval';

      const userAge = data.idade ? Number(data.idade) : 25;
      const userPhoto = data.photoURL || data.avatarUrl || undefined;

      const newUser: User = {
        uid: generatedUid,
        name: defaultName,
        email: normalizedEmail,
        phone: rawPhone,
        role: userRole,
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
          const usuarioPayload = {
            ...newUser,
            uid: generatedUid,
            nome: defaultName,
            name: defaultName,
            email: normalizedEmail,
            telefone: rawPhone,
            phone: rawPhone,
            role: userRole,
            tipoConta: tipoConta,
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
            status: 'active',
            statusConta: 'ativa',
            statusAprovacao: statusAprovacao,
            criadoEm: serverTimestamp(),
            createdAt: serverTimestamp(),
            dataCadastro: serverTimestamp(),
            createdAtIso: new Date().toISOString()
          };

          await safeSetDoc(doc(db, 'usuarios', generatedUid), usuarioPayload);
          await safeSetDoc(doc(db, 'users', generatedUid), newUser);
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
            await setDoc(doc(db, 'companies', generatedUid), newComp, { merge: true });
          } catch (dbErr) {
            console.warn('Firestore company doc creation error:', dbErr);
          }
        }

        const updatedComps = [...companyList, newComp];
        setCompanyList(updatedComps);
        setCurrentCompanyProfile(newComp);
      }

      liberarAcessoApp(newUser);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Falha ao registar conta.' };
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
      if (typeof window !== 'undefined') {
        localStorage.removeItem('clienteNome');
        localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
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
    const updated = { ...currentUser, ...data, updatedAt: new Date().toISOString() };
    setCurrentUser(updated);
    setUsersList(prev => prev.map(u => (u.uid === currentUser.uid ? updated : u)));

    if (currentUser.role === 'technician') {
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
      if (Object.keys(techUpdate).length > 0) {
        updateCurrentTechProfile(techUpdate);
      }
    }

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'users', currentUser.uid), { ...data, updatedAt: new Date().toISOString() }, { merge: true });
      } catch (err) {
        console.warn('Firestore user update error:', err);
      }
    }
  };

  const updateCurrentTechProfile = async (data: Partial<TechnicianProfile>) => {
    if (!currentUser || (currentUser.role !== 'technician' && currentUser.tipoConta !== 'tecnico')) return;
    const existing = currentTechProfile || ({} as TechnicianProfile);
    const updated: TechnicianProfile = {
      ...existing,
      ...data,
      userId: currentUser.uid,
      updatedAt: new Date().toISOString()
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
        await setDoc(doc(db, 'technicians', currentUser.uid), { ...data, updatedAt: new Date().toISOString() }, { merge: true });
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

  const giveTechnicianLike = async (techUserId: string): Promise<{ success: boolean; totalLikes: number; error?: string }> => {
    if (!techUserId) return { success: false, totalLikes: 0, error: 'ID de técnico inválido.' };
    
    // Check if client/user has already liked this technician
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

    if (likedList.includes(techUserId)) {
      const existingTech = techList.find(t => t.userId === techUserId);
      return { 
        success: false, 
        totalLikes: existingTech?.totalLikes || 0,
        error: 'Você já curtiu este perfil profissional!' 
      };
    }

    // Add to liked list
    likedList.push(techUserId);
    try {
      localStorage.setItem(LIKE_STORAGE_KEY, JSON.stringify(likedList));
    } catch (e) {
      console.warn('Storage save error:', e);
    }

    const targetTech = techList.find(t => t.userId === techUserId);
    const currentLikes = targetTech?.totalLikes || 0;
    const newLikes = currentLikes + 1;
    const newScore = (targetTech?.scoreEngajamento || 0) + 1;

    setTechList(prev => prev.map(t => t.userId === techUserId ? { ...t, totalLikes: newLikes, scoreEngajamento: newScore } : t));
    setUsersList(prev => prev.map(u => u.uid === techUserId ? { ...u, totalLikes: newLikes, scoreEngajamento: newScore } : u));
    if (currentUser?.uid === techUserId) {
      setCurrentUser(prev => prev ? { ...prev, totalLikes: newLikes, scoreEngajamento: newScore } : null);
      setCurrentTechProfile(prev => prev ? { ...prev, totalLikes: newLikes, scoreEngajamento: newScore } : null);
    }

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'usuarios', techUserId), {
          totalLikes: newLikes,
          scoreEngajamento: newScore,
          pontos: newScore,
          updatedAt: new Date().toISOString()
        }, { merge: true });
        await setDoc(doc(db, 'users', techUserId), {
          totalLikes: newLikes,
          scoreEngajamento: newScore,
          updatedAt: new Date().toISOString()
        }, { merge: true });
        await setDoc(doc(db, 'technicians', techUserId), {
          totalLikes: newLikes,
          scoreEngajamento: newScore,
          updatedAt: new Date().toISOString()
        }, { merge: true });

        // Save like audit in Firestore
        const likeDocId = `${techUserId}_${currentUser?.uid || 'client_' + Date.now()}`;
        await setDoc(doc(db, 'technician_likes', likeDocId), {
          techUserId,
          likedBy: currentUser?.uid || localStorage.getItem('clienteNome') || 'Cliente Anónimo',
          likedAt: new Date().toISOString()
        }, { merge: true });
      } catch (err) {
        console.warn('Firestore update technician like error:', err);
      }
    }

    return { success: true, totalLikes: newLikes };
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
        logout,
        resetPassword,
        changePassword,
        updateCurrentUserProfile,
        updateCurrentTechProfile,
        updateCurrentCompanyProfile,
        giveTechnicianLike,
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
