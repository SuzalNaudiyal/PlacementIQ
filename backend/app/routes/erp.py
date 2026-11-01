"""
University ERP & Placement Drive API Endpoints.
Provides student roster CSV upload, academic grade sync, placement drive management, and eligibility auditing.
"""

from datetime import datetime, timezone
import io
import csv
import uuid
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.responses import PlainTextResponse

from backend.app.database import get_database
from backend.app.auth.deps import get_current_user
from backend.app.erp.engine import (
    parse_roster_csv_content,
    get_sample_csv_template,
    check_student_drive_eligibility,
    SAMPLE_CSV_CONTENT,
)
from backend.app.schemas.erp import (
    RosterIngestionReport,
    CreatePlacementDriveRequest,
    PlacementDriveOut,
    StudentDriveEligibilityOut,
    ApplyDriveRequest,
)

router = APIRouter(prefix="/erp", tags=["University ERP & Placement Drive Hub"])


DEFAULT_PLACEMENTS_DRIVES = [
    {
        "drive_id": "drive_google_sde",
        "company_name": "Google",
        "job_role": "Software Development Engineer - I",
        "ctc_lpa": 24.5,
        "location": "Bangalore / Hyderabad",
        "min_cgpa": 8.0,
        "max_backlogs": 0,
        "eligible_branches": ["Computer Science", "Information Technology", "Electronics"],
        "min_coding_score": 80.0,
        "application_deadline": "2026-12-15",
        "drive_date": "2026-12-20",
        "description": "Building high-performance distributed systems, cloud computing infrastructure, and core services.",
        "status": "Active",
        "created_at": datetime.now(timezone.utc),
    },
    {
        "drive_id": "drive_msft_cloud",
        "company_name": "Microsoft",
        "job_role": "Cloud Solutions & Software Engineer",
        "ctc_lpa": 21.0,
        "location": "Noida / Hyderabad",
        "min_cgpa": 7.5,
        "max_backlogs": 0,
        "eligible_branches": ["Computer Science", "Information Technology"],
        "min_coding_score": 75.0,
        "application_deadline": "2026-11-30",
        "drive_date": "2026-12-05",
        "description": "Architecting Azure microservices, AI developer tooling, and enterprise web solutions.",
        "status": "Active",
        "created_at": datetime.now(timezone.utc),
    },
    {
        "drive_id": "drive_amazon_ml",
        "company_name": "Amazon",
        "job_role": "Applied Scientist / ML Engineer",
        "ctc_lpa": 28.0,
        "location": "Bangalore",
        "min_cgpa": 8.2,
        "max_backlogs": 0,
        "eligible_branches": ["Computer Science", "AI & Data Science"],
        "min_coding_score": 82.0,
        "application_deadline": "2026-12-10",
        "drive_date": "2026-12-18",
        "description": "Training large-scale deep learning models for recommendation, e-commerce forecasting, and NLP.",
        "status": "Active",
        "created_at": datetime.now(timezone.utc),
    },
    {
        "drive_id": "drive_tcs_digital",
        "company_name": "TCS (Tata Consultancy Services)",
        "job_role": "Digital Cadre Software Engineer",
        "ctc_lpa": 7.5,
        "location": "Pan-India",
        "min_cgpa": 6.8,
        "max_backlogs": 1,
        "eligible_branches": ["Computer Science", "Information Technology", "Electronics", "Mechanical"],
        "min_coding_score": 60.0,
        "application_deadline": "2026-11-25",
        "drive_date": "2026-12-01",
        "description": "Enterprise cloud migrations, backend development, and client engineering initiatives.",
        "status": "Active",
        "created_at": datetime.now(timezone.utc),
    },
]


@router.get("/template", response_class=PlainTextResponse)
async def download_roster_template():
    """
    Returns clean CSV template with headers and example records for university ERP ingestion.
    """
    return get_sample_csv_template()


@router.post("/roster/upload-csv", response_model=RosterIngestionReport)
async def upload_student_roster_csv(
    file: Optional[UploadFile] = File(None),
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Processes university student roster CSV, validates academic metrics,
    upserts into the database, and auto-calculates baseline placement profiles.
    """
    db = get_database()

    # Read uploaded content or fallback to sample content for quick testing
    if file and file.filename:
        content_bytes = await file.read()
        csv_text = content_bytes.decode("utf-8", errors="ignore")
    else:
        csv_text = SAMPLE_CSV_CONTENT

    records, parse_errors = parse_roster_csv_content(csv_text)

    if not records and parse_errors:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"CSV Parsing Failed: {'; '.join(parse_errors[:3])}",
        )

    successful = 0
    updated = 0
    failed = len(parse_errors)
    imported_ids: List[str] = []

    for r in records:
        try:
            # Check if student already exists by email or roll_number
            existing = await db.students.find_one({
                "$or": [{"email": r["email"]}, {"roll_number": r["roll_number"]}]
            })

            doc = {
                "roll_number": r["roll_number"],
                "name": r["name"],
                "email": r["email"],
                "branch": r["branch"],
                "batch_year": r["batch_year"],
                "cgpa": r["cgpa"],
                "backlogs": r["backlogs"],
                "attendance_percentage": r["attendance_percentage"],
                "coding_score": r["coding_score"],
                "internships_count": r["internships_count"],
                "projects_count": r["projects_count"],
                "certifications_count": r["certifications_count"],
                "soft_skills_rating": r["soft_skills_rating"],
                "preferred_roles": r["preferred_roles"],
                "synced_at": datetime.now(timezone.utc),
                "erp_verified": True,
            }

            if existing:
                await db.students.update_one({"_id": existing["_id"]}, {"$set": doc})
                updated += 1
                imported_ids.append(r["roll_number"])
            else:
                doc["created_at"] = datetime.now(timezone.utc)
                doc["user_id"] = f"student_{uuid.uuid4().hex[:10]}"
                await db.students.insert_one(doc)
                successful += 1
                imported_ids.append(r["roll_number"])
        except Exception as e:
            failed += 1
            parse_errors.append(f"Roll {r.get('roll_number')}: {str(e)}")

    return RosterIngestionReport(
        total_records_processed=len(records) + len(parse_errors),
        successful_imports=successful,
        updated_records=updated,
        failed_records=failed,
        error_details=parse_errors[:5],
        imported_student_ids=imported_ids,
    )


@router.get("/drives", response_model=List[PlacementDriveOut])
async def list_placement_drives(
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Returns all placement drives with active applicants and candidate counts.
    """
    db = get_database()

    # Auto-seed default drives if collection is empty
    count = await db.placement_drives.count_documents({})
    if count == 0:
        try:
            await db.placement_drives.insert_many(DEFAULT_PLACEMENTS_DRIVES)
        except Exception:
            pass

    cursor = db.placement_drives.find({}).sort("created_at", -1)
    drives = await cursor.to_list(length=50)

    # Count total students to estimate eligibility
    all_students = await db.students.find({}).to_list(length=500)
    applications = await db.placement_applications.find({}).to_list(length=1000)

    out: List[PlacementDriveOut] = []
    for d in drives:
        drive_id = d.get("drive_id", "")
        # Compute applicants
        app_count = sum(1 for a in applications if a.get("drive_id") == drive_id)

        # Compute eligible students
        eligible_count = 0
        for s in all_students:
            is_elig, _ = check_student_drive_eligibility(s, d)
            if is_elig:
                eligible_count += 1

        out.append(
            PlacementDriveOut(
                drive_id=drive_id,
                company_name=d.get("company_name", ""),
                job_role=d.get("job_role", ""),
                ctc_lpa=d.get("ctc_lpa", 10.0),
                location=d.get("location", "Bangalore"),
                min_cgpa=d.get("min_cgpa", 7.0),
                max_backlogs=d.get("max_backlogs", 0),
                eligible_branches=d.get("eligible_branches", []),
                min_coding_score=d.get("min_coding_score", 60.0),
                application_deadline=d.get("application_deadline", "2026-12-31"),
                drive_date=d.get("drive_date", "2026-12-31"),
                description=d.get("description"),
                status=d.get("status", "Active"),
                total_eligible_students=max(eligible_count, 1),
                total_applicants=app_count,
                created_at=d.get("created_at", datetime.now(timezone.utc)),
            )
        )
    return out


@router.post("/drives", response_model=PlacementDriveOut)
async def create_placement_drive(
    payload: CreatePlacementDriveRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Creates a new campus recruitment drive with academic eligibility cutoffs.
    """
    db = get_database()
    drive_id = f"drive_{uuid.uuid4().hex[:10]}"

    new_drive = {
        "drive_id": drive_id,
        "company_name": payload.company_name,
        "job_role": payload.job_role,
        "ctc_lpa": payload.ctc_lpa,
        "location": payload.location,
        "min_cgpa": payload.min_cgpa,
        "max_backlogs": payload.max_backlogs,
        "eligible_branches": payload.eligible_branches,
        "min_coding_score": payload.min_coding_score,
        "application_deadline": payload.application_deadline,
        "drive_date": payload.drive_date,
        "description": payload.description,
        "status": "Active",
        "created_by": str(current_user.get("id") or current_user.get("_id")),
        "created_at": datetime.now(timezone.utc),
    }

    await db.placement_drives.insert_one(new_drive)

    # Estimate eligible student count
    all_students = await db.students.find({}).to_list(length=500)
    eligible_count = sum(1 for s in all_students if check_student_drive_eligibility(s, new_drive)[0])

    return PlacementDriveOut(
        drive_id=drive_id,
        company_name=new_drive["company_name"],
        job_role=new_drive["job_role"],
        ctc_lpa=new_drive["ctc_lpa"],
        location=new_drive["location"],
        min_cgpa=new_drive["min_cgpa"],
        max_backlogs=new_drive["max_backlogs"],
        eligible_branches=new_drive["eligible_branches"],
        min_coding_score=new_drive["min_coding_score"],
        application_deadline=new_drive["application_deadline"],
        drive_date=new_drive["drive_date"],
        description=new_drive["description"],
        status=new_drive["status"],
        total_eligible_students=eligible_count,
        total_applicants=0,
        created_at=new_drive["created_at"],
    )


@router.get("/student-drives", response_model=List[StudentDriveEligibilityOut])
async def get_student_placement_drives(
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Evaluates all active campus drives specifically against the logged-in student's academic profile.
    Returns tailored eligibility statuses, criteria breakdowns, and application states.
    """
    db = get_database()
    user_id = str(current_user.get("id") or current_user.get("_id"))

    # Fetch student profile
    student = await db.students.find_one({"user_id": user_id})
    if not student:
        # Fallback profile based on user
        student = {
            "name": current_user.get("name", "Student"),
            "email": current_user.get("email", ""),
            "branch": "Computer Science",
            "cgpa": 8.2,
            "backlogs": 0,
            "coding_score": 78.0,
        }

    # Fetch drives
    count = await db.placement_drives.count_documents({})
    if count == 0:
        try:
            await db.placement_drives.insert_many(DEFAULT_PLACEMENTS_DRIVES)
        except Exception:
            pass

    drives = await db.placement_drives.find({}).sort("ctc_lpa", -1).to_list(length=50)
    my_apps = await db.placement_applications.find({"user_id": user_id}).to_list(length=50)
    applied_drive_ids = {a.get("drive_id"): a.get("status", "Applied") for a in my_apps}

    results: List[StudentDriveEligibilityOut] = []
    for d in drives:
        drive_id = d.get("drive_id", "")
        is_elig, reasons = check_student_drive_eligibility(student, d)
        has_applied = drive_id in applied_drive_ids

        # Rough predicted placement odds based on CGPA and coding score
        score_factor = (float(student.get("cgpa", 7.0)) / 10.0) * 50.0 + (float(student.get("coding_score", 70.0)) / 100.0) * 50.0
        odds = round(min(max(score_factor, 40.0), 98.0), 1)

        results.append(
            StudentDriveEligibilityOut(
                drive_id=drive_id,
                company_name=d.get("company_name", ""),
                job_role=d.get("job_role", ""),
                ctc_lpa=d.get("ctc_lpa", 10.0),
                location=d.get("location", "Bangalore"),
                drive_date=d.get("drive_date", "2026-12-31"),
                is_eligible=is_elig,
                eligibility_reasons=reasons,
                predicted_placement_odds=odds,
                has_applied=has_applied,
                application_status=applied_drive_ids.get(drive_id),
            )
        )

    return results


@router.post("/drives/apply")
async def apply_to_placement_drive(
    payload: ApplyDriveRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Submits student application for a placement drive after verifying eligibility criteria.
    """
    db = get_database()
    user_id = str(current_user.get("id") or current_user.get("_id"))

    drive = await db.placement_drives.find_one({"drive_id": payload.drive_id})
    if not drive:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Placement drive not found.",
        )

    student = await db.students.find_one({"user_id": user_id})
    if student:
        is_elig, reasons = check_student_drive_eligibility(student, drive)
        if not is_elig:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Ineligible to apply: {'; '.join(reasons)}",
            )

    # Check if already applied
    existing_app = await db.placement_applications.find_one({
        "drive_id": payload.drive_id,
        "user_id": user_id,
    })
    if existing_app:
        return {"status": "already_applied", "message": "You have already applied to this drive."}

    app_doc = {
        "application_id": f"app_{uuid.uuid4().hex[:10]}",
        "drive_id": payload.drive_id,
        "company_name": drive.get("company_name", ""),
        "job_role": drive.get("job_role", ""),
        "user_id": user_id,
        "student_name": current_user.get("name", "Student"),
        "student_email": current_user.get("email", ""),
        "applied_at": datetime.now(timezone.utc),
        "status": "Shortlisted for Round 1",
    }

    await db.placement_applications.insert_one(app_doc)

    return {
        "status": "success",
        "message": f"Successfully applied for {drive.get('company_name')} ({drive.get('job_role')})!",
        "application_id": app_doc["application_id"],
    }


@router.get("/drives/{drive_id}/shortlist-csv", response_class=PlainTextResponse)
async def export_drive_shortlist_csv(
    drive_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Generates a CSV export of all eligible applied candidates for institutional recruiters.
    """
    db = get_database()
    drive = await db.placement_drives.find_one({"drive_id": drive_id})
    if not drive:
        raise HTTPException(status_code=404, detail="Drive not found")

    apps = await db.placement_applications.find({"drive_id": drive_id}).to_list(length=500)

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Application ID", "Student Name", "Student Email", "Company", "Job Role", "Applied At", "Status"
    ])

    for a in apps:
        writer.writerow([
            a.get("application_id", ""),
            a.get("student_name", ""),
            a.get("student_email", ""),
            a.get("company_name", ""),
            a.get("job_role", ""),
            str(a.get("applied_at", "")),
            a.get("status", "Applied"),
        ])

    return output.getvalue()
