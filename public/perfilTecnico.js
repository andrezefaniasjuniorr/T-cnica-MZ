/**
 * Módulo: perfilTecnico.js
 * Gerenciamento 100% White-Label de Identidade Visual do Técnico / Profissional
 * 
 * Regra Rígida: NENHUM gerador de PDF deve conter a marca ou logotipo do app.
 * Todas as ferramentas de PDF buscam dinamicamente do localStorage as chaves:
 * - 'tecnico_nome'   (Nome do Profissional / Empresa)
 * - 'tecnico_slogan' (Slogan Personalizado)
 * - 'tecnico_logo'   (Logotipo Base64)
 */

const PerfilTecnico = {
  // Dados Neutros Padrão (Sem marcas de terceiros)
  dadosPadrao: {
    nome: 'Eletricista Profissional & Serviços',
    slogan: 'Instalações, Manutenção e Soluções Elétricas',
    telefone: '+258 84 000 0000',
    email: '',
    nuit: '',
    cidade: 'Maputo',
    endereco: '',
    logoBase64: null,
    pdfTemplate: 'corporate_blue',
    pdfOrientation: 'portrait',
    pdfFontSize: 'medium',
    borderColor: '#0066FF'
  },

  // Definições de cores e cabeçalhos dos 7 templates
  templates: {
    corporate_blue: {
      id: 'corporate_blue',
      nome: 'Corporativo Azul',
      primary: '#1E3A8A',
      secondary: '#2563EB',
      bannerBg: '#1E3A8A',
      bannerText: '#FFFFFF',
      subText: '#93C5FD',
      borderColor: '#0066FF',
      zebraBg: '#F8FAFC',
      headerThBg: '#1E3A8A',
      headerThText: '#FFFFFF'
    },
    modern_dark: {
      id: 'modern_dark',
      nome: 'Moderno Tech/Dark',
      primary: '#0F172A',
      secondary: '#06B6D4',
      bannerBg: '#0F172A',
      bannerText: '#38BDF8',
      subText: '#94A3B8',
      borderColor: '#8B5CF6',
      zebraBg: '#F1F5F9',
      headerThBg: '#0F172A',
      headerThText: '#38BDF8'
    },
    minimalist_green: {
      id: 'minimalist_green',
      nome: 'Minimalista Verde',
      primary: '#064E3B',
      secondary: '#059669',
      bannerBg: '#ECFDF5',
      bannerText: '#064E3B',
      subText: '#047857',
      borderColor: '#10B981',
      zebraBg: '#F0FDF4',
      headerThBg: '#064E3B',
      headerThText: '#FFFFFF'
    },
    premium_gold: {
      id: 'premium_gold',
      nome: 'Premium Dourado & Grafite',
      primary: '#18181B',
      secondary: '#D97706',
      bannerBg: '#18181B',
      bannerText: '#FBBF24',
      subText: '#FDE68A',
      borderColor: '#D97706',
      zebraBg: '#FFFBEB',
      headerThBg: '#18181B',
      headerThText: '#FBBF24'
    },
    executive_elegant: {
      id: 'executive_elegant',
      nome: 'Executivo Elegante',
      primary: '#312E81',
      secondary: '#4F46E5',
      bannerBg: '#312E81',
      bannerText: '#EEF2FF',
      subText: '#C7D2FE',
      borderColor: '#8B5CF6',
      zebraBg: '#EEF2FF',
      headerThBg: '#312E81',
      headerThText: '#FFFFFF'
    },
    industrial_contrast: {
      id: 'industrial_contrast',
      nome: 'Industrial High-Contrast',
      primary: '#111827',
      secondary: '#F97316',
      bannerBg: '#111827',
      bannerText: '#FB923C',
      subText: '#FDBA74',
      borderColor: '#F97316',
      zebraBg: '#FFF7ED',
      headerThBg: '#111827',
      headerThText: '#FB923C'
    },
    clean_edm: {
      id: 'clean_edm',
      nome: 'Clean Padrão EDM',
      primary: '#0369A1',
      secondary: '#0284C7',
      bannerBg: '#E0F2FE',
      bannerText: '#0C4A6E',
      subText: '#0369A1',
      borderColor: '#0066FF',
      zebraBg: '#F0F9FF',
      headerThBg: '#0369A1',
      headerThText: '#FFFFFF'
    }
  },

  // Obter perfil buscando diretamente as chaves especificadas no localStorage
  obter() {
    try {
      const nome = localStorage.getItem('tecnico_nome');
      const slogan = localStorage.getItem('tecnico_slogan');
      const logo = localStorage.getItem('tecnico_logo');
      const telefone = localStorage.getItem('tecnico_telefone');
      const email = localStorage.getItem('tecnico_email');
      const nuit = localStorage.getItem('tecnico_nuit');
      const cidade = localStorage.getItem('tecnico_cidade');
      const endereco = localStorage.getItem('tecnico_endereco');

      const pdfTemplate = localStorage.getItem('tecnico_pdf_template') || 'corporate_blue';
      const pdfOrientation = localStorage.getItem('tecnico_pdf_orientation') || 'portrait';
      const pdfFontSize = localStorage.getItem('tecnico_pdf_font_size') || 'medium';
      const borderColor = localStorage.getItem('tecnico_border_color') || '#0066FF';

      // Se houver dados salvos no padrão legado, aproveita como fallback secundário
      let legado = {};
      const legadoStr = localStorage.getItem('tecnicamz_pro_perfil_tecnico');
      if (legadoStr) {
        try { legado = JSON.parse(legadoStr); } catch (e) {}
      }

      return {
        nome: (nome && nome.trim()) ? nome : (legado.nome && !legado.nome.includes('TécnicaMZ') ? legado.nome : this.dadosPadrao.nome),
        slogan: (slogan && slogan.trim()) ? slogan : (legado.slogan ? legado.slogan : this.dadosPadrao.slogan),
        logoBase64: logo || legado.logoBase64 || null,
        telefone: telefone || legado.telefone || this.dadosPadrao.telefone,
        email: email || legado.email || this.dadosPadrao.email,
        nuit: nuit || legado.nuit || this.dadosPadrao.nuit,
        cidade: cidade || legado.cidade || this.dadosPadrao.cidade,
        endereco: endereco || legado.endereco || this.dadosPadrao.endereco,
        pdfTemplate: pdfTemplate in this.templates ? pdfTemplate : 'corporate_blue',
        pdfOrientation: pdfOrientation === 'landscape' ? 'landscape' : 'portrait',
        pdfFontSize: ['small', 'medium', 'large'].includes(pdfFontSize) ? pdfFontSize : 'medium',
        borderColor: borderColor || '#0066FF'
      };
    } catch (e) {
      console.warn('[PerfilTecnico] Erro ao ler dados do localStorage:', e);
      return { ...this.dadosPadrao };
    }
  },

  // Salvar perfil atualizado nas chaves primárias do localStorage
  salvar(novosDados) {
    try {
      if (novosDados.nome !== undefined) localStorage.setItem('tecnico_nome', novosDados.nome);
      if (novosDados.slogan !== undefined) localStorage.setItem('tecnico_slogan', novosDados.slogan);
      if (novosDados.logoBase64 !== undefined) {
        if (novosDados.logoBase64) {
          localStorage.setItem('tecnico_logo', novosDados.logoBase64);
        } else {
          localStorage.removeItem('tecnico_logo');
        }
      }
      if (novosDados.telefone !== undefined) localStorage.setItem('tecnico_telefone', novosDados.telefone);
      if (novosDados.email !== undefined) localStorage.setItem('tecnico_email', novosDados.email);
      if (novosDados.nuit !== undefined) localStorage.setItem('tecnico_nuit', novosDados.nuit);
      if (novosDados.cidade !== undefined) localStorage.setItem('tecnico_cidade', novosDados.cidade);
      if (novosDados.endereco !== undefined) localStorage.setItem('tecnico_endereco', novosDados.endereco);

      if (novosDados.pdfTemplate !== undefined) localStorage.setItem('tecnico_pdf_template', novosDados.pdfTemplate);
      if (novosDados.pdfOrientation !== undefined) localStorage.setItem('tecnico_pdf_orientation', novosDados.pdfOrientation);
      if (novosDados.pdfFontSize !== undefined) localStorage.setItem('tecnico_pdf_font_size', novosDados.pdfFontSize);
      if (novosDados.borderColor !== undefined) localStorage.setItem('tecnico_border_color', novosDados.borderColor);

      const atualizado = this.obter();
      // Atualiza também chave legada para retrocompatibilidade
      localStorage.setItem('tecnicamz_pro_perfil_tecnico', JSON.stringify(atualizado));

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('perfilTecnicoAtualizado', { detail: atualizado }));
      }
      return { success: true, perfil: atualizado };
    } catch (e) {
      console.error('[PerfilTecnico] Erro ao salvar perfil:', e);
      return { success: false, error: e.message };
    }
  },

  // Obter configurações de tema ativo
  obterTema() {
    const p = this.obter();
    const t = this.templates[p.pdfTemplate] || this.templates.corporate_blue;
    const corBorda = p.borderColor || t.borderColor;
    const isLandscape = p.pdfOrientation === 'landscape';
    const fontMultiplier = p.pdfFontSize === 'small' ? 0.88 : (p.pdfFontSize === 'large' ? 1.15 : 1.0);
    const contentWidth = isLandscape ? 770 : 530;

    return {
      template: t,
      corBorda,
      isLandscape,
      orientation: p.pdfOrientation,
      fontSizeMode: p.pdfFontSize,
      fontMultiplier,
      contentWidth
    };
  },

  // Injeta automaticamente orientacao, margens, font-scaling e metadados no docDefinition do pdfMake
  aplicarTemaDoc(docDefinition) {
    const tema = this.obterTema();
    const p = this.obter();

    docDefinition.pageSize = 'A4';
    docDefinition.pageOrientation = tema.orientation;
    docDefinition.pageMargins = tema.isLandscape ? [36, 24, 36, 24] : [32, 24, 32, 24];

    // Adiciona escala de fontes globalmente se definido
    if (tema.fontMultiplier !== 1.0) {
      if (!docDefinition.defaultStyle) docDefinition.defaultStyle = {};
      const baseFs = (docDefinition.defaultStyle.fontSize || 8) * tema.fontMultiplier;
      docDefinition.defaultStyle.fontSize = Math.round(baseFs * 10) / 10;
    }

    // Metadados white-label
    docDefinition.info = {
      title: `${p.nome} - Documento Técnico`,
      author: p.nome,
      subject: p.slogan,
      creator: p.nome
    };

    return docDefinition;
  },

  // Converter imagem para Base64
  converterLogoParaBase64(arquivo) {
    return new Promise((resolve, reject) => {
      if (!arquivo) return reject(new Error('Nenhum arquivo fornecido.'));
      if (!arquivo.type.startsWith('image/')) return reject(new Error('Selecione uma imagem válida (PNG, JPG ou WEBP).'));
      
      const leitor = new FileReader();
      leitor.onload = () => resolve(leitor.result);
      leitor.onerror = (err) => reject(err);
      leitor.readAsDataURL(arquivo);
    });
  },

  // Gera o cabeçalho PDF 100% White-Label aplicando a estrutura visual do template escolhido
  gerarCabecalhoPDF(tituloDocumento = 'DOCUMENTO TÉCNICO', subtitulo = '') {
    const p = this.obter();
    const tema = this.obterTema();
    const t = tema.template;
    const corBorda = tema.corBorda;
    const isLandscape = tema.isLandscape;
    const lineWidth = tema.contentWidth;
    const fsMult = tema.fontMultiplier;

    // Coluna do Logotipo do Técnico
    let colunaLogo;
    if (p.logoBase64) {
      colunaLogo = {
        image: p.logoBase64,
        width: 65,
        height: 48,
        alignment: 'center',
        margin: [0, 0, 12, 0]
      };
    } else {
      // Monograma elegante baseado nas iniciais do profissional
      const iniciais = (p.nome || 'EP')
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map(w => w[0].toUpperCase())
        .join('');

      colunaLogo = {
        table: {
          widths: [54],
          body: [[
            {
              text: `⚡ ${iniciais}`,
              fillColor: t.primary,
              color: '#FFFFFF',
              bold: true,
              fontSize: Math.round(11 * fsMult),
              alignment: 'center',
              margin: [0, 10, 0, 10]
            }
          ]]
        },
        layout: {
          hLineWidth: () => 1,
          vLineWidth: () => 1,
          hLineColor: () => corBorda,
          vLineColor: () => corBorda
        },
        margin: [0, 0, 12, 0]
      };
    }

    // ESTRUTURA 2: MODERNO DARK (Cabeçalho escuro centralizado com acentos coloridos)
    if (t.id === 'modern_tech') {
      return [
        {
          table: {
            widths: ['*'],
            body: [[
              {
                fillColor: '#0F172A',
                stack: [
                  p.logoBase64 ? {
                    image: p.logoBase64,
                    width: 55,
                    height: 40,
                    alignment: 'center',
                    margin: [0, 2, 0, 4]
                  } : {
                    text: `⚡ ${(p.nome || 'EP').slice(0, 2).toUpperCase()}`,
                    fontSize: 14,
                    bold: true,
                    color: t.secondary,
                    alignment: 'center',
                    margin: [0, 2, 0, 2]
                  },
                  {
                    text: (p.nome || 'SERVIÇOS TÉCNICOS').toUpperCase(),
                    fontSize: Math.round(13 * fsMult),
                    bold: true,
                    color: '#FFFFFF',
                    alignment: 'center'
                  },
                  p.slogan ? {
                    text: p.slogan,
                    fontSize: Math.round(8.5 * fsMult),
                    italics: true,
                    color: t.secondary,
                    alignment: 'center',
                    margin: [0, 1, 0, 2]
                  } : {},
                  {
                    text: `Tel: ${p.telefone || '---'}  •  ${p.email || 'Moçambique'}${p.nuit ? '  •  NUIT: ' + p.nuit : ''}`,
                    fontSize: Math.round(7.5 * fsMult),
                    color: '#94A3B8',
                    alignment: 'center'
                  }
                ],
                margin: [6, 8, 6, 8]
              }
            ]]
          },
          layout: {
            hLineWidth: () => 1.5,
            vLineWidth: () => 1.5,
            hLineColor: () => corBorda,
            vLineColor: () => corBorda
          },
          margin: [0, 0, 0, 4]
        },
        // Faixa do Título do Documento Dark
        {
          table: {
            widths: ['*'],
            body: [[
              {
                fillColor: '#1E293B',
                stack: [
                  {
                    text: tituloDocumento.toUpperCase(),
                    fontSize: Math.round(10.5 * fsMult),
                    bold: true,
                    color: t.bannerText,
                    alignment: 'center'
                  },
                  subtitulo ? {
                    text: subtitulo,
                    fontSize: Math.round(7.5 * fsMult),
                    color: t.subText,
                    alignment: 'center',
                    margin: [0, 1, 0, 0]
                  } : {}
                ],
                margin: [0, 3, 0, 3]
              }
            ]]
          },
          layout: {
            hLineWidth: () => 1,
            vLineWidth: () => 1,
            hLineColor: () => corBorda,
            vLineColor: () => corBorda
          },
          margin: [0, 0, 0, 8]
        }
      ];
    }

    // ESTRUTURA 3: MINIMALISTA VERDE (Linhas finas, sem blocos de fundo pesados, foco em tabelas limpas)
    if (t.id === 'minimalist_green') {
      return [
        {
          columns: [
            colunaLogo,
            {
              stack: [
                {
                  text: (p.nome || 'SERVIÇOS TÉCNICOS').toUpperCase(),
                  fontSize: Math.round(12.5 * fsMult),
                  bold: true,
                  color: t.primary
                },
                p.slogan ? {
                  text: p.slogan,
                  fontSize: Math.round(8.5 * fsMult),
                  italics: true,
                  color: '#475569',
                  margin: [0, 1, 0, 2]
                } : {},
                {
                  text: `Tel: ${p.telefone || '---'}  |  ${p.email || 'Moçambique'}${p.nuit ? '  |  NUIT: ' + p.nuit : ''}`,
                  fontSize: Math.round(7.5 * fsMult),
                  color: '#64748B'
                }
              ]
            }
          ],
          margin: [0, 0, 0, 6]
        },
        // Linha divisória fina minimalista
        {
          canvas: [
            { type: 'line', x1: 0, y1: 0, x2: lineWidth, y2: 0, lineWidth: 1, lineColor: '#CBD5E1' }
          ],
          margin: [0, 0, 0, 6]
        },
        // Título sem bloco de preenchimento pesado
        {
          columns: [
            {
              text: tituloDocumento.toUpperCase(),
              fontSize: Math.round(10.5 * fsMult),
              bold: true,
              color: t.primary
            },
            {
              text: subtitulo || '',
              fontSize: Math.round(7.5 * fsMult),
              color: '#64748B',
              alignment: 'right',
              margin: [0, 2, 0, 0]
            }
          ],
          margin: [0, 0, 0, 8]
        },
        {
          canvas: [
            { type: 'line', x1: 0, y1: 0, x2: lineWidth, y2: 0, lineWidth: 1, lineColor: corBorda }
          ],
          margin: [0, 0, 0, 8]
        }
      ];
    }

    // ESTRUTURA 4: EXECUTIVO ELEGANTE (Layout estruturado em 3 colunas balanceadas)
    if (t.id === 'executive_elegant') {
      return [
        {
          columns: [
            colunaLogo,
            {
              width: '*',
              stack: [
                {
                  text: (p.nome || 'SERVIÇOS TÉCNICOS').toUpperCase(),
                  fontSize: Math.round(12.5 * fsMult),
                  bold: true,
                  color: t.primary
                },
                p.slogan ? {
                  text: p.slogan,
                  fontSize: Math.round(8.5 * fsMult),
                  italics: true,
                  color: t.secondary,
                  margin: [0, 1, 0, 2]
                } : {},
                {
                  text: `Certificação Técnica • Instalações Prediais & Industriais`,
                  fontSize: Math.round(7.5 * fsMult),
                  color: '#64748B'
                }
              ]
            },
            {
              width: isLandscape ? 240 : 160,
              table: {
                widths: ['*'],
                body: [[
                  {
                    fillColor: '#F8FAFC',
                    stack: [
                      { text: `TEL: ${p.telefone || '---'}`, fontSize: Math.round(7.5 * fsMult), bold: true, color: '#334155' },
                      p.nuit ? { text: `NUIT: ${p.nuit}`, fontSize: Math.round(7.2 * fsMult), color: '#475569' } : {},
                      { text: `${p.cidade || 'Moçambique'}`, fontSize: Math.round(7.2 * fsMult), color: '#64748B' }
                    ],
                    margin: [4, 4, 4, 4]
                  }
                ]]
              },
              layout: {
                hLineWidth: () => 1,
                vLineWidth: () => 1,
                hLineColor: () => corBorda,
                vLineColor: () => corBorda
              }
            }
          ],
          margin: [0, 0, 0, 6]
        },
        // Faixa de Título Executiva
        {
          table: {
            widths: ['*'],
            body: [[
              {
                fillColor: t.bannerBg,
                stack: [
                  {
                    text: tituloDocumento.toUpperCase(),
                    fontSize: Math.round(10.5 * fsMult),
                    bold: true,
                    color: t.bannerText,
                    alignment: 'center'
                  },
                  subtitulo ? {
                    text: subtitulo,
                    fontSize: Math.round(7.5 * fsMult),
                    color: t.subText,
                    alignment: 'center',
                    margin: [0, 1.5, 0, 0]
                  } : {}
                ],
                margin: [0, 4, 0, 4]
              }
            ]]
          },
          layout: {
            hLineWidth: () => 1.5,
            vLineWidth: () => 1.5,
            hLineColor: () => corBorda,
            vLineColor: () => corBorda
          },
          margin: [0, 0, 0, 8]
        }
      ];
    }

    // ESTRUTURA 5: PREMIUM DOURADO & GRAFITE (Luxo, linhas duplas e selo dourado)
    if (t.id === 'premium_gold') {
      return [
        {
          table: {
            widths: ['*'],
            body: [[
              {
                fillColor: '#18181B',
                stack: [
                  {
                    columns: [
                      p.logoBase64 ? {
                        image: p.logoBase64,
                        width: 54,
                        height: 40,
                        alignment: 'center',
                        margin: [0, 0, 8, 0]
                      } : {
                        text: `⚡ ${(p.nome || 'EP').slice(0, 2).toUpperCase()}`,
                        fontSize: 14,
                        bold: true,
                        color: '#F59E0B',
                        alignment: 'center',
                        margin: [0, 6, 8, 6]
                      },
                      {
                        stack: [
                          {
                            text: (p.nome || 'SERVIÇOS TÉCNICOS').toUpperCase(),
                            fontSize: Math.round(13 * fsMult),
                            bold: true,
                            color: '#F59E0B'
                          },
                          p.slogan ? {
                            text: p.slogan,
                            fontSize: Math.round(8.5 * fsMult),
                            italics: true,
                            color: '#E4E4E7',
                            margin: [0, 1, 0, 2]
                          } : {},
                          {
                            text: `Tel: ${p.telefone || '---'}  •  ${p.cidade || 'Moçambique'}${p.nuit ? '  •  NUIT: ' + p.nuit : ''}`,
                            fontSize: Math.round(7.5 * fsMult),
                            color: '#A1A1AA'
                          }
                        ]
                      }
                    ]
                  }
                ],
                margin: [8, 6, 8, 6]
              }
            ]]
          },
          layout: {
            hLineWidth: () => 1.5,
            vLineWidth: () => 1.5,
            hLineColor: () => corBorda,
            vLineColor: () => corBorda
          },
          margin: [0, 0, 0, 4]
        },
        // Linha dourada dupla decorativa
        {
          canvas: [
            { type: 'line', x1: 0, y1: 0, x2: lineWidth, y2: 0, lineWidth: 2, lineColor: '#D97706' }
          ],
          margin: [0, 0, 0, 4]
        },
        {
          table: {
            widths: ['*'],
            body: [[
              {
                fillColor: '#27272A',
                stack: [
                  {
                    text: tituloDocumento.toUpperCase(),
                    fontSize: Math.round(10.5 * fsMult),
                    bold: true,
                    color: '#FDE68A',
                    alignment: 'center'
                  },
                  subtitulo ? {
                    text: subtitulo,
                    fontSize: Math.round(7.5 * fsMult),
                    color: '#F59E0B',
                    alignment: 'center',
                    margin: [0, 1, 0, 0]
                  } : {}
                ],
                margin: [0, 3, 0, 3]
              }
            ]]
          },
          layout: {
            hLineWidth: () => 1,
            vLineWidth: () => 1,
            hLineColor: () => '#D97706',
            vLineColor: () => '#D97706'
          },
          margin: [0, 0, 0, 8]
        }
      ];
    }

    // ESTRUTURA 6: INDUSTRIAL HIGH-CONTRAST (Foco em segurança de campo e alto contraste)
    if (t.id === 'industrial_orange') {
      return [
        {
          table: {
            widths: [75, '*'],
            body: [[
              {
                fillColor: '#111827',
                stack: [
                  colunaLogo,
                  {
                    text: 'NORMAS IEC/EDM',
                    fontSize: 6,
                    bold: true,
                    color: '#F97316',
                    alignment: 'center',
                    margin: [0, 2, 0, 0]
                  }
                ],
                margin: [4, 6, 4, 6]
              },
              {
                fillColor: '#FFF7ED',
                stack: [
                  {
                    text: (p.nome || 'SERVIÇOS TÉCNICOS INDUSTRIAIS').toUpperCase(),
                    fontSize: Math.round(13 * fsMult),
                    bold: true,
                    color: '#C2410C'
                  },
                  p.slogan ? {
                    text: p.slogan,
                    fontSize: Math.round(8.5 * fsMult),
                    italics: true,
                    color: '#EA580C',
                    margin: [0, 1, 0, 2]
                  } : {},
                  {
                    text: `SEGURANÇA & MANUTENÇÃO • TEL: ${p.telefone || '---'} • ${p.cidade || 'Moçambique'}${p.nuit ? ' • NUIT: ' + p.nuit : ''}`,
                    fontSize: Math.round(7.5 * fsMult),
                    bold: true,
                    color: '#431407'
                  }
                ],
                margin: [8, 6, 8, 6]
              }
            ]]
          },
          layout: {
            hLineWidth: () => 1.5,
            vLineWidth: () => 1.5,
            hLineColor: () => '#EA580C',
            vLineColor: () => '#EA580C'
          },
          margin: [0, 0, 0, 4]
        },
        // Tarja industrial de documento
        {
          table: {
            widths: ['*'],
            body: [[
              {
                fillColor: '#111827',
                stack: [
                  {
                    text: `⚠️  ${tituloDocumento.toUpperCase()}  ⚠️`,
                    fontSize: Math.round(11 * fsMult),
                    bold: true,
                    color: '#FB923C',
                    alignment: 'center'
                  },
                  subtitulo ? {
                    text: subtitulo,
                    fontSize: Math.round(7.8 * fsMult),
                    color: '#FDBA74',
                    alignment: 'center',
                    margin: [0, 1.5, 0, 0]
                  } : {}
                ],
                margin: [0, 3.5, 0, 3.5]
              }
            ]]
          },
          layout: {
            hLineWidth: () => 1,
            vLineWidth: () => 1,
            hLineColor: () => '#F97316',
            vLineColor: () => '#F97316'
          },
          margin: [0, 0, 0, 8]
        }
      ];
    }

    // ESTRUTURA 7: CLEAN PADRÃO EDM (Fichas operacionais da rede de energia)
    if (t.id === 'clean_edm') {
      return [
        {
          table: {
            widths: ['*', 120],
            body: [[
              {
                stack: [
                  {
                    columns: [
                      colunaLogo,
                      {
                        stack: [
                          {
                            text: (p.nome || 'SERVIÇOS TÉCNICOS ELETRICIDADE').toUpperCase(),
                            fontSize: Math.round(12.5 * fsMult),
                            bold: true,
                            color: '#0369A1'
                          },
                          p.slogan ? {
                            text: p.slogan,
                            fontSize: Math.round(8.5 * fsMult),
                            italics: true,
                            color: '#0284C7',
                            margin: [0, 1, 0, 2]
                          } : {},
                          {
                            text: `Operações em Baixa & Média Tensão (220V / 380V - 50Hz)`,
                            fontSize: Math.round(7.5 * fsMult),
                            color: '#475569'
                          }
                        ]
                      }
                    ]
                  }
                ]
              },
              {
                fillColor: '#E0F2FE',
                stack: [
                  { text: 'PADRÃO EDM', fontSize: 8, bold: true, color: '#0369A1', alignment: 'center' },
                  { text: `Tel: ${p.telefone}`, fontSize: 7, color: '#0C4A6E', alignment: 'center', margin: [0, 2, 0, 0] },
                  { text: `${p.cidade}`, fontSize: 7, color: '#0C4A6E', alignment: 'center' }
                ],
                margin: [4, 4, 4, 4]
              }
            ]]
          },
          layout: {
            hLineWidth: () => 1,
            vLineWidth: () => 1,
            hLineColor: () => '#0284C7',
            vLineColor: () => '#0284C7'
          },
          margin: [0, 0, 0, 4]
        },
        // Tarja de documento padrão EDM
        {
          table: {
            widths: ['*'],
            body: [[
              {
                fillColor: '#0369A1',
                stack: [
                  {
                    text: tituloDocumento.toUpperCase(),
                    fontSize: Math.round(11 * fsMult),
                    bold: true,
                    color: '#FFFFFF',
                    alignment: 'center'
                  },
                  subtitulo ? {
                    text: subtitulo,
                    fontSize: Math.round(7.5 * fsMult),
                    color: '#BAE6FD',
                    alignment: 'center',
                    margin: [0, 1.5, 0, 0]
                  } : {}
                ],
                margin: [0, 3, 0, 3]
              }
            ]]
          },
          layout: {
            hLineWidth: () => 1,
            vLineWidth: () => 1,
            hLineColor: () => corBorda,
            vLineColor: () => corBorda
          },
          margin: [0, 0, 0, 8]
        }
      ];
    }

    // ESTRUTURA 1 (Corporativo) e Padrão: Cabeçalho com bloco corporativo e identificação estruturada
    const colunaInfo = {
      stack: [
        { 
          text: (p.nome || 'SERVIÇOS TÉCNICOS').toUpperCase(), 
          fontSize: Math.round(13 * fsMult), 
          bold: true, 
          color: t.primary 
        },
        p.slogan ? { 
          text: `"${p.slogan}"`, 
          fontSize: Math.round(8.5 * fsMult), 
          italics: true, 
          color: t.secondary, 
          margin: [0, 1, 0, 3] 
        } : {},
        {
          columns: [
            { 
              text: `Tel / WhatsApp: ${p.telefone || '---'}${p.email ? '  |  ' + p.email : ''}`, 
              fontSize: Math.round(7.5 * fsMult), 
              color: '#475569' 
            },
            { 
              text: `${p.nuit ? 'NUIT: ' + p.nuit + '  |  ' : ''}${p.cidade || 'Moçambique'}`, 
              fontSize: Math.round(7.5 * fsMult), 
              color: '#475569', 
              alignment: 'right' 
            }
          ]
        }
      ]
    };

    return [
      {
        columns: [
          colunaLogo,
          colunaInfo
        ],
        margin: [0, 0, 0, 6]
      },
      // Linha divisória com a cor de destaque/borda selecionada
      {
        canvas: [
          { type: 'line', x1: 0, y1: 0, x2: lineWidth, y2: 0, lineWidth: 2, lineColor: corBorda }
        ],
        margin: [0, 0, 0, 8]
      },
      // Tarja do Título do Documento com o tema escolhido
      {
        table: {
          widths: ['*'],
          body: [[
            {
              stack: [
                { 
                  text: tituloDocumento.toUpperCase(), 
                  fontSize: Math.round(11.5 * fsMult), 
                  bold: true, 
                  color: t.bannerText, 
                  alignment: 'center' 
                },
                subtitulo ? { 
                  text: subtitulo, 
                  fontSize: Math.round(7.8 * fsMult), 
                  color: t.subText, 
                  alignment: 'center', 
                  margin: [0, 1.5, 0, 0] 
                } : {}
              ],
              fillColor: t.bannerBg,
              margin: [0, 3.5, 0, 3.5]
            }
          ]]
        },
        layout: {
          hLineWidth: () => 1,
          vLineWidth: () => 1,
          hLineColor: () => corBorda,
          vLineColor: () => corBorda
        },
        margin: [0, 0, 0, 10]
      }
    ];
  },

  // Gera o bloco de assinaturas (Técnico e Cliente) com linha e textos 100% matematicamente centralizados
  gerarBlocoAssinaturas(nomeTecnico, nomeCliente, papelTecnico = 'Profissional Responsável / Contratado', papelCliente = 'Cliente / Contratante') {
    const p = this.obter();
    const tema = this.obterTema();
    const isLandscape = tema.isLandscape;
    const fsMult = tema.fontMultiplier || 1;
    const contentW = tema.contentWidth;
    const boxW = isLandscape ? 260 : 195;
    const gapW = isLandscape ? 110 : 50;
    const marginSide = Math.max(0, Math.floor((contentW - (boxW * 2 + gapW)) / 2));

    return {
      table: {
        widths: [marginSide, boxW, gapW, boxW, marginSide],
        body: [[
          {},
          {
            border: [false, true, false, false],
            borderColor: ['#94A3B8', '#94A3B8', '#94A3B8', '#94A3B8'],
            stack: [
              {
                text: (nomeTecnico || p.nome || 'Profissional Técnico'),
                fontSize: Math.round(8 * fsMult),
                bold: true,
                alignment: 'center',
                margin: [0, 4, 0, 1]
              },
              {
                text: papelTecnico,
                fontSize: Math.round(6.8 * fsMult),
                color: '#64748B',
                alignment: 'center'
              }
            ],
            margin: [0, 0, 0, 0]
          },
          {},
          {
            border: [false, true, false, false],
            borderColor: ['#94A3B8', '#94A3B8', '#94A3B8', '#94A3B8'],
            stack: [
              {
                text: (nomeCliente || 'Cliente / Contratante'),
                fontSize: Math.round(8 * fsMult),
                bold: true,
                alignment: 'center',
                margin: [0, 4, 0, 1]
              },
              {
                text: papelCliente,
                fontSize: Math.round(6.8 * fsMult),
                color: '#64748B',
                alignment: 'center'
              }
            ],
            margin: [0, 0, 0, 0]
          },
          {}
        ]]
      },
      layout: {
        defaultBorder: false
      },
      margin: [0, 20, 0, 4]
    };
  }
};

if (typeof window !== 'undefined') {
  window.PerfilTecnico = PerfilTecnico;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PerfilTecnico;
}
