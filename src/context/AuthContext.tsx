import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, TechnicianProfile, CompanyProfile, UserRole, AdminSubRole, UserStatus } from '../types';
import { auth, db, isFirebaseConfigured } from '../firebase/config';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updatePassword as fbUpdatePassword
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, onSnapshot, query, where, getDocs } from 'firebase/firestore';

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

  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string; user?: User }>;
  register: (data: {
    name: string;
    email: string;
    phone: string;
    password?: string;
    role: UserRole;
    tipoConta?: 'cliente' | 'tecnico';
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
    const saved = localStorage.getItem('tecnicamz_users');
    return saved ? JSON.parse(saved) : [];
  });

  const [techList, setTechList] = useState<TechnicianProfile[]>(() => {
    const saved = localStorage.getItem('tecnicamz_technicians');
    return saved ? JSON.parse(saved) : [];
  });

  const [companyList, setCompanyList] = useState<CompanyProfile[]>(() => {
    const saved = localStorage.getItem('tecnicamz_companies');
    return saved ? JSON.parse(saved) : [];
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const savedId = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
    if (savedId) {
      const found = usersList.find(u => u.uid === savedId);
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

    return () => {
      unsubUsers();
      unsubTechs();
      unsubComps();
    };
  }, []);

  // Sync current user profiles whenever currentUser, techList or companyList change
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, currentUser.uid);
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
      localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
      setCurrentTechProfile(null);
      setCurrentCompanyProfile(null);
    }
  }, [currentUser?.uid, currentUser?.role, techList, companyList]);

  // Keep local storage synchronized with current lists
  useEffect(() => {
    localStorage.setItem('tecnicamz_users', JSON.stringify(usersList));
  }, [usersList]);

  useEffect(() => {
    localStorage.setItem('tecnicamz_technicians', JSON.stringify(techList));
  }, [techList]);

  useEffect(() => {
    localStorage.setItem('tecnicamz_companies', JSON.stringify(companyList));
  }, [companyList]);

  // Firebase auth state listener - runs once on mount
  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
        try {
          if (fbUser && fbUser.email) {
            const normalizedEmail = fbUser.email.toLowerCase();
            
            // Check if admin super account
            if (normalizedEmail === 'andrezefaniasjuniorr@gmail.com') {
              const adminUser: User = {
                uid: fbUser.uid,
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
              setCurrentUser(prev => (prev?.uid === fbUser.uid && prev?.role === 'super_admin' ? prev : adminUser));
              setUsersList(prev => {
                const existingIndex = prev.findIndex(u => u.email.toLowerCase() === normalizedEmail);
                if (existingIndex >= 0) {
                  if (prev[existingIndex].uid === fbUser.uid && prev[existingIndex].role === 'super_admin') {
                    return prev;
                  }
                  const updated = [...prev];
                  updated[existingIndex] = { ...updated[existingIndex], ...adminUser };
                  return updated;
                }
                return [adminUser, ...prev];
              });
              if (db) {
                try {
                  await setDoc(doc(db, 'users', fbUser.uid), adminUser, { merge: true });
                } catch (e) {
                  console.warn('Sync admin doc error:', e);
                }
              }
              return;
            }

            // 3. RECARREGAMENTO / SESSÃO ATIVA: LEITURA OBRIGATÓRIA NO FIRESTORE (doc(db, 'users', fbUser.uid))
            if (db) {
              try {
                const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
                if (userDoc.exists()) {
                  const docData = userDoc.data() as Partial<User>;
                  const tipoConta = docData.tipoConta || (docData.role === 'client' ? 'cliente' : 'tecnico');
                  const statusAprovacao = docData.statusAprovacao || (docData.status === 'pending_approval' ? 'pendente' : 'aprovado');
                  let role = docData.role;
                  if (!role) {
                    role = tipoConta === 'tecnico' ? 'technician' : 'client';
                  }

                  const firestoreUserData: User = {
                    uid: fbUser.uid,
                    name: docData.name || fbUser.displayName || normalizedEmail.split('@')[0],
                    email: normalizedEmail,
                    phone: docData.phone || '',
                    role: role,
                    tipoConta: tipoConta,
                    statusAprovacao: statusAprovacao,
                    statusConta: docData.statusConta || 'ativa',
                    status: docData.status || (statusAprovacao === 'pendente' ? 'pending_approval' : 'active'),
                    adminSubRole: docData.adminSubRole,
                    specialty: docData.specialty,
                    province: docData.province,
                    city: docData.city,
                    avatarUrl: docData.avatarUrl,
                    statusAssinatura: docData.statusAssinatura,
                    dataExpiracao: docData.dataExpiracao,
                    subscriptionStatus: docData.subscriptionStatus,
                    activePlanId: docData.activePlanId,
                    createdAt: docData.createdAt || new Date().toISOString(),
                    updatedAt: docData.updatedAt
                  };

                  setCurrentUser(firestoreUserData);
                  setUsersList(prev => {
                    const existingIndex = prev.findIndex(u => u.uid === fbUser.uid || u.email.toLowerCase() === normalizedEmail);
                    if (existingIndex >= 0) {
                      const updated = [...prev];
                      updated[existingIndex] = firestoreUserData;
                      return updated;
                    }
                    return [firestoreUserData, ...prev];
                  });
                  return;
                }
              } catch (err) {
                console.warn('Firestore fetch failed in onAuthStateChanged:', err);
              }
            }

            // Fallback to local match if Firestore was temporarily unavailable
            setUsersList(prev => {
              const userMatch = prev.find(u => u.email.toLowerCase() === normalizedEmail);
              if (userMatch) {
                const tipoConta = userMatch.tipoConta || (userMatch.role === 'client' ? 'cliente' : 'tecnico');
                const matchedUser: User = { ...userMatch, uid: fbUser.uid, tipoConta };
                setCurrentUser(matchedUser);
              }
              return prev;
            });
          } else {
            setCurrentUser(null);
          }
        } finally {
          setIsLoading(false);
        }
      });
      return () => unsubscribe();
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password?: string): Promise<{ success: boolean; error?: string; user?: User }> => {
    setIsLoading(true);
    try {
      const normalizedEmail = email.trim().toLowerCase();

      // If Firebase is configured and password is provided, authenticate directly via Firebase Auth
      if (isFirebaseConfigured && auth && password) {
        try {
          const userCredential = await signInWithEmailAndPassword(auth, normalizedEmail, password);
          const fbUser = userCredential.user;

          // 1. LEITURA DE PERFIL PÓS-AUTENTICAÇÃO:
          // Busca OBRIGATÓRIA no documento do usuário no Firestore: doc(db, 'users', user.uid)
          let foundUser: User | null = null;
          if (db) {
            try {
              const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
              if (userDoc.exists()) {
                const docData = userDoc.data() as Partial<User>;
                const isSuper = normalizedEmail === 'andrezefaniasjuniorr@gmail.com';
                const tipoConta = isSuper ? 'tecnico' : (docData.tipoConta || (docData.role === 'client' ? 'cliente' : 'tecnico'));
                const statusAprovacao = isSuper ? 'aprovado' : (docData.statusAprovacao || (docData.status === 'pending_approval' ? 'pendente' : 'aprovado'));
                let role = isSuper ? 'super_admin' : docData.role;
                if (!role) {
                  role = tipoConta === 'tecnico' ? 'technician' : 'client';
                }

                foundUser = {
                  uid: fbUser.uid,
                  name: docData.name || fbUser.displayName || normalizedEmail.split('@')[0],
                  email: normalizedEmail,
                  phone: docData.phone || '',
                  role: role,
                  tipoConta: tipoConta,
                  statusAprovacao: statusAprovacao,
                  statusConta: docData.statusConta || 'ativa',
                  status: docData.status || (statusAprovacao === 'pendente' ? 'pending_approval' : 'active'),
                  adminSubRole: isSuper ? 'super_admin' : docData.adminSubRole,
                  specialty: docData.specialty,
                  province: docData.province,
                  city: docData.city,
                  avatarUrl: docData.avatarUrl,
                  statusAssinatura: docData.statusAssinatura,
                  dataExpiracao: docData.dataExpiracao,
                  subscriptionStatus: docData.subscriptionStatus,
                  activePlanId: docData.activePlanId,
                  createdAt: docData.createdAt || new Date().toISOString(),
                  updatedAt: docData.updatedAt
                };
              }
            } catch (err) {
              console.warn('Firestore lookup error in login:', err);
            }
          }

          if (!foundUser) {
            const localMatch = usersList.find(u => u.email.toLowerCase() === normalizedEmail);
            if (localMatch) {
              const isSuper = normalizedEmail === 'andrezefaniasjuniorr@gmail.com';
              const tipoConta = isSuper ? 'tecnico' : (localMatch.tipoConta || (localMatch.role === 'client' ? 'cliente' : 'tecnico'));
              foundUser = { ...localMatch, uid: fbUser.uid, tipoConta };
            } else {
              const isSuper = normalizedEmail === 'andrezefaniasjuniorr@gmail.com';
              foundUser = {
                uid: fbUser.uid,
                name: isSuper ? 'André Zefanias Júnior' : (fbUser.displayName || normalizedEmail.split('@')[0]),
                email: normalizedEmail,
                phone: isSuper ? '+258 84 999 0001' : '',
                role: isSuper ? 'super_admin' : 'client',
                tipoConta: isSuper ? 'tecnico' : 'cliente',
                adminSubRole: isSuper ? 'super_admin' : undefined,
                statusAprovacao: 'aprovado',
                statusConta: 'ativa',
                status: 'active',
                createdAt: new Date().toISOString()
              };
              if (db) {
                try {
                  await setDoc(doc(db, 'users', fbUser.uid), foundUser);
                } catch (e) {
                  console.warn('Auto create user doc in Firestore:', e);
                }
              }
            }
          }

          if (foundUser.status === 'suspended' || foundUser.statusConta === 'suspensa') {
            return { success: false, error: 'Sua conta está suspensa. Entre em contato com o suporte.' };
          }
          if (foundUser.status === 'blocked' || foundUser.statusConta === 'bloqueada') {
            return { success: false, error: 'Acesso bloqueado por violação de políticas da plataforma.' };
          }

          setCurrentUser(foundUser);
          setUsersList(prev => {
            const idx = prev.findIndex(u => u.uid === foundUser!.uid || u.email.toLowerCase() === normalizedEmail);
            if (idx >= 0) {
              const updated = [...prev];
              updated[idx] = foundUser!;
              return updated;
            }
            return [foundUser!, ...prev];
          });

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

      // Check registered users list (for demo/fallback when password is not provided)
      const match = usersList.find(u => u.email.toLowerCase() === normalizedEmail);
      if (match) {
        if (match.status === 'suspended' || match.statusConta === 'suspensa') {
          return { success: false, error: 'Sua conta está suspensa. Entre em contato com o suporte.' };
        }
        if (match.status === 'blocked' || match.statusConta === 'bloqueada') {
          return { success: false, error: 'Acesso bloqueado por violação das políticas da plataforma.' };
        }
        const tipoConta = match.tipoConta || (match.role === 'client' ? 'cliente' : 'tecnico');
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

      return { success: false, error: 'Nenhuma conta encontrada com este e-mail. Por favor crie uma nova conta.' };
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
    tipoConta?: 'cliente' | 'tecnico';
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
      const normalizedEmail = data.email.trim().toLowerCase();
      const rawPhone = (data.phone || '').trim();
      const cleanPhoneDigits = rawPhone.replace(/\D/g, '');

      // ANTI-DUPLICITY VALIDATION: Check local cache first
      const emailExistsLocal = usersList.some(u => u.email.toLowerCase() === normalizedEmail);
      const phoneExistsLocal = cleanPhoneDigits && usersList.some(u => {
        const uPhoneDigits = (u.phone || '').replace(/\D/g, '');
        return uPhoneDigits && (uPhoneDigits === cleanPhoneDigits || uPhoneDigits.endsWith(cleanPhoneDigits) || cleanPhoneDigits.endsWith(uPhoneDigits));
      });

      if (emailExistsLocal || phoneExistsLocal) {
        return { success: false, error: 'Este e-mail ou número de celular já existe.' };
      }

      // ANTI-DUPLICITY VALIDATION: Query Firestore database
      if (isFirebaseConfigured && db) {
        try {
          const emailQuery = query(collection(db, 'users'), where('email', '==', normalizedEmail));
          const emailSnap = await getDocs(emailQuery);
          if (!emailSnap.empty) {
            return { success: false, error: 'Este e-mail ou número de celular já existe.' };
          }

          if (rawPhone) {
            const phoneQuery = query(collection(db, 'users'), where('phone', '==', rawPhone));
            const phoneSnap = await getDocs(phoneQuery);
            if (!phoneSnap.empty) {
              return { success: false, error: 'Este e-mail ou número de celular já existe.' };
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
            // Attempt to authenticate if the user already has an account with this password
            try {
              const loginCred = await signInWithEmailAndPassword(auth, normalizedEmail, data.password);
              generatedUid = loginCred.user.uid;
            } catch {
              return {
                success: false,
                error: 'Este endereço de e-mail já está registado. Por favor, inicie sessão com a sua palavra-passe ou recupere o seu acesso.'
              };
            }
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
      const tipoConta: 'cliente' | 'tecnico' = data.tipoConta || (userRole === 'client' ? 'cliente' : 'tecnico');
      const isAutoApproved = userRole === 'client' || userRole === 'super_admin' || userRole === 'admin';
      const statusAprovacao = isAutoApproved ? 'aprovado' : 'pendente';
      const status: UserStatus = isAutoApproved ? 'active' : 'pending_approval';

      const newUser: User = {
        uid: generatedUid,
        name: defaultName,
        email: normalizedEmail,
        phone: rawPhone,
        role: userRole,
        tipoConta: tipoConta,
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
          await setDoc(doc(db, 'users', generatedUid), newUser);
        } catch (dbErr) {
          console.warn('Firestore user doc creation error:', dbErr);
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
            await setDoc(doc(db, 'technicians', generatedUid), newTech);
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
            await setDoc(doc(db, 'companies', generatedUid), newComp);
          } catch (dbErr) {
            console.warn('Firestore company doc creation error:', dbErr);
          }
        }

        const updatedComps = [...companyList, newComp];
        setCompanyList(updatedComps);
        setCurrentCompanyProfile(newComp);
      }

      setCurrentUser(newUser);
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
      localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
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

    if (isFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, 'users', currentUser.uid), { ...data, updatedAt: new Date().toISOString() });
      } catch (err) {
        console.warn('Firestore user update error:', err);
      }
    }
  };

  const updateCurrentTechProfile = async (data: Partial<TechnicianProfile>) => {
    if (!currentUser || currentUser.role !== 'technician') return;
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
        await updateDoc(doc(db, 'technicians', currentUser.uid), { ...data, updatedAt: new Date().toISOString() });
      } catch (err) {
        console.warn('Firestore tech update error:', err);
      }
    }
  };

  const updateCurrentCompanyProfile = async (data: Partial<CompanyProfile>) => {
    if (!currentUser || currentUser.role !== 'company') return;
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
        await updateDoc(doc(db, 'companies', currentUser.uid), { ...data, updatedAt: new Date().toISOString() });
      } catch (err) {
        console.warn('Firestore company update error:', err);
      }
    }
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

    // Check statusAssinatura or subscriptionStatus
    const status = (currentUser.statusAssinatura || currentUser.subscriptionStatus || '').toLowerCase();
    if (status !== 'ativa' && status !== 'active') {
      return false;
    }

    const expStr = currentUser.dataExpiracao || currentUser.subscriptionExpiresAt;
    if (!expStr) return false;

    const expTime = new Date(expStr).getTime();
    if (isNaN(expTime)) return false;

    return expTime > Date.now();
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

  const isClient = currentUser?.tipoConta === 'cliente' || currentUser?.role === 'client';
  const isTechnician = currentUser?.tipoConta === 'tecnico' || currentUser?.role === 'technician';
  const isCompany = currentUser?.role === 'company';
  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'super_admin';
  const isSuperAdmin = currentUser?.role === 'super_admin' || currentUser?.adminSubRole === 'super_admin';
  const isFinanceAdmin = isSuperAdmin || currentUser?.adminSubRole === 'finance_admin';
  const isModerator = isSuperAdmin || currentUser?.adminSubRole === 'moderator';

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

        login,
        register,
        logout,
        resetPassword,
        changePassword,
        updateCurrentUserProfile,
        updateCurrentTechProfile,
        updateCurrentCompanyProfile,
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
