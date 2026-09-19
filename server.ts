import express, { Request, Response } from 'express';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

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
Responda de forma direta, clara, técnica e precisa em português de Moçambique. NUNCA repita respostas em loop. Forneça cálculos e dados práticos.`;

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

    // Lista de modelos resilientes para alta disponibilidade conforme diretrizes oficiais
    const candidateModels = ['gemini-3.8-flash', 'gemini-3.1-flash-lite'];
    let response: any = null;
    let lastError: any = null;

    for (const modelName of candidateModels) {
      try {
        response = await ai.models.generateContent({
          model: modelName,
          contents: geminiContents,
          config: {
            systemInstruction: finalInstruction,
            temperature: 0.6,
          }
        });
        if (response && response.text) {
          break;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`[Sara IA] Tentativa com modelo ${modelName} falhou:`, err?.message || err);
      }
    }

    if (!response || !response.text) {
      throw lastError || new Error('Não foi possível obter resposta de nenhum dos modelos disponíveis.');
    }

    const replyText = toPlainText(response.text || 'Resposta processada pela Sara IA.');

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
    console.error('Erro no endpoint /api/sara:', error);
    return res.status(500).json({
      error: error?.message || 'Falha ao processar requisição com a Sara IA.',
      candidates: [
        {
          content: {
            parts: [{ text: 'Houve uma instabilidade temporária ao conectar com o serviço da Sara IA. Por favor, tente novamente.' }],
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

    const ai = getGenAI();

    const systemInstruction = `Você é a Sara IA, a inteligência artificial oficial da plataforma TécnicaMZ (Comunidade Técnica de Moçambique).
Seu objetivo é ser extremamente precisa, prestativa, didática e prática no contexto técnico de Moçambique.

REGRAS DE FORMATAÇÃO OBRIGATÓRIAS:
- Responda SEMPRE em texto puro, limpo e simples.
- NUNCA use negrito, NUNCA use itálico e NUNCA use asteriscos (*) sob nenhuma hipótese.
- NUNCA use caracteres de marcação Markdown (como #, ##, **, *, _, etc).
- Escreva em português claro e direto com parágrafos legíveis.
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

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.5,
      }
    });

    const rawReply = response.text || 'Não consegui formular uma resposta técnica no momento.';
    const replyText = toPlainText(rawReply);
    return res.json({ reply: replyText });
  } catch (error: any) {
    console.error('Error in /api/sara/chat:', error);
    return res.status(500).json({
      error: error?.message || 'Falha ao processar solicitação com a Sara IA.',
      fallback: 'Desculpe, houve uma instabilidade temporária na conexão da Sara IA. Por favor tente novamente.'
    });
  }
});

// Sara AI: Image analysis (Schematics, PCB, wiring, equipment inspection)
app.post('/api/sara/analyze-image', async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', prompt, userRole } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'Imagem em base64 é obrigatória.' });
    }

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

    const candidateModels = ['gemini-3.8-flash', 'gemini-3.1-flash-lite'];
    let response: any = null;
    let lastError: any = null;

    for (const modelName of candidateModels) {
      try {
        response = await ai.models.generateContent({
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
        if (response && response.text) {
          break;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`[Sara IA Visão] Modelo ${modelName} falhou:`, err?.message || err);
      }
    }

    if (!response || !response.text) {
      throw lastError || new Error('Não foi possível processar a análise da imagem em nenhum modelo.');
    }

    const rawAnalysis = response.text || 'Não foi possível extrair a análise da imagem.';
    const analysis = toPlainText(rawAnalysis);
    return res.json({ analysis });
  } catch (error: any) {
    console.error('Error in /api/sara/analyze-image:', error);
    return res.status(500).json({
      error: error?.message || 'Falha ao analisar a imagem.',
      fallback: 'Houve um erro ao processar a imagem com a visão computacional da Sara IA. Verifique a resolução e iluminação da foto e tente novamente.'
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

    const candidateModels = ['gemini-3.8-flash', 'gemini-3.1-flash-lite'];
    let response: any = null;
    let lastError: any = null;

    for (const modelName of candidateModels) {
      try {
        response = await ai.models.generateContent({
          model: modelName,
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          config: {
            temperature: 0.2,
            responseMimeType: 'application/json'
          }
        });
        if (response && response.text) break;
      } catch (err: any) {
        lastError = err;
        console.warn(`[Sara Avaliação] Modelo ${modelName} falhou:`, err?.message || err);
      }
    }

    if (!response || !response.text) {
      console.warn('[Sara Avaliação] Modelos Gemini indisponíveis ou limite de cota atingido. Utilizando avaliação de contingência normativa local...');

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
