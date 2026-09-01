import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { UserAvatar } from '../common/UserAvatar';
import {
  TechnicianProfile,
  ServiceRequest,
  Proposal,
  TECHNICAL_CATEGORIES,
  MOZAMBIQUE_PROVINCES,
  PaymentMethod
} from '../../types';
import {
  Wrench,
  ShieldCheck,
  Star,
  DollarSign,
  Briefcase,
  CheckCircle2,
  Clock,
  QrCode,
  FileText,
  Plus,
  Send,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Camera,
  Layers,
  Phone,
  AlertCircle,
  Copy,
  Calculator,
  ArrowRight
} from 'lucide-react';
import { DigitalBusinessCard } from '../common/DigitalBusinessCard';
import { TopBackNav } from '../common/TopBackNav';

interface TechnicianDashboardProps {
  onNavigateTab: (tab: string) => void;
  onOpenMessages?: (userId: string, userName: string, role: string) => void;
}

export const TechnicianDashboard: React.FC<TechnicianDashboardProps> = ({ onNavigateTab, onOpenMessages }) => {
  const { currentUser, currentTechProfile, updateCurrentTechProfile } = useAuth();
  const {
    serviceRequests,
    proposals,
    reviews,
    portfolio,
    plans,
    submitProposal,
    submitVerificationDocuments,
    submitPayment,
    addPortfolioItem,
    deletePortfolioItem,
    saveBudgetEstimate,
    settings
  } = useData();

  const [activeTab, setActiveTab] = useState<'overview' | 'requests' | 'proposals' | 'budget_generator' | 'portfolio' | 'subscription' | 'profile'>('overview');
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  // Proposal modal state
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [proposalPrice, setProposalPrice] = useState<number>(3500);
  const [proposalLabor, setProposalLabor] = useState<number>(2000);
  const [proposalMaterials, setProposalMaterials] = useState<number>(1500);
  const [proposalNotes, setProposalNotes] = useState('');
  const [proposalDays, setProposalDays] = useState('2 dias');

  // Budget Generator State
  const [clientBudgetTitle, setClientBudgetTitle] = useState('Instalação de Sistema Solar Residencial');
  const [clientBudgetName, setClientBudgetName] = useState('Exmo(a) Cliente');
  const [budgetItems, setBudgetItems] = useState([
    { description: 'Painel Solar 550W Half-Cell Mono (4 un)', cost: 36000 },
    { description: 'Inversor Híbrido 5kW 48V MPPT', cost: 45000 },
    { description: 'Bateria de Lítio 48V 100Ah (4.8kWh)', cost: 65000 },
    { description: 'Cabo Solar 6mm², Conectores MC4 & DPS', cost: 8500 },
    { description: 'Mão de Obra Técnica Especializada com ART', cost: 15000 }
  ]);
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemCost, setNewItemCost] = useState<number>(0);
  const [budgetSaved, setBudgetSaved] = useState(false);

  // Verification upload state
  const [docNameInput, setDocNameInput] = useState('');
  const [docUploadedSuccess, setDocUploadedSuccess] = useState(false);

  // M-Pesa Subscription Modal
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState(plans[0]?.id || 'plan_pro');
  const [subMethod, setSubMethod] = useState<PaymentMethod>('mpesa');
  const [txCode, setTxCode] = useState('');
  const [subSuccess, setSubSuccess] = useState(false);

  if (!currentUser || currentUser.role !== 'technician') {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 rounded-3xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-4">
          <Wrench className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Acesso Restrito a Técnicos</h2>
        <p className="text-sm text-slate-500 mt-2 mb-6">
          Para aceder a esta área, inicie sessão com uma conta de perfil "Técnico".
        </p>
        <button
          onClick={() => onNavigateTab('home')}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition"
        >
          Voltar ao Início
        </button>
      </div>
    );
  }

  // Calculate profile completion percentage
  let completionScore = 40;
  if (currentTechProfile?.bio && currentTechProfile.bio.length > 20) completionScore += 15;
  if (currentTechProfile?.whatsapp) completionScore += 15;
  if (currentTechProfile?.verificationStatus === 'approved') completionScore += 15;
  if (portfolio.filter(p => p.technicianId === currentUser.uid).length > 0) completionScore += 15;
  completionScore = Math.min(100, completionScore);

  const isVerified = currentTechProfile?.verificationStatus === 'approved';
  const isSubActive = currentTechProfile?.subscriptionStatus === 'active';

  // Budget calculations
  const totalBudgetSum = budgetItems.reduce((acc, item) => acc + item.cost, 0);

  const handleAddBudgetItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItemDesc.trim() && newItemCost > 0) {
      setBudgetItems([...budgetItems, { description: newItemDesc.trim(), cost: newItemCost }]);
      setNewItemDesc('');
      setNewItemCost(0);
    }
  };

  const handleRemoveBudgetItem = (idx: number) => {
    setBudgetItems(budgetItems.filter((_, i) => i !== idx));
  };

  const handleSaveBudget = () => {
    saveBudgetEstimate({
      technicianId: currentUser.uid,
      technicianName: currentTechProfile?.name || currentUser.name,
      clientName: clientBudgetName,
      projectTitle: clientBudgetTitle,
      category: currentTechProfile?.specialties[0] || 'Eletricidade',
      items: budgetItems,
      laborCostMZN: budgetItems.find(i => i.description.toLowerCase().includes('mão de obra'))?.cost || 0,
      materialsCostMZN: budgetItems.filter(i => !i.description.toLowerCase().includes('mão de obra')).reduce((a, b) => a + b.cost, 0),
      totalCostMZN: totalBudgetSum,
      validUntilDate: '2026-10-30',
      province: currentTechProfile?.province || 'Maputo Cidade'
    });
    setBudgetSaved(true);
    setTimeout(() => setBudgetSaved(false), 2000);
  };

  const handleSubmitProposal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;

    submitProposal({
      requestId: selectedRequest.id,
      requestTitle: selectedRequest.title,
      clientId: selectedRequest.clientId,
      clientName: selectedRequest.clientName,
      technicianId: currentUser.uid,
      technicianName: currentTechProfile?.name || currentUser.name,
      technicianAvatarUrl: currentTechProfile?.avatarUrl,
      technicianRating: currentTechProfile?.rating || 5.0,
      technicianVerified: isVerified,
      laborCostMZN: proposalLabor,
      materialsCostMZN: proposalMaterials,
      totalCostMZN: proposalLabor + proposalMaterials,
      estimatedDays: proposalDays,
      notes: proposalNotes
    });

    setSelectedRequest(null);
    setActiveTab('proposals');
  };

  const handleSubmitVerification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docNameInput.trim()) return;
    submitVerificationDocuments(currentUser.uid, [docNameInput.trim()]);
    setDocUploadedSuccess(true);
    setDocNameInput('');
    setTimeout(() => setDocUploadedSuccess(false), 2500);
  };

  const handleSubPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!txCode.trim()) return;

    const plan = plans.find(p => p.id === selectedPlanId) || plans[0];

    const res = await submitPayment({
      userId: currentUser.uid,
      userName: currentTechProfile?.name || currentUser.name,
      userRole: 'technician',
      userPhone: currentTechProfile?.phone || currentUser.phone,
      planId: plan.id,
      planName: plan.name,
      amountMZN: plan.priceMZN,
      method: subMethod,
      transactionCode: txCode.trim()
    });

    if (res.success) {
      setSubSuccess(true);
      setTimeout(() => {
        setSubSuccess(false);
        setIsSubModalOpen(false);
        setTxCode('');
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900/5 py-6 sm:py-8 px-3 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Top Back Navigation Bar */}
        <TopBackNav
          title="Painel do Profissional Técnico"
          category="Meu Painel"
          onBack={() => onNavigateTab('community')}
          backLabel="Voltar ao Mural"
        />

        {/* Top Profile Hero Card */}
        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-blue-900/40 relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="flex items-start sm:items-center gap-5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white p-1 shadow-lg shrink-0 overflow-hidden">
                <UserAvatar
                  src={currentTechProfile?.avatarUrl || currentUser?.avatarUrl || currentUser?.photoURL}
                  name={currentTechProfile?.name || currentUser.name}
                  role="technician"
                  className="w-full h-full rounded-xl object-cover"
                />
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white">
                    {currentTechProfile?.name || currentUser.name}
                  </h1>
                  {isVerified ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-300 bg-blue-950/80 px-3 py-0.5 rounded-full border border-blue-500/50">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                      <span>Selo Verificado Oficial</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-300 bg-slate-800 px-2.5 py-0.5 rounded-full">
                      Perfil em Certificação
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-blue-200">
                  {currentTechProfile?.specialties?.join(', ') || 'Eletricidade'} • 📍{' '}
                  {currentTechProfile?.city || 'Maputo'}, {currentTechProfile?.province || 'Maputo Cidade'}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
                  <span className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <strong>{currentTechProfile?.rating?.toFixed(1) || '5.0'}</strong> ({currentTechProfile?.reviewsCount || 0} avaliações)
                  </span>
                  <span>🏆 {currentTechProfile?.completedJobsCount || 0} obras concluídas</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => setIsQrModalOpen(true)}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-xs font-bold transition border border-white/20 flex items-center gap-1.5"
              >
                <QrCode className="w-4 h-4 text-blue-400" />
                <span>Cartão Digital QR</span>
              </button>

              <button
                onClick={() => setActiveTab('budget_generator')}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-blue-600/30"
              >
                <Calculator className="w-4 h-4" />
                <span>Gerar Orçamento MZN</span>
              </button>
            </div>
          </div>

          {/* Progress Onboarding Checklist */}
          <div className="mt-6 pt-6 border-t border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-blue-200">Conclusão do Perfil Profissional</span>
              <strong className="text-white font-mono">{completionScore}%</strong>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 transition-all duration-500"
                style={{ width: `${completionScore}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="bg-white rounded-2xl p-2 border border-slate-200 shadow-xs flex flex-wrap items-center gap-1.5 overflow-x-auto">
          {[
            { id: 'overview', label: 'Visão Geral & Selo', icon: <Wrench className="w-4 h-4" /> },
            { id: 'requests', label: `Pedidos de Serviços (${serviceRequests.length})`, icon: <Briefcase className="w-4 h-4" /> },
            { id: 'proposals', label: `Minhas Propostas (${proposals.filter(p => p.technicianId === currentUser.uid).length})`, icon: <FileText className="w-4 h-4" /> },
            { id: 'budget_generator', label: 'Gerador de Orçamentos', icon: <Calculator className="w-4 h-4" /> },
            { id: 'portfolio', label: `Portfólio de Obras (${portfolio.filter(p => p.technicianId === currentUser.uid).length})`, icon: <Camera className="w-4 h-4" /> },
            { id: 'subscription', label: 'Assinatura & M-Pesa', icon: <DollarSign className="w-4 h-4" /> },
            { id: 'profile', label: 'Editar Perfil & WhatsApp', icon: <Phone className="w-4 h-4" /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* TAB 1: OVERVIEW & VERIFICATION SEAL */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Subscription Status Card */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Assinatura Mensal</span>
                  <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                    isSubActive ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {isSubActive ? '🟢 ATIVA (27 dias)' : '⏳ NÃO ATIVA'}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">
                    {isSubActive ? 'Plano Profissional MZ' : 'Plano Gratuito / Expirado'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {isSubActive
                      ? 'Seu perfil recebe destaque diário e propostas ilimitadas.'
                      : 'Ative sua assinatura via M-Pesa para desbloquear contatos diretos.'}
                  </p>
                </div>
                <button
                  onClick={() => setIsSubModalOpen(true)}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition"
                >
                  Renovar via M-Pesa / e-Mola
                </button>
              </div>

              {/* Verification Seal Status */}
              <div className="md:col-span-2 p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-blue-600" />
                    <span>Selo Oficial de Técnico Verificado TécnicaMZ</span>
                  </h3>
                  <span className={`text-xs font-bold ${isVerified ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {isVerified ? '✓ Selo Ativo' : 'Pendente de Documentação'}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Técnicos verificados passam por auditoria de identidade (BI / Passaporte) e certificados do IIM / UEM / Institutos Médios.
                </p>

                {docUploadedSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Documento submetido para a equipa de auditoria com sucesso!</span>
                  </div>
                )}

                <form onSubmit={handleSubmitVerification} className="flex gap-2 pt-2">
                  <input
                    type="text"
                    value={docNameInput}
                    onChange={e => setDocNameInput(e.target.value)}
                    placeholder="Nome do Certificado / Número do BI (Ex: Certificado_Eletrotecnica_IIM.pdf)"
                    className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shrink-0"
                  >
                    Submeter Documento
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: BUDGET GENERATOR (PROPOSTAS & ORÇAMENTOS) */}
        {activeTab === 'budget_generator' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-black text-slate-900">Gerador Profissional de Orçamentos (MZN)</h2>
                <p className="text-xs text-slate-500">Crie orçamentos discriminando materiais e mão de obra com padrão moçambicano.</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveBudget}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Salvar Orçamento</span>
                </button>
              </div>
            </div>

            {budgetSaved && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Orçamento gravado com sucesso no seu histórico profissional!</span>
              </div>
            )}

            {/* Header info for quote */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Título do Projeto / Obra</label>
                <input
                  type="text"
                  value={clientBudgetTitle}
                  onChange={e => setClientBudgetTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nome do Cliente / Empresa</label>
                <input
                  type="text"
                  value={clientBudgetName}
                  onChange={e => setClientBudgetName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold"
                />
              </div>
            </div>

            {/* Items Table */}
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">Itens Discriminados (Materiais & Serviços)</h3>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
                {budgetItems.map((item, idx) => (
                  <div key={idx} className="p-3 sm:p-4 flex items-center justify-between gap-4 bg-white hover:bg-slate-50/80 transition">
                    <span className="text-xs font-semibold text-slate-800">{item.description}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-black font-mono text-slate-900">{item.cost.toLocaleString()} MZN</span>
                      <button
                        onClick={() => handleRemoveBudgetItem(idx)}
                        className="text-rose-500 hover:text-rose-700 text-xs font-bold p-1"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add item row */}
              <form onSubmit={handleAddBudgetItem} className="flex flex-col sm:flex-row gap-2 pt-2">
                <input
                  type="text"
                  value={newItemDesc}
                  onChange={e => setNewItemDesc(e.target.value)}
                  placeholder="Descrição do item ou material..."
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
                <input
                  type="number"
                  value={newItemCost || ''}
                  onChange={e => setNewItemCost(Number(e.target.value))}
                  placeholder="Valor em MZN"
                  className="w-full sm:w-36 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition shrink-0"
                >
                  + Adicionar Item
                </button>
              </form>
            </div>

            {/* Total Callout */}
            <div className="p-5 rounded-2xl bg-slate-900 text-white flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Total do Orçamento Estimado</p>
                <p className="text-xl sm:text-2xl font-black font-mono mt-0.5 text-emerald-400">
                  {totalBudgetSum.toLocaleString()} MZN
                </p>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(
                    `*Orçamento TécnicaMZ - ${clientBudgetTitle}*\n` +
                    `Cliente: ${clientBudgetName}\n` +
                    `Técnico: ${currentTechProfile?.name}\n\n` +
                    budgetItems.map(i => `• ${i.description}: ${i.cost.toLocaleString()} MZN`).join('\n') +
                    `\n\n*TOTAL: ${totalBudgetSum.toLocaleString()} MZN*`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                >
                  <span>Enviar via WhatsApp</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: PROFILE & WHATSAPP CONFIG */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="pb-6 border-b border-slate-100">
              <h2 className="text-lg font-black text-slate-900">Configurações de Contato & WhatsApp</h2>
              <p className="text-xs text-slate-500">Controle a exibição do botão direto de WhatsApp e mensagem automática.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nome de Exibição</label>
                <input
                  type="text"
                  value={currentTechProfile?.name || ''}
                  onChange={e => updateCurrentTechProfile({ name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Número de WhatsApp (+258)</label>
                <input
                  type="text"
                  value={currentTechProfile?.whatsapp || ''}
                  onChange={e => updateCurrentTechProfile({ whatsapp: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono"
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-emerald-950">Exibir Botão Flutuante de WhatsApp no Perfil</p>
                <p className="text-[11px] text-emerald-800">Permite que clientes iniciem conversas com 1 clique.</p>
              </div>
              <input
                type="checkbox"
                checked={currentTechProfile?.showWhatsappButton ?? true}
                onChange={e => updateCurrentTechProfile({ showWhatsappButton: e.target.checked })}
                className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Biografia & Especialidades</label>
              <textarea
                rows={4}
                value={currentTechProfile?.bio || ''}
                onChange={e => updateCurrentTechProfile({ bio: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm"
              />
            </div>
          </div>
        )}
      </div>

      {/* QR Digital Card Modal */}
      <DigitalBusinessCard
        technician={currentTechProfile}
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
      />

      {/* M-Pesa Subscription Modal */}
      {isSubModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <h3 className="text-sm font-black">Renovar Assinatura TécnicaMZ</h3>
              <button onClick={() => setIsSubModalOpen(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubPayment} className="p-6 space-y-4">
              {subSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold">
                  Comprovativo enviado para a auditoria! Seu plano será ativado após conferência.
                </div>
              )}

              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs space-y-1 text-emerald-950">
                <p className="font-bold">Dados Oficiais para Envio M-Pesa:</p>
                <p>Número: <strong className="font-mono">{settings.mpesaNumber}</strong></p>
                <p>Titular: <strong>{settings.mpesaName}</strong></p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Plano Desejado</label>
                <select
                  value={selectedPlanId}
                  onChange={e => setSelectedPlanId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                >
                  {plans.map(p => (
                    <option key={p.id} value={p.id}>{p.name} - {p.priceMZN} MZN/mês</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Código da Transação SMS M-Pesa</label>
                <input
                  type="text"
                  value={txCode}
                  onChange={e => setTxCode(e.target.value)}
                  placeholder="Ex: 8H93KL12MZ"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition"
              >
                Submeter Comprovativo
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
