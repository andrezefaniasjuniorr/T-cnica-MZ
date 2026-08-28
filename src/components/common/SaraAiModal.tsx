import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { CheckoutModal } from '../subscription/CheckoutModal';
import {
  X,
  ArrowLeft,
  Sparkles,
  Send,
  Bot,
  User,
  Camera,
  Image as ImageIcon,
  Loader2,
  Trash2,
  HelpCircle,
  Zap,
  Sun,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  Lock,
  ArrowRight
} from 'lucide-react';

interface SaraAiModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  sender: 'sara' | 'user';
  text: string;
  imageUrl?: string;
  timestamp: string;
}

export const SaraAiModal: React.FC<SaraAiModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, isTechnician, isCompany, isAdmin, canAccessSaraAi, activePlanTier } = useAuth();
  const { plans } = useData();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const getInitialGreeting = () => {
    if (!canAccessSaraAi) {
      return `Olá! Sou a Sara IA, a inteligência técnica oficial da TécnicaMZ. O seu plano atual (Pacote Básico) não tem acesso incluído à Sara IA. Faça upgrade para o Pacote Profissional (199 MT) ou Empresa VIP (499 MT) para desbloquear dimensionamento solar, esquemas elétricos EDM, ar condicionado e análise por foto!`;
    }
    if (isCompany) {
      return `Olá! Sou a Sara IA, assistente de engenharia e recrutamento da TécnicaMZ. Posso ajudar a sua empresa a elaborar descrições de vagas técnicas, analisar perfis de candidatos ou estimar custos de contratação técnica em Moçambique. Como posso ajudar hoje?`;
    }
    if (isTechnician) {
      return `Olá colega técnico! Sou a Sara IA da TécnicaMZ. Posso auxiliar com dimensionamento solar fotovoltaico, tabelas de cabos e disjuntores da EDM, códigos de erro de ar condicionado ou analisar fotos de placas, esquemas e quadros elétricos pela câmara ou galeria. O que você gostaria de calcular ou analisar?`;
    }
    if (isAdmin) {
      return `Olá Administrador! Sou a Sara IA. Estou pronta para auxiliar na auditoria de comprovativos M-Pesa / e-Mola, conformidade de NUITs e relatórios de métricas do sistema.`;
    }
    return `Olá! Sou a Sara IA, assistente inteligente da TécnicaMZ. Posso ajudar você a entender que tipo de profissional técnico contratar (eletricidade, climatização, energia solar, canalização, CCTV), tirar dúvidas sobre normas moçambicanas e estimar orçamentos médios em Meticais (MZN). Como posso ajudar?`;
  };

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init_msg',
      sender: 'sara',
      text: getInitialGreeting(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<{ base64: string; mimeType: string; preview: string } | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

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
  };

  const handleQuickPrompt = (prompt: string) => {
    setInputText(prompt);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputText.trim() && !selectedImage) || isThinking) return;

    const userText = inputText.trim();
    const currentImg = selectedImage;

    setInputText('');
    setSelectedImage(null);

    const userMessageId = `user_${Date.now()}`;
    const userMsg: Message = {
      id: userMessageId,
      sender: 'user',
      text: userText || 'Analise esta imagem técnica, por favor.',
      imageUrl: currentImg?.preview,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);
    setIsThinking(true);

    try {
      if (currentImg) {
        // Multi-modal Vision call to Gemini via server API
        const response = await fetch('/api/sara/analyze-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: currentImg.base64,
            mimeType: currentImg.mimeType,
            prompt: userText,
            userRole: currentUser?.role || 'client'
          })
        });

        const data = await response.json();
        const replyText = data.analysis || data.fallback || 'Análise da foto técnica concluída.';

        setMessages(prev => [
          ...prev,
          {
            id: `sara_${Date.now()}`,
            sender: 'sara',
            text: replyText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      } else {
        // Text chat call to Gemini via server API
        const response = await fetch('/api/sara/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: userText,
            history: messages.slice(-8),
            userRole: currentUser?.role || 'client',
            userName: currentUser?.name || 'Usuário'
          })
        });

        const data = await response.json();
        const replyText = data.reply || data.fallback || 'Resposta processada.';

        setMessages(prev => [
          ...prev,
          {
            id: `sara_${Date.now()}`,
            sender: 'sara',
            text: replyText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    } catch (err: any) {
      console.warn('Sara IA connection error:', err);
      // Resilient fallback explanation
      setMessages(prev => [
        ...prev,
        {
          id: `sara_${Date.now()}`,
          sender: 'sara',
          text: `Sara IA (Resposta Técnica de Apoio): Para dimensionamentos em Moçambique, siga sempre as recomendações da norma EDM e verifique aterramentos inferiores a 10 Ohms e disjuntores de curva C para motores e compressores. Como posso detalhar o seu cálculo?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/75 backdrop-blur-xs">
      <div className="relative w-full max-w-3xl h-[85vh] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-950 via-blue-950 to-indigo-950 text-white p-3.5 sm:p-5 flex items-center justify-between border-b border-blue-900/50">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              onClick={onClose}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition flex items-center gap-1 text-xs font-bold"
              title="Sair / Voltar"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Voltar</span>
            </button>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 ring-2 ring-white/20 shrink-0">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-white tracking-tight">Sara IA</h3>
                <span className="text-[9px] sm:text-[10px] font-bold bg-amber-400 text-amber-950 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Gemini 2.5 • Engenharia MZ
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-blue-200 line-clamp-1">
                Assistência técnica e análise visual multimodal para Moçambique
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition"
            title="Fechar (X)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-2.5 bg-slate-100/90 border-b border-slate-200 overflow-x-auto flex gap-2 no-scrollbar text-xs">
          <button
            onClick={() => handleQuickPrompt('Como dimensionar um sistema solar fotovoltaico para uma residência em Maputo com geladeira, TV, 10 lâmpadas e 1 AC 12000 BTU?')}
            className="whitespace-nowrap px-3 py-1.5 rounded-full bg-white border border-slate-300 text-slate-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 font-medium transition flex items-center gap-1.5 shadow-2xs shrink-0"
          >
            <Sun className="w-3.5 h-3.5 text-amber-500" />
            <span>Dimensionamento Solar Fotovoltaico</span>
          </button>

          <button
            onClick={() => handleQuickPrompt('Quais são as faixas de preços de mão de obra técnica mais praticadas em Moçambique para instalação elétrica, AC e canalização?')}
            className="whitespace-nowrap px-3 py-1.5 rounded-full bg-white border border-slate-300 text-slate-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 font-medium transition flex items-center gap-1.5 shadow-2xs shrink-0"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Tabela de Preços Mão de Obra MZN</span>
          </button>

          <button
            onClick={() => handleQuickPrompt('Como calcular a bitola (seção) do cabo elétrico e disjuntor para uma distância de 45 metros a 220V?')}
            className="whitespace-nowrap px-3 py-1.5 rounded-full bg-white border border-slate-300 text-slate-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 font-medium transition flex items-center gap-1.5 shadow-2xs shrink-0"
          >
            <Zap className="w-3.5 h-3.5 text-blue-600" />
            <span>Cálculo de Cabos e Queda de Tensão EDM</span>
          </button>
        </div>

        {/* Chat Feed */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'sara' && (
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xs shrink-0 shadow-sm">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              
              <div
                className={`max-w-[85%] sm:max-w-[80%] p-4 rounded-2xl text-xs sm:text-sm space-y-2 shadow-xs ${
                  m.sender === 'user'
                    ? 'bg-slate-900 text-white rounded-br-none'
                    : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-none'
                }`}
              >
                {m.imageUrl && (
                  <div className="rounded-xl overflow-hidden border border-slate-300/40 max-h-52 bg-slate-950 flex items-center justify-center">
                    <img
                      src={m.imageUrl}
                      alt="Upload técnico"
                      className="max-h-52 object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
                <div className="leading-relaxed whitespace-pre-wrap font-normal">
                  {m.text}
                </div>
                <div className={`text-[10px] text-right ${m.sender === 'user' ? 'text-slate-400' : 'text-slate-400'}`}>
                  {m.timestamp}
                </div>
              </div>
            </div>
          ))}

          {isThinking && (
            <div className="flex items-center gap-3 p-3.5 bg-white border border-slate-200 rounded-2xl shadow-xs text-xs text-slate-600 max-w-sm">
              <Loader2 className="w-4 h-4 text-blue-600 animate-spin shrink-0" />
              <span>Sara IA está a processar o raciocínio técnico...</span>
            </div>
          )}
        </div>

        {/* Image Preview before send */}
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
              onClick={() => setSelectedImage(null)}
              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Input Form or Locked Banner */}
        {!canAccessSaraAi ? (
          <div className="p-4 bg-slate-900 text-white border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-xs text-slate-300">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-white">Sara IA Bloqueada no Pacote Básico (50 MT)</p>
                <p className="text-[11px] text-slate-400">Faça upgrade para o Pacote Profissional (199 MT) para desbloquear.</p>
              </div>
            </div>
            <button
              id="btn_upgrade_sara_ai"
              type="button"
              onClick={() => setShowUpgradeModal(true)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/30 transition-all shrink-0"
            >
              <Zap className="w-3.5 h-3.5" />
              Upgrade Profissional (199 MT)
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <form onSubmit={handleSend} className="p-3 sm:p-4 bg-white border-t border-slate-200 flex items-center gap-2">
            {/* Hidden inputs for camera and gallery */}
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

            {/* Camera Button */}
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              title="Tirar foto com a câmara"
              className="p-2.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 rounded-xl transition border border-slate-200 shrink-0"
            >
              <Camera className="w-4 h-4" />
            </button>

            {/* Gallery Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Anexar imagem da galeria"
              className="p-2.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 rounded-xl transition border border-slate-200 shrink-0"
            >
              <ImageIcon className="w-4 h-4" />
            </button>

            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="Pergunte à Sara IA ou envie uma foto de circuito, placa ou equipamento..."
              className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            />

            <button
              type="submit"
              disabled={(!inputText.trim() && !selectedImage) || isThinking}
              className="p-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl transition shadow-xs shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>

      {/* Upgrade Checkout Modal */}
      {showUpgradeModal && (
        <CheckoutModal
          plan={plans.find(p => p.id === 'plano_profissional') || {
            id: 'plano_profissional',
            name: 'Pacote Profissional',
            priceMZN: 199,
            durationDays: 30,
            active: true,
            priority: 2,
            benefits: ['Sara IA Ilimitada', 'Gerador de OS em PDF', 'Selo Técnico Verificado']
          }}
          onClose={() => setShowUpgradeModal(false)}
          onSuccess={() => setShowUpgradeModal(false)}
        />
      )}
    </div>
  );
};
