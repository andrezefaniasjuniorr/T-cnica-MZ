import React, { useState } from 'react';
import { SolicitacaoSelo } from '../../types';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  Copy,
  Check,
  Phone,
  Mail,
  User,
  ExternalLink,
  MessageSquare,
  AlertCircle,
  Sparkles,
  Maximize2,
  X,
  FileText
} from 'lucide-react';

interface AdminSeloRequestsTabProps {
  solicitacoes: SolicitacaoSelo[];
  onApprove: (solicitacaoId: string, userId: string) => Promise<{ success: boolean; error?: string }>;
  onReject: (solicitacaoId: string, userId: string, motivo?: string) => Promise<{ success: boolean; error?: string }>;
}

export const AdminSeloRequestsTab: React.FC<AdminSeloRequestsTabProps> = ({
  solicitacoes,
  onApprove,
  onReject
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pendente_aprovacao' | 'aprovado' | 'rejeitado'>('pendente_aprovacao');
  const [operatorFilter, setOperatorFilter] = useState<'all' | 'mpesa' | 'emola'>('all');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Rejection Modal
  const [rejectingItem, setRejectingItem] = useState<SolicitacaoSelo | null>(null);
  const [rejectionReason, setRejectionReason] = useState('Código de transação não localizado no extrato M-Pesa / e-Mola.');

  // Expanded Message Modal
  const [expandedMessageItem, setExpandedMessageItem] = useState<SolicitacaoSelo | null>(null);

  const pendingCount = solicitacoes.filter(s => s.statusSelo === 'pendente_aprovacao').length;

  const filteredRequests = solicitacoes.filter(req => {
    if (statusFilter !== 'all' && req.statusSelo !== statusFilter) return false;
    if (operatorFilter !== 'all' && req.operadora !== operatorFilter) return false;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const match =
        (req.usuarioNome || '').toLowerCase().includes(term) ||
        (req.usuarioEmail || '').toLowerCase().includes(term) ||
        (req.usuarioTelefone || '').includes(term) ||
        (req.mensagemTransacao || '').toLowerCase().includes(term);
      if (!match) return false;
    }
    return true;
  });

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleApprove = async (req: SolicitacaoSelo) => {
    setProcessingId(req.id);
    setFeedback(null);
    try {
      const res = await onApprove(req.id, req.userId);
      if (res.success) {
        setFeedback({
          type: 'success',
          message: `Selo MZ concedido com sucesso para "${req.usuarioNome}"! A conta foi verificada e liberada.`
        });
      } else {
        setFeedback({ type: 'error', message: res.error || 'Erro ao aprovar solicitação.' });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Falha ao processar aprovação do Selo MZ.' });
    } finally {
      setProcessingId(null);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectingItem) return;
    setProcessingId(rejectingItem.id);
    setFeedback(null);
    try {
      const res = await onReject(rejectingItem.id, rejectingItem.userId, rejectionReason);
      if (res.success) {
        setFeedback({
          type: 'success',
          message: `Solicitação de "${rejectingItem.usuarioNome}" foi recusada.`
        });
        setRejectingItem(null);
      } else {
        setFeedback({ type: 'error', message: res.error || 'Erro ao rejeitar solicitação.' });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Falha ao processar rejeição.' });
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
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                <span>Solicitações de Compra do Selo MZ (M-Pesa / e-Mola)</span>
              </h2>
              {pendingCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-black border border-amber-500/30">
                  {pendingCount} Pendentes
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Validação manual de mensagens SMS de transferência para concessão do Selo MZ.
            </p>
          </div>

          {/* Search input */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nome, email, telefone, SMS..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80">
          <span className="text-xs font-bold text-slate-400 mr-2 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            Filtros:
          </span>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
          >
            <option value="all">Todos os Status</option>
            <option value="pendente_aprovacao">Apenas Pendentes ({pendingCount})</option>
            <option value="aprovado">Aprovados (Selo Concedido)</option>
            <option value="rejeitado">Rejeitados</option>
          </select>

          <select
            value={operatorFilter}
            onChange={e => setOperatorFilter(e.target.value as any)}
            className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
          >
            <option value="all">Todas as Operadoras</option>
            <option value="mpesa">M-Pesa (Vodacom)</option>
            <option value="emola">e-Mola (Movitel)</option>
          </select>
        </div>
      </div>

      {feedback && (
        <div className={`p-4 rounded-2xl border flex items-center gap-3 text-xs font-bold ${
          feedback.type === 'success'
            ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
            : 'bg-rose-950/60 text-rose-300 border-rose-500/40'
        }`}>
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/40 border border-slate-800 rounded-3xl">
          <ShieldCheck className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">Nenhuma solicitação encontrada</h3>
          <p className="text-xs text-slate-400 mt-1">
            {statusFilter === 'pendente_aprovacao'
              ? 'Não há solicitações pendentes de validação no momento.'
              : 'Nenhum registro coincide com os filtros selecionados.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map(req => {
            const isProcessing = processingId === req.id;
            const isPending = req.statusSelo === 'pendente_aprovacao';
            const isApproved = req.statusSelo === 'aprovado';
            const isRejected = req.statusSelo === 'rejeitado';

            return (
              <div
                key={req.id}
                className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4 hover:border-slate-700 transition"
              >
                {/* Top User Info & Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm text-white ${
                      req.operadora === 'mpesa' ? 'bg-red-600' : 'bg-orange-500'
                    }`}>
                      {req.operadora === 'mpesa' ? 'M' : 'e'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm sm:text-base font-black text-white">{req.usuarioNome}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                          req.operadora === 'mpesa'
                            ? 'bg-red-500/20 text-red-400 border-red-500/30'
                            : 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                        }`}>
                          {req.operadora === 'mpesa' ? 'M-Pesa' : 'e-Mola'}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-bold">
                          {req.tipoConta === 'empresa' ? 'Empresa' : 'Técnico'}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5" />
                          {req.usuarioEmail}
                        </span>
                        {req.usuarioTelefone && (
                          <span className="flex items-center gap-1 font-mono text-slate-300">
                            <Phone className="w-3.5 h-3.5" />
                            {req.usuarioTelefone}
                          </span>
                        )}
                        <span className="text-[11px] text-slate-500">
                          Enviado: {new Date(req.dataEnvio).toLocaleString('pt-PT')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {isPending && (
                      <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-black flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 animate-spin" />
                        Pendente de Aprovação
                      </span>
                    )}
                    {isApproved && (
                      <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-black flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Selo MZ Concedido
                      </span>
                    )}
                    {isRejected && (
                      <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-black flex items-center gap-1.5">
                        <XCircle className="w-3.5 h-3.5" />
                        Rejeitado
                      </span>
                    )}
                  </div>
                </div>

                {/* VISUALIZAÇÃO COMPLETA DA MENSAGEM (SMS INTEGRAL) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-blue-400" />
                      Mensagem de Confirmação SMS Completa (Texto Integral):
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopy(req.id, req.mensagemTransacao)}
                        className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-800 transition cursor-pointer"
                      >
                        {copiedId === req.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400 font-bold">Copiado</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copiar SMS</span>
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setExpandedMessageItem(req)}
                        className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-800 transition cursor-pointer"
                      >
                        <Maximize2 className="w-3 h-3" />
                        <span>Expandir</span>
                      </button>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-200 whitespace-pre-wrap break-all leading-relaxed select-all">
                    {req.mensagemTransacao}
                  </div>
                </div>

                {/* Rejection reason display if rejected */}
                {isRejected && req.motivoRejeicao && (
                  <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/40 text-xs text-rose-300">
                    <strong>Motivo da Recusa:</strong> {req.motivoRejeicao}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                  {isPending && (
                    <>
                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => setRejectingItem(req)}
                        className="px-4 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Rejeitar</span>
                      </button>

                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => handleApprove(req)}
                        className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition flex items-center gap-2 shadow-lg shadow-emerald-600/30 cursor-pointer disabled:opacity-50"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>{isProcessing ? 'Concedendo...' : 'Conceder Selo MZ / Aprovar'}</span>
                      </button>
                    </>
                  )}

                  {!isPending && (
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleApprove(req)}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                      <span>Re-validar e Conceder Selo</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL REJEIÇÃO COM MOTIVO */}
      {rejectingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 text-slate-100 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <XCircle className="w-5 h-5 text-rose-500" />
                <span>Recusar Solicitação do Selo MZ</span>
              </h3>
              <button
                onClick={() => setRejectingItem(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Informe o motivo da recusa para o usuário <strong className="text-white">{rejectingItem.usuarioNome}</strong>:
            </p>

            <textarea
              rows={3}
              value={rejectionReason}
              onChange={e => setRejectionReason(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
            />

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRejectingItem(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black shadow-lg shadow-rose-600/30"
              >
                Confirmar Recusa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL MENSAGEM EXPANDIDA */}
      {expandedMessageItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 text-slate-100 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-400" />
                  <span>Comprovativo SMS Completo - {expandedMessageItem.usuarioNome}</span>
                </h3>
                <span className="text-xs text-slate-400">
                  {expandedMessageItem.operadora === 'mpesa' ? 'M-Pesa (Vodacom)' : 'e-Mola (Movitel)'} - {expandedMessageItem.usuarioEmail}
                </span>
              </div>
              <button
                onClick={() => setExpandedMessageItem(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-100 whitespace-pre-wrap break-all leading-relaxed max-h-96 overflow-y-auto select-all">
              {expandedMessageItem.mensagemTransacao}
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => handleCopy('modal', expandedMessageItem.mensagemTransacao)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5"
              >
                {copiedId === 'modal' ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">Copiado para Área de Transferência</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copiar Texto Completo</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setExpandedMessageItem(null)}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
