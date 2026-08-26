import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import {
  User,
  Wrench,
  Building2,
  Shield,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Briefcase,
  Layers,
  Lock
} from 'lucide-react';

interface RoleEntryCardsProps {
  onSelectRole: (role: UserRole, mode?: 'login' | 'register') => void;
  onNavigateTab: (tab: string) => void;
}

export const RoleEntryCards: React.FC<RoleEntryCardsProps> = ({ onSelectRole, onNavigateTab }) => {
  const { currentUser, isClient, isTechnician, isCompany, isAdmin } = useAuth();

  const roleCards = [
    {
      role: 'client' as UserRole,
      title: 'Entrar como Cliente',
      subtitle: 'Contrate Profissionais & Obras',
      desc: 'Encontre técnicos certificados, solicite orçamentos detalhados em MZN e avalie serviços com total segurança.',
      icon: <User className="w-7 h-7 text-emerald-500" />,
      accentColor: 'from-emerald-500/10 to-teal-500/5 hover:border-emerald-500/50',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      btnColor: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20',
      pill: '👤 CLIENTES & PARTICULARES',
      features: ['Busca por especialidade e província', 'Receba propostas com custo de materiais', 'Acesso direto via WhatsApp validado'],
      targetTab: 'client'
    },
    {
      role: 'technician' as UserRole,
      title: 'Entrar como Técnico',
      subtitle: 'Destaque sua Carreira & Serviços',
      desc: 'Crie seu perfil profissional com selo verificado, receba pedidos diários, emita orçamentos e candidate-se a vagas empresariais.',
      icon: <Wrench className="w-7 h-7 text-blue-500" />,
      accentColor: 'from-blue-500/10 to-indigo-500/5 hover:border-blue-500/50',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
      btnColor: 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20',
      pill: '🔧 TÉCNICOS & ENGENHEIROS',
      features: ['Selo Oficial Verificado pela TécnicaMZ', 'Candidaturas diretas no /jobs', 'Gerador de Orçamentos e Sara IA'],
      targetTab: 'technician'
    },
    {
      role: 'company' as UserRole,
      title: 'Entrar como Empresa',
      subtitle: 'Recrutamento & Gestão de Projetos',
      desc: 'Publique vagas técnicas em todo Moçambique, filtre candidatos qualificados por NUIT/experiência e contrate com agilidade.',
      icon: <Building2 className="w-7 h-7 text-purple-500" />,
      accentColor: 'from-purple-500/10 to-violet-500/5 hover:border-purple-500/50',
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
      btnColor: 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/20',
      pill: '🏢 EMPRESAS & INDÚSTRIAS',
      features: ['Publicação ilimitada de vagas técnicas', 'Triagem de candidatos por status', 'Empresa com selo NUIT Verificado'],
      targetTab: 'company'
    },
    {
      role: 'admin' as UserRole,
      title: 'Entrar como Administrador',
      subtitle: 'Gestão, Finanças & Moderação',
      desc: 'Área restrita de controle da TécnicaMZ: aprovação de pagamentos M-Pesa / e-Mola, auditoria, moderação e configurações.',
      icon: <Shield className="w-7 h-7 text-amber-500" />,
      accentColor: 'from-amber-500/10 to-orange-500/5 hover:border-amber-500/50',
      badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
      btnColor: 'bg-slate-900 hover:bg-slate-800 text-amber-400 border border-amber-500/30 shadow-amber-500/10',
      pill: '🛡️ PORTAL ADMINISTRATIVO',
      features: ['Aprovação financeira M-Pesa / e-Mola', 'Gestão de usuários, NUIT e selos', 'Super Admin com controle total'],
      targetTab: 'admin'
    }
  ];

  return (
    <section className="py-14 sm:py-20 bg-slate-900 text-white relative overflow-hidden border-y border-slate-800">
      <div className="absolute inset-0 bg-radial from-blue-900/20 via-transparent to-transparent pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-900/60 border border-blue-700/60 text-blue-300 text-xs font-bold shadow-xs">
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span>Arquitetura Multi-Perfil Segura • TécnicaMZ</span>
          </div>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            Como deseja entrar na <span className="text-blue-400">TécnicaMZ</span>?
          </h2>
          <p className="text-xs sm:text-base text-slate-300 font-normal max-w-2xl mx-auto">
            Cada tipo de utilizador possui um ambiente exclusivo, permissões estritas, ferramentas sob medida e painel próprio.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {roleCards.map(card => {
            const isUserCurrentRole = currentUser?.role === card.role || (card.role === 'admin' && isAdmin);

            return (
              <div
                key={card.role}
                className={`bg-slate-950/80 rounded-3xl p-6 sm:p-7 border border-slate-800 transition-all duration-300 flex flex-col justify-between hover:scale-[1.02] hover:shadow-2xl ${card.accentColor}`}
              >
                <div className="space-y-4">
                  {/* Pill Badge */}
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${card.badgeColor}`}>
                      {card.pill}
                    </span>
                    {isUserCurrentRole && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-800">
                        <CheckCircle2 className="w-3 h-3" /> Sessão Ativa
                      </span>
                    )}
                  </div>

                  {/* Icon & Title */}
                  <div className="pt-2">
                    <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-3 shadow-inner">
                      {card.icon}
                    </div>
                    <h3 className="text-lg font-black text-white">{card.title}</h3>
                    <p className="text-xs font-semibold text-blue-300 mt-0.5">{card.subtitle}</p>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {card.desc}
                  </p>

                  {/* Features List */}
                  <ul className="space-y-2 pt-2 border-t border-slate-800/80 text-[11px] text-slate-300">
                    {card.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Bottom Action */}
                <div className="pt-6 mt-6 border-t border-slate-800">
                  {currentUser && isUserCurrentRole ? (
                    <button
                      onClick={() => onNavigateTab(card.targetTab)}
                      className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-md ${card.btnColor}`}
                    >
                      <span>Acessar Meu Painel</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => onSelectRole(card.role, 'login')}
                        className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition border border-slate-700 text-center"
                      >
                        Entrar
                      </button>
                      <button
                        onClick={() => onSelectRole(card.role, 'register')}
                        className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 shadow-sm ${card.btnColor}`}
                      >
                        <span>Cadastrar</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
