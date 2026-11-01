"""
Pydantic schemas for Personalized 8-Week Learning Roadmap.
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class TaskItem(BaseModel):
    id: str
    title: str
    estimated_hours: int
    difficulty: str
    completed: bool = False
    resource_url: Optional[str] = None


class WeeklyModule(BaseModel):
    week_number: int
    title: str
    theme: str
    badge_color: str
    target_hours: int
    focus_skills: List[str]
    learning_goals: List[str]
    tasks: List[TaskItem]
    milestone_deliverable: str


class RoadmapResponse(BaseModel):
    target_role_id: str
    target_role_title: str
    target_category: str
    starting_match_percentage: float
    projected_completion_match: float
    total_weeks: int
    total_tasks: int
    completed_tasks: int
    progress_percentage: float
    missing_critical_count: int
    missing_important_count: int
    weeks: List[WeeklyModule]


class GenerateRoadmapRequest(BaseModel):
    role_id: str = Field(default="full-stack-developer")


class ToggleTaskRequest(BaseModel):
    task_id: str
    completed: bool
