import React, { useState } from 'react';
import { CompanyProfile, JobOpening } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import {
  X,
  ArrowLeft,
  Building2,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  Globe,
  Phone,
  Mail,
  Briefcase,
  Star,
  MessageSquare,
  Share2,
  ExternalLink,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';

interface CompanyDetailModalProps {
  company: CompanyProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onApplyJob?: (job: JobOpening) => void;
  onStartMessage?: (company: CompanyProfile) => void;
}

export const CompanyDetailModal: React.FC<CompanyDetailModalProps> = ({
  company,
  isOpen,
  onClose,
  onApplyJob,
  onStartMessage
}) => {
  const { isTechnician, currentUser } = useAuth();
  const { jobs, startOrGetConversation } = useData();
  const [activeTab, setActiveTab] = useState<'about' | 'jobs' | 'reviews'>('about');
  const [copied, setCopied] = useState(false);

  if (!isOpen || !company) return null;

  const companyJobs = jobs.filter(j => j.companyId === company.userId && j.status === 'active');

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Cover / Header */}
        <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-5 sm:p-8 relative">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition flex items-center gap-1.5 text-xs font-bold"
              title="Voltar ao diretório de empresas"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition"
              title="Fechar (X)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white p-1.5 shadow-xl border border-white/20 shrink-0">
              <img
                src={company.logoUrl || `https://images.unsplash.com/photo-1541888946425-d0fbb18fe27c?w=150&auto=format&fit=crop&q=80`}
                alt={company.companyName}
                className="w-full h-full object-cover rounded-xl"
              />
            </div>

            <div className="space-y-1.5 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-white">{company.companyName}</h2>
                {company.verificationStatus === 'verified' && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-200 bg-purple-900/80 px-2.5 py-0.5 rounded-full border border-purple-400/40">
                    <ShieldCheck className="w-3.5 h-3.5 text-purple-300" />
                    <span>NUIT Verificado</span>
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-purple-200 font-medium">{company.commercialName} • {company.industry}</p>
              
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-purple-400" />
                  {company.city}, {company.province}
                </span>
                <span className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <strong className="text-white">{company.rating.toFixed(1)}</strong> ({company.reviewsCount} avaliações)
                </span>
                <span className="flex items-center gap-1 font-mono text-[11px] bg-slate-800/80 px-2 py-0.5 rounded">
                  NUIT: {company.nuit}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick action bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('about')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'about' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              Sobre a Empresa
            </button>
            <button
              onClick={() => setActiveTab('jobs')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'jobs' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>Vagas Abertas</span>
              <span className="px-1.5 py-0.2 rounded-full bg-purple-200 text-purple-800 text-[10px] font-black">
                {companyJobs.length}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1 transition"
              title="Copiar link"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">{copied ? 'Copiado!' : 'Compartilhar'}</span>
            </button>

            {currentUser && currentUser.uid !== company.userId && (
              <button
                onClick={() => onStartMessage ? onStartMessage(company) : null}
                className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Mensagem Direta</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab content */}
        <div className="p-6 sm:p-8 max-h-[60vh] overflow-y-auto space-y-6">
          {activeTab === 'about' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">Visão Geral</h3>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {company.description || 'Empresa moçambicana de engenharia e prestação de serviços técnicos de excelência.'}
                </p>
              </div>

              {/* Company Specs Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-purple-600" />
                    <span>Dados Corporativos</span>
                  </h4>
                  <div className="text-xs text-slate-600 space-y-1">
                    <p><strong className="text-slate-800">Razão Social:</strong> {company.companyName}</p>
                    <p><strong className="text-slate-800">Nome Comercial:</strong> {company.commercialName}</p>
                    <p><strong className="text-slate-800">Setor:</strong> {company.industry}</p>
                    <p><strong className="text-slate-800">NUIT Registado:</strong> {company.nuit}</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-purple-600" />
                    <span>Localização & Contatos</span>
                  </h4>
                  <div className="text-xs text-slate-600 space-y-1">
                    <p><strong className="text-slate-800">Endereço:</strong> {company.address}, {company.city}</p>
                    <p><strong className="text-slate-800">Província:</strong> {company.province}</p>
                    {company.website && (
                      <p className="flex items-center gap-1">
                        <Globe className="w-3.5 h-3.5 text-purple-600" />
                        <a href={company.website} target="_blank" rel="noreferrer" className="text-purple-600 hover:underline">
                          {company.website.replace(/^https?:\/\//, '')}
                        </a>
                      </p>
                    )}
                    {company.phone && (
                      <p className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{company.phone}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Direct WhatsApp Call */}
              {company.showWhatsappButton && (company.whatsapp || company.phone) && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-emerald-950">Atendimento Corporativo via WhatsApp</p>
                    <p className="text-[11px] text-emerald-800">Conecte-se com o setor de recursos humanos e parcerias.</p>
                  </div>
                  <a
                    href={`https://wa.me/${(company.whatsapp || company.phone || '').replace(/\D/g, '')}?text=${encodeURIComponent(`Olá ${company.companyName}, vi seu perfil corporativo na plataforma TécnicaMZ.`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs shrink-0"
                  >
                    <span>Falar no WhatsApp</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          )}

          {activeTab === 'jobs' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">
                  Oportunidades Publicadas ({companyJobs.length})
                </h3>
              </div>

              {companyJobs.length === 0 ? (
                <div className="text-center py-10 text-slate-400 space-y-2">
                  <Briefcase className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-xs">Esta empresa não possui vagas abertas no momento.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {companyJobs.map(job => (
                    <div
                      key={job.id}
                      className="p-4 sm:p-5 rounded-2xl border border-slate-200 hover:border-purple-300 hover:shadow-md transition bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                            {job.category}
                          </span>
                          <span className="text-[10px] font-bold text-slate-500">
                            {job.contractType} • {job.workplaceType}
                          </span>
                        </div>
                        <h4 className="text-sm font-black text-slate-900">{job.title}</h4>
                        <p className="text-xs text-slate-600 line-clamp-2">{job.description}</p>
                        <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1">
                          <span>📍 {job.city}, {job.province}</span>
                          <span>💰 <strong className="text-slate-800">{job.salaryDisplay}</strong></span>
                        </div>
                      </div>

                      <button
                        onClick={() => onApplyJob ? onApplyJob(job) : null}
                        className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition flex items-center justify-center gap-1 shrink-0 shadow-xs"
                      >
                        <span>Candidatar-me</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
