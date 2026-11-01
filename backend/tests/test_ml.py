"""
Automated unit tests for ML pipeline, artifacts, and explainable inference.
"""

import os
import json
import pytest
import pandas as pd
from ml.inference.predictor import get_predictor
from ml.preprocessing.pipeline import (
    FeatureEngineer,
    raw_dict_to_dataframe,
    NUMERIC_RAW_FEATURES,
    CATEGORICAL_RAW_FEATURES,
)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
DATASET_PATH = os.path.join(BASE_DIR, 'ml', 'data', 'placement_dataset.csv')
MODELS_DIR = os.path.join(BASE_DIR, 'ml', 'models')


def test_dataset_exists_and_valid():
    """Verify that dataset is generated with at least 4000 rows and required columns."""
    assert os.path.exists(DATASET_PATH), f"Dataset missing at: {DATASET_PATH}"
    df = pd.read_csv(DATASET_PATH)
    assert len(df) >= 4000, f"Expected at least 4000 rows, found {len(df)}"
    for col in ['cgpa', 'backlogs', 'coding_score', 'aptitude_score', 'placed', 'salary_tier']:
        assert col in df.columns, f"Required column {col} missing in dataset"
    assert df['placed'].isin([0, 1]).all(), "Target 'placed' must be binary {0, 1}"


def test_models_and_metadata_exist():
    """Verify that trained model artifacts and metadata exist."""
    for filename in ['preprocessor.joblib', 'placement_model.joblib', 'salary_model.joblib', 'model_metadata.json']:
        filepath = os.path.join(MODELS_DIR, filename)
        assert os.path.exists(filepath), f"Expected artifact {filename} missing in {MODELS_DIR}"

    with open(os.path.join(MODELS_DIR, 'model_metadata.json')) as f:
        meta = json.load(f)
    assert 'best_model_name' in meta
    assert 'metrics' in meta
    assert 'model_comparison' in meta
    assert len(meta['model_comparison']) >= 3, "Comparison must include at least 3 models"


def test_model_metadata_metrics():
    """Verify that model achieves honest academic performance targets (>90% accuracy, >0.95 ROC-AUC)."""
    with open(os.path.join(MODELS_DIR, 'model_metadata.json')) as f:
        meta = json.load(f)

    metrics = meta['metrics']
    assert metrics['accuracy'] >= 0.90, f"Model accuracy {metrics['accuracy']} is below 0.90"
    assert metrics['f1_score'] >= 0.90, f"Model F1 score {metrics['f1_score']} is below 0.90"
    assert metrics['roc_auc'] >= 0.95, f"Model ROC-AUC {metrics['roc_auc']} is below 0.95"


def test_feature_engineer_transformation():
    """Verify FeatureEngineer computes domain readiness metrics accurately."""
    fe = FeatureEngineer()
    df_raw = pd.DataFrame([{
        'cgpa': 8.0,
        'backlogs': 0,
        'coding_score': 80.0,
        'aptitude_score': 80.0,
        'communication_score': 80.0,
        'internships_count': 2,
        'projects_count': 2,
        'certifications_count': 1,
        'core_skills_count': 6,
        'hackathons_count': 1,
        'degree_tier': 'Tier 1 (CS/IT)',
    }])
    transformed = fe.transform(df_raw)

    assert 'readiness_index' in transformed.columns
    assert 'academic_risk_ratio' in transformed.columns
    assert 'practical_experience_score' in transformed.columns

    # 0.35*80 + 0.25*80 + 0.20*80 + 0.20*80 = 80.0
    assert transformed['readiness_index'].iloc[0] == pytest.approx(80.0, 0.1)
    assert transformed['academic_risk_ratio'].iloc[0] == pytest.approx(0.0, 0.01)


def test_predictor_high_readiness():
    """Verify predictor generates high probability and positive factors for strong candidate."""
    predictor = get_predictor()
    strong_student = {
        'cgpa': 8.5,
        'backlogs': 0,
        'coding_score': 88.0,
        'aptitude_score': 85.0,
        'communication_score': 85.0,
        'internships': [{'company': 'Alpha Tech', 'role': 'SDE Intern'}],
        'projects': [{'title': 'Cloud App'}, {'title': 'ML Model'}],
        'skills': {'programming': ['Python', 'Go', 'SQL']},
        'education': {'branch': 'Computer Science'},
    }

    result = predictor.predict(strong_student)
    assert result['placed'] is True
    assert result['placement_percentage'] >= 85.0
    assert 'High Likelihood' in result['readiness_status']
    assert len(result['top_positive_factors']) >= 2
    assert any('Backlog' in f['factor'] for f in result['top_positive_factors'])


def test_predictor_at_risk_candidate():
    """Verify predictor flags candidates with active backlogs and low scores as high risk."""
    predictor = get_predictor()
    risk_student = {
        'cgpa': 5.5,
        'backlogs': 3,
        'coding_score': 30.0,
        'aptitude_score': 40.0,
        'communication_score': 50.0,
        'internships': [],
        'projects': [],
        'skills': {'programming': []},
        'education': {'branch': 'Civil Engineering'},
    }

    result = predictor.predict(risk_student)
    assert result['placed'] is False
    assert result['placement_percentage'] < 40.0
    assert 'Needs Skill Intervention' in result['readiness_status']
    assert len(result['top_risk_factors']) >= 2
    assert len(result['recommendations']) >= 2
