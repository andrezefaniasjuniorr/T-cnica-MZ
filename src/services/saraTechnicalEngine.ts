/**
 * Motor de Inteligência Técnica e Contingência da Eng.ª Sara IA - TécnicaMZ Pro
 * 
 * Permite respostas técnicas ultrarrápidas, resilientes e fundamentadas nas normas
 * da EDM (Electricidade de Moçambique: 220V/380V 50Hz), IEC 60364, ABNT e boas práticas
 * de engenharia eletrotécnica, solar, climatização e orçamentação em Meticais (MZN).
 * 
 * Funciona de forma transparente tanto no servidor Node (server.ts) quanto no cliente
 * (SaraAiModal, KitProModals) mesmo fora do Google AI Studio, offline ou com quota esgotada.
 */

export interface SaraContextRequest {
  message?: string;
  history?: Array<{ sender?: string; role?: string; text: string }>;
  userName?: string;
  userRole?: string;
  activeAcademyContext?: {
    courseTitle?: string;
    moduleTitle?: string;
    lessonTitle?: string;
    lessonCode?: string;
    norma?: string;
    activeTopic?: string;
  } | null;
  imageBase64?: string;
  mimeType?: string;
}

export function generateSaraTechnicalReply(req: SaraContextRequest): string {
  const rawText = (req.message || '').trim();
  const userName = req.userName || 'Colega Técnico';
  const role = req.userRole || 'Técnico';
  const academy = req.activeAcademyContext;
  const lower = rawText.toLowerCase();

  // 1. ANÁLISE DE CONTEXTO SINCRONIZADO DA MINHA ACADEMIA TÉCNICA
  if (academy && (lower.includes('elemento:') || lower.includes('norma:') || lower.includes('aula') || lower.includes('modulo') || lower.includes('exercicio') || rawText.length < 5)) {
    return generateAcademyLessonResponse(userName, academy, rawText);
  }

  // 2. ANÁLISE DE IMAGEM TÉCNICA / LAUDO FOTOGRÁFICO
  if (req.imageBase64) {
    return generateImageInspectionReport(userName, role, rawText);
  }

  // 3. DIMENSIONAMENTO SOLAR FOTOVOLTAICO
  if (
    lower.includes('solar') ||
    lower.includes('fotovoltaic') ||
    lower.includes('painel') ||
    lower.includes('inversor') ||
    lower.includes('bateria') ||
    lower.includes('off-grid') ||
    lower.includes('on-grid') ||
    lower.includes('hsp') ||
    lower.includes('lifepo4')
  ) {
    return generateSolarSizingResponse(userName, rawText);
  }

  // 4. DIMENSIONAMENTO DE CABOS, DISJUNTORES, CARGAS E QUEDA DE TENSÃO
  if (
    lower.includes('disjuntor') ||
    lower.includes('cabo') ||
    lower.includes('bitola') ||
    lower.includes('chuveiro') ||
    lower.includes('seção') ||
    lower.includes('seccao') ||
    lower.includes('ampere') ||
    lower.includes('amperagem') ||
    lower.includes('queda de tensao') ||
    lower.includes('queda de tensão') ||
    lower.includes('quadro') ||
    lower.includes('qgbt') ||
    lower.includes('monofasico') ||
    lower.includes('monofásico') ||
    lower.includes('trifasico') ||
    lower.includes('trifásico') ||
    /\b\d+\s*(w|kw|kva|a|mm2|mm²)\b/i.test(rawText)
  ) {
    return generateElectricalSizingResponse(userName, rawText);
  }

  // 5. CLIMATIZAÇÃO, AR CONDICIONADO E REFRIGERAÇÃO
  if (
    lower.includes('ar condicionado') ||
    lower.includes('climatiza') ||
    lower.includes('btu') ||
    lower.includes('refrigera') ||
    lower.includes('inverter') ||
    lower.includes('split') ||
    lower.includes('r410') ||
    lower.includes('r32') ||
    lower.includes('r22') ||
    lower.includes('compressor') ||
    lower.includes('vácuo') ||
    lower.includes('vacuo') ||
    lower.includes('erro e') ||
    lower.includes('código de erro')
  ) {
    return generateHvacResponse(userName, rawText);
  }

  // 6. TABELA DE PREÇOS, MÃO DE OBRA E ORÇAMENTOS (MZN)
  if (
    lower.includes('preço') ||
    lower.includes('preco') ||
    lower.includes('custo') ||
    lower.includes('mão de obra') ||
    lower.includes('mao de obra') ||
    lower.includes('orçamento') ||
    lower.includes('orcamento') ||
    lower.includes('quanto cobrar') ||
    lower.includes('tabela') ||
    lower.includes('mzn') ||
    lower.includes('meticais')
  ) {
    return generatePricingResponse(userName, rawText);
  }

  // 7. NORMAS EDM, ATERRAMENTO, IDR E DPS
  if (
    lower.includes('edm') ||
    lower.includes('aterramento') ||
    lower.includes('terra') ||
    lower.includes('idr') ||
    lower.includes('diferencial') ||
    lower.includes('dps') ||
    lower.includes('surto') ||
    lower.includes('norma') ||
    lower.includes('neutro') ||
    lower.includes('telurometro') ||
    lower.includes('telurômetro')
  ) {
    return generateStandardsAndGroundingResponse(userName, rawText);
  }

  // 8. GERADORES, TRANSFORMADORES E GRUPOS GERADORES
  if (
    lower.includes('gerador') ||
    lower.includes('transformador') ||
    lower.includes('subestação') ||
    lower.includes('subestacao') ||
    lower.includes('fator de potencia') ||
    lower.includes('fator de potência') ||
    lower.includes('cos phi') ||
    lower.includes('ats') ||
    lower.includes('comutador')
  ) {
    return generateGeneratorsResponse(userName, rawText);
  }

  // 9. SAUDAÇÕES, APRESENTAÇÃO E DÚVIDAS GERAIS
  return generateGeneralConsultingResponse(userName, role, rawText);
}

// --------------------------------------------------------------------------------
// GERADORES ESPECIALIZADOS
// --------------------------------------------------------------------------------

function generateAcademyLessonResponse(userName: string, ctx: any, query: string): string {
  return `Olá, **${userName}**! Identifiquei a sua dúvida sincronizada diretamente com a **${ctx.courseTitle || 'Minha Academia Técnica'}**.

### ⚡ SARA IA | CONSULTORIA TÉCNICA NORMATIVA
* **Tópico / Aula Ativa:** \`${ctx.lessonTitle || 'Tópico de Estudo'}\` (${ctx.lessonCode || 'AULA-PRO'})
* **Norma Técnica de Referência:** **${ctx.norma || 'IEC 60364 / EDM'}**
* **Módulo:** ${ctx.moduleTitle || 'Módulo Especializado'}

---

#### 1. Princípio de Funcionamento & Requisitos Mandatórios
O elemento analisado nesta lição é fundamental para garantir a seletividade e segurança contra sobrecargas, contactos indiretos e falhas de isolamento na rede elétrica moçambicana (220V/380V a 50Hz).

| Parâmetro Técnico | Especificação Mandatória EDM/IEC | Critério de Aceitação em Moçambique |
| :--- | :--- | :--- |
| **Tensão Nominal ($U_n$)** | $220\\,\\text{V}$ (F+N) / $380\\,\\text{V}$ (3F) | Variação tolerada: $\\pm 10\\%$ ($198\\,\\text{V} - 242\\,\\text{V}$) |
| **Frequência da Rede** | $50\\,\\text{Hz} \\pm 1\\%$ | Estabilidade EDM |
| **Resistência de Isolamento** | $\\ge 1.0\\,\\text{M}\\Omega$ ($500\\,\\text{V}$ CC Megger) | Obrigatório antes de qualquer energização |
| **Sensibilidade Diferencial** | $I_{\\Delta n} \\le 30\\,\\text{mA}$ | Proteção de vidas humanas em zonas húmidas |

---

#### 2. Procedimento Operacional Passo a Passo
1. **Desenergização e Bloqueio (LOTO):** Isolar o circuito no corte geral e verificar a ausência de tensão com multímetro calibrado CAT III/IV.
2. **Conexão e Torque:** Utilizar terminais tipo ilhós em condutores multifilares de cobre. Aplicar aperto com chave dinamométrica:
   $$T = 2.0\\,\\text{N}\\cdot\\text{m} \\text{ a } 2.5\\,\\text{N}\\cdot\\text{m} \\text{ (terminais de disjuntores modulares)}$$
3. **Ensaio de Continuidade e Malha de Terra:** Assegurar que o condutor de proteção (PE verde/amarelo) tenha resistência total inferior a $10\\,\\Omega$ em relação à terra de referência.

#### 3. Diagnóstico de Falhas em Moçambique
* **Disparo intempestivo em tempo de chuva:** Corrente de fuga provocada por humidade em caixas de passagem exteriores ou condensação em tubagens enterradas.
* **Sobreaquecimento em bornes:** Torque insuficiente na instalação ou uso de condutores de alumínio misturados diretamente com cobre sem terminal bimetálico.

*Dica da Eng.ª Sara:* Quer realizar um teste numérico ou dimensionar um caso real para esta aula? Pode enviar os valores de potência ou distância!`;
}

function generateElectricalSizingResponse(userName: string, query: string): string {
  // Extração inteligente de números
  const wattMatch = query.match(/(\d+(?:[.,]\d+)?)\s*(k?w)/i);
  let powerWatts = 5500; // Padrão chuveiro se não especificado
  if (wattMatch) {
    const val = parseFloat(wattMatch[1].replace(',', '.'));
    powerWatts = wattMatch[2].toLowerCase() === 'kw' ? val * 1000 : val;
  }

  const isTrifasico = query.toLowerCase().includes('trifas');
  const voltage = isTrifasico ? 380 : 220;
  const cosPhi = 0.95; // Fator de potência típico

  let current = 0;
  let formulaStr = '';

  if (isTrifasico) {
    current = powerWatts / (Math.sqrt(3) * voltage * cosPhi);
    formulaStr = `I = \\frac{P}{\\sqrt{3} \\cdot V_L \\cdot \\cos\\phi} = \\frac{${powerWatts}}{\\sqrt{3} \\cdot 380 \\cdot ${cosPhi}} \\approx ${current.toFixed(1)}\\,\\text{A}`;
  } else {
    current = powerWatts / (voltage * cosPhi);
    formulaStr = `I = \\frac{P}{V \\cdot \\cos\\phi} = \\frac{${powerWatts}}{220 \\cdot ${cosPhi}} \\approx ${current.toFixed(1)}\\,\\text{A}`;
  }

  // Dimensionamento do disjuntor comercial
  let disjuntor = 16;
  let cabo = '2.5 mm²';
  if (current <= 10) { disjuntor = 10; cabo = '1.5 mm²'; }
  else if (current <= 14) { disjuntor = 16; cabo = '2.5 mm²'; }
  else if (current <= 18) { disjuntor = 20; cabo = '4.0 mm²'; }
  else if (current <= 23) { disjuntor = 25; cabo = '4.0 mm²'; }
  else if (current <= 29) { disjuntor = 32; cabo = '6.0 mm²'; }
  else if (current <= 36) { disjuntor = 40; cabo = '10.0 mm²'; }
  else if (current <= 46) { disjuntor = 50; cabo = '10.0 mm²'; }
  else if (current <= 58) { disjuntor = 63; cabo = '16.0 mm²'; }
  else { disjuntor = 80; cabo = '25.0 mm²'; }

  return `Olá, **${userName}**! Aqui está a análise e dimensionamento técnico rigoroso conforme as **Normas Técnicas da EDM & IEC 60364**:

### ⚡ MEMÓRIA DE CÁLCULO ELÉTRICO
Para uma carga de **${powerWatts} W** operando em **${voltage} V** (${isTrifasico ? 'Trifásico 380V' : 'Monofásico 220V'}, 50 Hz):

$$${formulaStr}$$

---

### 📋 TABELA TÉCNICA DE COMPONENTES RECOMENDADOS

| Item | Especificação Recomendada | Critério Técnico EDM / IEC |
| :--- | :--- | :--- |
| **Corrente Nominal de Projeto ($I_b$)** | **${current.toFixed(1)} A** | Carga contínua calculada |
| **Disjuntor Termomagnético ($I_n$)** | **${disjuntor} A (Curva C)** | $I_b \\le I_n \\le I_z$ (Proteção de cabo) |
| **Capacidade de Interrupção ($I_{cn}$)** | **$4.5\\,\\text{kA}$ a $6\\,\\text{kA}$** | Suportabilidade a curto-circuito residencial |
| **Seção Mínima dos Condutores (F+N+PE)** | **${cabo} Cobre Puro** | Isolamento PVC 70°C ou XLPE 90°C |
| **Proteção Diferencial Residual** | **IDR $30\\,\\text{mA}$ Tipo AC/A** | Proteção contra choque elétrico e contacto indireto |
| **Torque nos Parafusos dos Bornes** | **$2.2\\,\\text{N}\\cdot\\text{m}$** | Evita fadiga térmica e formação de arco |

---

### ⚠️ DIRETRIZES MANDATÓRIAS DE INSTALAÇÃO EM MOÇAMBIQUE:
1. **Condutor de Terra (PE):** Nunca partilhar o condutor de neutro como terra na saída do circuito terminal. O condutor de terra deve ir direto ao barramento de equipotencialização.
2. **Queda de Tensão Máxima:** Para distâncias superiores a 25 metros do QGBT, recalcule considerando:
   $$\\Delta V = \\frac{2 \\cdot L \\cdot I \\cdot \\rho}{S} \\le 3\\% \\quad (\\text{limite EDM de } 6.6\\,\\text{V em } 220\\,\\text{V})$$
3. **Conexões com Borne de Porcelana/Cerâmica:** Em cargas de calor como chuveiros e fornos, é proibido o uso de conectores plásticos simples tipo barra; utilize conectores de cerâmica de 3 polos de 50A ou prensagem com terminais tubulares.`;
}

function generateSolarSizingResponse(userName: string, query: string): string {
  return `Olá, **${userName}**! Sou a Eng.ª Sara IA e preparei o dimensionamento fotovoltaico completo com base nos dados de irradiação solar de **Moçambique**:

### ☀️ ENGENHARIA SOLAR FOTOVOLTAICA (OFF-GRID & HÍBRIDO)

#### 1. Média de Horas de Sol Pleno (HSP) em Moçambique:
* **Sul (Maputo, Gaza, Inhambane):** $5.2$ a $5.4\\,\\text{kWh/m}^2\\text{/dia}$
* **Centro (Sofala, Manica, Tete, Zambézia):** $5.4$ a $5.8\\,\\text{kWh/m}^2\\text{/dia}$
* **Norte (Nampula, Cabo Delgado, Niassa):** $5.3$ a $5.6\\,\\text{kWh/m}^2\\text{/dia}$

---

#### 2. Metodologia de Cálculo de um Sistema Padrão (Exemplo 3.0 kWp / 5 kWh dia)
$$\\text{Potência Fotovoltaica Necessária: } P_{\\text{FV}} = \\frac{E_{\\text{consumo}}}{\\text{HSP} \\cdot PR} = \\frac{5000\\,\\text{Wh}}{5.2 \\cdot 0.78} \\approx 1230\\,\\text{Wp}$$

| Equipamento do Sistema | Especificação Técnica | Quantidade Típica |
| :--- | :--- | :--- |
| **Painéis Fotovoltaicos** | Módulos Monocristalinos Tier-1 $550\\,\\text{Wp}$ | 4 a 6 Unidades ($2.2\\,\\text{kWp}$ a $3.3\\,\\text{kWp}$) |
| **Inversor Solar** | Híbrido Onda Senoidal Pura $48\\,\\text{V}$ com MPPT integrado | 1 Unidade ($3.0\\,\\text{kVA}$ ou $5.0\\,\\text{kVA}$) |
| **Banco de Armazenamento** | Bateria Lítio Ferro Fosfato ($\text{LiFePO}_4$) $48\\,\\text{V}$ $100\\,\\text{Ah}$ | $4.8\\,\\text{kWh}$ úteis ($90\\%\\,\\text{DoD}$) |
| **Quadro de Proteção CC (String Box)** | DPS CC $1000\\,\\text{V} + \\text{Fusíveis } 15\\,\\text{A gPV} + \\text{Disjuntor CC}$ | 1 Conjunto completo |
| **Quadro de Proteção CA** | DPS CA $275\\,\\text{V} + \\text{Disjuntor Bipolar } 25\\,\\text{A} + \\text{IDR } 30\\,\\text{mA}$ | 1 Conjunto completo |

---

#### 3. Estimativa Orçamentária no Mercado de Moçambique (MZN)
* **Equipamentos e Materiais:** $180.000\\,\\text{MZN}$ a $260.000\\,\\text{MZN}$ (com bateria de Lítio e painéis Tier-1).
* **Mão de Obra de Engenharia e Instalação Certificada:** $25.000\\,\\text{MZN}$ a $40.000\\,\\text{MZN}$.
* **Tempo de Retorno do Investimento (Payback):** Cerca de 3 a 4 anos em relação à fatura EDM comercial.

*Se tiver a lista exata dos aparelhos que deseja ligar (Ex: geleira, TV, ar condicionado, lâmpadas) e as horas de uso, envie para eu calcular os Ah exatos da bateria!*`;
}

function generateHvacResponse(userName: string, query: string): string {
  return `Olá, **${userName}**! Sou a Eng.ª Sara IA, especialista em sistemas de climatização, refrigeração e eficiência térmica:

### ❄️ GUIA TÉCNICO DE CLIMATIZAÇÃO & DIAGNÓSTICO
Para o clima tropical e quente de Moçambique, a carga térmica deve considerar a radiação solar intensa e humidade relativa elevada:

#### 1. Dimensionamento Rápido de Capacidade Térmica (BTU/h)
$$Q_{\\text{total}} = (\\text{Área } \\text{m}^2 \\times 650) + (\\text{Pessoas adicionais} \\times 600) + (\\text{Aparelhos elétricos} \\times 600)$$

| Espaço / Área | Capacidade Recomendada | Corrente Típica ($220\\,\\text{V}$) | Disjuntor & Cabo |
| :--- | :--- | :--- | :--- |
| **Até $12\\,\\text{m}^2$** (Quarto) | **$9.000\\,\\text{BTU/h}$** | $4.2\\,\\text{A}$ a $5.0\\,\\text{A}$ | Disjuntor $16\\,\\text{A}$ • Cabo $2.5\\,\\text{mm}^2$ |
| **De $13\\,\\text{m}^2$ a $20\\,\\text{m}^2$** (Sala/Escritório) | **$12.000\\,\\text{BTU/h}$** | $5.5\\,\\text{A}$ a $6.8\\,\\text{A}$ | Disjuntor $16\\,\\text{A}$ • Cabo $2.5\\,\\text{mm}^2$ |
| **De $21\\,\\text{m}^2$ a $30\\,\\text{m}^2$** (Espaço Comercial) | **$18.000\\,\\text{BTU/h}$** | $8.0\\,\\text{A}$ a $10.5\\,\\text{A}$ | Disjuntor $20\\,\\text{A}$ • Cabo $4.0\\,\\text{mm}^2$ |
| **De $31\\,\\text{m}^2$ a $45\\,\\text{m}^2$** (Auditório/Loja) | **$24.000\\,\\text{BTU/h}$** | $11.0\\,\\text{A}$ a $14.0\\,\\text{A}$ | Disjuntor $25\\,\\text{A}$ • Cabo $4.0\\,\\text{mm}^2$ |

---

#### 2. Procedimento de Vácuo Obrigatório (Não Purgue com Gás!)
* É proibido o método de "expurgar" com o próprio refrigerante da condensadora.
* Utilizar bomba de vácuo de duplo estágio e vacuômetro digital: atingir **abaixo de 500 microns** e estabilizar por pelo menos 15 minutos sem elevação rápida (teste de estanqueidade).

#### 3. Tabela de Diagnóstico de Falhas Comuns em Moçambique:
* **Código E1 / Falha de Comunicação:** Verificar cabo de interligação entre evaporadora e condensadora (cabo PP 4 vias com terminal bem cravado).
* **Congelamento na Linha de Sucção:** Falta de fluido refrigerante (vazamento na flange de cobre) ou turbina da evaporadora saturada de poeira.
* **Compressor não parte:** Capacitor permanente desvalorizado (testar capacitância em $\\mu\\text{F}$ com capacímetro) ou tensão EDM com queda abaixo de $195\\,\\text{V}$.`;
}

function generatePricingResponse(userName: string, query: string): string {
  return `Olá, **${userName}**! Apresento a **Tabela Referencial Oficial de Mão de Obra e Serviços Técnicos da TécnicaMZ Pro em Moçambique (Meticais - MZN)**:

### 💼 TABELA DE PREÇOS TÉCNICOS & MÃO DE OBRA (MZN)

| Tipo de Serviço Eletrotécnico | Faixa Média em Maputo / Matola | Faixa Beira / Nampula / Tete | Observações Técnicas |
| :--- | :--- | :--- | :--- |
| **Ponto de Iluminação Simples** | **$350\\,\\text{MZN} - 500\\,\\text{MZN}$** | **$400\\,\\text{MZN} - 600\\,\\text{MZN}$** | Inclui tubagem, fiação e aparelho |
| **Ponto de Tomada Geral (TUG)** | **$450\\,\\text{MZN} - 650\\,\\text{MZN}$** | **$500\\,\\text{MZN} - 700\\,\\text{MZN}$** | Fio $2.5\\,\\text{mm}^2$ com condutor de terra |
| **Ponto de Carga Especial (TUE)** | **$800\\,\\text{MZN} - 1.200\\,\\text{MZN}$** | **$900\\,\\text{MZN} - 1.400\\,\\text{MZN}$** | Chuveiro, AC ou termoacumulador |
| **Montagem de QGBT Monofásico (até 8 disjuntores)** | **$3.500\\,\\text{MZN} - 5.500\\,\\text{MZN}$** | **$4.000\\,\\text{MZN} - 6.500\\,\\text{MZN}$** | Com barramentos tipo pente e identificação |
| **Montagem de QGBT Trifásico Industrial** | **$8.000\\,\\text{MZN} - 16.000\\,\\text{MZN}$** | **$9.500\\,\\text{MZN} - 18.000\\,\\text{MZN}$** | Equilíbrio de fases e DPS classe II |
| **Instalação de AC Split (9.000 a 12.000 BTU)** | **$2.500\\,\\text{MZN} - 4.000\\,\\text{MZN}$** | **$3.000\\,\\text{MZN} - 4.500\\,\\text{MZN}$** | Com vácuo e teste de pressão com nitrogénio |
| **Medição de Terra com Telurômetro e Emissão de Laudo** | **$3.000\\,\\text{MZN} - 6.000\\,\\text{MZN}$** | **$3.500\\,\\text{MZN} - 7.000\\,\\text{MZN}$** | Relatório técnico com valor em $\\Omega$ |
| **Instalação de Sistema Solar Residencial (até 3kW)** | **$15.000\\,\\text{MZN} - 28.000\\,\\text{MZN}$** | **$18.000\\,\\text{MZN} - 32.000\\,\\text{MZN}$** | Painéis, inversor, baterias e proteções |
| **Diagnóstico de Avaria / Taxa de Deslocação Técnica** | **$1.000\\,\\text{MZN} - 1.800\\,\\text{MZN}$** | **$1.200\\,\\text{MZN} - 2.000\\,\\text{MZN}$** | Dedutível se o serviço for aprovado |

---

#### 📌 Recomendações para Propostas de Sucesso:
1. **Adicione sempre 10% a 15% de margem de segurança** para imprevistos e materiais consumíveis (fita isolante antichama, terminais, abraçadeiras, buchas).
2. **Emita os seus orçamentos através do gerador de orçamentos e relatórios PDF** aqui na barra de Ferramentas da plataforma para entregar ao cliente um documento com visual executivo e logótipo profissional.`;
}

function generateStandardsAndGroundingResponse(userName: string, query: string): string {
  return `Olá, **${userName}**! Apresento as diretrizes oficiais das **Normas da Electricidade de Moçambique (EDM)** e **IEC 60364** para sistemas de proteção e ligação à terra:

### ⚡ SISTEMAS DE PROTEÇÃO, ATERRAMENTO & NORMAS EDM

#### 1. Parâmetros Mandatórios da Rede de Distribuição:
* **Tensão Monofásica:** $220\\,\\text{V} \\pm 10\\%$ ($198\\,\\text{V} \\text{ a } 242\\,\\text{V}$) a $50\\,\\text{Hz}$
* **Tensão Trifásica:** $380\\,\\text{V} \\pm 10\\%$ ($342\\,\\text{V} \\text{ a } 418\\,\\text{V}$) a $50\\,\\text{Hz}$
* **Esquema de Ligação à Terra Recomendado:** **TT** ou **TN-S** (o condutor de proteção PE deve ser completamente individualizado do neutro após a portinhola de entrada).

---

#### 2. Eletrodo de Terra & Resistência Máxima Permitida
$$\\text{Resistência de Dispersão Máxima: } R_{\\text{terra}} \\le 10\\,\\Omega \\quad (\\text{Critério de Proteção EDM / Telecom})$$

| Componente | Especificação Mínima | Finalidade Técnica |
| :--- | :--- | :--- |
| **Vareta de Terra (Píquete)** | Aço Cobreado (Copperweld) $\\varnothing 5/8''$ ($16\\,\\text{mm}$) $\\times 2.4\\,\\text{m}$ | Dispersão profunda de correntes de falta |
| **Condutor de Aterramento Principal** | Cobre nu ou isolado verde/amarelo $\\ge 16\\,\\text{mm}^2$ | Conexão da vareta à barra de equipotencialização (BEP) |
| **Caixa de Inspeção** | Caixa em alvenaria ou PVC com tampa visitável | Medição e manutenção com Telurômetro |
| **Tratamento de Solo (se $R > 10\\,\\Omega$)** | Composto descalcificante condutor (Bentonita ou Gel) | Redução da resistividade do terreno arenoso |

---

#### 3. O Trio de Ouro da Segurança em Quadros Elétricos (QGBT):
1. **Disjuntor Termomagnético Geral:** Protege os condutores de entrada contra sobrecorrentes e curtos-circuitos.
2. **Dispositivo de Proteção contra Surtos (DPS Classe II):** Essencial em Moçambique devido à elevada incidência de raios e descargas atmosféricas. Tensão máxima contínua: $U_c = 275\\,\\text{V}$.
3. **Interruptor Diferencial Residual (IDR / DR):** Sensibilidade de $30\\,\\text{mA}$ obrigatória para casas de banho, cozinhas e tomadas externas. Salva vidas ao desligar em menos de $40\\,\\text{ms}$ em caso de fuga de corrente.`;
}

function generateGeneratorsResponse(userName: string, query: string): string {
  return `Olá, **${userName}**! Segue a análise técnica para grupos geradores a diesel/gasolina e comutação automática de rede:

### ⚙️ GRUPOS GERADORES & QUADROS DE TRANSFERÊNCIA (ATS / QTA)

#### 1. Dimensionamento de Potência (kVA vs kW)
$$P_{\\text{kVA}} = \\frac{P_{\\text{kW}}}{\\cos\\phi} = \\frac{P_{\\text{kW}}}{0.8}$$
* **Margem de Partida para Motores/Bombas:** Multiplique a potência de bombas de água e compressores por $2.5$ a $3.0$ para compensar a corrente de arranque (LRA - *Locked Rotor Amps*).
* **Fator de Carga Recomendado:** Operar o gerador entre $60\\%$ e $80\\%$ da capacidade nominal para evitar vitrificação dos cilindros (*wet stacking*).

---

#### 2. Quadro de Comutação Automática de Rede (ATS / QTA)
* **Encravamento Mecânico e Elétrico Mandatório:** É estritamente proibido que a rede EDM e o gerador entrem em paralelo acidental. O contator do gerador e o da EDM devem possuir bloqueio mecânico físico.
* **Temporizador de Estabilização:** Ajustar $30\\,\\text{s}$ para o motor aquecer antes de assumir a carga e $60\\,\\text{s}$ de arrefecimento (*cooling down*) após o retorno da rede EDM.`;
}

function generateImageInspectionReport(userName: string, role: string, promptText: string): string {
  return `Olá, **${userName}**! Analisei detalhadamente a foto técnica enviada para o seu parecer de **${role}**:

### 🔍 LAUDO DE INSPEÇÃO TÉCNICA ELETROTÉCNICA

#### 1. Descrição dos Componentes e Estado Aparente
* **Equipamentos Observados:** Quadro de distribuição elétrica com dispositivos de manobra modulares (disjuntores DIN), fiação de potência e barramentos de interligação.
* **Organização dos Condutores:** É essencial verificar se há identificação por cores padrão EDM (Azul Claro para Neutro, Verde/Amarelo para Terra PE, e Preto/Castanho/Cinzento para Fases).

#### 2. Conformidade com as Normas EDM & IEC 60364
* **Pontos de Risco Detectados:** Sobreaquecimento por falta de torque adequado nos bornes, ausência de terminais tipo ilhós em condutores multifilares ou proximidade excessiva entre circuitos de potência e comando.
* **Proteções Obrigatórias:** Verifique a presença de DPS Classe II ($U_c 275\\,\\text{V}$, $I_n 20\\,\\text{kA}$) e IDR de alta sensibilidade ($30\\,\\text{mA}$) protegendo os circuitos molhados.

#### 3. Testes Recomendados com Instrumentos:
1. **Termografia Infravermelha ou Sensor Térmico:** Verificar pontos quentes acima de $55^\\circ\\text{C}$ sob carga nominal.
2. **Medição de Tensão com Multímetro CAT III/IV:** Medir F-N ($220\\,\\text{V} \\pm 10\\%$) e N-PE (deve ser menor que $2.0\\,\\text{V}$).
3. **Reaperto Dinamométrico:** Aplicar torque de $2.0\\,\\text{N}\\cdot\\text{m}$ a $2.5\\,\\text{N}\\cdot\\text{m}$ em todos os parafusos dos disjuntores.

*Dica da Eng.ª Sara:* Deseja que eu emita a lista de materiais para a regularização desta instalação em formato de orçamento PDF?`;
}

function generateGeneralConsultingResponse(userName: string, role: string, query: string): string {
  return `Olá, **${userName}**! Sou a **Eng.ª Sara IA**, sua consultora de engenharia eletrotécnica e inteligência técnica na **TécnicaMZ Pro**.

Estou programada com as normas oficiais da **EDM (Electricidade de Moçambique: 220V/380V a 50Hz)**, catálogos industriais e a tabela prática de preços em Meticais (MZN).

---

### 🛠️ O QUE POSSO RESOLVER PARA VOCÊ AGORA:
1. **Dimensionamento Elétrico:** Calcular disjuntores, seção de condutores em cobre, queda de tensão e corrente de projeto ($I_b$).
2. **Sistemas Solares Fotovoltaicos:** Dimensionar painéis solares, banco de baterias de Lítio $\\text{LiFePO}_4$, controladores MPPT e inversores para qualquer carga em Moçambique.
3. **Climatização & AC:** Cálculo de BTUs, diagnóstico de códigos de erro em compressores inverter e procedimentos de vácuo.
4. **Tabela de Mão de Obra e Orçamentos (MZN):** Valores recomendados para orçamentos de instalações residenciais, comerciais e industriais.
5. **Dúvidas da Minha Academia Técnica:** Análise de elementos de proteção e normas IEC/ISO sincronizadas com as suas aulas.

Pode enviar a sua questão técnica específica, os valores de potência em Watts, ou até anexar uma fotografia do quadro elétrico para uma análise imediata!`;
}
