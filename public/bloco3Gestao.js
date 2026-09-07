/**
 * TécnicaMZ Pro - Kit Eletricista & Técnico PRO
 * BLOCO 3: GESTÃO PROFISSIONAL (Ferramentas 10 a 13)
 * 
 * 10. Agenda + Lembretes (Visitas técnicas com lembrete via WhatsApp https://wa.me/...)
 * 11. Controle de Gastos e Lucro (Receitas, Despesas, Lucro Líquido Real e Margem %)
 * 12. Portfólio Digital (Antes & Depois com fotos Base64 e galeria visual)
 * 13. Gerador de Certificado de Garantia em PDF (via pdfmake com selo e cabeçalho institucional)
 */

/* ==========================================================================
   FERRAMENTA 10: AGENDA + LEMBRETES COM DISPARO WHATSAPP
   ========================================================================== */
const AGENDA_STORAGE_KEY = 'tecnicamz_pro_agenda_visitas';

const AgendaTecnica = {
  listar() {
    try {
      const dados = localStorage.getItem(AGENDA_STORAGE_KEY);
      return dados ? JSON.parse(dados) : this._agendamentosExemplo();
    } catch (e) {
      console.warn('[AgendaTecnica] Erro ao carregar agenda:', e);
      return this._agendamentosExemplo();
    }
  },

  salvar(visita) {
    try {
      const lista = this.listar();
      const agora = new Date().toISOString();
      let registro = null;

      if (visita.id) {
        const idx = lista.findIndex(v => String(v.id) === String(visita.id));
        if (idx >= 0) {
          lista[idx] = { ...lista[idx], ...visita, atualizadoEm: agora };
          registro = lista[idx];
        }
      }

      if (!registro) {
        registro = {
          id: `vis_${Date.now()}`,
          cliente: visita.cliente || 'Cliente',
          telefone: visita.telefone || '',
          data: visita.data || new Date().toISOString().split('T')[0],
          horario: visita.horario || '09:00',
          endereco: visita.endereco || 'Maputo',
          tipoServico: visita.tipoServico || 'Vistoria Elétrica',
          valorEstimado: Number(visita.valorEstimado || 0),
          status: visita.status || 'Agendado', // 'Agendado' | 'Em Andamento' | 'Concluído' | 'Cancelado'
          notas: visita.notas || '',
          criadoEm: agora
        };
        lista.unshift(registro);
      }

      localStorage.setItem(AGENDA_STORAGE_KEY, JSON.stringify(lista));
      return { success: true, visita: registro };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  atualizarStatus(id, novoStatus) {
    const lista = this.listar();
    const item = lista.find(v => String(v.id) === String(id));
    if (item) {
      item.status = novoStatus;
      item.atualizadoEm = new Date().toISOString();
      localStorage.setItem(AGENDA_STORAGE_KEY, JSON.stringify(lista));
      return { success: true, visita: item };
    }
    return { success: false, error: 'Agendamento não encontrado.' };
  },

  remover(id) {
    let lista = this.listar();
    lista = lista.filter(v => String(v.id) !== String(id));
    localStorage.setItem(AGENDA_STORAGE_KEY, JSON.stringify(lista));
    return { success: true };
  },

  // Gera o link do WhatsApp para envio direto do lembrete de visita técnica
  gerarLinkWhatsApp(visitaId) {
    const lista = this.listar();
    const v = lista.find(item => String(item.id) === String(visitaId));
    if (!v) throw new Error('Agendamento não encontrado.');

    const perfilHelper = (typeof window !== 'undefined' && window.PerfilTecnico) ? window.PerfilTecnico : null;
    const perfil = perfilHelper ? perfilHelper.obter() : { nome: 'TécnicaMZ Pro', telefone: '+258 84 000 0000' };

    // Limpa e normaliza telefone com código de Moçambique (+258)
    let telLimpo = (v.telefone || '').replace(/\D/g, '');
    if (telLimpo.startsWith('0')) telLimpo = telLimpo.slice(1);
    if (!telLimpo.startsWith('258') && telLimpo.length <= 9) {
      telLimpo = `258${telLimpo}`;
    }

    const mensagem = `Olá, *${v.cliente}*! Tudo bem?
Aqui é da equipe *${perfil.nome}*.

Passando para confirmar a sua visita técnica:
📅 *Data:* ${v.data}
⏰ *Horário:* ${v.horario}
🔧 *Serviço:* ${v.tipoServico}
📍 *Local:* ${v.endereco}

Favor confirmar se o horário continua conveniente para você respondendo a esta mensagem.
Contacto direto: ${perfil.telefone}. Obrigado!`;

    const url = `https://wa.me/${telLimpo}?text=${encodeURIComponent(mensagem)}`;
    return {
      telefoneFormatado: telLimpo,
      mensagem,
      urlWhatsApp: url
    };
  },

  _agendamentosExemplo() {
    const hoje = new Date().toISOString().split('T')[0];
    return [
      {
        id: 'vis_01',
        cliente: 'Eng. Nelson Cossa',
        telefone: '+258 84 333 4455',
        data: hoje,
        horario: '10:00',
        endereco: 'Av. Vladimir Lenine, Bairro Central',
        tipoServico: 'Substituição de Quadro de Distribuição Antigo',
        valorEstimado: 4500,
        status: 'Agendado',
        notas: 'Cliente solicitou que o disjuntor geral seja de 40A.'
      },
      {
        id: 'vis_02',
        cliente: 'Dona Teresa Manjate',
        telefone: '+258 82 777 8899',
        data: hoje,
        horario: '14:30',
        endereco: 'Matola Rio, Rua das Acácias nº 14',
        tipoServico: 'Instalação de Chuveiro Elétrico e IDR 30mA',
        valorEstimado: 3200,
        status: 'Agendado',
        notas: 'Verificar se a fiação existente é de 4mm².'
      }
    ];
  }
};

/* ==========================================================================
   FERRAMENTA 11: CONTROLE DE GASTOS E LUCRO REAL POR OBRA
   ========================================================================== */
const FINANCEIRO_STORAGE_KEY = 'tecnicamz_pro_controle_financeiro';

const ControleFinanceiroObra = {
  listarObras() {
    try {
      const dados = localStorage.getItem(FINANCEIRO_STORAGE_KEY);
      return dados ? JSON.parse(dados) : this._obrasExemplo();
    } catch (e) {
      console.warn('[ControleFinanceiro] Erro ao carregar dados:', e);
      return this._obrasExemplo();
    }
  },

  obterObra(obraId) {
    const obras = this.listarObras();
    return obras.find(o => String(o.id) === String(obraId)) || null;
  },

  salvarObra(obra) {
    try {
      const obras = this.listarObras();
      const agora = new Date().toISOString();
      let encontrada = null;

      if (obra.id) {
        const idx = obras.findIndex(o => String(o.id) === String(obra.id));
        if (idx >= 0) {
          obras[idx] = { ...obras[idx], ...obra, atualizadoEm: agora };
          encontrada = obras[idx];
        }
      }

      if (!encontrada) {
        encontrada = {
          id: `obr_${Date.now()}`,
          titulo: obra.titulo || 'Nova Obra Elétrica',
          cliente: obra.cliente || 'Cliente Particular',
          dataInicio: obra.dataInicio || new Date().toISOString().split('T')[0],
          status: obra.status || 'Em Execução', // 'Em Execução' | 'Finalizada'
          receitas: obra.receitas || [], // [{ descricao, valor, data }]
          despesas: obra.despesas || [], // [{ categoria, descricao, valor, data }]
          criadoEm: agora
        };
        obras.unshift(encontrada);
      }

      localStorage.setItem(FINANCEIRO_STORAGE_KEY, JSON.stringify(obras));
      return { success: true, obra: encontrada, metricas: this.calcularMetricas(encontrada.id) };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  adicionarTransacao(obraId, tipo, transacao) {
    try {
      const obras = this.listarObras();
      const idx = obras.findIndex(o => String(o.id) === String(obraId));
      if (idx === -1) return { success: false, error: 'Obra não encontrada.' };

      const novaTransacao = {
        id: `tx_${Date.now()}`,
        descricao: transacao.descricao || 'Lançamento',
        valor: Math.abs(Number(transacao.valor || 0)),
        data: transacao.data || new Date().toLocaleDateString('pt-MZ'),
        categoria: transacao.categoria || (tipo === 'receita' ? 'Mão de Obra' : 'Materiais')
      };

      if (tipo === 'receita') {
        obras[idx].receitas = obras[idx].receitas || [];
        obras[idx].receitas.unshift(novaTransacao);
      } else {
        obras[idx].despesas = obras[idx].despesas || [];
        obras[idx].despesas.unshift(novaTransacao);
      }

      obras[idx].atualizadoEm = new Date().toISOString();
      localStorage.setItem(FINANCEIRO_STORAGE_KEY, JSON.stringify(obras));
      return { success: true, obra: obras[idx], metricas: this.calcularMetricas(obraId) };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  calcularMetricas(obraId) {
    const obra = this.obterObra(obraId);
    if (!obra) return null;

    const totalReceitas = (obra.receitas || []).reduce((acc, r) => acc + Number(r.valor || 0), 0);
    const totalDespesas = (obra.despesas || []).reduce((acc, d) => acc + Number(d.valor || 0), 0);
    const lucroLiquidoReal = totalReceitas - totalDespesas;
    const margemPercentual = totalReceitas > 0 ? (lucroLiquidoReal / totalReceitas) * 100 : 0;

    let avaliacaoRentabilidade = 'Alta Rentabilidade';
    if (lucroLiquidoReal < 0) avaliacaoRentabilidade = 'Prejuízo Operacional';
    else if (margemPercentual < 20) avaliacaoRentabilidade = 'Margem Apertada (Abaixo de 20%)';
    else if (margemPercentual <= 40) avaliacaoRentabilidade = 'Rentabilidade Saudável';

    return {
      obraId: obra.id,
      tituloObra: obra.titulo,
      totalReceitas: Math.round(totalReceitas * 100) / 100,
      totalDespesas: Math.round(totalDespesas * 100) / 100,
      lucroLiquidoReal: Math.round(lucroLiquidoReal * 100) / 100,
      margemPercentual: Math.round(margemPercentual * 10) / 10,
      avaliacaoRentabilidade,
      resumoFormatado: {
        receitas: `${totalReceitas.toLocaleString('pt-MZ', { minimumFractionDigits: 2 })} MZN`,
        despesas: `${totalDespesas.toLocaleString('pt-MZ', { minimumFractionDigits: 2 })} MZN`,
        lucro: `${lucroLiquidoReal.toLocaleString('pt-MZ', { minimumFractionDigits: 2 })} MZN`,
        margem: `${margemPercentual.toFixed(1)}%`
      }
    };
  },

  _obrasExemplo() {
    return [
      {
        id: 'obr_101',
        titulo: 'Instalação Elétrica Completa Residência T3',
        cliente: 'Sr. Alberto Machava',
        dataInicio: '2026-02-10',
        status: 'Em Execução',
        receitas: [
          { id: 'r1', descricao: 'Entrada 50% Contrato', valor: 25000, data: '10/02/2026', categoria: 'Mão de Obra' },
          { id: 'r2', descricao: 'Parcial - Conclusão da Tubulação', valor: 15000, data: '22/02/2026', categoria: 'Mão de Obra' }
        ],
        despesas: [
          { id: 'd1', descricao: 'Eletrodutos, caixas e luvas', valor: 4800, data: '11/02/2026', categoria: 'Materiais' },
          { id: 'd2', descricao: 'Diárias Ajudante (5 dias)', valor: 3500, data: '18/02/2026', categoria: 'Mão de Obra Terceira' },
          { id: 'd3', descricao: 'Combustível / Deslocações', valor: 2200, data: '20/02/2026', categoria: 'Transporte' }
        ]
      }
    ];
  }
};

/* ==========================================================================
   FERRAMENTA 12: PORTFÓLIO DIGITAL (ANTES & DEPOIS)
   ========================================================================== */
const PORTFOLIO_STORAGE_KEY = 'tecnicamz_pro_portfolio_digital';

const PortfolioDigital = {
  listar() {
    try {
      const dados = localStorage.getItem(PORTFOLIO_STORAGE_KEY);
      return dados ? JSON.parse(dados) : this._itensExemplo();
    } catch (e) {
      console.warn('[PortfolioDigital] Erro ao carregar portfólio:', e);
      return this._itensExemplo();
    }
  },

  adicionarItem(item) {
    try {
      const lista = this.listar();
      const novoItem = {
        id: `port_${Date.now()}`,
        titulo: item.titulo || 'Serviço Elétrico Realizado',
        categoria: item.categoria || 'Quadro de Distribuição',
        cliente: item.cliente || 'Cliente Confidencial',
        data: item.data || new Date().toLocaleDateString('pt-MZ'),
        descricao: item.descricao || 'Modernização e adequação às normas de segurança da EDM.',
        fotoAntesBase64: item.fotoAntesBase64 || null,
        fotoDepoisBase64: item.fotoDepoisBase64 || null,
        destaque: Boolean(item.destaque),
        criadoEm: new Date().toISOString()
      };

      lista.unshift(novoItem);
      localStorage.setItem(PORTFOLIO_STORAGE_KEY, JSON.stringify(lista));
      return { success: true, item: novoItem };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  removerItem(id) {
    let lista = this.listar();
    lista = lista.filter(item => String(item.id) !== String(id));
    localStorage.setItem(PORTFOLIO_STORAGE_KEY, JSON.stringify(lista));
    return { success: true };
  },

  filtrarPorCategoria(categoria) {
    const lista = this.listar();
    if (!categoria || categoria === 'Todos') return lista;
    return lista.filter(item => (item.categoria || '').toLowerCase() === categoria.toLowerCase());
  },

  _itensExemplo() {
    return [
      {
        id: 'port_01',
        titulo: 'Reforma e Padronização de QG Antigo',
        categoria: 'Quadros e Painéis',
        cliente: 'Edifício Jat 4, Maputo',
        data: '18/01/2026',
        descricao: 'Substituição de disjuntores pretos antigos por disjuntores DIN Curva C, barramento pente de cobre e instalação de proteção IDR 30mA.',
        fotoAntesBase64: null, // placeholder em uso real
        fotoDepoisBase64: null,
        destaque: true
      },
      {
        id: 'port_02',
        titulo: 'Instalação de Sistema de Proteção Contra Surtos (DPS)',
        categoria: 'Proteção & Aterramento',
        cliente: 'Residência Sommerschield',
        data: '05/02/2026',
        descricao: 'Instalação de 4 módulos DPS Classe II e malha de aterramento equipotencializada com medição por terrômetro (R = 4.2 Ohms).',
        fotoAntesBase64: null,
        fotoDepoisBase64: null,
        destaque: false
      }
    ];
  },

  async gerarImagemPortfolio(dados = {}) {
    return gerarImagemPortfolio(dados);
  }
};

/* ==========================================================================
   FUNÇÃO GLOBAL: gerarImagemPortfolio (CANVAS HTML5 COM TÍTULO E WHITE-LABEL)
   ========================================================================== */
async function gerarImagemPortfolio(dados = {}) {
  const nomeTecnico = (typeof localStorage !== 'undefined' && localStorage.getItem('tecnico_nome')) || 'Profissional Técnico';
  const sloganTecnico = (typeof localStorage !== 'undefined' && localStorage.getItem('tecnico_slogan')) || 'Instalações Elétricas & Engenharia Especializada';
  const logoTecnico = (typeof localStorage !== 'undefined' && localStorage.getItem('tecnico_logo')) || null;
  const telefoneTecnico = (typeof localStorage !== 'undefined' && localStorage.getItem('tecnico_telefone')) || '+258 84 000 0000';
  const cidadeTecnico = (typeof localStorage !== 'undefined' && localStorage.getItem('tecnico_cidade')) || 'Maputo';

  const tituloObra = (dados.titulo || dados.tituloObra || 'Reforma e Modernização de Instalação Elétrica').trim();
  const fotoAntes = dados.fotoAntes || dados.fotoAntesBase64;
  const fotoDepois = dados.fotoDepois || dados.fotoDepoisBase64;

  if (!fotoAntes || !fotoDepois) {
    throw new Error('Por favor, forneça as fotos do ANTES e do DEPOIS para compor o portfólio.');
  }

  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 780;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Não foi possível obter o contexto 2D do Canvas.');

  // Fundo Geral Escuro Premium
  ctx.fillStyle = '#090d16';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 1. CABEÇALHO SUPERIOR COM O TÍTULO DA OBRA EM DESTAQUE
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, 1200, 95);

  // Barra de acento azul no topo
  const gradienteTopo = ctx.createLinearGradient(0, 0, 1200, 0);
  gradienteTopo.addColorStop(0, '#0284c7');
  gradienteTopo.addColorStop(0.5, '#38bdf8');
  gradienteTopo.addColorStop(1, '#0284c7');
  ctx.fillStyle = gradienteTopo;
  ctx.fillRect(0, 0, 1200, 4);

  // Tag Superior de Categoria
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText('PORTFÓLIO TÉCNICO OFICIAL • ANTES & DEPOIS', 35, 28);

  // TÍTULO DA OBRA CAPTURADO DO FORMULÁRIO DESENHADO NO CANVAS
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px sans-serif';
  let tituloFormatado = tituloObra;
  if (ctx.measureText(tituloFormatado).width > 850) {
    while (ctx.measureText(tituloFormatado + '...').width > 850 && tituloFormatado.length > 10) {
      tituloFormatado = tituloFormatado.slice(0, -1);
    }
    tituloFormatado += '...';
  }
  ctx.fillText(tituloFormatado.toUpperCase(), 35, 62);

  // Data / Local no canto direito do cabeçalho
  ctx.fillStyle = '#94a3b8';
  ctx.font = '13px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(new Date().toLocaleDateString('pt-MZ') + ` | ${cidadeTecnico}`, 1165, 62);
  ctx.textAlign = 'left';

  // Divisor inferior do cabeçalho
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, 95);
  ctx.lineTo(1200, 95);
  ctx.stroke();

  // 2. FOTOS LADO A LADO
  const carregarImg = (src) => new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(new Error('Erro ao carregar imagem para fusão no Canvas.'));
    img.src = src;
  });

  const [imgAntes, imgDepois] = await Promise.all([carregarImg(fotoAntes), carregarImg(fotoDepois)]);

  const fotoW = 570;
  const fotoH = 525;
  const fotoY = 110;

  // Foto Antes (Esquerda: X = 20)
  ctx.drawImage(imgAntes, 20, fotoY, fotoW, fotoH);
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 2;
  ctx.strokeRect(20, fotoY, fotoW, fotoH);

  // Badge ANTES
  ctx.fillStyle = '#dc2626';
  ctx.fillRect(35, fotoY + 15, 130, 36);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 18px sans-serif';
  ctx.fillText('ANTES', 65, fotoY + 40);

  // Foto Depois (Direita: X = 610)
  ctx.drawImage(imgDepois, 610, fotoY, fotoW, fotoH);
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 2;
  ctx.strokeRect(610, fotoY, fotoW, fotoH);

  // Badge DEPOIS
  ctx.fillStyle = '#059669';
  ctx.fillRect(625, fotoY + 15, 130, 36);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 18px sans-serif';
  ctx.fillText('DEPOIS', 655, fotoY + 40);

  // 3. RODAPÉ INFERIOR WHITE-LABEL COM A MARCA DO TÉCNICO
  const rodapeY = 650;
  ctx.fillStyle = '#0b1120';
  ctx.fillRect(0, rodapeY, 1200, 130);

  // Linha divisória
  ctx.strokeStyle = '#0284c7';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, rodapeY);
  ctx.lineTo(1200, rodapeY);
  ctx.stroke();

  let offsetTextoX = 35;
  if (logoTecnico) {
    try {
      const imgLogo = await carregarImg(logoTecnico);
      ctx.drawImage(imgLogo, 35, rodapeY + 20, 80, 80);
      offsetTextoX = 130;
    } catch (e) {
      offsetTextoX = 35;
    }
  }

  // Nome do profissional / empresa
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 24px sans-serif';
  ctx.fillText(nomeTecnico.toUpperCase(), offsetTextoX, rodapeY + 52);

  // Slogan
  ctx.fillStyle = '#94a3b8';
  ctx.font = 'italic 15px sans-serif';
  ctx.fillText(sloganTecnico, offsetTextoX, rodapeY + 84);

  // Contato no canto direito
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(`WhatsApp: ${telefoneTecnico}`, 1165, rodapeY + 54);

  ctx.fillStyle = '#38bdf8';
  ctx.font = '14px sans-serif';
  ctx.fillText('Atendimento Técnico Profissional Especializado', 1165, rodapeY + 82);
  ctx.textAlign = 'left';

  const dataUrl = canvas.toDataURL('image/png');
  if (dados.acao !== 'no-download') {
    const link = document.createElement('a');
    link.download = `Portfolio_${(tituloObra).replace(/\s+/g, '_')}_${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  }

  return { dataUrl, canvas };
}

/* ==========================================================================
   FERRAMENTA 13: GERADOR DE CERTIFICADO DE GARANTIA EM PDF
   ========================================================================== */
const CertificadoGarantia = {
  async gerarPDF(dadosGarantia, acao = 'download') {
    if (typeof window !== 'undefined' && (!window.pdfMake || !window.pdfMake.vfs)) {
      const loadScript = (url) => new Promise((res, rej) => {
        const s = document.createElement('script');
        s.src = url;
        s.onload = res;
        s.onerror = rej;
        document.head.appendChild(s);
      });
      if (!window.pdfMake) await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/pdfmake.min.js');
      if (!window.pdfMake.vfs) await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/vfs_fonts.js');
    }

    const perfilHelper = (typeof window !== 'undefined' && window.PerfilTecnico) ? window.PerfilTecnico : null;
    const perfil = perfilHelper ? perfilHelper.obter() : {
      nome: 'Eletricista Profissional',
      slogan: 'Serviços Especializados de Instalação Elétrica',
      telefone: '+258 84 000 0000',
      cidade: 'Maputo'
    };

    const g = {
      numeroCertificado: dadosGarantia.numeroCertificado || `GAR-${Date.now().toString().slice(-6)}`,
      numeroOS: dadosGarantia.numeroOS || 'OS-2026-REF',
      cliente: dadosGarantia.cliente || 'Cliente Contratante',
      telefoneCliente: dadosGarantia.telefoneCliente || '',
      enderecoObra: dadosGarantia.enderecoObra || 'Endereço da Instalação',
      servicosCobertos: dadosGarantia.servicosCobertos || 'Instalação e adequação de circuitos elétricos, conexões de barramentos e dispositivos de proteção.',
      dataInicio: dadosGarantia.dataInicio || new Date().toLocaleDateString('pt-MZ'),
      prazoDias: Number(dadosGarantia.prazoDias || 90),
      exclusoes: dadosGarantia.exclusoes || 'Variações anormais de sobretensão da rede externa sem DPS, queima por tempestades com descargas diretas, modificação dos circuitos por pessoas não autorizadas ou sobrecarga induzida propositalmente.'
    };

    // Calcula data de término da garantia
    const dtInicio = new Date();
    const dtFim = new Date(dtInicio.getTime() + (g.prazoDias * 24 * 60 * 60 * 1000));
    const dataFimFormatada = dtFim.toLocaleDateString('pt-MZ');

    const cabecalhoPDF = perfilHelper ? perfilHelper.gerarCabecalhoPDF(
      'CERTIFICADO DE GARANTIA TÉCNICA',
      `Certificado Oficial Nº: ${g.numeroCertificado} | Ref. OS: ${g.numeroOS}`
    ) : [];

    const docDef = {
      pageSize: 'A4',
      pageMargins: [35, 25, 35, 25],
      content: [
        ...cabecalhoPDF,

        // Selo Destaque de Garantia
        {
          table: {
            widths: ['*'],
            body: [[
              {
                fillColor: '#0f172a',
                stack: [
                  { text: `★ GARANTIA DE SERVIÇOS TÉCNICOS: ${perfil.nome.toUpperCase()} ★`, bold: true, fontSize: 10, color: '#38bdf8', alignment: 'center' },
                  { text: `Vigência Assegurada: ${g.prazoDias} DIAS DE COBERTURA INTEGRAL`, bold: true, fontSize: 13, color: '#ffffff', alignment: 'center', margin: [0, 3, 0, 2] },
                  { text: `Período: ${g.dataInicio} até ${dataFimFormatada}`, fontSize: 8.5, color: '#bae6fd', alignment: 'center' }
                ],
                margin: [6, 6, 6, 6]
              }
            ]]
          },
          layout: 'noBorders',
          margin: [0, 0, 0, 10]
        },

        // Bloco do Beneficiário
        {
          table: {
            widths: ['*'],
            body: [[
              {
                fillColor: '#f8fafc',
                stack: [
                  { text: 'BENEFICIÁRIO & LOCAL DA EXECUÇÃO:', bold: true, fontSize: 8.5, color: '#0369a1', margin: [0, 0, 0, 3] },
                  { text: [{ text: 'Cliente: ', bold: true }, g.cliente, ' | ', { text: 'Telefone: ', bold: true }, g.telefoneCliente || '---'], fontSize: 8 },
                  { text: [{ text: 'Endereço da Instalação: ', bold: true }, g.enderecoObra], fontSize: 8, margin: [0, 2, 0, 0] }
                ],
                margin: [4, 4, 4, 4]
              }
            ]]
          },
          layout: 'lightHorizontalLines',
          margin: [0, 0, 0, 12]
        },

        // Escopo dos Serviços Cobertos
        {
          table: {
            widths: ['*'],
            body: [[
              {
                stack: [
                  { text: 'ESCOPO DOS SERVIÇOS COBERTOS POR ESTA GARANTIA:', bold: true, fontSize: 8.5, color: '#0f172a', margin: [0, 0, 0, 3] },
                  { text: g.servicosCobertos, fontSize: 8, color: '#334155', lineHeight: 1.3 }
                ],
                margin: [4, 4, 4, 4]
              }
            ]]
          },
          layout: 'lightHorizontalLines',
          margin: [0, 0, 0, 12]
        },

        // Termos e Condições
        {
          stack: [
            { text: 'TERMOS E CONDIÇÕES DE COBERTURA:', bold: true, fontSize: 8.5, color: '#0f172a', margin: [0, 0, 0, 2] },
            { text: '1. A presente garantia assegura a revisão e reparo gratuito de quaisquer defeitos provenientes exclusivamente de mão de obra ou aperto incorreto realizado pelo técnico responsável.', fontSize: 7.5, color: '#475569', margin: [0, 1, 0, 1] },
            { text: '2. Equipamentos fornecidos por terceiros ou pelo próprio cliente possuem garantia vinculada unicamente ao fabricante dos mesmos.', fontSize: 7.5, color: '#475569', margin: [0, 1, 0, 1] },
            { text: `3. Hipóteses de Perda da Garantia: ${g.exclusoes}`, fontSize: 7.5, color: '#dc2626', margin: [0, 1, 0, 1] },
            { text: '4. Para acionar o suporte de garantia, apresente este certificado ou informe o número da OS.', fontSize: 7.5, color: '#475569', margin: [0, 1, 0, 1] }
          ],
          margin: [0, 0, 0, 25]
        },

        // Bloco de Assinaturas e Autenticação
        {
          columns: [
            {
              stack: [
                { canvas: [{ type: 'line', x1: 20, y1: 0, x2: 200, y2: 0, lineWidth: 1, lineColor: '#94a3b8' }] },
                { text: perfil.nome, fontSize: 8, bold: true, alignment: 'center', margin: [0, 4, 0, 0] },
                { text: 'Técnico Responsável Credenciado', fontSize: 7, color: '#64748b', alignment: 'center' },
                { text: `Contato: ${perfil.telefone}`, fontSize: 7, color: '#0284c7', alignment: 'center' }
              ]
            },
            {
              stack: [
                {
                  table: {
                    widths: ['*'],
                    body: [[
                      {
                        fillColor: '#f1f5f9',
                        stack: [
                          { text: 'SELADO E REGISTRADO', bold: true, fontSize: 7.5, color: '#166534', alignment: 'center' },
                          { text: 'TÉCNICAMZ PRO - MOÇAMBIQUE', fontSize: 7, color: '#15803d', alignment: 'center' },
                          { text: `Data: ${g.dataInicio}`, fontSize: 6.5, color: '#64748b', alignment: 'center' }
                        ],
                        margin: [2, 2, 2, 2]
                      }
                    ]]
                  },
                  layout: 'noBorders',
                  width: 150,
                  alignment: 'center'
                }
              ]
            }
          ]
        }
      ]
    };

    const pdf = window.pdfMake.createPdf(docDef);
    if (acao === 'download') {
      pdf.download(`Certificado_Garantia_${g.numeroCertificado}.pdf`);
    } else {
      pdf.open();
    }
    return docDef;
  }
};

// Exporta globalmente para uso direto em Vanilla JS e Módulos
if (typeof window !== 'undefined') {
  window.gerarImagemPortfolio = gerarImagemPortfolio;
  window.AgendaTecnica = AgendaTecnica;
  window.ControleFinanceiroObra = ControleFinanceiroObra;
  window.PortfolioDigital = PortfolioDigital;
  window.CertificadoGarantia = CertificadoGarantia;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    AgendaTecnica,
    ControleFinanceiroObra,
    PortfolioDigital,
    CertificadoGarantia
  };
}
