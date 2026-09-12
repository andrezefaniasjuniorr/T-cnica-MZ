import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Sparkles,
  Wrench,
  Gift,
  ClipboardList,
  Send,
  MessageCircle,
  Calculator,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  ArrowRight,
  ArrowLeft,
  X,
  Zap,
  Phone,
  FileText,
  Building2,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export const resetOnboardingTour = () => {
  try {
    localStorage.removeItem('tecnica_mz_onboarding_completed');
    localStorage.setItem('tecnica_mz_onboarding_completed', 'false');
  } catch {}
  window.dispatchEvent(new CustomEvent('tecnica_mz_open_onboarding'));
};

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: string) => void;
  initialStep?: number;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
  initialStep = 1
}) => {
  const { currentUser, isTechnician, isCompany } = useAuth();
  const [currentStep, setCurrentStep] = useState<number>(initialStep);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Reinicia para a primeira etapa sempre que o modal for aberto
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(initialStep || 1);
      setCopiedKey(null);
    }
  }, [isOpen, initialStep]);

  if (!isOpen) return null;

  const totalSteps = 4;

  const handleFinish = (targetTab?: string) => {
    try {
      localStorage.setItem('tecnica_mz_onboarding_completed', 'true');
    } catch {}
    onClose();
    if (targetTab) {
      onNavigateTab(targetTab);
    }
  };

  const handleSkip = () => {
    try {
      localStorage.setItem('tecnica_mz_onboarding_completed', 'true');
    } catch {}
    onClose();
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleCopy = (text: string, key: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => {
        setCopiedKey(null);
      }, 2500);
    } catch (err) {
      console.warn('Erro ao copiar texto:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto transition-all">
        
        {/* Header Superior com Progresso e Fechar */}
        <div className="px-6 pt-5 pb-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
              Passo {currentStep} de {totalSteps}
            </span>
            <span className="text-xs font-bold text-slate-500 hidden sm:inline">
              {currentStep === 1 && 'Boas-Vindas & Teste Grátis'}
              {currentStep === 2 && 'Mural de Serviços'}
              {currentStep === 3 && 'Ferramentas & Tabelas EDM'}
              {currentStep === 4 && 'Selo MZ & Perfil Profissional'}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleSkip}
              className="text-xs font-bold text-slate-400 hover:text-slate-600 px-2 py-1 rounded-lg hover:bg-slate-200/60 transition"
              title="Pular tour e começar a usar o app"
            >
              Pular
            </button>
            <button
              onClick={handleSkip}
              className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 flex items-center justify-center transition"
              title="Fechar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Barra de Progresso com 4 Segmentos */}
        <div className="grid grid-cols-4 gap-1.5 px-6 pt-3 pb-1 bg-slate-50/60">
          {[1, 2, 3, 4].map(step => (
            <button
              key={step}
              type="button"
              onClick={() => setCurrentStep(step)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                step <= currentStep
                  ? 'bg-blue-600 shadow-xs'
                  : 'bg-slate-200 hover:bg-slate-300'
              }`}
              title={`Ir para o Passo ${step}`}
            />
          ))}
        </div>

        {/* Conteúdo Dinâmico por Etapa */}
        <div className="p-6 sm:p-7 space-y-5 overflow-y-auto max-h-[68vh]">
          
          {/* ============================================================ */}
          {/* ETAPA 1: BEM-VINDO & TESTE GRÁTIS DE 3 DIAS                  */}
          {/* ============================================================ */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-200">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
                  <Sparkles className="w-7 h-7 text-amber-300" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black tracking-wide mb-1">
                    <Gift className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Teste Grátis de 3 Dias Ativado</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Bem-vindo ao TécnicaMZ Pro!
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    O maior ecossistema de profissionais técnicos e engenharia de Moçambique.
                  </p>
                </div>
              </div>

              {/* Caixa Destaque de 3 Dias Grátis */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50/60 border border-blue-200/80 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-blue-900 font-black text-sm">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                  <span>Seu período de degustação VIP está ativo</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Sua conta conta com <strong>3 dias de teste grátis ilimitado</strong>. Você tem acesso completo para explorar o aplicativo, visualizar pedidos de clientes em sua região, testar as calculadoras de normas EDM e emitir propostas com sua marca.
                </p>
              </div>

              {/* Benefícios Inclusos no Período */}
              <div className="space-y-2.5 pt-1">
                <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                  O que você pode fazer agora:
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-700">
                  <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900 block">Mural de Clientes</span>
                      <span className="text-[11px] text-slate-500">Receba solicitações reais de instalações e orçamentos.</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900 block">Calculadoras EDM</span>
                      <span className="text-[11px] text-slate-500">Dimensionamento 220V/380V e tabelas oficiais 50Hz.</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900 block">Ordens de Serviço em PDF</span>
                      <span className="text-[11px] text-slate-500">Emissão formal com seu logotipo e garantia.</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900 block">Sara IA Integrada</span>
                      <span className="text-[11px] text-slate-500">Diagnóstico técnico por imagem e consulta normativa.</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
                <span className="text-base">💡</span>
                <span>Sem renovação oculta ou cobrança automática. Aproveite para fechar suas primeiras obras!</span>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* ETAPA 2: MURAL DE SERVIÇOS & OPORTUNIDADES                  */}
          {/* ============================================================ */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-200">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/20">
                  <ClipboardList className="w-7 h-7" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[11px] font-black tracking-wide mb-1">
                    <Zap className="w-3.5 h-3.5 text-blue-600" />
                    <span>Oportunidades em Tempo Real</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Mural de Serviços
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Veja pedidos de clientes em Moçambique e envie propostas diretas.
                  </p>
                </div>
              </div>

              {/* Como Funciona o Fluxo do Mural */}
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                  <div className="w-7 h-7 rounded-xl bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900">Clientes Publicam Pedidos Diários</h4>
                    <p className="text-[11px] text-slate-600 leading-relaxed mt-0.5">
                      Empresas e residências publicam solicitações de instalação elétrica, reparação de quadros, geradores, bombas de água, climatização e energia solar.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                  <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900">Envie sua Proposta de Valor</h4>
                    <p className="text-[11px] text-slate-600 leading-relaxed mt-0.5">
                      Ao encontrar um pedido na sua província ou especialidade, você envia sua estimativa de mão de obra e materiais com prazo de atendimento.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                  <div className="w-7 h-7 rounded-xl bg-amber-500 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900">Contato Direto via WhatsApp ou Telefone</h4>
                    <p className="text-[11px] text-slate-600 leading-relaxed mt-0.5">
                      Converse diretamente com o cliente sem intermediários. Todo o valor do serviço acordado fica 100% com você — sem comissões ocultas.
                    </p>
                  </div>
                </div>
              </div>

              {/* Dica de Agilidade */}
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2 font-medium">
                <MessageCircle className="w-4 h-4 text-emerald-700 shrink-0" />
                <span><strong>Dica de Ouro:</strong> Os técnicos que respondem aos pedidos nos primeiros 30 minutos fecham 3x mais serviços.</span>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* ETAPA 3: FERRAMENTAS & TABELAS EDM                           */}
          {/* ============================================================ */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-200">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-500/20">
                  <Calculator className="w-7 h-7" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[11px] font-black tracking-wide mb-1">
                    <Wrench className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Engenharia de Campo</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Ferramentas & Tabelas EDM
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Cálculos precisos segundo normas da Eletricidade de Moçambique.
                  </p>
                </div>
              </div>

              {/* Cards das Principais Ferramentas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                  <div className="flex items-center gap-2 text-blue-700 font-black text-xs">
                    <Zap className="w-4 h-4 text-blue-600" />
                    <span>Queda de Tensão (220V/380V)</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Cálculo da queda percentual de tensão para monofásico e trifásico (50Hz), prevenindo queima de motores e aparelhos.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                  <div className="flex items-center gap-2 text-emerald-700 font-black text-xs">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Dimensionamento de Cabos</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Seleção correta da bitola em mm² e amperagem dos disjuntores para fiação segura em Moçambique.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                  <div className="flex items-center gap-2 text-indigo-700 font-black text-xs">
                    <FileText className="w-4 h-4 text-indigo-600" />
                    <span>Ordens de Serviço em PDF</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Emita orçamentos técnicos com seu logotipo, termos de garantia e linhas de assinatura centralizadas.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                  <div className="flex items-center gap-2 text-amber-700 font-black text-xs">
                    <Building2 className="w-4 h-4 text-amber-600" />
                    <span>Portfólio Antes & Depois</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Gere imagens profissionais em alta definição das suas obras com logotipo para postar no WhatsApp e redes.
                  </p>
                </div>
              </div>

              {/* Como Acessar */}
              <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-xl text-xs text-blue-900 flex items-center justify-between">
                <span className="font-semibold">Onde encontrar: Toque no ícone <strong>Ferramentas</strong> na barra de navegação.</span>
                <span className="text-[10px] font-black text-blue-600 bg-white px-2 py-0.5 rounded border border-blue-200">
                  Menu Principal
                </span>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* ETAPA 4: SELO MZ & PERFIL PROFISSIONAL                       */}
          {/* ============================================================ */}
          {currentStep === 4 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-200">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-500/20">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-black tracking-wide mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Credibilidade Máxima</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Selo MZ & Perfil Profissional
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Ative o selo verificado e conquiste a confiança dos melhores clientes.
                  </p>
                </div>
              </div>

              {/* 1. Importância do Perfil */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5 text-xs text-slate-700">
                <h4 className="font-black text-slate-900 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>1. Complete seu Perfil Técnico</span>
                </h4>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Adicione sua foto de trabalho, biografia profissional, especialidade e número de WhatsApp no perfil. Perfis com foto e província recebem até 4x mais pedidos diretos!
                </p>
              </div>

              {/* 2. Como Ativar o Selo MZ */}
              <div className="p-4 bg-gradient-to-br from-amber-50/60 to-yellow-50 border border-amber-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-amber-950 text-xs flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                    <span>2. Como Ativar o Selo MZ Verificado</span>
                  </h4>
                  <span className="text-[10px] font-black text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded">
                    Oficial Moçambique
                  </span>
                </div>

                <p className="text-[11px] text-amber-900 leading-relaxed">
                  O Selo MZ garante o crachá dourado de técnico verificado, posiciona você no topo das pesquisas e libera permanentemente as ferramentas do sistema.
                </p>

                {/* Dados de Pagamento M-Pesa e e-Mola com Botão de Copiar */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  
                  {/* Cartão M-Pesa */}
                  <div className="p-3 bg-white rounded-xl border border-amber-200/80 shadow-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-rose-600 tracking-wider">M-Pesa</span>
                      <button
                        type="button"
                        onClick={() => handleCopy('851949159', 'mpesa')}
                        className="text-[10px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 px-2 py-0.5 bg-blue-50 rounded"
                        title="Copiar número do M-Pesa"
                      >
                        {copiedKey === 'mpesa' ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-700">Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copiar</span>
                          </>
                        )}
                      </button>
                    </div>
                    <div className="font-mono font-black text-sm text-slate-900 tracking-wider">
                      851949159
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium">
                      Titular: André Zefanias Júnior
                    </div>
                  </div>

                  {/* Cartão e-Mola */}
                  <div className="p-3 bg-white rounded-xl border border-amber-200/80 shadow-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-amber-600 tracking-wider">e-Mola</span>
                      <button
                        type="button"
                        onClick={() => handleCopy('872943159', 'emola')}
                        className="text-[10px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 px-2 py-0.5 bg-blue-50 rounded"
                        title="Copiar número do e-Mola"
                      >
                        {copiedKey === 'emola' ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-700">Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copiar</span>
                          </>
                        )}
                      </button>
                    </div>
                    <div className="font-mono font-black text-sm text-slate-900 tracking-wider">
                      872943159
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium">
                      Titular: André Zefanias Júnior
                    </div>
                  </div>

                </div>

                <p className="text-[10px] text-amber-800 text-center font-medium">
                  Após a transferência, anexe o comprovativo ou contacte o suporte oficial para liberação imediata.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Rodapé de Navegação Interativa */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between gap-3">
          
          {/* Botão Anterior */}
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handlePrev}
              className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Anterior</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSkip}
              className="text-xs font-bold text-slate-400 hover:text-slate-600 px-2 py-2"
            >
              Pular Tour
            </button>
          )}

          {/* Botões do Lado Direito */}
          <div className="flex items-center gap-2">
            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl text-xs flex items-center gap-2 transition shadow-md shadow-blue-600/20 cursor-pointer active:scale-95"
              >
                <span>Próximo</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleFinish(isTechnician || isCompany ? 'settings' : 'community')}
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black rounded-xl text-xs flex items-center gap-2 transition shadow-md shadow-emerald-600/25 cursor-pointer active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Concluir e Começar</span>
                </button>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
