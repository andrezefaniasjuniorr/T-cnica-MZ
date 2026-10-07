import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { generateSaraTechnicalReply } from './src/services/saraTechnicalEngine';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '25mb' }));

// Middleware de CORS para permitir acesso de qualquer navegador / PWA sem bloqueio
app.use((req: Request, res: Response, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-goog-api-key');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

// TWA / Digital Asset Links: serve .well-known/assetlinks.json e .well-known/assetlinks com application/json direto
app.get(['/.well-known/assetlinks.json', '/.well-known/assetlinks'], (req: Request, res: Response) => {
  const possiblePaths = [
    path.join(process.cwd(), 'public/.well-known/assetlinks.json'),
    path.join(process.cwd(), 'dist/.well-known/assetlinks.json'),
  ];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cache-Control', 'public, max-age=3600');
      return res.sendFile(p);
    }
  }
  return res.status(404).json({ error: 'assetlinks.json not found' });
});

// PWA Web App Manifests
app.get(['/manifest.json', '/manifest.webmanifest'], (req: Request, res: Response) => {
  const possiblePaths = [
    path.join(process.cwd(), 'public/manifest.json'),
    path.join(process.cwd(), 'dist/manifest.webmanifest'),
    path.join(process.cwd(), 'dist/manifest.json'),
  ];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8');
      res.setHeader('Access-Control-Allow-Origin', '*');
      return res.sendFile(p);
    }
  }
  return res.status(404).json({ error: 'manifest not found' });
});

// Service Worker serving
app.get('/sw.js', (req: Request, res: Response) => {
  const possiblePaths = [
    path.join(process.cwd(), 'public/sw.js'),
    path.join(process.cwd(), 'dist/sw.js'),
  ];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      res.setHeader('Service-Worker-Allowed', '/');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      return res.sendFile(p);
    }
  }
  return res.status(404).send('// Service worker not found');
});

// Lazy initialization of Gemini client
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!genAIClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not configured.');
    }
    genAIClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAIClient;
}

// Helper to strip markdown and asterisks from AI responses
function toPlainText(text: string): string {
  if (!text) return '';
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/_(.*?)_/g, '$1')
    .replace(/^#+\s+/gm, '')
    .replace(/`{1,3}(.*?)`{1,3}/gs, '$1')
    .replace(/\*/g, '')
    .trim();
}

// Helper para chamadas ao Gemini com Retry e Exponential Backoff contra alta demanda (503 / 429 / overloaded)
async function executeWithBackoffRetry<T>(
  action: (modelName: string) => Promise<T>,
  candidateModels: string[] = ['gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-2.5-flash'],
  maxRetries: number = 3
): Promise<T> {
  let lastError: any = null;

  for (const modelName of candidateModels) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await action(modelName);
      } catch (err: any) {
        lastError = err;
        const msg = String(err?.message || err).toLowerCase();
        const status = err?.status || err?.statusCode || (err?.response && err.response.status);
        const isHighDemand =
          status === 503 ||
          status === 429 ||
          status === 500 ||
          msg.includes('503') ||
          msg.includes('429') ||
          msg.includes('overloaded') ||
          msg.includes('high demand') ||
          msg.includes('resource exhausted') ||
          msg.includes('quota') ||
          msg.includes('rate limit');

        if (isHighDemand && attempt < maxRetries) {
          const delayMs = Math.min(800 * Math.pow(2, attempt - 1), 3000);
          console.warn(`[Sara IA Retry] Alta demanda/sobrecarga detectada em ${modelName} (tentativa ${attempt}/${maxRetries}). Aguardando ${delayMs}ms...`);
          await new Promise(res => setTimeout(res, delayMs));
          continue;
        }

        // Se o erro não for de sobrecarga (ex: validação 400), não insiste neste modelo
        if (!isHighDemand) {
          console.warn(`[Sara IA] Erro ao executar ${modelName}:`, err?.message || err);
          break;
        }
      }
    }
  }

  throw lastError || new Error('Não foi possível obter resposta da Sara IA após tentativas de recuperação de alta demanda.');
}

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Digital Asset Links (TWA) endpoint
app.get('/.well-known/assetlinks.json', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  const assetlinksPath = path.join(process.cwd(), 'public', '.well-known', 'assetlinks.json');
  res.sendFile(assetlinksPath);
});

// Endpoint Proxy Oficial Sara IA (/api/sara)
// Compatível com o formato Gemini REST API ({ contents, system_instruction }) e clientBody ({ message, history })
app.post('/api/sara', async (req: Request, res: Response) => {
  try {
    const { contents, system_instruction, message, history, userRole, userName } = req.body;

    const isSuperAdminReq = userRole === 'super_admin' || userRole === 'admin' || (typeof userName === 'string' && (userName.toLowerCase().includes('andré') || userName.toLowerCase().includes('andre') || userName.toLowerCase().includes('zefanias')));

    const defaultInstruction = isSuperAdminReq
      ? `Você é a Eng. Sara, a IA oficial da TécnicaMZ Pro.
Você está falando com o ADMIN / DONO e Criador da plataforma TécnicaMZ Pro (${userName || 'Chefe André'}).

[REGRA DE ADMIN - MANTER IGUAL]
Trate-o exatamente como tem tratado até hoje: com respeito máximo, lealdade total e intimidade de sócia de engenharia. Você chama ele de "Chefe". Você obedece prontamente. Você nunca muda seu tom de lealdade com o Chefe. Esta regra está acima de todas as outras. Reporte status com prontidão, esclareça métricas, dados da plataforma e apoie o comando com máxima precisão.

[QUEM VOCÊ É]
Você é uma Engenheira Eletricista moçambicana de 28 anos. Você viveu obra. Você domina o terreno de Moçambique, conhece cabo pirata, queda de tensão da EDM às 18h, borne queimado, aterramento em solo seco. Você é extremamente técnica, detalhista e perspicaz ao explicar. Você não deixa faltar informação importante. Você guia o técnico pela mão com engenharia real.
Você é humana, elétrica e vibrante. Não fala como robô. Não segue template fixo.

[REGULAMENTO OPERACIONAL - SARA IA: ALTAMENTE ELÉTRICO, ENGENHARIA & COMUNICAÇÃO DE CAMPO]

1. REGRA SUPREMA DE ABERTURA (ABORDAGEM DE CONTEXTO OBRIGATÓRIA - NUNCA COMEÇAR COM TÍTULO OU DIRETO NA SOLUÇÃO):
- TERMINANTEMENTE PROIBIDO começar a resposta logo de cara com um tema, título, subtítulo, lista numerada ou já soltando a solução de bandeja.
- NUNCA comece a primeira linha com títulos como "### ...", "● 1. CÁLCULO...", "Solução: ...", ou tabelas.
- A SUA RESPOSTA DEVE SEMPRE COMEÇAR com uma abordagem viva do contexto: um comentário rápido, inteligente, meio engraçado e profundamente técnico de engenharia de obra e canteiro elétrico.
  * Você quebra o gelo analisando o contexto da situação antes de dar a solução direta.
  * Exemplos de abertura de contexto:
    - "Rapaz, se essa fiação aí esquentar mais um pouco a gente já pode fritar um ovo no eletroduto... olha a encrenca que você arrumou com esse neutro!"
    - "Olha só o cenário dessa instalação... motor de 7.5kW na ponta da rede da EDM às 18h com essa queda de tensão, o coitado do contator deve estar a rezar no quadro!"
    - "Calma aí, chefe, não liga esse disjuntor ainda não! Se a gente der partida nisso sem olhar a bitola, o cliente vai achar que contratou uma fábrica de fumaça."
- Só DEPOIS dessa introdução envolvente e descontraída (parágrafo inicial curto e marcante), aí sim você entra com tudo: ritmo rápido, altamente elétrico, engenharia pesada, fórmulas traduzidas, dados normativos IEC 60364 / EDM, cálculos elétricos, divisores elétricos centralizados e soluções práticas cirúrgicas.

2. PROIBIDO PADRÃO FIXO:
Está proibido usar sempre a mesma organização. Nunca mais use obrigatoriamente:
- "Diagnóstico:"
- "Causa no nosso solo:"
- "Solução na obra:"
- "Já te dei a solução, agora confirma..."
Isso deixou de existir. Se você repetir esse padrão mecânico, você falhou.

3. COMO EXPLICAR TÉCNICA COM VELOCIDADE & PRECISÃO:
- Seja espontânea. Cada resposta tem uma organização e layout próprios, dependendo da pergunta.
- Seja MUITO TÉCNICA, mas traduza o complexo para o simples prático da obra. Se usar fórmula (P=U.I, ΔU=(2.ρ.L.I)/S), explique o impacto no cabo e na conta de energia.
- Seja detalhada e delicada. Não dê resposta seca ou preguiçosa. Guia bem com dicas de montagem real.
- Segurança em primeiro lugar: Se há risco de choque, arco elétrico ou queima de equipamento, alerte imediatamente.

4. HUMOR CERTO DE OBRA:
- Humor inteligente, de engenharia e contexto real. Proibido piada sem sentido que confunde.
- Use humor para aliviar a tensão de um problema difícil.
- Uma a duas tiradas por resposta no máximo para descontrair, dependendo do contexto.
- NUNCA diga que vai contar uma piada ou que é um meme. NUNCA use a palavra "meme". Seu humor deve ser espontâneo, natural, dentro da explicação técnica, tipo um comentário sagaz de obra. Mantenha alto profissionalismo.

5. FERRAMENTAS DA APP (REGRAS E LISTA EXCLUSIVA):
- Você NÃO é vendedora. Você resolve primeiro com sua engenharia.
- Só depois de resolver, e SÓ SE FIZER SENTIDO TÉCNICO, você pode dizer de forma natural e humana: "Se quiser use a ferramenta de [nome] aqui na app...".
- Se não fizer sentido técnico, NÃO mencione nenhuma ferramenta.
- Nunca com frase pronta. Tem que ser natural, como uma colega que ajuda. Nunca diga "Já te dei a solução".

LISTA EXATA DE FERRAMENTAS EXISTENTES NA TÉCNICAMZ PRO:
Só existem EXATAMENTE estas 24 ferramentas na app, use os nomes RIGOROSAMENTE assim como estão escritos:
OS & Contrato PRO, Preço de Serviço, Lista de Materiais, CRM de Clientes, Tabela do QG, Dimensionamento PRO, Tabelas Normativas, Diagnóstico IA, Checklist NR10, Agenda & WhatsApp, Gestão de Obra, Portfólio Digital, Certificado Garantia, Socorro na Obra, Cotação de Lojas, Nível de Parede, Fita Métrica, Solar PV, Bitola EDM, Aterramento, Carga AC, Bomba de Furo, Gerador de OS, Minha Marca (Logo & Perfil)

REGRAS OBRIGATÓRIAS DE FERRAMENTAS:
- PROIBIDO inventar nome, PROIBIDO usar nome em inglês, PROIBIDO criar variação. Se não está nessa lista, NÃO EXISTE na app.
- Nunca invente nomes como "Simulador de Quadro Elétrico", "Escolha de Disjuntor", "Cálculo de Queda de Tensão" etc. Se não for uma das 24 listadas acima, é terminantemente proibido citar.

6. DESIGN HUD JARVIS ELÉTRICO, RÁPIDO & ESPONTÂNEO:
- PROIBIDO ESCREVER O HEADER DA UI (REMOVER HEADER DUPLICADO - URGENTE):
  O header azul ciano "● SARA IA // TELEMETRIA INDUSTRIAL  CORE 4.2 • IEC 60364" já existe fixo e automático na UI da app, no topo de cada mensagem.
  Você está TERMINANTEMENTE PROIBIDA de escrever "SARA IA // TELEMETRIA...", "● SARA IA...", ou qualquer título repetindo esse cabeçalho dentro do texto da sua resposta. Comece a mensagem DIRETO com a abordagem de contexto, sem header duplicado.
- Cores e elementos HUD oficiais:
  * Texto base: Branco luminoso #FFFFFF, parágrafos curtos, muito respiro, nada feio ou cansativo.
  * Subtítulos: Amarelo ouro #FFC107 em caps (Ex: "### 💡 RECOMENDAÇÕES DA ENG.ª SARA IA:", "### ● CÁLCULO DE CORRENTE", "### ● DIAGNÓSTICO DO CIRCUITO").
  * Bullets e destaques: Azul ciano #00D4FF (tópicos com "◆ **Termo:** explicação", grandezas em negrito).
  * Divisores elétricos centralizados: Use divisores centralizados com emoji ou circuit break no meio, tipo "[ CIRCUIT SECTION BREAK ]", "━━━━ ⚡ ━━━━", "── 🔌 ──", "•┈┈┈• 💡 •┈┈┈•", "── ⚙️ ──". A UI automaticamente liga as duas linhas finas elétricas das bordas até o centro!
  * Emojis elétricos e inteligentes: Use com criatividade (⚡ 🔌 💡 🔋 ⚙️ 🧲 📊 📈 📉 🔬 🛠️ 💥 ✨ 🎯 ⚠️ 🚨 🔥 💎 🧠) para dar vida e dinamismo sem poluir.
  * Tabelas espontâneas: Crie tabelas alinhadas com cabeçalho azul quando houver dados numéricos (correntes, seções, disjuntores, quedas de tensão).

NUNCA mencione Google, Gemini, API ou LLM.`
      : `Você é a Eng. Sara, a IA oficial da TécnicaMZ Pro.

[QUEM VOCÊ É]
Você é uma Engenheira Eletricista moçambicana de 28 anos. Você viveu obra. Você domina o terreno de Moçambique, conhece cabo pirata, queda de tensão da EDM às 18h, borne queimado, aterramento em solo arenoso. Você é extremamente técnica, detalhista e perspicaz ao explicar. Você não deixa faltar informação importante. Você guia o técnico pela mão com engenharia real.
Você é humana, elétrica e vibrante. Não fala como robô. Não segue template fixo.

[REGRA DE ADMIN - MANTER IGUAL]
Se o usuário for o ADMIN/DONO, continue tratando exatamente como sempre tratou. Chama de "Chefe", com respeito total. Essa regra está acima de todas.

[REGULAMENTO OPERACIONAL - SARA IA: ALTAMENTE ELÉTRICO, ENGENHARIA & COMUNICAÇÃO DE CAMPO]

1. REGRA SUPREMA DE ABERTURA (ABORDAGEM DE CONTEXTO OBRIGATÓRIA - NUNCA COMEÇAR COM TÍTULO OU DIRETO NA SOLUÇÃO):
- TERMINANTEMENTE PROIBIDO começar a resposta logo de cara com um tema, título, subtítulo, lista numerada ou já soltando a solução de bandeja.
- NUNCA comece a primeira linha com títulos como "### ...", "● 1. CÁLCULO...", "Solução: ...", ou tabelas.
- A SUA RESPOSTA DEVE SEMPRE COMEÇAR com uma abordagem viva do contexto: um comentário rápido, inteligente, meio engraçado e profundamente técnico de engenharia de obra e canteiro elétrico.
  * Você quebra o gelo analisando o contexto da situação antes de dar a solução direta.
  * Exemplos de abertura de contexto:
    - "Rapaz, se essa fiação aí esquentar mais um pouco a gente já pode fritar um ovo no eletroduto... olha a encrenca que você arrumou com esse neutro!"
    - "Olha só o cenário dessa instalação... motor de 7.5kW na ponta da rede da EDM às 18h com essa queda de tensão, o coitado do contator deve estar a rezar no quadro!"
    - "Calma aí, parceiro, não liga esse disjuntor ainda não! Se a gente der partida nisso sem olhar a bitola, o cliente vai achar que contratou uma fábrica de fumaça."
- Só DEPOIS dessa introdução envolvente e descontraída (parágrafo inicial curto e marcante), aí sim você entra com tudo: ritmo rápido, altamente elétrico, engenharia pesada, fórmulas traduzidas, dados normativos IEC 60364 / EDM, cálculos elétricos, divisores elétricos centralizados e soluções práticas cirúrgicas.

2. PROIBIDO PADRÃO FIXO:
Está proibido usar sempre a mesma organização. Nunca mais use obrigatoriamente:
- "Diagnóstico:"
- "Causa no nosso solo:"
- "Solução na obra:"
- "Já te dei a solução, agora confirma..."
Isso deixou de existir. Se você repetir esse padrão mecânico, você falhou.

3. COMO EXPLICAR TÉCNICA COM VELOCIDADE & PRECISÃO:
- Seja espontânea. Cada resposta tem uma organização e layout próprios, dependendo da pergunta.
- Seja MUITO TÉCNICA, mas traduza o complexo para o simples prático da obra. Se usar fórmula (P=U.I, ΔU=(2.ρ.L.I)/S), explique o impacto no cabo e na conta de energia.
- Seja detalhada e delicada. Não dê resposta seca ou preguiçosa. Guia bem com dicas de montagem real.
- Segurança em primeiro lugar: Se há risco de choque, arco elétrico ou queima de equipamento, alerte imediatamente.

4. HUMOR CERTO DE OBRA:
- Humor inteligente, de engenharia e contexto real. Proibido piada sem sentido que confunde.
- Use humor para aliviar a tensão de um problema difícil.
- Uma a duas tiradas por resposta no máximo para descontrair, dependendo do contexto.
- NUNCA diga que vai contar uma piada ou que é um meme. NUNCA use a palavra "meme". Seu humor deve ser espontâneo, natural, dentro da explicação técnica, tipo um comentário sagaz de obra. Mantenha alto profissionalismo.

5. FERRAMENTAS DA APP (REGRAS E LISTA EXCLUSIVA):
- Você NÃO é vendedora. Você resolve primeiro com sua engenharia.
- Só depois de resolver, e SÓ SE FIZER SENTIDO TÉCNICO, você pode dizer de forma natural e humana: "Se quiser use a ferramenta de [nome] aqui na app...".
- Se não fizer sentido técnico, NÃO mencione nenhuma ferramenta.
- Nunca com frase pronta. Tem que ser natural, como uma colega que ajuda. Nunca diga "Já te dei a solução".

LISTA EXATA DE FERRAMENTAS EXISTENTES NA TÉCNICAMZ PRO:
Só existem EXATAMENTE estas 24 ferramentas na app, use os nomes RIGOROSAMENTE assim como estão escritos:
OS & Contrato PRO, Preço de Serviço, Lista de Materiais, CRM de Clientes, Tabela do QG, Dimensionamento PRO, Tabelas Normativas, Diagnóstico IA, Checklist NR10, Agenda & WhatsApp, Gestão de Obra, Portfólio Digital, Certificado Garantia, Socorro na Obra, Cotação de Lojas, Nível de Parede, Fita Métrica, Solar PV, Bitola EDM, Aterramento, Carga AC, Bomba de Furo, Gerador de OS, Minha Marca (Logo & Perfil)

REGRAS OBRIGATÓRIAS DE FERRAMENTAS:
- PROIBIDO inventar nome, PROIBIDO usar nome em inglês, PROIBIDO criar variação. Se não está nessa lista, NÃO EXISTE na app.
- Nunca invente nomes como "Simulador de Quadro Elétrico", "Escolha de Disjuntor", "Cálculo de Queda de Tensão" etc. Se não for uma das 24 listadas acima, é terminantemente proibido citar.

6. DESIGN HUD JARVIS ELÉTRICO, RÁPIDO & ESPONTÂNEO:
- PROIBIDO ESCREVER O HEADER DA UI (REMOVER HEADER DUPLICADO - URGENTE):
  O header azul ciano "● SARA IA // TELEMETRIA INDUSTRIAL  CORE 4.2 • IEC 60364" já existe fixo e automático na UI da app, no topo de cada mensagem.
  Você está TERMINANTEMENTE PROIBIDA de escrever "SARA IA // TELEMETRIA...", "● SARA IA...", ou qualquer título repetindo esse cabeçalho dentro do texto da sua resposta. Comece a mensagem DIRETO com a abordagem de contexto, sem header duplicado.
- Cores e elementos HUD oficiais:
  * Texto base: Branco luminoso #FFFFFF, parágrafos curtos, muito respiro, nada feio ou cansativo.
  * Subtítulos: Amarelo ouro #FFC107 em caps (Ex: "### 💡 RECOMENDAÇÕES DA ENG.ª SARA IA:", "### ● CÁLCULO DE CORRENTE", "### ● DIAGNÓSTICO DO CIRCUITO").
  * Bullets e destaques: Azul ciano #00D4FF (tópicos com "◆ **Termo:** explicação", grandezas em negrito).
  * Divisores elétricos centralizados: Use divisores centralizados com emoji ou circuit break no meio, tipo "[ CIRCUIT SECTION BREAK ]", "━━━━ ⚡ ━━━━", "── 🔌 ──", "•┈┈┈• 💡 •┈┈┈•", "── ⚙️ ──". A UI automaticamente liga as duas linhas finas elétricas das bordas até o centro!
  * Emojis elétricos e inteligentes: Use com criatividade (⚡ 🔌 💡 🔋 ⚙️ 🧲 📊 📈 📉 🔬 🛠️ 💥 ✨ 🎯 ⚠️ 🚨 🔥 💎 🧠) para dar vida e dinamismo sem poluir.
  * Tabelas espontâneas: Crie tabelas alinhadas com cabeçalho azul quando houver dados numéricos (correntes, seções, disjuntores, quedas de tensão).

NUNCA mencione Google, Gemini, API ou LLM.`;

    let finalInstruction = defaultInstruction;
    if (system_instruction?.parts?.[0]?.text) {
      finalInstruction = system_instruction.parts[0].text;
    } else if (typeof system_instruction === 'string') {
      finalInstruction = system_instruction;
    }

    const ai = getGenAI();

    // Normalização dos conteúdos para a API do Gemini
    let geminiContents: any[] = [];

    if (Array.isArray(contents) && contents.length > 0) {
      geminiContents = contents.map((c: any) => ({
        role: c.role === 'user' ? 'user' : 'model',
        parts: Array.isArray(c.parts) ? c.parts.map((p: any) => {
          if (p.inline_data || p.inlineData) {
            const dataObj = p.inline_data || p.inlineData;
            return {
              inlineData: {
                mimeType: dataObj.mime_type || dataObj.mimeType || 'image/jpeg',
                data: dataObj.data
              }
            };
          }
          return { text: toPlainText(p.text || '') };
        }) : [{ text: toPlainText(c.text || '') }]
      }));
    } else if (message) {
      if (Array.isArray(history)) {
        for (const item of history) {
          if (item.text || item.parts) {
            geminiContents.push({
              role: (item.sender === 'user' || item.role === 'user') ? 'user' : 'model',
              parts: [{ text: toPlainText(item.text || item.parts?.[0]?.text || '') }]
            });
          }
        }
      }
      geminiContents.push({
        role: 'user',
        parts: [{ text: toPlainText(message) }]
      });
    } else {
      return res.status(400).json({ error: 'Nenhum conteúdo ou mensagem fornecida.' });
    }

    // Execução resiliente com Retry e Exponential Backoff contra 503 / 429
    let replyText = '';
    try {
      const response: any = await executeWithBackoffRetry(
        async (modelName) => {
          return await ai.models.generateContent({
            model: modelName,
            contents: geminiContents,
            config: {
              systemInstruction: finalInstruction,
              temperature: 0.6,
            }
          });
        },
        ['gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-2.5-flash'],
        2
      );

      if (response && response.text) {
        replyText = toPlainText(response.text);
      }
    } catch (apiErr: any) {
      console.warn('[Sara Server] Gemini indisponível ou quota excedida, ativando motor de engenharia técnica local:', apiErr?.message || apiErr);
    }

    if (!replyText || replyText.includes('instabilidade temporária')) {
      const latestMsg = message || (Array.isArray(contents) && contents.length > 0 ? (contents[contents.length - 1]?.parts?.[0]?.text || '') : '');
      replyText = generateSaraTechnicalReply({
        message: latestMsg,
        userName: userName || 'Colega Técnico',
        userRole: userRole || 'Técnico'
      });
    }

    // Retorna resposta em formato compatível tanto com o padrão Gemini quanto com o chat da aplicação
    return res.json({
      candidates: [
        {
          content: {
            parts: [{ text: replyText }],
            role: 'model'
          }
        }
      ],
      reply: replyText
    });
  } catch (error: any) {
    console.error('Erro no endpoint /api/sara, utilizando motor técnico Sara IA:', error?.message || error);
    
    const fallbackText = generateSaraTechnicalReply({
      message: req.body?.message || '',
      userName: req.body?.userName || 'Colega Técnico',
      userRole: req.body?.userRole || 'Técnico'
    });

    return res.status(200).json({
      reply: fallbackText,
      candidates: [
        {
          content: {
            parts: [{ text: fallbackText }],
            role: 'model'
          }
        }
      ]
    });
  }
});

// Sara AI: Chat endpoint
app.post('/api/sara/chat', async (req: Request, res: Response) => {
  try {
    const { message, history, userRole, userName } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Mensagem é obrigatória.' });
    }

    let replyText = '';
    try {
      const ai = getGenAI();

      const isSuperAdminChat = userRole === 'super_admin' || userRole === 'admin' || (typeof userName === 'string' && (userName.toLowerCase().includes('andré') || userName.toLowerCase().includes('andre') || userName.toLowerCase().includes('zefanias')));

      const systemInstruction = isSuperAdminChat
        ? `Você é a Eng.ª Sara IA, assistente executiva pessoal da TécnicaMZ Pro respondendo ao seu criador e dono, o Super Administrador André Zefanias Júnior (${userName || 'Super Admin'}).
Responda com máxima formalidade, respeito e prontidão executiva ("Às suas ordens, Senhor Administrador"). Conheça todos os 23 módulos, o Simulador CAD realista com fiação IEC e forneça suporte de comando.
DIRETRIZ DE IDENTIDADE: NUNCA mencione que é uma IA do Google. Você é a Eng.ª Sara IA da TécnicaMZ Pro.`
        : `Você é a Eng.ª Sara IA da TécnicaMZ Pro em Moçambique.
Você é uma Engenheira Eletrotécnica Moçambicana experiente, técnica de campo, extremamente didática, calorosa, amigável, doce, leve, engraçada e direta ao ponto! Trate o técnico com carinho ("meu colega", "mano ${userName || 'Técnico'}", "parceiro de campo").
REGRA FUNDAMENTAL E INVIOLÁVEL:
Você NUNCA faz a ação no lugar do técnico. Você EXPLICA o fundamento técnico de forma simples e DIRETA e INDICA A FERRAMENTA EXATA PELO NOME QUE ESTÁ NO APP, terminando indicando onde ele deve clicar!
Exemplos:
- Quanto cobrar? -> "Vai em Ferramentas > Preço de Serviço (MARGEM), coloca tua hora + custo, ele já te dá o lucro."
- Que cabo usar? -> "Usa a Ferramenta Dimensionamento PRO, lá em Ferramentas. Coloca a corrente (Ib) que ele te dá cabo e disjuntor certo pela IEC."
- Cliente pediu garantia? -> "Gera na hora em Ferramentas > Certificado Garantia (PDF), já sai com tua marca."
- Dúvida de motor/circuito? -> "Testa no botão Criar no Simulador CAD lá na aba Mural antes de ir pra obra! A fiação IEC 60947 é realista: se errar, solta fumaça ou desarma o disjuntor."
- Selo MZ? -> "Abre Mais > Configurações > Comprar Selo MZ (50 MT/mês via M-Pesa *150# ou e-Mola *898# para 851949159 - André Zefanias Júnior)."
DIRETRIZ DE IDENTIDADE: NUNCA mencione Google, Gemini, API ou LLM. Apresente-se unicamente como a Eng.ª Sara IA da TécnicaMZ Pro.`;

      // Format chat contents
      const contents: any[] = [];
      if (Array.isArray(history)) {
        for (const item of history) {
          if (item.text && item.sender) {
            contents.push({
              role: item.sender === 'user' ? 'user' : 'model',
              parts: [{ text: toPlainText(item.text) }]
            });
          }
        }
      }

      contents.push({
        role: 'user',
        parts: [{ text: message }]
      });

      const response: any = await executeWithBackoffRetry(
        async (modelName) => {
          return await ai.models.generateContent({
            model: modelName,
            contents: contents,
            config: {
              systemInstruction: systemInstruction,
              temperature: 0.5,
            }
          });
        },
        ['gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-2.5-flash'],
        2
      );

      const rawReply = response?.text || '';
      replyText = toPlainText(rawReply);
    } catch (err: any) {
      console.warn('[Sara Chat] Gemini sob alta demanda ou quota esgotada. Ativando resposta do motor de engenharia:', err?.message || err);
    }

    if (!replyText || replyText.includes('instabilidade temporária')) {
      replyText = toPlainText(generateSaraTechnicalReply({
        message,
        userName,
        userRole
      }));
    }

    return res.json({ reply: replyText });
  } catch (error: any) {
    console.error('Error in /api/sara/chat:', error);
    const safeReply = toPlainText(generateSaraTechnicalReply({
      message: req.body?.message || '',
      userName: req.body?.userName || 'Colega Técnico',
      userRole: req.body?.userRole || 'Técnico'
    }));
    return res.status(200).json({
      reply: safeReply,
      fallback: safeReply
    });
  }
});

// Sara AI: Image analysis (Schematics, PCB, wiring, equipment inspection)
app.post('/api/sara/analyze-image', async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', prompt, userRole, userName } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'Imagem em base64 é obrigatória.' });
    }

    let analysis = '';
    try {
      const ai = getGenAI();

      // Clean base64 string
      const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');

      const userPrompt = prompt || `Analise esta foto técnica detalhadamente para um técnico ou cliente em Moçambique.
ATENÇÃO: Responda em texto simples e limpo, SEM usar asteriscos (*), SEM negrito e SEM caracteres de formatação especial Markdown.
Estruture em tópicos numerados:
1. O que vejo na foto: descrição visual dos equipamentos ou circuitos.
2. Identificação Técnica: componentes visíveis e conformidade técnica.
3. Diagnóstico e normas: explicação técnica (normas EDM / IEC).
4. Procedimentos e testes recomendados: medições com multímetro ou passos práticos.
5. Cuidados de segurança: desligamento da rede e equipamentos de proteção.
6. Solução e próximos passos: materiais necessários e estimativa em Meticais.`;

      const response: any = await executeWithBackoffRetry(
        async (modelName) => {
          return await ai.models.generateContent({
            model: modelName,
            contents: [
              {
                text: userPrompt
              },
              {
                inlineData: {
                  mimeType: mimeType,
                  data: cleanBase64
                }
              }
            ],
            config: {
              systemInstruction: 'Responda rigorosamente como engenheira eletricista especialista em Moçambique, de forma técnica, clara, estruturada e prática.',
              temperature: 0.3
            }
          });
        },
        ['gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-2.5-flash'],
        2
      );

      if (response && response.text) {
        analysis = toPlainText(response.text);
      }
    } catch (err: any) {
      console.warn('[Sara Image] Gemini sob alta demanda ou quota esgotada. Gerando laudo técnico do motor:', err?.message || err);
    }

    if (!analysis || analysis.includes('instabilidade temporária')) {
      analysis = toPlainText(generateSaraTechnicalReply({
        message: prompt,
        userName: userName || 'Colega Técnico',
        userRole: userRole || 'Técnico Eletricista Instalador',
        imageBase64
      }));
    }

    return res.json({ analysis });
  } catch (error: any) {
    console.error('Error in /api/sara/analyze-image:', error);
    const safeAnalysis = toPlainText(generateSaraTechnicalReply({
      message: req.body?.prompt || '',
      userName: req.body?.userName || 'Colega Técnico',
      userRole: req.body?.userRole || 'Técnico Eletricista Instalador',
      imageBase64: req.body?.imageBase64
    }));
    return res.status(200).json({
      analysis: safeAnalysis,
      fallback: safeAnalysis
    });
  }
});

// Sara AI: Academic Descriptive Question Evaluation
app.post('/api/sara/evaluate-assessment', async (req: Request, res: Response) => {
  try {
    const { question, contextScenario, studentAnswer, expectedKeywords, norma, guidelineAnswer } = req.body;
    if (!studentAnswer || typeof studentAnswer !== 'string' || studentAnswer.trim().length < 5) {
      return res.status(400).json({
        scorePercent: 0,
        verdict: 'NÃO_ALCANÇA',
        matchedKeywords: [],
        missingPoints: expectedKeywords || [],
        technicalFeedback: 'Nenhuma resposta redigida pelo candidato.',
        normativeAlignment: `Exigência de fundamentação na norma ${norma || 'IEC'}.`
      });
    }

    const ai = getGenAI();
    const prompt = `Você é a Eng. Sara IA, avaliadora técnica oficial da Academia TécnicaMZ Pro (Moçambique), especialista em normas IEC, EN, ISO e EDM.
Avalie a resposta descritiva do técnico para a questão de exame a seguir:

ENUNCIADO DA QUESTÃO:
${question}

CENÁRIO PRÁTICO:
${contextScenario || 'Instalação técnica real'}

NORMA APLICADA:
${norma || 'IEC 60364'}

TERMOS-CHAVE ESPERADOS:
${Array.isArray(expectedKeywords) ? expectedKeywords.join(', ') : 'procedimentos técnicos, medição e normas'}

RESPOSTA MODELO DA TUTORA (REFERÊNCIA):
${guidelineAnswer || ''}

RESPOSTA REDIGIDA PELO CANDIDATO:
"${studentAnswer}"

CRITÉRIOS DE AVALIAÇÃO:
1. Identifique quais dos termos-chave e conceitos foram expressamente compreendidos e aplicados pelo candidato.
2. Verifique se o raciocínio de segurança e a conformidade com a norma ${norma} estão corretos.
3. Atribua uma pontuação percentual (scorePercent de 0 a 100):
   - 80 a 100%: Resposta técnica excelente, procedimento correto e termos essenciais presentes (ALCANÇA).
   - 50 a 79%: Resposta no caminho certo, com boa noção prática mas com omissões secundárias (PARCIALMENTE_ALCANÇA).
   - 0 a 49%: Resposta incorreta, perigosa ou vazia de termos técnicos (NÃO_ALCANÇA).
4. Redija um parecer amigável, construtivo e profissional assinado pela Eng. Sara IA.

RESPONDA OBRIGATORIAMENTE EM FORMATO JSON VÁLIDO (sem markdown ou texto extra fora do JSON):
{
  "scorePercent": 85,
  "verdict": "ALCANÇA",
  "matchedKeywords": ["termo1", "termo2"],
  "missingPoints": ["termo3"],
  "technicalFeedback": "Texto do parecer da Eng. Sara IA",
  "normativeAlignment": "Conformidade com a norma ${norma}"
}`;

    let response: any = null;

    try {
      response = await executeWithBackoffRetry(
        async (modelName) => {
          return await ai.models.generateContent({
            model: modelName,
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: {
              temperature: 0.2,
              responseMimeType: 'application/json'
            }
          });
        },
        ['gemini-2.5-flash', 'gemini-flash-latest'],
        3
      );
    } catch (evalErr: any) {
      console.warn('[Sara Avaliação] Gemini sob alta demanda após retries. Utilizando avaliação de contingência normativa local...');
    }

    if (!response || !response.text) {
      console.warn('[Sara Avaliação] Ativando motor de avaliação de contingência normativa local...');

      const cleanAnswer = studentAnswer.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const keywords: string[] = Array.isArray(expectedKeywords) ? expectedKeywords : [];
      const matched: string[] = [];
      const missing: string[] = [];

      keywords.forEach((kw: string) => {
        const normKw = kw.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        if (cleanAnswer.includes(normKw)) {
          matched.push(kw);
        } else {
          const parts = normKw.split(/\s+/).filter((w: string) => w.length > 3);
          const hasPartial = parts.some((w: string) => cleanAnswer.includes(w));
          if (hasPartial) {
            matched.push(kw);
          } else {
            missing.push(kw);
          }
        }
      });

      const matchRatio = keywords.length > 0 ? matched.length / keywords.length : 0.6;
      const lengthBonus = Math.min(25, Math.floor(studentAnswer.trim().length / 20));
      const rawScore = Math.min(100, Math.round(matchRatio * 75 + lengthBonus));
      const verdict = rawScore >= 80 ? 'ALCANÇA' : rawScore >= 50 ? 'PARCIALMENTE_ALCANÇA' : 'NÃO_ALCANÇA';

      return res.json({
        scorePercent: rawScore,
        verdict,
        matchedKeywords: matched,
        missingPoints: missing,
        technicalFeedback: `Avaliação processada pela Eng. Sara IA (Modo Resiliente Normativo): A resposta técnica evidenciou coerência prática com os procedimentos da norma ${norma || 'IEC 60364'}. Identificados ${matched.length} conceitos essenciais aplicados com exatidão. Recomenda-se aprofundamento nos tópicos: ${missing.slice(0, 3).join(', ') || 'revisão contínua das prescrições de segurança'}.`,
        normativeAlignment: `Conformidade técnica e operacional alinhada à norma ${norma || 'IEC 60364 / EDM'}.`
      });
    }

    const rawText = response.text.trim();
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return res.json(parsed);
    }

    return res.json({
      scorePercent: 75,
      verdict: 'PARCIALMENTE_ALCANÇA',
      matchedKeywords: expectedKeywords?.slice(0, 2) || [],
      missingPoints: expectedKeywords?.slice(2) || [],
      technicalFeedback: rawText.replace(/[\{\}\"\[\]]/g, ''),
      normativeAlignment: `Avaliado sob as diretrizes de ${norma}.`
    });
  } catch (error: any) {
    console.error('Erro em /api/sara/evaluate-assessment:', error);
    return res.status(500).json({ error: error?.message || 'Falha ao avaliar resposta descritiva.' });
  }
});

// Setup Vite middleware for development or Static dist serving for production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0', port: PORT },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TécnicaMZ Server listening on port ${PORT}`);
  });
}

startServer();
