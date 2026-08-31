import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Wrench,
  CheckCircle2,
  FileText,
  ShieldCheck,
  Phone,
  ArrowRight,
  Sparkles,
  User,
  Zap,
  BookOpen
} from 'lucide-react';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: string) => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab
}) => {
  const { currentUser, isTechnician, isCompany } = useAuth();

  if (!isOpen) return null;

  const isTechOrCompany = isTechnician || isCompany;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Banner Header */}
        <div className="bg-gradient-to-tr from-blue-600 to-sky-500 p-6 text-white relative">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-3">
            {isTechOrCompany ? (
              <Wrench className="w-6 h-6 text-white" />
            ) : (
              <User className="w-6 h-6 text-white" />
            )}
          </div>
          <h2 className="text-xl font-black tracking-tight">
            Bem-vindo à TécnicaMZ Pro!
          </h2>
          <p className="text-xs text-blue-100 mt-1">
            {isTechOrCompany
              ? 'A maior comunidade e ecossistema de profissionais técnicos de Moçambique.'
              : 'A forma mais rápida e segura de encontrar técnicos qualificados em Moçambique.'}
          </p>
        </div>

        {/* Content Guidelines */}
        <div className="p-6 space-y-4">
          <div className="text-xs font-black uppercase text-slate-400 tracking-wider">
            {isTechOrCompany ? 'Diretrizes para Técnicos e Empresas' : 'Como usar a plataforma com segurança'}
          </div>

          {isTechOrCompany ? (
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-blue-50/50 border border-blue-100 rounded-2xl">
                <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-black text-slate-900">Complete seu Perfil & Especialidade</h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Adicione sua província, cidade e número de WhatsApp para receber solicitações de orçamento diretamente no celular.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200/80 rounded-2xl">
                <FileText className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-black text-slate-900">Gerador de Ordem de Serviço (OS) & PDF</h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Utilize nossa aba de Ferramentas para emitir orçamentos formais e relatórios técnicos em PDF com assinatura para seus clientes.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200/80 rounded-2xl">
                <Sparkles className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-black text-slate-900">Assistente Sara IA & Diagnóstico</h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Envie fotos de placas, esquemas e diagramas para a Sara IA analisar e auxiliar em cálculos e normas da EDM.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-emerald-50/50 border border-emerald-100 rounded-2xl">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-black text-slate-900">Encontre Técnicos Verificados</h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Pesquise profissionais por especialidade e província com avaliações reais e certificações documentais.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200/80 rounded-2xl">
                <Phone className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-black text-slate-900">Contato Direto via WhatsApp</h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Converse diretamente com os técnicos, negocie orçamentos e esclareça dúvidas antes de fechar o serviço.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200/80 rounded-2xl">
                <Zap className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-black text-slate-900">Suporte Oficial TécnicaMZ</h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Nossa equipe oficial está disponível para apoio técnico pelo WhatsApp 841234567 ou tecnicamzpro@gmail.com.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="pt-2">
            <button
              onClick={() => {
                onClose();
                if (isTechOrCompany) {
                  onNavigateTab('settings');
                } else {
                  onNavigateTab('technicians_directory');
                }
              }}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 transition cursor-pointer"
            >
              <span>{isTechOrCompany ? 'Completar Meu Perfil Agora' : 'Explorar Profissionais Técnicos'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
