import { AcademyLesson, AcademyModule } from '../types/academy';

export interface FormattedFormula {
  label: string; // Nome da grandeza / parâmetro
  formula: string; // Expressão matemática
  unidade: string; // Unidade de medida (V, A, mm², kA, Hz, bar, etc.)
  quandoUsar: string; // Quando usar na prática no terreno
}

export interface FormattedFieldCase {
  localizacao: string; // Local em Moçambique
  cenario: string; // Cenário encontrado
  diagnostico: string; // Diagnóstico técnico com valor medido ou observado
  solucaoNormativa: string; // Solução aplicada conforme norma
}

export interface FormattedLesson {
  // Topo da Aula
  moduleIndex: number;
  totalModules: number;
  identification: string; // "Módulo X de 14 • Nome da disciplina"
  discipline: string;
  title: string;
  code: string;
  level: string;
  durationMinutes: number;
  objetivoPratico: string; // O que o aluno vai saber fazer ao final da aula na prática
  norma: string;
  ondeSeAplica: string; // QGBT, CCM, Subestação, Motor, etc.

  // Bloco A - Fundamento Técnico Essencial
  blocoA: {
    paragrafos: string[]; // Máximo 3 parágrafos curtos
  };

  // Bloco B - Fórmulas e Parâmetros de Dimensionamento
  blocoB: {
    hasCalculo: boolean;
    formulas: FormattedFormula[];
  };

  // Bloco C - Procedimentos Operacionais, Segurança e Boas Práticas
  blocoC: {
    procedimentos: string[];
  };

  // Bloco D - Caso Real de Campo em Moçambique e Diagnóstico
  blocoD: FormattedFieldCase;
}

/**
 * Mapeamento canônico das 14 disciplinas de Eletrotécnica Industrial
 */
const CANONICAL_ELECTRICAL_DISCIPLINES: Record<number, { title: string; aplicacao: string }> = {
  1: {
    title: 'Princípios da Física Elétrica & Leis Fundamentais',
    aplicacao: 'Bancadas de Ensaio, Multímetros CAT III/IV, Termografia e Painéis Gerais'
  },
  2: {
    title: 'Instrumentação, Medição e Grandezas Elétricas',
    aplicacao: 'Aferição em Quadros Elétricos, Multímetros, Megômetros e Alicates de Fuga'
  },
  3: {
    title: 'Condutores, Linhas Elétricas e Canalizações',
    aplicacao: 'Eletrocalhas, Eletrodutos PEAD/PVC, QGBT e Barramentos Gerais'
  },
  4: {
    title: 'Aparelhagem de Corte, Proteção e Seccionamento',
    aplicacao: 'Quadros Gerais QGBT, Caixas de Proteção, Painéis de Distribuição e Chaves Seccionadoras'
  },
  5: {
    title: 'Instalações Elétricas Prediais & Comandos',
    aplicacao: 'Quadros de Distribuição Parciais, Iluminação, Tomadas TUG/TUE e Prumadas Prediais'
  },
  6: {
    title: 'Proteções Elétricas & Normas IEC (IEC 60364)',
    aplicacao: 'QGBT, Painéis de Potência, Malha de Aterramento TT/TN-S e Caixas de Disjuntores'
  },
  7: {
    title: 'Eletrônica Analógica, Digital & Fontes de Alimentação (SMPS)',
    aplicacao: 'Fontes Chaveadas SMPS, Drivers Industriais, Módulos Retificadores e Placas de Controle'
  },
  8: {
    title: 'Motores Elétricos, Automação & Controladores Lógicos (PLCs)',
    aplicacao: 'CCM (Centro de Controle de Motores), Painéis VFD, Soft-Starters e Racks CLP'
  },
  9: {
    title: 'Instalações Elétricas Industriais & Redes de Potência',
    aplicacao: 'Busways (Barramentos Blindados), Cabines de Força, Bancos de Capacitores e ATS de Geradores'
  },
  10: {
    title: 'Manutenção, Inspeção Técnica & Ensaios Normativos',
    aplicacao: 'Bloqueio LOTO, Ensaios de Isolação com Megômetro, Termografia e Comissionamento'
  },
  11: {
    title: 'Média Tensão, Redes de Distribuição & Postos de Transformação (PT)',
    aplicacao: 'Postos de Transformação (PTs), Celas MT 11kV/22kV/33kV, Muflas e Cabines de Entrada'
  },
  12: {
    title: 'Climatização, HVAC & Refrigeração (Norma EN 378)',
    aplicacao: 'Sistemas Centrais HVAC, Chillers, VRF, Fancoils e Compressores Industriais'
  },
  13: {
    title: 'Segurança Eletrônica, CCTV & Controle de Acesso',
    aplicacao: 'Racks de TI/Telecom, Centrais de Alarme, Cercas Elétricas e Controle de Acesso'
  },
  14: {
    title: 'Energia Solar Fotovoltaica (IEC 61730 / IEC 61215)',
    aplicacao: 'Arranjos Fotovoltaicos, String Boxes CC, Inversores de Conexão à Rede e Baterias LiFePO4'
  }
};

/**
 * Mapeamento canônico das 4 disciplinas de Mecânica Industrial
 */
const CANONICAL_MECHANICAL_DISCIPLINES: Record<number, { title: string; aplicacao: string }> = {
  1: {
    title: 'Fundamentos de Mecânica Industrial & Ajustes',
    aplicacao: 'Tornos Mecânicos, Fresadoras, Metrologia e Ajustagem Mecânica'
  },
  2: {
    title: 'Pneumática Industrial & Tratamento de Ar',
    aplicacao: 'Centrais de Ar Comprimido, Válvulas Direcionais e Cilindros Pneumáticos'
  },
  3: {
    title: 'Hidráulica Industrial & Circuitos de Óleo',
    aplicacao: 'Unidades Hidráulicas de Potência, Bombas de Engrenagem e Servoválvulas'
  },
  4: {
    title: 'Manutenção Preditiva & Análise de Vibrações',
    aplicacao: 'Mancais de Rolamento, Alinhamento a Laser e Preditiva de Vibrações'
  }
};

/**
 * Remove termos proibidos (certificado, universidade, fotos anexadas, etc.)
 */
function sanitizeTechnicalText(text: string): string {
  if (!text) return '';
  return text
    .replace(/certificado\s+oficial/gi, 'qualificação técnica')
    .replace(/certificado/gi, 'comprovação de competência')
    .replace(/universidade|acadêmico|acadêmica|faculdade|monografia|tcc/gi, 'engenharia aplicada')
    .replace(/fotos?\s+anexadas?/gi, 'inspeção visual de campo')
    .replace(/imagem\s+anexada/gi, 'diagrama de campo')
    .replace(/apostila/gi, 'módulo profissional')
    .trim();
}

/**
 * Extrai unidade de medida padrão de uma fórmula ou label
 */
function inferUnit(label: string, formula: string): string {
  const combined = `${label} ${formula}`.toLowerCase();
  if (combined.includes('tensão') || combined.includes('queda de tensão') || combined.includes('v_') || combined.includes('volts')) return 'V';
  if (combined.includes('corrente') || combined.includes('i_') || combined.includes('amp') || combined.includes('amperes')) return 'A';
  if (combined.includes('resistência') || combined.includes('impedância') || combined.includes('ohm') || combined.includes('Ω')) return 'Ω';
  if (combined.includes('seção') || combined.includes('bitola') || combined.includes('mm²')) return 'mm²';
  if (combined.includes('potência ativa') || combined.includes('watts') || combined.includes('kw')) return 'kW';
  if (combined.includes('potência aparente') || combined.includes('kva')) return 'kVA';
  if (combined.includes('potência reativa') || combined.includes('kvar')) return 'kvar';
  if (combined.includes('frequência') || combined.includes('hz')) return 'Hz';
  if (combined.includes('pressão') || combined.includes('bar')) return 'bar';
  if (combined.includes('torque') || combined.includes('n·m') || combined.includes('nm')) return 'N·m';
  if (combined.includes('isolamento') || combined.includes('mω') || combined.includes('megohm')) return 'MΩ';
  if (combined.includes('capacidade de corte') || combined.includes('ka')) return 'kA';
  if (combined.includes('temperatura') || combined.includes('°c')) return '°C';
  return 'unid.';
}

/**
 * Normaliza e enriquece qualquer aula para o padrão vendável profissional de fabricante
 */
export function formatProfessionalLesson(
  lesson: AcademyLesson,
  module?: AcademyModule,
  computedModuleIndex?: number,
  totalModulesInCourse?: number
): FormattedLesson {
  const isMecanica = lesson.moduleId.startsWith('mec_') || module?.area === 'mecanica';
  const total = isMecanica ? 4 : (totalModulesInCourse || 14);

  // Determina índice do módulo (1 a 14 para elétrica, 1 a 4 para mecânica)
  let modIdx = computedModuleIndex || module?.order || lesson.order || 1;
  if (!isMecanica) {
    if (lesson.moduleId === 'elec_mod_1_fisica') modIdx = 1;
    else if (lesson.moduleId === 'elec_mod_2_instrumentacao') modIdx = 2;
    else if (lesson.moduleId === 'elec_mod_3_condutores_linhas') modIdx = 3;
    else if (lesson.moduleId === 'elec_mod_4_aparelhagem_protecao') modIdx = 4;
    else if (lesson.moduleId === 'elec_mod_2_predial') modIdx = 5;
    else if (lesson.moduleId === 'elec_mod_3_protecoes_iec') modIdx = 6;
    else if (lesson.moduleId === 'elec_mod_4_eletronica') modIdx = 7;
    else if (lesson.moduleId === 'elec_mod_5_motores_automacao') modIdx = 8;
    else if (lesson.moduleId === 'elec_mod_6_industriais') modIdx = 9;
    else if (lesson.moduleId === 'elec_mod_7_manutencao_ensaios') modIdx = 10;
    else if (lesson.moduleId === 'elec_mod_8_media_tensao_pt') modIdx = 11;
    else if (lesson.moduleId === 'elec_mod_9_climatizacao_hvac') modIdx = 12;
    else if (lesson.moduleId === 'elec_mod_10_seguranca_cctv') modIdx = 13;
    else if (lesson.moduleId === 'elec_mod_11_energia_solar') modIdx = 14;
    else if (modIdx < 1 || modIdx > 14) modIdx = 1;
  } else {
    if (modIdx < 1 || modIdx > 4) modIdx = 1;
  }

  const disciplineData = isMecanica
    ? CANONICAL_MECHANICAL_DISCIPLINES[modIdx] || CANONICAL_MECHANICAL_DISCIPLINES[1]
    : CANONICAL_ELECTRICAL_DISCIPLINES[modIdx] || CANONICAL_ELECTRICAL_DISCIPLINES[1];

  const discipline = disciplineData.title;
  const identification = `Módulo ${modIdx} de ${total} • ${discipline}`;

  // Norma técnica limpa
  let norma = sanitizeTechnicalText(lesson.norma || 'IEC 60364');
  if (norma.includes('Boas Práticas')) {
    norma = 'IEC 60038 / IEC 60027 / EDM';
  }

  // Onde se aplica
  const ondeSeAplica = lesson.ondeSeAplica || disciplineData.aplicacao;

  // Objetivo Prático de Campo
  let objetivoPratico = lesson.objetivoPratico || '';
  if (!objetivoPratico) {
    const rawTitle = lesson.title.replace(/EC \d+\.\d+:?\s*/, '').trim();
    objetivoPratico = `Executar a instalação, dimensionamento e diagnóstico prático de ${rawTitle.toLowerCase()} em conformidade rigorosa com a norma ${norma}, prevenindo falhas de isolação, sobreaquecimento e paradas não programadas em campo.`;
  }
  objetivoPratico = sanitizeTechnicalText(objetivoPratico);

  // BLOCO A: Fundamento Técnico Essencial (Máx. 3 parágrafos curtos)
  const rawConceito = sanitizeTechnicalText(lesson.theory.fundamento || lesson.theory.conceito || '');
  let paragrafos = rawConceito
    .split(/\n\n+/)
    .map(p => p.trim())
    .filter(Boolean);

  if (paragrafos.length === 1 && paragrafos[0].length > 250) {
    // Quebra em parágrafos menores se vier em bloco maciço
    const sentences = paragrafos[0].match(/[^.!?]+[.!?]+/g) || [paragrafos[0]];
    const p1 = sentences.slice(0, Math.ceil(sentences.length / 2)).join(' ').trim();
    const p2 = sentences.slice(Math.ceil(sentences.length / 2)).join(' ').trim();
    paragrafos = [p1, p2].filter(Boolean);
  }
  if (paragrafos.length > 3) {
    paragrafos = paragrafos.slice(0, 3);
  }
  if (paragrafos.length === 0) {
    paragrafos = [
      `Fundamento operacional e físico aplicado ao dimensionamento e manobra de ${lesson.title.toLowerCase()}.`,
      `O domínio dos parâmetros nominais de corrente, isolação dielétrica e limites de corte garante a confiabilidade do sistema segundo a norma ${norma}.`
    ];
  }

  // BLOCO B: Fórmulas e Parâmetros de Dimensionamento
  const formulasRaw = lesson.theory.formulas || [];
  let formulas: FormattedFormula[] = [];

  if (formulasRaw.length > 0) {
    formulas = formulasRaw.map(f => {
      const unidade = f.unidade || inferUnit(f.label, f.formula);
      const quandoUsar = sanitizeTechnicalText(
        f.quandoUsar ||
        f.explicacao ||
        `Aplicar no cálculo de projeto e checagem de ${f.label.toLowerCase()} em inspeções de campo.`
      );
      return {
        label: sanitizeTechnicalText(f.label),
        formula: f.formula,
        unidade,
        quandoUsar
      };
    });
  } else {
    // Fallback estruturado de grandezas nominais e parâmetros de engenharia da aula
    const calc = lesson.theory.calculationSnippet || '';
    if (calc) {
      formulas.push({
        label: 'Critério de Dimensionamento',
        formula: calc,
        unidade: inferUnit(calc, calc),
        quandoUsar: 'Verificação em campo e dimensionamento de condutores e proteção.'
      });
    }
    // Adiciona parâmetros essenciais para garantir que o Bloco B esteja sempre presente
    formulas.push({
      label: 'Tensão de Ensaio e Operação',
      formula: 'U_n = 230 / 400 V ± 10% (50 Hz)',
      unidade: 'V',
      quandoUsar: 'Medição com multímetro CAT III/IV entre fases e fase-neutro na rede da EDM.'
    });
    formulas.push({
      label: 'Isolação Dielétrica Mínima',
      formula: 'R_iso ≥ 1,0 MΩ (Ensaio a 500V CC)',
      unidade: 'MΩ',
      quandoUsar: 'Ensaio com megômetro entre condutores ativos e terra com circuito desenergizado.'
    });
  }

  // BLOCO C: Procedimentos Operacionais, Segurança e Boas Práticas
  const rawPontos = lesson.theory.procedimentos || lesson.theory.pontosOperacionais || [];
  let procedimentos: string[] = [];

  if (rawPontos.length > 0) {
    procedimentos = rawPontos.map(p => sanitizeTechnicalText(p));
  } else if (lesson.theory.funcionamento) {
    procedimentos = lesson.theory.funcionamento
      .split(/\n+/)
      .map(p => sanitizeTechnicalText(p))
      .filter(p => p.length > 20);
  }

  // Garante requisitos de segurança (LOTO, EPI, medição) se estiver vazio ou curto
  if (procedimentos.length < 3) {
    procedimentos.unshift(
      'Protocolo LOTO (Lockout/Tagout): Desenergizar, bloquear com cadeado garra, etiquetar e testar ausência de tensão com detector de tensão ou multímetro CAT III/IV antes de qualquer contato físico.',
      'Inspeção Visual e Torque: Verificar ausência de rebarbas, folgas e aperto dos bornes com chave dinamométrica para eliminar resistência de contato e pontos quentes.',
      'Ensaio com Megômetro: Medir resistência de isolamento (Riso ≥ 1,0 MΩ a 500V CC) entre fases, neutro e barramento de terra PE antes de energizar.'
    );
  }

  // Limita a 5 procedimentos de altíssimo impacto
  procedimentos = procedimentos.slice(0, 5);

  // BLOCO D: Caso Real de Campo em Moçambique e Diagnóstico
  let fieldCase: FormattedFieldCase;
  if (lesson.theory.fieldCase) {
    fieldCase = {
      localizacao: sanitizeTechnicalText(lesson.theory.fieldCase.localizacao || 'Província de Maputo / Matola'),
      cenario: sanitizeTechnicalText(lesson.theory.fieldCase.cenario),
      diagnostico: sanitizeTechnicalText(lesson.theory.fieldCase.diagnostico),
      solucaoNormativa: sanitizeTechnicalText(lesson.theory.fieldCase.solucaoNormativa)
    };
  } else {
    fieldCase = {
      localizacao: 'Zona Industrial da Matola / Maputo',
      cenario: sanitizeTechnicalText(
        lesson.theory.exemploPratico ||
        `Instalação industrial apresentando aquecimento em conexões de bornes e disparo esporádico da proteção sob regime de carga pesada.`
      ),
      diagnostico: sanitizeTechnicalText(
        lesson.theory.aplicacaoMocambique ||
        `Medição com câmera termográfica apontou gradiente térmico de ΔT = 38°C no borne de conexão e medição com multímetro registrou queda de tensão de 8,2% sob corrente de pico.`
      ),
      solucaoNormativa: sanitizeTechnicalText(
        `Desenergização com bloqueio LOTO, reaperto calibrado com torquímetro (2,5 N·m) nos bornes conforme IEC 60947-1, substituição do trecho com fadiga térmica e regularização da proteção nominal.`
      )
    };
  }

  return {
    moduleIndex: modIdx,
    totalModules: total,
    identification,
    discipline,
    title: sanitizeTechnicalText(lesson.title),
    code: lesson.code || `EC ${modIdx}.${lesson.order}`,
    level: lesson.level,
    durationMinutes: lesson.durationMinutes,
    objetivoPratico,
    norma,
    ondeSeAplica,
    blocoA: {
      paragrafos
    },
    blocoB: {
      hasCalculo: formulas.length > 0,
      formulas
    },
    blocoC: {
      procedimentos
    },
    blocoD: fieldCase
  };
}
