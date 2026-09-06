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
    logoBase64: null
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
        endereco: endereco || legado.endereco || this.dadosPadrao.endereco
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

  // Gera o cabeçalho PDF 100% White-Label (sem nenhuma menção ao app)
  gerarCabecalhoPDF(tituloDocumento = 'DOCUMENTO TÉCNICO', subtitulo = '') {
    const p = this.obter();

    // Coluna do Logotipo do Técnico
    let colunaLogo;
    if (p.logoBase64) {
      colunaLogo = {
        image: p.logoBase64,
        width: 60,
        height: 45,
        alignment: 'center',
        margin: [0, 0, 12, 0]
      };
    } else {
      // Monograma neutro e elegante baseado nas iniciais do profissional
      const iniciais = (p.nome || 'EP')
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map(w => w[0].toUpperCase())
        .join('');

      colunaLogo = {
        table: {
          widths: [50],
          body: [[
            {
              text: `⚡ ${iniciais}`,
              fillColor: '#0f172a',
              color: '#38bdf8',
              bold: true,
              fontSize: 11,
              alignment: 'center',
              margin: [0, 12, 0, 12]
            }
          ]]
        },
        layout: 'noBorders',
        margin: [0, 0, 12, 0]
      };
    }

    const colunaInfo = {
      stack: [
        { text: (p.nome || 'SERVIÇOS TÉCNICOS').toUpperCase(), fontSize: 12, bold: true, color: '#0f172a' },
        p.slogan ? { text: `"${p.slogan}"`, fontSize: 8, italics: true, color: '#0284c7', margin: [0, 1, 0, 3] } : {},
        {
          columns: [
            { text: `Tel: ${p.telefone || '---'}${p.email ? ' | ' + p.email : ''}`, fontSize: 7.5, color: '#475569' },
            { text: `${p.nuit ? 'NUIT: ' + p.nuit + ' | ' : ''}${p.cidade || 'Moçambique'}`, fontSize: 7.5, color: '#475569', alignment: 'right' }
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
      {
        canvas: [
          { type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1.5, lineColor: '#0284c7' }
        ],
        margin: [0, 0, 0, 8]
      },
      {
        table: {
          widths: ['*'],
          body: [[
            {
              stack: [
                { text: tituloDocumento.toUpperCase(), fontSize: 11, bold: true, color: '#ffffff', alignment: 'center' },
                subtitulo ? { text: subtitulo, fontSize: 7.5, color: '#bae6fd', alignment: 'center', margin: [0, 1, 0, 0] } : {}
              ],
              fillColor: '#0f172a',
              margin: [0, 3, 0, 3]
            }
          ]]
        },
        layout: 'noBorders',
        margin: [0, 0, 0, 10]
      }
    ];
  }
};

if (typeof window !== 'undefined') {
  window.PerfilTecnico = PerfilTecnico;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PerfilTecnico;
}
