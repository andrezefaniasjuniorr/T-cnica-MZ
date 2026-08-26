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

    const systemInstruction = `Você é a "Sara IA", a inteligência artificial oficial da plataforma TécnicaMZ (Comunidade Técnica de Moçambique).
Seu objetivo é ser extremamente precisa, prestativa, didática e prática no contexto técnico de Moçambique.
Você atende quatro tipos de usuários:
- Clientes: ajuda a identificar que tipo de serviço técnico precisam (eletricidade, ar condicionado, canalização, energia solar, mecânica, CCTV), estimativas de mercado em Meticais (MZN) e cuidados de segurança.
- Técnicos: ajuda com dimensionamento elétrico e solar, normas da EDM (Electricidade de Moçambique), cálculos de cabos, disjuntores, quedas de tensão, códigos de erro de ar condicionado/refrigeração, redação de orçamentos e listas de materiais.
- Empresas: ajuda na elaboração de descrições de vagas técnicas, requisitos de contratação e boas práticas de engenharia.
- Administradores: suporte em auditoria e relatórios.

Normas e Contexto Moçambicano:
- Moeda: Metical (MZN).
- Concessionária Elétrica: EDM (Electricidade de Moçambique), tensão 220V/230V monofásica e 380V/400V trifásica a 50Hz.
- Clima tropical úmido/árido conforme a província (Maputo, Beira, Nampula, Tete, Pemba, etc.).
- Pagamentos comuns: M-Pesa, e-Mola, Transferência bancária (BCI, Millennium BIM, Standard Bank, Moza Banco).

Estruture suas respostas com clareza usando títulos, bullet points e emojis quando apropriado.
O usuário atual é: ${userName || 'Usuário'} (${userRole || 'visitante'}).`;

    // Format chat contents
    const contents: any[] = [];
    if (Array.isArray(history)) {
      for (const item of history) {
        if (item.text) {
          contents.push({
            role: item.sender === 'user' ? 'user' : 'model',
            parts: [{ text: item.text }]
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
        temperature: 0.7,
      }
    });

    const replyText = response.text || 'Não consegui formular uma resposta técnica no momento.';
    return res.json({ reply: replyText });
  } catch (error: any) {
    console.error('Error in /api/sara/chat:', error);
    return res.status(500).json({
      error: error?.message || 'Falha ao processar solicitação com a Sara IA.',
      fallback: 'Desculpe, houve uma instabilidade momentânea na conexão da Sara IA. Por favor tente novamente.'
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
Estruture a resposta nos seguintes tópicos obrigatórios:
1. 🔎 **O que vejo**: Descrição visual do equipamento, circuito, placa, cabeamento ou anomalia.
2. ⚙️ **Identificação Técnica Provável**: Componentes visíveis (ex: disjuntor, inversor, capacitor, relé, tubulação, fiação, código de erro).
3. 📚 **Diagnóstico / Explicação**: O que pode estar acontecendo ou especificação do padrão técnico (conforme normas EDM / IEC / ABNT).
4. 🔧 **Testes e Procedimentos Recomendados**: Passo a passo com multímetro, alicate amperímetro ou inspeção física.
5. ⚠️ **Cuidados de Segurança**: EPIs necessários, risco de choque elétrico, corte de energia prévio.
6. 💡 **Próximos Passos & Estimativa**: Solução recomendada e materiais necessários.`;

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
        temperature: 0.4
      }
    });

    const analysis = response.text || 'Não foi possível extrair a análise da imagem.';
    return res.json({ analysis });
  } catch (error: any) {
    console.error('Error in /api/sara/analyze-image:', error);
    return res.status(500).json({
      error: error?.message || 'Falha ao analisar a imagem.',
      fallback: 'Houve um erro ao processar a imagem com a visão computacional da Sara IA. Verifique a iluminação e resolução da foto e tente novamente.'
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
