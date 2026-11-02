"""
Resume Upload, NLP Extraction, and ATS Analysis Endpoints.
"""

from datetime import datetime, timezone
from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query, status
from pydantic import BaseModel

from backend.app.database import get_database
from backend.app.auth.deps import get_current_user
from backend.app.schemas.resume import ParsedResumeResponse, ATSAnalysis
from backend.app.nlp.extractor import extract_resume_text
from backend.app.nlp.parser import parse_resume_full
from backend.app.nlp.ats_scorer import score_resume_ats
from backend.app.models.student import calculate_profile_completeness

router = APIRouter(prefix="/resume", tags=["Resume Intelligence & ATS Scoring"])

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


class ParseTextRequest(BaseModel):
    text: str
    apply_to_profile: bool = False


@router.post("/upload", response_model=ParsedResumeResponse)
async def upload_and_parse_resume(
    file: UploadFile = File(...),
    apply_to_profile: bool = Query(default=False, description="Automatically merge extracted skills and education into profile"),
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Upload resume file (PDF, DOCX, or TXT).
    Extracts contact info, education, categorized skills, and calculates 0-100 ATS compatibility score.
    Optionally syncs extracted data directly into student profile.
    """
    filename = file.filename or "resume.pdf"
    content = await file.read()

    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File size exceeds maximum permitted limit (10MB).",
        )

    # 1. Extract text and page count
    extraction = extract_resume_text(filename, content)
    raw_text = extraction["text"]

    if len(raw_text.strip()) < 30:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Could not extract readable text from document. Ensure file is not scanned as an image.",
        )

    # 2. NLP Entity Extraction
    parsed = parse_resume_full(raw_text)

    # 3. ATS Scoring
    ats = score_resume_ats(
        text=raw_text,
        parsed_contact=parsed["contact"],
        parsed_education=parsed["education"],
        parsed_skills=parsed["skills"],
        sections=parsed["sections"],
        total_words=extraction["total_words"],
        page_count=extraction["page_count"],
    )

    db = get_database()
    user_id = str(current_user.get("id") or current_user.get("_id"))
    profile_updated = False

    # 4. Optional Sync to Student Profile in Database
    if apply_to_profile:
        existing_profile = await db.students.find_one({"user_id": user_id})
        if existing_profile:
            # Merge skills cleanly without duplicates
            cur_skills = existing_profile.get("skills", {})
            for cat, new_skills in parsed["skills"].items():
                existing_list = set(cur_skills.get(cat, []))
                existing_list.update(new_skills)
                cur_skills[cat] = sorted(list(existing_list))

            # Update education if detected
            cur_edu = existing_profile.get("education", {})
            if parsed["education"].get("degree"):
                cur_edu["degree"] = parsed["education"]["degree"]
            if parsed["education"].get("branch"):
                cur_edu["branch"] = parsed["education"]["branch"]
            if parsed["education"].get("graduation_year"):
                cur_edu["graduation_year"] = parsed["education"]["graduation_year"]

            # Merge projects
            cur_projects = existing_profile.get("projects", [])
            for p in parsed["projects_detected"]:
                if not any(cp.get("title") == p["title"] for cp in cur_projects):
                    cur_projects.append(p)

            # Update student record
            update_fields = {
                "skills": cur_skills,
                "education": cur_edu,
                "projects": cur_projects,
                "updated_at": datetime.now(timezone.utc),
            }
            if parsed["education"].get("cgpa") and existing_profile.get("cgpa", 0) <= 0:
                update_fields["cgpa"] = parsed["education"]["cgpa"]

            await db.students.update_one({"user_id": user_id}, {"$set": update_fields})
            profile_updated = True

    # 5. Persist resume audit in DB
    try:
        await db.resumes.insert_one({
            "user_id": user_id,
            "filename": filename,
            "file_type": extraction["file_type"],
            "total_words": extraction["total_words"],
            "page_count": extraction["page_count"],
            "ats_score": ats["total_score"],
            "parsed_contact": parsed["contact"],
            "parsed_education": parsed["education"],
            "parsed_skills": parsed["skills"],
            "created_at": datetime.now(timezone.utc),
        })
    except Exception:
        pass

    return ParsedResumeResponse(
        filename=filename,
        file_type=extraction["file_type"],
        total_words=extraction["total_words"],
        page_count=extraction["page_count"],
        contact=parsed["contact"],
        education=parsed["education"],
        skills=parsed["skills"],
        projects_detected=parsed["projects_detected"],
        experience_detected=parsed["experience_detected"],
        certifications_detected=parsed["certifications_detected"],
        ats_analysis=ATSAnalysis(**ats),
        profile_updated=profile_updated,
    )


@router.post("/parse-text", response_model=ParsedResumeResponse)
async def parse_raw_resume_text(
    payload: ParseTextRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Parse raw pasted resume text directly without requiring file upload.
    """
    raw_text = payload.text.strip()
    if len(raw_text) < 30:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Pasted resume text must be at least 30 characters long.",
        )

    words = raw_text.split()
    total_words = len(words)
    page_count = max(1, (total_words + 450) // 500)

    parsed = parse_resume_full(raw_text)
    ats = score_resume_ats(
        text=raw_text,
        parsed_contact=parsed["contact"],
        parsed_education=parsed["education"],
        parsed_skills=parsed["skills"],
        sections=parsed["sections"],
        total_words=total_words,
        page_count=page_count,
    )

    return ParsedResumeResponse(
        filename="pasted_resume.txt",
        file_type="text/plain",
        total_words=total_words,
        page_count=page_count,
        contact=parsed["contact"],
        education=parsed["education"],
        skills=parsed["skills"],
        projects_detected=parsed["projects_detected"],
        experience_detected=parsed["experience_detected"],
        certifications_detected=parsed["certifications_detected"],
        ats_analysis=ATSAnalysis(**ats),
        profile_updated=False,
    )


@router.get("/latest")
async def get_latest_parsed_resume(
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Fetch the most recent resume analysis record for the authenticated student.
    """
    db = get_database()
    user_id = str(current_user.get("id") or current_user.get("_id"))
    resume_doc = await db.resumes.find_one({"user_id": user_id}, sort=[("created_at", -1)])
    if not resume_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No uploaded resume found for this account. Upload a resume to see analysis.",
        )

    resume_doc["id"] = str(resume_doc["_id"])
    del resume_doc["_id"]
    return resume_doc
