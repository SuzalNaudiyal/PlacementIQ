"""
Automated tests for Resume Parsing, NLP Extraction, and ATS Compatibility Scoring.
"""

import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from backend.app.main import app
from backend.app.database import connect_to_mongo, close_mongo_connection
from backend.app.auth.seed import seed_demo_users
from backend.app.nlp.parser import extract_contact_info, extract_education, extract_skills, parse_resume_full
from backend.app.nlp.ats_scorer import score_resume_ats

SAMPLE_RESUME_TEXT = """
Alex Mercer
alex.mercer@gmail.com | +91 9876543210 | Bangalore, India
https://linkedin.com/in/alexmercer | https://github.com/alexmercer

EDUCATION
Apex Institute of Technology
Bachelor of Technology in Computer Science & Engineering
CGPA: 8.4 / 10 | Expected Graduation: 2026

TECHNICAL SKILLS
Programming: Python, Java, JavaScript, TypeScript, C++
Frameworks & Libraries: ReactJS, FastAPI, Node.js, Express, Next.js
Databases: PostgreSQL, MongoDB, Redis
Cloud & DevOps: Docker, Kubernetes, AWS, Git, CI/CD
Machine Learning & Data: Pandas, NumPy, Scikit-learn, PyTorch

PROJECTS
High-Throughput E-Commerce API Engine
- Architected and developed a distributed microservices REST API handling 10,000+ daily queries using FastAPI and PostgreSQL.
- Optimized database indexing and query latency by 45%, reducing p99 response time from 220ms to 85ms.
- Containerized microservices using Docker and orchestrated multi-container deployment on AWS.

Real-Time Sentiment Analysis Pipeline
- Engineered real-time tweet stream sentiment classification system achieving 92.4% test accuracy using PyTorch and NLP transformers.
- Streamlined model serving throughput by 3x via ONNX runtime optimizations.

EXPERIENCE
Apex Analytics Lab
Software Engineering Intern | June 2024 - August 2024
- Implemented real-time telemetry dashboards for 500+ active enterprise users using React and WebSockets.
- Accelerated automated testing pipeline, cutting regression suite execution time by 35%.

CERTIFICATIONS
- AWS Certified Cloud Practitioner
- Python for Data Science (Coursera)
"""


@pytest_asyncio.fixture(autouse=True)
async def setup_app_db():
    await connect_to_mongo()
    await seed_demo_users()
    yield
    await close_mongo_connection()


def test_nlp_contact_extraction():
    """Verify regex and heuristic contact extractor identifies email, phone, and links."""
    contact = extract_contact_info(SAMPLE_RESUME_TEXT)
    assert contact["email"] == "alex.mercer@gmail.com"
    assert "9876543210" in contact["phone"]
    assert "linkedin.com/in/alexmercer" in contact["linkedin"]
    assert "github.com/alexmercer" in contact["github"]
    assert contact["name"] == "Alex Mercer"


def test_nlp_education_extraction():
    """Verify degree, branch, year, and CGPA are accurately parsed."""
    edu = extract_education(SAMPLE_RESUME_TEXT)
    assert edu["degree"] == "B.Tech"
    assert "Computer Science" in edu["branch"]
    assert edu["graduation_year"] == 2026
    assert edu["cgpa"] == 8.4


def test_nlp_skill_alias_normalization():
    """Verify skill aliases (e.g. ReactJS -> React, Scikit-learn) map to standard taxonomy."""
    skills = extract_skills(SAMPLE_RESUME_TEXT)
    assert "Python" in skills["programming"]
    assert "C++" in skills["programming"]
    assert "React" in skills["frameworks"]
    assert "FastAPI" in skills["frameworks"]
    assert "PostgreSQL" in skills["databases"]
    assert "Docker" in skills["devops"]
    assert "Scikit-learn" in skills["data_ai"]


def test_ats_scoring_high_score():
    """Verify strong resume with quantified metrics and action verbs scores in top tier (>= 80)."""
    parsed = parse_resume_full(SAMPLE_RESUME_TEXT)
    ats = score_resume_ats(
        text=SAMPLE_RESUME_TEXT,
        parsed_contact=parsed["contact"],
        parsed_education=parsed["education"],
        parsed_skills=parsed["skills"],
        sections=parsed["sections"],
        total_words=len(SAMPLE_RESUME_TEXT.split()),
        page_count=1,
    )
    assert ats["total_score"] >= 80, f"Expected ATS score >= 80, got {ats['total_score']}"
    assert ats["quantified_bullets_count"] >= 3
    assert len(ats["action_verbs_found"]) >= 4
    assert len(ats["strengths"]) >= 2


@pytest.mark.asyncio
async def test_parse_text_endpoint():
    """Verify POST /api/resume/parse-text endpoint parses raw text correctly."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        login_res = await client.post(
            "/api/auth/login",
            json={"email": "student@placementiq.ai", "password": "Student@1234"},
        )
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        res = await client.post(
            "/api/resume/parse-text",
            json={"text": SAMPLE_RESUME_TEXT, "apply_to_profile": False},
            headers=headers,
        )
        assert res.status_code == 200
        data = res.json()
        assert data["contact"]["email"] == "alex.mercer@gmail.com"
        assert data["education"]["degree"] == "B.Tech"
        assert "FastAPI" in data["skills"]["frameworks"]
        assert data["ats_analysis"]["total_score"] >= 80


@pytest.mark.asyncio
async def test_upload_resume_file_endpoint():
    """Verify POST /api/resume/upload endpoint accepts simulated TXT file."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        login_res = await client.post(
            "/api/auth/login",
            json={"email": "student@placementiq.ai", "password": "Student@1234"},
        )
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        files = {"file": ("alex_mercer_resume.txt", SAMPLE_RESUME_TEXT.encode("utf-8"), "text/plain")}
        res = await client.post(
            "/api/resume/upload?apply_to_profile=true",
            files=files,
            headers=headers,
        )
        assert res.status_code == 200
        data = res.json()
        assert data["filename"] == "alex_mercer_resume.txt"
        assert data["contact"]["name"] == "Alex Mercer"
        assert data["profile_updated"] is True
