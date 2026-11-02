export interface CopilotMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestedActions?: string[];
  contextUsed?: Record<string, any>;
}

export interface CopilotChatRequest {
  message: string;
  history?: Array<{ role: string; content: string }>;
  target_role?: string;
}

export interface CopilotChatResponse {
  reply: string;
  suggested_actions: string[];
  context_used: Record<string, any>;
}

export interface CopilotSuggestionsResponse {
  suggestions: string[];
}

