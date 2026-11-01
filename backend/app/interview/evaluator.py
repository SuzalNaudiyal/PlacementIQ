"""
Intelligent Response Evaluation Engine for AI Mock Interview Simulator.
Analyzes candidate answers across 4 core dimensions:
1. Technical Concept Accuracy (Keyword density & semantic coverage)
2. Communication Clarity & Articulation
3. Answer Structure (STAR methodology for behavioral, trade-offs for technical)
4. Confidence & Professionalism (Filler word mitigation & assertiveness)
"""

import re
from typing import Dict, Any, List, Tuple


FILLER_WORDS = [
    r"\bum+\b",
    r"\buh+\b",
    r"\blike\b",
    r"\byou know\b",
    r"\bi think maybe\b",
    r"\bi guess\b",
    r"\bsort of\b",
    r"\bkind of\b",
    r"\bbasically\b",
]

STAR_MARKERS = {
    "situation": ["when", "during", "at my", "project", "scenario", "context", "problem was", "time when"],
    "task": ["my role", "tasked with", "objective", "responsible for", "needed to", "goal was", "challenge was"],
    "action": ["i implemented", "i designed", "i created", "i investigated", "i proposed", "i refactored", "i researched", "i decided", "action i took"],
    "result": ["resulting in", "achieved", "reduced", "improved", "increased", "outcome", "learned", "successfully", "saved", "impact"],
}

TECHNICAL_STRUCTURE_MARKERS = [
    "first", "because", "for example", "specifically", "trade-off", "in contrast",
    "on the other hand", "under the hood", "complexity", "furthermore", "however"
]


def evaluate_candidate_answer(
    question: Dict[str, Any],
    candidate_answer: str,
    time_taken_seconds: int = 45,
) -> Dict[str, Any]:
    """
    Evaluates a candidate's answer for a specific interview question.
    Returns scores across dimensions and actionable feedback.
    """
    text = (candidate_answer or "").strip()
    words = re.findall(r"\b[A-Za-z0-9_\-\.\#\+]+\b", text.lower())
    word_count = len(words)

    # Base safety for empty or extremely brief answers
    if word_count < 5:
        return {
            "overall_score": 15.0,
            "technical_score": 10.0,
            "clarity_score": 20.0,
            "structure_score": 15.0,
            "confidence_score": 20.0,
            "matched_keywords": [],
            "missing_keywords": question.get("expected_keywords", [])[:4],
            "strengths": ["Attempted to answer within the allocated time window."],
            "improvements": [
                "Your response was too brief (< 5 words). Provide detailed explanations with examples.",
                f"Address the core concept: {question.get('concept', 'the technical topic')}.",
            ],
            "ideal_answer": question.get("ideal_answer", ""),
        }

    expected_keywords = question.get("expected_keywords", [])
    text_lower = text.lower()

    # 1. Technical Concept Accuracy (Keyword coverage + depth)
    matched_keywords: List[str] = []
    missing_keywords: List[str] = []

    for kw in expected_keywords:
        kw_clean = kw.lower().strip()
        if re.search(r"\b" + re.escape(kw_clean) + r"\b", text_lower):
            matched_keywords.append(kw)
        else:
            missing_keywords.append(kw)

    keyword_ratio = len(matched_keywords) / max(len(expected_keywords), 1)

    # Word count curve: optimal answer is 50-180 words for a 2-minute prompt
    if word_count < 25:
        length_factor = 0.5
    elif word_count < 50:
        length_factor = 0.8
    elif word_count <= 220:
        length_factor = 1.0
    else:
        length_factor = 0.9  # slight penalty for excessive rambling

    raw_tech = (keyword_ratio * 70.0 + (length_factor * 30.0))
    technical_score = round(min(max(raw_tech, 20.0), 98.0), 1)

    # 2. Communication Clarity & Articulation
    # Penalize overly short answers, reward complete sentences and diverse vocabulary
    sentences = [s.strip() for s in re.split(r"[.!?]+", text) if s.strip()]
    unique_words = len(set(words))
    lexical_diversity = unique_words / max(word_count, 1)

    clarity_base = 50.0
    if len(sentences) >= 2:
        clarity_base += 20.0
    if 0.45 <= lexical_diversity <= 0.85:
        clarity_base += 20.0
    if word_count >= 40:
        clarity_base += 10.0

    clarity_score = round(min(max(clarity_base, 25.0), 96.0), 1)

    # 3. Answer Structure
    round_type = question.get("round_type", "technical")
    structure_score = 60.0

    if round_type in ["behavioral", "hr"]:
        # Evaluate STAR framework coverage
        star_hits = 0
        for component, markers in STAR_MARKERS.items():
            if any(re.search(r"\b" + re.escape(m) + r"\b", text_lower) for m in markers):
                star_hits += 1
        structure_score = round(min(max(30.0 + (star_hits * 17.0), 30.0), 98.0), 1)
    else:
        # Technical structure: checks transition phrases, reasoning steps, and trade-offs
        tech_marker_hits = sum(
            1 for m in TECHNICAL_STRUCTURE_MARKERS
            if re.search(r"\b" + re.escape(m) + r"\b", text_lower)
        )
        structure_score = round(min(max(40.0 + (tech_marker_hits * 12.0), 35.0), 95.0), 1)

    # 4. Confidence & Professionalism
    # Count filler words
    filler_count = 0
    for filler in FILLER_WORDS:
        filler_count += len(re.findall(filler, text_lower))

    confidence_base = 90.0 - (filler_count * 12.0)
    if word_count < 30:
        confidence_base -= 15.0
    confidence_score = round(min(max(confidence_base, 20.0), 98.0), 1)

    # 5. Composite Overall Score
    if round_type in ["behavioral", "hr"]:
        overall = (
            technical_score * 0.25 +
            structure_score * 0.35 +
            clarity_score * 0.25 +
            confidence_score * 0.15
        )
    else:
        overall = (
            technical_score * 0.40 +
            clarity_score * 0.25 +
            structure_score * 0.20 +
            confidence_score * 0.15
        )

    overall_score = round(min(max(overall, 15.0), 99.0), 1)

    # 6. Generate Contextual Strengths & Improvement Suggestions
    strengths: List[str] = []
    improvements: List[str] = []

    if keyword_ratio >= 0.6:
        strengths.append(f"Strong grasp of technical terminology; correctly cited: {', '.join(matched_keywords[:3])}.")
    elif len(matched_keywords) > 0:
        strengths.append(f"Accurately incorporated foundational terms ({', '.join(matched_keywords)}).")
    else:
        improvements.append(f"Incorporate standard terminology like: {', '.join(expected_keywords[:3])}.")

    if structure_score >= 75:
        if round_type in ["behavioral", "hr"]:
            strengths.append("Structured response well according to the STAR methodology (Situation, Task, Action, Result).")
        else:
            strengths.append("Logically structured answer with cause-and-effect reasoning and trade-offs.")
    else:
        if round_type in ["behavioral", "hr"]:
            improvements.append("Structure using STAR: explicitly describe the Situation, Task, your specific Action, and the quantifiable Result.")
        else:
            improvements.append("Use structured reasoning: define the component first, explain how it works under the hood, and mention trade-offs.")

    if filler_count == 0 and word_count >= 40:
        strengths.append("High verbal clarity and crisp execution with zero noticeable filler expressions.")
    elif filler_count > 1:
        improvements.append(f"Detected {filler_count} filler words ('um', 'like', 'i guess'). Speak with concise, assertive statements.")

    if word_count < 40:
        improvements.append("Expand on your explanation by providing a concrete real-world engineering example.")

    if not strengths:
        strengths.append("Answer touched on relevant concepts and demonstrated baseline awareness.")

    return {
        "overall_score": overall_score,
        "technical_score": technical_score,
        "clarity_score": clarity_score,
        "structure_score": structure_score,
        "confidence_score": confidence_score,
        "matched_keywords": matched_keywords,
        "missing_keywords": missing_keywords,
        "strengths": strengths,
        "improvements": improvements,
        "ideal_answer": question.get("ideal_answer", ""),
    }


def compute_session_grade(average_score: float) -> Tuple[str, str]:
    """
    Computes performance tier grade and summary commentary.
    """
    if average_score >= 90.0:
        return "S (Top 5% Placement Ready)", "Outstanding performance. Demonstrated senior-level conceptual depth, crisp communication, and rigorous structured answers."
    elif average_score >= 80.0:
        return "A (High Interview Readiness)", "Strong interview capability. Consistently covered key technical concepts with clear delivery and minimal hesitation."
    elif average_score >= 70.0:
        return "B (Competent / Advancing)", "Solid foundational understanding. Enhance technical depth by explaining internal mechanics and citing quantifiable project metrics."
    elif average_score >= 55.0:
        return "C (Developing Readiness)", "Demonstrated basic awareness, but answers lacked structured methodology and omitted several critical technical terms."
    else:
        return "D (Needs Targeted Practice)", "Substantial gaps in conceptual explanation and structure. Review ideal answers, eliminate filler words, and practice with timed speech."
