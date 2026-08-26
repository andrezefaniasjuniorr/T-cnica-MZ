import React from 'react';
import { TechnicianProfile } from '../../types';
import { Badge } from '../common/Badge';
import { WhatsAppButton } from './WhatsAppButton';
import { Star, CheckCircle2, MapPin, Clock, ArrowRight, Heart } from 'lucide-react';
import { useData } from '../../context/DataContext';

interface TechnicianCardProps {
  technician: TechnicianProfile;
  onSelect: (technician: TechnicianProfile) => void;
  onRequestQuote?: (technician: TechnicianProfile) => void;
}

export const TechnicianCard: React.FC<TechnicianCardProps> = ({
  technician,
  onSelect,
  onRequestQuote
}) => {
  const { isFavorite, toggleFavorite } = useData();
  const isFav = isFavorite(technician.userId);

  const isVerified = technician.verificationStatus === 'approved';
  const isPremium = technician.subscriptionStatus === 'active';

  return (
    <div className={`rounded-3xl border bg-white p-5 sm:p-6 transition-all duration-200 hover:shadow-xl flex flex-col justify-between relative group ${
      technician.featured ? 'border-amber-300 ring-1 ring-amber-300/50 shadow-amber-100/50' : 'border-slate-200 hover:border-blue-300'
    }`}>
      {/* Top badges & Favorite */}
      <div className="flex items-start justify-between gap-2 mb-4">
        <div className="flex flex-wrap items-center gap-1.5">
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
          {technician.featured && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950">
              Destaque
            </span>
          )}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(technician.userId);
          }}
          className={`p-2 rounded-full transition ${
            isFav
              ? 'text-rose-500 bg-rose-50'
              : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
          }`}
          title={isFav ? 'Remover dos favoritos' : 'Salvar técnico'}
        >
          <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Main Info */}
      <div className="flex items-start gap-3.5 mb-4">
        <div className="relative shrink-0">
          <img
            src={
              technician.avatarUrl ||
              'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
            }
            alt={technician.name}
            className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl object-cover bg-slate-100 border-2 border-slate-100 shadow-xs"
          />
          <span
            className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${
              technician.availability === 'available'
                ? 'bg-emerald-500'
                : technician.availability === 'busy'
                ? 'bg-amber-500'
                : 'bg-slate-400'
            }`}
            title={
              technician.availability === 'available'
                ? 'Disponível'
                : technician.availability === 'busy'
                ? 'Ocupado'
                : 'Indisponível'
            }
          ></span>
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="text-base sm:text-lg font-black text-slate-900 truncate tracking-tight group-hover:text-blue-600 transition">
            {technician.name}
          </h3>
          <p className="text-xs font-semibold text-blue-700 truncate mt-0.5">
            {technician.specialties[0]}
            {technician.specialties.length > 1 && ` +${technician.specialties.length - 1}`}
          </p>

          <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-500 truncate">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">
              <strong>{technician.city}</strong>, {technician.province}
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
          <span className="text-slate-400 block text-[10px] font-semibold uppercase">Experiência</span>
          <span className="font-extrabold text-slate-900 block mt-0.5">
            {technician.experienceYears} anos
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
          className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-xs font-bold transition flex items-center gap-1"
          title="Ver perfil completo"
        >
          <span>Perfil</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
