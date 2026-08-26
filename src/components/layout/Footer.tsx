import React from 'react';
import { Wrench, Phone, Mail, MessageSquare, ShieldCheck, MapPin, Sparkles } from 'lucide-react';
import { useData } from '../../context/DataContext';

interface FooterProps {
  onOpenTerms: () => void;
  onOpenPrivacy: () => void;
  onSelectCategory: (cat: string) => void;
  setActiveTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenTerms,
  onOpenPrivacy,
  onSelectCategory,
  setActiveTab
}) => {
  const { settings } = useData();

  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 relative">
      {/* Mozambique Flag Color Accent Stripe */}
      <div className="h-1.5 w-full grid grid-cols-4">
        <div className="bg-emerald-600"></div>
        <div className="bg-slate-900"></div>
        <div className="bg-amber-400"></div>
        <div className="bg-rose-600"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Col 1 & 2: Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-600 text-amber-300 flex items-center justify-center shadow-lg">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xl font-black text-white tracking-tight">
                  Técnica<span className="text-blue-500">MZ</span>
                </span>
                <p className="text-xs text-amber-400 font-semibold -mt-0.5">
                  Comunidade Técnica de Moçambique
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-md">
              A plataforma digital moçambicana que conecta técnicos profissionais verificados,
              clientes residenciais e comerciais, empresas e oportunidades de trabalho em todo o país.
            </p>

            <div className="pt-2 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Atuação em todas as 11 Províncias de Moçambique</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Suporte: {settings.supportPhone}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                <span>{settings.supportEmail}</span>
              </div>
            </div>
          </div>

          {/* Col 3: Categorias Populares */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Categorias
            </h4>
            <ul className="space-y-2 text-xs">
              {['Eletricidade', 'Energia Solar', 'CCTV e Segurança', 'Frio e Climatização', 'Informática', 'Automação'].map(cat => (
                <li key={cat}>
                  <button
                    onClick={() => {
                      onSelectCategory(cat);
                      setActiveTab('technicians');
                    }}
                    className="hover:text-amber-400 transition text-left"
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Plataforma & Recursos */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Plataforma
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => setActiveTab('technicians')}
                  className="hover:text-white transition"
                >
                  Encontrar Técnicos
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('requests')}
                  className="hover:text-white transition"
                >
                  Mural de Pedidos
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('tools')}
                  className="hover:text-white transition"
                >
                  TécnicaMZ Tools (Calculadoras)
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('academy')}
                  className="hover:text-white transition"
                >
                  TécnicaMZ Academy
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('jobs')}
                  className="hover:text-white transition"
                >
                  Oportunidades de Emprego
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('market')}
                  className="hover:text-white transition"
                >
                  Marketplace de Equipamentos
                </button>
              </li>
            </ul>
          </div>

          {/* Col 5: Pagamentos & Segurança */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Pagamentos Oficiais
            </h4>
            <div className="space-y-3 text-xs bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase">M-Pesa Oficial</p>
                <p className="text-amber-400 font-black">{settings.paymentMethods.mpesaNumber}</p>
                <p className="text-[10px] text-slate-400">{settings.paymentMethods.mpesaName}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase">e-Mola Oficial</p>
                <p className="text-amber-400 font-black">{settings.paymentMethods.emolaNumber}</p>
                <p className="text-[10px] text-slate-400">{settings.paymentMethods.emolaName}</p>
              </div>
              <div className="pt-1 border-t border-slate-800 flex items-center gap-1.5 text-[10px] text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                <span>Aprovação manual 100% segura</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© {new Date().getFullYear()} TécnicaMZ. Todos os direitos reservados. Moçambique.</p>
          <div className="flex items-center gap-6">
            <button onClick={onOpenTerms} className="hover:text-white transition">
              Termos de Utilização
            </button>
            <button onClick={onOpenPrivacy} className="hover:text-white transition">
              Política de Privacidade
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
