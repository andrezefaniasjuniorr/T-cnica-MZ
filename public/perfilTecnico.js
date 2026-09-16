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
    nome: '',
    slogan: '',
    telefone: '',
    email: '',
    nuit: '',
    cidade: '',
    endereco: '',
    certificacoes: '',
    especialidades: '',
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

  // Validador estrito de imagem para o interpretador do pdfMake
  // pdfMake em navegadores suporta SOMENTE data:image/png;base64,... e data:image/jpeg;base64,...
  // Qualquer outro formato (ex: WebP, SVG, caminhos relativos, base64 truncado) gera:
  // "Invalid image: Error: Unknown image format. Images dictionary should contain dataURL entries"
  isPdfMakeCompatibleImage(dataUrl) {
    if (!dataUrl || typeof dataUrl !== 'string') return false;
    const trimmed = dataUrl.trim();
    const match = trimmed.match(/^data:image\/(?:png|jpeg|jpg);base64,([A-Za-z0-9+/=]+)/);
    if (!match || !match[1] || match[1].length < 24) return false;
    try {
      // Decodifica os primeiros bytes para validar os magic bytes reais de PNG/JPEG
      const b64Header = match[1].slice(0, 32);
      let binary = '';
      if (typeof atob === 'function') {
        binary = atob(b64Header);
      } else if (typeof Buffer !== 'undefined') {
        binary = Buffer.from(b64Header, 'base64').toString('binary');
      } else {
        return trimmed.startsWith('data:image/png;base64,') || trimmed.startsWith('data:image/jpeg;base64,');
      }
      if (binary.length < 4) return false;
      const b0 = binary.charCodeAt(0);
      const b1 = binary.charCodeAt(1);
      const b2 = binary.charCodeAt(2);
      const b3 = binary.charCodeAt(3);
      const isJpeg = (b0 === 0xff && b1 === 0xd8);
      const isPng = (b0 === 0x89 && b1 === 0x50 && b2 === 0x4e && b3 === 0x47);
      return isJpeg || isPng;
    } catch (e) {
      return false;
    }
  },

  // Sanitiza o logotipo. Se for um formato não suportado (ex: WebP herdado),
  // dispara conversão automática em segundo plano para PNG e retorna null imediatamente
  // para evitar o crash do pdfMake até que o PNG esteja pronto.
  sanitizarLogo(dataUrl) {
    if (!dataUrl || typeof dataUrl !== 'string') return null;
    const trimmed = dataUrl.trim();
    if (this.isPdfMakeCompatibleImage(trimmed)) {
      return trimmed;
    }

    // Se for WebP ou formato legado com dados válidos, converte via Canvas para PNG
    if (typeof window !== 'undefined' && typeof document !== 'undefined' && (trimmed.startsWith('data:image/') || trimmed.startsWith('blob:'))) {
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = img.width || 400;
            canvas.height = img.height || 400;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.imageSmoothingEnabled = true;
              ctx.imageSmoothingQuality = 'high';
              ctx.drawImage(img, 0, 0);
              const pngData = canvas.toDataURL('image/png');
              if (this.isPdfMakeCompatibleImage(pngData)) {
                try {
                  localStorage.setItem('user_logo', pngData);
                  localStorage.setItem('company_logo_base64', pngData);
                  localStorage.setItem('app_company_logo', pngData);
                  localStorage.setItem('tecnico_logo', pngData);
                } catch (e) {}
              }
            }
          } catch (e) {}
        };
        img.src = trimmed;
      } catch (e) {}
    }

    return null;
  },

  // Sanitiza todo o docDefinition recursivamente removendo nós { image: ... } incompatíveis
  sanitizarDocDefinition(docDef) {
    if (!docDef || typeof docDef !== 'object') return docDef;
    const self = this;

    const sanitizeNode = (node) => {
      if (!node || typeof node !== 'object') return;
      if (Array.isArray(node)) {
        for (let i = 0; i < node.length; i++) {
          sanitizeNode(node[i]);
        }
        return;
      }

      if ('image' in node) {
        const imgVal = node.image;
        if (!self.isPdfMakeCompatibleImage(imgVal)) {
          console.warn('[pdfMake Shield] Imagem incompatível ou corrompida removida com segurança:', typeof imgVal === 'string' ? imgVal.slice(0, 45) + '...' : imgVal);
          delete node.image;
          if (!node.text && !node.stack && !node.table && !node.canvas && !node.columns) {
            node.text = '';
          }
        }
      }

      for (const key of Object.keys(node)) {
        if (typeof node[key] === 'object' && node[key] !== null) {
          sanitizeNode(node[key]);
        }
      }
    };

    sanitizeNode(docDef);

    if (docDef.images && typeof docDef.images === 'object') {
      for (const key of Object.keys(docDef.images)) {
        if (!self.isPdfMakeCompatibleImage(docDef.images[key])) {
          delete docDef.images[key];
        }
      }
    }

    return docDef;
  },

  // Remove emergencialmente qualquer imagem do docDefinition em caso de erro no pdfMake
  purgarImagens(docDef) {
    if (!docDef || typeof docDef !== 'object') return docDef;
    const purgeNode = (node) => {
      if (!node || typeof node !== 'object') return;
      if (Array.isArray(node)) {
        for (let i = 0; i < node.length; i++) {
          purgeNode(node[i]);
        }
        return;
      }
      if ('image' in node) {
        delete node.image;
        if (!node.text && !node.stack && !node.table && !node.canvas && !node.columns) {
          node.text = '';
        }
      }
      for (const key of Object.keys(node)) {
        if (typeof node[key] === 'object' && node[key] !== null) {
          purgeNode(node[key]);
        }
      }
    };
    purgeNode(docDef);
    if (docDef.images) {
      delete docDef.images;
    }
    return docDef;
  },

  // Instala blindagem no motor do pdfMake interceptando window.pdfMake.createPdf
  instalarBlindagemPdfMake() {
    if (typeof window === 'undefined') return;
    const self = this;

    const hookPdfMake = () => {
      if (!window.pdfMake || window.pdfMake._shieldInstalled) return;

      const originalCreatePdf = window.pdfMake.createPdf.bind(window.pdfMake);
      window.pdfMake.createPdf = function(docDefinition, tableLayouts, fonts, vfs) {
        try {
          self.sanitizarDocDefinition(docDefinition);
        } catch (e) {
          console.warn('[pdfMake Shield] Falha ao sanitizar docDefinition:', e);
        }

        const docGenerator = originalCreatePdf(docDefinition, tableLayouts, fonts, vfs);

        const wrapMethod = (methodName) => {
          if (typeof docGenerator[methodName] !== 'function') return;
          const originalMethod = docGenerator[methodName].bind(docGenerator);
          docGenerator[methodName] = function(...args) {
            try {
              return originalMethod(...args);
            } catch (err) {
              const errStr = (err && (err.message || err.toString())) || '';
              if (errStr.includes('Invalid image') || errStr.includes('Unknown image format') || errStr.includes('Images dictionary')) {
                console.warn('[pdfMake Shield] Recuperação automática acionada após erro de imagem:', errStr);
                try {
                  self.purgarImagens(docDefinition);
                  const fallbackDoc = originalCreatePdf(docDefinition, tableLayouts, fonts, vfs);
                  return fallbackDoc[methodName](...args);
                } catch (retryErr) {
                  console.error('[pdfMake Shield] Erro no retry do fallback:', retryErr);
                  throw retryErr;
                }
              }
              throw err;
            }
          };
        };

        ['download', 'open', 'print', 'getBlob', 'getBase64', 'getDataUrl'].forEach(wrapMethod);

        return docGenerator;
      };

      window.pdfMake._shieldInstalled = true;
    };

    hookPdfMake();
    let attempts = 0;
    const timer = setInterval(() => {
      attempts++;
      hookPdfMake();
      if ((window.pdfMake && window.pdfMake._shieldInstalled) || attempts > 25) {
        clearInterval(timer);
      }
    }, 250);
  },

  // Obter perfil buscando diretamente as chaves especificadas no localStorage
  obter() {
    try {
      const nome = localStorage.getItem('tecnico_nome') || '';
      const slogan = localStorage.getItem('tecnico_slogan') || '';
      const rawLogo =
        localStorage.getItem('user_logo') ||
        localStorage.getItem('company_logo_base64') ||
        localStorage.getItem('app_company_logo') ||
        localStorage.getItem('tecnico_logo');
      const telefone = localStorage.getItem('tecnico_telefone') || '';
      const email = localStorage.getItem('tecnico_email') || '';
      const nuit = localStorage.getItem('tecnico_nuit') || '';
      const cidade = localStorage.getItem('tecnico_cidade') || '';
      const endereco = localStorage.getItem('tecnico_endereco') || '';
      const certificacoes = localStorage.getItem('tecnico_certificacoes') || localStorage.getItem('tecnico_especialidades') || '';

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

      const logoValida = this.sanitizarLogo(rawLogo) || this.sanitizarLogo(legado.logoBase64) || null;

      return {
        nome: (nome && nome.trim()) ? nome.trim() : (legado.nome && !legado.nome.includes('TécnicaMZ') ? legado.nome.trim() : ''),
        slogan: (slogan && slogan.trim()) ? slogan.trim() : (legado.slogan ? legado.slogan.trim() : ''),
        logoBase64: logoValida,
        telefone: (telefone && telefone.trim()) ? telefone.trim() : (legado.telefone ? legado.telefone.trim() : ''),
        email: (email && email.trim()) ? email.trim() : (legado.email ? legado.email.trim() : ''),
        nuit: (nuit && nuit.trim()) ? nuit.trim() : (legado.nuit ? legado.nuit.trim() : ''),
        cidade: (cidade && cidade.trim()) ? cidade.trim() : (legado.cidade ? legado.cidade.trim() : ''),
        endereco: (endereco && endereco.trim()) ? endereco.trim() : (legado.endereco ? legado.endereco.trim() : ''),
        certificacoes: (certificacoes && certificacoes.trim()) ? certificacoes.trim() : (legado.certificacoes ? legado.certificacoes.trim() : (legado.especialidades ? legado.especialidades.trim() : '')),
        especialidades: (certificacoes && certificacoes.trim()) ? certificacoes.trim() : (legado.especialidades ? legado.especialidades.trim() : ''),
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
          try {
            localStorage.setItem('user_logo', novosDados.logoBase64);
            localStorage.setItem('company_logo_base64', novosDados.logoBase64);
            localStorage.setItem('app_company_logo', novosDados.logoBase64);
            localStorage.setItem('tecnico_logo', novosDados.logoBase64);
          } catch (qErr) {
            console.warn('[PerfilTecnico] Cota do localStorage atingida ao salvar logo:', qErr);
          }
        } else {
          try {
            localStorage.removeItem('user_logo');
            localStorage.removeItem('company_logo_base64');
            localStorage.removeItem('app_company_logo');
            localStorage.removeItem('tecnico_logo');
          } catch (qErr) {}
        }
      }
      if (novosDados.telefone !== undefined) localStorage.setItem('tecnico_telefone', novosDados.telefone);
      if (novosDados.email !== undefined) localStorage.setItem('tecnico_email', novosDados.email);
      if (novosDados.nuit !== undefined) localStorage.setItem('tecnico_nuit', novosDados.nuit);
      if (novosDados.cidade !== undefined) localStorage.setItem('tecnico_cidade', novosDados.cidade);
      if (novosDados.endereco !== undefined) localStorage.setItem('tecnico_endereco', novosDados.endereco);
      if (novosDados.certificacoes !== undefined) {
        localStorage.setItem('tecnico_certificacoes', novosDados.certificacoes);
        localStorage.setItem('tecnico_especialidades', novosDados.certificacoes);
      }
      if (novosDados.especialidades !== undefined && novosDados.certificacoes === undefined) {
        localStorage.setItem('tecnico_especialidades', novosDados.especialidades);
        localStorage.setItem('tecnico_certificacoes', novosDados.especialidades);
      }

      if (novosDados.pdfTemplate !== undefined) localStorage.setItem('tecnico_pdf_template', novosDados.pdfTemplate);
      if (novosDados.pdfOrientation !== undefined) localStorage.setItem('tecnico_pdf_orientation', novosDados.pdfOrientation);
      if (novosDados.pdfFontSize !== undefined) localStorage.setItem('tecnico_pdf_font_size', novosDados.pdfFontSize);
      if (novosDados.borderColor !== undefined) localStorage.setItem('tecnico_border_color', novosDados.borderColor);

      const atualizado = this.obter();
      // Atualiza também chave legada para retrocompatibilidade sem duplicar base64
      try {
        const legadoLight = { ...atualizado, logoBase64: null };
        localStorage.setItem('tecnicamz_pro_perfil_tecnico', JSON.stringify(legadoLight));
      } catch (e) {}

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

  // Converter imagem para Base64 (sempre em formato PNG compatível com pdfMake)
  converterLogoParaBase64(arquivo) {
    return new Promise((resolve, reject) => {
      if (!arquivo) return reject(new Error('Nenhum arquivo fornecido.'));
      if (!arquivo.type.startsWith('image/')) return reject(new Error('Selecione uma imagem válida (PNG ou JPG).'));
      
      const leitor = new FileReader();
      leitor.onload = () => {
        const rawUrl = leitor.result;
        if (typeof rawUrl !== 'string') return reject(new Error('Falha ao processar arquivo.'));
        
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            let w = img.width || 400;
            let h = img.height || 400;
            if (w > 900 || h > 900) {
              if (w >= h) {
                h = Math.round((h * 900) / w);
                w = 900;
              } else {
                w = Math.round((w * 900) / h);
                h = 900;
              }
            }
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.imageSmoothingEnabled = true;
              ctx.imageSmoothingQuality = 'high';
              ctx.drawImage(img, 0, 0, w, h);
              const pngData = canvas.toDataURL('image/png');
              return resolve(pngData);
            }
            resolve(rawUrl);
          } catch (e) {
            resolve(rawUrl);
          }
        };
        img.onerror = () => resolve(rawUrl);
        img.src = rawUrl;
      };
      leitor.onerror = (err) => reject(err);
      leitor.readAsDataURL(arquivo);
    });
  },

  // Constrói a distribuição em 2 blocos (esquerda e direita)
  // 100% dinâmico a partir das configurações do perfil do técnico (sem dados hardcoded)
  construirBlocoDuplo(p, t, corBorda, isLandscape, fsMult, isDark = false) {
    const primaryColor = t.primary || corBorda || '#0066FF';
    const strokeColor = corBorda || primaryColor;
    const secondaryColor = t.secondary || primaryColor;

    // 1. LOGOTIPO DO TÉCNICO (Extrema esquerda com verificação defensiva)
    const logoToRender = (p && p.logoBase64) ||
      (typeof localStorage !== 'undefined' ? (
        localStorage.getItem('user_logo') ||
        localStorage.getItem('company_logo_base64') ||
        localStorage.getItem('app_company_logo') ||
        localStorage.getItem('tecnico_logo')
      ) : null);
    const logoValida = this.isPdfMakeCompatibleImage(logoToRender);
    let colunaLogo = null;
    if (logoValida) {
      colunaLogo = {
        image: logoToRender,
        fit: isLandscape ? [90, 54] : [82, 50],
        alignment: 'left',
        margin: [0, 0, 12, 0]
      };
    } else if (p.nome && p.nome.trim()) {
      const iniciais = p.nome
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map(w => w[0].toUpperCase())
        .join('');
      if (iniciais) {
        colunaLogo = {
          table: {
            widths: [44],
            body: [[
              {
                text: `⚡ ${iniciais}`,
                fillColor: isDark ? '#1E293B' : primaryColor,
                color: isDark ? secondaryColor : '#FFFFFF',
                bold: true,
                fontSize: Math.round(10 * fsMult),
                alignment: 'center',
                margin: [0, 8, 0, 8]
              }
            ]]
          },
          layout: {
            hLineWidth: () => 1,
            vLineWidth: () => 1,
            hLineColor: () => strokeColor,
            vLineColor: () => strokeColor
          },
          alignment: 'left',
          margin: [0, 0, 12, 0]
        };
      }
    }

    // BLOCO DA ESQUERDA: [ LOGOTIPO ] + [ NOME DA EMPRESA/TÉCNICO ], [ SLOGAN/SUBTÍTULO ], [ CERTIFICAÇÕES/ESPECIALIDADES ]
    // Telefone, cidade e NUIT rigorosamente removidos da esquerda.
    // Exibir apenas os campos preenchidos, sem nenhum valor hardcoded.
    const stackEsquerda = [];
    if (p.nome && p.nome.trim()) {
      stackEsquerda.push({
        text: p.nome.trim().toUpperCase(),
        fontSize: Math.round(12.5 * fsMult),
        bold: true,
        color: isDark ? '#FFFFFF' : primaryColor,
        alignment: 'left'
      });
    }
    if (p.slogan && p.slogan.trim()) {
      stackEsquerda.push({
        text: p.slogan.trim(),
        fontSize: Math.round(8.5 * fsMult),
        italics: true,
        color: isDark ? secondaryColor : (t.secondary || '#475569'),
        alignment: 'left',
        margin: [0, 1, 0, 2]
      });
    }
    const certEsp = (p.certificacoes || p.especialidades || '').trim();
    if (certEsp) {
      stackEsquerda.push({
        text: certEsp,
        fontSize: Math.round(7.2 * fsMult),
        color: isDark ? '#94A3B8' : '#64748B',
        alignment: 'left',
        margin: [0, 1, 0, 0]
      });
    }

    const colunasEsquerda = [];
    if (colunaLogo) {
      colunasEsquerda.push({ width: 'auto', ...colunaLogo });
    }
    if (stackEsquerda.length > 0) {
      colunasEsquerda.push({ width: '*', stack: stackEsquerda });
    }

    // BLOCO DA DIREITA (Caixa de Contato & Informações Gerais):
    // Crie um retângulo posicionado na extrema direita do cabeçalho, alinhado rigorosamente com a borda direita da tabela.
    // Exibe dinamicamente:
    // * TEL / WhatsApp: {dadosDoTecnico.telefone}
    // * Cidade/Endereço: {dadosDoTecnico.cidade}
    // * NUIT / Registro: {dadosDoTecnico.nuit} (se preenchido)
    // * Email: {dadosDoTecnico.email} (se preenchido)
    const linhasContato = [];
    if (p.telefone && p.telefone.trim()) {
      linhasContato.push({
        text: [
          { text: 'TEL / WhatsApp: ', bold: true, fontSize: Math.round(7.2 * fsMult), color: isDark ? '#F1F5F9' : '#1E293B' },
          { text: p.telefone.trim(), fontSize: Math.round(7.2 * fsMult), color: isDark ? '#94A3B8' : '#334155' }
        ],
        alignment: 'left',
        margin: [0, 0.8, 0, 0.8]
      });
    }

    const localizacao = [p.endereco, p.cidade].filter(v => v && v.trim()).map(v => v.trim()).join(', ');
    if (localizacao) {
      linhasContato.push({
        text: [
          { text: 'Cidade / Endereço: ', bold: true, fontSize: Math.round(7.2 * fsMult), color: isDark ? '#F1F5F9' : '#1E293B' },
          { text: localizacao, fontSize: Math.round(7.2 * fsMult), color: isDark ? '#94A3B8' : '#475569' }
        ],
        alignment: 'left',
        margin: [0, 0.8, 0, 0.8]
      });
    }

    if (p.nuit && p.nuit.trim()) {
      linhasContato.push({
        text: [
          { text: 'NUIT / Registro: ', bold: true, fontSize: Math.round(7.2 * fsMult), color: isDark ? '#F1F5F9' : '#1E293B' },
          { text: p.nuit.trim(), fontSize: Math.round(7.2 * fsMult), color: isDark ? '#94A3B8' : '#475569' }
        ],
        alignment: 'left',
        margin: [0, 0.8, 0, 0.8]
      });
    }

    if (p.email && p.email.trim()) {
      linhasContato.push({
        text: [
          { text: 'Email: ', bold: true, fontSize: Math.round(7.2 * fsMult), color: isDark ? '#F1F5F9' : '#1E293B' },
          { text: p.email.trim(), fontSize: Math.round(7.2 * fsMult), color: isDark ? '#94A3B8' : '#475569' }
        ],
        alignment: 'left',
        margin: [0, 0.8, 0, 0.8]
      });
    }

    // ESTILIZAÇÃO E COR DINÂMICA DO RETÂNGULO:
    // Borda (strokeColor) e fundo suave com a cor primária / tema ativo
    const fundoSuave = isDark ? '#0F172A' : (t.lightBg || '#F8FAFC');

    let colunaDireita;
    if (linhasContato.length > 0) {
      colunaDireita = {
        width: isLandscape ? 230 : 185,
        table: {
          widths: ['*'],
          body: [[
            {
              fillColor: fundoSuave,
              stack: linhasContato,
              margin: [8, 5, 8, 5]
            }
          ]]
        },
        layout: {
          hLineWidth: () => 1,
          vLineWidth: () => 1,
          hLineColor: () => strokeColor,
          vLineColor: () => strokeColor
        },
        alignment: 'right'
      };
    } else {
      colunaDireita = {
        width: 'auto',
        text: ''
      };
    }

    return {
      columns: [
        {
          width: '*',
          columns: colunasEsquerda.length > 0 ? colunasEsquerda : [{ text: '', width: '*' }]
        },
        colunaDireita
      ],
      margin: [0, 0, 0, 6]
    };
  },

  // Gera o cabeçalho PDF 100% White-Label aplicando a estrutura visual de 2 blocos
  gerarCabecalhoPDF(tituloDocumento = 'DOCUMENTO TÉCNICO', subtitulo = '') {
    const p = this.obter();
    const tema = this.obterTema();
    const t = tema.template;
    const corBorda = tema.corBorda;
    const isLandscape = tema.isLandscape;
    const lineWidth = tema.contentWidth;
    const fsMult = tema.fontMultiplier;

    // ESTRUTURA 2: MODERNO DARK (Cabeçalho escuro com layout 2 blocos)
    if (t.id === 'modern_tech' || t.id === 'modern_dark') {
      return [
        {
          table: {
            widths: ['*'],
            body: [[
              {
                fillColor: '#0F172A',
                stack: [
                  this.construirBlocoDuplo(p, t, corBorda, isLandscape, fsMult, true)
                ],
                margin: [6, 6, 6, 6]
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

    // ESTRUTURA 3: MINIMALISTA VERDE (Linhas finas, foco em alinhamento horizontal limpo)
    if (t.id === 'minimalist_green') {
      return [
        this.construirBlocoDuplo(p, t, corBorda, isLandscape, fsMult, false),
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
            subtitulo ? {
              text: subtitulo,
              fontSize: Math.round(7.5 * fsMult),
              color: '#64748B',
              alignment: 'right',
              margin: [0, 2, 0, 0]
            } : { text: '', width: 'auto' }
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

    // ESTRUTURA 4: EXECUTIVO ELEGANTE
    if (t.id === 'executive_elegant') {
      return [
        this.construirBlocoDuplo(p, t, corBorda, isLandscape, fsMult, false),
        // Linha de acento executiva
        {
          canvas: [
            { type: 'line', x1: 0, y1: 0, x2: lineWidth, y2: 0, lineWidth: 2, lineColor: corBorda }
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

    // ESTRUTURA 5: PREMIUM DOURADO & GRAFITE (Luxo)
    if (t.id === 'premium_gold') {
      return [
        {
          table: {
            widths: ['*'],
            body: [[
              {
                fillColor: '#18181B',
                stack: [
                  this.construirBlocoDuplo(p, t, corBorda, isLandscape, fsMult, true)
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
        // Linha dourada decorativa
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

    // ESTRUTURA 6: INDUSTRIAL HIGH-CONTRAST
    if (t.id === 'industrial_orange' || t.id === 'industrial_contrast') {
      return [
        this.construirBlocoDuplo(p, t, corBorda, isLandscape, fsMult, false),
        // Linha divisória industrial
        {
          canvas: [
            { type: 'line', x1: 0, y1: 0, x2: lineWidth, y2: 0, lineWidth: 2.5, lineColor: '#F97316' }
          ],
          margin: [0, 0, 0, 6]
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

    // ESTRUTURA 7: CLEAN PADRÃO EDM
    if (t.id === 'clean_edm') {
      return [
        this.construirBlocoDuplo(p, t, corBorda, isLandscape, fsMult, false),
        // Linha divisória EDM
        {
          canvas: [
            { type: 'line', x1: 0, y1: 0, x2: lineWidth, y2: 0, lineWidth: 2, lineColor: '#0284C7' }
          ],
          margin: [0, 0, 0, 6]
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

    // ESTRUTURA 1 (Corporativo) e Padrão: Layout em 2 blocos
    return [
      this.construirBlocoDuplo(p, t, corBorda, isLandscape, fsMult, false),
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
  try {
    PerfilTecnico.instalarBlindagemPdfMake();
  } catch (e) {
    console.warn('[PerfilTecnico] Falha ao inicializar blindagem do pdfMake:', e);
  }
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PerfilTecnico;
}
