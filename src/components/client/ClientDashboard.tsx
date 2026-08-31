import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { ServiceRequest, TECHNICAL_CATEGORIES, MOZAMBIQUE_PROVINCES } from '../../types';
import {
  User,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Star,
  Phone,
  MessageSquare,
  Wrench,
  DollarSign,
  Calendar,
  ShieldCheck,
  ExternalLink,
  ArrowLeft,
  X
} from 'lucide-react';
import { TopBackNav } from '../common/TopBackNav';

interface ClientDashboardProps {
  onNavigateTab: (tab: string) => void;
  onOpenMessages?: (userId: string, userName: string, role: string) => void;
}

export const ClientDashboard: React.FC<ClientDashboardProps> = ({ onNavigateTab, onOpenMessages }) => {
  const { currentUser } = useAuth();
  const { serviceRequests, proposals, addServiceRequest, acceptProposal, addReview } = useData();

  const [isNewRequestModalOpen, setIsNewRequestModalOpen] = useState(false);
  const [selectedReviewTech, setSelectedReviewTech] = useState<{ id: string; name: string; reqId: string } | null>(null);

  // New Request Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<string>(TECHNICAL_CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [province, setProvince] = useState<string>(MOZAMBIQUE_PROVINCES[0]);
  const [city, setCity] = useState('Maputo');
  const [budgetMax, setBudgetMax] = useState<number>(5000);
  const [urgency, setUrgency] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');

  // Review state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  const myRequests = currentUser
    ? serviceRequests.filter(r => r.clientId === currentUser.uid)
    : [];

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !title.trim() || !description.trim()) return;

    addServiceRequest({
      clientId: currentUser.uid,
      clientName: currentUser.name,
      clientPhone: currentUser.phone,
      title: title.trim(),
      category,
      description: description.trim(),
      province,
      city,
      budgetMaxMZN: budgetMax,
      urgency
    });

    setIsNewRequestModalOpen(false);
    setTitle('');
    setDescription('');
  };

  const handleAddReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !selectedReviewTech) return;

    addReview({
      serviceRequestId: selectedReviewTech.reqId,
      technicianId: selectedReviewTech.id,
      technicianName: selectedReviewTech.name,
      clientId: currentUser.uid,
      clientName: currentUser.name,
      rating: reviewRating,
      comment: reviewComment.trim(),
      category: 'Serviço Geral'
    });

    setSelectedReviewTech(null);
    setReviewComment('');
  };

  return (
    <div className="min-h-screen bg-slate-900/5 py-6 sm:py-8 px-3 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Top Back Navigation Bar */}
        <TopBackNav
          title="Painel do Cliente & Pedidos de Obras"
          category="Meu Painel"
          onBack={() => onNavigateTab('community')}
          backLabel="Voltar ao Mural"
          rightAction={
            <button
              onClick={() => setIsNewRequestModalOpen(true)}
              className="px-3 py-1.5 sm:px-4 sm:py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-sm active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Solicitar Serviço</span>
            </button>
          }
        />

        {/* Top Hero */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-900/40 relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-900 text-emerald-200 border border-emerald-600/50">
                Painel do Cliente MZ
              </span>
              <h1 className="text-2xl sm:text-4xl font-black text-white">
                Meus Pedidos de Serviço & Obras
              </h1>
              <p className="text-xs sm:text-sm text-emerald-200">
                Solicite orçamentos para eletricidade, energia solar, canalização e climatização em qualquer província.
              </p>
            </div>

            <button
              onClick={() => setIsNewRequestModalOpen(true)}
              className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Solicitar Novo Serviço</span>
            </button>
          </div>
        </div>

        {/* Requests List */}
        <div className="space-y-4">
          <h3 className="text-base font-black text-slate-900">Histórico de Solicitações</h3>

          {myRequests.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
              <User className="w-12 h-12 text-slate-300 mx-auto" />
              <h4 className="text-sm font-bold text-slate-700">Você ainda não publicou pedidos de serviço</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Clique no botão acima para descrever sua necessidade e receber propostas de técnicos verificados.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {myRequests.map(req => {
                const reqProposals = proposals.filter(p => p.requestId === req.id);

                return (
                  <div
                    key={req.id}
                    className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {req.category}
                        </span>
                        <span className="text-xs text-slate-400">📍 {req.city}, {req.province}</span>
                      </div>

                      <div>
                        <h4 className="text-base font-black text-slate-900">{req.title}</h4>
                        <p className="text-xs text-slate-600 line-clamp-3 mt-1 leading-relaxed">{req.description}</p>
                      </div>

                      <div className="flex items-center gap-3 text-xs pt-1">
                        <span className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 font-semibold">
                          Orçamento máx: <strong>{req.budgetMaxMZN.toLocaleString()} MZN</strong>
                        </span>
                        <span className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 font-semibold">
                          Urgência: {req.urgency}
                        </span>
                      </div>
                    </div>

                    {/* Proposals Section for this request */}
                    <div className="pt-3 border-t border-slate-100 space-y-3">
                      <h5 className="text-xs font-black text-slate-900">
                        Propostas Recebidas ({reqProposals.length})
                      </h5>

                      {reqProposals.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">Aguardando propostas dos técnicos...</p>
                      ) : (
                        <div className="space-y-2">
                          {reqProposals.map(prop => (
                            <div
                              key={prop.id}
                              className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                            >
                              <div className="space-y-1">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-bold text-slate-900">{prop.technicianName}</span>
                                  {prop.technicianVerified && (
                                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                                  )}
                                  <span className="text-[10px] text-amber-600 font-bold">★ {prop.technicianRating.toFixed(1)}</span>
                                </div>
                                <p className="text-xs text-slate-600">{prop.notes || `Prazo estimado: ${prop.estimatedDays}`}</p>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="text-xs font-black font-mono text-emerald-800">
                                  {prop.totalCostMZN.toLocaleString()} MZN
                                </span>
                                {prop.status === 'accepted' ? (
                                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold">
                                    Aceito
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => acceptProposal(prop.id)}
                                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition"
                                  >
                                    Aceitar
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* New Request Modal */}
      {isNewRequestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsNewRequestModalOpen(false)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1 text-xs font-bold transition"
                  title="Voltar ao painel"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Voltar</span>
                </button>
                <h3 className="text-sm font-black">Solicitar Serviço Técnico</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsNewRequestModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-sm font-bold transition"
                title="Fechar (X)"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Título do Serviço</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Ex: Instalação de Sistema Solar com Baterias"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Categoria</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  >
                    {TECHNICAL_CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
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
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Descrição Detalhada da Necessidade</label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Descreva o problema, local, equipamentos que possui..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Orçamento Máximo Estimado (MZN)</label>
                <input
                  type="number"
                  value={budgetMax}
                  onChange={e => setBudgetMax(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition"
              >
                Publicar Pedido de Serviço
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
