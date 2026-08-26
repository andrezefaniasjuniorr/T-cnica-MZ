import React from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Check, Zap, Sparkles, ShieldCheck, ArrowRight } from 'lucide-react';
import { SubscriptionPlan } from '../../types';

interface PlansSectionProps {
  onSelectPlan: (plan: SubscriptionPlan) => void;
  onOpenAuth: (role?: 'technician') => void;
}

export const PlansSection: React.FC<PlansSectionProps> = ({
  onSelectPlan,
  onOpenAuth
}) => {
  const { plans } = useData();
  const { currentUser, isTechnician } = useAuth();

  const activePlans = plans.filter(p => p.active);

  return (
    <section className="py-16 sm:py-24 bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold border border-blue-200">
            <Zap className="w-3.5 h-3.5" />
            Planos para Técnicos Profissionais
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Invista no seu Crescimento Profissional
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
            Tenha mais visibilidade em todo Moçambique, receba pedidos diretos no WhatsApp e utilize ferramentas técnicas avançadas.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch max-w-6xl mx-auto">
          {activePlans.map(plan => {
            const isPopular = plan.isPopular || plan.id === 'plan_premium';
            return (
              <div
                key={plan.id}
                className={`rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-200 relative bg-white border ${
                  isPopular
                    ? 'border-blue-600 ring-2 ring-blue-600/30 shadow-xl shadow-blue-600/10'
                    : 'border-slate-200 shadow-sm hover:shadow-md'
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-blue-600 text-white text-[11px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Mais Recomendado
                  </div>
                )}

                <div>
                  <div className="mb-4">
                    <h3 className="text-lg sm:text-xl font-black text-slate-900">{plan.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Válido por {plan.durationDays} dias após aprovação
                    </p>
                  </div>

                  <div className="mb-6 pb-6 border-b border-slate-100 flex items-baseline gap-1.5">
                    <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                      {plan.priceMZN.toLocaleString('pt-MZ')}
                    </span>
                    <span className="text-sm font-bold text-slate-500">MZN / 30 dias</span>
                  </div>

                  <ul className="space-y-3 text-xs text-slate-700 mb-8">
                    {plan.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <div className={`p-0.5 rounded-full mt-0.5 shrink-0 ${
                          isPopular ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          <Check className="w-3.5 h-3.5" />
                        </div>
                        <span className="leading-snug">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  {currentUser && isTechnician ? (
                    <button
                      onClick={() => onSelectPlan(plan)}
                      className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm ${
                        isPopular
                          ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20'
                          : 'bg-slate-900 hover:bg-slate-800 text-white'
                      }`}
                    >
                      <span>Assinar Plano {plan.name}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => onOpenAuth('technician')}
                      className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm ${
                        isPopular
                          ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20'
                          : 'bg-slate-900 hover:bg-slate-800 text-white'
                      }`}
                    >
                      <span>Começar como Técnico</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                  <p className="text-[10px] text-slate-400 text-center mt-2 font-medium">
                    Pagamento via M-Pesa, e-Mola ou Transferência
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
