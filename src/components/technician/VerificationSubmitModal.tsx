import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { X, ShieldCheck, Upload, CheckCircle2, AlertCircle, FileText, Check } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-blue-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase mb-1">
            <ShieldCheck className="w-4 h-4" />
            Verificação Profissional
          </div>
          <h2 className="text-xl sm:text-2xl font-black">
            Solicitar Selo de Técnico Verificado
          </h2>
          <p className="text-xs text-blue-200 mt-0.5">
            O selo oficial aumenta em até 5x as contratações e transmite total confiança aos clientes.
          </p>
        </div>

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
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
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
  );
};
