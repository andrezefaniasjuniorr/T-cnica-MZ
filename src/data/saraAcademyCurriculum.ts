import { AcademyModule, AcademyTrack, AcademyExercise } from '../types/academy';
import { ELECTRICAL_MODULES } from './curriculumElectrical';
import { ELECTRICAL_MODULES_PART2 } from './curriculumElectricalPart2';
import { ELECTRICAL_MODULES_PART3 } from './curriculumElectricalPart3';
import { MECHANICAL_MODULES } from './curriculumMechanical';

// ============================================================================
// MATRIZ CURRICULAR PROFISSIONAL COMPLETA - CURSO DE FORMAÇÃO TÉCNICA
// Normas Europeias (IEC / EN / ISO) aplicadas a Moçambique
// ============================================================================

/**
 * Matriz Completa de Eletrotécnica (11 Módulos estruturados de A a Z com ECs)
 * Módulos 1-3: Física Elétrica, Instalações Prediais, Proteções & IEC 60364
 * Módulos 4-7: Eletrônica & SMPS, Motores & PLCs, Instalações Industriais, Manutenção & Ensaios
 * Módulos 8-11: Média Tensão & PTs, Climatização HVAC, Segurança & CCTV, Solar Fotovoltaico
 */
export const ALL_ELECTRICAL_MODULES: AcademyModule[] = [
  ...ELECTRICAL_MODULES,
  ...ELECTRICAL_MODULES_PART2,
  ...ELECTRICAL_MODULES_PART3
];

/**
 * Matriz Completa de Mecânica Industrial (Módulos 1-4 estruturados com ECs)
 */
export const ALL_MECHANICAL_MODULES: AcademyModule[] = [
  ...MECHANICAL_MODULES
];

/**
 * Todos os módulos da academia combinados
 */
export const ACADEMY_MODULES: AcademyModule[] = [
  ...ALL_ELECTRICAL_MODULES,
  ...ALL_MECHANICAL_MODULES
];

// Mapeamento de trilhas compatíveis com visualização por ícone
export const ACADEMY_TRACKS: AcademyTrack[] = ACADEMY_MODULES.map(m => ({
  id: m.id,
  area: m.area,
  title: m.title.replace(/^Módulo \d+:\s*/, ''),
  description: m.description,
  icon: m.icon,
  normasReferencia: m.normasReferencia
}));

// Lista achatada de exercícios de fixação para retrocompatibilidade
export const ACADEMY_EXERCISES: AcademyExercise[] = ACADEMY_MODULES.flatMap(m =>
  m.lessons.map(l => ({
    id: l.id,
    area: m.area,
    trackId: m.id,
    trackTitle: m.title,
    title: l.title,
    norma: l.norma,
    level: l.level,
    scenario: `${l.theory.conceito}\n\n${l.theory.exemploPratico || ''}`,
    question: l.quiz.question,
    options: l.quiz.options,
    explanation: l.quiz.explanation,
    keyTakeaway: l.quiz.keyTakeaway,
    calculationSnippet: l.theory.calculationSnippet,
    xpReward: l.quiz.xpReward
  }))
);
