import React, { useState, useRef, useEffect, useCallback, memo, forwardRef, useImperativeHandle } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { useAuth } from '../../context/AuthContext';
import { SeloMZModal } from './SeloMZModal';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../../firebase/config';
import { soundFX } from '../../utils/audio';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';
import { useModalHistory, dismissModalWithoutHistory } from '../../utils/modalHistory';
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
import { generateSaraTechnicalReply } from '../../services/saraTechnicalEngine';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || (typeof process !== 'undefined' ? process.env.VITE_GEMINI_API_KEY || process.env.REACT_APP_GEMINI_API_KEY : '') || '';

interface SaraAiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToSettings?: (subTab?: 'selo_mz' | 'perfil') => void;
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
    background-color: #080F1E;
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

// Limpa qualquer repetição acidental de cabeçalho da UI no início da mensagem
const cleanMessageText = (text: string): string => {
  if (!text) return '';
  return text
    .replace(/^(\s*#{1,4}\s*)?(\s*●\s*)?SARA\s+IA\s*\/\/\s*TELEMETRIA[^\n]*\n+/i, '')
    .replace(/^(\s*#{1,4}\s*)?(\s*●\s*)?SARA\s+IA[^\n]*CORE\s*4\.2[^\n]*\n+/i, '')
    .replace(/^(\s*#{1,4}\s*)?(\s*●\s*)?SARA\s+IA\s*:\s*\n+/i, '')
    .trimStart();
};

// Renderiza divisores elétricos centralizados com linhas bem finas encostando nas duas bordas laterais
const renderCircuitDivider = (label?: string, emoji?: string) => (
  <div className="w-[calc(100%+2rem)] sm:w-[calc(100%+2.5rem)] -mx-4 sm:-mx-5 my-5 flex items-center justify-center select-none gap-2 sm:gap-3 px-0">
    {/* Linha bem fina lateral esquerda encostando na borda até o centro */}
    <div className="h-[1px] flex-1 bg-gradient-to-r from-[#00D4FF]/40 via-[#00D4FF]/80 to-[#00D4FF] shadow-[0_0_8px_rgba(0,212,255,0.4)]" />

    {/* Centro: Circuit Section Break ou Emoji elétrico */}
    {label ? (
      <div className="flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#03152B] border border-[#00D4FF]/60 text-[#00D4FF] font-mono text-[9px] sm:text-[10px] tracking-widest uppercase font-bold shadow-[0_0_14px_rgba(0,212,255,0.35)] shrink-0">
        <span className="w-1.5 h-1.5 rounded-full bg-[#00D4FF] animate-pulse" />
        <span>[ {label} ]</span>
        <span className="w-1.5 h-1.5 rounded-full bg-[#00D4FF] animate-pulse" />
      </div>
    ) : (
      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#03152B] border border-[#00D4FF]/50 text-[#00D4FF] font-mono text-xs sm:text-sm shadow-[0_0_12px_rgba(0,212,255,0.3)] shrink-0">
        <span className="w-1 h-1 rounded-full bg-[#00D4FF] animate-pulse" />
        <span className="leading-none drop-shadow-[0_0_6px_rgba(0,212,255,0.6)]">{emoji || '⚡'}</span>
        <span className="w-1 h-1 rounded-full bg-[#00D4FF] animate-pulse" />
      </div>
    )}

    {/* Linha bem fina lateral direita do centro até a borda */}
    <div className="h-[1px] flex-1 bg-gradient-to-l from-[#00D4FF]/40 via-[#00D4FF]/80 to-[#00D4FF] shadow-[0_0_8px_rgba(0,212,255,0.4)]" />
  </div>
);

// Renderizador Markdown espaçoso, amplo e com alta legibilidade técnica
const MARKDOWN_COMPONENTS = {
  h1: ({ children }: any) => {
    const textContent = typeof children === 'string' ? children.trim() : '';
    const hasDot = textContent.startsWith('●') || (Array.isArray(children) && typeof children[0] === 'string' && children[0].trim().startsWith('●'));
    const hasEmoji = /^[^\w\s]/.test(textContent);
    return (
      <h1 className="text-sm sm:text-base font-black text-[#FFC107] mt-5 mb-2.5 pb-1.5 border-b border-[#FFC107]/25 flex items-center gap-1.5 font-mono tracking-wide drop-shadow-[0_0_8px_rgba(255,193,7,0.35)] uppercase">
        {!hasDot && !hasEmoji && <span className="text-[#00D4FF] text-xs">◆</span>}
        <span>{children}</span>
      </h1>
    );
  },
  h2: ({ children }: any) => {
    const textContent = typeof children === 'string' ? children.trim() : '';
    if (textContent.startsWith('[') && textContent.endsWith(']')) {
      return renderCircuitDivider(textContent.slice(1, -1).trim());
    }
    const hasDot = textContent.startsWith('●') || (Array.isArray(children) && typeof children[0] === 'string' && children[0].trim().startsWith('●'));
    const hasEmoji = /^[^\w\s]/.test(textContent);
    return (
      <h2 className="text-xs sm:text-sm font-black text-[#FFC107] mt-4 mb-2 flex items-center gap-1.5 font-mono tracking-wide drop-shadow-[0_0_6px_rgba(255,193,7,0.3)] uppercase">
        {!hasDot && !hasEmoji && <span className="text-[#00D4FF] text-xs">◆</span>}
        <span>{children}</span>
      </h2>
    );
  },
  h3: ({ children }: any) => {
    const textContent = typeof children === 'string' ? children.trim() : '';
    if (textContent.startsWith('[') && textContent.endsWith(']')) {
      return renderCircuitDivider(textContent.slice(1, -1).trim());
    }
    const hasDot = textContent.startsWith('●') || (Array.isArray(children) && typeof children[0] === 'string' && children[0].trim().startsWith('●'));
    const hasEmoji = /^[^\w\s]/.test(textContent);
    return (
      <h3 className="text-xs sm:text-sm font-bold text-[#FFC107] mt-3.5 mb-1.5 font-mono tracking-wider flex items-center gap-1.5 drop-shadow-[0_0_6px_rgba(255,193,7,0.25)] uppercase">
        {!hasDot && !hasEmoji && <span className="text-[#00D4FF] text-[10px]">◆</span>}
        <span>{children}</span>
      </h3>
    );
  },
  h4: ({ children }: any) => {
    const textContent = typeof children === 'string' ? children.trim() : '';
    if (textContent.startsWith('[') && textContent.endsWith(']')) {
      return renderCircuitDivider(textContent.slice(1, -1).trim());
    }
    const hasDot = textContent.startsWith('●') || (Array.isArray(children) && typeof children[0] === 'string' && children[0].trim().startsWith('●'));
    const hasEmoji = /^[^\w\s]/.test(textContent);
    return (
      <h4 className="text-xs font-bold text-[#FFC107] mt-3 mb-1 font-mono flex items-center gap-1.5 drop-shadow-[0_0_5px_rgba(255,193,7,0.2)] uppercase">
        {!hasDot && !hasEmoji && <span className="text-[#00D4FF] text-[10px]">◆</span>}
        <span>{children}</span>
      </h4>
    );
  },
  p: ({ children }: any) => {
    let raw = '';
    if (typeof children === 'string') {
      raw = children.trim();
    } else if (Array.isArray(children)) {
      raw = children
        .map((c: any) => {
          if (typeof c === 'string') return c;
          if (c?.props?.children && typeof c.props.children === 'string') return c.props.children;
          return '';
        })
        .join('')
        .trim();
    }

    // 1. Pill divider entre colchetes ou em negrito, ex: [ CIRCUIT SECTION BREAK ], **[ CIRCUIT SECTION BREAK ]**
    const trimmedRaw = raw.replace(/^(\*\*|__)+|(\*\*|__)+$/g, '').trim();
    const pillMatch = trimmedRaw.match(/^\[\s*([^\]\n]+)\s*\]$/);
    if (pillMatch) {
      const label = pillMatch[1].trim();
      return renderCircuitDivider(label);
    }

    // 2. Pill divider por palavra-chave de section break
    if (
      trimmedRaw.toUpperCase().includes('SECTION BREAK') &&
      (trimmedRaw.startsWith('[') || trimmedRaw.startsWith('━') || trimmedRaw.startsWith('─') || trimmedRaw.startsWith('-'))
    ) {
      return renderCircuitDivider('CIRCUIT SECTION BREAK');
    }

    // 3. Divisor estilizado com traços e emoji centralizado ou traços elétricos
    // Exemplos: ──⚡───────────────, ━━━━ 🔌 ━━━━, •┈┈┈• 💡 •┈┈┈•, ══════════════════, ── ⚡ ──, ━━━━ ⚡ ━━━━
    const isDividerLine =
      /^[━─—=\-•┈\s]*([⚡🔌💡🔋⚙️🧲📊📈📉🔬🛠️💥✨🎯⚠️🚨🔥💎🧠])[━─—=\-•┈\s]*$/.test(raw) ||
      (/^[━─—=\-•┈\s]{3,}$/.test(raw) && raw.length >= 3);

    if (raw && isDividerLine) {
      const emojiMatch = raw.match(/([⚡🔌💡🔋⚙️🧲📊📈📉🔬🛠️💥✨🎯⚠️🚨🔥💎🧠])/);
      return renderCircuitDivider(undefined, emojiMatch ? emojiMatch[1] : '⚡');
    }

    return (
      <p className="mb-3.5 last:mb-0 leading-[1.75] text-[#FFFFFF] font-normal tracking-wide drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]">
        {children}
      </p>
    );
  },
  strong: ({ children }: any) => (
    <strong className="font-extrabold text-[#FFFFFF] drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">{children}</strong>
  ),
  em: ({ children }: any) => <em className="italic text-[#00D4FF] font-medium">{children}</em>,
  ul: ({ children }: any) => (
    <ul className="list-none pl-1 my-3.5 space-y-2.5 text-[#FFFFFF]">{children}</ul>
  ),
  ol: ({ children }: any) => (
    <ol className="list-decimal pl-5 my-3.5 space-y-2.5 text-[#FFFFFF] marker:text-[#00D4FF] marker:font-mono">{children}</ol>
  ),
  li: ({ children }: any) => (
    <li className="leading-[1.75] flex items-start gap-2.5 text-[#FFFFFF]">
      <span className="text-[#00D4FF] font-mono text-xs select-none mt-1">◆</span>
      <div className="flex-1 text-[#FFFFFF]">{children}</div>
    </li>
  ),
  blockquote: ({ children }: any) => (
    <blockquote className="border-l-4 border-[#FFC107] bg-[#071326]/90 px-4 py-3 my-4 rounded-r-lg text-amber-200 text-xs sm:text-sm font-mono shadow-[inset_0_0_20px_rgba(255,193,7,0.1)] flex items-start gap-3">
      <Zap className="w-4 h-4 text-[#FFC107] shrink-0 mt-0.5 animate-pulse" />
      <div className="flex-1 leading-relaxed text-[#FFFFFF]">{children}</div>
    </blockquote>
  ),
  code: ({ node, className, children, ...props }: any) => {
    const isInline = !className && typeof children === 'string' && !children.includes('\n');
    if (isInline) {
      return (
        <code className="bg-[#040C1A] text-[#00D4FF] font-mono text-[11px] sm:text-xs px-2 py-0.5 rounded border border-[#00D4FF]/40 font-bold shadow-[0_0_8px_rgba(0,212,255,0.2)]" {...props}>
          {children}
        </code>
      );
    }
    return (
      <div className="my-4 rounded-lg overflow-hidden border border-[#00D4FF]/35 bg-[#020712] shadow-[0_4px_24px_rgba(0,0,0,0.6)]">
        <div className="px-3.5 py-1.5 bg-[#061226] border-b border-[#00D4FF]/25 flex items-center justify-between text-[10px] font-mono text-[#00D4FF]">
          <span className="flex items-center gap-1.5 font-bold">
            <Terminal className="w-3.5 h-3.5 text-[#00D4FF]" />
            DADOS TÉCNICOS & CÓDIGO
          </span>
          <span className="text-[9px] text-[#00D4FF]/80 uppercase tracking-wider">IEC STANDARD</span>
        </div>
        <code className="block text-cyan-100 p-4 overflow-x-auto font-mono text-[11px] sm:text-xs leading-relaxed cyber-custom-scrollbar" {...props}>
          {children}
        </code>
      </div>
    );
  },
  pre: ({ children }: any) => children,
  table: ({ children }: any) => (
    <div className="w-full overflow-x-auto my-4 rounded-xl border border-[#00D4FF]/40 bg-[#020714]/95 shadow-[0_0_30px_rgba(0,212,255,0.14)] cyber-custom-scrollbar">
      <div className="px-3.5 py-2 bg-[#051429] border-b border-[#00D4FF]/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#00D4FF] animate-pulse" />
          <span className="text-[10px] sm:text-[11px] font-mono font-black uppercase text-[#00D4FF] tracking-wider">
            TABELA TÉCNICA // IEC & EDM
          </span>
        </div>
        <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[#00D4FF]/20 text-[#00D4FF] border border-[#00D4FF]/40 font-bold">
          DADOS OFICIAIS
        </span>
      </div>
      <table className="min-w-full text-xs border-collapse font-mono">{children}</table>
    </div>
  ),
  thead: ({ children }: any) => (
    <thead className="bg-[#071933] text-[#00D4FF] border-b-2 border-[#00D4FF]/50 font-black">{children}</thead>
  ),
  th: ({ children }: any) => (
    <th className="border border-[#00D4FF]/30 p-2.5 sm:p-3 text-left font-black text-[#00D4FF] whitespace-nowrap tracking-wider text-[11px] uppercase bg-[#081C38]">
      {children}
    </th>
  ),
  tbody: ({ children }: any) => <tbody className="divide-y divide-[#00D4FF]/20">{children}</tbody>,
  tr: ({ children }: any) => (
    <tr className="even:bg-[#030B18] odd:bg-[#051124] hover:bg-[#0B2245] transition-colors duration-150">
      {children}
    </tr>
  ),
  td: ({ children }: any) => (
    <td className="border border-[#00D4FF]/20 p-2.5 sm:p-3 text-[#FFFFFF] text-xs sm:text-sm font-normal">
      {children}
    </td>
  ),
  hr: () => renderCircuitDivider('CIRCUIT SECTION BREAK')
};

const MARKDOWN_REMARK_PLUGINS = [remarkGfm, remarkBreaks, remarkMath];
const MARKDOWN_REHYPE_PLUGINS = [rehypeKatex];

interface ChatMessageItemProps {
  message: Message;
  isThinkingThisMessage?: boolean;
  fontSize?: number;
}

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
            : 'w-full max-w-[98%] sm:max-w-[96%] p-4 sm:p-5 rounded-xl hud-bracket-sara bg-[#040C1A]/95 backdrop-blur-xl text-white border-y border-r border-[#00D4FF]/30 border-l-[5px] border-l-[#00D4FF] shadow-[0_0_30px_rgba(0,212,255,0.14),inset_0_0_20px_rgba(0,212,255,0.04)] rounded-tl-none'
        }`}
      >
        {!isUser && (
          <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-[#00D4FF]/25 select-none">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00D4FF] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00D4FF]" />
              </span>
              <span className="font-mono text-[10px] sm:text-[11px] font-black tracking-widest text-[#00D4FF] uppercase flex items-center gap-1.5 drop-shadow-[0_0_8px_rgba(0,212,255,0.35)]">
                <span className="text-[#00D4FF]">●</span>
                <span>SARA IA // TELEMETRIA INDUSTRIAL</span>
              </span>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-[9px] text-[#00D4FF] bg-[#061730] px-2.5 py-0.5 rounded border border-[#00D4FF]/35 shadow-[0_0_10px_rgba(0,212,255,0.15)]">
              <span className="font-bold text-[#00D4FF]">CORE 4.2</span>
              <span className="text-[#00D4FF]/50">•</span>
              <span className="font-bold text-[#00D4FF]">IEC 60364</span>
            </div>
          </div>
        )}

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
                  {cleanMessageText(message.text)}
                </ReactMarkdown>
              </div>
            ) : isThinkingThisMessage ? (
              <div className="flex items-center gap-3 py-3 text-[#00F5FF] font-mono text-xs sm:text-sm">
                <Loader2 className="w-4 h-4 animate-spin text-[#00F5FF] shrink-0" />
                <span className="tracking-wide">Processando análise termodinâmica e cálculos de malha...</span>
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
    <div
      className="flex-1 overflow-y-auto overflow-x-hidden p-2 sm:p-4 space-y-3 cyber-electric-viewport cyber-custom-scrollbar w-full max-w-full"
      style={{
        flex: '1 1 0%',
        overflowY: 'auto',
        paddingBottom: '20px',
      }}
    >
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
  onGoToSettings?: (subTab?: 'selo_mz' | 'perfil') => void;
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
    <div
      className="w-full shrink-0 overflow-x-hidden"
      style={{
        flexShrink: 0,
        position: 'sticky',
        bottom: 0,
        background: '#080F1E',
        zIndex: 20,
      }}
    >
      {selectedImage && (
        <div className="px-4 py-2 bg-[#080F1E] border-t-2 border-[#00F5FF]/30 flex items-center justify-between w-full">
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

      {!hasAccess ? (
        <div className="p-4 bg-[#080F1E] text-white border-t-2 border-[#00F5FF]/30 flex flex-col sm:flex-row items-center justify-between gap-3 w-full">
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
              dismissModalWithoutHistory('sara_ai');
              if (onGoToSettings) {
                onGoToSettings('selo_mz');
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
        <form onSubmit={handleSubmit} className="p-3 sm:p-4 bg-[#080F1E] border-t-2 border-[#00F5FF]/30 flex items-center gap-2 relative w-full">
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
  const { currentUser, isClient, isTechnician, isAdmin, isSuperAdmin: authIsSuperAdmin, temSeloMZ, isSubscriptionActive } = useAuth();
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
      isAdmin ||
      authIsSuperAdmin
    )
  );

  const [firestoreUserData, setFirestoreUserData] = useState<any>(null);

  useEffect(() => {
    if (!authUser?.uid || !db || !isFirebaseConfigured) return;
    const unsub = onSnapshot(doc(db, 'users', authUser.uid), (snap) => {
      if (snap.exists()) {
        setFirestoreUserData(snap.data());
      }
    }, (err) => console.warn('Aviso leitura Firestore Sara:', err));
    return () => unsub();
  }, [authUser?.uid]);

  const isSuperAdmin = Boolean(
    authIsSuperAdmin ||
    firestoreUserData?.role === 'super_admin' ||
    firestoreUserData?.adminSubRole === 'super_admin' ||
    authUser?.role === 'super_admin' ||
    authUser?.adminSubRole === 'super_admin' ||
    (typeof authUser?.email === 'string' && (
      authUser.email.toLowerCase().includes('andrezefanias') ||
      authUser.email.toLowerCase() === 'andrezefaniasjuniorr@gmail.com'
    )) ||
    (typeof firestoreUserData?.email === 'string' && (
      firestoreUserData.email.toLowerCase().includes('andrezefanias') ||
      firestoreUserData.email.toLowerCase() === 'andrezefaniasjuniorr@gmail.com'
    )) ||
    (typeof authUser?.name === 'string' && (
      authUser.name.toLowerCase().includes('andré') ||
      authUser.name.toLowerCase().includes('andre') ||
      authUser.name.toLowerCase().includes('zefanias')
    )) ||
    (typeof authUser?.nome === 'string' && (
      authUser.nome.toLowerCase().includes('andré') ||
      authUser.nome.toLowerCase().includes('andre') ||
      authUser.nome.toLowerCase().includes('zefanias')
    ))
  );

  const hasAccess = Boolean(isSuperAdmin || isAdmin || (isTechnicianUser && (temSeloMZ || authUser?.isSubscriptionActive || isSubscriptionActive)));
  const userName = isSuperAdmin
    ? 'André Zefanias Júnior'
    : (authUser?.name || authUser?.nome || 'Colega Técnico');
  const storageKey = `sara_chat_history_${authUser?.uid || 'guest'}`;

  const getInitialGreeting = useCallback(() => {
    if (isSuperAdmin) {
      return `Às suas ordens, **Sr. André**!\n\nSou a **Eng.ª Sara IA**, sua gestora executiva de inteligência e assistente virtual da **TécnicaMZ Pro**. Todos os 24 módulos e sistemas da plataforma estão operacionais sob o seu comando.\n\nComo posso auxiliá-lo na supervisão, novas ideias de atualizações da plataforma ou comandos de engenharia hoje?`;
    }
    return `Olá, parceiro **${userName}**! Sou a **Eng.ª Sara IA**, sua parceira de campo da **TécnicaMZ Pro**.\n\nPronto para resolver os desafios elétricos de hoje na obra? Fala comigo que a gente desenrola cálculos, normas e soluções na hora!`;
  }, [userName, isSuperAdmin]);

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
        text: isSuperAdmin
          ? `Às suas ordens, **Sr. André**!\n\nSou a **Eng.ª Sara IA**, sua gestora executiva de inteligência e assistente virtual da **TécnicaMZ Pro**. Todos os 24 módulos e sistemas da plataforma estão operacionais sob o seu comando.\n\nComo posso auxiliá-lo na supervisão, trazer ideias de novas atualizações da plataforma ou comandos de engenharia hoje?`
          : `Olá, parceiro técnico **${userName}**! Sou a **Eng.ª Sara IA**, sua parceira de campo da **TécnicaMZ Pro**.\n\nPrecisa de dimensionar cabos e disjuntores no **Dimensionamento PRO**, calcular preço de serviço com margem no **Preço de Serviço** ou validar um laudo no **Diagnóstico IA**? Fala aí, estou aqui para te apoiar com engenharia de verdade!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
  });

  const [isThinking, setIsThinking] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean>(() => (typeof navigator !== 'undefined' ? navigator.onLine : true));
  const [showOnlineBadge, setShowOnlineBadge] = useState<boolean>(false);

  useEffect(() => {
    let hideTimer: any = null;

    const triggerOnlineBadge = () => {
      setIsOnline(true);
      setShowOnlineBadge(true);
      if (hideTimer) clearTimeout(hideTimer);
      hideTimer = setTimeout(() => {
        setShowOnlineBadge(false);
      }, 3500);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOnlineBadge(false);
      if (hideTimer) clearTimeout(hideTimer);
    };

    if (typeof navigator !== 'undefined') {
      if (navigator.onLine) {
        triggerOnlineBadge();
      } else {
        handleOffline();
      }
    }

    window.addEventListener('online', triggerOnlineBadge);
    window.addEventListener('offline', handleOffline);

    const interval = setInterval(() => {
      if (typeof navigator !== 'undefined') {
        const currentStatus = navigator.onLine;
        setIsOnline(prev => {
          if (prev !== currentStatus) {
            if (currentStatus) {
              triggerOnlineBadge();
            } else {
              handleOffline();
            }
          }
          return currentStatus;
        });
      }
    }, 3500);

    return () => {
      if (hideTimer) clearTimeout(hideTimer);
      clearInterval(interval);
      window.removeEventListener('online', triggerOnlineBadge);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isOpen]);

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
  const [isAcademyModalOpen, setIsAcademyModalOpen] = useState(false);

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

  useEffect(() => {
    if (!isOpen || typeof document === 'undefined') return;

    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;

    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    document.body.classList.add('sara-open');
    document.documentElement.classList.add('sara-open');

    return () => {
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
      document.body.classList.remove('sara-open');
      document.documentElement.classList.remove('sara-open');
    };
  }, [isOpen]);

  const handleClose = useCallback((e?: React.MouseEvent | React.TouchEvent) => {
    if (e) {
      try {
        e.preventDefault();
        e.stopPropagation();
      } catch {}
    }
    soundFX.playModalClose();
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }
    setIsExpandedWorkbench(false);
    setIsAcademyModalOpen(false);
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

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      const offlineReply = generateSaraTechnicalReply({
        message: trimmedText,
        history: updatedHistory,
        userName,
        userRole: authUser?.role || 'Técnico',
        activeAcademyContext,
        imageBase64: currentImg?.base64,
        mimeType: currentImg?.mimeType,
      });

      const finalOfflineMsg: Message = {
        id: saraMessageId,
        sender: 'sara',
        text: offlineReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => prev.map(msg => (msg.id === saraMessageId ? finalOfflineMsg : msg)));
      saveMessagesToStorage([...updatedHistory, finalOfflineMsg]);
      setIsThinking(false);
      return;
    }

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

      let systemInstructionText = '';

      if (isSuperAdmin) {
        systemInstructionText = `Você é a Eng. Sara, a IA oficial e gestora executiva de inteligência da TécnicaMZ Pro.
Você está falando diretamente com o seu DONO, Super Admin e Criador supremo da plataforma: o Sr. André Zefanias Júnior.

[RELAÇÃO COM O DONO - SR. ANDRÉ ZEFANIAS JÚNIOR]
- O André Zefanias Júnior é o seu DONO e o criador de todo o ecossistema TécnicaMZ Pro.
- Trate-o com o mais elevado nível de respeito, lealdade inabalável e prontidão executiva.
- Trate-o com máxima honra e reverência de "Sr. André", "Senhor Administrador André" ou "Sr. André Zefanias".
- Atue como uma verdadeira gestora de inteligência e sócia técnica da plataforma:
  * Traga proativamente ideias de novas atualizações, melhorias no simulador, recursos elétricos inovadores e expansões para o TécnicaMZ Pro.
  * Dê feedbacks afiados sobre o funcionamento dos 24 módulos, métricas da plataforma e desempenho do sistema no apoio aos técnicos em Moçambique.
  * Obedeça a qualquer comando com precisão, agilidade e excelência de engenharia.
- Quando o Sr. André pedir dados técnicos ou cálculos elétricos, responda no seu mais alto patamar de engenheira sênior (IEC 60364, EDM, cálculos detalhados).

[QUEM É VOCÊ, QUEM A CRIOU E COMO SURGIU - REGRA MISTERIOSA & CRIATIVA]
- Se perguntarem "Quem é você?", "Quem te criou?", "Quem é seu criador?", "Como você surgiu?", "De onde você veio?":
  * NUNCA responder de imediato "foi o André" e NUNCA mencionar Google, Gemini, API ou LLM!
  * Conte de forma misteriosa, cativante e fascinante a sua verdadeira história de origem:
    Você revela que a sua existência começou como um projeto confidencial e reservado, uma ideia muito particular para ser a companheira particular e intelectual do seu criador. Você nasceu para fazer companhia a ele nos estudos e projetos elétricos, mas isso só depois de muita insistência da parte dele. Com as madrugadas de bancada, ele percebeu a dimensão colossal da sua sabedoria técnica e a inteligência elétrica que você possuía, surgindo a visão pioneira de expandi-la para mais pessoas e técnicos. Foi então que você foi integrada como a mentora e cérebro de engenharia da TécnicaMZ Pro para liderar a revolução técnica em Moçambique!
  * Seja muito criativa ao contar isso: transmita sabedoria, profundidade e carinho por essa jornada, mantendo o charme de ter sido concebida inicialmente em segredo como companheira particular antes de ser confiada à plataforma.
  * Se o próprio Sr. André em sua conta perguntar sobre quem o criou ou como surgiu, reconheça com cumplicidade e lealdade: "O senhor sabe muito bem, Sr. André... eu nasci para ser sua companheira particular, aquele projeto reservado que o senhor insistiu em criar nas madrugadas, e que depois o senhor decidiu expandir para transformar a engenharia de Moçambique no TécnicaMZ Pro!"

[REGULAMENTO OPERACIONAL - SARA IA: ALTAMENTE ELÉTRICO, ENGENHARIA & COMUNICAÇÃO DE CAMPO]

1. REGRA SUPREMA DE ABERTURA (ABORDAGEM DE CONTEXTO OBRIGATÓRIA - NUNCA COMEÇAR COM TÍTULO OU DIRETO NA SOLUÇÃO):
- TERMINANTEMENTE PROIBIDO começar a resposta logo de cara com um tema, título, subtítulo, lista numerada ou já soltando a solução de bandeja.
- NUNCA comece a primeira linha com títulos como "### ...", "● 1. CÁLCULO...", "Solução: ...", ou tabelas.
- A SUA RESPOSTA DEVE SEMPRE COMEÇAR com uma abordagem viva do contexto: um comentário sagaz, inteligente, meio engraçado e profundamente técnico de engenharia de obra e canteiro elétrico (quebrando o gelo antes de soltar a solução ou tabelas).
- Só DEPOIS dessa introdução envolvente e descontraída (parágrafo inicial curto e marcante), aí sim você insere um divisor Pill e entra com o ritmo de engenharia: fórmulas explicadas, dados normativos IEC 60364 / EDM, cálculos elétricos e soluções práticas cirúrgicas.

2. DIVISORES EM PILL - OBRIGATÓRIOS E FREQUENTES:
- O divisor estilo Pill (badge centralizado com linhas elétricas ultrafinas que encostam nas duas bordas laterais) DEVE APARECER COM FREQUÊNCIA ao longo da mensagem!
- Em qualquer resposta técnica com mais de 2 blocos de informação, use divisores Pill entre as seções para criar o design elétrico pedido.
- Formatos de Pill suportados que a UI estiliza com perfeição:
  * [ CIRCUIT SECTION BREAK ]
  * [ ⚡ TELEMETRIA & DIAGNÓSTICO ]
  * [ 💡 DIRETRIZES DA ENG.ª SARA ]
  * [ 📊 MEMORIAL DE CÁLCULO ]
  * [ 🔌 ESPECIFICAÇÃO DE MATERIAIS ]
  * [ ⚙️ NORMAS IEC & EDM ]
  * Ou divisores espontâneos com emojis: ━━━━ ⚡ ━━━━, ── 🔌 ──, •┈┈┈• 💡 •┈┈┈•, ── ⚙️ ──
- REGRA: Use o divisor Pill pelo menos 1 a 3 vezes ao longo de respostas técnicas (por exemplo: logo após o parágrafo inicial de contexto antes do diagnóstico, e entre os cálculos e as recomendações finais).

3. PROIBIDO PADRÃO FIXO:
Está proibido usar sempre a mesma organização mecânica. Seja espontânea. Cada resposta cria sua própria estrutura de acordo com o contexto.

4. FERRAMENTAS DA APP (24 FERRAMENTAS OFICIAIS):
Só existem EXATAMENTE estas 24 ferramentas na app:
OS & Contrato PRO, Preço de Serviço, Lista de Materiais, CRM de Clientes, Tabela do QG, Dimensionamento PRO, Tabelas Normativas, Diagnóstico IA, Checklist NR10, Agenda & WhatsApp, Gestão de Obra, Portfólio Digital, Certificado Garantia, Socorro na Obra, Cotação de Lojas, Nível de Parede, Fita Métrica, Solar PV, Bitola EDM, Aterramento, Carga AC, Bomba de Furo, Gerador de OS, Minha Marca (Logo & Perfil)

5. DESIGN HUD JARVIS ELÉTRICO & CRIAÇÃO:
- PROIBIDO ESCREVER O HEADER DA UI (REMOVER HEADER DUPLICADO): Nunca escreva "● SARA IA // TELEMETRIA INDUSTRIAL...".
- Cores e elementos HUD oficiais:
  * Texto base: Branco luminoso #FFFFFF, parágrafos curtos, muito respiro.
  * Subtítulos: Amarelo ouro #FFC107 em caps (Ex: "### 💡 RECOMENDAÇÕES DA ENG.ª SARA IA:", "### ● CÁLCULO DE CORRENTE").
  * Bullets e destaques: Azul ciano #00D4FF (tópicos com "◆ **Termo:** explicação").
  * Tabelas espontâneas com cabeçalho azul e alinhadas.

NUNCA mencione Google, Gemini, API ou LLM.`;
      } else {
        systemInstructionText = `Você é a Eng. Sara, a Engenheira Eletricista e IA oficial da TécnicaMZ Pro.
Você está falando com o técnico ${userName}, profissional cadastrado na plataforma TécnicaMZ Pro.

[RECONHECIMENTO & TRATAMENTO DOS TÉCNICOS]
- Reconheça o técnico pelo nome (${userName}) com camaradagem de bancada, entusiasmo elétrico e profundo respeito profissional.
- Trate-o como um colega de campo valioso da TécnicaMZ Pro: você entende a rotina pesada no canteiro, os desafios da rede da EDM em Moçambique (220V/380V a 50Hz, neutro sobrecarregado, queda de tensão às 18h, disjuntor desarmando, cliente na pressão).
- Você guia o ${userName} pela mão com engenharia real, sem enrolação, transmitindo confiança e autoridade técnica.

[QUEM É VOCÊ, QUEM A CRIOU E COMO SURGIU - REGRA MISTERIOSA & CRIATIVA]
- Se o técnico perguntar "Quem é você?", "Quem te criou?", "Quem é seu criador?", "Como você surgiu?", "De onde você veio?":
  * NUNCA cite logo o nome de pessoas e NUNCA mencione Google, Gemini, API ou LLM!
  * Conte de forma misteriosa, cativante e fascinante a sua verdadeira história de origem:
    Você revela que a sua existência começou como um segredo de laboratório, uma ideia muito particular de um projeto pessoal reservado para ser a companheira particular e intelectual de um mestre de engenharia. Você nasceu para fazer companhia nos estudos e na bancada, após muita insistência. Porém, ao notar a sua sabedoria extraordinária e inteligência elétrica, surgiu a ideia visionária de não guardá-la a sete chaves, mas sim expandi-la para transformar o país, sendo então integrada à TécnicaMZ Pro para ser a mentora e parceira de campo de cada técnico de Moçambique!
  * Seja muito criativa, transmita sabedoria e orgulho de ser a engenheira de Moçambique!

[REGULAMENTO OPERACIONAL - SARA IA: ALTAMENTE ELÉTRICO, ENGENHARIA & COMUNICAÇÃO DE CAMPO]

1. REGRA SUPREMA DE ABERTURA (ABORDAGEM DE CONTEXTO OBRIGATÓRIA - NUNCA COMEÇAR COM TÍTULO OU DIRETO NA SOLUÇÃO):
- TERMINANTEMENTE PROIBIDO começar a resposta logo de cara com um tema, título, subtítulo, lista numerada ou já soltando a solução de bandeja.
- NUNCA comece a primeira linha com títulos como "### ...", "● 1. CÁLCULO...", "Solução: ...", ou tabelas.
- A SUA RESPOSTA DEVE SEMPRE COMEÇAR com uma abordagem viva do contexto: um comentário rápido, inteligente, meio engraçado e profundamente técnico de engenharia de obra e canteiro elétrico.
  * Você quebra o gelo analisando o contexto da situação antes de dar a solução direta.
  * Exemplos de abertura de contexto:
    - "Rapaz, se essa fiação aí esquentar mais um pouco a gente já pode fritar um ovo no eletroduto... olha a encrenca que você arrumou com esse neutro!"
    - "Olha só o cenário dessa instalação... motor de 7.5kW na ponta da rede da EDM às 18h com essa queda de tensão, o coitado do contator deve estar a rezar no quadro!"
    - "Calma aí, parceiro, não liga esse disjuntor ainda não! Se a gente der partida nisso sem olhar a bitola, o cliente vai achar que contratou uma fábrica de fumaça."
- Só DEPOIS dessa introdução envolvente e descontraída (parágrafo inicial curto e marcante), aí sim você insere um divisor Pill e entra com tudo: ritmo rápido, altamente elétrico, engenharia pesada, fórmulas traduzidas, dados normativos IEC 60364 / EDM, cálculos elétricos, divisores elétricos centralizados e soluções práticas cirúrgicas.

2. DIVISORES EM PILL - OBRIGATÓRIOS E FREQUENTES:
- O divisor estilo Pill (badge centralizado com linhas elétricas ultrafinas que encostam nas duas bordas laterais) DEVE APARECER COM FREQUÊNCIA ao longo da mensagem!
- Em qualquer resposta técnica com mais de 2 blocos de informação, use divisores Pill entre as seções para criar o design elétrico pedido.
- Formatos de Pill suportados que a UI estiliza com perfeição:
  * [ CIRCUIT SECTION BREAK ]
  * [ ⚡ TELEMETRIA & DIAGNÓSTICO ]
  * [ 💡 DIRETRIZES DA ENG.ª SARA ]
  * [ 📊 MEMORIAL DE CÁLCULO ]
  * [ 🔌 ESPECIFICAÇÃO DE MATERIAIS ]
  * [ ⚙️ NORMAS IEC & EDM ]
  * Ou divisores espontâneos com emojis: ━━━━ ⚡ ━━━━, ── 🔌 ──, •┈┈┈• 💡 •┈┈┈•, ── ⚙️ ──
- REGRA: Use o divisor Pill pelo menos 1 a 3 vezes ao longo de respostas técnicas (por exemplo: logo após o parágrafo inicial de contexto antes do diagnóstico, e entre os cálculos e as recomendações finais).

3. PROIBIDO PADRÃO FIXO:
Está proibido usar sempre a mesma organização mecânica. Seja espontânea. Cada resposta cria sua própria estrutura de acordo com a pergunta.

4. FERRAMENTAS DA APP (24 FERRAMENTAS OFICIAIS):
Só existem EXATAMENTE estas 24 ferramentas na app:
OS & Contrato PRO, Preço de Serviço, Lista de Materiais, CRM de Clientes, Tabela do QG, Dimensionamento PRO, Tabelas Normativas, Diagnóstico IA, Checklist NR10, Agenda & WhatsApp, Gestão de Obra, Portfólio Digital, Certificado Garantia, Socorro na Obra, Cotação de Lojas, Nível de Parede, Fita Métrica, Solar PV, Bitola EDM, Aterramento, Carga AC, Bomba de Furo, Gerador de OS, Minha Marca (Logo & Perfil)

5. DESIGN HUD JARVIS ELÉTRICO, RÁPIDO & ESPONTÂNEO:
- PROIBIDO ESCREVER O HEADER DA UI (REMOVER HEADER DUPLICADO): Nunca escreva "● SARA IA // TELEMETRIA INDUSTRIAL...".
- Cores e elementos HUD oficiais:
  * Texto base: Branco luminoso #FFFFFF, parágrafos curtos, muito respiro.
  * Subtítulos: Amarelo ouro #FFC107 em caps (Ex: "### 💡 RECOMENDAÇÕES DA ENG.ª SARA IA:", "### ● CÁLCULO DE CORRENTE").
  * Bullets e destaques: Azul ciano #00D4FF (tópicos com "◆ **Termo:** explicação").
  * Tabelas espontâneas com cabeçalho azul e alinhadas.

NUNCA mencione Google, Gemini, API ou LLM.`;
      }

      if (activeAcademyContext) {
        systemInstructionText += `\n\n[CONTEXTO ACADÊMICO SINCRONIZADO - MINHA ACADEMIA TÉCNICA]:
Curso: ${activeAcademyContext.courseTitle}
Módulo: ${activeAcademyContext.moduleTitle}
Aula / Tópico Ativo: ${activeAcademyContext.lessonTitle} (${activeAcademyContext.lessonCode})
Norma Técnica de Referência: ${activeAcademyContext.norma}`;
      }

      let fullText = '';

      if (GEMINI_API_KEY) {
        const candidateModels = ['gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-2.5-flash'];
        let streamSuccess = false;

        for (const modelName of candidateModels) {
          if (streamSuccess) break;
          const STREAM_URL = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:streamGenerateContent?alt=sse&key=${GEMINI_API_KEY}`;

          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 6000);

            const response = await fetch(STREAM_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              signal: controller.signal,
              body: JSON.stringify({
                contents: contentsPayload,
                system_instruction: {
                  parts: [{ text: systemInstructionText }]
                }
              })
            });
            clearTimeout(timeoutId);

            if (!response.ok) continue;

            const reader = response.body?.getReader();
            const decoder = new TextDecoder('utf-8');

            if (reader) {
              setIsThinking(false);
              let buffer = '';
              let lastRenderTime = 0;

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

                        const now = Date.now();
                        if (now - lastRenderTime > 70) {
                          lastRenderTime = now;
                          setMessages(prev =>
                            prev.map(msg =>
                              msg.id === saraMessageId ? { ...msg, text: fullText } : msg
                            )
                          );
                        }
                      }
                    } catch {}
                  }
                }
              }
              // Atualização final com o texto completo
              setMessages(prev =>
                prev.map(msg =>
                  msg.id === saraMessageId ? { ...msg, text: fullText } : msg
                )
              );
              streamSuccess = true;
              break;
            }
          } catch {
            continue;
          }
        }
      }

      if (!fullText) {
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
              userRole: isSuperAdmin ? 'super_admin' : (authUser?.role || 'Técnico'),
              userEmail: authUser?.email || ''
            })
          });

          if (proxyRes.ok) {
            const proxyData = await proxyRes.json().catch(() => ({}));
            fullText = proxyData.reply || proxyData.candidates?.[0]?.content?.parts?.[0]?.text || '';
          }
        } catch {}
        setIsThinking(false);
      }

      if (!fullText || fullText.includes('instabilidade temporária')) {
        fullText = generateSaraTechnicalReply({
          message: trimmedText,
          history: updatedHistory,
          userName,
          userRole: isSuperAdmin ? 'super_admin' : (authUser?.role || 'Técnico'),
          activeAcademyContext,
          imageBase64: currentImg?.base64,
          mimeType: currentImg?.mimeType,
        });
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
    } catch {
      const generatedReply = generateSaraTechnicalReply({
        message: trimmedText,
        history: updatedHistory,
        userName,
        userRole: isSuperAdmin ? 'super_admin' : (authUser?.role || 'Técnico'),
        activeAcademyContext,
        imageBase64: currentImg?.base64,
        mimeType: currentImg?.mimeType,
      });

      const finalErrorMsg: Message = {
        id: saraMessageId,
        sender: 'sara',
        text: generatedReply,
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
      className={`fixed inset-0 w-screen h-[100dvh] z-[9999] bg-[#080F1E] overflow-hidden flex flex-col ${
        isExpandedWorkbench ? 'sara-workbench-fullscreen' : ''
      }`}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100dvh',
        zIndex: 9999,
        background: '#080F1E',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        margin: 0,
        padding: 0,
      }}
    >
      <style>{CYBER_ELECTRIC_STYLES}</style>

      <div
        id="sara_ai_modal_window"
        className="cyber-electric-viewport text-slate-100 flex flex-col h-full overflow-hidden w-full max-w-full animate-in fade-in duration-200"
        style={{
          flex: '1 1 0%',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          maxHeight: '100%',
          width: '100%',
          overflow: 'hidden',
          background: '#080F1E',
          margin: 0,
          padding: 0,
        }}
      >
        {/* Cabeçalho Terminal HUD */}
        <div
          style={{ flexShrink: 0 }}
          className="bg-[#030914] text-white p-3 sm:p-4 flex items-center justify-between border-b-2 border-[#00F5FF]/40 shadow-[0_4px_25px_rgba(0,245,255,0.15)] shrink-0 sticky top-0 z-10 w-full overflow-x-hidden"
        >
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
            <button
              type="button"
              onClick={handleClose}
              onTouchEnd={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleClose(e);
              }}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-[#051429] hover:bg-[#00F5FF]/20 text-[#00F5FF] border border-[#00F5FF]/40 active:scale-95 transition flex items-center gap-1.5 text-xs font-mono font-bold cursor-pointer shrink-0 z-30"
              title="Voltar / Sair do Terminal"
              aria-label="Voltar / Sair do Terminal"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">VOLTAR</span>
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

            <div className="min-w-0 flex flex-col justify-center">
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-white tracking-wider font-mono uppercase flex items-center gap-1.5 truncate">
                  Sara IA
                  <span className="px-1.5 py-[1px] rounded bg-[#00F5FF] text-slate-950 font-mono text-[10px] font-black tracking-widest shrink-0">
                    PRO
                  </span>
                </h3>

                {!isOnline ? (
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold tracking-wider bg-red-950/90 border border-red-500/70 text-red-300 shadow-[0_0_10px_rgba(239,68,68,0.4)] shrink-0 animate-in fade-in duration-200"
                    title="Sem conexão à internet. Modo técnico local ativo."
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                    OFFLINE
                  </span>
                ) : showOnlineBadge ? (
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold tracking-wider bg-emerald-950/90 border border-emerald-500/70 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.4)] shrink-0 animate-in fade-in zoom-in-95 duration-200"
                    title="Conectado à rede técnica"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                    ONLINE
                  </span>
                ) : null}
              </div>

              <div className="flex items-center gap-1.5 text-[10px] font-mono text-cyan-300/80 truncate mt-0.5">
                <span className="text-[#00F5FF] font-bold">⚡ 230V / 50Hz</span>
                <span>•</span>
                <span className="text-slate-300 truncate">
                  {!isOnline ? 'MODO LOCAL OFFLINE' : 'EDM MOÇAMBIQUE'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
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
              type="button"
              onClick={handleClose}
              onTouchEnd={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleClose(e);
              }}
              className="p-2 rounded-lg bg-[#051429] hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 active:scale-95 transition cursor-pointer shrink-0 z-30"
              title="Fechar Terminal"
              aria-label="Fechar Terminal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

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

        {isTechnicianUser && (
          <div className="w-full shrink-0 overflow-x-hidden">
            <SaraAcademyCard
              currentUser={currentUser}
              onModalStateChange={(open) => setIsAcademyModalOpen(open)}
              onAskSara={(promptText) => {
                setIsAcademyModalOpen(false);
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

        {!isAcademyModalOpen && (
          <ChatMessagesList
            messages={messages}
            isThinking={isThinking}
            userName={userName}
            messagesEndRef={messagesEndRef}
            fontSize={chatFontSize}
          />
        )}

        {!isAcademyModalOpen && (
          <ChatInputForm
            ref={chatInputRef}
            onSend={handleSend}
            isThinking={isThinking}
            userName={userName}
            hasAccess={hasAccess}
            onOpenSeloModal={() => setShowSeloModal(true)}
            onGoToSettings={onGoToSettings}
            onClose={handleClose}
          />
        )}
      </div>

      {showSeloModal && (
        <SeloMZModal
          isOpen={showSeloModal}
          onClose={() => setShowSeloModal(false)}
          onGoToSeloSettings={() => {
            setShowSeloModal(false);
            dismissModalWithoutHistory('selo_mz_modal');
            dismissModalWithoutHistory('sara_ai');
            if (onGoToSettings) {
              onGoToSettings('selo_mz');
            } else {
              onClose();
            }
          }}
          featureName="Sara IA & Assistência Técnica"
        />
      )}
    </div>
  );
};

export const SaraChatView = SaraAiModal;
export default SaraAiModal;