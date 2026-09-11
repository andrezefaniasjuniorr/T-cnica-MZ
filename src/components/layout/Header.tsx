import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { soundFX } from '../../utils/audio';
import { UserAvatar } from '../common/UserAvatar';
import { UserRankBadge } from '../../utils/gamification';
import { PWAInstallHeaderButton } from '../common/PWAInstallBanner';
import { NetworkStatusIndicator } from '../common/NetworkStatusIndicator';
import {
  Wrench,
  Search,
  Bell,
  MessageSquare,
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
  MoreHorizontal,
  LayoutGrid,
  ShieldCheck,
  AlertCircle,
  Clock,
  Sparkles
} from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  onNavigateTab: (tab: string) => void;
  onOpenSearch: () => void;
  onOpenSaraAi: () => void;
  onOpenMessages: () => void;
  onOpenNotifications: () => void;
  unreadNotificationsCount: number;
  onOpenMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onNavigateTab,
  onOpenSearch,
  onOpenSaraAi,
  onOpenMessages,
  onOpenNotifications,
  unreadNotificationsCount,
  onOpenMobileMenu
}) => {
  const {
    currentUser,
    isClient,
    isTechnician,
    isCompany,
    isAdmin,
    temSeloMZ,
    seloDaysRemaining,
    isSeloExpired,
    isTrialActive,
    trialDaysRemaining,
    isTrialValid,
    logout
  } = useAuth();
  const { conversations, unreadSystemNotificationsCount, unreadMessagesCount } = useData();
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

  const getRoleBadge = () => {
    if (isAdmin) return { label: 'Admin', color: 'bg-purple-100 text-purple-800 border-purple-200', panelTab: 'gestao-pro-mz' };
    if (isCompany) return { label: 'Empresa', color: 'bg-indigo-100 text-indigo-800 border-indigo-200', panelTab: 'company' };
    if (isTechnician) return { label: 'Técnico', color: 'bg-blue-100 text-blue-800 border-blue-200', panelTab: 'technician' };
    return { label: 'Cliente', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', panelTab: 'client' };
  };

  const roleInfo = getRoleBadge();

  // Navigation items based on role (Clients have a focused 3-4 item menu)
  const clientNavItems = [
    { id: 'community', label: 'Mural', icon: Users },
    { id: 'technicians_directory', label: 'Técnicos', icon: Wrench },
    { id: 'market', label: 'Mercado', icon: ShoppingBag },
    { id: 'client', label: 'Perfil', icon: User },
  ];

  const technicianNavItems = [
    { id: 'community', label: 'Mural', icon: Users },
    { id: 'tools', label: 'Ferramentas', icon: Sliders },
    { id: 'market', label: 'Mercado', icon: ShoppingBag },
    { id: 'technicians_directory', label: 'Técnicos', icon: Wrench },
    { id: 'jobs', label: 'Vagas', icon: Briefcase },
    { id: 'company_directory', label: 'Empresas', icon: Building2 },
    { id: 'academy', label: 'Academia', icon: GraduationCap },
  ];

  const primaryNavItems = isClient ? clientNavItems : technicianNavItems;

  // Items for medium screens visible vs in "Mais" dropdown
  const visibleOnMedium = primaryNavItems.slice(0, 4);
  const overflowOnMedium = primaryNavItems.slice(4);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs text-slate-900">
      <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
        <div className="flex items-center h-14 gap-2 w-full">
          {/* Left: Brand Logo & Quick Search */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={() => onNavigateTab('community')}
              className="flex items-center gap-1.5 text-left focus:outline-none group shrink-0"
              title="TécnicaMZ Pro - Início"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform shrink-0">
                <Wrench className="w-4 h-4 text-white" />
              </div>
              <div className="hidden min-[450px]:block">
                <div className="flex items-center gap-1">
                  <span className="text-sm sm:text-base font-black tracking-tight text-slate-900">
                    Técnica<span className="text-blue-600">MZ</span>
                  </span>
                  <span className="text-[9px] font-black uppercase px-1 py-0.2 rounded bg-blue-600 text-white">
                    PRO
                  </span>
                </div>
              </div>
            </button>

            {/* Quick Search Bar */}
            <div className="relative shrink-0">
              <button
                onClick={() => {
                  soundFX.playModalOpen();
                  onOpenSearch();
                }}
                className="flex items-center gap-1 p-1.5 sm:px-2.5 sm:py-1 bg-slate-100 hover:bg-slate-200/70 rounded-full text-slate-500 text-xs font-medium transition cursor-pointer shrink-0"
                title="Pesquisa Geral"
              >
                <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="hidden 2xl:inline text-[11px] pr-1">Pesquisar...</span>
                <span className="hidden md:inline 2xl:hidden text-[11px]">Pesquisar</span>
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
                  onClick={() => {
                    soundFX.playClick();
                    onNavigateTab(item.id);
                  }}
                  className={`px-2 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 font-black ring-1 ring-blue-100 shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span className="whitespace-nowrap">{item.label}</span>
                </button>
              );
            })}

            {/* Sara IA Prominent Button on Desktop XL */}
            <button
              id="btnSaraAiDesktopXL"
              onClick={() => {
                soundFX.playClick();
                onOpenSaraAi();
              }}
              className="px-2.5 py-1 rounded-lg bg-linear-to-r from-blue-600 via-indigo-600 to-sky-500 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs shadow-xs hover:shadow-md shadow-blue-500/20 transition flex items-center gap-1 cursor-pointer ml-0.5 active:scale-95"
              title="Abrir Assistente Inteligente Sara IA"
            >
              <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
              <span className="whitespace-nowrap">Sara IA</span>
            </button>
          </nav>

          {/* MD & LG Screens: Primary 4 Items + Sara IA + 'Mais' Dropdown */}
          <nav className="hidden md:flex xl:hidden items-center gap-1">
            {visibleOnMedium.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    soundFX.playClick();
                    onNavigateTab(item.id);
                  }}
                  className={`px-2 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 font-black'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span className="whitespace-nowrap">{item.label}</span>
                </button>
              );
            })}

            {/* Sara IA Prominent Button on Desktop MD-LG */}
            <button
              id="btnSaraAiDesktopMD"
              onClick={() => {
                soundFX.playClick();
                onOpenSaraAi();
              }}
              className="px-2 py-1 rounded-lg bg-linear-to-r from-blue-600 via-indigo-600 to-sky-500 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs shadow-xs hover:shadow-md shadow-blue-500/20 transition flex items-center gap-1 cursor-pointer active:scale-95"
              title="Abrir Assistente Inteligente Sara IA"
            >
              <Sparkles className="w-3 h-3 text-yellow-300 animate-pulse" />
              <span className="whitespace-nowrap">Sara IA</span>
            </button>

            {/* 'Mais' Dropdown for Medium Screens */}
            {!isClient && (
              <div className="relative" ref={moreMenuRef}>
                <button
                  id="btnMaisDesktop"
                  onClick={() => {
                    soundFX.playClick();
                    setIsMoreMenuOpen(!isMoreMenuOpen);
                  }}
                  className={`px-2 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                    overflowOnMedium.some(i => i.id === activeTab)
                      ? 'bg-blue-50 text-blue-600 font-black'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <MoreHorizontal className="w-3.5 h-3.5" />
                  <span>Mais</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {isMoreMenuOpen && (
                  <div className="absolute left-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                    {/* Sara IA Option in More Menu */}
                    <button
                      onClick={() => {
                        soundFX.playClick();
                        onOpenSaraAi();
                        setIsMoreMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-bold flex items-center gap-2.5 transition text-blue-600 hover:bg-blue-50 border-b border-slate-100"
                    >
                      <Sparkles className="w-4 h-4 text-yellow-500" />
                      <span>Sara IA (Assistente)</span>
                    </button>

                    {overflowOnMedium.map(item => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            soundFX.playClick();
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
            )}
          </nav>

          {/* Right Action Icons & User Profile: Fixed on the right with ml-auto flex-shrink-0 flex items-center gap-2 */}
          <div className="ml-auto flex-shrink-0 flex items-center gap-2">
            {/* Botão "Mais" Exclusivo para Mobile Header (@media max-width: 768px) */}
            {onOpenMobileMenu && !isClient && (
              <button
                id="headerBtnMaisMobile"
                data-nav="mais-header"
                onClick={() => {
                  soundFX.playModalOpen();
                  onOpenMobileMenu();
                }}
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 md:hidden flex items-center justify-center transition active:scale-95 cursor-pointer shrink-0"
                title="Abrir todas as opções do sistema"
                aria-label="Mais Opções"
              >
                <LayoutGrid className="w-4 h-4 text-blue-600" />
              </button>
            )}

            {/* Painel Direct Button (Top Bar para Tablet & PC) */}
            {currentUser && (
              <button
                onClick={() => {
                  soundFX.playClick();
                  onNavigateTab(roleInfo.panelTab);
                }}
                className={`hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold transition active:scale-95 cursor-pointer shrink-0 ${
                  activeTab === roleInfo.panelTab
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
                }`}
                title={`Aceder ao Painel (${roleInfo.label})`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span className="text-[11px] font-bold">Painel</span>
              </button>
            )}

            {/* PWA In-App Install Button */}
            <PWAInstallHeaderButton />

            {/* Status de Rede Compacto */}
            <NetworkStatusIndicator className="shrink-0" />

            {/* Daily Streak Counter */}
            {currentUser && (
              <div
                className="hidden lg:flex items-center gap-1 px-2 py-1 rounded-full bg-orange-500/10 border border-orange-200 dark:border-orange-800/60 text-orange-600 dark:text-orange-400 text-xs font-black shadow-2xs group cursor-default select-none shrink-0"
                title={`Ofensiva Diária: ${currentUser.streakCount || 1} dias na bancada (+10 pontos/dia)!`}
              >
                <span className="text-xs">🔥</span>
                <span className="font-mono text-[11px]">
                  {currentUser.streakCount || 1}
                </span>
                <span className="hidden 2xl:inline text-[10px] text-orange-800 dark:text-orange-200 font-bold">
                  dias
                </span>
              </div>
            )}

            {/* Selo MZ Status in Header */}
            {currentUser && !isClient && (
              temSeloMZ ? (
                <button
                  onClick={() => onNavigateTab('comprar-selo-mz')}
                  className="hidden xl:flex items-center gap-1 px-2 py-1 rounded-full bg-blue-500/10 hover:bg-blue-500/20 border border-blue-300 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-bold transition shadow-2xs shrink-0 cursor-pointer"
                  title={`Selo MZ Ativo: ${seloDaysRemaining} dias`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span className="text-[11px] font-black">Selo ({seloDaysRemaining}d)</span>
                </button>
              ) : isSeloExpired ? (
                <button
                  onClick={() => onNavigateTab('comprar-selo-mz')}
                  className="hidden xl:flex items-center gap-1 px-2 py-1 rounded-full bg-rose-500/15 hover:bg-rose-500/25 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold transition shadow-2xs shrink-0 cursor-pointer animate-pulse"
                  title="Selo MZ Expirado."
                >
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                  <span className="text-[11px] font-black">Renovar</span>
                </button>
              ) : isTrialValid ? (
                <div
                  className="hidden xl:flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/10 border border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs font-bold shrink-0"
                  title={`Teste Grátis: ${trialDaysRemaining} dias`}
                >
                  <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span className="text-[11px] font-black">Teste ({trialDaysRemaining}d)</span>
                </div>
              ) : null
            )}

            {/* Notifications Bell */}
            <button
              onClick={() => {
                soundFX.playModalOpen();
                onOpenNotifications();
              }}
              className="relative p-1.5 rounded-full hover:bg-slate-100 text-slate-700 transition active:scale-95 cursor-pointer shrink-0"
              title="Notificações e Avisos do Sistema"
            >
              <Bell className="w-4 h-4 text-slate-700" />
              {unreadSystemNotificationsCount > 0 && (
                <span className="absolute top-0.5 right-0.5 min-w-[15px] h-3.5 px-1 rounded-full bg-red-500 text-white text-[8px] font-black flex items-center justify-center ring-2 ring-white animate-pulse">
                  {unreadSystemNotificationsCount > 9 ? '9+' : unreadSystemNotificationsCount}
                </span>
              )}
            </button>

            {/* Messages Chat Trigger */}
            <button
              onClick={() => {
                soundFX.playModalOpen();
                onOpenMessages();
              }}
              className="relative p-1.5 rounded-full hover:bg-slate-100 text-slate-700 transition active:scale-95 shrink-0"
              title="Mensagens Diretas"
            >
              <MessageSquare className="w-4 h-4 text-slate-700" />
              {unreadMessagesCount > 0 && (
                <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white animate-pulse"></span>
              )}
            </button>

            {/* User Profile & Dropdown */}
            <div className="relative shrink-0" ref={profileMenuRef}>
              <button
                id="btnHeaderProfileAvatar"
                onClick={() => {
                  soundFX.playClick();
                  setIsProfileMenuOpen(!isProfileMenuOpen);
                }}
                className="flex items-center gap-1 p-0.5 rounded-full hover:bg-slate-100 transition focus:outline-none cursor-pointer shrink-0 active:scale-95"
                title="Meu Perfil & Menu"
                aria-label="Meu Perfil"
              >
                <UserAvatar
                  name={currentUser?.name}
                  photoURL={currentUser?.photoURL || currentUser?.avatarUrl}
                  size="sm"
                  className="ring-2 ring-white border-2 border-blue-500/40"
                />
                <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:block" />
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200/90 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <p className="text-xs font-black text-slate-900 truncate">
                        {currentUser?.name || 'Utilizador'}
                      </p>
                      <UserRankBadge points={currentUser?.pontos ?? currentUser?.scoreEngajamento ?? 0} size="xs" />
                    </div>
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

                    {/* Selo MZ / Teste Grátis Status in Dropdown */}
                    {!isClient && !isAdmin && (
                      <div className="mt-2.5 pt-2 border-t border-slate-100">
                        {temSeloMZ ? (
                          <div className="flex items-center justify-between p-2 rounded-xl bg-blue-50/80 border border-blue-200/80">
                            <div className="flex items-center gap-1.5">
                              <ShieldCheck className="w-4 h-4 text-blue-600" />
                              <span className="text-[11px] font-bold text-blue-950">Selo MZ</span>
                            </div>
                            <span className="text-[10px] font-black text-blue-700 bg-blue-100/90 px-2 py-0.5 rounded-md">
                              {seloDaysRemaining} {seloDaysRemaining === 1 ? 'dia' : 'dias'}
                            </span>
                          </div>
                        ) : isSeloExpired ? (
                          <div className="flex items-center justify-between p-2 rounded-xl bg-rose-50/80 border border-rose-200/80">
                            <div className="flex items-center gap-1.5">
                              <AlertCircle className="w-4 h-4 text-rose-600" />
                              <span className="text-[11px] font-bold text-rose-950">Selo Expirado</span>
                            </div>
                            <button
                              onClick={() => {
                                onNavigateTab('comprar-selo-mz');
                                setIsProfileMenuOpen(false);
                              }}
                              className="text-[10px] font-black text-white bg-rose-600 hover:bg-rose-700 px-2 py-0.5 rounded-md transition"
                            >
                              Renovar
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between p-2 rounded-xl bg-amber-50/80 border border-amber-200/80">
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-4 h-4 text-amber-600" />
                              <span className="text-[11px] font-bold text-amber-950">Teste Grátis</span>
                            </div>
                            <span className="text-[10px] font-black text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                              {trialDaysRemaining > 0 ? `${trialDaysRemaining} ${trialDaysRemaining === 1 ? 'dia' : 'dias'}` : 'Expirado'}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
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

                    <button
                      onClick={() => {
                        soundFX.playClick();
                        onOpenSaraAi();
                        setIsProfileMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-blue-50 text-blue-600 flex items-center gap-2.5 font-bold"
                    >
                      <Sparkles className="w-4 h-4 text-yellow-500" />
                      <span>Sara IA (Assistente Técnica)</span>
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

