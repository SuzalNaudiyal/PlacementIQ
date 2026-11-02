from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime, timezone


class CodingProfileVerifyRequest(BaseModel):
    github_username: Optional[str] = Field(None, max_length=100, description="GitHub username or handle")
    leetcode_username: Optional[str] = Field(None, max_length=100, description="LeetCode username or handle")


class BadgeItem(BaseModel):
    id: str
    title: str
    tier: str
    icon: str


class GitHubStats(BaseModel):
    username: str
    avatar_url: Optional[str] = ""
    public_repos: int = 0
    stars_received: int = 0
    followers: int = 0
    top_languages: List[str] = Field(default_factory=list)
    recent_commits_30d: int = 0
    account_age_years: int = 1
    source: str = "live_api"


class LeetCodeStats(BaseModel):
    username: str
    total_solved: int = 0
    easy_solved: int = 0
    medium_solved: int = 0
    hard_solved: int = 0
    ranking: int = 100000
    acceptance_rate: float = 50.0
    contest_rating: Optional[int] = None
    source: str = "live_api"


class CodingProfileResponse(BaseModel):
    github_username: Optional[str] = None
    leetcode_username: Optional[str] = None
    github_stats: Optional[GitHubStats] = None
    leetcode_stats: Optional[LeetCodeStats] = None
    code_quality_index: float = Field(0.0, description="Code Quality Index score (0-100)")
    calibrated_coding_score: float = Field(70.0, description="Calibrated assessment coding score (50-100)")
    dsa_score_contribution: float = 0.0
    git_score_contribution: float = 0.0
    badges: List[BadgeItem] = Field(default_factory=list)
    last_synced_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

