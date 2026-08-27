import express, { Request, Response } from 'express';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '25mb' }));

// Lazy initialization of Gemini client
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!genAIClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not configured.');
    }
    genAIClient = new GoogleGenAI({ apiKey });
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
      model: 'gemini-3.6-flash',
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

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
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
        systemInstruction: 'Responda rigorosamente em texto puro e simples, sem asteriscos (*) e sem formatação Markdown.',
        temperature: 0.3
      }
    });

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
