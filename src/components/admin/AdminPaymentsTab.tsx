import React, { useState } from 'react';
import { PaymentRecord } from '../../types';
import {
  CreditCard,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  MessageCircle,
  Phone,
  DollarSign,
  AlertCircle,
  FileText,
  Eye,
  Sparkles
} from 'lucide-react';

interface AdminPaymentsTabProps {
  payments: PaymentRecord[];
  onApprovePayment: (paymentId: string) => Promise<void>;
  onRejectPayment: (paymentId: string, reason?: string) => Promise<void>;
}

export const AdminPaymentsTab: React.FC<AdminPaymentsTabProps> = ({
  payments,
  onApprovePayment,
  onRejectPayment
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [methodFilter, setMethodFilter] = useState<'all' | 'mpesa' | 'emola'>('all');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Reject Modal
  const [rejectingPayment, setRejectingPayment] = useState<PaymentRecord | null>(null);
  const [rejectReason, setRejectReason] = useState('Código de transação inválido ou não localizado no extrato.');

  // Proof image preview modal
  const [previewProofUrl, setPreviewProofUrl] = useState<string | null>(null);

  const pendingCount = payments.filter(p => p.status === 'pending').length;

  const filteredPayments = payments.filter(p => {
    // Status
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    // Method
    if (methodFilter !== 'all' && p.method !== methodFilter) return false;
    // Search
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const match =
        (p.userName || '').toLowerCase().includes(term) ||
        (p.phoneNumber || p.userPhone || '').includes(term) ||
        (p.transactionReference || p.transactionCode || '').toLowerCase().includes(term) ||
        (p.planName || '').toLowerCase().includes(term);
      if (!match) return false;
    }
    return true;
  });

  const handleApprove = async (payment: PaymentRecord) => {
    setProcessingId(payment.id);
    setFeedback(null);
    try {
      await onApprovePayment(payment.id);
      setFeedback({
        type: 'success',
        message: `Pagamento de "${payment.userName}" (${payment.amountMZN} MT) aprovado com sucesso! A assinatura foi renovada.`
      });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Erro ao aprovar pagamento.' });
    } finally {
      setProcessingId(null);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectingPayment) return;
    setProcessingId(rejectingPayment.id);
    setFeedback(null);
    try {
      await onRejectPayment(rejectingPayment.id, rejectReason);
      setFeedback({
        type: 'success',
        message: `Pagamento de "${rejectingPayment.userName}" foi marcado como rejeitado.`
      });
      setRejectingPayment(null);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Erro ao rejeitar pagamento.' });
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
              <h2 className="text-lg font-bold text-white">Pagamentos & Faturas (M-Pesa / e-Mola)</h2>
              {pendingCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-black border border-amber-500/30">
                  {pendingCount} Pendentes
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Validação manual de comprovativos de subscrição mensal única (50 MT).
            </p>
          </div>

          {/* Search input */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por código, nome, telefone..."
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
            <option value="pending">Pendentes</option>
            <option value="approved">Aprovados</option>
            <option value="rejected">Rejeitados</option>
          </select>

          <select
            value={methodFilter}
            onChange={e => setMethodFilter(e.target.value as any)}
            className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
          >
            <option value="all">Todas as Carteiras</option>
            <option value="mpesa">M-Pesa</option>
            <option value="emola">e-Mola</option>
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

      {/* Payments List */}
      <div className="space-y-3">
        {filteredPayments.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800/80">
            <CreditCard className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-300">Nenhum pagamento encontrado com os filtros atuais.</p>
          </div>
        ) : (
          filteredPayments.map(payment => {
            const isProcessing = processingId === payment.id;
            const isPending = payment.status === 'pending';
            const isApproved = payment.status === 'approved';
            const isMpesa = payment.method === 'mpesa';

            const paymentPhone = payment.phoneNumber || payment.userPhone || '';
            const paymentRef = payment.transactionReference || payment.transactionCode || '';
            const paymentProof = payment.proofUrl || payment.receiptUrl || '';
            const paymentDate = payment.createdAt || payment.submittedAt;

            const whatsappNumber = paymentPhone.replace(/\D/g, '');
            const whatsappLink = whatsappNumber
              ? `https://wa.me/258${whatsappNumber.startsWith('258') ? whatsappNumber.substring(3) : whatsappNumber}`
              : `https://wa.me/258841234567`;

            return (
              <div
                key={payment.id}
                className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                {/* Left Info */}
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 font-black text-xs ${
                      isMpesa
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {isMpesa ? 'M-PESA' : 'E-MOLA'}
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-white">{payment.userName}</span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-extrabold bg-slate-800 text-blue-400 border border-slate-700">
                        {payment.amountMZN || 50} MT
                      </span>

                      {/* Status Badge */}
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${
                          isApproved
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : isPending
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                        }`}
                      >
                        {isApproved && <CheckCircle2 className="w-3 h-3" />}
                        {isPending && <Clock className="w-3 h-3" />}
                        {payment.status === 'rejected' && <XCircle className="w-3 h-3" />}
                        {isApproved ? 'Aprovado' : isPending ? 'Pendente' : 'Rejeitado'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                      {paymentPhone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-slate-500" />
                          <span>{paymentPhone}</span>
                        </span>
                      )}
                      <span className="font-mono text-slate-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                        Ref: {paymentRef || 'NÃO INFORMADO'}
                      </span>
                      <span>
                        {paymentDate ? new Date(paymentDate).toLocaleString('pt-PT') : 'Hoje'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                  {paymentProof && (
                    <button
                      onClick={() => setPreviewProofUrl(paymentProof || null)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Ver Comprovativo</span>
                    </button>
                  )}

                  {paymentPhone && (
                    <a
                      href={whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 text-xs font-semibold flex items-center"
                      title="Conversar no WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </a>
                  )}

                  {isPending && (
                    <>
                      <button
                        onClick={() => setRejectingPayment(payment)}
                        disabled={isProcessing}
                        className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-bold transition-colors disabled:opacity-50"
                      >
                        Rejeitar
                      </button>

                      <button
                        onClick={() => handleApprove(payment)}
                        disabled={isProcessing}
                        className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{isProcessing ? 'Aprovando...' : 'Aprovar +30D'}</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Reject Payment Modal */}
      {rejectingPayment && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <XCircle className="w-5 h-5 text-rose-400" />
                Rejeitar Pagamento de {rejectingPayment.userName}
              </h3>
              <button onClick={() => setRejectingPayment(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400">Motivo da Rejeição:</label>
              <textarea
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                rows={3}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setRejectingPayment(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
              >
                Confirmar Rejeição
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Proof Preview Modal */}
      {previewProofUrl && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Comprovativo de Pagamento</h3>
              <button onClick={() => setPreviewProofUrl(null)} className="text-slate-400 hover:text-white font-bold">✕</button>
            </div>
            <div className="max-h-[70vh] overflow-auto rounded-xl bg-slate-950 flex items-center justify-center p-2">
              <img src={previewProofUrl} alt="Comprovativo" className="max-w-full h-auto object-contain rounded-lg" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
