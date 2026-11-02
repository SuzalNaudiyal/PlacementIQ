from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class CopilotChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000, description="User question or prompt")
    history: Optional[List[Dict[str, str]]] = Field(default_factory=list, description="Recent conversation turns")
    target_role: Optional[str] = Field(None, description="Optional target career track")


class CopilotChatResponse(BaseModel):
    reply: str
    suggested_actions: List[str] = Field(default_factory=list)
    context_used: Dict[str, Any] = Field(default_factory=dict)


class CopilotSuggestionsResponse(BaseModel):
    suggestions: List[str] = Field(default_factory=list)

