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
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';
import { useModalHistory } from '../../utils/modalHistory';
import {
  X,
  ArrowLeft,
  Sparkles,
  Send,
  Camera,
  Image as ImageIcon,
  Loader2,
  Trash2,
  Zap,
  Lock,
  ArrowRight,
  Maximize2,
  Minimize2,
  Cpu,
  Activity,
  Terminal
} from 'lucide-react';
import { SaraAcademyCard } from '../sara/SaraAcademyCard';
import { subscribeToAcademyContext, ActiveAcademyContext } from '../../services/saraAcademyContext';

// Leitura direta estática exigida pelo Vite + supressão de linha vermelha do TypeScript
// @ts-ignore
const STATIC_VITE_KEY = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_GEMINI_API_KEY : '';
// @ts-ignore
const STATIC_BACKUP_KEY = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_GEMINI_API_KEY_BACKUP : '';
// @ts-ignore
const STATIC_FALLBACK_KEY = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.GEMINI_API_KEY : '';

// Pool inteligente de chaves com suporte a chave reserva automática
const resolveGeminiKeyPool = (): string[] => {
  const pool: string[] = [];

  const addKeys = (raw: any) => {
    if (typeof raw === 'string' && raw.trim().length > 10) {
      raw.split(',').forEach(part => {
        const cleaned = part.replace(/["';\s]/g, '').trim();
        if (cleaned.length > 10 && !pool.includes(cleaned)) {
          pool.push(cleaned);
        }
      });
    }
  };

  addKeys(STATIC_VITE_KEY);
  addKeys(STATIC_BACKUP_KEY);
  addKeys(STATIC_FALLBACK_KEY);

  try {
    const metaEnv = (import.meta as any)?.env;
    addKeys(metaEnv?.VITE_GEMINI_API_KEY);
    addKeys(metaEnv?.VITE_GEMINI_API_KEY_BACKUP);
    addKeys(metaEnv?.VITE_GEMINI_BACKUP_KEY);
  } catch {}

  try {
    const proc = (globalThis as any)?.process?.env;
    addKeys(proc?.VITE_GEMINI_API_KEY);
    addKeys(proc?.VITE_GEMINI_API_KEY_BACKUP);
  } catch {}

  try {
    if (typeof localStorage !== 'undefined') {
      addKeys(localStorage.getItem('VITE_GEMINI_API_KEY'));
      addKeys(localStorage.getItem('gemini_api_key'));
    }
  } catch {}

  return pool;
};

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

// Estilos Cyber-Elétricos com bloqueio rígido horizontal e visual espaçoso
const CYBER_ELECTRIC_STYLES = `
  .cyber-electric-viewport {
    background-color: #030712;
    background-image: 
      radial-gradient(circle at 50% 0%, rgba(0, 245, 255, 0.10) 0%, transparent 60%),
      radial-gradient(circle at 100% 100%, rgba(0, 119, 254, 0.06) 0%, transparent 50%),
      linear-gradient(to right, rgba(0, 245, 255, 0.035) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(0, 245, 255, 0.035) 1px, transparent 1px);
    background-size: 100% 100%, 100% 100%, 32px 32px, 32px 32px;
    overflow-x: hidden !important;
  }
  .hud-bracket-sara {
    position: relative;
  }
  .hud-bracket-sara::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    width: 12px;
    height: 12px;
    border-top: 2px solid #00F5FF;
    border-left: 2px solid #00F5FF;
    pointer-events: none;
  }
  .hud-bracket-sara::after {
    content: '';
    position: absolute;
    bottom: -2px;
    right: -2px;
    width: 12px;
    height: 12px;
    border-bottom: 2px solid #00F5FF;
    border-right: 2px solid #00F5FF;
    pointer-events: none;
  }
  .cyber-custom-scrollbar::-webkit-scrollbar {
    width: 5px;
    height: 5px;
  }
  .cyber-custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(3, 7, 18, 0.8);
  }
  .cyber-custom-scrollbar::-webkit-scrollbar-thumb {
    background: #00F5FF55;
    border-radius: 4px;
    box-shadow: 0 0 8px rgba(0, 245, 255, 0.4);
  }
  .katex-display {
    overflow-x: auto !important;
    overflow-y: hidden !important;
    padding: 14px 18px !important;
    margin: 16px 0 !important;
    background: rgba(2, 6, 15, 0.95) !important;
    border: 1px solid rgba(0, 245, 255, 0.35) !important;
    border-left: 4px solid #00F5FF !important;
    border-radius: 8px !important;
    box-shadow: inset 0 0 25px rgba(0, 245, 255, 0.08) !important;
  }
  .katex {
    font-size: 1.1em !important;
    color: #00F5FF !important;
  }
`;

// Renderizador Markdown espaçoso, amplo e com alta legibilidade técnica
const MARKDOWN_COMPONENTS = {
  h1: ({ children }: any) => (
    <h1 className="text-sm sm:text-base font-black text-white mt-5 mb-3 pb-2 border-b border-[#00F5FF]/30 flex items-center gap-2 tracking-wide font-mono uppercase">
      <span className="w-2.5 h-2.5 bg-[#00F5FF] shadow-[0_0_8px_#00F5FF] rounded-none rotate-45 shrink-0" />
      <span className="text-[#00F5FF] tracking-wider">[ETAPA]</span>
      <span>{children}</span>
    </h1>
  ),
  h2: ({ children }: any) => (
    <h2 className="text-xs sm:text-sm font-black text-cyan-200 mt-4 mb-2 flex items-center gap-2 font-mono tracking-wide">
      <span className="text-[#FFB703] font-bold">⚡▸</span> {children}
    </h2>
  ),
  h3: ({ children }: any) => (
    <h3 className="text-xs sm:text-sm font-bold text-[#FFB703] mt-3.5 mb-1.5 uppercase tracking-wider font-mono flex items-center gap-1.5">
      <span className="w-1.5 h-1.5 bg-[#FFB703] rounded-full inline-block" />
      {children}
    </h3>
  ),
  h4: ({ children }: any) => (
    <h4 className="text-xs font-semibold text-cyan-300 mt-3 mb-1 font-mono">{children}</h4>
  ),
  p: ({ children }: any) => (
    <p className="mb-3.5 last:mb-0 leading-[1.75] text-slate-100 font-normal tracking-wide">{children}</p>
  ),
  strong: ({ children }: any) => (
    <strong className="font-extrabold text-white text-[#00F5FF] drop-shadow-[0_0_8px_rgba(0,245,255,0.4)]">{children}</strong>
  ),
  em: ({ children }: any) => <em className="italic text-cyan-200">{children}</em>,
  ul: ({ children }: any) => (
    <ul className="list-none pl-1 my-3.5 space-y-2.5 text-slate-100">{children}</ul>
  ),
  ol: ({ children }: any) => (
    <ol className="list-decimal pl-5 my-3.5 space-y-2.5 text-slate-100 marker:text-[#00F5FF] marker:font-mono">{children}</ol>
  ),
  li: ({ children }: any) => (
    <li className="leading-[1.75] flex items-start gap-2.5">
      <span className="text-[#00F5FF] font-mono text-xs select-none mt-1">◆</span>
      <div className="flex-1">{children}</div>
    </li>
  ),
  blockquote: ({ children }: any) => (
    <blockquote className="border-l-4 border-[#FFB703] bg-[#071326]/90 px-4 py-3 my-4 rounded-r-lg text-amber-200 text-xs sm:text-sm font-mono shadow-[inset_0_0_20px_rgba(255,183,3,0.08)] flex items-start gap-3">
      <Zap className="w-4 h-4 text-[#FFB703] shrink-0 mt-0.5 animate-pulse" />
      <div className="flex-1 leading-relaxed text-slate-100">{children}</div>
    </blockquote>
  ),
  code: ({ node, className, children, ...props }: any) => {
    const isInline = !className && typeof children === 'string' && !children.includes('\n');
    if (isInline) {
      return (
        <code className="bg-[#040C1A] text-[#00F5FF] font-mono text-[11px] sm:text-xs px-2 py-0.5 rounded border border-[#00F5FF]/40 font-semibold shadow-[0_0_8px_rgba(0,245,255,0.15)]" {...props}>
          {children}
        </code>
      );
    }
    return (
      <div className="my-4 rounded-lg overflow-hidden border border-[#00F5FF]/30 bg-[#020712] shadow-[0_4px_24px_rgba(0,0,0,0.6)]">
        <div className="px-3.5 py-1.5 bg-[#061226] border-b border-[#00F5FF]/20 flex items-center justify-between text-[10px] font-mono text-cyan-300">
          <span className="flex items-center gap-1.5 font-bold">
            <Terminal className="w-3.5 h-3.5 text-[#00F5FF]" />
            DADOS TÉCNICOS & CÓDIGO
          </span>
          <span className="text-[9px] text-[#00F5FF]/70 uppercase tracking-wider">IEC STANDARD</span>
        </div>
        <code className="block text-cyan-100 p-4 overflow-x-auto font-mono text-[11px] sm:text-xs leading-relaxed cyber-custom-scrollbar" {...props}>
          {children}
        </code>
      </div>
    );
  },
  pre: ({ children }: any) => children,
  table: ({ children }: any) => (
    <div className="w-full overflow-x-auto my-4 rounded-lg border-2 border-[#00F5FF]/35 bg-[#020714]/95 shadow-[0_0_30px_rgba(0,245,255,0.14)] cyber-custom-scrollbar">
      <div className="px-3.5 py-2 bg-[#051429] border-b border-[#00F5FF]/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#00F5FF] animate-pulse" />
          <span className="text-[10px] sm:text-[11px] font-mono font-black uppercase text-[#00F5FF] tracking-wider">
            MATRIZ TÉCNICA QUANTITATIVA // EDM SPEC
          </span>
        </div>
        <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[#00F5FF]/20 text-[#00F5FF] border border-[#00F5FF]/40 font-bold">
          MZN / IEC
        </span>
      </div>
      <table className="min-w-full text-xs border-collapse font-mono">{children}</table>
    </div>
  ),
  thead: ({ children }: any) => (
    <thead className="bg-[#071933] text-[#00F5FF] border-b-2 border-[#00F5FF]/40 font-black">{children}</thead>
  ),
  th: ({ children }: any) => (
    <th className="border border-[#00F5FF]/20 p-3 text-left font-black text-[#00F5FF] whitespace-nowrap tracking-wider text-[11px] uppercase bg-[#081C38]">
      {children}
    </th>
  ),
  tbody: ({ children }: any) => <tbody className="divide-y divide-[#00F5FF]/15">{children}</tbody>,
  tr: ({ children }: any) => (
    <tr className="even:bg-[#030B18] odd:bg-[#051124] hover:bg-[#0B2245] transition-colors duration-150">
      {children}
    </tr>
  ),
  td: ({ children }: any) => (
    <td className="border border-[#00F5FF]/15 p-3 text-slate-100 text-xs sm:text-sm font-normal">
      {children}
    </td>
  ),
  hr: () => (
    <div className="relative my-5">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-[#00F5FF]/25" />
      </div>
      <div className="relative flex justify-center">
        <span className="bg-[#030712] px-3 font-mono text-[9px] text-[#00F5FF]/70 uppercase tracking-widest border border-[#00F5FF]/20 rounded-full">
          CIRCUIT SECTION BREAK
        </span>
      </div>
    </div>
  )
};

const MARKDOWN_REMARK_PLUGINS = [remarkGfm, remarkBreaks, remarkMath];
const MARKDOWN_REHYPE_PLUGINS = [rehypeKatex];

interface ChatMessageItemProps {
  message: Message;
  isThinkingThisMessage?: boolean;
  fontSize?: number;
}

// Item de Mensagem: Sara Ampla / Usuário Compacto
const ChatMessageItem = memo(function ChatMessageItem({
  message,
  isThinkingThisMessage,
  fontSize = 15
}: ChatMessageItemProps) {
  const isUser = message.sender === 'user';

  return (
    <div className={`w-full flex ${isUser ? 'justify-end' : 'justify-start'} py-1`}>
      <div
        className={`relative transition-all duration-200 ${
          isUser
            ? 'w-fit max-w-[84%] sm:max-w-[72%] p-3.5 sm:p-4 rounded-2xl bg-[#06101E] text-white border border-[#0077FE]/40 shadow-[0_4px_20px_rgba(0,0,0,0.5),inset_0_0_12px_rgba(0,119,254,0.15)] rounded-tr-none'
            : 'w-full max-w-[98%] sm:max-w-[96%] p-4 sm:p-5 rounded-xl hud-bracket-sara bg-[#040C1A]/95 backdrop-blur-xl text-slate-100 border-y border-r border-[#00F5FF]/30 border-l-[5px] border-l-[#00F5FF] shadow-[0_0_30px_rgba(0,245,255,0.12),inset_0_0_20px_rgba(0,245,255,0.04)] rounded-tl-none'
        }`}
      >
        {/* Cabeçalho da Mensagem da Sara IA */}
        {!isUser && (
          <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-[#00F5FF]/20 select-none">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00F5FF] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00F5FF]" />
              </span>
              <span className="font-mono text-[10px] sm:text-[11px] font-black tracking-widest text-[#00F5FF] uppercase">
                SARA IA // TELEMETRIA INDUSTRIAL
              </span>
            </div>
            <div className="flex items-center gap-2 font-mono text-[9px] text-cyan-300/80 bg-[#061730] px-2 py-0.5 rounded border border-[#00F5FF]/25">
              <span>CORE 4.2</span>
              <span>•</span>
              <span className="text-[#FFB703]">IEC 60364</span>
            </div>
          </div>
        )}

        {/* Cabeçalho compacto da Mensagem do Usuário */}
        {isUser && (
          <div className="flex items-center justify-between gap-4 pb-1.5 mb-1.5 border-b border-[#0077FE]/20 select-none font-mono text-[9px] text-cyan-400">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0077FE]" />
              <span>TERMINAL TÉCNICO</span>
            </div>
            <span className="text-slate-400 uppercase tracking-wider bg-[#08182E] px-1.5 py-0.2 rounded border border-blue-500/20 text-[8px]">
              SOLICITAÇÃO
            </span>
          </div>
        )}

        {message.imageUrl && (
          <div className="relative rounded-lg overflow-hidden border-2 border-[#00F5FF]/40 max-h-64 bg-[#02050E] flex items-center justify-center p-1.5 my-2 shadow-inner">
            <img
              src={message.imageUrl}
              alt="Upload técnico"
              className="max-h-60 object-contain rounded"
              referrerPolicy="no-referrer"
            />
            <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 font-mono text-[9px] text-[#00F5FF] border border-[#00F5FF]/40">
              OPTICAL_INPUT // OK
            </div>
          </div>
        )}

        {isUser ? (
          <div
            className="whitespace-pre-wrap font-sans text-slate-100 tracking-wide text-xs sm:text-sm"
            style={{ fontSize: `${fontSize}px`, lineHeight: 1.6 }}
          >
            {message.text}
          </div>
        ) : (
          <div className="text-slate-100">
            {message.text ? (
              <div
                className="sara-markdown max-w-none text-slate-100"
                style={{ fontSize: `${fontSize}px`, lineHeight: 1.75 }}
              >
                <ReactMarkdown
                  remarkPlugins={MARKDOWN_REMARK_PLUGINS}
                  rehypePlugins={MARKDOWN_REHYPE_PLUGINS}
                  components={MARKDOWN_COMPONENTS}
                >
                  {message.text}
                </ReactMarkdown>
              </div>
            ) : isThinkingThisMessage ? (
              <div className="flex items-center gap-3 py-3 text-[#00F5FF] font-mono text-xs sm:text-sm">
                <Loader2 className="w-4 h-4 animate-spin text-[#00F5FF] shrink-0" />
                <span className="tracking-wide">Processando cálculo técnico e parecer de engenharia...</span>
              </div>
            ) : null}
          </div>
        )}

        <div className={`flex items-center ${isUser ? 'justify-end' : 'justify-between'} text-[9px] font-mono text-cyan-400/60 pt-1.5 mt-1 border-t border-[#00F5FF]/10`}>
          {!isUser && (
            <span className="tracking-tight text-[#00F5FF]/60 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-[#00F5FF] rounded-full shadow-[0_0_6px_#00F5FF]" />
              SINAL ESTÁVEL
            </span>
          )}
          <span>{message.timestamp}</span>
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
    prev.isThinkingThisMessage === next.isThinkingThisMessage &&
    prev.fontSize === next.fontSize
  );
});

ChatMessageItem.displayName = 'ChatMessageItem';

interface ChatMessagesListProps {
  messages: Message[];
  isThinking: boolean;
  userName: string;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  fontSize: number;
}

const ChatMessagesList = memo(function ChatMessagesList({
  messages,
  isThinking,
  messagesEndRef,
  fontSize
}: ChatMessagesListProps) {
  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 sm:p-4 space-y-3 cyber-electric-viewport cyber-custom-scrollbar w-full max-w-full">
      {messages.map((m, idx) => {
        const isLastSara = m.sender === 'sara' && idx === messages.length - 1;
        return (
          <ChatMessageItem
            key={m.id}
            message={m}
            isThinkingThisMessage={isLastSara && isThinking && !m.text}
            fontSize={fontSize}
          />
        );
      })}

      <div ref={messagesEndRef} />
    </div>
  );
});

ChatMessagesList.displayName = 'ChatMessagesList';

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
    <div className="w-full shrink-0 overflow-x-hidden">
      {/* Imagem Técnica Anexada */}
      {selectedImage && (
        <div className="px-4 py-2 bg-[#020610] border-t-2 border-[#00F5FF]/30 flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={selectedImage.preview}
                alt="Prévia"
                className="w-12 h-12 object-cover rounded-lg border-2 border-[#00F5FF] shadow-[0_0_10px_rgba(0,245,255,0.3)]"
              />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#00F5FF] rounded-full" />
            </div>
            <div className="text-xs font-mono">
              <p className="font-bold text-[#00F5FF] uppercase tracking-wide">Diagrama / Foto Anexada</p>
              <p className="text-slate-400 text-[10px]">Pronta para leitura visual do diagrama unifi