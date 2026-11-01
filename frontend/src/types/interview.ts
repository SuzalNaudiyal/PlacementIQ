export interface InterviewQuestion {
  question_id: string;
  question: string;
  concept: string;
  round_type: string;
  difficulty: string;
  hint?: string;
  time_limit_seconds: number;
}

export interface StartInterviewPayload {
  role_id: string;
  round_type: string;
  difficulty: string;
  question_count: number;
}

export interface StartInterviewResponse {
  session_id: string;
  role_id: string;
  role_title: string;
  round_type: string;
  difficulty: string;
  total_questions: number;
  questions: InterviewQuestion[];
  created_at: string;
}

export interface SubmitAnswerPayload {
  session_id: string;
  question_id: string;
  candidate_answer: string;
  time_taken_seconds: number;
}

export interface QuestionEvaluation {
  question_id: string;
  question: string;
  candidate_answer: string;
  overall_score: number;
  technical_score: number;
  clarity_score: number;
  structure_score: number;
  confidence_score: number;
  matched_keywords: string[];
  missing_keywords: string[];
  strengths: string[];
  improvements: string[];
  ideal_answer: string;
}

export interface CompleteInterviewResponse {
  session_id: string;
  user_id: string;
  role_id: string;
  role_title: string;
  round_type: string;
  difficulty: string;
  total_questions: number;
  completed_questions: number;
  average_score: number;
  technical_score: number;
  clarity_score: number;
  structure_score: number;
  confidence_score: number;
  grade: string;
  summary_feedback: string;
  evaluations: QuestionEvaluation[];
  created_at: string;
}

export interface InterviewHistoryItem {
  session_id: string;
  role_id: string;
  role_title: string;
  round_type: string;
  difficulty: string;
  total_questions: number;
  average_score: number;
  grade: string;
  created_at: string;
}

export interface RoleOption {
  role_id: string;
  title: string;
  category: string;
  available_rounds: string[];
}
