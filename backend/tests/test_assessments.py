import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from backend.app.main import app
from backend.app.auth.seed import seed_demo_users, DEMO_STUDENT, DEMO_ADMIN
from backend.app.database import connect_to_mongo


@pytest_asyncio.fixture(autouse=True)
async def initialize_db_and_seed():
    await connect_to_mongo()
    await seed_demo_users()


async def get_student_token(client: AsyncClient) -> str:
    res = await client.post(
        "/api/auth/login",
        json={"email": DEMO_STUDENT["email"], "password": DEMO_STUDENT["password"]},
    )
    assert res.status_code == 200
    return res.json()["access_token"]


async def get_admin_token(client: AsyncClient) -> str:
    res = await client.post(
        "/api/auth/login",
        json={"email": DEMO_ADMIN["email"], "password": DEMO_ADMIN["password"]},
    )
    assert res.status_code == 200
    return res.json()["access_token"]


@pytest.mark.asyncio
async def test_aptitude_questions_sanitized():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        token = await get_student_token(client)
        res = await client.get(
            "/api/assessments/aptitude/questions?count=8",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert res.status_code == 200
        questions = res.json()
        assert len(questions) <= 8
        for q in questions:
            assert "id" in q
            assert "question" in q
            assert "options" in q
            assert len(q["options"]) == 4
            # Critical: correct answer and explanation must NOT be leaked
            assert "correct_option_index" not in q
            assert "explanation" not in q


@pytest.mark.asyncio
async def test_aptitude_test_submission_and_scoring():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        token = await get_student_token(client)
        # Submit mock answers
        res = await client.post(
            "/api/assessments/aptitude/submit",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "answers": {
                    "quant_01": 1,
                    "quant_02": 0,
                    "logic_01": 0,
                    "cs_01": 2,
                },
                "time_taken_seconds": 120,
            },
        )
        assert res.status_code == 200
        data = res.json()
        assert data["submission_id"].startswith("sub_apt_")
        assert data["attempted_questions"] == 4
        assert data["correct_answers"] >= 4
        assert data["overall_percentage"] > 0
        assert "category_breakdown" in data
        assert "detailed_review" in data


@pytest.mark.asyncio
async def test_svar_exercises_and_sentence_evaluation():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        token = await get_student_token(client)

        # 1. Fetch exercises
        ex_res = await client.get(
            "/api/assessments/svar/exercises",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert ex_res.status_code == 200
        ex_data = ex_res.json()
        assert len(ex_data["sentences"]) >= 3
        assert len(ex_data["extempore_topics"]) >= 2

        # 2. Evaluate sentence repetition
        eval_res = await client.post(
            "/api/assessments/svar/evaluate-sentence",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "sentence_id": "svar_01",
                "spoken_transcript": "cloud computing allows organizations to scale their digital infrastructure effortlessly",
                "duration_seconds": 5.5,
            },
        )
        assert eval_res.status_code == 200
        eval_data = eval_res.json()
        assert eval_data["submission_id"].startswith("sub_svar_")
        assert eval_data["accuracy_score"] >= 90.0
        assert eval_data["memory_retention_score"] >= 90.0
        assert eval_data["svar_score"] >= 85.0
        assert "C1" in eval_data["cefr_band"] or "C2" in eval_data["cefr_band"]


@pytest.mark.asyncio
async def test_svar_extempore_evaluation():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        token = await get_student_token(client)
        res = await client.post(
            "/api/assessments/svar/evaluate-extempore",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "topic_id": "ext_01",
                "spoken_transcript": "In my final year capstone project I designed and implemented a distributed microservice architecture. The biggest bottleneck was database connection pooling, which I resolved by implementing Redis caching and connection limits, reducing latency by 45 percent.",
                "duration_seconds": 32.0,
            },
        )
        assert res.status_code == 200
        data = res.json()
        assert data["submission_id"].startswith("sub_ext_")
        assert data["word_count"] > 20
        assert data["speaking_rate_wpm"] > 50
        assert data["overall_extempore_score"] >= 65.0


@pytest.mark.asyncio
async def test_admin_assessment_submissions():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        admin_token = await get_admin_token(client)
        res = await client.get(
            "/api/assessments/admin/submissions",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert res.status_code == 200
        submissions = res.json()
        assert isinstance(submissions, list)
        assert len(submissions) >= 1
        sub0 = submissions[0]
        assert "submission_id" in sub0
        assert "headline_score" in sub0
        assert "test_type" in sub0


@pytest.mark.asyncio
async def test_placement_test_flow():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        token = await get_student_token(client)

        # 1. Fetch multi-section placement test package
        res = await client.get(
            "/api/assessments/placement-test/questions",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert res.status_code == 200
        data = res.json()
        assert data["title"] == "Campus Placement Comprehensive Test (Company PYQs)"
        assert len(data["sections"]) == 2
        
        sec1 = data["sections"][0]
        assert sec1["section_id"] == "sec_verbal_grammar"
        assert len(sec1["questions"]) == 10
        for q in sec1["questions"]:
            assert "correct_option_index" not in q
            assert "explanation" not in q

        sec2 = data["sections"][1]
        assert sec2["section_id"] == "sec_quant_di"
        assert len(sec2["questions"]) == 10
        for q in sec2["questions"]:
            assert "correct_option_index" not in q
            assert "explanation" not in q

        # 2. Submit placement test
        sec1_answers = {q["id"]: 0 for q in sec1["questions"]}
        sec2_answers = {q["id"]: 0 for q in sec2["questions"]}

        sub_res = await client.post(
            "/api/assessments/placement-test/submit",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "section_1_answers": sec1_answers,
                "section_2_answers": sec2_answers,
                "total_time_taken_seconds": 770,
            },
        )
        assert sub_res.status_code == 200
        result = sub_res.json()
        assert result["submission_id"].startswith("sub_pt_")
        assert "section_1_summary" in result
        assert "section_2_summary" in result
        assert "overall_percentage" in result
        assert "eligible_companies" in result
        assert len(result["eligible_companies"]) >= 0
        assert "detailed_review" in result


