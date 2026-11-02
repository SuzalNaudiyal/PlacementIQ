"""
Placement Prediction and Explainability API Endpoints.
Provides candidate evaluation, interactive What-If simulation, and ML model telemetry.
"""

from datetime import datetime, timezone
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status

from backend.app.database import get_database
from backend.app.auth.deps import get_current_user
from backend.app.models.student import get_or_create_student
from backend.app.schemas.prediction import (
    PredictionResponse,
    SimulationRequest,
    SimulationResponse,
    ModelInfoResponse,
)
from ml.inference.predictor import get_predictor

router = APIRouter(prefix="/prediction", tags=["Placement Prediction & Explainability"])


@router.get("/evaluate", response_model=PredictionResponse)
async def evaluate_current_student(
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Run placement likelihood prediction and SHAP factor attribution
    on the authenticated student's current profile.
    """
    db = get_database()
    user_id = str(current_user.get("id") or current_user.get("_id"))
    student = await get_or_create_student(db, current_user)

    predictor = get_predictor()
    eval_result = predictor.predict(student)
    eval_time = datetime.now(timezone.utc).isoformat()
    eval_result["evaluated_at"] = eval_time

    # Persist evaluation snapshot in prediction history
    try:
        await db.predictions.insert_one({
            "user_id": user_id,
            "placement_percentage": eval_result["placement_percentage"],
            "placed": eval_result["placed"],
            "readiness_status": eval_result["readiness_status"],
            "predicted_salary_tier": eval_result["predicted_salary_tier"],
            "raw_features": eval_result["raw_features"],
            "evaluated_at": datetime.now(timezone.utc),
        })
    except Exception:
        pass  # In-memory mock or collection write non-blocking

    return PredictionResponse(**eval_result)


@router.post("/simulate", response_model=SimulationResponse)
async def simulate_what_if_scenario(
    simulation: SimulationRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Interactive 'What-If' Placement Simulator:
    Simulates hypothetical improvements (e.g. clearing backlogs, raising coding score)
    and computes the real-time probability delta.
    """
    db = get_database()
    user_id = str(current_user.get("id") or current_user.get("_id"))
    student = await db.students.find_one({"user_id": user_id})
    if not student:
        # Fallback to default student template if profile not yet completed
        student = {
            "cgpa": 7.0,
            "backlogs": 0,
            "assessments": {
                "coding_score": 70.0,
                "aptitude_score": 75.0,
                "communication_score": 80.0,
            },
            "internships": [],
            "projects": [],
        }

    predictor = get_predictor()

    # 1. Baseline prediction
    baseline_result = predictor.predict(student)
    baseline_result["evaluated_at"] = datetime.now(timezone.utc).isoformat()

    # 2. Construct simulated candidate profile
    simulated_student = dict(student)
    assessments = dict(student.get("assessments", {}))

    if simulation.cgpa is not None:
        simulated_student["cgpa"] = simulation.cgpa
    if simulation.backlogs is not None:
        simulated_student["backlogs"] = simulation.backlogs
    if simulation.coding_score is not None:
        assessments["coding_score"] = simulation.coding_score
    if simulation.aptitude_score is not None:
        assessments["aptitude_score"] = simulation.aptitude_score
    if simulation.communication_score is not None:
        assessments["communication_score"] = simulation.communication_score
    if simulation.internships_count is not None:
        simulated_student["internships"] = [{"title": f"Internship {i+1}"} for i in range(simulation.internships_count)]
    if simulation.projects_count is not None:
        simulated_student["projects"] = [{"title": f"Project {i+1}"} for i in range(simulation.projects_count)]

    simulated_student["assessments"] = assessments

    # 3. Run simulated prediction
    simulated_result = predictor.predict(simulated_student)
    simulated_result["evaluated_at"] = datetime.now(timezone.utc).isoformat()

    # 4. Compute differences & insights
    base_pct = baseline_result["placement_percentage"]
    sim_pct = simulated_result["placement_percentage"]
    net_gain = round(sim_pct - base_pct, 1)

    key_improvements = []
    if simulation.backlogs is not None and simulation.backlogs < student.get("backlogs", 0):
        key_improvements.append(f"Clearing backlogs from {student.get('backlogs', 0)} to {simulation.backlogs} removes major recruiter disqualifier.")
    if simulation.coding_score is not None and simulation.coding_score > student.get("assessments", {}).get("coding_score", 0):
        key_improvements.append(f"Boosting coding score to {simulation.coding_score:.0f} raises clearance odds in preliminary technical rounds.")
    if simulation.internships_count is not None and simulation.internships_count > len(student.get("internships", [])):
        key_improvements.append(f"Adding internship experience unlocks higher tier salary bands.")
    if net_gain > 0:
        key_improvements.append(f"Overall placement likelihood improves by +{net_gain}% ({base_pct}% → {sim_pct}%).")
    elif net_gain < 0:
        key_improvements.append(f"Proposed changes result in a {net_gain}% reduction in placement likelihood.")
    else:
        key_improvements.append("No net change in placement likelihood under current simulated parameters.")

    return SimulationResponse(
        baseline_percentage=base_pct,
        simulated_percentage=sim_pct,
        net_gain_percent=net_gain,
        baseline_salary_tier=baseline_result["predicted_salary_tier"],
        simulated_salary_tier=simulated_result["predicted_salary_tier"],
        baseline=PredictionResponse(**baseline_result),
        simulated=PredictionResponse(**simulated_result),
        key_improvements=key_improvements,
    )


@router.get("/model-info", response_model=ModelInfoResponse)
async def get_model_information():
    """
    Public endpoint: Returns transparent ML model performance metrics,
    multi-model comparison benchmark table, and top influential features.
    """
    predictor = get_predictor()
    meta = predictor.get_model_metadata()
    if not meta:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Model metadata is currently unavailable.",
        )

    return ModelInfoResponse(**meta)
