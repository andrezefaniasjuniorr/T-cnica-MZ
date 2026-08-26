import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { Navbar } from './components/layout/Navbar';
import { HeroSection } from './components/home/HeroSection';
import { TechniciansDirectory } from './components/technicians/TechniciansDirectory';
import { CompanyDirectory } from './components/company/CompanyDirectory';
import { CompanyDashboard } from './components/company/CompanyDashboard';
import { JobsSection } from './components/jobs/JobsSection';
import { TechnicianDashboard } from './components/technician/TechnicianDashboard';
import { ClientDashboard } from './components/client/ClientDashboard';
import { AdminPanel } from './components/admin/AdminPanel';
import { MarketSection } from './components/market/MarketSection';
import { AcademySection } from './components/academy/AcademySection';
import { TecnicaTools } from './components/tools/TecnicaTools';
import { CommunityFeed } from './components/community/CommunityFeed';

// Modals
import { GlobalSearchModal } from './components/common/GlobalSearchModal';
import { SaraAiModal } from './components/common/SaraAiModal';
import { MessagesModal } from './components/common/MessagesModal';
import { AuthModal } from './components/auth/AuthModal';
import { AccessDeniedModal } from './components/common/AccessDeniedModal';

import { UserRole } from './types';
import { Wrench, ShieldCheck } from 'lucide-react';

const AppContent: React.FC = () => {
  const { currentUser, isTechnician, isCompany, isAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState<string>('home');

  // Modal Visibility States
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSaraAiOpen, setIsSaraAiOpen] = useState(false);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [targetMessageUser, setTargetMessageUser] = useState<{ id: string; name: string; role: string } | null>(null);

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authInitialRole, setAuthInitialRole] = useState<UserRole>('client');

  const [isAccessDeniedOpen, setIsAccessDeniedOpen] = useState(false);
  const [requiredRoleForDenied, setRequiredRoleForDenied] = useState<UserRole>('client');

  const handleNavigate = (tab: string) => {
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAuth = (role: UserRole = 'client') => {
    setAuthInitialRole(role);
    setIsAuthOpen(true);
  };

  const handleOpenDirectMessage = (userId: string, userName: string, role: string) => {
    setTargetMessageUser({ id: userId, name: userName, role });
    setIsMessagesOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-900/5 text-slate-900 flex flex-col font-sans antialiased selection:bg-blue-500 selection:text-white">
      {/* 1. Global Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        onNavigateTab={handleNavigate}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenSaraAi={() => setIsSaraAiOpen(true)}
        onOpenMessages={() => {
          setTargetMessageUser(null);
          setIsMessagesOpen(true);
        }}
        onOpenAuth={handleOpenAuth}
      />

      {/* 2. Main Body Content Routed by activeTab */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <HeroSection
            onNavigateTab={handleNavigate}
            onOpenAuth={handleOpenAuth}
            onOpenSaraAi={() => setIsSaraAiOpen(true)}
            onOpenMessages={handleOpenDirectMessage}
          />
        )}

        {activeTab === 'community' && (
          <CommunityFeed
            onNavigateTab={handleNavigate}
          />
        )}

        {activeTab === 'technicians_directory' && (
          <TechniciansDirectory
            onNavigateTab={handleNavigate}
            onOpenMessages={handleOpenDirectMessage}
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

        {activeTab === 'admin' && (
          <AdminPanel
            onNavigateTab={handleNavigate}
          />
        )}

        {activeTab === 'market' && (
          <MarketSection
            onNavigateTab={handleNavigate}
          />
        )}

        {activeTab === 'academy' && (
          <AcademySection
            onNavigateTab={handleNavigate}
          />
        )}

        {activeTab === 'tools' && (
          <TecnicaTools />
        )}
      </main>

      {/* 3. Global Footer */}
      <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 text-xs mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800">
            {/* Brand */}
            <div className="space-y-3 md:col-span-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black">
                  <Wrench className="w-4 h-4" />
                </div>
                <span className="text-base font-black text-white">TécnicaMZ</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-400">
                A infraestrutura digital moçambicana para contratação de serviços técnicos, empregos industriais e validação de NUIT corporativo.
              </p>
              <div className="flex items-center gap-2 text-[10px] text-emerald-400 font-mono">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Auditoria & Pagamentos M-Pesa Verificados</span>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-2">
              <h4 className="font-bold text-white uppercase text-[11px] tracking-wider">Módulos & Serviços</h4>
              <ul className="space-y-1 text-[11px]">
                <li><button onClick={() => handleNavigate('technicians_directory')} className="hover:text-white">Diretório de Técnicos</button></li>
                <li><button onClick={() => handleNavigate('jobs')} className="hover:text-white">Vagas de Emprego MZ</button></li>
                <li><button onClick={() => handleNavigate('company_directory')} className="hover:text-white">Empresas & Indústrias</button></li>
                <li><button onClick={() => handleNavigate('market')} className="hover:text-white">Mercado de Ferramentas</button></li>
                <li><button onClick={() => handleNavigate('tools')} className="hover:text-white">Calculadoras de Engenharia</button></li>
              </ul>
            </div>

            {/* Provinces */}
            <div className="space-y-2">
              <h4 className="font-bold text-white uppercase text-[11px] tracking-wider">Cobertura Nacional</h4>
              <p className="text-[11px] leading-relaxed text-slate-400">
                Atendimento ativo em Maputo, Matola, Gaza, Inhambane, Sofala (Beira), Manica, Tete, Zambézia (Quelimane), Nampula, Niassa e Cabo Delgado (Pemba).
              </p>
            </div>

            {/* Emergency & Contacts */}
            <div className="space-y-2">
              <h4 className="font-bold text-white uppercase text-[11px] tracking-wider">Contatos de Emergência MZ</h4>
              <div className="space-y-1 text-[11px] text-slate-400">
                <p>⚡ Piquete EDM: <strong className="text-white">1455</strong></p>
                <p>🚒 Bombeiros: <strong className="text-white">198</strong></p>
                <p>📞 Suporte TécnicaMZ: <strong className="text-white">+258 84 100 2000</strong></p>
                <p>✉️ E-mail: <strong className="text-white">contato@tecnicamz.co.mz</strong></p>
              </div>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
            <p>© 2026 TécnicaMZ Platform. Todos os direitos reservados. Moçambique.</p>
            <p className="flex items-center gap-1">
              Desenvolvido com excelência para a engenharia e trabalho moçambicano.
            </p>
          </div>
        </div>
      </footer>

      {/* 4. Global Modals */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectResult={(tab) => handleNavigate(tab)}
      />

      <SaraAiModal
        isOpen={isSaraAiOpen}
        onClose={() => setIsSaraAiOpen(false)}
      />

      <MessagesModal
        isOpen={isMessagesOpen}
        onClose={() => setIsMessagesOpen(false)}
        initialTargetUserId={targetMessageUser?.id}
        initialTargetUserName={targetMessageUser?.name}
        initialTargetRole={targetMessageUser?.role}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialRole={authInitialRole}
      />

      <AccessDeniedModal
        isOpen={isAccessDeniedOpen}
        onClose={() => setIsAccessDeniedOpen(false)}
        requiredRole={requiredRoleForDenied}
        onOpenAuth={(role) => handleOpenAuth(role)}
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
