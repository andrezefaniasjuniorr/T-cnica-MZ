import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { JobOpening, TECHNICAL_CATEGORIES, MOZAMBIQUE_PROVINCES } from '../../types';
import {
  Briefcase,
  Search,
  MapPin,
  DollarSign,
  Building2,
  Calendar,
  ShieldCheck,
  Plus,
  ArrowRight,
  Filter,
  Users,
  Sparkles,
  ChevronRight,
  Phone,
  Clock
} from 'lucide-react';
import { JobDetailModal } from './JobDetailModal';
import { ApplyJobModal } from './ApplyJobModal';
import { NewCompanyJobModal } from '../company/NewCompanyJobModal';
import { TopBackNav } from '../common/TopBackNav';

interface JobsSectionProps {
  onNavigateTab: (tab: string) => void;
  onOpenMessages?: (userId: string, userName: string, role: string) => void;
}

export const JobsSection: React.FC<JobsSectionProps> = ({ onNavigateTab, onOpenMessages }) => {
  const { jobs } = useData();
  const { isCompany, isTechnician, currentUser } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProvince, setSelectedProvince] = useState('all');
  const [selectedContract, setSelectedContract] = useState('all');
  const [onlyVerifiedCompany, setOnlyVerifiedCompany] = useState(false);

  const [selectedJob, setSelectedJob] = useState<JobOpening | null>(null);
  const [jobToApply, setJobToApply] = useState<JobOpening | null>(null);
  const [isNewJobModalOpen, setIsNewJobModalOpen] = useState(false);

  const activeJobs = jobs.filter(j => j.status === 'active');

  const filteredJobs = activeJobs.filter(job => {
    const term = (searchTerm || '').toString().toLowerCase().trim();
    const matchSearch =
      !term ||
      (job.title || '').toLowerCase().includes(term) ||
      (job.companyName || '').toLowerCase().includes(term) ||
      (job.description || '').toLowerCase().includes(term) ||
      (job.category || '').toLowerCase().includes(term) ||
      (job.city || '').toLowerCase().includes(term) ||
      (job.province || '').toLowerCase().includes(term);

    const matchCategory = selectedCategory === 'all' || job.category === selectedCategory;
    const matchProvince = selectedProvince === 'all' || job.province === selectedProvince;
    const matchContract = selectedContract === 'all' || job.contractType === selectedContract;
    const matchVerified = !onlyVerifiedCompany || Boolean(job.companyVerified);

    return matchSearch && matchCategory && matchProvince && matchContract && matchVerified;
  });

  return (
    <div className="min-h-screen bg-slate-900/5 py-6 sm:py-8 px-3 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Top Back Navigation Bar */}
        <TopBackNav
          title="Oportunidades de Emprego Técnico"
          category="Vagas"
          onBack={() => onNavigateTab('community')}
          backLabel="Voltar ao Mural"
          rightAction={
            isCompany ? (
              <button
                onClick={() => setIsNewJobModalOpen(true)}
                className="px-3 py-1.5 sm:px-4 sm:py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-sm active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Publicar Vaga</span>
              </button>
            ) : undefined
          }
        />

        {/* Header Hero */}
        <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-purple-900/40 relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="max-w-3xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-900/80 border border-purple-600/50 text-purple-200 text-xs font-bold">
                <Briefcase className="w-3.5 h-3.5 text-purple-400" />
                <span>Portal Oficial de Vagas & Recrutamento Técnico • Moçambique</span>
              </div>
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
                Oportunidades de Emprego Técnico
              </h1>
              <p className="text-xs sm:text-base text-purple-200 leading-relaxed font-normal">
                Vagas exclusivas publicadas por empresas moçambicanas para instaladores solares, eletricistas, técnicos de climatização, mecânica e engenharia.
              </p>
            </div>

            {/* Quick Button for Companies */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              {isCompany ? (
                <button
                  onClick={() => setIsNewJobModalOpen(true)}
                  className="px-6 py-3.5 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30"
                >
                  <Plus className="w-4 h-4" />
                  <span>Publicar Vaga da Empresa</span>
                </button>
              ) : (
                <button
                  onClick={() => onNavigateTab('company_directory')}
                  className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-xs font-bold transition border border-white/20 flex items-center justify-center gap-2"
                >
                  <Building2 className="w-4 h-4" />
                  <span>Ver Empresas Contratantes</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Cargo, palavra-chave ou empresa..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm"
              />
            </div>

            <div>
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
              >
                <option value="all">Todas as Especialidades</option>
                {TECHNICAL_CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={selectedProvince}
                onChange={e => setSelectedProvince(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
              >
                <option value="all">Todas as Províncias</option>
                {MOZAMBIQUE_PROVINCES.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={selectedContract}
                onChange={e => setSelectedContract(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
              >
                <option value="all">Todos os Contratos</option>
                <option value="Tempo Inteiro">Tempo Inteiro</option>
                <option value="Tempo Parcial">Tempo Parcial</option>
                <option value="Contrato">Contrato por Projeto</option>
                <option value="Prestação de Serviços">Prestação de Serviços</option>
                <option value="Freelancer">Freelancer</option>
                <option value="Estágio">Estágio Técnico</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="onlyVerifiedCompany"
                checked={onlyVerifiedCompany}
                onChange={e => setOnlyVerifiedCompany(e.target.checked)}
                className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
              />
              <label htmlFor="onlyVerifiedCompany" className="font-semibold text-slate-700 cursor-pointer flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                <span>Apenas empresas com NUIT Verificado</span>
              </label>
            </div>

            <p className="text-slate-500 font-medium">
              Exibindo <strong>{filteredJobs.length}</strong> vagas disponíveis
            </p>
          </div>
        </div>

        {/* Jobs Feed Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredJobs.map(job => (
            <div
              key={job.id}
              className="bg-white rounded-3xl p-6 border border-slate-200 hover:border-purple-300 hover:shadow-xl transition-all duration-200 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* Top Badge & Company Name */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-black text-sm shrink-0 border border-purple-200">
                      {job.companyLogo ? (
                        <img src={job.companyLogo} alt={job.companyName} className="w-full h-full object-cover rounded-2xl" />
                      ) : (
                        <Building2 className="w-6 h-6" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-slate-900">{job.companyName}</span>
                        {job.companyVerified && (
                          <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.2 rounded border border-purple-200 flex items-center gap-0.5">
                            <ShieldCheck className="w-3 h-3 text-purple-600" /> NUIT
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500">📍 {job.city}, {job.province}</p>
                    </div>
                  </div>

                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 shrink-0">
                    {job.category}
                  </span>
                </div>

                {/* Job Title & Scope */}
                <div>
                  <h3 className="text-base font-black text-slate-900 line-clamp-1">{job.title}</h3>
                  <p className="text-xs text-slate-600 line-clamp-2 mt-1 leading-relaxed">{job.description}</p>
                </div>

                {/* Tags & Salary */}
                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                  <span className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 font-semibold">
                    {job.contractType}
                  </span>
                  <span className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 font-semibold">
                    {job.workplaceType}
                  </span>
                  <span className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                    💰 {job.salaryDisplay}
                  </span>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3 text-xs">
                <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{job.applicationsCount} inscritos</span>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedJob(job)}
                    className="px-3 py-2 rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200 font-bold transition"
                  >
                    Detalhes
                  </button>

                  <button
                    onClick={() => setJobToApply(job)}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition flex items-center gap-1 shadow-xs"
                  >
                    <span>Candidatar</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredJobs.length === 0 && (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
            <Briefcase className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-700">Nenhuma vaga encontrada para estes filtros</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Experimente selecionar outra província ou categoria profissional.
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      <JobDetailModal
        job={selectedJob}
        isOpen={Boolean(selectedJob)}
        onClose={() => setSelectedJob(null)}
        onApply={(job) => setJobToApply(job)}
      />

      <ApplyJobModal
        job={jobToApply}
        isOpen={Boolean(jobToApply)}
        onClose={() => setJobToApply(null)}
      />

      <NewCompanyJobModal
        isOpen={isNewJobModalOpen}
        onClose={() => setIsNewJobModalOpen(false)}
      />
    </div>
  );
};
