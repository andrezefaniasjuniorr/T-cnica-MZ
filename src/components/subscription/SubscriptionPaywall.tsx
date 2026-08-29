import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { SubscriptionPlan } from '../../types';
import { CheckoutModal } from './CheckoutModal';
import {
  Wrench,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  LogOut,
  HelpCircle,
  Phone,
  FileText,
  Bot,
  ShoppingBag,
  Award,
  ArrowRight,
  Lock,
  Flame,
  Zap,
  Check
} from 'lucide-react';

export const SubscriptionPaywall: React.FC = () => {
  const { currentUser, logout, subscriptionExpirationDate } = useAuth();
  const { plans, settings } = useData();

  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState<SubscriptionPlan | null>(null);
  const [showFAQ, setShowFAQ] = useState(false);

  // Single active plan (50 MT/mês)
  const singlePlan = plans.find(p => p.active !== false) || {
    id: 'plano_tecnico_pro',
    name: 'Plano Técnico Pro',
    priceMZN: 50,
    durationDays: 30,
    tier: 'profissional' as const,
    active: true,
    priority: 1,
    badge: 'Acesso Total',
    createdAt: '2025-01-01',
    permissions: [
      'Gerador de Ordens de Serviço (OS) em PDF ilimitado',
      'Sara IA - Assistente Inteligente de Engenharia MZ',
      'Selo Oficial de Técnico / Empresa Verificado',
      'Publicações e anúncios livres no Mercado TécnicaMZ',
      'Acesso ao Mural Técnico e Feed de Discussões',
      'Visualização e candidatura a Vagas de Emprego',
      'Calculadoras técnicas de Energia Solar e Cabos'
    ],
    restrictions: [],
    benefits: [
      'Gerador de Ordens de Serviço em PDF ilimitado',
      'Sara IA de Engenharia Moçambicana',
      'Selo Oficial de Verificado no Perfil',
      'Anúncios Livres no Mercado'
    ]
  };

  const isExpired = subscriptionExpirationDate && new Date(subscriptionExpirationDate).getTime() < Date.now();

  const handleStartCheckout = () => {
    setSelectedPlanForCheckout(singlePlan);
  };

  const features = [
    {
      icon: <FileText className="w-5 h-5 text-blue-400" />,
      title: 'Gerador de Ordens de Serviço em PDF',
      desc: 'Crie orçamentos e relatórios técnicos com logotipo e download em PDF imediato.'
    },
    {
      icon: <Bot className="w-5 h-5 text-indigo-400" />,
      title: 'Sara IA - Assistente de Engenharia',
      desc: 'Tire dúvidas sobre normas EDM, dimensionamento solar, climatização e automação.'
    },
    {
      icon: <Award className="w-5 h-5 text-emerald-400" />,
      title: 'Selo Oficial de Verificado no Perfil',
      desc: 'Transmita confiança imediata para clientes e empresas contratantes em Moçambique.'
    },
    {
      icon: <ShoppingBag className="w-5 h-5 text-amber-400" />,
      title: 'Anúncios no Mercado TécnicaMZ',
      desc: 'Venda peças, ferramentas usadas ou novas e equipamentos especializados.'
    },
    {
      icon: <Zap className="w-5 h-5 text-sky-400" />,
      title: 'Mural Técnico & Oportunidades',
      desc: 'Acesso à rede de técnicos do país, postagens no mural e vagas de trabalho.'
    }
  ];

  return (
    <div id="subscription_paywall_container" className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-500 selection:text-white">
      {/* Top Bar */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-black tracking-tight text-white">TécnicaMZ Pro</span>
              <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-extrabold uppercase border border-blue-500/30">
                Plano Único 50 MT
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Acesso Profissional Ilimitado por apenas 50 MT / Mês
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {currentUser && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="font-semibold">{currentUser.name}</span>
              <span className="text-slate-500">|</span>
              <span className="text-amber-400 font-bold">
                {isExpired ? 'Assinatura Expirada' : 'Acesso Pendente'}
              </span>
            </div>
          )}

          <button
            id="btn_paywall_logout"
            type="button"
            onClick={() => logout()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-colors border border-slate-700/70"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Terminar Sessão</span>
            <span className="sm:hidden">Sair</span>
          </button>
        </div>
      </header>

      {/* Main Paywall Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex flex-col items-center justify-center">
        {/* Header Notice */}
        <div className="text-center max-w-2xl space-y-3 mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-extrabold uppercase tracking-wider">
            <Lock className="w-3.5 h-3.5" />
            Subscrição Profissional TécnicaMZ
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Desbloqueie Todas as Ferramentas por Apenas <span className="text-blue-400">50 MT / Mês</span>
          </h1>

          <p className="text-sm text-slate-300 leading-relaxed">
            Sem complicações ou pacotes caros. Um valor único e simbólico para capacitar técnicos e empresas em todo Moçambique.
          </p>

          {isExpired && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              A sua assinatura expirou. Renove agora para manter o acesso ininterrupto.
            </div>
          )}
        </div>

        {/* Pricing Card & Capabilities Presentation */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left: What's included */}
          <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-xl">
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Tudo Incluso</span>
                <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
                  O que está liberado no Plano Técnico Pro:
                </h2>
              </div>

              <div className="space-y-4">
                {features.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-3.5 p-3 rounded-2xl bg-slate-950/40 border border-slate-800/60">
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 shrink-0">
                      {feat.icon}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">{feat.title}</h3>
                      <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{feat.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-slate-800/80 flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Pagamento rápido e seguro via M-Pesa e e-Mola em Moçambique.</span>
            </div>
          </div>

          {/* Right: Checkout Action Card */}
          <div className="lg:col-span-5 bg-gradient-to-b from-blue-950/40 via-slate-900 to-slate-900 border-2 border-blue-500/50 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl relative">
            <div className="absolute -top-3.5 right-6 px-3.5 py-1 rounded-full bg-blue-600 text-white text-[11px] font-black uppercase tracking-wider flex items-center gap-1 shadow-lg shadow-blue-600/40">
              <Flame className="w-3.5 h-3.5 fill-current" />
              Plano Oficial
            </div>

            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold uppercase text-slate-400">Assinatura Mensal</span>
                <h3 className="text-2xl font-black text-white mt-1">{singlePlan.name}</h3>
                <p className="text-xs text-slate-400 mt-1">Acesso irrestrito durante 30 dias renováveis.</p>
              </div>

              {/* Price display */}
              <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 text-center">
                <span className="text-xs text-slate-400 uppercase font-semibold">Valor da Subscrição</span>
                <div className="flex items-baseline justify-center gap-1.5 mt-1">
                  <span className="text-5xl font-black text-white tracking-tight">50</span>
                  <span className="text-xl font-bold text-blue-400">MT</span>
                  <span className="text-xs text-slate-400 font-medium">/ 30 dias</span>
                </div>
                <p className="text-[11px] text-emerald-400 font-semibold mt-2">
                  ✓ Ativação imediata após confirmação M-Pesa / e-Mola
                </p>
              </div>

              {/* Checklist highlights */}
              <div className="space-y-2.5 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Gerador de OS em PDF ilimitado</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Sara IA sem limite de mensagens</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Selo Verificado de Confiança</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Publicação livre no Mercado Técnico</span>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="mt-8 space-y-3">
              <button
                id="btn-paywall-checkout"
                type="button"
                onClick={handleStartCheckout}
                className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-base transition-all shadow-xl shadow-blue-600/30 group"
              >
                <span>Pagar 50 MT e Desbloquear</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <p className="text-[11px] text-center text-slate-500">
                Ao clicar, você poderá escolher M-Pesa ou e-Mola e submeter o comprovativo.
              </p>
            </div>
          </div>
        </div>

        {/* Support Section */}
        <div className="mt-12 w-full max-w-xl text-center space-y-2 text-xs text-slate-400">
          <p>
            Precisa de ajuda com o pagamento? Contacte o suporte via WhatsApp:{' '}
            <a
              href="https://wa.me/258851949159"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 font-bold hover:underline"
            >
              (+258) 85 194 9159
            </a>
          </p>
        </div>
      </main>

      {/* Checkout Modal */}
      {selectedPlanForCheckout && (
        <CheckoutModal
          plan={selectedPlanForCheckout}
          isOpen={Boolean(selectedPlanForCheckout)}
          onClose={() => setSelectedPlanForCheckout(null)}
        />
      )}
    </div>
  );
};
