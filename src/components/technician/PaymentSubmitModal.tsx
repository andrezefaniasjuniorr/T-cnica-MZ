import React, { useState } from 'react';
import { SubscriptionPlan, PaymentMethod } from '../../types';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { X, Upload, CheckCircle2, AlertCircle, Phone, Building, ArrowRight, ShieldCheck } from 'lucide-react';

interface PaymentSubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlan: SubscriptionPlan | null;
}

export const PaymentSubmitModal: React.FC<PaymentSubmitModalProps> = ({
  isOpen,
  onClose,
  selectedPlan
}) => {
  const { settings, submitPayment } = useData();
  const { currentUser, currentTechProfile } = useAuth();

  const [method, setMethod] = useState<PaymentMethod>('mpesa');
  const [transactionCode, setTransactionCode] = useState('');
  const [message, setMessage] = useState('');
  const [receiptUrl, setReceiptUrl] = useState('');
  const [receiptFileName, setReceiptFileName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen || !selectedPlan || !currentUser) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptFileName(file.name);
      // In browser preview, create object URL or standard receipt image
      const previewUrl = URL.createObjectURL(file);
      setReceiptUrl(previewUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!transactionCode.trim()) {
      setError('Por favor digite o código da transação fornecido pela operadora (M-Pesa/e-Mola/Banco).');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await submitPayment({
        technicianId: currentUser.uid,
        technicianName: currentUser.name,
        technicianPhone: currentUser.phone || currentTechProfile?.phone,
        planId: selectedPlan.id,
        amountMZN: selectedPlan.priceMZN,
        method,
        transactionCode,
        receiptUrl: receiptUrl || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
        message
      });

      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          onClose();
        }, 2000);
      } else {
        setError(res.error || 'Erro ao enviar comprovativo.');
      }
    } catch (err: any) {
      setError(err?.message || 'Falha ao processar pagamento.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase mb-1">
            <ShieldCheck className="w-4 h-4" />
            Pagamento Manual Seguro
          </div>
          <h2 className="text-xl sm:text-2xl font-black">
            Ativação do Plano {selectedPlan.name}
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Valor: <strong className="text-white text-sm">{selectedPlan.priceMZN} MZN</strong> / 30 dias
          </p>
        </div>

        {success ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black text-slate-900">Comprovativo Enviado!</h3>
            <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
              O seu pagamento foi submetido para revisão do Administrador. Assim que aprovado, a sua assinatura será ativada automaticamente por 30 dias.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Payment Method Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                1. Escolha o Método de Pagamento:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setMethod('mpesa')}
                  className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
                    method === 'mpesa'
                      ? 'border-rose-600 bg-rose-50/80 text-rose-900 font-bold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="text-xs font-black text-rose-600">M-Pesa</span>
                  <span className="text-[10px] text-slate-500">Vodacom</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('emola')}
                  className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
                    method === 'emola'
                      ? 'border-amber-600 bg-amber-50/80 text-amber-900 font-bold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="text-xs font-black text-amber-600">e-Mola</span>
                  <span className="text-[10px] text-slate-500">Movitel</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('bank_transfer')}
                  className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
                    method === 'bank_transfer'
                      ? 'border-blue-600 bg-blue-50/80 text-blue-900 font-bold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="text-xs font-black text-blue-600">Banco</span>
                  <span className="text-[10px] text-slate-500">BIM / IZI</span>
                </button>
              </div>
            </div>

            {/* Configured Official Payment Details */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 text-xs space-y-2">
              <p className="font-bold text-slate-900 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-blue-600" />
                Dados Oficiais para Transferência:
              </p>

              {method === 'mpesa' && (
                <div className="space-y-1 bg-white p-3 rounded-xl border border-slate-200">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Número M-Pesa:</span>
                    <strong className="text-slate-900 font-black">{settings.paymentMethods.mpesaNumber}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Titular da Conta:</span>
                    <strong className="text-slate-900">{settings.paymentMethods.mpesaName}</strong>
                  </div>
                  <div className="flex justify-between text-blue-700 font-bold">
                    <span>Valor a Enviar:</span>
                    <span>{selectedPlan.priceMZN} MZN</span>
                  </div>
                </div>
              )}

              {method === 'emola' && (
                <div className="space-y-1 bg-white p-3 rounded-xl border border-slate-200">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Número e-Mola:</span>
                    <strong className="text-slate-900 font-black">{settings.paymentMethods.emolaNumber}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Titular da Conta:</span>
                    <strong className="text-slate-900">{settings.paymentMethods.emolaName}</strong>
                  </div>
                  <div className="flex justify-between text-amber-700 font-bold">
                    <span>Valor a Enviar:</span>
                    <span>{selectedPlan.priceMZN} MZN</span>
                  </div>
                </div>
              )}

              {method === 'bank_transfer' && (
                <div className="space-y-1 bg-white p-3 rounded-xl border border-slate-200">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Banco:</span>
                    <strong className="text-slate-900">{settings.paymentMethods.bankName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Conta:</span>
                    <strong className="text-slate-900">{settings.paymentMethods.bankAccount}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">NIB:</span>
                    <strong className="text-slate-900 font-mono text-[11px]">{settings.paymentMethods.bankNIB}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Titular:</span>
                    <strong className="text-slate-900">{settings.paymentMethods.bankHolder}</strong>
                  </div>
                </div>
              )}

              <p className="text-[11px] text-slate-500 leading-snug">
                {settings.paymentMethods.instructions}
              </p>
            </div>

            {/* Transaction Code */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                2. Código de Confirmação da Transação *
              </label>
              <input
                type="text"
                required
                value={transactionCode}
                onChange={e => setTransactionCode(e.target.value.toUpperCase())}
                placeholder="Ex: MPESA-8F92K10L ou ID da transação"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono uppercase focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {/* Receipt Upload / Attachment */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                3. Anexo do Comprovativo (Foto / PDF)
              </label>
              <div className="relative border-2 border-dashed border-slate-300 rounded-2xl p-4 text-center hover:bg-slate-50 transition cursor-pointer">
                <input
                  type="file"
                  accept="image/jpeg,image/png,application/pdf"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                <p className="text-xs font-bold text-slate-800">
                  {receiptFileName || 'Clique ou arraste a captura de tela do comprovativo'}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">JPG, PNG ou PDF até 5MB</p>
              </div>
            </div>

            {/* Optional message */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Mensagem ou Observação (Opcional)
              </label>
              <input
                type="text"
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Ex: Pagamento referente ao meu número 84XXXXXXX"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-black transition flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 disabled:opacity-50 mt-2"
            >
              {isSubmitting ? (
                <span>Enviando Comprovativo...</span>
              ) : (
                <>
                  <span>Enviar para Aprovação</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
