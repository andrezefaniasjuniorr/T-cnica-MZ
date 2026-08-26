import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import {
  Wrench,
  Search,
  MessageSquare,
  Sparkles,
  User,
  Building2,
  Shield,
  Briefcase,
  ShoppingBag,
  BookOpen,
  Calculator,
  Menu,
  X,
  LogOut,
  ChevronDown
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  onNavigateTab: (tab: string) => void;
  onOpenSearch: () => void;
  onOpenSaraAi: () => void;
  onOpenMessages: () => void;
  onOpenAuth: (role?: any) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onNavigateTab,
  onOpenSearch,
  onOpenSaraAi,
  onOpenMessages,
  onOpenAuth
}) => {
  const { currentUser, isTechnician, isCompany, isAdmin, logout } = useAuth();
  const { conversations, jobs, technicians } = useData();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Unread messages count for current user
  const unreadMessagesCount = currentUser
    ? conversations.filter(c => c.participantIds.includes(currentUser.uid) && c.unreadCount > 0).length
    : 0;

  const getDashboardTabName = () => {
    if (isAdmin) return { tab: 'admin', label: 'Console Admin', icon: <Shield className="w-3.5 h-3.5 text-amber-400" /> };
    if (isCompany) return { tab: 'company', label: 'Painel Empresa', icon: <Building2 className="w-3.5 h-3.5 text-purple-400" /> };
    if (isTechnician) return { tab: 'technician', label: 'Painel do Técnico', icon: <Wrench className="w-3.5 h-3.5 text-blue-400" /> };
    return { tab: 'client', label: 'Meus Pedidos', icon: <User className="w-3.5 h-3.5 text-emerald-400" /> };
  };

  const dashboardInfo = getDashboardTabName();

  const navItems = [
    { id: 'home', label: 'Início' },
    { id: 'community', label: 'Mural dos Técnicos' },
    { id: 'technicians_directory', label: 'Técnicos MZ' },
    { id: 'jobs', label: 'Vagas & Emprego' },
    { id: 'company_directory', label: 'Empresas' },
    { id: 'market', label: 'Mercado' },
    { id: 'tools', label: 'Ferramentas & Nível' },
    { id: 'academy', label: 'Academia' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Logo */}
          <button
            onClick={() => onNavigateTab('home')}
            className="flex items-center gap-2.5 shrink-0 text-left focus:outline-none"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-600/30">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-base font-black tracking-tight text-white">Técnica</span>
                <span className="text-base font-black tracking-tight text-amber-400">MZ</span>
                <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  PRO
                </span>
              </div>
              <p className="text-[9px] text-slate-400 tracking-wider">ECOSSISTEMA TÉCNICO MOÇAMBICANO</p>
            </div>
          </button>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1 text-xs font-bold text-slate-300">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => onNavigateTab(item.id)}
                className={`px-3 py-2 rounded-xl transition ${
                  activeTab === item.id
                    ? 'bg-white/10 text-white font-black'
                    : 'hover:bg-white/5 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Right Action Icons & Auth */}
          <div className="flex items-center gap-2">
            {/* Search Trigger */}
            <button
              onClick={onOpenSearch}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition flex items-center gap-1.5 text-xs font-semibold"
              title="Pesquisa Global"
            >
              <Search className="w-4 h-4 text-slate-400" />
              <span className="hidden sm:inline text-[11px] text-slate-400">Pesquisar...</span>
            </button>

            {/* Sara IA Assistant */}
            <button
              onClick={onOpenSaraAi}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600/30 to-purple-600/30 hover:from-blue-600/50 hover:to-purple-600/50 text-white border border-blue-400/30 text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span className="hidden sm:inline">Sara IA</span>
            </button>

            {/* Messages Chat Trigger */}
            {currentUser && (
              <button
                onClick={onOpenMessages}
                className="relative p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition"
                title="Mensagens & Chat"
              >
                <MessageSquare className="w-4 h-4" />
                {unreadMessagesCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-500 ring-2 ring-slate-950"></span>
                )}
              </button>
            )}

            {/* Dynamic Role Dashboard Shortcut */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigateTab(dashboardInfo.tab)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                    activeTab === dashboardInfo.tab
                      ? 'bg-white text-slate-900 border-white font-black'
                      : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
                  }`}
                >
                  {dashboardInfo.icon}
                  <span className="hidden md:inline">{dashboardInfo.label}</span>
                </button>

                <button
                  onClick={logout}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-white/5 transition"
                  title="Terminar Sessão"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => onOpenAuth()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow-md shadow-blue-600/20"
              >
                Entrar / Cadastrar
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-slate-900 border-b border-slate-800 p-4 space-y-2">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => {
                onNavigateTab(item.id);
                setIsMobileMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition ${
                activeTab === item.id
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
          {currentUser && (
            <button
              onClick={() => {
                onNavigateTab(dashboardInfo.tab);
                setIsMobileMenuOpen(false);
              }}
              className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-black bg-white/10 text-white flex items-center gap-2"
            >
              {dashboardInfo.icon}
              <span>{dashboardInfo.label}</span>
            </button>
          )}
        </div>
      )}
    </header>
  );
};
