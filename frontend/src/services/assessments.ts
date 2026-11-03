import { apiClient } from './api';

export interface AptitudeQuestion {
  id: string;
  category: string;
  subtopic: string;
  question: string;
  options: string[];
}

export interface AptitudeResult {
  submission_id: string;
  total_questions: number;
  attempted_questions: number;
  correct_answers: number;
  overall_percentage: number;
  attempted_accuracy_percentage: number;
  readiness_status: string;
  badge_awarded: string;
  category_breakdown: Record<string, { total: number; correct: number; accuracy_pct: number }>;
  detailed_review: Array<{
    question_id: string;
    category: string;
    subtopic: string;
    question: string;
    options: string[];
    selected_option_index: number | null;
    correct_option_index: number;
    is_correct: boolean;
    explanation: string;
  }>;
  submitted_at: string;
}

export interface SvarSentence {
  id: string;
  level: string;
  sentence: string;
  difficulty: string;
  expected_duration_seconds: number;
}

export interface ExtemporeTopic {
  id: string;
  title: string;
  prompt: string;
  recommended_time_seconds: number;
}

export interface SvarExercisesResponse {
  sentences: SvarSentence[];
  extempore_topics: ExtemporeTopic[];
  instructions: string[];
}

export interface SvarSentenceEvaluation {
  submission_id: string;
  expected_sentence: string;
  spoken_transcript: string;
  accuracy_score: number;
  memory_retention_score: number;
  fluency_score: number;
  svar_score: number;
  cefr_band: string;
  filler_words_detected: number;
  missed_words: string[];
  extra_words: string[];
  feedback: string;
  has_audio?: boolean;
  audio_data?: string;
  submitted_at: string;
}

export interface ExtemporeEvaluation {
  submission_id: string;
  topic: string;
  word_count: number;
  speaking_rate_wpm: number;
  vocabulary_richness: number;
  coherence_score: number;
  overall_extempore_score: number;
  cefr_band: string;
  feedback: string;
  has_audio?: boolean;
  audio_data?: string;
  submitted_at: string;
}

export interface SvarGrammarQuestion {
  id: string;
  category: string;
  question: string;
  options: string[];
}

export interface SvarGrammarResult {
  submission_id: string;
  total_questions: number;
  correct_answers: number;
  score_percentage: number;
  cefr_band: string;
  badge_awarded: string;
  category_breakdown: Record<string, { total: number; correct: number }>;
  detailed_review: Array<{
    question_id: string;
    category: string;
    question: string;
    options: string[];
    selected_option_index: number | null;
    correct_option_index: number;
    is_correct: boolean;
    explanation: string;
  }>;
  submitted_at: string;
}

export interface AdminAssessmentSubmission {
  submission_id: string;
  user_id: string;
  student_name: string;
  student_email: string;
  test_type: string;
  headline_score: number;
  rating_or_badge: string;
  summary: Record<string, any>;
  audio_data?: string;
  submitted_at: string;
}

export const fetchAptitudeQuestions = async (count: number = 10): Promise<AptitudeQuestion[]> => {
  const res = await apiClient.get<AptitudeQuestion[]>(`/assessments/aptitude/questions?count=${count}`);
  return res.data;
};

export const submitAptitudeAnswers = async (payload: {
  answers: Record<string, number>;
  time_taken_seconds?: number;
}): Promise<AptitudeResult> => {
  const res = await apiClient.post<AptitudeResult>('/assessments/aptitude/submit', payload);
  return res.data;
};

export const fetchSvarExercises = async (): Promise<SvarExercisesResponse> => {
  const res = await apiClient.get<SvarExercisesResponse>('/assessments/svar/exercises');
  return res.data;
};

export const evaluateSvarSentence = async (payload: {
  sentence_id: string;
  spoken_transcript: string;
  duration_seconds: number;
  audio_data?: string;
}): Promise<SvarSentenceEvaluation> => {
  const res = await apiClient.post<SvarSentenceEvaluation>('/assessments/svar/evaluate-sentence', payload);
  return res.data;
};

export const evaluateSvarExtempore = async (payload: {
  topic_id: string;
  spoken_transcript: string;
  duration_seconds: number;
  audio_data?: string;
}): Promise<ExtemporeEvaluation> => {
  const res = await apiClient.post<ExtemporeEvaluation>('/assessments/svar/evaluate-extempore', payload);
  return res.data;
};

export const fetchSvarGrammarQuestions = async (count: number = 10): Promise<SvarGrammarQuestion[]> => {
  const res = await apiClient.get<SvarGrammarQuestion[]>(`/assessments/svar/grammar?count=${count}`);
  return res.data;
};

export const submitSvarGrammarAnswers = async (payload: {
  answers: Record<string, number>;
  time_taken_seconds?: number;
}): Promise<SvarGrammarResult> => {
  const res = await apiClient.post<SvarGrammarResult>('/assessments/svar/grammar/submit', payload);
  return res.data;
};

export const fetchMyAssessmentHistory = async (): Promise<{ total_submissions: number; submissions: any[] }> => {
  const res = await apiClient.get('/assessments/my-history');
  return res.data;
};

export const fetchAdminAssessmentSubmissions = async (testType?: string): Promise<AdminAssessmentSubmission[]> => {
  const url = testType ? `/assessments/admin/submissions?test_type=${encodeURIComponent(testType)}` : '/assessments/admin/submissions';
  const res = await apiClient.get<AdminAssessmentSubmission[]>(url);
  return res.data;
};
