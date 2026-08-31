import React, { useState } from 'react';
import { TechnicianProfile } from '../../types';
import { Badge } from '../common/Badge';
import { WhatsAppButton } from './WhatsAppButton';
import { Star, CheckCircle2, MapPin, Clock, ArrowRight, Heart, Calendar, Sparkles } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';

interface TechnicianCardProps {
  technician: TechnicianProfile;
  onSelect: (technician: TechnicianProfile) => void;
  onRequestQuote?: (technician: TechnicianProfile) => void;
  rank?: number;
}

export const TechnicianCard: React.FC<TechnicianCardProps> = ({
  technician,
  onSelect,
  onRequestQuote,
  rank
}) => {
  const { isFavorite, toggleFavorite } = useData();
  const { giveTechnicianLike } = useAuth();
  const [likeCount, setLikeCount] = useState<number>(technician.totalLikes ?? 0);
  const [isLiking, setIsLiking] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);

  const isFav = isFavorite(technician.userId);
  const isVerified = technician.verificationStatus === 'approved';
  const isPremium = technician.subscriptionStatus === 'active';

  const handleGiveLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLiking) return;
    setIsLiking(true);
    setHasLiked(true);
    setLikeCount(prev => prev + 1);
    try {
      await giveTechnicianLike(technician.userId);
    } catch (err) {
      console.warn('Like error:', err);
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <div className={`rounded-3xl border bg-white p-5 sm:p-6 transition-all duration-200 hover:shadow-xl flex flex-col justify-between relative group ${
      technician.featured ? 'border-amber-300 ring-1 ring-amber-300/50 shadow-amber-100/50' : 'border-slate-200 hover:border-blue-300'
    }`}>
      {/* Top badges & Actions */}
      <div className="flex items-start justify-between gap-2 mb-4">
        <div className="flex flex-wrap items-center gap-1.5">
          {typeof rank === 'number' && (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black tracking-wider ${
              rank === 1 ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-300' :
              rank === 2 ? 'bg-slate-200 text-slate-800' :
              rank === 3 ? 'bg-amber-700/20 text-amber-900' :
              'bg-slate-100 text-slate-600'
            }`}>
              #{rank} Ranking
            </span>
          )}
          {isVerified && (
            <Badge variant="primary" icon={<CheckCircle2 className="w-3 h-3" />}>
              Verificado
            </Badge>
          )}
          {isPremium && (
            <Badge variant="gold" icon={<Star className="w-3 h-3 fill-amber-500 text-amber-500" />}>
              Premium
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-1">
          {/* Direct Like Button on Card */}
          <button
            onClick={handleGiveLike}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black transition active:scale-95 cursor-pointer ${
              hasLiked
                ? 'bg-rose-100 text-rose-700 border border-rose-200'
                : 'bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100'
            }`}
            title="Curtir / Recomendar perfil deste técnico"
          >
            <Heart className={`w-3.5 h-3.5 ${hasLiked ? 'fill-rose-600' : 'text-rose-600'}`} />
            <span>{likeCount}</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(technician.userId);
            }}
            className={`p-1.5 rounded-full transition ${
              isFav
                ? 'text-rose-500 bg-rose-50'
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            }`}
            title={isFav ? 'Remover dos favoritos' : 'Salvar técnico'}
          >
            <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Info */}
      <div className="flex items-start gap-3.5 mb-4">
        <div className="relative shrink-0">
          <img
            src={
              technician.avatarUrl ||
              technician.photoURL ||
              'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
            }
            alt={technician.name}
            className="w-16 h-16 sm:w-18 sm:h-18 rounded-full object-cover bg-slate-100 border-2 border-slate-200 shadow-xs"
          />
          {/* Like Count Badge on Circular Photo */}
          <div
            className="absolute -bottom-1 -right-1 bg-rose-600 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full border-2 border-white shadow-xs flex items-center gap-0.5"
            title={`${likeCount} curtidas recebidas`}
          >
            <Heart className="w-2.5 h-2.5 fill-white" />
            <span>{likeCount}</span>
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="text-base sm:text-lg font-black text-slate-900 truncate tracking-tight group-hover:text-blue-600 transition">
            {technician.name}
          </h3>
          <p className="text-xs font-semibold text-blue-700 truncate mt-0.5">
            {technician.specialties[0]}
            {technician.specialties.length > 1 && ` +${technician.specialties.length - 1}`}
          </p>

          <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-slate-500">
            <span className="flex items-center gap-1 truncate">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <strong>{technician.city}</strong>, {technician.province}
            </span>
            {/* Age Badge */}
            <span className="inline-flex items-center gap-1 font-bold text-slate-700 bg-slate-100 px-2 py-0.2 rounded-md">
              <Calendar className="w-3 h-3 text-slate-400" />
              <span>{technician.idade ? `${technician.idade} anos` : '28 anos'}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Bio snippet */}
      <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
        {technician.bio}
      </p>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 py-3 border-t border-slate-100 text-center text-xs mb-4">
        <div>
          <span className="text-slate-400 block text-[10px] font-semibold uppercase">Avaliação</span>
          <span className="font-extrabold text-slate-900 flex items-center justify-center gap-1 mt-0.5">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            {technician.rating.toFixed(1)}
          </span>
        </div>
        <div>
          <span className="text-slate-400 block text-[10px] font-semibold uppercase">Trabalhos</span>
          <span className="font-extrabold text-slate-900 block mt-0.5">
            {technician.completedJobsCount}
          </span>
        </div>
        <div>
          <span className="text-slate-400 block text-[10px] font-semibold uppercase">Engajamento</span>
          <span className="font-extrabold text-rose-600 block mt-0.5 flex items-center justify-center gap-0.5">
            <Sparkles className="w-3 h-3" />
            {technician.scoreEngajamento ?? likeCount} pts
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-1">
        <WhatsAppButton
          phone={technician.whatsapp || technician.phone}
          technicianName={technician.name}
          className="flex-1 text-[11px] py-2"
        />
        <button
          onClick={() => onSelect(technician)}
          className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
          title="Ver perfil completo"
        >
          <span>Perfil</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
