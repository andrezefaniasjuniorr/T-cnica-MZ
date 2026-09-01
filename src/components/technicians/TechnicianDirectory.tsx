import React, { useState, useMemo } from 'react';
import { TechnicianProfile, MOZAMBIQUE_PROVINCES, TECHNICAL_CATEGORIES } from '../../types';
import { TechnicianCard } from './TechnicianCard';
import { useData } from '../../context/DataContext';
import {
  Search,
  Filter,
  CheckCircle2,
  MapPin,
  Briefcase,
  Star,
  SlidersHorizontal,
  X,
  Sparkles,
  Users
} from 'lucide-react';

interface TechnicianDirectoryProps {
  onSelectTechnician: (technician: TechnicianProfile) => void;
  onRequestQuote: (technician: TechnicianProfile) => void;
  selectedCategory?: string;
  onClearCategory?: () => void;
}

export const TechnicianDirectory: React.FC<TechnicianDirectoryProps> = ({
  onSelectTechnician,
  onRequestQuote,
  selectedCategory,
  onClearCategory
}) => {
  const { technicians } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState(selectedCategory || 'all');
  const [provinceFilter, setProvinceFilter] = useState('all');
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [sortBy, setSortBy] = useState<'featured' | 'rating' | 'experience'>('featured');

  // Update filter if prop changes
  React.useEffect(() => {
    if (selectedCategory) {
      setCategoryFilter(selectedCategory);
    }
  }, [selectedCategory]);

  const filteredTechnicians = useMemo(() => {
    return technicians.filter(tech => {
      // Exclude suspended / blocked
      if (tech.status === 'suspended' || tech.status === 'blocked') return false;

      // Search query (name, bio, city, specialties)
      if (searchQuery.trim()) {
        const q = (searchQuery || '').toString().toLowerCase().trim();
        const matchesName = (tech.name || '').toLowerCase().includes(q);
        const matchesBio = (tech.bio || '').toLowerCase().includes(q);
        const matchesCity = (tech.city || '').toLowerCase().includes(q);
        const matchesProv = (tech.province || '').toLowerCase().includes(q);
        const matchesSpec = (tech.specialties || []).some(s => (s || '').toLowerCase().includes(q));
        if (!matchesName && !matchesBio && !matchesCity && !matchesProv && !matchesSpec) {
          return false;
        }
      }

      // Category filter
      if (categoryFilter !== 'all') {
        if (!tech.specialties.includes(categoryFilter)) return false;
      }

      // Province filter
      if (provinceFilter !== 'all') {
        if (tech.province !== provinceFilter) return false;
      }

      // Verified only
      if (onlyVerified) {
        if (tech.verificationStatus !== 'approved') return false;
      }

      // Available only
      if (onlyAvailable) {
        if (tech.availability !== 'available') return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'rating') {
        return b.rating - a.rating;
      }
      if (sortBy === 'experience') {
        return b.experienceYears - a.experienceYears;
      }
      // Default: Featured & Active premium first
      const aScore = (a.featured ? 100 : 0) + (a.subscriptionStatus === 'active' ? 50 : 0) + (a.verificationStatus === 'approved' ? 20 : 0);
      const bScore = (b.featured ? 100 : 0) + (b.subscriptionStatus === 'active' ? 50 : 0) + (b.verificationStatus === 'approved' ? 20 : 0);
      return bScore - aScore;
    });
  }, [technicians, searchQuery, categoryFilter, provinceFilter, onlyVerified, onlyAvailable, sortBy]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setCategoryFilter('all');
    setProvinceFilter('all');
    setOnlyVerified(false);
    setOnlyAvailable(false);
    setSortBy('featured');
    if (onClearCategory) onClearCategory();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header section */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-bold mb-2 border border-blue-200">
              <Users className="w-3.5 h-3.5" />
              Diretório Profissional de Moçambique
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Encontre Técnicos Qualificados
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl">
              Profissionais verificados em eletricidade, energia solar, climatização, segurança eletrônica e mais de 15 áreas técnicas.
            </p>
          </div>

          <div className="text-right hidden sm:block">
            <span className="text-xs text-slate-500 font-semibold">Técnicos encontrados:</span>
            <p className="text-2xl font-black text-blue-600">{filteredTechnicians.length}</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar Container */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm mb-8 space-y-4">
        {/* Main Search Input */}
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="O que você precisa? Ex: Eletricista, Técnico Solar, CCTV, Beira, Matola..."
            className="w-full pl-12 pr-10 py-3 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-3.5 p-1 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Category Filter */}
          <div>
            <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5 text-blue-600" />
              Área Técnica:
            </label>
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="all">Todas as Áreas ({TECHNICAL_CATEGORIES.length})</option>
              {TECHNICAL_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Province Filter */}
          <div>
            <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              Província:
            </label>
            <select
              value={provinceFilter}
              onChange={e => setProvinceFilter(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="all">Todo Moçambique ({MOZAMBIQUE_PROVINCES.length} Províncias)</option>
              {MOZAMBIQUE_PROVINCES.map(prov => (
                <option key={prov} value={prov}>
                  {prov}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
              Ordenar Por:
            </label>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="featured">Destaque & Recomendados</option>
              <option value="rating">Maior Avaliação (⭐ 5.0)</option>
              <option value="experience">Mais Anos de Experiência</option>
            </select>
          </div>

          {/* Checkboxes & Reset */}
          <div className="flex flex-col justify-end gap-2 pt-1 sm:pt-0">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-1.5 cursor-pointer font-bold text-slate-700 select-none">
                <input
                  type="checkbox"
                  checked={onlyVerified}
                  onChange={e => setOnlyVerified(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span>✓ Só Verificados</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer font-bold text-slate-700 select-none">
                <input
                  type="checkbox"
                  checked={onlyAvailable}
                  onChange={e => setOnlyAvailable(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span>🟢 Só Disponíveis</span>
              </label>
            </div>

            {(searchQuery || categoryFilter !== 'all' || provinceFilter !== 'all' || onlyVerified || onlyAvailable) && (
              <button
                onClick={handleResetFilters}
                className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                Limpar todos os filtros
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Technicians Grid */}
      {filteredTechnicians.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white rounded-3xl border border-slate-200 shadow-xs max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-400">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-black text-slate-900 mb-1">Nenhum técnico encontrado</h3>
          <p className="text-xs sm:text-sm text-slate-500 mb-6">
            Não encontramos nenhum profissional com os filtros selecionados. Tente alterar a província ou a especialidade.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
          >
            Ver todos os técnicos
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTechnicians.map(technician => (
            <TechnicianCard
              key={technician.userId}
              technician={technician}
              onSelect={onSelectTechnician}
              onRequestQuote={onRequestQuote}
            />
          ))}
        </div>
      )}
    </div>
  );
};
