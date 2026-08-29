import React, { useState } from 'react';
import { User, NotificationItem } from '../../types';
import {
  Send,
  Bell,
  CheckCircle2,
  AlertCircle,
  Users,
  Building2,
  Wrench,
  UserCheck,
  Sparkles,
  Info,
  AlertTriangle,
  Flame,
  Radio,
  Clock,
  Search
} from 'lucide-react';

interface AdminBroadcastTabProps {
  users: User[];
  notifications: NotificationItem[];
  onSendNotification: (
    target: 'all' | 'client' | 'technician' | 'company' | string,
    title: string,
    message: string,
    type?: 'info' | 'success' | 'warning' | 'alert',
    linkTab?: string
  ) => Promise<{ success: boolean; error?: string }>;
}

export const AdminBroadcastTab: React.FC<AdminBroadcastTabProps> = ({
  users,
  notifications,
  onSendNotification
}) => {
  const [target, setTarget] = useState<'all' | 'client' | 'technician' | 'company' | 'specific'>('all');
  const [specificUserId, setSpecificUserId] = useState('');
  const [specificUserSearch, setSpecificUserSearch] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'info' | 'success' | 'warning' | 'alert'>('info');
  const [linkTab, setLinkTab] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Filtered users for specific user target picker
  const filteredUsers = users.filter(u => {
    if (!specificUserSearch.trim()) return true;
    const s = specificUserSearch.toLowerCase();
    return (
      (u.name || '').toLowerCase().includes(s) ||
      (u.email || '').toLowerCase().includes(s) ||
      (u.phone || '').includes(s)
    );
  }).slice(0, 10);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      setFeedback({ type: 'error', message: 'Por favor, preencha o título e a mensagem do comunicado.' });
      return;
    }

    const finalTarget = target === 'specific' ? specificUserId : target;
    if (target === 'specific' && !specificUserId) {
      setFeedback({ type: 'error', message: 'Selecione um usuário específico para enviar a notificação.' });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const res = await onSendNotification(finalTarget, title, message, type, linkTab || undefined);
      if (res.success) {
        setFeedback({
          type: 'success',
          message: 'Comunicado oficial transmitido com sucesso e gravado na base de dados!'
        });
        setTitle('');
        setMessage('');
        setLinkTab('');
      } else {
        setFeedback({ type: 'error', message: res.error || 'Erro ao enviar comunicado.' });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Falha na comunicação com o Firestore.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Central de Comunicados & Notificações</h2>
            <p className="text-xs text-slate-400">
              Envie alertas em tempo real para toda a rede ou segmentos específicos (Clientes, Técnicos, Empresas).
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

      {/* Grid: Left Broadcast Form | Right Recent Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Broadcast Form */}
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-7 p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-5"
        >
          <div className="border-b border-slate-800/80 pb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Send className="w-4 h-4 text-blue-400" />
              Novo Comunicado Oficial
            </h3>
            <span className="text-[11px] text-slate-400">Entrega imediata</span>
          </div>

          {/* 1. Target Audience */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300">Público-Alvo do Comunicado:</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'all', label: 'Todos', icon: Users, desc: 'Toda a base' },
                { id: 'technician', label: 'Técnicos', icon: Wrench, desc: 'Apenas técnicos' },
                { id: 'company', label: 'Empresas', icon: Building2, desc: 'Empresas cadastradas' },
                { id: 'client', label: 'Clientes', icon: UserCheck, desc: 'Apenas contratantes' }
              ].map(item => {
                const isSelected = target === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setTarget(item.id as any);
                      setSpecificUserId('');
                    }}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                      isSelected
                        ? 'bg-blue-600/20 border-blue-500 text-white'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Icon className={`w-4 h-4 mb-2 ${isSelected ? 'text-blue-400' : 'text-slate-500'}`} />
                    <div>
                      <p className="text-xs font-bold">{item.label}</p>
                      <p className="text-[10px] text-slate-500">{item.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Option to pick single specific user */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setTarget('specific')}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
                  target === 'specific'
                    ? 'bg-purple-600/20 border-purple-500 text-purple-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                + Enviar para um Usuário Específico
              </button>
            </div>

            {target === 'specific' && (
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2 mt-2">
                <input
                  type="text"
                  placeholder="Pesquise o usuário por nome ou email..."
                  value={specificUserSearch}
                  onChange={e => setSpecificUserSearch(e.target.value)}
                  className="w-full p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200"
                />
                <select
                  value={specificUserId}
                  onChange={e => setSpecificUserId(e.target.value)}
                  className="w-full p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200"
                >
                  <option value="">Selecione o usuário da lista...</option>
                  {filteredUsers.map(u => (
                    <option key={u.uid} value={u.uid}>
                      {u.name} ({u.role} - {u.email})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* 2. Notification Type / Severity */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300">Tipo / Nível de Urgência:</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'info', label: 'Informativo', color: 'border-blue-500/40 text-blue-400 bg-blue-500/10', icon: Info },
                { id: 'success', label: 'Sucesso', color: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10', icon: CheckCircle2 },
                { id: 'warning', label: 'Aviso', color: 'border-amber-500/40 text-amber-400 bg-amber-500/10', icon: AlertTriangle },
                { id: 'alert', label: 'Urgente', color: 'border-rose-500/40 text-rose-400 bg-rose-500/10', icon: Flame }
              ].map(t => {
                const isSelected = type === t.id;
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setType(t.id as any)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      isSelected ? t.color : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Título do Comunicado:</label>
            <input
              type="text"
              placeholder="Ex: Atualização Importante sobre o Plano Técnico Pro"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* 4. Message Content */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Conteúdo da Mensagem:</label>
            <textarea
              rows={4}
              placeholder="Escreva aqui a mensagem oficial que aparecerá na central de notificações de todos os usuários selecionados..."
              value={message}
              onChange={e => setMessage(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 leading-relaxed"
            />
          </div>

          {/* 5. Target Redirection Tab (Optional) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Aba de Destino ao Clicar (Opcional):</label>
            <select
              value={linkTab}
              onChange={e => setLinkTab(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
            >
              <option value="">Sem redirecionamento</option>
              <option value="community">Mural Técnico / Feed</option>
              <option value="tools">Gerador de OS & Ferramentas</option>
              <option value="market">Mercado TécnicaMZ</option>
              <option value="jobs">Vagas de Emprego</option>
              <option value="settings">Minha Conta & Assinatura</option>
            </select>
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-xs transition-all shadow-lg shadow-blue-600/30 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{isSubmitting ? 'Transmitindo...' : 'Disparar Comunicado Oficial'}</span>
          </button>
        </form>

        {/* Recent Announcements List */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-400" />
              Notificações Recentes
            </h3>
            <span className="text-[11px] text-slate-400">{notifications.length} enviadas</span>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {notifications.length === 0 ? (
              <div className="p-8 text-center rounded-xl bg-slate-950/40 border border-slate-800/60">
                <Bell className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-400">Nenhum comunicado disparado recentemente.</p>
              </div>
            ) : (
              notifications.slice(0, 15).map(notif => {
                const isAll = notif.userId === 'all';
                const isTech = notif.userId === 'technician';
                const isComp = notif.userId === 'company';
                const isCli = notif.userId === 'client';

                return (
                  <div
                    key={notif.id}
                    className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-white truncate">{notif.title}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold shrink-0">
                        {isAll ? 'Todos' : isTech ? 'Técnicos' : isComp ? 'Empresas' : isCli ? 'Clientes' : 'Individual'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {notif.createdAt ? new Date(notif.createdAt).toLocaleDateString('pt-PT') : 'Hoje'}
                      </span>
                      <span className="capitalize text-blue-400 font-semibold">{notif.type || 'info'}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
