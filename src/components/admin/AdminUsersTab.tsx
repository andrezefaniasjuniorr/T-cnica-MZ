import React, { useState } from 'react';
import { User, UserRole, UserStatus } from '../../types';
import { getInitial } from '../../utils/stringUtils';
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  ShieldCheck,
  Award,
  Ban,
  Trash2,
  Gift,
  Phone,
  Mail,
  Building2,
  Wrench,
  AlertCircle,
  MoreVertical,
  ExternalLink,
  MessageCircle,
  Lock,
  Unlock
} from 'lucide-react';

interface AdminUsersTabProps {
  users: User[];
  onGrant30Days: (userId: string) => Promise<{ success: boolean; error?: string }>;
  onToggleVerification: (userId: string, currentStatus?: boolean) => Promise<{ success: boolean; error?: string }>;
  onUpdateStatus: (userId: string, status: UserStatus, reason?: string) => Promise<{ success: boolean; error?: string }>;
  onDeleteUser: (userId: string) => Promise<{ success: boolean; error?: string }>;
}

export const AdminUsersTab: React.FC<AdminUsersTabProps> = ({
  users,
  onGrant30Days,
  onToggleVerification,
  onUpdateStatus,
  onDeleteUser
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'client' | 'technician' | 'company' | 'admin'>('all');
  const [subscriptionFilter, setSubscriptionFilter] = useState<'all' | 'active' | 'expiring' | 'expired' | 'none'>('all');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal states
  const [selectedUserForBan, setSelectedUserForBan] = useState<User | null>(null);
  const [banReason, setBanReason] = useState('Violação das regras e termos de serviço TécnicaMZ.');
  const [selectedUserForDelete, setSelectedUserForDelete] = useState<User | null>(null);

  const now = Date.now();

  // Filter users
  const filteredUsers = users.filter(user => {
    // 1. Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const match =
        (user.name || '').toLowerCase().includes(term) ||
        (user.email || '').toLowerCase().includes(term) ||
        (user.phone || '').includes(term) ||
        (user.province || '').toLowerCase().includes(term) ||
        (user.specialty || '').toLowerCase().includes(term);
      if (!match) return false;
    }

    // 2. Role filter
    if (roleFilter !== 'all') {
      if (roleFilter === 'client' && user.role !== 'client' && user.tipoConta !== 'cliente') return false;
      if (roleFilter === 'technician' && (user.role !== 'technician' || user.tipoConta === 'cliente')) return false;
      if (roleFilter === 'company' && user.role !== 'company') return false;
      if (roleFilter === 'admin' && user.role !== 'admin') return false;
    }

    // 3. Subscription filter
    if (subscriptionFilter !== 'all') {
      const exp = user.dataExpiracao || user.subscriptionExpiresAt;
      const isSubActive = ((user.statusAssinatura || user.subscriptionStatus || '').toLowerCase() === 'ativa' ||
        (user.statusAssinatura || user.subscriptionStatus || '').toLowerCase() === 'active') &&
        Boolean(exp && new Date(exp).getTime() > now);

      if (subscriptionFilter === 'active' && !isSubActive) return false;
      if (subscriptionFilter === 'none' && exp) return false;

      if (exp) {
        const diffDays = (new Date(exp).getTime() - now) / (1000 * 60 * 60 * 24);
        if (subscriptionFilter === 'expiring' && (diffDays <= 0 || diffDays > 7)) return false;
        if (subscriptionFilter === 'expired' && diffDays > 0) return false;
      } else if (subscriptionFilter === 'expired' || subscriptionFilter === 'expiring') {
        return false;
      }
    }

    return true;
  });

  const handleGrantBonus = async (userId: string, userName: string) => {
    setProcessingId(userId);
    setFeedback(null);
    try {
      const res = await onGrant30Days(userId);
      if (res.success) {
        setFeedback({
          type: 'success',
          message: `Adicionados +30 dias de Plano Pro (50 MT) para "${userName}" com sucesso!`
        });
      } else {
        setFeedback({ type: 'error', message: res.error || 'Erro ao conceder dias.' });
      }
    } finally {
      setProcessingId(null);
    }
  };

  const handleToggleVerified = async (user: User) => {
    setProcessingId(user.uid);
    setFeedback(null);
    const newStatus = !user.isVerified;
    try {
      const res = await onToggleVerification(user.uid, newStatus);
      if (res.success) {
        setFeedback({
          type: 'success',
          message: `Selo de Verificação ${newStatus ? 'ativado' : 'removido'} para "${user.name}".`
        });
      } else {
        setFeedback({ type: 'error', message: res.error || 'Erro ao alterar verificação.' });
      }
    } finally {
      setProcessingId(null);
    }
  };

  const handleConfirmBan = async () => {
    if (!selectedUserForBan) return;
    setProcessingId(selectedUserForBan.uid);
    setFeedback(null);
    try {
      const res = await onUpdateStatus(selectedUserForBan.uid, 'blocked', banReason);
      if (res.success) {
        setFeedback({
          type: 'success',
          message: `Conta de "${selectedUserForBan.name}" foi suspensa/bloqueada.`
        });
        setSelectedUserForBan(null);
      } else {
        setFeedback({ type: 'error', message: res.error || 'Erro ao suspender conta.' });
      }
    } finally {
      setProcessingId(null);
    }
  };

  const handleUnban = async (user: User) => {
    setProcessingId(user.uid);
    setFeedback(null);
    try {
      const res = await onUpdateStatus(user.uid, 'active');
      if (res.success) {
        setFeedback({
          type: 'success',
          message: `Conta de "${user.name}" foi reativada com sucesso!`
        });
      } else {
        setFeedback({ type: 'error', message: res.error || 'Erro ao reativar conta.' });
      }
    } finally {
      setProcessingId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedUserForDelete) return;
    setProcessingId(selectedUserForDelete.uid);
    setFeedback(null);
    try {
      const res = await onDeleteUser(selectedUserForDelete.uid);
      if (res.success) {
        setFeedback({
          type: 'success',
          message: `Conta de "${selectedUserForDelete.name}" excluída permanentemente.`
        });
        setSelectedUserForDelete(null);
      } else {
        setFeedback({ type: 'error', message: res.error || 'Erro ao excluir conta.' });
      }
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header, Search & Filters */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">Gestão Central de Usuários</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-black border border-blue-500/30">
                {users.length} Registados
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Controle de status, concessão manual de 30 dias de assinatura e selos de verificação.
            </p>
          </div>

          {/* Search input */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nome, email, telefone..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80">
          <span className="text-xs font-bold text-slate-400 mr-2 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            Filtros:
          </span>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value as any)}
            className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
          >
            <option value="all">Todos os Tipos de Conta</option>
            <option value="technician">Técnicos</option>
            <option value="company">Empresas</option>
            <option value="client">Clientes</option>
            <option value="admin">Administradores</option>
          </select>

          {/* Subscription Filter */}
          <select
            value={subscriptionFilter}
            onChange={e => setSubscriptionFilter(e.target.value as any)}
            className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
          >
            <option value="all">Todas as Assinaturas</option>
            <option value="active">Assinatura Ativa (50 MT)</option>
            <option value="expiring">A Expirar (&lt; 7 dias)</option>
            <option value="expired">Assinatura Expirada</option>
            <option value="none">Sem Histórico de Plano</option>
          </select>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between gap-3 ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
              : 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Users List Grid / Table */}
      <div className="space-y-3">
        {filteredUsers.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800/80">
            <Users className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-300">Nenhum usuário encontrado com os filtros selecionados.</p>
          </div>
        ) : (
          filteredUsers.map(user => {
            const isProcessing = processingId === user.uid;
            const userName = user.name || (user as any).displayName || 'Usuário Sem Nome';
            const userEmail = user.email || 'Sem email';
            const userRole = user.role || (user as any).tipoConta || 'cliente';
            const isCompany = user.role === 'company' || (user as any).tipoConta === 'empresa';
            const isClient = user.role === 'client' || (user as any).tipoConta === 'cliente';
            const isAdmin = user.role === 'admin';
            const isVerified = Boolean(user.isVerified || (user as any).hasSeloMZ || (user as any).temSeloMZ || (user as any).statusSelo === 'aprovado');
            const isBlocked = user.status === 'blocked' || user.status === 'banned' || (user as any).statusConta === 'bloqueada' || (user as any).statusConta === 'suspensa' || user.status === 'suspended';

            // Subscription Calculation
            const exp = user.dataExpiracao || user.subscriptionExpiresAt;
            let daysLeft = 0;
            let subBadgeColor = 'bg-slate-800 text-slate-400 border-slate-700';
            let subText = 'Sem Assinatura';

            if (exp) {
              const diffMs = new Date(exp).getTime() - now;
              daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

              if (daysLeft > 7) {
                subBadgeColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
                subText = `${daysLeft} dias restantes`;
              } else if (daysLeft > 0) {
                subBadgeColor = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
                subText = `${daysLeft} ${daysLeft === 1 ? 'dia restante' : 'dias restantes'}`;
              } else {
                subBadgeColor = 'bg-rose-500/20 text-rose-300 border-rose-500/30';
                subText = 'Expirado';
              }
            }

            const whatsappNumber = (user.phone || '').replace(/\D/g, '');
            const whatsappLink = whatsappNumber
              ? `https://wa.me/258${whatsappNumber.startsWith('258') ? whatsappNumber.substring(3) : whatsappNumber}`
              : `https://wa.me/258851949159`;

            return (
              <div
                key={user.uid}
                className={`p-4 sm:p-5 rounded-2xl border transition-all shadow-sm ${
                  isBlocked
                    ? 'bg-rose-950/20 border-rose-900/50'
                    : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* User Profile Overview */}
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0 font-bold overflow-hidden">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={userName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <span>{getInitial(userName)}</span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-white">{userName}</span>

                        {/* Role Badge */}
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            isAdmin
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                              : isCompany
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : isClient
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          {isAdmin ? 'Admin' : isCompany ? 'Empresa' : isClient ? 'Cliente' : 'Técnico Pro'}
                        </span>

                        {/* Verified Badge */}
                        {isVerified && (
                          <span className="px-2 py-0.5 rounded-full bg-blue-600/20 text-blue-400 border border-blue-500/30 text-[10px] font-bold flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-blue-400" />
                            Verificado
                          </span>
                        )}

                        {/* Blocked Badge */}
                        {isBlocked && (
                          <span className="px-2 py-0.5 rounded-full bg-rose-600/20 text-rose-400 border border-rose-500/30 text-[10px] font-bold flex items-center gap-1">
                            <Ban className="w-3 h-3" />
                            Bloqueado
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5 text-slate-500" />
                          <span>{userEmail}</span>
                        </span>
                        {user.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-slate-500" />
                            <span>{user.phone}</span>
                          </span>
                        )}
                        {user.province && (
                          <span>📍 {user.province}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Subscription & Expiration Status */}
                  {!isClient && !isAdmin && (
                    <div className="flex items-center gap-3 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 shrink-0">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-semibold text-slate-400">Plano Técnico Pro (50 MT):</span>
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${subBadgeColor}`}>
                            {subText}
                          </span>
                        </div>
                        {exp && (
                          <p className="text-[10px] text-slate-500">
                            Expira em: {new Date(exp).toLocaleDateString('pt-PT')}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                    {/* WhatsApp */}
                    {user.phone && (
                      <a
                        href={whatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 text-xs font-semibold flex items-center gap-1 transition-colors"
                        title="Abrir WhatsApp"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </a>
                    )}

                    {/* Add 30 Days (50 MT Plan) */}
                    {!isClient && !isAdmin && (
                      <button
                        onClick={() => handleGrantBonus(user.uid, userName)}
                        disabled={isProcessing}
                        className="px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                        title="Conceder ou Estender 30 Dias de Assinatura Pro"
                      >
                        <Gift className="w-3.5 h-3.5 text-purple-400" />
                        <span>+30 Dias</span>
                      </button>
                    )}

                    {/* Toggle Verified / Selo MZ Badge */}
                    {!isClient && (
                      <button
                        onClick={() => handleToggleVerified(user)}
                        disabled={isProcessing}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border disabled:opacity-50 ${
                          isVerified
                            ? 'bg-blue-600/20 text-blue-300 border-blue-500/40 hover:bg-blue-600/30'
                            : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                        }`}
                        title={isVerified ? "Remover Selo MZ" : "Conceder Selo MZ"}
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                        <span>{isVerified ? 'Remover Selo' : 'Conceder Selo'}</span>
                      </button>
                    )}

                    {/* Ban / Unban */}
                    {!isAdmin && (
                      isBlocked ? (
                        <button
                          onClick={() => handleUnban(user)}
                          disabled={isProcessing}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors"
                          title="Desbanir / Desbloquear Usuário"
                        >
                          <Unlock className="w-3.5 h-3.5" />
                          <span>Desbanir</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => setSelectedUserForBan(user)}
                          disabled={isProcessing}
                          className="px-3 py-1.5 rounded-xl bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 border border-rose-500/20 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                          title="Bloquear/Banir Usuário"
                        >
                          <Ban className="w-3.5 h-3.5" />
                          <span>Bloquear/Banir</span>
                        </button>
                      )
                    )}

                    {/* Delete Account */}
                    {!isAdmin && (
                      <button
                        onClick={() => setSelectedUserForDelete(user)}
                        disabled={isProcessing}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-500/30 text-xs transition-colors"
                        title="Excluir Conta Permanentemente"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Ban Modal */}
      {selectedUserForBan && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Ban className="w-5 h-5 text-rose-400" />
                Suspender Conta de Usuário
              </h3>
              <button onClick={() => setSelectedUserForBan(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <p className="text-xs text-slate-300">
              Tem certeza que deseja bloquear a conta de <strong>{selectedUserForBan.name}</strong> ({selectedUserForBan.email})? O usuário será impedido de utilizar as abas do sistema.
            </p>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400">Motivo do Bloqueio:</label>
              <textarea
                value={banReason}
                onChange={e => setBanReason(e.target.value)}
                rows={3}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedUserForBan(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmBan}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
              >
                Confirmar Suspensão
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {selectedUserForDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-rose-400 flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-rose-400" />
                Excluir Conta Permanentemente
              </h3>
              <button onClick={() => setSelectedUserForDelete(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Esta ação é <strong>irreversível</strong>. Todos os dados, perfil e documentos de <strong>{selectedUserForDelete.name}</strong> ({selectedUserForDelete.email}) serão apagados da base de dados do Sistema.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedUserForDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
              >
                Excluir Definitivamente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
