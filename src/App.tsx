import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';

// Layout & Core Screens
import { Header } from './components/layout/Header';
import { BottomNav } from './components/layout/BottomNav';
import { AuthScreen } from './components/auth/AuthScreen';

// Main Functional Tabs
import { CommunityFeed } from './components/community/CommunityFeed';
import { MarketSection } from './components/market/MarketSection';
import { TechniciansDirectory } from './components/technicians/TechniciansDirectory';
import { TecnicaTools } from './components/tools/TecnicaTools';
import { SettingsPanel } from './components/settings/SettingsPanel';
import { AdminPanel } from './components/admin/AdminPanel';
import { AdminRoute } from './components/admin/AdminRoute';
import { JobsSection } from './components/jobs/JobsSection';
import { CompanyDirectory } from './components/company/CompanyDirectory';
import { CompanyDashboard } from './components/company/CompanyDashboard';
import { TechnicianDashboard } from './components/technician/TechnicianDashboard';
import { ClientDashboard } from './components/client/ClientDashboard';
import { AcademySection } from './components/academy/AcademySection';

// Modals
import { GlobalSearchModal } from './components/common/GlobalSearchModal';
import { SaraAiModal } from './components/common/SaraAiModal';
import { MessagesModal } from './components/common/MessagesModal';
import { NotificationsModal } from './components/common/NotificationsModal';
import { WelcomeModal } from './components/common/WelcomeModal';
import { AccessDeniedModal } from './components/common/AccessDeniedModal';
import { SubscriptionPaywall } from './components/subscription/SubscriptionPaywall';

import { UserRole } from './types';
import { Wrench, Phone, Mail, ShieldCheck, Heart } from 'lucide-react';

const AppContent: React.FC = () => {
  const { currentUser, isLoading, isTechnician, isCompany, isAdmin, isSubscriptionActive } = useAuth();

  // Navigation State with History API Support
  const [activeTab, setActiveTab] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.replace('/', '').trim();
      if (path === 'gestao-pro-mz') return 'gestao-pro-mz';

      if (window.location.hash) {
        const hashTab = window.location.hash.replace('#', '').trim();
        if (hashTab === 'gestao-pro-mz' || hashTab === 'admin') return 'gestao-pro-mz';
        if (hashTab) return hashTab;
      }
    }
    return 'community';
  });

  // Dark Mode State
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Modals Visibility States
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSaraAiOpen, setIsSaraAiOpen] = useState(false);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isWelcomeOpen, setIsWelcomeOpen] = useState(false);
  const [targetMessageUser, setTargetMessageUser] = useState<{ id: string; name: string; role: string } | null>(null);

  const [isAccessDeniedOpen, setIsAccessDeniedOpen] = useState(false);
  const [requiredRoleForDenied, setRequiredRoleForDenied] = useState<UserRole>('client');

  // 1. History API & Browser Navigation Synchronization
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const validTabs = [
      'community',
      'market',
      'technicians_directory',
      'tools',
      'settings',
      'jobs',
      'company_directory',
      'company',
      'technician',
      'client',
      'academy',
      'gestao-pro-mz',
      'admin'
    ];

    const syncTabFromLocation = () => {
      try {
        const path = window.location.pathname.replace('/', '').trim();
        if (path === 'gestao-pro-mz') {
          setActiveTab('gestao-pro-mz');
          return;
        }

        const hash = window.location.hash.replace('#', '').trim();
        if (hash === 'gestao-pro-mz' || hash === 'admin') {
          setActiveTab('gestao-pro-mz');
        } else if (hash && validTabs.includes(hash)) {
          setActiveTab(hash);
        } else if (window.history.state && typeof window.history.state === 'object' && window.history.state.tab) {
          const stateTab = window.history.state.tab;
          if (stateTab === 'gestao-pro-mz' || stateTab === 'admin') {
            setActiveTab('gestao-pro-mz');
          } else if (validTabs.includes(stateTab)) {
            setActiveTab(stateTab);
          }
        }
      } catch (err) {
        console.warn('History synchronization fallback:', err);
      }
    };

    // Initialize state in history
    try {
      const initialPath = window.location.pathname.replace('/', '').trim();
      const initialHash = window.location.hash.replace('#', '').trim();
      const initialTab = initialPath === 'gestao-pro-mz' || initialHash === 'gestao-pro-mz' || initialHash === 'admin'
        ? 'gestao-pro-mz'
        : initialHash && validTabs.includes(initialHash) ? initialHash : 'community';

      if (!window.history.state || window.history.state.tab !== initialTab) {
        window.history.replaceState({ tab: initialTab }, '', `#${initialTab}`);
      }
    } catch {
      // Ignore if iframe blocks history state modification
    }

    const handlePopState = (event: PopStateEvent) => {
      try {
        if (event.state && typeof event.state === 'object' && event.state.tab) {
          const sTab = event.state.tab;
          if (sTab === 'gestao-pro-mz' || sTab === 'admin') {
            setActiveTab('gestao-pro-mz');
            return;
          }
          if (validTabs.includes(sTab)) {
            setActiveTab(sTab);
            return;
          }
        }
        syncTabFromLocation();
      } catch {
        syncTabFromLocation();
      }
    };

    const handleHashChange = () => {
      syncTabFromLocation();
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  // 2. First-time login onboarding check
  useEffect(() => {
    if (currentUser?.uid) {
      const welcomeKey = `welcome_v1_${currentUser.uid}`;
      try {
        const hasSeen = localStorage.getItem(welcomeKey);
        if (!hasSeen) {
          setIsWelcomeOpen(true);
          localStorage.setItem(welcomeKey, 'true');
        }
      } catch {
        // Ignore localStorage restrictions
      }
    }
  }, [currentUser?.uid]);

  const handleNavigate = (tab: string, addToHistory = true) => {
    // RBAC Route Guard Checks
    if (tab === 'admin') {
      if (!isAdmin) {
        setRequiredRoleForDenied('admin');
        setIsAccessDeniedOpen(true);
        return;
      }
    } else if (tab === 'company') {
      if (!isCompany && !isAdmin) {
        setRequiredRoleForDenied('company');
        setIsAccessDeniedOpen(true);
        return;
      }
    } else if (tab === 'technician') {
      if (!isTechnician && !isAdmin) {
        setRequiredRoleForDenied('technician');
        setIsAccessDeniedOpen(true);
        return;
      }
    }

    setActiveTab(tab);

    if (addToHistory && typeof window !== 'undefined' && window.history) {
      try {
        const currentHash = window.location.hash.replace('#', '').trim();
        if (currentHash !== tab) {
          window.history.pushState({ tab }, '', `#${tab}`);
        }
      } catch {
        // Fallback for sandboxed frames
        try {
          window.location.hash = `#${tab}`;
        } catch {
          // Ignore
        }
      }
    }

    if (typeof window !== 'undefined') {
      try {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch {
        // Fallback
      }
    }
  };

  const handleOpenDirectMessage = (userId: string, userName: string, role: string) => {
    setTargetMessageUser({ id: userId, name: userName, role });
    setIsMessagesOpen(true);
  };

  // =========================================================================
  // STRICT ACCESS CONTROL: IF NOT AUTHENTICATED, SHOW MINIMAL AUTH SCREEN ONLY
  // =========================================================================
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F0F2F5] flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 mb-4 animate-bounce">
          <Wrench className="w-6 h-6" />
        </div>
        <div className="w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-2" />
        <p className="text-xs font-bold text-slate-600 tracking-tight">
          Carregando TécnicaMZ Pro...
        </p>
      </div>
    );
  }

  if (!currentUser) {
    return <AuthScreen initialMode="login" initialRole="client" />;
  }

  // =========================================================================
  // SECRET ADMIN ROUTE: /gestao-pro-mz (Protected by Firestore role === 'admin')
  // =========================================================================
  if (activeTab === 'gestao-pro-mz' || activeTab === 'admin') {
    return (
      <AdminRoute onRedirectToFeed={() => handleNavigate('community')}>
        <AdminPanel onNavigateTab={handleNavigate} />
      </AdminRoute>
    );
  }

  // =========================================================================
  // STRICT PAYWALL ENFORCEMENT:
  // Se o usuário NÃO tiver uma assinatura ativa (statusAssinatura !== "ativa")
  // ou se dataExpiracao < data atual, BLOQUEIE O ACESSO ABSOLUTO a todas as abas.
  // =========================================================================
  if (!isSubscriptionActive) {
    return <SubscriptionPaywall />;
  }

  // =========================================================================
  // AUTHENTICATED USER DASHBOARD & PLATFORM
  // =========================================================================
  return (
    <div className={`min-h-screen flex flex-col font-sans antialiased selection:bg-blue-500 selection:text-white ${
      isDarkMode ? 'bg-[#0B1120] text-slate-100' : 'bg-[#F0F2F5] text-slate-900'
    }`}>
      {/* 1. Global Facebook-Inspired Header */}
      <Header
        activeTab={activeTab}
        onNavigateTab={handleNavigate}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenSaraAi={() => setIsSaraAiOpen(true)}
        onOpenMessages={() => {
          setTargetMessageUser(null);
          setIsMessagesOpen(true);
        }}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        unreadNotificationsCount={0}
      />

      {/* 2. Main Content Body */}
      <main className="flex-1 pb-16 md:pb-8">
        {activeTab === 'community' && (
          <CommunityFeed onNavigateTab={handleNavigate} />
        )}

        {activeTab === 'market' && (
          <MarketSection onNavigateTab={handleNavigate} />
        )}

        {activeTab === 'technicians_directory' && (
          <TechniciansDirectory
            onNavigateTab={handleNavigate}
            onOpenMessages={handleOpenDirectMessage}
          />
        )}

        {activeTab === 'tools' && (
          <TecnicaTools onNavigateTab={handleNavigate} />
        )}

        {activeTab === 'settings' && (
          <SettingsPanel
            onNavigateTab={handleNavigate}
            isDarkMode={isDarkMode}
            onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
          />
        )}

        {activeTab === 'jobs' && (
          <JobsSection
            onNavigateTab={handleNavigate}
            onOpenMessages={handleOpenDirectMessage}
          />
        )}

        {activeTab === 'company_directory' && (
          <CompanyDirectory
            onNavigateTab={handleNavigate}
            onOpenMessages={handleOpenDirectMessage}
          />
        )}

        {activeTab === 'company' && (
          <CompanyDashboard
            onNavigateTab={handleNavigate}
            onOpenMessages={handleOpenDirectMessage}
          />
        )}

        {activeTab === 'technician' && (
          <TechnicianDashboard
            onNavigateTab={handleNavigate}
            onOpenMessages={handleOpenDirectMessage}
          />
        )}

        {activeTab === 'client' && (
          <ClientDashboard
            onNavigateTab={handleNavigate}
            onOpenMessages={handleOpenDirectMessage}
          />
        )}

        {activeTab === 'academy' && (
          <AcademySection onNavigateTab={handleNavigate} />
        )}

        {activeTab === 'admin' && (
          <AdminPanel onNavigateTab={handleNavigate} />
        )}
      </main>

      {/* 3. Mobile Bottom Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        onNavigateTab={handleNavigate}
        onOpenSaraAi={() => setIsSaraAiOpen(true)}
      />

      {/* 4. Global Official Footer */}
      <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 text-xs mt-auto hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-slate-800/80">
            {/* Brand & Slogan */}
            <div className="space-y-3 md:col-span-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black">
                  <Wrench className="w-4 h-4" />
                </div>
                <span className="text-base font-black text-white">TécnicaMZ Pro</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-400">
                Comunidade Técnica de Moçambique — Conectando técnicos credenciados, empresas e orçamentos verificados.
              </p>
              <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Auditoria & Pagamentos M-Pesa Verificados</span>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-2">
              <h4 className="font-bold text-white uppercase text-[11px] tracking-wider">Módulos Principais</h4>
              <ul className="space-y-1 text-[11px]">
                <li><button onClick={() => handleNavigate('community')} className="hover:text-white">Mural da Comunidade</button></li>
                <li><button onClick={() => handleNavigate('market')} className="hover:text-white">Mercado de Equipamentos</button></li>
                <li><button onClick={() => handleNavigate('technicians_directory')} className="hover:text-white">Diretório de Técnicos</button></li>
                <li><button onClick={() => handleNavigate('tools')} className="hover:text-white">Calculadoras de Engenharia & OS</button></li>
              </ul>
            </div>

            {/* Provinces */}
            <div className="space-y-2">
              <h4 className="font-bold text-white uppercase text-[11px] tracking-wider">Cobertura Nacional</h4>
              <p className="text-[11px] leading-relaxed text-slate-400">
                Atendimento ativo em Maputo, Matola, Gaza, Inhambane, Sofala (Beira), Manica, Tete, Zambézia, Nampula, Niassa e Cabo Delgado.
              </p>
            </div>

            {/* Official Support */}
            <div className="space-y-2">
              <h4 className="font-bold text-white uppercase text-[11px] tracking-wider">Suporte Técnico Oficial</h4>
              <div className="space-y-1.5 text-[11px] text-slate-400">
                <a
                  href="https://wa.me/258851949159"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-emerald-400 hover:underline font-bold"
                >
                  <Phone className="w-3.5 h-3.5 shrink-0" />
                  <span>WhatsApp: 851949159</span>
                </a>
                <a
                  href="mailto:tecnicamzpro@gmail.com"
                  className="flex items-center gap-1.5 text-sky-400 hover:underline font-bold"
                >
                  <Mail className="w-3.5 h-3.5 shrink-0" />
                  <span>tecnicamzpro@gmail.com</span>
                </a>
                <p className="pt-1 text-[10px] text-slate-500">⚡ Piquete EDM: 1455 | Bombeiros: 198</p>
              </div>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
            <p>© 2026 TécnicaMZ Pro. Todos os direitos reservados. Moçambique.</p>
            <p className="flex items-center gap-1">
              Comunidade Técnica de Moçambique
            </p>
          </div>
        </div>
      </footer>

      {/* 5. Modals */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectResult={(tab) => handleNavigate(tab)}
      />

      <SaraAiModal
        isOpen={isSaraAiOpen}
        onClose={() => setIsSaraAiOpen(false)}
      />

      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onNavigateTab={handleNavigate}
        onOpenMessages={() => {
          setIsNotificationsOpen(false);
          setIsMessagesOpen(true);
        }}
      />

      <WelcomeModal
        isOpen={isWelcomeOpen}
        onClose={() => setIsWelcomeOpen(false)}
        onNavigateTab={handleNavigate}
      />

      <MessagesModal
        isOpen={isMessagesOpen}
        onClose={() => setIsMessagesOpen(false)}
        initialTargetUserId={targetMessageUser?.id}
        initialTargetUserName={targetMessageUser?.name}
        initialTargetRole={targetMessageUser?.role}
      />

      <AccessDeniedModal
        isOpen={isAccessDeniedOpen}
        onClose={() => setIsAccessDeniedOpen(false)}
        requiredRole={requiredRoleForDenied}
        onOpenAuth={() => handleNavigate('settings')}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </AuthProvider>
  );
}
