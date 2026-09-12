/**
 * TécnicaMZ Pro - Kit Eletricista & Técnico PRO
 * BLOCO 4: COMUNIDADE E APOIO (Ferramentas 14 e 15)
 * 
 * 14. Botão "Socorro na Obra" (Mural comunitário de dúvidas técnicas urgentes e socorro via WhatsApp)
 * 15. Cotação de Material (Busca e comparação de preços de insumos elétricos com catálogo de lojas parceiras)
 */

/* ==========================================================================
   FERRAMENTA 14: BOTÃO "SOCORRO NA OBRA" (MURAL COMUNITÁRIO DE DÚVIDAS URGENTES)
   ========================================================================== */
const SOCORRO_STORAGE_KEY = 'tecnicamz_pro_socorro_obra';

const SocorroNaObra = {
  listar(filtro = {}) {
    try {
      const dados = localStorage.getItem(SOCORRO_STORAGE_KEY);
      let lista = dados ? JSON.parse(dados) : this._duvidasExemplo();

      if (filtro.categoria && filtro.categoria !== 'Todas') {
        lista = lista.filter(d => (d.categoria || '').toLowerCase() === filtro.categoria.toLowerCase());
      }
      if (filtro.urgencia && filtro.urgencia !== 'Todas') {
        lista = lista.filter(d => (d.urgencia || '').toLowerCase() === filtro.urgencia.toLowerCase());
      }
      if (filtro.apenasAbertas) {
        lista = lista.filter(d => d.status === 'Aberto');
      }

      return lista;
    } catch (e) {
      console.warn('[SocorroNaObra] Erro ao carregar dúvidas:', e);
      return this._duvidasExemplo();
    }
  },

  obterPorId(id) {
    const lista = this.listar();
    return lista.find(d => String(d.id) === String(id)) || null;
  },

  publicarDuvida(dados) {
    try {
      const lista = this.listar();
      const perfilHelper = (typeof window !== 'undefined' && window.PerfilTecnico) ? window.PerfilTecnico : null;
      const perfil = perfilHelper ? perfilHelper.obter() : { nome: 'Técnico na Obra', telefone: '+258 84 000 0000' };

      const novaDuvida = {
        id: `soc_${Date.now()}`,
        titulo: dados.titulo || 'Dúvida Urgente na Instalação',
        descricao: dados.descricao || 'Necessito de suporte técnico para diagnóstico no local.',
        categoria: dados.categoria || 'Quadro Geral / Disjuntor', // 'Curto-circuito' | 'Disjuntor Desarmando' | 'Aterramento' | 'Motor Trifásico' | 'Inversor Solar' | 'Queda de Tensão'
        urgencia: dados.urgencia || 'Alta - Obra Parada', // 'Alta - Obra Parada' | 'Média' | 'Dúvida Rápida'
        localizacao: dados.localizacao || perfil.cidade || 'Maputo',
        autorNome: dados.autorNome || perfil.nome,
        autorTelefone: dados.autorTelefone || perfil.telefone,
        fotoBase64: dados.fotoBase64 || null,
        status: 'Aberto', // 'Aberto' | 'Resolvido'
        respostas: [], // [{ autor, texto, telefone, data }]
        criadoEm: new Date().toISOString()
      };

      lista.unshift(novaDuvida);
      localStorage.setItem(SOCORRO_STORAGE_KEY, JSON.stringify(lista));

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('socorroObraPublicado', { detail: novaDuvida }));
      }

      return { success: true, duvida: novaDuvida };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  adicionarResposta(duvidaId, resposta) {
    try {
      const lista = this.listar();
      const idx = lista.findIndex(d => String(d.id) === String(duvidaId));
      if (idx === -1) return { success: false, error: 'Publicação não encontrada.' };

      const perfilHelper = (typeof window !== 'undefined' && window.PerfilTecnico) ? window.PerfilTecnico : null;
      const perfil = perfilHelper ? perfilHelper.obter() : { nome: 'Colega Técnico', telefone: '' };

      const novaResposta = {
        id: `resp_${Date.now()}`,
        autor: resposta.autor || perfil.nome,
        telefone: resposta.telefone || perfil.telefone,
        texto: resposta.texto || '',
        data: new Date().toLocaleDateString('pt-MZ') + ' às ' + new Date().toLocaleTimeString('pt-MZ', { hour: '2-digit', minute: '2-digit' })
      };

      lista[idx].respostas = lista[idx].respostas || [];
      lista[idx].respostas.push(novaResposta);
      localStorage.setItem(SOCORRO_STORAGE_KEY, JSON.stringify(lista));

      return { success: true, resposta: novaResposta, duvida: lista[idx] };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  marcarResolvido(duvidaId) {
    const lista = this.listar();
    const item = lista.find(d => String(d.id) === String(duvidaId));
    if (item) {
      item.status = 'Resolvido';
      localStorage.setItem(SOCORRO_STORAGE_KEY, JSON.stringify(lista));
      return { success: true, duvida: item };
    }
    return { success: false, error: 'Publicação não encontrada.' };
  },

  gerarLinkWhatsAppSocorro(duvidaId) {
    const duvida = this.obterPorId(duvidaId);
    if (!duvida) throw new Error('Dúvida não encontrada.');

    let telLimpo = (duvida.autorTelefone || '').replace(/\D/g, '');
    if (telLimpo.startsWith('0')) telLimpo = telLimpo.slice(1);
    if (!telLimpo.startsWith('258') && telLimpo.length <= 9) {
      telLimpo = `258${telLimpo}`;
    }

    const mensagem = `Olá, colega *${duvida.autorNome}*!
Vi seu pedido de socorro na comunidade *TécnicaMZ Pro*:
🚨 *Problema:* ${duvida.titulo}
📍 *Local:* ${duvida.localizacao}
⚠️ *Urgência:* ${duvida.urgencia}

Posso ajudar com orientações para resolver esse defeito. Podemos falar?`;

    return {
      telefoneFormatado: telLimpo,
      mensagem,
      urlWhatsApp: `https://wa.me/${telLimpo}?text=${encodeURIComponent(mensagem)}`
    };
  },

  _duvidasExemplo() {
    return [
      {
        id: 'soc_001',
        titulo: 'IDR desarmando ao ligar o Termoacumulador mesmo com disjuntor de 25A novo',
        descricao: 'Fiz a substituição do disjuntor para 25A, mas ao subir a alavanca o IDR geral de 30mA despenha na hora. A resistência foi medida a frio e deu 28 Ohms.',
        categoria: 'Disjuntor Desarmando',
        urgencia: 'Alta - Obra Parada',
        localizacao: 'Matola, Bairro Fomento',
        autorNome: 'Téc. Fernando Sitoe',
        autorTelefone: '+258 84 445 5667',
        status: 'Aberto',
        criadoEm: new Date(Date.now() - 3600000).toISOString(),
        respostas: [
          {
            id: 'r_01',
            autor: 'Eng. Paulo Macamo',
            telefone: '+258 82 111 2233',
            texto: 'Colega, meça a fuga entre a carcaça de metal do termoacumulador e o neutro com o megômetro ou na escala mais alta do multímetro. Quase com certeza a resistência está com microfissura e vazando corrente para a água/terra.',
            data: 'Hoje às 11:15'
          }
        ]
      },
      {
        id: 'soc_002',
        titulo: 'Tensão oscilando de 220V para 170V quando o compressor do A/C parte',
        descricao: 'Instalação monofásica em moradia T2. O ramal da rua tem 40 metros de cabo 6mm². Quando liga a carga pesada a luz pisca forte.',
        categoria: 'Queda de Tensão',
        urgencia: 'Média',
        localizacao: 'Maputo Cidade, Polana Caniço',
        autorNome: 'Téc. Hélder Cumbana',
        autorTelefone: '+258 84 990 0112',
        status: 'Aberto',
        criadoEm: new Date(Date.now() - 7200000).toISOString(),
        respostas: []
      }
    ];
  }
};

/* ==========================================================================
   FERRAMENTA 15: COTAÇÃO DE MATERIAL EM LOJAS PARCEIRAS
   Comparação de preços de insumos elétricos no mercado de Moçambique
   ========================================================================== */
const CotacaoMaterial = {
  // Catálogo de referência com preços praticados em lojas parceiras moçambicanas
  lojasParceiras: [
    { id: 'lj_01', nome: 'EletroMaputo Central', localizacao: 'Av. Guerra Popular, Maputo', telefone: '+258 84 100 2000' },
    { id: 'lj_02', nome: 'Casa dos Disjuntores & Cabos', localizacao: 'Av. de Moçambique, Zimpeto', telefone: '+258 82 200 3000' },
    { id: 'lj_03', nome: 'Rexel MZ Materiais Elétricos', localizacao: 'Zona Industrial Matola', telefone: '+258 84 300 4000' },
    { id: 'lj_04', nome: 'Soluções Técnicas & Automação', localizacao: 'Av. 24 de Julho, Maputo', telefone: '+258 87 400 5000' }
  ],

  catalogoProdutos: [
    // Cabos Elétricos
    { id: 'p_01', categoria: 'Cabos', item: 'Cabo Flexível 1.5mm² (Rolo 100m)', precos: { lj_01: 1850, lj_02: 1750, lj_03: 1900, lj_04: 1800 }, unidade: 'rolo' },
    { id: 'p_02', categoria: 'Cabos', item: 'Cabo Flexível 2.5mm² (Rolo 100m)', precos: { lj_01: 2950, lj_02: 2850, lj_03: 3100, lj_04: 2900 }, unidade: 'rolo' },
    { id: 'p_03', categoria: 'Cabos', item: 'Cabo Flexível 4.0mm² (Rolo 100m)', precos: { lj_01: 4600, lj_02: 4400, lj_03: 4750, lj_04: 4500 }, unidade: 'rolo' },
    { id: 'p_04', categoria: 'Cabos', item: 'Cabo Flexível 6.0mm² (Metro)', precos: { lj_01: 75, lj_02: 70, lj_03: 78, lj_04: 72 }, unidade: 'metro' },
    { id: 'p_05', categoria: 'Cabos', item: 'Cabo Flexível 10.0mm² (Metro)', precos: { lj_01: 125, lj_02: 118, lj_03: 130, lj_04: 120 }, unidade: 'metro' },
    { id: 'p_06', categoria: 'Cabos', item: 'Cabo Flexível 16.0mm² (Metro)', precos: { lj_01: 195, lj_02: 185, lj_03: 210, lj_04: 190 }, unidade: 'metro' },

    // Dispositivos de Proteção
    { id: 'p_07', categoria: 'Disjuntores', item: 'Disjuntor DIN Unipolar 10A / 16A Curva C', precos: { lj_01: 180, lj_02: 165, lj_03: 195, lj_04: 175 }, unidade: 'unid' },
    { id: 'p_08', categoria: 'Disjuntores', item: 'Disjuntor DIN Unipolar 20A / 25A Curva C', precos: { lj_01: 190, lj_02: 175, lj_03: 210, lj_04: 185 }, unidade: 'unid' },
    { id: 'p_09', categoria: 'Disjuntores', item: 'Disjuntor DIN Bipolar 32A / 40A Curva C', precos: { lj_01: 450, lj_02: 420, lj_03: 480, lj_04: 440 }, unidade: 'unid' },
    { id: 'p_10', categoria: 'Disjuntores', item: 'Disjuntor DIN Tripolar 50A / 63A Curva C', precos: { lj_01: 850, lj_02: 790, lj_03: 890, lj_04: 820 }, unidade: 'unid' },
    { id: 'p_11', categoria: 'Disjuntores', item: 'Interruptor Diferencial Residual (IDR) 2P 40A 30mA', precos: { lj_01: 1450, lj_02: 1350, lj_03: 1550, lj_04: 1400 }, unidade: 'unid' },
    { id: 'p_12', categoria: 'Disjuntores', item: 'Interruptor Diferencial Residual (IDR) 4P 63A 30mA', precos: { lj_01: 2200, lj_02: 2050, lj_03: 2350, lj_04: 2150 }, unidade: 'unid' },
    { id: 'p_13', categoria: 'Proteção', item: 'Protetor de Surto DPS 20kA Classe II 275V', precos: { lj_01: 580, lj_02: 520, lj_03: 620, lj_04: 550 }, unidade: 'unid' },
    { id: 'p_14', categoria: 'Proteção', item: 'Protetor de Surto DPS 40kA Classe II 275V', precos: { lj_01: 780, lj_02: 710, lj_03: 820, lj_04: 750 }, unidade: 'unid' },

    // Quadros e Aterramento
    { id: 'p_15', categoria: 'Quadros', item: 'Quadro de Distribuição Embutir 8 a 12 Módulos DIN', precos: { lj_01: 750, lj_02: 690, lj_03: 820, lj_04: 720 }, unidade: 'unid' },
    { id: 'p_16', categoria: 'Quadros', item: 'Quadro de Distribuição Embutir 16 a 24 Módulos DIN', precos: { lj_01: 1350, lj_02: 1250, lj_03: 1450, lj_04: 1300 }, unidade: 'unid' },
    { id: 'p_17', categoria: 'Aterramento', item: 'Haste de Aterramento Cobreada 5/8" x 2.40m', precos: { lj_01: 850, lj_02: 780, lj_03: 900, lj_04: 820 }, unidade: 'unid' },
    { id: 'p_18', categoria: 'Aterramento', item: 'Caixa de Inspeção de Terra em PVC com Tampa', precos: { lj_01: 320, lj_02: 290, lj_03: 350, lj_04: 310 }, unidade: 'unid' },

    // Acabamentos e Tubos
    { id: 'p_19', categoria: 'Acabamentos', item: 'Tomada Dupla 2P+T 16A com Placa de Embutir', precos: { lj_01: 220, lj_02: 195, lj_03: 240, lj_04: 210 }, unidade: 'unid' },
    { id: 'p_20', categoria: 'Tubulação', item: 'Tubo Eletroduto Corrugado 20mm (Rolo 50m)', precos: { lj_01: 650, lj_02: 590, lj_03: 700, lj_04: 620 }, unidade: 'rolo' },
    { id: 'p_21', categoria: 'Tubulação', item: 'Tubo Eletroduto Corrugado 25mm (Rolo 50m)', precos: { lj_01: 880, lj_02: 810, lj_03: 940, lj_04: 850 }, unidade: 'rolo' }
  ],

  // Busca e compara itens do catálogo
  buscar(termo = '', categoria = 'Todas') {
    const t = termo.toLowerCase().trim();
    let lista = this.catalogoProdutos;

    if (categoria && categoria !== 'Todas') {
      lista = lista.filter(p => p.categoria.toLowerCase() === categoria.toLowerCase());
    }

    if (t) {
      lista = lista.filter(p => p.item.toLowerCase().includes(t) || p.categoria.toLowerCase().includes(t));
    }

    return lista.map(produto => {
      const valores = Object.entries(produto.precos).map(([ljId, valor]) => {
        const loja = this.lojasParceiras.find(l => l.id === ljId);
        return {
          lojaId: ljId,
          lojaNome: loja ? loja.nome : ljId,
          preco: valor
        };
      });

      valores.sort((a, b) => a.preco - b.preco);
      const menor = valores[0];
      const maior = valores[valores.length - 1];
      const media = valores.reduce((acc, v) => acc + v.preco, 0) / valores.length;
      const economiaPotencial = maior.preco - menor.preco;

      return {
        ...produto,
        comparativo: valores,
        menorPreco: menor.preco,
        melhorLoja: menor.lojaNome,
        precoMedio: Math.round(media),
        economiaMaxima: economiaPotencial
      };
    });
  },

  // Calcula a cesta de compras comparada entre as lojas
  compararCesta(itensParaComprar) {
    // itensParaComprar: [{ itemOuId, qtd }]
    const totaisPorLoja = {};
    this.lojasParceiras.forEach(lj => {
      totaisPorLoja[lj.id] = { loja: lj.nome, telefone: lj.telefone, totalGeral: 0, itensIndisponiveis: 0 };
    });

    const itensProcessados = itensParaComprar.map(req => {
      const p = this.catalogoProdutos.find(prod => prod.id === req.id || prod.item.toLowerCase().includes((req.item || '').toLowerCase())) || this.catalogoProdutos[0];
      const qtd = Number(req.qtd || 1);

      Object.keys(totaisPorLoja).forEach(ljId => {
        const precoUnit = p.precos[ljId] || 0;
        if (precoUnit > 0) {
          totaisPorLoja[ljId].totalGeral += precoUnit * qtd;
        } else {
          totaisPorLoja[ljId].itensIndisponiveis++;
        }
      });

      return {
        produto: p.item,
        unidade: p.unidade,
        quantidade: qtd,
        precosPorLoja: p.precos
      };
    });

    const rankingLojas = Object.entries(totaisPorLoja).map(([ljId, dados]) => ({
      lojaId: ljId,
      ...dados,
      totalFormatado: `${dados.totalGeral.toLocaleString('pt-MZ', { minimumFractionDigits: 2 })} MZN`
    })).sort((a, b) => a.totalGeral - b.totalGeral);

    return {
      itens: itensProcessados,
      rankingLojas,
      lojaMaisEconomica: rankingLojas[0],
      economiaEstimada: Math.max(0, rankingLojas[rankingLojas.length - 1].totalGeral - rankingLojas[0].totalGeral)
    };
  },

  // Gera proposta/cotação comparada em PDF via pdfmake
  async exportarCotacaoPDF(itensSolicitados, acao = 'download') {
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
    const cesta = this.compararCesta(itensSolicitados || [
      { item: 'Cabo Flexível 2.5mm²', qtd: 2 },
      { item: 'Disjuntor DIN Unipolar 16A', qtd: 6 },
      { item: 'Interruptor Diferencial Residual (IDR) 2P 40A', qtd: 1 },
      { item: 'Protetor de Surto DPS 20kA', qtd: 2 }
    ]);

    const linhasTabela = [
      [
        { text: 'Material / Insumo', bold: true, fontSize: 8, fillColor: '#0f172a', color: '#ffffff' },
        { text: 'Qtd', bold: true, fontSize: 8, alignment: 'center', fillColor: '#0f172a', color: '#ffffff' },
        { text: 'Melhor Preço Unit.', bold: true, fontSize: 8, alignment: 'right', fillColor: '#0f172a', color: '#ffffff' },
        { text: 'Loja Recomendada', bold: true, fontSize: 8, fillColor: '#0f172a', color: '#ffffff' }
      ]
    ];

    cesta.itens.forEach(it => {
      const menor = Object.entries(it.precosPorLoja).sort((a, b) => a[1] - b[1])[0];
      const lojaObj = this.lojasParceiras.find(l => l.id === menor[0]);
      linhasTabela.push([
        { text: it.produto, fontSize: 8 },
        { text: `${it.quantidade} ${it.unidade}`, fontSize: 8, alignment: 'center' },
        { text: `${menor[1].toLocaleString('pt-MZ', { minimumFractionDigits: 2 })} MZN`, fontSize: 8, alignment: 'right', bold: true, color: '#0369a1' },
        { text: lojaObj ? lojaObj.nome : menor[0], fontSize: 8 }
      ]);
    });

    const cabecalhoPDF = perfilHelper ? perfilHelper.gerarCabecalhoPDF(
      'MAPA COMPARATIVO DE COTAÇÃO DE MATERIAIS',
      `Data: ${new Date().toLocaleDateString('pt-MZ')} | Melhores Preços no Mercado de Moçambique`
    ) : [];

    const docDef = {
      pageSize: 'A4',
      pageMargins: [35, 30, 35, 30],
      content: [
        ...cabecalhoPDF,
        {
          table: {
            widths: ['*'],
            body: [[
              {
                fillColor: '#dbeafe',
                stack: [
                  { text: `FORNECEDOR MAIS ECONÔMICO: ${cesta.lojaMaisEconomica.loja}`, bold: true, fontSize: 10, color: '#1e40af' },
                  { text: `Total Previsto: ${cesta.lojaMaisEconomica.totalFormatado} (Economia de até ${cesta.economiaEstimada.toLocaleString('pt-MZ', { minimumFractionDigits: 2 })} MZN comparado a outros fornecedores)`, fontSize: 8, color: '#1e3a8a', margin: [0, 2, 0, 0] }
                ],
                margin: [4, 4, 4, 4]
              }
            ]]
          },
          layout: 'noBorders',
          margin: [0, 0, 0, 10]
        },
        {
          table: {
            widths: ['*', 55, 95, 120],
            body: linhasTabela
          },
          layout: 'lightHorizontalLines',
          margin: [0, 0, 0, 12]
        },
        {
          text: 'Nota: Os valores apresentados são baseados nas cotações médias de balcão das lojas conveniadas na praça de Maputo e Matola, sujeitos à alteração sem aviso prévio.',
          fontSize: 7,
          italics: true,
          color: '#64748b'
        }
      ]
    };

    if (perfilHelper && typeof perfilHelper.aplicarTemaDoc === 'function') {
      perfilHelper.aplicarTemaDoc(docDef);
    }

    const pdf = window.pdfMake.createPdf(docDef);
    if (acao === 'download') {
      pdf.download(`Cotacao_Materiais_${Date.now()}.pdf`);
    } else {
      pdf.open();
    }
    return docDef;
  }
};

// Exporta globalmente para uso direto em Vanilla JS e Módulos
if (typeof window !== 'undefined') {
  window.SocorroNaObra = SocorroNaObra;
  window.CotacaoMaterial = CotacaoMaterial;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    SocorroNaObra,
    CotacaoMaterial
  };
}
