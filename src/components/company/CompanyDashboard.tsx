import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { UserAvatar } from '../common/UserAvatar';
import {
  CompanyProfile,
  JobOpening,
  JobApplication,
  TechnicianProfile,
  ApplicationStatus
} from '../../types';
import {
  Building2,
  Briefcase,
  Users,
  ShieldCheck,
  Plus,
  Star,
  MapPin,
  Clock,
  Phone,
  Mail,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MessageSquare,
  Sparkles,
  Search,
  Filter,
  ExternalLink,
  ChevronRight,
  Eye,
  FileText,
  Trash2,
  Edit3
} from 'lucide-react';
import { NewCompanyJobModal } from './NewCompanyJobModal';
import { CompanyVerificationModal } from './CompanyVerificationModal';
import { TopBackNav } from '../common/TopBackNav';

interface CompanyDashboardProps {
  onNavigateTab: (tab: string) => void;
  onOpenMessages?: (userId: string, userName: string, role: string) => void;
}

export const CompanyDashboard: React.FC<CompanyDashboardProps> = ({ onNavigateTab, onOpenMessages }) => {
  const { currentUser, currentCompanyProfile, updateCurrentCompanyProfile } = useAuth();
  const {
    jobs,
    applications,
    technicians,
    updateJobStatus,
    updateApplicationStatus,
    startOrGetConversation
  } = useData();

  const [activeTab, setActiveTab] = useState<'overview' | 'my_jobs' | 'applications' | 'talents' | 'profile'>('overview');
  const [isNewJobModalOpen, setIsNewJobModalOpen] = useState(false);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);

  // Filters for applications
  const [appStatusFilter, setAppStatusFilter] = useState<string>('all');
  const [selectedJobIdFilter, setSelectedJobIdFilter] = useState<string>('all');

  // Filters for talents
  const [talentSearch, setTalentSearch] = useState('');
  const [talentSpecialty, setTalentSpecialty] = useState('all');
  const [talentProvince, setTalentProvince] = useState('all');

  // Selected candidate modal state
  const [selectedCandidate, setSelectedCandidate] = useState<JobApplication | null>(null);

  if (!currentUser || currentUser.role !== 'company') {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 rounded-3xl bg-purple-100 text-purple-600 flex items-center justify-center mx-auto mb-4">
          <Building2 className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Acesso Restrito a Empresas</h2>
        <p className="text-sm text-slate-500 mt-2 mb-6">
          Para aceder a este painel, inicie sessão com uma conta de perfil "Empresa".
        </p>
        <button
          onClick={() => onNavigateTab('home')}
          className="px-6 py-2.5 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 transition"
        >
          Voltar ao Início
        </button>
      </div>
    );
  }

  const companyJobs = jobs.filter(j => j.companyId === currentUser.uid);
  const companyApps = applications.filter(a => a.companyId === currentUser.uid);

  // Filtered applications
  const filteredApps = companyApps.filter(app => {
    const matchStatus = appStatusFilter === 'all' || app.status === appStatusFilter;
    const matchJob = selectedJobIdFilter === 'all' || app.jobId === selectedJobIdFilter;
    return matchStatus && matchJob;
  });

  // Filtered talents
  const filteredTalents = technicians.filter(tech => {
    const matchSearch =
      talentSearch === '' ||
      tech.name.toLowerCase().includes(talentSearch.toLowerCase()) ||
      tech.specialties.some(s => s.toLowerCase().includes(talentSearch.toLowerCase()));
    const matchSpec = talentSpecialty === 'all' || tech.specialties.includes(talentSpecialty);
    const matchProv = talentProvince === 'all' || tech.province === talentProvince;
    return matchSearch && matchSpec && matchProv;
  });

  const isVerified = currentCompanyProfile?.verificationStatus === 'verified';
  const isPendingVerification = currentCompanyProfile?.verificationStatus === 'pending';

  return (
    <div className="min-h-screen bg-slate-900/5 py-6 sm:py-8 px-3 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Top Back Navigation Bar */}
        <TopBackNav
          title="Painel Corporativo & Recrutamento"
          category="Minha Empresa"
          onBack={() => onNavigateTab('community')}
          backLabel="Voltar ao Mural"
          rightAction={
            <button
              onClick={() => setIsNewJobModalOpen(true)}
              className="px-3 py-1.5 sm:px-4 sm:py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-sm active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Publicar Vaga</span>
            </button>
          }
        />

        {/* Top Header Card */}
        <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-purple-900/40 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="flex items-start sm:items-center gap-5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white p-1 shadow-lg shrink-0 overflow-hidden">
                <UserAvatar
                  src={currentCompanyProfile?.logoUrl || currentUser?.avatarUrl || currentUser?.photoURL}
                  name={currentCompanyProfile?.companyName || currentUser.name}
                  role="company"
                  className="w-full h-full rounded-xl object-cover"
                />
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white">
                    {currentCompanyProfile?.companyName || currentUser.name}
                  </h1>
                  {isVerified ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-300 bg-emerald-950/80 px-3 py-0.5 rounded-full border border-emerald-500/50">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>NUIT Verificado</span>
                    </span>
                  ) : isPendingVerification ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-950/80 px-3 py-0.5 rounded-full border border-amber-500/50">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>Verificação em Análise</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => setIsVerificationModalOpen(true)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-200 bg-purple-800 hover:bg-purple-700 px-3 py-0.5 rounded-full border border-purple-600 transition"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-purple-300" />
                      <span>Verificar NUIT da Empresa</span>
                    </button>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-purple-200">
                  {currentCompanyProfile?.commercialName} • {currentCompanyProfile?.industry || 'Engenharia & Construção'} •{' '}
                  <span className="font-mono text-white/90">NUIT: {currentCompanyProfile?.nuit || 'Pendente'}</span>
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-purple-400" />
                    {currentCompanyProfile?.city || 'Maputo'}, {currentCompanyProfile?.province || 'Maputo Cidade'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <strong>{currentCompanyProfile?.rating?.toFixed(1) || '5.0'}</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Top Quick Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setIsNewJobModalOpen(true)}
                className="px-5 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-purple-600/30"
              >
                <Plus className="w-4 h-4" />
                <span>Publicar Nova Vaga</span>
              </button>
            </div>
          </div>

          {/* Quick stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-slate-800/80">
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
              <p className="text-[11px] font-semibold text-purple-200">Vagas Publicadas</p>
              <p className="text-xl font-black text-white mt-1">{companyJobs.length}</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
              <p className="text-[11px] font-semibold text-purple-200">Candidaturas Totais</p>
              <p className="text-xl font-black text-white mt-1">{companyApps.length}</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
              <p className="text-[11px] font-semibold text-purple-200">Técnicos Contratados</p>
              <p className="text-xl font-black text-emerald-400 mt-1">
                {companyApps.filter(a => a.status === 'Aprovada').length}
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
              <p className="text-[11px] font-semibold text-purple-200">Em Análise / Entrevista</p>
              <p className="text-xl font-black text-amber-400 mt-1">
                {companyApps.filter(a => a.status === 'Em análise' || a.status === 'Entrevista').length}
              </p>
            </div>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="bg-white rounded-2xl p-2 border border-slate-200 shadow-xs flex flex-wrap items-center gap-1.5 overflow-x-auto">
          {[
            { id: 'overview', label: 'Visão Geral & Métricas', icon: <Building2 className="w-4 h-4" /> },
            { id: 'my_jobs', label: `Minhas Vagas (${companyJobs.length})`, icon: <Briefcase className="w-4 h-4" /> },
            { id: 'applications', label: `Candidaturas (${companyApps.length})`, icon: <Users className="w-4 h-4" /> },
            { id: 'talents', label: 'Banco de Talentos MZ', icon: <Search className="w-4 h-4" /> },
            { id: 'profile', label: 'Dados da Empresa & NUIT', icon: <ShieldCheck className="w-4 h-4" /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick alert banner if NUIT is unverified */}
            {!isVerified && !isPendingVerification && (
              <div className="p-5 rounded-3xl bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-transparent border border-purple-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-purple-950">Valide o NUIT da sua Empresa</h3>
                    <p className="text-xs text-purple-800 mt-0.5">
                      Empresas com selo de verificação recebem 3x mais candidaturas de técnicos seniores e aparecem no topo do diretório.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsVerificationModalOpen(true)}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition shadow-xs shrink-0"
                >
                  Enviar Documentos Agora
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Jobs */}
              <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-purple-600" />
                    <span>Vagas em Andamento</span>
                  </h3>
                  <button
                    onClick={() => setActiveTab('my_jobs')}
                    className="text-xs font-bold text-purple-600 hover:underline flex items-center gap-1"
                  >
                    <span>Ver todas</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {companyJobs.length === 0 ? (
                  <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-2xl p-6">
                    <Briefcase className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs text-slate-500 font-medium">Nenhuma vaga publicada ainda.</p>
                    <button
                      onClick={() => setIsNewJobModalOpen(true)}
                      className="mt-3 px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 transition"
                    >
                      Publicar Primeira Vaga
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {companyJobs.slice(0, 3).map(job => (
                      <div
                        key={job.id}
                        className="p-4 rounded-2xl border border-slate-100 hover:border-purple-200 hover:bg-purple-50/20 transition flex items-center justify-between gap-4"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                              {job.category}
                            </span>
                            <span className="text-[10px] font-bold text-slate-500">
                              {job.city}, {job.province}
                            </span>
                          </div>
                          <h4 className="text-xs sm:text-sm font-bold text-slate-800 mt-1">{job.title}</h4>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {job.applicationsCount} candidatos inscritos • Limite: {job.deadlineDate}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedJobIdFilter(job.id);
                              setActiveTab('applications');
                            }}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-purple-600 hover:text-white rounded-xl text-xs font-bold text-slate-700 transition flex items-center gap-1"
                          >
                            <span>Ver Inscritos</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recruitment AI Suggestions */}
              <div className="bg-gradient-to-br from-slate-900 to-purple-950 text-white rounded-3xl p-6 border border-slate-800 shadow-xs space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-600/30 text-purple-400 border border-purple-500/30 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-purple-300">Sara IA Recrutadora</h3>
                    <p className="text-[11px] text-slate-400">Sugestões de técnicos em Moçambique</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-slate-300 space-y-2">
                  <p className="font-semibold text-white">💡 Dica de Contratação Rápida:</p>
                  <p className="leading-relaxed">
                    Existem <strong>{technicians.filter(t => t.verificationStatus === 'approved').length} técnicos certificados</strong> disponíveis em Maputo, Sofala e Tete com experiência comprovada em quadros de distribuição e inversores solares.
                  </p>
                </div>

                <button
                  onClick={() => setActiveTab('talents')}
                  className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Explorar Banco de Talentos</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MY JOBS */}
        {activeTab === 'my_jobs' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-black text-slate-900">Vagas Publicadas pela Empresa</h2>
                <p className="text-xs text-slate-500">Gerencie status, inscrições e encerramentos de processos seletivos.</p>
              </div>
              <button
                onClick={() => setIsNewJobModalOpen(true)}
                className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Publicar Nova Vaga</span>
              </button>
            </div>

            {companyJobs.length === 0 ? (
              <div className="text-center py-12">
                <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-700">Nenhuma vaga ativa</p>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Publique vagas técnicas para eletricistas, instaladores solares, mecânicos e outros profissionais.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {companyJobs.map(job => (
                  <div
                    key={job.id}
                    className="p-5 rounded-2xl border border-slate-200 hover:border-purple-300 transition flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                          {job.category}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          job.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {job.status === 'active' ? '🟢 Ativa' : '⚪ Encerrada'}
                        </span>
                        <span className="text-[11px] font-medium text-slate-500">
                          {job.contractType} • {job.workplaceType}
                        </span>
                      </div>

                      <h3 className="text-base font-black text-slate-900">{job.title}</h3>
                      <p className="text-xs text-slate-600 line-clamp-2">{job.description}</p>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                        <span>📍 {job.city}, {job.province}</span>
                        <span>💰 <strong className="text-slate-800">{job.salaryDisplay}</strong></span>
                        <span>👥 <strong>{job.applicationsCount}</strong> candidatos</span>
                        <span>📅 Prazo: {job.deadlineDate}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          setSelectedJobIdFilter(job.id);
                          setActiveTab('applications');
                        }}
                        className="px-3.5 py-2 bg-purple-600 text-white hover:bg-purple-700 rounded-xl text-xs font-bold transition flex items-center gap-1"
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>Candidatos ({job.applicationsCount})</span>
                      </button>

                      <button
                        onClick={() => updateJobStatus(job.id, job.status === 'active' ? 'closed' : 'active')}
                        className="px-3 py-2 border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition"
                      >
                        {job.status === 'active' ? 'Pausar/Encerrar' : 'Reativar Vaga'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: APPLICATIONS & CANDIDATES TRIAGE */}
        {activeTab === 'applications' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-black text-slate-900">Triagem de Candidaturas</h2>
                <p className="text-xs text-slate-500">
                  Acompanhe e classifique os técnicos por status do funil seletivo.
                </p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={selectedJobIdFilter}
                  onChange={e => setSelectedJobIdFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                >
                  <option value="all">Todas as Vagas</option>
                  {companyJobs.map(j => (
                    <option key={j.id} value={j.id}>{j.title}</option>
                  ))}
                </select>

                <select
                  value={appStatusFilter}
                  onChange={e => setAppStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                >
                  <option value="all">Todos os Status</option>
                  <option value="Recebida">Recebida</option>
                  <option value="Em análise">Em análise</option>
                  <option value="Selecionada">Selecionada</option>
                  <option value="Entrevista">Entrevista</option>
                  <option value="Aprovada">Aprovada (Contratado)</option>
                  <option value="Rejeitada">Rejeitada</option>
                </select>
              </div>
            </div>

            {filteredApps.length === 0 ? (
              <div className="text-center py-12 text-slate-400 space-y-2">
                <Users className="w-10 h-10 mx-auto text-slate-300" />
                <p className="text-sm font-bold text-slate-700">Nenhuma candidatura encontrada com estes filtros.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredApps.map(app => (
                  <div
                    key={app.id}
                    className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-purple-300 transition space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-black text-sm shrink-0">
                          {app.technicianName.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-black text-slate-900">{app.technicianName}</h4>
                            {app.technicianVerified && (
                              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.2 rounded border border-blue-200 flex items-center gap-0.5">
                                <CheckCircle2 className="w-3 h-3 text-blue-500" /> Verificado
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500">
                            Vaga: <strong className="text-slate-700">{app.jobTitle}</strong> • {app.technicianProvince}
                          </p>
                        </div>
                      </div>

                      {/* Status selector badge */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-500">Status:</span>
                        <select
                          value={app.status}
                          onChange={e => updateApplicationStatus(app.id, e.target.value as ApplicationStatus)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${
                            app.status === 'Aprovada'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : app.status === 'Entrevista' || app.status === 'Selecionada'
                              ? 'bg-purple-50 text-purple-800 border-purple-300'
                              : app.status === 'Rejeitada'
                              ? 'bg-rose-50 text-rose-800 border-rose-300'
                              : 'bg-slate-100 text-slate-800 border-slate-300'
                          }`}
                        >
                          <option value="Recebida">Recebida</option>
                          <option value="Em análise">Em análise</option>
                          <option value="Selecionada">Selecionada</option>
                          <option value="Entrevista">Entrevista</option>
                          <option value="Aprovada">Aprovada (Contratado)</option>
                          <option value="Rejeitada">Rejeitada</option>
                        </select>
                      </div>
                    </div>

                    {/* Candidate Pitch */}
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 space-y-1">
                      <p className="font-semibold text-slate-900">Carta de Apresentação:</p>
                      <p className="italic">{app.coverLetter}</p>
                    </div>

                    {/* Contact & Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
                      <div className="flex flex-wrap items-center gap-4 text-slate-600">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          {app.technicianPhone}
                        </span>
                        <span className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          {app.technicianEmail}
                        </span>
                        <span>⭐ Experiência: {app.technicianExperienceYears} anos</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {app.technicianPhone && (
                          <a
                            href={`https://wa.me/${(app.technicianPhone || '').replace(/\D/g, '')}?text=${encodeURIComponent(
                              `Olá ${app.technicianName}, somos da empresa ${currentCompanyProfile?.companyName} e gostamos da sua candidatura na TécnicaMZ para a vaga "${app.jobTitle}".`
                            )}`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1 transition"
                          >
                            <span>WhatsApp</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}

                        <button
                          onClick={() => {
                            if (onOpenMessages) {
                              onOpenMessages(app.technicianId, app.technicianName, 'technician');
                            } else {
                              startOrGetConversation(app.technicianId, app.technicianName, 'technician', {
                                type: 'job',
                                title: app.jobTitle
                              });
                              onNavigateTab('messages');
                            }
                          }}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold flex items-center gap-1 transition"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>Mensagem</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: TALENT POOL */}
        {activeTab === 'talents' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div>
              <h2 className="text-lg font-black text-slate-900">Banco de Talentos & Especialistas</h2>
              <p className="text-xs text-slate-500">
                Explore profissionais qualificados e convide técnicos diretamente para seus projetos.
              </p>
            </div>

            {/* Talent Search filters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  value={talentSearch}
                  onChange={e => setTalentSearch(e.target.value)}
                  placeholder="Buscar por nome ou habilidade..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <select
                  value={talentProvince}
                  onChange={e => setTalentProvince(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                >
                  <option value="all">Todas as Províncias</option>
                  <option value="Maputo Cidade">Maputo Cidade</option>
                  <option value="Maputo Província">Maputo Província</option>
                  <option value="Sofala">Sofala (Beira)</option>
                  <option value="Nampula">Nampula</option>
                  <option value="Tete">Tete</option>
                  <option value="Cabo Delgado">Cabo Delgado</option>
                </select>
              </div>

              <div>
                <select
                  value={talentSpecialty}
                  onChange={e => setTalentSpecialty(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                >
                  <option value="all">Todas as Especialidades</option>
                  <option value="Eletricidade">Eletricidade</option>
                  <option value="Energia Solar">Energia Solar</option>
                  <option value="Climatização & AC">Climatização & AC</option>
                  <option value="Canalização">Canalização</option>
                  <option value="Construção Civil">Construção Civil</option>
                </select>
              </div>
            </div>

            {/* Grid of Talents */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTalents.map(tech => (
                <div
                  key={tech.userId}
                  className="p-5 rounded-2xl border border-slate-200 hover:border-purple-300 hover:shadow-md transition bg-white flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-black text-sm shrink-0">
                        {tech.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-900">{tech.name}</h4>
                        <p className="text-xs text-purple-600 font-semibold">{tech.specialties.join(', ')}</p>
                        <p className="text-[11px] text-slate-500">📍 {tech.city}, {tech.province}</p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2">{tech.bio}</p>

                    <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                      <span className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <strong>{tech.rating.toFixed(1)}</strong> ({tech.reviewsCount})
                      </span>
                      <span className="text-slate-500 font-medium">{tech.experienceYears} anos exp.</span>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center gap-2">
                    <button
                      onClick={() => {
                        startOrGetConversation(tech.userId, tech.name, 'technician', {
                          type: 'direct',
                          title: 'Contato Corporativo'
                        });
                        onNavigateTab('messages');
                      }}
                      className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Falar</span>
                    </button>
                    {tech.whatsapp && (
                      <a
                        href={`https://wa.me/${tech.whatsapp}?text=${encodeURIComponent(
                          `Olá ${tech.name}, somos da empresa ${currentCompanyProfile?.companyName} e encontramos seu perfil no banco de talentos TécnicaMZ.`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition"
                        title="WhatsApp"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: COMPANY PROFILE & NUIT */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-6 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-black text-slate-900">Perfil Corporativo & Dados Fiscais</h2>
                <p className="text-xs text-slate-500">Mantenha os dados da sua empresa atualizados para maior credibilidade.</p>
              </div>

              {!isVerified && (
                <button
                  onClick={() => setIsVerificationModalOpen(true)}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Solicitar Selo NUIT Verificado</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Razão Social</label>
                <input
                  type="text"
                  value={currentCompanyProfile?.companyName || ''}
                  onChange={e => updateCurrentCompanyProfile({ companyName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nome Comercial / Marca</label>
                <input
                  type="text"
                  value={currentCompanyProfile?.commercialName || ''}
                  onChange={e => updateCurrentCompanyProfile({ commercialName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">NUIT Oficial</label>
                <input
                  type="text"
                  value={currentCompanyProfile?.nuit || ''}
                  onChange={e => updateCurrentCompanyProfile({ nuit: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Setor / Indústria</label>
                <input
                  type="text"
                  value={currentCompanyProfile?.industry || ''}
                  onChange={e => updateCurrentCompanyProfile({ industry: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Telefone Principal</label>
                <input
                  type="text"
                  value={currentCompanyProfile?.phone || ''}
                  onChange={e => updateCurrentCompanyProfile({ phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">WhatsApp Atendimento (+258)</label>
                <input
                  type="text"
                  value={currentCompanyProfile?.whatsapp || ''}
                  onChange={e => updateCurrentCompanyProfile({ whatsapp: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Descrição Institucional da Empresa</label>
              <textarea
                rows={4}
                value={currentCompanyProfile?.description || ''}
                onChange={e => updateCurrentCompanyProfile({ description: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm"
              />
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <NewCompanyJobModal
        isOpen={isNewJobModalOpen}
        onClose={() => setIsNewJobModalOpen(false)}
      />

      <CompanyVerificationModal
        isOpen={isVerificationModalOpen}
        onClose={() => setIsVerificationModalOpen(false)}
      />
    </div>
  );
};
