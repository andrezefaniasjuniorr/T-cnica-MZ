import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import {
  X,
  ArrowLeft,
  Bell,
  MessageSquare,
  Users,
  ShoppingBag,
  ShieldAlert,
  Info,
  CheckCheck,
  ExternalLink
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
  const { currentUser, isTechnician, isCompany } = useAuth();
  const { conversations, communityPosts, marketItems } = useData();

  const [activeTab, setActiveTab] = useState<'messages' | 'feed_market' | 'official'>('messages');

  if (!isOpen) return null;

  // Derive unread conversations
  const unreadConversations = conversations.filter(
    c => c.participantIds.includes(currentUser?.uid || '') && ((c.unreadCount ?? 0) > 0)
  );

  // Derive recent community and market activities
  const recentPosts = (communityPosts || []).slice(0, 5);
  const recentMarket = (marketItems || []).slice(0, 5);

  // Official announcements
  const officialNotices = [
    {
      id: 'notice_1',
      title: 'Regulamentação EDM e Segurança Técnica 2026',
      description: 'Lembrete a todos os técnicos: instalações elétricas e dimensionamentos solares devem seguir as normas de segurança da Electricidade de Moçambique.',
      date: 'Hoje',
      type: 'security'
    },
    {
      id: 'notice_2',
      title: 'Pagamentos M-Pesa & e-Mola Integrados',
      description: 'Validação automática e instantânea de comprovativos de ativação Pro via M-Pesa (84) e e-Mola (86/87).',
      date: 'Ontem',
      type: 'payment'
    },
    {
      id: 'notice_3',
      title: 'Canal Direto de Suporte TécnicoMZ',
      description: 'Dúvidas ou problemas com sua conta? Fale conosco via WhatsApp Oficial 841234567 ou tecnicamzpro@gmail.com.',
      date: 'Esta semana',
      type: 'support'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 flex items-center gap-1 text-xs font-bold transition shadow-2xs"
              title="Voltar / Sair"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Voltar</span>
            </button>
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-slate-900">Centro de Notificações</h2>
              <p className="text-[10px] sm:text-[11px] text-slate-500">Mantenha-se atualizado em tempo real</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition"
            title="Fechar (X)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3 Structured Tabs */}
        <div className="flex items-center border-b border-slate-100 bg-white px-3 pt-2 gap-1">
          <button
            onClick={() => setActiveTab('messages')}
            className={`flex-1 py-2.5 text-xs font-bold border-b-2 text-center transition flex items-center justify-center gap-1.5 ${
              activeTab === 'messages'
                ? 'border-blue-600 text-blue-600 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Mensagens</span>
            {unreadConversations.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('feed_market')}
            className={`flex-1 py-2.5 text-xs font-bold border-b-2 text-center transition flex items-center justify-center gap-1.5 ${
              activeTab === 'feed_market'
                ? 'border-blue-600 text-blue-600 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Mural & Mercado</span>
          </button>

          <button
            onClick={() => setActiveTab('official')}
            className={`flex-1 py-2.5 text-xs font-bold border-b-2 text-center transition flex items-center justify-center gap-1.5 ${
              activeTab === 'official'
                ? 'border-blue-600 text-blue-600 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            <span>Avisos Oficiais</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* TAB 1: MENSAGENS */}
          {activeTab === 'messages' && (
            <div className="space-y-2">
              {unreadConversations.length === 0 ? (
                <div className="py-8 text-center text-slate-400">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40 text-blue-500" />
                  <p className="text-xs font-bold text-slate-600">Nenhuma mensagem pendente</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Todas as conversas foram lidas.</p>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenMessages();
                    }}
                    className="mt-3 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold transition"
                  >
                    Abrir Chat Completo
                  </button>
                </div>
              ) : (
                unreadConversations.map(conv => (
                  <div
                    key={conv.id}
                    onClick={() => {
                      onClose();
                      onOpenMessages();
                    }}
                    className="p-3 bg-blue-50/50 hover:bg-blue-50 border border-blue-100 rounded-2xl cursor-pointer transition flex items-start justify-between gap-3"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                        {(conv.targetUserName || conv.participants.find(p => p.id !== currentUser?.uid)?.name || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-slate-900">{conv.targetUserName || conv.participants.find(p => p.id !== currentUser?.uid)?.name || 'Conversa'}</h4>
                        <p className="text-[11px] text-slate-600 line-clamp-1">{conv.lastMessage || 'Nova mensagem enviada.'}</p>
                      </div>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-1"></span>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: MURAL & MERCADO */}
          {activeTab === 'feed_market' && (
            <div className="space-y-3">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Atividades Recentes no Mural
              </div>
              {recentPosts.length === 0 ? (
                <p className="text-xs text-slate-500">Nenhuma postagem recente.</p>
              ) : (
                recentPosts.map(p => (
                  <div
                    key={p.id}
                    onClick={() => {
                      onClose();
                      onNavigateTab('community');
                    }}
                    className="p-3 bg-slate-50 hover:bg-slate-100/80 border border-slate-100 rounded-2xl cursor-pointer transition flex items-start gap-2.5"
                  >
                    <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 font-bold text-xs">
                      {p.authorName?.charAt(0).toUpperCase() || 'P'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900">
                        {p.authorName} <span className="font-normal text-slate-500">publicou no mural</span>
                      </p>
                      <p className="text-[11px] text-slate-600 line-clamp-1 mt-0.5">{p.content}</p>
                    </div>
                  </div>
                ))
              )}

              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pt-2">
                Novos Equipamentos no Mercado
              </div>
              {recentMarket.map(item => (
                <div
                  key={item.id}
                  onClick={() => {
                    onClose();
                    onNavigateTab('market');
                  }}
                  className="p-3 bg-slate-50 hover:bg-slate-100/80 border border-slate-100 rounded-2xl cursor-pointer transition flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5">
                    <ShoppingBag className="w-4 h-4 text-blue-600 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">{item.title}</p>
                      <p className="text-[11px] text-slate-500">{item.location} • {item.sellerName}</p>
                    </div>
                  </div>
                  <span className="text-xs font-black text-blue-600 font-mono shrink-0">
                    {(item.priceMZN || item.price || 0).toLocaleString('pt-MZ')} MZN
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: AVISOS OFICIAIS */}
          {activeTab === 'official' && (
            <div className="space-y-3">
              {officialNotices.map(notice => (
                <div
                  key={notice.id}
                  className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-blue-600" />
                      <span>{notice.title}</span>
                    </h4>
                    <span className="text-[10px] text-slate-400 font-medium">{notice.date}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    {notice.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-[11px] text-slate-500">TécnicaMZ Pro Notificações</span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-blue-600 text-white rounded-xl font-bold text-xs hover:bg-blue-700 transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
