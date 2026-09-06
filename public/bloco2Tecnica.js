/**
 * Módulo: bloco2Tecnica.js
 * TÉCNICA E DIMENSIONAMENTO 100% WHITE-LABEL
 * 
 * 5. Tabela do Quadro Geral (QG) em Cartela A4 para Porta do Quadro
 * 6. Dimensionamento Inteligente (Ib, Disjuntor DIN, Bitola e Queda de Tensão)
 * 7. Tabelas Normativas (AWG x mm², Ampacidade IEC, Cores EDM)
 * 8. Diagnóstico de Quadro por Foto (Inspeção visual e parecer)
 * 9. Checklist de Segurança NR10 (Laudo técnico em PDF)
 */

async function carregarPdfMakeSeNecessarioBloco2() {
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
    if (!window.pdfMake) await carregarScript('https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/pdfmake.min.js');
    if (!window.pdfMake.vfs) await carregarScript('https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/vfs_fonts.js');
    return window.pdfMake;
  } catch (err) {
    console.error('[Bloco2Tecnica] Erro ao carregar pdfmake:', err);
  }
}

/* ==========================================================================
   5. TABELA DO QUADRO GERAL (QG) - CARTELA DE PORTA 1 PÁGINA A4 WHITE-LABEL
   ========================================================================== */
const TabelaQuadroGeral = {
  async gerarPDF(dadosQG, acao = 'download') {
    await carregarPdfMakeSeNecessarioBloco2();
    const perfilHelper = (typeof window !== 'undefined' && window.PerfilTecnico) ? window.PerfilTecnico : null;
    const perfil = perfilHelper ? perfilHelper.obter() : {
      nome: 'Eletricista Profissional',
      slogan: 'Instalações Elétricas Seguras',
      telefone: '+258 84 000 0000',
      cidade: 'Maputo'
    };

    const obra = dadosQG.identificacao || dadosQG.identificacaoObra || 'QUADRO DE DISTRIBUIÇÃO GERAL (QDG)';
    const tensao = dadosQG.tensao || dadosQG.tensaoAlimentacao || '220V Monofásico (EDM)';
    const disjuntorGeral = dadosQG.disjuntorGeral || 'Bipolar 40A Curva C';
    const idr = dadosQG.idr || 'IDR Bipolar 40A 30mA';
    const dps = dadosQG.dps || '2x DPS 20kA 275V';
    const aterramento = dadosQG.aterramento || 'Haste Copperweld R < 10Ω';
    const dataInst = dadosQG.data || new Date().toLocaleDateString('pt-MZ');

    const circuitos = Array.isArray(dadosQG.circuitos) && dadosQG.circuitos.length > 0 
      ? dadosQG.circuitos 
      : [
        { numero: '01', amperagem: '10A', bitola: '1.5 mm²', locais: 'Iluminação Quartos e Corredor' },
        { numero: '02', amperagem: '10A', bitola: '1.5 mm²', locais: 'Iluminação Sala e Cozinha' },
        { numero: '03', amperagem: '16A', bitola: '2.5 mm²', locais: 'Tomadas TUG Sala e Quartos' },
        { numero: '04', amperagem: '16A', bitola: '2.5 mm²', locais: 'Tomadas TUG Cozinha e Área' },
        { numero: '05', amperagem: '25A', bitola: '4.0 mm²', locais: 'Termoacumulador (Chuveiro)' },
        { numero: '06', amperagem: '20A', bitola: '4.0 mm²', locais: 'Climatização (A/C Principal)' }
      ];

    // Linhas da Cartela Técnica
    const linhas = [
      [
        { text: 'Nº', bold: true, fillColor: '#0f172a', color: '#ffffff', fontSize: 8.5, alignment: 'center' },
        { text: 'Disjuntor', bold: true, fillColor: '#0f172a', color: '#ffffff', fontSize: 8.5, alignment: 'center' },
        { text: 'Cabo / Bitola', bold: true, fillColor: '#0f172a', color: '#ffffff', fontSize: 8.5, alignment: 'center' },
        { text: 'Locais & Equipamentos Atendidos', bold: true, fillColor: '#0f172a', color: '#ffffff', fontSize: 8.5 }
      ]
    ];

    circuitos.forEach((c, idx) => {
      const zebra = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
      const numFmt = String(c.numero || c.num || idx + 1).padStart(2, '0');
      linhas.push([
        { text: numFmt, fontSize: 8, bold: true, alignment: 'center', fillColor: zebra },
        { text: c.amperagem || c.disjuntor || '---', fontSize: 8, bold: true, color: '#0369a1', alignment: 'center', fillColor: zebra },
        { text: c.bitola || c.cabo || '---', fontSize: 8, alignment: 'center', fillColor: zebra },
        { text: c.locais || c.ambientes || c.descricao || 'Uso Geral', fontSize: 8, fillColor: zebra }
      ]);
    });

    const cabecalhoPDF = perfilHelper ? perfilHelper.gerarCabecalhoPDF(
      'TABELA DO QUADRO DE DISTRIBUIÇÃO GERAL',
      `Identificação: ${obra} | Tensão: ${tensao} | Data: ${dataInst}`
    ) : [];

    const docDefinition = {
      pageSize: 'A4',
      pageOrientation: 'portrait',
      pageMargins: [32, 24, 32, 24],
      content: [
        ...cabecalhoPDF,

        // Bloco de Proteções Gerais
        {
          table: {
            widths: ['*', '*', '*', '*'],
            body: [
              [
                { text: 'DISJUNTOR GERAL', bold: true, fontSize: 7, fillColor: '#e2e8f0', alignment: 'center' },
                { text: 'INTERRUPTOR DR (IDR)', bold: true, fontSize: 7, fillColor: '#e2e8f0', alignment: 'center' },
                { text: 'PROTETOR SURTO (DPS)', bold: true, fontSize: 7, fillColor: '#e2e8f0', alignment: 'center' },
                { text: 'ATERRAMENTO (TERRA)', bold: true, fontSize: 7, fillColor: '#e2e8f0', alignment: 'center' }
              ],
              [
                { text: disjuntorGeral, fontSize: 7.5, bold: true, alignment: 'center', margin: [0, 2, 0, 2] },
                { text: idr, fontSize: 7.5, alignment: 'center', margin: [0, 2, 0, 2] },
                { text: dps, fontSize: 7.5, alignment: 'center', margin: [0, 2, 0, 2] },
                { text: aterramento, fontSize: 7.5, alignment: 'center', margin: [0, 2, 0, 2] }
              ]
            ]
          },
          layout: 'lightHorizontalLines',
          margin: [0, 0, 0, 8]
        },

        // Tabela Principal de Circuitos
        {
          table: {
            widths: [30, 65, 75, '*'],
            body: linhas
          },
          layout: {
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
            hLineColor: () => '#94a3b8',
            vLineColor: () => '#cbd5e1'
          },
          margin: [0, 0, 0, 10]
        },

        // Rodapé de Segurança Estritamente 2 Linhas
        {
          table: {
            widths: ['*'],
            body: [[
              {
                fillColor: '#fee2e2',
                stack: [
                  { text: '1. Em caso de anomalia, fumaça ou faíscas, DESLIGUE O DISJUNTOR GERAL imediatamente.', fontSize: 7.5, bold: true, color: '#991b1b' },
                  { text: `2. Teste o botão de teste (T) do IDR mensalmente. Para assistência técnica e emergência ligue: ${perfil.nome} - Tel: ${perfil.telefone}`, fontSize: 7.5, color: '#7f1d1d' }
                ],
                margin: [4, 4, 4, 4]
              }
            ]]
          },
          layout: 'noBorders',
          margin: [0, 0, 0, 6]
        },

        {
          text: '✂ Recorte esta cartela técnica e fixe-a no lado interno da porta do quadro elétrico.',
          fontSize: 6.8,
          italics: true,
          alignment: 'center',
          color: '#64748b'
        }
      ]
    };

    const pdf = window.pdfMake.createPdf(docDefinition);
    if (acao === 'download') {
      pdf.download(`Tabela_Quadro_${obra.replace(/\s+/g, '_')}.pdf`);
    } else {
      pdf.open();
    }
  }
};

/* ==========================================================================
   6. DIMENSIONAMENTO INTELIGENTE PRO (Ib, Disjuntor, Bitola & Queda EDM)
   ========================================================================== */
const DimensionamentoEletrico = {
  calcular({
    potenciaWatts = 0,
    tensaoVolts = 220,
    distanciaMetros = 0,
    quedaAdmissivelPercent = 4
  }) {
    const P = Math.max(0, Number(potenciaWatts) || 0);
    const V = Number(tensaoVolts) === 380 ? 380 : 220;
    const L = Math.max(1, Number(distanciaMetros) || 1);
    const maxQueda = Math.max(1, Number(quedaAdmissivelPercent) || 4);

    // Corrente de Projeto Ib
    let Ib = 0;
    if (V === 380) {
      Ib = P / (Math.sqrt(3) * V * 0.92); // Trifásico FP 0.92
    } else {
      Ib = P / (V * 0.95); // Monofásico FP 0.95
    }
    Ib = Math.round(Ib * 10) / 10;

    // Disjuntores DIN Comerciais padronizados
    const disjuntoresComerciais = [10, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125];
    let disjuntor = disjuntoresComerciais.find(d => d >= Ib) || 125;

    // Tabela de capacidade de condução de corrente (cobre em eletroduto embutido)
    const bitolas = [
      { mm2: 1.5, ampacidade: 15.5 },
      { mm2: 2.5, ampacidade: 21 },
      { mm2: 4.0, ampacidade: 28 },
      { mm2: 6.0, ampacidade: 36 },
      { mm2: 10.0, ampacidade: 50 },
      { mm2: 16.0, ampacidade: 68 },
      { mm2: 25.0, ampacidade: 89 },
      { mm2: 35.0, ampacidade: 110 },
      { mm2: 50.0, ampacidade: 134 }
    ];

    // 1ª Etapa: Bitola mínima pela corrente
    let bitolaIndex = bitolas.findIndex(b => b.ampacidade >= disjuntor);
    if (bitolaIndex === -1) bitolaIndex = bitolas.length - 1;

    // 2ª Etapa: Verificação e ajuste pela queda de tensão
    // Resistividade do cobre: rho = 0.0178 ohm*mm2/m
    const rho = 0.0178;
    let bitolaFinal = bitolas[bitolaIndex].mm2;
    let deltaV = 0;
    let deltaVPercent = 0;

    while (bitolaIndex < bitolas.length) {
      bitolaFinal = bitolas[bitolaIndex].mm2;
      if (V === 380) {
        deltaV = (Math.sqrt(3) * rho * L * Ib) / bitolaFinal;
      } else {
        deltaV = (2 * rho * L * Ib) / bitolaFinal;
      }
      deltaVPercent = (deltaV / V) * 100;

      if (deltaVPercent <= maxQueda || bitolaIndex === bitolas.length - 1) {
        break;
      }
      bitolaIndex++; // Aumenta a bitola se a queda for excessiva
    }

    return {
      potenciaWatts: P,
      tensaoVolts: V,
      distanciaMetros: L,
      correnteIbA: Ib,
      disjuntorSugeridoA: disjuntor,
      bitolaRecomendadaMm2: bitolaFinal,
      quedaCalculadaPercent: Math.round(deltaVPercent * 100) / 100,
      quedaVolts: Math.round(deltaV * 10) / 10,
      conformeQueda: deltaVPercent <= maxQueda
    };
  }
};

/* ==========================================================================
   7. TABELAS TÉCNICAS (CONSULTAS RÁPIDAS)
   ========================================================================== */
const TabelasTecnicas = {
  tabelaAWG: [
    { awg: '14 AWG', mm2: '2.08', usoTipico: 'Iluminação residencial até 15A' },
    { awg: '12 AWG', mm2: '3.31', usoTipico: 'Tomadas de uso geral até 20A' },
    { awg: '10 AWG', mm2: '5.26', usoTipico: 'Chuveiro, aquecedor e A/C 30A' },
    { awg: '8 AWG', mm2: '8.37', usoTipico: 'Alimentador secundário até 40A' },
    { awg: '6 AWG', mm2: '13.3', usoTipico: 'Entrada principal de quadro 55A' },
    { awg: '4 AWG', mm2: '21.2', usoTipico: 'Ramal de entrada comercial 70A' },
    { awg: '2 AWG', mm2: '33.6', usoTipico: 'Quadro geral trifásico até 95A' }
  ],

  conducaoCorrente: [
    { bitola: '1.5 mm²', eletrodutoEmbutido: '15.5 A', arLivre: '19.5 A', disjuntorMax: '10 A' },
    { bitola: '2.5 mm²', eletrodutoEmbutido: '21.0 A', arLivre: '26.0 A', disjuntorMax: '16 A ou 20 A' },
    { bitola: '4.0 mm²', eletrodutoEmbutido: '28.0 A', arLivre: '35.0 A', disjuntorMax: '25 A' },
    { bitola: '6.0 mm²', eletrodutoEmbutido: '36.0 A', arLivre: '46.0 A', disjuntorMax: '32 A' },
    { bitola: '10.0 mm²', eletrodutoEmbutido: '50.0 A', arLivre: '63.0 A', disjuntorMax: '50 A' },
    { bitola: '16.0 mm²', eletrodutoEmbutido: '68.0 A', arLivre: '85.0 A', disjuntorMax: '63 A' }
  ],

  codigoCores: [
    { funcao: 'Condutor Neutro (N)', corNorma: 'Azul Claro (Obrigatório)', obs: 'Potencial zero de referência' },
    { funcao: 'Condutor de Proteção (Terra / PE)', corNorma: 'Verde ou Verde com Amarelo', obs: 'Segurança e desvio de fugas' },
    { funcao: 'Condutores de Fase (R, S, T)', corNorma: 'Castanho / Preto / Cinza / Vermelho', obs: 'Nunca utilizar azul ou verde como fase' },
    { funcao: 'Condutor de Retorno', corNorma: 'Amarelo, Branco ou Preto', obs: 'Comando de lâmpadas para interruptor' }
  ]
};

/* ==========================================================================
   9. CHECKLIST DE SEGURANÇA NR10 (LAUDO TÉCNICO 1 PÁGINA EM PDF)
   ========================================================================== */
const ChecklistSeguranca = {
  async gerarRelatorioPDF(dadosChecklist, acao = 'download') {
    await carregarPdfMakeSeNecessarioBloco2();
    const perfilHelper = (typeof window !== 'undefined' && window.PerfilTecnico) ? window.PerfilTecnico : null;
    const perfil = perfilHelper ? perfilHelper.obter() : { nome: 'Profissional Técnico', telefone: '' };

    const local = dadosChecklist.localObra || 'Instalação Elétrica Vistoriada';
    const data = new Date().toLocaleDateString('pt-MZ');

    const cabecalhoPDF = perfilHelper ? perfilHelper.gerarCabecalhoPDF(
      'LAUDO TÉCNICO DE CONFORMIDADE E SEGURANÇA',
      `Local: ${local} | Data da Inspeção: ${data}`
    ) : [];

    const docDef = {
      pageSize: 'A4',
      pageMargins: [32, 24, 32, 24],
      content: [
        ...cabecalhoPDF,
        { text: 'VERIFICAÇÃO DE PROCEDIMENTOS DE SEGURANÇA EM BAIXA TENSÃO', fontSize: 8, bold: true, color: '#0369a1', margin: [0, 0, 0, 4] },
        {
          table: {
            widths: ['*', 70],
            body: [
              [{ text: 'Item Inspecionado', bold: true, fontSize: 7.5, fillColor: '#0f172a', color: '#ffffff' }, { text: 'Conformidade', bold: true, fontSize: 7.5, fillColor: '#0f172a', color: '#ffffff', alignment: 'center' }],
              [{ text: '1. Desenergização do circuito com bloqueio e sinalização', fontSize: 7 }, { text: '✓ CONFORME', bold: true, color: '#059669', fontSize: 7, alignment: 'center' }],
              [{ text: '2. Constatação de ausência de tensão através de multímetro/voltímetro', fontSize: 7 }, { text: '✓ CONFORME', bold: true, color: '#059669', fontSize: 7, alignment: 'center' }],
              [{ text: '3. Utilização de EPIs adequados (Luvas isolantes 1000V, óculos e calçado)', fontSize: 7 }, { text: '✓ CONFORME', bold: true, color: '#059669', fontSize: 7, alignment: 'center' }],
              [{ text: '4. Inspeção visual de aperto dos barramentos e parafusos de disjuntores', fontSize: 7 }, { text: '✓ CONFORME', bold: true, color: '#059669', fontSize: 7, alignment: 'center' }],
              [{ text: '5. Verificação da atuação mecânica e teste (T) do Interruptor DR (IDR)', fontSize: 7 }, { text: '✓ CONFORME', bold: true, color: '#059669', fontSize: 7, alignment: 'center' }],
              [{ text: '6. Integridade dos Dispositivos de Proteção contra Surtos (DPS)', fontSize: 7 }, { text: '✓ CONFORME', bold: true, color: '#059669', fontSize: 7, alignment: 'center' }],
              [{ text: '7. Continuidade da malha de aterramento e ligação equipotencial', fontSize: 7 }, { text: '✓ CONFORME', bold: true, color: '#059669', fontSize: 7, alignment: 'center' }],
              [{ text: '8. Bitolas de cabos compatíveis com a proteção térmica dos disjuntores', fontSize: 7 }, { text: '✓ CONFORME', bold: true, color: '#059669', fontSize: 7, alignment: 'center' }],
              [{ text: '9. Identificação e legenda clara de todos os circuitos na porta do quadro', fontSize: 7 }, { text: '✓ CONFORME', bold: true, color: '#059669', fontSize: 7, alignment: 'center' }],
              [{ text: '10. Fechamento seguro da tampa e proteção contra contatos acidentais', fontSize: 7 }, { text: '✓ CONFORME', bold: true, color: '#059669', fontSize: 7, alignment: 'center' }]
            ]
          },
          layout: 'lightHorizontalLines',
          margin: [0, 0, 0, 10]
        },
        {
          text: `Atesto para os devidos efeitos que a instalação inspecionada preenche os requisitos fundamentais de segurança técnica. Responsável: ${perfil.nome}.`,
          fontSize: 7,
          italics: true,
          color: '#475569',
          alignment: 'center'
        }
      ]
    };

    const pdf = window.pdfMake.createPdf(docDef);
    if (acao === 'download') {
      pdf.download(`Laudo_Seguranca_${local.replace(/\s+/g, '_')}.pdf`);
    } else {
      pdf.open();
    }
  }
};

if (typeof window !== 'undefined') {
  window.TabelaQuadroGeral = TabelaQuadroGeral;
  window.DimensionamentoEletrico = DimensionamentoEletrico;
  window.TabelasTecnicas = TabelasTecnicas;
  window.ChecklistSeguranca = ChecklistSeguranca;
}
