from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional
from datetime import datetime


class AptitudeQuestionOut(BaseModel):
    id: str
    category: str
    subtopic: str
    question: str
    options: List[str]


class SubmitAptitudeRequest(BaseModel):
    answers: Dict[str, int] = Field(..., description="Mapping of question ID to chosen option index (0-3)")
    time_taken_seconds: Optional[int] = Field(None, description="Time spent in seconds")


class AptitudeResultResponse(BaseModel):
    submission_id: str
    total_questions: int
    attempted_questions: int
    correct_answers: int
    overall_percentage: float
    attempted_accuracy_percentage: float
    readiness_status: str
    badge_awarded: str
    category_breakdown: Dict[str, Any]
    detailed_review: List[Dict[str, Any]]
    submitted_at: datetime


class SvarSentenceOut(BaseModel):
    id: str
    level: str
    sentence: str
    difficulty: str
    expected_duration_seconds: int


class ExtemporeTopicOut(BaseModel):
    id: str
    title: str
    prompt: str
    recommended_time_seconds: int


class SvarEvaluateSentenceRequest(BaseModel):
    sentence_id: str
    spoken_transcript: str
    duration_seconds: float = 5.0


class SvarSentenceEvaluationOut(BaseModel):
    submission_id: str
    expected_sentence: str
    spoken_transcript: str
    accuracy_score: float
    memory_retention_score: float
    fluency_score: float
    svar_score: float
    cefr_band: str
    filler_words_detected: int
    missed_words: List[str]
    extra_words: List[str]
    feedback: str
    submitted_at: datetime


class ExtemporeEvaluateRequest(BaseModel):
    topic_id: str
    spoken_transcript: str
    duration_seconds: float = 30.0


class ExtemporeEvaluationOut(BaseModel):
    submission_id: str
    topic: str
    word_count: int
    speaking_rate_wpm: float
    vocabulary_richness: float
    coherence_score: float
    overall_extempore_score: float
    cefr_band: str
    feedback: str
    submitted_at: datetime


class AdminAssessmentSubmissionOut(BaseModel):
    submission_id: str
    user_id: str
    student_name: str
    student_email: str
    test_type: str  # "aptitude_mcq" | "svar_sentence" | "svar_extempore"
    headline_score: float  # percentage or SVAR score
    rating_or_badge: str
    summary: Dict[str, Any]
    submitted_at: datetime
