import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../common/Badge';
import { UserAvatar } from '../common/UserAvatar';
import {
  TECHNICAL_CATEGORIES,
  MOZAMBIQUE_PROVINCES,
  ServiceRequest,
  ServiceProposal
} from '../../types';
import {
  Search,
  Filter,
  PlusCircle,
  Clock,
  MapPin,
  DollarSign,
  User,
  Send,
  CheckCircle2,
  XCircle,
  MessageCircle,
  AlertCircle,
  Wrench,
  Star
} from 'lucide-react';

interface ServiceRequestsListProps {
  onOpenNewRequest: () => void;
  onOpenProposalModal?: (request: ServiceRequest) => void;
}

export const ServiceRequestsList: React.FC<ServiceRequestsListProps> = ({
  onOpenNewRequest,
  onOpenProposalModal
}) => {
  const { serviceRequests, proposals, acceptProposal, rejectProposal } = useData();
  const { currentUser, isTechnician } = useAuth();

  const [categoryFilter, setCategoryFilter] = useState('all');
  const [provinceFilter, setProvinceFilter] = useState('all');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRequestId, setExpandedRequestId] = useState<string | null>(null);

  const filteredRequests = serviceRequests.filter(req => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (
        !req.title.toLowerCase().includes(q) &&
        !req.description.toLowerCase().includes(q) &&
        !req.city.toLowerCase().includes(q)
      ) {
        return false;
      }
    }
    if (categoryFilter !== 'all' && req.category !== categoryFilter) return false;
    if (provinceFilter !== 'all' && req.province !== provinceFilter) return false;
    if (urgencyFilter !== 'all' && req.urgency !== urgencyFilter) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-bold mb-2 border border-blue-200">
            <Clock className="w-3.5 h-3.5" />
            Mural de Pedidos em Tempo Real
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Pedidos de Serviço Técnico
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Veja as solicitações abertas por clientes residenciais e empresariais em todo Moçambique.
          </p>
        </div>

        <button
          onClick={onOpenNewRequest}
          className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 whitespace-nowrap"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Publicar Pedido de Serviço</span>
        </button>
      </div>

      {/* Filter Row */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs mb-8 space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Pesquisar pedidos por título, descrição ou cidade..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Categoria:</label>
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
            >
              <option value="all">Todas as Categorias</option>
              {TECHNICAL_CATEGORIES.map(c => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Província:</label>
            <select
              value={provinceFilter}
              onChange={e => setProvinceFilter(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
            >
              <option value="all">Todo Moçambique</option>
              {MOZAMBIQUE_PROVINCES.map(p => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Urgência:</label>
            <select
              value={urgencyFilter}
              onChange={e => setUrgencyFilter(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
            >
              <option value="all">Todas as Urgências</option>
              <option value="urgent">🚨 Urgente</option>
              <option value="high">Alta</option>
              <option value="normal">Normal</option>
              <option value="low">Baixa</option>
            </select>
          </div>
        </div>
      </div>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white rounded-3xl border border-slate-200 max-w-md mx-auto">
          <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">Nenhum pedido encontrado</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Não há pedidos cadastrados com estes filtros no momento.
          </p>
          <button
            onClick={() => {
              setCategoryFilter('all');
              setProvinceFilter('all');
              setUrgencyFilter('all');
              setSearchQuery('');
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
          >
            Limpar Filtros
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map(req => {
            const reqProposals = proposals.filter(p => p.requestId === req.id);
            const isExpanded = expandedRequestId === req.id;
            const isOwner = currentUser?.uid === req.clientId;

            return (
              <div
                key={req.id}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4 transition hover:border-blue-300"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
                        {req.category}
                      </span>
                      {req.urgency === 'urgent' && (
                        <Badge variant="danger" icon={<AlertCircle className="w-3 h-3" />}>
                          Urgente
                        </Badge>
                      )}
                      {req.urgency === 'high' && <Badge variant="warning">Alta Urgência</Badge>}
                      <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {req.city}, {req.province}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-black text-slate-900">{req.title}</h3>
                  </div>

                  {req.budgetMZN && (
                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">
                        Orçamento Previsto
                      </span>
                      <span className="text-lg font-black text-slate-900">
                        {req.budgetMZN.toLocaleString('pt-MZ')} MZN
                      </span>
                    </div>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  {req.description}
                </p>

                {/* Footer bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-3 text-slate-500">
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      {req.clientName}
                    </span>
                    <span>•</span>
                    <button
                      onClick={() => setExpandedRequestId(isExpanded ? null : req.id)}
                      className="font-bold text-blue-600 hover:underline"
                    >
                      {reqProposals.length} {reqProposals.length === 1 ? 'proposta' : 'propostas'}{' '}
                      {isExpanded ? '▲ recolher' : '▼ ver'}
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {isTechnician && onOpenProposalModal && (
                      <button
                        onClick={() => onOpenProposalModal(req)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition flex items-center gap-1.5 shadow-xs"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Enviar Orçamento</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded Proposals section */}
                {isExpanded && (
                  <div className="pt-4 border-t border-slate-200 space-y-3 animate-in fade-in">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Propostas Recebidas ({reqProposals.length})
                    </h4>

                    {reqProposals.length === 0 ? (
                      <p className="text-xs text-slate-500 italic py-2">
                        Nenhum técnico enviou proposta ainda. Seja o primeiro!
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {reqProposals.map(prop => (
                          <div
                            key={prop.id}
                            className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                          >
                            <div className="flex items-start gap-3">
                              <UserAvatar
                                src={prop.technicianAvatar}
                                name={prop.technicianName}
                                role="technician"
                                className="w-10 h-10 rounded-xl object-cover"
                              />
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-slate-900">{prop.technicianName}</span>
                                  {prop.technicianVerified && (
                                    <Badge variant="primary">✓ Verificado</Badge>
                                  )}
                                  <span className="text-amber-500 font-bold flex items-center gap-0.5 text-[11px]">
                                    <Star className="w-3 h-3 fill-current" />
                                    {prop.technicianRating}
                                  </span>
                                </div>
                                <p className="text-slate-600 mt-1 leading-snug">{prop.description}</p>
                              </div>
                            </div>

                            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0">
                              <div className="text-right">
                                <span className="text-xs font-black text-slate-900">
                                  {prop.totalCostMZN.toLocaleString('pt-MZ')} MZN
                                </span>
                              </div>

                              {isOwner && prop.status === 'pending' && (
                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={() => acceptProposal(prop.id)}
                                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px]"
                                  >
                                    Aceitar
                                  </button>
                                  <button
                                    onClick={() => rejectProposal(prop.id)}
                                    className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-[11px]"
                                  >
                                    Recusar
                                  </button>
                                </div>
                              )}

                              {prop.status === 'accepted' && (
                                <Badge variant="success">Proposta Aceita</Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
