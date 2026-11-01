"""
Skill Gap Analysis Engine.
Calculates 3-tier weighted role matching (Critical 50%, Important 35%, Optional 15%),
identifies missing disqualifiers, estimates prep time, and ranks recommended learning focus.
"""

import re
from typing import Dict, Any, List, Union, Set
from backend.app.models.job_roles import JOB_ROLES, get_all_roles, get_role_by_id
from backend.app.nlp.parser import SKILL_ALIASES


def normalize_skill(skill_str: str) -> str:
    """Normalize skill name using canonical alias dictionary."""
    clean = skill_str.strip().lower()
    return SKILL_ALIASES.get(clean, skill_str.strip())


def extract_candidate_skill_set(skills_data: Union[Dict[str, Any], List[str]]) -> Set[str]:
    """
    Extract a normalized set of uppercase/canonical skill names from
    either a flat list or categorized skills dictionary.
    """
    skill_set = set()

    if isinstance(skills_data, dict):
        for val in skills_data.values():
            if isinstance(val, list):
                for s in val:
                    if isinstance(s, str):
                        skill_set.add(normalize_skill(s).lower())
            elif isinstance(val, str):
                skill_set.add(normalize_skill(val).lower())
    elif isinstance(skills_data, list):
        for s in skills_data:
            if isinstance(s, str):
                skill_set.add(normalize_skill(s).lower())

    return skill_set


def match_skill_list(target_skills: List[str], candidate_skills_lower: Set[str]) -> Dict[str, Any]:
    """Matches a list of target skills against candidate skill set."""
    acquired = []
    missing = []

    for s in target_skills:
        canonical = normalize_skill(s)
        if canonical.lower() in candidate_skills_lower or s.lower() in candidate_skills_lower:
            acquired.append(s)
        else:
            missing.append(s)

    return {
        "acquired": acquired,
        "missing": missing,
        "total": len(target_skills),
        "match_ratio": len(acquired) / len(target_skills) if target_skills else 1.0,
    }


def analyze_skill_gap(
    candidate_skills: Union[Dict[str, Any], List[str]],
    role_id: str,
    candidate_cgpa: float = 7.0,
) -> Dict[str, Any]:
    """
    Perform deep 3-tier skill gap analysis for a specific target job role.
    """
    role = get_role_by_id(role_id)
    if not role:
        raise ValueError(f"Target role ID '{role_id}' not found.")

    candidate_skills_lower = extract_candidate_skill_set(candidate_skills)

    # 1. 3-Tier Matching
    crit_match = match_skill_list(role["critical_skills"], candidate_skills_lower)
    imp_match = match_skill_list(role["important_skills"], candidate_skills_lower)
    opt_match = match_skill_list(role["optional_skills"], candidate_skills_lower)

    # 2. Weighted Score Calculation
    # Critical: 50%, Important: 35%, Optional: 15%
    weighted_score = (
        0.50 * crit_match["match_ratio"]
        + 0.35 * imp_match["match_ratio"]
        + 0.15 * opt_match["match_ratio"]
    ) * 100.0

    match_percentage = round(weighted_score, 1)

    # 3. Categorized Missing Skills with Badges
    missing_critical = [
        {
            "name": s,
            "tier": "Critical",
            "badge_color": "rose",
            "status": "Disqualifier",
            "urgency": "High",
            "description": f"Mandatory requirement for {role['title']}. Without this skill, candidate is disqualified in preliminary screening.",
        }
        for s in crit_match["missing"]
    ]

    missing_important = [
        {
            "name": s,
            "tier": "Important",
            "badge_color": "amber",
            "status": "Recommended",
            "urgency": "Medium",
            "description": f"Highly sought after by top companies hiring for {role['title']}.",
        }
        for s in imp_match["missing"]
    ]

    missing_optional = [
        {
            "name": s,
            "tier": "Optional",
            "badge_color": "blue",
            "status": "Bonus Differentiator",
            "urgency": "Low",
            "description": "Bonus skill that sets you apart from other candidates in technical interviews.",
        }
        for s in opt_match["missing"]
    ]

    all_acquired = sorted(list(set(crit_match["acquired"] + imp_match["acquired"] + opt_match["acquired"])))

    # 4. Readiness Level
    if match_percentage >= 85:
        readiness_level = "Interview Ready"
        badge_color = "emerald"
        readiness_desc = "You satisfy the core technical requirements for this role. Focus on mock interviews and system design."
    elif match_percentage >= 68:
        readiness_level = "Nearly Ready"
        badge_color = "teal"
        readiness_desc = "Solid match! You only need to bridge 1-2 critical skills to be strongly competitive."
    elif match_percentage >= 45:
        readiness_level = "Moderate Gap"
        badge_color = "amber"
        readiness_desc = "Foundational match, but several key mandatory skills are missing before applying."
    else:
        readiness_level = "Significant Gap"
        badge_color = "rose"
        readiness_desc = "Major skill investment needed. Follow our structured 8-week roadmap to build core competencies."

    # 5. Estimated Time to Bridge Gap
    # Base prep weeks + 1.5 wks per missing critical + 0.8 wks per missing important
    raw_weeks = role.get("base_prep_weeks", 6) + len(missing_critical) * 1.5 + len(missing_important) * 0.8 - len(all_acquired) * 0.2
    est_weeks = max(2, min(20, round(raw_weeks)))

    # 6. High-ROI Learning Roadmap Ranking
    # Priority order: All Critical missing -> Top Important missing -> Top Optional
    roi_ranked = []
    for s in missing_critical:
        roi_ranked.append({
            "skill": s["name"],
            "tier": "Critical",
            "roi_impact": "High ROI (+15-20% match boost)",
            "action": f"Master fundamentals of {s['name']} and implement in at least 1 portfolio project.",
        })
    for s in missing_important[:3]:
        roi_ranked.append({
            "skill": s["name"],
            "tier": "Important",
            "roi_impact": "Medium ROI (+8-12% match boost)",
            "action": f"Learn intermediate concepts of {s['name']} and write sample tests or queries.",
        })
    for s in missing_optional[:2]:
        roi_ranked.append({
            "skill": s["name"],
            "tier": "Optional",
            "roi_impact": "Differentiator (+4-6% match boost)",
            "action": f"Read architecture guides and overview for {s['name']}.",
        })

    return {
        "role_id": role["id"],
        "role_title": role["title"],
        "category": role["category"],
        "industry_demand": role["industry_demand"],
        "salary_range": role["salary_range"],
        "description": role["description"],
        "min_recommended_cgpa": role["min_recommended_cgpa"],
        "cgpa_met": candidate_cgpa >= role["min_recommended_cgpa"],
        "match_percentage": match_percentage,
        "readiness_level": readiness_level,
        "badge_color": badge_color,
        "readiness_desc": readiness_desc,
        "estimated_prep_weeks": est_weeks,
        "critical_skills_summary": {
            "acquired_count": len(crit_match["acquired"]),
            "total_count": crit_match["total"],
            "acquired": crit_match["acquired"],
            "missing": crit_match["missing"],
        },
        "important_skills_summary": {
            "acquired_count": len(imp_match["acquired"]),
            "total_count": imp_match["total"],
            "acquired": imp_match["acquired"],
            "missing": imp_match["missing"],
        },
        "optional_skills_summary": {
            "acquired_count": len(opt_match["acquired"]),
            "total_count": opt_match["total"],
            "acquired": opt_match["acquired"],
            "missing": opt_match["missing"],
        },
        "acquired_skills": all_acquired,
        "missing_critical": missing_critical,
        "missing_important": missing_important,
        "missing_optional": missing_optional,
        "roi_recommendations": roi_ranked,
    }


def rank_all_roles_for_candidate(
    candidate_skills: Union[Dict[str, Any], List[str]],
    candidate_cgpa: float = 7.0,
) -> List[Dict[str, Any]]:
    """
    Ranks all 10 industry roles for candidate by match percentage.
    """
    results = []
    for role in get_all_roles():
        analysis = analyze_skill_gap(candidate_skills, role["id"], candidate_cgpa)
        results.append({
            "role_id": role["id"],
            "role_title": role["title"],
            "category": role["category"],
            "industry_demand": role["industry_demand"],
            "salary_range": role["salary_range"],
            "match_percentage": analysis["match_percentage"],
            "readiness_level": analysis["readiness_level"],
            "badge_color": analysis["badge_color"],
            "missing_critical_count": len(analysis["missing_critical"]),
            "missing_important_count": len(analysis["missing_important"]),
            "estimated_prep_weeks": analysis["estimated_prep_weeks"],
        })

    # Sort descending by match percentage
    results.sort(key=lambda x: x["match_percentage"], reverse=True)
    return results
