import {
  AcademyArea,
  AcademyExercise,
  AcademyLesson,
  AcademyLocalData,
  AcademyModule,
  AcademyTrack,
  LessonStatus,
  MasteryLevel,
  ModuleStatus
} from '../types/academy';
import {
  ACADEMY_MODULES,
  ACADEMY_EXERCISES,
  ACADEMY_TRACKS
} from '../data/saraAcademyCurriculum';
import { doc, setDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase/config';

// Chaves oficiais de armazenamento local indicadas nas diretrizes
const FULL_TREE_STORAGE_KEY = 'sara_academy_full_tree';
const PRIMARY_STORAGE_KEY = 'sara_course_local_data';
const LEGACY_STORAGE_PREFIX = 'sara_academy_local_data';

export const getStorageKey = (userId: string = 'guest'): string => {
  return `${FULL_TREE_STORAGE_KEY}_${userId}`;
};

/**
 * Determina rigorosamente a área de atuação do técnico com base no perfil.
 * NUNCA mistura áreas: ou é 'eletrotecnica' ou é 'mecanica'.
 */
export const detectUserArea = (user: any): AcademyArea => {
  const manualPreference =
    typeof localStorage !== 'undefined'
      ? localStorage.getItem('tecnico_academy_area_pref')
      : null;
  if (manualPreference === 'mecanica' || manualPreference === 'eletrotecnica') {
    return manualPreference as AcademyArea;
  }

  const rawArea = String(
    user?.area ||
    user?.specialty ||
    user?.especialidade ||
    (typeof localStorage !== 'undefined' ? localStorage.getItem('tecnico_area') : '') ||
    (typeof localStorage !== 'undefined' ? localStorage.getItem('tecnico_especialidade') : '') ||
    ''
  ).toLowerCase();

  const isMecanica =
    rawArea.includes('mecanic') ||
    rawArea.includes('mecânic') ||
    rawArea.includes('hidraulic') ||
    rawArea.includes('hidráulic') ||
    rawArea.includes('pneumatic') ||
    rawArea.includes('pneumátic') ||
    rawArea.includes('usinagem') ||
    rawArea.includes('torneiro') ||
    rawArea.includes('caldeiraria') ||
    rawArea.includes('automot');

  return isMecanica ? 'mecanica' : 'eletrotecnica';
};

/**
 * Retorna data atual no formato YYYY-MM-DD
 */
export const getTodayDateString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Retorna data de ontem no formato YYYY-MM-DD
 */
export const getYesterdayDateString = (): string => {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Retorna os módulos exclusivos da área do técnico
 */
export const getModulesForArea = (area: AcademyArea): AcademyModule[] => {
  return ACADEMY_MODULES.filter(m => m.area === area);
};

/**
 * Retorna as trilhas exclusivas da área do técnico (retrocompatibilidade)
 */
export const getTracksForArea = (area: AcademyArea): AcademyTrack[] => {
  return ACADEMY_TRACKS.filter(t => t.area === area);
};

/**
 * Calcula o nível de maestria com base no XP acumulado:
 * - 0 - 299 XP: Aprendiz
 * - 300 - 999 XP: Técnico Nível 1
 * - 1000+ XP: Especialista IEC
 */
export const getMasteryLevelInfo = (xp: number): {
  level: MasteryLevel;
  minXp: number;
  maxXp: number;
  currentXpInLevel: number;
  targetXpForNextLevel: number;
  progressPercent: number;
  badgeColor: string;
} => {
  if (xp < 300) {
    const currentXp = xp;
    const target = 300;
    return {
      level: 'Aprendiz',
      minXp: 0,
      maxXp: 300,
      currentXpInLevel: currentXp,
      targetXpForNextLevel: target,
      progressPercent: Math.min(100, Math.round((currentXp / target) * 100)),
      badgeColor: 'bg-emerald-500 text-white'
    };
  } else if (xp < 1000) {
    const currentXp = xp - 300;
    const target = 700; // 1000 - 300
    return {
      level: 'Técnico Nível 1',
      minXp: 300,
      maxXp: 1000,
      currentXpInLevel: currentXp,
      targetXpForNextLevel: target,
      progressPercent: Math.min(100, Math.round((currentXp / target) * 100)),
      badgeColor: 'bg-blue-600 text-white'
    };
  } else {
    return {
      level: 'Especialista IEC',
      minXp: 1000,
      maxXp: 99999,
      currentXpInLevel: xp,
      targetXpForNextLevel: xp,
      progressPercent: 100,
      badgeColor: 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-xs'
    };
  }
};

/**
 * Carrega os dados locais do técnico (com fallback resiliente e unificação de chaves)
 */
export const loadAcademyLocalData = (userId: string = 'guest', userArea: AcademyArea): AcademyLocalData => {
  const primaryKey = getStorageKey(userId);
  const legacyKey = `${LEGACY_STORAGE_PREFIX}_${userId}`;

  try {
    if (typeof localStorage !== 'undefined') {
      let raw =
        localStorage.getItem(primaryKey) ||
        localStorage.getItem(FULL_TREE_STORAGE_KEY) ||
        localStorage.getItem(`${PRIMARY_STORAGE_KEY}_${userId}`) ||
        localStorage.getItem(PRIMARY_STORAGE_KEY) ||
        localStorage.getItem(legacyKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          const completedLessonIds = Array.isArray(parsed.completedLessonIds)
            ? parsed.completedLessonIds
            : Array.isArray(parsed.completedExerciseIds)
            ? parsed.completedExerciseIds
            : [];

          return {
            userId: parsed.userId || userId,
            area: parsed.area || userArea,
            xp: Number(parsed.xp || 0),
            streak: Number(parsed.streak || 0),
            lastCompletedDate: parsed.lastCompletedDate,
            currentModuleId: parsed.currentModuleId,
            currentLessonId: parsed.currentLessonId,
            completedLessonIds,
            completedExerciseIds: completedLessonIds,
            completedModuleIds: Array.isArray(parsed.completedModuleIds) ? parsed.completedModuleIds : [],
            totalModulesCompleted: Number(parsed.totalModulesCompleted || 0),
            lastSyncFirestoreDate: parsed.lastSyncFirestoreDate,
            history: Array.isArray(parsed.history) ? parsed.history : []
          };
        }
      }
    }
  } catch (err) {
    console.warn('[SaraAcademy] Erro ao carregar dados locais:', err);
  }

  // Estado inicial padrão se não existir no LocalStorage
  return {
    userId,
    area: userArea,
    xp: 0,
    streak: 0,
    completedLessonIds: [],
    completedExerciseIds: [],
    completedModuleIds: [],
    totalModulesCompleted: 0,
    history: []
  };
};

/**
 * Salva no LocalStorage do celular de forma síncrona e rápida (< 1ms)
 */
export const saveAcademyLocalData = (data: AcademyLocalData): void => {
  try {
    if (typeof localStorage !== 'undefined') {
      const primaryKey = getStorageKey(data.userId);
      const serialized = JSON.stringify(data);
      // Persiste na chave canônica da árvore de competências
      localStorage.setItem(primaryKey, serialized);
      localStorage.setItem(FULL_TREE_STORAGE_KEY, serialized);
      // Mantém compatibilidade com chave anterior
      localStorage.setItem(`${PRIMARY_STORAGE_KEY}_${data.userId}`, serialized);
      localStorage.setItem(PRIMARY_STORAGE_KEY, serialized);
    }
  } catch (err) {
    console.warn('[SaraAcademy] Erro ao salvar dados locais:', err);
  }
};

export interface ComputedCourseProgress {
  totalModules: number;
  completedModulesCount: number;
  currentModuleIndex: number; // 1-indexed (ex: 2 de 6)
  currentModule: AcademyModule;
  currentLesson: AcademyLesson;
  overallPercent: number;
  modulesWithProgress: {
    module: AcademyModule;
    status: ModuleStatus;
    percent: number;
    completedCount: number;
    totalCount: number;
    lessonsWithStatus: {
      lesson: AcademyLesson;
      status: LessonStatus;
    }[];
  }[];
}

/**
 * Calcula o progresso completo da grade curricular sequencial do técnico
 */
export const computeCourseProgress = (
  userArea: AcademyArea,
  academyData: AcademyLocalData
): ComputedCourseProgress => {
  const modules = getModulesForArea(userArea);
  const completedSet = new Set(academyData.completedLessonIds || []);

  let totalLessonsInCourse = 0;
  let totalCompletedLessonsInCourse = 0;

  let activeModuleIndex = 0;
  let activeLesson: AcademyLesson | null = null;
  let isPreviousModuleComplete = true;

  const modulesWithProgress = modules.map((mod, modIdx) => {
    let completedInMod = 0;
    const totalInMod = mod.lessons.length;
    totalLessonsInCourse += totalInMod;

    let isPreviousLessonComplete = isPreviousModuleComplete;

    const lessonsWithStatus = mod.lessons.map((les) => {
      const isCompleted = completedSet.has(les.id);
      let status: LessonStatus = 'locked';

      if (isCompleted) {
        status = 'completed';
        completedInMod++;
        totalCompletedLessonsInCourse++;
        isPreviousLessonComplete = true;
      } else if (isPreviousLessonComplete) {
        status = 'available';
        isPreviousLessonComplete = false;
        if (!activeLesson) {
          activeLesson = les;
          activeModuleIndex = modIdx;
        }
      } else {
        status = 'locked';
      }

      return { lesson: les, status };
    });

    const percent = totalInMod > 0 ? Math.round((completedInMod / totalInMod) * 100) : 0;
    let modStatus: ModuleStatus = 'locked';

    if (completedInMod === totalInMod && totalInMod > 0) {
      modStatus = 'completed';
      isPreviousModuleComplete = true;
    } else if (isPreviousModuleComplete || completedInMod > 0) {
      modStatus = 'in_progress';
      isPreviousModuleComplete = false;
      if (!activeLesson && mod.lessons.length > 0) {
        activeLesson = mod.lessons[0];
        activeModuleIndex = modIdx;
      }
    } else {
      modStatus = 'locked';
      isPreviousModuleComplete = false;
    }

    return {
      module: mod,
      status: modStatus,
      percent,
      completedCount: completedInMod,
      totalCount: totalInMod,
      lessonsWithStatus
    };
  });

  // Fallback se o curso todo já foi completado
  if (!activeLesson) {
    const lastModule = modules[modules.length - 1];
    activeLesson = lastModule.lessons[lastModule.lessons.length - 1];
    activeModuleIndex = modules.length - 1;
  }

  const completedModulesCount = modulesWithProgress.filter(m => m.status === 'completed').length;
  const overallPercent =
    totalLessonsInCourse > 0
      ? Math.round((totalCompletedLessonsInCourse / totalLessonsInCourse) * 100)
      : 0;

  return {
    totalModules: modules.length,
    completedModulesCount,
    currentModuleIndex: Math.min(modules.length, activeModuleIndex + 1),
    currentModule: modules[activeModuleIndex] || modules[0],
    currentLesson: activeLesson,
    overallPercent,
    modulesWithProgress
  };
};

/**
 * Conclui uma aula / teste de fixação:
 * 1. Incrementa XP (+50 acerto, +15 esforço).
 * 2. Atualiza Streak diário.
 * 3. Registra ID da aula para nunca mais repetir.
 * 4. Write-Throttling no Firestore: Máximo 1 escrita por dia no plano Spark.
 */
export const recordLessonCompletion = async (
  userId: string,
  userArea: AcademyArea,
  lessonId: string,
  wasCorrect: boolean
): Promise<{
  updatedData: AcademyLocalData;
  earnedXp: number;
  streakIncremented: boolean;
  firestoreSynced: boolean;
}> => {
  const currentData = loadAcademyLocalData(userId, userArea);
  const earnedXp = wasCorrect ? 50 : 15;
  const today = getTodayDateString();
  const yesterday = getYesterdayDateString();

  const newXp = (currentData.xp || 0) + earnedXp;

  // Cálculo de Streak Diário
  let newStreak = currentData.streak || 0;
  let streakIncremented = false;

  if (!currentData.lastCompletedDate) {
    newStreak = 1;
    streakIncremented = true;
  } else if (currentData.lastCompletedDate === today) {
    newStreak = Math.max(1, newStreak);
  } else if (currentData.lastCompletedDate === yesterday) {
    newStreak = newStreak + 1;
    streakIncremented = true;
  } else {
    newStreak = 1;
    streakIncremented = true;
  }

  // Registra a aula concluída
  const completedSet = new Set(currentData.completedLessonIds || []);
  completedSet.add(lessonId);
  const newCompletedIds = Array.from(completedSet);

  // Verifica módulos concluídos
  const modules = getModulesForArea(userArea);
  const completedModuleIds: string[] = [];
  modules.forEach(mod => {
    const allDone = mod.lessons.every(l => completedSet.has(l.id));
    if (allDone) {
      completedModuleIds.push(mod.id);
    }
  });

  const newTotalModules = completedModuleIds.length;

  // Histórico recente (máx 20)
  const newHistory = [
    {
      lessonId,
      exerciseId: lessonId,
      completedAt: new Date().toISOString(),
      earnedXp,
      wasCorrect
    },
    ...(currentData.history || [])
  ].slice(0, 20);

  let firestoreSynced = false;
  let newLastSyncDate = currentData.lastSyncFirestoreDate;

  // Write-Throttling no Firestore: Máximo 1 gravação por dia por usuário!
  const shouldSyncFirestore =
    isFirebaseConfigured &&
    db &&
    userId &&
    userId !== 'guest' &&
    currentData.lastSyncFirestoreDate !== today;

  if (shouldSyncFirestore) {
    try {
      const userDocRef = doc(db, 'users', userId);
      await setDoc(
        userDocRef,
        {
          academy_xp: newXp,
          academy_streak: newStreak,
          academy_modules_count: newTotalModules,
          academy_completed_lessons: newCompletedIds.length,
          last_completed_date: today,
          updatedAt: new Date().toISOString()
        },
        { merge: true }
      );
      newLastSyncDate = today;
      firestoreSynced = true;
    } catch (fireErr) {
      console.warn('[SaraAcademy] Sincronização secundária com Firestore adiada (sem impacto offline):', fireErr);
    }
  }

  const updatedData: AcademyLocalData = {
    userId,
    area: userArea,
    xp: newXp,
    streak: newStreak,
    lastCompletedDate: today,
    completedLessonIds: newCompletedIds,
    completedExerciseIds: newCompletedIds,
    completedModuleIds,
    totalModulesCompleted: newTotalModules,
    lastSyncFirestoreDate: newLastSyncDate,
    history: newHistory
  };

  saveAcademyLocalData(updatedData);

  return {
    updatedData,
    earnedXp,
    streakIncremented,
    firestoreSynced
  };
};

/**
 * Aliás de retrocompatibilidade para componentes existentes
 */
export const recordExerciseCompletion = recordLessonCompletion;

export const getNextExerciseForUser = (
  userArea: AcademyArea,
  completedIds: string[],
  selectedTrackId?: string
): AcademyExercise => {
  let candidates = ACADEMY_EXERCISES.filter(ex => ex.area === userArea);

  if (selectedTrackId) {
    const trackCandidates = candidates.filter(ex => ex.trackId === selectedTrackId);
    if (trackCandidates.length > 0) {
      candidates = trackCandidates;
    }
  }

  const uncompleted = candidates.filter(ex => !completedIds.includes(ex.id));
  if (uncompleted.length > 0) {
    return uncompleted[0];
  }

  if (candidates.length > 0) {
    return candidates[0];
  }

  return ACADEMY_EXERCISES[0];
};

/**
 * Gera um desafio inédito via Sara IA com normas IEC / EN caso o usuário solicite
 */
export const generateAiChallenge = async (
  area: AcademyArea,
  trackTitle: string,
  userLevel: MasteryLevel
): Promise<AcademyExercise | null> => {
  const prompt = `Você é o motor de formação técnica da Sara IA na plataforma TécnicaMZ Pro.
Gere 1 (UM) caso prático de campo e desafio interativo inédito para a área "${area === 'eletrotecnica' ? 'Eletricidade / Eletrotécnica' : 'Mecânica Industrial'}".
Trilha de Estudo: "${trackTitle}".
Nível do Técnico: "${userLevel}".

EXIGÊNCIAS ESTRITAS DE NORMATIZAÇÃO EUROPEIA (IEC / EN):
1. Se for Eletrotécnica, fundamente EXCLUSIVAMENTE nas normas IEC europeias (IEC 60364, IEC 60898, IEC 61008, IEC 61009, IEC 61643, IEC 62548, EN 378).
   Use terminologia técnica europeia: Interruptor Diferencial Residual (IDR/RCD), Disjuntor Magnetotérmico, Seccionador, Queda de Tensão ΔU %, Corte Omnipolar, Tensão Nominal 230V/400V 50Hz.
2. Se for Mecânica, fundamente EXCLUSIVAMENTE em normas ISO/EN (ISO 10816, ISO 4406, ISO 8573, EN ISO 13849, EN ISO 12100).
3. Responda ESTRITAMENTE em formato JSON VÁLIDO (sem nenhum texto fora das chaves {}):

{
  "id": "ai_${Date.now()}",
  "area": "${area}",
  "trackId": "custom_ai",
  "trackTitle": "${trackTitle}",
  "title": "Título curto e técnico do desafio",
  "norma": "Nome e artigo da norma (ex: IEC 60364-4-41)",
  "level": "Intermediário",
  "scenario": "Descrição detalhada de um caso prático real de diagnóstico em Moçambique com sintomas e medições.",
  "question": "Pergunta objetiva e técnica sobre a decisão a ser tomada.",
  "options": [
    {"id": "A", "text": "Opção A", "isCorrect": false, "feedback": "Por que está errada"},
    {"id": "B", "text": "Opção B", "isCorrect": true, "feedback": "Por que está correta com base na norma"},
    {"id": "C", "text": "Opção C", "isCorrect": false, "feedback": "Por que está errada"},
    {"id": "D", "text": "Opção D", "isCorrect": false, "feedback": "Por que está errada"}
  ],
  "explanation": "Explicação detalhada passo a passo citando a norma e fórmulas se aplicável.",
  "keyTakeaway": "Ponto-chave para memorização técnica",
  "calculationSnippet": "Cálculo resumido se aplicável",
  "xpReward": 50
}`;

  try {
    const res = await fetch('/api/sara', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: prompt,
        system_instruction: 'Você é um avaliador de engenharia que responde unicamente em JSON estrito.'
      })
    });

    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    const rawText = data?.reply || data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed && parsed.scenario && Array.isArray(parsed.options)) {
        return parsed as AcademyExercise;
      }
    }
  } catch (err) {
    console.warn('[SaraAcademy] Falha ao gerar desafio por IA, usando acervo local:', err);
  }

  return null;
};
