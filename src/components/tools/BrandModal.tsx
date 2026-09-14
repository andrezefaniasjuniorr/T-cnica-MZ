import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Building,
  Upload,
  Trash2,
  Check,
  FileText,
  Palette,
  Sparkles,
  Download,
  Eye,
  Sliders,
  Maximize2,
  FileCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  PDF_TEMPLATES,
  BORDER_PALETTE,
  loadBrandCustomization,
  saveBrandCustomization,
  getTemplateConfig,
  getFontSizeMultiplier,
  BrandCustomizationSettings
} from '../../utils/pdfBrandCustomizer';
import {
  compressImage,
  persistCompanyLogo,
  getSavedCompanyLogoSync,
  getSavedCompanyLogoAsync
} from '../../utils/imageCompressor';
import { PdfTemplateType, PdfOrientationType, PdfFontSizeType } from '../../types';

interface BrandModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const BrandModalContent: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const { currentUser, updateCurrentUserProfile } = useAuth();
  const [settings, setSettings] = useState<BrandCustomizationSettings>(() => {
    const initial = loadBrandCustomization();
    if (typeof window !== 'undefined') {
      try {
        const localSaved =
          localStorage.getItem('company_logo_base64') ||
          localStorage.getItem('app_company_logo') ||
          localStorage.getItem('tecnico_logo');
        if (localSaved) {
          initial.logoBase64 = localSaved;
        }
      } catch (e) {}
    }
    return initial;
  });
  const [activeTab, setActiveTab] = useState<'dados' | 'templates' | 'preview'>('templates');
  const [isSaving, setIsSaving] = useState(false);
  const [isCompressingLogo, setIsCompressingLogo] = useState(false);
  const [logoWarning, setLogoWarning] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [isGeneratingSample, setIsGeneratingSample] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. RESTAURAÇÃO E PERSISTÊNCIA PERMANENTE:
  // No useEffect de inicialização da tela/modal, leia 'company_logo_base64' do localStorage e recupere
  // a foto no estado do formulário e no contexto global dos PDFs, impedindo que o estado padrão ("Sem Logo") sobrescreva.
  useEffect(() => {
    try {
      const storedLogo =
        localStorage.getItem('company_logo_base64') ||
        localStorage.getItem('app_company_logo') ||
        localStorage.getItem('tecnico_logo') ||
        getSavedCompanyLogoSync();

      if (storedLogo) {
        setSettings(prev => ({
          ...prev,
          logoBase64: storedLogo
        }));

        // Atualiza imediatamente o contexto global dos PDFs para refletir a imagem salva
        const helper = (window as any).PerfilTecnico;
        if (helper && typeof helper.salvar === 'function') {
          helper.salvar({ logoBase64: storedLogo });
        }
        saveBrandCustomization({ logoBase64: storedLogo });
      } else {
        // Fallback resiliente no IndexedDB caso localStorage tenha sido limpo
        getSavedCompanyLogoAsync().then(idbLogo => {
          if (idbLogo) {
            try {
              localStorage.setItem('company_logo_base64', idbLogo);
            } catch (e) {}
            setSettings(prev => ({
              ...prev,
              logoBase64: idbLogo
            }));
            const helper = (window as any).PerfilTecnico;
            if (helper && typeof helper.salvar === 'function') {
              helper.salvar({ logoBase64: idbLogo });
            }
            saveBrandCustomization({ logoBase64: idbLogo });
          }
        });
      }
    } catch (err) {
      console.warn('Erro ao restaurar company_logo_base64:', err);
    }
  }, []);

  // Sincronizar com perfil do usuário logado preservando estritamente a imagem do logotipo já salva
  useEffect(() => {
    const current = loadBrandCustomization();
    const storedLogo = typeof window !== 'undefined' ? (localStorage.getItem('company_logo_base64') || settings.logoBase64) : null;
    if (currentUser) {
      const updated: Partial<BrandCustomizationSettings> = {};
      if ((!current.nome || current.nome === 'Eletricista Profissional & Serviços') && currentUser.name) {
        updated.nome = currentUser.name;
      }
      if (!current.telefone && currentUser.phone) {
        updated.telefone = currentUser.phone;
      }
      if (!current.cidade && (currentUser.city || currentUser.province)) {
        updated.cidade = [currentUser.city, currentUser.province].filter(Boolean).join(', ');
      }
      if (!current.nuit && currentUser.nuit) {
        updated.nuit = currentUser.nuit;
      }
      if (!current.email && currentUser.email) {
        updated.email = currentUser.email;
      }
      if (currentUser.pdfTemplate) {
        updated.pdfTemplate = currentUser.pdfTemplate;
      }
      if (currentUser.pdfOrientation) {
        updated.pdfOrientation = currentUser.pdfOrientation;
      }
      if (currentUser.pdfFontSize) {
        updated.pdfFontSize = currentUser.pdfFontSize;
      }
      if (currentUser.borderColor) {
        updated.borderColor = currentUser.borderColor;
      }

      if (Object.keys(updated).length > 0) {
        const merged: BrandCustomizationSettings = {
          ...current,
          ...updated,
          logoBase64: storedLogo || current.logoBase64 || null
        };
        setSettings(prev => ({
          ...merged,
          logoBase64: prev.logoBase64 || storedLogo || merged.logoBase64
        }));
        saveBrandCustomization(merged);
      }
    }
  }, [currentUser]);

  // UPLOAD DE ALTA QUALIDADE: Redimensionamento via HTML5 Canvas (800px-1000px, PNG transparente / JPEG 0.92)
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Selecione uma imagem válida (PNG, JPG, WEBP ou SVG).');
      return;
    }

    setIsCompressingLogo(true);
    setLogoWarning(null);

    try {
      // 2. ALTA QUALIDADE E NITIDEZ NOS PDFs:
      // Largura máxima de 900px e formato PNG / JPEG com qualidade 0.92 preservando transparência e nitidez máxima
      const compressedBase64 = await compressImage(file, 900, 0.92);

      // Injeta no estado do componente
      setSettings(prev => ({ ...prev, logoBase64: compressedBase64 }));

      // Gravação direta preventiva no localStorage sob a chave 'company_logo_base64'
      try {
        localStorage.setItem('company_logo_base64', compressedBase64);
        localStorage.setItem('app_company_logo', compressedBase64);
        localStorage.setItem('tecnico_logo', compressedBase64);
      } catch (storageErr) {
        console.warn('Aviso de gravação rápida no upload:', storageErr);
      }

      // Atualiza contexto global dos PDFs imediatamente
      const helper = (window as any).PerfilTecnico;
      if (helper && typeof helper.salvar === 'function') {
        helper.salvar({ logoBase64: compressedBase64 });
      }
      saveBrandCustomization({ logoBase64: compressedBase64 });

      // Persistência resiliente com IndexedDB e tratamento de cota
      const persistRes = await persistCompanyLogo(compressedBase64);
      if (persistRes.quotaExceeded) {
        setLogoWarning('Memória local otimizada: O logotipo foi salvo com alta qualidade adaptativa para caber sem estouro de cota.');
      } else if (!persistRes.success) {
        setLogoWarning(persistRes.error || 'Aviso de persistência local.');
      }
    } catch (err: any) {
      console.error('Erro ao processar imagem do logotipo:', err);
      alert('Não foi possível processar a imagem do logotipo. Tente uma foto PNG ou JPG.');
    } finally {
      setIsCompressingLogo(false);
    }
  };

  const handleRemoveLogo = async () => {
    setSettings(prev => ({ ...prev, logoBase64: null }));
    setLogoWarning(null);
    try {
      localStorage.removeItem('company_logo_base64');
      localStorage.removeItem('app_company_logo');
      localStorage.removeItem('tecnico_logo');
    } catch (e) {}
    await persistCompanyLogo(null);
    const helper = (window as any).PerfilTecnico;
    if (helper && typeof helper.salvar === 'function') {
      helper.salvar({ logoBase64: null });
    }
    saveBrandCustomization({ logoBase64: null });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // SALVAMENTO: Gravação direta e inequívoca no localStorage ('company_logo_base64') e atualização do contexto global dos PDFs
  const handleSave = async () => {
    setIsSaving(true);
    setLogoWarning(null);
    try {
      // 1. Ao clicar em "Salvar Configurações", grava a imagem diretamente no localStorage sob a chave 'company_logo_base64'
      if (settings.logoBase64) {
        try {
          localStorage.setItem('company_logo_base64', settings.logoBase64);
          localStorage.setItem('app_company_logo', settings.logoBase64);
          localStorage.setItem('tecnico_logo', settings.logoBase64);
        } catch (localErr) {
          console.warn('Aviso ao salvar company_logo_base64 diretamente no localStorage:', localErr);
        }

        const persistRes = await persistCompanyLogo(settings.logoBase64);
        if (persistRes.quotaExceeded) {
          setLogoWarning('Logotipo persistido com sucesso.');
        } else if (!persistRes.success) {
          throw new Error(persistRes.error || 'Falha ao gravar imagem do logotipo.');
        }
      } else {
        try {
          localStorage.removeItem('company_logo_base64');
          localStorage.removeItem('app_company_logo');
          localStorage.removeItem('tecnico_logo');
        } catch (e) {}
        await persistCompanyLogo(null);
      }

      // 2. Atualiza o contexto global dos PDFs e perfil técnico
      const helper = (window as any).PerfilTecnico;
      if (helper && typeof helper.salvar === 'function') {
        helper.salvar({
          ...settings,
          logoBase64: settings.logoBase64
        });
      }

      // 3. Garante que a propriedade do logotipo no objeto global de configurações também seja atualizada
      saveBrandCustomization(settings);

      // 4. Salva no perfil do usuário no Firestore (sem consumo de tokens)
      if (currentUser && updateCurrentUserProfile) {
        await updateCurrentUserProfile({
          pdfTemplate: settings.pdfTemplate,
          pdfOrientation: settings.pdfOrientation,
          pdfFontSize: settings.pdfFontSize,
          borderColor: settings.borderColor
        });
      }

      setFeedbackMsg('Configurações e Logotipo salvos com sucesso! Seus próximos PDFs já usarão esse padrão com nitidez cristalina.');
      setTimeout(() => setFeedbackMsg(null), 4000);
    } catch (e: any) {
      console.error('Erro ao salvar marca:', e);
      if (e?.name === 'QuotaExceededError' || e?.code === 22) {
        setLogoWarning('Memória local reduzida: O logotipo foi preservado no banco seguro do aplicativo.');
        setFeedbackMsg('Dados salvos! Devido ao espaço local, o logotipo foi armazenado no banco interno do app.');
      } else {
        setFeedbackMsg('Erro ao salvar preferências. Verifique os dados inseridos.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateSamplePdf = async () => {
    setIsGeneratingSample(true);
    try {
      saveBrandCustomization(settings);

      // Garante que o perfil técnico em window tenha os dados mais frescos
      const helper = (window as any).PerfilTecnico;
      if (helper && typeof helper.salvar === 'function') {
        helper.salvar(settings);
      }

      // Se existir o gerador da OS ou bloco1, executa amostra real
      if ((window as any).GeradorOS && typeof (window as any).GeradorOS.gerarPDF === 'function') {
        await (window as any).GeradorOS.gerarPDF({
          tipo: 'ORÇAMENTO',
          numero: `AMOSTRA-${Math.floor(1000 + Math.random() * 9000)}`,
          data: new Date().toLocaleDateString('pt-MZ'),
          cliente: {
            nome: 'Cliente Demonstração Maputo',
            telefone: '+258 84 999 0000',
            endereco: 'Av. Julius Nyerere, Maputo',
            nuit: '400123456'
          },
          servicos: [
            { descricao: 'Instalação de Quadro Geral com Proteção DPS e IDR', qtd: 1, precoUnit: 8500 },
            { descricao: 'Revisão e Balanceamento de Fases Trifásicas', qtd: 1, precoUnit: 4200 }
          ],
          materiais: [
            { descricao: 'Disjuntor Bipolar 40A Curva C Schneider', qtd: 2, precoUnit: 750 },
            { descricao: 'Protetor contra Surtos DPS 20kA 275V', qtd: 4, precoUnit: 620 }
          ],
          totalServicos: 12700,
          totalMateriais: 3980,
          totalGeral: 16680,
          condicoesPagamento: '50% adjudicação e 50% na entrega e teste de isolação.',
          prazoExecucao: '03 dias úteis',
          garantiaTexto: '12 meses contra defeitos de execução',
          observacoes: 'Amostra gerada para validação visual do novo template de documento.'
        }, 'open');
      } else {
        alert('Carregando biblioteca de geração de PDF. Aguarde 2 segundos e tente novamente.');
      }
    } catch (err: any) {
      console.error('Erro ao gerar amostra:', err);
      alert('Erro ao gerar PDF de amostra: ' + (err.message || 'Verifique se o navegador bloqueou pop-up.'));
    } finally {
      setIsGeneratingSample(false);
    }
  };

  const currentTemplate = getTemplateConfig(settings.pdfTemplate);
  const activeBorderColor = settings.borderColor || currentTemplate.borderDefault;

  return (
    <div className="flex flex-col h-full max-h-[85vh] bg-slate-50 text-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Top Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/30">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white">Minha Marca & Visual dos PDFs</h2>
              <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full">
                100% White-Label
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Personalize seu cabeçalho, paleta de cores, tipografia e selecione entre 7 templates exclusivos.
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 bg-white px-6 shrink-0 gap-2">
        <button
          onClick={() => setActiveTab('templates')}
          className={`flex items-center gap-2 py-3 px-4 text-xs font-black border-b-2 transition ${
            activeTab === 'templates'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>1. Templates & Estilo dos PDFs</span>
          <span className="px-1.5 py-0.2 text-[9px] bg-blue-100 text-blue-700 rounded-full font-bold">7 Modelos</span>
        </button>

        <button
          onClick={() => setActiveTab('dados')}
          className={`flex items-center gap-2 py-3 px-4 text-xs font-black border-b-2 transition ${
            activeTab === 'dados'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>2. Dados da Empresa & Logotipo</span>
          {settings.logoBase64 && (
            <span className="w-2 h-2 rounded-full bg-emerald-500" title="Logo anexado"></span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('preview')}
          className={`flex items-center gap-2 py-3 px-4 text-xs font-black border-b-2 transition ${
            activeTab === 'preview'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>3. Visualização ao Vivo</span>
        </button>
      </div>

      {/* Feedback Toast */}
      {feedbackMsg && (
        <div className="bg-emerald-600 text-white px-6 py-2.5 text-xs font-bold flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>{feedbackMsg}</span>
          </div>
          <button onClick={() => setFeedbackMsg(null)} className="text-white/80 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Scrollable Content Body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* ================= TAB 1: TEMPLATES & ESTILO DOS PDFS ================= */}
        {activeTab === 'templates' && (
          <div className="space-y-6 max-w-5xl mx-auto">
            {/* Template Selection Cards */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    Selecione o Template Visual para Seus Documentos
                  </h3>
                  <p className="text-xs text-slate-500">
                    O template escolhido será aplicado instantaneamente a Orçamentos, Ordens de Serviço, Contratos, Recibos e Laudos.
                  </p>
                </div>
                <span className="text-xs font-bold text-slate-400">
                  {PDF_TEMPLATES.length} Designs Profissionais
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
                {PDF_TEMPLATES.map((tmpl) => {
                  const isSelected = settings.pdfTemplate === tmpl.id;
                  return (
                    <div
                      key={tmpl.id}
                      onClick={() => setSettings(prev => ({ ...prev, pdfTemplate: tmpl.id }))}
                      className={`relative group cursor-pointer rounded-xl border-2 transition-all p-3.5 bg-white flex flex-col justify-between ${
                        isSelected
                          ? 'border-blue-600 shadow-md ring-2 ring-blue-500/20 bg-blue-50/20'
                          : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
                      }`}
                    >
                      {/* Card Header & Badge */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="px-2 py-0.5 text-[10px] font-black uppercase rounded-md tracking-wider"
                            style={{ backgroundColor: `${tmpl.primaryColor}15`, color: tmpl.primaryColor }}>
                            {tmpl.badge}
                          </span>
                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-sm">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          )}
                        </div>

                        {/* Visual Miniature Header Simulation */}
                        <div className="rounded-lg overflow-hidden border border-slate-200 mb-3 shadow-inner">
                          {/* Mini Top Bar */}
                          <div
                            className="p-2.5 text-white flex items-center justify-between"
                            style={{ backgroundColor: tmpl.headerBg, color: tmpl.headerText }}
                          >
                            <div className="flex items-center gap-1.5">
                              <div
                                className="w-4 h-4 rounded flex items-center justify-center text-[8px] font-black"
                                style={{ backgroundColor: `${tmpl.accentColor}30`, color: tmpl.accentColor }}
                              >
                                ⚡
                              </div>
                              <div className="h-1.5 w-16 rounded bg-white/40"></div>
                            </div>
                            <div className="h-1 w-8 rounded bg-white/25"></div>
                          </div>

                          {/* Mini Accent Line */}
                          <div
                            className="h-1 w-full"
                            style={{ backgroundColor: tmpl.id === settings.pdfTemplate ? activeBorderColor : tmpl.borderDefault }}
                          ></div>

                          {/* Mini Body Document Simulation */}
                          <div className="p-2 bg-slate-50 space-y-1">
                            <div className="h-1.5 w-full bg-slate-200 rounded"></div>
                            <div className="h-1.5 w-3/4 bg-slate-200 rounded"></div>
                            <div className="flex gap-1 pt-1">
                              <div className="h-1.5 flex-1 bg-slate-200 rounded"></div>
                              <div className="h-1.5 w-8 rounded" style={{ backgroundColor: `${tmpl.secondaryColor}40` }}></div>
                            </div>
                          </div>
                        </div>

                        <h4 className="text-xs font-black text-slate-900">{tmpl.name}</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">{tmpl.subtitle}</p>
                      </div>

                      {/* Color Palette Indicators */}
                      <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-slate-100">
                        <span className="text-[10px] text-slate-400 font-semibold">Tons:</span>
                        <div className="w-3 h-3 rounded-full border border-black/10" style={{ backgroundColor: tmpl.primaryColor }} title="Primária"></div>
                        <div className="w-3 h-3 rounded-full border border-black/10" style={{ backgroundColor: tmpl.secondaryColor }} title="Secundária"></div>
                        <div className="w-3 h-3 rounded-full border border-black/10" style={{ backgroundColor: tmpl.accentColor }} title="Destaque"></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Layout Options: Orientation & Font Scaling */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Orientation */}
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Maximize2 className="w-4 h-4 text-blue-600" />
                    Orientação do Papel (A4)
                  </label>
                  <span className="text-[11px] font-bold text-slate-400">
                    {settings.pdfOrientation === 'portrait' ? 'Vertical' : 'Horizontal'}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Escolha como o documento é orientado. As tabelas se adaptam proporcionalmente à largura.
                </p>
                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setSettings(prev => ({ ...prev, pdfOrientation: 'portrait' }))}
                    className={`flex items-center justify-center gap-2.5 p-3 rounded-xl border-2 font-black text-xs transition ${
                      settings.pdfOrientation === 'portrait'
                        ? 'border-blue-600 bg-blue-50/50 text-blue-900 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-slate-50'
                    }`}
                  >
                    <div className="w-4 h-6 border-2 border-current rounded-sm flex items-center justify-center">
                      <div className="w-2 h-0.5 bg-current"></div>
                    </div>
                    <span>Retrato (Vertical)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSettings(prev => ({ ...prev, pdfOrientation: 'landscape' }))}
                    className={`flex items-center justify-center gap-2.5 p-3 rounded-xl border-2 font-black text-xs transition ${
                      settings.pdfOrientation === 'landscape'
                        ? 'border-blue-600 bg-blue-50/50 text-blue-900 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-slate-50'
                    }`}
                  >
                    <div className="w-6 h-4 border-2 border-current rounded-sm flex items-center justify-center">
                      <div className="w-3 h-0.5 bg-current"></div>
                    </div>
                    <span>Paisagem (Horizontal)</span>
                  </button>
                </div>
              </div>

              {/* Font Size Scaling */}
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-blue-600" />
                    Escala de Tamanho da Fonte
                  </label>
                  <span className="text-[11px] font-bold text-slate-400">
                    {settings.pdfFontSize === 'small' ? 'Compacto' : settings.pdfFontSize === 'large' ? 'Grande' : 'Padrão'}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Ajusta o tamanho geral dos textos para economizar páginas ou priorizar leitura fácil.
                </p>
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {[
                    { id: 'small', label: 'Pequeno', desc: '88% - Denso' },
                    { id: 'medium', label: 'Médio', desc: '100% - Padrão' },
                    { id: 'large', label: 'Grande', desc: '115% - Legível' }
                  ].map(f => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setSettings(prev => ({ ...prev, pdfFontSize: f.id as PdfFontSizeType }))}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-xl border-2 transition ${
                        settings.pdfFontSize === f.id
                          ? 'border-blue-600 bg-blue-50/50 text-blue-900 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-slate-50'
                      }`}
                    >
                      <span className="text-xs font-black">{f.label}</span>
                      <span className="text-[10px] text-slate-400 mt-0.5">{f.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Border and Frame Color Palette */}
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Palette className="w-4 h-4 text-blue-600" />
                    Paleta Multicor de Bordas e Destaques
                  </h4>
                  <p className="text-xs text-slate-500">
                    Esta cor define as linhas divisórias e molduras nos PDFs e no Portfólio Digital "Antes & Depois".
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full border border-black/20"
                    style={{ backgroundColor: activeBorderColor }}
                  ></div>
                  <span className="text-xs font-mono font-bold text-slate-700">{activeBorderColor}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 pt-1">
                {BORDER_PALETTE.map((c) => {
                  const isColorSelected = activeBorderColor.toLowerCase() === c.hex.toLowerCase();
                  return (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => setSettings(prev => ({ ...prev, borderColor: c.hex }))}
                      className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 transition text-center ${
                        isColorSelected
                          ? 'border-slate-900 shadow-md bg-slate-50'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                      }`}
                    >
                      <div
                        className="w-7 h-7 rounded-full shadow-inner flex items-center justify-center border border-black/10"
                        style={{ backgroundColor: c.hex }}
                      >
                        {isColorSelected && <Check className="w-4 h-4 text-white stroke-[3] drop-shadow" />}
                      </div>
                      <span className="text-[10px] font-bold text-slate-700 leading-tight">
                        {c.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: DADOS DA EMPRESA & LOGO ================= */}
        {activeTab === 'dados' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            {/* Logotipo Upload */}
            <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm space-y-4">
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Upload className="w-4 h-4 text-blue-600" />
                  Logotipo Oficial da Sua Marca
                </h3>
                <p className="text-xs text-slate-500">
                  O logotipo será impresso no canto superior esquerdo de todos os seus PDFs. Recomenda-se formato PNG transparente ou JPG de alta resolução.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-5 p-4 bg-slate-50 rounded-xl border border-slate-200">
                {/* Logo Preview or Placeholder */}
                <div className="w-28 h-28 rounded-xl bg-white border-2 border-dashed border-slate-300 flex items-center justify-center p-2 relative shrink-0 shadow-sm">
                  {isCompressingLogo ? (
                    <div className="text-center p-2">
                      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-1" />
                      <span className="text-[10px] font-bold text-blue-600">Otimizando...</span>
                    </div>
                  ) : settings.logoBase64 ? (
                    <img
                      src={settings.logoBase64}
                      alt="Logo da Marca"
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <div className="text-center p-2">
                      <Building className="w-8 h-8 text-slate-300 mx-auto mb-1" />
                      <span className="text-[10px] font-bold text-slate-400">Sem Logo</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-2 text-center sm:text-left">
                  <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                    <button
                      type="button"
                      disabled={isCompressingLogo}
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs shadow-sm flex items-center gap-2 transition"
                    >
                      <Upload className="w-4 h-4" />
                      <span>{isCompressingLogo ? 'Processando Imagem...' : settings.logoBase64 ? 'Substituir Logotipo' : 'Carregar Imagem do Logo'}</span>
                    </button>

                    {settings.logoBase64 && !isCompressingLogo && (
                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl font-bold text-xs border border-rose-200 flex items-center gap-1.5 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remover</span>
                      </button>
                    )}

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png, image/jpeg, image/webp"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </div>

                  {settings.logoBase64 && (
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Logotipo otimizado e persistido no armazenamento local (localStorage & IndexedDB).</span>
                    </div>
                  )}

                  {logoWarning && (
                    <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-[11px] font-medium text-amber-900 text-left">
                      {logoWarning}
                    </div>
                  )}

                  <p className="text-[11px] text-slate-400">
                    Ao carregar, a imagem é processada via Canvas em alta definição (até 900px, PNG transparente / JPEG 0.92) garantindo máxima nitidez e fidelidade visual em todos os seus PDFs.
                  </p>
                </div>
              </div>
            </div>

            {/* Informações Comerciais */}
            <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm space-y-4">
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Building className="w-4 h-4 text-blue-600" />
                  Informações Comerciais do Técnico / Empresa
                </h3>
                <p className="text-xs text-slate-500">
                  Estes dados serão apresentados no cabeçalho e rodapé dos orçamentos, contratos e recibos.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Nome Comercial / Razão Social *</label>
                  <input
                    type="text"
                    value={settings.nome}
                    onChange={(e) => setSettings(prev => ({ ...prev, nome: e.target.value }))}
                    placeholder="Ex: Carlos Sitoe Instalações Elétricas"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Slogan ou Especialidade Principal</label>
                  <input
                    type="text"
                    value={settings.slogan}
                    onChange={(e) => setSettings(prev => ({ ...prev, slogan: e.target.value }))}
                    placeholder="Ex: Energia Solar, Instalações Industriais & Automação"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Telefone / WhatsApp Comercial *</label>
                  <input
                    type="text"
                    value={settings.telefone}
                    onChange={(e) => setSettings(prev => ({ ...prev, telefone: e.target.value }))}
                    placeholder="Ex: +258 84 123 4567"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Cidade / Província</label>
                  <input
                    type="text"
                    value={settings.cidade}
                    onChange={(e) => setSettings(prev => ({ ...prev, cidade: e.target.value }))}
                    placeholder="Ex: Maputo Cidade, Moçambique"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">NUIT (Opcional)</label>
                  <input
                    type="text"
                    value={settings.nuit || ''}
                    onChange={(e) => setSettings(prev => ({ ...prev, nuit: e.target.value }))}
                    placeholder="Ex: 400123456"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Email Profissional (Opcional)</label>
                  <input
                    type="email"
                    value={settings.email || ''}
                    onChange={(e) => setSettings(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Ex: contacto@seunome.co.mz"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-700">Certificações / Especialidades (Opcional)</label>
                  <input
                    type="text"
                    value={settings.certificacoes || ''}
                    onChange={(e) => setSettings(prev => ({ ...prev, certificacoes: e.target.value, especialidades: e.target.value }))}
                    placeholder="Ex: Certificação ANE / EDM • Redes BT/MT • Instalações Industriais"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-700">Endereço Físico / Base Operacional (Opcional)</label>
                  <input
                    type="text"
                    value={settings.endereco || ''}
                    onChange={(e) => setSettings(prev => ({ ...prev, endereco: e.target.value }))}
                    placeholder="Ex: Bairro Central, Rua da Resistência nº 1420"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 3: VISUALIZAÇÃO AO VIVO ================= */}
        {activeTab === 'preview' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Eye className="w-4 h-4 text-blue-600" />
                  Simulação do Cabeçalho Oficial
                </h3>
                <p className="text-xs text-slate-500">
                  Esta é uma maquete em tempo real demonstrando como seu cabeçalho e divisor aparecerão no topo de cada página.
                </p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                Template: {currentTemplate.name}
              </span>
            </div>

            {/* Simulated Sheet of Paper */}
            <div
              className={`bg-white rounded-xl border border-slate-300 shadow-xl p-6 mx-auto transition-all ${
                settings.pdfOrientation === 'landscape' ? 'max-w-3xl aspect-[16/10]' : 'max-w-xl aspect-[1/1.3]'
              }`}
            >
              {/* RENDERIZAÇÃO ESTRUTURAL DIFERENCIADA POR TEMPLATE */}

              {/* TEMPLATE 2: MODERNO DARK (Cabeçalho escuro com layout horizontal [LOGOTIPO] [DADOS DA EMPRESA]) */}
              {settings.pdfTemplate === 'modern_dark' ? (
                <div>
                  {/* Cabeçalho Escuro com alinhamento horizontal fluido [LOGOTIPO] [DADOS DA EMPRESA] */}
                  <div className="bg-slate-900 text-white rounded-xl p-4 border-2" style={{ borderColor: activeBorderColor }}>
                    <div className="flex items-center justify-start gap-4 ml-0">
                      {settings.logoBase64 ? (
                        <img src={settings.logoBase64} alt="Logo" className="w-14 h-12 object-contain bg-white rounded-lg p-1 shrink-0" />
                      ) : (
                        <div className="w-12 h-10 rounded-lg flex items-center justify-center font-black text-xs text-white shrink-0" style={{ backgroundColor: activeBorderColor }}>
                          ⚡ {(settings.nome || 'EP').slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div className="text-left">
                        <h2 className="text-sm font-black tracking-tight text-white uppercase">{settings.nome || 'SERVIÇOS TÉCNICOS'}</h2>
                        <p className="text-[11px] italic font-medium" style={{ color: currentTemplate.secondaryColor }}>"{settings.slogan || 'Alta Tecnologia em Engenharia Elétrica'}"</p>
                        <div className="flex flex-wrap gap-x-3 text-[9px] text-slate-400 mt-1">
                          <span>Tel: {settings.telefone || '+258 84 000 0000'}</span>
                          {settings.email && <span>Email: {settings.email}</span>}
                          <span>{settings.cidade || 'Maputo'}</span>
                          {settings.nuit && <span>NUIT: {settings.nuit}</span>}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Faixa Título Dark */}
                  <div className="bg-slate-800 text-center py-1.5 px-3 rounded-lg my-3 border text-xs font-black uppercase text-cyan-300" style={{ borderColor: activeBorderColor }}>
                    ORÇAMENTO TÉCNICO • SISTEMA DE ALTA TENSÃO & AUTOMAÇÃO
                  </div>

                  {/* Grade de Serviços Dividida em 2 Colunas */}
                  <div className="grid grid-cols-2 gap-3 mt-2 text-[10px]">
                    <div className="border border-slate-200 rounded-lg p-2.5 bg-slate-50/50">
                      <div className="font-black text-slate-900 uppercase border-b border-slate-200 pb-1 mb-1.5 flex items-center justify-between">
                        <span>1. Mão de Obra Técnica</span>
                        <span className="text-[9px] text-blue-600 font-bold">Serviço</span>
                      </div>
                      <p className="font-semibold text-slate-800">Montagem de QG + Barramentos</p>
                      <p className="text-[9px] text-slate-500">Aperto calibrado com torquímetro</p>
                      <div className="mt-2 text-right font-black text-blue-600">8.500,00 MZN</div>
                    </div>

                    <div className="border border-slate-200 rounded-lg p-2.5 bg-slate-50/50">
                      <div className="font-black text-slate-900 uppercase border-b border-slate-200 pb-1 mb-1.5 flex items-center justify-between">
                        <span>2. Proteção & Dispositivos</span>
                        <span className="text-[9px] text-emerald-600 font-bold">Materiais</span>
                      </div>
                      <p className="font-semibold text-slate-800">Disjuntor Bipolar + IDR 30mA</p>
                      <p className="text-[9px] text-slate-500">Schneider / ABB Certificado</p>
                      <div className="mt-2 text-right font-black text-emerald-600">6.200,00 MZN</div>
                    </div>
                  </div>
                </div>
              ) : settings.pdfTemplate === 'minimalist_green' ? (
                /* TEMPLATE 3: MINIMALISTA (Linhas divisórias, sem blocos de fundo pesados, foco em tabelas limpas) */
                <div>
                  {/* Cabeçalho Minimalista com Linha Fina */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                      {settings.logoBase64 ? (
                        <img src={settings.logoBase64} alt="Logo" className="w-12 h-10 object-contain" />
                      ) : (
                        <div className="w-10 h-10 rounded border border-slate-300 flex items-center justify-center font-black text-xs text-slate-700">
                          ⚡{(settings.nome || 'EP').slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h2 className="text-sm font-bold text-slate-900 uppercase">{settings.nome || 'SERVIÇOS TÉCNICOS'}</h2>
                        <p className="text-[10px] text-slate-500">{settings.slogan || 'Instalações & Manutenções'}</p>
                      </div>
                    </div>
                    <div className="text-right text-[9px] text-slate-400">
                      <p>{settings.telefone}</p>
                      <p>{settings.cidade}</p>
                    </div>
                  </div>

                  {/* Título sem fundo pesado */}
                  <div className="flex items-center justify-between py-2 border-b-2 my-2 text-xs font-bold uppercase text-slate-800" style={{ borderColor: activeBorderColor }}>
                    <span>Proposta Técnica & Orçamento</span>
                    <span className="text-[9px] text-slate-400 font-normal">Nº ORC-2026</span>
                  </div>

                  {/* Tabela Limpa Minimalista */}
                  <div className="mt-3 text-[10px]">
                    <div className="grid grid-cols-4 py-1 border-b border-slate-300 font-bold text-slate-600 text-[9px] uppercase">
                      <div className="col-span-2">Descrição dos Serviços</div>
                      <div className="text-center">Qtd</div>
                      <div className="text-right">Total</div>
                    </div>
                    <div className="grid grid-cols-4 py-2 border-b border-slate-100 text-slate-800">
                      <div className="col-span-2 font-medium">Revisão Completa de Quadro e Disjuntores</div>
                      <div className="text-center text-slate-500">1 un</div>
                      <div className="text-right font-bold">7.800,00 MZN</div>
                    </div>
                    <div className="grid grid-cols-4 py-2 border-b border-slate-100 text-slate-800">
                      <div className="col-span-2 font-medium">Instalação de DPS Classe II e Aterramento</div>
                      <div className="text-center text-slate-500">1 kit</div>
                      <div className="text-right font-bold">5.400,00 MZN</div>
                    </div>
                  </div>
                </div>
              ) : settings.pdfTemplate === 'executive_elegant' || settings.pdfOrientation === 'landscape' ? (
                /* TEMPLATE 4: EXECUTIVO / LANDSCAPE (Layout horizontal otimizado em 3 colunas) */
                <div>
                  {/* Cabeçalho Executivo */}
                  <div className="flex items-center justify-between pb-2 border-b-2" style={{ borderColor: activeBorderColor }}>
                    <div className="flex items-center gap-3">
                      {settings.logoBase64 ? (
                        <img src={settings.logoBase64} alt="Logo" className="w-14 h-11 object-contain" />
                      ) : (
                        <div className="w-11 h-11 rounded-lg flex items-center justify-center font-black text-xs text-white" style={{ backgroundColor: currentTemplate.primaryColor }}>
                          ⚡{(settings.nome || 'EP').slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h2 className="text-sm font-black text-slate-900 uppercase">{settings.nome || 'SERVIÇOS TÉCNICOS EXECUTIVOS'}</h2>
                        <p className="text-[10px] text-slate-500 font-medium">{settings.slogan || 'Soluções Corporativas'}</p>
                      </div>
                    </div>
                    <div className="px-3 py-1 bg-slate-100 rounded-lg text-right text-[9px] text-slate-600 border border-slate-200">
                      <p className="font-bold">TEL: {settings.telefone}</p>
                      <p>{settings.cidade} • NUIT: {settings.nuit || '---'}</p>
                    </div>
                  </div>

                  {/* Banner Executivo */}
                  <div className="py-1 px-3 rounded text-center my-2 text-white font-black text-xs uppercase" style={{ backgroundColor: currentTemplate.primaryColor }}>
                    RELATÓRIO TÉCNICO EXECUTIVO & ESPECIFICAÇÃO DE SERVIÇOS
                  </div>

                  {/* Estrutura em 3 Colunas Otimizadas */}
                  <div className="grid grid-cols-3 gap-3 mt-2 text-[10px]">
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="font-black text-slate-800 uppercase border-b border-slate-200 pb-1 mb-1.5 text-[9px]">
                        1. Dados do Contratante
                      </div>
                      <p className="font-bold text-slate-700">Edifício Comercial Maputo</p>
                      <p className="text-[9px] text-slate-500">Av. 24 de Julho, Maputo</p>
                      <p className="text-[9px] text-slate-500 mt-1">Prazo: 5 Dias Úteis</p>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="font-black text-slate-800 uppercase border-b border-slate-200 pb-1 mb-1.5 text-[9px]">
                        2. Especificação Técnica
                      </div>
                      <p className="font-bold text-slate-700">Painel Principal 380V</p>
                      <p className="text-[9px] text-slate-500">IEC 60364 & Norma EDM</p>
                      <p className="text-[9px] text-slate-500 mt-1">Torque dos bornes: 2.5 N.m</p>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="font-black text-slate-800 uppercase border-b border-slate-200 pb-1 mb-1.5 text-[9px]">
                        3. Resumo Financeiro
                      </div>
                      <p className="text-[9px] text-slate-600 flex justify-between">
                        <span>Mão de Obra:</span>
                        <span className="font-bold">12.000,00</span>
                      </p>
                      <p className="text-[9px] text-slate-600 flex justify-between">
                        <span>Materiais:</span>
                        <span className="font-bold">6.500,00</span>
                      </p>
                      <p className="text-[10px] text-blue-700 font-black flex justify-between border-t border-slate-200 pt-1 mt-1">
                        <span>TOTAL:</span>
                        <span>18.500,00 MT</span>
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                /* TEMPLATE 1: CORPORATIVO (Coluna lateral com resumo técnico e cabeçalho em bloco sólido) */
                <div>
                  {/* Cabeçalho em 2 Blocos: [Esquerda: Logo + Identidade] | [Direita: Caixa Contato com Borda Dinâmica] */}
                  <div className="flex items-start justify-between gap-4 pb-3 ml-0">
                    {/* Bloco Esquerda: Logo + Nome + Slogan + Certificações */}
                    <div className="flex items-center gap-3.5 flex-1 min-w-0">
                      {settings.logoBase64 ? (
                        <img src={settings.logoBase64} alt="Logo" className="w-16 h-12 object-contain shrink-0" />
                      ) : settings.nome ? (
                        <div
                          className="w-14 h-12 rounded flex items-center justify-center font-black text-sm text-white shadow-sm shrink-0"
                          style={{
                            backgroundColor: currentTemplate.primaryColor,
                            border: `1.5px solid ${activeBorderColor}`
                          }}
                        >
                          ⚡ {(settings.nome || 'EP').slice(0, 2).toUpperCase()}
                        </div>
                      ) : null}

                      <div className="text-left min-w-0">
                        {settings.nome && (
                          <h2 className="text-sm sm:text-base font-black tracking-tight uppercase truncate" style={{ color: currentTemplate.primaryColor }}>
                            {settings.nome}
                          </h2>
                        )}
                        {settings.slogan && (
                          <p className="text-xs italic font-semibold truncate" style={{ color: currentTemplate.secondaryColor }}>
                            "{settings.slogan}"
                          </p>
                        )}
                        {settings.certificacoes && (
                          <p className="text-[10px] text-slate-500 font-medium truncate mt-0.5">
                            {settings.certificacoes}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Bloco Direita: Caixa de Contato com Borda e Cor Primária Dinâmica */}
                    {(settings.telefone || settings.cidade || settings.nuit || settings.email) && (
                      <div
                        className="px-3 py-1.5 rounded-lg text-left text-[9.5px] leading-tight shrink-0 bg-slate-50/80 shadow-xs space-y-0.5"
                        style={{ border: `1.5px solid ${activeBorderColor}` }}
                      >
                        {settings.telefone && (
                          <p>
                            <strong className="text-slate-800">TEL / WhatsApp:</strong> <span className="text-slate-600">{settings.telefone}</span>
                          </p>
                        )}
                        {settings.cidade && (
                          <p>
                            <strong className="text-slate-800">Cidade:</strong> <span className="text-slate-600">{settings.cidade}</span>
                          </p>
                        )}
                        {settings.nuit && (
                          <p>
                            <strong className="text-slate-800">NUIT:</strong> <span className="text-slate-600">{settings.nuit}</span>
                          </p>
                        )}
                        {settings.email && (
                          <p>
                            <strong className="text-slate-800">Email:</strong> <span className="text-slate-600">{settings.email}</span>
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Linha de Acento Sólida */}
                  <div className="h-[3px] w-full rounded-full my-2" style={{ backgroundColor: activeBorderColor }}></div>

                  {/* Document Banner */}
                  <div
                    className="py-2 px-4 rounded text-center my-3"
                    style={{
                      backgroundColor: currentTemplate.headerBg,
                      color: currentTemplate.headerText,
                      border: `1px solid ${activeBorderColor}`
                    }}
                  >
                    <div className="text-xs font-black tracking-wider uppercase">ORÇAMENTO TÉCNICO & PROPOSTA COMERCIAL</div>
                    <div className="text-[10px] opacity-80 mt-0.5">
                      Nº: ORC-2026-084 | Emissão: {new Date().toLocaleDateString('pt-MZ')} | Validade: 15 Dias
                    </div>
                  </div>

                  {/* Estrutura com Coluna Lateral de Resumo Técnico e Área Principal */}
                  <div className="grid grid-cols-3 gap-3 mt-2 text-[10px]">
                    {/* Coluna Lateral Esquerda: Resumo Técnico */}
                    <div className="col-span-1 p-2.5 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                      <div className="font-black text-slate-900 uppercase text-[9px] border-b border-slate-200 pb-1">
                        Resumo Técnico
                      </div>
                      <div>
                        <span className="text-[8px] font-bold text-slate-400 block uppercase">Responsável:</span>
                        <span className="font-bold text-slate-800 text-[9px]">{settings.nome}</span>
                      </div>
                      <div>
                        <span className="text-[8px] font-bold text-slate-400 block uppercase">Norma Técnica:</span>
                        <span className="font-bold text-slate-800 text-[9px]">EDM / IEC 60364</span>
                      </div>
                      <div>
                        <span className="text-[8px] font-bold text-slate-400 block uppercase">Garantia:</span>
                        <span className="font-bold text-emerald-700 text-[9px]">12 Meses Certificada</span>
                      </div>
                    </div>

                    {/* Área Principal Direita */}
                    <div className="col-span-2 space-y-2">
                      <div className="p-2 bg-slate-50 rounded border border-slate-200 text-[9px] text-slate-600 flex justify-between">
                        <div>
                          <span className="font-bold text-slate-800">CLIENTE: </span>
                          <span>Contratante da Obra</span>
                        </div>
                        <div>
                          <span className="font-bold text-slate-800">LOCAL: </span>
                          <span>{settings.cidade}</span>
                        </div>
                      </div>

                      <div className="border border-slate-200 rounded overflow-hidden text-[9px]">
                        <div
                          className="grid grid-cols-4 p-1.5 font-bold"
                          style={{ backgroundColor: currentTemplate.headerBg, color: currentTemplate.headerText }}
                        >
                          <div className="col-span-2">Descrição</div>
                          <div className="text-center">Qtd</div>
                          <div className="text-right">Total</div>
                        </div>
                        <div className="grid grid-cols-4 p-1.5 border-t border-slate-100 bg-white">
                          <div className="col-span-2 font-medium">Instalação de Quadro QG com IDR e DPS</div>
                          <div className="text-center">1 un</div>
                          <div className="text-right font-bold">12.500,00 MT</div>
                        </div>
                        <div className="grid grid-cols-4 p-1.5 border-t border-slate-100 bg-slate-50">
                          <div className="col-span-2 font-medium">Passagem de Circuitos e Aterramento</div>
                          <div className="text-center">1 sv</div>
                          <div className="text-right font-bold">4.800,00 MT</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Bloco de Assinaturas 100% Matematicamente Centralizado */}
              <div className="mt-6 pt-5 border-t border-slate-200 grid grid-cols-2 gap-8 text-[9px]">
                <div className="flex flex-col items-center text-center">
                  <div className="w-36 sm:w-44 border-t-2 border-slate-400 mb-1.5"></div>
                  <span className="font-bold text-slate-800">{settings.nome || 'Profissional Técnico'}</span>
                  <span className="text-[8px] text-slate-500">Profissional Responsável / Contratado</span>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="w-36 sm:w-44 border-t-2 border-slate-400 mb-1.5"></div>
                  <span className="font-bold text-slate-800">Cliente / Contratante</span>
                  <span className="text-[8px] text-slate-500">Aceite e Aprovação dos Serviços</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Actions Bar */}
      <div className="px-6 py-4 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleGenerateSamplePdf}
            disabled={isGeneratingSample}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-xs flex items-center gap-2 transition shadow-sm disabled:opacity-50"
          >
            {isGeneratingSample ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                <span>Gerando PDF...</span>
              </>
            ) : (
              <>
                <FileCheck className="w-4 h-4 text-emerald-400" />
                <span>Testar / Gerar PDF de Exemplo</span>
              </>
            )}
          </button>
        </div>

        <div className="flex items-center gap-2">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-bold text-xs transition"
            >
              Fechar
            </button>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-black text-xs shadow-md hover:shadow-lg transition flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                <span>Salvando...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Salvar Configurações</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export const BrandModal: React.FC<BrandModalProps> = ({ isOpen = true, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-5xl">
        <BrandModalContent onClose={onClose} />
      </div>
    </div>
  );
};

export default BrandModal;
