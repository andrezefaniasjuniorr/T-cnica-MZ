import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import {
  User,
  Wrench,
  ShieldCheck,
  Award,
  Phone,
  MapPin,
  Sparkles,
  BookOpen,
  RotateCcw,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Zap,
  Mail,
  Calendar,
  Gift
} from 'lucide-react';
import { UserAvatar } from '../common/UserAvatar';
import { resetOnboardingTour } from '../common/WelcomeModal';

interface UserProfileProps {
  onNavigateTab?: (tab: string) => void;
  onOpenSeloModal?: () => void;
  className?: string;
}

export const UserProfile: React.FC<UserProfileProps> = ({
  onNavigateTab,
  onOpenSeloModal,
  className = ''
}) => {
  const { currentUser, isTechnician, isCompany } = useAuth();
  const { technicians } = useData();
  const [tourResetSuccess, setTourResetSuccess] = useState(false);

  // Encontra os dados estendidos do técnico se existirem
  const techData = technicians.find(t => t.userId === currentUser?.uid);

  // Verifica status do Selo MZ
  let temSeloMZ = false;
  try {
    temSeloMZ = localStorage.getItem('tecnico_verificado') === 'true' ||
      currentUser?.temSeloMZ === true ||
      currentUser?.statusSelo === 'aprovado' ||
      currentUser?.isVerified === true ||
      techData?.isVerified === true;
  } catch {}

  const handleRestartTour = () => {
    setTourResetSuccess(true);
    resetOnboardingTour();
    setTimeout(() => {
      setTourResetSuccess(false);
    }, 3000);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 1. Cartão Principal de Perfil */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <UserAvatar
              name={currentUser?.name}
              photoURL={currentUser?.photoURL}
              size="xl"
              className="border-2 border-slate-200 shadow-xs shrink-0"
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-black text-slate-900">
                  {currentUser?.name || 'Profissional Técnico'}
                </h2>
                {temSeloMZ ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-200 shadow-xs">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                    <span>Selo MZ Verificado</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-slate-100 text-slate-600 border border-slate-200">
                    <span>Conta Padrão</span>
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {currentUser?.email}
              </p>

              <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-600 flex-wrap">
                <span className="inline-flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  <span>{currentUser?.province || 'Moçambique'}</span>
                </span>
                {currentUser?.phone && (
                  <span className="inline-flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200 font-mono">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span>{currentUser.phone}</span>
                  </span>
                )}
                <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md border border-blue-100 font-bold">
                  <Wrench className="w-3 h-3" />
                  <span>{currentUser?.specialty || (techData?.specialties && techData.specialties[0]) || 'Eletricidade & Manutenção'}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Ação rápida de Selo */}
          {!temSeloMZ && (
            <button
              type="button"
              onClick={() => {
                if (onOpenSeloModal) onOpenSeloModal();
                else if (onNavigateTab) onNavigateTab('settings');
              }}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-black rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer active:scale-95 shrink-0"
            >
              <Award className="w-4 h-4" />
              <span>Ativar Selo MZ</span>
            </button>
          )}
        </div>

        {/* Biografia / Resumo Profissional */}
        {currentUser?.bio && (
          <div className="pt-4 text-xs text-slate-600 leading-relaxed">
            <p className="font-semibold text-slate-800 mb-1">Sobre o Profissional:</p>
            <p className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              "{currentUser.bio}"
            </p>
          </div>
        )}
      </div>

      {/* 2. Cartão de Destaque: GUIA DE INTEGRAÇÃO & TUTORIAL DO APP */}
      <div className="bg-gradient-to-br from-blue-50 via-white to-sky-50 rounded-3xl p-6 sm:p-7 border border-blue-200/80 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[10px] font-black tracking-wider uppercase mb-1">
                <span>Central de Ajuda & Onboarding</span>
              </div>
              <h3 className="text-base font-black text-slate-900">
                Guia de Integração do Aplicativo
              </h3>
              <p className="text-xs text-slate-600 mt-0.5 max-w-lg leading-relaxed">
                Precisa relembrar como funciona o <strong>Teste Grátis de 3 dias</strong>, o <strong>Mural de Pedidos</strong>, as <strong>Calculadoras EDM</strong> ou a <strong>Ativação do Selo MZ</strong> via M-Pesa / e-Mola?
              </p>
            </div>
          </div>

          {/* Botão de Ação para Rever o Tutorial */}
          <button
            type="button"
            onClick={handleRestartTour}
            className="w-full sm:w-auto px-5 py-3 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 transition cursor-pointer shrink-0"
            title="Clique para abrir o guia passo a passo da plataforma novamente"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Ver Tutorial do App Novamente</span>
          </button>
        </div>

        {/* Feedback Temporário de Reset */}
        {tourResetSuccess && (
          <div className="mt-4 p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Guia reiniciado com sucesso! O modal de boas-vindas foi aberto.</span>
          </div>
        )}

        {/* 4 Mini Dicas do Tour */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-5 pt-4 border-t border-blue-100/80 text-[11px]">
          <div className="p-2 bg-white/80 rounded-xl border border-blue-100 flex items-center gap-2">
            <Gift className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="font-bold text-slate-700">1. Teste 3 Dias</span>
          </div>
          <div className="p-2 bg-white/80 rounded-xl border border-blue-100 flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="font-bold text-slate-700">2. Mural Pedidos</span>
          </div>
          <div className="p-2 bg-white/80 rounded-xl border border-blue-100 flex items-center gap-2">
            <Wrench className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span className="font-bold text-slate-700">3. Tabelas EDM</span>
          </div>
          <div className="p-2 bg-white/80 rounded-xl border border-blue-100 flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="font-bold text-slate-700">4. Selo MZ</span>
          </div>
        </div>
      </div>
    </div>
  );
};
