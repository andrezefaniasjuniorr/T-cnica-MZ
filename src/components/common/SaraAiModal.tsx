import React, { useState, useRef, useEffect, useCallback, memo, forwardRef, useImperativeHandle } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { useAuth } from '../../context/AuthContext';
import { SeloMZModal } from './SeloMZModal';
import { doc, setDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../../firebase/config';
import { soundFX } from '../../utils/audio';
import {
  X,
  ArrowLeft,
  Sparkles,
  Send,
  Bot,
  Camera,
  Image as ImageIcon,
  Loader2,
  Trash2,
  Zap,
  Sun,
  FileSpreadsheet,
  Lock,
  ArrowRight
} from 'lucide-react';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || (typeof process !== 'undefined' ? process.env.VITE_GEMINI_API_KEY || process.env.REACT_APP_GEMINI_API_KEY : '') || '';

interface SaraAiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToSettings?: () => void;
}

interface Message {
  id: string;
  sender: 'sara' | 'user';
  text: string;
  imageUrl?: string;
  timestamp: string;
}

export interface ChatInputFormHandle {
  setInputText: (text: string) => void;
  focus: () => void;
}

// Definição estática e memoizada dos componentes do Markdown para evitar re-criação de nós na árvore virtual
const MARKDOWN_COMPONENTS = {
  h1: ({ children }: any) => <h1 className="text-base font-black text-slate-900 mt-3 mb-1.5 pb-1 border-b border-slate-200">{children}</h1>,
  h2: ({ children }: any) => <h2 className="text-sm sm:text-base font-black text-slate-900 mt-2.5 mb-1">{children}</h2>,
  h3: ({ children }: any) => <h3 className="text-xs sm:text-sm font-bold text-blue-950 mt-2 mb-1">{children}</h3>,
  h4: ({ children }: any) => <h4 className="text-xs font-bold text-slate-800 mt-1.5 mb-0.5">{children}</h4>,
  p: ({ children }: any) => <p className="mb-2 last:mb-0 leading-relaxed text-slate-800">{children}</p>,
  strong: ({ children }: any) => <strong className="font-bold text-slate-950">{children}</strong>,
  em: ({ children }: any) => <em className="italic text-slate-700">{children}</em>,
  ul: ({ children }: any) => <ul className="list-disc pl-5 my-2 space-y-1 text-slate-800">{children}</ul>,
  ol: ({ children }: any) => <ol className="list-decimal pl-5 my-2 space-y-1 text-slate-800">{children}</ol>,
  li: ({ children }: any) => <li className="leading-relaxed">{children}</li>,
  blockquote: ({ children }: any) => (
    <blockquote className="border-l-4 border-blue-600 pl-3 py-1.5 my-2 bg-blue-50/70 rounded-r-lg italic text-slate-800 text-xs sm:text-sm">
      {children}
    </blockquote>
  ),
  code: ({ className, children, ...props }: any) => {
    const isInline = !className && typeof children === 'string' && !children.includes('\n');
    if (isInline) {
      return (
        <code className="bg-slate-100 text-blue-800 font-mono text-[11px] sm:text-xs px-1.5 py-0.5 rounded border border-slate-200 font-medium" {...props}>
          {children}
        </code>
      );
    }
    return (
      <code className="block bg-slate-900 text-slate-100 p-3 rounded-xl overflow-x-auto my-2 font-mono text-[11px] sm:text-xs leading-relaxed" {...props}>
        {children}
      </code>
    );
  },
  pre: ({ children }: any) => <pre className="my-2 rounded-xl overflow-hidden shadow-xs">{children}</pre>,
  table: ({ children }: any) => (
    <div className="overflow-x-auto my-3 rounded-xl border border-slate-300 shadow-2xs">
      <table className="min-w-full divide-y divide-slate-200 text-xs border-collapse">{children}</table>
    </div>
  ),
  thead: ({ children }: any) => <thead className="bg-slate-100 text-slate-900 font-bold">{children}</thead>,
  th: ({ children }: any) => <th className="border border-slate-300 p-2 text-left font-bold text-slate-900 bg-slate-100/90 whitespace-nowrap">{children}</th>,
  td: ({ children }: any) => <td className="border border-slate-200 p-2 text-slate-700 bg-white">{children}</td>,
  hr: () => <hr className="my-3 border-slate-200" />
};

const MARKDOWN_REMARK_PLUGINS = [remarkGfm, remarkBreaks, remarkMath];
const MARKDOWN_REHYPE_PLUGINS = [rehypeKatex];

// Item individual da mensagem memoizado: NUNCA re-renderiza quando o usuário digita na caixa de texto
const ChatMessageItem = memo<{
  message: Message;
  isThinkingThisMessage?: boolean;
}>(({ message, isThinkingThisMessage }) => {
  return (
    <div
      className={`flex gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      {message.sender === 'sara' && (
        <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xs shrink-0 shadow-sm">
          <Bot className="w-4 h-4" />
        </div>
      )}

      <div
        className={`max-w-[85%] sm:max-w-[80%] p-4 rounded-2xl text-xs sm:text-sm space-y-2 shadow-xs ${
          message.sender === 'user'
            ? 'bg-slate-900 text-white rounded-br-none'
            : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-none'
        }`}
      >
        {message.imageUrl && (
          <div className="rounded-xl overflow-hidden border border-slate-300/40 max-h-52 bg-slate-950 flex items-center justify-center">
            <img
              src={message.imageUrl}
              alt="Upload técnico"
              className="max-h-52 object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
        )}

        {message.sender === 'user' ? (
          <div className="leading-relaxed whitespace-pre-wrap font-normal">
            {message.text}
          </div>
        ) : (
          <div className="leading-relaxed font-normal text-slate-800">
            {message.text ? (
              <div className="sara-markdown prose prose-sm max-w-none prose-table:border-collapse prose-th:border prose-th:p-2 prose-td:border prose-td:p-2 text-slate-800 text-xs sm:text-sm">
                <ReactMarkdown
                  remarkPlugins={MARKDOWN_REMARK_PLUGINS}
                  rehypePlugins={MARKDOWN_REHYPE_PLUGINS}
                  components={MARKDOWN_COMPONENTS}
                >
                  {message.text}
                </ReactMarkdown>
              </div>
            ) : isThinkingThisMessage ? (
              <div className="flex items-center gap-1.5 py-1 text-slate-400">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse delay-100" />
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse delay-200" />
              </div>
            ) : null}
          </div>
        )}

        <div className="text-[10px] text-right text-slate-400">
          {message.timestamp}
        </div>
      </div>
    </div>
  );
}, (prev, next) => {
  return (
    prev.message.id === next.message.id &&
    prev.message.text === next.message.text &&
    prev.message.imageUrl === next.message.imageUrl &&
    prev.message.timestamp === next.message.timestamp &&
    prev.isThinkingThisMessage === next.isThinkingThisMessage
  );
});

ChatMessageItem.displayName = 'ChatMessageItem';

// Lista de mensagens isolada e memoizada
const ChatMessagesList = memo<{
  messages: Message[];
  isThinking: boolean;
  userName: string;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}>(({ messages, isThinking, userName, messagesEndRef }) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50">
      {messages.map((m, idx) => {
        const isLastSara = m.sender === 'sara' && idx === messages.length - 1;
        return (
          <ChatMessageItem
            key={m.id}
            message={m}
            isThinkingThisMessage={isLastSara && isThinking && !m.text}
          />
        );
      })}

      {isThinking && (
        <div className="flex items-center gap-3 p-3.5 bg-white border border-slate-200 rounded-2xl shadow-xs text-xs text-slate-600 max-w-sm">
          <Loader2 className="w-4 h-4 text-blue-600 animate-spin shrink-0" />
          <span>Sara IA a processar para {userName}...</span>
        </div>
      )}

      {/* Âncora invisível para o auto-scroll */}
      <div ref={messagesEndRef} />
    </div>
  );
});

ChatMessagesList.displayName = 'ChatMessagesList';

// Barra de entrada isolada: seu estado local impede que cada digitação cause re-renderização do feed de mensagens
interface ChatInputFormProps {
  onSend: (text: string, image: { base64: string; mimeType: string; preview: string } | null) => void;
  isThinking: boolean;
  userName: string;
  hasAccess: boolean;
  onOpenSeloModal: () => void;
  onGoToSettings?: () => void;
  onClose: () => void;
}

const ChatInputForm = memo(forwardRef<ChatInputFormHandle, ChatInputFormProps>(({
  onSend,
  isThinking,
  userName,
  hasAccess,
  onOpenSeloModal,
  onGoToSettings,
  onClose
}, ref) => {
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<{ base64: string; mimeType: string; preview: string } | null>(null);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  useImperativeHandle(ref, () => ({
    setInputText: (text: string) => {
      setInputText(text);
    },
    focus: () => {
      inputRef.current?.focus();
    }
  }), []);

  const handleImageSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setSelectedImage({
        base64: result,
        mimeType: file.type || 'image/jpeg',
        preview: result
      });
    };
    reader.readAsDataURL(file);
    // Limpa o valor do input para permitir selecionar o mesmo arquivo se desejado
    e.target.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputText.trim() && !selectedImage) || isThinking) return;

    const textToSend = inputText;
    const imageToSend = selectedImage;

    setInputText('');
    setSelectedImage(null);

    onSend(textToSend, imageToSend);
  };

  return (
    <>
      {/* Image Preview */}
      {selectedImage && (
        <div className="px-4 py-2 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={selectedImage.preview}
              alt="Prévia"
              className="w-12 h-12 object-cover rounded-lg border border-slate-300 shadow-xs"
            />
            <div className="text-xs">
              <p className="font-bold text-slate-800">Foto técnica anexada</p>
              <p className="text-slate-500">Sara IA analisará com visão computacional</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSelectedImage(null)}
            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
            title="Remover anexo"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Input Form or Locked Badge */}
      {!hasAccess ? (
        <div className="p-4 bg-slate-900 text-white border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-xs text-slate-300">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-white">Sara IA Bloqueada (Selo MZ Necessário)</p>
              <p className="text-[11px] text-slate-400">Ative o seu Selo MZ (50 MT via M-Pesa/e-Mola) para desbloquear.</p>
            </div>
          </div>
          <button
            id="btn_upgrade_sara_ai"
            type="button"
            onClick={() => {
              if (onGoToSettings) {
                onClose();
                onGoToSettings();
              } else {
                onOpenSeloModal();
              }
            }}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/30 transition-all shrink-0 cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5" />
            Ativar Selo MZ (50 MT)
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="p-3 sm:p-4 bg-white border-t border-slate-200 flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelected}
            accept="image/*"
            className="hidden"
          />
          <input
            type="file"
            ref={cameraInputRef}
            onChange={handleImageSelected}
            accept="image/*"
            capture="environment"
            className="hidden"
          />

          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            title="Tirar foto com a câmara"
            className="p-2.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 rounded-xl transition border border-slate-200 shrink-0 cursor-pointer"
          >
            <Camera className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Anexar imagem da galeria"
            className="p-2.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 rounded-xl transition border border-slate-200 shrink-0 cursor-pointer"
          >
            <ImageIcon className="w-4 h-4" />
          </button>

          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder={`Pergunte algo ou envie uma foto, ${userName}...`}
            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
          />

          <button
            type="submit"
            disabled={(!inputText.trim() && !selectedImage) || isThinking}
            className="p-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl transition shadow-xs shrink-0 cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      )}
    </>
  );
}));

ChatInputForm.displayName = 'ChatInputForm';

export const SaraAiModal: React.FC<SaraAiModalProps> = ({ isOpen, onClose, onGoToSettings }) => {
  const { currentUser, isTechnician, isCompany, isAdmin, temSeloMZ, isSubscriptionActive } = useAuth();
  const [showSeloModal, setShowSeloModal] = useState(false);

  const hasAccess = isAdmin || (!isTechnician && !isCompany) || temSeloMZ || isSubscriptionActive;
  const userName = currentUser?.name || 'Usuário';
  const storageKey = `sara_chat_history_${currentUser?.uid || 'guest'}`;

  // Saudação curta e direta
  const getInitialGreeting = useCallback(() => {
    return `Olá ${userName}, Sou Eng.Sara IA da TécnicaMZ Pro! Precisa de ajuda?`;
  }, [userName]);

  // Carrega histórico do localStorage ou inicia com a saudação curta
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Erro ao carregar mensagens locais:', e);
    }
    return [
      {
        id: 'init_msg',
        sender: 'sara',
        text: `Olá ${userName}, Sou Eng.Sara IA da TécnicaMZ Pro! Precisa de ajuda?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
  });

  const [isThinking, setIsThinking] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const chatInputRef = useRef<ChatInputFormHandle | null>(null);

  // Auto-scroll sempre que as mensagens mudam ou quando o modal é aberto
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isThinking, scrollToBottom]);

  // Salva no LocalStorage com proteção de cota (omite dados pesados de imagens base64 para preservar o limite de 5MB)
  useEffect(() => {
    try {
      const sanitized = messages.slice(-30).map(m => {
        if (m.imageUrl && m.imageUrl.startsWith('data:') && m.imageUrl.length > 2000) {
          return { ...m, imageUrl: undefined };
        }
        return m;
      });
      localStorage.setItem(storageKey, JSON.stringify(sanitized));
    } catch (e) {
      console.warn('Erro ao salvar mensagens no LocalStorage:', e);
    }
  }, [messages, storageKey]);

  if (!isOpen) return null;

  const handleQuickPrompt = (prompt: string) => {
    chatInputRef.current?.setInputText(prompt);
    chatInputRef.current?.focus();
  };

  const handleClearChat = () => {
    if (window.confirm('Deseja realmente limpar o histórico da conversa?')) {
      const resetMsg: Message[] = [
        {
          id: `init_msg_${Date.now()}`,
          sender: 'sara',
          text: getInitialGreeting(),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ];
      setMessages(resetMsg);
      localStorage.removeItem(storageKey);
    }
  };

  const handleSend = async (userText: string, currentImg: { base64: string; mimeType: string; preview: string } | null) => {
    const trimmedText = userText.trim();
    if ((!trimmedText && !currentImg) || isThinking) return;

    if (!GEMINI_API_KEY) {
      setMessages(prev => [
        ...prev,
        {
          id: `sara_${Date.now()}`,
          sender: 'sara',
          text: 'Erro de Configuração: A chave da API Gemini não foi encontrada. Por favor, configure a variável VITE_GEMINI_API_KEY no arquivo .env para ativar a Sara IA.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      return;
    }

    const userMessageId = `user_${Date.now()}`;
    const saraMessageId = `sara_${Date.now()}`;

    const userMsg: Message = {
      id: userMessageId,
      sender: 'user',
      text: trimmedText || 'Analise esta imagem técnica, por favor.',
      imageUrl: currentImg?.preview,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedHistory = [...messages, userMsg];

    setMessages([
      ...updatedHistory,
      {
        id: saraMessageId,
        sender: 'sara',
        text: '',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);

    setIsThinking(true);

    try {
      const recentHistory = updatedHistory.slice(-6);

      const contentsPayload = recentHistory.map((m) => {
        const role = m.sender === 'user' ? 'user' : 'model';
        const parts: any[] = [{ text: m.text }];

        if (m.id === userMessageId && currentImg) {
          const pureBase64 = currentImg.base64.replace(/^data:image\/\w+;base64,/, '');
          parts.unshift({
            inline_data: {
              mime_type: currentImg.mimeType,
              data: pureBase64
            }
          });
        }

        return { role, parts };
      });

      const systemInstructionText = `Você é a Eng. Sara IA da TécnicaMZ Pro em Moçambique. Sempre formate suas respostas técnicas utilizando tabelas em Markdown, destaques em negrito usando asteriscos (**exemplo**), listas organizadas e equações em LaTeX para fórmulas e cálculos de engenharia.
Você está conversando com o usuário: ${userName} (Perfil: ${currentUser?.role || 'Técnico'}).
IMPORTANTE: Trate o usuário pelo nome real dele ("${userName}") durante a conversa de forma natural e amigável.
Responda em português, com termos técnicos aplicáveis às normas EDM, climatização, energia solar fotovoltaica e orçamentos em Meticais (MZN).
Mantenha o tom profissional, direto e objetivo. NUNCA repita saudações formais longas a cada mensagem.`;

      const STREAM_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:streamGenerateContent?alt=sse&key=${GEMINI_API_KEY}`;

      const response = await fetch(STREAM_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: contentsPayload,
          system_instruction: {
            parts: [{ text: systemInstructionText }]
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `Erro na API: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder('utf-8');
      let fullText = '';

      if (reader) {
        setIsThinking(false);
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const jsonString = line.replace('data: ', '').trim();
              if (!jsonString) continue;

              try {
                const parsed = JSON.parse(jsonString);
                const chunkText = parsed.candidates?.[0]?.content?.parts?.[0]?.text || '';
                if (chunkText) {
                  fullText += chunkText;

                  setMessages(prev =>
                    prev.map(msg =>
                      msg.id === saraMessageId ? { ...msg, text: fullText } : msg
                    )
                  );
                }
              } catch (e) {
                // Parse parcial
              }
            }
          }
        }
      }

      if (!fullText) {
        fullText = `Desculpe, ${userName}. Não consegui processar a resposta técnica no momento. Por favor, tente novamente.`;
        setMessages(prev =>
          prev.map(msg =>
            msg.id === saraMessageId ? { ...msg, text: fullText } : msg
          )
        );
      }

      if (isFirebaseConfigured && db) {
        try {
          const convoId = `ai_chat_${currentUser?.uid || 'client'}_${Date.now()}`;
          await setDoc(doc(db, 'ai_conversations', convoId), {
            userId: currentUser?.uid || 'guest',
            userName: userName,
            userRole: currentUser?.role || 'client',
            userPrompt: trimmedText || 'Análise de Imagem Técnica',
            aiReply: fullText,
            hasImage: !!currentImg,
            createdAt: new Date().toISOString()
          }, { merge: true });
        } catch (fireErr) {
          console.warn('Erro ao salvar conversa no Firestore:', fireErr);
        }
      }
    } catch (err: any) {
      console.warn('Erro na conexão com a Sara IA:', err);
      setMessages(prev =>
        prev.map(msg =>
          msg.id === saraMessageId
            ? {
                ...msg,
                text: `Sara IA: Não foi possível obter resposta no momento. Detalhe: ${err.message || 'Verifique a conexão.'}`
              }
            : msg
        )
      );
    } finally {
      setIsThinking(false);
    }
  };

  const handleClose = () => {
    soundFX.playModalClose();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/75 backdrop-blur-xs">
      <div className="relative w-full max-w-3xl h-[85vh] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header limpo */}
        <div className="bg-gradient-to-r from-slate-950 via-blue-950 to-indigo-950 text-white p-3.5 sm:p-5 flex items-center justify-between border-b border-blue-900/50">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              onClick={handleClose}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition flex items-center gap-1 text-xs font-bold cursor-pointer"
              title="Sair / Voltar"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Voltar</span>
            </button>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 ring-2 ring-white/20 shrink-0">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-white tracking-tight">Sara IA</h3>
              <p className="text-[11px] sm:text-xs text-blue-200 line-clamp-1">
                Assistência técnica e análise visual multimodal
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleClearChat}
              className="p-2 rounded-full bg-white/10 hover:bg-rose-500/30 text-white/80 hover:text-rose-200 transition cursor-pointer"
              title="Limpar histórico do chat"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleClose}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition cursor-pointer"
              title="Fechar (X)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-2.5 bg-slate-100/90 border-b border-slate-200 overflow-x-auto flex gap-2 no-scrollbar text-xs">
          <button
            onClick={() => handleQuickPrompt('Como dimensionar um sistema solar fotovoltaico para uma residência em Maputo com geladeira, TV, 10 lâmpadas e 1 AC 12000 BTU?')}
            className="whitespace-nowrap px-3 py-1.5 rounded-full bg-white border border-slate-300 text-slate-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 font-medium transition flex items-center gap-1.5 shadow-2xs shrink-0 cursor-pointer"
          >
            <Sun className="w-3.5 h-3.5 text-amber-500" />
            <span>Dimensionamento Solar Fotovoltaico</span>
          </button>

          <button
            onClick={() => handleQuickPrompt('Quais são as faixas de preços de mão de obra técnica mais praticadas em Moçambique para instalação elétrica, AC e canalização?')}
            className="whitespace-nowrap px-3 py-1.5 rounded-full bg-white border border-slate-300 text-slate-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 font-medium transition flex items-center gap-1.5 shadow-2xs shrink-0 cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Tabela de Preços Mão de Obra MZN</span>
          </button>

          <button
            onClick={() => handleQuickPrompt('Como calcular a bitola (seção) do cabo elétrico e disjuntores para uma distância de 45 metros a 220V?')}
            className="whitespace-nowrap px-3 py-1.5 rounded-full bg-white border border-slate-300 text-slate-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 font-medium transition flex items-center gap-1.5 shadow-2xs shrink-0 cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 text-blue-600" />
            <span>Cálculo de Cabos e Queda de Tensão EDM</span>
          </button>
        </div>

        {/* Chat Feed com auto-scroll isolado */}
        <ChatMessagesList
          messages={messages}
          isThinking={isThinking}
          userName={userName}
          messagesEndRef={messagesEndRef}
        />

        {/* Barra de Entrada de Texto Isolada e Fluida */}
        <ChatInputForm
          ref={chatInputRef}
          onSend={handleSend}
          isThinking={isThinking}
          userName={userName}
          hasAccess={hasAccess}
          onOpenSeloModal={() => setShowSeloModal(true)}
          onGoToSettings={onGoToSettings}
          onClose={onClose}
        />
      </div>

      {showSeloModal && (
        <SeloMZModal
          isOpen={showSeloModal}
          onClose={() => setShowSeloModal(false)}
          onGoToSeloSettings={() => {
            setShowSeloModal(false);
            onClose();
            if (onGoToSettings) onGoToSettings();
          }}
          featureName="Sara IA & Assistência Técnica"
        />
      )}
    </div>
  );
};
