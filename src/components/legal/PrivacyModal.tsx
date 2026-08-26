import React from 'react';
import { X, ShieldCheck } from 'lucide-react';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in text-xs text-slate-700">
        <div className="bg-slate-900 text-white p-6 relative flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-black">Política de Privacidade • TécnicaMZ</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/10 text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 sm:p-8 max-h-[70vh] overflow-y-auto space-y-4 leading-relaxed">
          <div>
            <h3 className="font-bold text-slate-900 text-sm mb-1">1. Coleta de Dados Pessoais</h3>
            <p>
              Coletamos nome, e-mail, número de telefone / WhatsApp, especialidade profissional e localização (província e cidade) com a finalidade exclusiva de prestar serviços de intermediação e orçamentação técnica.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 text-sm mb-1">2. Documentos de Identificação (BI / Diplomas)</h3>
            <p>
              Os documentos enviados para verificação do selo de técnico são armazenados em ambiente seguro com controle de acesso estrito aos administradores autorizados e nunca são divulgados publicamente na plataforma.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 text-sm mb-1">3. Compartilhamento de Contato Comercial</h3>
            <p>
              Ao publicar o seu perfil profissional como Técnico ou solicitar um orçamento como Cliente, você autoriza que seu número de WhatsApp e nome sejam exibidos para facilitar o contato direto entre as partes.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 text-sm mb-1">4. Direitos do Titular</h3>
            <p>
              Você pode solicitar a alteração, atualização ou exclusão de seus dados cadastrais a qualquer momento através do e-mail de suporte da TécnicaMZ.
            </p>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 text-right">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
