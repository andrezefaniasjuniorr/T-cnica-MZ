import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Clock,
  ShieldCheck,
  CheckCircle2,
  Phone,
  MessageCircle,
  RefreshCw,
  LogOut,
  Sparkles,
  MapPin,
  Wrench,
  Building2,
  AlertCircle
} from 'lucide-react';

export const WaitingApprovalScreen: React.FC = () => {
  const { currentUser, logout, isTechnician, isCompany } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshMessage, setRefreshMessage] = useState<string | null>(null);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setRefreshMessage(null);
    try {
      // Small timeout to allow network re-sync
      await new Promise(resolve => setTimeout(resolve, 800));
      window.location.reload();
    } catch {
      setIsRefreshing(false);
    }
  };

  const whatsappMessage = encodeURIComponent(
    `Olá Administração TécnicaMZ Pro! Criei minha conta profissional (${currentUser?.name || ''} - ${currentUser?.email || ''}) e gostaria de solicitar a análise e aprovação do meu cadastro.`
  );
  const whatsappUrl = `https://wa.me/258851949159?text=${whatsappMessage}`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-10 font-sans selection:bg-blue-500 selection:text-white">
      {/* Top Bar */}
      <div className="w-full max-w-4xl mx-auto flex items-center justify-between pb-6 border-b border-slate-800/80">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg text-white tracking-tight">TécnicaMZ</span>
              <span className="text-[11px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                PRO
              </span>
            </div>
            <p className="text-xs text-slate-400">Plataforma Técnica de Moçambique</p>
          </div>
        </div>

        <button
          id="btn-logout-waiting"
          onClick={() => logout()}
          className="flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-rose-400 transition-colors px-3 py-1.5 rounded-lg border border-slate-800 hover:border-rose-500/30 bg-slate-900/60"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Terminar Sessão</span>
        </button>
      </div>

      {/* Main Content Area */}
      <main className="w-full max-w-2xl mx-auto my-auto py-8">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
          {/* Header Status Badge */}
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
                <Clock className="w-8 h-8 animate-pulse" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500 border-2 border-slate-900"></span>
              </span>
            </div>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium">
                <Clock className="w-3.5 h-3.5" />
                <span>Cadastro em Análise de Moderação</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Aguardando Aprovação do Administrador
              </h1>
              <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                Olá <strong className="text-white">{currentUser?.name}</strong>, a sua conta profissional está sob análise da equipa de verificação da TécnicaMZ.
              </p>
            </div>
          </div>

          {/* Workflow Steps */}
          <div className="mt-8 bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 sm:p-5 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              Etapas de Validação Profissional
            </h2>

            <div className="space-y-3">
              {/* Step 1 */}
              <div className="flex items-start gap-3">
                <div className="mt-0.5 w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-200">1. Cadastro Enviado</p>
                  <p className="text-[11px] text-slate-400">Dados do perfil registados no sistema com segurança.</p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-3">
                <div className="mt-0.5 w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shrink-0">
                  <Clock className="w-3.5 h-3.5 animate-spin" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-amber-300">2. Revisão por um Administrador (Em Andamento)</p>
                  <p className="text-[11px] text-slate-400">
                    Nossa equipa de moderação avalia a autenticidade dos dados para manter a rede segura.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-3 opacity-60">
                <div className="mt-0.5 w-6 h-6 rounded-full bg-slate-800 text-slate-400 border border-slate-700 flex items-center justify-center shrink-0 text-xs font-bold">
                  3
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-300">3. Liberação e Acesso Total</p>
                  <p className="text-[11px] text-slate-500">Acesso ao Gerador de OS em PDF, Sara IA, Mercado e Mural Técnico.</p>
                </div>
              </div>
            </div>
          </div>

          {/* User Submitted Profile Summary */}
          <div className="mt-6 bg-slate-950/40 border border-slate-800/60 rounded-xl p-4 space-y-2.5">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Resumo do Perfil Submetido</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                {isCompany ? <Building2 className="w-4 h-4 text-blue-400 shrink-0" /> : <Wrench className="w-4 h-4 text-blue-400 shrink-0" />}
                <span className="truncate"><strong>Tipo:</strong> {isCompany ? 'Empresa Registada' : 'Técnico Especialista'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="truncate"><strong>Local:</strong> {currentUser?.province || 'Maputo'}, {currentUser?.city || 'MZ'}</span>
              </div>
              {currentUser?.phone && (
                <div className="flex items-center gap-2 text-slate-300">
                  <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="truncate"><strong>Contacto:</strong> {currentUser.phone}</span>
                </div>
              )}
              {currentUser?.specialty && (
                <div className="flex items-center gap-2 text-slate-300">
                  <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span className="truncate"><strong>Especialidade:</strong> {currentUser.specialty}</span>
                </div>
              )}
            </div>
          </div>

          {/* Actions: WhatsApp Direct Support & Refresh Button */}
          <div className="mt-8 space-y-3">
            <a
              id="btn-whatsapp-moderation"
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-semibold text-sm transition-all shadow-lg shadow-emerald-950/50"
            >
              <MessageCircle className="w-5 h-5 fill-current" />
              <span>Acelerar Aprovação via WhatsApp Suporte</span>
            </a>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                id="btn-refresh-status"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-800 text-slate-200 font-medium text-xs border border-slate-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>{isRefreshing ? 'A verificar...' : 'Verificar se já fui Aprovado'}</span>
              </button>

              <button
                id="btn-secondary-logout"
                onClick={() => logout()}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-transparent hover:bg-slate-800/60 text-slate-400 hover:text-slate-200 text-xs font-medium transition-colors text-center shrink-0 border border-slate-800"
              >
                Sair da Conta
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-4xl mx-auto pt-6 text-center text-xs text-slate-500 border-t border-slate-800/60">
        <p>TécnicaMZ Pro &copy; {new Date().getFullYear()} — Moçambique. Todos os direitos reservados.</p>
        <p className="text-[11px] text-slate-600 mt-1">Dúvidas? Ligue ou envie mensagem para (+258) 85 194 9159.</p>
      </footer>
    </div>
  );
};
