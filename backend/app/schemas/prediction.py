"""
Pydantic schemas for Placement Prediction, What-If Simulation, and Model Transparency.
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class FactorDetail(BaseModel):
    factor: str
    impact: str
    explanation: str
    positive: bool


class PredictionResponse(BaseModel):
    placed: bool
    placement_probability: float = Field(..., ge=0.0, le=1.0)
    placement_percentage: float = Field(..., ge=0.0, le=100.0)
    readiness_status: str
    badge_color: str
    predicted_salary_tier: str
    model_used: str
    model_accuracy: float
    model_f1_score: float
    model_roc_auc: float
    top_positive_factors: List[FactorDetail]
    top_risk_factors: List[FactorDetail]
    recommendations: List[str]
    raw_features: Dict[str, Any]
    evaluated_at: Optional[str] = None


class SimulationRequest(BaseModel):
    cgpa: Optional[float] = Field(default=None, ge=0.0, le=10.0)
    backlogs: Optional[int] = Field(default=None, ge=0, le=20)
    coding_score: Optional[float] = Field(default=None, ge=0.0, le=100.0)
    aptitude_score: Optional[float] = Field(default=None, ge=0.0, le=100.0)
    communication_score: Optional[float] = Field(default=None, ge=0.0, le=100.0)
    internships_count: Optional[int] = Field(default=None, ge=0, le=10)
    projects_count: Optional[int] = Field(default=None, ge=0, le=20)


class SimulationResponse(BaseModel):
    baseline_percentage: float
    simulated_percentage: float
    net_gain_percent: float
    baseline_salary_tier: str
    simulated_salary_tier: str
    baseline: PredictionResponse
    simulated: PredictionResponse
    key_improvements: List[str]


class ModelInfoResponse(BaseModel):
    best_model_name: str
    trained_at: str
    dataset_samples: int
    test_samples: int
    decision_threshold: float
    metrics: Dict[str, Any]
    model_comparison: Dict[str, Any]
    feature_importances: Dict[str, float]
    salary_tiers: List[str]
