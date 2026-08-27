import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import {
  Shield,
  DollarSign,
  Users,
  Building2,
  Briefcase,
  ShoppingBag,
  BookOpen,
  Settings,
  FileText,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  ExternalLink,
  Search,
  Filter,
  BarChart3,
  Lock,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  Sparkles,
  Trash2,
  UserX,
  PieChart as PieIcon,
  Activity,
  Layers,
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
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import { UserStatus, VerificationStatus, CompanyVerificationStatus, MOZAMBIQUE_PROVINCES, TECHNICAL_CATEGORIES } from '../../types';

interface AdminPanelProps {
  onNavigateTab: (tab: string) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onNavigateTab }) => {
  const { currentUser, isAdmin, isSuperAdmin, isFinanceAdmin, isModerator, usersList, updateUserStatus, deleteUserAccount } = useAuth();
  const {
    technicians,
    companies,
    jobs,
    payments,
    serviceRequests,
    reports,
    adminLogs,
    marketItems,
    academyArticles,
    communityPosts,
    settings,
    verifyTechnician,
    updateTechnicianStatus,
    toggleFeaturedTechnician,
    deleteTechnician,
    verifyCompany,
    updateCompanyStatus,
    toggleFeaturedCompany,
    deleteCompany,
    approvePayment,
    rejectPayment,
    updateJobStatus,
    updateMarketItemStatus,
    verifyAcademyArticle,
    resolveReport,
    updateSettings
  } = useData();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'users' | 'charts' | 'finance' | 'techs' | 'companies' | 'jobs' | 'market' | 'community' | 'reports' | 'logs' | 'settings'
  >('overview');

  // Search & Filter states
  const [userSearch, setUserSearch] = useState('');
  const [techSearch, setTechSearch] = useState('');
  const [companySearch, setCompanySearch] = useState('');
  const [jobSearch, setJobSearch] = useState('');
  const [rejectReasonInput, setRejectReasonInput] = useState('');
  const [selectedPaymentToReject, setSelectedPaymentToReject] = useState<string | null>(null);

  // Settings form state
  const [mpesaNumber, setMpesaNumber] = useState(settings.mpesaNumber);
  const [mpesaName, setMpesaName] = useState(settings.mpesaName);
  const [emolaNumber, setEmolaNumber] = useState(settings.emolaNumber);
  const [emolaName, setEmolaName] = useState(settings.emolaName);
  const [supportPhone, setSupportPhone] = useState(settings.supportPhone);
  const [supportEmail, setSupportEmail] = useState(settings.supportEmail);
  const [settingsSaved, setSettingsSaved] = useState(false);

  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Painel de Acesso Restrito</h2>
        <p className="text-sm text-slate-500 mt-2 mb-6">
          Apenas administradores com credenciais ativas podem acessar o console de auditoria da TécnicaMZ.
        </p>
        <button
          onClick={() => onNavigateTab('home')}
          className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition"
        >
          Voltar ao Início
        </button>
      </div>
    );
  }

  // --- ANALYTICS DATA PREPARATION FOR RECHARTS ---
  // 1. Revenue & Subscriptions data
  const REVENUE_DATA = [
    { month: 'Out', faturamentoMZN: 18500, assinaturas: 42, mpesa: 14200, emola: 4300 },
    { month: 'Nov', faturamentoMZN: 29400, assinaturas: 68, mpesa: 22100, emola: 7300 },
    { month: 'Dez', faturamentoMZN: 45200, assinaturas: 95, mpesa: 34800, emola: 10400 },
    { month: 'Jan', faturamentoMZN: 68900, assinaturas: 142, mpesa: 52400, emola: 16500 },
    { month: 'Fev', faturamentoMZN: 84300, assinaturas: 188, mpesa: 63800, emola: 20500 },
    { month: 'Mar (Atual)', faturamentoMZN: 112500, assinaturas: 245, mpesa: 84900, emola: 27600 }
  ];

  // 2. Province Breakdown
  const PROVINCE_DATA = [
    { province: 'Maputo Cidade', tecnicos: 54, empresas: 18, pedidos: 82 },
    { province: 'Maputo Prov.', tecnicos: 42, empresas: 14, pedidos: 65 },
    { province: 'Sofala (Beira)', tecnicos: 28, empresas: 9, pedidos: 41 },
    { province: 'Nampula', tecnicos: 31, empresas: 8, pedidos: 38 },
    { province: 'Tete', tecnicos: 24, empresas: 11, pedidos: 34 },
    { province: 'Inhambane', tecnicos: 18, empresas: 5, pedidos: 22 },
    { province: 'Cabo Delgado', tecnicos: 15, empresas: 7, pedidos: 19 },
    { province: 'Gaza', tecnicos: 12, empresas: 4, pedidos: 15 }
  ];

  // 3. Category Demand
  const CATEGORY_DEMAND_DATA = [
    { category: 'Energia Solar', servicos: 84, tecnicos: 62 },
    { category: 'Eletricidade', servicos: 78, tecnicos: 71 },
    { category: 'Climatização', servicos: 55, tecnicos: 44 },
    { category: 'CCTV & Redes', servicos: 46, tecnicos: 38 },
    { category: 'Manut. Industrial', servicos: 39, tecnicos: 29 },
    { category: 'Canalização', servicos: 27, tecnicos: 21 }
  ];

  // 4. Verification Status Distribution
  const verifiedCount = technicians.filter(t => t.verificationStatus === 'approved').length;
  const pendingCount = technicians.filter(t => t.verificationStatus === 'pending').length;
  const unverifiedCount = technicians.filter(t => t.verificationStatus === 'unverified').length;
  const rejectedCount = technicians.filter(t => t.verificationStatus === 'rejected').length;

  const VERIFICATION_PIE_DATA = [
    { name: 'Aprovados / Verificados', value: Math.max(1, verifiedCount), color: '#10b981' },
    { name: 'Documentos Pendentes', value: Math.max(1, pendingCount), color: '#f59e0b' },
    { name: 'Não Verificados', value: Math.max(1, unverifiedCount), color: '#64748b' },
    { name: 'Rejeitados', value: Math.max(0, rejectedCount), color: '#ef4444' }
  ];

  // Calculations for quick KPIs
  const totalRevenue = payments
    .filter(p => p.status === 'approved')
    .reduce((sum, p) => sum + p.amountMZN, 0);

  const pendingPayments = payments.filter(p => p.status === 'pending');
  const pendingTechVerifications = technicians.filter(t => t.verificationStatus === 'pending');
  const pendingCompanyVerifications = companies.filter(c => c.verificationStatus === 'pending');

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
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 3000);
  };

  const handlePurgeFakeTechnician = (userId: string, name: string) => {
    if (confirm(`ATENÇÃO: Deseja remover permanentemente a conta do técnico "${name}" (ID: ${userId})? Esta ação não pode ser desfeita.`)) {
      deleteTechnician(userId);
      alert(`Conta "${name}" removida com sucesso.`);
    }
  };

  const handlePurgeFakeCompany = (userId: string, name: string) => {
    if (confirm(`ATENÇÃO: Deseja remover permanentemente a conta da empresa "${name}" (ID: ${userId})? Esta ação não pode ser desfeita.`)) {
      deleteCompany(userId);
      alert(`Empresa "${name}" removida com sucesso.`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900/5 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Hero */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-indigo-500/20 relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-bold">
                <Shield className="w-3.5 h-3.5 text-indigo-400" />
                <span>Console de Governança & Auditoria • TécnicaMZ</span>
              </div>
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white">
                Painel do Administrador & Métricas
              </h1>
              <p className="text-xs sm:text-base text-slate-300">
                Auditoria financeira de pagamentos M-Pesa/E-Mola, gestão de contas, gráficos analíticos em tempo real e moderação de conteúdo.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveTab('charts')}
                className="px-5 py-3 bg-indigo-500 hover:bg-indigo-400 text-slate-950 rounded-2xl text-xs font-black transition flex items-center gap-2 shadow-lg shadow-indigo-500/25 shrink-0"
              >
                <BarChart3 className="w-4 h-4" />
                <span>Ver Gráficos & Estatísticas</span>
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {[
            { id: 'overview', label: 'Visão Geral', icon: Activity, count: null },
            { id: 'users', label: 'Todos os Usuários', icon: Users, count: usersList.length },
            { id: 'charts', label: 'Gráficos & Métricas', icon: BarChart3, count: null },
            { id: 'finance', label: 'Financeiro M-Pesa/E-Mola', icon: DollarSign, count: pendingPayments.length },
            { id: 'techs', label: 'Técnicos & Contas', icon: Users, count: pendingTechVerifications.length },
            { id: 'companies', label: 'Empresas (NUIT)', icon: Building2, count: pendingCompanyVerifications.length },
            { id: 'jobs', label: 'Vagas & Emprego', icon: Briefcase, count: jobs.length },
            { id: 'market', label: 'Mercado', icon: ShoppingBag, count: marketItems.length },
            { id: 'community', label: 'Mural Global', icon: MessageSquare, count: communityPosts.length },
            { id: 'settings', label: 'Configurações Moçambique', icon: Settings, count: null }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.count !== null && tab.count > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                    isActive ? 'bg-indigo-500 text-slate-950' : 'bg-indigo-100 text-indigo-700'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ========================================================================= */}
        {/* TAB: ALL USERS (REAL-TIME FIRESTORE LIST) */}
        {/* ========================================================================= */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-black text-slate-900">Base de Usuários em Tempo Real (Firebase)</h2>
                <p className="text-xs text-slate-500">
                  Lista sincronizada com o Firebase Authentication e Cloud Firestore ({usersList.length} usuários cadastrados).
                </p>
              </div>

              <div className="relative min-w-[260px]">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                  placeholder="Buscar por nome, email, telefone ou papel..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="pb-3">Usuário</th>
                    <th className="pb-3">Email & Telefone</th>
                    <th className="pb-3">Perfil / Papel</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Criado em</th>
                    <th className="pb-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {usersList
                    .filter(u =>
                      u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
                      u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
                      u.phone?.includes(userSearch) ||
                      u.role?.toLowerCase().includes(userSearch.toLowerCase())
                    )
                    .map(u => (
                      <tr key={u.uid} className="hover:bg-slate-50/80 transition">
                        <td className="py-3.5 font-bold text-slate-900 flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 overflow-hidden shrink-0">
                            {u.avatarUrl ? (
                              <img src={u.avatarUrl} alt={u.name} className="w-full h-full object-cover" />
                            ) : (
                              u.name?.charAt(0).toUpperCase() || 'U'
                            )}
                          </div>
                          <div>
                            <span>{u.name}</span>
                            <span className="block text-[10px] font-mono text-slate-400 font-normal truncate max-w-[120px]">
                              {u.uid}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5">
                          <span className="font-mono text-slate-700 block">{u.email}</span>
                          <span className="text-[11px] text-slate-500 font-mono">{u.phone || 'Sem telefone'}</span>
                        </td>
                        <td className="py-3.5">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            u.role === 'admin' || u.role === 'super_admin'
                              ? 'bg-purple-100 text-purple-800'
                              : u.role === 'technician'
                              ? 'bg-indigo-100 text-indigo-800'
                              : u.role === 'company'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {u.role === 'technician'
                              ? 'Técnico'
                              : u.role === 'company'
                              ? 'Empresa'
                              : u.role === 'client'
                              ? 'Cliente'
                              : 'Administrador'}
                          </span>
                        </td>
                        <td className="py-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            u.status === 'active'
                              ? 'bg-emerald-100 text-emerald-800'
                              : u.status === 'suspended'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {u.status === 'active' ? 'Ativo' : u.status === 'suspended' ? 'Suspenso' : 'Pendente'}
                          </span>
                        </td>
                        <td className="py-3.5 text-slate-500 text-[11px]">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString('pt-MZ') : 'Recente'}
                        </td>
                        <td className="py-3.5 text-right space-x-2">
                          {u.status === 'active' ? (
                            <button
                              onClick={() => updateUserStatus(u.uid, 'suspended')}
                              className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg font-bold text-[11px] transition"
                            >
                              Suspender
                            </button>
                          ) : (
                            <button
                              onClick={() => updateUserStatus(u.uid, 'active')}
                              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg font-bold text-[11px] transition"
                            >
                              Ativar
                            </button>
                          )}
                          <button
                            onClick={() => {
                              if (confirm(`Tem certeza que deseja excluir o usuário "${u.name}" (${u.email})?`)) {
                                deleteUserAccount(u.uid);
                              }
                            }}
                            className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition"
                            title="Remover Usuário"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 1: OVERVIEW */}
        {/* ========================================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-bold">Faturamento Total Aprovado</span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                  {totalRevenue.toLocaleString()} MZN
                </p>
                <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> +24% em relação ao mês anterior
                </p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-bold">Técnicos Cadastrados</span>
                  <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                  {technicians.length}
                </p>
                <p className="text-[11px] text-indigo-600 font-bold">
                  {verifiedCount} com selo de verificação aprovado
                </p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-bold">Empresas Contratantes</span>
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                    <Building2 className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                  {companies.length}
                </p>
                <p className="text-[11px] text-blue-600 font-bold">
                  {companies.filter(c => c.verificationStatus === 'verified').length} com NUIT certificado
                </p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-bold">Mercado & Mural Técnico</span>
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                  {marketItems.length + communityPosts.length}
                </p>
                <p className="text-[11px] text-amber-700 font-bold">
                  {marketItems.length} equipamentos + {communityPosts.length} posts
                </p>
              </div>
            </div>

            {/* Quick Pending Action Alerts */}
            {(pendingPayments.length > 0 || pendingTechVerifications.length > 0) && (
              <div className="bg-amber-50 rounded-3xl p-6 border border-amber-200 space-y-4">
                <div className="flex items-center gap-2 text-amber-900 font-black text-sm">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                  <span>Ações Pendentes de Moderação Imediata</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {pendingPayments.length > 0 && (
                    <button
                      onClick={() => setActiveTab('finance')}
                      className="p-3 bg-white rounded-2xl border border-amber-200 flex items-center justify-between hover:bg-amber-100/50 transition text-left"
                    >
                      <div>
                        <p className="font-black text-slate-900">{pendingPayments.length} Pagamento(s) M-Pesa / E-Mola Pendente(s)</p>
                        <p className="text-slate-500 text-[11px]">Requer verificação do código de transação</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-amber-600" />
                    </button>
                  )}
                  {pendingTechVerifications.length > 0 && (
                    <button
                      onClick={() => setActiveTab('techs')}
                      className="p-3 bg-white rounded-2xl border border-amber-200 flex items-center justify-between hover:bg-amber-100/50 transition text-left"
                    >
                      <div>
                        <p className="font-black text-slate-900">{pendingTechVerifications.length} Solicitação(ões) de Selo Técnico</p>
                        <p className="text-slate-500 text-[11px]">Diplomas e certificados anexados para conferência</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-amber-600" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Mini Chart Snapshot on Overview */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-900">Faturamento Mensal de Assinaturas (MZN)</h3>
                  <p className="text-xs text-slate-500">Crescimento de receita via M-Pesa e E-Mola</p>
                </div>
                <button
                  onClick={() => setActiveTab('charts')}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                >
                  <span>Ver Todos os Gráficos</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={REVENUE_DATA}>
                    <defs>
                      <linearGradient id="colorFaturamento" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip
                      formatter={(val: any) => [`${Number(val).toLocaleString()} MZN`, 'Faturamento']}
                      contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                    />
                    <Area type="monotone" dataKey="faturamentoMZN" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorFaturamento)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: ADVANCED CHARTS & METRICS */}
        {/* ========================================================================= */}
        {activeTab === 'charts' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Chart 1: Revenue breakdown by payment method */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <div>
                  <h3 className="text-base font-black text-slate-900">Faturamento por Método: M-Pesa vs E-Mola</h3>
                  <p className="text-xs text-slate-500">Distribuição mensal dos canais móveis em Moçambique</p>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={REVENUE_DATA}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
                      <Legend wrapperStyle={{ fontSize: '12px' }} />
                      <Bar dataKey="mpesa" name="M-Pesa (Vodacom)" fill="#ef4444" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="emola" name="E-Mola (Movitel)" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2: Regional Distribution in Mozambique */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <div>
                  <h3 className="text-base font-black text-slate-900">Distribuição Regional de Técnicos & Vagas</h3>
                  <p className="text-xs text-slate-500">Concentração de profissionais por província</p>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={PROVINCE_DATA} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis type="number" tick={{ fontSize: 11 }} />
                      <YAxis dataKey="province" type="category" width={90} tick={{ fontSize: 10 }} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
                      <Legend wrapperStyle={{ fontSize: '12px' }} />
                      <Bar dataKey="tecnicos" name="Técnicos" fill="#4f46e5" radius={[0, 4, 4, 0]} />
                      <Bar dataKey="pedidos" name="Pedidos de Clientes" fill="#06b6d4" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 3: Demand by Category */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <div>
                  <h3 className="text-base font-black text-slate-900">Demanda de Serviços vs Técnicos Disponíveis</h3>
                  <p className="text-xs text-slate-500">Áreas com maior volume de solicitações</p>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={CATEGORY_DEMAND_DATA}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="category" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
                      <Legend wrapperStyle={{ fontSize: '12px' }} />
                      <Bar dataKey="servicos" name="Serviços Solicitados" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="tecnicos" name="Técnicos Ativos" fill="#10b981" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 4: Verification Pipeline Status (Donut) */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <div>
                  <h3 className="text-base font-black text-slate-900">Funil de Verificação de Documentação</h3>
                  <p className="text-xs text-slate-500">Selo de Qualidade e Segurança da TécnicaMZ</p>
                </div>
                <div className="h-64 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={VERIFICATION_PIE_DATA}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {VERIFICATION_PIE_DATA.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
                      <Legend wrapperStyle={{ fontSize: '12px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: FINANCE (M-PESA / E-MOLA AUDIT) */}
        {/* ========================================================================= */}
        {activeTab === 'finance' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-slate-900">Auditoria Financeira M-Pesa & E-Mola</h2>
                <p className="text-xs text-slate-500">Aprovação de comprovativos e ativação de planos de assinatura</p>
              </div>
              <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold">
                {payments.length} Registos Totais
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="pb-3">Usuário</th>
                    <th className="pb-3">Plano</th>
                    <th className="pb-3">Valor</th>
                    <th className="pb-3">Método</th>
                    <th className="pb-3">Cód. Transação</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payments.map(payment => (
                    <tr key={payment.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 font-bold text-slate-900">
                        {payment.userName}
                        <span className="block text-[10px] text-slate-400 font-normal">{payment.userPhone}</span>
                      </td>
                      <td className="py-3.5 font-medium text-slate-700">{payment.planName}</td>
                      <td className="py-3.5 font-mono font-black text-slate-900">{payment.amountMZN} MZN</td>
                      <td className="py-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          payment.method === 'mpesa' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {payment.method.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3.5 font-mono text-slate-600">{payment.transactionCode}</td>
                      <td className="py-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          payment.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : payment.status === 'pending'
                            ? 'bg-amber-100 text-amber-800 animate-pulse'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {payment.status === 'approved' ? 'Aprovado' : payment.status === 'pending' ? 'Pendente' : 'Rejeitado'}
                        </span>
                      </td>
                      <td className="py-3.5 text-right space-x-2">
                        {payment.status === 'pending' && (
                          <>
                            <button
                              onClick={() => approvePayment(payment.id, currentUser!.uid, currentUser!.name)}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-xs transition"
                            >
                              Aprovar
                            </button>
                            <button
                              onClick={() => rejectPayment(payment.id, currentUser!.uid, currentUser!.name, 'Comprovativo inválido')}
                              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold shadow-xs transition"
                            >
                              Rejeitar
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: TECHNICIANS & ACCOUNTS MANAGEMENT (WITH PURGE FAKE ACCOUNTS) */}
        {/* ========================================================================= */}
        {activeTab === 'techs' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-black text-slate-900">Gestão de Técnicos & Contas</h2>
                <p className="text-xs text-slate-500">
                  Aprovação de selos, suspensão de perfis e exclusão permanente de contas fictícias ou de spam.
                </p>
              </div>

              <div className="relative min-w-[240px]">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={techSearch}
                  onChange={e => setTechSearch(e.target.value)}
                  placeholder="Filtrar por nome, província, especialidade..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="pb-3">Técnico</th>
                    <th className="pb-3">Província / Cidade</th>
                    <th className="pb-3">Especialidades</th>
                    <th className="pb-3">Selo de Verificação</th>
                    <th className="pb-3">Status Conta</th>
                    <th className="pb-3 text-right">Ações & Moderação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {technicians
                    .filter(t =>
                      t.name.toLowerCase().includes(techSearch.toLowerCase()) ||
                      t.province.toLowerCase().includes(techSearch.toLowerCase()) ||
                      t.specialties.some(s => s.toLowerCase().includes(techSearch.toLowerCase()))
                    )
                    .map(tech => (
                      <tr key={tech.userId} className="hover:bg-slate-50/80 transition">
                        <td className="py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                              {tech.avatarUrl ? (
                                <img src={tech.avatarUrl} alt={tech.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center font-bold text-slate-500">
                                  {tech.name.charAt(0)}
                                </div>
                              )}
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 block">{tech.name}</span>
                              <span className="text-[10px] text-slate-400">{tech.phone} • {tech.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 text-slate-600">{tech.city}, {tech.province}</td>
                        <td className="py-3.5">
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {tech.specialties.slice(0, 2).map(s => (
                              <span key={s} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[10px]">
                                {s}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3.5">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            tech.verificationStatus === 'approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : tech.verificationStatus === 'pending'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {tech.verificationStatus === 'approved' ? '✓ Verificado' : tech.verificationStatus === 'pending' ? 'Pendente' : 'Não Verificado'}
                          </span>
                        </td>
                        <td className="py-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            tech.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {tech.status === 'active' ? 'Ativo' : 'Suspenso'}
                          </span>
                        </td>
                        <td className="py-3.5 text-right space-x-1.5">
                          {tech.verificationStatus === 'pending' && (
                            <button
                              onClick={() => verifyTechnician(tech.userId, 'approved')}
                              className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg font-bold text-[11px] shadow-xs"
                            >
                              Aprovar Selo
                            </button>
                          )}
                          <button
                            onClick={() => toggleFeaturedTechnician(tech.userId)}
                            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition ${
                              tech.featured ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {tech.featured ? '★ Destaque' : 'Destacar'}
                          </button>
                          <button
                            onClick={() => handlePurgeFakeTechnician(tech.userId, tech.name)}
                            className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition"
                            title="Excluir Conta Fictícia / Spam"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: COMPANIES (NUIT VERIFICATION & PURGE) */}
        {/* ========================================================================= */}
        {activeTab === 'companies' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-black text-slate-900">Empresas Contratantes & NUIT</h2>
                <p className="text-xs text-slate-500">Validação fiscal e controle de contas corporativas em Moçambique.</p>
              </div>

              <div className="relative min-w-[240px]">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={companySearch}
                  onChange={e => setCompanySearch(e.target.value)}
                  placeholder="Buscar empresa ou NUIT..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="pb-3">Empresa</th>
                    <th className="pb-3">NUIT Fiscal</th>
                    <th className="pb-3">Setor</th>
                    <th className="pb-3">Província</th>
                    <th className="pb-3">Verificação NUIT</th>
                    <th className="pb-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {companies
                    .filter(c =>
                      c.companyName.toLowerCase().includes(companySearch.toLowerCase()) ||
                      (c.nuit && c.nuit.includes(companySearch))
                    )
                    .map(comp => (
                      <tr key={comp.userId} className="hover:bg-slate-50/80 transition">
                        <td className="py-3.5 font-bold text-slate-900">{comp.companyName}</td>
                        <td className="py-3.5 font-mono text-slate-600">{comp.nuit || 'Pendente'}</td>
                        <td className="py-3.5 text-slate-600">{comp.industry}</td>
                        <td className="py-3.5 text-slate-600">{comp.province}</td>
                        <td className="py-3.5">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            comp.verificationStatus === 'verified'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {comp.verificationStatus === 'verified' ? '✓ NUIT Certificado' : 'Pendente'}
                          </span>
                        </td>
                        <td className="py-3.5 text-right space-x-2">
                          {comp.verificationStatus !== 'verified' && (
                            <button
                              onClick={() => verifyCompany(comp.userId, 'verified')}
                              className="px-3 py-1 bg-emerald-600 text-white rounded-lg font-bold text-[11px]"
                            >
                              Validar NUIT
                            </button>
                          )}
                          <button
                            onClick={() => handlePurgeFakeCompany(comp.userId, comp.companyName)}
                            className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition"
                            title="Remover Empresa Fictícia"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: SETTINGS */}
        {/* ========================================================================= */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div>
              <h2 className="text-lg font-black text-slate-900">Configurações de Pagamento & Suporte MZ</h2>
              <p className="text-xs text-slate-500">Defina os números oficiais de M-Pesa e E-Mola que aparecem no checkout.</p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4 max-w-2xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Número M-Pesa (Vodacom)</label>
                  <input
                    type="text"
                    value={mpesaNumber}
                    onChange={e => setMpesaNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Titular M-Pesa</label>
                  <input
                    type="text"
                    value={mpesaName}
                    onChange={e => setMpesaName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Número E-Mola (Movitel)</label>
                  <input
                    type="text"
                    value={emolaNumber}
                    onChange={e => setEmolaNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Titular E-Mola</label>
                  <input
                    type="text"
                    value={emolaName}
                    onChange={e => setEmolaName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black transition flex items-center gap-2 shadow-xs"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Salvar Configurações</span>
                </button>
                {settingsSaved && (
                  <p className="text-xs text-emerald-600 font-bold mt-2">Configurações salvas com sucesso!</p>
                )}
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
