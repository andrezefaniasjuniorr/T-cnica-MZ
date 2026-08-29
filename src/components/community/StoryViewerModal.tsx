import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Eye,
  Trash2,
  Phone,
  MessageSquare,
  CheckCircle2,
  Clock,
  Sparkles,
  Users,
  Send,
  AlertCircle
} from 'lucide-react';
import { StoryItem } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

interface StoryViewerModalProps {
  stories: StoryItem[];
  initialIndex: number;
  onClose: () => void;
}

const EMOJI_REACTIONS = ['👍', '🔥', '👏', '💡', '❤️', '🛠️', '⚡'];

export const StoryViewerModal: React.FC<StoryViewerModalProps> = ({
  stories,
  initialIndex,
  onClose
}) => {
  const { currentUser } = useAuth();
  const { viewStory, reactToStory, deleteStory, startOrGetConversation } = useData();

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showViewersDrawer, setShowViewersDrawer] = useState(false);
  const [activeReactionFloating, setActiveReactionFloating] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const currentStory = stories[currentIndex];
  const isAuthor = currentUser?.uid === currentStory?.authorId;

  // Mark current story as viewed when changed
  useEffect(() => {
    if (currentStory && currentUser && !isAuthor) {
      viewStory(currentStory.id);
    }
  }, [currentIndex, currentStory?.id, currentUser?.uid, isAuthor]);

  // Story auto-advance timer (5 seconds)
  const advanceStory = useCallback(() => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setProgress(0);
    } else {
      onClose();
    }
  }, [currentIndex, stories.length, onClose]);

  const prevStory = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setProgress(0);
    }
  }, [currentIndex]);

  useEffect(() => {
    if (isPaused || showViewersDrawer) return;

    const interval = 50; // update every 50ms
    const totalDuration = 5000; // 5s
    const step = (interval / totalDuration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          advanceStory();
          return 0;
        }
        return prev + step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [advanceStory, isPaused, showViewersDrawer]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') advanceStory();
      if (e.key === 'ArrowLeft') prevStory();
      if (e.key === ' ') setIsPaused((p) => !p);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [advanceStory, prevStory, onClose]);

  if (!currentStory) return null;

  const handleReaction = async (emoji: string) => {
    if (!currentUser) return;
    setActiveReactionFloating(emoji);
    setTimeout(() => setActiveReactionFloating(null), 1500);
    await reactToStory(currentStory.id, emoji);
  };

  const handleDelete = async () => {
    if (!window.confirm('Tem certeza que deseja apagar esta história do Mural?')) return;
    setIsDeleting(true);
    try {
      await deleteStory(currentStory.id);
      if (stories.length > 1) {
        if (currentIndex >= stories.length - 1) {
          setCurrentIndex(Math.max(0, stories.length - 2));
        }
      } else {
        onClose();
      }
    } finally {
      setIsDeleting(false);
    }
  };

  // Calculate remaining hours
  const calculateRemainingHours = (expiresAt?: string) => {
    if (!expiresAt) return '24h';
    const diff = new Date(expiresAt).getTime() - Date.now();
    const hours = Math.max(0, Math.floor(diff / (1000 * 60 * 60)));
    const minutes = Math.max(0, Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)));
    if (hours > 0) return `${hours}h restantes`;
    return `${minutes}min restantes`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md select-none">
      {/* Mobile/Desktop Container */}
      <div
        className="relative w-full max-w-md h-full sm:h-[88vh] sm:max-h-[820px] bg-slate-950 sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-slate-800"
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {/* Progress Bars */}
        <div className="absolute top-0 inset-x-0 z-30 p-3 sm:p-4 flex items-center gap-1.5 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
          {stories.map((s, idx) => {
            let width = '0%';
            if (idx < currentIndex) width = '100%';
            else if (idx === currentIndex) width = `${progress}%`;

            return (
              <div key={s.id} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-75 ease-linear rounded-full"
                  style={{ width }}
                />
              </div>
            );
          })}
        </div>

        {/* Top Header */}
        <div className="absolute top-6 sm:top-7 inset-x-0 z-30 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative w-10 h-10 rounded-full ring-2 ring-blue-500 overflow-hidden bg-slate-800 shrink-0">
              {currentStory.authorAvatar ? (
                <img
                  src={currentStory.authorAvatar}
                  alt={currentStory.authorName}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white font-bold bg-blue-600 text-sm">
                  {currentStory.authorName.charAt(0)}
                </div>
              )}
            </div>

            <div className="leading-tight">
              <div className="flex items-center space-x-1.5">
                <span className="text-white font-bold text-sm drop-shadow-md line-clamp-1">
                  {currentStory.authorName}
                </span>
                <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
              </div>
              <div className="flex items-center space-x-2 text-xs text-slate-300 drop-shadow">
                <span>{currentStory.authorSpecialty || 'Profissional'}</span>
                <span>•</span>
                <span className="flex items-center space-x-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>{calculateRemainingHours(currentStory.expiresAt)}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {isAuthor && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="p-2 text-white/80 hover:text-rose-400 hover:bg-white/10 rounded-full transition-colors"
                title="Apagar História"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Story Body */}
        <div className="relative flex-1 flex items-center justify-center overflow-hidden">
          {currentStory.imageUrl ? (
            <div className="relative w-full h-full bg-black flex items-center justify-center">
              <img
                src={currentStory.imageUrl}
                alt="História Técnica"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
              {currentStory.text && (
                <div className="absolute bottom-20 inset-x-4 p-4 bg-black/70 backdrop-blur-md rounded-2xl border border-white/10 text-white text-center text-sm sm:text-base font-medium shadow-2xl">
                  {currentStory.text}
                </div>
              )}
            </div>
          ) : (
            <div
              className={`w-full h-full bg-gradient-to-br ${
                currentStory.backgroundColor || 'from-slate-900 via-blue-950 to-slate-950'
              } p-8 flex flex-col items-center justify-center text-center`}
            >
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-6 text-blue-300">
                <Sparkles className="w-6 h-6" />
              </div>
              <p
                className="text-xl sm:text-2xl font-bold leading-relaxed max-w-xs break-words"
                style={{ color: currentStory.textColor || '#ffffff' }}
              >
                {currentStory.text || 'Atualização no TécnicaMZ Pro'}
              </p>
            </div>
          )}

          {/* Left/Right Click Nav Zones */}
          <button
            type="button"
            onClick={prevStory}
            className="absolute left-0 inset-y-0 w-1/3 z-20 opacity-0 cursor-pointer"
            aria-label="História Anterior"
          />
          <button
            type="button"
            onClick={advanceStory}
            className="absolute right-0 inset-y-0 w-1/3 z-20 opacity-0 cursor-pointer"
            aria-label="Próxima História"
          />

          {/* Floating Emoji Animation */}
          {activeReactionFloating && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-40 animate-bounce">
              <span className="text-7xl drop-shadow-2xl">{activeReactionFloating}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="relative z-30 p-4 bg-gradient-to-t from-black via-black/80 to-transparent">
          {isAuthor ? (
            /* Author View: Views Count & Who Viewed Button */
            <div className="flex items-center justify-between bg-slate-900/90 border border-slate-800 p-3 rounded-2xl">
              <button
                type="button"
                onClick={() => setShowViewersDrawer(true)}
                className="flex items-center space-x-2 text-white hover:text-blue-400 font-semibold text-sm transition-colors"
              >
                <Eye className="w-5 h-5 text-blue-400" />
                <span>{currentStory.viewsCount || 0} visualizações</span>
                <span className="text-xs text-slate-400">(Ver quem viu)</span>
              </button>

              {/* Reactions Summary */}
              {currentStory.reactions && currentStory.reactions.length > 0 && (
                <div className="flex items-center -space-x-1">
                  {currentStory.reactions.slice(-4).map((r, i) => (
                    <span
                      key={i}
                      className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs shadow"
                      title={`${r.userName} reagiu com ${r.emoji}`}
                    >
                      {r.emoji}
                    </span>
                  ))}
                  <span className="text-xs font-semibold text-slate-300 ml-1.5">
                    {currentStory.reactions.length}
                  </span>
                </div>
              )}
            </div>
          ) : (
            /* Viewer: Emoji Reactions Bar & Contact */
            <div className="space-y-3">
              {/* Emojis */}
              <div className="flex items-center justify-between gap-1.5 p-2 bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800">
                {EMOJI_REACTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => handleReaction(emoji)}
                    className="w-10 h-10 rounded-xl hover:bg-white/15 flex items-center justify-center text-2xl transition-transform active:scale-125 hover:scale-110"
                    title={`Reagir com ${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              {/* Quick WhatsApp / Message Action */}
              {(currentStory.authorWhatsapp || currentStory.authorPhone) && (
                <div className="flex items-center gap-2">
                  <a
                    href={`https://wa.me/258${(currentStory.authorWhatsapp || currentStory.authorPhone || '').replace(/\D/g, '')}?text=${encodeURIComponent(
                      `Olá ${currentStory.authorName}, vi seu status no TécnicaMZ Pro e gostaria de falar sobre seus serviços técnicos!`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold text-xs flex items-center justify-center space-x-2 transition-colors shadow-lg"
                  >
                    <Phone className="w-4 h-4" />
                    <span>WhatsApp Direto</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      if (currentUser) {
                        const convId = startOrGetConversation(
                          currentStory.authorId,
                          currentStory.authorName,
                          currentStory.authorRole,
                          { type: 'direct', title: `Resposta à História` }
                        );
                        onClose();
                      }
                    }}
                    className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold text-xs flex items-center justify-center space-x-1.5 border border-slate-700 transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Mensagem</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Viewers Drawer (For Author) */}
        {showViewersDrawer && (
          <div className="absolute inset-0 z-50 bg-slate-950 flex flex-col animate-in slide-in-from-bottom duration-200">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-white text-base">
                  Quem Visualizou ({currentStory.viewers?.length || 0})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowViewersDrawer(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 divide-y divide-slate-800/60">
              {(!currentStory.viewers || currentStory.viewers.length === 0) ? (
                <div className="text-center py-12 text-slate-400 space-y-2">
                  <Eye className="w-8 h-8 mx-auto text-slate-600" />
                  <p className="text-sm">Ainda sem visualizações registadas.</p>
                </div>
              ) : (
                currentStory.viewers.map((viewer, idx) => (
                  <div key={idx} className="pt-3 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-white text-sm">
                        {viewer.userAvatar ? (
                          <img
                            src={viewer.userAvatar}
                            alt={viewer.userName}
                            className="w-full h-full rounded-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          viewer.userName.charAt(0)
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{viewer.userName}</p>
                        <p className="text-xs text-slate-400 capitalize">
                          {viewer.userRole === 'technician' ? 'Técnico Pro' : viewer.userRole === 'company' ? 'Empresa' : 'Cliente'}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-slate-500">
                      {new Date(viewer.viewedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
