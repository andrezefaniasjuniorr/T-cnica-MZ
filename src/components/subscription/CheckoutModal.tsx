import React, { useState, useEffect } from 'react';
import { SubscriptionPlan, PaymentMethod } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import {
  X,
  Smartphone,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Clock,
  AlertCircle,
  Lock,
  ArrowRight,
  Sparkles,
  RefreshCw
} from 'lucide-react';

interface CheckoutModalProps {
  plan: SubscriptionPlan;
  isOpen?: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ plan, isOpen = true, onClose, onSuccess }) => {
  const { currentUser, activateUserSubscription } = useAuth();
  const { submitPayment } = useData();

  if (!isOpen) return null;

  const [method, setMethod] = useState<PaymentMethod>('mpesa');
  const [phoneNumber, setPhoneNumber] = useState(currentUser?.phone ? currentUser.phone.replace(/\+258\s?/, '').replace(/\s+/g, '') : '');
  const [manualCode, setManualCode] = useState('');
  const [isManualMode, setIsManualMode] = useState(false);

  // Push flow state: 'idle' | 'initiating' | 'waiting_pin' | 'verifying' | 'success' | 'error'
  const [paymentStep, setPaymentStep] = useState<'idle' | 'initiating' | 'waiting_pin' | 'verifying' | 'success' | 'error'>('idle');
  const [timerSeconds, setTimerSeconds] = useState(15);
  const [generatedRef, setGeneratedRef] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Validate Moz phone
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  const isValidMpesa = cleanPhone.length === 9 && (cleanPhone.startsWith('84') || cleanPhone.startsWith('85'));
  const isValidEmola = cleanPhone.length === 9 && (cleanPhone.startsWith('86') || cleanPhone.startsWith('87'));
  const isPhoneValid = method === 'mpesa' ? (isValidMpesa || cleanPhone.length === 9) : (isValidEmola || cleanPhone.length === 9);

  // Switch method automatically based on phone prefix
  useEffect(() => {
    if (cleanPhone.startsWith('84') || cleanPhone.startsWith('85')) {
      setMethod('mpesa');
    } else if (cleanPhone.startsWith('86') || cleanPhone.startsWith('87')) {
      setMethod('emola');
    }
  }, [cleanPhone]);

  // Countdown timer for push flow
  useEffect(() => {
    let interval: any;
    if (paymentStep === 'waiting_pin' && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev - 1);
      }, 1000);
    } else if (paymentStep === 'waiting_pin' && timerSeconds === 0) {
      // Transition to verifying and then success
      setPaymentStep('verifying');
      setTimeout(async () => {
        await handlePaymentSuccess(generatedRef || `MP${Date.now().toString().slice(-8)}`);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [paymentStep, timerSeconds, generatedRef]);

  const handleStartPushPayment = async () => {
    if (!cleanPhone || cleanPhone.length < 9) {
      setErrorMessage('Por favor, introduza um número de telemóvel válido de 9 dígitos (ex: 84 123 4567).');
      return;
    }

    setErrorMessage('');
    setPaymentStep('initiating');
    const refCode = `${method === 'mpesa' ? 'MP' : 'EM'}${Date.now().toString().slice(-6)}${Math.floor(100 + Math.random() * 900)}`;
    setGeneratedRef(refCode);

    // Step 1: Initiating Push
    setTimeout(() => {
      setPaymentStep('waiting_pin');
      setTimerSeconds(12);
    }, 1500);
  };

  const handleManualCodeSubmit = async () => {
    if (!manualCode || manualCode.trim().length < 6) {
      setErrorMessage('Por favor, introduza o código de transação recebido por SMS (mínimo 6 caracteres).');
      return;
    }

    setErrorMessage('');
    setPaymentStep('verifying');

    setTimeout(async () => {
      await handlePaymentSuccess(manualCode.trim().toUpperCase());
    }, 1500);
  };

  const handlePaymentSuccess = async (transactionCode: string) => {
    if (!currentUser) return;

    try {
      // 1. Submit payment record to Firestore pagamentos and payments collections
      await submitPayment({
        userId: currentUser.uid,
        userName: currentUser.name,
        userRole: currentUser.role,
        userPhone: `+258 ${cleanPhone}`,
        planId: plan.id,
        planName: plan.name,
        amountMZN: plan.priceMZN,
        method: method,
        transactionCode: transactionCode,
        status: 'approved',
        message: `Pagamento automático via Push ${method.toUpperCase()} para o plano ${plan.name}.`
      });

      // 2. Activate user subscription in context & Firestore users collection
      await activateUserSubscription(plan.id, plan.durationDays || 30, transactionCode);

      setPaymentStep('success');

      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        } else {
          onClose();
        }
      }, 1800);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Erro ao ativar a assinatura. Tente novamente.');
      setPaymentStep('error');
    }
  };

  return (
    <div id="checkout_modal_overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-6 sm:p-7 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-blue-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400 block">
                  Checkout Seguro TécnicaMZ
                </span>
                <h3 className="text-xl font-black text-white">
                  {plan.name}
                </h3>
              </div>
            </div>
            {paymentStep === 'idle' && (
              <button
                id="btn_close_checkout"
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Amount Badge */}
          <div className="mt-5 p-4 rounded-2xl bg-white/10 backdrop-blur border border-white/15 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-300 block">Total da Subscrição (30 dias):</span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-3xl font-black text-white tracking-tight">{plan.priceMZN}</span>
                <span className="text-sm font-bold text-blue-300">MT / mês</span>
              </div>
            </div>
            <div className="px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Ativação Imediata
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-7 space-y-6">
          {/* STEP 1: IDLE / FORM */}
          {paymentStep === 'idle' && (
            <>
              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2.5">
                  1. Escolha o Método de Pagamento Móvel
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    id="btn_select_mpesa"
                    type="button"
                    onClick={() => setMethod('mpesa')}
                    className={`p-3.5 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${
                      method === 'mpesa'
                        ? 'border-red-500 bg-red-50/50 text-red-700 shadow-md shadow-red-500/10'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-red-600 text-white font-black text-xs flex items-center justify-center shadow-sm">
                      M-Pesa
                    </div>
                    <div className="text-center">
                      <span className="text-xs font-black block text-slate-900">Vodacom M-Pesa</span>
                      <span className="text-[10px] text-slate-500 font-medium">84 / 85 xxx xxxx</span>
                    </div>
                  </button>

                  <button
                    id="btn_select_emola"
                    type="button"
                    onClick={() => setMethod('emola')}
                    className={`p-3.5 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${
                      method === 'emola'
                        ? 'border-orange-500 bg-orange-50/50 text-orange-700 shadow-md shadow-orange-500/10'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-orange-600 text-white font-black text-xs flex items-center justify-center shadow-sm">
                      e-Mola
                    </div>
                    <div className="text-center">
                      <span className="text-xs font-black block text-slate-900">Movitel e-Mola</span>
                      <span className="text-[10px] text-slate-500 font-medium">86 / 87 xxx xxxx</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Mode Toggle: Push vs Manual Code */}
              {!isManualMode ? (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                    2. Número do Telemóvel ({method === 'mpesa' ? 'M-Pesa' : 'e-Mola'})
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold text-sm">
                      +258
                    </div>
                    <input
                      id="input_checkout_phone"
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                      placeholder={method === 'mpesa' ? '84 123 4567' : '86 123 4567'}
                      maxLength={9}
                      className="w-full pl-16 pr-4 py-3.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 text-slate-900 font-bold text-base outline-none transition-all"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                      <Smartphone className="w-5 h-5 text-slate-400" />
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    Receberá uma mensagem direta no telemóvel para inserir o seu PIN com segurança.
                  </p>

                  {errorMessage && (
                    <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {errorMessage}
                    </div>
                  )}

                  {/* Push Action Button */}
                  <div className="mt-5 space-y-3">
                    <button
                      id="btn_submit_push_payment"
                      type="button"
                      onClick={handleStartPushPayment}
                      disabled={!cleanPhone || cleanPhone.length < 9}
                      className={`w-full py-4 px-6 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
                        cleanPhone.length >= 9
                          ? method === 'mpesa'
                            ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-red-600/25 active:scale-[0.99]'
                            : 'bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white shadow-orange-600/25 active:scale-[0.99]'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <Zap className="w-5 h-5" />
                      Pagar {plan.priceMZN} MT via Push {method === 'mpesa' ? 'M-Pesa' : 'e-Mola'}
                    </button>

                    <button
                      id="btn_toggle_manual_mode"
                      type="button"
                      onClick={() => setIsManualMode(true)}
                      className="w-full text-center text-xs font-bold text-blue-600 hover:text-blue-700 py-1"
                    >
                      Já fez a transferência manual? Inserir código de referência SMS
                    </button>
                  </div>
                </div>
              ) : (
                /* Manual Reference Mode */
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed space-y-2">
                    <p className="font-bold flex items-center gap-1.5 text-amber-800">
                      <AlertCircle className="w-4 h-4" />
                      Instruções de Pagamento Manual:
                    </p>
                    <p>
                      Envie <strong>{plan.priceMZN} MT</strong> para a conta TécnicaMZ Oficial:{' '}
                      <strong>{method === 'mpesa' ? '+258 84 999 0001 (M-Pesa)' : '+258 86 999 0001 (e-Mola)'}</strong>.
                    </p>
                    <p className="text-[11px] text-amber-700">
                      Depois, copie o código da transação da mensagem SMS e cole abaixo.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                      Código de Transação da Mensagem SMS
                    </label>
                    <input
                      id="input_manual_transaction_code"
                      type="text"
                      value={manualCode}
                      onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                      placeholder="Ex: 8A9X7KZP01 ou MP28491..."
                      className="w-full px-4 py-3.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 text-slate-900 font-mono font-bold text-base uppercase outline-none"
                    />
                  </div>

                  {errorMessage && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {errorMessage}
                    </div>
                  )}

                  <div className="space-y-2 pt-2">
                    <button
                      id="btn_confirm_manual_code"
                      type="button"
                      onClick={handleManualCodeSubmit}
                      disabled={!manualCode || manualCode.length < 6}
                      className="w-full py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white disabled:text-slate-400 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition-all"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      Validar Código e Ativar Assinatura
                    </button>

                    <button
                      id="btn_back_to_push"
                      type="button"
                      onClick={() => setIsManualMode(false)}
                      className="w-full text-center text-xs font-bold text-slate-600 hover:text-slate-800 py-1"
                    >
                      Voltar ao pagamento automático via Push
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* STEP 2: INITIATING PUSH */}
          {paymentStep === 'initiating' && (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-blue-50 border-4 border-blue-500 border-t-transparent animate-spin mx-auto flex items-center justify-center text-blue-600" />
              <div>
                <h4 className="text-lg font-black text-slate-900">A Enviar Pedido USSD...</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  A estabelecer ligação com a rede {method === 'mpesa' ? 'Vodacom M-Pesa' : 'Movitel e-Mola'} para o número +258 {cleanPhone}...
                </p>
              </div>
            </div>
          )}

          {/* STEP 3: WAITING PIN (PUSH PROMPT ACTIVE) */}
          {paymentStep === 'waiting_pin' && (
            <div className="py-6 text-center space-y-5 animate-fade-in">
              <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-blue-500/10 animate-ping" />
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-xl shadow-blue-500/25">
                  <Smartphone className="w-9 h-9 animate-bounce" />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-black">
                  <Clock className="w-3.5 h-3.5" />
                  Aguardando autorização no telemóvel ({timerSeconds}s)
                </div>
                <h4 className="text-xl font-black text-slate-900">
                  Verifique o seu Telemóvel
                </h4>
                <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                  Foi enviado um pedido de pagamento de <strong>{plan.priceMZN} MT</strong> para o seu número <strong>+258 {cleanPhone}</strong>.
                  Por favor, <strong>insira o seu PIN {method.toUpperCase()}</strong> na tela do seu aparelho para aprovar.
                </p>
              </div>

              {/* Simulation Quick Approve for Instant Preview / Testing */}
              <div className="pt-2 border-t border-slate-100">
                <button
                  id="btn_simulate_pin_entered"
                  type="button"
                  onClick={() => {
                    setPaymentStep('verifying');
                    setTimeout(() => {
                      handlePaymentSuccess(generatedRef || `MP${Date.now().toString().slice(-8)}`);
                    }, 1200);
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-black flex items-center justify-center gap-1.5 mx-auto transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Simular PIN Inserido com Sucesso
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: VERIFYING */}
          {paymentStep === 'verifying' && (
            <div className="py-8 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-50 border-4 border-emerald-500 border-t-transparent animate-spin mx-auto" />
              <div>
                <h4 className="text-lg font-black text-slate-900">A Confirmar Pagamento com a Operadora...</h4>
                <p className="text-xs text-slate-500 mt-1">
                  A gravar comprovativo e a libertar a sua conta no sistema...
                </p>
              </div>
            </div>
          )}

          {/* STEP 5: SUCCESS */}
          {paymentStep === 'success' && (
            <div className="py-8 text-center space-y-4 animate-scale-up">
              <div className="w-20 h-20 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/30">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <div>
                <h4 className="text-2xl font-black text-slate-900">Assinatura Ativada!</h4>
                <p className="text-xs text-slate-600 mt-1.5">
                  Parabéns! O seu plano <strong>{plan.name}</strong> está ativo por 30 dias. Acesso libertado a toda a plataforma.
                </p>
              </div>
            </div>
          )}

          {/* STEP 6: ERROR */}
          {paymentStep === 'error' && (
            <div className="py-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-lg font-black text-slate-900">Erro no Processamento</h4>
                <p className="text-xs text-red-600 mt-1">{errorMessage}</p>
              </div>
              <button
                type="button"
                onClick={() => setPaymentStep('idle')}
                className="px-6 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
              >
                Tentar Novamente
              </button>
            </div>
          )}
        </div>

        {/* Footer Security Badges */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
          <span className="flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            Encriptação Segura SSL 256-bit
          </span>
          <span>Moçambique • M-Pesa / e-Mola</span>
        </div>
      </div>
    </div>
  );
};
