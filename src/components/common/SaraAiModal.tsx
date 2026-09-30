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
const STATIC_FALLBACK_KEY = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.GEMINI_API_KEY : '';

const resolveGeminiKey = (): string => {
  if (STATIC_VITE_KEY && typeof STATIC_VITE_KEY === 'string') {
    return STATIC_VITE_KEY.replace(/["';\s]/g, '').trim();
  }
  if (STATIC_FALLBACK_KEY && typeof STATIC_FALLBACK_KEY === 'string') {
    return STATIC_FALLBACK_KEY.replace(/["';\s]/g, '').trim();
  }
  try {
    const proc = (globalThis as any)?.process?.env;
    if (proc?.VITE_GEMINI_API_KEY) return String(proc.VITE_GEMINI_API_KEY).replace(/["';\s]/g, '').trim();
    if (proc?.REACT_APP_GEMINI_API_KEY) return String(proc.REACT_APP_GEMINI_API_KEY).replace(/["';\s]/g, '').trim();
  } catch {}
  try {
    if (typeof localStorage !== 'undefined') {
      const savedKey = localStorage.getItem('VITE_GEMINI_API_KEY') || localStorage.getItem('gemini_api_key');
      if (savedKey) return savedKey.replace(/["';\s]/g, '').trim();
    }
  } catch {}
  return '';
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
              <p className="text-slate-400 text-[10px]">Pronta para leitura visual do diagrama unifilar</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSelectedImage(null)}
            className="p-2 text-rose-400 hover:bg-rose-500/20 rounded-lg transition border border-rose-500/30 cursor-pointer"
            title="Remover anexo"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Input de Comando ou Bloqueio por Selo */}
      {!hasAccess ? (
        <div className="p-4 bg-[#030814] text-white border-t-2 border-[#00F5FF]/30 flex flex-col sm:flex-row items-center justify-between gap-3 w-full">
          <div className="flex items-center gap-3 text-xs text-slate-300">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 shrink-0 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-white font-mono uppercase tracking-wide">Terminal Sara IA Trancado (Selo MZ Requerido)</p>
              <p className="text-[11px] text-slate-400">Ative o seu Selo MZ (50 MT via M-Pesa/e-Mola) para autorizar acesso ao barramento.</p>
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
            className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 via-cyan-600 to-[#00F5FF] hover:opacity-95 text-slate-950 font-black font-mono text-xs flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,245,255,0.4)] transition-all shrink-0 cursor-pointer uppercase tracking-wider"
          >
            <Zap className="w-4 h-4 fill-slate-950" />
            Ativar Selo MZ (50 MT)
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="p-3 sm:p-4 bg-[#030814] border-t-2 border-[#00F5FF]/30 flex items-center gap-2 relative w-full">
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
            title="Câmara Técnica de Campo"
            className="p-2.5 bg-[#051124] hover:bg-[#00F5FF]/20 text-[#00F5FF] rounded-lg transition border border-[#00F5FF]/30 shadow-[0_0_10px_rgba(0,245,255,0.1)] shrink-0 cursor-pointer"
          >
            <Camera className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Importar Esquema / Imagem"
            className="p-2.5 bg-[#051124] hover:bg-[#00F5FF]/20 text-[#00F5FF] rounded-lg transition border border-[#00F5FF]/30 shadow-[0_0_10px_rgba(0,245,255,0.1)] shrink-0 cursor-pointer"
          >
            <ImageIcon className="w-4 h-4" />
          </button>

          <div className="relative flex-1 min-w-0">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#00F5FF]/60 font-mono text-xs font-bold pointer-events-none select-none">
              &gt;
            </span>
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder={`Digite algo ou anexe uma foto, ${userName}...`}
              className="w-full pl-8 pr-4 py-2.5 bg-[#02050E] border-2 border-[#00F5FF]/25 focus:border-[#00F5FF] focus:ring-1 focus:ring-[#00F5FF] focus:shadow-[0_0_15px_rgba(0,245,255,0.25)] text-white placeholder-slate-400 rounded-lg text-xs sm:text-sm outline-none transition font-sans"
            />
          </div>

          <button
            type="submit"
            disabled={(!inputText.trim() && !selectedImage) || isThinking}
            className="p-2.5 bg-gradient-to-r from-[#0077FE] to-[#00F5FF] hover:brightness-110 disabled:opacity-30 disabled:brightness-100 text-slate-950 font-black rounded-lg transition shadow-[0_0_15px_rgba(0,245,255,0.4)] shrink-0 cursor-pointer flex items-center justify-center"
            title="Enviar comando"
          >
            <Send className="w-4 h-4 stroke-[3]" />
          </button>
        </form>
      )}
    </div>
  );
}));

ChatInputForm.displayName = 'ChatInputForm';

export const SaraAiModal: React.FC<SaraAiModalProps> = ({ isOpen, onClose, onGoToSettings }) => {
  const { currentUser, isClient, isTechnician, isAdmin, temSeloMZ, isSubscriptionActive } = useAuth();
  const [showSeloModal, setShowSeloModal] = useState(false);

  const authUser = currentUser as any;
  const roleStr = String(authUser?.role || '');
  const tipoStr = String(authUser?.tipoConta || authUser?.tipo || authUser?.userType || '');

  const isClientUser = Boolean(
    isClient ||
    roleStr === 'cliente' ||
    roleStr === 'client' ||
    tipoStr === 'cliente'
  );

  const isTechnicianUser = Boolean(
    !isClientUser && (
      isTechnician ||
      roleStr === 'technician' ||
      roleStr === 'tecnico' ||
      tipoStr === 'tecnico' ||
      isAdmin
    )
  );

  const hasAccess = Boolean(isAdmin || (isTechnicianUser && (temSeloMZ || authUser?.isSubscriptionActive || isSubscriptionActive)));
  const userName = authUser?.name || 'Técnico';
  const storageKey = `sara_chat_history_${authUser?.uid || 'guest'}`;

  const getInitialGreeting = useCallback(() => {
    return `Olá ${userName}, Sou Eng.Sara IA da TécnicaMZ Pro! Precisa de ajuda?`;
  }, [userName]);

  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed.slice(-10);
      }
    } catch (e) {
      console.warn('Erro ao carregar mensagens locais:', e);
    }
    return [
      {
        id: 'init_msg',
        sender: 'sara',
        text: `Olá, **${userName}**! Sou a **Eng.ª Sara IA**, inteligência de campo da **TécnicaMZ Pro**.\n\nO barramento de cálculo está operando na frequência nominal. Como posso colaborar no seu dimensionamento, diagnóstico de avarias ou orçamento técnico hoje?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
  });

  const [isThinking, setIsThinking] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const chatInputRef = useRef<ChatInputFormHandle | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isThinking, scrollToBottom]);

  const saveMessagesToStorage = useCallback((msgs: Message[]) => {
    try {
      const sanitized = msgs.slice(-10).map(m => {
        if (m.imageUrl && m.imageUrl.startsWith('data:') && m.imageUrl.length > 1000) {
          return { ...m, imageUrl: undefined };
        }
        return m;
      });
      localStorage.setItem(storageKey, JSON.stringify(sanitized));
    } catch (e: any) {
      if (
        e?.name === 'QuotaExceededError' ||
        e?.code === 22 ||
        e?.code === 1014 ||
        e?.number === -2147024882 ||
        String(e).toLowerCase().includes('quota')
      ) {
        try {
          const minimal = msgs.slice(-5).map(m => ({
            id: m.id,
            sender: m.sender,
            text: m.text,
            timestamp: m.timestamp
          }));
          localStorage.setItem(storageKey, JSON.stringify(minimal));
        } catch {}
      }
    }
  }, [storageKey]);

  useBodyScrollLock(isOpen && !isClientUser && isTechnicianUser);

  const DEFAULT_FONT_SIZE = 15;
  const MIN_FONT_SIZE = 12;
  const MAX_FONT_SIZE = 20;

  const [chatFontSize, setChatFontSize] = useState<number>(() => {
    if (typeof localStorage !== 'undefined') {
      try {
        const saved = localStorage.getItem('sara_chat_font_scale');
        if (saved) {
          const parsed = parseInt(saved, 10);
          if (!isNaN(parsed) && parsed >= MIN_FONT_SIZE && parsed <= MAX_FONT_SIZE) {
            return parsed;
          }
        }
      } catch {}
    }
    return DEFAULT_FONT_SIZE;
  });

  const [activeAcademyContext, setActiveAcademyContext] = useState<ActiveAcademyContext | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToAcademyContext((ctx) => {
      setActiveAcademyContext(ctx);
    });
    return unsubscribe;
  }, []);

  const handleDecreaseFontSize = () => {
    setChatFontSize(prev => {
      const next = Math.max(MIN_FONT_SIZE, prev - 1);
      try {
        localStorage.setItem('sara_chat_font_scale', String(next));
      } catch {}
      return next;
    });
  };

  const handleIncreaseFontSize = () => {
    setChatFontSize(prev => {
      const next = Math.min(MAX_FONT_SIZE, prev + 1);
      try {
        localStorage.setItem('sara_chat_font_scale', String(next));
      } catch {}
      return next;
    });
  };

  const [isExpandedWorkbench, setIsExpandedWorkbench] = useState(false);

  const toggleExpandWorkbench = useCallback(async () => {
    soundFX.playClick();
    const nextState = !isExpandedWorkbench;
    setIsExpandedWorkbench(nextState);

    try {
      if (nextState) {
        if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen().catch(() => {});
        }
      } else {
        if (document.fullscreenElement && document.exitFullscreen) {
          await document.exitFullscreen().catch(() => {});
        }
      }
    } catch {}
  }, [isExpandedWorkbench]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isExpandedWorkbench) {
        e.stopPropagation();
        e.preventDefault();
        setIsExpandedWorkbench(false);
        if (document.fullscreenElement && document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        }
      }
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && isExpandedWorkbench) {
        setIsExpandedWorkbench(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [isOpen, isExpandedWorkbench]);

  const handleClose = useCallback(() => {
    soundFX.playModalClose();
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }
    setIsExpandedWorkbench(false);
    onClose();
  }, [onClose]);

  useModalHistory(isOpen && !isClientUser && isTechnicianUser, 'sara_ai', handleClose);

  if (!isOpen || isClientUser || !isTechnicianUser) return null;

  const handleClearChat = () => {
    if (window.confirm('Deseja reiniciar a sessão do terminal Sara IA?')) {
      const resetMsg: Message[] = [
        {
          id: `init_msg_${Date.now()}`,
          sender: 'sara',
          text: getInitialGreeting(),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ];
      setMessages(resetMsg);
      try {
        localStorage.removeItem(storageKey);
      } catch (e) {
        console.warn('Erro ao remover histórico do LocalStorage:', e);
      }
    }
  };

  // Motor de envio com Vite Static Binding e execução idêntica ao Google AI Studio
  const handleSend = async (userText: string, currentImg: { base64: string; mimeType: string; preview: string } | null) => {
    const trimmedText = userText.trim();
    if ((!trimmedText && !currentImg) || isThinking) return;

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

    saveMessagesToStorage(updatedHistory);
    setIsThinking(true);

    try {
      const apiKey = resolveGeminiKey();

      if (!apiKey) {
        throw new Error('A variável VITE_GEMINI_API_KEY não foi carregada pelo Vite. Por favor, reinicie o servidor do projeto no terminal (Ctrl+C e depois "npm run dev") para ler o novo arquivo .env.');
      }

      // ISOLAÇÃO IDÊNTICA AO GOOGLE AI STUDIO:
      // Remove 'init_msg' e avisos anteriores para manter turnos 100% válidos
      const realConversation = updatedHistory.filter(m => {
        if (m.id === 'init_msg' || m.id.startsWith('init_msg_')) return false;
        if (!m.text || !m.text.trim()) return false;
        if (m.text.startsWith('⚠️')) return false;
        return true;
      });

      const contentsPayload: Array<{ role: 'user' | 'model'; parts: any[] }> = [];

      for (const m of realConversation) {
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

        if (contentsPayload.length === 0 && role !== 'user') {
          continue;
        }

        if (contentsPayload.length > 0 && contentsPayload[contentsPayload.length - 1].role === role) {
          contentsPayload[contentsPayload.length - 1].parts[0].text += `\n\n${m.text}`;
        } else {
          contentsPayload.push({ role, parts });
        }
      }

      if (contentsPayload.length === 0 || contentsPayload[contentsPayload.length - 1].role !== 'user') {
        const fallbackParts: any[] = [{ text: trimmedText || 'Analise a imagem técnica.' }];
        if (currentImg) {
          const pureBase64 = currentImg.base64.replace(/^data:image\/\w+;base64,/, '');
          fallbackParts.unshift({
            inline_data: {
              mime_type: currentImg.mimeType,
              data: pureBase64
            }
          });
        }
        contentsPayload.push({ role: 'user', parts: fallbackParts });
      }

      let systemInstructionText = `Você é a Eng. Sara IA da TécnicaMZ Pro em Moçambique. Sempre formate suas respostas técnicas utilizando tabelas em Markdown, destaques em negrito usando asteriscos (**exemplo**), listas organizadas e equações em LaTeX para fórmulas e cálculos de engenharia.
Você está conversando com o usuário: ${userName} (Perfil: ${authUser?.role || 'Técnico'}).
IMPORTANTE: Trate o usuário pelo nome real dele ("${userName}") durante a conversa de forma natural e amigável.
Responda em português, com termos técnicos aplicáveis às normas EDM, climatização, energia solar fotovoltaica e orçamentos em Meticais (MZN).
Mantenha o tom profissional, direto e objetivo. NUNCA repita saudações formais longas a cada mensagem.`;

      if (activeAcademyContext) {
        systemInstructionText += `\n\n[CONTEXTO ACADÊMICO SINCRONIZADO - MINHA ACADEMIA TÉCNICA]:
Curso: ${activeAcademyContext.courseTitle}
Módulo: ${activeAcademyContext.moduleTitle}
Aula / Tópico Ativo: ${activeAcademyContext.lessonTitle} (${activeAcademyContext.lessonCode})
Norma Técnica de Referência: ${activeAcademyContext.norma}

DIRETRIZ PARA DÚVIDAS TÉCNICAS DA AULA:
Se a mensagem for no padrão "Elemento: [nome] | Norma: [código]", explique em detalhes aprofundados com base no nome do elemento e na norma correspondente, estruturando em:
1. Função do Elemento e Princípio de Operação
2. Requisitos Mandatórios e Limites da Norma
3. Procedimento de Ligação / Montagem e Testes de Isolamento/Continuidade
4. Diagnóstico de Falhas Comuns e Cuidados Críticos em Moçambique.`;
      }

      let fullText = '';
      let lastErrorMessage = '';

      const models = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-flash-latest'];

      for (const model of models) {
        if (fullText.trim()) break;

        try {
          const DIRECT_URL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
          const directRes = await fetch(DIRECT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: contentsPayload,
              system_instruction: {
                parts: [{ text: systemInstructionText }]
              },
              generationConfig: {
                temperature: 0.35,
                maxOutputTokens: 2048
              }
            })
          });

          if (directRes.ok) {
            const data = await directRes.json();
            fullText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
            if (fullText.trim()) break;
          } else {
            const errData = await directRes.json().catch(() => ({}));
            lastErrorMessage = errData?.error?.message || `Status HTTP ${directRes.status}`;
            console.warn(`[Sara IA] Falha no modelo ${model}:`, lastErrorMessage);
          }
        } catch (fetchErr: any) {
          lastErrorMessage = fetchErr?.message || 'Falha de conexão com a Google API';
          continue;
        }
      }

      // Contingência via backend proxy se existir
      if (!fullText.trim()) {
        try {
          const proxyRes = await fetch('/api/sara', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: contentsPayload,
              system_instruction: {
                parts: [{ text: systemInstructionText }]
              },
              userName,
              userRole: authUser?.role || 'Técnico'
            })
          });

          if (proxyRes.ok) {
            const proxyData = await proxyRes.json().catch(() => ({}));
            fullText = proxyData.reply || proxyData.candidates?.[0]?.content?.parts?.[0]?.text || '';
          }
        } catch {}
      }

      if (!fullText.trim()) {
        fullText = `⚠️ Erro retornado pela Google API: ${lastErrorMessage || 'Verifique se a sua chave no .env está ativa no Google AI Studio e com cotas disponíveis.'}`;
      }

      const finalSaraMsg: Message = {
        id: saraMessageId,
        sender: 'sara',
        text: fullText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev =>
        prev.map(msg =>
          msg.id === saraMessageId ? finalSaraMsg : msg
        )
      );

      saveMessagesToStorage([...updatedHistory, finalSaraMsg]);

      if (isFirebaseConfigured && db) {
        try {
          const convoId = `ai_chat_${authUser?.uid || 'client'}_${Date.now()}`;
          await setDoc(doc(db, 'ai_conversations', convoId), {
            userId: authUser?.uid || 'guest',
            userName: userName,
            userRole: authUser?.role || 'client',
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
      const errorText = `⚠️ ${err?.message || 'Erro ao carregar chave do .env'}`;

      const finalErrorMsg: Message = {
        id: saraMessageId,
        sender: 'sara',
        text: errorText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev =>
        prev.map(msg =>
          msg.id === saraMessageId ? finalErrorMsg : msg
        )
      );

      saveMessagesToStorage([...updatedHistory, finalErrorMsg]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div
      id="sara_ai_modal_overlay"
      className={`modal-useful-fullscreen-overlay dark-modal !bg-[#020610] overflow-x-hidden ${
        isExpandedWorkbench ? 'sara-workbench-fullscreen' : ''
      }`}
    >
      <style>{CYBER_ELECTRIC_STYLES}</style>

      <div
        id="sara_ai_modal_window"
        className="modal-useful-fullscreen-window cyber-electric-viewport text-slate-100 flex flex-col h-full overflow-x-hidden w-full max-w-full animate-in fade-in duration-200"
      >
        {/* Cabeçalho Terminal HUD Industrial Elétrico */}
        <div className="bg-[#030914] text-white p-3 sm:p-4 flex items-center justify-between border-b-2 border-[#00F5FF]/40 shadow-[0_4px_25px_rgba(0,245,255,0.15)] shrink-0 sticky top-0 z-10 w-full overflow-x-hidden">
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
            <button
              onClick={handleClose}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-[#051429] hover:bg-[#00F5FF]/20 text-[#00F5FF] border border-[#00F5FF]/40 transition flex items-center gap-1.5 text-xs font-mono font-bold cursor-pointer shrink-0"
              title="Sair / Desconectar Terminal"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">SAIR</span>
            </button>

            <div className="relative shrink-0">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg bg-gradient-to-br from-[#051124] to-[#0A254C] border-2 border-[#00F5FF] text-[#00F5FF] flex items-center justify-center shadow-[0_0_20px_rgba(0,245,255,0.4)]">
                <Sparkles className="w-5 h-5 animate-pulse text-[#00F5FF]" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00F5FF] opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#00F5FF]" />
              </span>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-white tracking-wider font-mono uppercase flex items-center gap-1.5 truncate">
                  Sara IA
                  <span className="px-1.5 py-[1px] rounded bg-[#00F5FF] text-slate-950 font-mono text-[10px] font-black tracking-widest shrink-0">
                    PRO
                  </span>
                </h3>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-mono text-cyan-300 truncate">
                <span className="text-[#00F5FF] font-black animate-pulse">⚡ 230V / 50Hz</span>
                <span>•</span>
                <span className="text-slate-400">EDM GRID SYNCHRONIZED</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* BOTÃO BANCADA EXPANDIDA 100% / PAISAGEM */}
            <button
              type="button"
              onClick={toggleExpandWorkbench}
              className={`p-1.5 sm:px-3 sm:py-1.5 rounded-lg border-2 transition-all duration-200 flex items-center gap-1.5 text-xs font-mono font-bold cursor-pointer ${
                isExpandedWorkbench
                  ? 'bg-[#00F5FF] text-slate-950 border-[#00F5FF] shadow-[0_0_18px_#00F5FF]'
                  : 'bg-[#051429] hover:bg-[#00F5FF]/15 text-[#00F5FF] border-[#00F5FF]/40'
              }`}
              title={isExpandedWorkbench ? "Restaurar Tela Normal (ESC)" : "Expandir para Bancada Técnica 100%"}
            >
              {isExpandedWorkbench ? (
                <>
                  <Minimize2 className="w-4 h-4" />
                  <span className="hidden sm:inline">NORMAL</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-4 h-4" />
                  <span className="hidden sm:inline">BANCADA 100%</span>
                </>
              )}
            </button>

            {/* SELETOR DE TAMANHO DA FONTE */}
            <div
              className="flex items-center bg-[#051429] rounded-lg p-0.5 border border-[#00F5FF]/30 text-white"
              title="Ajustar escala de leitura"
            >
              <button
                type="button"
                onClick={handleDecreaseFontSize}
                disabled={chatFontSize <= MIN_FONT_SIZE}
                className="px-2 py-1 rounded text-xs font-mono font-black text-[#00F5FF] hover:bg-[#00F5FF]/20 disabled:opacity-30 transition cursor-pointer"
              >
                A-
              </button>
              <span className="text-[10px] font-mono px-1.5 text-cyan-200 font-bold select-none">
                {chatFontSize}px
              </span>
              <button
                type="button"
                onClick={handleIncreaseFontSize}
                disabled={chatFontSize >= MAX_FONT_SIZE}
                className="px-2 py-1 rounded text-xs font-mono font-black text-[#00F5FF] hover:bg-[#00F5FF]/20 disabled:opacity-30 transition cursor-pointer"
              >
                A+
              </button>
            </div>

            <button
              onClick={handleClearChat}
              className="p-2 rounded-lg bg-[#051429] hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 border border-slate-700 hover:border-rose-500/40 transition cursor-pointer"
              title="Reiniciar Terminal"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            
            <button
              onClick={handleClose}
              className="p-2 rounded-lg bg-[#051429] hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition cursor-pointer"
              title="Fechar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Banner de Contexto Ativo da Academia Técnica */}
        {activeAcademyContext && (
          <div className="px-3 sm:px-4 py-2 bg-gradient-to-r from-[#030914] via-[#081C38] to-[#030914] border-b border-[#00F5FF]/30 flex items-center justify-between gap-2 text-xs shrink-0 shadow-inner w-full overflow-x-hidden">
            <div className="flex items-center gap-2 min-w-0 font-mono">
              <span className="w-2 h-2 rounded-full bg-[#00F5FF] shadow-[0_0_8px_#00F5FF] animate-pulse shrink-0" />
              <span className="text-[10px] uppercase font-black px-1.5 py-0.5 rounded bg-[#00F5FF]/20 text-[#00F5FF] border border-[#00F5FF]/40 shrink-0">
                CIRC_ATIVO
              </span>
              <span className="text-slate-200 font-medium truncate text-[11px] sm:text-xs">
                {activeAcademyContext.lessonTitle} • <span className="text-[#00F5FF] font-bold">{activeAcademyContext.norma}</span>
              </span>
            </div>
            <span className="text-[10px] text-cyan-300/80 font-mono shrink-0 hidden md:inline uppercase">
              {activeAcademyContext.courseTitle}
            </span>
          </div>
        )}

        {/* Minha Academia Técnica IEC / EN */}
        {isTechnicianUser && (
          <div className="w-full shrink-0 overflow-x-hidden">
            <SaraAcademyCard
              currentUser={currentUser}
              onAskSara={(promptText) => {
                chatInputRef.current?.setInputText('');
                chatInputRef.current?.focus();
                scrollToBottom();

                setTimeout(() => {
                  handleSend(promptText, null);
                }, 50);
              }}
            />
          </div>
        )}

        {/* Feed de Mensagens Firme (Sara Ampla / Usuário Compacto) */}
        <ChatMessagesList
          messages={messages}
          isThinking={isThinking}
          userName={userName}
          messagesEndRef={messagesEndRef}
          fontSize={chatFontSize}
        />

        {/* Entrada de Comandos */}
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