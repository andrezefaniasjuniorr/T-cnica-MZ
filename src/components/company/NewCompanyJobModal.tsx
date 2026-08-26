import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import {
  MOZAMBIQUE_PROVINCES,
  TECHNICAL_CATEGORIES,
  JobContractType,
  JobWorkplaceType
} from '../../types';
import {
  X,
  Briefcase,
  Building,
  MapPin,
  DollarSign,
  Calendar,
  Sparkles,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface NewCompanyJobModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewCompanyJobModal: React.FC<NewCompanyJobModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, currentCompanyProfile } = useAuth();
  const { createJobOpening } = useData();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<string>(TECHNICAL_CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState<string[]>([
    'Formação técnica comprovada na área',
    'Mínimo de 2 anos de experiência prática em Moçambique'
  ]);
  const [newReq, setNewReq] = useState('');
  const [minExperienceYears, setMinExperienceYears] = useState<number>(2);
  const [educationLevel, setEducationLevel] = useState('Técnico Médio Profissional');
  const [workplaceType, setWorkplaceType] = useState<JobWorkplaceType>('Presencial');
  const [contractType, setContractType] = useState<JobContractType>('Tempo Inteiro');
  const [province, setProvince] = useState<string>(currentCompanyProfile?.province || 'Maputo Cidade');
  const [city, setCity] = useState<string>(currentCompanyProfile?.city || 'Maputo');
  const [salaryDisplay, setSalaryDisplay] = useState('25.000 - 35.000 MZN');
  const [benefits, setBenefits] = useState<string[]>(['Transporte', 'Alimentação', 'Seguro']);
  const [newBenefit, setNewBenefit] = useState('');
  const [deadlineDate, setDeadlineDate] = useState('2026-10-30');
  const [contactEmail, setContactEmail] = useState(currentUser?.email || '');
  const [contactWhatsapp, setContactWhatsapp] = useState(currentCompanyProfile?.whatsapp || '');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleAddRequirement = (e: React.FormEvent) => {
    e.preventDefault();
    if (newReq.trim()) {
      setRequirements([...requirements, newReq.trim()]);
      setNewReq('');
    }
  };

  const handleRemoveRequirement = (idx: number) => {
    setRequirements(requirements.filter((_, i) => i !== idx));
  };

  const handleAddBenefit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newBenefit.trim()) {
      setBenefits([...benefits, newBenefit.trim()]);
      setNewBenefit('');
    }
  };

  const handleRemoveBenefit = (idx: number) => {
    setBenefits(benefits.filter((_, i) => i !== idx));
  };

  const handleSaraAiSuggest = () => {
    // Smart autofill for job descriptions based on selected category
    if (category === 'Energia Solar') {
      setTitle('Instalador Líder de Usinas Solares Fotovoltaicas');
      setDescription('Responsável pela montagem e comissionamento de módulos solares, inversores híbridos e bancos de baterias de lítio em projetos comerciais.');
      setRequirements([
        'Certificado em Energia Solar Fotovoltaica',
        'Experiência prática com inversores Deye / Growatt / Victron',
        'Domínio de normas de segurança em trabalho em altura',
        'Disponibilidade para viagens técnicas'
      ]);
      setSalaryDisplay('35.000 - 50.000 MZN');
    } else if (category === 'Eletricidade') {
      setTitle('Eletricista Industrial de Comando e Potência');
      setDescription('Atuação na manutenção de quadros elétricos de comando, motores trifásicos, soft-starters e inversores de frequência em ambiente fabril.');
      setRequirements([
        'Nível Médio em Eletrotécnica (IIM ou equivalente)',
        'Leitura e interpretação de esquemas elétricos unifilares',
        'Conhecimento de aterramento e proteção contra surtos (DPS)',
        'Experiência mínima de 3 anos'
      ]);
      setSalaryDisplay('30.000 - 45.000 MZN');
    } else {
      setTitle(`Técnico Especialista em ${category}`);
      setDescription(`Profissional qualificado para execução e liderança de projetos de ${category.toLowerCase()} em Moçambique.`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !description.trim()) {
      setError('Por favor preencha o título e a descrição da oportunidade.');
      return;
    }

    if (!currentUser || !currentCompanyProfile) {
      setError('Sessão empresarial inválida.');
      return;
    }

    setIsSubmitting(true);

    try {
      createJobOpening({
        companyId: currentUser.uid,
        companyName: currentCompanyProfile.companyName || currentCompanyProfile.commercialName,
        companyLogo: currentCompanyProfile.logoUrl,
        companyVerified: currentCompanyProfile.verificationStatus === 'verified',
        companyNuit: currentCompanyProfile.nuit,
        title: title.trim(),
        category,
        description: description.trim(),
        requirements,
        minExperienceYears,
        educationLevel,
        workplaceType,
        contractType,
        province,
        city,
        salaryDisplay: salaryDisplay.trim() || 'A Combinar',
        benefits,
        deadlineDate,
        contactEmail: contactEmail.trim(),
        contactWhatsapp: contactWhatsapp.trim()
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err?.message || 'Erro ao publicar vaga.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 sm:p-7 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/30 text-purple-400 border border-purple-500/30 flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black">Publicar Nova Vaga Técnica</h2>
              <p className="text-xs text-slate-400">
                Divulgue oportunidades para milhares de técnicos qualificados na TécnicaMZ.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Vaga publicada com sucesso! Já está ativa e visível no portal de empregos.</span>
            </div>
          )}

          {/* AI Helper banner */}
          <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-purple-600 shrink-0" />
              <div>
                <p className="text-xs font-bold text-purple-900">Sara IA: Assistente de Recrutamento</p>
                <p className="text-[11px] text-purple-700">Preencha requisitos automaticamente para a área selecionada.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleSaraAiSuggest}
              className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shrink-0 self-start sm:self-auto shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Preencher com Sara IA</span>
            </button>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Área Profissional / Categoria</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {TECHNICAL_CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Título da Oportunidade</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Ex: Eletricista Instalador de Quadros"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Descrição das Atividades</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              placeholder="Descreva o escopo da função, responsabilidades e dia a dia..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          {/* Requirements builder */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Requisitos Exigidos</label>
            <div className="space-y-2 mb-2">
              {requirements.map((req, idx) => (
                <div key={idx} className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <span className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                    {req}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveRequirement(idx)}
                    className="text-slate-400 hover:text-rose-600 p-1 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newReq}
                onChange={e => setNewReq(e.target.value)}
                placeholder="Adicionar novo requisito..."
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                type="button"
                onClick={handleAddRequirement}
                className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-700 transition flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Adicionar
              </button>
            </div>
          </div>

          {/* Location & Contract type */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Província</label>
              <select
                value={province}
                onChange={e => setProvince(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
              >
                {MOZAMBIQUE_PROVINCES.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Cidade / Distrito</label>
              <input
                type="text"
                value={city}
                onChange={e => setCity(e.target.value)}
                placeholder="Ex: Matola"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Tipo de Contrato</label>
              <select
                value={contractType}
                onChange={e => setContractType(e.target.value as JobContractType)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
              >
                <option value="Tempo Inteiro">Tempo Inteiro</option>
                <option value="Tempo Parcial">Tempo Parcial</option>
                <option value="Contrato">Contrato por Projeto</option>
                <option value="Prestação de Serviços">Prestação de Serviços</option>
                <option value="Freelancer">Freelancer</option>
                <option value="Estágio">Estágio Técnico</option>
                <option value="Temporário">Temporário</option>
              </select>
            </div>
          </div>

          {/* Salary & Benefits */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Remuneração Ofertada (MZN)</label>
              <input
                type="text"
                value={salaryDisplay}
                onChange={e => setSalaryDisplay(e.target.value)}
                placeholder="Ex: 30.000 - 45.000 MZN ou A Combinar"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Data Limite de Inscrição</label>
              <input
                type="date"
                value={deadlineDate}
                onChange={e => setDeadlineDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold"
              />
            </div>
          </div>

          {/* Contacts for this job */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Email para Receber Currículos</label>
              <input
                type="email"
                value={contactEmail}
                onChange={e => setContactEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">WhatsApp para Contato Direto (+258)</label>
              <input
                type="text"
                value={contactWhatsapp}
                onChange={e => setContactWhatsapp(e.target.value)}
                placeholder="258840000000"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-md shadow-purple-600/20 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Publicando...' : 'Publicar Vaga no Mural Oficial'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
