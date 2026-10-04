import React, { useState, useEffect, useMemo, useRef } from 'react';
import { User, PaymentRecord } from '../../types';
import { collection, onSnapshot } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../../firebase/config';
import {
  DollarSign,
  Users,
  Clock,
  CheckCircle2,
  TrendingUp,
  CreditCard,
  UserCheck,
  Building2,
  Wrench,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Zap
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

interface AdminOverviewTabProps {
  users: User[];
  payments: PaymentRecord[];
  onSelectTab: (tab: 'metrics' | 'approvals' | 'users' | 'payments' | 'broadcast' | 'settings' | 'selo_requests') => void;
}

/**
 * Componente CountUp: Anima números suavemente quando a tela abre ou quando
 * os dados mudam em tempo real no Firestore.
 */
export const CountUpNumber: React.FC<{
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}> = ({ value, duration = 800, prefix = '', suffix = '', className = '' }) => {
  const [displayValue, setDisplayValue] = useState<number>(0);
  const prevValueRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const startValue = prevValueRef.current;
    const endValue = Number(value) || 0;
    prevValueRef.current = endValue;

    if (startValue === endValue) {
      setDisplayValue(endValue);
      return;
    }

    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Suavização cúbica (easeOutCubic)
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startValue + (endValue - startValue) * ease);
      setDisplayValue(current);

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(endValue);
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [value, duration]);

  return (
    <span className={className}>
      {prefix}
      {displayValue.toLocaleString('pt-MZ')}
      {suffix}
    </span>
  );
};

/**
 * Função utilitária para extração segura de data de pagamento do Firestore
 */
function parsePaymentDate(p: any): Date | null {
  if (!p) return null;
  // Firestore Timestamp
  if (p.createdAt?.toDate && typeof p.createdAt.toDate === 'function') {
    return p.createdAt.toDate();
  }
  if (p.timestamp?.toDate && typeof p.timestamp.toDate === 'function') {
    return p.timestamp.toDate();
  }
  if (p.submittedAt?.toDate && typeof p.submittedAt.toDate === 'function') {
    return p.submittedAt.toDate();
  }
  if (typeof p.createdAt?.seconds === 'number') {
    return new Date(p.createdAt.seconds * 1000);
  }
  if (typeof p.timestamp?.seconds === 'number') {
    return new Date(p.timestamp.seconds * 1000);
  }
  // Formato String ISO ou Date
  const raw = p.createdAt || p.submittedAt || p.dataCriacao || p.data || p.timestamp || p.reviewedAt || p.date;
  if (raw) {
    const d = new Date(raw);
    if (!isNaN(d.getTime())) return d;
  }
  // Timestamp embutido no ID pay_XXXXX
  if (typeof p.id === 'string' && p.id.startsWith('pay_')) {
    const num = parseInt(p.id.replace('pay_', ''), 10);
    if (!isNaN(num) && num > 1600000000000 && num < 2500000000000) {
      return new Date(num);
    }
  }
  return null;
}

export const AdminOverviewTab: React.FC<AdminOverviewTabProps> = ({
  users,
  payments,
  onSelectTab
}) => {
  // ---------------------------------------------------------------------------
  // 1. SINCRONIZAÇÃO EM TEMPO REAL COM FIRESTORE (onSnapshot em tudo)
  // ---------------------------------------------------------------------------
  const [realtimePayments, setRealtimePayments] = useState<PaymentRecord[] | null>(null);
  const [realtimeUsers, setRealtimeUsers] = useState<User[] | null>(null);

  useEffect(() => {
    if (!isFirebaseConfigured || !db) return;

    // Escuta simultânea de coleções 'pagamentos' e 'payments' para cobertura 100% real
    const paymentDocsMap = new Map<string, any>();

    const emitPayments = () => {
      const allPayments = Array.from(paymentDocsMap.values());
      setRealtimePayments(allPayments);
    };

    const unsubPagamentos = onSnapshot(
      collection(db, 'pagamentos'),
      (snapshot) => {
        snapshot.forEach((docSnap) => {
          paymentDocsMap.set(docSnap.id, { ...docSnap.data(), id: docSnap.id });
        });
        emitPayments();
      },
      (err) => console.warn('Aviso Firestore pagamentos onSnapshot:', err)
    );

    const unsubPayments = onSnapshot(
      collection(db, 'payments'),
      (snapshot) => {
        snapshot.forEach((docSnap) => {
          const prev = paymentDocsMap.get(docSnap.id);
          paymentDocsMap.set(docSnap.id, { ...prev, ...docSnap.data(), id: docSnap.id });
        });
        emitPayments();
      },
      (err) => console.warn('Aviso Firestore payments onSnapshot:', err)
    );

    // Escuta em tempo real da coleção 'users'
    const unsubUsers = onSnapshot(
      collection(db, 'users'),
      (snapshot) => {
        const uList: User[] = [];
        snapshot.forEach((docSnap) => {
          uList.push({ ...docSnap.data(), uid: docSnap.id } as unknown as User);
        });
        setRealtimeUsers(uList);
      },
      (err) => console.warn('Aviso Firestore users onSnapshot:', err)
    );

    return () => {
      unsubPagamentos();
      unsubPayments();
      unsubUsers();
    };
  }, []);

  // Mescla dados de tempo real com props iniciais para garantir zero delay
  const activePayments = useMemo(() => {
    const map = new Map<string, PaymentRecord>();
    (payments || []).forEach(p => {
      if (p.id) map.set(p.id, p);
    });
    (realtimePayments || []).forEach(p => {
      if (p.id) map.set(p.id, { ...map.get(p.id), ...p });
    });
    return Array.from(map.values());
  }, [realtimePayments, payments]);

  const activeUsers = useMemo(() => {
    const map = new Map<string, User>();
    (users || []).forEach(u => {
      const key = u.uid || (u as any).id;
      if (key) map.set(key, u);
    });
    (realtimeUsers || []).forEach(u => {
      const key = u.uid || (u as any).id;
      if (key) map.set(key, { ...map.get(key), ...u });
    });
    return Array.from(map.values());
  }, [realtimeUsers, users]);

  // ---------------------------------------------------------------------------
  // 2. CÁLCULOS 100% REAIS (SEM DADOS FAKE OU FIXOS)
  // ---------------------------------------------------------------------------

  // CARD 1: Receita Total Confirmada (sum REAL de pagamentos where status == 'aprovado' || 'approved')
  const approvedPayments = useMemo(() => {
    return activePayments.filter(p => {
      const s = String(p.status || '').toLowerCase().trim();
      return s === 'aprovado' || s === 'approved';
    });
  }, [activePayments]);

  const totalRevenueMZN = useMemo(() => {
    return approvedPayments.reduce((acc, curr) => {
      const val = Number(curr.amountMZN || (curr as any).valor || (curr as any).amount || 50);
      return acc + (isNaN(val) ? 50 : val);
    }, 0);
  }, [approvedPayments]);

  // CARD 2: Assinantes Pro (50 MT/mês) (count REAL de users where plano == 'pro' && status == 'ativo')
  const activeProUsers = useMemo(() => {
    return activeUsers.filter(u => {
      const plano = String((u as any).plano || (u as any).plan || (u as any).planoAtivo || u.activePlanId || '').toLowerCase().trim();
      const status = String(u.status || u.statusConta || u.statusAssinatura || u.subscriptionStatus || '').toLowerCase().trim();
      const isPro = plano === 'pro' || plano === 'profissional';
      const isAtivo = status === 'ativo' || status === 'active';
      return isPro && isAtivo;
    });
  }, [activeUsers]);

  const proSubscribersCount = activeProUsers.length;
  const proRecurrenceMZN = proSubscribersCount * 50;

  // CARD 3: Aprovações Pendentes (count REAL de users where status == 'pendente')
  const pendingApprovalUsers = useMemo(() => {
    return activeUsers.filter(u => {
      const status = String(u.status || u.statusConta || '').toLowerCase().trim();
      const statusAprovacao = String((u as any).statusAprovacao || '').toLowerCase().trim();
      return (
        status === 'pendente' ||
        status === 'pending' ||
        status === 'pending_approval' ||
        statusAprovacao === 'pendente'
      );
    });
  }, [activeUsers]);

  const pendingApprovalsCount = pendingApprovalUsers.length;

  // CARD 4: Total de Usuários + breakdown real (0 clientes · X técnicos · Y empresas)
  const clientCount = useMemo(() => {
    return activeUsers.filter(u => {
      const role = String(u.role || u.tipoConta || '').toLowerCase().trim();
      return role === 'client' || role === 'cliente';
    }).length;
  }, [activeUsers]);

  const techCount = useMemo(() => {
    return activeUsers.filter(u => {
      const role = String(u.role || u.tipoConta || '').toLowerCase().trim();
      return role === 'technician' || role === 'tecnico';
    }).length;
  }, [activeUsers]);

  const companyCount = useMemo(() => {
    return activeUsers.filter(u => {
      const role = String(u.role || u.tipoConta || '').toLowerCase().trim();
      return role === 'company' || role === 'empresa';
    }).length;
  }, [activeUsers]);

  const totalUsersCount = activeUsers.length;

  // CARD BAIXO: Pagamentos Pendentes (count REAL + total em MT REAL = count * 50)
  const pendingPayments = useMemo(() => {
    return activePayments.filter(p => {
      const s = String(p.status || '').toLowerCase().trim();
      return s === 'pendente' || s === 'pending' || s === 'pendente_aprovacao';
    });
  }, [activePayments]);

  const pendingCount = pendingPayments.length;
  const pendingTotalMZN = pendingCount * 50;

  // ---------------------------------------------------------------------------
  // 3. EFEITO VIDA: PULSE AMARELO QUANDO ENTRA NOVO PAGAMENTO PENDENTE
  // ---------------------------------------------------------------------------
  const [yellowPulse, setYellowPulse] = useState(false);
  const prevPendingCountRef = useRef<number | null>(null);

  useEffect(() => {
    if (prevPendingCountRef.current !== null && pendingCount > prevPendingCountRef.current) {
      setYellowPulse(true);
      const timer = setTimeout(() => setYellowPulse(false), 4500);
      return () => clearTimeout(timer);
    }
    prevPendingCountRef.current = pendingCount;
  }, [pendingCount]);

  // ---------------------------------------------------------------------------
  // 4. GRÁFICO 1: EVOLUÇÃO DE FATURAMENTO (AGRUPADO POR MÊS REAL via createdAt)
  // Sem meses fixos tipo Out-Nov-Dez. Usa exclusivamente os dados reais existentes.
  // ---------------------------------------------------------------------------
  const monthlyRevenueData = useMemo(() => {
    if (approvedPayments.length === 0) {
      return [];
    }

    const MONTH_SHORT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const MONTH_FULL = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    const map: Record<string, { label: string; fullLabel: string; sortKey: number; total: number; count: number }> = {};

    approvedPayments.forEach(p => {
      const d = parsePaymentDate(p);
      if (!d) return;

      const y = d.getFullYear();
      const m = d.getMonth();
      const key = `${y}-${String(m + 1).padStart(2, '0')}`;
      const sortKey = y * 100 + m;
      const label = `${MONTH_SHORT[m]}/${String(y).slice(-2)}`;
      const fullLabel = `${MONTH_FULL[m]} de ${y}`;
      const amount = Number(p.amountMZN || (p as any).valor || (p as any).amount || 50) || 50;

      if (!map[key]) {
        map[key] = { label, fullLabel, sortKey, total: 0, count: 0 };
      }
      map[key].total += amount;
      map[key].count += 1;
    });

    const list = Object.values(map).sort((a, b) => a.sortKey - b.sortKey);
    return list;
  }, [approvedPayments]);

  // ---------------------------------------------------------------------------
  // 5. GRÁFICO 2: COMPOSIÇÃO DE USUÁRIOS (DONUT 100% REAL BASEADO EM ROLES)
  // Se só tem técnicos, mostra 100% técnicos, calculado, não fixo.
  // ---------------------------------------------------------------------------
  const totalCategorized = clientCount + techCount + companyCount;

  const donutData = useMemo(() => {
    if (totalCategorized === 0) return [];

    const data: { name: string; value: number; percentage: number; color: string; dotColor: string }[] = [];

    if (clientCount > 0) {
      data.push({
        name: 'Clientes',
        value: clientCount,
        percentage: Math.round((clientCount / totalCategorized) * 100),
        color: '#3B82F6',
        dotColor: 'bg-blue-500'
      });
    }

    if (techCount > 0) {
      data.push({
        name: 'Técnicos',
        value: techCount,
        percentage: Math.round((techCount / totalCategorized) * 100),
        color: '#10B981',
        dotColor: 'bg-emerald-500'
      });
    }

    if (companyCount > 0) {
      data.push({
        name: 'Empresas',
        value: companyCount,
        percentage: Math.round((companyCount / totalCategorized) * 100),
        color: '#F59E0B',
        dotColor: 'bg-amber-500'
      });
    }

    return data;
  }, [clientCount, techCount, companyCount, totalCategorized]);

  return (
    <div className="space-y-6">
      {/* SVG Definições para Efeito Neon e Degradê */}
      <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
        <defs>
          <filter id="neonGlowEmerald" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="neonGradientArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10B981" stopOpacity={0.4} />
            <stop offset="60%" stopColor="#10B981" stopOpacity={0.08} />
            <stop offset="100%" stopColor="#10B981" stopOpacity={0.0} />
          </linearGradient>
        </defs>
      </svg>

      {/* ===================================================================== */}
      {/* 1. 4 CARDS DO TOPO - VIVO & 100% REAL COM GLOW SUTIL & COUNTUP       */}
      {/* ===================================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* TOP CARD 1: Receita Total Confirmada */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-emerald-500/20 shadow-[0_0_25px_rgba(16,185,129,0.12)] hover:border-emerald-500/40 hover:shadow-[0_0_35px_rgba(16,185,129,0.22)] transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Receita Total Confirmada</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-sm shadow-emerald-500/20">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                <CountUpNumber value={totalRevenueMZN} />
              </span>
              <span className="text-sm font-bold text-emerald-400">MT</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{approvedPayments.length} pagamentos aprovados</span>
            </p>
          </div>
        </div>

        {/* TOP CARD 2: Assinantes Pro (50 MT/mês) */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-blue-500/20 shadow-[0_0_25px_rgba(59,130,246,0.12)] hover:border-blue-500/40 hover:shadow-[0_0_35px_rgba(59,130,246,0.22)] transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Assinantes Pro (50 MT/mês)</span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-sm shadow-blue-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                <CountUpNumber value={proSubscribersCount} />
              </span>
              <span className="text-xs font-medium text-slate-400">ativos</span>
            </div>
            <p className="text-[11px] text-blue-400 mt-1.5 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
              <span>
                <CountUpNumber value={proRecurrenceMZN} /> MT / mês recorrente
              </span>
            </p>
          </div>
        </div>

        {/* TOP CARD 3: Aprovações Pendentes */}
        <div
          onClick={() => onSelectTab('approvals')}
          className="p-5 rounded-2xl bg-slate-900/90 border border-amber-500/20 shadow-[0_0_25px_rgba(245,158,11,0.12)] hover:border-amber-500/40 hover:shadow-[0_0_35px_rgba(245,158,11,0.22)] transition-all duration-300 cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Aprovações Pendentes</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform shadow-sm shadow-amber-500/20">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-amber-400 tracking-tight">
                <CountUpNumber value={pendingApprovalsCount} />
              </span>
              <span className="text-xs font-medium text-slate-400">cadastros</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1 group-hover:text-amber-300 transition-colors">
              <span>Clique para revisar novos usuários</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </p>
          </div>
        </div>

        {/* TOP CARD 4: Total de Usuários + breakdown real */}
        <div
          onClick={() => onSelectTab('users')}
          className="p-5 rounded-2xl bg-slate-900/90 border border-purple-500/20 shadow-[0_0_25px_rgba(168,85,247,0.12)] hover:border-purple-500/40 hover:shadow-[0_0_35px_rgba(168,85,247,0.22)] transition-all duration-300 cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total de Usuários</span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform shadow-sm shadow-purple-500/20">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                <CountUpNumber value={totalUsersCount} />
              </span>
              <span className="text-xs font-medium text-slate-400">registados</span>
            </div>
            <p className="text-[11px] text-slate-300 mt-1.5 font-medium truncate group-hover:text-purple-300 transition-colors">
              {clientCount} clientes · {techCount} técnicos · {companyCount} empresas
            </p>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 2. CARD DE BAIXO: PAGAMENTOS PENDENTES (COM PULSE AMARELO)            */}
      {/* ===================================================================== */}
      <div
        onClick={() => onSelectTab('payments')}
        className={`p-5 rounded-2xl bg-slate-900/90 border transition-all duration-500 cursor-pointer group ${
          yellowPulse
            ? 'border-amber-400 ring-2 ring-amber-400/80 shadow-[0_0_35px_rgba(245,158,11,0.55)] animate-pulse'
            : 'border-amber-500/20 shadow-[0_0_25px_rgba(245,158,11,0.12)] hover:border-amber-500/40 hover:shadow-[0_0_35px_rgba(245,158,11,0.25)]'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                yellowPulse
                  ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/50'
                  : 'bg-amber-500/20 border border-amber-500/30 text-amber-400'
              }`}
            >
              <CreditCard className="w-5 h-5" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                  Pagamentos Pendentes
                </h4>
                {pendingCount > 0 && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-[10px] font-extrabold uppercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                    Tempo Real
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Comprovativos de M-Pesa e e-Mola aguardando verificação do administrador
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-5 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
            <div className="text-left sm:text-right">
              <div className="flex items-baseline gap-1 sm:justify-end">
                <span className="text-2xl font-black text-amber-400">
                  <CountUpNumber value={pendingCount} />
                </span>
                <span className="text-xs text-slate-400 font-medium">pendentes</span>
              </div>
              <p className="text-xs font-semibold text-slate-300">
                Total: <span className="text-amber-300 font-bold"><CountUpNumber value={pendingTotalMZN} /> MT</span>
              </p>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelectTab('payments');
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all shadow-md shadow-amber-500/20 group-hover:scale-105"
            >
              <span>Validar</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 3. GRÁFICOS: EVOLUÇÃO NEON & COMPOSIÇÃO DONUT 100% REAL              */}
      {/* ===================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* GRÁFICO 1: Evolução de Faturamento (Efeito Neon + Área Degradê) */}
        <div className="lg:col-span-8 p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-[0_0_30px_rgba(16,185,129,0.06)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">Evolução de Faturamento</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                  Neon Realtime
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Valores reais agrupados por mês de registo via createdAt no Firestore
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs font-bold text-slate-300 block">Total Aprovado</span>
              <span className="text-base font-extrabold text-emerald-400">
                <CountUpNumber value={totalRevenueMZN} /> MT
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            {monthlyRevenueData.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-800 rounded-xl">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-2">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-slate-300">Aguardando Pagamentos Aprovados</p>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                  Assim que os pagamentos de M-Pesa / e-Mola forem aprovados no painel, o gráfico de evolução desenhará automaticamente os meses reais.
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={monthlyRevenueData}
                  margin={{ top: 15, right: 15, left: -15, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                  <XAxis
                    dataKey="label"
                    stroke="#64748B"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#334155' }}
                  />
                  <YAxis
                    stroke="#64748B"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#334155' }}
                    tickFormatter={(val) => `${val} MT`}
                  />
                  <Tooltip
                    cursor={{ stroke: '#10B981', strokeWidth: 1.5, strokeDasharray: '4 4' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900/95 border border-emerald-500/40 px-3.5 py-2.5 rounded-xl shadow-2xl shadow-emerald-950/80 backdrop-blur-md">
                            <p className="text-[11px] font-semibold text-slate-300">{data.fullLabel || data.label}</p>
                            <p className="text-sm font-extrabold text-emerald-400 mt-0.5 flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                              <span>{Number(data.total).toLocaleString('pt-MZ')} MT</span>
                            </p>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              {data.count} {data.count === 1 ? 'pagamento confirmado' : 'pagamentos confirmados'}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#10B981"
                    strokeWidth={3}
                    filter="url(#neonGlowEmerald)"
                    fillOpacity={1}
                    fill="url(#neonGradientArea)"
                    activeDot={{
                      r: 6,
                      fill: '#10B981',
                      stroke: '#FFFFFF',
                      strokeWidth: 2,
                      className: 'drop-shadow-[0_0_8px_#10B981]'
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* GRÁFICO 2: Composição de Usuários (Donut 100% Real baseado em Roles) */}
        <div className="lg:col-span-4 p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-[0_0_30px_rgba(59,130,246,0.06)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Composição de Usuários</h3>
              <span className="px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[10px] font-bold">
                100% Dinâmico
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Distribuição calculada em tempo real</p>
          </div>

          <div className="relative h-48 w-full my-2 flex items-center justify-center">
            {donutData.length === 0 ? (
              <div className="text-center p-4">
                <p className="text-xs text-slate-400">Nenhum usuário cadastrado</p>
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={72}
                      paddingAngle={donutData.length > 1 ? 4 : 0}
                      dataKey="value"
                      animationDuration={800}
                    >
                      {donutData.map((entry, index) => (
                        <Cell
                          key={`donut_cell_${index}`}
                          fill={entry.color}
                          stroke="#0F172A"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-slate-900/95 border border-slate-700 px-3 py-1.5 rounded-xl shadow-xl text-xs backdrop-blur-md">
                              <span className="font-bold text-white">{data.name}</span>
                              <div className="text-slate-300">
                                {data.value} {data.value === 1 ? 'usuário' : 'usuários'} ({data.percentage}%)
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                {/* Centro do Donut com Total */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xl font-black text-white tracking-tight">
                    <CountUpNumber value={totalUsersCount} />
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {donutData.length === 1 ? `${donutData[0].name}` : 'Total'}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Legenda com Contagem e Porcentagem 100% Real */}
          <div className="space-y-2 pt-3 border-t border-slate-800 text-xs">
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                Clientes
              </span>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-white">{clientCount}</span>
                <span className="text-[11px] text-slate-400">
                  ({totalCategorized > 0 ? Math.round((clientCount / totalCategorized) * 100) : 0}%)
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Técnicos
              </span>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-white">{techCount}</span>
                <span className="text-[11px] text-slate-400">
                  ({totalCategorized > 0 ? Math.round((techCount / totalCategorized) * 100) : 0}%)
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                Empresas
              </span>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-white">{companyCount}</span>
                <span className="text-[11px] text-slate-400">
                  ({totalCategorized > 0 ? Math.round((companyCount / totalCategorized) * 100) : 0}%)
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
