"""
Assessment & SVAR Voice Assessment API Endpoints.
Provides:
1. Quantitative/Logical/Technical/Data Interpretation MCQ tests with dynamic full randomization
2. SVAR-style English sentence repeat voice assessments with audio recording & playback
3. SVAR English Grammar & Sentence Structure tests
4. Extempore speech evaluation with audio telemetry
5. Centralized administrative telemetry
"""

from datetime import datetime, timezone
import uuid
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status

from backend.app.database import get_database, persist_db_if_fallback
from backend.app.auth.deps import get_current_user, get_current_admin
from backend.app.analytics.aptitude_bank import (
    get_curated_aptitude_test,
    evaluate_aptitude_test,
    APTITUDE_QUESTIONS,
)
from backend.app.analytics.svar_evaluator import (
    SVAR_SENTENCE_BANK,
    EXTEMPORE_TOPICS,
    SVAR_GRAMMAR_BANK,
    evaluate_sentence_repetition,
    evaluate_extempore_speech,
    get_curated_svar_grammar_test,
    evaluate_svar_grammar_test,
)
from backend.app.analytics.placement_test_bank import (
    get_curated_placement_test,
    evaluate_placement_test,
)
from backend.app.schemas.assessments import (
    AptitudeQuestionOut,
    SubmitAptitudeRequest,
    AptitudeResultResponse,
    SvarSentenceOut,
    ExtemporeTopicOut,
    SvarGrammarQuestionOut,
    SubmitSvarGrammarRequest,
    SvarGrammarResultResponse,
    SvarEvaluateSentenceRequest,
    SvarSentenceEvaluationOut,
    ExtemporeEvaluateRequest,
    ExtemporeEvaluationOut,
    AdminAssessmentSubmissionOut,
    PlacementTestResponse,
    SubmitPlacementTestRequest,
    PlacementTestResultResponse,
)

router = APIRouter(prefix="/assessments", tags=["Assessments & SVAR Voice Testing"])


def normalize_audio_data_uri(audio_str: Optional[str]) -> Optional[str]:
    """
    Ensure base64 data URIs carry the correct audio MIME type so that all browsers (especially Safari)
    can decode and play them natively without showing an 'Error'.
    """
    if not audio_str or not isinstance(audio_str, str):
        return None
    trimmed = audio_str.strip()
    if not trimmed:
        return None

    if not trimmed.startswith("data:"):
        if trimmed.startswith("AAAAIGZ0eX") or "Z0eX" in trimmed[:50]:
            return f"data:audio/mp4;base64,{trimmed}"
        elif trimmed.startswith("GkXf"):
            return f"data:audio/webm;base64,{trimmed}"
        elif trimmed.startswith("UklGR"):
            return f"data:audio/wav;base64,{trimmed}"
        return f"data:audio/mp4;base64,{trimmed}"

    if "," not in trimmed:
        return trimmed

    header, b64_part = trimmed.split(",", 1)
    if b64_part.startswith("AAAAIGZ0eX") or "Z0eX" in b64_part[:50]:
        return f"data:audio/mp4;base64,{b64_part}"
    elif b64_part.startswith("GkXf"):
        return f"data:audio/webm;base64,{b64_part}"
    elif b64_part.startswith("UklGR"):
        return f"data:audio/wav;base64,{b64_part}"

    return trimmed


# ==============================================================================
# 1. Aptitude & Technical MCQ Testing (Dynamic & Randomized)
# ==============================================================================

@router.get("/aptitude/questions", response_model=List[AptitudeQuestionOut])
async def get_aptitude_test_questions(
    count: int = 10,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Retrieve completely randomized, balanced aptitude MCQs covering Percentages,
    Ratios, Number/Word Series, Data Interpretation Charts, and Core CS.
    Guaranteed 'har baar same na ho' (every test attempt is freshly shuffled).
    """
    questions = get_curated_aptitude_test(num_questions=min(count, len(APTITUDE_QUESTIONS)))
    return questions


@router.post("/aptitude/submit", response_model=AptitudeResultResponse)
async def submit_aptitude_test(
    payload: SubmitAptitudeRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> AptitudeResultResponse:
    """
    Grade candidate answers, calculate accuracy and category breakdown,
    record result in MongoDB and update candidate's assessment metrics.
    """
    db = get_database()
    user_id = str(current_user["id"])
    eval_result = evaluate_aptitude_test(payload.answers)

    submission_id = f"sub_apt_{uuid.uuid4().hex[:10]}"
    now = datetime.now(timezone.utc)

    submission_doc = {
        "submission_id": submission_id,
        "user_id": user_id,
        "student_name": current_user.get("name", "Student"),
        "student_email": current_user.get("email", ""),
        "test_type": "aptitude_mcq",
        "headline_score": eval_result["overall_percentage"],
        "rating_or_badge": eval_result["badge_awarded"],
        "summary": {
            "total_questions": eval_result["total_questions"],
            "attempted": eval_result["attempted_questions"],
            "correct": eval_result["correct_answers"],
            "category_breakdown": eval_result["category_breakdown"],
            "time_taken_seconds": payload.time_taken_seconds,
        },
        "detailed_review": eval_result["detailed_review"],
        "submitted_at": now,
    }

    # Store in database
    await db.assessment_submissions.insert_one(submission_doc)

    # Update candidate's student profile assessment score
    await db.students.update_one(
        {"user_id": user_id},
        {
            "$set": {
                "assessments.aptitude_score": eval_result["overall_percentage"],
                "updated_at": now,
            }
        },
    )

    await persist_db_if_fallback()

    return AptitudeResultResponse(
        submission_id=submission_id,
        total_questions=eval_result["total_questions"],
        attempted_questions=eval_result["attempted_questions"],
        correct_answers=eval_result["correct_answers"],
        overall_percentage=eval_result["overall_percentage"],
        attempted_accuracy_percentage=eval_result["attempted_accuracy_percentage"],
        readiness_status=eval_result["readiness_status"],
        badge_awarded=eval_result["badge_awarded"],
        category_breakdown=eval_result["category_breakdown"],
        detailed_review=eval_result["detailed_review"],
        submitted_at=now,
    )


# ==============================================================================
# 2. SVAR / Versant Voice English Assessment (Audio Recording & Saving)
# ==============================================================================

@router.get("/svar/exercises")
async def get_svar_exercises(current_user: Dict[str, Any] = Depends(get_current_user)):
    """
    Returns available sentence repeat items and extempore topics for voice testing.
    """
    return {
        "sentences": SVAR_SENTENCE_BANK,
        "extempore_topics": EXTEMPORE_TOPICS,
        "instructions": [
            "Part 1 (Sentence Repeat): Listen to the sentence played by the AI Examiner. Remember it and speak it back via microphone.",
            "Part 2 (Extempore Speech): Speak for 30-45 seconds on the given technical topic.",
            "AI automatically scores your Pronunciation, Memory Retention, Fluency Index, and CEFR Communication Band.",
        ],
    }


@router.post("/svar/evaluate-sentence", response_model=SvarSentenceEvaluationOut)
async def evaluate_svar_sentence(
    payload: SvarEvaluateSentenceRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> SvarSentenceEvaluationOut:
    """
    AI evaluates a candidate's spoken repetition of an English prompt sentence.
    Measures accuracy, keyword retention, filler words, and CEFR level.
    Saves candidate's spoken audio recording for playback and admin inspection.
    """
    db = get_database()
    user_id = str(current_user["id"])

    # Locate sentence
    sentence_meta = next((s for s in SVAR_SENTENCE_BANK if s["id"] == payload.sentence_id), None)
    if not sentence_meta:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sentence exercise not found.")

    eval_result = evaluate_sentence_repetition(
        expected_sentence=sentence_meta["sentence"],
        spoken_transcript=payload.spoken_transcript,
        duration_seconds=payload.duration_seconds,
        keywords=sentence_meta.get("keywords"),
    )

    submission_id = f"sub_svar_{uuid.uuid4().hex[:10]}"
    now = datetime.now(timezone.utc)

    clean_audio = normalize_audio_data_uri(payload.audio_data)

    submission_doc = {
        "submission_id": submission_id,
        "user_id": user_id,
        "student_name": current_user.get("name", "Student"),
        "student_email": current_user.get("email", ""),
        "test_type": "svar_sentence",
        "headline_score": eval_result["svar_score"],
        "rating_or_badge": eval_result["cefr_band"],
        "audio_data": clean_audio,  # Save candidate voice recording!
        "has_audio": bool(clean_audio),
        "summary": {
            "sentence_id": payload.sentence_id,
            "expected_sentence": sentence_meta["sentence"],
            "spoken_transcript": payload.spoken_transcript,
            "accuracy_score": eval_result["accuracy_score"],
            "memory_retention_score": eval_result["memory_retention_score"],
            "fluency_score": eval_result["fluency_score"],
            "duration_seconds": payload.duration_seconds,
            "has_recorded_audio": bool(clean_audio),
            "feedback": eval_result["feedback"],
        },
        "submitted_at": now,
    }

    await db.assessment_submissions.insert_one(submission_doc)

    # Update candidate's verbal/communication assessment score in student profile
    await db.students.update_one(
        {"user_id": user_id},
        {
            "$set": {
                "assessments.communication_score": eval_result["svar_score"],
                "updated_at": now,
            }
        },
    )

    await persist_db_if_fallback()

    return SvarSentenceEvaluationOut(
        submission_id=submission_id,
        expected_sentence=eval_result["expected_sentence"],
        spoken_transcript=eval_result["spoken_transcript"],
        accuracy_score=eval_result["accuracy_score"],
        memory_retention_score=eval_result["memory_retention_score"],
        fluency_score=eval_result["fluency_score"],
        svar_score=eval_result["svar_score"],
        cefr_band=eval_result["cefr_band"],
        filler_words_detected=eval_result["filler_words_detected"],
        missed_words=eval_result["missed_words"],
        extra_words=eval_result["extra_words"],
        feedback=eval_result["feedback"],
        has_audio=bool(payload.audio_data),
        audio_data=payload.audio_data,
        submitted_at=now,
    )


@router.post("/svar/evaluate-extempore", response_model=ExtemporeEvaluationOut)
async def evaluate_extempore(
    payload: ExtemporeEvaluateRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> ExtemporeEvaluationOut:
    """
    AI evaluates candidate's spontaneous technical extempore speech.
    Scores speaking rate (WPM), vocabulary richness, relevance, and CEFR level.
    Saves candidate's spoken audio recording.
    """
    db = get_database()
    user_id = str(current_user["id"])

    topic_meta = next((t for t in EXTEMPORE_TOPICS if t["id"] == payload.topic_id), None)
    if not topic_meta:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Extempore topic not found.")

    eval_result = evaluate_extempore_speech(
        topic_title=topic_meta["title"],
        spoken_transcript=payload.spoken_transcript,
        duration_seconds=payload.duration_seconds,
    )

    submission_id = f"sub_ext_{uuid.uuid4().hex[:10]}"
    now = datetime.now(timezone.utc)

    clean_audio = normalize_audio_data_uri(payload.audio_data)

    submission_doc = {
        "submission_id": submission_id,
        "user_id": user_id,
        "student_name": current_user.get("name", "Student"),
        "student_email": current_user.get("email", ""),
        "test_type": "svar_extempore",
        "headline_score": eval_result["overall_extempore_score"],
        "rating_or_badge": eval_result["cefr_band"],
        "audio_data": clean_audio,  # Save candidate voice recording!
        "has_audio": bool(clean_audio),
        "summary": {
            "topic_id": payload.topic_id,
            "topic": topic_meta["title"],
            "spoken_transcript": payload.spoken_transcript,
            "word_count": eval_result["word_count"],
            "wpm": eval_result["speaking_rate_wpm"],
            "vocab_richness": eval_result["vocabulary_richness"],
            "has_recorded_audio": bool(clean_audio),
            "feedback": eval_result["feedback"],
        },
        "submitted_at": now,
    }

    await db.assessment_submissions.insert_one(submission_doc)
    await persist_db_if_fallback()

    return ExtemporeEvaluationOut(
        submission_id=submission_id,
        topic=eval_result["topic"],
        word_count=eval_result["word_count"],
        speaking_rate_wpm=eval_result["speaking_rate_wpm"],
        vocabulary_richness=eval_result["vocabulary_richness"],
        coherence_score=eval_result["coherence_score"],
        overall_extempore_score=eval_result["overall_extempore_score"],
        cefr_band=eval_result["cefr_band"],
        feedback=eval_result["feedback"],
        has_audio=bool(payload.audio_data),
        audio_data=payload.audio_data,
        submitted_at=now,
    )


# ==============================================================================
# 3. SVAR English Grammar & Sentence Structure Test
# ==============================================================================

@router.get("/svar/grammar", response_model=List[SvarGrammarQuestionOut])
async def get_svar_grammar_questions(
    count: int = 10,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Returns randomized, sanitized SVAR English Grammar questions covering subject-verb agreement,
    tenses, prepositions, error spotting, and corporate vocabulary.
    """
    return get_curated_svar_grammar_test(num_questions=count)


@router.post("/svar/grammar/submit", response_model=SvarGrammarResultResponse)
async def submit_svar_grammar_test(
    payload: SubmitSvarGrammarRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> SvarGrammarResultResponse:
    """
    Grades candidate's SVAR Grammar answers, calculates CEFR Grammar band and accuracy,
    and stores the test record in MongoDB for student review and admin telemetry.
    """
    db = get_database()
    user_id = str(current_user["id"])
    eval_result = evaluate_svar_grammar_test(payload.answers)

    submission_id = f"sub_gram_{uuid.uuid4().hex[:10]}"
    now = datetime.now(timezone.utc)

    submission_doc = {
        "submission_id": submission_id,
        "user_id": user_id,
        "student_name": current_user.get("name", "Student"),
        "student_email": current_user.get("email", ""),
        "test_type": "svar_grammar",
        "headline_score": eval_result["score_percentage"],
        "rating_or_badge": eval_result["cefr_band"],
        "summary": {
            "total_questions": eval_result["total_questions"],
            "correct_answers": eval_result["correct_answers"],
            "score_percentage": eval_result["score_percentage"],
            "category_breakdown": eval_result["category_breakdown"],
            "time_taken_seconds": payload.time_taken_seconds,
        },
        "detailed_review": eval_result["detailed_review"],
        "submitted_at": now,
    }

    await db.assessment_submissions.insert_one(submission_doc)
    await persist_db_if_fallback()

    return SvarGrammarResultResponse(
        submission_id=submission_id,
        total_questions=eval_result["total_questions"],
        correct_answers=eval_result["correct_answers"],
        score_percentage=eval_result["score_percentage"],
        cefr_band=eval_result["cefr_band"],
        badge_awarded=eval_result["badge_awarded"],
        category_breakdown=eval_result["category_breakdown"],
        detailed_review=eval_result["detailed_review"],
        submitted_at=now,
    )


# ==============================================================================
# 4. Student Assessment History
# ==============================================================================

@router.get("/my-history")
async def get_my_assessment_history(
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Retrieve historical MCQ and SVAR voice test results for the current authenticated student.
    """
    db = get_database()
    user_id = str(current_user["id"])

    submissions = await db.assessment_submissions.find(
        {"user_id": user_id}
    ).sort("submitted_at", -1).to_list(length=50)

    # Clean ObjectIDs and normalize audio data
    for s in submissions:
        s["_id"] = str(s["_id"])
        if s.get("audio_data"):
            s["audio_data"] = normalize_audio_data_uri(s["audio_data"])

    return {
        "total_submissions": len(submissions),
        "submissions": submissions,
    }


# ==============================================================================
# 5. Campus Placement Comprehensive Multi-Section Test (Company PYQs)
# ==============================================================================

@router.get("/placement-test/questions", response_model=PlacementTestResponse)
async def get_placement_test_questions_endpoint(
    num_per_section: int = 10,
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> PlacementTestResponse:
    """
    Returns a unified 2-section Campus Placement Comprehensive Test.
    Section 1: Verbal & Corporate Grammar (TCS, Infosys, Accenture PYQs)
    Section 2: Quantitative Aptitude, Logic Series & Data Interpretation Charts (Company PYQs)
    """
    test_data = get_curated_placement_test(num_per_section=num_per_section)
    return test_data


@router.post("/placement-test/submit", response_model=PlacementTestResultResponse)
async def submit_placement_test_endpoint(
    data: SubmitPlacementTestRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> PlacementTestResultResponse:
    """
    Evaluates both Section 1 and Section 2 of the comprehensive placement test.
    Records performance in the user profile and institutional admin telemetry.
    """
    db = get_database()
    user_id = str(current_user.get("id") or current_user.get("_id", ""))
    student_name = current_user.get("name", "Student Candidate")
    student_email = current_user.get("email", "")

    result = evaluate_placement_test(
        section1_answers=data.section_1_answers,
        section2_answers=data.section_2_answers,
        total_time_taken_seconds=data.total_time_taken_seconds or 0,
    )

    submission_id = f"sub_pt_{uuid.uuid4().hex[:10]}"
    now = datetime.now(timezone.utc)

    submission_doc = {
        "submission_id": submission_id,
        "user_id": user_id,
        "student_name": student_name,
        "student_email": student_email,
        "test_type": "placement_test",
        "headline_score": result["overall_percentage"],
        "rating_or_badge": result["badge_awarded"],
        "summary": {
            "section_1_summary": result["section_1_summary"],
            "section_2_summary": result["section_2_summary"],
            "eligible_companies": result["eligible_companies"],
            "total_questions": result["total_questions"],
            "total_correct": result["total_correct"],
        },
        "submitted_at": now,
    }

    await db.assessment_submissions.insert_one(submission_doc)

    # Update student profile
    await db.students.update_one(
        {"user_id": user_id},
        {
            "$set": {
                "assessments.placement_test": {
                    "last_score": result["overall_percentage"],
                    "badge": result["badge_awarded"],
                    "section_1_pct": result["section_1_summary"]["percentage"],
                    "section_2_pct": result["section_2_summary"]["percentage"],
                    "taken_at": now,
                },
                "updated_at": now,
            }
        },
    )

    await persist_db_if_fallback()

    return {
        "submission_id": submission_id,
        "total_questions": result["total_questions"],
        "total_attempted": result["total_attempted"],
        "total_correct": result["total_correct"],
        "overall_percentage": result["overall_percentage"],
        "readiness_status": result["readiness_status"],
        "badge_awarded": result["badge_awarded"],
        "section_1_summary": result["section_1_summary"],
        "section_2_summary": result["section_2_summary"],
        "eligible_companies": result["eligible_companies"],
        "detailed_review": result["detailed_review"],
        "submitted_at": now,
    }


# ==============================================================================
# 6. Centralized Administrative Telemetry
# ==============================================================================

@router.get("/admin/submissions", response_model=List[AdminAssessmentSubmissionOut])
async def get_admin_assessment_submissions(
    test_type: Optional[str] = None,
    limit: int = 100,
    current_admin: Dict[str, Any] = Depends(get_current_admin),
) -> List[AdminAssessmentSubmissionOut]:
    """
    Administrative portal endpoint returning all candidate test attempts, transcripts,
    MCQ performance metrics, recorded voice audios, and SVAR voice scores across the cohort.
    """
    db = get_database()
    query = {}
    if test_type:
        query["test_type"] = test_type

    cursor = db.assessment_submissions.find(query).sort("submitted_at", -1)
    docs = await cursor.to_list(length=limit)

    results = []
    for d in docs:
        results.append(
            AdminAssessmentSubmissionOut(
                submission_id=d.get("submission_id", str(d.get("_id"))),
                user_id=d.get("user_id", ""),
                student_name=d.get("student_name", "Student"),
                student_email=d.get("student_email", ""),
                test_type=d.get("test_type", "aptitude_mcq"),
                headline_score=float(d.get("headline_score", 0.0)),
                rating_or_badge=d.get("rating_or_badge", "N/A"),
                summary=d.get("summary", {}),
                audio_data=normalize_audio_data_uri(d.get("audio_data")),  # Clean audio URI for all browsers
                submitted_at=d.get("submitted_at", datetime.now(timezone.utc)),
            )
        )

    return results
