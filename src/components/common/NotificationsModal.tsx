import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { soundFX } from '../../utils/audio';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';
import { useModalHistory } from '../../utils/modalHistory';
import {
  X,
  ArrowLeft,
  Bell,
  CheckCheck,
  ExternalLink,
  Flame,
  Award,
  MessageSquare,
  ThumbsUp,
  AlertTriangle,
  Info,
  CheckCircle2,
  Trash2
} from 'lucide-react';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: string) => void;
  onOpenMessages: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
  onOpenMessages
}) => {
  const { currentUser } = useAuth();
  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    unreadNotificationsCount
  } = useData();

  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  // Bloqueio de rolagem do fundo (body scroll lock)
  useBodyScrollLock(isOpen);

  const handleClose = () => {
    soundFX.playModalClose();
    onClose();
  };

  useModalHistory(isOpen, 'notifications_modal', handleClose);

  if (!isOpen) return null;

  // Filter notifications for current user or broadcast ('all', or role match)
  // FILTRO: Remove e bloqueia notificações de mensagens comuns de chat da central geral
  const userNotifications = notifications.filter(n => {
    if (
      n.linkTab === 'messages' ||
      n.deeplink === 'messages' ||
      (n.title && n.title.toLowerCase().includes('nova mensagem')) ||
      (n.title && n.title.toLowerCase().includes('mensagem de'))
    ) {
      return false;
    }

    if (!currentUser) return n.userId === 'all';
    return (
      n.userId === currentUser.uid ||
      n.userId === 'all' ||
      n.userId === currentUser.role ||
      n.userId === currentUser.tipoConta
    );
  });

  const modalUnreadCount = userNotifications.filter(n => !n.read).length;

  const displayedNotifications = filter === 'unread'
    ? userNotifications.filter(n => !n.read)
    : userNotifications;

  const handleNotificationClick = (item: any) => {
    soundFX.playClick();
    if (!item.read) {
      markNotificationAsRead(item.id);
    }
    if (item.linkTab) {
      onClose();
      onNavigateTab(item.linkTab);
    }
  };

  const handleMarkAllRead = () => {
    soundFX.playSuccess();
    markAllNotificationsAsRead();
  };

  const getNotificationIcon = (item: any) => {
    const title = (item.title || '').toLowerCase();
    const msg = (item.message || '').toLowerCase();

    if (title.includes('ofensiva') || title.includes('streak') || title.includes('dias na bancada')) {
      return <Flame className="w-4 h-4 text-orange-500 animate-pulse" />;
    }
    if (title.includes('solução') || title.includes('pontos') || title.includes('reputação') || item.type === 'success') {
      return <Award className="w-4 h-4 text-emerald-500" />;
    }
    if (title.includes('curtida') || title.includes('reação') || title.includes('reagiu')) {
      return <ThumbsUp className="w-4 h-4 text-blue-500" />;
    }
    if (title.includes('comentário') || title.includes('mensagem')) {
      return <MessageSquare className="w-4 h-4 text-sky-500" />;
    }
    if (item.type === 'warning' || item.type === 'alert') {
      return <AlertTriangle className="w-4 h-4 text-amber-500" />;
    }
    return <Info className="w-4 h-4 text-blue-500" />;
  };

  const formatNotificationTime = (dateStr?: string) => {
    if (!dateStr) return 'Agora';
    try {
      const d = new Date(dateStr);
      const diffMs = Date.now() - d.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'Agora';
      if (diffMins < 60) return `Há ${diffMins} min`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `Há ${diffHours}h`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays < 7) return `Há ${diffDays}d`;
      return d.toLocaleDateString('pt-MZ');
    } catch {
      return 'Recentemente';
    }
  };

  return (
    <div id="notifications_modal_overlay" className="modal-useful-fullscreen-overlay animate-in fade-in duration-150 bg-black/60 backdrop-blur-xs">
      <div id="notifications_modal_window" className="modal-useful-fullscreen-window bg-white text-slate-900">
        {/* Header - Fundo Branco e Textos Pretos */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-white shrink-0 sticky top-0 z-10 shadow-xs">
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleClose}
              className="p-1.5 rounded-xl bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-900 flex items-center gap-1.5 text-xs font-black transition cursor-pointer"
              title="Voltar / Sair"
            >
              <ArrowLeft className="w-4 h-4 text-slate-900" />
              <span className="hidden sm:inline">Voltar</span>
            </button>
            <div className="relative w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center shrink-0">
              <Bell className="w-4 h-4 text-blue-600" />
              {modalUnreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-600 ring-2 ring-white animate-pulse" />
              )}
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-slate-950 flex items-center gap-2 tracking-tight">
                Central de Notificações
                {modalUnreadCount > 0 && (
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-200">
                    {modalUnreadCount} nova{modalUnreadCount > 1 ? 's' : ''}
                  </span>
                )}
              </h2>
              <p className="text-[11px] text-slate-600 font-medium">
                Pontos, soluções técnicas e avisos oficiais do sistema
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-700 hover:text-slate-950 transition cursor-pointer"
            title="Fechar (X)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter bar & Mark All Read - Fundo Branco */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200 bg-white text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                filter === 'all'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              Todas ({userNotifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                filter === 'unread'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              Não Lidas ({modalUnreadCount})
            </button>
          </div>

          {modalUnreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg border border-blue-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              title="Marcar todas como lidas"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Marcar todas</span>
            </button>
          )}
        </div>

        {/* Notifications List - Fundo Branco e Textos Nítidos */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white">
          {displayedNotifications.length === 0 ? (
            <div className="py-14 text-center text-slate-500 bg-white rounded-2xl border border-dashed border-slate-200 p-6">
              <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-200">
                <Bell className="w-6 h-6" />
              </div>
              <p className="text-sm font-black text-slate-900">
                {filter === 'unread' ? 'Nenhuma notificação não lida' : 'Nenhuma notificação ainda'}
              </p>
              <p className="text-xs text-slate-600 mt-1 max-w-xs mx-auto">
                Quando receber pontos, soluções aceitas ou novos avisos oficiais, eles aparecerão aqui com leitura nítida.
              </p>
            </div>
          ) : (
            displayedNotifications.map(item => {
              const isUnread = !item.read;
              return (
                <div
                  key={item.id}
                  onClick={() => handleNotificationClick(item)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 relative group shadow-2xs ${
                    isUnread
                      ? 'bg-blue-50/90 border-blue-300 hover:bg-blue-100/70 hover:border-blue-400'
                      : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  {/* Icon container */}
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                      isUnread
                        ? 'bg-white border-blue-200 shadow-xs'
                        : 'bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    {getNotificationIcon(item)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <h4
                        className={`text-xs sm:text-sm font-black truncate tracking-tight ${
                          isUnread ? 'text-slate-950 font-black' : 'text-slate-900 font-bold'
                        }`}
                      >
                        {item.title}
                      </h4>
                      <span className="text-[11px] font-bold text-slate-500 whitespace-nowrap shrink-0">
                        {formatNotificationTime(item.createdAt)}
                      </span>
                    </div>

                    <p className="text-xs text-slate-800 line-clamp-2 leading-relaxed font-medium">
                      {item.message}
                    </p>

                    {item.linkTab && (
                      <div className="mt-2.5 flex items-center gap-1.5 text-xs font-black text-blue-700">
                        <span>Ver no aplicativo</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>

                  {/* Unread indicator dot */}
                  {isUnread && (
                    <span className="w-3 h-3 rounded-full bg-blue-600 shrink-0 absolute top-4 right-4 ring-2 ring-white" />
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer - Fundo Branco */}
        <div className="p-3.5 bg-white border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-xs font-semibold text-slate-600">
            TécnicaMZ Pro • Notificações em Tempo Real
          </span>
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-slate-900 hover:bg-black text-white rounded-xl font-black text-xs transition cursor-pointer shadow-xs active:scale-95"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
