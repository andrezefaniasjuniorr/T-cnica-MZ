import React from 'react';
import { X, Shield, FileText } from 'lucide-react';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in text-xs text-slate-700">
        <div className="bg-slate-900 text-white p-6 relative flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-black">Termos e Condições de Uso • TécnicaMZ</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/10 text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 sm:p-8 max-h-[70vh] overflow-y-auto space-y-4 leading-relaxed">
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

        <div className="p-4 bg-slate-50 border-t border-slate-200 text-right">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs"
          >
            Compreendi e Aceito
          </button>
        </div>
      </div>
    </div>
  );
};
