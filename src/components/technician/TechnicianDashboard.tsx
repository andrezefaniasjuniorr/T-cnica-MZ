import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { UserAvatar } from '../common/UserAvatar';
import {
  TechnicianProfile,
  ServiceRequest,
  Proposal,
  TECHNICAL_CATEGORIES,
  MOZAMBIQUE_PROVINCES,
  PaymentMethod,
  PortfolioItem
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
  ArrowRight,
  Trash2,
  MapPin,
  Calendar,
  MessageSquare,
  Search,
  Filter,
  Check,
  X,
  CreditCard,
  RotateCcw,
  BookOpen
} from 'lucide-react';
import { resetOnboardingTour } from '../common/WelcomeModal';
import { DigitalBusinessCard } from '../common/DigitalBusinessCard';
import { TopBackNav } from '../common/TopBackNav';

interface TechnicianDashboardProps {
  onNavigateTab: (tab: string) => void;
  onOpenMessages?: (userId: string, userName: string, role: string) => void;
}

export const TechnicianDashboard: React.FC<TechnicianDashboardProps> = ({ onNavigateTab, onOpenMessages }) => {
  const {
    currentUser,
    currentTechProfile,
    updateCurrentTechProfile,
    temSeloMZ,
    seloDaysRemaining,
    isSeloExpired,
    isTrialActive,
    trialDaysRemaining,
    isTrialValid
  } = useAuth();
  const {
    serviceRequests,
    proposals,
    reviews,
    portfolio,
    plans,
    payments,
    submitProposal,
    submitVerificationDocuments,
    submitPayment,
    addPortfolioItem,
    deletePortfolioItem,
    saveBudgetEstimate,
    settings
  } = useData();

  // Tab State: uses the exact IDs corresponding to data-tab in the specification
  const [activeTab, setActiveTab] = useState<
    'tab-visao-geral' | 'tab-pedidos' | 'tab-propostas' | 'tab-orcamentos' | 'tab-portfolio' | 'tab-assinatura' | 'tab-editar'
  >('tab-visao-geral');

  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  // Proposal modal state
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
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

  // Portfolio modal state
  const [isAddPortfolioModalOpen, setIsAddPortfolioModalOpen] = useState(false);
  const [newPortTitle, setNewPortTitle] = useState('');
  const [newPortCategory, setNewPortCategory] = useState(currentTechProfile?.specialties[0] || 'Eletricidade');
  const [newPortDesc, setNewPortDesc] = useState('');
  const [newPortImage, setNewPortImage] = useState('https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&auto=format&fit=crop&q=60');
  const [newPortCity, setNewPortCity] = useState(currentTechProfile?.city || 'Maputo');
  const [portfolioSuccess, setPortfolioSuccess] = useState(false);

  // Requests search & filter state
  const [requestsSearch, setRequestsSearch] = useState('');
  const [requestsCategoryFilter, setRequestsCategoryFilter] = useState('all');

  // Profile edit state
  const [profileSuccessMsg, setProfileSuccessMsg] = useState(false);

  // M-Pesa Subscription Modal & Tab State
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState(plans[0]?.id || 'plan_pro');
  const [subMethod, setSubMethod] = useState<PaymentMethod>('mpesa');
  const [txCode, setTxCode] = useState('');
  const [subSuccess, setSubSuccess] = useState(false);

  // Synchronize Tab Switching function
  const handleTabClick = (tabId: string, e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setActiveTab(tabId as any);

    // Sync active classes and display in DOM to support vanilla scripts and CSS transitions
    const tabButtons = document.querySelectorAll('.dashboard-tabs .tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(b => {
      if (b.getAttribute('data-tab') === tabId) {
        b.classList.add('active');
      } else {
        b.classList.remove('active');
      }
    });

    tabContents.forEach(c => {
      if (c.id === tabId) {
        c.classList.add('active');
        c.classList.remove('hidden');
        (c as HTMLElement).style.display = 'block';
      } else {
        c.classList.remove('active');
        c.classList.add('hidden');
        (c as HTMLElement).style.display = 'none';
      }
    });
  };

  // Initialize and synchronize with external / vanilla JS tab switchers (e.g. initDashboardTabs)
  useEffect(() => {
    if (typeof (window as any).initDashboardTabs === 'function') {
      (window as any).initDashboardTabs();
    }

    const handleExternalClick = (e: MouseEvent) => {
      const btn = (e.target as HTMLElement)?.closest?.('.dashboard-tabs .tab-btn');
      if (btn) {
        const targetTabId = btn.getAttribute('data-tab');
        if (targetTabId && targetTabId !== activeTab) {
          setActiveTab(targetTabId as any);
        }
      }
    };

    document.addEventListener('click', handleExternalClick);
    return () => {
      document.removeEventListener('click', handleExternalClick);
    };
  }, [activeTab]);

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

  // Filter user specific records
  const myProposals = proposals.filter(p => p.technicianId === currentUser.uid);
  const myPortfolio = portfolio.filter(p => p.technicianId === currentUser.uid);
  const myPayments = payments.filter(p => p.userId === currentUser.uid);

  // Calculate profile completion percentage
  let completionScore = 40;
  if (currentTechProfile?.bio && currentTechProfile.bio.length > 20) completionScore += 15;
  if (currentTechProfile?.whatsapp) completionScore += 15;
  if (currentTechProfile?.verificationStatus === 'approved') completionScore += 15;
  if (myPortfolio.length > 0) completionScore += 15;
  completionScore = Math.min(100, completionScore);

  const isVerified = Boolean(temSeloMZ && !isSeloExpired);
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
      laborCostMZN: budgetItems.find(i => (i.description || '').toLowerCase().includes('mão de obra'))?.cost || 0,
      materialsCostMZN: budgetItems.filter(i => !(i.description || '').toLowerCase().includes('mão de obra')).reduce((a, b) => a + (b.cost || 0), 0),
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
    handleTabClick('tab-propostas');
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

  const handleAddPortfolio = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPortTitle.trim()) return;

    addPortfolioItem({
      technicianId: currentUser.uid,
      title: newPortTitle.trim(),
      description: newPortDesc.trim() || 'Obra executada com excelência e conformidade com as normas técnicas de Moçambique.',
      category: newPortCategory,
      province: currentTechProfile?.province || 'Maputo Cidade',
      city: newPortCity.trim() || currentTechProfile?.city || 'Maputo',
      photos: [newPortImage],
      imageUrl: newPortImage,
      date: new Date().toISOString().split('T')[0]
    });

    setPortfolioSuccess(true);
    setTimeout(() => {
      setPortfolioSuccess(false);
      setIsAddPortfolioModalOpen(false);
      setNewPortTitle('');
      setNewPortDesc('');
    }, 1500);
  };

  // Filter requests based on search and category
  const filteredRequests = serviceRequests.filter(req => {
    const matchesSearch =
      !requestsSearch ||
      req.title.toLowerCase().includes(requestsSearch.toLowerCase()) ||
      req.description.toLowerCase().includes(requestsSearch.toLowerCase()) ||
      req.city.toLowerCase().includes(requestsSearch.toLowerCase());

    const matchesCategory =
      requestsCategoryFilter === 'all' || req.category === requestsCategoryFilter;

    return matchesSearch && matchesCategory;
  });

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
                      <span>Selo MZ: {seloDaysRemaining} {seloDaysRemaining === 1 ? 'dia' : 'dias'}</span>
                    </span>
                  ) : isSeloExpired ? (
                    <button
                      onClick={(e) => handleTabClick('tab-assinatura', e)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-300 bg-rose-950/80 px-3 py-0.5 rounded-full border border-rose-500/50 hover:bg-rose-900/50 transition cursor-pointer"
                    >
                      <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                      <span>Selo Expirado</span>
                    </button>
                  ) : isTrialValid ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-amber-500/40">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>Teste Grátis: {trialDaysRemaining} {trialDaysRemaining === 1 ? 'dia' : 'dias'}</span>
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
                onClick={(e) => handleTabClick('tab-orcamentos', e)}
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
        <div className="dashboard-tabs bg-white rounded-2xl p-2 border border-slate-200 shadow-xs flex flex-wrap items-center gap-1.5 overflow-x-auto">
          <button
            className={`tab-btn px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'tab-visao-geral' ? 'active bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
            data-tab="tab-visao-geral"
            onClick={(e) => handleTabClick('tab-visao-geral', e)}
          >
            <Wrench className="w-4 h-4" />
            <span>Visão Geral & Selo</span>
          </button>

          <button
            className={`tab-btn px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'tab-pedidos' ? 'active bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
            data-tab="tab-pedidos"
            onClick={(e) => handleTabClick('tab-pedidos', e)}
          >
            <Briefcase className="w-4 h-4" />
            <span>Pedidos de Serviços ({serviceRequests.length})</span>
          </button>

          <button
            className={`tab-btn px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'tab-propostas' ? 'active bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
            data-tab="tab-propostas"
            onClick={(e) => handleTabClick('tab-propostas', e)}
          >
            <FileText className="w-4 h-4" />
            <span>Minhas Propostas ({myProposals.length})</span>
          </button>

          <button
            className={`tab-btn px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'tab-orcamentos' ? 'active bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
            data-tab="tab-orcamentos"
            onClick={(e) => handleTabClick('tab-orcamentos', e)}
          >
            <Calculator className="w-4 h-4" />
            <span>Gerador de Orçamentos</span>
          </button>

          <button
            className={`tab-btn px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'tab-portfolio' ? 'active bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
            data-tab="tab-portfolio"
            onClick={(e) => handleTabClick('tab-portfolio', e)}
          >
            <Camera className="w-4 h-4" />
            <span>Portfólio de Obras ({myPortfolio.length})</span>
          </button>

          <button
            className={`tab-btn px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'tab-assinatura' ? 'active bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
            data-tab="tab-assinatura"
            onClick={(e) => handleTabClick('tab-assinatura', e)}
          >
            <DollarSign className="w-4 h-4" />
            <span>Assinatura & M-Pesa</span>
          </button>

          <button
            className={`tab-btn px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'tab-editar' ? 'active bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
            data-tab="tab-editar"
            onClick={(e) => handleTabClick('tab-editar', e)}
          >
            <Phone className="w-4 h-4" />
            <span>Editar Perfil & WhatsApp</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* ABA 1: VISÃO GERAL & SELO MZ */}
        {/* ========================================================================= */}
        <div
          id="tab-visao-geral"
          className={`tab-content ${activeTab === 'tab-visao-geral' ? 'active' : 'hidden'}`}
          style={{ display: activeTab === 'tab-visao-geral' ? 'block' : 'none' }}
        >
          <div className="space-y-6">
            {/* Quick Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Avaliação Média</span>
                <div className="flex items-center gap-1.5 mt-1">
                  <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                  <span className="text-xl sm:text-2xl font-black text-slate-900">{currentTechProfile?.rating?.toFixed(1) || '5.0'}</span>
                  <span className="text-xs text-slate-400">/ 5.0</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">{currentTechProfile?.reviewsCount || 0} avaliações reais</p>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pedidos Disponíveis</span>
                <div className="flex items-center gap-1.5 mt-1">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                  <span className="text-xl sm:text-2xl font-black text-slate-900">{serviceRequests.length}</span>
                </div>
                <button
                  onClick={(e) => handleTabClick('tab-pedidos', e)}
                  className="text-[11px] text-blue-600 font-bold hover:underline mt-1 inline-block"
                >
                  Ver oportunidades →
                </button>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Minhas Propostas</span>
                <div className="flex items-center gap-1.5 mt-1">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  <span className="text-xl sm:text-2xl font-black text-slate-900">{myProposals.length}</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">{myProposals.filter(p => p.status === 'accepted').length} propostas aceites</p>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Obras no Portfólio</span>
                <div className="flex items-center gap-1.5 mt-1">
                  <Camera className="w-5 h-5 text-emerald-600" />
                  <span className="text-xl sm:text-2xl font-black text-slate-900">{myPortfolio.length}</span>
                </div>
                <button
                  onClick={(e) => handleTabClick('tab-portfolio', e)}
                  className="text-[11px] text-emerald-600 font-bold hover:underline mt-1 inline-block"
                >
                  Gerir obras →
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Subscription Status Card */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Assinatura Mensal</span>
                  <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                    isSubActive ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {isSubActive ? '🟢 ATIVA' : '⏳ NÃO ATIVA'}
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
                  onClick={(e) => handleTabClick('tab-assinatura', e)}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Gerir Assinatura M-Pesa</span>
                </button>
              </div>

              {/* Verification Seal Status */}
              <div className="md:col-span-2 p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-blue-600" />
                    <span>Selo Oficial de Técnico Verificado TécnicaMZ</span>
                  </h3>
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    isVerified
                      ? 'bg-emerald-100 text-emerald-700'
                      : isSeloExpired
                      ? 'bg-rose-100 text-rose-700'
                      : isTrialValid
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    {isVerified
                      ? `✓ Selo MZ Ativo (${seloDaysRemaining} ${seloDaysRemaining === 1 ? 'dia' : 'dias'})`
                      : isSeloExpired
                      ? '✕ Selo Expirado'
                      : isTrialValid
                      ? `⏳ Teste Grátis (${trialDaysRemaining} ${trialDaysRemaining === 1 ? 'dia' : 'dias'})`
                      : 'Pendente de Documentação'}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Técnicos verificados passam por auditoria de identidade (BI / Passaporte) e certificados do IIM / UEM / Institutos Médios. O Selo MZ confere autoridade e prioridade no ranking regional.
                </p>

                {docUploadedSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Documento submetido para a equipa de auditoria com sucesso!</span>
                  </div>
                )}

                <form onSubmit={handleSubmitVerification} className="flex flex-col sm:flex-row gap-2 pt-2">
                  <input
                    type="text"
                    value={docNameInput}
                    onChange={e => setDocNameInput(e.target.value)}
                    placeholder="Nome do Certificado / Número do BI (Ex: Certificado_Eletrotecnica_IIM.pdf)"
                    className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    required
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shrink-0 flex items-center justify-center gap-1.5"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Submeter Documento</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* ABA 2: PEDIDOS DE SERVIÇOS DISPONÍVEIS */}
        {/* ========================================================================= */}
        <div
          id="tab-pedidos"
          className={`tab-content ${activeTab === 'tab-pedidos' ? 'active' : 'hidden'}`}
          style={{ display: activeTab === 'tab-pedidos' ? 'block' : 'none' }}
        >
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-black text-slate-900">Mural de Pedidos de Serviços</h2>
                <p className="text-xs text-slate-500">Clientes procuram técnicos qualificados. Envie sua proposta e feche serviços.</p>
              </div>

              {/* Search & Category Filter */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={requestsSearch}
                    onChange={e => setRequestsSearch(e.target.value)}
                    placeholder="Buscar pedidos..."
                    className="pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs w-44"
                  />
                </div>

                <select
                  value={requestsCategoryFilter}
                  onChange={e => setRequestsCategoryFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
                >
                  <option value="all">Todas as Categorias</option>
                  {TECHNICAL_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* List of Requests */}
            {filteredRequests.length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <Briefcase className="w-10 h-10 mx-auto text-slate-300" />
                <p className="text-sm font-bold">Nenhum pedido de serviço encontrado.</p>
                <p className="text-xs text-slate-500">Tente ajustar a busca ou verificar novamente em breve.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredRequests.map(req => {
                  const alreadyProposed = myProposals.some(p => p.requestId === req.id);
                  return (
                    <div
                      key={req.id}
                      className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md transition space-y-4 flex flex-col justify-between"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                            {req.category}
                          </span>
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                            req.urgency === 'urgent'
                              ? 'bg-rose-100 text-rose-700'
                              : req.urgency === 'high'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {req.urgency === 'urgent' ? '⚡ Urgente' : req.urgency === 'high' ? 'Alta prioridade' : 'Normal'}
                          </span>
                        </div>

                        <h3 className="text-sm font-black text-slate-900 leading-snug">{req.title}</h3>
                        <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">{req.description}</p>

                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-1">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            {req.city}, {req.province}
                          </span>
                          <span className="font-semibold text-slate-700">
                            👤 {req.clientName}
                          </span>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-bold">Orçamento Indicado</span>
                          <p className="text-sm font-black text-slate-900 font-mono">
                            {req.budgetMZN ? `${req.budgetMZN.toLocaleString()} MZN` : 'A combinar'}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          {alreadyProposed ? (
                            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                              ✓ Proposta Enviada
                            </span>
                          ) : (
                            <button
                              onClick={() => {
                                setSelectedRequest(req);
                                setProposalLabor(req.budgetMZN ? Math.round(req.budgetMZN * 0.6) : 2500);
                                setProposalMaterials(req.budgetMZN ? Math.round(req.budgetMZN * 0.4) : 1500);
                              }}
                              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>Enviar Proposta</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* ABA 3: MINHAS PROPOSTAS */}
        {/* ========================================================================= */}
        <div
          id="tab-propostas"
          className={`tab-content ${activeTab === 'tab-propostas' ? 'active' : 'hidden'}`}
          style={{ display: activeTab === 'tab-propostas' ? 'block' : 'none' }}
        >
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-black text-slate-900">Minhas Propostas Submetidas</h2>
                <p className="text-xs text-slate-500">Acompanhe o estado de aprovação e valores cotados aos clientes.</p>
              </div>

              <div className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl">
                <span>Total: {myProposals.length}</span>
                <span>•</span>
                <span className="text-emerald-600">Aceites: {myProposals.filter(p => p.status === 'accepted').length}</span>
              </div>
            </div>

            {myProposals.length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-3">
                <FileText className="w-12 h-12 mx-auto text-slate-300" />
                <p className="text-sm font-bold text-slate-700">Ainda não enviou nenhuma proposta.</p>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Aceda à aba "Pedidos de Serviços" e envie sua cotação profissional para fechar novas obras em Moçambique.
                </p>
                <button
                  onClick={(e) => handleTabClick('tab-pedidos', e)}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition inline-flex items-center gap-1.5 mt-2"
                >
                  <Briefcase className="w-4 h-4" />
                  <span>Explorar Pedidos de Serviços</span>
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
                {myProposals.map(prop => (
                  <div key={prop.id} className="p-5 bg-white hover:bg-slate-50/70 transition space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-black text-slate-900">{prop.requestTitle || 'Proposta Técnica de Obra'}</h4>
                        <p className="text-xs text-slate-500">Cliente: <strong className="text-slate-800">{prop.clientName || 'Cliente Particular'}</strong></p>
                      </div>

                      <span className={`self-start sm:self-auto text-xs font-bold px-3 py-1 rounded-full ${
                        prop.status === 'accepted'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : prop.status === 'rejected'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {prop.status === 'accepted'
                          ? '🎉 Aceite pelo Cliente!'
                          : prop.status === 'rejected'
                          ? '✕ Não Selecionada'
                          : '⏳ Aguardando Decisão'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50 rounded-xl text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Mão de Obra</span>
                        <p className="font-mono font-bold text-slate-800">{prop.laborCostMZN.toLocaleString()} MZN</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Materiais</span>
                        <p className="font-mono font-bold text-slate-800">{prop.materialsCostMZN.toLocaleString()} MZN</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Valor Total</span>
                        <p className="font-mono font-black text-blue-700">{prop.totalCostMZN.toLocaleString()} MZN</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Prazo Estimado</span>
                        <p className="font-semibold text-slate-800">{prop.estimatedDays || '2 dias'}</p>
                      </div>
                    </div>

                    {prop.notes && (
                      <p className="text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200/80">
                        💬 <span className="italic">{prop.notes}</span>
                      </p>
                    )}

                    {prop.status === 'accepted' && (
                      <div className="pt-1 flex items-center gap-2">
                        {onOpenMessages && (
                          <button
                            onClick={() => onOpenMessages(prop.clientId, prop.clientName || 'Cliente', 'client')}
                            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Conversar com Cliente</span>
                          </button>
                        )}
                        <a
                          href={`https://wa.me/?text=${encodeURIComponent(`Olá! Sou ${currentTechProfile?.name || currentUser.name} do TécnicaMZ Pro a respeito da proposta aprovada para "${prop.requestTitle}".`)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Falar no WhatsApp</span>
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* ABA 4: GERADOR DE ORÇAMENTOS */}
        {/* ========================================================================= */}
        <div
          id="tab-orcamentos"
          className={`tab-content ${activeTab === 'tab-orcamentos' ? 'active' : 'hidden'}`}
          style={{ display: activeTab === 'tab-orcamentos' ? 'block' : 'none' }}
        >
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
                        title="Remover item"
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
            <div className="p-5 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
                    `Técnico: ${currentTechProfile?.name || currentUser.name}\n\n` +
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
        </div>

        {/* ========================================================================= */}
        {/* ABA 5: PORTFÓLIO DE OBRAS */}
        {/* ========================================================================= */}
        <div
          id="tab-portfolio"
          className={`tab-content ${activeTab === 'tab-portfolio' ? 'active' : 'hidden'}`}
          style={{ display: activeTab === 'tab-portfolio' ? 'block' : 'none' }}
        >
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-black text-slate-900">Portfólio de Obras & Projetos</h2>
                <p className="text-xs text-slate-500">Adicione fotografias de instalações e manutenções concluídas para gerar confiança.</p>
              </div>

              <button
                onClick={() => setIsAddPortfolioModalOpen(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar Nova Obra</span>
              </button>
            </div>

            {myPortfolio.length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-3">
                <Camera className="w-12 h-12 mx-auto text-slate-300" />
                <p className="text-sm font-bold text-slate-700">Seu portfólio ainda está vazio.</p>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Técnicos com obras fotográficas no portfólio recebem 3x mais solicitações de orçamento.
                </p>
                <button
                  onClick={() => setIsAddPortfolioModalOpen(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition inline-flex items-center gap-1.5 mt-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Publicar Primeira Obra (+15% Perfil)</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {myPortfolio.map(item => (
                  <div
                    key={item.id}
                    className="group relative rounded-2xl overflow-hidden border border-slate-200 bg-white hover:shadow-lg transition flex flex-col justify-between"
                  >
                    <div className="aspect-video w-full bg-slate-100 relative overflow-hidden">
                      <img
                        src={item.imageUrl || item.photos?.[0] || 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&auto=format&fit=crop&q=60'}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        referrerPolicy="no-referrer"
                      />
                      <span className="absolute top-2 left-2 text-[10px] font-bold bg-slate-900/80 backdrop-blur-xs text-white px-2 py-0.5 rounded-md">
                        {item.category}
                      </span>
                      <button
                        onClick={() => deletePortfolioItem(item.id)}
                        className="absolute top-2 right-2 p-1.5 bg-rose-600/90 hover:bg-rose-700 text-white rounded-lg opacity-0 group-hover:opacity-100 transition shadow-xs"
                        title="Apagar obra do portfólio"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="p-4 space-y-1.5 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="text-sm font-black text-slate-900 line-clamp-1">{item.title}</h4>
                        <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{item.description}</p>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                        <span>📍 {item.city || 'Maputo'}, {item.province}</span>
                        <span>{item.date || 'Recente'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* ABA 6: ASSINATURA & M-PESA */}
        {/* ========================================================================= */}
        <div
          id="tab-assinatura"
          className={`tab-content ${activeTab === 'tab-assinatura' ? 'active' : 'hidden'}`}
          style={{ display: activeTab === 'tab-assinatura' ? 'block' : 'none' }}
        >
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-black text-slate-900">Assinatura Profissional & Pagamentos M-Pesa</h2>
                <p className="text-xs text-slate-500">Mantenha seu perfil em destaque nos motores de busca de Moçambique.</p>
              </div>

              <span className={`text-xs font-black uppercase px-3 py-1 rounded-full ${
                isSubActive ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {isSubActive ? '🟢 ASSINATURA ATIVA' : '⏳ ASSINATURA PENDENTE'}
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Payment Instructions & Number */}
              <div className="p-6 rounded-3xl bg-slate-900 text-white space-y-4">
                <div className="flex items-center gap-2 text-emerald-400">
                  <CreditCard className="w-5 h-5" />
                  <h3 className="text-sm font-black uppercase tracking-wider">Dados Oficiais para Envio</h3>
                </div>

                <div className="space-y-3 bg-white/5 p-4 rounded-2xl border border-white/10 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-white/10">
                    <span className="text-slate-400">Carteira Móvel:</span>
                    <strong className="text-white">M-Pesa (Vodacom) / e-Mola (Movitel)</strong>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-white/10">
                    <span className="text-slate-400">M-Pesa Oficial:</span>
                    <strong className="text-emerald-400 font-mono text-sm">
                      {settings?.paymentMethods?.mpesaNumber || settings?.mpesaNumber || '851949159'} ({settings?.paymentMethods?.mpesaName || settings?.mpesaName || 'André Zefanias Júnior'})
                    </strong>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-white/10">
                    <span className="text-slate-400">e-Mola Oficial:</span>
                    <strong className="text-amber-400 font-mono text-sm">
                      {settings?.paymentMethods?.emolaNumber || '872943159'} ({settings?.paymentMethods?.emolaName || 'André Zefanias Júnior'})
                    </strong>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-400">Titular das Contas:</span>
                    <strong className="text-white">{settings?.paymentMethods?.mpesaName || 'André Zefanias Júnior'}</strong>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  1. Abra o menu M-Pesa (*150#) ou e-Mola (*898#).<br />
                  2. Transfira o valor do plano para o número acima.<br />
                  3. Guarde o SMS de confirmação e cole o <strong>Código da Transação</strong> no formulário ao lado.
                </p>
              </div>

              {/* Submit Payment Form */}
              <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-4">
                <h3 className="text-sm font-black text-slate-900">Validar Comprovativo de Pagamento</h3>

                {subSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Comprovativo submetido com sucesso! A auditoria ativará o plano em breve.</span>
                  </div>
                )}

                <form onSubmit={handleSubPayment} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Selecione o Plano</label>
                    <select
                      value={selectedPlanId}
                      onChange={e => setSelectedPlanId(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                    >
                      {plans.map(p => (
                        <option key={p.id} value={p.id}>{p.name} - {p.priceMZN} MZN/mês</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Método Utilizado</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setSubMethod('mpesa')}
                        className={`py-2 px-3 rounded-xl text-xs font-bold border text-center transition ${
                          subMethod === 'mpesa' ? 'bg-rose-600 text-white border-rose-600' : 'bg-white text-slate-700 border-slate-200'
                        }`}
                      >
                        M-Pesa (Vodacom)
                      </button>
                      <button
                        type="button"
                        onClick={() => setSubMethod('emola')}
                        className={`py-2 px-3 rounded-xl text-xs font-bold border text-center transition ${
                          subMethod === 'emola' ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-slate-700 border-slate-200'
                        }`}
                      >
                        e-Mola (Movitel)
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Código da Transação SMS</label>
                    <input
                      type="text"
                      value={txCode}
                      onChange={e => setTxCode(e.target.value)}
                      placeholder="Ex: 8H93KL12MZ"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold uppercase"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Check className="w-4 h-4" />
                    <span>Submeter Comprovativo M-Pesa</span>
                  </button>
                </form>
              </div>
            </div>

            {/* Payment history table */}
            {myPayments.length > 0 && (
              <div className="space-y-2 pt-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">Histórico de Transações</h4>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
                  {myPayments.map(pay => (
                    <div key={pay.id} className="p-3.5 bg-white flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-slate-900">{pay.planName}</p>
                        <p className="text-[11px] text-slate-500 font-mono">Cód: {pay.transactionCode} • {pay.method.toUpperCase()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono font-bold text-slate-900">{pay.amountMZN} MZN</p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          pay.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {pay.status === 'approved' ? 'Aprovado' : 'Em Análise'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* ABA 7: EDITAR PERFIL & WHATSAPP */}
        {/* ========================================================================= */}
        <div
          id="tab-editar"
          className={`tab-content ${activeTab === 'tab-editar' ? 'active' : 'hidden'}`}
          style={{ display: activeTab === 'tab-editar' ? 'block' : 'none' }}
        >
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-black text-slate-900">Configurações de Contato & WhatsApp</h2>
                <p className="text-xs text-slate-500">Controle a exibição do botão direto de WhatsApp e informações visíveis aos clientes.</p>
              </div>

              {profileSuccessMsg && (
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Perfil atualizado com sucesso!</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nome de Exibição</label>
                <input
                  type="text"
                  value={currentTechProfile?.name || ''}
                  onChange={e => {
                    updateCurrentTechProfile({ name: e.target.value });
                    setProfileSuccessMsg(true);
                    setTimeout(() => setProfileSuccessMsg(false), 2000);
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Número de WhatsApp (+258)</label>
                <input
                  type="text"
                  value={currentTechProfile?.whatsapp || ''}
                  onChange={e => {
                    updateCurrentTechProfile({ whatsapp: e.target.value });
                    setProfileSuccessMsg(true);
                    setTimeout(() => setProfileSuccessMsg(false), 2000);
                  }}
                  placeholder="840000000 ou +258840000000"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Província de Atuação</label>
                <select
                  value={currentTechProfile?.province || 'Maputo Cidade'}
                  onChange={e => {
                    updateCurrentTechProfile({ province: e.target.value });
                    setProfileSuccessMsg(true);
                    setTimeout(() => setProfileSuccessMsg(false), 2000);
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold"
                >
                  {MOZAMBIQUE_PROVINCES.map(prov => (
                    <option key={prov} value={prov}>{prov}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Cidade / Distrito</label>
                <input
                  type="text"
                  value={currentTechProfile?.city || ''}
                  onChange={e => {
                    updateCurrentTechProfile({ city: e.target.value });
                    setProfileSuccessMsg(true);
                    setTimeout(() => setProfileSuccessMsg(false), 2000);
                  }}
                  placeholder="Ex: Maputo, Matola, Beira"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold"
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-emerald-950">Exibir Botão Flutuante de WhatsApp no Perfil</p>
                <p className="text-[11px] text-emerald-800">Permite que clientes iniciem conversas com 1 clique diretamente pelo WhatsApp.</p>
              </div>
              <input
                type="checkbox"
                checked={currentTechProfile?.showWhatsappButton ?? true}
                onChange={e => {
                  updateCurrentTechProfile({ showWhatsappButton: e.target.checked });
                  setProfileSuccessMsg(true);
                  setTimeout(() => setProfileSuccessMsg(false), 2000);
                }}
                className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Biografia & Especialidades Técnicas</label>
              <textarea
                rows={4}
                value={currentTechProfile?.bio || ''}
                onChange={e => {
                  updateCurrentTechProfile({ bio: e.target.value });
                  setProfileSuccessMsg(true);
                  setTimeout(() => setProfileSuccessMsg(false), 2000);
                }}
                placeholder="Descreva suas qualificações, anos de experiência e ferramentas profissionais..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm"
              />
            </div>

            {/* Banner do Guia de Integração & Tutorial do App */}
            <div className="pt-4 border-t border-slate-100">
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50/70 border border-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-black text-slate-900">
                      Guia de Integração do Aplicativo (Onboarding Tour)
                    </h3>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Reveja o passo a passo sobre o Teste Grátis de 3 dias, Mural de Pedidos, Ferramentas EDM e Ativação do Selo MZ.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={resetOnboardingTour}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-black rounded-xl text-xs flex items-center gap-2 shadow-sm transition cursor-pointer shrink-0"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Ver Tutorial do App Novamente</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QR Digital Card Modal */}
      <DigitalBusinessCard
        technician={currentTechProfile}
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
      />

      {/* Proposal Submission Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black">Enviar Proposta de Serviço</h3>
                <p className="text-xs text-slate-400 mt-0.5">{selectedRequest.title}</p>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitProposal} className="p-6 space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
                <p className="text-slate-500">Cliente: <strong className="text-slate-800">{selectedRequest.clientName}</strong></p>
                <p className="text-slate-500">Local: <strong className="text-slate-800">{selectedRequest.city}, {selectedRequest.province}</strong></p>
                {selectedRequest.budgetMZN && (
                  <p className="text-slate-500">Orçamento Indicado: <strong className="text-blue-600 font-mono">{selectedRequest.budgetMZN.toLocaleString()} MZN</strong></p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mão de Obra (MZN)</label>
                  <input
                    type="number"
                    value={proposalLabor}
                    onChange={e => setProposalLabor(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Materiais Estimados (MZN)</label>
                  <input
                    type="number"
                    value={proposalMaterials}
                    onChange={e => setProposalMaterials(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold"
                    required
                  />
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between text-xs">
                <span className="font-bold text-blue-950">Total da Proposta:</span>
                <span className="font-mono font-black text-blue-700 text-sm">
                  {(proposalLabor + proposalMaterials).toLocaleString()} MZN
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Prazo de Conclusão Estimado</label>
                <input
                  type="text"
                  value={proposalDays}
                  onChange={e => setProposalDays(e.target.value)}
                  placeholder="Ex: 2 dias úteis, 1 semana"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Observações Técnicas / Garantia</label>
                <textarea
                  rows={3}
                  value={proposalNotes}
                  onChange={e => setProposalNotes(e.target.value)}
                  placeholder="Descreva detalhes dos materiais, procedimentos de segurança e tempo de garantia..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedRequest(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submeter Proposta</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Portfolio Item Modal */}
      {isAddPortfolioModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <h3 className="text-sm font-black">Publicar Obra no Portfólio</h3>
              <button
                onClick={() => setIsAddPortfolioModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddPortfolio} className="p-6 space-y-4">
              {portfolioSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold">
                  Obra publicada com sucesso no seu portfólio!
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Título do Trabalho</label>
                <input
                  type="text"
                  value={newPortTitle}
                  onChange={e => setNewPortTitle(e.target.value)}
                  placeholder="Ex: Instalação Solar Residencial 5kVA"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Categoria</label>
                  <select
                    value={newPortCategory}
                    onChange={e => setNewPortCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  >
                    {TECHNICAL_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Cidade</label>
                  <input
                    type="text"
                    value={newPortCity}
                    onChange={e => setNewPortCity(e.target.value)}
                    placeholder="Maputo, Matola..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Foto da Obra (URL)</label>
                <input
                  type="url"
                  value={newPortImage}
                  onChange={e => setNewPortImage(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                  required
                />
                <div className="flex gap-2 mt-1.5 overflow-x-auto text-[10px]">
                  <button
                    type="button"
                    onClick={() => setNewPortImage('https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&auto=format&fit=crop&q=60')}
                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 whitespace-nowrap"
                  >
                    Solar
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewPortImage('https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=60')}
                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 whitespace-nowrap"
                  >
                    Painel Elétrico
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewPortImage('https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=60')}
                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 whitespace-nowrap"
                  >
                    Redes / TI
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Descrição dos Serviços Realizados</label>
                <textarea
                  rows={3}
                  value={newPortDesc}
                  onChange={e => setNewPortDesc(e.target.value)}
                  placeholder="Detalhes dos materiais utilizados, desafios técnicos e resultado final..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Camera className="w-4 h-4" />
                <span>Salvar no Portfólio</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
