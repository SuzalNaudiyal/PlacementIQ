"""
Semantic Job Matching Engine.
Calculates multidimensional compatibility between candidate profile/resume and campus job listings.
Combines:
1. Required Technical Skills Overlap (45% weight)
2. Preferred Skills & Differentiators (15% weight)
3. Semantic Vector Cosine Similarity of descriptions/experience (30% weight)
4. Academic CGPA Eligibility (10% weight)
"""

import math
from typing import Dict, Any, List, Union, Set, Optional
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from backend.app.models.jobs import CAMPUS_JOBS, get_all_jobs, get_job_by_id
from backend.app.analytics.skill_gap import extract_candidate_skill_set, normalize_skill


def compute_semantic_similarity(candidate_text: str, job_text: str) -> float:
    """
    Computes cosine similarity between candidate text and job document
    using TF-IDF with sublinear term-frequency scaling and n-grams.
    """
    if not candidate_text.strip() or not job_text.strip():
        return 0.5  # Neutral fallback

    try:
        vectorizer = TfidfVectorizer(
            ngram_range=(1, 2),
            stop_words="english",
            sublinear_tf=True,
            lowercase=True,
        )
        tfidf_matrix = vectorizer.fit_transform([candidate_text, job_text])
        sim = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
        return float(max(0.0, min(1.0, sim)))
    except Exception:
        return 0.5


def evaluate_job_match(
    candidate_skills: Union[Dict[str, Any], List[str]],
    candidate_cgpa: float,
    job: Dict[str, Any],
    candidate_summary_text: str = "",
) -> Dict[str, Any]:
    """
    Evaluates candidate against a single campus placement opportunity.
    """
    candidate_skills_lower = extract_candidate_skill_set(candidate_skills)

    # 1. Required Skills Match (45%)
    required_acquired = []
    required_missing = []
    for req in job["required_skills"]:
        canonical = normalize_skill(req).lower()
        if canonical in candidate_skills_lower or req.lower() in candidate_skills_lower:
            required_acquired.append(req)
        else:
            required_missing.append(req)

    req_total = len(job["required_skills"])
    req_ratio = len(required_acquired) / req_total if req_total > 0 else 1.0

    # 2. Preferred Skills Match (15%)
    preferred_acquired = []
    preferred_missing = []
    for pref in job.get("preferred_skills", []):
        canonical = normalize_skill(pref).lower()
        if canonical in candidate_skills_lower or pref.lower() in candidate_skills_lower:
            preferred_acquired.append(pref)
        else:
            preferred_missing.append(pref)

    pref_total = len(job.get("preferred_skills", []))
    pref_ratio = len(preferred_acquired) / pref_total if pref_total > 0 else 1.0

    # 3. Semantic Text Similarity (30%)
    job_full_text = f"{job['title']} {job['company']} {job['description']} {' '.join(job['required_skills'])} {' '.join(job.get('preferred_skills', []))}"
    if not candidate_summary_text:
        # Construct summary from skills
        candidate_summary_text = "Experienced with " + ", ".join(list(candidate_skills_lower))

    text_similarity = compute_semantic_similarity(candidate_summary_text, job_full_text)

    # 4. Academic CGPA Score (10%)
    cgpa_eligible = candidate_cgpa >= job["min_cgpa"]
    if cgpa_eligible:
        cgpa_score = 1.0
    else:
        # Gradual penalty for deficit
        deficit = job["min_cgpa"] - candidate_cgpa
        cgpa_score = max(0.0, 1.0 - (deficit * 0.5))

    # 5. Composite Weighted Match Score
    composite_score = (
        0.45 * req_ratio
        + 0.15 * pref_ratio
        + 0.30 * text_similarity
        + 0.10 * cgpa_score
    ) * 100.0

    match_percentage = round(composite_score, 1)

    # 6. Fit Category and Badges
    if match_percentage >= 80 and cgpa_eligible and len(required_missing) <= 1:
        fit_status = "Strong Match"
        badge_color = "emerald"
        fit_rationale = (
            f"High alignment with {job['company']}. You satisfy {len(required_acquired)}/{req_total} "
            f"required core skills and meet academic CGPA thresholds."
        )
    elif match_percentage >= 65 and len(required_missing) <= 2:
        fit_status = "Good Match"
        badge_color = "teal"
        fit_rationale = (
            f"Competitive candidate profile. Bridging {len(required_missing)} missing core skill(s) "
            f"({', '.join(required_missing[:2])}) will maximize interview conversion."
        )
    elif match_percentage >= 45:
        fit_status = "Moderate Match"
        badge_color = "amber"
        fit_rationale = (
            f"Foundational match. Additional preparation required for key tech stack requirements "
            f"({', '.join(required_missing[:3])})."
        )
    else:
        fit_status = "Low Match / Stretch"
        badge_color = "rose"
        fit_rationale = (
            f"Significant technical gap. Role requires specialized stack items not currently present in your profile."
        )

    return {
        "job_id": job["id"],
        "title": job["title"],
        "company": job["company"],
        "company_tier": job["company_tier"],
        "logo_text": job["logo_text"],
        "location": job["location"],
        "salary_range": job["salary_range"],
        "min_cgpa": job["min_cgpa"],
        "candidate_cgpa": candidate_cgpa,
        "cgpa_eligible": cgpa_eligible,
        "job_type": job["job_type"],
        "deadline": job["deadline"],
        "description": job["description"],
        "experience_level": job["experience_level"],
        "match_percentage": match_percentage,
        "fit_status": fit_status,
        "badge_color": badge_color,
        "fit_rationale": fit_rationale,
        "semantic_similarity_score": round(text_similarity * 100.0, 1),
        "required_skills_acquired": required_acquired,
        "required_skills_missing": required_missing,
        "preferred_skills_acquired": preferred_acquired,
        "preferred_skills_missing": preferred_missing,
    }


def match_all_jobs_for_candidate(
    candidate_skills: Union[Dict[str, Any], List[str]],
    candidate_cgpa: float = 7.5,
    candidate_summary_text: str = "",
    filter_eligible_only: bool = False,
    company_tier_filter: Optional[str] = None,
    min_match_percentage: float = 0.0,
) -> List[Dict[str, Any]]:
    """
    Ranks all 16 campus placement opportunities for a candidate,
    with optional filtering by eligibility, tier, and minimum match score.
    """
    matches = []
    for job in get_all_jobs():
        evaluation = evaluate_job_match(
            candidate_skills=candidate_skills,
            candidate_cgpa=candidate_cgpa,
            job=job,
            candidate_summary_text=candidate_summary_text,
        )

        # Filters
        if filter_eligible_only and not evaluation["cgpa_eligible"]:
            continue
        if company_tier_filter and company_tier_filter != "All" and evaluation["company_tier"] != company_tier_filter:
            continue
        if evaluation["match_percentage"] < min_match_percentage:
            continue

        matches.append(evaluation)

    # Sort descending by match percentage
    matches.sort(key=lambda x: x["match_percentage"], reverse=True)
    return matches
