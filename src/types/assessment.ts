export type AssessmentQuestionType = 'multiple_choice' | 'descriptive';

export interface AssessmentOption {
  id: string; // Original ID or letter
  text: string;
  isCorrect: boolean;
  feedback: string;
}

export interface ShuffledAssessmentOption extends AssessmentOption {
  displayLetter: 'A' | 'B' | 'C' | 'D'; // Assigned after dynamic Fisher-Yates shuffle
}

export interface AssessmentMCQuestion {
  id: string;
  type: 'multiple_choice';
  question: string;
  scenario?: string;
  diagramId?: string; // e.g. 'distribution_board_qgd', 'direct_motor_starter', 'three_way_lighting', 'solar_pv_system', 'earthing_systems', 'hydraulic_circuit', 'pneumatic_circuit'
  diagramTitle?: string;
  options: AssessmentOption[];
  explanation: string;
  norma: string;
  keyTakeaway?: string;
  points: number; // e.g. 20 or 25
}

export interface AssessmentDescriptiveQuestion {
  id: string;
  type: 'descriptive';
  title?: string;
  question: string;
  contextScenario: string;
  diagramId?: string;
  diagramTitle?: string;
  expectedKeywords: string[];
  norma: string;
  guidelineAnswer: string;
  rubricCriteria: {
    criterion: string;
    weightPercent: number;
  }[];
  minWords?: number;
  points: number; // e.g. 40 or 50
}

export type AssessmentQuestion = AssessmentMCQuestion | AssessmentDescriptiveQuestion;

export interface DescriptiveEvaluationResult {
  scorePercent: number; // 0 to 100
  verdict: 'ALCANÇA' | 'PARCIALMENTE_ALCANÇA' | 'NÃO_ALCANÇA';
  matchedKeywords: string[];
  missingPoints: string[];
  technicalFeedback: string;
  normativeAlignment: string;
  earnedPoints: number;
}

export interface AssessmentAttempt {
  attemptId: string;
  attemptNumber: number;
  lessonId: string;
  lessonCode: string;
  lessonTitle: string;
  moduleTitle: string;
  norma: string;
  technicianName: string;
  technicianId: string;
  date: string;
  authCode: string; // e.g. TMZ-ACAD-2026-X8K2
  mcQuestions: (Omit<AssessmentMCQuestion, 'options'> & { options: ShuffledAssessmentOption[] })[];
  descQuestions: AssessmentDescriptiveQuestion[];
  mcAnswers: Record<string, string>; // questionId -> chosen displayLetter
  descAnswers: Record<string, string>; // questionId -> typed response text
  descEvaluations: Record<string, DescriptiveEvaluationResult>;
  mcEarnedPoints: number;
  mcTotalPoints: number;
  descEarnedPoints: number;
  descTotalPoints: number;
  finalScorePercent: number; // 0 to 100
  status: 'ALCANCA' | 'NAO_ALCANCA';
  isPassed: boolean; // finalScorePercent >= 80
}
