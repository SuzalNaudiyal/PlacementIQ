"""
University ERP & Roster Processing Engine.
Handles CSV validation, batch student profile synchronization, and placement drive eligibility auditing.
"""

import csv
import io
import re
from typing import List, Dict, Any, Tuple
from backend.app.schemas.erp import StudentRosterRecord


SAMPLE_CSV_CONTENT = """roll_number,name,email,branch,batch_year,cgpa,backlogs,attendance_percentage,coding_score,internships_count,projects_count,certifications_count,soft_skills_rating,preferred_roles
2022CS101,Aarav Patel,aarav.patel@apex.edu,Computer Science,2026,8.85,0,92.0,85.0,2,3,2,8.5,full-stack-developer
2022CS102,Diya Sengupta,diya.sengupta@apex.edu,Computer Science,2026,9.15,0,94.5,90.0,2,4,3,9.0,data-scientist
2022IT103,Rohan Verma,rohan.verma@apex.edu,Information Technology,2026,7.40,0,84.0,72.0,1,2,1,7.5,backend-engineer
2022EC104,Pooja Nair,pooja.nair@apex.edu,Electronics,2026,6.90,1,79.0,65.0,0,1,1,6.8,frontend-engineer
2022CS105,Vikram Malhotra,vikram.malhotra@apex.edu,Computer Science,2026,8.20,0,88.0,82.0,1,3,2,8.0,full-stack-developer
"""


def get_sample_csv_template() -> str:
    """Returns downloadable sample CSV roster content."""
    return SAMPLE_CSV_CONTENT.strip()


def parse_roster_csv_content(csv_text: str) -> Tuple[List[Dict[str, Any]], List[str]]:
    """
    Parses CSV text into validated student dictionary records.
    Returns (valid_records, error_messages).
    """
    valid_records: List[Dict[str, Any]] = []
    errors: List[str] = []

    f = io.StringIO(csv_text.strip())
    reader = csv.DictReader(f)

    if not reader.fieldnames:
        return [], ["Uploaded CSV is empty or missing header columns."]

    # Normalize headers
    headers = {h.strip().lower(): h for h in reader.fieldnames if h}

    required_keys = ["roll_number", "name", "email", "cgpa"]
    for req in required_keys:
        if req not in headers:
            return [], [f"Missing mandatory CSV header column: '{req}'."]

    for row_idx, row in enumerate(reader, start=2):
        try:
            # Clean keys
            clean_row = {k.strip().lower(): (v or "").strip() for k, v in row.items() if k}

            roll = clean_row.get("roll_number", "")
            name = clean_row.get("name", "")
            email = clean_row.get("email", "").lower()

            if not roll or not name or not email:
                errors.append(f"Row {row_idx}: Missing required roll_number, name, or email.")
                continue

            if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
                errors.append(f"Row {row_idx}: Invalid email format '{email}'.")
                continue

            # Parse numeric fields safely
            try:
                cgpa = float(clean_row.get("cgpa", 0.0))
                if not (0.0 <= cgpa <= 10.0):
                    errors.append(f"Row {row_idx}: CGPA must be between 0.0 and 10.0 (got {cgpa}).")
                    continue
            except ValueError:
                errors.append(f"Row {row_idx}: Invalid numeric CGPA value '{clean_row.get('cgpa')}'.")
                continue

            backlogs = int(clean_row.get("backlogs", 0) or 0)
            batch_year = int(clean_row.get("batch_year", 2026) or 2026)
            attendance = float(clean_row.get("attendance_percentage", 85.0) or 85.0)
            coding_score = float(clean_row.get("coding_score", 70.0) or 70.0)
            internships = int(clean_row.get("internships_count", 0) or 0)
            projects = int(clean_row.get("projects_count", 1) or 1)
            certifications = int(clean_row.get("certifications_count", 0) or 0)
            soft_skills = float(clean_row.get("soft_skills_rating", 7.0) or 7.0)

            branch = clean_row.get("branch", "Computer Science")
            preferred_raw = clean_row.get("preferred_roles", "full-stack-developer")
            preferred_roles = [r.strip() for r in preferred_raw.split(";") if r.strip()] or ["full-stack-developer"]

            record = {
                "roll_number": roll,
                "name": name,
                "email": email,
                "branch": branch,
                "batch_year": batch_year,
                "cgpa": cgpa,
                "backlogs": max(backlogs, 0),
                "attendance_percentage": min(max(attendance, 0.0), 100.0),
                "coding_score": min(max(coding_score, 0.0), 100.0),
                "internships_count": max(internships, 0),
                "projects_count": max(projects, 0),
                "certifications_count": max(certifications, 0),
                "soft_skills_rating": min(max(soft_skills, 1.0), 10.0),
                "preferred_roles": preferred_roles,
            }
            valid_records.append(record)
        except Exception as e:
            errors.append(f"Row {row_idx}: Unexpected parse error - {str(e)}")

    return valid_records, errors


def check_student_drive_eligibility(
    student: Dict[str, Any],
    drive: Dict[str, Any],
) -> Tuple[bool, List[str]]:
    """
    Evaluates whether a student meets all cutoffs for a placement drive.
    Returns (is_eligible, reasons).
    """
    reasons: List[str] = []
    is_eligible = True

    student_cgpa = float(student.get("cgpa", 0.0))
    min_cgpa = float(drive.get("min_cgpa", 0.0))
    if student_cgpa < min_cgpa:
        is_eligible = False
        reasons.append(f"CGPA ({student_cgpa:.2f}) is below minimum cutoff of {min_cgpa:.2f}.")

    student_backlogs = int(student.get("backlogs", 0))
    max_backlogs = int(drive.get("max_backlogs", 0))
    if student_backlogs > max_backlogs:
        is_eligible = False
        reasons.append(f"Active backlogs ({student_backlogs}) exceeds maximum allowed ({max_backlogs}).")

    student_branch = (student.get("branch") or "").strip().lower()
    eligible_branches = [b.strip().lower() for b in drive.get("eligible_branches", [])]
    if eligible_branches and not any(eb in student_branch or student_branch in eb for eb in eligible_branches):
        is_eligible = False
        reasons.append(f"Branch '{student.get('branch')}' is not in eligible disciplines.")

    student_coding = float(student.get("coding_score", 0.0))
    min_coding = float(drive.get("min_coding_score", 0.0))
    if min_coding > 0 and student_coding < min_coding:
        is_eligible = False
        reasons.append(f"Coding test score ({student_coding:.1f}) is below minimum cutoff of {min_coding:.1f}.")

    if is_eligible:
        reasons.append("Meets all academic CGPA, discipline, and backlog eligibility criteria.")

    return is_eligible, reasons
