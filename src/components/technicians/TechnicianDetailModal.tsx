import React, { useState } from 'react';
import { TechnicianProfile } from '../../types';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { WhatsAppButton } from './WhatsAppButton';
import { Badge } from '../common/Badge';
import {
  X,
  ArrowLeft,
  Star,
  CheckCircle2,
  MapPin,
  Briefcase,
  Clock,
  Heart,
  Shield,
  Flag,
  Share2,
  Calendar,
  Layers,
  Send,
  Phone,
  Mail
} from 'lucide-react';

interface TechnicianDetailModalProps {
  technician: TechnicianProfile | null;
  onClose: () => void;
  onRequestQuote: (technician: TechnicianProfile) => void;
}

export const TechnicianDetailModal: React.FC<TechnicianDetailModalProps> = ({
  technician,
  onClose,
  onRequestQuote
}) => {
  const { reviews, portfolio, isFavorite, toggleFavorite, submitReport } = useData();
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState<'about' | 'portfolio' | 'reviews'>('about');
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('Comportamento inadequado');
  const [reportDetails, setReportDetails] = useState('');
  const [reportSent, setReportSent] = useState(false);

  if (!technician) return null;

  const techReviews = reviews.filter(r => r.technicianId === technician.userId);
  const techPortfolio = portfolio.filter(p => p.technicianId === technician.userId);
  const isFav = isFavorite(technician.userId);

  const isVerified = technician.verificationStatus === 'approved';
  const isPremium = technician.subscriptionStatus === 'active';

  const handleSendReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    submitReport({
      reporterId: currentUser.uid,
      reporterName: currentUser.name,
      reporterRole: currentUser.role,
      targetId: technician.userId,
      targetName: technician.name,
      targetType: 'technician',
      reason: reportReason,
      details: reportDetails
    });
    setReportSent(true);
    setTimeout(() => {
      setReportModalOpen(false);
      setReportSent(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header Cover Banner */}
        <div className="h-32 sm:h-40 bg-linear-to-r from-blue-900 via-indigo-900 to-slate-900 relative p-4 flex justify-between items-start">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl bg-black/40 hover:bg-black/60 text-white backdrop-blur-md transition flex items-center gap-1.5 text-xs font-bold shadow-sm"
              title="Voltar aos técnicos"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar</span>
            </button>
            {technician.featured && (
              <span className="px-3 py-1 bg-amber-400 text-slate-950 rounded-full text-xs font-black tracking-wide uppercase shadow-sm">
                ⭐ Em Destaque
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleFavorite(technician.userId)}
              className={`p-2 rounded-full backdrop-blur-md transition ${
                isFav
                  ? 'bg-rose-500 text-white'
                  : 'bg-black/40 hover:bg-black/60 text-white'
              }`}
              title={isFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            >
              <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md transition"
              title="Fechar (X)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Profile Card Header Info */}
        <div className="px-6 sm:px-8 pb-4 relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-16 sm:-mt-20 mb-4">
            <div className="relative">
              <img
                src={
                  technician.avatarUrl ||
                  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80'
                }
                alt={technician.name}
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl object-cover border-4 border-white shadow-xl bg-slate-100"
              />
              {isVerified && (
                <div
                  className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-1.5 rounded-xl border-2 border-white shadow-md"
                  title="Técnico Verificado Oficial TécnicaMZ"
                >
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <WhatsAppButton
                phone={technician.whatsapp || technician.phone}
                technicianName={technician.name}
                className="flex-1 sm:flex-none"
              />
              <button
                onClick={() => onRequestQuote(technician)}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Pedir Orçamento</span>
              </button>
            </div>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {technician.name}
              </h2>
              {isVerified && (
                <Badge variant="primary" icon={<CheckCircle2 className="w-3.5 h-3.5" />}>
                  Técnico Verificado
                </Badge>
              )}
              {isPremium && (
                <Badge variant="gold" icon={<Star className="w-3 h-3 fill-amber-500 text-amber-500" />}>
                  Profissional Premium
                </Badge>
              )}
            </div>

            <p className="text-xs sm:text-sm font-semibold text-blue-700 flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5" />
              {technician.specialties.join(' • ')}
            </p>

            <div className="flex flex-wrap items-center gap-y-2 gap-x-4 mt-3 text-xs text-slate-600">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <strong>{technician.city}</strong>, {technician.province}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {technician.experienceYears} anos de experiência
              </span>
              <span className="flex items-center gap-1 text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                {technician.rating.toFixed(1)} ({technician.reviewsCount} avaliações)
              </span>
              <span className="flex items-center gap-1 text-emerald-700 font-medium">
                <span
                  className={`w-2 h-2 rounded-full ${
                    technician.availability === 'available'
                      ? 'bg-emerald-500'
                      : technician.availability === 'busy'
                      ? 'bg-amber-500'
                      : 'bg-slate-400'
                  }`}
                ></span>
                {technician.availability === 'available'
                  ? 'Disponível para novos trabalhos'
                  : technician.availability === 'busy'
                  ? 'Agenda cheia no momento'
                  : 'Indisponível'}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 sm:px-8 border-b border-slate-200 flex items-center gap-6 text-xs font-bold">
          <button
            onClick={() => setActiveTab('about')}
            className={`py-3 border-b-2 transition ${
              activeTab === 'about'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Sobre & Serviços
          </button>
          <button
            onClick={() => setActiveTab('portfolio')}
            className={`py-3 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'portfolio'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <span>Portfólio de Obras</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 text-[10px]">
              {techPortfolio.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`py-3 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'reviews'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <span>Avaliações Reais</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 text-[10px]">
              {techReviews.length}
            </span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 sm:p-8 max-h-[450px] overflow-y-auto">
          {activeTab === 'about' && (
            <div className="space-y-6 text-xs sm:text-sm text-slate-700">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Biografia Profissional
                </h3>
                <p className="leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  {technician.bio}
                </p>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Especialidades e Habilidades
                </h3>
                <div className="flex flex-wrap gap-2">
                  {technician.specialties.map(spec => (
                    <span
                      key={spec}
                      className="px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
                <div>
                  <p className="text-slate-500 font-medium">Trabalhos Realizados</p>
                  <p className="text-base font-extrabold text-slate-900 mt-0.5">
                    {technician.completedJobsCount} serviços concluídos
                  </p>
                </div>
                <div>
                  <p className="text-slate-500 font-medium">Região de Cobertura</p>
                  <p className="text-base font-extrabold text-slate-900 mt-0.5">
                    {technician.province} ({technician.city})
                  </p>
                </div>
              </div>

              {/* Action bar inside about */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setReportModalOpen(true)}
                  className="text-xs text-slate-400 hover:text-rose-600 transition flex items-center gap-1.5"
                >
                  <Flag className="w-3.5 h-3.5" />
                  <span>Denunciar este perfil</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'portfolio' && (
            <div>
              {techPortfolio.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 text-xs">
                  <Layers className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                  <p className="font-semibold text-slate-700">Nenhum projeto no portfólio ainda.</p>
                  <p className="text-slate-500 mt-1">
                    O técnico em breve publicará fotos das instalações concluídas.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {techPortfolio.map(item => (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 shadow-xs flex flex-col"
                    >
                      {item.photos[0] && (
                        <img
                          src={item.photos[0]}
                          alt={item.title}
                          className="w-full h-44 object-cover"
                        />
                      )}
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] font-bold uppercase text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                            {item.category}
                          </span>
                          <h4 className="text-sm font-bold text-slate-900 mt-1.5">{item.title}</h4>
                          <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                            {item.description}
                          </p>
                        </div>
                        <div className="mt-3 pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500">
                          <span>{item.province}</span>
                          <span>{item.date}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-4">
              {techReviews.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 text-xs">
                  <Star className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                  <p className="font-semibold text-slate-700">Ainda sem avaliações públicas.</p>
                  <p className="text-slate-500 mt-1">
                    Seja o primeiro a contratar e avaliar este técnico!
                  </p>
                </div>
              ) : (
                techReviews.map(rev => (
                  <div
                    key={rev.id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          src={
                            rev.clientAvatar ||
                            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
                          }
                          alt={rev.clientName}
                          className="w-7 h-7 rounded-full object-cover"
                        />
                        <span className="font-bold text-slate-900">{rev.clientName}</span>
                      </div>
                      <div className="flex items-center gap-1 text-amber-500">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-current" />
                        ))}
                      </div>
                    </div>
                    <p className="text-slate-700 italic">"{rev.comment}"</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Report Submodal */}
        {reportModalOpen && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-black text-slate-900">Denunciar Técnico</h4>
                <button
                  onClick={() => setReportModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {reportSent ? (
                <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold text-center">
                  ✓ Denúncia enviada com sucesso para análise do Administrador.
                </div>
              ) : (
                <form onSubmit={handleSendReport} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Motivo:</label>
                    <select
                      value={reportReason}
                      onChange={e => setReportReason(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                    >
                      <option value="Fraude ou Cobrança Indevida">Fraude ou Cobrança Indevida</option>
                      <option value="Comportamento inadequado">Comportamento inadequado</option>
                      <option value="Serviço não executado">Serviço não executado</option>
                      <option value="Spam / Informações Falsas">Spam / Informações Falsas</option>
                      <option value="Outro">Outro</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Detalhes:</label>
                    <textarea
                      required
                      rows={3}
                      value={reportDetails}
                      onChange={e => setReportDetails(e.target.value)}
                      placeholder="Descreva o ocorrido com o máximo de detalhes..."
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    ></textarea>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setReportModalOpen(false)}
                      className="px-3 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 shadow-sm"
                    >
                      Enviar Denúncia
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
