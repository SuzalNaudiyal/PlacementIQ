"""
NLP Resume Parser and Entity Extractor.
Extracts contact details, education, technical skills (canonical taxonomy matching),
projects, work experience, and certifications.
"""

import re
from typing import Dict, Any, List, Optional
import spacy
from backend.app.models.skills_taxonomy import SKILL_TAXONOMY, get_all_taxonomy_skills

# Load spaCy English pipeline
try:
    nlp = spacy.load("en_core_web_sm")
except Exception:
    nlp = None

# Comprehensive skill aliases mapping to canonical taxonomy names
SKILL_ALIASES: Dict[str, str] = {
    # Programming
    "python": "Python",
    "py": "Python",
    "java": "Java",
    "c++": "C++",
    "cpp": "C++",
    "c#": "C#",
    "csharp": "C#",
    "c": "C",
    "golang": "Go",
    "go": "Go",
    "javascript": "JavaScript",
    "js": "JavaScript",
    "typescript": "TypeScript",
    "ts": "TypeScript",
    "kotlin": "Kotlin",
    "swift": "Swift",
    # Databases
    "sql": "SQL",
    "mysql": "MySQL",
    "postgres": "PostgreSQL",
    "postgresql": "PostgreSQL",
    "mongodb": "MongoDB",
    "mongo": "MongoDB",
    "redis": "Redis",
    "oracle": "Oracle",
    "sqlite": "SQLite",
    # Frameworks
    "react": "React",
    "react.js": "React",
    "reactjs": "React",
    "node.js": "Node.js",
    "nodejs": "Node.js",
    "node": "Node.js",
    "fastapi": "FastAPI",
    "fast api": "FastAPI",
    "django": "Django",
    "express": "Express",
    "express.js": "Express",
    "expressjs": "Express",
    "spring boot": "Spring Boot",
    "springboot": "Spring Boot",
    "flask": "Flask",
    "next.js": "Next.js",
    "nextjs": "Next.js",
    "angular": "Angular",
    "angularjs": "Angular",
    # Cloud & DevOps
    "aws": "AWS",
    "amazon web services": "AWS",
    "azure": "Azure",
    "gcp": "GCP",
    "google cloud": "GCP",
    "google cloud platform": "GCP",
    "firebase": "Firebase",
    "docker": "Docker",
    "kubernetes": "Kubernetes",
    "k8s": "Kubernetes",
    "git": "Git",
    "github": "GitHub",
    "linux": "Linux",
    "ci/cd": "CI/CD",
    "jenkins": "Jenkins",
    # Data & AI
    "machine learning": "Machine Learning",
    "ml": "Machine Learning",
    "deep learning": "Deep Learning",
    "nlp": "NLP",
    "natural language processing": "NLP",
    "pandas": "Pandas",
    "numpy": "NumPy",
    "power bi": "Power BI",
    "powerbi": "Power BI",
    "tableau": "Tableau",
    "excel": "Excel",
    "scikit-learn": "Scikit-learn",
    "scikitlearn": "Scikit-learn",
    "sklearn": "Scikit-learn",
    "tensorflow": "TensorFlow",
    "tf": "TensorFlow",
    "pytorch": "PyTorch",
    "computer vision": "Computer Vision",
    # Soft skills
    "problem solving": "Problem Solving",
    "communication": "Communication",
    "teamwork": "Team Collaboration",
    "team collaboration": "Team Collaboration",
    "leadership": "Leadership",
    "critical thinking": "Critical Thinking",
    "time management": "Time Management",
    "adaptability": "Adaptability",
}


def extract_contact_info(text: str) -> Dict[str, Optional[str]]:
    """Extract candidate name, email, phone number, and social links."""
    contact: Dict[str, Optional[str]] = {
        "name": None,
        "email": None,
        "phone": None,
        "linkedin": None,
        "github": None,
        "portfolio": None,
    }

    # 1. Email
    email_match = re.search(r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+', text)
    if email_match:
        contact["email"] = email_match.group(0).lower()

    # 2. Phone (Indian and International standard formats)
    phone_match = re.search(
        r'(?:(?:\+91|91|0)?[\s-]?)?[6789]\d{9}|\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b',
        text,
    )
    if phone_match:
        contact["phone"] = phone_match.group(0).strip()

    # 3. LinkedIn
    linkedin_match = re.search(r'(?:https?://)?(?:www\.)?linkedin\.com/in/([a-zA-Z0-9_-]+)', text, re.I)
    if linkedin_match:
        contact["linkedin"] = f"https://linkedin.com/in/{linkedin_match.group(1)}"

    # 4. GitHub
    github_match = re.search(r'(?:https?://)?(?:www\.)?github\.com/([a-zA-Z0-9_-]+)', text, re.I)
    if github_match:
        contact["github"] = f"https://github.com/{github_match.group(1)}"

    # 5. Candidate Name Extraction
    lines = [line.strip() for line in text.split("\n") if line.strip()]
    if lines:
        first_few_lines = lines[:4]
        for line in first_few_lines:
            # Skip lines with email, phone, or links
            if "@" in line or "http" in line or "github" in line or "linkedin" in line:
                continue
            words = line.split()
            # If 2 to 4 capitalized words, good candidate for person's name
            if 2 <= len(words) <= 4 and all(w[0].isupper() for w in words if w.isalpha()):
                contact["name"] = line
                break

        # Fallback to spaCy PERSON NER in top lines
        if not contact["name"] and nlp:
            header_text = "\n".join(first_few_lines)
            doc = nlp(header_text)
            for ent in doc.ents:
                if ent.label_ == "PERSON" and 2 <= len(ent.text.split()) <= 4:
                    contact["name"] = ent.text.strip()
                    break

        if not contact["name"] and lines:
            contact["name"] = lines[0]  # Fallback to absolute first line

    return contact


def extract_education(text: str) -> Dict[str, Any]:
    """Extract degree, branch, university, graduation year, and CGPA."""
    edu: Dict[str, Any] = {
        "degree": "B.Tech",
        "branch": "Computer Science",
        "university": "Campus Institute of Technology",
        "graduation_year": 2026,
        "cgpa": 7.5,
    }

    # Degree search
    degrees = [
        ("B.Tech", [r'\bB\.?\s*Tech\b', r'\bBachelor of Technology\b']),
        ("B.E.", [r'\bB\.?\s*E\.?\b', r'\bBachelor of Engineering\b']),
        ("BCA", [r'\bBCA\b', r'\bBachelor of Computer Applications\b']),
        ("MCA", [r'\bMCA\b', r'\bMaster of Computer Applications\b']),
        ("M.Tech", [r'\bM\.?\s*Tech\b', r'\bMaster of Technology\b']),
        ("B.Sc", [r'\bB\.?\s*Sc\b', r'\bBachelor of Science\b']),
    ]
    for deg_name, patterns in degrees:
        if any(re.search(pat, text, re.I) for pat in patterns):
            edu["degree"] = deg_name
            break

    # Branch search
    branches = [
        ("Computer Science & Engineering", [r'Computer Science', r'\bCSE\b', r'CS & Eng']),
        ("Information Technology", [r'Information Technology', r'\bIT\b']),
        ("Artificial Intelligence & Data Science", [r'Artificial Intelligence', r'AI & DS', r'Data Science']),
        ("Electronics & Communication", [r'Electronics', r'\bECE\b', r'Communication Eng']),
        ("Electrical & Electronics", [r'Electrical', r'\bEEE\b']),
        ("Mechanical Engineering", [r'Mechanical']),
        ("Civil Engineering", [r'Civil']),
    ]
    for br_name, patterns in branches:
        if any(re.search(pat, text, re.I) for pat in patterns):
            edu["branch"] = br_name
            break

    # Graduation Year (2018 - 2030)
    year_match = re.search(r'\b(20[12][0-9])\b', text)
    if year_match:
        edu["graduation_year"] = int(year_match.group(1))

    # CGPA search
    cgpa_match = re.search(r'(?:CGPA|GPA|Grade)[\s:=]*([0-9]\.[0-9]+)(?:\s*/\s*10)?', text, re.I)
    if not cgpa_match:
        cgpa_match = re.search(r'\b([5-9]\.[0-9]{1,2})\s*(?:/|\s+out of\s+)\s*10\b', text, re.I)
    if cgpa_match:
        try:
            val = float(cgpa_match.group(1))
            if 4.0 <= val <= 10.0:
                edu["cgpa"] = val
        except ValueError:
            pass

    return edu


def extract_skills(text: str) -> Dict[str, List[str]]:
    """
    Extract and categorize canonical skills by scanning text against normalized aliases.
    """
    found_skills: Dict[str, set] = {cat: set() for cat in SKILL_TAXONOMY.keys()}
    lower_text = text.lower()

    # Search for each alias as a word boundary
    for alias, canonical_name in SKILL_ALIASES.items():
        # Escape special chars like C++, C#
        escaped_alias = re.escape(alias)
        pattern = rf'(?:\b|(?<=[^a-zA-Z0-9])){escaped_alias}(?:\b|(?=[^a-zA-Z0-9]))'
        if re.search(pattern, lower_text):
            # Locate canonical category
            for cat, skill_list in SKILL_TAXONOMY.items():
                if canonical_name in skill_list:
                    found_skills[cat].add(canonical_name)
                    break

    # Convert sets to sorted lists
    return {cat: sorted(list(skills)) for cat, skills in found_skills.items()}


def extract_sections(text: str) -> Dict[str, str]:
    """Split resume into common logical sections for targeted extraction and scoring."""
    section_headers = [
        ("education", r'\b(?:EDUCATION|ACADEMICS|ACADEMIC BACKGROUND)\b'),
        ("skills", r'\b(?:SKILLS|TECHNICAL SKILLS|CORE COMPETENCIES|AREAS OF EXPERTISE)\b'),
        ("experience", r'\b(?:EXPERIENCE|WORK EXPERIENCE|PROFESSIONAL EXPERIENCE|INTERNSHIPS)\b'),
        ("projects", r'\b(?:PROJECTS|ACADEMIC PROJECTS|PERSONAL PROJECTS)\b'),
        ("certifications", r'\b(?:CERTIFICATIONS|LICENSES|COURSES|CREDENTIALS)\b'),
    ]

    sections: Dict[str, str] = {}
    lines = text.split("\n")
    current_sec = "header"
    collected = {current_sec: []}

    for line in lines:
        matched_sec = None
        for sec_name, pat in section_headers:
            if re.search(pat, line.strip(), re.I) and len(line.strip().split()) <= 4:
                matched_sec = sec_name
                break
        if matched_sec:
            current_sec = matched_sec
            if current_sec not in collected:
                collected[current_sec] = []
        else:
            collected[current_sec].append(line)

    for sec, lines_list in collected.items():
        sections[sec] = "\n".join(lines_list).strip()

    return sections


def extract_projects_and_experience(sections: Dict[str, str]) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]], List[str]]:
    """Parse projects, experience entries, and certifications from segmented sections."""
    projects: List[Dict[str, Any]] = []
    experience: List[Dict[str, Any]] = []
    certifications: List[str] = []

    # 1. Projects
    proj_text = sections.get("projects", "")
    if proj_text:
        # Split projects by non-bullet titles or blank lines
        blocks = [b.strip() for b in proj_text.split("\n\n") if b.strip()]
        for idx, block in enumerate(blocks[:4]):
            lines = [l.strip() for l in block.split("\n") if l.strip()]
            if lines:
                title = lines[0].lstrip("-•* ")
                desc = " ".join(lines[1:]) if len(lines) > 1 else "Developed software solution with modern frameworks."
                # Extract technologies mentioned in block
                techs = [s for s in get_all_taxonomy_skills() if re.search(rf'\b{re.escape(s)}\b', block, re.I)]
                projects.append({
                    "title": title[:80],
                    "description": desc[:500],
                    "technologies": techs[:6],
                })

    # 2. Experience / Internships
    exp_text = sections.get("experience", "")
    if exp_text:
        blocks = [b.strip() for b in exp_text.split("\n\n") if b.strip()]
        for block in blocks[:3]:
            lines = [l.strip() for l in block.split("\n") if l.strip()]
            if lines:
                headline = lines[0].lstrip("-•* ")
                experience.append({
                    "company": headline[:60],
                    "role": lines[1][:50] if len(lines) > 1 else "Intern / Trainee",
                    "duration_months": 3,
                    "description": " ".join(lines[1:])[:400],
                })

    # 3. Certifications
    cert_text = sections.get("certifications", "")
    if cert_text:
        lines = [l.strip().lstrip("-•* ") for l in cert_text.split("\n") if l.strip()]
        for l in lines[:5]:
            if len(l) > 4:
                certifications.append(l[:100])

    return projects, experience, certifications


def parse_resume_full(text: str) -> Dict[str, Any]:
    """Execute complete end-to-end NLP parsing pipeline on resume text."""
    sections = extract_sections(text)
    contact = extract_contact_info(text)
    education = extract_education(text)
    skills = extract_skills(text)
    projects, experience, certifications = extract_projects_and_experience(sections)

    return {
        "contact": contact,
        "education": education,
        "skills": skills,
        "projects_detected": projects,
        "experience_detected": experience,
        "certifications_detected": certifications,
        "sections": sections,
    }
