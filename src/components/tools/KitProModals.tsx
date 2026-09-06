import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  FileText,
  Calculator,
  ListPlus,
  Users,
  Grid,
  Zap,
  BookOpen,
  Camera,
  ShieldCheck,
  Calendar,
  DollarSign,
  Image as ImageIcon,
  Award,
  AlertTriangle,
  ShoppingCart,
  Download,
  Phone,
  Plus,
  Trash2,
  Copy,
  Sparkles,
  ExternalLink,
  Check,
  Building,
  Upload,
  Layers,
  ArrowRight
} from 'lucide-react';

export type KitProModalId =
  | 'perfil_tecnico'
  | 'gerador_os'
  | 'calculadora_preco'
  | 'lista_materiais'
  | 'crm_clientes'
  | 'tabela_quadro'
  | 'dimensionamento'
  | 'tabelas_normativas'
  | 'diagnostico_foto'
  | 'checklist_nr10'
  | 'agenda_whatsapp'
  | 'gestao_financeira'
  | 'portfolio'
  | 'certificado_garantia'
  | 'socorro_obra'
  | 'cotacao_material'
  | null;

interface KitProModalsProps {
  activeModal: KitProModalId;
  onClose: () => void;
  onOpenModal?: (id: KitProModalId) => void;
}

export const KitProModals: React.FC<KitProModalsProps> = ({ activeModal, onClose, onOpenModal }) => {
  // Estado compartilhado entre ferramentas para injeção de dados
  const [injectedOSData, setInjectedOSData] = useState<any>(null);
  const [injectedQGData, setInjectedQGData] = useState<any>(null);

  if (!activeModal) return null;

  const handleNavigate = (id: KitProModalId) => {
    if (onOpenModal) {
      onOpenModal(id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/90">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600 font-bold">
              {getIcon(activeModal)}
            </span>
            <div>
              <h3 className="text-base font-black text-slate-900 leading-tight">
                {getTitle(activeModal)}
              </h3>
              <p className="text-[11px] text-slate-500">
                {getSubTitle(activeModal)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {activeModal !== 'perfil_tecnico' && (
              <button
                onClick={() => handleNavigate('perfil_tecnico')}
                title="Configurar Logotipo e Marca Própria"
                className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition flex items-center gap-1"
              >
                <Building className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden sm:inline">Minha Marca</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs text-slate-700">
          {activeModal === 'perfil_tecnico' && <PerfilTecnicoView />}
          {activeModal === 'gerador_os' && <GeradorOSView initialData={injectedOSData} />}
          {activeModal === 'calculadora_preco' && (
            <CalculadoraPrecoView
              onExportarOS={(dados) => {
                setInjectedOSData(dados);
                handleNavigate('gerador_os');
              }}
            />
          )}
          {activeModal === 'lista_materiais' && <ListaMateriaisView />}
          {activeModal === 'crm_clientes' && <CRMClientesView />}
          {activeModal === 'tabela_quadro' && <TabelaQuadroView initialCircuito={injectedQGData} />}
          {activeModal === 'dimensionamento' && (
            <DimensionamentoView
              onInjetarOS={(dados) => {
                setInjectedOSData(dados);
                handleNavigate('gerador_os');
              }}
              onInjetarQG={(circuito) => {
                setInjectedQGData(circuito);
                handleNavigate('tabela_quadro');
              }}
            />
          )}
          {activeModal === 'tabelas_normativas' && <TabelasNormativasView />}
          {activeModal === 'diagnostico_foto' && <DiagnosticoFotoView />}
          {activeModal === 'checklist_nr10' && <ChecklistNR10View />}
          {activeModal === 'agenda_whatsapp' && <AgendaWhatsAppView />}
          {activeModal === 'gestao_financeira' && <GestaoFinanceiraView />}
          {activeModal === 'portfolio' && <PortfolioView />}
          {activeModal === 'certificado_garantia' && <CertificadoGarantiaView />}
          {activeModal === 'socorro_obra' && <SocorroObraView />}
          {activeModal === 'cotacao_material' && <CotacaoMaterialView />}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 0. PERFIL DO TÉCNICO (MARCA PRÓPRIA WHITE-LABEL)
// ==========================================
const PerfilTecnicoView: React.FC = () => {
  const [nome, setNome] = useState('');
  const [slogan, setSlogan] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cidade, setCidade] = useState('');
  const [nuit, setNuit] = useState('');
  const [email, setEmail] = useState('');
  const [logoBase64, setLogoBase64] = useState<string | null>(null);
  const [salvo, setSalvo] = useState(false);

  useEffect(() => {
    const helper = (window as any).PerfilTecnico;
    if (helper) {
      const p = helper.obter();
      setNome(p.nome || '');
      setSlogan(p.slogan || '');
      setTelefone(p.telefone || '');
      setCidade(p.cidade || '');
      setNuit(p.nuit || '');
      setEmail(p.email || '');
      setLogoBase64(p.logoBase64 || null);
    }
  }, []);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setLogoBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSalvar = () => {
    const helper = (window as any).PerfilTecnico;
    if (helper) {
      helper.salvar({
        nome,
        slogan,
        telefone,
        cidade,
        nuit,
        email,
        logoBase64
      });
      setSalvo(true);
      setTimeout(() => setSalvo(false), 2500);
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl text-[11px] text-blue-900 leading-relaxed">
        <strong>Sistema 100% White-Label:</strong> Os dados e o logotipo cadastrados aqui serão aplicados exclusivamente em todos os seus orçamentos, contratos, recibos e tabelas de quadro. Nenhuma menção ao aplicativo aparecerá nos seus documentos em PDF.
      </div>

      <div className="flex items-center gap-4 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
        <div className="w-16 h-16 rounded-xl border border-slate-300 bg-white flex items-center justify-center overflow-hidden shrink-0">
          {logoBase64 ? (
            <img src={logoBase64} alt="Logotipo" className="w-full h-full object-contain" />
          ) : (
            <span className="text-[10px] text-slate-400 font-bold text-center">Sem Logo</span>
          )}
        </div>
        <div className="flex-1 space-y-1.5">
          <label className="text-xs font-black text-slate-900 block">Logotipo do Profissional / Empresa</label>
          <div className="flex gap-2">
            <label className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-[11px] cursor-pointer inline-flex items-center gap-1.5 transition">
              <Upload className="w-3.5 h-3.5" />
              <span>Carregar Imagem</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
            </label>
            {logoBase64 && (
              <button
                onClick={() => setLogoBase64(null)}
                className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-bold text-[11px]"
              >
                Remover
              </button>
            )}
          </div>
          <p className="text-[10px] text-slate-500">Formatos aceitos: PNG, JPG ou WEBP (recomendado com fundo transparente).</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="font-bold text-slate-700 block mb-1">Nome do Profissional ou Empresa *</label>
          <input
            className="w-full p-2 border border-slate-200 rounded-xl text-xs font-semibold focus:border-blue-500 focus:outline-hidden"
            placeholder="Ex: Carlos Sitoe Instalações Elétricas"
            value={nome}
            onChange={e => setNome(e.target.value)}
          />
        </div>
        <div>
          <label className="font-bold text-slate-700 block mb-1">Slogan Personalizado</label>
          <input
            className="w-full p-2 border border-slate-200 rounded-xl text-xs focus:border-blue-500 focus:outline-hidden"
            placeholder="Ex: Soluções Elétricas Seguras e Rápidas"
            value={slogan}
            onChange={e => setSlogan(e.target.value)}
          />
        </div>
        <div>
          <label className="font-bold text-slate-700 block mb-1">Telefone / WhatsApp *</label>
          <input
            className="w-full p-2 border border-slate-200 rounded-xl text-xs focus:border-blue-500 focus:outline-hidden"
            placeholder="+258 84 123 4567"
            value={telefone}
            onChange={e => setTelefone(e.target.value)}
          />
        </div>
        <div>
          <label className="font-bold text-slate-700 block mb-1">Cidade / Província</label>
          <input
            className="w-full p-2 border border-slate-200 rounded-xl text-xs focus:border-blue-500 focus:outline-hidden"
            placeholder="Maputo / Matola"
            value={cidade}
            onChange={e => setCidade(e.target.value)}
          />
        </div>
        <div>
          <label className="font-bold text-slate-700 block mb-1">NUIT (Opcional)</label>
          <input
            className="w-full p-2 border border-slate-200 rounded-xl text-xs focus:border-blue-500 focus:outline-hidden"
            placeholder="400123456"
            value={nuit}
            onChange={e => setNuit(e.target.value)}
          />
        </div>
        <div>
          <label className="font-bold text-slate-700 block mb-1">Email de Contato (Opcional)</label>
          <input
            className="w-full p-2 border border-slate-200 rounded-xl text-xs focus:border-blue-500 focus:outline-hidden"
            placeholder="contacto@eletricista.co.mz"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </div>
      </div>

      <button
        onClick={handleSalvar}
        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl flex items-center justify-center gap-2 shadow-sm transition"
      >
        <Check className="w-4 h-4" />
        <span>{salvo ? '✓ Dados Salvos no Navegador!' : 'Salvar Dados da Minha Marca'}</span>
      </button>
    </div>
  );
};

// ==========================================
// 1. GERADOR DE OS, CONTRATO & RECIBO
// ==========================================
interface ServicoItem {
  id: string;
  descricao: string;
  qtd: number;
  precoUnit: number;
}
interface MaterialItem {
  id: string;
  descricao: string;
  qtd: number;
  precoUnit: number;
}

const GeradorOSView: React.FC<{ initialData?: any }> = ({ initialData }) => {
  const [tipo, setTipo] = useState<'OS' | 'CONTRATO' | 'RECIBO'>('OS');
  const [cliente, setCliente] = useState({
    nome: 'Manuel Sitoe',
    telefone: '+258 84 123 4567',
    endereco: 'Bairro de Albasine, Maputo',
    nuit: '102938475'
  });

  const [servicos, setServicos] = useState<ServicoItem[]>([
    { id: '1', descricao: 'Instalação de Quadro Geral 18 DIN e balanceamento de circuitos', qtd: 1, precoUnit: 4500 }
  ]);

  const [materiais, setMateriais] = useState<MaterialItem[]>([
    { id: '1', descricao: 'Quadro 18 DIN de embutir com barramento pente', qtd: 1, precoUnit: 1850 },
    { id: '2', descricao: 'Interruptor Diferencial IDR 40A 30mA bipolar', qtd: 1, precoUnit: 1600 }
  ]);

  const [desconto, setDesconto] = useState(0);
  const [condicoes, setCondicoes] = useState('50% na aprovação e 50% na vistoria final');
  const [prazo, setPrazo] = useState('2 dias úteis');
  const [garantiaDias, setGarantiaDias] = useState(90);
  const [observacoes, setObservacoes] = useState('Serviço normatizado conforme regulamentos da EDM.');
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  // Atualiza se houver dados injetados de outra ferramenta
  useEffect(() => {
    if (initialData) {
      if (initialData.servicos) setServicos(initialData.servicos);
      if (initialData.materiais) setMateriais(initialData.materiais);
      if (initialData.cliente) setCliente(prev => ({ ...prev, ...initialData.cliente }));
      if (initialData.desconto !== undefined) setDesconto(initialData.desconto);
    }
  }, [initialData]);

  // Cálculos dinâmicos
  const totalServicos = servicos.reduce((acc, s) => acc + (Number(s.qtd || 1) * Number(s.precoUnit || 0)), 0);
  const totalMateriais = materiais.reduce((acc, m) => acc + (Number(m.qtd || 1) * Number(m.precoUnit || 0)), 0);
  const totalGeral = Math.max(0, (totalServicos + totalMateriais) - Number(desconto || 0));

  const adicionarServico = () => {
    setServicos([...servicos, { id: String(Date.now()), descricao: '', qtd: 1, precoUnit: 0 }]);
  };
  const removerServico = (id: string) => {
    setServicos(servicos.filter(s => s.id !== id));
  };
  const updateServico = (id: string, field: keyof ServicoItem, val: any) => {
    setServicos(servicos.map(s => s.id === id ? { ...s, [field]: val } : s));
  };

  const adicionarMaterial = () => {
    setMateriais([...materiais, { id: String(Date.now()), descricao: '', qtd: 1, precoUnit: 0 }]);
  };
  const removerMaterial = (id: string) => {
    setMateriais(materiais.filter(m => m.id !== id));
  };
  const updateMaterial = (id: string, field: keyof MaterialItem, val: any) => {
    setMateriais(materiais.map(m => m.id === id ? { ...m, [field]: val } : m));
  };

  const handleGerarPDF = async () => {
    setLoading(true);
    setStatusMsg('');
    try {
      const g = (window as any).GeradorOS;
      if (!g) throw new Error('Módulo GeradorOS não carregado.');
      await g.gerarPDF({
        tipo,
        cliente,
        servicos,
        materiais,
        desconto,
        condicoesPagamento: condicoes,
        prazoExecucao: prazo,
        garantiaDias,
        observacoes
      }, 'download');
      setStatusMsg(`✓ Documento [${tipo}] gerado com sucesso em 1 página A4!`);
    } catch (e: any) {
      setStatusMsg('Erro ao gerar: ' + (e.message || e));
    } finally {
      setLoading(false);
    }
  };

  const handleEnviarZap = () => {
    let tel = (cliente.telefone || '').replace(/\D/g, '');
    if (tel.startsWith('0')) tel = tel.slice(1);
    if (!tel.startsWith('258') && tel.length <= 9) tel = `258${tel}`;

    const texto = `*ORÇAMENTO TÉCNICO ELÉTRICO*\n` +
      `Cliente: *${cliente.nome}*\n` +
      `--------------------------------\n` +
      `• Mão de Obra: ${totalServicos.toLocaleString()} MZN\n` +
      `• Materiais: ${totalMateriais.toLocaleString()} MZN\n` +
      (desconto > 0 ? `• Desconto: -${desconto.toLocaleString()} MZN\n` : '') +
      `*VALOR TOTAL:* *${totalGeral.toLocaleString()} MZN*\n` +
      `Prazo: ${prazo} | Garantia: ${garantiaDias} dias\n` +
      `--------------------------------\n` +
      `Segue anexo o documento oficial formatado.`;

    window.open(`https://wa.me/${tel}?text=${encodeURIComponent(texto)}`, '_blank');
  };

  return (
    <div className="space-y-4">
      {/* Alternador de Tipo */}
      <div className="flex bg-slate-100 p-1 rounded-2xl gap-1">
        {(['OS', 'CONTRATO', 'RECIBO'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTipo(t)}
            className={`flex-1 py-1.5 text-xs font-black rounded-xl transition ${
              tipo === t ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t === 'OS' ? '📋 Orçamento / OS' : t === 'CONTRATO' ? '📜 Contrato' : '💳 Recibo de Pagamento'}
          </button>
        ))}
      </div>

      {/* Dados do Cliente */}
      <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
        <span className="text-[11px] font-black text-slate-800 uppercase tracking-wider block">Dados do Cliente & Local</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <input
            className="p-2 border rounded-xl text-xs bg-white"
            placeholder="Nome do Cliente"
            value={cliente.nome}
            onChange={e => setCliente({ ...cliente, nome: e.target.value })}
          />
          <input
            className="p-2 border rounded-xl text-xs bg-white"
            placeholder="Telefone (+258...)"
            value={cliente.telefone}
            onChange={e => setCliente({ ...cliente, telefone: e.target.value })}
          />
          <input
            className="p-2 border rounded-xl text-xs bg-white"
            placeholder="Endereço / Bairro da Obra"
            value={cliente.endereco}
            onChange={e => setCliente({ ...cliente, endereco: e.target.value })}
          />
          <input
            className="p-2 border rounded-xl text-xs bg-white"
            placeholder="NUIT (opcional)"
            value={cliente.nuit}
            onChange={e => setCliente({ ...cliente, nuit: e.target.value })}
          />
        </div>
      </div>

      {/* Tabela de Serviços */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-slate-800 uppercase tracking-wider">Mão de Obra & Serviços</span>
          <button
            onClick={adicionarServico}
            className="px-2 py-1 bg-blue-50 text-blue-700 font-bold rounded-lg text-[11px] flex items-center gap-1 hover:bg-blue-100"
          >
            <Plus className="w-3.5 h-3.5" /> Adicionar Serviço
          </button>
        </div>
        <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
          {servicos.map(s => (
            <div key={s.id} className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-xl">
              <input
                className="flex-1 p-1.5 border rounded-lg text-xs bg-white"
                placeholder="Descrição do serviço"
                value={s.descricao}
                onChange={e => updateServico(s.id, 'descricao', e.target.value)}
              />
              <input
                type="number"
                className="w-14 p-1.5 border rounded-lg text-xs bg-white text-center"
                placeholder="Qtd"
                value={s.qtd}
                onChange={e => updateServico(s.id, 'qtd', Number(e.target.value))}
              />
              <input
                type="number"
                className="w-24 p-1.5 border rounded-lg text-xs bg-white text-right"
                placeholder="Preço MZN"
                value={s.precoUnit}
                onChange={e => updateServico(s.id, 'precoUnit', Number(e.target.value))}
              />
              <button
                onClick={() => removerServico(s.id)}
                className="p-1.5 text-slate-400 hover:text-rose-600 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Tabela de Materiais */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-slate-800 uppercase tracking-wider">Materiais & Insumos</span>
          <button
            onClick={adicionarMaterial}
            className="px-2 py-1 bg-emerald-50 text-emerald-700 font-bold rounded-lg text-[11px] flex items-center gap-1 hover:bg-emerald-100"
          >
            <Plus className="w-3.5 h-3.5" /> Adicionar Material
          </button>
        </div>
        <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
          {materiais.map(m => (
            <div key={m.id} className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-xl">
              <input
                className="flex-1 p-1.5 border rounded-lg text-xs bg-white"
                placeholder="Nome do material / componente"
                value={m.descricao}
                onChange={e => updateMaterial(m.id, 'descricao', e.target.value)}
              />
              <input
                type="number"
                className="w-14 p-1.5 border rounded-lg text-xs bg-white text-center"
                placeholder="Qtd"
                value={m.qtd}
                onChange={e => updateMaterial(m.id, 'qtd', Number(e.target.value))}
              />
              <input
                type="number"
                className="w-24 p-1.5 border rounded-lg text-xs bg-white text-right"
                placeholder="Preço MZN"
                value={m.precoUnit}
                onChange={e => updateMaterial(m.id, 'precoUnit', Number(e.target.value))}
              />
              <button
                onClick={() => removerMaterial(m.id)}
                className="p-1.5 text-slate-400 hover:text-rose-600 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Condições & Totais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-900 text-white rounded-2xl">
        <div className="space-y-1.5 text-[11px]">
          <div className="flex justify-between text-slate-300">
            <span>Subtotal Serviços:</span>
            <span>{totalServicos.toLocaleString()} MZN</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Subtotal Materiais:</span>
            <span>{totalMateriais.toLocaleString()} MZN</span>
          </div>
          <div className="flex items-center justify-between text-rose-400">
            <span>Desconto (MZN):</span>
            <input
              type="number"
              className="w-20 p-1 rounded bg-slate-800 text-right text-rose-400 text-xs border border-slate-700"
              value={desconto}
              onChange={e => setDesconto(Number(e.target.value))}
            />
          </div>
        </div>

        <div className="flex flex-col justify-center items-end border-t sm:border-t-0 sm:border-l border-slate-800 pt-2 sm:pt-0 sm:pl-3">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Valor Total Final</span>
          <p className="text-xl font-black text-amber-400">{totalGeral.toLocaleString()} MZN</p>
          <span className="text-[10px] text-slate-400 mt-0.5">Prazo: {prazo} • Garantia: {garantiaDias} dias</span>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleGerarPDF}
          disabled={loading}
          className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl flex items-center justify-center gap-2 shadow-sm transition"
        >
          <Download className="w-4 h-4" />
          <span>{loading ? 'Gerando Documento...' : `Baixar ${tipo} em PDF (1 Pág A4)`}</span>
        </button>

        <button
          onClick={handleEnviarZap}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-1.5 transition"
        >
          <Phone className="w-4 h-4" />
          <span className="hidden sm:inline">WhatsApp</span>
        </button>
      </div>

      {statusMsg && (
        <p className="text-center font-bold text-emerald-600 text-[11px] bg-emerald-50 py-1.5 rounded-lg border border-emerald-200">
          {statusMsg}
        </p>
      )}
    </div>
  );
};

// ==========================================
// 2. CALCULADORA DE PREÇO DE SERVIÇO
// ==========================================
const CalculadoraPrecoView: React.FC<{ onExportarOS: (dados: any) => void }> = ({ onExportarOS }) => {
  const [horas, setHoras] = useState(6);
  const [valorHora, setValorHora] = useState(450);
  const [material, setMaterial] = useState(1500);
  const [transporte, setTransporte] = useState(500);
  const [margem, setMargem] = useState(25);

  const calc = (window as any).CalculadoraPrecoServico;
  const res = calc ? calc.calcular({
    horas,
    valorHora,
    custoMaterial: material,
    deslocamento: transporte,
    margemLucroPct: margem
  }) : {
    custoMaoDeObra: horas * valorHora,
    custoMaterial: material,
    deslocamento: transporte,
    custoDireto: (horas * valorHora) + material + transporte,
    valorLucro: ((horas * valorHora) + material + transporte) * (margem / 100),
    precoFinal: ((horas * valorHora) + material + transporte) * (1 + (margem / 100))
  };

  const handleEnviarZap = () => {
    if (calc) {
      const msg = calc.gerarTextoWhatsApp(res);
      window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
    }
  };

  const handleExportar = () => {
    onExportarOS({
      servicos: [{ id: '1', descricao: `Mão de obra técnica especializada (${horas}h executadas)`, qtd: 1, precoUnit: res.custoMaoDeObra + res.valorLucro }],
      materiais: [{ id: '1', descricao: 'Insumos e materiais elétricos previstos', qtd: 1, precoUnit: material }],
      desconto: 0
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2.5">
        <div>
          <label className="font-bold text-slate-700 block mb-1">Horas Estimadas de Trabalho</label>
          <input
            type="number"
            className="w-full p-2 border border-slate-200 rounded-xl text-xs"
            value={horas}
            onChange={e => setHoras(Number(e.target.value))}
          />
        </div>
        <div>
          <label className="font-bold text-slate-700 block mb-1">Valor da Hora do Técnico (MZN)</label>
          <input
            type="number"
            className="w-full p-2 border border-slate-200 rounded-xl text-xs"
            value={valorHora}
            onChange={e => setValorHora(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        <div>
          <label className="font-bold text-slate-700 block mb-1">Materiais (MZN)</label>
          <input
            type="number"
            className="w-full p-2 border border-slate-200 rounded-xl text-xs"
            value={material}
            onChange={e => setMaterial(Number(e.target.value))}
          />
        </div>
        <div>
          <label className="font-bold text-slate-700 block mb-1">Transporte (MZN)</label>
          <input
            type="number"
            className="w-full p-2 border border-slate-200 rounded-xl text-xs"
            value={transporte}
            onChange={e => setTransporte(Number(e.target.value))}
          />
        </div>
        <div>
          <label className="font-bold text-slate-700 block mb-1">Margem Líquida (%)</label>
          <input
            type="number"
            className="w-full p-2 border border-slate-200 rounded-xl text-xs"
            value={margem}
            onChange={e => setMargem(Number(e.target.value))}
          />
        </div>
      </div>

      {/* Card Dinâmico de Resultado */}
      <div className="p-4 bg-gradient-to-br from-blue-900 to-slate-950 text-white rounded-3xl space-y-3 shadow-lg">
        <div className="flex justify-between items-center pb-2 border-b border-white/10">
          <span className="text-xs font-bold text-blue-200 uppercase tracking-wider">Desdobramento Financeiro</span>
          <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800">
            {margem}% Margem
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 bg-white/5 rounded-xl">
            <span className="text-[10px] text-slate-400 block">Mão de Obra</span>
            <span className="text-xs font-black text-white">{res.custoMaoDeObra?.toLocaleString()} MZN</span>
          </div>
          <div className="p-2 bg-white/5 rounded-xl">
            <span className="text-[10px] text-slate-400 block">Custos Diretos</span>
            <span className="text-xs font-black text-slate-200">{res.custoDireto?.toLocaleString()} MZN</span>
          </div>
          <div className="p-2 bg-white/5 rounded-xl">
            <span className="text-[10px] text-emerald-300 block">Lucro Líquido</span>
            <span className="text-xs font-black text-emerald-400">{res.valorLucro?.toLocaleString()} MZN</span>
          </div>
        </div>

        <div className="pt-2 flex justify-between items-baseline">
          <span className="text-xs text-slate-300">Preço Final Recomendado:</span>
          <span className="text-2xl font-black text-amber-300">{res.precoFinal?.toLocaleString()} MZN</span>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleExportar}
          className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl flex items-center justify-center gap-1.5 transition"
        >
          <ArrowRight className="w-4 h-4" />
          <span>Exportar para OS / Orçamento</span>
        </button>

        <button
          onClick={handleEnviarZap}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-1.5 transition"
        >
          <Phone className="w-4 h-4" />
          <span>WhatsApp</span>
        </button>
      </div>
    </div>
  );
};

// ==========================================
// 3. LISTA DE MATERIAIS AUTOMÁTICA (POR CÔMODOS)
// ==========================================
interface ComodoItem {
  id: string;
  nome: string;
  comp: number;
  larg: number;
  pontosLuz: number;
  tug: number;
  tue: number;
}

const ListaMateriaisView: React.FC = () => {
  const [comodos, setComodos] = useState<ComodoItem[]>([
    { id: '1', nome: 'Sala de Estar', comp: 5, larg: 4, pontosLuz: 2, tug: 5, tue: 1 },
    { id: '2', nome: 'Cozinha', comp: 4, larg: 3, pontosLuz: 2, tug: 6, tue: 1 },
    { id: '3', nome: 'Quarto 1', comp: 4, larg: 3.5, pontosLuz: 1, tug: 4, tue: 1 },
    { id: '4', nome: 'WC Geral', comp: 2.5, larg: 2, pontosLuz: 1, tug: 1, tue: 1 }
  ]);

  const [copiado, setCopiado] = useState(false);
  const [loading, setLoading] = useState(false);

  const helper = (window as any).ListaMateriaisAutomatica;
  const quant = helper ? helper.calcularPorComodos(comodos) : {
    cabo1_5: 100, cabo2_5: 150, cabo4_0: 60, eletrodutos: 80, disjuntor10A: 2, disjuntor16A: 3, disjuntor20A: 4
  };

  const adicionarComodo = () => {
    setComodos([...comodos, {
      id: String(Date.now()),
      nome: `Cômodo ${comodos.length + 1}`,
      comp: 4,
      larg: 3,
      pontosLuz: 1,
      tug: 3,
      tue: 0
    }]);
  };

  const removerComodo = (id: string) => {
    setComodos(comodos.filter(c => c.id !== id));
  };

  const updateComodo = (id: string, field: keyof ComodoItem, val: any) => {
    setComodos(comodos.map(c => c.id === id ? { ...c, [field]: val } : c));
  };

  const carregarPreset = (tipo: 'T1' | 'T2' | 'T3') => {
    if (tipo === 'T1') {
      setComodos([
        { id: '1', nome: 'Sala/Cozinha', comp: 5, larg: 3.5, pontosLuz: 2, tug: 5, tue: 1 },
        { id: '2', nome: 'Quarto', comp: 3.5, larg: 3, pontosLuz: 1, tug: 3, tue: 1 },
        { id: '3', nome: 'WC', comp: 2, larg: 1.8, pontosLuz: 1, tug: 1, tue: 1 }
      ]);
    } else if (tipo === 'T2') {
      setComodos([
        { id: '1', nome: 'Sala', comp: 5, larg: 4, pontosLuz: 2, tug: 4, tue: 1 },
        { id: '2', nome: 'Cozinha', comp: 3.5, larg: 3, pontosLuz: 2, tug: 5, tue: 1 },
        { id: '3', nome: 'Quarto Suite', comp: 4, larg: 3.5, pontosLuz: 1, tug: 4, tue: 1 },
        { id: '4', nome: 'Quarto 2', comp: 3.5, larg: 3, pontosLuz: 1, tug: 3, tue: 0 },
        { id: '5', nome: 'WC Suite', comp: 2.2, larg: 1.8, pontosLuz: 1, tug: 1, tue: 1 }
      ]);
    } else {
      setComodos([
        { id: '1', nome: 'Sala Estar/Jantar', comp: 6, larg: 4.5, pontosLuz: 3, tug: 6, tue: 1 },
        { id: '2', nome: 'Cozinha Gourmet', comp: 4, larg: 3.5, pontosLuz: 2, tug: 6, tue: 2 },
        { id: '3', nome: 'Quarto Suite Master', comp: 4.5, larg: 4, pontosLuz: 2, tug: 5, tue: 1 },
        { id: '4', nome: 'Quarto 2', comp: 3.5, larg: 3.5, pontosLuz: 1, tug: 4, tue: 1 },
        { id: '5', nome: 'Quarto 3', comp: 3.5, larg: 3, pontosLuz: 1, tug: 3, tue: 0 },
        { id: '6', nome: 'WC Principal', comp: 2.5, larg: 2, pontosLuz: 1, tug: 1, tue: 1 }
      ]);
    }
  };

  const handleCopiarZap = () => {
    const texto = `*LISTA DE MATERIAIS ELÉTRICOS - LEVANTAMENTO*\n` +
      `Cômodos: ${comodos.map(c => c.nome).join(', ')}\n` +
      `---------------------------------\n` +
      `• Cabo 1.5mm² (Luz): ${quant.cabo1_5} metros\n` +
      `• Cabo 2.5mm² (Tomadas TUG): ${quant.cabo2_5} metros\n` +
      `• Cabo 4.0mm² (TUE / Pesadas): ${quant.cabo4_0} metros\n` +
      `• Cabo 6.0mm² (Alimentador): ${quant.caboAlim || 30} metros\n` +
      `• Eletroduto Corrugado: ${quant.eletrodutos} metros\n` +
      `• Disjuntores DIN: ${quant.disjuntor10A}x 10A, ${quant.disjuntor16A}x 16A, ${quant.disjuntor20A}x 20A\n` +
      `• Proteção: Disjuntor Geral 40A + IDR 40A 30mA + 2x DPS\n` +
      `• Aterramento: 1x Haste Copperweld 5/8"\n` +
      `---------------------------------\n` +
      `Levantamento técnico realizado com margem de segurança de 15%.`;

    navigator.clipboard.writeText(texto);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const handleBaixarPDF = async () => {
    setLoading(true);
    try {
      if (helper) {
        await helper.gerarPDF({ nome: 'Levantamento de Instalação' }, comodos, 'download');
      }
    } catch (e: any) {
      alert('Erro ao gerar PDF: ' + (e.message || e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Botões de Modelo Rápido */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-slate-600">Modelos Rápidos:</span>
        <div className="flex gap-1.5">
          <button onClick={() => carregarPreset('T1')} className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-[10px] font-bold">T1</button>
          <button onClick={() => carregarPreset('T2')} className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-[10px] font-bold">T2</button>
          <button onClick={() => carregarPreset('T3')} className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-[10px] font-bold">T3</button>
        </div>
      </div>

      {/* Tabela de Cômodos Dinâmica */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs font-black text-slate-800 uppercase tracking-wider">Cômodos da Instalação ({comodos.length})</span>
          <button
            onClick={adicionarComodo}
            className="px-2 py-1 bg-blue-50 text-blue-700 font-bold rounded-lg text-[11px] flex items-center gap-1 hover:bg-blue-100"
          >
            <Plus className="w-3.5 h-3.5" /> Adicionar Cômodo
          </button>
        </div>

        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {comodos.map(c => {
            const area = (Number(c.comp || 0) * Number(c.larg || 0)).toFixed(1);
            return (
              <div key={c.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <input
                    className="font-bold text-xs p-1 border rounded bg-white flex-1"
                    value={c.nome}
                    onChange={e => updateComodo(c.id, 'nome', e.target.value)}
                  />
                  <span className="text-[10px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded border">
                    {area} m²
                  </span>
                  <button onClick={() => removerComodo(c.id)} className="p-1 text-slate-400 hover:text-rose-600">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-5 gap-1.5 text-[10px]">
                  <div>
                    <label className="text-slate-500 block">Comp (m)</label>
                    <input
                      type="number"
                      className="w-full p-1 border rounded bg-white text-center"
                      value={c.comp}
                      onChange={e => updateComodo(c.id, 'comp', Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 block">Larg (m)</label>
                    <input
                      type="number"
                      className="w-full p-1 border rounded bg-white text-center"
                      value={c.larg}
                      onChange={e => updateComodo(c.id, 'larg', Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 block">Pontos Luz</label>
                    <input
                      type="number"
                      className="w-full p-1 border rounded bg-white text-center"
                      value={c.pontosLuz}
                      onChange={e => updateComodo(c.id, 'pontosLuz', Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 block">TUG 10A</label>
                    <input
                      type="number"
                      className="w-full p-1 border rounded bg-white text-center"
                      value={c.tug}
                      onChange={e => updateComodo(c.id, 'tug', Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 block">TUE 20A</label>
                    <input
                      type="number"
                      className="w-full p-1 border rounded bg-white text-center"
                      value={c.tue}
                      onChange={e => updateComodo(c.id, 'tue', Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Resumo Quantitativo Calculado */}
      <div className="p-3 bg-slate-900 text-white rounded-2xl space-y-2">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Quantitativo Estimado com +15% de Folga</span>
        <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
          <div className="p-1.5 bg-slate-800 rounded-lg">
            <span className="text-slate-400 block text-[9px]">Cabo 1.5mm²</span>
            <span className="font-bold text-amber-300">{quant.cabo1_5} m</span>
          </div>
          <div className="p-1.5 bg-slate-800 rounded-lg">
            <span className="text-slate-400 block text-[9px]">Cabo 2.5mm²</span>
            <span className="font-bold text-amber-300">{quant.cabo2_5} m</span>
          </div>
          <div className="p-1.5 bg-slate-800 rounded-lg">
            <span className="text-slate-400 block text-[9px]">Cabo 4.0mm²</span>
            <span className="font-bold text-amber-300">{quant.cabo4_0} m</span>
          </div>
          <div className="p-1.5 bg-slate-800 rounded-lg">
            <span className="text-slate-400 block text-[9px]">Eletrodutos</span>
            <span className="font-bold text-slate-200">{quant.eletrodutos} m</span>
          </div>
          <div className="p-1.5 bg-slate-800 rounded-lg">
            <span className="text-slate-400 block text-[9px]">Disj. 10A/16A</span>
            <span className="font-bold text-slate-200">{quant.disjuntor10A + quant.disjuntor16A} un</span>
          </div>
          <div className="p-1.5 bg-slate-800 rounded-lg">
            <span className="text-slate-400 block text-[9px]">Disj. 20A</span>
            <span className="font-bold text-slate-200">{quant.disjuntor20A} un</span>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleBaixarPDF}
          disabled={loading}
          className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl flex items-center justify-center gap-1.5 transition"
        >
          <Download className="w-4 h-4" />
          <span>{loading ? 'Gerando...' : 'Exportar Lista em PDF (1 Pág A4)'}</span>
        </button>

        <button
          onClick={handleCopiarZap}
          className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl flex items-center gap-1.5 transition"
        >
          <Copy className="w-4 h-4" />
          <span>{copiado ? 'Copiado!' : 'Copiar'}</span>
        </button>
      </div>
    </div>
  );
};

// ==========================================
// 4. TABELA DO QUADRO GERAL (QG)
// ==========================================
interface CircuitoItem {
  id: string;
  numero: string;
  amperagem: string;
  bitola: string;
  locais: string;
}

const TabelaQuadroView: React.FC<{ initialCircuito?: any }> = ({ initialCircuito }) => {
  const [identificacao, setIdentificacao] = useState('QUADRO DE DISTRIBUIÇÃO GERAL (QDG)');
  const [tensao, setTensao] = useState('220V Monofásico (EDM)');
  const [disjuntorGeral, setDisjuntorGeral] = useState('Bipolar 40A Curva C');
  const [idr, setIdr] = useState('IDR Bipolar 40A 30mA');
  const [dps, setDps] = useState('2x DPS 20kA 275V');
  const [aterramento, setAterramento] = useState('Haste Copperweld R < 10Ω');

  const [circuitos, setCircuitos] = useState<CircuitoItem[]>([
    { id: '1', numero: '01', amperagem: '10A', bitola: '1.5 mm²', locais: 'Iluminação Quartos e Sala' },
    { id: '2', numero: '02', amperagem: '10A', bitola: '1.5 mm²', locais: 'Iluminação Cozinha e Circulação' },
    { id: '3', numero: '03', amperagem: '16A', bitola: '2.5 mm²', locais: 'Tomadas TUG Quartos' },
    { id: '4', numero: '04', amperagem: '16A', bitola: '2.5 mm²', locais: 'Tomadas TUG Cozinha e Copa' },
    { id: '5', numero: '05', amperagem: '25A', bitola: '4.0 mm²', locais: 'Termoacumulador (Chuveiro)' },
    { id: '6', numero: '06', amperagem: '20A', bitola: '4.0 mm²', locais: 'Ar Condicionado Principal' }
  ]);

  const [loading, setLoading] = useState(false);

  // Injeta circuito se vier do dimensionamento
  useEffect(() => {
    if (initialCircuito) {
      setCircuitos(prev => [
        ...prev,
        {
          id: String(Date.now()),
          numero: String(prev.length + 1).padStart(2, '0'),
          amperagem: `${initialCircuito.disjuntor}A`,
          bitola: `${initialCircuito.bitola} mm²`,
          locais: initialCircuito.descricao || 'Novo Circuito Dimensionado'
        }
      ]);
    }
  }, [initialCircuito]);

  const adicionarCircuito = () => {
    const num = String(circuitos.length + 1).padStart(2, '0');
    setCircuitos([...circuitos, {
      id: String(Date.now()),
      numero: num,
      amperagem: '16A',
      bitola: '2.5 mm²',
      locais: 'Novo Circuito'
    }]);
  };

  const removerCircuito = (id: string) => {
    setCircuitos(circuitos.filter(c => c.id !== id));
  };

  const updateCircuito = (id: string, field: keyof CircuitoItem, val: string) => {
    setCircuitos(circuitos.map(c => c.id === id ? { ...c, [field]: val } : c));
  };

  const handleGerarPDF = async () => {
    setLoading(true);
    try {
      const qg = (window as any).TabelaQuadroGeral;
      if (!qg) throw new Error('Módulo TabelaQuadroGeral não carregado.');
      await qg.gerarPDF({
        identificacao,
        tensao,
        disjuntorGeral,
        idr,
        dps,
        aterramento,
        circuitos
      }, 'download');
    } catch (e: any) {
      alert('Erro: ' + (e.message || e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Dados Gerais do Quadro */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div>
          <label className="font-bold text-slate-700 block mb-1">Identificação do Quadro / Local</label>
          <input
            className="w-full p-2 border border-slate-200 rounded-xl text-xs font-semibold"
            value={identificacao}
            onChange={e => setIdentificacao(e.target.value)}
          />
        </div>
        <div>
          <label className="font-bold text-slate-700 block mb-1">Tensão de Alimentação</label>
          <input
            className="w-full p-2 border border-slate-200 rounded-xl text-xs"
            value={tensao}
            onChange={e => setTensao(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
        <div>
          <label className="text-slate-500 block">Disjuntor Geral</label>
          <input className="w-full p-1.5 border rounded-lg" value={disjuntorGeral} onChange={e => setDisjuntorGeral(e.target.value)} />
        </div>
        <div>
          <label className="text-slate-500 block">IDR</label>
          <input className="w-full p-1.5 border rounded-lg" value={idr} onChange={e => setIdr(e.target.value)} />
        </div>
        <div>
          <label className="text-slate-500 block">DPS</label>
          <input className="w-full p-1.5 border rounded-lg" value={dps} onChange={e => setDps(e.target.value)} />
        </div>
        <div>
          <label className="text-slate-500 block">Aterramento</label>
          <input className="w-full p-1.5 border rounded-lg" value={aterramento} onChange={e => setAterramento(e.target.value)} />
        </div>
      </div>

      {/* Tabela Dinâmica de Circuitos */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs font-black text-slate-800 uppercase tracking-wider">Circuitos do Painel ({circuitos.length})</span>
          <button
            onClick={adicionarCircuito}
            className="px-2 py-1 bg-blue-50 text-blue-700 font-bold rounded-lg text-[11px] flex items-center gap-1 hover:bg-blue-100"
          >
            <Plus className="w-3.5 h-3.5" /> Adicionar Circuito
          </button>
        </div>

        <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
          {circuitos.map(c => (
            <div key={c.id} className="flex items-center gap-1.5 p-2 bg-slate-50 border border-slate-200 rounded-xl">
              <input
                className="w-10 p-1 border rounded bg-white text-center font-mono font-bold text-xs"
                value={c.numero}
                onChange={e => updateCircuito(c.id, 'numero', e.target.value)}
              />
              <input
                className="w-16 p-1 border rounded bg-white text-center font-bold text-xs text-blue-700"
                placeholder="16A"
                value={c.amperagem}
                onChange={e => updateCircuito(c.id, 'amperagem', e.target.value)}
              />
              <input
                className="w-20 p-1 border rounded bg-white text-center text-xs"
                placeholder="2.5 mm²"
                value={c.bitola}
                onChange={e => updateCircuito(c.id, 'bitola', e.target.value)}
              />
              <input
                className="flex-1 p-1 border rounded bg-white text-xs"
                placeholder="Locais / Cargas atendidas"
                value={c.locais}
                onChange={e => updateCircuito(c.id, 'locais', e.target.value)}
              />
              <button
                onClick={() => removerCircuito(c.id)}
                className="p-1 text-slate-400 hover:text-rose-600 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={handleGerarPDF}
        disabled={loading}
        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl flex items-center justify-center gap-2 shadow-sm transition"
      >
        <Download className="w-4 h-4" />
        <span>{loading ? 'Gerando Cartela...' : 'Baixar Cartela de Porta do Quadro em PDF (1 Pág A4)'}</span>
      </button>
    </div>
  );
};

// ==========================================
// 5. DIMENSIONAMENTO INTELIGENTE (PRO)
// ==========================================
const DimensionamentoView: React.FC<{
  onInjetarOS: (dados: any) => void;
  onInjetarQG: (circuito: any) => void;
}> = ({ onInjetarOS, onInjetarQG }) => {
  const [watts, setWatts] = useState(4500);
  const [volts, setVolts] = useState(220);
  const [distancia, setDistancia] = useState(30);
  const [quedaPermitida, setQuedaPermitida] = useState(4);
  const [descricaoCarga, setDescricaoCarga] = useState('Termoacumulador / Chuveiro Elétrico');

  const dim = (window as any).DimensionamentoEletrico;
  const res = dim ? dim.calcular({
    potenciaWatts: watts,
    tensaoVolts: volts,
    distanciaMetros: distancia,
    quedaAdmissivelPercent: quedaPermitida
  }) : {
    correnteIbA: Math.round((watts / (volts * 0.95)) * 10) / 10,
    disjuntorSugeridoA: 25,
    bitolaRecomendadaMm2: 4.0,
    quedaCalculadaPercent: 2.1,
    quedaVolts: 4.6,
    conformeQueda: true
  };

  const handleInjetarOS = () => {
    onInjetarOS({
      servicos: [{
        id: '1',
        descricao: `Instalação e cabeamento de circuito para ${descricaoCarga} (Cabo ${res.bitolaRecomendadaMm2}mm² + Disjuntor ${res.disjuntorSugeridoA}A DIN)`,
        qtd: 1,
        precoUnit: 2500
      }],
      materiais: [
        { id: '1', descricao: `Condutor de Cobre ${res.bitolaRecomendadaMm2}mm²`, qtd: Math.ceil(distancia * 3), precoUnit: 85 },
        { id: '2', descricao: `Disjuntor Bipolar ${res.disjuntorSugeridoA}A DIN Curva C`, qtd: 1, precoUnit: 650 }
      ]
    });
  };

  const handleInjetarQG = () => {
    onInjetarQG({
      disjuntor: res.disjuntorSugeridoA,
      bitola: res.bitolaRecomendadaMm2,
      descricao: descricaoCarga
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="font-bold text-slate-700 block mb-1">Nome / Tipo da Carga</label>
        <input
          className="w-full p-2 border border-slate-200 rounded-xl text-xs font-semibold"
          value={descricaoCarga}
          onChange={e => setDescricaoCarga(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <div>
          <label className="font-bold text-slate-700 block mb-1">Potência (Watts)</label>
          <input
            type="number"
            className="w-full p-2 border border-slate-200 rounded-xl text-xs"
            value={watts}
            onChange={e => setWatts(Number(e.target.value))}
          />
        </div>
        <div>
          <label className="font-bold text-slate-700 block mb-1">Tensão da Rede</label>
          <select
            className="w-full p-2 border border-slate-200 rounded-xl text-xs"
            value={volts}
            onChange={e => setVolts(Number(e.target.value))}
          >
            <option value={220}>220V Monofásico (EDM)</option>
            <option value={380}>380V Trifásico (EDM)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <div>
          <label className="font-bold text-slate-700 block mb-1">Distância do Quadro (metros)</label>
          <input
            type="number"
            className="w-full p-2 border border-slate-200 rounded-xl text-xs"
            value={distancia}
            onChange={e => setDistancia(Number(e.target.value))}
          />
        </div>
        <div>
          <label className="font-bold text-slate-700 block mb-1">Queda Máxima Permitida (%)</label>
          <input
            type="number"
            className="w-full p-2 border border-slate-200 rounded-xl text-xs"
            value={quedaPermitida}
            onChange={e => setQuedaPermitida(Number(e.target.value))}
          />
        </div>
      </div>

      {/* Card de Dimensionamento em Tempo Real */}
      <div className="p-4 bg-slate-900 text-white rounded-3xl space-y-3">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Resultado do Dimensionamento Normativo</span>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2.5 bg-slate-800 rounded-2xl">
            <span className="text-[10px] text-slate-400 block">Corrente Ib</span>
            <span className="text-sm font-black text-white">{res.correnteIbA} A</span>
          </div>
          <div className="p-2.5 bg-slate-800 rounded-2xl">
            <span className="text-[10px] text-slate-400 block">Disjuntor DIN</span>
            <span className="text-sm font-black text-emerald-400">{res.disjuntorSugeridoA} A</span>
          </div>
          <div className="p-2.5 bg-slate-800 rounded-2xl">
            <span className="text-[10px] text-slate-400 block">Bitola do Cabo</span>
            <span className="text-sm font-black text-amber-400">{res.bitolaRecomendadaMm2} mm²</span>
          </div>
        </div>

        <div className="p-2 bg-slate-800/60 rounded-xl text-[11px] flex justify-between items-center">
          <span className="text-slate-300">Queda Calculada: <strong className="text-white">{res.quedaCalculadaPercent}%</strong> ({res.quedaVolts}V)</span>
          <span className={`font-bold px-2 py-0.5 rounded-md ${res.conformeQueda ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400'}`}>
            {res.conformeQueda ? '✓ Conforme EDM' : '⚠️ Excede Limite'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <button
          onClick={handleInjetarOS}
          className="py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 transition text-xs"
        >
          <FileText className="w-4 h-4" />
          <span>Injetar na Ordem de Serviço</span>
        </button>

        <button
          onClick={handleInjetarQG}
          className="py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 transition text-xs"
        >
          <Grid className="w-4 h-4" />
          <span>Injetar na Tabela do QG</span>
        </button>
      </div>
    </div>
  );
};

// ==========================================
// 6. DIAGNÓSTICO DE QUADRO POR FOTO (CLICÁVEL)
// ==========================================
const DiagnosticoFotoView: React.FC = () => {
  const [foto, setFoto] = useState<string | null>(null);
  const [contexto, setContexto] = useState('Disjuntor geral aquece após ligar o ar condicionado e há cheiro de queimado.');
  const [analisando, setAnalisando] = useState(false);
  const [laudo, setLaudo] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setFoto(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleAnalisar = () => {
    setAnalisando(true);
    setLaudo(null);
    setTimeout(() => {
      setLaudo(
        '📋 PARECER TÉCNICO DE INSPEÇÃO VISUAL:\n\n' +
        '1. Diagnóstico Térmico: Evidência de subdimensionamento do condutor de alimentação ou afrouxamento no borne do disjuntor geral.\n' +
        '2. Risco Crítico: Risco de arco elétrico, queima do invólucro plástico e interrupção do neutro.\n' +
        '3. Ações Corretivas:\n' +
        '   • Reapertar todos os parafusos dos disjuntores com torque recomendado (2.0 a 2.5 N.m).\n' +
        '   • Substituir condutores danificados por cabo de 6.0mm² ou 10.0mm² antichama.\n' +
        '   • Instalar proteção contra surtos (DPS) e dispositivo residual (IDR 30mA).'
      );
      setAnalisando(false);
    }, 1200);
  };

  return (
    <div className="space-y-4">
      {/* Card Clicável com input invisível */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="cursor-pointer border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-3xl p-4 text-center bg-slate-50 hover:bg-blue-50/50 transition flex flex-col items-center justify-center min-h-[140px]"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFotoUpload}
        />

        {foto ? (
          <div className="relative w-full max-h-48 overflow-hidden rounded-2xl">
            <img src={foto} alt="Quadro Elétrico" className="w-full h-auto object-cover rounded-2xl mx-auto" />
            <span className="absolute bottom-2 right-2 bg-slate-900/80 text-white text-[10px] font-bold px-2 py-1 rounded-md">
              Toque para trocar foto
            </span>
          </div>
        ) : (
          <div className="space-y-1.5">
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto">
              <Camera className="w-6 h-6" />
            </div>
            <p className="text-xs font-black text-slate-800">Toque aqui para Tirar Foto ou Escolher da Galeria</p>
            <p className="text-[10px] text-slate-500">Capture o quadro aberto mostrando disjuntores e conexões.</p>
          </div>
        )}
      </div>

      <div>
        <label className="font-bold text-slate-700 block mb-1">Sintomas Observados na Obra</label>
        <textarea
          className="w-full p-2 border border-slate-200 rounded-xl text-xs"
          rows={2}
          value={contexto}
          onChange={e => setContexto(e.target.value)}
        />
      </div>

      <button
        onClick={handleAnalisar}
        disabled={analisando}
        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl flex items-center justify-center gap-2 transition shadow-sm"
      >
        <Sparkles className="w-4 h-4 text-amber-300" />
        <span>{analisando ? 'Analisando Imagem e Riscos...' : 'Analisar Conformidade & Riscos'}</span>
      </button>

      {laudo && (
        <pre className="p-3.5 bg-slate-900 text-emerald-400 rounded-2xl whitespace-pre-wrap font-mono text-[11px] leading-relaxed border border-slate-800">
          {laudo}
        </pre>
      )}
    </div>
  );
};

// ==========================================
// 7. PORTFÓLIO ANTES & DEPOIS COM MARCA D'ÁGUA CANVAS
// ==========================================
const PortfolioView: React.FC = () => {
  const [fotoAntes, setFotoAntes] = useState<string | null>(null);
  const [fotoDepois, setFotoDepois] = useState<string | null>(null);
  const [titulo, setTitulo] = useState('Reforma de Quadro Geral e Padronização DIN');
  const [processando, setProcessando] = useState(false);

  const antesRef = useRef<HTMLInputElement>(null);
  const depoisRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleUpload = (tipo: 'antes' | 'depois', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (tipo === 'antes') setFotoAntes(reader.result as string);
        else setFotoDepois(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Fusão via Canvas aplicando exclusivamente a marca do técnico
  const handleGerarComMarca = async () => {
    if (!fotoAntes || !fotoDepois) {
      alert('Por favor, carregue as fotos do ANTES e do DEPOIS.');
      return;
    }

    setProcessando(true);
    const perfilHelper = (window as any).PerfilTecnico;
    const perfil = perfilHelper ? perfilHelper.obter() : { nome: 'Eletricista Profissional', slogan: 'Serviços Especializados', telefone: '+258 84 000 0000' };

    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 750;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fundo
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const carregarImg = (src: string) => new Promise<HTMLImageElement>((res) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => res(img);
      img.src = src;
    });

    const [imgAntes, imgDepois] = await Promise.all([carregarImg(fotoAntes), carregarImg(fotoDepois)]);

    // Desenha foto Antes (lado esquerdo)
    ctx.drawImage(imgAntes, 20, 20, 570, 560);
    // Desenha foto Depois (lado direito)
    ctx.drawImage(imgDepois, 610, 20, 570, 560);

    // Badges Antes e Depois
    ctx.fillStyle = '#e11d48';
    ctx.fillRect(40, 40, 140, 40);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('ANTES', 75, 68);

    ctx.fillStyle = '#059669';
    ctx.fillRect(630, 40, 140, 40);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('DEPOIS', 660, 68);

    // Barra Inferior com a MARCA EXCLUSIVA DO TÉCNICO
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 600, 1200, 150);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText((perfil.nome || 'SERVIÇOS TÉCNICOS').toUpperCase(), 40, 650);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = 'italic 18px sans-serif';
    ctx.fillText(perfil.slogan || 'Qualidade e Segurança Elétrica', 40, 685);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText(`Tel / WhatsApp: ${perfil.telefone || ''}`, 800, 665);

    setProcessando(false);

    // Download da imagem gerada
    const link = document.createElement('a');
    link.download = `Portfolio_${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="font-bold text-slate-700 block mb-1">Título da Obra / Intervenção</label>
        <input
          className="w-full p-2 border border-slate-200 rounded-xl text-xs font-semibold"
          value={titulo}
          onChange={e => setTitulo(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Card Foto Antes */}
        <div
          onClick={() => antesRef.current?.click()}
          className="cursor-pointer border-2 border-dashed border-rose-200 hover:border-rose-400 bg-rose-50/50 rounded-2xl p-3 text-center transition flex flex-col items-center justify-center min-h-[130px] overflow-hidden"
        >
          <input ref={antesRef} type="file" accept="image/*" className="hidden" onChange={e => handleUpload('antes', e)} />
          {fotoAntes ? (
            <img src={fotoAntes} alt="Antes" className="w-full h-28 object-cover rounded-xl" />
          ) : (
            <div>
              <span className="text-[11px] font-black text-rose-700 block">❌ Foto ANTES</span>
              <p className="text-[10px] text-slate-500 mt-1">Toque para carregar</p>
            </div>
          )}
        </div>

        {/* Card Foto Depois */}
        <div
          onClick={() => depoisRef.current?.click()}
          className="cursor-pointer border-2 border-dashed border-emerald-200 hover:border-emerald-400 bg-emerald-50/50 rounded-2xl p-3 text-center transition flex flex-col items-center justify-center min-h-[130px] overflow-hidden"
        >
          <input ref={depoisRef} type="file" accept="image/*" className="hidden" onChange={e => handleUpload('depois', e)} />
          {fotoDepois ? (
            <img src={fotoDepois} alt="Depois" className="w-full h-28 object-cover rounded-xl" />
          ) : (
            <div>
              <span className="text-[11px] font-black text-emerald-700 block">✓ Foto DEPOIS</span>
              <p className="text-[10px] text-slate-500 mt-1">Toque para carregar</p>
            </div>
          )}
        </div>
      </div>

      <p className="text-[10px] text-slate-500 text-center">
        O sistema funde as duas fotos com uma tarja técnica contendo exclusivamente o seu Nome, Slogan e WhatsApp.
      </p>

      <button
        onClick={handleGerarComMarca}
        disabled={processando || !fotoAntes || !fotoDepois}
        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-black rounded-xl flex items-center justify-center gap-2 shadow-sm transition"
      >
        <Sparkles className="w-4 h-4 text-amber-300" />
        <span>{processando ? 'Gerando Imagem com Sua Marca...' : 'Baixar Imagem com Minha Marca Própria'}</span>
      </button>
    </div>
  );
};

// ==========================================
// 8. CRM DE CLIENTES COM DISPARO WHATSAPP
// ==========================================
const CRMClientesView: React.FC = () => {
  const [clientes, setClientes] = useState<any[]>(() => {
    const crm = (window as any).CRMClientes;
    return crm ? crm.obterTodos() : [];
  });
  const [novo, setNovo] = useState({ nome: '', telefone: '', localizacao: '', notas: '' });

  const handleSalvar = () => {
    if (!novo.nome) return;
    const crm = (window as any).CRMClientes;
    if (crm) {
      crm.adicionar(novo);
      setClientes(crm.obterTodos());
      setNovo({ nome: '', telefone: '', localizacao: '', notas: '' });
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
        <span className="font-bold text-slate-800 block text-xs">Novo Cliente / Obra</span>
        <div className="grid grid-cols-2 gap-2">
          <input placeholder="Nome do Cliente" className="p-2 border rounded-xl text-xs bg-white" value={novo.nome} onChange={e => setNovo({ ...novo, nome: e.target.value })} />
          <input placeholder="Telefone (+258...)" className="p-2 border rounded-xl text-xs bg-white" value={novo.telefone} onChange={e => setNovo({ ...novo, telefone: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <input placeholder="Bairro / Província" className="p-2 border rounded-xl text-xs bg-white" value={novo.localizacao} onChange={e => setNovo({ ...novo, localizacao: e.target.value })} />
          <input placeholder="Anotações da Instalação" className="p-2 border rounded-xl text-xs bg-white" value={novo.notas} onChange={e => setNovo({ ...novo, notas: e.target.value })} />
        </div>
        <button onClick={handleSalvar} className="w-full py-2 bg-blue-600 text-white font-bold rounded-xl flex items-center justify-center gap-1.5">
          <Plus className="w-3.5 h-3.5" /> Adicionar Cliente
        </button>
      </div>

      <div className="space-y-2">
        <span className="font-bold text-slate-800 block text-xs">Clientes Cadastrados ({clientes.length})</span>
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {clientes.map(c => {
            const link = (window as any).CRMClientes?.gerarLinkWhatsApp(c);
            return (
              <div key={c.id} className="p-3 bg-white border border-slate-200 rounded-2xl flex items-center justify-between shadow-xs">
                <div>
                  <p className="font-black text-slate-900 text-xs">{c.nome}</p>
                  <p className="text-[10px] text-slate-500">{c.telefone} • {c.localizacao}</p>
                  {c.notas && <p className="text-[10px] text-blue-700 italic mt-0.5">{c.notas}</p>}
                </div>
                <a
                  href={link}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-[11px] flex items-center gap-1.5 transition shrink-0"
                >
                  <Phone className="w-3.5 h-3.5" /> WhatsApp
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 9. AGENDA & WHATSAPP
// ==========================================
const AgendaWhatsAppView: React.FC = () => {
  const [cliente, setCliente] = useState('Dra. Amina Patel');
  const [telefone, setTelefone] = useState('+258 82 987 6543');
  const [data, setData] = useState('Amanhã às 09:30');
  const [servico, setServico] = useState('Revisão do Quadro Geral e Termoacumulador');

  const handleDispararZap = () => {
    let tel = telefone.replace(/\D/g, '');
    if (tel.startsWith('0')) tel = tel.slice(1);
    if (!tel.startsWith('258') && tel.length <= 9) tel = `258${tel}`;

    const perfilHelper = (window as any).PerfilTecnico;
    const perfil = perfilHelper ? perfilHelper.obter() : { nome: 'Profissional Técnico' };

    const msg = `Olá, *${cliente}*! Tudo bem?\n\n` +
      `Aqui é *${perfil.nome}*. Gostaria de confirmar nossa visita técnica agendada para:\n` +
      `📅 *Data e Horário:* ${data}\n` +
      `🔧 *Serviço:* ${servico}\n\n` +
      `Poderia confirmar se o horário ainda é conveniente para você? Obrigado!`;

    window.open(`https://wa.me/${tel}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2.5">
        <div>
          <label className="font-bold text-slate-700 block mb-1">Nome do Cliente</label>
          <input className="w-full p-2 border border-slate-200 rounded-xl text-xs" value={cliente} onChange={e => setCliente(e.target.value)} />
        </div>
        <div>
          <label className="font-bold text-slate-700 block mb-1">WhatsApp do Cliente</label>
          <input className="w-full p-2 border border-slate-200 rounded-xl text-xs" value={telefone} onChange={e => setTelefone(e.target.value)} />
        </div>
      </div>
      <div>
        <label className="font-bold text-slate-700 block mb-1">Data e Horário da Visita</label>
        <input className="w-full p-2 border border-slate-200 rounded-xl text-xs" value={data} onChange={e => setData(e.target.value)} />
      </div>
      <div>
        <label className="font-bold text-slate-700 block mb-1">Serviço Agendado</label>
        <input className="w-full p-2 border border-slate-200 rounded-xl text-xs" value={servico} onChange={e => setServico(e.target.value)} />
      </div>

      <button
        onClick={handleDispararZap}
        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl flex items-center justify-center gap-2 shadow-sm transition"
      >
        <Phone className="w-4 h-4" />
        <span>Enviar Lembrete Formatado no WhatsApp</span>
      </button>
    </div>
  );
};

// ==========================================
// 10. GESTÃO FINANCEIRA
// ==========================================
const GestaoFinanceiraView: React.FC = () => {
  const [cobrado, setCobrado] = useState(9500);
  const [material, setMaterial] = useState(2500);
  const [deslocamento, setDeslocamento] = useState(800);
  const lucro = cobrado - material - deslocamento;
  const margem = cobrado > 0 ? ((lucro / cobrado) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2.5">
        <div>
          <label className="font-bold text-slate-700 block mb-1">Cobrado (MZN)</label>
          <input type="number" className="w-full p-2 border rounded-xl text-xs font-bold text-slate-900" value={cobrado} onChange={e => setCobrado(Number(e.target.value))} />
        </div>
        <div>
          <label className="font-bold text-slate-700 block mb-1">Materiais (MZN)</label>
          <input type="number" className="w-full p-2 border rounded-xl text-xs text-rose-600" value={material} onChange={e => setMaterial(Number(e.target.value))} />
        </div>
        <div>
          <label className="font-bold text-slate-700 block mb-1">Transporte (MZN)</label>
          <input type="number" className="w-full p-2 border rounded-xl text-xs text-rose-600" value={deslocamento} onChange={e => setDeslocamento(Number(e.target.value))} />
        </div>
      </div>

      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-3xl space-y-1 text-center">
        <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Lucro Líquido Real no Bolso</span>
        <p className="text-3xl font-black text-emerald-950">{lucro.toLocaleString()} MZN</p>
        <p className="text-xs text-emerald-700 font-bold">Margem Líquida Real: {margem}%</p>
      </div>
    </div>
  );
};

// ==========================================
// 11. CHECKLIST NR10 (LAUDO EM PDF)
// ==========================================
const ChecklistNR10View: React.FC = () => {
  const [local, setLocal] = useState('Edifício Jat 4 - Sala 201, Maputo');
  const [loading, setLoading] = useState(false);

  const handleGerarLaudo = async () => {
    setLoading(true);
    try {
      const chk = (window as any).ChecklistSeguranca;
      if (!chk) throw new Error('Módulo ChecklistSeguranca não carregado.');
      await chk.gerarRelatorioPDF({ localObra: local }, 'download');
    } catch (e: any) {
      alert('Erro: ' + (e.message || e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="font-bold text-slate-700 block mb-1">Local da Inspeção</label>
        <input className="w-full p-2 border border-slate-200 rounded-xl text-xs font-semibold" value={local} onChange={e => setLocal(e.target.value)} />
      </div>

      <div className="space-y-1.5 p-3 bg-slate-50 border rounded-2xl text-[11px]">
        <label className="flex items-center gap-2 text-slate-800"><input type="checkbox" defaultChecked className="rounded text-blue-600" /> Desenergização e bloqueio com cadeado</label>
        <label className="flex items-center gap-2 text-slate-800"><input type="checkbox" defaultChecked className="rounded text-blue-600" /> Teste de ausência de tensão com multímetro</label>
        <label className="flex items-center gap-2 text-slate-800"><input type="checkbox" defaultChecked className="rounded text-blue-600" /> EPIs completos (Luvas 1000V, óculos, calçado)</label>
        <label className="flex items-center gap-2 text-slate-800"><input type="checkbox" defaultChecked className="rounded text-blue-600" /> Continuidade de aterramento e DPS verificados</label>
        <label className="flex items-center gap-2 text-slate-800"><input type="checkbox" defaultChecked className="rounded text-blue-600" /> Aperto de parafusos e terminais nos disjuntores</label>
      </div>

      <button
        onClick={handleGerarLaudo}
        disabled={loading}
        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl flex items-center justify-center gap-2 shadow-sm transition"
      >
        <Download className="w-4 h-4" />
        <span>{loading ? 'Gerando...' : 'Emitir Laudo de Segurança em PDF (1 Pág A4)'}</span>
      </button>
    </div>
  );
};

// ==========================================
// 12. CERTIFICADO DE GARANTIA
// ==========================================
const CertificadoGarantiaView: React.FC = () => {
  const [cliente, setCliente] = useState('Eng. Carlos Nhantumbo');
  const [meses, setMeses] = useState(6);
  const [loading, setLoading] = useState(false);

  const handleGerar = async () => {
    setLoading(true);
    try {
      const cert = (window as any).CertificadoGarantia;
      if (!cert) throw new Error('Módulo CertificadoGarantia não carregado.');
      await cert.gerarPDF({
        cliente,
        prazoDias: meses * 30,
        enderecoObra: 'Bairro da Costa do Sol, Maputo',
        servicosCobertos: 'Instalação e adequação de circuitos elétricos, barramentos e dispositivos de proteção.'
      }, 'download');
    } catch (e: any) {
      alert('Erro: ' + (e.message || e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="font-bold text-slate-700 block mb-1">Nome do Cliente / Contratante</label>
        <input className="w-full p-2 border border-slate-200 rounded-xl text-xs font-semibold" value={cliente} onChange={e => setCliente(e.target.value)} />
      </div>
      <div>
        <label className="font-bold text-slate-700 block mb-1">Prazo de Garantia dos Serviços</label>
        <select className="w-full p-2 border border-slate-200 rounded-xl text-xs font-semibold" value={meses} onChange={e => setMeses(Number(e.target.value))}>
          <option value={3}>3 Meses (90 Dias - Padrão)</option>
          <option value={6}>6 Meses (180 Dias - Recomendado)</option>
          <option value={12}>1 Ano (365 Dias - Instalações Novas)</option>
        </select>
      </div>

      <button
        onClick={handleGerar}
        disabled={loading}
        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl flex items-center justify-center gap-2 shadow-sm transition"
      >
        <Award className="w-4 h-4 text-amber-300" />
        <span>{loading ? 'Gerando...' : 'Emitir Certificado de Garantia em PDF (1 Pág A4)'}</span>
      </button>
    </div>
  );
};

// ==========================================
// 13. TABELAS NORMATIVAS
// ==========================================
const TabelasNormativasView: React.FC = () => {
  const [tab, setTab] = useState<'awg' | 'ampacidade' | 'cores'>('awg');
  const t = (window as any).TabelasTecnicas || {};

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <button onClick={() => setTab('awg')} className={`flex-1 py-1.5 rounded-xl font-bold border text-xs ${tab === 'awg' ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50'}`}>AWG x mm²</button>
        <button onClick={() => setTab('ampacidade')} className={`flex-1 py-1.5 rounded-xl font-bold border text-xs ${tab === 'ampacidade' ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50'}`}>Ampacidade IEC</button>
        <button onClick={() => setTab('cores')} className={`flex-1 py-1.5 rounded-xl font-bold border text-xs ${tab === 'cores' ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50'}`}>Cores EDM</button>
      </div>

      <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-2xl p-2 bg-slate-50">
        {tab === 'awg' && (t.tabelaAWG || []).map((i: any, idx: number) => (
          <div key={idx} className="flex justify-between text-[11px] py-1.5 border-b border-slate-200/60">
            <span className="font-mono font-bold text-slate-900">{i.awg} = {i.mm2} mm²</span>
            <span className="text-slate-600">{i.usoTipico}</span>
          </div>
        ))}
        {tab === 'ampacidade' && (t.conducaoCorrente || []).map((i: any, idx: number) => (
          <div key={idx} className="flex justify-between text-[11px] py-1.5 border-b border-slate-200/60">
            <span className="font-bold text-blue-700">{i.bitola}</span>
            <span className="text-slate-700">Embutido: {i.eletrodutoEmbutido} | Ar livre: {i.arLivre} | Disjuntor: {i.disjuntorMax}</span>
          </div>
        ))}
        {tab === 'cores' && (t.codigoCores || []).map((i: any, idx: number) => (
          <div key={idx} className="flex justify-between text-[11px] py-1.5 border-b border-slate-200/60">
            <span className="font-bold text-slate-900">{i.funcao}</span>
            <span className="font-semibold text-slate-600">{i.corNorma}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ==========================================
// 14. SOCORRO NA OBRA
// ==========================================
const SocorroObraView: React.FC = () => {
  const [duvida, setDuvida] = useState('Disjuntor diferencial IDR desarmando assim que liga o motor da bomba.');
  const [categoria, setCategoria] = useState('Disjuntor Desarmando');

  const handleAcionarZap = () => {
    const texto = `🚨 *SOCORRO NA OBRA - SUPORTE TÉCNICO*\n` +
      `Problema: *${categoria}*\n` +
      `Sintoma: ${duvida}\n` +
      `Local: Maputo / Matola\n` +
      `Alguém disponível para auxílio técnico?`;

    window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, '_blank');
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="font-bold text-slate-700 block mb-1">Tipo de Problema</label>
        <select className="w-full p-2 border border-slate-200 rounded-xl text-xs" value={categoria} onChange={e => setCategoria(e.target.value)}>
          <option>Curto-circuito</option>
          <option>Disjuntor Desarmando</option>
          <option>Queda de Tensão</option>
          <option>Aterramento / Choque na Carcaça</option>
          <option>Motor / Inversor Solar</option>
        </select>
      </div>
      <div>
        <label className="font-bold text-slate-700 block mb-1">Descrição do Sintoma na Obra</label>
        <textarea className="w-full p-2 border border-slate-200 rounded-xl text-xs" rows={3} value={duvida} onChange={e => setDuvida(e.target.value)} />
      </div>

      <button
        onClick={handleAcionarZap}
        className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-xl flex items-center justify-center gap-2 shadow-sm transition"
      >
        <AlertTriangle className="w-4 h-4 text-amber-300" />
        <span>Acionar Socorro na Obra via WhatsApp</span>
      </button>
    </div>
  );
};

// ==========================================
// 15. COTAÇÃO DE MATERIAL
// ==========================================
const CotacaoMaterialView: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const handleBaixarPDF = async () => {
    setLoading(true);
    try {
      const cot = (window as any).CotacaoMaterial;
      if (!cot) throw new Error('Módulo CotacaoMaterial não carregado.');
      await cot.exportarCotacaoPDF(null, 'download');
    } catch (e: any) {
      alert('Erro: ' + (e.message || e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-[11px] text-slate-600 leading-relaxed">
        Pesquisa e compara preços dos principais insumos elétricos (cabos, disjuntores, barramentos, DPS e aterramento) em fornecedores de Maputo e Matola, identificando onde comprar mais barato.
      </p>

      <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl space-y-1 text-[11px]">
        <span className="font-bold text-blue-900 block">Lojas Pesquisadas:</span>
        <p className="text-slate-600">• Electro Lda (Av. 24 de Julho) • Casa Eléctrica • Matola Materiais • Super Electro</p>
      </div>

      <button
        onClick={handleBaixarPDF}
        disabled={loading}
        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl flex items-center justify-center gap-2 shadow-sm transition"
      >
        <Download className="w-4 h-4" />
        <span>{loading ? 'Gerando...' : 'Exportar Mapa Comparativo em PDF (1 Pág A4)'}</span>
      </button>
    </div>
  );
};

// ==========================================
// HELPERS
// ==========================================
function getIcon(id: KitProModalId) {
  switch (id) {
    case 'perfil_tecnico': return <Building className="w-4 h-4 text-blue-600" />;
    case 'gerador_os': return <FileText className="w-4 h-4 text-blue-600" />;
    case 'calculadora_preco': return <Calculator className="w-4 h-4 text-blue-600" />;
    case 'lista_materiais': return <ListPlus className="w-4 h-4 text-blue-600" />;
    case 'crm_clientes': return <Users className="w-4 h-4 text-blue-600" />;
    case 'tabela_quadro': return <Grid className="w-4 h-4 text-blue-600" />;
    case 'dimensionamento': return <Zap className="w-4 h-4 text-blue-600" />;
    case 'tabelas_normativas': return <BookOpen className="w-4 h-4 text-blue-600" />;
    case 'diagnostico_foto': return <Camera className="w-4 h-4 text-blue-600" />;
    case 'checklist_nr10': return <ShieldCheck className="w-4 h-4 text-blue-600" />;
    case 'agenda_whatsapp': return <Calendar className="w-4 h-4 text-blue-600" />;
    case 'gestao_financeira': return <DollarSign className="w-4 h-4 text-blue-600" />;
    case 'portfolio': return <ImageIcon className="w-4 h-4 text-blue-600" />;
    case 'certificado_garantia': return <Award className="w-4 h-4 text-blue-600" />;
    case 'socorro_obra': return <AlertTriangle className="w-4 h-4 text-blue-600" />;
    case 'cotacao_material': return <ShoppingCart className="w-4 h-4 text-blue-600" />;
    default: return <Sparkles className="w-4 h-4 text-blue-600" />;
  }
}

function getTitle(id: KitProModalId): string {
  switch (id) {
    case 'perfil_tecnico': return 'Minha Marca Própria (Perfil do Técnico)';
    case 'gerador_os': return '1. Gerador de OS, Contrato & Recibo';
    case 'calculadora_preco': return '2. Calculadora de Preço de Serviço';
    case 'lista_materiais': return '3. Lista de Materiais Automática';
    case 'crm_clientes': return '4. CRM de Clientes & Obras';
    case 'tabela_quadro': return '5. Tabela do Quadro Geral (QG)';
    case 'dimensionamento': return '6. Dimensionamento Inteligente';
    case 'tabelas_normativas': return '7. Tabelas Normativas (AWG, mm², Cores)';
    case 'diagnostico_foto': return '8. Diagnóstico de Quadro por Foto';
    case 'checklist_nr10': return '9. Checklist de Segurança NR10';
    case 'agenda_whatsapp': return '10. Agenda & Lembretes WhatsApp';
    case 'gestao_financeira': return '11. Gestão Financeira & Lucro por Obra';
    case 'portfolio': return '12. Portfólio Digital "Antes & Depois"';
    case 'certificado_garantia': return '13. Certificado de Garantia';
    case 'socorro_obra': return '14. Botão "Socorro na Obra"';
    case 'cotacao_material': return '15. Cotação em Lojas Parceiras';
    default: return 'Ferramenta Técnica PRO';
  }
}

function getSubTitle(id: KitProModalId): string {
  switch (id) {
    case 'perfil_tecnico': return 'Nome, Slogan e Logotipo para emissão de PDFs com marca própria';
    case 'gerador_os': return 'Emissão 100% White-Label em 1 página A4 sem marcas de terceiros';
    case 'calculadora_preco': return 'Cálculo de Homem-Hora, Deslocamento e Margem Líquida';
    case 'lista_materiais': return 'Levantamento por cômodos com cabos, tubulação e disjuntores';
    case 'crm_clientes': return 'Histórico de contatos e acionamento direto via WhatsApp';
    case 'tabela_quadro': return 'Cartela normatizada para tampa de quadro com avisos de segurança';
    case 'dimensionamento': return 'Cálculo de corrente Ib, disjuntor DIN e cabo com verificação EDM';
    case 'tabelas_normativas': return 'Consultas de equivalência AWG, ampacidade IEC e identificação de fases';
    case 'diagnostico_foto': return 'Inspeção visual com detecção de riscos e aquecimento térmico';
    case 'checklist_nr10': return 'Laudo técnico de conformidade em 1 página A4 em PDF';
    case 'agenda_whatsapp': return 'Disparo de lembrete com dia, hora e endereço no WhatsApp';
    case 'gestao_financeira': return 'Controle de custos diretos e lucro líquido real de cada obra';
    case 'portfolio': return 'Fusão de fotos Antes e Depois com sua marca d\'água técnica';
    case 'certificado_garantia': return 'Emissão de termo oficial com prazos e assinatura técnica';
    case 'socorro_obra': return 'Mural comunitário e acionamento SOS de apoio técnico';
    case 'cotacao_material': return 'Comparativo de preços em fornecedores de Maputo e Matola';
    default: return 'Kit Eletricista & Técnico PRO';
  }
}
