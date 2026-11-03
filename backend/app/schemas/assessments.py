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


class SvarGrammarQuestionOut(BaseModel):
    id: str
    category: str
    question: str
    options: List[str]


class SubmitSvarGrammarRequest(BaseModel):
    answers: Dict[str, int] = Field(..., description="Mapping of question ID to chosen option index")
    time_taken_seconds: Optional[int] = None


class SvarGrammarResultResponse(BaseModel):
    submission_id: str
    total_questions: int
    correct_answers: int
    score_percentage: float
    cefr_band: str
    badge_awarded: str
    category_breakdown: Dict[str, Any]
    detailed_review: List[Dict[str, Any]]
    submitted_at: datetime


class SvarEvaluateSentenceRequest(BaseModel):
    sentence_id: str
    spoken_transcript: str
    duration_seconds: float = 5.0
    audio_data: Optional[str] = Field(None, description="Base64 encoded audio recording of the candidate voice")


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
    has_audio: bool = False
    audio_data: Optional[str] = None
    submitted_at: datetime


class ExtemporeEvaluateRequest(BaseModel):
    topic_id: str
    spoken_transcript: str
    duration_seconds: float = 30.0
    audio_data: Optional[str] = Field(None, description="Base64 encoded audio recording of extempore speech")


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
    has_audio: bool = False
    audio_data: Optional[str] = None
    submitted_at: datetime


class AdminAssessmentSubmissionOut(BaseModel):
    submission_id: str
    user_id: str
    student_name: str
    student_email: str
    test_type: str  # "aptitude_mcq" | "svar_sentence" | "svar_extempore" | "svar_grammar" | "placement_test"
    headline_score: float  # percentage or SVAR score
    rating_or_badge: str
    summary: Dict[str, Any]
    audio_data: Optional[str] = None
    submitted_at: datetime


class PlacementSectionQuestionOut(BaseModel):
    id: str
    company: str
    category: str
    subtopic: str
    question: str
    options: List[str]


class PlacementSectionOut(BaseModel):
    section_id: str
    section_number: int
    title: str
    badge: str
    company_tags: List[str]
    instructions: str
    duration_seconds: int
    questions: List[PlacementSectionQuestionOut]


class PlacementTestResponse(BaseModel):
    title: str
    subtitle: str
    total_sections: int
    total_questions: int
    total_duration_minutes: int
    sections: List[PlacementSectionOut]


class SubmitPlacementTestRequest(BaseModel):
    section_1_answers: Dict[str, int] = Field(..., description="Section 1 Grammar & Verbal answers")
    section_2_answers: Dict[str, int] = Field(..., description="Section 2 Quant & Data Chart answers")
    total_time_taken_seconds: Optional[int] = None


class PlacementTestResultResponse(BaseModel):
    submission_id: str
    total_questions: int
    total_attempted: int
    total_correct: int
    overall_percentage: float
    readiness_status: str
    badge_awarded: str
    section_1_summary: Dict[str, Any]
    section_2_summary: Dict[str, Any]
    eligible_companies: List[str]
    detailed_review: List[Dict[str, Any]]
    submitted_at: datetime
