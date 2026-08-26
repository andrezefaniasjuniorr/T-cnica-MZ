import React from 'react';
import { Calendar, AlertTriangle, CheckCircle2, Clock, Zap } from 'lucide-react';

interface CountdownTimerProps {
  expiresAt?: string;
  status: 'none' | 'active' | 'expired';
  planName?: string;
  onRenew?: () => void;
  compact?: boolean;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  expiresAt,
  status,
  planName = 'Profissional',
  onRenew,
  compact = false
}) => {
  if (status === 'none' || !expiresAt) {
    return (
      <div className={`p-4 rounded-xl border border-slate-200 bg-slate-50 ${compact ? 'text-xs' : ''}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
            <span className="font-semibold text-slate-700">Sem Assinatura Ativa</span>
          </div>
          {onRenew && (
            <button
              onClick={onRenew}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition"
            >
              Ativar Plano
            </button>
          )}
        </div>
      </div>
    );
  }

  const now = new Date().getTime();
  const expTime = new Date(expiresAt).getTime();
  const diffMs = expTime - now;
  const daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  const isExpired = diffMs <= 0 || status === 'expired';

  // Format expiration date DD/MM/YYYY
  const expDateObj = new Date(expiresAt);
  const formattedDate = `${String(expDateObj.getDate()).padStart(2, '0')}/${String(
    expDateObj.getMonth() + 1
  ).padStart(2, '0')}/${expDateObj.getFullYear()}`;

  // Progress percentage based on a standard 30 day cycle
  const totalDays = 30;
  const progressPercent = Math.min(100, Math.max(0, (daysRemaining / totalDays) * 100));

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <span
          className={`w-2.5 h-2.5 rounded-full ${
            isExpired ? 'bg-rose-500' : daysRemaining <= 7 ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
          }`}
        ></span>
        <span className="text-xs font-semibold text-slate-800">
          {isExpired ? 'Expirada' : `${daysRemaining} dias restantes`}
        </span>
      </div>
    );
  }

  if (isExpired) {
    return (
      <div className="p-5 rounded-2xl border-2 border-rose-200 bg-rose-50/70">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-700 bg-rose-200/80 px-2 py-0.5 rounded">
                  {planName}
                </span>
                <span className="text-sm font-bold text-rose-900">Assinatura Expirada</span>
              </div>
              <p className="text-xs text-rose-700 mt-0.5">
                Expirou em {formattedDate}. Renove para recuperar o destaque e receber pedidos.
              </p>
            </div>
          </div>
          {onRenew && (
            <button
              onClick={onRenew}
              className="w-full sm:w-auto px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm"
            >
              <Zap className="w-4 h-4" />
              Renovar Agora
            </button>
          )}
        </div>
      </div>
    );
  }

  const isWarning = daysRemaining <= 7;

  return (
    <div
      className={`p-5 rounded-2xl border ${
        isWarning ? 'border-amber-300 bg-amber-50/80' : 'border-emerald-200 bg-emerald-50/40'
      } transition shadow-xs`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isWarning ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
            }`}
          >
            {isWarning ? <Clock className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                  isWarning ? 'bg-amber-200 text-amber-900' : 'bg-emerald-200 text-emerald-900'
                }`}
              >
                {planName}
              </span>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                ATIVA
              </span>
            </div>
            <p className="text-base font-extrabold text-slate-900 mt-1">
              {daysRemaining} {daysRemaining === 1 ? 'dia restante' : 'dias restantes'}
            </p>
          </div>
        </div>

        {onRenew && (
          <button
            onClick={onRenew}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              isWarning
                ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-sm'
                : 'bg-slate-900 hover:bg-slate-800 text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            Renovar Assinatura
          </button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5 mt-2">
        <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isWarning ? 'bg-amber-500' : 'bg-emerald-500'
            }`}
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            Expira em: <strong className="text-slate-800">{formattedDate}</strong>
          </span>
          {isWarning && (
            <span className="text-amber-700 font-semibold flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              {daysRemaining === 1 ? 'Termina amanhã!' : `Termina em ${daysRemaining} dias`}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
