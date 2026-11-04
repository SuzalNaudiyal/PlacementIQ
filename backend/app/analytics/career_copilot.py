from typing import Dict, Any, List, Optional
import re


def generate_copilot_response(
    query: str,
    student_profile: Dict[str, Any],
    skill_gap_summary: Optional[Dict[str, Any]] = None,
    prediction_summary: Optional[Dict[str, Any]] = None,
    resume_summary: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """
    Advanced, context-aware HireMatrix Career Copilot response engine.
    Handles general inquiries about the HireMatrix platform, its 4 core pillars,
    SVAR voice tests, ML placement prediction, ATS resume auditing, company cheat sheets,
    as well as deeply personalized academic guidance (CGPA, backlogs, DSA, and LeetCode).
    """
    name = student_profile.get("name", "Candidate")
    first_name = name.split()[0] if name else "Candidate"
    cgpa = student_profile.get("cgpa", 7.5)
    backlogs = student_profile.get("backlogs", 0)
    branch = student_profile.get("education", {}).get("branch", "Computer Science")

    assessments = student_profile.get("assessments", {})
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
        missing_critical = skill_gap_summary.get("missing_critical", [])
        missing_important = skill_gap_summary.get("missing_important", [])

    # Coding Profiles (GitHub / LeetCode)
    coding_profiles = student_profile.get("coding_profiles", {})
    leetcode_stats = coding_profiles.get("leetcode_stats") or {}
    total_solved = leetcode_stats.get("total_solved", 0)

    # ATS score
    ats_score = resume_summary.get("ats_score", 82) if resume_summary else 82

    q = query.strip()
    q_lower = q.lower()

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
        ]
    ) or (("what is" in q_lower or "about" in q_lower) and "hirematrix" in q_lower)

    if is_about_hirematrix:
        reply = (
            f"**HireMatrix AI** is an **Autonomous Campus Placement & Career Intelligence Operating System** "
            f"built to help college students bridge the gap between classroom academics and high-paying tech placements (Tier-1, Tier-2, Product, and Service companies).\n\n"
            f"### 🚀 **What HireMatrix Does**:\n"
            f"1. **AI Placement Predictor & What-If Simulator**: Predicts your placement probability (0-100%) and tier using supervised XGBoost classification with TreeSHAP explainability.\n"
            f"2. **Aptitude & SVAR Voice Assessment (Phase 19)**: Tests Quantitative/Logical MCQs (PYQs from top companies) followed by SVAR spoken English (sentence repetition & extempore speech with AI pronunciation, fluency scoring, and audio playback).\n"
            f"3. **3-Tier Skill Gap Analyzer (Phase 7)**: Benchmarks your skills against 10+ standard tech roles (SDE, DevOps, Data Analyst, etc.) into *Critical*, *Important*, and *Good-to-Have* voids.\n"
            f"4. **Resume Parser & ATS Auditor (Phase 6)**: Evaluates resumes with spaCy NLP, scores compliance out of 100, and formats bullets using Google's XYZ formula.\n"
            f"5. **1-Click LinkedIn Pitch Generator (Phase 20)**: Generates high-converting referral requests and recruiter cold outreach pitches.\n"
            f"6. **Company Interview Cheat Sheets (Phase 18)**: Tactical prep blueprints for Google, Amazon, Microsoft, TCS, Infosys, and more.\n"
            f"7. **University ERP & Campus Drives (Phase 17)**: Centralized tracking of upcoming company drives, CGPA cutoffs, and eligibility shortlists.\n\n"
            f"Would you like me to walk you through any specific feature or evaluate your profile?"
        )
        actions = [
            "How does the AI Placement Predictor work?",
            "How do I take the SVAR Voice test?",
            "Show me all features on this webpage",
            "How to get started on HireMatrix",
        ]

    # --------------------------------------------------------------------------
    # 2. ALL FEATURES / TOOLS / WEBPAGE NAVIGATION
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
        ]
    ):
        reply = (
            f"**HireMatrix AI Platform Architecture — 4 Core Pillars**:\n\n"
            f"### 📊 **1. Intelligence & ML**\n"
            f"- **Overview & Telemetry**: Real-time system health, API latency, and unified placement stats.\n"
            f"- **Placement Predictor**: XGBoost machine learning model calculating your tier and probability with interactive sliders.\n"
            f"- **Student Profile & Skill Graph**: Academic data, verified LeetCode/GitHub stats, and skill matrices.\n"
            f"- **Skill Gap Analyzer**: 3-tier taxonomy identifying Critical, Important, and Good-to-have skill gaps.\n\n"
            f"### 🧠 **2. Assessments & Practice**\n"
            f"- **Aptitude & SVAR Voice**: Timed Quantitative/Logical MCQs + AI Spoken English speech assessment.\n"
            f"- **Live AI Mock Interviewer**: Voice-driven technical and behavioral interview simulation.\n"
            f"- **8-Week Roadmap**: Week-by-week learning schedule customized to your missing skills.\n"
            f"- **Company Cheat Sheets**: Round-by-round interview breakdowns for top tech employers.\n\n"
            f"### 💼 **3. Placements & Outreach**\n"
            f"- **University ERP & Drives**: Campus drive management, student eligibility checks, and deadlines.\n"
            f"- **Campus Jobs Matcher**: Semantic matching of student profiles to industry roles.\n"
            f"- **LinkedIn Pitch Generator**: 1-click tailored referral requests for alumni and recruiters.\n"
            f"- **Resume Parser & ATS Auditor**: NLP resume scoring and keyword extraction.\n\n"
            f"### 🛡️ **4. Admin & Governance**\n"
            f"- **Admin Command Center**: Roster management, drive creation, and student voice dossier review.\n"
            f"- **Product Tour**: Interactive tour of platform capabilities without login."
        )
        actions = [
            "Tell me about the SVAR Voice test",
            "How does the Resume ATS Auditor work?",
            "How to use LinkedIn Pitch Generator?",
            "Check my placement readiness score",
        ]

    # --------------------------------------------------------------------------
    # 3. HOW TO GET STARTED / HOW TO USE
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
            f"### 🎯 **Getting Started with HireMatrix AI (Step-by-Step)**:\n\n"
            f"1. **Sign In or Register**: Click **'Get Started (Sign In / Register)'** at the top right. You can register with your username, email, and password, or click **'Demo Student'** for instant preview.\n"
            f"2. **Complete Your Profile**: In **'Student Profile & Skill Graph'**, input your CGPA, branch, target role, and connect your GitHub/LeetCode usernames.\n"
            f"3. **Run AI Placement Predictor**: Navigate to **'AI Placement Predictor'** to see your ML-calculated probability (e.g. {readiness_pct}%) and use the What-If sliders to simulate improvements.\n"
            f"4. **Analyze Skill Voids**: Open **'3-Tier Skill Gap'** to see what technologies you are missing for {target_role}.\n"
            f"5. **Take the Aptitude & SVAR Voice Test**: Test your quantitative speed and practice spoken English sentence repetition & extempore speech.\n"
            f"6. **Audit Your Resume**: Upload your PDF/DOCX resume in **'Resume Parser & ATS'** for a compliance score out of 100.\n"
            f"7. **Reach Out for Referrals**: Use **'LinkedIn Referral Pitch Generator'** to draft high-converting messages for recruiters."
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
            f"### 🎙️ **Aptitude & SVAR Spoken English Voice Assessment (Phase 19)**:\n\n"
            f"HireMatrix includes an automated communication assessment modeled after enterprise screening standards (like Pearson Versant and SVAR tests used by TCS, Infosys, and Cognizant):\n\n"
            f"1. **Timed Quantitative & Logical MCQs**: Section 1 tests speed on company PYQ questions across Percentages, Ratios, Number Series, and Chart Interpretation.\n"
            f"2. **Sentence Repetition (Voice AI)**: Listen to a clear native English audio sentence, memorize it, and repeat it into your microphone. The AI evaluates word accuracy, memory retention, and pronunciation.\n"
            f"3. **45-Second Extempore Speech**: You receive an impromptu technical prompt (e.g. *'Describe a challenging software project you built'*). You speak for 30-45 seconds, and the AI measures Speaking Rate (WPM), Vocabulary Richness, and CEFR proficiency band (A1 through C2).\n"
            f"4. **Voice Recording Saved for Admin Audit**: Your spoken audio is recorded and encoded natively (MP4/WebM) so placement coordinators and admins can review your playback in the Admin Dossier.\n\n"
            f"Would you like to practice a sample SVAR sentence right now?"
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
            f"### ⚡ **AI Placement Predictor & What-If Simulator (Phase 5)**:\n\n"
            f"Our predictive engine uses a supervised **XGBoost ensemble classifier** trained on campus placement records to predict candidate readiness and recruitment tier:\n\n"
            f"- **Evaluated Factors**: Academic CGPA ({cgpa}), Active Backlogs ({backlogs}), Verified Coding Benchmark ({coding_score}/100), Internship Depth, Certifications, and Project Complexity.\n"
            f"- **Explainable AI (TreeSHAP)**: We don't just output a black-box percentage — SHAP feature attributions show *exactly* which factors are boosting your score (e.g. high CGPA) and which are hurting it (e.g. missing Docker or low LeetCode count).\n"
            f"- **Interactive What-If Simulation**: You can slide your CGPA from {cgpa} to 8.5 or add an internship to see your placement probability change in real time.\n\n"
            f"Your current estimated readiness is **{readiness_pct}%** for the **{target_role}** track."
        )
        actions = [
            f"How can I boost my readiness from {readiness_pct}% to 90%+?",
            "What factors have highest weight in prediction?",
            "30-day DSA study roadmap",
        ]

    # --------------------------------------------------------------------------
    # 6. SKILL GAP ANALYZER & 10+ ROLES
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
            f"### 🎯 **3-Tier Skill Gap & Role Benchmarking (Phase 7)**:\n\n"
            f"HireMatrix benchmarks your verified skill graph against standard hiring criteria across 10+ tech roles (Software Development Engineer, Frontend, Backend, DevOps, Data Analyst, ML Engineer, Cloud Architect, etc.):\n\n"
            f"1. **Tier 1 (Critical Skills)**: Hard prerequisites for passing technical rounds. Your gaps: `{critical_str}`.\n"
            f"2. **Tier 2 (Important Skills)**: Technologies that set top 10% candidates apart in interviews (e.g. Docker, Redis, CI/CD).\n"
            f"3. **Tier 3 (Good-to-Have)**: Bonus skills like Kubernetes, GraphQL, or Kafka.\n\n"
            f"Bridging Tier 1 Critical skills yields the fastest boost in both your ML readiness score and recruiter shortlisting rate."
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
            f"### 📄 **Resume Parser & ATS Auditor (Phase 6)**:\n\n"
            f"Your current application ATS Score is **{ats_score}/100**.\n\n"
            f"HireMatrix uses **spaCy NLP** and PyMuPDF to parse candidate resumes, extract tech entities, and check ATS compliance against industry standards:\n\n"
            f"**3 Proven Tweaks to Guarantee 90+ ATS Score**:\n"
            f"1. **The Google XYZ Formula**: Write bullet points as: *Accomplished [X] as measured by [Y], by doing [Z]*.\n"
            f"   * *Example*: 'Built async FastAPI endpoints handling 1,200 req/min, decreasing latency by 34% through Redis caching.'\n"
            f"2. **Role Keyword Density**: Ensure your Skills section explicitly mentions: `{', '.join(missing_critical[:2]) if missing_critical else 'FastAPI, Docker, PostgreSQL'}`.\n"
            f"3. **Format Hygiene**: Single-column layout, standard headers (`Education`, `Experience`, `Projects`, `Technical Skills`), zero tables/multi-columns, and clear text encoding."
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
            f"### 🚀 **1-Click LinkedIn Referral Pitch Generator (Phase 20)**:\n\n"
            f"Reaching out to alumni and hiring managers on LinkedIn is the fastest way to bypass automated ATS filters and secure direct interview loops.\n\n"
            f"**What the Pitch Generator Produces**:\n"
            f"1. **Alumni Warm Connection**: Respectful, concise messages connecting over shared university roots and showing genuine project interest.\n"
            f"2. **Direct Job Referral Request**: Concise pitch with Job ID, matching tech stack, and clear reason why you're a high-signal candidate.\n"
            f"3. **Recruiter / Engineering Manager Outreach**: Highlights your core metrics (CGPA, LeetCode rating, deployed full-stack capstone).\n\n"
            f"You can access this anytime under the **'Placements & Outreach'** pillar on the navigation bar."
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
            f"### 🏢 **Tier-1 Company Interview Intelligence (Phase 18)**:\n\n"
            f"HireMatrix provides curated, battle-tested interview dossiers for major campus recruiters:\n\n"
            f"- **Product Giants (Google, Microsoft, Amazon)**: Focus heavily on DSA (Binary Trees, DP, Graphs) and Amazon 14 Leadership Principles.\n"
            f"- **FinTech & High Frequency (Goldman Sachs, Morgan Stanley)**: Emphasize OOP concepts, Java/C++ memory models, and Quant Aptitude.\n"
            f"- **Mass & IT Leaders (TCS Ninja/Digital, Infosys, Accenture)**: Feature heavy online assessment screening (Aptitude, Verbal SVAR tests, and fundamental coding in Python/Java).\n\n"
            f"Check out **'Company Prep Cheat Sheets'** in the Assessments pillar to review specific round breakdowns and recurring questions."
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
            f"### 🏛️ **University ERP & Campus Drives (Phase 17)**:\n\n"
            f"The ERP module bridges students and college Training & Placement Offices (TPOs):\n\n"
            f"- **Live Drive Listings**: See visiting companies, salary packages (LPA), minimum CGPA cutoffs, and deadlines.\n"
            f"- **Automated Eligibility Check**: Instant green/amber/red indicators based on your CGPA ({cgpa}) and active backlogs ({backlogs}).\n"
            f"- **Batch Roster Import**: TPOs can import CSV rosters and manage candidate applications seamlessly."
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
            f"### 🛡️ **Admin Command Center & Governance (Phase 11 & 19)**:\n\n"
            f"The Admin Command Center is reserved for college administrators, placement officers, and faculty:\n\n"
            f"- **Cohort Analytics**: Real-time charts showing student CGPA distribution, placement readiness tiers, and skill gaps.\n"
            f"- **Student Directory**: Inspect individual student records, update placement status, or reset credentials.\n"
            f"- **Drive Management**: Post new recruitment drives, set CGPA cutoffs, and monitor applicant cohorts.\n"
            f"- **Assessment Dossier & Audio Review**: Review every candidate's aptitude score, SVAR verbal pronunciation, and play their live recorded audio files."
        )
        actions = [
            "How to log in as admin?",
            "What is the admin email and credentials?",
            "Review institutional assessment telemetry",
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
            f"### 🔐 **HireMatrix Access & Account Security**:\n\n"
            f"- **Sign In**: You can sign in using either your **Email Address** OR your **Username** with your secure password.\n"
            f"- **Create Account**: Register in seconds with a unique Username, Email, and Password. If an account already exists with that email, the system safely alerts you.\n"
            f"- **Forgot Password**: Click *'Forgot password?'* on the Sign In modal. Enter your email, and a **6-digit verification OTP** will be dispatched to reset your password with re-entry confirmation.\n"
            f"- **Quick Preview**: Want to explore without creating an account? Click **'Demo Student'** in the login modal to test full candidate features immediately."
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
            f"### 🛠️ **HireMatrix AI Technology Stack & Architecture**:\n\n"
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
            f"The platform was created to provide a complete, autonomous career operating system for computer science and engineering students, combining ML placement prediction with real-time AI voice testing and recruiter outreach."
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
        reply = (
            f"Hello **{first_name}**! Your current placement readiness stands at **{readiness_pct}%** for the **{target_role}** track.\n\n"
            f"Here is your personalized roadmap to boost your readiness past **90%+**:\n\n"
            f"1. **Bridge Critical Skill Voids**: Our 3-tier gap analysis detected gaps in: `{critical_str}`. Dedicating 2 hours daily to these unlocks the highest SHAP feature attribution.\n"
            f"2. **Calibrate Coding Assessment**: Your current verified coding benchmark is **{coding_score}/100**. Aim to solve 15 Medium DSA problems on LeetCode focusing on Dynamic Programming & Graphs.\n"
            f"3. **Deploy a Production-Tier Capstone**: Academic evaluators and recruiters prioritize end-to-end deployed projects with Docker and CI/CD over generic tutorials.\n\n"
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
                f"**Addressing Backlogs in Campus Interviews (Script for {first_name})**:\n\n"
                f"You currently have **{backlogs} active backlog(s)** with a CGPA of **{cgpa}**. Here is how you explain this confidently to HR without raising red flags:\n\n"
                f"> *\"During my earlier semesters, I took on a steep learning curve balancing technical fundamentals with academics. While that led to a temporary setback in that subject, I took ownership: I established a disciplined schedule, strengthened my core problem-solving, and have cleared my preparation modules. My focus now is 100% on delivery.\"*\n\n"
                f"**Strategic Actions**:\n"
                f"- Never blame faculty or external circumstances.\n"
                f"- Pivot immediately to what you learned and your practical skills (e.g., your projects and coding rating).\n"
                f"- Target Tier-2 product and high-growth startup drives where CGPA criteria are flexible (min 6.5–7.0)."
            )
        else:
            reply = (
                f"Great news, **{first_name}**! You have **0 active backlogs** with a solid CGPA of **{cgpa}**.\n\n"
                f"For campus recruitment drives, you meet the academic cutoff for over **92%** of visiting companies (including Tier 1 Product and Mass recruiters). Your primary focus should be excelling in technical coding rounds and mock interviews."
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
            f"**Targeted DSA Blueprint for {branch} Students**:\n\n"
            f"Currently you have **{total_solved} problems solved** on LeetCode with an assessment coding score of **{coding_score}/100**.\n\n"
            f"**High-Yield Campus Placement Priority Order**:\n"
            f"1. **Arrays & Two Pointers** (Sliding Window, Prefix Sums) — *Appears in 85% of OA rounds*\n"
            f"2. **Hashing & HashMaps** (Subarray Sum equals K, Group Anagrams)\n"
            f"3. **Trees & Binary Search** (Level Order Traversal, Lowest Common Ancestor)\n"
            f"4. **Dynamic Programming Basics** (0/1 Knapsack, Longest Common Subsequence)\n\n"
            f"💡 *Pro-Tip*: Focus on **LeetCode Mediums**. Over 75% of campus technical interview questions are standard Medium patterns, not Hards."
        )
        actions = [
            "Give me 5 essential Tree interview questions",
            "How to structure GitHub repositories for recruiters",
            "Schedule a timed AI Mock Interview",
        ]

    # --------------------------------------------------------------------------
    # 18. GENERAL SMART FALLBACK (HIGH-SIGNAL RESPONSE)
    # --------------------------------------------------------------------------
    else:
        critical_hint = (
            f"your missing skills in `{missing_critical[0]}`"
            if missing_critical
            else "optimizing your coding score"
        )
        reply = (
            f"Hello **{first_name}**! I am your **HireMatrix Career & Platform Copilot**, connected directly to our campus placement intelligence system.\n\n"
            f"### 💡 **How I Can Assist You**:\n"
            f"- **Platform Knowledge**: Ask me anything about HireMatrix features (*What is HireMatrix?*, *How to use the SVAR voice test?*, *How does the ML placement predictor work?*).\n"
            f"- **Placement Readiness**: Inquire about boosting your readiness past 90%, handling backlogs, or improving your coding scores.\n"
            f"- **Resume & Outreach**: Get ATS resume tips (Google XYZ format) and 1-click LinkedIn referral message templates.\n\n"
            f"**Your Profile Snapshot**: {cgpa} CGPA • {backlogs} backlogs • {readiness_pct}% ML Readiness ({target_role}).\n\n"
            f"What would you like to explore?"
        )
        actions = [
            "What is HireMatrix?",
            "How does the SVAR Voice test work?",
            f"How to improve readiness for {target_role}?",
            "Show ATS resume bullet formula",
        ]

    return {
        "reply": reply,
        "suggested_actions": actions,
        "context_used": {
            "name": name,
            "cgpa": cgpa,
            "backlogs": backlogs,
            "readiness_percentage": readiness_pct,
            "target_role": target_role,
        },
    }
