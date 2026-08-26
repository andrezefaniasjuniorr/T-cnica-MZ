import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { ConversationItem, MessageItem } from '../../types';
import {
  X,
  MessageSquare,
  Send,
  Search,
  CheckCircle2,
  Clock,
  User,
  Building2,
  Wrench,
  Shield,
  Phone
} from 'lucide-react';

interface MessagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTargetUserId?: string;
  initialTargetUserName?: string;
  initialTargetRole?: string;
}

export const MessagesModal: React.FC<MessagesModalProps> = ({
  isOpen,
  onClose,
  initialTargetUserId,
  initialTargetUserName,
  initialTargetRole
}) => {
  const { currentUser } = useAuth();
  const { conversations, messages, sendMessage, startOrGetConversation } = useData();

  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize or select conversation when target is passed
  useEffect(() => {
    if (isOpen && currentUser && initialTargetUserId) {
      const convId = startOrGetConversation(
        initialTargetUserId,
        initialTargetUserName || 'Utilizador',
        initialTargetRole || 'client',
        { type: 'direct', title: 'Contato Direto' }
      );
      setActiveConvId(convId);
    } else if (isOpen && currentUser && !activeConvId) {
      // Pick first conversation user is part of
      const userConvs = conversations.filter(c => c.participantIds.includes(currentUser.uid));
      if (userConvs.length > 0) {
        setActiveConvId(userConvs[0].id);
      }
    }
  }, [isOpen, initialTargetUserId, currentUser]);

  // Scroll to bottom of message list on updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeConvId]);

  if (!isOpen || !currentUser) return null;

  // Conversations user participates in
  const userConversations = conversations.filter(c => c.participantIds.includes(currentUser.uid));

  const filteredConversations = userConversations.filter(c => {
    const other = c.participants.find(p => p.id !== currentUser.uid);
    if (!other) return false;
    return other.name.toLowerCase().includes(searchTerm.toLowerCase()) || (c.lastMessage && c.lastMessage.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  const activeConversation = conversations.find(c => c.id === activeConvId);
  const otherParticipant = activeConversation?.participants.find(p => p.id !== currentUser.uid);
  const activeMessages = messages.filter(m => m.conversationId === activeConvId);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConvId) return;

    sendMessage(activeConvId, inputText.trim());
    setInputText('');
  };

  const getRoleBadge = (role?: string) => {
    if (role === 'technician') return <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold">🔧 Técnico</span>;
    if (role === 'company') return <span className="text-[10px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded font-bold">🏢 Empresa</span>;
    if (role === 'admin' || role === 'super_admin') return <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold">🛡️ Admin</span>;
    return <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">👤 Cliente</span>;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="relative w-full max-w-4xl h-[85vh] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col md:flex-row animate-in fade-in zoom-in-95 duration-150">
        {/* Left Sidebar: Conversations List */}
        <div className="w-full md:w-80 bg-slate-50 border-r border-slate-200 flex flex-col h-full shrink-0">
          {/* Header */}
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                <MessageSquare className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-black text-slate-900">Mensagens & Chat</h3>
            </div>
            <span className="text-[11px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
              {userConversations.length}
            </span>
          </div>

          {/* Search */}
          <div className="p-3 border-b border-slate-200">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Buscar conversa..."
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filteredConversations.length === 0 ? (
              <div className="text-center py-10 text-slate-400 space-y-1">
                <MessageSquare className="w-6 h-6 mx-auto text-slate-300" />
                <p className="text-xs font-semibold">Nenhuma conversa ativa</p>
              </div>
            ) : (
              filteredConversations.map(c => {
                const other = c.participants.find(p => p.id !== currentUser.uid);
                const isSelected = c.id === activeConvId;

                return (
                  <button
                    key={c.id}
                    onClick={() => setActiveConvId(c.id)}
                    className={`w-full text-left p-3 rounded-2xl transition flex items-start gap-3 ${
                      isSelected ? 'bg-blue-600 text-white shadow-xs' : 'hover:bg-slate-200/70 text-slate-800'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {other?.name.charAt(0) || 'U'}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                          {other?.name}
                        </p>
                        <span className={`text-[10px] ${isSelected ? 'text-blue-200' : 'text-slate-400'}`}>
                          {new Date(c.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className={`text-[11px] truncate mt-0.5 ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                        {c.lastMessage}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Chat Area */}
        <div className="flex-1 flex flex-col h-full bg-white">
          {activeConversation && otherParticipant ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-sm">
                    {otherParticipant.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-black text-slate-900">{otherParticipant.name}</h4>
                      {getRoleBadge(otherParticipant.role)}
                    </div>
                    {activeConversation.contextTitle && (
                      <p className="text-[11px] text-slate-500">
                        Contexto: <strong className="text-slate-700">{activeConversation.contextTitle}</strong>
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={onClose}
                    className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Messages Flow */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 bg-slate-50/50">
                {activeMessages.map(msg => {
                  const isMe = msg.senderId === currentUser.uid;

                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[78%] p-3.5 rounded-2xl text-xs space-y-1 shadow-xs ${
                          isMe
                            ? 'bg-blue-600 text-white rounded-br-none'
                            : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                        }`}
                      >
                        <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                        <div className={`text-[10px] text-right flex items-center justify-end gap-1 ${
                          isMe ? 'text-blue-200' : 'text-slate-400'
                        }`}>
                          <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          {isMe && <CheckCircle2 className="w-3 h-3 text-blue-200" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Form */}
              <form onSubmit={handleSend} className="p-3 sm:p-4 border-t border-slate-200 bg-white flex items-center gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  placeholder="Escreva sua mensagem profissional..."
                  className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="p-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl transition shadow-xs"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-2">
              <MessageSquare className="w-12 h-12 text-slate-300" />
              <p className="text-sm font-bold text-slate-700">Selecione uma conversa ao lado</p>
              <p className="text-xs text-slate-400 max-w-xs">
                Inicie contato com técnicos certificados, clientes ou empresas moçambicanas.
              </p>
              <button
                onClick={onClose}
                className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
              >
                Fechar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
