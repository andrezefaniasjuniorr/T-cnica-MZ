import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import {
  Lock,
  ArrowRight,
  Building2,
  Wrench,
  User,
  Shield,
  X
} from 'lucide-react';

interface AccessDeniedModalProps {
  isOpen: boolean;
  onClose: () => void;
  requiredRole: UserRole;
  onOpenAuth: (role: UserRole) => void;
}

export const AccessDeniedModal: React.FC<AccessDeniedModalProps> = ({
  isOpen,
  onClose,
  requiredRole,
  onOpenAuth
}) => {
  const { currentUser } = useAuth();

  if (!isOpen) return null;

  const getRoleInfo = (role: UserRole) => {
    switch (role) {
      case 'admin':
      case 'super_admin':
        return {
          title: 'Painel Administrativo Restrito',
          desc: 'Esta área é restrita à administração TécnicaMZ (Super Admin, Finanças e Moderação). Para aceder, inicie sessão com a sua credencial administrativa autorizada.',
          icon: <Shield className="w-8 h-8 text-amber-500" />,
          color: 'bg-amber-50 border-amber-200 text-amber-900'
        };
      case 'company':
        return {
          title: 'Painel Empresarial Restrito',
          desc: 'Esta área é exclusiva para empresas e indústrias contratantes com NUIT verificado para publicação de vagas corporativas e gestão de candidatos.',
          icon: <Building2 className="w-8 h-8 text-purple-500" />,
          color: 'bg-purple-50 border-purple-200 text-purple-900'
        };
      case 'technician':
        return {
          title: 'Painel do Técnico Restrito',
          desc: 'Esta área é exclusiva para técnicos e engenheiros prestadores de serviço gerenciarem propostas, ferramentas técnicas, orçamentos e assinaturas.',
          icon: <Wrench className="w-8 h-8 text-blue-500" />,
          color: 'bg-blue-50 border-blue-200 text-blue-900'
        };
      default:
        return {
          title: 'Área de Clientes Restrita',
          desc: 'Esta área é destinada a clientes para solicitação de serviços técnicos e acompanhamento de propostas.',
          icon: <User className="w-8 h-8 text-emerald-500" />,
          color: 'bg-emerald-50 border-emerald-200 text-emerald-900'
        };
    }
  };

  const info = getRoleInfo(requiredRole);

  const handleOpenLogin = () => {
    onClose();
    onOpenAuth(requiredRole);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black">Acesso Restrito</h2>
              <p className="text-xs text-slate-400">Controlo de Perfis e Permissões (RBAC)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          <div className={`p-4 rounded-2xl border ${info.color} flex items-start gap-3`}>
            <div className="shrink-0 pt-0.5">{info.icon}</div>
            <div className="space-y-1">
              <h3 className="text-xs font-black uppercase tracking-wider">{info.title}</h3>
              <p className="text-xs leading-relaxed">{info.desc}</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
            <p>
              Sessão Atual:{' '}
              <strong className="text-slate-900 uppercase">
                {currentUser ? currentUser.role : 'Visitante'}
              </strong>{' '}
              ({currentUser ? currentUser.name : 'Não autenticado'})
            </p>
          </div>

          {/* Action to login */}
          <div className="space-y-2 pt-2">
            <button
              onClick={handleOpenLogin}
              className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-md"
            >
              <span>Entrar com Conta Autorizada</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
            >
              Voltar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
