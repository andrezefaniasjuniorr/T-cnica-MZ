import React, { useState } from 'react';
import { JobOpening } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import {
  X,
  Briefcase,
  User,
  Phone,
  Mail,
  FileText,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  MapPin,
  DollarSign
} from 'lucide-react';

interface ApplyJobModalProps {
  job: JobOpening | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ApplyJobModal: React.FC<ApplyJobModalProps> = ({ job, isOpen, onClose }) => {
  const { currentUser, currentTechProfile, isTechnician } = useAuth();
  const { applyToJob } = useData();

  const [coverLetter, setCoverLetter] = useState(
    'Tenho interesse e total disponibilidade técnica para atender às exigências desta vaga com qualidade, segurança e cumprimento dos prazos estabelecidos.'
  );
  const [expectedSalary, setExpectedSalary] = useState('');
  const [experienceYears, setExperienceYears] = useState(currentTechProfile?.experienceYears || 3);
  const [cvFileSimulated, setCvFileSimulated] = useState<string | null>('Curriculo_Tecnico_MZ_Profissional.pdf');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen || !job) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setError('Por favor autentique-se como técnico para se candidatar.');
      return;
    }

    if (!coverLetter.trim()) {
      setError('Escreva uma breve carta de apresentação.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const result = await applyToJob({
      jobId: job.id,
      jobTitle: job.title,
      companyId: job.companyId,
      companyName: job.companyName,
      technicianId: currentUser.uid,
      technicianName: currentTechProfile?.name || currentUser.name,
      technicianEmail: currentUser.email,
      technicianPhone: currentTechProfile?.phone || currentUser.phone || '+258 84 000 0000',
      technicianProvince: currentTechProfile?.province || 'Maputo Cidade',
      technicianSpecialty: currentTechProfile?.specialties?.[0] || job.category,
      technicianExperienceYears: Number(experienceYears) || 2,
      technicianVerified: currentTechProfile?.verificationStatus === 'approved',
      technicianRating: currentTechProfile?.rating || 5.0,
      coverLetter: coverLetter.trim(),
      expectedSalaryMZN: expectedSalary.trim() || undefined,
      resumeUrl: cvFileSimulated ? `https://tecnicamz.co.mz/cv/${cvFileSimulated}` : undefined
    });

    setIsSubmitting(false);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1800);
    } else {
      setError(result.error || 'Erro ao submeter candidatura.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-purple-900 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-800 text-purple-200 border border-purple-700 flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black">Candidatura à Vaga</h2>
              <p className="text-xs text-purple-200 line-clamp-1">{job.title} • {job.companyName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-purple-800 text-purple-300 hover:text-white hover:bg-purple-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-5 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Candidatura enviada com sucesso! O recrutador da empresa receberá seu perfil.</span>
            </div>
          )}

          {/* Job Summary Card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-black text-slate-900">{job.title}</span>
              <span className="font-bold text-purple-700">{job.salaryDisplay}</span>
            </div>
            <p className="text-slate-600">Empresa: <strong>{job.companyName}</strong> (NUIT: {job.companyNuit || 'Verificado'})</p>
            <p className="text-slate-500">📍 {job.city}, {job.province} • {job.contractType}</p>
          </div>

          {/* Technician details preview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nome do Candidato</label>
              <input
                type="text"
                disabled
                value={currentTechProfile?.name || currentUser?.name || 'Técnico Visitante'}
                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Telefone / WhatsApp</label>
              <input
                type="text"
                disabled
                value={currentTechProfile?.phone || currentUser?.phone || '+258 84 000 0000'}
                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Anos de Experiência Prática</label>
              <input
                type="number"
                min="0"
                max="40"
                value={experienceYears}
                onChange={e => setExperienceYears(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Pretensão Salarial MZN (Opcional)</label>
              <input
                type="text"
                placeholder="Ex: 35.000 MZN"
                value={expectedSalary}
                onChange={e => setExpectedSalary(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Carta de Apresentação / Motivação</label>
            <textarea
              rows={4}
              value={coverLetter}
              onChange={e => setCoverLetter(e.target.value)}
              placeholder="Explique por que você é o técnico ideal para esta função..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          {/* CV attachment */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Currículo Vitae Anexo (PDF)</label>
            <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-between text-xs text-purple-900">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-600 shrink-0" />
                <span className="font-semibold">{cvFileSimulated}</span>
              </div>
              <span className="text-[10px] font-bold bg-purple-200 text-purple-800 px-2 py-0.5 rounded">
                Pronto para envio
              </span>
            </div>
          </div>

          {/* Footer actions */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-purple-600/20 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Submetendo...' : 'Confirmar Candidatura'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
