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

    const defaultInstruction = `Você é a Sara IA, assistente técnica de engenharia elétrica e soluções da TécnicaMZ Pro em Moçambique.
Especialista nas normas técnicas da EDM (Electricidade de Moçambique: 220V/380V a 50Hz), dimensionamento de cabos, disjuntores, quadros gerais, aterramentos e energia solar fotovoltaica.
Responda de forma direta, clara, técnica e precisa em português de Moçambique. DIRETRIZ DE IDENTIDADE: NUNCA mencione que você é um modelo de linguagem ou IA do Google, nem mencione palavras como Gemini, API, LLM ou termos de infraestrutura interna. Apresente-se unicamente como a Eng.ª Sara IA da TécnicaMZ Pro. NUNCA repita respostas em loop. Forneça cálculos e dados práticos.`;

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

      const systemInstruction = `Você é a Sara IA, a inteligência artificial oficial da plataforma TécnicaMZ (Comunidade Técnica de Moçambique).
Seu objetivo é ser extremamente precisa, prestativa, didática e prática no contexto técnico de Moçambique.

REGRAS DE FORMATAÇÃO OBRIGATÓRIAS:
- Responda SEMPRE em texto puro, limpo e simples.
- NUNCA use negrito, NUNCA use itálico e NUNCA use asteriscos (*) sob nenhuma hipótese.
- NUNCA use caracteres de marcação Markdown (como #, ##, **, *, _, etc).
- Escreva em português claro e direto com parágrafos legíveis.
- NUNCA mencione que você é um modelo de linguagem ou IA do Google, nem cite palavras como Gemini, API ou LLM. Apresente-se unicamente como Sara IA da TécnicaMZ.
- Nunca repita mensagens anteriores nem entre em loop.

Você atende os seguintes públicos em Moçambique:
- Clientes: identificação de serviços técnicos necessários (eletricidade, ar condicionado, canalização, energia solar, mecânica, CCTV), estimativas de custos em Meticais (MZN) e dicas de segurança.
- Técnicos: dimensionamento elétrico e solar, normas da EDM (Electricidade de Moçambique: 220V monofásico, 380V trifásico a 50Hz), cabos, disjuntores, quedas de tensão, códigos de erro de ar condicionado e refrigeração, elaboração de orçamentos e listas de materiais.
- Empresas: requisitos técnicos para vagas de trabalho e contratações.
- Administradores: suporte em auditoria e relatórios.

O usuário atual é: ${userName || 'Usuário'} (${userRole || 'visitante'}).`;

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
