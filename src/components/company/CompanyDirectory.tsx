import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { CompanyProfile, JobOpening } from '../../types';
import {
  Building2,
  Search,
  MapPin,
  Star,
  ShieldCheck,
  Briefcase,
  ExternalLink,
  ChevronRight,
  Filter,
  Phone,
  MessageSquare
} from 'lucide-react';
import { CompanyDetailModal } from './CompanyDetailModal';
import { ApplyJobModal } from '../jobs/ApplyJobModal';

interface CompanyDirectoryProps {
  onNavigateTab: (tab: string) => void;
  onOpenMessages?: (userId: string, userName: string, role: string) => void;
}

export const CompanyDirectory: React.FC<CompanyDirectoryProps> = ({ onNavigateTab, onOpenMessages }) => {
  const { companies, jobs, startOrGetConversation } = useData();
  const { isCompany, isTechnician, currentUser } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('all');
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [onlyVerified, setOnlyVerified] = useState(false);

  const [selectedCompany, setSelectedCompany] = useState<CompanyProfile | null>(null);
  const [jobToApply, setJobToApply] = useState<JobOpening | null>(null);

  const filteredCompanies = companies.filter(comp => {
    const matchSearch =
      searchTerm === '' ||
      comp.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comp.commercialName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comp.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchProvince = selectedProvince === 'all' || comp.province === selectedProvince;
    const matchIndustry = selectedIndustry === 'all' || comp.industry.toLowerCase().includes(selectedIndustry.toLowerCase());
    const matchVerified = !onlyVerified || comp.verificationStatus === 'verified';

    return matchSearch && matchProvince && matchIndustry && matchVerified;
  });

  const industries = Array.from(new Set(companies.map(c => c.industry))).filter(Boolean);

  return (
    <div className="min-h-screen bg-slate-900/5 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Hero */}
        <div className="bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-purple-800/40 relative overflow-hidden">
          <div className="max-w-3xl space-y-3 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-800/80 border border-purple-600 text-purple-200 text-xs font-bold">
              <Building2 className="w-3.5 h-3.5 text-purple-300" />
              <span>Diretório Corporativo & Empregadores</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              Empresas & Indústrias em Moçambique
            </h1>
            <p className="text-xs sm:text-base text-purple-200 leading-relaxed font-normal">
              Conheça as principais empresas de engenharia, construção, energia solar e climatização contratando técnicos e profissionais na TécnicaMZ.
            </p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar empresa por nome ou ramo..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm"
            />
          </div>

          <div>
            <select
              value={selectedProvince}
              onChange={e => setSelectedProvince(e.target.value)}
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
              value={selectedIndustry}
              onChange={e => setSelectedIndustry(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
            >
              <option value="all">Todos os Setores</option>
              {industries.map(ind => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl">
            <label className="text-xs font-bold text-slate-700 cursor-pointer flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-purple-600" />
              <span>Apenas com NUIT Verificado</span>
            </label>
            <input
              type="checkbox"
              checked={onlyVerified}
              onChange={e => setOnlyVerified(e.target.checked)}
              className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
            />
          </div>
        </div>

        {/* Company Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompanies.map(company => {
            const openJobsCount = jobs.filter(j => j.companyId === company.userId && j.status === 'active').length;
            const isVerified = company.verificationStatus === 'verified';

            return (
              <div
                key={company.userId}
                className="bg-white rounded-3xl p-6 border border-slate-200 hover:border-purple-300 hover:shadow-xl transition-all duration-200 flex flex-col justify-between space-y-5"
              >
                <div className="space-y-4">
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-16 h-16 rounded-2xl bg-purple-50 p-1 border border-slate-100 shadow-xs shrink-0">
                      <img
                        src={company.logoUrl || 'https://images.unsplash.com/photo-1541888946425-d0fbb18fe27c?w=150&auto=format&fit=crop&q=80'}
                        alt={company.companyName}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    </div>

                    {isVerified ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
                        <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                        <span>NUIT Verificado</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                        Registada
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-base font-black text-slate-900 line-clamp-1">{company.companyName}</h3>
                    <p className="text-xs font-semibold text-purple-600">{company.commercialName} • {company.industry}</p>
                    <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{company.city}, {company.province}</span>
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {company.description}
                  </p>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                    <span className="flex items-center gap-1 text-slate-700">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <strong>{company.rating.toFixed(1)}</strong> ({company.reviewsCount})
                    </span>

                    <span className="inline-flex items-center gap-1 font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                      <Briefcase className="w-3.5 h-3.5" />
                      <span>{openJobsCount} vagas abertas</span>
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 flex items-center gap-2">
                  <button
                    onClick={() => setSelectedCompany(company)}
                    className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1"
                  >
                    <span>Ver Perfil & Vagas</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  {company.whatsapp && (
                    <a
                      href={`https://wa.me/${company.whatsapp}?text=${encodeURIComponent(`Olá ${company.companyName}, vi sua empresa no diretório TécnicaMZ.`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition"
                      title="WhatsApp Corporativo"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {filteredCompanies.length === 0 && (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700">Nenhuma empresa encontrada com os filtros selecionados</h3>
            <p className="text-xs text-slate-400 mt-1">Tente remover os filtros ou buscar por outra província.</p>
          </div>
        )}
      </div>

      {/* Modals */}
      <CompanyDetailModal
        company={selectedCompany}
        isOpen={Boolean(selectedCompany)}
        onClose={() => setSelectedCompany(null)}
        onApplyJob={(job) => {
          setJobToApply(job);
        }}
        onStartMessage={(comp) => {
          if (onOpenMessages) {
            onOpenMessages(comp.userId, comp.companyName, 'company');
          } else {
            startOrGetConversation(comp.userId, comp.companyName, 'company', {
              type: 'direct',
              title: 'Contato Corporativo'
            });
            onNavigateTab('messages');
          }
        }}
      />

      <ApplyJobModal
        job={jobToApply}
        isOpen={Boolean(jobToApply)}
        onClose={() => setJobToApply(null)}
      />
    </div>
  );
};
