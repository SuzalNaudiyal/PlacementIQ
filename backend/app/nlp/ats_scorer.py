"""
ATS Compatibility Scoring Engine.
Evaluates resume text against industry applicant tracking systems (ATS) criteria:
Section completeness, action verb impact, quantified achievements, formatting readability, and technical density.
"""

import re
from typing import Dict, Any, List

ACTION_VERBS = [
    "architected", "engineered", "developed", "optimized", "spearheaded",
    "designed", "implemented", "orchestrated", "accelerated", "automated",
    "streamlined", "built", "deployed", "scaled", "reduced", "led",
    "created", "maintained", "analyzed", "collaborated", "integrated",
    "configured", "debugged", "refactored", "benchmarked", "achieved"
]

METRIC_PATTERNS = [
    r'\b\d+(?:\.\d+)?%',                                # Percentages e.g. 35%, 12.5%
    r'\b\d+(?:\.\d+)?x\b',                              # Multipliers e.g. 2x, 5.5x
    r'\$\d+(?:,\d{3})*(?:\.\d+)?(?:k|m|b)?\b',          # Dollar values e.g. $50k
    r'₹\d+(?:,\d{3})*(?:\.\d+)?(?:k|lakh|cr)?\b',       # Rupee values
    r'\b\d+(?:,\d{3})*\+?\s*(?:users|clients|requests|queries|students|transactions|records)\b',  # Volume
    r'\b(?:reduced|increased|improved|boosted|saved|cut)\s+(?:by\s+)?\d+',                         # Impact deltas
    r'\b\d+\s*(?:ms|seconds|minutes|hours|days|weeks)\b',                                          # Latency/Time
]


def score_resume_ats(
    text: str,
    parsed_contact: Dict[str, Any],
    parsed_education: Dict[str, Any],
    parsed_skills: Dict[str, List[str]],
    sections: Dict[str, str],
    total_words: int,
    page_count: int,
) -> Dict[str, Any]:
    """
    Computes an objective 0 - 100 ATS compatibility score with transparent criteria breakdowns.
    """
    section_scores = []
    strengths = []
    improvements = []

    # 1. Section Completeness (Max 25 pts)
    sec_pts = 0
    missing_sections = []
    if parsed_contact.get("email") and (parsed_contact.get("phone") or parsed_contact.get("linkedin")):
        sec_pts += 5
    else:
        missing_sections.append("Contact Details (Email & Phone)")

    if sections.get("education") or parsed_education.get("degree"):
        sec_pts += 5
    else:
        missing_sections.append("Education")

    total_skills_count = sum(len(v) for v in parsed_skills.values())
    if sections.get("skills") or total_skills_count >= 3:
        sec_pts += 5
    else:
        missing_sections.append("Skills / Technical Expertise")

    if sections.get("projects") or len(sections.get("projects", "")) > 40:
        sec_pts += 5
    else:
        missing_sections.append("Projects")

    if sections.get("experience") or len(sections.get("experience", "")) > 40:
        sec_pts += 5
    else:
        improvements.append("Consider adding an Experience/Internship section to highlight real-world exposure.")

    section_scores.append({
        "section_name": "Section Architecture",
        "score": sec_pts,
        "max_score": 25,
        "status": "Optimal" if sec_pts >= 20 else "Incomplete",
        "feedback": "Standard ATS headers detected." if sec_pts >= 20 else f"Missing standard sections: {', '.join(missing_sections)}.",
    })
    if sec_pts >= 20:
        strengths.append("Standard ATS section headers present (Contact, Education, Skills, Projects).")

    # 2. Action Verbs Strength (Max 20 pts)
    lower_text = text.lower()
    verbs_found = [v for v in ACTION_VERBS if re.search(rf'\b{v}\b', lower_text)]
    verbs_count = len(verbs_found)

    if verbs_count >= 6:
        verb_pts = 20
        strengths.append(f"Strong action verb presence ({verbs_count} impactful verbs detected like {', '.join(verbs_found[:3])}).")
    elif verbs_count >= 4:
        verb_pts = 14
    elif verbs_count >= 2:
        verb_pts = 8
        improvements.append("Use more decisive action verbs (e.g., 'architected', 'spearheaded', 'optimized') at the start of bullet points.")
    else:
        verb_pts = 3
        improvements.append("Bullet points lack strong action verbs. Replace passive phrasing with active verbs ('built', 'engineered', 'streamlined').")

    section_scores.append({
        "section_name": "Action Verb Power",
        "score": verb_pts,
        "max_score": 20,
        "status": "High" if verb_pts >= 14 else "Moderate" if verb_pts >= 8 else "Weak",
        "feedback": f"Found {verbs_count} unique leadership and engineering action verbs.",
    })

    # 3. Quantified Achievements (Max 20 pts)
    quant_matches = []
    for pat in METRIC_PATTERNS:
        matches = re.findall(pat, lower_text)
        quant_matches.extend(matches)
    quant_count = len(quant_matches)

    if quant_count >= 4:
        quant_pts = 20
        strengths.append(f"Excellent quantifiable achievements ({quant_count}+ metrics, KPIs, or percentages demonstrating measurable impact).")
    elif quant_count >= 2:
        quant_pts = 14
        strengths.append(f"Includes quantifiable figures ({quant_count} metric points).")
    elif quant_count >= 1:
        quant_pts = 8
        improvements.append("Quantify your project outcomes with metrics (e.g., 'improved query speed by 40%', 'served 2,000+ API requests').")
    else:
        quant_pts = 0
        improvements.append("Critical: No quantified achievements found. ATS algorithms prioritize resumes with numeric outcomes (%, ms, $, volume).")

    section_scores.append({
        "section_name": "Quantified Business Impact",
        "score": quant_pts,
        "max_score": 20,
        "status": "Strong" if quant_pts >= 14 else "Moderate" if quant_pts >= 8 else "Needs Quantifiers",
        "feedback": f"Detected {quant_count} quantified outcome references in text.",
    })

    # 4. Readability & Length Appropriateness (Max 20 pts)
    if 350 <= total_words <= 900 and page_count <= 2:
        len_pts = 20
        strengths.append(f"Ideal length and density for campus recruitment ({total_words} words across {page_count} page(s)).")
    elif 200 <= total_words <= 1100:
        len_pts = 14
    elif total_words < 200:
        len_pts = 5
        improvements.append("Resume is too brief (< 200 words). Add details about academic projects, coursework, and responsibilities.")
    else:
        len_pts = 10
        improvements.append(f"Resume is very long ({total_words} words). Campus recruiters strongly prefer a concise 1-page resume for freshers.")

    section_scores.append({
        "section_name": "Length & Readability Density",
        "score": len_pts,
        "max_score": 20,
        "status": "Ideal" if len_pts >= 18 else "Acceptable" if len_pts >= 14 else "Sub-optimal",
        "feedback": f"Document contains {total_words} words ({page_count} page(s)).",
    })

    # 5. Technical Skill Density (Max 15 pts)
    if total_skills_count >= 8:
        skill_pts = 15
        strengths.append(f"High technical skill density ({total_skills_count} verified industry tools across programming, databases, and frameworks).")
    elif total_skills_count >= 5:
        skill_pts = 11
    elif total_skills_count >= 3:
        skill_pts = 7
        improvements.append("Expand your skills list with specific frameworks, databases, and cloud tools.")
    else:
        skill_pts = 3
        improvements.append("Only very few technical skills detected. Ensure technologies used in projects are clearly listed in a Skills section.")

    section_scores.append({
        "section_name": "Technical Keyword Density",
        "score": skill_pts,
        "max_score": 15,
        "status": "High" if skill_pts >= 11 else "Moderate" if skill_pts >= 7 else "Low",
        "feedback": f"Matched {total_skills_count} canonical industry skills.",
    })

    # Total Score & Penalties
    raw_total = sec_pts + verb_pts + quant_pts + len_pts + skill_pts

    # Disqualification penalties
    penalty = 0
    if not parsed_contact.get("email"):
        penalty += 15
        improvements.insert(0, "High Risk: Valid email address is missing from header.")
    if not parsed_contact.get("phone"):
        penalty += 10
        improvements.insert(0, "Contact phone number was not detected.")

    total_score = max(0, min(100, raw_total - penalty))

    # Rating Tier
    if total_score >= 85:
        rating = "Excellent ATS Optimization (Tier 1 Ready)"
        summary = "Your resume has high structural integrity, quantified impact, and strong technical keyword density for enterprise ATS filters."
    elif total_score >= 70:
        rating = "Good ATS Compatibility (Competitive)"
        summary = "Your resume will comfortably clear standard recruiter ATS filters, with minor improvements recommended for metrics."
    elif total_score >= 50:
        rating = "Fair (Needs Structural & Impact Polish)"
        summary = "Your resume is readable but lacks measurable performance metrics or strong action verbs necessary to rank in the top decile."
    else:
        rating = "High Rejection Risk by ATS Filters"
        summary = "Significant sections, contact identifiers, or quantified metrics are missing. High probability of automated screening rejection."

    return {
        "total_score": total_score,
        "rating": rating,
        "summary": summary,
        "section_scores": section_scores,
        "action_verbs_found": verbs_found,
        "quantified_bullets_count": quant_count,
        "strengths": strengths[:4],
        "critical_improvements": improvements[:5],
    }
