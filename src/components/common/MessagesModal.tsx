import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';
import { useModalHistory } from '../../utils/modalHistory';
import { soundFX } from '../../utils/audio';
import { getInitial } from '../../utils/stringUtils';
import { ConversationItem, MessageItem } from '../../types';
import {
  X,
  ArrowLeft,
  MessageSquare,
  Send,
  Search,
  CheckCheck,
  User,
  Wrench,
  Building2,
  Shield,
  Sparkles
} from 'lucide-react';

interface MessagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTargetUserId?: string;
  initialTargetUserName?: string;
  initialTargetRole?: string;
}

// Formatador seguro de data e hora para evitar RangeError: Invalid time value
function formatSafeTime(dateVal: any): string {
  if (!dateVal) return '';
  try {
    let d: Date;
    if (typeof dateVal?.toDate === 'function') {
      d = dateVal.toDate();
    } else if (dateVal?.seconds && typeof dateVal.seconds === 'number') {
      d = new Date(dateVal.seconds * 1000);
    } else if (typeof dateVal === 'number') {
      d = new Date(dateVal);
    } else if (typeof dateVal === 'string') {
      d = new Date(dateVal);
    } else {
      return '';
    }
    if (isNaN(d.getTime())) return '';
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

// Extrai texto puro de forma segura sem lançar 'Objects are not valid as a React child'
function renderSafeText(val: any): string {
  if (!val) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'number') return String(val);
  if (typeof val === 'object') {
    return val.text || val.content || val.message || '';
  }
  return String(val);
}

export const MessagesModal: React.FC<MessagesModalProps> = ({
  isOpen,
  onClose,
  initialTargetUserId,
  initialTargetUserName,
  initialTargetRole
}) => {
  const { currentUser } = useAuth();
  const { conversations = [], messages = [], sendMessage, markConversationAsRead, startOrGetConversation } = useData();

  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize or select conversation when target is passed
  useEffect(() => {
    if (!isOpen || !currentUser) return;

    if (initialTargetUserId && startOrGetConversation) {
      try {
        const convId = startOrGetConversation(
          initialTargetUserId,
          initialTargetUserName || 'Utilizador',
          initialTargetRole || 'client',
          { type: 'direct', title: 'Contato Direto' }
        );
        if (convId) {
          setActiveConvId(convId);
        }
      } catch (err) {
        console.warn('Erro ao inicializar conversa:', err);
      }
    } else if (!activeConvId) {
      // Pick first conversation user is part of
      const userConvs = (conversations || []).filter(
        c => c && Array.isArray(c?.participantIds) && c.participantIds.includes(currentUser.uid)
      );
      if (userConvs.length > 0 && userConvs[0]?.id) {
        setActiveConvId(userConvs[0].id);
      }
    }
  }, [isOpen, initialTargetUserId, currentUser]);

  // Ao abrir ou receber mensagem na conversa ativa, marca como lida
  useEffect(() => {
    if (activeConvId && markConversationAsRead) {
      try {
        markConversationAsRead(activeConvId);
      } catch {}
    }
  }, [activeConvId, messages?.length]);

  // Scroll to bottom of message list on updates (auto-scroll suave)
  useEffect(() => {
    if (messagesEndRef.current) {
      try {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      } catch {}
    }
  }, [messages?.length, activeConvId]);

  const handleClose = () => {
    soundFX.playModalClose();
    onClose();
  };

  useModalHistory(isOpen, 'messages_modal', () => {
    if (activeConvId) {
      setActiveConvId(null);
    } else {
      handleClose();
    }
  });

  // Bloqueio de rolagem do fundo (body scroll lock)
  useBodyScrollLock(isOpen);

  if (!isOpen || !currentUser) return null;

  // Conversations user participates in
  const userConversations = (conversations || []).filter(
    c => c && Array.isArray(c?.participantIds) && c.participantIds.includes(currentUser.uid)
  );

  const filteredConversations = userConversations.filter(c => {
    const participantsList = Array.isArray(c?.participants) ? c.participants.filter(Boolean) : [];
    const other = participantsList.find(p => p && p.id !== currentUser.uid);
    const otherName = other?.name || (c as any)?.targetName || 'Utilizador';
    const lastMsg = renderSafeText(c?.lastMessage);
    const search = searchTerm.trim().toLowerCase();
    if (!search) return true;
    return (
      otherName.toLowerCase().includes(search) ||
      lastMsg.toLowerCase().includes(search)
    );
  });

  // Resolução robusta da conversa ativa
  const activeConversation: ConversationItem | null = (conversations || []).find(c => c && c.id === activeConvId) || (
    activeConvId && initialTargetUserId ? {
      id: activeConvId,
      participantIds: [currentUser.uid, initialTargetUserId],
      participants: [
        { id: currentUser.uid, name: currentUser.name || 'Eu', role: currentUser.role || 'client' },
        { id: initialTargetUserId, name: initialTargetUserName || 'Utilizador', role: (initialTargetRole as any) || 'client' }
      ],
      lastMessage: 'Conversa iniciada',
      lastMessageAt: new Date().toISOString()
    } as ConversationItem : null
  );

  const otherParticipant = (() => {
    if (!activeConversation) return null;
    const participantsList = Array.isArray(activeConversation.participants)
      ? activeConversation.participants.filter(Boolean)
      : [];
    const found = participantsList.find(p => p && p.id !== currentUser.uid);
    if (found) return found;
    if (initialTargetUserId && initialTargetUserName) {
      return { id: initialTargetUserId, name: initialTargetUserName, role: initialTargetRole || 'client' };
    }
    return { id: 'outro', name: 'Utilizador', role: 'client' };
  })();

  const activeMessages = (messages || []).filter(m => m && m.conversationId === activeConvId);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConvId) return;

    soundFX.playComment();
    if (sendMessage) {
      sendMessage(activeConvId, inputText.trim());
    }
    setInputText('');
  };

  const getRoleBadge = (role?: string) => {
    if (role === 'technician') return <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold">🔧 Técnico</span>;
    if (role === 'company') return <span className="text-[10px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded font-bold">🏢 Empresa</span>;
    if (role === 'admin' || role === 'super_admin') return <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold">🛡️ Admin</span>;
    return <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">👤 Cliente</span>;
  };

  return (
    <div id="messages_modal_overlay" className="modal-useful-fullscreen-overlay">
      <div id="messages_modal_window" className="modal-useful-fullscreen-window bg-white flex flex-col md:flex-row animate-in fade-in duration-150">
        
        {/* Left Sidebar: Conversations List */}
        <div className={`w-full md:w-80 bg-slate-50 border-r border-slate-200 flex flex-col h-full shrink-0 ${
          activeConvId ? 'hidden md:flex' : 'flex'
        }`}>
          {/* Header with Exit button */}
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white shrink-0 sticky top-0 z-10">
            <div className="flex items-center gap-2">
              <button
                onClick={handleClose}
                className="p-1.5 -ml-1 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition"
                title="Voltar / Sair do Chat"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                <MessageSquare className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-black text-slate-900">Mensagens</h3>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                {userConversations.length}
              </span>
              <button
                onClick={handleClose}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                title="Fechar Chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
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
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filteredConversations.length === 0 ? (
              <div className="text-center py-10 px-4 text-slate-400 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-500 mx-auto flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-700">Nenhuma conversa ativa</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Abra o perfil de um técnico ou empresa credenciada para iniciar uma conversa direta.
                  </p>
                </div>
              </div>
            ) : (
              filteredConversations.map(c => {
                const pList = Array.isArray(c?.participants) ? c.participants.filter(Boolean) : [];
                const other = pList.find(p => p && p.id !== currentUser.uid);
                const isSelected = c.id === activeConvId;
                const otherName = other?.name || (c as any)?.targetName || 'Usuário';
                const lastMsgText = renderSafeText(c?.lastMessage) || 'Conversa iniciada';
                const timeText = formatSafeTime(c?.lastMessageAt);

                return (
                  <button
                    key={c.id}
                    onClick={() => {
                      soundFX.playClick();
                      setActiveConvId(c.id);
                    }}
                    className={`w-full text-left p-3 rounded-2xl transition flex items-start gap-3 ${
                      isSelected ? 'bg-blue-600 text-white shadow-xs' : 'hover:bg-slate-200/70 text-slate-800'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {getInitial(otherName)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                          {otherName}
                        </p>
                        {timeText && (
                          <span className={`text-[10px] shrink-0 ${isSelected ? 'text-blue-200' : 'text-slate-400'}`}>
                            {timeText}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between gap-2 mt-0.5">
                        <p className={`text-[11px] truncate flex-1 ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                          {lastMsgText}
                        </p>
                        {!isSelected && (c.unreadCount ?? 0) > 0 && (
                          <span className="min-w-[18px] h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center shrink-0">
                            {c.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Chat Area */}
        <div className={`flex-1 flex flex-col h-full bg-white ${
          !activeConvId ? 'hidden md:flex' : 'flex'
        }`}>
          {activeConversation && otherParticipant ? (
            <>
              {/* Chat Header */}
              <div className="p-3 sm:p-4 border-b border-slate-200 flex items-center justify-between bg-white gap-2 shrink-0 sticky top-0 z-10">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  {/* Mobile Back Button to conversation list */}
                  <button
                    onClick={() => {
                      soundFX.playClick();
                      setActiveConvId(null);
                    }}
                    className="p-1.5 md:hidden text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition flex items-center gap-1 text-xs font-bold shrink-0"
                    title="Voltar para Lista de Conversas"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Conversas</span>
                  </button>

                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-sm shrink-0">
                    {getInitial(otherParticipant.name)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-black text-slate-900 truncate">{otherParticipant.name || 'Usuário'}</h4>
                      {getRoleBadge(otherParticipant.role)}
                    </div>
                    {activeConversation.contextTitle && (
                      <p className="text-[11px] text-slate-500 truncate">
                        Contexto: <strong className="text-slate-700">{activeConversation.contextTitle}</strong>
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={handleClose}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition flex items-center gap-1 text-xs font-bold"
                    title="Fechar Janela de Chat"
                  >
                    <span className="hidden sm:inline">Sair</span>
                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              </div>

              {/* Messages Flow */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 bg-slate-50/50">
                {activeMessages.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 mx-auto flex items-center justify-center">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-bold text-slate-700">Início da conversa</p>
                    <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                      Envie uma mensagem profissional para alinhar orçamentos, obras ou esclarecer dúvidas técnicas.
                    </p>
                  </div>
                ) : (
                  activeMessages.map(msg => {
                    if (!msg) return null;
                    const isMe = msg.senderId === currentUser.uid;
                    const text = renderSafeText(msg.text);
                    const time = formatSafeTime(msg.createdAt);

                    return (
                      <div
                        key={msg.id || `msg_${Math.random()}`}
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[85%] sm:max-w-[78%] p-3.5 rounded-2xl text-xs sm:text-sm space-y-1 shadow-xs ${
                            isMe
                              ? 'bg-blue-600 text-white rounded-br-none'
                              : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                          }`}
                        >
                          <p className="leading-relaxed whitespace-pre-wrap">{text}</p>
                          <div className={`text-[10px] text-right flex items-center justify-end gap-1 ${
                            isMe ? 'text-blue-200' : 'text-slate-400'
                          }`}>
                            {time && <span>{time}</span>}
                            {isMe && (
                              (msg.read || msg.status === 'read') ? (
                                <span title="Mensagem lida"><CheckCheck className="w-3.5 h-3.5 text-sky-300 inline shrink-0" /></span>
                              ) : (
                                <span title="Mensagem enviada / entregue"><CheckCheck className="w-3.5 h-3.5 text-blue-200 inline shrink-0" /></span>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
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
                  className="p-2.5 sm:px-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl transition shadow-xs flex items-center gap-1 font-bold text-xs shrink-0"
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">Enviar</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <MessageSquare className="w-7 h-7 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">Selecione uma conversa</p>
                <p className="text-xs text-slate-400 max-w-xs mt-1">
                  Inicie contato direto com técnicos certificados, clientes ou empresas moçambicanas.
                </p>
              </div>
              <button
                onClick={handleClose}
                className="mt-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Voltar à Aplicação</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
