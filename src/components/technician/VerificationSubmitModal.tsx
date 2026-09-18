import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { X, ArrowLeft, ShieldCheck, Upload, CheckCircle2, AlertCircle, FileText, Check } from 'lucide-react';
import { useModalHistory } from '../../utils/modalHistory';

interface VerificationSubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VerificationSubmitModal: React.FC<VerificationSubmitModalProps> = ({
  isOpen,
  onClose
}) => {
  const { submitVerificationDocuments } = useData();
  const { currentUser } = useAuth();

  const [idCardFile, setIdCardFile] = useState<string>('');
  const [certFile, setCertFile] = useState<string>('');
  const [licenseFile, setLicenseFile] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Interceptação do botão voltar
  useModalHistory(isOpen, 'solicitar_selo_verificado', onClose);

  if (!isOpen || !currentUser) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!idCardFile && !certFile) {
      setError('Por favor anexe pelo menos o Bilhete de Identidade (BI) ou Certificado de Formação Técnica.');
      return;
    }

    setIsSubmitting(true);
    const docs = [];
    if (idCardFile) docs.push(`BI_ou_Passaporte_${idCardFile}`);
    if (certFile) docs.push(`Certificado_Tecnico_${certFile}`);
    if (licenseFile) docs.push(`Licenca_Profissional_${licenseFile}`);

    submitVerificationDocuments(currentUser.uid, docs);

    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 2000);
    setIsSubmitting(false);
  };

  return (
    <div id="verification_submit_modal_overlay" className="modal-useful-fullscreen-overlay">
      <div id="verification_submit_modal_window" className="modal-useful-fullscreen-window bg-white flex flex-col animate-in fade-in duration-150">
        {/* Header */}
        <div className="bg-blue-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0 sticky top-0 z-10">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-blue-800 hover:bg-blue-700 text-blue-200 flex items-center gap-1 text-xs font-bold transition cursor-pointer shrink-0"
              title="Voltar"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Voltar</span>
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-amber-400 text-[10px] sm:text-xs font-bold uppercase">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                <span>Verificação Profissional</span>
              </div>
              <h2 className="text-sm sm:text-base font-black truncate">
                Solicitar Selo de Verificado
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-blue-800 text-blue-300 hover:text-white hover:bg-blue-700 transition cursor-pointer shrink-0"
            title="Fechar (X)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto">
        {success ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black text-slate-900">Documentos Enviados!</h3>
            <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
              Os seus documentos estão agora em análise pela nossa equipe de moderação. O resultado será emitido em até 24 horas.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 sm:p-7 space-y-4 text-xs">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                1. Bilhete de Identidade (BI) / DIRE ou Passaporte *
              </label>
              <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span className="text-slate-700 font-medium">
                    {idCardFile || 'Nenhum arquivo selecionado'}
                  </span>
                </div>
                <label className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold cursor-pointer transition">
                  Anexar
                  <input
                    type="file"
                    className="hidden"
                    onChange={e => setIdCardFile(e.target.files?.[0]?.name || '')}
                  />
                </label>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                2. Certificado de Habilitações Técnicas / Diploma *
              </label>
              <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <span className="text-slate-700 font-medium">
                    {certFile || 'Nenhum arquivo selecionado'}
                  </span>
                </div>
                <label className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold cursor-pointer transition">
                  Anexar
                  <input
                    type="file"
                    className="hidden"
                    onChange={e => setCertFile(e.target.files?.[0]?.name || '')}
                  />
                </label>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                3. Carteira Profissional / Licença (Opcional)
              </label>
              <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-700 font-medium">
                    {licenseFile || 'Nenhum arquivo selecionado'}
                  </span>
                </div>
                <label className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-bold cursor-pointer transition">
                  Anexar
                  <input
                    type="file"
                    className="hidden"
                    onChange={e => setLicenseFile(e.target.files?.[0]?.name || '')}
                  />
                </label>
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
              <strong>Aviso de Privacidade:</strong> Seus documentos são estritamente confidenciais e utilizados única e exclusivamente para a verificação de idoneidade e competência pela equipe administrativa da TécnicaMZ.
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition shadow-sm"
            >
              {isSubmitting ? 'Enviando Documentos...' : 'Enviar para Análise'}
            </button>
          </form>
        )}
        </div>
      </div>
    </div>
  );
};
