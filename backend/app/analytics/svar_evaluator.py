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


# =========================================================================
# SVAR ENGLISH GRAMMAR & SENTENCE STRUCTURE BANK
# =========================================================================
SVAR_GRAMMAR_BANK: List[Dict[str, Any]] = [
    {
        "id": "gram_01",
        "category": "Subject-Verb Agreement",
        "question": "Neither the project manager nor the software developers _______ available to attend the sprint retrospective.",
        "options": ["was", "were", "is", "has been"],
        "correct_option_index": 1,  # 'were'
        "explanation": "In 'Neither... nor' sentences, the verb agrees with the subject closest to it. 'The software developers' is plural, so 'were' is correct.",
    },
    {
        "id": "gram_02",
        "category": "Tenses & Conditionals",
        "question": "If the DevOps engineer _______ the automated backup script yesterday, the database outage would have been avoided.",
        "options": ["had executed", "would execute", "has executed", "executed"],
        "correct_option_index": 0,  # 'had executed'
        "explanation": "Third conditional structures follow: If + had + past participle (V3), ... would have + past participle.",
    },
    {
        "id": "gram_03",
        "category": "Prepositions",
        "question": "All engineering employees must comply _______ the newly established cybersecurity protocol.",
        "options": ["with", "to", "at", "for"],
        "correct_option_index": 0,  # 'comply with'
        "explanation": "The verb 'comply' always takes the preposition 'with' ('comply with the protocol').",
    },
    {
        "id": "gram_04",
        "category": "Prepositions",
        "question": "The senior architect congratulated the team _______ successfully deploying the microservices cluster.",
        "options": ["on", "for", "about", "with"],
        "correct_option_index": 0,  # 'congratulate on'
        "explanation": "'Congratulate' takes the preposition 'on' (or 'upon'), not 'for' ('congratulated on successfully deploying').",
    },
    {
        "id": "gram_05",
        "category": "Error Spotting",
        "question": "Identify the segment containing a grammatical error:\n(A) Despite of / (B) the heavy network latency / (C) the transaction completed / (D) within SLA.",
        "options": [
            "(A) Despite of",
            "(B) the heavy network latency",
            "(C) the transaction completed",
            "(D) within SLA",
        ],
        "correct_option_index": 0,  # 'Despite of' is incorrect
        "explanation": "'Despite' is never followed by 'of'. The correct usage is either 'Despite the heavy network latency' or 'In spite of the heavy network latency'.",
    },
    {
        "id": "gram_06",
        "category": "Sentence Correction",
        "question": "Choose the most grammatically accurate sentence for an executive technical document:",
        "options": [
            "The committee has decided to postpone the cloud migration until next quarter.",
            "The committee have decided to postpone the cloud migration until next quarter.",
            "The committee has decide to postpone the cloud migration until next quarter.",
            "The committee are deciding to postpone the cloud migration until next quarter.",
        ],
        "correct_option_index": 0,
        "explanation": "'Committee' functions as a collective singular noun acting as a single unit, so the singular auxiliary verb 'has decided' is grammatically correct.",
    },
    {
        "id": "gram_07",
        "category": "Vocabulary in Context",
        "question": "The sudden spike in server response time was _______ to an unindexed foreign key in the relational database.",
        "options": ["attributed", "contributed", "distributed", "constituted"],
        "correct_option_index": 0,  # 'attributed to'
        "explanation": "'Attributed to' means regarded as being caused by ('The spike was attributed to an unindexed foreign key').",
    },
    {
        "id": "gram_08",
        "category": "Subject-Verb Agreement",
        "question": "A cluster of five Redis cache nodes _______ deployed to minimize database read traffic.",
        "options": ["was", "were", "are", "have been"],
        "correct_option_index": 0,  # 'was'
        "explanation": "The head noun of the subject is 'cluster' (singular), not 'nodes'. Therefore, the singular verb 'was' is required.",
    },
    {
        "id": "gram_09",
        "category": "Active & Passive Voice",
        "question": "Convert to passive voice: 'The QA team thoroughly tested all API endpoints before release.'",
        "options": [
            "All API endpoints were thoroughly tested by the QA team before release.",
            "All API endpoints have been thoroughly tested by the QA team before release.",
            "All API endpoints was thoroughly tested by the QA team before release.",
            "All API endpoints are thoroughly tested by the QA team before release.",
        ],
        "correct_option_index": 0,
        "explanation": "Simple past 'thoroughly tested' becomes 'were thoroughly tested' because 'All API endpoints' is plural.",
    },
    {
        "id": "gram_10",
        "category": "Tenses & Conditionals",
        "question": "By the time the system architect reviews this pull request tomorrow, the pipeline _______ all unit tests.",
        "options": ["will have executed", "will execute", "has executed", "executed"],
        "correct_option_index": 0,  # Future perfect 'will have executed'
        "explanation": "When an action will be completed prior to a specific point in future ('by the time... tomorrow'), future perfect tense ('will have executed') is used.",
    },
    {
        "id": "gram_11",
        "category": "Vocabulary & Collocations",
        "question": "The security team conducted a _______ audit of the authentication microservice to uncover vulnerabilities.",
        "options": ["comprehensive", "comprehensible", "competent", "complacent"],
        "correct_option_index": 0,  # 'comprehensive'
        "explanation": "'Comprehensive' means complete and including everything necessary ('a comprehensive audit'). 'Comprehensible' means understandable.",
    },
    {
        "id": "gram_12",
        "category": "Conjunctions & Clauses",
        "question": "Scarcely had the production deployment completed _______ the monitoring system triggered a memory alarm.",
        "options": ["when", "than", "then", "while"],
        "correct_option_index": 0,  # 'Scarcely... when'
        "explanation": "Correlative conjunction rule: 'Scarcely / Hardly... when', whereas 'No sooner... than'. Therefore 'when' is the correct correlative pair.",
    },
]


def get_curated_svar_grammar_test(num_questions: int = 10) -> List[Dict[str, Any]]:
    """
    Returns randomized, sanitized SVAR English Grammar questions without answer keys.
    Randomly shuffles so every assessment session presents a fresh question sequence.
    """
    pool = list(SVAR_GRAMMAR_BANK)
    random.shuffle(pool)
    selected = pool[:min(num_questions, len(pool))]
    sanitized = []
    for q in selected:
        sanitized.append({
            "id": q["id"],
            "category": q["category"],
            "question": q["question"],
            "options": q["options"],
        })
    return sanitized


def evaluate_svar_grammar_test(answers: Dict[str, int]) -> Dict[str, Any]:
    """
    Grades student's SVAR Grammar answers, computes CEFR communication band and detailed feedback.
    """
    qmap = {q["id"]: q for q in SVAR_GRAMMAR_BANK}
    test_ids = list(answers.keys()) if answers else [q["id"] for q in SVAR_GRAMMAR_BANK[:10]]
    total = len(test_ids)
    correct = 0
    review = []
    cat_stats: Dict[str, Dict[str, int]] = {}

    for qid in test_ids:
        q = qmap.get(qid)
        if not q:
            continue
        cat = q["category"]
        if cat not in cat_stats:
            cat_stats[cat] = {"total": 0, "correct": 0}
        cat_stats[cat]["total"] += 1

        selected = answers.get(qid)
        is_correct = selected is not None and int(selected) == q["correct_option_index"]
        if is_correct:
            correct += 1
            cat_stats[cat]["correct"] += 1

        review.append({
            "question_id": qid,
            "category": cat,
            "question": q["question"],
            "options": q["options"],
            "selected_option_index": selected,
            "correct_option_index": q["correct_option_index"],
            "is_correct": is_correct,
            "explanation": q["explanation"],
        })

    pct = round((correct / max(total, 1)) * 100, 1)
    if pct >= 85:
        cefr = "C1/C2 (Advanced Corporate English)"
        badge = "Grammar Master"
    elif pct >= 70:
        cefr = "B2 (Upper Intermediate)"
        badge = "Proficient Communicator"
    elif pct >= 50:
        cefr = "B1 (Intermediate)"
        badge = "Developing Communicator"
    else:
        cefr = "A2 (Basic English)"
        badge = "Foundational Stage"

    return {
        "total_questions": total,
        "correct_answers": correct,
        "score_percentage": pct,
        "cefr_band": cefr,
        "badge_awarded": badge,
        "category_breakdown": cat_stats,
        "detailed_review": review,
    }

