import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { TechnicianProfile, TECHNICAL_CATEGORIES, MOZAMBIQUE_PROVINCES } from '../../types';
import {
  Wrench,
  Search,
  MapPin,
  Star,
  ShieldCheck,
  Phone,
  MessageSquare,
  QrCode,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Filter,
  Camera,
  Heart,
  Flame,
  Trophy,
  Calendar,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { DigitalBusinessCard } from '../common/DigitalBusinessCard';
import { TopBackNav } from '../common/TopBackNav';
import { TechnicianCard } from './TechnicianCard';
import { TechnicianDetailModal } from './TechnicianDetailModal';

interface TechniciansDirectoryProps {
  onNavigateTab: (tab: string) => void;
  onOpenMessages?: (userId: string, userName: string, role: string) => void;
  onRequestQuote?: (technician: TechnicianProfile) => void;
}

export const TechniciansDirectory: React.FC<TechniciansDirectoryProps> = ({
  onNavigateTab,
  onOpenMessages,
  onRequestQuote
}) => {
  const { technicians, portfolio } = useData();
  const { currentUser, giveTechnicianLike } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProvince, setSelectedProvince] = useState('all');
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [selectedTechForCard, setSelectedTechForCard] = useState<TechnicianProfile | null>(null);
  const [selectedTechForDetail, setSelectedTechForDetail] = useState<TechnicianProfile | null>(null);

  // Active technicians sorted descending by engagement (totalLikes / scoreEngajamento)
  const activeTechsSorted = useMemo(() => {
    return technicians
      .filter(t => t.status === 'active')
      .sort((a, b) => {
        const likesA = a.totalLikes ?? 0;
        const likesB = b.totalLikes ?? 0;
        if (likesB !== likesA) return likesB - likesA;
        const scoreA = a.scoreEngajamento ?? 0;
        const scoreB = b.scoreEngajamento ?? 0;
        if (scoreB !== scoreA) return scoreB - scoreA;
        return (b.rating ?? 0) - (a.rating ?? 0);
      });
  }, [technicians]);

  // Top 5 Technicians by likes
  const top5Techs = useMemo(() => {
    return activeTechsSorted.slice(0, 5);
  }, [activeTechsSorted]);

  // Filtered technicians for the main list
  const filteredTechs = useMemo(() => {
    return activeTechsSorted.filter(tech => {
      const term = (searchTerm || '').toString().toLowerCase().trim();
      const matchSearch =
        !term ||
        (tech.name || '').toLowerCase().includes(term) ||
        (tech.specialties || []).some(s => (s || '').toLowerCase().includes(term)) ||
        (tech.bio || '').toLowerCase().includes(term) ||
        (tech.city || '').toLowerCase().includes(term) ||
        (tech.province || '').toLowerCase().includes(term);

      const matchCategory = selectedCategory === 'all' || (tech.specialties || []).includes(selectedCategory);
      const matchProvince = selectedProvince === 'all' || tech.province === selectedProvince;
      const matchVerified = !onlyVerified || tech.verificationStatus === 'approved';

      return matchSearch && matchCategory && matchProvince && matchVerified;
    });
  }, [activeTechsSorted, searchTerm, selectedCategory, selectedProvince, onlyVerified]);

  const handleRequestQuoteDefault = (tech: TechnicianProfile) => {
    if (onRequestQuote) {
      onRequestQuote(tech);
    } else {
      setSelectedTechForDetail(tech);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900/5 py-6 sm:py-8 px-3 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Top Back Navigation Bar */}
        <TopBackNav
          title="Diretório de Técnicos e Especialistas"
          category="Técnicos MZ"
          onBack={() => onNavigateTab('community')}
          backLabel="Voltar ao Mural"
        />

        {/* Header Hero */}
        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-blue-900/40 relative overflow-hidden">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/80 border border-blue-600/50 text-blue-200 text-xs font-bold">
              <Wrench className="w-3.5 h-3.5 text-blue-400" />
              <span>Diretório Nacional de Especialistas Técnicos • Moçambique</span>
            </div>
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white">
              Encontre Técnicos Certificados
            </h1>
            <p className="text-xs sm:text-base text-blue-200">
              Profissionais autônomos e engenheiros com identidades auditadas, avaliações reais de clientes e ranking atualizado em tempo real.
            </p>
          </div>
        </div>

        {/* TOP 5 CAROUSEL SECTION */}
        {top5Techs.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-1.5">
                    <span>Top 5 Técnicos em Destaque</span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                      Mais Curtidos ❤️
                    </span>
                  </h2>
                  <p className="text-xs text-slate-500">
                    Os especialistas moçambicanos com maior engajamento e recomendações na plataforma
                  </p>
                </div>
              </div>
            </div>

            {/* Horizontal Scroll Carousel */}
            <div className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scroll-smooth no-scrollbar -mx-3 px-3 sm:mx-0 sm:px-0">
              {top5Techs.map((tech, idx) => {
                const rankNum = idx + 1;
                const likes = tech.totalLikes ?? 0;

                return (
                  <div
                    key={tech.userId}
                    onClick={() => setSelectedTechForDetail(tech)}
                    className="min-w-[280px] sm:min-w-[320px] max-w-[320px] shrink-0 bg-white rounded-3xl p-5 border border-slate-200 hover:border-amber-400 hover:shadow-xl transition-all duration-200 flex flex-col justify-between relative snap-start group cursor-pointer"
                  >
                    {/* Rank Badge */}
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-black flex items-center gap-1 shadow-xs ${
                        rankNum === 1 ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-300' :
                        rankNum === 2 ? 'bg-slate-200 text-slate-900' :
                        rankNum === 3 ? 'bg-amber-700/20 text-amber-900 border border-amber-700/30' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {rankNum === 1 ? '👑 #1 TOP TÉCNICO' :
                         rankNum === 2 ? '🥈 #2 TOP TÉCNICO' :
                         rankNum === 3 ? '🥉 #3 TOP TÉCNICO' :
                         `#${rankNum} EM DESTAQUE`}
                      </span>

                      {tech.verificationStatus === 'approved' && (
                        <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 flex items-center gap-0.5">
                          <ShieldCheck className="w-3 h-3 text-blue-600" /> Verificado
                        </span>
                      )}
                    </div>

                    {/* Circular Photo with Like Badge */}
                    <div className="flex items-center gap-3.5 mb-3">
                      <div className="relative shrink-0">
                        <img
                          src={
                            tech.avatarUrl ||
                            tech.photoURL ||
                            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
                          }
                          alt={tech.name}
                          className="w-16 h-16 rounded-full object-cover bg-slate-100 border-2 border-amber-300 shadow-sm group-hover:scale-105 transition-transform"
                        />
                        {/* Likes Badge attached to Photo */}
                        <div
                          className="absolute -bottom-1 -right-1 bg-rose-600 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full border-2 border-white shadow-xs flex items-center gap-0.5"
                          title={`${likes} curtidas`}
                        >
                          <Heart className="w-2.5 h-2.5 fill-white" />
                          <span>{likes}</span>
                        </div>
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-black text-slate-900 truncate group-hover:text-blue-600 transition">
                          {tech.name}
                        </h3>
                        <p className="text-xs font-semibold text-blue-700 truncate mt-0.5">
                          {tech.specialties[0]}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                          <span>📍 {tech.city}</span>
                          <span className="font-bold text-slate-700 bg-slate-100 px-1.5 py-0.2 rounded">
                            {tech.idade ? `${tech.idade} anos` : '28 anos'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Stats & Quick Actions */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1 text-xs font-bold text-amber-600">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        <span>{tech.rating.toFixed(1)}</span>
                        <span className="text-[10px] text-slate-400 font-normal">({tech.reviewsCount})</span>
                      </div>

                      <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={async () => {
                            await giveTechnicianLike(tech.userId);
                          }}
                          className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition text-xs flex items-center gap-1 font-bold active:scale-95"
                          title="Curtir técnico"
                        >
                          <Heart className="w-3.5 h-3.5 fill-rose-500" />
                          <span>+1</span>
                        </button>

                        {tech.showWhatsappButton && tech.whatsapp && (
                          <a
                            href={`https://wa.me/${(tech.whatsapp || tech.phone || '').replace(/\D/g, '')}?text=${encodeURIComponent(
                              `Olá ${tech.name}, vi seu perfil nos Top Técnicos da TécnicaMZ e gostaria de um orçamento.`
                            )}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-xs"
                            title="WhatsApp"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                        )}

                        {onOpenMessages && (
                          <button
                            onClick={() => onOpenMessages(tech.userId, tech.name, 'technician')}
                            className="p-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 transition border border-blue-200"
                            title="Mensagem Direta / Chat"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          onClick={() => setSelectedTechForDetail(tech)}
                          className="px-2.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition flex items-center gap-1"
                        >
                          <span>Perfil</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Filter Bar */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Nome, especialidade ou palavra-chave..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div>
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
              >
                <option value="all">Todas as Especialidades</option>
                {TECHNICAL_CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={selectedProvince}
                onChange={e => setSelectedProvince(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
              >
                <option value="all">Todas as Províncias</option>
                {MOZAMBIQUE_PROVINCES.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="onlyVerifiedTech"
                checked={onlyVerified}
                onChange={e => setOnlyVerified(e.target.checked)}
                className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
              />
              <label htmlFor="onlyVerifiedTech" className="font-semibold text-slate-700 cursor-pointer flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>Apenas técnicos com Selo Oficial Verificado</span>
              </label>
            </div>

            <p className="text-slate-500 font-medium">
              Ordenados por <strong>Engajamento & Curtidas</strong> ({filteredTechs.length} profissionais)
            </p>
          </div>
        </div>

        {/* Ranking Technicians Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTechs.map((tech, idx) => (
            <TechnicianCard
              key={tech.userId}
              technician={tech}
              rank={idx + 1}
              onSelect={selected => setSelectedTechForDetail(selected)}
              onRequestQuote={handleRequestQuoteDefault}
              onOpenMessages={onOpenMessages}
            />
          ))}
        </div>
      </div>

      {/* Technician Detail Modal */}
      <TechnicianDetailModal
        technician={selectedTechForDetail}
        onClose={() => setSelectedTechForDetail(null)}
        onRequestQuote={handleRequestQuoteDefault}
        onOpenMessages={onOpenMessages}
      />

      {/* Digital Business Card Modal */}
      <DigitalBusinessCard
        technician={selectedTechForCard}
        isOpen={Boolean(selectedTechForCard)}
        onClose={() => setSelectedTechForCard(null)}
      />
    </div>
  );
};
