import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { MarketItem, TECHNICAL_CATEGORIES, MOZAMBIQUE_PROVINCES } from '../../types';
import {
  ShoppingBag,
  Search,
  Plus,
  Phone,
  Tag,
  ExternalLink,
  MapPin,
  CheckCircle2,
  Filter,
  Trash2,
  Check,
  Eye,
  MessageCircle,
  Clock,
  Sparkles,
  ShieldCheck,
  X,
  Upload,
  Image as ImageIcon
} from 'lucide-react';

interface MarketSectionProps {
  onNavigateTab: (tab: string) => void;
}

export const MarketSection: React.FC<MarketSectionProps> = ({ onNavigateTab }) => {
  const { marketItems, addMarketItem, deleteMarketItem, editMarketItem, startOrGetConversation } = useData();
  const { currentUser, isTechnician, isCompany, isAdmin } = useAuth();

  const [activeView, setActiveView] = useState<'all' | 'my_items'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProvince, setSelectedProvince] = useState('all');
  const [selectedCondition, setSelectedCondition] = useState('all');
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [selectedItemDetail, setSelectedItemDetail] = useState<MarketItem | null>(null);

  // New Item State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(TECHNICAL_CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [priceMZN, setPriceMZN] = useState<number>(15000);
  const [condition, setCondition] = useState<'new' | 'used' | 'refurbished'>('new');
  const [province, setProvince] = useState(MOZAMBIQUE_PROVINCES[0]);
  const [city, setCity] = useState('Maputo');
  const [whatsapp, setWhatsapp] = useState(currentUser?.phone || '+258 84 000 0000');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&auto=format&fit=crop&q=80');
  const [uploadedPreview, setUploadedPreview] = useState<string | null>(null);

  // Presets of high demand equipment in Mozambique
  const MARKET_PRESETS = [
    {
      label: 'Inversor Híbrido 5kW',
      img: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&auto=format&fit=crop&q=80',
      price: 65000,
      cat: 'Energia Solar'
    },
    {
      label: 'Alicate Amperímetro Digital',
      img: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800&auto=format&fit=crop&q=80',
      price: 3500,
      cat: 'Eletricidade'
    },
    {
      label: 'Painel Solar 550W Tier-1',
      img: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&auto=format&fit=crop&q=80',
      price: 7800,
      cat: 'Energia Solar'
    },
    {
      label: 'Ar Condicionado Split 12.000 BTU',
      img: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&auto=format&fit=crop&q=80',
      price: 24000,
      cat: 'Frio e Climatização'
    }
  ];

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        alert('A imagem não pode ultrapassar 4MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const res = reader.result as string;
        setUploadedPreview(res);
        setImageUrl(res);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      alert('Faça login para anunciar no mercado técnico.');
      return;
    }
    if (!title.trim()) {
      alert('Por favor insira o nome do equipamento.');
      return;
    }

    addMarketItem({
      sellerId: currentUser.uid,
      sellerName: currentUser.name,
      sellerRole: currentUser.role,
      title: title.trim(),
      category,
      description: description.trim(),
      priceMZN: Number(priceMZN),
      condition,
      province,
      city,
      whatsapp,
      images: [imageUrl]
    });

    setIsSellModalOpen(false);
    setTitle('');
    setDescription('');
    setUploadedPreview(null);
    alert('Equipamento anunciado com sucesso no Mercado TécnicaMZ!');
  };

  // Filter items
  const filteredItems = marketItems.filter(item => {
    if (activeView === 'my_items') {
      if (!currentUser || item.sellerId !== currentUser.uid) return false;
    } else {
      // In all view, show active items (or allow admin to see everything)
      if (item.status !== 'active' && !isAdmin) return false;
    }

    const matchSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sellerName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchCat = selectedCategory === 'all' || item.category === selectedCategory;
    const matchProv = selectedProvince === 'all' || item.province === selectedProvince;
    const matchCond = selectedCondition === 'all' || item.condition === selectedCondition;

    return matchSearch && matchCat && matchProv && matchCond;
  });

  const getConditionLabel = (cond: string) => {
    switch (cond) {
      case 'new': return 'Novo / Na Caixa';
      case 'used': return 'Usado - Bom Estado';
      case 'refurbished': return 'Recondicionado / Testado';
      default: return cond;
    }
  };

  const getConditionColor = (cond: string) => {
    switch (cond) {
      case 'new': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'used': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'refurbished': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="min-h-screen bg-slate-900/5 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Hero */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-amber-500/20 relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="max-w-3xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold">
                <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
                <span>Mercado Técnico & Equipamentos Profissionais de Moçambique</span>
              </div>
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white">
                Mercado de Ferramentas & Equipamentos
              </h1>
              <p className="text-xs sm:text-base text-slate-300">
                Compre e venda inversores solares, painéis fotovoltaicos, instrumentos de medição Fluke/Uni-T, compressores e ferramentas industriais com segurança.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setIsSellModalOpen(true)}
                className="px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-2xl text-xs sm:text-sm font-black transition flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Anunciar Equipamento</span>
              </button>
            </div>
          </div>
        </div>

        {/* View Switcher (Todos vs Meus Anúncios) */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2 p-1.5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
            <button
              onClick={() => setActiveView('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeView === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Todos os Equipamentos ({marketItems.filter(i => i.status === 'active').length})
            </button>
            {currentUser && (
              <button
                onClick={() => setActiveView('my_items')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                  activeView === 'my_items'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Meus Anúncios ({marketItems.filter(i => i.sellerId === currentUser.uid).length})
              </button>
            )}
          </div>

          <p className="text-xs text-slate-500 font-semibold">
            Mostrando <span className="font-bold text-slate-900">{filteredItems.length}</span> itens disponíveis
          </p>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Buscar inversor, bateria, Fluke, bomba..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500 focus:bg-white"
              />
            </div>

            {/* Category */}
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-amber-500"
            >
              <option value="all">Todas as Categorias</option>
              {TECHNICAL_CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            {/* Province */}
            <select
              value={selectedProvince}
              onChange={e => setSelectedProvince(e.target.value)}
              className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-amber-500"
            >
              <option value="all">Todas as Províncias</option>
              {MOZAMBIQUE_PROVINCES.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>

            {/* Condition */}
            <select
              value={selectedCondition}
              onChange={e => setSelectedCondition(e.target.value)}
              className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-amber-500"
            >
              <option value="all">Todos os Estados</option>
              <option value="new">Novo / Na Caixa</option>
              <option value="used">Usado</option>
              <option value="refurbished">Recondicionado</option>
            </select>
          </div>
        </div>

        {/* Market Items Grid */}
        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black text-slate-800">Nenhum equipamento encontrado</h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              Não encontramos itens com os filtros atuais. Tente ajustar os filtros ou seja o primeiro a anunciar!
            </p>
            <button
              onClick={() => setIsSellModalOpen(true)}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl shadow-xs inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Anunciar Equipamento</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map(item => {
              const isOwner = currentUser && currentUser.uid === item.sellerId;
              const isSold = item.status === 'sold';

              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition duration-200 flex flex-col justify-between ${
                    isSold ? 'opacity-70 bg-slate-50' : ''
                  }`}
                >
                  <div>
                    {/* Image Box */}
                    <div className="relative aspect-4/3 bg-slate-100 overflow-hidden group">
                      <img
                        src={item.images[0] || 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=600&auto=format&fit=crop&q=80'}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />

                      {/* Condition Badge */}
                      <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-black border backdrop-blur-md shadow-xs ${getConditionColor(item.condition)}`}>
                        {getConditionLabel(item.condition)}
                      </span>

                      {/* Sold Stamp */}
                      {isSold && (
                        <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center">
                          <span className="px-4 py-1.5 bg-red-600 text-white text-xs font-black rounded-xl uppercase tracking-wider">
                            Vendido
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-5 space-y-3">
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span className="font-semibold text-amber-700">{item.category}</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {item.city}, {item.province}
                        </span>
                      </div>

                      <h3 className="text-sm sm:text-base font-black text-slate-900 line-clamp-2 leading-snug">
                        {item.title}
                      </h3>

                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>

                      <div className="pt-2">
                        <span className="text-[10px] text-slate-400 font-semibold block">Preço</span>
                        <span className="text-lg sm:text-xl font-black text-slate-900 font-mono">
                          {item.priceMZN.toLocaleString()} MZN
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setSelectedItemDetail(item)}
                      className="px-3 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-500" />
                      <span>Detalhes</span>
                    </button>

                    {isOwner ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            editMarketItem(item.id, {
                              status: item.status === 'active' ? 'sold' : 'active'
                            });
                          }}
                          className="p-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs transition"
                          title={item.status === 'active' ? 'Marcar como Vendido' : 'Reativar Anúncio'}
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Deseja excluir este anúncio do mercado?')) {
                              deleteMarketItem(item.id);
                            }
                          }}
                          className="p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl text-xs transition"
                          title="Excluir Anúncio"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <a
                        href={`https://wa.me/${(item.whatsapp || item.phone || '').replace(/\D/g, '')}?text=${encodeURIComponent(
                          `Olá ${item.sellerName}, vi o seu anúncio na TécnicaMZ: "${item.title}" por ${item.priceMZN.toLocaleString()} MZN. Ainda está disponível?`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Comprar / WhatsApp</span>
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: Anunciar Equipamento */}
      {isSellModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-black">Anunciar Equipamento no Mercado TécnicaMZ</h3>
              </div>
              <button
                onClick={() => setIsSellModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-sm font-bold transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateItem} className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nome / Título do Equipamento *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Ex: Inversor Deye 5kW Híbrido 48V Monofásico"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold focus:outline-none focus:border-amber-500 focus:bg-white"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Categoria Técnica</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-amber-500"
                  >
                    {TECHNICAL_CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Preço (MZN) *</label>
                  <input
                    type="number"
                    value={priceMZN}
                    onChange={e => setPriceMZN(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-amber-500 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Estado de Conservação</label>
                  <select
                    value={condition}
                    onChange={e => setCondition(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-amber-500"
                  >
                    <option value="new">Novo / Na Caixa</option>
                    <option value="used">Usado</option>
                    <option value="refurbished">Recondicionado</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Província</label>
                  <select
                    value={province}
                    onChange={e => setProvince(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  >
                    {MOZAMBIQUE_PROVINCES.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Cidade / Distrito</label>
                  <input
                    type="text"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    placeholder="Ex: Matola, Machava"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Número de WhatsApp</label>
                  <input
                    type="text"
                    value={whatsapp}
                    onChange={e => setWhatsapp(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                    placeholder="+258 84..."
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Descrição Completa & Especificações Técnicas
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Inclua potência, marca, voltagem, tempo de uso, motivo da venda e condições de entrega..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-amber-500 focus:bg-white"
                />
              </div>

              {/* Photos */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">Foto do Equipamento</label>
                <div className="flex items-center gap-3">
                  <label className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer border border-slate-200">
                    <Upload className="w-4 h-4 text-amber-600" />
                    <span>Carregar Foto do Celular / PC</span>
                    <input type="file" accept="image/*" onChange={handleImageFileChange} className="hidden" />
                  </label>
                  <span className="text-xs text-slate-400">ou selecione um modelo:</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  {MARKET_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setImageUrl(preset.img);
                        setUploadedPreview(preset.img);
                      }}
                      className={`p-1.5 rounded-xl border text-left flex items-center gap-2 transition ${
                        imageUrl === preset.img
                          ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-200'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <img src={preset.img} alt={preset.label} className="w-8 h-8 rounded-lg object-cover" />
                      <span className="text-[10px] font-bold text-slate-700 truncate">{preset.label}</span>
                    </button>
                  ))}
                </div>

                {uploadedPreview && (
                  <div className="mt-2 relative rounded-xl overflow-hidden border border-slate-200 max-h-36">
                    <img src={uploadedPreview} alt="Preview" className="w-full h-full object-cover max-h-36" />
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsSellModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition flex items-center gap-2 shadow-md shadow-amber-500/20"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Publicar Anúncio</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Detalhes do Item */}
      {selectedItemDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="relative aspect-16/9 bg-slate-100">
              <img
                src={selectedItemDetail.images[0]}
                alt={selectedItemDetail.title}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedItemDetail(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-950/80 hover:bg-slate-900 text-white flex items-center justify-center text-sm font-bold transition"
              >
                ✕
              </button>
              <span className={`absolute bottom-3 left-3 px-3 py-1 rounded-full text-xs font-black border backdrop-blur-md shadow-xs ${getConditionColor(selectedItemDetail.condition)}`}>
                {getConditionLabel(selectedItemDetail.condition)}
              </span>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                  {selectedItemDetail.category}
                </span>
                <h2 className="text-xl font-black text-slate-900 mt-0.5">{selectedItemDetail.title}</h2>
                <p className="text-2xl font-black text-slate-900 font-mono mt-2">
                  {selectedItemDetail.priceMZN.toLocaleString()} MZN
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                {selectedItemDetail.description}
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block font-semibold">Vendedor</span>
                  <span className="font-bold text-slate-900">{selectedItemDetail.sellerName}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block font-semibold">Localização</span>
                  <span className="font-bold text-slate-900">{selectedItemDetail.city}, {selectedItemDetail.province}</span>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <a
                  href={`https://wa.me/${(selectedItemDetail.whatsapp || selectedItemDetail.phone || '').replace(/\D/g, '')}?text=${encodeURIComponent(
                    `Olá ${selectedItemDetail.sellerName}, vi o anúncio "${selectedItemDetail.title}" na TécnicaMZ. Gostaria de comprar.`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20"
                >
                  <Phone className="w-4 h-4" />
                  <span>Conversar no WhatsApp</span>
                </a>

                {currentUser && currentUser.uid !== selectedItemDetail.sellerId && (
                  <button
                    onClick={() => {
                      startOrGetConversation(selectedItemDetail.sellerId, selectedItemDetail.sellerName, 'technician');
                      setSelectedItemDetail(null);
                      onNavigateTab('messages');
                    }}
                    className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Chat Interno</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
