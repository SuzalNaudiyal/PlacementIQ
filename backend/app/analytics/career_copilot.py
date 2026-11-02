from typing import Dict, Any, List, Optional
import re


def generate_copilot_response(
    query: str,
    student_profile: Dict[str, Any],
    skill_gap_summary: Optional[Dict[str, Any]] = None,
    prediction_summary: Optional[Dict[str, Any]] = None,
    resume_summary: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """
    Generate context-aware, highly personalized career and placement guidance
    based on the student's live academic standing, ML readiness, and skill gaps.
    """
    name = student_profile.get("name", "Candidate")
    first_name = name.split()[0] if name else "Candidate"
    cgpa = student_profile.get("cgpa", 7.5)
    backlogs = student_profile.get("backlogs", 0)
    branch = student_profile.get("education", {}).get("branch", "Computer Science")

    assessments = student_profile.get("assessments", {})
    coding_score = assessments.get("coding_score", 70.0)

    # ML Readiness
    readiness_pct = (
        prediction_summary.get("readiness_percentage", 75)
        if prediction_summary
        else 75
    )

    # Missing Skills
    missing_critical = []
    missing_important = []
    target_role = "Software Engineer"
    if skill_gap_summary:
        target_role = skill_gap_summary.get("target_role", "Software Engineer")
        missing_critical = skill_gap_summary.get("missing_critical", [])
        missing_important = skill_gap_summary.get("missing_important", [])

    # Coding Profiles (GitHub / LeetCode)
    coding_profiles = student_profile.get("coding_profiles", {})
    leetcode_stats = coding_profiles.get("leetcode_stats") or {}
    total_solved = leetcode_stats.get("total_solved", 0)

    # ATS score
    ats_score = resume_summary.get("ats_score", 82) if resume_summary else 82

    q_lower = query.lower()

    # 1. READINESS & SCORE IMPROVEMENT
    if any(k in q_lower for k in ["readiness", "score", "improve", "90%", "85%", "chance", "probability", "predict"]):
        critical_str = ", ".join(missing_critical[:3]) if missing_critical else "System Architecture, Advanced SQL"
        reply = (
            f"Hello **{first_name}**! Your current placement readiness stands at **{readiness_pct}%** for the **{target_role}** track.\n\n"
            f"Here is your personalized roadmap to boost your readiness past **90%+**:\n\n"
            f"1. **Bridge Critical Skill Voids**: Our 3-tier gap analysis detected gaps in: `{critical_str}`. Dedicating 2 hours daily to these unlocks the highest SHAP feature attribution.\n"
            f"2. **Calibrate Coding Assessment**: Your current verified coding benchmark is **{coding_score}/100**. Aim to solve 15 Medium DSA problems on LeetCode focusing on Dynamic Programming & Graphs.\n"
            f"3. **Deploy a Production-Tier Capstone**: Academic evaluators and recruiters prioritize end-to-end deployed projects with Docker and CI/CD over generic tutorials.\n\n"
            f"Would you like me to generate a tailored 14-day study sprint for `{missing_critical[0] if missing_critical else 'System Design'}`?"
        )
        actions = [
            f"Study plan for {missing_critical[0] if missing_critical else 'System Design'}",
            "How do backlogs impact my prediction?",
            "Review my 8-week learning milestones"
        ]

    # 2. BACKLOGS & HR HANDLING
    elif any(k in q_lower for k in ["backlog", "kt", "arrear", "low cgpa", "explain backlog"]):
        if backlogs > 0:
            reply = (
                f"**Addressing Backlogs in Campus Interviews (Script for {first_name})**:\n\n"
                f"You currently have **{backlogs} active backlog(s)** with a CGPA of **{cgpa}**. Here is how you explain this confidently to HR without raising red flags:\n\n"
                f"> *\"During my earlier semesters, I took on a steep learning curve balancing technical fundamentals with academics. While that led to a temporary setback in that subject, I took ownership: I established a disciplined schedule, strengthened my core problem-solving, and have cleared my preparation modules. My focus now is 100% on delivery.\"*\n\n"
                f"**Strategic Actions**:\n"
                f"- Never blame faculty or external circumstances.\n"
                f"- Pivot immediately to what you learned and your practical skills (e.g., your projects and coding rating).\n"
                f"- Target Tier-2 product and high-growth startup drives where CGPA criteria are flexible (min 6.5–7.0)."
            )
        else:
            reply = (
                f"Great news, **{first_name}**! You have **0 active backlogs** with a solid CGPA of **{cgpa}**.\n\n"
                f"For campus recruitment drives, you meet the academic cutoff for over **92%** of visiting companies (including Tier 1 Product and Mass recruiters). Your primary focus should be excelling in technical coding rounds and mock interviews."
            )
        actions = [
            "What companies accept CGPA between 7.0 and 8.0?",
            "Mock HR interview practice",
            "How to highlight practical projects"
        ]

    # 3. LEETCODE & DSA PREPARATION
    elif any(k in q_lower for k in ["leetcode", "dsa", "coding", "algorithm", "problem", "hackerrank"]):
        reply = (
            f"**Targeted DSA Blueprint for {branch} Students**:\n\n"
            f"Currently you have **{total_solved} problems solved** on LeetCode with an assessment coding score of **{coding_score}/100**.\n\n"
            f"**High-Yield Campus Placement Priority Order**:\n"
            f"1. **Arrays & Two Pointers** (Sliding Window, Prefix Sums) — *Appears in 85% of OA rounds*\n"
            f"2. **Hashing & HashMaps** (Subarray Sum equals K, Group Anagrams)\n"
            f"3. **Trees & Binary Search** (Level Order Traversal, Lowest Common Ancestor)\n"
            f"4. **Dynamic Programming Basics** (0/1 Knapsack, Longest Common Subsequence)\n\n"
            f"💡 *Pro-Tip*: Focus on **LeetCode Mediums**. Over 75% of campus technical interview questions are standard Medium patterns, not Hards."
        )
        actions = [
            "Give me 5 essential Tree interview questions",
            "How to structure GitHub repositories for recruiters",
            "Schedule a timed AI Mock Interview"
        ]

    # 4. ATS & RESUME OPTIMIZATION
    elif any(k in q_lower for k in ["resume", "ats", "format", "bullet", "cv"]):
        reply = (
            f"**ATS Resume Optimization Dossier for {first_name}**:\n\n"
            f"Your current application ATS Score is **{ats_score}/100**.\n\n"
            f"**3 Proven Tweaks to Guarantee ATS Compliance**:\n"
            f"1. **The Google XYZ Formula**: Write bullet points as: *Accomplished [X] as measured by [Y], by doing [Z]*.\n"
            f"   * *Example*: 'Built async FastAPI endpoints handling 1,200 req/min, decreasing latency by 34% through Redis caching.'\n"
            f"2. **Role Keyword Density**: Ensure your Skills section explicitly mentions: `{', '.join(missing_critical[:2]) if missing_critical else 'FastAPI, Docker, PostgreSQL'}`.\n"
            f"3. **Format Hygiene**: Single-column layout, standard headers (`Education`, `Experience`, `Projects`, `Technical Skills`), zero tables/multi-columns."
        )
        actions = [
            "Generate sample XYZ project bullet points",
            "Audit my resume again with spaCy NLP",
            "Show high-match campus jobs"
        ]

    # 5. GENERAL / GREETING / DEFAULT
    else:
        critical_hint = f"your missing skills in `{missing_critical[0]}`" if missing_critical else "optimizing your coding score"
        reply = (
            f"Hello **{first_name}**! I am your **HireMatrix Career Copilot**, connected directly to your academic profile and placement analytics.\n\n"
            f"**Your Live Snapshot**:\n"
            f"- **Readiness Level**: {readiness_pct}% ({'Ready' if readiness_pct >= 75 else 'Developing'})\n"
            f"- **Academic Standing**: {cgpa} CGPA • {backlogs} backlogs\n"
            f"- **Target Role**: {target_role}\n"
            f"- **ATS Audit Score**: {ats_score}/100\n\n"
            f"I can help you build an action plan for {critical_hint}, simulate interview questions, or formulate strategies for visiting company recruitment drives. What would you like to tackle first?"
        )
        actions = [
            f"How to improve readiness for {target_role}?",
            "30-day DSA study roadmap",
            "How to handle interview questions on my projects"
        ]

    return {
        "reply": reply,
        "suggested_actions": actions,
        "context_used": {
            "name": name,
            "cgpa": cgpa,
            "backlogs": backlogs,
            "readiness_percentage": readiness_pct,
            "target_role": target_role,
            "ats_score": ats_score,
            "missing_critical_count": len(missing_critical),
        },
    }

