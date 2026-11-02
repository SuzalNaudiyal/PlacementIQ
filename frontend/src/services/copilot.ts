import { apiClient } from './api';
import type {
  CopilotChatRequest,
  CopilotChatResponse,
  CopilotSuggestionsResponse,
} from '../types/copilot';

export const sendCopilotMessage = async (
  payload: CopilotChatRequest
): Promise<CopilotChatResponse> => {
  const response = await apiClient.post<CopilotChatResponse>('/copilot/chat', payload);
  return response.data;
};

export const getCopilotSuggestions = async (): Promise<CopilotSuggestionsResponse> => {
  const response = await apiClient.get<CopilotSuggestionsResponse>('/copilot/suggestions');
  return response.data;
};

