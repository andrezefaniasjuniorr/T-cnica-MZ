import React, { useState } from 'react';
import {
  Sparkles,
  Wrench,
  HelpCircle,
  TrendingUp,
  Lightbulb,
  CheckCircle2,
  AlertTriangle,
  Award,
  Zap,
  Bookmark,
  Share2,
  ThumbsUp,
  ChevronRight,
  Flame,
  MessageSquare,
  ShieldCheck,
  RefreshCw,
  Clock,
  ArrowRight
} from 'lucide-react';
import { AcademyLocalData } from '../../types/academy';
import { saveAcademyLocalData } from '../../services/saraAcademyService';
import { useAuth } from '../../context/AuthContext';

export interface DailyHackItem {
  id: string;
  category: 'macgyver' | 'quiz_daily' | 'business';
  title: string;
  tag: string;
  readTimeMinutes: number;
  xpReward?: number;
  highlightSummary: string;
  fullProcedure: string[];
  safetyAlert?: string;
  proTip: string;
  likesCount: number;
  // Campos específicos de Quiz
  quizQuestion?: string;
  quizOptions?: { id: string; text: string; isCorrect: boolean; feedback: string }[];
  explanation?: string;
}

const INITIAL_HACKS: DailyHackItem[] = [
  // ================= MACETES MACGYVER DE CAMPO =================
  {
    id: 'hack_1_linha_pesca_tubo',
    category: 'macgyver',
    title: 'Puxar Fiação em Tubulação Entupida ou Cheia de Curvas',
    tag: 'Macete de Eletroduto',
    readTimeMinutes: 3,
    xpReward: 35,
    highlightSummary: 'A guia de nylon trava nas curvas ou não passa por sujeira de obra? Use o método pneumático do "êmbolo de sacola com linha de pesca".',
    fullProcedure: [
      '1. Pegue uma linha de pesca de nylon resistente (ou cordão de algodão fino e leve) e amarre na ponta um pedacinho de sacola plástica formando uma pequena almofada/bolinha (êmbolo).',
      '2. Coloque a bolinha plástica na entrada do eletroduto na caixa de passagem inicial.',
      '3. Vá até a caixa de destino e conecte o bocal de um aspirador de pó comum (ou sopre com ar comprimido na entrada).',
      '4. Ligue o aspirador: o fluxo de sucção puxa a bolinha de plástico com a linha por dentro de todas as curvas em menos de 5 segundos!',
      '5. Com a linha de pesca do outro lado, amarre a guia de aço ou diretamente os cabos lubrificados com vaselina industrial (nunca detergente comum, que resseca e ataca o PVC).'
    ],
    safetyAlert: 'Nunca use sabão ou detergente de cozinha como lubrificante; com o tempo o sal e compostos químicos degradam a capa isolante dos cabos de PVC.',
    proTip: 'Se não tiver aspirador em obra sem luz, use um arame galvanizado dobrado em forma de anzol na ponta girando no sentido horário para enlaçar a linha de nylon.',
    likesCount: 148
  },
  {
    id: 'hack_2_parafuso_borne_espanado',
    category: 'macgyver',
    title: 'Recuperar Rosca Espanada em Borne de Disjuntor ou Tomada',
    tag: 'Salvação de Quadro',
    readTimeMinutes: 2,
    xpReward: 30,
    highlightSummary: 'O parafuso do disjuntor espanou e o cliente não tem disjuntor reserva no sábado à noite? Veja como fixar com segurança provisória.',
    fullProcedure: [
      '1. Desenergize o circuito principal no disjuntor a montante (segurança absoluta).',
      '2. Retire o parafuso com defeito usando um elástico largo pressionado entre a fenda da chave e a cabeça do parafuso para obter tração.',
      '3. Insira 2 a 3 fios finos de cobre desencapado (de um cabo flexível 1,5 mm²) dobrados em "U" dentro do orifício da rosca do borne.',
      '4. Reaperte o parafuso: os filamentos de cobre preenchem as folgas da rosca mecânica e criam contato elétrico de alta condutividade sem folga.',
      '5. Agende com o cliente a substituição definitiva do componente na primeira oportunidade útil.'
    ],
    safetyAlert: 'Solução provisória de campo para não deixar o cliente no escuro. Componentes com rosca frouxa geram aquecimento por efeito Joule se mal apertados.',
    proTip: 'Sempre confira com chave de fenda dinamométrica ou torque firme se o cabo não sai puxando com as mãos.',
    likesCount: 112
  },
  {
    id: 'hack_3_teste_fase_sem_voltimetro',
    category: 'macgyver',
    title: 'Identificar Fase Viva e Neutro com Lâmpada de Teste Segura',
    tag: 'Diagnóstico Rápido',
    readTimeMinutes: 3,
    xpReward: 40,
    highlightSummary: 'Sem multímetro ou bateria fraca no testador? Crie um detector bipolar infalível de fase, neutro e terra com materiais de obra.',
    fullProcedure: [
      '1. Utilize um bocal simples com lâmpada incandescente ou halógena de 15W/25W (230V) com duas pontas de prova isoladas com cabos de 1 mm² de cores distintas.',
      '2. Teste A (Fase com Neutro): A lâmpada acende com brilho total e vigoroso (230V nominal).',
      '3. Teste B (Fase com Terra funcional PE): A lâmpada acende forte e desarma o IDR/DDR instantaneamente (se o IDR estiver atuando em 30mA).',
      '4. Teste C (Neutro com Terra): A lâmpada não acende em hipótese alguma (0V). Se acender fraca, há neutro interrompido ou retorno perigoso!'
    ],
    safetyAlert: 'Use soquete isolado de cerâmica ou baquelite de qualidade. Nunca use fios com pontas desencapadas longas para evitar contato acidental.',
    proTip: 'A lâmpada de teste é imune a tensões fantasmas (tensão induzida por acoplamento capacitivo) que costumam enganar multímetros digitais de alta impedância.',
    likesCount: 96
  },
  {
    id: 'hack_4_compressor_ac_travado',
    category: 'macgyver',
    title: 'Destravar Compressor de Ar Condicionado no Campo',
    tag: 'HVAC & Frio',
    readTimeMinutes: 4,
    xpReward: 45,
    highlightSummary: 'Compressor de split tenta partir, ronca alto e desarma o protetor térmico? Tática do capacitor de arranque auxiliar.',
    fullProcedure: [
      '1. Verifique primeiro a tensão na borneira com o compressor tentando partir (não pode cair abaixo de 207V em rede de 230V).',
      '2. Descarregue o capacitor original com um resistor de 20kΩ para evitar choques.',
      '3. Ligue em paralelo momentâneo um kit de partida rápida (Hard Start / capacitor auxiliar de 150-200 µF com relé potencial).',
      '4. Se não tiver kit, dê um choque mecânico lateral controlado com maço de borracha na carcaça metálica inferior do compressor durante o instante exato da tentativa de partida.',
      '5. O pulso de torque extra associado à vibração rompe a inércia do pistão travado por borra de óleo ou dilatação térmica.'
    ],
    safetyAlert: 'Nunca use marreta de ferro direta na lataria do compressor para não fissurar o casco hermético sob pressão de gás refrigerante.',
    proTip: 'Após destravar, meça a corrente RLA com alicate amperímetro. Se a corrente nominal permanecer acima da placa, o enrolamento já sofreu danos de verniz.',
    likesCount: 164
  },

  // ================= QUIZ & DESAFIOS DIÁRIOS =================
  {
    id: 'quiz_daily_1_neutro_partido',
    category: 'quiz_daily',
    title: 'Desafio do Dia: Apagão Parcial e Queima de Aparelhos',
    tag: 'Desafio Situacional',
    readTimeMinutes: 2,
    xpReward: 50,
    highlightSummary: 'Um cliente comercial em Maputo relata que lâmpadas de uma sala ficaram super fracas enquanto em outra sala lâmpadas explodiram com TV queimada.',
    fullProcedure: [],
    proTip: 'Casos com sobretensão em uma fase e subtensão em outra sempre apontam para a mesma anomalia na alimentação trifásica.',
    likesCount: 205,
    quizQuestion: 'Qual é o diagnóstico exato para o fenômeno onde umas fases medem 130V e outras medem 350V na mesma instalação alimentada a 3F+N 400V/230V?',
    quizOptions: [
      { id: 'A', text: 'Sobrecarga de corrente no disjuntor principal.', isCorrect: false, feedback: 'Sobrecarga desarmaria o disjuntor térmico ou baixaria uniformemente a tensão por queda no cabo.' },
      { id: 'B', text: 'Rompimento do condutor de Neutro a montante com cargas desbalanceadas (Flutuação do Neutro).', isCorrect: true, feedback: 'EXATO! Com o neutro rompido, o ponto de estrela flutua. As cargas menores recebem quase a tensão de linha (até 400V) queimando aparelhos, enquanto cargas pesadas recebem subtensão.' },
      { id: 'C', text: 'Curto-circuito entre fase e terra na carcaça do quadro.', isCorrect: false, feedback: 'Curto fase-terra provocaria atuação do disjuntor ou do IDR.' },
      { id: 'D', text: 'Falta de haste de aterramento no quadro do cliente.', isCorrect: false, feedback: 'A ausência do aterramento afeta a segurança humana e proteção de surto, mas não gera flutuação de 350V em regime permanente.' }
    ],
    explanation: 'A quebra do neutro em sistemas trifásicos com cargas monofásicas desbalanceadas desloca o ponto neutro virtual. O circuito passa a ser alimentado por 400V entre fases através da impedância em série dos aparelhos das duas salas.'
  },
  {
    id: 'quiz_daily_2_idr_desarmando',
    category: 'quiz_daily',
    title: 'Desafio do Dia: O Mistério do IDR que Desarma Chovendo',
    tag: 'Proteções IEC',
    readTimeMinutes: 2,
    xpReward: 50,
    highlightSummary: 'O interruptor diferencial residual (IDR 30mA) só desarma 20 minutos após começar uma chuva forte, mesmo com as luzes do jardim desligadas.',
    fullProcedure: [],
    proTip: 'Lembre-se: o interruptor simples secciona a Fase, mas e o Neutro?',
    likesCount: 178,
    quizQuestion: 'Por que o IDR desarma na chuva mesmo com as lâmpadas do jardim apagadas no interruptor simples?',
    quizOptions: [
      { id: 'A', text: 'Porque o interruptor simples só corta a Fase; a umidade da chuva penetrou na luminária e vazou corrente do Neutro para o Terra!', isCorrect: true, feedback: 'PERFEITO! Como o interruptor só corta a fase, o condutor de neutro continua ligado à luminária molhada. Correntes de neutro escapam para o solo úmido, gerando desbalanço no toroidal do IDR!' },
      { id: 'B', text: 'Porque a água da chuva conduz eletricidade estática pelas paredes até o quadro.', isCorrect: false, feedback: 'Eletricidade estática da chuva não possui densidade de corrente de 30mA a 50Hz para comover o toroide magnético do IDR.' },
      { id: 'C', text: 'Porque o disjuntor geral esquentou com o vapor de água.', isCorrect: false, feedback: 'A temperatura do ar da chuva costuma diminuir a temperatura do quadro elétrico.' },
      { id: 'D', text: 'O IDR está danificado e precisa ser eliminado da instalação.', isCorrect: false, feedback: 'NUNCA elimine o IDR! O IDR está cumprindo fielmente seu papel ao alertar sobre uma fuga real de neutro para o solo.' }
    ],
    explanation: 'Em instalações onde a umidade atinge soquetes externos, a corrente que circula no neutro de outros circuitos da casa encontra caminho para o solo através da luminária molhada, ultrapassando os 30mA de disparo.'
  },

  // ================= IDEIAS & SACADAS DE NEGÓCIOS =================
  {
    id: 'biz_1_regra_tres_orcamentos',
    category: 'business',
    title: 'A Técnica dos 3 Pacotes de Orçamento para Fechar 90% Mais Serviços',
    tag: 'Precificação & Vendas',
    readTimeMinutes: 3,
    xpReward: 40,
    highlightSummary: 'Nunca apresente um único preço fixo ao cliente residencial ou comercial. Dê o poder de escolha com 3 opções calibradas.',
    fullProcedure: [
      '1. Pacote Econômico (Básico): Resolve o problema pontual imediato sem melhorias. Margem calculada justa.',
      '2. Pacote Recomendado (O Mais Vendido): Resolve o problema + substitui bornes desgastados + aplica anilhas de identificação + garantia estendida de 6 meses.',
      '3. Pacote Premium (Total Segurança): Tudo do Recomendado + instalação de DPS contra raios + reorganização completa com pente de barramento e laudo fotográfico em PDF.',
      '4. Psicologia de Venda: 70% dos clientes escolhem o pacote intermediário porque ninguém quer parecer "pão-duro" escolhendo o básico nem gastar o máximo do premium!'
    ],
    proTip: 'Use o módulo Gerador de Orçamentos do TécnicaMZ Pro com PDF profissional para enviar os 3 pacotes direto no WhatsApp do cliente com chave M-Pesa.',
    likesCount: 220
  },
  {
    id: 'biz_2_cobrar_diagnostico',
    category: 'business',
    title: 'Como Cobrar Taxa de Visita e Diagnóstico Sem Perder o Cliente',
    tag: 'Valorização Técnica',
    readTimeMinutes: 3,
    xpReward: 35,
    highlightSummary: 'Cansado de gastar combustível e 2 horas descobrindo o curto-circuito para o cliente dizer "obrigado, depois eu ligo"?',
    fullProcedure: [
      '1. Explicação Didática: "Dona Maria, nosso deslocamento com ferramentas especializadas de diagnóstico (câmera térmica e megôhmetro) tem a taxa de 500 MT."',
      '2. O Pulo do Gato: "Se a senhora aprovar o orçamento do reparo comigo hoje, esses 500 MT são 100% ABATIDOS do valor final da mão de obra!"',
      '3. Resultado Psicológico: O cliente não sente que está perdendo dinheiro; ele enxerga o diagnóstico como um crédito garantido na execução do serviço.',
      '4. Filtro de Curiosos: Quem recusa essa condição normalmente só queria uma consultoria grátis para fazer com o vizinho sem conhecimento.'
    ],
    proTip: 'Tenha sempre um recibo timbrado ou nota de diagnóstico pronta no celular para passar seriedade imediata.',
    likesCount: 189
  },
  {
    id: 'biz_3_checklist_manutencao_condominios',
    category: 'business',
    title: 'Contratos Mensais Recorrentes: O Segredo da Renda Previsível',
    tag: 'Contratos & Gestão',
    readTimeMinutes: 4,
    xpReward: 45,
    highlightSummary: 'Pare de viver na montanha-russa de "festa ou fome". Condomínios e padarias precisam de técnicos preventivos todo mês.',
    fullProcedure: [
      '1. Mapeie 10 condomínios ou comércios no seu bairro com bombas d\'água, geradores e quadros de comando.',
      '2. Ofereça uma Inspeção Preventiva Sem Compromisso com relatório termográfico e medição de corrente de compressores.',
      '3. Mostre os riscos: "Se essa contatora da bomba colar à noite, o prédio de 12 andares fica sem água até amanhã cedo e a bomba pode queimar (custo de 35.000 MT)."',
      '4. Proposta Mensal: Ofereça 2 visitas por mês de 1 hora para reaperto de bornes e teste de boias por 5.000 a 8.000 MT/mês. Com 5 contratos você garante 30.000 MT fixos todo mês!'
    ],
    proTip: 'Apresente-se com camiseta limpa, calçado de segurança e crachá do TécnicaMZ Pro com QR Code verificado.',
    likesCount: 245
  }
];

// Perguntas interativas de emergência para Sara IA
const EMERGENCY_PROMPTS = [
  { id: 'fio_travado', label: 'Eletroduto travado', query: 'Sara, o que fazer quando a fiação não passa de jeito nenhum em um eletroduto com muitas curvas?' },
  { id: 'fio_sem_cor', label: 'Cabos pretos sem cor', query: 'Sara, estou em uma reforma com todos os fios pretos sem cor normativa. Como identificar Fase, Neutro e Retornos com segurança?' },
  { id: 'rosca_espanada', label: 'Borne espanado', query: 'Sara, a rosca do parafuso do disjuntor espanou na casa do cliente à noite. Qual o macete seguro de campo?' },
  { id: 'motor_ronca', label: 'Motor roncando', query: 'Sara, motor trifásico ronca alto mas não roda ao fechar a contatora. O que verificar nos primeiros 30 segundos?' },
  { id: 'ac_congelando', label: 'Ar congelando tubo', query: 'Sara, ar condicionado split congelando o tubo fino de alta pressão. Falta gás ou serpentina suja?' }
];

interface SaraDailyHacksFeedProps {
  academyData: AcademyLocalData;
  onUpdateAcademyData: (data: AcademyLocalData) => void;
  baseFontSize?: number;
}

export const SaraDailyHacksFeed: React.FC<SaraDailyHacksFeedProps> = ({
  academyData,
  onUpdateAcademyData,
  baseFontSize = 15
}) => {
  const { currentUser } = useAuth();
  const [activeFilter, setActiveFilter] = useState<'all' | 'macgyver' | 'quiz_daily' | 'business'>('all');
  const [completedQuizIds, setCompletedQuizIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('sara_daily_quizzes_completed');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [savedHacks, setSavedHacks] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('sara_saved_hacks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [likedHacks, setLikedHacks] = useState<Record<string, boolean>>({});
  const [aiAssistantPrompt, setAiAssistantPrompt] = useState<string | null>(null);
  const [aiAssistantResponse, setAiAssistantResponse] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  // Filtragem dos itens
  const filteredHacks = INITIAL_HACKS.filter(item => {
    if (activeFilter === 'all') return true;
    return item.category === activeFilter;
  });

  // Handler para responder quiz diário
  const handleSelectQuizAnswer = (hackId: string, optionId: string) => {
    if (completedQuizIds.includes(hackId)) return;
    setSelectedAnswers(prev => ({ ...prev, [hackId]: optionId }));

    const hack = INITIAL_HACKS.find(h => h.id === hackId);
    if (!hack || !hack.quizOptions) return;

    const opt = hack.quizOptions.find(o => o.id === optionId);
    if (opt?.isCorrect) {
      // Concede XP e persiste
      const reward = hack.xpReward || 50;
      const updatedXp = (academyData.xp || 0) + reward;
      const updated: AcademyLocalData = {
        ...academyData,
        xp: updatedXp
      };
      onUpdateAcademyData(updated);
      saveAcademyLocalData(updated);

      const newCompleted = [...completedQuizIds, hackId];
      setCompletedQuizIds(newCompleted);
      try {
        localStorage.setItem('sara_daily_quizzes_completed', JSON.stringify(newCompleted));
      } catch {}
    }
  };

  // Toggle salvar
  const toggleSaveHack = (hackId: string) => {
    let next: string[];
    if (savedHacks.includes(hackId)) {
      next = savedHacks.filter(id => id !== hackId);
    } else {
      next = [...savedHacks, hackId];
    }
    setSavedHacks(next);
    try {
      localStorage.setItem('sara_saved_hacks', JSON.stringify(next));
    } catch {}
  };

  // Toggle like
  const toggleLikeHack = (hackId: string) => {
    setLikedHacks(prev => ({ ...prev, [hackId]: !prev[hackId] }));
  };

  // Simular consulta rápida à Sara IA para macete de emergência
  const handleAskSaraEmergencia = (query: string, label: string) => {
    setIsAiLoading(true);
    setAiAssistantPrompt(label);
    setAiAssistantResponse(null);

    setTimeout(() => {
      let resp = '';
      if (label.includes('Eletroduto')) {
        resp = 'Macete de Campo Sara IA: Aplique ar comprimido ou aspirador com êmbolo de sacola plástica na ponta de uma linha de nylon. Não force com a guia de aço para não quebrar a curva de PVC dentro da alvenaria. Use lubrificante neutro de base vegetal ou vaselina técnica.';
      } else if (label.includes('sem cor')) {
        resp = 'Procedimento Seguro Sara IA: Desligue todos os interruptores. Use lâmpada de teste para identificar a Fase viva em relação a uma haste de terra ou estrutura metálica confiável. Marque imediatamente a Fase com fita isolante vermelha/castanha antes de fechar o quadro!';
      } else if (label.includes('Borne')) {
        resp = 'Instrução Rápida Sara IA: Insira filamentos finos de cabo de cobre 1,5 mm² dobrados em "U" no furo espanado para preencher a rosca. Ao apertar o parafuso, haverá torque firme e condução de alta amperagem até a troca do módulo.';
      } else if (label.includes('Motor')) {
        resp = 'Diagnóstico 30s Sara IA: 1) Verifique se uma das 3 fases caiu (falta de fase faz o motor roncar e queimar por corrente dupla nas outras duas bobinas). 2) Meça se o rotor está travado mecanicamente tentando girar o eixo manualmente com a máquina desenergizada.';
      } else {
        resp = 'Diagnóstico HVAC Sara IA: Tubo fino (linha de líquido) congelando indica falta severa de fluido refrigerante (fuga) ou restrição parcial no tubo capilar/válvula de expansão. Se o tubo grosso de sucção congelar, o problema é falta de ventilação ou filtro de ar imundo.';
      }
      setAiAssistantResponse(resp);
      setIsAiLoading(false);
    }, 450);
  };

  return (
    <div
      className="space-y-6"
      style={{ fontSize: `${Math.max(12, Math.min(22, baseFontSize))}px` }}
    >
      {/* ============================================================= */}
      {/* BANNER DE CABEÇALHO DO FEED DIÁRIO                           */}
      {/* ============================================================= */}
      <div className="p-4 sm:p-6 rounded-3xl bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0A0F1D] border border-blue-900/40 shadow-xl text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Atualizado Diariamente • Sara IA</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>+XP para o Ranking</span>
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Macetes de Campo, Desafios Diários & Negócios
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
            Soluções inteligentes estilo MacGyver para imprevistos de obra, perguntas rápidas com ganho de XP
            para subir no Ranking de Técnicos e sacadas financeiras para fechar mais orçamentos lucrativos em Moçambique.
          </p>

          {/* Atalhos Rápidos da Sara IA */}
          <div className="pt-2">
            <p className="text-[11px] font-bold text-slate-400 mb-2 flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              <span>Pedir Macete de Emergência Imediato à Sara IA:</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {EMERGENCY_PROMPTS.map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleAskSaraEmergencia(item.query, item.label)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-blue-600 text-slate-200 hover:text-white border border-slate-700 hover:border-blue-500 text-xs font-semibold transition active:scale-95 cursor-pointer shadow-xs"
                >
                  ⚡ {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Resposta Flutuante da Sara IA */}
          {(isAiLoading || aiAssistantResponse) && (
            <div className="mt-4 p-4 rounded-2xl bg-[#0B1329] border border-blue-500/40 animate-in fade-in duration-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xs font-black">
                    S
                  </div>
                  <span className="text-xs font-black text-blue-400 uppercase tracking-wider">
                    Sara IA • Macete para: {aiAssistantPrompt}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setAiAssistantResponse(null)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Fechar
                </button>
              </div>

              {isAiLoading ? (
                <div className="flex items-center gap-2 text-xs text-slate-400 py-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
                  <span>Consultando normas e macetes de campo...</span>
                </div>
              ) : (
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                  {aiAssistantResponse}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ============================================================= */}
      {/* SELETOR DE ABAS DO FEED                                       */}
      {/* ============================================================= */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        <button
          type="button"
          onClick={() => setActiveFilter('all')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition shrink-0 cursor-pointer flex items-center gap-2 ${
            activeFilter === 'all'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Todos ({INITIAL_HACKS.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('macgyver')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition shrink-0 cursor-pointer flex items-center gap-2 ${
            activeFilter === 'macgyver'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-500/20'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Wrench className="w-3.5 h-3.5 text-amber-500" />
          <span>Macetes MacGyver</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('quiz_daily')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition shrink-0 cursor-pointer flex items-center gap-2 ${
            activeFilter === 'quiz_daily'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Award className="w-3.5 h-3.5 text-emerald-500" />
          <span>Quiz & Desafios (+XP)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('business')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition shrink-0 cursor-pointer flex items-center gap-2 ${
            activeFilter === 'business'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5 text-purple-500" />
          <span>Sacadas de Negócios</span>
        </button>
      </div>

      {/* ============================================================= */}
      {/* LISTAGEM DOS CARDS DIDÁTICOS                                  */}
      {/* ============================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredHacks.map(item => {
          const isQuiz = item.category === 'quiz_daily';
          const isCompleted = completedQuizIds.includes(item.id);
          const currentAnswer = selectedAnswers[item.id];
          const isSaved = savedHacks.includes(item.id);
          const isLiked = !!likedHacks[item.id];

          return (
            <div
              key={item.id}
              className={`rounded-3xl border transition-all duration-200 p-5 flex flex-col justify-between shadow-xs hover:shadow-md ${
                isQuiz
                  ? 'bg-gradient-to-b from-white to-emerald-50/40 border-emerald-200'
                  : item.category === 'business'
                  ? 'bg-gradient-to-b from-white to-purple-50/40 border-purple-200'
                  : 'bg-gradient-to-b from-white to-amber-50/40 border-amber-200'
              }`}
            >
              {/* Topo do Card: Categoria, Tempo e XP */}
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                        item.category === 'macgyver'
                          ? 'bg-amber-100 text-amber-800 border-amber-300'
                          : item.category === 'quiz_daily'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-purple-100 text-purple-800 border-purple-300'
                      }`}
                    >
                      {item.tag}
                    </span>

                    <span className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{item.readTimeMinutes} min</span>
                    </span>
                  </div>

                  {item.xpReward && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-black">
                      <Zap className="w-3 h-3 text-amber-600 fill-amber-500" />
                      <span>+{item.xpReward} XP</span>
                    </span>
                  )}
                </div>

                {/* Título e Resumo */}
                <div>
                  <h3 className="text-base font-black text-slate-900 tracking-tight leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                    {item.highlightSummary}
                  </p>
                </div>

                {/* Procedimento passo a passo (se houver) */}
                {item.fullProcedure && item.fullProcedure.length > 0 && (
                  <div className="mt-3 p-3.5 rounded-2xl bg-slate-900 text-slate-200 space-y-2 border border-slate-800">
                    <p className="text-[11px] font-black text-amber-400 uppercase tracking-wider">
                      Passo a Passo Operacional:
                    </p>
                    <ul className="space-y-1.5">
                      {item.fullProcedure.map((step, idx) => (
                        <li key={idx} className="text-xs leading-relaxed text-slate-300">
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Alerta de Segurança */}
                {item.safetyAlert && (
                  <div className="flex items-start gap-2 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span className="font-semibold">{item.safetyAlert}</span>
                  </div>
                )}

                {/* Se for QUIZ: Exibir Pergunta e Opções Interativas */}
                {isQuiz && item.quizQuestion && item.quizOptions && (
                  <div className="mt-3 p-4 rounded-2xl bg-white border border-emerald-300 space-y-3 shadow-xs">
                    <div className="flex items-center gap-1.5 text-xs font-black text-emerald-800">
                      <HelpCircle className="w-4 h-4 text-emerald-600" />
                      <span>{item.quizQuestion}</span>
                    </div>

                    <div className="space-y-2">
                      {item.quizOptions.map(opt => {
                        const isChosen = currentAnswer === opt.id;
                        const showStatus = isChosen || isCompleted;

                        let btnStyle = 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100';
                        if (showStatus) {
                          if (opt.isCorrect) {
                            btnStyle = 'bg-emerald-100 border-emerald-500 text-emerald-950 font-bold ring-2 ring-emerald-400/30';
                          } else if (isChosen) {
                            btnStyle = 'bg-rose-100 border-rose-400 text-rose-950';
                          }
                        }

                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => handleSelectQuizAnswer(item.id, opt.id)}
                            disabled={isCompleted}
                            className={`w-full text-left p-3 rounded-xl border text-xs transition cursor-pointer flex items-start gap-2 ${btnStyle}`}
                          >
                            <span className="font-black min-w-[20px]">{opt.id})</span>
                            <span className="flex-1 leading-snug">{opt.text}</span>
                            {showStatus && opt.isCorrect && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 ml-1" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {isCompleted && item.explanation && (
                      <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs">
                        <span className="font-bold">Justificativa Normativa: </span>
                        {item.explanation}
                      </div>
                    )}
                  </div>
                )}

                {/* Dica de Ouro da Sara IA */}
                {item.proTip && (
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs">
                    <Lightbulb className="w-4 h-4 text-blue-600 shrink-0" />
                    <span className="font-bold">Dica da Sara: </span>
                    <span className="text-slate-700">{item.proTip}</span>
                  </div>
                )}
              </div>

              {/* Rodapé do Card: Ações Interativas */}
              <div className="pt-4 mt-4 border-t border-slate-200/80 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => toggleLikeHack(item.id)}
                  className={`flex items-center gap-1.5 text-xs font-bold transition px-2.5 py-1.5 rounded-xl cursor-pointer ${
                    isLiked ? 'bg-blue-100 text-blue-700' : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>{item.likesCount + (isLiked ? 1 : 0)} Útil</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleSaveHack(item.id)}
                    className={`p-2 rounded-xl border transition cursor-pointer ${
                      isSaved
                        ? 'bg-amber-100 border-amber-400 text-amber-800'
                        : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-100'
                    }`}
                    title={isSaved ? 'Salvo no Bloco de Campo' : 'Salvar macete'}
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-amber-600' : ''}`} />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: item.title,
                          text: item.highlightSummary,
                          url: window.location.href
                        }).catch(() => {});
                      }
                    }}
                    className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:bg-slate-100 transition cursor-pointer"
                    title="Compartilhar com colegas"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
