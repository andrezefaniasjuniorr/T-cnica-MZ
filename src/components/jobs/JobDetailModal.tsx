import React, { useState } from 'react';
import { JobOpening } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import {
  X,
  Briefcase,
  Building2,
  MapPin,
  Clock,
  DollarSign,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  Share2,
  ExternalLink,
  Phone,
  Mail,
  ArrowRight,
  MessageSquare
} from 'lucide-react';

interface JobDetailModalProps {
  job: JobOpening | null;
  isOpen: boolean;
  onClose: () => void;
  onApply: (job: JobOpening) => void;
  onStartMessage?: (companyId: string, companyName: string) => void;
}

export const JobDetailModal: React.FC<JobDetailModalProps> = ({
  job,
  isOpen,
  onClose,
  onApply,
  onStartMessage
}) => {
  const { currentUser, isTechnician } = useAuth();
  const { applications } = useData();
  const [copied, setCopied] = useState(false);

  if (!isOpen || !job) return null;

  const hasApplied = currentUser
    ? applications.some(a => a.jobId === job.id && a.technicianId === currentUser.uid)
    : false;

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-7 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-purple-400 text-purple-950">
                {job.category}
              </span>
              <span className="text-[11px] font-bold text-purple-200">
                {job.contractType} • {job.workplaceType}
              </span>
              {job.companyVerified && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-300 bg-emerald-950/70 px-2 py-0.5 rounded-md border border-emerald-500/40">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>NUIT Verificado</span>
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white">{job.title}</h2>
            <p className="text-xs sm:text-sm text-purple-200 font-semibold flex items-center gap-1">
              <Building2 className="w-4 h-4 text-purple-300" />
              <span>{job.companyName}</span>
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-2">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-purple-400" />
                {job.city}, {job.province}
              </span>
              <span className="flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                <strong className="text-white">{job.salaryDisplay}</strong>
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>Prazo: {job.deadlineDate}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-7 max-h-[60vh] overflow-y-auto space-y-6">
          {/* Description */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">Descrição da Vaga</h3>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {job.description}
            </p>
          </div>

          {/* Requirements */}
          {job.requirements && job.requirements.length > 0 && (
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">Requisitos Exigidos</h3>
              <ul className="space-y-2">
                {job.requirements.map((req, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Benefits */}
          {job.benefits && job.benefits.length > 0 && (
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">Benefícios Ofertados</h3>
              <div className="flex flex-wrap gap-2">
                {job.benefits.map((b, idx) => (
                  <span key={idx} className="text-xs font-semibold px-3 py-1 bg-purple-50 text-purple-700 rounded-xl border border-purple-200">
                    ✓ {b}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Company Contacts */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs text-slate-600">
            <h4 className="font-bold text-slate-800">Contatos Oficiais do Recrutador:</h4>
            {job.contactEmail && (
              <p className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{job.contactEmail}</span>
              </p>
            )}
            {job.contactWhatsapp && (
              <p className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>WhatsApp: +{job.contactWhatsapp}</span>
              </p>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 p-4 sm:p-5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={handleShare}
            className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-white text-xs font-bold transition flex items-center gap-1.5"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{copied ? 'Copiado!' : 'Compartilhar Vaga'}</span>
          </button>

          <div className="flex items-center gap-2">
            {job.contactWhatsapp && (
              <a
                href={`https://wa.me/${job.contactWhatsapp}?text=${encodeURIComponent(
                  `Olá! Vi a vaga de "${job.title}" na empresa ${job.companyName} através da TécnicaMZ.`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
              >
                <span>Falar no WhatsApp</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            {hasApplied ? (
              <span className="px-5 py-2.5 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Candidatura Enviada</span>
              </span>
            ) : (
              <button
                onClick={() => {
                  onClose();
                  onApply(job);
                }}
                className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-purple-600/20"
              >
                <span>Candidatar-me Agora</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
