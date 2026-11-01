export interface FactorDetail {
  factor: string;
  impact: string;
  explanation: string;
  positive: boolean;
}

export interface PredictionResponse {
  placed: boolean;
  placement_probability: number;
  placement_percentage: number;
  readiness_status: string;
  badge_color: string;
  predicted_salary_tier: string;
  model_used: string;
  model_accuracy: number;
  model_f1_score: number;
  model_roc_auc: number;
  top_positive_factors: FactorDetail[];
  top_risk_factors: FactorDetail[];
  recommendations: string[];
  raw_features: Record<string, any>;
  evaluated_at?: string;
}

export interface SimulationRequest {
  cgpa?: number;
  backlogs?: number;
  coding_score?: number;
  aptitude_score?: number;
  communication_score?: number;
  internships_count?: number;
  projects_count?: number;
}

export interface SimulationResponse {
  baseline_percentage: number;
  simulated_percentage: number;
  net_gain_percent: number;
  baseline_salary_tier: string;
  simulated_salary_tier: string;
  baseline: PredictionResponse;
  simulated: PredictionResponse;
  key_improvements: string[];
}

export interface ModelInfoResponse {
  best_model_name: string;
  trained_at: string;
  dataset_samples: number;
  test_samples: number;
  decision_threshold: number;
  metrics: {
    accuracy: number;
    precision: number;
    recall: number;
    f1_score: number;
    roc_auc: number;
    confusion_matrix: number[][];
  };
  model_comparison: Record<
    string,
    {
      accuracy: number;
      precision: number;
      recall: number;
      f1_score: number;
      roc_auc: number;
      confusion_matrix: number[][];
    }
  >;
  feature_importances: Record<string, number>;
  salary_tiers: string[];
}
