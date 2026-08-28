import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import {
  X,
  ArrowLeft,
  ShieldCheck,
  Building,
  Upload,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  Sparkles
} from 'lucide-react';

interface CompanyVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CompanyVerificationModal: React.FC<CompanyVerificationModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, currentCompanyProfile, updateCurrentCompanyProfile } = useAuth();
  const { verifyCompany } = useData();

  const [nuit, setNuit] = useState(currentCompanyProfile?.nuit || '');
  const [docType, setDocType] = useState('Certidão de Quitação Fiscal & NUIT');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSimulateUpload = () => {
    setUploadedFileName(`certidao_nuit_${nuit || 'empresa'}_oficial.pdf`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuit.trim()) {
      setError('Por favor informe o NUIT oficial da empresa.');
      return;
    }

    if (!uploadedFileName) {
      setError('Por favor anexe a certidão ou alvará comercial.');
      return;
    }

    if (!currentUser) return;

    setIsSubmitting(true);
    setError(null);

    try {
      updateCurrentCompanyProfile({
        nuit: nuit.trim(),
        verificationStatus: 'pending'
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1800);
    } catch (err: any) {
      setError(err?.message || 'Erro ao submeter verificação.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-purple-900 text-white p-4 sm:p-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-purple-800 hover:bg-purple-700 text-purple-200 flex items-center gap-1 text-xs font-bold transition"
              title="Voltar / Sair"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Voltar</span>
            </button>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-purple-800 text-purple-200 border border-purple-700 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-lg font-black">Certificação & NUIT</h2>
              <p className="text-[10px] sm:text-xs text-purple-200">Selo Oficial TécnicaMZ</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-purple-800 text-purple-300 hover:text-white hover:bg-purple-700 transition"
            title="Fechar (X)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Documentos enviados para a equipa de auditoria! A aprovação é concluída em até 24h.</span>
            </div>
          )}

          <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 text-xs text-purple-900 space-y-1.5">
            <div className="font-bold flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>Vantagens do Selo "Empresa Verificada":</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-purple-800 text-[11px] pl-1">
              <li>Destaque visual no diretório de empresas e nas vagas</li>
              <li>Atração de técnicos seniores e certificados</li>
              <li>Emissão de faturas com validação fiscal moçambicana</li>
            </ul>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">NUIT da Empresa (Número Único de Identificação Tributária)</label>
            <input
              type="text"
              value={nuit}
              onChange={e => setNuit(e.target.value)}
              placeholder="Ex: 400123456"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Tipo de Documento Comprovativo</label>
            <select
              value={docType}
              onChange={e => setDocType(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
            >
              <option value="Certidão de Quitação Fiscal & NUIT">Certidão de Quitação Fiscal & NUIT</option>
              <option value="Alvará Comercial / Licença de Atividade">Alvará Comercial / Licença de Atividade</option>
              <option value="Publicação no Boletim da República (BR)">Publicação no Boletim da República (BR)</option>
              <option value="Certidão de Registo Comercial (Conservatória)">Certidão de Registo Comercial (Conservatória)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Anexar Arquivo (PDF / Imagem)</label>
            {uploadedFileName ? (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-800">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold">{uploadedFileName}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setUploadedFileName(null)}
                  className="text-emerald-700 hover:text-rose-600 font-bold"
                >
                  Trocar
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleSimulateUpload}
                className="w-full border-2 border-dashed border-slate-300 hover:border-purple-500 p-5 rounded-2xl flex flex-col items-center justify-center gap-1.5 text-slate-600 hover:text-purple-600 transition bg-slate-50 hover:bg-purple-50/50"
              >
                <Upload className="w-6 h-6 text-slate-400" />
                <span className="text-xs font-bold">Clique para carregar certidão em PDF</span>
                <span className="text-[10px] text-slate-400">PDF, PNG ou JPG até 10MB</span>
              </button>
            )}
          </div>

          {/* Action buttons */}
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
              <ShieldCheck className="w-4 h-4" />
              <span>{isSubmitting ? 'Enviando...' : 'Submeter para Auditoria'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
