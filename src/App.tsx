import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';

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
import { WaitingApprovalScreen } from './components/auth/WaitingApprovalScreen';

import { UserRole } from './types';
import { Wrench, Phone, Mail, ShieldCheck, Heart } from 'lucide-react';

// Navigation Helper to map URL path or hash to an internal tab id
const VALID_TABS = [
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

const resolveTabFromLocation = (): string | null => {
  if (typeof window === 'undefined') return null;
  const rawPath = window.location.pathname.replace(/^\//, '').trim().toLowerCase();
  const rawHash = window.location.hash.replace(/^#/, '').trim().toLowerCase();

  // Admin routes
  if (rawPath === 'gestao-pro-mz' || rawPath === 'admin' || rawHash === 'gestao-pro-mz' || rawHash === 'admin') {
    return 'gestao-pro-mz';
  }
  // Technician aliases
  if (rawPath === 'tecnico' || rawPath === 'painel-tecnico' || rawHash === 'tecnico' || rawHash === 'painel-tecnico' || rawHash === 'technician') {
    return 'technician';
  }
  // Client & Mural / Feed aliases
  if (rawPath === 'feed' || rawPath === 'mural' || rawHash === 'feed' || rawHash === 'mural' || rawHash === 'community') {
    return 'community';
  }
  // Market aliases
  if (rawPath === 'mercado' || rawHash === 'mercado' || rawHash === 'market') {
    return 'market';
  }
  // Tools aliases
  if (rawPath === 'ferramentas' || rawHash === 'ferramentas' || rawHash === 'tools') {
    return 'tools';
  }
  // Jobs aliases
  if (rawPath === 'vagas' || rawHash === 'vagas' || rawHash === 'jobs') {
    return 'jobs';
  }
  // Company aliases
  if (rawPath === 'empresa' || rawHash === 'empresa' || rawHash === 'company') {
    return 'company';
  }
  // Client profile
  if (rawPath === 'cliente' || rawHash === 'cliente' || rawHash === 'client') {
    return 'client';
  }
  // Academy
  if (rawPath === 'academia' || rawHash === 'academia' || rawHash === 'academy') {
    return 'academy';
  }

  if (rawHash && VALID_TABS.includes(rawHash)) {
    return rawHash;
  }
  if (rawPath && VALID_TABS.includes(rawPath)) {
    return rawPath;
  }
  return null;
};

const AppContent: React.FC = () => {
  const { currentUser, isLoading, isClient, isTechnician, isCompany, isAdmin, isSubscriptionActive } = useAuth();

  // Navigation State initialized from URL location
  const [activeTab, setActiveTab] = useState<string>(() => {
    const detected = resolveTabFromLocation();
    return detected || 'community';
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

    const syncTab = () => {
      const detected = resolveTabFromLocation();
      if (detected) {
        setActiveTab(detected);
      }
    };

    const handlePopState = (event: PopStateEvent) => {
      if (event.state && typeof event.state === 'object' && event.state.tab) {
        const sTab = event.state.tab;
        if (sTab === 'gestao-pro-mz' || sTab === 'admin') {
          setActiveTab('gestao-pro-mz');
          return;
        }
        if (VALID_TABS.includes(sTab)) {
          setActiveTab(sTab);
          return;
        }
      }
      syncTab();
    };

    const handleHashChange = () => {
      syncTab();
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  // 2. Dynamic Redirection and Role Alignment upon Login and Session Refresh (F5)
  useEffect(() => {
    if (!currentUser || isLoading) return;

    const detected = resolveTabFromLocation();

    // 2. Dynamic Redirection and Role Alignment upon Login and Session Refresh (F5)
    // If Admin
    if (isAdmin) {
      if (detected === 'gestao-pro-mz' || detected === 'admin') {
        setActiveTab('gestao-pro-mz');
      } else if (!detected) {
        setActiveTab('gestao-pro-mz');
        try {
          window.history.replaceState({ tab: 'gestao-pro-mz' }, '', '#gestao-pro-mz');
        } catch {}
      }
      return;
    }

    // If Company (tipoConta === 'empresa' or role === 'company')
    if (isCompany || currentUser.tipoConta === 'empresa' || currentUser.role === 'company') {
      if (detected && ['company', 'jobs', 'company_directory', 'technicians_directory', 'market', 'community', 'settings'].includes(detected)) {
        setActiveTab(detected);
      } else {
        // Strict redirection: Company is NEVER sent to client dashboard
        setActiveTab('company');
        try {
          window.history.replaceState({ tab: 'company' }, '', '#empresa');
        } catch {}
      }
      return;
    }

    // If Technician (tipoConta === 'tecnico' or role === 'technician')
    if (isTechnician || currentUser.tipoConta === 'tecnico' || currentUser.role === 'technician') {
      if (detected && ['technician', 'tools', 'jobs', 'market', 'community', 'academy', 'technicians_directory', 'company_directory', 'settings'].includes(detected)) {
        setActiveTab(detected);
      } else {
        // Strict redirection: Technician is NEVER sent to client dashboard
        setActiveTab('technician');
        try {
          window.history.replaceState({ tab: 'technician' }, '', '#tecnico');
        } catch {}
      }
      return;
    }

    // If Client (tipoConta === 'cliente' or role === 'client')
    if (isClient || currentUser.tipoConta === 'cliente' || currentUser.role === 'client') {
      // If client attempts to access technician/company/admin tabs, redirect to client portal
      if (detected === 'tools' || detected === 'technician' || detected === 'company' || detected === 'gestao-pro-mz') {
        setActiveTab('client');
        try {
          window.history.replaceState({ tab: 'client' }, '', '#cliente');
        } catch {}
      } else if (detected && VALID_TABS.includes(detected)) {
        setActiveTab(detected);
      } else {
        setActiveTab('client');
        try {
          window.history.replaceState({ tab: 'client' }, '', '#cliente');
        } catch {}
      }
    }
  }, [currentUser?.uid, currentUser?.tipoConta, currentUser?.role, currentUser?.statusAprovacao, currentUser?.status, isClient, isTechnician, isCompany, isAdmin, isLoading]);

  // 3. First-time login onboarding check
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
    let targetTab = tab;
    // Map aliases
    if (tab === 'tecnico' || tab === 'painel-tecnico') targetTab = 'technician';
    if (tab === 'feed' || tab === 'mural') targetTab = 'community';
    if (tab === 'gestao-pro-mz' || tab === 'admin') targetTab = 'gestao-pro-mz';

    // RBAC Route Guard Checks
    if (isClient && (targetTab === 'tools' || targetTab === 'technician' || targetTab === 'company' || targetTab === 'gestao-pro-mz')) {
      if (targetTab === 'tools') {
        alert('As ferramentas de emissão de OS e dimensionamento técnico são exclusivas para técnicos e empresas credenciados.');
        return;
      }
      setRequiredRoleForDenied(targetTab === 'company' ? 'company' : 'technician');
      setIsAccessDeniedOpen(true);
      return;
    }

    if (targetTab === 'gestao-pro-mz' || targetTab === 'admin') {
      if (!isAdmin) {
        setRequiredRoleForDenied('admin');
        setIsAccessDeniedOpen(true);
        return;
      }
    } else if (targetTab === 'company') {
      if (!isCompany && !isAdmin) {
        setRequiredRoleForDenied('company');
        setIsAccessDeniedOpen(true);
        return;
      }
    } else if (targetTab === 'technician') {
      if (!isTechnician && !isAdmin) {
        setRequiredRoleForDenied('technician');
        setIsAccessDeniedOpen(true);
        return;
      }
    }

    setActiveTab(targetTab);

    if (addToHistory && typeof window !== 'undefined' && window.history) {
      try {
        const hashName = targetTab === 'technician' ? 'tecnico' : targetTab === 'community' ? 'feed' : targetTab === 'gestao-pro-mz' ? 'gestao-pro-mz' : targetTab;
        window.history.pushState({ tab: targetTab }, '', `#${hashName}`);
      } catch {
        try {
          window.location.hash = `#${targetTab}`;
        } catch {}
      }
    }

    if (typeof window !== 'undefined') {
      try {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch {}
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

  // Blocked account screen
  if (currentUser.status === 'blocked' || currentUser.statusConta === 'bloqueada') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mb-4">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Conta Suspensa / Bloqueada</h1>
        <p className="text-sm text-slate-400 max-w-md mb-6 leading-relaxed">
          Sua conta foi suspensa pela administração da TécnicaMZ. Motivo:{' '}
          <strong className="text-rose-400">{currentUser.suspensionReason || 'Violação das diretrizes da plataforma.'}</strong>
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <a
            href="https://wa.me/258841234567"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors"
          >
            Falar com Suporte WhatsApp
          </a>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
          >
            Recarregar
          </button>
        </div>
      </div>
    );
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
                  href="https://wa.me/258841234567"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-emerald-400 hover:underline font-bold"
                >
                  <Phone className="w-3.5 h-3.5 shrink-0" />
                  <span>WhatsApp: 841234567</span>
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
        onGoToSettings={() => handleNavigate('settings')}
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
    <ErrorBoundary>
      <AuthProvider>
        <DataProvider>
          <AppContent />
        </DataProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
