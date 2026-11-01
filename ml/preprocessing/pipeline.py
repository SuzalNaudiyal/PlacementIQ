"""
Feature Engineering and Preprocessing Pipeline for Placement Readiness ML Engine.
Provides consistent transformation across training and single-instance real-time inference.
"""

import numpy as np
import pandas as pd
from typing import Dict, Any, List, Union
from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
import joblib

NUMERIC_RAW_FEATURES = [
    'cgpa',
    'backlogs',
    'internships_count',
    'projects_count',
    'coding_score',
    'aptitude_score',
    'communication_score',
    'certifications_count',
    'core_skills_count',
    'hackathons_count',
]

CATEGORICAL_RAW_FEATURES = [
    'degree_tier',
]

ENGINEERED_FEATURE_NAMES = [
    'readiness_index',
    'academic_risk_ratio',
    'practical_experience_score',
    'skill_to_project_ratio',
    'coding_cgpa_synergy',
]

ALL_NUMERIC_FEATURES = NUMERIC_RAW_FEATURES + ENGINEERED_FEATURE_NAMES


class FeatureEngineer(BaseEstimator, TransformerMixin):
    """
    Custom scikit-learn transformer to compute domain-informed placement readiness metrics.
    """
    def __init__(self):
        pass

    def fit(self, X: pd.DataFrame, y=None):
        return self

    def transform(self, X: pd.DataFrame) -> pd.DataFrame:
        df = X.copy()

        # Fill missing values if any
        for col in NUMERIC_RAW_FEATURES:
            if col not in df.columns:
                df[col] = 0.0
            else:
                df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0.0)

        if 'degree_tier' not in df.columns:
            df['degree_tier'] = 'Tier 1 (CS/IT)'
        else:
            df['degree_tier'] = df['degree_tier'].fillna('Tier 1 (CS/IT)')

        # 1. Readiness Index (0 - 100 weighted scale)
        df['readiness_index'] = (
            0.35 * df['coding_score']
            + 0.25 * df['aptitude_score']
            + 0.20 * df['communication_score']
            + 0.20 * (df['cgpa'] * 10.0)
        )

        # 2. Academic Risk Ratio
        df['academic_risk_ratio'] = df['backlogs'] / (df['cgpa'] + 0.1)

        # 3. Practical Experience Score
        df['practical_experience_score'] = (
            df['internships_count'] * 2.5
            + df['projects_count'] * 1.5
            + df['certifications_count'] * 1.0
            + df['hackathons_count'] * 1.2
        )

        # 4. Skill-to-Project Ratio
        df['skill_to_project_ratio'] = df['core_skills_count'] / (df['projects_count'] + 1.0)

        # 5. Coding & CGPA Synergy
        df['coding_cgpa_synergy'] = (df['coding_score'] / 100.0) * (df['cgpa'] / 10.0)

        return df


def build_preprocessor_pipeline() -> Pipeline:
    """
    Constructs a complete preprocessing pipeline that engineers features,
    standardizes numeric features, and one-hot encodes degree tiers.
    """
    column_transformer = ColumnTransformer(
        transformers=[
            ('num', StandardScaler(), ALL_NUMERIC_FEATURES),
            ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), CATEGORICAL_RAW_FEATURES),
        ],
        remainder='drop',
    )

    pipeline = Pipeline([
        ('fe', FeatureEngineer()),
        ('col_trans', column_transformer),
    ])

    return pipeline


def raw_dict_to_dataframe(student_dict: Dict[str, Any]) -> pd.DataFrame:
    """
    Helper to convert student profile or frontend JSON dictionary to standard single-row DataFrame.
    """
    row = {
        'cgpa': float(student_dict.get('cgpa', 7.0)),
        'backlogs': int(student_dict.get('backlogs', 0)),
        'internships_count': len(student_dict.get('internships', [])) if isinstance(student_dict.get('internships'), list) else int(student_dict.get('internships_count', 0)),
        'projects_count': len(student_dict.get('projects', [])) if isinstance(student_dict.get('projects'), list) else int(student_dict.get('projects_count', 0)),
        'coding_score': float(student_dict.get('coding_score', student_dict.get('assessments', {}).get('coding_score', 70.0))),
        'aptitude_score': float(student_dict.get('aptitude_score', student_dict.get('assessments', {}).get('aptitude_score', 75.0))),
        'communication_score': float(student_dict.get('communication_score', student_dict.get('assessments', {}).get('communication_score', 80.0))),
        'certifications_count': len(student_dict.get('certifications', [])) if isinstance(student_dict.get('certifications'), list) else int(student_dict.get('certifications_count', 0)),
        'hackathons_count': int(student_dict.get('hackathons_count', 0)),
    }

    # Extract core skills count from structured skills group or list
    skills = student_dict.get('skills', {})
    if isinstance(skills, dict):
        total_skills = sum(len(v) for v in skills.values() if isinstance(v, list))
    elif isinstance(skills, list):
        total_skills = len(skills)
    else:
        total_skills = int(student_dict.get('core_skills_count', 5))
    row['core_skills_count'] = total_skills

    # Degree tier
    education = student_dict.get('education', {})
    branch = education.get('branch', '').lower() if isinstance(education, dict) else str(student_dict.get('branch', '')).lower()
    if any(k in branch for k in ['computer', 'cs', 'it', 'software', 'data', 'ai', 'information']):
        row['degree_tier'] = 'Tier 1 (CS/IT)'
    elif any(k in branch for k in ['circuit', 'electronics', 'electrical', 'ece', 'eee', 'telecom']):
        row['degree_tier'] = 'Tier 2 (Circuit)'
    else:
        row['degree_tier'] = 'Tier 3 (Core)'

    return pd.DataFrame([row])
