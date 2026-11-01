"""
Personalized 8-Week Learning Roadmap Engine.
Generates a customized, milestone-driven curriculum tailored to the student's target role
and specific missing critical/important skills.
"""

from typing import Dict, Any, List, Union, Set
from backend.app.models.job_roles import get_role_by_id
from backend.app.analytics.skill_gap import analyze_skill_gap


def generate_eight_week_roadmap(
    candidate_skills: Union[Dict[str, Any], List[str]],
    target_role_id: str = "full-stack-developer",
    candidate_cgpa: float = 7.5,
) -> Dict[str, Any]:
    """
    Constructs an individualized 8-week action plan to bridge skill gaps for the target role.
    """
    role = get_role_by_id(target_role_id)
    if not role:
        raise ValueError(f"Job role '{target_role_id}' not recognized.")

    # Run gap analysis to identify exact missing skills
    gap_report = analyze_skill_gap(candidate_skills, target_role_id, candidate_cgpa)
    missing_crit = [s["name"] for s in gap_report["missing_critical"]]
    missing_imp = [s["name"] for s in gap_report["missing_important"]]
    missing_opt = [s["name"] for s in gap_report["missing_optional"]]

    # Curate weekly modules
    weeks = []

    # Week 1: Core Fundamentals & Language Deep Dive
    w1_skills = missing_crit[:2] if missing_crit else role["critical_skills"][:2]
    weeks.append({
        "week_number": 1,
        "title": "Core Foundations & Disqualifier Remediation",
        "theme": "Foundations",
        "badge_color": "rose",
        "target_hours": 18,
        "focus_skills": w1_skills,
        "learning_goals": [
            f"Review core syntax and runtime architecture of {', '.join(w1_skills)}.",
            "Eliminate screening disqualifiers by writing robust, type-safe clean code.",
            "Setup standardized development workflow with Git branches and linting.",
        ],
        "tasks": [
            {
                "id": f"task-w1-1",
                "title": f"Deep dive into {w1_skills[0] if w1_skills else 'Core Language'} syntax and execution model",
                "estimated_hours": 6,
                "difficulty": "Intermediate",
                "completed": False,
                "resource_url": "https://developer.mozilla.org",
            },
            {
                "id": f"task-w1-2",
                "title": f"Solve 10 foundational algorithm problems utilizing {w1_skills[0] if w1_skills else 'target language'}",
                "estimated_hours": 6,
                "difficulty": "Beginner",
                "completed": False,
                "resource_url": "https://leetcode.com",
            },
            {
                "id": f"task-w1-3",
                "title": "Configure Git semantic commits, .gitignore, and clean repository conventions",
                "estimated_hours": 3,
                "difficulty": "Beginner",
                "completed": False,
                "resource_url": "https://git-scm.com/doc",
            },
        ],
        "milestone_deliverable": f"Pass automated unit tests for 10 foundational algorithmic challenges in {w1_skills[0] if w1_skills else 'core stack'}.",
    })

    # Week 2: Advanced Core & Secondary Disqualifiers
    w2_skills = missing_crit[2:4] if len(missing_crit) > 2 else (missing_imp[:2] if missing_imp else role["critical_skills"][2:4])
    weeks.append({
        "week_number": 2,
        "title": "Secondary Disqualifier Bridge & Data Modeling",
        "theme": "Data & Backend",
        "badge_color": "rose",
        "target_hours": 18,
        "focus_skills": w2_skills,
        "learning_goals": [
            f"Bridge secondary missing critical competency: {', '.join(w2_skills)}.",
            "Design normalized relational/NoSQL schemas and master database query indexing.",
            "Write modular functions with comprehensive error boundaries and logging.",
        ],
        "tasks": [
            {
                "id": f"task-w2-1",
                "title": f"Implement CRUD operations and transactions in {w2_skills[0] if w2_skills else 'Database'}",
                "estimated_hours": 7,
                "difficulty": "Intermediate",
                "completed": False,
                "resource_url": "https://www.postgresql.org/docs/",
            },
            {
                "id": f"task-w2-2",
                "title": "Profile slow queries using EXPLAIN ANALYZE and implement B-Tree index optimizations",
                "estimated_hours": 5,
                "difficulty": "Advanced",
                "completed": False,
                "resource_url": "https://use-the-index-luke.com",
            },
            {
                "id": f"task-w2-3",
                "title": "Build unit tests with 80%+ branch coverage for database models",
                "estimated_hours": 4,
                "difficulty": "Intermediate",
                "completed": False,
                "resource_url": "https://docs.pytest.org",
            },
        ],
        "milestone_deliverable": "A standalone database access layer with schema migrations and passing benchmark tests.",
    })

    # Week 3: Framework Specialization & REST APIs
    w3_skills = missing_imp[:2] if missing_imp else role["important_skills"][:2]
    weeks.append({
        "week_number": 3,
        "title": "Modern Framework Mastery & RESTful Services",
        "theme": "Frameworks",
        "badge_color": "amber",
        "target_hours": 20,
        "focus_skills": w3_skills,
        "learning_goals": [
            f"Master asynchronous request handling and state lifecycles in {', '.join(w3_skills)}.",
            "Build secure endpoints with JWT authentication and RBAC authorization.",
            "Implement input validation and structured OpenAPI/Swagger documentation.",
        ],
        "tasks": [
            {
                "id": f"task-w3-1",
                "title": f"Construct 5 production-grade REST API endpoints in {w3_skills[0] if w3_skills else 'Framework'}",
                "estimated_hours": 8,
                "difficulty": "Intermediate",
                "completed": False,
                "resource_url": "https://fastapi.tiangolo.com",
            },
            {
                "id": f"task-w3-2",
                "title": "Integrate token-based authentication (JWT + Bcrypt hashing) with secure cookies",
                "estimated_hours": 6,
                "difficulty": "Intermediate",
                "completed": False,
                "resource_url": "https://jwt.io",
            },
            {
                "id": f"task-w3-3",
                "title": "Enforce strict schema validation with automated error response formatting",
                "estimated_hours": 4,
                "difficulty": "Beginner",
                "completed": False,
                "resource_url": "https://docs.pydantic.dev",
            },
        ],
        "milestone_deliverable": "Fully documented interactive REST API with JWT authentication and automated schema validation.",
    })

    # Week 4: State Management, UI/UX & Client Architecture
    w4_skills = [s for s in role["important_skills"] if "React" in s or "CSS" in s or "Docker" in s] or role["important_skills"][2:4]
    weeks.append({
        "week_number": 4,
        "title": "Full-Stack Architecture & Client Integration",
        "theme": "Architecture",
        "badge_color": "amber",
        "target_hours": 20,
        "focus_skills": w4_skills,
        "learning_goals": [
            "Connect asynchronous server endpoints to modern client state architectures.",
            "Implement caching, optimistic UI updates, and debounce search handlers.",
            "Ensure mobile responsive layout with WCAG AA accessibility contrast.",
        ],
        "tasks": [
            {
                "id": f"task-w4-1",
                "title": "Build a responsive dashboard layout with dark/light theme switching",
                "estimated_hours": 7,
                "difficulty": "Intermediate",
                "completed": False,
                "resource_url": "https://tailwindcss.com",
            },
            {
                "id": f"task-w4-2",
                "title": "Handle API loading skeletons, network retry timeouts, and error toasts",
                "estimated_hours": 6,
                "difficulty": "Intermediate",
                "completed": False,
                "resource_url": "https://react.dev",
            },
            {
                "id": f"task-w4-3",
                "title": "Package application components into containerized Docker multi-stage builds",
                "estimated_hours": 5,
                "difficulty": "Advanced",
                "completed": False,
                "resource_url": "https://docs.docker.com",
            },
        ],
        "milestone_deliverable": "A responsive frontend client consuming live backend APIs with Docker containerization.",
    })

    # Week 5: Capstone Portfolio Project - Phase 1 (Core Engineering)
    weeks.append({
        "week_number": 5,
        "title": "Capstone Project: Core System Implementation",
        "theme": "Portfolio",
        "badge_color": "indigo",
        "target_hours": 22,
        "focus_skills": role["critical_skills"][:3] + missing_imp[:1],
        "learning_goals": [
            f"Initiate major industry-standard portfolio capstone tailored for {role['title']}.",
            "Architect realistic business domain logic (e.g. distributed queue, e-commerce engine, or ML pipeline).",
            "Write comprehensive GitHub README with architecture diagrams and API docs.",
        ],
        "tasks": [
            {
                "id": f"task-w5-1",
                "title": "Draft architectural system design and entity-relationship schema diagrams",
                "estimated_hours": 5,
                "difficulty": "Intermediate",
                "completed": False,
                "resource_url": "https://mermaid.js.org",
            },
            {
                "id": f"task-w5-2",
                "title": "Implement core backend business logic, database migrations, and unit test suites",
                "estimated_hours": 12,
                "difficulty": "Advanced",
                "completed": False,
                "resource_url": "https://github.com",
            },
            {
                "id": f"task-w5-3",
                "title": "Write clear README documentation highlighting problem statement, tech stack, and setup",
                "estimated_hours": 3,
                "difficulty": "Beginner",
                "completed": False,
                "resource_url": "https://readme.so",
            },
        ],
        "milestone_deliverable": "Working GitHub repository with complete business logic, passing tests, and professional README.",
    })

    # Week 6: Capstone Portfolio Project - Phase 2 (Production Deployment)
    weeks.append({
        "week_number": 6,
        "title": "Capstone Project: Cloud Deployment & CI/CD",
        "theme": "DevOps",
        "badge_color": "indigo",
        "target_hours": 20,
        "focus_skills": ["Docker", "CI/CD", "Cloud Deployment"],
        "learning_goals": [
            "Deploy the capstone project live to public cloud (AWS / Render / Vercel).",
            "Setup automated continuous integration testing with GitHub Actions.",
            "Record a 2-minute video demo demonstrating features to recruiters.",
        ],
        "tasks": [
            {
                "id": f"task-w6-1",
                "title": "Configure GitHub Actions CI workflow running automated linter and pytest suites",
                "estimated_hours": 6,
                "difficulty": "Intermediate",
                "completed": False,
                "resource_url": "https://docs.github.com/en/actions",
            },
            {
                "id": f"task-w6-2",
                "title": "Deploy production containers with HTTPS SSL certificate and live environment variables",
                "estimated_hours": 8,
                "difficulty": "Advanced",
                "completed": False,
                "resource_url": "https://render.com",
            },
            {
                "id": f"task-w6-3",
                "title": "Attach live demo link and Loom walkthrough recording to the repository header",
                "estimated_hours": 4,
                "difficulty": "Beginner",
                "completed": False,
                "resource_url": "https://loom.com",
            },
        ],
        "milestone_deliverable": "Live production URL and automated GitHub Actions CI pipeline passing green on every push.",
    })

    # Week 7: DSA Patterns & High-Scale System Design
    weeks.append({
        "week_number": 7,
        "title": "DSA Patterns, Concurrency & System Design",
        "theme": "Interview Prep",
        "badge_color": "purple",
        "target_hours": 22,
        "focus_skills": ["Data Structures", "Algorithms", "System Design"],
        "learning_goals": [
            "Master top 5 campus DSA patterns: Sliding Window, Two Pointers, Fast & Slow Pointers, BFS/DFS, DP.",
            "Practice architectural tradeoffs: Caching (Redis), Load Balancing, and Sharding.",
            "Conduct 2 peer mock technical interviews with timed whiteboarding constraints.",
        ],
        "tasks": [
            {
                "id": f"task-w7-1",
                "title": "Solve 15 NeetCode / Blind 75 questions focusing on Trees, Graphs, and HashMaps",
                "estimated_hours": 10,
                "difficulty": "Advanced",
                "completed": False,
                "resource_url": "https://neetcode.io",
            },
            {
                "id": f"task-w7-2",
                "title": "Design a high-scale URL shortener / Rate Limiter with throughput calculations",
                "estimated_hours": 6,
                "difficulty": "Advanced",
                "completed": False,
                "resource_url": "https://github.com/donnemartin/system-design-primer",
            },
            {
                "id": f"task-w7-3",
                "title": "Perform 1 mock interview simulation under 45-minute timed exam conditions",
                "estimated_hours": 4,
                "difficulty": "Advanced",
                "completed": False,
                "resource_url": "https://pramp.com",
            },
        ],
        "milestone_deliverable": "Portfolio of 15 optimal algorithmic solutions and 2 completed system design schematics.",
    })

    # Week 8: Behavioral HR, ATS Resume Audit & Fast-Track Applications
    weeks.append({
        "week_number": 8,
        "title": "ATS Optimization, STAR Stories & Fast-Track Applications",
        "theme": "Placement Sprint",
        "badge_color": "emerald",
        "target_hours": 18,
        "focus_skills": ["ATS Resume", "STAR Behavioral", "Interview Mastery"],
        "learning_goals": [
            "Score 85+ on the AI ATS Resume Auditor incorporating new portfolio links and skills.",
            "Formulate 6 STAR (Situation, Task, Action, Result) behavioral interview anecdotes.",
            "Submit targeted applications to top matching companies on the Placement Portal.",
        ],
        "tasks": [
            {
                "id": f"task-w8-1",
                "title": "Update resume PDF with metrics-driven bullet points using strong action verbs",
                "estimated_hours": 5,
                "difficulty": "Intermediate",
                "completed": False,
                "resource_url": "https://resumeworded.com",
            },
            {
                "id": f"task-w8-2",
                "title": "Prepare STAR framework answers for: 'Tell me about a complex bug', 'Conflict in team', 'Deadlines'",
                "estimated_hours": 5,
                "difficulty": "Intermediate",
                "completed": False,
                "resource_url": "https://interviewing.io",
            },
            {
                "id": f"task-w8-3",
                "title": "Submit 5 fast-track applications to high-match companies on the Placement Portal",
                "estimated_hours": 6,
                "difficulty": "Beginner",
                "completed": False,
                "resource_url": "/jobs",
            },
        ],
        "milestone_deliverable": "Verified 85+ ATS score on resume, 6 polished STAR stories, and 5 submitted applications.",
    })

    # Calculate overall progress
    total_tasks = sum(len(w["tasks"]) for w in weeks)
    completed_tasks = sum(sum(1 for t in w["tasks"] if t.get("completed", False)) for w in weeks)

    return {
        "target_role_id": role["id"],
        "target_role_title": role["title"],
        "target_category": role["category"],
        "starting_match_percentage": gap_report["match_percentage"],
        "projected_completion_match": min(98.0, gap_report["match_percentage"] + 35.0),
        "total_weeks": 8,
        "total_tasks": total_tasks,
        "completed_tasks": completed_tasks,
        "progress_percentage": round((completed_tasks / total_tasks * 100.0) if total_tasks > 0 else 0.0, 1),
        "missing_critical_count": len(missing_crit),
        "missing_important_count": len(missing_imp),
        "weeks": weeks,
    }
