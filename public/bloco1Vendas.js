/**
 * Módulo: bloco1Vendas.js
 * FATURAMENTO E VENDAS 100% WHITE-LABEL (Sem menção ao app)
 * 
 * 1. Gerador de OS, Contrato & Recibo em PDF (1 Página A4 Minimalista)
 * 2. Calculadora de Preço de Serviço (Horas * ValorHora + Material + Transporte + Margem)
 * 3. Lista de Materiais Automática por Cômodos (Cálculo e PDF 1 Página A4)
 * 4. CRM de Clientes (Armazenamento e Integração WhatsApp)
 */

async function carregarPdfMakeSeNecessario() {
  if (typeof window === 'undefined') return;
  if (window.pdfMake && window.pdfMake.vfs) return window.pdfMake;

  const carregarScript = (src) => new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });

  try {
    if (!window.pdfMake) {
      await carregarScript('https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/pdfmake.min.js');
    }
    if (!window.pdfMake.vfs) {
      await carregarScript('https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/vfs_fonts.js');
    }
    return window.pdfMake;
  } catch (err) {
    console.error('[Bloco1Vendas] Erro ao carregar biblioteca pdfmake:', err);
    throw new Error('Falha ao carregar motor de PDF.');
  }
}

/* ==========================================================================
   1. GERADOR DE OS, CONTRATO & RECIBO (PDF 1 PÁGINA A4 WHITE-LABEL)
   ========================================================================== */
async function gerarPDF_OS(dados, acao = 'download') {
  await carregarPdfMakeSeNecessario();
  const perfilHelper = (typeof window !== 'undefined' && window.PerfilTecnico) 
    ? window.PerfilTecnico 
    : (typeof require !== 'undefined' ? require('./perfilTecnico.js') : null);

  // White-Label estrito: apenas chaves técnico do localStorage
  const nomeTecnico = (typeof localStorage !== 'undefined' && localStorage.getItem('tecnico_nome')) || 'Profissional Técnico';
  const sloganTecnico = (typeof localStorage !== 'undefined' && localStorage.getItem('tecnico_slogan')) || 'Instalações, Manutenção e Soluções Elétricas';
  const logoTecnico = (typeof localStorage !== 'undefined' && localStorage.getItem('tecnico_logo')) || null;
  const telefoneTecnico = (typeof localStorage !== 'undefined' && localStorage.getItem('tecnico_telefone')) || '+258 84 000 0000';
  const emailTecnico = (typeof localStorage !== 'undefined' && localStorage.getItem('tecnico_email')) || '';
  const cidadeTecnico = (typeof localStorage !== 'undefined' && localStorage.getItem('tecnico_cidade')) || 'Maputo';
  const nuitTecnico = (typeof localStorage !== 'undefined' && localStorage.getItem('tecnico_nuit')) || '';

  const perfil = {
    nome: nomeTecnico,
    slogan: sloganTecnico,
    logoBase64: logoTecnico,
    telefone: telefoneTecnico,
    email: emailTecnico,
    cidade: cidadeTecnico,
    nuit: nuitTecnico
  };

  const tipoDoc = (dados.tipo || 'OS').toUpperCase(); // 'OS' | 'CONTRATO' | 'RECIBO'
  const numeroDoc = dados.numero || `${tipoDoc}-${Date.now().toString().slice(-6)}`;
  const dataEmissao = dados.data || new Date().toLocaleDateString('pt-MZ');
  const validade = dados.validade || '15 dias';

  // Prazo e Garantia dinâmicos capturados dos inputs do formulário
  const prazoExecucao = (dados.prazoExecucao || dados.prazo || '3 dias úteis').toString().trim();
  const garantiaTexto = (dados.garantia || (dados.garantiaDias ? `${dados.garantiaDias} dias` : '90 dias')).toString().trim();

  const cliente = {
    nome: dados.cliente?.nome || 'Cliente Não Informado',
    telefone: dados.cliente?.telefone || '---',
    endereco: dados.cliente?.endereco || '---',
    nuit: dados.cliente?.nuit || 'Consumidor Final'
  };

  const servicos = Array.isArray(dados.servicos) ? dados.servicos : [];
  const materiais = Array.isArray(dados.materiais) ? dados.materiais : [];
  const desconto = Number(dados.desconto || 0);

  const subtotalServicos = servicos.reduce((acc, s) => acc + (Number(s.qtd || 1) * Number(s.precoUnit || s.valor || 0)), 0);
  const subtotalMateriais = materiais.reduce((acc, m) => acc + (Number(m.qtd || 1) * Number(m.precoUnit || m.valorUnit || 0)), 0);
  const totalGeral = Math.max(0, (subtotalServicos + subtotalMateriais) - desconto);

  let tituloCabecalho = 'ORDEM DE SERVIÇO & ORÇAMENTO';
  if (tipoDoc === 'CONTRATO') tituloCabecalho = 'CONTRATO DE PRESTAÇÃO DE SERVIÇOS ELÉTRICOS';
  if (tipoDoc === 'RECIBO') tituloCabecalho = 'RECIBO OFICIAL DE PAGAMENTO E QUITAÇÃO';

  const subtituloDoc = `Nº: ${numeroDoc} | Emissão: ${dataEmissao}${tipoDoc === 'OS' ? ' | Validade: ' + validade : ''}`;

  const cabecalhoPDF = perfilHelper ? perfilHelper.gerarCabecalhoPDF(tituloCabecalho, subtituloDoc) : [
    { text: perfil.nome.toUpperCase(), fontSize: 13, bold: true, color: '#0f172a' },
    { text: perfil.slogan, fontSize: 8, italics: true, color: '#0284c7', margin: [0, 1, 0, 4] },
    { text: `Tel: ${perfil.telefone} | ${perfil.cidade}`, fontSize: 7.5, color: '#475569', margin: [0, 0, 0, 8] }
  ];

  // Linhas Tabela Serviços
  const linhasServicos = [
    [
      { text: 'Descrição do Serviço / Mão de Obra', bold: true, fillColor: '#f1f5f9', fontSize: 7.5 },
      { text: 'Qtd', bold: true, fillColor: '#f1f5f9', fontSize: 7.5, alignment: 'center' },
      { text: 'Preço Unit. (MZN)', bold: true, fillColor: '#f1f5f9', fontSize: 7.5, alignment: 'right' },
      { text: 'Total (MZN)', bold: true, fillColor: '#f1f5f9', fontSize: 7.5, alignment: 'right' }
    ]
  ];
  if (servicos.length === 0) {
    linhasServicos.push([{ text: dados.descricaoServico || 'Serviço elétrico conforme vistoria técnica prévia.', colSpan: 4, italics: true, fontSize: 7 }, {}, {}, {}]);
  } else {
    servicos.forEach(s => {
      const pUnit = Number(s.precoUnit || s.valor || 0);
      const q = Number(s.qtd || 1);
      linhasServicos.push([
        { text: s.descricao || s.item || s.desc || 'Serviço Técnico Especializado', fontSize: 7 },
        { text: String(q), fontSize: 7, alignment: 'center' },
        { text: pUnit.toLocaleString('pt-MZ', { minimumFractionDigits: 2 }), fontSize: 7, alignment: 'right' },
        { text: (q * pUnit).toLocaleString('pt-MZ', { minimumFractionDigits: 2 }), fontSize: 7, alignment: 'right' }
      ]);
    });
  }

  // Linhas Tabela Materiais
  const linhasMateriais = [
    [
      { text: 'Item / Material Fornecido', bold: true, fillColor: '#f1f5f9', fontSize: 7.5 },
      { text: 'Qtd', bold: true, fillColor: '#f1f5f9', fontSize: 7.5, alignment: 'center' },
      { text: 'Preço Unit. (MZN)', bold: true, fillColor: '#f1f5f9', fontSize: 7.5, alignment: 'right' },
      { text: 'Total (MZN)', bold: true, fillColor: '#f1f5f9', fontSize: 7.5, alignment: 'right' }
    ]
  ];
  if (materiais.length === 0) {
    linhasMateriais.push([{ text: 'Materiais por conta do cliente / já disponíveis no local.', colSpan: 4, italics: true, fontSize: 7 }, {}, {}, {}]);
  } else {
    materiais.forEach(m => {
      const pUnit = Number(m.precoUnit || m.valorUnit || 0);
      const q = Number(m.qtd || 1);
      linhasMateriais.push([
        { text: m.descricao || m.item || m.desc || 'Insumo Elétrico', fontSize: 7 },
        { text: String(q), fontSize: 7, alignment: 'center' },
        { text: pUnit.toLocaleString('pt-MZ', { minimumFractionDigits: 2 }), fontSize: 7, alignment: 'right' },
        { text: (q * pUnit).toLocaleString('pt-MZ', { minimumFractionDigits: 2 }), fontSize: 7, alignment: 'right' }
      ]);
    });
  }

  // Conteúdo específico por tipo de documento
  const conteudoDinamico = [];

  if (tipoDoc === 'RECIBO') {
    conteudoDinamico.push(
      {
        table: {
          widths: ['*'],
          body: [[
            {
              fillColor: '#ecfdf5',
              stack: [
                { text: '★ RECIBO DE QUITAÇÃO INTEGRAL ★', fontSize: 11, bold: true, color: '#047857', alignment: 'center' },
                { text: `PAGO: ${totalGeral.toLocaleString('pt-MZ', { minimumFractionDigits: 2 })} MZN`, fontSize: 14, bold: true, color: '#065f46', alignment: 'center', margin: [0, 2, 0, 2] },
                { text: `Recebemos de ${cliente.nome} o montante supra, conferindo plena, rasa e irrevogável quitação pelos serviços discriminados.`, fontSize: 7.5, color: '#064e3b', alignment: 'center' }
              ],
              margin: [4, 6, 4, 6]
            }
          ]]
        },
        layout: {
          hLineWidth: () => 1,
          vLineWidth: () => 1,
          hLineColor: () => '#10b981',
          vLineColor: () => '#10b981'
        },
        margin: [0, 0, 0, 8]
      }
    );
  }

  if (tipoDoc === 'CONTRATO') {
    conteudoDinamico.push(
      {
        stack: [
          { text: 'CLÁUSULAS CONTRATUAIS ESSENCIAIS:', bold: true, fontSize: 7.5, color: '#0f172a', margin: [0, 0, 0, 2] },
          { text: `1. OBJETO: O CONTRATADO obriga-se a executar os serviços elétricos detalhados abaixo no imóvel do CONTRATANTE com técnica e diligência.`, fontSize: 6.8, color: '#334155' },
          { text: `2. VALOR E PAGAMENTO: O valor total acordado é de ${totalGeral.toLocaleString('pt-MZ', { minimumFractionDigits: 2 })} MZN, quitado conforme estipulado (${dados.condicoesPagamento || '50% entrada e 50% na conclusão'}).`, fontSize: 6.8, color: '#334155' },
          { text: `3. PRAZO E GARANTIA: Prazo pactuado de ${prazoExecucao}. Garantia expressa de ${garantiaTexto} sobre a mão de obra executada.`, fontSize: 6.8, color: '#334155' }
        ],
        margin: [0, 0, 0, 6]
      }
    );
  }

  const docDefinition = {
    pageSize: 'A4',
    pageOrientation: 'portrait',
    pageMargins: [32, 24, 32, 24],
    content: [
      ...cabecalhoPDF,

      // Bloco Dados do Cliente
      {
        table: {
          widths: ['*'],
          body: [[
            {
              fillColor: '#f8fafc',
              stack: [
                {
                  columns: [
                    { text: [{ text: 'CLIENTE: ', bold: true, color: '#0369a1' }, cliente.nome, '   |   ', { text: 'TEL: ', bold: true, color: '#0369a1' }, cliente.telefone], fontSize: 7.5 },
                    { text: [{ text: 'LOCAL: ', bold: true, color: '#0369a1' }, cliente.endereco, '   |   ', { text: 'NUIT: ', bold: true, color: '#0369a1' }, cliente.nuit], fontSize: 7.5, alignment: 'right' }
                  ]
                }
              ],
              margin: [4, 3, 4, 3]
            }
          ]]
        },
        layout: 'noBorders',
        margin: [0, 0, 0, 6]
      },

      ...conteudoDinamico,

      // Tabela Serviços
      { text: 'SERVIÇOS & MÃO DE OBRA', fontSize: 8, bold: true, color: '#0f172a', margin: [0, 0, 0, 2] },
      {
        table: {
          widths: ['*', 28, 70, 75],
          body: linhasServicos
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 6]
      },

      // Tabela Materiais
      { text: 'MATERIAIS & COMPONENTES', fontSize: 8, bold: true, color: '#0f172a', margin: [0, 0, 0, 2] },
      {
        table: {
          widths: ['*', 28, 70, 75],
          body: linhasMateriais
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 6]
      },

      // Totais e Condições (Com Prazo e Garantia dinâmicos capturados dos inputs)
      {
        columns: [
          {
            width: '*',
            stack: [
              { text: 'CONDIÇÕES, PRAZO & GARANTIA:', fontSize: 7.5, bold: true, color: '#0f172a' },
              { text: [ { text: '• Prazo de Execução: ', bold: true }, prazoExecucao ], fontSize: 7, color: '#1e293b' },
              { text: [ { text: '• Garantia da Mão de Obra: ', bold: true }, garantiaTexto ], fontSize: 7, color: '#1e293b' },
              { text: `• Pagamento: ${dados.condicoesPagamento || '50% na aprovação e 50% na conclusão e testes.'}`, fontSize: 7, color: '#475569' },
              dados.observacoes ? { text: `• Observações: ${dados.observacoes}`, fontSize: 6.8, italics: true, color: '#64748b' } : {}
            ]
          },
          {
            width: 175,
            table: {
              widths: [90, 80],
              body: [
                [{ text: 'Serviços:', fontSize: 7 }, { text: `${subtotalServicos.toLocaleString('pt-MZ', { minimumFractionDigits: 2 })} MZN`, fontSize: 7, alignment: 'right' }],
                [{ text: 'Materiais:', fontSize: 7 }, { text: `${subtotalMateriais.toLocaleString('pt-MZ', { minimumFractionDigits: 2 })} MZN`, fontSize: 7, alignment: 'right' }],
                desconto > 0 ? [{ text: 'Desconto:', fontSize: 7, color: '#dc2626' }, { text: `-${desconto.toLocaleString('pt-MZ', { minimumFractionDigits: 2 })} MZN`, fontSize: 7, color: '#dc2626', alignment: 'right' }] : [{ text: '', colSpan: 2 }, {}],
                [{ text: 'TOTAL:', bold: true, fontSize: 8.5, fillColor: '#0f172a', color: '#38bdf8' }, { text: `${totalGeral.toLocaleString('pt-MZ', { minimumFractionDigits: 2 })} MZN`, bold: true, fontSize: 8.5, fillColor: '#0f172a', color: '#38bdf8', alignment: 'right' }]
              ]
            },
            layout: 'noBorders'
          }
        ],
        margin: [0, 0, 0, 8]
      },

      // Linha de Assinatura Dupla
      {
        columns: [
          {
            stack: [
              { canvas: [{ type: 'line', x1: 20, y1: 0, x2: 190, y2: 0, lineWidth: 0.8, lineColor: '#94a3b8' }] },
              { text: perfil.nome, fontSize: 7.5, bold: true, alignment: 'center', margin: [0, 3, 0, 0] },
              { text: 'Profissional Responsável / Contratado', fontSize: 6.5, color: '#64748b', alignment: 'center' }
            ]
          },
          {
            stack: [
              { canvas: [{ type: 'line', x1: 20, y1: 0, x2: 190, y2: 0, lineWidth: 0.8, lineColor: '#94a3b8' }] },
              { text: cliente.nome, fontSize: 7.5, bold: true, alignment: 'center', margin: [0, 3, 0, 0] },
              { text: 'Cliente / Contratante', fontSize: 6.5, color: '#64748b', alignment: 'center' }
            ]
          }
        ],
        margin: [0, 10, 0, 0]
      }
    ]
  };

  if (perfilHelper && typeof perfilHelper.aplicarTemaDoc === 'function') {
    perfilHelper.aplicarTemaDoc(docDefinition);
  }

  const pdfGenerator = window.pdfMake.createPdf(docDefinition);
  if (acao === 'download') {
    pdfGenerator.download(`${numeroDoc}.pdf`);
  } else if (acao === 'print') {
    pdfGenerator.print();
  } else {
    pdfGenerator.open();
  }
  return docDefinition;
}

const GeradorOS = {
  gerarPDF: gerarPDF_OS
};

/* ==========================================================================
   2. CALCULADORA DE PREÇO DE SERVIÇO (DESDOBRAMENTO VISUAL & EXPORTAÇÕES)
   ========================================================================== */
const CalculadoraPrecoServico = {
  calcular({
    horas = 0,
    valorHora = 0,
    custoMaterial = 0,
    deslocamento = 0,
    margemLucroPct = 25
  }) {
    const h = Math.max(0, Number(horas) || 0);
    const vh = Math.max(0, Number(valorHora) || 0);
    const mat = Math.max(0, Number(custoMaterial) || 0);
    const des = Math.max(0, Number(deslocamento) || 0);
    const margem = Math.max(0, Number(margemLucroPct) || 0);

    const custoMaoDeObra = h * vh;
    const custoDireto = custoMaoDeObra + mat + des;
    const valorLucro = custoDireto * (margem / 100);
    const precoFinal = custoDireto + valorLucro;

    return {
      horas: h,
      valorHora: vh,
      custoMaoDeObra: Math.round(custoMaoDeObra * 100) / 100,
      custoMaterial: Math.round(mat * 100) / 100,
      deslocamento: Math.round(des * 100) / 100,
      custoDireto: Math.round(custoDireto * 100) / 100,
      margemLucroPct: margem,
      valorLucro: Math.round(valorLucro * 100) / 100,
      precoFinal: Math.round(precoFinal * 100) / 100
    };
  },

  gerarTextoWhatsApp(calcResult, nomeCliente = '') {
    const perfilHelper = (typeof window !== 'undefined' && window.PerfilTecnico) ? window.PerfilTecnico : null;
    const perfil = perfilHelper ? perfilHelper.obter() : { nome: 'Profissional Técnico', telefone: '' };

    return `*ORÇAMENTO TÉCNICO ELÉTRICO* ⚡\n` +
      (nomeCliente ? `Cliente: *${nomeCliente}*\n` : '') +
      `---------------------------------\n` +
      `• Mão de Obra (${calcResult.horas}h): ${calcResult.custoMaoDeObra?.toLocaleString()} MZN\n` +
      `• Materiais Previstos: ${calcResult.custoMaterial?.toLocaleString()} MZN\n` +
      `• Transporte / Deslocamento: ${calcResult.deslocamento?.toLocaleString()} MZN\n` +
      `---------------------------------\n` +
      `*VALOR TOTAL ESTIMADO:* *${calcResult.precoFinal?.toLocaleString()} MZN*\n` +
      `---------------------------------\n` +
      `Serviço executado por: *${perfil.nome}*\n` +
      (perfil.telefone ? `Contacto: ${perfil.telefone}` : '');
  }
};

/* ==========================================================================
   3. LISTA DE MATERIAIS AUTOMÁTICA POR CÔMODOS (CÁLCULO E PDF 1 PÁGINA)
   ========================================================================== */
const ListaMateriaisAutomatica = {
  // Calcula metragem real com base nos cômodos informados
  calcularPorComodos(comodos = []) {
    let cabo1_5 = 0; // Iluminação
    let cabo2_5 = 0; // Tomadas TUG
    let cabo4_0 = 0; // Cargas Pesadas TUE
    let caboAlim = 30; // Entrada Principal
    let eletrodutos = 0;
    let disjuntores10 = 0;
    let disjuntores16 = 0;
    let disjuntores20 = 0;
    let interruptores = 0;
    let tomadas10A = 0;
    let tomadas20A = 0;

    comodos.forEach(c => {
      const comp = Number(c.comp || 0);
      const larg = Number(c.larg || 0);
      const area = comp * larg;
      const perimetro = 2 * (comp + larg);
      const pontosLuz = Number(c.pontosLuz || 1);
      const tug = Number(c.tug || 2);
      const tue = Number(c.tue || 0);

      // Cabos 1.5mm² (Iluminação): 3 condutores (fase, neutro, retorno) x percurso
      cabo1_5 += (pontosLuz * 12) + (comp * 1.5);
      interruptores += pontosLuz;
      if (pontosLuz > 0) disjuntores10 += 0.5;

      // Cabos 2.5mm² (Tomadas TUG): 3 condutores (fase, neutro, terra) x perímetro
      cabo2_5 += (tug * 8) + (perimetro * 1.8);
      tomadas10A += tug;
      if (tug > 0) disjuntores16 += Math.ceil(tug / 5);

      // Cabos 4.0mm² (Tomadas Específicas TUE): circuito dedicado por aparelho
      cabo4_0 += tue * 25;
      tomadas20A += tue;
      disjuntores20 += tue;

      // Eletroduto corrugado de 20mm/25mm
      eletrodutos += perimetro * 1.2;
    });

    // Arredondamentos com margem de segurança de 15%
    return {
      cabo1_5: Math.ceil(Math.max(50, cabo1_5 * 1.15)),
      cabo2_5: Math.ceil(Math.max(50, cabo2_5 * 1.15)),
      cabo4_0: Math.ceil(cabo4_0 * 1.15),
      caboAlim: Math.max(25, caboAlim),
      eletrodutos: Math.ceil(Math.max(30, eletrodutos)),
      disjuntor10A: Math.max(1, Math.ceil(disjuntores10)),
      disjuntor16A: Math.max(1, Math.ceil(disjuntores16)),
      disjuntor20A: Math.ceil(disjuntores20),
      disjuntorGeral: 'Bipolar 40A Curva C',
      idr: 'Bipolar 40A 30mA (Proteção de Pessoas)',
      dps: '2x DPS 20kA 275V (Fase + Neutro)',
      interruptores: Math.max(1, interruptores),
      tomadas10A: Math.max(1, tomadas10A),
      tomadas20A: tomadas20A,
      hasteAterramento: '1x Haste 5/8" Copperweld 2.4m + Caixa de Inspeção'
    };
  },

  async gerarPDF(dadosObra = {}, itensOuComodos = [], acao = 'download') {
    return gerarListaMateriais(dadosObra, itensOuComodos, acao);
  }
};

/* ==========================================================================
   FUNÇÃO GLOBAL: gerarListaMateriais (1 PÁGINA A4 WHITE-LABEL & EDITÁVEL)
   ========================================================================== */
async function gerarListaMateriais(dadosObra = {}, itensOuComodos = [], acao = 'download') {
  await carregarPdfMakeSeNecessario();
  const perfilHelper = (typeof window !== 'undefined' && window.PerfilTecnico) 
    ? window.PerfilTecnico 
    : (typeof require !== 'undefined' ? require('./perfilTecnico.js') : null);

  const nomeTecnico = (typeof localStorage !== 'undefined' && localStorage.getItem('tecnico_nome')) || 'Profissional Técnico';
  const sloganTecnico = (typeof localStorage !== 'undefined' && localStorage.getItem('tecnico_slogan')) || 'Instalações, Manutenção e Soluções Elétricas';
  const logoTecnico = (typeof localStorage !== 'undefined' && localStorage.getItem('tecnico_logo')) || null;
  const telefoneTecnico = (typeof localStorage !== 'undefined' && localStorage.getItem('tecnico_telefone')) || '+258 84 000 0000';
  const cidadeTecnico = (typeof localStorage !== 'undefined' && localStorage.getItem('tecnico_cidade')) || 'Maputo';

  const perfil = {
    nome: nomeTecnico,
    slogan: sloganTecnico,
    logoBase64: logoTecnico,
    telefone: telefoneTecnico,
    cidade: cidadeTecnico
  };

  const nomeObra = dadosObra.nome || dadosObra.titulo || 'Instalação Elétrica Residencial/Comercial';
  const dataDoc = dadosObra.data || new Date().toLocaleDateString('pt-MZ');
  const prazoExecucao = (dadosObra.prazoExecucao || dadosObra.prazo || '4 dias úteis').toString().trim();
  const garantia = (dadosObra.garantia || '90 dias (Mão de Obra)').toString().trim();

  let linhasMateriais = [];

  // Se já for uma lista direta de itens editados da tela de pré-visualização
  const isItensDiretos = Array.isArray(itensOuComodos) && itensOuComodos.length > 0 && 
    (itensOuComodos[0].item !== undefined || itensOuComodos[0].descricao !== undefined || itensOuComodos[0].desc !== undefined);

  if (isItensDiretos) {
    linhasMateriais = itensOuComodos.map(it => {
      const nome = it.item || it.descricao || it.desc || 'Material Elétrico';
      const espec = it.especificacao || it.espec || it.detalhes || 'Padrão ABNT/IEC';
      const qtd = it.quantidade !== undefined ? it.quantidade : (it.qtd !== undefined ? it.qtd : 1);
      const unid = it.unidade || it.unid || 'un';
      return [
        { text: nome, fontSize: 7 },
        { text: espec, fontSize: 7 },
        { text: `${qtd} ${unid}`, bold: true, fontSize: 7, alignment: 'center' }
      ];
    });
  } else {
    // Calcula com base nos cômodos fornecidos
    const comodos = Array.isArray(itensOuComodos) ? itensOuComodos : [];
    const quant = ListaMateriaisAutomatica.calcularPorComodos(comodos);
    linhasMateriais = [
      [{ text: 'Condutor Flexível 1.5mm²', fontSize: 7 }, { text: 'Cobre antichama 750V (Iluminação)', fontSize: 7 }, { text: `${quant.cabo1_5} m`, bold: true, fontSize: 7, alignment: 'center' }],
      [{ text: 'Condutor Flexível 2.5mm²', fontSize: 7 }, { text: 'Cobre antichama 750V (Tomadas TUG)', fontSize: 7 }, { text: `${quant.cabo2_5} m`, bold: true, fontSize: 7, alignment: 'center' }],
      [{ text: 'Condutor Flexível 4.0mm²', fontSize: 7 }, { text: 'Cobre antichama 750V (Cargas Pesadas TUE)', fontSize: 7 }, { text: `${quant.cabo4_0} m`, bold: true, fontSize: 7, alignment: 'center' }],
      [{ text: 'Condutor Entrada 6.0mm²', fontSize: 7 }, { text: 'Alimentador do Quadro de Distribuição', fontSize: 7 }, { text: `${quant.caboAlim} m`, bold: true, fontSize: 7, alignment: 'center' }],
      [{ text: 'Eletroduto Corrugado 20mm/25mm', fontSize: 7 }, { text: 'Normatizado antichama flexível', fontSize: 7 }, { text: `${quant.eletrodutos} m`, bold: true, fontSize: 7, alignment: 'center' }],
      [{ text: 'Disjuntores Monopolares 10A DIN', fontSize: 7 }, { text: 'Curva C 3kA (Circuitos de Luz)', fontSize: 7 }, { text: `${quant.disjuntor10A} un`, bold: true, fontSize: 7, alignment: 'center' }],
      [{ text: 'Disjuntores Monopolares 16A DIN', fontSize: 7 }, { text: 'Curva C 3kA (Tomadas de Uso Geral)', fontSize: 7 }, { text: `${quant.disjuntor16A} un`, bold: true, fontSize: 7, alignment: 'center' }],
      [{ text: 'Disjuntores Bipolares 20A/25A DIN', fontSize: 7 }, { text: 'Curva C (AC / Chuveiro / Termoacumulador)', fontSize: 7 }, { text: `${quant.disjuntor20A} un`, bold: true, fontSize: 7, alignment: 'center' }],
      [{ text: 'Disjuntor Geral Bipolar 40A', fontSize: 7 }, { text: 'Entrada Geral do Quadro de Distribuição', fontSize: 7 }, { text: '1 un', bold: true, fontSize: 7, alignment: 'center' }],
      [{ text: 'Interruptor Diferencial IDR 40A 30mA', fontSize: 7 }, { text: 'Proteção contra choques elétricos', fontSize: 7 }, { text: '1 un', bold: true, fontSize: 7, alignment: 'center' }],
      [{ text: 'Protetor de Surto DPS 20kA 275V', fontSize: 7 }, { text: 'Proteção contra sobretensões transitórias', fontSize: 7 }, { text: '2 un', bold: true, fontSize: 7, alignment: 'center' }],
      [{ text: 'Módulos Tomadas TUG + Placas', fontSize: 7 }, { text: 'Padronizadas 2P+T 250V', fontSize: 7 }, { text: `${quant.tomadas10A} cj`, bold: true, fontSize: 7, alignment: 'center' }],
      [{ text: 'Módulos Tomadas TUE + Placas', fontSize: 7 }, { text: 'Padronizadas 2P+T reforçadas', fontSize: 7 }, { text: `${quant.tomadas20A} cj`, bold: true, fontSize: 7, alignment: 'center' }],
      [{ text: 'Módulos Interruptores + Placas', fontSize: 7 }, { text: 'Simples / Paralelos 10A', fontSize: 7 }, { text: `${quant.interruptores} cj`, bold: true, fontSize: 7, alignment: 'center' }],
      [{ text: 'Sistema de Aterramento Completo', fontSize: 7 }, { text: quant.hasteAterramento, fontSize: 7 }, { text: '1 kit', bold: true, fontSize: 7, alignment: 'center' }]
    ];
  }

  const cabecalhoPDF = perfilHelper ? perfilHelper.gerarCabecalhoPDF(
    'LISTA QUANTITATIVA DE MATERIAIS ELÉTRICOS',
    `Obra: ${nomeObra} | Data: ${dataDoc}`
  ) : [
    { text: perfil.nome.toUpperCase(), fontSize: 13, bold: true, color: '#0f172a' },
    { text: perfil.slogan, fontSize: 8, italics: true, color: '#0284c7', margin: [0, 1, 0, 4] },
    { text: `Tel: ${perfil.telefone} | ${perfil.cidade}`, fontSize: 7.5, color: '#475569', margin: [0, 0, 0, 8] }
  ];

  const docDef = {
    pageSize: 'A4',
    pageOrientation: 'portrait',
    pageMargins: [32, 24, 32, 24],
    content: [
      ...cabecalhoPDF,
      {
        table: {
          widths: ['*'],
          body: [[
            {
              fillColor: '#f8fafc',
              stack: [
                {
                  columns: [
                    { text: [{ text: 'LOCAL / OBRA: ', bold: true, color: '#0369a1' }, nomeObra], fontSize: 7.5 },
                    { text: [{ text: 'RESPONSÁVEL: ', bold: true, color: '#0369a1' }, perfil.nome], fontSize: 7.5, alignment: 'right' }
                  ]
                }
              ],
              margin: [4, 3, 4, 3]
            }
          ]]
        },
        layout: 'noBorders',
        margin: [0, 0, 0, 6]
      },
      {
        table: {
          widths: ['*', 160, 95],
          body: [
            [
              { text: 'Item / Descrição do Material', bold: true, fillColor: '#0f172a', color: '#ffffff', fontSize: 7.5 },
              { text: 'Especificação Técnica', bold: true, fillColor: '#0f172a', color: '#ffffff', fontSize: 7.5 },
              { text: 'Qtd Prevista', bold: true, fillColor: '#0f172a', color: '#ffffff', fontSize: 7.5, alignment: 'center' }
            ],
            ...linhasMateriais
          ]
        },
        layout: {
          hLineWidth: () => 0.5,
          vLineWidth: () => 0.5,
          hLineColor: () => '#cbd5e1',
          vLineColor: () => '#cbd5e1'
        },
        margin: [0, 0, 0, 8]
      },

      // Bloco de Prazo e Garantia dinâmicos capturados dos inputs
      {
        table: {
          widths: ['*'],
          body: [[
            {
              fillColor: '#f1f5f9',
              stack: [
                {
                  columns: [
                    { text: [{ text: 'PRAZO DE EXECUÇÃO: ', bold: true, color: '#0369a1' }, prazoExecucao], fontSize: 7.5 },
                    { text: [{ text: 'GARANTIA DA INSTALAÇÃO: ', bold: true, color: '#0369a1' }, garantia], fontSize: 7.5, alignment: 'right' }
                  ]
                },
                {
                  text: 'Nota: Levantamento técnico sujeito a conferência final in loco. As quantidades incluem margem de corte e segurança.',
                  fontSize: 6.8,
                  color: '#64748b',
                  margin: [0, 2, 0, 0]
                }
              ],
              margin: [6, 4, 6, 4]
            }
          ]]
        },
        layout: 'noBorders',
        margin: [0, 0, 0, 10]
      },

      // Assinatura do Técnico Responsável
      {
        columns: [
          { width: '*', text: '' },
          {
            width: 220,
            stack: [
              { canvas: [{ type: 'line', x1: 10, y1: 0, x2: 210, y2: 0, lineWidth: 0.8, lineColor: '#94a3b8' }] },
              { text: perfil.nome, fontSize: 7.5, bold: true, alignment: 'center', margin: [0, 3, 0, 0] },
              { text: 'Profissional Técnico Responsável', fontSize: 6.5, color: '#64748b', alignment: 'center' }
            ]
          },
          { width: '*', text: '' }
        ],
        margin: [0, 6, 0, 0]
      }
    ]
  };

  if (perfilHelper && typeof perfilHelper.aplicarTemaDoc === 'function') {
    perfilHelper.aplicarTemaDoc(docDef);
  }

  const pdf = window.pdfMake.createPdf(docDef);
  if (acao === 'download') {
    pdf.download(`Lista_Materiais_${(nomeObra).replace(/\s+/g, '_')}.pdf`);
  } else {
    pdf.open();
  }
  return docDef;
}

/* ==========================================================================
   4. CRM DE CLIENTES COM INTEGRAÇÃO WHATSAPP
   ========================================================================== */
const CRM_STORAGE_KEY = 'tecnicamz_pro_crm_clientes';

const CRMClientes = {
  obterTodos() {
    try {
      const data = localStorage.getItem(CRM_STORAGE_KEY);
      return data ? JSON.parse(data) : this._clientesIniciais();
    } catch (e) {
      return this._clientesIniciais();
    }
  },

  salvar(clientes) {
    localStorage.setItem(CRM_STORAGE_KEY, JSON.stringify(clientes));
  },

  adicionar(cliente) {
    const lista = this.obterTodos();
    const novo = {
      id: `cli_${Date.now()}`,
      nome: cliente.nome || 'Cliente',
      telefone: cliente.telefone || '',
      localizacao: cliente.localizacao || 'Maputo',
      notas: cliente.notas || '',
      dataCadastro: new Date().toLocaleDateString('pt-MZ')
    };
    lista.unshift(novo);
    this.salvar(lista);
    return novo;
  },

  gerarLinkWhatsApp(cliente, mensagemPadrao = '') {
    let tel = (cliente.telefone || '').replace(/\D/g, '');
    if (tel.startsWith('0')) tel = tel.slice(1);
    if (!tel.startsWith('258') && tel.length <= 9) tel = `258${tel}`;

    const texto = mensagemPadrao || `Olá, ${cliente.nome}! Sou seu técnico eletricista responsável pela sua instalação. Como posso ajudá-lo hoje?`;
    return `https://wa.me/${tel}?text=${encodeURIComponent(texto)}`;
  },

  _clientesIniciais() {
    return [
      { id: 'c1', nome: 'Manuel Sitoe', telefone: '+258 84 123 4567', localizacao: 'Matola Rio', notas: 'Quadro 18 DIN instalado e testado.', dataCadastro: '02/02/2026' },
      { id: 'c2', nome: 'Dra. Amina Patel', telefone: '+258 82 987 6543', localizacao: 'Polana Cimento', notas: 'Revisão de termoacumulador e IDR.', dataCadastro: '15/01/2026' }
    ];
  }
};

if (typeof window !== 'undefined') {
  window.gerarPDF_OS = gerarPDF_OS;
  window.gerarListaMateriais = gerarListaMateriais;
  window.GeradorOS = GeradorOS;
  window.CalculadoraPrecoServico = CalculadoraPrecoServico;
  window.ListaMateriaisAutomatica = ListaMateriaisAutomatica;
  window.CRMClientes = CRMClientes;
}
