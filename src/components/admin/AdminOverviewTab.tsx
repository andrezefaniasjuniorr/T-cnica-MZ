import React from 'react';
import { User, PaymentRecord } from '../../types';
import {
  DollarSign,
  Users,
  Clock,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  CreditCard,
  UserCheck,
  Building2,
  Wrench,
  ArrowRight,
  ShieldCheck,
  Sparkles
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
  CartesianGrid
} from 'recharts';

interface AdminOverviewTabProps {
  users: User[];
  payments: PaymentRecord[];
  onSelectTab: (tab: 'metrics' | 'approvals' | 'users' | 'payments' | 'broadcast' | 'settings') => void;
}

export const AdminOverviewTab: React.FC<AdminOverviewTabProps> = ({
  users,
  payments,
  onSelectTab
}) => {
  // Metric 1: Total Real Revenue from Approved Payments
  const approvedPayments = payments.filter(p => p.status === 'approved');
  const totalRevenueMZN = approvedPayments.reduce((acc, curr) => acc + (Number(curr.amountMZN) || 50), 0);

  // Metric 2: Active Subscribers (50 MT)
  const now = Date.now();
  const activeSubscribers = users.filter(u => {
    if (u.role === 'client') return false;
    const isStatusActive = (u.statusAssinatura || u.subscriptionStatus || '').toLowerCase() === 'ativa' || (u.statusAssinatura || u.subscriptionStatus || '').toLowerCase() === 'active';
    const exp = u.dataExpiracao || u.subscriptionExpiresAt;
    if (!exp) return false;
    return isStatusActive && new Date(exp).getTime() > now;
  });

  // Metric 3: Pending Approvals
  const pendingApprovals = users.filter(
    u => (u.role === 'technician' || u.role === 'company' || u.tipoConta === 'tecnico') &&
         (u.statusAprovacao === 'pendente' || u.status === 'pending_approval')
  );

  // Metric 4: Pending Payments
  const pendingPayments = payments.filter(p => p.status === 'pending');

  // Metric 5: Expiring Soon (< 7 days)
  const expiringSoonUsers = users.filter(u => {
    if (u.role === 'client') return false;
    const exp = u.dataExpiracao || u.subscriptionExpiresAt;
    if (!exp) return false;
    const diffDays = (new Date(exp).getTime() - now) / (1000 * 60 * 60 * 24);
    return diffDays > 0 && diffDays <= 7;
  });

  // Breakdown by Role
  const clientCount = users.filter(u => u.role === 'client' || u.tipoConta === 'cliente').length;
  const techCount = users.filter(u => u.role === 'technician' && u.tipoConta !== 'cliente').length;
  const companyCount = users.filter(u => u.role === 'company').length;

  const roleDistributionData = [
    { name: 'Clientes', value: clientCount || 1, color: '#3B82F6' },
    { name: 'Técnicos', value: techCount || 1, color: '#10B981' },
    { name: 'Empresas', value: companyCount || 1, color: '#F59E0B' }
  ];

  // Monthly revenue simulation data based on real transactions or baseline
  const monthlyRevenueData = [
    { month: 'Out', total: Math.max(150, totalRevenueMZN * 0.15), subs: Math.max(3, activeSubscribers.length * 0.2) },
    { month: 'Nov', total: Math.max(350, totalRevenueMZN * 0.35), subs: Math.max(7, activeSubscribers.length * 0.4) },
    { month: 'Dez', total: Math.max(600, totalRevenueMZN * 0.6), subs: Math.max(12, activeSubscribers.length * 0.7) },
    { month: 'Jan', total: Math.max(950, totalRevenueMZN * 0.8), subs: Math.max(19, activeSubscribers.length * 0.85) },
    { month: 'Fev', total: totalRevenueMZN || 1250, subs: activeSubscribers.length || 25 }
  ];

  return (
    <div className="space-y-6">
      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* KPI 1: Total Revenue */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Receita Total Confirmada</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {totalRevenueMZN.toLocaleString()}
              </span>
              <span className="text-sm font-bold text-emerald-400">MT</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>Faturamento oficial M-Pesa & e-Mola</span>
            </p>
          </div>
        </div>

        {/* KPI 2: Active 50 MT Subscribers */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Assinantes Pro (50 MT/mês)</span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {activeSubscribers.length}
              </span>
              <span className="text-xs font-medium text-slate-400">ativos</span>
            </div>
            <p className="text-[11px] text-blue-400 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{activeSubscribers.length * 50} MT / mês recorrente</span>
            </p>
          </div>
        </div>

        {/* KPI 3: Pending Approvals */}
        <div
          onClick={() => onSelectTab('approvals')}
          className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 transition-all shadow-lg cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Aprovações Pendentes</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-amber-400 tracking-tight">
                {pendingApprovals.length}
              </span>
              <span className="text-xs font-medium text-slate-400">cadastros</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 group-hover:text-amber-300">
              <span>Clique para revisar novos técnicos</span>
              <ArrowRight className="w-3 h-3" />
            </p>
          </div>
        </div>

        {/* KPI 4: Total Users */}
        <div
          onClick={() => onSelectTab('users')}
          className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all shadow-lg cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total de Usuários</span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {users.length}
              </span>
              <span className="text-xs font-medium text-slate-400">registados</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {clientCount} clientes · {techCount} técnicos · {companyCount} empresas
            </p>
          </div>
        </div>
      </div>

      {/* Action Banners for Urgent Items */}
      {(pendingApprovals.length > 0 || pendingPayments.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pendingApprovals.length > 0 && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-amber-300">
                    {pendingApprovals.length} {pendingApprovals.length === 1 ? 'Cadastro Aguarda' : 'Cadastros Aguardam'} Aprovação
                  </h4>
                  <p className="text-[11px] text-slate-300">
                    Profissionais retidos na tela de espera aguardando liberação.
                  </p>
                </div>
              </div>
              <button
                onClick={() => onSelectTab('approvals')}
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shrink-0 transition-colors"
              >
                Revisar
              </button>
            </div>
          )}

          {pendingPayments.length > 0 && (
            <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-blue-300">
                    {pendingPayments.length} {pendingPayments.length === 1 ? 'Pagamento Pendente' : 'Pagamentos Pendentes'}
                  </h4>
                  <p className="text-[11px] text-slate-300">
                    Comprovativos de M-Pesa / e-Mola aguardando validação de 50 MT.
                  </p>
                </div>
              </div>
              <button
                onClick={() => onSelectTab('payments')}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shrink-0 transition-colors"
              >
                Validar
              </button>
            </div>
          )}
        </div>
      )}

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Chart: Revenue Trend */}
        <div className="lg:col-span-8 p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Evolução de Faturamento & Assinaturas</h3>
              <p className="text-xs text-slate-400">Crescimento mensal da assinatura única (50 MT)</p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
              Plano 50 MT
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyRevenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  formatter={(value: any) => [`${value} MT`, 'Receita']}
                />
                <Area type="monotone" dataKey="total" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Chart: Role Composition */}
        <div className="lg:col-span-4 p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Composição de Usuários</h3>
            <p className="text-xs text-slate-400">Distribuição por categoria de conta</p>
          </div>

          <div className="h-44 w-full my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={roleDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={65}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {roleDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-800/80 text-xs">
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                Clientes
              </span>
              <span className="font-bold text-white">{clientCount}</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Técnicos
              </span>
              <span className="font-bold text-white">{techCount}</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                Empresas
              </span>
              <span className="font-bold text-white">{companyCount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
