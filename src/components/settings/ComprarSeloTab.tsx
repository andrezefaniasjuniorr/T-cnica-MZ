import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  Copy,
  Check,
  Send,
  Sparkles,
  Smartphone,
  Info,
  RefreshCw,
  Phone,
  MessageCircle,
  Award,
  Zap,
  Lock,
  ArrowRight
} from 'lucide-react';

export const ComprarSeloTab: React.FC = () => {
  const {
    currentUser,
    temSeloMZ,
    statusSelo,
    solicitarSeloMZ
  } = useAuth();

  const { settings } = useData();

  const [operator, setOperator] = useState<'mpesa' | 'emola'>('mpesa');
  const [transactionMessage, setTransactionMessage] = useState('');
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Transfer numbers
  const mpesaNumber = settings?.paymentMethods?.mpesaNumber || '841234567';
  const mpesaName = settings?.paymentMethods?.mpesaName || 'André Zefanias Júnior';
  const emolaNumber = settings?.paymentMethods?.emolaNumber || '861949159';
  const emolaName = settings?.paymentMethods?.emolaName || 'André Zefanias Júnior';

  const currentNumber = operator === 'mpesa' ? mpesaNumber : emolaNumber;
  const currentName = operator === 'mpesa' ? mpesaName : emolaName;

  const handleCopyNumber = (num: string) => {
    navigator.clipboard.writeText(num.replace(/\s+/g, ''));
    setCopiedNumber(num);
    setTimeout(() => setCopiedNumber(null), 2500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const trimmedMsg = transactionMessage.trim();
    if (trimmedMsg.length < 15) {
      setFeedback({
        type: 'error',
        message: 'Por favor, cole a mensagem de confirmação SMS completa enviada pela operadora.'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await solicitarSeloMZ(operator, trimmedMsg);
      if (res.success) {
        setFeedback({
          type: 'success',
          message: 'Comprovativo enviado com sucesso! A administração da TécnicaMZ Pro validará o seu pagamento em breve.'
        });
        setTransactionMessage('');
      } else {
        setFeedback({
          type: 'error',
          message: res.error || 'Erro ao enviar comprovativo. Tente novamente.'
        });
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err?.message || 'Falha na comunicação com o servidor.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Status is approved
  const isApproved = temSeloMZ || currentUser?.temSeloMZ || statusSelo === 'aprovado';
  // Status is pending
  const isPending = !isApproved && (statusSelo === 'pendente_aprovacao' || currentUser?.statusSelo === 'pendente_aprovacao');
  // Status is rejected
  const isRejected = !isApproved && !isPending && (statusSelo === 'rejeitado' || currentUser?.statusSelo === 'rejeitado');

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-blue-800 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-amber-300 shadow-inner shrink-0">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[11px] font-black uppercase tracking-wider mb-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Selo MZ Oficial
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Comprar & Ativar Selo MZ
              </h1>
              <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
                O Selo MZ é a credencial oficial que desbloqueia a publicação de anúncios, recebimento de solicitações diretas de clientes, ferramentas técnicas de cálculo e a inteligência artificial Sara IA.
              </p>
            </div>
          </div>

          <div className="shrink-0 bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 text-center sm:text-right min-w-[140px]">
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-blue-200 block">
              Valor da Ativação
            </span>
            <span className="text-2xl font-black text-amber-300">
              50 MT
            </span>
            <span className="text-[10px] text-slate-300 block">
              Taxa única / Mês
            </span>
          </div>
        </div>
      </div>

      {/* STATUS BADGES & ALERTS */}
      {isApproved && (
        <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-3xl p-6 text-emerald-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-white">Selo MZ Ativo & Verificado</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px] uppercase">
                  Liberado
                </span>
              </div>
              <p className="text-xs text-emerald-200/90 mt-0.5">
                Sua conta possui acesso total a todos os recursos, ferramentas técnicas, Sara IA e solicitações de clientes.
              </p>
            </div>
          </div>
          <div className="text-xs text-emerald-300 font-bold bg-emerald-900/40 px-3.5 py-2 rounded-xl border border-emerald-700/50">
            {currentUser?.dataSeloAprovacao ? `Aprovado em: ${new Date(currentUser.dataSeloAprovacao).toLocaleDateString('pt-PT')}` : 'Status: Ativo'}
          </div>
        </div>
      )}

      {isPending && (
        <div className="bg-amber-950/30 border border-amber-500/40 rounded-3xl p-6 text-amber-100 space-y-3 shadow-lg">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-white">Solicitação do Selo MZ em Análise</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] uppercase">
                  Pendente
                </span>
              </div>
              <p className="text-xs text-amber-200/90 mt-0.5">
                O seu comprovativo foi recebido e está na fila de validação pelo Administrador.
              </p>
            </div>
          </div>

          {currentUser?.mensagemTransacaoSelo && (
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs font-mono text-slate-300">
              <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block mb-1">
                Comprovativo enviado ({currentUser.operadoraSelo === 'emola' ? 'e-Mola' : 'M-Pesa'}):
              </span>
              <p className="whitespace-pre-wrap break-all leading-relaxed text-slate-200">
                {currentUser.mensagemTransacaoSelo}
              </p>
            </div>
          )}
        </div>
      )}

      {isRejected && (
        <div className="bg-rose-950/30 border border-rose-500/40 rounded-3xl p-6 text-rose-100 space-y-3 shadow-lg">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-white">Solicitação Recusada</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-rose-500 text-white font-black text-[10px] uppercase">
                  Não Aprovado
                </span>
              </div>
              <p className="text-xs text-rose-200/90 mt-0.5">
                Motivo: <strong className="text-rose-100">{currentUser?.motivoRejeicaoSelo || 'Código de transação não localizado ou mensagem incompleta.'}</strong>
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-300">
            Você pode reenviar a mensagem correta no formulário abaixo para nova verificação.
          </p>
        </div>
      )}

      {feedback && (
        <div className={`p-4 rounded-2xl border flex items-center gap-3 text-xs font-bold ${
          feedback.type === 'success'
            ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
            : 'bg-rose-50 text-rose-900 border-rose-200'
        }`}>
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* OPERATOR SELECTION & TRANSFER DETAILS */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div>
          <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
            <span>Passo 1: Escolha a Operadora e Transfira 50 MT</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Selecione a sua carteira móvel de preferência para ver o número de pagamento.
          </p>
        </div>

        {/* Operator Toggle Buttons */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <button
            type="button"
            onClick={() => setOperator('mpesa')}
            className={`p-4 sm:p-5 rounded-2xl border-2 transition-all flex flex-col items-center justify-center text-center cursor-pointer ${
              operator === 'mpesa'
                ? 'border-red-500 bg-red-50/70 shadow-md shadow-red-500/10'
                : 'border-slate-200 bg-slate-50 hover:bg-slate-100/80 text-slate-700'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center font-black text-sm mb-2 shadow-xs">
              M
            </div>
            <span className="text-xs sm:text-sm font-black text-slate-900">M-Pesa (Vodacom)</span>
            <span className="text-[10px] text-slate-500 mt-0.5">Menu *150#</span>
          </button>

          <button
            type="button"
            onClick={() => setOperator('emola')}
            className={`p-4 sm:p-5 rounded-2xl border-2 transition-all flex flex-col items-center justify-center text-center cursor-pointer ${
              operator === 'emola'
                ? 'border-orange-500 bg-orange-50/70 shadow-md shadow-orange-500/10'
                : 'border-slate-200 bg-slate-50 hover:bg-slate-100/80 text-slate-700'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center font-black text-sm mb-2 shadow-xs">
              e
            </div>
            <span className="text-xs sm:text-sm font-black text-slate-900">e-Mola (Movitel)</span>
            <span className="text-[10px] text-slate-500 mt-0.5">Menu *898#</span>
          </button>
        </div>

        {/* Transfer Destination Highlight Box */}
        <div className={`p-5 sm:p-6 rounded-2xl border ${
          operator === 'mpesa' ? 'bg-red-50/40 border-red-200' : 'bg-orange-50/40 border-orange-200'
        } space-y-4`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                Número para Transferência ({operator === 'mpesa' ? 'M-Pesa' : 'e-Mola'})
              </span>
              <div className="flex items-center gap-2.5 mt-1">
                <span className="text-xl sm:text-2xl font-black font-mono text-slate-900">
                  {currentNumber}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyNumber(currentNumber)}
                  className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                >
                  {copiedNumber === currentNumber ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="sm:text-right">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                Titular da Conta
              </span>
              <span className="text-sm font-bold text-slate-800 mt-0.5 block">
                {currentName}
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-600">
            <span className="flex items-center gap-1 font-semibold">
              <Info className="w-3.5 h-3.5 text-blue-600" />
              Valor a transferir: <strong className="text-slate-900">50,00 MZN</strong>
            </span>
            <span className="text-slate-500 font-medium">
              Transfira exatamente o valor de 50 MT
            </span>
          </div>
        </div>
      </div>

      {/* SUBMISSION FORM (PASTE SMS CONFIRMATION) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div>
          <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
            <span>Passo 2: Cole a Mensagem SMS de Confirmação</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Copie a mensagem inteira recebida do {operator === 'mpesa' ? 'M-Pesa (ex: "Confirmado. 50.00 MT transferidos para...")' : 'e-Mola'} e cole no campo abaixo.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1.5">
              Mensagem Completa da Transação (SMS da Operadora) *
            </label>
            <textarea
              rows={5}
              required
              value={transactionMessage}
              onChange={e => setTransactionMessage(e.target.value)}
              placeholder={
                operator === 'mpesa'
                  ? 'Exemplo:\nConfirmado. 50.00 MT transferido para André Zefanias (+258 841234567) em 28/02/2025 às 14:32. Taxa: 0.00 MT. Saldo: ... Ref: PP250228.1432.A12345'
                  : 'Exemplo:\nConfirmado. Transfere 50 MT para 871234567 - André Zefanias. TxID: EM250228143245. Saldo actual: ...'
              }
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono focus:outline-none focus:border-blue-500 focus:bg-white transition leading-relaxed"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Cole o texto integral sem apagar o código de transação, data ou valor para agilizar a liberação.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div className="text-[11px] text-slate-500 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Validação manual segura pela equipa de administração TécnicaMZ</span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !transactionMessage.trim()}
              className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Enviando Comprovativo...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Já paguei / Enviar Comprovativo</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* WHATSAPP SUPPORT ASSISTANCE */}
      <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <Phone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-black text-slate-900">Precisa de Ajuda com o Pagamento?</h3>
            <p className="text-[11px] text-slate-500">
              Fale diretamente com o suporte no WhatsApp: <strong className="text-slate-700">841234567</strong>
            </p>
          </div>
        </div>

        <a
          href="https://wa.me/258841234567?text=Olá%20TécnicaMZ!%20Gostaria%20de%20ajuda%20para%20ativar%20o%20meu%20Selo%20MZ."
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Falar no WhatsApp</span>
        </a>
      </div>
    </div>
  );
};
