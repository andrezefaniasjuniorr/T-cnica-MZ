import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Camera,
  Image as ImageIcon,
  Download,
  Share2,
  Check,
  Sparkles,
  FileText,
  Building,
  RotateCcw,
  Palette,
  Phone,
  User,
  Wrench
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  BORDER_PALETTE,
  loadBrandCustomization,
  saveBrandCustomization
} from '../../utils/pdfBrandCustomizer';

interface PortfolioModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const PortfolioModalContent: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const { currentUser } = useAuth();
  const brandSettings = loadBrandCustomization();

  // Estados do formulário
  const [titulo, setTitulo] = useState('Transformação Elétrica & Segurança Residencial');
  const [nomeTecnico, setNomeTecnico] = useState(brandSettings.nome || currentUser?.name || 'Eletricista Profissional');
  const [especialidade, setEspecialidade] = useState(brandSettings.slogan || currentUser?.specialty || 'Instalações, Manutenção & Energia Solar');
  const [telefone, setTelefone] = useState(brandSettings.telefone || currentUser?.phone || '+258 84 000 0000');
  const [borderColor, setBorderColor] = useState(brandSettings.borderColor || '#0066FF');
  const [logoBase64, setLogoBase64] = useState<string | null>(brandSettings.logoBase64 || null);

  // Imagens
  const [fotoAntes, setFotoAntes] = useState<string | null>(null);
  const [fotoDepois, setFotoDepois] = useState<string | null>(null);

  // Estados de exportação
  const [isExporting, setIsExporting] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [exportSuccessMsg, setExportSuccessMsg] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputAntesRef = useRef<HTMLInputElement>(null);
  const fileInputDepoisRef = useRef<HTMLInputElement>(null);
  const fileInputLogoRef = useRef<HTMLInputElement>(null);

  // Sugestões de títulos rápidos
  const titulosSugeridos = [
    'Reforma Completa de Quadro Geral (QG)',
    'Instalação de Sistema Solar Fotovoltaico',
    'Adequação de Padrão de Entrada EDM',
    'Correção Crítica de Curto-Circuito & Fiação',
    'Iluminação Led Decorativa & Automação'
  ];

  // Carrega imagem de arquivo
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, tipo: 'antes' | 'depois') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Selecione uma imagem válida (PNG, JPG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      if (tipo === 'antes') {
        setFotoAntes(dataUrl);
      } else {
        setFotoDepois(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  // Redesenha o Canvas sempre que dados ou imagens mudam
  useEffect(() => {
    renderCanvas();
  }, [titulo, nomeTecnico, especialidade, telefone, borderColor, fotoAntes, fotoDepois, logoBase64]);

  const renderCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Dimensões profissionais do banner (1200 x 800)
    const W = 1200;
    const H = 800;
    canvas.width = W;
    canvas.height = H;

    // 1. Fundo Escuro Sofisticado (#0B1120)
    ctx.fillStyle = '#0B1120';
    ctx.fillRect(0, 0, W, H);

    // Efeito sutil de gradiente no fundo
    const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
    bgGrad.addColorStop(0, '#0F172A');
    bgGrad.addColorStop(1, '#020617');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // 2. Top Banner com o Título e Moldura Superior
    ctx.fillStyle = '#1E293B';
    ctx.fillRect(0, 0, W, 100);

    // Linha de Destaque Superior com a cor selecionada
    ctx.fillStyle = borderColor;
    ctx.fillRect(0, 96, W, 4);

    // Texto do Cabeçalho
    ctx.fillStyle = '#F8FAFC';
    ctx.font = 'bold 28px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(titulo.toUpperCase(), W / 2, 50);

    ctx.fillStyle = '#94A3B8';
    ctx.font = '600 14px Inter, system-ui, sans-serif';
    ctx.fillText('PORTFÓLIO TÉCNICO OFICIAL • COMPARAÇÃO DE EXECUÇÃO REALIZADA', W / 2, 78);

    // 3. Molduras das Fotos "ANTES" e "DEPOIS"
    const photoY = 125;
    const photoW = 540;
    const photoH = 540;
    const photo1X = 40;
    const photo2X = 620;

    // Função auxiliar para desenhar imagem ou placeholder
    const drawPhotoSlot = (
      imgSrc: string | null,
      x: number,
      y: number,
      w: number,
      h: number,
      label: 'ANTES' | 'DEPOIS',
      badgeBg: string
    ) => {
      // Moldura externa da foto com a cor selecionada (borderColor)
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 4;
      ctx.strokeRect(x, y, w, h);

      // Fundo do slot
      ctx.fillStyle = '#1E293B';
      ctx.fillRect(x, y, w, h);

      if (imgSrc) {
        const img = new Image();
        img.onload = () => {
          // Preenchimento mantendo proporção (cover)
          ctx.save();
          ctx.beginPath();
          ctx.rect(x + 2, y + 2, w - 4, h - 4);
          ctx.clip();

          const imgRatio = img.width / img.height;
          const slotRatio = w / h;
          let dw = w;
          let dh = h;
          let dx = x;
          let dy = y;

          if (imgRatio > slotRatio) {
            dw = h * imgRatio;
            dx = x - (dw - w) / 2;
          } else {
            dh = w / imgRatio;
            dy = y - (dh - h) / 2;
          }

          ctx.drawImage(img, dx, dy, dw, dh);
          ctx.restore();

          // Refaz o badge sobre a foto
          drawBadge(x, y, label, badgeBg);
        };
        img.src = imgSrc;
      } else {
        // Placeholder se sem imagem
        ctx.fillStyle = '#64748B';
        ctx.font = 'bold 18px Inter, system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`Clique para carregar foto [${label}]`, x + w / 2, y + h / 2);

        ctx.fillStyle = '#475569';
        ctx.font = '13px Inter, system-ui, sans-serif';
        ctx.fillText('Formato JPG, PNG ou WEBP', x + w / 2, y + h / 2 + 30);

        drawBadge(x, y, label, badgeBg);
      }
    };

    const drawBadge = (x: number, y: number, label: 'ANTES' | 'DEPOIS', badgeBg: string) => {
      const badgeW = 140;
      const badgeH = 38;
      const badgeX = x + 16;
      const badgeY = y + 16;

      ctx.fillStyle = badgeBg;
      ctx.beginPath();
      ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 8);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 16px Inter, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(label === 'ANTES' ? '● ANTES' : '★ DEPOIS', badgeX + badgeW / 2, badgeY + 25);
    };

    // Slot 1: ANTES (Vermelho / Inicial)
    drawPhotoSlot(fotoAntes, photo1X, photoY, photoW, photoH, 'ANTES', '#DC2626');

    // Divisor Central Vertical na cor selecionada
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 8]);
    ctx.beginPath();
    ctx.moveTo(599, photoY);
    ctx.lineTo(599, photoY + photoH);
    ctx.stroke();
    ctx.setLineDash([]);

    // Slot 2: DEPOIS (Verde Esmeralda / Concluído)
    drawPhotoSlot(fotoDepois, photo2X, photoY, photoW, photoH, 'DEPOIS', '#059669');

    // 4. Tarja Inferior (Bottom Banner) com dados do Técnico & WhatsApp
    const footerY = 690;
    const footerH = 110;

    // Fundo da tarja inferior
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(0, footerY, W, footerH);

    // Linha de acento no topo da tarja inferior com borderColor
    ctx.fillStyle = borderColor;
    ctx.fillRect(0, footerY, W, 5);

    // Coluna Esquerda: LOGOTIPO IMEDIATAMENTE ANTES DO NOME COMERCIAL
    const logoSize = 64;
    const logoX = 40;
    const logoY = footerY + 23;
    const textStartX = logoX + logoSize + 16;

    if (logoBase64) {
      const logoImg = new Image();
      logoImg.onload = () => {
        ctx.save();
        // Fundo branco arredondado para garantir legibilidade de qualquer logotipo
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.roundRect(logoX, logoY, logoSize, logoSize, 10);
        ctx.fill();
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.beginPath();
        ctx.roundRect(logoX + 4, logoY + 4, logoSize - 8, logoSize - 8, 8);
        ctx.clip();
        ctx.drawImage(logoImg, logoX + 4, logoY + 4, logoSize - 8, logoSize - 8);
        ctx.restore();
      };
      logoImg.src = logoBase64;
    } else {
      // Emblema com iniciais elegante caso ainda não haja foto
      const initials = (nomeTecnico || 'EP')
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map(w => w[0].toUpperCase())
        .join('');

      ctx.save();
      ctx.fillStyle = '#1E293B';
      ctx.beginPath();
      ctx.roundRect(logoX, logoY, logoSize, logoSize, 10);
      ctx.fill();
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.fillStyle = borderColor;
      ctx.font = 'bold 22px Inter, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`⚡${initials}`, logoX + logoSize / 2, logoY + 41);
      ctx.restore();
    }

    // Nome Comercial e Especialidade após o Logotipo
    ctx.textAlign = 'left';
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 24px Inter, system-ui, sans-serif';
    ctx.fillText((nomeTecnico || 'SERVIÇOS TÉCNICOS').toUpperCase(), textStartX, footerY + 45);

    ctx.fillStyle = borderColor;
    ctx.font = '600 15px Inter, system-ui, sans-serif';
    ctx.fillText(especialidade || 'Instalações, Manutenções e Automação', textStartX, footerY + 75);

    // Coluna Direita: WhatsApp e Chamada para Ação
    ctx.textAlign = 'right';
    ctx.fillStyle = '#38BDF8';
    ctx.font = 'bold 14px Inter, system-ui, sans-serif';
    ctx.fillText('SOLICITE SEU ORÇAMENTO OU VISITA:', W - 40, footerY + 38);

    ctx.fillStyle = '#10B981';
    ctx.font = 'bold 22px Inter, system-ui, sans-serif';
    ctx.fillText(`WhatsApp: ${telefone || '+258 84 000 0000'}`, W - 40, footerY + 72);
  };

  // Download do Banner em Alta Resolução (PNG)
  const handleDownloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsExporting(true);

    try {
      const dataUrl = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      const nomeFormatado = (titulo || 'Portfolio_Antes_Depois').replace(/\s+/g, '_');
      link.download = `${nomeFormatado}.png`;
      link.href = dataUrl;
      link.click();

      setExportSuccessMsg('Imagem em alta resolução baixada com sucesso!');
      setTimeout(() => setExportSuccessMsg(null), 4000);
    } catch (e: any) {
      console.error('Erro ao exportar imagem:', e);
      alert('Erro ao exportar imagem do portfólio.');
    } finally {
      setIsExporting(false);
    }
  };

  // Gerar Relatório PDF em A4 Paisagem com o Portfólio
  const handleGeneratePdf = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsGeneratingPdf(true);

    try {
      const imageBase64 = canvas.toDataURL('image/jpeg', 0.95);
      const helper = (window as any).PerfilTecnico;
      const perfil = helper ? helper.obter() : brandSettings;

      if (!(window as any).pdfMake) {
        alert('Carregando motor de PDF. Aguarde 2 segundos e tente novamente.');
        return;
      }

      const docDef: any = {
        pageSize: 'A4',
        pageOrientation: 'landscape',
        pageMargins: [30, 25, 30, 25],
        content: [
          // Cabeçalho institucional do técnico
          helper && typeof helper.gerarCabecalhoPDF === 'function'
            ? helper.gerarCabecalhoPDF('PORTFÓLIO TÉCNICO • COMPROVAÇÃO DE QUALIDADE', titulo)
            : [
                { text: perfil.nome.toUpperCase(), fontSize: 13, bold: true, color: '#0F172A' },
                { text: `Tel: ${perfil.telefone} | ${perfil.cidade}`, fontSize: 8, color: '#64748B', margin: [0, 2, 0, 8] }
              ],
          // Imagem composta de alta resolução do Antes & Depois
          {
            image: imageBase64,
            width: 770,
            alignment: 'center',
            margin: [0, 4, 0, 8]
          },
          // Rodapé técnico descritivo
          {
            table: {
              widths: ['*'],
              body: [[
                {
                  fillColor: '#F8FAFC',
                  stack: [
                    {
                      text: `Documentação Fotográfica Oficial • Registrado por ${nomeTecnico} • Contacto: ${telefone}`,
                      fontSize: 8,
                      color: '#475569',
                      alignment: 'center'
                    }
                  ],
                  margin: [4, 4, 4, 4]
                }
              ]]
            },
            layout: {
              hLineWidth: () => 1,
              vLineWidth: () => 1,
              hLineColor: () => borderColor,
              vLineColor: () => borderColor
            }
          }
        ]
      };

      if (helper && typeof helper.aplicarTemaDoc === 'function') {
        helper.aplicarTemaDoc(docDef);
      }

      const pdf = (window as any).pdfMake.createPdf(docDef);
      const nomeFormatado = (titulo || 'Portfolio_Antes_Depois').replace(/\s+/g, '_');
      pdf.download(`Portfolio_${nomeFormatado}.pdf`);

      setExportSuccessMsg('Relatório PDF do Portfólio gerado com sucesso!');
      setTimeout(() => setExportSuccessMsg(null), 4000);
    } catch (e: any) {
      console.error('Erro ao gerar PDF do portfólio:', e);
      alert('Erro ao gerar PDF: ' + (e.message || 'Verifique a conexão.'));
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Compartilhar no WhatsApp
  const handleShareWhatsapp = () => {
    const textoMsg = encodeURIComponent(
      `Olá! Veja este trabalho que realizei: *${titulo}*.\n` +
      `Serviço executado por *${nomeTecnico}* (${especialidade}).\n` +
      `Para orçamentos ou visitas técnicas, fale comigo pelo WhatsApp: ${telefone}`
    );
    window.open(`https://wa.me/?text=${textoMsg}`, '_blank');
  };

  return (
    <div className="flex flex-col h-full max-h-[88vh] bg-slate-50 text-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/30">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                Portfólio Digital "Antes & Depois"
              </h2>
              <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full">
                Marketing Pro
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Combine fotos do estado inicial e do serviço finalizado em uma arte profissional para fechar mais clientes.
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

      {/* Feedback Toast */}
      {exportSuccessMsg && (
        <div className="bg-emerald-600 text-white px-6 py-2.5 text-xs font-bold flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>{exportSuccessMsg}</span>
          </div>
          <button onClick={() => setExportSuccessMsg(null)} className="text-white/80 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Controles de Configuração e Upload */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna 1 & 2: Dados e Fotos */}
          <div className="lg:col-span-2 space-y-4">
            {/* Título com sugestões rápidas */}
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-2">
              <label className="text-xs font-black text-slate-900 uppercase tracking-wider">
                Título do Serviço / Obra
              </label>
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ex: Reforma Geral de Quadro de Disjuntores"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              {/* Botões rápidos de sugestão */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {titulosSugeridos.map((sug, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setTitulo(sug)}
                    className="px-2.5 py-1 text-[11px] font-semibold bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 rounded-lg transition border border-slate-200"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </div>

            {/* Slots de Upload das Duas Fotos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Foto ANTES */}
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 text-[11px] font-black uppercase rounded-lg bg-rose-100 text-rose-700 border border-rose-200">
                    ● Foto ANTES
                  </span>
                  {fotoAntes && (
                    <button
                      type="button"
                      onClick={() => setFotoAntes(null)}
                      className="text-xs text-rose-600 hover:underline font-bold"
                    >
                      Remover
                    </button>
                  )}
                </div>

                <div
                  onClick={() => fileInputAntesRef.current?.click()}
                  className="h-44 rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50 flex flex-col items-center justify-center p-3 cursor-pointer transition overflow-hidden group"
                >
                  {fotoAntes ? (
                    <img src={fotoAntes} alt="Antes" className="h-full w-full object-cover rounded-lg" />
                  ) : (
                    <div className="text-center space-y-1">
                      <ImageIcon className="w-8 h-8 text-slate-400 mx-auto group-hover:text-blue-600 transition" />
                      <p className="text-xs font-bold text-slate-700">Carregar Foto do "Antes"</p>
                      <p className="text-[10px] text-slate-400">Estado inicial / defeito</p>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputAntesRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'antes')}
                  className="hidden"
                />
              </div>

              {/* Foto DEPOIS */}
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 text-[11px] font-black uppercase rounded-lg bg-emerald-100 text-emerald-700 border border-emerald-200">
                    ★ Foto DEPOIS
                  </span>
                  {fotoDepois && (
                    <button
                      type="button"
                      onClick={() => setFotoDepois(null)}
                      className="text-xs text-emerald-600 hover:underline font-bold"
                    >
                      Remover
                    </button>
                  )}
                </div>

                <div
                  onClick={() => fileInputDepoisRef.current?.click()}
                  className="h-44 rounded-xl border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50 flex flex-col items-center justify-center p-3 cursor-pointer transition overflow-hidden group"
                >
                  {fotoDepois ? (
                    <img src={fotoDepois} alt="Depois" className="h-full w-full object-cover rounded-lg" />
                  ) : (
                    <div className="text-center space-y-1">
                      <ImageIcon className="w-8 h-8 text-slate-400 mx-auto group-hover:text-emerald-600 transition" />
                      <p className="text-xs font-bold text-slate-700">Carregar Foto do "Depois"</p>
                      <p className="text-[10px] text-slate-400">Serviço concluído e perfeito</p>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputDepoisRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'depois')}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {/* Coluna 3: Identificação & Seletor de Cores de Moldura */}
          <div className="space-y-4">
            {/* Seletor de Cor da Moldura */}
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Palette className="w-4 h-4 text-blue-600" />
                  Cor da Moldura & Destaque
                </label>
                <div
                  className="w-4 h-4 rounded-full border border-black/20"
                  style={{ backgroundColor: borderColor }}
                ></div>
              </div>

              <p className="text-[11px] text-slate-500">
                A cor moldará as fotos, a divisória e a faixa de contacto inferior.
              </p>

              <div className="grid grid-cols-4 gap-2">
                {BORDER_PALETTE.map((c) => {
                  const isSelected = borderColor.toLowerCase() === c.hex.toLowerCase();
                  return (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => setBorderColor(c.hex)}
                      className={`flex flex-col items-center p-1.5 rounded-lg border-2 transition ${
                        isSelected
                          ? 'border-slate-900 shadow-sm bg-slate-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                      title={c.name}
                    >
                      <div
                        className="w-5 h-5 rounded-full shadow-inner flex items-center justify-center border border-black/10"
                        style={{ backgroundColor: c.hex }}
                      >
                        {isSelected && <Check className="w-3 h-3 text-white stroke-[3]" />}
                      </div>
                      <span className="text-[9px] font-bold text-slate-600 truncate max-w-full mt-1">
                        {c.name.split(' ')[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dados do Cartão do Técnico */}
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-2.5">
              <label className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-4 h-4 text-blue-600" />
                Dados na Tarja Inferior
              </label>

              {/* Logotipo do Técnico (Exibido imediatamente antes do Nome) */}
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-600 flex items-center gap-1">
                    <Building className="w-3.5 h-3.5 text-blue-600" />
                    Logotipo do Técnico (Antes do Nome)
                  </span>
                  {logoBase64 && (
                    <button
                      type="button"
                      onClick={() => setLogoBase64(null)}
                      className="text-[10px] text-rose-600 hover:underline font-bold"
                    >
                      Remover
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <div
                    onClick={() => fileInputLogoRef.current?.click()}
                    className="w-14 h-14 rounded-lg border-2 border-dashed border-slate-300 hover:border-blue-500 bg-white flex items-center justify-center cursor-pointer overflow-hidden shrink-0 group transition shadow-sm"
                    title="Toque para alterar imagem da logo"
                  >
                    {logoBase64 ? (
                      <img src={logoBase64} alt="Logotipo" className="w-full h-full object-contain p-1" />
                    ) : (
                      <div className="text-center">
                        <Building className="w-5 h-5 text-slate-400 mx-auto group-hover:text-blue-600 transition" />
                        <span className="text-[8px] font-bold text-slate-400 block mt-0.5">Sem Logo</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-1">
                    <button
                      type="button"
                      onClick={() => fileInputLogoRef.current?.click()}
                      className="w-full px-3 py-1.5 bg-white hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 border border-slate-200 text-slate-700 font-bold rounded-lg text-xs transition flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Building className="w-3.5 h-3.5 text-blue-600" />
                      <span>{logoBase64 ? 'Alterar Logotipo' : 'Anexar Logotipo'}</span>
                    </button>
                    <p className="text-[9px] text-slate-400 leading-tight">
                      Aparece no banner inferior imediatamente antes do seu nome comercial.
                    </p>
                    <input
                      ref={fileInputLogoRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = () => setLogoBase64(reader.result as string);
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </div>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-500">Nome Comercial / Empresa</span>
                <input
                  type="text"
                  value={nomeTecnico}
                  onChange={(e) => setNomeTecnico(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-500">Especialidade</span>
                <input
                  type="text"
                  value={especialidade}
                  onChange={(e) => setEspecialidade(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-500">WhatsApp / Telefone</span>
                <input
                  type="text"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Pré-visualização ao Vivo do Canvas Oficial */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              Pré-visualização Oficial em Tempo Real (Canvas HD 1200x800)
            </h3>
            <span className="text-[11px] font-bold text-slate-500">
              Pronto para WhatsApp, Redes Sociais ou PDF Técnico
            </span>
          </div>

          <div className="bg-slate-900 rounded-xl p-2 sm:p-4 overflow-hidden flex items-center justify-center border border-slate-800 shadow-inner">
            <canvas
              ref={canvasRef}
              className="max-w-full h-auto rounded-lg shadow-2xl border border-slate-700"
              style={{ maxHeight: '420px', objectFit: 'contain' }}
            />
          </div>
        </div>
      </div>

      {/* Footer com Ações de Exportação */}
      <div className="px-6 py-4 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleShareWhatsapp}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-2 transition shadow-sm"
          >
            <Share2 className="w-4 h-4" />
            <span>Compartilhar no WhatsApp</span>
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
            onClick={handleGeneratePdf}
            disabled={isGeneratingPdf}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-xs flex items-center gap-2 transition shadow-sm disabled:opacity-50"
          >
            {isGeneratingPdf ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                <span>Gerando PDF...</span>
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 text-blue-400" />
                <span>Exportar Relatório em PDF</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDownloadImage}
            disabled={isExporting}
            className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-black text-xs shadow-md hover:shadow-lg transition flex items-center gap-2 disabled:opacity-50"
          >
            {isExporting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                <span>Exportando...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Baixar Imagem em Alta Resolução (PNG)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export const PortfolioModal: React.FC<PortfolioModalProps> = ({ isOpen = true, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-5xl">
        <PortfolioModalContent onClose={onClose} />
      </div>
    </div>
  );
};

export default PortfolioModal;
