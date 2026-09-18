import React from 'react';
import { X, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useModalHistory } from '../../utils/modalHistory';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
  useModalHistory(isOpen, 'politica_privacidade_mz', onClose);

  if (!isOpen) return null;

  return (
    <div id="privacy_modal_overlay" className="modal-useful-fullscreen-overlay">
      <div id="privacy_modal_window" className="modal-useful-fullscreen-window bg-white flex flex-col animate-in fade-in duration-150 text-xs text-slate-700">
        <div className="bg-slate-900 text-white p-4 sm:p-5 shrink-0 sticky top-0 z-10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1 text-xs font-bold transition cursor-pointer"
              title="Voltar"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Voltar</span>
            </button>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h2 className="text-sm sm:text-base font-black">Política de Privacidade</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition cursor-pointer"
            title="Fechar (X)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-4 leading-relaxed">
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

        <div className="p-4 bg-slate-50 border-t border-slate-200 text-right shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs cursor-pointer"
          >
            Entendido e Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
