import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { soundFX } from '../../utils/audio';
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

  if (!isOpen) return null;

  const handleClose = () => {
    soundFX.playModalClose();
    onClose();
  };

  // Filter notifications for current user or broadcast ('all', or role match)
  const userNotifications = notifications.filter(n => {
    if (!currentUser) return n.userId === 'all';
    return (
      n.userId === currentUser.uid ||
      n.userId === 'all' ||
      n.userId === currentUser.role ||
      n.userId === currentUser.tipoConta
    );
  });

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleClose}
              className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-slate-700 dark:text-slate-300 flex items-center gap-1 text-xs font-bold transition shadow-2xs cursor-pointer"
              title="Voltar / Sair"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Voltar</span>
            </button>
            <div className="relative w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Bell className="w-4 h-4" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
              )}
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                Central de Notificações
                {unreadNotificationsCount > 0 && (
                  <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300">
                    {unreadNotificationsCount} nova{unreadNotificationsCount > 1 ? 's' : ''}
                  </span>
                )}
              </h2>
              <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400">
                Pontos, soluções técnicas e atualizações em tempo real
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer"
            title="Fechar (X)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter bar & Mark All Read */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                filter === 'all'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              Todas ({userNotifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                filter === 'unread'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              Não Lidas ({unreadNotificationsCount})
            </button>
          </div>

          {unreadNotificationsCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 text-xs font-bold flex items-center gap-1 transition cursor-pointer"
              title="Marcar todas como lidas"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Marcar todas</span>
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {displayedNotifications.length === 0 ? (
            <div className="py-12 text-center text-slate-400 dark:text-slate-500">
              <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                <Bell className="w-6 h-6 opacity-40" />
              </div>
              <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                {filter === 'unread' ? 'Nenhuma notificação não lida' : 'Nenhuma notificação ainda'}
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 max-w-xs mx-auto">
                Quando receber pontos, soluções aceitas ou novas respostas no Mural, elas aparecerão aqui.
              </p>
            </div>
          ) : (
            displayedNotifications.map(item => {
              const isUnread = !item.read;
              return (
                <div
                  key={item.id}
                  onClick={() => handleNotificationClick(item)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 relative group ${
                    isUnread
                      ? 'bg-blue-50/70 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/60 hover:bg-blue-50 dark:hover:bg-blue-950/50 shadow-2xs'
                      : 'bg-slate-50 dark:bg-slate-800/50 border-slate-150 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {/* Icon container */}
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isUnread
                        ? 'bg-white dark:bg-slate-800 shadow-2xs'
                        : 'bg-slate-200/70 dark:bg-slate-700/60'
                    }`}
                  >
                    {getNotificationIcon(item)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center justify-between gap-2">
                      <h4
                        className={`text-xs font-black truncate ${
                          isUnread ? 'text-blue-950 dark:text-blue-200 font-black' : 'text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        {item.title}
                      </h4>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap shrink-0">
                        {formatNotificationTime(item.createdAt)}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                      {item.message}
                    </p>

                    {item.linkTab && (
                      <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-blue-600 dark:text-blue-400">
                        <span>Ver no aplicativo</span>
                        <ExternalLink className="w-3 h-3" />
                      </div>
                    )}
                  </div>

                  {/* Unread indicator dot */}
                  {isUnread && (
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0 absolute top-4 right-3.5 ring-2 ring-white dark:ring-slate-900" />
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/70 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            TécnicaMZ Pro • Notificações em Tempo Real
          </span>
          <button
            onClick={handleClose}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs transition cursor-pointer shadow-2xs active:scale-95"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
