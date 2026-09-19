import { AcademyArea, AcademyLesson, AcademyModule } from '../types/academy';

export interface ActiveAcademyContext {
  courseTitle: string;
  area: AcademyArea;
  moduleId: string;
  moduleTitle: string;
  lessonId: string;
  lessonTitle: string;
  lessonCode: string;
  norma: string;
  activeTopic: string;
  timestamp: number;
}

const STORAGE_KEY = 'sara_active_academy_context';

let currentContext: ActiveAcademyContext | null = null;
const listeners = new Set<(context: ActiveAcademyContext | null) => void>();

export function getActiveAcademyContext(): ActiveAcademyContext | null {
  if (currentContext) return currentContext;
  if (typeof localStorage !== 'undefined') {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        currentContext = JSON.parse(stored);
        return currentContext;
      }
    } catch {
      // Fallback gracioso
    }
  }
  return null;
}

export function setActiveAcademyContext(
  module: AcademyModule | null,
  lesson: AcademyLesson | null,
  area: AcademyArea = 'eletrotecnica'
): void {
  if (!lesson) return;

  const courseTitle =
    area === 'mecanica'
      ? 'Mecânica Industrial & Eletromecânica de A a Z'
      : 'Eletrotécnica & Instalações Elétricas de A a Z';

  const newContext: ActiveAcademyContext = {
    courseTitle,
    area,
    moduleId: module?.id || lesson.moduleId || '',
    moduleTitle: module?.title || lesson.moduleTitle || '',
    lessonId: lesson.id,
    lessonTitle: lesson.title,
    lessonCode: lesson.code || '',
    norma: lesson.norma,
    activeTopic: lesson.title,
    timestamp: Date.now()
  };

  currentContext = newContext;
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newContext));
    } catch {
      // Ignora erro de storage
    }
  }

  listeners.forEach(fn => {
    try {
      fn(currentContext);
    } catch (e) {
      console.warn('Erro em listener do contexto da academia:', e);
    }
  });
}

export function subscribeToAcademyContext(
  callback: (context: ActiveAcademyContext | null) => void
): () => void {
  listeners.add(callback);
  callback(getActiveAcademyContext());
  return () => {
    listeners.delete(callback);
  };
}
