export type AcademyArea = 'eletrotecnica' | 'mecanica';

export type MasteryLevel = 'Aprendiz' | 'Técnico Nível 1' | 'Especialista IEC';

export type LessonStatus = 'locked' | 'available' | 'completed';
export type ModuleStatus = 'locked' | 'in_progress' | 'completed';

export interface AcademyOption {
  id: string; // 'A' | 'B' | 'C' | 'D'
  text: string;
  isCorrect: boolean;
  feedback: string;
}

export interface AcademyQuiz {
  question: string;
  options: AcademyOption[];
  explanation: string;
  keyTakeaway: string;
  calculationSnippet?: string;
  xpReward: number;
}

export interface FieldFormula {
  label: string;
  formula: string;
  explicacao?: string;
}

export interface FieldCaseStudy {
  localizacao: string; // Ex: 'Maputo / Matola', 'Beira, Sofala', 'Tete / Moatize'
  cenario: string; // Descrição rápida e clara da instalação e sintoma
  diagnostico: string; // Diagnóstico técnico realizado em campo
  solucaoNormativa: string; // Ação corretiva com base na norma IEC/EN
}

export interface AcademyLessonTheory {
  conceito: string;
  // Campos estruturados do novo padrão pedagógico (Elementos de Competência)
  formulas?: FieldFormula[];
  pontosOperacionais?: string[];
  fieldCase?: FieldCaseStudy;
  // Campos de compatibilidade
  funcionamento?: string;
  aplicacaoMocambique?: string;
  exemploPratico?: string;
  calculationSnippet?: string;
}

export interface AcademyLesson {
  id: string;
  moduleId: string;
  moduleTitle: string;
  order: number;
  code?: string; // Ex: 'EC 1.1', 'EC 3.2'
  title: string;
  norma: string; // Ex: 'IEC 60364-4-41', 'IEC 60898-1', 'EN 378'
  level: 'Básico' | 'Intermediário' | 'Avançado';
  durationMinutes: number;
  theory: AcademyLessonTheory;
  quiz: AcademyQuiz;
}

// Tipo canônico de Elemento de Competência
export type CompetencyElement = AcademyLesson;

export interface AcademyModule {
  id: string;
  area: AcademyArea;
  order: number;
  title: string;
  description: string;
  icon: string;
  normasReferencia: string[];
  lessons: AcademyLesson[];
}

// Compatibilidade com exercícios legados
export interface AcademyExercise {
  id: string;
  area: AcademyArea;
  trackId: string;
  trackTitle: string;
  title: string;
  norma: string;
  level: 'Básico' | 'Intermediário' | 'Avançado';
  scenario: string;
  question: string;
  options: AcademyOption[];
  explanation: string;
  keyTakeaway: string;
  calculationSnippet?: string;
  xpReward: number;
}

export interface AcademyTrack {
  id: string;
  area: AcademyArea;
  title: string;
  description: string;
  icon: string;
  normasReferencia: string[];
}

export interface AcademyLocalData {
  userId: string;
  area: AcademyArea;
  xp: number;
  streak: number;
  lastCompletedDate?: string; // YYYY-MM-DD
  currentModuleId?: string;
  currentLessonId?: string;
  completedLessonIds: string[];
  completedExerciseIds: string[]; // Aliás para compatibilidade
  completedModuleIds: string[];
  totalModulesCompleted: number;
  lastSyncFirestoreDate?: string; // YYYY-MM-DD
  history: {
    lessonId?: string;
    exerciseId?: string;
    completedAt: string;
    earnedXp: number;
    wasCorrect: boolean;
  }[];
}

export * from './assessment';
