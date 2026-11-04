import os
import re
from typing import Dict, Any, List, Optional


def try_call_gemini_api(
    query: str,
    first_name: str,
    target_role: str,
    history: Optional[List[Dict[str, str]]] = None,
) -> Optional[str]:
    """
    Optional live Google Gemini integration if GEMINI_API_KEY is set in environment.
    Enforces customer-care persona and strict HireMatrix platform boundary.
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return None

    try:
        import httpx

        system_instruction = (
            "You are the HireMatrix AI Customer Support Specialist & Career Advisor. "
            "You speak in a warm, polite, natural customer-care tone. "
            "You ONLY answer questions related to the HireMatrix AI platform (its 4 pillars, "
            "AI Placement Predictor, SVAR voice tests, 3-Tier Skill Gap, Resume ATS scanner, "
            "1-Click LinkedIn Pitch, Company Interview Cheat Sheets, and University ERP) "
            "and campus placement preparation (DSA, coding rounds, backlogs, HR questions). "
            "If a user asks something completely outside of HireMatrix or placements (like recipes, "
            "sports, or movies), politely decline and steer them back to HireMatrix. "
            "Never repeat robotic greetings or dump profile data repeatedly."
        )

        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
        payload = {
            "contents": [
                {
                    "role": "user",
                    "parts": [{"text": f"{system_instruction}\n\nUser: {query}"}],
                }
            ],
            "generationConfig": {"temperature": 0.4, "maxOutputTokens": 800},
        }

        with httpx.Client(timeout=8.0) as client:
            resp = client.post(url, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                candidates = data.get("candidates") or []
                if candidates:
                    parts = (candidates[0].get("content") or {}).get("parts") or []
                    if parts and "text" in parts[0]:
                        return parts[0]["text"].strip()
    except Exception:
        # Fall back to native local knowledge engine
        pass
    return None


def generate_copilot_response(
    query: str,
    student_profile: Dict[str, Any],
    skill_gap_summary: Optional[Dict[str, Any]] = None,
    prediction_summary: Optional[Dict[str, Any]] = None,
    resume_summary: Optional[Dict[str, Any]] = None,
    history: Optional[List[Dict[str, str]]] = None,
) -> Dict[str, Any]:
    """
    Natural Customer Care & Career Copilot response engine for HireMatrix.
    Behaves like a friendly, knowledgeable customer support advisor:
    - Never repeats robotic 'Hello Candidate' or repetitive snapshot data dumps.
    - Strictly focuses on HireMatrix AI platform features and placement preparation.
    - Warmly handles greetings, follow-ups, and off-topic boundaries.
    """
    student_profile = student_profile or {}
    name = student_profile.get("name") or "Candidate"
    first_name = name.split()[0] if name and name.lower() not in ["candidate", "student"] else "there"
    cgpa = student_profile.get("cgpa") or 7.5
    backlogs = student_profile.get("backlogs") or 0
    education = student_profile.get("education") or {}
    branch = education.get("branch", "Computer Science")

    assessments = student_profile.get("assessments") or {}
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
        missing_critical = skill_gap_summary.get("missing_critical") or []
        missing_important = skill_gap_summary.get("missing_important") or []

    # Coding Profiles
    coding_profiles = student_profile.get("coding_profiles") or {}
    leetcode_stats = coding_profiles.get("leetcode_stats") or {}
    total_solved = leetcode_stats.get("total_solved", 0)

    # ATS score
    ats_score = (resume_summary or {}).get("ats_score", 82)

    q = query.strip()
    q_lower = q.lower()

    # Try live Gemini API if configured
    gemini_reply = try_call_gemini_api(q, first_name, target_role, history)
    if gemini_reply:
        return {
            "reply": gemini_reply,
            "suggested_actions": [
                "What is HireMatrix AI?",
                "How does the SVAR Voice test work?",
                "How to boost my readiness score past 90%?",
                "Show all features on this webpage",
            ],
            "context_used": {
                "name": name,
                "readiness_percentage": readiness_pct,
                "target_role": target_role,
            },
        }

    # Detect conversational state
    is_first_interaction = not history or len(history) <= 1

    # --------------------------------------------------------------------------
    # 0. PURE GREETINGS / CHIT-CHAT ("hi", "hello", "hey", "kaise ho")
    # --------------------------------------------------------------------------
    is_pure_greeting = any(
        re.fullmatch(pattern, q_lower.strip())
        for pattern in [
            r"hi+",
            r"hello+",
            r"hey+",
            r"good\s+(morning|afternoon|evening)",
            r"kaise\s+ho\??",
            r"namaste",
            r"sup",
            r"hola",
            r"what'?s\s+up",
        ]
    )

    if is_pure_greeting:
        greeting_target = f" {first_name}" if first_name != "there" else ""
        reply = (
            f"Hi{greeting_target}! 👋 Welcome to **HireMatrix Support**!\n\n"
            f"I'm your dedicated placement and platform assistant. I can help you with anything on this webpage—from running the **AI Placement Predictor** and taking the **SVAR Spoken English test** to analyzing your **resume ATS score** and drafting **LinkedIn referral pitches**.\n\n"
            f"How can I help you today?"
        )
        actions = [
            "What is HireMatrix AI?",
            "How does the SVAR Voice test work?",
            "How can I boost my placement readiness past 90%?",
            "Show all features on this webpage",
        ]
        return {
            "reply": reply,
            "suggested_actions": actions,
            "context_used": {"name": name, "readiness_percentage": readiness_pct},
        }

    # --------------------------------------------------------------------------
    # 1. WHAT IS HIREMATRIX / ABOUT THE PLATFORM / WEBPAGE OVERVIEW
    # --------------------------------------------------------------------------
    is_about_hirematrix = any(
        k in q_lower
        for k in [
            "what is hirematrix",
            "what's hirematrix",
            "about hirematrix",
            "hirematrix kya hai",
            "kya hai hirematrix",
            "hirematrix ke bare",
            "hirematrix ke baare",
            "tell me about hirematrix",
            "what is this website",
            "what is this webpage",
            "about this platform",
            "what does hirematrix do",
            "why hirematrix",
            "purpose of hirematrix",
            "explain hirematrix",
        ]
    ) or (("what is" in q_lower or "about" in q_lower) and "hirematrix" in q_lower)

    if is_about_hirematrix:
        reply = (
            f"I'd be happy to explain! **HireMatrix AI** is an **Autonomous Campus Placement & Career Intelligence Operating System** "
            f"created to help college students successfully crack top-tier technical campus placements (Product companies, Startups, and Tier-1/Tier-2 recruiters).\n\n"
            f"### 🚀 **Key Modules on this Platform**:\n"
            f"1. **AI Placement Predictor & Simulator**: Uses supervised machine learning (XGBoost) and TreeSHAP to calculate your placement probability (0-100%) with What-If simulation sliders.\n"
            f"2. **Aptitude & SVAR Voice Assessment (Phase 19)**: Tests Quantitative/Logical MCQs followed by an automated SVAR spoken English voice test (sentence repetition & 45s extempore speech with audio recordings for admin audit).\n"
            f"3. **3-Tier Skill Gap Analyzer (Phase 7)**: Benchmarks your skills against 10+ standard tech roles (SDE, DevOps, Data Analyst, etc.) into *Critical*, *Important*, and *Good-to-Have* voids.\n"
            f"4. **Resume Parser & ATS Auditor (Phase 6)**: NLP engine that checks your resume against ATS standards and formats bullet points using Google's XYZ formula.\n"
            f"5. **1-Click LinkedIn Pitch Generator (Phase 20)**: Generates high-converting referral requests and cold recruiter outreach messages.\n"
            f"6. **Company Interview Cheat Sheets (Phase 18)**: Curated interview playbooks for Google, Amazon, Microsoft, TCS, Infosys, and more.\n"
            f"7. **University ERP & Campus Drives (Phase 17)**: Live eligibility matching and drive tracking for college placement offices.\n\n"
            f"Which of these features would you like to explore first?"
        )
        actions = [
            "How does the AI Placement Predictor work?",
            "How do I take the SVAR Voice test?",
            "Show me all features on this webpage",
            "How to get started on HireMatrix",
        ]

    # --------------------------------------------------------------------------
    # 2. ALL FEATURES / TOOLS / 4 PILLARS ON WEBPAGE
    # --------------------------------------------------------------------------
    elif any(
        k in q_lower
        for k in [
            "features",
            "all features",
            "what features",
            "what tools",
            "what can you do",
            "modules",
            "pillars",
            "4 pillars",
            "webpage sections",
            "how to navigate",
            "platform features",
        ]
    ):
        reply = (
            f"Here is a complete breakdown of the **4 Core Pillars** on HireMatrix:\n\n"
            f"### 📊 **1. Intelligence & ML**\n"
            f"- **Overview & Telemetry**: Live system health, API response latency, and connectivity status.\n"
            f"- **Placement Predictor**: ML-powered readiness simulation with interactive What-If sliders.\n"
            f"- **Student Profile & Skill Graph**: Academic records, verified GitHub & LeetCode scraper, and skill taxonomy.\n"
            f"- **Skill Gap Analyzer**: 3-tier gap breakdown into Critical, Important, and Good-to-have skills.\n\n"
            f"### 🧠 **2. Assessments & Practice**\n"
            f"- **Aptitude & SVAR Voice**: Timed Quantitative/Logical MCQs + AI Spoken English speech evaluation.\n"
            f"- **Live AI Mock Interviewer**: Voice-driven technical and behavioral interview practice.\n"
            f"- **8-Week Roadmap**: Personalized week-by-week study milestones.\n"
            f"- **Company Cheat Sheets**: Round-by-round interview guides for top employers.\n\n"
            f"### 💼 **3. Placements & Outreach**\n"
            f"- **University ERP & Drives**: Campus drive listings, eligibility cutoffs, and shortlists.\n"
            f"- **Campus Jobs Matcher**: Semantic matching of student profiles to industry openings.\n"
            f"- **LinkedIn Pitch Generator**: 1-click customized cold referral requests.\n"
            f"- **Resume Parser & ATS Auditor**: Deep NLP resume scoring and keyword extraction.\n\n"
            f"### 🛡️ **4. Admin & Governance**\n"
            f"- **Admin Command Center**: Institutional dashboard for faculty to view student test records and listen to recorded voice audios.\n"
            f"- **Product Tour**: Guided demo video walkthrough.\n\n"
            f"You can switch between any of these pillars using the navigation bar at the top!"
        )
        actions = [
            "Tell me about the SVAR Voice test",
            "How does the Resume ATS Auditor work?",
            "How to use LinkedIn Pitch Generator?",
            "Check my placement readiness score",
        ]

    # --------------------------------------------------------------------------
    # 3. HOW TO GET STARTED / USER GUIDE
    # --------------------------------------------------------------------------
    elif any(
        k in q_lower
        for k in [
            "how to use",
            "how do i start",
            "how to get started",
            "getting started",
            "how does this work",
            "steps to use",
            "guide",
            "kaise use kare",
            "start kaise kare",
        ]
    ):
        reply = (
            f"Getting started on HireMatrix is simple and takes less than 2 minutes! Here is the recommended path:\n\n"
            f"1. **Sign In or Try Demo**: Click **'Get Started'** at the top right. You can register your account or click **'Demo Student'** for an instant preview.\n"
            f"2. **Check Your Placement Probability**: Navigate to the **'AI Placement Predictor'** to see your ML readiness percentage and test What-If scenarios.\n"
            f"3. **Take the Aptitude & SVAR Voice Assessment**: In the *Assessments & Practice* tab, test your quantitative speed and practice speaking English sentences.\n"
            f"4. **Audit Your Resume**: Upload your resume to the **'Resume Parser & ATS'** tab to check your ATS score out of 100.\n"
            f"5. **Follow Your 8-Week Roadmap**: Work through your custom weekly milestones to close your critical skill voids.\n"
            f"6. **Reach Out for Referrals**: Generate 1-click customized LinkedIn messages in the *Placements & Outreach* tab.\n\n"
            f"Would you like me to guide you to any specific section right now?"
        )
        actions = [
            "Take the Aptitude & SVAR test",
            "Audit my resume for ATS compliance",
            "Show my 8-week learning roadmap",
            "What companies hire through HireMatrix?",
        ]

    # --------------------------------------------------------------------------
    # 4. SVAR VOICE TEST / SPOKEN ENGLISH / AUDIO ASSESSMENT
    # --------------------------------------------------------------------------
    elif any(
        k in q_lower
        for k in [
            "svar",
            "voice test",
            "spoken english",
            "speaking test",
            "speech test",
            "extempore",
            "sentence repetition",
            "voice recording",
            "cefr",
            "communication score",
            "audio",
        ]
    ):
        reply = (
            f"I'd love to explain that! Our **Aptitude & SVAR Voice Assessment** (Phase 19) is modeled after the standardized communication screenings used by major tech employers like TCS, Infosys, and Cognizant.\n\n"
            f"### 🎙️ **How It Works**:\n"
            f"1. **Section 1: Timed Quantitative & Logical MCQs**: Covers high-frequency campus placement PYQs (Percentages, Ratios, Number Series, and Chart Interpretation).\n"
            f"2. **Section 2: SVAR Sentence Repetition**: The platform plays a clear English audio prompt. You listen carefully and repeat it into your microphone. Our speech engine calculates your word accuracy, memory retention, and pronunciation clarity.\n"
            f"3. **Section 2: 45-Second Extempore Speech**: You get a real-world prompt (e.g. *'Describe a challenging software project you worked on'*). You speak for 30-45 seconds, and the AI evaluates your Words-Per-Minute (WPM), vocabulary diversity, and CEFR rating (A1 to C2).\n"
            f"4. **Audio Saved for Review**: Your spoken audio is securely recorded so college placement coordinators can inspect and replay it inside the Admin Dossier.\n\n"
            f"You can launch it anytime by clicking **'Aptitude & SVAR Voice Assessment'** under the Assessments pillar!"
        )
        actions = [
            "Give me a sample SVAR test sentence",
            "How to score C1/C2 in extempore speech?",
            "Review my communication assessment score",
        ]

    # --------------------------------------------------------------------------
    # 5. AI PLACEMENT PREDICTOR & ML / XGBOOST / SHAP
    # --------------------------------------------------------------------------
    elif any(
        k in q_lower
        for k in [
            "predictor",
            "prediction",
            "xgboost",
            "shap",
            "machine learning",
            "probability",
            "what if",
            "simulator",
            "tier 1",
            "tier 2",
        ]
    ):
        reply = (
            f"Great question! The **AI Placement Predictor** (Phase 5) is one of HireMatrix's core innovations.\n\n"
            f"### ⚡ **How the Machine Learning Engine Works**:\n"
            f"- **Supervised XGBoost Ensemble**: We trained an ensemble model on verified campus recruitment datasets to predict both your placement probability (0-100%) and your expected hiring tier (Tier 1 Product, Tier 2 Tech, or Mass Recruiter).\n"
            f"- **Weighted Feature Analysis**: It evaluates your academic CGPA ({cgpa}), active backlogs ({backlogs}), verified coding benchmark ({coding_score}/100), internship experience, and project depth.\n"
            f"- **TreeSHAP Explainability**: Unlike black-box algorithms, HireMatrix shows you exactly *why* your score is at **{readiness_pct}%**. You can see how much each positive factor (like high coding score) adds, and where you're losing points.\n"
            f"- **Interactive What-If Simulator**: You can move interactive sliders (e.g., *'What if my CGPA increases to 8.5?'* or *'What if I complete a 3-month internship?'*) and watch your probability update dynamically.\n\n"
            f"Would you like advice on how to raise your current readiness score into the 90%+ bracket?"
        )
        actions = [
            f"How can I boost my readiness from {readiness_pct}% to 90%+?",
            "What factors have highest weight in prediction?",
            "30-day DSA study roadmap",
        ]

    # --------------------------------------------------------------------------
    # 6. SKILL GAP ANALYZER & ROLES
    # --------------------------------------------------------------------------
    elif any(
        k in q_lower
        for k in [
            "skill gap",
            "skillgap",
            "missing skills",
            "skill void",
            "taxonomy",
            "target role",
            "sde",
            "devops",
            "data analyst",
            "roles",
        ]
    ):
        critical_str = (
            ", ".join(missing_critical[:3])
            if missing_critical
            else "System Architecture, Advanced SQL"
        )
        reply = (
            f"Here is how our **3-Tier Skill Gap Engine** (Phase 7) helps you target your preparation:\n\n"
            f"Instead of giving generic study advice, HireMatrix benchmarks your verified skill graph against the exact hiring requirements for **10+ tech roles** (SDE, Frontend, Backend, DevOps, Data Analyst, ML Engineer, Cloud Architect, QA, etc.).\n\n"
            f"### 🎯 **The 3 Tiers**:\n"
            f"1. **Tier 1 (Critical Skills)**: Hard technical prerequisites. Without these, resumes are filtered out automatically. For your target track ({target_role}), key gaps include: `{critical_str}`.\n"
            f"2. **Tier 2 (Important Skills)**: Technologies that set top 10% candidates apart during technical interviews (e.g. Docker, Redis, CI/CD pipelines).\n"
            f"3. **Tier 3 (Good-to-Have)**: Bonus proficiencies that help in offer negotiation (e.g. Kafka, Kubernetes, GraphQL).\n\n"
            f"Closing your Tier 1 Critical skills is the single highest-leverage action you can take to increase your placement probability."
        )
        actions = [
            f"Study plan for {missing_critical[0] if missing_critical else 'System Design'}",
            "Show my 8-week learning milestones",
            "Switch target role benchmark",
        ]

    # --------------------------------------------------------------------------
    # 7. RESUME PARSER & ATS AUDITOR (GOOGLE XYZ FORMULA)
    # --------------------------------------------------------------------------
    elif any(
        k in q_lower
        for k in ["resume", "ats", "format", "bullet", "cv", "parser", "spacy", "xyz"]
    ):
        reply = (
            f"Sure! Our **Resume Parser & ATS Auditor** (Phase 6) uses **spaCy NLP** to inspect candidate resumes against the exact criteria that corporate Applicant Tracking Systems (ATS) look for.\n\n"
            f"### 📄 **How to Guarantee a 90+ ATS Score**:\n"
            f"1. **Use Google's XYZ Formula**: Frame every project and experience bullet point as:\n"
            f"   > *Accomplished [X], as measured by [Y], by doing [Z].*\n"
            f"   * *Example*: 'Built async FastAPI endpoints handling 1,200 req/min, decreasing latency by 34% through Redis connection pooling.'\n"
            f"2. **Keyword Density**: Ensure keywords for your target role `{target_role}` appear naturally in your technical skills and project descriptions (e.g. `{', '.join(missing_critical[:2]) if missing_critical else 'FastAPI, Docker, PostgreSQL'}`).\n"
            f"3. **Clean Formatting**: Use standard headers (`Education`, `Experience`, `Projects`, `Technical Skills`), a clean single-column layout, and standard PDF/DOCX formats without multi-column tables.\n\n"
            f"Your current application ATS Score is **{ats_score}/100**. You can upload an updated resume anytime in the *Resume Parser & ATS* tab for a fresh audit!"
        )
        actions = [
            "Generate sample XYZ project bullet points",
            "Audit my resume again with spaCy NLP",
            "Show high-match campus jobs",
        ]

    # --------------------------------------------------------------------------
    # 8. 1-CLICK LINKEDIN REFERRAL PITCH GENERATOR
    # --------------------------------------------------------------------------
    elif any(
        k in q_lower
        for k in [
            "linkedin",
            "referral",
            "pitch",
            "outreach",
            "cold message",
            "cold email",
            "hiring manager",
            "alumni",
            "message generator",
        ]
    ):
        reply = (
            f"Reaching out for referrals on LinkedIn is one of the most effective ways to bypass crowded job portals! Our **1-Click LinkedIn Pitch Generator** (Phase 20) helps you craft customized, high-converting messages.\n\n"
            f"### 📨 **3 High-Impact Message Templates Available**:\n"
            f"1. **Alumni Warm Connection**: Connects respectfully over shared college roots, references a shared interest or project, and asks for 10 minutes of guidance.\n"
            f"2. **Direct Job Referral Request**: Includes the exact Job ID, highlights your matching tech stack, and links your verified GitHub/portfolio with zero fluff.\n"
            f"3. **Hiring Manager & Recruiter Pitch**: Summarizes your top metrics (CGPA, LeetCode problem count, full-stack deployed projects) in 3 concise bullet points.\n\n"
            f"You can find this tool under the **'Placements & Outreach'** pillar on the top navigation bar!"
        )
        actions = [
            "Generate sample LinkedIn referral message",
            "How to find hiring managers on LinkedIn?",
            "Show company prep cheat sheets",
        ]

    # --------------------------------------------------------------------------
    # 9. COMPANY PREP CHEAT SHEETS (GOOGLE, AMAZON, TCS, INFOSYS)
    # --------------------------------------------------------------------------
    elif any(
        k in q_lower
        for k in [
            "company prep",
            "cheat sheet",
            "company",
            "companies",
            "google",
            "amazon",
            "microsoft",
            "tcs",
            "infosys",
            "accenture",
            "goldman sachs",
            "wipro",
        ]
    ):
        reply = (
            f"I can certainly help you with that! In our **Company Prep Cheat Sheets** (Phase 18), we provide tactical interview guides for top campus recruiters:\n\n"
            f"### 🏢 **Interview Patterns by Company Type**:\n"
            f"- **Product Giants (Google, Microsoft, Amazon)**: Heavy focus on Data Structures (Trees, Dynamic Programming, Graphs) and Amazon's 14 Leadership Principles (evaluated via the STAR method).\n"
            f"- **FinTech & Investment Banks (Goldman Sachs, Morgan Stanley)**: Emphasize OOP fundamentals, multi-threading in Java/C++, and quantitative aptitude.\n"
            f"- **IT & Mass Recruiters (TCS Ninja/Digital, Infosys, Accenture)**: Filter candidates via Online Assessments with strict Quantitative Aptitude, SVAR Verbal English tests, and core coding questions.\n\n"
            f"You can open **'Company Prep Cheat Sheets'** in the Assessments pillar to see round breakdowns and common coding patterns for each company."
        )
        actions = [
            "TCS Digital interview pattern",
            "Amazon Leadership Principles with STAR method",
            "Google SDE interview preparation",
        ]

    # --------------------------------------------------------------------------
    # 10. UNIVERSITY ERP & CAMPUS DRIVES
    # --------------------------------------------------------------------------
    elif any(
        k in q_lower
        for k in [
            "erp",
            "campus drive",
            "drives",
            "tpo",
            "placement cell",
            "eligibility",
            "cutoff",
            "shortlist",
        ]
    ):
        reply = (
            f"The **University ERP & Campus Drives** module (Phase 17) connects students directly with their college Training & Placement Office (TPO):\n\n"
            f"### 🏛️ **What You Can Do**:\n"
            f"- **Track Active Drives**: View visiting companies, job roles, CTC packages (in LPA), application deadlines, and job descriptions.\n"
            f"- **Automated Eligibility Checks**: The system compares your CGPA ({cgpa}) and active backlogs ({backlogs}) against company requirements, giving you instant green/amber/red indicators.\n"
            f"- **TPO Management**: Placement coordinators can post drives, export student shortlists, and manage batch eligibility in one place.\n\n"
            f"You can check active drives anytime in the *Placements & Outreach* tab!"
        )
        actions = [
            f"Which companies accept {cgpa} CGPA with {backlogs} backlogs?",
            "How to register for campus drives?",
            "Review student profile",
        ]

    # --------------------------------------------------------------------------
    # 11. ADMIN DASHBOARD & GOVERNANCE
    # --------------------------------------------------------------------------
    elif any(
        k in q_lower
        for k in [
            "admin",
            "command center",
            "governance",
            "dossier",
            "teacher",
            "faculty",
            "admin login",
        ]
    ):
        reply = (
            f"The **Admin Command Center** (Phase 11 & 19) is designed for university administrators, placement officers, and faculty members.\n\n"
            f"### 🛡️ **Admin Capabilities**:\n"
            f"- **Cohort Performance Telemetry**: Real-time graphs showing student CGPA distribution, readiness tiers, and skill gaps across departments.\n"
            f"- **Student Directory**: Inspect individual student records, update placement status, and manage student accounts.\n"
            f"- **Campus Drive Management**: Post new drives, configure CGPA cutoffs, and monitor application queues.\n"
            f"- **Assessment Dossier & Audio Player**: Review candidate aptitude test scores, AI SVAR verbal grades, and **listen directly to the candidate's recorded audio files**.\n\n"
            f"Admin access requires logging in with authorized administrator credentials."
        )
        actions = [
            "How to log in as admin?",
            "Review institutional assessment telemetry",
            "What is HireMatrix AI?",
        ]

    # --------------------------------------------------------------------------
    # 12. ACCOUNT, LOGIN, REGISTER, FORGOT PASSWORD & SECURITY
    # --------------------------------------------------------------------------
    elif any(
        k in q_lower
        for k in [
            "login",
            "sign in",
            "register",
            "create account",
            "forgot password",
            "otp",
            "password",
            "reset password",
            "username",
        ]
    ):
        reply = (
            f"Here is how account management and authentication work on HireMatrix:\n\n"
            f"### 🔐 **Authentication Options**:\n"
            f"- **Sign In**: You can sign in using either your **Email Address** OR your **Username** with your password.\n"
            f"- **Create Account**: Register with your username, email, and password. If your email already exists, the system will notify you so you don't create duplicate accounts.\n"
            f"- **Forgot Password**: Click *'Forgot password?'* on the login modal. Enter your email, and a **6-digit verification OTP** will be dispatched to reset your password with re-entry confirmation.\n"
            f"- **Quick Preview (Demo Student)**: If you just want to explore the platform without creating an account, click **'Demo Student'** in the modal for instant candidate access!\n\n"
            f"Would you like me to open the Sign In modal for you?"
        )
        actions = [
            "Take me to Sign In / Register",
            "How does Demo Student login work?",
            "What features require authentication?",
        ]

    # --------------------------------------------------------------------------
    # 13. TECH STACK & SYSTEM ARCHITECTURE
    # --------------------------------------------------------------------------
    elif any(
        k in q_lower
        for k in [
            "tech stack",
            "technology",
            "technologies",
            "framework",
            "fastapi",
            "mongodb",
            "react",
            "tailwind",
            "architecture",
            "built with",
        ]
    ):
        reply = (
            f"HireMatrix is engineered using modern, high-performance cloud and AI technologies:\n\n"
            f"### 🛠️ **Full Technology Stack**:\n"
            f"- **Backend**: FastAPI 0.110+ (Python 3.14 async ASGI), Pydantic v2 validation.\n"
            f"- **Database**: MongoDB Motor (AsyncIO driver) with local JSON snapshot persistence fallback.\n"
            f"- **Machine Learning**: Supervised XGBoost ensemble model, Scikit-Learn pipelines, TreeSHAP explainability.\n"
            f"- **Natural Language Processing**: spaCy NLP, PyMuPDF, Sentence-BERT semantic similarity.\n"
            f"- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Recharts.\n"
            f"- **Authentication**: JWT (JSON Web Tokens) with Bcrypt password hashing & RBAC."
        )
        actions = [
            "How does the ML model predict placement readiness?",
            "Explore backend API health status",
            "Watch HireMatrix Tour",
        ]

    # --------------------------------------------------------------------------
    # 14. CREATOR & AUTHOR INFO
    # --------------------------------------------------------------------------
    elif any(
        k in q_lower
        for k in [
            "who made",
            "who built",
            "creator",
            "author",
            "developed by",
            "suzal",
            "owner",
        ]
    ):
        reply = (
            f"**HireMatrix AI** was engineered and designed by **Suzal Naudiyal** and the HireMatrix core team.\n\n"
            f"The goal of the project is to provide a complete, autonomous career operating system for computer science and engineering students, combining ML placement prediction with real-time AI voice testing and recruiter outreach."
        )
        actions = [
            "What is HireMatrix AI?",
            "Show all features on this webpage",
            "How to get started",
        ]

    # --------------------------------------------------------------------------
    # 15. READINESS & SCORE IMPROVEMENT
    # --------------------------------------------------------------------------
    elif any(
        k in q_lower
        for k in [
            "readiness",
            "score",
            "improve",
            "90%",
            "85%",
            "chance",
            "probability",
            "predict",
            "boost",
        ]
    ):
        critical_str = (
            ", ".join(missing_critical[:3])
            if missing_critical
            else "System Architecture, Advanced SQL"
        )
        name_clause = f", {first_name}," if first_name != "there" else ""
        reply = (
            f"To boost your placement readiness score{name_clause} into the top **90%+** bracket, here is the exact 3-step action plan based on your current metrics:\n\n"
            f"1. **Bridge Critical Skill Voids**: Your 3-tier gap analysis detected missing prerequisites in: `{critical_str}`. Dedicating 2 hours daily to these unlocks the highest SHAP feature attribution in our ML model.\n"
            f"2. **Calibrate Verified Coding**: Your coding benchmark currently stands at **{coding_score}/100**. Aim to solve 15 Medium DSA problems on LeetCode focusing on Dynamic Programming and Graphs.\n"
            f"3. **Deploy an End-to-End Capstone Project**: Recruiters and placement cells heavily reward deployed full-stack applications with Docker, CI/CD, and real databases over generic tutorials.\n\n"
            f"Would you like me to generate a tailored 14-day study sprint for `{missing_critical[0] if missing_critical else 'System Design'}`?"
        )
        actions = [
            f"Study plan for {missing_critical[0] if missing_critical else 'System Design'}",
            "How do backlogs impact my prediction?",
            "Review my 8-week learning milestones",
        ]

    # --------------------------------------------------------------------------
    # 16. BACKLOGS & HR INTERVIEW HANDLING
    # --------------------------------------------------------------------------
    elif any(
        k in q_lower
        for k in ["backlog", "kt", "arrear", "low cgpa", "explain backlog", "cgpa"]
    ):
        if backlogs > 0:
            reply = (
                f"Handling backlogs in campus interviews is all about ownership and narrative control. Here is a proven script you can adapt:\n\n"
                f"> *\"During my earlier semesters, I took on a steep learning curve balancing technical fundamentals with academics. While that led to a temporary setback in that subject, I took full ownership: I established a disciplined schedule, strengthened my core problem-solving, and cleared my preparation modules. My focus now is 100% on delivery.\"*\n\n"
                f"### 💡 **Key Rules for HR Rounds**:\n"
                f"- Never blame teachers or university circumstances.\n"
                f"- Pivot immediately to what you learned and your practical skills (projects, LeetCode rating, certifications).\n"
                f"- Target product startups and tech companies where skills take priority over strict 7.5+ CGPA cutoffs."
            )
        else:
            reply = (
                f"You have **0 active backlogs** with a solid CGPA of **{cgpa}**! That means you already qualify for over **92%** of visiting campus companies.\n\n"
                f"Your primary focus should now be excelling in the technical coding rounds and practicing your verbal communication in our SVAR Voice module."
            )
        actions = [
            "What companies accept CGPA between 7.0 and 8.0?",
            "Mock HR interview practice",
            "How to highlight practical projects",
        ]

    # --------------------------------------------------------------------------
    # 17. LEETCODE & DSA PREPARATION
    # --------------------------------------------------------------------------
    elif any(
        k in q_lower
        for k in [
            "leetcode",
            "dsa",
            "coding",
            "algorithm",
            "problem",
            "hackerrank",
            "data structures",
            "trees",
            "dp",
        ]
    ):
        reply = (
            f"Here is your targeted **Data Structures & Algorithms (DSA) Blueprint** for campus placements:\n\n"
            f"### 🏆 **High-Yield Placement Priority Order**:\n"
            f"1. **Arrays & Two Pointers** (Sliding Window, Prefix Sums) — *Appears in over 85% of online assessments (OAs)*.\n"
            f"2. **Hashing & HashMaps** (Subarray Sum equals K, Group Anagrams).\n"
            f"3. **Trees & Binary Search** (Level Order Traversal, Lowest Common Ancestor).\n"
            f"4. **Dynamic Programming Basics** (0/1 Knapsack, Longest Common Subsequence).\n\n"
            f"💡 *Pro-Tip*: Focus on **LeetCode Mediums**. Over 75% of campus technical interview questions are standard Medium patterns, not Hards. Consistency (2 problems/day) beats cramming."
        )
        actions = [
            "Give me 5 essential Tree interview questions",
            "How to structure GitHub repositories for recruiters",
            "Schedule a timed AI Mock Interview",
        ]

    # --------------------------------------------------------------------------
    # 18. OFF-TOPIC BOUNDARY CHECK
    # --------------------------------------------------------------------------
    elif any(
        k in q_lower
        for k in [
            "recipe",
            "cook",
            "movie",
            "cricket",
            "football",
            "song",
            "weather",
            "capital of",
            "joke",
            "politics",
            "crypto",
            "bitcoin",
            "president",
        ]
    ):
        reply = (
            f"I appreciate you asking! But as your **HireMatrix Support Assistant**, I specialize exclusively in the **HireMatrix AI platform** and campus placement preparation (such as SVAR voice tests, ML readiness scores, ATS resumes, and technical interviews). 😊\n\n"
            f"How can I help you with your placement preparation or our platform features today?"
        )
        actions = [
            "What is HireMatrix AI?",
            "How does the SVAR Voice test work?",
            "How to boost my readiness score past 90%?",
            "Show all features on this webpage",
        ]

    # --------------------------------------------------------------------------
    # 19. GENERAL HELPFUL CUSTOMER-CARE FALLBACK
    # --------------------------------------------------------------------------
    else:
        reply = (
            f"I'm here to help! As your **HireMatrix Support Assistant**, I can assist you with any part of our platform or your campus placement journey:\n\n"
            f"- **Platform Inquiries**: Ask how the **AI Placement Predictor**, **SVAR Voice tests**, **Resume ATS scanner**, or **ERP Drives** work.\n"
            f"- **Placement Advisory**: Get customized advice on boosting your readiness score, handling interview backlogs, or practicing LeetCode Mediums.\n"
            f"- **Referrals & Outreach**: Learn how to use our **1-Click LinkedIn Pitch Generator** to reach recruiters directly.\n\n"
            f"Could you tell me a bit more about what you're looking for, or choose from one of the quick options below?"
        )
        actions = [
            "What is HireMatrix AI?",
            "How does the SVAR Voice test work?",
            "How to improve my placement readiness?",
            "Show all features on this webpage",
        ]

    return {
        "reply": reply,
        "suggested_actions": actions,
        "context_used": {
            "name": name,
            "readiness_percentage": readiness_pct,
            "target_role": target_role,
        },
    }
