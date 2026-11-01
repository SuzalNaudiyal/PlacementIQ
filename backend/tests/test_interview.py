"""
Automated unit & integration tests for AI Mock Interview Simulator (Phase 15).
Verifies question filtering, multi-dimensional response evaluation, STAR structure scoring,
real-time answer submission, and aggregate performance dossier generation.
"""

import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport

from backend.app.main import app
from backend.app.database import connect_to_mongo, close_mongo_connection
from backend.app.auth.seed import seed_demo_users
from backend.app.interview.questions_bank import (
    get_questions_for_interview,
    get_question_by_id,
    INTERVIEW_QUESTIONS,
)
from backend.app.interview.evaluator import (
    evaluate_candidate_answer,
    compute_session_grade,
)


@pytest_asyncio.fixture(autouse=True)
async def setup_app_db():
    await connect_to_mongo()
    await seed_demo_users()
    yield
    await close_mongo_connection()


def test_question_bank_retrieval():
    """Verify question bank selects correct number of questions and matches role/round filters."""
    # Test Full Stack Technical Intermediate
    questions = get_questions_for_interview(
        role_id="full-stack-developer",
        round_type="technical",
        difficulty="intermediate",
        count=3,
    )
    assert len(questions) == 3
    assert all("id" in q and "question" in q and "ideal_answer" in q for q in questions)

    # Test Behavioral Round
    behavioral_qs = get_questions_for_interview(
        role_id="hr-behavioral",
        round_type="behavioral",
        difficulty="beginner",
        count=2,
    )
    assert len(behavioral_qs) == 2


def test_evaluation_engine_metrics():
    """Test evaluation scoring across technical, clarity, structure, and confidence dimensions."""
    q = get_question_by_id("fs-01")  # Event Loop question

    # 1. High-quality comprehensive answer
    good_answer = (
        "JavaScript uses an event loop to handle concurrency on a single thread. "
        "Synchronous code runs on the call stack. When promises resolve, their callbacks "
        "go to the microtask queue, whereas setTimeout callbacks go to the macrotask queue. "
        "The event loop checks the call stack, executes all microtasks first, and then handles macrotasks."
    )
    res_good = evaluate_candidate_answer(q, good_answer, time_taken_seconds=50)

    assert res_good["overall_score"] >= 75.0
    assert res_good["technical_score"] >= 75.0
    assert len(res_good["matched_keywords"]) >= 3
    assert len(res_good["strengths"]) > 0

    # 2. Extremely brief response (< 5 words)
    brief_answer = "It handles async."
    res_brief = evaluate_candidate_answer(q, brief_answer, time_taken_seconds=10)
    assert res_brief["overall_score"] <= 35.0
    assert len(res_brief["improvements"]) > 0

    # 3. Behavioral STAR evaluation
    hr_q = get_question_by_id("hr-01")
    star_answer = (
        "During my college database project, the situation was that our queries were timing out. "
        "My task was to optimize response time before submission. "
        "I investigated and implemented a composite B-Tree index, which was the action I took. "
        "Resulting in a 95% latency reduction and our team successfully delivered on schedule."
    )
    res_star = evaluate_candidate_answer(hr_q, star_answer, time_taken_seconds=60)
    assert res_star["structure_score"] >= 75.0


def test_compute_session_grade():
    """Verify grade assignment logic."""
    grade_s, _ = compute_session_grade(93.0)
    assert "S" in grade_s

    grade_a, _ = compute_session_grade(82.0)
    assert "A" in grade_a

    grade_b, _ = compute_session_grade(72.0)
    assert "B" in grade_b

    grade_d, _ = compute_session_grade(45.0)
    assert "D" in grade_d


@pytest.mark.asyncio
async def test_get_interview_roles_api():
    """Verify endpoint returning supported roles and rounds."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.get("/api/interview/roles")
        assert res.status_code == 200
        data = res.json()
        assert len(data) >= 5
        role_ids = [r["role_id"] for r in data]
        assert "full-stack-developer" in role_ids
        assert "core-cs" in role_ids


@pytest.mark.asyncio
async def test_interview_full_session_flow():
    """End-to-end integration test: Start session -> submit answer -> complete session -> check history."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # 1. Login demo student
        login_res = await client.post(
            "/api/auth/login",
            json={"email": "student@placementiq.ai", "password": "Student@1234"},
        )
        assert login_res.status_code == 200
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 2. Start mock interview
        start_res = await client.post(
            "/api/interview/start",
            json={
                "role_id": "full-stack-developer",
                "round_type": "technical",
                "difficulty": "intermediate",
                "question_count": 3,
            },
            headers=headers,
        )
        assert start_res.status_code == 200
        session_data = start_res.json()
        session_id = session_data["session_id"]
        questions = session_data["questions"]
        assert len(questions) == 3
        first_q = questions[0]

        # 3. Submit answer to first question
        submit_res = await client.post(
            "/api/interview/submit-answer",
            json={
                "session_id": session_id,
                "question_id": first_q["question_id"],
                "candidate_answer": (
                    "The JavaScript call stack handles synchronous code, while asynchronous "
                    "microtasks like promises and macrotasks like setTimeout are coordinated by the event loop."
                ),
                "time_taken_seconds": 45,
            },
            headers=headers,
        )
        assert submit_res.status_code == 200
        eval_data = submit_res.json()
        assert eval_data["overall_score"] > 50.0
        assert len(eval_data["ideal_answer"]) > 0

        # 4. Finalize interview session
        complete_res = await client.post(
            f"/api/interview/{session_id}/complete",
            headers=headers,
        )
        assert complete_res.status_code == 200
        summary_data = complete_res.json()
        assert summary_data["session_id"] == session_id
        assert summary_data["completed_questions"] == 1
        assert "grade" in summary_data
        assert "summary_feedback" in summary_data

        # 5. Check interview history
        history_res = await client.get("/api/interview/history", headers=headers)
        assert history_res.status_code == 200
        history_list = history_res.json()
        assert any(item["session_id"] == session_id for item in history_list)
