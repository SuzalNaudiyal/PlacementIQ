"""
Admin Control Panel & Placement Intelligence Endpoints.
Provides cohort-level placement analytics, applicant tracking, student drill-downs,
campus placement job drive management, and CSV reporting.
Protected by require_role(UserRole.ADMIN).
"""

import io
import csv
import uuid
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from collections import Counter
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import Response

from backend.app.database import get_database
from backend.app.auth.deps import require_role
from backend.app.schemas.auth import UserRole
from backend.app.auth.security import get_password_hash
from backend.app.models.job_roles import get_all_roles, get_role_by_id
from backend.app.models.jobs import CAMPUS_JOBS, get_all_jobs, get_job_by_id
from backend.app.schemas.admin import (
    CohortOverview,
    BranchStat,
    TargetRoleStat,
    SkillDeficitItem,
    CohortStatsResponse,
    AdminStudentListItem,
    AdminStudentsListResponse,
    AdminStudentDetail,
    JobCreateRequest,
    AdminJobItem,
)
from ml.inference.predictor import get_predictor

router = APIRouter(prefix="/admin", tags=["Admin Control Panel & Cohort Intelligence"])


# 15 realistic student seeds for university campus cohort demonstration
COHORT_SEEDS = [
    {
        "name": "Aryan Sharma",
        "email": "aryan.sharma@apex.edu",
        "branch": "Computer Science & Engineering",
        "semester": 7,
        "cgpa": 8.7,
        "backlogs": 0,
        "target_role": "full-stack-developer",
        "skills": {
            "programming": ["JavaScript", "Python", "SQL"],
            "frameworks": ["React", "Node.js", "Express"],
            "databases": ["MongoDB", "PostgreSQL"],
            "devops_cloud": ["Git", "Docker"],
            "core_cs": ["Data Structures", "Algorithms", "DBMS"],
            "soft_skills": ["Problem Solving", "Teamwork"],
        },
        "projects": [
            {"title": "E-Commerce Microservices", "tech": "React, Node.js, MongoDB"},
            {"title": "Collaborative Code Editor", "tech": "WebSockets, Express"},
            {"title": "Portfolio Platform", "tech": "TypeScript, Tailwind"},
        ],
        "internships": [{"company": "Zeta Tech", "role": "Full Stack Intern", "duration_months": 3}],
        "ats_score": 88.0,
        "roadmap_completed": 8,
        "roadmap_total": 12,
    },
    {
        "name": "Ananya Patel",
        "email": "ananya.patel@apex.edu",
        "branch": "Computer Science & Engineering",
        "semester": 7,
        "cgpa": 9.2,
        "backlogs": 0,
        "target_role": "ml-engineer",
        "skills": {
            "programming": ["Python", "C++", "SQL"],
            "frameworks": ["PyTorch", "Scikit-learn", "Pandas", "NumPy"],
            "databases": ["PostgreSQL"],
            "devops_cloud": ["Git", "Docker"],
            "core_cs": ["Data Structures", "Algorithms", "Mathematics"],
            "soft_skills": ["Critical Thinking", "Research"],
        },
        "projects": [
            {"title": "Chest X-Ray Pneumonia Classifier", "tech": "PyTorch, ResNet"},
            {"title": "Customer Churn Predictor", "tech": "XGBoost, SHAP"},
        ],
        "internships": [
            {"company": "Samsung R&D", "role": "Computer Vision Intern", "duration_months": 6},
            {"company": "AI Frontier", "role": "ML Intern", "duration_months": 2},
        ],
        "ats_score": 92.5,
        "roadmap_completed": 10,
        "roadmap_total": 12,
    },
    {
        "name": "Rohan Verma",
        "email": "rohan.verma@apex.edu",
        "branch": "Information Technology",
        "semester": 7,
        "cgpa": 7.3,
        "backlogs": 0,
        "target_role": "backend-engineer",
        "skills": {
            "programming": ["Java", "SQL"],
            "frameworks": ["Spring Boot", "Hibernate"],
            "databases": ["MySQL"],
            "devops_cloud": ["Git"],
            "core_cs": ["OOP", "DBMS"],
            "soft_skills": ["Communication"],
        },
        "projects": [
            {"title": "Bank Account Ledger API", "tech": "Java, Spring Boot, MySQL"},
        ],
        "internships": [],
        "ats_score": 72.0,
        "roadmap_completed": 4,
        "roadmap_total": 12,
    },
    {
        "name": "Sneha Kulkarni",
        "email": "sneha.k@apex.edu",
        "branch": "Electronics & Communication",
        "semester": 7,
        "cgpa": 7.9,
        "backlogs": 0,
        "target_role": "embedded-iot-engineer",
        "skills": {
            "programming": ["C", "C++", "Python"],
            "frameworks": ["Arduino", "FreeRTOS"],
            "databases": ["SQLite"],
            "devops_cloud": ["Git", "Linux"],
            "core_cs": ["Microcontrollers", "Operating Systems"],
            "soft_skills": ["Problem Solving"],
        },
        "projects": [
            {"title": "Smart Irrigation Controller", "tech": "ESP32, MQTT, C++"},
            {"title": "CAN Bus Telemetry Sniffer", "tech": "C, ARM Cortex"},
        ],
        "internships": [{"company": "Bosch Mobility", "role": "Firmware Intern", "duration_months": 3}],
        "ats_score": 81.0,
        "roadmap_completed": 6,
        "roadmap_total": 12,
    },
    {
        "name": "Vikram Singh",
        "email": "vikram.s@apex.edu",
        "branch": "Mechanical Engineering",
        "semester": 7,
        "cgpa": 6.4,
        "backlogs": 1,
        "target_role": "data-analyst",
        "skills": {
            "programming": ["Python", "SQL"],
            "frameworks": ["Pandas", "Excel"],
            "databases": ["MySQL"],
            "devops_cloud": ["Git"],
            "core_cs": ["Statistics"],
            "soft_skills": ["Presentation"],
        },
        "projects": [
            {"title": "Supply Chain Inventory BI Dashboard", "tech": "PowerBI, SQL"},
        ],
        "internships": [],
        "ats_score": 62.0,
        "roadmap_completed": 2,
        "roadmap_total": 12,
    },
    {
        "name": "Meera Nair",
        "email": "meera.nair@apex.edu",
        "branch": "Computer Science & Engineering",
        "semester": 7,
        "cgpa": 8.5,
        "backlogs": 0,
        "target_role": "cloud-devops-engineer",
        "skills": {
            "programming": ["Python", "Bash", "Go"],
            "frameworks": ["FastAPI"],
            "databases": ["Redis", "PostgreSQL"],
            "devops_cloud": ["Docker", "Kubernetes", "AWS", "Terraform", "Git", "CI/CD"],
            "core_cs": ["Linux", "Computer Networks"],
            "soft_skills": ["Collaboration", "Analytical Skills"],
        },
        "projects": [
            {"title": "GitOps Kubernetes Cluster on AWS", "tech": "Terraform, EKS, ArgoCD"},
            {"title": "Distributed Task Queue", "tech": "Go, Redis, Docker"},
        ],
        "internships": [{"company": "Red Hat", "role": "DevOps Intern", "duration_months": 4}],
        "ats_score": 89.0,
        "roadmap_completed": 9,
        "roadmap_total": 12,
    },
    {
        "name": "Aditya Gupta",
        "email": "aditya.g@apex.edu",
        "branch": "Information Technology",
        "semester": 7,
        "cgpa": 6.8,
        "backlogs": 0,
        "target_role": "frontend-engineer",
        "skills": {
            "programming": ["JavaScript", "HTML/CSS"],
            "frameworks": ["React", "Bootstrap"],
            "databases": [],
            "devops_cloud": ["Git"],
            "core_cs": ["Web Basics"],
            "soft_skills": ["Creativity"],
        },
        "projects": [
            {"title": "Weather Forecast Web App", "tech": "React, OpenWeather API"},
        ],
        "internships": [],
        "ats_score": 67.0,
        "roadmap_completed": 3,
        "roadmap_total": 12,
    },
    {
        "name": "Divya Rao",
        "email": "divya.rao@apex.edu",
        "branch": "Computer Science & Engineering",
        "semester": 7,
        "cgpa": 9.6,
        "backlogs": 0,
        "target_role": "systems-sde",
        "skills": {
            "programming": ["C++", "C", "Rust", "Python"],
            "frameworks": [],
            "databases": ["Redis", "SQLite"],
            "devops_cloud": ["Linux", "Git", "GDB"],
            "core_cs": ["Operating Systems", "Data Structures", "Algorithms", "Multi-threading", "Computer Networks"],
            "soft_skills": ["Problem Solving", "Mathematical Aptitude"],
        },
        "projects": [
            {"title": "User-Level Threading Library", "tech": "C, Assembly, Linux"},
            {"title": "LSM-Tree Key-Value Storage Engine", "tech": "C++20, POSIX AIO"},
            {"title": "Network Packet Sniffer", "tech": "C, libpcap"},
        ],
        "internships": [{"company": "Qualcomm", "role": "Systems Engineering Intern", "duration_months": 6}],
        "ats_score": 96.0,
        "roadmap_completed": 11,
        "roadmap_total": 12,
    },
    {
        "name": "Rahul Joshi",
        "email": "rahul.joshi@apex.edu",
        "branch": "Civil Engineering",
        "semester": 7,
        "cgpa": 5.9,
        "backlogs": 2,
        "target_role": "full-stack-developer",
        "skills": {
            "programming": ["JavaScript", "HTML/CSS"],
            "frameworks": ["React"],
            "databases": [],
            "devops_cloud": ["Git"],
            "core_cs": [],
            "soft_skills": ["Willingness to Learn"],
        },
        "projects": [
            {"title": "Personal Portfolio", "tech": "HTML, CSS, JS"},
        ],
        "internships": [],
        "ats_score": 52.0,
        "roadmap_completed": 1,
        "roadmap_total": 12,
    },
    {
        "name": "Pooja Mishra",
        "email": "pooja.mishra@apex.edu",
        "branch": "Electronics & Communication",
        "semester": 7,
        "cgpa": 8.2,
        "backlogs": 0,
        "target_role": "backend-engineer",
        "skills": {
            "programming": ["Python", "SQL", "Java"],
            "frameworks": ["FastAPI", "Django"],
            "databases": ["PostgreSQL", "Redis"],
            "devops_cloud": ["Docker", "Git"],
            "core_cs": ["Data Structures", "Algorithms", "DBMS"],
            "soft_skills": ["Communication", "Teamwork"],
        },
        "projects": [
            {"title": "Health Records Management API", "tech": "FastAPI, PostgreSQL, Redis"},
            {"title": "Real-time Notification Service", "tech": "WebSockets, Django Channels"},
        ],
        "internships": [{"company": "Paytm", "role": "Backend Intern", "duration_months": 3}],
        "ats_score": 84.0,
        "roadmap_completed": 7,
        "roadmap_total": 12,
    },
    {
        "name": "Siddharth Roy",
        "email": "siddharth.roy@apex.edu",
        "branch": "Computer Science & Engineering",
        "semester": 7,
        "cgpa": 7.7,
        "backlogs": 0,
        "target_role": "cybersecurity-analyst",
        "skills": {
            "programming": ["Python", "Bash", "C"],
            "frameworks": ["Scapy", "Wireshark"],
            "databases": ["MySQL"],
            "devops_cloud": ["Linux", "Git"],
            "core_cs": ["Computer Networks", "Cryptography"],
            "soft_skills": ["Analytical Skills"],
        },
        "projects": [
            {"title": "Automated Port Scanner & Vulnerability Auditing", "tech": "Python, Nmap, Scapy"},
            {"title": "Secure Zero-Knowledge Chat App", "tech": "Python, RSA, WebSockets"},
        ],
        "internships": [{"company": "QuickHeal", "role": "Security Intern", "duration_months": 3}],
        "ats_score": 79.0,
        "roadmap_completed": 5,
        "roadmap_total": 12,
    },
    {
        "name": "Tanvi Shah",
        "email": "tanvi.shah@apex.edu",
        "branch": "Information Technology",
        "semester": 7,
        "cgpa": 9.0,
        "backlogs": 0,
        "target_role": "data-scientist",
        "skills": {
            "programming": ["Python", "R", "SQL"],
            "frameworks": ["Scikit-learn", "TensorFlow", "Pandas", "NumPy", "Seaborn"],
            "databases": ["MongoDB", "PostgreSQL"],
            "devops_cloud": ["Git", "Docker"],
            "core_cs": ["Statistics", "Mathematics", "DBMS"],
            "soft_skills": ["Data Storytelling", "Critical Thinking"],
        },
        "projects": [
            {"title": "Credit Default Risk Modeling", "tech": "Python, LightGBM, SHAP"},
            {"title": "Sentiment Analysis on Product Reviews", "tech": "BERT, HuggingFace"},
        ],
        "internships": [{"company": "Fractal Analytics", "role": "Data Science Intern", "duration_months": 4}],
        "ats_score": 90.0,
        "roadmap_completed": 8,
        "roadmap_total": 12,
    },
    {
        "name": "Nikhil Deshmukh",
        "email": "nikhil.d@apex.edu",
        "branch": "Mechanical Engineering",
        "semester": 7,
        "cgpa": 6.9,
        "backlogs": 0,
        "target_role": "qa-automation-engineer",
        "skills": {
            "programming": ["Java", "Python", "SQL"],
            "frameworks": ["Selenium", "Postman"],
            "databases": ["MySQL"],
            "devops_cloud": ["Git", "Jira"],
            "core_cs": ["SDLC", "Manual Testing"],
            "soft_skills": ["Attention to Detail"],
        },
        "projects": [
            {"title": "E-Commerce UI Test Automation Framework", "tech": "Java, Selenium, TestNG"},
        ],
        "internships": [],
        "ats_score": 74.0,
        "roadmap_completed": 5,
        "roadmap_total": 12,
    },
    {
        "name": "Ishita Sengupta",
        "email": "ishita.s@apex.edu",
        "branch": "Computer Science & Engineering",
        "semester": 7,
        "cgpa": 8.4,
        "backlogs": 0,
        "target_role": "full-stack-developer",
        "skills": {
            "programming": ["JavaScript", "TypeScript", "Python", "SQL"],
            "frameworks": ["React", "Next.js", "Node.js", "Express", "Tailwind CSS"],
            "databases": ["MongoDB", "PostgreSQL"],
            "devops_cloud": ["Git", "Docker", "AWS"],
            "core_cs": ["Data Structures", "OOP", "DBMS"],
            "soft_skills": ["Leadership", "Problem Solving"],
        },
        "projects": [
            {"title": "Campus Resource Booking Portal", "tech": "Next.js 14, Tailwind, Prisma"},
            {"title": "Peer Mentorship Live Chat", "tech": "React, Socket.io, Node.js"},
        ],
        "internships": [{"company": "Urban Company", "role": "Frontend Intern", "duration_months": 3}],
        "ats_score": 87.0,
        "roadmap_completed": 7,
        "roadmap_total": 12,
    },
    {
        "name": "Karan Malhotra",
        "email": "karan.m@apex.edu",
        "branch": "Electronics & Communication",
        "semester": 7,
        "cgpa": 6.3,
        "backlogs": 1,
        "target_role": "frontend-engineer",
        "skills": {
            "programming": ["JavaScript", "HTML/CSS"],
            "frameworks": ["React"],
            "databases": [],
            "devops_cloud": ["Git"],
            "core_cs": [],
            "soft_skills": ["Communication"],
        },
        "projects": [
            {"title": "Recipe Finder Web App", "tech": "React, CSS"},
        ],
        "internships": [],
        "ats_score": 60.0,
        "roadmap_completed": 2,
        "roadmap_total": 12,
    },
]


async def ensure_cohort_seeded(db) -> None:
    """
    Ensure the database has a diverse cohort of students for admin placement analytics.
    Seeds only if current student count is below 5.
    """
    count = await db.students.count_documents({})
    if count >= 5:
        return

    predictor = get_predictor()

    for idx, s in enumerate(COHORT_SEEDS):
        # 1. Create user document
        existing = await db.users.find_one({"email": s["email"]})
        if not existing:
            user_doc = {
                "name": s["name"],
                "email": s["email"],
                "password_hash": get_password_hash("Student@1234"),
                "role": UserRole.STUDENT.value,
                "is_active": True,
                "created_at": datetime.now(timezone.utc),
            }
            res = await db.users.insert_one(user_doc)
            user_id = str(res.inserted_id)
        else:
            user_id = str(existing.get("_id") or existing.get("id"))

        # 2. Build student document
        student_doc = {
            "user_id": user_id,
            "personal": {
                "phone": f"+91 98765 {idx:02d}{idx:02d}{idx:02d}",
                "location": "Bangalore, India",
                "roll_number": f"22CS{101 + idx:03d}",
            },
            "education": {
                "degree": "B.Tech",
                "branch": s["branch"],
                "university": "Apex Institute of Technology",
                "graduation_year": 2026,
                "semester": s["semester"],
            },
            "cgpa": s["cgpa"],
            "backlogs": s["backlogs"],
            "target_role": s["target_role"],
            "skills": s["skills"],
            "projects": s["projects"],
            "internships": s["internships"],
            "certifications": [],
            "assessments": {
                "coding_score": min(100, int(s["cgpa"] * 10 + 5)),
                "aptitude_score": min(100, int(s["cgpa"] * 9 + 10)),
            },
            "ats_score": s["ats_score"],
            "updated_at": datetime.now(timezone.utc),
        }

        # 3. Predict placement readiness with ML engine
        pred_res = predictor.predict(student_doc)
        student_doc["placement_probability"] = pred_res["placement_percentage"] / 100.0
        student_doc["readiness_status"] = pred_res["readiness_status"]
        student_doc["placed_likely"] = pred_res["placed"]
        student_doc["top_positive_factors"] = pred_res.get("top_positive_factors", [])
        student_doc["top_negative_factors"] = pred_res.get("top_negative_factors", [])

        # 4. Upsert student record
        await db.students.update_one({"user_id": user_id}, {"$set": student_doc}, upsert=True)

        # 5. Seed roadmap record
        await db.roadmaps.update_one(
            {"user_id": user_id},
            {
                "$set": {
                    "user_id": user_id,
                    "target_role_id": s["target_role"],
                    "target_role_title": get_role_by_id(s["target_role"]).get("title", s["target_role"]) if get_role_by_id(s["target_role"]) else s["target_role"],
                    "completed_tasks": s["roadmap_completed"],
                    "total_tasks": s["roadmap_total"],
                    "progress_percent": round((s["roadmap_completed"] / s["roadmap_total"]) * 100, 1),
                    "created_at": datetime.now(timezone.utc).isoformat(),
                }
            },
            upsert=True,
        )


def _flatten_skills(skills_val: Any) -> List[str]:
    """Helper to extract a flattened list of uppercase-normalized skills."""
    res = []
    if isinstance(skills_val, dict):
        for sub in skills_val.values():
            if isinstance(sub, list):
                res.extend([str(item).strip() for item in sub])
    elif isinstance(skills_val, list):
        res.extend([str(item).strip() for item in skills_val])
    return res


@router.get("/cohort-stats", response_model=CohortStatsResponse)
async def get_cohort_statistics(
    current_user: Dict[str, Any] = Depends(require_role(UserRole.ADMIN)),
):
    """
    Cohort-wide placement readiness analytics across all registered students.
    Provides placement rate, branch comparisons, target role distribution, and skill deficits.
    """
    db = get_database()
    await ensure_cohort_seeded(db)

    students = await db.students.find({}).to_list(1000)
    users = await db.users.find({}).to_list(1000)
    user_map = {str(u.get("_id") or u.get("id")): u for u in users}

    total_students = len(students)
    if total_students == 0:
        return CohortStatsResponse(
            overview=CohortOverview(
                total_students=0,
                avg_placement_probability=0.0,
                high_readiness_count=0,
                moderate_count=0,
                at_risk_count=0,
                placement_rate_pct=0.0,
                avg_cgpa=0.0,
                avg_ats_score=0.0,
                avg_projects=0.0,
                avg_internships=0.0,
            ),
            branches=[],
            target_roles=[],
            top_missing_skills=[],
            total_jobs=len(get_all_jobs()),
            generated_at=datetime.now(timezone.utc).isoformat(),
        )

    # Overview Metrics
    probabilities = []
    cgpas = []
    ats_scores = []
    project_counts = []
    internship_counts = []
    high_count = 0
    mod_count = 0
    at_risk_count = 0

    branch_groups: Dict[str, List[Dict[str, Any]]] = {}
    role_groups: Dict[str, List[Dict[str, Any]]] = {}
    missing_skills_counter: Counter = Counter()

    for st in students:
        prob = float(st.get("placement_probability", 0.50))
        probabilities.append(prob)
        if prob >= 0.70:
            high_count += 1
        elif prob >= 0.40:
            mod_count += 1
        else:
            at_risk_count += 1

        cgpas.append(float(st.get("cgpa", 7.0)))
        ats_scores.append(float(st.get("ats_score", 70.0)))
        project_counts.append(len(st.get("projects", [])))
        internship_counts.append(len(st.get("internships", [])))

        # Group by branch
        edu = st.get("education", {})
        branch = edu.get("branch", "Computer Science & Engineering")
        if branch not in branch_groups:
            branch_groups[branch] = []
        branch_groups[branch].append(st)

        # Group by target role
        target_role = st.get("target_role", "full-stack-developer")
        if target_role not in role_groups:
            role_groups[target_role] = []
        role_groups[target_role].append(st)

        # Skill deficit audit against target role
        role_def = get_role_by_id(target_role)
        if role_def:
            student_skills = {s.lower() for s in _flatten_skills(st.get("skills", {}))}
            for req in role_def.get("critical_skills", []) + role_def.get("important_skills", []):
                if req.lower() not in student_skills:
                    missing_skills_counter[req] += 1

    overview = CohortOverview(
        total_students=total_students,
        avg_placement_probability=round(sum(probabilities) / total_students, 3),
        high_readiness_count=high_count,
        moderate_count=mod_count,
        at_risk_count=at_risk_count,
        placement_rate_pct=round((high_count / total_students) * 100, 1),
        avg_cgpa=round(sum(cgpas) / total_students, 2),
        avg_ats_score=round(sum(ats_scores) / total_students, 1),
        avg_projects=round(sum(project_counts) / total_students, 1),
        avg_internships=round(sum(internship_counts) / total_students, 1),
    )

    # Branch Stats
    branches = []
    for br_name, st_list in branch_groups.items():
        br_cgpas = [s.get("cgpa", 7.0) for s in st_list]
        br_probs = [s.get("placement_probability", 0.5) for s in st_list]
        br_high = sum(1 for p in br_probs if p >= 0.70)
        branches.append(
            BranchStat(
                branch=br_name,
                student_count=len(st_list),
                avg_cgpa=round(sum(br_cgpas) / len(st_list), 2),
                avg_readiness=round((sum(br_probs) / len(st_list)) * 100, 1),
                high_readiness_count=br_high,
            )
        )
    branches.sort(key=lambda b: b.student_count, reverse=True)

    # Target Roles Stats
    roles_stat = []
    for r_id, st_list in role_groups.items():
        role_def = get_role_by_id(r_id)
        role_title = role_def.get("title", r_id) if role_def else r_id
        r_probs = [s.get("placement_probability", 0.5) for s in st_list]
        roles_stat.append(
            TargetRoleStat(
                role_id=r_id,
                role_title=role_title,
                student_count=len(st_list),
                avg_readiness=round((sum(r_probs) / len(st_list)) * 100, 1),
            )
        )
    roles_stat.sort(key=lambda r: r.student_count, reverse=True)

    # Top Missing Skills
    top_deficits = []
    for skill_name, miss_cnt in missing_skills_counter.most_common(8):
        top_deficits.append(
            SkillDeficitItem(
                skill=skill_name,
                category="Technical",
                missing_count=miss_cnt,
                frequency_pct=round((miss_cnt / total_students) * 100, 1),
            )
        )

    return CohortStatsResponse(
        overview=overview,
        branches=branches,
        target_roles=roles_stat,
        top_missing_skills=top_deficits,
        total_jobs=len(get_all_jobs()),
        generated_at=datetime.now(timezone.utc).isoformat(),
    )


@router.get("/students", response_model=AdminStudentsListResponse)
async def list_students_directory(
    branch: Optional[str] = Query(None, description="Filter by engineering branch"),
    min_cgpa: Optional[float] = Query(None, description="Minimum CGPA filter"),
    max_cgpa: Optional[float] = Query(None, description="Maximum CGPA filter"),
    readiness_category: Optional[str] = Query(None, description="Filter: 'high', 'moderate', or 'at_risk'"),
    target_role: Optional[str] = Query(None, description="Filter by target job role"),
    search: Optional[str] = Query(None, description="Search query matching student name, email, or roll number"),
    current_user: Dict[str, Any] = Depends(require_role(UserRole.ADMIN)),
):
    """
    Search and filter students across the entire institution.
    """
    db = get_database()
    await ensure_cohort_seeded(db)

    students = await db.students.find({}).to_list(1000)
    users = await db.users.find({}).to_list(1000)
    user_map = {str(u.get("_id") or u.get("id")): u for u in users}

    roadmaps = await db.roadmaps.find({}).to_list(1000)
    roadmap_map = {r.get("user_id"): r for r in roadmaps}

    items = []
    for st in students:
        uid = str(st.get("user_id", ""))
        u = user_map.get(uid, {})
        name = u.get("name") or st.get("name") or "Student"
        email = u.get("email") or st.get("email") or ""

        personal = st.get("personal", {})
        roll_number = personal.get("roll_number") or ""
        edu = st.get("education", {})
        st_branch = edu.get("branch", "Computer Science & Engineering")
        st_sem = int(edu.get("semester", 7))
        cgpa = float(st.get("cgpa", 7.0))
        t_role = st.get("target_role", "full-stack-developer")
        prob = float(st.get("placement_probability", 0.50))
        ats = float(st.get("ats_score", 70.0))

        if prob >= 0.70:
            category = "High Readiness"
        elif prob >= 0.40:
            category = "Moderate"
        else:
            category = "At Risk"

        # Apply Filters
        if branch and branch.lower() not in st_branch.lower():
            continue
        if min_cgpa is not None and cgpa < min_cgpa:
            continue
        if max_cgpa is not None and cgpa > max_cgpa:
            continue
        if readiness_category:
            cat_lower = readiness_category.lower()
            if cat_lower == "high" and category != "High Readiness":
                continue
            elif cat_lower == "moderate" and category != "Moderate":
                continue
            elif (cat_lower == "at_risk" or cat_lower == "at risk") and category != "At Risk":
                continue
        if target_role and target_role.lower() not in t_role.lower():
            continue
        if search:
            q = search.lower()
            if q not in name.lower() and q not in email.lower() and q not in roll_number.lower():
                continue

        # Missing skills
        role_def = get_role_by_id(t_role)
        student_skills = {s.lower() for s in _flatten_skills(st.get("skills", {}))}
        missing = []
        if role_def:
            for req in role_def.get("critical_skills", []):
                if req.lower() not in student_skills:
                    missing.append(req)

        # Roadmap progress
        rm = roadmap_map.get(uid, {})
        roadmap_pct = float(rm.get("progress_percent", 0.0))

        items.append(
            AdminStudentListItem(
                user_id=uid,
                name=name,
                email=email,
                roll_number=roll_number if roll_number else None,
                branch=st_branch,
                semester=st_sem,
                cgpa=cgpa,
                target_role=t_role,
                placement_probability=round(prob, 3),
                readiness_category=category,
                ats_score=round(ats, 1),
                skills_count=len(student_skills),
                top_missing_skills=missing[:3],
                roadmap_progress_pct=roadmap_pct,
                completeness_percent=float(st.get("completeness_percent", 80.0)),
            )
        )

    # Sort by probability descending
    items.sort(key=lambda x: x.placement_probability, reverse=True)

    return AdminStudentsListResponse(total=len(items), students=items)


@router.get("/students/{user_id}", response_model=AdminStudentDetail)
async def get_student_drilldown(
    user_id: str,
    current_user: Dict[str, Any] = Depends(require_role(UserRole.ADMIN)),
):
    """
    Get detailed student dossier including profile, ML predictions, ATS factors, and roadmap state.
    """
    db = get_database()
    st = await db.students.find_one({"user_id": user_id})
    if not st:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student with user ID '{user_id}' not found.",
        )

    u = await db.users.find_one({"_id": user_id}) or await db.users.find_one({"email": st.get("email")})
    name = (u.get("name") if u else None) or st.get("name") or "Student"
    email = (u.get("email") if u else None) or st.get("email") or ""

    personal = st.get("personal", {})
    roll_number = personal.get("roll_number")
    edu = st.get("education", {})
    cgpa = float(st.get("cgpa", 7.0))
    backlogs = int(st.get("backlogs", 0))
    skills = st.get("skills", {})
    t_role = st.get("target_role", "full-stack-developer")
    prob = float(st.get("placement_probability", 0.50))
    ats = float(st.get("ats_score", 70.0))

    if prob >= 0.70:
        category = "High Readiness"
    elif prob >= 0.40:
        category = "Moderate"
    else:
        category = "At Risk"

    # Missing skills
    role_def = get_role_by_id(t_role)
    student_skills = {s.lower() for s in _flatten_skills(skills)}
    missing = []
    if role_def:
        for req in role_def.get("critical_skills", []) + role_def.get("important_skills", []):
            if req.lower() not in student_skills:
                missing.append(req)

    # Matched jobs count (where candidate meets min_cgpa)
    all_jobs = get_all_jobs()
    matched_cnt = sum(1 for j in all_jobs if cgpa >= j.get("min_cgpa", 0.0))

    # Roadmap
    rm = await db.roadmaps.find_one({"user_id": user_id}) or {}
    completed_tasks = int(rm.get("completed_tasks", 0))
    total_tasks = int(rm.get("total_tasks", 12))
    progress_pct = float(rm.get("progress_percent", 0.0))

    pos_factors = []
    for f in st.get("top_positive_factors", []):
        if isinstance(f, dict):
            pos_factors.append(f.get("factor") or str(f))
        elif isinstance(f, str):
            pos_factors.append(f)
    if not pos_factors:
        pos_factors = ["Strong Academic CGPA", "Consistent Technical Skills"]

    neg_factors = []
    for f in st.get("top_negative_factors", []):
        if isinstance(f, dict):
            neg_factors.append(f.get("factor") or str(f))
        elif isinstance(f, str):
            neg_factors.append(f)

    return AdminStudentDetail(
        user_id=user_id,
        name=name,
        email=email,
        roll_number=roll_number,
        education=edu,
        cgpa=cgpa,
        backlogs=backlogs,
        skills=skills if isinstance(skills, dict) else {"general": list(skills)},
        target_role=t_role,
        placement_probability=round(prob, 3),
        readiness_category=category,
        ats_score=round(ats, 1),
        ats_breakdown=st.get("ats_breakdown"),
        top_positive_factors=pos_factors,
        top_negative_factors=neg_factors,
        missing_skills=missing,
        matched_jobs_count=matched_cnt,
        roadmap_completed_tasks=completed_tasks,
        roadmap_total_tasks=total_tasks,
        roadmap_progress_pct=progress_pct,
    )


@router.get("/jobs", response_model=List[AdminJobItem])
async def list_admin_campus_jobs(
    current_user: Dict[str, Any] = Depends(require_role(UserRole.ADMIN)),
):
    """
    List all active campus placement opportunities with applicant eligibility counts.
    """
    db = get_database()
    await ensure_cohort_seeded(db)

    students = await db.students.find({}).to_list(1000)
    jobs = get_all_jobs()

    items = []
    for j in jobs:
        min_cgpa = float(j.get("min_cgpa", 0.0))
        eligible_cnt = sum(1 for s in students if float(s.get("cgpa", 0.0)) >= min_cgpa)
        items.append(
            AdminJobItem(
                id=j.get("id"),
                title=j.get("title"),
                company=j.get("company"),
                company_tier=j.get("company_tier", "Tier 1 Product"),
                logo_text=j.get("logo_text", "JOB"),
                location=j.get("location", "Bangalore"),
                salary_range=j.get("salary_range", "₹12.0 - 18.0 LPA"),
                min_cgpa=min_cgpa,
                job_type=j.get("job_type", "Full-time"),
                deadline=j.get("deadline", "2026-12-31"),
                required_skills=j.get("required_skills", []),
                preferred_skills=j.get("preferred_skills", []),
                description=j.get("description", ""),
                experience_level=j.get("experience_level", "Entry Level"),
                eligible_applicants_count=eligible_cnt,
            )
        )

    return items


@router.post("/jobs", response_model=AdminJobItem, status_code=status.HTTP_201_CREATED)
async def create_campus_job_drive(
    data: JobCreateRequest,
    current_user: Dict[str, Any] = Depends(require_role(UserRole.ADMIN)),
):
    """
    Post a new campus recruitment drive or corporate hiring opportunity.
    """
    job_id = f"job-{data.company.lower().replace(' ', '-')}-{uuid.uuid4().hex[:6]}"
    logo_initials = "".join([part[0] for part in data.company.split()[:3]]).upper()

    new_job = {
        "id": job_id,
        "title": data.title,
        "company": data.company,
        "company_tier": data.company_tier,
        "logo_text": logo_initials if logo_initials else "JOB",
        "location": data.location,
        "salary_range": data.salary_range,
        "min_cgpa": data.min_cgpa,
        "job_type": data.job_type,
        "deadline": data.deadline,
        "required_skills": data.required_skills,
        "preferred_skills": data.preferred_skills,
        "description": data.description,
        "experience_level": data.experience_level,
    }

    # Append to runtime memory list so matching endpoints detect it
    CAMPUS_JOBS.insert(0, new_job)

    db = get_database()
    try:
        await db.jobs.insert_one(new_job)
    except Exception:
        pass

    # Count eligible students
    students = await db.students.find({}).to_list(1000)
    eligible_cnt = sum(1 for s in students if float(s.get("cgpa", 0.0)) >= data.min_cgpa)

    return AdminJobItem(
        **new_job,
        eligible_applicants_count=eligible_cnt,
    )


@router.delete("/jobs/{job_id}", status_code=status.HTTP_200_OK)
async def delete_campus_job(
    job_id: str,
    current_user: Dict[str, Any] = Depends(require_role(UserRole.ADMIN)),
):
    """
    Delete an active campus recruitment drive.
    """
    target = None
    for i, j in enumerate(CAMPUS_JOBS):
        if j.get("id") == job_id:
            target = i
            break

    if target is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Campus job drive with ID '{job_id}' not found.",
        )

    deleted_job = CAMPUS_JOBS.pop(target)

    db = get_database()
    try:
        await db.jobs.delete_one({"id": job_id})
    except Exception:
        pass

    return {
        "status": "success",
        "message": f"Successfully removed job drive '{deleted_job.get('title')}' at {deleted_job.get('company')}.",
        "job_id": job_id,
    }


@router.get("/export/cohort-csv")
async def export_cohort_csv_report(
    current_user: Dict[str, Any] = Depends(require_role(UserRole.ADMIN)),
):
    """
    Export institutional cohort placement readiness report as a CSV file for college authorities and placement cells.
    """
    db = get_database()
    await ensure_cohort_seeded(db)

    students = await db.students.find({}).to_list(1000)
    users = await db.users.find({}).to_list(1000)
    user_map = {str(u.get("_id") or u.get("id")): u for u in users}

    output = io.StringIO()
    writer = csv.writer(output)

    # Header
    writer.writerow([
        "Student Name",
        "Email",
        "Roll Number",
        "Branch",
        "Semester",
        "CGPA",
        "Backlogs",
        "Target Role",
        "Placement Probability (%)",
        "Readiness Category",
        "ATS Score (100)",
        "Projects Count",
        "Internships Count",
        "Top Missing Skills",
    ])

    for st in students:
        uid = str(st.get("user_id", ""))
        u = user_map.get(uid, {})
        name = u.get("name") or st.get("name") or "Student"
        email = u.get("email") or st.get("email") or ""
        personal = st.get("personal", {})
        roll = personal.get("roll_number", "N/A")
        edu = st.get("education", {})
        branch = edu.get("branch", "Computer Science")
        sem = edu.get("semester", 7)
        cgpa = float(st.get("cgpa", 7.0))
        backlogs = int(st.get("backlogs", 0))
        t_role = st.get("target_role", "full-stack-developer")
        prob = float(st.get("placement_probability", 0.50))
        ats = float(st.get("ats_score", 70.0))

        if prob >= 0.70:
            category = "High Readiness"
        elif prob >= 0.40:
            category = "Moderate"
        else:
            category = "At Risk"

        # Missing skills
        role_def = get_role_by_id(t_role)
        student_skills = {s.lower() for s in _flatten_skills(st.get("skills", {}))}
        missing = []
        if role_def:
            for req in role_def.get("critical_skills", []):
                if req.lower() not in student_skills:
                    missing.append(req)

        writer.writerow([
            name,
            email,
            roll,
            branch,
            sem,
            f"{cgpa:.2f}",
            backlogs,
            t_role,
            f"{prob * 100:.1f}%",
            category,
            f"{ats:.1f}",
            len(st.get("projects", [])),
            len(st.get("internships", [])),
            "; ".join(missing[:3]) if missing else "None",
        ])

    csv_data = output.getvalue()
    filename = f"placement_cohort_report_{datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')}.csv"

    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )
