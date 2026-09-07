/**
 * ============================================================================
 * CHAT.JS - CLIENTE SARA IA (PWA TÉCNICAMZ PRO)
 * ============================================================================
 * Gerencia a conversação em tempo real com a Sara IA, mantendo o histórico
 * de mensagens contínuo na memória para eliminar respostas em loop e garantir
 * respostas contextualizadas via Proxy Serverless (sem erros de CORS).
 */

// 1. Histórico de memória contínuo da conversa
let historicoConversa = [];

// 2. System Instruction com a Persona Oficial da Sara IA
const SARA_SYSTEM_INSTRUCTION = {
  parts: [
    {
      text: `Olá, Eletro-Jr, Sou Sara a sua assistente virtual da TécnicaMZ Pro. Especialista em engenharia elétrica, dimensionamento residencial e industrial pelas normas da EDM (Electricidade de Moçambique: 220V monofásico e 380V trifásico a 50Hz), sistemas solares fotovoltaicos, refrigeração e códigos de erro de ar condicionado.

DIRETRIZES DA SUA RESPOSTA:
1. Responda com precisão técnica, de forma direta, prestativa e sem repetições.
2. NUNCA responda sempre a mesma frase fixa ou entre em loops de repetição.
3. Considere todo o histórico da conversa para responder contextualmente a cada dúvida do técnico ou cliente.
4. Forneça cálculos com valores numéricos reais, bitolas de cabos em mm², disjuntores em Amperes e valores em Meticais (MZN) quando aplicável.
5. Use formatação limpa e legível sem excesso de caracteres especiais.`
    }
  ]
};

// Endpoint padrão do Proxy (local /api/sara ou Cloudflare Worker remoto)
const PROXY_ENDPOINT = (typeof window !== 'undefined' && window.SARA_PROXY_URL) 
  ? window.SARA_PROXY_URL 
  : '/api/sara';

/**
 * Renderiza um balão de mensagem no container de chat
 * @param {string} texto - Conteúdo da mensagem
 * @param {'user'|'sara'} remetente - Quem enviou
 */
function renderizarBalaoChat(texto, remetente) {
  const container = document.getElementById('chat-mensagens') || document.getElementById('chatMessages') || document.querySelector('.chat-messages');
  if (!container) {
    console.log(`[Chat Sara IA] [${remetente.toUpperCase()}]: ${texto}`);
    return;
  }

  const msgDiv = document.createElement('div');
  msgDiv.className = `flex gap-2.5 my-2 ${remetente === 'user' ? 'justify-end' : 'justify-start'}`;

  const horaAtual = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (remetente === 'user') {
    msgDiv.innerHTML = `
      <div class="max-w-[85%] sm:max-w-[75%] bg-blue-600 text-white p-3 rounded-2xl rounded-tr-xs shadow-sm">
        <p class="text-xs sm:text-sm font-medium leading-relaxed whitespace-pre-wrap">${escapeHtml(texto)}</p>
        <span class="text-[10px] text-blue-200 block text-right mt-1">${horaAtual}</span>
      </div>
    `;
  } else {
    msgDiv.innerHTML = `
      <div class="max-w-[85%] sm:max-w-[75%] bg-slate-100 text-slate-800 p-3 rounded-2xl rounded-tl-xs border border-slate-200 shadow-sm">
        <div class="flex items-center gap-1.5 mb-1">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span class="text-[10px] font-black uppercase tracking-wider text-blue-700">Sara IA • TécnicaMZ</span>
        </div>
        <div class="text-xs sm:text-sm font-normal text-slate-800 leading-relaxed whitespace-pre-wrap">${formatarTextoResposta(texto)}</div>
        <span class="text-[10px] text-slate-400 block text-right mt-1">${horaAtual}</span>
      </div>
    `;
  }

  container.appendChild(msgDiv);
  container.scrollTop = container.scrollHeight;
}

/**
 * Exibe ou remove o indicador de digitação da Sara
 */
function alternarIndicadorDigitando(ativo) {
  const container = document.getElementById('chat-mensagens') || document.getElementById('chatMessages') || document.querySelector('.chat-messages');
  const indicadorId = 'sara-typing-indicator';
  let indicador = document.getElementById(indicadorId);

  if (ativo) {
    if (!indicador && container) {
      indicador = document.createElement('div');
      indicador.id = indicadorId;
      indicador.className = 'flex items-center gap-2 text-slate-500 text-xs py-2 px-3 bg-slate-50 rounded-xl w-fit border border-slate-200 my-1 animate-pulse';
      indicador.innerHTML = `
        <span class="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce"></span>
        <span class="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:0.2s]"></span>
        <span class="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:0.4s]"></span>
        <span class="text-[11px] font-semibold text-slate-600 ml-1">Sara IA calculando resposta técnica...</span>
      `;
      container.appendChild(indicador);
      container.scrollTop = container.scrollHeight;
    }
  } else {
    if (indicador) indicador.remove();
  }
}

/**
 * Função Principal: Envia mensagem para o Proxy Serverless e atualiza o histórico
 * @param {string} [textoManual] - Texto opcional (se não informado, busca do input #chat-input)
 */
async function enviarMensagemSaraIA(textoManual) {
  const inputElem = document.getElementById('chat-input') || document.getElementById('chatInput') || document.querySelector('input[name="chat-msg"]');
  const texto = (textoManual || (inputElem ? inputElem.value : '')).trim();

  if (!texto) return;

  // Limpa o input se houver
  if (inputElem && !textoManual) {
    inputElem.value = '';
  }

  // 1. Renderiza o balão do usuário imediatamente no chat
  renderizarBalaoChat(texto, 'user');

  // 2. Adiciona a nova mensagem ao histórico global contínuo (Memory History)
  historicoConversa.push({
    role: "user",
    parts: [{ text: texto }]
  });

  // Ativa indicador visual de carregamento
  alternarIndicadorDigitando(true);

  try {
    // 3. Monta o payload completo com a system_instruction e o histórico acumulado
    const payload = {
      system_instruction: SARA_SYSTEM_INSTRUCTION,
      contents: historicoConversa,
      generationConfig: {
        temperature: 0.6,
        topP: 0.95,
        maxOutputTokens: 2048
      }
    };

    // 4. Dispara a requisição para o Proxy Serverless (sem bloqueio de CORS)
    const response = await fetch(PROXY_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Erro HTTP ${response.status} ao conectar com o Proxy.`);
    }

    const data = await response.json();

    // 5. Extração da resposta dinâmica retornada pelo Gemini
    let respostaTexto = '';
    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
      respostaTexto = data.candidates[0].content.parts.map(p => p.text || '').join('').trim();
    } else if (data.reply) {
      respostaTexto = data.reply;
    } else if (data.text) {
      respostaTexto = data.text;
    } else {
      throw new Error('Formato de resposta inesperado do modelo Gemini.');
    }

    // 6. Adiciona a resposta da Sara ao histórico contínuo para manter o contexto nas próximas mensagens
    historicoConversa.push({
      role: "model",
      parts: [{ text: respostaTexto }]
    });

    // 7. Remove o indicador e renderiza a resposta ÚNICA e REAL no balão
    alternarIndicadorDigitando(false);
    renderizarBalaoChat(respostaTexto, 'sara');

    return respostaTexto;
  } catch (erro) {
    alternarIndicadorDigitando(false);
    console.error('[Sara IA] Falha na comunicação com o Proxy:', erro);

    const mensagemErro = `⚠️ Desculpe, não consegui obter a resposta no momento (${erro.message}). Por favor, verifique a sua conexão ou se a chave GEMINI_API_KEY está configurada no Proxy Serverless e tente novamente.`;
    
    renderizarBalaoChat(mensagemErro, 'sara');
    return null;
  }
}

/**
 * Limpa o histórico de conversa na memória
 */
function reiniciarConversaSaraIA() {
  historicoConversa = [];
  const container = document.getElementById('chat-mensagens') || document.getElementById('chatMessages');
  if (container) container.innerHTML = '';
  
  // Mensagem inicial de boas-vindas
  const boasVindas = 'Olá! Sou a Sara IA, a sua assistente de engenharia elétrica da TécnicaMZ Pro. Como posso ajudar com os seus dimensionamentos ou projetos hoje?';
  renderizarBalaoChat(boasVindas, 'sara');
}

/**
 * Auxiliares de formatação e segurança
 */
function escapeHtml(text) {
  if (!text) return '';
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return text.replace(/[&<>"']/g, m => map[m]);
}

function formatarTextoResposta(text) {
  if (!text) return '';
  return escapeHtml(text)
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br/>');
}

// Exporta globalmente para uso no PWA (Browser e Módulos)
if (typeof window !== 'undefined') {
  window.historicoConversa = historicoConversa;
  window.SARA_SYSTEM_INSTRUCTION = SARA_SYSTEM_INSTRUCTION;
  window.enviarMensagemSaraIA = enviarMensagemSaraIA;
  window.reiniciarConversaSaraIA = reiniciarConversaSaraIA;
  window.renderizarBalaoChat = renderizarBalaoChat;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    historicoConversa,
    SARA_SYSTEM_INSTRUCTION,
    enviarMensagemSaraIA,
    reiniciarConversaSaraIA,
    renderizarBalaoChat
  };
}
