import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { soundFX } from '../../utils/audio';
import { getInitial } from '../../utils/stringUtils';
import {
  X,
  ArrowLeft,
  Search,
  Wrench,
  Building2,
  Briefcase,
  ShoppingBag,
  BookOpen,
  ArrowRight,
  MapPin,
  Star,
  ShieldCheck
} from 'lucide-react';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectResult: (tab: string, item?: any) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectResult
}) => {
  const { technicians, companies, jobs, marketItems, academyArticles } = useData();
  const [query, setQuery] = useState('');

  const handleClose = () => {
    soundFX.playModalClose();
    onClose();
  };

  const handleSelect = (tab: string, item?: any) => {
    soundFX.playClick();
    onSelectResult(tab, item);
    handleClose();
  };

  if (!isOpen) return null;

  const q = (query || '').toString().trim().toLowerCase();

  const matchedTechs = q
    ? technicians.filter(
        t =>
          (t.name || '').toLowerCase().includes(q) ||
          (t.specialties || []).some(s => (s || '').toLowerCase().includes(q)) ||
          (t.bio || '').toLowerCase().includes(q) ||
          (t.city || '').toLowerCase().includes(q) ||
          (t.province || '').toLowerCase().includes(q)
      )
    : [];

  const matchedCompanies = q
    ? companies.filter(
        c =>
          (c.companyName || '').toLowerCase().includes(q) ||
          (c.commercialName || '').toLowerCase().includes(q) ||
          (c.industry || '').toLowerCase().includes(q) ||
          (c.city || '').toLowerCase().includes(q) ||
          (c.province || '').toLowerCase().includes(q)
      )
    : [];

  const matchedJobs = q
    ? jobs.filter(
        j =>
          (j.title || '').toLowerCase().includes(q) ||
          (j.companyName || '').toLowerCase().includes(q) ||
          (j.description || '').toLowerCase().includes(q) ||
          (j.category || '').toLowerCase().includes(q) ||
          (j.province || '').toLowerCase().includes(q)
      )
    : [];

  const matchedMarket = q
    ? marketItems.filter(
        m =>
          (m.title || '').toLowerCase().includes(q) ||
          (m.description || '').toLowerCase().includes(q) ||
          (m.category || '').toLowerCase().includes(q) ||
          (m.sellerName || '').toLowerCase().includes(q)
      )
    : [];

  const matchedAcademy = q
    ? academyArticles.filter(
        a =>
          (a.title || '').toLowerCase().includes(q) ||
          (a.summary || '').toLowerCase().includes(q) ||
          (a.category || '').toLowerCase().includes(q)
      )
    : [];

  const totalResults =
    matchedTechs.length + matchedCompanies.length + matchedJobs.length + matchedMarket.length + matchedAcademy.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 bg-slate-950/75 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Search Bar Input */}
        <div className="p-3.5 sm:p-5 border-b border-slate-200 flex items-center gap-2.5 sm:gap-3 bg-slate-50">
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 flex items-center gap-1 text-xs font-bold transition shadow-2xs"
            title="Voltar / Fechar pesquisa"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Voltar</span>
          </button>
          <Search className="w-5 h-5 text-blue-600 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Pesquisar técnicos, empresas, vagas, ferramentas ou artigos..."
            className="flex-1 bg-transparent text-xs sm:text-base font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-xs font-bold text-slate-400 hover:text-slate-700 px-2 py-1 bg-slate-200/60 rounded-md"
            >
              Limpar
            </button>
          )}
          <button
            onClick={handleClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
            title="Fechar (X)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Container */}
        <div className="max-h-[60vh] overflow-y-auto p-4 sm:p-6 space-y-6">
          {!q ? (
            <div className="text-center py-10 space-y-2 text-slate-400">
              <Search className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-xs font-semibold">Digite termos como "Solar", "Eletricista", "Empresa", "Vagas", "AC"...</p>
            </div>
          ) : totalResults === 0 ? (
            <div className="text-center py-10 text-slate-400 space-y-1">
              <p className="text-xs font-bold text-slate-700">Nenhum resultado encontrado para "{query}"</p>
              <p className="text-[11px]">Tente verificar a ortografia ou buscar termos mais amplos.</p>
            </div>
          ) : (
            <>
              {/* Technicians */}
              {matchedTechs.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5 text-blue-500" />
                    <span>Técnicos & Especialistas ({matchedTechs.length})</span>
                  </h4>
                  <div className="space-y-1.5">
                    {matchedTechs.map(t => (
                      <button
                        key={t.userId}
                        onClick={() => {
                          onSelectResult('technicians_directory', t);
                          onClose();
                        }}
                        className="w-full text-left p-3 rounded-2xl bg-slate-50 hover:bg-blue-50 border border-slate-200 transition flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                            {getInitial(t.name)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="text-xs font-black text-slate-900">{t.name || 'Técnico'}</p>
                              {t.verificationStatus === 'approved' && (
                                <span className="text-[9px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.2 rounded">
                                  Verificado
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500">{t.specialties.join(', ')} • 📍 {t.city}, {t.province}</p>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Companies */}
              {matchedCompanies.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-purple-500" />
                    <span>Empresas & Indústrias ({matchedCompanies.length})</span>
                  </h4>
                  <div className="space-y-1.5">
                    {matchedCompanies.map(c => (
                      <button
                        key={c.userId}
                        onClick={() => {
                          onSelectResult('company_directory', c);
                          onClose();
                        }}
                        className="w-full text-left p-3 rounded-2xl bg-slate-50 hover:bg-purple-50 border border-slate-200 transition flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs shrink-0">
                            {getInitial(c.companyName)}
                          </div>
                          <div>
                            <p className="text-xs font-black text-slate-900">{c.companyName || 'Empresa'}</p>
                            <p className="text-[11px] text-slate-500">{c.industry} • 📍 {c.city}, {c.province}</p>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Jobs */}
              {matchedJobs.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-purple-500" />
                    <span>Vagas & Empregos ({matchedJobs.length})</span>
                  </h4>
                  <div className="space-y-1.5">
                    {matchedJobs.map(j => (
                      <button
                        key={j.id}
                        onClick={() => {
                          onSelectResult('jobs', j);
                          onClose();
                        }}
                        className="w-full text-left p-3 rounded-2xl bg-slate-50 hover:bg-purple-50 border border-slate-200 transition flex items-center justify-between gap-3"
                      >
                        <div>
                          <p className="text-xs font-black text-slate-900">{j.title}</p>
                          <p className="text-[11px] text-slate-500">
                            {j.companyName} • 💰 {j.salaryDisplay} • 📍 {j.city}, {j.province}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
