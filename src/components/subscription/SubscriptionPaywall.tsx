import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { SubscriptionPlan } from '../../types';
import { CheckoutModal } from './CheckoutModal';
import {
  Wrench,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Zap,
  Sparkles,
  Crown,
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
  Star
} from 'lucide-react';

export const SubscriptionPaywall: React.FC = () => {
  const { currentUser, logout, isSubscriptionActive, subscriptionExpirationDate } = useAuth();
  const { plans } = useData();

  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState<SubscriptionPlan | null>(null);
  const [showFAQ, setShowFAQ] = useState(false);

  // Normalize 3 plans
  const activePlans = plans.filter(p => p.active !== false).sort((a, b) => a.priceMZN - b.priceMZN);

  const isExpired = subscriptionExpirationDate && new Date(subscriptionExpirationDate).getTime() < Date.now();

  return (
    <div id="subscription_paywall_container" className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-500 selection:text-white">
      {/* Top Bar with Brand & Logout */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-black tracking-tight text-white">TécnicaMZ Pro</span>
              <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-extrabold uppercase border border-blue-500/30">
                Paywall Moçambique
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Plataforma Oficial de Técnicos e Engenharia de Moçambique
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
                {isExpired ? 'Assinatura Expirada' : 'Sem Assinatura Ativa'}
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
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex flex-col items-center">
        {/* Hero Notice */}
        <div className="text-center max-w-3xl space-y-4 mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-black uppercase tracking-wider">
            <Lock className="w-3.5 h-3.5" />
            Acesso Restrito por Assinatura
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
            Escolha o Seu Pacote e Desbloqueie a <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-sky-400">TécnicaMZ Pro</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Olá, <strong>{currentUser?.name || 'Técnico'}</strong>. Para ter acesso total ao Feed, Comunidade Técnica, Gerador de Ordens de Serviço, Sara IA e Mercado, ative a sua subscrição mensal via <strong>M-Pesa</strong> ou <strong>e-Mola</strong>.
          </p>

          {isExpired && (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center justify-center gap-2 max-w-lg mx-auto">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              O seu período de assinatura terminou. Renove agora para continuar a receber pedidos e utilizar as ferramentas.
            </div>
          )}
        </div>

        {/* 3 Packages Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 w-full items-stretch">
          {activePlans.map((plan) => {
            const isPopular = plan.isPopular || plan.id === 'plano_profissional' || plan.priceMZN === 199;
            const isVip = plan.id === 'plano_empresa_vip' || plan.priceMZN >= 400;
            const isBasic = plan.id === 'plano_basico' || plan.priceMZN <= 50;

            return (
              <div
                key={plan.id}
                id={`card_plan_${plan.id}`}
                className={`relative rounded-3xl flex flex-col justify-between transition-all duration-300 ${
                  isPopular
                    ? 'bg-gradient-to-b from-blue-900/60 via-slate-900 to-slate-900 border-2 border-blue-500 shadow-2xl shadow-blue-500/20 md:-translate-y-2'
                    : isVip
                    ? 'bg-gradient-to-b from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/40 shadow-xl shadow-amber-500/10'
                    : 'bg-slate-900/80 border border-slate-800 shadow-lg'
                } p-6 sm:p-7`}
              >
                {/* Popular / VIP Badge */}
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-blue-600/40">
                    <Flame className="w-3.5 h-3.5" />
                    Mais Popular
                  </div>
                )}
                {isVip && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-amber-500/30">
                    <Crown className="w-3.5 h-3.5" />
                    Acesso Total VIP
                  </div>
                )}
                {isBasic && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-[11px] font-bold uppercase tracking-wider">
                    Entrada / Navegação
                  </div>
                )}

                <div>
                  {/* Card Header */}
                  <div className="text-center pt-2 pb-6 border-b border-slate-800">
                    <h3 className="text-xl font-black text-white mb-2">
                      {plan.name}
                    </h3>
                    <p className="text-xs text-slate-400 min-h-[32px]">
                      {isBasic && 'Acesso essencial de navegação para técnicos iniciantes.'}
                      {isPopular && 'O plano completo para técnicos verificados com OS e Sara IA.'}
                      {isVip && 'Liberdade total e máxima visibilidade para empresas e líderes.'}
                    </p>

                    {/* Price Tag */}
                    <div className="mt-5 flex items-baseline justify-center gap-1">
                      <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                        {plan.priceMZN}
                      </span>
                      <span className="text-sm font-bold text-slate-400">MT / mês</span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-medium block mt-1">
                      (Válido por 30 dias • Pagamento via M-Pesa / e-Mola)
                    </span>
                  </div>

                  {/* Permissions & Benefits List */}
                  <div className="py-6 space-y-4">
                    <div>
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-400 block mb-2.5">
                        Permissões e Vantagens Incluídas:
                      </span>
                      <ul className="space-y-2.5">
                        {(plan.permissions || plan.benefits || []).map((perm, idx) => (
                          <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-200 leading-snug">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            <span>{perm}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Restrictions (if any) */}
                    {plan.restrictions && plan.restrictions.length > 0 && (
                      <div className="pt-2">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-rose-400/90 block mb-2">
                          Restrições deste Pacote:
                        </span>
                        <ul className="space-y-2">
                          {plan.restrictions.map((rest, idx) => (
                            <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-400 leading-snug">
                              <XCircle className="w-4 h-4 text-rose-400/80 shrink-0 mt-0.5" />
                              <span>{rest}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card CTA Action */}
                <div className="pt-4 border-t border-slate-800">
                  <button
                    id={`btn_select_plan_${plan.id}`}
                    type="button"
                    onClick={() => setSelectedPlanForCheckout(plan)}
                    className={`w-full py-4 px-5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98] ${
                      isPopular
                        ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30'
                        : isVip
                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/25 font-black'
                        : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                    }`}
                  >
                    <span>Subscrever por {plan.priceMZN} MT</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Feature Comparison Highlights */}
        <div className="mt-14 w-full bg-slate-900/60 rounded-3xl border border-slate-800 p-6 sm:p-8">
          <h3 className="text-lg font-black text-white text-center mb-6 flex items-center justify-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-400" />
            Resumo de Recursos por Pacote
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Funcionalidade</th>
                  <th className="py-3 px-4 text-center">Básico (50 MT)</th>
                  <th className="py-3 px-4 text-center text-blue-400">Profissional (199 MT)</th>
                  <th className="py-3 px-4 text-center text-amber-400">Empresa / VIP (499 MT)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300 font-medium">
                <tr>
                  <td className="py-3 px-4 flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-slate-400" />
                    Feed e Mural de Notícias
                  </td>
                  <td className="py-3 px-4 text-center text-emerald-400 font-bold">✓ Liberado</td>
                  <td className="py-3 px-4 text-center text-emerald-400 font-bold">✓ Liberado</td>
                  <td className="py-3 px-4 text-center text-emerald-400 font-bold">✓ Destaque no Topo</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 flex items-center gap-2">
                    <Award className="w-4 h-4 text-blue-400" />
                    Selo Verificado no Perfil
                  </td>
                  <td className="py-3 px-4 text-center text-slate-500">✗ Sem Selo</td>
                  <td className="py-3 px-4 text-center text-blue-400 font-bold">✓ Técnico Verificado</td>
                  <td className="py-3 px-4 text-center text-amber-400 font-bold">👑 Empresa / Técnico VIP</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-400" />
                    Gerador de OS em PDF
                  </td>
                  <td className="py-3 px-4 text-center text-rose-400">✗ Bloqueado</td>
                  <td className="py-3 px-4 text-center text-emerald-400 font-bold">✓ Ilimitado</td>
                  <td className="py-3 px-4 text-center text-emerald-400 font-bold">✓ Ilimitado</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 flex items-center gap-2">
                    <Bot className="w-4 h-4 text-emerald-400" />
                    Sara IA (Engenharia MZ)
                  </td>
                  <td className="py-3 px-4 text-center text-rose-400">✗ Bloqueado</td>
                  <td className="py-3 px-4 text-center text-emerald-400 font-bold">✓ Acesso Total</td>
                  <td className="py-3 px-4 text-center text-emerald-400 font-bold">✓ Acesso Total</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-amber-400" />
                    Publicações no Mercado
                  </td>
                  <td className="py-3 px-4 text-center text-rose-400">✗ Bloqueado</td>
                  <td className="py-3 px-4 text-center text-slate-500">✗ Apenas Navegação</td>
                  <td className="py-3 px-4 text-center text-amber-400 font-bold">✓ Anúncios Ilimitados</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* WhatsApp Support Assistance */}
        <div className="mt-8 text-center space-y-2">
          <p className="text-xs text-slate-400">
            Dúvidas sobre os pagamentos ou ativação corporativa?
          </p>
          <a
            href="https://wa.me/258849990001?text=Ola%20equipa%20TecnicaMZ,%20preciso%20de%20ajuda%20com%20o%20plano%20de%20subscricao"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition-colors"
          >
            <Phone className="w-3.5 h-3.5" />
            Falar com o Suporte Oficial via WhatsApp (+258 84 999 0001)
          </a>
        </div>
      </main>

      {/* Checkout Modal */}
      {selectedPlanForCheckout && (
        <CheckoutModal
          plan={selectedPlanForCheckout}
          onClose={() => setSelectedPlanForCheckout(null)}
          onSuccess={() => {
            setSelectedPlanForCheckout(null);
          }}
        />
      )}
    </div>
  );
};
