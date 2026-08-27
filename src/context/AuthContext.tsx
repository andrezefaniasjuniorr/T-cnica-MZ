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
import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, onSnapshot } from 'firebase/firestore';

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
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: {
    name: string;
    email: string;
    phone: string;
    password?: string;
    role: UserRole;
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
  updateUserStatus: (userId: string, status: UserStatus) => Promise<void>;
  deleteUserAccount: (userId: string) => Promise<void>;
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
  const [isLoading, setIsLoading] = useState<boolean>(false);

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
            return;
          }

          // Check if user exists in Firestore
          if (db) {
            try {
              const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
              if (userDoc.exists()) {
                const firestoreUserData = userDoc.data() as User;
                setCurrentUser(prev => (prev?.uid === firestoreUserData.uid && prev?.role === firestoreUserData.role ? prev : firestoreUserData));
                return;
              }
            } catch (err) {
              console.warn('Firestore fetch failed, checking local store:', err);
            }
          }

          // Fallback to local match
          setUsersList(prev => {
            const userMatch = prev.find(u => u.email.toLowerCase() === normalizedEmail);
            if (userMatch) {
              setCurrentUser(curr => (curr?.uid === fbUser.uid && curr?.email === userMatch.email ? curr : { ...userMatch, uid: fbUser.uid }));
            }
            return prev;
          });
        }
      });
      return () => unsubscribe();
    }
  }, []);

  const login = async (email: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const normalizedEmail = email.trim().toLowerCase();

      // If Firebase is configured and password is provided, authenticate directly via Firebase Auth
      if (isFirebaseConfigured && auth && password) {
        try {
          const userCredential = await signInWithEmailAndPassword(auth, normalizedEmail, password);
          const fbUser = userCredential.user;

          // Retrieve role & user data from Firestore or fallback
          let foundUser: User | null = null;
          if (db) {
            try {
              const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
              if (userDoc.exists()) {
                foundUser = userDoc.data() as User;
              }
            } catch (err) {
              console.warn('Firestore lookup error in login:', err);
            }
          }

          if (!foundUser) {
            const localMatch = usersList.find(u => u.email.toLowerCase() === normalizedEmail);
            if (localMatch) {
              foundUser = { ...localMatch, uid: fbUser.uid };
            } else {
              const isSuper = normalizedEmail === 'andrezefaniasjuniorr@gmail.com';
              foundUser = {
                uid: fbUser.uid,
                name: isSuper ? 'André Zefanias Júnior' : (fbUser.displayName || normalizedEmail.split('@')[0]),
                email: normalizedEmail,
                phone: isSuper ? '+258 84 999 0001' : '',
                role: isSuper ? 'super_admin' : 'client',
                adminSubRole: isSuper ? 'super_admin' : undefined,
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

          if (foundUser.status === 'suspended') {
            return { success: false, error: 'Sua conta está suspensa. Entre em contato com o suporte.' };
          }
          if (foundUser.status === 'blocked') {
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

          return { success: true };
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
        if (match.status === 'suspended') {
          return { success: false, error: 'Sua conta está suspensa. Entre em contato com o suporte.' };
        }
        if (match.status === 'blocked') {
          return { success: false, error: 'Acesso bloqueado por violação das políticas da plataforma.' };
        }
        setCurrentUser(match);
        return { success: true };
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
          status: 'active',
          createdAt: new Date().toISOString()
        };
        setUsersList(prev => [superAdminUser, ...prev]);
        setCurrentUser(superAdminUser);
        return { success: true };
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
          console.error('Firebase user creation failed:', fbErr);
          if (fbErr.code === 'auth/email-already-in-use') {
            return { success: false, error: 'Este e-mail já está em uso na plataforma.' };
          }
          if (fbErr.code === 'auth/weak-password') {
            return { success: false, error: 'A palavra-passe deve ter pelo menos 6 caracteres.' };
          }
          if (fbErr.code === 'auth/invalid-email') {
            return { success: false, error: 'Endereço de e-mail inválido.' };
          }
          return { success: false, error: fbErr.message || 'Falha ao criar conta no Firebase.' };
        }
      } else {
        if (usersList.some(u => u.email.toLowerCase() === normalizedEmail)) {
          return { success: false, error: 'Este e-mail já está registado na plataforma.' };
        }
      }

      const newUser: User = {
        uid: generatedUid,
        name: data.name.trim(),
        email: normalizedEmail,
        phone: data.phone.trim(),
        role: userRole,
        adminSubRole: adminSubRole,
        status: 'active',
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
        const cleanPhone = (data.phone || '').replace(/\D/g, '');
        const cleanWhatsapp = cleanPhone ? (cleanPhone.startsWith('258') ? cleanPhone : `258${cleanPhone}`) : '';
        const newTech: TechnicianProfile = {
          userId: generatedUid,
          name: data.name.trim(),
          email: normalizedEmail,
          phone: (data.phone || '').trim(),
          whatsapp: cleanWhatsapp,
          showWhatsappButton: true,
          customWhatsappMessage: `Olá ${data.name.trim()}, vi seu perfil na TécnicaMZ e gostaria de solicitar um orçamento.`,
          province: data.province || 'Maputo Cidade',
          city: data.city || 'Maputo',
          specialties: data.specialty ? [data.specialty] : ['Eletricidade'],
          bio: `Profissional qualificado em ${data.specialty || 'serviços técnicos'} em ${data.province || 'Moçambique'}.`,
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
        const cleanPhone = (data.phone || '').replace(/\D/g, '');
        const cleanWhatsapp = cleanPhone ? (cleanPhone.startsWith('258') ? cleanPhone : `258${cleanPhone}`) : '';
        const newComp: CompanyProfile = {
          userId: generatedUid,
          companyName: data.name.trim(),
          commercialName: data.commercialName?.trim() || data.name.trim(),
          nuit: data.nuit?.trim() || '400000000',
          email: normalizedEmail,
          phone: data.phone.trim(),
          whatsapp: cleanWhatsapp,
          showWhatsappButton: true,
          website: data.website?.trim(),
          province: data.province || 'Maputo Cidade',
          city: data.city || 'Maputo',
          address: data.address?.trim() || 'Moçambique',
          industry: data.industry?.trim() || 'Engenharia & Construção',
          description: `Empresa ${data.name.trim()} registada na TécnicaMZ para contratação de profissionais técnicos especializados.`,
          verificationStatus: 'unverified',
          rating: 5.0,
          reviewsCount: 0,
          hiredTechniciansCount: 0,
          activeJobsCount: 0,
          status: 'active',
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

  const isClient = currentUser?.role === 'client';
  const isTechnician = currentUser?.role === 'technician';
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
        login,
        register,
        logout,
        resetPassword,
        changePassword,
        updateCurrentUserProfile,
        updateCurrentTechProfile,
        updateCurrentCompanyProfile,
        updateUserStatus,
        deleteUserAccount
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
