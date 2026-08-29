import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import {
  BarChart3,
  UserCheck,
  Users,
  CreditCard,
  Radio,
  Settings,
  Shield,
  ArrowLeft,
  Menu,
  X,
  RefreshCw,
  Sparkles,
  ExternalLink,
  ChevronRight,
  LogOut,
  Wrench
} from 'lucide-react';

import { AdminOverviewTab } from './AdminOverviewTab';
import { AdminApprovalsTab } from './AdminApprovalsTab';
import { AdminUsersTab } from './AdminUsersTab';
import { AdminPaymentsTab } from './AdminPaymentsTab';
import { AdminBroadcastTab } from './AdminBroadcastTab';
import { AdminSettingsTab } from './AdminSettingsTab';

interface AdminPanelProps {
  onNavigateTab: (tab: string) => void;
}

type AdminTab = 'metrics' | 'approvals' | 'users' | 'payments' | 'broadcast' | 'settings';

export const AdminPanel: React.FC<AdminPanelProps> = ({ onNavigateTab }) => {
  const {
    currentUser,
    usersList,
    updateUserStatus,
    deleteUserAccount,
    approveUserAccount,
    rejectUserAccount,
    toggleUserVerification,
    grantManualSubscription30Days
  } = useAuth();

  const {
    payments,
    notifications,
    settings,
    approvePayment,
    rejectPayment,
    sendAdminNotification,
    updateSettings
  } = useData();

  const [activeTab, setActiveTab] = useState<AdminTab>('metrics');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Counters for Badges
  const pendingApprovalsCount = usersList.filter(
    u => (u.role === 'technician' || u.role === 'company' || u.tipoConta === 'tecnico') &&
         (u.statusAprovacao === 'pendente' || u.status === 'pending_approval')
  ).length;

  const pendingPaymentsCount = payments.filter(p => p.status === 'pending').length;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(r => setTimeout(r, 600));
    setIsRefreshing(false);
  };

  const navItems: { id: AdminTab; label: string; icon: React.FC<{ className?: string }>; badge?: number; badgeColor?: string }[] = [
    { id: 'metrics', label: 'Visão Geral & Métricas', icon: BarChart3 },
    { id: 'approvals', label: 'Aprovações Pendentes', icon: UserCheck, badge: pendingApprovalsCount, badgeColor: 'bg-amber-500 text-slate-950' },
    { id: 'users', label: 'Gestão de Usuários', icon: Users, badge: usersList.length, badgeColor: 'bg-slate-800 text-slate-300' },
    { id: 'payments', label: 'Pagamentos (M-Pesa/e-Mola)', icon: CreditCard, badge: pendingPaymentsCount, badgeColor: 'bg-blue-500 text-white' },
    { id: 'broadcast', label: 'Comunicados & Avisos', icon: Radio },
    { id: 'settings', label: 'Configurações do Sistema', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row font-sans selection:bg-blue-500 selection:text-white">
      {/* 1. Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-72 bg-slate-900/95 border-r border-slate-800/80 p-5 shrink-0 justify-between">
        <div className="space-y-6">
          {/* Brand */}
          <div className="flex items-center gap-3 pb-5 border-b border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-white text-base tracking-tight">TécnicaMZ</span>
                <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 text-[10px] font-black uppercase border border-blue-500/30">
                  GESTAO
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Painel Administrativo Pro</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map(item => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  id={`admin_nav_${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-bold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && item.badge > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${item.badgeColor || 'bg-slate-800 text-slate-300'}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom User & Back to App button */}
        <div className="pt-4 border-t border-slate-800 space-y-3">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-xs">
              AD
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate">{currentUser?.name || 'Administrador'}</p>
              <p className="text-[10px] text-emerald-400 font-semibold">Super Admin</p>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('community')}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-colors border border-slate-700"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar à Plataforma</span>
          </button>
        </div>
      </aside>

      {/* 2. Mobile Drawer */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm md:hidden flex">
          <div className="w-72 bg-slate-900 border-r border-slate-800 p-5 flex flex-col justify-between h-full">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
                    <Shield className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-white text-sm">TécnicaMZ Gestão</span>
                </div>
                <button onClick={() => setIsSidebarOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-1.5">
                {navItems.map(item => {
                  const isActive = activeTab === item.id;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setIsSidebarOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold ${
                        isActive
                          ? 'bg-blue-600 text-white font-bold'
                          : 'text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${item.badgeColor}`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            <button
              onClick={() => onNavigateTab('community')}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar ao Feed</span>
            </button>
          </div>
          <div className="flex-1" onClick={() => setIsSidebarOpen(false)} />
        </div>
      )}

      {/* 3. Main Dashboard Body */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-20 bg-slate-900/80 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700"
            >
              <Menu className="w-4 h-4" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-bold text-white">
                  {navItems.find(n => n.id === activeTab)?.label}
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                  ● Sistema Online
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Rota Secreta Protegida (/gestao-pro-mz)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition-colors"
              title="Recarregar Dados"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={() => onNavigateTab('community')}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/30"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Ver Site</span>
            </button>
          </div>
        </header>

        {/* Tab Content Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-20 md:pb-8">
          {activeTab === 'metrics' && (
            <AdminOverviewTab
              users={usersList}
              payments={payments}
              onSelectTab={setActiveTab}
            />
          )}

          {activeTab === 'approvals' && (
            <AdminApprovalsTab
              users={usersList}
              onApprove={approveUserAccount}
              onReject={rejectUserAccount}
              onGrant30Days={grantManualSubscription30Days}
            />
          )}

          {activeTab === 'users' && (
            <AdminUsersTab
              users={usersList}
              onGrant30Days={grantManualSubscription30Days}
              onToggleVerification={toggleUserVerification}
              onUpdateStatus={updateUserStatus}
              onDeleteUser={deleteUserAccount}
            />
          )}

          {activeTab === 'payments' && (
            <AdminPaymentsTab
              payments={payments}
              onApprovePayment={approvePayment}
              onRejectPayment={rejectPayment}
            />
          )}

          {activeTab === 'broadcast' && (
            <AdminBroadcastTab
              users={usersList}
              notifications={notifications}
              onSendNotification={sendAdminNotification}
            />
          )}

          {activeTab === 'settings' && (
            <AdminSettingsTab
              settings={settings}
              onUpdateSettings={updateSettings}
            />
          )}
        </main>
      </div>

      {/* 4. Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-2 py-1.5 flex items-center justify-around">
        {navItems.map(item => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center p-1.5 relative rounded-lg transition-colors ${
                isActive ? 'text-blue-400' : 'text-slate-400'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[9px] font-medium mt-0.5 tracking-tight truncate max-w-[55px]">
                {item.label.split(' ')[0]}
              </span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="absolute top-0 right-1 w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
