import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { RoleEntryCards } from './RoleEntryCards';
import {
  Search,
  Wrench,
  ShieldCheck,
  Building2,
  Briefcase,
  Star,
  ArrowRight,
  Phone,
  Sparkles,
  Zap,
  MapPin,
  TrendingUp
} from 'lucide-react';

interface HeroSectionProps {
  onNavigateTab: (tab: string) => void;
  onOpenAuth: (role?: any) => void;
  onOpenSaraAi: () => void;
  onOpenMessages?: (userId: string, userName: string, role: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onNavigateTab,
  onOpenAuth,
  onOpenSaraAi,
  onOpenMessages
}) => {
  const { technicians, companies, jobs, marketItems } = useData();
  const { currentUser } = useAuth();
  const [quickSearch, setQuickSearch] = useState('');

  const featuredTechs = technicians.filter(t => t.featured || t.verificationStatus === 'approved').slice(0, 3);
  const featuredCompanies = companies.slice(0, 2);
  const featuredJobs = jobs.filter(j => j.status === 'active').slice(0, 2);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickSearch.trim()) {
      onNavigateTab('technicians_directory');
    }
  };

  return (
    <div className="space-y-16 pb-16">
      {/* 1. Main Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white pt-12 pb-20 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(37,99,235,0.25),rgba(255,255,255,0))]"></div>

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-xs font-bold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Ecossistema Técnico Nacional de Moçambique • Maputo a Pemba</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
            Contratações, Empregos & Serviços Técnicos{' '}
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-amber-300 bg-clip-text text-transparent">
              Auditados e Seguros
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            A plataforma unificada que conecta <strong>Clientes</strong> que precisam de obras elétricas e solares,{' '}
            <strong>Técnicos Certificados</strong> e <strong>Empresas</strong> que contratam talentos com NUIT verificado.
          </p>

          {/* Quick Search Form */}
          <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto pt-2">
            <div className="bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20 shadow-2xl flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  value={quickSearch}
                  onChange={e => setQuickSearch(e.target.value)}
                  placeholder="Ex: Instalador Solar em Maputo, Eletricista em Nampula..."
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/80 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs sm:text-sm transition shadow-lg shadow-blue-600/30 shrink-0"
              >
                Buscar Especialistas
              </button>
            </div>

            {/* Quick Suggestion Chips */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-3 text-[11px] text-slate-400">
              <span>Mais buscados:</span>
              {['Energia Solar Fotovoltaica', 'Climatização & AC', 'Eletricista Predial', 'Maputo', 'Matola', 'Nampula'].map(chip => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => onNavigateTab('technicians_directory')}
                  className="px-2.5 py-0.5 rounded-full bg-white/5 hover:bg-white/15 text-slate-300 border border-white/10 transition"
                >
                  {chip}
                </button>
              ))}
            </div>
          </form>
        </div>

        {/* Live Counters */}
        <div className="max-w-5xl mx-auto mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
            <p className="text-2xl sm:text-3xl font-black text-white font-mono">{technicians.length}+</p>
            <p className="text-xs text-blue-300 font-semibold mt-1">Técnicos Verificados</p>
          </div>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
            <p className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">{companies.length}+</p>
            <p className="text-xs text-slate-300 font-semibold mt-1">Empresas & NUITs</p>
          </div>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
            <p className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">{jobs.length}+</p>
            <p className="text-xs text-slate-300 font-semibold mt-1">Vagas Abertas</p>
          </div>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
            <p className="text-2xl sm:text-3xl font-black text-purple-400 font-mono">100%</p>
            <p className="text-xs text-slate-300 font-semibold mt-1">Padrão Moçambique</p>
          </div>
        </div>
      </section>

      {/* 2. Three Main Persona Entry Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            Acesso Especializado por Perfil
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Seja cliente particular, técnico autônomo ou empresa contratante, tenha ferramentas exclusivas.
          </p>
        </div>

        <RoleEntryCards
          onSelectRole={(role, mode) => {
            onOpenAuth(role);
          }}
          onNavigateTab={onNavigateTab}
        />
      </section>

      {/* 3. Featured Technicians Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
              <Wrench className="w-5 h-5 text-blue-600" />
              <span>Técnicos em Destaque Nacional</span>
            </h3>
            <p className="text-xs text-slate-500">Profissionais com alta avaliação e documentos verificados</p>
          </div>
          <button
            onClick={() => onNavigateTab('technicians_directory')}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>Ver Todos</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredTechs.map(tech => (
            <div
              key={tech.userId}
              className="bg-white rounded-3xl p-6 border border-slate-200 hover:border-blue-300 hover:shadow-xl transition-all duration-200 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 p-0.5 border border-slate-200 shrink-0">
                      <img
                        src={tech.avatarUrl || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=150&auto=format&fit=crop&q=80'}
                        alt={tech.name}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900">{tech.name}</h4>
                      <p className="text-xs text-slate-500">📍 {tech.city}, {tech.province}</p>
                    </div>
                  </div>

                  {tech.verificationStatus === 'approved' && (
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 flex items-center gap-0.5 shrink-0">
                      <ShieldCheck className="w-3 h-3 text-blue-600" /> Selo MZ
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1 text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded-md">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>{tech.rating.toFixed(1)}</span>
                  </span>
                  <span className="text-slate-500 font-medium">🏆 {tech.completedJobsCount} obras</span>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2">{tech.bio}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-700">{tech.specialties[0]}</span>
                {tech.whatsapp && (
                  <a
                    href={`https://wa.me/${(tech.whatsapp || tech.phone || '').replace(/\D/g, '')}?text=${encodeURIComponent(
                      `Olá ${tech.name}, vi seu perfil na TécnicaMZ e gostaria de um orçamento.`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-xs"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Featured Companies & Jobs Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-purple-600" />
              <span>Vagas Técnicas & Recrutamento Corporativo</span>
            </h3>
            <p className="text-xs text-slate-500">Oportunidades publicadas por empresas com NUIT auditado</p>
          </div>
          <button
            onClick={() => onNavigateTab('jobs')}
            className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1"
          >
            <span>Ver Todas as Vagas</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {featuredJobs.map(job => (
            <div
              key={job.id}
              className="bg-white rounded-3xl p-6 border border-slate-200 hover:border-purple-300 hover:shadow-xl transition-all duration-200 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                      {job.category}
                    </span>
                    <h4 className="text-base font-black text-slate-900 mt-2">{job.title}</h4>
                    <p className="text-xs text-purple-900 font-semibold flex items-center gap-1 mt-0.5">
                      <Building2 className="w-3.5 h-3.5 text-purple-600" />
                      <span>{job.companyName}</span>
                    </p>
                  </div>

                  <span className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 font-bold text-xs border border-emerald-200 shrink-0">
                    💰 {job.salaryDisplay}
                  </span>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{job.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400">📍 {job.city}, {job.province}</span>
                <button
                  onClick={() => onNavigateTab('jobs')}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1"
                >
                  <span>Candidatar-me</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
