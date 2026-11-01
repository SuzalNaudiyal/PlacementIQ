"""
Pydantic Schemas for AI Mock Interview Simulator.
Handles session initialization, question streaming, answer evaluation, and score dossiers.
"""

from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class StartInterviewRequest(BaseModel):
    role_id: str = Field(default="full-stack-developer", description="Target job role identifier")
    round_type: str = Field(default="technical", description="Round category: technical, behavioral, system_design, hr")
    difficulty: str = Field(default="intermediate", description="Difficulty level: beginner, intermediate, advanced")
    question_count: int = Field(default=5, ge=3, le=10, description="Number of questions in session")


class InterviewQuestionOut(BaseModel):
    question_id: str
    question: str
    concept: str
    round_type: str
    difficulty: str
    hint: Optional[str] = None
    time_limit_seconds: int = 120


class StartInterviewResponse(BaseModel):
    session_id: str
    role_id: str
    role_title: str
    round_type: str
    difficulty: str
    total_questions: int
    questions: List[InterviewQuestionOut]
    created_at: datetime


class SubmitAnswerRequest(BaseModel):
    session_id: str
    question_id: str
    candidate_answer: str = Field(..., min_length=2, description="Candidate verbal or written response")
    time_taken_seconds: int = Field(default=45, ge=1)


class QuestionEvaluationOut(BaseModel):
    question_id: str
    question: str
    candidate_answer: str
    overall_score: float = Field(..., ge=0, le=100)
    technical_score: float = Field(..., ge=0, le=100)
    clarity_score: float = Field(..., ge=0, le=100)
    structure_score: float = Field(..., ge=0, le=100)
    confidence_score: float = Field(..., ge=0, le=100)
    matched_keywords: List[str] = []
    missing_keywords: List[str] = []
    strengths: List[str] = []
    improvements: List[str] = []
    ideal_answer: str


class CompleteSessionRequest(BaseModel):
    session_id: str


class CompleteSessionResponse(BaseModel):
    session_id: str
    user_id: str
    role_id: str
    role_title: str
    round_type: str
    difficulty: str
    total_questions: int
    completed_questions: int
    average_score: float
    technical_score: float
    clarity_score: float
    structure_score: float
    confidence_score: float
    grade: str  # e.g., 'S (Top 5%)', 'A (Strong)', 'B (Competent)', 'C (Developing)'
    summary_feedback: str
    evaluations: List[QuestionEvaluationOut]
    created_at: datetime


class InterviewHistoryItem(BaseModel):
    session_id: str
    role_id: str
    role_title: str
    round_type: str
    difficulty: str
    total_questions: int
    average_score: float
    grade: str
    created_at: datetime


class RoleOption(BaseModel):
    role_id: str
    title: str
    category: str
    available_rounds: List[str]
