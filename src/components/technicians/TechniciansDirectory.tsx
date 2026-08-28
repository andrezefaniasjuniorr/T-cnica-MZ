import React, { useState } from 'react';
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
  Camera
} from 'lucide-react';
import { DigitalBusinessCard } from '../common/DigitalBusinessCard';
import { TopBackNav } from '../common/TopBackNav';

interface TechniciansDirectoryProps {
  onNavigateTab: (tab: string) => void;
  onOpenMessages?: (userId: string, userName: string, role: string) => void;
}

export const TechniciansDirectory: React.FC<TechniciansDirectoryProps> = ({
  onNavigateTab,
  onOpenMessages
}) => {
  const { technicians, portfolio } = useData();
  const { currentUser } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProvince, setSelectedProvince] = useState('all');
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [selectedTechForCard, setSelectedTechForCard] = useState<TechnicianProfile | null>(null);

  const activeTechs = technicians.filter(t => t.status === 'active');

  const filteredTechs = activeTechs.filter(tech => {
    const matchSearch =
      tech.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tech.specialties.some(s => s.toLowerCase().includes(searchTerm.toLowerCase())) ||
      tech.bio.toLowerCase().includes(searchTerm.toLowerCase());

    const matchCategory = selectedCategory === 'all' || tech.specialties.includes(selectedCategory);
    const matchProvince = selectedProvince === 'all' || tech.province === selectedProvince;
    const matchVerified = !onlyVerified || tech.verificationStatus === 'approved';

    return matchSearch && matchCategory && matchProvince && matchVerified;
  });

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
              Profissionais autônomos e engenheiros com identidades auditadas, avaliações reais de clientes e selo de garantia TécnicaMZ.
            </p>
          </div>
        </div>

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
              Exibindo <strong>{filteredTechs.length}</strong> profissionais disponíveis
            </p>
          </div>
        </div>

        {/* Technicians Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTechs.map(tech => {
            const techWorks = portfolio.filter(p => p.technicianId === tech.userId);

            return (
              <div
                key={tech.userId}
                className="bg-white rounded-3xl p-6 border border-slate-200 hover:border-blue-300 hover:shadow-xl transition-all duration-200 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-slate-100 p-0.5 border border-slate-200 shrink-0">
                        <img
                          src={tech.avatarUrl || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=150&auto=format&fit=crop&q=80'}
                          alt={tech.name}
                          className="w-full h-full object-cover rounded-xl"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-sm font-black text-slate-900">{tech.name}</h3>
                        </div>
                        <p className="text-xs text-slate-500">📍 {tech.city}, {tech.province}</p>
                      </div>
                    </div>

                    {tech.verificationStatus === 'approved' && (
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 flex items-center gap-0.5 shrink-0">
                        <ShieldCheck className="w-3 h-3 text-blue-600" /> Selo MZ
                      </span>
                    )}
                  </div>

                  {/* Rating & Stats */}
                  <div className="flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1 text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded-md">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      <span>{tech.rating.toFixed(1)}</span>
                      <span className="text-slate-400 font-normal">({tech.reviewsCount})</span>
                    </span>
                    <span className="text-slate-500 font-medium">
                      🏆 {tech.completedJobsCount} obras
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{tech.bio}</p>

                  {/* Specialties Pills */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {tech.specialties.map((s, idx) => (
                      <span key={idx} className="text-[10px] font-semibold px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-lg">
                        {s}
                      </span>
                    ))}
                  </div>

                  {/* Portfolio Thumbnail Preview */}
                  {techWorks.length > 0 && (
                    <div className="pt-2 flex items-center gap-2">
                      {techWorks.slice(0, 3).map((w, idx) => (
                        <div key={idx} className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden border border-slate-200">
                          <img src={w.imageUrl} alt={w.title} className="w-full h-full object-cover" />
                        </div>
                      ))}
                      {techWorks.length > 3 && (
                        <span className="text-[10px] font-bold text-slate-400">+{techWorks.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Bottom Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedTechForCard(tech)}
                    className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 border border-slate-200 transition"
                    title="Ver Cartão Digital QR"
                  >
                    <QrCode className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-1.5">
                    {onOpenMessages && (
                      <button
                        onClick={() => onOpenMessages(tech.userId, tech.name, 'technician')}
                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Chat</span>
                      </button>
                    )}

                    {tech.showWhatsappButton && tech.whatsapp && (
                      <a
                        href={`https://wa.me/${(tech.whatsapp || tech.phone || '').replace(/\D/g, '')}?text=${encodeURIComponent(
                          `Olá ${tech.name}, encontrei seu perfil técnico na plataforma TécnicaMZ e gostaria de solicitar um orçamento.`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-xs"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Digital Business Card Modal */}
      <DigitalBusinessCard
        technician={selectedTechForCard}
        isOpen={Boolean(selectedTechForCard)}
        onClose={() => setSelectedTechForCard(null)}
      />
    </div>
  );
};
