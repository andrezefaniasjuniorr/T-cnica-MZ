import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { AcademyArticle, TECHNICAL_CATEGORIES } from '../../types';
import {
  BookOpen,
  Search,
  CheckCircle2,
  Clock,
  User,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  FileText,
  Video,
  X
} from 'lucide-react';

interface AcademySectionProps {
  onNavigateTab: (tab: string) => void;
}

export const AcademySection: React.FC<AcademySectionProps> = ({ onNavigateTab }) => {
  const { academyArticles } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedArticle, setSelectedArticle] = useState<AcademyArticle | null>(null);

  const filteredArticles = academyArticles.filter(art => {
    const matchSearch =
      art.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      art.summary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = selectedCategory === 'all' || art.category === selectedCategory;

    return matchSearch && matchCat && art.status === 'published';
  });

  return (
    <div className="min-h-screen bg-slate-900/5 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Hero */}
        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-blue-900/40 relative overflow-hidden">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/80 border border-blue-600/50 text-blue-200 text-xs font-bold">
              <BookOpen className="w-3.5 h-3.5 text-blue-400" />
              <span>Academia TécnicaMZ • Normas, Segurança & Dimensionamento</span>
            </div>
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white">
              Conhecimento & Normas Técnicas MZ
            </h1>
            <p className="text-xs sm:text-base text-blue-200">
              Guias práticos alinhados com os padrões da EDM, climatização tropical e normas de segurança ocupacional.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Pesquisar guias, normas da EDM, cálculos solares..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
          >
            <option value="all">Todas as Especialidades</option>
            {TECHNICAL_CATEGORIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Articles Feed */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map(art => (
            <div
              key={art.id}
              className="bg-white rounded-3xl p-6 border border-slate-200 hover:border-blue-300 hover:shadow-xl transition-all duration-200 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    {art.category}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{art.readTimeMinutes} min de leitura</span>
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-black text-slate-900 line-clamp-2">{art.title}</h3>
                  <p className="text-xs text-slate-600 line-clamp-3 mt-1 leading-relaxed">{art.summary}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500">Por {art.authorName}</span>
                <button
                  onClick={() => setSelectedArticle(art)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                >
                  <span>Ler Artigo Completo</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Full Article Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white p-6 relative">
              <button
                onClick={() => setSelectedArticle(null)}
                className="absolute top-5 right-5 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-blue-400 text-blue-950">
                {selectedArticle.category}
              </span>
              <h2 className="text-xl sm:text-2xl font-black mt-2 text-white">{selectedArticle.title}</h2>
              <p className="text-xs text-blue-200 mt-1">
                Autor: {selectedArticle.authorName} • {selectedArticle.readTimeMinutes} min de leitura
              </p>
            </div>

            <div className="p-6 sm:p-8 max-h-[65vh] overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {selectedArticle.content}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedArticle(null)}
                className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition"
              >
                Fechar Guia
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
