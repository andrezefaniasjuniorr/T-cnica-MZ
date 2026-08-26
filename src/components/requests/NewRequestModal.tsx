import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import {
  TECHNICAL_CATEGORIES,
  MOZAMBIQUE_PROVINCES,
  ServiceCategory,
  MozambiqueProvince,
  ServiceUrgency
} from '../../types';
import { X, PlusCircle, AlertCircle, CheckCircle2, Send, MapPin, DollarSign, Clock } from 'lucide-react';

interface NewRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetTechnicianId?: string;
  targetTechnicianName?: string;
}

export const NewRequestModal: React.FC<NewRequestModalProps> = ({
  isOpen,
  onClose,
  targetTechnicianId,
  targetTechnicianName
}) => {
  const { createServiceRequest } = useData();
  const { currentUser } = useAuth();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ServiceCategory>(TECHNICAL_CATEGORIES[0]);
  const [province, setProvince] = useState<MozambiqueProvince>(
    currentUser?.province || MOZAMBIQUE_PROVINCES[0]
  );
  const [city, setCity] = useState(currentUser?.city || '');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState<ServiceUrgency>('normal');
  const [budgetMZN, setBudgetMZN] = useState<string>('');
  const [clientPhone, setClientPhone] = useState(currentUser?.phone || '');
  const [clientName, setClientName] = useState(currentUser?.name || '');

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !description.trim() || !clientPhone.trim()) {
      setError('Por favor preencha todos os campos obrigatórios.');
      return;
    }

    setIsSubmitting(true);

    try {
      createServiceRequest({
        clientId: currentUser?.uid || 'guest_client',
        clientName: clientName || currentUser?.name || 'Cliente TécnicaMZ',
        clientPhone,
        title,
        category,
        province,
        city: city || 'Maputo',
        address,
        description,
        urgency,
        budgetMZN: budgetMZN ? Number(budgetMZN) : undefined,
        assignedTechnicianId: targetTechnicianId
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
        setTitle('');
        setDescription('');
        setBudgetMZN('');
      }, 1800);
    } catch (err: any) {
      setError(err?.message || 'Erro ao publicar pedido.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-blue-900 text-white p-6 sm:p-7 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-800 text-blue-200 text-xs font-bold mb-2">
            <PlusCircle className="w-3.5 h-3.5" />
            {targetTechnicianName ? `Pedido Direto a ${targetTechnicianName}` : 'Mural de Pedidos'}
          </div>
          <h2 className="text-xl sm:text-2xl font-black">
            {targetTechnicianName ? `Pedir Orçamento a ${targetTechnicianName}` : 'Solicitar Serviço Técnico'}
          </h2>
          <p className="text-xs text-blue-200 mt-0.5">
            Descreva o serviço para receber propostas e orçamentos detalhados.
          </p>
        </div>

        {success ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black text-slate-900">Pedido Publicado com Sucesso!</h3>
            <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
              O seu pedido já está visível para técnicos qualificados em {province}. Você receberá orçamentos diretamente aqui e no WhatsApp.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-4 text-xs">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block font-bold text-slate-700 mb-1">Título do Pedido *</label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Ex: Instalação de Ar Condicionado 18.000 BTU na sala"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Área Técnica *</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  {TECHNICAL_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Urgência *</label>
                <select
                  value={urgency}
                  onChange={e => setUrgency(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                >
                  <option value="low">Baixa (Planejado para os próximos dias)</option>
                  <option value="normal">Normal (Esta semana)</option>
                  <option value="high">Alta (Próximas 24-48h)</option>
                  <option value="urgent">🚨 Urgente (Atendimento Imediato)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Província *</label>
                <select
                  value={province}
                  onChange={e => setProvince(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  {MOZAMBIQUE_PROVINCES.map(p => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Cidade / Distrito / Bairro *</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  placeholder="Ex: Maputo, Matola, Beira, Polana..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Descrição Detalhada do Problema / Serviço *
              </label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Explique o que precisa ser feito, se já possui os materiais, medidas aproximadas..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
              ></textarea>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Orçamento Estimado (MZN) - Opcional
                </label>
                <input
                  type="number"
                  min={0}
                  step={50}
                  value={budgetMZN}
                  onChange={e => setBudgetMZN(e.target.value)}
                  placeholder="Ex: 3500"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Contacto Telefónico / WhatsApp *
                </label>
                <input
                  type="tel"
                  required
                  value={clientPhone}
                  onChange={e => setClientPhone(e.target.value)}
                  placeholder="+258 84 123 4567"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 mt-2"
            >
              <Send className="w-4 h-4" />
              <span>Publicar Pedido de Serviço</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
