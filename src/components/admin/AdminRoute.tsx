import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db, isFirebaseConfigured } from '../../firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { Shield, ShieldAlert, Loader2 } from 'lucide-react';

interface AdminRouteProps {
  children: React.ReactNode;
  onRedirectToFeed: () => void;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ children, onRedirectToFeed }) => {
  const { currentUser, isLoading: isAuthLoading } = useAuth();
  const [isVerifyingRole, setIsVerifyingRole] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const verifyAdminRole = async () => {
      if (isAuthLoading) return;

      if (!currentUser) {
        if (isMounted) {
          setIsAuthorized(false);
          setIsVerifyingRole(false);
          onRedirectToFeed();
        }
        return;
      }

      // Hardcoded super admin fallback
      if (currentUser.email && currentUser.email.toLowerCase() === 'andrezefaniasjuniorr@gmail.com') {
        if (isMounted) {
          setIsAuthorized(true);
          setIsVerifyingRole(false);
        }
        return;
      }

      // Direct Firestore check on 'users' collection
      try {
        if (isFirebaseConfigured && db && currentUser.uid) {
          const userRef = doc(db, 'users', currentUser.uid);
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists()) {
            const data = userSnap.data();
            const userRole = data?.role;
            const adminSub = data?.adminSubRole;
            const isAdminRole = userRole === 'admin' || userRole === 'super_admin' || adminSub === 'super_admin';

            if (isMounted) {
              if (isAdminRole) {
                setIsAuthorized(true);
              } else {
                setIsAuthorized(false);
                onRedirectToFeed();
              }
              setIsVerifyingRole(false);
            }
            return;
          }
        }
      } catch (err) {
        console.warn('AdminRoute: Firestore verification fallback check:', err);
      }

      // Fallback check against context currentUser
      const contextIsAdmin =
        currentUser.role === 'admin' ||
        currentUser.role === 'super_admin' ||
        currentUser.adminSubRole === 'super_admin';

      if (isMounted) {
        if (contextIsAdmin) {
          setIsAuthorized(true);
        } else {
          setIsAuthorized(false);
          onRedirectToFeed();
        }
        setIsVerifyingRole(false);
      }
    };

    verifyAdminRole();

    return () => {
      isMounted = false;
    };
  }, [currentUser, isAuthLoading, onRedirectToFeed]);

  if (isAuthLoading || isVerifyingRole) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col items-center justify-center p-4">
        <div className="w-14 h-14 rounded-2xl bg-indigo-950/80 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-4 shadow-xl shadow-indigo-950/50 animate-pulse">
          <Shield className="w-7 h-7" />
        </div>
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-300">
          <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
          <span>Verificando credenciais administrativas...</span>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Acesso restrito ao Painel de Governança TécnicaMZ Pro
        </p>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col items-center justify-center p-4 text-center">
        <div className="w-16 h-16 rounded-3xl bg-red-950/60 border border-red-500/30 text-red-400 flex items-center justify-center mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">Acesso Não Autorizado</h2>
        <p className="text-xs text-slate-400 max-w-md mt-2 mb-6">
          Você não possui privilégios de administrador no Sistema para acessar a rota secreta de gestão. Redirecionando para o Feed...
        </p>
        <button
          onClick={onRedirectToFeed}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-indigo-600/30"
        >
          Voltar ao Feed
        </button>
      </div>
    );
  }

  return <>{children}</>;
};
