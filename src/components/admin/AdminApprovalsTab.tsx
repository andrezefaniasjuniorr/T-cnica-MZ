import React, { useState } from 'react';
import { User } from '../../types';
import {
  UserCheck,
  UserX,
  Clock,
  Search,
  CheckCircle2,
  XCircle,
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  Wrench,
  Building2,
  Sparkles,
  Gift,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

interface AdminApprovalsTabProps {
  users: User[];
  onApprove: (userId: string) => Promise<{ success: boolean; error?: string }>;
  onReject: (userId: string, reason?: string) => Promise<{ success: boolean; error?: string }>;
  onGrant30Days: (userId: string) => Promise<{ success: boolean; error?: string }>;
}

export const AdminApprovalsTab: React.FC<AdminApprovalsTabProps> = ({
  users,
  onApprove,
  onReject,
  onGrant30Days
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Reject Modal State
  const [rejectingUser, setRejectingUser] = useState<User | null>(null);
  const [rejectionReason, setRejectionReason] = useState('Documentos ou dados incompletos para validação técnica.');

  // Filter pending users
  const pendingUsers = users.filter(u => {
    const isPending =
      u.statusAprovacao === 'pendente' ||
      u.status === 'pending_approval' ||
      (u.tipoConta === 'tecnico' && !u.statusAprovacao && u.role !== 'admin' && u.role !== 'client');

    if (!isPending) return false;

    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      (u.name || '').toLowerCase().includes(term) ||
      (u.email || '').toLowerCase().includes(term) ||
      (u.phone || '').includes(term) ||
      (u.specialty || '').toLowerCase().includes(term) ||
      (u.province || '').toLowerCase().includes(term)
    );
  });

  const handleApprove = async (userId: string, userName: string) => {
    setProcessingId(userId);
    setFeedback(null);
    try {
      const res = await onApprove(userId);
      if (res.success) {
        setFeedback({
          type: 'success',
          message: `Cadastro de "${userName}" foi aprovado com sucesso! A conta agora está liberada.`
        });
      } else {
        setFeedback({ type: 'error', message: res.error || 'Erro ao aprovar cadastro.' });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Falha na comunicação com o servidor.' });
    } finally {
      setProcessingId(null);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectingUser) return;
    setProcessingId(rejectingUser.uid);
    setFeedback(null);
    try {
      const res = await onReject(rejectingUser.uid, rejectionReason);
      if (res.success) {
        setFeedback({
          type: 'success',
          message: `Cadastro de "${rejectingUser.name}" foi recusado.`
        });
        setRejectingUser(null);
      } else {
        setFeedback({ type: 'error', message: res.error || 'Erro ao rejeitar cadastro.' });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Falha ao rejeitar cadastro.' });
    } finally {
      setProcessingId(null);
    }
  };

  const handleGrantBonus = async (userId: string, userName: string) => {
    setProcessingId(userId);
    setFeedback(null);
    try {
      const res = await onGrant30Days(userId);
      if (res.success) {
        setFeedback({
          type: 'success',
          message: `Concedidos 30 dias de Plano Técnico Pro de cortesia para "${userName}"!`
        });
      } else {
        setFeedback({ type: 'error', message: res.error || 'Erro ao conceder plano.' });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Falha ao conceder plano.' });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white">Aprovações de Contas Profissionais</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-black border border-amber-500/30">
              {pendingUsers.length} Pendentes
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Técnicos e empresas que se cadastraram e aguardam validação de segurança para acessar o sistema.
          </p>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nome, celular, província..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Feedback message */}
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
          <button
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-white text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Pending List or Empty State */}
      {pendingUsers.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-white">Tudo em dia!</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Não há novos cadastros de técnicos ou empresas aguardando aprovação no momento.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {pendingUsers.map(applicant => {
            const isCompany = applicant.role === 'company' || applicant.tipoConta === 'empresa';
            const isProcessing = processingId === applicant.uid;
            const whatsappNumber = (applicant.phone || '').replace(/\D/g, '');
            const whatsappLink = whatsappNumber
              ? `https://wa.me/258${whatsappNumber.startsWith('258') ? whatsappNumber.substring(3) : whatsappNumber}`
              : `https://wa.me/258851949159`;

            return (
              <div
                key={applicant.uid}
                className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all shadow-md flex flex-col justify-between space-y-4"
              >
                {/* Top Info */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0 overflow-hidden font-bold">
                      {applicant.avatarUrl ? (
                        <img
                          src={applicant.avatarUrl}
                          alt={applicant.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span>{applicant.name.charAt(0).toUpperCase()}</span>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-white">{applicant.name}</h3>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            isCompany
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          }`}
                        >
                          {isCompany ? 'Empresa' : 'Técnico'}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5 text-slate-500" />
                          <span className="truncate max-w-[150px]">{applicant.email}</span>
                        </span>
                        {applicant.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-slate-500" />
                            <span>{applicant.phone}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 text-[11px] font-bold shrink-0 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Pendente
                  </span>
                </div>

                {/* Additional Details */}
                <div className="grid grid-cols-2 gap-2 text-xs p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <div className="flex items-center gap-2 text-slate-300">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate">{applicant.province || 'Maputo'}, {applicant.city || 'MZ'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    {isCompany ? <Building2 className="w-3.5 h-3.5 text-blue-400 shrink-0" /> : <Wrench className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
                    <span className="truncate">{applicant.specialty || 'Técnico Especialista'}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <a
                      href={whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      title="Conversar no WhatsApp"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>

                    <button
                      onClick={() => handleGrantBonus(applicant.uid, applicant.name)}
                      disabled={isProcessing}
                      className="px-3 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                      title="Aprovar e Dar 30 Dias Grátis"
                    >
                      <Gift className="w-3.5 h-3.5" />
                      <span>+30D Cortesia</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setRejectingUser(applicant)}
                      disabled={isProcessing}
                      className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                      <UserX className="w-3.5 h-3.5" />
                      <span>Rejeitar</span>
                    </button>

                    <button
                      onClick={() => handleApprove(applicant.uid, applicant.name)}
                      disabled={isProcessing}
                      className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md disabled:opacity-50"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>{isProcessing ? 'Aprovando...' : 'Aprovar'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reject Modal */}
      {rejectingUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <UserX className="w-5 h-5 text-rose-400" />
                Recusar Cadastro de Técnico
              </h3>
              <button
                onClick={() => setRejectingUser(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Informe o motivo da recusa para o profissional <strong>{rejectingUser.name}</strong>. Esta mensagem será enviada nas notificações da conta.
            </p>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400">Motivo da Recusa:</label>
              <textarea
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                rows={3}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setRejectingUser(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
              >
                Confirmar Recusa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
