import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { soundFX } from '../../utils/audio';
import {
  X,
  Users,
  Wrench,
  ShoppingBag,
  Sliders,
  Sparkles,
  Briefcase,
  Building2,
  BookOpen,
  Trophy,
  LayoutDashboard,
  Settings,
  MessageSquare,
  Bell,
  Camera,
  Phone,
  Shield,
  Volume2,
  VolumeX,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';

interface MobileExtraMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  onNavigateTab: (tab: string) => void;
  onOpenSaraAi?: () => void;
  onOpenMessages?: () => void;
  onOpenNotifications?: () => void;
}

export const MobileExtraMenuDrawer: React.FC<MobileExtraMenuDrawerProps> = ({
  isOpen,
  onClose,
  activeTab,
  onNavigateTab,
  onOpenSaraAi,
  onOpenMessages,
  onOpenNotifications
}) => {
  const { currentUser, isClient, isTechnician, isCompany, isAdmin } = useAuth();
  const [soundEnabled, setSoundEnabled] = useState(() => soundFX.isEnabled());

  if (!isOpen) return null;

  const handleClose = () => {
    soundFX.playModalClose();
    onClose();
  };

  const handleNavigate = (tabId: string) => {
    soundFX.playClick();
    onNavigateTab(tabId);
    onClose();
  };

  const handleToggleSound = () => {
    const newState = soundFX.toggleSound();
    setSoundEnabled(newState);
  };

  // Determinar painel de controle do usuário
  const userDashboardTab = isAdmin
    ? 'gestao-pro-mz'
    : isCompany
    ? 'company'
    : isTechnician
    ? 'technician'
    : 'client';

  const userDashboardTitle = isAdmin
    ? 'Painel Admin'
    : isCompany
    ? 'Painel da Empresa'
    : isTechnician
    ? 'Painel do Técnico'
    : 'Meu Perfil / Painel';

  const menuOptions = [
    {
      id: 'community',
      title: 'Mural & Feed',
      subtitle: 'Dicas, novidades e perguntas',
      icon: Users,
      color: 'from-blue-600 to-indigo-600',
      action: () => handleNavigate('community')
    },
    {
      id: 'stories',
      title: 'Status & Stories',
      subtitle: 'Stories técnicos 24 horas',
      icon: Camera,
      color: 'from-pink-500 to-rose-600',
      action: () => {
        soundFX.playClick();
        onNavigateTab('community');
        onClose();
      }
    },
    {
      id: 'technicians_directory',
      title: 'Técnicos MZ',
      subtitle: 'Profissionais auditados',
      icon: Wrench,
      color: 'from-sky-600 to-blue-700',
      action: () => handleNavigate('technicians_directory')
    },
    {
      id: 'ranking',
      title: 'Ranking Nacional',
      subtitle: 'Top técnicos mais votados',
      icon: Trophy,
      color: 'from-amber-500 to-yellow-600',
      action: () => handleNavigate('technicians_directory')
    },
    {
      id: 'jobs',
      title: 'Vagas & Emprego',
      subtitle: 'Oportunidades e obras',
      icon: Briefcase,
      color: 'from-emerald-600 to-teal-700',
      action: () => handleNavigate('jobs')
    },
    {
      id: 'company_directory',
      title: 'Empresas MZ',
      subtitle: 'Parceiros e empreiteiras',
      icon: Building2,
      color: 'from-purple-600 to-indigo-700',
      action: () => handleNavigate('company_directory')
    },
    {
      id: 'academy',
      title: 'Livros & Manuais',
      subtitle: 'Academia MZ e normas técnicas',
      icon: BookOpen,
      color: 'from-teal-600 to-cyan-700',
      action: () => handleNavigate('academy')
    },
    {
      id: 'market',
      title: 'Mercado de Ferramentas',
      subtitle: 'Compre e venda equipamentos',
      icon: ShoppingBag,
      color: 'from-orange-500 to-amber-600',
      action: () => handleNavigate('market')
    },
    {
      id: 'tools',
      title: 'Calculadoras & OS',
      subtitle: 'Dimensionamento e laudos',
      icon: Sliders,
      color: 'from-slate-700 to-slate-900',
      action: () => handleNavigate('tools')
    },
    {
      id: 'sara',
      title: 'Sara IA',
      subtitle: 'Assistente com visão e normas',
      icon: Sparkles,
      color: 'from-blue-500 to-cyan-400',
      action: () => {
        soundFX.playClick();
        onClose();
        if (onOpenSaraAi) onOpenSaraAi();
      }
    },
    {
      id: userDashboardTab,
      title: userDashboardTitle,
      subtitle: 'Gerenciar serviços e propostas',
      icon: LayoutDashboard,
      color: 'from-blue-600 to-violet-600',
      action: () => handleNavigate(userDashboardTab)
    },
    {
      id: 'messages',
      title: 'Mensagens Diretas',
      subtitle: 'Conversas em tempo real',
      icon: MessageSquare,
      color: 'from-indigo-600 to-blue-600',
      action: () => {
        soundFX.playClick();
        onClose();
        if (onOpenMessages) onOpenMessages();
      }
    },
    {
      id: 'notifications',
      title: 'Notificações',
      subtitle: 'Alertas e novidades do sistema',
      icon: Bell,
      color: 'from-red-500 to-rose-600',
      action: () => {
        soundFX.playClick();
        onClose();
        if (onOpenNotifications) onOpenNotifications();
      }
    },
    {
      id: 'settings',
      title: 'Configurações',
      subtitle: 'Perfil, segurança e preferências',
      icon: Settings,
      color: 'from-slate-600 to-slate-800',
      action: () => handleNavigate('settings')
    }
  ];

  return (
    <div
      id="mobile-extra-menu-backdrop"
      className="fixed inset-0 z-50 flex flex-col justify-end bg-slate-950/60 backdrop-blur-xs transition-opacity duration-200 md:hidden"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      {/* Drawer Container */}
      <div
        id="mobile-extra-menu-drawer"
        className="w-full bg-white rounded-t-3xl shadow-2xl border-t border-slate-200 max-h-[88vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300"
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
      >
        {/* Pull Indicator */}
        <div className="pt-3 pb-1 flex justify-center">
          <div className="w-12 h-1.5 bg-slate-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h2 id="drawer-title" className="text-base font-black text-slate-900 tracking-tight">
                Menu TécnicaMZ Pro
              </h2>
              <p className="text-[11px] font-medium text-slate-500">
                Todas as opções e ferramentas da plataforma
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Audio SFX Toggle Button */}
            <button
              onClick={handleToggleSound}
              className={`p-2 rounded-full text-xs font-bold transition flex items-center justify-center ${
                soundEnabled
                  ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                  : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
              }`}
              title={soundEnabled ? 'Sons ativados (Clique para silenciar)' : 'Sons silenciados (Clique para ativar)'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Close Button */}
            <button
              onClick={handleClose}
              className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
              title="Fechar menu"
              aria-label="Fechar menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* User Quick Info Card */}
        {currentUser && (
          <div className="px-5 pt-3 pb-1">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-slate-50 to-blue-50/40 border border-slate-200/80">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
                  {currentUser.avatarUrl ? (
                    <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    (currentUser.name || 'U').charAt(0).toUpperCase()
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-black text-slate-900 truncate">
                    {currentUser.name || 'Utilizador'}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate">
                    {currentUser.email}
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200">
                {isAdmin ? 'Admin' : isCompany ? 'Empresa' : isTechnician ? 'Técnico' : 'Cliente'}
              </span>
            </div>
          </div>
        )}

        {/* Grid of All Options */}
        <div className="flex-1 overflow-y-auto px-4 py-3 pb-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {menuOptions.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={item.action}
                  className={`flex flex-col text-left p-3 rounded-2xl border transition-all duration-150 active:scale-95 group relative ${
                    isActive
                      ? 'bg-blue-50/80 border-blue-300 ring-2 ring-blue-500/20 shadow-xs'
                      : 'bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/70 shadow-2xs'
                  }`}
                >
                  {/* Active Indicator Pin */}
                  {isActive && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 text-[9px] font-black text-blue-600 bg-blue-100/80 px-1.5 py-0.5 rounded-md">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      <span>Ativo</span>
                    </div>
                  )}

                  {/* Icon with gradient badge */}
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${item.color} text-white flex items-center justify-center shadow-xs mb-2 group-hover:scale-105 transition-transform`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  <span className="text-xs font-black text-slate-900 leading-tight">
                    {item.title}
                  </span>
                  <span className="text-[10px] font-medium text-slate-500 mt-0.5 line-clamp-1">
                    {item.subtitle}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Direct Support WhatsApp Section */}
          <div className="mt-4 pt-3 border-t border-slate-100">
            <a
              href="https://wa.me/258851949159?text=Ol%C3%A1%20Suporte%20T%C3%A9cnicaMZ%2C%20preciso%20de%20ajuda%20na%20plataforma"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => soundFX.playClick()}
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100/70 border border-emerald-200/80 text-emerald-900 transition active:scale-95"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-black text-emerald-950">
                    Suporte WhatsApp Oficial
                  </p>
                  <p className="text-[10px] text-emerald-700 font-mono">
                    +258 85 194 9159 • Apoio Técnico
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-emerald-600" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
