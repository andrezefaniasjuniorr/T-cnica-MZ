import React, { useState } from 'react';
import { X, Image as ImageIcon, Type, Sparkles, Upload, Loader2, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

interface CreateStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GRADIENT_PRESETS = [
  { id: 'slate', name: 'Dark Slate', class: 'from-slate-900 via-slate-800 to-slate-950', textClass: 'text-white' },
  { id: 'blue', name: 'Azul Técnico', class: 'from-blue-900 via-indigo-950 to-slate-950', textClass: 'text-white' },
  { id: 'emerald', name: 'Verde Energia', class: 'from-emerald-950 via-teal-900 to-slate-950', textClass: 'text-emerald-50' },
  { id: 'amber', name: 'Ouro Industrial', class: 'from-amber-950 via-yellow-950 to-slate-950', textClass: 'text-amber-100' },
  { id: 'purple', name: 'Violeta Elétrico', class: 'from-purple-950 via-indigo-900 to-slate-950', textClass: 'text-purple-100' }
];

export const CreateStoryModal: React.FC<CreateStoryModalProps> = ({ isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const { createStory } = useData();

  const [mode, setMode] = useState<'text' | 'image'>('text');
  const [text, setText] = useState('');
  const [selectedGradient, setSelectedGradient] = useState(GRADIENT_PRESETS[0]);
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('A imagem deve ter no máximo 5MB.');
        return;
      }
      setError(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImagePreview(base64);
        setImageUrl(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (mode === 'text' && !text.trim()) {
      setError('Por favor, escreva uma mensagem para a sua história.');
      return;
    }

    if (mode === 'image' && !imageUrl && !imagePreview) {
      setError('Por favor, selecione ou insira uma imagem para a sua história.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await createStory({
        text: text.trim() || undefined,
        imageUrl: mode === 'image' ? (imageUrl || imagePreview || undefined) : undefined,
        backgroundColor: mode === 'text' ? selectedGradient.class : 'from-slate-950 to-slate-900',
        textColor: '#ffffff'
      });

      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          setText('');
          setImagePreview(null);
          setImageUrl('');
          onClose();
        }, 1200);
      } else {
        setError(res.error || 'Erro ao publicar história.');
      }
    } catch (err: any) {
      setError(err?.message || 'Falha na publicação.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white leading-tight">Nova História Técnica</h2>
              <p className="text-xs text-slate-400">Visível no Mural por 24 horas</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center space-x-2 text-rose-400 text-sm">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white">História Publicada!</h3>
              <p className="text-sm text-slate-400">Já está visível no topo do Mural para todos os usuários.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Type Switcher */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-800/80 rounded-xl border border-slate-700/50">
                <button
                  type="button"
                  onClick={() => setMode('text')}
                  className={`flex items-center justify-center space-x-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    mode === 'text'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  <Type className="w-4 h-4" />
                  <span>Texto & Gradiente</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMode('image')}
                  className={`flex items-center justify-center space-x-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    mode === 'image'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>Foto / Trabalho</span>
                </button>
              </div>

              {/* Mode: TEXT */}
              {mode === 'text' && (
                <div className="space-y-4">
                  {/* Preview Box */}
                  <div
                    className={`h-48 sm:h-56 rounded-2xl bg-gradient-to-br ${selectedGradient.class} p-5 flex flex-col items-center justify-center text-center shadow-inner border border-white/10 transition-all`}
                  >
                    <p className={`text-lg sm:text-xl font-semibold leading-relaxed max-w-xs break-words ${selectedGradient.textClass}`}>
                      {text || 'Digite sua atualização profissional, serviço concluído ou aviso técnico...'}
                    </p>
                  </div>

                  {/* Gradient Selector */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                      Fundo Profissional
                    </label>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      {GRADIENT_PRESETS.map((grad) => (
                        <button
                          key={grad.id}
                          type="button"
                          onClick={() => setSelectedGradient(grad)}
                          className={`w-10 h-10 rounded-xl bg-gradient-to-br ${grad.class} border-2 shrink-0 transition-transform ${
                            selectedGradient.id === grad.id
                              ? 'border-blue-400 scale-110 shadow-lg'
                              : 'border-transparent hover:scale-105'
                          }`}
                          title={grad.name}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Textarea */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Mensagem do Status
                      </label>
                      <span className="text-xs text-slate-500">{text.length}/240</span>
                    </div>
                    <textarea
                      rows={3}
                      maxLength={240}
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="Ex: Disponível para montagens de painéis elétricos e quadros trifásicos hoje na Cidade de Maputo!"
                      className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Mode: IMAGE */}
              {mode === 'image' && (
                <div className="space-y-4">
                  {imagePreview ? (
                    <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-700/80 h-52 sm:h-64 flex items-center justify-center group">
                      <img
                        src={imagePreview}
                        alt="Prévia do Trabalho"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview(null);
                          setImageUrl('');
                        }}
                        className="absolute top-3 right-3 bg-red-600 text-white p-2 rounded-xl opacity-90 hover:opacity-100 shadow-lg transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="border-2 border-dashed border-slate-700 hover:border-blue-500/60 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer bg-slate-800/40 hover:bg-slate-800/80 transition-all">
                      <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-3">
                        <Upload className="w-6 h-6" />
                      </div>
                      <span className="text-sm font-semibold text-white">Carregar Foto do Trabalho</span>
                      <span className="text-xs text-slate-400 mt-1">PNG, JPG ou WEBP até 5MB</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFile}
                        className="hidden"
                      />
                    </label>
                  )}

                  {/* Caption */}
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
                      Legenda Opcional
                    </label>
                    <input
                      type="text"
                      maxLength={140}
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="Ex: Instalação de Inversor Híbrido 5kW concluída na Matola."
                      className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-all"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Publicando História...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      <span>Publicar História (24 Horas)</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
