"""
SVAR / Versant-style AI Voice & Spoken English Assessment Engine.
Evaluates English pronunciation, speech accuracy, memory retention, fluency index,
and CEFR communication band for sentence repeat and extempore speech exercises.
"""

from typing import List, Dict, Any, Tuple
import re
import math


SVAR_SENTENCE_BANK = [
    {
        "id": "svar_01",
        "level": "Level 1 (Fundamental)",
        "sentence": "Cloud computing allows organizations to scale their digital infrastructure effortlessly.",
        "difficulty": "Easy",
        "expected_duration_seconds": 6,
        "keywords": ["cloud", "computing", "organizations", "scale", "infrastructure", "effortlessly"],
    },
    {
        "id": "svar_02",
        "level": "Level 2 (Intermediate)",
        "sentence": "Effective communication between software engineers and product managers accelerates project delivery.",
        "difficulty": "Medium",
        "expected_duration_seconds": 7,
        "keywords": ["communication", "software", "engineers", "product", "managers", "accelerates", "delivery"],
    },
    {
        "id": "svar_03",
        "level": "Level 2 (Intermediate)",
        "sentence": "The algorithmic complexity of distributed data pipelines must be audited before deploying to production.",
        "difficulty": "Medium",
        "expected_duration_seconds": 8,
        "keywords": ["algorithmic", "complexity", "distributed", "pipelines", "audited", "deploying", "production"],
    },
    {
        "id": "svar_04",
        "level": "Level 3 (Advanced)",
        "sentence": "Artificial intelligence models require rigorously validated training datasets to minimize hallucinations and bias.",
        "difficulty": "Hard",
        "expected_duration_seconds": 9,
        "keywords": ["artificial", "intelligence", "rigorously", "validated", "datasets", "minimize", "hallucinations", "bias"],
    },
    {
        "id": "svar_05",
        "level": "Level 3 (Advanced)",
        "sentence": "Automated regression testing and continuous integration pipelines ensure enterprise software reliability under heavy traffic.",
        "difficulty": "Hard",
        "expected_duration_seconds": 10,
        "keywords": ["automated", "regression", "continuous", "integration", "enterprise", "reliability", "traffic"],
    },
]

EXTEMPORE_TOPICS = [
    {
        "id": "ext_01",
        "title": "Technical Challenge Resolution",
        "prompt": "Describe a challenging software project you worked on and how you resolved the most difficult technical bug or bottleneck.",
        "recommended_time_seconds": 45,
    },
    {
        "id": "ext_02",
        "title": "Why Hire You (Elevator Pitch)",
        "prompt": "Imagine you are in an interview with Google or Microsoft. Give a compelling 45-second elevator pitch explaining why they should hire you over other candidates.",
        "recommended_time_seconds": 45,
    },
    {
        "id": "ext_03",
        "title": "Technical Concept Explanation",
        "prompt": "Explain the difference between synchronous and asynchronous execution to a non-technical stakeholder using a real-world analogy.",
        "recommended_time_seconds": 45,
    },
]


def clean_words(text: str) -> List[str]:
    """Tokenize and clean punctuation for speech comparison."""
    cleaned = re.sub(r"[^\w\s]", "", text.lower())
    return [w for w in cleaned.split() if w]


def calculate_levenshtein_similarity(seq1: List[str], seq2: List[str]) -> float:
    """Computes word sequence similarity between 0.0 and 1.0 using edit distance."""
    if not seq1 and not seq2:
        return 1.0
    if not seq1 or not seq2:
        return 0.0

    n, m = len(seq1), len(seq2)
    dp = [[0] * (m + 1) for _ in range(n + 1)]

    for i in range(n + 1):
        dp[i][0] = i
    for j in range(m + 1):
        dp[0][j] = j

    for i in range(1, n + 1):
        for j in range(1, m + 1):
            cost = 0 if seq1[i - 1] == seq2[j - 1] else 1
            dp[i][j] = min(
                dp[i - 1][j] + 1,      # deletion
                dp[i][j - 1] + 1,      # insertion
                dp[i - 1][j - 1] + cost # substitution
            )

    edit_dist = dp[n][m]
    max_len = max(n, m)
    return max(0.0, 1.0 - (edit_dist / max_len))


def evaluate_sentence_repetition(
    expected_sentence: str,
    spoken_transcript: str,
    duration_seconds: float = 5.0,
    keywords: List[str] = None,
) -> Dict[str, Any]:
    """
    Evaluates a candidate's repetition of a spoken sentence.
    Computes:
    - Accuracy % (token match & sequence alignment)
    - Memory Retention % (whether key keywords were remembered and spoken)
    - Fluency Index % (absence of filler words, speaking pace)
    - Overall SVAR Score (0-100) and CEFR proficiency level
    """
    expected_tokens = clean_words(expected_sentence)
    spoken_tokens = clean_words(spoken_transcript)

    if not spoken_tokens:
        return {
            "accuracy_score": 0.0,
            "memory_retention_score": 0.0,
            "fluency_score": 0.0,
            "svar_score": 0.0,
            "cefr_band": "A1 (Beginner)",
            "missed_words": expected_tokens,
            "extra_words": [],
            "feedback": "No audible spoken response was detected. Please verify microphone permissions and speak clearly.",
        }

    # 1. Sequence Similarity & Accuracy
    seq_sim = calculate_levenshtein_similarity(expected_tokens, spoken_tokens)
    accuracy_score = round(seq_sim * 100, 1)

    # 2. Memory Retention (Keyword retention)
    target_keywords = [w.lower() for w in (keywords or expected_tokens)]
    spoken_set = set(spoken_tokens)
    retained_count = sum(1 for kw in target_keywords if kw in spoken_set)
    memory_score = round((retained_count / max(len(target_keywords), 1)) * 100, 1)

    # 3. Filler Words & Fluency Penalty
    filler_words = {"um", "uh", "err", "ah", "like", "you know", "basically"}
    filler_count = sum(1 for w in spoken_tokens if w in filler_words)

    # Pace: ideal English speech is ~130-160 words per minute (~2.2-2.7 words/sec)
    expected_dur = max(len(expected_tokens) / 2.5, 3.0)
    actual_dur = max(duration_seconds, 1.0)
    pace_ratio = actual_dur / expected_dur
    # Ideal pace ratio between 0.8 and 1.3
    pace_penalty = 0
    if pace_ratio > 1.6:  # too slow / hesitant
        pace_penalty = min(20, (pace_ratio - 1.6) * 15)
    elif pace_ratio < 0.6:  # too rushed / swallowed words
        pace_penalty = 15

    fluency_score = max(10.0, round(100.0 - (filler_count * 8) - pace_penalty, 1))

    # 4. Overall Weighted SVAR Score
    # 45% Accuracy + 35% Memory Retention + 20% Fluency
    composite_svar = round(
        (0.45 * accuracy_score) + (0.35 * memory_score) + (0.20 * fluency_score), 1
    )

    # 5. CEFR Mapping
    if composite_svar >= 88:
        cefr = "C1 / C2 (Advanced Fluent)"
        feedback = "Outstanding English clarity, memory retention, and native-level fluency. Ready for Tier-1 multinational interviews."
    elif composite_svar >= 75:
        cefr = "B2 (Upper Intermediate - Corporate Standard)"
        feedback = "Strong corporate English capability with clear articulation. Minor word omissions that can be polished with brief practice."
    elif composite_svar >= 60:
        cefr = "B1 (Intermediate)"
        feedback = "Good baseline comprehension, but noticeable hesitation and dropped sentence endings. Focus on speaking with continuous rhythm."
    else:
        cefr = "A2 (Pre-Intermediate)"
        feedback = "High frequency of omitted vocabulary and slow pacing. Recommend active listening and daily sentence repeat exercises."

    # Identify exact missed and extra words
    missed = [w for w in expected_tokens if w not in spoken_set]
    extra = [w for w in spoken_tokens if w not in set(expected_tokens) and w not in filler_words]

    return {
        "expected_sentence": expected_sentence,
        "spoken_transcript": spoken_transcript,
        "accuracy_score": accuracy_score,
        "memory_retention_score": memory_score,
        "fluency_score": fluency_score,
        "svar_score": composite_svar,
        "cefr_band": cefr,
        "filler_words_detected": filler_count,
        "missed_words": missed[:6],
        "extra_words": extra[:6],
        "feedback": feedback,
    }


def evaluate_extempore_speech(
    topic_title: str,
    spoken_transcript: str,
    duration_seconds: float = 30.0,
) -> Dict[str, Any]:
    """
    Evaluates an extempore spoken response for vocabulary variety, structure, and fluency.
    """
    tokens = clean_words(spoken_transcript)
    word_count = len(tokens)

    if word_count < 10:
        return {
            "topic": topic_title,
            "word_count": word_count,
            "speaking_rate_wpm": 0.0,
            "vocabulary_richness": 0.0,
            "coherence_score": 20.0,
            "overall_extempore_score": 25.0,
            "cefr_band": "A1/A2",
            "feedback": "Spoken response was too brief (under 10 words). Aim to speak for at least 30-45 seconds.",
        }

    # WPM (Words Per Minute)
    mins = max(duration_seconds / 60.0, 0.2)
    wpm = round(word_count / mins, 1)

    # Vocabulary Richness (Type-Token Ratio)
    unique_words = len(set(tokens))
    ttr = unique_words / word_count
    vocab_score = round(min(100.0, ttr * 130), 1)

    # Fluency Rate (ideal WPM: 110-150)
    if 105 <= wpm <= 160:
        fluency = 92.0
    elif 90 <= wpm < 105 or 160 < wpm <= 180:
        fluency = 78.0
    else:
        fluency = 60.0

    # Professional keywords presence
    tech_keywords = {
        "project", "architecture", "optimized", "implemented", "scalable", "challenge",
        "algorithm", "database", "latency", "system", "performance", "impact", "solution",
        "engineer", "team", "learned", "delivered", "design", "testing", "cloud",
    }
    key_hits = sum(1 for w in tokens if w in tech_keywords)
    relevance_score = min(100.0, 50.0 + (key_hits * 10))

    overall = round((0.4 * fluency) + (0.3 * vocab_score) + (0.3 * relevance_score), 1)

    if overall >= 85:
        cefr = "C1 (Professional Fluent)"
        feedback = f"Articulate and well-structured response ({word_count} words at {wpm} WPM). High vocabulary diversity and professional impact."
    elif overall >= 70:
        cefr = "B2 (Upper Intermediate)"
        feedback = f"Good communication flow ({wpm} WPM). Adding more concrete metrics and technical terminology will elevate this to Tier-1 level."
    else:
        cefr = "B1 (Intermediate)"
        feedback = f"Understandable delivery, but speech was slightly hesitant ({wpm} WPM). Practice structuring answers using Situation-Task-Action-Result (STAR)."

    return {
        "topic": topic_title,
        "word_count": word_count,
        "speaking_rate_wpm": wpm,
        "vocabulary_richness": vocab_score,
        "coherence_score": relevance_score,
        "overall_extempore_score": overall,
        "cefr_band": cefr,
        "feedback": feedback,
    }

