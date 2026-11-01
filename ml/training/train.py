"""
Placement ML Training Pipeline.
Trains, evaluates, and compares Logistic Regression, Random Forest, and Gradient Boosting models
with Stratified 80/20 Split, comprehensive metrics (F1, ROC-AUC, Precision, Recall),
and serializes production-ready artifacts into ml/models/.
"""

import os
import json
from datetime import datetime, timezone
import numpy as np
import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix,
    classification_report,
)

from ml.preprocessing.pipeline import (
    build_preprocessor_pipeline,
    NUMERIC_RAW_FEATURES,
    CATEGORICAL_RAW_FEATURES,
    ALL_NUMERIC_FEATURES,
)


def get_feature_names(preprocessor) -> list:
    """Extract transformed feature column names from fitted ColumnTransformer."""
    col_trans = preprocessor.named_steps['col_trans']
    num_cols = ALL_NUMERIC_FEATURES
    cat_cols = list(col_trans.named_transformers_['cat'].get_feature_names_out(CATEGORICAL_RAW_FEATURES))
    return num_cols + cat_cols


def train_models():
    base_dir = os.path.dirname(os.path.dirname(__file__))
    data_path = os.path.join(base_dir, 'data', 'placement_dataset.csv')
    models_dir = os.path.join(base_dir, 'models')
    os.makedirs(models_dir, exist_ok=True)

    print(f"Loading placement dataset from: {data_path}")
    df = pd.read_csv(data_path)

    feature_cols = NUMERIC_RAW_FEATURES + CATEGORICAL_RAW_FEATURES
    X = df[feature_cols]
    y = df['placed']
    y_salary = df['salary_tier']

    # 80/20 Stratified Split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

    print(f"Dataset split: Train={len(X_train)} samples, Test={len(X_test)} samples")
    print(f"Class distribution: Placed={y.mean()*100:.1f}%, At-Risk={(1-y.mean())*100:.1f}%")

    # Fit preprocessor on training data only to avoid data leakage
    preprocessor = build_preprocessor_pipeline()
    X_train_trans = preprocessor.fit_transform(X_train)
    X_test_trans = preprocessor.transform(X_test)

    feature_names = get_feature_names(preprocessor)
    print(f"Total engineered and encoded features: {len(feature_names)}")

    # Define candidate models
    candidates = {
        'Logistic Regression (Baseline)': LogisticRegression(
            C=1.0, max_iter=1000, random_state=42
        ),
        'Random Forest Classifier': RandomForestClassifier(
            n_estimators=150, max_depth=8, min_samples_split=4, random_state=42
        ),
        'Gradient Boosting Classifier': GradientBoostingClassifier(
            n_estimators=120, max_depth=4, learning_rate=0.08, random_state=42
        ),
    }

    # Optionally attempt XGBoost if available
    try:
        from xgboost import XGBClassifier
        candidates['XGBoost Classifier'] = XGBClassifier(
            n_estimators=120, max_depth=4, learning_rate=0.08, eval_metric='logloss', random_state=42
        )
    except Exception:
        pass

    results = {}
    fitted_models = {}

    print("\n" + "=" * 65)
    print("MODEL PERFORMANCE COMPARISON (TEST SPLIT)")
    print("=" * 65)

    best_score = -1.0
    best_model_name = None

    for name, model in candidates.items():
        model.fit(X_train_trans, y_train)
        fitted_models[name] = model

        y_pred = model.predict(X_test_trans)
        y_prob = model.predict_proba(X_test_trans)[:, 1]

        acc = accuracy_score(y_test, y_pred)
        prec = precision_score(y_test, y_pred, zero_division=0)
        rec = recall_score(y_test, y_pred, zero_division=0)
        f1 = f1_score(y_test, y_pred, zero_division=0)
        roc_auc = roc_auc_score(y_test, y_prob)

        cm = confusion_matrix(y_test, y_pred).tolist()

        results[name] = {
            'accuracy': round(float(acc), 4),
            'precision': round(float(prec), 4),
            'recall': round(float(rec), 4),
            'f1_score': round(float(f1), 4),
            'roc_auc': round(float(roc_auc), 4),
            'confusion_matrix': cm,
        }

        print(f"\n--- {name} ---")
        print(f"  Accuracy : {acc*100:.2f}%")
        print(f"  Precision: {prec*100:.2f}%")
        print(f"  Recall   : {rec*100:.2f}%")
        print(f"  F1-Score : {f1*100:.2f}%")
        print(f"  ROC-AUC  : {roc_auc:.4f}")

        # Selection criterion: weighted blend of ROC-AUC and F1
        composite_score = 0.5 * f1 + 0.5 * roc_auc
        if composite_score > best_score:
            best_score = composite_score
            best_model_name = name

    print("\n" + "=" * 65)
    print(f"SELECTED PRODUCTION MODEL: {best_model_name} (Composite Score: {best_score:.4f})")
    print("=" * 65)

    best_model = fitted_models[best_model_name]

    # Feature Importance analysis
    feature_importances = {}
    if hasattr(best_model, 'feature_importances_'):
        importances = best_model.feature_importances_
        sorted_indices = np.argsort(importances)[::-1]
        for idx in sorted_indices:
            feature_importances[feature_names[idx]] = round(float(importances[idx]), 4)
    elif hasattr(best_model, 'coef_'):
        coefs = np.abs(best_model.coef_[0])
        sorted_indices = np.argsort(coefs)[::-1]
        for idx in sorted_indices:
            feature_importances[feature_names[idx]] = round(float(coefs[idx]), 4)

    # Train Salary Tier Multi-Class Model on placed candidates
    print("\nTraining Package / Salary Tier Multi-Class Classifier...")
    salary_model = RandomForestClassifier(
        n_estimators=100, max_depth=6, min_samples_split=4, random_state=42
    )
    # Train on full dataset transformed
    X_all_trans = preprocessor.transform(X)
    salary_model.fit(X_all_trans, y_salary)

    # Save artifacts
    preprocessor_file = os.path.join(models_dir, 'preprocessor.joblib')
    placement_model_file = os.path.join(models_dir, 'placement_model.joblib')
    salary_model_file = os.path.join(models_dir, 'salary_model.joblib')
    metadata_file = os.path.join(models_dir, 'model_metadata.json')

    joblib.dump(preprocessor, preprocessor_file)
    joblib.dump(best_model, placement_model_file)
    joblib.dump(salary_model, salary_model_file)

    metadata = {
        'best_model_name': best_model_name,
        'trained_at': datetime.now(timezone.utc).isoformat(),
        'dataset_samples': len(df),
        'test_samples': len(X_test),
        'metrics': results[best_model_name],
        'model_comparison': results,
        'feature_names': feature_names,
        'feature_importances': feature_importances,
        'decision_threshold': 0.50,
        'salary_tiers': sorted(list(df['salary_tier'].unique())),
    }

    with open(metadata_file, 'w') as f:
        json.dump(metadata, f, indent=2)

    print(f"\nSaved preprocessor to: {preprocessor_file}")
    print(f"Saved placement model to: {placement_model_file}")
    print(f"Saved salary model to: {salary_model_file}")
    print(f"Saved metadata to: {metadata_file}")

    print("\nTop 5 Most Influential Features:")
    for f_name, imp in list(feature_importances.items())[:5]:
        print(f"  • {f_name}: {imp*100:.1f}% importance")


if __name__ == '__main__':
    train_models()
