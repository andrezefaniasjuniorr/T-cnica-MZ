import React from 'react';
import { X, ArrowLeft, Shield, FileText } from 'lucide-react';
import { useModalHistory } from '../../utils/modalHistory';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose }) => {
  useModalHistory(isOpen, 'termos_condicoes_mz', onClose);

  if (!isOpen) return null;

  return (
    <div id="terms_modal_overlay" className="modal-useful-fullscreen-overlay">
      <div id="terms_modal_window" className="modal-useful-fullscreen-window bg-white flex flex-col animate-in fade-in duration-150 text-xs text-slate-700">
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
              <FileText className="w-5 h-5 text-amber-400" />
              <h2 className="text-sm sm:text-base font-black">Termos e Condições de Uso</h2>
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
            <h3 className="font-bold text-slate-900 text-sm mb-1">1. Objeto da Plataforma</h3>
            <p>
              A TécnicaMZ é uma plataforma digital que conecta profissionais técnicos independentes e empresas prestadoras de serviços a clientes interessados na contratação de mão de obra técnica em Moçambique.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 text-sm mb-1">2. Responsabilidade pelos Serviços</h3>
            <p>
              A execução técnica, cumprimento de prazos, garantias e preços orçados são de inteira responsabilidade das partes contratantes (Cliente e Técnico). A TécnicaMZ atua como canal facilitador e provedor de verificação documental cadastral.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 text-sm mb-1">3. Assinaturas e Planos Técnicos</h3>
            <p>
              Os planos de assinatura profissional (Básico, Profissional e Empresarial) possuem vigência de 30 dias após aprovação administrativa do comprovativo de pagamento oficial via M-Pesa, e-Mola ou transferência bancária.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 text-sm mb-1">4. Verificação de Identidade e Selos</h3>
            <p>
              O selo de "Técnico Verificado" é concedido mediante análise manual de documento de identidade válido (BI/DIRE) e certificados de habilitação técnica. Qualquer fraude ensejará a suspensão imediata da conta.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 text-sm mb-1">5. Legislação Aplicável</h3>
            <p>
              Estes termos são regidos pelas leis da República de Moçambique.
            </p>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 text-right shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs cursor-pointer"
          >
            Compreendi e Aceito
          </button>
        </div>
      </div>
    </div>
  );
};
