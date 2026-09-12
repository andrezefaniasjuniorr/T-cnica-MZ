import { PdfTemplateType, PdfOrientationType, PdfFontSizeType } from '../types';

export interface PdfTemplateConfig {
  id: PdfTemplateType;
  name: string;
  subtitle: string;
  badge: string;
  primaryColor: string;
  secondaryColor: string;
  headerBg: string;
  headerText: string;
  accentColor: string;
  lightBg: string;
  borderDefault: string;
  headerType: 'solid_dark' | 'solid_light' | 'bordered_clean' | 'compact_navy' | 'industrial' | 'grid_edm';
}

export const PDF_TEMPLATES: PdfTemplateConfig[] = [
  {
    id: 'corporate_blue',
    name: 'Corporativo Azul',
    subtitle: 'Visual empresarial clássico e limpo',
    badge: 'Mais Utilizado',
    primaryColor: '#1E3A8A',
    secondaryColor: '#2563EB',
    headerBg: '#1E3A8A',
    headerText: '#FFFFFF',
    accentColor: '#3B82F6',
    lightBg: '#EFF6FF',
    borderDefault: '#0066FF',
    headerType: 'solid_dark'
  },
  {
    id: 'modern_dark',
    name: 'Moderno Tech/Dark',
    subtitle: 'Cabeçalho escuro com acentos coloridos',
    badge: 'Alta Tecnologia',
    primaryColor: '#0F172A',
    secondaryColor: '#06B6D4',
    headerBg: '#0F172A',
    headerText: '#38BDF8',
    accentColor: '#06B6D4',
    lightBg: '#F0FDFA',
    borderDefault: '#8B5CF6',
    headerType: 'solid_dark'
  },
  {
    id: 'minimalist_green',
    name: 'Minimalista Verde',
    subtitle: 'Estilo clean, focado em linhas finas',
    badge: 'Sustentável & Solar',
    primaryColor: '#064E3B',
    secondaryColor: '#059669',
    headerBg: '#ECFDF5',
    headerText: '#064E3B',
    accentColor: '#10B981',
    lightBg: '#F0FDF4',
    borderDefault: '#10B981',
    headerType: 'bordered_clean'
  },
  {
    id: 'premium_gold',
    name: 'Premium Dourado & Grafite',
    subtitle: 'Visual luxo/sofisticado',
    badge: 'Alto Padrão',
    primaryColor: '#18181B',
    secondaryColor: '#D97706',
    headerBg: '#18181B',
    headerText: '#FBBF24',
    accentColor: '#F59E0B',
    lightBg: '#FFFBEB',
    borderDefault: '#D97706',
    headerType: 'solid_dark'
  },
  {
    id: 'executive_elegant',
    name: 'Executivo Elegante',
    subtitle: 'Estilo compacto com contraste acentuado',
    badge: 'Empresas & B2B',
    primaryColor: '#312E81',
    secondaryColor: '#4F46E5',
    headerBg: '#312E81',
    headerText: '#EEF2FF',
    accentColor: '#6366F1',
    lightBg: '#EEF2FF',
    borderDefault: '#8B5CF6',
    headerType: 'compact_navy'
  },
  {
    id: 'industrial_contrast',
    name: 'Industrial High-Contrast',
    subtitle: 'Foco em legibilidade rápida de campo',
    badge: 'Alta Visibilidade',
    primaryColor: '#111827',
    secondaryColor: '#F97316',
    headerBg: '#111827',
    headerText: '#FB923C',
    accentColor: '#EA580C',
    lightBg: '#FFF7ED',
    borderDefault: '#F97316',
    headerType: 'industrial'
  },
  {
    id: 'clean_edm',
    name: 'Clean Padrão EDM',
    subtitle: 'Inspirado nas fichas técnicas operacionais',
    badge: 'Norma Técnica',
    primaryColor: '#0369A1',
    secondaryColor: '#0284C7',
    headerBg: '#E0F2FE',
    headerText: '#0C4A6E',
    accentColor: '#0284C7',
    lightBg: '#F0F9FF',
    borderDefault: '#0066FF',
    headerType: 'grid_edm'
  }
];

export interface BorderColorOption {
  hex: string;
  name: string;
  twClass: string;
  borderClass: string;
}

export const BORDER_PALETTE: BorderColorOption[] = [
  { hex: '#0066FF', name: 'Azul Elétrico', twClass: 'bg-[#0066FF]', borderClass: 'border-[#0066FF]' },
  { hex: '#10B981', name: 'Verde Esmeralda', twClass: 'bg-[#10B981]', borderClass: 'border-[#10B981]' },
  { hex: '#F97316', name: 'Laranja EDM', twClass: 'bg-[#F97316]', borderClass: 'border-[#F97316]' },
  { hex: '#D97706', name: 'Dourado Premium', twClass: 'bg-[#D97706]', borderClass: 'border-[#D97706]' },
  { hex: '#8B5CF6', name: 'Roxo High-Tech', twClass: 'bg-[#8B5CF6]', borderClass: 'border-[#8B5CF6]' },
  { hex: '#374151', name: 'Grafite Minimalista', twClass: 'bg-[#374151]', borderClass: 'border-[#374151]' },
  { hex: '#EF4444', name: 'Vermelho Rubi', twClass: 'bg-[#EF4444]', borderClass: 'border-[#EF4444]' },
  { hex: '#B45309', name: 'Cobre Industrial', twClass: 'bg-[#B45309]', borderClass: 'border-[#B45309]' }
];

export interface BrandCustomizationSettings {
  nome: string;
  slogan: string;
  telefone: string;
  cidade: string;
  nuit?: string;
  email?: string;
  endereco?: string;
  logoBase64?: string | null;
  pdfTemplate: PdfTemplateType;
  pdfOrientation: PdfOrientationType;
  pdfFontSize: PdfFontSizeType;
  borderColor: string;
}

export const DEFAULT_BRAND_SETTINGS: BrandCustomizationSettings = {
  nome: 'Eletricista Profissional & Serviços',
  slogan: 'Instalações, Manutenção e Soluções Elétricas',
  telefone: '+258 84 000 0000',
  cidade: 'Maputo',
  nuit: '',
  email: '',
  endereco: '',
  logoBase64: null,
  pdfTemplate: 'corporate_blue',
  pdfOrientation: 'portrait',
  pdfFontSize: 'medium',
  borderColor: '#0066FF'
};

export function loadBrandCustomization(): BrandCustomizationSettings {
  if (typeof window === 'undefined') return { ...DEFAULT_BRAND_SETTINGS };

  try {
    const helper = (window as any).PerfilTecnico;
    const base = helper ? helper.obter() : {};

    const pdfTemplate = (localStorage.getItem('tecnico_pdf_template') ||
      base.pdfTemplate ||
      'corporate_blue') as PdfTemplateType;

    const pdfOrientation = (localStorage.getItem('tecnico_pdf_orientation') ||
      base.pdfOrientation ||
      'portrait') as PdfOrientationType;

    const pdfFontSize = (localStorage.getItem('tecnico_pdf_font_size') ||
      base.pdfFontSize ||
      'medium') as PdfFontSizeType;

    const borderColor = localStorage.getItem('tecnico_border_color') ||
      base.borderColor ||
      '#0066FF';

    return {
      nome: base.nome || localStorage.getItem('tecnico_nome') || DEFAULT_BRAND_SETTINGS.nome,
      slogan: base.slogan || localStorage.getItem('tecnico_slogan') || DEFAULT_BRAND_SETTINGS.slogan,
      telefone: base.telefone || localStorage.getItem('tecnico_telefone') || DEFAULT_BRAND_SETTINGS.telefone,
      cidade: base.cidade || localStorage.getItem('tecnico_cidade') || DEFAULT_BRAND_SETTINGS.cidade,
      nuit: base.nuit || localStorage.getItem('tecnico_nuit') || '',
      email: base.email || localStorage.getItem('tecnico_email') || '',
      endereco: base.endereco || localStorage.getItem('tecnico_endereco') || '',
      logoBase64: base.logoBase64 || localStorage.getItem('tecnico_logo') || null,
      pdfTemplate,
      pdfOrientation,
      pdfFontSize,
      borderColor
    };
  } catch (e) {
    console.warn('Erro ao carregar customizações de marca:', e);
    return { ...DEFAULT_BRAND_SETTINGS };
  }
}

export function saveBrandCustomization(settings: Partial<BrandCustomizationSettings>): BrandCustomizationSettings {
  if (typeof window === 'undefined') return { ...DEFAULT_BRAND_SETTINGS, ...settings };

  try {
    if (settings.nome !== undefined) localStorage.setItem('tecnico_nome', settings.nome);
    if (settings.slogan !== undefined) localStorage.setItem('tecnico_slogan', settings.slogan);
    if (settings.telefone !== undefined) localStorage.setItem('tecnico_telefone', settings.telefone);
    if (settings.cidade !== undefined) localStorage.setItem('tecnico_cidade', settings.cidade);
    if (settings.nuit !== undefined) localStorage.setItem('tecnico_nuit', settings.nuit);
    if (settings.email !== undefined) localStorage.setItem('tecnico_email', settings.email);
    if (settings.endereco !== undefined) localStorage.setItem('tecnico_endereco', settings.endereco);
    if (settings.logoBase64 !== undefined) {
      if (settings.logoBase64) {
        localStorage.setItem('tecnico_logo', settings.logoBase64);
      } else {
        localStorage.removeItem('tecnico_logo');
      }
    }

    if (settings.pdfTemplate) localStorage.setItem('tecnico_pdf_template', settings.pdfTemplate);
    if (settings.pdfOrientation) localStorage.setItem('tecnico_pdf_orientation', settings.pdfOrientation);
    if (settings.pdfFontSize) localStorage.setItem('tecnico_pdf_font_size', settings.pdfFontSize);
    if (settings.borderColor) localStorage.setItem('tecnico_border_color', settings.borderColor);

    const helper = (window as any).PerfilTecnico;
    if (helper && typeof helper.salvar === 'function') {
      helper.salvar(settings);
    }

    const current = loadBrandCustomization();
    window.dispatchEvent(new CustomEvent('brandCustomizationChanged', { detail: current }));
    return current;
  } catch (e) {
    console.error('Erro ao salvar customizações:', e);
    return loadBrandCustomization();
  }
}

export function getTemplateConfig(templateId: PdfTemplateType): PdfTemplateConfig {
  return PDF_TEMPLATES.find(t => t.id === templateId) || PDF_TEMPLATES[0];
}

export function getFontSizeMultiplier(fontSize: PdfFontSizeType): number {
  switch (fontSize) {
    case 'small': return 0.88;
    case 'large': return 1.15;
    case 'medium':
    default: return 1.0;
  }
}
