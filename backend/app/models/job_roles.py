"""
Standard In-Demand Job Role Definitions and 3-Tier Skill Weightings.
Provides 10 industry job roles with Critical (50%), Important (35%), and Optional (15%) skill categorizations.
"""

from typing import Dict, Any, List

JOB_ROLES: Dict[str, Dict[str, Any]] = {
    "full-stack-developer": {
        "id": "full-stack-developer",
        "title": "Full Stack Developer (MERN / Python)",
        "category": "Software Engineering",
        "industry_demand": "Very High",
        "salary_range": "₹6.0 - 16.0 LPA",
        "description": "Designs and develops responsive frontends and resilient backend REST APIs, databases, and microservices.",
        "critical_skills": ["JavaScript", "React", "Node.js", "SQL", "Git"],
        "important_skills": ["TypeScript", "MongoDB", "Express", "REST APIs", "Docker", "PostgreSQL"],
        "optional_skills": ["Next.js", "Redis", "AWS", "CI/CD", "GraphQL", "Tailwind CSS"],
        "min_recommended_cgpa": 6.8,
        "base_prep_weeks": 6,
    },
    "frontend-engineer": {
        "id": "frontend-engineer",
        "title": "Frontend Engineer (React / TypeScript)",
        "category": "Frontend",
        "industry_demand": "Very High",
        "salary_range": "₹5.5 - 14.0 LPA",
        "description": "Crafts high-performance user interfaces, animations, web accessibility, and modern client state architectures.",
        "critical_skills": ["JavaScript", "TypeScript", "React", "HTML/CSS", "Git"],
        "important_skills": ["Next.js", "Tailwind CSS", "Redux", "REST APIs", "Web Performance", "Jest"],
        "optional_skills": ["Vue.js", "Angular", "GraphQL", "Figma", "CI/CD", "Micro-frontends"],
        "min_recommended_cgpa": 6.5,
        "base_prep_weeks": 5,
    },
    "backend-engineer": {
        "id": "backend-engineer",
        "title": "Backend Engineer (FastAPI / Go / Java)",
        "category": "Backend",
        "industry_demand": "Very High",
        "salary_range": "₹7.0 - 18.0 LPA",
        "description": "Engineers scalable server-side systems, concurrent processing, data persistence, and high-throughput APIs.",
        "critical_skills": ["Python", "Java", "SQL", "PostgreSQL", "REST APIs", "Git"],
        "important_skills": ["FastAPI", "Spring Boot", "Docker", "MongoDB", "Redis", "Data Structures"],
        "optional_skills": ["Go", "Kubernetes", "Kafka", "AWS", "Microservices", "System Design"],
        "min_recommended_cgpa": 7.0,
        "base_prep_weeks": 8,
    },
    "data-scientist": {
        "id": "data-scientist",
        "title": "Data Scientist / Machine Learning Engineer",
        "category": "AI & Data Science",
        "industry_demand": "Very High",
        "salary_range": "₹8.0 - 20.0 LPA",
        "description": "Trains predictive statistical models, neural networks, and deploys end-to-end ML pipelines.",
        "critical_skills": ["Python", "SQL", "Machine Learning", "Pandas", "NumPy", "Scikit-learn"],
        "important_skills": ["Deep Learning", "PyTorch", "TensorFlow", "NLP", "Data Visualization", "Git"],
        "optional_skills": ["Docker", "MLOps", "Computer Vision", "AWS", "HuggingFace", "FastAPI"],
        "min_recommended_cgpa": 7.2,
        "base_prep_weeks": 10,
    },
    "data-analyst": {
        "id": "data-analyst",
        "title": "Data Analyst (SQL / Power BI / Python)",
        "category": "Business Intelligence",
        "industry_demand": "High",
        "salary_range": "₹5.0 - 11.0 LPA",
        "description": "Extracts actionable enterprise insights from structured data, designs executive KPI dashboards, and informs product decisions.",
        "critical_skills": ["SQL", "Excel", "Power BI", "Data Visualization", "Problem Solving"],
        "important_skills": ["Python", "Pandas", "Tableau", "Statistics", "MySQL", "Communication"],
        "optional_skills": ["PostgreSQL", "NumPy", "R", "ETL", "Google Analytics", "A/B Testing"],
        "min_recommended_cgpa": 6.5,
        "base_prep_weeks": 4,
    },
    "devops-cloud-engineer": {
        "id": "devops-cloud-engineer",
        "title": "DevOps & Cloud Engineer (Docker / K8s / AWS)",
        "category": "Cloud & Infrastructure",
        "industry_demand": "High",
        "salary_range": "₹7.0 - 17.0 LPA",
        "description": "Automates continuous integration and delivery pipelines, cloud infrastructure provisioning, and container cluster reliability.",
        "critical_skills": ["Linux", "Docker", "Git", "CI/CD", "AWS", "Bash"],
        "important_skills": ["Kubernetes", "Python", "Terraform", "Jenkins", "Networking", "Monitoring"],
        "optional_skills": ["GCP", "Azure", "Ansible", "Prometheus", "Helm", "Go"],
        "min_recommended_cgpa": 6.8,
        "base_prep_weeks": 8,
    },
    "mobile-app-developer": {
        "id": "mobile-app-developer",
        "title": "Mobile App Developer (Flutter / React Native)",
        "category": "Mobile",
        "industry_demand": "Moderate to High",
        "salary_range": "₹5.5 - 13.0 LPA",
        "description": "Constructs cross-platform iOS and Android applications with native bridges, offline storage, and smooth animations.",
        "critical_skills": ["JavaScript", "React Native", "Flutter", "Git", "REST APIs"],
        "important_skills": ["TypeScript", "Dart", "Firebase", "State Management", "Mobile UI/UX"],
        "optional_skills": ["Kotlin", "Swift", "GraphQL", "SQLite", "App Store Deployment"],
        "min_recommended_cgpa": 6.5,
        "base_prep_weeks": 6,
    },
    "cybersecurity-analyst": {
        "id": "cybersecurity-analyst",
        "title": "Cybersecurity & Information Security Analyst",
        "category": "Security",
        "industry_demand": "High",
        "salary_range": "₹6.5 - 15.0 LPA",
        "description": "Identifies system vulnerabilities, audits penetration vectors, secures network perimeters, and enforces zero-trust protocols.",
        "critical_skills": ["Networking", "Linux", "Python", "Information Security", "Problem Solving"],
        "important_skills": ["Cryptography", "Wireshark", "Vulnerability Assessment", "Bash", "SQL"],
        "optional_skills": ["OWASP", "Metasploit", "Cloud Security", "SIEM", "Burp Suite", "Docker"],
        "min_recommended_cgpa": 7.0,
        "base_prep_weeks": 8,
    },
    "qa-automation-engineer": {
        "id": "qa-automation-engineer",
        "title": "QA & Test Automation Engineer (Selenium / Cypress)",
        "category": "Quality Engineering",
        "industry_demand": "Moderate",
        "salary_range": "₹4.5 - 10.5 LPA",
        "description": "Develops automated test frameworks, regression suites, load testing, and ensures software defect prevention.",
        "critical_skills": ["Java", "Python", "Selenium", "Git", "Manual Testing"],
        "important_skills": ["Cypress", "Postman", "API Testing", "SQL", "CI/CD", "Jira"],
        "optional_skills": ["JUnit", "TestNG", "Docker", "JMeter", "Performance Testing"],
        "min_recommended_cgpa": 6.2,
        "base_prep_weeks": 4,
    },
    "systems-sde": {
        "id": "systems-sde",
        "title": "Systems Software Engineer (C++ / OS / Networking)",
        "category": "Core Engineering",
        "industry_demand": "High",
        "salary_range": "₹8.5 - 22.0 LPA",
        "description": "Builds low-latency memory-managed software, device drivers, operating system kernels, and distributed storage engines.",
        "critical_skills": ["C++", "C", "Data Structures", "Linux", "Algorithms", "Git"],
        "important_skills": ["Operating Systems", "Computer Networks", "Multi-threading", "DBMS", "Memory Management"],
        "optional_skills": ["Rust", "Assembly", "GDB", "Kernel Programming", "Distributed Systems"],
        "min_recommended_cgpa": 7.5,
        "base_prep_weeks": 10,
    },
}


def get_all_roles() -> List[Dict[str, Any]]:
    """Return list of all configured job roles."""
    return list(JOB_ROLES.values())


def get_role_by_id(role_id: str) -> Dict[str, Any]:
    """Retrieve specific role by unique identifier."""
    return JOB_ROLES.get(role_id)
