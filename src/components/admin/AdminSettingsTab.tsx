import React, { useState } from 'react';
import { PlatformSettings } from '../../types';
import {
  Settings,
  DollarSign,
  Phone,
  MessageCircle,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Save,
  ToggleLeft,
  ToggleRight,
  Sparkles,
  Bot
} from 'lucide-react';

interface AdminSettingsTabProps {
  settings: PlatformSettings;
  onUpdateSettings: (newSettings: Partial<PlatformSettings>) => void;
}

export const AdminSettingsTab: React.FC<AdminSettingsTabProps> = ({
  settings,
  onUpdateSettings
}) => {
  const [formData, setFormData] = useState({
    mpesaNumber: settings.paymentMethods?.mpesaNumber || settings.paymentMethods?.mpesa?.number || settings.mpesaNumber || '841234567',
    mpesaName: settings.paymentMethods?.mpesaName || settings.paymentMethods?.mpesa?.name || settings.mpesaName || 'TécnicaMZ Pro',
    emolaNumber: settings.paymentMethods?.emolaNumber || settings.paymentMethods?.emola?.number || '861234567',
    emolaName: settings.paymentMethods?.emolaName || settings.paymentMethods?.emola?.name || 'TécnicaMZ Pro',
    supportPhone: settings.supportPhone || '+258841234567',
    supportWhatsapp: settings.supportWhatsapp || settings.whatsappSupport || '+258841234567',
    supportEmail: settings.supportEmail || 'suporte@tecnicamz.com',
    maintenanceMode: Boolean(settings.maintenanceMode),
    allowNewRegistrations: settings.allowNewRegistrations !== false && settings.registrationOpen !== false,
    saraAiEnabled: settings.saraAiEnabled !== false
  });

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      onUpdateSettings({
        supportPhone: formData.supportPhone,
        supportWhatsapp: formData.supportWhatsapp,
        whatsappSupport: formData.supportWhatsapp,
        supportEmail: formData.supportEmail,
        maintenanceMode: formData.maintenanceMode,
        allowNewRegistrations: formData.allowNewRegistrations,
        registrationOpen: formData.allowNewRegistrations,
        saraAiEnabled: formData.saraAiEnabled,
        mpesaNumber: formData.mpesaNumber,
        mpesaName: formData.mpesaName,
        paymentMethods: {
          ...settings.paymentMethods,
          mpesaNumber: formData.mpesaNumber,
          mpesaName: formData.mpesaName,
          emolaNumber: formData.emolaNumber,
          emolaName: formData.emolaName,
          mpesa: {
            number: formData.mpesaNumber,
            name: formData.mpesaName,
            enabled: true
          },
          emola: {
            number: formData.emolaNumber,
            name: formData.emolaName,
            enabled: true
          }
        }
      });
      setFeedback({ type: 'success', message: 'Configurações da plataforma atualizadas com sucesso!' });
    } catch {
      setFeedback({ type: 'error', message: 'Erro ao gravar configurações.' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-blue-400">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Configurações Gerais da Plataforma</h2>
            <p className="text-xs text-slate-400">
              Controle dos dados de pagamento M-Pesa/e-Mola, canais de suporte e funcionalidades ativas.
            </p>
          </div>
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

      {/* Settings Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Payment Gateways */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              Contas para Recebimento de Assinaturas (50 MT)
            </h3>

            {/* M-Pesa */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-rose-400">M-Pesa (Vodacom Moçambique)</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 font-semibold">Número M-Pesa:</label>
                  <input
                    type="text"
                    value={formData.mpesaNumber}
                    onChange={e => setFormData({ ...formData, mpesaNumber: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 font-semibold">Nome do Titular:</label>
                  <input
                    type="text"
                    value={formData.mpesaName}
                    onChange={e => setFormData({ ...formData, mpesaName: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                  />
                </div>
              </div>
            </div>

            {/* e-Mola */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-amber-400">e-Mola (Movitel Moçambique)</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 font-semibold">Número e-Mola:</label>
                  <input
                    type="text"
                    value={formData.emolaNumber}
                    onChange={e => setFormData({ ...formData, emolaNumber: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 font-semibold">Nome do Titular:</label>
                  <input
                    type="text"
                    value={formData.emolaName}
                    onChange={e => setFormData({ ...formData, emolaName: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Support Channels & Feature Toggles */}
          <div className="space-y-6">
            {/* Support Info */}
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                <Phone className="w-4 h-4 text-blue-400" />
                Contactos de Suporte & Moderação
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 font-semibold">WhatsApp Suporte:</label>
                  <input
                    type="text"
                    value={formData.supportWhatsapp}
                    onChange={e => setFormData({ ...formData, supportWhatsapp: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 font-semibold">Telefone de Atendimento:</label>
                  <input
                    type="text"
                    value={formData.supportPhone}
                    onChange={e => setFormData({ ...formData, supportPhone: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 font-semibold">Email de Contacto:</label>
                <input
                  type="email"
                  value={formData.supportEmail}
                  onChange={e => setFormData({ ...formData, supportEmail: e.target.value })}
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
                />
              </div>
            </div>

            {/* Feature Flags */}
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                <Sparkles className="w-4 h-4 text-purple-400" />
                Funcionalidades do Sistema
              </h3>

              <div className="space-y-3 pt-1">
                {/* Sara IA Toggle */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <Bot className="w-4 h-4 text-indigo-400" />
                    <div>
                      <p className="text-xs font-bold text-white">Sara IA Ativa</p>
                      <p className="text-[10px] text-slate-400">Permite aos técnicos consultar o assistente de engenharia</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, saraAiEnabled: !formData.saraAiEnabled })}
                    className="text-2xl text-blue-400 focus:outline-none"
                  >
                    {formData.saraAiEnabled ? <ToggleRight className="w-8 h-8 text-emerald-400" /> : <ToggleLeft className="w-8 h-8 text-slate-600" />}
                  </button>
                </div>

                {/* Allow New Registrations */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div>
                    <p className="text-xs font-bold text-white">Novos Cadastros Liberados</p>
                    <p className="text-[10px] text-slate-400">Permite a entrada de novos técnicos e empresas</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, allowNewRegistrations: !formData.allowNewRegistrations })}
                    className="text-2xl text-blue-400 focus:outline-none"
                  >
                    {formData.allowNewRegistrations ? <ToggleRight className="w-8 h-8 text-emerald-400" /> : <ToggleLeft className="w-8 h-8 text-slate-600" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Save CTA */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-xs transition-all shadow-lg shadow-blue-600/30"
          >
            <Save className="w-4 h-4" />
            <span>Salvar Configurações da Plataforma</span>
          </button>
        </div>
      </form>
    </div>
  );
};
