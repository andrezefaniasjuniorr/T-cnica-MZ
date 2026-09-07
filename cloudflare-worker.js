/**
 * ============================================================================
 * CLOUDFLARE WORKER / VERCEL EDGE FUNCTION: PROXY SARA IA (TÉCNICAMZ PRO)
 * ============================================================================
 * Intermediário seguro e de alta performance entre o PWA TécnicaMZ Pro
 * e a API do Google Gemini (gemini-2.5-flash).
 * 
 * Funcionalidades:
 * 1. Resolve 100% dos erros de CORS (Access-Control-Allow-Origin: *) em qualquer navegador.
 * 2. Oculta a GEMINI_API_KEY no servidor Edge (zero exposição no client/browser).
 * 3. Trata requisições preflight OPTIONS instantaneamente (status 204).
 * 4. Repassa o histórico contínuo (contents) e a system_instruction para a IA.
 * 
 * Configuração no Cloudflare Dashboard:
 * - Variável de Ambiente / Secret: GEMINI_API_KEY = "sua_chave_aqui"
 */

// Cabeçalhos CORS padrão para permitir acesso seguro de qualquer origem
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-goog-api-key",
  "Access-Control-Max-Age": "86400",
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 1. Resposta imediata para requisições de preflight (CORS OPTIONS)
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: CORS_HEADERS,
      });
    }

    // 2. Health check ou rota raiz para teste no navegador
    if (request.method === "GET" && (url.pathname === "/" || url.pathname === "/api/health")) {
      return new Response(
        JSON.stringify({
          status: "online",
          service: "Proxy Sara IA - TécnicaMZ Pro",
          model: "gemini-2.5-flash",
          timestamp: new Date().toISOString(),
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            ...CORS_HEADERS,
          },
        }
      );
    }

    // 3. Validação do endpoint e método
    // Aceita tanto '/api/sara' quanto a rota raiz do Worker '/'
    if (request.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Método não permitido. Utilize POST no endpoint /api/sara." }),
        {
          status: 405,
          headers: {
            "Content-Type": "application/json",
            ...CORS_HEADERS,
          },
        }
      );
    }

    try {
      // 4. Obtenção segura da chave de API
      const apiKey = env.GEMINI_API_KEY || (typeof process !== "undefined" ? process.env?.GEMINI_API_KEY : null);

      if (!apiKey) {
        return new Response(
          JSON.stringify({
            error: "Configuração pendente: variável de ambiente GEMINI_API_KEY não encontrada no Edge Worker.",
          }),
          {
            status: 500,
            headers: {
              "Content-Type": "application/json",
              ...CORS_HEADERS,
            },
          }
        );
      }

      // 5. Leitura do corpo da requisição enviada pelo PWA
      const clientBody = await request.json();

      // Suporta formato direto do Gemini ({ contents, system_instruction })
      // ou formato simplificado ({ message, history })
      let geminiPayload = {};

      if (clientBody.contents) {
        geminiPayload = {
          contents: clientBody.contents,
          system_instruction: clientBody.system_instruction || undefined,
          generationConfig: clientBody.generationConfig || {
            temperature: 0.6,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
        };
      } else if (clientBody.message) {
        const contents = [];
        if (Array.isArray(clientBody.history)) {
          for (const item of clientBody.history) {
            contents.push({
              role: item.sender === "user" || item.role === "user" ? "user" : "model",
              parts: [{ text: item.text || item.parts?.[0]?.text || "" }],
            });
          }
        }
        contents.push({
          role: "user",
          parts: [{ text: clientBody.message }],
        });

        geminiPayload = {
          contents,
          system_instruction: clientBody.system_instruction || {
            parts: [
              {
                text: "Olá, Eletro-Jr, Sou Sara a sua assistente virtual da TécnicaMZ Pro. Especialista em engenharia elétrica, dimensionamento residencial e industrial pelas normas da EDM (Electricidade de Moçambique), sistemas solares fotovoltaicos e refrigeração. Respondo com respostas técnicas diretas, precisas e em português claro.",
              },
            ],
          },
          generationConfig: {
            temperature: 0.6,
            maxOutputTokens: 2048,
          },
        };
      } else {
        return new Response(
          JSON.stringify({ error: "Corpo da requisição inválido. Envie 'contents' ou 'message'." }),
          {
            status: 400,
            headers: {
              "Content-Type": "application/json",
              ...CORS_HEADERS,
            },
          }
        );
      }

      // 6. Chamada segura para a API do Google Gemini (gemini-2.5-flash)
      const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

      const geminiResponse = await fetch(geminiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(geminiPayload),
      });

      const geminiData = await geminiResponse.json();

      // 7. Retorna a resposta ao PWA com os devidos cabeçalhos CORS
      return new Response(JSON.stringify(geminiData), {
        status: geminiResponse.status,
        headers: {
          "Content-Type": "application/json",
          ...CORS_HEADERS,
        },
      });
    } catch (err) {
      return new Response(
        JSON.stringify({
          error: "Erro no Proxy Serverless ao comunicar com a API do Gemini.",
          details: err?.message || String(err),
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            ...CORS_HEADERS,
          },
        }
      );
    }
  },
};
