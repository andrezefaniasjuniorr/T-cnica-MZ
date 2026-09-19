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
 * 5. Sistema de Retry com Exponential Backoff para resiliência a alta demanda (503/429).
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

      // 6. Chamada segura para a API do Google Gemini com Retry e Exponential Backoff (gemini-2.5-flash)
      const candidateModels = ["gemini-2.5-flash", "gemini-flash-latest"];
      let geminiResponse = null;
      let geminiData = null;
      let lastError = null;

      for (const model of candidateModels) {
        const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        for (let attempt = 1; attempt <= 3; attempt++) {
          try {
            geminiResponse = await fetch(geminiEndpoint, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(geminiPayload),
            });

            // Se obteve sucesso (200 OK)
            if (geminiResponse.ok) {
              geminiData = await geminiResponse.json();
              break;
            }

            // Erros de alta demanda ou limite de requisições (503 / 429 / 500)
            if (geminiResponse.status === 503 || geminiResponse.status === 429 || geminiResponse.status === 500) {
              if (attempt < 3) {
                const backoffMs = Math.min(800 * Math.pow(2, attempt - 1), 3000);
                await new Promise((resolve) => setTimeout(resolve, backoffMs));
                continue;
              }
            }

            // Para outros erros (ex: 400), obtém a resposta e interrompe o loop do modelo atual
            geminiData = await geminiResponse.json();
            break;
          } catch (fetchErr) {
            lastError = fetchErr;
            if (attempt < 3) {
              await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
            }
          }
        }

        // Se conseguiu resposta com sucesso deste modelo, não tenta os modelos seguintes
        if (geminiResponse && geminiResponse.ok && geminiData) {
          break;
        }
      }

      // Caso persista sobrecarga ou erro após todas as tentativas
      if (!geminiData) {
        return new Response(
          JSON.stringify({
            candidates: [
              {
                content: {
                  parts: [
                    {
                      text: "Ocorreu uma instabilidade temporária de ligação à Eng.ª Sara IA. Por favor, tente novamente em instantes.",
                    },
                  ],
                  role: "model",
                },
              },
            ],
            reply: "Ocorreu uma instabilidade temporária de ligação à Eng.ª Sara IA. Por favor, tente novamente em instantes.",
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

      // 7. Retorna a resposta ao PWA com os devidos cabeçalhos CORS
      return new Response(JSON.stringify(geminiData), {
        status: geminiResponse ? geminiResponse.status : 200,
        headers: {
          "Content-Type": "application/json",
          ...CORS_HEADERS,
        },
      });
    } catch {
      return new Response(
        JSON.stringify({
          reply: "Ocorreu uma instabilidade temporária de ligação à Eng.ª Sara IA. Por favor, tente novamente em instantes.",
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: "Ocorreu uma instabilidade temporária de ligação à Eng.ª Sara IA. Por favor, tente novamente em instantes.",
                  },
                ],
                role: "model",
              },
            },
          ],
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
  },
};
