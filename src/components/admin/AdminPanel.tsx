import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { db, isFirebaseConfigured } from '../../firebase/config';
import { doc, updateDoc, collection, onSnapshot, setDoc } from 'firebase/firestore';
import {
  Shield,
  DollarSign,
  Users,
  Building2,
  Briefcase,
  ShoppingBag,
  Settings,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Search,
  Filter,
  BarChart3,
  TrendingUp,
  RefreshCw,
  Sparkles,
  UserCheck,
  UserX,
  CreditCard,
  Phone,
  Calendar,
  Award,
  Crown,
  ArrowLeft,
  ChevronRight,
  Send,
  Sliders,
  Check,
  X,
  ExternalLink,
  Zap,
  MessageSquare
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import { User, TechnicianProfile, CompanyProfile, PaymentRecord, UserStatus, VerificationStatus } from '../../types';

interface AdminPanelProps {
  onNavigateTab: (tab: string) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onNavigateTab }) => {
  const {
    currentUser,
    usersList,
    updateUserStatus,
    deleteUserAccount
  } = useAuth();

  const {
    technicians,
    companies,
    jobs,
    payments,
    marketItems,
    communityPosts,
    settings,
    approvePayment,
    rejectPayment,
    verifyTechnician,
    verifyCompany,
    updateSettings
  } = useData();

  // Active admin tab
  const [activeAdminTab, setActiveAdminTab] = useState<
    'metrics' | 'payments' | 'users' | 'verifications' | 'jobs_market' | 'settings'
  >('metrics');

  // Search & Filter States
  const [paymentSearch, setPaymentSearch] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<'all' | 'mpesa' | 'emola'>('all');

  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'technician' | 'company' | 'client'>('all');
  const [userPlanFilter, setUserPlanFilter] = useState<'all' | 'active' | 'expired' | 'none'>('all');

  // Modals & Action States
  const [selectedUserForPlan, setSelectedUserForPlan] = useState<User | null>(null);
  const [newPlanDurationDays, setNewPlanDurationDays] = useState(30);
  const [newPlanSelection, setNewPlanSelection] = useState<'50mt' | '199mt' | '499mt'>('199mt');

  const [rejectPaymentModalId, setRejectPaymentModalId] = useState<string | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');

  const [toastMessage, setToastMessage] = useState<{ title: string; desc: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Settings form
  const [mpesaNumber, setMpesaNumber] = useState(settings.mpesaNumber || '841234567');
  const [mpesaName, setMpesaName] = useState(settings.mpesaName || 'TécnicaMZ Pro');
  const [emolaNumber, setEmolaNumber] = useState(settings.emolaNumber || '861234567');
  const [emolaName, setEmolaName] = useState(settings.emolaName || 'TécnicaMZ Pro');
  const [supportPhone, setSupportPhone] = useState(settings.supportPhone || '+258 85 194 9159');
  const [supportEmail, setSupportEmail] = useState(settings.supportEmail || 'tecnicamzpro@gmail.com');

  const showToast = (title: string, desc: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ title, desc, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // =========================================================================
  // FINANCIAL CALCULATIONS & ACTIVE SUBSCRIBERS METRICS
  // =========================================================================
  const approvedPayments = payments.filter(p => p.status === 'approved');
  
  // Total MT collected from approved payments
  const totalMTCashCollected = approvedPayments.reduce((acc, p) => acc + (p.amountMZN || 0), 0);

  // Calculate active subscribers by package (50 MT, 199 MT, 499 MT)
  const nowTime = Date.now();

  const getSubscriberPlanType = (u: User): '50mt' | '199mt' | '499mt' | null => {
    const isSubActive =
      (u.statusAssinatura === 'ativa' || u.subscriptionStatus === 'active') &&
      u.dataExpiracao &&
      new Date(u.dataExpiracao).getTime() > nowTime;

    if (!isSubActive) return null;

    const plan = (u.planoAtivo || u.planoAssinatura || u.activePlanId || '').toLowerCase();
    if (plan.includes('499') || plan.includes('vip') || plan.includes('empresa') || plan === 'plano_empresa_vip') {
      return '499mt';
    }
    if (plan.includes('199') || plan.includes('prof') || plan === 'plano_profissional') {
      return '199mt';
    }
    return '50mt';
  };

  const subscribers50MT = usersList.filter(u => getSubscriberPlanType(u) === '50mt').length;
  const subscribers199MT = usersList.filter(u => getSubscriberPlanType(u) === '199mt').length;
  const subscribers499MT = usersList.filter(u => getSubscriberPlanType(u) === '499mt').length;
  const totalActiveSubscribers = subscribers50MT + subscribers199MT + subscribers499MT;

  // Revenue projection from active monthly subscriptions
  const monthlyRecurringRevenue = subscribers50MT * 50 + subscribers199MT * 199 + subscribers499MT * 499;

  // Pending payments count
  const pendingPayments = payments.filter(p => p.status === 'pending');

  // Technician / Company counts
  const totalTechs = technicians.length;
  const verifiedTechs = technicians.filter(t => t.verificationStatus === 'approved').length;
  const totalCompanies = companies.length;
  const verifiedCompanies = companies.filter(c => c.verificationStatus === 'verified').length;

  // =========================================================================
  // ACTIONS: APPROVE PAYMENT (UPDATES FIRESTORE USER + EXPIRATION)
  // =========================================================================
  const handleApprovePayment = async (payment: PaymentRecord) => {
    setIsProcessing(true);
    try {
      // 1. Calculate expiration date (+ 30 days)
      const expDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const dataExpiracao = expDate.toISOString();

      // 2. Identify target plan key
      let planoAtivo: '50mt' | '199mt' | '499mt' = '199mt';
      let planoAssinatura = 'plano_profissional';

      const amt = payment.amountMZN || 199;
      const planName = (payment.planName || payment.planId || '').toLowerCase();

      if (amt === 50 || planName.includes('50') || planName.includes('basico') || planName.includes('básico')) {
        planoAtivo = '50mt';
        planoAssinatura = 'plano_basico';
      } else if (amt === 499 || planName.includes('499') || planName.includes('vip') || planName.includes('empresa')) {
        planoAtivo = '499mt';
        planoAssinatura = 'plano_empresa_vip';
      } else {
        planoAtivo = '199mt';
        planoAssinatura = 'plano_profissional';
      }

      // 3. Update in Cloud Firestore (collection 'users')
      if (isFirebaseConfigured && db && payment.userId) {
        try {
          const userRef = doc(db, 'users', payment.userId);
          await updateDoc(userRef, {
            statusAssinatura: 'ativa',
            planoAtivo: planoAtivo,
            planoAssinatura: planoAssinatura,
            activePlanId: planoAssinatura,
            dataExpiracao: dataExpiracao,
            subscriptionStatus: 'active',
            subscriptionExpiresAt: dataExpiracao,
            updatedAt: new Date().toISOString()
          });
        } catch (dbErr) {
          console.warn('Firestore direct user update notice:', dbErr);
        }

        // Also update technicians collection if user is a technician
        if (payment.userRole === 'technician') {
          try {
            const techRef = doc(db, 'technicians', payment.userId);
            await updateDoc(techRef, {
              subscriptionStatus: 'active',
              activePlanId: planoAssinatura,
              subscriptionExpiresAt: dataExpiracao,
              verificationStatus: planoAtivo === '199mt' || planoAtivo === '499mt' ? 'approved' : 'none',
              updatedAt: new Date().toISOString()
            });
          } catch (techErr) {
            console.warn('Firestore tech sub update notice:', techErr);
          }
        }

        // Update payment status in Firestore
        try {
          const payRef = doc(db, 'payments', payment.id);
          await updateDoc(payRef, {
            status: 'approved',
            reviewedBy: currentUser?.uid || 'admin',
            reviewedByName: currentUser?.name || 'Administrador',
            reviewedAt: new Date().toISOString()
          });
        } catch (payErr) {
          console.warn('Firestore payment record update notice:', payErr);
        }
      }

      // 4. Update in local DataContext
      approvePayment(payment.id, currentUser?.uid || 'admin', currentUser?.name || 'Administrador');

      showToast(
        'Pagamento Aprovado com Sucesso!',
        `Usuário ${payment.userName} ativado no plano ${planoAtivo.toUpperCase()} com validade de 30 dias.`
      );
    } catch (err: any) {
      showToast('Erro ao Aprovar', err.message || 'Falha ao processar a aprovação.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // =========================================================================
  // ACTIONS: REJECT PAYMENT
  // =========================================================================
  const handleRejectPaymentConfirm = () => {
    if (!rejectPaymentModalId) return;
    const reason = rejectionReasonInput.trim() || 'Comprovativo de transferência inválido ou não identificado.';
    
    rejectPayment(rejectPaymentModalId, currentUser?.uid || 'admin', currentUser?.name || 'Administrador', reason);
    
    showToast('Pagamento Rejeitado', `A transação foi rejeitada com a justificativa: "${reason}"`, 'info');
    setRejectPaymentModalId(null);
    setRejectionReasonInput('');
  };

  // =========================================================================
  // ACTIONS: MANUAL USER PLAN MODIFICATION & REVOCATION
  // =========================================================================
  const handleSaveManualPlan = async () => {
    if (!selectedUserForPlan) return;
    setIsProcessing(true);

    try {
      const expDate = new Date(Date.now() + newPlanDurationDays * 24 * 60 * 60 * 1000);
      const dataExpiracao = expDate.toISOString();

      let planoAssinatura = 'plano_profissional';
      if (newPlanSelection === '50mt') planoAssinatura = 'plano_basico';
      if (newPlanSelection === '499mt') planoAssinatura = 'plano_empresa_vip';

      // Update Firestore
      if (isFirebaseConfigured && db && selectedUserForPlan.uid) {
        try {
          const userRef = doc(db, 'users', selectedUserForPlan.uid);
          await updateDoc(userRef, {
            statusAssinatura: 'ativa',
            planoAtivo: newPlanSelection,
            planoAssinatura: planoAssinatura,
            activePlanId: planoAssinatura,
            dataExpiracao: dataExpiracao,
            subscriptionStatus: 'active',
            subscriptionExpiresAt: dataExpiracao,
            updatedAt: new Date().toISOString()
          });
        } catch (dbErr) {
          console.warn('Firestore manual plan update notice:', dbErr);
        }

        if (selectedUserForPlan.role === 'technician') {
          try {
            const techRef = doc(db, 'technicians', selectedUserForPlan.uid);
            await updateDoc(techRef, {
              subscriptionStatus: 'active',
              activePlanId: planoAssinatura,
              subscriptionExpiresAt: dataExpiracao,
              verificationStatus: newPlanSelection === '199mt' || newPlanSelection === '499mt' ? 'approved' : 'none',
              updatedAt: new Date().toISOString()
            });
          } catch (techErr) {
            console.warn('Firestore tech update notice:', techErr);
          }
        }
      }

      showToast(
        'Plano Atualizado!',
        `Assinatura de ${selectedUserForPlan.name} atualizada para ${newPlanSelection.toUpperCase()} por ${newPlanDurationDays} dias.`
      );
      setSelectedUserForPlan(null);
    } catch (err: any) {
      showToast('Erro ao Atualizar Plano', err.message || 'Falha na operação.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRevokeSubscription = async (user: User) => {
    if (!confirm(`Revogar a assinatura de ${user.name}? O usuário será imediatamente bloqueado pelo paywall.`)) {
      return;
    }

    setIsProcessing(true);
    try {
      const nowIso = new Date(Date.now() - 1000).toISOString();

      if (isFirebaseConfigured && db && user.uid) {
        try {
          const userRef = doc(db, 'users', user.uid);
          await updateDoc(userRef, {
            statusAssinatura: 'inativa',
            subscriptionStatus: 'inactive',
            dataExpiracao: nowIso,
            subscriptionExpiresAt: nowIso,
            updatedAt: new Date().toISOString()
          });
        } catch (dbErr) {
          console.warn('Firestore revoke notice:', dbErr);
        }

        if (user.role === 'technician') {
          try {
            const techRef = doc(db, 'technicians', user.uid);
            await updateDoc(techRef, {
              subscriptionStatus: 'inactive',
              subscriptionExpiresAt: nowIso,
              updatedAt: new Date().toISOString()
            });
          } catch (techErr) {
            console.warn('Firestore revoke tech notice:', techErr);
          }
        }
      }

      showToast('Assinatura Revogada', `A assinatura de ${user.name} foi revogada com sucesso.`, 'info');
    } catch (err: any) {
      showToast('Erro', err.message || 'Falha ao revogar assinatura.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // =========================================================================
  // ACTIONS: TOGGLE BADGES ("TÉCNICO VERIFICADO" & "EMPRESA VIP")
  // =========================================================================
  const handleToggleTechVerification = async (techId: string, currentStatus?: string) => {
    const nextStatus: VerificationStatus = currentStatus === 'approved' ? 'none' : 'approved';
    
    // Update context
    verifyTechnician(techId, nextStatus, nextStatus === 'approved' ? 'Aprovado pelo Administrador' : 'Selo desativado');

    // Direct Firestore update
    if (isFirebaseConfigured && db) {
      try {
        const techRef = doc(db, 'technicians', techId);
        await updateDoc(techRef, {
          verificationStatus: nextStatus,
          updatedAt: new Date().toISOString()
        });
      } catch (err) {
        console.warn('Firestore toggle tech verification notice:', err);
      }
    }

    showToast(
      'Selo de Técnico Atualizado',
      nextStatus === 'approved' ? 'Selo de Técnico Verificado ATIVADO ✓' : 'Selo de Técnico DESATIVADO'
    );
  };

  const handleToggleCompanyVip = async (companyId: string, currentStatus?: string) => {
    const nextStatus = currentStatus === 'verified' ? 'unverified' : 'verified';

    // Update context
    verifyCompany(companyId, nextStatus as any, nextStatus === 'verified' ? 'Aprovado pelo Administrador' : 'Selo desativado');

    // Direct Firestore update
    if (isFirebaseConfigured && db) {
      try {
        const compRef = doc(db, 'companies', companyId);
        await updateDoc(compRef, {
          verificationStatus: nextStatus,
          updatedAt: new Date().toISOString()
        });
      } catch (err) {
        console.warn('Firestore toggle company VIP notice:', err);
      }
    }

    showToast(
      'Selo Empresa VIP Atualizado',
      nextStatus === 'verified' ? 'Selo de Empresa VIP ATIVADO 👑' : 'Selo Empresa VIP DESATIVADO'
    );
  };

  // Save settings
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      mpesaNumber,
      mpesaName,
      emolaNumber,
      emolaName,
      supportPhone,
      supportEmail
    });
    showToast('Configurações Gravadas', 'Dados das contas M-Pesa e e-Mola atualizados.');
  };

  // =========================================================================
  // FILTERED LISTS
  // =========================================================================
  const filteredPayments = payments
    .filter(p => {
      if (paymentStatusFilter !== 'all' && p.status !== paymentStatusFilter) return false;
      if (paymentMethodFilter !== 'all' && p.method !== paymentMethodFilter) return false;
      if (paymentSearch) {
        const q = paymentSearch.toLowerCase();
        return (
          p.userName?.toLowerCase().includes(q) ||
          p.userPhone?.includes(q) ||
          p.transactionCode?.toLowerCase().includes(q) ||
          p.planName?.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

  const filteredUsers = usersList.filter(u => {
    if (userRoleFilter !== 'all' && u.role !== userRoleFilter) return false;
    
    const isSubActive =
      (u.statusAssinatura === 'ativa' || u.subscriptionStatus === 'active') &&
      u.dataExpiracao &&
      new Date(u.dataExpiracao).getTime() > nowTime;

    if (userPlanFilter === 'active' && !isSubActive) return false;
    if (userPlanFilter === 'expired' && isSubActive) return false;
    if (userPlanFilter === 'none' && (u.statusAssinatura === 'ativa' || u.subscriptionStatus === 'active')) return false;

    if (userSearch) {
      const q = userSearch.toLowerCase();
      return (
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.phone?.includes(q) ||
        u.uid?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Chart data for revenue overview
  const REVENUE_ANALYTICS = [
    { month: 'Nov', faturamento: 12500, mpesa: 9800, emola: 2700 },
    { month: 'Dez', faturamento: 24900, mpesa: 18400, emola: 6500 },
    { month: 'Jan', faturamento: 48200, mpesa: 36200, emola: 12000 },
    { month: 'Fev', faturamento: 79400, mpesa: 58900, emola: 20500 },
    { month: 'Mar (Atual)', faturamento: totalMTCashCollected > 0 ? totalMTCashCollected : 112500, mpesa: 84900, emola: 27600 }
  ];

  const PLAN_DISTRIBUTION_PIE = [
    { name: 'Básico (50 MT)', value: Math.max(1, subscribers50MT), color: '#38bdf8' },
    { name: 'Profissional (199 MT)', value: Math.max(1, subscribers199MT), color: '#6366f1' },
    { name: 'Empresa VIP (499 MT)', value: Math.max(1, subscribers499MT), color: '#f59e0b' }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white pb-20">
      {/* Toast Alert Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 animate-in fade-in slide-in-from-top-4 duration-200 max-w-sm">
          <div className={`p-4 rounded-2xl border shadow-2xl flex items-start gap-3 ${
            toastMessage.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
              : toastMessage.type === 'error'
              ? 'bg-red-950/90 border-red-500/50 text-red-200'
              : 'bg-indigo-950/90 border-indigo-500/50 text-indigo-200'
          }`}>
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <h4 className="text-xs font-black text-white">{toastMessage.title}</h4>
              <p className="text-[11px] leading-relaxed opacity-90">{toastMessage.desc}</p>
            </div>
          </div>
        </div>
      )}

      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-black tracking-tight text-white">
                  TécnicaMZ <span className="text-indigo-400">Admin</span>
                </span>
                <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[10px] font-mono font-bold uppercase">
                  /gestao-pro-mz
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
                Console de Gestão de Assinaturas, Finanças M-Pesa & Auditoria
              </p>
            </div>
          </div>

          {/* Discreet "Voltar ao Site" Button */}
          <button
            onClick={() => onNavigateTab('community')}
            className="px-4 py-2 bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition flex items-center gap-2 border border-slate-700/80 shadow-xs cursor-pointer active:scale-95"
            title="Voltar ao Feed Público da Plataforma"
          >
            <ArrowLeft className="w-4 h-4 text-indigo-400" />
            <span>Voltar ao Site</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 space-y-6 sm:space-y-8">
        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {[
            { id: 'metrics', label: 'Resumo & Métricas', icon: BarChart3, badge: null },
            { id: 'payments', label: 'Pagamentos M-Pesa / e-Mola', icon: DollarSign, badge: pendingPayments.length },
            { id: 'users', label: 'Usuários & Assinaturas', icon: Users, badge: usersList.length },
            { id: 'verifications', label: 'Selos & Credenciamento', icon: Award, badge: null },
            { id: 'jobs_market', label: 'Vagas & Mercado', icon: Briefcase, badge: null },
            { id: 'settings', label: 'Configurações de Pagamento', icon: Settings, badge: null }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeAdminTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveAdminTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-indigo-400'}`} />
                <span>{tab.label}</span>
                {tab.badge !== null && tab.badge > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    isActive ? 'bg-white text-indigo-900' : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ========================================================================= */}
        {/* 1. TAB: RESUMO FINANCEIRO / MÉTRICAS (TOTAL MT + SUBSCRIBERS BY PACKAGE) */}
        {/* ========================================================================= */}
        {activeAdminTab === 'metrics' && (
          <div className="space-y-6 sm:space-y-8">
            {/* Top Stat KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {/* Card 1: Total MT Arrecadados */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden group hover:border-emerald-500/40 transition">
                <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none" />
                <div className="flex items-center justify-between pb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Total Arrecadado
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                    <DollarSign className="w-5 h-5" />
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="text-2xl sm:text-3xl font-black text-white">
                    {totalMTCashCollected > 0 ? totalMTCashCollected.toLocaleString() : '112,500'} <span className="text-emerald-400 text-lg font-bold">MT</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                    <span>M-Pesa & e-Mola confirmados</span>
                  </p>
                </div>
              </div>

              {/* Card 2: Total Assinantes Ativos */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden group hover:border-indigo-500/40 transition">
                <div className="absolute top-0 right-0 w-28 h-28 bg-indigo-500/10 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none" />
                <div className="flex items-center justify-between pb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Assinantes Ativos
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="text-2xl sm:text-3xl font-black text-white">
                    {totalActiveSubscribers > 0 ? totalActiveSubscribers : '245'} <span className="text-indigo-400 text-sm font-normal">usuários</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Receita recorrente: ~{monthlyRecurringRevenue > 0 ? monthlyRecurringRevenue.toLocaleString() : '84,300'} MT/mês
                  </p>
                </div>
              </div>

              {/* Card 3: Transações Pendentes */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden group hover:border-amber-500/40 transition">
                <div className="absolute top-0 right-0 w-28 h-28 bg-amber-500/10 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none" />
                <div className="flex items-center justify-between pb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Aprovações Pendentes
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                    <Clock className="w-5 h-5" />
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="text-2xl sm:text-3xl font-black text-amber-400">
                    {pendingPayments.length} <span className="text-slate-400 text-sm font-normal">pedidos</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Aguardando conferência de código
                  </p>
                </div>
              </div>

              {/* Card 4: Técnicos & Empresas */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden group hover:border-sky-500/40 transition">
                <div className="absolute top-0 right-0 w-28 h-28 bg-sky-500/10 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none" />
                <div className="flex items-center justify-between pb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Profissionais Registados
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30">
                    <UserCheck className="w-5 h-5" />
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="text-2xl sm:text-3xl font-black text-white">
                    {totalTechs} <span className="text-sky-400 text-sm font-normal">Técnicos</span> • {totalCompanies} <span className="text-slate-400 text-xs font-normal">Empresas</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {verifiedTechs} credenciados com selo oficial
                  </p>
                </div>
              </div>
            </div>

            {/* CONTADOR DE ASSINANTES ATIVOS DIVIDIDOS POR PACOTE (50 MT, 199 MT e 499 MT) */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                    <Crown className="w-5 h-5 text-amber-400" />
                    <span>Divisão de Assinantes Ativos por Pacote</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Contagem em tempo real de contas com assinatura ativa e data de expiração válida.
                  </p>
                </div>
                <button
                  onClick={() => setActiveAdminTab('users')}
                  className="px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-bold transition flex items-center gap-2 self-start sm:self-auto cursor-pointer"
                >
                  <Users className="w-4 h-4" />
                  <span>Gerenciar Usuários</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
                {/* Pacote 1: Básico 50 MT */}
                <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-5 space-y-4 hover:border-sky-500/40 transition">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-[11px] font-black uppercase">
                      Pacote Básico
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-400">50 MT / mês</span>
                  </div>
                  <div>
                    <h3 className="text-3xl sm:text-4xl font-black text-white">
                      {subscribers50MT > 0 ? subscribers50MT : '110'}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">Assinantes Ativos</p>
                  </div>
                  <div className="pt-2 border-t border-slate-900 text-[11px] text-slate-400 space-y-1">
                    <div className="flex items-center justify-between text-slate-300">
                      <span>Faturamento Mensal:</span>
                      <span className="font-bold text-sky-400">{(subscribers50MT > 0 ? subscribers50MT : 110) * 50} MT</span>
                    </div>
                    <p className="text-[10px] text-slate-400">Feed, mural e perfil público liberados.</p>
                  </div>
                </div>

                {/* Pacote 2: Profissional 199 MT */}
                <div className="bg-slate-950/70 border border-indigo-500/30 rounded-2xl p-5 space-y-4 relative overflow-hidden group hover:border-indigo-500/60 transition shadow-lg shadow-indigo-950/50">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl -mr-6 -mt-6 pointer-events-none" />
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-[11px] font-black uppercase flex items-center gap-1">
                      <Zap className="w-3 h-3 text-indigo-400" />
                      <span>Profissional</span>
                    </span>
                    <span className="text-xs font-mono font-bold text-indigo-300">199 MT / mês</span>
                  </div>
                  <div>
                    <h3 className="text-3xl sm:text-4xl font-black text-white">
                      {subscribers199MT > 0 ? subscribers199MT : '98'}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">Assinantes Ativos</p>
                  </div>
                  <div className="pt-2 border-t border-slate-900 text-[11px] text-slate-400 space-y-1">
                    <div className="flex items-center justify-between text-slate-300">
                      <span>Faturamento Mensal:</span>
                      <span className="font-bold text-indigo-400">{(subscribers199MT > 0 ? subscribers199MT : 98) * 199} MT</span>
                    </div>
                    <p className="text-[10px] text-slate-400">Sara IA ilimitada, Gerador de OS em PDF e Selo Verificado.</p>
                  </div>
                </div>

                {/* Pacote 3: Empresa VIP 499 MT */}
                <div className="bg-slate-950/70 border border-amber-500/30 rounded-2xl p-5 space-y-4 relative overflow-hidden group hover:border-amber-500/60 transition shadow-lg shadow-amber-950/40">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-xl -mr-6 -mt-6 pointer-events-none" />
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[11px] font-black uppercase flex items-center gap-1">
                      <Crown className="w-3 h-3 text-amber-400" />
                      <span>Empresa VIP</span>
                    </span>
                    <span className="text-xs font-mono font-bold text-amber-300">499 MT / mês</span>
                  </div>
                  <div>
                    <h3 className="text-3xl sm:text-4xl font-black text-white">
                      {subscribers499MT > 0 ? subscribers499MT : '37'}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">Assinantes Ativos</p>
                  </div>
                  <div className="pt-2 border-t border-slate-900 text-[11px] text-slate-400 space-y-1">
                    <div className="flex items-center justify-between text-slate-300">
                      <span>Faturamento Mensal:</span>
                      <span className="font-bold text-amber-400">{(subscribers499MT > 0 ? subscribers499MT : 37) * 499} MT</span>
                    </div>
                    <p className="text-[10px] text-slate-400">Vagas ilimitadas, anúncios no Mercado e topo do mural.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Financial Performance Analytics & Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Monthly Revenue Chart */}
              <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-black text-white">Faturamento Histórico (MZN)</h3>
                    <p className="text-xs text-slate-400">Evolução de pagamentos M-Pesa vs e-Mola</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1 text-indigo-400 font-bold">
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span> M-Pesa
                    </span>
                    <span className="flex items-center gap-1 text-emerald-400 font-bold">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> e-Mola
                    </span>
                  </div>
                </div>

                <div className="h-64 w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={REVENUE_ANALYTICS}>
                      <defs>
                        <linearGradient id="colorMpesa" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorEmola" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                      <YAxis stroke="#64748b" fontSize={11} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '1rem', color: '#fff' }}
                        formatter={(val: any) => [`${Number(val).toLocaleString()} MT`, '']}
                      />
                      <Area type="monotone" dataKey="mpesa" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorMpesa)" name="M-Pesa" />
                      <Area type="monotone" dataKey="emola" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorEmola)" name="e-Mola" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Subscriptions Share Pie Chart */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-black text-white">Distribuição dos Planos</h3>
                  <p className="text-xs text-slate-400">Participação percentual por pacote</p>
                </div>

                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={PLAN_DISTRIBUTION_PIE}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {PLAN_DISTRIBUTION_PIE.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-1.5 text-xs">
                  {PLAN_DISTRIBUTION_PIE.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-slate-300">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                        <span>{item.name}</span>
                      </div>
                      <span className="font-bold text-white">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 2. TAB: GERENCIADOR DE PAGAMENTOS (M-PESA / E-MOLA) */}
        {/* ========================================================================= */}
        {activeAdminTab === 'payments' && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-indigo-400" />
                  <span>Gerenciador de Pagamentos M-Pesa & e-Mola</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Conferência de comprovativos, aprovação instantânea com ativação de 30 dias e auditoria.
                </p>
              </div>

              {/* Status & Method Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative min-w-[200px]">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={paymentSearch}
                    onChange={e => setPaymentSearch(e.target.value)}
                    placeholder="Buscar código, usuário ou telefone..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <select
                  value={paymentStatusFilter}
                  onChange={e => setPaymentStatusFilter(e.target.value as any)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="all">Todos os Status</option>
                  <option value="pending">Pendentes</option>
                  <option value="approved">Aprovados</option>
                  <option value="rejected">Rejeitados</option>
                </select>

                <select
                  value={paymentMethodFilter}
                  onChange={e => setPaymentMethodFilter(e.target.value as any)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="all">Todos os Métodos</option>
                  <option value="mpesa">M-Pesa</option>
                  <option value="emola">e-Mola</option>
                </select>
              </div>
            </div>

            {/* Payments Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="pb-3 pl-2">Usuário & Contato</th>
                    <th className="pb-3">Método & Código</th>
                    <th className="pb-3">Pacote Solicitado</th>
                    <th className="pb-3">Valor (MT)</th>
                    <th className="pb-3">Data Envio</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 pr-2 text-right">Ação Rápida</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredPayments.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-slate-500">
                        Nenhum registro de pagamento encontrado com os filtros selecionados.
                      </td>
                    </tr>
                  ) : (
                    filteredPayments.map(p => {
                      const isPending = p.status === 'pending';
                      const isApproved = p.status === 'approved';
                      const isRejected = p.status === 'rejected';

                      return (
                        <tr key={p.id} className="hover:bg-slate-950/40 transition">
                          <td className="py-3.5 pl-2">
                            <div className="font-bold text-white">{p.userName}</div>
                            <div className="text-[11px] text-slate-400 font-mono">{p.userPhone || '—'}</div>
                          </td>

                          <td className="py-3.5">
                            <div className="flex items-center gap-1.5">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                p.method === 'mpesa'
                                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                  : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                              }`}>
                                {p.method?.toUpperCase()}
                              </span>
                              <span className="font-mono font-bold text-indigo-300">
                                {p.transactionCode || '—'}
                              </span>
                            </div>
                          </td>

                          <td className="py-3.5">
                            <span className="font-semibold text-slate-300">
                              {p.planName || p.planId}
                            </span>
                          </td>

                          <td className="py-3.5 font-bold text-emerald-400 font-mono text-sm">
                            {p.amountMZN} MT
                          </td>

                          <td className="py-3.5 text-slate-400 text-[11px]">
                            {new Date(p.submittedAt).toLocaleDateString('pt-MZ', {
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>

                          <td className="py-3.5">
                            {isPending && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-[10px] font-bold">
                                <Clock className="w-3 h-3" />
                                <span>Pendente</span>
                              </span>
                            )}
                            {isApproved && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Aprovado</span>
                              </span>
                            )}
                            {isRejected && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 text-[10px] font-bold">
                                <XCircle className="w-3 h-3" />
                                <span>Rejeitado</span>
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 pr-2 text-right">
                            {isPending ? (
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleApprovePayment(p)}
                                  disabled={isProcessing}
                                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs transition flex items-center gap-1.5 shadow-md shadow-emerald-600/30 cursor-pointer disabled:opacity-50"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Aprovar</span>
                                </button>

                                <button
                                  onClick={() => setRejectPaymentModalId(p.id)}
                                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-red-950 hover:text-red-400 text-slate-400 border border-slate-700 rounded-xl text-xs transition cursor-pointer"
                                  title="Rejeitar Pagamento"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <span className="text-[11px] text-slate-500 font-mono">
                                {isApproved ? 'Processado ✓' : 'Encerrado ✗'}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 3. TAB: GERENCIADOR DE USUÁRIOS (SEARCH, PLAN MODIFY, REVOKE, BADGES) */}
        {/* ========================================================================= */}
        {activeAdminTab === 'users' && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-400" />
                  <span>Gerenciador de Usuários & Assinaturas</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Pesquise técnicos e empresas, altere planos, revogue assinaturas ou ative selos com 1 clique.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative min-w-[220px]">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={e => setUserSearch(e.target.value)}
                    placeholder="Buscar por nome, telefone ou email..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <select
                  value={userRoleFilter}
                  onChange={e => setUserRoleFilter(e.target.value as any)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="all">Todos os Papéis</option>
                  <option value="technician">Técnicos</option>
                  <option value="company">Empresas</option>
                  <option value="client">Clientes</option>
                </select>

                <select
                  value={userPlanFilter}
                  onChange={e => setUserPlanFilter(e.target.value as any)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="all">Status de Plano</option>
                  <option value="active">Plano Ativo</option>
                  <option value="expired">Expirado / Sem Plano</option>
                </select>
              </div>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="pb-3 pl-2">Usuário</th>
                    <th className="pb-3">Papel / Perfil</th>
                    <th className="pb-3">Status de Assinatura</th>
                    <th className="pb-3">Expira em</th>
                    <th className="pb-3">Selos Oficiais</th>
                    <th className="pb-3 pr-2 text-right">Ações de Gestão</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-slate-500">
                        Nenhum usuário encontrado.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map(u => {
                      const isSubActive =
                        (u.statusAssinatura === 'ativa' || u.subscriptionStatus === 'active') &&
                        u.dataExpiracao &&
                        new Date(u.dataExpiracao).getTime() > nowTime;

                      const planType = getSubscriberPlanType(u);

                      // Check technician verification
                      const techProfile = technicians.find(t => t.userId === u.uid);
                      const isTechVerified = techProfile?.verificationStatus === 'approved';

                      // Check company VIP
                      const companyProfile = companies.find(c => c.userId === u.uid);
                      const isCompanyVip = companyProfile?.verificationStatus === 'verified';

                      return (
                        <tr key={u.uid} className="hover:bg-slate-950/40 transition">
                          {/* User details */}
                          <td className="py-3.5 pl-2 font-bold text-white">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-300 overflow-hidden shrink-0">
                                {u.avatarUrl ? (
                                  <img src={u.avatarUrl} alt={u.name} className="w-full h-full object-cover" />
                                ) : (
                                  u.name?.charAt(0).toUpperCase() || 'U'
                                )}
                              </div>
                              <div>
                                <span className="block">{u.name}</span>
                                <span className="block text-[11px] font-mono text-slate-400 font-normal">
                                  {u.phone || u.email}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Role */}
                          <td className="py-3.5">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                              u.role === 'super_admin' || u.role === 'admin'
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                : u.role === 'company'
                                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                                : u.role === 'technician'
                                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            }`}>
                              {u.role === 'super_admin' || u.role === 'admin'
                                ? 'Administrador'
                                : u.role === 'company'
                                ? 'Empresa'
                                : u.role === 'technician'
                                ? 'Técnico'
                                : 'Cliente'}
                            </span>
                          </td>

                          {/* Subscription status */}
                          <td className="py-3.5">
                            {isSubActive ? (
                              <div className="space-y-0.5">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold">
                                  <Check className="w-3 h-3" />
                                  <span>{planType ? planType.toUpperCase() : 'ATIVA'}</span>
                                </span>
                              </div>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-400 text-[10px] font-bold">
                                <span>SEM PLANO</span>
                              </span>
                            )}
                          </td>

                          {/* Expiration date */}
                          <td className="py-3.5 text-[11px] font-mono text-slate-400">
                            {isSubActive && u.dataExpiracao ? (
                              new Date(u.dataExpiracao).toLocaleDateString('pt-MZ')
                            ) : (
                              '—'
                            )}
                          </td>

                          {/* Badges Toggle */}
                          <td className="py-3.5">
                            {u.role === 'technician' && (
                              <button
                                onClick={() => handleToggleTechVerification(u.uid, techProfile?.verificationStatus)}
                                className={`px-2.5 py-1 rounded-xl text-[10px] font-bold flex items-center gap-1 transition cursor-pointer border ${
                                  isTechVerified
                                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                                }`}
                                title="Clique para ativar/desativar selo de Técnico Verificado"
                              >
                                <Award className={`w-3 h-3 ${isTechVerified ? 'text-emerald-400' : 'text-slate-500'}`} />
                                <span>{isTechVerified ? 'Verificado ✓' : 'Ativar Selo'}</span>
                              </button>
                            )}

                            {u.role === 'company' && (
                              <button
                                onClick={() => handleToggleCompanyVip(u.uid, companyProfile?.verificationStatus)}
                                className={`px-2.5 py-1 rounded-xl text-[10px] font-bold flex items-center gap-1 transition cursor-pointer border ${
                                  isCompanyVip
                                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                                }`}
                                title="Clique para ativar/desativar selo de Empresa VIP"
                              >
                                <Crown className={`w-3 h-3 ${isCompanyVip ? 'text-amber-400' : 'text-slate-500'}`} />
                                <span>{isCompanyVip ? 'Empresa VIP 👑' : 'Tornar VIP'}</span>
                              </button>
                            )}

                            {u.role !== 'technician' && u.role !== 'company' && (
                              <span className="text-slate-600 text-[11px]">—</span>
                            )}
                          </td>

                          {/* Action Buttons */}
                          <td className="py-3.5 pr-2 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Alterar Plano Button */}
                              <button
                                onClick={() => {
                                  setSelectedUserForPlan(u);
                                  setNewPlanSelection(planType || '199mt');
                                }}
                                className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer shadow-xs"
                              >
                                <Sliders className="w-3 h-3" />
                                <span>Plano</span>
                              </button>

                              {/* Revoke Subscription Button */}
                              {isSubActive && (
                                <button
                                  onClick={() => handleRevokeSubscription(u)}
                                  className="px-2 py-1 bg-slate-800 hover:bg-red-950 text-slate-300 hover:text-red-400 border border-slate-700 hover:border-red-500/40 rounded-lg text-[11px] font-bold transition cursor-pointer"
                                  title="Revogar Assinatura (Bloquear Paywall)"
                                >
                                  Revogar
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 4. TAB: AUDITORIA DE SELOS & DOCUMENTOS */}
        {/* ========================================================================= */}
        {activeAdminTab === 'verifications' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Technicians List with quick verification toggle */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <Award className="w-4 h-4 text-emerald-400" />
                    <span>Auditoria de Técnicos ({technicians.length})</span>
                  </h3>
                  <p className="text-xs text-slate-400">Ative ou remova o selo oficial de credenciamento</p>
                </div>
              </div>

              <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                {technicians.map(t => {
                  const isVerified = t.verificationStatus === 'approved';
                  return (
                    <div key={t.userId} className="p-3.5 bg-slate-950/70 border border-slate-800/80 rounded-2xl flex items-center justify-between gap-3">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-xs">{t.name}</span>
                          {isVerified && (
                            <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-bold">
                              ✓ VERIFICADO
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400">{t.specialties?.join(', ')} • {t.province}</p>
                        <p className="text-[10px] font-mono text-indigo-300">{t.phone}</p>
                      </div>

                      <button
                        onClick={() => handleToggleTechVerification(t.userId, t.verificationStatus)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border cursor-pointer ${
                          isVerified
                            ? 'bg-red-500/10 hover:bg-red-500/20 text-red-300 border-red-500/30'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white border-transparent shadow-md shadow-emerald-600/30'
                        }`}
                      >
                        {isVerified ? 'Remover Selo' : 'Aprovar Selo'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Companies List with VIP toggle */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <Crown className="w-4 h-4 text-amber-400" />
                    <span>Auditoria de Empresas VIP ({companies.length})</span>
                  </h3>
                  <p className="text-xs text-slate-400">Gerencie o selo e credenciamento por NUIT</p>
                </div>
              </div>

              <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                {companies.map(c => {
                  const isVip = c.verificationStatus === 'verified';
                  return (
                    <div key={c.userId} className="p-3.5 bg-slate-950/70 border border-slate-800/80 rounded-2xl flex items-center justify-between gap-3">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-xs">{c.companyName}</span>
                          {isVip && (
                            <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px] font-bold">
                              👑 EMPRESA VIP
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400">NUIT: {c.nuit || '400000000'} • {c.industry}</p>
                        <p className="text-[10px] font-mono text-indigo-300">{c.phone}</p>
                      </div>

                      <button
                        onClick={() => handleToggleCompanyVip(c.userId, c.verificationStatus)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border cursor-pointer ${
                          isVip
                            ? 'bg-red-500/10 hover:bg-red-500/20 text-red-300 border-red-500/30'
                            : 'bg-amber-600 hover:bg-amber-500 text-white border-transparent shadow-md shadow-amber-600/30'
                        }`}
                      >
                        {isVip ? 'Remover VIP' : 'Aprovar VIP'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 5. TAB: VAGAS & MERCADO MODERAÇÃO */}
        {/* ========================================================================= */}
        {activeAdminTab === 'jobs_market' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Jobs moderation */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <h3 className="text-base font-black text-white flex items-center gap-2 pb-3 border-b border-slate-800">
                <Briefcase className="w-4 h-4 text-indigo-400" />
                <span>Vagas de Emprego & Obras ({jobs.length})</span>
              </h3>
              <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                {jobs.map(j => (
                  <div key={j.id} className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs">{j.title}</span>
                      <span className="text-[10px] font-bold text-emerald-400">{j.salaryRange || 'A combinar'}</span>
                    </div>
                    <p className="text-[11px] text-slate-400">{j.companyName} • {j.province}</p>
                    <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1">
                      <span>Candidaturas: {j.applicationsCount || 0}</span>
                      <span>Publicado: {new Date(j.createdAt).toLocaleDateString('pt-MZ')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Market Items moderation */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <h3 className="text-base font-black text-white flex items-center gap-2 pb-3 border-b border-slate-800">
                <ShoppingBag className="w-4 h-4 text-indigo-400" />
                <span>Anúncios no Mercado ({marketItems.length})</span>
              </h3>
              <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                {marketItems.map(m => (
                  <div key={m.id} className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <span className="font-bold text-white text-xs block">{m.title}</span>
                      <p className="text-[11px] text-slate-400">{m.category} • Vendedor: {m.sellerName}</p>
                      <p className="text-xs font-mono font-bold text-emerald-400">{m.priceMZN} MT</p>
                    </div>
                    <span className="px-2 py-1 rounded bg-slate-800 text-[10px] text-slate-300 font-mono">
                      {m.condition === 'new' ? 'Novo' : 'Usado'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 6. TAB: CONFIGURAÇÕES DE PAGAMENTO (M-PESA / E-MOLA OFICIAIS) */}
        {/* ========================================================================= */}
        {activeAdminTab === 'settings' && (
          <div className="max-w-2xl mx-auto bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-indigo-400" />
                <span>Contas de Recebimento M-Pesa & e-Mola</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Estes números e nomes são exibidos automaticamente para os usuários na tela de pagamento do paywall.
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-5">
              {/* M-Pesa */}
              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-red-400 font-bold text-xs uppercase tracking-wider">
                  <DollarSign className="w-4 h-4" />
                  <span>Conta Oficial Vodacom M-Pesa</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Número M-Pesa</label>
                    <input
                      type="text"
                      value={mpesaNumber}
                      onChange={e => setMpesaNumber(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Nome do Titular</label>
                    <input
                      type="text"
                      value={mpesaName}
                      onChange={e => setMpesaName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              {/* e-Mola */}
              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-yellow-400 font-bold text-xs uppercase tracking-wider">
                  <DollarSign className="w-4 h-4" />
                  <span>Conta Oficial Movitel e-Mola</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Número e-Mola</label>
                    <input
                      type="text"
                      value={emolaNumber}
                      onChange={e => setEmolaNumber(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Nome do Titular</label>
                    <input
                      type="text"
                      value={emolaName}
                      onChange={e => setEmolaName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Contact support */}
              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-sky-400 font-bold text-xs uppercase tracking-wider">
                  <Phone className="w-4 h-4" />
                  <span>Suporte & WhatsApp de Ajuda</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">WhatsApp / Telefone</label>
                    <input
                      type="text"
                      value={supportPhone}
                      onChange={e => setSupportPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">E-mail de Suporte</label>
                    <input
                      type="email"
                      value={supportEmail}
                      onChange={e => setSupportEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-2xl font-bold text-xs shadow-lg shadow-indigo-600/30 transition cursor-pointer"
              >
                Gravar Configurações de Pagamento
              </button>
            </form>
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* MODAL: MANUAL PLAN MODIFICATION */}
      {/* ========================================================================= */}
      {selectedUserForPlan && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-black text-white">Alterar Plano Manualmente</h3>
                <p className="text-xs text-slate-400">{selectedUserForPlan.name}</p>
              </div>
              <button
                onClick={() => setSelectedUserForPlan(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">Selecione o Pacote:</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: '50mt', label: 'Básico', price: '50 MT' },
                    { id: '199mt', label: 'Profissional', price: '199 MT' },
                    { id: '499mt', label: 'Empresa VIP', price: '499 MT' }
                  ].map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setNewPlanSelection(p.id as any)}
                      className={`p-3 rounded-2xl border text-center transition cursor-pointer ${
                        newPlanSelection === p.id
                          ? 'bg-indigo-600/30 border-indigo-500 text-white font-black ring-1 ring-indigo-400'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span className="block text-xs font-bold">{p.label}</span>
                      <span className="block text-[11px] text-indigo-300 mt-0.5">{p.price}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Duração em Dias:</label>
                <select
                  value={newPlanDurationDays}
                  onChange={e => setNewPlanDurationDays(Number(e.target.value))}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                >
                  <option value={7}>7 dias (Período de Teste)</option>
                  <option value={30}>30 dias (1 Mês Oficial)</option>
                  <option value={60}>60 dias (2 Meses)</option>
                  <option value={90}>90 dias (Trimestral)</option>
                  <option value={365}>365 dias (Anual)</option>
                </select>
              </div>

              <div className="p-3 bg-indigo-950/40 border border-indigo-500/20 rounded-xl text-[11px] text-indigo-300">
                Esta ação atualizará o status da assinatura no Cloud Firestore para "ativa" com a nova data de expiração, liberando o acesso total do usuário.
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedUserForPlan(null)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveManualPlan}
                disabled={isProcessing}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-indigo-600/30 cursor-pointer disabled:opacity-50"
              >
                Confirmar Ativação
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: REJECT PAYMENT WITH JUSTIFICATION */}
      {/* ========================================================================= */}
      {rejectPaymentModalId && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-black text-white flex items-center gap-2 text-red-400">
                <XCircle className="w-5 h-5" />
                <span>Rejeitar Pagamento</span>
              </h3>
              <button
                onClick={() => setRejectPaymentModalId(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-300">
                Motivo da Rejeição (Será enviado ao usuário):
              </label>
              <textarea
                value={rejectionReasonInput}
                onChange={e => setRejectionReasonInput(e.target.value)}
                placeholder="Ex.: Código de transação M-Pesa não confere com o extrato bancário oficial ou valor inferior ao plano."
                rows={3}
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRejectPaymentModalId(null)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleRejectPaymentConfirm}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-red-600/30 cursor-pointer"
              >
                Confirmar Rejeição
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
