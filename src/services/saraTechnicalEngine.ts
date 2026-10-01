/**
 * Motor de Inteligência Técnica e Engenharia Elétrica da Eng.ª Sara IA - TécnicaMZ Pro
 * 
 * Permite respostas técnicas ultracompletas, imediatas e fundamentadas nas normas da
 * EDM (Electricidade de Moçambique: 220V/380V a 50Hz), IEC 60364, IEEE, dimensionamento
 * de condutores, disjuntores, quedas de tensão, aterramentos, IDRs, DPS, motores, inversores,
 * energia solar fotovoltaica, climatização, comandos elétricos e preços em Meticais (MZN).
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

  // 1. CONTEXTO ACADÊMICO
  if (academy && (lower.includes('elemento:') || lower.includes('norma:') || lower.includes('aula') || lower.includes('modulo') || lower.includes('exercicio') || rawText.length < 5)) {
    return generateAcademyLessonResponse(userName, academy, rawText);
  }

  // 2. IMAGEM / LAUDO FOTOGRÁFICO
  if (req.imageBase64) {
    return generateImageInspectionReport(userName, role, rawText);
  }

  // 3. MOTORES ELÉTRICOS, ESTRELA-TRIÂNGULO E ACIONAMENTOS
  if (
    lower.includes('motor') ||
    lower.includes('estrela') ||
    lower.includes('triangulo') ||
    lower.includes('triângulo') ||
    lower.includes('partida') ||
    lower.includes('vfd') ||
    lower.includes('inversor de frequencia') ||
    lower.includes('inversor de frequência') ||
    lower.includes('soft-starter') ||
    lower.includes('soft starter') ||
    lower.includes('rele termico') ||
    lower.includes('relé térmico') ||
    lower.includes('disjuntor motor') ||
    lower.includes('disjuntor-motor') ||
    lower.includes('contator') ||
    lower.includes('botoeira') ||
    lower.includes('selo')
  ) {
    return generateMotorsAndControlResponse(userName, rawText);
  }

  // 4. ATERRAMENTO, MALHA DE TERRA, TELURÔMETRO E ESQUEMAS TT / TN-S
  if (
    lower.includes('aterramento') ||
    lower.includes('terra') ||
    lower.includes('malha') ||
    lower.includes('haste') ||
    lower.includes('piquete') ||
    lower.includes('píquete') ||
    lower.includes('telurometro') ||
    lower.includes('telurômetro') ||
    lower.includes('esquema tt') ||
    lower.includes('esquema tn') ||
    lower.includes('tn-s') ||
    lower.includes('equipotencial') ||
    lower.includes('bep')
  ) {
    return generateGroundingDeepResponse(userName, rawText);
  }

  // 5. PROTEÇÃO DIFERENCIAL RESIDUAL (IDR / DR) E DISPAROS EM FALSO
  if (
    lower.includes('idr') ||
    lower.includes('dr ') ||
    lower.includes('diferencial residual') ||
    lower.includes('disparo do idr') ||
    lower.includes('fuga de corrente') ||
    lower.includes('30ma') ||
    lower.includes('300ma')
  ) {
    return generateRcdDifferentialResponse(userName, rawText);
  }

  // 6. DISPOSITIVOS DE PROTEÇÃO CONTRA SURTOS (DPS) E RAIOS
  if (
    lower.includes('dps') ||
    lower.includes('surto') ||
    lower.includes('sobretensao') ||
    lower.includes('sobretensão') ||
    lower.includes('raio') ||
    lower.includes('descarga atmosferica') ||
    lower.includes('descarga atmosférica') ||
    lower.includes('varistor')
  ) {
    return generateSurgeProtectionResponse(userName, rawText);
  }

  // 7. FATOR DE POTÊNCIA, REATIVOS E BANCO DE CAPACITORES
  if (
    lower.includes('fator de potencia') ||
    lower.includes('fator de potência') ||
    lower.includes('cos phi') ||
    lower.includes('cosphi') ||
    lower.includes('kvar') ||
    lower.includes('capacitor') ||
    lower.includes('reativo') ||
    lower.includes('multa edm')
  ) {
    return generatePowerFactorResponse(userName, rawText);
  }

  // 8. SOLAR FOTOVOLTAICO (OFF-GRID, HÍBRIDO, BATERIAS LIFEPO4)
  if (
    lower.includes('solar') ||
    lower.includes('fotovoltaic') ||
    lower.includes('painel') ||
    lower.includes('placa solar') ||
    lower.includes('inversor solar') ||
    lower.includes('bateria') ||
    lower.includes('off-grid') ||
    lower.includes('on-grid') ||
    lower.includes('mppt') ||
    lower.includes('lifepo4')
  ) {
    return generateSolarSizingResponse(userName, rawText);
  }

  // 9. CLIMATIZAÇÃO, AR CONDICIONADO E REFRIGERAÇÃO
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
    lower.includes('vácuo') ||
    lower.includes('vacuo') ||
    lower.includes('erro e')
  ) {
    return generateHvacResponse(userName, rawText);
  }

  // 10. TABELA DE PREÇOS, MÃO DE OBRA E ORÇAMENTOS (MZN)
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

  // 11. TRANSFORMADORES, SUBESTAÇÕES E GERADORES
  if (
    lower.includes('transformador') ||
    lower.includes('subestação') ||
    lower.includes('subestacao') ||
    lower.includes('gerador') ||
    lower.includes('ats') ||
    lower.includes('comutador') ||
    lower.includes('grupo gerador')
  ) {
    return generateTransformersAndGeneratorsResponse(userName, rawText);
  }

  // 12. DIAGNÓSTICO DE AVARIAS, CURTO-CIRCUITO E MULTÍMETRO
  if (
    lower.includes('curto') ||
    lower.includes('avaria') ||
    lower.includes('defeito') ||
    lower.includes('queimou') ||
    lower.includes('nao liga') ||
    lower.includes('não liga') ||
    lower.includes('disjuntor dispara') ||
    lower.includes('neutro partido') ||
    lower.includes('multimetro') ||
    lower.includes('multímetro') ||
    lower.includes('megger') ||
    lower.includes('isolamento')
  ) {
    return generateFaultDiagnosticResponse(userName, rawText);
  }

  // 13. DIMENSIONAMENTO ELÉTRICO PADRÃO (CABOS, DISJUNTORES, QUEDA DE TENSÃO, CARGAS)
  if (
    lower.includes('disjuntor') ||
    lower.includes('cabo') ||
    lower.includes('bitola') ||
    lower.includes('seção') ||
    lower.includes('seccao') ||
    lower.includes('chuveiro') ||
    lower.includes('queda de tensao') ||
    lower.includes('queda de tensão') ||
    lower.includes('quadro') ||
    lower.includes('qgbt') ||
    lower.includes('monofasico') ||
    lower.includes('trifasico') ||
    lower.includes('ampere') ||
    /\b\d+\s*(w|kw|kva|a|mm2|mm²|v)\b/i.test(rawText)
  ) {
    return generateElectricalSizingResponse(userName, rawText);
  }

  // 14. CONSULTORIA GERAL DE ENGENHARIA ELÉTRICA
  return generateGeneralConsultingResponse(userName, role, rawText);
}

// --------------------------------------------------------------------------------
// IMPLEMENTAÇÕES ESPECIALIZADAS POR DOMÍNIO
// --------------------------------------------------------------------------------

function generateElectricalSizingResponse(userName: string, query: string): string {
  const wattMatch = query.match(/(\d+(?:[.,]\d+)?)\s*(k?w)/i);
  let powerWatts = 5500;
  if (wattMatch) {
    const val = parseFloat(wattMatch[1].replace(',', '.'));
    powerWatts = wattMatch[2].toLowerCase() === 'kw' ? val * 1000 : val;
  }

  const isTrifasico = query.toLowerCase().includes('trifas');
  const voltage = isTrifasico ? 380 : 220;
  const cosPhi = 0.95;

  let current = 0;
  let formulaStr = '';

  if (isTrifasico) {
    current = powerWatts / (Math.sqrt(3) * voltage * cosPhi);
    formulaStr = `I_b = \\frac{P}{\\sqrt{3} \\cdot V_L \\cdot \\cos\\phi} = \\frac{${powerWatts}}{\\sqrt{3} \\cdot 380 \\cdot ${cosPhi}} \\approx ${current.toFixed(1)}\\,\\text{A}`;
  } else {
    current = powerWatts / (voltage * cosPhi);
    formulaStr = `I_b = \\frac{P}{V \\cdot \\cos\\phi} = \\frac{${powerWatts}}{220 \\cdot ${cosPhi}} \\approx ${current.toFixed(1)}\\,\\text{A}`;
  }

  let disjuntor = 16;
  let cabo = '2.5 mm²';
  let izCabo = 24;
  if (current <= 10) { disjuntor = 10; cabo = '1.5 mm²'; izCabo = 17.5; }
  else if (current <= 14) { disjuntor = 16; cabo = '2.5 mm²'; izCabo = 24; }
  else if (current <= 18) { disjuntor = 20; cabo = '4.0 mm²'; izCabo = 32; }
  else if (current <= 23) { disjuntor = 25; cabo = '4.0 mm²'; izCabo = 32; }
  else if (current <= 29) { disjuntor = 32; cabo = '6.0 mm²'; izCabo = 41; }
  else if (current <= 36) { disjuntor = 40; cabo = '10.0 mm²'; izCabo = 57; }
  else if (current <= 46) { disjuntor = 50; cabo = '10.0 mm²'; izCabo = 57; }
  else if (current <= 58) { disjuntor = 63; cabo = '16.0 mm²'; izCabo = 76; }
  else if (current <= 73) { disjuntor = 80; cabo = '25.0 mm²'; izCabo = 101; }
  else { disjuntor = 100; cabo = '35.0 mm²'; izCabo = 125; }

  return `Olá, **${userName}**! Sou a **Eng.ª Sara IA**. Preparei a memória de cálculo completa e o dimensionamento para a sua instalação:

### ⚡ MEMÓRIA DE CÁLCULO ELETROTÉCNICO (EDM / IEC 60364)
Para a carga informada de **${powerWatts} W** em **${voltage} V** (${isTrifasico ? 'Trifásico 380V' : 'Monofásico 220V'}, 50 Hz, $\\cos\\phi = ${cosPhi}$):

$$${formulaStr}$$

---

### 📋 TABELA TÉCNICA DE COMPONENTES DE PROTEÇÃO & CONDUTORES

| Parâmetro de Projeto | Valor Calculado | Critério Normativo EDM / IEC |
| :--- | :--- | :--- |
| **Corrente de Projeto ($I_b$)** | **${current.toFixed(1)} A** | Carga contínua em regime nominal |
| **Disjuntor Termomagnético ($I_n$)** | **${disjuntor} A (Curva C)** | Regra de Ouro: $I_b \\le I_n \\le I_z$ |
| **Capacidade do Cabo ($I_z$)** | **${izCabo} A** (embutido B1 30°C) | Suporta a corrente sem sobreaquecimento |
| **Seção do Condutor (Fase + N + PE)** | **${cabo} Cobre Classe 5** | Isolamento PVC 70°C / XLPE 90°C |
| **Poder de Corte ($I_{cn}$)** | **$4.5\\,\\text{kA}$ a $6.0\\,\\text{kA}$** | Resistência à corrente de curto-circuito |
| **Proteção Diferencial Residual** | **IDR $30\\,\\text{mA}$ Tipo AC/A** | Proteção obrigatória contra choques elétricos |
| **Torque nos Parafusos dos Bornes** | **$2.2\\,\\text{N}\\cdot\\text{m}$ a $2.5\\,\\text{N}\\cdot\\text{m}$** | Evita fadiga térmica e formação de arco |

---

### 📏 VERIFICAÇÃO DA QUEDA DE TENSÃO (MÁXIMO 3% NA EDM)
Para circuitos terminais, a queda de tensão máxima permitida em Moçambique é de **$3\\%$** ($6.6\\,\\text{V}$ em $220\\,\\text{V}$):
$$\\Delta V = \\frac{2 \\cdot L \\cdot I_b \\cdot \\rho}{S} \\quad \\text{com } \\rho = 0.0178\\,\\Omega\\cdot\\text{mm}^2/\\text{m (Cobre)}$$

* Se a distância $L$ até ao quadro for superior a **25 metros**, aumente a seção do cabo para a bitola imediatamente superior para manter a queda de tensão abaixo de $3\\%$.
* **Conexão Terminal de Chuveiros / Aquecedores:** É estritamente proibido o uso de conectores de plástico comuns (barra de parafuso tipo sindal plástico). Utilize conectores cerâmicos/porcelana de 50A ou prensagem com terminais tubulares bimetálicos.`;
}

function generateMotorsAndControlResponse(userName: string, query: string): string {
  return `Olá, **${userName}**! Sou a **Eng.ª Sara IA**. Aqui está o guia técnico aprofundado para motores de indução trifásicos, ligações e métodos de acionamento:

### ⚙️ MOTORES ELÉTRICOS TRIFÁSICOS & COMANDOS (EDM 220V/380V)

#### 1. Ligações em Motores de 6 Terminais (U1-U2, V1-V2, W1-W2)
* **Ligação Triângulo ($\\Delta$ - 220V):**
  * Fechamento dos bornes em paralelo: (U1 com W2), (V1 com U2), (W1 com V2).
  * Aplicado em redes onde a tensão de linha é $220\\,\\text{V}$ trifásica.
* **Ligação Estrela ($Y$ - 380V - Padrão EDM em Moçambique):**
  * Fechamento em curto-circuito dos bornes (U2 com V2 com W2).
  * Alimentação das 3 fases R-S-T diretamente em U1, V1, W1.

---

#### 2. Tabela Comparativa de Métodos de Partida de Motores:

| Método de Partida | Corrente de Partida ($I_p / I_n$) | Torque de Partida ($C_p / C_n$) | Aplicação Recomendada |
| :--- | :--- | :--- | :--- |
| **Partida Direta (DOL)** | **$6.0$ a $8.0 \\times I_n$** | $100\\%$ do torque nominal | Motores até $5.5\\,\\text{kW}$ ($7.5\\,\\text{cv}$) |
| **Estrela-Triângulo ($Y-\\Delta$)** | **$2.0$ a $2.7 \\times I_n$ (redução de 67%)** | $33\\%$ do torque nominal | Bombas centrífugas sem carga inicial pesada |
| **Soft-Starter (Eletrônica)** | **$2.0$ a $3.5 \\times I_n$ (ajustável)** | Rampa linear de aceleração | Compressores, esteiras, ventiladores industriais |
| **Inversor de Frequência (VFD)** | **$1.0$ a $1.5 \\times I_n$** | $100\\%$ de torque desde $0\\,\\text{Hz}$ | Controle de velocidade e processos contínuos |

---

#### 3. Dimensionamento de Proteção de Motores:
* **Relé Térmico de Sobrecarga:** Ajustar rigorosamente para a **Corrente Nominal ($I_n$)** indicada na placa do motor (ou $0.58 \\times I_n$ se montado dentro do circuito em triângulo).
* **Disjuntor-Motor Magnético:** Ajustar para Curva D ou classe 10 de disparo para permitir o pico de partida de 5 a 10 segundos sem desarmar.
* **Proteção contra Falta de Fase:** Obrigatório o uso de Relé Falta de Fase (RFF) no comando, pois a queima de enrolamento por operação bifásica é uma das falhas mais frequentes em Moçambique.`;
}

function generateGroundingDeepResponse(userName: string, query: string): string {
  return `Olá, **${userName}**! Sou a **Eng.ª Sara IA**. Apresento as diretrizes técnicas fundamentadas para sistemas de aterramento e medição de resistência:

### 🌍 ATERRAMENTO TÉCNICO & MALHAS DE PROTEÇÃO (EDM / IEC 60364)

#### 1. Esquema Mandatório de Distribuição:
* **Esquema TT ou TN-S:** Em Moçambique, a EDM entrega Neutro e Fase(s). No ponto de entrega (portinhola/caixa de contagem), deve ser instalado o elétrodo de terra local.
* **Separação Rígida:** O condutor de Neutro ($N$) e o condutor de Proteção ($PE$) **nunca** devem ser reconectados após a barra de equipotencialização principal (BEP).

---

#### 2. Requisitos de Resistência de Aterramento ($R_t$):
$$R_{\\text{terra}} \\le 10\\,\\Omega \\quad (\\text{Critério de Segurança EDM / Telecomunicações})$$

| Componente da Instalação | Especificação Técnica Mandatória | Observação Prática |
| :--- | :--- | :--- |
| **Vareta de Terra (Píquete)** | Aço Cobreado Copperweld $5/8''$ ($16\\,\\text{mm}$) $\\times 2.4\\,\\text{m}$ | Camada de cobre $\\ge 254\\,\\mu\\text{m}$ |
| **Condutor de Aterramento Principal** | Cobre eletrolítico nu ou isolado verde/amarelo $\\ge 16\\,\\text{mm}^2$ | Conexão mecânica com grampo estanhado reforçado |
| **Caixa de Inspeção em Alvenaria** | $30 \\times 30\\,\\text{cm}$ com tampa de betão ou ferro fundido | Permite desconexão para teste anual com Telurômetro |
| **Tratamento Químico de Solo** | Bentonita condutora de sódio ou gel eletrolítico | Utilizar em solos arenosos de Maputo/Costa com $R > 10\\,\\Omega$ |

---

#### 3. Procedimento de Medição com Telurômetro (Método dos 62%):
1. Desconectar o cabo de terra principal da BEP para não medir o aterramento da rede pública.
2. Inserir a haste de corrente ($C_2$) a uma distância de **30 metros** da haste sob teste.
3. Inserir a haste de potencial ($P_2$) a **62% da distância total** ($\approx 18.6\\,\\text{metros}$).
4. Medir e confirmar a leitura no mostrador digital em $\\Omega$. Se o valor for superior a $10\\,\\Omega$, adicione hastes adicionais em paralelo espaçadas a uma distância mínima igual ao comprimento das hastes ($2.4\\,\\text{m}$).`;
}

function generateRcdDifferentialResponse(userName: string, query: string): string {
  return `Olá, **${userName}**! Sou a **Eng.ª Sara IA**. Vamos analisar o funcionamento, tipos e resolução de disparos do Interruptor Diferencial Residual (IDR):

### 🛡️ PROTEÇÃO DIFERENCIAL RESIDUAL (IDR / DR - IEC 61008)

#### 1. Princípio de Funcionamento:
O IDR mede vetorialmente a corrente que entra pelas fases e a que retorna pelo neutro através de um transformador toroidal (*Core Balance CT*):
$$\\sum I = I_{\\text{Fase 1}} + I_{\\text{Fase 2}} + I_{\\text{Fase 3}} + I_{\\text{Neutro}} = 0$$
Se houver uma fuga para o terra (ex: uma pessoa toca num fio energizado ou carcaça de um aparelho com defeito de isolamento) de valor superior à sensibilidade ($I_{\\Delta n} \\ge 30\\,\\text{mA}$), o relé polarizado desarma em menos de **$40\\,\\text{ms}$**, evitando a fibrilação cardíaca.

---

#### 2. Tipos de IDR e Onde Empregar:
* **Tipo AC:** Apenas detecta fugas de corrente alternada senoidal pura. Adequado para iluminação e cargas resistivas básicas.
* **Tipo A:** Detecta correntes senoidais e correntes contínuas pulsantes. **Recomendado para Moçambique** devido à grande quantidade de inversores, computadores, TVs e aparelhos inverter.
* **Tipo B:** Detecta correntes CC puras. Obrigatório em estações de recarga de veículos elétricos e inversores solares trifásicos sem transformador.

---

#### 3. Como Resolver Disparos Intempestivos (Falso Disparo):
1. **Neutro Conectado à Terra a Jusante:** O erro mais comum dos instaladores é ligar o condutor neutro do circuito terminal ao barramento de terra do quadro. Isso gera desbalanceamento imediato ao ligar qualquer carga. O neutro que passa pelo IDR deve ser exclusivo do circuito.
2. **Fuga Acumulada em Filtros EMI:** Computadores e fontes chaveadas possuem capacitores Y ligados à carcaça que drenam de $1.5\\,\\text{mA}$ a $3.5\\,\\text{mA}$ cada. Se você agrupar mais de 8 computadores no mesmo IDR de 30mA, a soma das correntes de fuga normais desarmará o dispositivo. Solução: dividir em mais de um circuito com IDRs dedicados.
3. **Condensação e Umidade:** Em Moçambique, a umidade nas caixas de passagem externas após chuvas fortes gera correntes de fuga de 10 a 25mA pela alvenaria úmida. Vede as caixas com gel de silicone dielétrico.`;
}

function generateSurgeProtectionResponse(userName: string, query: string): string {
  return `Olá, **${userName}**! Sou a **Eng.ª Sara IA**. Aqui estão as regras definitivas para instalação de Dispositivos de Proteção contra Surtos (DPS):

### ⚡ DISPOSITIVOS DE PROTEÇÃO CONTRA SURTOS (DPS - IEC 61643)

#### 1. Classificação e Aplicações:
* **Classe I ($10/350\\,\\mu\\text{s}$):** Projetado para suportar correntes diretas de descargas atmosféricas (raios). Obrigatório em edifícios com para-raios externo (SPDA / Gaiola de Faraday).
* **Classe II ($8/20\\,\\mu\\text{s}$):** Projetado para sobretensões induzidas por manobras na rede EDM e raios distantes. **Obrigatório em todos os quadros gerais (QGBT) em Moçambique**.
* **Classe III ($1.2/50\\,\\mu\\text{s}$):** Proteção fina próxima ao equipamento sensível (computadores, servidores, TVs).

---

#### 2. Especificação para a Rede de Moçambique:

| Parâmetro Técnico | Valor Recomendado EDM | Justificativa de Engenharia |
| :--- | :--- | :--- |
| **Tensão Máxima de Operação ($U_c$)** | **$275\\,\\text{V}$ (para rede $220\\,\\text{V}$)** | Suporta oscilações da rede EDM sem queimar precocemente |
| **Corrente Nominal de Descarga ($I_n$)** | **$20\\,\\text{kA}$ ($8/20\\,\\mu\\text{s}$)** | Nível médio para descargas tropicais |
| **Corrente Máxima de Descarga ($I_{\\max}$)** | **$40\\,\\text{kA}$ a $45\\,\\text{kA}$** | Suportabilidade a surtos intensos |
| **Nível de Proteção de Tensão ($U_p$)** | **$\\le 1.5\\,\\text{kV}$** | Mantém a tensão residual segura para eletrodomésticos |

---

#### 3. Regra dos 50 cm na Instalação:
O comprimento total dos cabos de conexão do DPS (cabo que sai da fase até o DPS + cabo que sai do DPS até o barramento de terra) **deve ser menor que $50\\,\\text{cm}$**. Cada metro de cabo adiciona cerca de $1000\\,\\text{V}$ de sobretensão por indução ($L \\cdot \\frac{di}{dt}$), anulando a proteção se o cabo for comprido!`;
}

function generatePowerFactorResponse(userName: string, query: string): string {
  return `Olá, **${userName}**! Sou a **Eng.ª Sara IA**. Segue a memória de cálculo e metodologia para correção de Fator de Potência:

### 📈 CORREÇÃO DO FATOR DE POTÊNCIA & BANCO DE CAPACITORES

#### 1. Limite Regulatório da EDM:
* A EDM exige que as instalações comerciais e industriais mantenham o fator de potência médio **$\\cos\\phi \\ge 0.92$**.
* Fatores de potência inferiores a $0.92$ acarretam em cobrança de **Energia Reativa Excedente (kvarh)** na fatura de energia, além de sobrecarregar transformadores e condutores por excesso de corrente reativa.

---

#### 2. Fórmula de Cálculo da Potência Reativa Capacitiva ($Q_c$):
$$Q_c = P_{\\text{kW}} \\cdot \\left[\\tan(\\arccos\\phi_1) - \\tan(\\arccos\\phi_2)\\right]$$

*Exemplo Prático:* Indústria com carga ativa de $100\\,\\text{kW}$ operando com $\\cos\\phi_1 = 0.75$ que deseja corrigir para $\\cos\\phi_2 = 0.95$:
* $\\phi_1 = \\arccos(0.75) = 41.4^\\circ \\implies \\tan(41.4^\\circ) = 0.8819$
* $\\phi_2 = \\arccos(0.95) = 18.2^\\circ \\implies \\tan(18.2^\\circ) = 0.3287$
$$Q_c = 100 \\times (0.8819 - 0.3287) = 100 \\times 0.5532 \\approx 55.3\\,\\text{kvar}$$
Recomenda-se a instalação de um banco automático de **$60\\,\\text{kvar}$** dividido em estágios de $10\\,\\text{kvar}$ e $20\\,\\text{kvar}$ acionados por controlador microprocessado de fator de potência.

---

#### 3. Cuidados Críticos com Harmônicos:
Se a instalação tiver muitos inversores de frequência ou no-breaks, os capacitores podem entrar em ressonância paralela com o transformador. Nesses casos, é obrigatório utilizar **bancos de capacitores com indutores anti-harmônicos (reatores de dessintonia de $7\\%$ ou $14\\%$)**.`;
}

function generateSolarSizingResponse(userName: string, query: string): string {
  return `Olá, **${userName}**! Sou a **Eng.ª Sara IA**, especialista em dimensionamento e engenharia solar fotovoltaica para Moçambique:

### ☀️ SISTEMA SOLAR FOTOVOLTAICO (OFF-GRID & HÍBRIDO)

#### 1. Média de Horas de Sol Pleno (HSP) por Região em Moçambique:
* **Maputo / Matola / Gaza / Inhambane:** $5.2$ a $5.4\\,\\text{HSP}$
* **Beira / Manica / Tete / Zambézia:** $5.4$ a $5.8\\,\\text{HSP}$ (Tete possui uma das maiores irradiações do país)
* **Nampula / Nacala / Cabo Delgado / Niassa:** $5.3$ a $5.6\\,\\text{HSP}$

---

#### 2. Metodologia de Dimensionamento de 5.0 kWh/dia:
$$P_{\\text{painéis}} = \\frac{E_{\\text{diária}}}{\\text{HSP} \\cdot PR} = \\frac{5000\\,\\text{Wh}}{5.2 \\cdot 0.78} \\approx 1230\\,\\text{Wp} \\implies \\text{Adotar } 3 \\times 550\\,\\text{Wp} = 1650\\,\\text{Wp}$$

| Componente | Especificação Técnica Recomendada | Quantidade |
| :--- | :--- | :--- |
| **Painéis Fotovoltaicos** | Módulos Monocristalinos Tier-1 Half-Cell $550\\,\\text{Wp}$ | 3 a 4 Unidades |
| **Controlador de Carga / Inversor** | Inversor Híbrido Onda Pura $3.5\\,\\text{kW}$ ou $5.0\\,\\text{kW}$ com MPPT $100\\,\\text{A}$ | 1 Unidade |
| **Banco de Armazenamento** | Bateria Lítio Ferro Fosfato ($\\text{LiFePO}_4$) $48\\,\\text{V}$ $100\\,\\text{Ah}$ ($4.8\\,\\text{kWh}$ úteis) | 1 Módulo Rack/Parede |
| **String Box CC** | 2 Entradas CC com DPS $1000\\,\\text{V} + \\text{Fusíveis } 15\\,\\text{A gPV} + \\text{Chave Seccionadora}$ | 1 Conjunto completo |
| **Quadro CA** | Disjuntor Bipolar $25\\,\\text{A} + \\text{DPS } 275\\,\\text{V} + \\text{IDR } 30\\,\\text{mA}$ | 1 Conjunto completo |

---

#### 3. Baterias de Lítio (LiFePO4) vs Chumbo-Ácido / Gel:
* **Lítio LiFePO4:** $6000$ ciclos a $80\\%$ de profundidade de descarga (DoD). Vida útil de mais de 10 anos. Têm BMS interno que protege contra sobretensão e altas temperaturas.
* **Gel / AGM:** Cerca de $800$ a $1200$ ciclos a apenas $50\\%$ de DoD. Sensíveis ao calor excessivo de Moçambique, perdendo capacidade após 2 anos.`;
}

function generateHvacResponse(userName: string, query: string): string {
  return `Olá, **${userName}**! Sou a **Eng.ª Sara IA**. Segue a análise técnica para climatização e diagnóstico de equipamentos de ar condicionado:

### ❄️ ENGENHARIA DE CLIMATIZAÇÃO & DIAGNÓSTICO (EDM 220V)

#### 1. Cálculo Rápido de Carga Térmica (BTU/h):
$$Q_{\\text{total}} = (\\text{Área em } \\text{m}^2 \\times 650) + (\\text{Pessoas adicionais} \\times 600) + (\\text{Equipamentos elétricos} \\times 600)$$

| Dimensão do Ambiente | Capacidade Sugerida | Corrente Nominal ($220\\,\\text{V}$) | Disjuntor & Cabo Recomendado |
| :--- | :--- | :--- | :--- |
| **Até $12\\,\\text{m}^2$** (Quarto) | **$9.000\\,\\text{BTU/h}$** | $4.2\\,\\text{A}$ a $4.8\\,\\text{A}$ | Disjuntor $16\\,\\text{A}$ • Cabo $2.5\\,\\text{mm}^2$ |
| **De $13\\,\\text{m}^2$ a $20\\,\\text{m}^2$** (Sala/Gabinete) | **$12.000\\,\\text{BTU/h}$** | $5.5\\,\\text{A}$ a $6.5\\,\\text{A}$ | Disjuntor $16\\,\\text{A}$ • Cabo $2.5\\,\\text{mm}^2$ |
| **De $21\\,\\text{m}^2$ a $30\\,\\text{m}^2$** (Escritório) | **$18.000\\,\\text{BTU/h}$** | $8.0\\,\\text{A}$ a $10.0\\,\\text{A}$ | Disjuntor $20\\,\\text{A}$ • Cabo $4.0\\,\\text{mm}^2$ |
| **De $31\\,\\text{m}^2$ a $45\\,\\text{m}^2$** (Espaço Aberto) | **$24.000\\,\\text{BTU/h}$** | $11.0\\,\\text{A}$ a $13.5\\,\\text{A}$ | Disjuntor $25\\,\\text{A}$ • Cabo $4.0\\,\\text{mm}^2$ |

---

#### 2. Procedimento de Vácuo Obrigatório (Normas ASHRAE / IEC):
* **Bomba de Vácuo de Duplo Estágio:** Descer a pressão abaixo de **$500\\,\\mu\\text{mHg}$ (microns)**.
* **Teste de Estanqueidade:** Desligar a bomba e aguardar 15 minutos. Se subir e estabilizar abaixo de 1000 microns, indica umidade residual sendo evaporada; se subir continuamente até a pressão atmosférica, indica fuga real na flange de cobre.
* **Proibição de Expurgar com Gás:** A purga com o refrigerante da condensadora não retira a umidade interna, gerando ácido fluorídrico e queima precoce do compressor.`;
}

function generatePricingResponse(userName: string, query: string): string {
  return `Olá, **${userName}**! Apresento a **Tabela Prática Referencial de Serviços Técnicos e Mão de Obra da TécnicaMZ Pro em Moçambique (Meticais - MZN)**:

### 💼 TABELA DE PREÇOS TÉCNICOS & MÃO DE OBRA (MZN)

| Serviço Eletrotécnico | Faixa em Maputo / Matola | Faixa Beira / Nampula / Tete | Critério Técnico |
| :--- | :--- | :--- | :--- |
| **Ponto de Iluminação Simples** | **$350 - 500\\,\\text{MZN}$** | **$400 - 600\\,\\text{MZN}$** | Fiação, tubagem e aparelho |
| **Ponto de Tomada Geral (TUG)** | **$450 - 650\\,\\text{MZN}$** | **$500 - 750\\,\\text{MZN}$** | Fio $2.5\\,\\text{mm}^2$ com terra individual |
| **Ponto de Carga Especial (TUE)** | **$800 - 1.200\\,\\text{MZN}$** | **$900 - 1.400\\,\\text{MZN}$** | Chuveiro, AC ou termoacumulador |
| **Montagem de QGBT Monofásico (até 8 disjuntores)** | **$3.500 - 5.500\\,\\text{MZN}$** | **$4.000 - 6.500\\,\\text{MZN}$** | Com barramento tipo pente e identificação |
| **Montagem de QGBT Trifásico Industrial** | **$8.000 - 16.000\\,\\text{MZN}$** | **$9.500 - 18.000\\,\\text{MZN}$** | Equilíbrio de fases e DPS Classe II |
| **Instalação de AC Split (9.000 a 12.000 BTU)** | **$2.500 - 4.000\\,\\text{MZN}$** | **$3.000 - 4.500\\,\\text{MZN}$** | Inclui vácuo com bomba e suporte |
| **Medição de Malha de Terra com Telurômetro** | **$3.000 - 6.000\\,\\text{MZN}$** | **$3.500 - 7.000\\,\\text{MZN}$** | Relatório técnico com laudo assinado |
| **Instalação de Sistema Solar Residencial (até 3kW)** | **$15.000 - 28.000\\,\\text{MZN}$** | **$18.000 - 32.000\\,\\text{MZN}$** | Painéis, inversor, baterias e caixas CC/CA |
| **Diagnóstico de Curto-Circuito / Visita Técnica** | **$1.000 - 1.800\\,\\text{MZN}$** | **$1.200 - 2.000\\,\\text{MZN}$** | Abatível se o serviço for contratado |

---

*Dica da Eng.ª Sara:* Lembre-se de adicionar entre **$10\\%$ e $15\\%$** para consumíveis técnicos (fita isolante antichama, terminais ilhós, buchas e abraçadeiras).`;
}

function generateTransformersAndGeneratorsResponse(userName: string, query: string): string {
  return `Olá, **${userName}**! Sou a **Eng.ª Sara IA**. Aqui estão as instruções técnicas para transformadores de distribuição e grupos geradores:

### 🏭 TRANSFORMADORES & GRUPOS GERADORES (EDM)

#### 1. Transformadores de Distribuição (MT / BT - Ex: 11kV/33kV para 380V/220V):
* **Grupo de Ligação Típico EDM:** **Dyn11** (Primário em Triângulo a MT, Secundário em Estrela com Neutro acessível aterrado na BT, defasamento de $30^\\circ$).
* **Relação de Corrente Secundária Trifásica:**
  $$I_{\\text{sec}} = \\frac{S_{\\text{kVA}}}{\\sqrt{3} \\cdot V_L} = \\frac{S_{\\text{kVA}}}{\\sqrt{3} \\cdot 0.38} \\approx S_{\\text{kVA}} \\times 1.52$$
  *Ex:* Transformador de $100\\,\\text{kVA}$ fornece $I_n \\approx 152\\,\\text{A}$ por fase.
  *Ex:* Transformador de $250\\,\\text{kVA}$ fornece $I_n \\approx 380\\,\\text{A}$ por fase.

---

#### 2. Quadro de Comutação Automática de Rede (ATS / QTA):
* **Encravamento Mecânico Obrigatório:** É mandatório o uso de travamento mecânico físico entre o contator da EDM e o do gerador para impedir qualquer possibilidade de alimentação reversa na rede da concessionária.
* **Sequência de Controle:**
  1. Falha de tensão da EDM (subtensão $< 180\\,\\text{V}$ por mais de $3\\,\\text{s}$).
  2. Sinal de partida do motor do gerador (até 3 tentativas).
  3. Estabilização de tensão e frequência ($50\\,\\text{Hz} \\pm 2\\%$) por $15\\,\\text{s}$.
  4. Fechamento do contator do gerador e transferência da carga.
  5. Retorno da EDM: temporizador de retransferência de $60\\,\\text{s}$ e arrefecimento do gerador por $120\\,\\text{s}$.`;
}

function generateFaultDiagnosticResponse(userName: string, query: string): string {
  return `Olá, **${userName}**! Sou a **Eng.ª Sara IA**. Vamos ao roteiro prático e metódico para localização de defeitos elétricos:

### 🔍 GUIA METÓDICO DE DIAGNÓSTICO DE AVARIAS ELÉTRICAS

| Sintoma Observado | Causa Mais Provável em Moçambique | Teste com Multímetro / Ação Corretiva |
| :--- | :--- | :--- |
| **Disjuntor desarma instantaneamente ao armar** | Curto-circuito franco entre Fase e Neutro ou Fase e Terra | Com circuito desenergizado, medir resistência em $\\Omega$ entre F e N. Se for próxima de $0\\,\\Omega$, isole os troços até encontrar o ponto em curto. |
| **Disjuntor desarma após 5 a 20 minutos** | Sobrecarga térmica contínua ($I_b > I_n$) ou borne frouxo aquecendo o bimetal | Medir corrente com Alicate Amperímetro. Verificar aperto do parafuso com chave dinamométrica. |
| **IDR desarma, mas disjuntores permanecem armados** | Fuga de corrente à terra superior a $30\\,\\text{mA}$ | Desligue todos os disjuntores do IDR. Arme o IDR e vá ligando um a um até identificar o circuito com fuga. |
| **Lâmpadas queimando rápido / Tensão de 270V a 380V** | **Neutro Partido ou Flutuante** na rede ou no poste EDM | Perigo grave! Meça F-N de todas as fases. Se uma der 150V e outra 280V, desligue o geral imediatamente e acione a EDM. |
| **Motor elétrico ronca, esquenta e não roda** | Falta de uma das 3 fases (operação bifásica) | Medir tensão entre fases: R-S, S-T, R-T (todas devem dar $380\\,\\text{V} \\pm 10\\%$). |

---

*Regra de Ouro da Segurança:* Sempre confirme a ausência de tensão nos condutores com detector de tensão ou multímetro CAT III/IV antes de tocar nos bornes!`;
}

function generateAcademyLessonResponse(userName: string, ctx: any, query: string): string {
  return `Olá, **${userName}**! Identifiquei a sua dúvida sincronizada com a **${ctx.courseTitle || 'Minha Academia Técnica'}**.

### ⚡ SARA IA | ANÁLISE NORMATIVA APROFUNDADA
* **Tópico / Lição:** \`${ctx.lessonTitle || 'Tópico de Estudo'}\` (${ctx.lessonCode || 'AULA-PRO'})
* **Norma Técnica de Referência:** **${ctx.norma || 'IEC 60364 / EDM'}**
* **Módulo:** ${ctx.moduleTitle || 'Módulo Especializado'}

---

#### 1. Princípio de Funcionamento & Requisitos Mandatórios
O elemento analisado nesta lição é essencial para a segurança, seletividade e continuidade operacional em instalações elétricas na rede nacional de Moçambique ($220\\,\\text{V}$ monofásica e $380\\,\\text{V}$ trifásica a $50\\,\\text{Hz}$).

| Parâmetro Técnico | Especificação Mandatória EDM/IEC | Critério de Aceitação em Moçambique |
| :--- | :--- | :--- |
| **Tensão Nominal ($U_n$)** | $220\\,\\text{V}$ (F+N) / $380\\,\\text{V}$ (3F) | Variação tolerada: $\\pm 10\\%$ ($198\\,\\text{V} - 242\\,\\text{V}$) |
| **Frequência da Rede** | $50\\,\\text{Hz} \\pm 1\\%$ | Estabilidade EDM |
| **Resistência de Isolamento** | $\\ge 1.0\\,\\text{M}\\Omega$ ($500\\,\\text{V}$ CC com Megger) | Obrigatório antes de qualquer energização |
| **Sensibilidade Diferencial** | $I_{\\Delta n} \\le 30\\,\\text{mA}$ | Proteção humana em zonas úmidas |

---

#### 2. Procedimento de Instalação e Testes Recomendados:
1. **Desenergização e Bloqueio (LOTO):** Isolar o circuito no corte geral e verificar a ausência de tensão com multímetro calibrado CAT III/IV.
2. **Conexão e Torque:** Utilizar terminais tipo ilhós em condutores multifilares de cobre. Aplicar aperto com chave dinamométrica ($2.0\\,\\text{N}\\cdot\\text{m}$ a $2.5\\,\\text{N}\\cdot\\text{m}$).
3. **Ensaio de Malha de Terra:** Assegurar que o condutor de proteção (PE verde/amarelo) tenha resistência total inferior a $10\\,\\Omega$ em relação à terra de referência.`;
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
3. **Reaperto Dinamométrico:** Aplicar torque de $2.0\\,\\text{N}\\cdot\\text{m}$ a $2.5\\,\\text{N}\\cdot\\text{m}$ em todos os parafusos dos disjuntores.`;
}

function generateGeneralConsultingResponse(userName: string, role: string, query: string): string {
  return `Olá, **${userName}**! Sou a **Eng.ª Sara IA**, sua consultora de engenharia eletrotécnica na **TécnicaMZ Pro**.

Estou programada com as normas oficiais da **EDM (Electricidade de Moçambique: 220V/380V a 50Hz)**, catálogos de fabricantes industriais e a tabela prática de preços em Meticais (MZN).

---

### 🛠️ POSSO AJUDAR VOCÊ IMEDIATAMENTE COM:
1. **Dimensionamento de Condutores & Disjuntores:** Cálculo de corrente de projeto ($I_b$), capacidade ($I_z$) e queda de tensão ($\\Delta V\\%$).
2. **Aterramento e Proteções:** Esquemas TT/TN-S, dimensionamento de malha de terra ($R \\le 10\\,\\Omega$), DPS Classe II e IDRs de $30\\,\\text{mA}$.
3. **Motores & Acionamentos:** Ligações Estrela-Triângulo, soft-starters, inversores VFD e comandos elétricos.
4. **Sistemas Solares Fotovoltaicos:** Painéis, baterias de Lítio $\\text{LiFePO}_4$, controladores MPPT e inversores.
5. **Climatização:** Cálculo térmico em BTU/h e procedimentos de vácuo.
6. **Preços e Orçamentos (MZN):** Valores de mão de obra para propostas técnicas em Moçambique.

Pode enviar a sua questão técnica específica ou os dados de carga (Watts, Volts ou distância) para um cálculo imediato!`;
}
