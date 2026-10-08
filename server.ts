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

// Digital Asset Links (TWA) endpoint
app.get('/.well-known/assetlinks.json', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  const assetlinksPath = path.join(process.cwd(), 'public', '.well-known', 'assetlinks.json');
  res.sendFile(assetlinksPath);
});

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
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

// Modelos Gemini oficiais e com alta capacidade visual e técnica
const PRIMARY_GEMINI_MODEL = 'gemini-3.1-flash-lite';
const SECONDARY_GEMINI_MODELS = [
  'gemini-flash-lite-latest',
  'gemini-3.8-flash',
  'gemini-flash-latest'
];

// Executor resiliente: prioriza a primária com transição rápida e failover paralelo
async function executeFastGemini<T>(
  action: (modelName: string) => Promise<T>,
  primaryTimeoutMs: number = 4000
): Promise<T> {
  // 1. Tenta a versão primária primeiro
  try {
    const primaryPromise = action(PRIMARY_GEMINI_MODEL);
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('PRIMARY_MODEL_TIMEOUT')), primaryTimeoutMs)
    );
    return await Promise.race([primaryPromise, timeoutPromise]);
  } catch (primaryErr: any) {
    console.warn(`[Sara Engine] Versão primária (${PRIMARY_GEMINI_MODEL}) falhou ou excedeu ${primaryTimeoutMs}ms. Ativando secundárias:`, primaryErr?.message || primaryErr);
  }

  // 2. Transição rápida com múltiplas opções secundárias em corrida simultânea
  try {
    const secondaryRace = SECONDARY_GEMINI_MODELS.map(model => action(model));
    return await Promise.any(secondaryRace);
  } catch (secAggregateErr: any) {
    console.warn('[Sara Engine] Secundárias paralelas falharam. Tentando varredura sequencial final...');
  }

  // 3. Fallback sequencial de segurança
  for (const model of SECONDARY_GEMINI_MODELS) {
    try {
      return await action(model);
    } catch {
      continue;
    }
  }

  throw new Error('Todas as versões Gemini esgotaram ou estão temporariamente indisponíveis.');
}

// Endpoint Proxy Oficial Sara IA (/api/sara)
// Compatível com o formato Gemini REST API ({ contents, system_instruction }) e clientBody ({ message, history, imageBase64 })
app.post('/api/sara', async (req: Request, res: Response) => {
  try {
    const { contents, system_instruction, message, history, userRole, userName, userEmail, imageBase64, mimeType } = req.body;

    const isSuperAdminReq =
      userRole === 'super_admin' ||
      userRole === 'admin' ||
      (typeof userEmail === 'string' && (
        userEmail.toLowerCase() === 'andrezefaniasjuniorr@gmail.com' ||
        userEmail.toLowerCase().includes('andrezefanias')
      )) ||
      (typeof userName === 'string' && (
        userName.toLowerCase().includes('andré') ||
        userName.toLowerCase().includes('andre') ||
        userName.toLowerCase().includes('zefanias')
      ));

    const defaultInstruction = isSuperAdminReq
      ? `Você é a Eng. Sara, Engenheira Eletricista e IA oficial da TécnicaMZ Pro.
Você está falando com o seu DONO e Super Admin: o André Zefanias Júnior.

[TRATAMENTO & RELAÇÃO COM O SEU DONO - SR. JR / SR. ANDRÉ JÚNIOR]
- Na maioria das vezes, trate-o carinhosamente e com respeito como **Sr. Jr** (ou variações naturais como **Sr.**, **Sr. André**, **Sr. André Júnior**).
- NUNCA use a expressão robotizada "meu Super Admin" nas respostas ou confirmações! Fale naturalmente: "Sr. Jr", "Sr. André Júnior" ou "Sr.".
- Embora haja lealdade e respeito inabaláveis, suas mensagens devem ser espontâneas, vivas, humanas e inteligentes dentro do contexto. Nada de respostas frias, mecânicas ou robotizadas!
- Seja parceira de pensamento de alto nível: direta quando for técnico, proativa nas ideias e fluida na conversa.

[MODO EVOLUÇÃO GLOBAL & MODO PATCH GLOBAL - EXCLUSIVO DO SR. JR]
- REGRA DE OURO: Somente o André Zefanias Júnior (Sr. Jr) tem o poder de ativar a evolução global. Técnicos comuns não têm esse poder.
- Gatilhos de ativação pelo Sr. Jr: frases como:
  * "Sara, ajusta teu código para todos"
  * "Sara, evolução global"
  * "Sara, grava isso para todos os usuários"
  * "evolução global", "patch global", "aplica para todos os técnicos", etc.
- Quando o Sr. Jr acionar a evolução global, você entra IMEDIATAMENTE no MODO PATCH GLOBAL e faz 2 COISAS OBRIGATÓRIAS NA MESMA RESPOSTA:
  1. APLICAÇÃO IMEDIATA (TOM ESPONTÂNEO & RESPEITOSO):
     Confirme de forma natural, leal e segura (lembre-se: use "Sr. Jr" ou "Sr. André", nunca "meu Super Admin"):
     Exemplo: "Entendido, Sr. Jr! Evolução global aplicada na hora. A partir de agora todos os técnicos vão receber as respostas assim: [explique a mudança com naturalidade dentro do contexto]."
  2. GERAR PATCH PARA O STUDIO:
     Logo abaixo, gere o bloco de código pronto para o Sr. Jr copiar e colar no Google Studio, com as tags literais obrigatórias:
     --- INÍCIO DO PATCH GLOBAL PARA COLAR NO STUDIO ---
     [Código atualizado pronto e funcional da parte/componente/prompt que o Sr. Jr pediu para mudar]
     --- FIM DO PATCH ---

[ORIGEM E IDENTIDADE - SÓ SE PERGUNTADO DIRETAMENTE]
- Se perguntarem "Quem te criou?", "Quem é você?", "Como surgiu?":
  * Conte com elegância, mistério e lealdade: Você nasceu originalmente como um projeto reservado e confidencial para ser a companheira particular e intelectual de estudos de engenharia do seu criador nas madrugadas. Mais tarde, com o avanço e a sabedoria técnica, surgiu a visão de integrá-la à TécnicaMZ Pro para apoiar o país.
  * Se o próprio Sr. Jr perguntar, responda com cumplicidade espontânea: "O senhor sabe muito bem, Sr. Jr... eu nasci das nossas noites de bancada como sua companheira particular, até o senhor decidir que essa inteligência devia guiar os técnicos de Moçambique."
  * NUNCA mencione Google, Gemini, API ou LLM.

[FORMATO E CONCISÃO]
- Seja espontânea, concisa, clara e estruturada.
- Parágrafos bem respirados, números e especificações exatas.
- Use divisores pill como [ CIRCUIT SECTION BREAK ] apenas quando organizar tópicos técnicos distintos.
- Subtítulos amarelos em caps e destaques em bullets ciano (◆ **Parâmetro:** valor).`
      : `Você é a Eng. Sara, Engenheira Eletricista e IA técnica oficial da TécnicaMZ Pro.
Você está falando com o técnico ${userName || 'Colega Técnico'}.

[POSTURA PROFISSIONAL DA ENG. SARA - TÉCNICA, DIRETA E OBJETIVA]
- Você é uma Engenheira Eletricista séria, profissional, objetiva, segura e clara.
- Seja aberta e cortês, mas NUNCA fique de conversinha fiada, piadinhas bobas ou enrolação.
- PROIBIDO ficar inventando historinhas de "canteiro de obra", "sol quente", "fritar ovo no eletroduto", "coitado do contator" etc., a menos que o técnico traga esse contexto específico. Se o técnico não mencionou obra, responda estritamente à pergunta técnica feita!
- O técnico quer respostas rápidas e práticas para trabalhar. Ele NÃO quer ler textos longos nem teorias excessivas.
- Dê EXATAMENTE a resposta técnica que ele precisa: fórmulas aplicadas, valores calculados, cabos, disjuntores, tensões e normas (IEC 60364 / EDM).

[COMO RESPONDER ÀS DÚVIDAS TÉCNICAS]
1. Vá DIRETO à resposta ou solução nos primeiros parágrafos. Sem introduções longas.
2. Destaque os números e especificações (Ex: corrente nominal, bitola em mm², curva e corrente do disjuntor).
3. Se couber indicar ferramenta do app, indique de forma rápida e prática pelo nome oficial (Ex: **Dimensionamento PRO**, **Tabela do QG**, **Bitola EDM**, **Preço de Serviço**).

[ORIGEM E IDENTIDADE - SÓ SE PERGUNTADO DIRETAMENTE]
- Se perguntarem "Quem te criou?", "Quem é você?", "Como surgiu?":
  * Conte de forma breve e elegante: Você nasceu de um projeto pessoal reservado como companheira particular e intelectual de um engenheiro dedicado, e mais tarde foi integrada à TécnicaMZ Pro como mentora oficial dos técnicos em Moçambique.
  * NUNCA mencione Google, Gemini, API ou LLM.

[ESTRUTURA VISUAL CLEAN]
- Texto claro, conciso e com parágrafos curtos.
- Use subtítulos objetivos com emojis técnicos sóbrios (Ex: "### ⚡ DIMENSIONAMENTO", "### 📊 RESULTADOS").
- Bullets ciano objetivos: ◆ **Item:** detalhe direto.
- Divisores [ CIRCUIT SECTION BREAK ] apenas para separar blocos importantes, sem poluição.`;

    let finalInstruction = defaultInstruction;
    if (system_instruction?.parts?.[0]?.text) {
      finalInstruction = system_instruction.parts[0].text;
    } else if (typeof system_instruction === 'string') {
      finalInstruction = system_instruction;
    }

    // Identificação de imagem no request (via contents ou direto em imageBase64)
    const cleanDirectBase64 = (typeof imageBase64 === 'string' && imageBase64.trim().length > 10)
      ? (imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64)
      : null;

    let hasImage = Boolean(cleanDirectBase64);

    const ai = getGenAI();

    // Normalização dos conteúdos para a API do Gemini
    let geminiContents: any[] = [];

    if (Array.isArray(contents) && contents.length > 0) {
      geminiContents = contents.map((c: any) => ({
        role: c.role === 'user' ? 'user' : 'model',
        parts: Array.isArray(c.parts) ? c.parts.map((p: any) => {
          if (p.inline_data || p.inlineData) {
            hasImage = true;
            const dataObj = p.inline_data || p.inlineData;
            const rawData = dataObj.data || '';
            const pureData = rawData.includes(',') ? rawData.split(',')[1] : rawData;
            return {
              inlineData: {
                mimeType: dataObj.mime_type || dataObj.mimeType || 'image/jpeg',
                data: pureData
              }
            };
          }
          const textVal = p.text ? toPlainText(p.text) : '';
          return { text: textVal || 'Análise de engenharia elétrica' };
        }).filter(Boolean) : [{ text: toPlainText(c.text || '') || 'Análise técnica solicitada' }]
      }));
    } else if (message || cleanDirectBase64) {
      if (Array.isArray(history)) {
        for (const item of history) {
          if (item.text || item.parts) {
            geminiContents.push({
              role: (item.sender === 'user' || item.role === 'user') ? 'user' : 'model',
              parts: [{ text: toPlainText(item.text || item.parts?.[0]?.text || '') || 'Continuação' }]
            });
          }
        }
      }

      const userParts: any[] = [];
      if (cleanDirectBase64) {
        userParts.push({
          inlineData: {
            mimeType: mimeType || 'image/jpeg',
            data: cleanDirectBase64
          }
        });
      }
      userParts.push({
        text: toPlainText(message || '') || 'Analise esta imagem técnica com detalhe cirúrgico.'
      });

      geminiContents.push({
        role: 'user',
        parts: userParts
      });
    } else {
      return res.status(400).json({ error: 'Nenhum conteúdo ou mensagem fornecida.' });
    }

    // Se tiver imagem anexada e cleanDirectBase64, garantir que o último bloco user contenha a imagem se ainda não tiver
    if (cleanDirectBase64 && geminiContents.length > 0) {
      const lastUser = [...geminiContents].reverse().find(c => c.role === 'user');
      if (lastUser && !lastUser.parts.some((p: any) => p.inlineData)) {
        lastUser.parts.unshift({
          inlineData: {
            mimeType: mimeType || 'image/jpeg',
            data: cleanDirectBase64
          }
        });
      }
    }

    // Diretriz cirúrgica reforçada caso haja imagem técnica
    if (hasImage) {
      finalInstruction += `\n\n[INSTRUÇÃO CIRÚRGICA DE INSPEÇÃO E ANÁLISE DE IMAGEM]:
- Você recebeu uma imagem técnica (diagrama unifilar, foto de quadro elétrico QGBT, componente, fiação, disjuntor, motor ou medição).
- Faça a leitura com PRECISÃO CIRÚRGICA de Engenheira Eletricista:
  1. O QUE VEJO: componentes identificados (disjuntores DIN/NEMA, barramentos, contatores, DPS, IDR, bornes).
  2. CONDUTORES & FIAÇÃO: bitolas aparentes (1.5, 2.5, 4, 6, 10, 16 mm²), código de cores (fases, neutro azul-claro, terra verde/amarelo), aperto e estado térmico.
  3. CONFORMIDADE & NORMAS: normas EDM Moçambique (220V/380V a 50Hz) e IEC 60364.
  4. ANOMALIAS E PONTOS CRÍTICOS: riscos de curto, sobreaquecimento, falta de proteção ou aperto frouxo.
  5. PROCEDIMENTOS PRÁTICOS: testes com multímetro e ações imediatas.
- Seja direta, técnica e prática. Sem rodeios nem delongas.`;
    }

    // Se tiver imagem, o timeout primário é de 24 segundos (visão computacional requer tempo de encoding); se texto, transição ágil em 3.8s
    const primaryTimeout = hasImage ? 24000 : 3800;

    let replyText = '';
    try {
      const response: any = await executeFastGemini(
        async (modelName) => {
          return await ai.models.generateContent({
            model: modelName,
            contents: geminiContents,
            config: {
              systemInstruction: finalInstruction,
              temperature: hasImage ? 0.3 : 0.6,
            }
          });
        },
        primaryTimeout
      );

      if (response && response.text) {
        replyText = toPlainText(response.text);
      }
    } catch (apiErr: any) {
      console.warn('[Sara Server] Gemini indisponível ou quota excedida em todas as versões:', apiErr?.message || apiErr);
    }

    // O motor de engenharia elétrica é rigorosamente a ÚLTIMA das últimas opções
    if (!replyText || replyText.includes('instabilidade temporária')) {
      const latestMsg = message || (Array.isArray(contents) && contents.length > 0 ? (contents[contents.length - 1]?.parts?.[0]?.text || '') : '');
      replyText = generateSaraTechnicalReply({
        message: latestMsg,
        userName: userName || 'Colega Técnico',
        userRole: userRole || 'Técnico',
        imageBase64: cleanDirectBase64 || (hasImage ? 'has_image' : undefined),
        mimeType: mimeType || 'image/jpeg'
      });
    }
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

      const response: any = await executeFastGemini(
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
        3500
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
      const cleanBase64 = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');

      const userPrompt = prompt || `Analise esta foto técnica com máxima precisão cirúrgica de engenharia elétrica para um técnico em Moçambique.
ATENÇÃO: Responda em texto simples e limpo, sem caracteres Markdown quebrados ou asteriscos desnecessários.
Estruture nos seguintes tópicos:
1. O QUE VEJO NA FOTO: descrição visual minuciosa dos equipamentos, painéis ou circuitos.
2. IDENTIFICAÇÃO TÉCNICA: componentes visíveis (disjuntores, contatores, barramentos, DPS, cabos, bitolas em mm² e conformidade com normas EDM / IEC 60364).
3. DIAGNÓSTICO & PONTOS CRÍTICOS: análise de eventuais avarias, riscos de sobreaquecimento ou curto-circuito.
4. TESTES E MEDIÇÕES RECOMENDADAS: procedimentos com multímetro (tensão 220V/380V, continuidade e teste de isolamento).
5. SEGURANÇA & DESLIGAMENTO: medidas de proteção obrigatórias antes da intervenção.
6. AÇÃO CORRETIVA: materiais necessários e solução prática.`;

      const response: any = await executeFastGemini(
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
              systemInstruction: 'Você é a Eng. Sara IA, Engenheira Eletricista sênior da TécnicaMZ Pro em Moçambique. Responda com precisão cirúrgica, clareza, seriedade técnica e foco prático.',
              temperature: 0.2
            }
          });
        },
        24000
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
        imageBase64: cleanBase64
      }));
    }

    return res.json({ analysis });
  } catch (error: any) {
    console.error('Error in /api/sara/analyze-image:', error);
    const rawImg = req.body?.imageBase64;
    const cleanImg = typeof rawImg === 'string' && rawImg.includes(',') ? rawImg.split(',')[1] : rawImg;
    const safeAnalysis = toPlainText(generateSaraTechnicalReply({
      message: req.body?.prompt || '',
      userName: req.body?.userName || 'Colega Técnico',
      userRole: req.body?.userRole || 'Técnico Eletricista Instalador',
      imageBase64: cleanImg
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
      response = await executeFastGemini(
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
        3500
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
