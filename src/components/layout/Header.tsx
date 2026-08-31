import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import {
  Wrench,
  Search,
  Bell,
  MessageSquare,
  Sparkles,
  User,
  Settings,
  LogOut,
  Shield,
  Building2,
  Users,
  ShoppingBag,
  Sliders,
  Briefcase,
  GraduationCap,
  LayoutDashboard,
  ChevronDown,
  MoreHorizontal
} from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  onNavigateTab: (tab: string) => void;
  onOpenSearch: () => void;
  onOpenSaraAi: () => void;
  onOpenMessages: () => void;
  onOpenNotifications: () => void;
  unreadNotificationsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onNavigateTab,
  onOpenSearch,
  onOpenSaraAi,
  onOpenMessages,
  onOpenNotifications,
  unreadNotificationsCount
}) => {
  const { currentUser, isClient, isTechnician, isCompany, isAdmin, logout } = useAuth();
  const { conversations } = useData();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setIsMoreMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Unread messages count
  const unreadMessagesCount = currentUser
    ? conversations.filter(c => c.participantIds.includes(currentUser.uid) && ((c.unreadCount ?? 0) > 0)).length
    : 0;

  const getRoleBadge = () => {
    if (isAdmin) return { label: 'Admin', color: 'bg-purple-100 text-purple-800 border-purple-200', panelTab: 'gestao-pro-mz' };
    if (isCompany) return { label: 'Empresa', color: 'bg-indigo-100 text-indigo-800 border-indigo-200', panelTab: 'company' };
    if (isTechnician) return { label: 'Técnico', color: 'bg-blue-100 text-blue-800 border-blue-200', panelTab: 'technician' };
    return { label: 'Cliente', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', panelTab: 'client' };
  };

  const roleInfo = getRoleBadge();

  // Navigation items based on role (Clients have a focused 3-4 item menu)
  const clientNavItems = [
    { id: 'community', label: 'Mural / Feed', icon: Users },
    { id: 'technicians_directory', label: 'Técnicos MZ', icon: Wrench },
    { id: 'market', label: 'Mercado', icon: ShoppingBag },
    { id: 'client', label: 'Meu Perfil', icon: User },
  ];

  const technicianNavItems = [
    { id: 'community', label: 'Mural / Feed', icon: Users },
    { id: 'tools', label: 'Ferramentas & OS', icon: Sliders },
    { id: 'market', label: 'Mercado', icon: ShoppingBag },
    { id: 'technicians_directory', label: 'Técnicos', icon: Wrench },
    { id: 'jobs', label: 'Vagas & Obras', icon: Briefcase },
    { id: 'company_directory', label: 'Empresas', icon: Building2 },
    { id: 'academy', label: 'Academia MZ', icon: GraduationCap },
  ];

  const primaryNavItems = isClient ? clientNavItems : technicianNavItems;

  // Items for medium screens visible vs in "Mais" dropdown
  const visibleOnMedium = primaryNavItems.slice(0, 4);
  const overflowOnMedium = primaryNavItems.slice(4);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs text-slate-900">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-4">
          {/* Left: Brand Logo & Quick Search */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={() => onNavigateTab('community')}
              className="flex items-center gap-2 text-left focus:outline-none group"
              title="TécnicaMZ Pro - Início"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform">
                <Wrench className="w-5 h-5 text-white" />
              </div>
              <div className="hidden min-[380px]:block">
                <div className="flex items-center gap-1">
                  <span className="text-base sm:text-lg font-black tracking-tight text-slate-900">
                    Técnica<span className="text-blue-600">MZ</span>
                  </span>
                  <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-blue-600 text-white">
                    PRO
                  </span>
                </div>
                <p className="text-[9px] font-semibold text-slate-400 -mt-0.5 hidden md:block">
                  Comunidade Técnica de Moçambique
                </p>
              </div>
            </button>

            {/* Quick Search Bar */}
            <div className="relative ml-1">
              <button
                onClick={onOpenSearch}
                className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-slate-100 hover:bg-slate-200/70 rounded-full text-slate-500 text-xs font-medium transition cursor-pointer"
                title="Pesquisa Geral"
              >
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="hidden xl:inline text-[11px] pr-2">Pesquisar técnicos, ferramentas ou vagas...</span>
                <span className="hidden md:inline xl:hidden text-[11px]">Pesquisar</span>
              </button>
            </div>
          </div>

          {/* Center (Desktop PC Navigation Menu): Full Wide Nav on XL, Compact Nav with 'Mais' on MD-LG */}
          {/* XL Screens: Full Menu */}
          <nav className="hidden xl:flex items-center gap-1">
            {primaryNavItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigateTab(item.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 font-black ring-1 ring-blue-100 shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span className="whitespace-nowrap">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* MD & LG Screens: Primary 4 Items + 'Mais' Dropdown */}
          <nav className="hidden md:flex xl:hidden items-center gap-1">
            {visibleOnMedium.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigateTab(item.id)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 font-black'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span className="whitespace-nowrap">{item.label}</span>
                </button>
              );
            })}

            {/* 'Mais' Dropdown for Medium Screens */}
            <div className="relative" ref={moreMenuRef}>
              <button
                onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                  overflowOnMedium.some(i => i.id === activeTab)
                    ? 'bg-blue-50 text-blue-600 font-black'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <MoreHorizontal className="w-4 h-4" />
                <span>Mais</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {isMoreMenuOpen && (
                <div className="absolute left-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  {overflowOnMedium.map(item => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          onNavigateTab(item.id);
                          setIsMoreMenuOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-xs font-bold flex items-center gap-2.5 transition ${
                          isActive ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Painel Direct Button (Top Bar for Mobile & PC) */}
            {currentUser && (
              <button
                onClick={() => onNavigateTab(roleInfo.panelTab)}
                className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-bold transition active:scale-95 cursor-pointer ${
                  activeTab === roleInfo.panelTab
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
                }`}
                title={`Aceder ao Painel (${roleInfo.label})`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span className="text-[11px] font-bold">Painel</span>
              </button>
            )}

            {/* Sara IA Button (Técnico / Empresa / Admin Only) */}
            {!isClient && (
              <button
                onClick={onOpenSaraAi}
                className="px-2.5 sm:px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 text-white text-xs font-black transition flex items-center gap-1.5 shadow-md shadow-blue-500/20 active:scale-95 cursor-pointer"
                title="Assistente Sara IA (Visão Computacional & Normas)"
              >
                <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
                <span className="text-[11px] hidden sm:inline">Sara IA</span>
              </button>
            )}

            {/* Notifications Bell */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 rounded-full hover:bg-slate-100 text-slate-700 transition active:scale-95"
              title="Notificações"
            >
              <Bell className="w-5 h-5 text-slate-700" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center ring-2 ring-white animate-pulse">
                  {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                </span>
              )}
            </button>

            {/* Messages Chat Trigger */}
            <button
              onClick={onOpenMessages}
              className="relative p-2 rounded-full hover:bg-slate-100 text-slate-700 transition active:scale-95"
              title="Mensagens Diretas"
            >
              <MessageSquare className="w-5 h-5 text-slate-700" />
              {unreadMessagesCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-blue-600 ring-2 ring-white"></span>
              )}
            </button>

            {/* User Profile & Dropdown */}
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-1.5 p-1 sm:p-1.5 rounded-full hover:bg-slate-100 transition focus:outline-none cursor-pointer"
                title="Meu Perfil & Menu"
              >
                <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200 text-blue-800 font-black text-xs flex items-center justify-center overflow-hidden">
                  {currentUser?.avatarUrl ? (
                    <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-full h-full object-cover" />
                  ) : (
                    currentUser?.name?.charAt(0).toUpperCase() || 'U'
                  )}
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200/90 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-xs font-black text-slate-900 truncate">
                      {currentUser?.name || 'Utilizador'}
                    </p>
                    <p className="text-[11px] text-slate-500 font-mono truncate">
                      {currentUser?.email}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${roleInfo.color}`}>
                        {roleInfo.label}
                      </span>
                      <button
                        onClick={() => {
                          onNavigateTab(roleInfo.panelTab);
                          setIsProfileMenuOpen(false);
                        }}
                        className="text-[11px] text-blue-600 hover:underline font-bold flex items-center gap-1"
                      >
                        <LayoutDashboard className="w-3 h-3" />
                        <span>Meu Painel</span>
                      </button>
                    </div>
                  </div>

                  <div className="py-1 text-xs font-semibold text-slate-700">
                    {/* Quick Access to Role Dashboard */}
                    <button
                      onClick={() => {
                        onNavigateTab(roleInfo.panelTab);
                        setIsProfileMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2.5"
                    >
                      <LayoutDashboard className="w-4 h-4 text-slate-400" />
                      <span>Painel de Controle ({roleInfo.label})</span>
                    </button>

                    <button
                      onClick={() => {
                        onNavigateTab('settings');
                        setIsProfileMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2.5"
                    >
                      <Settings className="w-4 h-4 text-slate-400" />
                      <span>Definições & Perfil</span>
                    </button>

                    <div className="my-1 border-t border-slate-100" />

                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2.5 font-bold"
                    >
                      <LogOut className="w-4 h-4 text-red-500" />
                      <span>Terminar Sessão</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

