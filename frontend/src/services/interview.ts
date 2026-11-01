import { apiClient } from './api';
import type {
  RoleOption,
  StartInterviewPayload,
  StartInterviewResponse,
  SubmitAnswerPayload,
  QuestionEvaluation,
  CompleteInterviewResponse,
  InterviewHistoryItem,
} from '../types/interview';

export const interviewService = {
  async getRoles(): Promise<RoleOption[]> {
    const res = await apiClient.get<RoleOption[]>('/interview/roles');
    return res.data;
  },

  async startInterview(data: StartInterviewPayload): Promise<StartInterviewResponse> {
    const res = await apiClient.post<StartInterviewResponse>('/interview/start', data);
    return res.data;
  },

  async submitAnswer(data: SubmitAnswerPayload): Promise<QuestionEvaluation> {
    const res = await apiClient.post<QuestionEvaluation>('/interview/submit-answer', data);
    return res.data;
  },

  async completeInterview(sessionId: string): Promise<CompleteInterviewResponse> {
    const res = await apiClient.post<CompleteInterviewResponse>(`/interview/${sessionId}/complete`);
    return res.data;
  },

  async getHistory(): Promise<InterviewHistoryItem[]> {
    const res = await apiClient.get<InterviewHistoryItem[]>('/interview/history');
    return res.data;
  },
};
