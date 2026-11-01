from typing import Dict, List

# Standardized Skill Taxonomy categorized for college placement readiness
SKILL_TAXONOMY: Dict[str, List[str]] = {
    "programming": [
        "Python",
        "Java",
        "C++",
        "JavaScript",
        "TypeScript",
        "C",
        "C#",
        "Go",
        "Kotlin",
        "Swift",
    ],
    "databases": [
        "SQL",
        "MongoDB",
        "PostgreSQL",
        "MySQL",
        "Redis",
        "Oracle",
        "SQLite",
    ],
    "frameworks": [
        "React",
        "Node.js",
        "FastAPI",
        "Django",
        "Express",
        "Spring Boot",
        "Flask",
        "Next.js",
        "Angular",
    ],
    "cloud": [
        "AWS",
        "Azure",
        "GCP",
        "Firebase",
        "Cloudflare",
    ],
    "data_ai": [
        "Machine Learning",
        "Deep Learning",
        "NLP",
        "Pandas",
        "NumPy",
        "Power BI",
        "Tableau",
        "Excel",
        "Scikit-learn",
        "TensorFlow",
        "PyTorch",
        "Computer Vision",
    ],
    "devops": [
        "Docker",
        "Git",
        "GitHub",
        "Kubernetes",
        "Linux",
        "CI/CD",
        "Jenkins",
    ],
    "soft_skills": [
        "Problem Solving",
        "Communication",
        "Team Collaboration",
        "Critical Thinking",
        "Time Management",
        "Leadership",
        "Adaptability",
    ],
}


def get_all_taxonomy_skills() -> List[str]:
    """Return flat list of all normalized taxonomy skills."""
    skills = []
    for cat_skills in SKILL_TAXONOMY.values():
        skills.extend(cat_skills)
    return sorted(list(set(skills)))
